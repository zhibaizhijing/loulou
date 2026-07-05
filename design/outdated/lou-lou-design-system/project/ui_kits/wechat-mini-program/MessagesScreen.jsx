// Lou Lou — MessagesScreen.jsx (updated)
// Thread list — accepted sent-apps appear as live guardian threads
const APP_GREEN = '#2C7A4B';

function MessagesScreen({ sentApps = [], onOpenChat }) {
  // Build guardian threads from accepted applications
  const guardianThreads = sentApps
    .filter(a => a.status === 'accepted')
    .map(a => {
      const lastMsg = a.messages[a.messages.length - 1];
      return {
        id: a.id,
        name: `${a.guardian.name}（守护者）`,
        last: lastMsg ? lastMsg.text : '',
        time: '刚刚',
        unread: a.messages.filter(m => m.from === 'guardian').length,
        photo: a.guardian.photo,
        isLive: true,
        appId: a.id,
      };
    });

  // Static placeholder threads
  const staticThreads = [
    { id: 's1', name: '张敏（守护者）', last: '宝贝已经睡了，今天玩得很开心 🐶', time: '昨天',  unread: 0, initial: '张', bg: LL.butter   },
    { id: 's2', name: '李伟（守护者）', last: '好的，明天上午十点见。',             time: '2天前', unread: 0, initial: '李', bg: LL.lavender },
    { id: 's3', name: 'Loulou 平台',   last: '您的订单已确认，编号 LL-23981',      time: '上周',  unread: 0, initial: '官', bg: LL.ink, white: true },
    { id: 's4', name: '王芳（守护者）', last: '收到，周五下午见～',                time: '上周',  unread: 0, initial: '王', bg: LL.mint    },
  ];

  const threads = [...guardianThreads, ...staticThreads];

  return (
    <div style={{ paddingBottom: 24, background: LL.bg, minHeight: '100%' }}>
      {/* Header — two rows: title row + action row */}
      <div style={{ background:'#fff', boxShadow:'0 1px 0 rgba(0,0,0,0.06)' }}>
        {/* Row 1: title centred */}
        <div style={{ height:52, display:'flex', alignItems:'center', padding:'0 16px' }}>
          <div style={{ width:36, flex:'0 0 auto' }}/>
          <div style={{ flex:1, textAlign:'center', fontSize:17, fontWeight:700, color:LL.text, letterSpacing:'-0.01em' }}>消息</div>
          <div style={{ width:36, flex:'0 0 auto' }}/>
        </div>
        {/* Row 2: action buttons right-aligned */}
        <div style={{ display:'flex', justifyContent:'flex-end', padding:'0 12px 10px', gap:8 }}>
          <button style={{ width:36, height:36, borderRadius:'50%', border:0, background:'rgba(34,40,44,0.06)', color:LL.text, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="ph ph-magnifying-glass" style={{ fontSize:18 }}/>
          </button>
          <button style={{ width:36, height:36, borderRadius:'50%', border:0, background:'rgba(34,40,44,0.06)', color:LL.text, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className="ph ph-headset" style={{ fontSize:18 }}/>
          </button>
        </div>
      </div>

      {/* Thread list */}
      <div style={{ padding: '8px 16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {threads.map(t => {
          const live = t.isLive;
          const photoSrc = live
            ? ((window.__resources && window.__resources.guardian2) || t.photo)
            : null;

          return (
            <div
              key={t.id}
              onClick={() => live && onOpenChat?.(t.appId)}
              style={{
                background: LL.surface, borderRadius: 14, padding: '12px 14px',
                display: 'flex', gap: 12, alignItems: 'center',
                boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                cursor: live ? 'pointer' : 'default',
                position: 'relative',
              }}
            >
              {/* Avatar */}
              {live ? (
                <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flex: '0 0 auto', background: LL.lavender }}>
                  <img src={photoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                </div>
              ) : (
                <div style={{
                  width: 48, height: 48, borderRadius: '50%', flex: '0 0 auto',
                  background: t.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: t.white ? '#fff' : LL.text,
                }}>{t.initial}</div>
              )}

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
                  <div style={{ fontSize: 14, fontWeight: t.unread > 0 ? 700 : 600, color: LL.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: 11, color: LL.text3, flex: '0 0 auto', marginLeft: 8 }}>{t.time}</div>
                </div>
                <div style={{ fontSize: 12.5, color: t.unread > 0 ? LL.text2 : LL.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: t.unread > 0 ? 500 : 400 }}>
                  {t.last}
                </div>
              </div>

              {/* Unread badge */}
              {t.unread > 0 && (
                <div style={{
                  minWidth: 18, height: 18, padding: '0 5px', borderRadius: 9,
                  background: '#E63946', color: '#fff',
                  fontSize: 10.5, fontWeight: 700, flex: '0 0 auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{t.unread}</div>
              )}

              {/* Live indicator dot */}
              {live && (
                <div style={{
                  position: 'absolute', top: 12, left: 52,
                  width: 12, height: 12, borderRadius: '50%',
                  background: APP_GREEN, border: '2px solid #fff',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

window.MessagesScreen = MessagesScreen;
