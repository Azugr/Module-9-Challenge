import './styles/jass.css';

// Define the interfaces for the expected data structure
interface CurrentWeather {
  cityName: string;
  date: string;
  icon: string;
  iconDescription: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
}

interface Forecast {
  date: string;
  icon: string;
  iconDescription: string;
  temperature: number;
  windSpeed: number;
  humidity: number;
}

interface WeatherData {
  currentWeather?: CurrentWeather;
  forecast?: Forecast[];
}

// * DOM Elements
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

const fetchWeather = async (cityName: string): Promise<WeatherData | void> => {
  showLoading(); // Show loading indicator
  try {
    const response = await fetch('/api/weather/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cityName }),
    });

    // Check if the response is OK
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }

    // Parse the JSON response
    const weatherData: WeatherData = await response.json();

    // Log raw data for debugging
    console.log('Raw Weather API Response:', weatherData);

    // Validate and render current weather
    if (weatherData.currentWeather) {
      renderCurrentWeather(weatherData.currentWeather);
    } else {
      console.warn('No current weather data found');
      errorMessageElement.textContent = 'No current weather data available.';
    }

    // Validate and render forecast
    if (weatherData.forecast) {
      renderForecast(weatherData.forecast);
    } else {
      console.warn('No forecast data found');
      errorMessageElement.textContent = 'No forecast data available.';
    }

    return weatherData; // Return the weather data for further use
  } catch (error) {
    console.error('Error fetching weather:', error);
    errorMessageElement.textContent = `Unable to fetch weather for "${cityName}". Please try again.`;
  } finally {
    hideLoading(); // Hide loading indicator
  }
};

const fetchSearchHistory = async (): Promise<{ cityName: string; id: string }[]> => {
  try {
    const response = await fetch('/api/weather/history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    // Transform the data structure
    const history = await response.json();
    return history.map((item: { name: string; id: string }) => ({
      cityName: item.name,
      id: item.id,
    }));
  } catch (error) {
    console.error('Error fetching search history:', error);
    return [];
  }
};

const deleteCityFromHistory = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`/api/weather/history/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error deleting city: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting city:', error);
  }
};

/*

Render Functions

*/

const renderCurrentWeather = (currentWeather: CurrentWeather): void => {
  const { cityName, date, icon, iconDescription, temperature: tempF, windSpeed, humidity } = currentWeather;

  heading.textContent = `${cityName} (${date})`;
  weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${icon}.png`);
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${tempF}°F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity}%`;

  todayContainer.innerHTML = '';
  todayContainer.append(heading, tempEl, windEl, humidityEl);
};

const renderForecast = (forecast: Forecast[]): void => {
  forecastContainer.innerHTML = '<h4 class="col-12">5-Day Forecast:</h4>';
  forecast.forEach(renderForecastCard);
};

const renderForecastCard = (forecast: Forecast): void => {
  const { date, icon, iconDescription, temperature: tempF, windSpeed, humidity } = forecast;

  const { col, cardTitle, weatherIcon, tempEl, windEl, humidityEl } = createForecastCard();

  cardTitle.textContent = date;
  weatherIcon.setAttribute('src', `https://openweathermap.org/img/w/${icon}.png`);
  weatherIcon.setAttribute('alt', iconDescription);
  tempEl.textContent = `Temp: ${tempF} °F`;
  windEl.textContent = `Wind: ${windSpeed} MPH`;
  humidityEl.textContent = `Humidity: ${humidity}%`;

  forecastContainer.append(col);
};

const renderSearchHistory = async (): Promise<void> => {
  const searchHistory = await fetchSearchHistory();

  searchHistoryContainer.innerHTML = searchHistory.length
    ? ''
    : '<p class="text-center">No Previous Search History</p>';

  searchHistory.forEach((cityName) => {
    const historyItem = buildHistoryListItem(cityName);
    searchHistoryContainer.append(historyItem);
  });
};

/*

Helper Functions

*/

const createForecastCard = () => {
  const col = document.createElement('div');
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardTitle = document.createElement('h5');
  const weatherIcon = document.createElement('img');
  const tempEl = document.createElement('p');
  const windEl = document.createElement('p');
  const humidityEl = document.createElement('p');

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

const buildHistoryListItem = (city: { cityName: string; id: string }) => {
  const newBtn = document.createElement('button');
  newBtn.textContent = city.cityName;
  newBtn.classList.add('history-btn', 'btn', 'btn-secondary', 'col-10');
  newBtn.addEventListener('click', () => fetchWeather(city.cityName));

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.classList.add('btn', 'btn-danger', 'col-2');
  delBtn.addEventListener('click', () => deleteCityFromHistory(city.id).then(renderSearchHistory));

  const historyDiv = document.createElement('div');
  historyDiv.classList.add('display-flex', 'gap-2', 'col-12', 'm-1');
  historyDiv.append(newBtn, delBtn);

  return historyDiv;
};

/*

Event Handlers

*/

const handleSearchFormSubmit = (event: Event): void => {
  event.preventDefault();
  const city = searchInput.value.trim();

  if (!city) {
    errorMessageElement.textContent = 'City cannot be blank.';
    return;
  }

  fetchWeather(city).then(() => renderSearchHistory());
  searchInput.value = '';
};

/*

Loading Indicator

*/

const showLoading = () => (errorMessageElement.textContent = 'Loading...');
const hideLoading = () => (errorMessageElement.textContent = '');

/*

Initial Render

*/

searchForm?.addEventListener('submit', handleSearchFormSubmit);

renderSearchHistory();
