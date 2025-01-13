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

// Umfassende CORS-Konfiguration
app.use(cors({
  origin: '*', // In Produktion spezifische Origins angeben
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Debugging-Route
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

const server = createServer(app);

// WebSocket-Konfiguration mit erweiterten Optionen
const wss = new WebSocketServer({ 
  server,
  clientTracking: true,
  verifyClient: (info, done) => {
    // Optional: Zusätzliche Verbindungsauthentifizierung
    console.log('WebSocket connection attempt from:', info.req.headers.origin);
    done(true);
  }
});

const roomManager = new RoomManager();

// WebSocket-Verbindungen nach Raum-ID
const connections = new Map();

// Hilfsfunktion für Broadcasts an alle Teilnehmer eines Raums
const broadcastToRoom = (roomId, message, excludeUserId = null) => {
  if (!connections.has(roomId)) return;

  const roomConnections = connections.get(roomId);
  roomConnections.forEach((ws, userId) => {
    if (userId !== excludeUserId && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
};

// Zusätzliche Fehlerbehandlung für Server und WebSocket
server.on('error', (error) => {
  console.error('HTTP Server Error:', error);
});

wss.on('error', (error) => {
  console.error('WebSocket Server Error:', error);
});

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection');
  const roomId = req.url.split('/').pop();
  let userId = null;

  ws.on('message', (message) => {
    try {
      const { type, data } = JSON.parse(message);

      switch (type) {
        case 'join': {
          userId = data.userId;
          const isHost = data.isHost;

          try {
            if (isHost) {
              roomManager.createRoom(roomId, userId);
            }
            
            roomManager.joinRoom(roomId, {
              userId,
              name: data.userName,
              isHost
            });

            // Verbindung speichern
            if (!connections.has(roomId)) {
              connections.set(roomId, new Map());
            }
            connections.get(roomId).set(userId, ws);

            // Teilnehmer informieren
            const room = roomManager.getRoom(roomId);
            broadcastToRoom(roomId, {
              type: 'room_status',
              data: {
                participants: roomManager.getRoomParticipants(roomId),
                settings: room.settings
              }
            });

            // Bestätigung an den Beitretenden
            ws.send(JSON.stringify({
              type: 'joined',
              data: {
                roomId,
                userId,
                isHost,
                settings: room.settings
              }
            }));
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              data: { message: error.message }
            }));
          }
          break;
        }

        case 'update_settings': {
          try {
            const room = roomManager.updateRoomSettings(roomId, userId, data);
            broadcastToRoom(roomId, {
              type: 'room_status',
              data: {
                participants: roomManager.getRoomParticipants(roomId),
                settings: room.settings
              }
            });
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              data: { message: error.message }
            }));
          }
          break;
        }

        case 'kick_participant': {
          try {
            const room = roomManager.kickParticipant(roomId, userId, data.participantId);
            
            // Benachrichtige den gekickten Teilnehmer
            const kickedWs = connections.get(roomId).get(data.participantId);
            if (kickedWs) {
              kickedWs.send(JSON.stringify({
                type: 'kicked',
                data: { reason: 'Removed by host' }
              }));
              kickedWs.close();
            }

            // Update für verbleibende Teilnehmer
            broadcastToRoom(roomId, {
              type: 'room_status',
              data: {
                participants: roomManager.getRoomParticipants(roomId),
                settings: room.settings
              }
            });
          } catch (error) {
            ws.send(JSON.stringify({
              type: 'error',
              data: { message: error.message }
            }));
          }
          break;
        }

        case 'webrtc_signal': {
          const { target, signal } = data;
          const targetWs = connections.get(roomId)?.get(target);
          if (targetWs?.readyState === targetWs.OPEN) {
            targetWs.send(JSON.stringify({
              type: 'webrtc_signal',
              data: {
                signal,
                sender: userId
              }
            }));
          }
          break;
        }

        case 'chat_message': {
          const room = roomManager.getRoom(roomId);
          if (room?.settings.allowChat) {
            broadcastToRoom(roomId, {
              type: 'chat_message',
              data: {
                ...data,
                sender: userId,
                timestamp: new Date().toISOString()
              }
            });
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: 'Internal server error' }
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    if (userId && roomId) {
      try {
        roomManager.leaveRoom(roomId, userId);
        connections.get(roomId)?.delete(userId);

        // Aufräumen, wenn der Raum leer ist
        if (connections.get(roomId)?.size === 0) {
          connections.delete(roomId);
        } else {
          // Andere Teilnehmer informieren
          const room = roomManager.getRoom(roomId);
          if (room) {
            broadcastToRoom(roomId, {
              type: 'room_status',
              data: {
                participants: roomManager.getRoomParticipants(roomId),
                settings: room.settings
              }
            });
          }
        }
      } catch (error) {
        console.error('Error handling connection close:', error);
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket connection error:', error);
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`Server läuft auf ${HOST}:${PORT}`);
});