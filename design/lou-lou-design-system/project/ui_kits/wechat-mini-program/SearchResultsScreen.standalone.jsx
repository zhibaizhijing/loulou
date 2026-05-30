// Lou Lou — Search results screen (守护者搜索结果)
//
// Layout (top to bottom, all inside the iOS frame, scroll region clamped):
//   1. Sticky top: back button + 2-row search summary (pet · service · address  /  date range).
//      Every segment is tappable to re-open the corresponding picker.
//   2. Sticky filter row: 距离 ▾ 评分 ▾ 价格 ▾    [  排序 ▾  ]
//      First three are filter popovers, the right one is the sort dropdown.
//   3. Result count strip ("共 8 位守护者 · 朝阳·三里屯 · 5月22 – 5月24").
//   4. Vertical list of GuardianCards with photos, certification, distance,
//      rating, price, availability badge for the requested time window,
//      and "已收藏" / "使用过" relationship markers.
//
// All popovers are anchored to their chip and dismiss on outside-click.

function SearchResultsScreen({ onBack, query, onPickField }) {
  // ── pulled in from the marketplace search card ───────────────
  const q = query || {
    petType: '狗',
    svcType: '寄养',
    address: '朝阳·三里屯',
    startDate: '5月22日 周三',
    endDate: '5月24日 周五',
    nights: 2,
  };

  // ── filter state ────────────────────────────────────────────
  const [distance, setDistance] = React.useState('全部');
  const [rating,   setRating]   = React.useState('全部');
  const [price,    setPrice]    = React.useState('全部');
  const [sort,     setSort]     = React.useState('智能排序');
  const [open,     setOpen]     = React.useState(null); // 'distance' | 'rating' | 'price' | 'sort' | null

  const DISTANCE_OPTS = ['全部', '< 1 km', '< 3 km', '< 5 km', '< 10 km'];
  const RATING_OPTS   = ['全部', '≥ 4.5', '≥ 4.8', '5.0'];
  const PRICE_OPTS    = ['全部', '≤ ¥100', '¥100 – 200', '¥200 – 300', '> ¥300'];
  const SORT_OPTS     = ['智能排序', '距离由近到远', '评分由高到低', '价格由低到高', '价格由高到低'];

  // ── mock data: 8 guardians ───────────────────────────────
  // Real Asian portraits sourced from Unsplash (verified). The system also
  // uses on-brand pastel initial circles (matching the existing GuardianRow
  // pattern) for the remaining slots — a realistic mix for a Chinese
  // mini-program listing. Replace `initial:{...}` with `photo:photo(...)` once
  // brand photography is supplied.
  const photo = (id) => (window.__resources && window.__resources[`photo_${id}`]) ||
    `https://images.unsplash.com/photo-${id}?w=240&h=240&fit=crop&crop=faces&auto=format&q=70`;
  const guardians = [
    { id:'g1', name:'林若 Lily',  photo: photo('1568822617270-2c1579f8dfe2'),                bio:'养狗6年，专业寄养经验3年，自家带院子', rating:4.97, reviews:128, dist:0.8, city:'三里屯',  features:['认证5年','户外活动','清洁消毒'],            price:168, unit:'晚', orders:412, cert:true,  reused:true,  badge:'金牌' },
    { id:'g2', name:'阿浩 Hao',   initial:{ char:'浩', bg:LL.peach    },                     bio:'宠物医院实习两年，懂日常喂养与急救',     rating:4.92, reviews:96,  dist:1.2, city:'工体北', features:['认证2年','24h智能监控','急救认证'],         price:148, unit:'晚', orders:286, cert:true,  reused:true,  badge:null  },
    { id:'g3', name:'桃子 Joy',   initial:{ char:'桃', bg:LL.butter   },                     bio:'家有两只布偶，擅长猫咪日托与上门喂养', rating:4.89, reviews:74,  dist:1.6, city:'东直门', features:['认证3年','清洁消毒','无其他宠物'],          price:88,  unit:'天', orders:151, cert:true,  reused:false, badge:null  },
    { id:'g4', name:'陈逸 Yi',    photo: photo('1542909192-2f2241a99c9d'),                   bio:'住家守护8年，接待中大型犬，提供日常视频', rating:4.86, reviews:212, dist:2.3, city:'国贸',    features:['认证8年','24h智能监控','户外活动','清洁消毒'], price:228, unit:'晚', orders:534, cert:true,  reused:false, badge:'金牌' },
    { id:'g5', name:'小米 Mia',   initial:{ char:'米', bg:LL.lavender },                     bio:'养小型犬5年，每日两次遛狗+拍照打卡',   rating:4.81, reviews:58,  dist:2.7, city:'朝阳门', features:['认证1年','户外活动'],                      price:128, unit:'晚', orders:103, cert:false, reused:false, badge:null  },
    { id:'g6', name:'阿哲 Zhe',   initial:{ char:'哲', bg:LL.mint     },                     bio:'宠物训练师，擅长拆家狗与社交训练',     rating:4.78, reviews:189, dist:3.4, city:'望京',    features:['认证4年','训练师','户外活动','清洁消毒'],   price:138, unit:'晚', orders:367, cert:true,  reused:true,  badge:null  },
    { id:'g7', name:'王野 Yann',  initial:{ char:'野', bg:'#E8E3F2'   },                     bio:'上门喂养专家，按时投喂铲屎换水换粮',   rating:4.74, reviews:42,  dist:4.1, city:'酒仙桥', features:['认证1年','拍照报告'],                       price:78,  unit:'次', orders:64,  cert:false, reused:false, badge:null  },
    { id:'g8', name:'若曦 Ruxi',  initial:{ char:'若', bg:LL.butter   },                     bio:'兽医专业毕业，自家无其他宠物零干扰',   rating:4.71, reviews:117, dist:5.6, city:'亚运村', features:['认证6年','兽医背景','清洁消毒'],            price:118, unit:'晚', orders:248, cert:true,  reused:false, badge:null  },
  ];

  // close any popover on outside click
  React.useEffect(() => {
    if (!open) return;
    const close = () => setOpen(null);
    const t = setTimeout(() => document.addEventListener('click', close, { once: true }), 0);
    return () => { clearTimeout(t); document.removeEventListener('click', close); };
  }, [open]);

  return (
    <div style={{ position: 'relative', background: LL.bg, minHeight: '100%' }}>
      {/* ─────────── Sticky top: brand strip + back + search summary ─────────── */}
      {/* The sticky container extends UP behind the iOS status bar (paddingTop:47,
          marginTop:-47) so the time/battery sit on a clean white background. */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30, background: '#fff',
        paddingTop: 47, marginTop: -47,
        boxShadow: '0 1px 0 rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
      }}>
        {/* Brand row — sits inside the white strip, just under the system status bar */}
        <div style={{
          display: 'flex', alignItems: 'center', padding: '0 14px 4px', gap: 8,
          marginTop: -8,
        }}>
          <button onClick={onBack} aria-label="返回" style={{
            width: 32, height: 32, borderRadius: '50%', border: 0,
            background: 'rgba(34,40,44,0.06)', color: LL.text, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
          }}>
            <i className="ph ph-caret-left" style={{ fontSize: 16 }} />
          </button>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, background: LL.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 15,
            }}>🐾</div>
            <div style={{
              fontSize: 17, fontWeight: 700, color: LL.text,
              letterSpacing: '-0.01em',
            }}>Lou Lou</div>
          </div>
          {/* Right-side spacer balances the back button so the brand stays optically centered */}
          <div style={{ width: 32, height: 32, flex: '0 0 auto' }} />
        </div>

        {/* Compact 2-row search summary */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '2px 14px 8px', gap: 10 }}>
          <CompactSearchSummary q={q} onPickField={onPickField} />
        </div>

        {/* Filter bar */}
        <div style={{
          padding: '4px 12px 10px',
          display: 'flex', alignItems: 'center', gap: 6,
          position: 'relative',
        }}>
          <FilterChip
            label="距离"
            value={distance}
            isOpen={open === 'distance'}
            onClick={() => setOpen(open === 'distance' ? null : 'distance')}
          />
          <FilterChip
            label="评分"
            value={rating}
            isOpen={open === 'rating'}
            onClick={() => setOpen(open === 'rating' ? null : 'rating')}
          />
          <FilterChip
            label="价格"
            value={price}
            isOpen={open === 'price'}
            onClick={() => setOpen(open === 'price' ? null : 'price')}
          />
          <div style={{ flex: 1 }} />
          <SortChip
            value={sort}
            isOpen={open === 'sort'}
            onClick={() => setOpen(open === 'sort' ? null : 'sort')}
          />

          {open === 'distance' && (
            <Popover anchor="left" onPick={(v) => { setDistance(v); setOpen(null); }} value={distance} options={DISTANCE_OPTS} offsetLeft={12} />
          )}
          {open === 'rating' && (
            <Popover anchor="left" onPick={(v) => { setRating(v); setOpen(null); }} value={rating} options={RATING_OPTS} offsetLeft={76} />
          )}
          {open === 'price' && (
            <Popover anchor="left" onPick={(v) => { setPrice(v); setOpen(null); }} value={price} options={PRICE_OPTS} offsetLeft={140} />
          )}
          {open === 'sort' && (
            <Popover anchor="right" onPick={(v) => { setSort(v); setOpen(null); }} value={sort} options={SORT_OPTS} offsetRight={12} />
          )}
        </div>
      </div>

      {/* ─────────── Result count strip ─────────── */}
      <div style={{
        display: 'flex', alignItems: 'baseline', padding: '14px 16px 8px', gap: 8,
      }}>
        <div style={{ fontSize: 13.5, color: LL.text2 }}>
          共 <span style={{ color: LL.text, fontWeight: 700, fontSize: 15, fontVariantNumeric: 'tabular-nums' }}>{guardians.length}</span> 位守护者
        </div>
        <div style={{ fontSize: 11.5, color: LL.text3, marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <i className="ph ph-map-pin" style={{ fontSize: 12 }} />
          {q.address}
        </div>
      </div>

      {/* ─────────── Guardian cards ─────────── */}
      <div style={{ padding: '0 12px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {guardians.map(g => <GuardianCard key={g.id} g={g} />)}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Compact 2-row search summary
// ─────────────────────────────────────────────────────────────
function CompactSearchSummary({ q, onPickField }) {
  return (
    <div style={{
      flex: 1, background: '#fff', borderRadius: 14,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      padding: '8px 10px',
      display: 'flex', flexDirection: 'column', gap: 4,
      fontFamily: LL.font,
    }}>
      {/* Row 1: pet · service · address */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <SummaryChip icon="paw-print" value={q.petType}  onClick={() => onPickField?.('petType')} />
        <SummaryDot />
        <SummaryChip icon="hand-heart" value={q.svcType} onClick={() => onPickField?.('svcType')} />
        <SummaryDot />
        <SummaryChip icon="map-pin"   value={q.address}  onClick={() => onPickField?.('address')} flex />
      </div>
      {/* Row 2: date range */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        borderTop: `1px dashed ${LL.border}`, paddingTop: 4,
      }}>
        <SummaryChip icon="calendar-blank" value={q.startDate} onClick={() => onPickField?.('startDate')} />
        <i className="ph ph-arrow-right" style={{ fontSize: 12, color: LL.text3, padding: '0 2px' }} />
        <SummaryChip value={q.endDate} onClick={() => onPickField?.('endDate')} />
        <div style={{
          marginLeft: 'auto', fontSize: 11, color: LL.text2,
          background: 'rgba(34,40,44,0.04)', borderRadius: 999, padding: '2px 8px',
          fontVariantNumeric: 'tabular-nums',
        }}>{q.nights} 晚</div>
      </div>
    </div>
  );
}

function SummaryChip({ icon, value, onClick, flex = false }) {
  return (
    <button onClick={onClick} style={{
      background: 'transparent', border: 0, padding: '4px 4px',
      display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer',
      fontFamily: LL.font, flex: flex ? 1 : '0 0 auto', minWidth: 0,
    }}>
      {icon && <i className={`ph ph-${icon}`} style={{ fontSize: 13, color: LL.text2, flex: '0 0 auto' }} />}
      <span style={{
        fontSize: 13, fontWeight: 600, color: LL.text,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{value}</span>
      <i className="ph ph-caret-down" style={{ fontSize: 10, color: LL.text3, flex: '0 0 auto' }} />
    </button>
  );
}

function SummaryDot() {
  return <span style={{ width: 3, height: 3, borderRadius: '50%', background: LL.text3, flex: '0 0 auto' }} />;
}

// ─────────────────────────────────────────────────────────────
// Filter & sort chips
// ─────────────────────────────────────────────────────────────
function FilterChip({ label, value, isOpen, onClick }) {
  const active = value && value !== '全部';
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} style={{
      height: 30, padding: '0 10px', borderRadius: 999, border: 0,
      background: active ? LL.ink : 'rgba(34,40,44,0.05)',
      color: active ? '#fff' : LL.text,
      fontSize: 12.5, fontWeight: active ? 600 : 500, fontFamily: LL.font,
      display: 'inline-flex', alignItems: 'center', gap: 4,
      cursor: 'pointer', whiteSpace: 'nowrap',
      flex: '0 0 auto',
    }}>
      <span>{active ? value : label}</span>
      <i className={`ph ph-caret-${isOpen ? 'up' : 'down'}`} style={{ fontSize: 10 }} />
    </button>
  );
}

function SortChip({ value, isOpen, onClick }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} style={{
      height: 30, padding: '0 10px', borderRadius: 999, border: 0,
      background: 'transparent', boxShadow: `inset 0 0 0 1px ${LL.border}`,
      color: LL.text, fontSize: 12.5, fontWeight: 500, fontFamily: LL.font,
      display: 'inline-flex', alignItems: 'center', gap: 4,
      cursor: 'pointer', whiteSpace: 'nowrap', flex: '0 0 auto',
    }}>
      <i className="ph ph-arrows-down-up" style={{ fontSize: 12 }} />
      <span>{value}</span>
      <i className={`ph ph-caret-${isOpen ? 'up' : 'down'}`} style={{ fontSize: 10, color: LL.text3 }} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Popover (drops down from filter / sort chip)
// ─────────────────────────────────────────────────────────────
function Popover({ anchor, offsetLeft, offsetRight, options, value, onPick }) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'absolute', top: '100%',
        ...(anchor === 'left'
          ? { left: offsetLeft ?? 12 }
          : { right: offsetRight ?? 12 }),
        marginTop: 4,
        background: '#fff', borderRadius: 14,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
        padding: 6, minWidth: 168, zIndex: 80,
        fontFamily: LL.font,
      }}
    >
      {options.map(o => {
        const on = o === value;
        return (
          <button key={o} onClick={() => onPick(o)} style={{
            width: '100%', padding: '10px 12px', borderRadius: 10, border: 0,
            background: on ? 'rgba(34,40,44,0.06)' : 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontFamily: LL.font, fontSize: 13.5,
            fontWeight: on ? 700 : 500, color: on ? LL.text : LL.text2,
            textAlign: 'left',
          }}>
            <span>{o}</span>
            {on && <i className="ph-fill ph-check-circle" style={{ fontSize: 14, color: LL.ink }} />}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Guardian Card
// ─────────────────────────────────────────────────────────────
function GuardianCard({ g }) {
  const [favorited, setFavorited] = React.useState(g.favorited);
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: 14,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      display: 'flex', flexDirection: 'column', gap: 12,
      fontFamily: LL.font, position: 'relative',
      cursor: 'pointer',
    }}>
      {/* favorite heart in top-right corner */}
      <button
        onClick={(e) => { e.stopPropagation(); setFavorited(!favorited); }}
        aria-label="收藏"
        style={{
          position: 'absolute', top: 12, right: 12,
          width: 30, height: 30, borderRadius: '50%', border: 0,
          background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: favorited ? LL.heart || '#E63946' : LL.text3,
        }}
      >
        <i className={`${favorited ? 'ph-fill' : 'ph'} ph-heart`} style={{ fontSize: 20 }} />
      </button>

      {/* ── Row 1: photo + identity ── */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ position: 'relative', flex: '0 0 auto' }}>
          {g.photo ? (
            <img
              src={g.photo}
              alt={g.name}
              style={{
                width: 64, height: 72, borderRadius: 14, objectFit: 'cover',
                background: LL.butter, display: 'block',
              }}
              onError={(e) => {
                // graceful fallback to colored initial if photo fails
                const fallback = document.createElement('div');
                fallback.innerText = g.name[0];
                fallback.style.cssText = 'width:64px;height:72px;border-radius:14px;background:#FEE7A6;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:26px;color:#1E1E24;';
                e.target.replaceWith(fallback);
              }}
            />
          ) : (
            <div style={{
              width: 64, height: 72, borderRadius: 14,
              background: g.initial.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 700, color: LL.text,
              letterSpacing: '-0.02em',
            }}>{g.initial.char}</div>
          )}
          {g.cert && (
            <div style={{
              position: 'absolute', right: -4, bottom: -4,
              width: 22, height: 22, borderRadius: '50%',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="8" cy="8" r="7.5" fill="#2C7A4B" />
                <path d="M4.6 8.2 L7 10.5 L11.6 5.8" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
          )}
        </div>

        <div style={{
          flex: 1, minWidth: 0, paddingRight: 32,
          display: 'flex', flexDirection: 'column',
          alignSelf: 'stretch', minHeight: 72,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: LL.text, letterSpacing: '-0.01em' }}>
              {g.name}
            </div>
            {g.badge && (
              <span style={{
                background: 'linear-gradient(135deg, #FEE7A6, #FBD3C4)',
                color: '#7A4F1A', fontSize: 10, fontWeight: 700, padding: '2px 7px',
                borderRadius: 4, letterSpacing: '0.04em',
              }}>{g.badge}守护者</span>
            )}
          </div>

          <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: LL.text2, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontVariantNumeric: 'tabular-nums' }}>
              <i className="ph-fill ph-star" style={{ fontSize: 12, color: '#F0B100' }} />
              <span style={{ fontWeight: 700, color: LL.text }}>{g.rating.toFixed(1)}</span>
              <span style={{ color: LL.text3 }}>({g.reviews})</span>
            </span>
            <span style={{ width: 2, height: 2, borderRadius: '50%', background: LL.text3 }} />
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{g.dist} km</span>
            <span style={{ color: LL.text3 }}>·</span>
            <span>{g.city}</span>
          </div>

          {/* one-line bio aligned to bottom of profile picture */}
          {g.bio && (
            <div style={{
              marginTop: 'auto',
              fontSize: 12, color: LL.text2, lineHeight: 1.4,
              overflow: 'hidden', textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{g.bio}{g.bio.endsWith('…') || g.bio.endsWith('...') ? '' : '…'}</div>
          )}
        </div>
      </div>

      {/* ── Combined tag row: 托付过 + feature tags, color-coded by category, single line ── */}
      {(g.reused || (g.features && g.features.length > 0)) && (
        <div style={{
          display: 'flex', gap: 6,
          flexWrap: 'nowrap', overflow: 'hidden',
          marginTop: -4,
        }}>
          {g.reused && <FeatureTag label="托付过" category="relation" />}
          {g.features && g.features.map(f => (
            <FeatureTag key={f} label={f} category={categorizeTag(f)} />
          ))}
        </div>
      )}

      {/* ── Row 4: price (left) + 已服务 (right) ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, borderTop: `1px solid ${LL.border}`, paddingTop: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
          <span style={{ fontSize: 12, color: LL.text2 }}>¥</span>
          <span style={{
            fontSize: 22, fontWeight: 700, color: LL.text,
            letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          }}>{g.price}</span>
          <span style={{ fontSize: 11.5, color: LL.text2, marginLeft: 2 }}>/ {g.unit}起</span>
        </div>
        <div style={{ fontSize: 12, color: LL.text2, display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
          <span>已服务</span>
          <span style={{ fontSize: 15, color: LL.text, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{g.orders}</span>
          <span>单</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tag categorization — groups feature labels by semantic category
// so similar tags get the same color in the card row.
// ─────────────────────────────────────────────────────────────
function categorizeTag(label) {
  if (/认证|急救|兽医|训练师/.test(label)) return 'credential';   // green
  if (/监控|消毒|清洁|无其他|香波|围栏|院子/.test(label))     return 'facility';     // blue
  if (/户外|拍照|视频|报告|遛狗|打卡/.test(label))           return 'service';      // butter
  return 'neutral';
}

function FeatureTag({ label, category }) {
  const palette = {
    relation:   { bg: '#EDE5F7', fg: '#5E4A87' },  // 托付过 — lavender
    credential: { bg: '#E6F1EC', fg: '#2C7A4B' },  // 认证 / 急救 / 兽医 — green
    facility:   { bg: '#E3EEF7', fg: '#2F5F87' },  // 监控 / 消毒 — blue
    service:    { bg: '#FBEFD2', fg: '#7A5A1A' },  // 户外 / 拍照 — butter
    neutral:    { bg: 'rgba(34,40,44,0.05)', fg: LL.text2 },
  };
  const c = palette[category] || palette.neutral;
  return (
    <span style={{
      fontSize: 11, fontWeight: 500,
      color: c.fg, background: c.bg, borderRadius: 4,
      padding: '3px 8px', whiteSpace: 'nowrap', flex: '0 0 auto',
    }}>{label}</span>
  );
}

// ─────────────────────────────────────────────────────────────
// Mini badge (used for availability / favorite / reused markers)
// ─────────────────────────────────────────────────────────────
function Badge({ tone = 'muted', icon, children }) {
  const tones = {
    success: { bg: '#E6F1EC', fg: '#2C7A4B' },
    muted:   { bg: '#F0F0F5', fg: LL.text2 },
    heart:   { bg: '#FCE6E8', fg: '#C2384A' },
    lavender:{ bg: '#EDE5F7', fg: '#5E4A87' },
  };
  const t = tones[tone] || tones.muted;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      background: t.bg, color: t.fg,
      borderRadius: 999, padding: '3px 9px',
      fontSize: 11, fontWeight: 600, letterSpacing: '0.01em',
      fontFamily: LL.font,
    }}>
      {icon && <i className={`ph-fill ph-${icon}`} style={{ fontSize: 11 }} />}
      <span>{children}</span>
    </span>
  );
}

Object.assign(window, { SearchResultsScreen });
