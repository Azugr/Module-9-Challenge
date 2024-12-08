// Import required modules
import axios from 'axios'; // For making HTTP requests
import dotenv from 'dotenv'; // For loading environment variables

dotenv.config(); // Load environment variables from .env file

// Define the structure for geographical coordinates
interface Coordinates {
  lat: number; // Latitude
  lon: number; // Longitude
}

// Define the structure for weather data returned by the API
interface WeatherData {
  main: {
    temp: number; // Temperature in Fahrenheit
    feels_like: number; // Feels-like temperature
    humidity: number; // Humidity percentage
  };
  weather: {
    description: string; // Weather description (e.g., "clear sky")
    icon: string; // Icon identifier for weather condition
  }[];
  wind: {
    speed: number; // Wind speed in MPH
  };
  dt_txt: string; // Date and time of the weather data
}

// Define a class to represent weather data in a structured way
class Weather {
  constructor(
    public cityName: string, // Name of the city
    public temperature: number, // Current temperature
    public feelsLike: number, // Feels-like temperature
    public description: string, // Weather description
    public windSpeed: number, // Wind speed in MPH
    public humidity: number, // Humidity percentage
    public icon: string, // Weather icon
    public date: string // Date and time of the weather data
  ) {}
}

// Define a service class to handle weather-related operations
class WeatherService {
  private baseURL: string = process.env.API_BASE_URL || ''; // Base URL for API requests
  private apiKey: string = process.env.API_KEY || ''; // API key for authentication
  private cityName: string = ''; // Name of the city for the current request

  constructor() {
    // Ensure that required environment variables are defined
    if (!this.baseURL || !this.apiKey) {
      throw new Error('API_BASE_URL or API_KEY is not defined in the .env file');
    }
  }

  // Fetch location data (coordinates) based on the city name
  private async fetchLocationData(query: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/geo/1.0/direct`, {
        params: {
          q: query, // Query string (city name)
          appid: this.apiKey, // API key
        },
      });
      return response.data; // Return location data
    } catch (error) {
      console.error('Error fetching location data:', error);
      throw new Error(`Failed to fetch location data for city "${query}"`);
    }
  }

  // Extract and validate geographical coordinates from location data
  private destructureLocationData(locationData: any): Coordinates {
    if (!locationData || locationData.length === 0) {
      throw new Error(`City "${this.cityName}" not found`);
    }
    return {
      lat: locationData[0].lat, // Latitude
      lon: locationData[0].lon, // Longitude
    };
  }

  // Construct the API query URL for fetching weather data
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`;
  }

  // Fetch weather data using geographical coordinates
  private async fetchWeatherData(coordinates: Coordinates): Promise<{ list: WeatherData[] }> {
    try {
      const queryURL = this.buildWeatherQuery(coordinates);
      const response = await axios.get(queryURL);
      console.log("Forecast Res: ", response.data); // Debugging: Log the response
      return response.data; // Return weather data
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  // Parse the current weather data from the API response
  private parseCurrentWeather(response: any): Weather {
    const weatherData = response.list[0];
    return new Weather(
      this.cityName, // Include city name
      weatherData.main.temp, // Temperature
      weatherData.main.feels_like, // Feels-like temperature
      weatherData.weather[0].description, // Weather description
      weatherData.wind.speed, // Wind speed
      weatherData.main.humidity, // Humidity percentage
      weatherData.weather[0].icon, // Weather icon
      weatherData.dt_txt // Date and time
    );
  }

  // Build an array of Weather objects for the forecast
  private buildForecastArray(weatherData: WeatherData[]): Weather[] {
    return weatherData.slice(1, 6).map((data: WeatherData) => {
      return new Weather(
        this.cityName, // Include city name
        data.main.temp, // Temperature
        data.main.feels_like, // Feels-like temperature
        data.weather[0].description, // Weather description
        data.wind.speed, // Wind speed
        data.main.humidity, // Humidity percentage
        data.weather[0].icon, // Weather icon
        data.dt_txt // Date and time
      );
    });
  }

  // Main function to fetch and parse weather data for a city
  async getWeatherForCity(city: string): Promise<{ currentWeather: Weather; forecast: Weather[] }> {
    this.cityName = city; // Set the city name for the request
    const locationData = await this.fetchLocationData(this.cityName); // Fetch location data
    const coordinates = this.destructureLocationData(locationData); // Extract coordinates
    const weatherResponse = await this.fetchWeatherData(coordinates); // Fetch weather data
    const currentWeather = this.parseCurrentWeather(weatherResponse); // Parse current weather
    const forecast = this.buildForecastArray(weatherResponse.list); // Build forecast array
    return { currentWeather, forecast }; // Return both current weather and forecast
  }
}

// Export an instance of the WeatherService class as the default export
export default new WeatherService();
