import { TileDTO } from "./tile.ts";
import { AntDTO } from "./ant.ts";
import { PlayerDTO } from "./player.ts";
import { Direction } from "./general.ts";
import { EntityDTO } from "./entity.ts";

interface ServerPlayerInfoEvent {
  type: "playerInfo";
  body: PlayerDTO;
}

interface ServerJoinEvent {
  type: "join";
  body: {
    hiveId: string;
  };
}

interface ServerLeaveEvent {
  type: "leave";
  body: {
    hiveId: string;
  };
}

interface ServerTilesEvent {
  type: "tiles";
  body: {
    tiles: TileDTO[];
  };
}

interface ServerEntitiesEvent {
  type: "entities";
  body: {
    entities: EntityDTO[];
  };
}

interface ServerOwnAntMovedEvent {
  type: "yourAntMoved";
  body: {
    ant: AntDTO;
  };
}

interface ServerErrorEvent {
  type: "error";
  body: {
    code: number;
    message: string;
  };
}

interface ServerMultipleEvents {
  type: "multiple";
  body: BaseServerEvent[];
}

type BaseServerEvent = ServerPlayerInfoEvent | ServerJoinEvent | ServerLeaveEvent | ServerTilesEvent | ServerEntitiesEvent | ServerOwnAntMovedEvent | ServerErrorEvent;

export type ServerEvent = BaseServerEvent | ServerMultipleEvents;

export function serverEvent(e: ServerEvent): string {
  return JSON.stringify(e);
}

interface ClientPingMessage {
  type: "ping";
  body: void;
}

interface ClientWhoAmIMessage {
  type: "whoami";
  body: void;
}

interface ClientMoveMessage {
  type: "move";
  body: {
    antId: string;
    direction: Direction;
  };
}

export type ClientMessage = ClientPingMessage | ClientWhoAmIMessage | ClientMoveMessage;

export function clientMessage(e: ClientMessage): string {
  console.debug("[Client Message] %s %o", e.type, e);
  return JSON.stringify(e);
}
// export interface ServerMessage {
//   type: "update";
//   ants: {
//     id: string;
//     x: number;
//     y: number;
//     carrying: boolean;
//     cooldown: number;
//   }[];
//   tiles: {
//     type: string;
//     x: number;
//     y: number;
//     uuid?: string;
//   }[];
// }
