import { v4 as uuidv4 } from 'uuid';
import type { Player, PlayerClass } from '@daily-dungeon/shared';

const CLASS_STATS: Record<PlayerClass, { hp: number; combatPower: number }> = {
  warrior: { hp: 120, combatPower: 20 },
  mage: { hp: 70, combatPower: 30 },
  cleric: { hp: 90, combatPower: 10 },
  rogue: { hp: 80, combatPower: 15 },
};

export function createPlayer(
  socketId: string,
  name: string,
  playerClass: PlayerClass
): Player {
  const stats = CLASS_STATS[playerClass];

  return {
    id: uuidv4(),
    socketId,
    name,
    class: playerClass,
    position: { x: 0, y: 0 },
    hp: stats.hp,
    maxHp: stats.hp,
    combatPower: stats.combatPower,
    isAlive: true,
    hasEscaped: false,
    inventory: [],
    equipment: {
      weapon: null,
      armor: null,
      accessory: null,
    },
    keys: 1,
  };
}
