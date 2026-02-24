export default defineEventHandler(() => {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>⚔ Dungeon Dice - PixiJS Game</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cinzel:wght@400;700&family=IM+Fell+English:ital@0;1&display=swap');

        body {
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #0a0a0f;
            font-family: 'IM Fell English', serif;
            position: relative;
        }

        body::before {
            content: '';
            position: fixed;
            inset: 0;
            background: radial-gradient(ellipse at 20% 50%, rgba(201, 168, 76, 0.03) 0%, transparent 50%),
                        radial-gradient(ellipse at 80% 20%, rgba(139, 32, 32, 0.04) 0%, transparent 50%);
            pointer-events: none;
            z-index: 0;
        }

        #game-container {
            text-align: center;
            position: relative;
            z-index: 1;
        }

        h1 {
            color: #c9a84c;
            margin: 0 0 20px 0;
            font-size: 48px;
            font-family: 'Cinzel Decorative', serif;
            text-shadow: 0 0 40px rgba(201, 168, 76, 0.2);
            letter-spacing: 0.08em;
        }

        #description {
            color: #7a7568;
            font-size: 18px;
            margin-bottom: 20px;
            font-style: italic;
        }

        #gameCanvas {
            border-radius: 4px;
            box-shadow: 0 4px 40px rgba(0, 0, 0, 0.5);
        }

        button, .back-button {
            margin-top: 15px;
            padding: 12px 30px;
            font-size: 18px;
            font-family: 'Cinzel', serif;
            background: #8a7333;
            border: 1px solid #c9a84c;
            border-radius: 4px;
            cursor: pointer;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            transition: all 0.2s;
            text-decoration: none;
            color: #0a0a0f;
            display: inline-block;
            margin: 15px 10px 0;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            font-weight: 700;
        }

        button:hover, .back-button:hover {
            background: #c9a84c;
            transform: translateY(-2px);
            box-shadow: 0 0 20px rgba(201, 168, 76, 0.2);
        }

        button:active, .back-button:active {
            transform: translateY(0);
        }

        #instructions {
            color: #7a7568;
            font-size: 14px;
            margin-top: 20px;
            line-height: 1.6;
        }

        #seed-info {
            color: #c9a84c;
            font-size: 14px;
            margin-top: 10px;
            font-family: 'Cinzel', serif;
        }
    </style>
</head>
<body>
    <div id="game-container">
        <h1>⚔ Dungeon Dice ⚔</h1>
        <div id="description">Згенеруй карту та пройди підземелля!</div>
        <div id="gameCanvas"></div>
        <div id="seed-info"></div>
        <div id="instructions">
            <p>↑↓←→ або WASD — рух по підземеллю<br>
            Space — кинути кубик<br>
            P — використати зілля (+3 HP)</p>
        </div>
        <div>
            <a href="/" class="back-button">← Назад до меню</a>
            <button id="restart-btn" onclick="location.reload()">Нова гра</button>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/pixi.js@7.4.2/dist/pixi.min.js"></script>
    <script src="/games/dungeon-dice/game.js"></script>
</body>
</html>`;
});