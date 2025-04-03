const socket = io({
    reconnection: false
});

socket.on('lobbyCreated', (gameCode) => {
    document.getElementById('game-code').textContent = gameCode;

    socket.emit('verifyGameCode', gameCode, 'Host');
});

socket.on('userList', (users) => {
    // Update your HTML to display the users
    const userListElement = document.getElementById('user-list');
    userListElement.innerHTML = '';

    users.forEach(user => {
        const listItem = document.createElement('li');
        listItem.textContent = user.username;
        userListElement.appendChild(listItem);
    });
});