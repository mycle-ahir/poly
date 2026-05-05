import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ─── GET: Get wallet config for a crypto+chain combo ────────────────────────
// Public route — users need this to see deposit addresses
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cryptocurrency = searchParams.get("cryptocurrency");
  const blockchain = searchParams.get("blockchain");

  if (cryptocurrency && blockchain) {
    // Get specific wallet
    const wallet = await prisma.walletConfig.findUnique({
      where: {
        cryptocurrency_blockchain: { cryptocurrency, blockchain },
      },
      select: {
        id: true,
        cryptocurrency: true,
        blockchain: true,
        walletAddress: true,
        qrCodeUrl: true,
        isActive: true,
      },
    });

    if (!wallet || !wallet.isActive) {
      return NextResponse.json(
        { error: `No active wallet for ${cryptocurrency} on ${blockchain}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ wallet });
  }

  // List all active wallets
  const wallets = await prisma.walletConfig.findMany({
    where: { isActive: true },
    select: {
      id: true,
      cryptocurrency: true,
      blockchain: true,
      walletAddress: true,
      qrCodeUrl: true,
    },
    orderBy: { cryptocurrency: "asc" },
  });

  return NextResponse.json({ wallets });
}
