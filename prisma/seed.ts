import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Create Admin User ──────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("Admin@123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@fundedflips.com" },
    update: {},
    create: {
      email: "admin@fundedflips.com",
      passwordHash: adminPassword,
      fullName: "Platform Admin",
      role: "ADMIN",
      isEmailVerified: true,
    },
  });
  console.log("✅ Admin user:", admin.email);

  // ─── Create Demo User ──────────────────────────────────────────────────
  const userPassword = await bcrypt.hash("User@123456", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@fundedflips.com" },
    update: {},
    create: {
      email: "demo@fundedflips.com",
      passwordHash: userPassword,
      fullName: "Demo Trader",
      role: "USER",
      isEmailVerified: true,
    },
  });
  console.log("✅ Demo user:", demoUser.email);

  // ─── Capital Size Configs ─────────────────────────────────────────────
  const capitalConfigs = [
    { amount: 1000, price: 39 },
    { amount: 3000, price: 79 },
    { amount: 5000, price: 99 },
    { amount: 10000, price: 149 },
    { amount: 25000, price: 299 },
    { amount: 50000, price: 399 },
  ];

  for (const config of capitalConfigs) {
    await prisma.capitalSizeConfig.upsert({
      where: { amount: config.amount },
      update: { price: config.price },
      create: { amount: config.amount, price: config.price },
    });
  }
  console.log("✅ Capital size configs seeded");

  // ─── Wallet Configurations ────────────────────────────────────────────
  const wallets = [
    { cryptocurrency: "USDT", blockchain: "TRC20", walletAddress: "TXYZabcd1234567890ABCDEFGHIJ" },
    { cryptocurrency: "USDT", blockchain: "ERC20", walletAddress: "0xABCDEF1234567890abcdef1234567890ABCDEF12" },
    { cryptocurrency: "USDT", blockchain: "BEP20", walletAddress: "0xBEP20abcd1234567890ABCDEFGHIJ123456789" },
    { cryptocurrency: "USDC", blockchain: "ERC20", walletAddress: "0xUSDC1234567890abcdef1234567890USDC1234" },
    { cryptocurrency: "ETH", blockchain: "ERC20", walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" },
    { cryptocurrency: "BTC", blockchain: "TRC20", walletAddress: "1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2" },
  ];

  for (const w of wallets) {
    await prisma.walletConfig.upsert({
      where: {
        cryptocurrency_blockchain: {
          cryptocurrency: w.cryptocurrency,
          blockchain: w.blockchain,
        },
      },
      update: { walletAddress: w.walletAddress },
      create: { ...w, isActive: true },
    });
  }
  console.log("✅ Wallet configs seeded");

  // ─── Platform Rules ───────────────────────────────────────────────────
  const rules = [
    {
      key: "pre_match_window_minutes",
      title: "Pre-Match Trading Window",
      description: "No trades within X minutes of match start",
      value: "10",
    },
    {
      key: "min_weekly_trades",
      title: "Minimum Weekly Trades",
      description: "Minimum number of trades required per week",
      value: "3",
    },
    {
      key: "max_single_bet_pct",
      title: "Maximum Single Bet",
      description: "Maximum percentage of capital per single bet",
      value: "20",
    },
    {
      key: "minimum_odds",
      title: "Minimum Odds",
      description: "Minimum allowed odds for any bet",
      value: "1.5",
    },
    {
      key: "maximum_odds",
      title: "Maximum Odds",
      description: "Maximum allowed odds for any bet",
      value: "5",
    },
    {
      key: "hedging_protection",
      title: "Hedging Protection",
      description: "Prevents multiple bets on same trade",
      value: "true",
    },
    {
      key: "market_type_restriction",
      title: "Market Type Restriction",
      description: "Only match winner markets allowed",
      value: "MATCH_WINNER",
    },
    {
      key: "inactivity_suspension_days",
      title: "Inactivity Suspension",
      description: "Suspend account after X days of inactivity",
      value: "7",
    },
    {
      key: "min_withdrawal_profit_pct",
      title: "Minimum Withdrawal Profit",
      description: "Minimum profit percentage for bi-weekly withdrawal",
      value: "20",
    },
    {
      key: "max_daily_drawdown_pct",
      title: "Maximum Daily Drawdown",
      description: "Maximum daily drawdown percentage",
      value: "20",
    },
    {
      key: "max_lifetime_drawdown_pct",
      title: "Maximum Lifetime Drawdown",
      description: "Maximum lifetime drawdown percentage",
      value: "30",
    },
    {
      key: "daily_drawdown_reset_time",
      title: "Daily Drawdown Reset",
      description: "Reset time for daily drawdown (GMT)",
      value: "00:00",
    },
  ];

  for (const rule of rules) {
    await prisma.platformRule.upsert({
      where: { key: rule.key },
      update: { title: rule.title, description: rule.description },
      create: { ...rule, isEnabled: true },
    });
  }
  console.log("✅ Platform rules seeded");

  console.log("\n🎉 Seed complete!");
  console.log("───────────────────────────────────────");
  console.log("Admin login:  admin@fundedflips.com / Admin@123456");
  console.log("Demo login:   demo@fundedflips.com / User@123456");
  console.log("───────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
