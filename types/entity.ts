import { Ant, AntDTO } from "./ant.ts";
import { Hive, HiveDTO } from "./hive.ts";

export interface BaseEntity {
  type: string;
  playerId: string;
  x: number;
  y: number;
}

export type Entity = Hive | Ant;

export type EntityDTO = HiveDTO | AntDTO;
