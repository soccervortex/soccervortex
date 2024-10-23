const fs = require('fs');
const path = require('path');

// Specify the path for apiKeys.json
const serverDir = path.join(                                 
    'github', 
    'old_versions', 
    '1.0.0', 
    '1.0.23', 
    '1.0.7'
);
const filePath = path.join(serverDir, 'server.json');

// Check if apiKeys.json exists
if (fs.existsSync(filePath)) {
    // Load existing API keys from the file
    const server = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log('Deleted server');
} else {
    console.error('server.json does not exist. Please check the path.');
}
