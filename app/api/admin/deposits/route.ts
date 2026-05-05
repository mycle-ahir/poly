import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/middleware";
import { reviewDepositSchema } from "@/lib/validations";

// ─── GET: List all deposits (admin) ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: any = {};
  if (status && status !== "all") where.status = status;

  const deposits = await prisma.deposit.findMany({
    where,
    include: {
      user: { select: { id: true, email: true, fullName: true } },
      order: { select: { hashId: true, accountType: true, capitalSize: true, finalPrice: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = await prisma.deposit.groupBy({
    by: ["status"],
    _count: true,
  });

  return NextResponse.json({
    deposits,
    summary: {
      pending: counts.find((c) => c.status === "PENDING")?._count || 0,
      approved: counts.find((c) => c.status === "APPROVED")?._count || 0,
      rejected: counts.find((c) => c.status === "REJECTED")?._count || 0,
    },
  });
}

// ─── PUT: Approve or reject a deposit ───────────────────────────────────────
export async function PUT(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const { depositId, ...rest } = body;
    const parsed = reviewDepositSchema.safeParse(rest);

    if (!parsed.success || !depositId) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.success ? "depositId required" : parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { action, rejectionReason } = parsed.data;

    const deposit = await prisma.deposit.findUnique({
      where: { id: depositId },
      include: { order: true },
    });

    if (!deposit) return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    if (deposit.status !== "PENDING") {
      return NextResponse.json({ error: `Deposit already ${deposit.status.toLowerCase()}` }, { status: 400 });
    }

    if (action === "APPROVE") {
      // Approve deposit + create trading account in a transaction
      await prisma.$transaction(async (tx) => {
        // Update deposit
        await tx.deposit.update({
          where: { id: depositId },
          data: { status: "APPROVED", reviewedBy: user.userId, reviewedAt: new Date() },
        });

        // Update order
        await tx.order.update({
          where: { id: deposit.orderId },
          data: { status: "APPROVED" },
        });

        // Create the trading account
        const isTest = deposit.order.accountType === "ONE_STEP_TEST";
        const now = new Date();
        const testEndDate = isTest ? new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) : null;

        await tx.account.create({
          data: {
            userId: deposit.userId,
            orderId: deposit.orderId,
            type: deposit.order.accountType,
            status: isTest ? "TEST_ACTIVE" : "ACTIVE",
            capitalSize: deposit.order.capitalSize,
            currentBalance: deposit.order.capitalSize,
            testStartDate: isTest ? now : null,
            testEndDate,
          },
        });
      });

      return NextResponse.json({ message: "Deposit approved. Trading account created." });
    } else {
      // Reject deposit
      await prisma.$transaction([
        prisma.deposit.update({
          where: { id: depositId },
          data: {
            status: "REJECTED",
            reviewedBy: user.userId,
            reviewedAt: new Date(),
            rejectionReason: rejectionReason || "Rejected by admin",
          },
        }),
        prisma.order.update({
          where: { id: deposit.orderId },
          data: { status: "REJECTED" },
        }),
      ]);

      return NextResponse.json({ message: "Deposit rejected." });
    }
  } catch (error) {
    console.error("[ADMIN_DEPOSIT_REVIEW_ERROR]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
