import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import ProductForm from "@/components/seller/product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await auth();

  if (!session || session.user.role !== "SELLER") {
    redirect("/auth/signin");
  }

  const { id } = await params;
  const sellerId = session.user.sellerId!;

  // Fetch the product details and ensure ownership
  const product = await db.product.findUnique({
    where: { id },
  });

  if (!product || product.sellerId !== sellerId) {
    redirect("/seller/products");
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
          Edit Product
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Modify the details, pricing, stock levels or images of your item.
        </p>
      </div>

      {/* Form Component */}
      <ProductForm categories={categories} initialData={product} />

    </div>
  );
}
