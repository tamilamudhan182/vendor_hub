"use client";

import Link from "next/link";
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { useCartStore } from "@/store";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, totalItems } = useCartStore();

  const cartSubtotal = subtotal();
  const deliveryCharge = cartSubtotal >= 499 || cartSubtotal === 0 ? 0 : 49;
  const grandTotal = cartSubtotal + deliveryCharge;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h2 className="font-display text-4xl font-bold text-primary tracking-tight mb-8">
          Shopping Bag
        </h2>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-card border border-border/60 rounded-3xl py-24 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 bg-warm-100 rounded-full flex items-center justify-center mx-auto text-muted-foreground text-3xl">
              👜
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-xl text-primary">
                Your shopping bag is empty
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Explore local products near you and add items to get started.
              </p>
            </div>
            <Link href="/products" className="inline-block">
              <Button className="shadow-warm font-bold text-background gap-1.5 px-6">
                Start Shopping
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          /* Cart Content Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-fade-in">
            
            {/* Left 8 Cols: Items List */}
            <div className="lg:col-span-8 bg-card rounded-2xl border border-border/80 shadow-card overflow-hidden">
              <div className="p-6 border-b border-border/60">
                <span className="text-xs font-bold text-primary tracking-wide uppercase">
                  Items ({totalItems()})
                </span>
              </div>
              
              <div className="divide-y divide-border/60 px-6">
                {items.map((item) => (
                  <div key={item.productId} className="py-6 flex items-center justify-between gap-4">
                    
                    {/* Thumbnail & Description */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-20 h-20 bg-warm-50 rounded-xl overflow-hidden border border-border/60 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display font-bold text-base text-primary truncate max-w-[180px] sm:max-w-[280px]">
                          {item.name}
                        </h4>
                        <p className="text-xs text-accent font-semibold mt-0.5">
                          {item.sellerName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                          ₹{item.price.toLocaleString("en-IN")} each
                        </p>
                      </div>
                    </div>

                    {/* Quantity Adjustment & Price Subtotal */}
                    <div className="flex items-center gap-6 shrink-0">
                      
                      {/* Quantity adjusting buttons */}
                      <div className="flex items-center border border-border/85 rounded-lg overflow-hidden bg-background">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center font-semibold text-primary hover:bg-warm-100 text-sm"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-primary">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center font-semibold text-primary hover:bg-warm-100 text-sm"
                        >
                          +
                        </button>
                      </div>

                      {/* Total price for product line */}
                      <div className="text-right w-24">
                        <p className="font-bold text-primary text-sm sm:text-base">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* Delete item button */}
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-muted hover:text-[#C0392B] rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>

                  </div>
                ))}
              </div>

              {/* Back to Shopping button */}
              <div className="p-6 border-t border-border/40 bg-warm-50/20">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-1 text-xs font-bold text-accent hover:text-accent-dark tracking-wide uppercase group"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                  Continue Shopping
                </Link>
              </div>

            </div>

            {/* Right 4 Cols: Order Summary */}
            <div className="lg:col-span-4 bg-card rounded-2xl border border-border/80 shadow-card p-6 space-y-6">
              
              <h3 className="font-display font-bold text-lg text-primary border-b border-border/60 pb-3">
                Order Summary
              </h3>

              <div className="space-y-3.5 text-sm">
                
                {/* Subtotal */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="font-bold text-primary">
                    ₹{cartSubtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between">
                  <span className="text-muted-foreground font-medium">Local Delivery</span>
                  <span className="font-bold text-primary">
                    {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                  </span>
                </div>
                {deliveryCharge > 0 && (
                  <p className="text-[10px] text-muted-foreground font-medium bg-[#F8F1E9]/50 p-2 rounded-lg">
                    💡 Add <span className="font-bold">₹{499 - cartSubtotal}</span> more to unlock <span className="text-emerald-600 font-bold">FREE Delivery</span>!
                  </p>
                )}

                {/* Total */}
                <div className="flex justify-between pt-4 border-t border-border/60 text-base">
                  <span className="font-bold text-primary font-display">Total</span>
                  <span className="font-bold text-primary font-display text-lg">
                    ₹{grandTotal.toLocaleString("en-IN")}
                  </span>
                </div>

              </div>

              {/* Checkout Button */}
              <Link href="/checkout" className="block">
                <Button className="w-full h-12 btn-premium font-bold text-background text-base rounded-xl gap-2 group">
                  Proceed to Checkout
                  <ArrowRight className="w-4.5 h-4.5 ml-0.5 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>

              <div className="text-[10px] text-muted-foreground text-center font-medium leading-relaxed">
                🛡️ Pay securely with Razorpay checkout sandbox. Orders protected by buyer escrow.
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
