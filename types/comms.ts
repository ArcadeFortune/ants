import { Direction } from "node:readline";
import { IHive } from "./hive.ts";
import { ITileDTO } from "./tile.ts";


export interface ClientMessage {
  type: "connect" | "move";
  antId?: string;
  direction?: Direction;
}

interface ServerJoinEvent {
  type: "join";
  body: {
    hiveId: IHive["uuid"];
  };
}

interface ServerLeaveEvent {
  type: "leave";
  body: {
    hiveId: IHive["uuid"];
  };
}

interface ServerTilesEvent {
  type: "tiles";
  body: {
    tiles: ITileDTO[];
  };
}

export type ServerEvent = ServerJoinEvent | ServerLeaveEvent | ServerTilesEvent;

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
