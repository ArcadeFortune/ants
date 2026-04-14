import { generateUUID } from "../utils.ts";
import { Ant } from "./ant.ts";
import { Entity } from "./general.ts";
import { Tile } from "./tile.ts";

export class Hive implements Entity {
  readonly type = "hive";
  readonly id: string = generateUUID();
  ants: Ant[] = [];
  tilesInVision: Tile[] = [];
  constructor(public playerId: string, public x: number, public y: number) {
    this.ants.push(...[new Ant(playerId, x, y), new Ant(playerId, x, y)]);
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
