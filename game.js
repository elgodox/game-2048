const SIZE = 4;
const WIN = 2048;
const STORE = "nocturne-2048-v1";
const MOVE_MS = 140;

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
let settings = { sound: true, theme: "dark", lang: "es" };
let ranks = [];
let playerName = "";
let savedThisGame = false;

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
      theme: raw.settings?.theme || "dark",
      lang: raw.settings?.lang === "en" ? "en" : "es",
    };
    best = Number(raw.best) || 0;
    ranks = Array.isArray(raw.ranks) ? raw.ranks : [];
    playerName = cleanName(raw.playerName);
    if (raw.game?.board && !raw.game.over) {
      board = raw.game.board.map((row) =>
        row.map((t) => (t ? { id: nextId++, value: t.value } : null))
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

function persist() {
  const slim = board.map((row) => row.map((t) => (t ? { value: t.value } : null)));
  localStorage.setItem(
    STORE,
    JSON.stringify({
      best,
      settings,
      ranks,
      playerName,
      game: over ? null : { board: slim, score, won, keepPlaying, over: false },
    })
  );
}

function applyTheme() {
  document.documentElement.dataset.theme = settings.theme === "light" ? "light" : "dark";
  document.querySelector('meta[name="theme-color"]')?.setAttribute(
    "content",
    settings.theme === "light" ? "#f4efe4" : "#100e0c"
  );
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
      const t = board[r][c];
      if (t) els.tiles.appendChild(tileEl(t.value, r, c));
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
      const t = prev[r][c];
      if (t) prevPos.set(t.id, { r, c });
    }
  }

  els.tiles.innerHTML = "";
  const movers = [];

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const t = next[r][c];
      if (!t) continue;
      if (t.from) {
        for (const src of t.from) {
          const p = prevPos.get(src.id) || { r, c };
          const ghost = tileEl(src.value, p.r, p.c, "ghost");
          els.tiles.appendChild(ghost);
          movers.push({ el: ghost, r, c });
        }
        const merged = tileEl(t.value, r, c, "hidden");
        els.tiles.appendChild(merged);
        movers.push({ el: merged, r, c, pop: "merged" });
      } else if (spawned && t.id === spawned.id) {
        const fresh = tileEl(t.value, r, c, "hidden");
        els.tiles.appendChild(fresh);
        movers.push({ el: fresh, r, c, pop: "new" });
      } else {
        const p = prevPos.get(t.id) || { r, c };
        const el = tileEl(t.value, p.r, p.c);
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
      <div class="switch-row"><span>${esc(t("darkMode"))}</span>${switchBtn(settings.theme !== "light")}</div>
      <div class="field">
        <label for="menu-name">${esc(t("yourName"))}</label>
        <input id="menu-name" maxlength="16" autocomplete="nickname" value="${esc(playerName)}" placeholder="${esc(t("namePlaceholder"))}" />
      </div>
      <p style="margin-top:14px">${esc(t("menuHelp"))}</p>
    `,
    [
      { label: t("newGame"), onClick: () => confirmNew() },
      { label: t("undo"), kind: "soft", onClick: () => { closeOverlay(); undo(); } },
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
  switches[1]?.addEventListener("click", () => {
    settings.theme = settings.theme === "light" ? "dark" : "light";
    switches[1].setAttribute("aria-checked", String(settings.theme !== "light"));
    applyTheme();
    persist();
  });
  const nameInput = document.getElementById("menu-name");
  nameInput?.addEventListener("input", () => {
    playerName = cleanName(nameInput.value);
    paintName();
    persist();
  });
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
  openOverlay(
    t("winTitle"),
    `<p>${esc(t("winBody", { score }))}</p>`,
    [
      { label: t("keepPlaying"), onClick: () => { keepPlaying = true; persist(); closeOverlay(); } },
      { label: t("newGame"), kind: "soft", onClick: () => askSaveThen(() => { closeOverlay(); newGame(); }) },
    ]
  );
  sfx("win");
}

function showLose() {
  askSaveThen(() => {
    openOverlay(
      t("gameOver"),
      `<p>${esc(t("gameOverBody", { score, tile: maxTile(board) }))}</p>`,
      [
        { label: t("newGame"), onClick: () => { closeOverlay(); newGame(); } },
        { label: t("viewRanking"), kind: "soft", onClick: showRanks },
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
  if (hitWin) won = true;
  if (!canMove(board)) over = true;
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
    const t = e.changedTouches[0];
    onStart(t.clientX, t.clientY);
  },
  { passive: true }
);

document.addEventListener(
  "touchend",
  (e) => {
    if (e.target.closest(".overlay")) return;
    const t = e.changedTouches[0];
    onEnd(t.clientX, t.clientY);
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

buildGrid();
load();
applyTheme();
applyLang();
renderStatic();
paintHud();
refreshRanks();
