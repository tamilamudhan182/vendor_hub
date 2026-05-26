import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import SellerOrderList from "./order-list";

export default async function SellerOrdersPage() {
  const session = await auth();

  if (!session || session.user.role !== "SELLER") {
    redirect("/auth/signin");
  }

  const sellerId = session.user.sellerId!;

  // Fetch all order items belonging to this seller
  const orderItems = await db.orderItem.findMany({
    where: { sellerId },
    include: {
      product: {
        select: { name: true, images: true },
      },
      order: {
        select: {
          shippingName: true,
          shippingPhone: true,
          shippingAddress: true,
          shippingPincode: true,
          shippingCity: true,
          shippingState: true,
          createdAt: true,
          paymentStatus: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="font-display text-3xl font-bold text-primary tracking-tight">
          Fulfillment Queue
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review, pack, ship, and complete delivery statuses for incoming purchases.
        </p>
      </div>

      {/* Order List Component */}
      <SellerOrderList initialItems={orderItems} />

    </div>
  );
}
