import { Hive, IHive } from "./types/hive.ts";
import { IAnt, Ant } from "./types/ant.ts";
import { ITileDTO, Tile, TileType } from "./types/tile.ts";
import { getDirectionDelta, isWithinDistance, getNearbyTiles, findRandomEmptyPosition, generateUUID } from "./utils.ts";
import { Board, Direction } from "./types/general.ts";

export class Game {
  board: Board;

  constructor() {
    this.board = {
      width: 200,
      height: 200,
      tiles: Array.from({ length: 200 }, () => Array.from({ length: 200 }, () => new Tile())),
      hives: new Map(),
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

  addHive(uuid: string = generateUUID()): IHive {
    const pos = findRandomEmptyPosition(this.board.tiles);
    if (!pos) throw new Error("No empty position for hive");
    const hive = new Hive(uuid, pos.x, pos.y);
    this.board.tiles[pos.y][pos.x].setType(TileType.Hive, hive);
    this.board.hives.set(uuid, hive);
    return hive;
  }

  removeHive(uuid: string) {
    const hive = this.board.hives.get(uuid);
    if (!hive) return;
    // Clear tile
    this.board.tiles[hive.y][hive.x].setType(TileType.Empty);
    this.board.hives.delete(uuid);
  }

  moveAnt(hive: IHive, ant: IAnt, direction: Direction): boolean {
    const now = Date.now();
    if (now - ant.lastMove < 2000) return false; // cooldown
    const delta = getDirectionDelta(direction);
    const newX = ant.x + delta.x;
    const newY = ant.y + delta.y;
    if (newX < 0 || newX >= this.board.width || newY < 0 || newY >= this.board.height) return false;
    const tile = this.board.tiles[newY][newX];
    if (tile.type === TileType.Wall) return false;
    // If moving to food and not carrying, pick up
    if (tile.type === TileType.Food && !ant.carrying) {
      ant.carrying = true;
      this.board.tiles[newY][newX].setType(TileType.Empty);
    }
    // If moving to hive and carrying, drop and spawn new ant
    if (tile.type === TileType.Hive && tile.hive?.uuid === hive.uuid && ant.carrying) {
      ant.carrying = false;
      hive.ants.push(new Ant(hive.x, hive.y));
    }
    // Move ant
    ant.x = newX;
    ant.y = newY;
    ant.lastMove = now;

    // Check collisions
    // this.checkCollisions();
    return true;
  }

  checkCollisions() {
    const allAnts: { ant: Ant; hive: IHive; }[] = [];
    for (const hive of this.board.hives.values()) {
      for (const ant of hive.ants) {
        allAnts.push({ ant, hive });
      }
    }
    for (let i = 0; i < allAnts.length; i++) {
      for (let j = i + 1; j < allAnts.length; j++) {
        const a = allAnts[i];
        const b = allAnts[j];
        if (isWithinDistance({ x: a.ant.x, y: a.ant.y }, { x: b.ant.x, y: b.ant.y }, 1)) {
          // Remove both ants
          a.hive.ants = a.hive.ants.filter(ant => ant.id !== a.ant.id);
          b.hive.ants = b.hive.ants.filter(ant => ant.id !== b.ant.id);
        }
      }
    }
  }

  getTilesAround(entityX: number, entityY: number, hive: IHive, radius: number = 2): ITileDTO[] {
    const tilesAround: ITileDTO[] = [];
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = entityX + dx;
        const y = entityY + dy;
        if (x >= 0 && x < this.board.width && y >= 0 && y < this.board.height) {
          const tile = this.board.tiles[y][x];
          tile.seeingBy.add({ type: TileType.Hive, hive: hive });

          // tilesAround.push({
          //   hiveId: tile.hive?.uuid,
          //   type: tile.type,
          // });
          tilesAround.push(tile); //todo remove dev
        }
      }
    }
    return tilesAround;
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
