import { IHive } from "./hive.ts";
import { ITile } from "./tile.ts";

export interface Position {
  x: number;
  y: number;
}

export type Direction = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

export interface Board {
  width: number;
  height: number;
  tiles: ITile[][];
  hives: Map<string, IHive>;
}
