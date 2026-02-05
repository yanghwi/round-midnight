import { v4 as uuidv4 } from 'uuid';
import type { Player } from '@daily-dungeon/shared';
import { GAME_CONSTANTS } from '@daily-dungeon/shared';

/**
 * 플레이어 생성
 * 직업 시스템 제거 - 모든 플레이어가 동일한 기본 스탯으로 시작
 */
export function createPlayer(socketId: string, name: string): Player {
  return {
    id: uuidv4(),
    socketId,
    name,
    hp: GAME_CONSTANTS.DEFAULT_HP,
    maxHp: GAME_CONSTANTS.DEFAULT_HP,
    combatPower: GAME_CONSTANTS.DEFAULT_COMBAT_POWER,
    isAlive: true,
    hasEscaped: false,
    inventory: [],
    keys: 1,
  };
}
