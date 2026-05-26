import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { generateAiContent } from "@/lib/gemini";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    // Fetch up to 12 popular/active products as catalog context
    const catalog = await db.product.findMany({
      where: { isActive: true },
      include: {
        category: {
          select: { name: true },
        },
        seller: {
          select: { shopName: true },
        },
      },
      orderBy: [{ salesCount: "desc" }, { viewCount: "desc" }],
      take: 12,
    });

    const catalogListStr = catalog
      .map((p) => `- ID: ${p.id}, Name: ${p.name}, Category: ${p.category.name}`)
      .join("\n");

    const fallbackRecommendations = catalog.slice(0, 4);

    if (!session) {
      // Not logged in -> return popular items as fallback
      return NextResponse.json({
        products: fallbackRecommendations,
        reasoning: "Showing popular items based on overall store sales.",
      });
    }

    const userId = session.user.id;

    // Fetch user's browsing history
    const history = await db.browsingHistory.findMany({
      where: { userId },
      include: {
        product: {
          select: { name: true, category: { select: { name: true } } },
        },
      },
      orderBy: { viewedAt: "desc" },
      take: 5,
    });

    // Fetch user's past orders
    const orders = await db.order.findMany({
      where: { userId, paymentStatus: "PAID" },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, category: { select: { name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });

    if (history.length === 0 && orders.length === 0) {
      // Empty history -> return popular items
      return NextResponse.json({
        products: fallbackRecommendations,
        reasoning: "Welcome to VendorHub! Here are some trending products in your area.",
      });
    }

    const historySummary = history
      .map((h) => `- Viewed: ${h.product.name} (Category: ${h.product.category.name})`)
      .join("\n");

    const ordersSummary = orders
      .flatMap((o) => o.items.map((i) => `- Bought: ${i.product.name}`))
      .join("\n");

    const prompt = `
You are a smart e-commerce recommendation system for VendorHub.
Suggest up to 4 recommended product IDs for this user based on their shopping context.

User's Recent Browsing History:
${historySummary || "No browsing history yet."}

User's Past Orders:
${ordersSummary || "No past orders yet."}

Platform Catalog Products (available for recommendation):
${catalogListStr}

Tasks:
1. Select up to 4 product IDs from the Catalog list that best align with the user's interests.
2. Provide a 1-sentence reasoning (reasoning) explaining why these recommendations are personalized.

Format your output strictly as a JSON object with keys:
{
  "recommendedProductIds": ["id1", "id2", ...],
  "reasoning": "string"
}
Do not return any markdown wraps or explain anything outside the JSON. Return only the JSON object.
`;

    const aiTextResponse = await generateAiContent(
      prompt,
      {
        recommendedProductIds: fallbackRecommendations.map((p) => p.id),
        reasoning: "Personalized suggestions based on your viewed items.",
      }
    );

    let parsedResult = { recommendedProductIds: [], reasoning: "" };
    try {
      const cleanJson = aiTextResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      parsedResult = JSON.parse(cleanJson);
    } catch (parseError) {
      console.warn("Failed to parse recommendation AI output, using fallback:", parseError);
      return NextResponse.json({
        products: fallbackRecommendations,
        reasoning: "Showing popular items based on store trends.",
      });
    }

    const recommendedProductIds = parsedResult.recommendedProductIds || [];

    // Fetch the full details of recommended products
    const recommendedProducts = await db.product.findMany({
      where: {
        id: { in: recommendedProductIds },
        isActive: true,
      },
      include: {
        seller: {
          select: { shopName: true },
        },
      },
    });

    // Ensure we have at least some products returned, otherwise fallback
    const finalProducts = recommendedProducts.length > 0 ? recommendedProducts : fallbackRecommendations;

    return NextResponse.json({
      products: finalProducts,
      reasoning: parsedResult.reasoning || "Personalized suggestions based on your viewed items.",
    });

  } catch (error: any) {
    console.error("AI Recommendations Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
