import { WebSocketServer } from 'ws';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';

const app = express();
app.use(cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST']
}));

const server = createServer(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// WebSocket server
const wss = new WebSocketServer({
  server,
  path: '/ws/room',
  clientTracking: true,
  perMessageDeflate: false
});

// Room management
const rooms = new Map();

wss.on('connection', (ws, request) => {
  console.log('New WebSocket connection:', request.url);
  let roomId = request.url.split('/ws/room/')[1];
  let userId = null;

  const pingInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    }
  }, 30000);

  ws.on('pong', () => {
    console.log('Received pong from client');
  });

  ws.on('close', () => {
    console.log('Client disconnected from room:', roomId);
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

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received message:', { type: data.type, roomId });

      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
        return;
      }

      if (data.type === 'join') {
        userId = data.data.userId;
        console.log(`Client ${userId} joining room ${roomId}`);

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
      } else if (roomId && rooms.has(roomId)) {
        broadcastToRoom(roomId, data, userId);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        data: error.message
      }));
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });

  // Send connection confirmation
  ws.send(JSON.stringify({ type: 'connected' }));
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
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready on ws://localhost:${PORT}/ws/room`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});