# SpaceTimeDB Research Notes (for this prototype)

## Summary
SpaceTimeDB provides a real-time database + server module model where reducers are the write path and clients subscribe to table updates. The `chat-react-ts` template ships a working multi-user chat pattern using React + generated TypeScript bindings.

## Key implementation points used
1. Initialize from template (`chat-react-ts`) to get server module + React client scaffold.
2. Publish module to a database target.
3. Generate client bindings from module schema.
4. Run client app pointed at SpaceTimeDB websocket host and database name.

## Sources
- React quickstart: https://spacetimedb.com/docs/quickstarts/react/
- Chat app tutorial: https://spacetimedb.com/docs/tutorials/chat-app/

## Notes
- The old `@clockworklabs/spacetimedb-sdk` package is deprecated in favor of `spacetimedb`.
- This prototype uses a self-hosted SpaceTimeDB instance and a separate public websocket endpoint for browser clients.
