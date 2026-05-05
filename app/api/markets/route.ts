import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ─── GET: List active prediction markets for users ──────────────────────────
export async function GET() {
  try {
    const markets = await prisma.predictionMarket.findMany({
      where: { isActive: true },
      orderBy: { endDate: "asc" },
    });

    return NextResponse.json({ markets });
  } catch (error) {
    console.error("[MARKETS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
