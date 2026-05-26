"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ItemStatus, OrderStatus } from "@prisma/client";

export async function updateOrderItemStatus(
  orderItemId: string,
  newStatus: ItemStatus
) {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    throw new Error("Unauthorized");
  }

  const sellerId = session.user.sellerId!;

  // 1. Fetch the OrderItem and verify ownership
  const item = await db.orderItem.findUnique({
    where: { id: orderItemId },
    select: { id: true, sellerId: true, orderId: true },
  });

  if (!item || item.sellerId !== sellerId) {
    throw new Error("Order item not found or unauthorized.");
  }

  // 2. Update the status of the specific OrderItem
  await db.orderItem.update({
    where: { id: orderItemId },
    data: { status: newStatus },
  });

  // 3. Sync parent Order status based on all its OrderItems
  const allItems = await db.orderItem.findMany({
    where: { orderId: item.orderId },
    select: { status: true },
  });

  const statuses = allItems.map((i) => i.status);

  let parentStatus: OrderStatus = OrderStatus.CONFIRMED;

  if (statuses.every((s) => s === ItemStatus.DELIVERED)) {
    parentStatus = OrderStatus.DELIVERED;
  } else if (statuses.every((s) => s === ItemStatus.CANCELLED)) {
    parentStatus = OrderStatus.CANCELLED;
  } else if (statuses.some((s) => s === ItemStatus.SHIPPED || s === ItemStatus.DELIVERED)) {
    parentStatus = OrderStatus.SHIPPED;
  } else if (statuses.some((s) => s === ItemStatus.PROCESSING)) {
    parentStatus = OrderStatus.PROCESSING;
  }

  await db.order.update({
    where: { id: item.orderId },
    data: { status: parentStatus },
  });

  revalidatePath("/seller/orders");
  revalidatePath("/seller/dashboard");
  revalidatePath("/orders");
  return { success: true };
}
