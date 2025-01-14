const WebSocket = require('ws');
const http = require('http');

// Create HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(404);
  res.end();
});

// Create WebSocket server
const wss = new WebSocket.Server({ server, path: '/ws' });

// Store connected clients
const rooms = new Map();

wss.on('connection', (ws, req) => {
  const roomId = req.url.split('/').pop(); // Extract room ID from URL
  console.log(`Client connected to room: ${roomId}`);

  // Add client to room
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId).add(ws);

  // Handle messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Received message in room ${roomId}:`, data);

      // Broadcast to all clients in the same room
      rooms.get(roomId).forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (err) {
      console.error('Error processing message:', err);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    console.log(`Client disconnected from room: ${roomId}`);
    rooms.get(roomId)?.delete(ws);
    if (rooms.get(roomId)?.size === 0) {
      rooms.delete(roomId);
    }
  });

  // Send initial room status
  ws.send(JSON.stringify({
    type: 'room_status',
    data: {
      roomId,
      participants: [...(rooms.get(roomId) || [])].length
    }
  }));
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});
