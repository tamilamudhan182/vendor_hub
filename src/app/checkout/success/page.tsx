import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Order Success",
  description: "Your order has been successfully placed.",
};

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const session = await auth();
  if (!session) {
    redirect("/auth/signin");
  }

  const { orderId } = await searchParams;

  if (!orderId) {
    redirect("/");
  }

  // Fetch order details
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: {
            select: { name: true, price: true, images: true },
          },
        },
      },
    },
  });

  if (!order || order.userId !== session.user.id) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="max-w-2xl w-full bg-card rounded-3xl border border-border/80 shadow-warm p-8 md:p-12 text-center space-y-8 animate-fade-in">
          
          {/* Animated Success Badge */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary">
              Order Confirmed!
            </h2>
            <p className="text-sm text-muted-foreground">
              Thank you for shopping local. Your payment of{" "}
              <span className="font-bold text-primary">₹{order.total.toLocaleString("en-IN")}</span> was
              received.
            </p>
          </div>

          {/* Order Details Panel */}
          <div className="bg-warm-50/50 p-6 rounded-2xl border border-border/60 text-left space-y-4">
            
            <div className="flex justify-between items-center border-b border-border/60 pb-3">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Order ID
                </p>
                <p className="text-xs font-mono font-semibold text-primary">{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Date
                </p>
                <p className="text-xs font-semibold text-primary">
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>

            {/* Items list summary */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium truncate max-w-[280px]">
                    {item.product.name} <span className="font-bold text-primary">x {item.quantity}</span>
                  </span>
                  <span className="font-bold text-primary">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Local Shipping Estimate */}
            <div className="flex gap-3 items-start pt-4 border-t border-border/60 bg-emerald-50/20 p-3 rounded-xl">
              <Truck className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-emerald-700">Hyperlocal Processing Initiated</p>
                <p className="text-[11px] text-emerald-600 mt-0.5 leading-relaxed">
                  We have notified the local stores to start packaging your products. Deliveries in{" "}
                  <span className="font-bold">{order.shippingPincode}</span> typically arrive within 24 hours.
                </p>
              </div>
            </div>

          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/orders" className="w-full sm:w-auto">
              <Button variant="default" className="w-full h-11 px-6 shadow-warm font-bold text-background gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[#F8F1E9]" />
                Track Order
              </Button>
            </Link>
            <Link href="/products" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full h-11 px-6 border-border hover:bg-warm-100 font-bold">
                Continue Shopping
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
