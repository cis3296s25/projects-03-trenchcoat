# Trench Coat

A simple multiplayer game application that uses Socket.IO for real-time communication between players.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Project Structure

- `backend/` - Node.js server using Express and Socket.IO
- `frontend/` - React application for the client interface

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/cis3296s25/projects-03-trenchcoat.git
   cd projects-03-trenchcoat
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd frontend
   npm install
   ```

## Running the Application

You need to run both the backend and frontend servers:

1. Start the backend server:
   ```
   cd backend
   npm start
   ```
   This will start your Socket.IO server on port 3001 and generate a game code/lobby.

2. In a separate terminal, start the React frontend:
   ```
   cd frontend
   npm start
   ```
   This will start the React development server on port 3000.

3. Open your browser and navigate to `http://localhost:3000`
4. To test the program with multiple players simply open more tabs and using the same URL `http://localhost:3000`

## How to Play

1. The server generates a unique game code when a player clicks `Create Game`
2. Players enter this code to join the game
3. After joining, players can see all other connected users in the lobby
4. The game is ready to play when all players have joined
5. Clicking `Start Game` will bring everyone in the lobby to a new page that has a drawing canvas and a chat
6. Players use the chat to guess what the drawing is
7. On a correct guess, the game ends

## Dependencies

Backend:
- Express
- Socket.IO
- HTTP

Frontend:
- React
- Socket.IO-client
