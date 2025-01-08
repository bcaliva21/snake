// snake.ts
import { getInputDirection } from "./input";

export const SNAKE_SPEED = 10;
let snakeBody = [{ x: 11, y: 11 }];
let newSegments = 0;

export function update() {
    addSegments();
    const inputDirection = getInputDirection();
    for (let i = snakeBody.length - 2; i >= 0; i--) {
        snakeBody[i + 1] = { ...snakeBody[i] };
    }

    snakeBody[0].x += inputDirection.x;
    snakeBody[0].y += inputDirection.y;
}

export function draw(gameBoard: HTMLElement) {
    snakeBody.forEach((segment, index) => {
        const snakeElement = document.createElement('div');
        snakeElement.style.gridRowStart = segment.y.toString();
        snakeElement.style.gridColumnStart = segment.x.toString();

        if (index === 0) {
            snakeElement.classList.add('snake-head');

            const tongue = document.createElement('div');
            tongue.classList.add('tongue');
            snakeElement.appendChild(tongue);
        } else {
            snakeElement.classList.add('snake');
        }

        gameBoard.appendChild(snakeElement);
    });
}

export function expandSnake(amount: number) {
    newSegments += amount;
}

export function onSnake(position: { x: number; y: number }, { ignoreHead = false } = {}): boolean {
    return snakeBody.some((segment, index) => {
        if (ignoreHead && index === 0) return false;
        return equalPositions(segment, position);
    });
}

export function getSnakeHead() {
    return snakeBody[0];
}

export function snakeIntersection() {
    return onSnake(snakeBody[0], { ignoreHead: true });
}

function equalPositions(pos1: { x: number; y: number }, pos2: { x: number; y: number }): boolean {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

function addSegments() {
    for (let i = 0; i < newSegments; i++) {
        snakeBody.push({ ...snakeBody[snakeBody.length - 1] });
    }

    newSegments = 0;
}

export function resetSnake() {
    snakeBody = [{ x: 11, y: 11 }];
    newSegments = 0;



}
