import Anthropic from '@anthropic-ai/sdk';
import type {
  CombatOutcome,
  CombatResult,
  Player,
  Enemy,
  CombatAction,
  ActionType,
  DiceRoll,
  LLMCombatResult,
} from '@daily-dungeon/shared';

// 캐시 (동일 상황 재사용)
const CACHE_TTL = 1000 * 60 * 30; // 30분

interface CacheEntry {
  narrative: string;
  timestamp: number;
}

interface ChoicesCacheEntry {
  actions: CombatAction[];
  timestamp: number;
}

const narrativeCache = new Map<string, CacheEntry>();
const choicesCache = new Map<string, ChoicesCacheEntry>();

// 캐시 키 생성
function createNarrativeCacheKey(
  result: CombatResult,
  enemyName: string,
  participantCount: number
): string {
  return `narrative-${result}-${enemyName}-${participantCount}`;
}

function createChoicesCacheKey(enemyId: string, waveNumber: number): string {
  return `choices-${enemyId}-${waveNumber}`;
}

// 캐시 helper
function getFromCache<T>(cache: Map<string, { timestamp: number } & T>, key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry;
}

// 결과별 기본 묘사 (API 실패 시 폴백) - EarthBound 스타일
const FALLBACK_NARRATIVES: Record<CombatResult, string[]> = {
  perfect: [
    '파티의 완벽한 협공! 적은 당황한 표정으로 사라졌다.',
    '놀라운 콤보가 작렬했다! 적은 왜 자기가 여기 있는지 의문을 품으며 쓰러졌다.',
    '적은 자신의 존재 이유를 되돌아보다가 무력화되었다.',
  ],
  victory: [
    '적이 이상한 소리를 내며 사라졌다. 어딘가에서 경험치 획득 효과음이 들린다.',
    '열정적인 공격 끝에 승리! 적은 불만을 품은 채 떠났다.',
    '파티의 단결력에 적은 감명받아 물러났다. 약간의 상처가 남았다.',
  ],
  narrow: [
    '아슬아슬한 승리! 승리라고 부르기엔 좀 민망한 수준이다.',
    '간신히 이겼다. 모두의 컨디션이 엉망이 되었다.',
    '적을 쓰러뜨렸지만, 파티원들의 표정이 밝지 않다.',
  ],
  defeat: [
    '적의 공격이 너무 효과적이었다. 현실이 가혹하다.',
    '패배했다. 적이 의기양양해 보인다.',
    '완패. 무언가 근본적으로 잘못된 것 같다.',
  ],
  wipe: [
    '재앙적인 패배. 화면이 잠시 어두워진다.',
    '파티가 처참하게 쓰러졌다. 배경 음악이 점점 작아진다.',
    '전멸 직전. 누군가 "다시 하면 되지"라고 중얼거린다.',
  ],
};

// 폴백 선택지 (API 실패 시)
const FALLBACK_ACTIONS: CombatAction[] = [
  {
    id: 'fallback-aggressive',
    type: 'aggressive',
    name: '정면 돌파',
    description: '모든 힘을 다해 정면으로 돌격한다!',
    emoji: '⚔️',
  },
  {
    id: 'fallback-defensive',
    type: 'defensive',
    name: '방어 태세',
    description: '단단히 방어하며 상대의 틈을 노린다.',
    emoji: '🛡️',
  },
  {
    id: 'fallback-tactical',
    type: 'tactical',
    name: '우회 공격',
    description: '상황을 살피며 전술적으로 접근한다.',
    emoji: '🎯',
  },
];

// 폴백 묘사 선택
function getFallbackNarrative(result: CombatResult): string {
  const narratives = FALLBACK_NARRATIVES[result];
  return narratives[Math.floor(Math.random() * narratives.length)];
}

// Anthropic 클라이언트 생성
function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not set');
    return null;
  }
  return new Anthropic({ apiKey });
}

/**
 * LLM으로 전투 선택지 3가지 생성
 */
export async function generateCombatChoices(
  enemy: Enemy,
  participants: Player[],
  waveNumber: number
): Promise<CombatAction[]> {
  const cacheKey = createChoicesCacheKey(enemy.id, waveNumber);
  const cached = getFromCache(choicesCache, cacheKey);
  if (cached) {
    return (cached as ChoicesCacheEntry).actions;
  }

  const client = getAnthropicClient();
  if (!client) {
    return FALLBACK_ACTIONS;
  }

  try {
    const participantNames = participants.map((p) => p.name).join(', ');
    const isBoss = enemy.isBoss ? '(보스)' : '';

    const prompt = `당신은 TTRPG 게임 마스터입니다. 다음 상황에서 플레이어들이 선택할 수 있는 3가지 행동 선택지를 만들어주세요.

## 상황
- 적: ${enemy.name} ${isBoss}
- 적 설명: ${enemy.description}
- 적 능력: ${enemy.abilities || '특별한 능력 없음'}
- 웨이브: ${waveNumber}/10
- 파티원: ${participantNames}

## 행동 타입 설명
- aggressive: 공격적 (높은 성공 시 큰 피해, 실패 시 역공)
- defensive: 방어적 (안정적이나 낮은 피해량)
- tactical: 전술적 (상황에 따라 유리한 결과)
- risky: 위험한 (극단적 결과 - 대박 또는 쪽박)

## 요구사항
1. 각 선택지는 적의 특성과 abilities를 반영해야 합니다
2. EarthBound/MOTHER 스타일의 유머러스하고 기묘한 분위기 유지
3. 현대적/일상적 비유 사용
4. 각 선택지는 서로 다른 타입이어야 합니다 (aggressive, defensive, tactical 또는 risky 중 3개)

## 출력 형식 (JSON)
정확히 다음 형식으로만 출력하세요:
[
  {"type": "aggressive", "name": "행동 이름", "description": "행동 설명 (20자 내외)", "emoji": "이모지"},
  {"type": "defensive", "name": "행동 이름", "description": "행동 설명 (20자 내외)", "emoji": "이모지"},
  {"type": "tactical", "name": "행동 이름", "description": "행동 설명 (20자 내외)", "emoji": "이모지"}
]`;

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = (message.content[0] as { type: 'text'; text: string }).text.trim();

    // JSON 파싱
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('Failed to parse choices JSON:', responseText);
      return FALLBACK_ACTIONS;
    }

    const rawActions = JSON.parse(jsonMatch[0]) as Array<{
      type: ActionType;
      name: string;
      description: string;
      emoji: string;
    }>;

    const actions: CombatAction[] = rawActions.map((a, idx) => ({
      id: `action-${waveNumber}-${idx}`,
      type: a.type,
      name: a.name,
      description: a.description,
      emoji: a.emoji,
    }));

    // 캐시에 저장
    choicesCache.set(cacheKey, { actions, timestamp: Date.now() });

    return actions;
  } catch (error) {
    console.error('Failed to generate combat choices:', error);
    return FALLBACK_ACTIONS;
  }
}

/**
 * LLM으로 전투 결과 판정 및 서술 생성
 * 선택된 행동 + 주사위 결과를 기반으로 전투 결과를 결정
 */
export async function resolveCombatWithLLM(
  enemy: Enemy,
  participants: Player[],
  selectedAction: CombatAction,
  diceRoll: DiceRoll,
  waveNumber: number
): Promise<LLMCombatResult> {
  const client = getAnthropicClient();

  // 폴백: 주사위 기반 단순 판정
  if (!client) {
    return generateFallbackResult(enemy, participants, selectedAction, diceRoll);
  }

  try {
    const participantInfo = participants
      .map((p) => `${p.name} (HP: ${p.hp}/${p.maxHp}, 전투력: ${p.combatPower})`)
      .join(', ');

    const diceContext = diceRoll.isCritical
      ? '대성공! (크리티컬 20)'
      : diceRoll.isFumble
        ? '대실패! (펌블 1)'
        : `주사위 결과: ${diceRoll.value}/20`;

    const prompt = `당신은 EarthBound/MOTHER 스타일의 TTRPG 게임 마스터입니다.
전투 결과를 판정하고 유머러스하게 서술해주세요.

## 전투 상황
- 적: ${enemy.name} (전투력: ${enemy.combatPower})
- 적 설명: ${enemy.description}
- 적 능력: ${enemy.abilities || '특별한 능력 없음'}
- 웨이브: ${waveNumber}/10
- 파티: ${participantInfo}

## 플레이어 행동
- 선택한 행동: ${selectedAction.name} (${selectedAction.type})
- 행동 설명: ${selectedAction.description}
- ${diceContext}

## 행동 타입별 판정 가이드
- aggressive: 성공 시 큰 효과, 실패 시 큰 피해
- defensive: 안정적, 피해 최소화
- tactical: 상황에 따라 유리한 결과
- risky: 극단적 결과 (대박 또는 쪽박)

## 주사위 판정 기준
- 1 (펌블): 항상 최악의 결과 (wipe 또는 defeat)
- 2-5: 대부분 실패 (defeat, narrow)
- 6-10: 보통 (narrow, victory 가능)
- 11-15: 성공 (victory, narrow)
- 16-19: 좋은 성공 (victory, perfect 가능)
- 20 (크리티컬): 항상 최고의 결과 (perfect)

## 출력 형식 (JSON)
정확히 다음 형식으로만 출력하세요:
{
  "result": "결과 (perfect/victory/narrow/defeat/wipe 중 하나)",
  "damages": [{"playerId": "플레이어ID", "damage": 숫자}],
  "narration": "전투 결과 서술 (2-3문장, EarthBound 스타일 유머)"
}

플레이어 ID 목록: ${participants.map((p) => p.id).join(', ')}
피해량 기준: perfect=0, victory=5-15, narrow=15-30, defeat=30-50, wipe=50-80`;

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = (message.content[0] as { type: 'text'; text: string }).text.trim();

    // JSON 파싱
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse combat result JSON:', responseText);
      return generateFallbackResult(enemy, participants, selectedAction, diceRoll);
    }

    const rawResult = JSON.parse(jsonMatch[0]) as {
      result: CombatResult;
      damages: { playerId: string; damage: number }[];
      narration: string;
    };

    return {
      result: rawResult.result,
      damages: rawResult.damages,
      narration: rawResult.narration,
    };
  } catch (error) {
    console.error('Failed to resolve combat with LLM:', error);
    return generateFallbackResult(enemy, participants, selectedAction, diceRoll);
  }
}

/**
 * 폴백: 주사위 + 행동 타입 기반 단순 판정
 */
function generateFallbackResult(
  enemy: Enemy,
  participants: Player[],
  selectedAction: CombatAction,
  diceRoll: DiceRoll
): LLMCombatResult {
  let result: CombatResult;

  // 크리티컬/펌블 처리
  if (diceRoll.isCritical) {
    result = 'perfect';
  } else if (diceRoll.isFumble) {
    result = selectedAction.type === 'risky' ? 'wipe' : 'defeat';
  } else {
    // 행동 타입별 기본 성공 확률 조정
    const typeModifier: Record<ActionType, number> = {
      aggressive: -2,
      defensive: 3,
      tactical: 1,
      risky: -3,
    };

    const adjustedRoll = diceRoll.value + typeModifier[selectedAction.type];

    if (adjustedRoll >= 18) {
      result = 'perfect';
    } else if (adjustedRoll >= 12) {
      result = 'victory';
    } else if (adjustedRoll >= 7) {
      result = 'narrow';
    } else if (adjustedRoll >= 3) {
      result = 'defeat';
    } else {
      result = 'wipe';
    }
  }

  // 결과에 따른 데미지 계산
  const damageRanges: Record<CombatResult, [number, number]> = {
    perfect: [0, 0],
    victory: [5, 15],
    narrow: [15, 30],
    defeat: [30, 50],
    wipe: [50, 80],
  };

  const [minDmg, maxDmg] = damageRanges[result];
  const damages = participants.map((p) => ({
    playerId: p.id,
    damage: Math.floor(minDmg + Math.random() * (maxDmg - minDmg)),
  }));

  return {
    result,
    damages,
    narration: getFallbackNarrative(result),
  };
}

/**
 * 기존 전투 묘사 생성 함수 (호환성 유지)
 */
export async function generateCombatNarrative(
  outcome: CombatOutcome,
  participants: Player[]
): Promise<string> {
  const cacheKey = createNarrativeCacheKey(
    outcome.result,
    outcome.enemy.name,
    participants.length
  );

  const cached = getFromCache(narrativeCache, cacheKey);
  if (cached) {
    return (cached as CacheEntry).narrative;
  }

  const client = getAnthropicClient();
  if (!client) {
    return getFallbackNarrative(outcome.result);
  }

  try {
    const participantNames = participants.map((p) => p.name).join(', ');
    const resultText = {
      perfect: '완벽한 승리',
      victory: '승리',
      narrow: '아슬아슬한 승리',
      defeat: '패배',
      wipe: '전멸 위기',
    }[outcome.result];

    const damageInfo = outcome.damages
      .map((d) => {
        const player = participants.find((p) => p.id === d.playerId);
        return player ? `${player.name}: ${d.damage} 피해` : '';
      })
      .filter(Boolean)
      .join(', ');

    const prompt = `당신은 EarthBound/MOTHER 시리즈 스타일의 전투 해설자입니다.
다음 전투 상황을 유머러스하고 기발하게 묘사해주세요. 한국어로 2-3문장으로 작성하세요.

적: ${outcome.enemy.name} - ${outcome.enemy.description}
적의 공격: ${outcome.enemy.attackMessage}
파티원: ${participantNames}
전투 결과: ${resultText}
피해 현황: ${damageInfo || '피해 없음'}

요구사항:
- EarthBound/MOTHER 시리즈 특유의 유머와 기묘함 (예: "적은 이상한 냄새를 풍겼다", "무언가가 일어났지만 아무도 이해하지 못했다")
- 현대적/일상적 비유 사용 (사무실, 인터넷, 대중교통 등)
- 4차원적이고 초현실적인 묘사
- 메타적 유머 OK (게임이라는 것을 암시)
- 이모지 사용하지 않기
- 과하게 진지하지 않게, 가볍게
- 2-3문장으로 간결하게`;

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const narrative = (message.content[0] as { type: 'text'; text: string }).text.trim();

    // 캐시에 저장
    narrativeCache.set(cacheKey, { narrative, timestamp: Date.now() });

    return narrative;
  } catch (error) {
    console.error('Failed to generate combat narrative:', error);
    return getFallbackNarrative(outcome.result);
  }
}
