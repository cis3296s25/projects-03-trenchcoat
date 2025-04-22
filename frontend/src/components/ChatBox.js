import React, { useRef, useEffect, useState } from "react";

const ChatBox = (props) => {
  const { appState, setAppState } = props;
  const { socket, userName } = appState;
  const messagesEndRef = useRef(null);
  const [localChats, setLocalChats] = useState([]);
  const [prevChatsLength, setPrevChatsLength] = useState(0);
  const [prevLocalChatsLength, setPrevLocalChatsLength] = useState(0);

  const styles = {
    container: {
      border: "1px solid #ccc",
      borderRadius: "5px",
      padding: "1rem",
      backgroundColor: "#f9f9f9",
      width: "20%",
      position: "fixed",
      right: 0,
      top: 0,
      height: "100vh",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      display: "flex",
      flexDirection: "column",
      zIndex: 10
    },
    messagesContainer: {
      overflowY: "auto",
      flexGrow: 1,
      marginBottom: "110px",
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

  // Auto-scroll when new messages arrive
  useEffect(() => {
    const currentChatsLength = appState?.roomData?.chatHistory?.length || 0;
    const currentLocalChatsLength = localChats.length;

    // Check if there are new messages
    const hasNewMessages =
      currentChatsLength > prevChatsLength ||
      currentLocalChatsLength > prevLocalChatsLength;

    // Update previous lengths for next comparison
    setPrevChatsLength(currentChatsLength);
    setPrevLocalChatsLength(currentLocalChatsLength);

    // Scroll if there are new messages
    if (hasNewMessages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [appState?.roomData?.chatHistory, localChats]);

  // Listen for new chat messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveChat = ({ msg, player, rightGuess }) => {
      const sender = player?.userName || player?.name || "System";
      const message = rightGuess ? `${sender} guessed the word!` : msg;

      // Check if this message is already in the server history
      const isInServerHistory = appState?.roomData?.chatHistory?.some(
        chat => chat.message === message && chat.user.userName === sender
      );

      if (!isInServerHistory) {
        setLocalChats(prev => [...prev, {
          sender,
          message,
          rightGuess,
          timestamp: Date.now()
        }]);
      }
    };

    socket.on("receive-chat", handleReceiveChat);
    return () => socket.off("receive-chat", handleReceiveChat);
  }, [socket, appState?.roomData?.chatHistory]);

  // Clean up local chats when they appear in server history
  useEffect(() => {
    if (!appState?.roomData?.chatHistory || localChats.length === 0) return;

    const updatedLocalChats = localChats.filter(localChat =>
      !appState.roomData.chatHistory.some(serverChat =>
        serverChat.message === localChat.message &&
        serverChat.user.userName === localChat.sender
      )
    );

    if (updatedLocalChats.length !== localChats.length) {
      setLocalChats(updatedLocalChats);
    }
  }, [appState?.roomData?.chatHistory, localChats]);

  // Handle sending messages
  const handleSendMessage = (e) => {
    const message = e.target.value;
    if (!message.includes("\n")) return;

    const trimmedMessage = message.replace("\n", "").trim();
    if (trimmedMessage.length === 0) {
      e.target.value = "";
      return;
    }

    e.target.value = "";
    socket?.emit("chatMessageSend", {
      message: trimmedMessage,
      gameCode: appState?.roomData?.code,
      userName,
    });
  };

  // Combine and sort all messages
  const allChats = [
    ...(appState?.roomData?.chatHistory || []).map(chat => ({
      sender: chat.user.userName,
      message: chat.message,
      rightGuess: chat.message.includes(" guessed the word!"),
      timestamp: chat.timestamp || Date.now()
    })),
    ...localChats
  ].sort((a, b) => a.timestamp - b.timestamp);

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
      <textarea onChange={handleSendMessage} style={styles.textarea}></textarea>
    </div>
  );
};

export default ChatBox;