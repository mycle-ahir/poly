import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";

export async function POST(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { matchId, winningSelection } = body;

    if (!matchId || !winningSelection) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch the match
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // 2. Fetch all pending trades for this match
    const pendingTrades = await prisma.trade.findMany({
      where: {
        matchId: matchId,
        outcome: "PENDING",
      },
      include: { account: true },
    });

    // 3. Process each trade in a transaction
    const transactionOperations = [];

    for (const trade of pendingTrades) {
      const isVoid = winningSelection === "VOID";
      const isWon = !isVoid && trade.selection === winningSelection;
      
      const newOutcome = isVoid ? "VOID" : (isWon ? "WON" : "LOST");
      const tradePnl = isVoid ? 0 : (isWon ? trade.potentialPayout - trade.stake : -trade.stake);

      let accountUpdate: any = {};
      if (newOutcome === "WON") {
        accountUpdate = {
          currentBalance: { increment: trade.potentialPayout },
          totalWins: { increment: 1 },
          totalPnl: { increment: tradePnl },
        };
      } else if (newOutcome === "LOST") {
        accountUpdate = {
          totalLosses: { increment: 1 },
          totalPnl: { decrement: trade.stake },
        };
      } else if (newOutcome === "VOID") {
        accountUpdate = {
          currentBalance: { increment: trade.stake }, // Refund
          totalTrades: { decrement: 1 }, // Revert trade count
        };
      }

      transactionOperations.push(
        prisma.trade.update({
          where: { id: trade.id },
          data: {
            outcome: newOutcome,
            pnl: tradePnl,
            settledAt: new Date(),
          },
        })
      );

      transactionOperations.push(
        prisma.account.update({
          where: { id: trade.accountId },
          data: accountUpdate,
        })
      );
    }

    // Mark match as inactive (resolved)
    transactionOperations.push(
      prisma.match.update({
        where: { id: matchId },
        data: { isActive: false, isLive: false },
      })
    );

    // Execute transaction
    await prisma.$transaction(transactionOperations);

    return NextResponse.json({ 
      message: `Match resolved successfully. Processed ${pendingTrades.length} trades.`,
      processedCount: pendingTrades.length
    });

  } catch (error) {
    console.error("[ADMIN_MATCH_RESOLVE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
