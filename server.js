import { WebSocketServer } from 'ws';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';

// Express app setup
const app = express();
app.use(cors());

// HTTP server
const server = createServer(app);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// WebSocket server
const wss = new WebSocketServer({ 
  server,
  path: '/room',
  clientTracking: true
});

// Room management
const rooms = new Map();

wss.on('connection', (ws, request) => {
  console.log('New connection attempt');
  let roomId = '';
  let userId = '';

  // Handle ping/pong
  const pingInterval = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    }
  }, 30000);

  ws.on('pong', () => {
    // Connection is alive
  });

  ws.on('close', () => {
    clearInterval(pingInterval);
    console.log(`Client disconnected from room: ${roomId}`);

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
      console.log('Received message:', data.type);

      if (data.type === 'join') {
        roomId = request.url.split('/').pop();
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

        broadcastToRoom(roomId, {
          type: 'room_status',
          data: { participants: roomClients }
        });
      } else if (roomId && rooms.has(roomId)) {
        broadcastToRoom(roomId, data, userId);
      }
    } catch (error) {
      console.error('Error processing message:', error);
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

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready on ws://localhost:${PORT}/room`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});