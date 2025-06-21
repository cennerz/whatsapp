const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

const app = express();
const httpServer = createServer(app);

// CORS for frontend domain
app.use(cors({
  origin: ['https://mauka365.com'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

const io = new Server(httpServer, {
  cors: {
    origin: ['https://mauka365.com'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// WhatsApp client
const client = new Client({
  authStrategy: new LocalAuth({ dataPath: './sessions' })
});

// Socket.io QR and readiness handlers
io.on('connection', (socket) => {
  console.log('Client connected');

  client.on('qr', (qr) => {
    console.log("QR Generated");
    socket.emit('qr', qr);
  });

  client.on('ready', () => {
    console.log("WhatsApp is ready!");
    socket.emit('ready');
  });
});

client.initialize();

// REST endpoint to send message
app.post('/send-message', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ status: 'error', message: 'Number and message are required.' });
  }

  try {
    const chatId = number.includes('@c.us') ? number : number + '@c.us';
    const sentMessage = await client.sendMessage(chatId, message);
    res.json({ status: 'success', messageId: sentMessage.id.id });
  } catch (error) {
    console.error("Error sending message:", error.message);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
