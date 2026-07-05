// Lou Lou — BookingFlowScreen.jsx  v2
// Screens: form → recommendation → success

// ─── Constants ────────────────────────────────────────────────
const BF_MINT        = '#C7E8D8';
const BF_MINT_DARK   = '#2C7A4B';

const BF_SVC_FORM = {
  '寄养':'A','日托':'A','伴宠留宿':'A','遛狗':'B','上门喂养':'B',
};
const BF_SVC_ICON = {
  '寄养':'house','日托':'sun','遛狗':'sneaker',
  '上门喂养':'hand-waving','伴宠留宿':'moon-stars',
};
const BF_SVC_SUB = {
  '寄养':'在守护者家','日托':'在守护者家',
  '遛狗':'在宠物主家','上门喂养':'在宠物主家',
  '伴宠留宿':'在宠物主家',
};
// Location tag colors: guardian-home vs pet-home
const BF_SVC_AT_GUARDIAN = ['寄养','日托'];
const BF_LOC_COLOR = (svc) => BF_SVC_AT_GUARDIAN.includes(svc)
  ? { fg:'#5E4A87', bg:'#EDE5F7' }
  : { fg: BF_MINT_DARK, bg:'#E6F1EC' };

// ─── Mock data ────────────────────────────────────────────────
const BF_MY_PETS = [
  { id:'p1', name:'豆豆', species:'dog', breed:'金毛', weight:'22公斤', age:'3岁', bg:'#FEE7A6' },
  { id:'p2', name:'奶茶', species:'cat', breed:'英短', weight:'4.5公斤', age:'2岁', bg:'#FBD3C4' },
];
const BF_EXTRAS = [
  { id:'medicate', label:'喂药 / 擦药 / 喂营养品', price:10, desc:'按需为宠物喂药、擦药或喂食营养品（每次）' },
];
// Coupons the user owns — selectable in the price drawer
const BF_COUPONS = [
  { id:'birthday', name:'宠物生日折扣券', desc:'生日当月 9 折，不限服务', kind:'percent', value:0.1 },
  { id:'invite',   name:'邀请好友奖励券', desc:'满 ¥100 立减 ¥20',        kind:'amount',  value:20, min:100 },
  { id:'newuser',  name:'新用户专享 9 折', desc:'首单 9 折优惠',           kind:'percent', value:0.1 },
];
function bfCouponDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  if (coupon.kind === 'percent') return Math.round(subtotal * coupon.value);
  if (coupon.kind === 'amount')  return subtotal >= (coupon.min || 0) ? coupon.value : 0;
  return 0;
}
function bfSpeciesFromBreed(breed) {
  const b = breed || '';
  if (/猫|布偶|英短|美短|蓝猫|缅因|暹罗|折耳|狸花/.test(b)) return 'cat';
  if (/兔/.test(b)) return 'rabbit';
  if (/鼠|仓鼠/.test(b)) return 'hamster';
  if (/鸟|鹦鹉/.test(b)) return 'bird';
  return 'dog';
}
const BF_SPECIES_CN = { dog:'狗', cat:'猫', rabbit:'兔', hamster:'鼠', bird:'鸟' };
const BF_RECS = [
  { id:'r1', name:'林若', area:'朝阳区·望京',   rating:4.8, reviews:96,  repeats:12, price:78, unit:'晚',
    photo:(window.__resources && window.__resources.guardian1) || './assets/guardian1.png' },
  { id:'r3', name:'桃子', area:'朝阳区·三里屯', rating:4.9, reviews:64,  repeats:8,  price:82, unit:'晚',
    photo:(window.__resources && window.__resources.guardian3) || './assets/guardian3.png' },
  { id:'r4', name:'张明', area:'朝阳区·望京',   rating:4.7, reviews:43,  repeats:5,  price:75, unit:'晚',
    photo:null, bg:'#C7E8D8' },
];

// ─── Helpers ──────────────────────────────────────────────────
// Per-day walk-time picker helpers (遛狗 / 上门喂养)
const BF_WALK_SLOTS = (() => {
  const out = [];
  for (let h = 7; h <= 21; h++) {
    out.push(`${String(h).padStart(2,'0')}:00`);
    if (h < 21) out.push(`${String(h).padStart(2,'0')}:30`);
  }
  return out;
})();
const BF_WK = ['周日','周一','周二','周三','周四','周五','周六'];
function bfDayKey(d) { const x = new Date(d); return `${x.getFullYear()}-${x.getMonth()+1}-${x.getDate()}`; }
function bfDayLabel(d) { const x = new Date(d); return `${x.getMonth()+1}月${x.getDate()}日 ${BF_WK[x.getDay()]}`; }
function bfPeriodDefaults(periods) {
  const map = { morning:'09:00', afternoon:'14:00', evening:'19:00' };
  const t = (periods || []).map(p => map[p]).filter(Boolean);
  return t.length ? t : ['09:00'];
}
function bfServiceDays(schedule) {
  const s = schedule;
  if (!s) return [];
  if (s.type === 'once') {
    if (s.pickMode === 'single' && s.dates?.days?.length) {
      return [...s.dates.days].map(d => new Date(d)).sort((a,b) => a - b);
    }
    if (s.dates?.start) {
      const start = new Date(s.dates.start);
      const end = s.dates.end ? new Date(s.dates.end) : new Date(s.dates.start);
      const out = []; const d = new Date(start);
      while (d <= end && out.length < 31) { out.push(new Date(d)); d.setDate(d.getDate()+1); }
      return out;
    }
  }
  // recurring: expand chosen weekdays within range (Mon-first index)
  if (s.dates?.start && s.weekdays?.length) {
    const start = new Date(s.dates.start);
    const end = s.dates.end ? new Date(s.dates.end) : new Date(s.dates.start);
    const wd = new Set(s.weekdays);
    const out = []; const d = new Date(start);
    while (d <= end && out.length < 31) {
      if (wd.has((d.getDay()+6)%7)) out.push(new Date(d));
      d.setDate(d.getDate()+1);
    }
    return out;
  }
  return s.dates?.start ? [new Date(s.dates.start)] : [];
}

// Per-day walk-time picker — scrollable time chips + "same as first day" toggle
function BFWalkTimes({ days, walkTimes, sameAsFirst, onToggleTime, onToggleSame, serviceLabel }) {
  if (!days.length) return null;
  const firstKey   = bfDayKey(days[0]);
  const firstTimes = walkTimes[firstKey] || [];
  const summary = (times) => times.length ? `${times.length}次 · ${times.join('、')}` : `添加一个或多个${serviceLabel}时间`;

  return (
    <div style={{ background:'#fff' }}>
      {days.map((d, i) => {
        const k = bfDayKey(d);
        const isFirst = i === 0;
        const same = !isFirst && sameAsFirst[k] !== false; // default ON for non-first days
        const ownTimes = walkTimes[k] || [];
        const shownTimes = same ? firstTimes : ownTimes;
        const showChips = isFirst || !same;
        return (
          <div key={k} style={{ padding:'14px 16px', borderTop: i > 0 ? `1px solid ${LL.border}` : 'none' }}>
            <div style={{ fontSize:14, fontWeight:700, color:LL.text }}>{bfDayLabel(d)}</div>
            <div style={{ fontSize:12, color: shownTimes.length ? LL.text2 : LL.text3, marginTop:3 }}>
              {summary(shownTimes)}
            </div>
            {showChips && (
              <div style={{ display:'flex', gap:8, overflowX:'auto', marginTop:11, paddingBottom:4, scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
                {BF_WALK_SLOTS.map(t => {
                  const on = ownTimes.includes(t);
                  return (
                    <button key={t} onClick={() => onToggleTime(k, t)} style={{
                      flex:'0 0 auto', height:38, padding:'0 15px', borderRadius:10,
                      border:`1.5px solid ${on ? LL.ink : LL.border}`,
                      background: on ? LL.ink : '#fff', color: on ? '#fff' : LL.text2,
                      fontSize:13.5, fontWeight: on ? 700 : 500, fontFamily:LL.font, cursor:'pointer',
                      fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap', transition:'all 120ms',
                    }}>{t}</button>
                  );
                })}
              </div>
            )}
            {!isFirst && (
              <div style={{ display:'flex', alignItems:'center', marginTop:12, paddingTop:12, borderTop:`1px dashed ${LL.border}` }}>
                <span style={{ flex:1, fontSize:13, color:LL.text2 }}>与 {bfDayLabel(days[0])} 相同时间</span>
                <BFToggle on={same} onChange={(v) => onToggleSame(k, v)} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────
function bfFmtTime(t) {
  if (!t) return '';
  return `${String(t.h).padStart(2,'0')}:${String(t.m).padStart(2,'0')}`;
}
function bfFmtDate(d) {
  if (!d) return '';
  return `${d.getMonth()+1}月${d.getDate()}日`;
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
      background:'#F5F5F9', padding:'9px 16px 7px',
      fontSize:12, fontWeight:600, color:LL.text3, letterSpacing:'0.04em',
    }}>{title}</div>
  );
}

// ─── Toggle (bold check, no fill bg) ─────────────────────────
function BFToggle({ on, onChange }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width:48, height:28, borderRadius:14,
      background: on ? LL.ink : '#D0D0DC',
      position:'relative', cursor:'pointer',
      transition:'background 180ms', flex:'0 0 auto',
    }}>
      <div style={{
        position:'absolute', top:3, left: on ? 23:3,
        width:22, height:22, borderRadius:'50%', background:'#fff',
        boxShadow:'0 1px 4px rgba(0,0,0,0.22)',
        transition:'left 180ms',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        {on && <i className="ph-bold ph-check" style={{ fontSize:12, color:LL.ink }} />}
      </div>
    </div>
  );
}

// ─── Wheel Column ─────────────────────────────────────────────
function WheelColumn({ items, value, onChange, fmt }) {
  const ITEM_H=44, PAD=2*44;
  const ref   = React.useRef(null);
  const timer = React.useRef(null);
  React.useEffect(() => {
    const idx = items.indexOf(value);
    if (ref.current && idx >= 0) ref.current.scrollTop = idx*ITEM_H;
  }, []); // eslint-disable-line
  const onScroll = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.max(0, Math.min(items.length-1, Math.round(ref.current.scrollTop/ITEM_H)));
      onChange(items[idx]);
      ref.current.scrollTop = idx*ITEM_H;
    }, 120);
  };
  return (
    <div style={{ flex:1, position:'relative', height:5*ITEM_H, overflow:'hidden' }}>
      <div style={{ position:'absolute',top:0,left:0,right:0,height:PAD,zIndex:2,
        background:'linear-gradient(to bottom,rgba(255,255,255,.96),rgba(255,255,255,0))',pointerEvents:'none' }}/>
      <div style={{ position:'absolute',bottom:0,left:0,right:0,height:PAD,zIndex:2,
        background:'linear-gradient(to top,rgba(255,255,255,.96),rgba(255,255,255,0))',pointerEvents:'none' }}/>
      <div style={{ position:'absolute',top:PAD,left:6,right:6,height:ITEM_H,zIndex:0,background:LL.bg,borderRadius:10 }}/>
      <div ref={ref} onScroll={onScroll} style={{ height:'100%',overflowY:'scroll',scrollbarWidth:'none',WebkitOverflowScrolling:'touch' }}>
        <div style={{ height:PAD }}/>
        {items.map((item,i) => (
          <div key={i} onClick={() => { onChange(item); if(ref.current) ref.current.scrollTop=i*ITEM_H; }}
            style={{ height:ITEM_H,display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:20,fontVariantNumeric:'tabular-nums',position:'relative',zIndex:1,cursor:'pointer',
              fontWeight:item===value?700:400, color:item===value?LL.text:LL.text3 }}>
            {fmt ? fmt(item) : String(item).padStart(2,'0')}
          </div>
        ))}
        <div style={{ height:PAD }}/>
      </div>
    </div>
  );
}

// ─── Time Wheel Sheet ─────────────────────────────────────────
const BF_HOURS = Array.from({length:24},(_,i)=>i);
const BF_MINS  = [0,15,30,45];

function TimeWheelSheet({ open, value, onConfirm, onClose, title='选择时间段' }) {
  const [h,setH] = React.useState(value?.h??9);
  const [m,setM] = React.useState(value?.m??0);
  React.useEffect(() => { if(open){ setH(value?.h??9); setM(value?.m??0); } },[open]); // eslint-disable-line
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.35)',zIndex:85 }}/>
      <div style={{ position:'absolute',left:0,right:0,bottom:0,zIndex:86,background:'#fff',
        borderTopLeftRadius:20,borderTopRightRadius:20,boxShadow:'0 -8px 24px rgba(0,0,0,0.12)',fontFamily:LL.font }}>
        <div style={{ width:38,height:4,borderRadius:2,background:LL.border,margin:'12px auto 0' }}/>
        <div style={{ display:'flex',alignItems:'center',padding:'12px 18px 4px' }}>
          <button onClick={onClose} style={{ background:'transparent',border:0,fontSize:14,color:LL.text3,cursor:'pointer',fontFamily:LL.font,padding:0 }}>取消</button>
          <div style={{ flex:1,textAlign:'center',fontSize:15,fontWeight:700,color:LL.text }}>{title}</div>
          <button onClick={() => onConfirm({h,m})} style={{ background:'transparent',border:0,fontSize:14,fontWeight:700,color:LL.ink,cursor:'pointer',fontFamily:LL.font,padding:0 }}>确定</button>
        </div>
        <div style={{ display:'flex',alignItems:'center',padding:'8px 20px 28px',gap:0 }}>
          <WheelColumn items={BF_HOURS} value={h} onChange={setH}/>
          <div style={{ width:28,textAlign:'center',fontSize:20,fontWeight:700,color:LL.text,paddingBottom:4,flex:'0 0 auto' }}>:</div>
          <WheelColumn items={BF_MINS} value={m} onChange={setM} fmt={v=>String(v).padStart(2,'0')}/>
        </div>
      </div>
    </>
  );
}

// ─── Service Picker ───────────────────────────────────────────
function BFServiceSheet({ open, value, options, onPick, onClose }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.35)',zIndex:85 }}/>
      <div style={{ position:'absolute',left:0,right:0,bottom:0,zIndex:86,background:'#fff',
        borderTopLeftRadius:20,borderTopRightRadius:20,paddingBottom:24,
        boxShadow:'0 -8px 24px rgba(0,0,0,0.10)',fontFamily:LL.font }}>
        <div style={{ width:38,height:4,borderRadius:2,background:LL.border,margin:'12px auto 10px' }}/>
        <div style={{ display:'flex',alignItems:'center',padding:'4px 16px 12px' }}>
          <div style={{ fontSize:15,fontWeight:700,color:LL.text }}>选择服务类型</div>
          <button onClick={onClose} style={{ marginLeft:'auto',width:30,height:30,borderRadius:'50%',border:0,background:'#F0F0F5',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <i className="ph ph-x" style={{ fontSize:13,color:LL.text }}/>
          </button>
        </div>
        {options.map((svc,i) => {
          const on = value===svc.id;
          const locClr = BF_LOC_COLOR(svc.id);
          return (
            <button key={svc.id} onClick={() => onPick(svc.id)} style={{
              width:'100%',padding:'13px 18px',background:'transparent',border:0,cursor:'pointer',fontFamily:LL.font,
              display:'flex',alignItems:'center',justifyContent:'space-between',
              borderTop:`1px solid ${LL.border}`,
              borderBottom: i===options.length-1 ? `1px solid ${LL.border}`:'none',textAlign:'left',
            }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15,fontWeight:on?700:600,color:LL.text }}>{svc.id}</div>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginTop:5 }}>
                  <span style={{ fontSize:11,fontWeight:600,color:locClr.fg,background:locClr.bg,borderRadius:4,padding:'2px 7px' }}>
                    {BF_SVC_SUB[svc.id]||''}
                  </span>
                  <span style={{ fontSize:12,color:LL.text3 }}>¥{svc.price}/{svc.unit}起</span>
                </div>
              </div>
              {on && <i className="ph-fill ph-check-circle" style={{ fontSize:19,color:LL.ink }}/>}
            </button>
          );
        })}
      </div>
    </>
  );
}

// ─── Qty Stepper ─────────────────────────────────────────────
function BFStepper({ value, onChange, min=0, max=9 }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, flex:'0 0 auto' }}>
      <button onClick={() => onChange(Math.max(min, value-1))} style={{
        width:32, height:32, borderRadius:'50%', border:0,
        background: value <= min ? '#F0F0F6' : LL.ink,
        color: value <= min ? LL.text3 : '#fff',
        fontSize:18, fontWeight:700, cursor: value <= min ? 'not-allowed' : 'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1,
        transition:'background 140ms',
      }}>−</button>
      <span style={{ width:36, textAlign:'center', fontSize:15, fontWeight:700, color:LL.text,
        fontVariantNumeric:'tabular-nums' }}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value+1))} style={{
        width:32, height:32, borderRadius:'50%', border:0,
        background: LL.ink, color:'#fff',
        fontSize:18, fontWeight:700, cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1,
      }}>+</button>
    </div>
  );
}

// ─── Price Bar + Drawer ───────────────────────────────────────
function PriceBar({ service, nights, petUnitSum, extras, pricedPets=[], overtimeFee=0, onOpen }) {
  const extrasTotal = extras.reduce((s,e) => s + (e.qty||0) * e.price, 0);
  const petCount = pricedPets.length || 1;
  const subtotal = petUnitSum * nights + extrasTotal + overtimeFee;
  const total = subtotal;
  const svcUnit = BF_SVC_FORM[service]==='A' ? (service==='日托' ? '天':'晚') : '次';

  return (
    <button onClick={onOpen} style={{
      width:'100%', background:'#fff', border:0, borderTop:`1px solid ${LL.border}`,
      padding:'10px 16px', display:'flex', alignItems:'center', gap:12,
      cursor:'pointer', fontFamily:LL.font, textAlign:'left',
    }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:12, color:LL.text3, marginBottom:3 }}>
          {service} · {nights > 0 ? `${nights}${svcUnit}${petCount > 1 ? ` × ${petCount}只` : ''}` : '请选择日期'}
        </div>
        <div style={{ fontSize:15, fontWeight:700, color:LL.text }}>
          总计 ¥{nights > 0 ? total : '--'}
        </div>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
        <span style={{ fontSize:12, color:LL.text3 }}>查看明细</span>
        <i className="ph ph-caret-up" style={{ fontSize:12, color:LL.text3 }}/>
      </div>
    </button>
  );
}

// Coupon picker bottom-sheet — choose which coupon to apply
function BFCouponPicker({ open, coupons, subtotal, selectedId, onPick, onClose }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.4)',zIndex:92 }}/>
      <div style={{ position:'absolute',left:0,right:0,bottom:0,zIndex:93,background:'#fff',
        borderTopLeftRadius:20,borderTopRightRadius:20,padding:'0 0 24px',
        boxShadow:'0 -8px 24px rgba(0,0,0,0.12)',fontFamily:LL.font,maxHeight:'80%',display:'flex',flexDirection:'column' }}>
        <div style={{ padding:'12px 16px 8px',flex:'0 0 auto' }}>
          <div style={{ width:38,height:4,borderRadius:2,background:LL.border,margin:'0 auto 10px' }}/>
          <div style={{ display:'flex',alignItems:'center' }}>
            <div style={{ fontSize:15,fontWeight:700,color:LL.text }}>选择优惠券</div>
            <button onClick={onClose} style={{ marginLeft:'auto',width:30,height:30,borderRadius:'50%',border:0,background:'#F0F0F5',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
              <i className="ph ph-x" style={{ fontSize:13,color:LL.text }}/>
            </button>
          </div>
        </div>
        <div style={{ flex:1,overflowY:'auto',padding:'4px 16px 8px',display:'flex',flexDirection:'column',gap:10 }}>
          {coupons.map(c => {
            const disc = bfCouponDiscount(c, subtotal);
            const usable = disc > 0;
            const on = selectedId === c.id;
            return (
              <button key={c.id} disabled={!usable} onClick={() => onPick(c.id)} style={{
                display:'flex',alignItems:'center',gap:12,padding:'14px',borderRadius:14,
                border:`1.5px solid ${on?LL.ink:LL.border}`,background: usable ? (on?'#FAFAFC':'#fff') : '#F7F7FA',
                cursor: usable?'pointer':'not-allowed',fontFamily:LL.font,textAlign:'left',width:'100%',opacity:usable?1:0.55,
              }}>
                <div style={{ width:46,height:46,borderRadius:10,background:LL.butter,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:'0 0 auto' }}>
                  <i className="ph ph-ticket" style={{ fontSize:20,color:LL.text }}/>
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:LL.text }}>{c.name}</div>
                  <div style={{ fontSize:12,color:LL.text3,marginTop:2 }}>{c.desc}</div>
                  {!usable && <div style={{ fontSize:11.5,color:'#B45309',marginTop:3 }}>不满足使用条件</div>}
                </div>
                <div style={{ flex:'0 0 auto',display:'flex',alignItems:'center',gap:8 }}>
                  {usable && <span style={{ fontSize:14,fontWeight:800,color:'#E63946' }}>-¥{disc}</span>}
                  {on
                    ? <i className="ph-fill ph-check-circle" style={{ fontSize:20,color:LL.ink }}/>
                    : <div style={{ width:20,height:20,borderRadius:'50%',border:`1.5px solid ${LL.border}` }}/>}
                </div>
              </button>
            );
          })}
          <button onClick={() => onPick(null)} style={{
            padding:'13px',borderRadius:14,border:`1.5px solid ${selectedId==null?LL.ink:LL.border}`,
            background:selectedId==null?'#FAFAFC':'#fff',cursor:'pointer',fontFamily:LL.font,
            fontSize:14,fontWeight:600,color:LL.text2,display:'flex',alignItems:'center',justifyContent:'center',gap:6,
          }}>
            {selectedId==null && <i className="ph-fill ph-check-circle" style={{ fontSize:16,color:LL.ink }}/>}
            不使用优惠券
          </button>
        </div>
      </div>
    </>
  );
}

function PriceDrawer({ open, onClose, service, nights, petUnitSum, pricedPets=[], extras, overtimeFee=0, overtimeRate=0, coupon, onOpenCoupon, bottomOffset=0 }) {
  if (!open) return null;
  const extrasWithQty = extras.filter(e => (e.qty||0) > 0);
  const svcUnit = BF_SVC_FORM[service]==='A' ? (service==='日托' ? '天':'晚') : '次';
  const svcTotal = petUnitSum * nights;
  const extrasTotal = extrasWithQty.reduce((s,e) => s + e.qty * e.price, 0);
  const subtotal = svcTotal + extrasTotal + overtimeFee;
  const discount = bfCouponDiscount(coupon, subtotal);
  const total = subtotal - discount;
  return (
    <>
      <div onClick={onClose} style={{ position:'absolute',top:0,left:0,right:0,bottom:bottomOffset,background:'rgba(0,0,0,0.35)',zIndex:85 }}/>
      <div style={{ position:'absolute',left:0,right:0,bottom:bottomOffset,zIndex:86,background:'#fff',
        borderTopLeftRadius:20,borderTopRightRadius:20,padding:'0 0 4px',
        boxShadow:'0 -8px 24px rgba(0,0,0,0.10)',fontFamily:LL.font }}>
        <div style={{ width:38,height:4,borderRadius:2,background:LL.border,margin:'12px auto 10px' }}/>
        <div style={{ display:'flex',alignItems:'center',padding:'4px 16px 14px' }}>
          <div style={{ fontSize:15,fontWeight:700,color:LL.text }}>费用明细</div>
          <button onClick={onClose} style={{ marginLeft:'auto',width:30,height:30,borderRadius:'50%',border:0,background:'#F0F0F5',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <i className="ph ph-x" style={{ fontSize:13,color:LL.text }}/>
          </button>
        </div>
        {/* Per-species service lines — dog & cat computed separately */}
        {(pricedPets.length ? pricedPets : [{ name:'宠物', unit:petUnitSum, species:'dog' }]).map((p,i) => (
          <div key={p.id||i} style={{ padding:'10px 16px',borderTop:`1px solid ${LL.border}`,display:'flex',justifyContent:'space-between' }}>
            <span style={{ fontSize:14,color:LL.text2 }}>{p.name}（{BF_SPECIES_CN[p.species]||'宠物'}）¥{p.unit}/{svcUnit} × {nights}{svcUnit}</span>
            <span style={{ fontSize:14,fontWeight:600,color:LL.text }}>¥{p.unit * nights}</span>
          </div>
        ))}
        {extrasWithQty.map(e => (
          <div key={e.id} style={{ padding:'10px 16px',borderTop:`1px solid ${LL.border}`,display:'flex',justifyContent:'space-between' }}>
            <span style={{ fontSize:14,color:LL.text2 }}>{e.label} × {e.qty}</span>
            <span style={{ fontSize:14,fontWeight:600,color:LL.text }}>+¥{e.qty * e.price}</span>
          </div>
        ))}
        {overtimeFee > 0 && (
          <div style={{ padding:'10px 16px',borderTop:`1px solid ${LL.border}`,display:'flex',justifyContent:'space-between' }}>
            <span style={{ fontSize:14,color:LL.text2 }}>延时费（接回晚于送达 · 当日价×{Math.round(overtimeRate*100)}%）</span>
            <span style={{ fontSize:14,fontWeight:600,color:LL.text }}>+¥{overtimeFee}</span>
          </div>
        )}
        <button onClick={onOpenCoupon} style={{ width:'100%',padding:'10px 16px',borderTop:`1px solid ${LL.border}`,background:'transparent',border:0,display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',fontFamily:LL.font }}>
          <div style={{ display:'flex',alignItems:'center',gap:6 }}>
            <i className="ph ph-ticket" style={{ fontSize:15,color: coupon ? '#E63946' : LL.text3 }}/>
            <span style={{ fontSize:14,color: coupon ? '#E63946' : LL.text2 }}>{coupon ? coupon.name : '优惠券'}</span>
          </div>
          <div style={{ display:'flex',alignItems:'center',gap:4 }}>
            {discount > 0 && <span style={{ fontSize:14,fontWeight:700,color:'#E63946' }}>-¥{discount}</span>}
            <span style={{ fontSize:13,color:LL.ink,fontWeight:600 }}>{coupon ? '更换' : '选择'}</span>
            <i className="ph ph-caret-right" style={{ fontSize:11,color:LL.ink }}/>
          </div>
        </button>
        <div style={{ padding:'14px 16px',borderTop:`2px solid ${LL.border}`,display:'flex',justifyContent:'space-between' }}>
          <span style={{ fontSize:15,fontWeight:700,color:LL.text }}>总计</span>
          <span style={{ fontSize:18,fontWeight:800,color:LL.text }}>¥{total}</span>
        </div>
      </div>
    </>
  );
}

// ─── Form A date drawer — scrollable months, no per-day price ──
function DateRangeDrawer({ open, value, bookedDates, svcUnit = '晚', onApply, onClose }) {
  const [draft, setDraft] = React.useState(value || { start:null, end:null });
  React.useEffect(() => { if (open) setDraft(value || { start:null, end:null }); }, [open]); // eslint-disable-line
  if (!open) return null;
  const n = (draft.start && draft.end) ? bfDaysBetween(draft.start, draft.end) : 0;
  const canApply = !!(draft.start && draft.end);
  return (
    <>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', zIndex:88 }}/>
      <div style={{
        position:'absolute', left:0, right:0, bottom:0, zIndex:89, background:'#fff',
        borderTopLeftRadius:20, borderTopRightRadius:20,
        boxShadow:'0 -8px 24px rgba(0,0,0,0.12)', fontFamily:LL.font,
      }}>
        {/* Header */}
        <div style={{ padding:'12px 16px 6px' }}>
          <div style={{ width:38, height:4, borderRadius:2, background:LL.border, margin:'0 auto 10px' }}/>
          <div style={{ display:'flex', alignItems:'center' }}>
            <div style={{ fontSize:16, fontWeight:700, color:LL.text }}>选择服务日期</div>
            <button onClick={onClose} style={{
              marginLeft:'auto', width:30, height:30, borderRadius:'50%', border:0,
              background:'#F0F0F5', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}><i className="ph ph-x" style={{ fontSize:13, color:LL.text }}/></button>
          </div>
        </div>
        {/* Calendar — GuardianCalendar handles its own vertical month scroll */}
        <div style={{ padding:'2px 16px 4px' }}>
          {typeof GuardianCalendar === 'function' && (
            <GuardianCalendar
              bookedDates={bookedDates}
              svcPrice={null}
              viewOnly={false}
              scroll={true}
              monthsCount={9}
              start={draft.start}
              end={draft.end}
              onChange={setDraft}
            />
          )}
        </div>
        {/* Footer */}
        <div style={{ padding:'10px 16px 22px', borderTop:`1px solid ${LL.border}` }}>
          <div style={{ fontSize:12.5, color:LL.text2, marginBottom:8, textAlign:'center', minHeight:18 }}>
            {draft.start ? (
              <>
                <span style={{ color:LL.text, fontWeight:700 }}>{bfFmtDate(draft.start)}</span>
                <span style={{ margin:'0 6px' }}>→</span>
                <span style={{ color:LL.text, fontWeight:700 }}>{draft.end ? bfFmtDate(draft.end) : '...'}</span>
                {n > 0 && <span style={{ marginLeft:8, color:LL.text2 }}>共 <b style={{ color:LL.text }}>{n}</b> {svcUnit}</span>}
              </>
            ) : '请在日历上选择开始日期'}
          </div>
          <button disabled={!canApply} onClick={() => onApply(draft)} style={{
            width:'100%', height:50, borderRadius:999, border:0,
            background: canApply ? LL.ink : LL.inkDisabled, color:'#fff',
            fontSize:16, fontWeight:700, fontFamily:LL.font, cursor: canApply ? 'pointer' : 'not-allowed',
            letterSpacing:'0.06em',
          }}>应用日期</button>
        </div>
      </div>
    </>
  );
}

// ─── Address map page (pick service location) ─────────────────
const BF_POIS = [
  { poi:'望京SOHO', area:'北京市朝阳区阜通东大街6号' },
  { poi:'融科橄榄城', area:'北京市朝阳区望京西园三区' },
  { poi:'望京新城', area:'北京市朝阳区广顺南大街12号' },
];

function AddressMapScreen({ initial, onConfirm, onClose }) {
  const [poiIdx, setPoiIdx] = React.useState(() => {
    if (initial) { const i = BF_POIS.findIndex(p => p.poi === initial.poi); return i >= 0 ? i : 0; }
    return 0;
  });
  const [detail, setDetail] = React.useState(initial?.detail || '');
  const [saveAsMine, setSaveAsMine] = React.useState(true);
  const poi = BF_POIS[poiIdx];
  const mapImg = (window.__resources && window.__resources.mapImg) || './assets/map.png';

  return (
    <div style={{ position:'absolute', inset:0, zIndex:92, background:'#fff',
      display:'flex', flexDirection:'column', fontFamily:LL.font }}>
      {/* Nav */}
      <div style={{ flex:'0 0 auto', height:52, background:'#fff', borderBottom:`1px solid ${LL.border}`,
        display:'flex', alignItems:'center', padding:'0 16px' }}>
        <button onClick={onClose} style={{ display:'flex', alignItems:'center', gap:3, background:'transparent',
          border:0, cursor:'pointer', fontFamily:LL.font, padding:0, color:LL.text2, fontSize:13.5 }}>
          <i className="ph ph-caret-left" style={{ fontSize:16 }}/> 返回
        </button>
        <div style={{ flex:1, textAlign:'center', fontSize:15, fontWeight:700, color:LL.text }}>选择服务地址</div>
        <div style={{ width:48 }}/>
      </div>

      {/* Map */}
      <div style={{ flex:1, position:'relative', overflow:'hidden', background:'#D8E8F0', minHeight:0 }}>
        <img src={mapImg} alt="地图" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
          onError={e => { e.target.style.display = 'none'; }}/>
        {/* Search field */}
        <div style={{ position:'absolute', top:12, left:12, right:12, height:40, background:'#fff',
          borderRadius:999, boxShadow:'0 2px 10px rgba(0,0,0,0.12)',
          display:'flex', alignItems:'center', padding:'0 14px', gap:8 }}>
          <i className="ph ph-magnifying-glass" style={{ fontSize:15, color:LL.text3 }}/>
          <span style={{ fontSize:13.5, color:LL.text3 }}>搜索小区 / 地址</span>
        </div>
        {/* Center pin */}
        <div style={{ position:'absolute', left:'50%', top:'46%', transform:'translate(-50%,-100%)',
          display:'flex', flexDirection:'column', alignItems:'center', pointerEvents:'none' }}>
          <div style={{ background:LL.ink, color:'#fff', fontSize:12, fontWeight:700, padding:'5px 10px',
            borderRadius:8, whiteSpace:'nowrap', marginBottom:4, boxShadow:'0 2px 8px rgba(0,0,0,0.2)' }}>{poi.poi}</div>
          <i className="ph-fill ph-map-pin" style={{ fontSize:34, color:'#E63946',
            filter:'drop-shadow(0 3px 4px rgba(0,0,0,0.25))' }}/>
        </div>
      </div>

      {/* Bottom card */}
      <div style={{ flex:'0 0 auto', background:'#fff', boxShadow:'0 -4px 16px rgba(0,0,0,0.08)',
        padding:'14px 16px 22px', borderTopLeftRadius:18, borderTopRightRadius:18 }}>
        <div style={{ fontSize:12, color:LL.text3, marginBottom:8 }}>选择附近地址</div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
          {BF_POIS.map((p, i) => {
            const on = i === poiIdx;
            return (
              <button key={p.poi} onClick={() => setPoiIdx(i)} style={{
                display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, border:0,
                background: on ? '#F3F1FA' : 'transparent', cursor:'pointer', fontFamily:LL.font, textAlign:'left', width:'100%' }}>
                <i className={`${on ? 'ph-fill' : 'ph'} ph-map-pin`} style={{ fontSize:16, color: on ? LL.ink : LL.text3, flex:'0 0 auto' }}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:13.5, fontWeight: on ? 700 : 600, color:LL.text }}>{p.poi}</div>
                  <div style={{ fontSize:11.5, color:LL.text3, marginTop:1 }}>{p.area}</div>
                </div>
                {on && <i className="ph-fill ph-check-circle" style={{ fontSize:17, color:LL.ink, flex:'0 0 auto' }}/>}
              </button>
            );
          })}
        </div>
        {/* Detail input */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px',
          background:LL.bg, borderRadius:12, marginBottom:14 }}>
          <span style={{ fontSize:13.5, color:LL.text2, flex:'0 0 auto' }}>详细地址</span>
          <input value={detail} onChange={e => setDetail(e.target.value)} placeholder="楼号 / 单元 / 门牌号"
            style={{ flex:1, border:0, outline:'none', background:'transparent', fontSize:13.5, color:LL.text,
              fontFamily:LL.font, textAlign:'right', caretColor:LL.ink }}/>
        </div>
        {/* Save as my address */}
        <button onClick={() => setSaveAsMine(v => !v)} style={{ display:'flex', alignItems:'center', gap:8,
          background:'transparent', border:0, cursor:'pointer', fontFamily:LL.font, padding:'0 0 14px' }}>
          <div style={{ width:20, height:20, borderRadius:6, flex:'0 0 auto',
            background: saveAsMine ? LL.ink : 'transparent',
            boxShadow: saveAsMine ? 'none' : `inset 0 0 0 1.5px ${LL.text3}`,
            display:'flex', alignItems:'center', justifyContent:'center' }}>
            {saveAsMine && <i className="ph-bold ph-check" style={{ fontSize:12, color:'#fff' }}/>}
          </div>
          <span style={{ fontSize:13.5, color:LL.text2 }}>添加为我的地址</span>
        </button>
        <button onClick={() => onConfirm({ poi: poi.poi, area: poi.area, detail: detail.trim(), saveAsMine })} style={{
          width:'100%', height:50, borderRadius:999, border:0, background:LL.ink, color:'#fff',
          fontSize:16, fontWeight:700, fontFamily:LL.font, cursor:'pointer', letterSpacing:'0.06em' }}>确认地址</button>
      </div>
    </div>
  );
}

// ─── Recommendation Screen ────────────────────────────────────
function RecommendationScreen({ guardian, service, dateRange, pets, message: initMsg, onContact, onSkip }) {
  const [checked, setChecked] = React.useState({ r1:true, r3:false, r4:false });
  const [msg, setMsg] = React.useState(initMsg || '');
  const nearbyWarning = bfIsWithin2Weeks(dateRange?.start);
  const svcUnit = BF_SVC_FORM[service]==='A' ? (service==='日托'?'天':'晚') : '次';
  const svc = guardian?.services?.find(s=>s.id===service);
  const petsEnabled = pets ? Object.keys(pets).filter(id=>pets[id]).length : 1;

  const _g1 = (window.__resources && window.__resources.guardian1) || './assets/guardian1.png';
  const _g3 = (window.__resources && window.__resources.guardian3) || './assets/guardian3.png';
  const photoMap = { r1:_g1, r3:_g3 };

  const anyChecked = Object.values(checked).some(Boolean);

  return (
    <div style={{ display:'flex',flexDirection:'column',flex:1,overflow:'hidden',position:'relative' }}>
      {/* Nav */}
      <div style={{ flex:'0 0 auto',height:52,background:'#fff',borderBottom:`1px solid ${LL.border}`,
        display:'flex',alignItems:'center',padding:'0 16px' }}>
        <div style={{ flex:1,textAlign:'center',fontSize:15,fontWeight:700,color:LL.text }}>预约详情</div>
      </div>

      <div style={{ flex:1,overflowY:'auto',background:LL.bg }}>
        {/* Summary bar */}
        <div style={{ background:'#fff',padding:'14px 16px',borderBottom:`1px solid ${LL.border}` }}>
          <div style={{ fontSize:12,color:LL.text3,marginBottom:4 }}>{service}</div>
          <div style={{ fontSize:14,fontWeight:600,color:LL.text }}>
            从{bfFmtDate(dateRange?.start)}开始
            {' · '}{petsEnabled}只宠物
            {svc ? ` · ¥${svc.price}/${svcUnit}` : ''}
          </div>
          {nearbyWarning && (
            <div style={{ marginTop:8,display:'inline-flex',alignItems:'center',
              background:'#FFF3CD',border:'1px solid #F0B100',borderRadius:6,
              padding:'3px 10px',fontSize:12,fontWeight:700,color:'#B45309' }}>
              临近预约
            </div>
          )}
        </div>

        {/* Warning box */}
        {nearbyWarning && (
          <div style={{ margin:'12px 16px 0',padding:'12px 14px',background:'#FFFBEB',
            border:'1px solid #FDE68A',borderRadius:10,
            display:'flex',alignItems:'flex-start',gap:10 }}>
            <span style={{ fontSize:16,flex:'0 0 auto',marginTop:1 }}>ℹ️</span>
            <span style={{ fontSize:13,color:'#92400E',lineHeight:1.6 }}>
              距离服务日期不足2周，守护者档期较紧张，建议同时联系更多守护者以提高成功率。
            </span>
          </div>
        )}

        {/* Recommended guardians */}
        <div style={{ marginTop:16,padding:'0 16px' }}>
          <div style={{ fontSize:16,fontWeight:700,color:LL.text,marginBottom:4 }}>
            同时联系其他守护者
          </div>
          <div style={{ height:1,background:LL.border,marginBottom:12 }}/>
          <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
            {BF_RECS.map((rec,i) => {
              const photo = photoMap[rec.id] || rec.photo;
              const on = checked[rec.id];
              return (
                <div key={rec.id} onClick={() => setChecked(c=>({...c,[rec.id]:!c[rec.id]}))} style={{
                  background:'#fff',borderRadius:14,padding:'14px',
                  display:'flex',alignItems:'center',gap:12,cursor:'pointer',
                  border: on ? `1.5px solid ${LL.ink}` : `1.5px solid ${LL.border}`,
                  transition:'border-color 160ms',
                }}>
                  {/* Checkbox */}
                  <div style={{
                    width:22,height:22,borderRadius:4,border:0,flex:'0 0 auto',
                    background: on ? LL.ink : 'transparent',
                    boxShadow: on ? 'none' : `inset 0 0 0 1.5px ${LL.text3}`,
                    display:'flex',alignItems:'center',justifyContent:'center',
                    transition:'all 160ms',
                  }}>
                    {on && <i className="ph-bold ph-check" style={{ fontSize:11,color:'#fff' }}/>}
                  </div>
                  {/* Photo */}
                  <div style={{ width:44,height:44,borderRadius:'50%',overflow:'hidden',flex:'0 0 auto',
                    background: rec.bg || LL.lavender }}>
                    {photo && <img src={photo} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top center' }}/>}
                  </div>
                  {/* Info */}
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:14,fontWeight:700,color:LL.text }}>{rec.name}</div>
                    <div style={{ fontSize:12,color:LL.text3,marginTop:2 }}>{rec.area}</div>
                    <div style={{ fontSize:12,color:LL.text2,marginTop:3,display:'flex',alignItems:'center',gap:6 }}>
                      <span>⭐{rec.rating} · {rec.reviews}条评价</span>
                    </div>
                    <div style={{ fontSize:12,color:LL.text3,marginTop:2 }}>
                      🔁 {rec.repeats}位回头宠主
                    </div>
                  </div>
                  {/* Price */}
                  <div style={{ textAlign:'right',flex:'0 0 auto' }}>
                    <div style={{ fontSize:18,fontWeight:800,color:BF_MINT_DARK }}>¥{rec.price}</div>
                    <div style={{ fontSize:11,color:LL.text3 }}>/{rec.unit}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Message */}
        <div style={{ margin:'16px 16px 0' }}>
          <div style={{ fontSize:14,fontWeight:700,color:LL.text,marginBottom:8 }}>留言</div>
          <div style={{ background:'#fff',borderRadius:12,padding:'12px 14px' }}>
            <textarea value={msg} onChange={e=>setMsg(e.target.value)}
              style={{ width:'100%',minHeight:80,border:'none',outline:'none',resize:'none',
                fontSize:14,color:LL.text,lineHeight:1.7,fontFamily:LL.font,
                background:'transparent',boxSizing:'border-box' }}
              placeholder="向守护者介绍您的宠物和需求…"/>
          </div>
        </div>
        <div style={{ height:16 }}/>
      </div>

      {/* Bottom buttons */}
      <div style={{ flex:'0 0 auto',background:'#fff',borderTop:`1px solid ${LL.border}`,padding:'12px 16px 28px' }}>
        <button onClick={() => onContact(checked, msg)} disabled={!anyChecked} style={{
          width:'100%',height:52,borderRadius:999,border:0,
          background: anyChecked ? LL.ink : LL.inkDisabled,
          color:'#fff',fontSize:15,fontWeight:700,fontFamily:LL.font,
          cursor: anyChecked ? 'pointer':'not-allowed',marginBottom:10,
          display:'flex',alignItems:'center',justifyContent:'center',letterSpacing:'0.04em',
        }}>联系这些守护者</button>
        <button onClick={onSkip} style={{
          width:'100%',height:40,background:'transparent',border:0,
          fontSize:14,color:LL.text3,cursor:'pointer',fontFamily:LL.font,
        }}>跳过</button>
      </div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────
const BF_STEPS = [
  {
    icon: 'clock',
    title: '守护者即将回复',
    desc: '您联系的守护者通常会在30分钟内回复。',
  },
  {
    icon: 'chat-circle-text',
    title: '安排会面熟悉',
    desc: '守护者回复后，可以约一次服务前的线下见面，让您、您的宠物和守护者互相认识。',
  },
  {
    icon: 'calendar-check',
    title: '确认预约',
    desc: '见面满意后通过平台完成预约确认和付款，平台全程保障您的权益。',
  },
];

function BFSuccessScreen({ guardian, onGoToOrders }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, overflow:'hidden', position:'relative' }}>
      {/* Nav */}
      <div style={{ flex:'0 0 auto', height:52, background:'#fff', borderBottom:`1px solid ${LL.border}`,
        display:'flex', alignItems:'center', padding:'0 16px' }}>
        <div style={{ flex:1, textAlign:'center', fontSize:15, fontWeight:700, color:LL.text }}>预约详情</div>
      </div>

      <div style={{ flex:1, overflowY:'auto', background:LL.bg }}>
        {/* Hero — icon + title on same row */}
        <div style={{ background:'#fff', padding:'28px 24px 24px', display:'flex', alignItems:'center', gap:18 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:BF_MINT,
            display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' }}>
            <i className="ph-fill ph-check-circle" style={{ fontSize:28, color:BF_MINT_DARK }}/>
          </div>
          <div style={{ fontSize:30, fontWeight:800, color:LL.text, letterSpacing:'-0.02em', lineHeight:1.2 }}>
            申请已发出
          </div>
        </div>
        {/* Profile completion hint */}
        <div style={{ background:'#fff', borderTop:`1px solid ${LL.border}`,
          padding:'12px 20px', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12.5, color:LL.text2, lineHeight:1.55 }}>
              您的宠物资料完成度 <span style={{ color:'#E63946', fontWeight:700 }}>&lt;60%</span>，完善宠物资料可以提高接单率，让守护者更好地照顾您的宝贝哦
            </div>
          </div>
          <button style={{
            height:32, padding:'0 14px', borderRadius:999,
            border:`1.5px solid ${LL.ink}`, background:'transparent',
            color:LL.ink, fontSize:12.5, fontWeight:700,
            cursor:'pointer', whiteSpace:'nowrap', fontFamily:LL.font, flex:'0 0 auto',
          }}>去完善</button>
        </div>

        {/* Steps */}
        <div style={{ background:'#fff', marginTop:12 }}>
          {BF_STEPS.map((step, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'flex-start', gap:16,
              padding:'18px 20px',
              borderBottom: i < BF_STEPS.length - 1 ? `1px solid ${LL.border}` : 'none',
            }}>
              {/* Thin-line circle icon */}
              <div style={{
                width:46, height:46, borderRadius:'50%',
                border:`1.5px solid ${LL.text3}`,
                display:'flex', alignItems:'center', justifyContent:'center',
                flex:'0 0 auto',
              }}>
                <i className={`ph ph-${step.icon}`} style={{ fontSize:22, color:LL.text2 }} />
              </div>
              {/* Text */}
              <div style={{ flex:1, paddingTop:2 }}>
                <div style={{ fontSize:15, fontWeight:700, color:LL.text, marginBottom:5 }}>
                  {step.title}
                </div>
                <div style={{ fontSize:13.5, color:LL.text2, lineHeight:1.65, textWrap:'pretty' }}>
                  {step.desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ padding:'24px 20px 48px' }}>
          <button onClick={onGoToOrders} style={{
            width:'100%', height:52, borderRadius:999, border:0,
            background:LL.ink, color:'#fff',
            fontSize:15, fontWeight:700, fontFamily:LL.font,
            cursor:'pointer', letterSpacing:'0.04em',
          }}>查看申请单状态</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main: BookingFlowScreen ──────────────────────────────────
function BookingFlowScreen({ guardian, initialService, initialDateRange, initialSchedule, myPets, onBack, onSubmit, onGoHome, onGoToOrders }) {
  // ── Resolve initial service
  const resolvedSvc = React.useMemo(() => {
    if (initialService && guardian.services.find(s=>s.id===initialService)) return initialService;
    return guardian.services[0]?.id || '寄养';
  }, []); // eslint-disable-line

  // ── Pet list (user's own pets; falls back to demo pets if none passed)
  const petsList = (myPets && myPets.length) ? myPets : BF_MY_PETS;

  // ── Form state — date defaults to the searched range when provided
  const [service,    setService]    = React.useState(resolvedSvc);
  const [dateRange,  setDateRange]  = React.useState(
    (initialDateRange && initialDateRange.start) ? initialDateRange : { start:null, end:null }
  );
  const [schedule,   setSchedule]   = React.useState(initialSchedule  || (typeof defaultSchedule==='function' ? defaultSchedule() : { type:'once',dates:{start:null,end:null},weekdays:[],periods:[] }));
  const [duration,   setDuration]   = React.useState(30);
  const [walkTimes,   setWalkTimes]   = React.useState({});
  const [sameAsFirst, setSameAsFirst] = React.useState({});
  const [dropoff,    setDropoff]    = React.useState(null);
  const [pickup,     setPickup]     = React.useState(null);
  const [petEnabled, setPetEnabled] = React.useState(() =>
    Object.fromEntries(petsList.map(p => [p.id, true]))
  );
  const [extras,     setExtras]     = React.useState({});
  const [coupon,     setCoupon]     = React.useState(null);   // selected coupon object | null
  const [couponOpen, setCouponOpen] = React.useState(false);
  const [smsNotify,  setSmsNotify]  = React.useState(true);
  const [message,    setMessage]    = React.useState('');
  const [phone,      setPhone]      = React.useState('');
  const [validated,  setValidated]  = React.useState(false);
  const [cancelPolicyOpen, setCancelPolicyOpen] = React.useState(false);

  // ── Service address (在宠物主家 services only)
  const [addresses,      setAddresses]      = React.useState([]);
  const [selectedAddrId, setSelectedAddrId] = React.useState(null);
  const [mapOpen,        setMapOpen]        = React.useState(false);
  const [editingAddrId,  setEditingAddrId]  = React.useState(null);

  // ── Screen state: 'form' | 'recommendation' | 'success'
  const [screen, setScreen] = React.useState('form');

  // ── Picker state
  const [picker, setPicker] = React.useState(null);
  const [priceOpen, setPriceOpen] = React.useState(false);
  const bottomAreaRef = React.useRef(null);
  const scrollBodyRef = React.useRef(null);
  const dateRef   = React.useRef(null);
  const petRef    = React.useRef(null);
  const phoneRef  = React.useRef(null);
  const addrRef   = React.useRef(null);
  const msgRef    = React.useRef(null);
  const [bottomH, setBottomH] = React.useState(0);
  React.useEffect(() => {
    if (bottomAreaRef.current) setBottomH(bottomAreaRef.current.offsetHeight);
  });

  // ── Derived
  const form        = BF_SVC_FORM[service] || 'A';
  const isFormB     = form === 'B';
  const isHomeguard = service === '伴宠留宿';
  const isPetHome   = BF_SVC_SUB[service] === '在宠物主家';

  // ── Per-day walk-time picker (遛狗 / 上门喂养) ──
  const serviceDays = React.useMemo(() => isFormB ? bfServiceDays(schedule) : [], [isFormB, schedule]);
  const serviceDaysKey = serviceDays.map(bfDayKey).join(',');
  React.useEffect(() => {
    if (!serviceDays.length) return;
    setWalkTimes(prev => {
      const next = { ...prev };
      serviceDays.forEach((d, i) => {
        const k = bfDayKey(d);
        if (!(k in next)) next[k] = i === 0 ? bfPeriodDefaults(schedule.periods) : [];
      });
      return next;
    });
  }, [serviceDaysKey, isFormB]); // eslint-disable-line
  const toggleWalkTime = (k, t) => setWalkTimes(prev => {
    const cur = prev[k] || [];
    const has = cur.includes(t);
    return { ...prev, [k]: has ? cur.filter(x => x !== t) : [...cur, t].sort() };
  });
  const toggleSameAsFirst = (k, v) => setSameAsFirst(prev => ({ ...prev, [k]: v }));
  const currentSvc  = guardian.services.find(s=>s.id===service);
  const dropoffLabel= isHomeguard ? '守护者到达时间段':'送达时间段';
  const pickupLabel = isHomeguard ? '守护者离开时间段':'接回时间段';

  // Night/session count for price bar
  const nights = React.useMemo(() => {
    if (form==='A' && dateRange.start && dateRange.end) return bfDaysBetween(dateRange.start, dateRange.end);
    return 0;
  }, [form, dateRange]);

  const sessions = React.useMemo(() => {
    if (form !== 'B') return 0;
    const periods = Math.max(1, schedule.periods?.length || 1);
    if (schedule.type === 'once' && schedule.pickMode === 'single') {
      return (schedule.dates?.days?.length || 0) * periods;
    }
    if (!schedule.dates?.start) return 0;
    if (schedule.type === 'once') {
      const days = schedule.dates.end ? Math.max(1, bfDaysBetween(schedule.dates.start, schedule.dates.end)) : 1;
      return days * periods;
    }
    if (!schedule.weekdays?.length || !schedule.dates?.end) return schedule.weekdays?.length ? schedule.weekdays.length * periods : 0;
    const totalDays = bfDaysBetween(schedule.dates.start, schedule.dates.end);
    return Math.ceil(totalDays / 7) * schedule.weekdays.length * periods;
  }, [form, schedule]);

  const unitCount = form === 'A' ? nights : sessions;

  // Cancel deadline date (1 day before service start)
  const cancelDate = React.useMemo(() => {
    const start = form === 'A' ? dateRange.start : schedule.dates?.start;
    if (!start) return null;
    const d = new Date(start); d.setDate(d.getDate() - 1); return d;
  }, [form, dateRange, schedule]);
  const cancelDateStr = cancelDate ? bfFmtDate(cancelDate) : '服务前一天';

  // Validation errors (only active after first submit attempt)
  const errors = React.useMemo(() => {
    if (!validated) return {};
    return {
      date:    isFormB
        ? (schedule.type==='once' && schedule.pickMode==='single' ? !(schedule.dates?.days?.length) : !schedule.dates?.start)
        : (!dateRange.start || !dateRange.end),
      pet:     !Object.values(petEnabled).some(Boolean),
      address: isPetHome && !selectedAddrId,
      phone:   !phone.trim(),
      message: !message.trim(),
    };
  }, [validated, isFormB, schedule, dateRange, petEnabled, phone, message, isPetHome, selectedAddrId]);

  // Pet count for pricing
  const petCount = Math.max(1, Object.values(petEnabled).filter(Boolean).length);

  // ── Per-species pricing — dog & cat priced separately (not ×count) ──
  const speciesPriceFor = (pet) => {
    const sp = pet?.species || bfSpeciesFromBreed(pet?.breed);
    const tab = currentSvc?.petPricingTabs?.find(t => t.type === sp);
    const base = tab?.weights?.[0]?.price;
    return (typeof base === 'number') ? base : (currentSvc?.price || 0);
  };
  const pricedPets = petsList.filter(p => petEnabled[p.id]).map(p => ({
    id: p.id, name: p.name,
    species: p.species || bfSpeciesFromBreed(p.breed),
    unit: speciesPriceFor(p),
  }));
  const petUnitSum = pricedPets.reduce((s,p) => s + p.unit, 0) || (currentSvc?.price || 0);

  // ── Overtime fee (Form A): 接回 later in the day than 送达 ──
  const overtime = React.useMemo(() => {
    if (form !== 'A' || !dropoff || !pickup) return { mins:0, fee:0, rate:0 };
    const diff = (pickup.h*60 + (pickup.m||0)) - (dropoff.h*60 + (dropoff.m||0));
    if (diff <= 0) return { mins:0, fee:0, rate:0 };
    const rate = diff > 8*60 ? 1 : 0.5;
    return { mins:diff, fee:Math.round(petUnitSum * rate), rate };
  }, [form, dropoff, pickup, petUnitSum]);

  // Label for the enabled pets (used on the order card / summary)
  const petLabel = React.useMemo(() => {
    const en = petsList.filter(p => petEnabled[p.id]);
    if (!en.length) return '我的宠物';
    const names = en.map(p => p.name).filter(Boolean).join('、') || '我的宠物';
    return en[0].breed ? `${en[0].breed}·${names}` : names;
  }, [petEnabled, petsList]);

  // Extras array for price bar / drawer (qty-based)
  const extrasArr = BF_EXTRAS.map(e => ({ ...e, qty: extras[e.id] || 0 }));

  // Date summary for the date row (Form B only)
  const dateSummaryB = React.useMemo(() => {
    if (!isFormB) return null;
    return typeof summarizeQuery==='function' ? summarizeQuery({ svcType: service, dateRange, schedule }) : null;
  }, [isFormB, service, dateRange, schedule]);

  // Date summary for Form A single-line row: "x月x日-x月x日 共N晚"
  const dateSummaryA = React.useMemo(() => {
    if (isFormB || !dateRange.start || !dateRange.end) return null;
    const n = bfDaysBetween(dateRange.start, dateRange.end);
    const unit = currentSvc?.unit || '晚';
    return `${bfFmtDate(dateRange.start)}-${bfFmtDate(dateRange.end)} 共${n}${unit}`;
  }, [isFormB, dateRange, currentSvc]);

  // ── Address helpers
  const selectedAddr = addresses.find(a => a.id === selectedAddrId) || null;
  const openAddrNew  = () => { setEditingAddrId(null); setMapOpen(true); };
  const openAddrEdit = (id) => { setEditingAddrId(id); setMapOpen(true); };
  const handleAddrConfirm = ({ poi, area, detail }) => {
    if (editingAddrId) {
      setAddresses(prev => prev.map(a => a.id === editingAddrId ? { ...a, poi, area, detail } : a));
      setSelectedAddrId(editingAddrId);
    } else {
      const id = `addr-${Date.now()}`;
      setAddresses(prev => [...prev, { id, poi, area, detail }]);
      setSelectedAddrId(id);
    }
    setMapOpen(false);
    setEditingAddrId(null);
  };

  // Auto-fill message
  React.useEffect(() => {
    const enabledPets = petsList.filter(p => petEnabled[p.id]);
    const petName = enabledPets.length > 0 ? enabledPets.map(p => p.name).join('和') : '[宠物名]';
    let ds = '';
    if (form === 'A' && dateRange.start) ds = bfFmtDate(dateRange.start);
    else if (form === 'B') {
      if (schedule.pickMode === 'single' && schedule.dates?.days?.length) {
        const sorted = schedule.dates.days.slice().sort((a, b) => a - b);
        ds = bfFmtDate(sorted[0]);
      } else if (schedule.dates?.start) {
        ds = bfFmtDate(schedule.dates.start);
      }
    }
    const dateStr = ds || '[预约日期]';
    let tmpl = '';
    if (service === '寄养' || service === '日托') {
      tmpl = `您好！想请问一下您在 ${dateStr} 方便在您家照看我的宝贝 ${petName} 吗？`;
    } else if (service === '上门喂养' || service === '伴宠留宿') {
      tmpl = `您好！想请问一下您在 ${dateStr} 方便来我家照看我的宝贝 ${petName} 吗？`;
    } else if (service === '遛狗') {
      tmpl = `您好！想请问一下您在 ${dateStr} 方便来我家遛 ${petName} 吗？`;
    } else {
      tmpl = enabledPets.length > 0 ? `您好！想请问一下您在 ${dateStr} 方便帮我照看 ${petName} 吗？` : '';
    }
    setMessage(tmpl);
  }, [petEnabled, dateRange, schedule, form, service]);

  // ── Handlers
  const handleApply = () => {
    setValidated(true);
    const hasDateErr = isFormB
      ? (schedule.type==='once' && schedule.pickMode==='single' ? !(schedule.dates?.days?.length) : !schedule.dates?.start)
      : (!dateRange.start || !dateRange.end);
    const hasPetErr    = !Object.values(petEnabled).some(Boolean);
    const hasAddrErr   = isPetHome && !selectedAddrId;
    const hasPhoneErr  = !phone.trim();
    const hasMsgErr    = !message.trim();
    if (hasDateErr || hasPetErr || hasAddrErr || hasPhoneErr || hasMsgErr) {
      const target = hasDateErr ? dateRef : hasPetErr ? petRef : hasAddrErr ? addrRef : hasPhoneErr ? phoneRef : msgRef;
      if (target.current && scrollBodyRef.current) {
        scrollBodyRef.current.scrollTop = target.current.offsetTop - 60;
      }
      return;
    }
    setScreen('recommendation');
  };

  const handleContact = (recChecked, recMsg) => {
    const additionalGuardians = BF_RECS.filter(r => recChecked[r.id]);
    onSubmit?.({
      guardian, service, dateRange, schedule, additionalGuardians,
      pet: petLabel,
      phone, address: selectedAddr || null,
      message: recMsg,
      dropoff: dropoff ? bfFmtTime(dropoff) : null,
      pickup:  pickup  ? bfFmtTime(pickup)  : null,
      nights: unitCount, unitPrice: petUnitSum || (currentSvc?.price || 0),
      petBreakdown: pricedPets,
      extrasList: extrasArr.filter(e => (e.qty||0) > 0).map(e => ({ label:e.label, price:e.price, qty:e.qty })),
      overtimeFee: overtime.fee, overtimeRate: overtime.rate,
      coupon: coupon || null,
    });
    setScreen('success');
  };

  const handleSkip = () => {
    onSubmit?.({
      guardian, service, dateRange, schedule, additionalGuardians: [],
      pet: petLabel,
      phone, address: selectedAddr || null,
      message,
      dropoff: dropoff ? bfFmtTime(dropoff) : null,
      pickup:  pickup  ? bfFmtTime(pickup)  : null,
      nights: unitCount, unitPrice: petUnitSum || (currentSvc?.price || 0),
      petBreakdown: pricedPets,
      extrasList: extrasArr.filter(e => (e.qty||0) > 0).map(e => ({ label:e.label, price:e.price, qty:e.qty })),
      overtimeFee: overtime.fee, overtimeRate: overtime.rate,
      coupon: coupon || null,
    });
    setScreen('success');
  };

  // ── Render: Success
  if (screen === 'success') {
    return (
      <div style={{ display:'flex',flexDirection:'column',flex:1,position:'relative' }}>
        <BFSuccessScreen guardian={guardian} onGoToOrders={() => onGoToOrders?.()}/>
      </div>
    );
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
        onSkip={handleSkip}
      />
    );
  }

  // ── Render: Main Form
  return (
    <div style={{ display:'flex',flexDirection:'column',flex:1,position:'relative',overflow:'hidden' }}>

      {/* Top Nav */}
      <div style={{ flex:'0 0 auto',height:52,background:'#fff',borderBottom:`1px solid ${LL.border}`,
        display:'flex',alignItems:'center',padding:'0 16px',zIndex:10 }}>
        <button onClick={onBack} style={{ display:'flex',alignItems:'center',gap:3,background:'transparent',border:0,
          cursor:'pointer',fontFamily:LL.font,padding:0,color:LL.text2,fontSize:13.5 }}>
          <i className="ph ph-caret-left" style={{ fontSize:16,color:LL.text2 }}/>
          返回
        </button>
        <div style={{ flex:1,textAlign:'center',fontSize:15,fontWeight:700,color:LL.text }}>预约详情</div>
        <div style={{ width:48 }}/>
      </div>

      {/* Scrollable content */}
      <div ref={scrollBodyRef} style={{ flex:1,overflowY:'auto',overflowX:'hidden',background:LL.bg }}>

        {/* ── 1. 服务 */}
        <div style={{ marginTop:12 }}>
          <BFGroupHeader title="服务"/>
          <button onClick={() => setPicker('service')} style={{
            width:'100%',padding:'15px 16px',background:'#fff',border:0,
            display:'flex',alignItems:'center',gap:14,cursor:'pointer',fontFamily:LL.font,textAlign:'left',
          }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:16,fontWeight:700,color:LL.text }}>{service}</div>
              <div style={{ marginTop:5 }}>
                <span style={{
                  fontSize:11.5, fontWeight:600,
                  color: BF_LOC_COLOR(service).fg,
                  background: BF_LOC_COLOR(service).bg,
                  borderRadius:4, padding:'2px 8px',
                }}>{BF_SVC_SUB[service]}</span>
              </div>
            </div>
            <i className={`ph ph-${BF_SVC_ICON[service]}`} style={{ fontSize:30,color:LL.text3 }}/>
            <i className="ph ph-caret-right" style={{ fontSize:13,color:LL.text3 }}/>
          </button>
        </div>

        {/* ── 2. 时间 */}
        <div style={{ marginTop:12 }} ref={dateRef}>
          <BFGroupHeader title="时间"/>
          <div style={{ background:'#fff' }}>
            {/* Form A: single-line date summary row → opens calendar drawer */}
            {!isFormB && (
              <button onClick={() => setPicker('dateA')} style={{
                width:'100%', padding:'14px 16px', background:'transparent', border:0,
                display:'flex', alignItems:'center', borderBottom:`1px solid ${LL.border}`,
                cursor:'pointer', fontFamily:LL.font, textAlign:'left',
              }}>
                <span style={{ fontSize:14, fontWeight:500, color:LL.text, flex:'0 0 auto' }}>服务日期</span>
                <span style={{ fontSize:13, marginLeft:'auto', marginRight:4,
                  color: dateSummaryA ? LL.text : LL.text3, fontWeight: dateSummaryA ? 600 : 400 }}>
                  {dateSummaryA || '添加日期'}
                </span>
                <i className="ph ph-caret-right" style={{ fontSize:12, color:LL.text3 }}/>
              </button>
            )}
            {/* Form B: schedule row */}
            {isFormB && (
              <button onClick={() => setPicker('dateB')} style={{
                width:'100%',padding:'14px 16px',background:'transparent',border:0,
                display:'flex',alignItems:'center',borderBottom:`1px solid ${LL.border}`,
                cursor:'pointer',fontFamily:LL.font,textAlign:'left',
              }}>
                <span style={{ fontSize:14,fontWeight:500,color:LL.text,flex:1 }}>日期与时段</span>
                <span style={{ fontSize:13,marginRight:4,color:dateSummaryB?LL.text:LL.text3,fontWeight:dateSummaryB?600:400 }}>
                  {dateSummaryB||'添加日期'}
                </span>
                <i className="ph ph-caret-right" style={{ fontSize:12,color:LL.text3 }}/>
              </button>
            )}
            {/* 服务时长 — Form B: shown below 日期与时段 row */}
            {isFormB && (
              <div style={{ padding:'12px 16px',borderBottom:`1px solid ${LL.border}`,display:'flex',alignItems:'center' }}>
                <span style={{ fontSize:14,fontWeight:500,color:LL.text,flex:1 }}>服务时长</span>
                <div style={{ display:'flex',gap:8 }}>
                  {[30,60].map(min => (
                    <button key={min} onClick={() => setDuration(min)} style={{
                      height:32,padding:'0 16px',borderRadius:999,border:0,
                      background: duration===min ? LL.ink:'#F0F0F6',
                      color: duration===min ? '#fff':LL.text2,
                      fontSize:13,fontWeight:duration===min?700:500,
                      cursor:'pointer',fontFamily:LL.font,transition:'all 140ms',
                    }}>{min}分钟</button>
                  ))}
                </div>
              </div>
            )}
            {/* 送达/到达 time — Form A */}
            {!isFormB && (
              <button onClick={() => setPicker('dropoff')} style={{
                width:'100%',padding:'14px 16px',background:'transparent',border:0,
                display:'flex',alignItems:'center',borderBottom:`1px solid ${LL.border}`,
                cursor:'pointer',fontFamily:LL.font,textAlign:'left',
              }}>
                <span style={{ fontSize:14,fontWeight:500,color:LL.text,flex:1 }}>{dropoffLabel}</span>
                <span style={{ fontSize:13,marginRight:4,color:dropoff?LL.text:LL.text3,fontWeight:dropoff?600:400 }}>
                  {dropoff ? bfFmtTime(dropoff):'添加时间段'}
                </span>
                <i className="ph ph-caret-right" style={{ fontSize:12,color:LL.text3 }}/>
              </button>
            )}
            {/* 接回/离开 time — Form A */}
            {!isFormB && (
              <button onClick={() => setPicker('pickup')} style={{
                width:'100%',padding:'14px 16px',background:'transparent',border:0,
                display:'flex',alignItems:'center',
                cursor:'pointer',fontFamily:LL.font,textAlign:'left',
              }}>
                <span style={{ fontSize:14,fontWeight:500,color:LL.text,flex:1 }}>{pickupLabel}</span>
                <span style={{ fontSize:13,marginRight:4,color:pickup?LL.text:LL.text3,fontWeight:pickup?600:400 }}>
                  {pickup ? bfFmtTime(pickup):'添加时间段'}
                </span>
                <i className="ph ph-caret-right" style={{ fontSize:12,color:LL.text3 }}/>
              </button>
            )}
          </div>
          {errors.date && (
            <div style={{ padding:'6px 16px 10px', fontSize:12, color:'#E63946', display:'flex', alignItems:'center', gap:4 }}>
              <i className="ph ph-warning-circle" style={{ fontSize:13 }}/>
              {isFormB ? '请选择服务日期和时段' : '请选择服务的开始和结束日期'}
            </div>
          )}
        </div>

        {/* ── 2b. 选择每天的服务时间（遛狗 / 上门喂养） */}
        {isFormB && serviceDays.length > 0 && (
          <div style={{ marginTop:12 }}>
            <BFGroupHeader title={service === '遛狗' ? '选择遛狗时间' : '选择上门时间'}/>
            <BFWalkTimes
              days={serviceDays}
              walkTimes={walkTimes}
              sameAsFirst={sameAsFirst}
              onToggleTime={toggleWalkTime}
              onToggleSame={toggleSameAsFirst}
              serviceLabel={service === '遛狗' ? '遛狗' : '上门'}
            />
          </div>
        )}

        {/* ── 3. 宠物 */}
        <div style={{ marginTop:12 }} ref={petRef}>
          <BFGroupHeader title="宠物"/>
          <div style={{ background:'#fff' }}>
            {petsList.map((pet) => {
              const wt = pet.weight ? (String(pet.weight).includes('公斤') ? pet.weight : `${pet.weight}公斤`) : null;
              const sub = [pet.breed, wt, pet.age].filter(Boolean).join(' · ');
              return (
              <div key={pet.id} style={{ display:'flex',alignItems:'center',padding:'12px 16px',gap:12,borderBottom:`1px solid ${LL.border}` }}>
                <div style={{ width:46,height:46,borderRadius:'50%',background:pet.bg || LL.butter,flex:'0 0 auto',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  {pet.photo
                    ? <img src={pet.photo} alt={pet.name} style={{ width:'100%',height:'100%',objectFit:'cover' }}/>
                    : <i className="ph ph-paw-print" style={{ fontSize:22,color:LL.text }}/>}
                </div>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ fontSize:14,fontWeight:700,color:LL.text }}>{pet.name}</div>
                  {sub && <div style={{ fontSize:12,color:LL.text3,marginTop:2 }}>{sub}</div>}
                </div>
                <BFToggle on={petEnabled[pet.id]} onChange={v => setPetEnabled(prev=>({...prev,[pet.id]:v}))}/>
              </div>
              );
            })}
            <button style={{ width:'100%',padding:'14px 16px',background:'transparent',border:0,
              display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',fontFamily:LL.font }}>
              <span style={{ fontSize:14,color:LL.text2 }}>添加宠物</span>
              <i className="ph ph-caret-right" style={{ fontSize:12,color:LL.text3 }}/>
            </button>
          </div>
          {errors.pet && (
            <div style={{ padding:'6px 16px 10px', fontSize:12, color:'#E63946', display:'flex', alignItems:'center', gap:4 }}>
              <i className="ph ph-warning-circle" style={{ fontSize:13 }}/>
              请至少选择一只宠物
            </div>
          )}
        </div>

        {/* ── 4. 额外服务（optional） */}
        <div style={{ marginTop:12 }}>
          <BFGroupHeader title="额外服务（可选）"/>
          <div style={{ background:'#fff' }}>
            {BF_EXTRAS.map((ex,i) => {
              const qty = extras[ex.id] || 0;
              return (
                <div key={ex.id} style={{ padding:'14px 16px',borderBottom:i<BF_EXTRAS.length-1?`1px solid ${LL.border}`:'none' }}>
                  <div style={{ display:'flex',alignItems:'center',gap:12 }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14,fontWeight:600,color:LL.text }}>{ex.label} <span style={{ color:LL.text3,fontWeight:500 }}>+¥{ex.price}/份</span></div>
                      <div style={{ fontSize:12,color:LL.text3,marginTop:3,lineHeight:1.5 }}>{ex.desc}</div>
                    </div>
                    <BFStepper value={qty} onChange={v => setExtras(prev=>({...prev,[ex.id]:v}))}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 5. 联系方式 */}
        <div style={{ marginTop:12 }} ref={phoneRef}>
          <BFGroupHeader title="联系方式"/>
          <div style={{ background:'#fff' }}>
            {/* 地址 — required for 在宠物主家 services (遛狗 / 上门喂养 / 伴宠留宿) */}
            {isPetHome && (
              <div ref={addrRef} style={{ borderBottom:`1px solid ${LL.border}` }}>
                <div style={{ display:'flex', alignItems:'center', padding:'12px 16px 6px' }}>
                  <span style={{ fontSize:14, fontWeight:500, color:LL.text }}>服务地址</span>
                  <span style={{ fontSize:13, color:'#E63946', marginLeft:3 }}>*</span>
                </div>
                {addresses.length === 0 ? (
                  <button onClick={openAddrNew} style={{
                    width:'100%', padding:'2px 16px 14px', background:'transparent', border:0,
                    display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontFamily:LL.font, textAlign:'left',
                  }}>
                    <i className="ph ph-map-pin" style={{ fontSize:16, color:LL.text3, flex:'0 0 auto' }}/>
                    <span style={{ fontSize:13.5, color: errors.address ? '#E63946' : LL.text3, flex:1 }}>请选择服务地址</span>
                    <i className="ph ph-caret-right" style={{ fontSize:12, color:LL.text3 }}/>
                  </button>
                ) : (
                  <div style={{ padding:'2px 16px 14px', display:'flex', flexDirection:'column', gap:8 }}>
                    {addresses.map(a => {
                      const on = a.id === selectedAddrId;
                      return (
                        <button key={a.id} onClick={() => setSelectedAddrId(a.id)} style={{
                          display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', borderRadius:12,
                          border: on ? `1.5px solid ${LL.ink}` : `1.5px solid ${LL.border}`,
                          background: on ? '#FAFAFC' : '#fff', cursor:'pointer', fontFamily:LL.font,
                          textAlign:'left', width:'100%', transition:'border-color 140ms',
                        }}>
                          <i className={`${on ? 'ph-fill' : 'ph'} ph-map-pin`} style={{ fontSize:16, color: on ? LL.ink : LL.text3, marginTop:1, flex:'0 0 auto' }}/>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13.5, fontWeight:700, color:LL.text }}>{a.poi}</div>
                            <div style={{ fontSize:12, color:LL.text3, marginTop:2, lineHeight:1.45 }}>
                              {a.area}{a.detail ? ` ${a.detail}` : ''}
                            </div>
                          </div>
                          {on && <i className="ph-fill ph-check-circle" style={{ fontSize:18, color:LL.ink, flex:'0 0 auto' }}/>}
                        </button>
                      );
                    })}
                    <div style={{ display:'flex', gap:18, paddingTop:2 }}>
                      <button onClick={() => openAddrEdit(selectedAddrId)} style={{
                        background:'transparent', border:0, padding:0, cursor:'pointer', fontFamily:LL.font,
                        fontSize:13, fontWeight:600, color:LL.text2, textDecoration:'underline', textUnderlineOffset:'2px',
                      }}>修改地址</button>
                      <button onClick={openAddrNew} style={{
                        background:'transparent', border:0, padding:0, cursor:'pointer', fontFamily:LL.font,
                        fontSize:13, fontWeight:600, color:LL.text2, textDecoration:'underline', textUnderlineOffset:'2px',
                      }}>添加其他地址</button>
                    </div>
                  </div>
                )}
                {errors.address && (
                  <div style={{ padding:'0 16px 10px', fontSize:12, color:'#E63946', display:'flex', alignItems:'center', gap:4 }}>
                    <i className="ph ph-warning-circle" style={{ fontSize:13 }}/>
                    请选择服务地址
                  </div>
                )}
              </div>
            )}
            <div style={{ padding:'14px 16px', borderBottom:`1px solid ${LL.border}`, display:'flex', alignItems:'center', gap:12 }}>
              <span style={{ fontSize:14,fontWeight:500,color:LL.text,flex:'0 0 auto' }}>手机号码</span>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="请输入手机号码"
                style={{ flex:1, border:0, outline:'none', fontSize:14, color:LL.text,
                  background:'transparent', fontFamily:LL.font, textAlign:'right',
                  caretColor: LL.ink }}
              />
            </div>
            {errors.phone && (
              <div style={{ padding:'6px 16px 10px', fontSize:12, color:'#E63946', display:'flex', alignItems:'center', gap:4, borderBottom:`1px solid ${LL.border}` }}>
                <i className="ph ph-warning-circle" style={{ fontSize:13 }}/>
                请填写手机号码
              </div>
            )}
            <div style={{ display:'flex',alignItems:'center',padding:'14px 16px' }}>
              <span style={{ fontSize:14,fontWeight:500,color:LL.text,flex:1,lineHeight:1.4 }}>
                {guardian.name}回复时<br/>发短信通知我
              </span>
              <BFToggle on={smsNotify} onChange={setSmsNotify}/>
            </div>
          </div>
        </div>

        {/* ── 6. 留言 */}
        <div style={{ marginTop:12,marginBottom:12 }} ref={msgRef}>
          <BFGroupHeader title="留言"/>
          <div style={{ background:'#fff',padding:'14px 16px' }}>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              placeholder="向守护者介绍您的宠物和需求…"
              style={{ width:'100%',minHeight:88,border:'none',outline:'none',resize:'none',
                fontSize:14,color:LL.text,lineHeight:1.7,fontFamily:LL.font,
                background:'transparent',boxSizing:'border-box' }}/>
          </div>
          {errors.message && (
            <div style={{ padding:'6px 16px 10px', fontSize:12, color:'#E63946', display:'flex', alignItems:'center', gap:4 }}>
              <i className="ph ph-warning-circle" style={{ fontSize:13 }}/>
              请填写给守护者的留言
            </div>
          )}
        </div>
        <div style={{ height:8 }}/>
      </div>

      {/* Price Bar + CTA — wrapped for bottomOffset measurement */}
      <div ref={bottomAreaRef}>
        {currentSvc && (
          <PriceBar
            service={service}
            nights={unitCount}
            petUnitSum={petUnitSum}
            extras={extrasArr}
            pricedPets={pricedPets}
            overtimeFee={overtime.fee}
            onOpen={() => setPriceOpen(true)}
          />
        )}
        <div style={{ background:'#fff',padding:'10px 16px 20px' }}>
          <button onClick={handleApply} style={{
            width:'100%',height:52,borderRadius:999,border:0,
            background:LL.ink,color:'#fff',
            fontSize:16,fontWeight:700,fontFamily:LL.font,
            cursor:'pointer',letterSpacing:'0.06em',
            display:'flex',alignItems:'center',justifyContent:'center',
          }}>申请预约</button>
          <button onClick={() => setCancelPolicyOpen(true)} style={{
            display:'flex',alignItems:'center',justifyContent:'center',gap:5,
            width:'100%',marginTop:10,background:'transparent',border:0,cursor:'pointer',
            padding:0,fontFamily:LL.font,
          }}>
            <i className="ph ph-calendar-blank" style={{ fontSize:12,color:LL.text3 }}/>
            <span style={{ fontSize:11.5,color:LL.text3,textDecoration:'underline' }}>
              {cancelDateStr} 12:00前可免费取消
            </span>
          </button>
        </div>
      </div>

      {/* Pickers */}
      <BFServiceSheet open={picker==='service'} value={service} options={guardian.services}
        onPick={v => { setService(v); setPicker(null); }} onClose={() => setPicker(null)}/>
      <DateRangeDrawer open={picker==='dateA'} value={dateRange}
        bookedDates={guardian.bookedDates || []} svcUnit={currentSvc?.unit || '晚'}
        onApply={d => { setDateRange(d); setPicker(null); }} onClose={() => setPicker(null)}/>
      {typeof SchedulePickerSheet==='function' && (
        <SchedulePickerSheet open={picker==='dateB'} svcType={service}
          applyLabel="应用"
          value={schedule} onSearch={s => { setSchedule(s); setPicker(null); }} onClose={() => setPicker(null)}/>
      )}
      <TimeWheelSheet open={picker==='dropoff'} value={dropoff} title={dropoffLabel}
        onConfirm={t => { setDropoff(t); setPicker(null); }} onClose={() => setPicker(null)}/>
      <TimeWheelSheet open={picker==='pickup'} value={pickup} title={pickupLabel}
        onConfirm={t => { setPickup(t); setPicker(null); }} onClose={() => setPicker(null)}/>
      <PriceDrawer open={priceOpen} onClose={() => setPriceOpen(false)}
        service={service} nights={unitCount}
        petUnitSum={petUnitSum} pricedPets={pricedPets} extras={extrasArr}
        overtimeFee={overtime.fee} overtimeRate={overtime.rate}
        coupon={coupon} onOpenCoupon={() => setCouponOpen(true)}
        bottomOffset={bottomH}/>
      <BFCouponPicker open={couponOpen} coupons={BF_COUPONS}
        subtotal={petUnitSum * unitCount + extrasArr.reduce((s,e)=>s+(e.qty||0)*e.price,0) + overtime.fee}
        selectedId={coupon?.id || null}
        onPick={(id) => { setCoupon(id ? BF_COUPONS.find(c=>c.id===id) : null); setCouponOpen(false); }}
        onClose={() => setCouponOpen(false)}/>
      {cancelPolicyOpen && <CancelPolicyModal onClose={() => setCancelPolicyOpen(false)} />}
      {mapOpen && (
        <AddressMapScreen
          initial={editingAddrId ? addresses.find(a => a.id === editingAddrId) : null}
          onConfirm={handleAddrConfirm}
          onClose={() => { setMapOpen(false); setEditingAddrId(null); }}
        />
      )}
    </div>
  );
}

// ─── Cancel Policy Modal ──────────────────────────────────────
function CancelPolicyModal({ onClose }) {
  const sections = [
    {
      title: '全额退款',
      icon: 'check-circle',
      color: '#2C7A4B',
      bg: '#E6F1EC',
      text: '在服务开始前一天的 12:00 之前申请取消，可享免费取消（全额退款）。',
    },
    {
      title: '部分扣款',
      icon: 'warning',
      color: '#B45309',
      bg: '#FEF3C7',
      text: '在服务开始前一天的 12:00 之后申请取消，将扣除首日服务费的 20%，其余费用退还。',
    },
    {
      title: '多日订单',
      icon: 'calendar-blank',
      color: '#2F5F87',
      bg: '#E3EEF7',
      text: '若为连续多日的订单，扣款与退款标准将依据"提交申请当天"与"剩余未服务首日"之间的时差，参照上述规则同理推算。',
    },
  ];
  return (
    <>
      <div onClick={onClose} style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.45)',zIndex:95 }}/>
      <div style={{
        position:'absolute', left:16, right:16, top:'50%', transform:'translateY(-50%)',
        zIndex:96, background:'#fff', borderRadius:20,
        boxShadow:'0 16px 48px rgba(0,0,0,0.18)',
        fontFamily:LL.font, overflow:'hidden',
      }}>
        {/* Header */}
        <div style={{ padding:'20px 20px 14px', borderBottom:`1px solid ${LL.border}`, display:'flex', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:16, fontWeight:700, color:LL.text }}>取消政策</div>
            <div style={{ fontSize:12, color:LL.text3, marginTop:2 }}>Lou Lou 平台标准取消条款</div>
          </div>
          <button onClick={onClose} style={{
            marginLeft:'auto', width:30, height:30, borderRadius:'50%',
            border:0, background:'#F0F0F5', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <i className="ph ph-x" style={{ fontSize:13, color:LL.text }}/>
          </button>
        </div>
        {/* Policy sections */}
        <div style={{ padding:'14px 20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
          {sections.map((s,i) => (
            <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
              <div style={{
                width:34, height:34, borderRadius:10, background:s.bg,
                display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto',
              }}>
                <i className={`ph-fill ph-${s.icon}`} style={{ fontSize:17, color:s.color }}/>
              </div>
              <div style={{ flex:1, paddingTop:2 }}>
                <div style={{ fontSize:13.5, fontWeight:700, color:LL.text, marginBottom:4 }}>{s.title}</div>
                <div style={{ fontSize:12.5, color:LL.text2, lineHeight:1.65 }}>{s.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Cancel Policy (shared, reused by guardian service drawer) ─
const CANCEL_SECTIONS = [
  { title:'全额退款', icon:'check-circle', color:'#2C7A4B', bg:'#E6F1EC',
    text:'在服务开始前一天的 12:00 之前申请取消，可享免费取消（全额退款）。' },
  { title:'部分扣款', icon:'warning', color:'#B45309', bg:'#FEF3C7',
    text:'在服务开始前一天的 12:00 之后申请取消，将扣除首日服务费的 20%，其余费用退还。' },
  { title:'多日订单', icon:'calendar-blank', color:'#2F5F87', bg:'#E3EEF7',
    text:'若为连续多日的订单，扣款与退款标准将依据当天与剩余未服务首日之间的时差，参照上述规则同理推算。' },
];

function CancelPolicySections() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      {CANCEL_SECTIONS.map((s,i) => (
        <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
          <div style={{ width:34, height:34, borderRadius:10, background:s.bg,
            display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' }}>
            <i className={`ph-fill ph-${s.icon}`} style={{ fontSize:17, color:s.color }}/>
          </div>
          <div style={{ flex:1, paddingTop:2 }}>
            <div style={{ fontSize:13.5, fontWeight:700, color:LL.text, marginBottom:4 }}>{s.title}</div>
            <div style={{ fontSize:12.5, color:LL.text2, lineHeight:1.65 }}>{s.text}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { BookingFlowScreen, CancelPolicyModal, CancelPolicySections, BF_COUPONS, bfCouponDiscount, BFCouponPicker });
