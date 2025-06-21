const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

const app = express();
const httpServer = createServer(app);

// ✅ CORS for REST API
app.use(cors({
  origin: ['https://mauka365.com'], // replaced with your actual domain
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// ✅ CORS for WebSocket
const io = new Server(httpServer, {
  cors: {
    origin: ['https://mauka365.com'], // replaced with your actual domain
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// WhatsApp client setup
const client = new Client({ authStrategy: new LocalAuth({ dataPath: './sessions' }) });

io.on('connection', (socket) => {
  console.log('Client connected');

  client.on('qr', (qr) => {
    socket.emit('qr', qr);
  });

  client.on('ready', () => {
    socket.emit('ready');
  });
});

client.initialize();

// REST API to send message
app.post('/send-message', async (req, res) => {
  const { number, message } = req.body;
  try {
    const chatId = number + '@c.us';
    await client.sendMessage(chatId, message);
    res.json({ status: 'success' });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
