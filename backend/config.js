module.exports = {
    // CORS configuration for Socket.io
    cors: {
        origin: [
            "https://projects-03-trenchcoat.onrender.com",
            "http://localhost:3000",
        ],
        methods: ["GET", "POST"],
        credentials: true,
    }
};