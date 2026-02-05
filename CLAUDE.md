# CLAUDE.md - 데일리 던전 프로젝트

## 한 줄 요약

하루 한 판, 4인 협동 웨이브 전투 게임. EarthBound 스타일의 유머러스한 전투 + TTRPG 선택지 시스템.

## 핵심 철학

- 10분 안에 끝나야 함
- 복잡한 조작 없음
- 결과만 빠르게
- 하루 한 번의 설렘

## 기술 스택

- **프론트엔드**: React + TypeScript (순수 React UI)
- **백엔드**: Node.js + Socket.io + Redis
- **AI**: Claude API (전투 선택지 생성 + 전투 판정 + 내러티브)
- **배포**: Vercel + Railway

## 핵심 시스템

### 1. 하루 한 판
```
- 매일 자정 열쇠 1개 지급
- 최대 3개 누적
- 주말은 2개 지급
- 던전 입장 시 1개 소모
```

### 2. 10웨이브 전투 (TTRPG 스타일)
```
웨이브 시작 → 적 등장 → [행동 선택] 버튼 →
LLM이 3가지 선택지 생성 → 플레이어 투표(20초) →
주사위 굴림(d20) → LLM이 결과 판정 → 투표 → 반복

- Wave 1-4: Easy (일반 몬스터)
- Wave 5: Mid-Boss (중간보스)
- Wave 6-9: Hard (강화 몬스터)
- Wave 10: Final Boss (최종보스)
```

### 3. 행동 선택 시스템
```
| 타입 | 특성 | LLM 판정 경향 |
|------|------|---------------|
| aggressive | 공격적 | 높은 성공 시 큰 피해, 실패 시 역공 |
| defensive | 방어적 | 안정적이나 낮은 피해량 |
| tactical | 전술적 | 상황에 따라 유리한 결과 |
| risky | 위험한 | 극단적 결과 (대박 또는 쪽박) |
```

### 4. 주사위 시스템 (d20)
```
- 20 (크리티컬): 항상 perfect
- 1 (펌블): 항상 defeat/wipe
- 2-5: 대부분 실패
- 6-10: 보통
- 11-15: 성공
- 16-19: 좋은 성공
```

### 5. 투표 시스템
```
전투 후 → 계속 / 후퇴 선택 → 다수결 결정

- 동점 시 호스트 결정권
- 30초 타임아웃
```

### 6. 전투 결과
```
- perfect: 무피해 승리
- victory: 일반 승리
- narrow: 아슬아슬한 승리
- defeat: 패배 (큰 피해)
- wipe: 전멸 위기
```

## 폴더 구조

```
daily-dungeon/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Lobby/
│   │   │   │   ├── Home.tsx       # 메인 화면
│   │   │   │   └── WaitingRoom.tsx # 대기실
│   │   │   └── Battle/
│   │   │       ├── BattleScreen.tsx # 전투 화면 (선택지/주사위 포함)
│   │   │       ├── VoteScreen.tsx   # 투표 화면
│   │   │       ├── ResultScreen.tsx # 결과 화면
│   │   │       └── InventoryPanel.tsx # 인벤토리
│   │   ├── hooks/
│   │   │   └── useSocket.ts
│   │   ├── stores/
│   │   │   └── gameStore.ts       # Zustand 상태 관리
│   │   └── styles/
│   │       └── theme.ts           # 색상/스타일 정의
├── server/
│   ├── src/
│   │   ├── game/
│   │   │   ├── Room.ts            # 방 관리
│   │   │   ├── Player.ts          # 플레이어 클래스
│   │   │   ├── Combat.ts          # 전투 판정 + 주사위
│   │   │   ├── enemies.ts         # EarthBound 스타일 적 + 보스
│   │   │   └── items.ts           # 아이템 드롭 생성
│   │   ├── ai/
│   │   │   └── combatNarrator.ts  # LLM 선택지 생성 + 전투 판정
│   │   └── socket/
│   │       └── handlers.ts        # Socket 이벤트 처리
├── shared/
│   └── types.ts                   # 공유 타입 정의
└── CLAUDE.md
```

## Socket 이벤트

### 로비
| 이벤트 | 방향 | 설명 |
|--------|------|------|
| create-room | C→S | 방 생성 |
| join-room | C→S | 방 참가 |
| leave-room | C→S | 방 퇴장 |
| room-created | S→C | 방 생성 완료 |
| room-joined | S→C | 방 참가 완료 |
| player-joined | S→C | 새 플레이어 입장 |
| player-left | S→C | 플레이어 퇴장 |

### 게임 진행
| 이벤트 | 방향 | 설명 |
|--------|------|------|
| start-game | C→S | 게임 시작 |
| game-started | S→C | 게임 시작됨 + 첫 웨이브 |
| wave-start | S→C | 새 웨이브 시작 |

### 전투 (TTRPG 스타일)
| 이벤트 | 방향 | 설명 |
|--------|------|------|
| request-choices | C→S | 선택지 요청 |
| choices-generated | S→C | LLM 생성 선택지 (3개) |
| select-action | C→S | 행동 선택/투표 |
| action-vote-update | S→C | 행동 투표 현황 |
| dice-rolled | S→C | 주사위 결과 + 선택된 행동 |
| combat-result | S→C | 전투 결과 + AI 내러티브 |

### 투표
| 이벤트 | 방향 | 설명 |
|--------|------|------|
| vote-start | S→C | 투표 시작 |
| player-vote | C→S | 투표 제출 |
| vote-update | S→C | 투표 현황/결과 |

### 게임 종료
| 이벤트 | 방향 | 설명 |
|--------|------|------|
| run-end | S→C | 런 종료 (탈출/전멸) |
| player-died | S→C | 플레이어 사망 |

## 플랫폼 제약

- 아이폰 사파리 필수
- 세로 화면
- 한 손 조작
- 10분 내 완료

## 스타일링 규칙

### 필수
- **Tailwind CSS 미사용** (설치되지 않음)
- **Inline Styles + theme.ts** 조합 사용
- 타입: `const styles: Record<string, React.CSSProperties>`

### 참고 파일
- 색상 정의: `client/src/styles/theme.ts`
- 패턴 예시: `client/src/components/Lobby/Home.tsx`

### 금지 사항
```tsx
// ❌ 잘못된 예
className="flex items-center bg-blue-500"  // Tailwind 클래스
backgroundColor: '#1a1a2e'                  // 하드코딩 색상

// ✅ 올바른 예
style={styles.container}
backgroundColor: theme.colors.bgDark
```

---

## 대규모 리팩토링 체크리스트

대규모 구조 변경 시 반드시 확인:

### 1. 파일 삭제 체크
```
□ 더 이상 사용하지 않는 파일 목록 작성
□ import 관계 확인 (grep으로 검색)
□ 파일 삭제 실행
□ 빌드 테스트
```

### 2. 코드 정리
```
□ 미사용 export 제거
□ 미사용 함수/변수 제거
□ 타입 정의 업데이트 (shared/types.ts)
```

### 3. 문서 동기화
```
□ CLAUDE.md 업데이트
□ 폴더 구조 섹션 수정
□ Socket 이벤트 섹션 수정
```

### 4. 검증
```
□ npm run build --workspace=@daily-dungeon/client
□ npm run build --workspace=@daily-dungeon/server
□ npm run dev 실행 확인
□ 주요 기능 수동 테스트
```

---

## 서버 실행 트러블슈팅

### 포트 충돌 (EADDRINUSE)
```bash
# 포트 3000 사용 중인 프로세스 확인 및 종료
lsof -ti:3000 | xargs kill -9

# 또는 특정 포트
lsof -ti:5173 | xargs kill -9  # Vite 개발 서버
```

### 빌드 에러
```bash
# 클린 빌드
rm -rf node_modules client/node_modules server/node_modules
npm install
npm run build
```

### Socket 연결 실패
```bash
# 서버가 실행 중인지 확인
curl http://localhost:3000
```

---

## 주의사항

- 전투 UI는 React 컴포넌트로 구현
- AI 호출 시 캐싱 필수 (30분 TTL)
- Redis로 열쇠/세션 관리
- EarthBound 스타일 유지 (유머러스한 적/묘사)
- 보스 몬스터의 `abilities` 필드는 LLM이 서술적으로 활용 (코드 구현 불필요)

---

## 개발 주의사항 & 재발방지

### 빌드 검증
```bash
# ❌ 전체 빌드 (shared 워크스페이스에 build 스크립트 없어서 실패)
npm run build

# ✅ 개별 워크스페이스 빌드
npm run build --workspace=@daily-dungeon/client
npm run build --workspace=@daily-dungeon/server
```

### LLM 의존 시스템 설계
```
✅ 반드시 폴백 로직 구현
  - API 키 없을 때: 기본 선택지/판정 사용
  - API 실패 시: 주사위 기반 단순 판정

✅ 메타데이터 기반 설계
  - 몬스터 abilities 필드: LLM이 해석하여 선택지/서술에 반영
  - 코드로 능력 구현 X → 텍스트로 설명하면 LLM이 활용
```

### 상태 관리
```
✅ GameState 확장 시 전이 명확히 정의
  - 'playing' → 'choosing' → 'rolling' → 'playing'
  - 각 상태에서 어떤 UI가 표시되는지 App.tsx에서 관리

✅ Socket 이벤트 추가 시
  1. shared/types.ts에 페이로드 타입 정의
  2. server/handlers.ts에 이벤트 핸들러 추가
  3. client/useSocket.ts에 이벤트 리스너 추가
  4. client/gameStore.ts에 상태 추가
```

---

## 최근 변경 이력

### 2026-02-05: 10웨이브 + TTRPG 선택지 시스템
- 웨이브 수 3 → 10으로 확장
- 중간보스(Wave 5), 최종보스(Wave 10) 추가
- LLM 기반 전투 선택지 생성
- d20 주사위 시스템 + 애니메이션
- LLM 기반 전투 판정 (행동 + 주사위 → 결과)
- 삭제: GAME_DESIGN.md (구 Phaser 기반 기획서)
