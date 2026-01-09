import { Service, Stylist, BookingHistoryItem } from '../types';

// Use environment variable for flexibility
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
    getServices: async (): Promise<Service[]> => {
        const res = await fetch(`${API_URL}/services`);
        if (!res.ok) throw new Error('Failed to fetch services');
        return res.json();
    },

    getStylists: async (): Promise<Stylist[]> => {
        const res = await fetch(`${API_URL}/stylists`);
        if (!res.ok) throw new Error('Failed to fetch stylists');
        return res.json();
    },

    createBooking: async (booking: any): Promise<any> => {
        const res = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(booking)
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.error || 'Failed to create booking');
        }
        return res.json();
    },

    getBookings: async (): Promise<BookingHistoryItem[]> => {
        const res = await fetch(`${API_URL}/bookings`);
        if (!res.ok) throw new Error('Failed to fetch bookings');
        const bookings = await res.json();

        // Transform backend response to match frontend BookingHistoryItem if necessary
        return bookings.map((b: any) => ({
            id: b.id,
            serviceName: b.services?.[0]?.service?.name || 'Servicio Personalizado',
            stylistName: b.stylist?.name || 'Staff Diana Studio',
            date: new Date(b.date),
            time: b.time,
            price: b.services?.[0]?.service?.price || 0, // Simplified for now
            status: b.status,
            image: b.services?.[0]?.service?.image || ''
        }));
    }
};
