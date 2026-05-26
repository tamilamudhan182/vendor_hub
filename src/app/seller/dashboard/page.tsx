import Link from "next/link";
import { redirect } from "next/navigation";
import {
  DollarSign,
  Package,
  ShoppingCart,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function SellerDashboardPage() {
  const session = await auth();

  if (!session || session.user.role !== "SELLER") {
    redirect("/auth/signin");
  }

  const sellerId = session.user.sellerId!;

  // 1. Fetch Seller Profile for earnings
  const profile = await db.sellerProfile.findUnique({
    where: { id: sellerId },
  });

  if (!profile) {
    redirect("/seller/pending");
  }

  // 2. Fetch Active Products count
  const activeProductsCount = await db.product.count({
    where: { sellerId, isActive: true },
  });

  // 3. Fetch Total Orders (distinct orderIds)
  const orderItemsGroupBy = await db.orderItem.groupBy({
    by: ["orderId"],
    where: { sellerId },
  });
  const totalOrdersCount = orderItemsGroupBy.length;

  // 4. Fetch Low Stock Products
  const lowStockProducts = await db.product.findMany({
    where: { sellerId, stock: { lte: 5 } },
    orderBy: { stock: "asc" },
    take: 5,
  });

  // 5. Fetch Recent Order Items
  const recentOrderItems = await db.orderItem.findMany({
    where: { sellerId },
    include: {
      order: {
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      },
      product: {
        select: { name: true, images: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // 6. Fetch Recent Payouts
  const recentPayouts = await db.payout.findMany({
    where: { sellerId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div>
        <h2 className="font-display text-3xl font-bold text-primary tracking-tight">
          Overview
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor your sales, products, and payout distributions.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Earnings Card */}
        <div className="glow-card card bg-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-5 -mt-5"></div>
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Earnings
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <DollarSign className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-primary">
              ₹{profile.totalEarnings.toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">
              Transferred to bank account
            </p>
          </div>
        </div>

        {/* Pending Payout */}
        <div className="glow-card card bg-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-5 -mt-5"></div>
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Pending Settlement
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-primary">
              ₹{profile.pendingPayout.toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">
              Will clear next cycle (10% platform fee applied)
            </p>
          </div>
        </div>

        {/* Orders Card */}
        <div className="glow-card card bg-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -mr-5 -mt-5"></div>
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Orders
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <ShoppingCart className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-primary">
              {totalOrdersCount}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">
              Orders containing your items
            </p>
          </div>
        </div>

        {/* Products Card */}
        <div className="glow-card card bg-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl -mr-5 -mt-5"></div>
          <div className="flex flex-row items-center justify-between pb-2 space-y-0">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Active Products
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Package className="w-4.5 h-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-primary">
              {activeProductsCount}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 font-medium">
              Visible on local marketplace
            </p>
          </div>
        </div>

      </div>

      {/* Grid: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders List */}
        <Card variant="default" className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-primary font-display">
                Recent Orders
              </CardTitle>
              <CardDescription className="text-xs">
                Manage incoming orders and delivery status.
              </CardDescription>
            </div>
            <Link href="/seller/orders" className="text-xs font-bold text-accent hover:text-accent-dark flex items-center gap-1 group">
              Manage Orders
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {recentOrderItems.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-12 h-12 rounded-lg bg-warm-50 overflow-hidden border border-border/60 shrink-0">
                      {item.product.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-warm-100">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-primary truncate max-w-[200px] sm:max-w-[320px]">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Qty: {item.quantity} · By: {item.order.user.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 ${
                      item.status === "DELIVERED"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : item.status === "SHIPPED"
                        ? "bg-blue-50 text-blue-600 border border-blue-100"
                        : item.status === "CANCELLED"
                        ? "bg-rose-50 text-rose-600 border border-rose-100"
                        : "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}

              {recentOrderItems.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-3xl mb-2">📥</div>
                  <p className="text-sm text-muted-foreground">No orders received yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Side Panel: Stock Alerts & Payouts */}
        <div className="space-y-8">
          
          {/* Stock Alerts Card */}
          <Card variant="default">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <CardTitle className="text-base font-bold text-primary font-display">
                  Inventory Alerts
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Products running out of stock.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockProducts.map((prod) => (
                  <div key={prod.id} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-bold text-primary truncate">
                        {prod.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        SKU: {prod.sku || "N/A"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        prod.stock === 0
                          ? "bg-rose-50 text-rose-600 border border-rose-200"
                          : "bg-amber-50 text-amber-600 border border-amber-200"
                      }`}>
                        {prod.stock === 0 ? "Out of stock" : `${prod.stock} Left`}
                      </span>
                    </div>
                  </div>
                ))}

                {lowStockProducts.length === 0 && (
                  <div className="text-center py-6">
                    <div className="text-2xl mb-1">👍</div>
                    <p className="text-xs text-muted-foreground">All stocks healthy.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payouts Status */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary font-display">
                Recent Payouts
              </CardTitle>
              <CardDescription className="text-xs">
                Recent payouts processed to your bank.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3.5">
                {recentPayouts.map((pay) => (
                  <div key={pay.id} className="flex items-center justify-between gap-3 text-xs pb-3 border-b border-border/40 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-primary">
                        ₹{pay.amount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {pay.processedAt ? new Date(pay.processedAt).toLocaleDateString("en-IN") : "Pending"}
                      </p>
                    </div>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                      pay.status === "COMPLETED"
                        ? "bg-emerald-50 text-emerald-600"
                        : pay.status === "PENDING"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-rose-50 text-rose-600"
                    }`}>
                      {pay.status}
                    </span>
                  </div>
                ))}

                {recentPayouts.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No payout logs available.</p>
                )}
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
