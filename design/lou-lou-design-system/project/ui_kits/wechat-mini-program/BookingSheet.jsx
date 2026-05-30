// Lou Lou — Booking confirmation bottom sheet

function BookingSheet({ open, onClose, onConfirm }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 80,
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 81,
        background: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: '18px 16px 32px',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.10)',
      }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: LL.border, margin: '0 auto 16px' }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, background: LL.butter,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          }}>🐈</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: LL.text }}>预约守护服务</div>
            <div style={{ fontSize: 12.5, color: LL.text2 }}>寄养 · 遛狗 · 30–45 分钟</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', border: 0,
            background: '#F0F0F5', color: LL.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Iclose size={14} sw={2.4} /></button>
        </div>

        <div style={{ height: 1, background: LL.border, margin: '16px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Row left={<><Icalendar size={16} color={LL.text2}/> <span>预约日期</span></>}
               right="周三 · 5月22日" />
          <Row left={<><Iclock size={16} color={LL.text2}/> <span>服务时段</span></>}
               right="10:30 – 11:15" />
          <Row left={<><Imap size={16} color={LL.text2}/> <span>地点</span></>}
               right="朝阳 · 三里屯" />
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 18, padding: '12px 14px', background: LL.bg, borderRadius: 14,
        }}>
          <div style={{ fontSize: 13, color: LL.text2 }}>合计</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: LL.text, fontVariantNumeric: 'tabular-nums' }}>¥ 268</div>
        </div>

        <div style={{ marginTop: 16 }}>
          <CTAButton onClick={onConfirm}>确认预约</CTAButton>
        </div>
      </div>
    </>
  );
}

function Row({ left, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: LL.text2, fontSize: 13.5 }}>{left}</div>
      <div style={{ marginLeft: 'auto', fontSize: 13.5, fontWeight: 600, color: LL.text }}>{right}</div>
    </div>
  );
}

window.BookingSheet = BookingSheet;
