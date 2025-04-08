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
   node index.js
   ```
   This will start your Socket.IO server on port 3001 and generate a game code/lobby.
2. Open your browser and navigate to `http://localhost:3001`

3. In a separate terminal, start the React frontend:
   ```
   cd frontend
   npm start
   ```
   This will start the React development server on port 3000.

4. Open your browser and navigate to `http://localhost:3000`

## How to Play

1. The server generates a unique game code when it starts
2. Players enter this code to join the game
3. After joining, players can see all other connected users in the lobby from the host page
4. The game is ready to play when all players have joined

## Dependencies

Backend:
- Express
- Socket.IO
- HTTP

Frontend:
- React
- Socket.IO-client
