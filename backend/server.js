const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const socketHandler = require("./socketHandler");
const config = require("./config");

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS configuration
const io = new Server(server, { cors: config.cors });

// Set up socket handlers
socketHandler(io);

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
