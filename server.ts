import { Game } from "./game.ts";
import { ServerEvent } from "./types/comms.ts";

const port = 8080;
const game = new Game();
const hiveSockets = new Map<string, WebSocket>();
const socketHives = new Map<WebSocket, string>();

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
    const hiveId = game.addHive();
    hiveSockets.set(hiveId, socket);
    socketHives.set(socket, hiveId);
    console.log(`Hive ${hiveId} connected`);
    clients.forEach(c => c.send(JSON.stringify({
      type: "join",
      body: {
        hiveId: hiveId
      }
    } satisfies ServerEvent)));
    clients.add(socket);
    socket.send(JSON.stringify({
      type: "tiles",
      body: {
        tiles: game.getTilesAround(hiveId.x, hiveId.y, hiveId)
      }
    } satisfies ServerEvent));
    socket.send(JSON.stringify({
      type: "newHive",
      body: {
        uuid: hiveId,
      },
    }));
  });
  socket.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(event.data); //todo: add type

      switch (message.type) {
        case "ping":
          socket.send(JSON.stringify({ type: "pong" }));
          break;
        case "whoami":
          socket.send(JSON.stringify({
            type: "yourHive",
            body: {
              hive: game.getHive(socketHives.get(socket))
            },
          }));
          break;
        default:
          socket.send(JSON.stringify({ type: "error", body: { code: 404, message: `unkown message from client: "${message.type}"` } }));
      }
    } catch (e) {
      socket.send(JSON.stringify({
        type: "error",
        body: {
          code: 400,
          message: "request was not in JSON format.",
        }
      }));
    }
    if (event.data === "ping") {
      socket.send("pong");
    }
  });
  socket.addEventListener("close", (event) => {
    const hiveId = socketHives.get(socket);
    if (!hiveId) return;
    clients.delete(socket);
    clients.forEach(c => c.send(JSON.stringify({
      type: "leave",
      body: {
        hiveId: hiveId
      }
    } satisfies ServerEvent)));
    game.removeHive(hiveId);
  });

  return response;
});


// const handler = (req: Request) => {
//   // if (req.headers.get("upgrade") !== "websocket") {
//   //   return new Response("Not a websocket request", { status: 400 });
//   // }

//   // const { socket, response } = Deno.upgradeWebSocket(req);

//   // const uuid = generateUUID();
//   try {
//     // game.addHive(uuid);
//   } catch (e) {
//     console.error("Failed to add hive", e);
//     return new Response("Server full", { status: 500 });
//   }

//   socket.onopen = () => {
//     // console.log(`Client ${uuid} connected`);
//     // Send initial update
//     const update = game.getUpdateForClient(uuid);
//     if (update) socket.send(JSON.stringify(update));
//   };

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

