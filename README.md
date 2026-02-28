# SpaceTimeDB Chat Prototype

Experimental real-time multi-user chat built with SpaceTimeDB + React/TypeScript.

## Public Endpoints

- Chat UI: https://stdb-chat.tomsalphaclawbot.work
- SpaceTimeDB node (websocket/API origin): https://stdb-node.tomsalphaclawbot.work

## Stack

- SpaceTimeDB server module (`spacetimedb/src/index.ts`)
- React + Vite frontend (`src/*`)
- Generated TypeScript module bindings (`src/module_bindings/*`)
- Docker Compose runtime:
  - `stdb` (self-hosted SpaceTimeDB)
  - `app` (static built React app)
- Optional host-level Cloudflare tunnel (outside compose) for public ingress

## Local Development

```bash
npm install
cd spacetimedb && npm install && cd ..

# start local SpaceTimeDB in one shell
spacetime start --listen-addr 0.0.0.0:3000 --non-interactive

# publish module + generate bindings
spacetime publish --module-path spacetimedb --server local stdb-chat-prototype --anonymous
spacetime generate stdb-chat-prototype --lang typescript --out-dir src/module_bindings

# run frontend
npm run dev
```

## Docker Deployment

```bash
docker compose up -d --build
```

Ports:
- App: `http://localhost:3640`
- SpaceTimeDB: `http://localhost:3900`

## Optional public ingress via host-level Cloudflare tunnel (macOS)

Cloudflare is intentionally kept outside project compose so the app stack stays portable.

```bash
# host-level config lives in ~/.cloudflared/
cp ops/cloudflared.host.example.yml ~/.cloudflared/config-spacetimedb-chat.yml

# edit tunnel id + credentials path, then run tunnel on host
cloudflared tunnel --config ~/.cloudflared/config-spacetimedb-chat.yml run <tunnel-uuid>
```

## Notes

- This is an experimental prototype intended for rapid iteration.
- Research notes are in `STDB_RESEARCH.md`.
