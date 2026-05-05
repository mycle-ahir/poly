import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";

export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const profile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        language: true,
        timezone: true,
        theme: true,
        notificationSettings: true,
      },
    });

    if (!profile) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("[USER_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { fullName, language, timezone, theme, notificationSettings } = body;

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: {
        fullName,
        language,
        timezone,
        theme,
        notificationSettings,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        language: updatedUser.language,
        timezone: updatedUser.timezone,
        theme: updatedUser.theme,
        notificationSettings: updatedUser.notificationSettings,
      },
    });
  } catch (error) {
    console.error("[USER_PUT_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
