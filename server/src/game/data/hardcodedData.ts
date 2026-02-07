import type {
  Enemy,
  ChoiceOption,
  ActionCategory,
  LootItem,
  RollTier,
} from '@round-midnight/shared';
import { GAME_CONSTANTS } from '@round-midnight/shared';

// ===== 웨이브 템플릿 =====

export interface WaveTemplate {
  enemy: Omit<Enemy, 'hp' | 'maxHp' | 'attack'>; // hp/atk는 스케일링 후 결정, defense는 enemy 안에 포함
  baseHp: number;
  baseAttack: number;
  situation: string;
  /** 배경별 선택지 (2~3개씩) */
  choicesByBackground: Record<string, ChoiceOptionTemplate[]>;
  /** 배경에 해당하지 않는 플레이어용 기본 선택지 */
  defaultChoices: ChoiceOptionTemplate[];
}

export interface ChoiceOptionTemplate {
  text: string;
  category: ActionCategory;
  baseDC: number;
}

export const WAVE_TEMPLATES: WaveTemplate[] = [
  // ── Wave 1: 성난 너구리 가족 ──
  {
    enemy: {
      name: '성난 너구리 가족',
      description: '쓰레기통을 뒤지다 눈이 마주친 너구리 일가. 아빠 너구리의 눈빛이 심상치 않다.',
      defense: 3,
      imageTag: 'raccoon',
    },
    baseHp: 45,
    baseAttack: 8,
    situation: '야시장 뒷골목. 쓰레기통에서 뭔가 부스럭거린다. 갑자기 뚜껑이 날아가며 성난 너구리 가족이 튀어나온다! 아기 너구리 세 마리가 뒤에서 끽끽거린다.',
    choicesByBackground: {
      '전직 경비원': [
        { text: '배트를 휘두르며 위협한다', category: 'physical', baseDC: 8 },
        { text: '패딩으로 방어 자세를 취한다', category: 'defensive', baseDC: 9 },
      ],
      '요리사': [
        { text: '남은 음식으로 다른 곳으로 유인한다', category: 'creative', baseDC: 8 },
        { text: '프라이팬을 꺼내 위협한다', category: 'physical', baseDC: 10 },
      ],
      '개발자': [
        { text: '스마트폰 플래시로 눈부시게 한다', category: 'technical', baseDC: 9 },
        { text: '노트북을 방패 삼아 방어한다', category: 'defensive', baseDC: 10 },
      ],
      '영업사원': [
        { text: '차분한 목소리로 너구리를 진정시킨다', category: 'social', baseDC: 8 },
        { text: '명함을 던져 주의를 돌린다', category: 'creative', baseDC: 10 },
      ],
    },
    defaultChoices: [
      { text: '소리를 질러 쫓아본다', category: 'physical', baseDC: 9 },
      { text: '천천히 뒷걸음질 친다', category: 'defensive', baseDC: 8 },
    ],
  },

  // ── Wave 2: 이상한 자판기 ──
  {
    enemy: {
      name: '이상한 자판기',
      description: '갑자기 스스로 움직이기 시작한 자판기. 캔을 발사하고 있다.',
      defense: 4,
      imageTag: 'vending-machine',
    },
    baseHp: 55,
    baseAttack: 10,
    situation: '골목을 지나니 편의점 앞 자판기가 덜덜 떨고 있다. "음료... 사줘..." 기계음과 함께 자판기가 캔을 마구 발사하기 시작한다!',
    choicesByBackground: {
      '전직 경비원': [
        { text: '배트로 캔을 쳐낸다', category: 'physical', baseDC: 8 },
        { text: '옆 건물 뒤로 숨어 접근한다', category: 'defensive', baseDC: 10 },
      ],
      '요리사': [
        { text: '동전을 넣어 달래본다', category: 'creative', baseDC: 9 },
        { text: '캔을 잡아서 되던진다', category: 'physical', baseDC: 11 },
      ],
      '개발자': [
        { text: '전원 코드를 찾아 뽑는다', category: 'technical', baseDC: 8 },
        { text: '노트북으로 자판기를 해킹한다', category: 'technical', baseDC: 11 },
      ],
      '영업사원': [
        { text: '"사실 저도 힘든 하루였어요" 공감한다', category: 'social', baseDC: 9 },
        { text: '자판기에게 비즈니스 제안을 한다', category: 'social', baseDC: 11 },
      ],
    },
    defaultChoices: [
      { text: '물건을 던져 주의를 끈다', category: 'creative', baseDC: 10 },
      { text: '뒤로 물러나 관찰한다', category: 'defensive', baseDC: 9 },
    ],
  },

  // ── Wave 3: 그림자 고양이 떼 ──
  {
    enemy: {
      name: '그림자 고양이 떼',
      description: '어둠 속에서 수십 개의 눈이 빛난다. 그림자처럼 움직이는 고양이들.',
      defense: 5,
      imageTag: 'shadow-cats',
    },
    baseHp: 65,
    baseAttack: 12,
    situation: '가로등이 깜빡이더니 꺼진다. 어둠 속에서 수십 개의 눈이 빛나기 시작한다. 그림자 고양이 떼가 사방에서 다가온다. 으르렁거리는 소리가 점점 커진다.',
    choicesByBackground: {
      '전직 경비원': [
        { text: '열쇠고리 손전등을 켠다', category: 'defensive', baseDC: 10 },
        { text: '배트를 빙글빙글 돌리며 공간을 확보한다', category: 'physical', baseDC: 11 },
      ],
      '요리사': [
        { text: '참치캔을 열어 한쪽으로 던진다', category: 'creative', baseDC: 9 },
        { text: '칼을 빛에 반사시켜 고양이를 현혹한다', category: 'creative', baseDC: 12 },
      ],
      '개발자': [
        { text: '보조배터리로 가로등을 임시 충전한다', category: 'technical', baseDC: 10 },
        { text: '폰으로 고양이 울음소리를 재생한다', category: 'technical', baseDC: 12 },
      ],
      '영업사원': [
        { text: '"우리는 적이 아니에요" 협상한다', category: 'social', baseDC: 10 },
        { text: '고양이 대장에게 다가가 신뢰를 쌓는다', category: 'social', baseDC: 12 },
      ],
    },
    defaultChoices: [
      { text: '큰 소리를 내서 위협한다', category: 'physical', baseDC: 11 },
      { text: '가만히 서서 적대감이 없음을 보인다', category: 'defensive', baseDC: 10 },
    ],
  },

  // ── Wave 4: 폭주 청소로봇 ──
  {
    enemy: {
      name: '폭주 청소로봇',
      description: '빨간 눈을 번쩍이며 돌진하는 산업용 청소로봇. 브러시가 무섭게 회전 중.',
      defense: 6,
      imageTag: 'cleaning-robot',
    },
    baseHp: 75,
    baseAttack: 15,
    situation: '지하도에 들어서자 "청소... 모드... 실행..." 하는 기계음이 울린다. 거대한 산업용 청소로봇이 빨간 눈을 켜고 돌진해온다. 회전 브러시에서 불꽃이 튄다!',
    choicesByBackground: {
      '전직 경비원': [
        { text: '배트로 브러시를 멈추려 한다', category: 'physical', baseDC: 10 },
        { text: '패딩으로 감싼 쓰레기통을 방패로 쓴다', category: 'defensive', baseDC: 11 },
        { text: '뒤에서 킥으로 전원부를 공격한다', category: 'physical', baseDC: 13 },
      ],
      '요리사': [
        { text: '기름을 바닥에 뿌려 미끄러뜨린다', category: 'creative', baseDC: 10 },
        { text: '프라이팬으로 센서를 가린다', category: 'creative', baseDC: 12 },
      ],
      '개발자': [
        { text: '제어 패널을 찾아 긴급 정지 코드를 입력한다', category: 'technical', baseDC: 10 },
        { text: '와이파이로 로봇 펌웨어에 접근한다', category: 'technical', baseDC: 13 },
      ],
      '영업사원': [
        { text: '"당신의 노고에 감사합니다" 감성 어필한다', category: 'social', baseDC: 11 },
        { text: '로봇에게 유급휴가를 제안한다', category: 'social', baseDC: 13 },
      ],
    },
    defaultChoices: [
      { text: '벽 쪽으로 유인해서 부딪치게 한다', category: 'creative', baseDC: 11 },
      { text: '좁은 틈으로 숨는다', category: 'defensive', baseDC: 10 },
    ],
  },

  // ── Wave 5 (미드보스): 야시장의 주인 ──
  {
    enemy: {
      name: '야시장의 주인',
      description: '미소 짓는 거대한 고양이 탈을 쓴 존재. 주변의 노점들이 그의 의지로 움직인다.',
      defense: 8,
      imageTag: 'market-boss',
    },
    baseHp: 95,
    baseAttack: 18,
    situation: '야시장 중앙 광장. 모든 노점의 불이 동시에 꺼졌다가 보라색으로 켜진다. 거대한 고양이 탈을 쓴 존재가 천천히 나타난다. "어서 와. 오늘 밤의 마지막 손님이구나." 노점 포장마차들이 그의 손짓에 따라 움직이기 시작한다.',
    choicesByBackground: {
      '전직 경비원': [
        { text: '정면으로 돌진해 탈을 벗긴다', category: 'physical', baseDC: 12 },
        { text: '포장마차를 방패 삼아 접근한다', category: 'defensive', baseDC: 13 },
        { text: '동료를 지키며 방어진을 편다', category: 'defensive', baseDC: 11 },
      ],
      '요리사': [
        { text: '노점 화덕의 불을 이용해 공격한다', category: 'creative', baseDC: 11 },
        { text: '최고의 야식을 만들어 제안한다', category: 'creative', baseDC: 14 },
        { text: '포장마차 기구로 트랩을 만든다', category: 'technical', baseDC: 13 },
      ],
      '개발자': [
        { text: '야시장 전력 시스템을 해킹한다', category: 'technical', baseDC: 11 },
        { text: '보조배터리로 과부하를 일으킨다', category: 'technical', baseDC: 14 },
      ],
      '영업사원': [
        { text: '"이 야시장의 진짜 가치를 아시나요?" 설득한다', category: 'social', baseDC: 12 },
        { text: '동료들의 사기를 끌어올리는 연설을 한다', category: 'social', baseDC: 10 },
        { text: '계약서를 꺼내 협상을 시도한다', category: 'social', baseDC: 15 },
      ],
    },
    defaultChoices: [
      { text: '주변의 물건을 던져 공격한다', category: 'physical', baseDC: 12 },
      { text: '동료 뒤에서 지원한다', category: 'defensive', baseDC: 11 },
    ],
  },
];

// ===== 적 스케일링 =====

/**
 * 인원수에 따라 적 스탯 조정
 */
export function scaleEnemy(template: WaveTemplate, playerCount: number): Enemy {
  const scale = GAME_CONSTANTS.DIFFICULTY_SCALE[playerCount as keyof typeof GAME_CONSTANTS.DIFFICULTY_SCALE]
    ?? GAME_CONSTANTS.DIFFICULTY_SCALE[4];

  const hp = Math.floor(template.baseHp * scale.hpMod);

  return {
    ...template.enemy,
    hp,
    maxHp: hp,
    attack: Math.floor(template.baseAttack * scale.atkMod),
  };
}

// ===== 내러티브 템플릿 =====

const NARRATIVE_TEMPLATES: Record<RollTier, string[]> = {
  nat20: [
    '{name}의 {choice}이(가) 전설적으로 성공했다! 주변이 눈부신 빛으로 가득 찬다.',
    '{name}, 믿을 수 없는 행운! {choice} — 적이 크게 흔들린다!',
    '★ CRITICAL HIT! {name}의 {choice}에 적이 비틀거린다!',
  ],
  critical: [
    '{name}의 {choice}이(가) 훌륭하게 성공했다. 적이 타격을 입었다.',
    '{name}, 멋진 판단이었다! {choice}로 확실한 데미지를 입혔다.',
  ],
  normal: [
    '{name}이(가) {choice}을(를) 시도했다. 그럭저럭 효과가 있었다.',
    '{name}의 {choice}, 나쁘지 않은 결과다. 적에게 데미지를 주었지만 반격도 받았다.',
  ],
  fail: [
    '{name}의 {choice}이(가) 실패했다... 적의 반격이 날아온다.',
    '{name}, {choice}을(를) 시도했지만 빗나갔다. 아야.',
  ],
  nat1: [
    '{name}이(가) {choice}을(를) 시도하다가 넘어졌다! 적이 놓치지 않는다!',
    '★ FUMBLE! {name}의 {choice}이(가) 완전히 엉망이 됐다. 모두가 얼굴을 감쌌다.',
  ],
};

/**
 * 4명의 행동으로 내러티브 텍스트 생성
 */
export function buildNarrative(actions: import('@round-midnight/shared').PlayerAction[], enemyName: string, enemyDefeated: boolean): string {
  const lines: string[] = [];

  for (const action of actions) {
    const templates = NARRATIVE_TEMPLATES[action.tier];
    const template = templates[Math.floor(Math.random() * templates.length)];
    lines.push(
      template
        .replace('{name}', action.playerName)
        .replace('{choice}', action.choiceText)
    );
  }

  if (enemyDefeated) {
    lines.push('', `${enemyName}이(가) 쓰러졌다! 승리!`);
  } else {
    lines.push('', `${enemyName}은(는) 아직 건재하다...`);
  }

  return lines.join('\n');
}

// ===== 전리품 테이블 =====

export const LOOT_TABLE: LootItem[] = [
  { itemId: 'energy_drink', name: '수상한 에너지 드링크', type: 'consumable', rarity: 'common', description: '마시면 기운이 솟는다', effect: 'HP 15 회복' },
  { itemId: 'rusty_pipe', name: '녹슨 파이프', type: 'weapon', rarity: 'common', description: '꽤 묵직하다', effect: '물리 보정 +1' },
  { itemId: 'cardboard_armor', name: '골판지 갑옷', type: 'top', rarity: 'common', description: '누군가 정성 들여 만든 골판지 갑옷', effect: '방어 보정 +1' },
  { itemId: 'pocket_calculator', name: '주머니 계산기', type: 'accessory', rarity: 'common', description: '빠른 계산은 생존의 기본', effect: '기술 행동 DC -1' },
  { itemId: 'tteokbokki_cup', name: '컵 떡볶이', type: 'consumable', rarity: 'common', description: '매운맛이 정신을 차리게 한다', effect: 'HP 20 회복' },
  { itemId: 'construction_vest', name: '안전 조끼', type: 'top', rarity: 'uncommon', description: '반사 스트라이프가 어둠 속에서 빛난다', effect: '방어 보정 +2' },
  { itemId: 'friendship_bracelet', name: '우정 팔찌', type: 'accessory', rarity: 'common', description: '친구가 만들어준 팔찌', effect: '사회 행동 DC -1' },
  { itemId: 'hotdog_fresh', name: '수제 핫도그', type: 'consumable', rarity: 'common', description: '아직 따뜻하다', effect: 'HP 15 회복' },
  { itemId: 'mystery_can', name: '미스터리 캔', type: 'consumable', rarity: 'common', description: '라벨이 벗겨져 있다', effect: 'HP 25 회복' },
  { itemId: 'rabbit_foot_keychain', name: '토끼발 열쇠고리', type: 'accessory', rarity: 'common', description: '행운의 상징', effect: '주사위 리롤 1회' },
];

// ===== 다음 웨이브 미리보기 =====

export const NEXT_WAVE_PREVIEWS: string[] = [
  '더 깊은 곳에서 기계음이 들린다...',
  '그림자가 점점 짙어진다...',
  '지면이 미세하게 흔들리고 있다...',
  '어디선가 으르렁거리는 소리가...',
  '', // 마지막 웨이브 후에는 미리보기 없음
];
