// Lou Lou — Bookings list screen

function BookingsScreen() {
  const items = [
    { id: 1, title: 'Full Service Grooming', when: 'Tomorrow · 10:30', place: 'LouLou Salon · Jing\u2019an', emoji: '🐈', bg: LL.butter, status: 'Confirmed' },
    { id: 2, title: 'Dog Walk · 30 min', when: 'Wed · 17:00', place: 'Century Park · Walker A. Chen', emoji: '🐕', bg: LL.lavender, status: 'Scheduled' },
    { id: 3, title: 'Vet Check-up', when: 'Fri · 09:00', place: 'PawCare Clinic', emoji: '🩺', bg: LL.mint, status: 'Pending' },
  ];
  return (
    <div style={{ paddingBottom: 100 }}>
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: LL.text, letterSpacing: '-0.01em' }}>Bookings</div>
        <div style={{ fontSize: 13, color: LL.text2, marginTop: 4 }}>3 upcoming appointments</div>
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(it => (
          <div key={it.id} style={{
            background: '#fff', borderRadius: 16, padding: 14,
            display: 'flex', gap: 12, alignItems: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: 12, background: it.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flex: '0 0 auto',
            }}>{it.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: LL.text }}>{it.title}</div>
              <div style={{ fontSize: 12, color: LL.text2, marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Iclock size={12}/> {it.when}
              </div>
              <div style={{ fontSize: 11.5, color: LL.text3, marginTop: 2 }}>{it.place}</div>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 600, padding: '4px 8px', borderRadius: 4,
              background: it.status === 'Confirmed' ? '#E6F1EC' : it.status === 'Scheduled' ? LL.lavender : LL.butter,
              color: LL.text,
            }}>{it.status}</div>
          </div>
        ))}

        <button style={{
          marginTop: 4, height: 48, borderRadius: 16,
          border: `1px dashed ${LL.text3}`, background: 'transparent',
          color: LL.text2, fontSize: 13.5, fontWeight: 500, fontFamily: LL.font,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer',
        }}>
          <Iplus size={16} /> New Booking
        </button>
      </div>
    </div>
  );
}

window.BookingsScreen = BookingsScreen;
