"use client";

import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import ProductCard from "@/components/product-card";
import { Card } from "@/components/ui/card";

export default function PersonalizedRecommendations() {
  const [products, setProducts] = useState<any[]>([]);
  const [reasoning, setReasoning] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch("/api/ai/recommendations");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setProducts(data.products || []);
        setReasoning(data.reasoning || null);
      } catch (error) {
        console.warn("Failed to fetch recommendations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-48 bg-warm-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-warm-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1 text-xs font-bold tracking-wider text-accent uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" />
            AI Recommended For You
          </span>
          <h3 className="font-display text-3xl font-bold text-primary">
            Inspired by Your Tastes
          </h3>
        </div>
        
        {reasoning && (
          <div className="bg-accent/10 border border-accent/20 px-4 py-2 rounded-xl text-xs text-accent-dark font-medium max-w-sm">
            💡 {reasoning}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 animate-fade-in">
        {products.map((prod) => (
          <ProductCard key={prod.id} product={prod} />
        ))}
      </div>
    </div>
  );
}
