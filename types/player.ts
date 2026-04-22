import { generateUUID } from "../utils.ts";
import { Ant, AntDTO } from "./ant.ts";
import { Hive, HiveDTO } from "./hive.ts";

export class Player {
  constructor(public id: string = generateUUID()) {
  }

  clear() {
  }
}

export class PlayerDTO {
  id: string;
  constructor(player: Player) {
    this.id = player.id;
  }
}
