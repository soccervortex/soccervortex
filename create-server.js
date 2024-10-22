const fs = require('fs');

const serverCode = `
const express = require('express');
const app = express();

// You can access any environment variables you need here
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Hello from Render');
});

app.listen(PORT, () => {
    console.log(\`Server is running on port \${PORT}\`);
});
`;

fs.writeFileSync('server.js', serverCode);
console.log('server.js has been created');
