import { IAnt } from "./ant.ts";
import { IHive } from "./hive.ts";

export enum TileType {
  Empty = "empty",
  Hive = "hive",
  Ant = "ant",
  Food = "food",
  Wall = "wall",
}

export type VisionTile = {
  type: TileType.Hive;
  hive: IHive;
} | {
  type: TileType.Ant;
  ant: IAnt;
};

export interface ITile {
  readonly type: TileType;
  seenBy: Set<VisionTile>; // ants/hives that have seen it. will not send tile infos again to these clients. gets cleared upon any modification
  seeingBy: Set<VisionTile>; // ants/hives that are seeing it. modifying tiletype immediately informs these clients. gets cleared upon moving away
  hive?: IHive; // for hive tiles

  setType(newType: TileType.Hive, hive: IHive): void;
  setType(newType: Exclude<TileType, TileType.Hive>, hive?: undefined): void;
  setType(newType: TileType, hive?: IHive): void;
}

export interface ITileDTO {
  type: ITile["type"];
  hiveId?: IHive["uuid"];
}

export class Tile implements ITile {
  seenBy: ITile["seenBy"] = new Set();
  seeingBy: ITile["seeingBy"] = new Set();
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
    // this.seenBy.clear(); //todo: inform these clients of new tile
  }
}
