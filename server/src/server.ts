// Import necessary modules and dependencies
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import weatherRoutes from './api/weatherRoutes.js'; // Weather-related API routes
import htmlRoutes from './routes/htmlRoutes.js'; // Routes for serving HTML pages
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables from the .env file
dotenv.config();

// Define __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Log the current environment mode for debugging purposes
console.log(`Environment: ${process.env.NODE_ENV}`);

// Initialize the Express application
const app = express();

// Define the port for the server to listen on
const PORT = process.env.PORT || 3001;

// Start the server and log the listening URL
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Middleware for parsing JSON and URL-encoded form data
app.use(express.json()); // Parse incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data

// Serve static files from the client's dist folder (frontend build output)
app.use(express.static(path.resolve(__dirname, '../../client/dist')));

// Connect API routes for weather-related operations
app.use('/api/weather', weatherRoutes); 

// Connect HTML routes for serving static HTML pages
app.use('/', htmlRoutes); 

// Serve index.html for unknown routes to support a Single Page Application (SPA)
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, '../../client/dist/index.html'));
});

// Error-handling middleware to catch and respond to errors
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Log detailed error information if in development mode
  if (process.env.NODE_ENV === 'development') {
    console.error('Unhandled Error:', err.stack);
  } else {
    console.error('Unhandled Error:', err.message);
  }

  // Respond with a generic 500 Internal Server Error message
  res.status(500).json({ error: 'Internal Server Error' });
});
