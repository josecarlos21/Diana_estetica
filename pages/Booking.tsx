import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Check, CheckCircle2, ArrowRight, Clock, Tag, X } from 'lucide-react';
import { api } from '../services/api'; // Import API
import { BookingState, ServiceCategory, Service, Stylist } from '../types';
import { Button } from '../components/Button';
import { Ticket } from '../components/Ticket';
import { ImagePlaceholder } from '../components/ImagePlaceholder';
import { SvgBackdrop } from '../components/SvgBackdrop';
import { format, addDays, isSameDay, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link, useNavigate } from 'react-router-dom';

type Step = 'SERVICE' | 'DATETIME' | 'STYLIST' | 'DETAILS' | 'CONFIRMATION';

interface FormErrors {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  policy?: string;
}

const STORAGE_KEY = 'diana_booking_draft_v4';

export const Booking: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('SERVICE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');
  const [animating, setAnimating] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isValidPromo, setIsValidPromo] = useState<boolean | null>(null);

  // Data State
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [stylistsList, setStylistsList] = useState<Stylist[]>([]);

  const [bookingData, setBookingData] = useState<BookingState>({
    serviceIds: [],
    stylistId: 'diana',
    date: startOfToday(),
    time: null,
    customerName: '',
    customerPhone: '',
    customerEmail: ''
  });

  const steps: Step[] = ['SERVICE', 'DATETIME', 'STYLIST', 'DETAILS', 'CONFIRMATION'];
  const progress = ((steps.indexOf(currentStep) + 1) / (steps.length - 1)) * 100;

  const [loadingError, setLoadingError] = useState(false);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingError(false);
        const [s, st] = await Promise.all([api.getServices(), api.getStylists()]);
        setServicesList(s);
        setStylistsList(st);
      } catch (e) {
        console.error("Failed to load data", e);
        setLoadingError(true);
      }
    };
    fetchData();
  }, []);

  const totals = useMemo(() => {
    const selected = servicesList.filter(s => bookingData.serviceIds.includes(s.id));
    const hasHaircut = selected.some(s => s.category === ServiceCategory.HAIRCUT);
    const hasColor = selected.some(s => s.category === ServiceCategory.COLOR);
    const hasTreatment = selected.some(s => s.category === ServiceCategory.TREATMENT);

    let totalOriginal = 0;
    let totalDiscounted = 0;

    const services = selected.map(service => {
      let discount = 0;
      totalOriginal += service.price;
      if (hasHaircut && hasColor && service.category === ServiceCategory.COLOR) discount = 0.15;
      else if (hasColor && hasTreatment && service.category === ServiceCategory.TREATMENT) discount = 0.20;
      const finalPrice = Math.round(service.price * (1 - discount));
      return { ...service, isDiscounted: discount > 0, finalPrice };
    });

    const subtotal = services.reduce((acc, s) => acc + s.finalPrice, 0);
    const promoAmount = Math.round(subtotal * promoDiscount);
    totalDiscounted = subtotal - promoAmount;

    return { services, totalOriginal, totalDiscounted, promoAmount };
  }, [bookingData.serviceIds, servicesList, promoDiscount]);

  const handleApplyPromo = () => {
    const code = promoCode.toUpperCase();
    if (code === 'DIANA10') {
      setPromoDiscount(0.1);
      setIsValidPromo(true);
    } else if (code === 'VIP25') {
      setPromoDiscount(0.25);
      setIsValidPromo(true);
    } else {
      setPromoDiscount(0);
      setIsValidPromo(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.date) parsed.date = new Date(parsed.date);
        setBookingData(prev => ({ ...prev, ...parsed }));
      } catch (e) { console.warn("Session restore failed", e); }
    }
  }, []);

  useEffect(() => {
    if (currentStep !== 'CONFIRMATION') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookingData));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [bookingData, currentStep]);

  const changeStep = (next: Step) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(next);
      setAnimating(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  };

  const toggleService = (id: string) => {
    setBookingData(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(id)
        ? prev.serviceIds.filter(sId => sId !== id)
        : [...prev.serviceIds, id]
    }));
  };

  const formatPhoneNumber = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 10);
    if (!n) return '';
    let f = '+52 ' + n.slice(0, 2);
    if (n.length > 2) f += ' ' + n.slice(2, 6);
    if (n.length > 6) f += '-' + n.slice(6, 10);
    return f;
  };

  const validate = () => {
    const e: FormErrors = {};
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const tel = bookingData.customerPhone.replace(/\D/g, '');
    if (touched.customerName && !bookingData.customerName.trim()) e.customerName = 'Nombre Requerido';
    if (touched.customerPhone && tel.length < 10) e.customerPhone = 'Formato Inválido';
    if (touched.customerEmail && (!bookingData.customerEmail || !emailRx.test(bookingData.customerEmail))) e.customerEmail = 'Email Inválido';
    if (touched.policy && !agreedToPolicy) e.policy = 'Debe aceptar políticas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  useEffect(() => { validate(); }, [bookingData, agreedToPolicy, touched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ customerName: true, customerPhone: true, customerEmail: true, policy: true });
    if (!validate() || !agreedToPolicy) return;
    setIsSubmitting(true);

    try {
      const booking = await api.createBooking({
        ...bookingData,
        date: bookingData.date ? new Date(bookingData.date).toISOString() : new Date().toISOString()
      });
      setBookingId(booking.id.split('-')[0] || 'DS-000'); // Short ID
      changeStep('CONFIRMATION');
    } catch (err) {
      console.error("Booking failed", err);
      alert("Error al crear la reserva"); // Simple alert for now
    } finally {
      setIsSubmitting(false);
    }
  };

  const calendarDays = useMemo(() => Array.from({ length: 4 }).map((_, i) => addDays(startOfToday(), i)), []);
  const selectedStylist = stylistsList.find(s => s.id === bookingData.stylistId);

  return (
    <div className="relative lg:h-[calc(100vh-40px)] flex flex-col lg:flex-row bg-white dark:bg-dark-900 overflow-hidden font-sans">

      <SvgBackdrop className="z-0 opacity-70" />

      {currentStep === 'SERVICE' && bookingData.serviceIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 sm:top-6 sm:bottom-auto sm:right-[88px] sm:left-auto z-[101] animate-scale-in flex items-center justify-center sm:justify-end p-4 sm:p-0">
          <div className="glass-pure px-4 py-3 border border-zinc-200 dark:border-zinc-800 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] sm:shadow-2xl flex items-center gap-4 w-full sm:w-auto max-w-md rounded-2xl">
            <div className="flex flex-col items-start leading-none flex-grow sm:flex-grow-0">
              <span className="text-[7px] font-black text-zinc-400 uppercase tracking-widest mb-1">Total Inversión</span>
              <div className="flex items-center gap-2">
                {totals.totalOriginal !== totals.totalDiscounted && (
                  <span className="text-[10px] line-through text-zinc-400 font-mono opacity-60">${totals.totalOriginal}</span>
                )}
                <span className="text-sm font-mono font-black text-brand-500 animate-pulse-glow">${totals.totalDiscounted}</span>
              </div>
            </div>
            <button
              onClick={() => changeStep('DATETIME')}
              className="h-10 bg-black dark:bg-white text-white dark:text-black px-6 font-black flex items-center gap-2 hover:bg-brand-500 dark:hover:bg-brand-500 hover:text-white transition-all group shrink-0 tap-active rounded-xl shadow-lg relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <span className="text-[9px] tracking-widest uppercase relative z-10">Siguiente</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
            </button>
          </div>
        </div>
      )}

      <div className="hidden lg:flex lg:w-[22%] flex-col justify-end p-8 bg-black border-r border-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
          <ImagePlaceholder type="hero" className="w-full h-full scale-150 animate-float" />
        </div>
        <div className="relative z-10">
          <div className="w-10 h-1 bg-brand-500 mb-6"></div>
          <h1 className="text-[2.5vw] font-black tracking-tighter text-white uppercase leading-none mb-4">DIANA<br />STUDIO.</h1>
          <p className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.4em]">Monterrey High-End Studio</p>
        </div>
      </div>

      <div className="flex-grow lg:w-[78%] overflow-y-auto px-6 py-10 lg:px-12 lg:py-16 no-scrollbar relative bg-white dark:bg-dark-900 transition-colors duration-500">

        {/* PROGRESS BAR */}
        {currentStep !== 'CONFIRMATION' && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-100 dark:bg-zinc-800 z-50">
            <div
              className="h-full bg-brand-500 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <div className="max-w-5xl mx-auto w-full pb-20">

          <div className={`transition-all duration-300 transform ${animating ? 'opacity-0 scale-[0.99]' : 'opacity-100 scale-100'}`}>

            {currentStep === 'SERVICE' && (
              <div className="space-y-10">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <h2 className="text-4xl md:text-6xl font-black text-black dark:text-white uppercase tracking-tighter leading-none mb-4">Experiencias</h2>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 italic">Descuento aplicado por servicio combinado</p>
                  </div>
                  <button onClick={() => navigate('/')} className="flex items-center gap-2 p-3 border border-zinc-100 dark:border-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group">
                    <X className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest">Cerrar</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {loadingError ? (
                    <div className="col-span-full py-12 text-center">
                      <p className="text-[10px] font-black uppercase text-brand-500 mb-4">Error al conectar con el servidor</p>
                      <Button variant="outline" onClick={() => window.location.reload()} className="text-[9px]">Reintentar</Button>
                    </div>
                  ) : servicesList.length === 0 ? (
                    // SKELETON LOADERS
                    [...Array(6)].map((_, i) => (
                      <div key={i} className="aspect-[16/9] bg-zinc-50 dark:bg-zinc-900 animate-pulse border border-zinc-100 dark:border-zinc-800 p-5 flex flex-col justify-between">
                        <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800"></div>
                        <div>
                          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 w-3/4 mb-2"></div>
                          <div className="h-2 bg-zinc-200 dark:bg-zinc-800 w-1/4"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    servicesList.map((s, idx) => {
                      const sel = bookingData.serviceIds.includes(s.id);
                      const info = totals.services.find(ts => ts.id === s.id);
                      const disc = sel && info?.isDiscounted;
                      const delayStyle = { "--delay": `${idx * 0.03}s` } as React.CSSProperties;
                      return (
                        <button
                          key={s.id} onClick={() => toggleService(s.id)}
                          style={delayStyle}
                          className={`relative aspect-[16/9] flex flex-col justify-between p-5 border-2 transition-all duration-300 text-left hover-lift tap-active z-10 cursor-pointer ${sel ? 'bg-black dark:bg-white border-brand-500 shadow-xl scale-[0.98]' : 'bg-zinc-50 dark:bg-zinc-900 border-transparent hover:border-zinc-200 dark:hover:border-zinc-800'
                            }`}
                        >
                          <div className={`w-5 h-5 border flex items-center justify-center mb-3 ${sel ? 'bg-brand-500 border-brand-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'border-zinc-300 dark:border-zinc-700'}`}>
                            {sel && <Check className="w-3 h-3 text-white" strokeWidth={5} />}
                          </div>
                          <div>
                            <h3 className={`text-xl font-black uppercase tracking-tighter mb-1 transition-colors ${sel ? 'text-white dark:text-black' : 'text-zinc-400 group-hover:text-black dark:group-hover:text-white'}`}>{s.name}</h3>
                            <div className="flex justify-between items-end">
                              <span className="text-[7px] font-black uppercase text-zinc-500">{s.category}</span>
                              <div className="flex items-baseline gap-2">
                                {disc && <span className="text-[10px] font-mono text-zinc-500 line-through">${s.price}</span>}
                                <span className={`text-lg font-mono font-black ${sel ? 'text-brand-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
                                  ${disc ? info.finalPrice : s.price}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {currentStep === 'DATETIME' && (
              <div className="space-y-10">
                <div className="flex items-center gap-6">
                  <button onClick={() => changeStep('SERVICE')} className="flex items-center gap-3 p-2 border border-zinc-100 dark:border-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Volver</span>
                  </button>
                  <h2 className="text-4xl font-black uppercase tracking-tighter">Agenda</h2>
                </div>
                <div className="grid grid-cols-4 gap-2 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                  {calendarDays.map(d => {
                    const sel = bookingData.date && isSameDay(bookingData.date, d);
                    return (
                      <button key={d.toISOString()} onClick={() => setBookingData({ ...bookingData, date: d, time: null })}
                        className={`py-6 flex flex-col items-center border transition-all hover-lift tap-active ${sel ? 'bg-black text-white border-brand-500 scale-105 shadow-xl' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-transparent hover:bg-zinc-100'}`}>
                        <span className="text-[7px] font-black uppercase mb-1">{format(d, 'EEE', { locale: es })}</span>
                        <span className="text-lg font-black">{format(d, 'd')}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["10:00", "11:00", "12:00", "13:00", "15:00", "16:00", "17:00", "18:00", "19:00"].map(t => (
                    <button key={t} onClick={() => { setBookingData({ ...bookingData, time: t }); changeStep('STYLIST'); }}
                      className={`py-6 text-[10px] font-black border transition-all hover-lift tap-active ${bookingData.time === t ? 'bg-brand-500 text-white border-brand-500 shadow-lg' : 'bg-zinc-50 dark:bg-zinc-900 border-transparent hover:border-black'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'STYLIST' && (
              <div className="space-y-10">
                <div className="flex items-center gap-6">
                  <button onClick={() => changeStep('DATETIME')} className="flex items-center gap-3 p-2 border border-zinc-100 dark:border-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Volver</span>
                  </button>
                  <h2 className="text-4xl font-black uppercase tracking-tighter">Artista</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {stylistsList.length === 0 ? (
                    [...Array(2)].map((_, i) => (
                      <div key={i} className="p-8 border-2 border-transparent bg-zinc-50 dark:bg-zinc-900 animate-pulse">
                        <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 mb-6"></div>
                        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 w-1/2 mb-4"></div>
                        <div className="h-2 bg-zinc-200 dark:bg-zinc-800 w-1/4 mb-2"></div>
                        <div className="h-10 bg-zinc-200 dark:bg-zinc-800 w-full opacity-50"></div>
                      </div>
                    ))
                  ) : (
                    stylistsList.map(s => {
                      const disabled = s.id === 'staff';
                      return (
                        <button key={s.id} disabled={disabled} onClick={() => { setBookingData({ ...bookingData, stylistId: s.id }); changeStep('DETAILS'); }}
                          className={`relative flex flex-col p-8 border-2 transition-all text-left hover-lift tap-active ${bookingData.stylistId === s.id ? 'border-brand-500 bg-black text-white shadow-xl' : disabled ? 'opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-950' : 'bg-zinc-50 dark:bg-zinc-900 border-transparent hover:border-zinc-300'}`}>
                          {disabled && <span className="absolute top-4 right-4 text-[7px] font-black bg-white dark:bg-black px-2 py-1 uppercase tracking-widest text-zinc-400 border border-zinc-100">Sin Cupo</span>}
                          <div className="w-12 h-12 mb-6 bg-zinc-200 dark:bg-zinc-800 border overflow-hidden rounded-full shadow-lg"><ImagePlaceholder type="stylist" seed={s.id} /></div>
                          <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">{s.name}</h3>
                          <p className="text-[8px] font-black text-brand-500 uppercase tracking-widest mb-3">{s.specialties?.[0] || 'Experto'}</p>
                          <p className="text-[10px] italic leading-tight text-zinc-500 line-clamp-2">{s.bio}</p>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {currentStep === 'DETAILS' && (
              <div className="space-y-10">
                <div className="flex items-center gap-6">
                  <button onClick={() => changeStep('STYLIST')} className="flex items-center gap-3 p-2 border border-zinc-100 dark:border-zinc-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Volver</span>
                  </button>
                  <h2 className="text-4xl font-black uppercase tracking-tighter">Registro</h2>
                </div>
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                    <div className="relative">
                      <label htmlFor="customerName" className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-1 block">Nombre Completo</label>
                      <input id="customerName" type="text" placeholder="EJ. MARÍA GARCÍA" className="w-full bg-transparent border-b border-zinc-200 text-xl font-black py-2 focus:border-black dark:focus:border-white outline-none uppercase placeholder:text-[10px] placeholder:tracking-widest" value={bookingData.customerName} onChange={e => setBookingData({ ...bookingData, customerName: e.target.value })} />
                      {touched.customerName && errors.customerName && <span className="text-[8px] text-brand-500 uppercase font-black absolute -bottom-5">{errors.customerName}</span>}
                    </div>
                    <div className="relative">
                      <label htmlFor="customerPhone" className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-1 block">WhatsApp</label>
                      <input id="customerPhone" type="tel" placeholder="+52 00 0000-0000" className="w-full bg-transparent border-b border-zinc-200 text-xl font-black py-2 focus:border-black dark:focus:border-white outline-none uppercase placeholder:text-[10px] placeholder:tracking-widest" value={bookingData.customerPhone} onChange={e => setBookingData({ ...bookingData, customerPhone: formatPhoneNumber(e.target.value) })} />
                      {touched.customerPhone && errors.customerPhone && <span className="text-[8px] text-brand-500 uppercase font-black absolute -bottom-5">{errors.customerPhone}</span>}
                    </div>
                    <div className="relative">
                      <label htmlFor="customerEmail" className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-1 block">Correo Electrónico</label>
                      <input id="customerEmail" type="email" placeholder="EMAIL@EJEMPLO.COM" className="w-full bg-transparent border-b border-zinc-200 text-xl font-black py-2 focus:border-black dark:focus:border-white outline-none placeholder:text-[10px] placeholder:tracking-widest" value={bookingData.customerEmail} onChange={e => setBookingData({ ...bookingData, customerEmail: e.target.value })} />
                      {touched.customerEmail && errors.customerEmail && <span className="text-[8px] text-brand-500 uppercase font-black absolute -bottom-5">{errors.customerEmail}</span>}
                    </div>

                    {/* TARJETA DE CÓDIGO PROMOCIONAL ROSA */}
                    <div className="bg-brand-500 p-6 flex flex-col justify-center relative shadow-xl transform hover:rotate-1 transition-transform group overflow-hidden">
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"></div>
                      <div className="absolute top-2 right-2 opacity-20"><Tag className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" /></div>
                      <label htmlFor="promoCode" className="text-[9px] font-black uppercase tracking-[0.3em] text-white/90 mb-3 block">¿Tienes un código?</label>
                      <div className="relative flex gap-2">
                        <input
                          id="promoCode"
                          type="text"
                          className="w-full bg-white/10 border-b-2 border-white/40 text-2xl font-black py-2 outline-none uppercase placeholder:text-white/20 text-white focus:border-white transition-colors"
                          placeholder="DIANA10"
                          value={promoCode}
                          onChange={e => {
                            setPromoCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''));
                            setIsValidPromo(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          className="px-4 bg-white text-brand-500 font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all tap-active shrink-0"
                        >
                          Aplicar
                        </button>
                      </div>
                      {isValidPromo === true && <p className="text-[8px] font-black uppercase text-white mt-2 animate-bounce">¡Código Aplicado!</p>}
                      {isValidPromo === false && <p className="text-[8px] font-black uppercase text-brand-950 mt-2">Código Inválido</p>}
                    </div>
                  </div>

                  {/* ACEPTACIÓN DE POLÍTICAS - MÁS VISIBLE Y ROSA */}
                  <div className={`p-6 border-2 transition-all ${agreedToPolicy ? 'bg-brand-50/50 dark:bg-brand-950/20 border-brand-500 shadow-md' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800'}`}>
                    <label className="flex items-center gap-5 cursor-pointer select-none">
                      <div className={`w-6 h-6 border-2 flex items-center justify-center transition-all flex-shrink-0 ${agreedToPolicy ? 'bg-brand-500 border-brand-500 text-white' : 'border-zinc-300 dark:border-zinc-700'}`}>
                        {agreedToPolicy && <Check className="w-4 h-4" strokeWidth={5} />}
                      </div>
                      <input type="checkbox" className="hidden" checked={agreedToPolicy} onChange={() => setAgreedToPolicy(!agreedToPolicy)} />
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-black uppercase tracking-wider ${agreedToPolicy ? 'text-brand-600 dark:text-brand-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                          Acepto políticas de cancelación y términos de servicio premium.
                        </span>
                        {touched.policy && errors.policy && <span className="text-[9px] text-brand-500 font-black uppercase mt-1">Requerido para continuar</span>}
                      </div>
                    </label>
                  </div>

                  <div className="bg-black dark:bg-white p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-brand-500 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none"></div>
                    <div className="relative z-10 text-center md:text-left">
                      <span className="text-[8px] font-black uppercase text-zinc-500 dark:text-zinc-400 mb-1 block">Inversión Final de Imagen</span>
                      <div className="flex items-baseline gap-3 justify-center md:justify-start">
                        {totals.totalOriginal !== totals.totalDiscounted && <span className="text-lg font-mono text-zinc-600 line-through opacity-50">${totals.totalOriginal}</span>}
                        {totals.promoAmount > 0 && <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] animate-pulse-glow">-{totals.promoAmount} PROMO</span>}
                        <span className="text-4xl font-mono font-black text-white dark:text-black">${totals.totalDiscounted}</span>
                      </div>
                    </div>
                    <Button type="submit" variant="brand" className="h-16 px-12 text-[11px] w-full md:w-auto relative z-10 shadow-xl" isLoading={isSubmitting}>
                      {isSubmitting ? 'Verificando Cupo' : 'Confirmar Reserva'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {currentStep === 'CONFIRMATION' && (
              <div className="flex flex-col items-center py-10 animate-scale-in text-center">
                <div className="w-20 h-20 bg-brand-500 text-white flex items-center justify-center mb-8 shadow-2xl"><CheckCircle2 className="w-10 h-10" /></div>
                <h2 className="text-6xl font-black uppercase tracking-tighter mb-2 text-black dark:text-white">Exito.</h2>
                <p className="text-brand-500 text-[10px] uppercase tracking-[0.4em] font-black mb-12 italic">Tu espacio premium ha sido bloqueado en Monterrey.</p>
                <Ticket bookingId={bookingId} customerName={bookingData.customerName} service={totals.services[0]} stylist={selectedStylist} date={bookingData.date} time={bookingData.time} />
                <div className="flex gap-4 mt-16 w-full max-sm:flex-col justify-center">
                  <Button variant="primary" className="w-full max-w-[220px] h-14 text-[9px]" onClick={() => window.print()}>Guardar Copia</Button>
                  <Link to="/" className="w-full max-w-[220px]"><Button variant="outline" className="w-full h-14 text-[9px]">Ir al Inicio</Button></Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
