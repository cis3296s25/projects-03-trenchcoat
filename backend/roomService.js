const { generateRandomCode } = require("./helpers");
const { createRoom, addChatMessage, clearChatHistory } = require("./roomModel");
const randomWords = require("word-pictionary-list");

const rooms = {};

// Helper function to create a masked word for guessers
const createMaskedWord = (word) => {
  if (!word) return '';
  return word.split('').map(char => char === ' ' ? ' ' : '_').join('');
};

function createGameRoom(userName, socketId) {
  const roomCode = generateRandomCode(5);

  const user = {
    id: socketId,
    userName,
  };

  rooms[roomCode] = createRoom(roomCode, user);
  // Correct guessers for round
  rooms[roomCode].correctGuessers = [];

  return {
    roomCode,
    roomData: rooms[roomCode],
  };
}

function getRoomByCode(roomCode) {
  return rooms[roomCode] || null;
}

function updateRoomData(roomCode, roomData) {
  if (!rooms[roomCode]) {
    return null;
  }

  rooms[roomCode] = roomData;
  return rooms[roomCode];
}

function addUserToRoom(roomCode, user) {
  if (!rooms[roomCode]) {
    return null;
  }

  user.socketId = user.id;

  rooms[roomCode].users.push(user);
  return rooms[roomCode];
}

function removeUserFromRoom(roomCode, userId) {
  if (!rooms[roomCode]) {
    return { success: false };
  }

  const room = rooms[roomCode];
  const user = room.users.find((u) => u.id === userId);

  if (!user) {
    return { success: false };
  }

  const isHost = user.id === room.host.id;

  room.users = room.users.filter((u) => u.id !== userId);

  addChatMessage(room, user, "left the game.");

  if (isHost) {
    delete rooms[roomCode];
    return { success: true, roomData: null, isHost: true };
  }

  return { success: true, roomData: room, isHost: false };
}

function sendChatMessage(roomCode, user, message) {
  const room = getRoomByCode(roomCode);

  console.log({ room }, "nexted room");

  if (!rooms[roomCode]) {
    return null;
  }

  const currentWord = room.randomWord?.toLowerCase();
  const enteredMessage = message.trim().toLowerCase();

  console.log(
    `Checking guess: "${enteredMessage}" against the word: "${currentWord}"`
  );
  const rightGuess = enteredMessage === currentWord;

  if (rightGuess) {
    return room;
  }

  return rooms[roomCode];
}

function handleTurnEnd(io, roomCode, clearInterval) {
  const room = rooms[roomCode];

  if (!room) {
    return null;
  }
  io.to(roomCode).emit("clearCanvas");
  room.strokes = [];

  const isLastRound = room.round === room.maxRounds;

  // Check if current drawer is last user in the list
  const currentDrawerIsLast = room.currentDrawerIndex === room.users.length - 1;

  if (isLastRound && currentDrawerIsLast) {
    // Game over, reset room data
    room.gameStarted = false;
    room.round = 1;
    room.timeLeft = room.maxTime;
    room.currentDrawerIndex = 0;

    console.log({ isLastRound, currentDrawerIsLast });

    clearInterval();

    // Send the same reset data to all users
    return io.to(roomCode).emit("roomDataUpdated", roomCode, room);
  }

  // If last user, reset to first user and increment round
  if (currentDrawerIsLast) {
    room.currentDrawerIndex = 0;
    room.round += 1;
  } else {
    // Move to next user
    room.currentDrawerIndex += 1;
  }

  room.timeLeft = room.maxTime;
  room.randomWord = randomWords(1)[0];

  setTimeout(() => {
    rooms[roomCode].correctGuessers = []; // Correct guessers reset for each new turn

    // Send personalized data to each user
    room.users.forEach(user => {
      const isDrawer = room.users[room.currentDrawerIndex].id === user.id ||
        room.users[room.currentDrawerIndex].socketId === user.id;

      // Create a custom room data object for each user
      const userRoomData = { ...room };

      // For non-drawers, mask the word
      if (!isDrawer) {
        userRoomData.maskedWord = createMaskedWord(room.randomWord);
        userRoomData.randomWord = null; // Don't send the actual word
      }

      // Send the personalized room data to this specific user
      io.to(user.socketId || user.id).emit("roomDataUpdated", roomCode, userRoomData);
    });
  }, 2000);

  // Initially send personalized data to each user
  room.users.forEach(user => {
    const isDrawer = room.users[room.currentDrawerIndex].id === user.id ||
      room.users[room.currentDrawerIndex].socketId === user.id;

    // Create a custom room data object for each user
    const userRoomData = { ...room };

    // For non-drawers, mask the word
    if (!isDrawer) {
      userRoomData.maskedWord = createMaskedWord(room.randomWord);
      userRoomData.randomWord = null; // Don't send the actual word
    }

    // Send the personalized room data to this specific user
    io.to(user.socketId || user.id).emit("roomDataUpdated", roomCode, userRoomData);
  });
}

function clearRoomChat(roomCode) {
  if (!rooms[roomCode]) {
    return null;
  }

  clearChatHistory(rooms[roomCode]);
  return rooms[roomCode];
}

module.exports = {
  createGameRoom,
  getRoomByCode,
  updateRoomData,
  addUserToRoom,
  removeUserFromRoom,
  sendChatMessage,
  clearRoomChat,
  handleTurnEnd,
  createMaskedWord,
};