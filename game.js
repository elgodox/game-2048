const SIZE = 4;
const WIN = 2048;
const STORE = "nocturne-2048-v1";
const MOVE_MS = 140;

const THEMES = [
  { id: "nocturne", color: "#100e0c", a: "#100e0c", b: "#e3b341" },
  { id: "classic", color: "#faf8ef", a: "#faf8ef", b: "#edc22e" },
  { id: "cyberpunk", color: "#05040c", a: "#ff2bd6", b: "#00f0ff" },
  { id: "jungle", color: "#0d1a0c", a: "#2a3d1f", b: "#c6e05a" },
  { id: "tetris", color: "#0a0e1a", a: "#3dbbff", b: "#ef4141" },
  { id: "ocean", color: "#04161d", a: "#04161d", b: "#3ad0e8" },
  { id: "candy", color: "#fff3f8", a: "#fff3f8", b: "#ff6b9d" },
  { id: "sunset", color: "#1a0d14", a: "#1a0d14", b: "#ff6b35" },
];

const THEME_PAINT = {
  nocturne: {
    board: "#241f18", cell: "#352e24", ink: "#f6edd8",
    tiles: {
      2: ["#eee4d6", "#6b5b4a"], 4: ["#eee0c4", "#6b5b4a"], 8: ["#f2b179", "#fff7ef"],
      16: ["#f59563", "#fff7ef"], 32: ["#f67c5f", "#fff7ef"], 64: ["#f65e3b", "#fff7ef"],
      128: ["#edcf72", "#fffdf4"], 256: ["#edcc61", "#fffdf4"], 512: ["#edc850", "#fffdf4"],
      1024: ["#edc53f", "#3a2a08"], 2048: ["#edc22e", "#3a2a08"], big: ["#3c3a32", "#f4e7b0"],
    },
  },
  classic: {
    board: "#bbada0", cell: "#cdc1b4", ink: "#776e65",
    tiles: {
      2: ["#eee4da", "#776e65"], 4: ["#ede0c8", "#776e65"], 8: ["#f2b179", "#f9f6f2"],
      16: ["#f59563", "#f9f6f2"], 32: ["#f67c5f", "#f9f6f2"], 64: ["#f65e3b", "#f9f6f2"],
      128: ["#edcf72", "#f9f6f2"], 256: ["#edcc61", "#f9f6f2"], 512: ["#edc850", "#f9f6f2"],
      1024: ["#edc53f", "#776e65"], 2048: ["#edc22e", "#776e65"], big: ["#3c3a32", "#f9f6f2"],
    },
  },
  cyberpunk: {
    board: "#0a0816", cell: "#1a1630", ink: "#f4f0ff",
    tiles: {
      2: ["#1d1638", "#c9b8ff"], 4: ["#2a1850", "#e0d4ff"], 8: ["#5b1d7a", "#ffe6ff"],
      16: ["#8a1a9a", "#fff0ff"], 32: ["#c41a9a", "#fff5ff"], 64: ["#ff2bd6", "#1a0014"],
      128: ["#00c2d4", "#021318"], 256: ["#00e5ff", "#021318"], 512: ["#7af7ff", "#021318"],
      1024: ["#ffe14a", "#2a1f00"], 2048: ["#fff36a", "#2a1f00"], big: ["#2b1648", "#ff7ae8"],
    },
  },
  jungle: {
    board: "#2a3d1f", cell: "#3d5428", ink: "#f3f6d8",
    tiles: {
      2: ["#dce8b4", "#3a4a20"], 4: ["#c5dc7a", "#2f3e16"], 8: ["#8fbf3f", "#f4ffd8"],
      16: ["#5a9a32", "#f4ffd8"], 32: ["#e0b03a", "#2a2008"], 64: ["#e07a2a", "#fff6ea"],
      128: ["#d94a2a", "#fff6ea"], 256: ["#c43a4a", "#fff6ea"], 512: ["#7a3aa0", "#fff6ea"],
      1024: ["#f0e06a", "#2a2608"], 2048: ["#ffe97a", "#2a2608"], big: ["#1c2e14", "#e6d35a"],
    },
  },
  tetris: {
    board: "#111628", cell: "#1c2440", ink: "#e8ecff",
    tiles: {
      2: ["#2dd4e0", "#042428"], 4: ["#f7d51d", "#2a2200"], 8: ["#b44adf", "#fff8ff"],
      16: ["#3cc85a", "#04240c"], 32: ["#ef4141", "#fff8f2"], 64: ["#f08a24", "#2a1400"],
      128: ["#3d7bff", "#f4f8ff"], 256: ["#ff5ad6", "#2a0020"], 512: ["#7af0a0", "#04240c"],
      1024: ["#ffe14a", "#2a2200"], 2048: ["#ffffff", "#111628"], big: ["#080b16", "#f7d51d"],
    },
  },
  ocean: {
    board: "#0c3340", cell: "#144556", ink: "#e7fbff",
    tiles: {
      2: ["#d8f6ff", "#164656"], 4: ["#9fe6f5", "#164656"], 8: ["#3ad0e8", "#042028"],
      16: ["#1aa8c4", "#e7fbff"], 32: ["#2a9d8f", "#e7fbff"], 64: ["#1d6f8a", "#e7fbff"],
      128: ["#f4a261", "#2a1608"], 256: ["#e76f51", "#fff6ea"], 512: ["#e9c46a", "#2a2208"],
      1024: ["#ffe08a", "#2a2208"], 2048: ["#fff3b0", "#2a2208"], big: ["#062028", "#7af0ff"],
    },
  },
  candy: {
    board: "#ffd0e3", cell: "#ffc1d9", ink: "#5b2a44",
    tiles: {
      2: ["#fff7fb", "#8a4064"], 4: ["#ffe0ee", "#8a4064"], 8: ["#ffb3d0", "#5b2a44"],
      16: ["#ff8fab", "#fff8fb"], 32: ["#ff6b9d", "#fff8fb"], 64: ["#f25c8a", "#fff8fb"],
      128: ["#c084fc", "#fff8fb"], 256: ["#93c5fd", "#1e3a5f"], 512: ["#86efac", "#14532d"],
      1024: ["#fde68a", "#5b3a08"], 2048: ["#fbcfe8", "#5b2a44"], big: ["#5b2a44", "#ffe0ee"],
    },
  },
  sunset: {
    board: "#3a1d22", cell: "#4a2830", ink: "#ffe9d6",
    tiles: {
      2: ["#ffe0c4", "#6a3a28"], 4: ["#ffc89a", "#6a3a28"], 8: ["#ff9a62", "#2a1208"],
      16: ["#ff6b35", "#fff6ea"], 32: ["#e84d3d", "#fff6ea"], 64: ["#c23a54", "#fff6ea"],
      128: ["#8b2f6a", "#ffe9d6"], 256: ["#5c2d7a", "#ffe9d6"], 512: ["#ffb347", "#2a1608"],
      1024: ["#ffd27a", "#2a1608"], 2048: ["#ffe08a", "#2a1608"], big: ["#241018", "#ffb347"],
    },
  },
};

const els = {
  grid: document.getElementById("grid"),
  tiles: document.getElementById("tiles"),
  score: document.getElementById("score"),
  best: document.getElementById("best"),
  scorePop: document.getElementById("score-pop"),
  overlay: document.getElementById("overlay"),
  modalTitle: document.getElementById("modal-title"),
  modalBody: document.getElementById("modal-body"),
  modalActions: document.getElementById("modal-actions"),
  board: document.getElementById("board"),
};

let nextId = 1;
let board = emptyBoard();
let score = 0;
let best = 0;
let won = false;
let keepPlaying = false;
let over = false;
let busy = false;
let history = null;
let settings = { sound: true, theme: "nocturne", lang: "es" };
let ranks = [];
let playerName = "";
let savedThisGame = false;
let shots = { win: null, lose: null };

function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function cloneBoard(src) {
  return src.map((row) => row.map((t) => (t ? { id: t.id, value: t.value } : null)));
}

function empties(b) {
  const out = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) if (!b[r][c]) out.push([r, c]);
  }
  return out;
}

function spawn(b) {
  const spots = empties(b);
  if (!spots.length) return null;
  const [r, c] = spots[(Math.random() * spots.length) | 0];
  const tile = { id: nextId++, value: Math.random() < 0.9 ? 2 : 4 };
  b[r][c] = tile;
  return tile;
}

function sameValues(a, b) {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const x = a[r][c]?.value || 0;
      const y = b[r][c]?.value || 0;
      if (x !== y) return false;
    }
  }
  return true;
}

function processLine(line) {
  const src = line.filter(Boolean);
  const out = [];
  let gained = 0;
  let i = 0;
  while (i < src.length) {
    if (i + 1 < src.length && src[i].value === src[i + 1].value) {
      const value = src[i].value * 2;
      out.push({
        id: nextId++,
        value,
        merged: true,
        from: [src[i], src[i + 1]],
      });
      gained += value;
      i += 2;
    } else {
      out.push({ id: src[i].id, value: src[i].value });
      i += 1;
    }
  }
  while (out.length < SIZE) out.push(null);
  return { line: out, gained };
}

function moveBoard(src, dir) {
  const next = emptyBoard();
  let gained = 0;

  const read = (i) => {
    if (dir === "left") return src[i].slice();
    if (dir === "right") return src[i].slice().reverse();
    if (dir === "up") return src.map((row) => row[i]);
    return src.map((row) => row[i]).reverse();
  };

  const write = (i, line) => {
    const L = dir === "right" || dir === "down" ? line.slice().reverse() : line;
    if (dir === "left" || dir === "right") {
      for (let c = 0; c < SIZE; c++) next[i][c] = L[c];
    } else {
      for (let r = 0; r < SIZE; r++) next[r][i] = L[r];
    }
  };

  for (let i = 0; i < SIZE; i++) {
    const { line, gained: g } = processLine(read(i));
    gained += g;
    write(i, line);
  }

  return { board: next, gained, moved: !sameValues(src, next) };
}

function canMove(b) {
  if (empties(b).length) return true;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = b[r][c].value;
      if (c + 1 < SIZE && b[r][c + 1].value === v) return true;
      if (r + 1 < SIZE && b[r + 1][c].value === v) return true;
    }
  }
  return false;
}

function maxTile(b) {
  let m = 0;
  for (const row of b) for (const t of row) if (t && t.value > m) m = t.value;
  return m;
}

function slimValues(b) {
  return b.map((row) => row.map((t) => (t ? t.value : 0)));
}

function normalizeTheme(raw) {
  if (raw === "light") return "classic";
  if (raw === "dark") return "nocturne";
  if (THEMES.some((th) => th.id === raw)) return raw;
  return "nocturne";
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

function cleanName(raw) {
  return String(raw || "").replace(/\s+/g, " ").trim().slice(0, 16);
}

function t(key, vars) {
  const pack = I18N[settings.lang] || I18N.es;
  let s = pack[key] ?? I18N.es[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

function applyLang() {
  const lang = settings.lang === "en" ? "en" : "es";
  settings.lang = lang;
  document.documentElement.lang = lang === "en" ? "en" : "es";
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("metaDesc"));
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  const tagline = document.getElementById("tagline");
  if (tagline) {
    tagline.innerHTML = "";
    const parts = t("tagline", { tile: "\u0000" }).split("\u0000");
    tagline.append(parts[0] || "");
    const em = document.createElement("em");
    em.textContent = "2048";
    tagline.append(em);
    tagline.append(parts[1] || "");
  }
  document.querySelectorAll("[data-set-lang]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.setLang === lang));
  });
  paintName();
  paintThemeStrip();
}

function paintName() {
  const chip = document.getElementById("btn-name");
  if (chip) chip.textContent = playerName || t("anonymous");
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || "{}");
    settings = {
      sound: raw.settings?.sound !== false,
      theme: normalizeTheme(raw.settings?.theme),
      lang: raw.settings?.lang === "en" ? "en" : "es",
    };
    best = Number(raw.best) || 0;
    ranks = Array.isArray(raw.ranks) ? raw.ranks : [];
    playerName = cleanName(raw.playerName);
    shots = {
      win: sanitizeShot(raw.shots?.win),
      lose: sanitizeShot(raw.shots?.lose),
    };
    if (raw.game?.board && !raw.game.over) {
      board = raw.game.board.map((row) =>
        row.map((tile) => (tile ? { id: nextId++, value: tile.value } : null))
      );
      score = Number(raw.game.score) || 0;
      won = !!raw.game.won;
      keepPlaying = !!raw.game.keepPlaying;
      over = false;
      savedThisGame = false;
      if (!maxTile(board)) {
        board = emptyBoard();
        spawn(board);
        spawn(board);
      }
    } else {
      spawn(board);
      spawn(board);
    }
  } catch {
    spawn(board);
    spawn(board);
  }
}

function sanitizeShot(shot) {
  if (!shot || !Array.isArray(shot.values) || shot.values.length !== SIZE) return null;
  const values = shot.values.map((row) => {
    if (!Array.isArray(row) || row.length !== SIZE) return [0, 0, 0, 0];
    return row.map((n) => {
      const v = Number(n) || 0;
      return v > 0 ? v : 0;
    });
  });
  return {
    kind: shot.kind === "win" ? "win" : "lose",
    values,
    score: Number(shot.score) || 0,
    tile: Number(shot.tile) || maxOfValues(values),
    theme: normalizeTheme(shot.theme),
    at: shot.at || "",
  };
}

function maxOfValues(values) {
  let m = 0;
  for (const row of values) for (const n of row) if (n > m) m = n;
  return m;
}

function persist() {
  const slim = board.map((row) => row.map((tile) => (tile ? { value: tile.value } : null)));
  localStorage.setItem(
    STORE,
    JSON.stringify({
      best,
      settings,
      ranks,
      playerName,
      shots,
      game: over ? null : { board: slim, score, won, keepPlaying, over: false },
    })
  );
}

function applyTheme() {
  const id = normalizeTheme(settings.theme);
  settings.theme = id;
  document.documentElement.dataset.theme = id;
  const meta = THEMES.find((th) => th.id === id);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", meta?.color || "#100e0c");
  paintThemeStrip();
}

function setTheme(id) {
  settings.theme = normalizeTheme(id);
  applyTheme();
  persist();
}

function paintThemeStrip() {
  const strip = document.getElementById("theme-strip");
  if (!strip) return;
  strip.innerHTML = "";
  for (const th of THEMES) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "theme-dot";
    btn.style.setProperty("--dot-a", th.a);
    btn.style.setProperty("--dot-b", th.b);
    btn.title = t(`theme${th.id[0].toUpperCase()}${th.id.slice(1)}`);
    btn.setAttribute("role", "radio");
    btn.setAttribute("aria-checked", String(settings.theme === th.id));
    btn.setAttribute("aria-label", btn.title);
    btn.addEventListener("click", () => setTheme(th.id));
    strip.appendChild(btn);
  }
}

function themePickerHtml() {
  return `<div class="theme-grid">${THEMES.map((th) => {
    const label = t(`theme${th.id[0].toUpperCase()}${th.id.slice(1)}`);
    return `<button type="button" class="theme-card" data-theme-id="${th.id}" aria-pressed="${settings.theme === th.id}" style="--dot-a:${th.a};--dot-b:${th.b}"><span class="sw"></span><span class="nm">${esc(label)}</span></button>`;
  }).join("")}</div>`;
}

function bindThemePicker(root) {
  root.querySelectorAll("[data-theme-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setTheme(btn.dataset.themeId);
      root.querySelectorAll("[data-theme-id]").forEach((el) => {
        el.setAttribute("aria-pressed", String(el.dataset.themeId === settings.theme));
      });
    });
  });
}

/* ── snapshots ── */
function captureShot(kind) {
  const shot = {
    kind,
    values: slimValues(board),
    score,
    tile: maxTile(board),
    theme: settings.theme,
    at: new Date().toISOString(),
  };
  shots[kind] = shot;
  persist();
  return shot;
}

function tilePaint(themeId, value) {
  const pack = THEME_PAINT[normalizeTheme(themeId)] || THEME_PAINT.nocturne;
  if (value >= 4096) return pack.tiles.big;
  return pack.tiles[value] || pack.tiles.big;
}

function drawShotPng(shot, size = 360) {
  const paint = THEME_PAINT[normalizeTheme(shot.theme)] || THEME_PAINT.nocturne;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const pad = Math.round(size * 0.045);
  const gap = Math.round(size * 0.018);
  const cell = (size - pad * 2 - gap * 3) / 4;
  const radius = Math.max(3, cell * 0.16);
  ctx.fillStyle = paint.board;
  roundRect(ctx, 0, 0, size, size, pad + 4);
  ctx.fill();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const x = pad + c * (cell + gap);
      const y = pad + r * (cell + gap);
      const value = shot.values[r][c];
      if (!value) {
        ctx.fillStyle = paint.cell;
        roundRect(ctx, x, y, cell, cell, radius);
        ctx.fill();
        continue;
      }
      const [bg, ink] = tilePaint(shot.theme, value);
      ctx.fillStyle = bg;
      roundRect(ctx, x, y, cell, cell, radius);
      ctx.fill();
      ctx.fillStyle = ink;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const digits = String(value).length;
      ctx.font = `700 ${Math.round(cell * (digits > 3 ? 0.32 : digits > 2 ? 0.38 : 0.46))}px Sora, Segoe UI, sans-serif`;
      ctx.fillText(String(value), x + cell / 2, y + cell / 2 + 1);
    }
  }
  return canvas.toDataURL("image/png");
}

function roundRect(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function shotBoardHtml(shot) {
  const cells = shot.values
    .flat()
    .map((v) => (v ? `<div class="mini-tile tile-${v}">${v}</div>` : `<div class="mini-cell"></div>`))
    .join("");
  return `<div class="shot-board">${cells}</div>`;
}

function shotCardHtml(kind) {
  const shot = shots[kind];
  const title = kind === "win" ? t("shotWin") : t("shotLose");
  if (!shot) {
    return `<section class="shot"><h3>${esc(title)}</h3><div class="shot-empty">${esc(kind === "win" ? t("noShotWin") : t("noShotLose"))}</div></section>`;
  }
  const date = shot.at
    ? new Date(shot.at).toLocaleString(settings.lang === "en" ? "en-GB" : "es-AR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const png = drawShotPng(shot);
  return `
    <section class="shot" data-theme="${esc(shot.theme)}">
      <h3>${esc(title)}</h3>
      ${shotBoardHtml(shot)}
      <img class="shot-photo" alt="${esc(title)}" src="${png}" />
      <p class="cap">${esc(t(kind === "win" ? "shotWinCap" : "shotLoseCap", { score: shot.score, tile: shot.tile }))}${date ? ` · ${esc(date)}` : ""}</p>
    </section>
  `;
}

function downloadShot(kind) {
  const shot = shots[kind];
  if (!shot) return;
  const a = document.createElement("a");
  a.href = drawShotPng(shot, 512);
  a.download = `2048-${kind}-${shot.score}.png`;
  a.click();
}

/* ── audio / haptics ── */
let audioCtx = null;
function ctx() {
  if (!settings.sound) return null;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function beep(freq, dur, type = "sine", gain = 0.05) {
  const c = ctx();
  if (!c) return;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start();
  o.stop(c.currentTime + dur);
}

function sfx(kind, value = 2) {
  if (kind === "move") beep(180, 0.04, "triangle", 0.03);
  if (kind === "merge") beep(220 + Math.log2(value) * 40, 0.09, "sine", 0.055);
  if (kind === "win") {
    beep(523, 0.12);
    setTimeout(() => beep(659, 0.12), 90);
    setTimeout(() => beep(784, 0.18), 180);
  }
  if (kind === "lose") beep(110, 0.28, "sawtooth", 0.04);
}

function haptic(ms = 10) {
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* ignore */
  }
}

/* ── render ── */
function buildGrid() {
  els.grid.innerHTML = "";
  for (let i = 0; i < SIZE * SIZE; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    els.grid.appendChild(cell);
  }
}

function tileEl(value, r, c, extra = "") {
  const el = document.createElement("div");
  el.className = `tile tile-${value}${extra ? " " + extra : ""}`;
  el.style.setProperty("--r", r);
  el.style.setProperty("--c", c);
  el.textContent = value;
  return el;
}

function renderStatic() {
  els.tiles.innerHTML = "";
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const tile = board[r][c];
      if (tile) els.tiles.appendChild(tileEl(tile.value, r, c));
    }
  }
  paintHud();
}

function paintHud() {
  els.score.textContent = String(score);
  els.best.textContent = String(best);
  paintName();
}

function popScore(n) {
  if (!n) return;
  els.scorePop.hidden = false;
  els.scorePop.textContent = `+${n}`;
  els.scorePop.style.animation = "none";
  void els.scorePop.offsetWidth;
  els.scorePop.style.animation = "";
}

function renderMove(prev, next, spawned) {
  const prevPos = new Map();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const tile = prev[r][c];
      if (tile) prevPos.set(tile.id, { r, c });
    }
  }

  els.tiles.innerHTML = "";
  const movers = [];

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const tile = next[r][c];
      if (!tile) continue;
      if (tile.from) {
        for (const src of tile.from) {
          const p = prevPos.get(src.id) || { r, c };
          const ghost = tileEl(src.value, p.r, p.c, "ghost");
          els.tiles.appendChild(ghost);
          movers.push({ el: ghost, r, c });
        }
        const merged = tileEl(tile.value, r, c, "hidden");
        els.tiles.appendChild(merged);
        movers.push({ el: merged, r, c, pop: "merged" });
      } else if (spawned && tile.id === spawned.id) {
        const fresh = tileEl(tile.value, r, c, "hidden");
        els.tiles.appendChild(fresh);
        movers.push({ el: fresh, r, c, pop: "new" });
      } else {
        const p = prevPos.get(tile.id) || { r, c };
        const el = tileEl(tile.value, p.r, p.c);
        els.tiles.appendChild(el);
        movers.push({ el, r, c });
      }
    }
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      for (const m of movers) {
        m.el.style.setProperty("--r", m.r);
        m.el.style.setProperty("--c", m.c);
      }
      setTimeout(() => {
        for (const m of movers) {
          if (!m.pop) continue;
          m.el.classList.remove("hidden");
          m.el.classList.add(m.pop);
        }
      }, MOVE_MS - 20);
    });
  });
}

/* ── overlays ── */
function closeOverlay() {
  els.overlay.hidden = true;
}

function openOverlay(title, bodyHtml, actions) {
  els.modalTitle.textContent = title;
  els.modalBody.innerHTML = bodyHtml;
  els.modalActions.innerHTML = "";
  for (const a of actions) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `btn ${a.kind || ""}`.trim();
    btn.textContent = a.label;
    btn.addEventListener("click", a.onClick);
    els.modalActions.appendChild(btn);
  }
  els.overlay.hidden = false;
}

function switchBtn(on) {
  return `<button type="button" class="switch" role="switch" aria-checked="${on}"><i></i></button>`;
}

function setLang(lang) {
  settings.lang = lang === "en" ? "en" : "es";
  applyLang();
  persist();
}

function showMenu() {
  openOverlay(
    t("menu"),
    `
      <div class="switch-row"><span>${esc(t("sound"))}</span>${switchBtn(settings.sound)}</div>
      <p style="margin:12px 0 0">${esc(t("themeHelp"))}</p>
      ${themePickerHtml()}
      <div class="field">
        <label for="menu-name">${esc(t("yourName"))}</label>
        <input id="menu-name" maxlength="16" autocomplete="nickname" value="${esc(playerName)}" placeholder="${esc(t("namePlaceholder"))}" />
      </div>
      <p style="margin-top:14px">${esc(t("menuHelp"))}</p>
    `,
    [
      { label: t("newGame"), onClick: () => confirmNew() },
      { label: t("undo"), kind: "soft", onClick: () => { closeOverlay(); undo(); } },
      { label: t("viewShots"), kind: "soft", onClick: showShots },
      { label: t("howToPlay"), kind: "soft", onClick: showHelp },
      { label: t("installIphone"), kind: "soft", onClick: showInstall },
      { label: t("close"), kind: "ghost", onClick: closeOverlay },
    ]
  );
  const switches = els.modalBody.querySelectorAll(".switch");
  switches[0]?.addEventListener("click", () => {
    settings.sound = !settings.sound;
    switches[0].setAttribute("aria-checked", String(settings.sound));
    persist();
    if (settings.sound) sfx("merge", 8);
  });
  bindThemePicker(els.modalBody);
  const nameInput = document.getElementById("menu-name");
  nameInput?.addEventListener("input", () => {
    playerName = cleanName(nameInput.value);
    paintName();
    persist();
  });
}

function showShots() {
  const actions = [{ label: t("close"), kind: "ghost", onClick: closeOverlay }];
  if (shots.win) {
    actions.unshift({ label: `${t("savePhoto")} · ${t("shotWin")}`, kind: "soft", onClick: () => downloadShot("win") });
  }
  if (shots.lose) {
    actions.unshift({ label: `${t("savePhoto")} · ${t("shotLose")}`, kind: "soft", onClick: () => downloadShot("lose") });
  }
  openOverlay(
    t("shotsTitle"),
    `<div class="shots">${shotCardHtml("win")}${shotCardHtml("lose")}</div>`,
    actions
  );
}

function showHelp() {
  openOverlay(
    t("helpTitle"),
    `
      <p>${esc(t("help1"))}</p>
      <p>${esc(t("help2"))}</p>
      <p>${esc(t("help3"))}</p>
      <p>${esc(t("help4"))}</p>
    `,
    [{ label: t("done"), onClick: closeOverlay }]
  );
}

function showInstall() {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const body = standalone
    ? `<p>${esc(t("installDone"))}</p>`
    : ios
      ? `
        <ol>
          <li>${esc(t("installIos1"))}</li>
          <li>${esc(t("installIos2"))}</li>
          <li>${esc(t("installIos3"))}</li>
          <li>${esc(t("installIos4"))}</li>
        </ol>
      `
      : `
        <p>${esc(t("installOther1"))}</p>
        <p>${esc(t("installOther2"))}</p>
      `;
  openOverlay(t("installTitle"), body, [{ label: t("done"), onClick: closeOverlay }]);
}

function showRanks() {
  refreshRanks().then(renderRanks);
}

function rankRows(list) {
  if (!list.length) {
    return `<p>${esc(t("ranksEmpty"))}</p>`;
  }
  return `<ol class="rank-list">${list
    .map(
      (r, i) =>
        `<li><span class="n">${i + 1}</span><span><span class="who">${esc(r.name || t("anonymous"))}</span><span class="sub">${r.tile} · ${esc(r.date || "")}</span></span><span class="pts">${r.score}</span></li>`
    )
    .join("")}</ol>`;
}

function renderRanks() {
  openOverlay(t("ranking"), rankRows(ranks), [
    { label: t("close"), kind: "ghost", onClick: closeOverlay },
  ]);
}

async function refreshRanks() {
  try {
    const res = await fetch("/api/scores", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    if (Array.isArray(data.ranks)) {
      ranks = data.ranks;
      persist();
    }
  } catch {
    /* local fallback */
  }
}

function confirmNew() {
  if (score === 0 || over) {
    closeOverlay();
    newGame();
    return;
  }
  openOverlay(t("confirmNewTitle"), `<p>${esc(t("confirmNewBody"))}</p>`, [
    { label: t("confirmRestart"), onClick: () => { closeOverlay(); newGame(); } },
    { label: t("cancel"), kind: "ghost", onClick: closeOverlay },
  ]);
}

function showWin() {
  const shot = shots.win;
  openOverlay(
    t("winTitle"),
    `<p>${esc(t("winBody", { score }))}</p>${shot ? `<div class="shots">${shotCardHtml("win")}</div>` : ""}`,
    [
      { label: t("keepPlaying"), onClick: () => { keepPlaying = true; persist(); closeOverlay(); } },
      { label: t("savePhoto"), kind: "soft", onClick: () => downloadShot("win") },
      { label: t("newGame"), kind: "soft", onClick: () => askSaveThen(() => { closeOverlay(); newGame(); }) },
    ]
  );
  sfx("win");
}

function showLose() {
  askSaveThen(() => {
    const shot = shots.lose;
    openOverlay(
      t("gameOver"),
      `<p>${esc(t("gameOverBody", { score, tile: maxTile(board) }))}</p>${shot ? `<div class="shots">${shotCardHtml("lose")}</div>` : ""}`,
      [
        { label: t("newGame"), onClick: () => { closeOverlay(); newGame(); } },
        { label: t("savePhoto"), kind: "soft", onClick: () => downloadShot("lose") },
        { label: t("viewRanking"), kind: "soft", onClick: showRanks },
        { label: t("viewShots"), kind: "ghost", onClick: showShots },
      ]
    );
  });
  sfx("lose");
}

function askSaveThen(done) {
  if (savedThisGame || !score) {
    done();
    return;
  }
  openOverlay(
    t("saveScore"),
    `
      <p>${esc(t("saveScoreBody", { score, tile: maxTile(board) }))}</p>
      <div class="field">
        <label for="save-name">${esc(t("rankName"))}</label>
        <input id="save-name" maxlength="16" autocomplete="nickname" value="${esc(playerName)}" placeholder="${esc(t("namePlaceholder"))}" />
      </div>
    `,
    [
      {
        label: t("saveTop10"),
        onClick: () => {
          const input = document.getElementById("save-name");
          playerName = cleanName(input?.value) || t("anonymous");
          paintName();
          recordRank().then(done);
        },
      },
      { label: t("skipSave"), kind: "ghost", onClick: done },
    ]
  );
  setTimeout(() => document.getElementById("save-name")?.focus(), 50);
}

async function recordRank() {
  if (!score || savedThisGame) return;
  savedThisGame = true;
  const now = new Date();
  const entry = {
    name: playerName || t("anonymous"),
    score,
    tile: maxTile(board),
    date: now.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
    at: now.toISOString(),
  };
  ranks.push(entry);
  ranks.sort((a, b) => b.score - a.score);
  ranks = ranks.slice(0, 10);
  persist();
  try {
    const res = await fetch("/api/scores", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: entry.name, score: entry.score, tile: entry.tile }),
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.ranks)) ranks = data.ranks;
      persist();
    }
  } catch {
    /* keep local */
  }
}

function newGame() {
  board = emptyBoard();
  score = 0;
  won = false;
  keepPlaying = false;
  over = false;
  history = null;
  savedThisGame = false;
  spawn(board);
  spawn(board);
  persist();
  renderStatic();
}

function undo() {
  if (!history || busy) return;
  board = history.board;
  score = history.score;
  won = history.won;
  keepPlaying = history.keepPlaying;
  over = false;
  history = null;
  persist();
  renderStatic();
}

function play(dir) {
  if (busy || over) return;
  if (won && !keepPlaying) return;
  const prev = cloneBoard(board);
  const snap = { board: cloneBoard(board), score, won, keepPlaying };
  const { board: next, gained, moved } = moveBoard(board, dir);
  if (!moved) return;

  busy = true;
  history = snap;
  const spawned = spawn(next);
  board = next;
  score += gained;
  if (score > best) best = score;
  paintHud();
  popScore(gained);
  renderMove(prev, board, spawned);
  sfx(gained ? "merge" : "move", gained || 2);
  if (gained) haptic(gained >= 128 ? 18 : 8);

  const hitWin = !won && maxTile(board) >= WIN;
  if (hitWin) {
    won = true;
    captureShot("win");
  }
  if (!canMove(board)) {
    over = true;
    captureShot("lose");
  }
  persist();

  setTimeout(() => {
    busy = false;
    if (hitWin) showWin();
    else if (over) showLose();
  }, MOVE_MS + 40);
}

/* ── input ── */
const KEY = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  a: "left",
  d: "right",
  w: "up",
  s: "down",
  A: "left",
  D: "right",
  W: "up",
  S: "down",
};

window.addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea")) return;
  const dir = KEY[e.key];
  if (!dir) return;
  e.preventDefault();
  play(dir);
});

let sx = 0;
let sy = 0;
let tracking = false;

function onStart(x, y) {
  sx = x;
  sy = y;
  tracking = true;
}

function onEnd(x, y) {
  if (!tracking) return;
  tracking = false;
  const dx = x - sx;
  const dy = y - sy;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
  if (Math.abs(dx) > Math.abs(dy)) play(dx > 0 ? "right" : "left");
  else play(dy > 0 ? "down" : "up");
}

document.addEventListener(
  "touchstart",
  (e) => {
    if (e.target.closest(".overlay")) return;
    const touch = e.changedTouches[0];
    onStart(touch.clientX, touch.clientY);
  },
  { passive: true }
);

document.addEventListener(
  "touchend",
  (e) => {
    if (e.target.closest(".overlay")) return;
    const touch = e.changedTouches[0];
    onEnd(touch.clientX, touch.clientY);
  },
  { passive: true }
);

document.addEventListener(
  "touchmove",
  (e) => {
    if (e.target.closest(".modal-body")) return;
    if (!els.overlay.hidden) return;
    e.preventDefault();
  },
  { passive: false }
);

els.board.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "touch") return;
  onStart(e.clientX, e.clientY);
});
window.addEventListener("pointerup", (e) => {
  if (e.pointerType === "touch") return;
  onEnd(e.clientX, e.clientY);
});

document.getElementById("btn-menu").addEventListener("click", showMenu);
document.getElementById("btn-board").addEventListener("click", showRanks);
document.getElementById("btn-name")?.addEventListener("click", showMenu);
document.querySelectorAll("[data-set-lang]").forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.dataset.setLang));
});
els.overlay.addEventListener("click", (e) => {
  if (e.target === els.overlay && !over && !(won && !keepPlaying)) closeOverlay();
});

window.addEventListener("pagehide", persist);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") persist();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
}

function applyBoardValues(values, opts = {}) {
  board = emptyBoard();
  nextId = 1;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const v = Number(values?.[r]?.[c]) || 0;
      if (v) board[r][c] = { id: nextId++, value: v };
    }
  }
  score = Number(opts.score) || 0;
  won = !!opts.won;
  keepPlaying = !!opts.keepPlaying;
  over = !!opts.over;
  savedThisGame = false;
  history = null;
  renderStatic();
  persist();
}

window.Game2048 = {
  themes: THEMES.map((th) => th.id),
  setTheme,
  showShots,
  showWin,
  showLose,
  captureShot,
  getShots: () => JSON.parse(JSON.stringify(shots)),
  applyBoardValues,
  demoWin() {
    applyBoardValues(
      [
        [1024, 1024, 8, 4],
        [256, 128, 16, 2],
        [64, 32, 8, 4],
        [16, 8, 4, 2],
      ],
      { score: 20480 }
    );
    won = false;
    keepPlaying = false;
    over = false;
    play("left");
  },
  demoLose() {
    applyBoardValues(
      [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2, 4],
        [8, 16, 32, 64],
      ],
      { score: 9999, won: true, keepPlaying: true, over: true }
    );
    savedThisGame = true;
    captureShot("lose");
    showLose();
  },
};

buildGrid();
load();
applyTheme();
applyLang();
renderStatic();
paintHud();
refreshRanks();
