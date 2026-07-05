// Lou Lou — BookingRequestScreen.jsx
// 订单管理页 + ChatView

const APP_GREEN    = '#2C7A4B';
const APP_GREEN_BG = '#E6F1EC';

// ─── helpers ─────────────────────────────────────────────────
function fmtNow() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// Resolve a guardian's avatar to the SAME source the profile uses.
// Maps photoKey / './assets/guardianN.png' → inlined __resources; returns
// null when the guardian has no real photo (caller shows the initial char).
function resolveGuardianPhoto(g) {
  if (!g) return null;
  const R = (typeof window !== 'undefined' && window.__resources) || {};
  if (g.photoKey && R[g.photoKey]) return R[g.photoKey];
  const p = g.photo || '';
  const m = p.match(/guardian(\d)/);
  if (m && R['guardian' + m[1]]) return R['guardian' + m[1]];
  if (/assets\//.test(p)) return null; // unresolved bundled path → no reliable image
  return p || null;
}

// ─── Status definitions ───────────────────────────────────────
// Flow: 发送申请 → 待确认 → 见面邀请 → 守护者确认接单 → 待付款 → 待完成 → 已完成
const STATUS_META = {
  pending:     { label:'待确认', tabKey:'待确认', color:'#B45309', bg:'#FEF3C7', desc:'申请已发出，等待守护者接受' },
  accepted:    { label:'待付款', tabKey:'待付款', color:APP_GREEN, bg:APP_GREEN_BG, desc:'守护者已确认接单，请尽快付款' },
  in_progress: { label:'待完成', tabKey:'待完成', color:'#2F5F87', bg:'#E3EEF7', desc:'服务进行中' },
  completed:   { label:'已完成', tabKey:'已完成', color:'#6B6B7A', bg:'#F0F0F5', desc:'服务已完成，感谢信任' },
  rejected:    { label:'已拒绝', tabKey:'已失效', color:'#CC2200', bg:'#FFF0F0', desc:'守护者暂时无法接受此申请' },
  cancelled:   { label:'已取消', tabKey:'已失效', color:'#6B6B7A', bg:'#F0F0F5', desc:'订单已取消' },
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{
      fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:999,
      background:m.bg, color:m.color, flex:'0 0 auto', whiteSpace:'nowrap',
    }}>{m.label}</span>
  );
}

// ─── Permanent mock apps (always visible) ─────────────────────
const BRS_MOCK_APPS = [
  {
    id:'mock-pending-1', status:'pending', batchId:'mock-batch-a',
    batchTime: new Date(2026, 4, 27, 9, 30),
    guardian:{ id:'mg1', name:'陈美玲', bg:'#FBD3C4', rating:4.8, services:[] },
    service:'寄养', dateStart:'6月5日', dateEnd:'6月7日',
    pet:'金毛·豆豆', area:'朝阳区·望京', nights:2, price:88,
    messages:[{ id:1, from:'system', text:'申请单已发送给 陈美玲，等待守护者回复', time:'09:30' }],
  },
  {
    id:'mock-accepted-1', status:'accepted', batchId:'mock-batch-a',
    batchTime: new Date(2026, 4, 27, 9, 30),
    guardian:{ id:'mg2', name:'林若', bg:'#EDE5F7', rating:4.97, services:[{ id:'日托', price:88, unit:'天' }] },
    service:'日托', dateStart:'5月30日', dateEnd:null,
    pet:'金毛·豆豆', area:'朝阳区·三里屯', nights:1, price:88,
    messages:[
      { id:1, from:'system', text:'申请单已发送给 林若，等待守护者回复', time:'08:00' },
      { id:2, from:'guardian', text:'您好！很开心认识您和豆豆。五月底我正好有空，很愿意照顾它。请问豆豆有什么特别需要注意的地方吗？', time:'08:15' },
    ],
  },
  {
    id:'mock-done-1', status:'completed', batchId:'mock-done-batch-1',
    batchTime: new Date(2026, 3, 10, 10, 0),
    guardian:{ id:'mg3', name:'张敏', bg:'#FEE7A6', rating:4.85, services:[] },
    service:'遛狗', dateStart:'4月10日', dateEnd:null,
    pet:'金毛·豆豆', area:'朝阳区·望京', nights:1, price:38,
    messages:[],
  },
  {
    id:'mock-done-2', status:'completed', batchId:'mock-done-batch-2',
    batchTime: new Date(2026, 3, 18, 9, 0),
    guardian:{ id:'mg4', name:'林若', bg:'#EDE5F7', rating:4.97, services:[] },
    service:'寄养', dateStart:'4月18日', dateEnd:'4月20日',
    pet:'金毛·豆豆', area:'朝阳区·望京', nights:2, price:176,
    messages:[],
  },
];

// ─── Message bubble ───────────────────────────────────────────
function MsgBubble({ msg, photoSrc, app, onOpenSummary }) {
  if (msg.from === 'system') {
    // Clickable "已修改订单" message → jump to order detail (summary)
    if (msg.action === 'summary') {
      return (
        <div style={{ display:'flex', justifyContent:'center', margin:'4px 0 14px', padding:'0 16px' }}>
          <button onClick={() => onOpenSummary?.(app)} style={{
            display:'flex', alignItems:'center', gap:8, maxWidth:'88%',
            background:'#fff', border:`1px solid ${LL.border}`, borderRadius:12,
            padding:'9px 13px', cursor:'pointer', fontFamily:LL.font,
            boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ width:26, height:26, borderRadius:7, background:'#EEF1F4',
              display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' }}>
              <i className="ph-fill ph-pencil-simple" style={{ fontSize:14, color:LL.text2 }}/>
            </div>
            <span style={{ fontSize:12.5, color:LL.text, fontWeight:500, lineHeight:1.4, textAlign:'left' }}>{msg.text}</span>
            <i className="ph ph-caret-right" style={{ fontSize:12, color:LL.text3, flex:'0 0 auto' }}/>
          </button>
        </div>
      );
    }
    return (
      <div style={{ textAlign:'center', fontSize:12, color:LL.text3, margin:'4px 0 14px', padding:'0 24px' }}>
        {msg.text}
      </div>
    );
  }
  const isUser = msg.from === 'user';
  return (
    <div style={{ display:'flex', justifyContent:isUser?'flex-end':'flex-start', marginBottom:14, alignItems:'flex-end', gap:8 }}>
      {!isUser && (
        <div style={{ width:34, height:34, borderRadius:'50%', overflow:'hidden', flex:'0 0 auto', background:app.guardian?.initial?.bg || LL.lavender, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {photoSrc
            ? <img src={photoSrc} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
            : <span style={{ fontSize:13, fontWeight:700, color:LL.text }}>{app.guardian?.initial?.char || app.guardian?.name?.[0]}</span>}
        </div>
      )}
      <div style={{
        maxWidth:'72%', padding:'10px 14px', fontSize:13.5, lineHeight:1.58,
        borderRadius:isUser?'18px 18px 4px 18px':'4px 18px 18px 18px',
        background:isUser?LL.ink:'#fff',
        color:isUser?'#fff':LL.text,
        boxShadow:isUser?'none':'0 1px 4px rgba(0,0,0,0.06)',
      }}>{msg.text}</div>
      {isUser && <div style={{ fontSize:10, color:LL.text3, alignSelf:'flex-end', marginBottom:2 }}>{msg.time}</div>}
    </div>
  );
}

// ─── Chat order shortcut button ───────────────────────────────
function ShortcutBtn({ icon, label, onClick, primary }) {
  return (
    <button onClick={onClick} style={{
      flex:1, height:38, borderRadius:10,
      border: primary ? 0 : `1px solid ${LL.border}`,
      background: primary ? LL.ink : '#fff',
      color: primary ? '#fff' : LL.text,
      fontSize:13, fontWeight:600, fontFamily:LL.font, cursor:'pointer',
      display:'flex', alignItems:'center', justifyContent:'center', gap:5,
    }}>
      <i className={`ph ph-${icon}`} style={{ fontSize:15 }}/>
      {label}
    </button>
  );
}

// ─── Meet & Greet invite (见面邀约) ───────────────────────────
function meetFmtDate(v) {
  if (!v) return '';
  if (v instanceof Date) return `${v.getMonth()+1}月${v.getDate()}日`;
  const m = String(v).match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(v);
  return `${parseInt(m[2],10)}月${parseInt(m[3],10)}日`;
}
function meetFmtTime(v) {
  if (!v) return '';
  let h, mm;
  if (typeof v === 'object' && v) { h = v.h; mm = String(v.m).padStart(2,'0'); }
  else {
    const m = String(v).match(/(\d{1,2}):(\d{2})/);
    if (!m) return String(v);
    h = parseInt(m[1],10); mm = m[2];
  }
  const ap = h < 12 ? '上午' : '下午';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ap}${h12}:${mm}`;
}

// Shared sub-page header — iOS status bar + 预约详情-style nav bar
// (matches the device status bar and the booking-detail top nav).
function MGNavBar({ title, onBack }) {
  return (
    <div style={{ flex:'0 0 auto', background:'#fff' }}>
      {typeof IOSStatusBar === 'function' && <IOSStatusBar/>}
      <div style={{ height:52, background:'#fff', borderBottom:`1px solid ${LL.border}`, display:'flex', alignItems:'center', padding:'0 16px' }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:3, background:'transparent', border:0, cursor:'pointer', fontFamily:LL.font, padding:0, color:LL.text2, fontSize:13.5 }}>
          <i className="ph ph-caret-left" style={{ fontSize:16, color:LL.text2 }}/>
          返回
        </button>
        <div style={{ flex:1, textAlign:'center', fontSize:15, fontWeight:700, color:LL.text }}>{title}</div>
        <div style={{ width:48 }}/>
      </div>
    </div>
  );
}

// Full-screen page to compose / edit a meet-and-greet invite.
// Date → bottom calendar drawer; time → TimeWheelSheet (same as 日托);
// location → AddressMapScreen (same as 预约详情) with a default address.
function MeetInvitePage({ initial, defaultLocation, onSend, onClose }) {
  const [date, setDate] = React.useState(initial?.date || null);          // Date | null
  const [time, setTime] = React.useState(initial?.time || null);          // { h, m } | null
  const [loc,  setLoc]  = React.useState(initial?.location || defaultLocation || '');
  const [msg,  setMsg]  = React.useState(initial?.message || '希望预约前先见个面，让宝贝和您彼此熟悉一下～');
  const [dateOpen, setDateOpen] = React.useState(false);
  const [timeOpen, setTimeOpen] = React.useState(false);
  const [mapOpen,  setMapOpen]  = React.useState(false);
  const editing = !!initial;
  const canSend = !!(date && time && loc.trim());
  const Calendar = (typeof GuardianCalendar === 'function') ? GuardianCalendar : null;

  const rowStyle = { width:'100%', display:'flex', alignItems:'center', gap:12, padding:'16px', background:'#fff', border:0, borderBottom:`1px solid ${LL.border}`, cursor:'pointer', fontFamily:LL.font, textAlign:'left' };
  const labelStyle = { fontSize:14.5, fontWeight:500, color:LL.text, flex:'0 0 auto' };
  const valStyle = (set) => ({ flex:1, fontSize:14, color:set?LL.text:LL.text3, fontWeight:set?600:400, textAlign:'right' });

  return (
    <div style={{ position:'absolute', inset:0, zIndex:94, background:LL.bg, display:'flex', flexDirection:'column', fontFamily:LL.font }}>
      {/* Nav */}
      <MGNavBar title={editing ? '修改见面邀约' : '见面邀约'} onBack={onClose}/>

      {/* Body */}
      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{ marginTop:12 }}>
          <button style={rowStyle} onClick={() => setDateOpen(true)}>
            <span style={labelStyle}>日期</span>
            <span style={valStyle(date)}>{date ? meetFmtDate(date) : '点击选择'}</span>
            <i className="ph ph-caret-right" style={{ fontSize:13, color:LL.text3 }}/>
          </button>
          <button style={rowStyle} onClick={() => setTimeOpen(true)}>
            <span style={labelStyle}>时间</span>
            <span style={valStyle(time)}>{time ? meetFmtTime(time) : '点击选择'}</span>
            <i className="ph ph-caret-right" style={{ fontSize:13, color:LL.text3 }}/>
          </button>
          <button style={{ ...rowStyle, borderBottom:0 }} onClick={() => setMapOpen(true)}>
            <span style={labelStyle}>地点</span>
            <span style={valStyle(loc)}>{loc || '设置见面地点'}</span>
            <i className="ph ph-caret-right" style={{ fontSize:13, color:LL.text3 }}/>
          </button>
        </div>

        <div style={{ marginTop:12, background:'#fff', borderTop:`1px solid ${LL.border}`, borderBottom:`1px solid ${LL.border}`, padding:'14px 16px' }}>
          <div style={{ fontSize:13, fontWeight:600, color:LL.text2, marginBottom:8 }}>留言（选填）</div>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="向守护者说明见面安排…"
            style={{ width:'100%', minHeight:80, border:`1px solid ${LL.border}`, borderRadius:10, padding:'10px 12px',
              fontSize:14, color:LL.text, fontFamily:LL.font, outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.6 }}/>
        </div>
      </div>

      {/* Bottom — prominent Cancel / Send buttons ABOVE the (larger) note */}
      <div style={{ flex:'0 0 auto', background:'#fff', borderTop:`1px solid ${LL.border}`, padding:'12px 16px 20px' }}>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={onClose} style={{ flex:1, height:50, borderRadius:999, border:`1.5px solid ${LL.border}`, background:'transparent', color:LL.text, fontSize:15, fontWeight:600, fontFamily:LL.font, cursor:'pointer' }}>取消</button>
          <button disabled={!canSend} onClick={() => onSend({ date, time, location:loc.trim(), message:msg.trim() })} style={{
            flex:2, height:50, borderRadius:999, border:0,
            background: canSend ? LL.ink : 'rgba(34,40,44,0.22)', color:'#fff',
            fontSize:15, fontWeight:700, fontFamily:LL.font, cursor: canSend?'pointer':'not-allowed', letterSpacing:'0.04em' }}>
            {editing ? '保存修改' : '发送邀约'}
          </button>
        </div>
        <div style={{ fontSize:13.5, color:LL.text2, lineHeight:1.7, textWrap:'pretty', marginTop:14 }}>
          见面是预约前相互了解的好机会，也能让宠物先熟悉守护者。双方都可以发起或修改见面邀约，对方会在 5 分钟内收到提醒。
        </div>
      </div>

      {/* Date — bottom calendar drawer */}
      {dateOpen && (
        <>
          <div onClick={() => setDateOpen(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', zIndex:96 }}/>
          <div style={{ position:'absolute', left:0, right:0, bottom:0, zIndex:97, background:'#fff', borderTopLeftRadius:20, borderTopRightRadius:20, boxShadow:'0 -8px 24px rgba(0,0,0,0.12)' }}>
            <div style={{ padding:'12px 16px 6px' }}>
              <div style={{ width:38, height:4, borderRadius:2, background:LL.border, margin:'0 auto 10px' }}/>
              <div style={{ display:'flex', alignItems:'center' }}>
                <div style={{ fontSize:16, fontWeight:700, color:LL.text }}>选择见面日期</div>
                <button onClick={() => setDateOpen(false)} style={{ marginLeft:'auto', width:30, height:30, borderRadius:'50%', border:0, background:'#F0F0F5', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <i className="ph ph-x" style={{ fontSize:13, color:LL.text }}/>
                </button>
              </div>
            </div>
            <div style={{ padding:'2px 16px 4px' }}>
              {Calendar && (
                <Calendar bookedDates={[]} svcPrice={null} viewOnly={false} scroll monthsCount={6}
                  start={date} end={null} onChange={(r) => setDate(r.end || r.start)}/>
              )}
            </div>
            <div style={{ padding:'10px 16px 22px', borderTop:`1px solid ${LL.border}` }}>
              <button disabled={!date} onClick={() => setDateOpen(false)} style={{
                width:'100%', height:50, borderRadius:999, border:0,
                background: date ? LL.ink : 'rgba(34,40,44,0.22)', color:'#fff',
                fontSize:16, fontWeight:700, fontFamily:LL.font, cursor: date?'pointer':'not-allowed', letterSpacing:'0.06em' }}>确定</button>
            </div>
          </div>
        </>
      )}

      {/* Time — same wheel sheet as 日托 送达/接回 time */}
      {typeof TimeWheelSheet === 'function' && (
        <TimeWheelSheet open={timeOpen} value={time} title="选择见面时间"
          onConfirm={(t) => { setTime(t); setTimeOpen(false); }} onClose={() => setTimeOpen(false)}/>
      )}

      {/* Location — same map page as 预约详情 */}
      {mapOpen && typeof AddressMapScreen === 'function' && (
        <AddressMapScreen
          initial={null}
          onConfirm={({ poi, area, detail }) => { setLoc(detail ? `${poi} ${detail}` : (poi || area)); setMapOpen(false); }}
          onClose={() => setMapOpen(false)}/>
      )}
    </div>
  );
}

// In-thread meet-and-greet card (viewable + editable by both parties)
function MeetCard({ meet, guardianName, onAccept, onModify, compact = false }) {
  const confirmed = meet.status === 'confirmed';
  return (
    <div style={{ background:'#fff', borderRadius:14, overflow:'hidden',
      border:`1px solid ${LL.border}`, boxShadow: compact ? 'none' : '0 1px 6px rgba(0,0,0,0.07)' }}>
      {/* Map strip */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:LL.lavender }}>
        <div style={{ width:34, height:34, borderRadius:9, background:'rgba(255,255,255,0.65)', display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' }}>
          <i className="ph-fill ph-map-pin" style={{ fontSize:18, color:'#5E4A87' }}/>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13.5, fontWeight:800, color:LL.text }}>见面邀约 · Meet &amp; Greet</div>
          <div style={{ fontSize:12, color:LL.text2, marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{meet.location}</div>
        </div>
      </div>
      {/* Details */}
      <div style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
        <i className="ph ph-calendar-blank" style={{ fontSize:15, color:LL.text3, flex:'0 0 auto' }}/>
        <span style={{ fontSize:13, color:LL.text, fontWeight:600 }}>{meetFmtDate(meet.date)} · {meetFmtTime(meet.time)}</span>
        <span style={{ marginLeft:'auto', fontSize:11.5, fontWeight:700, padding:'2px 8px', borderRadius:999,
          background: confirmed ? APP_GREEN_BG : '#FEF3C7', color: confirmed ? APP_GREEN : '#B45309' }}>
          {confirmed ? '已确认' : '待确认'}
        </span>
      </div>
      {meet.message && !compact && (
        <div style={{ padding:'0 14px 10px', fontSize:12.5, color:LL.text2, lineHeight:1.55 }}>{meet.message}</div>
      )}
      {/* Actions */}
      {!compact && (
        <div style={{ display:'flex', gap:8, padding:'0 14px 12px' }}>
          {!confirmed && (
            <button onClick={onAccept} style={{ flex:1, height:38, borderRadius:999, border:0, background:LL.ink, color:'#fff',
              fontSize:13, fontWeight:700, fontFamily:LL.font, cursor:'pointer' }}>接受见面</button>
          )}
          <button onClick={onModify} style={{ flex:1, height:38, borderRadius:999, border:`1.5px solid ${LL.border}`, background:'transparent',
            color:LL.text, fontSize:13, fontWeight:700, fontFamily:LL.font, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
            <i className="ph ph-pencil-simple" style={{ fontSize:14 }}/>修改
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Care Guide (照护指南) & Key Handoff (钥匙交接) ─────────────
const KEY_SCHEMES = [
  { id:'A', label:'智能密码锁',                         desc:'填写使用指示和密码（含符号按键）', field:'input',  placeholder:'例：按 #1234# 解锁，门把手下压开门' },
  { id:'B', label:'门口密码盒 / 消火栓 / 地垫下 / 快递柜', desc:'详细描述存放位置，可上传照片',     field:'photo',  placeholder:'例：右侧消火栓内密码盒，密码 5210' },
  { id:'C', label:'暂存小区物业 / 保安 / 邻居处',         desc:'填写提取姓名 / 电话',             field:'input',  placeholder:'例：12 号楼物业 王师傅 138****8888' },
  { id:'D', label:'行前会面时面对面交付',                 desc:'见面当天当面交接钥匙',           field:'none' },
  { id:'E', label:'行前闪送给守护者',                     desc:'通过同城闪送把钥匙寄给守护者',     field:'none' },
];

// Shared photo uploader (drag-free, file input)
function MGPhotos({ photos = [], onChange, max = 6 }) {
  const ref = React.useRef(null);
  const add = (e) => {
    const files = [...(e.target.files || [])];
    Promise.all(files.map(f => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); })))
      .then(urls => onChange([...(photos || []), ...urls].slice(0, max)));
    e.target.value = '';
  };
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
      {photos.map((p, i) => (
        <div key={i} style={{ position:'relative', width:72, height:72, borderRadius:10, overflow:'hidden', flex:'0 0 auto' }}>
          <img src={p} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          <button onClick={() => onChange(photos.filter((_, j) => j !== i))} style={{ position:'absolute', top:2, right:2, width:18, height:18, borderRadius:'50%', border:0, background:'rgba(0,0,0,0.55)', color:'#fff', cursor:'pointer', fontSize:11, lineHeight:1, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>
      ))}
      {photos.length < max && (
        <button onClick={() => ref.current && ref.current.click()} style={{ width:72, height:72, borderRadius:10, border:`1.5px dashed ${LL.border}`, background:LL.bg, cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3, color:LL.text3, fontFamily:LL.font }}>
          <i className="ph ph-camera" style={{ fontSize:20 }}/>
          <span style={{ fontSize:10 }}>上传照片</span>
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={add}/>
    </div>
  );
}

// Full-screen 照护指南 composer
function CareGuidePanel({ service, petName, saved = [], initial, onSave, onSend, onClose }) {
  const [text, setText]     = React.useState(initial?.text || '');
  const [photos, setPhotos] = React.useState(initial?.photos || []);
  const [importOpen, setImportOpen] = React.useState(false);
  const [toast, setToast]   = React.useState(null);
  const guideName = `${service || '服务'} ${petName || '宠物'}`;
  const canSend = !!(text.trim() || photos.length);
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 1600); };

  return (
    <div style={{ position:'absolute', inset:0, zIndex:94, background:LL.bg, display:'flex', flexDirection:'column', fontFamily:LL.font }}>
      <MGNavBar title="照护指南" onBack={onClose}/>

      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{ background:'#fff', padding:'14px 16px', borderBottom:`1px solid ${LL.border}` }}>
          <div style={{ fontSize:12.5, color:LL.text3, marginBottom:10 }}>将保存为：<b style={{ color:LL.text2 }}>{guideName}</b></div>
          <textarea value={text} onChange={e => setText(e.target.value)}
            placeholder="喂食（份量 / 时间）、遛弯习惯、作息、性格、禁忌与注意事项…"
            style={{ width:'100%', minHeight:150, border:`1px solid ${LL.border}`, borderRadius:10, padding:'12px', fontSize:14, color:LL.text, fontFamily:LL.font, outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.7 }}/>
        </div>
        <div style={{ background:'#fff', padding:'14px 16px', borderTop:`1px solid ${LL.border}` }}>
          <div style={{ fontSize:13, fontWeight:600, color:LL.text2, marginBottom:10 }}>照片（喂食区、用品摆放等）</div>
          <MGPhotos photos={photos} onChange={setPhotos}/>
        </div>
      </div>

      <div style={{ flex:'0 0 auto', background:'#fff', borderTop:`1px solid ${LL.border}`, padding:'12px 16px 20px' }}>
        <div style={{ display:'flex', gap:10, marginBottom:10 }}>
          <button onClick={() => saved.length ? setImportOpen(true) : flash('暂无已保存的指南')} style={{ flex:1, height:44, borderRadius:999, border:`1.5px solid ${LL.border}`, background:'transparent', color:LL.text, fontSize:13.5, fontWeight:600, fontFamily:LL.font, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
            <i className="ph ph-download-simple" style={{ fontSize:15 }}/> 导入已保存指南
          </button>
          <button onClick={() => { onSave({ name:guideName, text, photos }); flash('已保存为「' + guideName + '」'); }} style={{ flex:1, height:44, borderRadius:999, border:`1.5px solid ${LL.border}`, background:'transparent', color:LL.text, fontSize:13.5, fontWeight:600, fontFamily:LL.font, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
            <i className="ph ph-floppy-disk" style={{ fontSize:15 }}/> 保存照顾指南
          </button>
        </div>
        <button disabled={!canSend} onClick={() => onSend({ name:guideName, text:text.trim(), photos })} style={{
          width:'100%', height:50, borderRadius:999, border:0,
          background: canSend ? LL.ink : 'rgba(34,40,44,0.22)', color:'#fff',
          fontSize:15, fontWeight:700, fontFamily:LL.font, cursor: canSend?'pointer':'not-allowed', letterSpacing:'0.04em' }}>
          发送给守护者
        </button>
      </div>

      {importOpen && (
        <>
          <div onClick={() => setImportOpen(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.42)', zIndex:96 }}/>
          <div style={{ position:'absolute', left:0, right:0, bottom:0, zIndex:97, background:'#fff', borderTopLeftRadius:20, borderTopRightRadius:20, padding:'14px 16px 28px', fontFamily:LL.font, maxHeight:'70%', overflowY:'auto' }}>
            <div style={{ width:38, height:4, borderRadius:2, background:LL.border, margin:'0 auto 14px' }}/>
            <div style={{ fontSize:15, fontWeight:700, color:LL.text, marginBottom:12 }}>导入已保存指南</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {saved.map((g, i) => (
                <button key={i} onClick={() => { setText(g.text || ''); setPhotos(g.photos || []); setImportOpen(false); flash('已导入「' + g.name + '」'); }} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderRadius:12, border:`1px solid ${LL.border}`, background:'#fff', cursor:'pointer', fontFamily:LL.font, textAlign:'left', width:'100%' }}>
                  <i className="ph ph-bookmark-simple" style={{ fontSize:17, color:LL.text2 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:LL.text }}>{g.name}</div>
                    <div style={{ fontSize:12, color:LL.text3, marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{g.text || '（仅照片）'}</div>
                  </div>
                  <i className="ph ph-caret-right" style={{ fontSize:13, color:LL.text3 }}/>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
      {toast && (
        <div style={{ position:'absolute', left:'50%', bottom:96, transform:'translateX(-50%)', background:LL.ink, color:'#fff', padding:'9px 16px', borderRadius:999, fontSize:13, fontWeight:500, zIndex:99, whiteSpace:'nowrap' }}>{toast}</div>
      )}
    </div>
  );
}

// Full-screen 钥匙交接 composer
function KeyHandoffPanel({ initial, onSend, onClose }) {
  const [scheme, setScheme] = React.useState(initial?.scheme || null);
  const [fields, setFields] = React.useState(initial?.fields || {});
  const cur = KEY_SCHEMES.find(s => s.id === scheme);
  const set = (k, v) => setFields(f => ({ ...f, [k]: v }));
  const canSend = !!scheme && (
    cur.field === 'none' ||
    (cur.field === 'input' && (fields[scheme]||'').trim()) ||
    (cur.field === 'photo' && ((fields[scheme]||'').trim() || (fields[scheme+'_photos']||[]).length))
  );

  return (
    <div style={{ position:'absolute', inset:0, zIndex:94, background:LL.bg, display:'flex', flexDirection:'column', fontFamily:LL.font }}>
      <MGNavBar title="钥匙交接" onBack={onClose}/>

      <div style={{ flex:1, overflowY:'auto', padding:'12px 0 16px' }}>
        <div style={{ padding:'0 16px 8px', fontSize:12.5, color:LL.text3 }}>请选择钥匙交接方式并填写信息</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, padding:'0 16px' }}>
          {KEY_SCHEMES.map(s => {
            const on = scheme === s.id;
            return (
              <div key={s.id} style={{ borderRadius:14, border:`1.5px solid ${on?LL.ink:LL.border}`, background:'#fff', overflow:'hidden' }}>
                <button onClick={() => setScheme(s.id)} style={{ width:'100%', display:'flex', alignItems:'flex-start', gap:10, padding:'13px 14px', background:'transparent', border:0, cursor:'pointer', fontFamily:LL.font, textAlign:'left' }}>
                  {on ? <i className="ph-fill ph-check-circle" style={{ fontSize:20, color:LL.ink, flex:'0 0 auto', marginTop:1 }}/>
                      : <div style={{ width:20, height:20, borderRadius:'50%', border:`1.5px solid ${LL.border}`, flex:'0 0 auto', marginTop:1 }}/>}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:LL.text }}>方案{s.id} · {s.label}</div>
                    <div style={{ fontSize:12, color:LL.text3, marginTop:2, lineHeight:1.5 }}>{s.desc}</div>
                  </div>
                </button>
                {on && s.field !== 'none' && (
                  <div style={{ padding:'0 14px 14px' }}>
                    {s.field === 'input' && (
                      <input value={fields[s.id]||''} onChange={e => set(s.id, e.target.value)} placeholder={s.placeholder}
                        style={{ width:'100%', height:44, padding:'0 12px', borderRadius:10, border:`1px solid ${LL.border}`, background:LL.bg, fontSize:14, color:LL.text, fontFamily:LL.font, outline:'none', boxSizing:'border-box' }}/>
                    )}
                    {s.field === 'photo' && (
                      <>
                        <textarea value={fields[s.id]||''} onChange={e => set(s.id, e.target.value)} placeholder={s.placeholder}
                          style={{ width:'100%', minHeight:60, padding:'10px 12px', borderRadius:10, border:`1px solid ${LL.border}`, background:LL.bg, fontSize:14, color:LL.text, fontFamily:LL.font, outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.6, marginBottom:10 }}/>
                        <MGPhotos photos={fields[s.id+'_photos']||[]} onChange={(ps) => set(s.id+'_photos', ps)}/>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ flex:'0 0 auto', background:'#fff', borderTop:`1px solid ${LL.border}`, padding:'12px 16px 20px', display:'flex', gap:10 }}>
        <button onClick={onClose} style={{ flex:1, height:50, borderRadius:999, border:`1.5px solid ${LL.border}`, background:'transparent', color:LL.text, fontSize:15, fontWeight:600, fontFamily:LL.font, cursor:'pointer' }}>取消</button>
        <button disabled={!canSend} onClick={() => onSend({ scheme, fields })} style={{
          flex:2, height:50, borderRadius:999, border:0,
          background: canSend ? LL.ink : 'rgba(34,40,44,0.22)', color:'#fff',
          fontSize:15, fontWeight:700, fontFamily:LL.font, cursor: canSend?'pointer':'not-allowed', letterSpacing:'0.04em' }}>
          发送给守护者
        </button>
      </div>
    </div>
  );
}

// In-thread cards
function CareCard({ guide, onEdit }) {
  return (
    <div style={{ background:'#fff', borderRadius:14, border:`1px solid ${LL.border}`, boxShadow:'0 1px 6px rgba(0,0,0,0.07)', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:LL.butter }}>
        <div style={{ width:34, height:34, borderRadius:9, background:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' }}>
          <i className="ph-fill ph-clipboard-text" style={{ fontSize:18, color:'#8A6D1B' }}/>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13.5, fontWeight:800, color:LL.text }}>照护指南</div>
          <div style={{ fontSize:11.5, color:LL.text2, marginTop:1 }}>{guide.name}</div>
        </div>
      </div>
      {guide.text && <div style={{ padding:'10px 14px 4px', fontSize:13, color:LL.text2, lineHeight:1.6, whiteSpace:'pre-wrap' }}>{guide.text}</div>}
      {(guide.photos||[]).length > 0 && (
        <div style={{ display:'flex', gap:6, padding:'8px 14px 4px', flexWrap:'wrap' }}>
          {guide.photos.slice(0,4).map((p,i) => <img key={i} src={p} alt="" style={{ width:56, height:56, borderRadius:8, objectFit:'cover' }}/>)}
        </div>
      )}
      <button onClick={onEdit} style={{ width:'100%', padding:'11px 14px', marginTop:6, background:'transparent', border:0, borderTop:`1px solid ${LL.border}`, cursor:'pointer', fontFamily:LL.font, display:'flex', alignItems:'center', justifyContent:'center', gap:5, fontSize:13, fontWeight:600, color:LL.text2 }}>
        <i className="ph ph-pencil-simple" style={{ fontSize:14 }}/> 查看 / 修改
      </button>
    </div>
  );
}
function KeyCard({ handoff, onEdit }) {
  const sc = KEY_SCHEMES.find(s => s.id === handoff.scheme);
  const detail = handoff.fields?.[handoff.scheme];
  return (
    <div style={{ background:'#fff', borderRadius:14, border:`1px solid ${LL.border}`, boxShadow:'0 1px 6px rgba(0,0,0,0.07)', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', background:LL.mint }}>
        <div style={{ width:34, height:34, borderRadius:9, background:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' }}>
          <i className="ph-fill ph-key" style={{ fontSize:18, color:'#2C7A4B' }}/>
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:13.5, fontWeight:800, color:LL.text }}>钥匙交接</div>
          <div style={{ fontSize:11.5, color:LL.text2, marginTop:1 }}>方案{handoff.scheme} · {sc?.label}</div>
        </div>
      </div>
      {detail && <div style={{ padding:'10px 14px 4px', fontSize:13, color:LL.text2, lineHeight:1.6, whiteSpace:'pre-wrap' }}>{detail}</div>}
      {(handoff.fields?.[handoff.scheme+'_photos']||[]).length > 0 && (
        <div style={{ display:'flex', gap:6, padding:'8px 14px 4px', flexWrap:'wrap' }}>
          {handoff.fields[handoff.scheme+'_photos'].slice(0,4).map((p,i) => <img key={i} src={p} alt="" style={{ width:56, height:56, borderRadius:8, objectFit:'cover' }}/>)}
        </div>
      )}
      <button onClick={onEdit} style={{ width:'100%', padding:'11px 14px', marginTop:6, background:'transparent', border:0, borderTop:`1px solid ${LL.border}`, cursor:'pointer', fontFamily:LL.font, display:'flex', alignItems:'center', justifyContent:'center', gap:5, fontSize:13, fontWeight:600, color:LL.text2 }}>
        <i className="ph ph-pencil-simple" style={{ fontSize:14 }}/> 查看 / 修改
      </button>
    </div>
  );
}

// ─── Chat View ────────────────────────────────────────────────
function ChatView({ app, onBack, onSendMessage, onOpenSummary, onModify, onReview }) {
  const [input, setInput] = React.useState('');
  const [plusOpen, setPlusOpen] = React.useState(false);
  const [sheet, setSheet] = React.useState(null); // null | 'tip' | 'review'
  const [stars, setStars] = React.useState(5);
  const [meet, setMeet] = React.useState(null);          // null | { date, time, location, message, status }
  const [meetLog, setMeetLog] = React.useState([]);      // [{ by, text, time }]
  const [meetCompose, setMeetCompose] = React.useState(null); // null | { initial }
  const [careGuide, setCareGuide] = React.useState(null);     // { name, text, photos }
  const [keyHandoff, setKeyHandoff] = React.useState(null);   // { scheme, fields }
  const [savedGuides, setSavedGuides] = React.useState([]);   // [{ name, text, photos }]
  const [panel, setPanel] = React.useState(null);             // null | 'care' | 'key'
  const [careLog, setCareLog] = React.useState([]);           // [{ kind:'sys'|'care'|'key', text?, time }]
  const msgsRef = React.useRef(null);
  const photoSrc = resolveGuardianPhoto(app.guardian);
  const gInitial = app.guardian?.initial;
  const isCompleted = app.status === 'completed';
  const isBooked = app.status === 'accepted' || app.status === 'in_progress';
  const petName = (app.pet || '').split('·').pop().trim();

  React.useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [app.messages?.length, meetLog.length, meet, careLog.length, careGuide, keyHandoff]);

  // Order effective → system prompts the owner to fill care guide + key handoff
  React.useEffect(() => {
    if (isBooked) {
      setCareLog(l => l.some(e => e.kind === 'prompt') ? l
        : [{ kind:'prompt', text:'订单已生效，请填写【照护指南】和【钥匙交接】信息。', time: fmtNow() }, ...l]);
    }
  }, [isBooked]);

  // ── Care guide / key handoff handlers ──
  const saveGuide = (g) => setSavedGuides(prev => [...prev.filter(x => x.name !== g.name), g]);
  const sendCare = (data) => {
    const first = !careGuide;
    setCareGuide(data);
    setCareLog(l => first ? [...l, { kind:'care', time: fmtNow() }] : [...l, { kind:'sys', text:'您更新了照护指南', time: fmtNow() }]);
    setPanel(null);
  };
  const sendKey = (data) => {
    const first = !keyHandoff;
    setKeyHandoff(data);
    setCareLog(l => first ? [...l, { kind:'key', time: fmtNow() }] : [...l, { kind:'sys', text:'您更新了钥匙交接方式', time: fmtNow() }]);
    setPanel(null);
  };

  // ── Meet & Greet invite handlers (either party can send / modify) ──
  const openMeetCreate = () => setMeetCompose({ initial: null });
  const openMeetEdit   = () => setMeetCompose({ initial: meet });
  const sendMeet = (data) => {
    const creating = !meet;
    setMeet({ ...data, status: creating ? 'pending' : (meet.status === 'confirmed' ? 'pending' : (meet.status || 'pending')) });
    setMeetLog(l => [...l, { by:'user', text: creating ? '您发起了见面邀约' : '您修改了见面邀约', time: fmtNow() }]);
    setMeetCompose(null);
    if (creating) {
      setTimeout(() => setMeetLog(l => [...l, { by:'guardian', text:`${app.guardian?.name || '守护者'} 已查看见面邀约`, time: fmtNow() }]), 2200);
    }
  };
  const acceptMeet = () => {
    setMeet(m => m ? ({ ...m, status:'confirmed' }) : m);
    setMeetLog(l => [...l, { by:'guardian', text:`${app.guardian?.name || '守护者'} 已接受见面邀约`, time: fmtNow() }]);
  };

  const handleSend = () => {
    const t = input.trim();
    if (!t) return;
    onSendMessage(t);
    setInput('');
  };

  return (
    <>
      {/* Top nav */}
      <div style={{
        flex:'0 0 auto', height:52, display:'flex', alignItems:'center',
        padding:'0 14px', gap:12,
        background:'#fff', borderBottom:`1px solid ${LL.border}`,
      }}>
        <button onClick={onBack} style={{
          width:34, height:34, borderRadius:'50%', border:0,
          background:LL.ink, color:'#fff', cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto',
        }}>
          <i className="ph ph-caret-left" style={{ fontSize:17 }}/>
        </button>
        <div style={{ flex:1, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', overflow:'hidden', background:gInitial?.bg || LL.lavender, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {photoSrc
              ? <img src={photoSrc} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
              : <span style={{ fontSize:14, fontWeight:700, color:LL.text }}>{gInitial?.char || app.guardian?.name?.[0]}</span>}
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:LL.text, lineHeight:1.2 }}>{app.guardian?.name}</div>
            <div style={{ fontSize:11, color:LL.text3 }}>守护者</div>
          </div>
        </div>
        <i className="ph ph-dots-three" style={{ fontSize:22, color:LL.text2 }}/>
      </div>

      {/* Application card */}
      <div style={{ flex:'0 0 auto', padding:'10px 14px 0', background:'#fff' }}>
        <div style={{ background:LL.bg, borderRadius:12, padding:'10px 14px', display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, borderRadius:10, background:LL.butter, flex:'0 0 auto', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="ph ph-clipboard-text" style={{ fontSize:20, color:LL.text }}/>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:13, fontWeight:700, color:LL.text }}>
              {app.service} · {app.dateStart}{app.dateEnd && app.dateEnd !== app.dateStart ? ` – ${app.dateEnd}` : ''}
            </div>
            <div style={{ fontSize:11.5, color:LL.text3, marginTop:2 }}>{app.pet} · {app.area}</div>
          </div>
          <StatusBadge status={app.status}/>
        </div>
      </div>

      {/* Order shortcuts row */}
      <div style={{ flex:'0 0 auto', background:'#fff', padding:'10px 14px', borderBottom:`1px solid ${LL.border}`, display:'flex', gap:8 }}>
        {isCompleted ? (
          <>
            <ShortcutBtn icon="receipt" label="详情" onClick={() => onOpenSummary?.(app)} />
            <ShortcutBtn icon="star" label="去评价" primary onClick={() => setSheet('review')} />
          </>
        ) : (
          <>
            <ShortcutBtn icon="pencil-simple" label="修改订单" onClick={() => onModify?.(app)} />
            <ShortcutBtn icon="receipt" label="详情" onClick={() => onOpenSummary?.(app)} />
            <ShortcutBtn icon="wechat-logo" label="去付款" primary onClick={() => onOpenSummary?.(app)} />
          </>
        )}
      </div>

      {/* Care guide / key handoff status strip (mirrors the service card) */}
      {(careGuide || keyHandoff) && (
        <div style={{ flex:'0 0 auto', background:'#fff', padding:'0 14px 10px', borderBottom:`1px solid ${LL.border}`, display:'flex', flexDirection:'column', gap:8 }}>
          {careGuide && (
            <button onClick={() => setPanel('care')} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, border:`1px solid ${LL.border}`, background:LL.bg, cursor:'pointer', fontFamily:LL.font, textAlign:'left', width:'100%' }}>
              <i className="ph-fill ph-clipboard-text" style={{ fontSize:16, color:'#8A6D1B', flex:'0 0 auto' }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <span style={{ fontSize:12.5, fontWeight:700, color:LL.text }}>照护指南</span>
                <span style={{ fontSize:12, color:LL.text3, marginLeft:6, whiteSpace:'nowrap' }}>{careGuide.text ? careGuide.text.split('\n')[0].slice(0,16) : careGuide.name}</span>
              </div>
              <i className="ph ph-caret-right" style={{ fontSize:12, color:LL.text3 }}/>
            </button>
          )}
          {keyHandoff && (
            <button onClick={() => setPanel('key')} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, border:`1px solid ${LL.border}`, background:LL.bg, cursor:'pointer', fontFamily:LL.font, textAlign:'left', width:'100%' }}>
              <i className="ph-fill ph-key" style={{ fontSize:16, color:'#2C7A4B', flex:'0 0 auto' }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <span style={{ fontSize:12.5, fontWeight:700, color:LL.text }}>钥匙交接</span>
                <span style={{ fontSize:12, color:LL.text3, marginLeft:6, whiteSpace:'nowrap' }}>方案{keyHandoff.scheme} · {(KEY_SCHEMES.find(s=>s.id===keyHandoff.scheme)||{}).label}</span>
              </div>
              <i className="ph ph-caret-right" style={{ fontSize:12, color:LL.text3 }}/>
            </button>
          )}
        </div>
      )}

      {/* Sticky meet-and-greet card (pinned at top of conversation) */}
      {meet && (
        <div style={{ flex:'0 0 auto', background:'#fff', padding:'8px 14px 10px', borderBottom:`1px solid ${LL.border}` }}>
          <button onClick={openMeetEdit} style={{ width:'100%', background:'transparent', border:0, padding:0, cursor:'pointer', textAlign:'left' }}>
            <MeetCard meet={meet} guardianName={app.guardian?.name} compact/>
          </button>
        </div>
      )}

      {/* Messages */}
      <div ref={msgsRef} style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'14px 14px 8px', background:LL.bg }}>
        {(app.messages || []).map((msg, i) => (
          <MsgBubble key={i} msg={msg} photoSrc={photoSrc} app={app} onOpenSummary={onOpenSummary}/>
        ))}
        {meetLog.map((e, i) => (
          <div key={'ml'+i} style={{ textAlign:'center', fontSize:12, color:LL.text3, margin:'4px 0 14px', padding:'0 24px' }}>{e.text}</div>
        ))}
        {meet && (
          <div style={{ display:'flex', justifyContent:'flex-start', marginBottom:14 }}>
            <div style={{ maxWidth:'84%' }}>
              <MeetCard meet={meet} guardianName={app.guardian?.name} onAccept={acceptMeet} onModify={openMeetEdit}/>
            </div>
          </div>
        )}
        {careLog.map((e, i) => {
          if (e.kind === 'care' && careGuide) return (
            <div key={'cl'+i} style={{ display:'flex', justifyContent:'flex-start', marginBottom:14 }}>
              <div style={{ maxWidth:'86%' }}><CareCard guide={careGuide} onEdit={() => setPanel('care')}/></div>
            </div>);
          if (e.kind === 'key' && keyHandoff) return (
            <div key={'cl'+i} style={{ display:'flex', justifyContent:'flex-start', marginBottom:14 }}>
              <div style={{ maxWidth:'86%' }}><KeyCard handoff={keyHandoff} onEdit={() => setPanel('key')}/></div>
            </div>);
          if (e.kind === 'care' || e.kind === 'key') return null;
          return (<div key={'cl'+i} style={{ textAlign:'center', fontSize:12, color:LL.text3, margin:'4px 0 14px', padding:'0 24px' }}>{e.text}</div>);
        })}
      </div>

      {/* Quick-reply: 申请见面 (pre-completion) / 打赏 (completed) */}
      <div style={{ flex:'0 0 auto', background:'#fff', padding:'8px 14px 0', borderTop:`1px solid ${LL.border}` }}>
        {isCompleted ? (
          <button onClick={() => setSheet('tip')} style={{
            height:32, padding:'0 16px', borderRadius:999,
            border:'1.5px solid #D97706', background:'#FFFBEB',
            fontSize:12.5, fontWeight:600, color:'#B45309',
            cursor:'pointer', fontFamily:LL.font,
            display:'flex', alignItems:'center', gap:5,
          }}>
            <i className="ph-fill ph-hand-coins" style={{ fontSize:15 }}/>
            打赏
          </button>
        ) : (
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2, scrollbarWidth:'none' }}>
            <button onClick={openMeetCreate} style={{
              flex:'0 0 auto', height:32, padding:'0 14px', borderRadius:999,
              border:'1.5px solid #E63946', background:'transparent',
              fontSize:12.5, fontWeight:600, color:'#E63946',
              cursor:'pointer', fontFamily:LL.font,
              display:'flex', alignItems:'center', gap:5,
            }}>
              <i className="ph ph-handshake" style={{ fontSize:15 }}/>
              申请见面
            </button>
            {isBooked && (
              <>
                <button onClick={() => setPanel('care')} style={{
                  flex:'0 0 auto', height:32, padding:'0 14px', borderRadius:999,
                  border:`1.5px solid ${LL.border}`, background:'transparent',
                  fontSize:12.5, fontWeight:600, color:LL.text, cursor:'pointer', fontFamily:LL.font,
                  display:'flex', alignItems:'center', gap:5,
                }}>
                  <i className="ph ph-clipboard-text" style={{ fontSize:15 }}/>
                  照护指南
                </button>
                <button onClick={() => setPanel('key')} style={{
                  flex:'0 0 auto', height:32, padding:'0 14px', borderRadius:999,
                  border:`1.5px solid ${LL.border}`, background:'transparent',
                  fontSize:12.5, fontWeight:600, color:LL.text, cursor:'pointer', fontFamily:LL.font,
                  display:'flex', alignItems:'center', gap:5,
                }}>
                  <i className="ph ph-key" style={{ fontSize:15 }}/>
                  钥匙交接
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Input bar */}
      <div style={{ flex:'0 0 auto', background:'#fff', position:'relative' }}>
        {/* + menu popup */}
        {plusOpen && (
          <>
            <div onClick={() => setPlusOpen(false)} style={{ position:'absolute', inset:0, zIndex:10 }}/>
            <div style={{
              position:'absolute', bottom:'calc(100% + 6px)', right:14, zIndex:20,
              background:'#fff', borderRadius:14, overflow:'hidden',
              boxShadow:'0 4px 20px rgba(0,0,0,0.13)',
              minWidth:140,
            }}>
              {[
                { icon:'camera', label:'拍照' },
                { icon:'image', label:'从相册选择' },
              ].map((item, i) => (
                <button key={i} onClick={() => setPlusOpen(false)} style={{
                  width:'100%', padding:'13px 16px', background:'transparent',
                  border:0, borderBottom: i === 0 ? `1px solid ${LL.border}` : 0,
                  display:'flex', alignItems:'center', gap:12,
                  cursor:'pointer', fontFamily:LL.font,
                }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:LL.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <i className={`ph ph-${item.icon}`} style={{ fontSize:17, color:LL.text }}/>
                  </div>
                  <span style={{ fontSize:14, color:LL.text, fontWeight:500 }}>{item.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
        <div style={{
          padding:'8px 14px', paddingBottom:28,
          display:'flex', alignItems:'center', gap:10,
        }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="发送消息…"
            style={{
              flex:1, height:40, padding:'0 14px', borderRadius:999,
              border:`1px solid ${LL.border}`, background:LL.bg,
              fontSize:14, fontFamily:LL.font, color:LL.text, outline:'none',
            }}
          />
          <button onClick={handleSend} style={{
            width:40, height:40, borderRadius:'50%', border:0,
            background:input.trim()?LL.ink:LL.border, color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:input.trim()?'pointer':'default', transition:'background 140ms',
          }}>
            <i className="ph ph-paper-plane-tilt" style={{ fontSize:18 }}/>
          </button>
          <button onClick={() => setPlusOpen(v => !v)} style={{
            width:40, height:40, borderRadius:'50%', border:`1.5px solid ${LL.border}`,
            background:'#fff', color:LL.text,
            display:'flex', alignItems:'center', justifyContent:'center',
            cursor:'pointer', transition:'background 120ms',
          }}>
            <i className="ph ph-plus" style={{ fontSize:20 }}/>
          </button>
        </div>
      </div>

      {/* ── Meet & Greet compose page ── */}
      {meetCompose && (
        <MeetInvitePage initial={meetCompose.initial} defaultLocation={app.area || '望京SOHO · 北京市朝阳区阜通东大街6号'}
          onSend={sendMeet} onClose={() => setMeetCompose(null)}/>
      )}

      {/* ── Care guide / key handoff panels ── */}
      {panel === 'care' && (
        <CareGuidePanel service={app.service} petName={petName} saved={savedGuides} initial={careGuide}
          onSave={saveGuide} onSend={sendCare} onClose={() => setPanel(null)}/>
      )}
      {panel === 'key' && (
        <KeyHandoffPanel initial={keyHandoff} onSend={sendKey} onClose={() => setPanel(null)}/>
      )}

      {/* ── Tip / Review action sheet ── */}
      {sheet && (
        <>
          <div onClick={() => setSheet(null)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.42)', zIndex:90 }}/>
          <div style={{ position:'absolute', left:0, right:0, bottom:0, zIndex:91, background:'#fff',
            borderTopLeftRadius:20, borderTopRightRadius:20, padding:'14px 18px 32px', fontFamily:LL.font }}>
            <div style={{ width:38, height:4, borderRadius:2, background:LL.border, margin:'0 auto 16px' }}/>

            {sheet === 'tip' && (
              <>
                <div style={{ textAlign:'center', fontSize:16, fontWeight:700, color:LL.text, marginBottom:4 }}>打赏守护者</div>
                <div style={{ textAlign:'center', fontSize:12.5, color:LL.text3, marginBottom:18 }}>感谢 {app.guardian?.name} 对 {(app.pet||'').split('·').pop()} 的悉心照顾</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:18 }}>
                  {[8,18,38,66].map(amt => (
                    <button key={amt} onClick={() => {
                      onSendMessage?.(`🧧 我给你发了一个 ¥${amt} 的打赏，谢谢你的照顾！`);
                      setSheet(null);
                    }} style={{
                      height:54, borderRadius:12, border:`1.5px solid ${LL.border}`, background:'#fff',
                      cursor:'pointer', fontFamily:LL.font, display:'flex', flexDirection:'column',
                      alignItems:'center', justifyContent:'center', gap:1,
                    }}>
                      <span style={{ fontSize:17, fontWeight:800, color:LL.text }}>¥{amt}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            {sheet === 'review' && (
              <>
                <div style={{ textAlign:'center', fontSize:16, fontWeight:700, color:LL.text, marginBottom:4 }}>评价本次服务</div>
                <div style={{ textAlign:'center', fontSize:12.5, color:LL.text3, marginBottom:16 }}>您的评价将帮助其他宠主</div>
                <div style={{ display:'flex', justifyContent:'center', gap:10, marginBottom:20 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setStars(n)} style={{ background:'transparent', border:0, cursor:'pointer', padding:0 }}>
                      <i className={`${n <= stars ? 'ph-fill' : 'ph'} ph-star`} style={{ fontSize:30, color: n <= stars ? '#F5B301' : LL.border }}/>
                    </button>
                  ))}
                </div>
                <button onClick={() => {
                  onReview?.(app, stars);
                  onSendMessage?.(`⭐ 我给本次服务打了 ${stars} 星好评，谢谢你！`);
                  setSheet(null);
                }} style={{
                  width:'100%', height:50, borderRadius:999, border:0, background:LL.ink, color:'#fff',
                  fontSize:15, fontWeight:700, fontFamily:LL.font, cursor:'pointer',
                }}>提交评价</button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}

// ─── Sent App Card ─────────────────────────────────────────────
function SentAppCard({ app, onOpenChat, onOpenSummary, onRebook, onWriteReview }) {
  const g = app.guardian || {};
  const photoSrc = resolveGuardianPhoto(g);
  const sm = STATUS_META[app.status] || STATUS_META.pending;
  const isInactive = app.status === 'rejected' || app.status === 'cancelled';

  return (
    <div style={{
      background:'#fff', borderRadius:16, overflow:'hidden',
      boxShadow:'0 2px 8px rgba(0,0,0,0.05)',
    }}>
      {/* Main row — tap to open summary */}
      <div onClick={() => !isInactive && onOpenSummary?.(app)} style={{
        padding:'14px 14px 10px', display:'flex', alignItems:'center', gap:12,
        cursor: isInactive ? 'default' : 'pointer',
      }}>
        {/* Avatar */}
        <div style={{
          width:50, height:50, borderRadius:'50%', flex:'0 0 auto',
          background: g.initial?.bg || g.bg || LL.lavender, overflow:'hidden',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:20, fontWeight:700, color:LL.text,
        }}>
          {photoSrc
            ? <img src={photoSrc} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
            : (g.initial?.char || g.name?.[0] || '?')
          }
        </div>
        {/* Info */}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
            <span style={{ fontSize:15, fontWeight:700, color:LL.text }}>{g.name}</span>
            <StatusBadge status={app.status}/>
          </div>
          <div style={{ fontSize:12.5, color:LL.text3 }}>
            {app.service} · {app.dateStart}{app.dateEnd && app.dateEnd !== app.dateStart ? ` – ${app.dateEnd}` : ''}
          </div>
          <div style={{ fontSize:12, color:LL.text3, marginTop:1 }}>{app.pet}</div>
        </div>
        {/* Chevron */}
        {!isInactive && (
          <i className="ph ph-caret-right" style={{ fontSize:16, color:LL.text3, flex:'0 0 auto' }}/>
        )}
      </div>

      {/* Status description strip */}
      <div style={{ padding:'0 14px 10px', display:'flex', alignItems:'center', gap:6 }}>
        {app.status === 'pending' && (
          <span style={{
            display:'inline-block', width:7, height:7, borderRadius:'50%',
            background:'#F0B100', flex:'0 0 auto',
          }}/>
        )}
        <span style={{ fontSize:12, color: isInactive ? LL.text3 : sm.color }}>{sm.desc}</span>
      </div>

      {/* Action buttons */}
      {!isInactive && (
        app.status === 'completed' ? (
          <div style={{ padding:'0 14px 14px', display:'flex', gap:8 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onOpenChat?.(app.id); }}
              style={{
                flex:'0 0 auto', width:44, height:36, borderRadius:999,
                border:`1px solid ${LL.border}`, background:'transparent',
                color:LL.text2, cursor:'pointer', fontFamily:LL.font,
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
              <i className="ph ph-chat-circle-dots" style={{ fontSize:16 }}/>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRebook?.(app); }}
              style={{
                flex:1, height:36, borderRadius:999,
                border:`1.5px solid ${LL.ink}`, background:'transparent',
                fontSize:13, fontWeight:700, color:LL.ink, cursor:'pointer',
                fontFamily:LL.font, display:'flex', alignItems:'center', justifyContent:'center', gap:4, whiteSpace:'nowrap',
              }}>
              <i className="ph ph-calendar-plus" style={{ fontSize:15 }}/>
              再次预约
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onWriteReview?.(app); }}
              style={{
                flex:1, height:36, borderRadius:999, border:0,
                background:LL.ink, color:'#fff',
                fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:LL.font,
                display:'flex', alignItems:'center', justifyContent:'center', gap:4, whiteSpace:'nowrap',
              }}>
              <i className="ph ph-star" style={{ fontSize:15 }}/>
              写评论
            </button>
          </div>
        ) : (
          <div style={{ padding:'0 14px 14px', display:'flex', gap:8 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onOpenChat?.(app.id); }}
              style={{
                flex:1, height:36, borderRadius:999,
                border:`1px solid ${LL.border}`, background:'transparent',
                fontSize:13, fontWeight:600, color:LL.text2, cursor:'pointer',
                fontFamily:LL.font, display:'flex', alignItems:'center', justifyContent:'center', gap:5,
              }}>
              <i className="ph ph-chat-circle-dots" style={{ fontSize:14 }}/>
              查看对话
            </button>
            {app.status === 'accepted' && (
              <button
                onClick={(e) => { e.stopPropagation(); onOpenSummary?.(app); }}
                style={{
                  flex:1, height:36, borderRadius:999, border:0,
                  background:APP_GREEN, color:'#fff',
                  fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:LL.font,
                }}>立即付款</button>
            )}
          </div>
        )
      )}
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────
const ORDER_TABS = ['全部', '待确认', '待付款', '待完成', '已完成', '已失效'];

function OrderTabBar({ active, onChange }) {
  return (
    <div style={{
      display:'flex', overflowX:'auto', scrollbarWidth:'none',
      borderBottom:`1px solid ${LL.border}`, background:'#fff',
    }}>
      {ORDER_TABS.map(tab => {
        const on = active === tab;
        return (
          <button key={tab} onClick={() => onChange(tab)} style={{
            flex:'0 0 auto', padding:'10px 14px',
            background:'transparent', border:0,
            fontSize:13, fontWeight: on ? 700 : 500,
            color: on ? '#D97757' : LL.text3,
            cursor:'pointer', fontFamily:LL.font,
            borderBottom: on ? '2.5px solid #D97757' : '2.5px solid transparent',
            marginBottom:-1, whiteSpace:'nowrap',
          }}>{tab}</button>
        );
      })}
    </div>
  );
}

// ─── Config section ────────────────────────────────────────────
const SVC_OPTIONS = ['寄养', '日托', '遛狗', '上门喂养', '伴宠留宿'];

function ConfigSection({ config, onChange }) {
  const fields = [
    { key:'pet',       label:'宠物' },
    { key:'dateStart', label:'开始日期' },
    { key:'dateEnd',   label:'结束日期' },
    { key:'area',      label:'地点' },
  ];
  return (
    <div style={{ background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ padding:'12px 14px 10px', display:'flex', alignItems:'center', gap:8, borderBottom:`1px solid ${LL.border}` }}>
        <div style={{ fontSize:14, fontWeight:700, color:LL.text, flex:1 }}>服务信息</div>
        <span style={{ background:LL.butter, color:LL.text, fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:999 }}>草稿</span>
      </div>
      <div style={{ padding:'10px 14px', borderBottom:`1px solid ${LL.border}` }}>
        <div style={{ fontSize:12, color:LL.text3, marginBottom:7, fontWeight:500 }}>服务类型</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {SVC_OPTIONS.map(opt => {
            const on = config.service === opt;
            return (
              <button key={opt} onClick={() => onChange('service', opt)} style={{
                height:30, padding:'0 13px', borderRadius:999, border:0,
                background: on ? LL.ink : '#F5F5FA',
                color: on ? '#fff' : LL.text2,
                fontSize:12.5, fontWeight: on ? 700 : 500, fontFamily:LL.font,
                cursor:'pointer', transition:'background 140ms',
              }}>{opt}</button>
            );
          })}
        </div>
      </div>
      {fields.map((f, i) => (
        <div key={f.key} style={{ display:'flex', alignItems:'center', padding:'0 14px', borderBottom: i < fields.length-1 ? `1px solid ${LL.border}` : 0 }}>
          <div style={{ fontSize:12.5, color:LL.text3, minWidth:62, fontWeight:500 }}>{f.label}</div>
          <input
            value={config[f.key] || ''}
            onChange={e => onChange(f.key, e.target.value)}
            style={{ flex:1, height:44, border:0, outline:'none', fontSize:13.5, fontWeight:600, color:LL.text, fontFamily:LL.font, background:'transparent', textAlign:'right', paddingRight:4 }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Guardian draft row ────────────────────────────────────────
function GuardianDraftRow({ g, checked, onToggle, onRemove, service }) {
  const photoSrc = resolveGuardianPhoto(g);
  const svcData = (g.services || []).find(s => s.id === service);
  return (
    <div style={{ padding:'12px 14px', display:'flex', alignItems:'center', gap:12 }}>
      <button onClick={onToggle} style={{
        width:24, height:24, borderRadius:'50%', border:0, flex:'0 0 auto',
        background: checked ? LL.ink : 'transparent',
        boxShadow: checked ? 'none' : `inset 0 0 0 1.5px ${LL.text3}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        cursor:'pointer', transition:'background 140ms',
      }}>
        {checked && <i className="ph-fill ph-check" style={{ fontSize:13, color:'#fff' }}/>}
      </button>
      <div style={{ width:48, height:48, borderRadius:'50%', overflow:'hidden', flex:'0 0 auto', background:g.initial?.bg || g.bg || LL.lavender, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {photoSrc
          ? <img src={photoSrc} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
          : <span style={{ fontSize:18, fontWeight:700, color:LL.text }}>{g.initial?.char || g.name?.[0] || '?'}</span>}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
          <div style={{ fontSize:14, fontWeight:700, color:LL.text }}>{g.name}</div>
          <i className="ph-fill ph-star" style={{ fontSize:11, color:'#F0B100' }}/>
          <span style={{ fontSize:11.5, fontWeight:600, color:LL.text }}>{g.rating}</span>
        </div>
        <div style={{ fontSize:12, color:LL.text3 }}>
          {service}{svcData ? ` · ¥${svcData.price}/${svcData.unit}` : ''}
        </div>
      </div>
      <button onClick={onRemove} style={{ width:28, height:28, borderRadius:'50%', border:0, background:'#F5F5FA', color:LL.text3, cursor:'pointer', flex:'0 0 auto', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <i className="ph ph-x" style={{ fontSize:13 }}/>
      </button>
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────
function BookingRequestScreen({
  draftGuardians = [],
  draftConfig    = {},
  onUpdateConfig,
  onRemoveGuardian,
  sentApps       = [],
  onSend,
  onOpenChat,
  onOpenSummary,
  onRebook,
  onWriteReview,
  onBrowseMore,
}) {
  const [checkedIds,  setCheckedIds]  = React.useState(new Set());
  const [activeTab,   setActiveTab]   = React.useState('全部');

  React.useEffect(() => {
    setCheckedIds(new Set(draftGuardians.map(g => g.id)));
  }, [draftGuardians.map(g => g.id).join(',')]);

  const toggleCheck = (id) =>
    setCheckedIds(prev => { const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });

  const handleSend = () => {
    const ids = [...checkedIds];
    if (!ids.length) return;
    onSend?.(ids);
  };

  const hasDraft = draftGuardians.length > 0;
  const checkedN = [...checkedIds].filter(id => draftGuardians.some(g => g.id === id)).length;

  // Combine mock apps + real sent apps (newest first), dedup by id
  const allApps = React.useMemo(() => {
    const real = [...sentApps].reverse();
    const mockFiltered = BRS_MOCK_APPS.filter(m => !real.find(r => r.id === m.id));
    return [...real, ...mockFiltered];
  }, [sentApps]);

  const filteredApps = activeTab === '全部'
    ? allApps
    : allApps.filter(a => (STATUS_META[a.status]?.tabKey || '待确认') === activeTab);

  return (
    <div style={{ background:LL.bg, minHeight:'100%', paddingBottom:24 }}>
      {/* Header + tabs */}
      <div style={{ background:'#fff', boxShadow:'0 1px 0 rgba(0,0,0,0.06)' }}>
        <div style={{ padding:'16px 16px 10px', display:'flex', alignItems:'center' }}>
          <div style={{ fontSize:22, fontWeight:800, color:LL.text, letterSpacing:'-0.01em', flex:1 }}>订单</div>
        </div>
        <OrderTabBar active={activeTab} onChange={setActiveTab}/>
      </div>

      {/* Draft section (only on 全部 tab) */}
      {hasDraft && activeTab === '全部' && (
        <div style={{ padding:'12px 16px 0', display:'flex', flexDirection:'column', gap:12 }}>
          <ConfigSection config={draftConfig} onChange={onUpdateConfig}/>
          <div style={{ background:'#fff', borderRadius:16, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ padding:'12px 14px 10px', display:'flex', alignItems:'center', borderBottom:`1px solid ${LL.border}` }}>
              <div style={{ fontSize:14, fontWeight:700, color:LL.text, flex:1 }}>
                已选守护者 <span style={{ fontSize:13, fontWeight:500, color:LL.text3 }}>({draftGuardians.length} 位)</span>
              </div>
            </div>
            {draftGuardians.map((g, i) => (
              <div key={g.id} style={{ borderBottom: i < draftGuardians.length-1 ? `1px solid ${LL.border}` : 0 }}>
                <GuardianDraftRow g={g} checked={checkedIds.has(g.id)} onToggle={() => toggleCheck(g.id)} onRemove={() => onRemoveGuardian?.(g.id)} service={draftConfig.service}/>
              </div>
            ))}
            <button onClick={onBrowseMore} style={{ width:'100%', padding:'12px 14px', background:'transparent', border:0, borderTop:`1px dashed ${LL.border}`, display:'flex', alignItems:'center', gap:12, cursor:'pointer', fontFamily:LL.font }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'#F5F5FA', display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' }}>
                <i className="ph ph-plus" style={{ fontSize:20, color:LL.text3 }}/>
              </div>
              <div style={{ fontSize:13.5, color:LL.text2 }}>继续添加守护者</div>
            </button>
          </div>
          <button onClick={handleSend} disabled={checkedN===0} style={{
            width:'100%', height:50, borderRadius:999, border:0,
            background: checkedN>0 ? LL.ink : 'rgba(34,40,44,0.25)',
            color:'#fff', fontSize:15, fontWeight:700,
            fontFamily:LL.font, cursor: checkedN>0 ? 'pointer':'not-allowed',
            transition:'background 160ms',
          }}>发送申请单{checkedN>0 ? `  给 ${checkedN} 位守护者` : ''}</button>
        </div>
      )}

      {/* Apps list — batch-grouped active, then historical */}
      <div style={{ padding:'12px 16px 0' }}>
        {(() => {
          const STATUS_PRIORITY = { accepted:0, pending:1, in_progress:2 };
          const isHistorical = a => a.status === 'completed' || a.status === 'rejected' || a.status === 'cancelled';

          const activeApps     = filteredApps.filter(a => !isHistorical(a));
          const historicalApps = filteredApps.filter(isHistorical);

          // Group active by batchId
          const batchMap = {};
          activeApps.forEach(app => {
            const key = app.batchId || app.id;
            if (!batchMap[key]) batchMap[key] = { time: app.batchTime || null, apps: [] };
            batchMap[key].apps.push(app);
          });
          // Sort within batch: accepted first
          Object.values(batchMap).forEach(b => b.apps.sort((a,z) => (STATUS_PRIORITY[a.status]??9)-(STATUS_PRIORITY[z.status]??9)));
          // Sort batches newest first
          const batches = Object.values(batchMap).sort((a,b) => {
            if (!a.time && !b.time) return 0;
            if (!a.time) return 1; if (!b.time) return -1;
            return new Date(b.time) - new Date(a.time);
          });

          const fmtBatchTime = (t) => {
            if (!t) return '已发送';
            const now = new Date(), d = new Date(t);
            const diffMin = Math.floor((now - d) / 60000);
            if (diffMin < 1) return '刚刚发送';
            if (diffMin < 60) return `${diffMin}分钟前发送`;
            const diffH = Math.floor(diffMin/60);
            if (diffH < 24) return `${diffH}小时前发送`;
            return `${d.getMonth()+1}月${d.getDate()}日发送`;
          };

          return (
            <>
              {/* Active batches */}
              {batches.length === 0 && historicalApps.length === 0 && (
                <div style={{ textAlign:'center', padding:'48px 24px', color:LL.text3, fontSize:14 }}>
                  暂无{activeTab === '全部' ? '' : activeTab}订单
                </div>
              )}
              {batches.map((batch, bi) => (
                <div key={bi} style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11.5, color:LL.text3, fontWeight:500, marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ flex:1, height:1, background:LL.border }}/>
                    <span>{fmtBatchTime(batch.time)}</span>
                    <div style={{ flex:1, height:1, background:LL.border }}/>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {batch.apps.map(app => (
                      <SentAppCard key={app.id} app={app} onOpenChat={onOpenChat} onOpenSummary={onOpenSummary} onRebook={onRebook} onWriteReview={onWriteReview}/>
                    ))}
                  </div>
                </div>
              ))}

              {/* Historical orders */}
              {historicalApps.length > 0 && (
                <div style={{ marginBottom:20 }}>
                  <div style={{ fontSize:11.5, color:LL.text3, fontWeight:500, marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ flex:1, height:1, background:LL.border }}/>
                    <span>历史订单</span>
                    <div style={{ flex:1, height:1, background:LL.border }}/>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {historicalApps.map(app => (
                      <SentAppCard key={app.id} app={app} onOpenChat={onOpenChat} onOpenSummary={onOpenSummary} onRebook={onRebook} onWriteReview={onWriteReview}/>
                    ))}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}

Object.assign(window, { BookingRequestScreen, ChatView, BRS_MOCK_APPS });
