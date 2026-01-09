import { Router } from 'express';
import { db } from '../db';
import { z } from 'zod';

const router = Router();

const createBookingSchema = z.object({
    serviceIds: z.array(z.string()).min(1),
    stylistId: z.string().optional().nullable(),
    date: z.string().datetime(),
    time: z.string(),
    customerName: z.string().min(1),
    customerPhone: z.string().min(10),
    customerEmail: z.string().email(),
});

// POST /api/bookings
router.post('/', async (req, res) => {
    try {
        const validatedData = createBookingSchema.parse(req.body);
        const bookings = await db.read('bookings.json');
        const services = await db.read('services.json');
        const stylists = await db.read('stylists.json');

        // Simple simulation of creation with IDs and derived data
        const newBooking = {
            id: `BK-${Math.floor(1000 + Math.random() * 9000)}-${Date.now()}`,
            ...validatedData,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            // Mock inclusion of related data for the response
            services: validatedData.serviceIds.map(id => ({
                service: services.find((s: any) => s.id === id) || { name: 'Unknown', price: 0 }
            })),
            stylist: stylists.find((s: any) => s.id === validatedData.stylistId) || null
        };

        bookings.push(newBooking);
        await db.write('bookings.json', bookings);

        res.json(newBooking);
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Validation failed', details: error.errors });
        } else {
            console.error(error);
            res.status(500).json({ error: 'Failed to create booking' });
        }
    }
});

// GET /api/bookings
router.get('/', async (req, res) => {
    try {
        const bookings = await db.read('bookings.json');
        res.json(bookings.reverse());
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

export default router;
