// Lou Lou — Home (Guardian marketplace) — v4
// Round-3 review changes:
//   · 顶部固定 logo + slogan：Loulou 噜噜 / 让每一次分离都安心
//   · 快捷入口 + 搜索卡片合并：5 个服务图标变成单选入口，
//     选中实色，未选中 50% 透明，下方小字显示服务描述
//   · 服务类型字段从搜索卡片中移除（已整合到图标）
//   · 搜索区下方新增「常用守护者」横排头像
//   · Banner 移到常用守护者下面
//   · 宠物类型选项：猫 / 狗 / 兔子 / 鼠鼠 / 鸟

function HomeMarketplaceScreen({ onSearch, onPickService, onPickField }) {
  const [bannerIdx, setBannerIdx] = React.useState(0);

  const [petType,   setPetType]   = React.useState({ label: '狗' });
  const [svcType,   setSvcType]   = React.useState('上门喂养');
  const [address,   setAddress]   = React.useState({ label: '朝阳区' });
  // 默认日期：明天
  const _tomorrow = (() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(0,0,0,0); return d; })();
  const [dateRange, setDateRange] = React.useState({ start: _tomorrow, end: null });
  const [schedule,  setSchedule]  = React.useState({ ...defaultSchedule(), dates: { start: _tomorrow, end: null } });

  const [picker, setPicker] = React.useState(null); // 'petType' | 'dateA' | 'dateB' | null

  const PET_OPTIONS = ['猫', '狗', '兔子', '鼠鼠', '鸟'];

  // 5 service entries with icons + hints — labels match SERVICE_GROUPS
  const services = [
    { id: '寄养',     icon: 'house',       hint: '24小时照护',             bg: LL.butter   },
    { id: '日托',     icon: 'sun',         hint: '白天看护，当天接送',       bg: LL.peach    },
    { id: '遛狗',     icon: 'sneaker',     hint: '至少30分钟',             bg: LL.mint     },
    { id: '上门喂养', icon: 'hand-waving', hint: '查看、喂食、换水、铲屎等至少30分钟', bg: LL.lavender },
    { id: '伴宠留宿', icon: 'moon-stars',  hint: '守护者上门陪伴/过夜',   bg: '#E8E3F2'   },
  ];
  const selectedSvc = services.find((s) => s.id === svcType) || services[0];

  // Which date form for the chosen service
  const dateForm = SERVICE_FORM[svcType] || 'A';
  const openDatePicker = () => setPicker(dateForm === 'B' ? 'dateB' : 'dateA');

  // Friendly summary line for the date row
  const dateSummary = summarizeQuery({ svcType, dateRange, schedule });

  const handleSearch = () => {
    onSearch?.({
      petType: petType?.label,
      svcType,
      address: address?.label,
      dateRange, schedule,
    });
  };

  const banners = [
    { tag: '新人专享',   title: '首单立减 ¥20',       sub: '注册即得专属优惠券', bg: LL.butter,   emoji: '🎉' },
    { tag: '成为守护者', title: '陪伴萌宠 · 赚取收入', sub: '认证通过即可接单',   bg: LL.lavender, emoji: '🐾' },
    { tag: '邀请有礼',   title: '邀好友得 ¥30 券',     sub: '双方均可领取',       bg: LL.mint,     emoji: '🎁' },
  ];
  const b = banners[bannerIdx];

  // 常用守护者 — 3 个，使用实拍头像
  const _g1 = (window.__resources && window.__resources.guardian1) || './assets/guardian1.png';
  const _g2 = (window.__resources && window.__resources.guardian2) || './assets/guardian2.png';
  const _g3 = (window.__resources && window.__resources.guardian3) || './assets/guardian3.png';
  const recents = [
    { id: 'r1', name: '林若', photo: _g1 },
    { id: 'r2', name: '陈逸', photo: _g2 },
    { id: 'r3', name: '桃子', photo: _g3 },
  ];

  return (
    <div style={{ paddingBottom: 24, background: LL.bg, position: 'relative' }}>
      {/* ─── ① 固定 Logo + Slogan ─── */}
      <BrandHeader />

      {/* ─── ② 合并卡片：服务图标单选 + 搜索字段 ─── */}
      <div style={{
        margin: '4px 16px 0', background: '#fff', borderRadius: 16,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden',
      }}>
        {/* Service icons row (single-select) */}
        <div style={{ padding: '12px 14px 4px', fontSize: 12, fontWeight: 600, color: LL.text2, letterSpacing: '0.02em' }}>
          选择服务
        </div>
        <div style={{
          padding: '6px 4px 10px',
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
        }}>
          {services.map((s) => (
            <ServiceIconTile
              key={s.id}
              {...s}
              selected={s.id === svcType}
              onClick={() => setSvcType(s.id)}
            />
          ))}
        </div>
        {/* Hint row — describes the currently-selected service */}
        <div style={{
          padding: '0 16px 12px',
          textAlign: 'center', fontSize: 11.5, color: LL.text2,
          lineHeight: 1.4,
        }}>
          <span style={{ fontWeight: 600, color: LL.text }}>{selectedSvc.id}</span>
          <span style={{ margin: '0 6px', color: LL.text3 }}>·</span>
          {selectedSvc.hint}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: LL.border, margin: '0 14px' }} />

        {/* Search rows — pet · address · date */}
        <SearchRow
          icon="paw-print"
          label="宠物类型"
          value={petType.label}
          onClick={() => setPicker('petType')}
        />
        <SearchRow
          icon="map-pin"
          label="地址"
          value={address.label}
          onClick={() => onPickField?.('address')}
        />
        <SearchRow
          icon="calendar-blank"
          label={dateForm === 'B' ? '日期与时段' : '日期'}
          value={dateSummary || '选择日期'}
          hint={!dateSummary}
          onClick={openDatePicker}
        />

        {/* Search button */}
        <div style={{ padding: '12px 14px 16px' }}>
          <button onClick={handleSearch} style={{
            width: '100%', height: 46, borderRadius: 999, border: 0,
            background: LL.ink, color: '#fff',
            fontSize: 15, fontWeight: 600, fontFamily: LL.font,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: 'pointer',
          }}>
            <i className="ph ph-magnifying-glass" style={{ fontSize: 18 }} />
            <span style={{ letterSpacing: '0.32em', textIndent: '0.32em' }}>搜索守护者</span>
          </button>
        </div>
      </div>

      {/* ─── ③ 常用守护者 ─── */}
      <RecentGuardians items={recents} onPick={(g) => onPickService?.(g.id)} />

      {/* ─── ④ Banner ─── */}
      <div style={{ padding: '24px 16px 0' }}>
        <div style={{
          position: 'relative', borderRadius: 16, padding: '14px 16px',
          aspectRatio: '16 / 6.3', background: b.bg, overflow: 'hidden',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{
            display: 'inline-flex', alignSelf: 'flex-start', padding: '3px 9px',
            background: 'rgba(255,255,255,0.55)', borderRadius: 999,
            fontSize: 10.5, fontWeight: 600, color: LL.text,
          }}>{b.tag}</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: LL.text, letterSpacing: '-0.01em' }}>{b.title}</div>
            <div style={{ fontSize: 11.5, color: 'rgba(30,30,36,0.62)', marginTop: 2 }}>{b.sub}</div>
          </div>
          <div style={{
            position: 'absolute', right: -6, top: -10, fontSize: 88, lineHeight: 1, opacity: 0.85,
          }}>{b.emoji}</div>

          <div style={{
            position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 5,
          }}>
            {banners.map((_, i) => (
              <button key={i} onClick={() => setBannerIdx(i)} style={{
                width: i === bannerIdx ? 14 : 5, height: 5, borderRadius: 3,
                background: i === bannerIdx ? LL.ink : 'rgba(34,40,44,0.25)',
                border: 0, cursor: 'pointer', padding: 0,
                transition: 'width 200ms ease',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ─── Picker sheets ─── */}
      <DateRangePickerSheet
        open={picker === 'dateA'}
        svcType={svcType}
        value={dateRange}
        onConfirm={(d) => { setDateRange(d); setPicker(null); }}
        onClose={() => setPicker(null)}
      />
      <SchedulePickerSheet
        open={picker === 'dateB'}
        svcType={svcType}
        value={schedule}
        onSearch={(s) => {
          setSchedule(s);
          setPicker(null);
          onSearch?.({
            petType: petType?.label,
            svcType,
            address: address?.label,
            dateRange, schedule: s,
          });
        }}
        onClose={() => setPicker(null)}
      />
      <FieldPickerSheet
        open={picker === 'petType'}
        title="选择宠物类型"
        options={PET_OPTIONS}
        value={petType.label}
        onPick={(v) => { setPetType({ label: v }); setPicker(null); }}
        onClose={() => setPicker(null)}
      />
    </div>
  );
}

// ─── Brand header ─── city left, logo+slogan centred ───
function BrandHeader() {
  const logoUrl = (typeof window !== 'undefined' && window.__resources && window.__resources.loulouLogo)
    || './assets/loulou-logo.png';
  return (
    <div style={{ padding: '12px 16px 10px', background: LL.bg }}>      
      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
        {/* Left — city dropdown */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: 3, padding: '5px 10px 5px 0',
          background: 'transparent', border: 0,
          color: LL.text, fontSize: 13, fontWeight: 500, fontFamily: LL.font, cursor: 'pointer',
          flex: '0 0 auto', marginTop: 2,
        }}>
          <i className="ph ph-map-pin" style={{ fontSize: 13, color: LL.text2 }} />
          北京
          <i className="ph ph-caret-down" style={{ fontSize: 11, color: LL.text3 }} />
        </button>
        {/* Centre — logo + slogan */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 4,
        }}>
          <img
            src={logoUrl}
            alt="Loulou 噜噜"
            style={{ height: 34, width: 'auto', display: 'block' }}
            onError={(e) => {
              const span = document.createElement('span');
              span.innerText = 'Loulou 噜噜';
              span.style.cssText = 'font-family:"Brush Script MT",cursive;font-size:26px;font-weight:700;color:#1E1E24;';
              e.target.replaceWith(span);
            }}
          />
          <div style={{ fontSize: 11.5, color: LL.text3, fontWeight: 500, letterSpacing: '0.04em' }}>
            让每一次分离都安心
          </div>
        </div>
        {/* Right — balance spacer same width as city btn */}
        <div style={{ flex: '0 0 64px' }} />
      </div>
    </div>
  );
}

// ─── Service icon tile — single-select, dim when not selected ───
function ServiceIconTile({ id, icon, bg, selected, onClick }) {
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      aria-pressed={selected}
      style={{
        background: 'transparent', border: 0, padding: '4px 0',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
        cursor: 'pointer', fontFamily: LL.font,
        transform: pressed ? 'scale(0.94)' : 'scale(1)',
        transition: 'transform 140ms ease',
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: '50%',
        background: bg,
        color: LL.text,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: selected ? 1 : 0.5,
        transition: 'opacity 160ms ease',
      }}>
        <i className={`ph ph-${icon}`} style={{ fontSize: 22 }} />
      </div>
      <div style={{
        fontSize: 11.5, color: LL.text,
        fontWeight: selected ? 700 : 500,
        lineHeight: 1.2, whiteSpace: 'nowrap',
      }}>{id}</div>
    </button>
  );
}

// ─── Recent guardians — horizontal scrollable row ───
function RecentGuardians({ items, onPick }) {
  return (
    <div style={{ marginTop: 24 }}>
      <div style={{
        display: 'flex', alignItems: 'baseline',
        padding: '0 16px 8px', gap: 8,
      }}>
        <div style={{
          fontSize: 14, fontWeight: 700, color: LL.text, letterSpacing: '-0.01em',
        }}>常用守护者</div>
        <div style={{ fontSize: 11.5, color: LL.text3 }}>最近预约过</div>
        <button style={{
          marginLeft: 'auto', background: 'transparent', border: 0,
          fontSize: 11.5, color: LL.text2, fontFamily: LL.font, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 2,
        }}>
          全部 <i className="ph ph-caret-right" style={{ fontSize: 10 }} />
        </button>
      </div>
      <div style={{
        display: 'flex', gap: 22, overflowX: 'auto', overflowY: 'hidden',
        padding: '4px 16px 6px', scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}>
        {items.map((g) => (
          <button
            key={g.id}
            onClick={() => onPick?.(g)}
            style={{
              flex: '0 0 auto', background: 'transparent', border: 0, padding: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              cursor: 'pointer', fontFamily: LL.font,
            }}
          >
            {g.photo ? (
              <img src={g.photo} alt={g.name} style={{
                width: 52, height: 52, borderRadius: '50%',
                objectFit: 'cover', objectPosition: 'top center', display: 'block',
              }} />
            ) : (
              <div style={{
                width: 52, height: 52, borderRadius: '50%', background: g.bg || '#D9D9D9',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 600, color: 'rgba(30,30,36,0.35)',
              }}>{g.name[0]}</div>
            )}
            <div style={{
              fontSize: 11, color: LL.text2, fontWeight: 500,
              maxWidth: 60, whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis', textAlign: 'center',
            }}>{g.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Search card row (label · value · chevron) ──────────────
function SearchRow({ icon, label, value, hint = false, onClick, isLast = false }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '14px 14px', background: 'transparent', border: 0,
      borderBottom: isLast ? '0' : `1px solid ${LL.border}`,
      display: 'flex', alignItems: 'center', gap: 12,
      cursor: 'pointer', fontFamily: LL.font,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8, background: 'rgba(34,40,44,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: LL.text,
        flex: '0 0 auto',
      }}>
        <i className={`ph ph-${icon}`} style={{ fontSize: 15 }} />
      </div>
      <div style={{ fontSize: 13, color: LL.text2, fontWeight: 500, minWidth: 60, textAlign: 'left' }}>{label}</div>
      <div style={{
        flex: 1, textAlign: 'right',
        fontSize: 14, fontWeight: hint ? 400 : 600,
        color: hint ? LL.text3 : LL.text,
      }}>{value}</div>
      <i className="ph ph-caret-right" style={{ fontSize: 13, color: LL.text3 }} />
    </button>
  );
}

// ─── Guardian row — preserved for search-results screen ───
function GuardianRow({ g, isLast, onClick }) {
  const available = g.status === '有空';
  return (
    <div onClick={onClick} style={{
      padding: '14px 14px', display: 'flex', gap: 12, alignItems: 'flex-start',
      cursor: 'pointer', position: 'relative',
      borderBottom: isLast ? '0' : `1px solid ${LL.border}`,
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%', background: g.bg, flex: '0 0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, fontWeight: 700, color: LL.text, letterSpacing: '-0.01em',
      }}>{g.initial}</div>

      <div style={{ flex: 1, minWidth: 0, paddingRight: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: LL.text }}>{g.name}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 12, color: LL.text, fontVariantNumeric: 'tabular-nums' }}>
            <i className="ph-fill ph-star" style={{ fontSize: 12, color: '#F0B100' }} />
            <span style={{ fontWeight: 600 }}>{g.rating.toFixed(1)}</span>
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            background: '#E6F1EC', color: '#2C7A4B', borderRadius: 4,
            padding: '1px 5px', fontSize: 10.5, fontWeight: 600,
          }}>
            <i className="ph-fill ph-seal-check" style={{ fontSize: 12 }} /> 认证
          </div>
          {g.reused && (
            <div style={{
              background: LL.butter, color: LL.text, borderRadius: 4,
              padding: '1px 6px', fontSize: 10.5, fontWeight: 600,
            }}>再次预约</div>
          )}
        </div>

        <div style={{ marginTop: 4, display: 'flex', gap: 4, alignItems: 'center', fontSize: 11.5, color: LL.text2 }}>
          {g.services.map((s, i) => (
            <React.Fragment key={s}>
              {i > 0 && <span style={{ color: LL.text3 }}>·</span>}
              <span>{s}</span>
            </React.Fragment>
          ))}
          <span style={{ color: LL.text3, marginLeft: 4 }}>· {g.city}</span>
        </div>

        <div style={{ marginTop: 5, display: 'flex', alignItems: 'baseline', gap: 8, fontSize: 12 }}>
          <span style={{ color: LL.text2 }}>{g.dist}</span>
          <span style={{ color: LL.text3 }}>·</span>
          <span>
            <span style={{ fontSize: 15.5, fontWeight: 700, color: LL.text, fontVariantNumeric: 'tabular-nums' }}>¥{g.price}</span>
            <span style={{ fontSize: 11, color: LL.text2, marginLeft: 2 }}>/{g.unit}起</span>
          </span>
          <span style={{ color: LL.text2, marginLeft: 'auto' }}>
            已服务 <span style={{ fontWeight: 600, color: LL.text }}>{g.orders}</span> 单
          </span>
        </div>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        justifyContent: 'space-between', alignSelf: 'stretch', gap: 8,
      }}>
        <div style={{
          fontSize: 10.5, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
          background: available ? '#E6F1EC' : '#F0F0F5',
          color: available ? '#2C7A4B' : LL.text2,
        }}>{g.status}</div>

        <button onClick={(e) => e.stopPropagation()} disabled={!available} style={{
          height: 28, padding: '0 13px', borderRadius: 999, border: 0,
          background: available ? LL.ink : LL.inkDisabled,
          color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: LL.font,
          cursor: available ? 'pointer' : 'not-allowed',
        }}>预约</button>
      </div>
    </div>
  );
}

// ─── small icon button ──────────────────────────────────────
function IconBtn({ name }) {
  return (
    <button style={{
      width: 36, height: 36, borderRadius: '50%', border: 0,
      background: 'rgba(34,40,44,0.06)', color: LL.text, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <i className={`ph ph-${name}`} style={{ fontSize: 18 }} />
    </button>
  );
}

// ─── Bottom-anchored field picker sheet ─────────────────────
function FieldPickerSheet({ open, title, options, value, onPick, onClose }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 85,
      }} />
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 86,
        background: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: '14px 0 28px',
        boxShadow: '0 -8px 24px rgba(0,0,0,0.10)',
        fontFamily: LL.font,
      }}>
        <div style={{ width: 38, height: 4, borderRadius: 2, background: LL.border, margin: '0 auto 10px' }} />
        <div style={{
          display: 'flex', alignItems: 'center', padding: '4px 14px 12px',
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: LL.text }}>{title}</div>
          <button onClick={onClose} style={{
            marginLeft: 'auto', width: 30, height: 30, borderRadius: '50%', border: 0,
            background: '#F0F0F5', color: LL.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><i className="ph ph-x" style={{ fontSize: 13 }} /></button>
        </div>
        {options.map((o, i) => {
          const on = o === value;
          return (
            <button key={o} onClick={() => onPick(o)} style={{
              width: '100%', padding: '14px 18px',
              background: 'transparent', border: 0, cursor: 'pointer', fontFamily: LL.font,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: 15, fontWeight: on ? 700 : 500, color: LL.text,
              borderTop: i === 0 ? `1px solid ${LL.border}` : '0',
              borderBottom: `1px solid ${LL.border}`,
            }}>
              <span>{o}</span>
              {on && <i className="ph-fill ph-check-circle" style={{ fontSize: 18, color: LL.ink }} />}
            </button>
          );
        })}
      </div>
    </>
  );
}

Object.assign(window, { HomeMarketplaceScreen, GuardianRow, IconBtn });
