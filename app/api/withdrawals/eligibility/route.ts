import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";
import { validateWithdrawalEligibility } from "@/lib/rules-engine";

export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId");

  try {
    // 1. Get user's accounts if no accountId provided
    if (!accountId) {
      const accounts = await prisma.account.findMany({
        where: { userId: user.userId, status: "ACTIVE" },
        select: { id: true, type: true, capitalSize: true, currentBalance: true },
      });
      return NextResponse.json({ accounts });
    }

    // 2. Get specific account eligibility
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account || account.userId !== user.userId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const eligibility = await validateWithdrawalEligibility(account);
    const profit = Math.max(0, account.currentBalance - account.capitalSize);

    return NextResponse.json({
      accountId: account.id,
      eligibility,
      profit,
      currentBalance: account.currentBalance,
      capitalSize: account.capitalSize,
    });
  } catch (error) {
    console.error("[ELIGIBILITY_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
