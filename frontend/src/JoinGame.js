import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function JoinGame() {
    const [code, setCode] = useState('');
    const [username, setUsername] = useState('');
    const [isValid, setIsValid] = useState(null);
    const [socket, setSocket] = useState(null);
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        
        // for local testing use "http://localhost:3001"
        // for testing on render use "https://projects-03-trenchcoat.onrender.com"
        const socket = io("https://projects-03-trenchcoat.onrender.com");
        setSocket(socket);

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

    return (
        <div>
            {!joined ? (
                <div>
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
                </div>
            )}
        </div>
    );
}

export default JoinGame;