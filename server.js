const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const client = new Client({ authStrategy: new LocalAuth() });

app.use(express.json());
app.use(express.static('public'));

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

httpServer.listen(8000, () => console.log('Server running on port 8000'));
