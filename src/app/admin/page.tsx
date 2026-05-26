import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Navbar from "@/components/navbar";
import AdminClient from "./admin-client";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "VendorHub administrative settings and analytics.",
};

export default async function AdminPage() {
  const session = await auth();

  // 1. Verify user is ADMIN
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // 2. Fetch stats
  const paidOrders = await db.order.findMany({
    where: { paymentStatus: "PAID" },
    select: { total: true, commission: true },
  });

  const totalSales = paidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalCommission = paidOrders.reduce((sum, o) => sum + o.commission, 0);

  const vendorsCount = await db.sellerProfile.count({
    where: { status: "APPROVED" },
  });

  const ordersCount = await db.order.count({
    where: { paymentStatus: "PAID" },
  });

  // 3. Fetch pending seller profiles
  const pendingSellers = await db.sellerProfile.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: { name: true, email: true, phone: true, city: true, state: true, pincode: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 4. Fetch refund requests
  const refundRequests = await db.refund.findMany({
    where: { status: "INITIATED" },
    include: {
      order: {
        select: {
          id: true,
          total: true,
          createdAt: true,
          user: {
            select: { name: true, email: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 5. Fetch all orders list
  const allOrders = await db.order.findMany({
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // 6. Fetch current commission setting
  const commissionSetting = await db.platformSettings.findUnique({
    where: { key: "commission_percent" },
  });
  const currentCommission = commissionSetting ? parseFloat(commissionSetting.value) : 10.0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-grow p-8 bg-[#FBF7F2]">
        <AdminClient
          stats={{
            totalSales,
            totalCommission,
            vendorsCount,
            ordersCount,
          }}
          pendingSellers={pendingSellers}
          refundRequests={refundRequests}
          allOrders={allOrders}
          currentCommission={currentCommission}
        />
      </div>
    </div>
  );
}
