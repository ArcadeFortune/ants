import { Game } from "./game.ts";
import { ServerEvent } from "./types.ts";

const port = 8080;
const game = new Game();

const clients = new Set<WebSocket>();

Deno.serve({ port, onListen: () => console.log(`Server lsitening on ws://localhost:${port}`) }, (req) => {
  if (req.headers.get("upgrade") != "websocket") {
    return new Response(null, { status: 426 });
  }
  const { socket, response } = Deno.upgradeWebSocket(req);
  const hive = game.addHive();

  socket.addEventListener("open", () => {
    console.log(`Hive ${hive.uuid} connected`);
    clients.forEach(c => c.send(JSON.stringify({
      type: "join",
      body: {
        hiveId: hive.uuid
      }
    } satisfies ServerEvent)));
    clients.add(socket);
  });
  socket.addEventListener("message", (event) => {
    if (event.data === "ping") {
      socket.send("pong");
    }
  });
  socket.addEventListener("close", (event) => {
    clients.delete(socket);
    clients.forEach(c => c.send(JSON.stringify({
      type: "leave",
      body: {
        hiveId: hive.uuid
      }
    } satisfies ServerEvent)));
    game.removeHive(hive.uuid);
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

