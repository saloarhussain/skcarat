import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function getPersonalizedRecommendations(
  browsingHistory: Product[],
  allProducts: Product[]
): Promise<string[]> {
  if (browsingHistory.length === 0) return [];

  const historyNames = browsingHistory.map(p => p.name).join(', ');
  const productList = allProducts.map(p => ({ id: p.id, name: p.name, category: p.category, description: p.description }));

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Based on the user's browsing history: [${historyNames}], recommend 3 products from this list: ${JSON.stringify(productList)}. Return only the IDs of the recommended products as a JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const recommendedIds = JSON.parse(response.text || '[]');
    return recommendedIds;
  } catch (error) {
    console.error("Error getting recommendations:", error);
    return [];
  }
}
