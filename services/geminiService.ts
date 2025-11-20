import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedFlashcardResponse } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFlashcardsFromText = async (text: string): Promise<GeneratedFlashcardResponse[]> => {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `Create a list of educational flashcards based on the following text. 
    Focus on key concepts, definitions, and important facts. 
    Return a JSON array where each object has a 'front' (question/term) and 'back' (answer/definition).
    
    Text to process:
    ${text}`;

    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING }
            },
            required: ["front", "back"]
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      if (Array.isArray(data)) {
        return data as GeneratedFlashcardResponse[];
      }
    }
    
    return [];
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
};