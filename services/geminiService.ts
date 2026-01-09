import { GoogleGenAI } from "@google/genai";
import { SERVICES } from '../constants';
import { Service } from '../types';

// Initializing the GenAI client.
const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenAI(apiKey || 'PLACEHOLDER');

const generateSystemInstruction = (services: Service[]) => {
  const servicesContext = services.map(s =>
    `- ID: "${s.id}" | Nombre: "${s.name}" | Categoría: ${s.category} | Precio: $${s.price} | Desc: ${s.description}`
  ).join('\n');

  return `
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
};

export interface AIResponse {
  thought: string;
  chatResponse: string;
  recommendedServiceId: string | null;
}

export const getStylistAdvice = async (
  userMessage: string,
  signal?: AbortSignal,
  dynamicServices?: Service[]
): Promise<AIResponse> => {
  if (!apiKey || apiKey === 'PLACEHOLDER' || apiKey === 'PLACEHOLDER_API_KEY') {
    console.warn("Gemini API Key missing or invalid.");
    return {
      thought: "No API Key",
      chatResponse: "Lo siento, estoy en modo demostración y no tengo conexión al cerebro de IA configurada.",
      recommendedServiceId: null
    };
  }

  const systemInstruction = generateSystemInstruction(dynamicServices || SERVICES);

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 15000)
    );

    const apiCall = model.generateContent(userMessage);

    const result = await Promise.race([apiCall, timeoutPromise]) as any;
    const response = result.response;

    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

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