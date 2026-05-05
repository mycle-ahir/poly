import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";
import { createOrderSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

// ─── GET: List user's orders ─────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: user.userId },
    include: { deposit: { select: { status: true, cryptocurrency: true, blockchain: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ orders });
}

// ─── POST: Create a new purchase order ───────────────────────────────────────
export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req, "api");
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { accountType, capitalSize } = parsed.data;

    // Fetch the price from CapitalSizeConfig
    const config = await prisma.capitalSizeConfig.findUnique({
      where: { amount: capitalSize },
    });

    if (!config || !config.isActive) {
      return NextResponse.json({ error: "Capital size not available" }, { status: 400 });
    }

    // Check for re-apply discount (One Step Test that previously failed)
    let discountPct = 0;
    if (accountType === "ONE_STEP_TEST") {
      const failedAccount = await prisma.account.findFirst({
        where: {
          userId: user.userId,
          type: "ONE_STEP_TEST",
          status: "TEST_FAILED",
        },
        orderBy: { createdAt: "desc" },
      });
      if (failedAccount) {
        discountPct = 10; // 10% discount on re-apply
      }
    }

    const price = config.price;
    const finalPrice = price * (1 - discountPct / 100);

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: user.userId,
        accountType,
        capitalSize,
        price,
        discountPct,
        finalPrice,
        status: "AWAITING_DEPOSIT",
      },
    });

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: {
          id: order.id,
          hashId: order.hashId,
          accountType: order.accountType,
          capitalSize: order.capitalSize,
          price: order.price,
          discountPct: order.discountPct,
          finalPrice: order.finalPrice,
          status: order.status,
          createdAt: order.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CREATE_ORDER_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
