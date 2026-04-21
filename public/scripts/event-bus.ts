import { EntityDTO } from "../../types/entity.ts";
import { TileDTO } from "../../types/tile.ts";

export interface AppEvent {
  clientConnected: undefined;
  clientError: string;
  gameStoreTiles: TileDTO[];
  gameStoreEntities: EntityDTO[];
  gameStoreOwnPlayerId: string;
  rendererMoveCamera: { x: number; y: number };
}

type listeners<E> = {
  [K in keyof E]?: Array<(payload: E[K]) => void>;
};
export class EventBus<E extends AppEvent = AppEvent> {
  private listeners: listeners<E> = {};

  on<K extends keyof E>(type: K, cb: (payload: E[K]) => void) {
    (this.listeners[type] ??= []).push(cb);
  }

  emit<K extends keyof E>(type: K, payload: E[K]) {
    console.debug("[New Event]: %s, %o", type, payload);
    this.listeners[type]?.forEach((l) => l(payload));
  }
}
