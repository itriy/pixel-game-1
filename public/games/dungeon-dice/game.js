// ========== Dungeon Dice — PixiJS Implementation ==========

// ========== RNG ==========
class RNG {
  constructor(s) {
    this.s = s % 2147483647;
    if (this.s <= 0) this.s += 2147483646;
  }
  next() {
    this.s = (this.s * 16807) % 2147483647;
    return (this.s - 1) / 2147483646;
  }
  int(a, b) {
    return Math.floor(this.next() * (b - a + 1)) + a;
  }
  pick(a) {
    return a[this.int(0, a.length - 1)];
  }
  bool(p = 0.5) {
    return this.next() < p;
  }
}

// ========== CONSTANTS ==========
const R = {
  EMPTY: 0,
  NORMAL: 1,
  MONSTER: 2,
  CHEST: 3,
  TRAP: 4,
  BOSS: 5,
  START: 6,
  LOOT: 7,
  HEAL: 8,
};
const DICE = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

const MONSTERS = {
  dungeon: [
    { name: 'Скелет', hp: 2, icon: '💀' },
    { name: 'Гоблін', hp: 2, icon: '👺' },
    { name: 'Орк', hp: 3, icon: '👹' },
    { name: 'Слизняк', hp: 1, icon: '🟢' },
    { name: 'Кажан', hp: 1, icon: '🦇' },
  ],
  cave: [
    { name: 'Павук', hp: 2, icon: '🕷' },
    { name: 'Троль', hp: 4, icon: '👹' },
    { name: 'Кажан', hp: 1, icon: '🦇' },
    { name: 'Вовк', hp: 2, icon: '🐺' },
    { name: 'Слизняк', hp: 1, icon: '🟢' },
  ],
  castle: [
    { name: 'Лицар', hp: 3, icon: '⚔' },
    { name: 'Привид', hp: 2, icon: '👻' },
    { name: 'Гаргулія', hp: 3, icon: '🗿' },
    { name: 'Страж', hp: 2, icon: '💂' },
    { name: 'Маг', hp: 2, icon: '🧙' },
  ],
  garden: [
    { name: 'Ент', hp: 3, icon: '🌳' },
    { name: 'Вовк', hp: 2, icon: '🐺' },
    { name: 'Фея', hp: 1, icon: '🧚' },
    { name: 'Змія', hp: 2, icon: '🐍' },
    { name: 'Жук', hp: 1, icon: '🪲' },
  ],
  crypt: [
    { name: 'Зомбі', hp: 2, icon: '🧟' },
    { name: 'Привид', hp: 2, icon: '👻' },
    { name: 'Скелет', hp: 2, icon: '💀' },
    { name: 'Ліч', hp: 3, icon: '☠' },
    { name: 'Мумія', hp: 3, icon: '🧌' },
  ],
};

const BOSSES = {
  dungeon: { name: 'Дракон', hp: 10, dmg: 2, icon: '🐉' },
  cave: { name: 'Павук-Матка', hp: 8, dmg: 2, icon: '🕸' },
  castle: { name: 'Темний Лицар', hp: 10, dmg: 2, icon: '⚔' },
  garden: { name: 'Древній Ент', hp: 8, dmg: 2, icon: '🌲' },
  crypt: { name: 'Некромант', hp: 12, dmg: 3, icon: '💀' },
};

const TNAME = {
  dungeon: 'Підземелля',
  cave: 'Печери',
  castle: 'Замок',
  garden: 'Сад',
  crypt: 'Крипта',
};

// Weapon tiers
const WEAPONS = [
  { name: 'Палиця', icon: '🪵', atk: 0, tier: 0 },
  { name: 'Іржавий меч', icon: '🗡️', atk: 1, tier: 1 },
  { name: 'Сталевий меч', icon: '⚔️', atk: 2, tier: 2 },
  { name: 'Вогняний меч', icon: '🔥', atk: 3, tier: 3 },
  { name: 'Легендарний меч', icon: '⚡', atk: 4, tier: 4 },
];

// Shield tiers
const SHIELDS = [
  null,
  { name: "Дерев'яний щит", icon: '🪵', armor: 2, tier: 1 },
  { name: 'Залізний щит', icon: '🛡️', armor: 4, tier: 2 },
  { name: 'Магічний щит', icon: '✨', armor: 6, tier: 3 },
];

const THEME_COLORS = {
  dungeon: { floor: 0xfaf8f0, wall: 0x222222 },
  cave: { floor: 0xede4d4, wall: 0x222222 },
  castle: { floor: 0xeae5d8, wall: 0x222222 },
  garden: { floor: 0xeaf2e0, wall: 0x222222 },
  crypt: { floor: 0xe4e0da, wall: 0x222222 },
};

// ========== GAME STATE ==========
let app, G, stage;
let mapContainer, hudContainer, gameOverContainer, diceButton;
let logTexts = [];

// ========== DUNGEON GENERATION ==========
function genDungeon(rng, cols, rows, diff, theme) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  const data = Array.from({ length: rows }, () => Array(cols).fill(null));
  const doors = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ r: false, d: false }))
  );

  // DFS maze
  const vis = Array.from({ length: rows }, () => Array(cols).fill(false));
  const st = [[0, 0]];
  vis[0][0] = true;
  while (st.length) {
    const [cr, cc] = st[st.length - 1],
      nb = [];
    if (cr > 0 && !vis[cr - 1][cc]) nb.push([cr - 1, cc, 'u']);
    if (cr < rows - 1 && !vis[cr + 1][cc]) nb.push([cr + 1, cc, 'd']);
    if (cc > 0 && !vis[cr][cc - 1]) nb.push([cr, cc - 1, 'l']);
    if (cc < cols - 1 && !vis[cr][cc + 1]) nb.push([cr, cc + 1, 'r']);
    if (!nb.length) {
      st.pop();
      continue;
    }
    const [nr, nc, dir] = rng.pick(nb);
    vis[nr][nc] = true;
    if (dir === 'r') doors[cr][cc].r = true;
    else if (dir === 'd') doors[cr][cc].d = true;
    else if (dir === 'l') doors[nr][nc].r = true;
    else doors[nr][nc].d = true;
    st.push([nr, nc]);
  }
  // Extra connections
  for (let i = 0; i < Math.floor(cols * rows * 0.25); i++) {
    const r = rng.int(0, rows - 1),
      c = rng.int(0, cols - 1);
    if (rng.bool() && c < cols - 1) doors[r][c].r = true;
    else if (r < rows - 1) doors[r][c].d = true;
  }

  // BFS distance from start for scaling
  const dist = Array.from({ length: rows }, () => Array(cols).fill(-1));
  dist[0][0] = 0;
  const bq = [[0, 0]];
  let bi = 0;
  while (bi < bq.length) {
    const [br, bc] = bq[bi++];
    const tryD = (nr, nc) => {
      if (
        nr >= 0 &&
        nr < rows &&
        nc >= 0 &&
        nc < cols &&
        dist[nr][nc] === -1
      ) {
        dist[nr][nc] = dist[br][bc] + 1;
        bq.push([nr, nc]);
      }
    };
    if (doors[br][bc].r) tryD(br, bc + 1);
    if (bc > 0 && doors[br][bc - 1].r) tryD(br, bc - 1);
    if (doors[br][bc].d) tryD(br + 1, bc);
    if (br > 0 && doors[br - 1][bc].d) tryD(br - 1, bc);
  }
  const maxDist = Math.max(...bq.map(([r, c]) => dist[r][c]));

  grid[0][0] = R.START;
  grid[rows - 1][cols - 1] = R.BOSS;
  const boss = BOSSES[theme];
  data[rows - 1][cols - 1] = {
    ...boss,
    maxHp: boss.hp,
    armor: diff === 'hard' ? 3 : 2,
  };

  const mCh = diff === 'easy' ? 0.18 : diff === 'hard' ? 0.35 : 0.25;
  const tCh = diff === 'easy' ? 0.05 : diff === 'hard' ? 0.12 : 0.08;
  const rng2 = new RNG(rng.int(1, 99999));
  const mons = MONSTERS[theme];

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (grid[r][c]) continue;
      const v = rng.next();
      const zone = maxDist > 0 ? dist[r][c] / maxDist : 0;

      if (v < mCh) {
        grid[r][c] = R.MONSTER;
        const m = { ...rng2.pick(mons) };
        if (zone > 0.6) {
          m.hp += 2;
          m.dmg = (m.dmg || 1) + 1;
          m.armor = rng2.int(1, 2);
          m.name = '💪 ' + m.name;
        } else if (zone > 0.35) {
          m.hp += 1;
          m.dmg = m.dmg || 1;
          m.armor = rng2.bool(0.4) ? 1 : 0;
        } else {
          m.dmg = m.dmg || 1;
          m.armor = 0;
        }
        m.maxHp = m.hp;
        data[r][c] = m;
      } else if (v < mCh + tCh) {
        grid[r][c] = R.TRAP;
        data[r][c] = { dmg: zone > 0.6 ? 3 : 2 };
      } else if (v < mCh + tCh + 0.12) grid[r][c] = R.CHEST;
      else if (v < mCh + tCh + 0.26) {
        grid[r][c] = R.LOOT;
        const roll = rng2.next();
        if (roll < 0.35) {
          // Weapon
          const tier =
            zone > 0.65 ? rng2.int(2, 3) : zone > 0.3 ? rng2.int(1, 2) : 1;
          const w = WEAPONS[Math.min(tier, WEAPONS.length - 1)];
          data[r][c] = { type: 'weapon', lootTier: tier, ...w };
        } else if (roll < 0.65) {
          // Shield
          const tier =
            zone > 0.65 ? rng2.int(2, 3) : zone > 0.3 ? rng2.int(1, 2) : 1;
          const s = SHIELDS[Math.min(tier, SHIELDS.length - 1)];
          data[r][c] = { type: 'shield', lootTier: tier, ...s };
        } else {
          // Luck talisman
          data[r][c] = {
            type: 'luck',
            icon: '🍀',
            name: 'Талісман',
            desc: '🍀+1',
          };
        }
      } else if (v < mCh + tCh + 0.38) grid[r][c] = R.HEAL;
      else grid[r][c] = R.NORMAL;
    }
  return { grid, data, doors, cols, rows };
}

// ========== CAN MOVE ==========
function canMove(dr, dc) {
  const { pr, pc, dun } = G,
    { doors, cols, rows } = dun;
  const nr = pr + dr,
    nc = pc + dc;
  if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) return false;
  if (dc === 1) return doors[pr][pc].r;
  if (dc === -1) return doors[pr][nc].r;
  if (dr === 1) return doors[pr][pc].d;
  if (dr === -1) return doors[nr][pc].d;
  return false;
}

// ========== REVEAL FOG OF WAR ==========
function revealAround() {
  const { pr, pc, dun } = G,
    { doors, cols, rows } = dun;
  G.revealed[pr][pc] = 2;
  if (pc < cols - 1 && doors[pr][pc].r && G.revealed[pr][pc + 1] < 2)
    G.revealed[pr][pc + 1] = Math.max(G.revealed[pr][pc + 1], 1);
  if (pc > 0 && doors[pr][pc - 1].r && G.revealed[pr][pc - 1] < 2)
    G.revealed[pr][pc - 1] = Math.max(G.revealed[pr][pc - 1], 1);
  if (pr < rows - 1 && doors[pr][pc].d && G.revealed[pr + 1][pc] < 2)
    G.revealed[pr + 1][pc] = Math.max(G.revealed[pr + 1][pc], 1);
  if (pr > 0 && doors[pr - 1][pc].d && G.revealed[pr - 1][pc] < 2)
    G.revealed[pr - 1][pc] = Math.max(G.revealed[pr - 1][pc], 1);
}

// ========== RENDER GRID ==========
function renderGrid() {
  revealAround();
  mapContainer.removeChildren();

  const { dun, theme, pr, pc } = G;
  const { grid, data, doors, cols, rows } = dun;

  const cellSize = Math.min(60, Math.floor(500 / cols));
  const border = 2;

  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const x = c * cellSize;
      const y = r * cellSize;
      const t = grid[r][c],
        cd = data[r][c];
      const isP = r === pr && c === pc;
      const rev = G.revealed[r][c];

      // Cell background
      const cell = new PIXI.Graphics();
      if (rev === 0) {
        cell.beginFill(0x1a1a2e);
      } else if (rev === 1) {
        cell.beginFill(0x2a2a3e);
      } else {
        const col = THEME_COLORS[theme].floor;
        cell.beginFill(col);
        if (t === R.BOSS) cell.beginFill(col * 0.85);
      }
      cell.drawRect(x, y, cellSize, cellSize);
      cell.endFill();

      // Border
      cell.lineStyle(border, THEME_COLORS[theme].wall);
      cell.drawRect(x, y, cellSize, cellSize);
      mapContainer.addChild(cell);

      // Doors
      if (rev >= 1) {
        if (doors[r][c].r && c < cols - 1) {
          const door = new PIXI.Graphics();
          door.beginFill(THEME_COLORS[theme].floor);
          door.drawRect(x + cellSize - border, y + cellSize * 0.35, border, cellSize * 0.3);
          door.endFill();
          mapContainer.addChild(door);
        }
        if (doors[r][c].d && r < rows - 1) {
          const door = new PIXI.Graphics();
          door.beginFill(THEME_COLORS[theme].floor);
          door.drawRect(x + cellSize * 0.35, y + cellSize - border, cellSize * 0.3, border);
          door.endFill();
          mapContainer.addChild(door);
        }
      }

      // Player token
      if (isP && rev >= 2) {
        const player = new PIXI.Text('🧙', {
          fontSize: cellSize * 0.5,
          fill: 0xffffff,
        });
        player.anchor.set(0.5);
        player.x = x + cellSize / 2;
        player.y = y + cellSize * 0.25;
        mapContainer.addChild(player);
      }

      // Cell content
      if (rev >= 2) {
        const opacity = G.clr[r][c] ? 0.3 : 1;
        let icon = '';
        let name = '';
        let stats = '';

        switch (t) {
          case R.START:
            icon = '🚪';
            name = 'СТАРТ';
            break;
          case R.BOSS:
            icon = cd.icon;
            name = cd.name;
            stats = `HP:${cd.hp}/${cd.maxHp}${cd.armor ? ' 🛡' + cd.armor : ''}`;
            break;
          case R.MONSTER:
            icon = cd.icon;
            name = cd.name;
            stats = `HP:${cd.hp}/${cd.maxHp}${cd.armor ? ' 🛡' + cd.armor : ''}`;
            break;
          case R.CHEST:
            icon = '📦';
            name = 'СКРИНЯ';
            break;
          case R.TRAP:
            icon = '⚠️';
            name = 'ПАСТКА';
            break;
          case R.LOOT:
            icon = cd.icon;
            name = cd.name;
            stats =
              cd.type === 'weapon'
                ? '⚔' + cd.atk
                : cd.type === 'luck'
                  ? '🍀+1'
                  : '🛡+' + cd.armor;
            break;
          case R.HEAL:
            icon = '🧪';
            name = 'ЗІЛЛЯ';
            stats = '+3 HP';
            break;
          case R.NORMAL:
            icon = '·';
            break;
        }

        if (icon) {
          const iconText = new PIXI.Text(icon, {
            fontSize: cellSize * 0.4,
            fill: 0x000000,
            alpha: opacity,
          });
          iconText.anchor.set(0.5);
          iconText.x = x + cellSize / 2;
          iconText.y = y + cellSize * 0.35;
          mapContainer.addChild(iconText);
        }

        if (name) {
          const nameText = new PIXI.Text(name, {
            fontSize: cellSize * 0.13,
            fill: 0x000000,
            fontWeight: 'bold',
            alpha: opacity,
          });
          nameText.anchor.set(0.5);
          nameText.x = x + cellSize / 2;
          nameText.y = y + cellSize * 0.65;
          mapContainer.addChild(nameText);
        }

        if (stats) {
          const statsText = new PIXI.Text(stats, {
            fontSize: cellSize * 0.11,
            fill: 0x444444,
            alpha: opacity,
          });
          statsText.anchor.set(0.5);
          statsText.x = x + cellSize / 2;
          statsText.y = y + cellSize * 0.8;
          mapContainer.addChild(statsText);
        }
      } else if (rev === 1) {
        // Adjacent — show only icon dimly
        let icon = '';
        switch (t) {
          case R.BOSS:
            icon = cd.icon;
            break;
          case R.MONSTER:
            icon = cd.icon;
            break;
          case R.CHEST:
            icon = '📦';
            break;
          case R.TRAP:
            icon = '❓';
            break;
          case R.LOOT:
            icon = cd.icon;
            break;
          case R.HEAL:
            icon = '🧪';
            break;
          default:
            icon = '❓';
            break;
        }

        if (icon) {
          const iconText = new PIXI.Text(icon, {
            fontSize: cellSize * 0.4,
            fill: 0xffffff,
            alpha: 0.4,
          });
          iconText.anchor.set(0.5);
          iconText.x = x + cellSize / 2;
          iconText.y = y + cellSize * 0.5;
          mapContainer.addChild(iconText);
        }
      }
    }

  mapContainer.x = 50;
  mapContainer.y = 100;
}

// ========== HUD ==========
function updateHUD() {
  hudContainer.removeChildren();

  const hudX = 650;
  const hudY = 100;

  // Title
  const title = new PIXI.Text('🧙 Герой', {
    fontSize: 28,
    fill: 0xc9a84c,
    fontFamily: 'Arial',
    fontWeight: 'bold',
  });
  title.x = hudX;
  title.y = hudY;
  hudContainer.addChild(title);

  // HP Bar
  const hpLabel = new PIXI.Text(`❤ HP: ${G.hp}/${G.maxHp}`, {
    fontSize: 16,
    fill: 0xffffff,
  });
  hpLabel.x = hudX;
  hpLabel.y = hudY + 50;
  hudContainer.addChild(hpLabel);

  for (let i = 0; i < G.maxHp; i++) {
    const pip = new PIXI.Graphics();
    if (i < G.hp) {
      pip.beginFill(0xcc4444);
    } else {
      pip.beginFill(0x333333);
    }
    pip.drawRect(hudX + i * 18, hudY + 75, 15, 15);
    pip.endFill();
    hudContainer.addChild(pip);
  }

  // Armor Bar
  if (G.maxArmor > 0) {
    const armorLabel = new PIXI.Text(`🛡 Броня: ${G.armor}/${G.maxArmor}`, {
      fontSize: 16,
      fill: 0xffffff,
    });
    armorLabel.x = hudX;
    armorLabel.y = hudY + 100;
    hudContainer.addChild(armorLabel);

    for (let i = 0; i < G.maxArmor; i++) {
      const pip = new PIXI.Graphics();
      if (i < G.armor) {
        pip.beginFill(0x4a8fbf);
      } else {
        pip.beginFill(0x333333);
      }
      pip.drawRect(hudX + i * 18, hudY + 125, 15, 12);
      pip.endFill();
      hudContainer.addChild(pip);
    }
  }

  // Weapon
  const weaponText = new PIXI.Text(
    `${G.weapon.icon} ${G.weapon.name} (⚔${G.weapon.atk})`,
    { fontSize: 16, fill: 0xc9a84c }
  );
  weaponText.x = hudX;
  weaponText.y = hudY + 160;
  hudContainer.addChild(weaponText);

  // Stats
  const stats = new PIXI.Text(
    `💰 Золото: ${G.gold}\n🧪 Зілля: ${G.pot}\n🍀 Вдача: ${G.luck}`,
    { fontSize: 16, fill: 0xffffff, lineHeight: 24 }
  );
  stats.x = hudX;
  stats.y = hudY + 190;
  hudContainer.addChild(stats);

  // Dice display
  const diceResult = new PIXI.Text(G.diceResult || '🎲', {
    fontSize: 48,
    fill: 0xc9a84c,
  });
  diceResult.x = hudX + 80;
  diceResult.y = hudY + 280;
  hudContainer.addChild(diceResult);

  // Dice label
  const diceLabel = new PIXI.Text(G.diceLabel || 'Рухайся стрілками', {
    fontSize: 14,
    fill: 0xaaaaaa,
    wordWrap: true,
    wordWrapWidth: 250,
  });
  diceLabel.x = hudX;
  diceLabel.y = hudY + 350;
  hudContainer.addChild(diceLabel);

  // Dice button
  if (!diceButton) {
    diceButton = new PIXI.Graphics();
    diceButton.interactive = true;
    diceButton.buttonMode = true;
    diceButton.on('pointerdown', rollDice);
  }
  diceButton.clear();
  if (G.state === 'dice') {
    diceButton.beginFill(0x8a7333);
    diceButton.alpha = 1;
  } else {
    diceButton.beginFill(0x333333);
    diceButton.alpha = 0.5;
  }
  diceButton.drawRoundedRect(hudX, hudY + 380, 200, 40, 5);
  diceButton.endFill();

  const btnText = new PIXI.Text('Кинути кубик', {
    fontSize: 16,
    fill: 0xffffff,
  });
  btnText.x = hudX + 40;
  btnText.y = hudY + 390;

  hudContainer.addChild(diceButton);
  hudContainer.addChild(btnText);

  // Log
  const logBg = new PIXI.Graphics();
  logBg.beginFill(0x13131d);
  logBg.drawRect(hudX, hudY + 440, 300, 200);
  logBg.endFill();
  hudContainer.addChild(logBg);

  for (let i = 0; i < Math.min(8, logTexts.length); i++) {
    const entry = logTexts[logTexts.length - 1 - i];
    const logEntry = new PIXI.Text(entry.msg, {
      fontSize: 12,
      fill: entry.color || 0xffffff,
      wordWrap: true,
      wordWrapWidth: 290,
    });
    logEntry.x = hudX + 5;
    logEntry.y = hudY + 445 + i * 24;
    hudContainer.addChild(logEntry);
  }

  // Controls hint
  const hint = new PIXI.Text('↑↓←→ або WASD — рух\nSpace — кубик\nP — зілля', {
    fontSize: 12,
    fill: 0x7a7568,
    lineHeight: 18,
  });
  hint.x = hudX;
  hint.y = hudY + 650;
  hudContainer.addChild(hint);
}

// ========== LOGGING ==========
function log(msg, cls = 'info') {
  const colors = {
    info: 0xaaaaaa,
    dmg: 0xee6666,
    heal: 0x66cc66,
    loot: 0xc9a84c,
    win: 0xc9a84c,
    luck: 0xdd44aa,
  };
  logTexts.push({ msg, color: colors[cls] || 0xffffff });
  if (logTexts.length > 20) logTexts.shift();
  updateHUD();
}

// ========== DICE ==========
let _diceCb = null,
  _diceAnim = false;

function enableDice(label, cb) {
  G.state = 'dice';
  _diceCb = cb;
  G.diceLabel = label;
  updateHUD();
}

function disableDice() {
  G.state = 'move';
  G.diceLabel = 'Рухайся стрілками ↑↓←→';
  updateHUD();
}

function rollDice() {
  if (!_diceCb || _diceAnim || !G || G.state !== 'dice') return;
  _diceAnim = true;

  let t = 0;
  const iv = setInterval(() => {
    G.diceResult = DICE[Math.floor(Math.random() * 6)];
    updateHUD();
    t++;
    if (t >= 14) {
      clearInterval(iv);
      const val = Math.floor(Math.random() * 6) + 1;
      G.diceResult = DICE[val - 1] + ' ' + val;
      updateHUD();
      _diceAnim = false;
      const cb = _diceCb;
      _diceCb = null;
      disableDice();
      cb(val);
    }
  }, 70);
}

// ========== DAMAGE & ARMOR ==========
function addArmor(amount) {
  G.armor += amount;
  G.maxArmor = Math.max(G.maxArmor, G.armor);
}

function takeDmg(amount) {
  let remaining = amount;
  const armorLost = Math.min(remaining, G.armor);
  G.armor -= armorLost;
  remaining -= armorLost;
  G.hp -= remaining;
  let msg = `−${amount}`;
  if (armorLost > 0 && remaining > 0)
    msg += ` (🛡−${armorLost} ❤−${remaining})`;
  else if (armorLost > 0) msg += ` (🛡−${armorLost})`;
  else msg += ` ❤`;
  return msg;
}

// ========== LUCK ==========
function checkLuck() {
  if (G.luck <= 0) return false;
  return Math.random() * 10 < G.luck;
}

// ========== ENTER CELL ==========
function enterCell() {
  const { pr: r, pc: c, dun } = G;
  const t = dun.grid[r][c],
    cd = dun.data[r][c];
  G.vis[r][c] = true;
  G.revealed[r][c] = 2;

  if (
    G.clr[r][c] ||
    t === R.START ||
    t === R.NORMAL ||
    t === R.EMPTY
  ) {
    renderGrid();
    return;
  }

  renderGrid();

  switch (t) {
    case R.MONSTER:
      combat(r, c, cd, cd.dmg || 1);
      break;
    case R.BOSS:
      combat(r, c, cd, cd.dmg);
      break;
    case R.TRAP:
      doTrap(r, c);
      break;
    case R.CHEST:
      doChest(r, c);
      break;
    case R.LOOT:
      doLoot(r, c, cd);
      break;
    case R.HEAL:
      doHeal(r, c);
      break;
  }
}

// ========== COMBAT ==========
function combat(r, c, mon, dmg) {
  const isBoss = G.dun.grid[r][c] === R.BOSS;
  log(
    `⚔ ${mon.name}! HP:${mon.hp}${mon.armor ? ' 🛡' + mon.armor : ''} ${isBoss ? 'DMG:' + dmg : ''}`,
    'dmg'
  );
  combatRound(r, c, mon, dmg);
}

function combatRound(r, c, mon, dmg) {
  if (mon.hp <= 0) {
    combatWin(r, c, mon);
    return;
  }
  const atkLabel = G.weapon.atk
    ? ` [${G.weapon.name} +${G.weapon.atk}]`
    : '';
  enableDice(
    `⚔ ${mon.name} HP:${mon.hp}${mon.armor ? ' 🛡' + mon.armor : ''}${atkLabel} — Кидай!`,
    (val) => {
      const eff = val + G.weapon.atk;
      if (eff >= 4) {
        // Player hits
        let hitDmg = 1;
        const lucky = checkLuck();
        if (lucky) hitDmg += 1;
        let armMsg = '';
        if (mon.armor && mon.armor > 0) {
          const armAbs = Math.min(hitDmg, mon.armor);
          mon.armor -= armAbs;
          hitDmg -= armAbs;
          if (armAbs > 0) armMsg = ` 🛡−${armAbs}`;
        }
        mon.hp -= hitDmg;
        let m = `🎲${val}${G.weapon.atk ? '+' + G.weapon.atk + '=' + eff : ''}`;
        if (lucky) m += ` 🍀+1!`;
        m += ` → Влучив!${armMsg} ${mon.name} HP:${Math.max(0, mon.hp)}${mon.armor ? ' 🛡' + mon.armor : ''}`;
        log(m, lucky ? 'luck' : 'loot');
      } else {
        const dmgMsg = takeDmg(dmg);
        log(
          `🎲${val}${G.weapon.atk ? '+' + G.weapon.atk + '=' + eff : ''} → ${mon.name} б'є! ${dmgMsg}`,
          'dmg'
        );
      }
      renderGrid();
      updateHUD();
      if (G.hp <= 0) {
        endGame(false);
        return;
      }
      if (mon.hp <= 0) {
        combatWin(r, c, mon);
        return;
      }
      setTimeout(() => combatRound(r, c, mon, dmg), 250);
    }
  );
}

function combatWin(r, c, mon) {
  log(`✅ ${mon.name} переможений!`, 'loot');
  G.clr[r][c] = true;
  renderGrid();
  updateHUD();
  if (G.dun.grid[r][c] === R.BOSS) endGame(true);
}

// ========== TRAP ==========
function doTrap(r, c) {
  const trapDmg = G.dun.data[r][c] ? G.dun.data[r][c].dmg : 2;
  enableDice(`⚠ Пастка (−${trapDmg}HP)! Кидай!`, (val) => {
    if (val >= 4) {
      log(`🎲${val} → Уникнув пастки!`, 'loot');
    } else {
      const dmgMsg = takeDmg(trapDmg);
      log(`🎲${val} → Пастка! ${dmgMsg}`, 'dmg');
    }
    G.clr[r][c] = true;
    renderGrid();
    updateHUD();
    if (G.hp <= 0) endGame(false);
  });
}

// ========== CHEST ==========
function doChest(r, c) {
  enableDice('📦 Скриня! Що всередині?', (val) => {
    if (val === 1) {
      const dmgMsg = takeDmg(2);
      log(`🎲${val} → Пастка в скрині! ${dmgMsg}`, 'dmg');
    } else if (val <= 3) {
      const g = Math.floor(Math.random() * 3) + 1;
      G.gold += g;
      log(`🎲${val} → Золото +${g}💰`, 'loot');
    } else if (val === 4) {
      G.pot++;
      log(`🎲${val} → Зілля +1🧪`, 'loot');
    } else if (val === 5) {
      G.luck++;
      log(`🎲${val} → 🍀 Талісман вдачі! Вдача: ${G.luck}`, 'luck');
    } else {
      if (Math.random() < 0.5) {
        const tier = Math.floor(Math.random() * 2) + 1;
        const w = WEAPONS[tier];
        if (w.atk > G.weapon.atk) {
          log(
            `🎲${val} → ${w.icon} ${w.name}! (⚔${w.atk}) замінює ${G.weapon.name} (⚔${G.weapon.atk})`,
            'loot'
          );
          G.weapon = { ...w };
        } else {
          log(
            `🎲${val} → ${w.icon} ${w.name} (⚔${w.atk}) — слабше, пропущено`,
            'info'
          );
        }
      } else {
        const tier = Math.floor(Math.random() * 2) + 1;
        const s = SHIELDS[tier];
        addArmor(s.armor);
        log(
          `🎲${val} → ${s.icon} ${s.name}! Броня +${s.armor} (🛡${G.armor})`,
          'loot'
        );
      }
    }
    G.clr[r][c] = true;
    renderGrid();
    updateHUD();
    if (G.hp <= 0) endGame(false);
  });
}

// ========== LOOT ==========
function doLoot(r, c, cd) {
  if (cd.type === 'weapon') {
    if (cd.atk > G.weapon.atk) {
      log(
        `${cd.icon} ${cd.name} (⚔${cd.atk})! Замінює ${G.weapon.name} (⚔${G.weapon.atk})`,
        'loot'
      );
      G.weapon = {
        name: cd.name,
        icon: cd.icon,
        atk: cd.atk,
        tier: cd.lootTier,
      };
    } else if (cd.atk === G.weapon.atk) {
      log(
        `${cd.icon} ${cd.name} (⚔${cd.atk}) — такий самий, пропущено`,
        'info'
      );
    } else {
      log(
        `${cd.icon} ${cd.name} (⚔${cd.atk}) — слабше за ${G.weapon.name} (⚔${G.weapon.atk}), пропущено`,
        'info'
      );
    }
  } else if (cd.type === 'luck') {
    G.luck++;
    log(`${cd.icon} ${cd.name}! Вдача: ${G.luck}`, 'luck');
  } else {
    addArmor(cd.armor);
    log(
      `${cd.icon} ${cd.name}! Броня +${cd.armor} (🛡${G.armor}/${G.maxArmor})`,
      'loot'
    );
  }
  G.clr[r][c] = true;
  renderGrid();
  updateHUD();
}

// ========== HEAL ==========
function doHeal(r, c) {
  const old = G.hp;
  G.hp = Math.min(G.maxHp, G.hp + 3);
  log(`🧪 Зілля! +${G.hp - old}HP (${G.hp}/${G.maxHp})`, 'heal');
  G.clr[r][c] = true;
  renderGrid();
  updateHUD();
}

// ========== USE POTION ==========
function usePotion() {
  if (!G || G.state === 'over' || G.pot <= 0) return;
  G.pot--;
  const old = G.hp;
  G.hp = Math.min(G.maxHp, G.hp + 3);
  log(`🧪 Зілля використано! +${G.hp - old}HP (${G.hp}/${G.maxHp})`, 'heal');
  updateHUD();
}

// ========== GAME OVER ==========
function endGame(win) {
  G.state = 'over';
  gameOverContainer.removeChildren();

  const bg = new PIXI.Graphics();
  bg.beginFill(0x000000, 0.88);
  bg.drawRect(0, 0, app.screen.width, app.screen.height);
  bg.endFill();
  gameOverContainer.addChild(bg);

  const title = new PIXI.Text(win ? '🏆 ПЕРЕМОГА!' : '💀 ПРОГРАШ', {
    fontSize: 64,
    fill: win ? 0xc9a84c : 0xcc4444,
    fontWeight: 'bold',
  });
  title.anchor.set(0.5);
  title.x = app.screen.width / 2;
  title.y = app.screen.height / 2 - 80;
  gameOverContainer.addChild(title);

  const text = new PIXI.Text(
    win
      ? `Підземелля пройдено!\nHP:${G.hp}/${G.maxHp} ${G.weapon.icon}${G.weapon.name}\n🛡${G.armor} 🍀${G.luck} 💰${G.gold}`
      : 'Герой загинув у підземеллі...',
    {
      fontSize: 24,
      fill: 0xffffff,
      align: 'center',
      lineHeight: 32,
    }
  );
  text.anchor.set(0.5);
  text.x = app.screen.width / 2;
  text.y = app.screen.height / 2;
  gameOverContainer.addChild(text);

  const restartBtn = new PIXI.Graphics();
  restartBtn.beginFill(0x8a7333);
  restartBtn.drawRoundedRect(
    app.screen.width / 2 - 100,
    app.screen.height / 2 + 80,
    200,
    50,
    5
  );
  restartBtn.endFill();
  restartBtn.interactive = true;
  restartBtn.buttonMode = true;
  restartBtn.on('pointerdown', () => {
    gameOverContainer.removeChildren();
    newGame();
  });
  gameOverContainer.addChild(restartBtn);

  const btnText = new PIXI.Text('Грати знову', {
    fontSize: 20,
    fill: 0xffffff,
  });
  btnText.anchor.set(0.5);
  btnText.x = app.screen.width / 2;
  btnText.y = app.screen.height / 2 + 105;
  gameOverContainer.addChild(btnText);

  log(win ? '🏆 ПЕРЕМОГА!' : '💀 Герой загинув!', win ? 'win' : 'dmg');
  disableDice();
}

// ========== MOVEMENT ==========
function tryMove(dr, dc) {
  if (!G || G.state !== 'move') return;
  if (!canMove(dr, dc)) return;
  G.pr += dr;
  G.pc += dc;
  enterCell();
}

// ========== KEYBOARD ==========
function setupKeyboard() {
  window.addEventListener('keydown', (e) => {
    if (!G || G.state === 'over') return;

    // Potion
    if (e.code === 'KeyP') {
      e.preventDefault();
      usePotion();
      return;
    }

    // Dice
    if (G.state === 'dice') {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        rollDice();
      }
      return;
    }

    // Movement
    const m = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
      KeyW: [-1, 0],
      KeyS: [1, 0],
      KeyA: [0, -1],
      KeyD: [0, 1],
    };
    if (m[e.code]) {
      e.preventDefault();
      tryMove(...m[e.code]);
    }
  });
}

// ========== NEW GAME ==========
function newGame() {
  // Default settings — you can add UI controls for these
  const theme = 'dungeon';
  const n = 8;
  const diff = 'normal';
  const seed = Math.floor(Math.random() * 99999) + 1;

  const rng = new RNG(seed);
  const dun = genDungeon(rng, n, n, diff, theme);
  const hp = diff === 'easy' ? 12 : diff === 'hard' ? 8 : 10;

  G = {
    dun,
    theme,
    diff,
    seed,
    pr: 0,
    pc: 0,
    hp,
    maxHp: hp,
    weapon: { ...WEAPONS[0] },
    armor: 0,
    maxArmor: 0,
    luck: 0,
    gold: 0,
    pot: 0,
    vis: Array.from({ length: n }, () => Array(n).fill(false)),
    clr: Array.from({ length: n }, () => Array(n).fill(false)),
    revealed: Array.from({ length: n }, () => Array(n).fill(0)),
    state: 'move',
    diceResult: '🎲',
    diceLabel: 'Рухайся стрілками ↑↓←→',
  };
  G.vis[0][0] = true;
  G.revealed[0][0] = 2;

  logTexts = [];
  _diceCb = null;

  log(`🚪 ${TNAME[theme]}! HP:${hp} 🪵Палиця — Рухайся стрілками!`, 'info');
  renderGrid();
  updateHUD();
}

// ========== INIT ==========
function init() {
  app = new PIXI.Application({
    width: 1000,
    height: 800,
    backgroundColor: 0x0a0a0f,
  });
  document.body.appendChild(app.view);

  stage = app.stage;
  mapContainer = new PIXI.Container();
  hudContainer = new PIXI.Container();
  gameOverContainer = new PIXI.Container();

  stage.addChild(mapContainer);
  stage.addChild(hudContainer);
  stage.addChild(gameOverContainer);

  setupKeyboard();
  newGame();
}

init();