import { generateUUID } from "../utils.ts";
import { Ant } from "./ant.ts";
import { Entity, EntityDTO } from "./entity.ts";
import { TileType } from "./tile.ts";

export class Hive implements Entity {
  readonly type = TileType.Hive;
  readonly id: string = generateUUID();
  antIds: Ant["id"][];
  tilesInVision: Set<string> = new Set();
  constructor(public playerId: string, public x: number, public y: number) {
    this.antIds = [new Ant(playerId, x, y).id, new Ant(playerId, x, y).id];
  }
}

export class HiveDTO implements EntityDTO {
  readonly type = TileType.Hive;
  id: string;
  playerId: string;
  antIds: Ant["id"][] = [];
  x: number;
  y: number;
  constructor(hive: Hive) {
    this.id = hive.id;
    this.playerId = hive.playerId;
    this.x = hive.x;
    this.y = hive.y;
    this.antIds = [new Ant(hive.playerId, hive.x, hive.y).id, new Ant(hive.playerId, hive.x, hive.y).id];
  }
}
