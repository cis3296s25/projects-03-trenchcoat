//import React from 'react';
import React, { useEffect, useState } from 'react';
import JoinGame from './JoinGame';
import DrawingGame from './DrawingGame';

import { io } from 'socket.io-client';//Using to test DrawingCanvas
function App() {
  //Initialize socket in app.js to test drawing functionality
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);
  // end of addition
  // using socket in html to connect different tab's drawing
  return (
    <div className="App">
      <header className="App-header">
        <h1>My Game</h1>
      </header>
      <main>
      {socket && <DrawingGame socket={socket} />}
      </main>
    </div>
  );
}

export default App;