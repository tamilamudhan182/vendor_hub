import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateAiContent } from "@/lib/gemini";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session || session.user.role !== "SELLER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, categoryId, description } = await req.json();

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Product name and category are required" },
        { status: 400 }
      );
    }

    // Fetch the category name
    const category = await db.category.findUnique({
      where: { id: categoryId },
      select: { name: true },
    });

    const categoryName = category?.name || "General";

    // Fetch similar products in the database to provide context
    const competitorProducts = await db.product.findMany({
      where: { categoryId, isActive: true },
      select: { name: true, price: true, description: true },
      take: 5,
    });

    const competitorDetails = competitorProducts
      .map((p) => `- Name: ${p.name}, Price: ₹${p.price}`)
      .join("\n");

    const averagePrice = competitorProducts.length > 0
      ? competitorProducts.reduce((sum, p) => sum + p.price, 0) / competitorProducts.length
      : 500; // default fallback if no products exist

    const fallbackResponse = {
      suggestedPrice: Math.round(averagePrice * 0.95), // 5% below average for competitive entry
      comparePrice: Math.round(averagePrice * 1.1),
      reasoning: `Based on similar products in the '${categoryName}' category (average price: ₹${Math.round(averagePrice)}), we recommend listing '${name}' at a competitive price of ₹${Math.round(averagePrice * 0.95)}. To attract buyers, you can set a strike-through original price of ₹${Math.round(averagePrice * 1.1)}, showing an attractive discount.`,
    };

    const prompt = `
You are a smart hyperlocal pricing analyst for an e-commerce platform called VendorHub.
Suggest an optimal listing price for a new product based on the following details:
Product Name: "${name}"
Category: "${categoryName}"
Description: "${description || "No description provided."}"

Competitor products in this category in our database:
${competitorDetails || "No competitor products currently listed in this category."}

Tasks:
1. Suggest a realistic listing price (suggestedPrice) in Indian Rupees (INR).
2. Suggest a comparePrice (original price, representing a strike-through, higher than the suggestedPrice) or null if no discount is recommended.
3. Provide a clear, short, professional retail reasoning (reasoning) explaining why this price is selected (referencing market positioning, value indicators in the description, and competitor pricing context).

Format your output strictly as a JSON object with keys:
{
  "suggestedPrice": number,
  "comparePrice": number or null,
  "reasoning": "string"
}
Do not return any markdown wraps or explain anything outside the JSON. Return only the JSON object.
`;

    const aiTextResponse = await generateAiContent(prompt, fallbackResponse);
    
    // Parse response
    try {
      // Strip markdown code block wraps if present
      const cleanJson = aiTextResponse
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      
      const parsedData = JSON.parse(cleanJson);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.warn("Failed to parse Gemini output as JSON, returning fallback:", parseError);
      return NextResponse.json(fallbackResponse);
    }

  } catch (error: any) {
    console.error("Price suggestion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
