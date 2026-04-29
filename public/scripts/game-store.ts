import { EntityDTO } from "../../types/entity.ts";
import { Coordinate, TileDTO, TileType } from "../../types/tile.ts";
import { EventBus } from "./event-bus.ts";

export class GameStore {
  protected tiles = new Map<Coordinate, TileDTO>();
  protected entities = new Map<EntityDTO["id"], EntityDTO>();
  protected playerId: string = "";

  protected entitiesByTileIndex = new Map<Coordinate, EntityDTO[]>();

  constructor(protected bus: EventBus) {
    bus.on("gameStoreTiles", (t) => this.saveTiles(t));
    bus.on("gameStoreEntities", (entities) => this.setEntities(entities));
    bus.on("gameStoreOwnPlayerId", (playerId) => this.setPlayerId(playerId));
  }

  coordsToId(x: number, y: number): Coordinate {
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

  protected setEntities(entities: EntityDTO[]) {
    entities.forEach((e) => {
      this.entities.set(e.id, e);

      const coordinate = this.coordsToId(e.x, e.y);
      const entities = this.entitiesByTileIndex.get(coordinate) ?? [];
      entities.push(e);
      this.entitiesByTileIndex.set(coordinate, entities);
    });
  }

  getEntityById(id: EntityDTO["id"]) {
    return this.entities.get(id);
  }

  getEntitiesByCoordinate(coordinate: Coordinate | { x: number; y: number }) {
    if (typeof coordinate !== "string") coordinate = this.coordsToId(coordinate.x, coordinate.y);
    return this.entitiesByTileIndex.get(coordinate);
  }

  getEntities() {
    return this.entities.values();
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
