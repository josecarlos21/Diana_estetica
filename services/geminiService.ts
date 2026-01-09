import { GoogleGenAI } from "@google/genai";
import { SERVICES } from '../constants';
import { Service } from '../types';

// Initializing the GenAI client lazily to avoid throwing at module load if apiKey is placeholder
const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;
let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
  if (!genAI && apiKey && apiKey !== 'PLACEHOLDER' && apiKey !== 'PLACEHOLDER_API_KEY') {
    genAI = new GoogleGenAI(apiKey);
  }
  return genAI;
};

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
  const activeGenAI = getGenAI();
  if (!activeGenAI) {
    return {
      thought: "No valid API Key detected",
      chatResponse: "Modo demo: IA no configurada.",
      recommendedServiceId: null
    };
  }

  const systemInstruction = generateSystemInstruction(dynamicServices || SERVICES);

  try {
    const model = (activeGenAI as any).getGenerativeModel({
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