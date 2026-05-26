"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Search, Sparkles, Star, X, MapPin } from "lucide-react";
import ProductCard from "@/components/product-card";
import { Button } from "@/components/ui/button";

interface ProductsClientProps {
  categories: { id: string; name: string; slug: string }[];
  initialProducts: any[];
  aiReasoning?: string | null;
  aiKeywords?: string[] | null;
}

export default function ProductsClient({
  categories,
  initialProducts,
  aiReasoning,
  aiKeywords,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State values initialized from URL search params
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [ai, setAi] = useState(searchParams.get("ai") === "true");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [rating, setRating] = useState(searchParams.get("rating") || "");
  const [pincode, setPincode] = useState(searchParams.get("pincode") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  // Keep search input synced with searchParams changes
  useEffect(() => {
    setSearch(searchParams.get("search") || "");
    setAi(searchParams.get("ai") === "true");
    setCategory(searchParams.get("category") || "");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setRating(searchParams.get("rating") || "");
    setPincode(searchParams.get("pincode") || "");
    setSort(searchParams.get("sort") || "newest");
  }, [searchParams]);

  // Apply filters by pushing new query string
  const handleApplyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (ai && search.trim()) params.set("ai", "true");
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (rating) params.set("rating", rating);
    if (pincode.trim()) params.set("pincode", pincode.trim());
    if (sort) params.set("sort", sort);

    router.push(`/products?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSearch("");
    setAi(false);
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setRating("");
    setPincode("");
    setSort("newest");
    router.push("/products");
  };

  const handleAiSearchToggle = () => {
    const newAi = !ai;
    setAi(newAi);
    
    // Auto-search if text exists
    if (search.trim()) {
      const params = new URLSearchParams(searchParams.toString());
      if (newAi) {
        params.set("ai", "true");
      } else {
        params.delete("ai");
      }
      router.push(`/products?${params.toString()}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Search & Header Bar */}
      <div className="mb-10 space-y-6">
        <div>
          <h2 className="font-display text-4xl font-bold text-primary tracking-tight">
            Marketplace
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Discover local products from verified storefronts in your area.
          </p>
        </div>

        {/* Top Search Controls */}
        <form onSubmit={handleApplyFilters} className="bg-card p-4 rounded-2xl border border-border/80 shadow-warm flex flex-col md:flex-row items-center gap-4">
          
          {/* Main search input */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder={
                ai
                  ? "Describe what you need (AI parses intent)..."
                  : "Search local products, brands, tags..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full h-11 pl-11 pr-24 rounded-xl border bg-background text-sm focus:outline-none transition-all duration-300 ${
                ai ? "border-accent focus:ring-1 focus:ring-accent" : "border-border/80 focus:border-accent"
              }`}
            />
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-muted-foreground" />
            
            {/* AI Assist Toggle */}
            <button
              type="button"
              onClick={handleAiSearchToggle}
              className={`absolute right-3 top-2 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                ai
                  ? "bg-accent/25 text-accent-dark border border-accent/20 animate-pulse"
                  : "bg-warm-100 hover:bg-warm-200 text-muted-foreground border border-transparent"
              }`}
            >
              <Sparkles className="w-3 h-3 text-accent" />
              AI Assist
            </button>
          </div>

          <div className="flex w-full md:w-auto items-center gap-3">
            {/* Pincode search filter */}
            <div className="relative flex-1 md:w-44">
              <input
                type="text"
                placeholder="Pincode (e.g. 302001)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-border/80 bg-background text-sm focus:outline-none focus:border-accent"
              />
              <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-accent" />
            </div>

            <Button type="submit" className="h-11 px-6 shadow-warm font-bold text-background">
              Search
            </Button>
          </div>

        </form>

        {/* AI Insight container if AI search was processed */}
        {aiReasoning && (
          <div className="p-4.5 rounded-2xl bg-accent/10 border border-accent/20 animate-fade-down flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-accent-dark tracking-wide uppercase">
                AI Smart Search Intent Insight
              </h4>
              <p className="text-xs text-primary mt-1 font-semibold leading-relaxed">
                &ldquo;{aiReasoning}&rdquo;
              </p>
              {aiKeywords && aiKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {aiKeywords.map((kw) => (
                    <span key={kw} className="text-[10px] font-bold px-2 py-0.5 bg-white text-accent-dark border border-accent/20 rounded">
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Filter Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          
          <div className="bg-card p-6 rounded-2xl border border-border/80 shadow-card">
            
            <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-accent" />
                <h3 className="font-display font-bold text-base text-primary">
                  Filters
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs font-bold text-accent hover:text-accent-dark"
              >
                Reset All
              </button>
            </div>

            <div className="space-y-6">
              
              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary tracking-wide uppercase">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input w-full bg-background select-arrow text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-primary tracking-wide uppercase">
                  Price Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min ₹"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="input w-full bg-background text-xs text-center"
                  />
                  <span className="text-muted-foreground text-xs font-medium">to</span>
                  <input
                    type="number"
                    placeholder="Max ₹"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="input w-full bg-background text-xs text-center"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-primary tracking-wide uppercase">
                  Customer Rating
                </label>
                <div className="space-y-1.5">
                  {[4, 3, 2].map((stars) => (
                    <label key={stars} className="flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={stars}
                        checked={rating === String(stars)}
                        onChange={() => setRating(String(stars))}
                        className="w-3.5 h-3.5 accent-accent"
                      />
                      <span className="flex items-center gap-1">
                        {stars}+ Stars
                        <span className="flex">
                          {Array.from({ length: stars }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                          ))}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            <Button
              onClick={() => handleApplyFilters()}
              className="w-full mt-8 shadow-warm font-semibold text-background"
            >
              Apply Filters
            </Button>

          </div>

        </aside>

        {/* Right Side: Product Grid & Sorting */}
        <section className="lg:col-span-9 space-y-6">
          
          {/* Results Summary & Sorting */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-4 rounded-xl border border-border/40 shadow-sm text-sm">
            <span className="text-muted-foreground font-medium">
              Showing <span className="text-primary font-bold">{initialProducts.length}</span> products
            </span>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-primary tracking-wide uppercase">
                Sort By
              </span>
              <select
                value={sort}
                onChange={(e) => {
                  const val = e.target.value;
                  setSort(val);
                  // Trigger redirect to apply sort immediately
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("sort", val);
                  router.push(`/products?${params.toString()}`);
                }}
                className="input h-9 py-0 pl-3 pr-8 bg-background select-arrow text-xs font-semibold"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
                <option value="sales">Popularity / Sales</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {initialProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>

          {initialProducts.length === 0 && (
            <div className="bg-card rounded-2xl border border-border/60 py-24 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-display font-bold text-xl text-primary">No products found</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                We couldn&apos;t find any items matching your filters. Try updating your keywords, choosing another category, or removing the pincode restrictions.
              </p>
              <Button onClick={handleClearFilters} variant="outline" className="mt-6 border-border hover:bg-warm-100 font-semibold">
                Clear All Filters
              </Button>
            </div>
          )}

        </section>

      </div>

    </div>
  );
}
