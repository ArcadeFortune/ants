import { generateUUID } from "../utils.ts";
import { Ant, IAnt } from "./ant.ts";

export interface IHive {
  uuid: string;
  x: number;
  y: number;
  ants: IAnt[];
}

export class Hive implements IHive {
  ants: IAnt[];
  constructor(public uuid: string = generateUUID(), public x: number, public y: number) {
    this.ants = [new Ant(x, y), new Ant(x, y)];
  }
}

