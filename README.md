# Skreeble.io

A real-time multiplayer drawing and guessing game inspired by Pictionary, built with React, Node.js, Express, and Socket.IO.

## 🎮 Game Overview

Skreeble.io is a fun multiplayer game where players take turns drawing a given word while others attempt to guess it:

- **Create or join a game room** with a unique code
- **Take turns drawing** a randomly selected word
- **Guess what others are drawing** by typing in the chat
- **Earn points** for correct guesses and successful drawings
- **Compete through multiple rounds** to see who can score the highest

## 🎬 Video Demo

[![Demo](https://img.youtube.com/vi/wZdJ_tbi1Rc/0.jpg)](https://www.youtube.com/watch?v=wZdJ_tbi1Rc)

## ✨ Features

- **Real-time multiplayer** gameplay using Socket.IO
- **Drawing canvas** with customizable brush sizes and colors
- **Chat system** with correct guess detection
- **Room-based gameplay** with unique join codes
- **Host controls** including the ability to kick players
- **Point system** rewarding both drawers and guessers
- **Round-based gameplay** with leaderboards
- **Responsive design** for various screen sizes

## 🛠️ Tech Stack

### Frontend
- **React** for the UI components
- **React Router** for navigation
- **Socket.IO Client** for real-time communication
- **CSS** for styling
- **HTML5 Canvas** for the drawing functionality

### Backend
- **Node.js** runtime environment
- **Express** web framework
- **Socket.IO** for WebSocket connections
- **word-pictionary-list** for random word generation

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/projects-03-trenchcoat.git
   cd projects-03-trenchcoat
   ```

2. Install the dependencies for both frontend and backend:
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the frontend directory:
     ```
     REACT_APP_BACKEND_URL=http://localhost:3001
     ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. In a separate terminal, start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## 🎮 How to Play

1. **Create a game**: Enter your username and click "Create Game" to generate a new room
2. **Invite friends**: Share the room code with friends so they can join
3. **Start the game**: The host can click "Start Game" when everyone is ready
4. **Draw and guess**: Take turns drawing the given word and guessing what others are drawing
5. **Score points**: Earn points for correct guesses and when others guess your drawings
6. **Win the game**: The player with the most points after all rounds wins!

## 📝 Game Rules

- Each round, one player is selected to draw
- The drawer is given a random word to illustrate
- Other players try to guess the word by typing in the chat
- Points are awarded based on how quickly players guess correctly
- The drawer earns points when others guess correctly
- After a set time or when all players have guessed, the turn ends
- The game continues for a set number of rounds

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Socket.IO](https://socket.io/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [word-pictionary-list](https://www.npmjs.com/package/word-pictionary-list)
