// Налаштування гри
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SPEED = 5;
const BULLET_SPEED = 8;
const ENEMY_BULLET_SPEED = 4;
const ENEMY_ROWS = 5;
const ENEMY_COLS = 11;
const ENEMY_SPACING_X = 50;
const ENEMY_SPACING_Y = 40;
const ENEMY_START_Y = 60;
const ENEMY_MOVE_SPEED = 1;
const ENEMY_DROP_DISTANCE = 20;

// Кольори
const COLORS = {
  background: 0x000000,
  player: 0x00ff00,
  enemy: 0xff0000,
  enemyType2: 0xff6600,
  enemyType3: 0xffff00,
  playerBullet: 0x00ffff,
  enemyBullet: 0xff00ff,
  barrier: 0x00ff00,
  text: 0xffffff,
};

class SpaceInvadersGame {
  constructor() {
    // Створюємо додаток PixiJS
    this.app = new PIXI.Application({
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      backgroundColor: COLORS.background,
      antialias: true,
    });

    // Додаємо canvas до DOM
    document.getElementById('gameCanvas').appendChild(this.app.view);

    // Ініціалізація гри
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameOver = false;
    this.gameWon = false;

    // Об'єкти гри
    this.player = null;
    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.barriers = [];

    // Налаштування руху ворогів
    this.enemyDirection = 1; // 1 = вправо, -1 = вліво
    this.enemyMoveTimer = 0;
    this.enemyMoveInterval = 30; // Кадрів між рухами
    this.enemyShootTimer = 0;
    this.enemyShootInterval = 60;

    // Клавіатура
    this.keys = {
      left: false,
      right: false,
      space: false,
      spacePressed: false, // Для відстеження одиночного натискання
    };

    // Контейнери для графіки
    this.gameContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);

    // Створюємо гру
    this.init();

    // Обробка клавіатури
    this.setupKeyboard();

    // Кнопки управління
    document.getElementById('restart-btn').addEventListener('click', () => {
      this.restart();
    });

    // Запускаємо ігровий цикл
    this.app.ticker.add(() => this.gameLoop());
  }

  init() {
    this.createPlayer();
    this.createEnemies();
    this.createBarriers();
    this.updateUI();
  }

  createPlayer() {
    // Створюємо гравця (корабель)
    const player = new PIXI.Graphics();
    player.beginFill(COLORS.player);

    // Малюємо простий корабель
    player.moveTo(0, -15);
    player.lineTo(-15, 15);
    player.lineTo(-8, 15);
    player.lineTo(-8, 10);
    player.lineTo(8, 10);
    player.lineTo(8, 15);
    player.lineTo(15, 15);
    player.closePath();
    player.endFill();

    player.x = CANVAS_WIDTH / 2;
    player.y = CANVAS_HEIGHT - 50;

    this.player = player;
    this.gameContainer.addChild(player);
  }

  createEnemies() {
    const startX = (CANVAS_WIDTH - ENEMY_COLS * ENEMY_SPACING_X) / 2;

    for (let row = 0; row < ENEMY_ROWS; row++) {
      for (let col = 0; col < ENEMY_COLS; col++) {
        const enemy = new PIXI.Graphics();

        // Різні кольори для різних рядів
        let color = COLORS.enemy;
        let points = 10;
        if (row === 0) {
          color = COLORS.enemyType3;
          points = 30;
        } else if (row < 3) {
          color = COLORS.enemyType2;
          points = 20;
        }

        enemy.beginFill(color);

        // Малюємо інопланетянина (простий квадрат з виступами)
        enemy.drawRect(-12, -8, 24, 16);
        enemy.drawRect(-8, -12, 4, 4); // Ліве вухо
        enemy.drawRect(4, -12, 4, 4); // Праве вухо
        enemy.endFill();

        enemy.x = startX + col * ENEMY_SPACING_X;
        enemy.y = ENEMY_START_Y + row * ENEMY_SPACING_Y;
        enemy.points = points;
        enemy.alive = true;

        this.enemies.push(enemy);
        this.gameContainer.addChild(enemy);
      }
    }
  }

  createBarriers() {
    const barrierCount = 4;
    const barrierWidth = 60;
    const barrierHeight = 40;
    const spacing = (CANVAS_WIDTH - barrierCount * barrierWidth) / (barrierCount + 1);

    for (let i = 0; i < barrierCount; i++) {
      const barrier = new PIXI.Graphics();
      barrier.beginFill(COLORS.barrier);
      barrier.drawRect(0, 0, barrierWidth, barrierHeight);
      barrier.endFill();

      barrier.x = spacing + i * (barrierWidth + spacing);
      barrier.y = CANVAS_HEIGHT - 150;
      barrier.health = 10;

      this.barriers.push(barrier);
      this.gameContainer.addChild(barrier);
    }
  }

  setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (this.gameOver || this.gameWon) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.keys.left = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.keys.right = true;
          e.preventDefault();
          break;
        case ' ':
          this.keys.space = true;
          e.preventDefault();
          break;
      }
    });

    document.addEventListener('keyup', (e) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          this.keys.left = false;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          this.keys.right = false;
          break;
        case ' ':
          this.keys.space = false;
          this.keys.spacePressed = false;
          break;
      }
    });
  }

  gameLoop() {
    if (this.gameOver || this.gameWon) return;

    this.updatePlayer();
    this.updateEnemies();
    this.updateBullets();
    this.checkCollisions();
    this.updateEnemyShooting();

    // Перевірка умов перемоги/поразки
    if (this.checkWinCondition()) {
      this.winGame();
    } else if (this.checkLoseCondition()) {
      this.endGame();
    }
  }

  updatePlayer() {
    if (this.keys.left && this.player.x > 20) {
      this.player.x -= PLAYER_SPEED;
    }
    if (this.keys.right && this.player.x < CANVAS_WIDTH - 20) {
      this.player.x += PLAYER_SPEED;
    }

    // Стрільба
    if (this.keys.space && !this.keys.spacePressed) {
      this.shootPlayerBullet();
      this.keys.spacePressed = true;
    }
  }

  updateEnemies() {
    this.enemyMoveTimer++;

    if (this.enemyMoveTimer >= this.enemyMoveInterval) {
      this.enemyMoveTimer = 0;

      // Перевірка чи потрібно змінити напрямок
      let shouldDrop = false;
      const aliveEnemies = this.enemies.filter((e) => e.alive);

      for (const enemy of aliveEnemies) {
        const nextX = enemy.x + this.enemyDirection * ENEMY_MOVE_SPEED * 10;
        if (nextX < 20 || nextX > CANVAS_WIDTH - 20) {
          shouldDrop = true;
          break;
        }
      }

      if (shouldDrop) {
        // Опускаємо вниз і змінюємо напрямок
        this.enemyDirection *= -1;
        for (const enemy of aliveEnemies) {
          enemy.y += ENEMY_DROP_DISTANCE;
        }
      } else {
        // Рухаємо вліво/вправо
        for (const enemy of aliveEnemies) {
          enemy.x += this.enemyDirection * ENEMY_MOVE_SPEED * 10;
        }
      }
    }
  }

  updateBullets() {
    // Оновлюємо кулі гравця
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const bullet = this.playerBullets[i];
      bullet.y -= BULLET_SPEED;

      if (bullet.y < 0) {
        this.gameContainer.removeChild(bullet);
        this.playerBullets.splice(i, 1);
      }
    }

    // Оновлюємо кулі ворогів
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i];
      bullet.y += ENEMY_BULLET_SPEED;

      if (bullet.y > CANVAS_HEIGHT) {
        this.gameContainer.removeChild(bullet);
        this.enemyBullets.splice(i, 1);
      }
    }
  }

  checkCollisions() {
    // Кулі гравця vs вороги
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const bullet = this.playerBullets[i];

      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;

        const dx = bullet.x - enemy.x;
        const dy = bullet.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 20) {
          // Влучання!
          enemy.alive = false;
          this.gameContainer.removeChild(enemy);
          this.gameContainer.removeChild(bullet);
          this.playerBullets.splice(i, 1);
          this.score += enemy.points;
          this.updateUI();
          break;
        }
      }
    }

    // Кулі гравця vs барикади
    for (let i = this.playerBullets.length - 1; i >= 0; i--) {
      const bullet = this.playerBullets[i];

      for (let j = this.barriers.length - 1; j >= 0; j--) {
        const barrier = this.barriers[j];

        if (
          bullet.x > barrier.x &&
          bullet.x < barrier.x + 60 &&
          bullet.y > barrier.y &&
          bullet.y < barrier.y + 40
        ) {
          this.gameContainer.removeChild(bullet);
          this.playerBullets.splice(i, 1);
          barrier.health--;

          if (barrier.health <= 0) {
            this.gameContainer.removeChild(barrier);
            this.barriers.splice(j, 1);
          } else {
            barrier.alpha = barrier.health / 10;
          }
          break;
        }
      }
    }

    // Кулі ворогів vs гравець
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i];

      const dx = bullet.x - this.player.x;
      const dy = bullet.y - this.player.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 20) {
        this.gameContainer.removeChild(bullet);
        this.enemyBullets.splice(i, 1);
        this.loseLife();
        break;
      }
    }

    // Кулі ворогів vs барикади
    for (let i = this.enemyBullets.length - 1; i >= 0; i--) {
      const bullet = this.enemyBullets[i];

      for (let j = this.barriers.length - 1; j >= 0; j--) {
        const barrier = this.barriers[j];

        if (
          bullet.x > barrier.x &&
          bullet.x < barrier.x + 60 &&
          bullet.y > barrier.y &&
          bullet.y < barrier.y + 40
        ) {
          this.gameContainer.removeChild(bullet);
          this.enemyBullets.splice(i, 1);
          barrier.health--;

          if (barrier.health <= 0) {
            this.gameContainer.removeChild(barrier);
            this.barriers.splice(j, 1);
          } else {
            barrier.alpha = barrier.health / 10;
          }
          break;
        }
      }
    }
  }

  updateEnemyShooting() {
    this.enemyShootTimer++;

    if (this.enemyShootTimer >= this.enemyShootInterval) {
      this.enemyShootTimer = 0;

      // Випадковий ворог стріляє
      const aliveEnemies = this.enemies.filter((e) => e.alive);
      if (aliveEnemies.length > 0) {
        const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
        this.shootEnemyBullet(shooter.x, shooter.y);
      }
    }
  }

  shootPlayerBullet() {
    const bullet = new PIXI.Graphics();
    bullet.beginFill(COLORS.playerBullet);
    bullet.drawRect(-2, -8, 4, 16);
    bullet.endFill();

    bullet.x = this.player.x;
    bullet.y = this.player.y - 20;

    this.playerBullets.push(bullet);
    this.gameContainer.addChild(bullet);
  }

  shootEnemyBullet(x, y) {
    const bullet = new PIXI.Graphics();
    bullet.beginFill(COLORS.enemyBullet);
    bullet.drawCircle(0, 0, 3);
    bullet.endFill();

    bullet.x = x;
    bullet.y = y + 20;

    this.enemyBullets.push(bullet);
    this.gameContainer.addChild(bullet);
  }

  loseLife() {
    this.lives--;
    this.updateUI();

    if (this.lives <= 0) {
      this.endGame();
    } else {
      // Короткий flash ефект
      this.player.alpha = 0.5;
      setTimeout(() => {
        if (this.player) this.player.alpha = 1;
      }, 500);
    }
  }

  checkWinCondition() {
    return this.enemies.every((e) => !e.alive);
  }

  checkLoseCondition() {
    if (this.lives <= 0) return true;

    // Перевірка чи вороги дійшли до гравця
    for (const enemy of this.enemies) {
      if (enemy.alive && enemy.y > CANVAS_HEIGHT - 100) {
        return true;
      }
    }

    return false;
  }

  updateUI() {
    document.getElementById('score-value').textContent = this.score;
    document.getElementById('lives-value').textContent = this.lives;
    document.getElementById('level-value').textContent = this.level;
  }

  winGame() {
    this.gameWon = true;
    this.level++;
    document.getElementById('game-status').textContent = '🎉 Рівень пройдено!';

    setTimeout(() => {
      if (
        confirm(
          `Рівень ${this.level - 1} пройдено!\nРахунок: ${this.score}\n\nПродовжити до рівня ${this.level}?`
        )
      ) {
        this.nextLevel();
      } else {
        this.restart();
      }
    }, 100);
  }

  nextLevel() {
    // Очищаємо ворогів та кулі
    for (const enemy of this.enemies) {
      this.gameContainer.removeChild(enemy);
    }
    this.enemies = [];

    for (const bullet of [...this.playerBullets, ...this.enemyBullets]) {
      this.gameContainer.removeChild(bullet);
    }
    this.playerBullets = [];
    this.enemyBullets = [];

    // Збільшуємо складність
    this.enemyMoveInterval = Math.max(10, this.enemyMoveInterval - 3);
    this.enemyShootInterval = Math.max(30, this.enemyShootInterval - 5);

    // Створюємо нових ворогів
    this.createEnemies();

    this.gameWon = false;
    document.getElementById('game-status').textContent = '';
  }

  endGame() {
    this.gameOver = true;
    document.getElementById('game-status').textContent = '💀 Гра закінчена!';
    setTimeout(() => {
      alert(`Гра закінчена!\nРахунок: ${this.score}\nРівень: ${this.level}`);
    }, 100);
  }

  restart() {
    // Очищаємо все
    this.gameContainer.removeChildren();

    this.enemies = [];
    this.playerBullets = [];
    this.enemyBullets = [];
    this.barriers = [];

    // Скидаємо стан
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.gameOver = false;
    this.gameWon = false;
    this.enemyDirection = 1;
    this.enemyMoveTimer = 0;
    this.enemyMoveInterval = 30;
    this.enemyShootTimer = 0;
    this.enemyShootInterval = 60;

    document.getElementById('game-status').textContent = '';

    // Створюємо нову гру
    this.init();
  }
}

// Запускаємо гру після завантаження сторінки
window.addEventListener('load', () => {
  new SpaceInvadersGame();
});
