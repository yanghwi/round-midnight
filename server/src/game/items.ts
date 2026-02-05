import type { Item, ItemRarity, ItemType } from '@daily-dungeon/shared';

/**
 * EarthBound 스타일 아이템 풀
 * 일상 사물의 기묘한 변형들
 */

// 아이템 ID 생성용 카운터
let itemIdCounter = 0;
function generateItemId(): string {
  return `item_${Date.now()}_${++itemIdCounter}`;
}

// 아이템 템플릿 정의
interface ItemTemplate {
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  combatPower: number;
  description: string;
  effect?: string;
}

// Common 아이템 (전투력 1-5)
const COMMON_ITEMS: ItemTemplate[] = [
  // Weapons
  {
    name: '깨진 USB 케이블',
    type: 'weapon',
    rarity: 'common',
    combatPower: 3,
    description: '한쪽만 작동하는 케이블. 때리면 아프긴 할 것 같다.',
  },
  {
    name: '녹슨 클립',
    type: 'weapon',
    rarity: 'common',
    combatPower: 2,
    description: '펴면 꽤 날카롭다. 아마도.',
  },
  {
    name: '부러진 연필',
    type: 'weapon',
    rarity: 'common',
    combatPower: 2,
    description: '심이 부러진 연필. 던지기에 적합하다.',
  },

  // Armor
  {
    name: '찢어진 후드티',
    type: 'armor',
    rarity: 'common',
    combatPower: 2,
    description: '구멍이 많지만 그래도 옷이다.',
  },
  {
    name: '젖은 양말',
    type: 'armor',
    rarity: 'common',
    combatPower: 1,
    description: '왜 이걸 주웠는지 모르겠다.',
  },

  // Accessory
  {
    name: '반짝이 스티커',
    type: 'accessory',
    rarity: 'common',
    combatPower: 1,
    description: '붙이면 기분이 좋아진다.',
  },
  {
    name: '구부러진 핀',
    type: 'accessory',
    rarity: 'common',
    combatPower: 1,
    description: '어딘가에 쓸모가 있을 것 같다.',
  },

  // Consumable
  {
    name: '따뜻한 커피',
    type: 'consumable',
    rarity: 'common',
    combatPower: 0,
    description: '마시면 HP가 10 회복된다.',
    effect: 'heal:10',
  },
  {
    name: '눅눅한 과자',
    type: 'consumable',
    rarity: 'common',
    combatPower: 0,
    description: '좀 눅눅하지만 먹을 만하다. HP 5 회복.',
    effect: 'heal:5',
  },
];

// Uncommon 아이템 (전투력 4-8)
const UNCOMMON_ITEMS: ItemTemplate[] = [
  // Weapons
  {
    name: '뾰족한 삼각자',
    type: 'weapon',
    rarity: 'uncommon',
    combatPower: 5,
    description: '꽤 날카롭다. 수학 시간의 악몽.',
  },
  {
    name: '무거운 사전',
    type: 'weapon',
    rarity: 'uncommon',
    combatPower: 6,
    description: '지식은 힘이다. 물리적으로도.',
  },

  // Armor
  {
    name: '두꺼운 점퍼',
    type: 'armor',
    rarity: 'uncommon',
    combatPower: 4,
    description: '푹신하고 따뜻하다. 방어력도 있다.',
  },
  {
    name: '학교 가방',
    type: 'armor',
    rarity: 'uncommon',
    combatPower: 5,
    description: '등에 메면 뒤를 보호한다.',
  },

  // Accessory
  {
    name: '행운의 동전',
    type: 'accessory',
    rarity: 'uncommon',
    combatPower: 3,
    description: '던지면 앞면만 나온다.',
  },
  {
    name: '빛나는 배지',
    type: 'accessory',
    rarity: 'uncommon',
    combatPower: 4,
    description: '어디서 났는지 모르지만 멋지다.',
  },

  // Consumable
  {
    name: '에너지 드링크',
    type: 'consumable',
    rarity: 'uncommon',
    combatPower: 0,
    description: '당분 과다! HP 20 회복.',
    effect: 'heal:20',
  },
];

// Rare 아이템 (전투력 6-12)
const RARE_ITEMS: ItemTemplate[] = [
  // Weapons
  {
    name: '날카로운 볼펜',
    type: 'weapon',
    rarity: 'rare',
    combatPower: 8,
    description: '누군가가 갈았다. 왜?',
  },
  {
    name: '전자기 리모컨',
    type: 'weapon',
    rarity: 'rare',
    combatPower: 10,
    description: '버튼을 누르면 무언가가 일어난다.',
  },

  // Armor
  {
    name: '튼튼한 가방',
    type: 'armor',
    rarity: 'rare',
    combatPower: 6,
    description: '여행용 가방. 많은 걸 견뎌왔다.',
  },
  {
    name: '가죽 재킷',
    type: 'armor',
    rarity: 'rare',
    combatPower: 8,
    description: '입으면 왠지 강해진 기분.',
  },

  // Accessory
  {
    name: '보조배터리',
    type: 'accessory',
    rarity: 'rare',
    combatPower: 5,
    description: '에너지가 충만해지는 느낌.',
  },
  {
    name: '빈티지 시계',
    type: 'accessory',
    rarity: 'rare',
    combatPower: 7,
    description: '시간이 멈춘 듯한 시계. 멋있다.',
  },

  // Consumable
  {
    name: '에너지 드링크',
    type: 'consumable',
    rarity: 'rare',
    combatPower: 0,
    description: '각성! HP 25 회복.',
    effect: 'heal:25',
  },
  {
    name: '어머니의 도시락',
    type: 'consumable',
    rarity: 'rare',
    combatPower: 0,
    description: '정성이 담긴 음식. HP 30 회복.',
    effect: 'heal:30',
  },
];

// Legendary 아이템 (전투력 12-25)
const LEGENDARY_ITEMS: ItemTemplate[] = [
  // Weapons
  {
    name: '전설의 키보드',
    type: 'weapon',
    rarity: 'legendary',
    combatPower: 20,
    description: '기계식. 청축. 이웃이 싫어한다.',
  },
  {
    name: '황금 스테이플러',
    type: 'weapon',
    rarity: 'legendary',
    combatPower: 15,
    description: '사무용품의 왕. 찍으면 매우 아프다.',
  },

  // Armor
  {
    name: '황금 마스크',
    type: 'armor',
    rarity: 'legendary',
    combatPower: 15,
    description: '누가 던전에서 이걸 잃어버렸을까?',
  },
  {
    name: '용사의 잠바',
    type: 'armor',
    rarity: 'legendary',
    combatPower: 18,
    description: '전설의 용사가 입었다는 패딩.',
  },

  // Accessory
  {
    name: '무한 와이파이',
    type: 'accessory',
    rarity: 'legendary',
    combatPower: 12,
    description: '던전에서도 끊기지 않는 연결.',
  },
  {
    name: '고대의 USB',
    type: 'accessory',
    rarity: 'legendary',
    combatPower: 14,
    description: 'USB 2.0인데 이상하게 빠르다.',
  },

  // Consumable
  {
    name: '완벽한 도시락',
    type: 'consumable',
    rarity: 'legendary',
    combatPower: 0,
    description: '전설의 요리사가 만든 도시락. HP 50 회복.',
    effect: 'heal:50',
  },
];

// 희귀도별 아이템 풀
const ITEM_POOLS: Record<ItemRarity, ItemTemplate[]> = {
  common: COMMON_ITEMS,
  uncommon: UNCOMMON_ITEMS,
  rare: RARE_ITEMS,
  legendary: LEGENDARY_ITEMS,
};

// 웨이브별 드롭 확률 정의
interface DropRates {
  common: number;
  uncommon: number;
  rare: number;
  legendary: number;
}

function getDropRates(waveNumber: number): DropRates {
  if (waveNumber <= 3) {
    return { common: 0.8, uncommon: 0.18, rare: 0.02, legendary: 0 };
  } else if (waveNumber <= 6) {
    return { common: 0.5, uncommon: 0.35, rare: 0.13, legendary: 0.02 };
  } else if (waveNumber <= 9) {
    return { common: 0.3, uncommon: 0.4, rare: 0.25, legendary: 0.05 };
  } else {
    // Wave 10 (보스)
    return { common: 0, uncommon: 0, rare: 0.4, legendary: 0.6 };
  }
}

/**
 * 희귀도 결정
 */
function determineRarity(waveNumber: number): ItemRarity {
  const rates = getDropRates(waveNumber);
  const roll = Math.random();

  let cumulative = 0;

  cumulative += rates.legendary;
  if (roll < cumulative) return 'legendary';

  cumulative += rates.rare;
  if (roll < cumulative) return 'rare';

  cumulative += rates.uncommon;
  if (roll < cumulative) return 'uncommon';

  return 'common';
}

/**
 * 랜덤 아이템 생성
 */
export function createRandomItem(waveNumber: number): Item {
  const rarity = determineRarity(waveNumber);
  const pool = ITEM_POOLS[rarity];
  const template = pool[Math.floor(Math.random() * pool.length)];

  return {
    id: generateItemId(),
    name: template.name,
    type: template.type,
    rarity: template.rarity,
    combatPower: template.combatPower,
    description: template.description,
    effect: template.effect,
  };
}

/**
 * 드롭 아이템 생성 (전투 결과에 따라)
 */
export type CombatResultType = 'perfect' | 'victory' | 'narrow' | 'defeat' | 'wipe';

interface DropConfig {
  chance: number;   // 드롭 확률 (0-1)
  minCount: number; // 최소 개수
  maxCount: number; // 최대 개수
}

const DROP_CONFIG: Record<CombatResultType, DropConfig> = {
  perfect: { chance: 1.0, minCount: 1, maxCount: 2 },
  victory: { chance: 0.8, minCount: 1, maxCount: 1 },
  narrow: { chance: 0.5, minCount: 1, maxCount: 1 },
  defeat: { chance: 0.1, minCount: 0, maxCount: 1 },
  wipe: { chance: 0, minCount: 0, maxCount: 0 },
};

/**
 * 전투 결과에 따른 드롭 아이템 생성
 */
export function generateDrops(
  combatResult: CombatResultType,
  waveNumber: number
): Item[] {
  const config = DROP_CONFIG[combatResult];

  // 드롭 확률 체크
  if (Math.random() > config.chance) {
    return [];
  }

  // 드롭 개수 결정
  const count =
    config.minCount +
    Math.floor(Math.random() * (config.maxCount - config.minCount + 1));

  // 아이템 생성
  const drops: Item[] = [];
  for (let i = 0; i < count; i++) {
    drops.push(createRandomItem(waveNumber));
  }

  return drops;
}
