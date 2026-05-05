import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";

export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search");

  const where: any = {};
  if (status && status !== "all") where.accounts = { some: { status } };
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { fullName: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        accounts: {
          select: {
            id: true,
            type: true,
            status: true,
            capitalSize: true,
            currentBalance: true,
            totalTrades: true,
            totalWins: true,
            totalLosses: true,
            dailyDrawdownPct: true,
            lifetimeDrawdownPct: true,
            isABook: true,
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { orders: true, deposits: true, withdrawals: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      role: u.role,
      lastLoginAt: u.lastLoginAt,
      lastActiveAt: u.lastActiveAt,
      createdAt: u.createdAt,
      accounts: u.accounts,
      stats: u._count,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
