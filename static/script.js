// Canvas and Context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startButton = document.getElementById("startButton");
const playerNameInput = document.getElementById("playerName");
let playerName = "";
let gameInterval = null;
let gameRunning = false;

// Game Variables
const boxSize = 20;
const canvasSize = 20;
let snake = [{ x: 10 * boxSize, y: 10 * boxSize }];
let direction = "RIGHT";
let food = {
    x: Math.floor(Math.random() * canvasSize) * boxSize,
    y: Math.floor(Math.random() * canvasSize) * boxSize
};
let score = 0;

// Event Listeners
startButton.addEventListener("click", () => {
    playerName = playerNameInput.value.trim();
    if (playerName === "") {
        alert("Please enter your name to start the game.");
        return;
    }

    // Hide start screen, show canvas
    document.getElementById("startScreen").style.display = "none";
    canvas.style.display = "block";

    if (!gameRunning) {
        gameRunning = true;
        startGame();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
    if (event.key === "ArrowDown" && direction !== "UP") direction = "DOWN";
    if (event.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
    if (event.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
});

// Start Game
function startGame() {
    gameInterval = setInterval(updateGame, 100);
}

// Draw Functions
function drawSnake() {
    snake.forEach(segment => {
        ctx.fillStyle = "green";
        ctx.fillRect(segment.x, segment.y, boxSize, boxSize);
    });
}

function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, boxSize, boxSize);
}

// Update Game
function updateGame() {
    const head = { x: snake[0].x, y: snake[0].y };

    // Move Snake
    if (direction === "UP") head.y -= boxSize;
    if (direction === "DOWN") head.y += boxSize;
    if (direction === "LEFT") head.x -= boxSize;
    if (direction === "RIGHT") head.x += boxSize;

    // Check for collisions
    if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height || snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        clearInterval(gameInterval);
        alert("Game Over! Your score: " + score);
        updateHighScore(score);
        resetGame();
        return;
    }

    snake.unshift(head);

    // Check if food is eaten
    if (head.x === food.x && head.y === food.y) {
        score++;
        food = {
            x: Math.floor(Math.random() * canvasSize) * boxSize,
            y: Math.floor(Math.random() * canvasSize) * boxSize
        };
    } else {
        snake.pop();
    }

    // Render
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFood();
    drawSnake();
}

// Update High Score
function updateHighScore(score) {
    fetch('/highscore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName, score }),
    });
}

// Reset Game
function resetGame() {
    gameRunning = false;
    snake = [{ x: 10 * boxSize, y: 10 * boxSize }];
    direction = "RIGHT";
    score = 0;

    // Show start screen again
    document.getElementById("startScreen").style.display = "block";
    canvas.style.display = "none";
}