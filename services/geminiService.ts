import { GoogleGenAI } from "@google/genai";
import { Manhua } from "../types";

// NOTE: In a real production app, we would proxy this or use the user's key if client-side.
// The user will be prompted to enter the key in the settings for this demo.

export const getGeminiRecommendation = async (
  apiKey: string,
  userQuery: string,
  availableManhuas: Manhua[]
): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  const ai = new GoogleGenAI({ apiKey });

  // Prepare context about the library
  const libraryContext = availableManhuas.map(m => 
    `- Title: ${m.title} (ID: ${m.id})
     - Genres: ${m.genre.join(', ')}
     - Description: ${m.description}
     - Status: ${m.status}`
  ).join('\n');

  const systemInstruction = `
    You are 'KurdManhua AI', a helpful and knowledgeable assistant for a Kurdish Manhua website.
    Your main language is Central Kurdish (Sorani).
    You are helpful, polite, and enthusiastic about Manhwa/Manhua.
    
    Here is the list of available Manhuas in our database:
    ${libraryContext}

    If the user asks for a recommendation, pick from this list if appropriate. 
    If the user asks about something not in the list, you can discuss it generally but mention it's not currently in our library.
    Keep answers concise (under 100 words) unless asked for details.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userQuery,
      config: {
        systemInstruction: systemInstruction,
      }
    });
    
    return response.text || "ببورە، ناتوانم وەڵام بدەمەوە لە ئێستادا.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "هەڵەیەک ڕوویدا لە پەیوەندی کردن بە زیرەکی دەستکرد.";
  }
};