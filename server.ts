import * as path from "@std/path";
import { Game } from "./game.ts";
import { AntDTO } from "./types/ant.ts";
import { ClientMessage, ServerEvent, serverEvent } from "./types/comms.ts";
import { Loglevel } from "./types/general.ts";
import { PlayerDTO } from "./types/player.ts";
import { TileDTO, TileType } from "./types/tile.ts";
import { generateUUID } from "./utils.ts";
import { debounce } from "@std/async";
import { testServerEntitiesEvent, testServerPlayerInfoEvent, testServerTilesEvent } from "./tests/payloads.ts";

const loglevel: Loglevel = (Number(Deno.env.get("LOGLEVEL")) ?? Loglevel.Warning) as Loglevel;
const port = 6969;
const game = new Game();
const playerSockets = new Map<string, WebSocket>();
const socketPlayers = new Map<WebSocket, string>();

const clients = new Set<WebSocket>();

let files: Deno.bundle.Result | undefined;
const buildFrontend = debounce(async (event?: Deno.FsEvent) => {
  if (!Deno.bundle && typeof Deno.bundle !== "function") return;
  if (event) console.log("[%s] %s", event.kind, event.paths[0] + ": Building Frontend...");
  try {
    files = await Deno.bundle({
      entrypoints: ["./public/index.html"],
      outputDir: "./public",
      write: false,
      platform: "browser",
      minify: loglevel < 5,
    });
  } catch (e) {
    console.error(e);
  }
}, 200);

Deno.serve({ port, onListen: () => console.log(`Server listening on http://localhost:${port}`) }, async (req) => {
  if (req.headers.get("upgrade") !== "websocket") {
    try {
      const url = new URL(req.url);
      let filepath = decodeURIComponent(url.pathname);
      if (filepath === "/" || filepath === "") filepath = "index.html";
      console.log("[Request] %s %s", req.method, filepath);
      //serve from memory
      const memoryFile = files?.outputFiles?.find((f) => f.path === path.join(Deno.cwd(), "public", filepath));
      if (memoryFile && memoryFile.contents) return new Response(memoryFile.contents);
      try {
        //else serve from ./build
        const file = await Deno.open(path.join(Deno.cwd(), "build", filepath), { read: true });
        return new Response(file.readable);
      } catch (_e: unknown) {
        //else serve from ./public
        const file = await Deno.open(path.join(Deno.cwd(), "public", filepath), { read: true });
        return new Response(file.readable);
      }
    } catch (e) {
      console.warn("[Warning] 404 File not found, %s", e instanceof Error ? e.message : String(e));
      return new Response("Not found", { status: 404 });
    }
  }
  console.log("[Request] WS %s", req.url);
  const { socket, response } = Deno.upgradeWebSocket(req);

  socket.addEventListener("open", () => {
    try {
      socket.send(serverEvent(testServerTilesEvent));
      socket.send(serverEvent(testServerEntitiesEvent));
      socket.send(serverEvent(testServerPlayerInfoEvent));
      return;
      // const playerId = generateUUID();
      // const player = game.addPlayer(playerId);
      // const initialHive = player.hives[0];
      // if (!initialHive) return socket.send(serverEvent({ type: "error", body: { code: 500, message: "Something went wrong with the hive creation..." } }));
      // playerSockets.set(playerId, socket);
      // socketPlayers.set(socket, playerId);
      // console.log(`Player ${playerId} connected`);

      // clients.forEach((s) =>
      //   s.send(serverEvent({
      //     type: "join",
      //     body: {
      //       hiveId: initialHive.id,
      //     },
      //   }))
      // );
      // clients.add(socket);

      // socket.send(serverEvent({
      //   type: "multiple",
      //   body: [
      //     {
      //       type: "playerInfo",
      //       body: new PlayerDTO(player),
      //     },
      //     {
      //       type: "tiles",
      //       body: {
      //         tiles: game.getVision(initialHive, 2).map((t) => new TileDTO(t)),
      //       },
      //     },
      //   ],
      // }));
    } catch (e: unknown) {
      socket.send(serverEvent({
        type: "error",
        body: {
          code: 500,
          message: e instanceof Error ? e.message : String(e),
        },
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
        case "move":
          {
            //TODO; Broadcast per-player vision/updates (only what they should see)
            console.log(`Client wants to move ${message.body.antId} to ${message.body.direction}`);
            const player = socketPlayers.get(socket);
            if (!player) throw new Error("Player not found.");
            const ant = game.moveAnt(player, message.body.antId, message.body.direction);
            socket.send(serverEvent({
              type: "multiple",
              body: [
                {
                  type: "yourAntMoved",
                  body: {
                    ant: new AntDTO(ant),
                  },
                },
                {
                  type: "tiles",
                  body: {
                    tiles: game.getVision(ant),
                  },
                },
              ],
            }));
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
        },
      }));
    }
    if (event.data === "ping") {
      socket.send("pong");
    }
  });

  socket.addEventListener("close", (_event) => {
    try {
      // Handle disconnects (mark player as offline; possibly reassign hive ownership or keep until timeout)
      const playerId = socketPlayers.get(socket);
      if (!playerId) return;
      clients.delete(socket);
      clients.forEach((c) =>
        c.send(JSON.stringify(
          {
            type: "leave",
            body: {
              hiveId: playerId,
            },
          } satisfies ServerEvent,
        ))
      );
      game.removePlayer(playerId);
    } catch (e: unknown) {
      socket.send(JSON.stringify({
        type: "error",
        body: {
          code: 400,
          message: e instanceof Error ? e.message : String(e),
        },
      }));
    }
  });

  socket.addEventListener("error", (_event) => {
    console.error("[Error] 500 Socket had an error.");
    // Handle disconnects (mark player as offline; possibly reassign hive ownership or keep until timeout)
    const playerId = socketPlayers.get(socket);
    if (!playerId) return;
    clients.delete(socket);
    clients.forEach((c) =>
      c.send(JSON.stringify(
        {
          type: "leave",
          body: {
            hiveId: playerId,
          },
        } satisfies ServerEvent,
      ))
    );
    game.removePlayer(playerId);
  });

  return response;
});

buildFrontend();

if (loglevel >= Loglevel.Debug) {
  const watcher = Deno.watchFs(["./public"]);

  for await (const event of watcher) {
    buildFrontend(event);
  }
}
