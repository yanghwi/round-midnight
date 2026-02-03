import type { DungeonTile, Position, MapType } from './types.js';

// 맵 크기 설정
const MAP_SIZES: Record<MapType, { width: number; height: number }> = {
  goblin_cave: { width: 25, height: 30 },
  abandoned_mine: { width: 30, height: 35 },
  ancient_temple: { width: 35, height: 40 },
  abyss: { width: 40, height: 45 },
};

// 간단한 절차적 던전 생성 (BSP 알고리즘 간소화)
export function generateDungeon(mapType: MapType = 'goblin_cave'): {
  tiles: DungeonTile[][];
  spawnPoint: Position;
  portalPosition: Position;
} {
  const { width, height } = MAP_SIZES[mapType];

  // 초기화: 모든 타일을 벽으로
  const tiles: DungeonTile[][] = [];
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = {
        x,
        y,
        type: 'wall',
        explored: false,
        content: null,
      };
    }
  }

  // 방 생성
  const rooms: { x: number; y: number; w: number; h: number }[] = [];
  const numRooms = 6 + Math.floor(Math.random() * 4); // 6-9개 방

  for (let i = 0; i < numRooms * 10; i++) {
    if (rooms.length >= numRooms) break;

    const roomW = 4 + Math.floor(Math.random() * 4); // 4-7 크기
    const roomH = 4 + Math.floor(Math.random() * 4);
    const roomX = 1 + Math.floor(Math.random() * (width - roomW - 2));
    const roomY = 1 + Math.floor(Math.random() * (height - roomH - 2));

    // 다른 방과 겹치는지 체크
    let overlaps = false;
    for (const room of rooms) {
      if (
        roomX < room.x + room.w + 2 &&
        roomX + roomW + 2 > room.x &&
        roomY < room.y + room.h + 2 &&
        roomY + roomH + 2 > room.y
      ) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      rooms.push({ x: roomX, y: roomY, w: roomW, h: roomH });

      // 방 내부를 바닥으로
      for (let ry = roomY; ry < roomY + roomH; ry++) {
        for (let rx = roomX; rx < roomX + roomW; rx++) {
          tiles[ry][rx].type = 'floor';
        }
      }
    }
  }

  // 방들을 복도로 연결
  for (let i = 1; i < rooms.length; i++) {
    const prevRoom = rooms[i - 1];
    const currRoom = rooms[i];

    // 이전 방의 중심
    const prevCenterX = Math.floor(prevRoom.x + prevRoom.w / 2);
    const prevCenterY = Math.floor(prevRoom.y + prevRoom.h / 2);

    // 현재 방의 중심
    const currCenterX = Math.floor(currRoom.x + currRoom.w / 2);
    const currCenterY = Math.floor(currRoom.y + currRoom.h / 2);

    // L자형 복도 생성
    if (Math.random() < 0.5) {
      // 가로 먼저, 세로 나중
      createHorizontalTunnel(tiles, prevCenterX, currCenterX, prevCenterY);
      createVerticalTunnel(tiles, prevCenterY, currCenterY, currCenterX);
    } else {
      // 세로 먼저, 가로 나중
      createVerticalTunnel(tiles, prevCenterY, currCenterY, prevCenterX);
      createHorizontalTunnel(tiles, prevCenterX, currCenterX, currCenterY);
    }
  }

  // 스폰 포인트 (첫 번째 방 중앙)
  const spawnRoom = rooms[0];
  const spawnPoint: Position = {
    x: Math.floor(spawnRoom.x + spawnRoom.w / 2),
    y: Math.floor(spawnRoom.y + spawnRoom.h / 2),
  };

  // 포탈 위치 (마지막 방 중앙)
  const portalRoom = rooms[rooms.length - 1];
  const portalPosition: Position = {
    x: Math.floor(portalRoom.x + portalRoom.w / 2),
    y: Math.floor(portalRoom.y + portalRoom.h / 2),
  };

  // 포탈 타일 설정
  tiles[portalPosition.y][portalPosition.x].type = 'portal';
  tiles[portalPosition.y][portalPosition.x].content = { type: 'portal' };

  // 문 추가 (복도 입구에)
  addDoors(tiles, rooms);

  return { tiles, spawnPoint, portalPosition };
}

function createHorizontalTunnel(
  tiles: DungeonTile[][],
  x1: number,
  x2: number,
  y: number
) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);

  for (let x = minX; x <= maxX; x++) {
    if (y > 0 && y < tiles.length && x > 0 && x < tiles[y].length) {
      tiles[y][x].type = 'floor';
    }
  }
}

function createVerticalTunnel(
  tiles: DungeonTile[][],
  y1: number,
  y2: number,
  x: number
) {
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  for (let y = minY; y <= maxY; y++) {
    if (y > 0 && y < tiles.length && x > 0 && x < tiles[y].length) {
      tiles[y][x].type = 'floor';
    }
  }
}

function addDoors(
  tiles: DungeonTile[][],
  rooms: { x: number; y: number; w: number; h: number }[]
) {
  // 복도와 방의 경계에 문 추가 (낮은 확률)
  for (let y = 1; y < tiles.length - 1; y++) {
    for (let x = 1; x < tiles[y].length - 1; x++) {
      if (tiles[y][x].type !== 'floor') continue;

      // 수평 문 체크 (좌우가 벽, 상하가 바닥)
      const isHorizontalDoorway =
        tiles[y][x - 1]?.type === 'wall' &&
        tiles[y][x + 1]?.type === 'wall' &&
        tiles[y - 1]?.[x]?.type === 'floor' &&
        tiles[y + 1]?.[x]?.type === 'floor';

      // 수직 문 체크 (상하가 벽, 좌우가 바닥)
      const isVerticalDoorway =
        tiles[y - 1]?.[x]?.type === 'wall' &&
        tiles[y + 1]?.[x]?.type === 'wall' &&
        tiles[y][x - 1]?.type === 'floor' &&
        tiles[y][x + 1]?.type === 'floor';

      if ((isHorizontalDoorway || isVerticalDoorway) && Math.random() < 0.3) {
        tiles[y][x].type = 'door';
      }
    }
  }
}
