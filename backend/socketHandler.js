const roomService = require("./roomService");

const intervals = {};

module.exports = function (io) {
  const validateDrawer = (socket, roomCode) => {
    const room = roomService.getRoomByCode(roomCode);
    if (!room) return false;

    const currentDrawer = room.users[room.currentDrawerIndex];
    return (
      currentDrawer?.socketId === socket.id || currentDrawer?.id === socket.id
    );
  };

  // Helper function to create a masked version of the word for guessers
  const createMaskedWord = (word) => {
    if (!word) return '';
    return word.split('').map(char => char === ' ' ? ' ' : '_').join('');
  };

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
            // updating the time left in the room data (decrementing by 1 second)
            currentRoom.timeLeft -= 1;

            // Send different versions of the room data to different users
            currentRoom.users.forEach(user => {
              const isDrawer = currentRoom.users[currentRoom.currentDrawerIndex].id === user.id ||
                currentRoom.users[currentRoom.currentDrawerIndex].socketId === user.id;

              // Create a custom room data object for each user
              const userRoomData = { ...currentRoom };

              // For non-drawers, mask the word
              if (!isDrawer) {
                userRoomData.maskedWord = createMaskedWord(currentRoom.randomWord);
                userRoomData.randomWord = null; // Don't send the actual word
              }

              // Send the personalized room data to this specific user
              io.to(user.socketId || user.id).emit("roomDataUpdated", roomCode, userRoomData);
            });
          } else {
            // Time's up, handle turn end
            roomService.handleTurnEnd(io, roomCode, () => {
              clearInterval(interval);
            });
          }
        }, 1000);

        intervals[roomCode] = interval; // Store the interval ID for later clearing
      }

      const updatedRoom = roomService.updateRoomData(roomCode, roomData);

      updatedRoom.users.forEach(user => {
        const isDrawer = updatedRoom.users[updatedRoom.currentDrawerIndex].id === user.id ||
          updatedRoom.users[updatedRoom.currentDrawerIndex].socketId === user.id;

        // Create a custom room data object for each user
        const userRoomData = { ...updatedRoom };

        // For non-drawers, mask the word
        if (!isDrawer) {
          userRoomData.maskedWord = createMaskedWord(updatedRoom.randomWord);
          userRoomData.randomWord = null; // Don't send the actual word
        }

        // Send the personalized room data to this specific user
        io.to(user.socketId || user.id).emit("roomDataUpdated", roomCode, userRoomData);
      });
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

      // When a user joins, personalize the room data
      updatedRoom.users.forEach(roomUser => {
        const isDrawer = updatedRoom.gameStarted &&
          (updatedRoom.users[updatedRoom.currentDrawerIndex].id === roomUser.id ||
            updatedRoom.users[updatedRoom.currentDrawerIndex].socketId === roomUser.id);

        // Create a custom room data object for each user
        const userRoomData = { ...updatedRoom };

        // For non-drawers, mask the word if the game is in progress
        if (!isDrawer && updatedRoom.gameStarted) {
          userRoomData.maskedWord = createMaskedWord(updatedRoom.randomWord);
          userRoomData.randomWord = null; // Don't send the actual word
        }

        // Send the personalized room data to this specific user
        io.to(roomUser.socketId || roomUser.id).emit("roomDataUpdated", inputCode, userRoomData);
      });
    });

    socket.on("kickPlayer", ({ roomCode, targetSocketId }, callback) => {
      try {
        console.log("Attempting to kick", targetSocketId, "from", roomCode);
        const room = roomService.getRoomByCode(roomCode);
        if (!room) throw new Error("Room not found");
        if (room.host.id !== socket.id) throw new Error("Only host can kick");

        const result = roomService.removeUserFromRoom(roomCode, targetSocketId);
        if (!result.success) throw new Error("Failed to remove player");

        // Personalize the room data for each remaining user
        if (result.roomData) {
          result.roomData.users.forEach(user => {
            const isDrawer = result.roomData.gameStarted &&
              (result.roomData.users[result.roomData.currentDrawerIndex].id === user.id ||
                result.roomData.users[result.roomData.currentDrawerIndex].socketId === user.id);

            // Create a custom room data object for each user
            const userRoomData = { ...result.roomData };

            // For non-drawers, mask the word if the game is in progress
            if (!isDrawer && result.roomData.gameStarted) {
              userRoomData.maskedWord = createMaskedWord(result.roomData.randomWord);
              userRoomData.randomWord = null;
            }

            // Send the personalized room data to this specific user
            io.to(user.socketId || user.id).emit("roomDataUpdated", roomCode, userRoomData);
          });
        } else {
          io.to(roomCode).emit("roomDataUpdated", roomCode, null);
        }

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

      // Update room data for remaining users, personalized
      if (result.roomData) {
        result.roomData.users.forEach(user => {
          const isDrawer = result.roomData.gameStarted &&
            (result.roomData.users[result.roomData.currentDrawerIndex].id === user.id ||
              result.roomData.users[result.roomData.currentDrawerIndex].socketId === user.id);

          // Create a custom room data object for each user
          const userRoomData = { ...result.roomData };

          // For non-drawers, mask the word if the game is in progress
          if (!isDrawer && result.roomData.gameStarted) {
            userRoomData.maskedWord = createMaskedWord(result.roomData.randomWord);
            userRoomData.randomWord = null;
          }

          // Send the personalized room data to this specific user
          io.to(user.socketId || user.id).emit("roomDataUpdated", inputCode, userRoomData);
        });
      } else {
        io.to(inputCode).emit("roomDataUpdated", inputCode, null);
      }

      // Notify the user who left
      io.to(socket.id).emit("roomDataUpdated", inputCode, null);

      socket.leave(inputCode);
    });

    // Drawing events - unchanged
    socket.on("startDrawing", (code, data) => {
      if (!validateDrawer(socket, code)) return;
      io.to(code).emit("startDrawing", data);
    });

    socket.on("drawing", (code, data) => {
      if (!validateDrawer(socket, code)) return;
      io.to(code).emit("drawing", data);
    });

    socket.on("endDrawing", (code) => {
      if (!validateDrawer(socket, code)) return;
      io.to(code).emit("endDrawing");
    });

    socket.on("strokeDone", (code, stroke) => {
      if (!validateDrawer(socket, code)) return;
      const room = roomService.getRoomByCode(code);
      if (room) {
        // Save the stroke to the room data
        room.strokes.push(stroke);
      }
      io.to(code).emit("strokeDone", stroke);
    });

    socket.on("undoLastStroke", (code) => {
      if (!validateDrawer(socket, code)) return;
      const room = roomService.getRoomByCode(code);
      if (room && room.strokes.length > 0) {
        // Remove the last stroke from the room data
        room.strokes.pop();
      }

      io.to(code).emit("undoLastStroke");
    });

    socket.on("clearCanvas", (code) => {
      if (!validateDrawer(socket, code)) return;
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

    // Handle chat messages - almost unchanged
    socket.on("chatMessageSend", ({ message, gameCode, userName }) => {
      const room = roomService.getRoomByCode(gameCode);

      if (!room) {
        console.log("Room not found:", gameCode);
        return;
      }

      const user = room.users.find((u) => u.id === socket.id);

      const randomWord = room.randomWord?.toLowerCase();
      const cleanedMessage = message.trim().toLowerCase();
      const isCorrectGuess = cleanedMessage === randomWord;

      // For correct guesses
      if (
        isCorrectGuess &&
        !room.correctGuessers.find((u) => u.id === user.id)
      ) {
        const drawer = room.users[room.currentDrawerIndex];

        // Award points to guesser based on time
        const guesserPoints = Math.ceil(room.timeLeft * 4);
        user.score = (user.score || 0) + guesserPoints;
        user.pointsGainedThisTurn = (user.pointsGainedThisTurn || 0) + guesserPoints;

        // Award points to drawer
        let drawerPoints = 0;
        if (room.correctGuessers.length === 0) {
          drawerPoints = 100; // first correct guess
        } else {
          drawerPoints = 50; // each additional
        }
        drawer.score = (drawer.score || 0) + drawerPoints;
        drawer.pointsGainedThisTurn = (drawer.pointsGainedThisTurn || 0) + drawerPoints;

        room.correctGuessers.push(user);

        // Send success message
        const correctGuessMsg = `${userName} guessed the word!`;

        // Store the correct guess notification in the chat history
        // instead of the original message
        const updatedRoom = roomService.sendChatMessage(
          gameCode,
          user,
          correctGuessMsg
        );

        // Emit the chat notification
        io.to(gameCode).emit("receive-chat", {
          msg: correctGuessMsg,
          player: user,
          rightGuess: true,
          players: room.users,
          timestamp: new Date(),
        });

        // Update room data with the correct guess message in chat history
        // Personalize for each user
        updatedRoom.users.forEach(roomUser => {
          const isDrawer = updatedRoom.users[updatedRoom.currentDrawerIndex].id === roomUser.id ||
            updatedRoom.users[updatedRoom.currentDrawerIndex].socketId === roomUser.id;

          // Create a custom room data object for each user
          const userRoomData = { ...updatedRoom };

          // For non-drawers, mask the word
          if (!isDrawer) {
            userRoomData.maskedWord = createMaskedWord(updatedRoom.randomWord);
            userRoomData.randomWord = null;
          }

          // Send the personalized room data to this specific user
          io.to(roomUser.socketId || roomUser.id).emit("roomDataUpdated", gameCode, userRoomData);
        });

        if (room.correctGuessers.length === room.users.length - 1) {
          const intervalId = intervals[gameCode];
          if (intervalId) {
            roomService.handleTurnEnd(io, gameCode, () => {
              clearInterval(intervalId); // Clear the interval for this room
              delete intervals[gameCode]; // Remove the interval from the store
            });
          }
        }
      } else {
        // Regular message (not a correct guess)
        // Store the original message
        const updatedRoom = roomService.sendChatMessage(
          gameCode,
          user,
          message
        );

        // Emit the chat message
        io.to(gameCode).emit("receive-chat", {
          msg: message,
          player: user,
          rightGuess: false,
          players: room.users,
          timestamp: new Date(),
        });

        // Update room data with the message in chat history
        // Personalize for each user
        updatedRoom.users.forEach(roomUser => {
          const isDrawer = updatedRoom.users[updatedRoom.currentDrawerIndex].id === roomUser.id ||
            updatedRoom.users[updatedRoom.currentDrawerIndex].socketId === roomUser.id;

          // Create a custom room data object for each user
          const userRoomData = { ...updatedRoom };

          // For non-drawers, mask the word
          if (!isDrawer) {
            userRoomData.maskedWord = createMaskedWord(updatedRoom.randomWord);
            userRoomData.randomWord = null;
          }

          // Send the personalized room data to this specific user
          io.to(roomUser.socketId || roomUser.id).emit("roomDataUpdated", gameCode, userRoomData);
        });
      }
    });
  });
};