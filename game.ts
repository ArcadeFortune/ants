import { generateTiles, Tile, TileType } from "./types/tile.ts";
import { Board, Direction, Position } from "./types/general.ts";
import { Entity } from "./types/entity.ts";
import { Player } from "./types/player.ts";
import { Ant } from "./types/ant.ts";
import { Hive } from "./types/hive.ts";
import { coordinateToString } from "./utils.ts";

export class Game {
  board: Board;

  constructor() {
    this.board = {
      width: 20,
      height: 20,
      tiles: generateTiles(200, 200),
      players: new Map(),
      entities: new Map(),
      entitiesByTileIndex: new Map(),
    };
    // Initialize some food and walls randomly
    for (let y = 0; y < 200; y++) {
      for (let x = 0; x < 200; x++) {
        const rand = Math.random();
        const tile = this.board.tiles[y][x];
        if (rand < 0.05) {
          tile.type = TileType.Wall;
        } else if (rand < 0.15) {
          // tile.setType(TileType.Food);
          ///todo: add food entity
        }
      }
    }
  }

  /**
   * store player id
   * finds random position on map to place a hive
   * adds ants to that hive
   * @throws if no space is available
   * @returns Player
   */
  addPlayer(playerId: Player["id"]) {
    const maxTries = 200;
    let tries = 0;
    let position: Position | undefined;
    //todo: add max entity count limit

    for (tries = 0; tries < maxTries && !position; tries++) {
      const t = this.board.tiles[Math.floor(Math.random() * this.board.height)][Math.floor(Math.random() * this.board.width)];
      if (t.type === TileType.Ground) {
        position = { x: t.x, y: t.y };
      }
    }
    if (!position) throw new Error("No empty position for hive");
    const player = new Player(playerId);
    this.board.players.set(player.id, player);

    const hive = new Hive(playerId, position.x, position.y);
    this.addEntity(hive);
    player.hiveIds.push(hive.id);
    const ants = [new Ant(playerId, position.x, position.y), new Ant(playerId, position.x, position.y)];
    ants.forEach((a) => this.addEntity(a));

    return player;
  }

  removePlayer(playerId: string) {
    const player = this.board.players.get(playerId);
    if (!player) throw new Error("Player does not exist");

    // for (const hive of player.hives) {
    //   this.board.tiles[hive.y][hive.x].setType(TileType.Empty);
    // }

    // player.hives.length = 0;
    player.clear();
    this.board.players.delete(player.id);
  }

  addEntity(entity: Entity) {
    this.board.entities.set(entity.id, entity);

    const coordinate = coordinateToString(entity);
    const entities = this.board.entitiesByTileIndex.get(coordinate) ?? [];
    entities.push(entity);
    this.board.entitiesByTileIndex.set(coordinate, entities);
  }

  removeEntity(entity: Entity) {
    this.board.entities.delete(entity.id);

    const coordinate = coordinateToString(entity);
    const entities = this.board.entitiesByTileIndex.get(coordinate) ?? [];
    const filtered = entities.filter((e) => e.id !== entity.id);
    this.board.entitiesByTileIndex.set(coordinate, filtered);
  }

  /**
   * gets vision around an entity, also marking these tiles as seen by that entity
   * @returns new tiles affected
   */
  getVision(entity: Entity, radius: number = 2) {
    //todo: new ants spawning in a hive should go through this function to have the tiles register that this ant is looking at it.
    const oldTilesInVision = new Set(entity.tilesInVision);
    const newTiles: Tile[] = [];
    const previousTilesInVision: Set<string> = new Set();
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = entity.x + dx;
        const y = entity.y + dy;
        const tile = this.board.tiles[y][x];

        if (tile.seeingBy.find((e) => e.id === entity.id)) {
          previousTilesInVision.add(`${tile.x},${tile.y}`);
        } else {
          newTiles.push(tile);
          tile.seeingBy.push(entity);
          entity.tilesInVision.add(`${tile.x},${tile.y}`);
        }
      }
    }
    for (const tile of oldTilesInVision) {
      if (previousTilesInVision.has(tile)) {
        //tile still in vision
      } else {
        //old tiles not in vision anymore
        const [x, y] = tile.split(",").map(Number);
        const tileNotInVision = this.board.tiles[y][x];
        const index = tileNotInVision.seeingBy.indexOf(entity);
        tileNotInVision.seeingBy.splice(index, 1);
      }
    }
    return newTiles;
  }

  /**
   * verison 2 of getVision
   * @returns both tiles and entities
   */
  getTilesAndEntitesAroundEntity(entity: Entity, radius = 2) {
    const result: { tiles: Tile[]; entities: Entity[] } = { tiles: [], entities: [] };
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = entity.x + dx;
        const y = entity.y + dy;
        const tile = this.board.tiles[y][x];
        const entities = this.board.entitiesByTileIndex.get(`${x},${y}`);

        result.tiles.push(tile);
        if (entities && entities.length) result.entities.push(...entities);
      }
    }
    return result;
  }

  // removeVision(x: number, y: number, hiveId: number, radius: number = 2, antId?: number) {
  //   //if ant, remove that ant id from the tiles
  //   //if hiveid, remove that hiveid from the tiles
  // }

  // spawnAnt(hive: Hive) {
  //   const ant = new Ant(hive.id, hive.x, hive.y);
  //   this.board.hives.get(hive.id)?.ants.push(ant);
  //   return ant;
  // }

  // getAnts(playerId: string) {
  //   const hive = this.board.hives.get(playerId);
  //   if (!hive) return [];
  //   return hive.ants;
  // }

  moveAnt(playerId: string, antId: string, direction: Direction): Ant {
    const player = this.board.players.get(playerId);
    if (!player) throw new Error("Player does not exist.");
    const ant = player.ants.find((a) => a.id === antId);
    if (!ant) throw new Error("Player does not own this ant.");
    // const hive = this.board.hives.get(hiveId);
    // const now = Date.now();
    // if (now - ant.lastMove < 2000) return false; // cooldown

    const delta = getDirectionDelta(direction);

    const newX = ant.x + delta.x;
    const newY = ant.y + delta.y;

    if (newX < 0 || newX >= this.board.width || newY < 0 || newY >= this.board.height) throw new Error("Cannot walk outside the map.");
    const tile = this.board.tiles[newY][newX];
    if (tile.type === TileType.Wall) throw new Error("Cannot walk into a wall.");

    // // If moving to food and not carrying, pick up
    // if (tile.type === TileType.Food && !ant.carrying) {
    //   ant.carrying = true;
    //   this.board.tiles[newY][newX].setType(TileType.Empty);
    // }
    // // // If moving to hive and carrying, drop and spawn new ant
    // // if (tile.type === TileType.Hive && tile.hive?.uuid === hive.hiveId && ant.carrying) {
    // //   ant.carrying = false;
    // //   hive.ants.push(new Ant(hive.x, hive.y));
    // // }

    // Move ant
    ant.x = newX;
    ant.y = newY;

    tile.type = TileType.Ant;
    tile.ant = ant;

    // ant.lastMove = now;

    // // Check collisions
    // // this.checkCollisions();
    return ant;
  }

  checkCollisions() {
    // const allAnts: { ant: Ant; hive: Hive; }[] = [];
    // for (const hive of this.board.hives.values()) {
    //   for (const ant of hive.ants) {
    //     allAnts.push({ ant, hive });
    //   }
    // }
    // for (let i = 0; i < allAnts.length; i++) {
    //   for (let j = i + 1; j < allAnts.length; j++) {
    //     const a = allAnts[i];
    //     const b = allAnts[j];
    //     if (isWithinDistance({ x: a.ant.x, y: a.ant.y }, { x: b.ant.x, y: b.ant.y }, 1)) {
    //       // Remove both ants
    //       a.hive.ants = a.hive.ants.filter(ant => ant.id !== a.ant.id);
    //       b.hive.ants = b.hive.ants.filter(ant => ant.id !== b.ant.id);
    //     }
    //   }
    // }
  }

  // getUpdateForClient(uuid: string): ServerMessage | null {
  //   const hive = this.board.hives.get(uuid);
  //   if (!hive) return null;
  //   const ants = hive.ants.map(ant => ({
  //     id: ant.id,
  //     x: ant.x,
  //     y: ant.y,
  //     carrying: ant.carrying,
  //     cooldown: Math.max(0, 2000 - (Date.now() - ant.lastMove)),
  //   }));
  //   // Collect all nearby tiles for all ants
  //   const tileSet = new Set<string>();
  //   const tiles: { type: string; x: number; y: number; uuid?: string; }[] = [];
  //   for (const ant of hive.ants) {
  //     const nearby = getNearbyTiles(this.board.tiles, ant.x, ant.y, 2);
  //     for (const tile of nearby) {
  //       const key = `${tile.x},${tile.y}`;
  //       if (!tileSet.has(key)) {
  //         tileSet.add(key);
  //         tiles.push(tile);
  //       }
  //     }
  //   }
  //   return {
  //     type: "update",
  //     ants,
  //     tiles,
  //   };
  // }

  todecide() {
    // idea 1:
    // go through all tiles around ants
    // filter to tiles that have not .beenSeen by that ant/hive
    // send those tiles to each client

    // idea 2:
    // have tiles in vision be in a queue
    // go through all tiles in queue
    // send tiles in

    // idea 3:
    // have game.activeTiles
    // spawning a hive, will append 25 tiles to hotTiles
    // moving an ant will also append 25 but also remove 5 from previous position
    // added and removed tiles will check for nearby clients having vision on it, and update accordingly
  }
}
