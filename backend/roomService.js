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
  if (!room) return null;

  // Calculate scores earned this turn
  const turnScores = room.users.map(user => ({
    userName: user.userName,
    pointsGained: user.pointsGainedThisTurn || 0,
  }));
  // Sort descending here
  turnScores.sort((a, b) => b.pointsGained - a.pointsGained);

  io.to(roomCode).emit("showLeaderboard", {
    scores: turnScores,
    correctWord: room.randomWord,
  });

  // Delay the rest of the logic by 3 seconds
  setTimeout(() => {
    // Reset pointsGainedThisTurn for next round
    room.users.forEach(user => user.pointsGainedThisTurn = 0);

    io.to(roomCode).emit("clearCanvas");
    room.strokes = [];

    const isLastRound = room.round === room.maxRounds;
    const currentDrawerIsLast = room.currentDrawerIndex === room.users.length - 1;

    if (isLastRound && currentDrawerIsLast) {
      room.gameStarted = false;
      room.round = 1;
      room.timeLeft = room.maxTime;
      room.currentDrawerIndex = 0;
      clearInterval();
      return io.to(roomCode).emit("roomDataUpdated", roomCode, room);
    }

    if (currentDrawerIsLast) {
      room.currentDrawerIndex = 0;
      room.round += 1;
    } else {
      room.currentDrawerIndex += 1;
    }

    room.timeLeft = room.maxTime;
    room.randomWord = randomWords(1)[0];
    rooms[roomCode].correctGuessers = [];

    // Personalized room data sending (existing logic)
    room.users.forEach(user => {
      const isDrawer = room.users[room.currentDrawerIndex].id === user.id ||
        room.users[room.currentDrawerIndex].socketId === user.id;
      const userRoomData = { ...room };
      //Mask the word for guessers
      if (!isDrawer) {
        userRoomData.maskedWord = createMaskedWord(room.randomWord);
        userRoomData.randomWord = null;
      }
      // Send the updated room data to the user
      io.to(user.socketId || user.id).emit("roomDataUpdated", roomCode, userRoomData);
    });
  }, 3000);
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