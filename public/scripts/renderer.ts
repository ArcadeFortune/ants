import { AntDTO } from "../../types/ant.ts";
import { EntityDTO } from "../../types/entity.ts";
import { HiveDTO } from "../../types/hive.ts";
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

  selectedTile: { x: number; y: number } | null = null;

  constructor(protected bus: EventBus, protected gameStore: GameStore) {
    const canvas = document.getElementById("map");
    if (!canvas) throw new Error("Unable to load map");
    if (!(canvas instanceof HTMLCanvasElement)) throw new Error("Canvas not found");
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Unable to get 2d render engine");
    ctx.imageSmoothingEnabled = false;
    ctx.font = "25px Arial";
    this.ctx = ctx;

    this.antSprite.load("/sprites/ant/ant.png");
    this.hiveSprite.load("sprites/hive/hive.png");

    bus.on("rendererMoveCamera", (pos) => {
      this.moveCamera(pos.x, pos.y);
    });

    bus.on("rendererSelectAnt", (ant) => {
      if (ant.type !== "ant") throw new Error("Entity is not selectable");
      this.selectAnt(ant);
    });
  }

  init() {
    requestAnimationFrame((t) => this.loop(t));
  }

  private loop(currentTime: number, lastTime: number = 0) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const deltaTime = (currentTime - lastTime) / 1000; //seconds
    this.animationTime += deltaTime;

    this.updateCamera(deltaTime);
    this.drawTiles();
    this.drawSelection();

    lastTime = currentTime;
    requestAnimationFrame((c) => this.loop(c, lastTime));
  }

  drawTiles() {
    const baseTileX = Math.floor(this.cameraX);
    const baseTileY = Math.floor(this.cameraY);
    const topLeftTileX = baseTileX - this.HALF_VIEW_SIZE;
    const topLeftTileY = baseTileY - this.HALF_VIEW_SIZE;
    const offsetX = (this.cameraX - baseTileX) * this.TILE_SIZE;
    const offsetY = (this.cameraY - baseTileY) * this.TILE_SIZE;

    for (let i = 0; i <= this.VIEW_SIZE; i++) {
      for (let j = 0; j <= this.VIEW_SIZE; j++) {
        const x = topLeftTileX + j;
        const y = topLeftTileY + i;
        const tile = this.gameStore.getTile(x, y);
        const canvasX = j * this.TILE_SIZE - offsetX;
        const canvasY = i * this.TILE_SIZE - offsetY;

        this.drawTile(tile, canvasX, canvasY);
        this.drawTileEntities(tile, canvasX, canvasY);
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

  drawTileEntities(tile: TileDTO, canvasX: number, canvasY: number) {
    const entities = this.gameStore.getEntitiesByCoordinate(tile);
    if (!entities?.length) return;

    const hive = entities.find((e) => e.type === "hive"); // assume max
    const ants = entities.filter((e) => e.type === "ant");

    if (hive) {
      this.drawHiveWithAnts(hive, ants, canvasX, canvasY);
      return;
    } else if (!hive && ants.length === 1) {
      this.drawEntity(ants[0], canvasX, canvasY);
    } else if (!hive && ants.length > 1) {
      this.drawEntity(ants[0], canvasX, canvasY);
      this.drawText(ants.length.toString(), canvasX + this.TILE_SIZE / 2, canvasY + this.TILE_SIZE - 4);
    }
  }

  /**
   * draws hive and smaller ants with a counter if any are inside
   */
  private drawHiveWithAnts(hive: HiveDTO, ants: AntDTO[], x: number, y: number) {
    this.drawEntity(hive, x, y);
    if (ants.length === 0) return;

    const smallerSize = this.TILE_SIZE / 2;
    this.drawEntity(ants[0], x, y + this.TILE_SIZE - smallerSize, smallerSize);
    this.drawText(ants.length.toString(), x + smallerSize, y + this.TILE_SIZE - 4);
  }

  drawEntity(entity: EntityDTO, canvasX: number, canvasY: number, desiredSize = this.TILE_SIZE) {
    switch (entity.type) {
      case "ant": {
        const antFrame = this.antSprite.getFrame(this.animationTime);
        if (!antFrame) break;
        this.ctx.drawImage(antFrame.image, antFrame.x, antFrame.y, this.spriteSize, this.spriteSize, canvasX, canvasY, desiredSize, desiredSize);
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

  drawSelection() {
    if (!this.selectedTile) return;
    const baseTileX = Math.floor(this.cameraX);
    const baseTileY = Math.floor(this.cameraY);
    const topLeftTileX = baseTileX - this.HALF_VIEW_SIZE;
    const topLeftTileY = baseTileY - this.HALF_VIEW_SIZE;
    const cameraOffsetX = (this.cameraX - baseTileX) * this.TILE_SIZE;
    const cameraOffsetY = (this.cameraY - baseTileY) * this.TILE_SIZE;
    const offsetX = this.selectedTile.x - topLeftTileX;
    const offsetY = this.selectedTile.y - topLeftTileY;

    const canvasX = offsetX * this.TILE_SIZE - cameraOffsetX;
    const canvasY = offsetY * this.TILE_SIZE - cameraOffsetY;

    const prev = this.ctx.lineWidth;
    if (Math.floor(this.animationTime % 2)) {
      this.ctx.lineWidth = 3;
    } else {
      this.ctx.lineWidth = 2;
    }
    this.ctx.strokeStyle = "#9c3400";
    this.ctx.strokeRect(canvasX, canvasY, this.TILE_SIZE, this.TILE_SIZE);
    this.ctx.lineWidth = prev;
  }

  drawText(text: string, x: number, y: number, color: string = "black") {
    const prevFillStyle = this.ctx.fillStyle;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
    this.ctx.fillStyle = prevFillStyle;
  }

  moveCamera(x: number, y: number) {
    this.movingCameraFrom = { x: this.cameraX, y: this.cameraY };
    this.movingCameraTo = { x, y };
    this.movingCameraTimePassed = 0;
    this.isMovingCamera = true;
  }

  selectAnt(ant: AntDTO) {
    this.moveCamera(ant.x, ant.y);
    this.selectedTile = { x: ant.x, y: ant.y };
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
