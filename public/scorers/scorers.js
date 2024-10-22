// Function to fetch top scorers data from the server
async function fetchScorers(league) {
    try {
        const response = await fetch(`/soccer-data-scorers?league=${league}`);
        if (!response.ok) {
            throw new Error('Failed to fetch top scorers');
        }

        const data = await response.json();
        console.log(data);

        displayScorers(data.scorers);
    } catch (error) {
        console.error('Error fetching scorers:', error);
    }
}

// Function to update the league logo when league changes
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

// Function to display the fetched scorers on the page
function displayScorers(scorers) {
    const scorersContainer = document.getElementById('soccer-data-scorers');
    scorersContainer.innerHTML = ''; // Clear previous data

    scorers.forEach((scorer, index) => {
        const scorerElement = document.createElement('div');
        scorerElement.className = 'scorer';

        const rankElement = document.createElement('span');
        rankElement.className = 'scorer-position';
        rankElement.textContent = `${index + 1}. `;

        const logoImg = document.createElement('img');
        logoImg.src = scorer.teamLogo;
        logoImg.alt = `${scorer.teamName} Logo`;
        logoImg.className = 'team-logo';

        const nameElement = document.createElement('span');
        nameElement.className = 'scorer-name';
        nameElement.textContent = scorer.playerName;

        const teamElement = document.createElement('span');
        teamElement.className = 'team-name';
        teamElement.textContent = scorer.teamName;

        const goalsElement = document.createElement('span');
        goalsElement.className = 'scorer-goals';
        goalsElement.textContent = `Goals: ${scorer.goals}`;

        // Append elements to the scorer element
        scorerElement.appendChild(rankElement);
        scorerElement.appendChild(logoImg);
        scorerElement.appendChild(nameElement);
        scorerElement.appendChild(teamElement);
        scorerElement.appendChild(goalsElement);

        scorersContainer.appendChild(scorerElement);
    });
}

// Initialize the page with default league scorers on load
document.addEventListener('DOMContentLoaded', () => {
    const leagueSelect = document.getElementById('league-select');
    updateLeagueLogo(leagueSelect); // Update logo
    fetchScorers(leagueSelect.value); // Load default league scorers
});

// Fetch scorers when the league is changed
document.getElementById('league-select').addEventListener('change', (event) => {
    fetchScorers(event.target.value);
});
