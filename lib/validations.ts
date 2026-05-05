import { z } from "zod";

// ─── Auth ───────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email too long")
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  fullName: z.string().min(2, "Name too short").max(100, "Name too long").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email").transform((v) => v.toLowerCase().trim()),
  password: z.string().min(1, "Password is required"),
});

// ─── Orders ─────────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  accountType: z.enum(["INSTANT", "ONE_STEP_TEST"], {
    message: "Account type must be INSTANT or ONE_STEP_TEST",
  }),
  capitalSize: z
    .number()
    .refine(
      (val) => [1000, 3000, 5000, 10000, 25000, 50000].includes(val),
      "Invalid capital size"
    ),
});

// ─── Deposits ───────────────────────────────────────────────────────────────

export const submitDepositSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  cryptocurrency: z.enum(["USDT", "USDC", "ETH", "BTC"], {
    message: "Invalid cryptocurrency",
  }),
  blockchain: z.enum(["ERC20", "TRC20", "BEP20"], {
    message: "Invalid blockchain",
  }),
  txHash: z
    .string()
    .min(10, "Transaction hash is too short")
    .max(256, "Transaction hash is too long")
    .optional(),
});

// ─── Withdrawals ────────────────────────────────────────────────────────────

export const requestWithdrawalSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  cryptocurrency: z.enum(["USDT", "USDC", "ETH", "BTC"]),
  blockchain: z.enum(["ERC20", "TRC20", "BEP20"]),
  walletAddress: z.string().min(10, "Wallet address too short").max(256),
  amount: z.number().positive("Amount must be positive"),
});

// ─── Trades ─────────────────────────────────────────────────────────────────

export const placeTradeSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  matchId: z.string().min(1, "Match ID is required"),
  matchTitle: z.string().min(1).max(500),
  matchStartTime: z.string().datetime({ message: "Invalid datetime format" }),
  selection: z.string().min(1, "Selection is required"),
  odds: z.number().min(1.5, "Minimum odds is 1.5").max(5, "Maximum odds is 5.0"),
  stake: z.number().positive("Stake must be positive"),
});

// ─── Admin ──────────────────────────────────────────────────────────────────

export const reviewDepositSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().max(500).optional(),
});

export const reviewWithdrawalSchema = z.object({
  action: z.enum(["APPROVE", "REJECT"]),
  rejectionReason: z.string().max(500).optional(),
});

export const adjustCapitalSchema = z.object({
  capitalSize: z.number().positive("Capital must be positive"),
  currentBalance: z.number().optional(),
});

export const updateWalletSchema = z.object({
  walletAddress: z.string().min(10).max(256).optional(),
  qrCodeUrl: z.union([z.string(), z.literal(""), z.null()]).optional(),
  isActive: z.boolean().optional(),
});

export const createWalletSchema = z.object({
  cryptocurrency: z.enum(["USDT", "USDC", "ETH", "BTC"]),
  blockchain: z.enum(["ERC20", "TRC20", "BEP20"]),
  walletAddress: z.string().min(10).max(256),
  qrCodeUrl: z.union([z.string(), z.literal(""), z.null()]).optional(),
});

export const updateRuleSchema = z.object({
  value: z.string().min(1).optional(),
  isEnabled: z.boolean().optional(),
});

// ─── Profile ────────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
});
