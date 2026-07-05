// Lou Lou — BookingSummaryScreen.jsx
// 预约摘要页：深色摘要卡 + 费用明细 + 取消订单 + 付款

const BS_SVC_ICON = {
  '寄养':'house','日托':'sun','遛狗':'sneaker',
  '上门喂养':'hand-waving','伴宠留宿':'moon-stars',
  '上门服务':'hand-waving','住家守护':'moon-stars',
};
const BS_SVC_BG = {
  '寄养':'#FEE7A6','日托':'#FBD3C4','遛狗':'#C7E8D8',
  '上门喂养':'#D8CAE8','伴宠留宿':'#C7D8EE',
  '上门服务':'#D8CAE8','住家守护':'#C7D8EE',
};

function bsCancelDate(dateStartStr) {
  const match = (dateStartStr || '').match(/(\d+)月(\d+)日/);
  if (!match) return '服务前一天';
  const dt = new Date(2026, parseInt(match[1]) - 1, parseInt(match[2]));
  dt.setDate(dt.getDate() - 1);
  return `${dt.getMonth() + 1}月${dt.getDate()}日`;
}

// ─── Cancel Order Modal ───────────────────────────────────────
function BsCancelOrderModal({ onClose, onConfirm, cancelDateStr, policyOnly = false }) {
  const sections = [
    { title:'全额退款', icon:'check-circle', color:'#2C7A4B', bg:'#E6F1EC',
      text:`在服务开始前一天（${cancelDateStr}）12:00 之前申请取消，可享免费取消（全额退款）。` },
    { title:'部分扣款', icon:'warning', color:'#B45309', bg:'#FEF3C7',
      text:'在服务开始前一天的 12:00 之后申请取消，将扣除首日服务费的 20%，其余费用退还。' },
    { title:'多日订单', icon:'calendar-blank', color:'#2F5F87', bg:'#E3EEF7',
      text:'若为连续多日的订单，扣款与退款标准将依据"提交申请当天"与"剩余未服务首日"之间的时差，参照上述规则同理推算。' },
  ];
  return (
    <>
      <div onClick={onClose} style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.45)',zIndex:95 }}/>
      <div style={{
        position:'absolute',left:16,right:16,bottom:24,zIndex:96,
        background:'#fff',borderRadius:20,
        boxShadow:'0 16px 48px rgba(0,0,0,0.18)',
        fontFamily:LL.font,overflow:'hidden',
      }}>
        <div style={{ padding:'20px 20px 14px',borderBottom:`1px solid ${LL.border}`,display:'flex',alignItems:'center' }}>
          <div>
            <div style={{ fontSize:16,fontWeight:700,color:LL.text }}>{policyOnly ? '取消政策' : '取消订单'}</div>
            <div style={{ fontSize:12,color:LL.text3,marginTop:2 }}>Lou Lou 平台取消条款</div>
          </div>
          <button onClick={onClose} style={{ marginLeft:'auto',width:30,height:30,borderRadius:'50%',border:0,background:'#F0F0F5',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>
            <i className="ph ph-x" style={{ fontSize:13,color:LL.text }}/>
          </button>
        </div>
        <div style={{ padding:'14px 20px 4px',display:'flex',flexDirection:'column',gap:14 }}>
          {sections.map((s,i) => (
            <div key={i} style={{ display:'flex',gap:12,alignItems:'flex-start' }}>
              <div style={{ width:34,height:34,borderRadius:10,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',flex:'0 0 auto' }}>
                <i className={`ph-fill ph-${s.icon}`} style={{ fontSize:17,color:s.color }}/>
              </div>
              <div style={{ flex:1,paddingTop:2 }}>
                <div style={{ fontSize:13.5,fontWeight:700,color:LL.text,marginBottom:4 }}>{s.title}</div>
                <div style={{ fontSize:12.5,color:LL.text2,lineHeight:1.65 }}>{s.text}</div>
              </div>
            </div>
          ))}
        </div>
        {!policyOnly && (
          <div style={{ padding:'18px 20px 24px' }}>
            <button onClick={onConfirm} style={{
              width:'100%',height:50,borderRadius:999,border:0,
              background:'#E63946',color:'#fff',
              fontSize:15,fontWeight:700,fontFamily:LL.font,cursor:'pointer',
              letterSpacing:'0.04em',
            }}>确认取消</button>
            <button onClick={onClose} style={{
              width:'100%',height:40,marginTop:6,background:'transparent',border:0,
              fontSize:13.5,color:LL.text3,cursor:'pointer',fontFamily:LL.font,
            }}>暂不取消</button>
          </div>
        )}
        {policyOnly && <div style={{ height:20 }}/>}
      </div>
    </>
  );
}

// ─── Main ────────────────────────────────────────────────────
function BookingSummaryScreen({ app, onBack, onModify, onViewGuardian }) {
  const [payOpen,         setPayOpen]         = React.useState(false);
  const [paid,            setPaid]            = React.useState(false);
  const [cancelOpen,      setCancelOpen]      = React.useState(false);
  const [cancelled,       setCancelled]       = React.useState(false);
  const [cancelKind,      setCancelKind]      = React.useState(null); // 'request' | 'order'
  const [couponApplied,   setCouponApplied]   = React.useState(false);
  const [policyOpen,      setPolicyOpen]      = React.useState(false);
  // completed-order actions
  const [tipAmt,    setTipAmt]    = React.useState(null);  // number | null
  const [tipOpen,   setTipOpen]   = React.useState(false);
  const [tipDraft,  setTipDraft]  = React.useState('');
  const [collected, setCollected] = React.useState(false);
  const [reviewed,  setReviewed]  = React.useState(false);
  // order number copy + customer support
  const [copied,    setCopied]    = React.useState(false);
  const [supportOpen, setSupportOpen] = React.useState(false);
  const orderNo = app.orderNo || ('LL' + String(app.id || '').replace(/\D/g,'').slice(-10).padStart(10,'0'));
  const copyOrderNo = () => {
    try { navigator.clipboard && navigator.clipboard.writeText(orderNo); } catch (e) {}
    setCopied(true); setTimeout(() => setCopied(false), 1600);
  };
  const cancelDateStr = bsCancelDate(app.dateStart);
  const gPhoto = (typeof resolveGuardianPhoto === 'function') ? resolveGuardianPhoto(app.guardian) : (app.guardian?.photo || null);
  const gInitial = app.guardian?.initial;
  const isCompleted = app.status === 'completed';

  const isPending  = app.status === 'pending';
  const isAccepted = app.status === 'accepted';
  const canBook    = isAccepted && !paid && !cancelled;

  const nights    = app.nights    || 1;
  const unitPrice = app.price     || 88;
  const svcTotal  = unitPrice * nights;
  const isUrgent = React.useMemo(() => {
    const match = (app.dateStart||'').match(/(\d+)月(\d+)日/);
    if (!match) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    const d = new Date(today.getFullYear(), parseInt(match[1])-1, parseInt(match[2]));
    d.setHours(0,0,0,0);
    const diff = (d - today) / 86400000;
    return diff >= 0 && diff <= 1;
  }, [app.dateStart]);
  const BS_EMERGENCY_FEE = {'寄养':15,'日托':10,'遛狗':8,'上门喂养':8,'伴宠留宿':15,'上门服务':8,'住家守护':15};
  const urgencyFee = isUrgent ? (BS_EMERGENCY_FEE[app.service]||0) : 0;
  const svcIcon   = BS_SVC_ICON[app.service] || 'paw-print';
  const petName   = (app.pet || '豆豆').split('·').pop().trim();
  const svcUnit   = app.service === '日托' ? '天' : (app.service === '遛狗' || app.service === '上门喂养' || app.service === '上门服务') ? '次' : '晚';

  // Extras derived from dropoff / pickup present
  const extraItems = [
    app.dropoff ? { label:'守护者上门接送（送达）', detail:`时间段：${app.dropoff}`, price:30 } : null,
    app.pickup  ? { label:'守护者上门接送（接回）', detail:`时间段：${app.pickup}`,  price:30 } : null,
  ].filter(Boolean);
  const extrasTotal = extraItems.reduce((s,e) => s+e.price, 0);
  const discount    = couponApplied ? Math.round(svcTotal * 0.1) : 0;
  const total       = svcTotal + extrasTotal + urgencyFee - discount;

  const handleConfirmCancel = () => {
    setCancelled(true);
    setCancelKind('order');
    setCancelOpen(false);
  };

  // Pre-payment: cancelling a *request* needs no policy modal (nothing paid yet)
  const handleCancelRequest = () => {
    setCancelled(true);
    setCancelKind('request');
  };

  return (
    <div style={{ display:'flex',flexDirection:'column',flex:1,overflow:'hidden',position:'relative',background:LL.bg }}>

      {/* ── Top Nav ── */}
      <div style={{ flex:'0 0 auto',height:52,background:'#fff',borderBottom:`1px solid ${LL.border}`,display:'flex',alignItems:'center',padding:'0 16px' }}>
        <button onClick={onBack} style={{ display:'flex',alignItems:'center',gap:3,background:'transparent',border:0,cursor:'pointer',fontFamily:LL.font,padding:0,color:LL.text2,fontSize:13.5 }}>
          <i className="ph ph-caret-left" style={{ fontSize:16,color:LL.text2 }}/>
          返回
        </button>
        <div style={{ flex:1,textAlign:'center',fontSize:15,fontWeight:700,color:LL.text }}>订单摘要</div>
        <div style={{ width:48 }}/>
      </div>

      {/* ── Cancelled banner ── */}
      {cancelled && (
        <div style={{ flex:'0 0 auto',background:'#FFF0F0',borderBottom:'1px solid #FCA5A5',padding:'10px 16px',display:'flex',alignItems:'center',gap:10 }}>
          <i className="ph ph-x-circle" style={{ fontSize:16,color:'#CC2200',flex:'0 0 auto' }}/>
          <span style={{ fontSize:13,color:'#CC2200',fontWeight:600 }}>
            {cancelKind === 'order'
              ? '订单已取消，退款将在 3–5 个工作日内处理'
              : '请求已取消，已通知守护者'}
          </span>
        </div>
      )}

      {/* ── Pending banner ── */}
      {isPending && !cancelled && (
        <div style={{ flex:'0 0 auto',background:'#FFF3CD',borderBottom:'1px solid #F5C518',padding:'10px 16px',display:'flex',alignItems:'center',gap:10 }}>
          <span style={{ fontSize:15,flex:'0 0 auto' }}>⚠️</span>
          <span style={{ fontSize:13,color:'#92400E',fontWeight:600,lineHeight:1.4 }}>该请求尚未确认，等待守护者回复中</span>
        </div>
      )}

      {/* ── Scrollable content ── */}
      <div style={{ flex:1,overflowY:'auto' }}>

        {/* ── Dark summary card ── */}
        <div style={{ margin:'16px 16px 0',background:LL.ink,borderRadius:'16px 16px 0 0',overflow:'hidden' }}>
          <div style={{ padding:'16px 20px 18px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:16,paddingBottom:14,borderBottom:'1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width:46,height:46,borderRadius:12,background:BS_SVC_BG[app.service]||'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',flex:'0 0 auto' }}>
                <i className={`ph ph-${svcIcon}`} style={{ fontSize:24,color:BS_SVC_BG[app.service]?LL.text:'#fff' }}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:18,fontWeight:800,color:'#fff' }}>{app.service}</div>
                <div style={{ marginTop:5 }}>
                  {isPending&&!cancelled&&<span style={{ background:'rgba(255,255,255,0.14)',borderRadius:999,padding:'2px 9px',fontSize:11,color:'rgba(255,255,255,0.75)',fontWeight:600 }}>等待确认</span>}
                  {isAccepted&&!paid&&!cancelled&&<span style={{ background:'rgba(44,122,75,0.45)',borderRadius:999,padding:'2px 9px',fontSize:11,color:'#8DE8A8',fontWeight:600 }}>守护者已接单</span>}
                  {paid&&!cancelled&&<span style={{ background:'rgba(7,193,96,0.3)',borderRadius:999,padding:'2px 9px',fontSize:11,color:'#7CDBA0',fontWeight:600 }}>已付款</span>}
                  {cancelled&&<span style={{ background:'rgba(230,57,70,0.25)',borderRadius:999,padding:'2px 9px',fontSize:11,color:'#FCA5A5',fontWeight:600 }}>已取消</span>}
                  {isCompleted&&<span style={{ background:'rgba(255,255,255,0.14)',borderRadius:999,padding:'2px 9px',fontSize:11,color:'rgba(255,255,255,0.75)',fontWeight:600 }}>已完成</span>}
                </div>
              </div>
              {/* Order number + copy — top-right of card */}
              <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:5,flex:'0 0 auto',alignSelf:'flex-start',paddingTop:2 }}>
                <span style={{ fontSize:10,color:'rgba(255,255,255,0.4)',fontVariantNumeric:'tabular-nums',letterSpacing:'0.02em' }}>#{orderNo.slice(-8)}</span>
                <button onClick={copyOrderNo} style={{ width:26,height:26,borderRadius:'50%',border:'1px solid rgba(255,255,255,0.18)',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',padding:0 }}>
                  <i className={copied?'ph-fill ph-check':'ph ph-copy'} style={{ fontSize:12,color:copied?'#7CDBA0':'rgba(255,255,255,0.5)' }}/>
                </button>
              </div>
            </div>

            {/* Guardian — tap to view profile */}
            <button onClick={() => onViewGuardian?.(app.guardian)} style={{
              width:'100%', display:'flex', alignItems:'center', gap:11,
              background:'rgba(255,255,255,0.09)', border:0, borderRadius:12,
              padding:'10px 12px', marginBottom:16, cursor:'pointer', fontFamily:LL.font, textAlign:'left',
            }}>
              <div style={{ width:38,height:38,borderRadius:'50%',overflow:'hidden',flex:'0 0 auto',background: gInitial?.bg || 'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {gPhoto
                  ? <img src={gPhoto} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top center' }}/>
                  : <span style={{ fontSize:16, fontWeight:800, color: gInitial?.bg ? LL.text : '#fff' }}>{gInitial?.char || app.guardian?.name?.[0]}</span>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14.5,fontWeight:700,color:'#fff' }}>{app.guardian?.name || '守护者'}</div>
                <div style={{ fontSize:11.5,color:'rgba(255,255,255,0.55)',marginTop:1 }}>守护者 · 查看主页</div>
              </div>
              <i className="ph ph-caret-right" style={{ fontSize:14,color:'rgba(255,255,255,0.55)',flex:'0 0 auto' }}/>
            </button>

            {[
              { icon:'map-pin',        text:app.area },
              { icon:'calendar-blank', text:[app.dateStart, app.dateEnd && app.dateEnd !== app.dateStart ? `→ ${app.dateEnd}` : null, nights > 0 ? `· 共${nights}${svcUnit}` : null].filter(Boolean).join(' ') },
              app.dropoff ? { icon:'arrow-circle-right', text:`送达 ${app.dropoff}` } : null,
              app.pickup  ? { icon:'arrow-circle-left',  text:`接回 ${app.pickup}` }  : null,

            ].filter(Boolean).map((row,i,arr) => (
              <div key={i} style={{ display:'flex',alignItems:'center',gap:10,marginBottom:i<arr.length-1?10:0 }}>
                <i className={`ph ph-${row.icon}`} style={{ fontSize:15,color:'rgba(255,255,255,0.45)',flex:'0 0 auto' }}/>
                <span style={{ fontSize:13.5,color:'rgba(255,255,255,0.85)' }}>{row.text}</span>
              </div>
            ))}
            {/* 联系客服 */}
            <button onClick={() => setSupportOpen(true)} style={{
              width:'100%',marginTop:14,padding:'10px 14px',
              background:'rgba(255,255,255,0.09)',border:0,borderRadius:12,
              display:'flex',alignItems:'center',gap:10,
              cursor:'pointer',fontFamily:LL.font,textAlign:'left',
            }}>
              <i className="ph ph-headset" style={{ fontSize:17,color:'rgba(255,255,255,0.65)',flex:'0 0 auto' }}/>
              <span style={{ flex:1,fontSize:13.5,fontWeight:600,color:'rgba(255,255,255,0.9)' }}>联系客服</span>
              <span style={{ fontSize:11.5,color:'rgba(255,255,255,0.4)' }}>7×24 小时</span>
              <i className="ph ph-caret-right" style={{ fontSize:13,color:'rgba(255,255,255,0.4)' }}/>
            </button>
          </div>
        </div>

        {/* ── Fee breakdown ── */}
        <div style={{ margin:'0 16px',background:'#F5F5F9',borderRadius:'0 0 16px 16px',padding:'16px 20px 18px' }}>
          {/* Main service */}
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14 }}>
            <div>
              <div style={{ fontSize:14,fontWeight:600,color:LL.text }}>{app.service}</div>
              <div style={{ fontSize:12,color:LL.text3,marginTop:2 }}>¥{unitPrice}/{svcUnit} × {nights}{svcUnit}</div>
            </div>
            <span style={{ fontSize:14,fontWeight:600,color:LL.text }}>¥{svcTotal}</span>
          </div>

          {/* Extra services */}
          {extraItems.map((ex,i) => (
            <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14 }}>
              <div>
                <div style={{ fontSize:14,color:LL.text2 }}>{ex.label}</div>
                <div style={{ fontSize:12,color:LL.text3,marginTop:2 }}>{ex.detail}</div>
              </div>
              <span style={{ fontSize:14,fontWeight:600,color:LL.text }}>+¥{ex.price}</span>
            </div>
          ))}

          {/* Urgency fee */}
          {isUrgent && (
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14 }}>
              <div>
                <div style={{ fontSize:14,color:'#B45309' }}>⚡ 紧急预约附加费</div>
                <div style={{ fontSize:12,color:LL.text3,marginTop:2 }}>预约当天或次日视为紧急预约</div>
              </div>
              <span style={{ fontSize:14,fontWeight:600,color:'#B45309' }}>+¥{urgencyFee}</span>
            </div>
          )}
          {/* Coupon */}
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14 }}>
            <div style={{ display:'flex',alignItems:'center',gap:6 }}>
              <i className="ph ph-ticket" style={{ fontSize:14,color:couponApplied?'#E63946':LL.text3 }}/>
              <span style={{ fontSize:14,color:couponApplied?'#E63946':LL.text3 }}>
                {couponApplied ? '新用户9折优惠' : '优惠券'}
              </span>
            </div>
            {couponApplied ? (
              <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                <span style={{ fontSize:14,fontWeight:700,color:'#E63946' }}>-¥{discount}</span>
                <button onClick={() => setCouponApplied(false)} style={{ fontSize:12,color:LL.text3,background:'transparent',border:0,cursor:'pointer',fontFamily:LL.font }}>移除</button>
              </div>
            ) : (
              <button onClick={() => setCouponApplied(true)} style={{ display:'flex',alignItems:'center',gap:2,fontSize:13,color:LL.ink,fontWeight:600,background:'transparent',border:0,cursor:'pointer',fontFamily:LL.font,padding:0,marginRight:0 }}>
                选择<i className="ph ph-caret-right" style={{ fontSize:11 }}/>
              </button>
            )}
          </div>

          <div style={{ height:1,background:LL.border,marginBottom:14 }}/>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <span style={{ fontSize:15,fontWeight:700,color:LL.text }}>合计</span>
            <span style={{ fontSize:18,fontWeight:800,color:LL.text }}>¥{total}</span>
          </div>
        </div>

        {/* ── 打赏（已完成订单） ── */}
        {isCompleted && (
          <div style={{ margin:'12px 16px 0', background:'#fff', borderRadius:14, padding:'14px 16px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            {tipAmt == null ? (
              <>
                <div style={{ fontSize:14, fontWeight:700, color:LL.text, marginBottom:3 }}>打赏 {app.guardian?.name || '守护者'}</div>
                <div style={{ fontSize:11.5, color:LL.text3, marginBottom:12 }}>打赏金额 100% 归守护者所有</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                  {[8,18,66].map(a => (
                    <button key={a} onClick={() => setTipAmt(a)} style={{ height:46, borderRadius:10, border:`1.5px solid ${LL.border}`, background:'#fff', cursor:'pointer', fontFamily:LL.font, fontSize:15, fontWeight:800, color:LL.text }}>¥{a}</button>
                  ))}
                  <button onClick={() => setTipOpen(true)} style={{ height:46, borderRadius:10, border:`1.5px solid ${LL.border}`, background:'#fff', cursor:'pointer', fontFamily:LL.font, fontSize:12.5, fontWeight:600, color:LL.text2 }}>其他金额</button>
                </div>
              </>
            ) : (
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40,height:40,borderRadius:10,background:'#FFF3CD',display:'flex',alignItems:'center',justifyContent:'center',flex:'0 0 auto' }}>
                  <i className="ph-fill ph-hand-coins" style={{ fontSize:20, color:'#B45309' }}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:LL.text }}>已打赏 ¥{tipAmt}</div>
                  <div style={{ fontSize:11.5, color:LL.text3, marginTop:1 }}>打赏金额 100% 归守护者所有</div>
                </div>
                <button onClick={() => setTipOpen(true)} style={{ height:32, padding:'0 12px', borderRadius:999, border:`1.5px solid ${LL.ink}`, background:'transparent', color:LL.ink, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:LL.font, flex:'0 0 auto' }}>追加打赏</button>
              </div>
            )}
          </div>
        )}



        {/* ── 取消订单 / 修改订单 — small buttons, hugging order content ── */}
        {!isCompleted && !cancelled && !paid && (
          <div style={{ margin:'10px 16px 0',display:'flex',justifyContent:'flex-end',gap:8 }}>
            <button onClick={handleCancelRequest} style={{
              height:32,padding:'0 14px',borderRadius:999,background:'transparent',
              border:`1px solid ${LL.border}`,color:LL.text2,
              fontSize:12.5,fontWeight:600,fontFamily:LL.font,cursor:'pointer',whiteSpace:'nowrap',
            }}>取消订单</button>
            <button onClick={() => onModify?.(app)} style={{
              height:32,padding:'0 14px',borderRadius:999,background:'transparent',
              border:`1px solid ${LL.border}`,color:LL.text,
              fontSize:12.5,fontWeight:700,fontFamily:LL.font,cursor:'pointer',whiteSpace:'nowrap',
              display:'flex',alignItems:'center',justifyContent:'center',gap:4,
            }}>
              <i className="ph ph-pencil-simple" style={{ fontSize:14 }}/>
              修改订单
            </button>
          </div>
        )}

        {/* ── Safety note ── */}
        <div style={{ margin:'10px 16px 0',padding:'10px 14px',background:'#FFFBEB',borderRadius:8 }}>
          <span style={{ fontSize:12,color:'#92400E',lineHeight:1.55 }}>请通过平台完成预约和付款，切勿私下现金交易。</span>
        </div>

        <div style={{ height:24 }}/>
      </div>

      {/* ── Bottom Buttons ── */}
      <div style={{ flex:'0 0 auto',background:'#fff',borderTop:`1px solid ${LL.border}`,padding:'12px 16px 12px',display:'flex',gap:10,flexDirection:'column' }}>
        {isCompleted && (
          <div style={{ display:'flex', gap:10 }}>
            <button onClick={() => setCollected(c => !c)} style={{
              flex:1, height:50, borderRadius:999,
              border:`1.5px solid ${collected ? LL.border : LL.ink}`, background:'transparent',
              color: collected ? LL.text3 : LL.ink, fontSize:14.5, fontWeight:700, fontFamily:LL.font, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:5,
            }}>
              <i className={`${collected ? 'ph-fill' : 'ph'} ph-heart`} style={{ fontSize:16, color: collected ? '#E63946' : LL.ink }}/>
              {collected ? '已收藏' : '收藏守护者'}
            </button>
            <button onClick={() => setReviewed(true)} style={{
              flex:1, height:50, borderRadius:999, border:0, background:LL.ink, color:'#fff',
              fontSize:14.5, fontWeight:700, fontFamily:LL.font, cursor:'pointer',
            }}>{reviewed ? '追加评价' : '评价'}</button>
          </div>
        )}

        {!isCompleted && !cancelled && !paid && (
          /* 立即付款 only */
          <button disabled={!canBook} onClick={() => canBook && setPayOpen(true)} style={{
            width:'100%',height:52,borderRadius:999,border:0,
            background:canBook?LL.ink:'rgba(34,40,44,0.22)',color:'#fff',
            fontSize:15,fontWeight:700,fontFamily:LL.font,
            cursor:canBook?'pointer':'not-allowed',transition:'background 200ms',
          }}>立即付款</button>
        )}

        {!cancelled && paid && (
          <>
            <button disabled style={{
              width:'100%',height:52,borderRadius:999,border:0,
              background:'rgba(34,40,44,0.22)',color:'#fff',
              fontSize:15,fontWeight:700,fontFamily:LL.font,cursor:'not-allowed',
            }}>已预订 ✓</button>
            {/* Post-payment cancellation DOES show the policy */}
            <button onClick={() => setCancelOpen(true)} style={{
              width:'100%',height:46,borderRadius:999,background:'transparent',
              border:`1.5px solid ${LL.border}`,color:LL.text2,
              fontSize:14,fontWeight:600,fontFamily:LL.font,cursor:'pointer',
            }}>取消订单</button>
            <button onClick={() => setCancelOpen(true)} style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:5,background:'transparent',border:0,cursor:'pointer',padding:0,fontFamily:LL.font }}>
              <i className="ph ph-calendar-blank" style={{ fontSize:12,color:LL.text3 }}/>
              <span style={{ fontSize:11.5,color:LL.text3,textDecoration:'underline' }}>{cancelDateStr} 12:00前可免费取消</span>
            </button>
          </>
        )}
      </div>

      {/* ── Payment confirmation drawer (温馨提示 + 微信支付) ── */}
      {payOpen && (
        <>
          <div onClick={() => setPayOpen(false)} style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.45)',zIndex:85 }}/>
          <div style={{ position:'absolute',left:0,right:0,bottom:0,zIndex:86,background:'#fff',borderTopLeftRadius:20,borderTopRightRadius:20,padding:'0 0 28px',boxShadow:'0 -8px 28px rgba(0,0,0,0.15)',fontFamily:LL.font }}>
            <div style={{ width:38,height:4,borderRadius:2,background:LL.border,margin:'12px auto 14px' }}/>
            <div style={{ textAlign:'center',fontSize:15,fontWeight:700,color:LL.text,marginBottom:8 }}>确认付款</div>
            <div style={{ textAlign:'center',marginBottom:18 }}>
              <span style={{ fontSize:36,fontWeight:800,color:LL.text,letterSpacing:'-0.02em' }}>¥{total}</span>
            </div>
            <div style={{ margin:'0 16px 14px',padding:'14px 16px',background:'#F5F5F9',borderRadius:12,display:'flex',alignItems:'center',gap:14 }}>
              <div style={{ width:42,height:42,borderRadius:10,background:'#07C160',display:'flex',alignItems:'center',justifyContent:'center',flex:'0 0 auto' }}>
                <i className="ph-fill ph-chat-circle-dots" style={{ fontSize:22,color:'#fff' }}/>
              </div>
              <span style={{ flex:1,fontSize:15,fontWeight:600,color:LL.text }}>微信支付</span>
              <div style={{ width:22,height:22,borderRadius:'50%',background:LL.ink,display:'flex',alignItems:'center',justifyContent:'center' }}>
                <i className="ph-bold ph-check" style={{ fontSize:11,color:'#fff' }}/>
              </div>
            </div>

            {/* 温馨提示 */}
            <div style={{ margin:'0 16px 18px',padding:'12px 14px',background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:12 }}>
              <div style={{ display:'flex',alignItems:'center',gap:6,marginBottom:6 }}>
                <i className="ph-fill ph-info" style={{ fontSize:15,color:'#B45309' }}/>
                <span style={{ fontSize:13,fontWeight:700,color:'#92400E' }}>温馨提示</span>
              </div>
              <div style={{ fontSize:12.5,color:'#92400E',lineHeight:1.7,textWrap:'pretty' }}>
                您支付后需等待守护者确认，订单经确认后正式生效。订单生效后的取消操作将遵循平台的
                <button onClick={() => setPolicyOpen(true)} style={{ background:'transparent',border:0,padding:0,margin:'0 1px',cursor:'pointer',fontFamily:LL.font,fontSize:12.5,fontWeight:700,color:'#B45309',textDecoration:'underline' }}>取消政策</button>
                执行。若守护者在 24 小时内未确认，款项将原路退回。
              </div>
            </div>

            <div style={{ padding:'0 16px',display:'flex',flexDirection:'column',gap:10 }}>
              <button onClick={() => { setPaid(true); setPayOpen(false); }} style={{ width:'100%',height:52,borderRadius:999,border:0,background:'#07C160',color:'#fff',fontSize:15,fontWeight:700,fontFamily:LL.font,cursor:'pointer',letterSpacing:'0.04em' }}>确认并付款</button>
              <button onClick={() => setPayOpen(false)} style={{ width:'100%',height:46,borderRadius:999,border:`1.5px solid ${LL.border}`,background:'transparent',color:LL.text2,fontSize:14,fontWeight:600,fontFamily:LL.font,cursor:'pointer' }}>我再想想</button>
            </div>
          </div>
        </>
      )}

      {/* ── Cancel Order Modal ── */}
      {cancelOpen && (
        <BsCancelOrderModal
          onClose={() => setCancelOpen(false)}
          onConfirm={handleConfirmCancel}
          cancelDateStr={cancelDateStr}
        />
      )}
      {/* ── Cancel Policy Modal (read-only, from 温馨提示) ── */}
      {policyOpen && (
        <BsCancelOrderModal
          policyOnly
          onClose={() => setPolicyOpen(false)}
          cancelDateStr={cancelDateStr}
        />
      )}

      {/* ── 打赏金额 sheet ── */}
      {tipOpen && (
        <>
          <div onClick={() => setTipOpen(false)} style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.45)',zIndex:95 }}/>
          <div style={{ position:'absolute',left:0,right:0,bottom:0,zIndex:96,background:'#fff',borderTopLeftRadius:20,borderTopRightRadius:20,padding:'0 0 28px',boxShadow:'0 -8px 28px rgba(0,0,0,0.15)',fontFamily:LL.font }}>
            <div style={{ width:38,height:4,borderRadius:2,background:LL.border,margin:'12px auto 14px' }}/>
            <div style={{ textAlign:'center', fontSize:16, fontWeight:700, color:LL.text }}>打赏 {app.guardian?.name || '守护者'}</div>
            <div style={{ textAlign:'center', fontSize:12, color:LL.text3, marginTop:4, marginBottom:16 }}>打赏金额 100% 归守护者所有</div>
            <div style={{ padding:'0 16px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:12 }}>
              {[8,18,66].map(a => {
                const on = String(a) === tipDraft;
                return (
                  <button key={a} onClick={() => setTipDraft(String(a))} style={{
                    height:48, borderRadius:10, border:`1.5px solid ${on?LL.ink:LL.border}`,
                    background: on?LL.ink:'#fff', color:on?'#fff':LL.text, fontSize:16, fontWeight:800,
                    cursor:'pointer', fontFamily:LL.font,
                  }}>¥{a}</button>
                );
              })}
            </div>
            <div style={{ padding:'0 16px', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', height:50, border:`1.5px solid ${LL.border}`, borderRadius:12, padding:'0 14px', gap:6 }}>
                <span style={{ fontSize:18, fontWeight:800, color:LL.text }}>¥</span>
                <input type="number" min="1" step="1" inputMode="numeric" value={tipDraft}
                  onChange={e => setTipDraft(e.target.value.replace(/[^0-9]/g,''))}
                  placeholder="其他金额（仅支持整数）"
                  style={{ flex:1, border:0, outline:'none', background:'transparent', fontSize:16, fontWeight:700, color:LL.text, fontFamily:LL.font }}/>
              </div>
            </div>
            <div style={{ padding:'0 16px' }}>
              <button disabled={!(parseInt(tipDraft,10) > 0)} onClick={() => { const a = parseInt(tipDraft,10); if (a>0){ setTipAmt(a); setTipOpen(false); setTipDraft(''); } }} style={{
                width:'100%', height:52, borderRadius:999, border:0,
                background: parseInt(tipDraft,10) > 0 ? '#07C160' : 'rgba(34,40,44,0.22)', color:'#fff',
                fontSize:15, fontWeight:700, fontFamily:LL.font, cursor: parseInt(tipDraft,10) > 0 ? 'pointer':'not-allowed',
              }}>确认打赏{parseInt(tipDraft,10) > 0 ? ` ¥${parseInt(tipDraft,10)}` : ''}</button>
            </div>
          </div>
        </>
      )}

      {/* ── 联系客服 sheet ── */}
      {supportOpen && (
        <>
          <div onClick={() => setSupportOpen(false)} style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.45)',zIndex:95 }}/>
          <div style={{ position:'absolute',left:0,right:0,bottom:0,zIndex:96,background:'#fff',borderTopLeftRadius:20,borderTopRightRadius:20,padding:'0 0 28px',boxShadow:'0 -8px 28px rgba(0,0,0,0.15)',fontFamily:LL.font }}>
            <div style={{ width:38,height:4,borderRadius:2,background:LL.border,margin:'12px auto 14px' }}/>
            <div style={{ textAlign:'center', fontSize:16, fontWeight:700, color:LL.text, marginBottom:4 }}>联系客服</div>
            <div style={{ textAlign:'center', fontSize:12, color:LL.text3, marginBottom:16 }}>订单号 {orderNo} · 客服 7×24 小时在线</div>
            {[
              { icon:'chat-circle-dots', label:'在线客服', sub:'平均 1 分钟响应' },
              { icon:'phone', label:'电话客服', sub:'400-666-8888' },
            ].map((it,i) => (
              <button key={i} onClick={() => setSupportOpen(false)} style={{
                width:'100%', padding:'14px 16px', background:'transparent', border:0,
                borderTop: i===0?`1px solid ${LL.border}`:'none', borderBottom:`1px solid ${LL.border}`,
                display:'flex', alignItems:'center', gap:12, cursor:'pointer', fontFamily:LL.font, textAlign:'left',
              }}>
                <div style={{ width:38,height:38,borderRadius:10,background:'#E6F1EC',display:'flex',alignItems:'center',justifyContent:'center',flex:'0 0 auto' }}>
                  <i className={`ph ph-${it.icon}`} style={{ fontSize:19, color:'#2C7A4B' }}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:LL.text }}>{it.label}</div>
                  <div style={{ fontSize:12, color:LL.text3, marginTop:1 }}>{it.sub}</div>
                </div>
                <i className="ph ph-caret-right" style={{ fontSize:14, color:LL.text3 }}/>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Order Modify Screen (修改订单) ───────────────────────────
function bsParse(str) {
  const m = (str || '').match(/(\d+)月(\d+)日/);
  if (!m) return null;
  return new Date(2026, parseInt(m[1]) - 1, parseInt(m[2]));
}
function bsFmt(d) {
  if (!d) return '';
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
const BS_MOD_SVC_SUB = {
  '寄养':'在守护者家','日托':'在守护者家','遛狗':'在宠物主家','上门喂养':'在宠物主家','伴宠留宿':'在宠物主家',
};

function BSModHead({ title, hint }) {
  return (
    <div style={{ background:'#F5F5F9', padding:'9px 16px 7px' }}>
      <div style={{ fontSize:12, fontWeight:600, color:LL.text3, letterSpacing:'0.04em' }}>{title}</div>
      {hint && <div style={{ fontSize:11, color:LL.text3, marginTop:2 }}>{hint}</div>}
    </div>
  );
}

const BS_DEMO_PETS = [
  { id:'p1', name:'豆豆', breed:'金毛', weight:'22', age:'3岁', bg:'#FEE7A6' },
  { id:'p2', name:'奶茶', breed:'英短', weight:'4.5', age:'2岁', bg:'#FBD3C4' },
];

function OrderModifyScreen({ app, onClose, onConfirm, pets }) {
  const services = (app.guardian?.services && app.guardian.services.length)
    ? app.guardian.services.map(s => s.id)
    : ['遛狗','寄养','日托','上门喂养'];
  const petsList = (pets && pets.length) ? pets : BS_DEMO_PETS;
  const [service, setService] = React.useState(app.service || services[0]);
  const [range,   setRange]   = React.useState({ start: bsParse(app.dateStart), end: bsParse(app.dateEnd) });
  const [dateOpen,setDateOpen]= React.useState(false);
  const [note,    setNote]    = React.useState('');
  const [petEnabled, setPetEnabled] = React.useState(() => Object.fromEntries(petsList.map(p => [p.id, true])));
  const [phone,   setPhone]   = React.useState(app.phone || '');
  const [addr,    setAddr]    = React.useState(app.area || '');
  const bookedDates = app.guardian?.bookedDates || [];
  const Calendar    = window.GuardianCalendar;

  const isRangeSvc = service === '寄养' || service === '日托' || service === '伴宠留宿';
  const isPetHome  = service === '遛狗' || service === '上门喂养' || service === '伴宠留宿';
  const canConfirm = !!range.start;
  const dateLabel  = range.start
    ? (range.end && bsFmt(range.end) !== bsFmt(range.start) ? `${bsFmt(range.start)} → ${bsFmt(range.end)}` : bsFmt(range.start))
    : '点击选择日期';

  return (
    <div style={{ position:'absolute', inset:0, paddingTop:47, zIndex:80, background:LL.bg, display:'flex', flexDirection:'column', fontFamily:LL.font }}>
      {/* Nav */}
      <div style={{ flex:'0 0 auto', height:52, background:'#fff', borderBottom:`1px solid ${LL.border}`, display:'flex', alignItems:'center', padding:'0 16px' }}>
        <button onClick={onClose} style={{ display:'flex',alignItems:'center',gap:3,background:'transparent',border:0,cursor:'pointer',fontFamily:LL.font,padding:0,color:LL.text2,fontSize:13.5 }}>
          <i className="ph ph-caret-left" style={{ fontSize:16 }}/> 返回
        </button>
        <div style={{ flex:1, textAlign:'center', fontSize:15, fontWeight:700, color:LL.text }}>修改订单</div>
        <div style={{ width:48 }}/>
      </div>

      {/* Body */}
      <div style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
        {/* Guardian row */}
        <div style={{ background:'#fff', padding:'14px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:`1px solid ${LL.border}` }}>
          <div style={{ width:42,height:42,borderRadius:'50%',overflow:'hidden',flex:'0 0 auto',background:(app.guardian?.initial?.bg)||LL.lavender,display:'flex',alignItems:'center',justifyContent:'center' }}>
            {app.guardian?.photo
              ? <img src={app.guardian.photo} style={{ width:'100%',height:'100%',objectFit:'cover',objectPosition:'top center' }}/>
              : <span style={{ fontSize:17,fontWeight:800,color:LL.text }}>{app.guardian?.initial?.char || (app.guardian?.name||'守')[0]}</span>}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14.5,fontWeight:700,color:LL.text }}>{app.guardian?.name || '守护者'}</div>
            <div style={{ fontSize:12,color:LL.text3,marginTop:1 }}>修改后将发送给守护者重新确认</div>
          </div>
        </div>

        {/* 服务类型 */}
        <div style={{ marginTop:12 }}>
          <BSModHead title="服务类型"/>
          <div style={{ background:'#fff', padding:'12px 16px 6px', display:'flex', flexWrap:'wrap', gap:8 }}>
            {services.map(id => {
              const on = id === service;
              return (
                <button key={id} onClick={() => setService(id)} style={{
                  height:34, padding:'0 14px', borderRadius:999, border:`1.5px solid ${on?LL.ink:LL.border}`,
                  background: on?LL.ink:'transparent', color:on?'#fff':LL.text2,
                  fontSize:13, fontWeight: on?700:500, cursor:'pointer', fontFamily:LL.font,
                  display:'flex', alignItems:'center', gap:5,
                }}>
                  {on && <i className="ph-fill ph-check" style={{ fontSize:12 }}/>}
                  {id}
                </button>
              );
            })}
          </div>
          <div style={{ background:'#fff', padding:'0 16px 12px', fontSize:12, color:LL.text3 }}>{BS_MOD_SVC_SUB[service] || ''}</div>
        </div>

        {/* 预约日期 — row opens calendar drawer */}
        <div style={{ marginTop:12 }}>
          <BSModHead title="预约日期"/>
          <button onClick={() => setDateOpen(true)} style={{
            width:'100%', background:'#fff', border:0, padding:'15px 16px',
            display:'flex', alignItems:'center', gap:10, cursor:'pointer', fontFamily:LL.font, textAlign:'left',
          }}>
            <i className="ph ph-calendar-blank" style={{ fontSize:17, color:LL.text2, flex:'0 0 auto' }}/>
            <span style={{ flex:1, fontSize:14.5, fontWeight: range.start?700:500, color: range.start?LL.text:LL.text3 }}>{dateLabel}</span>
            <span style={{ fontSize:12, color:LL.text3 }}>在守护者日历中选择</span>
            <i className="ph ph-caret-right" style={{ fontSize:13, color:LL.text3 }}/>
          </button>
        </div>

        {/* 宠物 — toggles + add (same as booking) */}
        <div style={{ marginTop:12 }}>
          <BSModHead title="宠物"/>
          <div style={{ background:'#fff' }}>
            {petsList.map(pet => {
              const wt = pet.weight ? (String(pet.weight).includes('公斤') ? pet.weight : `${pet.weight}公斤`) : null;
              const sub = [pet.breed, wt, pet.age].filter(Boolean).join(' · ');
              return (
                <div key={pet.id} style={{ display:'flex', alignItems:'center', padding:'12px 16px', gap:12, borderBottom:`1px solid ${LL.border}` }}>
                  <div style={{ width:46,height:46,borderRadius:'50%',background:pet.bg||LL.butter,flex:'0 0 auto',overflow:'hidden',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    {pet.photo ? <img src={pet.photo} alt={pet.name} style={{ width:'100%',height:'100%',objectFit:'cover' }}/> : <i className="ph ph-paw-print" style={{ fontSize:22, color:LL.text }}/>}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:14, fontWeight:700, color:LL.text }}>{pet.name}</div>
                    {sub && <div style={{ fontSize:12, color:LL.text3, marginTop:2 }}>{sub}</div>}
                  </div>
                  {typeof BFToggle === 'function'
                    ? <BFToggle on={!!petEnabled[pet.id]} onChange={v => setPetEnabled(prev => ({ ...prev, [pet.id]: v }))}/>
                    : null}
                </div>
              );
            })}
            <button style={{ width:'100%', padding:'14px 16px', background:'transparent', border:0,
              display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', fontFamily:LL.font }}>
              <span style={{ fontSize:14, color:LL.text2 }}>添加宠物</span>
              <i className="ph ph-caret-right" style={{ fontSize:12, color:LL.text3 }}/>
            </button>
          </div>
        </div>

        {/* 联系方式 — same as booking, shows filled content */}
        <div style={{ marginTop:12 }}>
          <BSModHead title="联系方式"/>
          <div style={{ background:'#fff' }}>
            {isPetHome && (
              <div style={{ display:'flex', alignItems:'center', padding:'14px 16px', gap:12, borderBottom:`1px solid ${LL.border}` }}>
                <span style={{ fontSize:14, fontWeight:500, color:LL.text, flex:'0 0 auto' }}>服务地址</span>
                <input value={addr} onChange={e => setAddr(e.target.value)} placeholder="请输入服务地址"
                  style={{ flex:1, border:0, outline:'none', fontSize:14, color:LL.text, background:'transparent', fontFamily:LL.font, textAlign:'right', caretColor:LL.ink }}/>
              </div>
            )}
            <div style={{ display:'flex', alignItems:'center', padding:'14px 16px', gap:12 }}>
              <span style={{ fontSize:14, fontWeight:500, color:LL.text, flex:'0 0 auto' }}>手机号码</span>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="请输入手机号码"
                style={{ flex:1, border:0, outline:'none', fontSize:14, color:LL.text, background:'transparent', fontFamily:LL.font, textAlign:'right', caretColor:LL.ink }}/>
            </div>
          </div>
        </div>

        {/* 留言 */}
        <div style={{ marginTop:12, marginBottom:12 }}>
          <BSModHead title="给守护者留言（选填）"/>
          <div style={{ background:'#fff', padding:'12px 16px' }}>
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="说明一下你想调整的内容…"
              style={{ width:'100%', minHeight:64, border:`1px solid ${LL.border}`, borderRadius:10, padding:'10px 12px', fontSize:14, color:LL.text, fontFamily:LL.font, outline:'none', resize:'none', boxSizing:'border-box', lineHeight:1.6 }}/>
          </div>
        </div>
        <div style={{ height:8 }}/>
      </div>

      {/* Bottom */}
      <div style={{ flex:'0 0 auto', background:'#fff', borderTop:`1px solid ${LL.border}`, padding:'12px 16px 22px' }}>
        <button disabled={!canConfirm}
          onClick={() => onConfirm?.(app, { service, dateStart: bsFmt(range.start), dateEnd: isRangeSvc && range.end ? bsFmt(range.end) : null, note })}
          style={{
            width:'100%', height:52, borderRadius:999, border:0,
            background: canConfirm?LL.ink:'rgba(34,40,44,0.22)', color:'#fff',
            fontSize:15, fontWeight:700, fontFamily:LL.font, cursor: canConfirm?'pointer':'not-allowed',
            letterSpacing:'0.04em',
          }}>确认修改并通知守护者</button>
      </div>

      {/* 日期选择 bottom drawer */}
      {dateOpen && (
        <>
          <div onClick={() => setDateOpen(false)} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', zIndex:90 }}/>
          <div style={{ position:'absolute', left:0, right:0, bottom:0, zIndex:91, background:'#fff',
            borderTopLeftRadius:20, borderTopRightRadius:20, boxShadow:'0 -8px 24px rgba(0,0,0,0.12)', fontFamily:LL.font }}>
            <div style={{ padding:'12px 16px 6px' }}>
              <div style={{ width:38, height:4, borderRadius:2, background:LL.border, margin:'0 auto 10px' }}/>
              <div style={{ display:'flex', alignItems:'center' }}>
                <div style={{ fontSize:16, fontWeight:700, color:LL.text }}>选择服务日期</div>
                <button onClick={() => setDateOpen(false)} style={{ marginLeft:'auto', width:30, height:30, borderRadius:'50%', border:0, background:'#F0F0F5', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <i className="ph ph-x" style={{ fontSize:13, color:LL.text }}/>
                </button>
              </div>
              <div style={{ fontSize:12, color:LL.text3, marginTop:4 }}>{isRangeSvc ? '选择服务区间（开始 → 结束）' : '点选一个服务日期'}</div>
            </div>
            <div style={{ padding:'2px 16px 4px' }}>
              {typeof Calendar === 'function' && (
                <Calendar
                  bookedDates={bookedDates}
                  svcPrice={null}
                  viewOnly={false}
                  scroll={true}
                  monthsCount={6}
                  start={range.start}
                  end={isRangeSvc ? range.end : null}
                  onChange={(r) => setRange(isRangeSvc ? r : { start: (r.end || r.start), end: null })}
                />
              )}
            </div>
            <div style={{ padding:'10px 16px 22px', borderTop:`1px solid ${LL.border}` }}>
              <div style={{ fontSize:12.5, color:LL.text2, marginBottom:8, textAlign:'center', minHeight:18 }}>
                {range.start ? <span style={{ color:LL.text, fontWeight:700 }}>{dateLabel}</span> : '请在日历上选择日期'}
              </div>
              <button disabled={!range.start} onClick={() => setDateOpen(false)} style={{
                width:'100%', height:50, borderRadius:999, border:0,
                background: range.start ? LL.ink : 'rgba(34,40,44,0.22)', color:'#fff',
                fontSize:16, fontWeight:700, fontFamily:LL.font, cursor: range.start?'pointer':'not-allowed', letterSpacing:'0.06em',
              }}>应用日期</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { BookingSummaryScreen, OrderModifyScreen });
