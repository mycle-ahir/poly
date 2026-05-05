import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";
import { createWalletSchema, updateWalletSchema } from "@/lib/validations";

// ─── GET: List all wallet configs (admin) ───────────────────────────────────
export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const wallets = await prisma.walletConfig.findMany({
    orderBy: [{ cryptocurrency: "asc" }, { blockchain: "asc" }],
  });

  return NextResponse.json({ wallets });
}

// ─── POST: Create a new wallet config ───────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const parsed = createWalletSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    // Check if exists
    const existing = await prisma.walletConfig.findUnique({
      where: {
        cryptocurrency_blockchain: {
          cryptocurrency: parsed.data.cryptocurrency,
          blockchain: parsed.data.blockchain,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Wallet for ${parsed.data.cryptocurrency} on ${parsed.data.blockchain} already exists` },
        { status: 409 }
      );
    }

    const wallet = await prisma.walletConfig.create({ data: parsed.data });
    return NextResponse.json({ message: "Wallet created", wallet }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_WALLET_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PUT: Update a wallet config ────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { walletId, ...rest } = body;
    const parsed = updateWalletSchema.safeParse(rest);

    if (!parsed.success || !walletId) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const wallet = await prisma.walletConfig.update({
      where: { id: walletId },
      data: parsed.data,
    });

    return NextResponse.json({ message: "Wallet updated", wallet });
  } catch (error) {
    console.error("[ADMIN_WALLET_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE: Delete a wallet config ─────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get("walletId");

    if (!walletId) {
      return NextResponse.json({ error: "Wallet ID is required" }, { status: 400 });
    }

    await prisma.walletConfig.delete({
      where: { id: walletId },
    });

    return NextResponse.json({ message: "Wallet deleted successfully" });
  } catch (error) {
    console.error("[ADMIN_WALLET_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
