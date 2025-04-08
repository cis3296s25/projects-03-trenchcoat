import React from "react";
import { useNavigate } from "react-router-dom";
import DrawingCanvas from "./DrawingCanvas";
import ChatBox from "./components/ChatBox";

function GamePage({ appState, setAppState }) {
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate("/");
  };

  const { userName, code, isValid, userList, socket } = appState;

  return (
    <div>
      <h1>Game Page</h1>
      {socket ? (
        <DrawingCanvas socket={socket} />
      ) : (
        <p>Connecting to server...</p>
      )}
      <button onClick={handleGoBack}>Back to Lobby</button>

      <ChatBox appState={appState} setAppState={setAppState} />
    </div>
  );
}

export default GamePage;
