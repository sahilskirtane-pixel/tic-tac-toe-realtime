const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Store game states and connected players
let games = {};
let players = {};

// Serve static files
app.use(express.static('public'));

// Handle player connections
io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // Handle player joining the game
    socket.on('joinGame', (gameId) => {
        if (!games[gameId]) {
            // Create a new game if it doesn't exist
            games[gameId] = { players: [] };
        }

        games[gameId].players.push(socket.id);
        players[socket.id] = gameId;

        socket.join(gameId);
        io.to(gameId).emit('playerJoined', socket.id);

        // Check if game is full
        if (games[gameId].players.length === 2) {
            io.to(gameId).emit('startGame', gameId);
        }
    });

    // Handle game moves
    socket.on('makeMove', ({ gameId, position }) => {
        io.to(gameId).emit('moveMade', { playerId: socket.id, position });
    });

    // Handle player disconnect
    socket.on('disconnect', () => {
        console.log('A player disconnected:', socket.id);
        const gameId = players[socket.id];

        if (gameId) {
            const index = games[gameId].players.indexOf(socket.id);
            if (index !== -1) {
                games[gameId].players.splice(index, 1);
                io.to(gameId).emit('playerDisconnected', socket.id);
                if (games[gameId].players.length === 0) {
                    delete games[gameId]; // Remove game if no players
                }
            }
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
