"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sparkles, Plus, X, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/app/seller/products/actions";
import { Button } from "@/components/ui/button";

const ProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  comparePrice: z.coerce.number().optional().nullable(),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  sku: z.string().optional().nullable(),
  weight: z.coerce.number().optional().nullable(),
  tags: z.string().optional().nullable(),
});

interface ProductFormValues {
  name: string;
  categoryId: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  sku?: string | null;
  weight?: number | null;
  tags?: string | null;
}

interface ProductFormProps {
  categories: { id: string; name: string; slug: string }[];
  initialData?: any;
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [imageUrlInput, setImageUrlInput] = useState("");
  
  // AI pricing suggestion state
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<{
    suggestedPrice: number;
    comparePrice: number | null;
    reasoning: string;
  } | null>(null);

  // Simulated upload progress state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(ProductSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      categoryId: initialData?.categoryId || "",
      description: initialData?.description || "",
      price: initialData?.price || 0,
      comparePrice: initialData?.comparePrice || null,
      stock: initialData?.stock || 0,
      sku: initialData?.sku || "",
      weight: initialData?.weight || null,
      tags: initialData?.tags?.join(", ") || "",
    },
  });

  const selectedCategoryId = watch("categoryId");
  const productName = watch("name");
  const productDescription = watch("description");

  // AI Pricing Suggestion
  const handleSuggestPrice = async () => {
    if (!productName || !selectedCategoryId) {
      toast.error("Please enter a product name and select a category first.");
      return;
    }

    setIsAiLoading(true);
    setAiSuggestion(null);

    try {
      const res = await fetch("/api/ai/price-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: productName,
          categoryId: selectedCategoryId,
          description: productDescription,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch price suggestion");

      const data = await res.json();
      setAiSuggestion(data);
      toast.success("AI Price Suggestion loaded!");
    } catch (error) {
      toast.error("Failed to get price suggestion. Try again later.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    setValue("price", aiSuggestion.suggestedPrice);
    if (aiSuggestion.comparePrice) {
      setValue("comparePrice", aiSuggestion.comparePrice);
    }
    setAiSuggestion(null);
    toast.success("AI prices applied to fields.");
  };

  // Image Upload Simulation (graceful fallback)
  const handleSimulateUpload = () => {
    setIsUploading(true);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 100;
        }
        return prev + 20;
      });
    }, 150);

    setTimeout(() => {
      // Pick a random nice Unsplash image based on selected category, or generic
      const category = categories.find((c) => c.id === selectedCategoryId);
      const categorySlug = category?.slug || "product";
      
      const unspashCategoryImages: Record<string, string[]> = {
        "groceries-kirana": [
          "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
          "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80",
          "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&q=80",
        ],
        "handmade-crafts": [
          "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80",
          "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80",
          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        ],
        "electronics": [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
          "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80",
          "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
        ],
        "beauty-wellness": [
          "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&q=80",
          "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&q=80",
        ],
        "fashion": [
          "https://images.unsplash.com/photo-1620065404955-d3d36eb3ded0?w=800&q=80",
          "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&q=80",
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        ],
        "food-beverages": [
          "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80",
          "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80",
        ],
        "home-kitchen": [
          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
        ],
      };

      const presetList = unspashCategoryImages[categorySlug] || [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80",
      ];
      
      const randomUrl = presetList[Math.floor(Math.random() * presetList.length)];
      setImages((prev) => [...prev, randomUrl]);
      setIsUploading(false);
      toast.success("Simulated file uploaded successfully!");
    }, 1000);
  };

  const handleAddImageUrl = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!imageUrlInput.trim()) return;
    if (!imageUrlInput.startsWith("http")) {
      toast.error("Please enter a valid absolute image URL (starting with http/https).");
      return;
    }
    setImages((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
    toast.success("Image URL added.");
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const onSubmit = async (values: ProductFormValues) => {
    const formattedTags = values.tags
      ? values.tags.split(",").map((t) => t.trim()).filter((t) => t !== "")
      : [];

    const submissionData = {
      ...values,
      tags: formattedTags,
      images: images,
    };

    try {
      if (initialData) {
        // Edit Mode
        const res = await updateProduct(initialData.id, submissionData);
        if (res.success) {
          toast.success("Product updated successfully.");
          router.push("/seller/products");
        }
      } else {
        // Create Mode
        const res = await createProduct(submissionData);
        if (res.success) {
          toast.success("Product created successfully.");
          router.push("/seller/products");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save product.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 animate-fade-in max-w-4xl">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary font-display">
                Basic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Product Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary tracking-wide uppercase">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Handcrafted Terracotta Vase"
                  {...register("name")}
                  className={`input w-full ${errors.name ? "border-rose-400 focus:ring-rose-200" : ""}`}
                />
                {errors.name && (
                  <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
                )}
              </div>

              {/* Category Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary tracking-wide uppercase">
                  Category
                </label>
                <select
                  {...register("categoryId")}
                  className={`input w-full bg-white select-arrow ${
                    errors.categoryId ? "border-rose-400 focus:ring-rose-200" : ""
                  }`}
                >
                  <option value="">Select a category...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-xs text-rose-500 font-medium">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary tracking-wide uppercase">
                  Description
                </label>
                <textarea
                  rows={5}
                  placeholder="Tell buyers about your product's origins, ingredients, features, and sizes..."
                  {...register("description")}
                  className={`input w-full resize-none py-3 ${
                    errors.description ? "border-rose-400 focus:ring-rose-200" : ""
                  }`}
                />
                {errors.description && (
                  <p className="text-xs text-rose-500 font-medium">{errors.description.message}</p>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Pricing & Stock Card */}
          <Card variant="default">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold text-primary font-display">
                Pricing & Inventory
              </CardTitle>

              {/* AI Assistant button */}
              <button
                type="button"
                onClick={handleSuggestPrice}
                disabled={isAiLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/15 hover:bg-accent/25 text-accent-dark border border-accent/25 text-xs font-bold transition-all duration-300 disabled:opacity-50"
              >
                {isAiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                )}
                Suggest Price with AI
              </button>
            </CardHeader>
            
            <CardContent className="space-y-6">
              
              {/* AI Suggestion alert container */}
              {aiSuggestion && (
                <div className="p-4.5 rounded-2xl bg-accent/10 border border-accent/20 animate-fade-down space-y-3">
                  <div className="flex gap-2">
                    <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-accent-dark tracking-wide uppercase">
                        AI Price Recommendation
                      </h4>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-lg font-bold text-primary">
                          ₹{aiSuggestion.suggestedPrice}
                        </span>
                        {aiSuggestion.comparePrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{aiSuggestion.comparePrice}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {aiSuggestion.reasoning}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end pt-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setAiSuggestion(null)}
                      className="text-xs font-bold text-muted-foreground hover:bg-warm-100"
                    >
                      Dismiss
                    </Button>
                    <Button
                      type="button"
                      variant="accent"
                      size="sm"
                      onClick={applyAiSuggestion}
                      className="text-xs font-bold shadow-warm text-background"
                    >
                      Apply Recommended Prices
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Selling Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary tracking-wide uppercase">
                    Selling Price (INR)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="₹ 0.00"
                    {...register("price")}
                    className={`input w-full ${errors.price ? "border-rose-400 focus:ring-rose-200" : ""}`}
                  />
                  {errors.price && (
                    <p className="text-xs text-rose-500 font-medium">{errors.price.message}</p>
                  )}
                </div>

                {/* Compare Price */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary tracking-wide uppercase flex items-center gap-1">
                    Original Price (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="₹ 0.00"
                    {...register("comparePrice")}
                    className="input w-full"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Set a higher price to show a strikethrough sale.
                  </p>
                </div>

                {/* Stock Quantity */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary tracking-wide uppercase">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    {...register("stock")}
                    className={`input w-full ${errors.stock ? "border-rose-400 focus:ring-rose-200" : ""}`}
                  />
                  {errors.stock && (
                    <p className="text-xs text-rose-500 font-medium">{errors.stock.message}</p>
                  )}
                </div>

                {/* SKU */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary tracking-wide uppercase">
                    SKU (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PROD-SKU-100"
                    {...register("sku")}
                    className="input w-full"
                  />
                </div>

              </div>

            </CardContent>
          </Card>

          {/* Logistics & Meta Card */}
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary font-display">
                Logistics & Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Weight */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary tracking-wide uppercase">
                    Weight (kg, Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.0"
                    {...register("weight")}
                    className="input w-full"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary tracking-wide uppercase">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. handmade, organic, local"
                    {...register("tags")}
                    className="input w-full"
                  />
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Image upload area */}
        <div className="space-y-6">
          <Card variant="default">
            <CardHeader>
              <CardTitle className="text-base font-bold text-primary font-display">
                Product Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              
              {/* Thumbnails list */}
              <div className="grid grid-cols-2 gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl bg-warm-50 border overflow-hidden group">
                    <img src={img} alt="Product upload" className="object-cover w-full h-full" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-rose-600/90 text-white rounded-full flex items-center justify-center shadow hover:bg-rose-700 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-primary/80 backdrop-blur-[2px] text-background text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Upload Trigger Area */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleSimulateUpload}
                  disabled={isUploading}
                  className="w-full h-24 rounded-2xl border-2 border-dashed border-border/80 hover:border-accent/40 bg-warm-50/20 hover:bg-warm-100/30 flex flex-col items-center justify-center gap-1.5 transition-all text-muted-foreground disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="text-center space-y-1.5">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-accent" />
                      <p className="text-xs font-semibold text-accent">Uploading ({uploadProgress}%)</p>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-accent" />
                      <span className="text-xs font-bold text-primary">Upload Mock Image</span>
                      <span className="text-[10px] text-muted">Simulates secure UploadThing upload</span>
                    </>
                  )}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-border/60"></div>
                  <span className="flex-shrink mx-3 text-[10px] font-bold text-muted uppercase tracking-wider">Or</span>
                  <div className="flex-grow border-t border-border/60"></div>
                </div>

                {/* Paste URL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary tracking-wide uppercase">
                    Add Image by URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="input flex-1 h-9.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-3 h-9.5 rounded-lg bg-primary hover:bg-primary-dark text-background text-xs font-bold shadow-warm flex items-center justify-center shrink-0 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#F8F1E9]" />
                    </button>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>

      {/* Form Submission Action Buttons */}
      <div className="flex gap-4 justify-end border-t border-border/60 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/seller/products")}
          className="border-border hover:bg-warm-100 font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="shadow-warm font-bold text-background min-w-[120px]"
        >
          {isSubmitting ? (
            <Loader2 className="w-4.5 h-4.5 animate-spin" />
          ) : initialData ? (
            "Save Changes"
          ) : (
            "Publish Product"
          )}
        </Button>
      </div>

    </form>
  );
}
