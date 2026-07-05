// Lou Lou — App shell (router + state)

// ─── Utility ─────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getMonth() + 1}月${dt.getDate()}日`;
}
function appFmtNow() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
}

// ─── App ─────────────────────────────────────────────────────
function App({ setTopBarLeading }) {
  // ── Navigation state ──────────────────────────────────────
  const [tab,              setTab]              = React.useState('home');
  const [homeView,         setHomeView]         = React.useState('marketplace');
  const [searchQuery,      setSearchQuery]      = React.useState(null);
  const [selectedGuardian, setSelectedGuardian] = React.useState(null);
  const [activeChatId,     setActiveChatId]     = React.useState(null);

  // ── Booking flow ──────────────────────────────────────────
  const [bookingGuardian, setBookingGuardian] = React.useState(null);
  const [bookingParams,   setBookingParams]   = React.useState(null);

  // ── Summary screen ────────────────────────────────────────
  const [summaryApp, setSummaryApp] = React.useState(null);
  // Guardian profile opened from summary/orders (works on any tab)
  const [profileGuardian, setProfileGuardian] = React.useState(null);
  // Order modify screen (修改订单)
  const [modifyApp, setModifyApp] = React.useState(null);
  // Process guide overlay (流程指引)
  const [showGuide, setShowGuide] = React.useState(false);

  // ── Pet reminder + pets overlay ───────────────────────────
  const [showPetReminder,  setShowPetReminder]  = React.useState(false);
  const [pendingBooking,   setPendingBooking]   = React.useState(null);
  const [showPetsOverlay,  setShowPetsOverlay]  = React.useState(false);
  const [petsForBooking,   setPetsForBooking]   = React.useState(false);
  // New user — no pet profile filled in yet
  const [userPets,         setUserPets]         = React.useState([]);

  // ── Scroll container ref (passed to GuardianProfileScreen for tab scroll memory)
  const scrollRef = React.useRef(null);

  // ── Application state ─────────────────────────────────────
  const [draftGuardians, setDraftGuardians] = React.useState([]);
  const [draftConfig,    setDraftConfig]    = React.useState({
    service: '寄养', pet: '狗·豆豆',
    dateStart: '5月28日', dateEnd: '5月30日', area: '朝阳区·望京',
  });
  const [sentApps,  setSentApps]  = React.useState([
    {
      id: 'app-done-demo',
      guardian: { id: 'r2', name: '陈逸', photo: './assets/guardian2.png', bg: '#EDE5F7', services: [] },
      service: '寄养', pet: '狗·豆豆',
      dateStart: '4月10日', dateEnd: '4月12日', area: '朝阳区·望京',
      status: 'completed',
      messages: [
        { id: 1, from: 'system', text: '服务已完成，感谢您的信任', time: '4月12日' },
        { id: 2, from: 'guardian', text: '豆豆很乖，期待下次再见～', time: '4月12日' },
      ],
    },
  ]);
  const [ordersBadge, setOrdersBadge] = React.useState(false);
  const [chatBadge,   setChatBadge]   = React.useState(false);

  // Prevent double-simulating guardian responses
  const simulatedRef = React.useRef(new Set());

  // ── Toast ─────────────────────────────────────────────────
  const [toast, setToast] = React.useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  // ── Simulate guardian responses ───────────────────────────
  React.useEffect(() => {
    sentApps.forEach(app => {
      if (app.status !== 'pending') return;
      if (simulatedRef.current.has(app.id)) return;
      simulatedRef.current.add(app.id);

      // Primary guardian (the one you booked) accepts after 3 s; extra
      // recommended guardians reject after 5 s. 陈逸 (r2) also auto-accepts.
      const accepted = app.isPrimary === true || app.guardian.id === 'r2';
      const delay    = accepted ? 3000 : 5000;

      setTimeout(() => {
        setSentApps(prev => prev.map(a => {
          if (a.id !== app.id) return a;
          return {
            ...a,
            status: accepted ? 'accepted' : 'rejected',
            messages: accepted
              ? [...a.messages, {
                  id: Date.now(), from: 'guardian',
                  text: '您好！很开心认识您和豆豆。五月底我正好有空，很愿意照顾它。请问豆豆有什么特别需要注意的地方吗？',
                  time: fmtNow(),
                }]
              : a.messages,
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
    setDraftGuardians(prev =>
      prev.find(g => g.id === guardian.id) ? prev : [...prev, guardian]
    );
    // Pre-fill config from search query
    if (searchQuery) {
      setDraftConfig(c => ({
        ...c,
        service: searchQuery.svcType || c.service,
        pet: `${searchQuery.petType || '狗'}·豆豆`,
        dateStart: fmtDate(searchQuery.dateRange?.start) || c.dateStart,
        dateEnd:   fmtDate(searchQuery.dateRange?.end)   || c.dateEnd,
        area: searchQuery.address || c.area,
      }));
    }
    setOrdersBadge(true);
    showToast(`${guardian.name} 已加入申请单`);
  };

  const removeFromDraft = (id) =>
    setDraftGuardians(prev => prev.filter(g => g.id !== id));

  const updateDraftConfig = (field, value) =>
    setDraftConfig(c => ({ ...c, [field]: value }));

  const sendApplications = (guardianIds) => {
    const toSend = draftGuardians.filter(g => guardianIds.includes(g.id));
    const newApps = toSend.map(g => ({
      id: `app-${Date.now()}-${g.id}`,
      guardian: g,
      service:   draftConfig.service,
      pet:       draftConfig.pet,
      dateStart: draftConfig.dateStart,
      dateEnd:   draftConfig.dateEnd,
      area:      draftConfig.area,
      status: 'pending',
      messages: [{
        id: 1, from: 'system',
        text: `申请单已发送给 ${g.name}，等待守护者回复`,
        time: fmtNow(),
      }],
    }));
    setSentApps(prev => [...prev, ...newApps]);
    setDraftGuardians([]);
    showToast(`申请单已发送给 ${toSend.length} 位守护者`);
  };

  const sendChatMessage = (appId, text) => {
    setSentApps(prev => prev.map(a =>
      a.id !== appId ? a : {
        ...a,
        messages: [...a.messages, { id: Date.now(), from: 'user', text, time: fmtNow() }],
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
    setSentApps(prev => prev.map(a => {
      if (a.id !== appId) return a;
      const label = who === 'user' ? '您' : (a.guardian?.name || '守护者');
      return {
        ...a,
        messages: [...a.messages, {
          id: Date.now() + Math.random(), from: 'system', action: 'summary',
          text: `${label}已修改订单（编号 ${shortId}）`,
          time: fmtNow(),
        }],
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

  // ── Resolve a search-result guardian into a full profile record ──
  const resolveGuardian = (g) => {
    if (!g) return null;
    if (g.id === 'g6' || (g.name && g.name.indexOf('阿哲') === 0)) return window.ZHE_DATA;
    if (g.id === 'g4' || (g.name && g.name.indexOf('陈逸') === 0)) return window.CHEN_YI_DATA;
    // Generic fallback: borrow 陈逸's profile shell, override identity
    const base = window.CHEN_YI_DATA || {};
    return {
      ...base,
      id: g.id,
      name: (g.name || '').split(' ')[0] || base.name,
      initial: g.initial || { char: (g.name || '守')[0], bg: '#E8E3F2' },
      photo: null, photoKey: null, photos: [],
    };
  };
  const handleSelectGuardian = (g) => setSelectedGuardian(resolveGuardian(g));

  // ── Confirm an order modification → update order + notify guardian ──
  const handleModifyConfirm = (app, changes) => {
    const shortId = String(app.id).replace(/^app-/, '').slice(0, 8) || '000000';
    const dl = (changes.dateEnd && changes.dateEnd !== changes.dateStart)
      ? `${changes.dateStart} → ${changes.dateEnd}` : changes.dateStart;
    setSentApps(prev => prev.map(a => {
      if (a.id !== app.id) return a;
      const msgs = [
        ...(a.messages || []),
        { id: Date.now() + Math.random(), from: 'system', action: 'summary',
          text: `您修改了订单（编号 ${shortId}）：${changes.service} · ${dl}，等待守护者重新确认`, time: fmtNow() },
        ...(changes.note ? [{ id: Date.now() + Math.random() + 1, from: 'user', text: changes.note, time: fmtNow() }] : []),
      ];
      return { ...a, service: changes.service, dateStart: changes.dateStart, dateEnd: changes.dateEnd, messages: msgs };
    }));
    setSummaryApp(s => (s && s.id === app.id)
      ? { ...s, service: changes.service, dateStart: changes.dateStart, dateEnd: changes.dateEnd } : s);
    setChatBadge(true);
    setOrdersBadge(true);
    setModifyApp(null);
    showToast('修改已提交，已发送提醒给守护者');
  };

  // ── Tab definitions ───────────────────────────────────────
  const Tab = {
    home:    { label: '首页',     icon: 'house',            iconFill: 'house' },
    orders:  { label: '订单',     icon: 'receipt',          iconFill: 'receipt',         badge: ordersBadge },
    message: { label: '消息',     icon: 'chat-circle-dots', iconFill: 'chat-circle-dots', badge: chatBadge  },
    guard:   { label: '守护时刻', icon: 'paw-print',        iconFill: 'paw-print' },
    me:      { label: '我的',     icon: 'user',             iconFill: 'user' },
  };

  // ── Screen routing ────────────────────────────────────────
  let screen;
  if (tab === 'home') {
    if (selectedGuardian) {
      screen = (
        <GuardianProfileScreen
          guardian={selectedGuardian}
          initialService={searchQuery?.svcType}
          onBack={() => setSelectedGuardian(null)}
          scrollContainerRef={scrollRef}
        />
      );
    } else if (homeView === 'results') {
      screen = (
        <SearchResultsScreen
          query={searchQuery}
          setTopBarLeading={setTopBarLeading}
          onBack={() => setHomeView('marketplace')}
          onSelectGuardian={handleSelectGuardian}
          onPickField={(f) => showToast(`修改 ${f}`)}
        />
      );
    } else {
      screen = (
        <HomeMarketplaceScreen
          onSearch={(q) => { setSearchQuery(q); setHomeView('results'); }}
          onPickService={() => setSelectedGuardian(window.CHEN_YI_DATA || null)}
          onPickField={(f) => showToast(`选择 ${f}`)}
          onOpenGuide={() => setShowGuide(true)}
        />
      );
    }
  } else if (tab === 'orders') {
    screen = (
      <BookingRequestScreen
        draftGuardians={draftGuardians}
        draftConfig={draftConfig}
        onUpdateConfig={updateDraftConfig}
        onRemoveGuardian={removeFromDraft}
        sentApps={sentApps}
        onSend={sendApplications}
        onOpenChat={openChat}
        onOpenSummary={(app) => setSummaryApp(app)}
        onBrowseMore={() => { setTab('home'); setHomeView('marketplace'); }}
      />
    );
  } else if (tab === 'message') {
    screen = (
      <MessagesScreen
        sentApps={sentApps}
        onOpenChat={openChat}
      />
    );
  } else if (tab === 'guard') {
    screen = (
      <ActivityScreen
        onLog={() => showToast('已添加守护时刻 · +1')}
        onHistory={() => showToast('回顾历史 · 即将上线')}
      />
    );
  } else if (tab === 'me') {
    screen = <ProfileScreen />;
  }

  // Bottom padding: extra 64 when guardian profile (for booking bar)
  const scrollPB = 78;

  // ── Active chat (full screen, hides tab bar) ──────────────
  const activeApp = sentApps.find(a => a.id === activeChatId);

  return (
    <div style={{
      position: 'relative', height: '100%', overflow: 'hidden',
      background: LL.bg, fontFamily: LL.font, color: LL.text,
    }}>
      {modifyApp ? (
        <OrderModifyScreen
          app={modifyApp}
          pets={userPets}
          onClose={() => setModifyApp(null)}
          onConfirm={handleModifyConfirm}
        />
      ) : showGuide ? (
        <ProcessGuideScreen
          onClose={() => setShowGuide(false)}
          onStart={() => setShowGuide(false)}
        />
      ) : profileGuardian ? (
        /* ── Guardian profile (opened from summary / orders, any tab) ── */
        <div style={{
          position: 'absolute', inset: 0, paddingTop: 47, zIndex: 70,
          display: 'flex', flexDirection: 'column', background: '#fff',
        }}>
          <GuardianProfileScreen
            guardian={profileGuardian}
            onBack={() => setProfileGuardian(null)}
          />
        </div>
      ) : summaryApp ? (
        /* ── Booking Summary (top priority — can open from chat or orders) ── */
        <div style={{
          position: 'absolute', inset: 0, paddingTop: 47,
          display: 'flex', flexDirection: 'column', background: LL.bg,
        }}>
          <BookingSummaryScreen
            app={summaryApp}
            onBack={() => setSummaryApp(null)}
            onViewGuardian={(g) => {
              const gg = g || summaryApp.guardian;
              // Order-attached guardians are thin (name/photo only) — back them
              // with the full profile record so GuardianProfileScreen renders safely.
              const full = (gg && gg.bio && gg.home)
                ? gg
                : { ...CHEN_YI_DATA,
                    name:  gg?.name  || CHEN_YI_DATA.name,
                    photo: gg?.photo || CHEN_YI_DATA.photo,
                    id:    gg?.id    || CHEN_YI_DATA.id };
              setProfileGuardian(full);
            }}
            onModify={(a) => setModifyApp(a)}
          />
        </div>
      ) : activeChatId && activeApp ? (
        /* ── Chat view (full-screen, no tab bar) ── */
        <div style={{
          position: 'absolute', inset: 0, paddingTop: 47,
          display: 'flex', flexDirection: 'column', background: LL.bg,
        }}>
          <ChatView
            app={activeApp}
            onBack={() => setActiveChatId(null)}
            onSendMessage={(txt) => sendChatMessage(activeChatId, txt)}
            onOpenSummary={(app) => setSummaryApp(app)}
            onModify={(a) => setModifyApp(a)}
            onReview={() => showToast('感谢您的评价 🌟')}
          />
        </div>
      ) : bookingGuardian ? (
        /* ── Booking flow (full-screen, no tab bar) ── */
        <div style={{
          position: 'absolute', inset: 0, paddingTop: 47,
          display: 'flex', flexDirection: 'column', background: LL.bg,
        }}>
          <BookingFlowScreen
            guardian={bookingGuardian}
            initialService={bookingParams?.service}
            initialDateRange={bookingParams?.dateRange}
            initialSchedule={bookingParams?.schedule}
            myPets={userPets}
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
              const batchId   = `batch-${Date.now()}`;
              const batchTime = new Date();

              const makeApp = (gd, isPrimary) => ({
                id:        `app-${Date.now()}-${gd.id}-${Math.random().toString(36).slice(2,6)}`,
                orderNo:   'LL' + String(Date.now()).slice(-10) + String(Math.floor(Math.random()*90)+10),
                guardian:  gd,
                isPrimary,
                service:   data.service,
                pet:       data.pet || '我的宠物',
                phone:     data.phone || '',
                address:   data.address || null,
                dateStart: dr?.start ? fmtDate(dr.start) : '待定',
                dateEnd:   dr?.end   ? fmtDate(dr.end)   : null,
                area:      data.address ? `${data.address.area || data.address.poi || ''}${data.address.detail ? ' ' + data.address.detail : ''}` : '朝阳区·望京',
                status:    'pending',
                batchId,
                batchTime,
                nights:   data.nights   || 0,
                price:    data.unitPrice || 0,
                dropoff:  data.dropoff   || null,
                pickup:   data.pickup    || null,
                messages: [
                  { id: 1, from: 'system', text: `预约请求已发送给 ${gd.name}，等待守护者回复`, time: appFmtNow() },
                  ...(data.message ? [{ id: 2, from: 'user', text: data.message, time: appFmtNow() }] : []),
                ],
              });

              const mainApp = makeApp(g, true);

              // Build apps for additionally recommended guardians
              const extraApps = (data.additionalGuardians || []).map(rec => {
                const recGuardian = {
                  id: rec.id, name: rec.name,
                  photo: rec.photo || null,
                  rating: rec.rating,
                  services: [{ id: data.service, price: rec.price, unit: rec.unit }],
                };
                return makeApp(recGuardian, false);
              });

              setSentApps(prev => [...prev, mainApp, ...extraApps]);
              setChatBadge(true);
              setOrdersBadge(true);
            }}
            onGoHome={() => {
              setBookingGuardian(null);
              setBookingParams(null);
              setSelectedGuardian(null);
              setTab('home');
              setHomeView('marketplace');
            }}
          />
        </div>
      ) : showPetsOverlay ? (
        /* ── Pets Screen overlay (opened from pet reminder) ── */
        <div style={{ position:'absolute', inset:0, paddingTop:47, overflowY:'auto', overflowX:'hidden', background:LL.bg, zIndex:40 }}>
          <PetsScreen
            pets={userPets}
            onPetsChange={setUserPets}
            initialView={petsForBooking ? 'add' : 'list'}
            completeLabel="保存并继续预约"
            onComplete={petsForBooking ? (() => {
              setShowPetsOverlay(false);
              setPetsForBooking(false);
              if (pendingBooking) {
                setBookingGuardian(pendingBooking.guardian);
                setBookingParams(pendingBooking.params);
              }
            }) : undefined}
            onBack={() => { setShowPetsOverlay(false); setPetsForBooking(false); }}
          />
        </div>
      ) : (tab === 'home' && homeView === 'results' && !selectedGuardian) ? (
        /* ── Search Results (own overlay, no tab bar) ── */
        <div style={{ position:'absolute', inset:0, paddingTop:47, overflowY:'auto', overflowX:'hidden', background:LL.bg }}>
          <SearchResultsScreen
            query={searchQuery}
            setTopBarLeading={setTopBarLeading}
            onBack={() => setHomeView('marketplace')}
            onSelectGuardian={handleSelectGuardian}
            onPickField={(f) => showToast(`修改 ${f}`)}
          />
        </div>
      ) : (tab === 'home' && selectedGuardian) ? (
        /* ── Guardian Profile (own overlay, no tab bar) ── */
        <div style={{ position:'absolute', inset:0, paddingTop:47, display:'flex', flexDirection:'column', background:'#fff' }}>
          <GuardianProfileScreen
            guardian={selectedGuardian}
            initialService={searchQuery?.svcType}
            onBack={() => setSelectedGuardian(null)}
          />
          {/* Booking bar — service + price, 修改 to switch service */}
          <GuardianBookingBar
            guardian={selectedGuardian}
            initialService={searchQuery?.svcType}
            onBook={(svcId) => {
              const params = { service: svcId || searchQuery?.svcType, dateRange: searchQuery?.dateRange, schedule: searchQuery?.schedule };
              setPendingBooking({ guardian: selectedGuardian, params });
              if (selectedGuardian.isNewUserFlow && userPets.length === 0) {
                // New user — prompt to fill in a pet profile first
                setShowPetReminder(true);
              } else {
                setBookingGuardian(selectedGuardian);
                setBookingParams(params);
              }
            }}
          />
        {/* ── Pet Reminder Sheet (new user, no pet profile) ── */}
        {showPetReminder && (
          <PetReminderSheet
            onViewPets={() => {
              setShowPetReminder(false);
              setPetsForBooking(true);
              setShowPetsOverlay(true);
            }}
            onContinue={() => {
              setShowPetReminder(false);
              setBookingGuardian(pendingBooking.guardian);
              setBookingParams(pendingBooking.params);
            }}
            onDismiss={() => setShowPetReminder(false)}
          />
        )}
        </div>
      ) : (
        <>
          {/* ── Scrollable screen area ── */}
          <div ref={scrollRef} style={{
            position: 'absolute', inset: 0, paddingTop: 47, paddingBottom: scrollPB,
            overflowY: 'auto', overflowX: 'hidden',
          }}>
            {screen}
          </div>

          {/* ── Tab bar ── */}
          <PhTabBar tabs={Tab} active={tab} onChange={handleTabChange} />
        </>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 110, transform: 'translateX(-50%)',
          background: LL.ink, color: '#fff', padding: '10px 16px', borderRadius: 999,
          fontSize: 13, fontWeight: 500, boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          zIndex: 90, whiteSpace: 'nowrap',
        }}>{toast}</div>
      )}
    </div>
  );
}

// ─── Guardian booking bar (service + price, 修改 → service switch drawer) ──
function GuardianBookingBar({ guardian, onBook, initialService }) {
  const services = guardian.services || [];
  const init = (initialService && services.some(s => s.id === initialService))
    ? initialService : services[0]?.id;
  const [svcId, setSvcId] = React.useState(init);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const svc = services.find(s => s.id === svcId) || services[0];
  if (!svc) return null;

  return (
    <>
      <div style={{
        flex:'0 0 auto', background:'#fff',
        boxShadow:'0 -1px 0 #EEEEF2, 0 -4px 16px rgba(0,0,0,0.07)',
        display:'flex', alignItems:'flex-end', padding:'14px 16px 22px', gap:12,
      }}>
        <div style={{ flex:1, minWidth:0, marginBottom:13 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
            <span style={{ fontSize:15, fontWeight:800, color:LL.text }}>{svc.id}</span>
            <button onClick={() => setDrawerOpen(true)} style={{
              background:'transparent', border:0, padding:0, cursor:'pointer', fontFamily:LL.font,
              fontSize:12.5, fontWeight:600, color:LL.text2,
              textDecoration:'underline', textUnderlineOffset:'2px',
            }}>修改</button>
          </div>
          <div style={{ display:'flex', alignItems:'baseline', gap:1 }}>
            <span style={{ fontSize:12, color:LL.text2 }}>从 </span>
            <span style={{ fontSize:20, fontWeight:800, color:LL.text }}>¥{svc.price}</span>
            <span style={{ fontSize:12, color:LL.text3 }}>/{svc.unit}起</span>
          </div>
        </div>
        <button onClick={() => onBook(svcId)} style={{
          height:46, padding:'0 24px', borderRadius:999, border:0, background:LL.ink,
          color:'#fff', fontSize:15, fontWeight:700, fontFamily:LL.font, cursor:'pointer', flex:'0 0 auto',
        }}>立即预约</button>
      </div>
      {drawerOpen && (
        <ServiceSwitchDrawer
          services={services}
          value={svcId}
          onPick={(id) => { setSvcId(id); setDrawerOpen(false); }}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </>
  );
}

// ─── Service switch drawer (grouped services + collapsed cancel policy) ──
function ServiceSwitchDrawer({ services, value, onPick, onClose }) {
  const [policyOpen, setPolicyOpen] = React.useState(false);
  const GROUPS = [
    { title:'在守护者家', ids:['寄养','日托'],            theme:{ solid:'#5B3A8F', bg:'#EDE5F7', fg:'#5B3A8F' } },
    { title:'在宠物主家', ids:['遛狗','上门喂养','伴宠留宿'], theme:{ solid:'#2C7A4B', bg:'#E6F1EC', fg:'#236B40' } },
  ];
  const byId = (id) => services.find(s => s.id === id);

  return (
    <>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.4)', zIndex:88 }}/>
      <div style={{
        position:'absolute', left:0, right:0, bottom:0, zIndex:89, background:'#fff',
        borderTopLeftRadius:20, borderTopRightRadius:20, maxHeight:'86%',
        display:'flex', flexDirection:'column',
        boxShadow:'0 -8px 24px rgba(0,0,0,0.12)', fontFamily:LL.font,
      }}>
        {/* Header */}
        <div style={{ padding:'12px 16px 8px', flex:'0 0 auto' }}>
          <div style={{ width:38, height:4, borderRadius:2, background:LL.border, margin:'0 auto 10px' }}/>
          <div style={{ display:'flex', alignItems:'center' }}>
            <div style={{ fontSize:16, fontWeight:700, color:LL.text }}>选择服务</div>
            <button onClick={onClose} style={{
              marginLeft:'auto', width:30, height:30, borderRadius:'50%', border:0,
              background:'#F0F0F5', cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}><i className="ph ph-x" style={{ fontSize:13, color:LL.text }}/></button>
          </div>
        </div>
        {/* Body — grouped service chips (no price) */}
        <div style={{ flex:1, overflowY:'auto', paddingBottom:22 }}>
          {GROUPS.map(g => (
            <div key={g.title} style={{ padding:'16px 16px 6px' }}>
              <div style={{ fontSize:12.5, fontWeight:700, color:g.theme.solid, marginBottom:11, letterSpacing:'0.02em' }}>{g.title}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                {g.ids.map(id => {
                  const svc = byId(id); if (!svc) return null;
                  const on = svc.id === value;
                  return (
                    <button key={id} onClick={() => onPick(id)} style={{
                      height:40, padding:'0 18px', borderRadius:999, border:0, cursor:'pointer', fontFamily:LL.font,
                      background: on ? g.theme.solid : g.theme.bg, color: on ? '#fff' : g.theme.fg,
                      fontSize:14, fontWeight:700,
                      display:'flex', alignItems:'center', gap:6,
                    }}>
                      {on && <i className="ph-fill ph-check" style={{ fontSize:13 }}/>}
                      {svc.id}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {/* Cancel policy — collapsed, taps open the detail drawer */}
          <button onClick={() => setPolicyOpen(true)} style={{
            width:'100%', marginTop:8, padding:'15px 16px', background:'transparent', border:0,
            borderTop:`8px solid ${LL.bg}`, cursor:'pointer', fontFamily:LL.font,
            display:'flex', alignItems:'center', gap:8, textAlign:'left',
          }}>
            <i className="ph ph-shield-check" style={{ fontSize:17, color:LL.text2, flex:'0 0 auto' }}/>
            <span style={{ flex:1, fontSize:14, fontWeight:600, color:LL.text }}>取消政策</span>
            <span style={{ fontSize:12, color:LL.text3 }}>查看详情</span>
            <i className="ph ph-caret-right" style={{ fontSize:13, color:LL.text3 }}/>
          </button>
        </div>
      </div>
      {policyOpen && typeof CancelPolicyModal === 'function' && (
        <CancelPolicyModal onClose={() => setPolicyOpen(false)} />
      )}
    </>
  );
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
      fontFamily: LL.font, zIndex: 20,
    }}>
      {ids.map(id => {
        const t = tabs[id];
        const on = id === active;
        return (
          <button key={id} onClick={() => onChange(id)} style={{
            border: 0, background: 'transparent', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 3, color: on ? LL.text : LL.text3, position: 'relative',
          }}>
            <div style={{ position: 'relative', display: 'inline-flex' }}>
              <i className={`${on ? 'ph-fill' : 'ph'} ph-${on ? t.iconFill : t.icon}`}
                style={{ fontSize: 22, lineHeight: 1 }} />
              {t.badge && (
                <div style={{
                  position: 'absolute', top: -2, right: -3,
                  width: 8, height: 8, borderRadius: '50%',
                  background: '#E63946', border: '1.5px solid #fff',
                }} />
              )}
            </div>
            <span style={{ fontSize: 10.5, fontWeight: on ? 600 : 500 }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Mount ────────────────────────────────────────────────────
function Root() {
  const [topBarLeading, setTopBarLeading] = React.useState(null);
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#EEEEF2', padding: 24, boxSizing: 'border-box',
      fontFamily: LL.font,
    }}>
      <IOSDevice width={390} height={844} leading={topBarLeading}>
        <App setTopBarLeading={setTopBarLeading} />
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
