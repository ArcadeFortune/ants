import { Tile, TileType, generateTiles } from "./types/tile.ts";
import { findRandomEmptyPosition } from "./utils.ts";
import { Board, Entity } from "./types/general.ts";
import { Player } from "./types/player.ts";

export class Game {
  board: Board;

  constructor() {
    this.board = {
      width: 200,
      height: 200,
      tiles: generateTiles(200, 200),
      players: new Map(),
    };
    // Initialize some food and walls randomly
    for (let y = 0; y < 200; y++) {
      for (let x = 0; x < 200; x++) {
        const rand = Math.random();
        const tile = this.board.tiles[y][x];
        if (rand < 0.05) {
          tile.setType(TileType.Wall);
        } else if (rand < 0.15) {
          tile.setType(TileType.Food);
        }
      }
    }
  }

  addPlayer(playerId: string) {
    const pos = findRandomEmptyPosition(this.board.tiles);
    if (!pos) throw new Error("No empty position for hive");
    const player = new Player(playerId, pos.x, pos.y);
    this.board.players.set(player.id, player);

    this.board.tiles[pos.y][pos.x].setType(TileType.Hive, player.hives[0]);
    return player;
  }

  // getHive(playerId: string) {
  //   return this.board.hives.get(playerId);
  // }

  removePlayer(playerId: string) {
    console.log('looking for player', playerId);
    const player = this.board.players.get(playerId);
    if (!player) throw new Error("Player does not exist");

    for (const hive of player.hives) {
      this.board.tiles[hive.y][hive.x].setType(TileType.Empty);
    }

    // player.hives.length = 0;
    player.clear();
    this.board.players.delete(player.id);
  }

  getVision(entity: Entity, radius: number = 2) {
    const newTiles: Tile[] = [];
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = entity.x + dx;
        const y = entity.y + dy;
        const tile = this.board.tiles[y][x];
        newTiles.push(tile);

        // if (antId) {
        //   tile.seeingBy.push({
        //     type: TileType.Ant,
        //     antId: antId,
        //     hiveId: hiveId
        //   });
        // } else {
        //   tile.seeingBy.push({
        //     type: TileType.Hive,
        //     hiveId: hiveId
        //   });
        // }
      }
    }
    return newTiles;
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

  // moveAnt(hiveId: string, antId: string, direction: Direction): boolean {
  // const hive = this.board.hives.get(hiveId);
  // const now = Date.now();
  // if (now - ant.lastMove < 2000) return false; // cooldown
  // const delta = getDirectionDelta(direction);
  // const newX = ant.x + delta.x;
  // const newY = ant.y + delta.y;
  // if (newX < 0 || newX >= this.board.width || newY < 0 || newY >= this.board.height) return false;
  // const tile = this.board.tiles[newY][newX];
  // if (tile.type === TileType.Wall) return false;
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
  // // Move ant
  // ant.x = newX;
  // ant.y = newY;
  // ant.lastMove = now;

  // // Check collisions
  // // this.checkCollisions();
  // return true;
  // }

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
