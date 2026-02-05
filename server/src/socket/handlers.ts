import { Server, Socket } from 'socket.io';
import { roomManager } from '../game/Room.js';
import { createPlayer } from '../game/Player.js';
import { getEnemyForWave } from '../game/enemies.js';
import { rollDice, isVictory, isPartyWiped } from '../game/Combat.js';
import {
  generateCombatChoices,
  resolveCombatWithLLM,
} from '../ai/combatNarrator.js';
import { generateDrops } from '../game/items.js';
import type {
  CreateRoomPayload,
  JoinRoomPayload,
  PlayerVotePayload,
  SelectActionPayload,
  RoomCreatedResponse,
  RoomJoinedResponse,
  GameStartedResponse,
  CombatResultResponse,
  VoteUpdateResponse,
  RunEndPayload,
  ChoicesGeneratedResponse,
  ActionVoteUpdateResponse,
  DiceRolledResponse,
  Player,
  Wave,
  CombatAction,
  CombatOutcome,
} from '@daily-dungeon/shared';
import { GAME_CONSTANTS } from '@daily-dungeon/shared';

// 방별 행동 선택 투표 상태
interface ActionVoteState {
  actions: CombatAction[];
  votes: Record<string, string>; // playerId -> actionId
  deadline: number;
  timeoutId?: NodeJS.Timeout;
}

const actionVotes = new Map<string, ActionVoteState>();

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // 방 생성
    socket.on('create-room', (payload: CreateRoomPayload) => {
      const player = createPlayer(socket.id, payload.playerName);
      const room = roomManager.createRoom(player);

      socket.join(room.code);

      const response: RoomCreatedResponse = {
        roomCode: room.code,
        player,
      };

      socket.emit('room-created', response);
      console.log(`Room created: ${room.code} by ${player.name}`);
    });

    // 방 참가
    socket.on('join-room', (payload: JoinRoomPayload) => {
      const player = createPlayer(socket.id, payload.playerName);
      const room = roomManager.joinRoom(payload.roomCode, player);

      if (!room) {
        socket.emit('join-error', { message: '방을 찾을 수 없거나 참가할 수 없습니다.' });
        return;
      }

      socket.join(room.code);

      const response: RoomJoinedResponse = {
        room,
        player,
      };

      socket.emit('room-joined', response);

      // 다른 플레이어들에게 알림
      socket.to(room.code).emit('player-joined', { player, room });

      console.log(`${player.name} joined room ${room.code}`);
    });

    // 게임 시작
    socket.on('start-game', () => {
      console.log(`[start-game] Socket ${socket.id} requested game start`);

      const room = roomManager.getPlayerRoom(socket.id);
      if (!room) {
        console.log(`[start-game] No room found for socket ${socket.id}`);
        return;
      }

      const player = room.players.find((p: Player) => p.socketId === socket.id);
      if (!player) {
        console.log(`[start-game] No player found in room ${room.code} for socket ${socket.id}`);
        return;
      }

      console.log(`[start-game] Player ${player.name} (${player.id}) trying to start room ${room.code}`);

      const startedRoom = roomManager.startGame(room.code, player.id);
      if (!startedRoom || !startedRoom.run) {
        console.log(`[start-game] startGame returned null - hostId mismatch or not enough players`);
        socket.emit('start-error', { message: '게임을 시작할 수 없습니다. (호스트만 시작 가능)' });
        return;
      }

      // 첫 번째 웨이브 생성
      const enemy = getEnemyForWave(1, startedRoom.players.length);
      const wave: Wave = {
        waveNumber: 1,
        enemy,
        isCleared: false,
      };

      // 게임 시작 응답
      const response: GameStartedResponse = {
        players: startedRoom.players,
        run: startedRoom.run,
        wave,
      };

      io.to(room.code).emit('game-started', response);
      console.log(`Game started in room ${room.code}`);
    });

    // 선택지 요청 (새로운 전투 흐름)
    socket.on('request-choices', async () => {
      const room = roomManager.getPlayerRoom(socket.id);
      if (!room || room.state !== 'playing' || !room.run) return;

      const player = room.players.find((p: Player) => p.socketId === socket.id);
      if (!player || !player.isAlive) return;

      // 이미 선택지가 생성되어 있는지 확인
      if (actionVotes.has(room.code)) {
        const existingState = actionVotes.get(room.code)!;
        const response: ChoicesGeneratedResponse = {
          actions: existingState.actions,
          deadline: existingState.deadline,
        };
        socket.emit('choices-generated', response);
        return;
      }

      // 현재 웨이브의 적 가져오기
      const enemy = getEnemyForWave(room.run.currentWave, room.players.length);
      const participants = room.players.filter((p) => p.isAlive && !p.hasEscaped);

      try {
        // LLM으로 선택지 생성
        const actions = await generateCombatChoices(enemy, participants, room.run.currentWave);
        const deadline = Date.now() + GAME_CONSTANTS.ACTION_CHOICE_TIMEOUT;

        // 투표 상태 초기화
        const voteState: ActionVoteState = {
          actions,
          votes: {},
          deadline,
        };

        // 타임아웃 설정 (defensive 자동 선택)
        voteState.timeoutId = setTimeout(() => {
          handleActionTimeout(io, room.code);
        }, GAME_CONSTANTS.ACTION_CHOICE_TIMEOUT);

        actionVotes.set(room.code, voteState);

        const response: ChoicesGeneratedResponse = {
          actions,
          deadline,
        };

        io.to(room.code).emit('choices-generated', response);
        console.log(`Choices generated for room ${room.code}`);
      } catch (err) {
        console.error('Failed to generate choices:', err);
        socket.emit('choices-error', { message: '선택지 생성에 실패했습니다.' });
      }
    });

    // 행동 선택/투표
    socket.on('select-action', async (payload: SelectActionPayload) => {
      const room = roomManager.getPlayerRoom(socket.id);
      if (!room || room.state !== 'playing' || !room.run) return;

      const player = room.players.find((p: Player) => p.socketId === socket.id);
      if (!player || !player.isAlive) return;

      const voteState = actionVotes.get(room.code);
      if (!voteState) return;

      // 투표 등록
      voteState.votes[player.id] = payload.actionId;

      // 투표 현황 브로드캐스트
      const alivePlayers = room.players.filter((p) => p.isAlive && !p.hasEscaped);
      const voteUpdate: ActionVoteUpdateResponse = {
        votes: voteState.votes,
        totalPlayers: alivePlayers.length,
      };
      io.to(room.code).emit('action-vote-update', voteUpdate);

      console.log(`${player.name} voted for action ${payload.actionId} in room ${room.code}`);

      // 모든 플레이어가 투표했는지 확인
      if (Object.keys(voteState.votes).length >= alivePlayers.length) {
        // 타임아웃 취소
        if (voteState.timeoutId) {
          clearTimeout(voteState.timeoutId);
        }

        // 전투 실행
        await executeCombat(io, room.code);
      }
    });

    // 기존 공격 (하위 호환성 - 기존 클라이언트용)
    socket.on('attack', async () => {
      // request-choices로 리다이렉트
      socket.emit('use-new-combat', { message: '새 전투 시스템을 사용하세요.' });
    });

    // 투표 제출
    socket.on('player-vote', (payload: PlayerVotePayload) => {
      const room = roomManager.getPlayerRoom(socket.id);
      if (!room || room.state !== 'playing' || !room.vote) return;

      const player = room.players.find((p: Player) => p.socketId === socket.id);
      if (!player || !player.isAlive) return;

      // 투표 제출
      const updatedVotes = roomManager.submitVote(room.code, player.id, payload.choice);
      if (!updatedVotes) return;

      // 투표 현황 브로드캐스트
      const voteUpdate: VoteUpdateResponse = {
        votes: updatedVotes,
      };

      // 투표 완료 여부 확인
      const result = roomManager.getVoteResult(room.code);
      if (result) {
        voteUpdate.result = result;

        if (result === 'continue') {
          // 다음 웨이브로 진행
          const newRun = roomManager.advanceWave(room.code);
          if (newRun) {
            const enemy = getEnemyForWave(newRun.currentWave, room.players.length);
            const wave: Wave = {
              waveNumber: newRun.currentWave,
              enemy,
              isCleared: false,
            };
            io.to(room.code).emit('wave-start', { wave, run: newRun });
          }
        } else {
          // 탈출
          const run = room.run;
          if (run) {
            const endPayload: RunEndPayload = {
              waveReached: run.currentWave,
              rewards: run.accumulatedRewards,
              escaped: true,
            };
            io.to(room.code).emit('run-end', endPayload);
            roomManager.endRun(room.code, true);
          }
        }
      }

      io.to(room.code).emit('vote-update', voteUpdate);
      console.log(`Vote in room ${room.code}: ${player.name} voted ${payload.choice}`);
    });

    // 방 나가기
    socket.on('leave-room', () => {
      handleDisconnect(socket, io);
    });

    // 연결 해제
    socket.on('disconnect', () => {
      handleDisconnect(socket, io);
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

// 행동 선택 타임아웃 처리
async function handleActionTimeout(io: Server, roomCode: string) {
  const voteState = actionVotes.get(roomCode);
  if (!voteState) return;

  const room = roomManager.getRoom(roomCode);
  if (!room) return;

  // 투표하지 않은 플레이어는 defensive 자동 선택
  const alivePlayers = room.players.filter((p) => p.isAlive && !p.hasEscaped);
  const defensiveAction = voteState.actions.find((a) => a.type === 'defensive') || voteState.actions[0];

  for (const player of alivePlayers) {
    if (!voteState.votes[player.id]) {
      voteState.votes[player.id] = defensiveAction.id;
    }
  }

  // 전투 실행
  await executeCombat(io, roomCode);
}

// 전투 실행 (새로운 흐름)
async function executeCombat(io: Server, roomCode: string) {
  const voteState = actionVotes.get(roomCode);
  if (!voteState) return;

  const room = roomManager.getRoom(roomCode);
  if (!room || !room.run) return;

  // 다수결로 행동 결정
  const voteCounts: Record<string, number> = {};
  for (const actionId of Object.values(voteState.votes)) {
    voteCounts[actionId] = (voteCounts[actionId] || 0) + 1;
  }

  let selectedActionId = Object.keys(voteCounts).reduce((a, b) =>
    voteCounts[a] > voteCounts[b] ? a : b
  );

  const selectedAction = voteState.actions.find((a) => a.id === selectedActionId) || voteState.actions[0];

  // 주사위 굴림
  const diceResult = rollDice();

  // 주사위 결과 + 선택된 행동 브로드캐스트
  const diceResponse: DiceRolledResponse = {
    selectedAction,
    diceRoll: diceResult,
  };
  io.to(roomCode).emit('dice-rolled', diceResponse);

  // 잠시 대기 (주사위 애니메이션 시간)
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 현재 웨이브의 적 가져오기
  const enemy = getEnemyForWave(room.run.currentWave, room.players.length);
  const participants = room.players.filter((p) => p.isAlive && !p.hasEscaped);

  try {
    // LLM으로 전투 결과 판정
    const llmResult = await resolveCombatWithLLM(
      enemy,
      participants,
      selectedAction,
      diceResult,
      room.run.currentWave
    );

    // 플레이어 상태 업데이트
    const updatedPlayers = applyDamages(room.players, llmResult.damages);
    roomManager.updatePlayers(roomCode, updatedPlayers);

    // 드롭 아이템 생성
    const drops = generateDrops(llmResult.result, room.run.currentWave);

    // 드롭 아이템을 누적 보상에 추가
    if (drops.length > 0) {
      room.run.accumulatedRewards.push(...drops);
    }

    // 전투 결과 생성
    const outcome: CombatOutcome = {
      result: llmResult.result,
      enemy,
      participants: participants.map((p) => p.id),
      damages: llmResult.damages,
      drops,
      description: llmResult.narration,
    };

    // 전투 결과 브로드캐스트
    const response: CombatResultResponse = {
      outcome,
      updatedPlayers,
      run: room.run,
    };

    io.to(roomCode).emit('combat-result', response);

    // 사망한 플레이어 처리
    for (const p of updatedPlayers) {
      const originalPlayer = room.players.find((op) => op.id === p.id);
      if (originalPlayer?.isAlive && !p.isAlive) {
        io.to(roomCode).emit('player-died', {
          playerId: p.id,
          playerName: p.name,
        });
      }
    }

    // 파티 전멸 체크
    if (isPartyWiped(updatedPlayers)) {
      const endPayload: RunEndPayload = {
        waveReached: room.run.currentWave,
        rewards: room.run.accumulatedRewards,
        escaped: false,
      };
      io.to(roomCode).emit('run-end', endPayload);
      roomManager.endRun(roomCode, false);
      actionVotes.delete(roomCode);
      return;
    }

    // 승리 시 웨이브 클리어 처리
    if (isVictory(llmResult.result)) {
      // 마지막 웨이브인지 확인
      if (room.run.currentWave >= room.run.maxWaves) {
        const endPayload: RunEndPayload = {
          waveReached: room.run.currentWave,
          rewards: room.run.accumulatedRewards,
          escaped: true,
        };
        io.to(roomCode).emit('run-end', endPayload);
        roomManager.endRun(roomCode, true);
      } else {
        // 투표 시작
        const continueVoteState = roomManager.startVote(roomCode);
        if (continueVoteState) {
          io.to(roomCode).emit('vote-start', { votes: continueVoteState });
        }
      }
    }

    // 행동 선택 상태 초기화
    actionVotes.delete(roomCode);

    console.log(
      `Combat in room ${roomCode}: ${enemy.name} - ${selectedAction.name} (🎲${diceResult.value}) - ${llmResult.result}`
    );
  } catch (err) {
    console.error('Combat error:', err);
    actionVotes.delete(roomCode);
  }
}

// 데미지 적용
function applyDamages(
  players: Player[],
  damages: { playerId: string; damage: number }[]
): Player[] {
  const updatedPlayers: Player[] = [];

  for (const player of players) {
    const damageInfo = damages.find((d) => d.playerId === player.id);
    if (damageInfo) {
      const newHp = Math.max(0, player.hp - damageInfo.damage);
      const isAlive = newHp > 0;

      updatedPlayers.push({
        ...player,
        hp: newHp,
        isAlive,
      });
    } else {
      updatedPlayers.push(player);
    }
  }

  return updatedPlayers;
}

function handleDisconnect(socket: Socket, io: Server) {
  const result = roomManager.removePlayerBySocketId(socket.id);
  if (result) {
    io.to(result.room.code).emit('player-left', {
      playerId: result.playerId,
      room: result.room,
    });

    // 행동 선택 상태도 정리
    const voteState = actionVotes.get(result.room.code);
    if (voteState) {
      delete voteState.votes[result.playerId];
    }
  }
}
