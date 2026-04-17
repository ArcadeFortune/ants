import { ClientMessage, ServerEvent } from "../../types/comms.ts";
import { EventBus } from "./event-bus.ts";

export class Client {
  protected ws: WebSocket | null = null;

  constructor(protected bus: EventBus) {}

  connect(url: string = "ws://localhost:8080") {
    this.ws = new WebSocket(url);
    this.ws.onopen = () => {
      this.bus.emit("clientConnected", undefined);
    };
    this.ws.onmessage = (payload) => {
      try {
        const message: ServerEvent = JSON.parse(payload.data);
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
    }
  }

  send(message: ClientMessage) {
    this.ensureWs();
    this.ws.send(JSON.stringify(message));
  }
}
