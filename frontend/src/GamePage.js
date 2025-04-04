import React from 'react';
import { useNavigate } from 'react-router-dom';

function GamePage() {
  const navigate = useNavigate();
  const handleGoBack = () => {
    navigate('/');
  };
  return (
    <div>
      <h1>Game Page</h1>
      <p>This will be the drawing place for now</p>
      <button onClick={handleGoBack}>Go Back</button>
    </div>
  );
}

export default GamePage;