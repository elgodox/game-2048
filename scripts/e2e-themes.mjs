import { chromium } from "playwright";

const url = process.env.URL || "http://127.0.0.1:2048/";
const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (err) => errors.push(String(err)));
page.on("console", (msg) => {
  if (msg.type() !== "error") return;
  const text = msg.text();
  if (text.includes("404") && text.includes("/api/scores")) return;
  errors.push(`console: ${text}`);
});

await page.goto(url, { waitUntil: "networkidle" });

const report = {
  title: await page.title(),
  theme: await page.evaluate(() => document.documentElement.dataset.theme),
  dots: await page.locator(".theme-dot").count(),
  tiles: await page.locator("#tiles .tile").count(),
  api: await page.evaluate(() => ({
    has: typeof window.Game2048 === "object",
    themes: window.Game2048?.themes || [],
  })),
};

const switched = [];
for (const id of report.api.themes) {
  await page.evaluate((themeId) => window.Game2048.setTheme(themeId), id);
  const applied = await page.evaluate(() => document.documentElement.dataset.theme);
  const bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--bg").trim());
  switched.push({ id, applied, bg, ok: applied === id && !!bg });
}

await page.evaluate(() => window.Game2048.demoWin());
await page.waitForTimeout(400);
const win = await page.evaluate(() => {
  const overlay = !document.getElementById("overlay").hidden;
  const title = document.getElementById("modal-title")?.textContent || "";
  const shots = window.Game2048.getShots();
  const photo = !!document.querySelector(".shot-photo");
  const mini = document.querySelectorAll(".mini-tile").length;
  return { overlay, title, photo, mini, winTile: shots.win?.tile, winScore: shots.win?.score };
});

await page.evaluate(() => window.Game2048.demoLose());
await page.waitForTimeout(200);
const lose = await page.evaluate(() => {
  const overlay = !document.getElementById("overlay").hidden;
  const title = document.getElementById("modal-title")?.textContent || "";
  const shots = window.Game2048.getShots();
  const photo = !!document.querySelector(".shot-photo");
  return { overlay, title, photo, loseTile: shots.lose?.tile, loseScore: shots.lose?.score };
});

await page.getByRole("button", { name: /Ver victoria y derrota|View win and lose/i }).click().catch(() => {});
await page.waitForTimeout(150);
const gallery = await page.evaluate(() => ({
  title: document.getElementById("modal-title")?.textContent || "",
  photos: document.querySelectorAll(".shot-photo").length,
  cards: document.querySelectorAll(".shot").length,
}));

await page.screenshot({ path: "C:/Users/elgod/AppData/Local/Temp/2048-e2e.png", fullPage: true });

console.log(JSON.stringify({ report, switched, win, lose, gallery, errors }, null, 2));
if (errors.length) process.exitCode = 1;
if (report.dots !== 8 || switched.some((s) => !s.ok)) process.exitCode = 1;
if (!win.overlay || win.winTile < 2048 || !win.photo) process.exitCode = 1;
if (!lose.overlay || !lose.loseTile || !lose.photo) process.exitCode = 1;

await browser.close();
