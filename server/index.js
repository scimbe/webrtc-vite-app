const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Speichert aktive Verbindungen
const rooms = new Map();

wss.on('connection', (ws) => {
  let roomId = '';
  let userId = '';

  ws.on('message', (message) => {
    const data = JSON.parse(message);

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
  });

  ws.on('close', () => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(userId);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      } else {
        // Benachrichtige andere Teilnehmer
        rooms.get(roomId).forEach((peerWs) => {
          peerWs.send(JSON.stringify({
            type: 'peer-left',
            userId
          }));
        });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Signaling Server läuft auf Port ${PORT}`);
});