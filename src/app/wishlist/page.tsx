"use client";

import Link from "next/link";
import { Heart, Trash2, ShoppingCart, ArrowRight, ArrowLeft } from "lucide-react";
import { useWishlistStore, useCartStore } from "@/store";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addItemToCart = useCartStore((state) => state.addItem);

  const handleMoveToCart = (item: any) => {
    addItemToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      stock: 10, // assume stock is healthy from wishlist quick-add
      sellerName: item.sellerName,
    });
    
    // Optional: remove from wishlist once moved to cart
    removeItem(item.productId);
    toast.success(`${item.name} moved to shopping bag!`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <h2 className="font-display text-4xl font-bold text-primary tracking-tight mb-8">
          My Wishlist
        </h2>

        {items.length === 0 ? (
          /* Empty Wishlist State */
          <div className="bg-card border border-border/60 rounded-3xl py-24 text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 bg-warm-100 rounded-full flex items-center justify-center mx-auto text-muted-foreground text-3xl">
              ❤️
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-bold text-xl text-primary">
                Your wishlist is empty
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Keep track of items you love by clicking the heart icon on products.
              </p>
            </div>
            <Link href="/products" className="inline-block">
              <Button className="shadow-warm font-bold text-background gap-1.5 px-6">
                Explore Products
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 animate-fade-in">
            {items.map((item) => (
              <div
                key={item.productId}
                className="group relative bg-card rounded-2xl border border-border/80 overflow-hidden shadow-card hover:shadow-warm transition-all duration-300 flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative aspect-square w-full bg-warm-50 overflow-hidden">
                  <Link href={`/products/${item.productId}`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="object-cover object-center w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="absolute top-3.5 right-3.5 z-10 w-8.5 h-8.5 rounded-full bg-white/90 backdrop-blur-sm border border-border/60 flex items-center justify-center text-muted-foreground hover:text-[#C0392B] shadow-sm hover:scale-105 transition-all"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-accent uppercase tracking-wider block mb-1">
                      {item.sellerName}
                    </span>
                    <h3 className="font-display font-bold text-base text-primary line-clamp-2 hover:text-accent transition-colors">
                      <Link href={`/products/${item.productId}`}>{item.name}</Link>
                    </h3>
                  </div>

                  {/* Bottom Action Grid */}
                  <div className="pt-4 border-t border-border/40 mt-4 flex items-center justify-between">
                    <span className="text-base font-bold text-primary">
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>

                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-background hover:bg-primary-dark hover:scale-105 active:scale-95 shadow-warm text-xs font-bold transition-all text-[#F8F1E9]"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-[#F8F1E9]" />
                      Add to Bag
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
