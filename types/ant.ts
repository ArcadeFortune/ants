import { generateUUID } from "../utils.ts";

export interface IAnt {
  id: string;
  x: number;
  y: number;
  carrying: boolean;
  lastMove: number; // Date.now()
}

export class Ant implements IAnt {
  id = generateUUID();
  carrying = false;
  lastMove = 0;

  constructor(
    public x: number,
    public y: number
  ) { }
}
