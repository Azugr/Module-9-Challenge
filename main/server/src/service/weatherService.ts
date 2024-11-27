import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface Coordinates {
  lat: number;
  lon: number;
}

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
  dt_txt: string;
}

class Weather {
  constructor(
    public cityName: string, 
    public temperature: number,
    public feelsLike: number,
    public description: string,
    public windSpeed: number,
    public humidity: number,
    public icon: string,
    public date: string
  ) {}
}

class WeatherService {
  private baseURL: string = process.env.API_BASE_URL || '';
  private apiKey: string = process.env.API_KEY || '';
  private cityName: string = '';

  constructor() {
    if (!this.baseURL || !this.apiKey) {
      throw new Error('API_BASE_URL or API_KEY is not defined in the .env file');
    }
  }

  private async fetchLocationData(query: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseURL}/geo/1.0/direct`, {
        params: {
          q: query,
          appid: this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching location data:', error);
      throw new Error(`Failed to fetch location data for city "${query}"`);
    }
  }

  private destructureLocationData(locationData: any): Coordinates {
    if (!locationData || locationData.length === 0) {
      throw new Error(`City "${this.cityName}" not found`);
    }
    return {
      lat: locationData[0].lat,
      lon: locationData[0].lon,
    };
  }

  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`;
  }

  private async fetchWeatherData(coordinates: Coordinates): Promise<{ list: WeatherData[] }> {
    try {
      const queryURL = this.buildWeatherQuery(coordinates);
      const response = await axios.get(queryURL);
      console.log("Forecast Res: ", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw new Error('Failed to fetch weather data');
    }
  }

  private parseCurrentWeather(response: any): Weather {
    const weatherData = response.list[0];
    return new Weather(
      this.cityName, // Include city name here
      weatherData.main.temp,
      weatherData.main.feels_like,
      weatherData.weather[0].description,
      weatherData.wind.speed,
      weatherData.main.humidity,
      weatherData.weather[0].icon,
      weatherData.dt_txt
    );
  }

  private buildForecastArray(weatherData: WeatherData[]): Weather[] {
    return weatherData.slice(1, 6).map((data: WeatherData) => {
      return new Weather(
        this.cityName, // Include city name here as well
        data.main.temp,
        data.main.feels_like,
        data.weather[0].description,
        data.wind.speed,
        data.main.humidity,
        data.weather[0].icon,
        data.dt_txt
      );
    });
  }

  async getWeatherForCity(city: string): Promise<{ currentWeather: Weather; forecast: Weather[] }> {
    this.cityName = city;
    const locationData = await this.fetchLocationData(this.cityName);
    const coordinates = this.destructureLocationData(locationData);
    const weatherResponse = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherResponse);
    const forecast = this.buildForecastArray(weatherResponse.list);
    return { currentWeather, forecast };
  }
}

export default new WeatherService();
