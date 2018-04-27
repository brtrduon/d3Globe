const express = require('express');
const app = express();
const path = require('path');
const http = require('http');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const port = process.env.PORT || 8000;
const server = http.createServer(app);
server.listen(port);
console.log(`Localhost running on port ${port}`);