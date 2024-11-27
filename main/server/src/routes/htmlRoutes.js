import path from 'path';
import { Router } from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const router = Router();
// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Define route to serve index.html
router.get('/', (_, res) => {
    const indexPath = path.join(__dirname, '../../client/public/index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).send('Error loading the application.');
        }
    });
});
export default router;
