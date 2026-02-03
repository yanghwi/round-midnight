import type { Room, Player, RoomState, MapType } from '@daily-dungeon/shared';

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(host: Player): Room {
    let code: string;
    do {
      code = generateRoomCode();
    } while (this.rooms.has(code));

    const room: Room = {
      code,
      players: [host],
      state: 'waiting',
      dungeon: null,
      hostId: host.id,
      mapType: 'goblin_cave',
    };

    this.rooms.set(code, room);
    return room;
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  joinRoom(code: string, player: Player): Room | null {
    const room = this.getRoom(code);
    if (!room) return null;
    if (room.state !== 'waiting') return null;
    if (room.players.length >= 4) return null;

    room.players.push(player);
    return room;
  }

  leaveRoom(code: string, playerId: string): Room | null {
    const room = this.getRoom(code);
    if (!room) return null;

    room.players = room.players.filter((p: Player) => p.id !== playerId);

    if (room.players.length === 0) {
      this.rooms.delete(code);
      return null;
    }

    // 호스트가 나가면 다음 사람이 호스트
    if (room.hostId === playerId) {
      room.hostId = room.players[0].id;
    }

    return room;
  }

  startGame(code: string, playerId: string): Room | null {
    const room = this.getRoom(code);
    if (!room) return null;
    if (room.hostId !== playerId) return null;
    if (room.players.length < 2) return null;
    if (room.state !== 'waiting') return null;

    room.state = 'playing';
    return room;
  }

  setMapType(code: string, mapType: MapType): void {
    const room = this.getRoom(code);
    if (room && room.state === 'waiting') {
      room.mapType = mapType;
    }
  }

  getPlayerRoom(socketId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.some((p: Player) => p.socketId === socketId)) {
        return room;
      }
    }
    return undefined;
  }

  removePlayerBySocketId(socketId: string): { room: Room; playerId: string } | null {
    for (const room of this.rooms.values()) {
      const player = room.players.find((p: Player) => p.socketId === socketId);
      if (player) {
        const result = this.leaveRoom(room.code, player.id);
        return result ? { room: result, playerId: player.id } : null;
      }
    }
    return null;
  }
}

export const roomManager = new RoomManager();
