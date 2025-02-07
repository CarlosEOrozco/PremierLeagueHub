const FOOTBALL_API_KEY = '137238e0d9fd9e50035c63ec4c3db5e2'; // Replace with your API key
const FOOTBALL_API_HOST = 'v3.football.api-sports.io';
const CURRENT_SEASON = 2023;

// DOM Elements
const standingsBody = document.getElementById('standings-body');

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

// Initialize Standings Functions
document.addEventListener('DOMContentLoaded', () => {
  fetchStandings();

  // Hide arrows by default
  document.querySelectorAll('.sortable').forEach(header => {
    header.removeAttribute('data-sort-order');
  });
});