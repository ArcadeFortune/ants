import { AntDTO } from "../../types/ant.ts";
import { EntityDTO } from "../../types/entity.ts";
import { Direction } from "../../types/general.ts";
import { TileDTO } from "../../types/tile.ts";

export interface AppEvent {
  clientConnecting: void;
  clientConnected: void;
  clientError: string;
  gameStoreTiles: TileDTO[];
  gameStoreEntities: EntityDTO[];
  gameStoreOwnPlayerId: string;
  gameStoreInitialized: void;
  gameOver: void;
  rendererMoveCamera: { x: number; y: number };
  rendererSelectAnt: AntDTO;
  gameMoveAnt: { id: EntityDTO["id"]; direction: Direction };
  criticalError: Error;
}

type listeners<E> = {
  [K in keyof E]?: Array<(payload: E[K]) => void>;
};

export class EventBus<E extends AppEvent = AppEvent> {
  private listeners: listeners<E> = {};

  on<K extends keyof E>(type: K, cb: (payload: E[K]) => void) {
    (this.listeners[type] ??= []).push(cb);
  }

  off<K extends keyof E>(type: K, cb: (payload: E[K]) => void) {
    const arr = this.listeners[type];
    if (!arr) return;

    this.listeners[type] = arr.filter((l) => l !== cb);
  }

  once<K extends keyof E>(type: K, cb: (payload: E[K]) => void) {
    const fn = (payload: E[K]) => {
      cb(payload);
      this.off(type, fn);
    };

    (this.listeners[type] ??= []).push(fn);
  }

  emit<K extends keyof E>(type: K, payload: E[K]) {
    if (type === "criticalError") alert(payload);
    else if (payload instanceof Error) console.error("[Error] %s %o", type, payload);
    else console.debug("[New Event] %s %o", type, payload);
    this.listeners[type]?.forEach((l) => {
      try {
        l(payload);
      } catch (e: unknown) {
        console.error(e instanceof Error ? e.message : String(e));
      }
    });
  }
}
