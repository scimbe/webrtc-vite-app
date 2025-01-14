const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server, path: '/' });

const rooms = new Map();

wss.on('connection', (ws, req) => {
  console.log('New client connected');
  let roomId = '';
  let userId = '';

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log('Received:', data);

      if (data.type === 'join') {
        roomId = data.data.roomId;
        userId = data.data.userId;

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Map());
        }
        rooms.get(roomId).set(userId, ws);

        // Send room status to all clients in the room
        const roomClients = Array.from(rooms.get(roomId).entries()).map(([id, client]) => ({
          userId: id,
          isConnected: client.readyState === WebSocket.OPEN
        }));

        const statusMessage = {
          type: 'room_status',
          data: {
            participants: roomClients
          }
        };

        broadcastToRoom(roomId, statusMessage);
      } else if (roomId && rooms.has(roomId)) {
        // Broadcast message to other clients in the room
        broadcastToRoom(roomId, data, userId);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    if (roomId && rooms.has(roomId)) {
      rooms.get(roomId).delete(userId);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      } else {
        // Notify others about disconnection
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
    rooms.get(roomId).forEach((client, userId) => {
      if (userId !== excludeUserId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});