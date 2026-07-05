// Lou Lou — ReviewGuardianScreen.jsx
// 评价守护者 — opened from a completed order card's 写评论 button.
// 简洁明了：星级 + 印象标签 + 文字 + 照片 + 匿名 + 提交。

const REVIEW_STAR_LABELS = ['', '很差', '一般', '满意', '很好', '非常满意'];
const REVIEW_TAGS = ['准时可靠', '有耐心', '爱干净', '很专业', '拍照及时', '沟通顺畅', '宠物喜欢', '细心负责'];

function ReviewGuardianScreen({ app, onClose, onSubmit }) {
  const g = app?.guardian || {};
  const [stars, setStars]   = React.useState(5);
  const [tags,  setTags]    = React.useState(new Set());
  const [text,  setText]    = React.useState('');
  const [anon,  setAnon]    = React.useState(false);

  const photoSrc = (typeof resolveGuardianPhoto === 'function' ? resolveGuardianPhoto(g) : null)
    || (window.__resources && window.__resources.guardian2) || g.photo || null;
  const dateLabel = app?.dateEnd && app.dateEnd !== app.dateStart
    ? `${app.dateStart} – ${app.dateEnd}` : app?.dateStart;

  const toggleTag = (t) =>
    setTags(prev => { const n = new Set(prev); n.has(t) ? n.delete(t) : n.add(t); return n; });

  const canSubmit = stars > 0;
  const submit = () => {
    if (!canSubmit) return;
    onSubmit?.(app, { stars, tags: [...tags], text: text.trim(), anonymous: anon });
  };

  return (
    <div style={{
      position:'absolute', inset:0, paddingTop:47, zIndex:80,
      display:'flex', flexDirection:'column', background:LL.bg, fontFamily:LL.font,
    }}>
      {/* Top nav */}
      <div style={{
        flex:'0 0 auto', height:52, display:'flex', alignItems:'center',
        padding:'0 14px', gap:12, background:'#fff', borderBottom:`1px solid ${LL.border}`,
      }}>
        <button onClick={onClose} style={{
          width:34, height:34, borderRadius:'50%', border:0, background:'#F0F0F5',
          color:LL.text, cursor:'pointer', flex:'0 0 auto',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <i className="ph ph-caret-left" style={{ fontSize:17 }}/>
        </button>
        <div style={{ flex:1, textAlign:'center', fontSize:16, fontWeight:700, color:LL.text }}>评价守护者</div>
        <div style={{ width:34, flex:'0 0 auto' }}/>
      </div>

      {/* Body */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 16px 24px' }}>
        {/* Guardian + rating card */}
        <div style={{ background:'#fff', borderRadius:16, padding:'20px 16px 22px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
            <div style={{ width:64, height:64, borderRadius:'50%', overflow:'hidden',
              background:g.bg || LL.lavender, flex:'0 0 auto',
              display:'flex', alignItems:'center', justifyContent:'center' }}>
              {photoSrc
                ? <img src={photoSrc} alt={g.name} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center' }}/>
                : <span style={{ fontSize:24, fontWeight:700, color:LL.text }}>{g.name?.[0] || '守'}</span>}
            </div>
            <div style={{ fontSize:16, fontWeight:700, color:LL.text }}>{g.name || '守护者'}</div>
            <div style={{ fontSize:12, color:LL.text3 }}>{app?.service} · {dateLabel} · {(app?.pet || '').split('·').pop()}</div>
          </div>

          {/* Stars */}
          <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:18 }}>
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setStars(n)} style={{ background:'transparent', border:0, cursor:'pointer', padding:0 }}>
                <i className={`${n <= stars ? 'ph-fill' : 'ph'} ph-star`} style={{ fontSize:34, color: n <= stars ? '#F5B301' : LL.border, transition:'color 120ms' }}/>
              </button>
            ))}
          </div>
          <div style={{ textAlign:'center', marginTop:10, fontSize:13.5, fontWeight:700, color: stars >= 4 ? '#2C7A4B' : LL.text2 }}>
            {REVIEW_STAR_LABELS[stars]}
          </div>
        </div>

        {/* Impression tags */}
        <div style={{ marginTop:14, background:'#fff', borderRadius:16, padding:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize:14, fontWeight:700, color:LL.text, marginBottom:3 }}>她哪里做得好？</div>
          <div style={{ fontSize:11.5, color:LL.text3, marginBottom:12 }}>选择标签（可多选）</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {REVIEW_TAGS.map(t => {
              const on = tags.has(t);
              return (
                <button key={t} onClick={() => toggleTag(t)} style={{
                  height:34, padding:'0 14px', borderRadius:999,
                  border: on ? 0 : `1px solid ${LL.border}`,
                  background: on ? LL.ink : '#fff',
                  color: on ? '#fff' : LL.text2,
                  fontSize:12.5, fontWeight: on ? 700 : 500, fontFamily:LL.font,
                  cursor:'pointer', transition:'all 140ms',
                  display:'flex', alignItems:'center', gap:4,
                }}>
                  {on && <i className="ph-fill ph-check" style={{ fontSize:12 }}/>}
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment + photos */}
        <div style={{ marginTop:14, background:'#fff', borderRadius:16, padding:'16px', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="分享本次服务的体验，帮助更多宠主了解这位守护者…"
            maxLength={500}
            style={{
              width:'100%', minHeight:96, resize:'none', border:0, outline:'none',
              fontSize:14, lineHeight:1.6, color:LL.text, fontFamily:LL.font,
              background:'transparent',
            }}
          />
          <div style={{ display:'flex', alignItems:'center', gap:10, marginTop:10 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width:64, height:64, borderRadius:12, flex:'0 0 auto',
                border:`1.5px dashed ${LL.border}`, background:LL.bg,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3,
                cursor:'pointer', color:LL.text3,
              }}>
                <i className="ph ph-camera" style={{ fontSize:19 }}/>
                <span style={{ fontSize:9.5 }}>添加照片</span>
              </div>
            ))}
            <div style={{ flex:1, textAlign:'right', fontSize:11, color:LL.text3 }}>{text.length}/500</div>
          </div>
        </div>

        {/* Anonymous toggle */}
        <button onClick={() => setAnon(a => !a)} style={{
          width:'100%', marginTop:14, background:'#fff', borderRadius:16, border:0,
          padding:'14px 16px', display:'flex', alignItems:'center', gap:10,
          boxShadow:'0 2px 8px rgba(0,0,0,0.04)', cursor:'pointer', fontFamily:LL.font, textAlign:'left',
        }}>
          <i className="ph ph-mask-happy" style={{ fontSize:18, color:LL.text2, flex:'0 0 auto' }}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13.5, fontWeight:600, color:LL.text }}>匿名评价</div>
            <div style={{ fontSize:11, color:LL.text3, marginTop:1 }}>守护者将看不到您的昵称与头像</div>
          </div>
          <div style={{
            width:44, height:26, borderRadius:999, flex:'0 0 auto', position:'relative',
            background: anon ? '#2C7A4B' : LL.border, transition:'background 160ms',
          }}>
            <div style={{
              position:'absolute', top:3, left: anon ? 21 : 3, width:20, height:20, borderRadius:'50%',
              background:'#fff', transition:'left 160ms', boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
            }}/>
          </div>
        </button>

        <div style={{ marginTop:14, textAlign:'center', fontSize:11.5, color:LL.text3, lineHeight:1.6 }}>
          真实的评价能帮助更多宠主找到放心的守护者
        </div>
      </div>

      {/* Bottom submit */}
      <div style={{ flex:'0 0 auto', background:'#fff', borderTop:`1px solid ${LL.border}`, padding:'12px 16px 22px' }}>
        <button onClick={submit} disabled={!canSubmit} style={{
          width:'100%', height:52, borderRadius:999, border:0,
          background: canSubmit ? LL.ink : 'rgba(34,40,44,0.22)', color:'#fff',
          fontSize:15, fontWeight:700, fontFamily:LL.font,
          cursor: canSubmit ? 'pointer' : 'not-allowed', transition:'background 160ms',
        }}>提交评价</button>
      </div>
    </div>
  );
}

window.ReviewGuardianScreen = ReviewGuardianScreen;
