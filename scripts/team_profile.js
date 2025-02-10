import { setCache, getCache } from './cache.js';

// API Configuration
const FOOTBALL_API_KEY = '137238e0d9fd9e50035c63ec4c3db5e2'; 
const FOOTBALL_API_HOST = 'v3.football.api-sports.io';
const CURRENT_SEASON = 2023;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// DOM Elements
const teamSelect = document.getElementById('team-select');
const teamSelectForm = document.getElementById('team-select-form');
const teamInfo = document.getElementById('team-info');
const playersInfo = document.getElementById('players-info');

// Fetch Teams
async function fetchTeams() {
  const data = await fetchAPIData('teams', {
    league: 39,
    season: CURRENT_SEASON
  }, 'teams');

  if (data) {
    populateTeamSelect(data);
  }
}

// Populate Team Select
function populateTeamSelect(teams) {
  teamSelect.innerHTML = teams.map(team => `
    <option value="${team.team.id}">${team.team.name}</option>
  `).join('');
}

// Fetch Team Information
async function fetchTeamInfo(teamId) {
  const data = await fetchAPIData('teams', {
    id: teamId
  }, `team_info_${teamId}`);

  if (data) {
    displayTeamInfo(data[0]);
    fetchPlayersInfo(teamId);
  }
}

// Display Team Information
function displayTeamInfo(team) {
  teamInfo.innerHTML = `
    <div class="team-profile">
      <img src="${team.team.logo}" alt="${team.team.name} Logo" class="team-logo-large">
      <h3>${team.team.name}</h3>
      <p><strong>Founded:</strong> ${team.team.founded}</p>
      <p><strong>Stadium:</strong> ${team.venue.name}</p>
      <p><strong>City:</strong> ${team.venue.city}</p>
      <p><strong>Capacity:</strong> ${team.venue.capacity}</p>
      <p><strong>Address:</strong> ${team.venue.address}</p>
      <p><strong>Surface:</strong> ${team.venue.surface}</p>
    </div>
  `;
}

// Fetch Players Information
async function fetchPlayersInfo(teamId) {
  const data = await fetchAPIData('players', {
    team: teamId,
    season: CURRENT_SEASON
  }, `players_info_${teamId}`);

  if (data) {
    displayPlayersInfo(data);
  }
}

// Display Players Information
function displayPlayersInfo(players) {
  playersInfo.innerHTML = players.map(player => `
    <div class="player-info-box">
      <img src="${player.player.photo}" alt="${player.player.name}" class="player-photo">
      <h4>${player.player.name}</h4>
      <p><strong>Position:</strong> ${player.statistics[0]?.games.position || 'N/A'}</p>
      <p><strong>Age:</strong> ${player.player.age || 'N/A'}</p>
      <p><strong>Nationality:</strong> ${player.player.nationality || 'N/A'}</p>
      <p><strong>Appearances:</strong> ${player.statistics[0]?.games.appearences || 'N/A'}</p>
      <p><strong>Goals:</strong> ${player.statistics[0]?.goals.total || 'N/A'}</p>
      <p><strong>Assists:</strong> ${player.statistics[0]?.goals.assists || 'N/A'}</p>
      <p><strong>Height:</strong> ${player.player.height || 'N/A'}</p>
      <p><strong>Weight:</strong> ${player.player.weight || 'N/A'}</p>
    </div>
  `).join('');
}

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

// Error Handling
function showErrorMessage() {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-danger mt-3';
  errorDiv.textContent = 'Failed to load data. Please try again later.';
  document.querySelector('main').prepend(errorDiv);
}

// Initialize Functions
document.addEventListener('DOMContentLoaded', () => {
  fetchTeams();

  teamSelectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const teamId = teamSelect.value;
    fetchTeamInfo(teamId);
  });
});