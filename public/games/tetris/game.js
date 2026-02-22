// Налаштування гри
const BLOCK_SIZE = 30;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const CANVAS_WIDTH = GRID_WIDTH * BLOCK_SIZE;
const CANVAS_HEIGHT = GRID_HEIGHT * BLOCK_SIZE;

// Кольори для різних тетроміно
const TETROMINO_COLORS = {
  I: 0x00f0f0,
  O: 0xf0f000,
  T: 0xa000f0,
  S: 0x00f000,
  Z: 0xf00000,
  J: 0x0000f0,
  L: 0xf0a000,
};

// Форми тетроміно
const TETROMINOS = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

class TetrisGame {
  constructor() {
    // Створюємо додаток PixiJS
    this.app = new PIXI.Application({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: 0x1a1a2e,
      antialias: true,
    });

    // Додаємо canvas до DOM
    document.getElementById('gameCanvas').appendChild(this.app.view);

    // Ініціалізуємо гру
    this.score = 0;
    this.grid = [];
    this.currentPiece = null;
    this.currentX = 0;
    this.currentY = 0;
    this.gameOver = false;
    this.isPaused = false;
    this.dropInterval = 1000; // мілісекунди
    this.lastDropTime = 0;

    this.gridGraphics = new PIXI.Graphics();
    this.app.stage.addChild(this.gridGraphics);

    this.pieceContainer = new PIXI.Container();
    this.app.stage.addChild(this.pieceContainer);

    this.initGrid();
    this.spawnPiece();
    this.drawGrid();
    this.drawPiece();

    // Обробка клавіатури
    this.setupKeyboard();

    // Кнопка рестарту
    document.getElementById('restart-btn').addEventListener('click', () => {
      this.restart();
    });

    // Головний ігровий цикл
    this.app.ticker.add((delta) => {
      this.gameLoop(delta);
    });

    this.updateScore();
  }

  initGrid() {
    this.grid = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      this.grid[y] = [];
      for (let x = 0; x < GRID_WIDTH; x++) {
        this.grid[y][x] = null;
      }
    }
  }

  drawGrid() {
    this.gridGraphics.clear();

    // Малюємо заповнені клітинки
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (this.grid[y][x]) {
          this.gridGraphics.beginFill(this.grid[y][x]);
          this.gridGraphics.drawRect(
            x * BLOCK_SIZE,
            y * BLOCK_SIZE,
            BLOCK_SIZE - 1,
            BLOCK_SIZE - 1
          );
          this.gridGraphics.endFill();
        }
      }
    }

    // Малюємо сітку
    this.gridGraphics.lineStyle(1, 0x333333, 0.3);
    for (let x = 0; x <= GRID_WIDTH; x++) {
      this.gridGraphics.moveTo(x * BLOCK_SIZE, 0);
      this.gridGraphics.lineTo(x * BLOCK_SIZE, CANVAS_HEIGHT);
    }
    for (let y = 0; y <= GRID_HEIGHT; y++) {
      this.gridGraphics.moveTo(0, y * BLOCK_SIZE);
      this.gridGraphics.lineTo(CANVAS_WIDTH, y * BLOCK_SIZE);
    }
  }

  spawnPiece() {
    const types = Object.keys(TETROMINOS);
    const randomType = types[Math.floor(Math.random() * types.length)];

    this.currentPiece = {
      type: randomType,
      shape: JSON.parse(JSON.stringify(TETROMINOS[randomType])),
      color: TETROMINO_COLORS[randomType],
    };

    this.currentX = Math.floor(GRID_WIDTH / 2) - Math.floor(this.currentPiece.shape[0].length / 2);
    this.currentY = 0;

    // Перевіряємо чи можна розмістити нову фігуру
    if (this.checkCollision(this.currentPiece.shape, this.currentX, this.currentY)) {
      this.gameOver = true;
      document.getElementById('game-status').textContent = '💀 Гра закінчена!';
    }
  }

  drawPiece() {
    this.pieceContainer.removeChildren();

    if (!this.currentPiece) return;

    const shape = this.currentPiece.shape;
    const color = this.currentPiece.color;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const block = new PIXI.Graphics();
          block.beginFill(color);
          block.drawRect(
            (this.currentX + x) * BLOCK_SIZE,
            (this.currentY + y) * BLOCK_SIZE,
            BLOCK_SIZE - 1,
            BLOCK_SIZE - 1
          );
          block.endFill();
          this.pieceContainer.addChild(block);
        }
      }
    }
  }

  checkCollision(shape, offsetX, offsetY) {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const newX = offsetX + x;
          const newY = offsetY + y;

          // Перевірка меж
          if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT) {
            return true;
          }

          // Перевірка зіткнення з іншими блоками
          if (newY >= 0 && this.grid[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  rotate() {
    const rotated = this.currentPiece.shape[0].map((_, i) =>
      this.currentPiece.shape.map((row) => row[i]).reverse()
    );

    if (!this.checkCollision(rotated, this.currentX, this.currentY)) {
      this.currentPiece.shape = rotated;
      this.drawPiece();
    }
  }

  moveLeft() {
    if (!this.checkCollision(this.currentPiece.shape, this.currentX - 1, this.currentY)) {
      this.currentX--;
      this.drawPiece();
    }
  }

  moveRight() {
    if (!this.checkCollision(this.currentPiece.shape, this.currentX + 1, this.currentY)) {
      this.currentX++;
      this.drawPiece();
    }
  }

  moveDown() {
    if (!this.checkCollision(this.currentPiece.shape, this.currentX, this.currentY + 1)) {
      this.currentY++;
      this.drawPiece();
      return true;
    } else {
      this.mergePiece();
      return false;
    }
  }

  hardDrop() {
    while (this.moveDown()) {
      // Продовжуємо рухати вниз до зіткнення
    }
  }

  mergePiece() {
    const shape = this.currentPiece.shape;
    const color = this.currentPiece.color;

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const gridY = this.currentY + y;
          const gridX = this.currentX + x;
          if (gridY >= 0) {
            this.grid[gridY][gridX] = color;
          }
        }
      }
    }

    this.checkLines();
    this.drawGrid();
    this.spawnPiece();
    this.drawPiece();
  }

  checkLines() {
    let linesCleared = 0;

    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
      let isFull = true;
      for (let x = 0; x < GRID_WIDTH; x++) {
        if (!this.grid[y][x]) {
          isFull = false;
          break;
        }
      }

      if (isFull) {
        // Видаляємо заповнений рядок
        this.grid.splice(y, 1);
        // Додаємо новий порожній рядок зверху
        this.grid.unshift(new Array(GRID_WIDTH).fill(null));
        linesCleared++;
        y++; // Перевіряємо той же рядок знову
      }
    }

    if (linesCleared > 0) {
      // Підрахунок очок (1 лінія = 100, 2 = 300, 3 = 500, 4 = 800)
      const points = [0, 100, 300, 500, 800];
      this.score += points[linesCleared];
      this.updateScore();
    }
  }

  updateScore() {
    document.getElementById('score-value').textContent = this.score;
  }

  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (this.gameOver || this.isPaused) return;

      switch (e.key) {
        case 'ArrowLeft':
          this.moveLeft();
          e.preventDefault();
          break;
        case 'ArrowRight':
          this.moveRight();
          e.preventDefault();
          break;
        case 'ArrowDown':
          this.moveDown();
          e.preventDefault();
          break;
        case 'ArrowUp':
          this.rotate();
          e.preventDefault();
          break;
        case ' ':
          this.hardDrop();
          e.preventDefault();
          break;
      }
    });
  }

  gameLoop(delta) {
    if (this.gameOver || this.isPaused) return;

    const currentTime = Date.now();
    if (currentTime - this.lastDropTime > this.dropInterval) {
      this.moveDown();
      this.lastDropTime = currentTime;
    }
  }

  restart() {
    this.score = 0;
    this.gameOver = false;
    this.isPaused = false;
    this.lastDropTime = 0;

    document.getElementById('game-status').textContent = '';

    this.initGrid();
    this.drawGrid();
    this.spawnPiece();
    this.drawPiece();
    this.updateScore();
  }
}

// Запускаємо гру після завантаження сторінки
window.addEventListener('load', () => {
  new TetrisGame();
});
