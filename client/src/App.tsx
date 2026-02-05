import { useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import { useGameStore } from './stores/gameStore';
import LobbyScreen from './components/Lobby/LobbyScreen';
import CharacterSetup from './components/Lobby/CharacterSetup';

function App() {
  const { createRoom, joinRoom, startGame, leaveRoom, submitCharacterSetup } = useSocket();
  const { phase, room, player, connected, error, setError } = useGameStore();

  // 에러 토스트 자동 제거
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  // 로비에 있는지 (방이 있고 waiting 상태)
  const isInLobby = room !== null && phase === 'waiting';

  return (
    <div className="min-h-dvh bg-midnight-900 flex flex-col">
      {/* 연결 상태 */}
      {!connected && (
        <div className="fixed top-0 left-0 right-0 p-2.5 bg-arcane text-white text-center text-sm font-bold z-50">
          연결 중...
        </div>
      )}

      {/* 에러 토스트 */}
      {error && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 px-6 py-3.5 bg-red-500 text-white border-2 border-red-400 rounded text-sm z-50 animate-fade-in">
          {error}
        </div>
      )}

      {/* 메인 콘텐츠 */}
      {!room && phase === 'waiting' && (
        <LobbyScreen
          mode="home"
          onCreateRoom={createRoom}
          onJoinRoom={joinRoom}
        />
      )}

      {isInLobby && player && (
        <LobbyScreen
          mode="room"
          room={room}
          player={player}
          onStartGame={startGame}
          onLeaveRoom={leaveRoom}
        />
      )}

      {phase === 'character_setup' && room && player && (
        <CharacterSetup
          room={room}
          player={player}
          onSubmit={submitCharacterSetup}
        />
      )}

      {phase === 'wave_intro' && (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-lg">
          전투 준비 중... (Phase 2에서 구현)
        </div>
      )}
    </div>
  );
}

export default App;
