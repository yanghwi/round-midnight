import React, { useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import { useGameStore } from './stores/gameStore';
import { Home, WaitingRoom } from './components/Lobby';
import { BattleScreen, VoteScreen, ResultScreen } from './components/Battle';
import { theme } from './styles/theme';

function App() {
  const { createRoom, joinRoom, startGame, leaveRoom, attack, requestChoices, selectAction, submitVote } = useSocket();
  const { gameState, room, player, connected, error, clearError, resetGame } = useGameStore();

  // 에러 토스트 자동 제거
  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const handleCreateRoom = (name: string) => {
    createRoom(name);
  };

  const handleJoinRoom = (code: string, name: string) => {
    joinRoom(code, name);
  };

  const handleReturnHome = () => {
    leaveRoom();
  };

  // 전투 관련 화면들은 모두 BattleScreen에서 처리
  const isBattleRelatedState = gameState === 'playing' || gameState === 'choosing' || gameState === 'rolling';

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

      {isBattleRelatedState && (
        <BattleScreen
          onAttack={attack}
          onRequestChoices={requestChoices}
          onSelectAction={selectAction}
        />
      )}

      {gameState === 'voting' && (
        <VoteScreen onVote={submitVote} />
      )}

      {gameState === 'result' && (
        <ResultScreen onReturnHome={handleReturnHome} />
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
