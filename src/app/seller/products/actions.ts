"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function getUniqueSlug(name: string): Promise<string> {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let count = 1;

  while (true) {
    const existing = await db.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) break;
    slug = `${baseSlug}-${count}`;
    count++;
  }
  return slug;
}

export async function toggleProductStatus(productId: string) {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    throw new Error("Unauthorized");
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { sellerId: true, isActive: true },
  });

  if (!product || product.sellerId !== session.user.sellerId) {
    throw new Error("Product not found or unauthorized");
  }

  await db.product.update({
    where: { id: productId },
    data: { isActive: !product.isActive },
  });

  revalidatePath("/seller/products");
  revalidatePath("/products");
  revalidatePath("/");
  return { success: true };
}

export async function deleteProduct(productId: string) {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    throw new Error("Unauthorized");
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { sellerId: true },
  });

  if (!product || product.sellerId !== session.user.sellerId) {
    throw new Error("Product not found or unauthorized");
  }

  await db.product.delete({
    where: { id: productId },
  });

  revalidatePath("/seller/products");
  revalidatePath("/products");
  revalidatePath("/");
  return { success: true };
}

export async function createProduct(formData: {
  name: string;
  categoryId: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  sku?: string | null;
  weight?: number | null;
  tags: string[];
  images: string[];
}) {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    throw new Error("Unauthorized");
  }

  const sellerId = session.user.sellerId!;

  // Fetch seller user details for location sync
  const sellerUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { pincode: true, city: true },
  });

  const slug = await getUniqueSlug(formData.name);

  const product = await db.product.create({
    data: {
      sellerId,
      categoryId: formData.categoryId,
      name: formData.name,
      slug,
      description: formData.description,
      price: formData.price,
      comparePrice: formData.comparePrice || null,
      stock: formData.stock,
      sku: formData.sku || null,
      weight: formData.weight || null,
      tags: formData.tags,
      images: formData.images.length > 0 ? formData.images : ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"],
      pincode: sellerUser?.pincode || "302001",
      city: sellerUser?.city || "Jaipur",
    },
  });

  revalidatePath("/seller/products");
  revalidatePath("/products");
  revalidatePath("/");
  return { success: true, product };
}

export async function updateProduct(
  productId: string,
  formData: {
    name: string;
    categoryId: string;
    description: string;
    price: number;
    comparePrice?: number | null;
    stock: number;
    sku?: string | null;
    weight?: number | null;
    tags: string[];
    images: string[];
  }
) {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    throw new Error("Unauthorized");
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { sellerId: true, name: true, slug: true },
  });

  if (!product || product.sellerId !== session.user.sellerId) {
    throw new Error("Product not found or unauthorized");
  }

  // Generate new slug if name changed
  let slug = product.slug;
  if (product.name !== formData.name) {
    slug = await getUniqueSlug(formData.name);
  }

  const updatedProduct = await db.product.update({
    where: { id: productId },
    data: {
      categoryId: formData.categoryId,
      name: formData.name,
      slug,
      description: formData.description,
      price: formData.price,
      comparePrice: formData.comparePrice || null,
      stock: formData.stock,
      sku: formData.sku || null,
      weight: formData.weight || null,
      tags: formData.tags,
      images: formData.images.length > 0 ? formData.images : ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"],
    },
  });

  revalidatePath("/seller/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/products");
  revalidatePath("/");
  return { success: true, product: updatedProduct };
}
