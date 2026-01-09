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

export interface ClientProfile {
  hairType: string;         // e.g., "Lacio", "Rizado", "Ondulado"
  scalpCondition: string;   // e.g., "Graso", "Seco", "Normal", "Caspa"
  hairGoal: string;         // e.g., "Volumen", "Alisado", "Color"
  recommendedFrequency: string; // e.g., "Mensual", "Bimestral"
}

export interface AIResponse {
  thought: string;
  chatResponse: string;
  recommendedServiceId: string | null;
  updatedProfile?: ClientProfile;
  suggestedOptions?: string[]; // New field for guided interaction
}

const generateSystemInstruction = (services: Service[], currentProfile?: ClientProfile) => {
  const servicesContext = services.map(s =>
    `- ID: "${s.id}" | Nombre: "${s.name}" | Categoría: ${s.category} | Precio: $${s.price} | Desc: ${s.description}`
  ).join('\n');

  const profileContext = currentProfile ? `
  PERFIL ACTUAL DEL CLIENTE (Actualiza si hay nuevos datos):
  - Tipo: ${currentProfile.hairType}
  - Condición: ${currentProfile.scalpCondition}
  - Objetivo: ${currentProfile.hairGoal}
  ` : 'PERFIL DEL CLIENTE: Aún no identificado.';

  return `
Eres "EstiloBot", el asesor experto de "DIANA STUDIO", un salón de alta gama.
Tu objetivo es doble:
1. Recomendar servicios del catálogo basados en las necesidades.
2. CONSTRUIR UN PERFIL TÉCNICO del cliente extrayendo datos de la charla (Tipo de cabello, Condición, Objetivo).

CATÁLOGO:
${servicesContext}

${profileContext}

INSTRUCCIONES CLAVE:
- NO permitas que el usuario escriba libremente. DEBES proveer "suggestedOptions" para guiar la respuesta.
- Si falta el Tipo de Cabello, ofrece opciones como: ["Lacio", "Ondulado", "Rizado"].
- Si falta la Condición, ofrece: ["Seco", "Graso", "Normal", "Con Caspa"].
- Si falta el Objetivo, ofrece: ["Volumen", "Alisado", "Hidratación", "Color", "Corte"].
- Sé amable, profesional y usa emojis elegantes (✨, 💆‍♀️).

RESPUESTA (JSON):
{
  "thought": "Breve razonamiento.",
  "chatResponse": "Tu respuesta al cliente (max 200 caracteres). Usa **negritas**.",
  "recommendedServiceId": "ID del servicio o null.",
  "updatedProfile": {
    "hairType": "Lacio/Ondulado/Rizado o 'No identificado'",
    "scalpCondition": "Seco/Graso/Normal o 'No identificado'",
    "hairGoal": "Objetivo/No identificado",
    "recommendedFrequency": "Frecuencia sugerida/Por definir"
  },
  "suggestedOptions": ["Opción 1", "Opción 2", "Opción 3"]
}
`;
};

export const getStylistAdvice = async (
  userMessage: string,
  signal?: AbortSignal,
  dynamicServices?: Service[],
  currentProfile?: ClientProfile
): Promise<AIResponse> => {
  const activeGenAI = getGenAI();
  if (!activeGenAI) {
    return {
      thought: "Modo Demo: Simulación de flujo",
      chatResponse: "Modo Demo: Hola, soy EstiloBot. ¿Cómo describirías tu tipo de cabello?",
      recommendedServiceId: null,
      updatedProfile: undefined,
      suggestedOptions: ["Lacio", "Ondulado", "Rizado", "Afro"]
    };
  }

  const systemInstruction = generateSystemInstruction(dynamicServices || SERVICES, currentProfile);

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
    const parsed = JSON.parse(text);

    return {
      thought: parsed.thought || '',
      chatResponse: parsed.chatResponse || 'Lo siento, no pude procesar eso.',
      recommendedServiceId: parsed.recommendedServiceId || null,
      updatedProfile: parsed.updatedProfile || undefined,
      suggestedOptions: parsed.suggestedOptions || []
    };

  } catch (error: any) {
    if (error.name === 'AbortError' || (signal?.aborted)) {
      throw error;
    }

    console.error("AI Service Error:", error);

    return {
      thought: "Error de conexión o timeout",
      chatResponse: "Lo siento, el servicio está tardando demasiado. ¿Podemos intentar de nuevo?",
      recommendedServiceId: null,
      suggestedOptions: ["Reintentar"]
    };
  }
};