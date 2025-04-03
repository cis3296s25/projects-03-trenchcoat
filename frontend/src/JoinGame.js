import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

function JoinGame() {
    const [code, setCode] = useState('');
    const [username, setUsername] = useState('');
    const [isValid, setIsValid] = useState(null);
    const [socket, setSocket] = useState(null);
    const [userList, setUserList] = useState([]);
    const [joined, setJoined] = useState(false);
    const navigate = useNavigate();
    const handleGoBack = () => {
        navigate(-1);
    };
    useEffect(() => {
        
        // for local testing use "http://localhost:3001"
        // for testing on render use "https://projects-03-trenchcoat.onrender.com"
        const socket = io("http://localhost:3001");
        setSocket(socket);

        socket.on('gameStarted', () => {
            console.log("Game started! Navigating all users...");
            navigate('/game');
        });

        // Clean up on unmount
        return () => {
            socket.disconnect();
        };
    }, []);

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

        return () => {
            socket.off('verificationResult');
            socket.off('userList');
        };
    }, [socket]);

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

    useEffect(() => {
        if (!socket) return;
        socket.on('gameStarted', () => {
            console.log("Game started!");
            navigate('/game');
        });
    
        return () => {
            socket.off('gameStarted');
        };
    }, [socket]);

    return (
        <div>
            {!joined ? (
                <div>
                    <h1>My Game</h1>
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
                    <h1>connected!</h1>
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
                </div>
            )}
        </div>
    );
}

export default JoinGame;