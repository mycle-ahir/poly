import { NextRequest, NextResponse } from "next/server";
import { resetDailyDrawdowns, suspendInactiveAccounts, checkTestAccountStatus } from "@/lib/rules-engine";
import prisma from "@/lib/prisma";

/**
 * Cron endpoint for scheduled tasks.
 * Should be called daily at midnight GMT.
 * 
 * Protect with a CRON_SECRET in production:
 *   - Vercel Cron Jobs
 *   - External cron service (e.g., cron-job.org)
 * 
 * GET /api/cron?secret=YOUR_CRON_SECRET
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // Verify cron secret (skip in dev)
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const results: Record<string, any> = {};

  try {
    // 1. Reset daily drawdowns at midnight GMT
    const ddResetCount = await resetDailyDrawdowns();
    results.dailyDrawdownResets = ddResetCount;

    // 2. Suspend inactive accounts (7+ days without trading)
    const suspendedCount = await suspendInactiveAccounts();
    results.accountsSuspended = suspendedCount;

    // 3. Check all test accounts for expiration
    const testAccounts = await prisma.account.findMany({
      where: { status: "TEST_ACTIVE" },
      select: { id: true },
    });

    let testChecks = 0;
    for (const account of testAccounts) {
      await checkTestAccountStatus(account.id);
      testChecks++;
    }
    results.testAccountsChecked = testChecks;

    // 4. Clean up expired refresh tokens
    const expiredTokens = await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    results.expiredTokensCleaned = expiredTokens.count;

    return NextResponse.json({
      message: "Cron tasks completed successfully",
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error) {
    console.error("[CRON_ERROR]", error);
    return NextResponse.json({ error: "Cron job failed", details: String(error) }, { status: 500 });
  }
}
