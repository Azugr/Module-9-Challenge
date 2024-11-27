import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();
class Weather {
    constructor(cityName, temperature, feelsLike, description, windSpeed, humidity, icon, date) {
        this.cityName = cityName;
        this.temperature = temperature;
        this.feelsLike = feelsLike;
        this.description = description;
        this.windSpeed = windSpeed;
        this.humidity = humidity;
        this.icon = icon;
        this.date = date;
    }
}
class WeatherService {
    constructor() {
        this.baseURL = process.env.API_BASE_URL || '';
        this.apiKey = process.env.API_KEY || '';
        this.cityName = '';
        if (!this.baseURL || !this.apiKey) {
            throw new Error('API_BASE_URL or API_KEY is not defined in the .env file');
        }
    }
    async fetchLocationData(query) {
        try {
            const response = await axios.get(`${this.baseURL}/geo/1.0/direct`, {
                params: {
                    q: query,
                    appid: this.apiKey,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error fetching location data:', error);
            throw new Error(`Failed to fetch location data for city "${query}"`);
        }
    }
    destructureLocationData(locationData) {
        if (!locationData || locationData.length === 0) {
            throw new Error(`City "${this.cityName}" not found`);
        }
        return {
            lat: locationData[0].lat,
            lon: locationData[0].lon,
        };
    }
    buildWeatherQuery(coordinates) {
        return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`;
    }
    async fetchWeatherData(coordinates) {
        try {
            const queryURL = this.buildWeatherQuery(coordinates);
            const response = await axios.get(queryURL);
            console.log("Forecast Res: ", response.data);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching weather data:', error);
            throw new Error('Failed to fetch weather data');
        }
    }
    parseCurrentWeather(response) {
        const weatherData = response.list[0];
        return new Weather(this.cityName, // Include city name here
        weatherData.main.temp, weatherData.main.feels_like, weatherData.weather[0].description, weatherData.wind.speed, weatherData.main.humidity, weatherData.weather[0].icon, weatherData.dt_txt);
    }
    buildForecastArray(weatherData) {
        return weatherData.slice(1, 6).map((data) => {
            return new Weather(this.cityName, // Include city name here as well
            data.main.temp, data.main.feels_like, data.weather[0].description, data.wind.speed, data.main.humidity, data.weather[0].icon, data.dt_txt);
        });
    }
    async getWeatherForCity(city) {
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
