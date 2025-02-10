import { setCache, getCache } from './cache.js';

// API Configuration
const FOOTBALL_API_KEY = '137238e0d9fd9e50035c63ec4c3db5e2'; 
const FOOTBALL_API_HOST = 'v3.football.api-sports.io';
const CURRENT_SEASON = 2023;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// DOM Elements
const teamSelect = document.getElementById('team-select');
const matchSearchForm = document.getElementById('match-search-form');
const matchesResults = document.querySelector('.matches-results');

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

// Fetch Matches for a Specific Team
async function fetchMatchesByTeam(teamId) {
  const data = await fetchAPIData('fixtures', {
    league: 39,
    season: CURRENT_SEASON,
    team: teamId
  }, `matches_team_${teamId}`);

  if (data) {
    populateMatches(data);
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
        <td>${match.league.round}</td>
        <td><img src="${match.teams.home.logo}" alt="${match.teams.home.name}" class="team-logo"> ${match.teams.home.name}</td>
        <td>${homeScore} - ${awayScore}</td>
        <td><img src="${match.teams.away.logo}" alt="${match.teams.away.name}" class="team-logo"> ${match.teams.away.name}</td>
        <td>${match.fixture.venue.name}</td>
        <td><span class="badge bg-primary">${match.fixture.status.short}</span></td>
      </tr>
    `;
  }).join('');

  matchesResults.innerHTML = `
    <table class="table table-striped">
      <thead>
        <tr>
          <th>Date</th>
          <th>Round</th>
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

  matchSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const teamId = teamSelect.value;
    fetchMatchesByTeam(teamId);
  });
});