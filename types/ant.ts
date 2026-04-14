import { generateUUID } from "../utils.ts";
import { Entity } from "./general.ts";

export class Ant implements Entity {
  readonly type = "ant";
  readonly id = generateUUID();
  carrying = false;
  lastMove = 0;

  constructor(
    public hiveId: string,
    public x: number,
    public y: number,
  ) { }
}

export class AntDTO {
  id: string;
  hiveId: string;
  x: number;
  y: number;

  constructor(ant: Ant) {
    this.id = ant.id;
    this.hiveId = ant.hiveId;
    this.x = ant.x;
    this.y = ant.y;
  }
}
