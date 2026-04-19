const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const authRoutes = require('./routes/authRoutes');
const channelRoutes = require('./routes/channelRoutes');
const directMessageRoutes = require('./routes/directMessageRoutes');
const Message = require('./models/Message');

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/messages', directMessageRoutes);

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send_message', async (data) => {
    // data: { channelId, recipientId, senderId, content, username, avatar }
    try {
      // Persist message to DB
      const newMessage = await Message.create({
        sender: data.senderId,
        content: data.content,
        channel: data.channelId || null,
        recipient: data.recipientId || null
      });

      const broadcastData = {
        ...data,
        _id: newMessage._id,
        createdAt: newMessage.createdAt
      };

      if (data.channelId) {
        io.to(data.channelId).emit('receive_message', broadcastData);
      } else if (data.recipientId) {
        // Emit to both sender and recipient rooms
        io.to(data.recipientId).emit('receive_message', broadcastData);
        io.to(data.senderId).emit('receive_message', broadcastData);
      }
    } catch (err) {
      console.error("Socket error (persistence):", err);
    }
  });

  socket.on('typing', (data) => {
    const target = data.channelId || data.recipientId;
    if (target) socket.to(target).emit('user_typing', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../', 'build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
