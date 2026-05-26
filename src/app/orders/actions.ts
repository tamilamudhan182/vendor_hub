"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function submitRefundRequest(orderId: string, reason: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Unauthorized");
  }

  // Find order and check ownership
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { refund: true },
  });

  if (!order || order.userId !== session.user.id) {
    throw new Error("Order not found or unauthorized.");
  }

  if (order.paymentStatus !== "PAID") {
    throw new Error("Only fully paid orders are eligible for refunds.");
  }

  if (order.refund) {
    throw new Error("A refund request has already been filed for this order.");
  }

  // Create refund record in INITIATED state
  await db.refund.create({
    data: {
      orderId,
      reason,
      amount: order.total,
      status: "INITIATED",
    },
  });

  // Optional: Update order status to REFUND_REQUESTED or keep track via refund model
  // Let's keep it clean by referencing it.

  revalidatePath("/orders");
  return { success: true };
}
