import React, { useState } from 'react';
import { theme } from '../../styles/theme';

interface HomeProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: (code: string, name: string) => void;
}

export function Home({ onCreateRoom, onJoinRoom }: HomeProps) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState<'select' | 'join'>('select');

  const handleCreate = () => {
    if (!name.trim()) return;
    onCreateRoom(name.trim());
  };

  const handleJoin = () => {
    if (!name.trim() || !roomCode.trim()) return;
    onJoinRoom(roomCode.toUpperCase(), name.trim());
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>DAILY DUNGEON</h1>
        <p style={styles.subtitle}>하루 한 판, 기묘한 전투</p>

        <div style={styles.section}>
          <input
            type="text"
            placeholder="이름을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={10}
            style={styles.input}
          />
        </div>

        {mode === 'select' ? (
          <div style={styles.buttonGroup}>
            <button onClick={handleCreate} disabled={!name.trim()} style={styles.primaryButton}>
              던전 생성
            </button>
            <button onClick={() => setMode('join')} style={styles.secondaryButton}>
              파티 합류
            </button>
          </div>
        ) : (
          <div style={styles.section}>
            <input
              type="text"
              placeholder="코드 4자리"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={4}
              style={{ ...styles.input, letterSpacing: '8px', textAlign: 'center' }}
            />
            <div style={styles.buttonGroup}>
              <button
                onClick={handleJoin}
                disabled={!name.trim() || roomCode.length !== 4}
                style={styles.primaryButton}
              >
                입장
              </button>
              <button onClick={() => setMode('select')} style={styles.secondaryButton}>
                뒤로
              </button>
            </div>
          </div>
        )}

        <div style={styles.info}>
          <p style={styles.infoText}>🎮 EarthBound 스타일 전투</p>
          <p style={styles.infoText}>⚔️ 웨이브 기반 도전</p>
          <p style={styles.infoText}>🗳️ 다수결로 진행 결정</p>
        </div>
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
    padding: '50px 24px',
    maxWidth: '400px',
    margin: '0 auto',
  },
  title: {
    fontFamily: theme.fonts.title,
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '8px',
    color: theme.colors.accent,
    letterSpacing: '1px',
  },
  subtitle: {
    fontFamily: theme.fonts.body,
    fontSize: '14px',
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: '40px',
  },
  section: {
    marginBottom: '24px',
  },
  input: {
    width: '100%',
    padding: '16px 18px',
    fontSize: '16px',
    fontFamily: theme.fonts.body,
    border: theme.borders.secondary,
    borderRadius: '2px',
    background: theme.colors.bgDark,
    color: theme.colors.textPrimary,
    outline: 'none',
    boxSizing: 'border-box',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  primaryButton: {
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
    letterSpacing: '1px',
  },
  secondaryButton: {
    width: '100%',
    padding: '14px',
    fontSize: '14px',
    fontFamily: theme.fonts.body,
    border: theme.borders.secondary,
    borderRadius: '2px',
    background: 'transparent',
    color: theme.colors.textSecondary,
    cursor: 'pointer',
  },
  info: {
    marginTop: '48px',
    padding: '16px',
    background: theme.colors.bgMedium,
    borderRadius: '2px',
    border: theme.borders.card,
  },
  infoText: {
    fontFamily: theme.fonts.body,
    fontSize: '13px',
    color: theme.colors.textSecondary,
    marginBottom: '8px',
    textAlign: 'center',
  },
};
