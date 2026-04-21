import { Direction, Position } from "./types/general.ts";
import { Tile, TileType } from "./types/tile.ts";

export function getDirectionDelta(direction: Direction): Position {
  switch (direction) {
    case "n":
      return { x: 0, y: -1 };
    case "ne":
      return { x: 1, y: -1 };
    case "e":
      return { x: 1, y: 0 };
    case "se":
      return { x: 1, y: 1 };
    case "s":
      return { x: 0, y: 1 };
    case "sw":
      return { x: -1, y: 1 };
    case "w":
      return { x: -1, y: 0 };
    case "nw":
      return { x: -1, y: -1 };
  }
}

export function chebyshevDistance(a: Position, b: Position): number {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

export function isWithinDistance(a: Position, b: Position, dist: number): boolean {
  return chebyshevDistance(a, b) <= dist;
}

export function getNearbyTiles(board: Tile[][], antX: number, antY: number, radius: number): { type: string; x: number; y: number; uuid?: string }[] {
  const tiles: { type: string; x: number; y: number; uuid?: string }[] = [];
  const width = board[0].length;
  const height = board.length;
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const x = antX + dx;
      const y = antY + dy;
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const tile = board[y][x];
        tiles.push({
          type: tile.type,
          x,
          y,
          uuid: tile.hive?.uuid,
        });
      }
    }
  }
  return tiles;
}

export function findRandomEmptyPosition(board: Tile[][]): Position | null {
  const width = board[0].length;
  const height = board.length;
  const empties: Position[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (board[y][x].type === TileType.Empty) {
        empties.push({ x, y });
      }
    }
  }
  if (empties.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * empties.length);
  return empties[randomIndex];
}

export function generateUUID(): string {
  return crypto.randomUUID();
}
