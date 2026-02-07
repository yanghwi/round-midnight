import type { Character, Equipment, InventoryItem, InventoryItemDisplay, TemporaryBuff } from '@round-midnight/shared';
import { GAME_CONSTANTS } from '@round-midnight/shared';
import { getItemById } from './data/items/index.js';
import { summarizeEffects } from './LootEngine.js';

/**
 * 아이템을 인벤토리에 추가 (20칸 제한)
 * 인벤토리가 가득 차면 변경 없이 원래 character 반환
 */
export function addItemToInventory(character: Character, itemId: string): Character {
  const item = getItemById(itemId);
  if (!item) return character;

  if (character.inventory.length >= GAME_CONSTANTS.MAX_RUN_INVENTORY) return character;

  const newInventory: InventoryItem[] = [
    ...character.inventory,
    { itemId, equipped: false },
  ];

  return { ...character, inventory: newInventory };
}

/**
 * 아이템 장착 (자동 슬롯 감지, 기존 장비 해제)
 */
export function equipItem(character: Character, itemId: string): Character {
  const item = getItemById(itemId);
  if (!item) return character;

  // 인벤토리에 해당 아이템이 있는지 확인
  const invIdx = character.inventory.findIndex(
    (inv) => inv.itemId === itemId && !inv.equipped,
  );
  if (invIdx === -1) return character;

  if (item.type === 'consumable') return character; // 소모품은 장착 불가
  const slot = item.type;

  // 기존 장착 아이템 해제
  const slotItemIdKey = `${slot}ItemId` as keyof Equipment;
  const existingItemId = character.equipment[slotItemIdKey] as string | undefined;

  const newInventory = [...character.inventory];

  // 기존 장비 해제 (인벤토리에서 equipped=false로)
  if (existingItemId) {
    const existingIdx = newInventory.findIndex(
      (inv) => inv.itemId === existingItemId && inv.equipped,
    );
    if (existingIdx !== -1) {
      newInventory[existingIdx] = { ...newInventory[existingIdx], equipped: false };
    }
  }

  // 새 아이템 장착
  newInventory[invIdx] = { ...newInventory[invIdx], equipped: true };

  // Equipment 업데이트
  const newEquipment: Equipment = { ...character.equipment };
  newEquipment[slot] = item.name;

  // 슬롯별 itemId 업데이트 + 보너스 재계산
  if (slot === 'weapon') {
    newEquipment.weaponItemId = itemId;
  } else if (slot === 'top') {
    newEquipment.topItemId = itemId;
  } else if (slot === 'bottom') {
    newEquipment.bottomItemId = itemId;
  } else if (slot === 'hat') {
    newEquipment.hatItemId = itemId;
  } else if (slot === 'accessory') {
    newEquipment.accessoryItemId = itemId;
  }

  return {
    ...character,
    inventory: newInventory,
    equipment: newEquipment,
  };
}

/**
 * 소모품 사용 (HP 회복 등 + 인벤토리에서 제거)
 */
export function useConsumable(character: Character, itemId: string): Character {
  const item = getItemById(itemId);
  if (!item || item.type !== 'consumable') return character;

  // 인벤토리에서 해당 소모품 찾기
  const invIdx = character.inventory.findIndex(
    (inv) => inv.itemId === itemId && !inv.equipped,
  );
  if (invIdx === -1) return character;

  // 인벤토리에서 제거
  const newInventory = [...character.inventory];
  newInventory.splice(invIdx, 1);

  // 효과 적용
  let newHp = character.hp;
  let newMaxHp = character.maxHp;
  const newBuffs: TemporaryBuff[] = [...(character.activeBuffs ?? [])];

  for (const effect of item.effects) {
    if (effect.type === 'hp_restore') {
      newHp = Math.min(newMaxHp, newHp + effect.value);
    }
    if (effect.type === 'stat_bonus') {
      newBuffs.push({ effect, remainingWaves: 1, sourceItemId: itemId });
    }
  }

  return {
    ...character,
    inventory: newInventory,
    hp: newHp,
    isAlive: newHp > 0,
    activeBuffs: newBuffs,
  };
}

/**
 * 장착 해제 (equipped=false, equipment 슬롯 초기화)
 */
export function unequipItem(character: Character, itemId: string): Character {
  const item = getItemById(itemId);
  if (!item) return character;

  const invIdx = character.inventory.findIndex(
    (inv) => inv.itemId === itemId && inv.equipped,
  );
  if (invIdx === -1) return character;

  const slot = item.type;
  if (slot === 'consumable') return character;

  const newInventory = [...character.inventory];
  newInventory[invIdx] = { ...newInventory[invIdx], equipped: false };

  const newEquipment: Equipment = { ...character.equipment };
  const slotItemIdKey = `${slot}ItemId` as keyof Equipment;

  // 해당 슬롯에 장착된 아이템이 맞는지 확인
  if (newEquipment[slotItemIdKey] === itemId) {
    if (slot === 'weapon') {
      newEquipment.weapon = '';
      newEquipment.weaponItemId = undefined;
    } else if (slot === 'top') {
      newEquipment.top = '';
      newEquipment.topItemId = undefined;
    } else if (slot === 'bottom') {
      newEquipment.bottom = '';
      newEquipment.bottomItemId = undefined;
    } else if (slot === 'hat') {
      newEquipment.hat = '';
      newEquipment.hatItemId = undefined;
    } else if (slot === 'accessory') {
      newEquipment.accessory = '';
      newEquipment.accessoryItemId = undefined;
      newEquipment.accessoryEffect = { type: 'none' };
    }
  }

  return {
    ...character,
    inventory: newInventory,
    equipment: newEquipment,
  };
}

/**
 * 아이템 버리기 (인벤토리에서 제거, 장착 중이면 해제 후 제거)
 */
export function discardItem(character: Character, itemId: string): Character {
  const invIdx = character.inventory.findIndex((inv) => inv.itemId === itemId);
  if (invIdx === -1) return character;

  const inv = character.inventory[invIdx];

  // 장착 중이면 먼저 해제
  if (inv.equipped) {
    character = unequipItem(character, itemId);
  }

  const newInventory = [...character.inventory];
  const removeIdx = newInventory.findIndex((i) => i.itemId === itemId);
  if (removeIdx !== -1) newInventory.splice(removeIdx, 1);

  return { ...character, inventory: newInventory };
}

/**
 * InventoryItem[] → InventoryItemDisplay[] 변환 (클라이언트 표시용)
 */
export function toDisplayInventory(inventory: InventoryItem[]): InventoryItemDisplay[] {
  return inventory.map((inv) => {
    const item = getItemById(inv.itemId);
    return {
      itemId: inv.itemId,
      equipped: inv.equipped,
      name: item?.name ?? '???',
      type: item?.type ?? 'consumable',
      rarity: item?.rarity ?? 'common',
      effect: item ? summarizeEffects(item.effects) : '',
      flavorText: item?.flavorText ?? '',
    };
  });
}
