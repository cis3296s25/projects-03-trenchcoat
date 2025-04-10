const roomService = require("./roomService");

module.exports = function (io) {
    io.on("connection", (socket) => {
        console.log("User connected with socket ID:", socket.id);

        // Handle room creation
        socket.on("createRoom", (data) => {
            console.log("Creating game with data:", data);
            const { userName } = data;

            const { roomCode, roomData } = roomService.createGameRoom(userName, socket.id);

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

            const updatedRoom = roomService.updateRoomData(roomCode, roomData);
            io.to(roomCode).emit("roomDataUpdated", roomCode, updatedRoom);
        });

        // Handle joining a room
        socket.on("joinRoom", ({ inputCode, userName }) => {
            console.log("Joining room:", inputCode, userName);

            const room = roomService.getRoomByCode(inputCode);
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

            const updatedRoom = roomService.sendChatMessage(gameCode, user, message);
            io.to(gameCode).emit("roomDataUpdated", gameCode, updatedRoom);

            console.log("Chat message sent:", message, gameCode, userName);
        });
    });
};