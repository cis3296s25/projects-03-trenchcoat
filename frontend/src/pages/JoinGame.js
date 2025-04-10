import React from "react";
import { useNavigate, useParams } from "react-router-dom";
const JoinGame = (props) => {
  const { appState, setAppState } = props;
  const { userName, code, isValid, socket, userList, joined } = appState;

  const navigate = useNavigate();
  const { roomCode } = useParams();
  const [inputCode, setInputCode] = React.useState(roomCode);

  React.useEffect(() => {
    if (appState?.roomData?.code) {
      navigate(`/lobby/${appState.roomData.code}`);
    }
  }, [appState.roomData?.code, navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <input
          style={{
            width: "300px",
            height: "80px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "20px",
            fontSize: "1.5rem",
            textAlign: "center",
          }}
          type="text"
          value={userName}
          onChange={(e) =>
            setAppState((prevData) => ({
              ...prevData,
              userName: e.target.value,
            }))
          }
          placeholder="Enter your username"
        />
        <input
          style={{
            width: "300px",
            height: "80px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "20px",
            fontSize: "1.5rem",
            textAlign: "center",
          }}
          type="text"
          disabled={roomCode}
          value={inputCode}
          onChange={(e) => setInputCode(e.target.value)}
          placeholder="Room Code"
        />
        <button
          style={{
            width: "300px",
            height: "80px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            padding: "10px",
            backgroundColor: "#61dafb",
            cursor: "pointer",
            color: "#000",
            fontWeight: "bold",
            fontSize: "1.5rem",
          }}
          onClick={() => {
            if (socket) {
              socket.emit("joinRoom", {
                userName,
                inputCode,
              });
            }
          }}
        >
          Join Game
        </button>
      </div>
    </div>
  );
};

export default JoinGame;
