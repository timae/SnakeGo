// Canvas and Context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Game Constants
const boxSize = 20; // Size of one grid box
const canvasSize = 20; // Number of boxes along the width and height
const canvasWidth = boxSize * canvasSize;
const canvasHeight = boxSize * canvasSize;

// Game Variables
let snake = [{ x: 10 * boxSize, y: 10 * boxSize }]; // Snake starts at the center
let direction = "RIGHT"; // Initial direction
let food = { x: Math.floor(Math.random() * canvasSize) * boxSize, y: Math.floor(Math.random() * canvasSize) * boxSize };
let score = 0;

// Draw the Snake
function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "green" : "lightgreen"; // Head is darker
        ctx.fillRect(snake[i].x, snake[i].y, boxSize, boxSize);
        ctx.strokeStyle = "darkgreen";
        ctx.strokeRect(snake[i].x, snake[i].y, boxSize, boxSize);
    }
}

// Draw the Food
function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, boxSize, boxSize);
}

// Control the Snake
document.addEventListener("keydown", changeDirection);
function changeDirection(event) {
    if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    else if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    else if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    else if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
}

// Update the Game
function updateGame() {
    // Get the head of the snake
    const head = { x: snake[0].x, y: snake[0].y };

    // Update the head's position based on direction
    if (direction === "UP") head.y -= boxSize;
    if (direction === "DOWN") head.y += boxSize;
    if (direction === "LEFT") head.x -= boxSize;
    if (direction === "RIGHT") head.x += boxSize;

    // Check for collision with walls or self
    if (
        head.x < 0 ||
        head.x >= canvasWidth ||
        head.y < 0 ||
        head.y >= canvasHeight ||
        snake.some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        clearInterval(gameInterval); // End the game
        alert(`Game Over! Your score: ${score}`);
        return;
    }

    // Check for collision with food
    if (head.x === food.x && head.y === food.y) {
        score++;
        food = { x: Math.floor(Math.random() * canvasSize) * boxSize, y: Math.floor(Math.random() * canvasSize) * boxSize };
    } else {
        snake.pop(); // Remove the tail
    }

    // Add the new head to the snake
    snake.unshift(head);

    // Redraw everything
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawFood();
    drawSnake();
}

// Set Up Game Interval
const gameInterval = setInterval(updateGame, 100); // Update every 100ms