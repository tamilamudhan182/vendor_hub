"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart, Eye, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useCartStore, useWishlistStore } from "@/store";
import { StarRating } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number | null;
    images: string[];
    stock: number;
    avgRating: number;
    reviewCount: number;
    seller: {
      shopName: string;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { id, name, slug, price, comparePrice, images, stock, avgRating, reviewCount, seller } = product;

  // Zustand stores
  const cartItems = useCartStore((state) => state.items);
  const addItemToCart = useCartStore((state) => state.addItem);
  
  const wishlistItems = useWishlistStore((state) => state.items);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(id));

  const imageUrl = images?.[0] || "/placeholder-product.jpg";
  const discount = comparePrice && comparePrice > price 
    ? Math.round(((comparePrice - price) / comparePrice) * 100) 
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (stock <= 0) {
      toast.error("Sorry, this item is out of stock!");
      return;
    }

    addItemToCart({
      productId: id,
      name,
      price,
      image: imageUrl,
      stock,
      sellerName: seller.shopName,
    });
    
    toast.success(`${name} added to cart!`);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist({
      productId: id,
      name,
      price,
      image: imageUrl,
      sellerName: seller.shopName,
    });
    
    if (isWishlisted) {
      toast.info(`Removed ${name} from your wishlist.`);
    } else {
      toast.success(`Added ${name} to your wishlist!`);
    }
  };

  return (
    <div className="group relative bg-card rounded-2xl border border-border/80 overflow-hidden shadow-card hover:border-accent/30 hover:shadow-warm-md hover:-translate-y-2 transition-all duration-500 flex flex-col h-full">
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full bg-warm-50 overflow-hidden">
        <Link href={`/products/${slug}`} className="block w-full h-full">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out"
            priority={false}
          />
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3.5 right-3.5 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm border flex items-center justify-center shadow-sm hover:scale-110 active:scale-90 hover:bg-white transition-all duration-200 ${
            isWishlisted 
              ? "text-[#C0392B] border-rose-100" 
              : "text-muted-foreground hover:text-foreground border-border/60"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4.5 h-4.5 ${isWishlisted ? "fill-[#C0392B]" : ""}`} />
        </button>

        {/* Discount Badge */}
        {discount > 0 && (
          <Badge className="absolute top-3.5 left-3.5 bg-gradient-to-r from-accent to-[#B07A4E] hover:from-accent hover:to-[#B07A4E] text-background border-none text-[10px] font-bold px-2.5 py-0.5 shadow-sm rounded-full">
            {discount}% OFF
          </Badge>
        )}

        {/* Stock Badge */}
        {stock <= 0 ? (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-destructive/10 text-destructive border border-destructive/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        ) : stock <= 5 ? (
          <Badge className="absolute bottom-3 left-3 bg-[#C0392B] hover:bg-[#C0392B] text-background border-none text-[9px] font-semibold tracking-wider uppercase px-2 py-0.5 shadow-sm">
            Only {stock} Left
          </Badge>
        ) : null}
      </div>

      {/* Product Info */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Vendor */}
        <div className="text-[11px] font-bold text-accent uppercase tracking-wider mb-1.5 truncate">
          {seller.shopName}
        </div>

        {/* Name */}
        <h3 className="font-display font-bold text-base text-primary mb-1.5 line-clamp-1 group-hover:text-accent transition-colors">
          <Link href={`/products/${slug}`}>{name}</Link>
        </h3>

        {/* Rating */}
        <div className="mb-3 flex items-center gap-1.5">
          <StarRating rating={avgRating} size="sm" />
          <span className="text-[11px] text-muted-foreground">({reviewCount})</span>
        </div>

        {/* Price & Add to Cart button */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/40">
          <div className="flex flex-col">
            {comparePrice && comparePrice > price && (
              <span className="text-xs text-muted-foreground line-through decoration-muted/40 font-semibold mb-0.5">
                ₹{comparePrice.toLocaleString("en-IN")}
              </span>
            )}
            <span className="text-base font-bold text-primary">
              ₹{price.toLocaleString("en-IN")}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={stock <= 0}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
              stock <= 0
                ? "bg-warm-100 text-muted/40 cursor-not-allowed border border-border/40"
                : "bg-primary text-background hover:bg-primary-dark hover:scale-105 active:scale-95 shadow-warm"
            }`}
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4 text-[#F8F1E9]" />
          </button>
        </div>
      </div>
    </div>
  );
}
