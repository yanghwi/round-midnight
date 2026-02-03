import React, { useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import { useGameStore } from './stores/gameStore';
import { Home, WaitingRoom } from './components/Lobby';
import { GameScreen } from './components/Game';
import type { PlayerClass } from '@daily-dungeon/shared';
import { theme } from './styles/theme';

function App() {
  const { socket, createRoom, joinRoom, startGame, leaveRoom } = useSocket();
  const { gameState, room, player, connected, error, clearError } = useGameStore();

  // 에러 토스트 자동 제거
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleCreateRoom = (name: string, playerClass: PlayerClass) => {
    createRoom(name, playerClass);
  };

  const handleJoinRoom = (code: string, name: string, playerClass: PlayerClass) => {
    joinRoom(code, name, playerClass);
  };

  return (
    <div style={styles.app}>
      {/* 연결 상태 */}
      {!connected && (
        <div style={styles.connecting}>
          연결 중...
        </div>
      )}

      {/* 에러 토스트 */}
      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {/* 메인 콘텐츠 */}
      {gameState === 'home' && (
        <Home onCreateRoom={handleCreateRoom} onJoinRoom={handleJoinRoom} />
      )}

      {gameState === 'lobby' && room && player && (
        <WaitingRoom
          room={room}
          player={player}
          onStartGame={startGame}
          onLeaveRoom={leaveRoom}
        />
      )}

      {gameState === 'playing' && (
        <GameScreen socket={socket} />
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    background: theme.colors.bgDarkest,
  },
  connecting: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    padding: '10px',
    background: theme.colors.primary,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    fontSize: '14px',
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    zIndex: 1000,
  },
  error: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '14px 24px',
    background: theme.colors.danger,
    color: theme.colors.textPrimary,
    border: `2px solid ${theme.colors.danger}`,
    borderRadius: '2px',
    fontSize: '14px',
    fontFamily: theme.fonts.body,
    zIndex: 1000,
  },
};

export default App;
