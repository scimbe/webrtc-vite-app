import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import RoomManager from './RoomManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// CORS-Konfiguration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'CONNECT'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Debugging-Route
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const server = createServer(app);

// WebSocket-Konfiguration mit detaillierter Fehlerbehandlung
const wss = new WebSocketServer({ 
  server,
  clientTracking: true,
  maxPayload: 1024 * 1024, // 1MB Payload-Limit
  verifyClient: (info, done) => {
    console.log('Verbindungsversuch:', {
      origin: info.req.headers.origin,
      url: info.req.url,
      headers: info.req.headers,
      timestamp: new Date().toISOString()
    });
    
    // Grundlegende Verbindungsvalidierung
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];

    const origin = info.req.headers.origin;
    const isAllowedOrigin = !origin || allowedOrigins.includes(origin);

    done(isAllowedOrigin);
  }
});

// Erhöhe maximale Listener
server.setMaxListeners(50);
wss.setMaxListeners(50);

const roomManager = new RoomManager();
const connections = new Map();

// Erweiterte Fehlerbehandlung
server.on('error', (error) => {
  console.error('Schwerwiegender Server-Fehler:', {
    name: error.name,
    message: error.message,
    code: error.code,
    stack: error.stack
  });
});

wss.on('error', (error) => {
  console.error('WebSocket Server Systemfehler:', {
    name: error.name,
    message: error.message,
    code: error.code,
    stack: error.stack
  });
});

// Verbindungszähler und Logging
let connectionCounter = 0;

wss.on('connection', (ws, req) => {
  connectionCounter++;
  console.log(`Neue WebSocket-Verbindung. Aktive Verbindungen: ${connectionCounter}`, {
    url: req.url,
    headers: req.headers
  });

  const roomId = req.url.split('/').pop();
  let userId = null;

  ws.on('error', (error) => {
    console.error('WebSocket-Verbindungsfehler:', {
      roomId,
      userId,
      errorName: error.name,
      errorMessage: error.message,
      stack: error.stack
    });
  });

  ws.on('close', (code, reason) => {
    connectionCounter--;
    console.log(`Verbindung geschlossen. Verbleibende Verbindungen: ${connectionCounter}`, {
      code,
      reason: reason.toString(),
      roomId,
      userId
    });
  });

  // Restlicher Code bleibt unverändert...
});

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Server läuft auf ${HOST}:${PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('Server wird heruntergefahren...');
  wss.close(() => {
    console.log('WebSocket-Server geschlossen');
    server.close(() => {
      console.log('HTTP-Server geschlossen');
      process.exit(0);
    });
  });
});