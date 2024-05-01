// // app.js
// const main = require('./main');
// const http = require('http');
// const url = require('url');
// const WebSocket = require('ws');

// let dataArray = [];

// const wss = new WebSocket.Server({ port: 8080 });
// let wsClient;

// wss.on('connection', ws => {
//   wsClient = ws;
// });

// const server = http.createServer((req, res) => {
//   const reqUrl = url.parse(req.url, true);
//   const userAgent = req.headers['user-agent'];

//   if (!(/Chrome|Firefox|Safari|Opera/.test(userAgent)) || /Edg/.test(userAgent)) {
//     res.writeHead(403, { 'Content-Type': 'text/plain' });
//     res.end(`
//     <h1>Your browser is not supported</h1>
//     <p>Please use a supported browser to view this site. We recommend <a href="https://www.google.com/chrome/">Google Chrome</a>, <a href="https://www.mozilla.org/firefox/">Mozilla Firefox</a>, <a href="https://www.apple.com/safari/">Apple Safari</a>, or <a href="https://www.opera.com/">Opera</a>.</p>
// `);
//     return;
//   }

//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

//   if (req.method === 'OPTIONS') {
//     res.writeHead(200);
//     res.end();
//     return;
//   }

//   if (reqUrl.pathname === '/read' && req.method === 'GET') {
//     res.writeHead(200, { 'Content-Type': 'application/json' });
//     res.end(JSON.stringify(dataArray));
//   } else if (reqUrl.pathname === '/write' && req.method === 'POST') {
//     let body = '';
//     req.on('data', (chunk) => {
//       body += chunk;
//     });
//     req.on('end', () => {
//       let postData = JSON.parse(body);
//       dataArray.push(postData.write);
//       if (wsClient) {
//         wsClient.send(postData.write);
//       }
//       res.writeHead(200, { 'Content-Type': 'text/plain' });
//       res.end(`Data saved: ${postData.write}`);
//     });
//   } else {
//     res.writeHead(405, { 'Content-Type': 'text/plain' });
//     res.end('Method Not Allowed');
//   }
// });

// server.on('error', (err) => {
//   console.error('Server error:', err.message);
// });

// const port = 3000;

// server.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });