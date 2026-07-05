// Lou Lou — Reusable components
// Loads after icons.jsx (uses Iback, Isearch, etc. from window).

const LL = {
  ink: '#22282C',
  inkPress: '#1A1F23',
  inkDisabled: 'rgba(34,40,44,0.5)',
  text: '#1E1E24',
  text2: '#6B6B7A',
  text3: '#A0A0B0',
  bg: '#F8F8FC',
  surface: '#FFFFFF',
  border: '#EEEEF2',
  butter: '#FEE7A6',
  lavender: '#D8CAE8',
  mint: '#C7E8D8',
  peach: '#FBD3C4',
  font: '-apple-system, "SF Pro Text", "PingFang SC", "Helvetica Neue", "Microsoft YaHei", Roboto, sans-serif',
};
window.LL = LL;

// ───────────────────────── CTA ─────────────────────────
function CTAButton({ children, onClick, disabled = false, loading = false, full = true, secondary = false }) {
  const [pressed, setPressed] = React.useState(false);
  const bg = disabled ? LL.inkDisabled
    : pressed ? LL.inkPress
    : secondary ? '#FFFFFF' : LL.ink;
  const color = secondary ? LL.text : '#fff';
  const border = secondary ? `1px solid ${LL.border}` : '0';
  return (
    <button
      onClick={disabled || loading ? undefined : onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        width: full ? '100%' : 'auto',
        height: 52,
        padding: full ? 0 : '0 24px',
        borderRadius: 999,
        background: bg,
        color,
        border,
        fontSize: 15,
        fontWeight: 600,
        fontFamily: LL.font,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 120ms ease, transform 120ms ease',
        transform: pressed && !disabled ? 'scale(0.985)' : 'scale(1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
    >
      {loading && (
        <span style={{
          width: 16, height: 16, borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
          animation: 'll-spin 0.8s linear infinite',
        }} />
      )}
      {children}
    </button>
  );
}

// ───────────────────────── Top Nav ─────────────────────────
function TopNav({ title, onBack, trailing = null, transparent = false }) {
  return (
    <div style={{
      height: 56, display: 'flex', alignItems: 'center', padding: '0 16px',
      background: transparent ? 'transparent' : LL.bg, gap: 12,
      position: 'sticky', top: 0, zIndex: 30,
    }}>
      {onBack ? (
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: '50%', border: 0,
          background: LL.ink, color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Iback size={18} sw={2.4} />
        </button>
      ) : <div style={{ width: 40 }} />}
      <div style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 16, color: LL.text }}>{title}</div>
      <div style={{ width: 40, display: 'flex', justifyContent: 'flex-end' }}>{trailing}</div>
    </div>
  );
}

// ───────────────────────── Hero Header (Home) ─────────────────────────
// The dark pill with avatar + paw badge + bell, like in moodboard
function HeroPill({ onBell }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto',
      background: LL.ink, borderRadius: 999, padding: 4, width: 'fit-content',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%', overflow: 'hidden',
        background: LL.butter, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
      }}>🐶</div>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: LL.butter,
      }}>
        <IpawFill size={20} />
      </div>
      <button onClick={onBell} style={{
        width: 40, height: 40, borderRadius: '50%', border: 0, background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: LL.text,
      }}>
        <Ibell size={18} />
      </button>
    </div>
  );
}

// ───────────────────────── Category Chips ─────────────────────────
function CategoryChips({ items, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 16px', scrollbarWidth: 'none' }}>
      {items.map(it => {
        const on = it === active;
        return (
          <button key={it} onClick={() => onChange(it)} style={{
            height: 34, padding: '0 18px', borderRadius: 999, border: 0,
            background: on ? LL.ink : '#fff',
            color: on ? '#fff' : LL.text,
            fontWeight: on ? 600 : 500, fontSize: 13, fontFamily: LL.font,
            boxShadow: on ? 'none' : `inset 0 0 0 1px ${LL.border}`,
            cursor: 'pointer', flex: '0 0 auto', whiteSpace: 'nowrap',
          }}>{it}</button>
        );
      })}
    </div>
  );
}

// ───────────────────────── Pet Stage Card ─────────────────────────
function PetStageCard({ title, sub, bg, emoji, onClick, offset = 0 }) {
  return (
    <div onClick={onClick} style={{
      position: 'relative', background: bg, borderRadius: 16,
      padding: '14px 16px 16px', height: 184, overflow: 'hidden',
      marginTop: offset, cursor: 'pointer',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(255,255,255,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(0,0,0,0.55)',
      }}><Ichart size={16} /></div>

      <div style={{
        position: 'absolute', right: -10, top: -4, fontSize: 180, lineHeight: 1,
        filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.12))',
      }}>{emoji}</div>

      <div style={{ position: 'absolute', left: 16, bottom: 44, fontWeight: 700, fontSize: 16, color: LL.text }}>{title}</div>
      <div style={{ position: 'absolute', left: 16, bottom: 18, fontSize: 12, color: 'rgba(30,30,36,0.62)' }}>{sub}</div>

      <div style={{
        position: 'absolute', right: 14, bottom: 14,
        width: 32, height: 32, borderRadius: '50%',
        background: 'rgba(255,255,255,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}><Iarrow size={14} sw={2.2} /></div>
    </div>
  );
}

// ───────────────────────── Attribute Tag (pastel block) ─────────────────────────
function AttrTag({ label, value, bg }) {
  return (
    <div style={{
      flex: 1, background: bg, borderRadius: 14, padding: '10px 12px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: LL.text }}>{label}</div>
      <div style={{ fontSize: 12, color: 'rgba(30,30,36,0.62)' }}>{value}</div>
    </div>
  );
}

// ───────────────────────── Stat Tile ─────────────────────────
function StatTile({ label, value, unit, bg }) {
  return (
    <div style={{
      flex: 1, background: bg, borderRadius: 16, padding: '14px 16px', minHeight: 92,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <div style={{ fontSize: 12, color: 'rgba(30,30,36,0.6)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: LL.text, letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
        {value}<span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(30,30,36,0.55)', marginLeft: 2 }}>{unit}</span>
      </div>
    </div>
  );
}

// ───────────────────────── Progress Ring ─────────────────────────
function ProgressRing({ percent = 75, target = '60 min' }) {
  const size = 200, sw = 14, r = (size - sw) / 2, C = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="ll-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#FEE7A6"/>
            <stop offset="35%"  stopColor="#D8CAE8"/>
            <stop offset="70%"  stopColor="#C7E8D8"/>
            <stop offset="100%" stopColor="#FBD3C4"/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="#EEEEF2" strokeWidth={sw} fill="none" />
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke="url(#ll-ring)" strokeWidth={sw} fill="none"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - percent / 100)}
          strokeLinecap="round"
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 30, fontWeight: 700, color: LL.text, letterSpacing: '-0.02em' }}>{percent}%</div>
        <div style={{ fontSize: 13, color: LL.text2, marginTop: 2 }}>目标 {target}</div>
      </div>
    </div>
  );
}

// ───────────────────────── Bottom Tab Bar ─────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 78, paddingBottom: 18,
      background: '#fff', borderTop: `1px solid ${LL.border}`,
      display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
      fontFamily: LL.font, zIndex: 20,
    }}>
      {tabs.map(t => {
        const on = t.id === active;
        const Cmp = on ? t.iconOn : t.icon;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            border: 0, background: 'transparent', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 2, color: on ? LL.text : LL.text3,
          }}>
            <Cmp size={24} />
            <span style={{ fontSize: 10.5, fontWeight: on ? 600 : 500 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ───────────────────────── Rating pill ─────────────────────────
function RatingPill({ value = 4.7 }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px',
      background: LL.ink, color: '#fff', borderRadius: 999, fontSize: 13, fontWeight: 600,
    }}>
      <span style={{ display: 'flex', gap: 1 }}>
        {[0,1,2,3,4].map(i => <Istar key={i} size={11} color="#F0B100"/>)}
      </span>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

Object.assign(window, {
  CTAButton, TopNav, HeroPill, CategoryChips, PetStageCard,
  AttrTag, StatTile, ProgressRing, TabBar, RatingPill,
});
