// Lou Lou — BookingFlowScreen.jsx  v2
// Screens: form → recommendation → success

// ─── Constants ────────────────────────────────────────────────
const BF_MINT = '#C7E8D8';
const BF_MINT_DARK = '#2C7A4B';

const BF_SVC_FORM = {
  '寄养': 'A', '日托': 'A', '住家守护': 'A', '遛狗': 'B', '上门服务': 'B'
};
const BF_SVC_ICON = {
  '寄养': 'house', '日托': 'sun', '遛狗': 'sneaker',
  '上门服务': 'hand-waving', '住家守护': 'moon-stars'
};
const BF_SVC_SUB = {
  '寄养': '在守护者家', '日托': '在守护者家',
  '遛狗': '在你的小区周边', '上门服务': '上门到宠主家',
  '住家守护': '守护者到宠主家过夜'
};

// ─── Mock data ────────────────────────────────────────────────
const BF_MY_PETS = [
{ id: 'p1', name: '豆豆', breed: '金毛', weight: '22公斤', age: '3岁', bg: '#FEE7A6' },
{ id: 'p2', name: '奶茶', breed: '英短', weight: '4.5公斤', age: '2岁', bg: '#FBD3C4' }];

const BF_EXTRAS = [
{ id: 'pickup', label: '守护者上门接送', price: 30, desc: '守护者上门接送您的宠物，省心省力' },
{ id: 'bath', label: '洗澡护理', price: 68, desc: '专业清洁，宠物回家干净舒适' }];

const BF_RECS = [
{ id: 'r1', name: '林若', area: '朝阳区·望京', rating: 4.8, reviews: 96, repeats: 12, price: 78, unit: '晚',
  photo: './assets/guardian1.png' },
{ id: 'r3', name: '桃子', area: '朝阳区·三里屯', rating: 4.9, reviews: 64, repeats: 8, price: 82, unit: '晚',
  photo: './assets/guardian3.png' },
{ id: 'r4', name: '张明', area: '朝阳区·望京', rating: 4.7, reviews: 43, repeats: 5, price: 75, unit: '晚',
  photo: null, bg: '#C7E8D8' }];


// ─── Helpers ──────────────────────────────────────────────────
function bfFmtTime(t) {
  if (!t) return '';
  return `${String(t.h).padStart(2, '0')}:${String(t.m).padStart(2, '0')}`;
}
function bfFmtDate(d) {
  if (!d) return '';
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
function bfDaysBetween(a, b) {
  if (!a || !b) return 0;
  return Math.max(1, Math.round((b - a) / 86400000));
}
function bfIsWithin2Weeks(d) {
  if (!d) return false;
  const today = new Date(2026, 4, 27);
  return (d - today) / 86400000 < 14;
}

// ─── GroupHeader ──────────────────────────────────────────────
function BFGroupHeader({ title }) {
  return (
    <div style={{
      background: '#F5F5F9', padding: '9px 16px 7px',
      fontSize: 12, fontWeight: 600, color: LL.text3, letterSpacing: '0.04em'
    }}>{title}</div>);

}

// ─── Toggle (bold check, no fill bg) ─────────────────────────
function BFToggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: 48, height: 28, borderRadius: 14,
      background: on ? LL.ink : '#D0D0DC',
      position: 'relative', cursor: 'pointer',
      transition: 'background 180ms', flex: '0 0 auto'
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 23 : 3,
        width: 22, height: 22, borderRadius: '50%', background: '#fff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
        transition: 'left 180ms',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {on && <i className="ph-bold ph-check" style={{ fontSize: 12, color: LL.ink }} />}
      </div>
    </div>);

}

// ─── Wheel Column ─────────────────────────────────────────────
function WheelColumn({ items, value, onChange, fmt }) {
  const ITEM_H = 44,PAD = 2 * 44;
  const ref = React.useRef(null);
  const timer = React.useRef(null);
  React.useEffect(() => {
    const idx = items.indexOf(value);
    if (ref.current && idx >= 0) ref.current.scrollTop = idx * ITEM_H;
  }, []); // eslint-disable-line
  const onScroll = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.max(0, Math.min(items.length - 1, Math.round(ref.current.scrollTop / ITEM_H)));
      onChange(items[idx]);
      ref.current.scrollTop = idx * ITEM_H;
    }, 120);
  };
  return (
    <div style={{ flex: 1, position: 'relative', height: 5 * ITEM_H, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: PAD, zIndex: 2,
        background: 'linear-gradient(to bottom,rgba(255,255,255,.96),rgba(255,255,255,0))', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: PAD, zIndex: 2,
        background: 'linear-gradient(to top,rgba(255,255,255,.96),rgba(255,255,255,0))', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: PAD, left: 6, right: 6, height: ITEM_H, zIndex: 0, background: LL.bg, borderRadius: 10 }} />
      <div ref={ref} onScroll={onScroll} style={{ height: '100%', overflowY: 'scroll', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ height: PAD }} />
        {items.map((item, i) =>
        <div key={i} onClick={() => {onChange(item);if (ref.current) ref.current.scrollTop = i * ITEM_H;}}
        style={{ height: ITEM_H, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontVariantNumeric: 'tabular-nums', position: 'relative', zIndex: 1, cursor: 'pointer',
          fontWeight: item === value ? 700 : 400, color: item === value ? LL.text : LL.text3 }}>
            {fmt ? fmt(item) : String(item).padStart(2, '0')}
          </div>
        )}
        <div style={{ height: PAD }} />
      </div>
    </div>);

}

// ─── Time Wheel Sheet ─────────────────────────────────────────
const BF_HOURS = Array.from({ length: 24 }, (_, i) => i);
const BF_MINS = [0, 15, 30, 45];

function TimeWheelSheet({ open, value, onConfirm, onClose, title = '选择时间段' }) {
  const [h, setH] = React.useState(value?.h ?? 9);
  const [m, setM] = React.useState(value?.m ?? 0);
  React.useEffect(() => {if (open) {setH(value?.h ?? 9);setM(value?.m ?? 0);}}, [open]); // eslint-disable-line
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 85 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 86, background: '#fff',
        borderTopLeftRadius: 20, borderTopRightRadius: 20, boxShadow: '0 -8px 24px rgba(0,0,0,0.12)', fontFamily: LL.font }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: LL.border, margin: '12px auto 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px 4px' }}>
          <button onClick={onClose} style={{ background: 'transparent', border: 0, fontSize: 14, color: LL.text3, cursor: 'pointer', fontFamily: LL.font, padding: 0 }}>取消</button>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700, color: LL.text }}>{title}</div>
          <button onClick={() => onConfirm({ h, m })} style={{ background: 'transparent', border: 0, fontSize: 14, fontWeight: 700, color: LL.ink, cursor: 'pointer', fontFamily: LL.font, padding: 0 }}>确定</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 20px 28px', gap: 0 }}>
          <WheelColumn items={BF_HOURS} value={h} onChange={setH} />
          <div style={{ width: 28, textAlign: 'center', fontSize: 20, fontWeight: 700, color: LL.text, paddingBottom: 4, flex: '0 0 auto' }}>:</div>
          <WheelColumn items={BF_MINS} value={m} onChange={setM} fmt={(v) => String(v).padStart(2, '0')} />
        </div>
      </div>
    </>);

}

// ─── Service Picker ───────────────────────────────────────────
function BFServiceSheet({ open, value, options, onPick, onClose }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 85 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 86, background: '#fff',
        borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 24,
        boxShadow: '0 -8px 24px rgba(0,0,0,0.10)', fontFamily: LL.font }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: LL.border, margin: '12px auto 10px' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 12px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: LL.text }}>选择服务类型</div>
          <button onClick={onClose} style={{ marginLeft: 'auto', width: 30, height: 30, borderRadius: '50%', border: 0, background: '#F0F0F5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ph ph-x" style={{ fontSize: 13, color: LL.text }} />
          </button>
        </div>
        {options.map((svc, i) => {
          const on = value === svc.id;
          return (
            <button key={svc.id} onClick={() => onPick(svc.id)} style={{
              width: '100%', padding: '13px 18px', background: 'transparent', border: 0, cursor: 'pointer', fontFamily: LL.font,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: `1px solid ${LL.border}`,
              borderBottom: i === options.length - 1 ? `1px solid ${LL.border}` : 'none', textAlign: 'left'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: on ? 700 : 600, color: LL.text }}>{svc.id}</div>
                <div style={{ fontSize: 12, color: LL.text2, marginTop: 2 }}>{BF_SVC_SUB[svc.id] || ''} · ¥{svc.price}/{svc.unit}起</div>
              </div>
              {on && <i className="ph-fill ph-check-circle" style={{ fontSize: 19, color: LL.ink }} />}
            </button>);

        })}
      </div>
    </>);

}

// ─── Price Bar + Drawer ───────────────────────────────────────
function PriceBar({ service, nights, unitPrice, extras, onOpen }) {
  const extrasTotal = extras.reduce((s, e) => s + (e.on ? e.price : 0), 0);
  const subtotal = unitPrice * nights + extrasTotal;
  const platformFee = Math.round(subtotal * 0.15);
  const total = subtotal + platformFee;
  const svcUnit = BF_SVC_FORM[service] === 'A' ? service === '日托' ? '天' : '晚' : '次';

  return (
    <button onClick={onOpen} style={{
      width: '100%', background: '#fff', border: 0, borderTop: `1px solid ${LL.border}`,
      padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12,
      cursor: 'pointer', fontFamily: LL.font, textAlign: 'left'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: LL.text3, marginBottom: 3 }}>
          {service} · {nights > 0 ? `共${nights}${svcUnit}` : '请选择日期'}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: LL.text }}>
          总计 ¥{nights > 0 ? total : '--'}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 12, color: LL.text3 }}>查看明细</span>
        <i className="ph ph-caret-up" style={{ fontSize: 12, color: LL.text3 }} />
      </div>
    </button>);

}

function PriceDrawer({ open, onClose, service, nights, unitPrice, extras, bottomOffset = 0 }) {
  if (!open) return null;
  const extrasOn = extras.filter((e) => e.on);
  const svcUnit = BF_SVC_FORM[service] === 'A' ? service === '日托' ? '天' : '晚' : '次';
  const svcTotal = unitPrice * nights;
  const extrasTotal = extrasOn.reduce((s, e) => s + e.price, 0);
  const subtotal = svcTotal + extrasTotal;
  const platformFee = Math.round(subtotal * 0.15);
  const total = subtotal + platformFee;
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: bottomOffset, background: 'rgba(0,0,0,0.35)', zIndex: 85 }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: bottomOffset, zIndex: 86, background: '#fff',
        borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: '0 0 4px',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.10)', fontFamily: LL.font }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: LL.border, margin: '12px auto 10px' }} />
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 16px 14px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: LL.text }}>费用明细</div>
          <button onClick={onClose} style={{ marginLeft: 'auto', width: 30, height: 30, borderRadius: '50%', border: 0, background: '#F0F0F5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ph ph-x" style={{ fontSize: 13, color: LL.text }} />
          </button>
        </div>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${LL.border}`, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, color: LL.text2 }}>¥{unitPrice}/{svcUnit} × {nights}{svcUnit}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: LL.text }}>¥{svcTotal}</span>
        </div>
        {extrasOn.map((e) =>
        <div key={e.id} style={{ padding: '10px 16px', borderTop: `1px solid ${LL.border}`, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, color: LL.text2 }}>{e.label}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: LL.text }}>+¥{e.price}</span>
          </div>
        )}
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${LL.border}`, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, color: LL.text2 }}>平台服务费（15%）</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: LL.text }}>¥{platformFee}</span>
        </div>
        <div style={{ padding: '14px 16px', borderTop: `2px solid ${LL.border}`, display: 'flex', justifyContent: 'space-between' }} data-comment-anchor="013aa0a415-div-265-9">
          <span style={{ fontSize: 15, fontWeight: 700, color: LL.text }}>总计</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: LL.text }}>¥{total}</span>
        </div>
      </div>
    </>);

}

// ─── Recommendation Screen ────────────────────────────────────
function RecommendationScreen({ guardian, service, dateRange, pets, message: initMsg, onContact, onSkip }) {
  const [checked, setChecked] = React.useState({ r1: true, r3: false, r4: false });
  const [msg, setMsg] = React.useState(initMsg || '');
  const nearbyWarning = bfIsWithin2Weeks(dateRange?.start);
  const svcUnit = BF_SVC_FORM[service] === 'A' ? service === '日托' ? '天' : '晚' : '次';
  const svc = guardian?.services?.find((s) => s.id === service);
  const petsEnabled = pets ? Object.keys(pets).filter((id) => pets[id]).length : 1;

  const _g1 = window.__resources && window.__resources.guardian1 || './assets/guardian1.png';
  const _g3 = window.__resources && window.__resources.guardian3 || './assets/guardian3.png';
  const photoMap = { r1: _g1, r3: _g3 };

  const anyChecked = Object.values(checked).some(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', position: 'relative' }}>
      {/* Nav */}
      <div style={{ flex: '0 0 auto', height: 52, background: '#fff', borderBottom: `1px solid ${LL.border}`,
        display: 'flex', alignItems: 'center', padding: '0 16px' }}>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700, color: LL.text }}>预约详情</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: LL.bg }}>
        {/* Summary bar */}
        <div style={{ background: '#fff', padding: '14px 16px', borderBottom: `1px solid ${LL.border}` }}>
          <div style={{ fontSize: 12, color: LL.text3, marginBottom: 4 }}>{service}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: LL.text }}>
            从{bfFmtDate(dateRange?.start)}开始
            {' · '}{petsEnabled}只宠物
            {svc ? ` · ¥${svc.price}/${svcUnit}` : ''}
          </div>
          {nearbyWarning &&
          <div style={{ marginTop: 8, display: 'inline-flex', alignItems: 'center',
            background: '#FFF3CD', border: '1px solid #F0B100', borderRadius: 6,
            padding: '3px 10px', fontSize: 12, fontWeight: 700, color: '#B45309' }}>
              临近预约
            </div>
          }
        </div>

        {/* Warning box */}
        {nearbyWarning &&
        <div style={{ margin: '12px 16px 0', padding: '12px 14px', background: '#FFFBEB',
          border: '1px solid #FDE68A', borderRadius: 10,
          display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ fontSize: 16, flex: '0 0 auto', marginTop: 1 }}>ℹ️</span>
            <span style={{ fontSize: 13, color: '#92400E', lineHeight: 1.6 }}>
              距离服务日期不足2周，守护者档期较紧张，建议同时联系更多守护者以提高成功率。
            </span>
          </div>
        }

        {/* Recommended guardians */}
        <div style={{ marginTop: 16, padding: '0 16px' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: LL.text, marginBottom: 4 }}>
            同时联系其他守护者
          </div>
          <div style={{ height: 1, background: LL.border, marginBottom: 12 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BF_RECS.map((rec, i) => {
              const photo = photoMap[rec.id] || rec.photo;
              const on = checked[rec.id];
              return (
                <div key={rec.id} onClick={() => setChecked((c) => ({ ...c, [rec.id]: !c[rec.id] }))} style={{
                  background: '#fff', borderRadius: 14, padding: '14px',
                  display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
                  border: on ? `1.5px solid ${LL.ink}` : `1.5px solid ${LL.border}`,
                  transition: 'border-color 160ms'
                }}>
                  {/* Checkbox */}
                  <div style={{
                    width: 22, height: 22, borderRadius: 4, border: 0, flex: '0 0 auto',
                    background: on ? LL.ink : 'transparent',
                    boxShadow: on ? 'none' : `inset 0 0 0 1.5px ${LL.text3}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 160ms'
                  }}>
                    {on && <i className="ph-bold ph-check" style={{ fontSize: 11, color: '#fff' }} />}
                  </div>
                  {/* Photo */}
                  <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', flex: '0 0 auto',
                    background: rec.bg || LL.lavender }}>
                    {photo && <img src={photo} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: LL.text }}>{rec.name}</div>
                    <div style={{ fontSize: 12, color: LL.text3, marginTop: 2 }}>{rec.area}</div>
                    <div style={{ fontSize: 12, color: LL.text2, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>⭐{rec.rating} · {rec.reviews}条评价</span>
                    </div>
                    <div style={{ fontSize: 12, color: LL.text3, marginTop: 2 }}>
                      🔁 {rec.repeats}位回头宠主
                    </div>
                  </div>
                  {/* Price */}
                  <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: BF_MINT_DARK }}>¥{rec.price}</div>
                    <div style={{ fontSize: 11, color: LL.text3 }}>/{rec.unit}</div>
                  </div>
                </div>);

            })}
          </div>
        </div>

        {/* Message */}
        <div style={{ margin: '16px 16px 0' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: LL.text, marginBottom: 8 }}>留言</div>
          <div style={{ background: '#fff', borderRadius: 12, padding: '12px 14px' }}>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)}
            style={{ width: '100%', minHeight: 80, border: 'none', outline: 'none', resize: 'none',
              fontSize: 14, color: LL.text, lineHeight: 1.7, fontFamily: LL.font,
              background: 'transparent', boxSizing: 'border-box' }}
            placeholder="向守护者介绍您的宠物和需求…" />
          </div>
        </div>
        <div style={{ height: 16 }} />
      </div>

      {/* Bottom buttons */}
      <div style={{ flex: '0 0 auto', background: '#fff', borderTop: `1px solid ${LL.border}`, padding: '12px 16px 28px' }}>
        <button onClick={() => onContact(checked, msg)} disabled={!anyChecked} style={{
          width: '100%', height: 52, borderRadius: 999, border: 0,
          background: anyChecked ? LL.ink : LL.inkDisabled,
          color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: LL.font,
          cursor: anyChecked ? 'pointer' : 'not-allowed', marginBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.04em'
        }}>联系这些守护者</button>
        <button onClick={onSkip} style={{
          width: '100%', height: 40, background: 'transparent', border: 0,
          fontSize: 14, color: LL.text3, cursor: 'pointer', fontFamily: LL.font
        }}>跳过</button>
      </div>
    </div>);

}

// ─── Success Screen ───────────────────────────────────────────
const BF_STEPS = [
{
  icon: 'clock',
  title: '守护者即将回复',
  desc: '您联系的守护者通常会在30分钟内回复。'
},
{
  icon: 'chat-circle-text',
  title: '安排会面熟悉',
  desc: '守护者回复后，可以约一次服务前的线下见面，让您、您的宠物和守护者互相认识。'
},
{
  icon: 'calendar-check',
  title: '确认预约',
  desc: '见面满意后通过平台完成预约确认和付款，平台全程保障您的权益。'
}];


function BFSuccessScreen({ guardian, onGoToOrders }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', position: 'relative' }}>
      {/* Nav */}
      <div style={{ flex: '0 0 auto', height: 52, background: '#fff', borderBottom: `1px solid ${LL.border}`,
        display: 'flex', alignItems: 'center', padding: '0 16px' }}>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700, color: LL.text }}>预约详情</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', background: LL.bg }}>
        {/* Hero title with checkmark icon */}
        <div style={{ background: '#fff', padding: '36px 28px 28px' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: BF_MINT,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <i className="ph-fill ph-check-circle" style={{ fontSize: 32, color: BF_MINT_DARK }} />
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: LL.text,
            letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            申请已发出
          </div>
        </div>

        {/* Steps */}
        <div style={{ background: '#fff', marginTop: 12 }}>
          {BF_STEPS.map((step, i) =>
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 16,
            padding: '18px 20px',
            borderBottom: i < BF_STEPS.length - 1 ? `1px solid ${LL.border}` : 'none'
          }}>
              {/* Thin-line circle icon */}
              <div style={{
              width: 46, height: 46, borderRadius: '50%',
              border: `1.5px solid ${LL.text3}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flex: '0 0 auto'
            }}>
                <i className={`ph ph-${step.icon}`} style={{ fontSize: 22, color: LL.text2 }} />
              </div>
              {/* Text */}
              <div style={{ flex: 1, paddingTop: 2 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: LL.text, marginBottom: 5 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 13.5, color: LL.text2, lineHeight: 1.65, textWrap: 'pretty' }}>
                  {step.desc}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ padding: '24px 20px 48px' }}>
          <button onClick={onGoToOrders} style={{
            width: '100%', height: 52, borderRadius: 999, border: 0,
            background: LL.ink, color: '#fff',
            fontSize: 15, fontWeight: 700, fontFamily: LL.font,
            cursor: 'pointer', letterSpacing: '0.04em'
          }}>查看申请单状态</button>
        </div>
      </div>
    </div>);

}

// ─── Main: BookingFlowScreen ──────────────────────────────────
function BookingFlowScreen({ guardian, initialService, initialDateRange, initialSchedule, onBack, onSubmit, onGoHome, onGoToOrders }) {
  // ── Resolve initial service
  const resolvedSvc = React.useMemo(() => {
    if (initialService && guardian.services.find((s) => s.id === initialService)) return initialService;
    return guardian.services[0]?.id || '寄养';
  }, []); // eslint-disable-line

  // ── Form state
  const [service, setService] = React.useState(resolvedSvc);
  const [dateRange, setDateRange] = React.useState(initialDateRange || { start: null, end: null });
  const [schedule, setSchedule] = React.useState(initialSchedule || (typeof defaultSchedule === 'function' ? defaultSchedule() : { type: 'once', dates: { start: null, end: null }, weekdays: [], periods: [] }));
  const [duration, setDuration] = React.useState(30);
  const [dropoff, setDropoff] = React.useState(null);
  const [pickup, setPickup] = React.useState(null);
  const [petEnabled, setPetEnabled] = React.useState({ p1: true, p2: true });
  const [extras, setExtras] = React.useState({ pickup: false, bath: false });
  const [smsNotify, setSmsNotify] = React.useState(true);
  const [message, setMessage] = React.useState('');

  // ── Screen state: 'form' | 'recommendation' | 'success'
  const [screen, setScreen] = React.useState('form');

  // ── Picker state
  const [picker, setPicker] = React.useState(null);
  const [priceOpen, setPriceOpen] = React.useState(false);
  const bottomAreaRef = React.useRef(null);
  const [bottomH, setBottomH] = React.useState(0);
  React.useEffect(() => {
    if (bottomAreaRef.current) setBottomH(bottomAreaRef.current.offsetHeight);
  });

  // ── Derived
  const form = BF_SVC_FORM[service] || 'A';
  const isFormB = form === 'B';
  const isHomeguard = service === '住家守护';
  const currentSvc = guardian.services.find((s) => s.id === service);
  const dropoffLabel = isHomeguard ? '守护者到达时间段' : '送达时间段';
  const pickupLabel = isHomeguard ? '守护者离开时间段' : '接回时间段';

  // Night count for price bar
  const nights = React.useMemo(() => {
    if (form === 'A' && dateRange.start && dateRange.end) return bfDaysBetween(dateRange.start, dateRange.end);
    return 0;
  }, [form, dateRange]);

  // Extras array for price bar / drawer
  const extrasArr = BF_EXTRAS.map((e) => ({ ...e, on: extras[e.id] }));

  // Date summary for the date row (Form B only)
  const dateSummaryB = React.useMemo(() => {
    if (!isFormB) return null;
    const mapped = service === '上门服务' ? '遛狗' : service;
    return typeof summarizeQuery === 'function' ? summarizeQuery({ svcType: mapped, dateRange, schedule }) : null;
  }, [isFormB, service, dateRange, schedule]);

  // Auto-fill message
  React.useEffect(() => {
    const petNames = BF_MY_PETS.filter((p) => petEnabled[p.id]).map((p) => p.name).join('和');
    let ds = '';
    if (form === 'A' && dateRange.start) ds = bfFmtDate(dateRange.start);else
    if (form === 'B' && schedule.dates?.start) ds = bfFmtDate(schedule.dates.start);
    const tmpl = ds && petNames ? `您好，请问您${ds}能帮我照看${petNames}吗？` :
    petNames ? `您好，请问您能帮我照看${petNames}吗？` : '';
    setMessage(tmpl);
  }, [petEnabled, dateRange, schedule, form]);

  // ── Handlers
  const handleApply = () => setScreen('recommendation');

  const handleContact = (recChecked, recMsg) => {
    const additionalGuardians = BF_RECS.filter((r) => recChecked[r.id]);
    onSubmit?.({
      guardian, service, dateRange, schedule, additionalGuardians,
      message: recMsg,
      dropoff: dropoff ? bfFmtTime(dropoff) : null,
      pickup: pickup ? bfFmtTime(pickup) : null,
      nights, unitPrice: currentSvc?.price || 0
    });
    setScreen('success');
  };

  const handleSkip = () => {
    onSubmit?.({
      guardian, service, dateRange, schedule, additionalGuardians: [],
      message,
      dropoff: dropoff ? bfFmtTime(dropoff) : null,
      pickup: pickup ? bfFmtTime(pickup) : null,
      nights, unitPrice: currentSvc?.price || 0
    });
    setScreen('success');
  };

  // ── Render: Success
  if (screen === 'success') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
        <BFSuccessScreen guardian={guardian} onGoToOrders={() => onGoToOrders?.()} />
      </div>);

  }

  // ── Render: Recommendation
  if (screen === 'recommendation') {
    return (
      <RecommendationScreen
        guardian={guardian}
        service={service}
        dateRange={dateRange}
        pets={petEnabled}
        message={message}
        onContact={handleContact}
        onSkip={handleSkip} />);


  }

  // ── Render: Main Form
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative', overflow: 'hidden' }}>

      {/* Top Nav */}
      <div style={{ flex: '0 0 auto', height: 52, background: '#fff', borderBottom: `1px solid ${LL.border}`,
        display: 'flex', alignItems: 'center', padding: '0 16px', zIndex: 10 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'transparent', border: 0,
          cursor: 'pointer', fontFamily: LL.font, padding: 0, color: LL.text2, fontSize: 13.5 }}>
          <i className="ph ph-caret-left" style={{ fontSize: 16, color: LL.text2 }} />
          返回
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700, color: LL.text }}>预约详情</div>
        <div style={{ width: 48 }} />
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: LL.bg }}>

        {/* ── 1. 服务 */}
        <div style={{ marginTop: 12 }}>
          <BFGroupHeader title="服务" />
          <button onClick={() => setPicker('service')} style={{
            width: '100%', padding: '15px 16px', background: '#fff', border: 0,
            display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', fontFamily: LL.font, textAlign: 'left'
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: LL.text }}>{service}</div>
              <div style={{ fontSize: 12.5, color: LL.text3, marginTop: 3 }}>{BF_SVC_SUB[service]}</div>
            </div>
            <i className={`ph ph-${BF_SVC_ICON[service]}`} style={{ fontSize: 30, color: LL.text3 }} />
            <i className="ph ph-caret-right" style={{ fontSize: 13, color: LL.text3 }} />
          </button>
        </div>

        {/* ── 2. 时间 */}
        <div style={{ marginTop: 12 }}>
          <BFGroupHeader title="时间" />
          <div style={{ background: '#fff' }}>
            {/* Form A: inline guardian calendar */}
            {!isFormB && typeof GuardianCalendar === 'function' &&
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${LL.border}` }}>
                <GuardianCalendar
                bookedDates={guardian.bookedDates || []}
                svcPrice={currentSvc?.price ?? null}
                svcUnit={currentSvc?.unit ?? '晚'}
                viewOnly={false}
                start={dateRange.start}
                end={dateRange.end}
                onChange={(d) => setDateRange(d)} />
              
              </div>
            }
            {/* Form B: schedule row */}
            {isFormB &&
            <button onClick={() => setPicker('dateB')} style={{
              width: '100%', padding: '14px 16px', background: 'transparent', border: 0,
              display: 'flex', alignItems: 'center', borderBottom: `1px solid ${LL.border}`,
              cursor: 'pointer', fontFamily: LL.font, textAlign: 'left'
            }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: LL.text, flex: 1 }}>日期与时段</span>
                <span style={{ fontSize: 13, marginRight: 4, color: dateSummaryB ? LL.text : LL.text3, fontWeight: dateSummaryB ? 600 : 400 }}>
                  {dateSummaryB || '添加日期'}
                </span>
                <i className="ph ph-caret-right" style={{ fontSize: 12, color: LL.text3 }} />
              </button>
            }
            {/* 服务时长 — Form B */}
            {isFormB &&
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${LL.border}`, display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: LL.text, flex: 1 }}>服务时长</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[30, 60].map((min) =>
                <button key={min} onClick={() => setDuration(min)} style={{
                  height: 32, padding: '0 16px', borderRadius: 999, border: 0,
                  background: duration === min ? LL.ink : '#F0F0F6',
                  color: duration === min ? '#fff' : LL.text2,
                  fontSize: 13, fontWeight: duration === min ? 700 : 500,
                  cursor: 'pointer', fontFamily: LL.font, transition: 'all 140ms'
                }}>{min}分钟</button>
                )}
                </div>
              </div>
            }
            {/* 送达/到达 time — Form A */}
            {!isFormB &&
            <button onClick={() => setPicker('dropoff')} style={{
              width: '100%', padding: '14px 16px', background: 'transparent', border: 0,
              display: 'flex', alignItems: 'center', borderBottom: `1px solid ${LL.border}`,
              cursor: 'pointer', fontFamily: LL.font, textAlign: 'left'
            }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: LL.text, flex: 1 }}>{dropoffLabel}</span>
                <span style={{ fontSize: 13, marginRight: 4, color: dropoff ? LL.text : LL.text3, fontWeight: dropoff ? 600 : 400 }}>
                  {dropoff ? bfFmtTime(dropoff) : '添加时间段'}
                </span>
                <i className="ph ph-caret-right" style={{ fontSize: 12, color: LL.text3 }} />
              </button>
            }
            {/* 接回/离开 time — Form A */}
            {!isFormB &&
            <button onClick={() => setPicker('pickup')} style={{
              width: '100%', padding: '14px 16px', background: 'transparent', border: 0,
              display: 'flex', alignItems: 'center',
              cursor: 'pointer', fontFamily: LL.font, textAlign: 'left'
            }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: LL.text, flex: 1 }}>{pickupLabel}</span>
                <span style={{ fontSize: 13, marginRight: 4, color: pickup ? LL.text : LL.text3, fontWeight: pickup ? 600 : 400 }}>
                  {pickup ? bfFmtTime(pickup) : '添加时间段'}
                </span>
                <i className="ph ph-caret-right" style={{ fontSize: 12, color: LL.text3 }} />
              </button>
            }
          </div>
        </div>

        {/* ── 3. 宠物 */}
        <div style={{ marginTop: 12 }}>
          <BFGroupHeader title="宠物" />
          <div style={{ background: '#fff' }}>
            {BF_MY_PETS.map((pet) =>
            <div key={pet.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 12, borderBottom: `1px solid ${LL.border}` }}>
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: pet.bg, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ph ph-paw-print" style={{ fontSize: 22, color: LL.text }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: LL.text }}>{pet.name}</div>
                  <div style={{ fontSize: 12, color: LL.text3, marginTop: 2 }}>{pet.breed} · {pet.weight} · {pet.age}</div>
                </div>
                <BFToggle on={petEnabled[pet.id]} onChange={(v) => setPetEnabled((prev) => ({ ...prev, [pet.id]: v }))} />
              </div>
            )}
            <button style={{ width: '100%', padding: '14px 16px', background: 'transparent', border: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: LL.font }}>
              <span style={{ fontSize: 14, color: LL.text2 }}>添加宠物</span>
              <i className="ph ph-caret-right" style={{ fontSize: 12, color: LL.text3 }} />
            </button>
          </div>
        </div>

        {/* ── 4. 额外服务 */}
        <div style={{ marginTop: 12 }}>
          <BFGroupHeader title="额外服务" />
          <div style={{ background: '#fff' }}>
            {BF_EXTRAS.map((ex, i) =>
            <div key={ex.id} style={{ padding: '14px 16px', borderBottom: i < BF_EXTRAS.length - 1 ? `1px solid ${LL.border}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: LL.text }}>{ex.label}（+¥{ex.price}）</div>
                    <div style={{ fontSize: 12, color: LL.text3, marginTop: 4, lineHeight: 1.55 }}>{ex.desc}</div>
                  </div>
                  <BFToggle on={extras[ex.id]} onChange={(v) => setExtras((prev) => ({ ...prev, [ex.id]: v }))} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── 5. 联系方式 */}
        <div style={{ marginTop: 12 }}>
          <BFGroupHeader title="联系方式" />
          <div style={{ background: '#fff' }}>
            <button style={{ width: '100%', padding: '14px 16px', background: 'transparent', border: 0,
              display: 'flex', alignItems: 'center', borderBottom: `1px solid ${LL.border}`, cursor: 'pointer', fontFamily: LL.font, textAlign: 'left' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: LL.text, flex: 1 }}>手机号码</span>
              <span style={{ fontSize: 13, color: LL.text3 }}>点击添加 &gt;</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px' }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: LL.text, flex: 1, lineHeight: 1.4 }}>
                {guardian.name}回复时<br />发短信通知我
              </span>
              <BFToggle on={smsNotify} onChange={setSmsNotify} />
            </div>
          </div>
        </div>

        {/* ── 6. 留言 */}
        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <BFGroupHeader title="留言" />
          <div style={{ background: '#fff', padding: '14px 16px' }}>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="向守护者介绍您的宠物和需求…"
            style={{ width: '100%', minHeight: 88, border: 'none', outline: 'none', resize: 'none',
              fontSize: 14, color: LL.text, lineHeight: 1.7, fontFamily: LL.font,
              background: 'transparent', boxSizing: 'border-box' }} />
          </div>
        </div>
        <div style={{ height: 8 }} />
      </div>

      {/* Price Bar + CTA — wrapped for bottomOffset measurement */}
      <div ref={bottomAreaRef}>
        {currentSvc &&
        <PriceBar
          service={service}
          nights={nights}
          unitPrice={currentSvc.price}
          extras={extrasArr}
          onOpen={() => setPriceOpen(true)} />

        }
        <div style={{ background: '#fff', padding: '10px 16px 28px' }}>
          <button onClick={handleApply} style={{
            width: '100%', height: 52, borderRadius: 999, border: 0,
            background: LL.ink, color: '#fff',
            fontSize: 16, fontWeight: 700, fontFamily: LL.font,
            cursor: 'pointer', letterSpacing: '0.06em',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>申请预约</button>
        </div>
      </div>

      {/* Pickers */}
      <BFServiceSheet open={picker === 'service'} value={service} options={guardian.services}
      onPick={(v) => {setService(v);setPicker(null);}} onClose={() => setPicker(null)} />
      {typeof SchedulePickerSheet === 'function' &&
      <SchedulePickerSheet open={picker === 'dateB'} svcType={service === '上门服务' ? '遛狗' : service}
      value={schedule} onSearch={(s) => {setSchedule(s);setPicker(null);}} onClose={() => setPicker(null)} />
      }
      <TimeWheelSheet open={picker === 'dropoff'} value={dropoff} title={dropoffLabel}
      onConfirm={(t) => {setDropoff(t);setPicker(null);}} onClose={() => setPicker(null)} />
      <TimeWheelSheet open={picker === 'pickup'} value={pickup} title={pickupLabel}
      onConfirm={(t) => {setPickup(t);setPicker(null);}} onClose={() => setPicker(null)} />
      <PriceDrawer open={priceOpen} onClose={() => setPriceOpen(false)}
      service={service} nights={nights}
      unitPrice={currentSvc?.price || 0} extras={extrasArr}
      bottomOffset={bottomH} />
    </div>);

}

Object.assign(window, { BookingFlowScreen });