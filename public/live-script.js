document.addEventListener('DOMContentLoaded', () => {
    const leagueSelect = document.getElementById('league-select');
    fetchLiveMatches(leagueSelect.value); // Fetch data for initially selected league

    leagueSelect.addEventListener('change', (event) => {
        fetchLiveMatches(event.target.value);
    });

    // Set up regular updates every 10 seconds
    setInterval(() => {
        fetchLiveMatches(leagueSelect.value);
    }, 10000);
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
  PAUSED: 'Paused',
  FINISHED: 'Finished',
  POSTPONED: 'Postponed',
  SUSPENDED: 'Suspended',
  CANCELLED: 'Cancelled'
};

// Store matches that have finished with the time they were last shown
let finishedMatches = {};

function displayLiveMatches(matches) {
    const container = document.getElementById('soccer-data-live');
    container.innerHTML = '';

    if (!matches || matches.length === 0) {
        container.innerHTML = '<p>No live matches found for the selected league.</p>';
        return;
    }

    // Filter live or paused matches
    const liveMatches = matches.filter(match => match.status === 'IN_PLAY' || match.status === 'LIVE' || match.status === 'PAUSED');

    // Handle finished matches
    matches.forEach(match => {
        if (match.status === 'FINISHED') {
            // If the match has just finished, record its finish time if not already recorded
            if (!finishedMatches[match.id]) {
                finishedMatches[match.id] = Date.now();
            }
        }
    });

    // Check if 2 minutes 30 seconds have passed since the match finished, if so remove it from the finishedMatches
    const now = Date.now();
    Object.keys(finishedMatches).forEach(matchId => {
        if (now - finishedMatches[matchId] > 150000) { // 150000 ms is 2 minutes 30 seconds
            delete finishedMatches[matchId];
        }
    });

    // Show live or paused matches
    liveMatches.forEach(match => {
        renderMatch(match, container);
    });

    // Show matches that are finished but haven't yet passed the 2 min 30 sec mark
    matches.filter(match => match.status === 'FINISHED' && finishedMatches[match.id]).forEach(match => {
        renderMatch(match, container);
    });
}

function renderMatch(match, container) {
    const homeScore = match.score.fullTime.home !== null ? match.score.fullTime.home : '-';
    const awayScore = match.score.fullTime.away !== null ? match.score.fullTime.away : '-';
    const matchStatus = match.status;

    const matchElement = document.createElement('div');
    matchElement.className = 'match live';
    matchElement.innerHTML = `
        <div class="match-info">
            <p>
                <img src="${match.homeTeamLogo}" alt="${match.homeTeam.name} logo" class="team-logo">
                ${match.homeTeam.name} | ${homeScore} vs ${awayScore} | ${match.awayTeam.name}
                <img src="${match.awayTeamLogo}" alt="${match.awayTeam.name} logo" class="team-logo">
            </p>
            <p>Status: ${statusMapping[matchStatus] || matchStatus}</p>
            <p>Referee: ${match.referee}</p>
            <p>Date: ${new Date(match.utcDate).toLocaleString()}</p>
        </div>
    `;
    container.appendChild(matchElement);
}
