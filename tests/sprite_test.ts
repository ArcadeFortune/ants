/*
import { assert, assertEquals, assertInstanceOf } from "@std/assert";
import { JSDOM } from "jsdom";
import { Sprite } from "../public/scripts/sprite-manager.ts";

const { window } = new JSDOM();
globalThis.Image = window.Image;

Deno.test("Can load sprite", async () => {
  const hiveSprite = new Sprite();
  await hiveSprite.load("./public/sprites/hive/hive.png");
  assert(hiveSprite);
});

Deno.test("Sprite metadata is correct", async () => {
  const hiveSprite = new Sprite();
  await hiveSprite.load("./public/sprites/hive/hive.png");
  const hiveMetaData = JSON.parse(Deno.readTextFileSync("./public/sprites/hive/hive.json"));
  assertEquals(hiveSprite.metaDataSrc, "./public/sprites/hive/hive.json");
  assertEquals(hiveSprite.metaData, hiveMetaData);
});

Deno.test("Can cache frames correctly", async () => {
  const hiveSprite = new Sprite();
  await hiveSprite.load("./public/sprites/hive/hive.png");
  assertEquals(hiveSprite.frames, [
    {
      x: 0,
      y: 0,
      w: 32,
      h: 32,
    },
    {
      x: 0,
      y: 32,
      w: 32,
      h: 32,
    },
  ]);
});

Deno.test("Gets correct sprite index", async () => {
  const hiveSprite = new Sprite();
  await hiveSprite.load("./public/sprites/hive/hive.png");
  const img = new Image();
  img.src = "./public/sprites/hive/hive.png";

  const frame0 = hiveSprite.getFrame(0);
  assert(frame0);
  assertInstanceOf(frame0.image, Image);
  assertEquals(frame0.x, 0);
  assertEquals(frame0.y, 0);
  assertEquals(frame0.width, 32);
  assertEquals(frame0.height, 32);
  const frame1 = hiveSprite.getFrame(1);
  assert(frame1);
  assertInstanceOf(frame1.image, Image);
  assertEquals(frame1.x, 0);
  assertEquals(frame1.y, 32);
  assertEquals(frame1.width, 32);
  assertEquals(frame1.height, 32);
});

*/
