import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, MapPin, Repeat, AlertCircle, CheckCircle, XCircle, ArrowRight, History as HistoryIcon } from 'lucide-react';
import { MOCK_HISTORY } from '../constants';
import { BookingStatus } from '../types';
import { Button } from '../components/Button';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { Link } from 'react-router-dom';

const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const styles = {
    [BookingStatus.CONFIRMED]: 'bg-black text-white dark:bg-white dark:text-black',
    [BookingStatus.COMPLETED]: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    [BookingStatus.CANCELLED]: 'bg-red-50 text-red-600 border border-red-100',
  };

  const labels = {
    [BookingStatus.CONFIRMED]: 'Confirmada',
    [BookingStatus.COMPLETED]: 'Completada',
    [BookingStatus.CANCELLED]: 'Cancelada',
  };

  return (
    <span className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export const History: React.FC = () => {
  const historyItems = MOCK_HISTORY; 
  const lastCut = historyItems.find(h => h.status === BookingStatus.COMPLETED);
  const daysSinceLastCut = lastCut ? Math.floor((new Date().getTime() - lastCut.date.getTime()) / (1000 * 3600 * 24)) : 0;
  const showSmartSuggestion = daysSinceLastCut > 20;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      
      <div className="mb-12 border-b border-black dark:border-white pb-6">
          <h1 className="text-4xl font-bold text-black dark:text-white tracking-tighter uppercase">Bitácora de Estilo</h1>
      </div>

      {historyItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
           <div className="w-32 h-32 mb-8 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-200 dark:text-zinc-800 stroke-current" fill="none" strokeWidth="1">
                 <circle cx="50" cy="50" r="40" strokeDasharray="4 4" />
                 <path d="M30 50 L70 50 M50 30 L50 70" />
              </svg>
              <HistoryIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-zinc-400" />
           </div>
           <h3 className="text-xl font-bold uppercase tracking-tight text-black dark:text-white mb-2">Sin registros</h3>
           <p className="text-zinc-500 max-w-xs mx-auto text-sm mb-8 uppercase tracking-widest leading-loose">Tu historia comienza con tu primera reserva.</p>
           <Link to="/booking">
              <Button variant="brand" size="lg">
                 Iniciar Bitácora
              </Button>
           </Link>
        </div>
      ) : (
        <>
          {showSmartSuggestion && (
            <div className="mb-12 bg-brand-50 dark:bg-brand-900/10 border-l-4 border-brand-500 p-8 flex flex-col sm:flex-row gap-6 items-start animate-fade-in">
              <div className="bg-white dark:bg-black p-3 text-brand-500 border border-brand-100 dark:border-brand-900">
                <Repeat className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-black dark:text-white text-xs uppercase tracking-[0.2em] mb-2">Sugerencia de Retoque</h3>
                <p className="text-zinc-600 dark:text-zinc-300 text-sm mb-6 leading-relaxed">
                  Han pasado <span className="font-bold text-brand-600 dark:text-brand-400">{daysSinceLastCut} días</span> desde tu última visita. Es el momento perfecto para mantener la forma y salud de tu cabello.
                </p>
                <Link to="/booking">
                  <Button variant="outline" size="sm">
                    Agendar Retoque Mismo Look
                  </Button>
                </Link>
              </div>
            </div>
          )}

          <div className="space-y-8">
            {historyItems.map((booking) => (
              <div 
                key={booking.id} 
                className="bg-white dark:bg-dark-900 group border-b border-zinc-100 dark:border-zinc-800 pb-8 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors p-6"
              >
                <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                  <div className="w-24 h-24 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                     <ImagePlaceholder type="service" seed={booking.id} className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500" />
                  </div>

                  <div className="flex-grow w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="font-bold text-2xl text-black dark:text-white leading-none mb-2 uppercase tracking-tighter">{booking.serviceName}</h3>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold">con {booking.stylistName}</p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </div>

                    <div className="flex flex-wrap gap-y-2 gap-x-8 text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-500" />
                        <span>{format(booking.date, 'EEEE d MMMM', { locale: es })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-brand-500" />
                        <span>{booking.time} hrs</span>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-between items-center pt-6 border-t border-zinc-100 dark:border-zinc-800">
                      <span className="font-mono text-xl font-bold text-black dark:text-white">${booking.price}</span>
                      <div className="flex gap-4">
                        {booking.status === BookingStatus.CONFIRMED && (
                          <button className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors">
                            Cancelar Cita
                          </button>
                        )}
                        <Link to="/booking">
                           <Button variant="ghost" size="sm" className="group/btn">
                             {booking.status === BookingStatus.COMPLETED ? 'Repetir' : 'Detalles'} 
                             <ArrowRight className="w-3 h-3 ml-2 group-hover/btn:translate-x-1 transition-transform"/>
                           </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};