import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";
import { reviewWithdrawalSchema } from "@/lib/validations";

// ─── GET: List all withdrawals (admin) ──────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: any = {};
  if (status && status !== "all") where.status = status;

  const withdrawals = await prisma.withdrawal.findMany({
    where,
    include: {
      user: { select: { id: true, email: true, fullName: true } },
      account: { select: { type: true, capitalSize: true, currentBalance: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = await prisma.withdrawal.groupBy({
    by: ["status"],
    _count: true,
  });

  return NextResponse.json({
    withdrawals,
    summary: {
      pending: counts.find((c) => c.status === "PENDING")?._count || 0,
      approved: counts.find((c) => c.status === "APPROVED")?._count || 0,
      rejected: counts.find((c) => c.status === "REJECTED")?._count || 0,
      autoRejected: counts.find((c) => c.status === "AUTO_REJECTED")?._count || 0,
    },
  });
}

// ─── PUT: Approve or reject a withdrawal ────────────────────────────────────
export async function PUT(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { withdrawalId, ...rest } = body;
    const parsed = reviewWithdrawalSchema.safeParse(rest);

    if (!parsed.success || !withdrawalId) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const { action, rejectionReason } = parsed.data;

    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawalId },
      include: { account: true },
    });

    if (!withdrawal) return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    if (withdrawal.status !== "PENDING") {
      return NextResponse.json({ error: `Withdrawal already ${withdrawal.status.toLowerCase()}` }, { status: 400 });
    }

    if (action === "APPROVE") {
      // Approve: deduct from balance
      await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id: withdrawalId },
          data: { status: "APPROVED", reviewedBy: user.userId, reviewedAt: new Date() },
        }),
        prisma.account.update({
          where: { id: withdrawal.accountId },
          data: { currentBalance: { decrement: withdrawal.amount } },
        }),
      ]);

      return NextResponse.json({ message: "Withdrawal approved. Funds deducted from account." });
    } else {
      await prisma.withdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: "REJECTED",
          reviewedBy: user.userId,
          reviewedAt: new Date(),
          rejectionReason: rejectionReason || "Rejected by admin",
        },
      });

      return NextResponse.json({ message: "Withdrawal rejected." });
    }
  } catch (error) {
    console.error("[ADMIN_WITHDRAWAL_REVIEW_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
