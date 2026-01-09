import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft } from 'lucide-react';
import { ChatMessage } from '../types';
import { getStylistAdvice, AIResponse } from '../services/geminiService';
import { Link } from 'react-router-dom';
import { SERVICES, QUICK_PROMPTS } from '../constants';
import { Button } from '../components/Button';
import { ChatMessageItem } from '../components/ChatMessageItem';

export const AiConsultant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Bienvenida a Diana Studio AI. Cuéntame sobre tu cabello o el look que buscas para recibir una asesoría personalizada.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMounted = useRef(true);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages, isLoading]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // 1. Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // 2. Setup new controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiData: AIResponse = await getStylistAdvice(text, controller.signal);

      // 3. Safety Check: If unmounted, stop.
      if (!isMounted.current) return;

      const recommendedService = aiData.recommendedServiceId
        ? SERVICES.find(s => s.id === aiData.recommendedServiceId)
        : undefined;

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiData.chatResponse,
        timestamp: new Date(),
        recommendedService
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      // Ignorar errores de aborto, ya que son intencionales
      if (error.name === 'AbortError') {
        return;
      }

      if (!isMounted.current) return;

      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(), role: 'model', text: "Lo siento, tuve un error tecnico. Intenta de nuevo.", timestamp: new Date()
      }]);
    }
    finally {
      if (isMounted.current) {
        // Only turn off loading if this specific request wasn't superseded by a new one
        // (If a new one started, abortControllerRef.current would be different)
        if (abortControllerRef.current === controller) {
          setIsLoading(false);
          abortControllerRef.current = null;
        }
      }
    }
  };

  return (
    <div className="bg-zinc-50 dark:bg-black h-[calc(100vh-64px)] flex flex-col pt-4">
      <div className="w-full max-w-3xl mx-auto flex-grow flex flex-col bg-white dark:bg-dark-900 border-x border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">

        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white/80 dark:bg-dark-900/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-none border border-transparent hover:border-zinc-200 transition-all">
              <ArrowLeft className="w-5 h-5 text-black dark:text-white" />
            </Link>
            <div>
              <h2 className="font-black text-xs uppercase tracking-[0.2em] text-black dark:text-white flex items-center gap-2">
                AI Studio Concierge <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"></span>
              </h2>
            </div>
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-8">
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} msg={msg} />
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-none flex gap-1">
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-dark-900 p-6">
          {messages.length < 3 && !isLoading && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="whitespace-nowrap px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }} className="relative flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Pregunta a EstiloBot..."
              className="flex-grow bg-zinc-50 dark:bg-zinc-800 p-4 text-sm text-black dark:text-white placeholder-zinc-400 outline-none border border-transparent focus:border-zinc-300 dark:focus:border-zinc-700 transition-all"
              disabled={isLoading}
            />
            <Button type="submit" variant="primary" size="md" disabled={!inputValue.trim() || isLoading}>
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};