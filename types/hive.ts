import { generateUUID } from "../utils.ts";
import { BaseEntity } from "./entity.ts";

export class Hive implements BaseEntity {
  readonly type = "hive";
  readonly id: string = generateUUID();
  tilesInVision: Set<string> = new Set();
  constructor(public playerId: string, public x: number, public y: number) {
  }
}

export class HiveDTO implements BaseEntity {
  readonly type = "hive";
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
