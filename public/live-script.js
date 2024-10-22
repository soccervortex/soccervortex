document.addEventListener('DOMContentLoaded', () => {
    const leagueSelect = document.getElementById('league-select');
    fetchLiveMatches(leagueSelect.value); // Fetch data for initially selected league

    leagueSelect.addEventListener('change', (event) => {
        fetchLiveMatches(event.target.value);
    });

    // Set up regular updates every 1 second
    setInterval(() => {
        fetchLiveMatches(leagueSelect.value);
    }, 1000);
});

async function fetchLiveMatches(league) {
    try {
        const response = await fetch(`https://soccervortex-github-io.onrender.com/soccer-data-live?league=${league}`);
        const data = await response.json();
        console.log(data.matches);
        updateLiveMatches(data.matches);
    } catch (error) {
        console.error('Error fetching live matches:', error);
    }
}

const statusMapping = {
  SCHEDULED: 'Scheduled',
  LIVE: 'Live',
  IN_PLAY: 'Playing',
  PAUSED: 'HT',
  FINISHED: 'Finished',
  POSTPONED: 'Postponed',
  SUSPENDED: 'Suspended',
  CANCELLED: 'Cancelled'
};

function updateLiveMatches(matches) {
    const container = document.getElementById('soccer-data-live');
    
    // Check if live matches exist
    if (!matches || matches.length === 0) {
        container.innerHTML = '<p>No live matches found for the selected league.</p>';
        return;
    }

    // Filter live matches
    const liveMatches = matches.filter(match => match.status === 'IN_PLAY' || match.status === 'LIVE' || match.status === 'PAUSED');

    if (liveMatches.length === 0) {
        container.innerHTML = '<p>No live matches found.</p>';
        return;
    }

    liveMatches.forEach(match => {
        const homeScore = match.score.fullTime.home !== null ? match.score.fullTime.home : '-';
        const awayScore = match.score.fullTime.away !== null ? match.score.fullTime.away : '-';
        const matchStatus = match.status;

        // Check if the match element already exists
        let matchElement = document.querySelector(`[data-match-id="${match.id}"]`);

        if (!matchElement) {
            // Create new match element if it doesn't exist
            matchElement = document.createElement('div');
            matchElement.className = 'match live';
            matchElement.setAttribute('data-match-id', match.id); // Add match ID for tracking

            matchElement.innerHTML = `
                <div class="match-info">
                    <p>
                        <img src="${match.homeTeam.crest}" alt="${match.homeTeam.name} logo" class="team-logo">
                        ${match.homeTeam.name} | <span class="home-score">${homeScore}</span> - <span class="away-score">${awayScore}</span> | ${match.awayTeam.name}
                        <img src="${match.awayTeam.crest}" alt="${match.awayTeam.name} logo" class="team-logo">
                    </p>
                    <p>Status: <span class="match-status">${statusMapping[matchStatus] || matchStatus}</span></p>
                    <p>Referee: ${match.referee}</p>
                    <p>Date: ${new Date(match.utcDate).toLocaleDateString()}</p>
                </div>
            `;
            container.appendChild(matchElement);
        } else {
            // Update scores and status in the existing element
            matchElement.querySelector('.home-score').textContent = homeScore;
            matchElement.querySelector('.away-score').textContent = awayScore;
            matchElement.querySelector('.match-status').textContent = statusMapping[matchStatus] || matchStatus;
        }
    });
}
