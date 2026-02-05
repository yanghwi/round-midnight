import type { Enemy } from '@daily-dungeon/shared';
import { GAME_CONSTANTS } from '@daily-dungeon/shared';

/**
 * EarthBound 스타일 적 정의
 * 현대적/일상적 사물이 기묘하게 변형된 적들
 * abilities 필드: LLM이 전투 선택지와 결과 서술에 활용
 */

// Wave 1-4 (Easy)
const EASY_ENEMIES: Enemy[] = [
  {
    id: 'trash-can',
    name: '불량한 쓰레기통',
    description: '버려진 것들의 원한이 담긴 쓰레기통. 뚜껑을 무기처럼 휘두른다.',
    combatPower: 15,
    imageKey: '🗑️',
    attackMessage: '쓰레기통이 뚜껑을 날렸다!',
    abilities: '뚜껑 투척 - 원거리에서 뚜껑을 던져 공격한다. 가끔 안의 쓰레기도 같이 날린다.',
  },
  {
    id: 'traffic-light',
    name: '화난 신호등',
    description: '아무도 자신을 따르지 않아 화가 난 신호등. 눈부신 빛을 뿜는다.',
    combatPower: 18,
    imageKey: '🚦',
    attackMessage: '신호등이 눈부신 빛을 뿜었다!',
    abilities: '신호 혼란 - 빨강, 노랑, 초록을 무작위로 깜빡여 적을 혼란시킨다.',
  },
  {
    id: 'fan',
    name: '미친 선풍기',
    description: '제어 불능 상태가 된 선풍기. 날개가 위험하게 돌아간다.',
    combatPower: 20,
    imageKey: '🌀',
    attackMessage: '선풍기가 날개를 날렸다!',
    abilities: '회오리 바람 - 강력한 바람을 일으켜 가벼운 물건을 날려버린다.',
  },
  {
    id: 'alarm-clock',
    name: '깨어난 자명종',
    description: '매일 무시당한 자명종의 복수. 귀가 찢어지는 소리를 낸다.',
    combatPower: 22,
    imageKey: '⏰',
    attackMessage: '자명종이 귀청을 찢는 소리를 냈다!',
    abilities: '스누즈 어택 - 9분마다 더 강해지는 울림으로 공격한다.',
  },
];

// Wave 5 (Mid-Boss)
const MID_BOSS_ENEMIES: Enemy[] = [
  {
    id: 'emergency-update',
    name: '긴급 업데이트',
    description: '한밤중에 찾아오는 강제 시스템 업데이트. 모든 작업을 중단시킨다.',
    combatPower: 60,
    imageKey: '🔄',
    attackMessage: '긴급 업데이트가 강제 재부팅을 시작했다!',
    abilities: '강제 재부팅 - 갑자기 시스템을 멈추게 할 수 있다. 진행률 바가 99%에서 멈추는 저주.',
    isBoss: true,
  },
  {
    id: 'spam-email',
    name: '스팸 메일 폭격기',
    description: '받은 편지함을 점령한 스팸 메일 군단의 사령관.',
    combatPower: 55,
    imageKey: '📧',
    attackMessage: '스팸 메일이 쏟아졌다! "축하합니다, 당첨되었습니다!"',
    abilities: '피싱 공격 - 그럴듯한 속임수로 정신 공격을 가한다. 구독 취소 버튼은 함정.',
    isBoss: true,
  },
  {
    id: 'captcha-demon',
    name: '캡차 악마',
    description: '신호등을 찾아라, 자전거를 찾아라... 끝없는 검증의 화신.',
    combatPower: 58,
    imageKey: '🤖',
    attackMessage: '캡차 악마가 물었다: "당신은 로봇입니까?"',
    abilities: '인증 지옥 - 점점 알아보기 힘든 글자와 이미지로 상대방을 지치게 한다.',
    isBoss: true,
  },
];

// Wave 6-9 (Hard)
const HARD_ENEMIES: Enemy[] = [
  {
    id: 'wifi-router',
    name: '분노한 와이파이 공유기',
    description: '연결이 끊기면 화를 내는 공유기. 강력한 전자파를 방출한다.',
    combatPower: 45,
    imageKey: '📶',
    attackMessage: '공유기가 전자파를 방출했다!',
    abilities: '연결 불안정 - 중요한 순간에 신호를 끊어버린다. 비밀번호를 잊게 만드는 저주.',
  },
  {
    id: 'printer',
    name: '악령 복합기',
    description: '수많은 야근의 원한이 깃든 복합기. 종이 뭉치를 던진다.',
    combatPower: 50,
    imageKey: '🖨️',
    attackMessage: '복합기가 종이 뭉치를 던졌다!',
    abilities: '잉크 부족 - 가장 급할 때 잉크가 떨어진다. 종이 걸림의 저주.',
  },
  {
    id: 'subway',
    name: '절망의 지하철',
    description: '출퇴근 러시아워의 혼돈이 실체화된 존재.',
    combatPower: 55,
    imageKey: '🚇',
    attackMessage: '지하철이 돌진했다!',
    abilities: '지연 운행 - 시간을 늘려 지치게 만든다. 환승역에서 반대 방향 열차가 먼저 온다.',
  },
  {
    id: 'delivery-drone',
    name: '폭주 배달 드론',
    description: '배송 예정일을 어긴 원한으로 미쳐버린 드론.',
    combatPower: 52,
    imageKey: '🛸',
    attackMessage: '드론이 택배 상자를 투하했다!',
    abilities: '오배송 - 엉뚱한 곳에 물건을 떨어뜨려 혼란을 야기한다. "부재중" 문자 폭격.',
  },
];

// Wave 10 (Final Boss)
const BOSS_ENEMIES: Enemy[] = [
  {
    id: 'bsod',
    name: '블루스크린',
    description: '모든 작업을 삼켜버리는 공포의 존재. 저장하지 않은 데이터를 노린다.',
    combatPower: 100,
    imageKey: '💀',
    attackMessage: '블루스크린이 저장 데이터를 공격했다!',
    abilities: '치명적 오류 - 모든 진행 상황을 초기화시킬 수 있다. STOP 에러 코드의 공포.',
    isBoss: true,
  },
  {
    id: 'infinite-meeting',
    name: '무한 회의',
    description: '결론 없이 계속되는 회의의 실체화. 시간과 의지를 빨아들인다.',
    combatPower: 95,
    imageKey: '💼',
    attackMessage: '무한 회의가 아젠다를 추가했다!',
    abilities: '시간 소멸 - 점점 길어지는 회의로 모든 에너지를 흡수한다. "다음 주에 다시 논의하죠".',
    isBoss: true,
  },
  {
    id: 'deadline',
    name: '데드라인',
    description: '피할 수 없는 마감일의 의인화. 어둠 속에서 다가온다.',
    combatPower: 98,
    imageKey: '⏳',
    attackMessage: '데드라인이 점점 다가온다!',
    abilities: '압박감 - 시간이 지날수록 강해진다. 자정이 가까워질수록 치명적.',
    isBoss: true,
  },
];

// 웨이브별 적 가져오기
export function getEnemyForWave(waveNumber: number, playerCount: number): Enemy {
  let enemyPool: Enemy[];

  // 보스 웨이브 체크
  if (waveNumber === GAME_CONSTANTS.FINAL_BOSS_WAVE) {
    enemyPool = BOSS_ENEMIES;
  } else if (waveNumber === GAME_CONSTANTS.MID_BOSS_WAVE) {
    enemyPool = MID_BOSS_ENEMIES;
  } else if (waveNumber <= 4) {
    enemyPool = EASY_ENEMIES;
  } else {
    // Wave 6-9
    enemyPool = HARD_ENEMIES;
  }

  // 풀 내에서 랜덤 선택
  const index = Math.floor(Math.random() * enemyPool.length);
  const baseEnemy = enemyPool[index];

  // 플레이어 수에 따른 난이도 조정 (보스는 덜 조정)
  const difficultyScale = getDifficultyScale(playerCount, baseEnemy.isBoss);

  return {
    ...baseEnemy,
    id: `${baseEnemy.id}-wave${waveNumber}`,
    combatPower: Math.floor(baseEnemy.combatPower * difficultyScale),
  };
}

// 플레이어 수에 따른 난이도 스케일
function getDifficultyScale(playerCount: number, isBoss?: boolean): number {
  // 보스는 스케일 다운을 덜 받음
  const bossModifier = isBoss ? 0.2 : 0;

  switch (playerCount) {
    case 1:
      return 0.5 + bossModifier;
    case 2:
      return 0.7 + bossModifier;
    case 3:
      return 0.85 + bossModifier * 0.5;
    case 4:
    default:
      return 1.0;
  }
}
