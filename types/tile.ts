import { Ant } from "./ant.ts";
import { Entity } from "./entity.ts";
import { Hive } from "./hive.ts";

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
  hive?: Hive;
  ant?: Ant;
  //todo: food
  constructor(public type: TileType = TileType.Ground, public x: number, public y: number) {}

  setType(newType: TileType.Hive, hive: Hive): void;
  setType(newType: Exclude<TileType, TileType.Hive>, hive?: undefined): void;
  setType(newType: TileType, hive?: Hive) {
    if (newType === TileType.Hive && !hive) {
      throw new Error("Hive data is required for Hive tiles");
    }

    if (hive && newType !== TileType.Hive) {
      throw new Error("Cannot apply UUID to a non-hive tile");
    }

    this.type = newType;
    this.hive = hive;
    // this.seenBy.clear(); //todo: inform these clients of new tile
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
    this.hiveId = tile.hive?.id;
    this.antId = tile.ant?.id;
    this.playerId = tile.hive?.playerId || tile.ant?.playerId;
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
