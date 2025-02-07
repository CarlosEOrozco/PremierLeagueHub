import { setCache, getCache } from './cache.js';

// API Configuration
const FOOTBALL_API_KEY = '137238e0d9fd9e50035c63ec4c3db5e2'; 
const FOOTBALL_API_HOST = 'v3.football.api-sports.io';
const NEWS_API_KEY = '8ed614c0b3b18fa34a158ef3424a9676'; 

//Const for the API endpoints
const CURRENT_SEASON = 2023;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// DOM Elements
const matchesContainer = document.querySelector('.matches-container');
const teamsContainer = document.querySelector('.teams-container');
const matchSearchForm = document.getElementById('match-search-form');
const searchInput = document.getElementById('search-input');
const matchesResults = document.querySelector('.matches-results');
const newsContainer = document.querySelector('.news-container');
const weatherContainer = document.getElementById('weather-container');
const roundsContainer = document.getElementById('rounds-container');

// Generic API Fetch Function with Cache
async function fetchAPIData(endpoint, params = {}, cacheKey) {
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const url = new URL(`https://${FOOTBALL_API_HOST}/${endpoint}`);
  url.search = new URLSearchParams(params).toString();

  try {
    const response = await fetch(url, {
      headers: {
        'x-rapidapi-host': FOOTBALL_API_HOST,
        'x-rapidapi-key': FOOTBALL_API_KEY
      }
    });

    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    if(data.errors.length > 0) throw new Error(data.errors.join(', '));
    
    setCache(cacheKey, data.response, CACHE_TTL);
    return data.response;

  } catch (error) {
    console.error('API Error:', error);
    showErrorMessage();
    return null;
  }
}

// Football Data Functions
async function fetchFeaturedMatches() {
  const data = await fetchAPIData('fixtures', {
    league: 39,
    season: new Date().getFullYear(),
    next: 10 // Get next 10 matches
  }, 'featuredMatches');

  if(data) {
    data.forEach(match => {
      const matchCard = document.createElement('div');
      matchCard.className = 'match-card';
      matchCard.innerHTML = `
        <h3>${match.teams.home.name} vs ${match.teams.away.name}</h3>
        <p>Date: ${new Date(match.fixture.date).toLocaleDateString()}</p>
        <p>Venue: ${match.fixture.venue.name}</p>
      `;
      matchesContainer.appendChild(matchCard);
      displayWeather(match.fixture.venue.name);
    });
  }
}

async function fetchTeamProfiles() {
  const data = await fetchAPIData('teams', {
    league: 39,
    season: new Date().getFullYear()
  }, 'teamProfiles');

  if(data) {
    data.forEach(team => {
      const teamCard = document.createElement('div');
      teamCard.className = 'team-card';
      teamCard.innerHTML = `
        <img src="${team.team.logo}" alt="${team.team.name} Logo">
        <h3>${team.team.name}</h3>
        <p>Founded: ${team.team.founded}</p>
        <p>Stadium: ${team.venue.name}</p>
      `;
      teamsContainer.appendChild(teamCard);
    });
  }
}

// Weather Functions
async function fetchWeather(stadium) {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${stadium}&units=metric&appid=${NEWS_API_KEY}`
  );
  return await response.json();
}

function displayWeather(stadium) {
  const weatherCard = document.createElement('div');
  weatherCard.className = 'col-md-4 mb-4';
  
  fetchWeather(stadium).then(data => {
    weatherCard.innerHTML = `
      <div class="weather-card">
        <h4>${data.name}</h4>
        <p>${data.weather[0].description}</p>
        <p>Temp: ${data.main.temp}°C</p>
        <p>Wind: ${data.wind.speed} m/s</p>
      </div>
    `;
    weatherContainer.appendChild(weatherCard);
  });
}

// Search Handler
matchSearchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const searchTerm = searchInput.value.trim();
  
  if (searchTerm) {
    const data = await fetchAPIData('fixtures', {
      league: 39,
      season: new Date().getFullYear(),
      search: searchTerm
    }, `search_${searchTerm}`);
    
    if(data) {
      matchesResults.innerHTML = data.map(match => `
        <div class="match-result">
          <p>${match.teams.home.name} vs ${match.teams.away.name}</p>
          <p>Date: ${new Date(match.fixture.date).toLocaleDateString()}</p>
        </div>
      `).join('');
    }
  }
});

// Error Handling
function showErrorMessage() {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-danger mt-3';
  errorDiv.textContent = 'Failed to load data. Please try again later.';
  document.querySelector('main').prepend(errorDiv);
}

//Rounds Function
// Fetch Available Rounds
async function fetchRounds() {
  try {
    const data = await fetchAPIData('fixtures/rounds', {
      league: 39,
      season: CURRENT_SEASON,
      current: 'false' // Set to 'true' to get only the current round
    }, 'rounds');

    if (data && data.length) {
      populateRounds(data);
    } else {
      throw new Error('No rounds data available');
    }
  } catch (error) {
    console.error('Error fetching rounds:', error);
    showErrorMessage();
  }
}

// Populate Rounds Selector
function populateRounds(rounds) {
  roundsContainer.innerHTML = `
    <div class="mb-4">
      <label class="form-label">Select Round:</label>
      <select id="round-select" class="form-select">
        ${rounds.map(round => `<option value="${round}">${round}</option>`).join('')}
      </select>
    </div>
  `;

  // Add event listener for round selection
  document.getElementById('round-select').addEventListener('change', (e) => {
    fetchMatchesByRound(e.target.value);
  });
}

// Fetch Matches for Specific Round
async function fetchMatchesByRound(round) {
  try {
    const data = await fetchAPIData('fixtures', {
      league: 39,
      season: CURRENT_SEASON,
      round: round
    }, `matches_${round}`);

    if (data) {
      populateMatches(data);
    } else {
      throw new Error('No matches data available for the selected round');
    }
  } catch (error) {
    console.error('Error fetching matches:', error);
    showErrorMessage();
  }
}

// Populate Matches
function populateMatches(fixtures) {
  const matchesHTML = fixtures.map(match => {
    const homeScore = match.goals.home !== null ? match.goals.home : '-';
    const awayScore = match.goals.away !== null ? match.goals.away : '-';

    return `
      <tr>
        <td>${new Date(match.fixture.date).toLocaleDateString()}</td>
        <td><img src="${match.teams.home.logo}" alt="${match.teams.home.name}" class="team-logo"> ${match.teams.home.name}</td>
        <td>${homeScore} - ${awayScore}</td>
        <td><img src="${match.teams.away.logo}" alt="${match.teams.away.name}" class="team-logo"> ${match.teams.away.name}</td>
        <td>${match.fixture.venue.name}</td>
        <td><span class="badge bg-primary">${match.fixture.status.short}</span></td>
      </tr>
    `;
  }).join('');

  matchesContainer.innerHTML = `
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Date</th>
          <th>Home Team</th>
          <th>Score</th>
          <th>Away Team</th>
          <th>Venue</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${matchesHTML}
      </tbody>
    </table>
  `;
}

// Initialize Functions
document.addEventListener('DOMContentLoaded', () => {
  fetchFeaturedMatches();
  fetchTeamProfiles();
  fetchRounds(); // Fetch rounds on page load

  // Hide arrows by default
  document.querySelectorAll('.sortable').forEach(header => {
    header.removeAttribute('data-sort-order');
  });
});