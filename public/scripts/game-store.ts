import { AntDTO } from "../../types/ant.ts";
import { EntityDTO } from "../../types/entity.ts";
import { Coordinate, TileDTO, TileType } from "../../types/tile.ts";
import { EventBus } from "./event-bus.ts";

export class GameStore {
  protected tiles = new Map<Coordinate, TileDTO>();
  protected entities = new Map<EntityDTO["id"], EntityDTO>();
  protected playerId: string = "";
  protected _isInitialized = false;

  protected entitiesByTileIndex = new Map<Coordinate, EntityDTO[]>();

  constructor(protected bus: EventBus) {
    bus.on("gameStoreTiles", (t) => this.saveTiles(t));
    bus.on("gameStoreEntities", (entities) => this.setEntities(entities));
    bus.on("gameStoreOwnPlayerId", (playerId) => this.setPlayerId(playerId));
    bus.on("gameStoreInitialized", () => this.bus.emit("rendererMoveCamera", this.calculateCenter()));
  }

  coordsToId(x: number, y: number): Coordinate {
    return `${x},${y}`;
  }

  get isInitialized() {
    return this._isInitialized;
  }

  /**
   * check if necessary values are set
   * if the values are set for the first time, event 'gameStoreInitialized' is emitted
   */
  protected checkInitialized() {
    if (this.isInitialized) return true;
    else if (
      this.tiles.size === 0 ||
      this.entities.size === 0 ||
      !this.playerId
    ) return false;
    else {
      this._isInitialized = true;
      this.bus.emit("gameStoreInitialized", undefined);
      return true;
    }
  }

  protected saveTiles(tiles: TileDTO[]) {
    for (const tile of tiles) {
      const id = this.coordsToId(tile.x, tile.y);
      this.tiles.set(id, tile);
    }
    this.checkInitialized();
  }

  getPlayerId() {
    return this.playerId;
  }

  protected setPlayerId(playerId: string) {
    this.playerId = playerId;
    this.checkInitialized();
  }

  protected setEntities(entities: EntityDTO[]) {
    entities.forEach((e) => {
      this.entities.set(e.id, e);

      const coordinate = this.coordsToId(e.x, e.y);
      const entities = this.entitiesByTileIndex.get(coordinate) ?? [];
      entities.push(e);
      this.entitiesByTileIndex.set(coordinate, entities);
    });
    this.checkInitialized();
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

  getEntitiesOfPlayer(playerId: string = this.getPlayerId()) {
    const result: EntityDTO[] = [];

    for (const e of this.entities.values()) {
      if (e.playerId === playerId) {
        result.push(e);
      }
    }

    return result;
  }

  /**
   * loops over all entities to find the ones belonging to the player & are ants
   */
  getAntsOfPlayer(playerId: string = this.getPlayerId()) {
    const result: AntDTO[] = [];

    for (const e of this.entities.values()) {
      if (e.type === "ant" && e.playerId === playerId) {
        result.push(e);
      }
    }

    return result;
  }

  protected calculateCenter(tiles = [...this.tiles.values()]) {
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
