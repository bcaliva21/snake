// score.ts
import { getScoreMultiplier } from './snake';

export function updateScore(currentTime: number, startTime: number) {
    const scoreBoard = document.getElementById('score-board') as HTMLElement;
    if (startTime !== null) {
        const elapsedTime = Math.floor((currentTime - startTime));
        const scoreMultiplier = getScoreMultiplier(); // Get the score multiplier
        const score = Math.floor(elapsedTime * scoreMultiplier); // Calculate the score with the multiplier
        scoreBoard.textContent = `Score: ${score}`;
    }
}

export function addEndGameScoreToEntryModal(currentTime: number, startTime: number) {
    const elapsedTime = Math.floor((currentTime - startTime));
    const scoreMultiplier = getScoreMultiplier(); // Get the score multiplier
    const score = Math.floor(elapsedTime * scoreMultiplier); // Calculate the score with the multiplier
    const startModal = document.getElementById('start-modal') as HTMLElement;
    // Clear any previous content inside the modal (optional)
    startModal.innerHTML = '';

    // Create the score element and add it to the modal
    const scorePara = document.createElement('p');
    scorePara.textContent = `You scored: ${score}`;
    startModal.append(scorePara);

    // Create the instruction element for starting a new game
    const instructionPara = document.createElement('p');
    instructionPara.textContent = 'Press any arrow key or use WASD to start';
    startModal.append(instructionPara);
}
