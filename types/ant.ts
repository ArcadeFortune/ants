import { generateUUID } from "../utils.ts";
import { Entity } from "./general.ts";
import { Tile } from "./tile.ts";

export class Ant implements Entity {
  readonly type = "ant";
  readonly id = generateUUID();
  carrying = false;
  lastMove = 0;
  tilesInVision: Tile[] = [];

  constructor(
    public readonly playerId: string,
    public x: number,
    public y: number,
  ) { }
}

export class AntDTO {
  readonly id: string;
  readonly playerId: string;
  x: number;
  y: number;

  constructor(ant: Ant) {
    this.id = ant.id;
    this.playerId = ant.playerId;
    this.x = ant.x;
    this.y = ant.y;
  }
}
