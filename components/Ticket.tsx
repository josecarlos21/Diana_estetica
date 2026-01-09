import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Service, Stylist } from '../types';
import { CalendarCheck, Printer } from 'lucide-react';
import { COMPANY_INFO } from '../constants';

interface TicketProps {
   bookingId: string;
   customerName: string;
   service: (Service & { finalPrice?: number }) | undefined;
   stylist: Stylist | undefined;
   date: Date | null;
   time: string | null;
}

export const Ticket: React.FC<TicketProps> = ({ bookingId, customerName, service, stylist, date, time }) => {
   const price = service?.finalPrice || service?.price || 0;

   const generateICS = () => {
      if (!date || !time || !service) return;
      const [hours, minutes] = time.split(':').map(Number);
      const startDate = new Date(date);
      startDate.setHours(hours, minutes);
      const endDate = new Date(startDate);
      endDate.setMinutes(startDate.getMinutes() + service.durationMin);
      const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
      const icsContent = [
         'BEGIN:VCALENDAR',
         'VERSION:2.0',
         'BEGIN:VEVENT',
         `DTSTART:${formatDate(startDate)}`,
         `DTEND:${formatDate(endDate)}`,
         `SUMMARY:Cita ${COMPANY_INFO.name}: ${service.name}`,
         `DESCRIPTION:Atendido por ${stylist?.name}. Folio: ${bookingId}`,
         `LOCATION:${COMPANY_INFO.address}, ${COMPANY_INFO.location}`,
         'END:VEVENT',
         'END:VCALENDAR'
      ].join('\r\n');
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cita_${bookingId}.ics`;
      link.click();
   };

   return (
      <div className="w-full flex flex-col items-center">
         <div id="printable-ticket" className="w-full max-w-[440px] bg-white text-black font-mono text-sm shadow-2xl p-12 relative border border-zinc-100">
            <div className="text-center border-b-2 border-black pb-10 mb-10">
               <h1 className="text-4xl font-black tracking-tighter uppercase mb-3">{COMPANY_INFO.shortName}</h1>
               <p className="text-[11px] uppercase tracking-[0.4em] text-zinc-500 mb-1">{COMPANY_INFO.location}</p>
               <p className="text-[10px] opacity-70">{COMPANY_INFO.address} • {COMPANY_INFO.phone}</p>
            </div>

            <div className="space-y-4 mb-10 text-[12px] uppercase tracking-widest">
               <div className="flex justify-between"><span>FECHA CITA</span><span>{date ? format(date, 'dd.MM.yyyy') : '-'}</span></div>
               <div className="flex justify-between"><span>HORA LOCAL</span><span>{time || '-'}</span></div>
               <div className="flex justify-between font-black text-black text-lg border-t-2 border-zinc-100 pt-4 mt-4">
                  <span>FOLIO</span>
                  <span>#{bookingId}</span>
               </div>
            </div>

            <div className="border-t-2 border-dashed border-zinc-200 py-10">
               <div className="flex justify-between items-start mb-4">
                  <span className="font-black uppercase flex-1 text-base">{service?.name}</span>
                  <span className="font-black text-base">${price}.00</span>
               </div>
               <p className="text-[11px] text-zinc-500 uppercase font-bold">PROFESIONAL: {stylist?.name} • {service?.durationMin} MINUTOS</p>
            </div>

            <div className="border-t-4 border-black py-8 flex justify-between items-center text-3xl font-black">
               <span>TOTAL</span>
               <span>${price}.00</span>
            </div>

            <div className="bg-zinc-50 p-8 mb-8 text-center border border-zinc-100 relative overflow-hidden group">
               <div className="absolute inset-0 bg-brand-500 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"></div>
               <p className="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-[0.3em]">RESERVADO PARA</p>
               <p className="font-black uppercase text-2xl tracking-tighter text-black">{customerName}</p>
            </div>

            <div className="flex flex-col items-center gap-6 mb-10">
               <div className="p-4 bg-white border-2 border-zinc-100 shadow-inner">
                  <img
                     src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${bookingId}&color=000000&bgcolor=ffffff`}
                     alt="QR Code"
                     className="w-32 h-32 grayscale"
                  />
               </div>
               <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-1">ESCANEAR PARA LLEGADA</p>
                  <p className="text-[9px] font-bold text-brand-500 uppercase tracking-widest italic">¡MUCHAS GRACIAS POR TU PREFERENCIA!</p>
               </div>
            </div>

            <div className="flex flex-col items-center gap-8">
               <div className="h-10 w-full flex items-stretch gap-[2px] overflow-hidden opacity-50">
                  {[...Array(60)].map((_, i) => (
                     <div key={i} className={`bg-black ${Math.random() > 0.4 ? 'flex-[1]' : 'flex-[2]'}`}></div>
                  ))}
               </div>
               <p className="text-[10px] text-center uppercase tracking-[0.4em] font-black text-zinc-300">Diana Studio Design • Monterrey</p>
            </div>

            <div className="absolute top-0 right-0 w-0 h-0 border-t-[60px] border-t-brand-500 border-l-[60px] border-l-transparent print:hidden"></div>
         </div>

         <div className="flex gap-10 mt-12 print:hidden">
            <button onClick={generateICS} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-brand-500 hover:text-brand-700 transition-all group">
               <CalendarCheck className="w-5 h-5 group-hover:scale-110 transition-transform" /> AGREGAR CALENDARIO
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-black transition-all group">
               <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" /> IMPRIMIR COPIA
            </button>
         </div>
      </div>
   );
};