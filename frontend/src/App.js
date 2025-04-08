import React, { useState, useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import JoinGame from "./JoinGame";
import GamePage from "./GamePage";
import { io } from "socket.io-client";

function App() {
  const [appState, setAppState] = useState({
    userName: "",
    code: null,
    isValid: false,
    socket: null,
    userList: [],
    joined: false,
  });

  useEffect(() => {
    // for local testing use "http://localhost:3001"
    // for testing on render use "https://projects-03-trenchcoat.onrender.com"
    const newSocket = io("http://localhost:3001");

    setAppState((prevData) => ({
      ...prevData,
      socket: newSocket,
    }));

    return () => {
      setAppState((prevData) => ({
        ...prevData,
        socket: null,
      }));
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
          <Route
            path="/"
            element={<JoinGame appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/game"
            element={<GamePage appState={appState} setAppState={setAppState} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
