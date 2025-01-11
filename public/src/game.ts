// game.ts
import { resetSnake, update as updateSnake, draw as drawSnake, getSnakeHead, snakeIntersection, getSnakeSpeed } from './snake';
import { resetFood, update as updateFood, draw as drawFood } from './food';
import { outsideGrid } from './grid';
import { addEndGameScoreToEntryModal, updateScore } from './score';

let lastRenderTime = 0;
let gameOver = false;
let gameHasStarted = false;
let animationFrameId: number | null = null; // Track the animation frame ID
const TIME_LIMIT = 5000; // milliseconds (5 seconds)
const gameBoard = document.getElementById('game-board') as HTMLElement;
const startModal = document.getElementById('start-modal') as HTMLElement;
const timerOverlay = document.getElementById('timer-overlay') as HTMLElement;
const overlayTimer = document.getElementById('overlay-timer') as HTMLElement;
let countdownTimer = TIME_LIMIT; // Timer in milliseconds
let startTime: number | null = null; // The time when the game started (initial)
let elapsedTimeSinceStart = 0; // Track the total elapsed time since game start

window.addEventListener('keydown', (e) => {
    if (e.key.startsWith('Arrow') || ['w', 'a', 's', 'd'].includes(e.key)) {
        if (!gameHasStarted) {
            startGame();
        }
    }
});

function endGame(currentTime: number, startTime: number) {
    gameHasStarted = false;
    gameOver = false;
    startModal.classList.remove('hide');
    overlayTimer.textContent = 'No more time!'
    addEndGameScoreToEntryModal(currentTime, startTime);
    resetGameState();

    if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
    }
}

function startGame() {
    startTime = null;
    gameHasStarted = true;
    startModal.classList.add('hide');
    lastRenderTime = 0;
    countdownTimer = TIME_LIMIT; // Reset the countdown timer
    animationFrameId = window.requestAnimationFrame(main);
}

function resetGameState() {
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
    const snakeSpeed = getSnakeSpeed(); // Get the dynamic snake speed
    if (secondsSinceLastRender < 1 / snakeSpeed) return;

    lastRenderTime = currentTime;

    if (gameHasStarted && startTime) {
        update(currentTime, startTime);
        draw();
        updateCountdownTimer(currentTime, startTime, false);
    }
}

function update(currentTime: number, startTime: number) {
    updateSnake();
    if (updateFood()) {
        // Add 6000ms when food is collected
        updateCountdownTimer(currentTime, startTime, true);
    }

    checkDeath(currentTime, startTime);
    updateScore(currentTime, startTime);
}

function draw() {
    gameBoard.innerHTML = '';
    drawSnake(gameBoard);
    drawFood(gameBoard);
}

function checkDeath(currentTime: number, startTime: number) {
    gameOver = outsideGrid(getSnakeHead()) || snakeIntersection() || countdownTimer <= 0;
    if (gameOver) {
        endGame(currentTime, startTime);
    }
}

function updateCountdownTimer(currentTime: number, startTime: number, addTime: boolean) {
    if (addTime) {
        // Add 5000ms (5 seconds) when food is collected
        countdownTimer += 5000;
        console.log('Added 5000ms to the timer:', countdownTimer);
    }

    // If the game has started, track the elapsed time since the game started
    const elapsedTime = currentTime - startTime; // Total time passed since the game started
    elapsedTimeSinceStart = elapsedTime;

    // The remaining time will be countdownTimer - elapsedTimeSinceStart
    const remainingTime = countdownTimer - elapsedTimeSinceStart;

    // If the remaining time is less than or equal to 0, game over
    if (remainingTime <= 0) {
        gameOver = true;
        renderTimer(0); // Display 0 on the UI when the game is over
    } else {
        renderTimer(remainingTime); // Otherwise, update the timer UI
    }
}

function renderTimer(time: number) {
    const countdownElement = document.getElementById('countdown-display') as HTMLElement;
    countdownElement.textContent = `Time: ${(time / 1000).toFixed(3)}s`;

    // Change color when time is less than or equal to 3 seconds
    if (time <= 3000) {
        countdownElement.style.color = 'red';
    } else {
        countdownElement.style.color = 'white';
    }

    // Show the overlay when time is less than or equal to 2 seconds
    if (time <= 2000) {
        timerOverlay.classList.remove('hide');
        overlayTimer.textContent = `Time: ${(time / 1000).toFixed(3)}s`;
    } else {
        timerOverlay.classList.add('hide');
    }



}
