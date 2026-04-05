// Add working multiplayer game code with auto-matching queue

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let waitingPlayers = [];

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Add player to waiting queue
    waitingPlayers.push(socket);
    if (waitingPlayers.length >= 2) {
        const player1 = waitingPlayers.shift();
        const player2 = waitingPlayers.shift();

        // Start a new game between player1 and player2
        startNewGame(player1, player2);
    }

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove player from waiting queue
        waitingPlayers = waitingPlayers.filter(player => player.id !== socket.id);
    });
});

function startNewGame(player1, player2) {
    player1.emit('gameStarted', { opponentId: player2.id });
    player2.emit('gameStarted', { opponentId: player1.id });

    // Game Logic
    player1.on('move', (data) => {
        player2.emit('opponentMove', data);
    });
    player2.on('move', (data) => {
        player1.emit('opponentMove', data);
    });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});