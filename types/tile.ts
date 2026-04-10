import { IHive } from "./hive.ts";

export enum TileType {
  Empty = "empty",
  Hive = "hive",
  Food = "food",
  Wall = "wall",
}

export interface ITile {
  readonly type: TileType;
  seenBy: Set<IHive>; // players that had seen it, gets cleared if type changes
  hive?: IHive; // for hive tiles

  setType(newType: TileType.Hive, hive: IHive): void;
  setType(newType: Exclude<TileType, TileType.Hive>, hive?: undefined): void;
  setType(newType: TileType, hive?: IHive): void;
}

export interface ITileDTO {
  type: ITile["type"];
  seenBy: Set<IHive["uuid"]>;
  hive: IHive["uuid"];
}

export class Tile implements ITile {
  seenBy: ITile["seenBy"] = new Set();
  constructor(public type: ITile["type"] = TileType.Empty, public hive?: ITile["hive"]) { }


  setType(newType: TileType.Hive, hive: IHive): void;
  setType(newType: Exclude<TileType, TileType.Hive>, hive?: undefined): void;
  setType(newType: TileType, hive?: IHive) {
    if (newType === TileType.Hive && !hive) {
      throw new Error("Hive data is required for Hive tiles");
    }

    if (hive && newType !== TileType.Hive) {
      throw new Error("Cannot apply UUID to a non-hive tile");
    }

    this.type = newType;
    this.hive = hive;
    this.seenBy.clear();
  }
}
