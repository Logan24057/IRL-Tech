const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const main = require('./main');

const server = http.createServer((req, res) => {
    const reqUrl = url.parse(req.url, true);

    if (reqUrl.pathname === '/write' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            let postData = JSON.parse(body);
            // Write the "write" command to the serial port
            main.writeToPort('write', () => {
                // After the "write" command has been written, write the actual command
                main.writeToPort(postData.write);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(`Command sent: ${postData.write}`);
            });
        });
    }
 
    else if (reqUrl.pathname === '/read' && req.method === 'GET') {
        let command = reqUrl.query.command;
        main.readFromPort(command, (data) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ read: data }));
        });
    }
    else if (req.method === 'GET') {
        let filePath = '.' + req.url;
        if (filePath == './')
            filePath = './index.html';
    
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
    
        fs.readFile(filePath, function(error, content) {
            if (error) {
                if(error.code == 'ENOENT') {
                    fs.readFile('./404.html', function(error, content) {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    });
                }
                else {
                    res.writeHead(500);
                    res.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                }
            }
            else {
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });
    }
});

server.listen(5500, () => {
    console.log('Server is running at http://127.0.0.1:5500');
});