const { generateRandomCode } = require("./helpers");
const { createRoom, addChatMessage } = require("./roomModel");

const rooms = {};

function createGameRoom(userName, socketId) {
    const roomCode = generateRandomCode(5);

    const user = {
        id: socketId,
        userName,
    };

    rooms[roomCode] = createRoom(roomCode, user);

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
    const user = room.users.find(u => u.id === userId);

    if (!user) {
        return { success: false };
    }

    const isHost = user.id === room.host.id;

    // Remove user from room
    room.users = room.users.filter(u => u.id !== userId);

    // Add leave message
    addChatMessage(room, user, "left the game.");

    // If host left, mark room for deletion
    if (isHost) {
        delete rooms[roomCode];
        return { success: true, roomData: null, isHost: true };
    }

    return { success: true, roomData: room, isHost: false };
}

function sendChatMessage(roomCode, user, message) {
    if (!rooms[roomCode]) {
        return null;
    }

    addChatMessage(rooms[roomCode], user, message);
    return rooms[roomCode];
}

module.exports = {
    createGameRoom,
    getRoomByCode,
    updateRoomData,
    addUserToRoom,
    removeUserFromRoom,
    sendChatMessage,
};