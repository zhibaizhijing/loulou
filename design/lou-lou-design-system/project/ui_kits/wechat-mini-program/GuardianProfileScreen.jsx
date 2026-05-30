// Lou Lou — GuardianProfileScreen.jsx
// 守护者主页 — 陈逸 (三标签页: 信息 / 评价 / 服务)

// ─── Colors ──────────────────────────────────────────────────
const GGREEN         = '#2C7A4B';
const GGREEN_BG      = '#E6F1EC';
const PROFILE_PURPLE    = '#5B3A8F';
const PROFILE_PURPLE_BG = '#D8CAE8';

// ─── Data ────────────────────────────────────────────────────
const CHEN_YI_DATA = {
  id: 'r2',
  name: '陈逸',
  photo: './assets/guardian2.png',
  tagline: '安心可靠，把你的宠物当自己孩子一样对待',
  area: '朝阳区·望京，北京',
  joinedYears: 2,
  rating: 4.9,
  reviewCount: 128,
  orderCount: 230,
  verified: true,
  trained: true,
  bio: '我在望京生活已经5年了，家里养了一只名叫"豆豆"的金毛，她今年3岁，活泼开朗、非常友好。\n\n我从小就喜欢动物，曾参加宠物急救培训并取得证书，也熟悉口服药物管理。我会定期拍照记录寄养日记，让你随时了解爱宠状态，安心出行。',
  skills: ['口服药物管理', '宠物急救证书'],
  ownPets: [
    { id: 'op1', name: '豆豆', breed: '金毛', age: '3岁', bg: '#FEE7A6',
      photo: (window.__resources && window.__resources.galleryPuppy) || '../../uploads/Sleeping Golden Retriever Puppy.png' },
  ],
  home: {
    type: '公寓',
    hasYard: false,
    smoking: false,
    hasPets: false,
    hasChildren: false,
    acceptHeatFemale: false,
    petOnBed: false,
    petOnSofa: false,
    onlyOnePet: true,
    toiletInterval: '每2–4小时',
  },
  services: [
    {
      id: '寄养', sub: '在守护者家', price: 88, unit: '晚',
      petTypes: [
        { type: 'cat', weights: ['0–7', '7–18'] },
        { type: 'dog', weights: ['0–7', '7–18', '18–45'] },
      ],
      extras: [],
      petPricingTabs: [
        {
          type: 'dog', label: '狗',
          weights: [
            { range: '0–7 公斤', price: 88, size: '小型' },
            { range: '7–18 公斤', price: 98, size: '中型' },
            { range: '18–45 公斤', price: 108, size: '大型' },
          ],
          rows: [
            { label: '单间费用', price: '+¥20', info: '拥有单独的房间，不和其他宠物共处一室', accordion: true },
            { label: '节假日加价', price: '+¥17', accordion: true },
            { label: '每加1只', price: '+¥48', accordion: true },
            { label: '幼犬', price: '+¥11', accordion: true },
            { label: '紧急预约附加费', price: '+¥15', info: '预约当天和次日服务为紧急预约', accordion: true },
            { label: '长期订单（7晚+）', price: '-10%' },
            { section: '守护者接送（1来回）', price: '¥30' },
            { label: '超时费', price: '当日价×50%', info: '超时2–8小时收取50%；8小时以上收取100%' },
          ],
        },
        {
          type: 'cat', label: '猫',
          weights: [
            { range: '0–7 公斤', price: 78, size: '普通' },
            { range: '7–18 公斤', price: 88, size: '大型' },
          ],
          rows: [
            { label: '单间费用', price: '+¥20', info: '拥有单独的房间，不和其他宠物共处一室', accordion: true },
            { label: '节假日加价', price: '+¥15', accordion: true },
            { label: '每加1只', price: '+¥40', accordion: true },
            { label: '幼猫', price: '–', accordion: true },
            { label: '紧急预约附加费', price: '+¥15', info: '预约当天和次日服务为紧急预约', accordion: true },
            { label: '长期订单（7晚+）', price: '-10%' },
            { section: '守护者接送（1来回）', price: '¥30' },
            { label: '超时费', price: '当日价×50%', info: '超时2–8小时收取50%；8小时以上收取100%' },
          ],
        },
        {
          type: 'rabbit', label: '兔',
          weights: [
            { range: '0–3 公斤', price: 65, size: '小型' },
            { range: '3–7 公斤', price: 75, size: '大型' },
          ],
          rows: [
            { label: '节假日加价', price: '+¥12', accordion: true },
            { label: '每加1只', price: '+¥28', accordion: true },
            { label: '紧急预约附加费', price: '+¥12', info: '预约当天和次日服务为紧急预约', accordion: true },
            { label: '长期订单（7晚+）', price: '-10%' },
            { section: '守护者接送（1来回）', price: '¥30' },
            { label: '超时费', price: '当日价×50%', info: '超时2–8小时收取50%；8小时以上收取100%' },
          ],
        },
        {
          type: 'hamster', label: '鼠',
          weights: [
            { range: '全体型', price: 45, size: '全部' },
          ],
          rows: [
            { label: '节假日加价', price: '+¥8', accordion: true },
            { label: '每加1只', price: '+¥20', accordion: true },
            { label: '紧急预约附加费', price: '+¥8', info: '预约当天和次日服务为紧急预约', accordion: true },
            { label: '长期订单（7晚+）', price: '-10%' },
            { section: '守护者接送（1来回）', price: '¥30' },
          ],
        },
        {
          type: 'bird', label: '鸟',
          weights: [
            { range: '全体型', price: 48, size: '全部' },
          ],
          rows: [
            { label: '节假日加价', price: '+¥10', accordion: true },
            { label: '每加1只', price: '+¥22', accordion: true },
            { label: '紧急预约附加费', price: '+¥8', info: '预约当天和次日服务为紧急预约', accordion: true },
            { label: '长期订单（7晚+）', price: '-10%' },
            { section: '守护者接送（1来回）', price: '¥30' },
          ],
        },
      ],
    },
    {
      id: '日托', sub: '在守护者家', price: 58, unit: '天',
      petTypes: [
        { type: 'cat', weights: ['0–7', '7–18'] },
        { type: 'dog', weights: ['0–7', '7–18', '18–45'] },
      ],
      extras: [],
      petPricingTabs: [
        {
          type: 'dog', label: '狗',
          weights: [
            { range: '0–7 公斤', price: 58, size: '小型' },
            { range: '7–18 公斤', price: 68, size: '中型' },
            { range: '18–45 公斤', price: 78, size: '大型' },
          ],
          rows: [
            { label: '节假日加价', price: '+¥15', accordion: true },
            { label: '每加1只', price: '+¥35', accordion: true },
            { label: '幼犬', price: '+¥10', accordion: true },
            { label: '紧急预约附加费', price: '+¥10', info: '预约当天和次日服务为紧急预约', accordion: true },
            { label: '长期预约（5天+）', price: '-10%' },
            { section: '守护者接送（1来回）', price: '¥30' },
            { label: '超时费', price: '当日价×50%', info: '超时2–8小时收取50%；8小时以上收取100%' },
          ],
        },
        {
          type: 'cat', label: '猫',
          weights: [
            { range: '0–7 公斤', price: 50, size: '普通' },
            { range: '7–18 公斤', price: 60, size: '大型' },
          ],
          rows: [
            { label: '节假日加价', price: '+¥12', accordion: true },
            { label: '每加1只', price: '+¥30', accordion: true },
            { label: '幼猫', price: '–', accordion: true },
            { label: '紧急预约附加费', price: '+¥10', info: '预约当天和次日服务为紧急预约', accordion: true },
            { label: '长期预约（5天+）', price: '-10%' },
            { section: '守护者接送（1来回）', price: '¥30' },
            { label: '超时费', price: '当日价×50%', info: '超时2–8小时收取50%；8小时以上收取100%' },
          ],
        },
        {
          type: 'rabbit', label: '兔',
          weights: [
            { range: '0–3 公斤', price: 55, size: '小型' },
            { range: '3–7 公斤', price: 62, size: '大型' },
          ],
          rows: [
            { label: '节假日加价', price: '+¥10', accordion: true },
            { label: '每加1只', price: '+¥25', accordion: true },
            { label: '紧急预约附加费', price: '+¥8', info: '预约当天和次日服务为紧急预约', accordion: true },
            { label: '长期预约（5天+）', price: '-10%' },
            { section: '守护者接送（1来回）', price: '¥30' },
            { label: '超时费', price: '当日价×50%', info: '超时2–8小时收取50%；8小时以上收取100%' },
          ],
        },
        {
          type: 'hamster', label: '鼠',
          weights: [
            { range: '全体型', price: 38, size: '全部' },
          ],
          rows: [
            { label: '节假日加价', price: '+¥6', accordion: true },
            { label: '每加1只', price: '+¥15', accordion: true },
            { label: '紧急预约附加费', price: '+¥6', info: '预约当天和次日服务为紧急预约', accordion: true },
            { label: '长期预约（5天+）', price: '-10%' },
            { section: '守护者接送（1来回）', price: '¥30' },
          ],
        },
        {
          type: 'bird', label: '鸟',
          weights: [
            { range: '全体型', price: 40, size: '全部' },
          ],
          rows: [
            { label: '节假日加价', price: '+¥8', accordion: true },
            { label: '每加1只', price: '+¥18', accordion: true },
            { label: '紧急预约附加费', price: '+¥6', info: '预约当天和次日服务为紧急预约', accordion: true },
            { label: '长期预约（5天+）', price: '-10%' },
            { section: '守护者接送（1来回）', price: '¥30' },
          ],
        },
      ],
    },
    {
      id: '遛狗', sub: '在你的小区周边', price: 38, unit: '次',
      petTypes: [
        { type: 'dog', weights: ['0–7', '7–18', '18–45', '45+'] },
      ],
      extras: [
        { label: '60分钟遛狗', price: '+18', unit: '次' },
      ],
    },
    {
      id: '上门喂养', sub: '在宠物主家', price: 30, unit: '次',
      petTypes: [
        { type: 'cat', weights: ['0–7', '7–18', '18–45'] },
        { type: 'dog', weights: ['0–7', '7–18', '18–45', '45+'] },
      ],
      extras: [],
    },
    {
      id: '伴宠留宿', sub: '在宠物主家', price: 108, unit: '晚',
      petTypes: [
        { type: 'cat', weights: ['0–7', '7–18', '18–45'] },
        { type: 'dog', weights: ['0–7', '7–18', '18–45', '45+'] },
      ],
      extras: [
        { label: '节假日费率', price: 130, unit: '晚' },
      ],
    },
  ],
  reviews: [
    { id: 1, phone: '138****8888', pet: '金毛·3岁',   rating: 5, service: '寄养',    date: '2026-05-10',
      text: '陈逸非常负责，每天发照片和视频，豆豆玩得很开心！回来状态特别好，下次还会选择她。' },
    { id: 2, phone: '136****2233', pet: '布偶猫·2岁', rating: 5, service: '寄养',    date: '2026-04-28',
      text: '家里干净整洁，猫咪很快就适应了。陈逸会定期发照片，非常贴心，强烈推荐！' },
    { id: 3, phone: '189****5566', pet: '柴犬·4岁',   rating: 5, service: '遛狗',    date: '2026-04-15',
      text: '遛狗服务很专业，每次准时，还会发遛狗路线图和照片，太满意了。' },
    { id: 4, phone: '177****3344', pet: '泰迪·1岁',   rating: 4, service: '日托',    date: '2026-03-22',
      text: '总体很好，狗狗回来精神不错。偶尔回复稍慢，下次还会预约。' },
    { id: 5, phone: '151****7788', pet: '英短·5岁',   rating: 5, service: '上门喂养', date: '2026-03-08',
      text: '上门喂养准时，每次拍照汇报，猫咪状态很好，非常放心！' },
    { id: 6, phone: '139****9900', pet: '边牧·2岁',   rating: 5, service: '伴宠留宿', date: '2026-02-14',
      text: '陈逸很有爱心，狗狗非常喜欢她。整个守护期间每天有详细报告，超级安心。' },
    { id: 7, phone: '135****1122', pet: '萨摩耶·3岁', rating: 4, service: '寄养',    date: '2026-01-30',
      text: '服务很好，整体体验很棒，下次还会预约。' },
    { id: 8, phone: '186****4455', pet: '柯基·4岁',   rating: 5, service: '寄养',    date: '2026-01-18',
      text: '超棒的守护者，狗狗完全不想回家！环境好，陈逸非常有耐心。' },
  ],
  starDist: { 5: 89, 4: 8, 3: 3 },
  bookedDates: [
    '2026-05-25','2026-05-26','2026-05-27','2026-05-30','2026-05-31',
    '2026-06-06','2026-06-07','2026-06-13','2026-06-14','2026-06-20','2026-06-21',
  ],
  photos: [
    (window.__resources && window.__resources.galleryPuppy) || '../../uploads/Sleeping Golden Retriever Puppy.png',
    (window.__resources && window.__resources.galleryRoom) || '../../uploads/Bright Sunlit Room.png',
    (window.__resources && window.__resources.galleryLiving) || '../../uploads/Cozy Living Room Decor.png',
  ],
  // Pet type sections for ServicesTab
  petTypeSections: [
    {
      title: '陈逸可以寄养',
      pets: [
        { type: 'cat', weights: ['0–7', '7–18'] },
        { type: 'dog', weights: ['0–7', '7–18', '18–45'] },
      ],
    },
    {
      title: '陈逸可以上门照看',
      pets: [
        { type: 'cat', weights: ['0–7', '7–18', '18–45'] },
        { type: 'dog', weights: ['0–7', '7–18', '18–45', '45+'] },
      ],
    },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────
function Stars({ count = 5, size = 12 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[0,1,2,3,4].map(i => (
        <i key={i}
          className={i < count ? 'ph-fill ph-star' : 'ph ph-star'}
          style={{ fontSize: size, color: i < count ? '#F0B100' : '#DDD', lineHeight: 1 }}
        />
      ))}
    </span>
  );
}

function Divider() {
  return <div style={{ height: 1, background: LL.border, margin: '0 0 18px' }} />;
}

function SecHead({ title }) {
  return (
    <div style={{
      fontSize: 15, fontWeight: 700, color: LL.text,
      marginBottom: 12,
    }}>{title}</div>
  );
}

// Icon with optional blocked (🚫) overlay
function HomeIcon({ name, blocked = false }) {
  return (
    <div style={{ position: 'relative', width: 20, height: 20, flex: '0 0 auto' }}>
      <i className={`ph ph-${name}`}
        style={{ fontSize: 20, color: blocked ? '#C0C0C0' : '#6B6B7A', display: 'block', lineHeight: 1 }}
      />
      {blocked && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          style={{ position: 'absolute', top: -2, left: -2, pointerEvents: 'none' }}>
          <circle cx="12" cy="12" r="10.5" stroke="#CC2200" strokeWidth="1.5" />
          <line x1="4.5" y1="4.5" x2="19.5" y2="19.5" stroke="#CC2200" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
}

// ─── Photo Carousel ───────────────────────────────────────────
function PhotoCarousel({ photos = [] }) {
  const [idx, setIdx] = React.useState(0);
  const n = photos.length;
  if (!n) return null;

  return (
    <div style={{ position: 'relative', height: 240, overflow: 'hidden', background: LL.lavender }}>
      {/* Sliding strip */}
      <div style={{
        display: 'flex', height: '100%',
        transform: `translateX(-${idx * 100}%)`,
        transition: 'transform 260ms ease',
      }}>
        {photos.map((src, i) => (
          <img key={i} src={src} alt="" style={{
            flex: '0 0 100%', width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center', display: 'block',
          }} onError={e => { e.target.style.background = LL.lavender; }} />
        ))}
      </div>

      {/* Left arrow */}
      {idx > 0 && (
        <button onClick={() => setIdx(i => i - 1)} style={{
          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
          width: 30, height: 30, borderRadius: '50%', border: 0,
          background: 'rgba(255,255,255,0.82)',
          boxShadow: '0 1px 6px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <i className="ph ph-caret-left" style={{ fontSize: 15, color: LL.text }} />
        </button>
      )}
      {/* Right arrow */}
      {idx < n - 1 && (
        <button onClick={() => setIdx(i => i + 1)} style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          width: 30, height: 30, borderRadius: '50%', border: 0,
          background: 'rgba(255,255,255,0.82)',
          boxShadow: '0 1px 6px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        }}>
          <i className="ph ph-caret-right" style={{ fontSize: 15, color: LL.text }} />
        </button>
      )}

      {/* Dot indicators */}
      <div style={{
        position: 'absolute', bottom: 10, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 5,
      }}>
        {photos.map((_, i) => (
          <div key={i} onClick={() => setIdx(i)} style={{
            width: i === idx ? 16 : 6, height: 6, borderRadius: 3,
            background: i === idx ? '#fff' : 'rgba(255,255,255,0.55)',
            transition: 'width 200ms ease', cursor: 'pointer',
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Sticky Profile Nav (white, always visible at top) ────────
function StickyProfileNav({ name, onBack }) {
  return (
    <div style={{
      position: 'sticky', top: 47, zIndex: 21,
      height: 52, background: '#fff', borderBottom: `1px solid ${LL.border}`,
      display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
    }}>
      {/* Back */}
      <button onClick={onBack} style={{
        width: 34, height: 34, borderRadius: '50%', border: 0,
        background: LL.bg, color: LL.text, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
      }}>
        <i className="ph ph-caret-left" style={{ fontSize: 17 }} />
      </button>

      {/* Title */}
      <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700, color: LL.text }}>
        守护者主页
      </div>

      {/* placeholder to balance back button */}
      <div style={{ width: 34, flex: '0 0 auto' }} />
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────
function ProfileHero({ g, liked, onLike }) {
  const photoSrc = (window.__resources && window.__resources.guardian2) || g.photo;
  const photos   = (g.photos && g.photos.length) ? g.photos : [photoSrc];

  return (
    <div style={{ background: LL.surface }}>
      {/* Photo carousel + overlaid action buttons */}
      <div style={{ position: 'relative' }}>
        <PhotoCarousel photos={photos} />
        {/* Share + Heart — bottom-right of carousel */}
        <div style={{
          position: 'absolute', bottom: 12, right: 12,
          display: 'flex', gap: 8, zIndex: 5,
        }}>
          <button style={{
            width: 34, height: 34, borderRadius: '50%',
            border: 0, background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 1px 6px rgba(0,0,0,0.18)',
          }}>
            <i className="ph ph-share-network" style={{ fontSize: 16, color: LL.text2 }} />
          </button>
          <button onClick={onLike} style={{
            width: 34, height: 34, borderRadius: '50%',
            border: 0,
            background: liked ? 'rgba(255,240,240,0.92)' : 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 1px 6px rgba(0,0,0,0.18)',
            transition: 'background 140ms',
          }}>
            <i className={liked ? 'ph-fill ph-heart' : 'ph ph-heart'}
              style={{ fontSize: 16, color: liked ? '#E63946' : LL.text3 }} />
          </button>
        </div>
      </div>

      {/* Info block — avatar overlaps carousel bottom */}
      <div style={{ padding: '0 16px 14px', position: 'relative' }}>
        {/* Avatar */}
        <div style={{
          position: 'absolute', top: -32, left: 16,
          width: 64, height: 64, borderRadius: '50%',
          border: '3px solid #fff', overflow: 'hidden',
          background: LL.lavender,
          boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
        }}>
          <img src={photoSrc} alt={g.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
          />
        </div>

        {/* Spacer to clear the avatar */}
        <div style={{ paddingTop: 40 }} />
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: LL.text, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {g.name}
          </div>
          <div style={{ fontSize: 13, color: LL.text2, marginBottom: 3 }}>{g.tagline}</div>
          <div style={{ fontSize: 12.5, color: LL.text3, marginBottom: 3 }}>{g.area}</div>
          <div style={{ fontSize: 12.5, color: LL.text3 }}>
            <span style={{ fontWeight: 700, color: LL.text }}>{g.reviewCount}</span> 条评价
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────
const TABS = [
  { id: 'info',     label: '信息' },
  { id: 'services', label: '服务' },
];

function TabNav({ active, onChange }) {
  return (
    <div style={{
      display: 'flex',
      borderBottom: `1px solid ${LL.border}`,
      background: LL.surface,
      position: 'sticky', top: 0, zIndex: 19,
    }}>
      {TABS.map(t => {
        const on = t.id === active;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            flex: 1, height: 44, border: 0, background: 'transparent',
            fontSize: 14, fontWeight: on ? 700 : 500,
            color: on ? LL.text : LL.text3,
            borderBottom: on ? `2px solid ${LL.text}` : '2px solid transparent',
            cursor: 'pointer', fontFamily: LL.font,
            transition: 'color 160ms, border-color 160ms',
          }}>{t.label}</button>
        );
      })}
    </div>
  );
}

// ─── Shared Guardian Calendar ────────────────────────────────
// Used in both GuardianProfileScreen (viewOnly) and BookingFlowScreen (interactive)
function GuardianCalendar({
  bookedDates = [],
  svcPrice    = null,   // number, shown below available dates (null = hide)
  svcUnit     = '晚',
  viewOnly    = true,
  start       = null,   // Date | null  (interactive mode)
  end         = null,   // Date | null
  onChange,             // ({start,end}) => void
  scroll      = false,  // true → vertically-stacked multi-month view
  monthsCount = 9,      // how many months to render in scroll mode
}) {
  const bookedSet = React.useMemo(() => new Set(bookedDates), [bookedDates]);
  const TODAY     = new Date(2026, 4, 27);
  const [mo, setMo] = React.useState(0);

  const MNAMES = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
  const WD     = ['日','一','二','三','四','五','六'];

  const sameDate = (a, b) => a && b && a.getFullYear()===b.getFullYear()
                              && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();

  const LABEL_H = 12;
  const BOX_H   = 28;
  const PRICE_H = svcPrice !== null ? 13 : 0;

  const handleTap = (dt, past, booked) => {
    if (viewOnly || past || booked) return;
    if (!start || (start && end)) { onChange?.({ start: dt, end: null }); }
    else if (dt <= start)          { onChange?.({ start: dt, end: null }); }
    else                           { onChange?.({ start, end: dt }); }
  };

  // ── Render the 7-col day grid for one (year, month) ──────────
  function renderMonthGrid(year, month) {
    const firstDow    = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const toDate = d => new Date(year, month, d);
    const toKey  = d => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:0 }}>
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} style={{ height: LABEL_H+BOX_H+PRICE_H+2 }} />;

          const dt       = toDate(d);
          const past     = dt < TODAY;
          const today    = month === TODAY.getMonth() && year === TODAY.getFullYear() && d === TODAY.getDate();
          const booked   = bookedSet.has(toKey(d));
          const avail    = !past && !booked;
          const isStartD = !viewOnly && sameDate(dt, start);
          const isEndD   = !viewOnly && sameDate(dt, end);
          const isInRangeD = !viewOnly && start && end && dt > start && dt < end;
          const isEdge   = isStartD || isEndD;
          const isSingleDay = start && end && sameDate(start, end);
          const hasRange = start && end && !isSingleDay;
          const clickable = !viewOnly && avail;

          let color = LL.text, fw = 400;
          let cellBg = 'transparent', cellRadius = 0;
          if      (past)               { color = '#C8C8C8'; }
          else if (booked)             { color = '#C2C2CC'; }
          else if (isEdge)             { cellBg = PROFILE_PURPLE; color = '#fff'; fw = 700; cellRadius = 8; }
          else if (today && viewOnly)  { cellBg = PROFILE_PURPLE; color = '#fff'; fw = 700; cellRadius = 8; }
          else if (avail || isInRangeD){ color = PROFILE_PURPLE; fw = avail ? 600 : 500; }

          const showPrice  = avail && svcPrice !== null && !past;
          const priceColor = PROFILE_PURPLE;

          return (
            <div key={d} onClick={() => handleTap(dt, past, booked)} style={{
              position:'relative',
              display:'flex', flexDirection:'column', alignItems:'center', paddingTop:1,
              cursor: clickable ? 'pointer':'default',
              opacity: past ? 0.38 : 1,
            }}>
              {!viewOnly && isInRangeD && (
                <div style={{ position:'absolute', top:LABEL_H+1, left:0, right:0, height:BOX_H,
                  background:PROFILE_PURPLE_BG, zIndex:0 }}/>
              )}
              {!viewOnly && isStartD && hasRange && (
                <div style={{ position:'absolute', top:LABEL_H+1, left:'50%', right:0, height:BOX_H,
                  background:PROFILE_PURPLE_BG, zIndex:0 }}/>
              )}
              {!viewOnly && isEndD && hasRange && (
                <div style={{ position:'absolute', top:LABEL_H+1, right:'50%', left:0, height:BOX_H,
                  background:PROFILE_PURPLE_BG, zIndex:0 }}/>
              )}

              <div style={{
                height:LABEL_H, fontSize:8.5, fontWeight:700,
                display:'flex', alignItems:'center', justifyContent:'center',
                color: isEdge ? 'rgba(255,255,255,0.7)' : PROFILE_PURPLE,
                visibility: today ? 'visible':'hidden', width:'100%',
                position:'relative', zIndex:1,
              }}>今天</div>

              <div style={{
                position:'relative', zIndex:1,
                minWidth:BOX_H, height:BOX_H, borderRadius:cellRadius,
                background:cellBg, color, fontSize:13, fontWeight:fw,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontVariantNumeric:'tabular-nums',
                padding: isEdge ? '0 4px' : 0,
              }}>{d}</div>

              {svcPrice !== null && (
                <div style={{
                  height:PRICE_H, fontSize:9.5, fontWeight:600,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  color: showPrice ? priceColor : 'transparent',
                  fontVariantNumeric:'tabular-nums',
                  position:'relative', zIndex:1,
                }}>{showPrice ? `¥${svcPrice}` : '.'}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Sticky weekday header row
  const weekdayHeader = (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'6px 0 8px',
      background:'#fff', position:'sticky', top:0, zIndex:5 }}>
      {WD.map(d => (
        <div key={d} style={{ textAlign:'center', fontSize:11.5, color:LL.text3, fontWeight:500 }}>{d}</div>
      ))}
    </div>
  );

  const legend = (
    <div>
      <div style={{ display:'flex', gap:16, marginTop:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:12, height:12, borderRadius:3, background:PROFILE_PURPLE_BG,
            boxShadow:`inset 0 0 0 1px ${PROFILE_PURPLE}` }} />
          <span style={{ fontSize:11.5, color:PROFILE_PURPLE }}>空闲可约</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:12, height:12, borderRadius:3, background:'#F0F0F5' }} />
          <span style={{ fontSize:11.5, color:LL.text3 }}>已预约</span>
        </div>
      </div>
      <div style={{ fontSize:11.5, color:LL.text3, marginTop:6 }}>日历最后更新于 4 天前</div>
    </div>
  );

  // ── Scroll mode: stacked months, scrollable container ────────
  if (scroll) {
    const baseY = 2026, baseM = 4;
    const months = [];
    for (let i = 0; i < monthsCount; i++) {
      const m = (baseM + i) % 12;
      const y = baseY + Math.floor((baseM + i) / 12);
      months.push({ y, m });
    }
    return (
      <div>
        {weekdayHeader}
        <div style={{ maxHeight:360, overflowY:'auto', WebkitOverflowScrolling:'touch', margin:'0 -2px', padding:'0 2px' }}>
          {months.map(({ y, m }) => (
            <div key={`${y}-${m}`} style={{ marginBottom:18 }}>
              <div style={{ fontSize:16, fontWeight:800, color:LL.text, padding:'6px 2px 10px' }}>
                {MNAMES[m]} {y}
              </div>
              {renderMonthGrid(y, m)}
            </div>
          ))}
        </div>
        {legend}
      </div>
    );
  }

  // ── Single-month mode (view-only profile) ────────────────────
  const year = 2026, month = 4 + mo;
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <button onClick={() => setMo(m => Math.max(0, m-1))} disabled={mo===0} style={{
          width:30, height:30, borderRadius:'50%', border:0, background:'transparent',
          cursor: mo===0 ? 'default':'pointer', color: mo===0 ? '#CCC':LL.text,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}><i className="ph ph-caret-left" style={{ fontSize:14 }} /></button>
        <span style={{ fontSize:14, fontWeight:600, color:LL.text }}>
          {year}年 {MNAMES[month]}
        </span>
        <button onClick={() => setMo(m => Math.min(2, m+1))} style={{
          width:30, height:30, borderRadius:'50%', border:0, background:'transparent',
          cursor:'pointer', color:LL.text,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}><i className="ph ph-caret-right" style={{ fontSize:14 }} /></button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:2 }}>
        {WD.map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:11, color:LL.text3, fontWeight:500, paddingBottom:4 }}>
            {d}
          </div>
        ))}
      </div>

      {renderMonthGrid(year, month)}

      {legend}
    </div>
  );
}

// ─── Calendar (inside 信息 tab) ───────────────────────────────
function CalendarBlock({ bookedDates, guardianServices, onViewServices }) {
  const [selectedSvc, setSelectedSvc] = React.useState(guardianServices?.[0]?.id || '寄养');
  const [svcOpen,     setSvcOpen]     = React.useState(false);

  const svcOptions = guardianServices?.map(s => s.id) || ['寄养'];
  const svcData    = guardianServices?.find(s => s.id === selectedSvc);

  return (
    <div>
      <SecHead title="可用日期" />

      {/* ── Service selector row ── */}
      <div style={{ position:'relative', marginBottom:14 }}>
        <div style={{
          display:'flex', alignItems:'center',
          border:`1px solid ${LL.border}`, borderRadius:8, padding:'10px 14px',
        }}>
          <span style={{ fontSize:11, color:LL.text3, flex:'0 0 auto', marginRight:4 }}>服务类型：</span>
          <button onClick={() => setSvcOpen(o => !o)} style={{
            display:'flex', alignItems:'center', gap:4, flex:1,
            background:'transparent', border:0, padding:0, cursor:'pointer', fontFamily:LL.font,
          }}>
            <span style={{ fontSize:13.5, fontWeight:600, color:LL.text }}>{selectedSvc}</span>
            <i className={`ph ph-caret-${svcOpen?'up':'down'}`} style={{ fontSize:11, color:LL.text3 }} />
          </button>
          <div style={{ width:1, height:14, background:LL.border, margin:'0 10px', flex:'0 0 auto' }} />
          <button onClick={() => { setSvcOpen(false); onViewServices?.(); }} style={{
            background:'transparent', border:0, padding:0, cursor:'pointer',
            fontFamily:LL.font, fontSize:12, fontWeight:600, color:PROFILE_PURPLE, flex:'0 0 auto',
          }}>查看详情</button>
        </div>
        {/* Inline service popover */}
        {svcOpen && (
          <div style={{
            position:'absolute', top:'100%', left:0, right:0, marginTop:4,
            background:'#fff', borderRadius:10, zIndex:30,
            boxShadow:'0 4px 20px rgba(0,0,0,0.14)',
            border:`1px solid ${LL.border}`, overflow:'hidden',
          }}>
            {svcOptions.map((opt, i) => (
              <button key={opt} onClick={() => { setSelectedSvc(opt); setSvcOpen(false); }} style={{
                width:'100%', padding:'12px 14px', background:'transparent', border:0,
                borderBottom: i < svcOptions.length-1 ? `1px solid ${LL.border}` : 'none',
                cursor:'pointer', fontFamily:LL.font,
                display:'flex', alignItems:'center', justifyContent:'space-between',
                fontSize:14, fontWeight: selectedSvc===opt ? 700:500, color:LL.text, textAlign:'left',
              }}>
                {opt}
                {selectedSvc===opt && <i className="ph-fill ph-check" style={{ fontSize:14, color:PROFILE_PURPLE }} />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Shared calendar — view-only, with price display */}
      <GuardianCalendar
        bookedDates={bookedDates}
        svcPrice={svcData?.price ?? null}
        svcUnit={svcData?.unit ?? '晚'}
        viewOnly={true}
      />
    </div>
  );
}

// ─── 信息 Tab ─────────────────────────────────────────────────
function InfoTab({ g, onViewServices, onViewAllReviews }) {
  const [bioExp,        setBioExp]        = React.useState(false);
  const [homeExp,       setHomeExp]       = React.useState(false);
  const [expandedPetId, setExpandedPetId] = React.useState(null);
  const AVAS = [LL.butter, LL.lavender, LL.mint, LL.peach];
  const BIO_LIMIT = 75;
  const bioShort   = g.bio.replace(/\n/g, ' ').slice(0, BIO_LIMIT);
  const bioTooLong = g.bio.replace(/\n/g, '').length > BIO_LIMIT;

  const h = g.home;
  const homeItems = [
    { icon: 'house',          text: `住${h.type}`,                                    blocked: false },
    { icon: 'tree',           text: h.hasYard       ? '有院子'       : '无院子',       blocked: !h.hasYard },
    { icon: 'wind',           text: h.smoking       ? '吸烟家庭'     : '无烟家庭',     blocked: h.smoking },
    { icon: 'paw-print',      text: h.hasPets       ? '家中有其他宠物' : '家中无其他宠物', blocked: h.hasPets },
    { icon: 'user',           text: h.hasChildren   ? '家中有儿童'   : '家中无儿童',   blocked: h.hasChildren },
    { icon: 'gender-female',  text: h.acceptHeatFemale ? '接受发情期母犬' : '不接受发情期母犬', blocked: !h.acceptHeatFemale },
    { icon: 'bed',            text: h.petOnBed      ? '允许宠物上床'  : '不允许宠物上床',  blocked: !h.petOnBed },
    { icon: 'armchair',       text: h.petOnSofa     ? '允许宠物上沙发' : '不允许宠物上沙发', blocked: !h.petOnSofa },
    { icon: 'user-circle',    text: '每次仅接待1只宠物',                                blocked: false },
    { icon: 'clock',          text: `如厕：${h.toiletInterval}`,                       blocked: false },
  ];

  return (
    <div style={{ padding: '18px 16px 24px', background: LL.surface }}>

      {/* About */}
      <SecHead title={`关于${g.name}`} />
      {/* Skills as chips at the top of About */}
      {g.skills && g.skills.length > 0 && (
        <div style={{ display:'flex', gap:7, flexWrap:'wrap', marginBottom:12 }}>
          {g.skills.map((s, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:5,
              background:GGREEN_BG, color:GGREEN, borderRadius:999,
              padding:'4px 11px', fontSize:12, fontWeight:600 }}>
              <i className="ph ph-check-circle" style={{ fontSize:13, flex:'0 0 auto' }} />
              {s}
            </div>
          ))}
        </div>
      )}
      <div style={{
        fontSize: 13.5, color: LL.text2, lineHeight: 1.75, marginBottom: 6,
        textWrap: 'pretty', whiteSpace: 'pre-wrap',
      }}>
        {!bioExp && bioTooLong ? bioShort + '…' : g.bio}
      </div>
      {bioTooLong && (
        <button onClick={() => setBioExp(e => !e)} style={{
          background: 'transparent', border: 0, padding: 0, marginBottom: 18,
          fontSize: 13, fontWeight: 600, color: LL.text,
          cursor: 'pointer', fontFamily: LL.font,
          display: 'inline-flex', alignItems: 'center', gap: 3,
        }}>
          {bioExp ? '收起' : '阅读更多'}
          <i className={`ph ph-caret-${bioExp ? 'up' : 'down'}`} style={{ fontSize: 11 }} />
        </button>
      )}
      {!bioTooLong && <div style={{ marginBottom: 18 }} />}

      {/* My Pets */}
      {g.ownPets && g.ownPets.length > 0 && (
        <>
          <Divider />
          <SecHead title="我的宠物" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {g.ownPets.map(pet => (
              <button key={pet.id} onClick={() => {}}
                style={{ display:'flex', alignItems:'center', gap:12,
                  background:LL.bg, border:0, cursor:'pointer', fontFamily:LL.font,
                  borderRadius:12, padding:'10px 12px', textAlign:'left', width:'100%' }}>
                <div style={{ width:52, height:52, borderRadius:'50%', overflow:'hidden',
                  background:pet.bg || LL.butter, flex:'0 0 auto',
                  border:`1.5px solid ${LL.border}` }}>
                  <img src={pet.photo} alt={pet.name}
                    style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }}
                    onError={e => { e.target.style.display = 'none'; }} />
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:LL.text }}>{pet.name}</div>
                  <div style={{ fontSize:12, color:LL.text2, marginTop:2 }}>{pet.breed} · {pet.age}</div>
                </div>
                <i className="ph ph-caret-right" style={{ fontSize:14, color:LL.text3, flex:'0 0 auto' }} />
              </button>
            ))}
          </div>
        </>
      )}

      <Divider />

      {/* Home */}
      <SecHead title="我的家" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginBottom: 10 }}>
        {(homeExp ? homeItems : homeItems.slice(0, 5)).map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <HomeIcon name={item.icon} blocked={item.blocked} />
            <span style={{ fontSize: 13.5, color: item.blocked ? '#ABABAB' : LL.text2, lineHeight: 1.4 }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>
      <button onClick={() => setHomeExp(e => !e)} style={{
        background: 'transparent', border: 0, padding: 0, marginBottom: 20,
        fontSize: 13, fontWeight: 600, color: LL.text2,
        cursor: 'pointer', fontFamily: LL.font,
        display: 'inline-flex', alignItems: 'center', gap: 3,
      }}>
        {homeExp ? '收起' : `查看全部（${homeItems.length - 5} 项）`}
        <i className={`ph ph-caret-${homeExp ? 'up' : 'down'}`} style={{ fontSize: 11 }} />
      </button>

      <Divider />

      {/* Home — 2-column layout (comparison) */}
      <SecHead title="我的家" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: 20 }}>
        {homeItems.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <HomeIcon name={item.icon} blocked={item.blocked} />
            <span style={{ fontSize: 12.5, color: item.blocked ? '#ABABAB' : LL.text2, lineHeight: 1.45 }}>
              {item.text}
            </span>
          </div>
        ))}
      </div>

      {/* User reviews preview */}
      {g.reviews && g.reviews.length > 0 && (
        <>
          <Divider />
          <div style={{ display:'flex', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontSize:15, fontWeight:700, color:LL.text, flex:1 }}>用户评价</div>
            <button onClick={onViewAllReviews} style={{ display:'flex', alignItems:'center', gap:5,
              background:'transparent', border:0, cursor:'pointer', fontFamily:LL.font, padding:0 }}>
              <i className="ph-fill ph-star" style={{ fontSize:12, color:'#F0B100' }} />
              <span style={{ fontSize:13, fontWeight:700, color:LL.text }}>{g.rating}</span>
              <span style={{ fontSize:12, color:LL.text3 }}>({g.reviewCount}条)</span>
              <i className="ph ph-caret-right" style={{ fontSize:13, color:LL.text2, marginLeft:2 }} />
            </button>
          </div>
          {g.reviews.slice(0, 2).map((r, idx) => (
            <div key={r.id} style={{
              paddingTop: idx > 0 ? 16 : 0,
              marginTop: idx > 0 ? 16 : 0,
              borderTop: idx > 0 ? `1px solid ${LL.border}` : 'none',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{ width:36, height:36, borderRadius:'50%',
                  background:AVAS[r.id % AVAS.length],
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:11, fontWeight:700, color:LL.text, flex:'0 0 auto' }}>
                  {r.phone.slice(0,3)}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:LL.text }}>{r.phone}</div>
                  <div style={{ fontSize:11, color:LL.text3 }}>{r.pet}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:LL.text }}>{r.rating.toFixed(1)}</span>
                  <i className="ph-fill ph-star" style={{ fontSize:12, color:'#F0B100' }} />
                </div>
              </div>
              <div style={{ fontSize:13, color:LL.text2, lineHeight:1.7, paddingLeft:46,
                display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                {r.text}
              </div>
            </div>
          ))}
          <button onClick={onViewAllReviews} style={{ width:'100%', height:40, marginTop:14,
            borderRadius:999, border:`1px solid ${LL.border}`, background:'transparent',
            fontSize:13, fontWeight:600, color:LL.text2, cursor:'pointer', fontFamily:LL.font,
            display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
            查看全部评价（{g.reviewCount}条）
            <i className="ph ph-caret-right" style={{ fontSize:11 }} />
          </button>
        </>
      )}

      <Divider />

      {/* Location */}
      <SecHead title="位置" />
      <div style={{ fontSize: 13.5, color: LL.text2, marginBottom: 10 }}>{g.area}</div>
      <div style={{ borderRadius: 10, overflow: 'hidden', height: 150, background: '#D8E8F0', marginBottom: 20, position: 'relative' }}>
        <img src={(window.__resources && window.__resources.mapImg) || './assets/map.png'} alt="地图位置"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        {/* Service radius circle overlay */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
        }}>
          <div style={{
            width: 110, height: 110, borderRadius: '50%',
            background: 'rgba(44,122,75,0.18)',
            border: '1.5px solid rgba(44,122,75,0.45)',
          }} />
        </div>
      </div>

      <Divider />

      {/* Calendar */}
      <CalendarBlock
        bookedDates={g.bookedDates}
        guardianServices={g.services}
        onViewServices={onViewServices}
      />
    </div>
  );
}

// ─── 评价 Tab ─────────────────────────────────────────────────
function ReviewsTab({ g }) {
  const [showAll, setShowAll] = React.useState(false);
  const shown = showAll ? g.reviews : g.reviews.slice(0, 6);
  const AVAS  = [LL.butter, LL.lavender, LL.mint, LL.peach, '#D4E8F7', '#F7D4E8'];

  return (
    <div style={{ background: LL.surface }}>
      {/* Rating overview */}
      <div style={{
        padding: '16px 16px 14px',
        display: 'flex', gap: 20, alignItems: 'center',
        borderBottom: `1px solid ${LL.border}`,
      }}>
        <div style={{ textAlign: 'center', flex: '0 0 auto' }}>
          <div style={{
            fontSize: 46, fontWeight: 800, color: LL.text,
            lineHeight: 1, letterSpacing: '-0.03em', marginBottom: 4,
          }}>{g.rating}</div>
          <Stars count={5} size={13} />
          <div style={{ fontSize: 11.5, color: LL.text3, marginTop: 5 }}>{g.reviewCount} 条评价</div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[5, 4, 3].map(n => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11.5, color: LL.text3, width: 8 }}>{n}</span>
              <i className="ph-fill ph-star" style={{ fontSize: 10, color: '#F0B100', flex: '0 0 auto' }} />
              <div style={{ flex: 1, height: 5, borderRadius: 3, background: '#EBEBEB' }}>
                <div style={{
                  width: `${g.starDist[n] || 0}%`, height: '100%',
                  background: '#F0B100', borderRadius: 3,
                }} />
              </div>
              <span style={{ fontSize: 11.5, color: LL.text3, minWidth: 26, textAlign: 'right' }}>
                {g.starDist[n] || 0}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review cards */}
      {shown.map(r => (
        <div key={r.id} style={{ padding: '14px 16px', borderBottom: `1px solid ${LL.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', flex: '0 0 auto',
              background: AVAS[r.id % AVAS.length],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: LL.text,
            }}>{r.phone.slice(0, 3)}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: LL.text }}>{r.phone}</div>
              <div style={{ fontSize: 11.5, color: LL.text3 }}>{r.pet}</div>
            </div>
            <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
              <Stars count={r.rating} size={11} />
              <div style={{ fontSize: 11.5, color: LL.text3, marginTop: 3 }}>
                {r.date.slice(0, 7)}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 13.5, color: LL.text2, lineHeight: 1.65, textWrap: 'pretty' }}>
            {r.text}
          </div>
          <div style={{
            marginTop: 8, display: 'inline-flex', alignItems: 'center', gap: 3,
            background: '#F5F5FA', borderRadius: 5, padding: '3px 9px',
            fontSize: 11.5, color: LL.text3,
          }}>
            <i className="ph ph-tag" style={{ fontSize: 11 }} />
            {r.service}
          </div>
        </div>
      ))}

      {g.reviews.length > 6 && (
        <div style={{ padding: '14px 16px' }}>
          <button onClick={() => setShowAll(a => !a)} style={{
            width: '100%', height: 42, borderRadius: 999,
            border: `1px solid ${LL.border}`, background: 'transparent',
            fontSize: 13.5, fontWeight: 600, color: LL.text,
            cursor: 'pointer', fontFamily: LL.font,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            {showAll ? '收起评价' : `查看更多评价（${g.reviews.length - 6} 条）`}
            <i className={`ph ph-caret-${showAll ? 'up' : 'down'}`} style={{ fontSize: 11 }} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── 服务 Tab ─────────────────────────────────────────────────
const SVC_ICON_MAP = {
  '寄养': 'house', '日托': 'sun', '遛狗': 'sneaker',
  '上门喂养': 'hand-waving', '伴宠留宿': 'moon-stars',
};
const SVC_BG_MAP = {
  '寄养': '#FEE7A6', '日托': '#FBD3C4', '遛狗': '#C7E8D8',
  '上门喂养': '#D8CAE8', '伴宠留宿': '#E8E3F4',
};
const PET_ICON_MAP = { dog: 'dog', cat: 'cat' };
const PRICING_SVC_TYPES = ['寄养', '日托'];
const PET_BG_MAP    = { dog:'#EDF6EE', cat:'#F0EEF8', rabbit:'#FEF6E4', hamster:'#FFF0EA', bird:'#E8F0FE' };
const PET_COLOR_MAP = { dog:'#2C7A4B', cat:PROFILE_PURPLE, rabbit:'#B45309', hamster:'#9C4221', bird:'#2F5F87' };
const PET_ICON_MAP2 = { dog:'dog', cat:'cat', rabbit:'rabbit', bird:'bird', hamster:'mouse-simple' };
const SIZE_SCALE    = { '小型':14, '普通':16, '中型':20, '大型':24, '全部':16 };

// ─── Pricing card with pet-type tabs (寄养 / 日托) ────────────
function PricingServiceCard({ svc }) {
  const tabs = svc.petPricingTabs || [];
  const [activeType,    setActiveType]    = React.useState(tabs[0]?.type || '');
  const [openTooltip,   setOpenTooltip]   = React.useState(null);
  const [accordionOpen, setAccordionOpen] = React.useState(false);

  React.useEffect(() => { setAccordionOpen(false); setOpenTooltip(null); }, [activeType]);

  const tab = tabs.find(t => t.type === activeType) || tabs[0];
  if (!tab) return null;
  const toggleTip = (key) => setOpenTooltip(k => k === key ? null : key);

  const firstSecIdx   = tab.rows.findIndex(r => r.section);
  const preRows       = firstSecIdx >= 0 ? tab.rows.slice(0, firstSecIdx) : tab.rows;
  const postRows      = firstSecIdx >= 0 ? tab.rows.slice(firstSecIdx)    : [];
  const accordionRows = preRows.filter(r => r.accordion);
  const directRows    = preRows.filter(r => !r.accordion);

  const bg    = PET_BG_MAP[tab.type]    || LL.bg;
  const color = PET_COLOR_MAP[tab.type] || LL.text;
  const icon  = PET_ICON_MAP2[tab.type] || 'paw-print';

  const renderRow = (row, rowKey, borderTop) => {
    const isNA    = row.price === '–' || row.price === '-';
    const tipOpen = openTooltip === rowKey;
    const pColor  = isNA ? LL.text3 : (row.price.startsWith('-') && !row.price.startsWith('-¥') ? GGREEN : LL.text);
    return (
      <React.Fragment key={rowKey}>
        <div style={{ padding:'8px 16px', display:'flex', justifyContent:'space-between', alignItems:'center',
          borderTop: borderTop ? `1px solid ${LL.border}` : 'none' }}>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ fontSize:13.5, color: isNA ? LL.text3 : LL.text2 }}>{row.label}</span>
            {row.info && (
              <button onClick={() => toggleTip(rowKey)} style={{ width:15, height:15, borderRadius:'50%',
                border:`1px solid ${tipOpen ? LL.ink : LL.text3}`,
                background: tipOpen ? LL.ink : 'transparent',
                display:'inline-flex', alignItems:'center', justifyContent:'center',
                cursor:'pointer', padding:0, flex:'0 0 auto' }}>
                <span style={{ fontSize:8.5, fontWeight:700, color: tipOpen ? '#fff' : LL.text3, lineHeight:1 }}>i</span>
              </button>
            )}
          </div>
          <span style={{ fontSize:13.5, fontWeight: isNA ? 400 : 600, color:pColor, fontVariantNumeric:'tabular-nums' }}>
            {row.price}
          </span>
        </div>
        {tipOpen && row.info && (
          <div style={{ margin:'0 16px 6px', padding:'8px 12px', background:'#F0F0F8', borderRadius:8,
            fontSize:12, color:LL.text2, lineHeight:1.55 }}>{row.info}</div>
        )}
      </React.Fragment>
    );
  };

  return (
    <div style={{ margin:'10px 16px 0', background:'#fff', borderRadius:14,
      overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>

      {/* Header */}
      <div style={{ padding:'14px 16px 10px', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:38, height:38, borderRadius:10, background:SVC_BG_MAP[svc.id]||LL.lavender,
          display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' }}>
          <i className={`ph ph-${SVC_ICON_MAP[svc.id]}`} style={{ fontSize:20, color:LL.text }} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:15, fontWeight:700, color:LL.text }}>{svc.id}</div>
          <div style={{ fontSize:11.5, color:LL.text3 }}>{svc.sub}</div>
        </div>
      </div>

      {/* Pet type tab pills */}
      <div style={{ padding:'0 16px 12px', display:'flex', gap:6, flexWrap:'wrap' }}>
        {tabs.map(t => {
          const on = t.type === activeType;
          return (
            <button key={t.type} onClick={() => setActiveType(t.type)} style={{
              height:28, padding:'0 11px', borderRadius:999,
              border:`1.5px solid ${on ? LL.ink : LL.border}`,
              background: on ? LL.ink : 'transparent',
              color: on ? '#fff' : LL.text2,
              fontSize:12, fontWeight: on ? 600 : 500,
              cursor:'pointer', fontFamily:LL.font,
              display:'flex', alignItems:'center', gap:4,
              transition:'all 120ms ease' }}>
              {PET_ICON_MAP2[t.type] && <i className={`ph ph-${PET_ICON_MAP2[t.type]}`} style={{ fontSize:12 }} />}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Base fee — horizontal cards with dog silhouette on right */}
      <div style={{ padding:'10px 16px 12px', borderTop:`1px solid ${LL.border}` }}>
        <div style={{ fontSize:11.5, fontWeight:600, color:LL.text3, letterSpacing:'0.03em', marginBottom:10 }}>基础费用</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {tab.weights.map((w, i) => {
            const DOG_IMGS = {
              '小型': (window.__resources && window.__resources.dogSmall)  || './assets/dog-small.png',
              '中型': (window.__resources && window.__resources.dogMedium) || './assets/dog-medium.png',
              '大型': (window.__resources && window.__resources.dogLarge)  || './assets/dog-large.png',
            };
            const dogImg = tab.type === 'dog' ? DOG_IMGS[w.size] : null;
            return (
              <div key={i} style={{ background:bg, borderRadius:10, padding:'10px 12px',
                display:'flex', alignItems:'center', justifyContent:'space-between', gap:6 }}>
                {/* Left: text */}
                <div>
                  <div style={{ fontSize:13.5, fontWeight:700, color:LL.text, fontVariantNumeric:'tabular-nums' }}>
                    {w.range.replace(' 公斤','').replace('公斤','')}
                  </div>
                  <div style={{ fontSize:10.5, color:LL.text3 }}>公斤</div>
                  <div style={{ marginTop:4 }}>
                    <span style={{ fontSize:15, fontWeight:800, color:LL.text, fontVariantNumeric:'tabular-nums' }}>¥{w.price}</span>
                    <span style={{ fontSize:10, color:LL.text3 }}>/{svc.unit}</span>
                  </div>
                </div>
                {/* Right: image */}
                {dogImg ? (
                  <img src={dogImg} alt={w.size}
                    style={{ width:48, height:48, borderRadius:8, objectFit:'contain', display:'block' }} />
                ) : (
                  <div style={{ width:48, height:48 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Extra fees accordion */}
      {accordionRows.length > 0 && (
        <div style={{ borderTop:`1px solid ${LL.border}` }}>
          <button onClick={() => setAccordionOpen(o => !o)} style={{
            width:'100%', padding:'10px 16px', background:'transparent', border:0,
            display:'flex', justifyContent:'space-between', alignItems:'center',
            cursor:'pointer', fontFamily:LL.font }}>
            <span style={{ fontSize:13.5, fontWeight:600, color:LL.text }}>额外费用</span>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              {!accordionOpen && <span style={{ fontSize:11.5, color:LL.text3 }}>{accordionRows.length} 项</span>}
              <i className={`ph ph-caret-${accordionOpen ? 'up' : 'down'}`} style={{ fontSize:13, color:LL.text3 }} />
            </div>
          </button>
          {accordionOpen && accordionRows.map((row, i) => renderRow(row, `a-${i}`, i === 0))}
        </div>
      )}

      {/* Direct rows (长期订单) */}
      {directRows.map((row, i) => renderRow(row, `d-${i}`, true))}

      {/* Section rows (守护者接送 + 超时费) */}
      {postRows.map((row, i) => {
        if (row.section) {
          return (
            <React.Fragment key={i}>
              <div style={{ height:1, background:LL.border, margin:'0 16px' }} />
              <div style={{ padding:'10px 16px 8px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:13.5, fontWeight:700, color:LL.text }}>{row.section}</span>
                <span style={{ fontSize:14, fontWeight:700, color:LL.text }}>{row.price}</span>
              </div>
            </React.Fragment>
          );
        }
        return renderRow(row, `p-${i}`, false);
      })}
      <div style={{ height:12 }} />
    </div>
  );
}

function ServicesTab({ g }) {
  return (
    <div style={{ background: LL.bg, paddingBottom: 16 }}>
      {/* Notice banner */}
      <div style={{
        margin: '12px 16px 4px', padding: '10px 14px', borderRadius: 8,
        background: '#F0F7FF', border: '1px solid #D0E6F8',
      }}>
        <div style={{ fontSize: 12.5, color: LL.text2, lineHeight: 1.55 }}>
          以下价格适用于 <strong style={{ color: LL.text }}>1 只宠物</strong>，
          含 <strong style={{ color: LL.text }}>15% 平台服务费</strong>。
        </div>
      </div>

      {/* Service cards */}
      {g.services.map((svc) => {
        if (PRICING_SVC_TYPES.includes(svc.id) && svc.petPricingTabs?.length) {
          return <PricingServiceCard key={svc.id} svc={svc} />;
        }
        return (
          <div key={svc.id} style={{ margin:'10px 16px 0', background:'#fff', borderRadius:14,
            overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ padding:'14px 16px 12px', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:SVC_BG_MAP[svc.id]||LL.lavender,
                display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' }}>
                <i className={`ph ph-${SVC_ICON_MAP[svc.id]}`} style={{ fontSize:20, color:LL.text }} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:15, fontWeight:700, color:LL.text }}>{svc.id}</div>
                <div style={{ fontSize:11.5, color:LL.text3, marginTop:2 }}>{svc.sub}</div>
              </div>
              <div style={{ textAlign:'right', flex:'0 0 auto' }}>
                <div style={{ fontSize:20, fontWeight:800, color:LL.text, fontVariantNumeric:'tabular-nums' }}>¥{svc.price}</div>
                <div style={{ fontSize:11, color:LL.text3 }}>每{svc.unit}</div>
              </div>
            </div>
            {svc.extras && svc.extras.map((ex, ei) => (
              <div key={ei} style={{ padding:'7px 16px 7px 66px', display:'flex',
                justifyContent:'space-between', alignItems:'center', borderTop:`1px solid ${LL.border}` }}>
                <div style={{ fontSize:12.5, color:LL.text2 }}>{ex.label}</div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:13.5, fontWeight:700, color:LL.text, fontVariantNumeric:'tabular-nums' }}>
                    {typeof ex.price === 'number' ? `¥${ex.price}` : ex.price}
                  </div>
                  <div style={{ fontSize:11, color:LL.text3 }}>每{ex.unit}</div>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
function GuardianProfileScreen({ guardian = CHEN_YI_DATA, onBack }) {
  const [tab, setTab]               = React.useState('info');
  const [liked, setLiked]           = React.useState(false);
  const [allReviews, setAllReviews] = React.useState(false);
  const scrollRef                   = React.useRef(null);
  const tabScrollPos                = React.useRef({});

  const handleTabChange = (newTab) => {
    if (scrollRef?.current) {
      tabScrollPos.current[tab] = scrollRef.current.scrollTop;
    }
    setTab(newTab);
    requestAnimationFrame(() => {
      if (!scrollRef?.current) return;
      const pos = newTab === 'services' ? 0 : (tabScrollPos.current[newTab] ?? 0);
      scrollRef.current.scrollTop = pos;
    });
  };

  const NavBar = ({ onBack: back, title }) => (
    <div style={{
      flex: '0 0 auto', height: 52, background: '#fff',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10,
    }}>
      <button onClick={back} style={{
        width: 34, height: 34, borderRadius: '50%', border: 0,
        background: LL.bg, color: LL.text, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
      }}>
        <i className="ph ph-caret-left" style={{ fontSize: 17 }} />
      </button>
      <div style={{ flex: 1, textAlign: 'center', fontSize: 15, fontWeight: 700, color: LL.text }}>
        {title}
      </div>
      <div style={{ width: 34 }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', background: LL.surface, fontFamily: LL.font }}>
      {allReviews ? (
        <>
          <NavBar onBack={() => setAllReviews(false)} title="用户评价" />
          <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <ReviewsTab g={guardian} />
          </div>
        </>
      ) : (
        <>
          <NavBar onBack={onBack} title="守护者主页" />
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <ProfileHero g={guardian} liked={liked} onLike={() => setLiked(l => !l)} />
            <TabNav active={tab} onChange={handleTabChange} />
            {tab === 'info'     && <InfoTab g={guardian} onViewServices={() => handleTabChange('services')} onViewAllReviews={() => setAllReviews(true)} />}
            {tab === 'services' && <ServicesTab g={guardian} />}
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { GuardianProfileScreen, CHEN_YI_DATA, GuardianCalendar });
