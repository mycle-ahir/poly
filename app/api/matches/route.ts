import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// ─── GET: List active matches for users ─────────────────────────────────────
export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      where: { isActive: true },
      orderBy: [{ isLive: "desc" }, { startTime: "asc" }],
    });

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("[MATCHES_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
