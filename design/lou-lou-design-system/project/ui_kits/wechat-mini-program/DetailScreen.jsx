// Lou Lou — Pet / Service detail screen

function DetailScreen({ onBack, onBook }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', paddingBottom: 56 }}>
      <TopNav title="Details" onBack={onBack} />

      <div style={{
        margin: '0 16px 0', height: 280, background: LL.surface,
        borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 200, lineHeight: 1, overflow: 'hidden', position: 'relative',
      }}>
        <span style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))' }}>🐈</span>
      </div>

      <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: LL.text, lineHeight: 1.2 }}>
            Full Service<br/>Grooming
          </div>
          <div style={{ fontSize: 13, color: LL.text2, marginTop: 6 }}>Bath, Haircut & Styling</div>
        </div>
        <RatingPill value="4.7" />
      </div>

      <div style={{ padding: '20px 16px 0', display: 'flex', gap: 8 }}>
        <AttrTag label="Pet Type" value="Cat" bg={LL.butter} />
        <AttrTag label="Coat" value="Short" bg="#E6F1EC" />
        <AttrTag label="Time" value="30–45 mins" bg={LL.lavender} />
      </div>

      <div style={{ padding: '24px 16px 0' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: LL.text }}>Description</div>
        <div style={{ fontSize: 13.5, color: LL.text2, lineHeight: 1.6, marginTop: 8 }}>
          Give your pet a refreshing spa day. Includes natural shampoo bath,
          precision haircut, and complete hygiene check by certified
          professionals.
        </div>
      </div>

      <div style={{
        marginTop: 'auto', padding: '24px 16px 0',
      }}>
        <CTAButton onClick={onBook}>Book Service</CTAButton>
      </div>
    </div>
  );
}

window.DetailScreen = DetailScreen;
