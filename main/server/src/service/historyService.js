import fs from 'node:fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
// Resolve __dirname using import.meta.url for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Define the path to the JSON file
const filePath = path.join(__dirname, '../../db/searchHistory.json');
class City {
    constructor(cityName, id) {
        this.cityName = cityName; // Change from name to cityName
        this.id = id;
    }
}
class HistoryService {
    // Ensure the file exists, if not, create it with an empty array
    async ensureFileExists() {
        try {
            await fs.access(filePath);
        }
        catch {
            await this.write([]); // Create the file with an empty array if it doesn't exist
        }
    }
    // Read data from searchHistory.json
    async read() {
        try {
            await this.ensureFileExists();
            const data = await fs.readFile(filePath, {
                flag: 'a+',
                encoding: 'utf8',
            });
            return data ? JSON.parse(data) : []; // Handle empty file scenario
        }
        catch (error) {
            console.error('Error reading search history file:', error);
            return [];
        }
    }
    // Write data to searchHistory.json
    async write(cities) {
        await fs.writeFile(filePath, JSON.stringify(cities, null, 2), 'utf-8');
    }
    // Get all cities from searchHistory.json
    async getCities() {
        return await this.read();
    }
    // Add a new city to searchHistory.json
    async addCity(cityName) {
        if (!cityName) {
            throw new Error('City name cannot be blank');
        }
        const cities = await this.getCities();
        console.log("Saved Data: ", cities);
        const existingCity = cities.find((c) => c.cityName.toLowerCase() === cityName.toLowerCase()); // Update to cityName
        if (existingCity) {
            console.log("City already exists in history");
            return existingCity;
        }
        else {
            // Add a new unique id to the city using uuid
            const newCity = new City(cityName, uuidv4());
            cities.push(newCity);
            await this.write(cities);
            return newCity;
        }
    }
    // Remove a city by ID from searchHistory.json
    async removeCity(id) {
        const cities = await this.getCities();
        const updatedCities = cities.filter((city) => city.id !== id);
        await this.write(updatedCities);
    }
}
export default new HistoryService();
