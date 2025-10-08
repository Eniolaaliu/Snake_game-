// get the canvas and context
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

//dom info
const startBtn = document.getElementById("startbtn");
const pauseBtn = document.getElementById("pausebtn");
const restartBtn = document.getElementById("restart");
const scores = document.querySelector("#score");
const best_score = document.querySelector("#best");
const speedInfo = document.querySelector("#speed");

// pad buttons
const upBtn = document.getElementById("upBtn");
const downBtn = document.getElementById("downBtn");
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

// game control
const box = 18;
const cols = Math.floor(canvas.width / box);
const rows = Math.floor(canvas.height / box);
let speed = 200; // Changed from const to let so it can be modified
let snake;
let food;
let dx = 1;
let dy = 0;
let score = 0;
let bestScore = parseInt(localStorage.getItem("best_score") || "0");
let running = false; // Added let declaration
let interval;

best_score.innerText = bestScore;

//draw on canvas
function canvasBoard() {
    // Clear the entire canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw checkerboard background
    ctx.fillStyle = "rgba(255,255,255,0.02)";
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if ((i + j) % 2 === 0) {
                ctx.fillRect(i * box, j * box, box, box);
            }
        }
    }
}

// helper to create the starting snake in the center
function createInitialSnake() {
    const cx = Math.floor(cols / 2);
    const cy = Math.floor(rows / 2);
    return [
        { x: cx, y: cy },
        { x: cx - 1, y: cy },
        { x: cx - 2, y: cy }
    ];
}

// generate a random food position that is NOT on the snake
function randomFoodPosition() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * cols),
            y: Math.floor(Math.random() * rows)
        };
        // keep generating while food would be on the snake
    } while (snake.some(seg => seg.x === pos.x && seg.y === pos.y));
    return pos;
}

function drawSnake() {
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "lime" : "green";
        ctx.fillRect(snake[i].x * box, snake[i].y * box, box, box);
    }
}

function drawFood() {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * box, food.y * box, box, box);
}

function resetGame() {
    running = false;
    clearInterval(interval);
    snake = createInitialSnake();
    dx = 1;
    dy = 0;
    speedInfo.innerText = "5"
    score = 0;
    speed = 200; // Reset speed on game reset
    food = randomFoodPosition();
    canvasBoard();
    drawSnake();
    drawFood();
    scores.innerText = score;
}

function moveSnake() {
    // compute next position
    let nextX = snake[0].x + dx;
    let nextY = snake[0].y + dy;

    // wrap-around (left->right, right->left, top->bottom)
    nextX = (nextX + cols) % cols;
    nextY = (nextY + rows) % rows;

    const head = { x: nextX, y: nextY };

    // self-collision: hit its own body -> reset
    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        alert("Game Over! Score: " + score);
        bestScoreGame();
        resetGame();
        return;
    }

    // add new head
    snake.unshift(head);

    // check if we ate food
    if (head.x === food.x && head.y === food.y) {
        score++;
        scores.innerText = score;
        bestScoreGame();
        food = randomFoodPosition();
        increaseSpeed();
        // don't pop tail -> snake grows
    } else {
        // normal move: remove tail
        snake.pop();
    }
}

// best score function
function bestScoreGame() {
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("best_score", String(score));
        best_score.innerText = score;
    }
}

function increaseSpeed() {
    if (score > 0 && score % 5 === 0 && speed > 50) {
        speed = Math.max(50, speed - 10);

        let currentSpeedDisplay = parseInt(speedInfo.innerText);
        speedInfo.innerText = currentSpeedDisplay + 2;

        clearInterval(interval);
        if (running) {
            interval = setInterval(gameLoop, speed);
        }
    }
}

// pad (onscreen) controls - prevent instant reverse
upBtn.addEventListener("click", () => {
    if (dy !== 1) {
        dx = 0;
        dy = -1;
    }
});
downBtn.addEventListener("click", () => {
    if (dy !== -1) {
        dx = 0;
        dy = 1;
    }
});
leftBtn.addEventListener("click", () => {
    if (dx !== 1) {
        dx = -1;
        dy = 0;
    }
});
rightBtn.addEventListener("click", () => {
    if (dx !== -1) {
        dx = 1;
        dy = 0;
    }
});

// keyboard controls - prevent reversing into yourself
document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowUp" && dy !== 1) {
        dx = 0;
        dy = -1;
    } else if (event.key === "ArrowDown" && dy !== -1) {
        dx = 0;
        dy = 1;
    } else if (event.key === "ArrowLeft" && dx !== 1) {
        dx = -1;
        dy = 0;
    } else if (event.key === "ArrowRight" && dx !== -1) {
        dx = 1;
        dy = 0;
    }
});

function gameLoop() {
    if (!running) return;
    moveSnake();
    canvasBoard(); // Redraw background
    drawSnake();
    drawFood();

    // draw score on canvas
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Score: " + score, 8, 18);
}

function startGame() {
    if (running) return;
    running = true;
    interval = setInterval(gameLoop, speed);
}

function pauseGame() {
    if (pauseBtn.innerText === "Pause") {
        running = false;
        clearInterval(interval);
        pauseBtn.innerText = "Continue";
    } else {
        pauseBtn.innerText = "Pause";
        startGame();
    }
}

startBtn.addEventListener("click", () => {
    startGame();
});

pauseBtn.addEventListener("click", () => {
    pauseGame();
});

restartBtn.addEventListener("click", () => {
    resetGame();
});

// Initialize the game
resetGame();
