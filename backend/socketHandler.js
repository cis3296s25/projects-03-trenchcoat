const roomService = require("./roomService");

module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("User connected with socket ID:", socket.id);

    // Handle room creation
    socket.on("createRoom", (data) => {
      console.log("Creating game with data:", data);
      const { userName } = data;

      const { roomCode, roomData } = roomService.createGameRoom(
        userName,
        socket.id
      );

      socket.join(roomCode);
      io.to(roomCode).emit("roomDataUpdated", roomCode, roomData);

      console.log("Room created:", roomCode, roomData);
    });

    // Handle room data updates
    socket.on("updateRoomData", (roomCode, roomData) => {
      const room = roomService.getRoomByCode(roomCode);

      if (!room) {
        console.log("Room not found:", roomCode);
        return;
      }

      const user = room.users.find((u) => u.id === socket.id);
      if (!user) {
        console.log("User not found in room:", socket.id, roomCode);
        return;
      }

      // Check if the game is starting 
      if (roomData.gameStarted && !room.gameStarted) {
          console.log("Game is starting - clearing chat history");
          roomService.clearRoomChat(roomCode);
          roomData.chatHistory = [];
      }

      // Check if the game is starting with timer
      if (roomData.gameStarted && room.timeLeft === room.maxTime) {
        const interval = setInterval(() => {
          const currentRoom = roomService.getRoomByCode(roomCode);

          // Check if the room still exists
          if (!currentRoom) {
            clearInterval(interval);
            return;
          }

          if (currentRoom?.timeLeft > 0) {
            currentRoom.timeLeft -= 1;
            io.to(roomCode).emit("roomDataUpdated", roomCode, currentRoom);
          } else {
            roomService.handleTurnEnd(io, roomCode, () => {
              clearInterval(interval);
            });
          }
        }, 1000);
      }

      const updatedRoom = roomService.updateRoomData(roomCode, roomData);
      io.to(roomCode).emit("roomDataUpdated", roomCode, updatedRoom);
    });

    // Handle joining a room
    socket.on("joinRoom", ({ inputCode, userName }) => {
      console.log("Joining room:", inputCode, userName);

      const room = roomService.getRoomByCode(inputCode);
      if (room && room.strokes) {
        socket.emit("canvasState", room.strokes);
      }

      if (!room) {
        console.log("Room not found:", inputCode);
        return;
      }

      socket.join(inputCode);

      const user = {
        id: socket.id,
        userName,
      };

      const updatedRoom = roomService.addUserToRoom(inputCode, user);
      io.to(inputCode).emit("roomDataUpdated", inputCode, updatedRoom);
    });

    socket.on("kickPlayer", ({ roomCode, targetSocketId }, callback) => {
      try {
        console.log("Attempting to kick", targetSocketId, "from", roomCode);
        const room = roomService.getRoomByCode(roomCode);
        if (!room) throw new Error("Room not found");
        if (room.host.id !== socket.id) throw new Error("Only host can kick");

        const result = roomService.removeUserFromRoom(roomCode, targetSocketId);
        if (!result.success) throw new Error("Failed to remove player");

        io.to(roomCode).emit("roomDataUpdated", roomCode, result.roomData);
        io.to(targetSocketId).emit("youWereKicked");

        callback({ success: true });
      } catch (error) {
        console.error("Kick error:", error.message);
        callback({ error: error.message });
      }
    });

    // Handle leaving a room
    socket.on("leaveRoom", ({ inputCode }) => {
      const result = roomService.removeUserFromRoom(inputCode, socket.id);

      if (!result.success) {
        return;
      }

      // Update room data for remaining users
      io.to(inputCode).emit("roomDataUpdated", inputCode, result.roomData);

      // Notify the user who left
      io.to(socket.id).emit("roomDataUpdated", inputCode, null);

      socket.leave(inputCode);
    });

    // Drawing events
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
      const room = roomService.getRoomByCode(code);
      if (room) {
        // Save the stroke to the room data
        room.strokes.push(stroke);
      }
      io.to(code).emit("strokeDone", stroke);
    });

    socket.on("undoLastStroke", (code) => { 
      const room = roomService.getRoomByCode(code);
      if (room && room.strokes.length > 0) {
        // Remove the last stroke from the room data
        room.strokes.pop();
      }

      io.to(code).emit("undoLastStroke");
    });

    socket.on("clearCanvas", (code) => { 
      const room = roomService.getRoomByCode(code);
      if (room) {
        // Clear all strokes in the room data
        room.strokes = [];
      }

      io.to(code).emit("clearCanvas");
    });

    // Event handler for when a user joins late
    socket.on("requestCanvasState", (code) => {
      const room = roomService.getRoomByCode(code);
      if (room && room.strokes) {
        socket.emit("canvasState", room.strokes);
      }
    });

    // Handle chat messages
    socket.on("chatMessageSend", ({ message, gameCode, userName }) => {
      const room = roomService.getRoomByCode(gameCode);

      if (!room) {
        console.log("Room not found:", gameCode);
        return;
      }

      const user = {
        id: socket.id,
        userName,
      };

      // const updatedRoom = roomService.sendChatMessage(gameCode, user, message);
      // io.to(gameCode).emit("roomDataUpdated", gameCode, updatedRoom);

      // console.log("Chat message sent:", message, gameCode, userName);

      const randomWord = room.randomWord?.toLowerCase();
      const cleanedMessage = message.trim().toLowerCase();
      const isCorrectGuess = cleanedMessage===(randomWord);

      // Send different chat message depending on correct guess
      if (isCorrectGuess) {
        const customMsg = `${userName} guessed the word!`;

        io.to(gameCode).emit("receive-chat", {
          msg: customMsg,
          player: user,
          rightGuess: true,
          players: room.users,
        });

        console.log("Correct guess by", userName, ":", message);
      } else {
        io.to(gameCode).emit("receive-chat", {
          msg: message,
          player: user,
          rightGuess: false,
          players: room.users,
        });
      }

      // Always store original message in room history
      const updatedRoom = roomService.sendChatMessage(gameCode, user, message);
      io.to(gameCode).emit("roomDataUpdated", gameCode, updatedRoom);
    });
  });
};