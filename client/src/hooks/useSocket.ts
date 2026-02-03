import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../stores/gameStore';
import type {
  RoomCreatedResponse,
  RoomJoinedResponse,
  Room,
  Player,
  MapType,
  DungeonTile,
  Position,
} from '@daily-dungeon/shared';

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const {
    setPlayer,
    setRoom,
    setConnected,
    setError,
    addPlayer,
    removePlayer,
    setGameState,
  } = useGameStore();

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    // 방 생성 응답
    socket.on('room-created', (data: RoomCreatedResponse) => {
      setPlayer(data.player);
      setRoom({
        code: data.roomCode,
        players: [data.player],
        state: 'waiting',
        dungeon: null,
        hostId: data.player.id,
        mapType: 'goblin_cave',
      });
      setGameState('lobby');
    });

    // 방 참가 응답
    socket.on('room-joined', (data: RoomJoinedResponse) => {
      setPlayer(data.player);
      setRoom(data.room);
      setGameState('lobby');
    });

    // 새 플레이어 참가
    socket.on('player-joined', (data: { player: Player; room: Room }) => {
      setRoom(data.room);
    });

    // 플레이어 퇴장
    socket.on('player-left', (data: { playerId: string; room: Room }) => {
      setRoom(data.room);
    });

    // 게임 시작
    socket.on('game-started', (data: {
      players: Player[];
      mapType: string;
      dungeon: DungeonTile[][];
      spawnPoint: Position;
      portalPosition: Position;
    }) => {
      setRoom((prevRoom) =>
        prevRoom
          ? {
              ...prevRoom,
              state: 'playing',
              players: data.players,
              mapType: data.mapType as MapType,
              dungeon: {
                id: `dungeon-${prevRoom.code}`,
                mapType: data.mapType as MapType,
                theme: data.mapType,
                description: '',
                tiles: data.dungeon,
                width: data.dungeon[0]?.length || 0,
                height: data.dungeon.length,
                spawnPoint: data.spawnPoint,
                portalPosition: data.portalPosition,
              },
            }
          : null
      );
      setGameState('playing');
    });

    // 에러 처리
    socket.on('join-error', (data: { message: string }) => {
      setError(data.message);
    });

    socket.on('start-error', (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = (playerName: string, playerClass: string) => {
    socketRef.current?.emit('create-room', { playerName, playerClass });
  };

  const joinRoom = (roomCode: string, playerName: string, playerClass: string) => {
    socketRef.current?.emit('join-room', { roomCode, playerName, playerClass });
  };

  const startGame = (mapType?: string) => {
    console.log('[startGame] Called, socket:', socketRef.current?.id, 'mapType:', mapType);
    socketRef.current?.emit('start-game', { mapType });
  };

  const leaveRoom = () => {
    socketRef.current?.emit('leave-room');
    setRoom(null);
    setPlayer(null);
    setGameState('home');
  };

  return {
    socket: socketRef.current,
    createRoom,
    joinRoom,
    startGame,
    leaveRoom,
  };
}
