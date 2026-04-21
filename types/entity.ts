import { Ant, AntDTO } from "./ant.ts";
import { Hive, HiveDTO } from "./hive.ts";

export type Entity = Hive | Ant;

export type EntityDTO = HiveDTO | AntDTO;
