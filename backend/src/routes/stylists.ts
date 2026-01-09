import { Router } from 'express'
import { prisma } from '../prisma'

const router = Router()

// GET /api/stylists
router.get('/', async (req, res) => {
    try {
        const stylists = await prisma.stylist.findMany()
        // Parse specialties JSON string back to array if needed on frontend, 
        // or keep it as string depending on frontend expectations.
        // The frontend expects string[], so we might need to parse it here or in frontend.
        // Let's parse it here for API cleanliness.
        const formattedStylists = stylists.map((stylist: any) => ({
            ...stylist,
            specialties: JSON.parse(stylist.specialties as string)
        }))
        res.json(formattedStylists)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stylists' })
    }
})

export default router
