import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";

export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Load the user's active account
  const account = await prisma.account.findFirst({
    where: {
      userId: user.userId,
      status: { in: ["ACTIVE", "TEST_ACTIVE"] },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!account) {
    return NextResponse.json({
      dashboard: {
        hasAccount: false,
        message: "No active trading account. Purchase one to get started.",
      },
    });
  }

  // Get recent trades
  const recentTrades = await prisma.trade.findMany({
    where: { accountId: account.id },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  // Weekly trade count
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const weeklyTradeCount = await prisma.trade.count({
    where: { accountId: account.id, createdAt: { gte: startOfWeek } },
  });

  // Calculate win rate
  const winRate = account.totalTrades > 0
    ? ((account.totalWins / account.totalTrades) * 100).toFixed(1)
    : "0";

  // Profit percentage
  const profitPct = account.capitalSize > 0
    ? (((account.currentBalance - account.capitalSize) / account.capitalSize) * 100).toFixed(1)
    : "0";

  return NextResponse.json({
    dashboard: {
      hasAccount: true,
      account: {
        id: account.id,
        type: account.type,
        status: account.status,
        capitalSize: account.capitalSize,
        currentBalance: account.currentBalance,
        totalPnl: account.totalPnl,
        profitPct,
        winRate,
        totalTrades: account.totalTrades,
        totalWins: account.totalWins,
        totalLosses: account.totalLosses,
        dailyDrawdownPct: account.dailyDrawdownPct,
        lifetimeDrawdownPct: account.lifetimeDrawdownPct,
        isABook: account.isABook,
        testStartDate: account.testStartDate,
        testEndDate: account.testEndDate,
        testTradesCount: account.testTradesCount,
      },
      recentTrades: recentTrades.map((t) => ({
        id: t.id,
        matchTitle: t.matchTitle,
        selection: t.selection,
        odds: t.odds,
        stake: t.stake,
        pnl: t.pnl,
        outcome: t.outcome,
        createdAt: t.createdAt,
      })),
      weeklyTradeCount,
    },
  });
}
