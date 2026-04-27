import { AntDTO } from "../../types/ant.ts";
import { EntityDTO } from "../../types/entity.ts";
import { HiveDTO } from "../../types/hive.ts";
import { PlayerDTO } from "../../types/player.ts";
import { TileDTO, TileType } from "../../types/tile.ts";
import { EventBus } from "./event-bus.ts";

interface TileEntitiesIndex {
  hive?: HiveDTO;
  ants?: AntDTO[];
}
export class GameStore {
  protected tiles = new Map<string, TileDTO>();
  protected entities = new Map<EntityDTO["id"], EntityDTO>();
  protected playerId: string = "";

  protected hiveByTileIndex = new Map<string, HiveDTO>();
  // protected playerToAntIds = new Map<PlayerDTO["id"], Set<AntDTO["id"]>>();

  constructor(protected bus: EventBus) {
    bus.on("gameStoreTiles", (t) => this.saveTiles(t));
    bus.on("gameStoreEntities", (entities) => this.setEntities(entities));
    bus.on("gameStoreOwnPlayerId", (playerId) => this.setPlayerId(playerId));
  }

  coordsToId(x: number, y: number) {
    return `${x},${y}`;
  }

  protected saveTiles(tiles: TileDTO[]) {
    if (this.tiles.size === 0) {
      this.bus.emit("rendererMoveCamera", this.calculateCenter(tiles));
    }
    for (const tile of tiles) {
      const id = this.coordsToId(tile.x, tile.y);
      this.tiles.set(id, tile);
    }
  }

  getPlayerId() {
    return this.playerId;
  }

  protected setPlayerId(playerId: string) {
    this.playerId = playerId;
  }

  protected indexEntity(e: EntityDTO) {
    if (e.type === "hive") {
      return this.hiveByTileIndex.set(this.coordsToId(e.x, e.y), e);
    }
  }

  protected setEntities(entities: EntityDTO[]) {
    entities.forEach((e) => {
      this.entities.set(e.id, e);
      this.indexEntity(e);
    });
  }

  getEntity(id: EntityDTO["id"]) {
    return this.entities.get(id);
  }

  getEntities() {
    return this.entities.values();
  }

  getHiveOnCoordinates(x: number, y: number) {
    return this.hiveByTileIndex.get(this.coordsToId(x, y));
  }

  // protected indexAnt(e: EntityDTO) {
  //   const ownerId = e.playerId;
  //   if (e.type === TileType.Ant) {
  //     const ids = this.playerToAntIds.get(ownerId) ?? new Set();
  //     ids.add(e.id);
  //     this.playerToAntIds.set(ownerId, ids);
  //   } else if (e.type === TileType.Hive && e.antIds.length && e.antIds.length > 0) {
  //     const ids = this.playerToAntIds.get(ownerId) ?? new Set();
  //     e.antIds.forEach((id) => {
  //       ids.add(id);
  //     });
  //     this.playerToAntIds.set(ownerId, ids);
  //   }
  // }

  getEntityById(id: string) {
    this.entities.get(id);
  }

  protected setEntityById(id: string, entity: EntityDTO) {
    this.entities.set(id, entity);
  }

  getEntitiesOfPlayer(playerId: string) {
    const result: EntityDTO[] = [];

    for (const e of this.entities.values()) {
      if (e.playerId === playerId) {
        result.push(e);
      }
    }

    return result;
  }

  // getAntIdsOfPlayer(playerId: string) {
  //   return this.playerToAntIds.get(playerId) ?? new Set();
  // }

  // getAntsOfPlayer(playerId: string) {
  //   const antIds = this.playerToAntIds.get(playerId) ?? new Set();
  //   const ants: AntDTO[] = [];
  //   antIds.forEach((id) => {
  //     const entity = this.entities.get(id);
  //     if (entity && entity.type === TileType.Ant) ants.push(entity);
  //   });
  //   return ants;
  // }

  protected calculateCenter(tiles: TileDTO[]) {
    let xSum = 0;
    let ySum = 0;
    tiles.forEach((tile) => {
      xSum += tile.x;
      ySum += tile.y;
    });
    return { x: xSum / tiles.length, y: ySum / tiles.length };
  }

  getTile(x: number, y: number) {
    return this.tiles.get(this.coordsToId(x, y)) ?? { type: TileType.Unknown, x, y };
  }
}
