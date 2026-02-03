// 던전 생성기는 shared 패키지로 이동됨
// 서버와 클라이언트 모두 동일한 던전을 생성해야 하므로 공유 모듈 사용
export { generateDungeon } from '@daily-dungeon/shared/dungeonGenerator';
