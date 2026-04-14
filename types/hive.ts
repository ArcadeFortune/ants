import { generateUUID } from "../utils.ts";
import { Entity } from "./general.ts";
import { TileType } from "./tile.ts";

export class Hive implements Entity {
  readonly type = TileType.Hive;
  readonly id: string = generateUUID();
  tilesInVision: Set<string> = new Set();
  constructor(public playerId: string, public x: number, public y: number) {
  }
}

export class HiveDTO {
  readonly type = TileType.Hive;
  id: string;
  playerId: string;
  x: number;
  y: number;
  constructor(hive: Hive) {
    this.id = hive.id;
    this.playerId = hive.playerId;
    this.x = hive.x;
    this.y = hive.y;
  }
}
