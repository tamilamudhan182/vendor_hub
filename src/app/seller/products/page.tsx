import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Store } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import ProductList from "./product-list";

export default async function SellerProductsPage() {
  const session = await auth();

  if (!session || session.user.role !== "SELLER") {
    redirect("/auth/signin");
  }

  const sellerId = session.user.sellerId!;

  // Fetch all products for this seller
  const products = await db.product.findMany({
    where: { sellerId },
    include: {
      category: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-primary tracking-tight">
            Products
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Add, update, and manage products listed under your store.
          </p>
        </div>

        <Link href="/seller/products/new">
          <Button variant="default" className="shadow-warm font-semibold gap-1.5 h-10 px-5">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Product List Table Component */}
      <ProductList initialProducts={products} />

    </div>
  );
}
