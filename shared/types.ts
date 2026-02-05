// ===== 기본 타입 =====

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type ItemType = 'weapon' | 'armor' | 'accessory' | 'consumable';

// ===== 플레이어 =====

export interface Player {
  id: string;
  socketId: string;
  name: string;

  hp: number;
  maxHp: number;
  combatPower: number;

  isAlive: boolean;
  hasEscaped: boolean;

  inventory: Item[];

  // 열쇠
  keys: number;
}

// ===== 아이템 =====

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  combatPower: number;  // 전투력 보정
  effect?: string;      // 특수 효과 설명
  description: string;
}

// ===== 적 (EarthBound 스타일) =====

export interface Enemy {
  id: string;
  name: string;
  description: string;
  combatPower: number;
  imageKey: string;      // 이모지 또는 이미지 키
  attackMessage: string; // 공격 시 표시할 메시지
  abilities?: string;    // LLM이 활용할 능력 설명
  isBoss?: boolean;      // 보스 여부
}

// ===== 웨이브 시스템 =====

export interface Wave {
  waveNumber: number;
  enemy: Enemy;
  isCleared: boolean;
}

// ===== 런 상태 =====

export interface RunState {
  currentWave: number;
  maxWaves: number;  // MVP: 3, 전체: 10
  accumulatedRewards: Item[];
}

// ===== 전투 상태 =====

export interface BattleState {
  enemy: Enemy | null;
  narration: string;
  isWaitingForChoice: boolean;
  isProcessing: boolean;  // 전투 처리 중
}

// ===== 투표 시스템 (다수결) =====

export type VoteChoice = 'continue' | 'retreat';

export interface VoteState {
  votes: Record<string, VoteChoice>;  // playerId -> choice
  totalPlayers: number;
  deadline?: number;  // 타임아웃 (선택적)
}

// ===== 전투 결과 =====

export type CombatResult = 'perfect' | 'victory' | 'narrow' | 'defeat' | 'wipe';

export interface CombatOutcome {
  result: CombatResult;
  enemy: Enemy;
  participants: string[];  // 참전한 플레이어 ID
  damages: { playerId: string; damage: number }[];
  drops: Item[];
  description: string;  // AI 생성 상황 묘사
}

// ===== 방 =====

export type RoomState = 'waiting' | 'playing' | 'finished';

export interface Room {
  code: string;
  players: Player[];
  state: RoomState;
  hostId: string;

  // 런 상태
  run: RunState | null;

  // 투표 상태
  vote: VoteState | null;
}

// ===== 게임 결과 =====

export interface GameResult {
  escaped: string[];      // 탈출 성공한 플레이어
  died: string[];         // 사망한 플레이어
  waveReached: number;    // 도달한 웨이브
  totalRewards: Item[];   // 획득한 보상
}

// ===== Socket 페이로드 =====

// 로비
export interface CreateRoomPayload {
  playerName: string;
}

export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
}

export interface RoomCreatedResponse {
  roomCode: string;
  player: Player;
}

export interface RoomJoinedResponse {
  room: Room;
  player: Player;
}

// 게임 시작
export interface GameStartedResponse {
  players: Player[];
  run: RunState;
  wave: Wave;
}

// 웨이브
export interface WaveStartPayload {
  wave: Wave;
}

// 공격 (전투 수행)
export interface AttackPayload {
  // 특별한 파라미터 없음 - 모든 생존 플레이어 자동 참전
}

export interface CombatResultResponse {
  outcome: CombatOutcome;
  updatedPlayers: Player[];
  run: RunState;
}

// 투표
export interface PlayerVotePayload {
  choice: VoteChoice;
}

export interface VoteUpdateResponse {
  votes: VoteState;
  result?: VoteChoice;  // 투표 완료 시 결과
}

// 런 종료
export interface RunEndPayload {
  waveReached: number;
  rewards: Item[];
  escaped: boolean;
}

// 플레이어 상태
export interface PlayerDiedResponse {
  playerId: string;
  playerName: string;
}

export interface GameOverResponse {
  result: GameResult;
}

// ===== 전투 선택지 시스템 (TTRPG 스타일) =====

export type ActionType = 'aggressive' | 'defensive' | 'tactical' | 'risky';

export interface CombatAction {
  id: string;
  type: ActionType;
  name: string;           // "정면 돌파"
  description: string;    // LLM 생성 상황 묘사
  emoji: string;
}

export interface DiceRoll {
  value: number;      // 1-20
  isCritical: boolean;
  isFumble: boolean;
}

// LLM 전투 판정 결과
export interface LLMCombatResult {
  result: CombatResult;
  damages: { playerId: string; damage: number }[];
  narration: string;
}

// 선택지 상태 (클라이언트용)
export interface ChoiceState {
  actions: CombatAction[];
  votes: Record<string, string>;  // playerId -> actionId
  selectedActionId: string | null;
  diceRoll: DiceRoll | null;
  deadline: number;
}

// ===== Socket 페이로드 (선택지 시스템) =====

export interface ChoicesGeneratedResponse {
  actions: CombatAction[];
  deadline: number;
}

export interface SelectActionPayload {
  actionId: string;
}

export interface ActionVoteUpdateResponse {
  votes: Record<string, string>;  // playerId -> actionId
  totalPlayers: number;
}

export interface DiceRolledResponse {
  selectedAction: CombatAction;
  diceRoll: DiceRoll;
}

// ===== 상수 =====

export const GAME_CONSTANTS = {
  // 방
  ROOM_CODE_LENGTH: 4,
  MAX_PLAYERS: 4,
  MIN_PLAYERS: 1,  // MVP: 1명도 가능

  // 열쇠
  DAILY_KEYS: 1,
  WEEKEND_KEYS: 2,
  MAX_KEYS: 3,

  // 기본 스탯
  DEFAULT_HP: 100,
  DEFAULT_COMBAT_POWER: 20,

  // 전투
  COMBAT_RANDOM_RANGE: 0.2,  // ±20%

  // 웨이브
  MVP_MAX_WAVES: 3,
  FULL_MAX_WAVES: 10,
  MID_BOSS_WAVE: 5,    // 중간보스 웨이브
  FINAL_BOSS_WAVE: 10, // 최종보스 웨이브

  // 인원별 난이도
  DIFFICULTY_SCALE: {
    4: { hpMod: 1.0, atkMod: 1.0 },
    3: { hpMod: 0.85, atkMod: 0.9 },
    2: { hpMod: 0.7, atkMod: 0.8 },
    1: { hpMod: 0.5, atkMod: 0.6 },
  },

  // 투표 타임아웃
  VOTE_TIMEOUT: 30000,  // 30초

  // 선택지 타임아웃
  ACTION_CHOICE_TIMEOUT: 20000,  // 20초
} as const;
