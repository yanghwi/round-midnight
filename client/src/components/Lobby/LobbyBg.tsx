/**
 * 로비/캐릭터 설정 공유 배경 — EarthBound 사이키델릭 스타일
 * psychedelic-bg + checker-overlay + scanlines + stars
 */
const STARS = [
  { top: '8%', left: '5%' },
  { top: '12%', left: '18%' },
  { top: '5%', left: '35%' },
  { top: '18%', left: '42%' },
  { top: '10%', left: '55%' },
  { top: '25%', left: '22%' },
  { top: '30%', left: '62%' },
  { top: '15%', left: '72%' },
  { top: '7%', left: '78%' },
  { top: '22%', left: '88%' },
  { top: '35%', left: '95%' },
  { top: '3%', left: '48%' },
  { top: '28%', left: '8%' },
  { top: '40%', left: '75%' },
  { top: '15%', left: '3%' },
];

export default function LobbyBg() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      <div className="psychedelic-bg" />
      <div className="checker-overlay" />
      <div className="absolute inset-0 z-[2]">
        {STARS.map((s, i) => (
          <div key={i} className="lobby-star" style={{ top: s.top, left: s.left }} />
        ))}
      </div>
      <div className="scanlines" />
    </div>
  );
}
