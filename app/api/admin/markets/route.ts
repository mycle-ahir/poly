import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";

// ─── GET: List all prediction markets (admin) ───────────────────────────────
export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const markets = await prisma.predictionMarket.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ markets });
}

// ─── POST: Create a new prediction market ───────────────────────────────────
export async function POST(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { category, question, endDate, yesOdds, noOdds, volume } = body;

    if (!category || !question || !endDate || !yesOdds || !noOdds) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const market = await prisma.predictionMarket.create({
      data: {
        category,
        question,
        endDate: new Date(endDate),
        yesOdds: Number(yesOdds),
        noOdds: Number(noOdds),
        volume: volume || "$0",
      },
    });

    return NextResponse.json({ message: "Market created", market }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_MARKET_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PUT: Update a prediction market ────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { marketId, ...data } = body;

    if (!marketId) {
      return NextResponse.json({ error: "Market ID required" }, { status: 400 });
    }

    if (data.yesOdds) data.yesOdds = Number(data.yesOdds);
    if (data.noOdds) data.noOdds = Number(data.noOdds);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const market = await prisma.predictionMarket.update({
      where: { id: marketId },
      data,
    });

    return NextResponse.json({ message: "Market updated", market });
  } catch (error) {
    console.error("[ADMIN_MARKET_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE: Delete a prediction market ─────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const marketId = searchParams.get("marketId");

    if (!marketId) {
      return NextResponse.json({ error: "Market ID required" }, { status: 400 });
    }

    await prisma.predictionMarket.delete({ where: { id: marketId } });
    return NextResponse.json({ message: "Market deleted" });
  } catch (error) {
    console.error("[ADMIN_MARKET_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
