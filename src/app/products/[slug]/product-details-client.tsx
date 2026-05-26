"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, ShieldCheck, Truck, RefreshCw, Star, Sparkles, MapPin, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useCartStore, useWishlistStore } from "@/store";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { submitProductReview } from "../actions";

interface ProductDetailsClientProps {
  product: any;
  userId?: string | null;
  username?: string | null;
}

export default function ProductDetailsClient({
  product,
  userId,
  username,
}: ProductDetailsClientProps) {
  const { id, name, description, price, comparePrice, images, stock, avgRating, reviewCount, seller, category, pincode: productPincode } = product;

  // Zustand states
  const addItemToCart = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggle);
  const isWishlisted = useWishlistStore((state) => state.isWishlisted(id));

  // Gallery State
  const [activeImage, setActiveImage] = useState(images?.[0] || "/placeholder-product.jpg");

  // Quantity State
  const [quantity, setQuantity] = useState(1);

  // Hyperlocal Pincode Checker state
  const [checkPincode, setCheckPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<{
    checked: boolean;
    available: boolean;
    message: string;
  } | null>(null);

  // New Review state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const discount = comparePrice && comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;

  const handleQuantityChange = (val: number) => {
    setQuantity(Math.max(1, Math.min(stock, val)));
  };

  const handleAddToCart = () => {
    if (stock <= 0) {
      toast.error("Sorry, this item is currently out of stock!");
      return;
    }

    // Add multiple quantities
    for (let i = 0; i < quantity; i++) {
      addItemToCart({
        productId: id,
        name,
        price,
        image: images?.[0] || "/placeholder-product.jpg",
        stock,
        sellerName: seller.shopName,
      });
    }

    toast.success(`Added ${quantity} x ${name} to your cart!`);
  };

  const handleWishlistToggle = () => {
    toggleWishlist({
      productId: id,
      name,
      price,
      image: images?.[0] || "/placeholder-product.jpg",
      sellerName: seller.shopName,
    });
    
    if (isWishlisted) {
      toast.info(`Removed from your wishlist.`);
    } else {
      toast.success(`Added to your wishlist!`);
    }
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkPincode.trim()) return;

    if (checkPincode.trim() === productPincode) {
      setPincodeStatus({
        checked: true,
        available: true,
        message: "Delivery Available! Immediate fulfillment from your local store (24 hours delivery).",
      });
    } else {
      setPincodeStatus({
        checked: true,
        available: false,
        message: "Standard courier shipping available (3-5 days delivery). Out-of-area local delivery charges may apply.",
      });
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error("You must sign in to leave a review.");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const result = await submitProductReview(id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      if (result.success) {
        toast.success("Thank you! Your review has been saved.");
        setReviewComment("");
        // Reload details (Next.js server component refresh)
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-12">
      
      {/* Product Detail Top Section (Images + Actions) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left: Product Images Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full bg-warm-50 rounded-[2rem] border overflow-hidden shadow-card">
            <img
              src={activeImage}
              alt={name}
              className="object-cover w-full h-full"
            />
            
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-accent text-background text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {images && images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden bg-warm-50 border shrink-0 transition-all ${
                    activeImage === img ? "border-accent ring-2 ring-accent/20" : "border-border/60 hover:border-accent"
                  }`}
                >
                  <img src={img} alt={`${name} thumbnail ${idx}`} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Text and Actions */}
        <div className="flex flex-col justify-between py-2">
          
          <div className="space-y-6">
            
            {/* Category and Vendor */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-accent uppercase tracking-wider">
                {category?.name}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary leading-tight">
                {name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground font-semibold">Store:</span>
                <span className="text-xs font-bold text-primary underline">
                  {seller.shopName}
                </span>
                <span className="text-xs text-muted-foreground">· ({product.city})</span>
              </div>
            </div>

            {/* Ratings Summary */}
            <div className="flex items-center gap-2 border-b border-border/40 pb-5">
              <StarRating rating={avgRating} size="md" />
              <span className="text-sm font-bold text-primary">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                ({reviewCount} customer reviews)
              </span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                ₹{price.toLocaleString("en-IN")}
              </span>
              {comparePrice && comparePrice > price && (
                <span className="text-base text-muted-foreground line-through font-semibold">
                  ₹{comparePrice.toLocaleString("en-IN")}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>

            {/* Pincode delivery check */}
            <div className="ai-container-glow p-5 rounded-2xl space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-accent-dark uppercase tracking-wide">
                <MapPin className="w-4.5 h-4.5 text-[#C4956A]" />
                Hyperlocal Delivery Check
              </div>
              
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter pincode (e.g. 302001)"
                  value={checkPincode}
                  onChange={(e) => setCheckPincode(e.target.value)}
                  className="input h-9.5 text-xs flex-1 bg-white border border-[#E8DDD0] focus:ring-1 focus:ring-[#C4956A]"
                />
                <Button type="submit" size="sm" className="btn-accent-premium h-9.5 px-4 font-bold text-background shadow-warm">
                  Check
                </Button>
              </form>

              {pincodeStatus && (
                <p className={`text-xs font-semibold leading-relaxed mt-2 ${
                  pincodeStatus.available ? "text-[#4A7C59]" : "text-[#8A5F3B]"
                }`}>
                  {pincodeStatus.message}
                </p>
              )}
            </div>

            {/* Quantity controls */}
            {stock > 0 && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-primary tracking-wide uppercase">
                  Quantity
                </span>
                <div className="flex items-center border border-border/80 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-10 h-10 flex items-center justify-center font-bold text-primary hover:bg-warm-100"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-primary">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center font-bold text-primary hover:bg-warm-100"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs font-semibold text-muted-foreground">
                  ({stock} available in stock)
                </span>
              </div>
            )}

            {/* Out of stock tag */}
            {stock <= 0 && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 font-bold text-sm text-center">
                This product is currently out of stock.
              </div>
            )}

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-border/40 w-full">
            <Button
              onClick={handleAddToCart}
              disabled={stock <= 0}
              className="flex-1 shadow-warm font-bold text-background gap-2 h-12 rounded-xl text-base"
            >
              <ShoppingCart className="w-5 h-5 text-[#F8F1E9]" />
              Add to Cart
            </Button>
            <Button
              onClick={handleWishlistToggle}
              variant="outline"
              className={`h-12 border-border font-bold gap-2 px-6 rounded-xl hover:bg-warm-100 ${
                isWishlisted ? "text-[#C0392B] border-rose-100" : ""
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-[#C0392B]" : ""}`} />
              {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
            </Button>
          </div>

        </div>

      </div>

      {/* Product Information Features */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-border/40">
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 bg-accent/15 text-accent rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-primary">Escrow Protection</h4>
            <p className="text-xs text-muted-foreground mt-1">Vendor receives payment only after successful delivery confirmation.</p>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 bg-accent/15 text-accent rounded-xl flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-primary">Local Fast Delivery</h4>
            <p className="text-xs text-muted-foreground mt-1">Local neighborhood shipping with average fulfillment under 24 hours.</p>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <div className="w-10 h-10 bg-accent/15 text-accent rounded-xl flex items-center justify-center shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-display font-bold text-sm text-primary">Easy Refunds</h4>
            <p className="text-xs text-muted-foreground mt-1">Raise digital refund requests within 7 days of package delivery.</p>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="pt-12 border-t border-border/40 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left 4 Cols: Review statistics and form */}
        <div className="lg:col-span-4 space-y-6">
          <div>
            <h3 className="font-display font-bold text-xl text-primary">
              Customer Reviews
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Read feedback from verified buyers.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-card border border-border/80 text-center space-y-2">
            <h4 className="text-4xl font-bold font-display text-primary">
              {avgRating.toFixed(1)}
            </h4>
            <div className="flex justify-center">
              <StarRating rating={avgRating} size="md" />
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {reviewCount} reviews
            </p>
          </div>

          {/* Write a review form */}
          <div className="bg-card p-5 rounded-2xl border border-border/80 space-y-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wide">
              Leave a Review
            </h4>

            {userId ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Your Rating
                  </span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none hover:scale-105 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${
                          star <= reviewRating ? "fill-amber-400 text-amber-400" : "fill-warm-200 text-warm-300"
                        }`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Your Review
                  </span>
                  <textarea
                    rows={4}
                    placeholder="Tell other buyers about this product..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="input w-full resize-none text-xs py-2 bg-background"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="w-full shadow-warm font-semibold text-background h-9 text-xs"
                >
                  {isSubmittingReview ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sign in with your buyer account to publish ratings and reviews.
                </p>
                <Link href={`/auth/signin?callbackUrl=/products/${product.slug}`}>
                  <Button variant="outline" size="sm" className="w-full text-xs border-border hover:bg-warm-100 font-bold">
                    Sign In to Review
                  </Button>
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Right 8 Cols: Reviews List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="divide-y divide-border/60 bg-card rounded-2xl border border-border/80 px-6 py-4 shadow-sm">
            {product.reviews.map((rev: any) => (
              <div key={rev.id} className="py-5 first:pt-2 last:pb-2 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent/25 text-accent-dark flex items-center justify-center font-bold text-xs border border-accent/20">
                      {rev.user.name ? rev.user.name[0].toUpperCase() : "U"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-primary">{rev.user.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <StarRating rating={rev.rating} size="sm" />
                </div>
                
                {rev.comment && (
                  <p className="text-xs text-muted-foreground leading-relaxed pl-10">
                    &ldquo;{rev.comment}&rdquo;
                  </p>
                )}
              </div>
            ))}

            {product.reviews.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-sm">No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
