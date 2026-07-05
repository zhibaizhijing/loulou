// Lou Lou — BookingSummaryScreen.jsx
// 预约摘要页：深色摘要卡 + 费用明细 + 取消订单 + 付款

const BS_SVC_ICON = {
  '寄养':'house','日托':'sun','遛狗':'sneaker',
  '上门喂养':'hand-waving','伴宠留宿':'moon-stars',
  '上门服务':'hand-waving','住家守护':'moon-stars',
};

function bsCancelDate(dateStartStr) {
  const match = (dateStartStr || '').match(/(\d+)月(\d+)日/);
  if (!match) return '服务前一天';
  const dt = new Date(2026, parseInt(match[1]) - 1, parseInt(match[2]));
  dt.setDate(dt.getDate() - 1);
  return `${dt.getMonth() + 1}月${dt.getDate()}日`;
}

// ─── Cancel Order Modal ───────────────────────────────────────
function BsCancelOrderModal({ onClose, onConfirm, cancelDateStr }) {
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
            <div style={{ fontSize:16,fontWeight:700,color:LL.text }}>取消订单</div>
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
      </div>
    </>
  );
}

// ─── Main ────────────────────────────────────────────────────
function BookingSummaryScreen({ app, onBack, onModify }) {
  const [payOpen,         setPayOpen]         = React.useState(false);
  const [paid,            setPaid]            = React.useState(false);
  const [cancelOpen,      setCancelOpen]      = React.useState(false);
  const [cancelled,       setCancelled]       = React.useState(false);
  const [couponApplied,   setCouponApplied]   = React.useState(false);
  const cancelDateStr = bsCancelDate(app.dateStart);

  const isPending  = app.status === 'pending';
  const isAccepted = app.status === 'accepted';
  const canBook    = isAccepted && !paid && !cancelled;

  const nights    = app.nights    || 1;
  const unitPrice = app.price     || 88;
  const svcTotal  = unitPrice * nights;
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
  const total       = svcTotal + extrasTotal - discount;

  const handleConfirmCancel = () => {
    setCancelled(true);
    setCancelOpen(false);
  };

  return (
    <div style={{ display:'flex',flexDirection:'column',flex:1,overflow:'hidden',position:'relative',background:LL.bg }}>

      {/* ── Top Nav ── */}
      <div style={{ flex:'0 0 auto',height:52,background:'#fff',borderBottom:`1px solid ${LL.border}`,display:'flex',alignItems:'center',padding:'0 16px' }}>
        <button onClick={onBack} style={{ display:'flex',alignItems:'center',gap:3,background:'transparent',border:0,cursor:'pointer',fontFamily:LL.font,padding:0,color:LL.text2,fontSize:13.5 }}>
          <i className="ph ph-caret-left" style={{ fontSize:16,color:LL.text2 }}/>
          返回
        </button>
        <div style={{ flex:1,textAlign:'center',fontSize:15,fontWeight:700,color:LL.text }}>预约摘要</div>
        <div style={{ width:48 }}/>
      </div>

      {/* ── Cancelled banner ── */}
      {cancelled && (
        <div style={{ flex:'0 0 auto',background:'#FFF0F0',borderBottom:'1px solid #FCA5A5',padding:'10px 16px',display:'flex',alignItems:'center',gap:10 }}>
          <i className="ph ph-x-circle" style={{ fontSize:16,color:'#CC2200',flex:'0 0 auto' }}/>
          <span style={{ fontSize:13,color:'#CC2200',fontWeight:600 }}>订单已取消，退款将在 3–5 个工作日内处理</span>
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
          <div style={{ padding:'20px 20px 18px' }}>
            <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:18 }}>
              <div style={{ width:46,height:46,borderRadius:12,background:'rgba(255,255,255,0.12)',display:'flex',alignItems:'center',justifyContent:'center',flex:'0 0 auto' }}>
                <i className={`ph ph-${svcIcon}`} style={{ fontSize:24,color:'#fff' }}/>
              </div>
              <div>
                <div style={{ fontSize:18,fontWeight:800,color:'#fff' }}>{app.service}</div>
                <div style={{ fontSize:12.5,color:'rgba(255,255,255,0.55)',marginTop:2 }}>{app.guardian?.name} · 守护者</div>
              </div>
            </div>
            {[
              { icon:'map-pin',        text:app.area },
              { icon:'calendar-blank', text:[app.dateStart, app.dateEnd && app.dateEnd !== app.dateStart ? `→ ${app.dateEnd}` : null, nights > 0 ? `· 共${nights}${svcUnit}` : null].filter(Boolean).join(' ') },
              app.dropoff ? { icon:'arrow-circle-right', text:`送达 ${app.dropoff}` } : null,
              app.pickup  ? { icon:'arrow-circle-left',  text:`接回 ${app.pickup}` }  : null,
              { icon:'paw-print', text:petName },
            ].filter(Boolean).map((row,i,arr) => (
              <div key={i} style={{ display:'flex',alignItems:'center',gap:10,marginBottom:i<arr.length-1?10:0 }}>
                <i className={`ph ph-${row.icon}`} style={{ fontSize:15,color:'rgba(255,255,255,0.45)',flex:'0 0 auto' }}/>
                <span style={{ fontSize:13.5,color:'rgba(255,255,255,0.85)' }}>{row.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Fee breakdown ── */}
        <div style={{ margin:'0 16px',background:'#F5F5F9',borderRadius:'0 0 16px 16px',padding:'16px 20px 18px' }}>
          {/* Main service */}
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:14 }}>
            <div>
              <div style={{ fontSize:14,fontWeight:600,color:LL.text }}>{petName}</div>
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

        {/* ── Safety note ── */}
        <div style={{ margin:'10px 16px 0',padding:'10px 14px',background:'#FFFBEB',borderRadius:8 }}>
          <span style={{ fontSize:12,color:'#92400E',lineHeight:1.55 }}>请通过平台完成预约和付款，切勿私下现金交易。</span>
        </div>

        {/* ── 取消订单 ── */}
        {!cancelled && !paid && (
          <div style={{ margin:'8px 16px 0',display:'flex',justifyContent:'flex-end' }}>
            <button onClick={() => setCancelOpen(true)} style={{
              background:'transparent',border:`1px solid ${LL.border}`,
              height:32,padding:'0 14px',borderRadius:999,
              fontSize:12,fontWeight:500,color:LL.text3,
              cursor:'pointer',fontFamily:LL.font,
            }}>取消订单</button>
          </div>
        )}

        <div style={{ height:24 }}/>
      </div>

      {/* ── Bottom Buttons ── */}
      <div style={{ flex:'0 0 auto',background:'#fff',borderTop:`1px solid ${LL.border}`,padding:'12px 16px 12px',display:'flex',gap:12,flexDirection:'column' }}>
        {!cancelled && (
          <div style={{ display:'flex',gap:12 }}>
            <button onClick={onModify} style={{ flex:1,height:50,borderRadius:999,background:'transparent',border:`1.5px solid ${LL.border}`,color:LL.text,fontSize:15,fontWeight:600,fontFamily:LL.font,cursor:'pointer' }}>修改请求</button>
            <button disabled={!canBook} onClick={() => canBook && setPayOpen(true)} style={{ flex:1,height:50,borderRadius:999,border:0,background:canBook?LL.ink:'rgba(34,40,44,0.22)',color:'#fff',fontSize:15,fontWeight:700,fontFamily:LL.font,cursor:canBook?'pointer':'not-allowed',transition:'background 200ms' }}>
              {paid ? '已预订 ✓' : '立即预订'}
            </button>
          </div>
        )}
        <button onClick={() => setCancelOpen(true)} style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:5,background:'transparent',border:0,cursor:'pointer',padding:0,fontFamily:LL.font }}>
          <i className="ph ph-calendar-blank" style={{ fontSize:12,color:LL.text3 }}/>
          <span style={{ fontSize:11.5,color:LL.text3,textDecoration:'underline' }}>{cancelDateStr} 12:00前可免费取消</span>
        </button>
      </div>

      {/* ── WeChat Pay Drawer ── */}
      {payOpen && (
        <>
          <div onClick={() => setPayOpen(false)} style={{ position:'absolute',inset:0,background:'rgba(0,0,0,0.45)',zIndex:85 }}/>
          <div style={{ position:'absolute',left:0,right:0,bottom:0,zIndex:86,background:'#fff',borderTopLeftRadius:20,borderTopRightRadius:20,padding:'0 0 32px',boxShadow:'0 -8px 28px rgba(0,0,0,0.15)',fontFamily:LL.font }}>
            <div style={{ width:38,height:4,borderRadius:2,background:LL.border,margin:'12px auto 14px' }}/>
            <div style={{ textAlign:'center',fontSize:15,fontWeight:700,color:LL.text,marginBottom:8 }}>确认支付</div>
            <div style={{ textAlign:'center',marginBottom:22 }}>
              <span style={{ fontSize:36,fontWeight:800,color:LL.text,letterSpacing:'-0.02em' }}>¥{total}</span>
            </div>
            <div style={{ margin:'0 16px 20px',padding:'14px 16px',background:'#F5F5F9',borderRadius:12,display:'flex',alignItems:'center',gap:14 }}>
              <div style={{ width:42,height:42,borderRadius:10,background:'#07C160',display:'flex',alignItems:'center',justifyContent:'center',flex:'0 0 auto' }}>
                <i className="ph-fill ph-chat-circle-dots" style={{ fontSize:22,color:'#fff' }}/>
              </div>
              <span style={{ flex:1,fontSize:15,fontWeight:600,color:LL.text }}>微信支付</span>
              <div style={{ width:22,height:22,borderRadius:'50%',background:LL.ink,display:'flex',alignItems:'center',justifyContent:'center' }}>
                <i className="ph-bold ph-check" style={{ fontSize:11,color:'#fff' }}/>
              </div>
            </div>
            <div style={{ padding:'0 16px 8px' }}>
              <button onClick={() => { setPaid(true); setPayOpen(false); }} style={{ width:'100%',height:52,borderRadius:999,border:0,background:'#07C160',color:'#fff',fontSize:15,fontWeight:700,fontFamily:LL.font,cursor:'pointer',letterSpacing:'0.04em' }}>确认支付 ¥{total}</button>
              <button onClick={() => { setPayOpen(false); setCancelOpen(true); }} style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:5,width:'100%',marginTop:10,background:'transparent',border:0,cursor:'pointer',padding:0,fontFamily:LL.font }}>
                <i className="ph ph-calendar-blank" style={{ fontSize:12,color:LL.text3 }}/>
                <span style={{ fontSize:11.5,color:LL.text3,textDecoration:'underline' }}>{cancelDateStr} 12:00前可免费取消</span>
              </button>
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
    </div>
  );
}

Object.assign(window, { BookingSummaryScreen });
