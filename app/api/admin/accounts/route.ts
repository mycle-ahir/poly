import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";
import { adjustCapitalSchema } from "@/lib/validations";

// ─── PUT: Adjust account capital / restrict / A-book ────────────────────────
export async function PUT(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { accountId, action, ...rest } = body;

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    switch (action) {
      case "adjust_capital": {
        const parsed = adjustCapitalSchema.safeParse(rest);
        if (!parsed.success) {
          return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, { status: 400 });
        }
        await prisma.account.update({
          where: { id: accountId },
          data: {
            capitalSize: parsed.data.capitalSize,
            ...(parsed.data.currentBalance !== undefined ? { currentBalance: parsed.data.currentBalance } : {}),
          },
        });
        return NextResponse.json({ message: `Capital adjusted to $${parsed.data.capitalSize}` });
      }

      case "restrict": {
        await prisma.account.update({
          where: { id: accountId },
          data: { status: "RESTRICTED" },
        });
        return NextResponse.json({ message: "Account restricted" });
      }

      case "activate": {
        await prisma.account.update({
          where: { id: accountId },
          data: { status: "ACTIVE" },
        });
        return NextResponse.json({ message: "Account activated" });
      }

      case "suspend": {
        await prisma.account.update({
          where: { id: accountId },
          data: { status: "SUSPENDED" },
        });
        return NextResponse.json({ message: "Account suspended" });
      }

      case "toggle_abook": {
        await prisma.account.update({
          where: { id: accountId },
          data: { isABook: !account.isABook },
        });
        return NextResponse.json({ message: `A-Book ${account.isABook ? "disabled" : "enabled"}` });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: adjust_capital, restrict, activate, suspend, toggle_abook" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[ADMIN_ACCOUNTS_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
