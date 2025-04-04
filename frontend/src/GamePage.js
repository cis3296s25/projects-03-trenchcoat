import React from 'react';
import { useNavigate } from 'react-router-dom';
import DrawingCanvas from './DrawingCanvas';

function GamePage({ socket }) {
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate('/');
  };

  return (
    <div>
      <h1>Game Page</h1>
      {socket ? (
        <DrawingCanvas socket={socket} />
      ) : (
        <p>Connecting to server...</p>
      )}
      <button onClick={handleGoBack}>Back to Lobby</button>
    </div>
  );
}

export default GamePage;