import { generateUUID } from "../utils.ts";
import { Ant, AntDTO } from "./ant.ts";
import { Hive, HiveDTO } from "./hive.ts";

export class Player {
  hives: Hive[] = [];
  ants: Map<string, Ant> = new Map(); //shortcut
  constructor(public id: string = generateUUID(), x: number, y: number) {
    const hive = new Hive(id, x, y);
    this.hives.push(hive);
    hive.ants.forEach(a => this.ants.set(a.id, a));
  }

  clear() {
    this.ants.clear();
    this.hives.forEach(h => h.ants.length = 0);
    this.hives.length = 0;
  }
}

export class PlayerDTO {
  hives: HiveDTO[];
  ants: AntDTO[];
  constructor(player: Player) {
    this.hives = player.hives.map(h => new HiveDTO(h));
    this.ants = player.hives.flatMap(h => h.ants.map(a => new AntDTO(a)));
  }
}
