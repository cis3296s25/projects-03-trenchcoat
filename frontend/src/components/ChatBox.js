import React, { useRef, useEffect } from "react";

const ChatBox = (props) => {
  const { appState, setAppState } = props;
  const { socket, userName } = appState;
  const messagesEndRef = useRef(null);
  const [joinedChat, setJoinedChat] = React.useState(false);

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
  }, [appState?.roomData?.chatHistory]);

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

  // When user joins game, send a message to the server/chatbox
  React.useEffect(() => {
    if (socket && appState?.roomData) {
      if (!joinedChat) {
        setJoinedChat(true);
        socket.emit("chatMessageSend", {
          message: "joined the game",
          gameCode: appState?.roomData?.code,
          userName,
        });
      }
    }
  }, [socket, appState?.roomData, joinedChat, userName]);

  function onChatboxChange(e) {
    const message = e.target.value;

    // check for return/enter key
    if (message.includes("\n")) {

      const trimmedMessage = message.replace("\n", "").trim();

      if (trimmedMessage.length > 0) {
        e.target.value = ""; // Clear the textarea after sending

        if (socket) {
          console.log("sending...");
          socket.emit("chatMessageSend", {
            message: message.replace("\n", ""),
            gameCode: appState?.roomData?.code,
            userName,
          });
        }
      } else {
        e.target.value = "";
      }
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.messagesContainer}>
        {appState?.roomData?.chatHistory &&
          appState?.roomData?.chatHistory.map((chat, index) => (
            <div key={index}>
              <strong>{chat.user.userName}</strong>: {chat.message}
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>
      <textarea onChange={onChatboxChange} style={styles.textarea}></textarea>
    </div>
  );
};

export default ChatBox;