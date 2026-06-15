const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const STATIC_DIR = path.join(__dirname, '..');
const apiHandler = require(path.join(STATIC_DIR, 'api', 'send-email.js'));

// Mock SMTP variables for local dev testing if not set
process.env.LARK_SMTP_USER = process.env.LARK_SMTP_USER || 'test@tzndesign.com';
process.env.LARK_SMTP_PASSWORD = process.env.LARK_SMTP_PASSWORD || 'testpassword';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  console.log(`[DEV SERVER] ${req.method} ${url.pathname}`);

  // Handle serverless API endpoint
  if (url.pathname === '/api/send-email') {
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
    });

    req.on('end', async () => {
      req.body = {};
      if (bodyData) {
        try {
          req.body = JSON.parse(bodyData);
        } catch (e) {
          console.error('[DEV SERVER] Failed to parse body JSON:', e);
        }
      }

      // Mock Vercel response helper methods
      res.status = function (code) {
        res.statusCode = code;
        return res;
      };
      
      res.json = function (data) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return res;
      };

      try {
        await apiHandler(req, res);
      } catch (err) {
        console.error('[DEV SERVER] Error in API Handler:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Internal Server Error', details: err.message }));
      }
    });
    return;
  }

  // Handle static file serving
  let filePath = path.join(STATIC_DIR, url.pathname);
  if (url.pathname.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
  }

  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If it doesn't end in .html, try adding .html (clean URLs support)
      if (!path.extname(filePath)) {
        filePath += '.html';
        fs.stat(filePath, (err2, stats2) => {
          if (!err2 && stats2.isFile()) {
            serveFile(filePath, res);
          } else {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('404 Not Found');
          }
        });
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('404 Not Found');
      }
    } else {
      serveFile(filePath, res);
    }
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
  const stream = fs.createReadStream(filePath);
  stream.on('error', err => {
    res.statusCode = 500;
    res.end('Server Error');
  });
  stream.pipe(res);
}

server.listen(PORT, () => {
  console.log(`[DEV SERVER] Running at http://localhost:${PORT}`);
});
