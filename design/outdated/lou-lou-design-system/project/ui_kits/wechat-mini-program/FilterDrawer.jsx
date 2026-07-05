// Lou Lou — Filter drawer for the guardian search results.
//
// Layout (bottom sheet):
//   ┌──────────────────────────────────────────┐
//   │  筛选 (X)                  重置全部   ×  │   ← sticky header
//   ├──────────────────────────────────────────┤
//   │  距离          [chip row]                │
//   │  评分          [chip row]                │
//   │  价格范围      [dual slider ¥0–¥500]     │
//   │  ── divider ──                           │
//   │  居住环境      ☐☐☐  更多 ∨               │
//   │  家中宠物情况  ☐☐☐  更多 ∨               │
//   │  家中儿童情况  ☐☐☐                       │
//   │  其他          ☐☐☐  更多 ∨               │
//   ├──────────────────────────────────────────┤
//   │  [   查看 N 位守护者   ]                  │   ← sticky footer
//   └──────────────────────────────────────────┘
//
// Selections live-update the parent's filter state — there is no separate
// "Apply" step. The footer button just closes the drawer and reports the
// final match count (which is also visible in the result list underneath).

// ─── Filter dictionary (4 groups, in spec order) ────────────
const FILTER_GROUPS = [
  {
    id: 'env',
    title: '居住环境',
    options: [
      '独立房屋（非公寓）',
      '有围栏院子',
      '允许宠物上沙发',
      '允许宠物上床',
      '无烟家庭',
    ],
  },
  {
    id: 'pets',
    title: '家中宠物情况',
    options: [
      '家中无狗',
      '家中无猫',
      '每次只接一单',
      '家中无笼养宠物',
    ],
  },
  {
    id: 'kids',
    title: '家中儿童情况',
    options: [
      '家中无儿童',
      '无0–5岁儿童',
      '无6–12岁儿童',
    ],
  },
  {
    id: 'other',
    title: '其他',
    options: [
      '可接受未绝育母狗',
      '可接受未绝育公狗',
      '提供洗澡/美容服务',
      '具备宠物急救/CPR证书',
      '可喂药',
      '可接受大型犬（25kg以上）',
    ],
  },
];

const DISTANCE_OPTS = ['全部', '< 1 km', '< 3 km', '< 5 km', '< 10 km'];
const RATING_OPTS   = ['全部', '≥ 4.5', '≥ 4.8', '5.0'];

function defaultFilters() {
  return {
    distance: '全部',
    rating: '全部',
    price: [0, 500],
    selections: {},   // { '<groupId>:<option>': true }
  };
}

function countFilters(f) {
  let n = 0;
  if (f.distance && f.distance !== '全部') n++;
  if (f.rating   && f.rating   !== '全部') n++;
  if (f.price[0] > 0 || f.price[1] < 500)   n++;
  n += Object.values(f.selections).filter(Boolean).length;
  return n;
}

Object.assign(window, { FILTER_GROUPS, DISTANCE_OPTS, RATING_OPTS, defaultFilters, countFilters });

// ─── FilterDrawer ────────────────────────────────────────────
function FilterDrawer({ open, filters, onChange, matchCount, onClose }) {
  const drawerRef = React.useRef(null);
  const bodyRef = React.useRef(null);
  const [scrollPct, setScrollPct] = React.useState(0);

  // Lock scroll on the nearest scrollable ancestor (the iOS frame's
  // content scroller in app.jsx) while the drawer is open, so dragging
  // the drawer body doesn't bleed scroll into the background list.
  React.useEffect(() => {
    if (!open || !drawerRef.current) return;
    let el = drawerRef.current.parentElement;
    while (el) {
      const s = getComputedStyle(el);
      if (s.overflowY === 'auto' || s.overflowY === 'scroll') break;
      el = el.parentElement;
    }
    if (!el) return;
    const orig = el.style.overflow;
    el.style.overflow = 'hidden';
    return () => { el.style.overflow = orig; };
  }, [open]);

  // Update progress-bar position as the drawer body scrolls
  React.useEffect(() => {
    if (!open) return;
    const b = bodyRef.current;
    if (!b) return;
    const onScroll = () => {
      const max = b.scrollHeight - b.clientHeight;
      setScrollPct(max <= 0 ? 0 : (b.scrollTop / max) * 100);
    };
    onScroll();
    b.addEventListener('scroll', onScroll, { passive: true });
    return () => b.removeEventListener('scroll', onScroll);
  }, [open]);

  if (!open) return null;

  const count = countFilters(filters);
  const reset = () => onChange(defaultFilters());
  const setField = (k, v) => onChange({ ...filters, [k]: v });
  const setSelection = (key, on) => {
    const next = { ...filters.selections };
    if (on) next[key] = true;
    else delete next[key];
    onChange({ ...filters, selections: next });
  };

  return (
    <>
      {/* Inline stylesheet — visible custom scrollbar on the drawer body
          (the global stylesheet hides all webkit scrollbars). */}
      <style>{`
        .ll-filter-body::-webkit-scrollbar { display: block !important; width: 0; }
      `}</style>

      {/* Scrim — also catches wheel/touch so background can't scroll */}
      <div
        onClick={onClose}
        onWheel={(e) => e.preventDefault()}
        onTouchMove={(e) => e.preventDefault()}
        style={{
          position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 85,
          touchAction: 'none',
        }}
      />

      <div ref={drawerRef} style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 86,
        background: '#fff',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        height: '88%',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.10)',
        fontFamily: LL.font,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Sticky header — title + count + reset + close */}
        <div style={{
          padding: '12px 14px 10px', flex: '0 0 auto',
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          borderBottom: `1px solid ${LL.border}`,
        }}>
          <div style={{ width: 38, height: 4, borderRadius: 2, background: LL.border, margin: '0 auto 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: LL.text, letterSpacing: '-0.01em' }}>
              筛选
              {count > 0 && (
                <span style={{ marginLeft: 6, color: LL.text2, fontWeight: 600, fontSize: 14 }}>({count})</span>
              )}
            </div>
            <button onClick={reset} disabled={count === 0} style={{
              marginLeft: 'auto', border: 0, background: 'transparent',
              color: count > 0 ? LL.text : LL.text3,
              fontSize: 13, fontWeight: 600, fontFamily: LL.font,
              cursor: count > 0 ? 'pointer' : 'default',
              padding: '6px 6px',
            }}>重置全部</button>
            <button onClick={onClose} aria-label="关闭" style={{
              width: 30, height: 30, borderRadius: '50%', border: 0,
              background: '#F0F0F5', color: LL.text, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><i className="ph ph-x" style={{ fontSize: 13 }} /></button>
          </div>
        </div>

        {/* Body + scroll-position progress bar (right rail) */}
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
          <div
            ref={bodyRef}
            className="ll-filter-body"
            style={{
              position: 'absolute', inset: 0,
              overflowY: 'auto', overflowX: 'hidden',
              padding: '6px 14px 14px',
            }}
          >
            {/* Distance */}
            <SectionRow title="距离">
              <ChipRow options={DISTANCE_OPTS} value={filters.distance} onPick={(v) => setField('distance', v)} />
            </SectionRow>

            {/* Rating */}
            <SectionRow title="评分">
              <ChipRow options={RATING_OPTS} value={filters.rating} onPick={(v) => setField('rating', v)} />
            </SectionRow>

            {/* Price range */}
            <SectionRow title="价格范围">
              <RangeSlider
                min={0} max={500} step={10}
                value={filters.price}
                onChange={(v) => setField('price', v)}
                formatValue={(n, isMax) => (isMax && n >= 500 ? '¥500+' : `¥${n}`)}
                unit="每次"
              />
            </SectionRow>

            {/* The 4 accordion groups */}
            {FILTER_GROUPS.map((g) => (
              <AccordionGroup
                key={g.id}
                title={g.title}
                options={g.options}
                selections={filters.selections}
                groupId={g.id}
                onToggle={setSelection}
              />
            ))}

            <div style={{ height: 8 }} />
          </div>

          {/* Vertical progress rail on the right edge */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: 8, bottom: 8, right: 6, width: 3,
            background: 'rgba(34,40,44,0.06)', borderRadius: 2,
            pointerEvents: 'none',
          }}>
            <div style={{
              position: 'absolute', left: 0, right: 0,
              top: `${Math.max(0, Math.min(100 - 18, scrollPct * 0.82))}%`,
              height: '18%',
              background: LL.ink, borderRadius: 2,
              transition: 'top 80ms linear',
            }} />
          </div>
        </div>

        {/* Sticky footer */}
        <div style={{
          padding: '12px 14px 20px', background: '#fff',
          borderTop: `1px solid ${LL.border}`, flex: '0 0 auto',
        }}>
          <button onClick={onClose} style={{
            width: '100%', height: 46, borderRadius: 999, border: 0,
            background: LL.ink, color: '#fff',
            fontSize: 15, fontWeight: 600, fontFamily: LL.font, cursor: 'pointer',
          }}>查看 {matchCount} 位守护者</button>
        </div>
      </div>
    </>
  );
}

// ─── SectionRow — title + content with bottom divider ────────
function SectionRow({ title, children }) {
  return (
    <div style={{ padding: '14px 0 4px', borderBottom: `1px solid ${LL.border}` }}>
      <div style={{
        fontSize: 14, fontWeight: 700, color: LL.text, paddingBottom: 8,
      }}>{title}</div>
      <div style={{ paddingBottom: 12 }}>{children}</div>
    </div>
  );
}

// ─── ChipRow — single-select chip row used by distance / rating ───
function ChipRow({ options, value, onPick }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {options.map(o => {
        const on = o === value;
        return (
          <button key={o} onClick={() => onPick(o)} style={{
            height: 32, padding: '0 14px', borderRadius: 999, border: 0,
            background: on ? LL.ink : 'rgba(34,40,44,0.05)',
            color: on ? '#fff' : LL.text,
            fontSize: 12.5, fontWeight: on ? 700 : 500, fontFamily: LL.font,
            cursor: 'pointer',
          }}>{o}</button>
        );
      })}
    </div>
  );
}

// ─── RangeSlider — dual-thumb numeric range with live readout ───
function RangeSlider({ min, max, step, value, onChange, formatValue, unit }) {
  const trackRef = React.useRef(null);
  const [a, b] = value;
  const aPct = ((a - min) / (max - min)) * 100;
  const bPct = ((b - min) / (max - min)) * 100;
  const fmt = formatValue || ((n) => String(n));

  const startDrag = (which) => (e) => {
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;
    const move = (ev) => {
      const clientX = ev.touches?.[0]?.clientX ?? ev.clientX;
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const snapped = Math.round((min + pct * (max - min)) / step) * step;
      if (which === 'a') onChange([Math.min(snapped, b - step), b]);
      else               onChange([a, Math.max(snapped, a + step)]);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  return (
    <div>
      {/* Readout */}
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        paddingBottom: 10,
      }}>
        <div style={{
          fontSize: 16, fontWeight: 700, color: LL.text,
          fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em',
        }}>
          {fmt(a, false)}
          <span style={{ margin: '0 6px', color: LL.text3 }}>—</span>
          {fmt(b, true)}
        </div>
        {unit && <div style={{ fontSize: 11.5, color: LL.text2 }}>{unit}</div>}
      </div>

      {/* Track */}
      <div
        ref={trackRef}
        style={{
          position: 'relative', height: 28,
          margin: '0 12px', // leave room for thumbs at edges
          touchAction: 'none',
        }}
      >
        {/* Inactive base */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '50%', height: 4,
          background: LL.border, borderRadius: 2, transform: 'translateY(-50%)',
        }} />
        {/* Active range */}
        <div style={{
          position: 'absolute', left: `${aPct}%`, width: `${bPct - aPct}%`,
          top: '50%', height: 4, background: LL.ink, borderRadius: 2,
          transform: 'translateY(-50%)',
        }} />
        {/* Thumb A */}
        <div
          onPointerDown={startDrag('a')}
          style={thumbStyle(aPct, 3)}
        />
        {/* Thumb B */}
        <div
          onPointerDown={startDrag('b')}
          style={thumbStyle(bPct, 4)}
        />
      </div>
    </div>
  );
}

function thumbStyle(pct, z) {
  return {
    position: 'absolute', left: `${pct}%`, top: '50%',
    width: 22, height: 22, borderRadius: '50%',
    background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2), 0 0 0 1.5px rgba(34,40,44,0.95)',
    transform: 'translate(-50%, -50%)', cursor: 'grab',
    zIndex: z, touchAction: 'none',
  };
}

// ─── AccordionGroup — collapsed by default; expands on press ───
function AccordionGroup({ title, options, selections, groupId, onToggle }) {
  const [open, setOpen] = React.useState(false);
  const selectedCount = options.reduce((n, o) => n + (selections[`${groupId}:${o}`] ? 1 : 0), 0);

  return (
    <div style={{ borderTop: `1px solid ${LL.border}` }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 0', border: 0, background: 'transparent',
          cursor: 'pointer', fontFamily: LL.font, textAlign: 'left',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: LL.text }}>{title}</span>
        {selectedCount > 0 && (
          <span style={{
            background: LL.ink, color: '#fff', borderRadius: 999,
            padding: '0 7px', minWidth: 18, height: 18,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
          }}>{selectedCount}</span>
        )}
        <span style={{ marginLeft: 'auto', color: LL.text3 }}>
          <i className={`ph ph-caret-${open ? 'up' : 'down'}`} style={{ fontSize: 14 }} />
        </span>
      </button>
      {open && (
        <div style={{ padding: '0 0 10px' }}>
          {options.map((o) => {
            const key = `${groupId}:${o}`;
            const on = !!selections[key];
            return (
              <button
                key={o}
                onClick={() => onToggle(key, !on)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 0', border: 0, background: 'transparent',
                  cursor: 'pointer', fontFamily: LL.font, textAlign: 'left',
                }}
              >
                <span style={{
                  width: 20, height: 20, borderRadius: 5, flex: '0 0 auto',
                  background: on ? LL.ink : '#fff',
                  boxShadow: on ? 'none' : `inset 0 0 0 1.5px ${LL.text3}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 120ms ease',
                }}>
                  {on && (
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2.5 6.2 L5 8.6 L9.5 3.6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </span>
                <span style={{ fontSize: 14, color: LL.text, fontWeight: on ? 600 : 500 }}>{o}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── CheckboxGroup (legacy — kept for compatibility) ──────────
function CheckboxGroup({ title, options, selections, groupId, onToggle }) {
  const [expanded, setExpanded] = React.useState(false);
  const collapsible = options.length > 3;
  const visible = expanded ? options : options.slice(0, 3);

  return (
    <div style={{ padding: '14px 0 0', borderBottom: `1px solid ${LL.border}` }}>
      <div style={{
        fontSize: 14, fontWeight: 700, color: LL.text, paddingBottom: 4,
      }}>{title}</div>
      <div>
        {visible.map((o) => {
          const key = `${groupId}:${o}`;
          const on = !!selections[key];
          return (
            <button
              key={o}
              onClick={() => onToggle(key, !on)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 0', border: 0, background: 'transparent',
                cursor: 'pointer', fontFamily: LL.font, textAlign: 'left',
              }}
            >
              <span style={{
                width: 20, height: 20, borderRadius: 5, flex: '0 0 auto',
                background: on ? LL.ink : '#fff',
                boxShadow: on ? 'none' : `inset 0 0 0 1.5px ${LL.text3}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 120ms ease',
              }}>
                {on && (
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2.5 6.2 L5 8.6 L9.5 3.6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                )}
              </span>
              <span style={{ fontSize: 14, color: LL.text, fontWeight: on ? 600 : 500 }}>{o}</span>
            </button>
          );
        })}
      </div>
      {collapsible && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            border: 0, background: 'transparent',
            color: LL.text2, fontSize: 12.5, fontWeight: 500, fontFamily: LL.font,
            cursor: 'pointer', padding: '6px 0 12px',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
        >
          {expanded ? '收起' : '更多'}
          <i className={`ph ph-caret-${expanded ? 'up' : 'down'}`} style={{ fontSize: 12 }} />
        </button>
      )}
    </div>
  );
}

// ─── Apply filters to a list of guardians ───────────────────
// Distance/rating/price are real numeric filters. Group selections (居住环境
// etc.) don't map onto our mock data, so they count toward the "active" tally
// but don't currently exclude any guardian. Wire to backend later.
function applyFilters(list, f) {
  return list.filter(g => {
    if (f.distance && f.distance !== '全部') {
      const km = parseFloat(f.distance.replace(/[^\d.]/g, ''));
      if (!isNaN(km) && g.dist >= km) return false;
    }
    if (f.rating && f.rating !== '全部') {
      const min = parseFloat(f.rating.replace(/[^\d.]/g, ''));
      if (!isNaN(min) && g.rating < min) return false;
    }
    if (g.price < f.price[0]) return false;
    if (f.price[1] < 500 && g.price > f.price[1]) return false;
    return true;
  });
}

Object.assign(window, { FilterDrawer, applyFilters });
