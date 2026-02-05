/**
 * 웨이브별 배경 레이어 설정
 * 참조: docs/design-system/references/backgrounds.md 조합 레시피
 */

export interface BgLayer {
  /** CSS background 값 */
  background: string;
  /** CSS animation 값 */
  animation: string;
  /** opacity (0-1) */
  opacity: number;
  /** CSS inset 값 (소용돌이/체커는 확장 필요) */
  inset: string;
}

export interface WaveBgConfig {
  label: string;
  layers: BgLayer[];
}

const WAVE_BACKGROUNDS: Record<number, WaveBgConfig> = {
  /** W1 (너구리): 평화로운 밤 — Glow(cyan) 1레이어 */
  1: {
    label: '골목길',
    layers: [
      {
        background: 'radial-gradient(ellipse at 50% 50%, rgba(0,206,201,0.2), transparent 70%)',
        animation: 'glowPulse 4s ease-in-out infinite',
        opacity: 0.8,
        inset: '0',
      },
    ],
  },

  /** W2 (자판기): 전기/글리치 — Distort + Diamond 2레이어 */
  2: {
    label: '편의점 앞',
    layers: [
      {
        background: `repeating-linear-gradient(0deg,
          #e74c3c 0px, #e67e22 3px,
          #fdcb6e 6px, #2ecc71 9px,
          #00cec9 12px, #3498db 15px,
          #6c5ce7 18px, #e84393 21px
        )`,
        animation: 'distortScroll 2s linear infinite',
        opacity: 0.3,
        inset: '0',
      },
      {
        background: `repeating-linear-gradient(45deg,
            transparent 0px, transparent 16px,
            rgba(232,67,147,0.2) 16px, rgba(232,67,147,0.2) 17px),
          repeating-linear-gradient(-45deg,
            transparent 0px, transparent 16px,
            rgba(108,92,231,0.2) 16px, rgba(108,92,231,0.2) 17px)`,
        animation: 'diamondPulse 4s ease-in-out infinite',
        opacity: 0.6,
        inset: '0',
      },
    ],
  },

  /** W3 (고양이): 어둡고 으스스 — Swirl(purple) 1레이어 */
  3: {
    label: '그림자 골목',
    layers: [
      {
        background: `repeating-conic-gradient(
          from 0deg at 50% 50%,
          #6c5ce7 0deg 5deg,
          #0d0221 5deg 10deg,
          #a29bfe 10deg 15deg,
          #0d0221 15deg 20deg
        )`,
        animation: 'swirlSpin 15s linear infinite',
        opacity: 0.35,
        inset: '-50%',
      },
    ],
  },

  /** W4 (로봇): 지하/산업 — Checker + Distort(warm) 2레이어 */
  4: {
    label: '지하 주차장',
    layers: [
      {
        background: `repeating-conic-gradient(
          #0d0221 0% 25%, transparent 0% 50%
        ) 0 0 / 20px 20px`,
        animation: 'checkerRotate 25s linear infinite',
        opacity: 0.25,
        inset: '-200%',
      },
      {
        background: `repeating-linear-gradient(0deg,
          #e67e22 0px, #e74c3c 3px,
          #c0392b 6px, #e67e22 9px
        )`,
        animation: 'distortScroll 3s linear infinite',
        opacity: 0.2,
        inset: '0',
      },
    ],
  },

  /** W5 (보스): 풀 사이키델릭 — Swirl + Diamond + Glow 3레이어 */
  5: {
    label: '야시장',
    layers: [
      {
        background: `repeating-conic-gradient(
          from 0deg at 50% 50%,
          #e84393 0deg 5deg,
          #0d0221 5deg 10deg,
          #6c5ce7 10deg 15deg,
          #0d0221 15deg 20deg
        )`,
        animation: 'swirlSpin 10s linear infinite',
        opacity: 0.45,
        inset: '-50%',
      },
      {
        background: `repeating-linear-gradient(45deg,
            transparent 0px, transparent 12px,
            rgba(232,67,147,0.3) 12px, rgba(232,67,147,0.3) 13px),
          repeating-linear-gradient(-45deg,
            transparent 0px, transparent 12px,
            rgba(253,203,110,0.2) 12px, rgba(253,203,110,0.2) 13px)`,
        animation: 'diamondPulse 3s ease-in-out infinite',
        opacity: 0.6,
        inset: '0',
      },
      {
        background: 'radial-gradient(ellipse at 50% 50%, rgba(253,203,110,0.2), transparent 70%)',
        animation: 'glowPulse 2.5s ease-in-out infinite',
        opacity: 0.9,
        inset: '0',
      },
    ],
  },
};

export default WAVE_BACKGROUNDS;
