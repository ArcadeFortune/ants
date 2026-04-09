## Plan: Design TypeScript Deno WebSocket Game Server for Ants Game

TL;DR: Build a WebSocket-based server in Deno/TypeScript for a 2D grid game where clients control hives with ants. Server manages game state, handles move commands with cooldowns, and sends nearby tile info. Communication uses JSON messages over WebSockets with client UUIDs for identification.

**Steps**
1. Define TypeScript interfaces and types for game entities (Board, Hive, Ant, Tile types) and messages (Connect, Move, Update).
2. Implement WebSocket server setup in Deno, listening on a port (e.g., 8080) for incoming connections.
3. Create game state management: 200x200 grid, track hives by UUID, ants with positions, cooldowns, and carrying status.
4. Handle client connections: On WebSocket connection, assign UUID, spawn hive at random empty position, add 2 ants.
5. Process incoming messages: Parse JSON, validate UUID, handle move commands (8 directions), enforce 2s cooldown, check collisions/walls, handle food pickup/delivery/ant spawning.
6. Implement ant interactions: Check for ants within 1 tile distance, remove both if detected.
7. Send updates: Periodically or after moves, send each client JSON with nearby tiles (5x5 vision around each ant) including tile types and positions.
8. Handle disconnections: On WebSocket close event, remove hive and ants.
9. Add logging and error handling for invalid packets or moves.

**Relevant files**
- `server.ts` — Main server logic, WebSocket listener, message handling.
- `game.ts` — Game state class, board management, ant/hive logic.
- `types.ts` — TypeScript interfaces for messages, entities.
- `utils.ts` — Helper functions for distance, random positions, etc.

**Verification**
1. Run server with `deno run --allow-net server.ts`, verify it starts without errors.
2. Use a WebSocket client tool (e.g., browser WebSocket API or wscat) to connect, check for UUID assignment and hive spawn.
3. Send move commands, verify cooldowns, position updates, and update packets received.
4. Test ant collisions: Place ants close, ensure removal.
5. Test food mechanics: Move ant to food, carry home, spawn new ant.
6. Load test with multiple clients to ensure performance.

**Decisions**
- Board size: 200x200 grid.
- Tile types: Empty, Hive (with UUID), Food, Wall.
- Ant movement: 8 directions, grid-based, 2s cooldown per ant.
- Vision: 2 tiles radius (5x5 area) around each ant.
- Client ID: UUID assigned on first message.
- Disconnection: Immediate removal on WebSocket close event.
- Additional mechanics: Ants die if within 1 tile; food pickup/carrying/spawning.
- Communication: JSON over WebSockets; client sends {type: "connect"} or {type: "move", antId: string, direction: string}; server sends {type: "update", ants: [{id, x, y, carrying, cooldown}, ...], tiles: [[type, x, y], ...]}.

**Further Considerations**
1. Security: Validate inputs to prevent cheating (e.g., invalid directions).
2. Scalability: For many clients, optimize state updates and use efficient data structures.
