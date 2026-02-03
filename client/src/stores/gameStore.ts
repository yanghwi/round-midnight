import { create } from 'zustand';
import type { Player, Room, PlayerClass } from '@daily-dungeon/shared';

type GameState = 'home' | 'lobby' | 'playing';

interface GameStore {
  // 연결 상태
  connected: boolean;
  setConnected: (connected: boolean) => void;

  // 플레이어
  player: Player | null;
  setPlayer: (player: Player | null) => void;

  // 방
  room: Room | null;
  setRoom: (room: Room | null | ((prev: Room | null) => Room | null)) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;

  // 게임 상태
  gameState: GameState;
  setGameState: (state: GameState) => void;

  // 에러
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),

  player: null,
  setPlayer: (player) => set({ player }),

  room: null,
  setRoom: (room) =>
    set((state) => ({
      room: typeof room === 'function' ? room(state.room) : room,
    })),
  addPlayer: (player) =>
    set((state) => ({
      room: state.room
        ? { ...state.room, players: [...state.room.players, player] }
        : null,
    })),
  removePlayer: (playerId) =>
    set((state) => ({
      room: state.room
        ? {
            ...state.room,
            players: state.room.players.filter((p) => p.id !== playerId),
          }
        : null,
    })),

  gameState: 'home',
  setGameState: (gameState) => set({ gameState }),

  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
