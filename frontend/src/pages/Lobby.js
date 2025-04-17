import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatBox from "../components/ChatBox";
// import Kicking from "../components/Kicking";

const Lobby = ({ appState, setAppState }) => {
  const navigate = useNavigate();
  const { socket, roomData } = appState;
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
        round: 1,
        timeLeft: roomData.maxTime,
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

  useEffect(() => {
    const handleKick = () => {
      navigate("/");
      window.location.reload();
    };
    socket.on("youWereKicked", handleKick);
    return () => {
      socket.off("youWereKicked", handleKick);
    };
  }, [navigate, socket]);

  // Function to handle the leave game button click
  const handleLeaveGame = () => {
    if (socket) {
      appState.socket.emit("leaveRoom", { inputCode: roomCode });
    }
  };

  const handleKickPlayer = async (user) => {
    if (window.confirm(`Kick ${user.userName}?`)) {
      console.log("Attempting to kick", user);
      socket.emit(
        "kickPlayer",
        {
          roomCode,
          targetSocketId: user.socketId,
        },
        (response) => {
          if (response?.error) {
            alert(`Kick failed: ${response.error}`);
          }
        }
      );
    }
  };

  console.log(appState);

  const timeLeft = roomData?.timeLeft || roomData?.maxTime;
  const round = roomData?.round || 1;

  return (
    <div>
      <h1>Lobby</h1>
      <div
        style={{
          display: "flex",
          gap: "8px",
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginTop: "20px",
          marginBottom: "20px",
        }}
      >
        <p>Time: {timeLeft}</p>
        <p>Round {round} of 3</p>
      </div>
      <h2>Code {roomCode} </h2>
      <ul>
        {roomData?.users?.map((user) => (
          <li>
            {userIsHost && user.socketId !== roomData.host.id && (
              <button
                onClick={() => handleKickPlayer(user)}
                style={{
                  backgroundColor: "#D3D3D3",
                  marginRight: "8px",
                  color: "black",
                  border: "none",
                  borderRadius: "12px",
                  cursor: "pointer",
                }}
                title={`Kick ${user.userName}`}
              >
                kick
              </button>
            )}
            <span>{user.userName} </span>
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
      <ChatBox appState={appState} setAppState={setAppState} />
    </div>
  );
};

export default Lobby;
