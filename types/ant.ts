import { Entity, EntityDTO } from "./entity.ts";

export class Ant extends Entity {
  override readonly type = "ant";
  carrying = false;
  lastMove = 0;
  tilesInVision: Set<string> = new Set();

  constructor(playerId: string, x: number, y: number) {
    super(playerId, x, y);
  }
}

export class AntDTO extends EntityDTO {
  override readonly type = "ant";
  carrying: boolean;
  constructor(ant: Ant) {
    super(ant);
    this.carrying = ant.carrying;
  }
}
