// API Configuration
const FOOTBALL_API_KEY = '137238e0d9fd9e50035c63ec4c3db5e2'; // Replace with your API key
const FOOTBALL_API_HOST = 'v3.football.api-sports.io';
const NEWS_API_KEY = 'YOUR_NEWS_API_KEY'; // Replace with NewsAPI key

//Const for the API endpoints
const CURRENT_SEASON = 2023;

// DOM Elements
const matchesContainer = document.querySelector('.matches-container');
const teamsContainer = document.querySelector('.teams-container');
const matchSearchForm = document.getElementById('match-search-form');
const searchInput = document.getElementById('search-input');
const matchesResults = document.querySelector('.matches-results');
const newsContainer = document.querySelector('.news-container');
const standingsBody = document.getElementById('standings-body');
const weatherContainer = document.getElementById('weather-container');
const roundsContainer = document.getElementById('rounds-container');




// Generic API Fetch Function
async function fetchAPIData(endpoint, params = {}) {
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
    
    return data.response;

  } catch (error) {
    console.error('API Error:', error);
    showErrorMessage();
    return null;
  }
}

// Football Data Functions
async function fetchStandings() {
    try {
      const data = await fetchAPIData('standings', {
        league: 39,
        season: CURRENT_SEASON 
      });

      if (!data || !data.length) {
        throw new Error('No standings data available for 2023');
      }

      // Add null checks with optional chaining
      const standings = data[0]?.league?.standings?.[0];

      if (!standings) {
        throw new Error('2023 standings data format is incorrect');
      }

      populateStandings(standings);
    } catch (error) {
      console.error('Error fetching 2023 standings:', error);
      showErrorMessage();
    }
}

function populateStandings(teams) {
  standingsBody.innerHTML = teams.map((team, index) => {
    let status = '';
    let rowClass = '';
    
    //Bootstrap color rows
    if (index < 4) {
      status = 'UCL';
      rowClass = 'table-success';
    } else if (index === 4) {
      status = 'UEL';
      rowClass = 'table-warning';
    } else if (index >= teams.length - 3) {
      status = 'REL';
      rowClass = 'table-danger';
    }

    return `
      <tr class="${rowClass}">
        <td>${team.rank}</td>
        <td><img src="${team.team.logo}" alt="${team.team.name}" class="team-crest"> ${team.team.name}</td>
        <td>${team.points}</td>
        <td>${team.all.played}</td>
        <td>${team.all.win}</td>
        <td>${team.all.draw}</td>
        <td>${team.all.lose}</td>
        <td>${team.all.goals.for}</td>
        <td>${team.all.goals.against}</td>
        <td>${status}</td>
      </tr>
    `;
  }).join('');
}

async function fetchFeaturedMatches() {
  const data = await fetchAPIData('fixtures', {
    league: 39,
    season: new Date().getFullYear(),
    next: 10 // Get next 10 matches
  });

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
  });

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

// Sorting Function
function sortTable(column, order) {
  const rows = Array.from(standingsBody.querySelectorAll('tr'));
  const columnIndex = Array.from(column.parentNode.children).indexOf(column);

  rows.sort((a, b) => {
    const cellA = a.children[columnIndex].textContent.trim();
    const cellB = b.children[columnIndex].textContent.trim();

    if (!isNaN(cellA) && !isNaN(cellB)) {
      return order === 'asc' ? cellA - cellB : cellB - cellA;
    } else {
      return order === 'asc' ? cellA.localeCompare(cellB) : cellB.localeCompare(cellA);
    }
  });

  standingsBody.innerHTML = '';
  rows.forEach(row => standingsBody.appendChild(row));
}

// Event Listener for Sorting
document.querySelectorAll('.sortable').forEach(header => {
  header.addEventListener('click', () => {
    const currentOrder = header.getAttribute('data-sort-order');
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';

    // Clear sort order from all headers
    document.querySelectorAll('.sortable').forEach(h => {
      h.removeAttribute('data-sort-order');
    });

    // Set sort order for the clicked header
    header.setAttribute('data-sort-order', newOrder);
    sortTable(header, newOrder);
  });
});

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

// News Functions
async function fetchNews() {
  const response = await fetch(
    `https://newsapi.org/v2/everything?q=premier+league&apiKey=${NEWS_API_KEY}`
  );
  const data = await response.json();
  populateNews(data.articles);
}

function populateNews(articles) {
  newsContainer.innerHTML = articles.slice(0, 4).map(article => `
    <div class="col-md-6 mb-4">
      <div class="news-card">
        <h3>${article.title}</h3>
        <p>${article.description}</p>
        <a href="${article.url}" target="_blank" class="btn btn-primary">Read More</a>
      </div>
    </div>
  `).join('');
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
    });
    
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
    });

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
    });

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
  fetchStandings();
  fetchNews();
  fetchRounds(); // Fetch rounds on page load

  // Hide arrows by default
  document.querySelectorAll('.sortable').forEach(header => {
    header.removeAttribute('data-sort-order');
  });
});