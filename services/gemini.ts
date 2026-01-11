
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getGeminiReply = async (userMessage: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: "You are a friendly friend in a chat app. Keep your replies concise and conversational, like a real person messaging on a phone.",
        temperature: 0.8,
      },
    });
    return response.text || "Sorry, I couldn't think of a reply.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to my brain right now!";
  }
};
