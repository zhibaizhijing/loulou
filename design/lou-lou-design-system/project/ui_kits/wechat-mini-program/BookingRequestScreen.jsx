// Lou Lou — BookingRequestScreen.jsx
// 订单管理页 + ChatView

const APP_GREEN    = '#2C7A4B';
const APP_GREEN_BG = '#E6F1EC';

// ─── helpers ─────────────────────────────────────────────────
function fmtNow() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
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
function MsgBubble({ msg, photoSrc }) {
  if (msg.from === 'system') {
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
        <div style={{ width:34, height:34, borderRadius:'50%', overflow:'hidden', flex:'0 0 auto', background:LL.lavender }}>
          <img src={photoSrc} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
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

// ─── Chat View ────────────────────────────────────────────────
function ChatView({ app, onBack, onSendMessage, onOpenSummary }) {
  const [input, setInput] = React.useState('');
  const [plusOpen, setPlusOpen] = React.useState(false);
  const msgsRef = React.useRef(null);
  const photoSrc = (window.__resources && window.__resources.guardian2) || app.guardian?.photo || '';

  React.useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [app.messages?.length]);

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
          <div style={{ width:32, height:32, borderRadius:'50%', overflow:'hidden', background:LL.lavender }}>
            <img src={photoSrc} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:LL.text, lineHeight:1.2 }}>{app.guardian?.name}</div>
            <div style={{ fontSize:11, color:LL.text3 }}>守护者</div>
          </div>
        </div>
        <i className="ph ph-dots-three" style={{ fontSize:22, color:LL.text2 }}/>
      </div>

      {/* Application card */}
      <div style={{ flex:'0 0 auto', padding:'10px 14px', background:'#fff', borderBottom:`1px solid ${LL.border}` }}>
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
          <button onClick={() => onOpenSummary?.(app)} style={{
            height:28, padding:'0 12px', borderRadius:999,
            border:`1px solid ${LL.border}`, background:'#fff',
            fontSize:12, fontWeight:600, color:LL.text2, cursor:'pointer', fontFamily:LL.font,
            flex:'0 0 auto',
          }}>详情</button>
        </div>
      </div>

      {/* Messages */}
      <div ref={msgsRef} style={{ flex:1, overflowY:'auto', padding:'14px 14px 8px', background:LL.bg }}>
        {(app.messages || []).map((msg, i) => (
          <MsgBubble key={i} msg={msg} photoSrc={photoSrc}/>
        ))}
      </div>

      {/* 申请见面 quick-reply */}
      <div style={{ flex:'0 0 auto', background:'#fff', padding:'8px 14px 0', borderTop:`1px solid ${LL.border}` }}>
        <button onClick={() => setInput('您好，我们能提前见面熟悉一下吗')} style={{
          height:32, padding:'0 16px', borderRadius:999,
          border:'1.5px solid #E63946', background:'transparent',
          fontSize:12.5, fontWeight:600, color:'#E63946',
          cursor:'pointer', fontFamily:LL.font,
        }}>申请见面</button>
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
    </>
  );
}

// ─── Sent App Card ─────────────────────────────────────────────
function SentAppCard({ app, onOpenChat, onOpenSummary }) {
  const g = app.guardian || {};
  const photoSrc = g.photo || (window.__resources && window.__resources.guardian2) || './assets/guardian2.png';
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
          background: g.bg || LL.lavender, overflow:'hidden',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:20, fontWeight:700, color:LL.text,
        }}>
          {g.photo
            ? <img src={photoSrc} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
            : (g.name?.[0] || '?')
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
            background:'#F0B100', animation:'ping 1.2s ease infinite', flex:'0 0 auto',
          }}/>
        )}
        <span style={{ fontSize:12, color: isInactive ? LL.text3 : sm.color }}>{sm.desc}</span>
        <style>{`@keyframes ping { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </div>

      {/* Action buttons */}
      {!isInactive && (
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
              }}>立即预订</button>
          )}
          {app.status === 'completed' && (
            <button style={{
              flex:1, height:36, borderRadius:999, border:0,
              background:LL.ink, color:'#fff',
              fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:LL.font,
            }}>写评论</button>
          )}
        </div>
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
  const photoSrc = (window.__resources && window.__resources.guardian2) || g.photo;
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
      <div style={{ width:48, height:48, borderRadius:'50%', overflow:'hidden', flex:'0 0 auto', background:LL.lavender }}>
        <img src={photoSrc} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
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
                      <SentAppCard key={app.id} app={app} onOpenChat={onOpenChat} onOpenSummary={onOpenSummary}/>
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
                      <SentAppCard key={app.id} app={app} onOpenChat={onOpenChat} onOpenSummary={onOpenSummary}/>
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

Object.assign(window, { BookingRequestScreen, ChatView });
