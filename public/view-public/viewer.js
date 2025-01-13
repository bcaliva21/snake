"use strict";

// public/src/input.ts
var inputDirection = { x: 0, y: 0 };
var lastInputDirection = { x: 0, y: 0 };
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "w":
      if (lastInputDirection.y !== 0) break;
      inputDirection = { x: 0, y: -1 };
      break;
    case "ArrowDown":
    case "s":
      if (lastInputDirection.y !== 0) break;
      inputDirection = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
    case "a":
      if (lastInputDirection.x !== 0) break;
      inputDirection = { x: -1, y: 0 };
      break;
    case "ArrowRight":
    case "d":
      if (lastInputDirection.x !== 0) break;
      inputDirection = { x: 1, y: 0 };
      break;
  }
});

// public/src/snake.ts
var snakeBody = [{ x: 11, y: 11 }];
function draw(gameBoard2, body) {
  body.forEach((segment, index) => {
    const snakeElement = document.createElement("div");
    snakeElement.style.gridRowStart = segment.y.toString();
    snakeElement.style.gridColumnStart = segment.x.toString();
    if (index === 0) {
      snakeElement.classList.add("snake-head");
      const tongue = document.createElement("div");
      tongue.classList.add("tongue");
      snakeElement.appendChild(tongue);
    } else {
      snakeElement.classList.add("snake");
    }
    gameBoard2.appendChild(snakeElement);
  });
}
function onSnake(position, { ignoreHead = false } = {}) {
  return snakeBody.some((segment, index) => {
    if (ignoreHead && index === 0) return false;
    return equalPositions(segment, position);
  });
}
function equalPositions(pos1, pos2) {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

// public/src/grid.ts
var GRID_SIZE = 21;
function randomGridPosition() {
  return {
    x: Math.floor(Math.random() * GRID_SIZE) + 1,
    y: Math.floor(Math.random() * GRID_SIZE) + 1
  };
}

// public/src/food.ts
var food = getRandomFoodPosition();
function draw2(gameBoard2, currentFood) {
  const foodElement = document.createElement("div");
  foodElement.style.gridRowStart = currentFood.y.toString();
  foodElement.style.gridColumnStart = currentFood.x.toString();
  foodElement.classList.add("food");
  const ratImage = document.createElement("img");
  ratImage.src = "images/rat.webp";
  ratImage.alt = "Rat";
  ratImage.style.backgroundSize = "cover";
  ratImage.style.width = "100%";
  ratImage.style.height = "100%";
  foodElement.appendChild(ratImage);
  gameBoard2.appendChild(foodElement);
}
function getRandomFoodPosition() {
  let newFoodPosition = null;
  while (newFoodPosition == null || onSnake(newFoodPosition)) {
    newFoodPosition = randomGridPosition();
  }
  return newFoodPosition;
}

// public/src/viewer.ts
var gameBoard = document.getElementById("game-board");
var scoreBoard = document.getElementById("score-board");
var countdownDisplay = document.getElementById("countdown-display");
var ws = new WebSocket("wss://localhost:3000");
ws.onopen = () => {
  console.log("WebSocket connection opened");
  ws.send(JSON.stringify({ type: "viewer" }));
};
ws.onmessage = (event) => {
  console.log("EVENT_DATA: ", event.data);
  const gameState = JSON.parse(event.data);
  if (gameState.type === "gameState") {
    updateGameState(gameState);
  }
};
ws.onclose = () => {
  console.log("WebSocket connection closed");
};
function updateGameState(gameState) {
  const { snakeBody: snakeBody2, food: food2, score, countdownTimer } = gameState;
  draw(gameBoard, snakeBody2);
  draw2(gameBoard, food2);
  scoreBoard.textContent = `Score: ${score}`;
  countdownDisplay.textContent = `Time: ${(countdownTimer / 1e3).toFixed(3)}s`;
}
