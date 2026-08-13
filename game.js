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
let settings = { sound: true, theme: "dark" };
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

function paintName() {
  const chip = document.getElementById("btn-name");
  if (chip) chip.textContent = playerName || "Anónimo";
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE) || "{}");
    settings = { sound: raw.settings?.sound !== false, theme: raw.settings?.theme || "dark" };
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

function showMenu() {
  openOverlay(
    "Menú",
    `
      <div class="switch-row"><span>Sonido</span>${switchBtn(settings.sound)}</div>
      <div class="switch-row"><span>Modo oscuro</span>${switchBtn(settings.theme !== "light")}</div>
      <div class="field">
        <label for="menu-name">Tu nombre</label>
        <input id="menu-name" maxlength="16" autocomplete="nickname" value="${esc(playerName)}" placeholder="Alan" />
      </div>
      <p style="margin-top:14px">Deslizá, usá las flechas o WASD. La partida se guarda sola si salís a mitad. El ranking guarda los 10 mejores con nombre.</p>
    `,
    [
      { label: "Nueva partida", onClick: () => confirmNew() },
      { label: "Deshacer", kind: "soft", onClick: () => { closeOverlay(); undo(); } },
      { label: "Cómo jugar", kind: "soft", onClick: showHelp },
      { label: "Instalar en el iPhone", kind: "soft", onClick: showInstall },
      { label: "Cerrar", kind: "ghost", onClick: closeOverlay },
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
    "Cómo jugar",
    `
      <p>Deslizá el tablero en cualquier dirección. Todas las fichas se mueven hasta chocar.</p>
      <p>Si dos fichas con el <strong>mismo número</strong> se tocan, se fusionan en una sola del doble. Esa fusión suma puntos.</p>
      <p>Después de cada jugada aparece un <strong>2</strong> (casi siempre) o un <strong>4</strong>.</p>
      <p>El objetivo es crear la ficha <strong>2048</strong>. Después podés seguir por 4096, 8192…</p>
    `,
    [{ label: "Listo", onClick: closeOverlay }]
  );
}

function showInstall() {
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const body = standalone
    ? "<p>Ya estás en la app. Quedó instalada en el inicio.</p>"
    : ios
      ? `
        <ol>
          <li>Abrila en <strong>Safari</strong> (no Chrome).</li>
          <li>Tocá el botón <strong>Compartir</strong> (el cuadrado con la flecha).</li>
          <li>Elegí <strong>Agregar a inicio</strong>.</li>
          <li>Confirmá. Queda como app, a pantalla completa y modo oscuro.</li>
        </ol>
      `
      : `
        <p>En el iPhone: abrí esta misma URL en Safari y usá Compartir → Agregar a inicio.</p>
        <p>En Android / escritorio, el navegador puede ofrecer “Instalar app”.</p>
      `;
  openOverlay("Instalar", body, [{ label: "Listo", onClick: closeOverlay }]);
}

function showRanks() {
  refreshRanks().then(renderRanks);
}

function rankRows(list) {
  if (!list.length) {
    return "<p>Todavía no hay partidas en el top 10. Cuando se termine una, entra acá con el nombre.</p>";
  }
  return `<ol class="rank-list">${list
    .map(
      (r, i) =>
        `<li><span class="n">${i + 1}</span><span><span class="who">${esc(r.name || "Anónimo")}</span><span class="sub">${r.tile} · ${esc(r.date || "")}</span></span><span class="pts">${r.score}</span></li>`
    )
    .join("")}</ol>`;
}

function renderRanks() {
  openOverlay("Ranking", rankRows(ranks), [
    { label: "Cerrar", kind: "ghost", onClick: closeOverlay },
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
  openOverlay("¿Nueva partida?", "<p>Se pierde el tablero actual. El mejor puntaje se queda.</p>", [
    { label: "Sí, reiniciar", onClick: () => { closeOverlay(); newGame(); } },
    { label: "Cancelar", kind: "ghost", onClick: closeOverlay },
  ]);
}

function showWin() {
  openOverlay(
    "¡2048!",
    `<p>Llegaste a la ficha. Puntaje: <strong>${score}</strong>.</p><p>Podés seguir y cazar el 4096, o arrancar de nuevo.</p>`,
    [
      { label: "Seguir jugando", onClick: () => { keepPlaying = true; persist(); closeOverlay(); } },
      { label: "Nueva partida", kind: "soft", onClick: () => askSaveThen(() => { closeOverlay(); newGame(); }) },
    ]
  );
  sfx("win");
}

function showLose() {
  askSaveThen(() => {
    openOverlay(
      "Se terminó",
      `<p>No quedan movimientos. Puntaje: <strong>${score}</strong>. Mejor ficha: <strong>${maxTile(board)}</strong>.</p>`,
      [
        { label: "Nueva partida", onClick: () => { closeOverlay(); newGame(); } },
        { label: "Ver ranking", kind: "soft", onClick: showRanks },
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
    "Guardar puntaje",
    `
      <p>Puntaje: <strong>${score}</strong> · ficha ${maxTile(board)}</p>
      <div class="field">
        <label for="save-name">Nombre para el ranking</label>
        <input id="save-name" maxlength="16" autocomplete="nickname" value="${esc(playerName)}" placeholder="Tu nombre" />
      </div>
    `,
    [
      {
        label: "Guardar en el top 10",
        onClick: () => {
          const input = document.getElementById("save-name");
          playerName = cleanName(input?.value) || "Anónimo";
          paintName();
          recordRank().then(done);
        },
      },
      { label: "No guardar", kind: "ghost", onClick: done },
    ]
  );
  setTimeout(() => document.getElementById("save-name")?.focus(), 50);
}

async function recordRank() {
  if (!score || savedThisGame) return;
  savedThisGame = true;
  const now = new Date();
  const entry = {
    name: playerName || "Anónimo",
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
renderStatic();
paintHud();
refreshRanks();
