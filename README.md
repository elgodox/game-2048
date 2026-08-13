# 2048

A dark-mode 2048 web client for phone and desktop. It installs as a PWA, resumes unfinished games, and keeps a shared top-10 leaderboard with player names.

The UI defaults to **Spanish**. Switch to English with the ES / EN control on the board.

**Live demo:** [elgodox-2048.vercel.app](https://elgodox-2048.vercel.app)

## Features

- Classic 4×4 rules (merge, 2/4 spawn, win at 2048, continue afterward)
- Touch, keyboard (arrows / WASD), and undo
- Current score, local best, and slide / merge animations
- Shared top-10 leaderboard with a player name
- Automatic resume if you close mid-game
- Installable app (manifest, service worker, Apple icons)
- Dark theme by default, optional light theme
- Spanish and English

## How to play

Swipe the board or use the arrow keys. Equal tiles merge into one tile with double the value. Reach **2048**, then keep going for 4096, 8192, and beyond.

When a run ends you can enter a name (up to 16 characters). If the score makes the top 10, it is stored on the shared leaderboard.

## Install on iPhone

1. Open the demo in **Safari** (not Chrome).
2. Share → **Add to Home Screen**.
3. It launches full screen with its own icon.

## Stack

| Layer | Tech |
| --- | --- |
| Client | HTML, CSS, and JavaScript (no bundler) |
| i18n | `i18n.js` (`es` default, `en`) |
| PWA | `manifest.webmanifest` + service worker |
| Hosting | [Vercel](https://vercel.com) |
| Leaderboard | `/api/scores` + [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |

The in-progress board is stored in `localStorage`. The leaderboard lives in Blob so every device sees the same table.

## Local development

Needs Python 3 (or any static server). The remote leaderboard only works on Vercel with `BLOB_READ_WRITE_TOKEN`.

```bash
python server.py
```

Serves [http://127.0.0.1:2048](http://127.0.0.1:2048).

On Windows you can also run `Iniciar 2048.bat`.

## Deploy

The repo is ready for Vercel. Connect a Blob store to the project so Vercel injects `BLOB_READ_WRITE_TOKEN`.

```bash
npx vercel --prod
```

## Project layout

```
├── index.html
├── styles.css
├── game.js
├── i18n.js
├── sw.js
├── manifest.webmanifest
├── api/scores.js
├── icons/
├── server.py
└── vercel.json
```

## License

This client is available in this repository. The original 2048 game is by [Gabriele Cirulli](https://github.com/gabrielecirulli/2048) (MIT). This is not the official client; it reimplements the rules with its own UI.
