import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
}

const server = createServer(app);
const wss = new WebSocketServer({ server });

// Speichert aktive Verbindungen
const rooms = new Map();

wss.on('connection', (ws) => {
  let roomId = '';
  let userId = '';

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', data);

      switch (data.type) {
        case 'join':
          roomId = data.roomId;
          userId = data.userId;

          if (!rooms.has(roomId)) {
            rooms.set(roomId, new Map());
          }
          rooms.get(roomId).set(userId, ws);

          ws.send(JSON.stringify({
            type: 'joined',
            roomId,
            userId,
            participants: Array.from(rooms.get(roomId).keys())
          }));
          break;

        case 'offer':
        case 'answer':
        case 'ice-candidate':
          if (rooms.has(roomId)) {
            const targetWs = rooms.get(roomId).get(data.target);
            if (targetWs) {
              targetWs.send(JSON.stringify({
                type: data.type,
                data: data.data,
                sender: userId
              }));
            }
          }
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(userId);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      } else {
        rooms.get(roomId).forEach((peerWs) => {
          peerWs.send(JSON.stringify({
            type: 'peer-left',
            userId
          }));
        });
      }
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});