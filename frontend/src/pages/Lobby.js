import React from "react";
import { useNavigate, useParams } from "react-router-dom";
const Lobby = ({ appState, setAppState }) => {
  const navigate = useNavigate();
  const { userName, socket, roomData } = appState;
  const { roomCode } = useParams();

  // Check if the user is the host of the room
  const userIsHost =
    roomData && socket ? roomData?.host.id === socket?.id : false;

  // Function to handle the start game button click
  const handleStartGame = () => {
    if (socket && roomData) {
      console.log("Starting game with room data:", roomData);
      socket.emit("updateRoomData", roomCode, {
        ...roomData,
        gameStarted: true,
      });
    }
  };

  React.useEffect(() => {
    // Redirect to the game page if the game has started
    if (roomData?.gameStarted) {
      navigate(`/game/${roomCode}`);
    }

    // Redirect to the join page if the room data is not available
    if (!roomData) {
      navigate(`/join/${roomCode}`);
    }
  }, [roomData, navigate, roomCode]);

  // Function to handle the leave game button click
  const handleLeaveGame = () => {
    if (socket) {
      appState.socket.emit("leaveRoom", { inputCode: roomCode });
    }
  };

  return (
    <div>
      <h1>Lobby</h1>
      <ul>
        {appState?.roomData?.users.map((user) => (
          <li key={user.id}>{user.userName}</li>
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
        }}
        onClick={handleLeaveGame}
      >
        Leave Game
      </button>

      {userIsHost && (
        <button
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "12px",
            padding: "15px 32px",
            fontSize: "1.5rem",
          }}
          onClick={handleStartGame}
        >
          Start Game
        </button>
      )}
    </div>
  );
};

export default Lobby;
