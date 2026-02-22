# 🎮 Pixel Games Collection

Колекція класичних ігор на PixiJS з TypeScript та Nitro.

## 🎯 Доступні ігри

- **2048** - Класична гра-головоломка
- **Snake** - Класична змійка
- **Tetris** - Складайте падаючі блоки

## 🚀 Швидкий старт

### Встановлення

```bash
pnpm install
```

### Розробка

```bash
pnpm dev
```

Відкрийте [http://localhost:3000](http://localhost:3000)

### Білд

```bash
pnpm build
```

### Прев'ю продакшн білду

```bash
pnpm preview
```

## 🛠️ Скрипти

- `pnpm dev` - Запустити dev сервер
- `pnpm build` - Зібрати для продакшн
- `pnpm preview` - Прев'ю продакшн білду
- `pnpm lint` - Перевірити код через ESLint
- `pnpm lint:fix` - Виправити помилки ESLint
- `pnpm format` - Форматувати код через Prettier
- `pnpm format:check` - Перевірити форматування
- `pnpm typecheck` - Перевірити типи TypeScript
- `pnpm validate` - Запустити всі перевірки (lint + format + typecheck)

## 📦 Деплой на Cloudflare Pages

### Налаштування

1. Створіть обліковий запис на [Cloudflare](https://dash.cloudflare.com/)
2. Перейдіть до **Pages** > **Create a project**
3. Підключіть ваш GitHub репозиторій
4. Налаштуйте build:
   - **Build command**: `pnpm build`
   - **Build output directory**: `.output/public`
   - **Root directory**: `/`

### GitHub Secrets

Для автоматичного деплою через GitHub Actions додайте в налаштуваннях репозиторію:

1. `CLOUDFLARE_API_TOKEN` - API токен з Cloudflare
   - Отримати: Dashboard > Profile > API Tokens > Create Token
   - Права: Account - Cloudflare Pages:Edit

2. `CLOUDFLARE_ACCOUNT_ID` - ID вашого акаунту Cloudflare
   - Знайти: Dashboard > Workers & Pages > Overview (праворуч в URL)

### Автоматичний деплой

Після налаштування secrets, кожен push в `master`/`main` гілку автоматично деплоїться на Cloudflare Pages.

## 🧪 CI/CD

Проект має налаштований GitHub Actions для:

- ✅ Перевірки коду (linting)
- ✅ Перевірки форматування (prettier)
- ✅ Перевірки типів (TypeScript)
- ✅ Білду проекту
- 🚀 Автоматичного деплою на Cloudflare Pages

## 🏗️ Технології

- [Nitro](https://nitro.unjs.io/) - Фреймворк для серверу
- [PixiJS](https://pixijs.com/) - 2D WebGL рендерер
- [TypeScript](https://www.typescriptlang.org/) - Типізація
- [ESLint](https://eslint.org/) - Лінтинг
- [Prettier](https://prettier.io/) - Форматування коду
- [pnpm](https://pnpm.io/) - Менеджер пакетів

## 📝 Структура проекту

```
pixel-game-1/
├── .github/
│   └── workflows/      # GitHub Actions CI/CD
├── public/
│   └── games/          # Ігрові файли (JS)
│       ├── 2048/
│       ├── snake/
│       └── tetris/
├── routes/             # Nitro routes (TypeScript)
│   ├── index.ts        # Головна сторінка
│   └── games/
│       ├── 2048.ts
│       ├── snake.ts
│       └── tetris.ts
├── .prettierrc         # Налаштування Prettier
├── eslint.config.js    # Налаштування ESLint
├── nitro.config.ts     # Налаштування Nitro
├── tsconfig.json       # Налаштування TypeScript
└── wrangler.toml       # Налаштування Cloudflare
```

## 📄 Ліцензія

ISC
