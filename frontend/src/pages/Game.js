import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import DrawingCanvas from "../components/DrawingCanvas";
import ChatBox from "../components/ChatBox";

function Game({ appState, setAppState }) {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const handleGoBack = () => {
    if (appState.socket && appState?.roomData?.code) {
      appState.socket.emit("leaveRoom", { inputCode: appState.roomData.code });
      setAppState((prev) => ({ ...prev, roomData: null }));
      navigate(`/join/${roomCode}`);
    }
  };

  React.useEffect(() => {
    console.log(appState);
    if (!appState?.roomData) {
      navigate(`/join/${roomCode}`);
    } else if (appState?.roomData && appState.roomData.gameStarted === false) {
      navigate(`/lobby/${roomCode}`);
    }
  }, [appState, navigate, roomCode]);

  const { socket } = appState;

  const currentDrawer =
    appState?.roomData?.users[appState?.roomData?.currentDrawerIndex]?.userName;

  return (
    <div>
      {socket ? (
        <DrawingCanvas appState={appState} setAppState={setAppState} />
      ) : (
        <p>Connecting to server...</p>
      )}
      <h1
        style={{
          marginTop: "2rem",
          fontFamily: "cursive",
          fontSize: "3rem",
          color: "#61dafb",
          textShadow: "2px 2px #000",
          textAlign: "center",
        }}
      >
        Random Word: {appState?.roomData?.randomWord}
      </h1>
      <p>Time: {appState?.roomData?.timeLeft || 0}</p>
      <p>Round {appState?.roomData?.round || 1} of 3</p>
      <p>Currently Drawing: {currentDrawer}</p>
      <button
        style={{
          backgroundColor: "#f44336",
          color: "white",
          border: "none",
          borderRadius: "12px",
          padding: "15px 32px",
          fontSize: "1.5rem",
        }}
        onClick={handleGoBack}
      >
        Leave Game
      </button>

      <ChatBox appState={appState} setAppState={setAppState} />
    </div>
  );
}

export default Game;
