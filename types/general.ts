import { Player } from "./player.ts";
import { Tile } from "./tile.ts";

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  playerId: string;
  type: "hive" | "ant" | "food";
  tilesInVision: Set<string>; // x,y eg. 12,34
  x: number;
  y: number;
}


export type Direction = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

export interface Board {
  width: number;
  height: number;
  tiles: Tile[][];
  // hives: Map<string, Hive>;
  players: Map<string, Player>;
}
