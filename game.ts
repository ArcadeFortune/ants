import { Ant } from "./ant.ts";
import { Board, Hive, TileType, Direction, ServerMessage } from "./types.ts";
import { getDirectionDelta, isWithinDistance, getNearbyTiles, findRandomEmptyPosition, generateUUID } from "./utils.ts";

export class Game {
  board: Board;

  constructor() {
    this.board = {
      width: 200,
      height: 200,
      tiles: Array(200).fill(null).map(() => Array(200).fill({ type: TileType.Empty })),
      hives: new Map(),
    };
    // Initialize some food and walls randomly
    for (let y = 0; y < 200; y++) {
      for (let x = 0; x < 200; x++) {
        const rand = Math.random();
        if (rand < 0.05) {
          this.board.tiles[y][x] = { type: TileType.Wall };
        } else if (rand < 0.15) {
          this.board.tiles[y][x] = { type: TileType.Food };
        }
      }
    }
  }

  addHive(uuid: string = generateUUID()): Hive {
    const pos = findRandomEmptyPosition(this.board.tiles);
    if (!pos) throw new Error("No empty position for hive");
    const hive: Hive = {
      uuid,
      x: pos.x,
      y: pos.y,
      ants: [new Ant(pos.x, pos.y), new Ant(pos.x, pos.y)],
    };
    this.board.tiles[pos.y][pos.x] = { type: TileType.Hive, uuid };
    this.board.hives.set(uuid, hive);
    return hive;
  }

  removeHive(uuid: string) {
    const hive = this.board.hives.get(uuid);
    if (!hive) return;
    // Clear tile
    this.board.tiles[hive.y][hive.x] = { type: TileType.Empty };
    this.board.hives.delete(uuid);
  }

  moveAnt(uuid: string, antId: string, direction: Direction): boolean {
    const hive = this.board.hives.get(uuid);
    if (!hive) return false;
    const ant = hive.ants.find(a => a.id === antId);
    if (!ant) return false;
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
      this.board.tiles[newY][newX] = { type: TileType.Empty };
    }
    // If moving to hive and carrying, drop and spawn new ant
    if (tile.type === TileType.Hive && tile.uuid === uuid && ant.carrying) {
      ant.carrying = false;
      // Spawn new ant at hive
      const newAntId = generateUUID();
      const newAnt: Ant = {
        id: newAntId,
        x: hive.x,
        y: hive.y,
        carrying: false,
        lastMove: 0,
      };
      hive.ants.push(newAnt);
    }
    // Move ant
    ant.x = newX;
    ant.y = newY;
    ant.lastMove = now;
    // Check collisions
    this.checkCollisions();
    return true;
  }

  checkCollisions() {
    const allAnts: { ant: Ant; hive: Hive; }[] = [];
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

  getUpdateForClient(uuid: string): ServerMessage | null {
    const hive = this.board.hives.get(uuid);
    if (!hive) return null;
    const ants = hive.ants.map(ant => ({
      id: ant.id,
      x: ant.x,
      y: ant.y,
      carrying: ant.carrying,
      cooldown: Math.max(0, 2000 - (Date.now() - ant.lastMove)),
    }));
    // Collect all nearby tiles for all ants
    const tileSet = new Set<string>();
    const tiles: { type: string; x: number; y: number; uuid?: string; }[] = [];
    for (const ant of hive.ants) {
      const nearby = getNearbyTiles(this.board.tiles, ant.x, ant.y, 2);
      for (const tile of nearby) {
        const key = `${tile.x},${tile.y}`;
        if (!tileSet.has(key)) {
          tileSet.add(key);
          tiles.push(tile);
        }
      }
    }
    return {
      type: "update",
      ants,
      tiles,
    };
  }
}
