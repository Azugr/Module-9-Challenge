import { Router } from 'express';
import WeatherService from '../service/weatherService.js';
import HistoryService from '../service/historyService.js';
const router = Router();
/**
 * POST request to fetch weather data for a city.
 */
router.post('/', async (req, res) => {
    console.log('Incoming Data: ', req.body);
    const { cityName } = req.body;
    // Validate that cityName is provided
    if (!cityName || cityName.trim() === '') {
        return res.status(400).json({ error: 'City name is required' });
    }
    try {
        // Fetch weather data using WeatherService
        const weatherData = await WeatherService.getWeatherForCity(cityName);
        // Save the city to the search history
        await HistoryService.addCity(cityName);
        // Respond with the fetched weather data
        console.log('Weather Data Sent to Frontend:', weatherData);
        return res.status(200).json(weatherData);
    }
    catch (error) {
        console.error('Error fetching weather data:', error);
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: 'An unknown error occurred' });
    }
});
/**
 * GET request to retrieve search history.
 */
router.get('/history', async (_req, res) => {
    console.log('Hit /history endpoint');
    try {
        const history = await HistoryService.getCities();
        // Validate that history is an array
        if (!Array.isArray(history)) {
            throw new Error('Search history data is not an array');
        }
        // Respond with the search history
        return res.status(200).json(history);
    }
    catch (error) {
        console.error('Error retrieving search history:', error);
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to load search history' });
    }
});
/**
 * DELETE request to remove a city from search history by ID.
 */
router.delete('/history/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Remove the city from history using HistoryService
        await HistoryService.removeCity(id);
        // Respond with a success message
        return res.status(200).json({ message: 'City removed from search history' });
    }
    catch (error) {
        console.error('Error removing city:', error);
        if (error instanceof Error) {
            return res.status(500).json({ error: error.message });
        }
        return res.status(500).json({ error: 'Failed to delete city from search history' });
    }
});
export default router;
