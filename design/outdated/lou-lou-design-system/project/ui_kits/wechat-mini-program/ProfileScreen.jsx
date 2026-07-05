// Lou Lou — ProfileScreen.jsx
// 我的主页 + 子页面: 成为守护者 · 我的优惠券 · 我的邀请码 · 隐私与设置 · 关于Loulou

const PRF_GREEN = '#2C7A4B';

// ─── Shared sub-page wrapper ─────────────────────────────────
function SubPageWrap({ title, onBack, children }) {
  return (
    <div style={{ background: LL.bg, minHeight: '100%' }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 19, height: 52,
        background: LL.surface, borderBottom: `1px solid ${LL.border}`,
        display: 'flex', alignItems: 'center', padding: '0 14px', gap: 12,
      }}>
        <button onClick={onBack} style={{
          width: 34, height: 34, borderRadius: '50%', border: 0,
          background: LL.ink, color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
        }}>
          <i className="ph ph-caret-left" style={{ fontSize: 17 }} />
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700, color: LL.text }}>{title}</div>
        <div style={{ width: 34 }} />
      </div>
      <div style={{ paddingBottom: 28 }}>{children}</div>
    </div>
  );
}

// ─── Menu row ────────────────────────────────────────────────
function MenuRow({ icon, label, badge, onClick, danger = false, isLast = false, iconBg }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '14px 16px', background: 'transparent', border: 0,
      borderBottom: isLast ? 0 : `1px solid ${LL.border}`,
      display: 'flex', alignItems: 'center', gap: 14,
      cursor: 'pointer', fontFamily: LL.font,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flex: '0 0 auto',
        background: iconBg || '#F5F5FA',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <i className={`ph ph-${icon}`} style={{ fontSize: 18, color: iconBg ? '#fff' : LL.text2 }} />
      </div>
      <div style={{ flex: 1, fontSize: 14.5, fontWeight: 500, color: danger ? '#CC2200' : LL.text, textAlign: 'left' }}>
        {label}
      </div>
      {badge && (
        <div style={{ background: '#E63946', color: '#fff', fontSize: 10.5, fontWeight: 700, padding: '2px 7px', borderRadius: 999, marginRight: 4 }}>
          {badge}
        </div>
      )}
      {!danger && <i className="ph ph-caret-right" style={{ fontSize: 14, color: LL.text3 }} />}
    </button>
  );
}

// ─── About tab ───────────────────────────────────────────────
function AboutTab() {
  return (
    <div style={{ padding: '16px 16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '4px 0 16px' }}>
        <i className="ph ph-calendar-blank" style={{ fontSize: 20, color: LL.text2, flex: '0 0 auto' }} />
        <span style={{ fontSize: 13.5, color: LL.text2 }}>2024年5月加入 Loulou</span>
      </div>
      <div style={{ height: 1, background: LL.border, marginBottom: 16 }} />
      <div style={{ fontSize: 14, fontWeight: 700, color: LL.text, marginBottom: 12 }}>验证</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <i className="ph ph-phone" style={{ fontSize: 20, color: LL.text3, flex: '0 0 auto' }} />
          <span style={{ fontSize: 13.5, color: LL.text3 }}>手机号暂未验证</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <i className="ph ph-envelope-simple" style={{ fontSize: 20, color: LL.text2, flex: '0 0 auto' }} />
          <span style={{ fontSize: 13.5, color: LL.text2 }}>邮箱已验证</span>
          <i className="ph-fill ph-check-circle" style={{ fontSize: 16, color: PRF_GREEN }} />
        </div>
      </div>
    </div>
  );
}

// ─── Feedback tab ────────────────────────────────────────────
function FeedbackTab() {
  return (
    <div style={{ padding: '16px 16px 24px' }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: LL.text, marginBottom: 8 }}>守护者反馈 (0)</div>
      <div style={{ fontSize: 13, color: LL.text2, lineHeight: 1.65, marginBottom: 28 }}>
        查看守护者对您的反馈，您可以回复任何反馈。
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '12px 0' }}>
        <i className="ph ph-chat-circle" style={{ fontSize: 40, color: LL.text3 }} />
        <div style={{ fontSize: 13.5, color: LL.text3 }}>暂无守护者反馈</div>
      </div>
    </div>
  );
}

// ─── Pets tab ────────────────────────────────────────────────
function PetsTab() {
  const pets = [
    { id: 'p1', name: '黄豆', breed: '混血犬', detail: '雌性，4岁10个月，20 kg', bg: LL.butter,   emoji: '🐕' },
    { id: 'p2', name: 'Debbie', breed: '波斯布偶猫', detail: '雌性，3岁，4 kg',  bg: LL.lavender, emoji: '🐱' },
  ];
  return (
    <div style={{ padding: '16px 16px 20px' }}>
      <div style={{ fontSize: 17, fontWeight: 700, color: LL.text, marginBottom: 8 }}>我的宠物 ({pets.length})</div>
      <div style={{ fontSize: 13, color: LL.text2, lineHeight: 1.65, marginBottom: 20 }}>
        帮助守护者了解您的宠物，接受您的申请，提供安全、贴心的照料。
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {pets.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0',
            borderBottom: i < pets.length - 1 ? `1px solid ${LL.border}` : 0, cursor: 'pointer',
          }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: p.bg, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
              {p.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: LL.text, marginBottom: 2 }}>{p.name}</div>
              <div style={{ fontSize: 12.5, color: LL.text2 }}>{p.breed}</div>
              <div style={{ fontSize: 12, color: LL.text3, marginTop: 1 }}>{p.detail}</div>
            </div>
            <i className="ph ph-caret-right" style={{ fontSize: 15, color: LL.text3 }} />
          </div>
        ))}
      </div>
      <button style={{
        marginTop: 16, width: '100%', height: 44, borderRadius: 999,
        border: `1px solid ${LL.border}`, background: 'transparent',
        fontSize: 13.5, fontWeight: 600, color: LL.text2, cursor: 'pointer',
        fontFamily: LL.font, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <i className="ph ph-plus" style={{ fontSize: 15 }} />
        添加宠物
      </button>
    </div>
  );
}

// ─── Main profile page ───────────────────────────────────────
function MyProfileMain({ tab, setTab, onNav }) {
  const TABS = [
    { id: 'about',    label: '关于我'     },
    { id: 'feedback', label: '守护者反馈'  },
    { id: 'pets',     label: '我的宠物'   },
  ];
  return (
    <div style={{ background: LL.bg, minHeight: '100%', paddingBottom: 24 }}>
      {/* Profile card */}
      <div style={{ background: LL.surface, padding: '24px 20px 20px', textAlign: 'center' }}>
        {/* Avatar placeholder (silhouette) */}
        <div style={{
          width: 86, height: 86, borderRadius: '50%', background: '#D4D4DE',
          margin: '0 auto 14px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="17" r="10" fill="#A0A0B8" />
            <path d="M4 48c0-11.046 8.954-20 20-20s20 8.954 20 20" fill="#A0A0B8" />
          </svg>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: LL.text, letterSpacing: '-0.01em', marginBottom: 5 }}>
          毛毛 M.
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: LL.text2, marginBottom: 18 }}>
          <i className="ph ph-map-pin" style={{ fontSize: 13 }} />
          朝阳区·望京
        </div>
        <button style={{
          width: '100%', height: 46, borderRadius: 999, border: 0,
          background: LL.ink, color: '#fff',
          fontSize: 15, fontWeight: 600, fontFamily: LL.font, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <i className="ph ph-pencil-simple" style={{ fontSize: 16 }} />
          编辑资料
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        background: LL.surface, display: 'flex',
        borderBottom: `1px solid ${LL.border}`,
        position: 'sticky', top: 0, zIndex: 19,
      }}>
        {TABS.map(t => {
          const on = t.id === tab;
          return (
            <button key={t.id} onClick={() => t.id === 'pets' ? onNav('pets') : setTab(t.id)} style={{
              flex: 1, height: 44, border: 0, background: 'transparent',
              fontSize: 13.5, fontWeight: on ? 700 : 500,
              color: on ? LL.text : LL.text3,
              borderBottom: on ? `2px solid ${LL.text}` : '2px solid transparent',
              cursor: 'pointer', fontFamily: LL.font, transition: 'color 160ms',
            }}>{t.label}</button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ background: LL.surface }}>
        {tab === 'about'    && <AboutTab />}
        {tab === 'feedback' && <FeedbackTab />}
        {tab === 'pets'     && <PetsTab />}
      </div>

      {/* Gray divider */}
      <div style={{ height: 8, background: '#F0F0F5' }} />

      {/* Menu items */}
      <div style={{ background: LL.surface }}>
        <MenuRow icon="shield-check"  label="成为守护者"   iconBg={LL.ink}   onClick={() => onNav('guardian')}  />
        <MenuRow icon="ticket"        label="我的优惠券"   badge="2张"        onClick={() => onNav('coupons')}   />
        <MenuRow icon="share-network" label="我的邀请码"                      onClick={() => onNav('invite')}    />
        <MenuRow icon="gear"          label="隐私与设置"                      onClick={() => onNav('settings')}  />
        <MenuRow icon="info"          label="关于 Loulou"  isLast             onClick={() => onNav('about-ll')}  />
      </div>
    </div>
  );
}

// ─── 成为守护者 ───────────────────────────────────────────────
function BecomeGuardianPage({ onBack }) {
  return (
    <SubPageWrap title="成为守护者" onBack={onBack}>
      {/* Hero */}
      <div style={{
        background: LL.ink, padding: '28px 20px 24px', textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
      }}>
        <i className="ph ph-paw-print" style={{ fontSize: 44, color: LL.butter }} />
        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>成为 Loulou 守护者</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, maxWidth: 260 }}>
          与爱宠为伴，为宠主提供专业照护，同时赚取额外收入
        </div>
      </div>

      {/* Benefits */}
      <div style={{ margin: '14px 16px 0', background: LL.surface, borderRadius: 16, padding: '16px 16px 4px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: LL.text, marginBottom: 12 }}>守护者权益</div>
        {[
          { icon: 'currency-cny',   text: '灵活赚取收入，自定服务价格' },
          { icon: 'calendar-blank', text: '自主管理日程，随时暂停接单' },
          { icon: 'shield-check',   text: '平台保险保障，安全无忧' },
          { icon: 'headset',        text: '7×24小时专属客服支持' },
        ].map((item, i, arr) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 0',
            borderBottom: i < arr.length - 1 ? `1px solid ${LL.border}` : 0,
          }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: LL.butter, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
              <i className={`ph ph-${item.icon}`} style={{ fontSize: 17, color: LL.text }} />
            </div>
            <span style={{ fontSize: 13.5, color: LL.text2 }}>{item.text}</span>
          </div>
        ))}
      </div>

      {/* Requirements */}
      <div style={{ margin: '12px 16px 0', background: LL.surface, borderRadius: 16, padding: '16px 16px 4px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: LL.text, marginBottom: 12 }}>申请条件</div>
        {['年满18周岁', '爱宠人士，有养宠经验', '通过平台认证培训', '提供安全、整洁的住所'].map((req, i, arr) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${LL.border}` : 0 }}>
            <i className="ph-fill ph-check-circle" style={{ fontSize: 16, color: PRF_GREEN, flex: '0 0 auto' }} />
            <span style={{ fontSize: 13.5, color: LL.text2 }}>{req}</span>
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <button style={{
          width: '100%', height: 50, borderRadius: 999, border: 0,
          background: LL.ink, color: '#fff', fontSize: 15, fontWeight: 700,
          fontFamily: LL.font, cursor: 'pointer',
        }}>立即申请成为守护者</button>
      </div>
    </SubPageWrap>
  );
}

// ─── 我的优惠券 ───────────────────────────────────────────────
function CouponsPage({ onBack }) {
  const [subTab, setSubTab] = React.useState('valid');
  const allCoupons = {
    valid: [
      { id: 'c1', type: '生日专享', icon: 'cake', title: '宠物生日折扣券', desc: '生日当月享9折，不限服务', expires: '2026年12月31日', tag: '即将到期', bg: LL.butter },
      { id: 'c2', type: '邀请奖励', icon: 'users', title: '邀请好友奖励券', desc: '满¥100立减¥20', expires: '2026年06月30日', tag: null, bg: LL.lavender },
    ],
    used: [],
    expired: [
      { id: 'c3', type: '商家合作', icon: 'handshake', title: '噜噜×萌宠乐园合作券', desc: '满¥100减¥15', expires: '2026年04月30日', tag: '已过期', bg: '#EBEBF0' },
    ],
  };
  const TABS = [{ id: 'valid', label: '未使用' }, { id: 'used', label: '已使用' }, { id: 'expired', label: '已过期' }];
  const list = allCoupons[subTab];

  return (
    <SubPageWrap title="我的优惠券" onBack={onBack}>
      {/* Sub-tabs */}
      <div style={{ background: LL.surface, display: 'flex', borderBottom: `1px solid ${LL.border}`, position: 'sticky', top: 52, zIndex: 18 }}>
        {TABS.map(t => {
          const on = t.id === subTab;
          return (
            <button key={t.id} onClick={() => setSubTab(t.id)} style={{
              flex: 1, height: 42, border: 0, background: 'transparent',
              fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? LL.text : LL.text3,
              borderBottom: on ? `2px solid ${LL.text}` : '2px solid transparent',
              cursor: 'pointer', fontFamily: LL.font,
            }}>{t.label}</button>
          );
        })}
      </div>

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {list.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <i className="ph ph-ticket" style={{ fontSize: 44, color: LL.text3, display: 'block', marginBottom: 10 }} />
            <div style={{ fontSize: 13.5, color: LL.text3 }}>暂无{TABS.find(t => t.id === subTab)?.label}优惠券</div>
          </div>
        ) : list.map(c => (
          <div key={c.id} style={{
            borderRadius: 14, overflow: 'hidden', background: LL.surface,
            boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
            display: 'flex', opacity: subTab === 'expired' ? 0.6 : 1,
          }}>
            {/* Color strip */}
            <div style={{ width: 62, background: c.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '16px 6px', gap: 5 }}>
              <i className={`ph ph-${c.icon}`} style={{ fontSize: 22, color: LL.text2 }} />
              <div style={{ fontSize: 9.5, fontWeight: 600, color: LL.text2, textAlign: 'center', lineHeight: 1.3 }}>{c.type}</div>
            </div>
            {/* Dashed sep */}
            <div style={{ width: 1, background: 'repeating-linear-gradient(to bottom, #DDD 0, #DDD 4px, transparent 4px, transparent 8px)' }} />
            {/* Content */}
            <div style={{ flex: 1, padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: LL.text, flex: 1 }}>{c.title}</div>
                {c.tag && <span style={{ fontSize: 10, fontWeight: 600, background: LL.peach, color: LL.text, padding: '2px 6px', borderRadius: 4, flex: '0 0 auto' }}>{c.tag}</span>}
              </div>
              <div style={{ fontSize: 13, color: LL.text2, marginBottom: 8 }}>{c.desc}</div>
              <div style={{ fontSize: 11, color: LL.text3 }}>有效期至 {c.expires}</div>
            </div>
          </div>
        ))}
      </div>
    </SubPageWrap>
  );
}

// ─── 我的邀请码 ───────────────────────────────────────────────
function InvitePage({ onBack }) {
  const [copied, setCopied] = React.useState(false);
  const CODE = 'LOULOU888';
  const copy = () => {
    try { navigator.clipboard.writeText(CODE); } catch (_) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SubPageWrap title="我的邀请码" onBack={onBack}>
      {/* Stats hero */}
      <div style={{ background: LL.ink, padding: '24px 20px', display: 'flex', justifyContent: 'center', gap: 40 }}>
        {[{ label: '已邀请好友', value: '3 位' }, { label: '获得奖励', value: '¥60' }].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Code card */}
      <div style={{ margin: '14px 16px 0', background: LL.surface, borderRadius: 16, padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 12.5, color: LL.text3, textAlign: 'center', marginBottom: 10 }}>我的专属邀请码</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: LL.bg, borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ flex: 1, fontSize: 24, fontWeight: 800, color: LL.text, letterSpacing: '0.1em', textAlign: 'center' }}>{CODE}</div>
          <button onClick={copy} style={{
            height: 36, padding: '0 16px', borderRadius: 999, border: 0,
            background: copied ? PRF_GREEN : LL.ink, color: '#fff',
            fontSize: 13, fontWeight: 600, fontFamily: LL.font,
            cursor: 'pointer', transition: 'background 200ms', flex: '0 0 auto',
          }}>{copied ? '✓ 已复制' : '复制'}</button>
        </div>
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 110, height: 110, background: LL.bg, borderRadius: 12, border: `1px solid ${LL.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="ph ph-qr-code" style={{ fontSize: 52, color: LL.text3 }} />
          </div>
          <div style={{ fontSize: 12, color: LL.text3 }}>好友扫码注册，自动绑定邀请关系</div>
        </div>
      </div>

      {/* Rules */}
      <div style={{ margin: '12px 16px 0', background: LL.surface, borderRadius: 16, padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: LL.text, marginBottom: 10 }}>邀请规则</div>
        {['好友通过邀请码注册后，双方各得 ¥20 优惠券', '好友完成首笔订单后，您额外获得 ¥10 奖励', '优惠券有效期90天，请及时使用'].map((r, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12.5, color: LL.text2, lineHeight: 1.6, paddingBottom: i < 2 ? 8 : 0 }}>
            <span style={{ color: LL.text3, flex: '0 0 auto', fontWeight: 600 }}>{i + 1}.</span>
            {r}
          </div>
        ))}
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <button style={{
          width: '100%', height: 50, borderRadius: 999, border: 0,
          background: LL.ink, color: '#fff', fontSize: 15, fontWeight: 700,
          fontFamily: LL.font, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <i className="ph ph-share-network" style={{ fontSize: 18 }} />
          分享给好友
        </button>
      </div>
    </SubPageWrap>
  );
}

// ─── 隐私与设置 ───────────────────────────────────────────────
function SettingsPage({ onBack }) {
  const [notif, setNotif] = React.useState(true);
  const [mktg,  setMktg]  = React.useState(false);

  const Toggle = ({ on, onToggle }) => (
    <button onClick={onToggle} style={{
      width: 46, height: 26, borderRadius: 13, border: 0,
      background: on ? PRF_GREEN : LL.border,
      cursor: 'pointer', position: 'relative', transition: 'background 200ms',
    }}>
      <div style={{
        position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff',
        left: on ? 23 : 3, transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      }} />
    </button>
  );

  const sections = [
    { title: '账号安全', items: [
      { label: '手机号码',   value: '+86 138 **** 8888', type: 'nav' },
      { label: '修改密码',   value: null,               type: 'nav' },
      { label: '绑定邮箱',   value: '已绑定',            type: 'nav' },
    ]},
    { title: '通知设置', items: [
      { label: '推送通知',     value: null, type: 'toggle', key: 'notif' },
      { label: '营销活动推送', value: null, type: 'toggle', key: 'mktg'  },
      { label: '订单状态提醒', value: null, type: 'nav' },
    ]},
    { title: '通用', items: [
      { label: '清除缓存', value: '12.5 MB', type: 'nav' },
      { label: '反馈与帮助', value: null,    type: 'nav' },
    ]},
  ];

  return (
    <SubPageWrap title="隐私与设置" onBack={onBack}>
      {sections.map((sec, si) => (
        <div key={si}>
          {si > 0 && <div style={{ height: 8, background: '#F0F0F5' }} />}
          <div style={{ padding: '10px 16px 4px' }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: LL.text3, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{sec.title}</div>
          </div>
          <div style={{ background: LL.surface }}>
            {sec.items.map((item, ii) => (
              <div key={ii} style={{
                display: 'flex', alignItems: 'center', padding: '14px 16px',
                borderBottom: ii < sec.items.length - 1 ? `1px solid ${LL.border}` : 0,
              }}>
                <div style={{ flex: 1, fontSize: 14.5, color: LL.text, fontWeight: 500 }}>{item.label}</div>
                {item.type === 'toggle' ? (
                  <Toggle
                    on={item.key === 'notif' ? notif : mktg}
                    onToggle={() => item.key === 'notif' ? setNotif(n => !n) : setMktg(m => !m)}
                  />
                ) : (
                  <>
                    {item.value && <div style={{ fontSize: 13, color: LL.text3, marginRight: 8 }}>{item.value}</div>}
                    <i className="ph ph-caret-right" style={{ fontSize: 14, color: LL.text3 }} />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ height: 8, background: '#F0F0F5' }} />
      <div style={{ background: LL.surface }}>
        <button style={{
          width: '100%', padding: '16px', background: 'transparent', border: 0,
          cursor: 'pointer', fontFamily: LL.font, fontSize: 15, fontWeight: 600, color: '#CC2200',
        }}>退出登录</button>
      </div>
    </SubPageWrap>
  );
}

// ─── 关于 Loulou ──────────────────────────────────────────────
function AboutLoulouPage({ onBack }) {
  const [expanded, setExpanded] = React.useState(null);
  const logoUrl = (window.__resources && window.__resources.loulouLogo) || './assets/loulou-logo.png';

  const docs = [
    { id: 'terms',      label: '用户服务协议', body: '欢迎使用 Loulou（露露）宠物服务平台。本协议约定您与平台之间的权利义务关系。\n\n一、服务内容\nLoulou 提供宠物寄养、遛狗、日托等预约撮合服务，平台为信息中介方。\n\n二、用户义务\n您需如实填写宠物信息，保证宠物已接种疫苗，配合守护者完成接送手续。\n\n三、平台职责\n平台负责守护者认证审核，提供支付担保及纠纷协调，但不对守护者的个人行为承担连带责任。\n\n四、争议解决\n本协议适用中华人民共和国法律，争议由平台注册地人民法院管辖。' },
    { id: 'privacy',    label: '隐私政策',     body: 'Loulou 重视用户隐私保护。本政策说明我们如何收集、使用和保护您的个人信息。\n\n一、信息收集\n我们收集您注册时填写的姓名、手机号、地址及使用过程中的行为数据。\n\n二、信息使用\n信息用于提供服务、改善产品体验、发送订单通知。\n\n三、信息共享\n我们不向无关第三方出售您的信息，仅在必要时与守护者共享联系方式。\n\n四、数据安全\n平台采用行业标准加密技术保障数据安全，如有泄漏将第一时间通知您。' },
    { id: 'disclaimer', label: '免责声明',     body: '一、服务限制\nLoulou 为撮合平台，对守护者与宠主因服务产生的纠纷不承担直接责任。\n\n二、意外责任\n服务过程中发生宠物意外，平台将协助保险理赔，最终责任认定依据相关法律。\n\n三、不可抗力\n因自然灾害、政府行为等不可抗力导致服务中断，平台不承担赔偿责任。' },
    { id: 'feedback',   label: '意见反馈',     body: null },
  ];

  return (
    <SubPageWrap title="关于 Loulou" onBack={onBack}>
      {/* App info */}
      <div style={{ background: LL.surface, padding: '28px 20px', textAlign: 'center', marginBottom: 8 }}>
        <img src={logoUrl} alt="Loulou" style={{ height: 48, width: 'auto', marginBottom: 12 }} onError={e => { e.target.style.display = 'none'; }} />
        <div style={{ fontSize: 18, fontWeight: 800, color: LL.text, marginBottom: 4 }}>Loulou 露露</div>
        <div style={{ fontSize: 12.5, color: LL.text3 }}>宠物守护服务平台</div>
        <div style={{ fontSize: 12.5, color: LL.text3, marginTop: 3 }}>版本 1.2.0</div>
      </div>

      {/* Docs list */}
      <div style={{ background: LL.surface }}>
        {docs.map((doc, i) => (
          <div key={doc.id}>
            <button onClick={() => doc.body && setExpanded(expanded === doc.id ? null : doc.id)} style={{
              width: '100%', padding: '15px 16px', background: 'transparent', border: 0,
              borderBottom: `1px solid ${LL.border}`,
              display: 'flex', alignItems: 'center', cursor: 'pointer', fontFamily: LL.font,
            }}>
              <div style={{ flex: 1, fontSize: 14.5, fontWeight: 500, color: LL.text, textAlign: 'left' }}>{doc.label}</div>
              <i className={`ph ph-caret-${doc.body && expanded === doc.id ? 'up' : 'right'}`} style={{ fontSize: 14, color: LL.text3 }} />
            </button>
            {doc.body && expanded === doc.id && (
              <div style={{ padding: '14px 16px 18px', background: LL.bg, fontSize: 13, color: LL.text2, lineHeight: 1.75, whiteSpace: 'pre-wrap', textWrap: 'pretty', borderBottom: `1px solid ${LL.border}` }}>
                {doc.body}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '20px 0', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: LL.text3 }}>© 2026 Loulou 露露 版权所有</div>
        <div style={{ fontSize: 11.5, color: LL.text3, marginTop: 3 }}>京ICP备2026XXXXXX号</div>
      </div>
    </SubPageWrap>
  );
}

// ─── Main export ─────────────────────────────────────────────
function ProfileScreen() {
  const [tab,  setTab]  = React.useState('about');
  const [page, setPage] = React.useState(null);

  if (page === 'guardian') return <BecomeGuardianPage onBack={() => setPage(null)} />;
  if (page === 'pets')     return <PetsScreen          onBack={() => setPage(null)} />;
  if (page === 'coupons')  return <CouponsPage         onBack={() => setPage(null)} />;
  if (page === 'invite')   return <InvitePage          onBack={() => setPage(null)} />;
  if (page === 'settings') return <SettingsPage        onBack={() => setPage(null)} />;
  if (page === 'about-ll') return <AboutLoulouPage     onBack={() => setPage(null)} />;

  return <MyProfileMain tab={tab} setTab={setTab} onNav={setPage} />;
}

window.ProfileScreen = ProfileScreen;
