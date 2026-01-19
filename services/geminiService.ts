import { GoogleGenAI } from "@google/genai";

let client: GoogleGenAI | null = null;

// Initialize the client only when needed to access the key
const getClient = () => {
  // Directly access process.env.API_KEY as per environment assumption
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return client;
};

export const askPhysicsDoubt = async (question: string, context: string) => {
  try {
    const ai = getClient();
    if (!ai) {
      console.warn("Gemini API Key missing or client failed to initialize.");
      return "I'm currently offline. Please check your connection or API configuration.";
    }

    const model = 'gemini-3-flash-preview';
    const systemPrompt = `You are an expert high school Physics tutor for Class 12 students.
    You are helpful, encouraging, and concise.
    The student is currently viewing: "${context}".
    Answer their question specifically related to physics concepts.
    If the question is unrelated to physics or the course, politely steer them back to the topic.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: question,
      config: {
        systemInstruction: systemPrompt,
      }
    });

    return response.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error while processing your doubt. Please try again later.";
  }
};