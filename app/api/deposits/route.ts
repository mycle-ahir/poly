import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";
import { submitDepositSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

// ─── GET: List user's deposits ──────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deposits = await prisma.deposit.findMany({
    where: { userId: user.userId },
    include: {
      order: {
        select: { hashId: true, accountType: true, capitalSize: true, finalPrice: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ deposits });
}

// ─── POST: Submit deposit confirmation ──────────────────────────────────────
export async function POST(req: NextRequest) {
  const rl = await checkRateLimit(req, "api");
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = submitDepositSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { orderId, cryptocurrency, blockchain, txHash } = parsed.data;

    // Validate order exists and belongs to user
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.userId !== user.userId) {
      return NextResponse.json({ error: "Order does not belong to you" }, { status: 403 });
    }
    if (order.status !== "AWAITING_DEPOSIT") {
      return NextResponse.json(
        { error: `Order is already ${order.status.toLowerCase()}. Cannot submit deposit.` },
        { status: 400 }
      );
    }

    // Check duplicate deposit for this order
    const existingDeposit = await prisma.deposit.findUnique({ where: { orderId } });
    if (existingDeposit) {
      return NextResponse.json(
        { error: "A deposit has already been submitted for this order" },
        { status: 409 }
      );
    }

    // Verify wallet config exists for this crypto+chain
    const walletConfig = await prisma.walletConfig.findUnique({
      where: { cryptocurrency_blockchain: { cryptocurrency, blockchain } },
    });
    if (!walletConfig || !walletConfig.isActive) {
      return NextResponse.json(
        { error: `No active wallet configured for ${cryptocurrency} on ${blockchain}` },
        { status: 400 }
      );
    }

    // Create deposit & update order status
    const [deposit] = await prisma.$transaction([
      prisma.deposit.create({
        data: {
          userId: user.userId,
          orderId,
          cryptocurrency,
          blockchain,
          txHash: txHash || null,
          amount: order.finalPrice,
          status: "PENDING",
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: "DEPOSIT_SUBMITTED" },
      }),
    ]);

    return NextResponse.json(
      {
        message: "Deposit submitted successfully. Awaiting admin approval.",
        deposit: {
          id: deposit.id,
          orderId: deposit.orderId,
          cryptocurrency: deposit.cryptocurrency,
          blockchain: deposit.blockchain,
          amount: deposit.amount,
          status: deposit.status,
          createdAt: deposit.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[SUBMIT_DEPOSIT_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
