import type { ItemDefinition, ItemRarity } from '@round-midnight/shared';
import { WEAPONS } from './weapons.js';
import { TOPS } from './tops.js';
import { BOTTOMS } from './bottoms.js';
import { HATS } from './hats.js';
import { ACCESSORIES } from './accessories.js';
import { CONSUMABLES } from './consumables.js';

/** 전체 아이템 카탈로그 */
export const ALL_ITEMS: ItemDefinition[] = [
  ...WEAPONS,
  ...TOPS,
  ...BOTTOMS,
  ...HATS,
  ...ACCESSORIES,
  ...CONSUMABLES,
];

/** id → ItemDefinition 맵 (O(1) 조회) */
export const ITEM_BY_ID: Map<string, ItemDefinition> = new Map(
  ALL_ITEMS.map((item) => [item.id, item]),
);

/** 타입별 필터된 목록 */
export const ITEMS_BY_TYPE = {
  weapon: WEAPONS,
  top: TOPS,
  bottom: BOTTOMS,
  hat: HATS,
  accessory: ACCESSORIES,
  consumable: CONSUMABLES,
} as const;

/** id로 아이템 조회. 없으면 undefined */
export function getItemById(id: string): ItemDefinition | undefined {
  return ITEM_BY_ID.get(id);
}

/** 레어리티별 필터 */
export function getItemsByRarity(rarity: ItemRarity): ItemDefinition[] {
  return ALL_ITEMS.filter((item) => item.rarity === rarity);
}

// re-export
export { WEAPONS } from './weapons.js';
export { TOPS } from './tops.js';
export { BOTTOMS } from './bottoms.js';
export { HATS } from './hats.js';
export { ACCESSORIES } from './accessories.js';
export { CONSUMABLES } from './consumables.js';
