import { Router } from 'express'
import { prisma } from '../prisma'
import { z } from 'zod'

const router = Router()

const createBookingSchema = z.object({
    serviceIds: z.array(z.string()).min(1),
    stylistId: z.string().optional().nullable(),
    date: z.string().datetime(), // ISO string from frontend
    time: z.string(),
    customerName: z.string().min(1),
    customerPhone: z.string().min(10),
    customerEmail: z.string().email(),
})

// POST /api/bookings
router.post('/', async (req, res) => {
    try {
        const validatedData = createBookingSchema.parse(req.body)

        // Create the booking
        const booking = await prisma.booking.create({
            data: {
                date: validatedData.date,
                time: validatedData.time,
                customerName: validatedData.customerName,
                customerPhone: validatedData.customerPhone,
                customerEmail: validatedData.customerEmail,
                stylistId: validatedData.stylistId || null,
                services: {
                    create: validatedData.serviceIds.map(id => ({
                        service: { connect: { id } }
                    }))
                }
            },
            include: {
                services: {
                    include: { service: true }
                },
                stylist: true
            }
        })

        res.json(booking)
    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: 'Validation failed', details: error.issues })
        } else {
            console.error(error)
            res.status(500).json({ error: 'Failed to create booking' })
        }
    }
})

// GET /api/bookings (for history/debug)
router.get('/', async (req, res) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                services: { include: { service: true } },
                stylist: true
            },
            orderBy: { createdAt: 'desc' }
        })
        res.json(bookings)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' })
    }
})

export default router
