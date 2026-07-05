// Lou Lou — App shell (router + state)

// ─── Utility ─────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getMonth() + 1}月${dt.getDate()}日`;
}
function appFmtNow() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ─── App ─────────────────────────────────────────────────────
function App({ setTopBarLeading }) {
  // ── Navigation state ──────────────────────────────────────
  const [tab, setTab] = React.useState('home');
  const [homeView, setHomeView] = React.useState('marketplace');
  const [searchQuery, setSearchQuery] = React.useState(null);
  const [selectedGuardian, setSelectedGuardian] = React.useState(null);
  const [activeChatId, setActiveChatId] = React.useState(null);

  // ── Booking flow ──────────────────────────────────────────
  const [bookingGuardian, setBookingGuardian] = React.useState(null);
  const [bookingParams, setBookingParams] = React.useState(null);

  // ── Summary screen ────────────────────────────────────────
  const [summaryApp, setSummaryApp] = React.useState(null);
  // Guardian profile opened from summary/orders (works on any tab)
  const [profileGuardian, setProfileGuardian] = React.useState(null);

  // ── Pet reminder + pets overlay ───────────────────────────
  const [showPetReminder, setShowPetReminder] = React.useState(false);
  const [pendingBooking, setPendingBooking] = React.useState(null);
  const [showPetsOverlay, setShowPetsOverlay] = React.useState(false);

  // ── Scroll container ref (passed to GuardianProfileScreen for tab scroll memory)
  const scrollRef = React.useRef(null);

  // ── Application state ─────────────────────────────────────
  const [draftGuardians, setDraftGuardians] = React.useState([]);
  const [draftConfig, setDraftConfig] = React.useState({
    service: '寄养', pet: '狗·豆豆',
    dateStart: '5月28日', dateEnd: '5月30日', area: '朝阳区·望京'
  });
  const [sentApps, setSentApps] = React.useState([
  {
    id: 'app-done-demo',
    guardian: { id: 'r2', name: '陈逸', photo: './assets/guardian2.png', bg: '#EDE5F7', services: [] },
    service: '寄养', pet: '狗·豆豆',
    dateStart: '4月10日', dateEnd: '4月12日', area: '朝阳区·望京',
    status: 'completed',
    messages: [
    { id: 1, from: 'system', text: '服务已完成，感谢您的信任', time: '4月12日' },
    { id: 2, from: 'guardian', text: '豆豆很乖，期待下次再见～', time: '4月12日' }]

  }]
  );
  const [ordersBadge, setOrdersBadge] = React.useState(false);
  const [chatBadge, setChatBadge] = React.useState(false);

  // Prevent double-simulating guardian responses
  const simulatedRef = React.useRef(new Set());

  // ── Toast ─────────────────────────────────────────────────
  const [toast, setToast] = React.useState(null);
  const showToast = (msg) => {setToast(msg);setTimeout(() => setToast(null), 2400);};

  // ── Simulate guardian responses ───────────────────────────
  React.useEffect(() => {
    sentApps.forEach((app) => {
      if (app.status !== 'pending') return;
      if (simulatedRef.current.has(app.id)) return;
      simulatedRef.current.add(app.id);

      // 陈逸 accepts after 3 s; any second guardian rejects after 5 s
      const accepted = app.guardian.id === 'r2';
      const delay = accepted ? 3000 : 5000;

      setTimeout(() => {
        setSentApps((prev) => prev.map((a) => {
          if (a.id !== app.id) return a;
          return {
            ...a,
            status: accepted ? 'accepted' : 'rejected',
            messages: accepted ?
            [...a.messages, {
              id: Date.now(), from: 'guardian',
              text: '您好！很开心认识您和豆豆。五月底我正好有空，很愿意照顾它。请问豆豆有什么特别需要注意的地方吗？',
              time: fmtNow()
            }] :
            a.messages
          };
        }));
        if (accepted) {
          setChatBadge(true);
          setOrdersBadge(true);
        }
      }, delay);
    });
  }, [sentApps.length]);

  // ── Handlers ──────────────────────────────────────────────
  const addToDraft = (guardian) => {
    setDraftGuardians((prev) =>
    prev.find((g) => g.id === guardian.id) ? prev : [...prev, guardian]
    );
    // Pre-fill config from search query
    if (searchQuery) {
      setDraftConfig((c) => ({
        ...c,
        service: searchQuery.svcType || c.service,
        pet: `${searchQuery.petType || '狗'}·豆豆`,
        dateStart: fmtDate(searchQuery.dateRange?.start) || c.dateStart,
        dateEnd: fmtDate(searchQuery.dateRange?.end) || c.dateEnd,
        area: searchQuery.address || c.area
      }));
    }
    setOrdersBadge(true);
    showToast(`${guardian.name} 已加入申请单`);
  };

  const removeFromDraft = (id) =>
  setDraftGuardians((prev) => prev.filter((g) => g.id !== id));

  const updateDraftConfig = (field, value) =>
  setDraftConfig((c) => ({ ...c, [field]: value }));

  const sendApplications = (guardianIds) => {
    const toSend = draftGuardians.filter((g) => guardianIds.includes(g.id));
    const newApps = toSend.map((g) => ({
      id: `app-${Date.now()}-${g.id}`,
      guardian: g,
      service: draftConfig.service,
      pet: draftConfig.pet,
      dateStart: draftConfig.dateStart,
      dateEnd: draftConfig.dateEnd,
      area: draftConfig.area,
      status: 'pending',
      messages: [{
        id: 1, from: 'system',
        text: `申请单已发送给 ${g.name}，等待守护者回复`,
        time: fmtNow()
      }]
    }));
    setSentApps((prev) => [...prev, ...newApps]);
    setDraftGuardians([]);
    showToast(`申请单已发送给 ${toSend.length} 位守护者`);
  };

  const sendChatMessage = (appId, text) => {
    setSentApps((prev) => prev.map((a) =>
    a.id !== appId ? a : {
      ...a,
      messages: [...a.messages, { id: Date.now(), from: 'user', text, time: fmtNow() }]
    }
    ));
  };

  const openChat = (appId) => {
    setActiveChatId(appId);
    setChatBadge(false);
  };

  // ── Record an order modification → auto chat message (either party) ──
  const recordModify = (appId, who = 'user') => {
    const shortId = String(appId).replace(/^app-/, '').slice(0, 8) || '000000';
    setSentApps((prev) => prev.map((a) => {
      if (a.id !== appId) return a;
      const label = who === 'user' ? '您' : a.guardian?.name || '守护者';
      return {
        ...a,
        messages: [...a.messages, {
          id: Date.now() + Math.random(), from: 'system', action: 'summary',
          text: `${label}已修改订单（编号 ${shortId}）`,
          time: fmtNow()
        }]
      };
    }));
    setChatBadge(true);
    setOrdersBadge(true);
  };

  const handleTabChange = (t) => {
    setTab(t);
    setSelectedGuardian(null);
    if (t === 'orders') setOrdersBadge(false);
    if (t === 'message') setChatBadge(false);
    if (t !== 'home') setHomeView('marketplace');
  };

  // ── Tab definitions ───────────────────────────────────────
  const Tab = {
    home: { label: '首页', icon: 'house', iconFill: 'house' },
    orders: { label: '订单', icon: 'receipt', iconFill: 'receipt', badge: ordersBadge },
    message: { label: '消息', icon: 'chat-circle-dots', iconFill: 'chat-circle-dots', badge: chatBadge },
    guard: { label: '守护时刻', icon: 'paw-print', iconFill: 'paw-print' },
    me: { label: '我的', icon: 'user', iconFill: 'user' }
  };

  // ── Screen routing ────────────────────────────────────────
  let screen;
  if (tab === 'home') {
    if (selectedGuardian) {
      screen =
      <GuardianProfileScreen
        guardian={selectedGuardian}
        onBack={() => setSelectedGuardian(null)}
        scrollContainerRef={scrollRef} />;


    } else if (homeView === 'results') {
      screen =
      <SearchResultsScreen
        query={searchQuery}
        setTopBarLeading={setTopBarLeading}
        onBack={() => setHomeView('marketplace')}
        onPickField={(f) => showToast(`修改 ${f}`)} />;


    } else {
      screen =
      <HomeMarketplaceScreen
        onSearch={(q) => {setSearchQuery(q);setHomeView('results');}}
        onPickService={() => setSelectedGuardian(window.CHEN_YI_DATA || null)}
        onPickField={(f) => showToast(`选择 ${f}`)} />;


    }
  } else if (tab === 'orders') {
    screen =
    <BookingRequestScreen
      draftGuardians={draftGuardians}
      draftConfig={draftConfig}
      onUpdateConfig={updateDraftConfig}
      onRemoveGuardian={removeFromDraft}
      sentApps={sentApps}
      onSend={sendApplications}
      onOpenChat={openChat}
      onOpenSummary={(app) => setSummaryApp(app)}
      onBrowseMore={() => {setTab('home');setHomeView('marketplace');}} />;


  } else if (tab === 'message') {
    screen =
    <MessagesScreen
      sentApps={sentApps}
      onOpenChat={openChat} />;


  } else if (tab === 'guard') {
    screen =
    <ActivityScreen
      onLog={() => showToast('已添加守护时刻 · +1')}
      onHistory={() => showToast('回顾历史 · 即将上线')} />;


  } else if (tab === 'me') {
    screen = <ProfileScreen />;
  }

  // Bottom padding: extra 64 when guardian profile (for booking bar)
  const scrollPB = 78;

  // ── Active chat (full screen, hides tab bar) ──────────────
  const activeApp = sentApps.find((a) => a.id === activeChatId);

  return (
    <div style={{
      position: 'relative', height: '100%', overflow: 'hidden',
      background: LL.bg, fontFamily: LL.font, color: LL.text
    }}>
      {profileGuardian ? (
      /* ── Guardian profile (opened from summary / orders, any tab) ── */
      <div style={{
        position: 'absolute', inset: 0, paddingTop: 47, zIndex: 70,
        display: 'flex', flexDirection: 'column', background: '#fff'
      }}>
          <GuardianProfileScreen
          guardian={profileGuardian}
          onBack={() => setProfileGuardian(null)} />
        
        </div>) :
      summaryApp ? (
      /* ── Booking Summary (top priority — can open from chat or orders) ── */
      <div style={{
        position: 'absolute', inset: 0, paddingTop: 47,
        display: 'flex', flexDirection: 'column', background: LL.bg
      }}>
          <BookingSummaryScreen
          app={summaryApp}
          onBack={() => setSummaryApp(null)}
          onViewGuardian={(g) => {
            const gg = g || summaryApp.guardian;
            // Order-attached guardians are thin (name/photo only) — back them
            // with the full profile record so GuardianProfileScreen renders safely.
            const full = gg && gg.bio && gg.home ?
            gg :
            { ...CHEN_YI_DATA,
              name: gg?.name || CHEN_YI_DATA.name,
              photo: gg?.photo || CHEN_YI_DATA.photo,
              id: gg?.id || CHEN_YI_DATA.id };
            setProfileGuardian(full);
          }}
          onModify={(a) => {
            recordModify(a.id, 'user');
            showToast('订单已修改，已在聊天中通知对方');
            // Demonstrate that the guardian side can modify too
            setTimeout(() => recordModify(a.id, 'guardian'), 3500);
            setSummaryApp(null);
          }} />
        
        </div>) :
      activeChatId && activeApp ? (
      /* ── Chat view (full-screen, no tab bar) ── */
      <div style={{
        position: 'absolute', inset: 0, paddingTop: 47,
        display: 'flex', flexDirection: 'column', background: LL.bg
      }}>
          <ChatView
          app={activeApp}
          onBack={() => setActiveChatId(null)}
          onSendMessage={(txt) => sendChatMessage(activeChatId, txt)}
          onOpenSummary={(app) => setSummaryApp(app)}
          onModify={(a) => {
            recordModify(a.id, 'user');
            showToast('订单已修改，已通知守护者');
            setTimeout(() => recordModify(a.id, 'guardian'), 3500);
          }}
          onReview={() => showToast('感谢您的评价 🌟')} />
        
        </div>) :
      bookingGuardian ? (
      /* ── Booking flow (full-screen, no tab bar) ── */
      <div style={{
        position: 'absolute', inset: 0, paddingTop: 47,
        display: 'flex', flexDirection: 'column', background: LL.bg
      }}>
          <BookingFlowScreen
          guardian={bookingGuardian}
          initialService={bookingParams?.service}
          initialDateRange={bookingParams?.dateRange}
          initialSchedule={bookingParams?.schedule}
          onBack={() => setBookingGuardian(null)}
          onGoToOrders={() => {
            setBookingGuardian(null);
            setBookingParams(null);
            setSelectedGuardian(null);
            setTab('orders');
            setOrdersBadge(false);
          }}
          onSubmit={(data) => {
            const g = bookingGuardian;
            const dr = data.dateRange;
            const batchId = `batch-${Date.now()}`;
            const batchTime = new Date();

            const makeApp = (gd, photo) => ({
              id: `app-${Date.now()}-${gd.id}-${Math.random().toString(36).slice(2, 6)}`,
              guardian: gd,
              service: data.service,
              pet: '金毛·豆豆',
              dateStart: dr?.start ? fmtDate(dr.start) : '待定',
              dateEnd: dr?.end ? fmtDate(dr.end) : null,
              area: '朝阳区·望京',
              status: 'pending',
              batchId,
              batchTime,
              nights: data.nights || 0,
              price: data.unitPrice || 0,
              dropoff: data.dropoff || null,
              pickup: data.pickup || null,
              messages: [
              { id: 1, from: 'system', text: `预约请求已发送给 ${gd.name}，等待守护者回复`, time: appFmtNow() },
              ...(data.message ? [{ id: 2, from: 'user', text: data.message, time: appFmtNow() }] : [])]

            });

            const mainApp = makeApp(g);

            // Build apps for additionally recommended guardians
            const extraApps = (data.additionalGuardians || []).map((rec) => {
              const recGuardian = {
                id: rec.id, name: rec.name,
                photo: rec.photo || null,
                rating: rec.rating,
                services: [{ id: data.service, price: rec.price, unit: rec.unit }]
              };
              return makeApp(recGuardian);
            });

            setSentApps((prev) => [...prev, mainApp, ...extraApps]);
            setChatBadge(true);
            setOrdersBadge(true);
          }}
          onGoHome={() => {
            setBookingGuardian(null);
            setBookingParams(null);
            setSelectedGuardian(null);
            setTab('home');
            setHomeView('marketplace');
          }} />
        
        </div>) :
      showPetsOverlay ? (
      /* ── Pets Screen overlay (opened from pet reminder) ── */
      <div style={{ position: 'absolute', inset: 0, paddingTop: 47, overflowY: 'auto', overflowX: 'hidden', background: LL.bg, zIndex: 40 }}>
          <PetsScreen onBack={() => setShowPetsOverlay(false)} />
        </div>) :
      tab === 'home' && homeView === 'results' ? (
      /* ── Search Results (own overlay, no tab bar) ── */
      <div style={{ position: 'absolute', inset: 0, paddingTop: 47, overflowY: 'auto', overflowX: 'hidden', background: LL.bg }}>
          <SearchResultsScreen
          query={searchQuery}
          setTopBarLeading={setTopBarLeading}
          onBack={() => setHomeView('marketplace')}
          onPickField={(f) => showToast(`修改 ${f}`)} />
        
        </div>) :
      tab === 'home' && selectedGuardian ? (
      /* ── Guardian Profile (own overlay, no tab bar) ── */
      <div style={{ position: 'absolute', inset: 0, paddingTop: 47, display: 'flex', flexDirection: 'column', background: '#fff' }}>
          <GuardianProfileScreen
          guardian={selectedGuardian}
          onBack={() => setSelectedGuardian(null)} />
        
          {/* Booking bar */}
          <div style={{ flex: '0 0 auto', height: 64, background: '#fff',
          boxShadow: '0 -1px 0 #EEEEF2, 0 -4px 16px rgba(0,0,0,0.07)',
          display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: LL.text3, marginBottom: 1 }}>最低价格</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 1 }} data-comment-anchor="c59e66a68e-div-433-15">
                <span style={{ fontSize: 12, color: LL.text2 }}>从 </span>
                <span style={{ fontSize: 20, fontWeight: 800, color: LL.text }}>
                  ¥{Math.min(...selectedGuardian.services.map((s) => s.price))}
                </span>
                <span style={{ fontSize: 12, color: LL.text3 }}>
                  /{selectedGuardian.services.reduce((a, s) => s.price <= Math.min(...selectedGuardian.services.map((x) => x.price)) ? s.unit : a, '次')}起
                </span>
              </div>
            </div>
            <button
            onClick={() => {
              setPendingBooking({ guardian: selectedGuardian, params: { service: searchQuery?.svcType, dateRange: searchQuery?.dateRange, schedule: searchQuery?.schedule } });
              setShowPetReminder(true);
            }}
            style={{ height: 44, padding: '0 22px', borderRadius: 999, border: 0, background: LL.ink, color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: LL.font, cursor: 'pointer', flex: '0 0 auto' }}>
              立即预约
            </button>
          </div>
        {/* ── Pet Reminder Sheet ── */}
        {showPetReminder &&
        <PetReminderSheet
          onViewPets={() => {
            setShowPetReminder(false);
            setShowPetsOverlay(true);
          }}
          onContinue={() => {
            setShowPetReminder(false);
            setBookingGuardian(pendingBooking.guardian);
            setBookingParams(pendingBooking.params);
          }}
          onDismiss={() => setShowPetReminder(false)} />

        }
        </div>) :

      <>
          {/* ── Scrollable screen area ── */}
          <div ref={scrollRef} style={{
          position: 'absolute', inset: 0, paddingTop: 47, paddingBottom: scrollPB,
          overflowY: 'auto', overflowX: 'hidden'
        }}>
            {screen}
          </div>

          {/* ── Tab bar ── */}
          <PhTabBar tabs={Tab} active={tab} onChange={handleTabChange} />
        </>
      }

      {/* ── Toast ── */}
      {toast &&
      <div style={{
        position: 'absolute', left: '50%', bottom: 110, transform: 'translateX(-50%)',
        background: LL.ink, color: '#fff', padding: '10px 16px', borderRadius: 999,
        fontSize: 13, fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        zIndex: 90, whiteSpace: 'nowrap'
      }}>{toast}</div>
      }
    </div>);

}

// ─── Tab bar with badge dots ──────────────────────────────────
function PhTabBar({ tabs, active, onChange }) {
  const ids = Object.keys(tabs);
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      height: 78, paddingBottom: 18,
      background: '#fff', borderTop: `1px solid ${LL.border}`,
      display: 'grid', gridTemplateColumns: `repeat(${ids.length}, 1fr)`,
      fontFamily: LL.font, zIndex: 20
    }}>
      {ids.map((id) => {
        const t = tabs[id];
        const on = id === active;
        return (
          <button key={id} onClick={() => onChange(id)} style={{
            border: 0, background: 'transparent', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 3, color: on ? LL.text : LL.text3, position: 'relative'
          }}>
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <i className={`${on ? 'ph-fill' : 'ph'} ph-${on ? t.iconFill : t.icon}`}
              style={{ fontSize: 22, lineHeight: 1 }} />
              {t.badge &&
              <div style={{
                position: 'absolute', top: -2, right: -3,
                width: 8, height: 8, borderRadius: '50%',
                background: '#E63946', border: '1.5px solid #fff'
              }} />
              }
            </div>
            <span style={{ fontSize: 10.5, fontWeight: on ? 600 : 500 }}>{t.label}</span>
          </button>);

      })}
    </div>);

}

// ─── Mount ────────────────────────────────────────────────────
function Root() {
  const [topBarLeading, setTopBarLeading] = React.useState(null);
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#EEEEF2', padding: 24, boxSizing: 'border-box',
      fontFamily: LL.font
    }}>
      <IOSDevice width={390} height={844} leading={topBarLeading}>
        <App setTopBarLeading={setTopBarLeading} />
      </IOSDevice>
    </div>);

}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);