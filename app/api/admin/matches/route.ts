import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";

// ─── GET: List all matches (admin) ──────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matches = await prisma.match.findMany({
    orderBy: { startTime: "desc" },
  });

  return NextResponse.json({ matches });
}

// ─── POST: Create a new match ───────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { league, team1Name, team1Odds, team2Name, team2Odds, drawOdds, startTime, isLive } = body;

    if (!league || !team1Name || !team1Odds || !team2Name || !team2Odds || !startTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const match = await prisma.match.create({
      data: {
        league,
        team1Name,
        team1Odds: Number(team1Odds),
        team2Name,
        team2Odds: Number(team2Odds),
        drawOdds: drawOdds ? Number(drawOdds) : null,
        startTime: new Date(startTime),
        isLive: Boolean(isLive),
      },
    });

    return NextResponse.json({ message: "Match created", match }, { status: 201 });
  } catch (error) {
    console.error("[ADMIN_MATCH_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PUT: Update a match ────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { matchId, ...data } = body;

    if (!matchId) {
      return NextResponse.json({ error: "Match ID required" }, { status: 400 });
    }

    // Sanitize numerics
    if (data.team1Odds) data.team1Odds = Number(data.team1Odds);
    if (data.team2Odds) data.team2Odds = Number(data.team2Odds);
    if (data.drawOdds !== undefined) data.drawOdds = data.drawOdds ? Number(data.drawOdds) : null;
    if (data.startTime) data.startTime = new Date(data.startTime);

    const match = await prisma.match.update({
      where: { id: matchId },
      data,
    });

    return NextResponse.json({ message: "Match updated", match });
  } catch (error) {
    console.error("[ADMIN_MATCH_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE: Delete a match ─────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get("matchId");

    if (!matchId) {
      return NextResponse.json({ error: "Match ID required" }, { status: 400 });
    }

    await prisma.match.delete({ where: { id: matchId } });
    return NextResponse.json({ message: "Match deleted" });
  } catch (error) {
    console.error("[ADMIN_MATCH_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
