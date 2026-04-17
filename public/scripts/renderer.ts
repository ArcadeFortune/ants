import { TileDTO, TileType } from "../../types/tile.ts";
import { EventBus } from "./event-bus.ts";
import { GameStore } from "./game-store.ts";

export interface SnapshotTiles {
  type: TileType;
  isSelected: boolean;
}

export class Renderer {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  TILE_SIZE = 50;
  VIEW_SIZE = 7; // 7x7 tiles visible
  HALF_VIEW_SIZE = Math.floor(this.VIEW_SIZE / 2);

  cameraX = 7;
  cameraY = 7;

  constructor(protected bus: EventBus, protected gameStore: GameStore) {
    const canvas = document.getElementById("map");
    if (!canvas) throw new Error("Unable to load map");
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Canvas not found");
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Unable to get 2d render engine");
    this.ctx = ctx;

    bus.on("rendererMoveCamera", (pos) => {
      this.setCamera(pos.x, pos.y);
    });
  }

  render() {
    requestAnimationFrame((t) => this.loop(t));
  }

  private loop(currentTime: number, lastTime: number = 0) {
    const deltaTime = (currentTime - lastTime) / 1000; //seconds

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let y = 0; y < this.VIEW_SIZE; y++) {
      for (let x = 0; x < this.VIEW_SIZE; x++) {
        const tile = this.gameStore.getTile(this.cameraX - this.HALF_VIEW_SIZE + x, this.cameraY - this.HALF_VIEW_SIZE + y);
        const canvasX = x * this.TILE_SIZE;
        const canvasY = y * this.TILE_SIZE;
        this.drawTile(tile, canvasX, canvasY);
      }
    }
    // console.log(deltaTime);
    // console.log(this.cameraX && this.cameraY);

    lastTime = currentTime;

    requestAnimationFrame((c) => this.loop(c, lastTime));
  }

  drawTile(tile: TileDTO, canvasX: number, canvasY: number) {
    switch (tile?.type) {
      case "empty":
        this.ctx.fillStyle = "#eee";
        break;
      case "wall":
        this.ctx.fillStyle = "#333";
        break;
      case "food":
        this.ctx.fillStyle = "green";
        break;
      case "hive":
        this.ctx.fillStyle = "gold";
        break;
      case "ant":
        this.ctx.fillStyle = "saddlebrown";
        break;
      default:
        this.ctx.fillStyle = "#ccc"; // unknown tile
        break;
    }
    this.ctx.fillRect(canvasX, canvasY, this.TILE_SIZE, this.TILE_SIZE);
    this.ctx.strokeStyle = "#999"; //grid
    this.ctx.strokeRect(canvasX, canvasY, this.TILE_SIZE, this.TILE_SIZE);
  }

  setCamera(x: number, y: number) {
    this.cameraX = x;
    this.cameraY = y;
  }
}
