import prisma from "@/lib/prisma";
import { Account, Trade } from "@prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// Trading Rules Engine
// Validates every trade against platform rules before execution.
// ─────────────────────────────────────────────────────────────────────────────

interface TradeValidationInput {
  accountId: string;
  matchId: string;
  matchStartTime: Date;
  odds: number;
  stake: number;
  selection: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Load all enabled platform rules as a key-value map.
 */
async function loadRules(): Promise<Record<string, string>> {
  const rules = await prisma.platformRule.findMany({ where: { isEnabled: true } });
  const map: Record<string, string> = {};
  for (const rule of rules) {
    map[rule.key] = rule.value;
  }
  return map;
}

/**
 * Validate a trade against all platform rules.
 * Returns { valid: true } or { valid: false, errors: [...] }.
 */
export async function validateTrade(
  input: TradeValidationInput
): Promise<ValidationResult> {
  const errors: string[] = [];
  const rules = await loadRules();

  // 1. Load account
  const account = await prisma.account.findUnique({
    where: { id: input.accountId },
  });

  if (!account) {
    return { valid: false, errors: ["Account not found"] };
  }

  // 2. Account must be ACTIVE or TEST_ACTIVE
  if (account.status !== "ACTIVE" && account.status !== "TEST_ACTIVE") {
    return { valid: false, errors: [`Account is ${account.status}. Trading not allowed.`] };
  }

  // 3. Pre-match trading window (default 10 minutes)
  const preMatchMinutes = parseInt(rules["pre_match_window_minutes"] || "10");
  const now = new Date();
  const minutesUntilMatch = (input.matchStartTime.getTime() - now.getTime()) / 60_000;
  if (minutesUntilMatch < preMatchMinutes) {
    errors.push(`Cannot place bets within ${preMatchMinutes} minutes of match start`);
  }

  // 4. Odds range (default 1.5 - 5.0)
  const minOdds = parseFloat(rules["minimum_odds"] || "1.5");
  const maxOdds = parseFloat(rules["maximum_odds"] || "5");
  if (input.odds < minOdds) {
    errors.push(`Odds ${input.odds} below minimum ${minOdds}`);
  }
  if (input.odds > maxOdds) {
    errors.push(`Odds ${input.odds} above maximum ${maxOdds}`);
  }

  // 5. Max bet size (default 20% of capital)
  const maxBetPct = parseFloat(rules["max_single_bet_pct"] || "20");
  const maxStake = (account.capitalSize * maxBetPct) / 100;
  if (input.stake > maxStake) {
    errors.push(`Stake $${input.stake} exceeds max ${maxBetPct}% of capital ($${maxStake})`);
  }

  // 6. Stake must not exceed current balance
  if (input.stake > account.currentBalance) {
    errors.push(`Insufficient balance. Available: $${account.currentBalance.toFixed(2)}`);
  }

  // 7. No duplicate bets on same match
  const existingTrade = await prisma.trade.findUnique({
    where: { accountId_matchId: { accountId: input.accountId, matchId: input.matchId } },
  });
  if (existingTrade) {
    errors.push("You already have a bet on this match. No duplicate bets allowed.");
  }

  // 8. No hedging — check if user has bet on a different outcome of the same match
  // (covered by #7 since we have @@unique on [accountId, matchId])
  // The unique constraint ensures only one bet per match per account.

  // 9. Minimum weekly trades check happens on withdrawal, not on trade placement.
  //    But we can track the weekly count for informational purposes.

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check weekly trade count for an account.
 */
export async function getWeeklyTradeCount(accountId: string): Promise<number> {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);

  return prisma.trade.count({
    where: {
      accountId,
      createdAt: { gte: startOfWeek },
    },
  });
}

/**
 * Validate withdrawal eligibility.
 * Returns all failed checks.
 */
export async function validateWithdrawalEligibility(
  account: Account
): Promise<{ eligible: boolean; checks: Array<{ rule: string; passed: boolean; detail: string }> }> {
  const rules = await loadRules();
  const checks: Array<{ rule: string; passed: boolean; detail: string }> = [];

  // 1. Minimum profit percentage (default 20%)
  const minProfitPct = parseFloat(rules["min_withdrawal_profit_pct"] || "20");
  const profitPct = account.capitalSize > 0
    ? ((account.currentBalance - account.capitalSize) / account.capitalSize) * 100
    : 0;
  const profitCheck = profitPct >= minProfitPct;
  checks.push({
    rule: `Minimum ${minProfitPct}% Profit`,
    passed: profitCheck,
    detail: `Current profit: ${profitPct.toFixed(1)}%`,
  });

  // 2. Daily drawdown within limits (default 20%)
  const maxDailyDD = parseFloat(rules["max_daily_drawdown_pct"] || "20");
  const dailyDDCheck = account.dailyDrawdownPct <= maxDailyDD;
  checks.push({
    rule: `Max Daily Loss: ${maxDailyDD}%`,
    passed: dailyDDCheck,
    detail: `Current daily DD: ${account.dailyDrawdownPct.toFixed(1)}%`,
  });

  // 3. Lifetime drawdown within limits (default 30%)
  const maxLifetimeDD = parseFloat(rules["max_lifetime_drawdown_pct"] || "30");
  const lifetimeDDCheck = account.lifetimeDrawdownPct <= maxLifetimeDD;
  checks.push({
    rule: `Max Lifetime Loss: ${maxLifetimeDD}%`,
    passed: lifetimeDDCheck,
    detail: `Current lifetime DD: ${account.lifetimeDrawdownPct.toFixed(1)}%`,
  });

  // 4. Minimum weekly trades (default 3)
  const minWeeklyTrades = parseInt(rules["min_weekly_trades"] || "3");
  const weeklyTradeCount = await getWeeklyTradeCount(account.id);
  const weeklyTradeCheck = weeklyTradeCount >= minWeeklyTrades;
  checks.push({
    rule: `Minimum ${minWeeklyTrades} Trading Days Weekly`,
    passed: weeklyTradeCheck,
    detail: `Total trades this week: ${weeklyTradeCount}`,
  });

  // 5. Account must be active
  const activeCheck = account.status === "ACTIVE";
  checks.push({
    rule: "Account Active (No 7-day inactivity)",
    passed: activeCheck,
    detail: activeCheck ? "Account is active" : `Account status: ${account.status}`,
  });

  // 6. Bi-weekly withdrawal window
  // Check last withdrawal was at least 14 days ago
  const lastWithdrawal = await prisma.withdrawal.findFirst({
    where: {
      accountId: account.id,
      status: "APPROVED",
    },
    orderBy: { createdAt: "desc" },
  });

  let biweeklyCheck = true;
  if (lastWithdrawal) {
    const daysSinceLast = (Date.now() - lastWithdrawal.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    biweeklyCheck = daysSinceLast >= 14;
  }
  checks.push({
    rule: "Bi-weekly Withdrawal Period",
    passed: biweeklyCheck,
    detail: biweeklyCheck
      ? "Eligible for withdrawal"
      : `Last withdrawal too recent. Wait ${lastWithdrawal ? Math.ceil(14 - (Date.now() - lastWithdrawal.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0} more days.`,
  });

  return {
    eligible: checks.every((c) => c.passed),
    checks,
  };
}

/**
 * Check and handle test account completion.
 * Called after each trade settlement.
 */
export async function checkTestAccountStatus(accountId: string): Promise<void> {
  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account || account.type !== "ONE_STEP_TEST" || account.status !== "TEST_ACTIVE") return;

  const now = new Date();

  // Check if test period has expired (14 days)
  if (account.testEndDate && now > account.testEndDate) {
    const profitPct = account.capitalSize > 0
      ? ((account.currentBalance - account.capitalSize) / account.capitalSize) * 100
      : 0;

    if (account.testTradesCount >= 4 && profitPct >= 25) {
      // PASSED
      await prisma.account.update({
        where: { id: accountId },
        data: { status: "TEST_PASSED" },
      });
    } else {
      // FAILED
      await prisma.account.update({
        where: { id: accountId },
        data: { status: "TEST_FAILED" },
      });
    }
  }
}

/**
 * Reset daily drawdown at midnight GMT.
 * Should be called by a cron job or scheduled function.
 */
export async function resetDailyDrawdowns(): Promise<number> {
  const now = new Date();
  const todayMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  // Find accounts that haven't been reset today
  const accounts = await prisma.account.findMany({
    where: {
      status: { in: ["ACTIVE", "TEST_ACTIVE"] },
      OR: [
        { dailyDrawdownResetAt: null },
        { dailyDrawdownResetAt: { lt: todayMidnight } },
      ],
    },
  });

  for (const account of accounts) {
    // Snapshot yesterday's drawdown before resetting
    const yesterday = new Date(todayMidnight);
    yesterday.setDate(yesterday.getDate() - 1);

    await prisma.drawdownSnapshot.upsert({
      where: { accountId_date: { accountId: account.id, date: yesterday } },
      update: { drawdownPct: account.dailyDrawdownPct },
      create: {
        accountId: account.id,
        date: yesterday,
        startBalance: account.currentBalance,
        lowestBalance: account.currentBalance,
        drawdownPct: account.dailyDrawdownPct,
      },
    });

    // Reset daily drawdown
    await prisma.account.update({
      where: { id: account.id },
      data: {
        dailyDrawdownPct: 0,
        dailyDrawdownResetAt: todayMidnight,
      },
    });
  }

  return accounts.length;
}

/**
 * Check for inactive accounts (7+ days without trading) and suspend them.
 */
export async function suspendInactiveAccounts(): Promise<number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const result = await prisma.account.updateMany({
    where: {
      status: "ACTIVE",
      OR: [
        { lastTradeAt: null, createdAt: { lt: sevenDaysAgo } },
        { lastTradeAt: { lt: sevenDaysAgo } },
      ],
    },
    data: { status: "SUSPENDED" },
  });

  return result.count;
}
