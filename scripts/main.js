// DOM Elements
const matchesContainer = document.querySelector('.matches-container');
const teamsContainer = document.querySelector('.teams-container');
const matchSearchForm = document.getElementById('match-search-form');
const searchInput = document.getElementById('search-input');
const matchesResults = document.querySelector('.matches-results');
const newsContainer = document.querySelector('.news-container');

// Fetch Featured Matches (debugging data delete later)
function fetchFeaturedMatches() {
  const matches = [
    { team1: 'Arsenal', team2: 'Chelsea', date: '2023-10-15', venue: 'Emirates Stadium' },
    { team1: 'Manchester United', team2: 'Liverpool', date: '2023-10-16', venue: 'Old Trafford' },
  ];

  matches.forEach(match => {
    const matchCard = document.createElement('div');
    matchCard.className = 'match-card';
    matchCard.innerHTML = `
      <h3>${match.team1} vs ${match.team2}</h3>
      <p>Date: ${match.date}</p>
      <p>Venue: ${match.venue}</p>
    `;
    matchesContainer.appendChild(matchCard);
  });
}

// Fetch Team Profiles (debugging data delete later)
function fetchTeamProfiles() {
  const teams = [
    { name: 'Arsenal', logo: 'assets/arsenal.png', standing: 1 },
    { name: 'Chelsea', logo: 'assets/chelsea.png', standing: 2 },
  ];

  teams.forEach(team => {
    const teamCard = document.createElement('div');
    teamCard.className = 'team-card';
    teamCard.innerHTML = `
      <img src="${team.logo}" alt="${team.name} Logo">
      <h3>${team.name}</h3>
      <p>Standing: ${team.standing}</p>
    `;
    teamsContainer.appendChild(teamCard);
  });
}

// Handle Match Search
matchSearchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const searchTerm = searchInput.value.trim();
  if (searchTerm) {
    // search results
    matchesResults.innerHTML = `<p>Search results for: ${searchTerm}</p>`;
  }
});

// Fetch News (debugging data delete later)
function fetchNews() {
  const news = [
    { title: 'Premier League Title Race Heats Up', source: 'BBC Sport' },
    { title: 'Injury Update: Key Players Return', source: 'Sky Sports' },
  ];

  news.forEach(item => {
    const newsCard = document.createElement('div');
    newsCard.className = 'news-card';
    newsCard.innerHTML = `
      <h3>${item.title}</h3>
      <p>Source: ${item.source}</p>
    `;
    newsContainer.appendChild(newsCard);
  });
}

// Initialize Functions
fetchFeaturedMatches();
fetchTeamProfiles();
fetchNews();