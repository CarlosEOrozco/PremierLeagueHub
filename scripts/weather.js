import { setCache, getCache } from './cache.js';

const OPENWEATHER_API_KEY = '8ed614c0b3b18fa34a158ef3424a9676'; // Replace with your OpenWeather API key

// List of states in England with their coordinates
const states = [
  { name: 'London', lat: 51.5074, lon: -0.1278 },
  { name: 'Manchester', lat: 53.4808, lon: -2.2426 },
  { name: 'Birmingham', lat: 52.4862, lon: -1.8904 },
  { name: 'Leeds', lat: 53.8008, lon: -1.5491 },
  { name: 'Liverpool', lat: 53.4084, lon: -2.9916 },
  { name: 'Newcastle', lat: 54.9783, lon: -1.6175 },
  { name: 'Sheffield', lat: 53.3811, lon: -1.4701 },
  { name: 'Bristol', lat: 51.4545, lon: -2.5879 },
  { name: 'Nottingham', lat: 52.9548, lon: -1.1581 },
  { name: 'Leicester', lat: 52.6369, lon: -1.1398 }
];

// Fetch Weather Data
async function fetchWeatherData(lat, lon) {
  const cacheKey = `weather_${lat}_${lon}`;
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather API request failed');
    
    const data = await response.json();
    setCache(cacheKey, data, 60 * 60 * 1000); // Cache for 1 hour
    return data;
  } catch (error) {
    console.error('Weather API Error:', error);
    showErrorMessage();
    return null;
  }
}

// Display Weather Data
function displayWeatherData(weatherData) {
  const weatherContainer = document.getElementById('weather-container');
  const weatherCard = document.createElement('div');
  weatherCard.className = 'weather-card';

  const iconUrl = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

  weatherCard.innerHTML = `
    <h4>${weatherData.name}</h4>
    <div class="weather-info">
      <img src="${iconUrl}" alt="${weatherData.weather[0].description}" class="weather-icon">
      <div>
        <p>${weatherData.weather[0].description}</p>
        <p>Temperature: ${weatherData.main.temp}°C</p>
        <p>Feels Like: ${weatherData.main.feels_like}°C</p>
        <p>Humidity: ${weatherData.main.humidity}%</p>
        <p>Wind Speed: ${weatherData.wind.speed} m/s</p>
      </div>
    </div>
  `;

  weatherContainer.appendChild(weatherCard);
}

// Fetch and Display Weather for a Specific Location
async function fetchAndDisplayWeather(lat, lon) {
  const weatherData = await fetchWeatherData(lat, lon);
  if (weatherData) {
    displayWeatherData(weatherData);
  }
}

// Fetch and Display Weather for All States
async function fetchAndDisplayWeatherForAllStates() {
  const weatherContainer = document.getElementById('weather-container');
  const weatherDataPromises = states.map(state => fetchWeatherData(state.lat, state.lon));
  const weatherDataArray = await Promise.all(weatherDataPromises);

  const weatherTableRows = weatherDataArray.map((weatherData, index) => {
    if (weatherData) {
      const iconUrl = `http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;
      let rowClass = '';

      // Custom row classes based on weather conditions
      if (weatherData.weather[0].main === 'Clear') {
        rowClass = 'table-primary';
      } else if (weatherData.weather[0].main === 'Clouds') {
        rowClass = 'table-primary';
      } else if (weatherData.weather[0].main === 'Rain') {
        rowClass = 'table-primary';
      } else if (weatherData.weather[0].main === 'Snow') {
        rowClass = 'table-primary';
      }

      return `
        <tr class="${rowClass}">
          <td>${states[index].name}</td>
          <td><img src="${iconUrl}" alt="${weatherData.weather[0].description}" class="weather-icon"> ${weatherData.weather[0].description}</td>
          <td>${weatherData.main.temp}°C</td>
          <td>${weatherData.main.feels_like}°C</td>
          <td>${weatherData.main.humidity}%</td>
          <td>${weatherData.wind.speed} m/s</td>
        </tr>
      `;
    } else {
      return `
        <tr>
          <td>${states[index].name}</td>
          <td colspan="5">Failed to load data</td>
        </tr>
      `;
    }
  }).join('');

  weatherContainer.innerHTML = `
    <table class="table table-striped">
      <thead>
        <tr>
          <th>State</th>
          <th>Weather</th>
          <th>Temperature</th>
          <th>Feels Like</th>
          <th>Humidity</th>
          <th>Wind Speed</th>
        </tr>
      </thead>
      <tbody>
        ${weatherTableRows}
      </tbody>
    </table>
  `;
}

// Initialize Weather Functions
document.addEventListener('DOMContentLoaded', () => {
  fetchAndDisplayWeatherForAllStates();
});