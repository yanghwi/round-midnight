import type {
  PlayerAction,
  Enemy,
  DamageResult,
  Character,
  RollTier,
} from '@round-midnight/shared';
import { GAME_CONSTANTS } from '@round-midnight/shared';

/** 티어별 데미지 배율 및 플레이어 피해 비율 */
const TIER_DAMAGE: Record<RollTier, { dmgMultiplier: number; playerHitRatio: number }> = {
  nat20:    { dmgMultiplier: 3,   playerHitRatio: 0 },
  critical: { dmgMultiplier: 2,   playerHitRatio: 0 },
  normal:   { dmgMultiplier: 1,   playerHitRatio: 0.3 },
  fail:     { dmgMultiplier: 0,   playerHitRatio: 0.7 },
  nat1:     { dmgMultiplier: 0,   playerHitRatio: 1 },
};

/**
 * 4명의 행동 결과로 적/아군 데미지 계산
 * @param playerMultipliers 플레이어별 damage_multiplier (아이템 효과)
 * @param isBossWave 보스 웨이브 여부 (bossDamageMultiplier 적용)
 */
export function calculateDamage(
  actions: PlayerAction[],
  enemy: Enemy,
  playerMultipliers?: Map<string, { damageMultiplier: number; bossDamageMultiplier: number }>,
  isBossWave?: boolean,
): DamageResult {
  const BASE = GAME_CONSTANTS.BASE_DAMAGE;

  let totalEnemyDamage = 0;
  const playerDamages: { playerId: string; damage: number }[] = [];

  for (const action of actions) {
    const { dmgMultiplier, playerHitRatio } = TIER_DAMAGE[action.tier];
    let dmg = BASE * dmgMultiplier;

    // 아이템 효과: damage_multiplier
    const multipliers = playerMultipliers?.get(action.playerId);
    if (multipliers) {
      dmg *= multipliers.damageMultiplier;
      if (isBossWave) dmg *= multipliers.bossDamageMultiplier;
    }

    totalEnemyDamage += Math.floor(dmg);
    playerDamages.push({
      playerId: action.playerId,
      damage: Math.floor(enemy.attack * playerHitRatio),
    });
  }

  // 적 방어력 적용
  totalEnemyDamage = Math.max(0, totalEnemyDamage - enemy.defense);

  const enemyDefeated = totalEnemyDamage >= enemy.hp;

  return {
    enemyDamage: totalEnemyDamage,
    playerDamages,
    enemyDefeated,
    loot: [], // 루트 생성은 WaveManager에서 담당
  };
}

/**
 * 플레이어 HP에 데미지 적용, isAlive 갱신
 */
export function applyDamageToPlayers(players: Character[], damageResult: DamageResult): Character[] {
  return players.map((p) => {
    const dmg = damageResult.playerDamages.find((d) => d.playerId === p.id);
    if (!dmg || dmg.damage === 0) return p;

    const newHp = Math.max(0, p.hp - dmg.damage);
    return { ...p, hp: newHp, isAlive: newHp > 0 };
  });
}
