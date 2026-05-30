// Lou Lou — BookingRequestScreen.jsx
// 申请单管理页 (草稿 / 已发送 / 历史) + ChatView

const APP_GREEN = '#2C7A4B';
const APP_GREEN_BG = '#E6F1EC';

// ─── helpers ─────────────────────────────────────────────────
function fmtNow() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ─── Status badge ─────────────────────────────────────────────
const STATUS_META = {
  pending: { label: '待回复', bg: '#FFF3CD', color: '#92400E' },
  accepted: { label: '已接受', bg: APP_GREEN_BG, color: APP_GREEN },
  rejected: { label: '已拒绝', bg: '#FFF0F0', color: '#CC2200' }
};

function StatusBadge({ status }) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 999,
      background: m.bg, color: m.color, flex: '0 0 auto'
    }}>{m.label}</span>);

}

// ─── Message bubble ───────────────────────────────────────────
function MsgBubble({ msg, photoSrc }) {
  if (msg.from === 'system') {
    return (
      <div style={{ textAlign: 'center', fontSize: 12, color: LL.text3, margin: '4px 0 14px', padding: '0 24px' }}>
        {msg.text}
      </div>);

  }
  const isUser = msg.from === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 14, alignItems: 'flex-end', gap: 8 }}>
      {!isUser &&
      <div style={{ width: 34, height: 34, borderRadius: '50%', overflow: 'hidden', flex: '0 0 auto', background: LL.lavender }}>
          <img src={photoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
        </div>
      }
      <div style={{
        maxWidth: '72%', padding: '10px 14px', fontSize: 13.5, lineHeight: 1.58,
        borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
        background: isUser ? LL.ink : '#fff',
        color: isUser ? '#fff' : LL.text,
        boxShadow: isUser ? 'none' : '0 1px 4px rgba(0,0,0,0.06)'
      }}>{msg.text}</div>
      {isUser && <div style={{ fontSize: 10, color: LL.text3, alignSelf: 'flex-end', marginBottom: 2 }}>{msg.time}</div>}
    </div>);

}

// ─── Chat View (rendered at App level, full-screen) ───────────
function ChatView({ app, onBack, onSendMessage, onOpenSummary }) {
  const [input, setInput] = React.useState('');
  const msgsRef = React.useRef(null);

  const photoSrc = window.__resources && window.__resources.guardian2 || app.guardian.photo;

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (msgsRef.current) {
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
    }
  }, [app.messages.length]);

  const handleSend = () => {
    const t = input.trim();
    if (!t) return;
    onSendMessage(t);
    setInput('');
  };

  const sm = STATUS_META[app.status] || STATUS_META.pending;

  return (
    <>
      {/* Top nav */}
      <div style={{
        flex: '0 0 auto', height: 52, display: 'flex', alignItems: 'center',
        padding: '0 14px', gap: 12,
        background: LL.surface, borderBottom: `1px solid ${LL.border}`
      }}>
        <button onClick={onBack} style={{
          width: 34, height: 34, borderRadius: '50%', border: 0,
          background: LL.ink, color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto'
        }}>
          <i className="ph ph-caret-left" style={{ fontSize: 17 }} />
        </button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', background: LL.lavender }}>
            <img src={photoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: LL.text, lineHeight: 1.2 }}>{app.guardian.name}</div>
            <div style={{ fontSize: 11, color: LL.text3 }}>守护者</div>
          </div>
        </div>
        <i className="ph ph-dots-three" style={{ fontSize: 22, color: LL.text2 }} />
      </div>

      {/* Application card (sticky under nav) */}
      <div style={{ flex: '0 0 auto', padding: '10px 14px', background: LL.surface, borderBottom: `1px solid ${LL.border}` }}>
        <div style={{
          background: LL.bg, borderRadius: 12, padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 12
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, background: LL.butter, flex: '0 0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <i className="ph ph-clipboard-text" style={{ fontSize: 20, color: LL.text }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: LL.text }}>
              {app.service} · {app.dateStart}
              {app.dateEnd && app.dateEnd !== app.dateStart ? ` – ${app.dateEnd}` : ''}
            </div>
            <div style={{ fontSize: 11.5, color: LL.text3, marginTop: 2 }}>
              {app.pet} · {app.area}
            </div>
          </div>
          <StatusBadge status={app.status} />
        </div>
        {/* 详情 capsule button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <button onClick={() => onOpenSummary?.(app)} style={{
            height: 28, padding: '0 22px', borderRadius: 999,
            border: `1px solid ${LL.border}`, background: '#fff',
            fontSize: 13, fontWeight: 600, color: LL.text2,
            cursor: 'pointer', fontFamily: LL.font
          }}>详情</button>
        </div>
      </div>

      {/* Messages area */}
      <div ref={msgsRef} style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', background: LL.bg }}>
        {app.messages.map((msg, i) =>
        <MsgBubble key={i} msg={msg} photoSrc={photoSrc} />
        )}
      </div>

      {/* Input bar */}
      <div style={{
        flex: '0 0 auto', background: LL.surface, borderTop: `1px solid ${LL.border}`,
        padding: '10px 14px', paddingBottom: 28,
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="发送消息…"
          style={{
            flex: 1, height: 40, padding: '0 14px', borderRadius: 999,
            border: `1px solid ${LL.border}`, background: LL.bg,
            fontSize: 14, fontFamily: LL.font, color: LL.text, outline: 'none'
          }} data-comment-anchor="c6c77d9462-input-156-9" />
        
        <button onClick={handleSend} style={{
          width: 40, height: 40, borderRadius: '50%', border: 0,
          background: input.trim() ? LL.ink : LL.border, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: input.trim() ? 'pointer' : 'default', transition: 'background 140ms'
        }}>
          <i className="ph ph-paper-plane-tilt" style={{ fontSize: 18 }} />
        </button>
      </div>
    </>);

}

// ─── Config section (editable service / pet / dates / area) ───
const SVC_OPTIONS = ['寄养', '日托', '遛狗', '上门服务', '住家守护'];

function ConfigSection({ config, onChange }) {
  const [svcOpen, setSvcOpen] = React.useState(false);

  const fields = [
  { key: 'pet', label: '宠物' },
  { key: 'dateStart', label: '开始日期' },
  { key: 'dateEnd', label: '结束日期' },
  { key: 'area', label: '地点' }];


  return (
    <div style={{ background: LL.surface, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px 10px', display: 'flex', alignItems: 'center', gap: 8,
        borderBottom: `1px solid ${LL.border}`
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: LL.text, flex: 1 }}>服务信息</div>
        <span style={{ background: LL.butter, color: LL.text, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999 }}>草稿</span>
      </div>

      {/* Service type (chip selector) */}
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${LL.border}` }}>
        <div style={{ fontSize: 12, color: LL.text3, marginBottom: 7, fontWeight: 500 }}>服务类型</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SVC_OPTIONS.map((opt) => {
            const on = config.service === opt;
            return (
              <button key={opt} onClick={() => onChange('service', opt)} style={{
                height: 30, padding: '0 13px', borderRadius: 999, border: 0,
                background: on ? LL.ink : '#F5F5FA',
                color: on ? '#fff' : LL.text2,
                fontSize: 12.5, fontWeight: on ? 700 : 500, fontFamily: LL.font,
                cursor: 'pointer', transition: 'background 140ms'
              }}>{opt}</button>);

          })}
        </div>
      </div>

      {/* Other fields — inline inputs */}
      {fields.map((f, i) =>
      <div key={f.key} style={{
        display: 'flex', alignItems: 'center', padding: '0 14px',
        borderBottom: i < fields.length - 1 ? `1px solid ${LL.border}` : 0
      }}>
          <div style={{ fontSize: 12.5, color: LL.text3, minWidth: 62, fontWeight: 500 }}>{f.label}</div>
          <input
          value={config[f.key] || ''}
          onChange={(e) => onChange(f.key, e.target.value)}
          style={{
            flex: 1, height: 44, border: 0, outline: 'none',
            fontSize: 13.5, fontWeight: 600, color: LL.text, fontFamily: LL.font,
            background: 'transparent', textAlign: 'right', paddingRight: 4
          }} />
        
        </div>
      )}
    </div>);

}

// ─── Guardian checklist row ────────────────────────────────────
function GuardianDraftRow({ g, checked, onToggle, onRemove, service }) {
  const photoSrc = window.__resources && window.__resources.guardian2 || g.photo;
  const svcData = (g.services || []).find((s) => s.id === service);
  return (
    <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      {/* Checkbox */}
      <button onClick={onToggle} style={{
        width: 24, height: 24, borderRadius: '50%', border: 0, flex: '0 0 auto',
        background: checked ? LL.ink : 'transparent',
        boxShadow: checked ? 'none' : `inset 0 0 0 1.5px ${LL.text3}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'background 140ms'
      }}>
        {checked && <i className="ph-fill ph-check" style={{ fontSize: 13, color: '#fff' }} />}
      </button>
      {/* Photo */}
      <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flex: '0 0 auto', background: LL.lavender }}>
        <img src={photoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
      </div>
      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: LL.text }}>{g.name}</div>
          <i className="ph-fill ph-star" style={{ fontSize: 11, color: '#F0B100' }} />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: LL.text }}>{g.rating}</span>
        </div>
        <div style={{ fontSize: 12, color: LL.text3 }}>
          {service}
          {svcData ? ` · ¥${svcData.price}/${svcData.unit}` : ''}
        </div>
      </div>
      {/* Remove */}
      <button onClick={onRemove} style={{
        width: 28, height: 28, borderRadius: '50%', border: 0, background: '#F5F5FA',
        color: LL.text3, cursor: 'pointer', flex: '0 0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <i className="ph ph-x" style={{ fontSize: 13 }} />
      </button>
    </div>);

}

function SentAppCard({ app, onOpenChat, onOpenSummary }) {
  const g = app.guardian;
  const photoSrc = g.photo ||
  window.__resources && window.__resources.guardian2 ||
  './assets/guardian2.png';
  return (
    <div onClick={() => onOpenSummary?.(app)} style={{ background: LL.surface, borderRadius: 14, padding: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', overflow: 'hidden', flex: '0 0 auto', background: LL.lavender }}>
          <img src={photoSrc} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: LL.text }}>{g.name}</div>
            <StatusBadge status={app.status} />
          </div>
          <div style={{ fontSize: 12, color: LL.text3 }}>
            {app.service} · {app.dateStart}
            {app.dateEnd && app.dateEnd !== app.dateStart ? ` – ${app.dateEnd}` : ''}
          </div>
          <div style={{ fontSize: 12, color: LL.text3, marginTop: 1 }}>
            {app.pet} · {app.area}
          </div>
        </div>
      </div>

      {app.status === 'accepted' &&
      <button onClick={() => onOpenChat(app.id)} style={{
        marginTop: 12, width: '100%', height: 38, borderRadius: 999,
        border: `1px solid ${LL.border}`, background: 'transparent',
        fontSize: 13, fontWeight: 600, color: LL.text, cursor: 'pointer',
        fontFamily: LL.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
      }}>
          <i className="ph ph-chat-circle-dots" style={{ fontSize: 15 }} />
          查看对话
        </button>
      }
      {app.status === 'rejected' &&
      <div style={{
        marginTop: 10, paddingTop: 10, borderTop: `1px solid ${LL.border}`,
        fontSize: 12.5, color: LL.text3
      }}>守护者暂时无法接受此申请，可继续搜索其他守护者</div>
      }
      {app.status === 'pending' &&
      <div style={{
        marginTop: 10, paddingTop: 10, borderTop: `1px solid ${LL.border}`,
        fontSize: 12.5, color: LL.text3,
        display: 'flex', alignItems: 'center', gap: 6
      }}>
          <span style={{
          display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
          background: '#F0B100', animation: 'ping 1.2s ease infinite'
        }} />
          等待守护者回复中…
          <style>{`@keyframes ping { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
        </div>
      }
    </div>);

}

// ─── Main screen ─────────────────────────────────────────────
function BookingRequestScreen({
  draftGuardians = [],
  draftConfig = {},
  onUpdateConfig,
  onRemoveGuardian,
  sentApps = [],
  onSend,
  onOpenChat,
  onOpenSummary,
  onBrowseMore
}) {
  const [checkedIds, setCheckedIds] = React.useState(new Set());

  React.useEffect(() => {
    setCheckedIds(new Set(draftGuardians.map((g) => g.id)));
  }, [draftGuardians.map((g) => g.id).join(',')]);

  const toggleCheck = (id) =>
  setCheckedIds((prev) => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const handleSend = () => {
    const ids = [...checkedIds];
    if (!ids.length) return;
    onSend?.(ids);
  };

  const hasDraft = draftGuardians.length > 0;
  const hasSent = sentApps.length > 0;
  const checkedN = [...checkedIds].filter((id) => draftGuardians.some((g) => g.id === id)).length;

  return (
    <div style={{ background: LL.bg, minHeight: '100%', paddingBottom: 24 }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px', background: LL.surface }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: LL.text, letterSpacing: '-0.01em' }}>申请单</div>
        <div style={{ fontSize: 13, color: LL.text3, marginTop: 3 }}>
          {hasDraft ?
          `草稿 · 已选 ${draftGuardians.length} 位守护者` :
          hasSent ? `${sentApps.length} 条申请` :
          '在守护者主页点击「加入申请单」开始'}
        </div>
      </div>

      {/* Draft: config + guardian checklist */}
      {hasDraft &&
      <div style={{ padding: '12px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ConfigSection config={draftConfig} onChange={onUpdateConfig} />

          <div style={{ background: LL.surface, borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ padding: '12px 14px 10px', display: 'flex', alignItems: 'center', borderBottom: `1px solid ${LL.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: LL.text, flex: 1 }}>
                已选守护者
                <span style={{ fontSize: 13, fontWeight: 500, color: LL.text3, marginLeft: 5 }}>
                  ({draftGuardians.length} 位)
                </span>
              </div>
            </div>
            {draftGuardians.map((g, i) =>
          <div key={g.id} style={{ borderBottom: i < draftGuardians.length - 1 ? `1px solid ${LL.border}` : 0 }}>
                <GuardianDraftRow
              g={g}
              checked={checkedIds.has(g.id)}
              onToggle={() => toggleCheck(g.id)}
              onRemove={() => onRemoveGuardian?.(g.id)}
              service={draftConfig.service} />
            
              </div>
          )}
            {/* Add more */}
            <button onClick={onBrowseMore} style={{
            width: '100%', padding: '12px 14px', background: 'transparent', border: 0,
            borderTop: `1px dashed ${LL.border}`,
            display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontFamily: LL.font
          }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#F5F5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
                <i className="ph ph-plus" style={{ fontSize: 20, color: LL.text3 }} />
              </div>
              <div style={{ fontSize: 13.5, color: LL.text2 }}>继续添加守护者</div>
            </button>
          </div>

          {/* Send button */}
          <button onClick={handleSend} disabled={checkedN === 0} style={{
          width: '100%', height: 50, borderRadius: 999, border: 0,
          background: checkedN > 0 ? LL.ink : 'rgba(34,40,44,0.25)',
          color: '#fff', fontSize: 15, fontWeight: 700,
          fontFamily: LL.font, cursor: checkedN > 0 ? 'pointer' : 'not-allowed',
          transition: 'background 160ms'
        }}>
            发送申请单{checkedN > 0 ? `  给 ${checkedN} 位守护者` : ''}
          </button>
        </div>
      }

      {/* Sent applications — grouped by batchId */}
      {hasSent &&
      <div style={{ padding: '16px 16px 0' }}>
          {(() => {
          // Group by batchId
          const batchMap = {};
          sentApps.forEach((app) => {
            const key = app.batchId || app.id;
            if (!batchMap[key]) batchMap[key] = { time: app.batchTime || null, apps: [] };
            batchMap[key].apps.push(app);
          });
          const batches = Object.values(batchMap).reverse(); // newest first

          const fmtBatchTime = (t) => {
            if (!t) return '已发送';
            const d = new Date(t);
            const now = new Date();
            const diffMs = now - d;
            const diffMin = Math.floor(diffMs / 60000);
            if (diffMin < 1) return '刚刚发送';
            if (diffMin < 60) return `${diffMin}分钟前发送`;
            const diffH = Math.floor(diffMin / 60);
            if (diffH < 24) return `${diffH}小时前发送`;
            return `${d.getMonth() + 1}月${d.getDate()}日发送`;
          };

          return batches.map((batch, bi) =>
          <div key={bi} style={{ marginBottom: 20 }}>
                {/* Batch time header */}
                <div style={{
              fontSize: 11.5, color: LL.text3, fontWeight: 500,
              marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8
            }}>
                  <div style={{ flex: 1, height: 1, background: LL.border }} />
                  <span>{fmtBatchTime(batch.time)}</span>
                  <div style={{ flex: 1, height: 1, background: LL.border }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {batch.apps.map((app) =>
              <SentAppCard key={app.id} app={app} onOpenChat={onOpenChat} onOpenSummary={onOpenSummary} />
              )}
                </div>
              </div>
          );
        })()}
        </div>
      }

      {/* Historical orders */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: LL.text, marginBottom: 10 }}>历史订单</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
          { id: 'h1', name: '林若', svc: '寄养', dates: '4月18日 – 4月20日', pet: '金毛·豆豆', price: 176, bg: LL.butter },
          { id: 'h2', name: '张敏', svc: '遛狗', dates: '4月10日', pet: '金毛·豆豆', price: 38, bg: LL.lavender }].
          map((h) =>
          <div key={h.id} style={{
            background: LL.surface, borderRadius: 14, padding: 14,
            display: 'flex', alignItems: 'center', gap: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: h.bg, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: LL.text }}>
                {h.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: LL.text }}>{h.name} · {h.svc}</div>
                <div style={{ fontSize: 12, color: LL.text3, marginTop: 2 }}>{h.dates} · {h.pet}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: LL.text }}>¥{h.price}</div>
                <div style={{ fontSize: 11, color: LL.text3, marginTop: 2 }}>已完成</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Empty state */}
      {!hasDraft && !hasSent &&
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 24px', gap: 14 }}>
          <i className="ph ph-clipboard-text" style={{ fontSize: 48, color: LL.text3 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: LL.text }}>暂无申请单</div>
          <div style={{ fontSize: 13, color: LL.text3, textAlign: 'center', lineHeight: 1.6 }}>
            浏览守护者主页后，点击「加入申请单」即可开始
          </div>
          <button onClick={onBrowseMore} style={{
          marginTop: 8, height: 44, padding: '0 28px', borderRadius: 999, border: 0,
          background: LL.ink, color: '#fff', fontSize: 14, fontWeight: 600,
          fontFamily: LL.font, cursor: 'pointer'
        }}>开始搜索守护者</button>
        </div>
      }
    </div>);

}

Object.assign(window, { BookingRequestScreen, ChatView });