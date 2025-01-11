// food.ts
import { onSnake, expandSnake } from './snake';
import { randomGridPosition } from './grid';

let food = getRandomFoodPosition();
const EXPANSION_RATE = 1;

export function update() {
    if (onSnake(food)) {
        expandSnake(EXPANSION_RATE);
        food = getRandomFoodPosition();
        return true
    }
    return false
}

export function draw(gameBoard: HTMLElement) {
    const foodElement = document.createElement('div');
    foodElement.style.gridRowStart = food.y.toString();
    foodElement.style.gridColumnStart = food.x.toString();
    foodElement.classList.add('food');

    // Add rat image
    const ratImage = document.createElement('img');
    ratImage.src = 'images/rat.webp'; // Path to your rat image
    ratImage.alt = 'Rat';
    ratImage.style.backgroundSize = 'cover';
    ratImage.style.width = '100%'
    ratImage.style.height = '100%'

    foodElement.appendChild(ratImage);
    gameBoard.appendChild(foodElement);
}

function getRandomFoodPosition() {
    let newFoodPosition: { x: number; y: number } | null = null;
    while (newFoodPosition == null || onSnake(newFoodPosition)) {
        newFoodPosition = randomGridPosition();
    }
    return newFoodPosition;
}

export function resetFood() {
    food = getRandomFoodPosition();

}
