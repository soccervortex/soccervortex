// live-script.js

document.addEventListener('DOMContentLoaded', () => {
    const leagueSelect = document.getElementById('league-select');
    fetchLiveMatches(leagueSelect.value); // Fetch data for initially selected league

    leagueSelect.addEventListener('change', (event) => {
        fetchLiveMatches(event.target.value);
    });
});

async function fetchLiveMatches(league) {
    try {
        const response = await fetch(`https://soccervortex-github-io.onrender.com/soccer-data-live?league=${league}`);
        const data = await response.json();
        console.log(data.matches);
        displayLiveMatches(data.matches);
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

function displayLiveMatches(matches) {
    const container = document.getElementById('soccer-data-live');
    container.innerHTML = '';

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

        const matchElement = document.createElement('div');
        matchElement.className = 'match live';
        matchElement.innerHTML = `
            <div class="match-info">
                <p>
                    <img src="${match.homeTeam.crest}" alt="${match.homeTeam.name} logo" class="team-logo">
                    ${match.homeTeam.name} | ${homeScore} - ${awayScore} | ${match.awayTeam.name}
                    <img src="${match.awayTeam.crest}" alt="${match.awayTeam.name} logo" class="team-logo">
                </p>
                <p>Status: ${statusMapping[matchStatus] || matchStatus}</p>
                <p>Referee: ${match.referee}</p>
                <p>Date: ${new Date(match.utcDate).toLocaleString()}</p>
            </div>
        `;
        container.appendChild(matchElement);
    });
}
