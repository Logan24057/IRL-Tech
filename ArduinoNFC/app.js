// Import the required modules
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const main = require('./main');

// Create a new HTTP server
const server = http.createServer((req, res) => {
    // Parse the request URL
    const reqUrl = url.parse(req.url, true);

    // If the request is a POST request to the '/write' endpoint
    if (reqUrl.pathname === '/write' && req.method === 'POST') {
        let body = '';
        // Listen for data event on the request
        req.on('data', (chunk) => {
            // Append the received data chunk to the body
            body += chunk;
        });
        // Listen for the end event on the request
        req.on('end', () => {
            // Parse the body as JSON
            let postData = JSON.parse(body);
            // Write the "write" command to the serial port
            main.writeToPort('write', () => {
                // After the "write" command has been written, write the actual command
                main.writeToPort(postData.write);
                // Send a 200 OK response with the sent command
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(`Command sent: ${postData.write}`);
            });
        });
    }
    // If the request is a GET request to the '/read' endpoint
    else if (reqUrl.pathname === '/read' && req.method === 'GET') {
        // Get the command from the query parameters
        let command = reqUrl.query.command;
        // Read from the serial port
        main.readFromPort(command, (data) => {
            // Send a 200 OK response with the read data
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ read: data }));
        });
    }
    // If the request is a GET request to any other endpoint
    else if (req.method === 'GET') {
        // Determine the file path based on the request URL
        let filePath = '.' + req.url;
        if (filePath == './')
            filePath = './index.html';

        // Determine the content type based on the file extension
        let extname = String(path.extname(filePath)).toLowerCase();
        let mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'application/font-otf',
            '.wasm': 'application/wasm'
        };

        let contentType = mimeTypes[extname] || 'application/octet-stream';

        fs.readFile(filePath, function (error, content) {
            if (error) {
                if (error.code == 'ENOENT') {
                    // If the file was not found, send a 404 response
                    fs.readFile('./404.html', function (error, content) {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    });
                }
                else {
                    // If there was another error, send a 500 response
                    res.writeHead(500);
                    res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
                }
            }
            else {
                // If the file was read successfully, send it in the response
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
});

// Start the server on port 5500
server.listen(5500, () => {
    console.log('Server is running at http://127.0.0.1:5500');
});