import { Entity, EntityDTO } from "./entity.ts";

export class Hive extends Entity {
  override readonly type = "hive";
  tilesInVision: Set<string> = new Set();
  constructor(playerId: string, x: number, y: number) {
    super(playerId, x, y);
  }
}

export class HiveDTO extends EntityDTO {
  override readonly type = "hive";
  constructor(hive: Hive) {
    super(hive);
  }
}
