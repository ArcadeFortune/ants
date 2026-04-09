import { IAnt } from "./types.ts";
import { generateUUID } from "./utils.ts";

export class Ant implements IAnt {
  id = generateUUID();
  carrying = false;
  lastMove = 0;

  constructor(
    public x: number,
    public y: number
  ) { }
}
