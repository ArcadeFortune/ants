import { generateUUID } from "../utils.ts";
import { Ant, AntDTO } from "./ant.ts";
import { Hive, HiveDTO } from "./hive.ts";

export type GameEntity = Hive | Ant;
export type GameEntityDTO = HiveDTO | AntDTO;
export class Entity {
  readonly id = generateUUID();
  type: "hive" | "ant" | "generic" = "generic";

  constructor(public playerId: string, public x: number, public y: number) {
  }
}

export class EntityDTO {
  id: Entity["id"];
  type: Entity["type"];
  playerId: string;
  x: number;
  y: number;

  constructor(entity: Entity) {
    this.id = entity.id;
    this.type = entity.type;
    this.playerId = entity.playerId;
    this.x = entity.x;
    this.y = entity.y;
  }
}
