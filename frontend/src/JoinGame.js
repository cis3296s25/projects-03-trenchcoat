import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatBox from './components/ChatBox';

function JoinGame({ socket }) {
  const [code, setCode] = useState('');
  const [username, setUsername] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [userList, setUserList] = useState([]);
  const [joined, setJoined] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    // Listen for verification results
    socket.on('verificationResult', (result) => {
      setIsValid(result);
      if (result) {
        setJoined(true);
      }
    });

    socket.on('userList', (users) => {
      setUserList(users);
    });

    socket.on('gameStarted', () => {
      console.log("Game started! Navigating all users...");
      navigate('/game');
    });

    return () => {
      socket.off('verificationResult');
      socket.off('userList');
      socket.off('gameStarted');
    };
  }, [socket, navigate]);

  // Function to verify the code
  const verifyGameCode = () => {
    if (socket) {
      socket.emit('verifyGameCode', code, username);
    }
  };

  const handleStartGame = () => {
    if (socket) {
      socket.emit('startGame');
    }
  };

  return (
    <div>
      {!joined ? (
        <div>
          <h1>Join Game</h1>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
          />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
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
            {userList.map(user => (
              <li key={user.id}>
                {user.username} {user.id === socket.id ? "(You)" : ""}
              </li>
            ))}
          </ul>
          <button onClick={handleStartGame}>Start Game</button>
          <ChatBox
            userName={username}
            code={code}
            isValid={isValid}
            socket={socket}
          />
        </div>
      )}
    </div>
  );
}

export default JoinGame;