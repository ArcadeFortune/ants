import { TileType } from "./tile.ts";

export interface Entity {
  id: string;
  playerId: string;
  type: TileType;
  tilesInVision: Set<string>; // x,y eg. 12,34
  x: number;
  y: number;
}

export interface EntityDTO {
  id: string;
  playerId: string;
  type: TileType;
  x: number;
  y: number;
}
