// Налаштування гри
const GRID_SIZE = 4;
const TILE_SIZE = 100;
const TILE_MARGIN = 10;
const CANVAS_SIZE = GRID_SIZE * TILE_SIZE + (GRID_SIZE + 1) * TILE_MARGIN;

// Кольори для різних значень плиток
const TILE_COLORS = {
    2: 0xeee4da,
    4: 0xede0c8,
    8: 0xf2b179,
    16: 0xf59563,
    32: 0xf67c5f,
    64: 0xf65e3b,
    128: 0xedcf72,
    256: 0xedcc61,
    512: 0xedc850,
    1024: 0xedc53f,
    2048: 0xedc22e,
    default: 0xcdc1b4
};

// Кольори тексту
const TEXT_COLORS = {
    light: 0x776e65,
    dark: 0xf9f6f2
};

class Game2048 {
    constructor() {
        // Створюємо додаток PixiJS
        this.app = new PIXI.Application({
            width: CANVAS_SIZE,
            height: CANVAS_SIZE,
            backgroundColor: 0xbbada0,
            antialias: true
        });

        // Додаємо canvas до DOM
        document.getElementById('gameCanvas').appendChild(this.app.view);

        // Ініціалізуємо гру
        this.score = 0;
        this.grid = [];
        this.tiles = new Map();
        this.canMove = true;

        this.initGrid();
        this.drawGrid();
        this.addRandomTile();
        this.addRandomTile();
        this.render();

        // Обробка клавіатури
        this.setupKeyboard();

        // Кнопка рестарту
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
    }

    initGrid() {
        this.grid = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            this.grid[i] = [];
            for (let j = 0; j < GRID_SIZE; j++) {
                this.grid[i][j] = 0;
            }
        }
    }

    drawGrid() {
        // Малюємо фон сітки
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                const x = TILE_MARGIN + j * (TILE_SIZE + TILE_MARGIN);
                const y = TILE_MARGIN + i * (TILE_SIZE + TILE_MARGIN);

                const cell = new PIXI.Graphics();
                cell.beginFill(0xcdc1b4, 0.5);
                cell.drawRoundedRect(x, y, TILE_SIZE, TILE_SIZE, 5);
                cell.endFill();
                this.app.stage.addChild(cell);
            }
        }
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[row][col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    render() {
        // Видаляємо старі плитки
        this.tiles.forEach(tile => {
            this.app.stage.removeChild(tile.container);
        });
        this.tiles.clear();

        // Малюємо нові плитки
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                const value = this.grid[i][j];
                if (value !== 0) {
                    this.createTile(i, j, value);
                }
            }
        }

        // Оновлюємо рахунок
        document.getElementById('score-value').textContent = this.score;
    }

    createTile(row, col, value) {
        const x = TILE_MARGIN + col * (TILE_SIZE + TILE_MARGIN);
        const y = TILE_MARGIN + row * (TILE_SIZE + TILE_MARGIN);

        const container = new PIXI.Container();
        container.x = x;
        container.y = y;

        // Фон плитки
        const tile = new PIXI.Graphics();
        const color = TILE_COLORS[value] || TILE_COLORS.default;
        tile.beginFill(color);
        tile.drawRoundedRect(0, 0, TILE_SIZE, TILE_SIZE, 5);
        tile.endFill();

        // Текст
        const textColor = value <= 4 ? TEXT_COLORS.light : TEXT_COLORS.dark;
        const fontSize = value >= 1000 ? 32 : value >= 100 ? 40 : 48;

        const text = new PIXI.Text(value.toString(), {
            fontFamily: 'Arial',
            fontSize: fontSize,
            fontWeight: 'bold',
            fill: textColor,
            align: 'center'
        });
        text.anchor.set(0.5);
        text.x = TILE_SIZE / 2;
        text.y = TILE_SIZE / 2;

        container.addChild(tile);
        container.addChild(text);
        this.app.stage.addChild(container);

        this.tiles.set(`${row}-${col}`, { container, value });
    }

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            if (!this.canMove) return;

            let moved = false;
            switch (e.key) {
                case 'ArrowUp':
                    moved = this.moveUp();
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    moved = this.moveDown();
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                    moved = this.moveLeft();
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    moved = this.moveRight();
                    e.preventDefault();
                    break;
            }

            if (moved) {
                this.canMove = false;
                setTimeout(() => {
                    this.addRandomTile();
                    this.render();
                    this.canMove = true;

                    if (this.checkGameOver()) {
                        alert('Гра закінчена! Ваш рахунок: ' + this.score);
                    } else if (this.checkWin()) {
                        alert('Вітаємо! Ви досягли 2048! Рахунок: ' + this.score);
                    }
                }, 150);
                this.render();
            }
        });
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < GRID_SIZE; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            const newRow = [];

            for (let j = 0; j < row.length; j++) {
                if (j < row.length - 1 && row[j] === row[j + 1]) {
                    newRow.push(row[j] * 2);
                    this.score += row[j] * 2;
                    j++;
                } else {
                    newRow.push(row[j]);
                }
            }

            while (newRow.length < GRID_SIZE) {
                newRow.push(0);
            }

            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < GRID_SIZE; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            const newRow = [];

            for (let j = row.length - 1; j >= 0; j--) {
                if (j > 0 && row[j] === row[j - 1]) {
                    newRow.unshift(row[j] * 2);
                    this.score += row[j] * 2;
                    j--;
                } else {
                    newRow.unshift(row[j]);
                }
            }

            while (newRow.length < GRID_SIZE) {
                newRow.unshift(0);
            }

            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let j = 0; j < GRID_SIZE; j++) {
            const col = [];
            for (let i = 0; i < GRID_SIZE; i++) {
                if (this.grid[i][j] !== 0) {
                    col.push(this.grid[i][j]);
                }
            }

            const newCol = [];
            for (let i = 0; i < col.length; i++) {
                if (i < col.length - 1 && col[i] === col[i + 1]) {
                    newCol.push(col[i] * 2);
                    this.score += col[i] * 2;
                    i++;
                } else {
                    newCol.push(col[i]);
                }
            }

            while (newCol.length < GRID_SIZE) {
                newCol.push(0);
            }

            for (let i = 0; i < GRID_SIZE; i++) {
                if (this.grid[i][j] !== newCol[i]) {
                    moved = true;
                }
                this.grid[i][j] = newCol[i];
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let j = 0; j < GRID_SIZE; j++) {
            const col = [];
            for (let i = 0; i < GRID_SIZE; i++) {
                if (this.grid[i][j] !== 0) {
                    col.push(this.grid[i][j]);
                }
            }

            const newCol = [];
            for (let i = col.length - 1; i >= 0; i--) {
                if (i > 0 && col[i] === col[i - 1]) {
                    newCol.unshift(col[i] * 2);
                    this.score += col[i] * 2;
                    i--;
                } else {
                    newCol.unshift(col[i]);
                }
            }

            while (newCol.length < GRID_SIZE) {
                newCol.unshift(0);
            }

            for (let i = 0; i < GRID_SIZE; i++) {
                if (this.grid[i][j] !== newCol[i]) {
                    moved = true;
                }
                this.grid[i][j] = newCol[i];
            }
        }
        return moved;
    }

    checkGameOver() {
        // Перевіряємо чи є порожні клітинки
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (this.grid[i][j] === 0) return false;
            }
        }

        // Перевіряємо чи можливі об'єднання
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                const current = this.grid[i][j];
                if (j < GRID_SIZE - 1 && current === this.grid[i][j + 1]) return false;
                if (i < GRID_SIZE - 1 && current === this.grid[i + 1][j]) return false;
            }
        }

        return true;
    }

    checkWin() {
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (this.grid[i][j] === 2048) return true;
            }
        }
        return false;
    }

    restart() {
        this.score = 0;
        this.canMove = true;
        this.initGrid();

        // Очищаємо stage
        this.app.stage.removeChildren();

        // Перемалювуємо все
        this.drawGrid();
        this.addRandomTile();
        this.addRandomTile();
        this.render();
    }
}

// Запускаємо гру після завантаження сторінки
window.addEventListener('load', () => {
    new Game2048();
});