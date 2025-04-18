const randomWords = require("word-pictionary-list");

// time in seconds
const maxTime = 60;

function createRoom(roomCode, hostUser) {
  return {
    code: roomCode,
    host: hostUser,
    users: [hostUser],
    randomWord: randomWords(1)[0],

    // Chat history
    chatHistory: [],

    // Game state
    gameStarted: false,

    // Current round
    round: 1,

    // Total rounds
    maxRounds: 3,

    // Time per turn (in seconds)
    maxTime: maxTime,
    timeLeft: maxTime,

    // Index of the current user drawing
    currentDrawerIndex: 0,
      
    // Used for showing player who joined lated the canvas
    strokes: []
  };
}

function addChatMessage(room, user, message) {
  room.chatHistory.push({
    user,
    message,
    timestamp: new Date(),
  });
  return room;
}

function clearChatHistory(room) {
    room.chatHistory = [];
    return room;
}

module.exports = {
    createRoom,
    addChatMessage,
    clearChatHistory
};