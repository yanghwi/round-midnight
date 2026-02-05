import type {
  Player,
  Enemy,
  CombatResult,
  CombatOutcome,
  DiceRoll,
} from '@daily-dungeon/shared';
import { generateDrops } from './items';

/**
 * d20 주사위 굴림
 * 크리티컬(20)과 펌블(1) 판정 포함
 */
export function rollDice(): DiceRoll {
  const value = Math.floor(Math.random() * 20) + 1;
  return {
    value,
    isCritical: value === 20,
    isFumble: value === 1,
  };
}

/**
 * 전투 판정 시스템
 * EarthBound 스타일: 모든 생존 플레이어가 자동 참전
 */

// 파티 전투력 계산 (장비 보정 포함)
function calculatePartyCombatPower(players: Player[]): number {
  return players.reduce((total, player) => {
    // 기본 전투력 + 인벤토리 아이템 보정
    let power = player.combatPower;

    for (const item of player.inventory) {
      power += item.combatPower;
    }

    return total + power;
  }, 0);
}

// 전투 결과 판정
function determineCombatResult(ratio: number): CombatResult {
  if (ratio >= 2.0) return 'perfect'; // 완벽한 승리 (2배 이상)
  if (ratio >= 1.2) return 'victory'; // 승리 (1.2배 이상)
  if (ratio >= 0.8) return 'narrow';  // 아슬아슬한 승리 (0.8배 이상)
  if (ratio >= 0.5) return 'defeat';  // 패배 (0.5배 이상)
  return 'wipe';                       // 전멸 (0.5배 미만)
}

// 데미지 계산
function calculateDamages(
  participants: Player[],
  enemy: Enemy,
  result: CombatResult
): { playerId: string; damage: number }[] {
  const damages: { playerId: string; damage: number }[] = [];

  for (const player of participants) {
    let damage = 0;

    switch (result) {
      case 'perfect':
        damage = 0; // 피해 없음
        break;
      case 'victory':
        damage = Math.floor(enemy.combatPower * 0.1 + Math.random() * 5);
        break;
      case 'narrow':
        damage = Math.floor(enemy.combatPower * 0.3 + Math.random() * 10);
        break;
      case 'defeat':
        damage = Math.floor(enemy.combatPower * 0.5 + Math.random() * 15);
        break;
      case 'wipe':
        damage = Math.floor(enemy.combatPower * 0.8 + Math.random() * 20);
        break;
    }

    damages.push({ playerId: player.id, damage });
  }

  return damages;
}

// 플레이어에게 데미지 적용
function applyDamages(
  players: Player[],
  damages: { playerId: string; damage: number }[]
): Player[] {
  const updatedPlayers: Player[] = [];

  for (const player of players) {
    const damageInfo = damages.find((d) => d.playerId === player.id);
    if (damageInfo) {
      const newHp = Math.max(0, player.hp - damageInfo.damage);
      const isAlive = newHp > 0;

      updatedPlayers.push({
        ...player,
        hp: newHp,
        isAlive,
      });
    } else {
      // 참전하지 않은 플레이어는 그대로
      updatedPlayers.push(player);
    }
  }

  return updatedPlayers;
}

// 생존한 플레이어 필터링
function getAliveParticipants(players: Player[]): Player[] {
  return players.filter((p) => p.isAlive && !p.hasEscaped);
}

/**
 * 전투 즉시 판정
 * 모든 생존 플레이어가 자동으로 참전
 */
export function resolveCombat(
  allPlayers: Player[],
  enemy: Enemy,
  waveNumber: number = 1
): {
  outcome: CombatOutcome;
  updatedPlayers: Player[];
} {
  // 생존한 플레이어만 참전
  const participants = getAliveParticipants(allPlayers);

  if (participants.length === 0) {
    throw new Error('No alive participants for combat');
  }

  // 파티 전투력 계산
  const partyCombatPower = calculatePartyCombatPower(participants);

  // 판정 공식: (파티 전투력 / 적 전투력) × 랜덤(0.8~1.2)
  const randomMultiplier = 0.8 + Math.random() * 0.4;
  const ratio = (partyCombatPower / enemy.combatPower) * randomMultiplier;

  // 결과 판정
  const result = determineCombatResult(ratio);

  // 데미지 계산
  const damages = calculateDamages(participants, enemy, result);

  // 드랍 아이템 생성 (전투 결과와 웨이브에 따라)
  const drops = generateDrops(result, waveNumber);

  // 플레이어 상태 업데이트
  const updatedPlayers = applyDamages(allPlayers, damages);

  const outcome: CombatOutcome = {
    result,
    enemy,
    participants: participants.map((p) => p.id),
    damages,
    drops,
    description: '', // AI가 나중에 채움
  };

  return { outcome, updatedPlayers };
}

/**
 * 전투 결과에 따른 승리 여부
 */
export function isVictory(result: CombatResult): boolean {
  return result === 'perfect' || result === 'victory' || result === 'narrow';
}

/**
 * 파티 전멸 여부 확인
 */
export function isPartyWiped(players: Player[]): boolean {
  return !players.some((p) => p.isAlive && !p.hasEscaped);
}
