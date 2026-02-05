import React from 'react';
import { theme } from '../../styles/theme';
import { useGameStore } from '../../stores/gameStore';
import type { VoteChoice } from '@daily-dungeon/shared';

interface VoteScreenProps {
  onVote: (choice: VoteChoice) => void;
}

export function VoteScreen({ onVote }: VoteScreenProps) {
  const { battle, vote, myVote, room, player } = useGameStore();
  const { currentWave, maxWaves } = battle;

  if (!vote || !room || !player) return null;

  const votedCount = Object.keys(vote.votes).length;
  const continueCount = Object.values(vote.votes).filter((v) => v === 'continue').length;
  const retreatCount = Object.values(vote.votes).filter((v) => v === 'retreat').length;
  const alivePlayers = room.players.filter((p) => p.isAlive);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* 클리어 메시지 */}
        <div style={styles.clearBadge}>
          Wave {currentWave} 클리어!
        </div>

        <h2 style={styles.title}>다음 웨이브로?</h2>
        <p style={styles.subtitle}>
          {currentWave < maxWaves
            ? `남은 웨이브: ${maxWaves - currentWave}개`
            : '마지막 웨이브였습니다!'}
        </p>

        {/* 투표 현황 */}
        <div style={styles.voteStatus}>
          <div style={styles.voteHeader}>
            투표 현황: {votedCount}/{vote.totalPlayers}
          </div>

          <div style={styles.voteCounts}>
            <div style={styles.voteCount}>
              <span style={styles.voteLabel}>더 들어간다</span>
              <span style={styles.voteNumber}>{continueCount}</span>
            </div>
            <div style={styles.voteCount}>
              <span style={styles.voteLabel}>여기까지</span>
              <span style={styles.voteNumber}>{retreatCount}</span>
            </div>
          </div>

          {/* 플레이어별 투표 상태 */}
          <div style={styles.playerVotes}>
            {alivePlayers.map((p) => {
              const playerVote = vote.votes[p.id];
              const isMe = p.id === player.id;

              return (
                <div
                  key={p.id}
                  style={{
                    ...styles.playerVote,
                    borderColor: isMe ? theme.colors.accent : theme.colors.borderMedium,
                  }}
                >
                  <span style={styles.playerName}>
                    {isMe ? '👤 ' : ''}{p.name}
                  </span>
                  <span
                    style={{
                      ...styles.playerChoice,
                      color: playerVote
                        ? playerVote === 'continue'
                          ? theme.colors.success
                          : theme.colors.danger
                        : theme.colors.textSecondary,
                    }}
                  >
                    {playerVote
                      ? playerVote === 'continue'
                        ? '✓ 더 들어간다'
                        : '✓ 여기까지'
                      : '투표 중...'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 투표 안내 */}
        <p style={styles.voteInfo}>
          과반수가 "더 들어간다" 선택 시 진행
          <br />
          동점이면 안전하게 탈출
        </p>

        {/* 투표 버튼 */}
        {!myVote && player.isAlive && (
          <div style={styles.buttonGroup}>
            <button
              onClick={() => onVote('continue')}
              style={styles.continueButton}
            >
              더 들어간다
            </button>
            <button
              onClick={() => onVote('retreat')}
              style={styles.retreatButton}
            >
              여기까지
            </button>
          </div>
        )}

        {/* 이미 투표함 */}
        {myVote && (
          <div style={styles.votedMessage}>
            투표 완료! 다른 플레이어를 기다리는 중...
          </div>
        )}
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
  },
  clearBadge: {
    alignSelf: 'center',
    padding: '12px 24px',
    background: theme.combatResults.victory.bg,
    border: `2px solid ${theme.combatResults.victory.border}`,
    borderRadius: '2px',
    fontFamily: theme.fonts.title,
    fontSize: '18px',
    fontWeight: 'bold',
    color: theme.combatResults.victory.text,
    textAlign: 'center',
    marginBottom: '24px',
  },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: '22px',
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: '8px',
  },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: '14px',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: '24px',
  },
  voteStatus: {
    background: theme.colors.bgMedium,
    border: theme.borders.card,
    borderRadius: '2px',
    padding: '16px',
    marginBottom: '16px',
  },
  voteHeader: {
    fontFamily: theme.fonts.title,
    fontSize: '14px',
    fontWeight: 'bold',
    color: theme.colors.accent,
    marginBottom: '16px',
    textAlign: 'center',
  },
  voteCounts: {
    display: 'flex',
    justifyContent: 'space-around',
    marginBottom: '16px',
  },
  voteCount: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  voteLabel: {
    fontFamily: theme.fonts.body,
    fontSize: '12px',
    color: theme.colors.textSecondary,
    marginBottom: '4px',
  },
  voteNumber: {
    fontFamily: theme.fonts.title,
    fontSize: '24px',
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  playerVotes: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  playerVote: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 12px',
    background: theme.colors.bgDark,
    border: '2px solid',
    borderRadius: '2px',
  },
  playerName: {
    fontFamily: theme.fonts.body,
    fontSize: '14px',
    color: theme.colors.textPrimary,
  },
  playerChoice: {
    fontFamily: theme.fonts.body,
    fontSize: '12px',
  },
  voteInfo: {
    fontFamily: theme.fonts.body,
    fontSize: '12px',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  continueButton: {
    flex: 1,
    padding: '16px',
    fontSize: '15px',
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    border: `2px solid ${theme.colors.success}`,
    borderRadius: '2px',
    background: 'transparent',
    color: theme.colors.success,
    cursor: 'pointer',
  },
  retreatButton: {
    flex: 1,
    padding: '16px',
    fontSize: '15px',
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    border: `2px solid ${theme.colors.danger}`,
    borderRadius: '2px',
    background: 'transparent',
    color: theme.colors.danger,
    cursor: 'pointer',
  },
  votedMessage: {
    fontFamily: theme.fonts.body,
    fontSize: '14px',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
};
