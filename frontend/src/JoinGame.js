import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function JoinGame(props) {
  const { appState, setAppState } = props;
  const { userName, code, isValid, socket, userList, joined } = appState;
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    // Listen for verification results
    socket.on("verificationResult", (result) => {
      setAppState((prevData) => ({
        ...prevData,
        joined: result,
        isValid: result,
      }));
    });

    socket.on("userList", (users) => {
      setAppState((prevData) => ({
        ...prevData,
        userList: users,
      }));
    });

    socket.on("gameStarted", () => {
      console.log("Game started! Navigating all users...");
      navigate("/game");
    });

    return () => {
      socket.off("verificationResult");
      socket.off("userList");
      socket.off("gameStarted");
    };
  }, [socket, navigate, setAppState]);

  // Function to verify the code
  const verifyGameCode = () => {
    if (socket) {
      socket.emit("verifyGameCode", code, userName);
    }
  };

  const handleStartGame = () => {
    if (socket) {
      socket.emit("startGame");
    }
  };

  return (
    <div>
      {!joined ? (
        <div>
          <h1>Join Game</h1>
          <input
            type="text"
            value={userName}
            onChange={(e) =>
              setAppState({ ...appState, userName: e.target.value })
            }
            placeholder="Enter your username"
          />
          <input
            type="text"
            value={code}
            onChange={(e) => setAppState({ ...appState, code: e.target.value })}
            placeholder="Enter game code"
          />
          <button onClick={verifyGameCode}>Join Game</button>
          {isValid === false && <p>Invalid code, please try again.</p>}
        </div>
      ) : (
        <div>
          <h1>Lobby</h1>
          <h2>Current Users:</h2>
          <ul>
            {userList.map((user) => (
              <li key={user.id}>
                {user.username} {user.id === socket.id ? "(You)" : ""}
              </li>
            ))}
          </ul>
          <button onClick={handleStartGame}>Start Game</button>
        </div>
      )}
    </div>
  );
}

export default JoinGame;
