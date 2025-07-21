const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? ["https://your-frontend-domain.vercel.app"]
      : ["http://localhost:3000"],
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
  }
});

app.use(cors());

const PORT = process.env.PORT || 5000;

// Store usernames and status for each socket connection
const users = {};

app.get("/", (req, res) => {
  res.send("Server is running");
});

io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);
  
  // Send socket ID to client
  socket.emit("me", socket.id);

  // When a client joins a specific room
  socket.on("join-room", ({ roomId, name }) => {
    console.log(`${name} (${socket.id}) joining room ${roomId}`);
    socket.join(roomId);
    users[socket.id] = { 
      name, 
      roomId,
      audioEnabled: true, // Default state
      videoEnabled: true  // Default state
    };

    // Get all socket IDs already in the room (except this one)
    const room = io.sockets.adapter.rooms.get(roomId) || new Set();
    const otherUsers = [...room]
      .filter(id => id !== socket.id)
      .map(id => ({ 
        id, 
        name: users[id]?.name || "Unknown",
        audioEnabled: users[id]?.audioEnabled ?? true,
        videoEnabled: users[id]?.videoEnabled ?? true
      }));

    console.log(`Sending ${otherUsers.length} other users to ${socket.id}`);
    // Send the list of other users to the new client with their current status
    socket.emit("all-users", otherUsers);

    // Notify everyone else in the room that a new user joined (with default enabled status)
    socket.to(roomId).emit("user-connected", { 
      callerId: socket.id, 
      callerName: name,
      audioEnabled: true,
      videoEnabled: true
    });
  });

  // Handle a user leaving explicitly
  socket.on("leave-room", () => {
    console.log(`User ${socket.id} leaving room`);
    // Broadcast a user-disconnected event so others remove this peer's video tile
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        socket.to(roomId).emit("user-disconnected", socket.id);
      }
    }
    delete users[socket.id];
  });

  // When a client (initiator) sends a signal to a user
  socket.on("sending-signal", ({ userToSignal, signal, callerId, callerName }) => {
    console.log(`Signal from ${callerId} to ${userToSignal}`);
    io.to(userToSignal).emit("user-joined", { signal, callerId, callerName });
  });

  // FIXED: When a client (receiver) returns a signal back to an initiator
  socket.on("returning-signal", ({ signal, callerId }) => {
    console.log(`Returning signal from ${socket.id} to ${callerId}`);
    io.to(callerId).emit("receiving-returned-signal", { signal, id: socket.id });
  });

  // Chat message handling
  socket.on("send-chat-message", ({ roomId, message, senderName, senderId }) => {
    console.log(`[CHAT] Message from ${senderName} (${senderId}) in room ${roomId}:`, message);
    
    // Broadcast to OTHER users in the room (not including sender)
    socket.to(roomId).emit("receive-chat-message", {
      message,
      senderName,
      senderId,
      timestamp: Date.now()
    });
  });

  // Handle track state changes (video/audio on/off)
  socket.on("track-state-change", ({ roomId, trackType, enabled, userId }) => {
    console.log(`Track state change: ${userId} ${trackType} ${enabled ? 'enabled' : 'disabled'}`);
    
    // Broadcast the track state change to all other users in the room
    socket.to(roomId).emit("track-state-change", {
      userId,
      trackType,
      enabled
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Inform all rooms that this user disconnected
    const userData = users[socket.id];
    if (userData && userData.roomId) {
      socket.to(userData.roomId).emit("user-disconnected", socket.id);
    }
    delete users[socket.id];
  });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));