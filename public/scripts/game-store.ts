import { AntDTO } from "../../types/ant.ts";
import { GameEntityDTO } from "../../types/entity.ts";
import { Direction } from "../../types/general.ts";
import { Coordinate, TileDTO, TileType } from "../../types/tile.ts";
import { coordinateToString, getDirectionDelta, wrap, wrapDelta } from "../../utils.ts";
import { EventBus } from "./event-bus.ts";

export class GameStore {
  protected tiles = new Map<Coordinate, TileDTO>();
  protected entities = new Map<GameEntityDTO["id"], GameEntityDTO>();
  protected _playerId: string = "";
  protected _isInitialized = false;
  protected _mapWidth = 0;
  protected _mapHeight = 0;

  protected entitiesByTileIndex = new Map<Coordinate, Set<GameEntityDTO["id"]>>();

  constructor(protected bus: EventBus) {
    bus.on("gameStoreTiles", (t) => this.saveTiles(t));
    bus.on("gameStoreEntities", (entities) => this.setEntities(entities));
    bus.on("gameStoreOwnPlayerId", (playerId) => this.playerId = playerId);
    bus.on("gameStoreMapInfo", (info) => {
      this._mapHeight = info.height;
      this._mapWidth = info.width;
    });
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

  protected setEntities(entities: GameEntityDTO[]) {
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

  getEntityById(id: GameEntityDTO["id"]) {
    return this.entities.get(id);
  }

  getEntitiesByCoordinate(coordinate: Coordinate | { x: number; y: number }): GameEntityDTO[] {
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

  protected setEntityById(id: string, entity: GameEntityDTO) {
    this.entities.set(id, entity);
  }

  /**
   * moves an ant from its position in the direction given.
   * called from server event, meaning any ant can be moved with this function
   */
  protected moveAnt(antId: AntDTO["id"], direction: Direction) {
    const ant = this.entities.get(antId);
    if (!ant) throw new Error("Ant does not exist");
    if (ant.type !== "ant") throw new Error("This is not an ant");
    const delta = getDirectionDelta(direction);
    const oldCoords = coordinateToString(ant);
    ant.x = wrap(ant.x + delta.x, this._mapWidth);
    ant.y = wrap(ant.y + delta.y, this._mapHeight);
    const newCoords = coordinateToString(ant);
    const oldTileIndex = this.entitiesByTileIndex.get(oldCoords);
    if (oldTileIndex) oldTileIndex.delete(ant.id);
    const newTileIndex = this.entitiesByTileIndex.get(newCoords) ?? new Set();
    newTileIndex.add(ant.id);
    this.entitiesByTileIndex.set(newCoords, newTileIndex);
    this.bus.emit("rendererSelectAnt", ant);
  }

  getEntitiesOfPlayer(playerId: string = this.playerId) {
    const result: GameEntityDTO[] = [];

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
    const wx = wrap(x, this._mapWidth);
    const wy = wrap(y, this._mapHeight);
    return this.tiles.get(this.coordsToId(wx, wy)) ?? { type: TileType.Unknown, x: wx, y: wy };
  }
}
