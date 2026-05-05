import { AntDTO } from "../../types/ant.ts";
import { EntityDTO } from "../../types/entity.ts";
import { Direction } from "../../types/general.ts";
import { Coordinate, TileDTO, TileType } from "../../types/tile.ts";
import { coordinateToString, getDirectionDelta } from "../../utils.ts";
import { EventBus } from "./event-bus.ts";

export class GameStore {
  protected tiles = new Map<Coordinate, TileDTO>();
  protected entities = new Map<EntityDTO["id"], EntityDTO>();
  protected _playerId: string = "";
  protected _isInitialized = false;

  protected entitiesByTileIndex = new Map<Coordinate, Set<EntityDTO["id"]>>();

  constructor(protected bus: EventBus) {
    bus.on("gameStoreTiles", (t) => this.saveTiles(t));
    bus.on("gameStoreEntities", (entities) => this.setEntities(entities));
    bus.on("gameStoreOwnPlayerId", (playerId) => this.playerId = playerId);
    bus.on("gameStoreAntMoved", (payload) => this.moveAnt(payload.antId, payload.direction));
    bus.on("gameStoreInitialized", () => {
      if (!this.checkAlive(false)) {
        return this.bus.emit("criticalError", new Error(`No ants were given to the player ${this.playerId}`));
      }
      this.bus.emit("rendererMoveCamera", this.calculateCenter());
    });
  }

  coordsToId(x: number, y: number): Coordinate {
    return `${x},${y}`;
  }

  get isInitialized() {
    return this._isInitialized;
  }

  get playerId() {
    return this._playerId;
  }

  protected set playerId(playerId: string) {
    this._playerId = playerId;
    this.checkInitialized();
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

  /**
   * check if the player has ants left in the game
   * if not, sends an gameOver event
   */
  protected checkAlive(emitEvent = true) {
    console.log("checking if alive...");
    for (const entity of this.entities.values()) {
      if (entity.type === "ant" && entity.playerId === this.playerId) return true;
    }
    emitEvent && this.bus.emit("gameOver", undefined);
    return false;
  }

  protected saveTiles(tiles: TileDTO[]) {
    for (const tile of tiles) {
      const id = this.coordsToId(tile.x, tile.y);
      this.tiles.set(id, tile);
    }
    this.checkInitialized();
  }

  protected setEntities(entities: EntityDTO[]) {
    entities.forEach((entity) => {
      this.entities.set(entity.id, entity);
      const coordinate = coordinateToString(entity);
      const tileEntities = this.entitiesByTileIndex.get(coordinate) ?? new Set();
      tileEntities.add(entity.id);
      this.entitiesByTileIndex.set(coordinate, tileEntities);
    });
    this.checkInitialized();
    this.checkAlive();
  }

  getEntityById(id: EntityDTO["id"]) {
    return this.entities.get(id);
  }

  getEntitiesByCoordinate(coordinate: Coordinate | { x: number; y: number }): EntityDTO[] {
    if (typeof coordinate !== "string") coordinate = this.coordsToId(coordinate.x, coordinate.y);
    const entities = this.entitiesByTileIndex.get(coordinate);
    if (!entities?.size) return [];
    const result = [];
    for (const entity of entities) {
      const e = this.entities.get(entity);
      if (e) result.push(e);
    }
    return result;
  }

  getEntities() {
    return this.entities.values();
  }

  protected setEntityById(id: string, entity: EntityDTO) {
    this.entities.set(id, entity);
  }

  /**
   * moves an ant from its position in the direction given.
   * called from server event, meaning any ant can be moved with this function
   */
  protected moveAnt(antId: AntDTO["id"], direction: Direction) {
    console.log("moving ant");
    const ant = this.entities.get(antId);
    if (!ant) throw new Error("Ant does not exist");
    if (ant.type !== "ant") throw new Error("This is not an ant");
    const delta = getDirectionDelta(direction);
    ant.x += delta.x;
    ant.y += delta.y;
    this.setEntities([ant]);
  }

  getEntitiesOfPlayer(playerId: string = this.playerId) {
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
  getAntsOfPlayer(playerId: string = this.playerId) {
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
