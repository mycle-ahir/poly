import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";

// ─── GET: List all trades for admin ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const trades = await prisma.trade.findMany({
      include: {
        account: {
          include: {
            user: { select: { email: true, fullName: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ trades });
  } catch (error) {
    console.error("[ADMIN_TRADES_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PUT: Resolve a trade (WON, LOST, VOID) ─────────────────────────────────
export async function PUT(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { tradeId, action } = body;

    if (!tradeId || !["WON", "LOST", "VOID"].includes(action)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { account: true },
    });

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    if (trade.outcome !== "PENDING") {
      return NextResponse.json({ error: `Trade already resolved as ${trade.outcome}` }, { status: 400 });
    }

    const { stake, potentialPayout, accountId } = trade;
    let accountUpdate: any = {};
    let tradePnl = 0;

    if (action === "WON") {
      tradePnl = potentialPayout - stake;
      accountUpdate = {
        currentBalance: { increment: potentialPayout },
        totalWins: { increment: 1 },
        totalPnl: { increment: tradePnl },
      };
    } else if (action === "LOST") {
      tradePnl = -stake;
      accountUpdate = {
        totalLosses: { increment: 1 },
        totalPnl: { decrement: stake },
      };
    } else if (action === "VOID") {
      tradePnl = 0;
      accountUpdate = {
        currentBalance: { increment: stake },
        totalTrades: { decrement: 1 }, // Revert the trade count
      };
    }

    // Execute in transaction
    const [updatedTrade] = await prisma.$transaction([
      prisma.trade.update({
        where: { id: tradeId },
        data: {
          outcome: action,
          pnl: tradePnl,
          settledAt: new Date(),
        },
      }),
      prisma.account.update({
        where: { id: accountId },
        data: accountUpdate,
      }),
    ]);

    return NextResponse.json({ message: `Trade marked as ${action}`, trade: updatedTrade });
  } catch (error) {
    console.error("[ADMIN_TRADE_RESOLVE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
