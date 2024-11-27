import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import weatherRoutes from './api/weatherRoutes.js';
import htmlRoutes from './routes/htmlRoutes.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
dotenv.config();
// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Log environment mode for debugging
console.log(`Environment: ${process.env.NODE_ENV}`);
const app = express();
const PORT = process.env.PORT || 3001;
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Serve static files from the client's dist folder
app.use(express.static(path.resolve(__dirname, '../../client/dist')));
// Connect API routes
app.use('/api/weather', weatherRoutes);
app.use('/', htmlRoutes);
// Serve index.html for unknown routes (Fallback for SPA)
app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/dist/index.html'));
});
// Error-handling middleware
app.use((err, _req, res, _next) => {
    // Log detailed error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Unhandled Error:', err.stack);
    }
    else {
        console.error('Unhandled Error:', err.message);
    }
    res.status(500).json({ error: 'Internal Server Error' });
});
