import { Metadata } from "next";
import { db } from "@/lib/db";
import { generateAiContent } from "@/lib/gemini";
import Navbar from "@/components/navbar";
import ProductsClient from "./products-client";

export const metadata: Metadata = {
  title: "Products Marketplace",
  description: "Browse products from verified local sellers near you.",
};

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    ai?: string;
    minPrice?: string;
    maxPrice?: string;
    rating?: string;
    pincode?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  
  const search = params.search || "";
  const categorySlug = params.category || "";
  const ai = params.ai === "true";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const rating = params.rating ? parseFloat(params.rating) : undefined;
  const pincode = params.pincode || "";
  const sort = params.sort || "newest";

  // Fetch all active categories for the filter sidebar
  const categories = await db.category.findMany({
    where: { isActive: true },
    select: { id: true, name: true, slug: true },
    orderBy: { sortOrder: "asc" },
  });

  let products: any[] = [];
  let aiReasoning: string | null = null;
  let aiKeywords: string[] | null = null;

  // Build the initial Prisma query clauses
  const whereClause: any = {
    isActive: true,
  };

  // Price range filters
  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {};
    if (minPrice !== undefined) whereClause.price.gte = minPrice;
    if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
  }

  // Rating filter
  if (rating !== undefined) {
    whereClause.avgRating = { gte: rating };
  }

  // Pincode (local neighborhood) filter
  if (pincode.trim() !== "") {
    whereClause.pincode = pincode.trim();
  }

  // Category filter (if not overridden by AI search)
  if (categorySlug) {
    whereClause.category = { slug: categorySlug };
  }

  // Determine sorting
  let orderByClause: any = { createdAt: "desc" };
  if (sort === "price-asc") orderByClause = { price: "asc" };
  else if (sort === "price-desc") orderByClause = { price: "desc" };
  else if (sort === "rating") orderByClause = { avgRating: "desc" };
  else if (sort === "sales") orderByClause = { salesCount: "desc" };

  if (search.trim() !== "") {
    if (ai) {
      // ─── AI Semantic Search ────────────────────────────────────────────────
      try {
        const categoryListStr = categories.map((c) => `${c.name} (${c.slug})`).join(", ");
        const fallbackResponse = {
          extractedKeywords: search.split(" ").filter((k) => k.length > 2),
          categorySlug: null,
          reasoning: `Searching directly for terms matching "${search}".`,
        };

        const prompt = `
You are an e-commerce semantic search optimizer for VendorHub.
The user is asking: "${search}"

Here are the active product categories on VendorHub:
${categoryListStr}

Analyze the user's query intent:
1. Identify the most relevant category slug or return null if it spans multiple categories or is a general query.
2. Extract 3-5 core search keywords (in English) that describe the items they want.
3. Provide a brief 1-sentence reasoning (reasoning) summarizing their search intent.

Format your output strictly as a JSON object with keys:
{
  "extractedKeywords": ["keyword1", "keyword2", ...],
  "categorySlug": "slug-name" or null,
  "reasoning": "string"
}
Do not return any markdown wraps. Return only the JSON object.
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

        aiReasoning = parsedResult.reasoning;
        aiKeywords = parsedResult.extractedKeywords;

        // Override category search if AI identified a category slug
        if (parsedResult.categorySlug) {
          whereClause.category = { slug: parsedResult.categorySlug };
        }

        const keywords = parsedResult.extractedKeywords || [];
        if (keywords.length > 0) {
          whereClause.OR = keywords.flatMap((kw: string) => [
            { name: { contains: kw, mode: "insensitive" } },
            { description: { contains: kw, mode: "insensitive" } },
            { tags: { has: kw.toLowerCase() } },
          ]);
        }
      } catch (error) {
        console.error("AI search generation failed, falling back to standard search", error);
        // Fallback to standard search
        whereClause.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { tags: { has: search.toLowerCase() } },
        ];
      }
    } else {
      // ─── Standard Keyword Search ───────────────────────────────────────────
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }
  }

  // Execute database query
  products = await db.product.findMany({
    where: whereClause,
    include: {
      seller: {
        select: { shopName: true },
      },
      category: {
        select: { name: true, slug: true },
      },
    },
    orderBy: orderByClause,
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <ProductsClient
          categories={categories}
          initialProducts={products}
          aiReasoning={aiReasoning}
          aiKeywords={aiKeywords}
        />
      </div>
    </div>
  );
}
