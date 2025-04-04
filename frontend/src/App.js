import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom'; // Remove BrowserRouter
import JoinGame from './JoinGame';
import GamePage from './GamePage';
import { io } from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // for local testing use "http://localhost:3001"
    // for testing on render use "https://projects-03-trenchcoat.onrender.com"
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>My Game</h1>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<JoinGame socket={socket} />} />
          <Route path="/game" element={<GamePage socket={socket} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;