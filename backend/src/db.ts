import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

export const db = {
    async read(file: string) {
        try {
            const data = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading ${file}:`, error);
            return [];
        }
    },

    async write(file: string, data: any) {
        try {
            await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
        } catch (error) {
            console.error(`Error writing ${file}:`, error);
        }
    }
};
