import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { parse } from 'url';

const server = createServer((req, res) => {
  const { pathname } = parse(req.url);
  
  if (pathname === '/health') {
    res.writeHead(200);
    res.end('OK');
    return;
  }

  res.writeHead(404);
  res.end();
});

const wss = new WebSocketServer({
  server,
  path: '/room',
  perMessageDeflate: false,
  maxPayload: 50 * 1024 * 1024
});

const rooms = new Map();

wss.on('connection', (ws, request) => {
  const { pathname } = parse(request.url);
  const roomId = pathname.split('/').pop();
  
  console.log(`Client connecting to room: ${roomId}`);
  let userId = '';

  const heartbeat = {
    ping: setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        ws.ping();
      }
    }, 30000),
    timeout: null
  };

  ws.on('pong', () => {
    clearTimeout(heartbeat.timeout);
    heartbeat.timeout = setTimeout(() => {
      ws.terminate();
    }, 35000);
  });

  ws.on('close', () => {
    console.log(`Client disconnected from room: ${roomId}`);
    clearInterval(heartbeat.ping);
    clearTimeout(heartbeat.timeout);

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

      if (data.type === 'join') {
        userId = data.data.userId;

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Map());
        }
        rooms.get(roomId).set(userId, ws);

        const roomClients = Array.from(rooms.get(roomId).entries())
          .map(([id, client]) => ({
            userId: id,
            isConnected: client.readyState === ws.OPEN
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

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing server...');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});