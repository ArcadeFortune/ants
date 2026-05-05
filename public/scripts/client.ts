import { ClientMessage, clientMessage, ServerEvent } from "../../types/comms.ts";
import { EventBus } from "./event-bus.ts";

export class Client {
  protected ws: WebSocket | null = null;

  constructor(protected bus: EventBus) {
    this.bus.on("gameMoveAnt", (payload) => {
      this.ws?.send(clientMessage({
        type: "move",
        body: {
          antId: payload.id,
          direction: payload.direction,
        },
      }));
    });
    this.bus.on("criticalError", (reason) => {
      this.ws?.close(4000, reason.message);
    });
  }

  init(url: string = `${location.protocol === "https:" ? "wss" : "ws"}://${location.hostname}${location.hostname === "localhost" ? ":6969" : ""}`) {
    this.ws = new WebSocket(url);
    this.bus.emit("clientConnecting", undefined);
    this.ws.onopen = () => {
      this.bus.emit("clientConnected", undefined);
    };
    this.ws.onmessage = (payload) => {
      try {
        const message: ServerEvent = JSON.parse(payload.data);
        console.debug("[Server Message] %s %o", message.type, message.body);
        this.handleMessage(message);
      } catch (e: unknown) {
        this.bus.emit("clientError", e instanceof Error ? e.message : String(e));
      }
    };
    this.ws.onerror = (e) => {
      console.error(e);
    };
    this.ws.onclose = (e) => {
      console.debug("closing websocket, %o", e);
    };
  }

  protected ensureWs(): asserts this is { ws: WebSocket } {
    if (!this.ws) throw new Error("Not connected to the server.");
  }

  handleMessage(message: ServerEvent) {
    switch (message.type) {
      case "multiple": {
        for (const msg of message.body) {
          this.handleMessage(msg);
        }
        break;
      }
      case "tiles": {
        this.bus.emit("gameStoreTiles", message.body.tiles);
        break;
      }
      case "entities": {
        this.bus.emit("gameStoreEntities", message.body.entities);
        break;
      }
      case "antMoved": {
        this.bus.emit("gameStoreAntMoved", message.body);
        break;
      }
      case "playerInfo": {
        const playerId = message.body.player.id;
        this.bus.emit("gameStoreOwnPlayerId", playerId);
        break;
      }
      default: {
        console.warn("Unknown message '%s': %o", message.type, message.body);
        if (message.type === "error" && message.body.code === 500) this.bus.panic(message.body.message);
      }
    }
  }

  send(message: ClientMessage) {
    console.debug("[Client Message]", message);
    this.ensureWs();
    this.ws.send(JSON.stringify(message));
  }
}
