import { Entity } from "./entity.ts";

export type Coordinate = `${number},${number}`;

export enum TileType {
  Ground = "ground",
  Hive = "hive", //deprecated: moved to entitytype
  Ant = "ant", //deprecated: moved to entitytype
  Food = "food", //deprecated: moved to entitytype
  Wall = "wall",
  Unknown = "unknown",
}

export type VisionTile = {
  type: TileType.Hive;
  hiveId: string;
  playerId: string;
} | {
  type: TileType.Ant;
  antId: string;
  playerId: string;
};

export class Tile {
  seenBy: Map<string, VisionTile> = new Map(); // ants/hives that have seen it. will not send tile infos again to these clients. gets cleared upon any modification
  // seeingBy: Map<string, VisionTile> = new Map(); // ants/hives that are seeing it. modifying tiletype immediately informs these clients. gets cleared upon moving away
  seeingBy: Entity[] = []; // ants/hives that are seeing it. modifying tiletype immediately informs these clients. gets cleared upon moving away
  //todo: food
  constructor(private _type: TileType = TileType.Ground, public x: number, public y: number) {}

  get type() {
    return this._type;
  }

  set type(newType) {
    this._type = newType;
  }
}

export class TileDTO {
  type: TileType;
  x: number;
  y: number;
  hiveId?: string;
  antId?: string;
  antIds?: string[];
  playerId?: string;

  constructor(tile: Tile) {
    if (!tile) {
      console.log("UNKONWN TILE FOUND");
    }
    this.type = tile.type;
    this.x = tile.x;
    this.y = tile.y;
  }
}

export function generateTiles(width: number, height: number) {
  const tiles: Tile[][] = [];
  for (let y = 0; y < height; y++) {
    tiles.push([]);
    for (let x = 0; x < width; x++) {
      tiles[y].push(new Tile(TileType.Ground, x, y));
    }
  }
  return tiles;
}
