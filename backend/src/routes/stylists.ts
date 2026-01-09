import { Router } from 'express';
import { db } from '../db';

const router = Router();

// GET /api/stylists
router.get('/', async (req, res) => {
    try {
        const stylists = await db.read('stylists.json');
        res.json(stylists);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stylists' });
    }
});

export default router;
