import { generateUUID } from "../utils.ts";
import { Ant } from "./ant.ts";
import { Entity } from "./general.ts";

export class HiveDTO {
  id: string;
  constructor(hive: Hive) {
    this.id = hive.id;
  }
}

export class Hive implements Entity {
  readonly type = "hive";
  readonly id: string = generateUUID();
  ants: Ant[] = [];
  constructor(public playerId: string, public x: number, public y: number) {
    this.ants.push(...[new Ant(this.id, x, y), new Ant(this.id, x, y)]);
  }
}
