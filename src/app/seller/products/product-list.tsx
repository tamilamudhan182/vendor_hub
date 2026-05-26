"use client";

import Link from "next/link";
import { useState } from "react";
import { Edit2, Trash2, ToggleLeft, ToggleRight, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { toggleProductStatus, deleteProduct } from "./actions";

interface ProductListProps {
  initialProducts: any[];
}

export default function ProductList({ initialProducts }: ProductListProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleToggleStatus = async (id: string) => {
    try {
      const result = await toggleProductStatus(id);
      if (result.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
        );
        toast.success("Product visibility updated successfully.");
      }
    } catch (error) {
      toast.error("Failed to update product visibility.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      setIsDeleting(id);
      try {
        const result = await deleteProduct(id);
        if (result.success) {
          setProducts((prev) => prev.filter((p) => p.id !== id));
          toast.success("Product deleted successfully.");
        }
      } catch (error) {
        toast.error("Failed to delete product.");
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border/80 overflow-hidden shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-warm-50/50 border-b border-border text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <th className="px-6 py-4">Product</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-sm">
            {products.map((product) => {
              const imageUrl = product.images?.[0] || "/placeholder-product.jpg";
              const isLowStock = product.stock > 0 && product.stock <= 5;
              const isOutOfStock = product.stock === 0;

              return (
                <tr key={product.id} className="hover:bg-warm-50/20 transition-colors">
                  
                  {/* Product Details */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg bg-warm-50 overflow-hidden border border-border/60 shrink-0">
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-primary truncate max-w-[200px] sm:max-w-[300px]">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase">
                          SKU: {product.sku || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4 text-muted-foreground font-semibold">
                    {product.category?.name || "Uncategorized"}
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 font-bold text-primary">
                    ₹{product.price.toLocaleString("en-IN")}
                  </td>

                  {/* Stock Status */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className={`inline-block w-fit text-xs font-semibold ${
                        isOutOfStock
                          ? "text-rose-600 font-bold"
                          : isLowStock
                          ? "text-amber-600 font-bold"
                          : "text-muted-foreground"
                      }`}>
                        {product.stock} units
                      </span>
                      {isOutOfStock && (
                        <span className="text-[9px] text-rose-500 font-bold uppercase tracking-wider mt-0.5">
                          Out of Stock
                        </span>
                      )}
                      {isLowStock && (
                        <span className="text-[9px] text-amber-500 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-0.5">
                          <AlertCircle className="w-2.5 h-2.5" />
                          Low Stock
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status Toggle */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(product.id)}
                      className={`flex items-center gap-1 text-xs font-bold transition-colors ${
                        product.isActive 
                          ? "text-emerald-600 hover:text-emerald-700" 
                          : "text-muted hover:text-muted-foreground"
                      }`}
                      title={product.isActive ? "Click to deactivate" : "Click to activate"}
                    >
                      {product.isActive ? (
                        <>
                          <ToggleRight className="w-6 h-6 text-emerald-600" />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-6 h-6 text-muted" />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Action Buttons */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/seller/products/edit/${product.id}`}>
                        <button
                          className="p-2 rounded-lg bg-warm-50 hover:bg-warm-100 border border-border/40 text-primary transition-all duration-200"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </Link>

                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={isDeleting === product.id}
                        className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-100 text-[#C0392B] disabled:opacity-50 transition-all duration-200"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}

            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center">
                  <div className="text-4xl mb-3">📦</div>
                  <h3 className="font-display font-bold text-lg text-primary">No products listed</h3>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    You haven&apos;t added any products to your shop yet. Click &quot;Add Product&quot; to get started.
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
