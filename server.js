import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = createServer((req, res) => {
  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({ 
  server,
  path: '/ws',
  perMessageDeflate: false,
  clientTracking: true,
  backlog: 100,
  maxPayload: 50 * 1024 * 1024, // 50MB
});

const rooms = new Map();

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  console.log(`New client connected from ${clientIp}`);

  let roomId = '';
  let userId = '';

  const ping = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    }
  }, 30000);

  ws.on('pong', () => {
    // Client is alive
  });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received:', { type: data.type, roomId: data.roomId });

      if (data.type === 'join') {
        roomId = data.data.roomId;
        userId = data.data.userId;

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Map());
        }
        rooms.get(roomId).set(userId, ws);

        // Send room status to all clients in the room
        const roomClients = Array.from(rooms.get(roomId).entries()).map(([id, _]) => ({
          userId: id,
          isConnected: true
        }));

        const statusMessage = {
          type: 'room_status',
          data: {
            participants: roomClients
          }
        };

        broadcastToRoom(roomId, statusMessage);
      } else if (roomId && rooms.has(roomId)) {
        broadcastToRoom(roomId, data, userId);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => {
    clearInterval(ping);
    console.log(`Client disconnected from room ${roomId}`);
    
    if (roomId && rooms.has(roomId)) {
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

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

function broadcastToRoom(roomId, message, excludeUserId = null) {
  if (rooms.has(roomId)) {
    const room = rooms.get(roomId);
    room.forEach((client, userId) => {
      if (userId !== excludeUserId && client.readyState === WebSocketServer.OPEN) {
        try {
          client.send(JSON.stringify(message));
        } catch (error) {
          console.error(`Error sending to client ${userId}:`, error);
          // Remove problematic client
          room.delete(userId);
        }
      }
    });
  }
}

const PORT = process.env.PORT || 3001;

server.on('error', (error) => {
  console.error('Server error:', error);
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server...');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});