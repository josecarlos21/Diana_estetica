export enum ServiceCategory {
  HAIRCUT = 'Corte',
  COLOR = 'Colorimetría',
  TREATMENT = 'Tratamiento',
  STYLING = 'Peinado',
  BARBER = 'Barbería'
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMin: number;
  category: ServiceCategory;
  image?: string;
}

export interface Stylist {
  id: string;
  name: string;
  specialties: ServiceCategory[];
  bio: string;
  rating: number;
  avatarUrl: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface BookingState {
  serviceIds: string[];
  stylistId: string | null;
  date: Date | null;
  time: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isThinking?: boolean;
  recommendedService?: Service;
  suggestedOptions?: string[];
}

export enum BookingStatus {
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface BookingHistoryItem {
  id: string;
  serviceName: string;
  stylistName: string;
  date: Date;
  time: string;
  price: number;
  status: BookingStatus;
  image: string;
}