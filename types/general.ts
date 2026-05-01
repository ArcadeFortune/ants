import { Entity } from "./entity.ts";
import { Player } from "./player.ts";
import { Coordinate, Tile } from "./tile.ts";

export enum Loglevel {
  Critical = 1,
  Error = 2,
  Warning = 3,
  General = 4,
  Debug = 5,
}

export interface Position {
  x: number;
  y: number;
}

export type Direction = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

export interface Board {
  width: number;
  height: number;
  tiles: Tile[][];
  entities: Map<Player["id"], Entity>;
  players: Map<string, Player>;
  entitiesByTileIndex: Map<Coordinate, Entity[]>;
}
