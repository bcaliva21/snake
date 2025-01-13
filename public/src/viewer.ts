// viewer.ts
import { draw as drawSnake } from './snake';
import { draw as drawFood } from './food';

const gameBoard = document.getElementById('game-board') as HTMLElement;
const scoreBoard = document.getElementById('score-board') as HTMLElement;
const countdownDisplay = document.getElementById('countdown-display') as HTMLElement;

// WebSocket connection
const ws = new WebSocket('wss://localhost:3000');

ws.onopen = () => {
    console.log('WebSocket connection opened');
    // Send a message indicating this client is a viewer
    ws.send(JSON.stringify({ type: 'viewer' }));
};

ws.onmessage = (event) => {
    console.log('EVENT_DATA: ', event.data)
    const gameState = JSON.parse(event.data);
    if (gameState.type === 'gameState') {
        updateGameState(gameState);
    }
};

ws.onclose = () => {
    console.log('WebSocket connection closed');
};

function updateGameState(gameState: any) {
    const { snakeBody, food, score, countdownTimer } = gameState;
    drawSnake(gameBoard, snakeBody);
    drawFood(gameBoard, food);
    scoreBoard.textContent = `Score: ${score}`;
    countdownDisplay.textContent = `Time: ${(countdownTimer / 1000).toFixed(3)}s`;
}

