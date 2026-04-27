import { EntityDTO } from "../../types/entity.ts";
import { TileDTO, TileType } from "../../types/tile.ts";
import { EventBus } from "./event-bus.ts";
import { GameStore } from "./game-store.ts";
import { Sprite } from "./sprite-manager.ts";

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
  private movingCameraFrom = { x: 0, y: 0 };
  private movingCameraTo = { x: 0, y: 0 };
  private movingCameraTimePassed = 0;
  private movingCameraDuration = 0.4;
  private isMovingCamera = false;

  antSprite = new Sprite(2);
  hiveSprite = new Sprite(1);
  spriteSize = 32;
  animationTime = 0;

  constructor(protected bus: EventBus, protected gameStore: GameStore) {
    const canvas = document.getElementById("map");
    if (!canvas) throw new Error("Unable to load map");
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Canvas not found");
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Unable to get 2d render engine");
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;

    this.antSprite.load("/sprites/ant/ant.png");
    this.hiveSprite.load("sprites/hive/hive.png");

    bus.on("rendererMoveCamera", (pos) => {
      this.moveCamera(pos.x, pos.y);
    });
  }

  render() {
    requestAnimationFrame((t) => this.loop(t));
  }

  private loop(currentTime: number, lastTime: number = 0) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const deltaTime = (currentTime - lastTime) / 1000; //seconds
    this.animationTime += deltaTime;

    this.updateCamera(deltaTime);
    this.drawTiles();
    this.drawEntities();

    lastTime = currentTime;
    requestAnimationFrame((c) => this.loop(c, lastTime));
  }

  drawEntities() {
    const offsetX = (this.cameraX - Math.floor(this.cameraX)) * this.TILE_SIZE;
    const offsetY = (this.cameraY - Math.floor(this.cameraY)) * this.TILE_SIZE;
    const cameraTopLeftX = Math.floor(this.cameraX) - this.HALF_VIEW_SIZE;
    const cameraTopLeftY = Math.floor(this.cameraY) - this.HALF_VIEW_SIZE;
    for (const entity of this.gameStore.getEntities()) {
      const canvasX = (entity.x - cameraTopLeftX) * this.TILE_SIZE - offsetX;
      const canvasY = (entity.y - cameraTopLeftY) * this.TILE_SIZE - offsetY;
      this.drawEntity(entity, canvasX, canvasY);
    }
  }

  drawEntity(entity: EntityDTO, canvasX: number, canvasY: number) {
    const desiredSize = this.TILE_SIZE;
    switch (entity.type) {
      case "ant": {
        const antFrame = this.antSprite.getFrame(this.animationTime);
        if (!antFrame) break;

        const hive = this.gameStore.getHiveOnCoordinates(entity.x, entity.y);

        if (!hive) {
          this.ctx.drawImage(antFrame.image, antFrame.x, antFrame.y, this.spriteSize, this.spriteSize, canvasX, canvasY, desiredSize, desiredSize);
        } else {
          const smallerSize = this.TILE_SIZE / 4;
          const bottomRightX = canvasX + this.TILE_SIZE / 4 * 3;
          const bottomRightY = canvasY + this.TILE_SIZE / 4 * 3;
          this.ctx.drawImage(antFrame.image, antFrame.x, antFrame.y, this.spriteSize, this.spriteSize, bottomRightX, bottomRightY, smallerSize, smallerSize);
        }
        break;
      }
      case "hive": {
        const hiveFrame = this.hiveSprite.getFrame(this.animationTime);
        if (!hiveFrame) break;

        this.ctx.drawImage(hiveFrame.image, hiveFrame.x, hiveFrame.y, this.spriteSize, this.spriteSize, canvasX, canvasY, desiredSize, desiredSize);
        break;
      }
    }
  }

  drawTiles() {
    const startTileX = Math.floor(this.cameraX) - this.HALF_VIEW_SIZE;
    const startTileY = Math.floor(this.cameraY) - this.HALF_VIEW_SIZE;
    const offsetX = (this.cameraX - Math.floor(this.cameraX)) * this.TILE_SIZE;
    const offsetY = (this.cameraY - Math.floor(this.cameraY)) * this.TILE_SIZE;

    for (let y = 0; y <= this.VIEW_SIZE; y++) {
      for (let x = 0; x <= this.VIEW_SIZE; x++) {
        const tile = this.gameStore.getTile(startTileX + x, startTileY + y);

        const canvasX = x * this.TILE_SIZE - offsetX;
        const canvasY = y * this.TILE_SIZE - offsetY;
        this.drawTile(tile, canvasX, canvasY);
      }
    }
  }
  drawTile(tile: TileDTO, canvasX: number, canvasY: number) {
    switch (tile?.type) {
      case "ground":
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

  moveCamera(x: number, y: number) {
    this.movingCameraFrom = { x: this.cameraX, y: this.cameraY };
    this.movingCameraTo = { x, y };
    this.movingCameraTimePassed = 0;
    this.isMovingCamera = true;
  }

  private lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }
  private updateCamera(deltaTime: number) {
    if (!this.isMovingCamera) return;

    this.movingCameraTimePassed += deltaTime;
    const t = Math.min(this.movingCameraTimePassed / this.movingCameraDuration, 1);
    const easedT = t * t * (3 - 2 * t);
    this.cameraX = this.lerp(this.movingCameraFrom.x, this.movingCameraTo.x, easedT);
    this.cameraY = this.lerp(this.movingCameraFrom.y, this.movingCameraTo.y, easedT);
    if (t >= 1) {
      this.isMovingCamera = false;
    }
  }
}
