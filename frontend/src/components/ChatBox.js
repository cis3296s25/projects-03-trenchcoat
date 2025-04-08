import React from "react";
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
  const { appState, setAppState } = props;
  const { code, isValid, socket, userName } = appState;

  const [joinedChat, setJoinedChat] = React.useState(false);

  const [chatHistory, setChatHistory] = React.useState(null);

  // Fetch chat history when the component mounts
  React.useEffect(() => {
    if (!socket) return;

    const handler = (gameCodeFromServer, history) => {
      console.log(
        gameCodeFromServer,
        "gameCodeFromServer",
        history,
        "history",
        code
      );
      if (code === gameCodeFromServer) {
        setChatHistory(history);
      }
    };

    socket.on("chatHistory", handler);

    return () => {
      socket.emit("chatMessageSend", {
        message: "left the game",
        gameCode: code,
        userName,
      });
      socket.off("chatHistory", handler);
    };
  }, [socket, code, userName]);

  // When user joins game, send a message to the server/chatbox
  React.useEffect(() => {
    if (isValid && socket) {
      if (!joinedChat) {
        setJoinedChat(true);
        socket.emit("chatMessageSend", {
          message: "joined the game",
          gameCode: code,
          userName,
        });
      }
    }
  }, [
    isValid,
    socket,
    joinedChat,
    code,
    userName,
    setJoinedChat,
    setChatHistory,
  ]);

  function onChatboxChange(e) {
    const message = e.target.value;

    // check for return/enter key
    if (message.includes("\n")) {
      e.target.value = ""; // Clear the textarea after sending

      if (socket && isValid) {
        console.log("sending...");
        socket.emit("chatMessageSend", {
          message: message.replace("\n", ""),
          gameCode: code,
          userName,
        });
      }
    }
  }

  return (
    <div style={styles.container}>
      {chatHistory &&
        chatHistory.map((chat, index) => (
          <div key={index}>
            <strong>{chat.userName}</strong>: {chat.message}
          </div>
        ))}
      <textarea onChange={onChatboxChange} style={styles.textarea}></textarea>
    </div>
  );
}
