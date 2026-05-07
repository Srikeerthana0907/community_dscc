require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const groupRoutes = require('./routes/groupRoutes');
const messageRoutes = require('./routes/messageRoutes');
const postRoutes = require('./routes/postRoutes');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mentalhealthdscc';

// Middleware
app.use(cors());
app.use(express.json());

// Log incoming requests and IP
// Log incoming requests and IP
app.use(function (req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} from ${ip}`);
  next();
});

// Health Check Route
app.get('/api/health', (req, res) => res.status(200).send('OK'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_private', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their private room`);
  });

  socket.on('join_group', (groupId) => {
    socket.join(groupId);
    console.log(`User joined group room: ${groupId}`);
  });

  socket.on('send_message', async (data) => {
    const { sender, recipient, group, content } = data;
    
    try {
      const newMessage = new Message({ sender, recipient, group, content });
      await newMessage.save();
      
      const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'username avatar');

      if (group) {
        // Group message
        io.to(group).emit('receive_message', populatedMessage);
      } else if (recipient) {
        // Private message
        io.to(recipient).to(sender).emit('receive_message', populatedMessage);
      }
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Mental Health Community API is active'
  });
});



// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log(`Connected to MongoDB successfully at ${MONGO_URI}`);
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
