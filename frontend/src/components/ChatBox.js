import React, { useRef, useEffect, useState } from "react";

const ChatBox = (props) => {
  const { appState, setAppState } = props;
  const { socket, userName } = appState;
  const messagesEndRef = useRef(null);
  const [localChats, setLocalChats] = useState([]);

  // Determine if current user is the drawer or has already guessed correctly
  const isCurrentUserDrawer = React.useMemo(() => {
    if (!appState?.roomData?.gameStarted || !socket) return false;

    const currentDrawerIndex = appState.roomData.currentDrawerIndex;
    const currentDrawer = appState.roomData.users[currentDrawerIndex];

    // The socketId property is used in some places, id in others
    return (currentDrawer?.socketId === socket.id) || (currentDrawer?.id === socket.id);
  }, [appState?.roomData, socket]);

  // Check if current user has already guessed correctly in this round
  const hasGuessedCorrectly = React.useMemo(() => {
    if (!appState?.roomData?.gameStarted || !socket || !appState?.roomData?.correctGuessers) return false;

    // Check if user's socket ID is in the correctGuessers array
    return appState.roomData.correctGuessers.includes(socket.id);
  }, [appState?.roomData, socket]);

  // Debugging
  useEffect(() => {
    if (appState?.roomData?.gameStarted) {
      console.log("Current drawer: ", appState.roomData.users[appState.roomData.currentDrawerIndex]);
      console.log("My socket ID: ", socket?.id);
      console.log("Am I the drawer? ", isCurrentUserDrawer);
      console.log("Have I guessed correctly? ", hasGuessedCorrectly);
      console.log("Correct guessers: ", appState.roomData.correctGuessers);
    }
  }, [appState?.roomData, socket, isCurrentUserDrawer, hasGuessedCorrectly]);

  // Determine if the chat should be disabled for the current user
  const isChatDisabled = isCurrentUserDrawer || hasGuessedCorrectly;

  

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
      backgroundColor: isChatDisabled ? "#e0e0e0" : "white",
      color: isChatDisabled ? "#888888" : "black",
      resize: "none",
    },
    drawerMessage: {
      position: "absolute",
      bottom: 0,
      left: 10,
      right: 10,
      textAlign: "center",
      color: "#666",
      fontSize: "12px",
      fontStyle: "italic",
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [appState?.roomData?.chatHistory, localChats]);

  // Listen for new chat messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveChat = ({ msg, player, rightGuess }) => {
      const sender = player?.userName || player?.name || "System";
      const message = rightGuess ? `${sender} guessed the word!` : msg;

      // Check if this message is already in the server history
      const isInServerHistory = appState?.roomData?.chatHistory?.some(
        chat => chat.message === message &&
          (chat.user.userName === sender || chat.user.name === sender)
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
        (serverChat.user.userName === localChat.sender ||
          serverChat.user.name === localChat.sender)
      )
    );

    if (updatedLocalChats.length !== localChats.length) {
      setLocalChats(updatedLocalChats);
    }
  }, [appState?.roomData?.chatHistory, localChats]);

  // Handle sending messages
  const handleSendMessage = (e) => {
    // Block sending if current user is the drawer or has already guessed correctly
    if (isChatDisabled) {
      e.target.value = "";
      return;
    }

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
      sender: chat.user.userName || chat.user.name,
      message: chat.message,
      rightGuess: chat.message.includes(" guessed the word!"),
      timestamp: new Date(chat.timestamp).getTime() || Date.now()
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
      <textarea
        onChange={handleSendMessage}
        style={styles.textarea}
        placeholder={isChatDisabled
          ? (isCurrentUserDrawer
            ? "You're drawing! No chatting allowed."
            : "You've guessed correctly!")
          : "Type and press Enter to chat"
        }
        disabled={isChatDisabled}
      ></textarea>
    </div>
  );
};

export default ChatBox;