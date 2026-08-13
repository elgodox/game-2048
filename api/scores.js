import { get, put } from "@vercel/blob";

const KEY = "leaderboard.json";
const MAX = 10;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
    },
  });
}

function cleanName(raw) {
  return String(raw || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 16);
}

function isPow2(n) {
  return Number.isInteger(n) && n >= 2 && (n & (n - 1)) === 0 && n <= 131072;
}

async function streamToText(stream) {
  return new Response(stream).text();
}

async function readBoard() {
  try {
    const result = await get(KEY, { access: "private", useCache: false });
    if (!result || result.statusCode !== 200 || !result.stream) return [];
    const data = JSON.parse(await streamToText(result.stream));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function writeBoard(rows) {
  await put(KEY, JSON.stringify(rows), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    cacheControlMaxAge: 0,
  });
}

export async function OPTIONS() {
  return json({ ok: true });
}

export async function GET() {
  const ranks = await readBoard();
  return json({ ranks });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "JSON inválido" }, 400);
  }

  const name = cleanName(body.name) || "Anónimo";
  const score = Number(body.score);
  const tile = Number(body.tile);
  if (!Number.isInteger(score) || score < 1 || score > 10_000_000) {
    return json({ error: "Puntaje inválido" }, 400);
  }
  if (!isPow2(tile)) return json({ error: "Ficha inválida" }, 400);

  const now = new Date();
  const entry = {
    name,
    score,
    tile,
    date: new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      timeZone: "America/Buenos_Aires",
    }).format(now),
    at: now.toISOString(),
  };

  const ranks = await readBoard();
  ranks.push(entry);
  ranks.sort((a, b) => b.score - a.score || String(b.at).localeCompare(String(a.at)));
  const top = ranks.slice(0, MAX);
  await writeBoard(top);
  return json({ ranks: top });
}
