# 2048

Cliente web del clásico 2048, pensado para celular y escritorio. Es una PWA en modo oscuro: se puede instalar en el iPhone, guarda la partida si se cierra a mitad y publica un ranking compartido con los diez mejores puntajes.

**Demo:** [juego-2048.vercel.app](https://juego-2048.vercel.app)

## Características

- Tablero 4×4 con las reglas originales (fusión, spawn 2/4, victoria en 2048 y partida continua)
- Controles táctiles, teclado (flechas y WASD) y deshacer
- Puntaje actual, mejor marca local y animaciones de movimiento / fusión
- Ranking online de 10 entradas, con nombre del jugador
- Reanudación automática: el tablero se persiste en el dispositivo al salir
- Instalable como app (manifest, service worker, iconos Apple)
- Tema oscuro por defecto, con opción clara

## Cómo jugar

Deslizá el tablero o usá las flechas. Las fichas del mismo valor se combinan en una del doble. El objetivo es formar la ficha **2048**; después se puede seguir por 4096, 8192, etc.

Al terminar una partida se pide un nombre (hasta 16 caracteres) y, si entra en el top 10, queda en el ranking compartido.

## Instalar en el iPhone

1. Abrir la demo en **Safari** (no Chrome).
2. Compartir → **Agregar a inicio**.
3. Queda a pantalla completa, con icono propio.

## Stack

| Capa | Tecnología |
| --- | --- |
| Cliente | HTML, CSS y JavaScript (sin bundler) |
| PWA | `manifest.webmanifest` + service worker |
| Hosting | [Vercel](https://vercel.com) |
| Ranking | Función `/api/scores` + [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) |

La partida en curso se guarda en `localStorage`. El ranking vive en Blob para que PC e iPhone vean la misma tabla.

## Desarrollo local

Requisitos: Python 3 (servidor estático) o cualquier static server. El ranking remoto solo funciona desplegado en Vercel, con `BLOB_READ_WRITE_TOKEN`.

```bash
python server.py
```

Queda en [http://127.0.0.1:2048](http://127.0.0.1:2048).

En Windows también se puede usar `Iniciar 2048.bat`.

## Deploy

El proyecto está listo para Vercel. Hace falta un Blob Store vinculado al proyecto (la variable `BLOB_READ_WRITE_TOKEN` la inyecta Vercel al conectar el store).

```bash
npx vercel --prod
```

## Estructura

```
├── index.html              UI
├── styles.css              Tema y layout
├── game.js                 Lógica, input, persistencia local
├── sw.js                   Cache de la PWA
├── manifest.webmanifest
├── api/scores.js           GET/POST del top 10
├── icons/                  180 / 192 / 512
├── server.py               Servidor local
└── vercel.json
```

## Licencia

Código de este cliente: uso libre en el repo. El juego 2048 original es de [Gabriele Cirulli](https://github.com/gabrielecirulli/2048) (MIT). Esta versión no es el cliente oficial: reimplementa las reglas y una interfaz propia.
