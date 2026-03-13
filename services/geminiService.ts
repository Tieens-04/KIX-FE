
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SearchResult } from "../types";

export const searchSneakers = async (query: string): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for high-quality sneaker information, reviews, and availability for: ${query}. Provide a concise summary and clear recommendations.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No summary available.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      text,
      sources: chunks.map((chunk: any) => ({
        web: chunk.web ? {
          uri: chunk.web.uri,
          title: chunk.web.title,
        } : undefined,
      })).filter((s: any) => s.web),
    };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return {
      text: "I couldn't process your request at the moment. Please try searching for a specific model like 'Jordan 4 Retro'.",
      sources: [],
    };
  }
};
