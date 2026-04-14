import { HiveDTO } from "./hive.ts";
import { TileDTO } from "./tile.ts";
import { AntDTO } from "./ant.ts";
import { PlayerDTO } from "./player.ts";
import { Direction } from "./general.ts";


interface ServerPlayerInitEvent {
  type: "init";
  body: {
    you: PlayerDTO;
    tiles: TileDTO[];
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

interface ServerYourIdentityEvent {
  type: "yourIdentity";
  body: {
    playerId: string;
    hive: HiveDTO;
    ants: AntDTO[];
  };
}

interface ServerErrorEvent {
  type: "error";
  body: {
    code: number;
    message: string;
  };
}

export type ServerEvent = ServerPlayerInitEvent | ServerJoinEvent | ServerLeaveEvent | ServerTilesEvent | ServerYourIdentityEvent | ServerErrorEvent;

export function serverEvent(e: ServerEvent): string {
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
