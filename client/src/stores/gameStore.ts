import { create } from 'zustand';
import type {
  Player,
  Room,
  CombatOutcome,
  RunState,
  VoteState,
  VoteChoice,
  Wave,
  Enemy,
  Item,
  CombatAction,
  DiceRoll,
  ChoiceState,
} from '@daily-dungeon/shared';

type GameState = 'home' | 'lobby' | 'playing' | 'choosing' | 'rolling' | 'voting' | 'result';

interface BattleState {
  currentWave: number;
  maxWaves: number;
  enemy: Enemy | null;
  narration: string;
  isWaitingForChoice: boolean;
  isProcessing: boolean;
}

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

  // 게임 상태
  gameState: GameState;
  setGameState: (state: GameState) => void;

  // 전투 상태
  battle: BattleState;
  setBattle: (battle: Partial<BattleState>) => void;
  setCurrentWave: (wave: Wave) => void;
  setNarration: (narration: string) => void;
  setWaitingForChoice: (waiting: boolean) => void;
  setProcessing: (processing: boolean) => void;

  // 전투 결과
  combatOutcome: CombatOutcome | null;
  setCombatOutcome: (outcome: CombatOutcome | null) => void;

  // 최신 드롭 아이템 (전투 결과 표시용)
  latestDrops: Item[];
  setLatestDrops: (items: Item[]) => void;

  // 런 상태
  run: RunState | null;
  setRun: (run: RunState | null) => void;

  // 투표 상태
  vote: VoteState | null;
  setVote: (vote: VoteState | null) => void;
  myVote: VoteChoice | null;
  setMyVote: (choice: VoteChoice | null) => void;

  // 선택지 상태 (새로운 전투 시스템)
  choiceState: ChoiceState | null;
  setChoiceState: (state: ChoiceState | null) => void;
  setChoices: (actions: CombatAction[], deadline: number) => void;
  setActionVotes: (votes: Record<string, string>) => void;
  setMyAction: (actionId: string) => void;
  myActionId: string | null;
  setDiceRoll: (diceRoll: DiceRoll, selectedAction: CombatAction) => void;

  // 플레이어 업데이트 (전투 후)
  updatePlayers: (players: Player[]) => void;

  // 에러
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;

  // 리셋
  resetGame: () => void;
}

const initialBattleState: BattleState = {
  currentWave: 0,
  maxWaves: 10,
  enemy: null,
  narration: '',
  isWaitingForChoice: false,
  isProcessing: false,
};

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

  gameState: 'home',
  setGameState: (gameState) => set({ gameState }),

  // 전투 상태
  battle: initialBattleState,
  setBattle: (battle) =>
    set((state) => ({
      battle: { ...state.battle, ...battle },
    })),
  setCurrentWave: (wave) =>
    set((state) => ({
      battle: {
        ...state.battle,
        currentWave: wave.waveNumber,
        enemy: wave.enemy,
        narration: '',
        isWaitingForChoice: false,
        isProcessing: false,
      },
    })),
  setNarration: (narration) =>
    set((state) => ({
      battle: { ...state.battle, narration },
    })),
  setWaitingForChoice: (isWaitingForChoice) =>
    set((state) => ({
      battle: { ...state.battle, isWaitingForChoice },
    })),
  setProcessing: (isProcessing) =>
    set((state) => ({
      battle: { ...state.battle, isProcessing },
    })),

  // 전투 결과
  combatOutcome: null,
  setCombatOutcome: (combatOutcome) => set({ combatOutcome }),

  // 최신 드롭 아이템
  latestDrops: [],
  setLatestDrops: (latestDrops) => set({ latestDrops }),

  // 런 상태
  run: null,
  setRun: (run) => set({ run }),

  // 투표 상태
  vote: null,
  setVote: (vote) => set({ vote }),
  myVote: null,
  setMyVote: (myVote) => set({ myVote }),

  // 선택지 상태
  choiceState: null,
  setChoiceState: (choiceState) => set({ choiceState }),
  setChoices: (actions, deadline) =>
    set({
      choiceState: {
        actions,
        votes: {},
        selectedActionId: null,
        diceRoll: null,
        deadline,
      },
      myActionId: null,
    }),
  setActionVotes: (votes) =>
    set((state) => ({
      choiceState: state.choiceState
        ? { ...state.choiceState, votes }
        : null,
    })),
  myActionId: null,
  setMyAction: (actionId) => set({ myActionId: actionId }),
  setDiceRoll: (diceRoll, selectedAction) =>
    set((state) => ({
      choiceState: state.choiceState
        ? {
            ...state.choiceState,
            diceRoll,
            selectedActionId: selectedAction.id,
          }
        : null,
    })),

  // 플레이어 업데이트
  updatePlayers: (players) =>
    set((state) => {
      if (!state.room) return state;

      // 자신의 플레이어도 업데이트
      const updatedPlayer = players.find((p) => p.id === state.player?.id);

      return {
        room: { ...state.room, players },
        player: updatedPlayer || state.player,
      };
    }),

  error: null,
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // 리셋
  resetGame: () =>
    set({
      room: null,
      player: null,
      gameState: 'home',
      battle: initialBattleState,
      combatOutcome: null,
      latestDrops: [],
      run: null,
      vote: null,
      myVote: null,
      choiceState: null,
      myActionId: null,
      error: null,
    }),
}));
