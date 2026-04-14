import { Game } from "./game.ts";
import { ClientMessage, serverEvent, ServerEvent } from "./types/comms.ts";
import { PlayerDTO } from "./types/player.ts";
import { TileDTO } from "./types/tile.ts";
import { generateUUID } from "./utils.ts";

const port = 8080;
const game = new Game();
const playerSockets = new Map<string, WebSocket>();
const socketPlayers = new Map<WebSocket, string>();

const clients = new Set<WebSocket>();

Deno.serve({ port, onListen: () => console.log(`Server listening on http://localhost:${port}`) }, async (req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    try {
      const url = new URL(req.url);
      let filepath = decodeURIComponent(url.pathname);
      if (filepath === "/" || filepath === "") filepath = "/index.html";
      const file = await Deno.open("./public" + filepath, { read: true });
      return new Response(file.readable);
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }
  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.addEventListener("open", () => {
    // Accept new connections
    // assign new PlayerSession
    // send InitState todo: one special server message response "ServerPlayerInitEvent"
    try {
      const playerId = generateUUID();
      const player = game.addPlayer(playerId);
      const initialHive = player.hives[0];
      if (!initialHive) return socket.send(serverEvent({ type: "error", body: { code: 500, message: "Something went wrong with the hive creation..." } }));
      playerSockets.set(playerId, socket);
      socketPlayers.set(socket, playerId);
      console.log(`Player ${playerId} connected`);

      clients.forEach(s => s.send(serverEvent({
        type: "join",
        body: {
          hiveId: initialHive.id,
        }
      })));
      clients.add(socket);

      socket.send(serverEvent({
        type: "init",
        body: {
          you: new PlayerDTO(player),
          tiles: game.getVision(initialHive, 2).map(t => new TileDTO(t))
        }
      }));
    } catch (e: unknown) {
      socket.send(serverEvent({
        type: "error",
        body: {
          code: 500,
          message: e instanceof Error ? e.message : String(e)
        }
      }));
    }
  });

  socket.addEventListener("message", (event) => {
    // Receive messages
    // validate todo: have utility function validate
    // translate into server-side actions (e.g., join, move)
    try {
      const message: ClientMessage = JSON.parse(event.data);

      switch (message.type) {
        case "ping": {
          socket.send(JSON.stringify({ type: "pong" }));
          break;
        }
        // case "whoami": {
        //   socket.send(JSON.stringify({
        //     type: "yourHive",
        //     body: {
        //       hive: game.getHive(socketPlayers.get(socket))
        //     },
        //   }));
        //   break;
        // }
        case "move": {
          //TODO; Broadcast per-player vision/updates (only what they should see)
          console.log(`Client wants to move ${message.antId} to ${message.direction}`);
          const player = socketPlayers.get(socket);
          if (!player) throw new Error("Player not found.");
          game.moveAnt(player, message.antId, message.direction);
          // game.moveAnt(message.antId, message.direction);
        }
          break;
        default: {
          socket.send(JSON.stringify({ type: "error", body: { code: 404, message: `unkown message from client: "${JSON.stringify(message)}"` } }));
        }
      }
    } catch (e: unknown) {
      socket.send(JSON.stringify({
        type: "error",
        body: {
          code: 400,
          message: e instanceof Error ? e.message : String(e),
        }
      }));
    }
    if (event.data === "ping") {
      socket.send("pong");
    }
  });

  socket.addEventListener("close", (_event) => {
    // Handle disconnects (mark player as offline; possibly reassign hive ownership or keep until timeout)
    const playerId = socketPlayers.get(socket);
    if (!playerId) return;
    clients.delete(socket);
    clients.forEach(c => c.send(JSON.stringify({
      type: "leave",
      body: {
        hiveId: playerId
      }
    } satisfies ServerEvent)));
    game.removePlayer(playerId);
  });

  return response;
});


// const handler = (req: Request) => {

//   socket.onmessage = (event) => {
//     try {
//       const msg: ClientMessage = JSON.parse(event.data);
//       if (msg.type === "move" && msg.antId && msg.direction) {
//         const success = game.moveAnt(uuid, msg.antId, msg.direction);
//         if (success) {
//           // Send update
//           const update = game.getUpdateForClient(uuid);
//           if (update) socket.send(JSON.stringify(update));
//         }
//       }
//     } catch (e) {
//       console.error("Invalid message", e);
//     }
//   };

//   socket.onclose = () => {
//     console.log(`Client ${uuid} disconnected`);
//     game.removeHive(uuid);
//   };

//   socket.onerror = (error) => {
//     console.error(`WebSocket error for ${uuid}`, error);
//     game.removeHive(uuid);
//   };

//   return response;
// };

