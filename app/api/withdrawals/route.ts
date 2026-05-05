import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";
import { requestWithdrawalSchema } from "@/lib/validations";
import { validateWithdrawalEligibility } from "@/lib/rules-engine";
import { checkRateLimit } from "@/lib/rate-limit";

// ─── GET: List user's withdrawals ───────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const withdrawals = await prisma.withdrawal.findMany({
    where: { userId: user.userId },
    include: { account: { select: { type: true, capitalSize: true, currentBalance: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ withdrawals });
}

// ─── POST: Request withdrawal ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req, "api");
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = requestWithdrawalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { accountId, cryptocurrency, blockchain, walletAddress, amount } = parsed.data;

    // Validate account ownership
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
    if (account.userId !== user.userId) {
      return NextResponse.json({ error: "Account does not belong to you" }, { status: 403 });
    }

    // Check withdrawal amount doesn't exceed profit (can only withdraw profit, not capital)
    const profit = account.currentBalance - account.capitalSize;
    if (amount > profit) {
      return NextResponse.json(
        { error: `Withdrawal amount exceeds available profit. Max: $${profit.toFixed(2)}` },
        { status: 400 }
      );
    }

    // Check pending withdrawals
    const pendingWithdrawal = await prisma.withdrawal.findFirst({
      where: { accountId, status: "PENDING" },
    });
    if (pendingWithdrawal) {
      return NextResponse.json(
        { error: "You already have a pending withdrawal for this account" },
        { status: 409 }
      );
    }

    // Validate eligibility rules
    const eligibility = await validateWithdrawalEligibility(account);

    if (!eligibility.eligible) {
      // Auto-reject with reasons
      const failedChecks = eligibility.checks
        .filter((c) => !c.passed)
        .map((c) => `${c.rule}: ${c.detail}`);

      const withdrawal = await prisma.withdrawal.create({
        data: {
          userId: user.userId,
          accountId,
          cryptocurrency,
          blockchain,
          walletAddress,
          amount,
          status: "AUTO_REJECTED",
          profitPctAtRequest: ((account.currentBalance - account.capitalSize) / account.capitalSize) * 100,
          dailyDDAtRequest: account.dailyDrawdownPct,
          lifetimeDDAtRequest: account.lifetimeDrawdownPct,
          rejectionReason: failedChecks.join("; "),
        },
      });

      return NextResponse.json(
        {
          message: "Withdrawal auto-rejected due to failed eligibility checks",
          withdrawal: { id: withdrawal.id, status: withdrawal.status },
          eligibility: eligibility.checks,
        },
        { status: 200 }
      );
    }

    // Create pending withdrawal
    const profitPct = ((account.currentBalance - account.capitalSize) / account.capitalSize) * 100;

    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: user.userId,
        accountId,
        cryptocurrency,
        blockchain,
        walletAddress,
        amount,
        status: "PENDING",
        profitPctAtRequest: profitPct,
        dailyDDAtRequest: account.dailyDrawdownPct,
        lifetimeDDAtRequest: account.lifetimeDrawdownPct,
      },
    });

    return NextResponse.json(
      {
        message: "Withdrawal request submitted. Awaiting admin approval.",
        withdrawal: {
          id: withdrawal.id,
          amount: withdrawal.amount,
          status: withdrawal.status,
          createdAt: withdrawal.createdAt,
        },
        eligibility: eligibility.checks,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[WITHDRAWAL_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
