// Define the default league
const defaultLeague = 'PL'; // Example: Use the code for Premier League

// Add event listener for league selection changes
document.getElementById('league-select').addEventListener('change', function() {
    const league = this.value;
    if (league) {
        fetchTeams(league);
    } else {
        // Clear the teams container if no league is selected
        document.getElementById('teams-container').innerHTML = '';
    }
});

// Function to fetch teams based on the selected league
function fetchTeams(league) {
    fetch(`/soccer-data-teams?league=${league}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Ensure there are teams to display
            if (data.teams && data.teams.length > 0) {
                displayTeams(data.teams);
            } else {
                // Handle case where no teams are returned
                document.getElementById('teams-container').innerHTML = '<p>No teams found.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching teams:', error);
        });
}

// Function to display the fetched teams
function displayTeams(teams) {
    const teamsContainer = document.getElementById('teams-container');
    teamsContainer.innerHTML = ''; // Clear previous teams

    teams.forEach(team => {
        const teamCard = document.createElement('div');
        teamCard.classList.add('team-card');
        teamCard.innerHTML = `
            <img src="${team.logo || 'images/default-club-logo.png'}" alt="${team.name}">
            <h3>${team.name}</h3>
        `;
        teamsContainer.appendChild(teamCard);
    });
}

// Call the fetchTeams function with the default league on page load
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('league-select').value = defaultLeague; // Set the default league in the select element
    fetchTeams(defaultLeague); // Fetch and display teams for the default league
});
