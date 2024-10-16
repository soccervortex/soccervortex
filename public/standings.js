// standings.js

// Function to fetch standings data from the server
async function fetchStandings(league) {
    try {
        const response = await fetch(`https://soccervortex-github-io.onrender.com/soccer-data-standings?league=${league}`);
        if (!response.ok) {
            throw new Error('Failed to fetch standings');
        }

        const data = await response.json();
        console.log(data); // Inspect the entire response

        // Check if standings is an array
        if (!Array.isArray(data.standings)) {
            console.error('Standings data is not in the expected format:', data);
            return;
        }

        displayStandings(data.standings); // Call function to display standings data
    } catch (error) {
        console.error('Error fetching standings:', error);
    }
}

function updateLeagueLogo(select) {
    const selectedOption = select.options[select.selectedIndex];
    const logoPath = selectedOption.getAttribute('data-logo');
  
    if (logoPath) {
      document.querySelector('.container h1').innerHTML = `
          <img src="${logoPath}" alt="${selectedOption.text} logo" class="league-logo">
          ${selectedOption.text}
      `;
    }
  }

  function displayStandings(standings) {
    const standingsContainer = document.getElementById('soccer-data-standings');
    standingsContainer.innerHTML = ''; // Clear previous standings

    standings.forEach(team => {
        const teamElement = document.createElement('div');
        teamElement.className = 'team';

        // Create elements for the position, logo, name, and points
        const positionElement = document.createElement('div');
        positionElement.className = 'team-position';
        positionElement.textContent = `${team.position}. `;

        const logoImg = document.createElement('img');
        logoImg.src = team.logo; // Corrected to use 'logo'
        logoImg.alt = `${team.team.name} Logo`; // Ensure you are using the right reference for the team name
        logoImg.className = 'team-logo';

        const teamName = document.createElement('div');
        teamName.className = 'team-name';
        teamName.textContent = team.team.name; // Ensure you're using the right reference for team name

        const teamPoints = document.createElement('div');
        teamPoints.className = 'team-points';
        teamPoints.textContent = team.points; 

        // Append all elements to the team element
        teamElement.appendChild(positionElement);
        teamElement.appendChild(logoImg);
        teamElement.appendChild(teamName);
        teamElement.appendChild(teamPoints);

        standingsContainer.appendChild(teamElement);
    });
}

// Initialize the page with default league standings on load
document.addEventListener('DOMContentLoaded', () => {
    const leagueSelect = document.getElementById('league-select');
    updateLeagueLogo(leagueSelect); // Update logo
    fetchStandings(leagueSelect.value); // Load default league standings
});

// Fetch standings again when the league is changed
document.getElementById('league-select').addEventListener('change', (event) => {
    fetchStandings(event.target.value);
});

