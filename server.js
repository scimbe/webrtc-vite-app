import { WebSocketServer } from 'ws';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { parse } from 'url';

const app = express();

// CORS für alle Origins erlauben während der Entwicklung
app.use(cors());

// Express Server
const server = createServer(app);

// WebSocket Server
const wss = new WebSocketServer({ 
  noServer: true,  // Wichtig: Server selbst handlen
  clientTracking: true
});

// Room Management
const rooms = new Map();

// HTTP zu WS Upgrade handling
server.on('upgrade', (request, socket, head) => {
  const { pathname } = parse(request.url);
  console.log('Upgrade request for path:', pathname);

  // Prüfe ob der Pfad mit /ws/room/ beginnt
  if (pathname.startsWith('/ws/room/')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      console.log('WebSocket connection established');
      wss.emit('connection', ws, request);
    });
  } else {
    console.log('Invalid WebSocket path:', pathname);
    socket.destroy();
  }
});

// WebSocket Verbindungshandling
wss.on('connection', (ws, request) => {
  const roomId = request.url.split('/ws/room/')[1];
  console.log('Client connected to room:', roomId);
  
  let userId = null;

  // Regelmäßiger Ping
  const pingInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    }
  }, 30000);

  // Verbindung sofort bestätigen
  try {
    ws.send(JSON.stringify({ 
      type: 'connected',
      data: { roomId }
    }));
  } catch (err) {
    console.error('Error sending connected message:', err);
  }

  ws.on('pong', () => {
    // Connection is alive
  });

  ws.on('close', () => {
    console.log(`Client disconnected from room: ${roomId}`);
    clearInterval(pingInterval);

    if (roomId && userId && rooms.has(roomId)) {
      rooms.get(roomId).delete(userId);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      } else {
        broadcastToRoom(roomId, {
          type: 'participant_left',
          data: { userId }
        });
      }
    }
  });

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', data.type);

      if (data.type === 'join') {
        userId = data.data.userId;
        
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Map());
        }
        rooms.get(roomId).set(userId, ws);

        const roomClients = Array.from(rooms.get(roomId).entries())
          .map(([id, _]) => ({
            userId: id,
            isConnected: true
          }));

        ws.send(JSON.stringify({
          type: 'room_status',
          data: { participants: roomClients }
        }));

        broadcastToRoom(roomId, {
          type: 'participant_joined',
          data: { userId }
        }, userId);
      } else if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
      } else if (roomId && rooms.has(roomId)) {
        broadcastToRoom(roomId, data, userId);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: { message: error.message }
      }));
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function broadcastToRoom(roomId, message, excludeUserId = null) {
  if (!rooms.has(roomId)) return;

  const room = rooms.get(roomId);
  const messageStr = JSON.stringify(message);

  room.forEach((client, clientId) => {
    if (clientId !== excludeUserId && client.readyState === WebSocketServer.OPEN) {
      try {
        client.send(messageStr);
      } catch (error) {
        console.error(`Error sending to client ${clientId}:`, error);
        client.terminate();
        room.delete(clientId);
      }
    }
  });
}

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('WebSocket server ready');
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  wss.close(() => {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});