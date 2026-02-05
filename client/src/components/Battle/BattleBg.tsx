import { BattleBackground } from '../../assets';

interface Props {
  waveNumber: number;
}

/**
 * 전투 배경 래퍼 — 웨이브별 사이키델릭 배경 위임
 */
export default function BattleBg({ waveNumber }: Props) {
  return <BattleBackground waveNumber={waveNumber} />;
}
