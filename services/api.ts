import { Service, Stylist, BookingHistoryItem } from '../types';

const API_URL = 'http://localhost:3001/api';

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
    }
};
