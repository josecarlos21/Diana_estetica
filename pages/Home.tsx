import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Star } from 'lucide-react';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { Button } from '../components/Button';

const ANNOUNCEMENTS = [
  { text: "Próxima Cita Disponible: Hoy 16:00 hrs", icon: <Zap className="w-3 h-3 text-brand-500 animate-pulse" />, link: "/booking" },
  { text: "Nuevas Técnicas de Balayage - Reserva Hoy", icon: <Sparkles className="w-3 h-3 text-brand-400" />, link: "/booking" },
  { text: "Paga con Amex y obtén cortesía", icon: <Star className="w-3 h-3 text-yellow-500" />, link: "/booking" },
];

export const Home: React.FC = () => {
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-black text-white text-[9px] font-black uppercase tracking-[0.25em] h-10 px-6 flex justify-center items-center z-50 border-b border-zinc-900 sticky top-0 backdrop-blur-md">
        <div className="flex items-center gap-3 transition-all duration-700 ease-in-out animate-fade-in" key={currentAnnouncement}>
           {ANNOUNCEMENTS[currentAnnouncement].icon}
           <span>{ANNOUNCEMENTS[currentAnnouncement].text}</span>
           <Link to={ANNOUNCEMENTS[currentAnnouncement].link} className="ml-2 underline underline-offset-4 decoration-brand-500 hover:text-brand-500 transition-colors">Agendar</Link>
        </div>
      </div>

      <section className="relative flex-grow flex flex-col bg-white dark:bg-black overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-[0.05] pointer-events-none">
           <ImagePlaceholder type="hero" className="w-full h-full" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 w-full flex flex-col justify-start pt-[12vh] h-full pb-20">
          <div className="max-w-5xl">
            <div className="animate-slide-up">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-500 mb-6 block">Estudio de Diseño Capilar</span>
              <h1 className="text-[14vw] md:text-[10vw] leading-[0.8] font-black tracking-tighter text-black dark:text-white mb-8 uppercase">
                DIANA<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600 dark:from-zinc-700 dark:to-zinc-800">STUDIO.</span>
              </h1>
            </div>
            
            <p className="text-lg md:text-2xl font-medium text-zinc-500 dark:text-zinc-400 mb-12 max-w-xl leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Arquitectura personalizada para tu imagen. <br className="hidden sm:block"/>
              Diseño de vanguardia con enfoque editorial en Monterrey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5 w-full md:w-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/booking" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-2xl h-16 text-xs px-14 border-2 border-black dark:border-white hover:bg-brand-500 hover:border-brand-500 hover:text-white transition-all duration-500">
                  Reservar Ahora
                </Button>
              </Link>
              <Link to="/ai-consultant" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-16 flex items-center justify-center gap-4 px-10 border-2 hover:border-brand-500 group">
                  <Sparkles className="w-4 h-4 text-brand-500 group-hover:scale-125 transition-transform" />
                  Asesoría IA
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-12 left-6 lg:left-12 flex flex-col items-start gap-4 opacity-20 hidden md:flex">
           <span className="text-[8px] font-bold uppercase tracking-[0.5em] rotate-90 origin-left ml-1 translate-y-12 whitespace-nowrap">Diana Studio Design</span>
           <div className="w-[1px] h-24 bg-black dark:bg-white"></div>
        </div>
      </section>
    </div>
  );
};