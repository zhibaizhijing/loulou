// Lou Lou — Home screen

const HOME_SERVICE_ITEMS = [
  { id: '寄养',   icon: 'house',        bg: '#FEE7A6' },
  { id: '日托',   icon: 'sun',          bg: '#FBD3C4' },
  { id: '遛狗',   icon: 'sneaker',      bg: '#C7E8D8' },
  { id: '上门喂养', icon: 'hand-waving', bg: '#D8CAE8' },
  { id: '伴宠留宿', icon: 'moon-stars',  bg: '#E8E3F4' },
];

function ServiceTypeRow() {
  return (
    <div style={{ padding: '0 16px', display: 'flex', gap: 10, overflowX: 'auto', scrollbarWidth: 'none' }}>
      {HOME_SERVICE_ITEMS.map(svc => (
        <button key={svc.id} style={{
          flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          background: 'transparent', border: 0, cursor: 'pointer', padding: '4px 2px', fontFamily: LL.font,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, background: svc.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <i className={`ph ph-${svc.icon}`} style={{ fontSize: 24, color: LL.text }} />
          </div>
          <span style={{ fontSize: 11.5, fontWeight: 500, color: LL.text2, whiteSpace: 'nowrap' }}>{svc.id}</span>
        </button>
      ))}
    </div>
  );
}

function HomeScreen({ onOpenPet }) {
  const [cat, setCat] = React.useState('All');
  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '12px 16px 0' }}>
        <HeroPill />
      </div>

      <div style={{ padding: '20px 16px 8px', textAlign: 'center' }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: LL.text, letterSpacing: '-0.01em', lineHeight: 1.2 }}>
          Pamper Your Pet,<br/>Every Day
        </div>
        <div style={{ fontSize: 13, color: LL.text2, marginTop: 8, lineHeight: 1.5, padding: '0 12px' }}>
          Book expert grooming services or<br/>track your pet's daily activity.
        </div>
      </div>

      <div style={{ padding: '20px 0 0' }}>
        <div style={{ padding: '0 16px 10px', fontSize: 13, fontWeight: 600, color: LL.text2, letterSpacing: '0.02em' }}>
          选择服务
        </div>
        <ServiceTypeRow />
      </div>

      <div style={{ padding: '14px 0 0' }}>
        <CategoryChips items={['All', 'Dog', 'Cat', 'Birds', 'Fish']} active={cat} onChange={setCat} />
      </div>

      <div style={{ padding: '20px 16px 0', display: 'flex', flexDirection: 'column' }}>
        <PetStageCard
          title="Premium Grooming"
          sub="Expert styling & hygiene care"
          bg={LL.butter}
          emoji="🐶"
          onClick={() => onOpenPet('grooming')}
        />
        <PetStageCard
          title="Daily Walks"
          sub="Tracked routes & milestones"
          bg={LL.lavender}
          emoji="🐱"
          offset={-22}
          onClick={() => onOpenPet('walks')}
        />
      </div>
    </div>
  );
}

window.HomeScreen = HomeScreen;
