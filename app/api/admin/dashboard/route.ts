import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";

export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      totalUsers,
      activeUsers,
      totalCapitalResult,
      pendingDeposits,
      totalTrades,
      tradesWinLoss,
      recentDeposits,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.account.count({ where: { status: { in: ["ACTIVE", "TEST_ACTIVE"] } } }),
      prisma.account.aggregate({
        _sum: { capitalSize: true },
        where: { status: { in: ["ACTIVE", "TEST_ACTIVE"] } }
      }),
      prisma.deposit.count({ where: { status: "PENDING" } }),
      prisma.trade.count(),
      prisma.account.aggregate({
        _sum: { totalWins: true, totalLosses: true }
      }),
      prisma.deposit.findMany({
        where: { status: "PENDING" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { fullName: true } } }
      })
    ]);

    const totalCapital = totalCapitalResult._sum.capitalSize || 0;
    
    const wins = tradesWinLoss._sum.totalWins || 0;
    const losses = tradesWinLoss._sum.totalLosses || 0;
    const totalFinished = wins + losses;
    const winRate = totalFinished > 0 ? ((wins / totalFinished) * 100).toFixed(1) : "0.0";

    // 1. Weekly Activity: Trades per day for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyTrades = await prisma.trade.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo }
      },
      select: { createdAt: true }
    });

    // Format weekly activity for chart
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const activityMap: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      activityMap[d.toDateString()] = 0;
    }

    weeklyTrades.forEach(t => {
      const dateStr = t.createdAt.toDateString();
      if (activityMap[dateStr] !== undefined) {
        activityMap[dateStr] += 1;
      }
    });

    const weeklyActivity = Object.keys(activityMap).map(dateStr => {
      const d = new Date(dateStr);
      return {
        name: days[d.getDay()],
        trades: activityMap[dateStr],
        date: d.toLocaleDateString()
      };
    }).reverse();


    // 2. Capital Distribution: Count accounts per capital size
    const distribution = await prisma.account.groupBy({
      by: ['capitalSize'],
      where: { status: { in: ["ACTIVE", "TEST_ACTIVE"] } },
      _count: { id: true },
      orderBy: { capitalSize: 'asc' }
    });

    const capitalDistribution = distribution.map(d => ({
      name: `$${d.capitalSize.toLocaleString()}`,
      count: d._count.id
    }));

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalCapital,
      pendingDeposits,
      totalTrades,
      winRate,
      weeklyActivity,
      capitalDistribution,
      recentPendingActions: recentDeposits.map(d => ({
        id: d.id,
        name: d.user?.fullName || "Unknown User",
        desc: `Deposit: ${d.cryptocurrency} (${d.blockchain})`,
        type: "DEPOSIT",
        createdAt: d.createdAt
      }))
    });

  } catch (error) {
    console.error("[ADMIN_DASHBOARD_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
