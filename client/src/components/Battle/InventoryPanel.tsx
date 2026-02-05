import React, { useState } from 'react';
import { theme } from '../../styles/theme';
import { useGameStore } from '../../stores/gameStore';
import type { Item, ItemRarity } from '@daily-dungeon/shared';

const MAX_INVENTORY_SIZE = 10;

/**
 * 인벤토리 패널 컴포넌트
 * 기본: 접힌 상태 (아이콘 + 개수)
 * 터치 시: 슬라이드 업 패널
 */
export function InventoryPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { player } = useGameStore();

  if (!player) return null;

  const inventory = player.inventory || [];
  const totalCombatPower = inventory.reduce(
    (sum, item) => sum + item.combatPower,
    0
  );

  // TODO(human): 접힘/펼침 토글 시 애니메이션과 상호작용 처리

  return (
    <div style={styles.container}>
      {/* 접힌 상태: 헤더만 표시 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={styles.header}
        aria-expanded={isExpanded}
      >
        <span style={styles.headerIcon}>📦</span>
        <span style={styles.headerText}>
          인벤토리 ({inventory.length}/{MAX_INVENTORY_SIZE})
        </span>
        {totalCombatPower > 0 && (
          <span style={styles.combatPowerBadge}>+{totalCombatPower}</span>
        )}
        <span style={styles.expandIcon}>{isExpanded ? '▼' : '▲'}</span>
      </button>

      {/* 펼친 상태: 아이템 목록 */}
      {isExpanded && (
        <div style={styles.itemList}>
          {inventory.length === 0 ? (
            <div style={styles.emptyText}>아이템이 없습니다</div>
          ) : (
            inventory.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

interface ItemCardProps {
  item: Item;
}

function ItemCard({ item }: ItemCardProps) {
  const rarityStyle = theme.rarity[item.rarity];

  return (
    <div
      style={{
        ...styles.itemCard,
        background: rarityStyle.bg,
        borderColor: getRarityBorderColor(item.rarity),
      }}
    >
      <div style={styles.itemHeader}>
        <span style={styles.itemIcon}>{getItemIcon(item.type)}</span>
        <span style={{ ...styles.itemName, color: rarityStyle.text }}>
          {item.name}
        </span>
        {item.combatPower > 0 && (
          <span style={styles.itemPower}>+{item.combatPower}</span>
        )}
      </div>
      <div style={styles.itemDesc}>{item.description}</div>
    </div>
  );
}

function getItemIcon(type: string): string {
  switch (type) {
    case 'weapon':
      return '⚔️';
    case 'armor':
      return '🛡️';
    case 'accessory':
      return '💍';
    case 'consumable':
      return '🧪';
    default:
      return '📦';
  }
}

function getRarityBorderColor(rarity: ItemRarity): string {
  switch (rarity) {
    case 'legendary':
      return '#ea580c';
    case 'rare':
      return '#9333ea';
    case 'uncommon':
      return '#2563eb';
    case 'common':
    default:
      return '#6b7280';
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: theme.colors.bgDark,
    borderTop: theme.borders.card,
    zIndex: 100,
  },
  header: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: theme.colors.textPrimary,
    fontFamily: theme.fonts.body,
    fontSize: '14px',
  },
  headerIcon: {
    fontSize: '18px',
  },
  headerText: {
    flex: 1,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  combatPowerBadge: {
    padding: '2px 8px',
    background: theme.colors.primary,
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: theme.colors.textGold,
  },
  expandIcon: {
    fontSize: '12px',
    color: theme.colors.textSecondary,
  },
  itemList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '0 16px 16px',
    maxHeight: '40vh',
    overflowY: 'auto',
  },
  emptyText: {
    textAlign: 'center',
    padding: '20px',
    color: theme.colors.textSecondary,
    fontFamily: theme.fonts.body,
    fontSize: '14px',
  },
  itemCard: {
    padding: '12px',
    borderRadius: '4px',
    border: '2px solid',
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  itemIcon: {
    fontSize: '16px',
  },
  itemName: {
    flex: 1,
    fontFamily: theme.fonts.title,
    fontSize: '14px',
    fontWeight: 'bold',
  },
  itemPower: {
    fontSize: '12px',
    fontWeight: 'bold',
    color: theme.colors.textGold,
  },
  itemDesc: {
    fontFamily: theme.fonts.body,
    fontSize: '12px',
    color: theme.colors.textSecondary,
    lineHeight: 1.4,
  },
};
