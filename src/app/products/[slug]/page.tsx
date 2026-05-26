import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Navbar from "@/components/navbar";
import ProductCard from "@/components/product-card";
import ProductDetailsClient from "./product-details-client";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!product) {
    return {
      title: "Product Not Found | VendorHub",
    };
  }

  return {
    title: `${product.name} | VendorHub`,
    description: product.description.substring(0, 160),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const session = await auth();

  // 1. Fetch Product details
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: { name: true, slug: true },
      },
      seller: {
        select: { id: true, shopName: true, shopDescription: true },
      },
      reviews: {
        include: {
          user: {
            select: { name: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  // 2. Capture Browsing History for recommendations (if logged in)
  if (session?.user?.id) {
    try {
      await db.browsingHistory.create({
        data: {
          userId: session.user.id,
          productId: product.id,
        },
      });
    } catch (error) {
      console.warn("Failed to log browsing history:", error);
    }
  }

  // 3. Fetch Related Products in same category
  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      isActive: true,
    },
    include: {
      seller: {
        select: { shopName: true },
      },
    },
    take: 4,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-dark tracking-wide uppercase group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Marketplace
          </Link>
        </div>

        {/* Product Details Component */}
        <ProductDetailsClient
          product={product}
          userId={session?.user?.id}
          username={session?.user?.name}
        />

        {/* Related Products Grid */}
        <div className="pt-20 border-t border-border/40 mt-20">
          <h3 className="font-display text-2xl font-bold text-primary mb-8">
            Customers Also Viewed
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
            {relatedProducts.length === 0 && (
              <p className="col-span-full text-xs text-muted-foreground text-center py-6">
                No similar products currently listed.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
