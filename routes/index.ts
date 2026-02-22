export default defineEventHandler(() => {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ігрова колекція</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Arial', sans-serif;
            padding: 20px;
        }

        .container {
            max-width: 800px;
            width: 100%;
        }

        h1 {
            text-align: center;
            color: white;
            font-size: 48px;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .subtitle {
            text-align: center;
            color: rgba(255, 255, 255, 0.9);
            font-size: 18px;
            margin-bottom: 40px;
        }

        .games-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
        }

        .game-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            cursor: pointer;
            text-decoration: none;
            color: inherit;
            display: block;
        }

        .game-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.4);
        }

        .game-icon {
            font-size: 64px;
            margin-bottom: 15px;
        }

        .game-title {
            font-size: 28px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }

        .game-description {
            font-size: 14px;
            color: #666;
            line-height: 1.5;
        }

        .coming-soon {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .coming-soon:hover {
            transform: none;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }

        .badge {
            display: inline-block;
            background: #f59563;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎮 Ігрова колекція</h1>
        <p class="subtitle">Виберіть гру, щоб почати грати</p>

        <div class="games-grid">
            <a href="/games/2048" class="game-card">
                <div class="game-icon">🎲</div>
                <div class="game-title">2048</div>
                <div class="game-description">
                    Класична гра-головоломка. Об'єднуйте плитки з однаковими числами, щоб досягти 2048!
                </div>
            </a>

            <a href="/games/snake" class="game-card">
                <div class="game-icon">🐍</div>
                <div class="game-title">Snake</div>
                <div class="game-description">
                    Класична змійка. Керуйте змійкою та збирайте їжу, не вдаряючись у стіни!
                </div>
            </a>

            <a href="/games/space-invaders" class="game-card">
                <div class="game-icon">👾</div>
                <div class="game-title">Space Invaders</div>
                <div class="game-description">
                    Рятуйте планету від інопланетного вторгнення!
                </div>
            </a>

            <a href="/games/tetris" class="game-card">
                <div class="game-icon">🧩</div>
                <div class="game-title">Tetris</div>
                <div class="game-description">
                    Складайте падаючі блоки в лінії та набирайте очки!
                </div>
            </a>
        </div>
    </div>
</body>
</html>`;
});
