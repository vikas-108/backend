// server.js
//adding socket.IO
const app = require('./app');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

const PORT = process.env.PORT || 8000;

mongoose.connect(process.env.MONGO_URI, {
    

}).then(() => {
  console.log('MongoDB connected');
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.log(err));



// --- SOCKET.IO CHAT LOGIC ---
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a user to their own room
  socket.on('join', (userPhone) => {
    socket.join(userPhone);
    console.log(`User ${userPhone} joined room`);
  });

  // Handle sending a message
  socket.on('send-message', (data) => {
    const { from, to, content } = data;
    console.log(`Message from ${from} to ${to}: ${content}`);

    // Emit to receiver's room
    io.to(to).emit('receive-message', { from, to, content, sentAt: new Date() });

    // Optional: Save message to MongoDB
    const Message = require('./models/Message');
    const msg = new Message({ from, to, content });
    msg.save();
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});


