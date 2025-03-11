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

app.get("/", (req, res) => {
    res.send("Server is running");
});

io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    // Send the socket ID to the client
    socket.emit("me", socket.id);
    console.log("Emitting my ID:", socket.id);

    socket.on("disconnect", () => {
        socket.broadcast.emit("callended");
        console.log("User disconnected:", socket.id);
    });

    socket.on("calluser", ({ userToCall, signalData, from, name }) => {
        if (!signalData) {
            console.error(`Received calluser event but signalData is undefined!`);
            return;
        }

        console.log(`Received calluser event from ${from} to ${userToCall}, Caller Name: ${name}`);
        console.log("Signal Data:", signalData);

        const recipientSocket = io.sockets.sockets.get(userToCall);
        if (!recipientSocket) {
            console.error(`User ${userToCall} not found in connected sockets!`);
            io.to(from).emit("user-not-found", { userToCall });
            return;
        }

        // Send call request with correct caller name
        io.to(userToCall).emit("calluser", { signal: signalData, from, name });
    });

    socket.on("answercall", ({ signal, to, name }) => {
        console.log(`User ${socket.id} answered the call. Sending name: ${name} to caller ${to}`);

        io.to(to).emit("callaccepted", { signal, name }); // Ensure the caller gets the correct callee's name
    });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
