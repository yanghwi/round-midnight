import { create } from 'zustand';
import type {
  Character,
  Room,
  RunPhase,
  RunState,
  Enemy,
  PlayerChoiceSet,
  PlayerAction,
  DamageResult,
  LootItem,
} from '@round-midnight/shared';

interface GameStore {
  // 연결 상태
  connected: boolean;
  setConnected: (connected: boolean) => void;

  // 플레이어
  player: Character | null;
  setPlayer: (player: Character | null) => void;

  // 방
  room: Room | null;
  setRoom: (room: Room | null) => void;

  // 게임 phase (UI 라우팅 기준)
  phase: RunPhase;
  setPhase: (phase: RunPhase) => void;

  // 런 상태
  run: RunState | null;
  setRun: (run: RunState | null) => void;

  // 전투 상태
  currentWave: number;
  enemy: Enemy | null;
  situation: string;
  myChoices: PlayerChoiceSet | null;
  mySelectedChoiceId: string | null;
  allActions: PlayerAction[] | null;
  narrative: string;
  damageResult: DamageResult | null;
  loot: LootItem[];

  // 전투 setter
  setWaveIntro: (wave: number, enemy: Enemy, situation: string, choices: PlayerChoiceSet) => void;
  setMyChoice: (choiceId: string) => void;
  setAllActions: (actions: PlayerAction[]) => void;
  setNarrative: (narrative: string, damageResult: DamageResult) => void;
  setLoot: (loot: LootItem[]) => void;

  // 에러
  error: string | null;
  setError: (error: string | null) => void;

  // 리셋
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),

  player: null,
  setPlayer: (player) => set({ player }),

  room: null,
  setRoom: (room) => set({ room }),

  phase: 'waiting',
  setPhase: (phase) => set({ phase }),

  run: null,
  setRun: (run) => set({ run }),

  // 전투 상태
  currentWave: 0,
  enemy: null,
  situation: '',
  myChoices: null,
  mySelectedChoiceId: null,
  allActions: null,
  narrative: '',
  damageResult: null,
  loot: [],

  setWaveIntro: (currentWave, enemy, situation, myChoices) =>
    set({
      currentWave,
      enemy,
      situation,
      myChoices,
      mySelectedChoiceId: null,
      allActions: null,
      narrative: '',
      damageResult: null,
      loot: [],
    }),

  setMyChoice: (choiceId) => set({ mySelectedChoiceId: choiceId }),

  setAllActions: (actions) => set({ allActions: actions }),

  setNarrative: (narrative, damageResult) => set({ narrative, damageResult }),

  setLoot: (loot) => set({ loot }),

  error: null,
  setError: (error) => set({ error }),

  resetGame: () =>
    set({
      room: null,
      player: null,
      phase: 'waiting',
      run: null,
      currentWave: 0,
      enemy: null,
      situation: '',
      myChoices: null,
      mySelectedChoiceId: null,
      allActions: null,
      narrative: '',
      damageResult: null,
      loot: [],
      error: null,
    }),
}));
