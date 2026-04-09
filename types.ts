export enum TileType {
  Empty = "empty",
  Hive = "hive",
  Food = "food",
  Wall = "wall",
}

export interface Position {
  x: number;
  y: number;
}

export interface Tile {
  type: TileType;
  uuid?: string; // for hive tiles
}

export interface IAnt {
  id: string;
  x: number;
  y: number;
  carrying: boolean;
  lastMove: number; // Date.now()
}

export interface Hive {
  uuid: string;
  x: number;
  y: number;
  ants: IAnt[];
}

export interface Board {
  width: number;
  height: number;
  tiles: Tile[][];
  hives: Map<string, Hive>;
}

export type Direction = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

export interface ClientMessage {
  type: "connect" | "move";
  antId?: string;
  direction?: Direction;
}

interface ServerJoinEvent {
  type: "join";
  body: {
    hiveId: Hive["uuid"];
  };
}

interface ServerLeaveEvent {
  type: "leave";
  body: {
    hiveId: Hive["uuid"];
  };
}

export type ServerEvent = ServerJoinEvent | ServerLeaveEvent | ServerMessage;

export interface ServerMessage {
  type: "update";
  ants: {
    id: string;
    x: number;
    y: number;
    carrying: boolean;
    cooldown: number;
  }[];
  tiles: {
    type: string;
    x: number;
    y: number;
    uuid?: string;
  }[];
}
