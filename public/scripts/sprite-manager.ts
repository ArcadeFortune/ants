interface SpriteMetaData {
  frames: Record<string, FrameData>;
  meta: {
    app: string;
    version: string;
    image: string;
    format: string;
    size: Size;
  };
}

interface FrameData {
  frame: Rect;
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: Rect;
  sourceSize: Size;
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Size {
  w: number;
  h: number;
}

export class Sprite {
  image: HTMLImageElement;
  imageSrc: string = "";
  metaData?: SpriteMetaData;
  metaDataSrc: string = "";
  frames: Rect[] = [];
  private loaded = false;

  constructor(public framesPerSecond: number = 1) {
    this.image = new Image();
  }

  async load(pathSrc: string): Promise<void> {
    if (!pathSrc) throw new Error("No sprite path specified.");
    this.imageSrc = pathSrc;
    this.metaDataSrc = pathSrc.replace(/\.[^.]+$/, ".json");

    const imagePromise = new Promise<void>((resolve, reject) => {
      this.image.onload = () => resolve();
      this.image.onerror = () => reject(new Error("Image failed to load"));
      this.image.src = pathSrc;
    });

    const metaDataPromise = fetch(this.metaDataSrc)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load metadata: ${this.metaDataSrc}`);
        }
        return res.json() as Promise<SpriteMetaData>;
      })
      .then((data) => {
        this.metaData = data;
        this.frames = Object.values(data.frames).map((frame) => frame.frame);
      });

    await Promise.all([imagePromise, metaDataPromise]);
    this.loaded = true;
  }

  isLoaded() {
    return this.loaded;
  }

  getFrame(animationTime: number) {
    const frameCount = this.frames.length;
    const frameIndex = Math.floor(animationTime * this.framesPerSecond) % frameCount;

    const frame = this.frames[frameIndex];
    if (!frame || !this.isLoaded()) return null;
    return {
      image: this.image,
      x: frame.x,
      y: frame.y,
      width: frame.w,
      height: frame.h,
    };
  }
}
