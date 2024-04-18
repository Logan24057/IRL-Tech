// Import the http and url modules
const http = require('http');
const url = require('url');

// Create an array to store the data
let dataArray = [];

// Create a new HTTP server
const server = http.createServer((req, res) => {
    // Parse the request URL
    const reqUrl = url.parse(req.url, true);

    // Get the user-agent string from the request headers
    const userAgent = req.headers['user-agent'];

    // Check if the user-agent string contains the name of a disallowed browser
    // If it does, send a 403 Forbidden response with a message
    if (!(/Chrome|Firefox|Safari|Opera/.test(userAgent)) || /Edg/.test(userAgent)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end(`
    <h1>Your browser is not supported</h1>
    <p>Please use a supported browser to view this site. We recommend <a href="https://www.google.com/chrome/">Google Chrome</a>, <a href="https://www.mozilla.org/firefox/">Mozilla Firefox</a>, <a href="https://www.apple.com/safari/">Apple Safari</a>, or <a href="https://www.opera.com/">Opera</a>.</p>
`);
        return;
    }

    // Set CORS headers to allow requests from any origin, and allow GET, POST, and OPTIONS methods
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // If the request method is OPTIONS, send a 200 OK response
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // If the request path is /read and the method is GET, send a 200 OK response with the data array
    if (reqUrl.pathname === '/read' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(dataArray));
    } else if (reqUrl.pathname === '/write' && req.method === 'POST') {
        // If the request path is /write and the method is POST, read the request body
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            // When the request body has been fully read, parse it as JSON and add the data to the array
            let postData = JSON.parse(body);
            dataArray.push(postData.write);
            // Send a 200 OK response with a message
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(`Data saved: ${postData.write}`);
        });
    } else {
        // If the request path or method is not supported, send a 405 Method Not Allowed response
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
});

// If the server encounters an error, log the error message
server.on('error', (err) => {
    console.error('Server error:', err.message);
});

// Set the port number
const port = 3000;
// Start the server and log a message
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});