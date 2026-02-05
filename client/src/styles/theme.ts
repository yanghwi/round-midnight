// 픽셀 던전 스타일 테마
export const theme = {
  // 색상
  colors: {
    // 배경
    bgDarkest: '#0f0f1a',     // 칠흑 보라 (가장 어두운 배경)
    bgDark: '#1a1a2e',        // 어두운 남색 (메인 배경)
    bgMedium: '#252542',      // 중간 보라 (카드 배경)

    // 강조
    primary: '#7c3aed',       // 보라 (Primary 강조)
    secondary: '#4f46e5',     // 인디고 (Secondary)
    accent: '#06b6d4',        // 시안 (포인트)

    // 텍스트
    textPrimary: '#f8fafc',   // 흰색 (메인)
    textSecondary: '#94a3b8', // 회색 (보조)
    textGold: '#fbbf24',      // 금색 (강조 텍스트)

    // 상태
    success: '#22c55e',       // 녹색 (성공/시작)
    danger: '#ef4444',        // 빨강 (위험/에러)

    // 테두리
    borderLight: '#a78bfa',   // 밝은 보라 (버튼 테두리)
    borderMedium: '#4f46e5',  // 중간 보라 (입력 테두리)
  },

  // 전투 결과별 색상
  combatResults: {
    perfect: {
      bg: 'rgba(6, 78, 59, 0.95)',      // emerald-900
      border: '#34d399',                 // emerald-400
      text: '#a7f3d0',                   // emerald-200
    },
    victory: {
      bg: 'rgba(20, 83, 45, 0.95)',     // green-900
      border: '#4ade80',                 // green-400
      text: '#bbf7d0',                   // green-200
    },
    narrow: {
      bg: 'rgba(113, 63, 18, 0.95)',    // yellow-900
      border: '#facc15',                 // yellow-400
      text: '#fef08a',                   // yellow-200
    },
    defeat: {
      bg: 'rgba(124, 45, 18, 0.95)',    // orange-900
      border: '#fb923c',                 // orange-400
      text: '#fed7aa',                   // orange-200
    },
    wipe: {
      bg: 'rgba(127, 29, 29, 0.95)',    // red-900
      border: '#f87171',                 // red-400
      text: '#fecaca',                   // red-200
    },
  },

  // 아이템 희귀도 색상
  rarity: {
    legendary: { bg: 'rgba(234, 88, 12, 0.5)', text: '#fed7aa' },
    rare: { bg: 'rgba(147, 51, 234, 0.5)', text: '#e9d5ff' },
    uncommon: { bg: 'rgba(37, 99, 235, 0.5)', text: '#bfdbfe' },
    common: { bg: 'rgba(107, 114, 128, 0.5)', text: '#e5e7eb' },
  },

  // 폰트 (Noto Sans KR로 통일 - 모바일 가독성)
  fonts: {
    title: "'Noto Sans KR', sans-serif",
    body: "'Noto Sans KR', sans-serif",
  },

  // 테두리 (픽셀 스타일)
  borders: {
    primary: '2px solid #a78bfa',
    secondary: '2px solid #4f46e5',
    accent: '2px solid #06b6d4',
    card: '2px solid #4f46e5',
    dashed: '2px dashed #4f46e5',
  },
} as const;
