const express = require("express");
const path = require("path");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const randomWords = require("word-pictionary-list");
const io = new Server(server, {
  cors: {
    origin: [
      // "https://projects-03-trenchcoat.onrender.com",
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

let connectedUsers = []; // Array to store connected users

const rooms = {};

io.on("connection", (socket) => {
  console.log("User connected with socket ID:", socket.id);

  // raw dawg
  socket.on("createRoom", (data) => {
    console.log("Creating game with data:", data);
    const roomCode = generateRandomCode(5);
    const { userName } = data;
    socket.join(roomCode); // Join the room with the generated game code

    const user = {
      id: socket.id,
      userName,
    };

    const room = {
      code: roomCode,
      host: user,
      users: [user],
      randomWord: randomWords(1)[0],
      chatHistory: [],
      gameStarted: false,
    };

    rooms[roomCode] = room;

    io.to(roomCode).emit("roomDataUpdated", roomCode, rooms[roomCode]);
    console.log("Room created:", roomCode, rooms[roomCode]);
  });

  socket.on("updateRoomData", (roomCode, roomData) => {
    const room = rooms[roomCode];

    // Check if the room exists
    if (!room || !roomData) {
      console.log("Room not found or invalid data:", roomCode, roomData);
      return;
    }

    const user = room.users.find((u) => u.id === socket.id);

    if (!user) {
      console.log("User not found in room:", socket.id, roomCode);
      return;
    }

    const userIsHost = user.id === room.host.id;

    rooms[roomCode] = roomData;
    io.to(roomCode).emit("roomDataUpdated", roomCode, rooms[roomCode]);
  });

  socket.on("joinRoom", ({ inputCode, userName }) => {
    console.log("Joining room:", inputCode, userName);

    if (rooms[inputCode]) {
      socket.join(inputCode);

      const user = {
        id: socket.id,
        userName,
      };

      rooms[inputCode].users.push(user);
      io.to(inputCode).emit("roomDataUpdated", inputCode, rooms[inputCode]);
    } else {
      console.log("Room not found:", inputCode);
    }
  });

  socket.on("leaveRoom", ({ inputCode }) => {
    const room = rooms[inputCode];
    const user = room ? room?.users?.find((u) => u?.id === socket?.id) : null;
    const userIsHost = user ? user.id === room?.host?.id : false;

    if (room && user) {
      rooms[inputCode].users = room?.users?.filter((u) => u.id !== user.id);

      rooms[inputCode].chatHistory.push({
        user,
        message: `left the game.`,
        timestamp: new Date(),
      });

      console.log("Chat history after leaving:", rooms[inputCode].chatHistory);

      io.to(inputCode).emit("roomDataUpdated", inputCode, rooms[inputCode]);
      // Emit to the user who left
      io.to(socket.id).emit("roomDataUpdated", inputCode, null);
    }

    // If the user is the host, delete the room
    if (userIsHost) {
      console.log("Host left, deleting room:", inputCode);
      delete rooms[inputCode];
      io.to(inputCode).emit("roomDataUpdated", inputCode, null);
    }

    socket.leave(inputCode);
  });

  // Drawing events (shared canvas logic)
  socket.on("startDrawing", (code, data) => {
    io.to(code).emit("startDrawing", data);
  });

  socket.on("drawing", (code, data) => {
    io.to(code).emit("drawing", data);
  });

  socket.on("endDrawing", (code) => {
    io.to(code).emit("endDrawing");
  });

  socket.on("strokeDone", (code, stroke) => {
    io.to(code).emit("strokeDone", stroke);
    socket.broadcast.emit("strokeDone", stroke);
  });

  socket.on("undoLastStroke", () => {
    socket.broadcast.emit("undoLastStroke");
    socket.emit("undoLastStroke");
  });

  socket.on("clearCanvas", () => {
    socket.broadcast.emit("clearCanvas");
    socket.emit("clearCanvas");
  });

  socket.on("chatMessageSend", ({ message, gameCode, userName }) => {
    const room = rooms[gameCode];

    if (!room?.chatHistory) {
      console.log("Room not found:", gameCode);
      return;
    }

    const user = {
      id: socket.id,
      userName,
    };

    room.chatHistory.push({
      user,
      message,
      timestamp: new Date(),
    });

    io.to(gameCode).emit("roomDataUpdated", gameCode, room);
    console.log("Chat message sent:", message, gameCode, userName);
  });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile("host.html", { root: path.join(__dirname, "public") });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
