// Import CSS for styling
import './styles/jass.css';

// Define the interfaces for the expected data structure

// Interface for the current weather data
interface CurrentWeather {
  cityName: string; // Name of the city
  date: string; // Date of the weather data
  icon: string; // Weather icon identifier
  iconDescription: string; // Description of the weather icon
  temperature: number; // Temperature in Fahrenheit
  windSpeed: number; // Wind speed in MPH
  humidity: number; // Humidity percentage
}

// Interface for forecast data
interface Forecast {
  date: string; // Date of the forecast
  icon: string; // Weather icon identifier
  iconDescription: string; // Description of the weather icon
  temperature: number; // Temperature in Fahrenheit
  windSpeed: number; // Wind speed in MPH
  humidity: number; // Humidity percentage
}

// Interface for the overall weather data structure
interface WeatherData {
  currentWeather?: CurrentWeather; // Current weather data (optional)
  forecast?: Forecast[]; // Array of forecast data (optional)
}

// DOM Elements
// These elements are used to interact with the DOM for data input and display
const searchForm = document.getElementById('search-form') as HTMLFormElement;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const todayContainer = document.querySelector('#today') as HTMLDivElement;
const forecastContainer = document.querySelector('#forecast') as HTMLDivElement;
const searchHistoryContainer = document.getElementById('history') as HTMLDivElement;
const heading = document.getElementById('search-title') as HTMLHeadingElement;
const weatherIcon = document.getElementById('weather-img') as HTMLImageElement;
const tempEl = document.getElementById('temp') as HTMLParagraphElement;
const windEl = document.getElementById('wind') as HTMLParagraphElement;
const humidityEl = document.getElementById('humidity') as HTMLParagraphElement;
const errorMessageElement = document.getElementById('error-message') as HTMLDivElement;

/*

API Calls

*/

// Function to fetch weather data from the backend API
const fetchWeather = async (cityName: string): Promise<WeatherData | void> => {
  showLoading(); // Show loading indicator
  try {
    const response = await fetch('/api/weather/', {
      method: 'POST', // POST request to send city name
      headers: {
        'Content-Type': 'application/json', // Specify JSON content
      },
      body: JSON.stringify({ cityName }), // Send city name in the request body
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`); // Handle response errors
    }

    const weatherData: WeatherData = await response.json(); // Parse JSON response

    console.log('Raw Weather API Response:', weatherData); // Debugging: log raw data

    if (weatherData.currentWeather) {
      renderCurrentWeather(weatherData.currentWeather); // Display current weather
    } else {
      console.warn('No current weather data found');
      errorMessageElement.textContent = 'No current weather data available.'; // Show error message
    }

    if (weatherData.forecast) {
      renderForecast(weatherData.forecast); // Display forecast data
    } else {
      console.warn('No forecast data found');
      errorMessageElement.textContent = 'No forecast data available.'; // Show error message
    }

    return weatherData; // Return data for further use
  } catch (error) {
    console.error('Error fetching weather:', error); // Log errors
    errorMessageElement.textContent = `Unable to fetch weather for "${cityName}". Please try again.`; // Show error message
  } finally {
    hideLoading(); // Hide loading indicator
  }
};

// Function to fetch search history from the backend API
const fetchSearchHistory = async (): Promise<{ cityName: string; id: string }[]> => {
  try {
    const response = await fetch('/api/weather/history', {
      method: 'GET', // GET request to fetch search history
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`); // Handle response errors
    }

    const history = await response.json(); // Parse JSON response

    return history.map((item: { cityName: string; id: string }) => ({
      cityName: item.cityName, // Map city name
      id: item.id, // Map city ID
    }));
  } catch (error) {
    console.error('Error fetching search history:', error); // Log errors
    return []; // Return empty array on failure
  }
};

// Function to delete a city from the search history
const deleteCityFromHistory = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/weather/history/${id}`, {
      method: 'DELETE', // DELETE request to remove a city
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error deleting city: ${response.statusText}`); // Handle response errors
    }
  } catch (error) {
    console.error('Error deleting city:', error); // Log errors
  }
};

/*

Render Functions

*/

// Function to render the current weather data to the DOM
const renderCurrentWeather = (currentWeather: CurrentWeather): void => {
  const { cityName, date, icon, iconDescription, temperature: tempF, windSpeed, humidity } = currentWeather;

  heading.textContent = `${cityName} (${date})`; // Set city name and date
  weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${icon}.png`); // Set weather icon
  weatherIcon.setAttribute('alt', iconDescription); // Set icon description
  tempEl.textContent = `Temp: ${tempF}°F`; // Set temperature
  windEl.textContent = `Wind: ${windSpeed} MPH`; // Set wind speed
  humidityEl.textContent = `Humidity: ${humidity}%`; // Set humidity

  todayContainer.innerHTML = ''; // Clear previous data
  todayContainer.append(heading, tempEl, windEl, humidityEl); // Append new data
};

// Function to render the forecast data to the DOM
const renderForecast = (forecast: Forecast[]): void => {
  forecastContainer.innerHTML = '<h4 class="col-12">5-Day Forecast:</h4>'; // Add title
  forecast.forEach(renderForecastCard); // Render each forecast card
};

// Function to render a single forecast card
const renderForecastCard = (forecast: Forecast): void => {
  const { date, icon, iconDescription, temperature: tempF, windSpeed, humidity } = forecast;

  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } = createForecastCard();

  cardTitle.textContent = date; // Set date
  weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${icon}.png`); // Set weather icon
  weatherIcon.setAttribute('alt', iconDescription); // Set icon description
  tempEl.textContent = `Temp: ${tempF} °F`; // Set temperature
  windEl.textContent = `Wind: ${windSpeed} MPH`; // Set wind speed
  humidityEl.textContent = `Humidity: ${humidity}%`; // Set humidity

  forecastContainer.append(col); // Append the forecast card
};

// Function to render the search history to the DOM
const renderSearchHistory = async (): Promise<void> => {
  const searchHistory = await fetchSearchHistory(); // Fetch search history

  searchHistoryContainer.innerHTML = searchHistory.length
    ? ''
    : '<p class="text-center">No Previous Search History</p>'; // Show message if empty

  searchHistory.forEach((cityName) => {
    const historyItem = buildHistoryListItem(cityName); // Build history item
    searchHistoryContainer.append(historyItem); // Append to container
  });
};

/*

Helper Functions

*/

// Function to create a forecast card structure
const createForecastCard = () => {
  const col = document.createElement('div'); // Column container
  const card = document.createElement('div'); // Card container
  const cardBody = document.createElement('div'); // Card body
  const cardTitle = document.createElement('h5'); // Card title
  const weatherIcon = document.createElement('img'); // Weather icon
  const tempEl = document.createElement('p'); // Temperature element
  const windEl = document.createElement('p'); // Wind speed element
  const humidityEl = document.createElement('p'); // Humidity element

  col.append(card);
  card.append(cardBody);
  cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

  col.classList.add('col-auto');
  card.classList.add('forecast-card', 'card', 'text-white', 'bg-primary', 'h-100');
  cardBody.classList.add('card-body', 'p-2');
  cardTitle.classList.add('card-title');
  tempEl.classList.add('card-text');
  windEl.classList.add('card-text');
  humidityEl.classList.add('card-text');

  return {
    col,
    cardTitle,
    weatherIcon,
    tempEl,
    windEl,
    humidityEl,
  };
};

// Function to build a search history list item
const buildHistoryListItem = (city: { cityName: string; id: string }) => {
  const newBtn = document.createElement('button'); // Button for city name
  newBtn.textContent = city.cityName;
  newBtn.classList.add('history-btn', 'btn', 'btn-secondary', 'col-10');
  newBtn.addEventListener('click', () => fetchWeather(city.cityName)); // Fetch weather on click

  const delBtn = document.createElement('button'); // Delete button
  delBtn.textContent = 'Delete';
  delBtn.classList.add('btn', 'btn-danger', 'col-2');
  delBtn.addEventListener('click', () => deleteCityFromHistory(city.id).then(renderSearchHistory)); // Delete city on click

  const historyDiv = document.createElement('div'); // Container for buttons
  historyDiv.classList.add('display-flex', 'gap-2', 'col-12', 'm-1');
  historyDiv.append(newBtn, delBtn);

  return historyDiv;
};

/*

Event Handlers

*/

// Handle the form submission for searching weather
const handleSearchFormSubmit = (event: Event): void => {
  event.preventDefault(); // Prevent default form behavior
  const city = searchInput.value.trim(); // Get input value

  if (!city) {
    errorMessageElement.textContent = 'City cannot be blank.'; // Show error for blank input
    return;
  }

  fetchWeather(city).then(() => renderSearchHistory()); // Fetch weather and update history
  searchInput.value = ''; // Clear input field
};

/*

Loading Indicator

*/

// Show loading indicator
const showLoading = () => (errorMessageElement.textContent = 'Loading...');

// Hide loading indicator
const hideLoading = () => (errorMessageElement.textContent = '');

/*

Initial Render

*/

// Add event listener to the search form
searchForm?.addEventListener('submit', handleSearchFormSubmit);

// Render the initial search history
renderSearchHistory();
