import type { Room, Player, VoteState, VoteChoice, RunState } from '@daily-dungeon/shared';
import { GAME_CONSTANTS } from '@daily-dungeon/shared';

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
      hostId: host.id,
      run: null,
      vote: null,
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
    if (room.players.length >= GAME_CONSTANTS.MAX_PLAYERS) return null;

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
    if (room.players.length < GAME_CONSTANTS.MIN_PLAYERS) return null;
    if (room.state !== 'waiting') return null;

    room.state = 'playing';

    // 런 상태 초기화 (10웨이브)
    room.run = {
      currentWave: 1,
      maxWaves: GAME_CONSTANTS.FULL_MAX_WAVES,
      accumulatedRewards: [],
    };

    return room;
  }

  /**
   * 다음 웨이브로 진행
   */
  advanceWave(code: string): RunState | null {
    const room = this.getRoom(code);
    if (!room || !room.run) return null;

    room.run.currentWave += 1;
    room.vote = null; // 투표 초기화

    return room.run;
  }

  /**
   * 투표 시작
   */
  startVote(code: string): VoteState | null {
    const room = this.getRoom(code);
    if (!room) return null;

    const alivePlayers = room.players.filter((p) => p.isAlive);

    room.vote = {
      votes: {},
      totalPlayers: alivePlayers.length,
      deadline: Date.now() + GAME_CONSTANTS.VOTE_TIMEOUT,
    };

    return room.vote;
  }

  /**
   * 투표 제출
   */
  submitVote(code: string, playerId: string, choice: VoteChoice): VoteState | null {
    const room = this.getRoom(code);
    if (!room || !room.vote) return null;

    room.vote.votes[playerId] = choice;
    return room.vote;
  }

  /**
   * 투표 결과 계산
   * 과반수가 'continue' 선택 시 진행, 그 외(동점 포함)는 'retreat'
   */
  getVoteResult(code: string): VoteChoice | null {
    const room = this.getRoom(code);
    if (!room || !room.vote) return null;

    const votes = Object.values(room.vote.votes);
    const continueCount = votes.filter((v) => v === 'continue').length;
    const retreatCount = votes.filter((v) => v === 'retreat').length;

    // 모든 생존 플레이어가 투표했는지 확인
    if (votes.length < room.vote.totalPlayers) return null;

    // 과반수 판정
    return continueCount > retreatCount ? 'continue' : 'retreat';
  }

  /**
   * 런 종료
   */
  endRun(code: string, escaped: boolean): void {
    const room = this.getRoom(code);
    if (!room) return;

    room.state = 'finished';
    room.vote = null;
  }

  /**
   * 플레이어 상태 업데이트
   */
  updatePlayers(code: string, updatedPlayers: Player[]): void {
    const room = this.getRoom(code);
    if (!room) return;

    for (const updated of updatedPlayers) {
      const idx = room.players.findIndex((p) => p.id === updated.id);
      if (idx !== -1) {
        room.players[idx] = updated;
      }
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
