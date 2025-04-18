const randomWords = require("word-pictionary-list");

function createRoom(roomCode, hostUser) {
    return {
        code: roomCode,
        host: hostUser,
        users: [hostUser],
        randomWord: randomWords(1)[0],
        chatHistory: [],
        gameStarted: false,
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