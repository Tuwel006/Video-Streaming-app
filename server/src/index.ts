// server/index.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());

app.get('/', (req, res) => {
  res.send('🎥 WebRTC Streaming Server is running');
});

const connectedPeers = new Map<string, any>();
const streamReadyPeers = new Set<string>();

io.on('connection', socket => {
  console.log(`🔌 Client connected: ${socket.id}`);

  connectedPeers.set(socket.id, socket);

  // When user actually clicks "Start Streaming"
  socket.on('start-stream', () => {
    console.log(`🎬 ${socket.id} clicked "Start Streaming"`);

    streamReadyPeers.add(socket.id);

    if (streamReadyPeers.size >= 2) {
      const [id1, id2] = Array.from(streamReadyPeers);
      streamReadyPeers.clear();

      console.log(`🔗 Pairing ready clients:\n   📡 ${id1} <--> ${id2}`);

      const socket1 = connectedPeers.get(id1);
      const socket2 = connectedPeers.get(id2);

      // Designate id1 as the offerer
      socket1?.emit('ready-to-connect', { peerId: id2, offerer: true });
    }
  });

  socket.on('offer', ({ targetId, offer }) => {
    const targetSocket = connectedPeers.get(targetId);
    if (targetSocket) {
      targetSocket.emit('offer', { fromId: socket.id, offer });
    }
  });

  socket.on('answer', ({ targetId, answer }) => {
    const targetSocket = connectedPeers.get(targetId);
    if (targetSocket) {
      targetSocket.emit('answer', { fromId: socket.id, answer });
    }
  });

  socket.on('ice-candidate', ({ targetId, candidate }) => {
    const targetSocket = connectedPeers.get(targetId);
    if (targetSocket) {
      targetSocket.emit('ice-candidate', { fromId: socket.id, candidate });
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    connectedPeers.delete(socket.id);
    streamReadyPeers.delete(socket.id);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`✅ Server listening at http://localhost:${PORT}`);
});
