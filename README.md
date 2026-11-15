# Purrito 🐾

Become a cat and wander somewhere cozy. Pick a name and a breed, choose a place, then roam around in soft pastel 3D.

- **Frontend** – React + TypeScript + Vite, 3D with [Three.js](https://threejs.org) via [React Three Fiber](https://r3f.docs.pmnd.rs). Every cat and prop is built from simple shapes in code — no paid assets.
- **Backend** – Go (standard library only). Serves `/api/breeds`, `/api/places` and the built site.

## Run it

You need [Go](https://go.dev/dl/) 1.22+ and [Node.js](https://nodejs.org) 20+.

**Development** (hot reload) — two terminals:

```sh
# terminal 1 – API on :8080
cd server && go run .

# terminal 2 – site on http://localhost:5173 (proxies /api to Go)
cd web && npm install && npm run dev
```

**Production-style** — one server:

```sh
cd web && npm install && npm run build
cd ../server && go run .        # open http://localhost:8080
```

Tests: `cd server && go test ./...` · Typecheck: `cd web && npm run typecheck`

## Controls

| Action | Keys / mouse |
| --- | --- |
| Walk forward / back | `W` `S` or `↑` `↓` |
| Turn | `A` `D` or `←` `→` |
| Run | hold `Shift` |
| Jump | `Space` |
| Walk to a spot | click / tap the floor |
| Zoom camera | mouse wheel |

Bump into yarn balls to knock them around.

Shortcut link: `/?name=Mochi&breed=tuxedo&place=garden` jumps straight into a place.

## Project layout

```
server/            Go API
  data.go          breeds & places (the source of truth)
  main.go          routes + static file serving
web/src/
  App.tsx          screens: intro → place picker → play
  components/Cat.tsx    the cat, built from shapes, with walk/blink/tail animations
  components/props.tsx  furniture, plants, trees, pond, butterflies, yarn balls
  places/          one file per 3D place (LivingRoom, Garden) + colliders
  game/Player.tsx  movement, collisions, jumping, third-person camera
  game/Stage.tsx   the 3D canvas (menu showcase or play mode)
```

### Adding a new place

1. Add it to `places` in `server/data.go` with `Playable: true`.
2. Create `web/src/places/YourPlace.tsx` exporting a `PlaceWorld` (scene, bounds, colliders, spawn).
3. Register it in `web/src/places/index.ts` under the same id.
