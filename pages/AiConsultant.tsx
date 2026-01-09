import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowLeft, Download, Sparkles, Settings } from 'lucide-react';
import { ChatMessage, Service } from '../types';
import { api } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { QUICK_PROMPTS } from '../constants';
import { Button } from '../components/Button';
import { ChatMessageItem } from '../components/ChatMessageItem';
import { SvgBackdrop } from '../components/SvgBackdrop';
import { useConsultation } from '../hooks/useConsultation';

export const AiConsultant: React.FC = () => {
  const navigate = useNavigate();
  const { messages, clientProfile, isLoading, sendMessage, exportData, resetConsultation } = useConsultation();
  const [inputValue, setInputValue] = useState('');
  const [services, setServices] = useState<Service[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [messages, isLoading]);

  useEffect(() => {
    isMounted.current = true;
    const loadServices = async () => {
      try {
        const s = await api.getServices();
        if (isMounted.current) setServices(s);
      } catch (e) {
        console.warn("AI using static catalog fallback");
      }
    };
    loadServices();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setInputValue('');
    await sendMessage(text, services);
  };

  return (
    <div className="relative bg-zinc-50 dark:bg-black h-[calc(100vh-64px)] flex flex-col lg:flex-row pt-4 overflow-hidden">
      <SvgBackdrop className="opacity-70" />

      {/* LEFT PANEL - LIVE SIMULATION */}
      <div className="hidden lg:flex w-1/3 p-6 flex-col gap-6 z-10 overflow-y-auto border-r border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-md">
        <div className="space-y-2">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-500" /> Live Analysis
          </h3>
          <p className="text-[10px] text-zinc-500">La IA está construyendo tu perfil técnico en tiempo real.</p>
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Tipo de Cabello</span>
              <p className="text-lg font-black text-black dark:text-white capitalize">{clientProfile.hairType}</p>
            </div>
            <div className="h-px bg-zinc-100 dark:bg-zinc-800"></div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Condición</span>
              <p className="text-lg font-black text-black dark:text-white capitalize">{clientProfile.scalpCondition}</p>
            </div>
            <div className="h-px bg-zinc-100 dark:bg-zinc-800"></div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Objetivo</span>
              <p className="text-sm font-medium text-black dark:text-white">{clientProfile.hairGoal}</p>
            </div>
            <div className="h-px bg-zinc-100 dark:bg-zinc-800"></div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Frecuencia Sugerida</span>
              <p className="text-sm font-medium text-brand-500">{clientProfile.recommendedFrequency}</p>
            </div>
          </div>

          <Button variant="outline" onClick={exportData} className="w-full gap-2 text-[10px] h-10">
            <Download className="w-4 h-4" /> Exportar Diagnóstico (CSV)
          </Button>

          <div className="bg-brand-50/50 dark:bg-brand-900/10 p-4 rounded-lg border border-brand-100 dark:border-brand-900/20">
            <p className="text-[10px] text-brand-800 dark:text-brand-300 italic">
              "Este diagnóstico es generado por nuestra IA experta. Te recomendamos validarlo con Diana en tu cita."
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-2/3 max-w-3xl mx-auto flex-grow flex flex-col bg-white dark:bg-dark-900 border-x border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden relative z-10">

        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-white/80 dark:bg-dark-900/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 -ml-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-none border border-transparent hover:border-zinc-200 transition-all">
              <ArrowLeft className="w-5 h-5 text-black dark:text-white" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-black text-sm uppercase tracking-[0.2em] text-black dark:text-white flex items-center gap-2">
                  AI Studio Concierge
                </h2>
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-md text-[10px] text-amber-600 dark:text-amber-400 font-black tracking-widest uppercase shadow-sm">
                  Próximamente
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 font-medium">
                Modo Interactivo de Demostración (Funcionalidad Limitada)
              </p>
            </div>
          </div>

          {/* 3D Glass Gear Icon */}
          <div className="relative group cursor-help">
            <div className="absolute inset-0 bg-cyan-400/30 blur-lg rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <button className="relative w-12 h-12 flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-cyan-500/20 hover:scale-110 active:scale-95 transition-all duration-300 group-hover:border-cyan-400/50">
              <Settings className="w-6 h-6 text-cyan-600 dark:text-cyan-300 animate-[spin_10s_linear_infinite]" />
            </button>
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

        <div className="border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-dark-900 p-6 min-h-[120px] flex flex-col justify-center items-center">
          {messages.length > 0 && messages[messages.length - 1].role === 'model' && (
            <div className="flex flex-wrap gap-3 justify-center w-full max-w-2xl animate-fade-in">
              {/* Utilizar las opciones sugeridas por la IA si existen */}
              {(messages[messages.length - 1].suggestedOptions || ["Iniciar Diagnóstico"]).map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(option)}
                  className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {isLoading && <p className="text-[10px] uppercase tracking-widest text-zinc-400 mt-4 animate-pulse">EstiloBot analizando...</p>}
        </div>
      </div>
    </div>
  );
};
