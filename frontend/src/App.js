import React from 'react';
import { Route, Routes } from 'react-router-dom';
import JoinGame from './JoinGame';
import GamePage from './GamePage';

function App() {
  return (
    <div className="App">
      <header className="App-header">
      </header>
      <main>
        <Routes>
          <Route path="/" element={<JoinGame />} />
          <Route path="/game" element={<GamePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;