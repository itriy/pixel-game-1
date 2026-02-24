// Tic-Tac-Toe Game with PixiJS
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const GRID_SIZE = 3;
const CELL_SIZE = CANVAS_WIDTH / GRID_SIZE;
const LINE_WIDTH = 4;
const MARK_SIZE = 50;

// Game state
let gameBoard = Array(9).fill(null);
let currentPlayer = 'X';
let gameOver = false;
let winningLine = null;

// Initialize PixiJS Application
const app = new PIXI.Application({
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: 0xffffff,
  antialias: true,
});

document.getElementById('gameCanvas').appendChild(app.view);

// Create container for game elements
const gameContainer = new PIXI.Container();
app.stage.addChild(gameContainer);

// Draw grid
function drawGrid() {
  const graphics = new PIXI.Graphics();

  // Set line style
  graphics.lineStyle(LINE_WIDTH, 0x333333, 1);

  // Draw vertical lines
  for (let i = 1; i < GRID_SIZE; i++) {
    graphics.moveTo(i * CELL_SIZE, 0);
    graphics.lineTo(i * CELL_SIZE, CANVAS_HEIGHT);
  }

  // Draw horizontal lines
  for (let i = 1; i < GRID_SIZE; i++) {
    graphics.moveTo(0, i * CELL_SIZE);
    graphics.lineTo(CANVAS_WIDTH, i * CELL_SIZE);
  }

  gameContainer.addChild(graphics);
}

// Draw X mark
function drawX(x, y) {
  const graphics = new PIXI.Graphics();
  graphics.lineStyle(8, 0x4caf50, 1);

  const centerX = x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = y * CELL_SIZE + CELL_SIZE / 2;

  // Draw X
  graphics.moveTo(centerX - MARK_SIZE, centerY - MARK_SIZE);
  graphics.lineTo(centerX + MARK_SIZE, centerY + MARK_SIZE);
  graphics.moveTo(centerX + MARK_SIZE, centerY - MARK_SIZE);
  graphics.lineTo(centerX - MARK_SIZE, centerY + MARK_SIZE);

  gameContainer.addChild(graphics);
}

// Draw O mark
function drawO(x, y) {
  const graphics = new PIXI.Graphics();
  graphics.lineStyle(8, 0xff5722, 1);

  const centerX = x * CELL_SIZE + CELL_SIZE / 2;
  const centerY = y * CELL_SIZE + CELL_SIZE / 2;

  // Draw O (circle)
  graphics.drawCircle(centerX, centerY, MARK_SIZE);

  gameContainer.addChild(graphics);
}

// Draw winning line
function drawWinningLine(line) {
  const graphics = new PIXI.Graphics();
  graphics.lineStyle(8, 0xffd700, 1);

  const [a, b, c] = line;
  const startPos = getCellCenter(a);
  const endPos = getCellCenter(c);

  graphics.moveTo(startPos.x, startPos.y);
  graphics.lineTo(endPos.x, endPos.y);

  gameContainer.addChild(graphics);
}

// Get cell center coordinates
function getCellCenter(index) {
  const x = (index % GRID_SIZE) * CELL_SIZE + CELL_SIZE / 2;
  const y = Math.floor(index / GRID_SIZE) * CELL_SIZE + CELL_SIZE / 2;
  return { x, y };
}

// Check for winner
function checkWinner() {
  const winPatterns = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal \
    [2, 4, 6], // Diagonal /
  ];

  for (const pattern of winPatterns) {
    const [a, b, c] = pattern;
    if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
      return { winner: gameBoard[a], line: pattern };
    }
  }

  // Check for tie
  if (gameBoard.every((cell) => cell !== null)) {
    return { winner: 'tie', line: null };
  }

  return null;
}

// Handle cell click
function handleCellClick(cellIndex) {
  if (gameOver || gameBoard[cellIndex] !== null) {
    return;
  }

  // Make move
  gameBoard[cellIndex] = currentPlayer;

  // Draw mark
  const x = cellIndex % GRID_SIZE;
  const y = Math.floor(cellIndex / GRID_SIZE);

  if (currentPlayer === 'X') {
    drawX(x, y);
  } else {
    drawO(x, y);
  }

  // Check for winner
  const result = checkWinner();
  if (result) {
    gameOver = true;
    if (result.winner === 'tie') {
      updateStatus('Нічия! 🤝');
    } else {
      updateStatus(`Переміг ${result.winner}! 🎉`);
      if (result.line) {
        drawWinningLine(result.line);
      }
    }
    return;
  }

  // Switch player
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateCurrentPlayer();
}

// Update current player indicator
function updateCurrentPlayer() {
  const playerElement = document.getElementById('current-player');
  playerElement.textContent = currentPlayer;
  playerElement.className = currentPlayer === 'X' ? 'player-x' : 'player-o';
}

// Update game status
function updateStatus(message) {
  document.getElementById('game-status').textContent = message;
}

// Create interactive cells
function createInteractiveCells() {
  for (let i = 0; i < 9; i++) {
    const x = (i % GRID_SIZE) * CELL_SIZE;
    const y = Math.floor(i / GRID_SIZE) * CELL_SIZE;

    const cell = new PIXI.Graphics();
    cell.beginFill(0x000000, 0.01); // Almost transparent
    cell.drawRect(x, y, CELL_SIZE, CELL_SIZE);
    cell.endFill();

    cell.interactive = true;
    cell.buttonMode = true;
    cell.cursor = 'pointer';

    cell.on('pointerdown', () => handleCellClick(i));

    // Hover effect
    cell.on('pointerover', () => {
      if (!gameOver && gameBoard[i] === null) {
        cell.clear();
        cell.beginFill(0x667eea, 0.1);
        cell.drawRect(x, y, CELL_SIZE, CELL_SIZE);
        cell.endFill();
      }
    });

    cell.on('pointerout', () => {
      cell.clear();
      cell.beginFill(0x000000, 0.01);
      cell.drawRect(x, y, CELL_SIZE, CELL_SIZE);
      cell.endFill();
    });

    gameContainer.addChild(cell);
  }
}

// Reset game
function resetGame() {
  gameBoard = Array(9).fill(null);
  currentPlayer = 'X';
  gameOver = false;
  winningLine = null;

  // Clear all graphics
  gameContainer.removeChildren();

  // Redraw game
  drawGrid();
  createInteractiveCells();
  updateCurrentPlayer();
  updateStatus('');
}

// Initialize game
drawGrid();
createInteractiveCells();

// Restart button
document.getElementById('restart-btn').addEventListener('click', resetGame);
