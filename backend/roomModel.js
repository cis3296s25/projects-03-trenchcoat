const randomWords = require("word-pictionary-list");

function createRoom(roomCode, hostUser) {
    return {
        code: roomCode,
        host: hostUser,
        users: [hostUser],
        randomWord: randomWords(1)[0],
        chatHistory: [],
        gameStarted: false,
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

module.exports = {
    createRoom,
    addChatMessage,
};