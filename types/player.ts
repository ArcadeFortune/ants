import { generateUUID } from "../utils.ts";
import { Ant, AntDTO } from "./ant.ts";
import { Hive, HiveDTO } from "./hive.ts";

export class Player {
  hives: Hive[] = [];
  ants: Ant[] = []; //shortcut
  constructor(public id: string = generateUUID(), x: number, y: number) {
    const hive = new Hive(id, x, y);
    this.hives.push(hive);
    this.ants.push(...[new Ant(id, x, y), new Ant(id, x, y)]);
  }

  clear() {
    this.ants.length = 0;
    this.hives.length = 0;
  }
}

export class PlayerDTO {
  id: string;
  hives: HiveDTO[];
  ants: AntDTO[];
  constructor(player: Player) {
    this.id = player.id;
    this.hives = player.hives.map(h => new HiveDTO(h));
    this.ants = player.ants.map(a => new AntDTO(a));
  }
}
