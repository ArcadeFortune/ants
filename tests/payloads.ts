import { ServerEvent } from "../types/comms.ts";
import { TileType } from "../types/tile.ts";
import { generateUUID } from "../utils.ts";

export const testPlayerId = "abcdef";
export const testOtherPlayerId = "123456789";

export const testServerPlayerInfoEvent: ServerEvent = {
  type: "playerInfo",
  body: {
    id: testPlayerId,
  },
};

export const testServerTilesEvent: ServerEvent = {
  type: "tiles",
  body: {
    tiles: [
      {
        type: TileType.Ground,
        x: 10,
        y: 10,
      },
      {
        type: TileType.Wall,
        x: 11,
        y: 10,
      },
      {
        type: TileType.Ground,
        x: 12,
        y: 10,
      },
      {
        type: TileType.Ground,
        x: 10,
        y: 11,
      },
      {
        type: TileType.Ground,
        x: 11,
        y: 11,
      },
      {
        type: TileType.Ground,
        x: 12,
        y: 11,
      },
      {
        type: TileType.Ground,
        x: 10,
        y: 12,
      },
      {
        type: TileType.Ground,
        x: 11,
        y: 12,
      },
      {
        type: TileType.Ground,
        x: 12,
        y: 12,
      },
    ],
  },
};

export const testServerEntitiesEvent: ServerEvent = {
  type: "entities",
  body: {
    entities: [
      {
        id: generateUUID(),
        type: "hive",
        x: 11,
        y: 11,
        playerId: testPlayerId,
      },
      {
        id: generateUUID(),
        type: "ant",
        x: 12,
        y: 11,
        playerId: testPlayerId,
      },
      {
        id: generateUUID(),
        type: "ant",
        x: 11,
        y: 11,
        playerId: testOtherPlayerId,
      },
    ],
  },
};
