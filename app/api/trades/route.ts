import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";
import { placeTradeSchema } from "@/lib/validations";
import { validateTrade, checkTestAccountStatus } from "@/lib/rules-engine";
import { checkRateLimit } from "@/lib/rate-limit";

// ─── GET: List user's trades ────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId");

  if (!accountId) {
    return NextResponse.json({ error: "accountId query param is required" }, { status: 400 });
  }

  // Verify account ownership
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account || account.userId !== user.userId) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const trades = await prisma.trade.findMany({
    where: { accountId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ trades });
}

// ─── POST: Place a trade ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req, "trade");
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = placeTradeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { accountId, matchId, matchTitle, matchStartTime, selection, odds, stake } = parsed.data;

    // Verify account ownership
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account || account.userId !== user.userId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Validate trade against all platform rules
    const validation = await validateTrade({
      accountId,
      matchId,
      matchStartTime: new Date(matchStartTime),
      odds,
      stake,
      selection,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { error: "Trade rejected", reasons: validation.errors },
        { status: 400 }
      );
    }

    const potentialPayout = stake * odds;
    const newBalance = account.currentBalance - stake;

    // --- Drawdown Calculation ---
    // Lifetime Drawdown
    let newLifetimeDD = account.lifetimeDrawdownPct;
    if (account.capitalSize > 0) {
      const lifetimeDD = ((account.capitalSize - newBalance) / account.capitalSize) * 100;
      newLifetimeDD = Math.max(account.lifetimeDrawdownPct, lifetimeDD);
    }

    // Daily Drawdown
    const now = new Date();
    const todayMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    
    let snapshot = await prisma.drawdownSnapshot.findUnique({
      where: { accountId_date: { accountId: account.id, date: todayMidnight } }
    });

    let startBalance = account.currentBalance; // Fallback
    if (!snapshot) {
      // Create today's snapshot since it doesn't exist
      snapshot = await prisma.drawdownSnapshot.create({
        data: {
          accountId: account.id,
          date: todayMidnight,
          startBalance: account.currentBalance,
          lowestBalance: account.currentBalance,
          drawdownPct: account.dailyDrawdownPct,
        }
      });
      startBalance = account.currentBalance;
    } else {
      startBalance = snapshot.startBalance;
    }

    let newDailyDD = account.dailyDrawdownPct;
    if (startBalance > 0) {
      const dailyDD = ((startBalance - newBalance) / startBalance) * 100;
      newDailyDD = Math.max(account.dailyDrawdownPct, dailyDD);
    }

    // Check breach conditions (20% daily, 30% lifetime)
    let newStatus = account.status;
    let breachReason = "";
    if (newDailyDD > 20) {
      newStatus = account.type === "ONE_STEP_TEST" ? "TEST_FAILED" : "RESTRICTED";
      breachReason = "Daily drawdown limit (20%) breached.";
    } else if (newLifetimeDD > 30) {
      newStatus = account.type === "ONE_STEP_TEST" ? "TEST_FAILED" : "RESTRICTED";
      breachReason = "Lifetime drawdown limit (30%) breached.";
    }

    // Execute trade in a transaction
    const [trade, updatedAccount] = await prisma.$transaction([
      prisma.trade.create({
        data: {
          accountId,
          matchId,
          matchTitle,
          matchStartTime: new Date(matchStartTime),
          market: "MATCH_WINNER",
          selection,
          odds,
          stake,
          potentialPayout,
          outcome: "PENDING",
        },
      }),
      prisma.account.update({
        where: { id: accountId },
        data: {
          currentBalance: newBalance,
          totalTrades: { increment: 1 },
          lastTradeAt: new Date(),
          dailyDrawdownPct: newDailyDD,
          lifetimeDrawdownPct: newLifetimeDD,
          status: newStatus,
          ...(account.type === "ONE_STEP_TEST" && account.status === "TEST_ACTIVE"
            ? { testTradesCount: { increment: 1 } }
            : {}),
        },
      }),
      // Update snapshot lowest balance
      ...(snapshot ? [
        prisma.drawdownSnapshot.update({
          where: { id: snapshot.id },
          data: {
            lowestBalance: Math.min(snapshot.lowestBalance, newBalance),
            drawdownPct: newDailyDD
          }
        })
      ] : [])
    ]);

    // Update user last active
    await prisma.user.update({
      where: { id: user.userId },
      data: { lastActiveAt: new Date() },
    });

    if (newStatus !== account.status) {
      return NextResponse.json(
        {
          message: "Trade placed, but account has been breached due to drawdown rules.",
          breached: true,
          breachReason,
          trade: {
            id: trade.id,
            stake: trade.stake,
            outcome: trade.outcome,
          },
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        message: "Trade placed successfully",
        trade: {
          id: trade.id,
          matchTitle: trade.matchTitle,
          selection: trade.selection,
          odds: trade.odds,
          stake: trade.stake,
          potentialPayout: trade.potentialPayout,
          outcome: trade.outcome,
          createdAt: trade.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    // Handle unique constraint violation (duplicate bet)
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "You already have a bet on this match" },
        { status: 409 }
      );
    }
    console.error("[TRADE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
