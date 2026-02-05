import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useGameStore } from '../stores/gameStore';
import type {
  RoomCreatedResponse,
  RoomJoinedResponse,
  Room,
  Player,
  GameStartedResponse,
  CombatResultResponse,
  VoteUpdateResponse,
  RunEndPayload,
  PlayerDiedResponse,
  Wave,
  RunState,
  VoteChoice,
  VoteState,
  ChoicesGeneratedResponse,
  ActionVoteUpdateResponse,
  DiceRolledResponse,
} from '@daily-dungeon/shared';

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:3000' : '';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const {
    setPlayer,
    setRoom,
    setConnected,
    setError,
    setGameState,
    setCurrentWave,
    setNarration,
    setWaitingForChoice,
    setProcessing,
    setCombatOutcome,
    setLatestDrops,
    setRun,
    setVote,
    setMyVote,
    updatePlayers,
    setBattle,
    resetGame,
    setChoices,
    setActionVotes,
    setDiceRoll,
    setChoiceState,
    setMyAction,
  } = useGameStore();

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });

    // 방 생성 응답
    socket.on('room-created', (data: RoomCreatedResponse) => {
      setPlayer(data.player);
      setRoom({
        code: data.roomCode,
        players: [data.player],
        state: 'waiting',
        hostId: data.player.id,
        run: null,
        vote: null,
      });
      setGameState('lobby');
    });

    // 방 참가 응답
    socket.on('room-joined', (data: RoomJoinedResponse) => {
      setPlayer(data.player);
      setRoom(data.room);
      setGameState('lobby');
    });

    // 새 플레이어 참가
    socket.on('player-joined', (data: { player: Player; room: Room }) => {
      setRoom(data.room);
    });

    // 플레이어 퇴장
    socket.on('player-left', (data: { playerId: string; room: Room }) => {
      setRoom(data.room);
    });

    // 게임 시작
    socket.on('game-started', (data: GameStartedResponse) => {
      console.log('[game-started]', data);
      setRoom((prevRoom) =>
        prevRoom
          ? {
              ...prevRoom,
              state: 'playing',
              players: data.players,
              run: data.run,
            }
          : null
      );
      setRun(data.run);
      setCurrentWave(data.wave);
      setBattle({ maxWaves: data.run.maxWaves });
      setGameState('playing');
    });

    // 선택지 생성 완료 (새로운 전투 시스템)
    socket.on('choices-generated', (data: ChoicesGeneratedResponse) => {
      console.log('[choices-generated]', data.actions);
      setChoices(data.actions, data.deadline);
      setGameState('choosing');
    });

    // 행동 선택 투표 현황
    socket.on('action-vote-update', (data: ActionVoteUpdateResponse) => {
      console.log('[action-vote-update]', data);
      setActionVotes(data.votes);
    });

    // 주사위 결과
    socket.on('dice-rolled', (data: DiceRolledResponse) => {
      console.log('[dice-rolled]', data.diceRoll.value, data.selectedAction.name);
      setDiceRoll(data.diceRoll, data.selectedAction);
      setGameState('rolling');
    });

    // 전투 결과
    socket.on('combat-result', (data: CombatResultResponse) => {
      console.log('[combat-result]', data.outcome.result);
      setCombatOutcome(data.outcome);
      setNarration(data.outcome.description);
      updatePlayers(data.updatedPlayers);
      setRun(data.run);
      setProcessing(false);
      setChoiceState(null);
      setGameState('playing');

      // 드롭 아이템 저장
      if (data.outcome.drops && data.outcome.drops.length > 0) {
        setLatestDrops(data.outcome.drops);
      } else {
        setLatestDrops([]);
      }
    });

    // 웨이브 시작
    socket.on('wave-start', (data: { wave: Wave; run: RunState }) => {
      console.log('[wave-start]', data.wave.waveNumber);
      setCurrentWave(data.wave);
      setRun(data.run);
      setVote(null);
      setMyVote(null);
      setCombatOutcome(null);
      setLatestDrops([]);
      setChoiceState(null);
      setMyAction('');
      setGameState('playing');
    });

    // 투표 시작
    socket.on('vote-start', (data: { votes: VoteState }) => {
      console.log('[vote-start]');
      setVote(data.votes);
      setWaitingForChoice(true);
      setGameState('voting');
    });

    // 투표 업데이트
    socket.on('vote-update', (data: VoteUpdateResponse) => {
      console.log('[vote-update]', data);
      setVote(data.votes);

      if (data.result) {
        // 투표 완료
        setWaitingForChoice(false);
      }
    });

    // 런 종료
    socket.on('run-end', (data: RunEndPayload) => {
      console.log('[run-end]', data);
      setGameState('result');
    });

    // 플레이어 사망
    socket.on('player-died', (data: PlayerDiedResponse) => {
      console.log('[player-died]', data.playerName);
    });

    // 에러 처리
    socket.on('join-error', (data: { message: string }) => {
      setError(data.message);
    });

    socket.on('start-error', (data: { message: string }) => {
      setError(data.message);
    });

    socket.on('choices-error', (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = (playerName: string) => {
    socketRef.current?.emit('create-room', { playerName });
  };

  const joinRoom = (roomCode: string, playerName: string) => {
    socketRef.current?.emit('join-room', { roomCode, playerName });
  };

  const startGame = () => {
    console.log('[startGame] Called');
    socketRef.current?.emit('start-game');
  };

  const leaveRoom = () => {
    socketRef.current?.emit('leave-room');
    resetGame();
  };

  // 선택지 요청 (새로운 전투 시스템)
  const requestChoices = () => {
    console.log('[requestChoices] Called');
    setProcessing(true);
    socketRef.current?.emit('request-choices');
  };

  // 행동 선택
  const selectAction = (actionId: string) => {
    console.log('[selectAction]', actionId);
    setMyAction(actionId);
    socketRef.current?.emit('select-action', { actionId });
  };

  // 기존 attack (하위 호환성)
  const attack = () => {
    console.log('[attack] Redirecting to requestChoices');
    requestChoices();
  };

  const submitVote = (choice: VoteChoice) => {
    console.log('[submitVote]', choice);
    setMyVote(choice);
    socketRef.current?.emit('player-vote', { choice });
  };

  return {
    socket: socketRef.current,
    createRoom,
    joinRoom,
    startGame,
    leaveRoom,
    attack,
    requestChoices,
    selectAction,
    submitVote,
  };
}
