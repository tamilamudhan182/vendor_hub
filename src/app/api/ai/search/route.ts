import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateAiContent } from "@/lib/gemini";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query || !query.trim()) {
      return NextResponse.json({ products: [], reasoning: "No query provided" });
    }

    // Fetch categories to let Gemini match the category slug
    const categories = await db.category.findMany({
      where: { isActive: true },
      select: { slug: true, name: true },
    });

    const categoryListStr = categories.map((c) => `${c.name} (${c.slug})`).join(", ");

    const fallbackResponse = {
      extractedKeywords: query.split(" ").filter((k) => k.length > 2),
      categorySlug: null,
      reasoning: `Searching database directly for terms matching "${query}".`,
    };

    const prompt = `
You are an e-commerce semantic search optimizer for VendorHub.
The user is asking: "${query}"

Here are the active product categories on VendorHub:
${categoryListStr}

Analyze the user's query intent:
1. Identify the most relevant category slug (e.g., 'groceries-kirana', 'handmade-crafts', 'fashion', 'electronics', 'home-kitchen', 'beauty-wellness', 'stationery-books', 'food-beverages') or return null if it spans multiple categories or is a general query.
2. Extract 3-5 core search keywords (in English) that describe the items they want.
3. Provide a brief 1-sentence reasoning (reasoning) summarizing their search intent.

Format your output strictly as a JSON object with keys:
{
  "extractedKeywords": ["keyword1", "keyword2", ...],
  "categorySlug": "slug-name" or null,
  "reasoning": "string"
}
Do not return any markdown wraps or extra text. Return only the JSON object.
`;

    const aiTextResponse = await generateAiContent(prompt, fallbackResponse);

    let parsedResult = fallbackResponse;
    try {
      const cleanJson = aiTextResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      parsedResult = JSON.parse(cleanJson);
    } catch (parseError) {
      console.warn("Failed to parse search AI response, using fallback:", parseError);
    }

    // Now, query the database using the AI's understanding
    const keywords = parsedResult.extractedKeywords || [];
    const categorySlug = parsedResult.categorySlug;

    // Build Prisma query clauses
    const whereClause: any = {
      isActive: true,
    };

    if (categorySlug) {
      const category = categories.find((c) => c.slug === categorySlug);
      if (category) {
        whereClause.category = { slug: categorySlug };
      }
    }

    // If keywords are extracted, search in product name, description, tags
    if (keywords.length > 0) {
      whereClause.OR = keywords.flatMap((kw: string) => [
        { name: { contains: kw, mode: "insensitive" } },
        { description: { contains: kw, mode: "insensitive" } },
        { tags: { has: kw.toLowerCase() } },
      ]);
    }

    // Query products
    const products = await db.product.findMany({
      where: whereClause,
      include: {
        seller: {
          select: { shopName: true },
        },
      },
      take: 20,
    });

    return NextResponse.json({
      products,
      reasoning: parsedResult.reasoning,
      keywords,
      categorySlug,
    });

  } catch (error: any) {
    console.error("AI Search error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
