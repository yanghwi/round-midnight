import { Server, Socket } from 'socket.io';
import { roomManager } from '../game/Room.js';
import { createPlayer } from '../game/Player.js';
import { generateDungeon } from '../../../shared/dungeonGenerator.js';
import type {
  CreateRoomPayload,
  JoinRoomPayload,
  StartGamePayload,
  PlayerMovePayload,
  RoomCreatedResponse,
  RoomJoinedResponse,
  Room,
  Position,
  Player,
  MapType,
} from '@daily-dungeon/shared';

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // 방 생성
    socket.on('create-room', (payload: CreateRoomPayload) => {
      const player = createPlayer(socket.id, payload.playerName, payload.playerClass);
      const room = roomManager.createRoom(player);

      socket.join(room.code);

      const response: RoomCreatedResponse = {
        roomCode: room.code,
        player,
      };

      socket.emit('room-created', response);
      console.log(`Room created: ${room.code} by ${player.name}`);
    });

    // 방 참가
    socket.on('join-room', (payload: JoinRoomPayload) => {
      const player = createPlayer(socket.id, payload.playerName, payload.playerClass);
      const room = roomManager.joinRoom(payload.roomCode, player);

      if (!room) {
        socket.emit('join-error', { message: '방을 찾을 수 없거나 참가할 수 없습니다.' });
        return;
      }

      socket.join(room.code);

      const response: RoomJoinedResponse = {
        room,
        player,
      };

      socket.emit('room-joined', response);

      // 다른 플레이어들에게 알림
      socket.to(room.code).emit('player-joined', { player, room });

      console.log(`${player.name} joined room ${room.code}`);
    });

    // 게임 시작
    socket.on('start-game', (payload: StartGamePayload) => {
      console.log(`[start-game] Socket ${socket.id} requested game start`);

      const room = roomManager.getPlayerRoom(socket.id);
      if (!room) {
        console.log(`[start-game] No room found for socket ${socket.id}`);
        return;
      }

      const player = room.players.find((p: Player) => p.socketId === socket.id);
      if (!player) {
        console.log(`[start-game] No player found in room ${room.code} for socket ${socket.id}`);
        return;
      }

      console.log(`[start-game] Player ${player.name} (${player.id}) trying to start room ${room.code}`);
      console.log(`[start-game] Room state: hostId=${room.hostId}, players=${room.players.length}, state=${room.state}`);

      if (payload.mapType) {
        roomManager.setMapType(room.code, payload.mapType);
      }

      const startedRoom = roomManager.startGame(room.code, player.id);
      if (!startedRoom) {
        console.log(`[start-game] startGame returned null - hostId mismatch or not enough players`);
        socket.emit('start-error', { message: '게임을 시작할 수 없습니다. (호스트만 시작 가능, 최소 2명 필요)' });
        return;
      }

      // 서버에서 던전 생성
      const dungeon = generateDungeon(startedRoom.mapType as MapType);

      // room에 던전 데이터 저장
      startedRoom.dungeon = {
        id: `dungeon-${room.code}-${Date.now()}`,
        mapType: startedRoom.mapType,
        theme: startedRoom.mapType,
        description: '',
        tiles: dungeon.tiles,
        width: dungeon.tiles[0].length,
        height: dungeon.tiles.length,
        spawnPoint: dungeon.spawnPoint,
        portalPosition: dungeon.portalPosition,
      };

      // 모든 플레이어에게 게임 시작 알림 (동일한 던전 데이터 전송)
      io.to(room.code).emit('game-started', {
        dungeon: dungeon.tiles,
        spawnPoint: dungeon.spawnPoint,
        portalPosition: dungeon.portalPosition,
        players: startedRoom.players,
        mapType: startedRoom.mapType,
      });

      console.log(`Game started in room ${room.code}`);
    });

    // 플레이어 이동
    socket.on('player-move', (payload: PlayerMovePayload) => {
      const room = roomManager.getPlayerRoom(socket.id);
      if (!room || room.state !== 'playing') return;

      const player = room.players.find((p: Player) => p.socketId === socket.id);
      if (!player) return;

      // 플레이어 위치 업데이트
      player.position = payload.position;

      // 다른 플레이어들에게 위치 브로드캐스트
      socket.to(room.code).emit('positions-update', {
        positions: [{ playerId: player.id, position: payload.position }],
      });
    });

    // 방 나가기
    socket.on('leave-room', () => {
      handleDisconnect(socket, io);
    });

    // 연결 해제
    socket.on('disconnect', () => {
      handleDisconnect(socket, io);
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

function handleDisconnect(socket: Socket, io: Server) {
  const result = roomManager.removePlayerBySocketId(socket.id);
  if (result) {
    io.to(result.room.code).emit('player-left', {
      playerId: result.playerId,
      room: result.room,
    });
  }
}
