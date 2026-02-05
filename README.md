# Daily Dungeon 🏰

하루 한 판, 4인 협동 웨이브 전투 게임.
EarthBound 스타일의 유머러스한 전투 + TTRPG 선택지 시스템.

## 게임 특징

- **하루 한 판** - 매일 열쇠 1개 지급 (최대 3개 누적)
- **10웨이브 전투** - Wave 5 중간보스, Wave 10 최종보스
- **TTRPG 선택지** - AI가 생성하는 3가지 행동 선택지
- **d20 주사위** - 크리티컬(20) / 펌블(1) 시스템
- **협동 투표** - 매 웨이브 후 계속/후퇴 투표
- **10분 컷** - 짧고 굵은 한 판

## 플레이 방법

```
1. 방장이 방 생성 (최대 4인)
2. 친구들 코드로 참가
3. 게임 시작 → Wave 1 전투
4. [행동 선택] 버튼 → AI 생성 선택지 3개 중 투표
5. 주사위 굴림 → AI가 결과 판정
6. 웨이브 클리어 후 계속/후퇴 투표
7. Wave 10 클리어 or 탈출 시 런 종료
```

## 행동 타입

| 타입 | 특성 | 위험도 |
|------|------|--------|
| 🗡️ 공격적 | 높은 피해, 실패 시 역공 | ⭐⭐⭐ |
| 🛡️ 방어적 | 안정적, 낮은 피해량 | ⭐ |
| 🎯 전술적 | 상황에 따라 유리 | ⭐⭐ |
| 🎲 위험한 | 대박 또는 쪽박 | ⭐⭐⭐⭐ |

## 기술 스택

- **Frontend**: React + TypeScript (순수 React UI)
- **Backend**: Node.js + Socket.io + Redis
- **AI**: Claude API (선택지 생성 + 전투 판정 + 내러티브)
- **Deploy**: Vercel + Railway

## 로컬 실행

```bash
# 의존성 설치 (루트에서)
npm install

# 개발 서버 실행
npm run dev

# 개별 빌드
npm run build --workspace=@daily-dungeon/client
npm run build --workspace=@daily-dungeon/server
```

## 환경 변수

```bash
# server/.env
ANTHROPIC_API_KEY=your_api_key
REDIS_URL=your_redis_url  # 선택사항
```

## 프로젝트 구조

```
daily-dungeon/
├── client/          # React 프론트엔드
│   └── src/
│       ├── components/
│       │   ├── Lobby/     # 홈, 대기실
│       │   └── Battle/    # 전투, 투표, 결과
│       ├── hooks/         # useSocket
│       └── stores/        # Zustand 상태관리
├── server/          # Node.js 백엔드
│   └── src/
│       ├── game/          # Room, Player, Combat
│       ├── ai/            # LLM 연동
│       └── socket/        # 이벤트 핸들러
└── shared/          # 공유 타입
```

## 문서

- [CLAUDE.md](CLAUDE.md) - 개발 가이드 및 시스템 설계
