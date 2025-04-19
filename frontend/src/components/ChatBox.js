import React, { useRef, useEffect, useState } from "react";

const ChatBox = (props) => {
  const { appState, setAppState } = props;
  const { socket, userName } = appState;
  const messagesEndRef = useRef(null);
  const [localChats, setLocalChats] = useState([]);

  // Add this style for the chat messages container
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
      display: "flex",
      flexDirection: "column"
    },
    messagesContainer: {
      overflowY: "auto",
      flexGrow: 1,
      marginBottom: "110px", // Space for the textarea
      display: "flex",
      flexDirection: "column"
    },
    textarea: {
      position: "absolute",
      bottom: 20,
      left: 10,
      right: 10,
      height: "100px",
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [appState?.roomData?.chatHistory, localChats]);

  // Check for correct guesses
  React.useEffect(() => {
    if (appState?.roomData?.randomWord && appState?.roomData?.chatHistory) {
      const chatHistory = appState.roomData.chatHistory;
      if (chatHistory.length > 0) {
        const correctGuess = chatHistory[chatHistory.length - 1]
          ?.message.toLowerCase()
          .includes(appState.roomData.randomWord.toLowerCase());
        if (correctGuess) {
          alert("Correct guess!");
        }
      }
    }
  }, [appState.roomData?.randomWord, appState.roomData?.chatHistory]);

  // Listen for new chat messages
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
      const trimmedMessage = message.replace("\n", "").trim();

      if (trimmedMessage.length > 0) {
        e.target.value = ""; // Clear the textarea after sending

        if (socket) {
          console.log("sending...");
          socket.emit("chatMessageSend", {
            message: trimmedMessage,
            gameCode: appState?.roomData?.code,
            userName,
          });
        }
      } else {
        e.target.value = "";
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
    <div style={styles.container}>
      <div style={styles.messagesContainer}>
        {allChats.map((chat, index) => (
          <div 
            key={`chat-${index}`}
            style={chat.rightGuess ? { color: 'green', fontWeight: 'bold' } : {}}
          >
            <strong>{chat.sender}</strong>: {chat.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <textarea onChange={onChatboxChange} style={styles.textarea}></textarea>
    </div>
  );
};

export default ChatBox;