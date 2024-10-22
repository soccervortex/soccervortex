const fs = require('fs');
const PORT = 5867;
const serverCode = `


const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 5867;

// Enable CORS
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static('public'));

const apiKeys = [
    '1d171366cdf64118b495dba4cf37603f', // Key 1
    '620d6010eacd446298471d289a362f9f', // Replace with actual API key
    '38e25927fb9c4b7c8f19dc124e21b3e2', // Replace with actual API key
    'eb658a2df4cc47cfb0b54f118f8961cc', // Replace with actual API key
    '64b243f8bc7f469cacb987d5bbb2333e', // Replace with actual API key
    'd278ac50d0f2454dacebd6e4668d252e', // Replace with actual API key
    'b060899c58594b588e39b55e6bc0f381', // Replace with actual API key
    '8d93e7ae96994178b810cf320b8b94a0', // Replace with actual API key
    '6d5ca969981046999ac2289bda7480e4', // Replace with actual API key
    'af4fb0ab26b643c8b69801a7c81f5062', // Replace with actual API key
    '6e11d26d54d74bc0b1bcedfe861a8ba1', // Key 1
    '3a1d1a3ec99f4336a9c0b1caf8cab827', // Replace with actual API key
    'c4b0b8fd9c974f0e83bfe35b94c23fa5', // Replace with actual API key
    '4acc113ba36e4e38b1c2cd9b6ad57595', // Replace with actual API key
    'ffdd3c66e958472b889010e4bddaf682', // Replace with actual API key
    '9f5df27b0446477d830c60bb48f30c82', // Replace with actual API key
    '8b4436052ce14ce491f2e1cca6fabfb4', // Replace with actual API key
    'e2f6b32c68384ead9afca9b776594bd0', // Replace with actual API key
    '19314b1b0f1b4dc08ded171fd4b91ae2', // Replace with actual API key
    'e34e4cc747e843de949c7fb48ebc3fdf', // Replace with actual API key
    '3101f59f9ed442c39617e3b9c890bdac', // Key 1
    'f3b591096353492d8316129d930165c3', // Replace with actual API key
    'c9caf1db997a49cc9ad08fc5054cecf9', // Replace with actual API key
    '3d24370ae71445ed8fb4b0f19424a7c3', // Replace with actual API key
    'a3249f8fea604b2886def73e7d199625', // Replace with actual API key
    'bb8a48869d3a4681be57be06a287f52e', // Replace with actual API key
    'aaa7f1a514a346e5a183fc81293cffe0', // Replace with actual API key
    'cf8cb02202c9469e85d6ac3f3f08259d', // Replace with actual API key
    '659eb30d53274517a00a76ae2590d60e', // Replace with actual API key
    '8281e53276f94ab0ba4ce67bd6218007' // Replace with actual API key
];

let currentApiKeyIndex = 0;

// Function to get the next API key in a round-robin manner
function getNextApiKey() {
    const apiKey = apiKeys[currentApiKeyIndex];
    currentApiKeyIndex = (currentApiKeyIndex + 1) % apiKeys.length;
    return apiKey;
}

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

const upcomingUrls = {
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

const scorersUrl = {
    PL: 'https://api.football-data.org/v4/competitions/PL/scorers',
    CL: 'https://api.football-data.org/v4/competitions/CL/scorers',
    BL1: 'https://api.football-data.org/v4/competitions/BL1/scorers',
    DED: 'https://api.football-data.org/v4/competitions/DED/scorers',
    BSA: 'https://api.football-data.org/v4/competitions/BSA/scorers',
    PD: 'https://api.football-data.org/v4/competitions/PD/scorers',
    FL1: 'https://api.football-data.org/v4/competitions/FL1/scorers',
    ELC: 'https://api.football-data.org/v4/competitions/ELC/scorers',
    PPL: 'https://api.football-data.org/v4/competitions/PPL/scorers',
    EC: 'https://api.football-data.org/v4/competitions/EC/scorers',
    SA: 'https://api.football-data.org/v4/competitions/SA/scorers',
    CLI: 'https://api.football-data.org/v4/competitions/CLI/scorers',
    WC: 'https://api.football-data.org/v4/competitions/WC/scorers',
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

app.get('/soccer-data-scorers', async (req, res) => {
    const league = req.query.league; // Get league code from query parameter
    const apiUrl = scorersUrl[league]; // Fetch the corresponding API URL

    if (!apiUrl) {
        return res.status(400).json({ error: 'Invalid league code' }); // Return error if league is not found
    }

    try {
        // Assuming you have a function to fetch the next API key
        const apiKey = getNextApiKey(); // Get your next available API key

        const response = await axios.get(apiUrl, {
            headers: { 'X-Auth-Token': apiKey } // Add your API key in the request headers
        });

        const scorersWithLogos = response.data.scorers.map(scorer => {
            return {
                playerName: scorer.player.name,
                teamName: scorer.team.name,
                goals: scorer.goals,
                teamLogo: 'https://crests.football-data.org/' + scorer.team.id + '.png', // Team logo based on team ID
            };
        });

        // Return the mapped scorers with logos to the client
        res.json({ scorers: scorersWithLogos });
    } catch (error) {
        res.status(500).json({ error: error.message }); // Handle errors
    }
});

app.get('/soccer-data-matches', async (req, res) => {
    const league = req.query.league;
    const apiUrl = matchesUrls[league];

    if (!apiUrl) {
        return res.status(400).json({ error: 'Invalid league code' });
    }

    try {
        // Get the next API key and log it
        const apiKey = getNextApiKey();
        
        const response = await axios.get(apiUrl, {
            headers: { 'X-Auth-Token': apiKey }
        });

        const matchesWithLogos = response.data.matches.map(match => {
            return {
                ...match,
                leagueLogo: 'https://crests.football-data.org/' + match.competition.code + '.png',
                homeTeamLogo: 'https://crests.football-data.org/' + match.homeTeam.id + '.png',
                awayTeamLogo: 'https://crests.football-data.org/' + match.awayTeam.id + '.png',
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
        const apiKey = getNextApiKey();
        
        const response = await axios.get(apiUrl, {
            headers: { 'X-Auth-Token': apiKey }
        });

        // Ensure that the response has the expected structure
        const standingsData = response.data.standings[0]?.table || []; // Use optional chaining

        // Add club logos to the standings response
        const standingsWithLogos = standingsData.map(team => {
            return {
                ...team,
                logo: 'team.team.crest' || 'images/default-club-logo.png' // Add logo property
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
        const apiKey = getNextApiKey();
        
        const response = await axios.get(apiUrl, {
            headers: { 'X-Auth-Token': apiKey }
        });

        const teamsWithLogos = response.data.teams.map(team => {
            return {
                ...team,
                logo: 'team.crest' || 'images/default-club-logo.png', // Add logo property
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
        const apiKey = getNextApiKey();
        
        const response = await axios.get(apiUrl, {
            headers: { 'X-Auth-Token': apiKey }
        });

        // Map and add necessary details like referee and timePlayed
        const matchesWithLogosAndDetails = response.data.matches.map(match => {
            return {
                ...match,
                leagueLogo: 'https://crests.football-data.org/' + match.competition.code + '.png',
                homeTeamLogo: 'https://crests.football-data.org/' + match.homeTeam.id + '.png',
                awayTeamLogo: 'https://crests.football-data.org/' + match.awayTeam.id + '.png',
                referee: match.referees.length > 0 ? match.referees[0].name : 'N/A', // Get referee if available
            };
        });

        res.json({ matches: matchesWithLogosAndDetails });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/soccer-data-upcoming', async (req, res) => {
    const league = req.query.league;
    const apiUrl = upcomingUrls[league];

    if (!apiUrl) {
        return res.status(400).json({ error: 'Invalid league code' });
    }

    try {
        // Get the next API key and log it
        const apiKey = getNextApiKey();
        
        const response = await axios.get(apiUrl, {
            headers: { 'X-Auth-Token': apiKey }
        });

        const matchesWithLogos = response.data.matches.map(match => {
            return {
                ...match,
                leagueLogo: 'https://crests.football-data.org/' + match.competition.code + '.png',
                homeTeamLogo: 'https://crests.football-data.org/' + match.homeTeam.id + '.png',
                awayTeamLogo: 'https://crests.football-data.org/' + match.awayTeam.id + '.png',
            };
        });

        res.json({ matches: matchesWithLogos });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/upcoming', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upcoming', 'upcoming.html')); // Serve the live-matches.html file
});

app.get('/upcoming/upcoming.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upcoming', 'upcoming.css')); // Serve the live-matches.html file
});

app.get('/upcoming/logo.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upcoming', 'logo.png')); // Serve the live-matches.html file
});

app.get('/upcoming/upcoming.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'upcoming', 'upcoming.js')); // Serve the live-matches.html file
});

// Route for the live matches URL
app.get('/live', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'live', 'live.html')); // Serve the live-matches.html file
});

app.get('/live/logo.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'live', 'logo.png')); // Serve the live-matches.html file
});

app.get('/live/live-script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'live', 'live-scirpt.js')); // Serve the live-matches.html file
});

app.get('/live/live-styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'live', 'live-styles.css')); // Serve the live-matches.html file
});

app.get('/live/live-styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'live', 'live-styles.css')); // Serve the live-matches.html file
});

app.get('/live/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'played', 'styles.css')); // Serve the live-matches.html file
});

app.get('/standings', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'standings', 'standings.html')); // Serve the live-matches.html file
});

app.get('/standings/logo.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'standings', 'logo.png')); // Serve the live-matches.html file
});

app.get('/standings/standings.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'standings', 'standings.css')); // Serve the live-matches.html file
});

app.get('/standings/standings.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'standings', 'standings.js')); // Serve the live-matches.html file
});

app.get('/teams', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teams', 'teams.html')); // Serve the live-matches.html file
});

app.get('/teams/logo.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teams', 'logo.png')); // Serve the live-matches.html file
});

// Serve styles.css when requested
app.get('/teams/teams.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teams', 'teams.css'));
});

// Serve styles.css when requested
app.get('/teams/teams.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'teams', 'teams.js'));
});

app.get('/scorers', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'scorers', 'scorers.html')); // Serve the live-matches.html file
});

app.get('/scorers/logo.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'scorers', 'logo.png')); // Serve the live-matches.html file
});

// Serve styles.css when requested
app.get('/scorers/scorers.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'scorers', 'scorers.css'));
});

// Serve styles.css when requested
app.get('/scorers/scorers.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'scorers', 'scorers.js'));
});

// Serve played.html when /played-matches is accessed
app.get('/played', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'played', 'played.html'));
});

app.get('/played/logo.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'played', 'logo.png')); // Serve the live-matches.html file
});

// Serve styles.css when requested
app.get('/played/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'played', 'styles.css'));
});

// Serve script.js when requested
app.get('/played/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'played', 'script.js'));
});

app.get('/team-logo--url', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'standings.html')); // Serve the live-matches.html file
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home', 'index.html'));
});

app.get('/home/logo.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'played', 'logo.png')); // Serve the live-matches.html file
});

app.get('/home/logo2.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'played', 'logo2.png')); // Serve the live-matches.html file
});

app.get('/home/home.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home', 'home.css'));
});

app.get('/home/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'played', 'styles.css'));
});

app.get('/home/status.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home', 'status.css'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home', 'index.html'));
});

app.get('/logo.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'played', 'logo.png')); // Serve the live-matches.html file
});

app.get('/logo2.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'played', 'logo2.png')); // Serve the live-matches.html file
});

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404', '404.html'));
});

app.get('/404/404.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', '404', '404.html'));
});

app.listen(PORT, () => {
    console.log('Server running on https://soccervortex-github-io.onrender.com/');
});

`;

fs.writeFileSync('server.js', serverCode);
console.log('server.js has been created');
