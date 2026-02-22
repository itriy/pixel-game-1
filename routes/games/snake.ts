export default defineEventHandler(() => {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Змійка - PixiJS Game</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            font-family: 'Arial', sans-serif;
        }

        #game-container {
            text-align: center;
        }

        h1 {
            color: white;
            margin: 0 0 20px 0;
            font-size: 48px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        #score {
            color: white;
            font-size: 24px;
            margin-bottom: 15px;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }

        #gameCanvas {
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        #controls {
            margin-top: 20px;
            color: white;
            font-size: 16px;
        }

        button, .back-button {
            margin-top: 15px;
            padding: 12px 30px;
            font-size: 18px;
            background: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            transition: all 0.3s;
            text-decoration: none;
            color: #333;
            display: inline-block;
            margin: 15px 10px 0;
        }

        button:hover, .back-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(0,0,0,0.3);
        }

        button:active, .back-button:active {
            transform: translateY(0);
        }

        #game-status {
            color: white;
            font-size: 20px;
            font-weight: bold;
            margin-top: 10px;
            min-height: 30px;
        }
    </style>
</head>
<body>
    <div id="game-container">
        <h1>🐍 Змійка</h1>
        <div id="score">Рахунок: <span id="score-value">0</span></div>
        <div id="game-status"></div>
        <div id="gameCanvas"></div>
        <div id="controls">
            Використовуйте стрілки ←↑→↓ або WASD для керування
        </div>
        <div>
            <a href="/" class="back-button">← Назад до меню</a>
            <button id="restart-btn">Нова гра</button>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/pixi.js@7.4.2/dist/pixi.min.js"></script>
    <script src="/games/snake/game.js"></script>
</body>
</html>`;
});
