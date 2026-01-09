import { useState, useCallback } from 'react';
import { ChatMessage, Service } from '../types';
import { getStylistAdvice, AIResponse, ClientProfile } from '../services/geminiService';
import { api } from '../services/api';

export interface ConsultationState {
    messages: ChatMessage[];
    clientProfile: ClientProfile;
    isLoading: boolean;
    exportData: () => void;
    sendMessage: (text: string, services: Service[]) => Promise<void>;
    resetConsultation: () => void;
}

const INITIAL_PROFILE: ClientProfile = {
    hairType: 'No identificado',
    scalpCondition: 'No identificado',
    hairGoal: 'No identificado',
    recommendedFrequency: 'Por definir'
};

export const useConsultation = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'model',
            text: 'Bienvenida a Diana Studio AI. Cuéntame sobre tu cabello o el look que buscas para iniciar tu diagnóstico avanzado.',
            timestamp: new Date()
        }
    ]);
    const [clientProfile, setClientProfile] = useState<ClientProfile>(INITIAL_PROFILE);
    const [isLoading, setIsLoading] = useState(false);

    const sendMessage = useCallback(async (text: string, services: Service[]) => {
        if (!text.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Pass the current profile context to refining it
            const aiData: AIResponse = await getStylistAdvice(text, undefined, services, clientProfile);

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: aiData.chatResponse,
                timestamp: new Date(),
                recommendedService: aiData.recommendedServiceId
                    ? services.find(s => s.id === aiData.recommendedServiceId)
                    : undefined,
                suggestedOptions: aiData.suggestedOptions
            };

            setMessages(prev => [...prev, botMsg]);

            // Update profile with new insights
            if (aiData.updatedProfile) {
                setClientProfile(prev => ({ ...prev, ...aiData.updatedProfile }));
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: "Lo siento, hubo un error procesando tu diagnóstico. Intenta de nuevo.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    }, [clientProfile]);

    const exportData = useCallback(async () => {
        // Save to Database
        try {
            await api.saveConsultation({
                profile: clientProfile,
                messages: messages
            });
        } catch (e) {
            console.error("Error saving to DB", e);
        }

        const headers = ['Rol', 'Mensaje', 'Fecha', 'Servicio Recomendado'];
        const csvContent = [
            `DIAGNOSTICO CAPILAR - DIANA STUDIO`,
            `Fecha: ${new Date().toLocaleDateString()}`,
            `Tipo de Cabello: ${clientProfile.hairType}`,
            `Condición: ${clientProfile.scalpCondition}`,
            `Objetivo: ${clientProfile.hairGoal}`,
            `Frecuencia: ${clientProfile.recommendedFrequency}`,
            '',
            headers.join(','),
            ...messages.map(m => {
                const date = m.timestamp.toLocaleString().replace(',', '');
                const cleanText = m.text.replace(/"/g, '""'); // Escape quotes
                const service = m.recommendedService?.name || '';
                return `${m.role},"${cleanText}",${date},"${service}"`;
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `diana-studio-consultation-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [messages, clientProfile]);

    const resetConsultation = () => {
        setMessages([{
            id: 'welcome',
            role: 'model',
            text: 'Bienvenida a Diana Studio AI. Cuéntame sobre tu cabello o el look que buscas para iniciar tu diagnóstico avanzado.',
            timestamp: new Date()
        }]);
        setClientProfile(INITIAL_PROFILE);
    };

    return {
        messages,
        clientProfile,
        isLoading,
        sendMessage,
        exportData,
        resetConsultation
    };
};
