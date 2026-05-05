import { generateUUID } from "../utils.ts";
import { Hive } from "./hive.ts";

export class Player {
  hiveIds: Hive["id"][] = [];
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
