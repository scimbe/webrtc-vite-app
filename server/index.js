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
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Debugging-Route
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const server = createServer(app);

// Erhöhe maximale Listener
server.setMaxListeners(50);

// WebSocket-Konfiguration
const wss = new WebSocketServer({ 
  server,
  clientTracking: true,
  maxPayload: 1024 * 1024, // 1MB Payload-Limit
  verifyClient: (info, done) => {
    console.log('WebSocket connection attempt:', {
      origin: info.req.headers.origin,
      url: info.req.url,
      timestamp: new Date().toISOString()
    });
    done(true);
  }
});

// Erhöhe maximale Listener für WebSocket
wss.setMaxListeners(50);

const roomManager = new RoomManager();
const connections = new Map();

// Fehlerbehandlung für Server
server.on('error', (error) => {
  console.error('HTTP Server Fehler:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
});

// Fehlerbehandlung für WebSocket
wss.on('error', (error) => {
  console.error('WebSocket Server Fehler:', {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
});

// Verbindungszähler
let connectionCounter = 0;

wss.on('connection', (ws, req) => {
  connectionCounter++;
  console.log(`Neue Verbindung. Aktive Verbindungen: ${connectionCounter}`);

  const roomId = req.url.split('/').pop();
  let userId = null;

  ws.on('close', () => {
    connectionCounter--;
    console.log(`Verbindung geschlossen. Verbleibende Verbindungen: ${connectionCounter}`);
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