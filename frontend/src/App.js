import React, { useState, useEffect } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { io } from "socket.io-client";
import CreateGame from "./pages/CreateGame";
import JoinGame from "./pages/JoinGame";
import Game from "./pages/Game";
import Lobby from "./pages/Lobby";

function App() {
  const [appState, setAppState] = useState({
    userName: "",
    code: null,
    isValid: false,
    socket: null,
    joined: false,
    roomData: null,
  });

  useEffect(() => {
    // for local testing use "http://localhost:3001"
    // for testing on render use "https://projects-03-trenchcoat.onrender.com"
    const newSocket = io(process.env.REACT_APP_BACKEND_URL);

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

  React.useEffect(() => {
    if (!appState.socket) return;

    appState.socket.on("roomDataUpdated", (roomCode, roomData) => {
      console.log("Room data updated:", roomCode, roomData);
      setAppState((prevData) => ({
        ...prevData,
        roomData,
      }));
    });

    return () => {
      if (appState.socket && appState?.roomData?.code) {
        // Leave the room when the component unmounts
        appState?.socket?.emit("leaveRoom", {
          inputCode: appState?.roomData?.code,
        });
      }
    };
  }, [appState.socket, appState.roomData?.code]);

  return (
    <div className="App">
      <header
        className="App-header"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <Link
          onClick={() => {
            setAppState((prevData) => ({
              ...prevData,
              roomData: null,
            }));
          }}
          to={"/"}
        >
          <h1
            style={{
              marginTop: "2rem",
              fontFamily: "cursive",
              fontSize: "3rem",
              color: "#61dafb",
              textShadow: "2px 2px #000",
            }}
          >
            Skreeble.io
          </h1>
        </Link>
      </header>
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <CreateGame appState={appState} setAppState={setAppState} />
            }
          />
          <Route
            path="/join"
            element={<JoinGame appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/join/:roomCode"
            element={<JoinGame appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/game/:roomCode"
            element={<Game appState={appState} setAppState={setAppState} />}
          />
          <Route
            path="/lobby/:roomCode"
            element={<Lobby appState={appState} setAppState={setAppState} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
