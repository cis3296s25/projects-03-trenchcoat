import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import JoinGame from './JoinGame';
import GamePage from './GamePage';
import Lobby from './Lobby';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
        </header>
        <main>
          <Routes>
            <Route path="/" element={<JoinGame />} />
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/game" element={<GamePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;