import { Router } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/services
router.get('/', async (req, res) => {
    try {
        const services = await db.read('services.json');
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

export default router;
