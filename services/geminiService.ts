import { GoogleGenAI } from "@google/genai";
import { SERVICES } from '../constants';

// Initializing the GenAI client.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
// The @google/genai SDK takes an options object with apiKey
const ai = new GoogleGenAI({ apiKey: apiKey || 'PLACEHOLDER' });

const servicesContext = SERVICES.map(s =>
  `- ID: "${s.id}" | Nombre: "${s.name}" | Categoría: ${s.category} | Precio: $${s.price} | Desc: ${s.description}`
).join('\n');

const SYSTEM_INSTRUCTION = `
Eres "EstiloBot", el asesor experto de "DIANA STUDIO".
Tu objetivo es recomendar servicios del catálogo basados en las necesidades del cliente.

CATÁLOGO:
${servicesContext}

RESPUESTA (JSON):
{
  "thought": "Análisis interno rápido.",
  "chatResponse": "Respuesta breve y experta (max 180 caracteres). Usa **negritas** para énfasis.",
  "recommendedServiceId": "ID exacto del servicio o null."
}
`;

export interface AIResponse {
  thought: string;
  chatResponse: string;
  recommendedServiceId: string | null;
}

export const getStylistAdvice = async (userMessage: string, signal?: AbortSignal): Promise<AIResponse> => {
  if (!apiKey || apiKey === 'PLACEHOLDER' || apiKey === 'PLACEHOLDER_API_KEY') {
    console.warn("Gemini API Key missing or invalid.");
    return {
      thought: "No API Key",
      chatResponse: "Lo siento, estoy en modo demostración y no tengo conexión al cerebro de IA configurada.",
      recommendedServiceId: null
    };
  }

  try {
    // Race against a timeout to prevent infinite hanging
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 15000)
    );

    // Using the NEW SDK pattern: ai.models.generateContent
    const apiCall = ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const response = await Promise.race([apiCall, timeoutPromise]) as any;

    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    // In @google/genai, it's a getter response.text, not a function response.text()
    const text = response.text || "{}";
    return JSON.parse(text) as AIResponse;
  } catch (error: any) {
    if (error.name === 'AbortError' || (signal?.aborted)) {
      throw error;
    }

    console.error("AI Service Error:", error);

    return {
      thought: "Error de conexión o timeout",
      chatResponse: "Lo siento, el servicio está tardando demasiado o no responde. ¿Podrías intentarlo de nuevo?",
      recommendedServiceId: null
    };
  }
};