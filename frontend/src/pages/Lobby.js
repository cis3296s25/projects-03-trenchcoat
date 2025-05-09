import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChatBox from "../components/ChatBox";

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
      socket?.emit("updateRoomData", roomCode, {
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
      navigate(`/`);
    }
  }, [roomData, navigate, roomCode]);

  useEffect(() => {
    const handleKick = () => {
      navigate("/");
      window.location.reload();
    };
    socket?.on("youWereKicked", handleKick);
    return () => {
      socket?.off("youWereKicked", handleKick);
    };
  }, [navigate, socket]);

  // Function to handle the leave game button click
  const handleLeaveGame = () => {
    if (socket) {
      appState?.socket?.emit("leaveRoom", { inputCode: roomCode });
      setAppState((prev) => ({ ...prev, roomData: null }));
      navigate("/");
    }
  };

  const handleKickPlayer = async (user) => {
    if (window.confirm(`Kick ${user.userName}?`)) {
      console.log("Attempting to kick", user);
      socket?.emit(
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
    <div style={{ paddingRight: "320px" }}>
      {" "}
      {/* Add padding to make room for chat */}
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
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
          {roomData?.users
            ?.sort((a, b) => {
              return a?.score < b?.score ? 1 : -1;
            })
            .map((user, index) => (
              <li key={index}>
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
                <span>
                  {`${user.userName}${user.score ? ` - ${user.score}` : ""}`}
                </span>
              </li>
            ))}
        </ul>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
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
      </div>
      <ChatBox appState={appState} setAppState={setAppState} />
    </div>
  );
};

export default Lobby;
