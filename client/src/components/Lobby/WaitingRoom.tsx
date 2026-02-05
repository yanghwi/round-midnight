import React from 'react';
import type { Room, Player } from '@daily-dungeon/shared';
import { theme } from '../../styles/theme';
import { GAME_CONSTANTS } from '@daily-dungeon/shared';

interface WaitingRoomProps {
  room: Room;
  player: Player;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export function WaitingRoom({ room, player, onStartGame, onLeaveRoom }: WaitingRoomProps) {
  const isHost = room.hostId === player.id;
  const canStart = room.players.length >= GAME_CONSTANTS.MIN_PLAYERS;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <button onClick={onLeaveRoom} style={styles.backButton}>
            ← 뒤로
          </button>
          <div style={styles.roomCode}>
            <span style={styles.codeLabel}>던전 코드</span>
            <span style={styles.code}>{room.code}</span>
          </div>
        </div>

        <div style={styles.playerList}>
          <p style={styles.playerCount}>
            모험자 ({room.players.length}/4)
          </p>
          {room.players.map((p) => (
            <div
              key={p.id}
              style={{
                ...styles.playerCard,
                ...(p.id === player.id ? styles.playerCardSelf : {}),
              }}
            >
              <div style={styles.avatar}>
                <span style={styles.avatarEmoji}>👤</span>
              </div>
              <div style={styles.playerInfo}>
                <span style={styles.playerName}>
                  {p.name}
                  {p.id === room.hostId && <span style={styles.hostBadge}>HOST</span>}
                </span>
                <span style={styles.playerStats}>
                  HP: {p.hp} | 전투력: {p.combatPower}
                </span>
              </div>
            </div>
          ))}

          {Array.from({ length: 4 - room.players.length }).map((_, i) => (
            <div key={`empty-${i}`} style={styles.emptySlot}>
              <span style={styles.emptyText}>대기 중...</span>
            </div>
          ))}
        </div>

        {isHost && (
          <button
            onClick={() => onStartGame()}
            disabled={!canStart}
            style={{
              ...styles.startButton,
              ...(canStart ? {} : styles.startButtonDisabled),
            }}
          >
            {canStart ? '던전 진입' : '1명 이상 필요'}
          </button>
        )}

        {!isHost && (
          <p style={styles.waitingText}>호스트가 게임을 시작하길 기다리는 중...</p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: theme.colors.bgDarkest,
  },
  content: {
    padding: '24px',
    maxWidth: '400px',
    margin: '0 auto',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  backButton: {
    padding: '10px 14px',
    fontSize: '14px',
    fontFamily: theme.fonts.body,
    border: theme.borders.secondary,
    borderRadius: '2px',
    background: theme.colors.bgMedium,
    color: theme.colors.textSecondary,
    cursor: 'pointer',
  },
  roomCode: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  codeLabel: {
    fontSize: '11px',
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  code: {
    fontSize: '24px',
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    color: theme.colors.accent,
    letterSpacing: '4px',
  },
  playerList: {
    flex: 1,
  },
  playerCount: {
    fontSize: '12px',
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    marginBottom: '14px',
  },
  playerCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    marginBottom: '10px',
    borderRadius: '2px',
    background: theme.colors.bgMedium,
    border: theme.borders.card,
  },
  playerCardSelf: {
    borderColor: theme.colors.accent,
  },
  avatar: {
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '14px',
    background: theme.colors.bgDark,
    border: theme.borders.secondary,
    borderRadius: '2px',
  },
  avatarEmoji: {
    fontSize: '24px',
  },
  playerInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  playerName: {
    fontSize: '16px',
    fontFamily: theme.fonts.body,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  hostBadge: {
    fontSize: '10px',
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    padding: '4px 8px',
    borderRadius: '2px',
    background: theme.colors.primary,
    color: theme.colors.textPrimary,
  },
  playerStats: {
    fontSize: '12px',
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: '2px',
  },
  emptySlot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    marginBottom: '10px',
    borderRadius: '2px',
    border: theme.borders.dashed,
    background: 'rgba(0, 0, 0, 0.2)',
  },
  emptyText: {
    fontSize: '13px',
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
  },
  startButton: {
    width: '100%',
    padding: '20px',
    fontSize: '16px',
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    border: `2px solid ${theme.colors.success}`,
    borderRadius: '2px',
    background: theme.colors.success,
    color: theme.colors.textPrimary,
    cursor: 'pointer',
    letterSpacing: '1px',
    marginTop: 'auto',
  },
  startButtonDisabled: {
    background: theme.colors.bgMedium,
    borderColor: theme.colors.bgMedium,
    color: theme.colors.textSecondary,
    cursor: 'not-allowed',
  },
  waitingText: {
    textAlign: 'center',
    fontFamily: theme.fonts.body,
    color: theme.colors.textSecondary,
    marginTop: 'auto',
    padding: '20px',
  },
};
