import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { EnemySprite, BattleEffects } from '../../assets';
import type { EffectType } from '../../assets/effects/BattleEffects';
import BattleBg from './BattleBg';
import PartyStatus from './PartyStatus';
import ChoiceCards from './ChoiceCards';
import DiceRoll from './DiceRoll';
import RollResults from './RollResults';
import NarrationBox from './NarrationBox';
import WaveEndChoice from './WaveEndChoice';

interface Props {
  onSubmitChoice: (choiceId: string) => void;
  onRoll: () => void;
  onVote: (decision: 'continue' | 'retreat') => void;
}

/**
 * 전투 화면 — phase별 하위 컴포넌트 라우팅
 * 배경 레이어 + 적 스프라이트 + 파티 상태 + 이펙트 오버레이
 */
export default function BattleScreen({ onSubmitChoice, onRoll, onVote }: Props) {
  const phase = useGameStore((s) => s.phase);
  const currentWave = useGameStore((s) => s.currentWave);
  const enemy = useGameStore((s) => s.enemy);
  const situation = useGameStore((s) => s.situation);

  const [activeEffect, setActiveEffect] = useState<EffectType>(null);
  const clearEffect = useCallback(() => setActiveEffect(null), []);

  // phase 전환 시 이펙트 트리거
  const prevPhase = useRef(phase);
  useEffect(() => {
    const prev = prevPhase.current;
    if (prev === phase) return;
    prevPhase.current = phase;

    if (phase === 'narrating') {
      // 주사위 → 내러티브: 플래시 후 흔들림
      setActiveEffect('damage-flash');
      const t = setTimeout(() => setActiveEffect('screen-shake'), 200);
      return () => clearTimeout(t);
    }
    if (phase === 'rolling') {
      setActiveEffect('dice-glow');
    }
    if (phase === 'wave_result' && enemy && enemy.hp <= 0) {
      setActiveEffect('victory-flash');
    }
    if (phase === 'run_end') {
      setActiveEffect(enemy && enemy.hp <= 0 ? 'victory-flash' : 'defeat-fade');
    }
  }, [phase, enemy]);

  return (
    <div className="flex-1 flex flex-col relative min-h-dvh">
      <BattleBg waveNumber={currentWave} />

      {/* 컨텐츠 레이어 */}
      <div className="relative flex-1 flex flex-col" style={{ zIndex: 1 }}>
        {/* 웨이브 번호 + 적 정보 */}
        <div className="px-3 pt-3">
          <div className="flex items-center justify-between">
            <span className="font-title text-[10px] text-arcane-light">WAVE {currentWave}</span>
            {enemy && (
              <span className="font-title text-[10px] text-slate-400">
                {enemy.name} HP {enemy.hp}/{enemy.maxHp}
              </span>
            )}
          </div>
        </div>

        {/* 적 스프라이트 */}
        {enemy && (
          <EnemySprite imageTag={enemy.imageTag} />
        )}

        {/* 파티 HP */}
        <PartyStatus />

        {/* 상황 묘사 (wave_intro, choosing) */}
        {(phase === 'wave_intro' || phase === 'choosing') && situation && (
          <div className="px-3 mt-2">
            <div className="eb-window">
              <p className="font-body text-sm text-slate-200 leading-relaxed">
                {situation}
              </p>
            </div>
          </div>
        )}

        {/* wave_intro: 로딩 표시 */}
        {phase === 'wave_intro' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="font-body text-sm text-slate-400 animate-pulse">
              상황 파악 중...
            </div>
          </div>
        )}

        {/* choosing: 선택지 */}
        {phase === 'choosing' && (
          <ChoiceCards onSubmitChoice={onSubmitChoice} />
        )}

        {/* rolling: 주사위 */}
        {phase === 'rolling' && (
          <DiceRoll onRoll={onRoll} />
        )}

        {/* narrating: 결과 + 내러티브 */}
        {phase === 'narrating' && (
          <>
            <RollResults />
            <NarrationBox />
          </>
        )}

        {/* wave_result: 투표 */}
        {phase === 'wave_result' && (
          <WaveEndChoice onVote={onVote} />
        )}
      </div>

      {/* 이펙트 오버레이 */}
      <BattleEffects activeEffect={activeEffect} onAnimationEnd={clearEffect} />
    </div>
  );
}
