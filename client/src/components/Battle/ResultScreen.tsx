import React from 'react';
import { theme } from '../../styles/theme';
import { useGameStore } from '../../stores/gameStore';

interface ResultScreenProps {
  onReturnHome: () => void;
}

export function ResultScreen({ onReturnHome }: ResultScreenProps) {
  const { battle, player, run } = useGameStore();
  const { currentWave, maxWaves } = battle;

  const isCleared = currentWave >= maxWaves;
  const survived = player?.isAlive ?? false;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* 결과 타이틀 */}
        <div
          style={{
            ...styles.titleBadge,
            background: survived
              ? isCleared
                ? theme.combatResults.perfect.bg
                : theme.combatResults.victory.bg
              : theme.combatResults.wipe.bg,
            borderColor: survived
              ? isCleared
                ? theme.combatResults.perfect.border
                : theme.combatResults.victory.border
              : theme.combatResults.wipe.border,
          }}
        >
          {survived
            ? isCleared
              ? '던전 클리어!'
              : '무사 탈출!'
            : '전멸...'}
        </div>

        {/* 통계 */}
        <div style={styles.stats}>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>도달 웨이브</span>
            <span style={styles.statValue}>{currentWave} / {maxWaves}</span>
          </div>
          <div style={styles.statRow}>
            <span style={styles.statLabel}>남은 HP</span>
            <span style={styles.statValue}>{player?.hp ?? 0} / {player?.maxHp ?? 100}</span>
          </div>
          {run && run.accumulatedRewards.length > 0 && (
            <div style={styles.statRow}>
              <span style={styles.statLabel}>획득 보상</span>
              <span style={styles.statValue}>{run.accumulatedRewards.length}개</span>
            </div>
          )}
        </div>

        {/* 메시지 */}
        <div style={styles.message}>
          {survived ? (
            isCleared ? (
              <>
                <p>축하합니다!</p>
                <p>모든 웨이브를 클리어했습니다.</p>
              </>
            ) : (
              <>
                <p>현명한 선택입니다.</p>
                <p>무사히 탈출했습니다.</p>
              </>
            )
          ) : (
            <>
              <p>아쉽게도 전멸했습니다.</p>
              <p>다음에는 더 잘할 수 있을 거예요!</p>
            </>
          )}
        </div>

        {/* 홈으로 버튼 */}
        <button onClick={onReturnHome} style={styles.homeButton}>
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: theme.colors.bgDarkest,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  content: {
    maxWidth: '400px',
    margin: '0 auto',
    width: '100%',
    textAlign: 'center',
  },
  titleBadge: {
    display: 'inline-block',
    padding: '16px 32px',
    border: '3px solid',
    borderRadius: '2px',
    fontFamily: theme.fonts.title,
    fontSize: '24px',
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: '32px',
  },
  stats: {
    background: theme.colors.bgMedium,
    border: theme.borders.card,
    borderRadius: '2px',
    padding: '20px',
    marginBottom: '24px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: `1px solid ${theme.colors.bgDark}`,
  },
  statLabel: {
    fontFamily: theme.fonts.body,
    fontSize: '14px',
    color: theme.colors.textSecondary,
  },
  statValue: {
    fontFamily: theme.fonts.title,
    fontSize: '14px',
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  message: {
    fontFamily: theme.fonts.body,
    fontSize: '15px',
    color: theme.colors.textSecondary,
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  homeButton: {
    width: '100%',
    padding: '18px',
    fontSize: '16px',
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    border: theme.borders.primary,
    borderRadius: '2px',
    background: theme.colors.primary,
    color: theme.colors.textPrimary,
    cursor: 'pointer',
  },
};
