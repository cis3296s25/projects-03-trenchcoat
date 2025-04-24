import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DrawingCanvas from "../components/DrawingCanvas";
import ChatBox from "../components/ChatBox";

const formatWordDisplay = (word, isDrawer) => {
  if (!word) return { display: '', count: 0 };
  
  return {
    display: isDrawer ? 
      word : 
      word.split('').map(char => char === ' ' ? '  ' : '_').join(''),
    count: word.replace(/\s/g, '').length
  };
};

function Game({ appState, setAppState }) {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const audioRef = React.useRef(null);
  const [displayWord, setDisplayWord] = useState('');

  const handleGoBack = () => {
    if (appState.socket && appState?.roomData?.code) {
      appState.socket.emit("leaveRoom", { inputCode: appState.roomData.code });
      setAppState((prev) => ({ ...prev, roomData: null }));
      navigate(`/`);
    }
  };

  React.useEffect(() => {
    if (!appState?.roomData) {
      navigate(`/join/${roomCode}`);
    } else if (appState?.roomData && appState.roomData.gameStarted === false) {
      navigate(`/lobby/${roomCode}`);
    }
  }, [appState, navigate, roomCode]);

  const { socket } = appState;
  const currentDrawer =
    appState?.roomData?.users[appState?.roomData?.currentDrawerIndex]?.userName;

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.05;
    }
  }, [audioRef]);

  const isCurrentUserDrawer = useMemo(() => {
    if (!appState?.roomData?.gameStarted || !socket) return false;
    const currentDrawer = appState.roomData.users[appState.roomData.currentDrawerIndex];
    return currentDrawer?.socketId === socket.id || currentDrawer?.id === socket.id;
  }, [appState.roomData, socket]);

  useEffect(() => {
    const formatted = formatWordDisplay(appState?.roomData?.randomWord, isCurrentUserDrawer);
    setDisplayWord(formatted.display);
  }, [appState?.roomData?.randomWord, isCurrentUserDrawer]);

  return (
    <div style={{ paddingRight: "320px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {socket ? (
          <DrawingCanvas appState={appState} setAppState={setAppState} />
        ) : (
          <p>Connecting to server...</p>
        )}
        <div style={{ 
          margin: "20px 0",
          padding: "15px",
          textAlign: "center"
        }}>
          <h1 style={{
            fontFamily: "monospace",
            fontSize: "2.5rem",
            letterSpacing: "8px",
            margin: "0 0 5px 0",
            color: "#3498db"
          }}>
            {displayWord}
          </h1>
          {!isCurrentUserDrawer && (
            <p style={{ 
              fontSize: "1rem",
              color: "#7f8c8d",
              margin: 0
            }}>
              {appState?.roomData?.randomWord?.replace(/\s/g, '').length || 0} letters
            </p>
          )}
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "1rem 0",
        }}>
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
      <audio ref={audioRef} autoPlay loop>
        <source src="/bg-music.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
}

export default Game;