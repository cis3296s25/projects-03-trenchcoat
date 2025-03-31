const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

function generateRandomCode(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }

    return result;
}

let gameCode = generateRandomCode(5);
let connectedUsers = []; // Array to store connected users

io.on('connection', (socket) => {
    console.log('User connected with socket ID:', socket.id);

    // Listen for verification requests
    socket.on('verifyGameCode', (clientCode, username) => {
        const isValid = clientCode === gameCode;

        if (isValid) {
            // Add user to room using the game code as the room name
            socket.join(gameCode);

            // Add user to our tracked list with their socket ID and username
            connectedUsers.push({
                id: socket.id,
                username: username || `User-${socket.id.substr(0, 4)}`
            });

            // Emit updated user list to everyone in the room
            io.to(gameCode).emit('userList', connectedUsers);
        }

        // Send verification result back to the client
        socket.emit('verificationResult', isValid);
    });

    // Handle disconnections
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Remove user from our tracked list
        connectedUsers = connectedUsers.filter(user => user.id !== socket.id);

        // Update all remaining clients
        io.to(gameCode).emit('userList', connectedUsers);
    });
});

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
    console.log('Game code:', gameCode);
});