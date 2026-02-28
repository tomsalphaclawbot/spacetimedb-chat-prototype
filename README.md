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
  - `cloudflared` (public tunnel ingress)

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

## Notes

- This is an experimental prototype intended for rapid iteration.
- Research notes are in `STDB_RESEARCH.md`.
