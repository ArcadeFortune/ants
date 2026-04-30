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
  }

  init(url: string = "ws://localhost:6969") {
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
    this.ws.onerror = () => {};
    this.ws.onclose = () => {};
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
      case "playerInfo": {
        const playerId = message.body.id;
        this.bus.emit("gameStoreOwnPlayerId", playerId);
        break;
      }
      default: {
        console.warn(`Unknown message "${message.type}": ${message.body}`);
      }
    }
  }

  send(message: ClientMessage) {
    console.debug("[Client Message]", message);
    this.ensureWs();
    this.ws.send(JSON.stringify(message));
  }
}
