import { TileDTO, TileType } from "../../types/tile.ts";
import { EventBus } from "./event-bus.ts";

export class GameStore {
  protected tiles: Map<string, TileDTO> = new Map();

  constructor(protected bus: EventBus) {
    bus.on("gameStoreTiles", (t) => this.saveTiles(t));
  }

  coordsToId(x: number, y: number) {
    return `${x},${y}`;
  }

  tileToId(tile: TileDTO) {
    return this.coordsToId(tile.x, tile.y);
  }

  protected saveTiles(tiles: TileDTO[]) {
    if (this.tiles.size === 0) {
      this.bus.emit("rendererMoveCamera", this.calculateCenter(tiles));
    }
    for (const tile of tiles) {
      const id = this.tileToId(tile);
      this.tiles.set(id, tile);
    }
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
