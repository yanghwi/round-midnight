import WAVE_BACKGROUNDS from './backgroundData';
import './backgroundAnimations.css';

interface Props {
  waveNumber: number;
}

/**
 * 웨이브별 사이키델릭 배경
 * 레이어 구조: Base(midnight-900) → N개 효과 레이어 → Scanlines
 */
export default function BattleBackground({ waveNumber }: Props) {
  const config = WAVE_BACKGROUNDS[waveNumber] ?? WAVE_BACKGROUNDS[1];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* 바닥: 어두운 배경 */}
      <div className="absolute inset-0 bg-midnight-900" />

      {/* 효과 레이어들 */}
      {config.layers.map((layer, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            inset: layer.inset,
            background: layer.background,
            animation: layer.animation,
            opacity: layer.opacity,
          }}
        />
      ))}

      {/* 스캔라인 */}
      <div className="scanlines" />
    </div>
  );
}
