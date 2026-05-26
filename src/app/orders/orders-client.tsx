"use client";

import { useState } from "react";
import { Truck, CheckCircle2, Clock, AlertTriangle, AlertCircle, ArrowRight, CornerDownLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { submitRefundRequest } from "./actions";
import Link from "next/link";

interface OrdersClientProps {
  orders: any[];
}

export default function OrdersClient({ orders: initialOrders }: OrdersClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedRefundOrder, setSelectedRefundOrder] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);

  // Stepper timeline configurations
  const orderSteps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

  const getStepIndex = (status: string) => {
    return orderSteps.indexOf(status);
  };

  const handleRefundSubmit = async (orderId: string) => {
    if (!refundReason.trim()) {
      toast.error("Please enter a reason for your refund request.");
      return;
    }

    setIsSubmittingRefund(true);
    try {
      const res = await submitRefundRequest(orderId, refundReason);
      if (res.success) {
        toast.success("Refund request submitted successfully! Support will review it shortly.");
        
        // Update local order refund state
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  refund: {
                    status: "INITIATED",
                    reason: refundReason,
                    amount: o.total,
                  },
                }
              : o
          )
        );
        setSelectedRefundOrder(null);
        setRefundReason("");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit refund request.");
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-fade-in">
      <div>
        <h2 className="font-display text-4xl font-bold text-primary tracking-tight">
          My Orders
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          Track active shipments and view past order histories.
        </p>
      </div>

      {orders.length === 0 ? (
        /* Empty State */
        <div className="bg-card border border-border/60 rounded-3xl py-24 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-warm-100 rounded-full flex items-center justify-center mx-auto text-muted-foreground text-3xl">
            📦
          </div>
          <div className="space-y-1.5">
            <h3 className="font-display font-bold text-xl text-primary">
              No orders placed yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              You haven&apos;t placed any orders on VendorHub yet. Explore local shops to start.
            </p>
          </div>
          <Link href="/products" className="inline-block">
            <Button className="shadow-warm font-bold text-background gap-1.5 px-6">
              Go to Shop
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-6">
          {orders.map((order) => {
            const currentStepIdx = getStepIndex(order.status);
            const isCancelled = order.status === "CANCELLED";
            const isRefunded = order.status === "REFUNDED";

            return (
              <div
                key={order.id}
                className="bg-card rounded-3xl border border-border/80 shadow-card overflow-hidden"
              >
                
                {/* Header: Order Info */}
                <div className="p-6 border-b border-border/60 bg-warm-50/20 flex flex-wrap justify-between items-center gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Order ID
                    </p>
                    <p className="text-xs font-mono font-bold text-primary">{order.id}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Date Placed
                    </p>
                    <p className="text-xs font-semibold text-primary">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Total Amount
                    </p>
                    <p className="text-xs font-bold text-primary">
                      ₹{order.total.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="space-y-1 text-right">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-display">
                      Payment Status
                    </p>
                    <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      order.paymentStatus === "PAID"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : order.paymentStatus === "REFUNDED"
                        ? "bg-purple-50 text-purple-600 border border-purple-100"
                        : "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Body: Items List */}
                <div className="p-6 divide-y divide-border/40">
                  
                  {/* Stepper Timeline - Render only if not cancelled or refunded */}
                  {!isCancelled && !isRefunded ? (
                    <div className="pb-8 border-b border-border/40">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-6">
                        Delivery Timeline
                      </p>
                      
                      {/* Stepper */}
                      <div className="relative flex justify-between items-center max-w-2xl mx-auto">
                        
                        {/* Connecting Line */}
                        <div className="absolute left-0 right-0 top-3.5 h-[3px] bg-warm-200 -z-10" />
                        <div
                          className="absolute left-0 top-3.5 h-[3px] bg-accent transition-all duration-500 -z-10"
                          style={{
                            width: `${(currentStepIdx / (orderSteps.length - 1)) * 100}%`,
                          }}
                        />

                        {orderSteps.map((step, idx) => {
                          const completed = idx <= currentStepIdx;
                          const active = idx === currentStepIdx;

                          return (
                            <div key={step} className="flex flex-col items-center gap-1.5 shrink-0">
                              <div
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                                  completed
                                    ? "bg-accent border-accent text-background scale-105"
                                    : "bg-white border-warm-200 text-muted-foreground"
                                }`}
                              >
                                {completed ? (
                                  <CheckCircle2 className="w-4.5 h-4.5 text-[#F8F1E9]" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <span className={`text-[10px] font-bold tracking-wide transition-colors ${
                                active ? "text-accent-dark font-extrabold" : "text-muted-foreground font-semibold"
                              }`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}

                      </div>

                    </div>
                  ) : (
                    /* Cancelled or Refunded Banner */
                    <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-xs text-rose-800">
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                      <div>
                        <p className="font-bold uppercase tracking-wider">
                          Order {order.status}
                        </p>
                        <p className="mt-0.5 text-rose-700/80 font-medium">
                          This order has been {order.status.toLowerCase()} and is not active for delivery tracking.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Items loop */}
                  <div className="space-y-4 pt-6">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Items Ordered
                    </p>
                    
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center gap-4 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg bg-warm-50 overflow-hidden border shrink-0">
                            {item.product.images?.[0] ? (
                              <img src={item.product.images[0]} alt={item.product.name} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-primary line-clamp-1">{item.product.name}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Qty: {item.quantity} · Price: ₹{item.price.toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-primary text-xs shrink-0">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Refund Widget */}
                  <div className="pt-6 mt-6 flex flex-col gap-4 text-xs font-semibold">
                    
                    {order.refund ? (
                      /* Display existing refund status */
                      <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl flex items-start gap-3">
                        <CornerDownLeft className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-purple-700 uppercase tracking-wide">
                            Refund Status: {order.refund.status}
                          </p>
                          <p className="text-purple-600/80 mt-0.5">
                            Reason: &ldquo;{order.refund.reason}&rdquo;
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Clearance of ₹{order.refund.amount.toLocaleString("en-IN")} is under process.
                          </p>
                        </div>
                      </div>
                    ) : order.paymentStatus === "PAID" ? (
                      /* Request refund form toggler */
                      <div>
                        {selectedRefundOrder !== order.id ? (
                          <button
                            type="button"
                            onClick={() => setSelectedRefundOrder(order.id)}
                            className="text-xs font-bold text-accent hover:text-accent-dark flex items-center gap-1"
                          >
                            <CornerDownLeft className="w-4 h-4" />
                            Request Refund
                          </button>
                        ) : (
                          <div className="p-4 bg-warm-50 border border-border/80 rounded-2xl space-y-3.5 animate-fade-down">
                            <div>
                              <p className="font-bold text-primary text-xs">Request Order Refund</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                                Funds will return to your bank account sandbox upon admin approval.
                              </p>
                            </div>
                            
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-primary uppercase tracking-wide block">
                                Reason for Refund
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Received damaged product / Wrong item delivered..."
                                value={refundReason}
                                onChange={(e) => setRefundReason(e.target.value)}
                                className="input h-9.5 text-xs w-full bg-white"
                              />
                            </div>

                            <div className="flex gap-2 justify-end pt-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedRefundOrder(null);
                                  setRefundReason("");
                                }}
                                className="text-xs font-bold text-muted-foreground hover:bg-warm-100"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                variant="accent"
                                size="sm"
                                onClick={() => handleRefundSubmit(order.id)}
                                disabled={isSubmittingRefund}
                                className="text-xs font-bold shadow-warm text-background"
                              >
                                {isSubmittingRefund ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  "Confirm Request"
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : null}

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
