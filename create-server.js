const fs = require('fs');
const PORT = 5867;
const serverCode = `
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const fs = require('fs');
const PORT = 5867;
const simpleGit = require('simple-git');
const session = require('express-session');
const bodyParser = require('body-parser');  // For parsing form data
const serverFile = path.join(__dirname, 'github', '1.0.0', '1.0.23', '1.0.7', 'server.json');
const git = simpleGit();
const reloadserverFile = path.join(__dirname, 'reload.server.js');

// Enable CORS
app.use(cors());
app.use(express.json()); 

// Use body-parser to parse POST request bodies (including JSON and form data)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  // Add this for JSON support

// Serve static files from the "public" directory
app.use(express.static('public'));

// Configure session
app.use(session({
    secret: 'wesleystephanieomaenmaendavy',  // Secure key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }   // Use 'false' for local development over HTTP
}));

// Middleware to prevent caching of protected pages
app.use((req, res, next) => {
    // Disable caching on all routes (especially for protected pages like /admin)
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.loggedIn) {
        return next();  // User is authenticated, proceed to the admin page
    } else {
        res.redirect('/adminsecurity/login');  // Redirect to login if not logged in
    }
}

// Login route (renders login form)
app.get('/adminsecurity/login', (req, res) => {
    res.send(\`
        <form method="POST" action="/adminsecurity/login">
            <input type="text" name="username" placeholder="Username" required/>
            <input type="password" name="password" placeholder="Password" required/>
            <button type="submit">Login</button>
        </form>
    \`);
});

// Handle login POST request
app.post('/adminsecurity/login', (req, res) => {
    const { username, password } = req.body;

    // Dummy check for username and password, replace with real authentication
    if (username === 'w_rz0115' && password === 'System1153.') {
        req.session.loggedIn = true;  // Set loggedIn to true
        res.redirect('/admin');  // Redirect to the admin page
    } else {
        res.send('Invalid credentials. <a href="/adminsecurity/login">Try again</a>');
    }
});

// Logout route
app.get('/adminsecurity/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error logging out.');
        }

        // Clear cookies (optional, but recommended)
        res.clearCookie('connect.sid', { path: '/' });

        // Redirect to the main page after logging out
        res.redirect('https://soccervortex-github-io.onrender.com');  // Redirect to your main page
    });
});

app.get('/admin/add-server', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'admin.html'));
});

app.post('/admin/add-api-key', isAuthenticated, async (req, res) => {
    const { server } = req.body;

    if (!server) {
        return res.status(400).send('API Key is required');
    }

    // Load existing keys from the file
    let keys = [];
    if (fs.existsSync(serverFile)) {
        keys = JSON.parse(fs.readFileSync(serverFile));
    }

    // Add the new API key
    keys.push(server);

    // Save the updated keys to the file
    fs.writeFileSync(serverFile, JSON.stringify(keys, null, 2));

    // Write to reload.apiKeys.js
    const message = \`// A server version was added on 2024-10-23T21:54:04.347Z\n\`;
    fs.appendFileSync(reloadserverFile, message);

    try {
        
        await git.addConfig('user.name', process.env.GIT_USER_NAME);
        await git.addConfig('user.email', process.env.GIT_USER_EMAIL);

        await git.add([reloadserverFile]);
        await git.commit('Add new server version and update reload.server.js');
        await git.push('origin', 'main'); // Make sure to specify the correct branch

        res.redirect('/admin'); // Redirect back to the admin page after saving
    } catch (error) {
        console.error('Failed to push to GitHub:', error);
        res.status(500).send('Failed to deploy the new API key to GitHub');
    }
});

let apiKeys = [];
if (fs.existsSync(serverFile)) {
    apiKeys = JSON.parse(fs.readFileSync(serverFile));
}
let currentApiKeyIndex = 0;

// Function to get the next API key
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

app.get('/admin', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'admin.html'));
});

app.get('/admin/admin.css', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'admin.html'));
});

app.get('/admin/logo.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'logo.png')); // Serve the live-matches.html file
});

app.get('/admin/logo2.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'logo2.png')); // Serve the live-matches.html file
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
