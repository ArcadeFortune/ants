import { generateUUID } from "../utils.ts";
import { Entity } from "./general.ts";

export class Hive implements Entity {
  readonly type = "hive";
  readonly id: string = generateUUID();
  tilesInVision: Set<string> = new Set();
  constructor(public playerId: string, public x: number, public y: number) {
  }
}

export class HiveDTO {
  id: string;
  playerId: string;
  constructor(hive: Hive) {
    this.id = hive.id;
    this.playerId = hive.playerId;
  }
}
