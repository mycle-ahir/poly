import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";
import { updateRuleSchema } from "@/lib/validations";

// ─── GET: List all platform rules ───────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rules = await prisma.platformRule.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ rules });
}

// ─── PUT: Update a rule ─────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { ruleId, ...rest } = body;
    const parsed = updateRuleSchema.safeParse(rest);

    if (!parsed.success || !ruleId) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const rule = await prisma.platformRule.update({
      where: { id: ruleId },
      data: parsed.data,
    });

    return NextResponse.json({ message: "Rule updated", rule });
  } catch (error) {
    console.error("[ADMIN_RULE_UPDATE_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
