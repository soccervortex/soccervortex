// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static('public'));

// Endpoint to fetch soccer data
const apiKey = '1d171366cdf64118b495dba4cf37603f'; // Replace with your Football Data API key

const matchesUrls = {
    PL: 'https://api.football-data.org/v4/competitions/PL/matches',
    CL: 'https://api.football-data.org/v4/competitions/CL/matches',
    BL1: 'https://api.football-data.org/v4/competitions/BL1/matches',
    DED: 'https://api.football-data.org/v4/competitions/DED/matches',
    BSA: 'https://api.football-data.org/v4/competitions/BSA/matches',
    PD: 'https://api.football-data.org/v4/competitions/PD/matches',
    FL1: 'https://api.football-data.org/v4/competitions/FL1/matches',
    ELC: 'https://api.football-data.org/v4/competitions/ELC/matches',
    PPL: 'https://api.football-data.org/v4/competitions/PPL/matches',
    EC: 'https://api.football-data.org/v4/competitions/EC/matches',
    SA: 'https://api.football-data.org/v4/competitions/SA/matches',
    CLI: 'https://api.football-data.org/v4/competitions/CLI/matches',
    WC: 'https://api.football-data.org/v4/competitions/WC/matches',
};

const standingsUrls = {
    PL: 'https://api.football-data.org/v4/competitions/PL/standings',
    CL: 'https://api.football-data.org/v4/competitions/CL/standings',
    BL1: 'https://api.football-data.org/v4/competitions/BL1/standings',
    DED: 'https://api.football-data.org/v4/competitions/DED/standings',
    BSA: 'https://api.football-data.org/v4/competitions/BSA/standings',
    PD: 'https://api.football-data.org/v4/competitions/PD/standings',
    FL1: 'https://api.football-data.org/v4/competitions/FL1/standings',
    ELC: 'https://api.football-data.org/v4/competitions/ELC/standings',
    PPL: 'https://api.football-data.org/v4/competitions/PPL/standings',
    EC: 'https://api.football-data.org/v4/competitions/EC/standings',
    SA: 'https://api.football-data.org/v4/competitions/SA/standings',
    CLI: 'https://api.football-data.org/v4/competitions/CLI/standings',
    WC: 'https://api.football-data.org/v4/competitions/WC/standings',
};

const liveUrls = {
    PL: 'https://api.football-data.org/v4/competitions/PL/matches',
    CL: 'https://api.football-data.org/v4/competitions/CL/matches',
    BL1: 'https://api.football-data.org/v4/competitions/BL1/matches',
    DED: 'https://api.football-data.org/v4/competitions/DED/matches',
    BSA: 'https://api.football-data.org/v4/competitions/BSA/matches',
    PD: 'https://api.football-data.org/v4/competitions/PD/matches',
    FL1: 'https://api.football-data.org/v4/competitions/FL1/matches',
    ELC: 'https://api.football-data.org/v4/competitions/ELC/matches',
    PPL: 'https://api.football-data.org/v4/competitions/PPL/matches',
    EC: 'https://api.football-data.org/v4/competitions/EC/matches',
    SA: 'https://api.football-data.org/v4/competitions/SA/matches',
    CLI: 'https://api.football-data.org/v4/competitions/CLI/matches',
    WC: 'https://api.football-data.org/v4/competitions/WC/matches',
};

const teamsUrls = {
    PL: 'https://api.football-data.org/v4/competitions/PL/teams',
    CL: 'https://api.football-data.org/v4/competitions/CL/teams',
    BL1: 'https://api.football-data.org/v4/competitions/BL1/teams',
    DED: 'https://api.football-data.org/v4/competitions/DED/teams',
    BSA: 'https://api.football-data.org/v4/competitions/BSA/teams',
    PD: 'https://api.football-data.org/v4/competitions/PD/teams',
    FL1: 'https://api.football-data.org/v4/competitions/FL1/teams',
    ELC: 'https://api.football-data.org/v4/competitions/ELC/teams',
    PPL: 'https://api.football-data.org/v4/competitions/PPL/teams',
    EC: 'https://api.football-data.org/v4/competitions/EC/teams',
    SA: 'https://api.football-data.org/v4/competitions/SA/teams',
    CLI: 'https://api.football-data.org/v4/competitions/CLI/teams',
    WC: 'https://api.football-data.org/v4/competitions/WC/teams',
};

// League logos mapping
const leagueLogos = {
    PL: 'images/leagues/premier-league.png',
    CL: 'images/leagues/champions-league.png',
    BL1: 'images/leagues/bundesliga.png',
    DED: 'images/leagues/eredivisie.png',
    BSA: 'images/leagues/campeonato-brasileiro.png',
    PD: 'images/leagues/la-liga.png',
    FL1: 'images/leagues/ligue-1.png',
    ELC: 'images/leagues/championship.png',
    PPL: 'images/leagues/primeira-liga.png',
    EC: 'images/leagues/european-championship.png',
    SA: 'images/leagues/serie-a.png',
    CLI: 'images/leagues/copa-libertadores.png',
    WC: 'images/leagues/world-cup.png',
};

// Club logos mapping with example IDs; replace with actual IDs
const clubsLogos = {
    66: 'images/clubs/manutd.png',
    63: 'images/clubs/fulham.png',
    64: 'images/clubs/liverpool.png',
    76: 'images/clubs/wolverhampton.png',
    349: 'images/clubs/ipswich.png',
    57: 'images/clubs/arsenal.png',
    62: 'images/clubs/everton.png',
    397: 'images/clubs/brighton.png',
    340: 'images/clubs/southampton.png',
    67: 'images/clubs/newcastle.png',
    351: 'images/clubs/nottingham.png',
    1044: 'images/clubs/afc.png',
    563: 'images/clubs/westham.png',
    58: 'images/clubs/aston.png',
    354: 'images/clubs/crystal.png',
    402: 'images/clubs/brentford.png',
    61: 'images/clubs/chelsea.png',
    65: 'images/clubs/mancity.png',
    73: 'images/clubs/tottenham.png',
    338: 'images/clubs/leicester.png',
    1871: 'images/clubs/bcs.png',
    109: 'images/clubs/juventus.png',
    498: 'images/clubs/sportingcp.png',
    5: 'images/clubs/bayern.png',
    86: 'images/clubs/realmadrid.png',
    98: 'images/clubs/milan.png',
    103: 'images/clubs/bologna.png',
    907: 'images/clubs/spartapraag.png',
    524: 'images/clubs/psg.png',
    851: 'images/clubs/brugge.png',
    732: 'images/clubs/celtic.png',
    675: 'images/clubs/feyenoord.png',
    7283: 'images/clubs/rode.png',
    548: 'images/clubs/monaco.png',
    512: 'images/clubs/brest.png',
    102: 'images/clubs/atalanta.png',
    78: 'images/clubs/atleticom.png',
    10: 'images/clubs/stuttgart.png',
    1877: 'images/clubs/salzburg.png',
    7509: 'images/clubs/slovan.png',
    4: 'images/clubs/bvb.png',
    81: 'images/clubs/barcelona.png',
    108: 'images/clubs/inter.png',
    3: 'images/clubs/leverkusen.png',
    674: 'images/clubs/psv.png',
    298: 'images/clubs/girona.png',
    1887: 'images/clubs/sjachtar.png',
    2021: 'images/clubs/sturm.png',
    721: 'images/clubs/leipzig.png',
    1903: 'images/clubs/benfica.png',
    755: 'images/clubs/dinamo.png',
    521: 'images/clubs/losc.png',
    18: 'images/clubs/borussiam.png',
    36: 'images/clubs/vflbochum.png',
    18: 'images/clubs/borussiam.png',
    720: 'images/clubs/holsteinkiel.png',
    2: 'images/clubs/tsg.png',
    17: 'images/clubs/scfreiburg.png',
    18: 'images/clubs/borussiam.png',
    12: 'images/clubs/svwerder.png',
    16: 'images/clubs/augsburg.png',
    15: 'images/clubs/fsvmainz.png',
    28: 'images/clubs/unionberlin.png',
    19: 'images/clubs/frankfurt.png',
    11: 'images/clubs/vflwolfsburg.png',
    20: 'images/clubs/sanktpauli.png',
    44: 'images/clubs/heidenheim.png',
    681: 'images/clubs/breda.png',
    677: 'images/clubs/groningen.png',
    672: 'images/clubs/willem2.png',
    1915: 'images/clubs/nec.png',
    666: 'images/clubs/twente.png',
    1911: 'images/clubs/almere.png',
    682: 'images/clubs/az.png',
    683: 'images/clubs/rkc.png',
    684: 'images/clubs/pec.png',
    6806: 'images/clubs/spartar.png',
    671: 'images/clubs/heracles.png',
    676: 'images/clubs/utrecht.png',
    1920: 'images/clubs/fortuna.png',
    718: 'images/clubs/gaed.png',
    678: 'images/clubs/ajax.png',
    673: 'images/clubs/heerenveen.png',
    // Add additional mappings for club IDs and logo paths
};

app.get('/soccer-data-matches', async (req, res) => {
    const league = req.query.league;
    const apiUrl = matchesUrls[league];

    if (!apiUrl) {
        return res.status(400).json({ error: 'Invalid league code' });
    }

    try {
        const response = await axios.get(apiUrl, {
            headers: { 'X-Auth-Token': apiKey }
        });

        const matchesWithLogos = response.data.matches.map(match => {
            return {
                ...match,
                leagueLogo: leagueLogos[league],
                homeTeamLogo: clubsLogos[match.homeTeam.id],
                awayTeamLogo: clubsLogos[match.awayTeam.id],
            };
        });

        res.json({ matches: matchesWithLogos });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/soccer-data-standings', async (req, res) => {
    const league = req.query.league;
    const apiUrl = standingsUrls[league];

    if (!apiUrl) {
        return res.status(400).json({ error: 'Invalid league code' });
    }

    try {
        const response = await axios.get(apiUrl, {
            headers: { 'X-Auth-Token': apiKey }
        });

        // Ensure that the response has the expected structure
        const standingsData = response.data.standings[0]?.table || []; // Use optional chaining

        // Add club logos to the standings response
        const standingsWithLogos = standingsData.map(team => {
            return {
                ...team,
                logo: clubsLogos[team.team.id] || 'images/default-club-logo.png' // Add logo property
            };
        });

        res.json({ standings: standingsWithLogos }); // Return the modified standings
    } catch (error) {
        console.error('Error fetching standings:', error);
        res.status(500).json({ error: 'Failed to fetch standings' });
    }
});

// Add this endpoint to your server.js file
app.get('/soccer-data-teams', async (req, res) => {
    const league = req.query.league;
    const apiUrl = teamsUrls[league];

    if (!apiUrl) {
        return res.status(400).json({ error: 'Invalid league code' });
    }

    try {
        const response = await axios.get(apiUrl, {
            headers: { 'X-Auth-Token': apiKey }
        });

        const teamsWithLogos = response.data.teams.map(team => {
            return {
                ...team,
                logo: clubsLogos[team.id] || 'images/default-club-logo.png', // Add logo property
            };
        });

        res.json({ teams: teamsWithLogos }); // Return the modified teams
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ error: 'Failed to fetch teams' });
    }
});

// Endpoint to fetch live matches
app.get('/soccer-data-live', async (req, res) => {
    const league = req.query.league;
    const apiUrl = liveUrls[league];

    if (!apiUrl) {
        return res.status(400).json({ error: 'Invalid league code' });
    }

    try {
        const response = await axios.get(apiUrl, {
            headers: { 'X-Auth-Token': apiKey }
        });

        // Map and add necessary details like referee and timePlayed
        const matchesWithLogosAndDetails = response.data.matches.map(match => {
            return {
                ...match,
                leagueLogo: leagueLogos[league],
                homeTeamLogo: clubsLogos[match.homeTeam.id],
                awayTeamLogo: clubsLogos[match.awayTeam.id],
                referee: match.referees.length > 0 ? match.referees[0].name : 'N/A', // Get referee if available
                timePlayed: match.minute ? `${match.minute} Min Played!` : 'N/A', // Get time played
            };
        });

        res.json({ matches: matchesWithLogosAndDetails });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route for the live matches URL
app.get('/live-matches', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'live.html')); // Serve the live-matches.html file
});

app.get('/standings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'standings.html')); // Serve the live-matches.html file
});

app.get('/teams', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teams.html')); // Serve the live-matches.html file
});

app.get('/played-matches', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'played.html')); // Serve the live-matches.html file
});

app.get('/team-url', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'standings.html')); // Serve the live-matches.html file
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
