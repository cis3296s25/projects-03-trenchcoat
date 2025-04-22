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
      navigate(`/`);
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
    <div style={{ paddingRight: "320px" }}> {/* Add padding to make room for chat */}
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
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
        <div style={{ display: "flex", justifyContent: "space-between", margin: "1rem 0" }}>
          <p>Time: {appState?.roomData?.timeLeft || 0}</p>
          <p>Round {appState?.roomData?.round || 1} of 3</p>
          <p>Currently Drawing: {currentDrawer}</p>
        </div>
        <h2>Scoreboard</h2>
        <ul>
          {appState?.roomData?.users.map((user, index) => (
            <li key={index}>
              {user.userName}: {user.score || 0} pts
            </li>
          ))}
        </ul>

        <button
          style={{
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "15px 32px",
            fontSize: "1.5rem",
            marginTop: "1rem",
          }}
          onClick={handleGoBack}
        >
          Leave Game
        </button>
      </div>
      <ChatBox appState={appState} setAppState={setAppState} />
    </div>
  );
}

export default Game;