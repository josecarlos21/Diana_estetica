import { Service, ServiceCategory, Stylist, BookingHistoryItem, BookingStatus } from './types';
import { subDays, addDays } from 'date-fns';

export const COMPANY_INFO = {
  name: 'DIANA STUDIO',
  shortName: 'DIANA.',
  location: 'San Pedro Garza García, MTY',
  address: 'Calzada del Valle 400',
  phone: '+52 81 1255 1844',
  instagram: '@dianastudio_mty',
  schedule: '10:00 - 20:00',
  whatsapp: 'https://wa.me/528112551844'
};

export const SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Signature Cut',
    description: 'Diseño de corte personalizado basado en tu estructura ósea.',
    price: 850,
    durationMin: 60,
    category: ServiceCategory.HAIRCUT
  },
  {
    id: 's2',
    name: 'Peinado Social',
    description: 'Estilizado de larga duración para eventos exclusivos.',
    price: 950,
    durationMin: 60,
    category: ServiceCategory.STYLING
  },
  {
    id: 's3',
    name: 'Balayage Premium',
    description: 'Técnica exclusiva de iluminación orgánica sin marcas.',
    price: 2800,
    durationMin: 240,
    category: ServiceCategory.COLOR
  },
  {
    id: 's4',
    name: 'Botox Capilar',
    description: 'Recuperación de brillo instantáneo y nutrición profunda.',
    price: 1400,
    durationMin: 90,
    category: ServiceCategory.TREATMENT
  },
  {
    id: 's5',
    name: 'Full Color Mix',
    description: 'Color global de alta definición con protección de fibra.',
    price: 1650,
    durationMin: 120,
    category: ServiceCategory.COLOR
  },
  {
    id: 's6',
    name: 'Hidratación Zen',
    description: 'Tratamiento spa de vapor para cuero cabelludo sensible.',
    price: 900,
    durationMin: 45,
    category: ServiceCategory.TREATMENT
  }
];

export const STYLISTS: Stylist[] = [
  {
    id: 'diana',
    name: 'Diana',
    specialties: [ServiceCategory.HAIRCUT, ServiceCategory.COLOR],
    bio: 'Directora Creativa. Especialista en arquitectura capilar y colorimetría avanzada.',
    rating: 5.0,
    avatarUrl: ''
  },
  {
    id: 'staff',
    name: 'Senior Staff',
    specialties: [ServiceCategory.TREATMENT, ServiceCategory.STYLING],
    bio: 'Equipo técnico especializado bajo la metodología Diana Studio.',
    rating: 4.8,
    avatarUrl: ''
  }
];

export const MOCK_HISTORY: BookingHistoryItem[] = [
  {
    id: 'bk-1024',
    serviceName: 'Signature Cut & Style',
    stylistName: 'Diana',
    date: addDays(new Date(), 2),
    time: '16:00',
    price: 850,
    status: BookingStatus.CONFIRMED,
    image: ''
  },
  {
    id: 'bk-950',
    serviceName: 'Gloss & Tratamiento',
    stylistName: 'Staff Studio',
    date: subDays(new Date(), 45),
    time: '17:00',
    price: 1200,
    status: BookingStatus.COMPLETED,
    image: ''
  }
];

export const QUICK_PROMPTS = [
  "Corte para cara redonda",
  "Tratamiento cabello seco",
  "Cambio radical",
  "Precio Balayage"
];