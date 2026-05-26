import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Navbar from "@/components/navbar";
import OrdersClient from "./orders-client";

export const metadata: Metadata = {
  title: "My Orders",
  description: "Track and manage your e-commerce orders.",
};

export default async function OrdersPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin?callbackUrl=/orders");
  }

  // Fetch all orders placed by the current user
  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: {
      refund: true,
      items: {
        include: {
          product: {
            select: { name: true, price: true, images: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <OrdersClient orders={orders} />
      </div>
    </div>
  );
}
