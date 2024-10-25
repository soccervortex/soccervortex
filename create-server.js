const fs = require('fs');
const PORT = 5867;

const serverCode = `
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 5867;
const fs = require('fs');
const simpleGit = require('simple-git');
const session = require('express-session');
const bodyParser = require('body-parser');
const serverFile = path.join(__dirname, 'github', 'old_versions', '1.0.0', '1.0.23', '1.0.7', 'server.json');
const git = simpleGit();
const reloadserverFile = path.join(__dirname, 'reload.server.js');

const blockedIps = ["185.182.193.115, 162.158.87.104, 10.217.232.125"]; // Add more IPs as needed

// Enable CORS and body parsers
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware to check for blocked IPs
app.use((req, res, next) => {
    // Obtain client IP from headers or socket
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
    const formattedIp = clientIp.includes('::') ? clientIp.replace(/^.*:/, '') : clientIp;

    // Block request if IP is in the blocked list
    if (blockedIps.includes(formattedIp)) {
        console.log(\`Blocked request from IP: \${formattedIp}\`);
        return res.status(403).send('Access Forbidden');
    }

    next(); // Continue to the next middleware if IP is not blocked
});

// Middleware to log and check for actual users
const publicIpRegex = /^(?!127\.|10\.|192\.168|172\.(1[6-9]|2[0-9]|3[0-1])\.).*$/;
const seenIps = new Set();

app.use((req, res, next) => {
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
    const formattedIp = clientIp.includes('::') ? clientIp.replace(/^.*:/, '') : clientIp;

    if (publicIpRegex.test(formattedIp) && !seenIps.has(formattedIp)) {
        const userAgent = req.headers['user-agent'] || '';

        if (/Mozilla|Chrome|Safari|Edge|Firefox/i.test(userAgent) && !/bot|crawl|spider/i.test(userAgent)) {
            console.log(\`Request from actual user IP: \${formattedIp}\`);
            seenIps.add(formattedIp);
        }
    }

    next();
});

// Serve static files from the "public" directory
app.use(express.static('public'));

// Configure session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware to prevent caching of protected pages
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
    if (req.session.loggedIn) {
        return next();
    } else {
        res.redirect('/admin/login');
    }
}

const users = [
    { username: process.env.OWNER_USERNAME, password: process.env.OWNER_PASSWORD },
    { username: process.env.APIKEYBOT_USERMAME, password: process.env.APIKEYBOT_PASSWORD }
];

// Handle login POST request
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the provided username and password match any user in the array
    const user = users.find(u => u.username === username && u.password === password);

    if (!user) {
        // If no user found, redirect to login page with an error message
        return res.redirect('/admin/login?error=invalid');
    }

    // Successful login logic here
    req.session.loggedIn = true; // Set loggedIn to true
    req.session.username = username; // Save username in session
    res.redirect('/admin/home'); // Redirect to the admin page
});

// Logout route
app.get('/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.send('Error logging out.');
        }

        // Clear cookies (optional, but recommended)
        res.clearCookie('connect.sid', { path: '/' });

        // Redirect to the main page after logging out
        res.redirect('https://soccervortex-github-io.onrender.com'); // Redirect to your main page
    });
});

app.get('/admin/apikey/add-server', isAuthenticated, (req, res) => {
    res.redirect('https://soccervortex-github-io.onrender.com/admin/home'); // Redirect to your main page
});

// Add server route
let isDeploying = false; // Flag to track deployment status

app.post('/admin/apikey/add-server', isAuthenticated, async (req, res) => {
    const { server } = req.body; // Now the server variable is defined in this scope
    const username = req.session.username; // Capture the username from session

    if (!server) {
        return res.redirect('/admin/apikey?error=required');
    }

    // Log the API key
    console.log(\`User \${username} submitted API Key: \${server}\`); // Log who submitted the key

    // Check for API key length
    if (server.length !== 32) {
        return res.redirect('/admin/apikey?error=length');
    }

    // Check if a deployment is in progress
    if (isDeploying) {
        return res.redirect('/admin/apikey?error=deployment');
    }

    try {
        // Test if API key is valid
        const isValidKey = await testApiKey(server);
        if (!isValidKey) {
            return res.redirect('/admin/apikey?error=invalidkey'); // Show error if API key does not work
        }

        // Mark deployment as in progress
        isDeploying = true;

        // Ensure directory exists before writing
        ensureDirectoryExistence(serverFile);

        // Load existing keys
        let keys = [];
        if (fs.existsSync(serverFile)) {
            keys = JSON.parse(fs.readFileSync(serverFile));
        }

        // Check if the API key already exists in the list
        if (keys.includes(server)) {
            isDeploying = false; // Reset flag on error
            return res.redirect('/admin/apikey?error=already');
        }

        // Add new API key
        keys.push(server);
        fs.writeFileSync(serverFile, JSON.stringify(keys, null, 2));

        // Push changes to GitHub
        await pushChangesToGitHub(serverFile);

        // After successful push, trigger Render deployment
        await triggerRenderDeployment(); // Implement this function below

        // Deployment finished successfully
        isDeploying = false; // Reset flag after deployment
        res.redirect('/admin/home'); // Success redirect
    } catch (error) {
        console.error('Error while adding server:', error);
        isDeploying = false; // Reset flag on error
        return res.redirect('/admin/apikey?error=failed');
    }
});

// Function to test the API key
async function testApiKey(apiKey) {
    try {
        const response = await axios.get('https://api.football-data.org/v4/competitions/CL/matches', {
            headers: {
                'X-Auth-Token': apiKey // Use the provided API key for authentication
            }
        });

        // Check if response status is 200 (OK)
        return response.status === 200;
    } catch (error) {
        console.error('API key test failed:', error.message);
        return false;
    }
}

// Function to ensure directory existence
function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
}

// Function to push changes to GitHub
async function pushChangesToGitHub(filePath) {
    const githubToken = process.env.GITHUB_TOKEN; // Your GitHub token
    const repoOwner = 'soccervortex'; // Your GitHub username or organization
    const repoName = 'soccervortex'; // Your GitHub repository name

    const relativePath = path.relative(__dirname, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const url = \`https://api.github.com/repos/\${repoOwner}/\${repoName}/contents/\${relativePath}\`;

    const sha = await getFileSha(repoOwner, repoName, relativePath, githubToken);

    await axios.put(url, {
        message: sha ? 'Big Update' : 'Update server.json',
        content: Buffer.from(content).toString('base64'),
        sha: sha
    }, {
        headers: {
            Authorization: \`token \${githubToken}\`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });

    console.log('File updated on GitHub');
}

// Function to get the SHA of the file
async function getFileSha(owner, repo, relativePath, token) {
    try {
        const url = \`https://api.github.com/repos/\${owner}/\${repo}/contents/\${relativePath}\`;
        const response = await axios.get(url, {
            headers: {
                Authorization: \`token \${token}\`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        return response.data.sha;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
}

// Function to trigger a Render deployment
async function triggerRenderDeployment() {
    const renderServiceId = process.env.RENDER_SERVICE_ID; // Your Render service ID
    const renderApiKey = process.env.RENDER_API_KEY; // Your Render API key

    const url = \`https://api.render.com/v1/services/\${renderServiceId}/deploys\`;


    const response = await axios.post(url, {}, {
        headers: {
            Authorization: \`Bearer \${renderApiKey}\`,
            'Content-Type': 'application/json',
        },
    });

    if (response.status === 201) {
        console.log('Render deployment triggered successfully.');
    } else {
        throw new Error('Failed to trigger Render deployment.');
    }
}

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

app.get('/admin/', (req, res) => {
    res.redirect('https://soccervortex-github-io.onrender.com/admin/home')
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

app.get('/admin/home', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'home', 'admin.html'));
});

app.get('/admin/home/admin.css', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'home', 'admin.html'));
});

app.get('/admin/home/logo.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'home', 'logo.png')); // Serve the live-matches.html file
});

app.get('/admin/home/logo2.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'home', 'logo2.png')); // Serve the live-matches.html file
});

app.get('/admin/apikey', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'apikey', 'apikey.html'));
});

app.get('/admin/apikey/apikey.css', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'apikey', 'apikey.html'));
});

app.get('/admin/apikey/logo.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'apikey', 'logo.png')); // Serve the live-matches.html file
});

app.get('/admin/apikey/logo2.png', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'apikey', 'logo2.png')); // Serve the live-matches.html file
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'login', 'login.html'));
});

app.get('/admin/login/login.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'login', 'login.html'));
});

app.get('/admin/login/login.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin', 'login', 'login.html'));
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
