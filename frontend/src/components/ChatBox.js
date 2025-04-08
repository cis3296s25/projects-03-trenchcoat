import React from "react";
const styles = {
  container: {
    border: "1px solid #ccc",
    borderRadius: "5px",
    padding: "1rem",
    backgroundColor: "#f9f9f9",
    width: "30%",
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
  const { code, isValid, socket, userName } = props;

  const [chatHistory, setChatHistory] = React.useState(null);
  const [userJoined, setUserJoined] = React.useState(false);

  // Fetch chat history when the component mounts
  React.useEffect(() => {
    if (!socket) return;

    const handler = (gameCodeFromServer, history) => {
      if (code === gameCodeFromServer) {
        setChatHistory(history);
      }
    };

    socket.on("chatHistory", handler);

    return () => {
      socket.off("chatHistory", handler);
    };
  }, [socket, code]);

  // Join the game and send a message to the chat
  React.useEffect(() => {
    if (isValid && socket) {
      if (!userJoined) {
        setUserJoined(true);
        socket.emit("chatMessageSend", {
          message: "joined the game",
          gameCode: code,
          userName,
        });
      }
    }
  }, [isValid, socket, userJoined, code, userName]);

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
