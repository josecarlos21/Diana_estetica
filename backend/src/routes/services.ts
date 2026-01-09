import { Router } from 'express'
import { prisma } from '../prisma'

const router = Router()

// GET /api/services
router.get('/', async (req, res) => {
    try {
        const services = await prisma.service.findMany()
        res.json(services)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' })
    }
})

export default router
