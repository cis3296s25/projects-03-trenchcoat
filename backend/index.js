const express = require('express');
const path = require('path');
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: [
            "https://projects-03-trenchcoat.onrender.com",
            "http://localhost:3000",
        ],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

function generateRandomCode(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    return result;
}

let gameCode = generateRandomCode(5);
let connectedUsers = []; // Array to store connected users
let hostSocketId = null; // Track the host's socket ID
const chatRooms = {};

io.on("connection", (socket) => {
    console.log("User connected with socket ID:", socket.id);
    // emits game code
    socket.emit('lobbyCreated', gameCode);

    socket.on("chatMessageSend", ({ message, gameCode, userName }) => {
        // Check if the room exists, if not create it
        chatRooms[gameCode] = chatRooms[gameCode] || [];

        // Add the message to the room's chat history
        chatRooms[gameCode].push({ userName, message, timestamp: new Date() });

        io.to(gameCode).emit("chatHistory", gameCode, chatRooms[gameCode]);
    });

    // Listen for verification requests
    socket.on('verifyGameCode', (clientCode, username) => {
        const isValid = clientCode === gameCode;

        if (isValid) {
            // Handle host connections
            if (username === 'Host') {
                // If there's already a host and it's not this socket
                if (hostSocketId && hostSocketId !== socket.id) {
                    console.log('Rejecting duplicate host connection attempt');
                    socket.emit('verificationResult', false);
                    return;
                }

                // Set this socket as the host
                hostSocketId = socket.id;
                console.log('Host connected with ID:', socket.id);
            }

            // Add user to room using the game code as the room name
            socket.join(gameCode);

            // Check if user already exists (from a refresh)
            const existingUserIndex = connectedUsers.findIndex(user => user.username === username);
            if (existingUserIndex !== -1) {
                // Replace the existing user's socket ID
                connectedUsers[existingUserIndex].id = socket.id;
            } else {
                // Add new user
                connectedUsers.push({
                    id: socket.id,
                    username: username || `User-${socket.id.substr(0, 4)}`
                });
            }
            // Emit updated user list to everyone in the room
            io.to(gameCode).emit('userList', connectedUsers);
        }

        // Send verification result back to the client
        socket.emit("verificationResult", isValid);
    });

    socket.on('startGame', () => {
        console.log("Game is starting");
        io.to(gameCode).emit('gameStarted');
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Check if the host disconnected
        if (socket.id === hostSocketId) {
            hostSocketId = null;
            console.log('Host disconnected');
        }

        // Remove user from our tracked list
        connectedUsers = connectedUsers.filter(user => user.id !== socket.id);

        // Update all remaining clients
        io.to(gameCode).emit("userList", connectedUsers);
    });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile('host.html', { root: path.join(__dirname, 'public') });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
    console.log("Game code:", gameCode);
});