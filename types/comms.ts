import { TileDTO } from "./tile.ts";
import { AntDTO } from "./ant.ts";
import { PlayerDTO } from "./player.ts";
import { Direction } from "./general.ts";


interface ServerPlayerInfoEvent {
  type: "playerInfo";
  body: {
    info: PlayerDTO;
  };
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

export type ServerEvent = ServerPlayerInfoEvent | ServerJoinEvent | ServerLeaveEvent | ServerTilesEvent | ServerOwnAntMovedEvent | ServerErrorEvent;
export type ServerEvents = {
  type: "multiple";
  body: ServerEvent[];
};

export function serverEvent(e: ServerEvent | ServerEvents): string {
  return JSON.stringify(e);
}


interface ClientPingMessage {
  type: "ping";
}

interface ClientWhoAmIMessage {
  type: "whoami";
}

interface ClientMoveMessage {
  type: "move";
  antId: string;
  direction: Direction;
}

export type ClientMessage = ClientPingMessage | ClientWhoAmIMessage | ClientMoveMessage;
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
