# Daily Dungeon

하루 한 판, 4인 협동 던전 탈출 게임.

## 게임 특징

- 하루 한 번 던전 도전 (열쇠 시스템)
- 실시간 탑다운 던전 탐험
- 즉시 판정 전투 (5초 컷)
- AI가 만드는 매번 다른 던전
- 죽으면 장비 드랍, 탈출해야 저장
- 10분이면 한 판 끝

## 플레이 방법

1. 방장이 방 생성
2. 친구 3명 코드로 참가
3. 던전 진입
4. 탐험하며 아이템 파밍
5. 적 만나면 턴제 전투
6. 포탈 찾아서 탈출

## 기술 스택

- Frontend: React + Phaser 3
- Backend: Node.js + Socket.io
- AI: Claude API

## 로컬 실행

```bash
# 서버
cd server
npm install
npm run dev

# 클라이언트
cd client
npm install
npm run dev
```

## 문서

- [게임 디자인](GAME_DESIGN.md)
- [CLAUDE.md](CLAUDE.md) - 클로드 코드용
