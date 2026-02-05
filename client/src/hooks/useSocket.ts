import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../stores/gameStore';
import type {
  RoomCreatedResponse,
  RoomJoinedResponse,
  Room,
  Character,
} from '@round-midnight/shared';
import { SOCKET_EVENTS } from '@round-midnight/shared';

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const {
    setPlayer,
    setRoom,
    setConnected,
    setError,
    setPhase,
    resetGame,
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

    // ===== 로비 =====

    socket.on(SOCKET_EVENTS.ROOM_CREATED, (data: RoomCreatedResponse) => {
      setPlayer(data.player);
      setRoom({
        code: data.roomCode,
        players: [data.player],
        hostId: data.player.id,
        run: null,
        phase: 'waiting',
      });
      setPhase('waiting');
    });

    socket.on(SOCKET_EVENTS.ROOM_JOINED, (data: RoomJoinedResponse) => {
      setPlayer(data.player);
      setRoom(data.room);
      setPhase('waiting');
    });

    socket.on(SOCKET_EVENTS.PLAYER_JOINED, (data: { player: Character; room: Room }) => {
      setRoom(data.room);
    });

    socket.on(SOCKET_EVENTS.PLAYER_LEFT, (data: { playerId: string; room: Room }) => {
      setRoom(data.room);
    });

    // ===== 캐릭터 설정 =====

    socket.on(SOCKET_EVENTS.GAME_STARTED, (data: { room: Room }) => {
      setRoom(data.room);
      setPhase('character_setup');
    });

    socket.on(SOCKET_EVENTS.CHARACTER_READY, (data: { player: Character; room: Room }) => {
      setRoom(data.room);
      // 자기 자신의 캐릭터가 업데이트된 경우
      const store = useGameStore.getState();
      if (store.player?.id === data.player.id) {
        setPlayer(data.player);
      }
    });

    socket.on(SOCKET_EVENTS.ALL_CHARACTERS_READY, (data: { room: Room }) => {
      setRoom(data.room);
      setPhase('wave_intro');
      // Phase 2에서 wave-intro 이벤트 처리 추가
    });

    // ===== 에러 =====

    socket.on(SOCKET_EVENTS.ERROR, (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // ===== Emitters =====

  const createRoom = (playerName: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.CREATE_ROOM, { playerName });
  };

  const joinRoom = (roomCode: string, playerName: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.JOIN_ROOM, { roomCode, playerName });
  };

  const startGame = () => {
    socketRef.current?.emit(SOCKET_EVENTS.START_GAME);
  };

  const leaveRoom = () => {
    socketRef.current?.emit(SOCKET_EVENTS.LEAVE_ROOM);
    resetGame();
  };

  const submitCharacterSetup = (name: string, background: string) => {
    socketRef.current?.emit(SOCKET_EVENTS.CHARACTER_SETUP, { name, background });
  };

  return {
    socket: socketRef.current,
    createRoom,
    joinRoom,
    startGame,
    leaveRoom,
    submitCharacterSetup,
  };
}
