import { generateUUID } from "../utils.ts";
import { BaseEntity, EntityType } from "./entity.ts";

export class Ant implements BaseEntity {
  readonly type: EntityType = "ant";
  readonly id = generateUUID();
  carrying = false;
  lastMove = 0;
  tilesInVision: Set<string> = new Set();

  constructor(
    public readonly playerId: string,
    public x: number,
    public y: number,
  ) {}
}

export class AntDTO implements BaseEntity {
  readonly type: EntityType = "ant";
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
