const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 8080;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif'
};

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function rewriteURL(pathname) {
  // Remove trailing slash
  pathname = pathname.replace(/\/$/, '') || '/';
  
  // Root redirects to index.html
  if (pathname === '/') {
    return '/index.html';
  }
  
  // Admin redirect
  if (pathname === '/admin') {
    return '/admin.html';
  }
  
  // Check if file exists with .html extension
  const htmlPath = pathname + '.html';
  if (fs.existsSync(path.join(__dirname, htmlPath))) {
    return htmlPath;
  }
  
  return pathname;
}

const server = http.createServer((req, res) => {
  let pathname = url.parse(req.url).pathname;
  
  // Apply URL rewriting
  pathname = rewriteURL(pathname);
  
  const filePath = path.join(__dirname, pathname);
  
  // Check if file exists
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // 404 - File not found
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 - Página não encontrada</h1>');
      return;
    }
    
    // Read and serve file
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>500 - Erro interno do servidor</h1>');
        return;
      }
      
      const mimeType = getMimeType(filePath);
      res.writeHead(200, { 
        'Content-Type': mimeType,
        'Cache-Control': mimeType.includes('image') ? 'max-age=2592000' : 'no-cache'
      });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log('📁 URLs limpas habilitadas:');
  console.log('   http://localhost:8080/admin (→ admin.html)');
  console.log('   http://localhost:8080/ (→ index.html)');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Servidor sendo finalizado...');
  server.close(() => {
    console.log('✅ Servidor finalizado');
  });
});