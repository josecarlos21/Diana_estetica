import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Settings, X, Sparkles, Sun, Moon, Home, Calendar, History } from 'lucide-react';
import { COMPANY_INFO } from '../constants';
import { SvgBackdrop } from './SvgBackdrop';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Initial check
    if (mediaQuery.matches) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    // Listener for system changes
    const handleChange = (e: MediaQueryListEvent) => {
      const newIsDark = e.matches;
      setIsDark(newIsDark);
      if (newIsDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    // Cleanup
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
  };

  const navLinks = [
    { name: 'Inicio', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Reservar', path: '/booking', icon: <Calendar className="w-4 h-4" /> },
    { name: 'IA Concierge', path: '/ai-consultant', icon: <Sparkles className="w-4 h-4 text-brand-500" /> },
    { name: 'Mi Cuenta', path: '/history', icon: <History className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="relative min-h-screen flex flex-col transition-colors duration-500 font-sans selection:bg-brand-200 selection:text-brand-900 bg-white dark:bg-dark-900 overflow-hidden">

      <SvgBackdrop className="opacity-70" />

      {/* BOTÓN FLOTANTE DE CONFIGURACIÓN/MENÚ */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[100] flex flex-col items-end gap-3">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group"
          aria-label="Menú de ajustes"
        >
          {isMenuOpen ? (
            <X className="w-7 h-7 text-black dark:text-white" />
          ) : (
            <Settings className="w-7 h-7 text-black dark:text-white group-hover:rotate-90 transition-transform duration-700 ease-out" />
          )}
        </button>

        {/* MENÚ DESPLEGABLE COMPACTO */}
        {isMenuOpen && (
          <div className="animate-scale-in origin-top-right w-72 sm:w-80 bg-white/95 dark:bg-black/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-3">
            <div className="flex flex-col gap-1">
              <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-900 mb-1 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Preferencias</span>
                <button
                  onClick={toggleTheme}
                  className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors rounded-full"
                  title="Cambiar Tema"
                >
                  {isDark ? <Sun className="w-4 h-4 text-brand-500" /> : <Moon className="w-4 h-4 text-zinc-600" />}
                </button>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-5 py-4 text-xs font-extrabold uppercase tracking-[0.25em] transition-all ${isActive(link.path)
                    ? 'bg-brand-500 text-white'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white'
                    }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-900 px-4 pb-2">
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-tighter text-black dark:text-white leading-none">{COMPANY_INFO.name}</span>
                <span className="text-[7px] uppercase tracking-widest text-zinc-400 mt-1">Monterrey, MX</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <main className="flex-grow">{children}</main>

      <footer className="bg-zinc-50 dark:bg-black text-black dark:text-white py-12 border-t border-zinc-200 dark:border-zinc-900">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col text-center md:text-left">
              <span className="font-black tracking-tighter uppercase text-xl">{COMPANY_INFO.shortName}</span>
              <span className="text-[8px] uppercase tracking-[0.3em] text-zinc-400">{COMPANY_INFO.location}</span>
            </div>
            <div className="text-[8px] text-zinc-400 uppercase tracking-widest text-center">
              <span>© 2025 {COMPANY_INFO.name}.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
