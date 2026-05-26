"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { SellerStatus, RefundStatus, OrderStatus, PayStatus, Role } from "@prisma/client";

// Guard helper to verify user is an admin
async function ensureAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized access. Admin only.");
  }
}

export async function approveSeller(sellerProfileId: string) {
  await ensureAdmin();

  // Find the seller profile
  const profile = await db.sellerProfile.findUnique({
    where: { id: sellerProfileId },
    select: { userId: true },
  });

  if (!profile) throw new Error("Seller profile not found.");

  // Transaction: set seller APPROVED and update user role to SELLER
  await db.$transaction([
    db.sellerProfile.update({
      where: { id: sellerProfileId },
      data: { status: SellerStatus.APPROVED },
    }),
    db.user.update({
      where: { id: profile.userId },
      data: { role: Role.SELLER },
    }),
  ]);

  revalidatePath("/admin");
  return { success: true };
}

export async function rejectSeller(sellerProfileId: string, reason: string) {
  await ensureAdmin();

  await db.sellerProfile.update({
    where: { id: sellerProfileId },
    data: {
      status: SellerStatus.REJECTED,
      rejectionReason: reason,
    },
  });

  revalidatePath("/admin");
  return { success: true };
}

export async function processRefundRequest(refundId: string, approve: boolean) {
  await ensureAdmin();

  const refund = await db.refund.findUnique({
    where: { id: refundId },
    include: {
      order: {
        include: {
          items: {
            include: {
              product: {
                select: { price: true },
              },
            },
          },
        },
      },
    },
  });

  if (!refund) throw new Error("Refund request not found.");

  if (approve) {
    // Process approve refund
    await db.$transaction(async (tx) => {
      // 1. Update refund status
      await tx.refund.update({
        where: { id: refundId },
        data: {
          status: RefundStatus.PROCESSED,
          processedAt: new Date(),
        },
      });

      // 2. Update order statuses to REFUNDED
      await tx.order.update({
        where: { id: refund.orderId },
        data: {
          status: OrderStatus.REFUNDED,
          paymentStatus: PayStatus.REFUNDED,
        },
      });

      // 3. Deduct/Reverse seller pending payout values
      for (const item of refund.order.items) {
        const itemTotal = item.price * item.quantity;
        // Assume default commission logic used when crediting
        const commissionRate = 10.0;
        const commissionFee = (itemTotal * commissionRate) / 100;
        const sellerNetEarnings = itemTotal - commissionFee;

        await tx.sellerProfile.update({
          where: { id: item.sellerId },
          data: {
            pendingPayout: { decrement: sellerNetEarnings },
          },
        });
      }
    });
  } else {
    // Process reject refund
    await db.refund.update({
      where: { id: refundId },
      data: { status: RefundStatus.REJECTED },
    });
  }

  revalidatePath("/admin");
  return { success: true };
}

export async function updateCommissionSetting(percent: number) {
  await ensureAdmin();

  if (percent < 0 || percent > 50) {
    throw new Error("Commission rate must be between 0% and 50%.");
  }

  await db.platformSettings.upsert({
    where: { key: "commission_percent" },
    update: { value: String(percent) },
    create: { key: "commission_percent", value: String(percent) },
  });

  revalidatePath("/admin");
  return { success: true };
}
