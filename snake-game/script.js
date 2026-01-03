const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("highScore");
const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const gridSize = 20;
const cellSize = canvas.width / gridSize;
const initialSpeed = 140;

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 5, y: 5 };
let score = 0;
let highScore = 0;
let isRunning = false;
let isPaused = false;
let intervalId = null;

const highScoreStorageKey = "snake-high-score";

const loadHighScore = () => {
  const stored = Number.parseInt(localStorage.getItem(highScoreStorageKey), 10);
  if (!Number.isNaN(stored)) {
    highScore = stored;
    highScoreEl.textContent = highScore;
  }
};

const setHighScore = (value) => {
  highScore = value;
  highScoreEl.textContent = highScore;
  localStorage.setItem(highScoreStorageKey, String(value));
};

const resetGame = () => {
  snake = [
    { x: 7, y: 10 },
    { x: 6, y: 10 },
    { x: 5, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  scoreEl.textContent = score;
  isPaused = false;
  placeFood();
  draw();
};

const placeFood = () => {
  let positionFound = false;
  while (!positionFound) {
    const x = Math.floor(Math.random() * gridSize);
    const y = Math.floor(Math.random() * gridSize);
    const isOnSnake = snake.some((segment) => segment.x === x && segment.y === y);
    if (!isOnSnake) {
      food = { x, y };
      positionFound = true;
    }
  }
};

const drawGrid = () => {
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;

  for (let i = 0; i <= gridSize; i += 1) {
    const position = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(position, 0);
    ctx.lineTo(position, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, position);
    ctx.lineTo(canvas.width, position);
    ctx.stroke();
  }
};

const drawSnake = () => {
  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#4ade80" : "#22c55e";
    ctx.fillRect(segment.x * cellSize, segment.y * cellSize, cellSize, cellSize);
  });
};

const drawFood = () => {
  ctx.fillStyle = "#facc15";
  ctx.fillRect(food.x * cellSize, food.y * cellSize, cellSize, cellSize);
};

const drawMessage = (text) => {
  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#e2e8f0";
  ctx.font = "24px 'Segoe UI', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
};

const draw = () => {
  drawGrid();
  drawFood();
  drawSnake();

  if (!isRunning) {
    drawMessage("点击开始游戏");
  } else if (isPaused) {
    drawMessage("已暂停");
  }
};

const update = () => {
  if (!isRunning || isPaused) {
    return;
  }

  direction = { ...nextDirection };

  const head = snake[0];
  const newHead = {
    x: (head.x + direction.x + gridSize) % gridSize,
    y: (head.y + direction.y + gridSize) % gridSize,
  };

  const hitSelf = snake.some((segment) => segment.x === newHead.x && segment.y === newHead.y);
  if (hitSelf) {
    endGame();
    return;
  }

  snake.unshift(newHead);

  if (newHead.x === food.x && newHead.y === food.y) {
    score += 10;
    scoreEl.textContent = score;
    if (score > highScore) {
      setHighScore(score);
    }
    placeFood();
  } else {
    snake.pop();
  }

  draw();
};

const endGame = () => {
  isRunning = false;
  clearInterval(intervalId);
  intervalId = null;
  draw();
  drawMessage("游戏结束，点击重新开始");
};

const startGame = () => {
  if (isRunning) {
    return;
  }
  resetGame();
  isRunning = true;
  intervalId = setInterval(update, initialSpeed);
  draw();
};

const restartGame = () => {
  clearInterval(intervalId);
  intervalId = null;
  isRunning = false;
  resetGame();
  startGame();
};

const togglePause = () => {
  if (!isRunning) {
    return;
  }
  isPaused = !isPaused;
  draw();
};

const handleKey = (event) => {
  const key = event.key.toLowerCase();

  if (key === " ") {
    togglePause();
    return;
  }

  const directions = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
  };

  if (!directions[key]) {
    return;
  }

  const proposed = directions[key];
  const isOpposite = direction.x + proposed.x === 0 && direction.y + proposed.y === 0;
  if (!isOpposite) {
    nextDirection = proposed;
  }
};

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);
window.addEventListener("keydown", handleKey);

loadHighScore();
resetGame();
