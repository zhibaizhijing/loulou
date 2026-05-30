// Lou Lou — 守护时刻 (Guardian moments) — daily activity dashboard

function ActivityScreen({ onLog, onHistory }) {
  return (
    <div style={{ paddingBottom: 24 }}>
      <div style={{ padding: '12px 16px 0', display: 'flex', alignItems: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: LL.text, letterSpacing: '-0.01em' }}>守护时刻</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <IconBtn name="calendar-blank" />
        </div>
      </div>

      <div style={{ padding: '12px 16px 0', fontSize: 14, color: LL.text2 }}>
        今日陪伴
      </div>

      <div style={{ padding: '10px 16px 0', display: 'flex', gap: 12 }}>
        <StatTile label="陪伴时长" value="45" unit=" 分钟" bg={LL.butter} />
        <StatTile label="互动里程" value="2.5" unit=" 公里" bg={LL.lavender} />
      </div>

      <div style={{
        margin: '18px 16px 0', background: '#fff', borderRadius: 20,
        padding: '20px 16px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: LL.text }}>守护进度</div>
        <div style={{ marginTop: 12 }}>
          <ProgressRing percent={75} target="60 分钟" />
        </div>
      </div>

      <div style={{ padding: '18px 16px 0' }}>
        <CTAButton onClick={onLog}>记录守护时刻</CTAButton>
      </div>

      <div style={{ textAlign: 'center', padding: '14px 0' }}>
        <button onClick={onHistory} style={{
          background: 'transparent', border: 0, padding: '6px 14px',
          fontSize: 13, fontWeight: 500, color: LL.text, cursor: 'pointer',
          borderBottom: `1px solid ${LL.border}`, fontFamily: LL.font,
        }}>查看历史</button>
      </div>
    </div>
  );
}

window.ActivityScreen = ActivityScreen;
