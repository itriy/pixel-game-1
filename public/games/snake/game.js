// Налаштування гри
const GRID_SIZE = 20; // Розмір сітки (20x20 клітинок)
const CELL_SIZE = 25; // Розмір однієї клітинки в пікселях
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;
const GAME_SPEED = 150; // Швидкість гри в мілісекундах (менше = швидше)

// Напрямки руху
const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

// Кольори
const COLORS = {
  background: 0x1a1a1a,
  snake: 0x00ff00,
  snakeHead: 0x00cc00,
  food: 0xff0000,
  grid: 0x2a2a2a,
};

class SnakeGame {
  constructor() {
    // Створюємо додаток PixiJS
    this.app = new PIXI.Application({
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      backgroundColor: COLORS.background,
      antialias: true,
    });

    // Додаємо canvas до DOM
    document.getElementById('gameCanvas').appendChild(this.app.view);

    // Ініціалізація гри
    this.score = 0;
    this.gameOver = false;
    this.snake = [{ x: 10, y: 10 }]; // Початкова позиція змійки
    this.direction = DIRECTIONS.RIGHT;
    this.nextDirection = DIRECTIONS.RIGHT;
    this.food = null;

    // Контейнери для графіки
    this.snakeGraphics = [];
    this.foodGraphic = null;

    // Малюємо сітку
    this.drawGrid();

    // Створюємо першу їжу
    this.createFood();

    // Обробка клавіатури
    this.setupKeyboard();

    // Кнопка рестарту
    document.getElementById('restart-btn').addEventListener('click', () => {
      this.restart();
    });

    // Запускаємо ігровий цикл
    this.gameLoop();
  }

  drawGrid() {
    const grid = new PIXI.Graphics();
    grid.lineStyle(1, COLORS.grid, 0.3);

    // Вертикальні лінії
    for (let i = 0; i <= GRID_SIZE; i++) {
      grid.moveTo(i * CELL_SIZE, 0);
      grid.lineTo(i * CELL_SIZE, CANVAS_SIZE);
    }

    // Горизонтальні лінії
    for (let i = 0; i <= GRID_SIZE; i++) {
      grid.moveTo(0, i * CELL_SIZE);
      grid.lineTo(CANVAS_SIZE, i * CELL_SIZE);
    }

    this.app.stage.addChild(grid);
  }

  createFood() {
    // Знаходимо всі вільні клітинки
    const freeCells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isSnake = this.snake.some((segment) => segment.x === x && segment.y === y);
        if (!isSnake) {
          freeCells.push({ x, y });
        }
      }
    }

    // Випадково вибираємо вільну клітинку
    if (freeCells.length > 0) {
      this.food = freeCells[Math.floor(Math.random() * freeCells.length)];
    }
  }

  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (this.gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (this.direction !== DIRECTIONS.DOWN) {
            this.nextDirection = DIRECTIONS.UP;
          }
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (this.direction !== DIRECTIONS.UP) {
            this.nextDirection = DIRECTIONS.DOWN;
          }
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (this.direction !== DIRECTIONS.RIGHT) {
            this.nextDirection = DIRECTIONS.LEFT;
          }
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (this.direction !== DIRECTIONS.LEFT) {
            this.nextDirection = DIRECTIONS.RIGHT;
          }
          e.preventDefault();
          break;
      }
    });
  }

  gameLoop() {
    if (this.gameOver) return;

    setTimeout(() => {
      this.update();
      this.render();
      this.gameLoop();
    }, GAME_SPEED);
  }

  update() {
    // Оновлюємо напрямок
    this.direction = this.nextDirection;

    // Обчислюємо нову позицію голови
    const head = this.snake[0];
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y,
    };

    // Перевірка на зіткнення зі стінами
    if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
      this.endGame();
      return;
    }

    // Перевірка на зіткнення з собою
    const hitSelf = this.snake.some(
      (segment) => segment.x === newHead.x && segment.y === newHead.y
    );
    if (hitSelf) {
      this.endGame();
      return;
    }

    // Додаємо нову голову
    this.snake.unshift(newHead);

    // Перевірка на з'їдання їжі
    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += 10;
      this.updateScore();
      this.createFood();

      // Перевірка на перемогу
      if (this.snake.length === GRID_SIZE * GRID_SIZE) {
        this.winGame();
        return;
      }
    } else {
      // Видаляємо хвіст, якщо не з'їли їжу
      this.snake.pop();
    }
  }

  render() {
    // Видаляємо старі графічні об'єкти змійки
    this.snakeGraphics.forEach((graphic) => {
      this.app.stage.removeChild(graphic);
    });
    this.snakeGraphics = [];

    // Малюємо змійку
    this.snake.forEach((segment, index) => {
      const graphic = new PIXI.Graphics();
      const color = index === 0 ? COLORS.snakeHead : COLORS.snake;

      graphic.beginFill(color);
      graphic.drawRoundedRect(
        segment.x * CELL_SIZE + 2,
        segment.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4,
        4
      );
      graphic.endFill();

      this.app.stage.addChild(graphic);
      this.snakeGraphics.push(graphic);
    });

    // Видаляємо стару їжу
    if (this.foodGraphic) {
      this.app.stage.removeChild(this.foodGraphic);
    }

    // Малюємо їжу
    if (this.food) {
      this.foodGraphic = new PIXI.Graphics();
      this.foodGraphic.beginFill(COLORS.food);
      this.foodGraphic.drawCircle(
        this.food.x * CELL_SIZE + CELL_SIZE / 2,
        this.food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 4
      );
      this.foodGraphic.endFill();
      this.app.stage.addChild(this.foodGraphic);
    }
  }

  updateScore() {
    document.getElementById('score-value').textContent = this.score;
  }

  endGame() {
    this.gameOver = true;
    document.getElementById('game-status').textContent = '💀 Гра закінчена!';
    setTimeout(() => {
      alert(`Гра закінчена! Ваш рахунок: ${this.score}`);
    }, 100);
  }

  winGame() {
    this.gameOver = true;
    document.getElementById('game-status').textContent = '🏆 Ви перемогли!';
    setTimeout(() => {
      alert(`Вітаємо! Ви заповнили все поле! Рахунок: ${this.score}`);
    }, 100);
  }

  restart() {
    // Скидаємо стан гри
    this.score = 0;
    this.gameOver = false;
    this.snake = [{ x: 10, y: 10 }];
    this.direction = DIRECTIONS.RIGHT;
    this.nextDirection = DIRECTIONS.RIGHT;
    this.updateScore();
    document.getElementById('game-status').textContent = '';

    // Видаляємо всі графічні об'єкти
    this.snakeGraphics.forEach((graphic) => {
      this.app.stage.removeChild(graphic);
    });
    this.snakeGraphics = [];

    if (this.foodGraphic) {
      this.app.stage.removeChild(this.foodGraphic);
    }

    // Створюємо нову їжу
    this.createFood();

    // Рендеримо початковий стан
    this.render();

    // Перезапускаємо ігровий цикл
    this.gameLoop();
  }
}

// Запускаємо гру після завантаження сторінки
window.addEventListener('load', () => {
  new SnakeGame();
});
