// script.js

document.addEventListener('DOMContentLoaded', () => {
    const leagueSelect = document.getElementById('league-select');
    updateLeagueLogo(leagueSelect); // Initialize with default selected option
  
    leagueSelect.addEventListener('change', (event) => {
      const selectedLeague = event.target.value;
      updateLeagueLogo(event.target);
      fetchSoccerData(selectedLeague);
    });
  
    fetchSoccerData(leagueSelect.value); // Fetch data for initially selected league
  });
  
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
  
  async function fetchSoccerData(league) {
    try {
      const response = await fetch(`https://soccervortex-github-io.onrender.com/soccer-data-upcoming?league=${league}`);
      const data = await response.json();
      
      // Log the entire matches array to inspect the structure
      console.log(data.matches);
      
      // Process the data as usual
      await displayData(data.matches); // Ensure displayData is awaited
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }
  
  // Map of statuses for user-friendly display
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
  
  async function displayData(matches) {
    const container = document.getElementById('soccer-data-upcoming');
    container.innerHTML = '';
  
    if (!matches || matches.length === 0) {
      container.innerHTML = '<p>No matches found for the selected league.</p>';
      return;
    }
  
    // Sort matches by UTC date
    matches.sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
  
    const processMatch = async (match) => {
      const homeTeamName = match.homeTeam.name;
      const awayTeamName = match.awayTeam.name;
      const matchStatus = match.status;
  
      // Check if the match is finished
      if (matchStatus === 'SCHEDULED') {
        const matchElement = document.createElement('div');
        matchElement.className = 'match';
        matchElement.innerHTML = `
            <div class="match-info">
                <p>
                    <img src="${match.homeTeam.crest}" alt="${homeTeamName} logo" class="team-logo">
                    ${homeTeamName} - 
                    ${awayTeamName}
                    <img src="${match.awayTeam.crest}" alt="${awayTeamName} logo" class="team-logo">
                </p>
                <p>Date: ${new Date(match.utcDate).toLocaleDateString()}</p>
                <p>Timezone: UTC</p>
            </div>
        `;
        container.appendChild(matchElement);
      }
    };
  
    // Process each match in the sorted order
    await Promise.all(matches.map(match => processMatch(match))); // Use Promise.all for concurrent processing
  }
  