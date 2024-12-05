const startButton = document.getElementById("startButton");
const playerNameInput = document.getElementById("playerName");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let playerName = "";
let gameInterval;
let snake;
let food;
let direction;
let gameRunning = false;

// Start Button click event
startButton.addEventListener("click", () => {
    playerName = playerNameInput.value.trim();
    if (playerName === "") {
        alert("Please enter your name to start the game.");
        return;
    }

    // Hide start screen, show game canvas
    document.getElementById("startScreen").style.display = "none";
    canvas.style.display = "block"; // Show the game canvas

    // Start the game
    startGame();
});

// Game logic
function startGame() {
    gameRunning = true;
    snake = [{ x: 10, y: 10 }];
    food = generateFood();
    direction = { x: 1, y: 0 }; // Start moving right

    // Start the game loop
    gameInterval = setInterval(updateGame, 100); // Update every 100ms
}

// Game loop
function updateGame() {
    if (!gameRunning) return;

    moveSnake();
    if (checkCollisions()) {
        gameOver();
        return;
    }

    if (checkFoodCollision()) {
        snake.push({}); // Grow the snake
        food = generateFood(); // Generate new food
    }

    drawGame();
}

// Snake movement
function moveSnake() {
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    snake.unshift(head); // Add new head to the front of the snake
    snake.pop(); // Remove last part of the snake
}

// Draw game elements (snake, food)
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    // Draw food
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * 20, food.y * 20, 20, 20);

    // Draw snake
    ctx.fillStyle = "green";
    snake.forEach((segment) => {
        ctx.fillRect(segment.x * 20, segment.y * 20, 20, 20);
    });
}

// Check if the snake collides with itself or the wall
function checkCollisions() {
    const head = snake[0];

    // Wall collision
    if (head.x < 0 || head.x >= canvas.width / 20 || head.y < 0 || head.y >= canvas.height / 20) {
        return true;
    }

    // Self-collision
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }

    return false;
}

// Check if the snake eats the food
function checkFoodCollision() {
    const head = snake[0];
    return head.x === food.x && head.y === food.y;
}

// Generate new food location
function generateFood() {
    const x = Math.floor(Math.random() * (canvas.width / 20));
    const y = Math.floor(Math.random() * (canvas.height / 20));
    return { x, y };
}

// Game over logic
function gameOver() {
    clearInterval(gameInterval); // Stop the game loop
    gameRunning = false;
    alert(`Game over, ${playerName}!`);
    resetGame();
}

// Reset the game state after game over
function resetGame() {
    snake = [];
    food = {};
    direction = {};
    playerNameInput.value = "";
    canvas.style.display = "none";
    document.getElementById("startScreen").style.display = "block"; // Show start screen again
}

// Keyboard input for controlling the snake
document.addEventListener("keydown", (event) => {
    if (!gameRunning) return;

    if (event.key === "ArrowUp" && direction.y === 0) {
        direction = { x: 0, y: -1 };
    } else if (event.key === "ArrowDown" && direction.y === 0) {
        direction = { x: 0, y: 1 };
    } else if (event.key === "ArrowLeft" && direction.x === 0) {
        direction = { x: -1, y: 0 };
    } else if (event.key === "ArrowRight" && direction.x === 0) {
        direction = { x: 1, y: 0 };
    }
}
);
