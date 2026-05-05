import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from "@/lib/auth/jwt";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req, "auth");
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { refreshToken: token } = body;

    if (!token) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 });
    }

    // Verify the refresh token cryptographically
    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid or expired refresh token" }, { status: 401 });
    }

    // Check if refresh token exists in DB (prevents reuse of revoked tokens)
    const storedToken = await prisma.refreshToken.findUnique({ where: { token } });
    if (!storedToken || storedToken.expiresAt < new Date()) {
      // Token not found or expired — possible token theft, revoke all
      if (payload.userId) {
        await prisma.refreshToken.deleteMany({ where: { userId: payload.userId } });
      }
      return NextResponse.json(
        { error: "Refresh token revoked. Please log in again." },
        { status: 401 }
      );
    }

    // Load fresh user data
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Rotate: delete old token, create new pair
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const newTokenPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(newTokenPayload);
    const newRefreshToken = generateRefreshToken(newTokenPayload);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last active
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    });

    return NextResponse.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("[REFRESH_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
