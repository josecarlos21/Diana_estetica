import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();
const DB_PATH = path.join(__dirname, '../../data/consultations.json');

// Helper to read DB
const getDB = () => {
    try {
        if (!fs.existsSync(DB_PATH)) {
            fs.writeFileSync(DB_PATH, '[]');
        }
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } catch (e) {
        return [];
    }
};

// Start a consultation (returns ID) or Save a full one
router.post('/', (req, res) => {
    const consultation = req.body;
    const db = getDB();

    const newEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        ...consultation
    };

    db.push(newEntry);
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

    res.json({ success: true, id: newEntry.id });
});

export default router;
