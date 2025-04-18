import React, { useEffect, useState } from "react";

const styles = {
  container: {
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "1rem",
    backgroundColor: "#f9f9f9",
    width: "20%",
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    overflowY: "scroll",
  },
  textarea: {
    position: "absolute",
    bottom: 20,
    left: 10,
    right: 10,
    height: "100px",
  },
};

export default function ChatBox(props) {
  const { appState } = props;
  const { socket, userName } = appState || {};

  const [localChats, setLocalChats] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.on("receive-chat", ({ msg, player, rightGuess }) => {
        const sender = player?.userName || player?.name || "System";
        const message = rightGuess ? `${sender} guessed the word!` : msg;
        
        setLocalChats(prev => [...prev, { 
          sender, 
          message, 
          rightGuess 
        }]);
      });

      return () => {
        socket.off("receive-chat");
      };
    }
  }, [socket]);

  function onChatboxChange(e) {
    const message = e.target.value;
    if (message.includes("\n")) {
      e.target.value = "";
      if (socket) {
        socket.emit("chatMessageSend", {
          message: message.replace("\n", ""),
          gameCode: appState?.roomData?.code,
          userName,
        });
      }
    }
  }

  const allChats = [
    ...(appState?.roomData?.chatHistory || []).map(chat => ({
      sender: chat.user.userName,
      message: chat.message,
      rightGuess: chat.message.includes(" guessed the word!")
    })),
    ...localChats
  ];

  return (
    <div style={styles.container} id="chatContainer">
      {allChats.map((chat, index) => (
        <div 
          key={`chat-${index}`}
          style={chat.rightGuess ? { color: 'green', fontWeight: 'bold' } : {}}
        >
          <strong>{chat.sender}</strong>: {chat.message}
        </div>
      ))}
      <textarea onChange={onChatboxChange} style={styles.textarea}></textarea>
    </div>
  );
}
