const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
const httpServer = createServer(app);

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

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "mauka-clean" })
});

io.on('connection', (socket) => {
  console.log('Socket connected');

  client.on('qr', (qr) => {
    console.log("QR Generated");
    socket.emit('qr', qr);
  });

  client.on('ready', () => {
    console.log("WhatsApp is ready");
    socket.emit('ready');
  });
});

client.initialize();

app.post('/send-message', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ status: 'error', message: 'Number and message are required.' });
  }

  try {
    const chatId = number.includes('@c.us') ? number : number + '@c.us';
    const sent = await client.sendMessage(chatId, message);
    res.json({ status: 'success', id: sent.id.id });
  } catch (error) {
    console.error("SEND ERROR:", error.message);
    console.error(error.stack);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

const PORT = process.env.PORT || 8000;
httpServer.listen(PORT, () => console.log(`Running on port ${PORT}`));
