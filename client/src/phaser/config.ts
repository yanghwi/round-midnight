import Phaser from 'phaser';
import { ExploreScene } from './scenes/ExploreScene';

// 게임 설정
export const GAME_CONFIG = {
  // 타일 크기 (픽셀)
  TILE_SIZE: 32,
  // 화면에 보이는 타일 수 (세로 모바일 기준)
  VIEWPORT_TILES_X: 11,
  VIEWPORT_TILES_Y: 15,
  // 시야 거리 (타일)
  VIEW_DISTANCE: 3,
  // 이동 속도 (픽셀/초)
  MOVE_SPEED: 160,
  // 위치 동기화 간격 (ms)
  SYNC_INTERVAL: 100,
} as const;

// Phaser 게임 설정
export function createPhaserConfig(parent: HTMLElement): Phaser.Types.Core.GameConfig {
  const width = Math.min(window.innerWidth, 400);
  const height = window.innerHeight - 100; // HUD 공간 확보

  return {
    type: Phaser.AUTO,
    parent,
    width,
    height,
    backgroundColor: '#0f0f1a',
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [],  // 씬은 나중에 수동으로 추가
  };
}
