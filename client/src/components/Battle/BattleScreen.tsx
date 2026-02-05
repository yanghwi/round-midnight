import React, { useState, useEffect } from 'react';
import { theme } from '../../styles/theme';
import { useGameStore } from '../../stores/gameStore';
import { InventoryPanel } from './InventoryPanel';
import type { CombatResult, Item, ItemRarity, CombatAction, ActionType } from '@daily-dungeon/shared';
import { GAME_CONSTANTS } from '@daily-dungeon/shared';

interface BattleScreenProps {
  onAttack: () => void;
  onRequestChoices: () => void;
  onSelectAction: (actionId: string) => void;
}

export function BattleScreen({ onAttack, onRequestChoices, onSelectAction }: BattleScreenProps) {
  const { battle, player, room, combatOutcome, latestDrops, choiceState, myActionId, gameState } = useGameStore();
  const { currentWave, maxWaves, enemy, narration, isProcessing } = battle;

  if (!enemy || !player) return null;

  const resultStyle = combatOutcome
    ? theme.combatResults[combatOutcome.result]
    : null;

  // 전투력 계산 (기본 + 장비 보정)
  const equipmentPower = (player.inventory || []).reduce(
    (sum, item) => sum + item.combatPower,
    0
  );
  const totalCombatPower = player.combatPower + equipmentPower;

  // 보스 웨이브 체크
  const isBossWave = currentWave === GAME_CONSTANTS.MID_BOSS_WAVE || currentWave === GAME_CONSTANTS.FINAL_BOSS_WAVE;

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={{
        ...styles.header,
        ...(isBossWave ? styles.bossHeader : {}),
      }}>
        <div style={styles.headerLeft}>
          <span style={styles.waveText}>
            Wave {currentWave}/{maxWaves}
            {isBossWave && <span style={styles.bossTag}> BOSS</span>}
          </span>
          <span style={styles.combatPowerText}>
            ⚔️ {totalCombatPower}
            {equipmentPower > 0 && (
              <span style={styles.bonusPower}>(+{equipmentPower})</span>
            )}
          </span>
        </div>
        <span style={styles.hpText}>HP: {player.hp}/{player.maxHp}</span>
      </div>

      {/* 적 표시 영역 */}
      <div style={styles.enemyArea}>
        <div style={styles.enemyIcon}>{enemy.imageKey}</div>
        <div style={styles.enemyName}>{enemy.name}</div>
        <div style={styles.enemyDesc}>{enemy.description}</div>
        {enemy.abilities && (
          <div style={styles.enemyAbility}>
            💀 {enemy.abilities.split(' - ')[0]}
          </div>
        )}
      </div>

      {/* 선택지 화면 */}
      {gameState === 'choosing' && choiceState && (
        <ChoicePanel
          actions={choiceState.actions}
          votes={choiceState.votes}
          myActionId={myActionId}
          deadline={choiceState.deadline}
          totalPlayers={room?.players.filter(p => p.isAlive).length || 1}
          onSelect={onSelectAction}
        />
      )}

      {/* 주사위 굴림 화면 */}
      {gameState === 'rolling' && choiceState?.diceRoll && (
        <DiceRollPanel
          diceRoll={choiceState.diceRoll}
          selectedAction={choiceState.actions.find(a => a.id === choiceState.selectedActionId)!}
        />
      )}

      {/* 서술 박스 (선택지/주사위 화면이 아닐 때만) */}
      {gameState !== 'choosing' && gameState !== 'rolling' && (
        <div
          style={{
            ...styles.narrationBox,
            ...(resultStyle
              ? {
                  background: resultStyle.bg,
                  borderColor: resultStyle.border,
                }
              : {}),
          }}
        >
          {isProcessing ? (
            <span style={styles.processingText}>선택지 생성 중...</span>
          ) : narration ? (
            <span style={{ color: resultStyle?.text || theme.colors.textPrimary }}>
              {narration}
            </span>
          ) : (
            <span style={styles.waitingText}>
              {enemy.name}이(가) 나타났다!
            </span>
          )}
        </div>
      )}

      {/* 전투 결과 뱃지 */}
      {combatOutcome && gameState === 'playing' && (
        <div
          style={{
            ...styles.resultBadge,
            background: resultStyle?.bg,
            borderColor: resultStyle?.border,
          }}
        >
          {getResultText(combatOutcome.result)}
        </div>
      )}

      {/* 드롭 아이템 표시 */}
      {latestDrops && latestDrops.length > 0 && gameState === 'playing' && (
        <div style={styles.dropsContainer}>
          <div style={styles.dropsHeader}>🎁 획득한 아이템</div>
          <div style={styles.dropsList}>
            {latestDrops.map((item) => (
              <DroppedItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* 파티원 HP 표시 */}
      {room && room.players.length > 1 && (
        <div style={styles.partyHp}>
          {room.players.map((p) => (
            <div
              key={p.id}
              style={{
                ...styles.partyMember,
                opacity: p.isAlive ? 1 : 0.4,
              }}
            >
              <span>{p.name}</span>
              <span>{p.hp}/{p.maxHp}</span>
            </div>
          ))}
        </div>
      )}

      {/* 액션 버튼 (선택지 화면이 아닐 때만) */}
      {gameState === 'playing' && !combatOutcome && (
        <div style={styles.actionArea}>
          <button
            onClick={onRequestChoices}
            disabled={isProcessing}
            style={{
              ...styles.attackButton,
              opacity: isProcessing ? 0.5 : 1,
            }}
          >
            {isProcessing ? '준비 중...' : '🎲 행동 선택'}
          </button>
        </div>
      )}

      {/* 하단 여백 (인벤토리 패널용) */}
      <div style={styles.bottomSpacer} />

      {/* 인벤토리 패널 */}
      <InventoryPanel />
    </div>
  );
}

/**
 * 선택지 패널
 */
interface ChoicePanelProps {
  actions: CombatAction[];
  votes: Record<string, string>;
  myActionId: string | null;
  deadline: number;
  totalPlayers: number;
  onSelect: (actionId: string) => void;
}

function ChoicePanel({ actions, votes, myActionId, deadline, totalPlayers, onSelect }: ChoicePanelProps) {
  const [timeLeft, setTimeLeft] = useState(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  // 각 행동별 투표 수 계산
  const voteCounts: Record<string, number> = {};
  for (const actionId of Object.values(votes)) {
    voteCounts[actionId] = (voteCounts[actionId] || 0) + 1;
  }

  const totalVotes = Object.keys(votes).length;
  const hasVoted = myActionId !== null;

  return (
    <div style={styles.choicePanel}>
      <div style={styles.choiceHeader}>
        <span style={styles.choiceTitle}>행동을 선택하세요!</span>
        <span style={{
          ...styles.choiceTimer,
          color: timeLeft <= 5 ? theme.colors.danger : theme.colors.textSecondary,
        }}>
          {timeLeft}초
        </span>
      </div>

      <div style={styles.choiceList}>
        {actions.map((action) => (
          <ActionCard
            key={action.id}
            action={action}
            isSelected={myActionId === action.id}
            voteCount={voteCounts[action.id] || 0}
            totalPlayers={totalPlayers}
            disabled={hasVoted}
            onSelect={() => onSelect(action.id)}
          />
        ))}
      </div>

      <div style={styles.voteStatus}>
        투표 현황: {totalVotes}/{totalPlayers}
        {hasVoted && <span style={styles.votedText}> (투표 완료)</span>}
      </div>
    </div>
  );
}

/**
 * 행동 카드
 */
interface ActionCardProps {
  action: CombatAction;
  isSelected: boolean;
  voteCount: number;
  totalPlayers: number;
  disabled: boolean;
  onSelect: () => void;
}

function ActionCard({ action, isSelected, voteCount, totalPlayers, disabled, onSelect }: ActionCardProps) {
  const typeStyle = getActionTypeStyle(action.type);

  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      style={{
        ...styles.actionCard,
        borderColor: isSelected ? theme.colors.accent : typeStyle.border,
        background: isSelected ? typeStyle.selectedBg : typeStyle.bg,
        opacity: disabled && !isSelected ? 0.6 : 1,
      }}
    >
      <div style={styles.actionCardHeader}>
        <span style={styles.actionEmoji}>{action.emoji}</span>
        <span style={{ ...styles.actionName, color: typeStyle.text }}>{action.name}</span>
        <span style={{ ...styles.actionType, background: typeStyle.border }}>{getActionTypeLabel(action.type)}</span>
      </div>
      <div style={styles.actionDesc}>{action.description}</div>
      {voteCount > 0 && (
        <div style={styles.actionVotes}>
          {voteCount}명 선택 ({Math.round(voteCount / totalPlayers * 100)}%)
        </div>
      )}
    </button>
  );
}

/**
 * 주사위 굴림 패널
 */
interface DiceRollPanelProps {
  diceRoll: { value: number; isCritical: boolean; isFumble: boolean };
  selectedAction: CombatAction;
}

function DiceRollPanel({ diceRoll, selectedAction }: DiceRollPanelProps) {
  const [displayValue, setDisplayValue] = useState(1);
  const [isRolling, setIsRolling] = useState(true);

  useEffect(() => {
    // 주사위 굴림 애니메이션
    let frame = 0;
    const totalFrames = 20;
    const interval = setInterval(() => {
      if (frame < totalFrames) {
        setDisplayValue(Math.floor(Math.random() * 20) + 1);
        frame++;
      } else {
        setDisplayValue(diceRoll.value);
        setIsRolling(false);
        clearInterval(interval);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [diceRoll.value]);

  const diceStyle = diceRoll.isCritical
    ? styles.diceCritical
    : diceRoll.isFumble
      ? styles.diceFumble
      : styles.diceNormal;

  return (
    <div style={styles.dicePanel}>
      <div style={styles.selectedActionInfo}>
        <span style={styles.selectedActionEmoji}>{selectedAction.emoji}</span>
        <span style={styles.selectedActionName}>{selectedAction.name}</span>
      </div>

      <div style={{
        ...styles.diceContainer,
        ...(isRolling ? styles.diceRolling : {}),
        ...(!isRolling ? diceStyle : {}),
      }}>
        <span style={styles.diceValue}>{displayValue}</span>
      </div>

      {!isRolling && (
        <div style={styles.diceResult}>
          {diceRoll.isCritical && <span style={styles.criticalText}>🌟 크리티컬! 🌟</span>}
          {diceRoll.isFumble && <span style={styles.fumbleText}>💀 펌블... 💀</span>}
          {!diceRoll.isCritical && !diceRoll.isFumble && (
            <span style={styles.normalRollText}>주사위: {diceRoll.value}</span>
          )}
        </div>
      )}

      <div style={styles.waitingResult}>
        {isRolling ? '🎲 주사위를 굴리는 중...' : '⚔️ 전투 결과 대기 중...'}
      </div>
    </div>
  );
}

/**
 * 드롭된 아이템 표시 컴포넌트
 */
function DroppedItem({ item }: { item: Item }) {
  const rarityStyle = theme.rarity[item.rarity];

  return (
    <div
      style={{
        ...styles.droppedItem,
        background: rarityStyle.bg,
        borderColor: getRarityBorderColor(item.rarity),
      }}
    >
      <span style={styles.droppedItemIcon}>{getItemIcon(item.type)}</span>
      <span style={{ ...styles.droppedItemName, color: rarityStyle.text }}>
        {item.name}
      </span>
      {item.combatPower > 0 && (
        <span style={styles.droppedItemPower}>+{item.combatPower}</span>
      )}
    </div>
  );
}

// Helper 함수들
function getItemIcon(type: string): string {
  switch (type) {
    case 'weapon': return '⚔️';
    case 'armor': return '🛡️';
    case 'accessory': return '💍';
    case 'consumable': return '🧪';
    default: return '📦';
  }
}

function getRarityBorderColor(rarity: ItemRarity): string {
  switch (rarity) {
    case 'legendary': return '#ea580c';
    case 'rare': return '#9333ea';
    case 'uncommon': return '#2563eb';
    case 'common':
    default: return '#6b7280';
  }
}

function getResultText(result: CombatResult): string {
  switch (result) {
    case 'perfect': return '완벽한 승리!';
    case 'victory': return '승리!';
    case 'narrow': return '아슬아슬한 승리';
    case 'defeat': return '패배...';
    case 'wipe': return '전멸 위기!';
  }
}

function getActionTypeStyle(type: ActionType): { bg: string; selectedBg: string; border: string; text: string } {
  switch (type) {
    case 'aggressive':
      return { bg: 'rgba(239, 68, 68, 0.1)', selectedBg: 'rgba(239, 68, 68, 0.25)', border: '#ef4444', text: '#fca5a5' };
    case 'defensive':
      return { bg: 'rgba(59, 130, 246, 0.1)', selectedBg: 'rgba(59, 130, 246, 0.25)', border: '#3b82f6', text: '#93c5fd' };
    case 'tactical':
      return { bg: 'rgba(34, 197, 94, 0.1)', selectedBg: 'rgba(34, 197, 94, 0.25)', border: '#22c55e', text: '#86efac' };
    case 'risky':
      return { bg: 'rgba(168, 85, 247, 0.1)', selectedBg: 'rgba(168, 85, 247, 0.25)', border: '#a855f7', text: '#d8b4fe' };
  }
}

function getActionTypeLabel(type: ActionType): string {
  switch (type) {
    case 'aggressive': return '공격';
    case 'defensive': return '방어';
    case 'tactical': return '전술';
    case 'risky': return '위험';
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: theme.colors.bgDarkest,
    padding: '16px',
    paddingBottom: '70px',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: theme.colors.bgMedium,
    borderRadius: '2px',
    marginBottom: '16px',
  },
  bossHeader: {
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
    border: '2px solid rgba(239, 68, 68, 0.5)',
  },
  bossTag: {
    color: '#ef4444',
    fontSize: '12px',
    fontWeight: 'bold',
    marginLeft: '8px',
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  waveText: {
    fontFamily: theme.fonts.title,
    fontSize: '16px',
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
  combatPowerText: {
    fontFamily: theme.fonts.body,
    fontSize: '12px',
    color: theme.colors.textGold,
  },
  bonusPower: {
    marginLeft: '4px',
    color: theme.colors.success,
    fontSize: '11px',
  },
  hpText: {
    fontFamily: theme.fonts.body,
    fontSize: '14px',
    color: theme.colors.success,
  },
  enemyArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    minHeight: '180px',
  },
  enemyIcon: {
    fontSize: '64px',
    marginBottom: '12px',
  },
  enemyName: {
    fontFamily: theme.fonts.title,
    fontSize: '22px',
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: '6px',
  },
  enemyDesc: {
    fontFamily: theme.fonts.body,
    fontSize: '12px',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: '280px',
    marginBottom: '8px',
  },
  enemyAbility: {
    fontFamily: theme.fonts.body,
    fontSize: '11px',
    color: theme.colors.danger,
    background: 'rgba(239, 68, 68, 0.1)',
    padding: '4px 12px',
    borderRadius: '12px',
  },
  narrationBox: {
    padding: '20px',
    background: theme.colors.bgMedium,
    border: theme.borders.card,
    borderRadius: '2px',
    marginBottom: '16px',
    minHeight: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingText: {
    fontFamily: theme.fonts.body,
    fontSize: '14px',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  waitingText: {
    fontFamily: theme.fonts.body,
    fontSize: '14px',
    color: theme.colors.textPrimary,
  },
  resultBadge: {
    alignSelf: 'center',
    padding: '8px 24px',
    borderRadius: '2px',
    border: '2px solid',
    fontFamily: theme.fonts.title,
    fontSize: '16px',
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: '16px',
  },
  partyHp: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '16px',
  },
  partyMember: {
    flex: '1 1 45%',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: theme.colors.bgDark,
    borderRadius: '2px',
    fontFamily: theme.fonts.body,
    fontSize: '12px',
    color: theme.colors.textSecondary,
  },
  actionArea: {
    display: 'flex',
    gap: '12px',
    marginTop: 'auto',
  },
  attackButton: {
    flex: 1,
    padding: '18px',
    fontSize: '18px',
    fontFamily: theme.fonts.title,
    fontWeight: 'bold',
    border: theme.borders.accent,
    borderRadius: '2px',
    background: theme.colors.primary,
    color: theme.colors.textPrimary,
    cursor: 'pointer',
    letterSpacing: '2px',
  },
  bottomSpacer: {
    height: '16px',
  },
  // 드롭 아이템 스타일
  dropsContainer: {
    padding: '12px',
    background: theme.colors.bgMedium,
    borderRadius: '4px',
    marginBottom: '16px',
    border: theme.borders.card,
  },
  dropsHeader: {
    fontFamily: theme.fonts.title,
    fontSize: '14px',
    fontWeight: 'bold',
    color: theme.colors.textGold,
    marginBottom: '8px',
  },
  dropsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  droppedItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '2px solid',
  },
  droppedItemIcon: {
    fontSize: '16px',
  },
  droppedItemName: {
    flex: 1,
    fontFamily: theme.fonts.title,
    fontSize: '13px',
    fontWeight: 'bold',
  },
  droppedItemPower: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: theme.colors.textGold,
  },
  // 선택지 패널 스타일
  choicePanel: {
    padding: '16px',
    background: theme.colors.bgMedium,
    borderRadius: '8px',
    marginBottom: '16px',
    border: `2px solid ${theme.colors.accent}`,
  },
  choiceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  choiceTitle: {
    fontFamily: theme.fonts.title,
    fontSize: '18px',
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
  choiceTimer: {
    fontFamily: theme.fonts.body,
    fontSize: '16px',
    fontWeight: 'bold',
  },
  choiceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '12px',
  },
  voteStatus: {
    textAlign: 'center',
    fontFamily: theme.fonts.body,
    fontSize: '14px',
    color: theme.colors.textSecondary,
  },
  votedText: {
    color: theme.colors.success,
  },
  // 행동 카드 스타일
  actionCard: {
    padding: '14px',
    borderRadius: '8px',
    border: '2px solid',
    background: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    width: '100%',
    transition: 'all 0.2s ease',
  },
  actionCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  actionEmoji: {
    fontSize: '24px',
  },
  actionName: {
    flex: 1,
    fontFamily: theme.fonts.title,
    fontSize: '16px',
    fontWeight: 'bold',
  },
  actionType: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 'bold',
    color: theme.colors.bgDarkest,
  },
  actionDesc: {
    fontFamily: theme.fonts.body,
    fontSize: '12px',
    color: theme.colors.textSecondary,
    marginBottom: '4px',
  },
  actionVotes: {
    fontFamily: theme.fonts.body,
    fontSize: '11px',
    color: theme.colors.textGold,
    textAlign: 'right',
  },
  // 주사위 패널 스타일
  dicePanel: {
    padding: '24px',
    background: theme.colors.bgMedium,
    borderRadius: '8px',
    marginBottom: '16px',
    border: `2px solid ${theme.colors.accent}`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  selectedActionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  selectedActionEmoji: {
    fontSize: '32px',
  },
  selectedActionName: {
    fontFamily: theme.fonts.title,
    fontSize: '20px',
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  diceContainer: {
    width: '100px',
    height: '100px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.colors.bgDark,
    border: `4px solid ${theme.colors.textSecondary}`,
  },
  diceRolling: {
    animation: 'shake 0.1s infinite',
  },
  diceNormal: {
    borderColor: theme.colors.textSecondary,
  },
  diceCritical: {
    borderColor: '#fbbf24',
    background: 'rgba(251, 191, 36, 0.2)',
    boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
  },
  diceFumble: {
    borderColor: '#ef4444',
    background: 'rgba(239, 68, 68, 0.2)',
    boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
  },
  diceValue: {
    fontFamily: theme.fonts.title,
    fontSize: '48px',
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  diceResult: {
    textAlign: 'center',
  },
  criticalText: {
    fontFamily: theme.fonts.title,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#fbbf24',
  },
  fumbleText: {
    fontFamily: theme.fonts.title,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ef4444',
  },
  normalRollText: {
    fontFamily: theme.fonts.body,
    fontSize: '16px',
    color: theme.colors.textSecondary,
  },
  waitingResult: {
    fontFamily: theme.fonts.body,
    fontSize: '14px',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
};
