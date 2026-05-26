"use client";

import { useState } from "react";
import { Truck, Check, Package, XCircle, ArrowRight, MapPin, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { updateOrderItemStatus } from "./actions";
import { Button } from "@/components/ui/button";

interface SellerOrderListProps {
  initialItems: any[];
}

export default function SellerOrderList({ initialItems }: SellerOrderListProps) {
  const [items, setItems] = useState(initialItems);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleUpdateStatus = async (itemId: string, newStatus: any) => {
    setIsUpdating(itemId);
    try {
      const result = await updateOrderItemStatus(itemId, newStatus);
      if (result.success) {
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
        );
        toast.success(`Order item status updated to ${newStatus}.`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update order status.");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border/80 overflow-hidden shadow-card animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-warm-50/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <th className="px-6 py-4">Product Details</th>
              <th className="px-6 py-4">Buyer & Delivery Address</th>
              <th className="px-6 py-4">Total Price</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Fulfillment Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-sm">
            {items.map((item) => {
              const imageUrl = item.product.images?.[0] || "/placeholder-product.jpg";
              const order = item.order;

              return (
                <tr key={item.id} className="hover:bg-warm-50/20 transition-colors align-top">
                  
                  {/* Product details */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg bg-warm-50 overflow-hidden border shrink-0">
                        <img src={imageUrl} alt={item.product.name} className="object-cover w-full h-full" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-primary truncate max-w-[180px]">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Qty: {item.quantity} · price: ₹{item.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Buyer & Address info */}
                  <td className="px-6 py-4 max-w-[280px]">
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5 font-bold text-primary">
                        <User className="w-3.5 h-3.5 text-accent shrink-0" />
                        <span>{order.shippingName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-muted shrink-0" />
                        <span>{order.shippingPhone}</span>
                      </div>
                      <div className="flex items-start gap-1.5 font-medium leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
                        <span>
                          {order.shippingAddress}, {order.shippingCity}, {order.shippingState} -{" "}
                          <span className="font-bold text-primary">{order.shippingPincode}</span>
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Total price for product line */}
                  <td className="px-6 py-4 font-bold text-primary pt-6">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4 pt-5.5">
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      item.status === "DELIVERED"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : item.status === "SHIPPED"
                        ? "bg-blue-50 text-blue-600 border border-blue-100"
                        : item.status === "CANCELLED"
                        ? "bg-rose-50 text-rose-600 border border-rose-100"
                        : "bg-warm-100 text-amber-600 border border-amber-200"
                    }`}>
                      {item.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
                      
                      {/* Transition: PENDING / CONFIRMED -> PROCESSING */}
                      {item.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          disabled={isUpdating === item.id}
                          onClick={() => handleUpdateStatus(item.id, "PROCESSING")}
                          className="bg-accent hover:bg-accent-dark text-background text-xs font-bold gap-1 shadow-sm h-8 px-3 rounded-lg"
                        >
                          <Package className="w-3.5 h-3.5" />
                          Process
                        </Button>
                      )}

                      {/* Transition: PROCESSING -> SHIPPED */}
                      {item.status === "PROCESSING" && (
                        <Button
                          size="sm"
                          disabled={isUpdating === item.id}
                          onClick={() => handleUpdateStatus(item.id, "SHIPPED")}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1 shadow-sm h-8 px-3 rounded-lg"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Ship Item
                        </Button>
                      )}

                      {/* Transition: SHIPPED -> DELIVERED */}
                      {item.status === "SHIPPED" && (
                        <Button
                          size="sm"
                          disabled={isUpdating === item.id}
                          onClick={() => handleUpdateStatus(item.id, "DELIVERED")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1 shadow-sm h-8 px-3 rounded-lg"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Deliver
                        </Button>
                      )}

                      {/* Cancel action */}
                      {item.status !== "DELIVERED" && item.status !== "CANCELLED" && (
                        <button
                          disabled={isUpdating === item.id}
                          onClick={() => handleUpdateStatus(item.id, "CANCELLED")}
                          className="text-xs font-bold text-[#C0392B] hover:underline hover:text-rose-700 p-2 border border-transparent hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      )}

                      {item.status === "DELIVERED" && (
                        <span className="text-xs text-muted-foreground font-semibold py-2">
                          Fulfillment Completed
                        </span>
                      )}

                    </div>
                  </td>

                </tr>
              );
            })}

            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center">
                  <div className="text-4xl mb-3">📥</div>
                  <h3 className="font-display font-bold text-lg text-primary">No orders placed yet</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    When customers buy your products, they will appear in this order queue for processing.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
