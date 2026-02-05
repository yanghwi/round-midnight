import './effectAnimations.css';

export type EffectType =
  | 'damage-flash'
  | 'screen-shake'
  | 'dice-glow'
  | 'victory-flash'
  | 'defeat-fade'
  | null;

interface Props {
  activeEffect: EffectType;
  /** 글로우/플래시 색상 (dice-glow, victory-flash에 사용) */
  effectColor?: string;
  onAnimationEnd?: () => void;
}

const EFFECT_CONFIG: Record<string, { animation: string; style: (color?: string) => React.CSSProperties }> = {
  'damage-flash': {
    animation: 'damage-flash 0.15s steps(1) forwards',
    style: () => ({
      background: 'white',
    }),
  },
  'screen-shake': {
    animation: 'screen-shake 0.3s steps(4) forwards',
    style: () => ({
      background: 'transparent',
      pointerEvents: 'none' as const,
    }),
  },
  'dice-glow': {
    animation: 'dice-glow 0.6s ease-out forwards',
    style: (color) => ({
      background: `radial-gradient(circle, ${color ?? '#fdcb6e'}44, transparent 70%)`,
    }),
  },
  'victory-flash': {
    animation: 'victory-flash 0.8s ease-out forwards',
    style: (color) => ({
      background: `radial-gradient(circle, ${color ?? '#fdcb6e'}88, transparent 60%)`,
    }),
  },
  'defeat-fade': {
    animation: 'defeat-fade 1s ease-in forwards',
    style: () => ({
      background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(231,76,60,0.4) 100%)',
    }),
  },
};

/**
 * 전투 이펙트 오버레이
 * activeEffect가 null이면 렌더하지 않음
 */
export default function BattleEffects({ activeEffect, effectColor, onAnimationEnd }: Props) {
  if (!activeEffect) return null;

  const config = EFFECT_CONFIG[activeEffect];
  if (!config) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 50,
        animation: config.animation,
        ...config.style(effectColor),
      }}
      onAnimationEnd={onAnimationEnd}
    />
  );
}
