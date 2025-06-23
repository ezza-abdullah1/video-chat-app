const express = require("express"); 
const http = require("http");
const cors = require("cors");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
  }
});

app.use(cors());

const PORT = process.env.PORT || 5000;

// Store usernames for each socket connection
const users = {};

app.get("/", (req, res) => {
  res.send("Server is running");
});

// When a user explicitly leaves the room
io.on("connection", (socket) => {
  console.log("New user connected:", socket.id);

  // When a client joins a specific room
  socket.on("join-room", ({ roomId, name }) => {
    socket.join(roomId);
    users[socket.id] = name;

    // Get all socket IDs already in the room (except this one)
    const room = io.sockets.adapter.rooms.get(roomId) || new Set();
    const otherUsers = [...room]
      .filter(id => id !== socket.id)
      .map(id => ({ id, name: users[id] || "Unknown" }));

    // Send the list of other users to the new client
    socket.emit("all-users", otherUsers);

    // Notify everyone else in the room that a new user joined
    socket.to(roomId).emit("user-connected", { callerId: socket.id, callerName: name });
  });

  // Handle a user leaving explicitly
  socket.on("leave-room", () => {
    // Broadcast a user-disconnected event so others remove this peer’s video tile
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        socket.to(roomId).emit("user-disconnected", socket.id);
      }
    }
  });

  // When a client (initiator) sends a signal to a user
  socket.on("sending-signal", ({ userToSignal, signal, callerId, callerName }) => {
    io.to(userToSignal).emit("user-joined", { signal, callerId, callerName });
  });

  // When a client (receiver) returns a signal back to an initiator
  socket.on("returning-signal", ({ signal, callerId }) => {
    io.to(callerId).emit("receiving-returned-signal", { signal, id: socket.id });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Inform all rooms (except the socket’s own room) that this user disconnected
    for (const roomId of socket.rooms) {
      if (roomId !== socket.id) {
        socket.to(roomId).emit("user-disconnected", socket.id);
      }
    }
    delete users[socket.id];
  });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
