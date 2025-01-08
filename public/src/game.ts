// game.ts
import { resetSnake, update as updateSnake, draw as drawSnake, SNAKE_SPEED, getSnakeHead, snakeIntersection } from './snake';
import { resetFood, update as updateFood, draw as drawFood } from './food';
import { outsideGrid } from './grid';
import { addEndGameScoreToEntryModal, updateScore } from './score';

let lastRenderTime = 0;
let gameOver = false;
let startTime: number | null = null;
let gameHasStarted = false;
let animationFrameId: number | null = null; // Track the animation frame ID
const gameBoard = document.getElementById('game-board') as HTMLElement;
const startModal = document.getElementById('start-modal') as HTMLElement;

window.addEventListener('keydown', (e) => {
    if (e.key.startsWith('Arrow')) {
        if (!gameHasStarted) {
            startGame();
        }
    }
});

function endGame(currentTime: number, startTime: number) {
    gameHasStarted = false;
    gameOver = false;
    startModal.classList.remove('hide');
    addEndGameScoreToEntryModal(currentTime, startTime);
    resetGameState()

    if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
    }
}

function startGame() {
    startTime = null;
    gameHasStarted = true;
    startModal.classList.add('hide');
    lastRenderTime = 0;
    animationFrameId = window.requestAnimationFrame(main);
}

function resetGameState() {
    // Reset snake and food positions
    // You can import and call the necessary functions to reset the snake and food
    // For example:
    resetSnake();
    resetFood();
}

function main(currentTime: number) {
    if (gameOver) {
        endGame(currentTime, startTime!);
        return;
    }

    animationFrameId = window.requestAnimationFrame(main);

    if (!startTime && gameHasStarted) {
        startTime = currentTime;
    }

    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSinceLastRender < 1 / SNAKE_SPEED) return;

    lastRenderTime = currentTime;

    if (gameHasStarted) {
        update(currentTime, startTime!);
        draw();
    }
}

function update(currentTime: number, startTime: number) {
    console.log(currentTime, startTime)
    updateSnake();
    updateFood();
    checkDeath(currentTime, startTime);
    updateScore(currentTime, startTime);
}

function draw() {
    gameBoard.innerHTML = '';
    drawSnake(gameBoard);
    drawFood(gameBoard);
}

function checkDeath(currentTime: number, startTime: number) {
    gameOver = outsideGrid(getSnakeHead()) || snakeIntersection();
    if (gameOver) {
        endGame(currentTime, startTime);
    }








}
