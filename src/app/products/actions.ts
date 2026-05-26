"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function submitProductReview(productId: string, data: {
  rating: number;
  comment?: string;
}) {
  const session = await auth();
  if (!session) {
    throw new Error("You must be logged in to leave a review.");
  }

  const userId = session.user.id;

  // Create or update review
  const existingReview = await db.review.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingReview) {
    await db.review.update({
      where: { id: existingReview.id },
      data: {
        rating: data.rating,
        comment: data.comment || "",
        isVerified: true,
      },
    });
  } else {
    await db.review.create({
      data: {
        userId,
        productId,
        rating: data.rating,
        comment: data.comment || "",
        isVerified: true,
      },
    });
  }

  // Recalculate average rating for the product
  const reviews = await db.review.findMany({
    where: { productId },
    select: { rating: true },
  });

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  
  await db.product.update({
    where: { id: productId },
    data: {
      avgRating: parseFloat(avgRating.toFixed(1)),
      reviewCount: reviews.length,
    },
  });

  revalidatePath(`/products`);
  revalidatePath(`/`);
  return { success: true };
}
