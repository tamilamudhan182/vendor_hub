import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const isRealApiKey = apiKey && apiKey !== "your-gemini-api-key" && !apiKey.startsWith("xxxx");

// Initialize Gemini Client
let genAI: any = null;
if (isRealApiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.warn("Failed to initialize Gemini API client:", error);
  }
}

/**
 * Generate content using Gemini 1.5 Flash (or mock fallback if API key is invalid/missing)
 */
export async function generateAiContent(prompt: string, fallbackJson: any): Promise<string> {
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text;
    } catch (error) {
      console.error("Gemini API call failed, falling back to mock response:", error);
    }
  }

  // Graceful simulated delay to mimic network latency
  await new Promise((resolve) => setTimeout(resolve, 800));
  return typeof fallbackJson === "string" ? fallbackJson : JSON.stringify(fallbackJson);
}
