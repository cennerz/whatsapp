const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

const app = express();
const httpServer = createServer(app);

// Enable CORS for your Hostinger frontend
app.use(cors({
  origin: ['https://mauka365.com'], // 🔁 Replace with your real domain
  methods: ['GET', 'POST'],
  credentials: true
}));

const io = new Server(httpServer, {
  cors: {
    origin: ['https://yourdomain.com'], // 🔁 Replace with your real domain
    methods: ['GET', 'POST']
  }
});

// WhatsApp client setup
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './sessions' })
});

// Express middlewares
app.use(express.json());
app.use(express.static('public'));

// Socket.io handlers
io.on('connection', (socket) => {
  console.log('Client connected');

  client.on('qr', (qr) => {
    socket.emit('qr', qr);
  });

  client.on('ready', () => {
    socket.emit('ready');
  });
});

// WhatsApp initialization
client.initialize();

// REST API endpoint to send message
app.post('/send-message', async (req, res) => {
  const { number, message } = req.body;

  try {
    const chatId = number + '@c.us';
    await client.sendMessage(chatId, message);
    res.json({ status: 'success', number });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message });
  }
});

// Start server on dynamic Render port or fallback 8000
const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
