// Lou Lou — Search-card pickers
//
// Three bottom-sheet pickers that drive the home search card:
//   · ServicePickerSheet      grouped service-type picker (在守护者家 / 在宠主家)
//   · DateRangePickerSheet    Form A — 2-month calendar with range select
//                              (寄养 · 日托 · 住家守护)
//   · SchedulePickerSheet     Form B — frequency + dates + time-period panel
//                              (遛狗 · 上门服务)
//
// Past dates are greyed out across both calendars. The owning screen drives
// open/close state and passes the current draft back into the picker so the
// sheet always reflects what the search card shows.

// ─── Service catalogue ───────────────────────────────────────
const SERVICE_GROUPS = [
  {
    title: '在守护者家',
    items: [
      { id: '寄养', hint: '24小时照护' },
      { id: '日托', hint: '白天看护，当天接送' },
    ],
  },
  {
    title: '在宠主家',
    items: [
      { id: '遛狗',     hint: '至少30分钟' },
      { id: '上门喂养', hint: '查看、喂食、换水、铲屎等至少30分钟' },
      { id: '伴宠留宿', hint: '守护者上门陪伴/过夜' },
    ],
  },
];

// Which date/time form applies — 'A' = range calendar, 'B' = schedule panel
const SERVICE_FORM = {
  '寄养': 'A', '日托': 'A', '伴宠留宿': 'A',
  '遛狗': 'B', '上门喂养': 'B',
};

// Unit shown in summary ("共 X 晚" vs "共 X 天")
const SERVICE_UNIT = {
  '寄养': '晚', '日托': '天', '伴宠留宿': '晚',
};

Object.assign(window, { SERVICE_GROUPS, SERVICE_FORM, SERVICE_UNIT });

// ─── Date utilities ──────────────────────────────────────────
const WEEK_CN_SUN_FIRST = ['日', '一', '二', '三', '四', '五', '六'];
const WEEK_CN_MON_FIRST = ['一', '二', '三', '四', '五', '六', '日'];

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }

// ─── China public holidays (2025–2026) — 国务院公告，节假日服务一般加价 ───
const CN_HOLIDAYS = {
  // 2025
  '2025-10-01': '国庆', '2025-10-02': '国庆', '2025-10-03': '国庆',
  '2025-10-04': '国庆', '2025-10-05': '国庆', '2025-10-06': '中秋',
  '2025-10-07': '国庆', '2025-10-08': '国庆',
  // 2026
  '2026-01-01': '元旦',
  '2026-02-16': '除夕', '2026-02-17': '春节', '2026-02-18': '春节',
  '2026-02-19': '春节', '2026-02-20': '春节', '2026-02-21': '春节',
  '2026-02-22': '春节', '2026-02-23': '春节', '2026-02-24': '春节',
  '2026-04-04': '清明', '2026-04-05': '清明', '2026-04-06': '清明',
  '2026-05-01': '劳动节', '2026-05-02': '劳动节', '2026-05-03': '劳动节',
  '2026-05-04': '劳动节', '2026-05-05': '劳动节',
  '2026-06-19': '端午', '2026-06-20': '端午', '2026-06-21': '端午',
  '2026-09-25': '中秋', '2026-09-26': '中秋', '2026-09-27': '中秋',
  '2026-10-01': '国庆', '2026-10-02': '国庆', '2026-10-03': '国庆',
  '2026-10-04': '国庆', '2026-10-05': '国庆', '2026-10-06': '国庆',
  '2026-10-07': '国庆', '2026-10-08': '国庆',
};
function holidayLabel(d) {
  if (!d) return null;
  const k = d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
  return CN_HOLIDAYS[k] || null;
}
function sameDay(a, b)  { return !!(a && b) && startOfDay(a).getTime() === startOfDay(b).getTime(); }
function dayBefore(a, b){ return startOfDay(a) <  startOfDay(b); }
function daysBetween(a, b) { return Math.round((startOfDay(b) - startOfDay(a)) / 86400000); }
function fmtShort(d) { return d ? `${d.getMonth() + 1}月${d.getDate()}日` : ''; }
function fmtFull(d)  { return d ? `${d.getMonth() + 1}月${d.getDate()}日 周${WEEK_CN_SUN_FIRST[d.getDay()]}` : ''; }

Object.assign(window, { fmtShort, fmtFull, daysBetween });

// ─── CalendarMonth — single month grid (Mon-first) ───────────
function CalendarMonth({ year, month, start, end }, _) {} // (forward decl placeholder, real below)

function CalendarMonthImpl({ year, month, start, end, onTap, showHeader = true }) {
  const today = startOfDay(new Date());
  const first = new Date(year, month, 1);
  const dim = new Date(year, month + 1, 0).getDate();
  // Monday-first: convert getDay (0=Sun..6=Sat) → 0=Mon..6=Sun
  const startCol = (first.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < startCol; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);

  const stateFor = (cell) => {
    if (!cell) return 'empty';
    if (dayBefore(cell, today)) return 'past';
    const isStart = sameDay(cell, start);
    const isEnd   = sameDay(cell, end);
    if (isStart && isEnd) return 'single';
    if (isStart) return 'start';
    if (isEnd)   return 'end';
    if (start && end && !dayBefore(cell, start) && dayBefore(cell, end)) return 'middle';
    if (sameDay(cell, today)) return 'today';
    return 'normal';
  };

  return (
    <div style={{ marginBottom: 4 }}>
      {showHeader && (
        <div style={{
          fontSize: 13, fontWeight: 700, color: LL.text,
          padding: '6px 4px 8px', textAlign: 'center',
        }}>{year}年{month + 1}月</div>
      )}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
        rowGap: 0,
      }}>
        {WEEK_CN_MON_FIRST.map(w => (
          <div key={w} style={{
            textAlign: 'center', fontSize: 10, color: LL.text3,
            padding: '0 0 2px', fontWeight: 500,
          }}>{w}</div>
        ))}
        {cells.map((cell, i) => {
          const s = stateFor(cell);
          if (s === 'empty') return <div key={i} style={{ height: 49 }} />;
          const isToday = sameDay(cell, today);
          const isPast = s === 'past';
          const isEdge = s === 'start' || s === 'end' || s === 'single';

          const holiday = holidayLabel(cell);
          const subLabel = isToday ? '今天' : (holiday || null);
          // Label always uses same non-edge color so "今天" stays visually consistent
          const labelColor = isPast ? LL.text3 : (holiday ? '#E5484D' : LL.text2);
          const numColor = isEdge ? '#fff'
            : (isPast ? LL.text3 : (holiday ? '#E5484D' : LL.text));
          // Layout constants — label above, box below, range fill aligned to box
          const LABEL_H = 12; // px reserved for 今天/holiday label row
          const BOX_H   = 32; // px height of the selection box / circle
          const PAD_TOP  = 1; // px top padding in cell

          return (
            <button
              key={i}
              onClick={() => !isPast && onTap(cell)}
              disabled={isPast}
              style={{
                height: LABEL_H + BOX_H + PAD_TOP + 4,
                border: 0, background: 'transparent',
                position: 'relative', cursor: isPast ? 'default' : 'pointer',
                padding: 0, fontFamily: LL.font,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'flex-start',
                paddingTop: PAD_TOP,
              }}
            >
              {/* Range fill — same height as selection box, top-aligned to box start */}
              {s === 'middle' && (
                <div style={{
                  position: 'absolute', left: 0, right: 0,
                  top: PAD_TOP + LABEL_H, height: BOX_H,
                  background: 'rgba(34,40,44,0.08)',
                }} />
              )}
              {s === 'start' && (
                <div style={{
                  position: 'absolute', left: '50%', right: 0,
                  top: PAD_TOP + LABEL_H, height: BOX_H,
                  background: 'rgba(34,40,44,0.08)',
                }} />
              )}
              {s === 'end' && (
                <div style={{
                  position: 'absolute', right: '50%', left: 0,
                  top: PAD_TOP + LABEL_H, height: BOX_H,
                  background: 'rgba(34,40,44,0.08)',
                }} />
              )}

              {/* Label row — always same height, keeps 今天 in fixed position */}
              <div style={{
                height: LABEL_H, fontSize: 8.5, lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: labelColor, fontWeight: 600, letterSpacing: '0.01em',
                position: 'relative', zIndex: 1,
                visibility: subLabel ? 'visible' : 'hidden',
                width: '100%',
              }}>{subLabel || '.'}</div>

              {/* Selection box — rounded rect for ALL edge states */}
              <div style={{
                position: 'relative', zIndex: 1,
                minWidth: BOX_H, height: BOX_H,
                borderRadius: isEdge ? 8 : 0,
                background: isEdge ? LL.ink : 'transparent',
                color: numColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13,
                fontWeight: isEdge ? 700 : (holiday ? 600 : 500),
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
                padding: isEdge ? '0 6px' : 0,
              }}>{cell.getDate()}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── RangeCalendar — single month with month nav (compact) ───
function RangeCalendar({ start, end, onChange }) {
  const today = new Date();
  const [offset, setOffset] = React.useState(0);
  const baseY = today.getFullYear(), baseM = today.getMonth();
  const cur = {
    y: baseY + Math.floor((baseM + offset) / 12),
    m: ((baseM + offset) % 12 + 12) % 12,
  };

  const handle = (d) => {
    if (!start || (start && end)) {
      onChange({ start: d, end: null });
    } else if (dayBefore(d, start) || sameDay(d, start)) {
      onChange({ start: d, end: null });
    } else {
      onChange({ start, end: d });
    }
  };

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '0 2px 4px',
      }}>
        <button onClick={() => setOffset(offset - 1)} disabled={offset <= 0} style={{
          border: 0, background: 'rgba(34,40,44,0.05)', borderRadius: '50%',
          width: 26, height: 26, cursor: offset > 0 ? 'pointer' : 'default',
          color: offset > 0 ? LL.text : LL.text3,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><i className="ph ph-caret-left" style={{ fontSize: 12 }} /></button>
        <div style={{
          flex: 1, textAlign: 'center', fontSize: 13.5, fontWeight: 700, color: LL.text,
          letterSpacing: '-0.01em',
        }}>{cur.y}年{cur.m + 1}月</div>
        <button onClick={() => setOffset(offset + 1)} style={{
          border: 0, background: 'rgba(34,40,44,0.05)', borderRadius: '50%',
          width: 26, height: 26, cursor: 'pointer', color: LL.text,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><i className="ph ph-caret-right" style={{ fontSize: 12 }} /></button>
      </div>
      <CalendarMonthImpl year={cur.y} month={cur.m} start={start} end={end} onTap={handle} showHeader={false} />
    </div>
  );
}

// ─── BottomSheet — reusable shell ────────────────────────────
function BottomSheet({ title, onClose, tall = false, footer = null, children }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 85,
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 86,
        background: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        maxHeight: tall ? '94%' : '78%',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.10)',
        fontFamily: LL.font,
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Drag indicator + title */}
        <div style={{
          padding: '12px 14px 8px', borderTopLeftRadius: 20, borderTopRightRadius: 20,
          flex: '0 0 auto',
        }}>
          <div style={{ width: 38, height: 4, borderRadius: 2, background: LL.border, margin: '0 auto 10px' }} />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: LL.text }}>{title}</div>
            <button onClick={onClose} aria-label="关闭" style={{
              marginLeft: 'auto', width: 30, height: 30, borderRadius: '50%', border: 0,
              background: '#F0F0F5', color: LL.text, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><i className="ph ph-x" style={{ fontSize: 13 }} /></button>
          </div>
        </div>
        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </div>
        {/* Pinned footer */}
        {footer && (
          <div style={{
            padding: '12px 14px 20px', background: '#fff',
            borderTop: `1px solid ${LL.border}`, flex: '0 0 auto',
          }}>{footer}</div>
        )}
      </div>
    </>
  );
}

// ─── ServicePickerSheet — grouped, two sections ──────────────
function ServicePickerSheet({ open, value, onPick, onClose }) {
  if (!open) return null;
  return (
    <BottomSheet title="选择服务类型" onClose={onClose}>
      <div style={{ padding: '4px 0 18px' }}>
        {SERVICE_GROUPS.map((g, gi) => (
          <div key={g.title} style={{ marginTop: gi === 0 ? 0 : 12 }}>
            <div style={{
              fontSize: 11, fontWeight: 600, color: LL.text3,
              padding: '6px 18px 6px', letterSpacing: '0.06em',
            }}>{g.title}</div>
            {g.items.map((it, ii) => {
              const on = value === it.id;
              return (
                <button key={it.id} onClick={() => onPick(it.id)} style={{
                  width: '100%', padding: '13px 18px',
                  background: 'transparent', border: 0, cursor: 'pointer',
                  fontFamily: LL.font,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderTop: ii === 0 ? `1px solid ${LL.border}` : 0,
                  borderBottom: `1px solid ${LL.border}`,
                  textAlign: 'left',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                    <span style={{ fontSize: 15, fontWeight: on ? 700 : 600, color: LL.text }}>{it.id}</span>
                    <span style={{ fontSize: 12, color: LL.text2 }}>{it.hint}</span>
                  </div>
                  {on && <i className="ph-fill ph-check-circle" style={{ fontSize: 18, color: LL.ink, flex: '0 0 auto' }} />}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}

// ─── DateRangePickerSheet — Form A ───────────────────────────
function DateRangePickerSheet({ open, value, svcType, onConfirm, onClose }) {
  const [draft, setDraft] = React.useState(value || { start: null, end: null });
  React.useEffect(() => {
    if (open) setDraft(value || { start: null, end: null });
  }, [open, value]);

  if (!open) return null;

  const unit = SERVICE_UNIT[svcType] || '晚';
  const n = (draft.start && draft.end) ? daysBetween(draft.start, draft.end) : 0;
  const canConfirm = !!(draft.start && draft.end);

  const footer = (
    <div>
      <div style={{
        fontSize: 12.5, color: LL.text2, marginBottom: 10, textAlign: 'center',
        minHeight: 18,
      }}>
        {draft.start && (
          <>
            <span style={{ color: LL.text, fontWeight: 700 }}>{fmtShort(draft.start)}</span>
            <span style={{ margin: '0 6px' }}>→</span>
            <span style={{ color: LL.text, fontWeight: 700 }}>{draft.end ? fmtShort(draft.end) : '...'}</span>
            {n > 0 && (
              <span style={{ marginLeft: 8, color: LL.text2 }}>共 <b style={{ color: LL.text }}>{n}</b> {unit}</span>
            )}
          </>
        )}
        {!draft.start && '请点击日历选择开始日期'}
      </div>
      <button
        disabled={!canConfirm}
        onClick={() => onConfirm(draft)}
        style={{
          width: '100%', height: 46, borderRadius: 999, border: 0,
          background: canConfirm ? LL.ink : LL.inkDisabled,
          color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: LL.font,
          cursor: canConfirm ? 'pointer' : 'not-allowed',
          letterSpacing: '0.18em', textIndent: '0.18em',
        }}>确定</button>
    </div>
  );

  return (
    <BottomSheet title="选择日期" onClose={onClose} tall footer={footer}>
      <div style={{ padding: '4px 14px 12px' }}>
        <RangeCalendar start={draft.start} end={draft.end} onChange={setDraft} />
      </div>
    </BottomSheet>
  );
}

// ─── SchedulePickerSheet — Form B ────────────────────────────
const PERIODS = [
  { id: 'morning',   label: '上午', range: '6:00–12:00'  },
  { id: 'afternoon', label: '下午', range: '12:00–18:00' },
  { id: 'evening',   label: '晚上', range: '18:00–24:00' },
];

function defaultSchedule() {
  return {
    type: 'once', // 'once' | 'recurring'
    dates: { start: null, end: null },
    weekdays: [], // 0..6 (Mon..Sun)
    periods: [],  // subset of PERIODS ids
  };
}

function SchedulePickerSheet({ open, value, svcType, onSearch, onClose, applyLabel }) {
  const [draft, setDraft] = React.useState(value || defaultSchedule());
  const [duration, setDuration] = React.useState(30); // 30 | 60 min
  React.useEffect(() => {
    if (open) setDraft(value || defaultSchedule());
  }, [open, value]);

  if (!open) return null;

  const showDuration = svcType === '遛狗' || svcType === '上门喂养';

  const togglePeriod = (id) =>
    setDraft(d => ({ ...d, periods: d.periods.includes(id) ? d.periods.filter(p => p !== id) : [...d.periods, id] }));
  const toggleWeekday = (i) =>
    setDraft(d => ({ ...d, weekdays: d.weekdays.includes(i) ? d.weekdays.filter(w => w !== i) : [...d.weekdays, i].sort() }));

  const canSearch = (() => {
    if (!draft.periods.length) return false;
    if (draft.type === 'once') return !!draft.dates.start;
    return draft.weekdays.length > 0 && !!draft.dates.start && !!draft.dates.end;
  })();

  const footer = (
    <button
      disabled={!canSearch}
      onClick={() => onSearch(draft)}
      style={{
        width: '100%', height: 48, borderRadius: 999, border: 0,
        background: canSearch ? LL.ink : LL.inkDisabled,
        color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: LL.font,
        cursor: canSearch ? 'pointer' : 'not-allowed',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
      {!applyLabel && <i className="ph ph-magnifying-glass" style={{ fontSize: 18 }} />}
      <span style={{ letterSpacing: applyLabel ? '0.1em' : '0.32em', textIndent: applyLabel ? '0.1em' : '0.32em' }}>
        {applyLabel || '搜索守护者'}
      </span>
    </button>
  );

  return (
    <BottomSheet title={`安排${svcType || '服务'}`} onClose={onClose} tall footer={footer}>
      <div style={{ padding: '8px 14px 12px' }}>
        {/* Section 1 — Schedule type */}
        <SectionLabel>频次</SectionLabel>
        <div style={{ display: 'flex', gap: 10 }}>
          <ScheduleTypeBtn
            on={draft.type === 'once'}
            onClick={() => setDraft({ ...draft, type: 'once' })}
            emoji="📅" label="单次预约"
            sub="选择单天或连续多天"
          />
          <ScheduleTypeBtn
            on={draft.type === 'recurring'}
            onClick={() => setDraft({ ...draft, type: 'recurring' })}
            emoji="🔁" label="每周重复"
            sub="选择固定周几"
          />
        </div>

        {/* Section 2 — Dates */}
        <SectionLabel style={{ marginTop: 18 }}>日期</SectionLabel>
        {draft.type === 'once' ? (
          <RangeCalendar
            start={draft.dates.start} end={draft.dates.end}
            onChange={(d) => setDraft({ ...draft, dates: d })}
          />
        ) : (
          <>
            <div style={{
              fontSize: 11.5, color: LL.text2, padding: '0 2px 6px', lineHeight: 1.5,
            }}>每周哪几天需要服务</div>
            <div style={{
              display: 'flex', gap: 6, justifyContent: 'space-between', marginBottom: 14,
            }}>
              {WEEK_CN_MON_FIRST.map((w, i) => {
                const on = draft.weekdays.includes(i);
                return (
                  <button key={w} onClick={() => toggleWeekday(i)} style={{
                    width: 38, height: 38, borderRadius: '50%', border: 0,
                    background: on ? LL.ink : 'rgba(34,40,44,0.05)',
                    color: on ? '#fff' : LL.text, fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: LL.font,
                  }}>{w}</button>
                );
              })}
            </div>
            <div style={{
              fontSize: 11.5, color: LL.text2, padding: '0 2px 4px', lineHeight: 1.5,
            }}>重复周期</div>
            <RangeCalendar
              start={draft.dates.start} end={draft.dates.end}
              onChange={(d) => setDraft({ ...draft, dates: d })}
            />
          </>
        )}

        {/* Section 3 — Time periods */}
        <SectionLabel style={{ marginTop: 18 }}>时间段</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PERIODS.map(p => {
            const on = draft.periods.includes(p.id);
            return (
              <button key={p.id} onClick={() => togglePeriod(p.id)} style={{
                width: '100%', height: 44, borderRadius: 999, border: 0,
                background: on ? LL.ink : 'rgba(34,40,44,0.04)',
                color: on ? '#fff' : LL.text, fontFamily: LL.font,
                fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 18px',
                boxShadow: on ? 'none' : `inset 0 0 0 1px ${LL.border}`,
              }}>
                <span>{p.label}</span>
                <span style={{ fontSize: 12, opacity: 0.75, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>{p.range}</span>
              </button>
            );
          })}
        </div>
        <div style={{
          fontSize: 11.5, color: LL.text2, padding: '8px 4px 16px', lineHeight: 1.5,
        }}>守护者将在您选择的时间段内上门服务</div>

        {/* 服务时长 section removed from drawer — now lives in booking form */}
      </div>
    </BottomSheet>
  );
}

function ScheduleTypeBtn({ on, onClick, emoji, label, sub }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, padding: '14px 8px 12px', border: 0,
      borderRadius: 14, cursor: 'pointer', fontFamily: LL.font,
      background: on ? '#fff' : 'rgba(34,40,44,0.03)',
      boxShadow: on ? `inset 0 0 0 2px ${LL.ink}` : `inset 0 0 0 1px ${LL.border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      transition: 'box-shadow 120ms ease',
    }}>
      <div style={{ fontSize: 22, lineHeight: 1 }}>{emoji}</div>
      <div style={{ fontSize: 13.5, fontWeight: on ? 700 : 600, color: LL.text }}>{label}</div>
      <div style={{ fontSize: 11, color: LL.text2 }}>{sub}</div>
    </button>
  );
}

function SectionLabel({ children, style }) {
  return (
    <div style={{
      fontSize: 14, fontWeight: 700, color: LL.ink,
      padding: '0 0 8px',
      ...style,
    }}>{children}</div>
  );
}

// ─── Summary helper — used by HomeMarketplaceScreen to render
//      the chosen state inline on the search-card date row.
// ─────────────────────────────────────────────────────────────
function summarizeQuery({ svcType, dateRange, schedule }) {
  if (!svcType) return null;
  const form = SERVICE_FORM[svcType];
  if (form === 'A') {
    if (!dateRange || !dateRange.start || !dateRange.end) return null;
    const n = daysBetween(dateRange.start, dateRange.end);
    const unit = SERVICE_UNIT[svcType] || '晚';
    return `${fmtShort(dateRange.start)} → ${fmtShort(dateRange.end)} · 共 ${n} ${unit}`;
  }
  if (form === 'B') {
    if (!schedule || !schedule.periods?.length) return null;
    const periodLabels = schedule.periods
      .map(id => PERIODS.find(p => p.id === id)?.label)
      .filter(Boolean).join('、');
    if (schedule.type === 'once') {
      if (!schedule.dates.start) return null;
      const dt = schedule.dates.end
        ? `${fmtShort(schedule.dates.start)} → ${fmtShort(schedule.dates.end)}`
        : fmtShort(schedule.dates.start);
      return `${dt} · ${periodLabels}`;
    }
    if (!schedule.weekdays?.length || !schedule.dates.start || !schedule.dates.end) return null;
    const wd = schedule.weekdays.map(i => WEEK_CN_MON_FIRST[i]).join('/');
    return `每周${wd} · ${periodLabels}`;
  }
  return null;
}

Object.assign(window, {
  ServicePickerSheet, DateRangePickerSheet, SchedulePickerSheet,
  summarizeQuery, defaultSchedule,
});
