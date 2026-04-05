// JavaScript client for the Tic Tac Toe game

class TicTacToeClient {
    constructor(socketURL) {
        this.socket = io(socketURL);
        this.board = Array(9).fill(null);
        this.currentPlayer = null;
        this.socket.on('updateBoard', this.updateBoard.bind(this));
        this.socket.on('gameOver', this.onGameOver.bind(this));
    }

    // Method to make a move
    makeMove(index) {
        if (this.board[index] || this.currentPlayer === null) return;
        this.socket.emit('makeMove', { index, player: this.currentPlayer });
    }

    // Method to update the board
    updateBoard(data) {
        this.board[data.index] = data.player;
        this.render();
    }

    // Method to render the board
    render() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        this.board.forEach((cell, index) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.textContent = cell;
            cellElement.addEventListener('click', () => this.makeMove(index));
            boardElement.appendChild(cellElement);
        });
    }

    // Method to handle game over event
    onGameOver(winner) {
        alert(`Game Over! Winner: ${winner}`);
        this.resetGame();
    }

    // Method to reset the game
    resetGame() {
        this.board = Array(9).fill(null);
        this.render();
        this.socket.emit('resetGame');
    }
}

// Usage
const client = new TicTacToeClient('http://your-socket-url');
client.currentPlayer = 'X'; // Set the current player (can be 'X' or 'O')