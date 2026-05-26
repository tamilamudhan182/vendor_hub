import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import ProductForm from "@/components/seller/product-form";

export default async function NewProductPage() {
  const session = await auth();

  if (!session || session.user.role !== "SELLER") {
    redirect("/auth/signin");
  }

  // Fetch active categories to populate dropdown
  const categories = await db.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h2 className="font-display text-3xl font-bold text-primary tracking-tight">
          Add New Product
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Publish a new item to your local storefront.
        </p>
      </div>

      {/* Form Component */}
      <ProductForm categories={categories} />

    </div>
  );
}
