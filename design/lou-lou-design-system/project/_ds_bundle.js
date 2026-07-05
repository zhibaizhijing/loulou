/* @ds-bundle: {"format":3,"namespace":"LouLouDesignSystem_d0e775","components":[{"name":"Button","sourcePath":"components/Button/Button.jsx"},{"name":"StatusPill","sourcePath":"components/StatusPill/StatusPill.jsx"},{"name":"Tag","sourcePath":"components/Tag/Tag.jsx"}],"sourceHashes":{"app.jsx":"38186b75772a","components/Button/Button.jsx":"892ac1d64e34","components/StatusPill/StatusPill.jsx":"d8bb4381dc5c","components/Tag/Tag.jsx":"6654ec5b68b0","ios-frame.jsx":"0879f9ad0115","ui_kits/wechat-mini-program/ActivityScreen.jsx":"a869463af3f5","ui_kits/wechat-mini-program/BookingFlowScreen.jsx":"a3077953e090","ui_kits/wechat-mini-program/BookingRequestScreen.jsx":"544d321e1228","ui_kits/wechat-mini-program/BookingSheet.jsx":"e31e7c01ff9f","ui_kits/wechat-mini-program/BookingSummaryScreen.jsx":"730a87fabb16","ui_kits/wechat-mini-program/BookingsScreen.jsx":"131ef91c700f","ui_kits/wechat-mini-program/DetailScreen.jsx":"17d43f2714dd","ui_kits/wechat-mini-program/FilterDrawer.jsx":"04e1fed75e8a","ui_kits/wechat-mini-program/GuardianProfileScreen.jsx":"97eb43b83627","ui_kits/wechat-mini-program/HomeMarketplaceScreen.jsx":"228da5e27969","ui_kits/wechat-mini-program/HomeScreen.jsx":"3927347df1a7","ui_kits/wechat-mini-program/MessagesScreen.jsx":"33ef5f21dd70","ui_kits/wechat-mini-program/PetsScreen.jsx":"8b15b9e82220","ui_kits/wechat-mini-program/ProfileScreen.jsx":"dfdd3353700b","ui_kits/wechat-mini-program/ReviewGuardianScreen.jsx":"f2e105a340f1","ui_kits/wechat-mini-program/SearchPickers.jsx":"1694a9330eb1","ui_kits/wechat-mini-program/SearchResultsScreen.jsx":"cf2371a524d6","ui_kits/wechat-mini-program/SearchResultsScreen.standalone.jsx":"397346ee76fc","ui_kits/wechat-mini-program/app.jsx":"e8dd1b7452bb","ui_kits/wechat-mini-program/components.jsx":"e907f2f4e951","ui_kits/wechat-mini-program/icons.jsx":"acaf03ad7be1","ui_kits/wechat-mini-program/ios-frame.jsx":"98012fbc3b99"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.LouLouDesignSystem_d0e775 = window.LouLouDesignSystem_d0e775 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// app.jsx
try { (() => {
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
function App({
  setTopBarLeading
}) {
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
    service: '寄养',
    pet: '狗·豆豆',
    dateStart: '5月28日',
    dateEnd: '5月30日',
    area: '朝阳区·望京'
  });
  const [sentApps, setSentApps] = React.useState([{
    id: 'app-done-demo',
    guardian: {
      id: 'r2',
      name: '陈逸',
      photo: './assets/guardian2.png',
      bg: '#EDE5F7',
      services: []
    },
    service: '寄养',
    pet: '狗·豆豆',
    dateStart: '4月10日',
    dateEnd: '4月12日',
    area: '朝阳区·望京',
    status: 'completed',
    messages: [{
      id: 1,
      from: 'system',
      text: '服务已完成，感谢您的信任',
      time: '4月12日'
    }, {
      id: 2,
      from: 'guardian',
      text: '豆豆很乖，期待下次再见～',
      time: '4月12日'
    }]
  }]);
  const [ordersBadge, setOrdersBadge] = React.useState(false);
  const [chatBadge, setChatBadge] = React.useState(false);

  // Prevent double-simulating guardian responses
  const simulatedRef = React.useRef(new Set());

  // ── Toast ─────────────────────────────────────────────────
  const [toast, setToast] = React.useState(null);
  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  // ── Simulate guardian responses ───────────────────────────
  React.useEffect(() => {
    sentApps.forEach(app => {
      if (app.status !== 'pending') return;
      if (simulatedRef.current.has(app.id)) return;
      simulatedRef.current.add(app.id);

      // 陈逸 accepts after 3 s; any second guardian rejects after 5 s
      const accepted = app.guardian.id === 'r2';
      const delay = accepted ? 3000 : 5000;
      setTimeout(() => {
        setSentApps(prev => prev.map(a => {
          if (a.id !== app.id) return a;
          return {
            ...a,
            status: accepted ? 'accepted' : 'rejected',
            messages: accepted ? [...a.messages, {
              id: Date.now(),
              from: 'guardian',
              text: '您好！很开心认识您和豆豆。五月底我正好有空，很愿意照顾它。请问豆豆有什么特别需要注意的地方吗？',
              time: fmtNow()
            }] : a.messages
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
  const addToDraft = guardian => {
    setDraftGuardians(prev => prev.find(g => g.id === guardian.id) ? prev : [...prev, guardian]);
    // Pre-fill config from search query
    if (searchQuery) {
      setDraftConfig(c => ({
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
  const removeFromDraft = id => setDraftGuardians(prev => prev.filter(g => g.id !== id));
  const updateDraftConfig = (field, value) => setDraftConfig(c => ({
    ...c,
    [field]: value
  }));
  const sendApplications = guardianIds => {
    const toSend = draftGuardians.filter(g => guardianIds.includes(g.id));
    const newApps = toSend.map(g => ({
      id: `app-${Date.now()}-${g.id}`,
      guardian: g,
      service: draftConfig.service,
      pet: draftConfig.pet,
      dateStart: draftConfig.dateStart,
      dateEnd: draftConfig.dateEnd,
      area: draftConfig.area,
      status: 'pending',
      messages: [{
        id: 1,
        from: 'system',
        text: `申请单已发送给 ${g.name}，等待守护者回复`,
        time: fmtNow()
      }]
    }));
    setSentApps(prev => [...prev, ...newApps]);
    setDraftGuardians([]);
    showToast(`申请单已发送给 ${toSend.length} 位守护者`);
  };
  const sendChatMessage = (appId, text) => {
    setSentApps(prev => prev.map(a => a.id !== appId ? a : {
      ...a,
      messages: [...a.messages, {
        id: Date.now(),
        from: 'user',
        text,
        time: fmtNow()
      }]
    }));
  };
  const openChat = appId => {
    setActiveChatId(appId);
    setChatBadge(false);
  };

  // ── Record an order modification → auto chat message (either party) ──
  const recordModify = (appId, who = 'user') => {
    const shortId = String(appId).replace(/^app-/, '').slice(0, 8) || '000000';
    setSentApps(prev => prev.map(a => {
      if (a.id !== appId) return a;
      const label = who === 'user' ? '您' : a.guardian?.name || '守护者';
      return {
        ...a,
        messages: [...a.messages, {
          id: Date.now() + Math.random(),
          from: 'system',
          action: 'summary',
          text: `${label}已修改订单（编号 ${shortId}）`,
          time: fmtNow()
        }]
      };
    }));
    setChatBadge(true);
    setOrdersBadge(true);
  };
  const handleTabChange = t => {
    setTab(t);
    setSelectedGuardian(null);
    if (t === 'orders') setOrdersBadge(false);
    if (t === 'message') setChatBadge(false);
    if (t !== 'home') setHomeView('marketplace');
  };

  // ── Tab definitions ───────────────────────────────────────
  const Tab = {
    home: {
      label: '首页',
      icon: 'house',
      iconFill: 'house'
    },
    orders: {
      label: '订单',
      icon: 'receipt',
      iconFill: 'receipt',
      badge: ordersBadge
    },
    message: {
      label: '消息',
      icon: 'chat-circle-dots',
      iconFill: 'chat-circle-dots',
      badge: chatBadge
    },
    guard: {
      label: '守护时刻',
      icon: 'paw-print',
      iconFill: 'paw-print'
    },
    me: {
      label: '我的',
      icon: 'user',
      iconFill: 'user'
    }
  };

  // ── Screen routing ────────────────────────────────────────
  let screen;
  if (tab === 'home') {
    if (selectedGuardian) {
      screen = /*#__PURE__*/React.createElement(GuardianProfileScreen, {
        guardian: selectedGuardian,
        onBack: () => setSelectedGuardian(null),
        scrollContainerRef: scrollRef
      });
    } else if (homeView === 'results') {
      screen = /*#__PURE__*/React.createElement(SearchResultsScreen, {
        query: searchQuery,
        setTopBarLeading: setTopBarLeading,
        onBack: () => setHomeView('marketplace'),
        onPickField: f => showToast(`修改 ${f}`)
      });
    } else {
      screen = /*#__PURE__*/React.createElement(HomeMarketplaceScreen, {
        onSearch: q => {
          setSearchQuery(q);
          setHomeView('results');
        },
        onPickService: () => setSelectedGuardian(window.CHEN_YI_DATA || null),
        onPickField: f => showToast(`选择 ${f}`)
      });
    }
  } else if (tab === 'orders') {
    screen = /*#__PURE__*/React.createElement(BookingRequestScreen, {
      draftGuardians: draftGuardians,
      draftConfig: draftConfig,
      onUpdateConfig: updateDraftConfig,
      onRemoveGuardian: removeFromDraft,
      sentApps: sentApps,
      onSend: sendApplications,
      onOpenChat: openChat,
      onOpenSummary: app => setSummaryApp(app),
      onBrowseMore: () => {
        setTab('home');
        setHomeView('marketplace');
      }
    });
  } else if (tab === 'message') {
    screen = /*#__PURE__*/React.createElement(MessagesScreen, {
      sentApps: sentApps,
      onOpenChat: openChat
    });
  } else if (tab === 'guard') {
    screen = /*#__PURE__*/React.createElement(ActivityScreen, {
      onLog: () => showToast('已添加守护时刻 · +1'),
      onHistory: () => showToast('回顾历史 · 即将上线')
    });
  } else if (tab === 'me') {
    screen = /*#__PURE__*/React.createElement(ProfileScreen, null);
  }

  // Bottom padding: extra 64 when guardian profile (for booking bar)
  const scrollPB = 78;

  // ── Active chat (full screen, hides tab bar) ──────────────
  const activeApp = sentApps.find(a => a.id === activeChatId);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '100%',
      overflow: 'hidden',
      background: LL.bg,
      fontFamily: LL.font,
      color: LL.text
    }
  }, profileGuardian ?
  /*#__PURE__*/
  /* ── Guardian profile (opened from summary / orders, any tab) ── */
  React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      zIndex: 70,
      display: 'flex',
      flexDirection: 'column',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement(GuardianProfileScreen, {
    guardian: profileGuardian,
    onBack: () => setProfileGuardian(null)
  })) : summaryApp ?
  /*#__PURE__*/
  /* ── Booking Summary (top priority — can open from chat or orders) ── */
  React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      display: 'flex',
      flexDirection: 'column',
      background: LL.bg
    }
  }, /*#__PURE__*/React.createElement(BookingSummaryScreen, {
    app: summaryApp,
    onBack: () => setSummaryApp(null),
    onViewGuardian: g => {
      const gg = g || summaryApp.guardian;
      // Order-attached guardians are thin (name/photo only) — back them
      // with the full profile record so GuardianProfileScreen renders safely.
      const full = gg && gg.bio && gg.home ? gg : {
        ...CHEN_YI_DATA,
        name: gg?.name || CHEN_YI_DATA.name,
        photo: gg?.photo || CHEN_YI_DATA.photo,
        id: gg?.id || CHEN_YI_DATA.id
      };
      setProfileGuardian(full);
    },
    onModify: a => {
      recordModify(a.id, 'user');
      showToast('订单已修改，已在聊天中通知对方');
      // Demonstrate that the guardian side can modify too
      setTimeout(() => recordModify(a.id, 'guardian'), 3500);
      setSummaryApp(null);
    }
  })) : activeChatId && activeApp ?
  /*#__PURE__*/
  /* ── Chat view (full-screen, no tab bar) ── */
  React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      display: 'flex',
      flexDirection: 'column',
      background: LL.bg
    }
  }, /*#__PURE__*/React.createElement(ChatView, {
    app: activeApp,
    onBack: () => setActiveChatId(null),
    onSendMessage: txt => sendChatMessage(activeChatId, txt),
    onOpenSummary: app => setSummaryApp(app),
    onModify: a => {
      recordModify(a.id, 'user');
      showToast('订单已修改，已通知守护者');
      setTimeout(() => recordModify(a.id, 'guardian'), 3500);
    },
    onReview: () => showToast('感谢您的评价 🌟')
  })) : bookingGuardian ?
  /*#__PURE__*/
  /* ── Booking flow (full-screen, no tab bar) ── */
  React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      display: 'flex',
      flexDirection: 'column',
      background: LL.bg
    }
  }, /*#__PURE__*/React.createElement(BookingFlowScreen, {
    guardian: bookingGuardian,
    initialService: bookingParams?.service,
    initialDateRange: bookingParams?.dateRange,
    initialSchedule: bookingParams?.schedule,
    onBack: () => setBookingGuardian(null),
    onGoToOrders: () => {
      setBookingGuardian(null);
      setBookingParams(null);
      setSelectedGuardian(null);
      setTab('orders');
      setOrdersBadge(false);
    },
    onSubmit: data => {
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
        messages: [{
          id: 1,
          from: 'system',
          text: `预约请求已发送给 ${gd.name}，等待守护者回复`,
          time: appFmtNow()
        }, ...(data.message ? [{
          id: 2,
          from: 'user',
          text: data.message,
          time: appFmtNow()
        }] : [])]
      });
      const mainApp = makeApp(g);

      // Build apps for additionally recommended guardians
      const extraApps = (data.additionalGuardians || []).map(rec => {
        const recGuardian = {
          id: rec.id,
          name: rec.name,
          photo: rec.photo || null,
          rating: rec.rating,
          services: [{
            id: data.service,
            price: rec.price,
            unit: rec.unit
          }]
        };
        return makeApp(recGuardian);
      });
      setSentApps(prev => [...prev, mainApp, ...extraApps]);
      setChatBadge(true);
      setOrdersBadge(true);
    },
    onGoHome: () => {
      setBookingGuardian(null);
      setBookingParams(null);
      setSelectedGuardian(null);
      setTab('home');
      setHomeView('marketplace');
    }
  })) : showPetsOverlay ?
  /*#__PURE__*/
  /* ── Pets Screen overlay (opened from pet reminder) ── */
  React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      overflowY: 'auto',
      overflowX: 'hidden',
      background: LL.bg,
      zIndex: 40
    }
  }, /*#__PURE__*/React.createElement(PetsScreen, {
    onBack: () => setShowPetsOverlay(false)
  })) : tab === 'home' && homeView === 'results' ?
  /*#__PURE__*/
  /* ── Search Results (own overlay, no tab bar) ── */
  React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      overflowY: 'auto',
      overflowX: 'hidden',
      background: LL.bg
    }
  }, /*#__PURE__*/React.createElement(SearchResultsScreen, {
    query: searchQuery,
    setTopBarLeading: setTopBarLeading,
    onBack: () => setHomeView('marketplace'),
    onPickField: f => showToast(`修改 ${f}`)
  })) : tab === 'home' && selectedGuardian ?
  /*#__PURE__*/
  /* ── Guardian Profile (own overlay, no tab bar) ── */
  React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      display: 'flex',
      flexDirection: 'column',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement(GuardianProfileScreen, {
    guardian: selectedGuardian,
    onBack: () => setSelectedGuardian(null)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      height: 64,
      background: '#fff',
      boxShadow: '0 -1px 0 #EEEEF2, 0 -4px 16px rgba(0,0,0,0.07)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: LL.text3,
      marginBottom: 1
    }
  }, "\u6700\u4F4E\u4EF7\u683C"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 1
    },
    "data-comment-anchor": "c59e66a68e-div-433-15"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: LL.text2
    }
  }, "\u4ECE "), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: LL.text
    }
  }, "\xA5", Math.min(...selectedGuardian.services.map(s => s.price))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }, "/", selectedGuardian.services.reduce((a, s) => s.price <= Math.min(...selectedGuardian.services.map(x => x.price)) ? s.unit : a, '次'), "\u8D77"))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setPendingBooking({
        guardian: selectedGuardian,
        params: {
          service: searchQuery?.svcType,
          dateRange: searchQuery?.dateRange,
          schedule: searchQuery?.schedule
        }
      });
      setShowPetReminder(true);
    },
    style: {
      height: 44,
      padding: '0 22px',
      borderRadius: 999,
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer',
      flex: '0 0 auto'
    }
  }, "\u7ACB\u5373\u9884\u7EA6")), showPetReminder && /*#__PURE__*/React.createElement(PetReminderSheet, {
    onViewPets: () => {
      setShowPetReminder(false);
      setShowPetsOverlay(true);
    },
    onContinue: () => {
      setShowPetReminder(false);
      setBookingGuardian(pendingBooking.guardian);
      setBookingParams(pendingBooking.params);
    },
    onDismiss: () => setShowPetReminder(false)
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    ref: scrollRef,
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      paddingBottom: scrollPB,
      overflowY: 'auto',
      overflowX: 'hidden'
    }
  }, screen), /*#__PURE__*/React.createElement(PhTabBar, {
    tabs: Tab,
    active: tab,
    onChange: handleTabChange
  })), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      bottom: 110,
      transform: 'translateX(-50%)',
      background: LL.ink,
      color: '#fff',
      padding: '10px 16px',
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 500,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      zIndex: 90,
      whiteSpace: 'nowrap'
    }
  }, toast));
}

// ─── Tab bar with badge dots ──────────────────────────────────
function PhTabBar({
  tabs,
  active,
  onChange
}) {
  const ids = Object.keys(tabs);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 78,
      paddingBottom: 18,
      background: '#fff',
      borderTop: `1px solid ${LL.border}`,
      display: 'grid',
      gridTemplateColumns: `repeat(${ids.length}, 1fr)`,
      fontFamily: LL.font,
      zIndex: 20
    }
  }, ids.map(id => {
    const t = tabs[id];
    const on = id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => onChange(id),
      style: {
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        color: on ? LL.text : LL.text3,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        display: 'inline-flex'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `${on ? 'ph-fill' : 'ph'} ph-${on ? t.iconFill : t.icon}`,
      style: {
        fontSize: 22,
        lineHeight: 1
      }
    }), t.badge && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: -2,
        right: -3,
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#E63946',
        border: '1.5px solid #fff'
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        fontWeight: on ? 600 : 500
      }
    }, t.label));
  }));
}

// ─── Mount ────────────────────────────────────────────────────
function Root() {
  const [topBarLeading, setTopBarLeading] = React.useState(null);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#EEEEF2',
      padding: 24,
      boxSizing: 'border-box',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement(IOSDevice, {
    width: 390,
    height: 844,
    leading: topBarLeading
  }, /*#__PURE__*/React.createElement(App, {
    setTopBarLeading: setTopBarLeading
  })));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(Root, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "app.jsx", error: String((e && e.message) || e) }); }

// components/Button/Button.jsx
try { (() => {
// Lou Lou — Button
// Pill CTA. Dark ink primary, hairline secondary, quiet ghost.
// Token-driven (colors_and_type.css custom properties).

function Button({
  children,
  variant = 'primary',
  // 'primary' | 'secondary' | 'ghost'
  size = 'md',
  // 'sm' | 'md' | 'lg'
  block = false,
  disabled = false,
  loading = false,
  type = 'button',
  onClick
}) {
  const heights = {
    sm: 36,
    md: 44,
    lg: 52
  };
  const pads = {
    sm: '0 16px',
    md: '0 24px',
    lg: '0 28px'
  };
  const fonts = {
    sm: 13,
    md: 15,
    lg: 16
  };
  const base = {
    display: block ? 'flex' : 'inline-flex',
    width: block ? '100%' : undefined,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: heights[size] || heights.md,
    padding: pads[size] || pads.md,
    fontSize: fonts[size] || fonts.md,
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    borderRadius: 'var(--ll-radius-pill)',
    border: 0,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'background 120ms ease, transform 120ms ease',
    boxSizing: 'border-box'
  };
  const variants = {
    primary: {
      background: disabled ? 'var(--ll-ink-disabled)' : 'var(--ll-ink)',
      color: 'var(--ll-text-on-ink)'
    },
    secondary: {
      background: 'transparent',
      color: disabled ? 'var(--ll-text-3)' : 'var(--ll-text)',
      boxShadow: 'inset 0 0 0 1.5px var(--ll-border)'
    },
    ghost: {
      background: 'transparent',
      color: disabled ? 'var(--ll-text-3)' : 'var(--ll-text-2)'
    }
  };
  const spinner = React.createElement('span', {
    key: 'spin',
    style: {
      width: 14,
      height: 14,
      borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.35)',
      borderTopColor: variant === 'primary' ? '#fff' : 'var(--ll-text)',
      display: 'inline-block',
      animation: 'll-btn-spin 0.8s linear infinite'
    }
  });
  return React.createElement('button', {
    type,
    disabled: disabled || loading,
    onClick,
    style: {
      ...base,
      ...(variants[variant] || variants.primary)
    }
  }, loading ? spinner : null, children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Button/Button.jsx", error: String((e && e.message) || e) }); }

// components/StatusPill/StatusPill.jsx
try { (() => {
// Lou Lou — StatusPill
// Order/booking status chip. Soft tinted background + matching text.

function StatusPill({
  status = 'pending',
  children
}) {
  const map = {
    pending: {
      bg: '#FEF3C7',
      fg: '#B45309',
      label: '待确认'
    },
    accepted: {
      bg: '#E6F1EC',
      fg: '#2C7A4B',
      label: '待付款'
    },
    progress: {
      bg: '#E3EEF7',
      fg: '#2F5F87',
      label: '待完成'
    },
    completed: {
      bg: '#F0F0F5',
      fg: '#6B6B7A',
      label: '已完成'
    },
    rejected: {
      bg: '#FFF0F0',
      fg: '#CC2200',
      label: '已失效'
    }
  };
  const s = map[status] || map.pending;
  return React.createElement('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: 11,
      fontWeight: 700,
      lineHeight: 1,
      padding: '4px 9px',
      borderRadius: 'var(--ll-radius-pill)',
      background: s.bg,
      color: s.fg,
      fontFamily: 'var(--font-sans)',
      whiteSpace: 'nowrap'
    }
  }, children || s.label);
}
Object.assign(__ds_scope, { StatusPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/StatusPill/StatusPill.jsx", error: String((e && e.message) || e) }); }

// components/Tag/Tag.jsx
try { (() => {
// Lou Lou — Tag
// Small pastel chip used for pet types, coat, attributes.

function Tag({
  children,
  tone = 'butter'
}) {
  const tones = {
    butter: 'var(--ll-butter)',
    lavender: 'var(--ll-lavender)',
    mint: 'var(--ll-mint)',
    peach: 'var(--ll-peach)',
    neutral: 'var(--ll-bg)'
  };
  return React.createElement('span', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      height: 22,
      padding: '0 8px',
      borderRadius: 'var(--ll-radius-xs)',
      fontSize: 11,
      fontWeight: 600,
      lineHeight: 1,
      color: 'var(--ll-text)',
      background: tones[tone] || tones.butter,
      fontFamily: 'var(--font-sans)',
      whiteSpace: 'nowrap'
    }
  }, children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/Tag/Tag.jsx", error: String((e && e.message) || e) }); }

// ios-frame.jsx
try { (() => {
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports: IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41'
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '21px 24px 19px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    },
    "data-comment-anchor": "a9cc1afeb8-div-12-5"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 1.5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126,
      height: 37,
      borderRadius: 24,
      background: '#000',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(IOSStatusBar, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
    title: title,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      height: 34,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: 8,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 139,
      height: 5,
      borderRadius: 100,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
    }
  })));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ios-frame.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/ActivityScreen.jsx
try { (() => {
// Lou Lou — 守护时刻 (Guardian moments) — daily activity dashboard

function ActivityScreen({
  onLog,
  onHistory
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 0',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.01em'
    }
  }, "\u5B88\u62A4\u65F6\u523B"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(IconBtn, {
    name: "calendar-blank"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 0',
      fontSize: 14,
      color: LL.text2
    }
  }, "\u4ECA\u65E5\u966A\u4F34"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px 0',
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(StatTile, {
    label: "\u966A\u4F34\u65F6\u957F",
    value: "45",
    unit: " \u5206\u949F",
    bg: LL.butter
  }), /*#__PURE__*/React.createElement(StatTile, {
    label: "\u4E92\u52A8\u91CC\u7A0B",
    value: "2.5",
    unit: " \u516C\u91CC",
    bg: LL.lavender
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '18px 16px 0',
      background: '#fff',
      borderRadius: 20,
      padding: '20px 16px 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u5B88\u62A4\u8FDB\u5EA6"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(ProgressRing, {
    percent: 75,
    target: "60 \u5206\u949F"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 16px 0'
    }
  }, /*#__PURE__*/React.createElement(CTAButton, {
    onClick: onLog
  }, "\u8BB0\u5F55\u5B88\u62A4\u65F6\u523B")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '14px 0'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onHistory,
    style: {
      background: 'transparent',
      border: 0,
      padding: '6px 14px',
      fontSize: 13,
      fontWeight: 500,
      color: LL.text,
      cursor: 'pointer',
      borderBottom: `1px solid ${LL.border}`,
      fontFamily: LL.font
    }
  }, "\u67E5\u770B\u5386\u53F2")));
}
window.ActivityScreen = ActivityScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/ActivityScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/BookingFlowScreen.jsx
try { (() => {
// Lou Lou — BookingFlowScreen.jsx  v2
// Screens: form → recommendation → success

// ─── Constants ────────────────────────────────────────────────
const BF_MINT = '#C7E8D8';
const BF_MINT_DARK = '#2C7A4B';
const BF_SVC_FORM = {
  '寄养': 'A',
  '日托': 'A',
  '伴宠留宿': 'A',
  '遛狗': 'B',
  '上门喂养': 'B'
};
const BF_SVC_ICON = {
  '寄养': 'house',
  '日托': 'sun',
  '遛狗': 'sneaker',
  '上门喂养': 'hand-waving',
  '伴宠留宿': 'moon-stars'
};
const BF_SVC_SUB = {
  '寄养': '在守护者家',
  '日托': '在守护者家',
  '遛狗': '在宠物主家',
  '上门喂养': '在宠物主家',
  '伴宠留宿': '在宠物主家'
};
// Location tag colors: guardian-home vs pet-home
const BF_SVC_AT_GUARDIAN = ['寄养', '日托'];
const BF_LOC_COLOR = svc => BF_SVC_AT_GUARDIAN.includes(svc) ? {
  fg: '#5E4A87',
  bg: '#EDE5F7'
} : {
  fg: BF_MINT_DARK,
  bg: '#E6F1EC'
};

// ─── Mock data ────────────────────────────────────────────────
const BF_MY_PETS = [{
  id: 'p1',
  name: '豆豆',
  species: 'dog',
  breed: '金毛',
  weight: '22公斤',
  age: '3岁',
  bg: '#FEE7A6'
}, {
  id: 'p2',
  name: '奶茶',
  species: 'cat',
  breed: '英短',
  weight: '4.5公斤',
  age: '2岁',
  bg: '#FBD3C4'
}];
const BF_EXTRAS = [{
  id: 'medicate',
  label: '喂药 / 擦药 / 喂营养品',
  price: 10,
  desc: '按需为宠物喂药、擦药或喂食营养品（每次）'
}];
// Coupons the user owns — selectable in the price drawer
const BF_COUPONS = [{
  id: 'birthday',
  name: '宠物生日折扣券',
  desc: '生日当月 9 折，不限服务',
  kind: 'percent',
  value: 0.1
}, {
  id: 'invite',
  name: '邀请好友奖励券',
  desc: '满 ¥100 立减 ¥20',
  kind: 'amount',
  value: 20,
  min: 100
}, {
  id: 'newuser',
  name: '新用户专享 9 折',
  desc: '首单 9 折优惠',
  kind: 'percent',
  value: 0.1
}];
function bfCouponDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  if (coupon.kind === 'percent') return Math.round(subtotal * coupon.value);
  if (coupon.kind === 'amount') return subtotal >= (coupon.min || 0) ? coupon.value : 0;
  return 0;
}
function bfSpeciesFromBreed(breed) {
  const b = breed || '';
  if (/猫|布偶|英短|美短|蓝猫|缅因|暹罗|折耳|狸花/.test(b)) return 'cat';
  if (/兔/.test(b)) return 'rabbit';
  if (/鼠|仓鼠/.test(b)) return 'hamster';
  if (/鸟|鹦鹉/.test(b)) return 'bird';
  return 'dog';
}
const BF_SPECIES_CN = {
  dog: '狗',
  cat: '猫',
  rabbit: '兔',
  hamster: '鼠',
  bird: '鸟'
};
const BF_RECS = [{
  id: 'r1',
  name: '林若',
  area: '朝阳区·望京',
  rating: 4.8,
  reviews: 96,
  repeats: 12,
  price: 78,
  unit: '晚',
  photo: window.__resources && window.__resources.guardian1 || './assets/guardian1.png'
}, {
  id: 'r3',
  name: '桃子',
  area: '朝阳区·三里屯',
  rating: 4.9,
  reviews: 64,
  repeats: 8,
  price: 82,
  unit: '晚',
  photo: window.__resources && window.__resources.guardian3 || './assets/guardian3.png'
}, {
  id: 'r4',
  name: '张明',
  area: '朝阳区·望京',
  rating: 4.7,
  reviews: 43,
  repeats: 5,
  price: 75,
  unit: '晚',
  photo: null,
  bg: '#C7E8D8'
}];

// ─── Helpers ──────────────────────────────────────────────────
// Per-day walk-time picker helpers (遛狗 / 上门喂养)
const BF_WALK_SLOTS = (() => {
  const out = [];
  for (let h = 7; h <= 21; h++) {
    out.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 21) out.push(`${String(h).padStart(2, '0')}:30`);
  }
  return out;
})();
const BF_WK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
function bfDayKey(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${x.getMonth() + 1}-${x.getDate()}`;
}
function bfDayLabel(d) {
  const x = new Date(d);
  return `${x.getMonth() + 1}月${x.getDate()}日 ${BF_WK[x.getDay()]}`;
}
function bfPeriodDefaults(periods) {
  const map = {
    morning: '09:00',
    afternoon: '14:00',
    evening: '19:00'
  };
  const t = (periods || []).map(p => map[p]).filter(Boolean);
  return t.length ? t : ['09:00'];
}
function bfServiceDays(schedule) {
  const s = schedule;
  if (!s) return [];
  if (s.type === 'once') {
    if (s.pickMode === 'single' && s.dates?.days?.length) {
      return [...s.dates.days].map(d => new Date(d)).sort((a, b) => a - b);
    }
    if (s.dates?.start) {
      const start = new Date(s.dates.start);
      const end = s.dates.end ? new Date(s.dates.end) : new Date(s.dates.start);
      const out = [];
      const d = new Date(start);
      while (d <= end && out.length < 31) {
        out.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      return out;
    }
  }
  // recurring: expand chosen weekdays within range (Mon-first index)
  if (s.dates?.start && s.weekdays?.length) {
    const start = new Date(s.dates.start);
    const end = s.dates.end ? new Date(s.dates.end) : new Date(s.dates.start);
    const wd = new Set(s.weekdays);
    const out = [];
    const d = new Date(start);
    while (d <= end && out.length < 31) {
      if (wd.has((d.getDay() + 6) % 7)) out.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return out;
  }
  return s.dates?.start ? [new Date(s.dates.start)] : [];
}

// Per-day walk-time picker — scrollable time chips + "same as first day" toggle
function BFWalkTimes({
  days,
  walkTimes,
  sameAsFirst,
  onToggleTime,
  onToggleSame,
  serviceLabel
}) {
  if (!days.length) return null;
  const firstKey = bfDayKey(days[0]);
  const firstTimes = walkTimes[firstKey] || [];
  const summary = times => times.length ? `${times.length}次 · ${times.join('、')}` : `添加一个或多个${serviceLabel}时间`;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff'
    }
  }, days.map((d, i) => {
    const k = bfDayKey(d);
    const isFirst = i === 0;
    const same = !isFirst && sameAsFirst[k] !== false; // default ON for non-first days
    const ownTimes = walkTimes[k] || [];
    const shownTimes = same ? firstTimes : ownTimes;
    const showChips = isFirst || !same;
    return /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        padding: '14px 16px',
        borderTop: i > 0 ? `1px solid ${LL.border}` : 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: LL.text
      }
    }, bfDayLabel(d)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: shownTimes.length ? LL.text2 : LL.text3,
        marginTop: 3
      }
    }, summary(shownTimes)), showChips && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        marginTop: 11,
        paddingBottom: 4,
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch'
      }
    }, BF_WALK_SLOTS.map(t => {
      const on = ownTimes.includes(t);
      return /*#__PURE__*/React.createElement("button", {
        key: t,
        onClick: () => onToggleTime(k, t),
        style: {
          flex: '0 0 auto',
          height: 38,
          padding: '0 15px',
          borderRadius: 10,
          border: `1.5px solid ${on ? LL.ink : LL.border}`,
          background: on ? LL.ink : '#fff',
          color: on ? '#fff' : LL.text2,
          fontSize: 13.5,
          fontWeight: on ? 700 : 500,
          fontFamily: LL.font,
          cursor: 'pointer',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
          transition: 'all 120ms'
        }
      }, t);
    })), !isFirst && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTop: `1px dashed ${LL.border}`
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontSize: 13,
        color: LL.text2
      }
    }, "\u4E0E ", bfDayLabel(days[0]), " \u76F8\u540C\u65F6\u95F4"), /*#__PURE__*/React.createElement(BFToggle, {
      on: same,
      onChange: v => onToggleSame(k, v)
    })));
  }));
}

// ─── Helpers ──────────────────────────────────────────────────
function bfFmtTime(t) {
  if (!t) return '';
  return `${String(t.h).padStart(2, '0')}:${String(t.m).padStart(2, '0')}`;
}
function bfFmtDate(d) {
  if (!d) return '';
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
function bfDaysBetween(a, b) {
  if (!a || !b) return 0;
  return Math.max(1, Math.round((b - a) / 86400000));
}
function bfIsWithin2Weeks(d) {
  if (!d) return false;
  const today = new Date(2026, 4, 27);
  return (d - today) / 86400000 < 14;
}

// ─── GroupHeader ──────────────────────────────────────────────
function BFGroupHeader({
  title
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#F5F5F9',
      padding: '9px 16px 7px',
      fontSize: 12,
      fontWeight: 600,
      color: LL.text3,
      letterSpacing: '0.04em'
    }
  }, title);
}

// ─── Toggle (bold check, no fill bg) ─────────────────────────
function BFToggle({
  on,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: () => onChange(!on),
    style: {
      width: 48,
      height: 28,
      borderRadius: 14,
      background: on ? LL.ink : '#D0D0DC',
      position: 'relative',
      cursor: 'pointer',
      transition: 'background 180ms',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 3,
      left: on ? 23 : 3,
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
      transition: 'left 180ms',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, on && /*#__PURE__*/React.createElement("i", {
    className: "ph-bold ph-check",
    style: {
      fontSize: 12,
      color: LL.ink
    }
  })));
}

// ─── Wheel Column ─────────────────────────────────────────────
function WheelColumn({
  items,
  value,
  onChange,
  fmt
}) {
  const ITEM_H = 44,
    PAD = 2 * 44;
  const ref = React.useRef(null);
  const timer = React.useRef(null);
  React.useEffect(() => {
    const idx = items.indexOf(value);
    if (ref.current && idx >= 0) ref.current.scrollTop = idx * ITEM_H;
  }, []); // eslint-disable-line
  const onScroll = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.max(0, Math.min(items.length - 1, Math.round(ref.current.scrollTop / ITEM_H)));
      onChange(items[idx]);
      ref.current.scrollTop = idx * ITEM_H;
    }, 120);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: 'relative',
      height: 5 * ITEM_H,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: PAD,
      zIndex: 2,
      background: 'linear-gradient(to bottom,rgba(255,255,255,.96),rgba(255,255,255,0))',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: PAD,
      zIndex: 2,
      background: 'linear-gradient(to top,rgba(255,255,255,.96),rgba(255,255,255,0))',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: PAD,
      left: 6,
      right: 6,
      height: ITEM_H,
      zIndex: 0,
      background: LL.bg,
      borderRadius: 10
    }
  }), /*#__PURE__*/React.createElement("div", {
    ref: ref,
    onScroll: onScroll,
    style: {
      height: '100%',
      overflowY: 'scroll',
      scrollbarWidth: 'none',
      WebkitOverflowScrolling: 'touch'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: PAD
    }
  }), items.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    onClick: () => {
      onChange(item);
      if (ref.current) ref.current.scrollTop = i * ITEM_H;
    },
    style: {
      height: ITEM_H,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      fontVariantNumeric: 'tabular-nums',
      position: 'relative',
      zIndex: 1,
      cursor: 'pointer',
      fontWeight: item === value ? 700 : 400,
      color: item === value ? LL.text : LL.text3
    }
  }, fmt ? fmt(item) : String(item).padStart(2, '0'))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: PAD
    }
  })));
}

// ─── Time Wheel Sheet ─────────────────────────────────────────
const BF_HOURS = Array.from({
  length: 24
}, (_, i) => i);
const BF_MINS = [0, 15, 30, 45];
function TimeWheelSheet({
  open,
  value,
  onConfirm,
  onClose,
  title = '选择时间段'
}) {
  const [h, setH] = React.useState(value?.h ?? 9);
  const [m, setM] = React.useState(value?.m ?? 0);
  React.useEffect(() => {
    if (open) {
      setH(value?.h ?? 9);
      setM(value?.m ?? 0);
    }
  }, [open]); // eslint-disable-line
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.35)',
      zIndex: 85
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 86,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      boxShadow: '0 -8px 24px rgba(0,0,0,0.12)',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '12px auto 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 18px 4px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'transparent',
      border: 0,
      fontSize: 14,
      color: LL.text3,
      cursor: 'pointer',
      fontFamily: LL.font,
      padding: 0
    }
  }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: () => onConfirm({
      h,
      m
    }),
    style: {
      background: 'transparent',
      border: 0,
      fontSize: 14,
      fontWeight: 700,
      color: LL.ink,
      cursor: 'pointer',
      fontFamily: LL.font,
      padding: 0
    }
  }, "\u786E\u5B9A")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px 20px 28px',
      gap: 0
    }
  }, /*#__PURE__*/React.createElement(WheelColumn, {
    items: BF_HOURS,
    value: h,
    onChange: setH
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 700,
      color: LL.text,
      paddingBottom: 4,
      flex: '0 0 auto'
    }
  }, ":"), /*#__PURE__*/React.createElement(WheelColumn, {
    items: BF_MINS,
    value: m,
    onChange: setM,
    fmt: v => String(v).padStart(2, '0')
  }))));
}

// ─── Service Picker ───────────────────────────────────────────
function BFServiceSheet({
  open,
  value,
  options,
  onPick,
  onClose
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.35)',
      zIndex: 85
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 86,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 24,
      boxShadow: '0 -8px 24px rgba(0,0,0,0.10)',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '12px auto 10px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '4px 16px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u9009\u62E9\u670D\u52A1\u7C7B\u578B"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      marginLeft: 'auto',
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: '#F0F0F5',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x",
    style: {
      fontSize: 13,
      color: LL.text
    }
  }))), options.map((svc, i) => {
    const on = value === svc.id;
    const locClr = BF_LOC_COLOR(svc.id);
    return /*#__PURE__*/React.createElement("button", {
      key: svc.id,
      onClick: () => onPick(svc.id),
      style: {
        width: '100%',
        padding: '13px 18px',
        background: 'transparent',
        border: 0,
        cursor: 'pointer',
        fontFamily: LL.font,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: `1px solid ${LL.border}`,
        borderBottom: i === options.length - 1 ? `1px solid ${LL.border}` : 'none',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: on ? 700 : 600,
        color: LL.text
      }
    }, svc.id), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginTop: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        color: locClr.fg,
        background: locClr.bg,
        borderRadius: 4,
        padding: '2px 7px'
      }
    }, BF_SVC_SUB[svc.id] || ''), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: LL.text3
      }
    }, "\xA5", svc.price, "/", svc.unit, "\u8D77"))), on && /*#__PURE__*/React.createElement("i", {
      className: "ph-fill ph-check-circle",
      style: {
        fontSize: 19,
        color: LL.ink
      }
    }));
  })));
}

// ─── Qty Stepper ─────────────────────────────────────────────
function BFStepper({
  value,
  onChange,
  min = 0,
  max = 9
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onChange(Math.max(min, value - 1)),
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: 0,
      background: value <= min ? '#F0F0F6' : LL.ink,
      color: value <= min ? LL.text3 : '#fff',
      fontSize: 18,
      fontWeight: 700,
      cursor: value <= min ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 1,
      transition: 'background 140ms'
    }
  }, "\u2212"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 36,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text,
      fontVariantNumeric: 'tabular-nums'
    }
  }, value), /*#__PURE__*/React.createElement("button", {
    onClick: () => onChange(Math.min(max, value + 1)),
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 18,
      fontWeight: 700,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      lineHeight: 1
    }
  }, "+"));
}

// ─── Price Bar + Drawer ───────────────────────────────────────
function PriceBar({
  service,
  nights,
  petUnitSum,
  extras,
  pricedPets = [],
  overtimeFee = 0,
  onOpen
}) {
  const extrasTotal = extras.reduce((s, e) => s + (e.qty || 0) * e.price, 0);
  const petCount = pricedPets.length || 1;
  const subtotal = petUnitSum * nights + extrasTotal + overtimeFee;
  const total = subtotal;
  const svcUnit = BF_SVC_FORM[service] === 'A' ? service === '日托' ? '天' : '晚' : '次';
  return /*#__PURE__*/React.createElement("button", {
    onClick: onOpen,
    style: {
      width: '100%',
      background: '#fff',
      border: 0,
      borderTop: `1px solid ${LL.border}`,
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      cursor: 'pointer',
      fontFamily: LL.font,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginBottom: 3
    }
  }, service, " \xB7 ", nights > 0 ? `${nights}${svcUnit}${petCount > 1 ? ` × ${petCount}只` : ''}` : '请选择日期'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u603B\u8BA1 \xA5", nights > 0 ? total : '--')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }, "\u67E5\u770B\u660E\u7EC6"), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-up",
    style: {
      fontSize: 12,
      color: LL.text3
    }
  })));
}

// Coupon picker bottom-sheet — choose which coupon to apply
function BFCouponPicker({
  open,
  coupons,
  subtotal,
  selectedId,
  onPick,
  onClose
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.4)',
      zIndex: 92
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 93,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: '0 0 24px',
      boxShadow: '0 -8px 24px rgba(0,0,0,0.12)',
      fontFamily: LL.font,
      maxHeight: '80%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 8px',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '0 auto 10px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u9009\u62E9\u4F18\u60E0\u5238"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      marginLeft: 'auto',
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: '#F0F0F5',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x",
    style: {
      fontSize: 13,
      color: LL.text
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '4px 16px 8px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, coupons.map(c => {
    const disc = bfCouponDiscount(c, subtotal);
    const usable = disc > 0;
    const on = selectedId === c.id;
    return /*#__PURE__*/React.createElement("button", {
      key: c.id,
      disabled: !usable,
      onClick: () => onPick(c.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px',
        borderRadius: 14,
        border: `1.5px solid ${on ? LL.ink : LL.border}`,
        background: usable ? on ? '#FAFAFC' : '#fff' : '#F7F7FA',
        cursor: usable ? 'pointer' : 'not-allowed',
        fontFamily: LL.font,
        textAlign: 'left',
        width: '100%',
        opacity: usable ? 1 : 0.55
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 46,
        height: 46,
        borderRadius: 10,
        background: LL.butter,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "ph ph-ticket",
      style: {
        fontSize: 20,
        color: LL.text
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: LL.text
      }
    }, c.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: LL.text3,
        marginTop: 2
      }
    }, c.desc), !usable && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: '#B45309',
        marginTop: 3
      }
    }, "\u4E0D\u6EE1\u8DB3\u4F7F\u7528\u6761\u4EF6")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, usable && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        fontWeight: 800,
        color: '#E63946'
      }
    }, "-\xA5", disc), on ? /*#__PURE__*/React.createElement("i", {
      className: "ph-fill ph-check-circle",
      style: {
        fontSize: 20,
        color: LL.ink
      }
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        width: 20,
        height: 20,
        borderRadius: '50%',
        border: `1.5px solid ${LL.border}`
      }
    })));
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => onPick(null),
    style: {
      padding: '13px',
      borderRadius: 14,
      border: `1.5px solid ${selectedId == null ? LL.ink : LL.border}`,
      background: selectedId == null ? '#FAFAFC' : '#fff',
      cursor: 'pointer',
      fontFamily: LL.font,
      fontSize: 14,
      fontWeight: 600,
      color: LL.text2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, selectedId == null && /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-check-circle",
    style: {
      fontSize: 16,
      color: LL.ink
    }
  }), "\u4E0D\u4F7F\u7528\u4F18\u60E0\u5238"))));
}
function PriceDrawer({
  open,
  onClose,
  service,
  nights,
  petUnitSum,
  pricedPets = [],
  extras,
  overtimeFee = 0,
  overtimeRate = 0,
  coupon,
  onOpenCoupon,
  bottomOffset = 0
}) {
  if (!open) return null;
  const extrasWithQty = extras.filter(e => (e.qty || 0) > 0);
  const svcUnit = BF_SVC_FORM[service] === 'A' ? service === '日托' ? '天' : '晚' : '次';
  const svcTotal = petUnitSum * nights;
  const extrasTotal = extrasWithQty.reduce((s, e) => s + e.qty * e.price, 0);
  const subtotal = svcTotal + extrasTotal + overtimeFee;
  const discount = bfCouponDiscount(coupon, subtotal);
  const total = subtotal - discount;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: bottomOffset,
      background: 'rgba(0,0,0,0.35)',
      zIndex: 85
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: bottomOffset,
      zIndex: 86,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: '0 0 4px',
      boxShadow: '0 -8px 24px rgba(0,0,0,0.10)',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '12px auto 10px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '4px 16px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u8D39\u7528\u660E\u7EC6"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      marginLeft: 'auto',
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: '#F0F0F5',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x",
    style: {
      fontSize: 13,
      color: LL.text
    }
  }))), (pricedPets.length ? pricedPets : [{
    name: '宠物',
    unit: petUnitSum,
    species: 'dog'
  }]).map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: p.id || i,
    style: {
      padding: '10px 16px',
      borderTop: `1px solid ${LL.border}`,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: LL.text2
    }
  }, p.name, "\uFF08", BF_SPECIES_CN[p.species] || '宠物', "\uFF09\xA5", p.unit, "/", svcUnit, " \xD7 ", nights, svcUnit), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: LL.text
    }
  }, "\xA5", p.unit * nights))), extrasWithQty.map(e => /*#__PURE__*/React.createElement("div", {
    key: e.id,
    style: {
      padding: '10px 16px',
      borderTop: `1px solid ${LL.border}`,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: LL.text2
    }
  }, e.label, " \xD7 ", e.qty), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: LL.text
    }
  }, "+\xA5", e.qty * e.price))), overtimeFee > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px',
      borderTop: `1px solid ${LL.border}`,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: LL.text2
    }
  }, "\u5EF6\u65F6\u8D39\uFF08\u63A5\u56DE\u665A\u4E8E\u9001\u8FBE \xB7 \u5F53\u65E5\u4EF7\xD7", Math.round(overtimeRate * 100), "%\uFF09"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: LL.text
    }
  }, "+\xA5", overtimeFee)), /*#__PURE__*/React.createElement("button", {
    onClick: onOpenCoupon,
    style: {
      width: '100%',
      padding: '10px 16px',
      borderTop: `1px solid ${LL.border}`,
      background: 'transparent',
      border: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-ticket",
    style: {
      fontSize: 15,
      color: coupon ? '#E63946' : LL.text3
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: coupon ? '#E63946' : LL.text2
    }
  }, coupon ? coupon.name : '优惠券')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, discount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: '#E63946'
    }
  }, "-\xA5", discount), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: LL.ink,
      fontWeight: 600
    }
  }, coupon ? '更换' : '选择'), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 11,
      color: LL.ink
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      borderTop: `2px solid ${LL.border}`,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u603B\u8BA1"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: LL.text
    }
  }, "\xA5", total))));
}

// ─── Form A date drawer — scrollable months, no per-day price ──
function DateRangeDrawer({
  open,
  value,
  bookedDates,
  svcUnit = '晚',
  onApply,
  onClose
}) {
  const [draft, setDraft] = React.useState(value || {
    start: null,
    end: null
  });
  React.useEffect(() => {
    if (open) setDraft(value || {
      start: null,
      end: null
    });
  }, [open]); // eslint-disable-line
  if (!open) return null;
  const n = draft.start && draft.end ? bfDaysBetween(draft.start, draft.end) : 0;
  const canApply = !!(draft.start && draft.end);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.4)',
      zIndex: 88
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 89,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      boxShadow: '0 -8px 24px rgba(0,0,0,0.12)',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '0 auto 10px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u9009\u62E9\u670D\u52A1\u65E5\u671F"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      marginLeft: 'auto',
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: '#F0F0F5',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x",
    style: {
      fontSize: 13,
      color: LL.text
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '2px 16px 4px'
    }
  }, typeof GuardianCalendar === 'function' && /*#__PURE__*/React.createElement(GuardianCalendar, {
    bookedDates: bookedDates,
    svcPrice: null,
    viewOnly: false,
    scroll: true,
    monthsCount: 9,
    start: draft.start,
    end: draft.end,
    onChange: setDraft
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px 22px',
      borderTop: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text2,
      marginBottom: 8,
      textAlign: 'center',
      minHeight: 18
    }
  }, draft.start ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text,
      fontWeight: 700
    }
  }, bfFmtDate(draft.start)), /*#__PURE__*/React.createElement("span", {
    style: {
      margin: '0 6px'
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text,
      fontWeight: 700
    }
  }, draft.end ? bfFmtDate(draft.end) : '...'), n > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 8,
      color: LL.text2
    }
  }, "\u5171 ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: LL.text
    }
  }, n), " ", svcUnit)) : '请在日历上选择开始日期'), /*#__PURE__*/React.createElement("button", {
    disabled: !canApply,
    onClick: () => onApply(draft),
    style: {
      width: '100%',
      height: 50,
      borderRadius: 999,
      border: 0,
      background: canApply ? LL.ink : LL.inkDisabled,
      color: '#fff',
      fontSize: 16,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: canApply ? 'pointer' : 'not-allowed',
      letterSpacing: '0.06em'
    }
  }, "\u5E94\u7528\u65E5\u671F"))));
}

// ─── Address map page (pick service location) ─────────────────
const BF_POIS = [{
  poi: '望京SOHO',
  area: '北京市朝阳区阜通东大街6号'
}, {
  poi: '融科橄榄城',
  area: '北京市朝阳区望京西园三区'
}, {
  poi: '望京新城',
  area: '北京市朝阳区广顺南大街12号'
}];
function AddressMapScreen({
  initial,
  onConfirm,
  onClose
}) {
  const [poiIdx, setPoiIdx] = React.useState(() => {
    if (initial) {
      const i = BF_POIS.findIndex(p => p.poi === initial.poi);
      return i >= 0 ? i : 0;
    }
    return 0;
  });
  const [detail, setDetail] = React.useState(initial?.detail || '');
  const [saveAsMine, setSaveAsMine] = React.useState(true);
  const poi = BF_POIS[poiIdx];
  const mapImg = window.__resources && window.__resources.mapImg || './assets/map.png';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 92,
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      height: 52,
      background: '#fff',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      background: 'transparent',
      border: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      padding: 0,
      color: LL.text2,
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 16
    }
  }), " \u8FD4\u56DE"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u9009\u62E9\u670D\u52A1\u5730\u5740"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
      background: '#D8E8F0',
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: mapImg,
    alt: "\u5730\u56FE",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    },
    onError: e => {
      e.target.style.display = 'none';
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 12,
      left: 12,
      right: 12,
      height: 40,
      background: '#fff',
      borderRadius: 999,
      boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-magnifying-glass",
    style: {
      fontSize: 15,
      color: LL.text3
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: LL.text3
    }
  }, "\u641C\u7D22\u5C0F\u533A / \u5730\u5740")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      top: '46%',
      transform: 'translate(-50%,-100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.ink,
      color: '#fff',
      fontSize: 12,
      fontWeight: 700,
      padding: '5px 10px',
      borderRadius: 8,
      whiteSpace: 'nowrap',
      marginBottom: 4,
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }
  }, poi.poi), /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-map-pin",
    style: {
      fontSize: 34,
      color: '#E63946',
      filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.25))'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff',
      boxShadow: '0 -4px 16px rgba(0,0,0,0.08)',
      padding: '14px 16px 22px',
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginBottom: 8
    }
  }, "\u9009\u62E9\u9644\u8FD1\u5730\u5740"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      marginBottom: 14
    }
  }, BF_POIS.map((p, i) => {
    const on = i === poiIdx;
    return /*#__PURE__*/React.createElement("button", {
      key: p.poi,
      onClick: () => setPoiIdx(i),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 10,
        border: 0,
        background: on ? '#F3F1FA' : 'transparent',
        cursor: 'pointer',
        fontFamily: LL.font,
        textAlign: 'left',
        width: '100%'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `${on ? 'ph-fill' : 'ph'} ph-map-pin`,
      style: {
        fontSize: 16,
        color: on ? LL.ink : LL.text3,
        flex: '0 0 auto'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        fontWeight: on ? 700 : 600,
        color: LL.text
      }
    }, p.poi), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: LL.text3,
        marginTop: 1
      }
    }, p.area)), on && /*#__PURE__*/React.createElement("i", {
      className: "ph-fill ph-check-circle",
      style: {
        fontSize: 17,
        color: LL.ink,
        flex: '0 0 auto'
      }
    }));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 14px',
      background: LL.bg,
      borderRadius: 12,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: LL.text2,
      flex: '0 0 auto'
    }
  }, "\u8BE6\u7EC6\u5730\u5740"), /*#__PURE__*/React.createElement("input", {
    value: detail,
    onChange: e => setDetail(e.target.value),
    placeholder: "\u697C\u53F7 / \u5355\u5143 / \u95E8\u724C\u53F7",
    style: {
      flex: 1,
      border: 0,
      outline: 'none',
      background: 'transparent',
      fontSize: 13.5,
      color: LL.text,
      fontFamily: LL.font,
      textAlign: 'right',
      caretColor: LL.ink
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSaveAsMine(v => !v),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      background: 'transparent',
      border: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      padding: '0 0 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 20,
      height: 20,
      borderRadius: 6,
      flex: '0 0 auto',
      background: saveAsMine ? LL.ink : 'transparent',
      boxShadow: saveAsMine ? 'none' : `inset 0 0 0 1.5px ${LL.text3}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, saveAsMine && /*#__PURE__*/React.createElement("i", {
    className: "ph-bold ph-check",
    style: {
      fontSize: 12,
      color: '#fff'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: LL.text2
    }
  }, "\u6DFB\u52A0\u4E3A\u6211\u7684\u5730\u5740")), /*#__PURE__*/React.createElement("button", {
    onClick: () => onConfirm({
      poi: poi.poi,
      area: poi.area,
      detail: detail.trim(),
      saveAsMine
    }),
    style: {
      width: '100%',
      height: 50,
      borderRadius: 999,
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 16,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer',
      letterSpacing: '0.06em'
    }
  }, "\u786E\u8BA4\u5730\u5740")));
}

// ─── Recommendation Screen ────────────────────────────────────
function RecommendationScreen({
  guardian,
  service,
  dateRange,
  pets,
  message: initMsg,
  onContact,
  onSkip
}) {
  const [checked, setChecked] = React.useState({
    r1: true,
    r3: false,
    r4: false
  });
  const [msg, setMsg] = React.useState(initMsg || '');
  const nearbyWarning = bfIsWithin2Weeks(dateRange?.start);
  const svcUnit = BF_SVC_FORM[service] === 'A' ? service === '日托' ? '天' : '晚' : '次';
  const svc = guardian?.services?.find(s => s.id === service);
  const petsEnabled = pets ? Object.keys(pets).filter(id => pets[id]).length : 1;
  const _g1 = window.__resources && window.__resources.guardian1 || './assets/guardian1.png';
  const _g3 = window.__resources && window.__resources.guardian3 || './assets/guardian3.png';
  const photoMap = {
    r1: _g1,
    r3: _g3
  };
  const anyChecked = Object.values(checked).some(Boolean);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      overflow: 'hidden',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      height: 52,
      background: '#fff',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u9884\u7EA6\u8BE6\u60C5")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      background: LL.bg
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '14px 16px',
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginBottom: 4
    }
  }, service), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: LL.text
    }
  }, "\u4ECE", bfFmtDate(dateRange?.start), "\u5F00\u59CB", ' · ', petsEnabled, "\u53EA\u5BA0\u7269", svc ? ` · ¥${svc.price}/${svcUnit}` : ''), nearbyWarning && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      display: 'inline-flex',
      alignItems: 'center',
      background: '#FFF3CD',
      border: '1px solid #F0B100',
      borderRadius: 6,
      padding: '3px 10px',
      fontSize: 12,
      fontWeight: 700,
      color: '#B45309'
    }
  }, "\u4E34\u8FD1\u9884\u7EA6")), nearbyWarning && /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '12px 16px 0',
      padding: '12px 14px',
      background: '#FFFBEB',
      border: '1px solid #FDE68A',
      borderRadius: 10,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      flex: '0 0 auto',
      marginTop: 1
    }
  }, "\u2139\uFE0F"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: '#92400E',
      lineHeight: 1.6
    }
  }, "\u8DDD\u79BB\u670D\u52A1\u65E5\u671F\u4E0D\u8DB32\u5468\uFF0C\u5B88\u62A4\u8005\u6863\u671F\u8F83\u7D27\u5F20\uFF0C\u5EFA\u8BAE\u540C\u65F6\u8054\u7CFB\u66F4\u591A\u5B88\u62A4\u8005\u4EE5\u63D0\u9AD8\u6210\u529F\u7387\u3002")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 4
    }
  }, "\u540C\u65F6\u8054\u7CFB\u5176\u4ED6\u5B88\u62A4\u8005"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: LL.border,
      marginBottom: 12
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, BF_RECS.map((rec, i) => {
    const photo = photoMap[rec.id] || rec.photo;
    const on = checked[rec.id];
    return /*#__PURE__*/React.createElement("div", {
      key: rec.id,
      onClick: () => setChecked(c => ({
        ...c,
        [rec.id]: !c[rec.id]
      })),
      style: {
        background: '#fff',
        borderRadius: 14,
        padding: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        border: on ? `1.5px solid ${LL.ink}` : `1.5px solid ${LL.border}`,
        transition: 'border-color 160ms'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: 4,
        border: 0,
        flex: '0 0 auto',
        background: on ? LL.ink : 'transparent',
        boxShadow: on ? 'none' : `inset 0 0 0 1.5px ${LL.text3}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 160ms'
      }
    }, on && /*#__PURE__*/React.createElement("i", {
      className: "ph-bold ph-check",
      style: {
        fontSize: 11,
        color: '#fff'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 44,
        height: 44,
        borderRadius: '50%',
        overflow: 'hidden',
        flex: '0 0 auto',
        background: rec.bg || LL.lavender
      }
    }, photo && /*#__PURE__*/React.createElement("img", {
      src: photo,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'top center'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: LL.text
      }
    }, rec.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: LL.text3,
        marginTop: 2
      }
    }, rec.area), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: LL.text2,
        marginTop: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", null, "\u2B50", rec.rating, " \xB7 ", rec.reviews, "\u6761\u8BC4\u4EF7")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: LL.text3,
        marginTop: 2
      }
    }, "\uD83D\uDD01 ", rec.repeats, "\u4F4D\u56DE\u5934\u5BA0\u4E3B")), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'right',
        flex: '0 0 auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 18,
        fontWeight: 800,
        color: BF_MINT_DARK
      }
    }, "\xA5", rec.price), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: LL.text3
      }
    }, "/", rec.unit)));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '16px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 8
    }
  }, "\u7559\u8A00"), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 12,
      padding: '12px 14px'
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    value: msg,
    onChange: e => setMsg(e.target.value),
    style: {
      width: '100%',
      minHeight: 80,
      border: 'none',
      outline: 'none',
      resize: 'none',
      fontSize: 14,
      color: LL.text,
      lineHeight: 1.7,
      fontFamily: LL.font,
      background: 'transparent',
      boxSizing: 'border-box'
    },
    placeholder: "\u5411\u5B88\u62A4\u8005\u4ECB\u7ECD\u60A8\u7684\u5BA0\u7269\u548C\u9700\u6C42\u2026"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 16
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff',
      borderTop: `1px solid ${LL.border}`,
      padding: '12px 16px 28px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => onContact(checked, msg),
    disabled: !anyChecked,
    style: {
      width: '100%',
      height: 52,
      borderRadius: 999,
      border: 0,
      background: anyChecked ? LL.ink : LL.inkDisabled,
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: anyChecked ? 'pointer' : 'not-allowed',
      marginBottom: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      letterSpacing: '0.04em'
    }
  }, "\u8054\u7CFB\u8FD9\u4E9B\u5B88\u62A4\u8005"), /*#__PURE__*/React.createElement("button", {
    onClick: onSkip,
    style: {
      width: '100%',
      height: 40,
      background: 'transparent',
      border: 0,
      fontSize: 14,
      color: LL.text3,
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, "\u8DF3\u8FC7")));
}

// ─── Success Screen ───────────────────────────────────────────
const BF_STEPS = [{
  icon: 'clock',
  title: '守护者即将回复',
  desc: '您联系的守护者通常会在30分钟内回复。'
}, {
  icon: 'chat-circle-text',
  title: '安排会面熟悉',
  desc: '守护者回复后，可以约一次服务前的线下见面，让您、您的宠物和守护者互相认识。'
}, {
  icon: 'calendar-check',
  title: '确认预约',
  desc: '见面满意后通过平台完成预约确认和付款，平台全程保障您的权益。'
}];
function BFSuccessScreen({
  guardian,
  onGoToOrders
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      overflow: 'hidden',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      height: 52,
      background: '#fff',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u9884\u7EA6\u8BE6\u60C5")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      background: LL.bg
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '28px 24px 24px',
      display: 'flex',
      alignItems: 'center',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 56,
      height: 56,
      borderRadius: '50%',
      background: BF_MINT,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-check-circle",
    style: {
      fontSize: 28,
      color: BF_MINT_DARK
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 30,
      fontWeight: 800,
      color: LL.text,
      letterSpacing: '-0.02em',
      lineHeight: 1.2
    }
  }, "\u7533\u8BF7\u5DF2\u53D1\u51FA")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderTop: `1px solid ${LL.border}`,
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text2,
      lineHeight: 1.55
    }
  }, "\u60A8\u7684\u5BA0\u7269\u8D44\u6599\u5B8C\u6210\u5EA6 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#E63946',
      fontWeight: 700
    }
  }, "<60%"), "\uFF0C\u5B8C\u5584\u5BA0\u7269\u8D44\u6599\u53EF\u4EE5\u63D0\u9AD8\u63A5\u5355\u7387\uFF0C\u8BA9\u5B88\u62A4\u8005\u66F4\u597D\u5730\u7167\u987E\u60A8\u7684\u5B9D\u8D1D\u54E6")), /*#__PURE__*/React.createElement("button", {
    style: {
      height: 32,
      padding: '0 14px',
      borderRadius: 999,
      border: `1.5px solid ${LL.ink}`,
      background: 'transparent',
      color: LL.ink,
      fontSize: 12.5,
      fontWeight: 700,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      fontFamily: LL.font,
      flex: '0 0 auto'
    }
  }, "\u53BB\u5B8C\u5584")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      marginTop: 12
    }
  }, BF_STEPS.map((step, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 16,
      padding: '18px 20px',
      borderBottom: i < BF_STEPS.length - 1 ? `1px solid ${LL.border}` : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 46,
      height: 46,
      borderRadius: '50%',
      border: `1.5px solid ${LL.text3}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${step.icon}`,
    style: {
      fontSize: 22,
      color: LL.text2
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 5
    }
  }, step.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: LL.text2,
      lineHeight: 1.65,
      textWrap: 'pretty'
    }
  }, step.desc))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 20px 48px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onGoToOrders,
    style: {
      width: '100%',
      height: 52,
      borderRadius: 999,
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer',
      letterSpacing: '0.04em'
    }
  }, "\u67E5\u770B\u7533\u8BF7\u5355\u72B6\u6001"))));
}

// ─── Main: BookingFlowScreen ──────────────────────────────────
function BookingFlowScreen({
  guardian,
  initialService,
  initialDateRange,
  initialSchedule,
  myPets,
  onBack,
  onSubmit,
  onGoHome,
  onGoToOrders
}) {
  // ── Resolve initial service
  const resolvedSvc = React.useMemo(() => {
    if (initialService && guardian.services.find(s => s.id === initialService)) return initialService;
    return guardian.services[0]?.id || '寄养';
  }, []); // eslint-disable-line

  // ── Pet list (user's own pets; falls back to demo pets if none passed)
  const petsList = myPets && myPets.length ? myPets : BF_MY_PETS;

  // ── Form state — date defaults to the searched range when provided
  const [service, setService] = React.useState(resolvedSvc);
  const [dateRange, setDateRange] = React.useState(initialDateRange && initialDateRange.start ? initialDateRange : {
    start: null,
    end: null
  });
  const [schedule, setSchedule] = React.useState(initialSchedule || (typeof defaultSchedule === 'function' ? defaultSchedule() : {
    type: 'once',
    dates: {
      start: null,
      end: null
    },
    weekdays: [],
    periods: []
  }));
  const [duration, setDuration] = React.useState(30);
  const [walkTimes, setWalkTimes] = React.useState({});
  const [sameAsFirst, setSameAsFirst] = React.useState({});
  const [dropoff, setDropoff] = React.useState(null);
  const [pickup, setPickup] = React.useState(null);
  const [petEnabled, setPetEnabled] = React.useState(() => Object.fromEntries(petsList.map(p => [p.id, true])));
  const [extras, setExtras] = React.useState({});
  const [coupon, setCoupon] = React.useState(null); // selected coupon object | null
  const [couponOpen, setCouponOpen] = React.useState(false);
  const [smsNotify, setSmsNotify] = React.useState(true);
  const [message, setMessage] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [validated, setValidated] = React.useState(false);
  const [cancelPolicyOpen, setCancelPolicyOpen] = React.useState(false);

  // ── Service address (在宠物主家 services only)
  const [addresses, setAddresses] = React.useState([]);
  const [selectedAddrId, setSelectedAddrId] = React.useState(null);
  const [mapOpen, setMapOpen] = React.useState(false);
  const [editingAddrId, setEditingAddrId] = React.useState(null);

  // ── Screen state: 'form' | 'recommendation' | 'success'
  const [screen, setScreen] = React.useState('form');

  // ── Picker state
  const [picker, setPicker] = React.useState(null);
  const [priceOpen, setPriceOpen] = React.useState(false);
  const bottomAreaRef = React.useRef(null);
  const scrollBodyRef = React.useRef(null);
  const dateRef = React.useRef(null);
  const petRef = React.useRef(null);
  const phoneRef = React.useRef(null);
  const addrRef = React.useRef(null);
  const msgRef = React.useRef(null);
  const [bottomH, setBottomH] = React.useState(0);
  React.useEffect(() => {
    if (bottomAreaRef.current) setBottomH(bottomAreaRef.current.offsetHeight);
  });

  // ── Derived
  const form = BF_SVC_FORM[service] || 'A';
  const isFormB = form === 'B';
  const isHomeguard = service === '伴宠留宿';
  const isPetHome = BF_SVC_SUB[service] === '在宠物主家';

  // ── Per-day walk-time picker (遛狗 / 上门喂养) ──
  const serviceDays = React.useMemo(() => isFormB ? bfServiceDays(schedule) : [], [isFormB, schedule]);
  const serviceDaysKey = serviceDays.map(bfDayKey).join(',');
  React.useEffect(() => {
    if (!serviceDays.length) return;
    setWalkTimes(prev => {
      const next = {
        ...prev
      };
      serviceDays.forEach((d, i) => {
        const k = bfDayKey(d);
        if (!(k in next)) next[k] = i === 0 ? bfPeriodDefaults(schedule.periods) : [];
      });
      return next;
    });
  }, [serviceDaysKey, isFormB]); // eslint-disable-line
  const toggleWalkTime = (k, t) => setWalkTimes(prev => {
    const cur = prev[k] || [];
    const has = cur.includes(t);
    return {
      ...prev,
      [k]: has ? cur.filter(x => x !== t) : [...cur, t].sort()
    };
  });
  const toggleSameAsFirst = (k, v) => setSameAsFirst(prev => ({
    ...prev,
    [k]: v
  }));
  const currentSvc = guardian.services.find(s => s.id === service);
  const dropoffLabel = isHomeguard ? '守护者到达时间段' : '送达时间段';
  const pickupLabel = isHomeguard ? '守护者离开时间段' : '接回时间段';

  // Night/session count for price bar
  const nights = React.useMemo(() => {
    if (form === 'A' && dateRange.start && dateRange.end) return bfDaysBetween(dateRange.start, dateRange.end);
    return 0;
  }, [form, dateRange]);
  const sessions = React.useMemo(() => {
    if (form !== 'B') return 0;
    const periods = Math.max(1, schedule.periods?.length || 1);
    if (schedule.type === 'once' && schedule.pickMode === 'single') {
      return (schedule.dates?.days?.length || 0) * periods;
    }
    if (!schedule.dates?.start) return 0;
    if (schedule.type === 'once') {
      const days = schedule.dates.end ? Math.max(1, bfDaysBetween(schedule.dates.start, schedule.dates.end)) : 1;
      return days * periods;
    }
    if (!schedule.weekdays?.length || !schedule.dates?.end) return schedule.weekdays?.length ? schedule.weekdays.length * periods : 0;
    const totalDays = bfDaysBetween(schedule.dates.start, schedule.dates.end);
    return Math.ceil(totalDays / 7) * schedule.weekdays.length * periods;
  }, [form, schedule]);
  const unitCount = form === 'A' ? nights : sessions;

  // Cancel deadline date (1 day before service start)
  const cancelDate = React.useMemo(() => {
    const start = form === 'A' ? dateRange.start : schedule.dates?.start;
    if (!start) return null;
    const d = new Date(start);
    d.setDate(d.getDate() - 1);
    return d;
  }, [form, dateRange, schedule]);
  const cancelDateStr = cancelDate ? bfFmtDate(cancelDate) : '服务前一天';

  // Validation errors (only active after first submit attempt)
  const errors = React.useMemo(() => {
    if (!validated) return {};
    return {
      date: isFormB ? schedule.type === 'once' && schedule.pickMode === 'single' ? !schedule.dates?.days?.length : !schedule.dates?.start : !dateRange.start || !dateRange.end,
      pet: !Object.values(petEnabled).some(Boolean),
      address: isPetHome && !selectedAddrId,
      phone: !phone.trim(),
      message: !message.trim()
    };
  }, [validated, isFormB, schedule, dateRange, petEnabled, phone, message, isPetHome, selectedAddrId]);

  // Pet count for pricing
  const petCount = Math.max(1, Object.values(petEnabled).filter(Boolean).length);

  // ── Per-species pricing — dog & cat priced separately (not ×count) ──
  const speciesPriceFor = pet => {
    const sp = pet?.species || bfSpeciesFromBreed(pet?.breed);
    const tab = currentSvc?.petPricingTabs?.find(t => t.type === sp);
    const base = tab?.weights?.[0]?.price;
    return typeof base === 'number' ? base : currentSvc?.price || 0;
  };
  const pricedPets = petsList.filter(p => petEnabled[p.id]).map(p => ({
    id: p.id,
    name: p.name,
    species: p.species || bfSpeciesFromBreed(p.breed),
    unit: speciesPriceFor(p)
  }));
  const petUnitSum = pricedPets.reduce((s, p) => s + p.unit, 0) || currentSvc?.price || 0;

  // ── Overtime fee (Form A): 接回 later in the day than 送达 ──
  const overtime = React.useMemo(() => {
    if (form !== 'A' || !dropoff || !pickup) return {
      mins: 0,
      fee: 0,
      rate: 0
    };
    const diff = pickup.h * 60 + (pickup.m || 0) - (dropoff.h * 60 + (dropoff.m || 0));
    if (diff <= 0) return {
      mins: 0,
      fee: 0,
      rate: 0
    };
    const rate = diff > 8 * 60 ? 1 : 0.5;
    return {
      mins: diff,
      fee: Math.round(petUnitSum * rate),
      rate
    };
  }, [form, dropoff, pickup, petUnitSum]);

  // Label for the enabled pets (used on the order card / summary)
  const petLabel = React.useMemo(() => {
    const en = petsList.filter(p => petEnabled[p.id]);
    if (!en.length) return '我的宠物';
    const names = en.map(p => p.name).filter(Boolean).join('、') || '我的宠物';
    return en[0].breed ? `${en[0].breed}·${names}` : names;
  }, [petEnabled, petsList]);

  // Extras array for price bar / drawer (qty-based)
  const extrasArr = BF_EXTRAS.map(e => ({
    ...e,
    qty: extras[e.id] || 0
  }));

  // Date summary for the date row (Form B only)
  const dateSummaryB = React.useMemo(() => {
    if (!isFormB) return null;
    return typeof summarizeQuery === 'function' ? summarizeQuery({
      svcType: service,
      dateRange,
      schedule
    }) : null;
  }, [isFormB, service, dateRange, schedule]);

  // Date summary for Form A single-line row: "x月x日-x月x日 共N晚"
  const dateSummaryA = React.useMemo(() => {
    if (isFormB || !dateRange.start || !dateRange.end) return null;
    const n = bfDaysBetween(dateRange.start, dateRange.end);
    const unit = currentSvc?.unit || '晚';
    return `${bfFmtDate(dateRange.start)}-${bfFmtDate(dateRange.end)} 共${n}${unit}`;
  }, [isFormB, dateRange, currentSvc]);

  // ── Address helpers
  const selectedAddr = addresses.find(a => a.id === selectedAddrId) || null;
  const openAddrNew = () => {
    setEditingAddrId(null);
    setMapOpen(true);
  };
  const openAddrEdit = id => {
    setEditingAddrId(id);
    setMapOpen(true);
  };
  const handleAddrConfirm = ({
    poi,
    area,
    detail
  }) => {
    if (editingAddrId) {
      setAddresses(prev => prev.map(a => a.id === editingAddrId ? {
        ...a,
        poi,
        area,
        detail
      } : a));
      setSelectedAddrId(editingAddrId);
    } else {
      const id = `addr-${Date.now()}`;
      setAddresses(prev => [...prev, {
        id,
        poi,
        area,
        detail
      }]);
      setSelectedAddrId(id);
    }
    setMapOpen(false);
    setEditingAddrId(null);
  };

  // Auto-fill message
  React.useEffect(() => {
    const enabledPets = petsList.filter(p => petEnabled[p.id]);
    const petName = enabledPets.length > 0 ? enabledPets.map(p => p.name).join('和') : '[宠物名]';
    let ds = '';
    if (form === 'A' && dateRange.start) ds = bfFmtDate(dateRange.start);else if (form === 'B') {
      if (schedule.pickMode === 'single' && schedule.dates?.days?.length) {
        const sorted = schedule.dates.days.slice().sort((a, b) => a - b);
        ds = bfFmtDate(sorted[0]);
      } else if (schedule.dates?.start) {
        ds = bfFmtDate(schedule.dates.start);
      }
    }
    const dateStr = ds || '[预约日期]';
    let tmpl = '';
    if (service === '寄养' || service === '日托') {
      tmpl = `您好！想请问一下您在 ${dateStr} 方便在您家照看我的宝贝 ${petName} 吗？`;
    } else if (service === '上门喂养' || service === '伴宠留宿') {
      tmpl = `您好！想请问一下您在 ${dateStr} 方便来我家照看我的宝贝 ${petName} 吗？`;
    } else if (service === '遛狗') {
      tmpl = `您好！想请问一下您在 ${dateStr} 方便来我家遛 ${petName} 吗？`;
    } else {
      tmpl = enabledPets.length > 0 ? `您好！想请问一下您在 ${dateStr} 方便帮我照看 ${petName} 吗？` : '';
    }
    setMessage(tmpl);
  }, [petEnabled, dateRange, schedule, form, service]);

  // ── Handlers
  const handleApply = () => {
    setValidated(true);
    const hasDateErr = isFormB ? schedule.type === 'once' && schedule.pickMode === 'single' ? !schedule.dates?.days?.length : !schedule.dates?.start : !dateRange.start || !dateRange.end;
    const hasPetErr = !Object.values(petEnabled).some(Boolean);
    const hasAddrErr = isPetHome && !selectedAddrId;
    const hasPhoneErr = !phone.trim();
    const hasMsgErr = !message.trim();
    if (hasDateErr || hasPetErr || hasAddrErr || hasPhoneErr || hasMsgErr) {
      const target = hasDateErr ? dateRef : hasPetErr ? petRef : hasAddrErr ? addrRef : hasPhoneErr ? phoneRef : msgRef;
      if (target.current && scrollBodyRef.current) {
        scrollBodyRef.current.scrollTop = target.current.offsetTop - 60;
      }
      return;
    }
    setScreen('recommendation');
  };
  const handleContact = (recChecked, recMsg) => {
    const additionalGuardians = BF_RECS.filter(r => recChecked[r.id]);
    onSubmit?.({
      guardian,
      service,
      dateRange,
      schedule,
      additionalGuardians,
      pet: petLabel,
      phone,
      address: selectedAddr || null,
      message: recMsg,
      dropoff: dropoff ? bfFmtTime(dropoff) : null,
      pickup: pickup ? bfFmtTime(pickup) : null,
      nights: unitCount,
      unitPrice: petUnitSum || currentSvc?.price || 0,
      petBreakdown: pricedPets,
      extrasList: extrasArr.filter(e => (e.qty || 0) > 0).map(e => ({
        label: e.label,
        price: e.price,
        qty: e.qty
      })),
      overtimeFee: overtime.fee,
      overtimeRate: overtime.rate,
      coupon: coupon || null
    });
    setScreen('success');
  };
  const handleSkip = () => {
    onSubmit?.({
      guardian,
      service,
      dateRange,
      schedule,
      additionalGuardians: [],
      pet: petLabel,
      phone,
      address: selectedAddr || null,
      message,
      dropoff: dropoff ? bfFmtTime(dropoff) : null,
      pickup: pickup ? bfFmtTime(pickup) : null,
      nights: unitCount,
      unitPrice: petUnitSum || currentSvc?.price || 0,
      petBreakdown: pricedPets,
      extrasList: extrasArr.filter(e => (e.qty || 0) > 0).map(e => ({
        label: e.label,
        price: e.price,
        qty: e.qty
      })),
      overtimeFee: overtime.fee,
      overtimeRate: overtime.rate,
      coupon: coupon || null
    });
    setScreen('success');
  };

  // ── Render: Success
  if (screen === 'success') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement(BFSuccessScreen, {
      guardian: guardian,
      onGoToOrders: () => onGoToOrders?.()
    }));
  }

  // ── Render: Recommendation
  if (screen === 'recommendation') {
    return /*#__PURE__*/React.createElement(RecommendationScreen, {
      guardian: guardian,
      service: service,
      dateRange: dateRange,
      pets: petEnabled,
      message: message,
      onContact: handleContact,
      onSkip: handleSkip
    });
  }

  // ── Render: Main Form
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      height: 52,
      background: '#fff',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      background: 'transparent',
      border: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      padding: 0,
      color: LL.text2,
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 16,
      color: LL.text2
    }
  }), "\u8FD4\u56DE"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u9884\u7EA6\u8BE6\u60C5"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48
    }
  })), /*#__PURE__*/React.createElement("div", {
    ref: scrollBodyRef,
    style: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      background: LL.bg
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(BFGroupHeader, {
    title: "\u670D\u52A1"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPicker('service'),
    style: {
      width: '100%',
      padding: '15px 16px',
      background: '#fff',
      border: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      cursor: 'pointer',
      fontFamily: LL.font,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: LL.text
    }
  }, service), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color: BF_LOC_COLOR(service).fg,
      background: BF_LOC_COLOR(service).bg,
      borderRadius: 4,
      padding: '2px 8px'
    }
  }, BF_SVC_SUB[service]))), /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${BF_SVC_ICON[service]}`,
    style: {
      fontSize: 30,
      color: LL.text3
    }
  }), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 13,
      color: LL.text3
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    },
    ref: dateRef
  }, /*#__PURE__*/React.createElement(BFGroupHeader, {
    title: "\u65F6\u95F4"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff'
    }
  }, !isFormB && /*#__PURE__*/React.createElement("button", {
    onClick: () => setPicker('dateA'),
    style: {
      width: '100%',
      padding: '14px 16px',
      background: 'transparent',
      border: 0,
      display: 'flex',
      alignItems: 'center',
      borderBottom: `1px solid ${LL.border}`,
      cursor: 'pointer',
      fontFamily: LL.font,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: LL.text,
      flex: '0 0 auto'
    }
  }, "\u670D\u52A1\u65E5\u671F"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      marginLeft: 'auto',
      marginRight: 4,
      color: dateSummaryA ? LL.text : LL.text3,
      fontWeight: dateSummaryA ? 600 : 400
    }
  }, dateSummaryA || '添加日期'), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 12,
      color: LL.text3
    }
  })), isFormB && /*#__PURE__*/React.createElement("button", {
    onClick: () => setPicker('dateB'),
    style: {
      width: '100%',
      padding: '14px 16px',
      background: 'transparent',
      border: 0,
      display: 'flex',
      alignItems: 'center',
      borderBottom: `1px solid ${LL.border}`,
      cursor: 'pointer',
      fontFamily: LL.font,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: LL.text,
      flex: 1
    }
  }, "\u65E5\u671F\u4E0E\u65F6\u6BB5"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      marginRight: 4,
      color: dateSummaryB ? LL.text : LL.text3,
      fontWeight: dateSummaryB ? 600 : 400
    }
  }, dateSummaryB || '添加日期'), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 12,
      color: LL.text3
    }
  })), isFormB && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: LL.text,
      flex: 1
    }
  }, "\u670D\u52A1\u65F6\u957F"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, [30, 60].map(min => /*#__PURE__*/React.createElement("button", {
    key: min,
    onClick: () => setDuration(min),
    style: {
      height: 32,
      padding: '0 16px',
      borderRadius: 999,
      border: 0,
      background: duration === min ? LL.ink : '#F0F0F6',
      color: duration === min ? '#fff' : LL.text2,
      fontSize: 13,
      fontWeight: duration === min ? 700 : 500,
      cursor: 'pointer',
      fontFamily: LL.font,
      transition: 'all 140ms'
    }
  }, min, "\u5206\u949F")))), !isFormB && /*#__PURE__*/React.createElement("button", {
    onClick: () => setPicker('dropoff'),
    style: {
      width: '100%',
      padding: '14px 16px',
      background: 'transparent',
      border: 0,
      display: 'flex',
      alignItems: 'center',
      borderBottom: `1px solid ${LL.border}`,
      cursor: 'pointer',
      fontFamily: LL.font,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: LL.text,
      flex: 1
    }
  }, dropoffLabel), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      marginRight: 4,
      color: dropoff ? LL.text : LL.text3,
      fontWeight: dropoff ? 600 : 400
    }
  }, dropoff ? bfFmtTime(dropoff) : '添加时间段'), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 12,
      color: LL.text3
    }
  })), !isFormB && /*#__PURE__*/React.createElement("button", {
    onClick: () => setPicker('pickup'),
    style: {
      width: '100%',
      padding: '14px 16px',
      background: 'transparent',
      border: 0,
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      fontFamily: LL.font,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: LL.text,
      flex: 1
    }
  }, pickupLabel), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      marginRight: 4,
      color: pickup ? LL.text : LL.text3,
      fontWeight: pickup ? 600 : 400
    }
  }, pickup ? bfFmtTime(pickup) : '添加时间段'), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }))), errors.date && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 16px 10px',
      fontSize: 12,
      color: '#E63946',
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-warning-circle",
    style: {
      fontSize: 13
    }
  }), isFormB ? '请选择服务日期和时段' : '请选择服务的开始和结束日期')), isFormB && serviceDays.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(BFGroupHeader, {
    title: service === '遛狗' ? '选择遛狗时间' : '选择上门时间'
  }), /*#__PURE__*/React.createElement(BFWalkTimes, {
    days: serviceDays,
    walkTimes: walkTimes,
    sameAsFirst: sameAsFirst,
    onToggleTime: toggleWalkTime,
    onToggleSame: toggleSameAsFirst,
    serviceLabel: service === '遛狗' ? '遛狗' : '上门'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    },
    ref: petRef
  }, /*#__PURE__*/React.createElement(BFGroupHeader, {
    title: "\u5BA0\u7269"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff'
    }
  }, petsList.map(pet => {
    const wt = pet.weight ? String(pet.weight).includes('公斤') ? pet.weight : `${pet.weight}公斤` : null;
    const sub = [pet.breed, wt, pet.age].filter(Boolean).join(' · ');
    return /*#__PURE__*/React.createElement("div", {
      key: pet.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        gap: 12,
        borderBottom: `1px solid ${LL.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 46,
        height: 46,
        borderRadius: '50%',
        background: pet.bg || LL.butter,
        flex: '0 0 auto',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, pet.photo ? /*#__PURE__*/React.createElement("img", {
      src: pet.photo,
      alt: pet.name,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }) : /*#__PURE__*/React.createElement("i", {
      className: "ph ph-paw-print",
      style: {
        fontSize: 22,
        color: LL.text
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: LL.text
      }
    }, pet.name), sub && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: LL.text3,
        marginTop: 2
      }
    }, sub)), /*#__PURE__*/React.createElement(BFToggle, {
      on: petEnabled[pet.id],
      onChange: v => setPetEnabled(prev => ({
        ...prev,
        [pet.id]: v
      }))
    }));
  }), /*#__PURE__*/React.createElement("button", {
    style: {
      width: '100%',
      padding: '14px 16px',
      background: 'transparent',
      border: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: LL.text2
    }
  }, "\u6DFB\u52A0\u5BA0\u7269"), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }))), errors.pet && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 16px 10px',
      fontSize: 12,
      color: '#E63946',
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-warning-circle",
    style: {
      fontSize: 13
    }
  }), "\u8BF7\u81F3\u5C11\u9009\u62E9\u4E00\u53EA\u5BA0\u7269")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(BFGroupHeader, {
    title: "\u989D\u5916\u670D\u52A1\uFF08\u53EF\u9009\uFF09"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff'
    }
  }, BF_EXTRAS.map((ex, i) => {
    const qty = extras[ex.id] || 0;
    return /*#__PURE__*/React.createElement("div", {
      key: ex.id,
      style: {
        padding: '14px 16px',
        borderBottom: i < BF_EXTRAS.length - 1 ? `1px solid ${LL.border}` : 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        color: LL.text
      }
    }, ex.label, " ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: LL.text3,
        fontWeight: 500
      }
    }, "+\xA5", ex.price, "/\u4EFD")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: LL.text3,
        marginTop: 3,
        lineHeight: 1.5
      }
    }, ex.desc)), /*#__PURE__*/React.createElement(BFStepper, {
      value: qty,
      onChange: v => setExtras(prev => ({
        ...prev,
        [ex.id]: v
      }))
    })));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    },
    ref: phoneRef
  }, /*#__PURE__*/React.createElement(BFGroupHeader, {
    title: "\u8054\u7CFB\u65B9\u5F0F"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff'
    }
  }, isPetHome && /*#__PURE__*/React.createElement("div", {
    ref: addrRef,
    style: {
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px 6px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: LL.text
    }
  }, "\u670D\u52A1\u5730\u5740"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: '#E63946',
      marginLeft: 3
    }
  }, "*")), addresses.length === 0 ? /*#__PURE__*/React.createElement("button", {
    onClick: openAddrNew,
    style: {
      width: '100%',
      padding: '2px 16px 14px',
      background: 'transparent',
      border: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      fontFamily: LL.font,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-map-pin",
    style: {
      fontSize: 16,
      color: LL.text3,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: errors.address ? '#E63946' : LL.text3,
      flex: 1
    }
  }, "\u8BF7\u9009\u62E9\u670D\u52A1\u5730\u5740"), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 12,
      color: LL.text3
    }
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '2px 16px 14px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, addresses.map(a => {
    const on = a.id === selectedAddrId;
    return /*#__PURE__*/React.createElement("button", {
      key: a.id,
      onClick: () => setSelectedAddrId(a.id),
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 12,
        border: on ? `1.5px solid ${LL.ink}` : `1.5px solid ${LL.border}`,
        background: on ? '#FAFAFC' : '#fff',
        cursor: 'pointer',
        fontFamily: LL.font,
        textAlign: 'left',
        width: '100%',
        transition: 'border-color 140ms'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `${on ? 'ph-fill' : 'ph'} ph-map-pin`,
      style: {
        fontSize: 16,
        color: on ? LL.ink : LL.text3,
        marginTop: 1,
        flex: '0 0 auto'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        fontWeight: 700,
        color: LL.text
      }
    }, a.poi), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: LL.text3,
        marginTop: 2,
        lineHeight: 1.45
      }
    }, a.area, a.detail ? ` ${a.detail}` : '')), on && /*#__PURE__*/React.createElement("i", {
      className: "ph-fill ph-check-circle",
      style: {
        fontSize: 18,
        color: LL.ink,
        flex: '0 0 auto'
      }
    }));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => openAddrEdit(selectedAddrId),
    style: {
      background: 'transparent',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      fontSize: 13,
      fontWeight: 600,
      color: LL.text2,
      textDecoration: 'underline',
      textUnderlineOffset: '2px'
    }
  }, "\u4FEE\u6539\u5730\u5740"), /*#__PURE__*/React.createElement("button", {
    onClick: openAddrNew,
    style: {
      background: 'transparent',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      fontSize: 13,
      fontWeight: 600,
      color: LL.text2,
      textDecoration: 'underline',
      textUnderlineOffset: '2px'
    }
  }, "\u6DFB\u52A0\u5176\u4ED6\u5730\u5740"))), errors.address && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 10px',
      fontSize: 12,
      color: '#E63946',
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-warning-circle",
    style: {
      fontSize: 13
    }
  }), "\u8BF7\u9009\u62E9\u670D\u52A1\u5730\u5740")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: LL.text,
      flex: '0 0 auto'
    }
  }, "\u624B\u673A\u53F7\u7801"), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    value: phone,
    onChange: e => setPhone(e.target.value),
    placeholder: "\u8BF7\u8F93\u5165\u624B\u673A\u53F7\u7801",
    style: {
      flex: 1,
      border: 0,
      outline: 'none',
      fontSize: 14,
      color: LL.text,
      background: 'transparent',
      fontFamily: LL.font,
      textAlign: 'right',
      caretColor: LL.ink
    }
  })), errors.phone && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 16px 10px',
      fontSize: 12,
      color: '#E63946',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-warning-circle",
    style: {
      fontSize: 13
    }
  }), "\u8BF7\u586B\u5199\u624B\u673A\u53F7\u7801"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: LL.text,
      flex: 1,
      lineHeight: 1.4
    }
  }, guardian.name, "\u56DE\u590D\u65F6", /*#__PURE__*/React.createElement("br", null), "\u53D1\u77ED\u4FE1\u901A\u77E5\u6211"), /*#__PURE__*/React.createElement(BFToggle, {
    on: smsNotify,
    onChange: setSmsNotify
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      marginBottom: 12
    },
    ref: msgRef
  }, /*#__PURE__*/React.createElement(BFGroupHeader, {
    title: "\u7559\u8A00"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    value: message,
    onChange: e => setMessage(e.target.value),
    placeholder: "\u5411\u5B88\u62A4\u8005\u4ECB\u7ECD\u60A8\u7684\u5BA0\u7269\u548C\u9700\u6C42\u2026",
    style: {
      width: '100%',
      minHeight: 88,
      border: 'none',
      outline: 'none',
      resize: 'none',
      fontSize: 14,
      color: LL.text,
      lineHeight: 1.7,
      fontFamily: LL.font,
      background: 'transparent',
      boxSizing: 'border-box'
    }
  })), errors.message && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 16px 10px',
      fontSize: 12,
      color: '#E63946',
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-warning-circle",
    style: {
      fontSize: 13
    }
  }), "\u8BF7\u586B\u5199\u7ED9\u5B88\u62A4\u8005\u7684\u7559\u8A00")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8
    }
  })), /*#__PURE__*/React.createElement("div", {
    ref: bottomAreaRef
  }, currentSvc && /*#__PURE__*/React.createElement(PriceBar, {
    service: service,
    nights: unitCount,
    petUnitSum: petUnitSum,
    extras: extrasArr,
    pricedPets: pricedPets,
    overtimeFee: overtime.fee,
    onOpen: () => setPriceOpen(true)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '10px 16px 20px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleApply,
    style: {
      width: '100%',
      height: 52,
      borderRadius: 999,
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 16,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer',
      letterSpacing: '0.06em',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "\u7533\u8BF7\u9884\u7EA6"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCancelPolicyOpen(true),
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      width: '100%',
      marginTop: 10,
      background: 'transparent',
      border: 0,
      cursor: 'pointer',
      padding: 0,
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-calendar-blank",
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      textDecoration: 'underline'
    }
  }, cancelDateStr, " 12:00\u524D\u53EF\u514D\u8D39\u53D6\u6D88")))), /*#__PURE__*/React.createElement(BFServiceSheet, {
    open: picker === 'service',
    value: service,
    options: guardian.services,
    onPick: v => {
      setService(v);
      setPicker(null);
    },
    onClose: () => setPicker(null)
  }), /*#__PURE__*/React.createElement(DateRangeDrawer, {
    open: picker === 'dateA',
    value: dateRange,
    bookedDates: guardian.bookedDates || [],
    svcUnit: currentSvc?.unit || '晚',
    onApply: d => {
      setDateRange(d);
      setPicker(null);
    },
    onClose: () => setPicker(null)
  }), typeof SchedulePickerSheet === 'function' && /*#__PURE__*/React.createElement(SchedulePickerSheet, {
    open: picker === 'dateB',
    svcType: service,
    applyLabel: "\u5E94\u7528",
    value: schedule,
    onSearch: s => {
      setSchedule(s);
      setPicker(null);
    },
    onClose: () => setPicker(null)
  }), /*#__PURE__*/React.createElement(TimeWheelSheet, {
    open: picker === 'dropoff',
    value: dropoff,
    title: dropoffLabel,
    onConfirm: t => {
      setDropoff(t);
      setPicker(null);
    },
    onClose: () => setPicker(null)
  }), /*#__PURE__*/React.createElement(TimeWheelSheet, {
    open: picker === 'pickup',
    value: pickup,
    title: pickupLabel,
    onConfirm: t => {
      setPickup(t);
      setPicker(null);
    },
    onClose: () => setPicker(null)
  }), /*#__PURE__*/React.createElement(PriceDrawer, {
    open: priceOpen,
    onClose: () => setPriceOpen(false),
    service: service,
    nights: unitCount,
    petUnitSum: petUnitSum,
    pricedPets: pricedPets,
    extras: extrasArr,
    overtimeFee: overtime.fee,
    overtimeRate: overtime.rate,
    coupon: coupon,
    onOpenCoupon: () => setCouponOpen(true),
    bottomOffset: bottomH
  }), /*#__PURE__*/React.createElement(BFCouponPicker, {
    open: couponOpen,
    coupons: BF_COUPONS,
    subtotal: petUnitSum * unitCount + extrasArr.reduce((s, e) => s + (e.qty || 0) * e.price, 0) + overtime.fee,
    selectedId: coupon?.id || null,
    onPick: id => {
      setCoupon(id ? BF_COUPONS.find(c => c.id === id) : null);
      setCouponOpen(false);
    },
    onClose: () => setCouponOpen(false)
  }), cancelPolicyOpen && /*#__PURE__*/React.createElement(CancelPolicyModal, {
    onClose: () => setCancelPolicyOpen(false)
  }), mapOpen && /*#__PURE__*/React.createElement(AddressMapScreen, {
    initial: editingAddrId ? addresses.find(a => a.id === editingAddrId) : null,
    onConfirm: handleAddrConfirm,
    onClose: () => {
      setMapOpen(false);
      setEditingAddrId(null);
    }
  }));
}

// ─── Cancel Policy Modal ──────────────────────────────────────
function CancelPolicyModal({
  onClose
}) {
  const sections = [{
    title: '全额退款',
    icon: 'check-circle',
    color: '#2C7A4B',
    bg: '#E6F1EC',
    text: '在服务开始前一天的 12:00 之前申请取消，可享免费取消（全额退款）。'
  }, {
    title: '部分扣款',
    icon: 'warning',
    color: '#B45309',
    bg: '#FEF3C7',
    text: '在服务开始前一天的 12:00 之后申请取消，将扣除首日服务费的 20%，其余费用退还。'
  }, {
    title: '多日订单',
    icon: 'calendar-blank',
    color: '#2F5F87',
    bg: '#E3EEF7',
    text: '若为连续多日的订单，扣款与退款标准将依据"提交申请当天"与"剩余未服务首日"之间的时差，参照上述规则同理推算。'
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 95
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      right: 16,
      top: '50%',
      transform: 'translateY(-50%)',
      zIndex: 96,
      background: '#fff',
      borderRadius: 20,
      boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
      fontFamily: LL.font,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 20px 14px',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u53D6\u6D88\u653F\u7B56"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginTop: 2
    }
  }, "Lou Lou \u5E73\u53F0\u6807\u51C6\u53D6\u6D88\u6761\u6B3E")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      marginLeft: 'auto',
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: '#F0F0F5',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x",
    style: {
      fontSize: 13,
      color: LL.text
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, sections.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 10,
      background: s.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph-fill ph-${s.icon}`,
    style: {
      fontSize: 17,
      color: s.color
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 4
    }
  }, s.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text2,
      lineHeight: 1.65
    }
  }, s.text)))))));
}

// ─── Cancel Policy (shared, reused by guardian service drawer) ─
const CANCEL_SECTIONS = [{
  title: '全额退款',
  icon: 'check-circle',
  color: '#2C7A4B',
  bg: '#E6F1EC',
  text: '在服务开始前一天的 12:00 之前申请取消，可享免费取消（全额退款）。'
}, {
  title: '部分扣款',
  icon: 'warning',
  color: '#B45309',
  bg: '#FEF3C7',
  text: '在服务开始前一天的 12:00 之后申请取消，将扣除首日服务费的 20%，其余费用退还。'
}, {
  title: '多日订单',
  icon: 'calendar-blank',
  color: '#2F5F87',
  bg: '#E3EEF7',
  text: '若为连续多日的订单，扣款与退款标准将依据当天与剩余未服务首日之间的时差，参照上述规则同理推算。'
}];
function CancelPolicySections() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, CANCEL_SECTIONS.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 10,
      background: s.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph-fill ph-${s.icon}`,
    style: {
      fontSize: 17,
      color: s.color
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 4
    }
  }, s.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text2,
      lineHeight: 1.65
    }
  }, s.text)))));
}
Object.assign(window, {
  BookingFlowScreen,
  CancelPolicyModal,
  CancelPolicySections,
  BF_COUPONS,
  bfCouponDiscount,
  BFCouponPicker
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/BookingFlowScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/BookingRequestScreen.jsx
try { (() => {
// Lou Lou — BookingRequestScreen.jsx
// 订单管理页 + ChatView

const APP_GREEN = '#2C7A4B';
const APP_GREEN_BG = '#E6F1EC';

// ─── helpers ─────────────────────────────────────────────────
function fmtNow() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Resolve a guardian's avatar to the SAME source the profile uses.
// Maps photoKey / './assets/guardianN.png' → inlined __resources; returns
// null when the guardian has no real photo (caller shows the initial char).
function resolveGuardianPhoto(g) {
  if (!g) return null;
  const R = typeof window !== 'undefined' && window.__resources || {};
  if (g.photoKey && R[g.photoKey]) return R[g.photoKey];
  const p = g.photo || '';
  const m = p.match(/guardian(\d)/);
  if (m && R['guardian' + m[1]]) return R['guardian' + m[1]];
  if (/assets\//.test(p)) return null; // unresolved bundled path → no reliable image
  return p || null;
}

// ─── Status definitions ───────────────────────────────────────
// Flow: 发送申请 → 待确认 → 见面邀请 → 守护者确认接单 → 待付款 → 待完成 → 已完成
const STATUS_META = {
  pending: {
    label: '待确认',
    tabKey: '待确认',
    color: '#B45309',
    bg: '#FEF3C7',
    desc: '申请已发出，等待守护者接受'
  },
  accepted: {
    label: '待付款',
    tabKey: '待付款',
    color: APP_GREEN,
    bg: APP_GREEN_BG,
    desc: '守护者已确认接单，请尽快付款'
  },
  in_progress: {
    label: '待完成',
    tabKey: '待完成',
    color: '#2F5F87',
    bg: '#E3EEF7',
    desc: '服务进行中'
  },
  completed: {
    label: '已完成',
    tabKey: '已完成',
    color: '#6B6B7A',
    bg: '#F0F0F5',
    desc: '服务已完成，感谢信任'
  },
  rejected: {
    label: '已拒绝',
    tabKey: '已失效',
    color: '#CC2200',
    bg: '#FFF0F0',
    desc: '守护者暂时无法接受此申请'
  },
  cancelled: {
    label: '已取消',
    tabKey: '已失效',
    color: '#6B6B7A',
    bg: '#F0F0F5',
    desc: '订单已取消'
  }
};
function StatusBadge({
  status
}) {
  const m = STATUS_META[status] || STATUS_META.pending;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 700,
      padding: '3px 9px',
      borderRadius: 999,
      background: m.bg,
      color: m.color,
      flex: '0 0 auto',
      whiteSpace: 'nowrap'
    }
  }, m.label);
}

// ─── Permanent mock apps (always visible) ─────────────────────
const BRS_MOCK_APPS = [{
  id: 'mock-pending-1',
  status: 'pending',
  batchId: 'mock-batch-a',
  batchTime: new Date(2026, 4, 27, 9, 30),
  guardian: {
    id: 'mg1',
    name: '陈美玲',
    bg: '#FBD3C4',
    rating: 4.8,
    services: []
  },
  service: '寄养',
  dateStart: '6月5日',
  dateEnd: '6月7日',
  pet: '金毛·豆豆',
  area: '朝阳区·望京',
  nights: 2,
  price: 88,
  messages: [{
    id: 1,
    from: 'system',
    text: '申请单已发送给 陈美玲，等待守护者回复',
    time: '09:30'
  }]
}, {
  id: 'mock-accepted-1',
  status: 'accepted',
  batchId: 'mock-batch-a',
  batchTime: new Date(2026, 4, 27, 9, 30),
  guardian: {
    id: 'mg2',
    name: '林若',
    bg: '#EDE5F7',
    rating: 4.97,
    services: [{
      id: '日托',
      price: 88,
      unit: '天'
    }]
  },
  service: '日托',
  dateStart: '5月30日',
  dateEnd: null,
  pet: '金毛·豆豆',
  area: '朝阳区·三里屯',
  nights: 1,
  price: 88,
  messages: [{
    id: 1,
    from: 'system',
    text: '申请单已发送给 林若，等待守护者回复',
    time: '08:00'
  }, {
    id: 2,
    from: 'guardian',
    text: '您好！很开心认识您和豆豆。五月底我正好有空，很愿意照顾它。请问豆豆有什么特别需要注意的地方吗？',
    time: '08:15'
  }]
}, {
  id: 'mock-done-1',
  status: 'completed',
  batchId: 'mock-done-batch-1',
  batchTime: new Date(2026, 3, 10, 10, 0),
  guardian: {
    id: 'mg3',
    name: '张敏',
    bg: '#FEE7A6',
    rating: 4.85,
    services: []
  },
  service: '遛狗',
  dateStart: '4月10日',
  dateEnd: null,
  pet: '金毛·豆豆',
  area: '朝阳区·望京',
  nights: 1,
  price: 38,
  messages: []
}, {
  id: 'mock-done-2',
  status: 'completed',
  batchId: 'mock-done-batch-2',
  batchTime: new Date(2026, 3, 18, 9, 0),
  guardian: {
    id: 'mg4',
    name: '林若',
    bg: '#EDE5F7',
    rating: 4.97,
    services: []
  },
  service: '寄养',
  dateStart: '4月18日',
  dateEnd: '4月20日',
  pet: '金毛·豆豆',
  area: '朝阳区·望京',
  nights: 2,
  price: 176,
  messages: []
}];

// ─── Message bubble ───────────────────────────────────────────
function MsgBubble({
  msg,
  photoSrc,
  app,
  onOpenSummary
}) {
  if (msg.from === 'system') {
    // Clickable "已修改订单" message → jump to order detail (summary)
    if (msg.action === 'summary') {
      return /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'center',
          margin: '4px 0 14px',
          padding: '0 16px'
        }
      }, /*#__PURE__*/React.createElement("button", {
        onClick: () => onOpenSummary?.(app),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          maxWidth: '88%',
          background: '#fff',
          border: `1px solid ${LL.border}`,
          borderRadius: 12,
          padding: '9px 13px',
          cursor: 'pointer',
          fontFamily: LL.font,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 26,
          height: 26,
          borderRadius: 7,
          background: '#EEF1F4',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 auto'
        }
      }, /*#__PURE__*/React.createElement("i", {
        className: "ph-fill ph-pencil-simple",
        style: {
          fontSize: 14,
          color: LL.text2
        }
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12.5,
          color: LL.text,
          fontWeight: 500,
          lineHeight: 1.4,
          textAlign: 'left'
        }
      }, msg.text), /*#__PURE__*/React.createElement("i", {
        className: "ph ph-caret-right",
        style: {
          fontSize: 12,
          color: LL.text3,
          flex: '0 0 auto'
        }
      })));
    }
    return /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        fontSize: 12,
        color: LL.text3,
        margin: '4px 0 14px',
        padding: '0 24px'
      }
    }, msg.text);
  }
  const isUser = msg.from === 'user';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      marginBottom: 14,
      alignItems: 'flex-end',
      gap: 8
    }
  }, !isUser && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      overflow: 'hidden',
      flex: '0 0 auto',
      background: app.guardian?.initial?.bg || LL.lavender,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, photoSrc ? /*#__PURE__*/React.createElement("img", {
    src: photoSrc,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'top center'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: LL.text
    }
  }, app.guardian?.initial?.char || app.guardian?.name?.[0])), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '72%',
      padding: '10px 14px',
      fontSize: 13.5,
      lineHeight: 1.58,
      borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
      background: isUser ? LL.ink : '#fff',
      color: isUser ? '#fff' : LL.text,
      boxShadow: isUser ? 'none' : '0 1px 4px rgba(0,0,0,0.06)'
    }
  }, msg.text), isUser && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10,
      color: LL.text3,
      alignSelf: 'flex-end',
      marginBottom: 2
    }
  }, msg.time));
}

// ─── Chat order shortcut button ───────────────────────────────
function ShortcutBtn({
  icon,
  label,
  onClick,
  primary
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      flex: 1,
      height: 38,
      borderRadius: 10,
      border: primary ? 0 : `1px solid ${LL.border}`,
      background: primary ? LL.ink : '#fff',
      color: primary ? '#fff' : LL.text,
      fontSize: 13,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${icon}`,
    style: {
      fontSize: 15
    }
  }), label);
}

// ─── Meet & Greet invite (见面邀约) ───────────────────────────
function meetFmtDate(v) {
  if (!v) return '';
  if (v instanceof Date) return `${v.getMonth() + 1}月${v.getDate()}日`;
  const m = String(v).match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(v);
  return `${parseInt(m[2], 10)}月${parseInt(m[3], 10)}日`;
}
function meetFmtTime(v) {
  if (!v) return '';
  let h, mm;
  if (typeof v === 'object' && v) {
    h = v.h;
    mm = String(v.m).padStart(2, '0');
  } else {
    const m = String(v).match(/(\d{1,2}):(\d{2})/);
    if (!m) return String(v);
    h = parseInt(m[1], 10);
    mm = m[2];
  }
  const ap = h < 12 ? '上午' : '下午';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ap}${h12}:${mm}`;
}

// Shared sub-page header — iOS status bar + 预约详情-style nav bar
// (matches the device status bar and the booking-detail top nav).
function MGNavBar({
  title,
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff'
    }
  }, typeof IOSStatusBar === 'function' && /*#__PURE__*/React.createElement(IOSStatusBar, null), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 52,
      background: '#fff',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      background: 'transparent',
      border: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      padding: 0,
      color: LL.text2,
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 16,
      color: LL.text2
    }
  }), "\u8FD4\u56DE"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48
    }
  })));
}

// Full-screen page to compose / edit a meet-and-greet invite.
// Date → bottom calendar drawer; time → TimeWheelSheet (same as 日托);
// location → AddressMapScreen (same as 预约详情) with a default address.
function MeetInvitePage({
  initial,
  defaultLocation,
  onSend,
  onClose
}) {
  const [date, setDate] = React.useState(initial?.date || null); // Date | null
  const [time, setTime] = React.useState(initial?.time || null); // { h, m } | null
  const [loc, setLoc] = React.useState(initial?.location || defaultLocation || '');
  const [msg, setMsg] = React.useState(initial?.message || '希望预约前先见个面，让宝贝和您彼此熟悉一下～');
  const [dateOpen, setDateOpen] = React.useState(false);
  const [timeOpen, setTimeOpen] = React.useState(false);
  const [mapOpen, setMapOpen] = React.useState(false);
  const editing = !!initial;
  const canSend = !!(date && time && loc.trim());
  const Calendar = typeof GuardianCalendar === 'function' ? GuardianCalendar : null;
  const rowStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px',
    background: '#fff',
    border: 0,
    borderBottom: `1px solid ${LL.border}`,
    cursor: 'pointer',
    fontFamily: LL.font,
    textAlign: 'left'
  };
  const labelStyle = {
    fontSize: 14.5,
    fontWeight: 500,
    color: LL.text,
    flex: '0 0 auto'
  };
  const valStyle = set => ({
    flex: 1,
    fontSize: 14,
    color: set ? LL.text : LL.text3,
    fontWeight: set ? 600 : 400,
    textAlign: 'right'
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 94,
      background: LL.bg,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement(MGNavBar, {
    title: editing ? '修改见面邀约' : '见面邀约',
    onBack: onClose
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: rowStyle,
    onClick: () => setDateOpen(true)
  }, /*#__PURE__*/React.createElement("span", {
    style: labelStyle
  }, "\u65E5\u671F"), /*#__PURE__*/React.createElement("span", {
    style: valStyle(date)
  }, date ? meetFmtDate(date) : '点击选择'), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 13,
      color: LL.text3
    }
  })), /*#__PURE__*/React.createElement("button", {
    style: rowStyle,
    onClick: () => setTimeOpen(true)
  }, /*#__PURE__*/React.createElement("span", {
    style: labelStyle
  }, "\u65F6\u95F4"), /*#__PURE__*/React.createElement("span", {
    style: valStyle(time)
  }, time ? meetFmtTime(time) : '点击选择'), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 13,
      color: LL.text3
    }
  })), /*#__PURE__*/React.createElement("button", {
    style: {
      ...rowStyle,
      borderBottom: 0
    },
    onClick: () => setMapOpen(true)
  }, /*#__PURE__*/React.createElement("span", {
    style: labelStyle
  }, "\u5730\u70B9"), /*#__PURE__*/React.createElement("span", {
    style: valStyle(loc)
  }, loc || '设置见面地点'), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 13,
      color: LL.text3
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      background: '#fff',
      borderTop: `1px solid ${LL.border}`,
      borderBottom: `1px solid ${LL.border}`,
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: LL.text2,
      marginBottom: 8
    }
  }, "\u7559\u8A00\uFF08\u9009\u586B\uFF09"), /*#__PURE__*/React.createElement("textarea", {
    value: msg,
    onChange: e => setMsg(e.target.value),
    placeholder: "\u5411\u5B88\u62A4\u8005\u8BF4\u660E\u89C1\u9762\u5B89\u6392\u2026",
    style: {
      width: '100%',
      minHeight: 80,
      border: `1px solid ${LL.border}`,
      borderRadius: 10,
      padding: '10px 12px',
      fontSize: 14,
      color: LL.text,
      fontFamily: LL.font,
      outline: 'none',
      resize: 'none',
      boxSizing: 'border-box',
      lineHeight: 1.6
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff',
      borderTop: `1px solid ${LL.border}`,
      padding: '12px 16px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      flex: 1,
      height: 50,
      borderRadius: 999,
      border: `1.5px solid ${LL.border}`,
      background: 'transparent',
      color: LL.text,
      fontSize: 15,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: 'pointer'
    }
  }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement("button", {
    disabled: !canSend,
    onClick: () => onSend({
      date,
      time,
      location: loc.trim(),
      message: msg.trim()
    }),
    style: {
      flex: 2,
      height: 50,
      borderRadius: 999,
      border: 0,
      background: canSend ? LL.ink : 'rgba(34,40,44,0.22)',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: canSend ? 'pointer' : 'not-allowed',
      letterSpacing: '0.04em'
    }
  }, editing ? '保存修改' : '发送邀约')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: LL.text2,
      lineHeight: 1.7,
      textWrap: 'pretty',
      marginTop: 14
    }
  }, "\u89C1\u9762\u662F\u9884\u7EA6\u524D\u76F8\u4E92\u4E86\u89E3\u7684\u597D\u673A\u4F1A\uFF0C\u4E5F\u80FD\u8BA9\u5BA0\u7269\u5148\u719F\u6089\u5B88\u62A4\u8005\u3002\u53CC\u65B9\u90FD\u53EF\u4EE5\u53D1\u8D77\u6216\u4FEE\u6539\u89C1\u9762\u9080\u7EA6\uFF0C\u5BF9\u65B9\u4F1A\u5728 5 \u5206\u949F\u5185\u6536\u5230\u63D0\u9192\u3002")), dateOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setDateOpen(false),
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.4)',
      zIndex: 96
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 97,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      boxShadow: '0 -8px 24px rgba(0,0,0,0.12)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '0 auto 10px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u9009\u62E9\u89C1\u9762\u65E5\u671F"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setDateOpen(false),
    style: {
      marginLeft: 'auto',
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: '#F0F0F5',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x",
    style: {
      fontSize: 13,
      color: LL.text
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '2px 16px 4px'
    }
  }, Calendar && /*#__PURE__*/React.createElement(Calendar, {
    bookedDates: [],
    svcPrice: null,
    viewOnly: false,
    scroll: true,
    monthsCount: 6,
    start: date,
    end: null,
    onChange: r => setDate(r.end || r.start)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px 22px',
      borderTop: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("button", {
    disabled: !date,
    onClick: () => setDateOpen(false),
    style: {
      width: '100%',
      height: 50,
      borderRadius: 999,
      border: 0,
      background: date ? LL.ink : 'rgba(34,40,44,0.22)',
      color: '#fff',
      fontSize: 16,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: date ? 'pointer' : 'not-allowed',
      letterSpacing: '0.06em'
    }
  }, "\u786E\u5B9A")))), typeof TimeWheelSheet === 'function' && /*#__PURE__*/React.createElement(TimeWheelSheet, {
    open: timeOpen,
    value: time,
    title: "\u9009\u62E9\u89C1\u9762\u65F6\u95F4",
    onConfirm: t => {
      setTime(t);
      setTimeOpen(false);
    },
    onClose: () => setTimeOpen(false)
  }), mapOpen && typeof AddressMapScreen === 'function' && /*#__PURE__*/React.createElement(AddressMapScreen, {
    initial: null,
    onConfirm: ({
      poi,
      area,
      detail
    }) => {
      setLoc(detail ? `${poi} ${detail}` : poi || area);
      setMapOpen(false);
    },
    onClose: () => setMapOpen(false)
  }));
}

// In-thread meet-and-greet card (viewable + editable by both parties)
function MeetCard({
  meet,
  guardianName,
  onAccept,
  onModify,
  compact = false
}) {
  const confirmed = meet.status === 'confirmed';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 14,
      overflow: 'hidden',
      border: `1px solid ${LL.border}`,
      boxShadow: compact ? 'none' : '0 1px 6px rgba(0,0,0,0.07)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '11px 14px',
      background: LL.lavender
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 9,
      background: 'rgba(255,255,255,0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-map-pin",
    style: {
      fontSize: 18,
      color: '#5E4A87'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 800,
      color: LL.text
    }
  }, "\u89C1\u9762\u9080\u7EA6 \xB7 Meet & Greet"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text2,
      marginTop: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, meet.location))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-calendar-blank",
    style: {
      fontSize: 15,
      color: LL.text3,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: LL.text,
      fontWeight: 600
    }
  }, meetFmtDate(meet.date), " \xB7 ", meetFmtTime(meet.time)), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontSize: 11.5,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 999,
      background: confirmed ? APP_GREEN_BG : '#FEF3C7',
      color: confirmed ? APP_GREEN : '#B45309'
    }
  }, confirmed ? '已确认' : '待确认')), meet.message && !compact && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 14px 10px',
      fontSize: 12.5,
      color: LL.text2,
      lineHeight: 1.55
    }
  }, meet.message), !compact && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      padding: '0 14px 12px'
    }
  }, !confirmed && /*#__PURE__*/React.createElement("button", {
    onClick: onAccept,
    style: {
      flex: 1,
      height: 38,
      borderRadius: 999,
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 13,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer'
    }
  }, "\u63A5\u53D7\u89C1\u9762"), /*#__PURE__*/React.createElement("button", {
    onClick: onModify,
    style: {
      flex: 1,
      height: 38,
      borderRadius: 999,
      border: `1.5px solid ${LL.border}`,
      background: 'transparent',
      color: LL.text,
      fontSize: 13,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-pencil-simple",
    style: {
      fontSize: 14
    }
  }), "\u4FEE\u6539")));
}

// ─── Care Guide (照护指南) & Key Handoff (钥匙交接) ─────────────
const KEY_SCHEMES = [{
  id: 'A',
  label: '智能密码锁',
  desc: '填写使用指示和密码（含符号按键）',
  field: 'input',
  placeholder: '例：按 #1234# 解锁，门把手下压开门'
}, {
  id: 'B',
  label: '门口密码盒 / 消火栓 / 地垫下 / 快递柜',
  desc: '详细描述存放位置，可上传照片',
  field: 'photo',
  placeholder: '例：右侧消火栓内密码盒，密码 5210'
}, {
  id: 'C',
  label: '暂存小区物业 / 保安 / 邻居处',
  desc: '填写提取姓名 / 电话',
  field: 'input',
  placeholder: '例：12 号楼物业 王师傅 138****8888'
}, {
  id: 'D',
  label: '行前会面时面对面交付',
  desc: '见面当天当面交接钥匙',
  field: 'none'
}, {
  id: 'E',
  label: '行前闪送给守护者',
  desc: '通过同城闪送把钥匙寄给守护者',
  field: 'none'
}];

// Shared photo uploader (drag-free, file input)
function MGPhotos({
  photos = [],
  onChange,
  max = 6
}) {
  const ref = React.useRef(null);
  const add = e => {
    const files = [...(e.target.files || [])];
    Promise.all(files.map(f => new Promise(res => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.readAsDataURL(f);
    }))).then(urls => onChange([...(photos || []), ...urls].slice(0, max)));
    e.target.value = '';
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, photos.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      position: 'relative',
      width: 72,
      height: 72,
      borderRadius: 10,
      overflow: 'hidden',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: p,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => onChange(photos.filter((_, j) => j !== i)),
    style: {
      position: 'absolute',
      top: 2,
      right: 2,
      width: 18,
      height: 18,
      borderRadius: '50%',
      border: 0,
      background: 'rgba(0,0,0,0.55)',
      color: '#fff',
      cursor: 'pointer',
      fontSize: 11,
      lineHeight: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, "\xD7"))), photos.length < max && /*#__PURE__*/React.createElement("button", {
    onClick: () => ref.current && ref.current.click(),
    style: {
      width: 72,
      height: 72,
      borderRadius: 10,
      border: `1.5px dashed ${LL.border}`,
      background: LL.bg,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      color: LL.text3,
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-camera",
    style: {
      fontSize: 20
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10
    }
  }, "\u4E0A\u4F20\u7167\u7247")), /*#__PURE__*/React.createElement("input", {
    ref: ref,
    type: "file",
    accept: "image/*",
    multiple: true,
    style: {
      display: 'none'
    },
    onChange: add
  }));
}

// Full-screen 照护指南 composer
function CareGuidePanel({
  service,
  petName,
  saved = [],
  initial,
  onSave,
  onSend,
  onClose
}) {
  const [text, setText] = React.useState(initial?.text || '');
  const [photos, setPhotos] = React.useState(initial?.photos || []);
  const [importOpen, setImportOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const guideName = `${service || '服务'} ${petName || '宠物'}`;
  const canSend = !!(text.trim() || photos.length);
  const flash = m => {
    setToast(m);
    setTimeout(() => setToast(null), 1600);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 94,
      background: LL.bg,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement(MGNavBar, {
    title: "\u7167\u62A4\u6307\u5357",
    onBack: onClose
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '14px 16px',
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text3,
      marginBottom: 10
    }
  }, "\u5C06\u4FDD\u5B58\u4E3A\uFF1A", /*#__PURE__*/React.createElement("b", {
    style: {
      color: LL.text2
    }
  }, guideName)), /*#__PURE__*/React.createElement("textarea", {
    value: text,
    onChange: e => setText(e.target.value),
    placeholder: "\u5582\u98DF\uFF08\u4EFD\u91CF / \u65F6\u95F4\uFF09\u3001\u905B\u5F2F\u4E60\u60EF\u3001\u4F5C\u606F\u3001\u6027\u683C\u3001\u7981\u5FCC\u4E0E\u6CE8\u610F\u4E8B\u9879\u2026",
    style: {
      width: '100%',
      minHeight: 150,
      border: `1px solid ${LL.border}`,
      borderRadius: 10,
      padding: '12px',
      fontSize: 14,
      color: LL.text,
      fontFamily: LL.font,
      outline: 'none',
      resize: 'none',
      boxSizing: 'border-box',
      lineHeight: 1.7
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '14px 16px',
      borderTop: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: LL.text2,
      marginBottom: 10
    }
  }, "\u7167\u7247\uFF08\u5582\u98DF\u533A\u3001\u7528\u54C1\u6446\u653E\u7B49\uFF09"), /*#__PURE__*/React.createElement(MGPhotos, {
    photos: photos,
    onChange: setPhotos
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff',
      borderTop: `1px solid ${LL.border}`,
      padding: '12px 16px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => saved.length ? setImportOpen(true) : flash('暂无已保存的指南'),
    style: {
      flex: 1,
      height: 44,
      borderRadius: 999,
      border: `1.5px solid ${LL.border}`,
      background: 'transparent',
      color: LL.text,
      fontSize: 13.5,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-download-simple",
    style: {
      fontSize: 15
    }
  }), " \u5BFC\u5165\u5DF2\u4FDD\u5B58\u6307\u5357"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      onSave({
        name: guideName,
        text,
        photos
      });
      flash('已保存为「' + guideName + '」');
    },
    style: {
      flex: 1,
      height: 44,
      borderRadius: 999,
      border: `1.5px solid ${LL.border}`,
      background: 'transparent',
      color: LL.text,
      fontSize: 13.5,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-floppy-disk",
    style: {
      fontSize: 15
    }
  }), " \u4FDD\u5B58\u7167\u987E\u6307\u5357")), /*#__PURE__*/React.createElement("button", {
    disabled: !canSend,
    onClick: () => onSend({
      name: guideName,
      text: text.trim(),
      photos
    }),
    style: {
      width: '100%',
      height: 50,
      borderRadius: 999,
      border: 0,
      background: canSend ? LL.ink : 'rgba(34,40,44,0.22)',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: canSend ? 'pointer' : 'not-allowed',
      letterSpacing: '0.04em'
    }
  }, "\u53D1\u9001\u7ED9\u5B88\u62A4\u8005")), importOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setImportOpen(false),
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.42)',
      zIndex: 96
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 97,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: '14px 16px 28px',
      fontFamily: LL.font,
      maxHeight: '70%',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '0 auto 14px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 12
    }
  }, "\u5BFC\u5165\u5DF2\u4FDD\u5B58\u6307\u5357"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, saved.map((g, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => {
      setText(g.text || '');
      setPhotos(g.photos || []);
      setImportOpen(false);
      flash('已导入「' + g.name + '」');
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '12px 14px',
      borderRadius: 12,
      border: `1px solid ${LL.border}`,
      background: '#fff',
      cursor: 'pointer',
      fontFamily: LL.font,
      textAlign: 'left',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-bookmark-simple",
    style: {
      fontSize: 17,
      color: LL.text2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text
    }
  }, g.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginTop: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, g.text || '（仅照片）')), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 13,
      color: LL.text3
    }
  })))))), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      bottom: 96,
      transform: 'translateX(-50%)',
      background: LL.ink,
      color: '#fff',
      padding: '9px 16px',
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 500,
      zIndex: 99,
      whiteSpace: 'nowrap'
    }
  }, toast));
}

// Full-screen 钥匙交接 composer
function KeyHandoffPanel({
  initial,
  onSend,
  onClose
}) {
  const [scheme, setScheme] = React.useState(initial?.scheme || null);
  const [fields, setFields] = React.useState(initial?.fields || {});
  const cur = KEY_SCHEMES.find(s => s.id === scheme);
  const set = (k, v) => setFields(f => ({
    ...f,
    [k]: v
  }));
  const canSend = !!scheme && (cur.field === 'none' || cur.field === 'input' && (fields[scheme] || '').trim() || cur.field === 'photo' && ((fields[scheme] || '').trim() || (fields[scheme + '_photos'] || []).length));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 94,
      background: LL.bg,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement(MGNavBar, {
    title: "\u94A5\u5319\u4EA4\u63A5",
    onBack: onClose
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '12px 0 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 8px',
      fontSize: 12.5,
      color: LL.text3
    }
  }, "\u8BF7\u9009\u62E9\u94A5\u5319\u4EA4\u63A5\u65B9\u5F0F\u5E76\u586B\u5199\u4FE1\u606F"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: '0 16px'
    }
  }, KEY_SCHEMES.map(s => {
    const on = scheme === s.id;
    return /*#__PURE__*/React.createElement("div", {
      key: s.id,
      style: {
        borderRadius: 14,
        border: `1.5px solid ${on ? LL.ink : LL.border}`,
        background: '#fff',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setScheme(s.id),
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '13px 14px',
        background: 'transparent',
        border: 0,
        cursor: 'pointer',
        fontFamily: LL.font,
        textAlign: 'left'
      }
    }, on ? /*#__PURE__*/React.createElement("i", {
      className: "ph-fill ph-check-circle",
      style: {
        fontSize: 20,
        color: LL.ink,
        flex: '0 0 auto',
        marginTop: 1
      }
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        width: 20,
        height: 20,
        borderRadius: '50%',
        border: `1.5px solid ${LL.border}`,
        flex: '0 0 auto',
        marginTop: 1
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: LL.text
      }
    }, "\u65B9\u6848", s.id, " \xB7 ", s.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: LL.text3,
        marginTop: 2,
        lineHeight: 1.5
      }
    }, s.desc))), on && s.field !== 'none' && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 14px 14px'
      }
    }, s.field === 'input' && /*#__PURE__*/React.createElement("input", {
      value: fields[s.id] || '',
      onChange: e => set(s.id, e.target.value),
      placeholder: s.placeholder,
      style: {
        width: '100%',
        height: 44,
        padding: '0 12px',
        borderRadius: 10,
        border: `1px solid ${LL.border}`,
        background: LL.bg,
        fontSize: 14,
        color: LL.text,
        fontFamily: LL.font,
        outline: 'none',
        boxSizing: 'border-box'
      }
    }), s.field === 'photo' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("textarea", {
      value: fields[s.id] || '',
      onChange: e => set(s.id, e.target.value),
      placeholder: s.placeholder,
      style: {
        width: '100%',
        minHeight: 60,
        padding: '10px 12px',
        borderRadius: 10,
        border: `1px solid ${LL.border}`,
        background: LL.bg,
        fontSize: 14,
        color: LL.text,
        fontFamily: LL.font,
        outline: 'none',
        resize: 'none',
        boxSizing: 'border-box',
        lineHeight: 1.6,
        marginBottom: 10
      }
    }), /*#__PURE__*/React.createElement(MGPhotos, {
      photos: fields[s.id + '_photos'] || [],
      onChange: ps => set(s.id + '_photos', ps)
    }))));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff',
      borderTop: `1px solid ${LL.border}`,
      padding: '12px 16px 20px',
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      flex: 1,
      height: 50,
      borderRadius: 999,
      border: `1.5px solid ${LL.border}`,
      background: 'transparent',
      color: LL.text,
      fontSize: 15,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: 'pointer'
    }
  }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement("button", {
    disabled: !canSend,
    onClick: () => onSend({
      scheme,
      fields
    }),
    style: {
      flex: 2,
      height: 50,
      borderRadius: 999,
      border: 0,
      background: canSend ? LL.ink : 'rgba(34,40,44,0.22)',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: canSend ? 'pointer' : 'not-allowed',
      letterSpacing: '0.04em'
    }
  }, "\u53D1\u9001\u7ED9\u5B88\u62A4\u8005")));
}

// In-thread cards
function CareCard({
  guide,
  onEdit
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 14,
      border: `1px solid ${LL.border}`,
      boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '11px 14px',
      background: LL.butter
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 9,
      background: 'rgba(255,255,255,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-clipboard-text",
    style: {
      fontSize: 18,
      color: '#8A6D1B'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 800,
      color: LL.text
    }
  }, "\u7167\u62A4\u6307\u5357"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text2,
      marginTop: 1
    }
  }, guide.name))), guide.text && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px 4px',
      fontSize: 13,
      color: LL.text2,
      lineHeight: 1.6,
      whiteSpace: 'pre-wrap'
    }
  }, guide.text), (guide.photos || []).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      padding: '8px 14px 4px',
      flexWrap: 'wrap'
    }
  }, guide.photos.slice(0, 4).map((p, i) => /*#__PURE__*/React.createElement("img", {
    key: i,
    src: p,
    alt: "",
    style: {
      width: 56,
      height: 56,
      borderRadius: 8,
      objectFit: 'cover'
    }
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: onEdit,
    style: {
      width: '100%',
      padding: '11px 14px',
      marginTop: 6,
      background: 'transparent',
      border: 0,
      borderTop: `1px solid ${LL.border}`,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      fontSize: 13,
      fontWeight: 600,
      color: LL.text2
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-pencil-simple",
    style: {
      fontSize: 14
    }
  }), " \u67E5\u770B / \u4FEE\u6539"));
}
function KeyCard({
  handoff,
  onEdit
}) {
  const sc = KEY_SCHEMES.find(s => s.id === handoff.scheme);
  const detail = handoff.fields?.[handoff.scheme];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 14,
      border: `1px solid ${LL.border}`,
      boxShadow: '0 1px 6px rgba(0,0,0,0.07)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '11px 14px',
      background: LL.mint
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 9,
      background: 'rgba(255,255,255,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-key",
    style: {
      fontSize: 18,
      color: '#2C7A4B'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 800,
      color: LL.text
    }
  }, "\u94A5\u5319\u4EA4\u63A5"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text2,
      marginTop: 1
    }
  }, "\u65B9\u6848", handoff.scheme, " \xB7 ", sc?.label))), detail && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px 4px',
      fontSize: 13,
      color: LL.text2,
      lineHeight: 1.6,
      whiteSpace: 'pre-wrap'
    }
  }, detail), (handoff.fields?.[handoff.scheme + '_photos'] || []).length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      padding: '8px 14px 4px',
      flexWrap: 'wrap'
    }
  }, handoff.fields[handoff.scheme + '_photos'].slice(0, 4).map((p, i) => /*#__PURE__*/React.createElement("img", {
    key: i,
    src: p,
    alt: "",
    style: {
      width: 56,
      height: 56,
      borderRadius: 8,
      objectFit: 'cover'
    }
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: onEdit,
    style: {
      width: '100%',
      padding: '11px 14px',
      marginTop: 6,
      background: 'transparent',
      border: 0,
      borderTop: `1px solid ${LL.border}`,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      fontSize: 13,
      fontWeight: 600,
      color: LL.text2
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-pencil-simple",
    style: {
      fontSize: 14
    }
  }), " \u67E5\u770B / \u4FEE\u6539"));
}

// ─── Chat View ────────────────────────────────────────────────
function ChatView({
  app,
  onBack,
  onSendMessage,
  onOpenSummary,
  onModify,
  onReview
}) {
  const [input, setInput] = React.useState('');
  const [plusOpen, setPlusOpen] = React.useState(false);
  const [sheet, setSheet] = React.useState(null); // null | 'tip' | 'review'
  const [stars, setStars] = React.useState(5);
  const [meet, setMeet] = React.useState(null); // null | { date, time, location, message, status }
  const [meetLog, setMeetLog] = React.useState([]); // [{ by, text, time }]
  const [meetCompose, setMeetCompose] = React.useState(null); // null | { initial }
  const [careGuide, setCareGuide] = React.useState(null); // { name, text, photos }
  const [keyHandoff, setKeyHandoff] = React.useState(null); // { scheme, fields }
  const [savedGuides, setSavedGuides] = React.useState([]); // [{ name, text, photos }]
  const [panel, setPanel] = React.useState(null); // null | 'care' | 'key'
  const [careLog, setCareLog] = React.useState([]); // [{ kind:'sys'|'care'|'key', text?, time }]
  const msgsRef = React.useRef(null);
  const photoSrc = resolveGuardianPhoto(app.guardian);
  const gInitial = app.guardian?.initial;
  const isCompleted = app.status === 'completed';
  const isBooked = app.status === 'accepted' || app.status === 'in_progress';
  const petName = (app.pet || '').split('·').pop().trim();
  React.useEffect(() => {
    if (msgsRef.current) msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [app.messages?.length, meetLog.length, meet, careLog.length, careGuide, keyHandoff]);

  // Order effective → system prompts the owner to fill care guide + key handoff
  React.useEffect(() => {
    if (isBooked) {
      setCareLog(l => l.some(e => e.kind === 'prompt') ? l : [{
        kind: 'prompt',
        text: '订单已生效，请填写【照护指南】和【钥匙交接】信息。',
        time: fmtNow()
      }, ...l]);
    }
  }, [isBooked]);

  // ── Care guide / key handoff handlers ──
  const saveGuide = g => setSavedGuides(prev => [...prev.filter(x => x.name !== g.name), g]);
  const sendCare = data => {
    const first = !careGuide;
    setCareGuide(data);
    setCareLog(l => first ? [...l, {
      kind: 'care',
      time: fmtNow()
    }] : [...l, {
      kind: 'sys',
      text: '您更新了照护指南',
      time: fmtNow()
    }]);
    setPanel(null);
  };
  const sendKey = data => {
    const first = !keyHandoff;
    setKeyHandoff(data);
    setCareLog(l => first ? [...l, {
      kind: 'key',
      time: fmtNow()
    }] : [...l, {
      kind: 'sys',
      text: '您更新了钥匙交接方式',
      time: fmtNow()
    }]);
    setPanel(null);
  };

  // ── Meet & Greet invite handlers (either party can send / modify) ──
  const openMeetCreate = () => setMeetCompose({
    initial: null
  });
  const openMeetEdit = () => setMeetCompose({
    initial: meet
  });
  const sendMeet = data => {
    const creating = !meet;
    setMeet({
      ...data,
      status: creating ? 'pending' : meet.status === 'confirmed' ? 'pending' : meet.status || 'pending'
    });
    setMeetLog(l => [...l, {
      by: 'user',
      text: creating ? '您发起了见面邀约' : '您修改了见面邀约',
      time: fmtNow()
    }]);
    setMeetCompose(null);
    if (creating) {
      setTimeout(() => setMeetLog(l => [...l, {
        by: 'guardian',
        text: `${app.guardian?.name || '守护者'} 已查看见面邀约`,
        time: fmtNow()
      }]), 2200);
    }
  };
  const acceptMeet = () => {
    setMeet(m => m ? {
      ...m,
      status: 'confirmed'
    } : m);
    setMeetLog(l => [...l, {
      by: 'guardian',
      text: `${app.guardian?.name || '守护者'} 已接受见面邀约`,
      time: fmtNow()
    }]);
  };
  const handleSend = () => {
    const t = input.trim();
    if (!t) return;
    onSendMessage(t);
    setInput('');
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      height: 52,
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px',
      gap: 12,
      background: '#fff',
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      border: 0,
      background: LL.ink,
      color: '#fff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 17
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      overflow: 'hidden',
      background: gInitial?.bg || LL.lavender,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, photoSrc ? /*#__PURE__*/React.createElement("img", {
    src: photoSrc,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'top center'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text
    }
  }, gInitial?.char || app.guardian?.name?.[0])), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text,
      lineHeight: 1.2
    }
  }, app.guardian?.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: LL.text3
    }
  }, "\u5B88\u62A4\u8005"))), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-dots-three",
    style: {
      fontSize: 22,
      color: LL.text2
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      padding: '10px 14px 0',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.bg,
      borderRadius: 12,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 10,
      background: LL.butter,
      flex: '0 0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-clipboard-text",
    style: {
      fontSize: 20,
      color: LL.text
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: LL.text
    }
  }, app.service, " \xB7 ", app.dateStart, app.dateEnd && app.dateEnd !== app.dateStart ? ` – ${app.dateEnd}` : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      marginTop: 2
    }
  }, app.pet, " \xB7 ", app.area)), /*#__PURE__*/React.createElement(StatusBadge, {
    status: app.status
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff',
      padding: '10px 14px',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      gap: 8
    }
  }, isCompleted ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ShortcutBtn, {
    icon: "receipt",
    label: "\u8BE6\u60C5",
    onClick: () => onOpenSummary?.(app)
  }), /*#__PURE__*/React.createElement(ShortcutBtn, {
    icon: "star",
    label: "\u53BB\u8BC4\u4EF7",
    primary: true,
    onClick: () => setSheet('review')
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ShortcutBtn, {
    icon: "pencil-simple",
    label: "\u4FEE\u6539\u8BA2\u5355",
    onClick: () => onModify?.(app)
  }), /*#__PURE__*/React.createElement(ShortcutBtn, {
    icon: "receipt",
    label: "\u8BE6\u60C5",
    onClick: () => onOpenSummary?.(app)
  }), /*#__PURE__*/React.createElement(ShortcutBtn, {
    icon: "wechat-logo",
    label: "\u53BB\u4ED8\u6B3E",
    primary: true,
    onClick: () => onOpenSummary?.(app)
  }))), (careGuide || keyHandoff) && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff',
      padding: '0 14px 10px',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, careGuide && /*#__PURE__*/React.createElement("button", {
    onClick: () => setPanel('care'),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 12px',
      borderRadius: 10,
      border: `1px solid ${LL.border}`,
      background: LL.bg,
      cursor: 'pointer',
      fontFamily: LL.font,
      textAlign: 'left',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-clipboard-text",
    style: {
      fontSize: 16,
      color: '#8A6D1B',
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u7167\u62A4\u6307\u5357"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginLeft: 6,
      whiteSpace: 'nowrap'
    }
  }, careGuide.text ? careGuide.text.split('\n')[0].slice(0, 16) : careGuide.name)), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 12,
      color: LL.text3
    }
  })), keyHandoff && /*#__PURE__*/React.createElement("button", {
    onClick: () => setPanel('key'),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '9px 12px',
      borderRadius: 10,
      border: `1px solid ${LL.border}`,
      background: LL.bg,
      cursor: 'pointer',
      fontFamily: LL.font,
      textAlign: 'left',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-key",
    style: {
      fontSize: 16,
      color: '#2C7A4B',
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u94A5\u5319\u4EA4\u63A5"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginLeft: 6,
      whiteSpace: 'nowrap'
    }
  }, "\u65B9\u6848", keyHandoff.scheme, " \xB7 ", (KEY_SCHEMES.find(s => s.id === keyHandoff.scheme) || {}).label)), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }))), meet && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff',
      padding: '8px 14px 10px',
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: openMeetEdit,
    style: {
      width: '100%',
      background: 'transparent',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement(MeetCard, {
    meet: meet,
    guardianName: app.guardian?.name,
    compact: true
  }))), /*#__PURE__*/React.createElement("div", {
    ref: msgsRef,
    style: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '14px 14px 8px',
      background: LL.bg
    }
  }, (app.messages || []).map((msg, i) => /*#__PURE__*/React.createElement(MsgBubble, {
    key: i,
    msg: msg,
    photoSrc: photoSrc,
    app: app,
    onOpenSummary: onOpenSummary
  })), meetLog.map((e, i) => /*#__PURE__*/React.createElement("div", {
    key: 'ml' + i,
    style: {
      textAlign: 'center',
      fontSize: 12,
      color: LL.text3,
      margin: '4px 0 14px',
      padding: '0 24px'
    }
  }, e.text)), meet && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-start',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '84%'
    }
  }, /*#__PURE__*/React.createElement(MeetCard, {
    meet: meet,
    guardianName: app.guardian?.name,
    onAccept: acceptMeet,
    onModify: openMeetEdit
  }))), careLog.map((e, i) => {
    if (e.kind === 'care' && careGuide) return /*#__PURE__*/React.createElement("div", {
      key: 'cl' + i,
      style: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: '86%'
      }
    }, /*#__PURE__*/React.createElement(CareCard, {
      guide: careGuide,
      onEdit: () => setPanel('care')
    })));
    if (e.kind === 'key' && keyHandoff) return /*#__PURE__*/React.createElement("div", {
      key: 'cl' + i,
      style: {
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: '86%'
      }
    }, /*#__PURE__*/React.createElement(KeyCard, {
      handoff: keyHandoff,
      onEdit: () => setPanel('key')
    })));
    if (e.kind === 'care' || e.kind === 'key') return null;
    return /*#__PURE__*/React.createElement("div", {
      key: 'cl' + i,
      style: {
        textAlign: 'center',
        fontSize: 12,
        color: LL.text3,
        margin: '4px 0 14px',
        padding: '0 24px'
      }
    }, e.text);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff',
      padding: '8px 14px 0',
      borderTop: `1px solid ${LL.border}`
    }
  }, isCompleted ? /*#__PURE__*/React.createElement("button", {
    onClick: () => setSheet('tip'),
    style: {
      height: 32,
      padding: '0 16px',
      borderRadius: 999,
      border: '1.5px solid #D97706',
      background: '#FFFBEB',
      fontSize: 12.5,
      fontWeight: 600,
      color: '#B45309',
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-hand-coins",
    style: {
      fontSize: 15
    }
  }), "\u6253\u8D4F") : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      paddingBottom: 2,
      scrollbarWidth: 'none'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: openMeetCreate,
    style: {
      flex: '0 0 auto',
      height: 32,
      padding: '0 14px',
      borderRadius: 999,
      border: '1.5px solid #E63946',
      background: 'transparent',
      fontSize: 12.5,
      fontWeight: 600,
      color: '#E63946',
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-handshake",
    style: {
      fontSize: 15
    }
  }), "\u7533\u8BF7\u89C1\u9762"), isBooked && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => setPanel('care'),
    style: {
      flex: '0 0 auto',
      height: 32,
      padding: '0 14px',
      borderRadius: 999,
      border: `1.5px solid ${LL.border}`,
      background: 'transparent',
      fontSize: 12.5,
      fontWeight: 600,
      color: LL.text,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-clipboard-text",
    style: {
      fontSize: 15
    }
  }), "\u7167\u62A4\u6307\u5357"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPanel('key'),
    style: {
      flex: '0 0 auto',
      height: 32,
      padding: '0 14px',
      borderRadius: 999,
      border: `1.5px solid ${LL.border}`,
      background: 'transparent',
      fontSize: 12.5,
      fontWeight: 600,
      color: LL.text,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-key",
    style: {
      fontSize: 15
    }
  }), "\u94A5\u5319\u4EA4\u63A5")))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff',
      position: 'relative'
    }
  }, plusOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setPlusOpen(false),
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 10
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 'calc(100% + 6px)',
      right: 14,
      zIndex: 20,
      background: '#fff',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0,0,0,0.13)',
      minWidth: 140
    }
  }, [{
    icon: 'camera',
    label: '拍照'
  }, {
    icon: 'image',
    label: '从相册选择'
  }].map((item, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setPlusOpen(false),
    style: {
      width: '100%',
      padding: '13px 16px',
      background: 'transparent',
      border: 0,
      borderBottom: i === 0 ? `1px solid ${LL.border}` : 0,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: 9,
      background: LL.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${item.icon}`,
    style: {
      fontSize: 17,
      color: LL.text
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: LL.text,
      fontWeight: 500
    }
  }, item.label))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 14px',
      paddingBottom: 28,
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("input", {
    value: input,
    onChange: e => setInput(e.target.value),
    onKeyDown: e => e.key === 'Enter' && handleSend(),
    placeholder: "\u53D1\u9001\u6D88\u606F\u2026",
    style: {
      flex: 1,
      height: 40,
      padding: '0 14px',
      borderRadius: 999,
      border: `1px solid ${LL.border}`,
      background: LL.bg,
      fontSize: 14,
      fontFamily: LL.font,
      color: LL.text,
      outline: 'none'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: handleSend,
    style: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      border: 0,
      background: input.trim() ? LL.ink : LL.border,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: input.trim() ? 'pointer' : 'default',
      transition: 'background 140ms'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-paper-plane-tilt",
    style: {
      fontSize: 18
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPlusOpen(v => !v),
    style: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      border: `1.5px solid ${LL.border}`,
      background: '#fff',
      color: LL.text,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background 120ms'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-plus",
    style: {
      fontSize: 20
    }
  })))), meetCompose && /*#__PURE__*/React.createElement(MeetInvitePage, {
    initial: meetCompose.initial,
    defaultLocation: app.area || '望京SOHO · 北京市朝阳区阜通东大街6号',
    onSend: sendMeet,
    onClose: () => setMeetCompose(null)
  }), panel === 'care' && /*#__PURE__*/React.createElement(CareGuidePanel, {
    service: app.service,
    petName: petName,
    saved: savedGuides,
    initial: careGuide,
    onSave: saveGuide,
    onSend: sendCare,
    onClose: () => setPanel(null)
  }), panel === 'key' && /*#__PURE__*/React.createElement(KeyHandoffPanel, {
    initial: keyHandoff,
    onSend: sendKey,
    onClose: () => setPanel(null)
  }), sheet && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setSheet(null),
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.42)',
      zIndex: 90
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 91,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: '14px 18px 32px',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '0 auto 16px'
    }
  }), sheet === 'tip' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 4
    }
  }, "\u6253\u8D4F\u5B88\u62A4\u8005"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 12.5,
      color: LL.text3,
      marginBottom: 18
    }
  }, "\u611F\u8C22 ", app.guardian?.name, " \u5BF9 ", (app.pet || '').split('·').pop(), " \u7684\u6089\u5FC3\u7167\u987E"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 10,
      marginBottom: 18
    }
  }, [8, 18, 38, 66].map(amt => /*#__PURE__*/React.createElement("button", {
    key: amt,
    onClick: () => {
      onSendMessage?.(`🧧 我给你发了一个 ¥${amt} 的打赏，谢谢你的照顾！`);
      setSheet(null);
    },
    style: {
      height: 54,
      borderRadius: 12,
      border: `1.5px solid ${LL.border}`,
      background: '#fff',
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 800,
      color: LL.text
    }
  }, "\xA5", amt))))), sheet === 'review' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 4
    }
  }, "\u8BC4\u4EF7\u672C\u6B21\u670D\u52A1"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 12.5,
      color: LL.text3,
      marginBottom: 16
    }
  }, "\u60A8\u7684\u8BC4\u4EF7\u5C06\u5E2E\u52A9\u5176\u4ED6\u5BA0\u4E3B"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 20
    }
  }, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    onClick: () => setStars(n),
    style: {
      background: 'transparent',
      border: 0,
      cursor: 'pointer',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `${n <= stars ? 'ph-fill' : 'ph'} ph-star`,
    style: {
      fontSize: 30,
      color: n <= stars ? '#F5B301' : LL.border
    }
  })))), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      onReview?.(app, stars);
      onSendMessage?.(`⭐ 我给本次服务打了 ${stars} 星好评，谢谢你！`);
      setSheet(null);
    },
    style: {
      width: '100%',
      height: 50,
      borderRadius: 999,
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer'
    }
  }, "\u63D0\u4EA4\u8BC4\u4EF7")))));
}

// ─── Sent App Card ─────────────────────────────────────────────
function SentAppCard({
  app,
  onOpenChat,
  onOpenSummary,
  onRebook,
  onWriteReview
}) {
  const g = app.guardian || {};
  const photoSrc = resolveGuardianPhoto(g);
  const sm = STATUS_META[app.status] || STATUS_META.pending;
  const isInactive = app.status === 'rejected' || app.status === 'cancelled';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => !isInactive && onOpenSummary?.(app),
    style: {
      padding: '14px 14px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      cursor: isInactive ? 'default' : 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 50,
      height: 50,
      borderRadius: '50%',
      flex: '0 0 auto',
      background: g.initial?.bg || g.bg || LL.lavender,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      fontWeight: 700,
      color: LL.text
    }
  }, photoSrc ? /*#__PURE__*/React.createElement("img", {
    src: photoSrc,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'top center'
    }
  }) : g.initial?.char || g.name?.[0] || '?'), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, g.name), /*#__PURE__*/React.createElement(StatusBadge, {
    status: app.status
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text3
    }
  }, app.service, " \xB7 ", app.dateStart, app.dateEnd && app.dateEnd !== app.dateStart ? ` – ${app.dateEnd}` : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginTop: 1
    }
  }, app.pet)), !isInactive && /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 16,
      color: LL.text3,
      flex: '0 0 auto'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 14px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, app.status === 'pending' && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: '#F0B100',
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: isInactive ? LL.text3 : sm.color
    }
  }, sm.desc)), !isInactive && (app.status === 'completed' ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 14px 14px',
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onOpenChat?.(app.id);
    },
    style: {
      flex: '0 0 auto',
      width: 44,
      height: 36,
      borderRadius: 999,
      border: `1px solid ${LL.border}`,
      background: 'transparent',
      color: LL.text2,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-chat-circle-dots",
    style: {
      fontSize: 16
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onRebook?.(app);
    },
    style: {
      flex: 1,
      height: 36,
      borderRadius: 999,
      border: `1.5px solid ${LL.ink}`,
      background: 'transparent',
      fontSize: 13,
      fontWeight: 700,
      color: LL.ink,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-calendar-plus",
    style: {
      fontSize: 15
    }
  }), "\u518D\u6B21\u9884\u7EA6"), /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onWriteReview?.(app);
    },
    style: {
      flex: 1,
      height: 36,
      borderRadius: 999,
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      whiteSpace: 'nowrap'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-star",
    style: {
      fontSize: 15
    }
  }), "\u5199\u8BC4\u8BBA")) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 14px 14px',
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onOpenChat?.(app.id);
    },
    style: {
      flex: 1,
      height: 36,
      borderRadius: 999,
      border: `1px solid ${LL.border}`,
      background: 'transparent',
      fontSize: 13,
      fontWeight: 600,
      color: LL.text2,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-chat-circle-dots",
    style: {
      fontSize: 14
    }
  }), "\u67E5\u770B\u5BF9\u8BDD"), app.status === 'accepted' && /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onOpenSummary?.(app);
    },
    style: {
      flex: 1,
      height: 36,
      borderRadius: 999,
      border: 0,
      background: APP_GREEN,
      color: '#fff',
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, "\u7ACB\u5373\u4ED8\u6B3E"))));
}

// ─── Tab bar ──────────────────────────────────────────────────
const ORDER_TABS = ['全部', '待确认', '待付款', '待完成', '已完成', '已失效'];
function OrderTabBar({
  active,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      borderBottom: `1px solid ${LL.border}`,
      background: '#fff'
    }
  }, ORDER_TABS.map(tab => {
    const on = active === tab;
    return /*#__PURE__*/React.createElement("button", {
      key: tab,
      onClick: () => onChange(tab),
      style: {
        flex: '0 0 auto',
        padding: '10px 14px',
        background: 'transparent',
        border: 0,
        fontSize: 13,
        fontWeight: on ? 700 : 500,
        color: on ? '#D97757' : LL.text3,
        cursor: 'pointer',
        fontFamily: LL.font,
        borderBottom: on ? '2.5px solid #D97757' : '2.5px solid transparent',
        marginBottom: -1,
        whiteSpace: 'nowrap'
      }
    }, tab);
  }));
}

// ─── Config section ────────────────────────────────────────────
const SVC_OPTIONS = ['寄养', '日托', '遛狗', '上门喂养', '伴宠留宿'];
function ConfigSection({
  config,
  onChange
}) {
  const fields = [{
    key: 'pet',
    label: '宠物'
  }, {
    key: 'dateStart',
    label: '开始日期'
  }, {
    key: 'dateEnd',
    label: '结束日期'
  }, {
    key: 'area',
    label: '地点'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text,
      flex: 1
    }
  }, "\u670D\u52A1\u4FE1\u606F"), /*#__PURE__*/React.createElement("span", {
    style: {
      background: LL.butter,
      color: LL.text,
      fontSize: 11,
      fontWeight: 700,
      padding: '2px 8px',
      borderRadius: 999
    }
  }, "\u8349\u7A3F")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 14px',
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginBottom: 7,
      fontWeight: 500
    }
  }, "\u670D\u52A1\u7C7B\u578B"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, SVC_OPTIONS.map(opt => {
    const on = config.service === opt;
    return /*#__PURE__*/React.createElement("button", {
      key: opt,
      onClick: () => onChange('service', opt),
      style: {
        height: 30,
        padding: '0 13px',
        borderRadius: 999,
        border: 0,
        background: on ? LL.ink : '#F5F5FA',
        color: on ? '#fff' : LL.text2,
        fontSize: 12.5,
        fontWeight: on ? 700 : 500,
        fontFamily: LL.font,
        cursor: 'pointer',
        transition: 'background 140ms'
      }
    }, opt);
  }))), fields.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: f.key,
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px',
      borderBottom: i < fields.length - 1 ? `1px solid ${LL.border}` : 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text3,
      minWidth: 62,
      fontWeight: 500
    }
  }, f.label), /*#__PURE__*/React.createElement("input", {
    value: config[f.key] || '',
    onChange: e => onChange(f.key, e.target.value),
    style: {
      flex: 1,
      height: 44,
      border: 0,
      outline: 'none',
      fontSize: 13.5,
      fontWeight: 600,
      color: LL.text,
      fontFamily: LL.font,
      background: 'transparent',
      textAlign: 'right',
      paddingRight: 4
    }
  }))));
}

// ─── Guardian draft row ────────────────────────────────────────
function GuardianDraftRow({
  g,
  checked,
  onToggle,
  onRemove,
  service
}) {
  const photoSrc = resolveGuardianPhoto(g);
  const svcData = (g.services || []).find(s => s.id === service);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onToggle,
    style: {
      width: 24,
      height: 24,
      borderRadius: '50%',
      border: 0,
      flex: '0 0 auto',
      background: checked ? LL.ink : 'transparent',
      boxShadow: checked ? 'none' : `inset 0 0 0 1.5px ${LL.text3}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'background 140ms'
    }
  }, checked && /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-check",
    style: {
      fontSize: 13,
      color: '#fff'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: '50%',
      overflow: 'hidden',
      flex: '0 0 auto',
      background: g.initial?.bg || g.bg || LL.lavender,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, photoSrc ? /*#__PURE__*/React.createElement("img", {
    src: photoSrc,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'top center'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: LL.text
    }
  }, g.initial?.char || g.name?.[0] || '?')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      marginBottom: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text
    }
  }, g.name), /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-star",
    style: {
      fontSize: 11,
      color: '#F0B100'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color: LL.text
    }
  }, g.rating)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }, service, svcData ? ` · ¥${svcData.price}/${svcData.unit}` : '')), /*#__PURE__*/React.createElement("button", {
    onClick: onRemove,
    style: {
      width: 28,
      height: 28,
      borderRadius: '50%',
      border: 0,
      background: '#F5F5FA',
      color: LL.text3,
      cursor: 'pointer',
      flex: '0 0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x",
    style: {
      fontSize: 13
    }
  })));
}

// ─── Main screen ──────────────────────────────────────────────
function BookingRequestScreen({
  draftGuardians = [],
  draftConfig = {},
  onUpdateConfig,
  onRemoveGuardian,
  sentApps = [],
  onSend,
  onOpenChat,
  onOpenSummary,
  onRebook,
  onWriteReview,
  onBrowseMore
}) {
  const [checkedIds, setCheckedIds] = React.useState(new Set());
  const [activeTab, setActiveTab] = React.useState('全部');
  React.useEffect(() => {
    setCheckedIds(new Set(draftGuardians.map(g => g.id)));
  }, [draftGuardians.map(g => g.id).join(',')]);
  const toggleCheck = id => setCheckedIds(prev => {
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
  const checkedN = [...checkedIds].filter(id => draftGuardians.some(g => g.id === id)).length;

  // Combine mock apps + real sent apps (newest first), dedup by id
  const allApps = React.useMemo(() => {
    const real = [...sentApps].reverse();
    const mockFiltered = BRS_MOCK_APPS.filter(m => !real.find(r => r.id === m.id));
    return [...real, ...mockFiltered];
  }, [sentApps]);
  const filteredApps = activeTab === '全部' ? allApps : allApps.filter(a => (STATUS_META[a.status]?.tabKey || '待确认') === activeTab);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.bg,
      minHeight: '100%',
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      boxShadow: '0 1px 0 rgba(0,0,0,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 16px 10px',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      color: LL.text,
      letterSpacing: '-0.01em',
      flex: 1
    }
  }, "\u8BA2\u5355")), /*#__PURE__*/React.createElement(OrderTabBar, {
    active: activeTab,
    onChange: setActiveTab
  })), hasDraft && activeTab === '全部' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(ConfigSection, {
    config: draftConfig,
    onChange: onUpdateConfig
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px 10px',
      display: 'flex',
      alignItems: 'center',
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text,
      flex: 1
    }
  }, "\u5DF2\u9009\u5B88\u62A4\u8005 ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: LL.text3
    }
  }, "(", draftGuardians.length, " \u4F4D)"))), draftGuardians.map((g, i) => /*#__PURE__*/React.createElement("div", {
    key: g.id,
    style: {
      borderBottom: i < draftGuardians.length - 1 ? `1px solid ${LL.border}` : 0
    }
  }, /*#__PURE__*/React.createElement(GuardianDraftRow, {
    g: g,
    checked: checkedIds.has(g.id),
    onToggle: () => toggleCheck(g.id),
    onRemove: () => onRemoveGuardian?.(g.id),
    service: draftConfig.service
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: onBrowseMore,
    style: {
      width: '100%',
      padding: '12px 14px',
      background: 'transparent',
      border: 0,
      borderTop: `1px dashed ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      borderRadius: '50%',
      background: '#F5F5FA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-plus",
    style: {
      fontSize: 20,
      color: LL.text3
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: LL.text2
    }
  }, "\u7EE7\u7EED\u6DFB\u52A0\u5B88\u62A4\u8005"))), /*#__PURE__*/React.createElement("button", {
    onClick: handleSend,
    disabled: checkedN === 0,
    style: {
      width: '100%',
      height: 50,
      borderRadius: 999,
      border: 0,
      background: checkedN > 0 ? LL.ink : 'rgba(34,40,44,0.25)',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: checkedN > 0 ? 'pointer' : 'not-allowed',
      transition: 'background 160ms'
    }
  }, "\u53D1\u9001\u7533\u8BF7\u5355", checkedN > 0 ? `  给 ${checkedN} 位守护者` : '')), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 0'
    }
  }, (() => {
    const STATUS_PRIORITY = {
      accepted: 0,
      pending: 1,
      in_progress: 2
    };
    const isHistorical = a => a.status === 'completed' || a.status === 'rejected' || a.status === 'cancelled';
    const activeApps = filteredApps.filter(a => !isHistorical(a));
    const historicalApps = filteredApps.filter(isHistorical);

    // Group active by batchId
    const batchMap = {};
    activeApps.forEach(app => {
      const key = app.batchId || app.id;
      if (!batchMap[key]) batchMap[key] = {
        time: app.batchTime || null,
        apps: []
      };
      batchMap[key].apps.push(app);
    });
    // Sort within batch: accepted first
    Object.values(batchMap).forEach(b => b.apps.sort((a, z) => (STATUS_PRIORITY[a.status] ?? 9) - (STATUS_PRIORITY[z.status] ?? 9)));
    // Sort batches newest first
    const batches = Object.values(batchMap).sort((a, b) => {
      if (!a.time && !b.time) return 0;
      if (!a.time) return 1;
      if (!b.time) return -1;
      return new Date(b.time) - new Date(a.time);
    });
    const fmtBatchTime = t => {
      if (!t) return '已发送';
      const now = new Date(),
        d = new Date(t);
      const diffMin = Math.floor((now - d) / 60000);
      if (diffMin < 1) return '刚刚发送';
      if (diffMin < 60) return `${diffMin}分钟前发送`;
      const diffH = Math.floor(diffMin / 60);
      if (diffH < 24) return `${diffH}小时前发送`;
      return `${d.getMonth() + 1}月${d.getDate()}日发送`;
    };
    return /*#__PURE__*/React.createElement(React.Fragment, null, batches.length === 0 && historicalApps.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'center',
        padding: '48px 24px',
        color: LL.text3,
        fontSize: 14
      }
    }, "\u6682\u65E0", activeTab === '全部' ? '' : activeTab, "\u8BA2\u5355"), batches.map((batch, bi) => /*#__PURE__*/React.createElement("div", {
      key: bi,
      style: {
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: LL.text3,
        fontWeight: 500,
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 1,
        background: LL.border
      }
    }), /*#__PURE__*/React.createElement("span", null, fmtBatchTime(batch.time)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 1,
        background: LL.border
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, batch.apps.map(app => /*#__PURE__*/React.createElement(SentAppCard, {
      key: app.id,
      app: app,
      onOpenChat: onOpenChat,
      onOpenSummary: onOpenSummary,
      onRebook: onRebook,
      onWriteReview: onWriteReview
    }))))), historicalApps.length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: LL.text3,
        fontWeight: 500,
        marginBottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 1,
        background: LL.border
      }
    }), /*#__PURE__*/React.createElement("span", null, "\u5386\u53F2\u8BA2\u5355"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 1,
        background: LL.border
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
      }
    }, historicalApps.map(app => /*#__PURE__*/React.createElement(SentAppCard, {
      key: app.id,
      app: app,
      onOpenChat: onOpenChat,
      onOpenSummary: onOpenSummary,
      onRebook: onRebook,
      onWriteReview: onWriteReview
    })))));
  })()));
}
Object.assign(window, {
  BookingRequestScreen,
  ChatView,
  BRS_MOCK_APPS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/BookingRequestScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/BookingSheet.jsx
try { (() => {
// Lou Lou — Booking confirmation bottom sheet

function BookingSheet({
  open,
  onClose,
  onConfirm
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.35)',
      zIndex: 80
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 81,
      background: '#fff',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: '18px 16px 32px',
      boxShadow: '0 -8px 24px rgba(0,0,0,0.10)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '0 auto 16px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      borderRadius: 14,
      background: LL.butter,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 28
    }
  }, "\uD83D\uDC08"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u9884\u7EA6\u5B88\u62A4\u670D\u52A1"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text2
    }
  }, "\u5BC4\u517B \xB7 \u905B\u72D7 \xB7 30\u201345 \u5206\u949F")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: 0,
      background: '#F0F0F5',
      color: LL.text,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Iclose, {
    size: 14,
    sw: 2.4
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: LL.border,
      margin: '16px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Row, {
    left: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Icalendar, {
      size: 16,
      color: LL.text2
    }), " ", /*#__PURE__*/React.createElement("span", null, "\u9884\u7EA6\u65E5\u671F")),
    right: "\u5468\u4E09 \xB7 5\u670822\u65E5"
  }), /*#__PURE__*/React.createElement(Row, {
    left: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Iclock, {
      size: 16,
      color: LL.text2
    }), " ", /*#__PURE__*/React.createElement("span", null, "\u670D\u52A1\u65F6\u6BB5")),
    right: "10:30 \u2013 11:15"
  }), /*#__PURE__*/React.createElement(Row, {
    left: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Imap, {
      size: 16,
      color: LL.text2
    }), " ", /*#__PURE__*/React.createElement("span", null, "\u5730\u70B9")),
    right: "\u671D\u9633 \xB7 \u4E09\u91CC\u5C6F"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 18,
      padding: '12px 14px',
      background: LL.bg,
      borderRadius: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text2
    }
  }, "\u5408\u8BA1"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      color: LL.text,
      fontVariantNumeric: 'tabular-nums'
    }
  }, "\xA5 268")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(CTAButton, {
    onClick: onConfirm
  }, "\u786E\u8BA4\u9884\u7EA6"))));
}
function Row({
  left,
  right
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      color: LL.text2,
      fontSize: 13.5
    }
  }, left), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      fontSize: 13.5,
      fontWeight: 600,
      color: LL.text
    }
  }, right));
}
window.BookingSheet = BookingSheet;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/BookingSheet.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/BookingSummaryScreen.jsx
try { (() => {
// Lou Lou — BookingSummaryScreen.jsx
// 预约摘要页：深色摘要卡 + 费用明细 + 取消订单 + 付款

const BS_SVC_ICON = {
  '寄养': 'house',
  '日托': 'sun',
  '遛狗': 'sneaker',
  '上门喂养': 'hand-waving',
  '伴宠留宿': 'moon-stars',
  '上门服务': 'hand-waving',
  '住家守护': 'moon-stars'
};
const BS_SPECIES_CN = {
  dog: '狗',
  cat: '猫',
  rabbit: '兔',
  hamster: '鼠',
  bird: '鸟'
};
function bsCancelDate(dateStartStr) {
  const match = (dateStartStr || '').match(/(\d+)月(\d+)日/);
  if (!match) return '服务前一天';
  const dt = new Date(2026, parseInt(match[1]) - 1, parseInt(match[2]));
  dt.setDate(dt.getDate() - 1);
  return `${dt.getMonth() + 1}月${dt.getDate()}日`;
}

// ─── Cancel Order Modal ───────────────────────────────────────
function BsCancelOrderModal({
  onClose,
  onConfirm,
  cancelDateStr
}) {
  const sections = [{
    title: '全额退款',
    icon: 'check-circle',
    color: '#2C7A4B',
    bg: '#E6F1EC',
    text: `在服务开始前一天（${cancelDateStr}）12:00 之前申请取消，可享免费取消（全额退款）。`
  }, {
    title: '部分扣款',
    icon: 'warning',
    color: '#B45309',
    bg: '#FEF3C7',
    text: '在服务开始前一天的 12:00 之后申请取消，将扣除首日服务费的 20%，其余费用退还。'
  }, {
    title: '多日订单',
    icon: 'calendar-blank',
    color: '#2F5F87',
    bg: '#E3EEF7',
    text: '若为连续多日的订单，扣款与退款标准将依据"提交申请当天"与"剩余未服务首日"之间的时差，参照上述规则同理推算。'
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 95
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: 24,
      zIndex: 96,
      background: '#fff',
      borderRadius: 20,
      boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
      fontFamily: LL.font,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 20px 14px',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u53D6\u6D88\u8BA2\u5355"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginTop: 2
    }
  }, "Lou Lou \u5E73\u53F0\u53D6\u6D88\u6761\u6B3E")), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      marginLeft: 'auto',
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: '#F0F0F5',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x",
    style: {
      fontSize: 13,
      color: LL.text
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 20px 4px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, sections.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 10,
      background: s.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph-fill ph-${s.icon}`,
    style: {
      fontSize: 17,
      color: s.color
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 4
    }
  }, s.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text2,
      lineHeight: 1.65
    }
  }, s.text))))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 20px 24px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onConfirm,
    style: {
      width: '100%',
      height: 50,
      borderRadius: 999,
      border: 0,
      background: '#E63946',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer',
      letterSpacing: '0.04em'
    }
  }, "\u786E\u8BA4\u53D6\u6D88"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: '100%',
      height: 40,
      marginTop: 6,
      background: 'transparent',
      border: 0,
      fontSize: 13.5,
      color: LL.text3,
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, "\u6682\u4E0D\u53D6\u6D88"))));
}

// ─── Main ────────────────────────────────────────────────────
function BookingSummaryScreen({
  app,
  onBack,
  onModify,
  onViewGuardian,
  onRebook
}) {
  const [payOpen, setPayOpen] = React.useState(false);
  const [paid, setPaid] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelled, setCancelled] = React.useState(false);
  const [cancelKind, setCancelKind] = React.useState(null); // 'request' | 'order'
  const [coupon, setCoupon] = React.useState(app.coupon || null);
  const [couponOpen, setCouponOpen] = React.useState(false);
  // completed-order actions
  const [tipAmt, setTipAmt] = React.useState(null); // number | null
  const [tipExpanded, setTipExpanded] = React.useState(false);
  const [tipOpen, setTipOpen] = React.useState(false);
  const [tipDraft, setTipDraft] = React.useState('');
  const [tipPayOpen, setTipPayOpen] = React.useState(false); // 打赏 WeChat payment drawer
  const [tipPayAmt, setTipPayAmt] = React.useState(0);
  const [collected, setCollected] = React.useState(false);
  const [reviewed, setReviewed] = React.useState(false);
  // order number copy + customer support
  const [copied, setCopied] = React.useState(false);
  const [supportOpen, setSupportOpen] = React.useState(false);
  const orderNo = app.orderNo || 'LL' + String(app.id || '').replace(/\D/g, '').slice(-10).padStart(10, '0');
  const copyOrderNo = () => {
    try {
      navigator.clipboard && navigator.clipboard.writeText(orderNo);
    } catch (e) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  const cancelDateStr = bsCancelDate(app.dateStart);
  const gPhoto = typeof resolveGuardianPhoto === 'function' ? resolveGuardianPhoto(app.guardian) : app.guardian?.photo || null;
  const gInitial = app.guardian?.initial;
  const isCompleted = app.status === 'completed';
  const isPending = app.status === 'pending';
  const isAccepted = app.status === 'accepted';
  const canBook = isAccepted && !paid && !cancelled;
  const nights = app.nights || 1;
  const unitPrice = app.price || 88;
  const svcIcon = BS_SVC_ICON[app.service] || 'paw-print';
  const petName = (app.pet || '豆豆').split('·').pop().trim();
  const svcUnit = app.service === '日托' ? '天' : app.service === '遛狗' || app.service === '上门喂养' || app.service === '上门服务' ? '次' : '晚';

  // Per-species breakdown (falls back to a single line)
  const petBreakdown = Array.isArray(app.petBreakdown) && app.petBreakdown.length ? app.petBreakdown : [{
    name: petName,
    species: 'dog',
    unit: unitPrice
  }];
  const svcTotal = petBreakdown.reduce((s, p) => s + (p.unit || unitPrice) * nights, 0) || unitPrice * nights;

  // Extra services chosen during booking + overtime fee
  const extraItems = (app.extrasList || []).map(e => ({
    label: e.label,
    detail: `× ${e.qty || 1}`,
    price: (e.price || 0) * (e.qty || 1)
  }));
  const overtimeFee = app.overtimeFee || 0;
  const overtimeRate = app.overtimeRate || 0;
  const extrasTotal = extraItems.reduce((s, e) => s + e.price, 0) + overtimeFee;

  // Coupon — selectable
  const preDiscount = svcTotal + extrasTotal;
  const discount = typeof bfCouponDiscount === 'function' ? bfCouponDiscount(coupon, preDiscount) : 0;
  const total = preDiscount - discount;
  const handleConfirmCancel = () => {
    setCancelled(true);
    setCancelKind('order');
    setCancelOpen(false);
  };

  // Pre-payment: cancelling a *request* needs no policy modal (nothing paid yet)
  const handleCancelRequest = () => {
    setCancelled(true);
    setCancelKind('request');
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      overflow: 'hidden',
      position: 'relative',
      background: LL.bg
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      height: 52,
      background: '#fff',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      background: 'transparent',
      border: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      padding: 0,
      color: LL.text2,
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 16,
      color: LL.text2
    }
  }), "\u8FD4\u56DE"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u8BA2\u5355\u6458\u8981"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48
    }
  })), cancelled && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#FFF0F0',
      borderBottom: '1px solid #FCA5A5',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x-circle",
    style: {
      fontSize: 16,
      color: '#CC2200',
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: '#CC2200',
      fontWeight: 600
    }
  }, cancelKind === 'order' ? '订单已取消，退款将在 3–5 个工作日内处理' : '请求已取消，已通知守护者')), isPending && !cancelled && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#FFF3CD',
      borderBottom: '1px solid #F5C518',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      flex: '0 0 auto'
    }
  }, "\u26A0\uFE0F"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: '#92400E',
      fontWeight: 600,
      lineHeight: 1.4
    }
  }, "\u8BE5\u8BF7\u6C42\u5C1A\u672A\u786E\u8BA4\uFF0C\u7B49\u5F85\u5B88\u62A4\u8005\u56DE\u590D\u4E2D")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '16px 16px 0',
      background: LL.ink,
      borderRadius: '16px 16px 0 0',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 20px 18px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 46,
      height: 46,
      borderRadius: 12,
      background: 'rgba(255,255,255,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${svcIcon}`,
    style: {
      fontSize: 24,
      color: '#fff'
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: '#fff'
    }
  }, app.service), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: 'rgba(255,255,255,0.55)',
      marginTop: 2
    }
  }, "\u9884\u7EA6\u670D\u52A1"))), /*#__PURE__*/React.createElement("button", {
    onClick: () => onViewGuardian?.(app.guardian),
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 11,
      background: 'rgba(255,255,255,0.09)',
      border: 0,
      borderRadius: 12,
      padding: '10px 12px',
      marginBottom: 16,
      cursor: 'pointer',
      fontFamily: LL.font,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: '50%',
      overflow: 'hidden',
      flex: '0 0 auto',
      background: gInitial?.bg || 'rgba(255,255,255,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, gPhoto ? /*#__PURE__*/React.createElement("img", {
    src: gPhoto,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'top center'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 800,
      color: gInitial?.bg ? LL.text : '#fff'
    }
  }, gInitial?.char || app.guardian?.name?.[0])), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 700,
      color: '#fff'
    }
  }, app.guardian?.name || '守护者'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'rgba(255,255,255,0.55)',
      marginTop: 1
    }
  }, "\u5B88\u62A4\u8005 \xB7 \u67E5\u770B\u4E3B\u9875")), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.55)',
      flex: '0 0 auto'
    }
  })), [{
    icon: 'map-pin',
    text: app.area
  }, {
    icon: 'calendar-blank',
    text: [app.dateStart, app.dateEnd && app.dateEnd !== app.dateStart ? `→ ${app.dateEnd}` : null, nights > 0 ? `· 共${nights}${svcUnit}` : null].filter(Boolean).join(' ')
  }, app.dropoff ? {
    icon: 'arrow-circle-right',
    text: `送达 ${app.dropoff}`
  } : null, app.pickup ? {
    icon: 'arrow-circle-left',
    text: `接回 ${app.pickup}`
  } : null, {
    icon: 'paw-print',
    text: petName
  }].filter(Boolean).map((row, i, arr) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: i < arr.length - 1 ? 10 : 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${row.icon}`,
    style: {
      fontSize: 15,
      color: 'rgba(255,255,255,0.45)',
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: 'rgba(255,255,255,0.85)'
    }
  }, row.text))))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 16px',
      background: '#F5F5F9',
      borderRadius: '0 0 16px 16px',
      padding: '16px 20px 18px'
    }
  }, petBreakdown.map((p, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: LL.text
    }
  }, p.name, "\uFF08", BS_SPECIES_CN[p.species] || '宠物', "\uFF09"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginTop: 2
    }
  }, "\xA5", p.unit || unitPrice, "/", svcUnit, " \xD7 ", nights, svcUnit)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: LL.text
    }
  }, "\xA5", (p.unit || unitPrice) * nights))), extraItems.map((ex, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: LL.text2
    }
  }, ex.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginTop: 2
    }
  }, ex.detail)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: LL.text
    }
  }, "+\xA5", ex.price))), overtimeFee > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: LL.text2
    }
  }, "\u5EF6\u65F6\u8D39"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginTop: 2
    }
  }, "\u63A5\u56DE\u665A\u4E8E\u9001\u8FBE \xB7 \u5F53\u65E5\u4EF7\xD7", Math.round(overtimeRate * 100), "%")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: LL.text
    }
  }, "+\xA5", overtimeFee)), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCouponOpen(true),
    style: {
      width: '100%',
      background: 'transparent',
      border: 0,
      padding: 0,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-ticket",
    style: {
      fontSize: 14,
      color: coupon ? '#E63946' : LL.text3
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: coupon ? '#E63946' : LL.text3
    }
  }, coupon ? coupon.name : '优惠券')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, discount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: '#E63946'
    }
  }, "-\xA5", discount), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: LL.ink,
      fontWeight: 600
    }
  }, coupon ? '更换' : '选择'), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 11,
      color: LL.ink
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: LL.border,
      marginBottom: 14
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u5408\u8BA1"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: LL.text
    }
  }, "\xA5", total))), isCompleted && /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '12px 16px 0',
      background: '#fff',
      borderRadius: 14,
      padding: '14px 16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }
  }, tipAmt == null ? !tipExpanded ? /*#__PURE__*/React.createElement("button", {
    onClick: () => setTipExpanded(true),
    style: {
      width: '100%',
      background: 'transparent',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 10,
      background: '#FFF3CD',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-hand-coins",
    style: {
      fontSize: 20,
      color: '#B45309'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u6253\u8D4F ", app.guardian?.name || '守护者'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      marginTop: 1
    }
  }, "\u6EE1\u610F\u5C31\u6253\u4E2A\u8D4F\xB7\u91D1\u989D 100% \u5F52\u5B88\u62A4\u8005")), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 15,
      color: LL.text3,
      flex: '0 0 auto'
    }
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text,
      flex: 1
    }
  }, "\u6253\u8D4F ", app.guardian?.name || '守护者'), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setTipExpanded(false);
      setTipDraft('');
    },
    style: {
      background: 'transparent',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      color: LL.text3,
      fontFamily: LL.font,
      fontSize: 12,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2
    }
  }, "\u6536\u8D77 ", /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-up",
    style: {
      fontSize: 11
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      marginBottom: 12
    }
  }, "\u9009\u62E9\u6216\u81EA\u884C\u8F93\u5165\u91D1\u989D \xB7 100% \u5F52\u5B88\u62A4\u8005\u6240\u6709"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 8,
      marginBottom: 10
    }
  }, [8, 18, 66].map(a => {
    const on = String(a) === tipDraft;
    return /*#__PURE__*/React.createElement("button", {
      key: a,
      onClick: () => setTipDraft(String(a)),
      style: {
        height: 46,
        borderRadius: 10,
        border: `1.5px solid ${on ? LL.ink : LL.border}`,
        background: on ? LL.ink : '#fff',
        color: on ? '#fff' : LL.text,
        cursor: 'pointer',
        fontFamily: LL.font,
        fontSize: 15,
        fontWeight: 800
      }
    }, "\xA5", a);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      height: 46,
      border: `1.5px solid ${parseInt(tipDraft, 10) > 0 && ![8, 18, 66].includes(parseInt(tipDraft, 10)) ? LL.ink : LL.border}`,
      borderRadius: 10,
      padding: '0 12px',
      gap: 6,
      marginBottom: 12,
      transition: 'border-color 140ms'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 800,
      color: LL.text
    }
  }, "\xA5"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    step: "1",
    inputMode: "numeric",
    value: [8, 18, 66].includes(parseInt(tipDraft, 10)) ? '' : tipDraft,
    onChange: e => setTipDraft(e.target.value.replace(/[^0-9]/g, '')),
    placeholder: "\u81EA\u884C\u8F93\u5165\u91D1\u989D\uFF08\u6574\u6570\uFF09",
    style: {
      flex: 1,
      border: 0,
      outline: 'none',
      background: 'transparent',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text,
      fontFamily: LL.font
    }
  })), /*#__PURE__*/React.createElement("button", {
    disabled: !(parseInt(tipDraft, 10) > 0),
    onClick: () => {
      const a = parseInt(tipDraft, 10);
      if (a > 0) {
        setTipPayAmt(a);
        setTipPayOpen(true);
      }
    },
    style: {
      width: '100%',
      height: 48,
      borderRadius: 999,
      border: 0,
      background: parseInt(tipDraft, 10) > 0 ? LL.ink : 'rgba(34,40,44,0.22)',
      color: '#fff',
      fontSize: 14.5,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: parseInt(tipDraft, 10) > 0 ? 'pointer' : 'not-allowed',
      transition: 'background 160ms'
    }
  }, "\u786E\u8BA4\u6253\u8D4F", parseInt(tipDraft, 10) > 0 ? ` ¥${parseInt(tipDraft, 10)}` : '')) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: 10,
      background: '#FFF3CD',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-hand-coins",
    style: {
      fontSize: 20,
      color: '#B45309'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u5DF2\u6253\u8D4F \xA5", tipAmt), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      marginTop: 1
    }
  }, "\u6253\u8D4F\u91D1\u989D 100% \u5F52\u5B88\u62A4\u8005\u6240\u6709")), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setTipDraft('');
      setTipOpen(true);
    },
    style: {
      height: 32,
      padding: '0 12px',
      borderRadius: 999,
      border: `1.5px solid ${LL.ink}`,
      background: 'transparent',
      color: LL.ink,
      fontSize: 12.5,
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: LL.font,
      flex: '0 0 auto'
    }
  }, "\u8FFD\u52A0\u6253\u8D4F"))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '12px 16px 0',
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '13px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: LL.text3,
      flex: '0 0 auto'
    }
  }, "\u8BA2\u5355\u53F7"), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13,
      fontWeight: 600,
      color: LL.text,
      fontVariantNumeric: 'tabular-nums',
      textAlign: 'right',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, orderNo), /*#__PURE__*/React.createElement("button", {
    onClick: copyOrderNo,
    style: {
      flex: '0 0 auto',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      height: 28,
      padding: '0 10px',
      borderRadius: 999,
      border: `1px solid ${LL.border}`,
      background: 'transparent',
      color: copied ? '#2C7A4B' : LL.text2,
      fontSize: 12,
      fontWeight: 600,
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ${copied ? 'ph-check' : 'ph-copy'}`,
    style: {
      fontSize: 13
    }
  }), copied ? '已复制' : '复制')), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSupportOpen(true),
    style: {
      width: '100%',
      padding: '13px 16px',
      background: 'transparent',
      border: 0,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      fontFamily: LL.font,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-headset",
    style: {
      fontSize: 17,
      color: LL.text2,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: 600,
      color: LL.text
    }
  }, "\u8054\u7CFB\u5BA2\u670D"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }, "7\xD724 \u5C0F\u65F6"), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 13,
      color: LL.text3
    }
  }))), !isCompleted && !cancelled && !paid && /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '10px 16px 0',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleCancelRequest,
    style: {
      height: 32,
      padding: '0 14px',
      borderRadius: 999,
      background: 'transparent',
      border: `1px solid ${LL.border}`,
      color: LL.text2,
      fontSize: 12.5,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    }
  }, "\u53D6\u6D88\u8BA2\u5355"), /*#__PURE__*/React.createElement("button", {
    onClick: () => onModify?.(app),
    style: {
      height: 32,
      padding: '0 14px',
      borderRadius: 999,
      background: 'transparent',
      border: `1px solid ${LL.border}`,
      color: LL.text,
      fontSize: 12.5,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-pencil-simple",
    style: {
      fontSize: 14
    }
  }), "\u4FEE\u6539\u8BA2\u5355")), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '10px 16px 0',
      padding: '10px 14px',
      background: '#FFFBEB',
      borderRadius: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: '#92400E',
      lineHeight: 1.55
    }
  }, "\u8BF7\u901A\u8FC7\u5E73\u53F0\u5B8C\u6210\u9884\u7EA6\u548C\u4ED8\u6B3E\uFF0C\u5207\u52FF\u79C1\u4E0B\u73B0\u91D1\u4EA4\u6613\u3002")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 24
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff',
      borderTop: `1px solid ${LL.border}`,
      padding: '12px 16px 12px',
      display: 'flex',
      gap: 10,
      flexDirection: 'column'
    }
  }, isCompleted && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    onClick: () => onRebook?.(app),
    style: {
      width: '100%',
      height: 50,
      borderRadius: 999,
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 14.5,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-calendar-plus",
    style: {
      fontSize: 17
    }
  }), "\u518D\u6B21\u9884\u7EA6"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setCollected(c => !c),
    style: {
      flex: 1,
      height: 48,
      borderRadius: 999,
      border: `1.5px solid ${LL.border}`,
      background: 'transparent',
      color: collected ? LL.text3 : LL.text,
      fontSize: 14,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `${collected ? 'ph-fill' : 'ph'} ph-heart`,
    style: {
      fontSize: 16,
      color: collected ? '#E63946' : LL.text2
    }
  }), collected ? '已收藏' : '收藏'), /*#__PURE__*/React.createElement("button", {
    onClick: () => setReviewed(true),
    style: {
      flex: 1,
      height: 48,
      borderRadius: 999,
      border: `1.5px solid ${LL.border}`,
      background: 'transparent',
      color: LL.text,
      fontSize: 14,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-star",
    style: {
      fontSize: 16,
      color: LL.text2
    }
  }), reviewed ? '追加评价' : '评价'))), !isCompleted && !cancelled && !paid &&
  /*#__PURE__*/
  /* 立即付款 only */
  React.createElement("button", {
    disabled: !canBook,
    onClick: () => canBook && setPayOpen(true),
    style: {
      width: '100%',
      height: 52,
      borderRadius: 999,
      border: 0,
      background: canBook ? LL.ink : 'rgba(34,40,44,0.22)',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: canBook ? 'pointer' : 'not-allowed',
      transition: 'background 200ms'
    }
  }, "\u7ACB\u5373\u4ED8\u6B3E"), !cancelled && paid && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    disabled: true,
    style: {
      width: '100%',
      height: 52,
      borderRadius: 999,
      border: 0,
      background: 'rgba(34,40,44,0.22)',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'not-allowed'
    }
  }, "\u5DF2\u9884\u8BA2 \u2713"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCancelOpen(true),
    style: {
      width: '100%',
      height: 46,
      borderRadius: 999,
      background: 'transparent',
      border: `1.5px solid ${LL.border}`,
      color: LL.text2,
      fontSize: 14,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: 'pointer'
    }
  }, "\u53D6\u6D88\u8BA2\u5355"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setCancelOpen(true),
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      background: 'transparent',
      border: 0,
      cursor: 'pointer',
      padding: 0,
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-calendar-blank",
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      textDecoration: 'underline'
    }
  }, cancelDateStr, " 12:00\u524D\u53EF\u514D\u8D39\u53D6\u6D88")))), payOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setPayOpen(false),
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 85
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 86,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: '0 0 28px',
      boxShadow: '0 -8px 28px rgba(0,0,0,0.15)',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '12px auto 14px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 8
    }
  }, "\u786E\u8BA4\u4ED8\u6B3E"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 36,
      fontWeight: 800,
      color: LL.text,
      letterSpacing: '-0.02em'
    }
  }, "\xA5", total)), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 16px 14px',
      padding: '14px 16px',
      background: '#F5F5F9',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: 42,
      borderRadius: 10,
      background: '#07C160',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-chat-circle-dots",
    style: {
      fontSize: 22,
      color: '#fff'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 15,
      fontWeight: 600,
      color: LL.text
    }
  }, "\u5FAE\u4FE1\u652F\u4ED8"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: LL.ink,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-bold ph-check",
    style: {
      fontSize: 11,
      color: '#fff'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 16px 18px',
      padding: '12px 14px',
      background: '#FFFBEB',
      border: '1px solid #FDE68A',
      borderRadius: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-info",
    style: {
      fontSize: 15,
      color: '#B45309'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#92400E'
    }
  }, "\u6E29\u99A8\u63D0\u793A")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: '#92400E',
      lineHeight: 1.7,
      textWrap: 'pretty'
    }
  }, "\u60A8\u652F\u4ED8\u540E\u9700\u7B49\u5F85\u5B88\u62A4\u8005\u786E\u8BA4\uFF0C\u8BA2\u5355\u7ECF\u786E\u8BA4\u540E\u6B63\u5F0F\u751F\u6548\u3002\u8BA2\u5355\u751F\u6548\u540E\u7684\u53D6\u6D88\u64CD\u4F5C\u5C06\u9075\u5FAA\u5E73\u53F0\u7684", /*#__PURE__*/React.createElement("button", {
    onClick: () => setCancelOpen(true),
    style: {
      background: 'transparent',
      border: 0,
      padding: 0,
      margin: '0 1px',
      cursor: 'pointer',
      fontFamily: LL.font,
      fontSize: 12.5,
      fontWeight: 700,
      color: '#B45309',
      textDecoration: 'underline'
    }
  }, "\u53D6\u6D88\u653F\u7B56"), "\u6267\u884C\u3002\u82E5\u5B88\u62A4\u8005\u5728 24 \u5C0F\u65F6\u5185\u672A\u786E\u8BA4\uFF0C\u6B3E\u9879\u5C06\u539F\u8DEF\u9000\u56DE\u3002")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setPaid(true);
      setPayOpen(false);
    },
    style: {
      width: '100%',
      height: 52,
      borderRadius: 999,
      border: 0,
      background: '#07C160',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer',
      letterSpacing: '0.04em'
    }
  }, "\u786E\u8BA4\u5E76\u4ED8\u6B3E"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPayOpen(false),
    style: {
      width: '100%',
      height: 46,
      borderRadius: 999,
      border: `1.5px solid ${LL.border}`,
      background: 'transparent',
      color: LL.text2,
      fontSize: 14,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: 'pointer'
    }
  }, "\u6211\u518D\u60F3\u60F3")))), cancelOpen && /*#__PURE__*/React.createElement(BsCancelOrderModal, {
    onClose: () => setCancelOpen(false),
    onConfirm: handleConfirmCancel,
    cancelDateStr: cancelDateStr
  }), typeof BFCouponPicker === 'function' && /*#__PURE__*/React.createElement(BFCouponPicker, {
    open: couponOpen,
    coupons: window.BF_COUPONS || [],
    subtotal: preDiscount,
    selectedId: coupon?.id || null,
    onPick: id => {
      setCoupon(id ? (window.BF_COUPONS || []).find(c => c.id === id) : null);
      setCouponOpen(false);
    },
    onClose: () => setCouponOpen(false)
  }), tipOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setTipOpen(false),
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 95
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 96,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: '0 0 28px',
      boxShadow: '0 -8px 28px rgba(0,0,0,0.15)',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '12px auto 14px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u6253\u8D4F ", app.guardian?.name || '守护者'), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 12,
      color: LL.text3,
      marginTop: 4,
      marginBottom: 16
    }
  }, "\u6253\u8D4F\u91D1\u989D 100% \u5F52\u5B88\u62A4\u8005\u6240\u6709"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 8,
      marginBottom: 12
    }
  }, [8, 18, 66].map(a => {
    const on = String(a) === tipDraft;
    return /*#__PURE__*/React.createElement("button", {
      key: a,
      onClick: () => setTipDraft(String(a)),
      style: {
        height: 48,
        borderRadius: 10,
        border: `1.5px solid ${on ? LL.ink : LL.border}`,
        background: on ? LL.ink : '#fff',
        color: on ? '#fff' : LL.text,
        fontSize: 16,
        fontWeight: 800,
        cursor: 'pointer',
        fontFamily: LL.font
      }
    }, "\xA5", a);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      height: 50,
      border: `1.5px solid ${LL.border}`,
      borderRadius: 12,
      padding: '0 14px',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: LL.text
    }
  }, "\xA5"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: "1",
    step: "1",
    inputMode: "numeric",
    value: tipDraft,
    onChange: e => setTipDraft(e.target.value.replace(/[^0-9]/g, '')),
    placeholder: "\u5176\u4ED6\u91D1\u989D\uFF08\u4EC5\u652F\u6301\u6574\u6570\uFF09",
    style: {
      flex: 1,
      border: 0,
      outline: 'none',
      background: 'transparent',
      fontSize: 16,
      fontWeight: 700,
      color: LL.text,
      fontFamily: LL.font
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    disabled: !(parseInt(tipDraft, 10) > 0),
    onClick: () => {
      const a = parseInt(tipDraft, 10);
      if (a > 0) {
        setTipPayAmt(a);
        setTipPayOpen(true);
        setTipOpen(false);
      }
    },
    style: {
      width: '100%',
      height: 52,
      borderRadius: 999,
      border: 0,
      background: parseInt(tipDraft, 10) > 0 ? LL.ink : 'rgba(34,40,44,0.22)',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: parseInt(tipDraft, 10) > 0 ? 'pointer' : 'not-allowed'
    }
  }, "\u786E\u8BA4\u6253\u8D4F", parseInt(tipDraft, 10) > 0 ? ` ¥${parseInt(tipDraft, 10)}` : '')))), tipPayOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setTipPayOpen(false),
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 97
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 98,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: '0 0 28px',
      boxShadow: '0 -8px 28px rgba(0,0,0,0.15)',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '12px auto 14px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 8
    }
  }, "\u786E\u8BA4\u6253\u8D4F"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 36,
      fontWeight: 800,
      color: LL.text,
      letterSpacing: '-0.02em'
    }
  }, "\xA5", tipPayAmt)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 12,
      color: LL.text3,
      marginBottom: 18
    }
  }, "\u6253\u8D4F\u7ED9 ", app.guardian?.name || '守护者', " \xB7 \u91D1\u989D 100% \u5F52\u5B88\u62A4\u8005"), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 16px 16px',
      padding: '14px 16px',
      background: '#F5F5F9',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 8,
      background: '#07C160',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-chat-circle-dots",
    style: {
      fontSize: 20,
      color: '#fff'
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 15,
      fontWeight: 600,
      color: LL.text
    }
  }, "\u5FAE\u4FE1\u652F\u4ED8"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: LL.ink,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-bold ph-check",
    style: {
      fontSize: 11,
      color: '#fff'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setTipAmt(tipPayAmt);
      setTipPayOpen(false);
      setTipExpanded(false);
      setTipDraft('');
    },
    style: {
      width: '100%',
      height: 52,
      borderRadius: 999,
      border: 0,
      background: '#07C160',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-chat-circle-dots",
    style: {
      fontSize: 18
    }
  }), "\u5FAE\u4FE1\u652F\u4ED8 \xA5", tipPayAmt), /*#__PURE__*/React.createElement("button", {
    onClick: () => setTipPayOpen(false),
    style: {
      width: '100%',
      height: 46,
      borderRadius: 999,
      border: `1.5px solid ${LL.border}`,
      background: 'transparent',
      color: LL.text2,
      fontSize: 14,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: 'pointer'
    }
  }, "\u53D6\u6D88")))), supportOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setSupportOpen(false),
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 95
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 96,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: '0 0 28px',
      boxShadow: '0 -8px 28px rgba(0,0,0,0.15)',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '12px auto 14px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 4
    }
  }, "\u8054\u7CFB\u5BA2\u670D"), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontSize: 12,
      color: LL.text3,
      marginBottom: 16
    }
  }, "\u8BA2\u5355\u53F7 ", orderNo, " \xB7 \u5BA2\u670D 7\xD724 \u5C0F\u65F6\u5728\u7EBF"), [{
    icon: 'chat-circle-dots',
    label: '在线客服',
    sub: '平均 1 分钟响应'
  }, {
    icon: 'phone',
    label: '电话客服',
    sub: '400-666-8888'
  }].map((it, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: () => setSupportOpen(false),
    style: {
      width: '100%',
      padding: '14px 16px',
      background: 'transparent',
      border: 0,
      borderTop: i === 0 ? `1px solid ${LL.border}` : 'none',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      cursor: 'pointer',
      fontFamily: LL.font,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 10,
      background: '#E6F1EC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${it.icon}`,
    style: {
      fontSize: 19,
      color: '#2C7A4B'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text
    }
  }, it.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginTop: 1
    }
  }, it.sub)), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 14,
      color: LL.text3
    }
  }))))));
}

// ─── Order Modify Screen (修改订单) ───────────────────────────
function bsParse(str) {
  const m = (str || '').match(/(\d+)月(\d+)日/);
  if (!m) return null;
  return new Date(2026, parseInt(m[1]) - 1, parseInt(m[2]));
}
function bsFmt(d) {
  if (!d) return '';
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}
const BS_MOD_SVC_SUB = {
  '寄养': '在守护者家',
  '日托': '在守护者家',
  '遛狗': '在宠物主家',
  '上门喂养': '在宠物主家',
  '伴宠留宿': '在宠物主家'
};
function BSModHead({
  title,
  hint
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#F5F5F9',
      padding: '9px 16px 7px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      color: LL.text3,
      letterSpacing: '0.04em'
    }
  }, title), hint && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: LL.text3,
      marginTop: 2
    }
  }, hint));
}
const BS_DEMO_PETS = [{
  id: 'p1',
  name: '豆豆',
  breed: '金毛',
  weight: '22',
  age: '3岁',
  bg: '#FEE7A6'
}, {
  id: 'p2',
  name: '奶茶',
  breed: '英短',
  weight: '4.5',
  age: '2岁',
  bg: '#FBD3C4'
}];
function OrderModifyScreen({
  app,
  onClose,
  onConfirm,
  pets
}) {
  const services = app.guardian?.services && app.guardian.services.length ? app.guardian.services.map(s => s.id) : ['遛狗', '寄养', '日托', '上门喂养'];
  const petsList = pets && pets.length ? pets : BS_DEMO_PETS;
  const [service, setService] = React.useState(app.service || services[0]);
  const [range, setRange] = React.useState({
    start: bsParse(app.dateStart),
    end: bsParse(app.dateEnd)
  });
  const [dateOpen, setDateOpen] = React.useState(false);
  const [note, setNote] = React.useState('');
  const [petEnabled, setPetEnabled] = React.useState(() => Object.fromEntries(petsList.map(p => [p.id, true])));
  const [phone, setPhone] = React.useState(app.phone || '');
  const [addr, setAddr] = React.useState(app.area || '');
  const bookedDates = app.guardian?.bookedDates || [];
  const Calendar = window.GuardianCalendar;
  const isRangeSvc = service === '寄养' || service === '日托' || service === '伴宠留宿';
  const isPetHome = service === '遛狗' || service === '上门喂养' || service === '伴宠留宿';
  const canConfirm = !!range.start;
  const dateLabel = range.start ? range.end && bsFmt(range.end) !== bsFmt(range.start) ? `${bsFmt(range.start)} → ${bsFmt(range.end)}` : bsFmt(range.start) : '点击选择日期';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      zIndex: 80,
      background: LL.bg,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      height: 52,
      background: '#fff',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      background: 'transparent',
      border: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      padding: 0,
      color: LL.text2,
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 16
    }
  }), " \u8FD4\u56DE"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u4FEE\u6539\u8BA2\u5355"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: 42,
      borderRadius: '50%',
      overflow: 'hidden',
      flex: '0 0 auto',
      background: app.guardian?.initial?.bg || LL.lavender,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, app.guardian?.photo ? /*#__PURE__*/React.createElement("img", {
    src: app.guardian.photo,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'top center'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 17,
      fontWeight: 800,
      color: LL.text
    }
  }, app.guardian?.initial?.char || (app.guardian?.name || '守')[0])), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 700,
      color: LL.text
    }
  }, app.guardian?.name || '守护者'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginTop: 1
    }
  }, "\u4FEE\u6539\u540E\u5C06\u53D1\u9001\u7ED9\u5B88\u62A4\u8005\u91CD\u65B0\u786E\u8BA4"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(BSModHead, {
    title: "\u670D\u52A1\u7C7B\u578B"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '12px 16px 6px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, services.map(id => {
    const on = id === service;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => setService(id),
      style: {
        height: 34,
        padding: '0 14px',
        borderRadius: 999,
        border: `1.5px solid ${on ? LL.ink : LL.border}`,
        background: on ? LL.ink : 'transparent',
        color: on ? '#fff' : LL.text2,
        fontSize: 13,
        fontWeight: on ? 700 : 500,
        cursor: 'pointer',
        fontFamily: LL.font,
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, on && /*#__PURE__*/React.createElement("i", {
      className: "ph-fill ph-check",
      style: {
        fontSize: 12
      }
    }), id);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '0 16px 12px',
      fontSize: 12,
      color: LL.text3
    }
  }, BS_MOD_SVC_SUB[service] || '')), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(BSModHead, {
    title: "\u9884\u7EA6\u65E5\u671F"
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => setDateOpen(true),
    style: {
      width: '100%',
      background: '#fff',
      border: 0,
      padding: '15px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      cursor: 'pointer',
      fontFamily: LL.font,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-calendar-blank",
    style: {
      fontSize: 17,
      color: LL.text2,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 14.5,
      fontWeight: range.start ? 700 : 500,
      color: range.start ? LL.text : LL.text3
    }
  }, dateLabel), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }, "\u5728\u5B88\u62A4\u8005\u65E5\u5386\u4E2D\u9009\u62E9"), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 13,
      color: LL.text3
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(BSModHead, {
    title: "\u5BA0\u7269"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff'
    }
  }, petsList.map(pet => {
    const wt = pet.weight ? String(pet.weight).includes('公斤') ? pet.weight : `${pet.weight}公斤` : null;
    const sub = [pet.breed, wt, pet.age].filter(Boolean).join(' · ');
    return /*#__PURE__*/React.createElement("div", {
      key: pet.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        gap: 12,
        borderBottom: `1px solid ${LL.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 46,
        height: 46,
        borderRadius: '50%',
        background: pet.bg || LL.butter,
        flex: '0 0 auto',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, pet.photo ? /*#__PURE__*/React.createElement("img", {
      src: pet.photo,
      alt: pet.name,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover'
      }
    }) : /*#__PURE__*/React.createElement("i", {
      className: "ph ph-paw-print",
      style: {
        fontSize: 22,
        color: LL.text
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: 700,
        color: LL.text
      }
    }, pet.name), sub && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12,
        color: LL.text3,
        marginTop: 2
      }
    }, sub)), typeof BFToggle === 'function' ? /*#__PURE__*/React.createElement(BFToggle, {
      on: !!petEnabled[pet.id],
      onChange: v => setPetEnabled(prev => ({
        ...prev,
        [pet.id]: v
      }))
    }) : null);
  }), /*#__PURE__*/React.createElement("button", {
    style: {
      width: '100%',
      padding: '14px 16px',
      background: 'transparent',
      border: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: LL.text2
    }
  }, "\u6DFB\u52A0\u5BA0\u7269"), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 12,
      color: LL.text3
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(BSModHead, {
    title: "\u8054\u7CFB\u65B9\u5F0F"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff'
    }
  }, isPetHome && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      gap: 12,
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: LL.text,
      flex: '0 0 auto'
    }
  }, "\u670D\u52A1\u5730\u5740"), /*#__PURE__*/React.createElement("input", {
    value: addr,
    onChange: e => setAddr(e.target.value),
    placeholder: "\u8BF7\u8F93\u5165\u670D\u52A1\u5730\u5740",
    style: {
      flex: 1,
      border: 0,
      outline: 'none',
      fontSize: 14,
      color: LL.text,
      background: 'transparent',
      fontFamily: LL.font,
      textAlign: 'right',
      caretColor: LL.ink
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      color: LL.text,
      flex: '0 0 auto'
    }
  }, "\u624B\u673A\u53F7\u7801"), /*#__PURE__*/React.createElement("input", {
    type: "tel",
    value: phone,
    onChange: e => setPhone(e.target.value),
    placeholder: "\u8BF7\u8F93\u5165\u624B\u673A\u53F7\u7801",
    style: {
      flex: 1,
      border: 0,
      outline: 'none',
      fontSize: 14,
      color: LL.text,
      background: 'transparent',
      fontFamily: LL.font,
      textAlign: 'right',
      caretColor: LL.ink
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(BSModHead, {
    title: "\u7ED9\u5B88\u62A4\u8005\u7559\u8A00\uFF08\u9009\u586B\uFF09"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '12px 16px'
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    value: note,
    onChange: e => setNote(e.target.value),
    placeholder: "\u8BF4\u660E\u4E00\u4E0B\u4F60\u60F3\u8C03\u6574\u7684\u5185\u5BB9\u2026",
    style: {
      width: '100%',
      minHeight: 64,
      border: `1px solid ${LL.border}`,
      borderRadius: 10,
      padding: '10px 12px',
      fontSize: 14,
      color: LL.text,
      fontFamily: LL.font,
      outline: 'none',
      resize: 'none',
      boxSizing: 'border-box',
      lineHeight: 1.6
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff',
      borderTop: `1px solid ${LL.border}`,
      padding: '12px 16px 22px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    disabled: !canConfirm,
    onClick: () => onConfirm?.(app, {
      service,
      dateStart: bsFmt(range.start),
      dateEnd: isRangeSvc && range.end ? bsFmt(range.end) : null,
      note
    }),
    style: {
      width: '100%',
      height: 52,
      borderRadius: 999,
      border: 0,
      background: canConfirm ? LL.ink : 'rgba(34,40,44,0.22)',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: canConfirm ? 'pointer' : 'not-allowed',
      letterSpacing: '0.04em'
    }
  }, "\u786E\u8BA4\u4FEE\u6539\u5E76\u901A\u77E5\u5B88\u62A4\u8005")), dateOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: () => setDateOpen(false),
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.45)',
      zIndex: 90
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 91,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      boxShadow: '0 -8px 24px rgba(0,0,0,0.12)',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '0 auto 10px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u9009\u62E9\u670D\u52A1\u65E5\u671F"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setDateOpen(false),
    style: {
      marginLeft: 'auto',
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: '#F0F0F5',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x",
    style: {
      fontSize: 13,
      color: LL.text
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginTop: 4
    }
  }, isRangeSvc ? '选择服务区间（开始 → 结束）' : '点选一个服务日期')), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '2px 16px 4px'
    }
  }, typeof Calendar === 'function' && /*#__PURE__*/React.createElement(Calendar, {
    bookedDates: bookedDates,
    svcPrice: null,
    viewOnly: false,
    scroll: true,
    monthsCount: 6,
    start: range.start,
    end: isRangeSvc ? range.end : null,
    onChange: r => setRange(isRangeSvc ? r : {
      start: r.end || r.start,
      end: null
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px 22px',
      borderTop: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text2,
      marginBottom: 8,
      textAlign: 'center',
      minHeight: 18
    }
  }, range.start ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text,
      fontWeight: 700
    }
  }, dateLabel) : '请在日历上选择日期'), /*#__PURE__*/React.createElement("button", {
    disabled: !range.start,
    onClick: () => setDateOpen(false),
    style: {
      width: '100%',
      height: 50,
      borderRadius: 999,
      border: 0,
      background: range.start ? LL.ink : 'rgba(34,40,44,0.22)',
      color: '#fff',
      fontSize: 16,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: range.start ? 'pointer' : 'not-allowed',
      letterSpacing: '0.06em'
    }
  }, "\u5E94\u7528\u65E5\u671F")))));
}
Object.assign(window, {
  BookingSummaryScreen,
  OrderModifyScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/BookingSummaryScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/BookingsScreen.jsx
try { (() => {
// Lou Lou — Bookings list screen

function BookingsScreen() {
  const items = [{
    id: 1,
    title: 'Full Service Grooming',
    when: 'Tomorrow · 10:30',
    place: 'LouLou Salon · Jing\u2019an',
    emoji: '🐈',
    bg: LL.butter,
    status: 'Confirmed'
  }, {
    id: 2,
    title: 'Dog Walk · 30 min',
    when: 'Wed · 17:00',
    place: 'Century Park · Walker A. Chen',
    emoji: '🐕',
    bg: LL.lavender,
    status: 'Scheduled'
  }, {
    id: 3,
    title: 'Vet Check-up',
    when: 'Fri · 09:00',
    place: 'PawCare Clinic',
    emoji: '🩺',
    bg: LL.mint,
    status: 'Pending'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.01em'
    }
  }, "Bookings"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text2,
      marginTop: 4
    }
  }, "3 upcoming appointments")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, items.map(it => /*#__PURE__*/React.createElement("div", {
    key: it.id,
    style: {
      background: '#fff',
      borderRadius: 16,
      padding: 14,
      display: 'flex',
      gap: 12,
      alignItems: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60,
      height: 60,
      borderRadius: 12,
      background: it.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 32,
      flex: '0 0 auto'
    }
  }, it.emoji), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      color: LL.text
    }
  }, it.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text2,
      marginTop: 3,
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(Iclock, {
    size: 12
  }), " ", it.when), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      marginTop: 2
    }
  }, it.place)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      padding: '4px 8px',
      borderRadius: 4,
      background: it.status === 'Confirmed' ? '#E6F1EC' : it.status === 'Scheduled' ? LL.lavender : LL.butter,
      color: LL.text
    }
  }, it.status))), /*#__PURE__*/React.createElement("button", {
    style: {
      marginTop: 4,
      height: 48,
      borderRadius: 16,
      border: `1px dashed ${LL.text3}`,
      background: 'transparent',
      color: LL.text2,
      fontSize: 13.5,
      fontWeight: 500,
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement(Iplus, {
    size: 16
  }), " New Booking")));
}
window.BookingsScreen = BookingsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/BookingsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/DetailScreen.jsx
try { (() => {
// Lou Lou — Pet / Service detail screen

function DetailScreen({
  onBack,
  onBook
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      paddingBottom: 56
    }
  }, /*#__PURE__*/React.createElement(TopNav, {
    title: "Details",
    onBack: onBack
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '0 16px 0',
      height: 280,
      background: LL.surface,
      borderRadius: 24,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 200,
      lineHeight: 1,
      overflow: 'hidden',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.15))'
    }
  }, "\uD83D\uDC08")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 16px 0',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: LL.text,
      lineHeight: 1.2
    }
  }, "Full Service", /*#__PURE__*/React.createElement("br", null), "Grooming"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text2,
      marginTop: 6
    }
  }, "Bath, Haircut & Styling")), /*#__PURE__*/React.createElement(RatingPill, {
    value: "4.7"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 16px 0',
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(AttrTag, {
    label: "Pet Type",
    value: "Cat",
    bg: LL.butter
  }), /*#__PURE__*/React.createElement(AttrTag, {
    label: "Coat",
    value: "Short",
    bg: "#E6F1EC"
  }), /*#__PURE__*/React.createElement(AttrTag, {
    label: "Time",
    value: "30\u201345 mins",
    bg: LL.lavender
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: LL.text
    }
  }, "Description"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: LL.text2,
      lineHeight: 1.6,
      marginTop: 8
    }
  }, "Give your pet a refreshing spa day. Includes natural shampoo bath, precision haircut, and complete hygiene check by certified professionals.")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      padding: '24px 16px 0'
    }
  }, /*#__PURE__*/React.createElement(CTAButton, {
    onClick: onBook
  }, "Book Service")));
}
window.DetailScreen = DetailScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/DetailScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/FilterDrawer.jsx
try { (() => {
// Lou Lou — Filter drawer for the guardian search results.
//
// Layout (bottom sheet):
//   ┌──────────────────────────────────────────┐
//   │  筛选 (X)                  重置全部   ×  │   ← sticky header
//   ├──────────────────────────────────────────┤
//   │  距离          [chip row]                │
//   │  评分          [chip row]                │
//   │  价格范围      [dual slider ¥0–¥500]     │
//   │  ── divider ──                           │
//   │  居住环境      ☐☐☐  更多 ∨               │
//   │  家中宠物情况  ☐☐☐  更多 ∨               │
//   │  家中儿童情况  ☐☐☐                       │
//   │  其他          ☐☐☐  更多 ∨               │
//   ├──────────────────────────────────────────┤
//   │  [   查看 N 位守护者   ]                  │   ← sticky footer
//   └──────────────────────────────────────────┘
//
// Selections live-update the parent's filter state — there is no separate
// "Apply" step. The footer button just closes the drawer and reports the
// final match count (which is also visible in the result list underneath).

// ─── Filter dictionary (4 groups, in spec order) ────────────
const FILTER_GROUPS = [{
  id: 'env',
  title: '居住环境',
  options: ['独立房屋（非公寓）', '有围栏院子', '允许宠物上沙发', '允许宠物上床', '无烟家庭']
}, {
  id: 'pets',
  title: '家中宠物情况',
  options: ['家中无狗', '家中无猫', '每次只接一单', '家中无笼养宠物']
}, {
  id: 'kids',
  title: '家中儿童情况',
  options: ['家中无儿童', '无0–5岁儿童', '无6–12岁儿童']
}, {
  id: 'other',
  title: '其他',
  options: ['可接受未绝育母狗', '可接受未绝育公狗', '提供洗澡/美容服务', '具备宠物急救/CPR证书', '可喂药', '可接受大型犬（25kg以上）']
}];
const DISTANCE_OPTS = ['全部', '< 1 km', '< 3 km', '< 5 km', '< 10 km'];
const RATING_OPTS = ['全部', '≥ 4.5', '≥ 4.8', '5.0'];
function defaultFilters() {
  return {
    distance: '全部',
    rating: '全部',
    price: [0, 500],
    selections: {} // { '<groupId>:<option>': true }
  };
}
function countFilters(f) {
  let n = 0;
  if (f.distance && f.distance !== '全部') n++;
  if (f.rating && f.rating !== '全部') n++;
  if (f.price[0] > 0 || f.price[1] < 500) n++;
  n += Object.values(f.selections).filter(Boolean).length;
  return n;
}
Object.assign(window, {
  FILTER_GROUPS,
  DISTANCE_OPTS,
  RATING_OPTS,
  defaultFilters,
  countFilters
});

// ─── FilterDrawer ────────────────────────────────────────────
function FilterDrawer({
  open,
  filters,
  onChange,
  matchCount,
  onClose
}) {
  const drawerRef = React.useRef(null);
  const bodyRef = React.useRef(null);
  const [scrollPct, setScrollPct] = React.useState(0);

  // Lock scroll on the nearest scrollable ancestor (the iOS frame's
  // content scroller in app.jsx) while the drawer is open, so dragging
  // the drawer body doesn't bleed scroll into the background list.
  React.useEffect(() => {
    if (!open || !drawerRef.current) return;
    let el = drawerRef.current.parentElement;
    while (el) {
      const s = getComputedStyle(el);
      if (s.overflowY === 'auto' || s.overflowY === 'scroll') break;
      el = el.parentElement;
    }
    if (!el) return;
    const orig = el.style.overflow;
    el.style.overflow = 'hidden';
    return () => {
      el.style.overflow = orig;
    };
  }, [open]);

  // Update progress-bar position as the drawer body scrolls
  React.useEffect(() => {
    if (!open) return;
    const b = bodyRef.current;
    if (!b) return;
    const onScroll = () => {
      const max = b.scrollHeight - b.clientHeight;
      setScrollPct(max <= 0 ? 0 : b.scrollTop / max * 100);
    };
    onScroll();
    b.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => b.removeEventListener('scroll', onScroll);
  }, [open]);
  if (!open) return null;
  const count = countFilters(filters);
  const reset = () => onChange(defaultFilters());
  const setField = (k, v) => onChange({
    ...filters,
    [k]: v
  });
  const setSelection = (key, on) => {
    const next = {
      ...filters.selections
    };
    if (on) next[key] = true;else delete next[key];
    onChange({
      ...filters,
      selections: next
    });
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("style", null, `
        .ll-filter-body::-webkit-scrollbar { display: block !important; width: 0; }
      `), /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    onWheel: e => e.preventDefault(),
    onTouchMove: e => e.preventDefault(),
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.35)',
      zIndex: 85,
      touchAction: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    ref: drawerRef,
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 86,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: '88%',
      boxShadow: '0 -8px 24px rgba(0,0,0,0.10)',
      fontFamily: LL.font,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px 10px',
      flex: '0 0 auto',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '0 auto 12px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.01em'
    }
  }, "\u7B5B\u9009", count > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 6,
      color: LL.text2,
      fontWeight: 600,
      fontSize: 14
    }
  }, "(", count, ")")), /*#__PURE__*/React.createElement("button", {
    onClick: reset,
    disabled: count === 0,
    style: {
      marginLeft: 'auto',
      border: 0,
      background: 'transparent',
      color: count > 0 ? LL.text : LL.text3,
      fontSize: 13,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: count > 0 ? 'pointer' : 'default',
      padding: '6px 6px'
    }
  }, "\u91CD\u7F6E\u5168\u90E8"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "\u5173\u95ED",
    style: {
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: '#F0F0F5',
      color: LL.text,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x",
    style: {
      fontSize: 13
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: 1,
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: bodyRef,
    className: "ll-filter-body",
    style: {
      position: 'absolute',
      inset: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: '6px 14px 14px'
    }
  }, /*#__PURE__*/React.createElement(SectionRow, {
    title: "\u8DDD\u79BB"
  }, /*#__PURE__*/React.createElement(ChipRow, {
    options: DISTANCE_OPTS,
    value: filters.distance,
    onPick: v => setField('distance', v)
  })), /*#__PURE__*/React.createElement(SectionRow, {
    title: "\u8BC4\u5206"
  }, /*#__PURE__*/React.createElement(ChipRow, {
    options: RATING_OPTS,
    value: filters.rating,
    onPick: v => setField('rating', v)
  })), /*#__PURE__*/React.createElement(SectionRow, {
    title: "\u4EF7\u683C\u8303\u56F4"
  }, /*#__PURE__*/React.createElement(RangeSlider, {
    min: 0,
    max: 500,
    step: 10,
    value: filters.price,
    onChange: v => setField('price', v),
    formatValue: (n, isMax) => isMax && n >= 500 ? '¥500+' : `¥${n}`,
    unit: "\u6BCF\u6B21"
  })), FILTER_GROUPS.map(g => /*#__PURE__*/React.createElement(AccordionGroup, {
    key: g.id,
    title: g.title,
    options: g.options,
    selections: filters.selections,
    groupId: g.id,
    onToggle: setSelection
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8
    }
  })), /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      top: 8,
      bottom: 8,
      right: 6,
      width: 3,
      background: 'rgba(34,40,44,0.06)',
      borderRadius: 2,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: `${Math.max(0, Math.min(100 - 18, scrollPct * 0.82))}%`,
      height: '18%',
      background: LL.ink,
      borderRadius: 2,
      transition: 'top 80ms linear'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px 20px',
      background: '#fff',
      borderTop: `1px solid ${LL.border}`,
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: '100%',
      height: 46,
      borderRadius: 999,
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 15,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: 'pointer'
    }
  }, "\u67E5\u770B ", matchCount, " \u4F4D\u5B88\u62A4\u8005"))));
}

// ─── SectionRow — title + content with bottom divider ────────
function SectionRow({
  title,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 0 4px',
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text,
      paddingBottom: 8
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 12
    }
  }, children));
}

// ─── ChipRow — single-select chip row used by distance / rating ───
function ChipRow({
  options,
  value,
  onPick
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, options.map(o => {
    const on = o === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      onClick: () => onPick(o),
      style: {
        height: 32,
        padding: '0 14px',
        borderRadius: 999,
        border: 0,
        background: on ? LL.ink : 'rgba(34,40,44,0.05)',
        color: on ? '#fff' : LL.text,
        fontSize: 12.5,
        fontWeight: on ? 700 : 500,
        fontFamily: LL.font,
        cursor: 'pointer'
      }
    }, o);
  }));
}

// ─── RangeSlider — dual-thumb numeric range with live readout ───
function RangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  formatValue,
  unit
}) {
  const trackRef = React.useRef(null);
  const [a, b] = value;
  const aPct = (a - min) / (max - min) * 100;
  const bPct = (b - min) / (max - min) * 100;
  const fmt = formatValue || (n => String(n));
  const startDrag = which => e => {
    e.preventDefault();
    const track = trackRef.current;
    if (!track) return;
    const move = ev => {
      const clientX = ev.touches?.[0]?.clientX ?? ev.clientX;
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const snapped = Math.round((min + pct * (max - min)) / step) * step;
      if (which === 'a') onChange([Math.min(snapped, b - step), b]);else onChange([a, Math.max(snapped, a + step)]);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      paddingBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: LL.text,
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '-0.01em'
    }
  }, fmt(a, false), /*#__PURE__*/React.createElement("span", {
    style: {
      margin: '0 6px',
      color: LL.text3
    }
  }, "\u2014"), fmt(b, true)), unit && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text2
    }
  }, unit)), /*#__PURE__*/React.createElement("div", {
    ref: trackRef,
    style: {
      position: 'relative',
      height: 28,
      margin: '0 12px',
      // leave room for thumbs at edges
      touchAction: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: '50%',
      height: 4,
      background: LL.border,
      borderRadius: 2,
      transform: 'translateY(-50%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: `${aPct}%`,
      width: `${bPct - aPct}%`,
      top: '50%',
      height: 4,
      background: LL.ink,
      borderRadius: 2,
      transform: 'translateY(-50%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    onPointerDown: startDrag('a'),
    style: thumbStyle(aPct, 3)
  }), /*#__PURE__*/React.createElement("div", {
    onPointerDown: startDrag('b'),
    style: thumbStyle(bPct, 4)
  })));
}
function thumbStyle(pct, z) {
  return {
    position: 'absolute',
    left: `${pct}%`,
    top: '50%',
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.2), 0 0 0 1.5px rgba(34,40,44,0.95)',
    transform: 'translate(-50%, -50%)',
    cursor: 'grab',
    zIndex: z,
    touchAction: 'none'
  };
}

// ─── AccordionGroup — collapsed by default; expands on press ───
function AccordionGroup({
  title,
  options,
  selections,
  groupId,
  onToggle
}) {
  const [open, setOpen] = React.useState(false);
  const selectedCount = options.reduce((n, o) => n + (selections[`${groupId}:${o}`] ? 1 : 0), 0);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(!open),
    style: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '14px 0',
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      fontFamily: LL.font,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text
    }
  }, title), selectedCount > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      background: LL.ink,
      color: '#fff',
      borderRadius: 999,
      padding: '0 7px',
      minWidth: 18,
      height: 18,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 10.5,
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums'
    }
  }, selectedCount), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      color: LL.text3
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-caret-${open ? 'up' : 'down'}`,
    style: {
      fontSize: 14
    }
  }))), open && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 0 10px'
    }
  }, options.map(o => {
    const key = `${groupId}:${o}`;
    const on = !!selections[key];
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      onClick: () => onToggle(key, !on),
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 0',
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
        fontFamily: LL.font,
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 20,
        height: 20,
        borderRadius: 5,
        flex: '0 0 auto',
        background: on ? LL.ink : '#fff',
        boxShadow: on ? 'none' : `inset 0 0 0 1.5px ${LL.text3}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 120ms ease'
      }
    }, on && /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 12 12",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M2.5 6.2 L5 8.6 L9.5 3.6",
      stroke: "#fff",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      fill: "none"
    }))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        color: LL.text,
        fontWeight: on ? 600 : 500
      }
    }, o));
  })));
}

// ─── CheckboxGroup (legacy — kept for compatibility) ──────────
function CheckboxGroup({
  title,
  options,
  selections,
  groupId,
  onToggle
}) {
  const [expanded, setExpanded] = React.useState(false);
  const collapsible = options.length > 3;
  const visible = expanded ? options : options.slice(0, 3);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 0 0',
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text,
      paddingBottom: 4
    }
  }, title), /*#__PURE__*/React.createElement("div", null, visible.map(o => {
    const key = `${groupId}:${o}`;
    const on = !!selections[key];
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      onClick: () => onToggle(key, !on),
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '11px 0',
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
        fontFamily: LL.font,
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 20,
        height: 20,
        borderRadius: 5,
        flex: '0 0 auto',
        background: on ? LL.ink : '#fff',
        boxShadow: on ? 'none' : `inset 0 0 0 1.5px ${LL.text3}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 120ms ease'
      }
    }, on && /*#__PURE__*/React.createElement("svg", {
      width: "12",
      height: "12",
      viewBox: "0 0 12 12",
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M2.5 6.2 L5 8.6 L9.5 3.6",
      stroke: "#fff",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      fill: "none"
    }))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        color: LL.text,
        fontWeight: on ? 600 : 500
      }
    }, o));
  })), collapsible && /*#__PURE__*/React.createElement("button", {
    onClick: () => setExpanded(!expanded),
    style: {
      border: 0,
      background: 'transparent',
      color: LL.text2,
      fontSize: 12.5,
      fontWeight: 500,
      fontFamily: LL.font,
      cursor: 'pointer',
      padding: '6px 0 12px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, expanded ? '收起' : '更多', /*#__PURE__*/React.createElement("i", {
    className: `ph ph-caret-${expanded ? 'up' : 'down'}`,
    style: {
      fontSize: 12
    }
  })));
}

// ─── Apply filters to a list of guardians ───────────────────
// Distance/rating/price are real numeric filters. Group selections (居住环境
// etc.) don't map onto our mock data, so they count toward the "active" tally
// but don't currently exclude any guardian. Wire to backend later.
function applyFilters(list, f) {
  return list.filter(g => {
    if (f.distance && f.distance !== '全部') {
      const km = parseFloat(f.distance.replace(/[^\d.]/g, ''));
      if (!isNaN(km) && g.dist >= km) return false;
    }
    if (f.rating && f.rating !== '全部') {
      const min = parseFloat(f.rating.replace(/[^\d.]/g, ''));
      if (!isNaN(min) && g.rating < min) return false;
    }
    if (g.price < f.price[0]) return false;
    if (f.price[1] < 500 && g.price > f.price[1]) return false;
    return true;
  });
}
Object.assign(window, {
  FilterDrawer,
  applyFilters
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/FilterDrawer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/GuardianProfileScreen.jsx
try { (() => {
// Lou Lou — GuardianProfileScreen.jsx
// 守护者主页 — 陈逸 (三标签页: 信息 / 评价 / 服务)

// ─── Colors ──────────────────────────────────────────────────
const GGREEN = '#2C7A4B';
const GGREEN_BG = '#E6F1EC';
const PROFILE_PURPLE = '#5B3A8F';
const PROFILE_PURPLE_BG = '#D8CAE8';

// ─── Per-species "what's included" copy (shown via base-fee ⓘ) ──
const CARE_INFO = {
  dog: '包括每日至少 2 次户外遛狗、定时喂食饮水、食具清洁、更换尿垫、室内互动陪玩及每日健康状态监测。',
  cat: '包括铲屎添砂、陪玩、梳毛、饮水饮食管理、食具清洁及每日健康状态监测。',
  hamster: '包括喂食饮水、局部清理尿沙/坏粮、食具清洁、检查跑轮和垫料环境及每日健康状态监测。',
  rabbit: '包括补草、定时喂粮/擦干蔬菜、食具清洁、清理兔厕所、室内放风陪伴及每日健康状态监测。',
  bird: '包括清壳补粮、换水、食具清洁、更换底盘垫纸、室内环境监控及每日健康状态监测。'
};

// 30-min single-visit "what's included" copy (上门喂养)
const VISIT_INFO = {
  dog: '包括食具清洁、添粮换水、更换尿垫、互动陪玩、环境检查及健康监测。',
  cat: '包括食具清洁、添粮换水、铲屎添砂、互动陪玩、环境检查及健康监测。',
  hamster: '包括食具清洁、添粮换水、局部清理尿沙/坏粮、环境检查及健康监测。',
  rabbit: '包括补草、定时喂粮/擦干蔬菜、食具清洁、清理兔厕所、环境检查及健康监测。',
  bird: '包括清壳补粮、换水、食具清洁、更换底盘垫纸、环境检查及健康监测。'
};

// ─── Shared extra-fee row builders (keep wording consistent across tabs) ──
// pickup + medication + (optionally) delay-fee blocks shared by 寄养/日托
const ROW_PICKUP = {
  label: '守护者接送（1 来回）',
  price: '¥30',
  sub: '10 公里以内，超出部分每公里 +¥3'
};
const ROW_VISIT = {
  label: '守护者上门',
  price: '¥20',
  sub: '10 公里以内，超出部分每公里 +¥3'
};
const ROW_MEDICATE = {
  label: '喂药 / 擦药 / 喂营养品',
  price: '+¥10/次'
};
const ROW_EMERGENCY = p => ({
  label: '紧急预约附加费',
  price: p,
  info: '预约当天和次日服务为紧急预约。'
});
const ROW_LONGTERM = {
  label: '长期订单优惠（超过 7 天）',
  price: '-10%'
};
const ROW_DELAY = {
  label: '延时费',
  price: '当日价×50%',
  info: '若离园接宠时间晚于入园送宠时间：延时 2–8 小时内加收 50% 的当日服务费；延时 8 小时以上加收 100% 的当日服务费。'
};
const ROW_DELAY_VISIT = {
  label: '延时费',
  price: '当日价×50%',
  info: '若订单结束日结束时间晚于订单开始日上门时间：延时 2–8 小时内加收 50% 的当日服务费；延时 8 小时以上加收 100% 的当日服务费。'
};

// 上门喂养 extra fees — identical across all pet types
const VISIT_EXTRA_ROWS = [{
  label: '60 分钟加价',
  price: '+¥15'
}, {
  label: '每加 1 只',
  price: '+¥15'
}, {
  label: '节假日加价',
  price: '+¥10'
}, ROW_EMERGENCY('+¥8'), ROW_VISIT, ROW_MEDICATE, ROW_DELAY_VISIT];

// 伴宠留宿 extra fees — dog gets 幼犬, the other four are identical minus that row
const LODGE_DOG_ROWS = [{
  label: '幼犬',
  price: '+¥11'
}, {
  label: '每加 1 只',
  price: '+¥48'
}, {
  label: '节假日加价',
  price: '+¥20'
}, ROW_EMERGENCY('+¥15'), ROW_VISIT, ROW_MEDICATE, ROW_DELAY_VISIT];
const LODGE_PET_ROWS = LODGE_DOG_ROWS.slice(1);

// ─── Data ────────────────────────────────────────────────────
const CHEN_YI_DATA = {
  id: 'r2',
  name: '陈逸',
  photo: './assets/guardian2.png',
  photoKey: 'guardian2',
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
  ownPets: [{
    id: 'op1',
    name: '豆豆',
    breed: '金毛',
    age: '3岁',
    bg: '#FEE7A6',
    photo: window.__resources && window.__resources.galleryPuppy || '../../uploads/Sleeping Golden Retriever Puppy.png'
  }, {
    id: 'op2',
    name: '可乐',
    breed: '柯基',
    age: '2岁',
    bg: '#C7E8D8'
  }, {
    id: 'op3',
    name: '糯米',
    breed: '布偶猫',
    age: '1岁',
    bg: '#D8CAE8'
  }, {
    id: 'op4',
    name: '团子',
    breed: '英短',
    age: '4岁',
    bg: '#C7D8EE'
  }],
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
    toiletInterval: '每2–4小时'
  },
  services: [{
    id: '寄养',
    sub: '在守护者家',
    price: 88,
    unit: '晚',
    petTypes: [{
      type: 'cat',
      weights: ['0–7', '7–18']
    }, {
      type: 'dog',
      weights: ['0–7', '7–18', '18–45']
    }],
    extras: [],
    petPricingTabs: [{
      type: 'dog',
      label: '狗',
      weights: [{
        range: '0–10 公斤',
        price: 88,
        size: '小型',
        tier: '小型犬',
        info: '包括每日至少 2 次户外遛狗、定时喂食饮水、食具清洁、更换尿垫、室内互动陪玩及每日健康状态监测。'
      }, {
        range: '10–20 公斤',
        price: 98,
        size: '中型',
        tier: '中型犬',
        info: '包括每日至少 2 次户外遛狗、定时喂食饮水、食具清洁、更换尿垫、室内互动陪玩及每日健康状态监测。'
      }, {
        range: '20 公斤+',
        price: 108,
        size: '大型',
        tier: '大型犬',
        info: '包括每日至少 2 次户外遛狗、定时喂食饮水、食具清洁、更换尿垫、室内互动陪玩及每日健康状态监测。'
      }],
      rows: [{
        label: '幼犬',
        price: '+¥11'
      }, {
        label: '每加 1 只',
        price: '+¥48'
      }, {
        label: '节假日加价',
        price: '+¥17'
      }, {
        label: '长期订单优惠（超过 7 天）',
        price: '-10%'
      }, {
        label: '紧急预约附加费',
        price: '+¥15',
        info: '预约当天和次日服务为紧急预约。'
      }, {
        label: '守护者接送（1 来回）',
        price: '¥30',
        sub: '10 公里以内，超出部分每公里 +¥3'
      }, {
        label: '喂药 / 擦药 / 喂营养品',
        price: '+¥10/次'
      }, {
        label: '延时费',
        price: '当日价×50%',
        info: '若离园接宠时间晚于入园送宠时间：延时 2–8 小时内加收 50% 的当日服务费；延时 8 小时以上加收 100% 的当日服务费。'
      }]
    }, {
      type: 'cat',
      label: '猫',
      baseInfo: CARE_INFO.cat,
      weights: [{
        range: '全体型',
        price: 78,
        size: '全部'
      }],
      rows: [{
        label: '每加 1 只',
        price: '+¥40'
      }, {
        label: '节假日加价',
        price: '+¥15'
      }, ROW_LONGTERM, ROW_EMERGENCY('+¥15'), ROW_PICKUP, ROW_MEDICATE, ROW_DELAY]
    }, {
      type: 'rabbit',
      label: '兔',
      baseInfo: CARE_INFO.rabbit,
      weights: [{
        range: '全体型',
        price: 65,
        size: '全部'
      }],
      rows: [{
        label: '每加 1 只',
        price: '+¥28'
      }, {
        label: '节假日加价',
        price: '+¥12'
      }, ROW_LONGTERM, ROW_EMERGENCY('+¥12'), ROW_PICKUP, ROW_MEDICATE, ROW_DELAY]
    }, {
      type: 'hamster',
      label: '鼠',
      baseInfo: CARE_INFO.hamster,
      weights: [{
        range: '全体型',
        price: 45,
        size: '全部'
      }],
      rows: [{
        label: '每加 1 只',
        price: '+¥20'
      }, {
        label: '节假日加价',
        price: '+¥8'
      }, ROW_LONGTERM, ROW_EMERGENCY('+¥8'), ROW_PICKUP, ROW_MEDICATE, ROW_DELAY]
    }, {
      type: 'bird',
      label: '鸟',
      baseInfo: CARE_INFO.bird,
      weights: [{
        range: '全体型',
        price: 48,
        size: '全部'
      }],
      rows: [{
        label: '每加 1 只',
        price: '+¥22'
      }, {
        label: '节假日加价',
        price: '+¥10'
      }, ROW_LONGTERM, ROW_EMERGENCY('+¥8'), ROW_PICKUP, ROW_MEDICATE, ROW_DELAY]
    }]
  }, {
    id: '日托',
    sub: '在守护者家',
    price: 58,
    unit: '天',
    petTypes: [{
      type: 'cat',
      weights: ['0–7', '7–18']
    }, {
      type: 'dog',
      weights: ['0–7', '7–18', '18–45']
    }],
    extras: [],
    petPricingTabs: [{
      type: 'dog',
      label: '狗',
      weights: [{
        range: '0–10 公斤',
        price: 58,
        size: '小型',
        tier: '小型犬',
        info: CARE_INFO.dog
      }, {
        range: '10–20 公斤',
        price: 68,
        size: '中型',
        tier: '中型犬',
        info: CARE_INFO.dog
      }, {
        range: '20 公斤+',
        price: 78,
        size: '大型',
        tier: '大型犬',
        info: CARE_INFO.dog
      }],
      rows: [{
        label: '幼犬',
        price: '+¥10'
      }, {
        label: '每加 1 只',
        price: '+¥35'
      }, {
        label: '节假日加价',
        price: '+¥15'
      }, ROW_EMERGENCY('+¥10'), ROW_PICKUP, ROW_MEDICATE]
    }, {
      type: 'cat',
      label: '猫',
      baseInfo: CARE_INFO.cat,
      weights: [{
        range: '全体型',
        price: 50,
        size: '全部'
      }],
      rows: [{
        label: '每加 1 只',
        price: '+¥30'
      }, {
        label: '节假日加价',
        price: '+¥12'
      }, ROW_EMERGENCY('+¥10'), ROW_PICKUP, ROW_MEDICATE]
    }, {
      type: 'rabbit',
      label: '兔',
      baseInfo: CARE_INFO.rabbit,
      weights: [{
        range: '全体型',
        price: 55,
        size: '全部'
      }],
      rows: [{
        label: '每加 1 只',
        price: '+¥25'
      }, {
        label: '节假日加价',
        price: '+¥10'
      }, ROW_EMERGENCY('+¥8'), ROW_PICKUP, ROW_MEDICATE]
    }, {
      type: 'hamster',
      label: '鼠',
      baseInfo: CARE_INFO.hamster,
      weights: [{
        range: '全体型',
        price: 38,
        size: '全部'
      }],
      rows: [{
        label: '每加 1 只',
        price: '+¥15'
      }, {
        label: '节假日加价',
        price: '+¥6'
      }, ROW_EMERGENCY('+¥6'), ROW_PICKUP, ROW_MEDICATE]
    }, {
      type: 'bird',
      label: '鸟',
      baseInfo: CARE_INFO.bird,
      weights: [{
        range: '全体型',
        price: 40,
        size: '全部'
      }],
      rows: [{
        label: '每加 1 只',
        price: '+¥18'
      }, {
        label: '节假日加价',
        price: '+¥8'
      }, ROW_EMERGENCY('+¥6'), ROW_PICKUP, ROW_MEDICATE]
    }]
  }, {
    id: '遛狗',
    sub: '在你的小区周边',
    price: 38,
    unit: '次',
    petTypes: [{
      type: 'dog',
      weights: ['0–7', '7–18', '18–45', '45+']
    }],
    extras: [],
    petPricingTabs: [{
      type: 'dog',
      label: '狗',
      weights: [{
        range: '0–10 公斤',
        price: 38,
        size: '小型',
        tier: '小型犬',
        info: '单次遛狗时长 30 分钟。'
      }, {
        range: '10–20 公斤',
        price: 45,
        size: '中型',
        tier: '中型犬',
        info: '单次遛狗时长 30 分钟。'
      }, {
        range: '20 公斤+',
        price: 52,
        size: '大型',
        tier: '大型犬',
        info: '单次遛狗时长 30 分钟。'
      }],
      rows: [{
        label: '幼犬',
        price: '+¥8'
      }, {
        label: '60 分钟加价',
        price: '+¥18'
      }, {
        label: '每加 1 只',
        price: '+¥20'
      }, {
        label: '节假日加价',
        price: '+¥10'
      }, ROW_EMERGENCY('+¥8'), ROW_VISIT]
    }]
  }, {
    id: '上门喂养',
    sub: '在宠物主家',
    price: 30,
    unit: '次',
    petTypes: [{
      type: 'cat',
      weights: ['0–7', '7–18', '18–45']
    }, {
      type: 'dog',
      weights: ['0–7', '7–18', '18–45', '45+']
    }],
    extras: [],
    petPricingTabs: [{
      type: 'dog',
      label: '狗',
      baseUnitNote: '单次 30 分钟',
      weights: [{
        range: '全体型适用',
        price: 38,
        size: '全部',
        tier: '30 分钟',
        info: VISIT_INFO.dog
      }],
      rows: VISIT_EXTRA_ROWS
    }, {
      type: 'cat',
      label: '猫',
      baseUnitNote: '单次 30 分钟',
      weights: [{
        range: '全体型适用',
        price: 32,
        size: '全部',
        tier: '30 分钟',
        info: VISIT_INFO.cat
      }],
      rows: VISIT_EXTRA_ROWS
    }, {
      type: 'rabbit',
      label: '兔',
      baseUnitNote: '单次 30 分钟',
      weights: [{
        range: '全体型适用',
        price: 30,
        size: '全部',
        tier: '30 分钟',
        info: VISIT_INFO.rabbit
      }],
      rows: VISIT_EXTRA_ROWS
    }, {
      type: 'hamster',
      label: '鼠',
      baseUnitNote: '单次 30 分钟',
      weights: [{
        range: '全体型适用',
        price: 26,
        size: '全部',
        tier: '30 分钟',
        info: VISIT_INFO.hamster
      }],
      rows: VISIT_EXTRA_ROWS
    }, {
      type: 'bird',
      label: '鸟',
      baseUnitNote: '单次 30 分钟',
      weights: [{
        range: '全体型适用',
        price: 28,
        size: '全部',
        tier: '30 分钟',
        info: VISIT_INFO.bird
      }],
      rows: VISIT_EXTRA_ROWS
    }]
  }, {
    id: '伴宠留宿',
    sub: '在宠物主家',
    price: 108,
    unit: '晚',
    petTypes: [{
      type: 'cat',
      weights: ['0–7', '7–18', '18–45']
    }, {
      type: 'dog',
      weights: ['0–7', '7–18', '18–45', '45+']
    }],
    extras: [],
    petPricingTabs: [{
      type: 'dog',
      label: '狗',
      baseInfo: CARE_INFO.dog,
      weights: [{
        range: '全体型',
        price: 108,
        size: '全部'
      }],
      rows: LODGE_DOG_ROWS
    }, {
      type: 'cat',
      label: '猫',
      baseInfo: CARE_INFO.cat,
      weights: [{
        range: '全体型',
        price: 98,
        size: '全部'
      }],
      rows: LODGE_PET_ROWS
    }, {
      type: 'rabbit',
      label: '兔',
      baseInfo: CARE_INFO.rabbit,
      weights: [{
        range: '全体型',
        price: 88,
        size: '全部'
      }],
      rows: LODGE_PET_ROWS
    }, {
      type: 'hamster',
      label: '鼠',
      baseInfo: CARE_INFO.hamster,
      weights: [{
        range: '全体型',
        price: 78,
        size: '全部'
      }],
      rows: LODGE_PET_ROWS
    }, {
      type: 'bird',
      label: '鸟',
      baseInfo: CARE_INFO.bird,
      weights: [{
        range: '全体型',
        price: 80,
        size: '全部'
      }],
      rows: LODGE_PET_ROWS
    }]
  }],
  reviews: [{
    id: 1,
    phone: '138****8888',
    pet: '金毛·3岁',
    rating: 5,
    service: '寄养',
    date: '2026-05-10',
    text: '陈逸非常负责，每天发照片和视频，豆豆玩得很开心！回来状态特别好，下次还会选择她。'
  }, {
    id: 2,
    phone: '136****2233',
    pet: '布偶猫·2岁',
    rating: 5,
    service: '寄养',
    date: '2026-04-28',
    text: '家里干净整洁，猫咪很快就适应了。陈逸会定期发照片，非常贴心，强烈推荐！'
  }, {
    id: 3,
    phone: '189****5566',
    pet: '柴犬·4岁',
    rating: 5,
    service: '遛狗',
    date: '2026-04-15',
    text: '遛狗服务很专业，每次准时，还会发遛狗路线图和照片，太满意了。'
  }, {
    id: 4,
    phone: '177****3344',
    pet: '泰迪·1岁',
    rating: 4,
    service: '日托',
    date: '2026-03-22',
    text: '总体很好，狗狗回来精神不错。偶尔回复稍慢，下次还会预约。'
  }, {
    id: 5,
    phone: '151****7788',
    pet: '英短·5岁',
    rating: 5,
    service: '上门喂养',
    date: '2026-03-08',
    text: '上门喂养准时，每次拍照汇报，猫咪状态很好，非常放心！'
  }, {
    id: 6,
    phone: '139****9900',
    pet: '边牧·2岁',
    rating: 5,
    service: '伴宠留宿',
    date: '2026-02-14',
    text: '陈逸很有爱心，狗狗非常喜欢她。整个守护期间每天有详细报告，超级安心。'
  }, {
    id: 7,
    phone: '135****1122',
    pet: '萨摩耶·3岁',
    rating: 4,
    service: '寄养',
    date: '2026-01-30',
    text: '服务很好，整体体验很棒，下次还会预约。'
  }, {
    id: 8,
    phone: '186****4455',
    pet: '柯基·4岁',
    rating: 5,
    service: '寄养',
    date: '2026-01-18',
    text: '超棒的守护者，狗狗完全不想回家！环境好，陈逸非常有耐心。'
  }],
  starDist: {
    5: 89,
    4: 8,
    3: 3
  },
  bookedDates: ['2026-05-25', '2026-05-26', '2026-05-27', '2026-05-30', '2026-05-31', '2026-06-06', '2026-06-07', '2026-06-13', '2026-06-14', '2026-06-20', '2026-06-21'],
  photos: [window.__resources && window.__resources.galleryPuppy || '../../uploads/Sleeping Golden Retriever Puppy.png', window.__resources && window.__resources.galleryRoom || '../../uploads/Bright Sunlit Room.png', window.__resources && window.__resources.galleryLiving || '../../uploads/Cozy Living Room Decor.png'],
  // Pet type sections for ServicesTab
  petTypeSections: [{
    title: '陈逸可以寄养',
    pets: [{
      type: 'cat',
      weights: ['0–7', '7–18']
    }, {
      type: 'dog',
      weights: ['0–7', '7–18', '18–45']
    }]
  }, {
    title: '陈逸可以上门照看',
    pets: [{
      type: 'cat',
      weights: ['0–7', '7–18', '18–45']
    }, {
      type: 'dog',
      weights: ['0–7', '7–18', '18–45', '45+']
    }]
  }]
};

// ─── Data: 阿哲 (训练师，遛狗为主) ───────────────────────────
const ZHE_DATA = {
  id: 'g6',
  name: '阿哲',
  isNewUserFlow: true,
  initial: {
    char: '哲',
    bg: LL.mint
  },
  tagline: '持证训练师，让每一次遛狗都成为一堂行为课',
  area: '朝阳区·望京，北京',
  joinedYears: 4,
  rating: 4.8,
  reviewCount: 189,
  orderCount: 367,
  verified: true,
  trained: true,
  bio: '我是一名持证宠物训练师，在望京带过上百只"问题狗狗"。\n\n比起单纯遛狗，我更擅长在散步中帮狗狗建立规矩——牵绳礼仪、社交脱敏、拆家与扑人纠正都是我的强项。每次服务都会发训练小结和照片，让你看到它一点点的进步。',
  skills: ['宠物训练师认证', '宠物急救证书', '行为矫正'],
  ownPets: [{
    id: 'op1',
    name: '可乐',
    breed: '边境牧羊犬',
    age: '2岁',
    bg: '#C7E8D8',
    photo: window.__resources && window.__resources.galleryPuppy || '../../uploads/Sleeping Golden Retriever Puppy.png'
  }],
  home: {
    type: '公寓',
    hasYard: false,
    smoking: false,
    hasPets: true,
    hasChildren: false,
    acceptHeatFemale: false,
    petOnBed: false,
    petOnSofa: true,
    onlyOnePet: false,
    toiletInterval: '每2–3小时'
  },
  services: [{
    id: '遛狗',
    sub: '在你的小区周边',
    price: 45,
    unit: '次',
    petTypes: [{
      type: 'dog',
      weights: ['0–7', '7–18', '18–45', '45+']
    }],
    extras: [],
    petPricingTabs: [{
      type: 'dog',
      label: '狗',
      weights: [{
        range: '0–10 公斤',
        price: 45,
        size: '小型',
        tier: '小型犬',
        info: '单次遛狗 30 分钟，含基础牵引与社交引导。'
      }, {
        range: '10–20 公斤',
        price: 52,
        size: '中型',
        tier: '中型犬',
        info: '单次遛狗 30 分钟，含基础牵引与社交引导。'
      }, {
        range: '20 公斤+',
        price: 60,
        size: '大型',
        tier: '大型犬',
        info: '单次遛狗 30 分钟，含基础牵引与社交引导。'
      }],
      rows: [{
        label: '幼犬',
        price: '+¥8'
      }, {
        label: '60 分钟加价',
        price: '+¥20'
      }, {
        label: '行为训练加练（每次）',
        price: '+¥30',
        info: '结合遛狗进行基础服从 / 社交训练，由训练师一对一指导。'
      }, {
        label: '每加 1 只',
        price: '+¥22'
      }, {
        label: '节假日加价',
        price: '+¥12'
      }, ROW_EMERGENCY('+¥8'), ROW_VISIT]
    }]
  }, {
    id: '寄养',
    sub: '在守护者家',
    price: 138,
    unit: '晚',
    petTypes: [{
      type: 'dog',
      weights: ['0–7', '7–18', '18–45']
    }],
    extras: [],
    petPricingTabs: [{
      type: 'dog',
      label: '狗',
      weights: [{
        range: '0–10 公斤',
        price: 138,
        size: '小型',
        tier: '小型犬',
        info: CARE_INFO.dog
      }, {
        range: '10–20 公斤',
        price: 158,
        size: '中型',
        tier: '中型犬',
        info: CARE_INFO.dog
      }, {
        range: '20 公斤+',
        price: 178,
        size: '大型',
        tier: '大型犬',
        info: CARE_INFO.dog
      }],
      rows: [{
        label: '幼犬',
        price: '+¥15'
      }, {
        label: '每加 1 只',
        price: '+¥55'
      }, {
        label: '节假日加价',
        price: '+¥20'
      }, {
        label: '行为训练加练（每天）',
        price: '+¥40',
        info: '寄养期间每日加入基础服从训练，帮助纠正拆家、扑人等行为。'
      }, ROW_LONGTERM, ROW_EMERGENCY('+¥18'), ROW_PICKUP, ROW_MEDICATE, ROW_DELAY]
    }]
  }, {
    id: '日托',
    sub: '在守护者家',
    price: 78,
    unit: '天',
    petTypes: [{
      type: 'dog',
      weights: ['0–7', '7–18', '18–45']
    }],
    extras: [],
    petPricingTabs: [{
      type: 'dog',
      label: '狗',
      weights: [{
        range: '0–10 公斤',
        price: 78,
        size: '小型',
        tier: '小型犬',
        info: CARE_INFO.dog
      }, {
        range: '10–20 公斤',
        price: 88,
        size: '中型',
        tier: '中型犬',
        info: CARE_INFO.dog
      }, {
        range: '20 公斤+',
        price: 98,
        size: '大型',
        tier: '大型犬',
        info: CARE_INFO.dog
      }],
      rows: [{
        label: '幼犬',
        price: '+¥12'
      }, {
        label: '每加 1 只',
        price: '+¥40'
      }, {
        label: '节假日加价',
        price: '+¥16'
      }, {
        label: '行为训练加练（每天）',
        price: '+¥40'
      }, ROW_EMERGENCY('+¥12'), ROW_PICKUP, ROW_MEDICATE]
    }]
  }, {
    id: '上门喂养',
    sub: '在宠物主家',
    price: 38,
    unit: '次',
    petTypes: [{
      type: 'dog',
      weights: ['0–7', '7–18', '18–45', '45+']
    }],
    extras: [],
    petPricingTabs: [{
      type: 'dog',
      label: '狗',
      baseUnitNote: '单次 30 分钟',
      weights: [{
        range: '全体型适用',
        price: 38,
        size: '全部',
        tier: '30 分钟',
        info: VISIT_INFO.dog
      }],
      rows: VISIT_EXTRA_ROWS
    }]
  }],
  reviews: [{
    id: 1,
    phone: '137****6611',
    pet: '拉布拉多·2岁',
    rating: 5,
    service: '遛狗',
    date: '2026-05-12',
    text: '阿哲是训练师，遛狗时顺便纠正了乱扑人的毛病，回来明显乖了，还发了训练小结。'
  }, {
    id: 2,
    phone: '159****2048',
    pet: '边牧·1岁',
    rating: 5,
    service: '遛狗',
    date: '2026-05-03',
    text: '边牧精力太旺，阿哲每次遛足30分钟还做服从练习，狗子终于不拆家了！'
  }, {
    id: 3,
    phone: '138****7720',
    pet: '金毛·3岁',
    rating: 5,
    service: '寄养',
    date: '2026-04-20',
    text: '寄养期间每天有训练和照片，环境干净，狗狗很喜欢他，强烈推荐。'
  }, {
    id: 4,
    phone: '186****3355',
    pet: '柯基·2岁',
    rating: 4,
    service: '遛狗',
    date: '2026-04-06',
    text: '很专业，路线和时间都很准时。偶尔回复稍慢，整体满意。'
  }, {
    id: 5,
    phone: '135****9182',
    pet: '泰迪·4岁',
    rating: 5,
    service: '日托',
    date: '2026-03-19',
    text: '日托加了训练，泰迪学会了定点，太省心了。'
  }, {
    id: 6,
    phone: '151****4407',
    pet: '萨摩耶·2岁',
    rating: 5,
    service: '遛狗',
    date: '2026-03-02',
    text: '大狗也能稳稳牵住，社交训练很有一套，已经是回头客了。'
  }, {
    id: 7,
    phone: '139****8830',
    pet: '比熊·1岁',
    rating: 5,
    service: '上门喂养',
    date: '2026-02-15',
    text: '上门准时，喂食遛弯都到位，还拍了视频，很安心。'
  }, {
    id: 8,
    phone: '177****2261',
    pet: '阿拉斯加·3岁',
    rating: 5,
    service: '寄养',
    date: '2026-01-28',
    text: '大型犬也接得住，训练师就是不一样，狗子状态特别好。'
  }],
  starDist: {
    5: 84,
    4: 12,
    3: 4
  },
  bookedDates: ['2026-05-25', '2026-05-28', '2026-05-29', '2026-06-01', '2026-06-02', '2026-06-08', '2026-06-09', '2026-06-15', '2026-06-16', '2026-06-22'],
  photos: [window.__resources && window.__resources.zheHero || 'assets/zhe-hero.png', window.__resources && window.__resources.galleryRoom || '../../uploads/Bright Sunlit Room.png', window.__resources && window.__resources.galleryLiving || '../../uploads/Cozy Living Room Decor.png'],
  petTypeSections: [{
    title: '阿哲可以遛狗',
    pets: [{
      type: 'dog',
      weights: ['0–7', '7–18', '18–45', '45+']
    }]
  }, {
    title: '阿哲可以寄养',
    pets: [{
      type: 'dog',
      weights: ['0–7', '7–18', '18–45']
    }]
  }]
};

// ─── Helpers ─────────────────────────────────────────────────
function Stars({
  count = 5,
  size = 12
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      gap: 1
    }
  }, [0, 1, 2, 3, 4].map(i => /*#__PURE__*/React.createElement("i", {
    key: i,
    className: i < count ? 'ph-fill ph-star' : 'ph ph-star',
    style: {
      fontSize: size,
      color: i < count ? '#F0B100' : '#DDD',
      lineHeight: 1
    }
  })));
}
function Divider() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: LL.border,
      margin: '0 0 18px'
    }
  });
}
function SecHead({
  title
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 12
    }
  }, title);
}

// Icon with optional blocked (🚫) overlay
function HomeIcon({
  name,
  blocked = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: 20,
      height: 20,
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${name}`,
    style: {
      fontSize: 20,
      color: blocked ? '#C0C0C0' : '#6B6B7A',
      display: 'block',
      lineHeight: 1
    }
  }), blocked && /*#__PURE__*/React.createElement("svg", {
    width: "24",
    height: "24",
    viewBox: "0 0 24 24",
    fill: "none",
    style: {
      position: 'absolute',
      top: -2,
      left: -2,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10.5",
    stroke: "#CC2200",
    strokeWidth: "1.5"
  }), /*#__PURE__*/React.createElement("line", {
    x1: "4.5",
    y1: "4.5",
    x2: "19.5",
    y2: "19.5",
    stroke: "#CC2200",
    strokeWidth: "1.5",
    strokeLinecap: "round"
  })));
}

// ─── Photo Carousel ───────────────────────────────────────────
function PhotoCarousel({
  photos = []
}) {
  const [idx, setIdx] = React.useState(0);
  const n = photos.length;
  if (!n) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: 240,
      overflow: 'hidden',
      background: LL.lavender
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      height: '100%',
      transform: `translateX(-${idx * 100}%)`,
      transition: 'transform 260ms ease'
    }
  }, photos.map((src, i) => /*#__PURE__*/React.createElement("img", {
    key: i,
    src: src,
    alt: "",
    style: {
      flex: '0 0 100%',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center',
      display: 'block'
    },
    onError: e => {
      e.target.style.background = LL.lavender;
    }
  }))), idx > 0 && /*#__PURE__*/React.createElement("button", {
    onClick: () => setIdx(i => i - 1),
    style: {
      position: 'absolute',
      left: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: 'rgba(255,255,255,0.82)',
      boxShadow: '0 1px 6px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 15,
      color: LL.text
    }
  })), idx < n - 1 && /*#__PURE__*/React.createElement("button", {
    onClick: () => setIdx(i => i + 1),
    style: {
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: 'translateY(-50%)',
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: 'rgba(255,255,255,0.82)',
      boxShadow: '0 1px 6px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 15,
      color: LL.text
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 10,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'center',
      gap: 5
    }
  }, photos.map((_, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    onClick: () => setIdx(i),
    style: {
      width: i === idx ? 16 : 6,
      height: 6,
      borderRadius: 3,
      background: i === idx ? '#fff' : 'rgba(255,255,255,0.55)',
      transition: 'width 200ms ease',
      cursor: 'pointer'
    }
  }))));
}

// ─── Sticky Profile Nav (white, always visible at top) ────────
function StickyProfileNav({
  name,
  onBack
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 47,
      zIndex: 21,
      height: 52,
      background: '#fff',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      border: 0,
      background: LL.bg,
      color: LL.text,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 17
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u5B88\u62A4\u8005\u4E3B\u9875"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      flex: '0 0 auto'
    }
  }));
}

// ─── Hero ─────────────────────────────────────────────────────
function ProfileHero({
  g,
  liked,
  onLike
}) {
  const resPhoto = g.photoKey && window.__resources ? window.__resources[g.photoKey] : null;
  const photoSrc = resPhoto || g.photo || null;
  const photos = g.photos && g.photos.length ? g.photos : photoSrc ? [photoSrc] : [];
  const initial = g.initial || null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.surface
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, photos.length > 0 ? /*#__PURE__*/React.createElement(PhotoCarousel, {
    photos: photos
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      height: 240,
      background: initial?.bg || LL.lavender,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 96,
      fontWeight: 800,
      color: 'rgba(34,40,44,0.20)',
      letterSpacing: '-0.02em'
    }
  }, initial?.char || g.name && g.name[0] || '')), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 12,
      right: 12,
      display: 'flex',
      gap: 8,
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      border: 0,
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 1px 6px rgba(0,0,0,0.18)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-share-network",
    style: {
      fontSize: 16,
      color: LL.text2
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: onLike,
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      border: 0,
      background: liked ? 'rgba(255,240,240,0.92)' : 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      boxShadow: '0 1px 6px rgba(0,0,0,0.18)',
      transition: 'background 140ms'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: liked ? 'ph-fill ph-heart' : 'ph ph-heart',
    style: {
      fontSize: 16,
      color: liked ? '#E63946' : LL.text3
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 14px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: -32,
      left: 16,
      width: 64,
      height: 64,
      borderRadius: '50%',
      border: '3px solid #fff',
      overflow: 'hidden',
      background: initial?.bg || LL.lavender,
      boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, photoSrc ? /*#__PURE__*/React.createElement("img", {
    src: photoSrc,
    alt: g.name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'top center'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28,
      fontWeight: 800,
      color: LL.text
    }
  }, initial?.char || g.name && g.name[0] || '')), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: 40
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      color: LL.text,
      letterSpacing: '-0.02em',
      marginBottom: 4
    }
  }, g.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text2,
      marginBottom: 3
    }
  }, g.tagline), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text3,
      marginBottom: 3
    }
  }, g.area), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: LL.text
    }
  }, g.reviewCount), " \u6761\u8BC4\u4EF7"))));
}

// ─── Tab Bar ──────────────────────────────────────────────────
const TABS = [{
  id: 'info',
  label: '信息'
}, {
  id: 'services',
  label: '服务'
}];
function TabNav({
  active,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      borderBottom: `1px solid ${LL.border}`,
      background: LL.surface,
      position: 'sticky',
      top: 0,
      zIndex: 19
    }
  }, TABS.map(t => {
    const on = t.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => onChange(t.id),
      style: {
        flex: 1,
        height: 44,
        border: 0,
        background: 'transparent',
        fontSize: 14,
        fontWeight: on ? 700 : 500,
        color: on ? LL.text : LL.text3,
        borderBottom: on ? `2px solid ${LL.text}` : '2px solid transparent',
        cursor: 'pointer',
        fontFamily: LL.font,
        transition: 'color 160ms, border-color 160ms'
      }
    }, t.label);
  }));
}

// ─── Shared Guardian Calendar ────────────────────────────────
// Used in both GuardianProfileScreen (viewOnly) and BookingFlowScreen (interactive)
function GuardianCalendar({
  bookedDates = [],
  svcPrice = null,
  // number, shown below available dates (null = hide)
  svcUnit = '晚',
  viewOnly = true,
  start = null,
  // Date | null  (interactive mode)
  end = null,
  // Date | null
  onChange,
  // ({start,end}) => void
  scroll = false,
  // true → vertically-stacked multi-month view
  monthsCount = 9 // how many months to render in scroll mode
}) {
  const bookedSet = React.useMemo(() => new Set(bookedDates), [bookedDates]);
  const TODAY = new Date(2026, 4, 27);
  const [mo, setMo] = React.useState(0);
  const MNAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const WD = ['日', '一', '二', '三', '四', '五', '六'];
  const sameDate = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const LABEL_H = 12;
  const BOX_H = 28;
  const PRICE_H = svcPrice !== null ? 13 : 0;
  const handleTap = (dt, past, booked) => {
    if (viewOnly || past || booked) return;
    if (!start || start && end) {
      onChange?.({
        start: dt,
        end: null
      });
    } else if (dt <= start) {
      onChange?.({
        start: dt,
        end: null
      });
    } else {
      onChange?.({
        start,
        end: dt
      });
    }
  };

  // ── Render the 7-col day grid for one (year, month) ──────────
  function renderMonthGrid(year, month) {
    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const toDate = d => new Date(year, month, d);
    const toKey = d => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const cells = [];
    for (let i = 0; i < firstDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(7,1fr)',
        gap: 0
      }
    }, cells.map((d, i) => {
      if (!d) return /*#__PURE__*/React.createElement("div", {
        key: `e${i}`,
        style: {
          height: LABEL_H + BOX_H + PRICE_H + 2
        }
      });
      const dt = toDate(d);
      const past = dt < TODAY;
      const today = month === TODAY.getMonth() && year === TODAY.getFullYear() && d === TODAY.getDate();
      const booked = bookedSet.has(toKey(d));
      const avail = !past && !booked;
      const isStartD = !viewOnly && sameDate(dt, start);
      const isEndD = !viewOnly && sameDate(dt, end);
      const isInRangeD = !viewOnly && start && end && dt > start && dt < end;
      const isEdge = isStartD || isEndD;
      const isSingleDay = start && end && sameDate(start, end);
      const hasRange = start && end && !isSingleDay;
      const clickable = !viewOnly && avail;
      let color = LL.text,
        fw = 400;
      let cellBg = 'transparent',
        cellRadius = 0;
      if (past) {
        color = '#C8C8C8';
      } else if (booked) {
        color = '#C2C2CC';
      } else if (isEdge) {
        cellBg = PROFILE_PURPLE;
        color = '#fff';
        fw = 700;
        cellRadius = 8;
      } else if (today && viewOnly) {
        cellBg = PROFILE_PURPLE;
        color = '#fff';
        fw = 700;
        cellRadius = 8;
      } else if (avail || isInRangeD) {
        color = PROFILE_PURPLE;
        fw = avail ? 600 : 500;
      }
      const showPrice = avail && svcPrice !== null && !past;
      const priceColor = PROFILE_PURPLE;
      return /*#__PURE__*/React.createElement("div", {
        key: d,
        onClick: () => handleTap(dt, past, booked),
        style: {
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: 1,
          cursor: clickable ? 'pointer' : 'default',
          opacity: past ? 0.38 : 1
        }
      }, !viewOnly && isInRangeD && /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          top: LABEL_H + 1,
          left: 0,
          right: 0,
          height: BOX_H,
          background: PROFILE_PURPLE_BG,
          zIndex: 0
        }
      }), !viewOnly && isStartD && hasRange && /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          top: LABEL_H + 1,
          left: '50%',
          right: 0,
          height: BOX_H,
          background: PROFILE_PURPLE_BG,
          zIndex: 0
        }
      }), !viewOnly && isEndD && hasRange && /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          top: LABEL_H + 1,
          right: '50%',
          left: 0,
          height: BOX_H,
          background: PROFILE_PURPLE_BG,
          zIndex: 0
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          height: LABEL_H,
          fontSize: 8.5,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: isEdge ? 'rgba(255,255,255,0.7)' : PROFILE_PURPLE,
          visibility: today ? 'visible' : 'hidden',
          width: '100%',
          position: 'relative',
          zIndex: 1
        }
      }, "\u4ECA\u5929"), /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'relative',
          zIndex: 1,
          minWidth: BOX_H,
          height: BOX_H,
          borderRadius: cellRadius,
          background: cellBg,
          color,
          fontSize: 13,
          fontWeight: fw,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontVariantNumeric: 'tabular-nums',
          padding: isEdge ? '0 4px' : 0
        }
      }, d), svcPrice !== null && /*#__PURE__*/React.createElement("div", {
        style: {
          height: PRICE_H,
          fontSize: 9.5,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: showPrice ? priceColor : 'transparent',
          fontVariantNumeric: 'tabular-nums',
          position: 'relative',
          zIndex: 1
        }
      }, showPrice ? `¥${svcPrice}` : '.'));
    }));
  }

  // Sticky weekday header row
  const weekdayHeader = /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      padding: '6px 0 8px',
      background: '#fff',
      position: 'sticky',
      top: 0,
      zIndex: 5
    }
  }, WD.map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      textAlign: 'center',
      fontSize: 11.5,
      color: LL.text3,
      fontWeight: 500
    }
  }, d)));
  const legend = /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 12,
      height: 12,
      borderRadius: 3,
      background: PROFILE_PURPLE_BG,
      boxShadow: `inset 0 0 0 1px ${PROFILE_PURPLE}`
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: PROFILE_PURPLE
    }
  }, "\u7A7A\u95F2\u53EF\u7EA6")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 12,
      height: 12,
      borderRadius: 3,
      background: '#F0F0F5'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: LL.text3
    }
  }, "\u5DF2\u9884\u7EA6"))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      marginTop: 6
    }
  }, "\u65E5\u5386\u6700\u540E\u66F4\u65B0\u4E8E 4 \u5929\u524D"));

  // ── Scroll mode: stacked months, scrollable container ────────
  if (scroll) {
    const baseY = 2026,
      baseM = 4;
    const months = [];
    for (let i = 0; i < monthsCount; i++) {
      const m = (baseM + i) % 12;
      const y = baseY + Math.floor((baseM + i) / 12);
      months.push({
        y,
        m
      });
    }
    return /*#__PURE__*/React.createElement("div", null, weekdayHeader, /*#__PURE__*/React.createElement("div", {
      style: {
        maxHeight: 360,
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        margin: '0 -2px',
        padding: '0 2px'
      }
    }, months.map(({
      y,
      m
    }) => /*#__PURE__*/React.createElement("div", {
      key: `${y}-${m}`,
      style: {
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 16,
        fontWeight: 800,
        color: LL.text,
        padding: '6px 2px 10px'
      }
    }, MNAMES[m], " ", y), renderMonthGrid(y, m)))), legend);
  }

  // ── Single-month mode (view-only profile) ────────────────────
  const year = 2026,
    month = 4 + mo;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setMo(m => Math.max(0, m - 1)),
    disabled: mo === 0,
    style: {
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: 'transparent',
      cursor: mo === 0 ? 'default' : 'pointer',
      color: mo === 0 ? '#CCC' : LL.text,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 14
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: LL.text
    }
  }, year, "\u5E74 ", MNAMES[month]), /*#__PURE__*/React.createElement("button", {
    onClick: () => setMo(m => Math.min(2, m + 1)),
    style: {
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      color: LL.text,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 14
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7,1fr)',
      marginBottom: 2
    }
  }, WD.map(d => /*#__PURE__*/React.createElement("div", {
    key: d,
    style: {
      textAlign: 'center',
      fontSize: 11,
      color: LL.text3,
      fontWeight: 500,
      paddingBottom: 4
    }
  }, d))), renderMonthGrid(year, month), legend);
}

// ─── Calendar (inside 信息 tab) ───────────────────────────────
function CalendarBlock({
  bookedDates,
  guardianServices,
  onViewServices,
  defaultService
}) {
  const initSvc = defaultService && guardianServices?.some(s => s.id === defaultService) ? defaultService : guardianServices?.[0]?.id || '寄养';
  const [selectedSvc, setSelectedSvc] = React.useState(initSvc);
  const [svcOpen, setSvcOpen] = React.useState(false);
  const svcOptions = guardianServices?.map(s => s.id) || ['寄养'];
  const svcData = guardianServices?.find(s => s.id === selectedSvc);
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SecHead, {
    title: "\u53EF\u7528\u65E5\u671F"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      border: `1px solid ${LL.border}`,
      borderRadius: 8,
      padding: '10px 14px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: LL.text3,
      flex: '0 0 auto',
      marginRight: 4
    }
  }, "\u670D\u52A1\u7C7B\u578B\uFF1A"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setSvcOpen(o => !o),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      flex: 1,
      background: 'transparent',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: LL.text
    }
  }, selectedSvc), /*#__PURE__*/React.createElement("i", {
    className: `ph ph-caret-${svcOpen ? 'up' : 'down'}`,
    style: {
      fontSize: 11,
      color: LL.text3
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 14,
      background: LL.border,
      margin: '0 10px',
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setSvcOpen(false);
      onViewServices?.();
    },
    style: {
      background: 'transparent',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      fontSize: 12,
      fontWeight: 600,
      color: PROFILE_PURPLE,
      flex: '0 0 auto'
    }
  }, "\u67E5\u770B\u8BE6\u60C5")), svcOpen && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      marginTop: 4,
      background: '#fff',
      borderRadius: 10,
      zIndex: 30,
      boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
      border: `1px solid ${LL.border}`,
      overflow: 'hidden'
    }
  }, svcOptions.map((opt, i) => /*#__PURE__*/React.createElement("button", {
    key: opt,
    onClick: () => {
      setSelectedSvc(opt);
      setSvcOpen(false);
    },
    style: {
      width: '100%',
      padding: '12px 14px',
      background: 'transparent',
      border: 0,
      borderBottom: i < svcOptions.length - 1 ? `1px solid ${LL.border}` : 'none',
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: 14,
      fontWeight: selectedSvc === opt ? 700 : 500,
      color: LL.text,
      textAlign: 'left'
    }
  }, opt, selectedSvc === opt && /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-check",
    style: {
      fontSize: 14,
      color: PROFILE_PURPLE
    }
  }))))), /*#__PURE__*/React.createElement(GuardianCalendar, {
    bookedDates: bookedDates,
    svcPrice: null,
    svcUnit: svcData?.unit ?? '晚',
    viewOnly: true
  }));
}

// ─── 信息 Tab ─────────────────────────────────────────────────
function InfoTab({
  g,
  onViewServices,
  onViewAllReviews,
  defaultService
}) {
  const [bioExp, setBioExp] = React.useState(false);
  const [homeExp, setHomeExp] = React.useState(false);
  const [expandedPetId, setExpandedPetId] = React.useState(null);
  const AVAS = [LL.butter, LL.lavender, LL.mint, LL.peach];
  const BIO_LIMIT = 75;
  const bioText = g.bio || '';
  const bioShort = bioText.replace(/\n/g, ' ').slice(0, BIO_LIMIT);
  const bioTooLong = bioText.replace(/\n/g, '').length > BIO_LIMIT;
  const h = g.home;
  const homeItems = [{
    icon: 'house',
    text: `住${h.type}`,
    blocked: false
  }, {
    icon: 'tree',
    text: h.hasYard ? '有院子' : '无院子',
    blocked: !h.hasYard
  }, {
    icon: 'wind',
    text: h.smoking ? '吸烟家庭' : '无烟家庭',
    blocked: h.smoking
  }, {
    icon: 'paw-print',
    text: h.hasPets ? '家中有其他宠物' : '家中无其他宠物',
    blocked: h.hasPets
  }, {
    icon: 'user',
    text: h.hasChildren ? '家中有儿童' : '家中无儿童',
    blocked: h.hasChildren
  }, {
    icon: 'gender-female',
    text: h.acceptHeatFemale ? '接受发情期母犬' : '不接受发情期母犬',
    blocked: !h.acceptHeatFemale
  }, {
    icon: 'bed',
    text: h.petOnBed ? '允许宠物上床' : '不允许宠物上床',
    blocked: !h.petOnBed
  }, {
    icon: 'armchair',
    text: h.petOnSofa ? '允许宠物上沙发' : '不允许宠物上沙发',
    blocked: !h.petOnSofa
  }, {
    icon: 'user-circle',
    text: '每次仅接待1只宠物',
    blocked: false
  }, {
    icon: 'clock',
    text: `如厕：${h.toiletInterval}`,
    blocked: false
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '18px 16px 24px',
      background: LL.surface
    }
  }, /*#__PURE__*/React.createElement(SecHead, {
    title: `关于${g.name}`
  }), g.skills && g.skills.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap',
      marginBottom: 12
    }
  }, g.skills.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      background: GGREEN_BG,
      color: GGREEN,
      borderRadius: 999,
      padding: '4px 11px',
      fontSize: 12,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-check-circle",
    style: {
      fontSize: 13,
      flex: '0 0 auto'
    }
  }), s))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: LL.text2,
      lineHeight: 1.75,
      marginBottom: 6,
      textWrap: 'pretty',
      whiteSpace: 'pre-wrap'
    }
  }, !bioExp && bioTooLong ? bioShort + '…' : bioText), bioTooLong && /*#__PURE__*/React.createElement("button", {
    onClick: () => setBioExp(e => !e),
    style: {
      background: 'transparent',
      border: 0,
      padding: 0,
      marginBottom: 18,
      fontSize: 13,
      fontWeight: 600,
      color: LL.text,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3
    }
  }, bioExp ? '收起' : '阅读更多', /*#__PURE__*/React.createElement("i", {
    className: `ph ph-caret-${bioExp ? 'up' : 'down'}`,
    style: {
      fontSize: 11
    }
  })), !bioTooLong && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 18
    }
  }), g.ownPets && g.ownPets.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(SecHead, {
    title: "Ta\u7684\u5BA0\u7269"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      overflowX: 'auto',
      overflowY: 'hidden',
      padding: '2px 0 6px',
      marginBottom: 20,
      scrollbarWidth: 'none',
      WebkitOverflowScrolling: 'touch'
    }
  }, g.ownPets.map(pet => /*#__PURE__*/React.createElement("button", {
    key: pet.id,
    onClick: () => {},
    style: {
      flex: '0 0 auto',
      background: 'transparent',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 7,
      width: 60
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 60,
      height: 60,
      borderRadius: '50%',
      overflow: 'hidden',
      background: pet.bg || LL.butter,
      flex: '0 0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `1.5px solid ${LL.border}`
    }
  }, pet.photo ? /*#__PURE__*/React.createElement("img", {
    src: pet.photo,
    alt: pet.name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'center'
    },
    onError: e => {
      e.target.style.display = 'none';
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: 'rgba(34,40,44,0.45)'
    }
  }, pet.name[0])), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 600,
      color: LL.text,
      lineHeight: 1.2,
      maxWidth: 60,
      textAlign: 'center',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, pet.name))))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(SecHead, {
    title: "\u6211\u7684\u5BB6"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px 20px',
      marginBottom: 20
    }
  }, homeItems.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(HomeIcon, {
    name: item.icon,
    blocked: item.blocked
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: item.blocked ? '#ABABAB' : LL.text2,
      lineHeight: 1.45
    }
  }, item.text)))), g.reviews && g.reviews.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text,
      flex: 1
    }
  }, "\u7528\u6237\u8BC4\u4EF7"), /*#__PURE__*/React.createElement("button", {
    onClick: onViewAllReviews,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      background: 'transparent',
      border: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-star",
    style: {
      fontSize: 12,
      color: '#F0B100'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: LL.text
    }
  }, g.rating), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }, "(", g.reviewCount, "\u6761)"), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 13,
      color: LL.text2,
      marginLeft: 2
    }
  }))), g.reviews.slice(0, 2).map((r, idx) => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    style: {
      paddingTop: idx > 0 ? 16 : 0,
      marginTop: idx > 0 ? 16 : 0,
      borderTop: idx > 0 ? `1px solid ${LL.border}` : 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      background: AVAS[r.id % AVAS.length],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 11,
      fontWeight: 700,
      color: LL.text,
      flex: '0 0 auto'
    }
  }, r.phone.slice(0, 3)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: LL.text
    }
  }, r.phone), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: LL.text3
    }
  }, r.pet)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: LL.text
    }
  }, r.rating.toFixed(1)), /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-star",
    style: {
      fontSize: 12,
      color: '#F0B100'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text2,
      lineHeight: 1.7,
      paddingLeft: 46,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, r.text))), /*#__PURE__*/React.createElement("button", {
    onClick: onViewAllReviews,
    style: {
      width: '100%',
      height: 40,
      marginTop: 14,
      borderRadius: 999,
      border: `1px solid ${LL.border}`,
      background: 'transparent',
      fontSize: 13,
      fontWeight: 600,
      color: LL.text2,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4
    }
  }, "\u67E5\u770B\u5168\u90E8\u8BC4\u4EF7\uFF08", g.reviewCount, "\u6761\uFF09", /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 11
    }
  }))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(SecHead, {
    title: "\u4F4D\u7F6E"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: LL.text2,
      marginBottom: 10
    }
  }, g.area), /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 10,
      overflow: 'hidden',
      height: 150,
      background: '#D8E8F0',
      marginBottom: 20,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: window.__resources && window.__resources.mapImg || './assets/map.png',
    alt: "\u5730\u56FE\u4F4D\u7F6E",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    },
    onError: e => {
      e.target.style.display = 'none';
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 110,
      height: 110,
      borderRadius: '50%',
      background: 'rgba(44,122,75,0.18)',
      border: '1.5px solid rgba(44,122,75,0.45)'
    }
  }))), /*#__PURE__*/React.createElement(Divider, null), /*#__PURE__*/React.createElement(CalendarBlock, {
    bookedDates: g.bookedDates,
    guardianServices: g.services,
    onViewServices: onViewServices,
    defaultService: defaultService
  }));
}

// ─── 评价 Tab ─────────────────────────────────────────────────
function ReviewsTab({
  g
}) {
  const [showAll, setShowAll] = React.useState(false);
  const shown = showAll ? g.reviews : g.reviews.slice(0, 6);
  const AVAS = [LL.butter, LL.lavender, LL.mint, LL.peach, '#D4E8F7', '#F7D4E8'];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.surface
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 16px 14px',
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 46,
      fontWeight: 800,
      color: LL.text,
      lineHeight: 1,
      letterSpacing: '-0.03em',
      marginBottom: 4
    }
  }, g.rating), /*#__PURE__*/React.createElement(Stars, {
    count: 5,
    size: 13
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      marginTop: 5
    }
  }, g.reviewCount, " \u6761\u8BC4\u4EF7")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, [5, 4, 3].map(n => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      width: 8
    }
  }, n), /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-star",
    style: {
      fontSize: 10,
      color: '#F0B100',
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 5,
      borderRadius: 3,
      background: '#EBEBEB'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${g.starDist[n] || 0}%`,
      height: '100%',
      background: '#F0B100',
      borderRadius: 3
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      minWidth: 26,
      textAlign: 'right'
    }
  }, g.starDist[n] || 0, "%"))))), shown.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.id,
    style: {
      padding: '14px 16px',
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: '50%',
      flex: '0 0 auto',
      background: AVAS[r.id % AVAS.length],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 12,
      fontWeight: 700,
      color: LL.text
    }
  }, r.phone.slice(0, 3)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: LL.text
    }
  }, r.phone), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3
    }
  }, r.pet)), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement(Stars, {
    count: r.rating,
    size: 11
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      marginTop: 3
    }
  }, r.date.slice(0, 7)))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: LL.text2,
      lineHeight: 1.65,
      textWrap: 'pretty'
    }
  }, r.text), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      background: '#F5F5FA',
      borderRadius: 5,
      padding: '3px 9px',
      fontSize: 11.5,
      color: LL.text3
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-tag",
    style: {
      fontSize: 11
    }
  }), r.service))), g.reviews.length > 6 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowAll(a => !a),
    style: {
      width: '100%',
      height: 42,
      borderRadius: 999,
      border: `1px solid ${LL.border}`,
      background: 'transparent',
      fontSize: 13.5,
      fontWeight: 600,
      color: LL.text,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4
    }
  }, showAll ? '收起评价' : `查看更多评价（${g.reviews.length - 6} 条）`, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-caret-${showAll ? 'up' : 'down'}`,
    style: {
      fontSize: 11
    }
  }))));
}

// ─── 服务 Tab ─────────────────────────────────────────────────
const SVC_ICON_MAP = {
  '寄养': 'house',
  '日托': 'sun',
  '遛狗': 'sneaker',
  '上门喂养': 'hand-waving',
  '伴宠留宿': 'moon-stars'
};
const SVC_BG_MAP = {
  '寄养': '#FEE7A6',
  '日托': '#FBD3C4',
  '遛狗': '#C7E8D8',
  '上门喂养': '#D8CAE8',
  '伴宠留宿': '#E8E3F4'
};
const PET_ICON_MAP = {
  dog: 'dog',
  cat: 'cat'
};
const PRICING_SVC_TYPES = ['寄养', '日托', '遛狗', '上门喂养', '伴宠留宿'];
const PET_BG_MAP = {
  dog: '#EDF6EE',
  cat: '#F0EEF8',
  rabbit: '#FEF6E4',
  hamster: '#FFF0EA',
  bird: '#E8F0FE'
};
const PET_COLOR_MAP = {
  dog: '#2C7A4B',
  cat: PROFILE_PURPLE,
  rabbit: '#B45309',
  hamster: '#9C4221',
  bird: '#2F5F87'
};
const PET_ICON_MAP2 = {
  dog: 'dog',
  cat: 'cat',
  rabbit: 'rabbit',
  bird: 'bird',
  hamster: 'mouse-simple'
};
const SIZE_SCALE = {
  '小型': 14,
  '普通': 16,
  '中型': 20,
  '大型': 24,
  '全部': 16
};

// ─── Pricing card with pet-type tabs (寄养 / 日托) ────────────
function PricingServiceCard({
  svc
}) {
  const tabs = svc.petPricingTabs || [];
  const [activeType, setActiveType] = React.useState(tabs[0]?.type || '');
  const [openTooltip, setOpenTooltip] = React.useState(null);
  React.useEffect(() => {
    setOpenTooltip(null);
  }, [activeType]);
  const tab = tabs.find(t => t.type === activeType) || tabs[0];
  if (!tab) return null;
  const toggleTip = key => setOpenTooltip(k => k === key ? null : key);
  const rows = tab.rows || [];
  const bg = PET_BG_MAP[tab.type] || LL.bg;
  const color = PET_COLOR_MAP[tab.type] || LL.text;
  const icon = PET_ICON_MAP2[tab.type] || 'paw-print';
  const renderRow = (row, rowKey, borderTop) => {
    const label = row.label || row.section;
    const isNA = row.price === '–' || row.price === '-';
    const tipOpen = openTooltip === rowKey;
    const pColor = isNA ? LL.text3 : row.price.startsWith('-') && !row.price.startsWith('-¥') ? GGREEN : LL.text;
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: rowKey
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '9px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 10,
        borderTop: borderTop ? `1px solid ${LL.border}` : 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        color: isNA ? LL.text3 : LL.text2
      }
    }, label), row.info && /*#__PURE__*/React.createElement("button", {
      onClick: () => toggleTip(rowKey),
      style: {
        width: 15,
        height: 15,
        borderRadius: '50%',
        border: `1px solid ${tipOpen ? LL.ink : LL.text3}`,
        background: tipOpen ? LL.ink : 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        flex: '0 0 auto'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 8.5,
        fontWeight: 700,
        color: tipOpen ? '#fff' : LL.text3,
        lineHeight: 1
      }
    }, "i"))), row.sub && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: LL.text3,
        marginTop: 2,
        lineHeight: 1.4,
        textWrap: 'pretty'
      }
    }, row.sub)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: isNA ? 400 : 600,
        color: pColor,
        fontVariantNumeric: 'tabular-nums',
        flex: '0 0 auto',
        whiteSpace: 'nowrap'
      }
    }, row.price)), tipOpen && row.info && /*#__PURE__*/React.createElement("div", {
      style: {
        margin: '0 16px 8px',
        padding: '8px 12px',
        background: '#F0F0F8',
        borderRadius: 8,
        fontSize: 12,
        color: LL.text2,
        lineHeight: 1.55
      }
    }, row.info));
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '10px 16px 0',
      background: '#fff',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 38,
      borderRadius: 10,
      background: SVC_BG_MAP[svc.id] || LL.lavender,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${SVC_ICON_MAP[svc.id]}`,
    style: {
      fontSize: 20,
      color: LL.text
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, svc.id), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3
    }
  }, svc.sub))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 12px',
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, tabs.map(t => {
    const on = t.type === activeType;
    return /*#__PURE__*/React.createElement("button", {
      key: t.type,
      onClick: () => setActiveType(t.type),
      style: {
        height: 28,
        padding: '0 11px',
        borderRadius: 999,
        border: `1.5px solid ${on ? LL.ink : LL.border}`,
        background: on ? LL.ink : 'transparent',
        color: on ? '#fff' : LL.text2,
        fontSize: 12,
        fontWeight: on ? 600 : 500,
        cursor: 'pointer',
        fontFamily: LL.font,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        transition: 'all 120ms ease'
      }
    }, PET_ICON_MAP2[t.type] && /*#__PURE__*/React.createElement("i", {
      className: `ph ph-${PET_ICON_MAP2[t.type]}`,
      style: {
        fontSize: 12
      }
    }), t.label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px 12px',
      borderTop: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color: LL.text3,
      letterSpacing: '0.03em',
      marginBottom: 10
    }
  }, "\u57FA\u7840\u8D39\u7528"), tab.baseInfo && openTooltip === 'baseinfo' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10,
      padding: '9px 12px',
      background: '#F0F0F8',
      borderRadius: 8,
      fontSize: 12,
      color: LL.text2,
      lineHeight: 1.6,
      textWrap: 'pretty'
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: LL.text
    }
  }, tab.label, "\u670D\u52A1\u5185\u5BB9\u3000"), tab.baseInfo), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8
    }
  }, tab.weights.map((w, i) => {
    const DOG_IMGS = {
      '小型': window.__resources && window.__resources.dogSmall || './assets/dog-small.png',
      '中型': window.__resources && window.__resources.dogMedium || './assets/dog-medium.png',
      '大型': window.__resources && window.__resources.dogLarge || './assets/dog-large.png'
    };
    const dogImg = tab.type === 'dog' ? DOG_IMGS[w.size] : null;
    const cardKey = w.info ? `base-${i}` : tab.baseInfo ? 'baseinfo' : null;
    const clickable = !!cardKey;
    const tipOpen = clickable && openTooltip === cardKey;
    const hasDigit = /\d/.test(w.range);
    const InfoDot = clickable ? /*#__PURE__*/React.createElement("span", {
      style: {
        width: 14,
        height: 14,
        borderRadius: '50%',
        border: `1px solid ${tipOpen ? LL.ink : LL.text3}`,
        background: tipOpen ? LL.ink : 'transparent',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 8,
        fontWeight: 700,
        color: tipOpen ? '#fff' : LL.text3,
        lineHeight: 1
      }
    }, "i")) : null;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      onClick: clickable ? () => toggleTip(cardKey) : undefined,
      role: clickable ? 'button' : undefined,
      style: {
        background: bg,
        borderRadius: 10,
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 6,
        cursor: clickable ? 'pointer' : 'default',
        outline: tipOpen ? `1.5px solid ${LL.ink}` : '1.5px solid transparent',
        outlineOffset: '-1px',
        transition: 'outline-color 120ms ease'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0
      }
    }, w.tier ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 700,
        color: LL.text
      }
    }, w.tier), InfoDot), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: LL.text3,
        marginTop: 1,
        fontVariantNumeric: 'tabular-nums'
      }
    }, w.range)) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13.5,
        fontWeight: 700,
        color: LL.text,
        fontVariantNumeric: 'tabular-nums'
      }
    }, w.range.replace(' 公斤', '').replace('公斤', '')), InfoDot), hasDigit && /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 10.5,
        color: LL.text3
      }
    }, "\u516C\u65A4")), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: 800,
        color: LL.text,
        fontVariantNumeric: 'tabular-nums'
      }
    }, "\xA5", w.price), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        color: LL.text3
      }
    }, "/", svc.unit))), dogImg ? /*#__PURE__*/React.createElement("img", {
      src: dogImg,
      alt: w.size,
      style: {
        width: 48,
        height: 48,
        borderRadius: 8,
        objectFit: 'contain',
        display: 'block'
      }
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        width: 48,
        height: 48
      }
    }));
  })), tab.weights.map((w, i) => {
    const baseKey = `base-${i}`;
    if (openTooltip !== baseKey || !w.info) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: `btip-${i}`,
      style: {
        marginTop: 8,
        padding: '9px 12px',
        background: '#F0F0F8',
        borderRadius: 8,
        fontSize: 12,
        color: LL.text2,
        lineHeight: 1.6,
        textWrap: 'pretty'
      }
    }, /*#__PURE__*/React.createElement("strong", {
      style: {
        color: LL.text
      }
    }, w.tier, "\u670D\u52A1\u5185\u5BB9\u3000"), w.info);
  })), rows.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 2px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: LL.text
    }
  }, "\u989D\u5916\u8D39\u7528")), rows.map((row, i) => renderRow(row, `r-${i}`, true))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 12
    }
  }));
}
function ServicesTab({
  g
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.bg,
      paddingBottom: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '12px 16px 4px',
      padding: '10px 14px',
      borderRadius: 8,
      background: '#F0F7FF',
      border: '1px solid #D0E6F8'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text2,
      lineHeight: 1.55
    }
  }, "\u4EE5\u4E0B\u4EF7\u683C\u9002\u7528\u4E8E ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: LL.text
    }
  }, "1 \u53EA\u5BA0\u7269"), "\uFF0C\u4E3A\u5B88\u62A4\u8005\u5B9E\u9645\u6536\u8D39\uFF0C\u65E0\u989D\u5916\u5E73\u53F0\u670D\u52A1\u8D39\u3002")), g.services.map(svc => {
    if (PRICING_SVC_TYPES.includes(svc.id) && svc.petPricingTabs?.length) {
      return /*#__PURE__*/React.createElement(PricingServiceCard, {
        key: svc.id,
        svc: svc
      });
    }
    return /*#__PURE__*/React.createElement("div", {
      key: svc.id,
      style: {
        margin: '10px 16px 0',
        background: '#fff',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px 16px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 38,
        height: 38,
        borderRadius: 10,
        background: SVC_BG_MAP[svc.id] || LL.lavender,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: '0 0 auto'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `ph ph-${SVC_ICON_MAP[svc.id]}`,
      style: {
        fontSize: 20,
        color: LL.text
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15,
        fontWeight: 700,
        color: LL.text
      }
    }, svc.id), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        color: LL.text3,
        marginTop: 2
      }
    }, svc.sub)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'right',
        flex: '0 0 auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 20,
        fontWeight: 800,
        color: LL.text,
        fontVariantNumeric: 'tabular-nums'
      }
    }, "\xA5", svc.price), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: LL.text3
      }
    }, "\u6BCF", svc.unit))), svc.extras && svc.extras.map((ex, ei) => /*#__PURE__*/React.createElement("div", {
      key: ei,
      style: {
        padding: '7px 16px 7px 66px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: `1px solid ${LL.border}`
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: LL.text2
      }
    }, ex.label), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'right'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        fontWeight: 700,
        color: LL.text,
        fontVariantNumeric: 'tabular-nums'
      }
    }, typeof ex.price === 'number' ? `¥${ex.price}` : ex.price), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: LL.text3
      }
    }, "\u6BCF", ex.unit)))));
  }));
}

// ─── Main ─────────────────────────────────────────────────────
function GuardianProfileScreen({
  guardian = CHEN_YI_DATA,
  onBack,
  initialService
}) {
  const [tab, setTab] = React.useState('info');
  const [liked, setLiked] = React.useState(false);
  const [allReviews, setAllReviews] = React.useState(false);
  const scrollRef = React.useRef(null);
  const tabScrollPos = React.useRef({});
  const handleTabChange = newTab => {
    if (scrollRef?.current) {
      tabScrollPos.current[tab] = scrollRef.current.scrollTop;
    }
    setTab(newTab);
    requestAnimationFrame(() => {
      if (!scrollRef?.current) return;
      const pos = newTab === 'services' ? 0 : tabScrollPos.current[newTab] ?? 0;
      scrollRef.current.scrollTop = pos;
    });
  };
  const NavBar = ({
    onBack: back,
    title
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      height: 52,
      background: '#fff',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: back,
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      border: 0,
      background: LL.bg,
      color: LL.text,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 17
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34
    }
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      overflow: 'hidden',
      background: LL.surface,
      fontFamily: LL.font
    }
  }, allReviews ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(NavBar, {
    onBack: () => setAllReviews(false),
    title: "\u7528\u6237\u8BC4\u4EF7"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(ReviewsTab, {
    g: guardian
  }))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(NavBar, {
    onBack: onBack,
    title: "\u5B88\u62A4\u8005\u4E3B\u9875"
  }), /*#__PURE__*/React.createElement("div", {
    ref: scrollRef,
    style: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(ProfileHero, {
    g: guardian,
    liked: liked,
    onLike: () => setLiked(l => !l)
  }), /*#__PURE__*/React.createElement(TabNav, {
    active: tab,
    onChange: handleTabChange
  }), tab === 'info' && /*#__PURE__*/React.createElement(InfoTab, {
    g: guardian,
    onViewServices: () => handleTabChange('services'),
    onViewAllReviews: () => setAllReviews(true),
    defaultService: initialService
  }), tab === 'services' && /*#__PURE__*/React.createElement(ServicesTab, {
    g: guardian
  }))));
}
Object.assign(window, {
  GuardianProfileScreen,
  CHEN_YI_DATA,
  ZHE_DATA,
  GuardianCalendar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/GuardianProfileScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/HomeMarketplaceScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Lou Lou — Home (Guardian marketplace) — v4
// Round-3 review changes:
//   · 顶部固定 logo + slogan：Loulou 噜噜 / 让每一次分离都安心
//   · 快捷入口 + 搜索卡片合并：5 个服务图标变成单选入口，
//     选中实色，未选中 50% 透明，下方小字显示服务描述
//   · 服务类型字段从搜索卡片中移除（已整合到图标）
//   · 搜索区下方新增「常用守护者」横排头像
//   · Banner 移到常用守护者下面
//   · 宠物类型选项：猫 / 狗 / 兔子 / 鼠鼠 / 鸟

function HomeMarketplaceScreen({
  onSearch,
  onPickService,
  onPickField,
  onOpenGuide
}) {
  const [bannerIdx, setBannerIdx] = React.useState(0);
  const [petType, setPetType] = React.useState({
    label: '狗'
  });
  const [svcType, setSvcType] = React.useState('遛狗');
  const [address, setAddress] = React.useState({
    label: '朝阳区'
  });
  // 默认日期：明天
  const _tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  const _end3 = (() => {
    const d = new Date(_tomorrow);
    d.setDate(d.getDate() + 2);
    return d;
  })();
  const [dateRange, setDateRange] = React.useState({
    start: _tomorrow,
    end: null
  });
  const [schedule, setSchedule] = React.useState({
    ...defaultSchedule(),
    dates: {
      start: _tomorrow,
      end: _end3,
      days: [_tomorrow]
    },
    periods: ['morning']
  });
  const [picker, setPicker] = React.useState(null); // 'petType' | 'dateA' | 'dateB' | null

  const PET_OPTIONS = ['猫', '狗', '兔子', '鼠鼠', '鸟'];

  // 5 service entries with icons + hints — labels match SERVICE_GROUPS
  const services = [{
    id: '寄养',
    icon: 'house',
    hint: '24小时照护',
    bg: LL.butter
  }, {
    id: '日托',
    icon: 'sun',
    hint: '白天看护，当天接送',
    bg: LL.peach
  }, {
    id: '遛狗',
    icon: 'sneaker',
    hint: '至少30分钟',
    bg: LL.mint
  }, {
    id: '上门喂养',
    icon: 'hand-waving',
    hint: '查看、喂食、换水、铲屎等至少30分钟',
    bg: LL.lavender
  }, {
    id: '伴宠留宿',
    icon: 'moon-stars',
    hint: '守护者上门陪伴/过夜',
    bg: '#CDE4EE'
  }];
  const selectedSvc = services.find(s => s.id === svcType) || services[0];

  // Which date form for the chosen service
  const dateForm = SERVICE_FORM[svcType] || 'A';
  const openDatePicker = () => setPicker(dateForm === 'B' ? 'dateB' : 'dateA');

  // Friendly summary line for the date row
  const dateSummary = summarizeQuery({
    svcType,
    dateRange,
    schedule
  });
  const handleSearch = () => {
    onSearch?.({
      petType: petType?.label,
      svcType,
      address: address?.label,
      dateRange,
      schedule
    });
  };
  const banners = [{
    tag: '新手必看',
    title: 'Lou Lou 全流程指引',
    sub: '从注册到完成订单，一步看懂',
    bg: '#FEE7A6',
    emoji: '🐾',
    action: 'guide'
  }, {
    tag: '新人专享',
    title: '首单立减 ¥20',
    sub: '注册即得专属优惠券',
    bg: LL.peach,
    emoji: '🎉'
  }, {
    tag: '成为守护者',
    title: '陪伴萌宠 · 赚取收入',
    sub: '认证通过即可接单',
    bg: LL.lavender,
    emoji: '🐾'
  }, {
    tag: '邀请有礼',
    title: '邀好友得 ¥30 券',
    sub: '双方均可领取',
    bg: LL.mint,
    emoji: '🎁'
  }];
  const b = banners[bannerIdx];

  // Auto-advance the banner carousel every 3 seconds
  React.useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 3000);
    return () => clearInterval(t);
  }, [banners.length]);

  // 常用守护者 — 3 个，使用实拍头像
  const _g1 = window.__resources && window.__resources.guardian1 || './assets/guardian1.png';
  const _g2 = window.__resources && window.__resources.guardian2 || './assets/guardian2.png';
  const _g3 = window.__resources && window.__resources.guardian3 || './assets/guardian3.png';
  const recents = [{
    id: 'r1',
    name: '林若',
    photo: _g1,
    served: true
  }, {
    id: 'r2',
    name: '陈逸',
    photo: _g2,
    served: true
  }, {
    id: 'r3',
    name: '桃子',
    photo: _g3
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 44,
      background: LL.bg,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(BrandHeader, null), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '4px 16px 0',
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px 4px',
      fontSize: 12,
      fontWeight: 600,
      color: LL.text2,
      letterSpacing: '0.02em'
    }
  }, "\u9009\u62E9\u670D\u52A1"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 4px 10px',
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)'
    }
  }, services.map(s => /*#__PURE__*/React.createElement(ServiceIconTile, _extends({
    key: s.id
  }, s, {
    selected: s.id === svcType,
    onClick: () => setSvcType(s.id)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 12px',
      textAlign: 'center',
      fontSize: 11.5,
      color: LL.text2,
      lineHeight: 1.4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: LL.text
    }
  }, selectedSvc.id), /*#__PURE__*/React.createElement("span", {
    style: {
      margin: '0 6px',
      color: LL.text3
    }
  }, "\xB7"), selectedSvc.hint), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: LL.border,
      margin: '0 14px'
    }
  }), /*#__PURE__*/React.createElement(SearchRow, {
    icon: "paw-print",
    label: "\u5BA0\u7269\u7C7B\u578B",
    value: petType.label,
    onClick: () => setPicker('petType')
  }), /*#__PURE__*/React.createElement(SearchRow, {
    icon: "map-pin",
    label: "\u5730\u5740",
    value: address.label,
    onClick: () => onPickField?.('address')
  }), /*#__PURE__*/React.createElement(SearchRow, {
    icon: "calendar-blank",
    label: dateForm === 'B' ? '日期与时段' : '日期',
    value: dateSummary || '选择日期',
    hint: !dateSummary,
    onClick: openDatePicker
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px 16px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: handleSearch,
    style: {
      width: '100%',
      height: 46,
      borderRadius: 999,
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 15,
      fontWeight: 600,
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-magnifying-glass",
    style: {
      fontSize: 18
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      letterSpacing: '0.32em',
      textIndent: '0.32em'
    }
  }, "\u641C\u7D22\u5B88\u62A4\u8005")))), /*#__PURE__*/React.createElement(RecentGuardians, {
    items: recents,
    onPick: g => onPickService?.(g.id)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '24px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      borderRadius: 16,
      padding: '16px 16px 34px',
      minHeight: 132,
      background: b.bg,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      cursor: b.action ? 'pointer' : 'default'
    },
    onClick: () => b.action === 'guide' && onOpenGuide?.()
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignSelf: 'flex-start',
      padding: '3px 9px',
      background: 'rgba(255,255,255,0.55)',
      borderRadius: 999,
      fontSize: 10.5,
      fontWeight: 600,
      color: LL.text
    }
  }, b.tag), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.01em'
    }
  }, b.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: 'rgba(30,30,36,0.62)',
      marginTop: 2
    }
  }, b.sub)), b.action === 'guide' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 14,
      bottom: 32,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      background: LL.ink,
      color: '#fff',
      borderRadius: 999,
      padding: '5px 12px',
      fontSize: 11.5,
      fontWeight: 700
    }
  }, "\u67E5\u770B\u6307\u5F15 ", /*#__PURE__*/React.createElement("i", {
    className: "ph ph-arrow-right",
    style: {
      fontSize: 11
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: -6,
      top: -10,
      fontSize: 88,
      lineHeight: 1,
      opacity: 0.85
    }
  }, b.emoji), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 12,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 5
    }
  }, banners.map((_, i) => /*#__PURE__*/React.createElement("button", {
    key: i,
    onClick: e => {
      e.stopPropagation();
      setBannerIdx(i);
    },
    style: {
      width: i === bannerIdx ? 14 : 5,
      height: 5,
      borderRadius: 3,
      background: i === bannerIdx ? LL.ink : 'rgba(34,40,44,0.25)',
      border: 0,
      cursor: 'pointer',
      padding: 0,
      transition: 'width 200ms ease'
    }
  }))))), /*#__PURE__*/React.createElement(DateRangePickerSheet, {
    open: picker === 'dateA',
    svcType: svcType,
    value: dateRange,
    onConfirm: d => {
      setDateRange(d);
      setPicker(null);
    },
    onClose: () => setPicker(null)
  }), /*#__PURE__*/React.createElement(SchedulePickerSheet, {
    open: picker === 'dateB',
    svcType: svcType,
    value: schedule,
    onSearch: s => {
      setSchedule(s);
      setPicker(null);
      onSearch?.({
        petType: petType?.label,
        svcType,
        address: address?.label,
        dateRange,
        schedule: s
      });
    },
    onClose: () => setPicker(null)
  }), /*#__PURE__*/React.createElement(FieldPickerSheet, {
    open: picker === 'petType',
    title: "\u9009\u62E9\u5BA0\u7269\u7C7B\u578B",
    options: PET_OPTIONS,
    value: petType.label,
    onPick: v => {
      setPetType({
        label: v
      });
      setPicker(null);
    },
    onClose: () => setPicker(null)
  }));
}

// ─── Brand header ─── city left, logo+slogan centred ───
function BrandHeader() {
  const logoUrl = typeof window !== 'undefined' && window.__resources && window.__resources.loulouLogo || './assets/loulou-logo.png';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 10px',
      background: LL.bg
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      padding: '5px 10px 5px 0',
      background: 'transparent',
      border: 0,
      color: LL.text,
      fontSize: 13,
      fontWeight: 500,
      fontFamily: LL.font,
      cursor: 'pointer',
      flex: '0 0 auto',
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-map-pin",
    style: {
      fontSize: 13,
      color: LL.text2
    }
  }), "\u5317\u4EAC", /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-down",
    style: {
      fontSize: 11,
      color: LL.text3
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: logoUrl,
    alt: "Loulou \u565C\u565C",
    style: {
      height: 34,
      width: 'auto',
      display: 'block'
    },
    onError: e => {
      const span = document.createElement('span');
      span.innerText = 'Loulou 噜噜';
      span.style.cssText = 'font-family:"Brush Script MT",cursive;font-size:26px;font-weight:700;color:#1E1E24;';
      e.target.replaceWith(span);
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      fontWeight: 500,
      letterSpacing: '0.04em'
    }
  }, "\u8BA9\u6BCF\u4E00\u6B21\u5206\u79BB\u90FD\u5B89\u5FC3")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 64px'
    }
  })));
}

// ─── Service icon tile — single-select, dim when not selected ───
function ServiceIconTile({
  id,
  icon,
  bg,
  selected,
  onClick
}) {
  const [pressed, setPressed] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    onPointerDown: () => setPressed(true),
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    "aria-pressed": selected,
    style: {
      background: 'transparent',
      border: 0,
      padding: '4px 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      cursor: 'pointer',
      fontFamily: LL.font,
      transform: pressed ? 'scale(0.94)' : 'scale(1)',
      transition: 'transform 140ms ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 46,
      height: 46,
      borderRadius: '50%',
      background: bg,
      color: LL.text,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: selected ? 1 : 0.5,
      transition: 'opacity 160ms ease'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${icon}`,
    style: {
      fontSize: 22
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text,
      fontWeight: selected ? 700 : 500,
      lineHeight: 1.2,
      whiteSpace: 'nowrap'
    }
  }, id));
}

// ─── Recent guardians — horizontal scrollable row ───
function RecentGuardians({
  items,
  onPick
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      padding: '0 16px 8px',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.01em'
    }
  }, "\u6536\u85CF\u7684\u5B88\u62A4\u8005"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3
    }
  }, "\u968F\u65F6\u518D\u6B21\u9884\u7EA6"), /*#__PURE__*/React.createElement("button", {
    style: {
      marginLeft: 'auto',
      background: 'transparent',
      border: 0,
      fontSize: 11.5,
      color: LL.text2,
      fontFamily: LL.font,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2
    }
  }, "\u5168\u90E8 ", /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 10
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 22,
      overflowX: 'auto',
      overflowY: 'hidden',
      padding: '4px 16px 6px',
      scrollbarWidth: 'none',
      WebkitOverflowScrolling: 'touch'
    }
  }, items.map(g => /*#__PURE__*/React.createElement("button", {
    key: g.id,
    onClick: () => onPick?.(g),
    style: {
      flex: '0 0 auto',
      background: 'transparent',
      border: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, g.photo ? /*#__PURE__*/React.createElement("img", {
    src: g.photo,
    alt: g.name,
    style: {
      width: 52,
      height: 52,
      borderRadius: '50%',
      objectFit: 'cover',
      objectPosition: 'top center',
      display: 'block'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      borderRadius: '50%',
      background: g.bg || '#D9D9D9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      fontWeight: 600,
      color: 'rgba(30,30,36,0.35)'
    }
  }, g.name[0]), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: LL.text2,
      fontWeight: 500,
      maxWidth: 60,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textAlign: 'center'
    }
  }, g.name), g.served ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9.5,
      fontWeight: 600,
      color: '#2C7A4B',
      lineHeight: 1,
      marginTop: -1
    }
  }, "\u670D\u52A1\u8FC7") : /*#__PURE__*/React.createElement("div", {
    style: {
      height: 9.5,
      marginTop: -1
    }
  })))));
}

// ─── Search card row (label · value · chevron) ──────────────
function SearchRow({
  icon,
  label,
  value,
  hint = false,
  onClick,
  isLast = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      width: '100%',
      padding: '14px 14px',
      background: 'transparent',
      border: 0,
      borderBottom: isLast ? '0' : `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 8,
      background: 'rgba(34,40,44,0.04)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: LL.text,
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${icon}`,
    style: {
      fontSize: 15
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text2,
      fontWeight: 500,
      minWidth: 60,
      textAlign: 'left'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'right',
      fontSize: 14,
      fontWeight: hint ? 400 : 600,
      color: hint ? LL.text3 : LL.text
    }
  }, value), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 13,
      color: LL.text3
    }
  }));
}

// ─── Guardian row — preserved for search-results screen ───
function GuardianRow({
  g,
  isLast,
  onClick
}) {
  const available = g.status === '有空';
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      padding: '14px 14px',
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start',
      cursor: 'pointer',
      position: 'relative',
      borderBottom: isLast ? '0' : `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      borderRadius: '50%',
      background: g.bg,
      flex: '0 0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.01em'
    }
  }, g.initial), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      paddingRight: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 700,
      color: LL.text
    }
  }, g.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2,
      fontSize: 12,
      color: LL.text,
      fontVariantNumeric: 'tabular-nums'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-star",
    style: {
      fontSize: 12,
      color: '#F0B100'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, g.rating.toFixed(1))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2,
      background: '#E6F1EC',
      color: '#2C7A4B',
      borderRadius: 4,
      padding: '1px 5px',
      fontSize: 10.5,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-seal-check",
    style: {
      fontSize: 12
    }
  }), " \u8BA4\u8BC1"), g.reused && /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.butter,
      color: LL.text,
      borderRadius: 4,
      padding: '1px 6px',
      fontSize: 10.5,
      fontWeight: 600
    }
  }, "\u518D\u6B21\u9884\u7EA6")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      display: 'flex',
      gap: 4,
      alignItems: 'center',
      fontSize: 11.5,
      color: LL.text2
    }
  }, g.services.map((s, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: s
  }, i > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text3
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, s))), /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text3,
      marginLeft: 4
    }
  }, "\xB7 ", g.city)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 5,
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      fontSize: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text2
    }
  }, g.dist), /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text3
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15.5,
      fontWeight: 700,
      color: LL.text,
      fontVariantNumeric: 'tabular-nums'
    }
  }, "\xA5", g.price), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: LL.text2,
      marginLeft: 2
    }
  }, "/", g.unit, "\u8D77")), /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text2,
      marginLeft: 'auto'
    }
  }, "\u5DF2\u670D\u52A1 ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: LL.text
    }
  }, g.orders), " \u5355"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      alignSelf: 'stretch',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 10.5,
      fontWeight: 600,
      padding: '3px 8px',
      borderRadius: 999,
      background: available ? '#E6F1EC' : '#F0F0F5',
      color: available ? '#2C7A4B' : LL.text2
    }
  }, g.status), /*#__PURE__*/React.createElement("button", {
    onClick: e => e.stopPropagation(),
    disabled: !available,
    style: {
      height: 28,
      padding: '0 13px',
      borderRadius: 999,
      border: 0,
      background: available ? LL.ink : LL.inkDisabled,
      color: '#fff',
      fontSize: 12,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: available ? 'pointer' : 'not-allowed'
    }
  }, "\u9884\u7EA6")));
}

// ─── small icon button ──────────────────────────────────────
function IconBtn({
  name
}) {
  return /*#__PURE__*/React.createElement("button", {
    style: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      border: 0,
      background: 'rgba(34,40,44,0.06)',
      color: LL.text,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${name}`,
    style: {
      fontSize: 18
    }
  }));
}

// ─── Bottom-anchored field picker sheet ─────────────────────
function FieldPickerSheet({
  open,
  title,
  options,
  value,
  onPick,
  onClose
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.35)',
      zIndex: 85
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 86,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: '14px 0 28px',
      boxShadow: '0 -8px 24px rgba(0,0,0,0.10)',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '0 auto 10px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '4px 14px 12px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      marginLeft: 'auto',
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: '#F0F0F5',
      color: LL.text,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x",
    style: {
      fontSize: 13
    }
  }))), options.map((o, i) => {
    const on = o === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      onClick: () => onPick(o),
      style: {
        width: '100%',
        padding: '14px 18px',
        background: 'transparent',
        border: 0,
        cursor: 'pointer',
        fontFamily: LL.font,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: 15,
        fontWeight: on ? 700 : 500,
        color: LL.text,
        borderTop: i === 0 ? `1px solid ${LL.border}` : '0',
        borderBottom: `1px solid ${LL.border}`
      }
    }, /*#__PURE__*/React.createElement("span", null, o), on && /*#__PURE__*/React.createElement("i", {
      className: "ph-fill ph-check-circle",
      style: {
        fontSize: 18,
        color: LL.ink
      }
    }));
  })));
}

// ─── Full-flow guide page (流程指引) ──────────────────────────
const GUIDE_STEPS = [{
  icon: 'identification-card',
  title: '注册 · 完善宠物资料',
  desc: '微信一键登录，填写宠物的品种、健康、性格与喂养习惯。资料越完整，守护者照护越贴心。',
  perk: '一次填写，长期复用'
}, {
  icon: 'shield-check',
  title: '挑选放心的守护者',
  desc: '按服务、距离、评分自由筛选。每位守护者都经过实名认证、资质证书与背景的严格审核。',
  perk: '守护者严格筛选 · 认证可查'
}, {
  icon: 'chat-circle-dots',
  title: '发起预约 · 线上沟通',
  desc: '可同时联系多位守护者，先聊天、约线下见面熟悉，再决定把宝贝托付给谁。',
  perk: '先沟通见面，零压力'
}, {
  icon: 'credit-card',
  title: '确认订单 · 平台担保付款',
  desc: '守护者确认后订单才正式生效。款项由平台担保，若 24 小时内未确认，全额原路退回。',
  perk: '平台担保 · 24h 未确认全退'
}, {
  icon: 'camera',
  title: '服务进行中 · 实时同步',
  desc: '遛狗路线、喂食、互动照片与视频实时同步，宝贝的每一刻你都看得见。',
  perk: '每日照片视频 · 安心可见'
}, {
  icon: 'arrow-counter-clockwise',
  title: '灵活退款保障',
  desc: '服务开始前一天 12:00 前可免费取消、全额退款；临时变动也按透明规则清晰结算。',
  perk: '灵活退款 · 规则透明'
}, {
  icon: 'star',
  title: '完成订单 · 评价与打赏',
  desc: '服务完成后可给守护者评价，满意还能直接打赏——打赏 100% 全额到守护者，平台不抽成。',
  perk: '全额打赏 · 平台 0 抽成'
}];
function ProcessGuideScreen({
  onClose,
  onStart
}) {
  const scrollRef = React.useRef(null);
  const N = GUIDE_STEPS.length;
  const STEP = 150;
  const [revealed, setRevealed] = React.useState(1); // how many cards are expanded
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setRevealed(r => Math.max(r, Math.min(N, 1 + Math.floor(el.scrollTop / STEP))));
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      zIndex: 80,
      background: LL.bg,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      height: 52,
      background: '#FEE7A6',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      background: 'transparent',
      border: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      padding: 0,
      color: LL.text,
      fontSize: 13.5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 16
    }
  }), " \u8FD4\u56DE"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u6D41\u7A0B\u6307\u5F15"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48
    }
  })), /*#__PURE__*/React.createElement("div", {
    ref: scrollRef,
    onScroll: onScroll,
    style: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FEE7A6',
      padding: '8px 22px 30px',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: -18,
      top: -14,
      fontSize: 120,
      lineHeight: 1,
      opacity: 0.5
    }
  }, "\uD83D\uDC3E"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      color: LL.text,
      letterSpacing: '-0.01em',
      marginBottom: 8,
      lineHeight: 1.25
    }
  }, "\u628A\u5B9D\u8D1D\u653E\u5FC3", /*#__PURE__*/React.createElement("br", null), "\u4EA4\u7ED9 Lou Lou"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'rgba(34,40,44,0.66)',
      lineHeight: 1.6,
      marginBottom: 16,
      maxWidth: '80%'
    }
  }, "\u4ECE\u6CE8\u518C\u5230\u5B8C\u6210\u8BA2\u5355\uFF0C\u6BCF\u4E00\u6B65\u6211\u4EEC\u90FD\u4E3A\u4F60\u548C\u5B9D\u8D1D\u628A\u5173\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, ['守护者严格筛选', '灵活退款', '全额打赏 0 抽成'].map(t => /*#__PURE__*/React.createElement("span", {
    key: t,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: 'rgba(34,40,44,0.9)',
      color: '#FEE7A6',
      borderRadius: 999,
      padding: '5px 11px',
      fontSize: 11.5,
      fontWeight: 700
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-check-circle",
    style: {
      fontSize: 12
    }
  }), t))))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 18,
      background: '#FEE7A6'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 18,
      background: LL.bg,
      borderRadius: '18px 18px 0 0',
      marginTop: -18
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 16px 8px'
    }
  }, GUIDE_STEPS.map((s, i) => {
    const open = i < revealed;
    const depth = i - revealed; // 0 = next-up collapsed card
    const inset = Math.min(Math.max(depth, 0), 3) * 5;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      onClick: !open ? () => setRevealed(r => Math.max(r, i + 1)) : undefined,
      style: {
        background: '#fff',
        borderRadius: 18,
        boxShadow: open ? '0 4px 16px rgba(0,0,0,0.07)' : '0 -1px 4px rgba(0,0,0,0.05)',
        border: `1px solid ${open ? '#F2E2B0' : LL.border}`,
        overflow: 'hidden',
        height: open ? 'auto' : depth === 0 ? 'auto' : 16,
        marginTop: open ? 14 : depth === 0 ? 12 : -8,
        marginLeft: open ? 0 : inset,
        marginRight: open ? 0 : inset,
        opacity: 1,
        zIndex: 30 - i,
        position: 'relative',
        cursor: open ? 'default' : 'pointer',
        transition: 'margin 360ms cubic-bezier(0.2,0,0,1), height 360ms cubic-bezier(0.2,0,0,1), box-shadow 320ms'
      }
    }, (open || depth === 0) && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        padding: '16px 16px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 42,
        height: 42,
        borderRadius: '50%',
        flex: '0 0 auto',
        background: open ? '#FEE7A6' : '#F5F1E3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `ph ph-${s.icon}`,
      style: {
        fontSize: 21,
        color: open ? LL.text : LL.text2
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11.5,
        fontWeight: 800,
        color: LL.text3,
        fontVariantNumeric: 'tabular-nums',
        marginBottom: 1
      }
    }, "STEP 0", i + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 15.5,
        fontWeight: 700,
        color: open ? LL.text : LL.text2
      }
    }, s.title))), open && /*#__PURE__*/React.createElement("div", {
      style: {
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 16px 16px 71px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 13.5,
        color: LL.text2,
        lineHeight: 1.7,
        textWrap: 'pretty',
        marginBottom: 12
      }
    }, s.desc), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: '#E6F1EC',
        color: '#2C7A4B',
        borderRadius: 8,
        padding: '6px 11px',
        fontSize: 12,
        fontWeight: 700
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "ph-fill ph-seal-check",
      style: {
        fontSize: 13
      }
    }), s.perk))));
  })), revealed < N && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '2px 0 10px',
      fontSize: 12,
      color: LL.text3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5
    }
  }, "\u7EE7\u7EED\u4E0B\u6ED1\u6216\u70B9\u6309\u5361\u7247\u5C55\u5F00\u540E\u7EED\u6B65\u9AA4 ", /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-down",
    style: {
      fontSize: 12
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: Math.max(0, N - revealed) * STEP,
      transition: 'height 360ms cubic-bezier(0.2,0,0,1)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 16px 40px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onStart || onClose,
    style: {
      width: '100%',
      height: 52,
      borderRadius: 999,
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer',
      letterSpacing: '0.04em'
    }
  }, "\u5F00\u59CB\u627E\u5B88\u62A4\u8005"))));
}
Object.assign(window, {
  HomeMarketplaceScreen,
  GuardianRow,
  IconBtn,
  ProcessGuideScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/HomeMarketplaceScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/HomeScreen.jsx
try { (() => {
// Lou Lou — Home screen

const HOME_SERVICE_ITEMS = [{
  id: '寄养',
  icon: 'house',
  bg: '#FEE7A6'
}, {
  id: '日托',
  icon: 'sun',
  bg: '#FBD3C4'
}, {
  id: '遛狗',
  icon: 'sneaker',
  bg: '#C7E8D8'
}, {
  id: '上门喂养',
  icon: 'hand-waving',
  bg: '#D8CAE8'
}, {
  id: '伴宠留宿',
  icon: 'moon-stars',
  bg: '#E8E3F4'
}];
function ServiceTypeRow() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      display: 'flex',
      gap: 10,
      overflowX: 'auto',
      scrollbarWidth: 'none'
    }
  }, HOME_SERVICE_ITEMS.map(svc => /*#__PURE__*/React.createElement("button", {
    key: svc.id,
    style: {
      flex: '0 0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      background: 'transparent',
      border: 0,
      cursor: 'pointer',
      padding: '4px 2px',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      borderRadius: 16,
      background: svc.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${svc.icon}`,
    style: {
      fontSize: 24,
      color: LL.text
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      fontWeight: 500,
      color: LL.text2,
      whiteSpace: 'nowrap'
    }
  }, svc.id))));
}
function HomeScreen({
  onOpenPet
}) {
  const [cat, setCat] = React.useState('All');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 0'
    }
  }, /*#__PURE__*/React.createElement(HeroPill, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 16px 8px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 26,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.01em',
      lineHeight: 1.2
    }
  }, "Pamper Your Pet,", /*#__PURE__*/React.createElement("br", null), "Every Day"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text2,
      marginTop: 8,
      lineHeight: 1.5,
      padding: '0 12px'
    }
  }, "Book expert grooming services or", /*#__PURE__*/React.createElement("br", null), "track your pet's daily activity.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 0 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 10px',
      fontSize: 13,
      fontWeight: 600,
      color: LL.text2,
      letterSpacing: '0.02em'
    }
  }, "\u9009\u62E9\u670D\u52A1"), /*#__PURE__*/React.createElement(ServiceTypeRow, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 0 0'
    }
  }, /*#__PURE__*/React.createElement(CategoryChips, {
    items: ['All', 'Dog', 'Cat', 'Birds', 'Fish'],
    active: cat,
    onChange: setCat
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 16px 0',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(PetStageCard, {
    title: "Premium Grooming",
    sub: "Expert styling & hygiene care",
    bg: LL.butter,
    emoji: "\uD83D\uDC36",
    onClick: () => onOpenPet('grooming')
  }), /*#__PURE__*/React.createElement(PetStageCard, {
    title: "Daily Walks",
    sub: "Tracked routes & milestones",
    bg: LL.lavender,
    emoji: "\uD83D\uDC31",
    offset: -22,
    onClick: () => onOpenPet('walks')
  })));
}
window.HomeScreen = HomeScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/MessagesScreen.jsx
try { (() => {
// Lou Lou — MessagesScreen.jsx (updated)
// Thread list — accepted sent-apps appear as live guardian threads
const APP_GREEN = '#2C7A4B';
function MessagesScreen({
  sentApps = [],
  onOpenChat
}) {
  // Build guardian threads — one per ORDER (so multiple orders with the
  // same guardian each get their own chat window)
  const guardianThreads = sentApps.filter(a => ['accepted', 'in_progress', 'completed'].includes(a.status)).map(a => {
    const lastMsg = a.messages[a.messages.length - 1];
    const dateLabel = a.dateEnd && a.dateEnd !== a.dateStart ? `${a.dateStart}–${a.dateEnd}` : a.dateStart;
    return {
      id: a.id,
      name: a.guardian.name,
      orderTag: `${a.service} · ${dateLabel}`,
      done: a.status === 'completed',
      last: lastMsg ? lastMsg.text : '',
      time: a.status === 'completed' ? '已完成' : '刚刚',
      unread: a.status === 'completed' ? 0 : a.messages.filter(m => m.from === 'guardian').length,
      photo: a.guardian.photo,
      isLive: true,
      appId: a.id
    };
  });

  // Static placeholder threads
  const staticThreads = [{
    id: 's1',
    name: '张敏',
    last: '宝贝已经睡了，今天玩得很开心 🐶',
    time: '昨天',
    unread: 0,
    initial: '张',
    bg: LL.butter
  }, {
    id: 's2',
    name: '李伟',
    last: '好的，明天上午十点见。',
    time: '2天前',
    unread: 0,
    initial: '李',
    bg: LL.lavender
  }, {
    id: 's3',
    name: 'Loulou 平台',
    last: '您的订单已确认，编号 LL-23981',
    time: '上周',
    unread: 0,
    initial: '官',
    bg: LL.ink,
    white: true
  }, {
    id: 's4',
    name: '王芳',
    last: '收到，周五下午见～',
    time: '上周',
    unread: 0,
    initial: '王',
    bg: LL.mint
  }];
  const threads = [...guardianThreads, ...staticThreads];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 24,
      background: LL.bg,
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      boxShadow: '0 1px 0 rgba(0,0,0,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 52,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.01em'
    }
  }, "\u6D88\u606F"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      flex: '0 0 auto'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'flex-end',
      padding: '0 12px 10px',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      border: 0,
      background: 'rgba(34,40,44,0.06)',
      color: LL.text,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-magnifying-glass",
    style: {
      fontSize: 18
    }
  })), /*#__PURE__*/React.createElement("button", {
    style: {
      width: 36,
      height: 36,
      borderRadius: '50%',
      border: 0,
      background: 'rgba(34,40,44,0.06)',
      color: LL.text,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-headset",
    style: {
      fontSize: 18
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 16px 0',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, threads.map(t => {
    const live = t.isLive;
    const photoSrc = live ? window.__resources && window.__resources.guardian2 || t.photo : null;
    return /*#__PURE__*/React.createElement("div", {
      key: t.id,
      onClick: () => live && onOpenChat?.(t.appId),
      style: {
        background: LL.surface,
        borderRadius: 14,
        padding: '12px 14px',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
        cursor: live ? 'pointer' : 'default',
        position: 'relative'
      }
    }, live ? /*#__PURE__*/React.createElement("div", {
      style: {
        width: 48,
        height: 48,
        borderRadius: '50%',
        overflow: 'hidden',
        flex: '0 0 auto',
        background: LL.lavender
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: photoSrc,
      style: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        objectPosition: 'top center'
      }
    })) : /*#__PURE__*/React.createElement("div", {
      style: {
        width: 48,
        height: 48,
        borderRadius: '50%',
        flex: '0 0 auto',
        background: t.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 700,
        color: t.white ? '#fff' : LL.text
      }
    }, t.initial), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 3
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 14,
        fontWeight: t.unread > 0 ? 700 : 600,
        color: LL.text,
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }
    }, t.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 11,
        color: LL.text3,
        flex: '0 0 auto',
        marginLeft: 8
      }
    }, t.time)), t.orderTag && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
        background: t.done ? '#F0F0F5' : '#EAF3EE',
        borderRadius: 6,
        padding: '1px 7px'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: "ph ph-clipboard-text",
      style: {
        fontSize: 11,
        color: t.done ? LL.text3 : APP_GREEN
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        fontWeight: 600,
        color: t.done ? LL.text3 : APP_GREEN
      }
    }, t.orderTag)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 12.5,
        color: t.unread > 0 ? LL.text2 : LL.text3,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontWeight: t.unread > 0 ? 500 : 400
      }
    }, t.last)), t.unread > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 18,
        height: 18,
        padding: '0 5px',
        borderRadius: 9,
        background: '#E63946',
        color: '#fff',
        fontSize: 10.5,
        fontWeight: 700,
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, t.unread), live && !t.done && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 12,
        left: 52,
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: APP_GREEN,
        border: '2px solid #fff'
      }
    }));
  })));
}
window.MessagesScreen = MessagesScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/MessagesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/PetsScreen.jsx
try { (() => {
// Lou Lou — PetsScreen.jsx
// 我的宠物：卡片展示 + 添加/编辑表单（6 个区块）

const PETS_GREEN = '#2C7A4B';
const PETS_GREEN_BG = '#E6F1EC';
const VACCINES_OPTIONS = {
  dog: ['狂犬疫苗', '犬六联', '犬窝咳'],
  cat: ['猫三联', '狂犬疫苗'],
  other: ['狂犬疫苗']
};
function calcPetAge(dob) {
  if (!dob) return null;
  const now = new Date(2026, 4, 28);
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 1) return '不足1个月';
  const y = Math.floor(months / 12),
    m = months % 12;
  if (y === 0) return `${m}个月`;
  if (m === 0) return `${y}岁`;
  return `${y}岁${m}个月`;
}

// ─── Mock data ────────────────────────────────────────────────
const PETS_INIT = [{
  id: 'p1',
  name: '黄豆',
  species: 'dog',
  breed: '混血',
  gender: 'female',
  dob: '2020-07-15',
  weight: '20',
  photo: null,
  spayed: true,
  microchipped: false,
  vaccines: ['狂犬疫苗', '犬六联'],
  hasMeds: false,
  meds: '',
  allergies: '',
  withStrangers: '友好',
  withDogs: '友好',
  withCats: '容易紧张',
  withKids: '友好',
  feedingFreq: '一天2次',
  feedingOther: '',
  walkFreq: '一天2次',
  walkOther: '',
  aloneTime: '1-4小时',
  aloneOther: '',
  energy: '高精力',
  notes: '',
  vetName: '',
  vetPhone: '',
  emergencyName: '',
  emergencyPhone: ''
}, {
  id: 'p2',
  name: 'Debbie',
  species: 'cat',
  breed: '波斯布偶猫',
  gender: 'female',
  dob: '2022-03-10',
  weight: '4',
  photo: null,
  spayed: true,
  microchipped: true,
  vaccines: ['猫三联', '狂犬疫苗'],
  hasMeds: false,
  meds: '',
  allergies: '',
  withStrangers: '容易紧张',
  withDogs: '不建议接触',
  withCats: '友好',
  withKids: '容易紧张',
  feedingFreq: '一天2次',
  feedingOther: '',
  walkFreq: null,
  walkOther: '',
  aloneTime: '1-4小时',
  aloneOther: '',
  energy: '低精力',
  notes: '需要安静的环境',
  vetName: '',
  vetPhone: '',
  emergencyName: '',
  emergencyPhone: ''
}];
const emptyPet = () => ({
  id: null,
  name: '',
  species: 'dog',
  breed: '',
  gender: null,
  dob: '',
  weight: '',
  photo: null,
  spayed: null,
  microchipped: null,
  vaccines: [],
  hasMeds: null,
  meds: '',
  allergies: '',
  withStrangers: null,
  withDogs: null,
  withCats: null,
  withKids: null,
  feedingFreq: null,
  feedingOther: '',
  walkFreq: null,
  walkOther: '',
  aloneTime: null,
  aloneOther: '',
  energy: null,
  notes: '',
  vetName: '',
  vetPhone: '',
  emergencyName: '',
  emergencyPhone: ''
});

// ─── Form sub-components ──────────────────────────────────────
function FSectionHead({
  title,
  icon,
  iconBg = '#F5F5FA',
  emergency = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 10px',
      background: emergency ? '#FFF9E6' : '#F0F0F5',
      borderTop: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 8,
      background: emergency ? '#FEF3C7' : iconBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${icon}`,
    style: {
      fontSize: 16,
      color: emergency ? '#B45309' : LL.text2
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14.5,
      fontWeight: 700,
      color: emergency ? '#92400E' : LL.text
    }
  }, title), emergency && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: '#B45309',
      marginTop: 1
    }
  }, "\u7D27\u6025\u60C5\u51B5\u4F7F\u7528")));
}
function FField({
  label,
  required = false,
  hint,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: LL.text,
      marginBottom: hint ? 4 : 10
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#E63946',
      marginLeft: 3
    }
  }, "*")), hint && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginBottom: 10,
      lineHeight: 1.5
    }
  }, hint), children);
}
function FInput({
  value,
  onChange,
  placeholder,
  type = 'text'
}) {
  return /*#__PURE__*/React.createElement("input", {
    type: type,
    value: value,
    onChange: e => onChange(e.target.value),
    placeholder: placeholder,
    style: {
      width: '100%',
      height: 46,
      padding: '0 14px',
      borderRadius: 10,
      border: `1.5px solid ${LL.border}`,
      background: LL.bg,
      fontSize: 15,
      fontFamily: LL.font,
      color: LL.text,
      outline: 'none',
      boxSizing: 'border-box'
    }
  });
}
function FTextarea({
  value,
  onChange,
  placeholder,
  rows = 4
}) {
  return /*#__PURE__*/React.createElement("textarea", {
    value: value,
    onChange: e => onChange(e.target.value),
    placeholder: placeholder,
    rows: rows,
    style: {
      width: '100%',
      padding: '12px 14px',
      borderRadius: 10,
      border: `1.5px solid ${LL.border}`,
      background: LL.bg,
      fontSize: 15,
      fontFamily: LL.font,
      color: LL.text,
      outline: 'none',
      resize: 'none',
      boxSizing: 'border-box',
      lineHeight: 1.6
    }
  });
}
function RadioPills({
  value,
  onChange,
  options
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, options.map(opt => {
    const on = value === opt;
    return /*#__PURE__*/React.createElement("button", {
      key: opt,
      onClick: () => onChange(on ? null : opt),
      style: {
        width: '100%',
        padding: '13px 18px',
        borderRadius: 999,
        border: `1.5px solid ${on ? LL.ink : LL.border}`,
        background: on ? LL.ink : '#fff',
        color: on ? '#fff' : LL.text,
        fontSize: 15,
        fontWeight: on ? 600 : 500,
        cursor: 'pointer',
        fontFamily: LL.font,
        textAlign: 'left'
      }
    }, opt);
  }));
}
function MultiPills({
  value = [],
  onChange,
  options
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, options.map(opt => {
    const on = value.includes(opt);
    return /*#__PURE__*/React.createElement("button", {
      key: opt,
      onClick: () => onChange(on ? value.filter(v => v !== opt) : [...value, opt]),
      style: {
        width: '100%',
        padding: '13px 18px',
        borderRadius: 999,
        border: `1.5px solid ${on ? PETS_GREEN : LL.border}`,
        background: on ? PETS_GREEN_BG : '#fff',
        color: on ? PETS_GREEN : LL.text,
        fontSize: 15,
        fontWeight: on ? 600 : 500,
        cursor: 'pointer',
        fontFamily: LL.font,
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, on ? /*#__PURE__*/React.createElement("i", {
      className: "ph-fill ph-check-circle",
      style: {
        fontSize: 18,
        color: PETS_GREEN,
        flex: '0 0 auto'
      }
    }) : /*#__PURE__*/React.createElement("div", {
      style: {
        width: 18,
        height: 18,
        borderRadius: '50%',
        border: `1.5px solid ${LL.border}`,
        flex: '0 0 auto'
      }
    }), opt);
  }));
}

// ─── Wizard step definitions ──────────────────────────────────
const PET_STEPS = [{
  key: 'basic',
  title: '基础信息',
  icon: 'paw-print',
  iconBg: '#E7E0F4'
}, {
  key: 'health',
  title: '健康信息',
  icon: 'first-aid',
  iconBg: '#DCEFE5'
}, {
  key: 'character',
  title: '性格与相处',
  icon: 'smiley',
  iconBg: '#FBEFC9'
}, {
  key: 'habits',
  title: '生活习惯',
  icon: 'clock',
  iconBg: '#FCE3D4'
}, {
  key: 'extra',
  title: '补充信息',
  icon: 'note-pencil',
  iconBg: '#F0F0F5'
}, {
  key: 'emergency',
  title: '紧急信息',
  icon: 'warning',
  iconBg: '#FEF3C7',
  emergency: true
}];

// ─── Discard-confirmation modal ───────────────────────────────
function DiscardModal({
  onCancel,
  onConfirm
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 36px',
      background: 'rgba(0,0,0,0.42)',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 300,
      background: '#fff',
      borderRadius: 18,
      padding: '24px 22px 18px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16.5,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 8
    }
  }, "\u662F\u5426\u653E\u5F03\u6B64\u8FDB\u7A0B\uFF1F"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text2,
      lineHeight: 1.6,
      marginBottom: 22
    }
  }, "\u79BB\u5F00\u540E\u672C\u6B21\u586B\u5199\u7684\u5185\u5BB9\u5C06\u4E0D\u4F1A\u88AB\u4FDD\u5B58\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onCancel,
    style: {
      flex: 1,
      height: 46,
      borderRadius: 999,
      border: `1.5px solid ${LL.border}`,
      background: '#fff',
      color: LL.text,
      fontSize: 15,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: 'pointer'
    }
  }, "\u53D6\u6D88"), /*#__PURE__*/React.createElement("button", {
    onClick: onConfirm,
    style: {
      flex: 1,
      height: 46,
      borderRadius: 999,
      border: 0,
      background: '#E63946',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer'
    }
  }, "\u653E\u5F03"))));
}

// ─── Add / Edit Form (multi-step wizard) ──────────────────────
function AddEditPetForm({
  initialPet,
  onSave,
  onDiscard,
  onAutoSave,
  saveLabel
}) {
  const [pet, setPet] = React.useState(() => initialPet ? {
    ...initialPet
  } : emptyPet());
  const [step, setStep] = React.useState(0);
  const [showDiscard, setShowDiscard] = React.useState(false);
  const photoRef = React.useRef(null);
  const bodyRef = React.useRef(null);
  const set = (key, val) => setPet(p => {
    const np = {
      ...p,
      [key]: val
    };
    onAutoSave?.(np); // auto-save on every change
    return np;
  });
  const handlePhoto = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = ev => set('photo', ev.target.result);
    r.readAsDataURL(file);
  };
  const total = PET_STEPS.length;
  const isFirst = step === 0;
  const isLast = step === total - 1;
  const cur = PET_STEPS[step];
  const goStep = n => {
    setStep(n);
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  };
  const next = () => isLast ? onSave(pet) : goStep(step + 1);
  const prev = () => goStep(Math.max(0, step - 1));
  const vaccines = VACCINES_OPTIONS[pet.species] || VACCINES_OPTIONS.dog;
  const age = calcPetAge(pet.dob);

  // ── Step content renderers ──────────────────────────────────
  const stepBasic = /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '18px 16px 4px'
    }
  }, /*#__PURE__*/React.createElement(FField, {
    label: "\u5BA0\u7269\u7167\u7247"
  }, /*#__PURE__*/React.createElement("input", {
    ref: photoRef,
    type: "file",
    accept: "image/*",
    style: {
      display: 'none'
    },
    onChange: handlePhoto
  }), /*#__PURE__*/React.createElement("button", {
    onClick: () => photoRef.current?.click(),
    style: {
      width: '100%',
      aspectRatio: '16/9',
      borderRadius: 12,
      padding: 0,
      overflow: 'hidden',
      border: `2px dashed ${LL.border}`,
      background: LL.bg,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10
    }
  }, pet.photo ? /*#__PURE__*/React.createElement("img", {
    src: pet.photo,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 52,
      height: 52,
      borderRadius: '50%',
      background: '#E8E8F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-camera",
    style: {
      fontSize: 24,
      color: LL.text3
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: LL.text3,
      fontFamily: LL.font
    }
  }, "\u70B9\u51FB\u4E0A\u4F20\u5BA0\u7269\u7167\u7247")))), /*#__PURE__*/React.createElement(FField, {
    label: "\u5BA0\u7269\u7C7B\u578B",
    required: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, [['dog', '🐕 狗'], ['cat', '🐈 猫']].map(([v, label]) => {
    const on = pet.species === v;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      onClick: () => {
        set('species', v);
        set('vaccines', []);
      },
      style: {
        padding: '13px 16px',
        borderRadius: 12,
        border: `1.5px solid ${on ? LL.ink : LL.border}`,
        background: on ? LL.ink : '#fff',
        color: on ? '#fff' : LL.text,
        fontSize: 15,
        fontWeight: on ? 700 : 500,
        cursor: 'pointer',
        fontFamily: LL.font
      }
    }, label);
  }))), /*#__PURE__*/React.createElement(FField, {
    label: "\u540D\u5B57",
    required: true
  }, /*#__PURE__*/React.createElement(FInput, {
    value: pet.name,
    onChange: v => set('name', v),
    placeholder: "\u7ED9\u5BA0\u7269\u8D77\u4E2A\u540D\u5B57"
  })), /*#__PURE__*/React.createElement(FField, {
    label: "\u6027\u522B",
    required: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 10
    }
  }, [['male', '男孩 ♂'], ['female', '女孩 ♀']].map(([v, label]) => {
    const on = pet.gender === v;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      onClick: () => set('gender', v),
      style: {
        padding: '13px 16px',
        borderRadius: 12,
        border: `1.5px solid ${on ? LL.ink : LL.border}`,
        background: on ? LL.ink : '#fff',
        color: on ? '#fff' : LL.text,
        fontSize: 15,
        fontWeight: on ? 700 : 500,
        cursor: 'pointer',
        fontFamily: LL.font
      }
    }, label);
  }))), /*#__PURE__*/React.createElement(FField, {
    label: "\u51FA\u751F\u65E5\u671F"
  }, /*#__PURE__*/React.createElement(FInput, {
    type: "date",
    value: pet.dob,
    onChange: v => set('dob', v),
    placeholder: "\u9009\u62E9\u51FA\u751F\u65E5\u671F"
  }), age && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text3,
      marginTop: 7
    }
  }, "\u5E74\u9F84\uFF1A", age)), /*#__PURE__*/React.createElement(FField, {
    label: "\u4F53\u91CD\uFF08\u516C\u65A4\uFF09"
  }, /*#__PURE__*/React.createElement(FInput, {
    type: "number",
    value: pet.weight,
    onChange: v => set('weight', v),
    placeholder: "\u4F8B\uFF1A5.5"
  })), /*#__PURE__*/React.createElement(FField, {
    label: "\u54C1\u79CD"
  }, /*#__PURE__*/React.createElement(FInput, {
    value: pet.breed,
    onChange: v => set('breed', v),
    placeholder: "\u4F8B\uFF1A\u91D1\u6BDB\u3001\u6DF7\u8840"
  })));
  const stepHealth = /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '18px 16px 4px'
    }
  }, /*#__PURE__*/React.createElement(FField, {
    label: "\u662F\u5426\u5DF2\u7EDD\u80B2/\u8282\u80B2"
  }, /*#__PURE__*/React.createElement(RadioPills, {
    value: pet.spayed === true ? '是' : pet.spayed === false ? '否' : null,
    onChange: v => set('spayed', v === '是' ? true : v === '否' ? false : null),
    options: ['是', '否']
  })), /*#__PURE__*/React.createElement(FField, {
    label: "\u662F\u5426\u5DF2\u690D\u5165\u82AF\u7247"
  }, /*#__PURE__*/React.createElement(RadioPills, {
    value: pet.microchipped === true ? '是' : pet.microchipped === false ? '否' : null,
    onChange: v => set('microchipped', v === '是' ? true : v === '否' ? false : null),
    options: ['是', '否']
  })), /*#__PURE__*/React.createElement(FField, {
    label: "\u75AB\u82D7\u63A5\u79CD",
    hint: "\u9009\u62E9\u5DF2\u63A5\u79CD\u7684\u75AB\u82D7"
  }, /*#__PURE__*/React.createElement(MultiPills, {
    value: pet.vaccines,
    onChange: v => set('vaccines', v),
    options: vaccines
  })), /*#__PURE__*/React.createElement(FField, {
    label: "\u662F\u5426\u6709\u9700\u8981\u5B9A\u671F\u670D\u7528\u7684\u836F\u7269"
  }, /*#__PURE__*/React.createElement(RadioPills, {
    value: pet.hasMeds === true ? '有' : pet.hasMeds === false ? '无' : null,
    onChange: v => set('hasMeds', v === '有' ? true : v === '无' ? false : null),
    options: ['有', '无']
  }), pet.hasMeds === true && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(FTextarea, {
    value: pet.meds,
    onChange: v => set('meds', v),
    placeholder: "\u836F\u7269\u540D\u79F0\u548C\u670D\u7528\u65B9\u5F0F",
    rows: 3
  }))), /*#__PURE__*/React.createElement(FField, {
    label: "\u8FC7\u654F\u6216\u7279\u6B8A\u996E\u98DF\u9700\u6C42"
  }, /*#__PURE__*/React.createElement(FTextarea, {
    value: pet.allergies,
    onChange: v => set('allergies', v),
    placeholder: "\u5982\u300C\u5BF9\u9E21\u8089\u8FC7\u654F\uFF0C\u53EA\u5403x\u54C1\u724C\u72D7\u7CAE\u300D",
    rows: 3
  })));
  const stepCharacter = /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '18px 16px 4px'
    }
  }, [['withStrangers', '与陌生人相处'], ['withDogs', '与其他狗相处'], ['withCats', '与猫相处'], ['withKids', '与小孩相处']].map(([key, label]) => /*#__PURE__*/React.createElement(FField, {
    key: key,
    label: label
  }, /*#__PURE__*/React.createElement(RadioPills, {
    value: pet[key],
    onChange: v => set(key, v),
    options: ['友好', '容易紧张', '不建议接触']
  }))));
  const stepHabits = /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '18px 16px 4px'
    }
  }, /*#__PURE__*/React.createElement(FField, {
    label: "\u5582\u98DF\u9891\u7387"
  }, /*#__PURE__*/React.createElement(RadioPills, {
    value: pet.feedingFreq,
    onChange: v => set('feedingFreq', v),
    options: ['一天1次', '一天2次', '一天3次', '自助餐', '其他']
  }), pet.feedingFreq === '其他' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(FInput, {
    value: pet.feedingOther,
    onChange: v => set('feedingOther', v),
    placeholder: "\u8BF7\u63CF\u8FF0\u5582\u98DF\u9891\u7387"
  }))), pet.species === 'dog' && /*#__PURE__*/React.createElement(FField, {
    label: "\u905B\u72D7\u9891\u7387"
  }, /*#__PURE__*/React.createElement(RadioPills, {
    value: pet.walkFreq,
    onChange: v => set('walkFreq', v),
    options: ['一天2次', '一天3次', '一天4次', '其他']
  }), pet.walkFreq === '其他' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(FInput, {
    value: pet.walkOther,
    onChange: v => set('walkOther', v),
    placeholder: "\u8BF7\u63CF\u8FF0\u905B\u72D7\u9891\u7387"
  }))), /*#__PURE__*/React.createElement(FField, {
    label: "\u53EF\u72EC\u5904\u65F6\u95F4"
  }, /*#__PURE__*/React.createElement(RadioPills, {
    value: pet.aloneTime,
    onChange: v => set('aloneTime', v),
    options: ['1小时内', '1-4小时', '4-8小时', '其他']
  }), pet.aloneTime === '其他' && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement(FInput, {
    value: pet.aloneOther,
    onChange: v => set('aloneOther', v),
    placeholder: "\u8BF7\u63CF\u8FF0\u53EF\u72EC\u5904\u65F6\u95F4"
  }))), /*#__PURE__*/React.createElement(FField, {
    label: "\u7CBE\u529B"
  }, /*#__PURE__*/React.createElement(RadioPills, {
    value: pet.energy,
    onChange: v => set('energy', v),
    options: ['高精力', '普通精力', '低精力']
  })));
  const stepExtra = /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '18px 16px 4px'
    }
  }, /*#__PURE__*/React.createElement(FField, {
    label: "\u5176\u4ED6\u5907\u6CE8"
  }, /*#__PURE__*/React.createElement(FTextarea, {
    value: pet.notes,
    onChange: v => set('notes', v),
    placeholder: "\u6709\u4EC0\u4E48\u5176\u4ED6\u60F3\u544A\u8BC9\u5BC4\u517B\u5E08\u7684\u5417\uFF1F",
    rows: 5
  })));
  const stepEmergency = /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      padding: '18px 16px 4px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#FFF9E6',
      border: '1px solid #FCE9B5',
      borderRadius: 12,
      padding: '10px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-warning",
    style: {
      fontSize: 16,
      color: '#B45309'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12.5,
      color: '#92400E',
      fontWeight: 600
    }
  }, "\u7D27\u6025\u60C5\u51B5\u4F7F\u7528")), /*#__PURE__*/React.createElement(FField, {
    label: "\u5E38\u7528\u5BA0\u7269\u533B\u9662\u540D\u79F0"
  }, /*#__PURE__*/React.createElement(FInput, {
    value: pet.vetName,
    onChange: v => set('vetName', v),
    placeholder: "\u533B\u9662\u540D\u79F0"
  })), /*#__PURE__*/React.createElement(FField, {
    label: "\u5BA0\u7269\u533B\u9662\u7535\u8BDD"
  }, /*#__PURE__*/React.createElement(FInput, {
    type: "tel",
    value: pet.vetPhone,
    onChange: v => set('vetPhone', v),
    placeholder: "\u7535\u8BDD\u53F7\u7801"
  })), /*#__PURE__*/React.createElement(FField, {
    label: "\u7D27\u6025\u8054\u7CFB\u4EBA\u59D3\u540D\uFF08\u975E\u672C\u4EBA\uFF0C\u5982\u5BB6\u4EBA\uFF09"
  }, /*#__PURE__*/React.createElement(FInput, {
    value: pet.emergencyName,
    onChange: v => set('emergencyName', v),
    placeholder: "\u59D3\u540D"
  })), /*#__PURE__*/React.createElement(FField, {
    label: "\u7D27\u6025\u8054\u7CFB\u4EBA\u7535\u8BDD"
  }, /*#__PURE__*/React.createElement(FInput, {
    type: "tel",
    value: pet.emergencyPhone,
    onChange: v => set('emergencyPhone', v),
    placeholder: "\u7535\u8BDD\u53F7\u7801"
  })));
  const STEP_CONTENT = [stepBasic, stepHealth, stepCharacter, stepHabits, stepExtra, stepEmergency];

  // ── Footer buttons ──────────────────────────────────────────
  const secBtn = {
    flex: 1,
    height: 50,
    borderRadius: 999,
    border: `1.5px solid ${LL.border}`,
    background: '#fff',
    color: LL.text,
    fontSize: 15,
    fontWeight: 600,
    fontFamily: LL.font,
    cursor: 'pointer'
  };
  const priBtn = {
    flex: 1,
    height: 50,
    borderRadius: 999,
    border: 0,
    background: LL.ink,
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    fontFamily: LL.font,
    cursor: 'pointer'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.bg,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff',
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 52,
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowDiscard(true),
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      border: 0,
      background: LL.bg,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 17,
      color: LL.text
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, initialPet?.id ? '编辑宠物' : '添加宠物'), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      flex: '0 0 auto'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '2px 16px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 8,
      background: cur.iconBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${cur.icon}`,
    style: {
      fontSize: 15,
      color: cur.emergency ? '#B45309' : LL.text2
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, cur.title)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: LL.text3,
      fontVariantNumeric: 'tabular-nums'
    }
  }, "\u6B65\u9AA4 ", step + 1, " / ", total)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5
    }
  }, PET_STEPS.map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: s.key,
    style: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      background: i <= step ? LL.ink : '#E5E5EC',
      transition: 'background 200ms'
    }
  }))))), /*#__PURE__*/React.createElement("div", {
    ref: bodyRef,
    style: {
      flex: 1,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    }
  }, STEP_CONTENT[step], /*#__PURE__*/React.createElement("div", {
    style: {
      height: 20
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff',
      borderTop: `1px solid ${LL.border}`,
      padding: '12px 16px',
      paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      display: 'flex',
      gap: 12
    }
  }, isFirst ? /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowDiscard(true),
    style: secBtn
  }, "\u53D6\u6D88") : /*#__PURE__*/React.createElement("button", {
    onClick: prev,
    style: secBtn
  }, "\u4E0A\u4E00\u6B65"), /*#__PURE__*/React.createElement("button", {
    onClick: next,
    style: priBtn
  }, isLast ? saveLabel || '确认保存' : '下一步')), showDiscard && /*#__PURE__*/React.createElement(DiscardModal, {
    onCancel: () => setShowDiscard(false),
    onConfirm: onDiscard
  }));
}

// ─── Pet Card ─────────────────────────────────────────────────
function PetCard({
  pet,
  onEdit
}) {
  const [expanded, setExpanded] = React.useState(false);
  const age = calcPetAge(pet.dob);
  const friendlyWith = [];
  if (pet.withDogs === '友好') friendlyWith.push({
    emoji: '🐕',
    label: '狗狗'
  });
  if (pet.withCats === '友好') friendlyWith.push({
    emoji: '🐈',
    label: '猫咪'
  });
  if (pet.withKids === '友好') friendlyWith.push({
    emoji: '👶',
    label: '小孩'
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 16,
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, pet.photo ? /*#__PURE__*/React.createElement("img", {
    src: pet.photo,
    style: {
      width: '100%',
      aspectRatio: '16/9',
      objectFit: 'cover',
      display: 'block'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      aspectRatio: '16/9',
      background: 'linear-gradient(135deg, #D8CAE8 0%, #C7E8D8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-paw-print",
    style: {
      fontSize: 52,
      color: 'rgba(30,30,36,0.16)'
    }
  })), /*#__PURE__*/React.createElement("button", {
    onClick: onEdit,
    style: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 34,
      height: 34,
      borderRadius: '50%',
      border: 0,
      background: 'rgba(255,255,255,0.9)',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 1px 6px rgba(0,0,0,0.14)'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-pencil-simple",
    style: {
      fontSize: 15,
      color: LL.text2
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 10px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: LL.text,
      marginBottom: 8
    }
  }, pet.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13.5,
      color: LL.text2,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-paw-print",
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }), pet.breed || '未填写品种'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13.5,
      color: LL.text2,
      marginBottom: pet.spayed ? 5 : 10
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-paw-print",
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }), pet.gender === 'female' ? '母' : pet.gender === 'male' ? '公' : '—', age && ` · ${age}`, pet.weight && ` · ${pet.weight}kg`), pet.spayed && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 13.5,
      color: LL.text2,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u2640"), " \u5DF2\u7EDD\u80B2/\u8282\u80B2"), (pet.spayed || pet.microchipped || pet.vaccines && pet.vaccines.length > 0) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      marginBottom: 12
    }
  }, pet.spayed && /*#__PURE__*/React.createElement("span", {
    style: {
      background: PETS_GREEN_BG,
      color: PETS_GREEN,
      borderRadius: 5,
      padding: '2px 8px',
      fontSize: 11.5,
      fontWeight: 600
    }
  }, "\u5DF2\u7EDD\u80B2"), pet.microchipped && /*#__PURE__*/React.createElement("span", {
    style: {
      background: PETS_GREEN_BG,
      color: PETS_GREEN,
      borderRadius: 5,
      padding: '2px 8px',
      fontSize: 11.5,
      fontWeight: 600
    }
  }, "\u5DF2\u690D\u82AF\u7247"), (pet.vaccines || []).map(v => /*#__PURE__*/React.createElement("span", {
    key: v,
    style: {
      background: PETS_GREEN_BG,
      color: PETS_GREEN,
      borderRadius: 5,
      padding: '2px 8px',
      fontSize: 11.5,
      fontWeight: 600
    }
  }, "\u2713 ", v))), friendlyWith.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color: LL.text3,
      marginBottom: 8
    }
  }, "\u76F8\u5904\u53CB\u597D"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 7,
      flexWrap: 'wrap'
    }
  }, friendlyWith.map((f, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      background: LL.bg,
      borderRadius: 999,
      padding: '5px 11px',
      fontSize: 12.5,
      color: LL.text2,
      border: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, f.emoji), f.label))))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setExpanded(e => !e),
    style: {
      width: '100%',
      padding: '13px 16px',
      background: '#F5F5F9',
      border: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      fontSize: 13.5,
      fontWeight: 600,
      color: LL.text2,
      borderTop: `1px solid ${LL.border}`
    }
  }, "\u67E5\u770B\u5B8C\u6574\u6863\u6848", /*#__PURE__*/React.createElement("i", {
    className: `ph ph-caret-${expanded ? 'up' : 'right'}`,
    style: {
      fontSize: 13
    }
  })), expanded && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      borderTop: `1px solid ${LL.border}`
    }
  }, pet.withStrangers && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 8
    }
  }, "\u6027\u683C\u4E0E\u76F8\u5904"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      marginBottom: 14
    }
  }, [['与陌生人', pet.withStrangers], ['与其他狗', pet.withDogs], ['与猫咪', pet.withCats], ['与小孩', pet.withKids]].filter(([, v]) => v).map(([label, val]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13.5,
      color: LL.text2
    }
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: val === '友好' ? PETS_GREEN : val === '不建议接触' ? '#CC2200' : LL.text
    }
  }, val))))), pet.feedingFreq && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 8
    }
  }, "\u751F\u6D3B\u4E60\u60EF"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      marginBottom: 14
    }
  }, [[' 喂食频率', pet.feedingFreq], [' 可独处时间', pet.aloneTime], [' 精力', pet.energy]].filter(([, v]) => v).map(([label, val]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13.5,
      color: LL.text2
    }
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: LL.text
    }
  }, val))))), (pet.vetName || pet.emergencyName) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: '#B45309',
      marginBottom: 8
    }
  }, "\u7D27\u6025\u8054\u7CFB"), pet.vetName && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text2,
      marginBottom: 5
    }
  }, "\uD83C\uDFE5 ", pet.vetName, pet.vetPhone && ` · ${pet.vetPhone}`), pet.emergencyName && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text2
    }
  }, "\uD83D\uDC64 ", pet.emergencyName, pet.emergencyPhone && ` · ${pet.emergencyPhone}`)), /*#__PURE__*/React.createElement("button", {
    onClick: onEdit,
    style: {
      marginTop: 14,
      width: '100%',
      height: 42,
      borderRadius: 999,
      border: `1px solid ${LL.border}`,
      background: 'transparent',
      fontSize: 13.5,
      fontWeight: 600,
      color: LL.text2,
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, "\u7F16\u8F91\u5B8C\u6574\u8D44\u6599")));
}

// ─── Pets List Page ───────────────────────────────────────────
function PetsListPage({
  pets,
  onAddPet,
  onEditPet
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 32
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 16px 14px',
      background: '#fff',
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 800,
      color: LL.text,
      marginBottom: 6
    }
  }, "\u6211\u7684\u5BA0\u7269"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: LL.text2,
      lineHeight: 1.65
    }
  }, "\u5E2E\u52A9\u5B88\u62A4\u8005\u4E86\u89E3\u6211\u7684\u5BA0\u7269\uFF0C\u8BA9\u4ED6\u4EEC\u66F4\u653E\u5FC3\u5730\u63A5\u5355\u5E76\u63D0\u4F9B\u8D34\u5FC3\u7167\u62A4\u3002")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onAddPet,
    style: {
      width: '100%',
      height: 52,
      borderRadius: 999,
      marginBottom: 16,
      border: `1.5px dashed ${LL.border}`,
      background: 'transparent',
      fontSize: 14,
      fontWeight: 600,
      color: LL.text2,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-plus",
    style: {
      fontSize: 18
    }
  }), "\u6DFB\u52A0\u5BA0\u7269"), pets.map(pet => /*#__PURE__*/React.createElement(PetCard, {
    key: pet.id,
    pet: pet,
    onEdit: () => onEditPet(pet)
  }))));
}

// ─── Pet Reminder Sheet ───────────────────────────────────────
function PetReminderSheet({
  onViewPets,
  onContinue,
  onDismiss
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onDismiss,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.42)',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 51,
      background: '#fff',
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      padding: '14px 20px 44px',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '0 auto 18px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      marginBottom: 10
    }
  }, "\uD83D\uDC3E"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 8
    }
  }, "\u5148\u586B\u5199\u5BA0\u7269\u8D44\u6599"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: LL.text2,
      lineHeight: 1.65,
      padding: '0 8px'
    }
  }, "\u9884\u7EA6\u524D\u9700\u8981\u5148\u544A\u8BC9\u5B88\u62A4\u8005\u4F60\u7684\u5BA0\u7269\u4FE1\u606F\uFF0C\u5E2E\u52A9 TA \u66F4\u653E\u5FC3\u5730\u63A5\u5355\u5E76\u63D0\u4F9B\u8D34\u5FC3\u7167\u62A4\u3002")), /*#__PURE__*/React.createElement("button", {
    onClick: onViewPets,
    style: {
      width: '100%',
      height: 52,
      borderRadius: 999,
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer',
      marginBottom: 12
    }
  }, "\u586B\u5199\u5BA0\u7269\u8D44\u6599"), /*#__PURE__*/React.createElement("button", {
    onClick: onContinue,
    style: {
      width: '100%',
      height: 44,
      borderRadius: 999,
      border: `1.5px solid ${LL.border}`,
      background: 'transparent',
      fontSize: 14,
      fontWeight: 500,
      color: LL.text2,
      fontFamily: LL.font,
      cursor: 'pointer'
    }
  }, "\u6682\u4E0D\u586B\u5199\uFF0C\u76F4\u63A5\u9884\u7EA6")));
}

// ─── Main Screen ──────────────────────────────────────────────
function PetsScreen({
  onBack,
  pets: petsProp,
  onPetsChange,
  onComplete,
  initialView,
  completeLabel
}) {
  const controlled = Array.isArray(petsProp);
  const [petsState, setPetsState] = React.useState(controlled ? petsProp : PETS_INIT);
  const pets = controlled ? petsProp : petsState;
  const setPets = updater => {
    const next = typeof updater === 'function' ? updater(pets) : updater;
    if (controlled) onPetsChange?.(next);else setPetsState(next);
  };
  const [view, setView] = React.useState(initialView || 'list'); // 'list' | 'add' | 'edit'
  const [editingPet, setEditingPet] = React.useState(null);
  const [draft, setDraft] = React.useState(null); // auto-saved working copy

  const handleSave = pet => {
    const isNew = !pet.id;
    const saved = isNew ? {
      ...pet,
      id: `p${Date.now()}`
    } : pet;
    if (isNew) {
      setPets(ps => [...ps, saved]);
    } else {
      setPets(ps => ps.map(p => p.id === pet.id ? pet : p));
    }
    setView('list');
    setEditingPet(null);
    setDraft(null);
    // Onboarding: after adding the first pet, continue the pending flow
    if (isNew && onComplete) onComplete(saved);
  };
  const handleDiscard = () => {
    setView('list');
    setEditingPet(null);
    setDraft(null);
  };
  if (view === 'add' || view === 'edit') {
    return /*#__PURE__*/React.createElement(AddEditPetForm, {
      initialPet: view === 'edit' ? draft || editingPet : draft,
      onSave: handleSave,
      onAutoSave: setDraft,
      onDiscard: handleDiscard,
      saveLabel: onComplete ? completeLabel || '保存并继续预约' : '确认保存'
    });
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.bg,
      minHeight: '100%',
      overflowY: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      height: 52,
      background: '#fff',
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      border: 0,
      background: LL.bg,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 17,
      color: LL.text
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u6211\u7684\u5BA0\u7269"), /*#__PURE__*/React.createElement("button", {
    onClick: () => {
      setDraft(null);
      setView('add');
    },
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      border: 0,
      background: LL.bg,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-plus",
    style: {
      fontSize: 18,
      color: LL.text
    }
  }))), /*#__PURE__*/React.createElement(PetsListPage, {
    pets: pets,
    onAddPet: () => {
      setDraft(null);
      setView('add');
    },
    onEditPet: pet => {
      setEditingPet(pet);
      setDraft(null);
      setView('edit');
    }
  }));
}
Object.assign(window, {
  PetsScreen,
  PetReminderSheet,
  AddEditPetForm,
  PETS_INIT,
  calcPetAge
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/PetsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/ProfileScreen.jsx
try { (() => {
// Lou Lou — ProfileScreen.jsx
// 我的主页 + 子页面: 成为守护者 · 我的优惠券 · 我的邀请码 · 隐私与设置 · 关于Loulou

const PRF_GREEN = '#2C7A4B';

// ─── Shared sub-page wrapper ─────────────────────────────────
function SubPageWrap({
  title,
  onBack,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.bg,
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 19,
      height: 52,
      background: LL.surface,
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      border: 0,
      background: LL.ink,
      color: '#fff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 17
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      paddingBottom: 28
    }
  }, children));
}

// ─── Menu row ────────────────────────────────────────────────
function MenuRow({
  icon,
  label,
  badge,
  onClick,
  danger = false,
  isLast = false,
  iconBg
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      width: '100%',
      padding: '14px 16px',
      background: 'transparent',
      border: 0,
      borderBottom: isLast ? 0 : `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      borderRadius: 10,
      flex: '0 0 auto',
      background: iconBg || '#F5F5FA',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${icon}`,
    style: {
      fontSize: 18,
      color: iconBg ? '#fff' : LL.text2
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 14.5,
      fontWeight: 500,
      color: danger ? '#CC2200' : LL.text,
      textAlign: 'left'
    }
  }, label), badge && /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#E63946',
      color: '#fff',
      fontSize: 10.5,
      fontWeight: 700,
      padding: '2px 7px',
      borderRadius: 999,
      marginRight: 4
    }
  }, badge), !danger && /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 14,
      color: LL.text3
    }
  }));
}

// ─── About tab ───────────────────────────────────────────────
function AboutTab() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 16px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '4px 0 16px'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-calendar-blank",
    style: {
      fontSize: 20,
      color: LL.text2,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: LL.text2
    }
  }, "2024\u5E745\u6708\u52A0\u5165 Loulou")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: LL.border,
      marginBottom: 16
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 12
    }
  }, "\u9A8C\u8BC1"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-phone",
    style: {
      fontSize: 20,
      color: LL.text3,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: LL.text3
    }
  }, "\u624B\u673A\u53F7\u6682\u672A\u9A8C\u8BC1")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-envelope-simple",
    style: {
      fontSize: 20,
      color: LL.text2,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: LL.text2
    }
  }, "\u90AE\u7BB1\u5DF2\u9A8C\u8BC1"), /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-check-circle",
    style: {
      fontSize: 16,
      color: PRF_GREEN
    }
  }))));
}

// ─── Feedback tab ────────────────────────────────────────────
function FeedbackTab() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 16px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 8
    }
  }, "\u5B88\u62A4\u8005\u53CD\u9988 (0)"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text2,
      lineHeight: 1.65,
      marginBottom: 28
    }
  }, "\u67E5\u770B\u5B88\u62A4\u8005\u5BF9\u60A8\u7684\u53CD\u9988\uFF0C\u60A8\u53EF\u4EE5\u56DE\u590D\u4EFB\u4F55\u53CD\u9988\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10,
      padding: '12px 0'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-chat-circle",
    style: {
      fontSize: 40,
      color: LL.text3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: LL.text3
    }
  }, "\u6682\u65E0\u5B88\u62A4\u8005\u53CD\u9988")));
}

// ─── Pets tab ────────────────────────────────────────────────
const PETS_TAB_GREEN = '#2C7A4B';
const PETS_TAB_GREEN_BG = '#E6F1EC';

// One pet, rendered as a row: circular avatar + basics, with an
// expandable 查看完整档案 dropdown and 编辑完整资料 button.
function PetTabRow({
  pet,
  onEdit,
  isLast
}) {
  const [open, setOpen] = React.useState(false);
  const age = typeof window.calcPetAge === 'function' ? window.calcPetAge(pet.dob) : null;
  const avatarBg = pet.species === 'cat' ? LL.lavender : pet.species === 'dog' ? LL.butter : pet.species === 'rabbit' ? LL.peach : LL.mint;
  const meta = [pet.gender === 'female' ? '母' : pet.gender === 'male' ? '公' : null, age, pet.weight ? `${pet.weight}kg` : null].filter(Boolean).join(' · ');
  const hasBadges = pet.spayed || pet.microchipped || pet.vaccines && pet.vaccines.length > 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: isLast ? 0 : `1px solid ${LL.border}`,
      padding: '14px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 54,
      height: 54,
      borderRadius: '50%',
      background: avatarBg,
      flex: '0 0 auto',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, pet.photo ? /*#__PURE__*/React.createElement("img", {
    src: pet.photo,
    alt: pet.name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-paw-print",
    style: {
      fontSize: 24,
      color: 'rgba(30,30,36,0.42)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 2
    }
  }, pet.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text2
    }
  }, pet.breed || '未填写品种'), meta && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3,
      marginTop: 1
    }
  }, meta))), hasBadges && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      marginTop: 10
    }
  }, pet.spayed && /*#__PURE__*/React.createElement("span", {
    style: {
      background: PETS_TAB_GREEN_BG,
      color: PETS_TAB_GREEN,
      borderRadius: 5,
      padding: '2px 8px',
      fontSize: 11.5,
      fontWeight: 600
    }
  }, "\u5DF2\u7EDD\u80B2"), pet.microchipped && /*#__PURE__*/React.createElement("span", {
    style: {
      background: PETS_TAB_GREEN_BG,
      color: PETS_TAB_GREEN,
      borderRadius: 5,
      padding: '2px 8px',
      fontSize: 11.5,
      fontWeight: 600
    }
  }, "\u5DF2\u690D\u82AF\u7247"), (pet.vaccines || []).map(v => /*#__PURE__*/React.createElement("span", {
    key: v,
    style: {
      background: PETS_TAB_GREEN_BG,
      color: PETS_TAB_GREEN,
      borderRadius: 5,
      padding: '2px 8px',
      fontSize: 11.5,
      fontWeight: 600
    }
  }, "\u2713 ", v))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setOpen(o => !o),
    style: {
      marginTop: 12,
      width: '100%',
      height: 40,
      borderRadius: 10,
      background: '#F5F5F9',
      border: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      fontSize: 13.5,
      fontWeight: 600,
      color: LL.text2
    }
  }, "\u67E5\u770B\u5B8C\u6574\u6863\u6848", /*#__PURE__*/React.createElement("i", {
    className: `ph ph-caret-${open ? 'up' : 'down'}`,
    style: {
      fontSize: 13
    }
  })), open && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 2px 2px'
    }
  }, pet.withStrangers && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 8
    }
  }, "\u6027\u683C\u4E0E\u76F8\u5904"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      marginBottom: 14
    }
  }, [['与陌生人', pet.withStrangers], ['与其他狗', pet.withDogs], ['与猫咪', pet.withCats], ['与小孩', pet.withKids]].filter(([, v]) => v).map(([label, val]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13.5,
      color: LL.text2
    }
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: val === '友好' ? PETS_TAB_GREEN : val === '不建议接触' ? '#CC2200' : LL.text
    }
  }, val))))), pet.feedingFreq && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 8
    }
  }, "\u751F\u6D3B\u4E60\u60EF"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7,
      marginBottom: 14
    }
  }, [['喂食频率', pet.feedingFreq], ['可独处时间', pet.aloneTime], ['精力', pet.energy]].filter(([, v]) => v).map(([label, val]) => /*#__PURE__*/React.createElement("div", {
    key: label,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: 13.5,
      color: LL.text2
    }
  }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      color: LL.text
    }
  }, val))))), (pet.vetName || pet.emergencyName) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: '#B45309',
      marginBottom: 8
    }
  }, "\u7D27\u6025\u8054\u7CFB"), pet.vetName && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text2,
      marginBottom: 5
    }
  }, "\uD83C\uDFE5 ", pet.vetName, pet.vetPhone && ` · ${pet.vetPhone}`), pet.emergencyName && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text2
    }
  }, "\uD83D\uDC64 ", pet.emergencyName, pet.emergencyPhone && ` · ${pet.emergencyPhone}`)), /*#__PURE__*/React.createElement("button", {
    onClick: onEdit,
    style: {
      marginTop: 4,
      width: '100%',
      height: 42,
      borderRadius: 999,
      border: `1px solid ${LL.border}`,
      background: 'transparent',
      fontSize: 13.5,
      fontWeight: 600,
      color: LL.text2,
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, "\u7F16\u8F91\u5B8C\u6574\u8D44\u6599")));
}
function PetsTab({
  pets = [],
  onAddPet,
  onEditPet
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 16px 20px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 8
    }
  }, "\u6211\u7684\u5BA0\u7269 (", pets.length, ")"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text2,
      lineHeight: 1.65,
      marginBottom: 16
    }
  }, "\u5E2E\u52A9\u5B88\u62A4\u8005\u4E86\u89E3\u60A8\u7684\u5BA0\u7269\uFF0C\u63A5\u53D7\u60A8\u7684\u7533\u8BF7\uFF0C\u63D0\u4F9B\u5B89\u5168\u3001\u8D34\u5FC3\u7684\u7167\u6599\u3002"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column'
    }
  }, pets.map((p, i) => /*#__PURE__*/React.createElement(PetTabRow, {
    key: p.id,
    pet: p,
    onEdit: () => onEditPet?.(p),
    isLast: i === pets.length - 1
  }))), /*#__PURE__*/React.createElement("button", {
    onClick: onAddPet,
    style: {
      marginTop: 16,
      width: '100%',
      height: 44,
      borderRadius: 999,
      border: `1px dashed ${LL.border}`,
      background: 'transparent',
      fontSize: 13.5,
      fontWeight: 600,
      color: LL.text2,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-plus",
    style: {
      fontSize: 15
    }
  }), "\u6DFB\u52A0\u5BA0\u7269"));
}

// ─── Main profile page ───────────────────────────────────────
function MyProfileMain({
  tab,
  setTab,
  onNav,
  pets,
  onAddPet,
  onEditPet
}) {
  const TABS = [{
    id: 'about',
    label: '关于我'
  }, {
    id: 'feedback',
    label: '守护者反馈'
  }, {
    id: 'pets',
    label: '我的宠物'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.bg,
      minHeight: '100%',
      paddingBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.surface,
      padding: '24px 20px 20px',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 86,
      height: 86,
      borderRadius: '50%',
      background: '#D4D4DE',
      margin: '0 auto 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "48",
    height: "48",
    viewBox: "0 0 48 48",
    fill: "none"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "24",
    cy: "17",
    r: "10",
    fill: "#A0A0B8"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 48c0-11.046 8.954-20 20-20s20 8.954 20 20",
    fill: "#A0A0B8"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      fontWeight: 800,
      color: LL.text,
      letterSpacing: '-0.01em',
      marginBottom: 5
    }
  }, "\u6BDB\u6BDB M."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 13,
      color: LL.text2,
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-map-pin",
    style: {
      fontSize: 13
    }
  }), "\u671D\u9633\u533A\xB7\u671B\u4EAC"), /*#__PURE__*/React.createElement("button", {
    style: {
      width: '100%',
      height: 46,
      borderRadius: 999,
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 15,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-pencil-simple",
    style: {
      fontSize: 16
    }
  }), "\u7F16\u8F91\u8D44\u6599")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.surface,
      display: 'flex',
      borderBottom: `1px solid ${LL.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 19
    }
  }, TABS.map(t => {
    const on = t.id === tab;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => setTab(t.id),
      style: {
        flex: 1,
        height: 44,
        border: 0,
        background: 'transparent',
        fontSize: 13.5,
        fontWeight: on ? 700 : 500,
        color: on ? LL.text : LL.text3,
        borderBottom: on ? `2px solid ${LL.text}` : '2px solid transparent',
        cursor: 'pointer',
        fontFamily: LL.font,
        transition: 'color 160ms'
      }
    }, t.label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.surface
    }
  }, tab === 'about' && /*#__PURE__*/React.createElement(AboutTab, null), tab === 'feedback' && /*#__PURE__*/React.createElement(FeedbackTab, null), tab === 'pets' && /*#__PURE__*/React.createElement(PetsTab, {
    pets: pets,
    onAddPet: onAddPet,
    onEditPet: onEditPet
  })), tab === 'about' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      background: '#F0F0F5'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.surface
    }
  }, /*#__PURE__*/React.createElement(MenuRow, {
    icon: "shield-check",
    label: "\u6210\u4E3A\u5B88\u62A4\u8005",
    iconBg: LL.ink,
    onClick: () => onNav('guardian')
  }), /*#__PURE__*/React.createElement(MenuRow, {
    icon: "ticket",
    label: "\u6211\u7684\u4F18\u60E0\u5238",
    badge: "2\u5F20",
    onClick: () => onNav('coupons')
  }), /*#__PURE__*/React.createElement(MenuRow, {
    icon: "share-network",
    label: "\u6211\u7684\u9080\u8BF7\u7801",
    onClick: () => onNav('invite')
  }), /*#__PURE__*/React.createElement(MenuRow, {
    icon: "gear",
    label: "\u9690\u79C1\u4E0E\u8BBE\u7F6E",
    onClick: () => onNav('settings')
  }), /*#__PURE__*/React.createElement(MenuRow, {
    icon: "info",
    label: "\u5173\u4E8E Loulou",
    isLast: true,
    onClick: () => onNav('about-ll')
  }))));
}

// ─── 成为守护者 ───────────────────────────────────────────────
function BecomeGuardianPage({
  onBack
}) {
  return /*#__PURE__*/React.createElement(SubPageWrap, {
    title: "\u6210\u4E3A\u5B88\u62A4\u8005",
    onBack: onBack
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.ink,
      padding: '28px 20px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-paw-print",
    style: {
      fontSize: 44,
      color: LL.butter
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: '#fff'
    }
  }, "\u6210\u4E3A Loulou \u5B88\u62A4\u8005"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.7)',
      lineHeight: 1.65,
      maxWidth: 260
    }
  }, "\u4E0E\u7231\u5BA0\u4E3A\u4F34\uFF0C\u4E3A\u5BA0\u4E3B\u63D0\u4F9B\u4E13\u4E1A\u7167\u62A4\uFF0C\u540C\u65F6\u8D5A\u53D6\u989D\u5916\u6536\u5165")), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '14px 16px 0',
      background: LL.surface,
      borderRadius: 16,
      padding: '16px 16px 4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 12
    }
  }, "\u5B88\u62A4\u8005\u6743\u76CA"), [{
    icon: 'currency-cny',
    text: '灵活赚取收入，自定服务价格'
  }, {
    icon: 'calendar-blank',
    text: '自主管理日程，随时暂停接单'
  }, {
    icon: 'shield-check',
    text: '平台保险保障，安全无忧'
  }, {
    icon: 'headset',
    text: '7×24小时专属客服支持'
  }].map((item, i, arr) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '11px 0',
      borderBottom: i < arr.length - 1 ? `1px solid ${LL.border}` : 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      height: 34,
      borderRadius: 9,
      background: LL.butter,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${item.icon}`,
    style: {
      fontSize: 17,
      color: LL.text
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: LL.text2
    }
  }, item.text)))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '12px 16px 0',
      padding: '12px 14px',
      borderRadius: 12,
      background: '#FFFBEB',
      border: '1px solid #F5E2A8'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-info",
    style: {
      fontSize: 15,
      color: '#B45309'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: '#92400E'
    }
  }, "\u4EF7\u683C\u4E0E\u5E73\u53F0\u4F63\u91D1")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: '#92400E',
      lineHeight: 1.6
    }
  }, "\u60A8\u53EF\u81EA\u4E3B\u8BBE\u5B9A\u670D\u52A1\u4EF7\u683C\uFF0C\u5BA0\u4E3B\u770B\u5230\u5E76\u652F\u4ED8\u7684\u5373\u4E3A\u8BE5\u4EF7\u683C\u3002\u5E73\u53F0\u5C06\u6309\u6BCF\u7B14\u8BA2\u5355\u7684 15% \u6536\u53D6\u4F63\u91D1\uFF0C\u4ECE\u60A8\u7684\u6536\u5165\u4E2D\u6263\u9664\uFF0C\u7ED3\u7B97\u91D1\u989D\u4E3A\u8BA2\u5355\u4EF7\u683C\u7684 85%\u3002\u8BE6\u89C1\u300A\u7528\u6237\u670D\u52A1\u534F\u8BAE\u300B\u3002")), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '12px 16px 0',
      background: LL.surface,
      borderRadius: 16,
      padding: '16px 16px 4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 12
    }
  }, "\u7533\u8BF7\u6761\u4EF6"), ['年满18周岁', '爱宠人士，有养宠经验', '通过平台认证培训', '提供安全、整洁的住所'].map((req, i, arr) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 0',
      borderBottom: i < arr.length - 1 ? `1px solid ${LL.border}` : 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-check-circle",
    style: {
      fontSize: 16,
      color: PRF_GREEN,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13.5,
      color: LL.text2
    }
  }, req)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      width: '100%',
      height: 50,
      borderRadius: 999,
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer'
    }
  }, "\u7ACB\u5373\u7533\u8BF7\u6210\u4E3A\u5B88\u62A4\u8005")));
}

// ─── 我的优惠券 ───────────────────────────────────────────────
function CouponsPage({
  onBack
}) {
  const [subTab, setSubTab] = React.useState('valid');
  const allCoupons = {
    valid: [{
      id: 'c1',
      type: '生日专享',
      icon: 'cake',
      title: '宠物生日折扣券',
      desc: '生日当月享9折，不限服务',
      expires: '2026年12月31日',
      tag: '即将到期',
      bg: LL.butter
    }, {
      id: 'c2',
      type: '邀请奖励',
      icon: 'users',
      title: '邀请好友奖励券',
      desc: '满¥100立减¥20',
      expires: '2026年06月30日',
      tag: null,
      bg: LL.lavender
    }],
    used: [],
    expired: [{
      id: 'c3',
      type: '商家合作',
      icon: 'handshake',
      title: '噜噜×萌宠乐园合作券',
      desc: '满¥100减¥15',
      expires: '2026年04月30日',
      tag: '已过期',
      bg: '#EBEBF0'
    }]
  };
  const TABS = [{
    id: 'valid',
    label: '未使用'
  }, {
    id: 'used',
    label: '已使用'
  }, {
    id: 'expired',
    label: '已过期'
  }];
  const list = allCoupons[subTab];
  return /*#__PURE__*/React.createElement(SubPageWrap, {
    title: "\u6211\u7684\u4F18\u60E0\u5238",
    onBack: onBack
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.surface,
      display: 'flex',
      borderBottom: `1px solid ${LL.border}`,
      position: 'sticky',
      top: 52,
      zIndex: 18
    }
  }, TABS.map(t => {
    const on = t.id === subTab;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => setSubTab(t.id),
      style: {
        flex: 1,
        height: 42,
        border: 0,
        background: 'transparent',
        fontSize: 13.5,
        fontWeight: on ? 700 : 500,
        color: on ? LL.text : LL.text3,
        borderBottom: on ? `2px solid ${LL.text}` : '2px solid transparent',
        cursor: 'pointer',
        fontFamily: LL.font
      }
    }, t.label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, list.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '40px 0'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-ticket",
    style: {
      fontSize: 44,
      color: LL.text3,
      display: 'block',
      marginBottom: 10
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: LL.text3
    }
  }, "\u6682\u65E0", TABS.find(t => t.id === subTab)?.label, "\u4F18\u60E0\u5238")) : list.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.id,
    style: {
      borderRadius: 14,
      overflow: 'hidden',
      background: LL.surface,
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
      display: 'flex',
      opacity: subTab === 'expired' ? 0.6 : 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 62,
      background: c.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px 6px',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${c.icon}`,
    style: {
      fontSize: 22,
      color: LL.text2
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 9.5,
      fontWeight: 600,
      color: LL.text2,
      textAlign: 'center',
      lineHeight: 1.3
    }
  }, c.type)), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      background: 'repeating-linear-gradient(to bottom, #DDD 0, #DDD 4px, transparent 4px, transparent 8px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: '14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 6,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text,
      flex: 1
    }
  }, c.title), c.tag && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 600,
      background: LL.peach,
      color: LL.text,
      padding: '2px 6px',
      borderRadius: 4,
      flex: '0 0 auto'
    }
  }, c.tag)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text2,
      marginBottom: 8
    }
  }, c.desc), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: LL.text3
    }
  }, "\u6709\u6548\u671F\u81F3 ", c.expires))))));
}

// ─── 我的邀请码 ───────────────────────────────────────────────
function InvitePage({
  onBack
}) {
  const [copied, setCopied] = React.useState(false);
  const CODE = 'LOULOU888';
  const copy = () => {
    try {
      navigator.clipboard.writeText(CODE);
    } catch (_) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return /*#__PURE__*/React.createElement(SubPageWrap, {
    title: "\u6211\u7684\u9080\u8BF7\u7801",
    onBack: onBack
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.ink,
      padding: '24px 20px',
      display: 'flex',
      justifyContent: 'center',
      gap: 40
    }
  }, [{
    label: '已邀请好友',
    value: '3 位'
  }, {
    label: '获得奖励',
    value: '¥60'
  }].map((s, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 26,
      fontWeight: 800,
      color: '#fff',
      letterSpacing: '-0.01em'
    }
  }, s.value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.6)',
      marginTop: 3
    }
  }, s.label)))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '14px 16px 0',
      background: LL.surface,
      borderRadius: 16,
      padding: '18px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text3,
      textAlign: 'center',
      marginBottom: 10
    }
  }, "\u6211\u7684\u4E13\u5C5E\u9080\u8BF7\u7801"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      background: LL.bg,
      borderRadius: 12,
      padding: '12px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 24,
      fontWeight: 800,
      color: LL.text,
      letterSpacing: '0.1em',
      textAlign: 'center'
    }
  }, CODE), /*#__PURE__*/React.createElement("button", {
    onClick: copy,
    style: {
      height: 36,
      padding: '0 16px',
      borderRadius: 999,
      border: 0,
      background: copied ? PRF_GREEN : LL.ink,
      color: '#fff',
      fontSize: 13,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: 'pointer',
      transition: 'background 200ms',
      flex: '0 0 auto'
    }
  }, copied ? '✓ 已复制' : '复制')), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 16,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 110,
      height: 110,
      background: LL.bg,
      borderRadius: 12,
      border: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-qr-code",
    style: {
      fontSize: 52,
      color: LL.text3
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }, "\u597D\u53CB\u626B\u7801\u6CE8\u518C\uFF0C\u81EA\u52A8\u7ED1\u5B9A\u9080\u8BF7\u5173\u7CFB"))), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '12px 16px 0',
      background: LL.surface,
      borderRadius: 16,
      padding: '14px 16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 10
    }
  }, "\u9080\u8BF7\u89C4\u5219"), ['好友通过邀请码注册后，双方各得 ¥20 优惠券', '好友完成首笔订单后，您额外获得 ¥10 奖励', '优惠券有效期90天，请及时使用'].map((r, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: 'flex',
      gap: 8,
      fontSize: 12.5,
      color: LL.text2,
      lineHeight: 1.6,
      paddingBottom: i < 2 ? 8 : 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text3,
      flex: '0 0 auto',
      fontWeight: 600
    }
  }, i + 1, "."), r))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '16px 16px 0'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      width: '100%',
      height: 50,
      borderRadius: 999,
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-share-network",
    style: {
      fontSize: 18
    }
  }), "\u5206\u4EAB\u7ED9\u597D\u53CB")));
}

// ─── 隐私与设置 ───────────────────────────────────────────────
function SettingsPage({
  onBack
}) {
  const [notif, setNotif] = React.useState(true);
  const [mktg, setMktg] = React.useState(false);
  const Toggle = ({
    on,
    onToggle
  }) => /*#__PURE__*/React.createElement("button", {
    onClick: onToggle,
    style: {
      width: 46,
      height: 26,
      borderRadius: 13,
      border: 0,
      background: on ? PRF_GREEN : LL.border,
      cursor: 'pointer',
      position: 'relative',
      transition: 'background 200ms'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 3,
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: '#fff',
      left: on ? 23 : 3,
      transition: 'left 200ms',
      boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
    }
  }));
  const sections = [{
    title: '账号安全',
    items: [{
      label: '手机号码',
      value: '+86 138 **** 8888',
      type: 'nav'
    }, {
      label: '修改密码',
      value: null,
      type: 'nav'
    }, {
      label: '绑定邮箱',
      value: '已绑定',
      type: 'nav'
    }]
  }, {
    title: '通知设置',
    items: [{
      label: '推送通知',
      value: null,
      type: 'toggle',
      key: 'notif'
    }, {
      label: '营销活动推送',
      value: null,
      type: 'toggle',
      key: 'mktg'
    }, {
      label: '订单状态提醒',
      value: null,
      type: 'nav'
    }]
  }, {
    title: '通用',
    items: [{
      label: '清除缓存',
      value: '12.5 MB',
      type: 'nav'
    }, {
      label: '反馈与帮助',
      value: null,
      type: 'nav'
    }]
  }];
  return /*#__PURE__*/React.createElement(SubPageWrap, {
    title: "\u9690\u79C1\u4E0E\u8BBE\u7F6E",
    onBack: onBack
  }, sections.map((sec, si) => /*#__PURE__*/React.createElement("div", {
    key: si
  }, si > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      background: '#F0F0F5'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px 4px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      fontWeight: 600,
      color: LL.text3,
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    }
  }, sec.title)), /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.surface
    }
  }, sec.items.map((item, ii) => /*#__PURE__*/React.createElement("div", {
    key: ii,
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '14px 16px',
      borderBottom: ii < sec.items.length - 1 ? `1px solid ${LL.border}` : 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 14.5,
      color: LL.text,
      fontWeight: 500
    }
  }, item.label), item.type === 'toggle' ? /*#__PURE__*/React.createElement(Toggle, {
    on: item.key === 'notif' ? notif : mktg,
    onToggle: () => item.key === 'notif' ? setNotif(n => !n) : setMktg(m => !m)
  }) : /*#__PURE__*/React.createElement(React.Fragment, null, item.value && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text3,
      marginRight: 8
    }
  }, item.value), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 14,
      color: LL.text3
    }
  }))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 8,
      background: '#F0F0F5'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.surface
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      width: '100%',
      padding: '16px',
      background: 'transparent',
      border: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      fontSize: 15,
      fontWeight: 600,
      color: '#CC2200'
    }
  }, "\u9000\u51FA\u767B\u5F55")));
}

// ─── 关于 Loulou ──────────────────────────────────────────────
function AboutLoulouPage({
  onBack
}) {
  const [expanded, setExpanded] = React.useState(null);
  const logoUrl = window.__resources && window.__resources.loulouLogo || './assets/loulou-logo.png';
  const docs = [{
    id: 'terms',
    label: '用户服务协议',
    body: '欢迎使用 Loulou（露露）宠物服务平台。本协议约定您与平台之间的权利义务关系。\n\n一、服务内容\nLoulou 提供宠物寄养、遛狗、日托等预约撮合服务，平台为信息中介方。\n\n二、用户义务\n您需如实填写宠物信息，保证宠物已接种疫苗，配合守护者完成接送手续。\n\n三、平台职责\n平台负责守护者认证审核，提供支付担保及纠纷协调，但不对守护者的个人行为承担连带责任。\n\n四、平台佣金\n守护者自主设定服务价格，宠主支付的即为该价格，平台不向宠主额外收取服务费。平台按每笔订单价格的 15% 向守护者收取佣金，于结算时从守护者收入中扣除，守护者实际所得为订单价格的 85%。\n\n五、争议解决\n本协议适用中华人民共和国法律，争议由平台注册地人民法院管辖。'
  }, {
    id: 'privacy',
    label: '隐私政策',
    body: 'Loulou 重视用户隐私保护。本政策说明我们如何收集、使用和保护您的个人信息。\n\n一、信息收集\n我们收集您注册时填写的姓名、手机号、地址及使用过程中的行为数据。\n\n二、信息使用\n信息用于提供服务、改善产品体验、发送订单通知。\n\n三、信息共享\n我们不向无关第三方出售您的信息，仅在必要时与守护者共享联系方式。\n\n四、数据安全\n平台采用行业标准加密技术保障数据安全，如有泄漏将第一时间通知您。'
  }, {
    id: 'disclaimer',
    label: '免责声明',
    body: '一、服务限制\nLoulou 为撮合平台，对守护者与宠主因服务产生的纠纷不承担直接责任。\n\n二、意外责任\n服务过程中发生宠物意外，平台将协助保险理赔，最终责任认定依据相关法律。\n\n三、不可抗力\n因自然灾害、政府行为等不可抗力导致服务中断，平台不承担赔偿责任。'
  }, {
    id: 'feedback',
    label: '意见反馈',
    body: null
  }];
  return /*#__PURE__*/React.createElement(SubPageWrap, {
    title: "\u5173\u4E8E Loulou",
    onBack: onBack
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.surface,
      padding: '28px 20px',
      textAlign: 'center',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: logoUrl,
    alt: "Loulou",
    style: {
      height: 48,
      width: 'auto',
      marginBottom: 12
    },
    onError: e => {
      e.target.style.display = 'none';
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: LL.text,
      marginBottom: 4
    }
  }, "Loulou \u9732\u9732"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text3
    }
  }, "\u5BA0\u7269\u5B88\u62A4\u670D\u52A1\u5E73\u53F0"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text3,
      marginTop: 3
    }
  }, "\u7248\u672C 1.2.0")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: LL.surface
    }
  }, docs.map((doc, i) => /*#__PURE__*/React.createElement("div", {
    key: doc.id
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => doc.body && setExpanded(expanded === doc.id ? null : doc.id),
    style: {
      width: '100%',
      padding: '15px 16px',
      background: 'transparent',
      border: 0,
      borderBottom: `1px solid ${LL.border}`,
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      fontSize: 14.5,
      fontWeight: 500,
      color: LL.text,
      textAlign: 'left'
    }
  }, doc.label), /*#__PURE__*/React.createElement("i", {
    className: `ph ph-caret-${doc.body && expanded === doc.id ? 'up' : 'right'}`,
    style: {
      fontSize: 14,
      color: LL.text3
    }
  })), doc.body && expanded === doc.id && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 16px 18px',
      background: LL.bg,
      fontSize: 13,
      color: LL.text2,
      lineHeight: 1.75,
      whiteSpace: 'pre-wrap',
      textWrap: 'pretty',
      borderBottom: `1px solid ${LL.border}`
    }
  }, doc.body)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '20px 0',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }, "\xA9 2026 Loulou \u9732\u9732 \u7248\u6743\u6240\u6709"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      marginTop: 3
    }
  }, "\u4EACICP\u59072026XXXXXX\u53F7")));
}

// ─── Main export ─────────────────────────────────────────────
function ProfileScreen() {
  const [tab, setTab] = React.useState('about');
  const [page, setPage] = React.useState(null);
  const [pets, setPets] = React.useState(() => Array.isArray(window.PETS_INIT) ? window.PETS_INIT.map(p => ({
    ...p
  })) : []);
  const [petForm, setPetForm] = React.useState(null); // null | { pet: petObj | null }

  // Add / edit pet — opens the shared wizard inline (keeps tab shell on back)
  if (petForm && typeof window.AddEditPetForm === 'function') {
    const Form = window.AddEditPetForm;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: LL.bg,
        height: '100%'
      }
    }, /*#__PURE__*/React.createElement(Form, {
      initialPet: petForm.pet,
      onSave: p => {
        setPets(ps => {
          if (p.id && ps.some(x => x.id === p.id)) return ps.map(x => x.id === p.id ? p : x);
          return [...ps, {
            ...p,
            id: p.id || `p${Date.now()}`
          }];
        });
        setPetForm(null);
        setTab('pets');
      },
      onDiscard: () => setPetForm(null),
      saveLabel: "\u786E\u8BA4\u4FDD\u5B58"
    }));
  }
  if (page === 'guardian') return /*#__PURE__*/React.createElement(BecomeGuardianPage, {
    onBack: () => setPage(null)
  });
  if (page === 'coupons') return /*#__PURE__*/React.createElement(CouponsPage, {
    onBack: () => setPage(null)
  });
  if (page === 'invite') return /*#__PURE__*/React.createElement(InvitePage, {
    onBack: () => setPage(null)
  });
  if (page === 'settings') return /*#__PURE__*/React.createElement(SettingsPage, {
    onBack: () => setPage(null)
  });
  if (page === 'about-ll') return /*#__PURE__*/React.createElement(AboutLoulouPage, {
    onBack: () => setPage(null)
  });
  return /*#__PURE__*/React.createElement(MyProfileMain, {
    tab: tab,
    setTab: setTab,
    onNav: setPage,
    pets: pets,
    onAddPet: () => setPetForm({
      pet: null
    }),
    onEditPet: p => setPetForm({
      pet: p
    })
  });
}
window.ProfileScreen = ProfileScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/ProfileScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/ReviewGuardianScreen.jsx
try { (() => {
// Lou Lou — ReviewGuardianScreen.jsx
// 评价守护者 — opened from a completed order card's 写评论 button.
// 简洁明了：星级 + 印象标签 + 文字 + 照片 + 匿名 + 提交。

const REVIEW_STAR_LABELS = ['', '很差', '一般', '满意', '很好', '非常满意'];
const REVIEW_TAGS = ['准时可靠', '有耐心', '爱干净', '很专业', '拍照及时', '沟通顺畅', '宠物喜欢', '细心负责'];
function ReviewGuardianScreen({
  app,
  onClose,
  onSubmit
}) {
  const g = app?.guardian || {};
  const [stars, setStars] = React.useState(5);
  const [tags, setTags] = React.useState(new Set());
  const [text, setText] = React.useState('');
  const [anon, setAnon] = React.useState(false);
  const photoSrc = (typeof resolveGuardianPhoto === 'function' ? resolveGuardianPhoto(g) : null) || window.__resources && window.__resources.guardian2 || g.photo || null;
  const dateLabel = app?.dateEnd && app.dateEnd !== app.dateStart ? `${app.dateStart} – ${app.dateEnd}` : app?.dateStart;
  const toggleTag = t => setTags(prev => {
    const n = new Set(prev);
    n.has(t) ? n.delete(t) : n.add(t);
    return n;
  });
  const canSubmit = stars > 0;
  const submit = () => {
    if (!canSubmit) return;
    onSubmit?.(app, {
      stars,
      tags: [...tags],
      text: text.trim(),
      anonymous: anon
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      zIndex: 80,
      display: 'flex',
      flexDirection: 'column',
      background: LL.bg,
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      height: 52,
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px',
      gap: 12,
      background: '#fff',
      borderBottom: `1px solid ${LL.border}`
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      width: 34,
      height: 34,
      borderRadius: '50%',
      border: 0,
      background: '#F0F0F5',
      color: LL.text,
      cursor: 'pointer',
      flex: '0 0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 17
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u8BC4\u4EF7\u5B88\u62A4\u8005"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 34,
      flex: '0 0 auto'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px 16px 24px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      padding: '20px 16px 22px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      borderRadius: '50%',
      overflow: 'hidden',
      background: g.bg || LL.lavender,
      flex: '0 0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, photoSrc ? /*#__PURE__*/React.createElement("img", {
    src: photoSrc,
    alt: g.name,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      objectPosition: 'top center'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 24,
      fontWeight: 700,
      color: LL.text
    }
  }, g.name?.[0] || '守')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: LL.text
    }
  }, g.name || '守护者'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }, app?.service, " \xB7 ", dateLabel, " \xB7 ", (app?.pet || '').split('·').pop())), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 12,
      marginTop: 18
    }
  }, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement("button", {
    key: n,
    onClick: () => setStars(n),
    style: {
      background: 'transparent',
      border: 0,
      cursor: 'pointer',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `${n <= stars ? 'ph-fill' : 'ph'} ph-star`,
    style: {
      fontSize: 34,
      color: n <= stars ? '#F5B301' : LL.border,
      transition: 'color 120ms'
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 10,
      fontSize: 13.5,
      fontWeight: 700,
      color: stars >= 4 ? '#2C7A4B' : LL.text2
    }
  }, REVIEW_STAR_LABELS[stars])), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      background: '#fff',
      borderRadius: 16,
      padding: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text,
      marginBottom: 3
    }
  }, "\u5979\u54EA\u91CC\u505A\u5F97\u597D\uFF1F"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      marginBottom: 12
    }
  }, "\u9009\u62E9\u6807\u7B7E\uFF08\u53EF\u591A\u9009\uFF09"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8
    }
  }, REVIEW_TAGS.map(t => {
    const on = tags.has(t);
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      onClick: () => toggleTag(t),
      style: {
        height: 34,
        padding: '0 14px',
        borderRadius: 999,
        border: on ? 0 : `1px solid ${LL.border}`,
        background: on ? LL.ink : '#fff',
        color: on ? '#fff' : LL.text2,
        fontSize: 12.5,
        fontWeight: on ? 700 : 500,
        fontFamily: LL.font,
        cursor: 'pointer',
        transition: 'all 140ms',
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }, on && /*#__PURE__*/React.createElement("i", {
      className: "ph-fill ph-check",
      style: {
        fontSize: 12
      }
    }), t);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      background: '#fff',
      borderRadius: 16,
      padding: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("textarea", {
    value: text,
    onChange: e => setText(e.target.value),
    placeholder: "\u5206\u4EAB\u672C\u6B21\u670D\u52A1\u7684\u4F53\u9A8C\uFF0C\u5E2E\u52A9\u66F4\u591A\u5BA0\u4E3B\u4E86\u89E3\u8FD9\u4F4D\u5B88\u62A4\u8005\u2026",
    maxLength: 500,
    style: {
      width: '100%',
      minHeight: 96,
      resize: 'none',
      border: 0,
      outline: 'none',
      fontSize: 14,
      lineHeight: 1.6,
      color: LL.text,
      fontFamily: LL.font,
      background: 'transparent'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginTop: 10
    }
  }, [0, 1, 2].map(i => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      width: 64,
      height: 64,
      borderRadius: 12,
      flex: '0 0 auto',
      border: `1.5px dashed ${LL.border}`,
      background: LL.bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      cursor: 'pointer',
      color: LL.text3
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-camera",
    style: {
      fontSize: 19
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 9.5
    }
  }, "\u6DFB\u52A0\u7167\u7247"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'right',
      fontSize: 11,
      color: LL.text3
    }
  }, text.length, "/500"))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setAnon(a => !a),
    style: {
      width: '100%',
      marginTop: 14,
      background: '#fff',
      borderRadius: 16,
      border: 0,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      cursor: 'pointer',
      fontFamily: LL.font,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-mask-happy",
    style: {
      fontSize: 18,
      color: LL.text2,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: 600,
      color: LL.text
    }
  }, "\u533F\u540D\u8BC4\u4EF7"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: LL.text3,
      marginTop: 1
    }
  }, "\u5B88\u62A4\u8005\u5C06\u770B\u4E0D\u5230\u60A8\u7684\u6635\u79F0\u4E0E\u5934\u50CF")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 26,
      borderRadius: 999,
      flex: '0 0 auto',
      position: 'relative',
      background: anon ? '#2C7A4B' : LL.border,
      transition: 'background 160ms'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 3,
      left: anon ? 21 : 3,
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: '#fff',
      transition: 'left 160ms',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      textAlign: 'center',
      fontSize: 11.5,
      color: LL.text3,
      lineHeight: 1.6
    }
  }, "\u771F\u5B9E\u7684\u8BC4\u4EF7\u80FD\u5E2E\u52A9\u66F4\u591A\u5BA0\u4E3B\u627E\u5230\u653E\u5FC3\u7684\u5B88\u62A4\u8005")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff',
      borderTop: `1px solid ${LL.border}`,
      padding: '12px 16px 22px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: submit,
    disabled: !canSubmit,
    style: {
      width: '100%',
      height: 52,
      borderRadius: 999,
      border: 0,
      background: canSubmit ? LL.ink : 'rgba(34,40,44,0.22)',
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: canSubmit ? 'pointer' : 'not-allowed',
      transition: 'background 160ms'
    }
  }, "\u63D0\u4EA4\u8BC4\u4EF7")));
}
window.ReviewGuardianScreen = ReviewGuardianScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/ReviewGuardianScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/SearchPickers.jsx
try { (() => {
// Lou Lou — Search-card pickers
//
// Three bottom-sheet pickers that drive the home search card:
//   · ServicePickerSheet      grouped service-type picker (在守护者家 / 在宠主家)
//   · DateRangePickerSheet    Form A — 2-month calendar with range select
//                              (寄养 · 日托 · 住家守护)
//   · SchedulePickerSheet     Form B — frequency + dates + time-period panel
//                              (遛狗 · 上门服务)
//
// Past dates are greyed out across both calendars. The owning screen drives
// open/close state and passes the current draft back into the picker so the
// sheet always reflects what the search card shows.

// ─── Service catalogue ───────────────────────────────────────
const SERVICE_GROUPS = [{
  title: '在守护者家',
  items: [{
    id: '寄养',
    hint: '24小时照护'
  }, {
    id: '日托',
    hint: '白天看护，当天接送'
  }]
}, {
  title: '在宠主家',
  items: [{
    id: '遛狗',
    hint: '至少30分钟'
  }, {
    id: '上门喂养',
    hint: '查看、喂食、换水、铲屎等至少30分钟'
  }, {
    id: '伴宠留宿',
    hint: '守护者上门陪伴/过夜'
  }]
}];

// Which date/time form applies — 'A' = range calendar, 'B' = schedule panel
const SERVICE_FORM = {
  '寄养': 'A',
  '日托': 'A',
  '伴宠留宿': 'A',
  '遛狗': 'B',
  '上门喂养': 'B'
};

// Unit shown in summary ("共 X 晚" vs "共 X 天")
const SERVICE_UNIT = {
  '寄养': '晚',
  '日托': '天',
  '伴宠留宿': '晚'
};
Object.assign(window, {
  SERVICE_GROUPS,
  SERVICE_FORM,
  SERVICE_UNIT
});

// ─── Date utilities ──────────────────────────────────────────
const WEEK_CN_SUN_FIRST = ['日', '一', '二', '三', '四', '五', '六'];
const WEEK_CN_MON_FIRST = ['一', '二', '三', '四', '五', '六', '日'];
function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// ─── China public holidays (2025–2026) — 国务院公告，节假日服务一般加价 ───
const CN_HOLIDAYS = {
  // 2025
  '2025-10-01': '国庆',
  '2025-10-02': '国庆',
  '2025-10-03': '国庆',
  '2025-10-04': '国庆',
  '2025-10-05': '国庆',
  '2025-10-06': '中秋',
  '2025-10-07': '国庆',
  '2025-10-08': '国庆',
  // 2026
  '2026-01-01': '元旦',
  '2026-02-16': '除夕',
  '2026-02-17': '春节',
  '2026-02-18': '春节',
  '2026-02-19': '春节',
  '2026-02-20': '春节',
  '2026-02-21': '春节',
  '2026-02-22': '春节',
  '2026-02-23': '春节',
  '2026-02-24': '春节',
  '2026-04-04': '清明',
  '2026-04-05': '清明',
  '2026-04-06': '清明',
  '2026-05-01': '劳动节',
  '2026-05-02': '劳动节',
  '2026-05-03': '劳动节',
  '2026-05-04': '劳动节',
  '2026-05-05': '劳动节',
  '2026-06-19': '端午',
  '2026-06-20': '端午',
  '2026-06-21': '端午',
  '2026-09-25': '中秋',
  '2026-09-26': '中秋',
  '2026-09-27': '中秋',
  '2026-10-01': '国庆',
  '2026-10-02': '国庆',
  '2026-10-03': '国庆',
  '2026-10-04': '国庆',
  '2026-10-05': '国庆',
  '2026-10-06': '国庆',
  '2026-10-07': '国庆',
  '2026-10-08': '国庆'
};
function holidayLabel(d) {
  if (!d) return null;
  const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  return CN_HOLIDAYS[k] || null;
}
function sameDay(a, b) {
  return !!(a && b) && startOfDay(a).getTime() === startOfDay(b).getTime();
}
function dayBefore(a, b) {
  return startOfDay(a) < startOfDay(b);
}
function daysBetween(a, b) {
  return Math.round((startOfDay(b) - startOfDay(a)) / 86400000);
}
function fmtShort(d) {
  return d ? `${d.getMonth() + 1}月${d.getDate()}日` : '';
}
function fmtFull(d) {
  return d ? `${d.getMonth() + 1}月${d.getDate()}日 周${WEEK_CN_SUN_FIRST[d.getDay()]}` : '';
}
Object.assign(window, {
  fmtShort,
  fmtFull,
  daysBetween
});

// ─── CalendarMonth — single month grid (Mon-first) ───────────
function CalendarMonth({
  year,
  month,
  start,
  end
}, _) {} // (forward decl placeholder, real below)

function CalendarMonthImpl({
  year,
  month,
  start,
  end,
  onTap,
  showHeader = true,
  mode = 'range',
  selectedDays = []
}) {
  const today = startOfDay(new Date());
  const first = new Date(year, month, 1);
  const dim = new Date(year, month + 1, 0).getDate();
  // Monday-first: convert getDay (0=Sun..6=Sat) → 0=Mon..6=Sun
  const startCol = (first.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < startCol; i++) cells.push(null);
  for (let d = 1; d <= dim; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  const stateFor = cell => {
    if (!cell) return 'empty';
    if (dayBefore(cell, today)) return 'past';
    if (mode === 'multi') {
      if (selectedDays.some(d => sameDay(d, cell))) return 'single';
      if (sameDay(cell, today)) return 'today';
      return 'normal';
    }
    const isStart = sameDay(cell, start);
    const isEnd = sameDay(cell, end);
    if (isStart && isEnd) return 'single';
    if (isStart) return 'start';
    if (isEnd) return 'end';
    if (start && end && !dayBefore(cell, start) && dayBefore(cell, end)) return 'middle';
    if (sameDay(cell, today)) return 'today';
    return 'normal';
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 4
    }
  }, showHeader && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: LL.text,
      padding: '6px 4px 8px',
      textAlign: 'center'
    }
  }, year, "\u5E74", month + 1, "\u6708"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(7, 1fr)',
      rowGap: 0
    }
  }, WEEK_CN_MON_FIRST.map(w => /*#__PURE__*/React.createElement("div", {
    key: w,
    style: {
      textAlign: 'center',
      fontSize: 10,
      color: LL.text3,
      padding: '0 0 2px',
      fontWeight: 500
    }
  }, w)), cells.map((cell, i) => {
    const s = stateFor(cell);
    if (s === 'empty') return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        height: 49
      }
    });
    const isToday = sameDay(cell, today);
    const isPast = s === 'past';
    const isEdge = s === 'start' || s === 'end' || s === 'single';
    const holiday = holidayLabel(cell);
    const subLabel = isToday ? '今天' : holiday || null;
    // Label always uses same non-edge color so "今天" stays visually consistent
    const labelColor = isPast ? LL.text3 : holiday ? '#E5484D' : LL.text2;
    const numColor = isEdge ? '#fff' : isPast ? LL.text3 : holiday ? '#E5484D' : LL.text;
    // Layout constants — label above, box below, range fill aligned to box
    const LABEL_H = 12; // px reserved for 今天/holiday label row
    const BOX_H = 32; // px height of the selection box / circle
    const PAD_TOP = 1; // px top padding in cell

    return /*#__PURE__*/React.createElement("button", {
      key: i,
      onClick: () => !isPast && onTap(cell),
      disabled: isPast,
      style: {
        height: LABEL_H + BOX_H + PAD_TOP + 4,
        border: 0,
        background: 'transparent',
        position: 'relative',
        cursor: isPast ? 'default' : 'pointer',
        padding: 0,
        fontFamily: LL.font,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: PAD_TOP
      }
    }, s === 'middle' && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: PAD_TOP + LABEL_H,
        height: BOX_H,
        background: 'rgba(34,40,44,0.08)'
      }
    }), s === 'start' && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: '50%',
        right: 0,
        top: PAD_TOP + LABEL_H,
        height: BOX_H,
        background: 'rgba(34,40,44,0.08)'
      }
    }), s === 'end' && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        right: '50%',
        left: 0,
        top: PAD_TOP + LABEL_H,
        height: BOX_H,
        background: 'rgba(34,40,44,0.08)'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        height: LABEL_H,
        fontSize: 8.5,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: labelColor,
        fontWeight: 600,
        letterSpacing: '0.01em',
        position: 'relative',
        zIndex: 1,
        visibility: subLabel ? 'visible' : 'hidden',
        width: '100%'
      }
    }, subLabel || '.'), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        zIndex: 1,
        minWidth: BOX_H,
        height: BOX_H,
        borderRadius: isEdge ? 8 : 0,
        background: isEdge ? LL.ink : 'transparent',
        color: numColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: isEdge ? 700 : holiday ? 600 : 500,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
        padding: isEdge ? '0 6px' : 0
      }
    }, cell.getDate()));
  })));
}

// ─── RangeCalendar — single month with month nav (compact) ───
function RangeCalendar({
  start,
  end,
  onChange,
  mode = 'range',
  selectedDays = [],
  onToggleDay
}) {
  const today = new Date();
  const [offset, setOffset] = React.useState(0);
  const baseY = today.getFullYear(),
    baseM = today.getMonth();
  const cur = {
    y: baseY + Math.floor((baseM + offset) / 12),
    m: ((baseM + offset) % 12 + 12) % 12
  };
  const handle = d => {
    if (mode === 'multi') {
      onToggleDay?.(d);
      return;
    }
    if (!start || start && end) {
      onChange({
        start: d,
        end: null
      });
    } else if (dayBefore(d, start) || sameDay(d, start)) {
      onChange({
        start: d,
        end: null
      });
    } else {
      onChange({
        start,
        end: d
      });
    }
  };
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '0 2px 4px'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setOffset(offset - 1),
    disabled: offset <= 0,
    style: {
      border: 0,
      background: 'rgba(34,40,44,0.05)',
      borderRadius: '50%',
      width: 26,
      height: 26,
      cursor: offset > 0 ? 'pointer' : 'default',
      color: offset > 0 ? LL.text : LL.text3,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 12
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontSize: 13.5,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.01em'
    }
  }, cur.y, "\u5E74", cur.m + 1, "\u6708"), /*#__PURE__*/React.createElement("button", {
    onClick: () => setOffset(offset + 1),
    style: {
      border: 0,
      background: 'rgba(34,40,44,0.05)',
      borderRadius: '50%',
      width: 26,
      height: 26,
      cursor: 'pointer',
      color: LL.text,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 12
    }
  }))), /*#__PURE__*/React.createElement(CalendarMonthImpl, {
    year: cur.y,
    month: cur.m,
    start: start,
    end: end,
    onTap: handle,
    showHeader: false,
    mode: mode,
    selectedDays: selectedDays
  }));
}

// ─── ScrollCalendar — vertically-stacked months, scrollable ──
// Matches the "sliding" calendar used by other services (寄养/日托).
// Supports range mode (start/end) and multi mode (selectedDays).
function ScrollCalendar({
  start,
  end,
  onChange,
  mode = 'range',
  selectedDays = [],
  onToggleDay,
  monthsCount = 9
}) {
  const today = new Date();
  const baseY = today.getFullYear(),
    baseM = today.getMonth();
  const months = [];
  for (let i = 0; i < monthsCount; i++) {
    months.push({
      y: baseY + Math.floor((baseM + i) / 12),
      m: ((baseM + i) % 12 + 12) % 12
    });
  }
  const handle = d => {
    if (mode === 'multi') {
      onToggleDay?.(d);
      return;
    }
    if (!start || start && end) {
      onChange({
        start: d,
        end: null
      });
    } else if (dayBefore(d, start) || sameDay(d, start)) {
      onChange({
        start: d,
        end: null
      });
    } else {
      onChange({
        start,
        end: d
      });
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: 326,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch',
      margin: '0 -2px',
      padding: '0 2px'
    }
  }, months.map(({
    y,
    m
  }) => /*#__PURE__*/React.createElement("div", {
    key: `${y}-${m}`,
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement(CalendarMonthImpl, {
    year: y,
    month: m,
    start: start,
    end: end,
    onTap: handle,
    showHeader: true,
    mode: mode,
    selectedDays: selectedDays
  }))));
}

// ─── BottomSheet — reusable shell ────────────────────────────
function BottomSheet({
  title,
  onClose,
  tall = false,
  footer = null,
  children
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.35)',
      zIndex: 85
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 86,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: tall ? '94%' : '78%',
      boxShadow: '0 -8px 24px rgba(0,0,0,0.10)',
      fontFamily: LL.font,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px 8px',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '0 auto 10px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "\u5173\u95ED",
    style: {
      marginLeft: 'auto',
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: '#F0F0F5',
      color: LL.text,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x",
    style: {
      fontSize: 13
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden'
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px 20px',
      background: '#fff',
      borderTop: `1px solid ${LL.border}`,
      flex: '0 0 auto'
    }
  }, footer)));
}

// ─── ServicePickerSheet — grouped, two sections ──────────────
function ServicePickerSheet({
  open,
  value,
  onPick,
  onClose
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement(BottomSheet, {
    title: "\u9009\u62E9\u670D\u52A1\u7C7B\u578B",
    onClose: onClose
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 0 18px'
    }
  }, SERVICE_GROUPS.map((g, gi) => /*#__PURE__*/React.createElement("div", {
    key: g.title,
    style: {
      marginTop: gi === 0 ? 0 : 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: LL.text3,
      padding: '6px 18px 6px',
      letterSpacing: '0.06em'
    }
  }, g.title), g.items.map((it, ii) => {
    const on = value === it.id;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      onClick: () => onPick(it.id),
      style: {
        width: '100%',
        padding: '13px 18px',
        background: 'transparent',
        border: 0,
        cursor: 'pointer',
        fontFamily: LL.font,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTop: ii === 0 ? `1px solid ${LL.border}` : 0,
        borderBottom: `1px solid ${LL.border}`,
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 15,
        fontWeight: on ? 700 : 600,
        color: LL.text
      }
    }, it.id), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: LL.text2
      }
    }, it.hint)), on && /*#__PURE__*/React.createElement("i", {
      className: "ph-fill ph-check-circle",
      style: {
        fontSize: 18,
        color: LL.ink,
        flex: '0 0 auto'
      }
    }));
  })))));
}

// ─── DateRangePickerSheet — Form A ───────────────────────────
function DateRangePickerSheet({
  open,
  value,
  svcType,
  onConfirm,
  onClose
}) {
  const [draft, setDraft] = React.useState(value || {
    start: null,
    end: null
  });
  React.useEffect(() => {
    if (open) setDraft(value || {
      start: null,
      end: null
    });
  }, [open, value]);
  if (!open) return null;
  const unit = SERVICE_UNIT[svcType] || '晚';
  const n = draft.start && draft.end ? daysBetween(draft.start, draft.end) : 0;
  const canConfirm = !!(draft.start && draft.end);
  const footer = /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      color: LL.text2,
      marginBottom: 10,
      textAlign: 'center',
      minHeight: 18
    }
  }, draft.start && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text,
      fontWeight: 700
    }
  }, fmtShort(draft.start)), /*#__PURE__*/React.createElement("span", {
    style: {
      margin: '0 6px'
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text,
      fontWeight: 700
    }
  }, draft.end ? fmtShort(draft.end) : '...'), n > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 8,
      color: LL.text2
    }
  }, "\u5171 ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: LL.text
    }
  }, n), " ", unit)), !draft.start && '请点击日历选择开始日期'), /*#__PURE__*/React.createElement("button", {
    disabled: !canConfirm,
    onClick: () => onConfirm(draft),
    style: {
      width: '100%',
      height: 46,
      borderRadius: 999,
      border: 0,
      background: canConfirm ? LL.ink : LL.inkDisabled,
      color: '#fff',
      fontSize: 15,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: canConfirm ? 'pointer' : 'not-allowed',
      letterSpacing: '0.18em',
      textIndent: '0.18em'
    }
  }, "\u786E\u5B9A"));
  return /*#__PURE__*/React.createElement(BottomSheet, {
    title: "\u9009\u62E9\u65E5\u671F",
    onClose: onClose,
    tall: true,
    footer: footer
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 14px 12px'
    }
  }, /*#__PURE__*/React.createElement(RangeCalendar, {
    start: draft.start,
    end: draft.end,
    onChange: setDraft
  })));
}

// ─── SchedulePickerSheet — Form B ────────────────────────────
function defaultSchedule() {
  return {
    type: 'once',
    // 'once' | 'recurring'
    pickMode: 'range',
    // 'range' (连续选择) | 'single' (单日点选) — 单次预约 only
    dates: {
      start: null,
      end: null,
      days: []
    },
    weekdays: [],
    // 0..6 (Mon..Sun)
    periods: [] // subset of PERIODS ids
  };
}
function SchedulePickerSheet({
  open,
  value,
  svcType,
  onSearch,
  onClose,
  applyLabel
}) {
  const [draft, setDraft] = React.useState(value || defaultSchedule());
  React.useEffect(() => {
    if (open) setDraft(value || defaultSchedule());
  }, [open, value]);
  if (!open) return null;
  const showPickMode = svcType === '遛狗' || svcType === '上门喂养';
  const pickMode = draft.pickMode || 'range';
  const pickedDays = draft.dates.days || [];
  const toggleDay = d => setDraft(dd => {
    const cur = dd.dates.days || [];
    const exists = cur.some(x => sameDay(x, d));
    return {
      ...dd,
      dates: {
        ...dd.dates,
        days: exists ? cur.filter(x => !sameDay(x, d)) : [...cur, d]
      }
    };
  });
  const toggleWeekday = i => setDraft(d => ({
    ...d,
    weekdays: d.weekdays.includes(i) ? d.weekdays.filter(w => w !== i) : [...d.weekdays, i].sort()
  }));
  const canSearch = (() => {
    if (draft.type === 'once') {
      return pickMode === 'single' ? pickedDays.length > 0 : !!draft.dates.start;
    }
    return draft.weekdays.length > 0 && !!draft.dates.start && !!draft.dates.end;
  })();
  const footer = /*#__PURE__*/React.createElement("button", {
    disabled: !canSearch,
    onClick: () => onSearch(draft),
    style: {
      width: '100%',
      height: 48,
      borderRadius: 999,
      border: 0,
      background: canSearch ? LL.ink : LL.inkDisabled,
      color: '#fff',
      fontSize: 15,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: canSearch ? 'pointer' : 'not-allowed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10
    }
  }, !applyLabel && /*#__PURE__*/React.createElement("i", {
    className: "ph ph-magnifying-glass",
    style: {
      fontSize: 18
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      letterSpacing: applyLabel ? '0.1em' : '0.32em',
      textIndent: applyLabel ? '0.1em' : '0.32em'
    }
  }, applyLabel || '搜索守护者'));
  return /*#__PURE__*/React.createElement(BottomSheet, {
    title: `安排${svcType || '服务'}`,
    onClose: onClose,
    tall: true,
    footer: footer
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 14px 12px'
    }
  }, /*#__PURE__*/React.createElement(SectionLabel, null, "\u9891\u6B21"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(ScheduleTypeBtn, {
    on: draft.type === 'once',
    onClick: () => setDraft({
      ...draft,
      type: 'once'
    }),
    emoji: "\uD83D\uDCC5",
    label: "\u5355\u6B21\u9884\u7EA6",
    sub: "\u9009\u62E9\u5355\u5929\u6216\u8FDE\u7EED\u591A\u5929"
  }), /*#__PURE__*/React.createElement(ScheduleTypeBtn, {
    on: draft.type === 'recurring',
    onClick: () => setDraft({
      ...draft,
      type: 'recurring'
    }),
    emoji: "\uD83D\uDD01",
    label: "\u6BCF\u5468\u91CD\u590D",
    sub: "\u9009\u62E9\u56FA\u5B9A\u5468\u51E0"
  })), /*#__PURE__*/React.createElement(SectionLabel, {
    style: {
      marginTop: 18
    }
  }, "\u65E5\u671F"), draft.type === 'once' ? /*#__PURE__*/React.createElement(React.Fragment, null, showPickMode && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      background: 'rgba(34,40,44,0.05)',
      borderRadius: 12,
      padding: 4,
      marginBottom: 14
    }
  }, [{
    id: 'range',
    label: '连选日期'
  }, {
    id: 'single',
    label: '点选日期'
  }].map(opt => {
    const on = pickMode === opt.id;
    return /*#__PURE__*/React.createElement("button", {
      key: opt.id,
      onClick: () => setDraft(d => ({
        ...d,
        pickMode: opt.id
      })),
      style: {
        flex: 1,
        height: 38,
        borderRadius: 9,
        border: 0,
        cursor: 'pointer',
        fontFamily: LL.font,
        background: on ? LL.ink : 'transparent',
        color: on ? '#fff' : LL.text2,
        fontSize: 13.5,
        fontWeight: on ? 700 : 500,
        boxShadow: 'none',
        transition: 'all 140ms'
      }
    }, opt.label);
  })), showPickMode && pickMode === 'single' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(ScrollCalendar, {
    mode: "multi",
    selectedDays: pickedDays,
    onToggleDay: toggleDay
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text2,
      padding: '4px 2px 0',
      lineHeight: 1.5
    }
  }, "\u70B9\u9009\u4EFB\u610F\u4E00\u5929\u6216\u591A\u5929\uFF0C\u5DF2\u9009 ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: LL.text
    }
  }, pickedDays.length), " \u5929")) : /*#__PURE__*/React.createElement(ScrollCalendar, {
    start: draft.dates.start,
    end: draft.dates.end,
    onChange: d => setDraft({
      ...draft,
      dates: {
        ...draft.dates,
        ...d
      }
    })
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text2,
      padding: '0 2px 6px',
      lineHeight: 1.5
    }
  }, "\u6BCF\u5468\u54EA\u51E0\u5929\u9700\u8981\u670D\u52A1"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      justifyContent: 'space-between',
      marginBottom: 14
    }
  }, WEEK_CN_MON_FIRST.map((w, i) => {
    const on = draft.weekdays.includes(i);
    return /*#__PURE__*/React.createElement("button", {
      key: w,
      onClick: () => toggleWeekday(i),
      style: {
        width: 38,
        height: 38,
        borderRadius: '50%',
        border: 0,
        background: on ? LL.ink : 'rgba(34,40,44,0.05)',
        color: on ? '#fff' : LL.text,
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: LL.font
      }
    }, w);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text2,
      padding: '0 2px 4px',
      lineHeight: 1.5
    }
  }, "\u91CD\u590D\u5468\u671F"), /*#__PURE__*/React.createElement(ScrollCalendar, {
    start: draft.dates.start,
    end: draft.dates.end,
    onChange: d => setDraft({
      ...draft,
      dates: d
    })
  }))));
}
function ScheduleTypeBtn({
  on,
  onClick,
  emoji,
  label,
  sub
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      flex: 1,
      padding: '14px 8px 12px',
      border: 0,
      borderRadius: 14,
      cursor: 'pointer',
      fontFamily: LL.font,
      background: on ? '#fff' : 'rgba(34,40,44,0.03)',
      boxShadow: on ? `inset 0 0 0 2px ${LL.ink}` : `inset 0 0 0 1px ${LL.border}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      transition: 'box-shadow 120ms ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      lineHeight: 1
    }
  }, emoji), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      fontWeight: on ? 700 : 600,
      color: LL.text
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      color: LL.text2
    }
  }, sub));
}
function SectionLabel({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.ink,
      padding: '0 0 8px',
      ...style
    }
  }, children);
}

// ─── Summary helper — used by HomeMarketplaceScreen to render
//      the chosen state inline on the search-card date row.
// ─────────────────────────────────────────────────────────────
function summarizeQuery({
  svcType,
  dateRange,
  schedule
}) {
  if (!svcType) return null;
  const form = SERVICE_FORM[svcType];
  if (form === 'A') {
    if (!dateRange || !dateRange.start || !dateRange.end) return null;
    const n = daysBetween(dateRange.start, dateRange.end);
    const unit = SERVICE_UNIT[svcType] || '晚';
    return `${fmtShort(dateRange.start)} → ${fmtShort(dateRange.end)} · 共 ${n} ${unit}`;
  }
  if (form === 'B') {
    if (!schedule) return null;
    if (schedule.type === 'once') {
      if (schedule.pickMode === 'single') {
        const days = (schedule.dates.days || []).slice().sort((a, b) => a - b);
        if (!days.length) return null;
        return days.length <= 2 ? days.map(fmtShort).join('、') : `${fmtShort(days[0])} 等${days.length}天`;
      }
      if (!schedule.dates.start) return null;
      return schedule.dates.end ? `${fmtShort(schedule.dates.start)} → ${fmtShort(schedule.dates.end)}` : fmtShort(schedule.dates.start);
    }
    if (!schedule.weekdays?.length || !schedule.dates.start || !schedule.dates.end) return null;
    const wd = schedule.weekdays.map(i => WEEK_CN_MON_FIRST[i]).join('/');
    return `每周${wd} · ${fmtShort(schedule.dates.start)}–${fmtShort(schedule.dates.end)}`;
  }
  return null;
}
Object.assign(window, {
  ServicePickerSheet,
  DateRangePickerSheet,
  SchedulePickerSheet,
  summarizeQuery,
  defaultSchedule
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/SearchPickers.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/SearchResultsScreen.jsx
try { (() => {
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

function SearchResultsScreen({
  onBack,
  query,
  onPickField,
  setTopBarLeading,
  onSelectGuardian
}) {
  // Status bar stays native — clear any leading override left from a prior screen.
  React.useEffect(() => {
    setTopBarLeading?.(null);
  }, [setTopBarLeading]);

  // ── normalize the query coming from HomeMarketplaceScreen into the
  // flat display shape used by the compact summary row. Supports both
  // Form A (date range) and Form B (schedule + time periods).
  const q = React.useMemo(() => buildSummaryQuery(query), [query]);

  // ── filter & sort state ─────────────────────────────────────
  // All filter selections (distance / rating / price slider / 4 attribute
  // groups) are owned by `filters` and edited live inside the FilterDrawer.
  const [filters, setFilters] = React.useState(defaultFilters());
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [sort, setSort] = React.useState('智能排序');
  const [open, setOpen] = React.useState(null); // 'sort' | null

  const SORT_OPTS = ['智能排序', '距离由近到远', '评分由高到低', '价格由低到高', '价格由高到低'];

  // ── mock data: 8 guardians ───────────────────────────────
  // Real Asian portraits sourced from Unsplash (verified). The system also
  // uses on-brand pastel initial circles (matching the existing GuardianRow
  // pattern) for the remaining slots — a realistic mix for a Chinese
  // mini-program listing. Replace `initial:{...}` with `photo:photo(...)` once
  // brand photography is supplied.
  const photo = (id, key) => {
    const url = `https://images.unsplash.com/photo-${id}?w=240&h=240&fit=crop&crop=faces&auto=format&q=70`;
    return typeof window !== 'undefined' && window.__resources && window.__resources[key] || url;
  };
  const guardians = [{
    id: 'g1',
    name: '林若 Lily',
    photo: photo('1568822617270-2c1579f8dfe2', 'guardianPhoto1'),
    bio: '养狗6年，专业寄养经验3年，自家带院子',
    rating: 4.97,
    reviews: 128,
    dist: 0.8,
    city: '三里屯',
    features: ['认证5年', '户外活动', '清洁消毒'],
    price: 168,
    unit: '晚',
    orders: 412,
    cert: true,
    reused: true,
    badge: '金牌'
  }, {
    id: 'g2',
    name: '阿浩 Hao',
    initial: {
      char: '浩',
      bg: LL.peach
    },
    bio: '宠物医院实习两年，懂日常喂养与急救',
    rating: 4.92,
    reviews: 96,
    dist: 1.2,
    city: '工体北',
    features: ['认证2年', '24h智能监控', '急救认证'],
    price: 148,
    unit: '晚',
    orders: 286,
    cert: true,
    reused: true,
    badge: null
  }, {
    id: 'g3',
    name: '桃子 Joy',
    initial: {
      char: '桃',
      bg: LL.butter
    },
    bio: '家有两只布偶，擅长猫咪日托与上门喂养',
    rating: 4.89,
    reviews: 74,
    dist: 1.6,
    city: '东直门',
    features: ['认证3年', '清洁消毒', '无其他宠物'],
    price: 88,
    unit: '天',
    orders: 151,
    cert: true,
    reused: false,
    badge: null
  }, {
    id: 'g4',
    name: '陈逸 Yi',
    photo: photo('1542909192-2f2241a99c9d', 'guardianPhoto4'),
    bio: '住家守护8年，接待中大型犬，提供日常视频',
    rating: 4.86,
    reviews: 212,
    dist: 2.3,
    city: '国贸',
    features: ['认证8年', '24h智能监控', '户外活动', '清洁消毒'],
    price: 228,
    unit: '晚',
    orders: 534,
    cert: true,
    reused: false,
    badge: '金牌'
  }, {
    id: 'g5',
    name: '小米 Mia',
    initial: {
      char: '米',
      bg: LL.lavender
    },
    bio: '养小型犬5年，每日两次遛狗+拍照打卡',
    rating: 4.81,
    reviews: 58,
    dist: 2.7,
    city: '朝阳门',
    features: ['认证1年', '户外活动'],
    price: 128,
    unit: '晚',
    orders: 103,
    cert: false,
    reused: false,
    badge: null
  }, {
    id: 'g6',
    name: '阿哲 Zhe',
    initial: {
      char: '哲',
      bg: LL.mint
    },
    bio: '宠物训练师，擅长拆家狗与社交训练',
    rating: 4.78,
    reviews: 189,
    dist: 3.4,
    city: '望京',
    features: ['认证4年', '训练师', '户外活动', '清洁消毒'],
    price: 138,
    unit: '晚',
    orders: 367,
    cert: true,
    reused: true,
    badge: null
  }, {
    id: 'g7',
    name: '王野 Yann',
    initial: {
      char: '野',
      bg: '#E8E3F2'
    },
    bio: '上门喂养专家，按时投喂铲屎换水换粮',
    rating: 4.74,
    reviews: 42,
    dist: 4.1,
    city: '酒仙桥',
    features: ['认证1年', '拍照报告'],
    price: 78,
    unit: '次',
    orders: 64,
    cert: false,
    reused: false,
    badge: null
  }, {
    id: 'g8',
    name: '若曦 Ruxi',
    initial: {
      char: '若',
      bg: LL.butter
    },
    bio: '兽医专业毕业，自家无其他宠物零干扰',
    rating: 4.71,
    reviews: 117,
    dist: 5.6,
    city: '亚运村',
    features: ['认证6年', '兽医背景', '清洁消毒'],
    price: 118,
    unit: '晚',
    orders: 248,
    cert: true,
    reused: false,
    badge: null
  }];

  // ── apply filters + sort ────────────────────────────────────
  const visible = React.useMemo(() => {
    const filtered = applyFilters(guardians, filters);
    const sorters = {
      '智能排序': (a, b) => b.rating - a.rating - (a.dist - b.dist) * 0.1,
      '距离由近到远': (a, b) => a.dist - b.dist,
      '评分由高到低': (a, b) => b.rating - a.rating,
      '价格由低到高': (a, b) => a.price - b.price,
      '价格由高到低': (a, b) => b.price - a.price
    };
    return [...filtered].sort(sorters[sort] || sorters['智能排序']);
  }, [filters, sort, guardians]);

  // close any popover on outside click
  React.useEffect(() => {
    if (!open) return;
    const close = () => setOpen(null);
    const t = setTimeout(() => document.addEventListener('click', close, {
      once: true
    }), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', close);
    };
  }, [open]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      background: LL.bg,
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 47,
      zIndex: 30,
      background: '#fff',
      boxShadow: '0 1px 0 rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '6px 12px 4px',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    "aria-label": "\u8FD4\u56DE",
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: 0,
      background: 'rgba(34,40,44,0.06)',
      color: LL.text,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 16
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.01em'
    }
  }, "\u641C\u7D22\u7ED3\u679C"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      fontWeight: 500
    }
  }, q.svcType, " \xB7 ", q.address)), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      flex: '0 0 auto'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px 6px'
    }
  }, /*#__PURE__*/React.createElement(CompactSearchSummary, {
    q: q,
    onPickField: onPickField
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 12px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(FilterButton, {
    count: countFilters(filters),
    onClick: () => setDrawerOpen(true)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(SortChip, {
    value: sort,
    isOpen: open === 'sort',
    onClick: () => setOpen(open === 'sort' ? null : 'sort')
  }), open === 'sort' && /*#__PURE__*/React.createElement(Popover, {
    anchor: "right",
    onPick: v => {
      setSort(v);
      setOpen(null);
    },
    value: sort,
    options: SORT_OPTS,
    offsetRight: 12
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      padding: '14px 16px 8px',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: LL.text2
    }
  }, "\u5171 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text,
      fontWeight: 700,
      fontSize: 15,
      fontVariantNumeric: 'tabular-nums'
    }
  }, visible.length), " \u4F4D\u5B88\u62A4\u8005"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      marginLeft: 'auto',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-map-pin",
    style: {
      fontSize: 12
    }
  }), q.address)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 12px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, visible.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      padding: '36px 24px',
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 36,
      marginBottom: 8
    }
  }, "\uD83D\uDD0D"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u6682\u65E0\u5339\u914D\u7684\u5B88\u62A4\u8005"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text2,
      marginTop: 4
    }
  }, "\u8BD5\u8BD5\u8C03\u6574\u7B5B\u9009\u6761\u4EF6\u6216\u6269\u5927\u641C\u7D22\u8303\u56F4")) : visible.map(g => /*#__PURE__*/React.createElement(GuardianCard, {
    key: g.id,
    g: g,
    onSelect: onSelectGuardian
  }))), /*#__PURE__*/React.createElement(FilterDrawer, {
    open: drawerOpen,
    filters: filters,
    matchCount: visible.length,
    onChange: setFilters,
    onClose: () => setDrawerOpen(false)
  }));
}

// ─────────────────────────────────────────────────────────────
// Compact 2-row search summary
// ─────────────────────────────────────────────────────────────
function CompactSearchSummary({
  q,
  onPickField
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      padding: '8px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(SummaryChip, {
    icon: "paw-print",
    value: q.petType,
    onClick: () => onPickField?.('petType'),
    flex: true
  }), /*#__PURE__*/React.createElement(SummaryDot, null), /*#__PURE__*/React.createElement(SummaryChip, {
    icon: "hand-heart",
    value: q.svcType,
    onClick: () => onPickField?.('svcType'),
    flex: true
  }), /*#__PURE__*/React.createElement(SummaryDot, null), /*#__PURE__*/React.createElement(SummaryChip, {
    icon: "map-pin",
    value: q.address,
    onClick: () => onPickField?.('address'),
    flex: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      borderTop: `1px dashed ${LL.border}`,
      paddingTop: 4
    }
  }, q.endDate ?
  /*#__PURE__*/
  // Form A — start → end (fields fill full width); nights inline as suffix
  React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(SummaryChip, {
    icon: "calendar-blank",
    value: q.startDate,
    onClick: () => onPickField?.('startDate'),
    flex: true
  }), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-arrow-right",
    style: {
      fontSize: 12,
      color: LL.text3,
      padding: '0 2px',
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement(SummaryChip, {
    value: q.endDate,
    onClick: () => onPickField?.('endDate'),
    flex: true
  }), q.nights > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 2,
      fontSize: 11,
      color: LL.text2,
      background: 'rgba(34,40,44,0.04)',
      borderRadius: 999,
      padding: '2px 8px',
      fontVariantNumeric: 'tabular-nums',
      flex: '0 0 auto'
    }
  }, q.nights, " ", q.unit)) :
  /*#__PURE__*/
  // Form B — date / 周几 only (time-period section removed)
  React.createElement(SummaryChip, {
    icon: "calendar-blank",
    value: q.startDate,
    onClick: () => onPickField?.('startDate'),
    flex: true
  })));
}
function SummaryChip({
  icon,
  value,
  onClick,
  flex = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      background: 'transparent',
      border: 0,
      padding: '4px 4px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer',
      fontFamily: LL.font,
      flex: flex ? 1 : '0 0 auto',
      minWidth: 0
    }
  }, icon && /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${icon}`,
    style: {
      fontSize: 13,
      color: LL.text2,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: LL.text,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, value), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-down",
    style: {
      fontSize: 10,
      color: LL.text3,
      flex: '0 0 auto'
    }
  }));
}
function SummaryDot() {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      height: 3,
      borderRadius: '50%',
      background: LL.text3,
      flex: '0 0 auto'
    }
  });
}

// ─────────────────────────────────────────────────────────────
// buildSummaryQuery — normalize HomeMarketplace's query shape
// (with dateRange / schedule) into the flat display object
// expected by CompactSearchSummary.
// ─────────────────────────────────────────────────────────────
function buildSummaryQuery(query) {
  // Sensible mock defaults when this screen is opened directly without
  // anybody having tapped Search — keeps the UI demo-able.
  if (!query) {
    return {
      petType: '狗',
      svcType: '寄养',
      address: '朝阳·三里屯',
      startDate: '5月22日 周三',
      endDate: '5月24日 周五',
      nights: 2,
      unit: '晚'
    };
  }
  const out = {
    petType: query.petType || '宠物',
    svcType: query.svcType || '服务',
    address: query.address || '地址'
  };
  const form = query.svcType ? SERVICE_FORM[query.svcType] || 'A' : 'A';
  if (form === 'A') {
    const {
      start,
      end
    } = query.dateRange || {};
    if (start && end) {
      out.startDate = fmtFull(start);
      out.endDate = fmtFull(end);
      out.nights = daysBetween(start, end);
      out.unit = SERVICE_UNIT[query.svcType] || '晚';
    } else {
      out.startDate = '选择开始';
      out.endDate = '选择结束';
      out.nights = 0;
      out.unit = '晚';
    }
  } else {
    const s = query.schedule || {};
    const WK = ['一', '二', '三', '四', '五', '六', '日'];
    if (s.type === 'once') {
      if (s.pickMode === 'single') {
        const days = (s.dates?.days || []).slice().sort((a, b) => a - b);
        out.startDate = days.length ? days.length <= 2 ? days.map(fmtShort).join('、') : `${fmtShort(days[0])} 等${days.length}天` : '选择日期';
      } else if (s.dates?.start) {
        out.startDate = s.dates.end ? `${fmtShort(s.dates.start)} → ${fmtShort(s.dates.end)}` : fmtFull(s.dates.start);
      } else {
        out.startDate = '选择日期';
      }
    } else {
      const wd = (s.weekdays || []).map(i => WK[i]).join('/');
      out.startDate = wd ? `每周 ${wd}` : '选择周几';
      if (s.dates?.start && s.dates?.end) out.startDate += ` · ${fmtShort(s.dates.start)}–${fmtShort(s.dates.end)}`;
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────
// FilterButton — single "筛选 (N)" trigger that opens FilterDrawer
// ─────────────────────────────────────────────────────────────
function FilterButton({
  count = 0,
  onClick
}) {
  const active = count > 0;
  return /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      height: 32,
      padding: '0 12px',
      borderRadius: 999,
      border: 0,
      background: active ? LL.ink : 'rgba(34,40,44,0.05)',
      color: active ? '#fff' : LL.text,
      fontSize: 13,
      fontWeight: active ? 700 : 600,
      fontFamily: LL.font,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-sliders-horizontal",
    style: {
      fontSize: 14
    }
  }), /*#__PURE__*/React.createElement("span", null, "\u7B5B\u9009"), count > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      background: '#fff',
      color: LL.ink,
      borderRadius: 999,
      padding: '0 6px',
      minWidth: 16,
      height: 16,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 10.5,
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums'
    }
  }, count));
}

// ─────────────────────────────────────────────────────────────
// Filter & sort chips
// ─────────────────────────────────────────────────────────────
function FilterChip({
  label,
  value,
  isOpen,
  onClick
}) {
  const active = value && value !== '全部';
  return /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      height: 30,
      padding: '0 10px',
      borderRadius: 999,
      border: 0,
      background: active ? LL.ink : 'rgba(34,40,44,0.05)',
      color: active ? '#fff' : LL.text,
      fontSize: 12.5,
      fontWeight: active ? 600 : 500,
      fontFamily: LL.font,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("span", null, active ? value : label), /*#__PURE__*/React.createElement("i", {
    className: `ph ph-caret-${isOpen ? 'up' : 'down'}`,
    style: {
      fontSize: 10
    }
  }));
}
function SortChip({
  value,
  isOpen,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      height: 30,
      padding: '0 10px',
      borderRadius: 999,
      border: 0,
      background: 'transparent',
      boxShadow: `inset 0 0 0 1px ${LL.border}`,
      color: LL.text,
      fontSize: 12.5,
      fontWeight: 500,
      fontFamily: LL.font,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-arrows-down-up",
    style: {
      fontSize: 12
    }
  }), /*#__PURE__*/React.createElement("span", null, value), /*#__PURE__*/React.createElement("i", {
    className: `ph ph-caret-${isOpen ? 'up' : 'down'}`,
    style: {
      fontSize: 10,
      color: LL.text3
    }
  }));
}

// ─────────────────────────────────────────────────────────────
// Popover (drops down from filter / sort chip)
// ─────────────────────────────────────────────────────────────
function Popover({
  anchor,
  offsetLeft,
  offsetRight,
  options,
  value,
  onPick
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: '100%',
      ...(anchor === 'left' ? {
        left: offsetLeft ?? 12
      } : {
        right: offsetRight ?? 12
      }),
      marginTop: 4,
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
      padding: 6,
      minWidth: 168,
      zIndex: 80,
      fontFamily: LL.font
    }
  }, options.map(o => {
    const on = o === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      onClick: () => onPick(o),
      style: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: 10,
        border: 0,
        background: on ? 'rgba(34,40,44,0.06)' : 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: LL.font,
        fontSize: 13.5,
        fontWeight: on ? 700 : 500,
        color: on ? LL.text : LL.text2,
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("span", null, o), on && /*#__PURE__*/React.createElement("i", {
      className: "ph-fill ph-check-circle",
      style: {
        fontSize: 14,
        color: LL.ink
      }
    }));
  }));
}

// ─────────────────────────────────────────────────────────────
// Guardian Card
// ─────────────────────────────────────────────────────────────
function GuardianCard({
  g,
  onSelect
}) {
  const [favorited, setFavorited] = React.useState(g.favorited);
  return /*#__PURE__*/React.createElement("div", {
    onClick: () => onSelect?.(g),
    style: {
      background: '#fff',
      borderRadius: 16,
      padding: 14,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      fontFamily: LL.font,
      position: 'relative',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      setFavorited(!favorited);
    },
    "aria-label": "\u6536\u85CF",
    style: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: favorited ? LL.heart || '#E63946' : LL.text3
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `${favorited ? 'ph-fill' : 'ph'} ph-heart`,
    style: {
      fontSize: 20
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: '0 0 auto'
    }
  }, g.photo ? /*#__PURE__*/React.createElement("img", {
    src: g.photo,
    alt: g.name,
    style: {
      width: 64,
      height: 72,
      borderRadius: 14,
      objectFit: 'cover',
      background: LL.butter,
      display: 'block'
    },
    onError: e => {
      // graceful fallback to colored initial if photo fails
      const fallback = document.createElement('div');
      fallback.innerText = g.name[0];
      fallback.style.cssText = 'width:64px;height:72px;border-radius:14px;background:#FEE7A6;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:26px;color:#1E1E24;';
      e.target.replaceWith(fallback);
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 72,
      borderRadius: 14,
      background: g.initial.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 26,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.02em'
    }
  }, g.initial.char), g.cert && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: -4,
      bottom: -4,
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "8",
    r: "7.5",
    fill: "#2C7A4B"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.6 8.2 L7 10.5 L11.6 5.8",
    stroke: "#fff",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      paddingRight: 32,
      display: 'flex',
      flexDirection: 'column',
      alignSelf: 'stretch',
      minHeight: 72
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.01em'
    }
  }, g.name), g.badge && /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'linear-gradient(135deg, #FEE7A6, #FBD3C4)',
      color: '#7A4F1A',
      fontSize: 10,
      fontWeight: 700,
      padding: '2px 7px',
      borderRadius: 4,
      letterSpacing: '0.04em'
    }
  }, g.badge, "\u5B88\u62A4\u8005")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 12,
      color: LL.text2,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      fontVariantNumeric: 'tabular-nums'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-star",
    style: {
      fontSize: 12,
      color: '#F0B100'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: LL.text
    }
  }, g.rating.toFixed(1)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text3
    }
  }, "(", g.reviews, ")")), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 2,
      height: 2,
      borderRadius: '50%',
      background: LL.text3
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontVariantNumeric: 'tabular-nums'
    }
  }, g.dist, " km"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text3
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, g.city)), g.bio && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      fontSize: 12,
      color: LL.text2,
      lineHeight: 1.4,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, g.bio, g.bio.endsWith('…') || g.bio.endsWith('...') ? '' : '…'))), (g.reused || g.features && g.features.length > 0) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'nowrap',
      overflow: 'hidden',
      marginTop: -4
    }
  }, g.reused && /*#__PURE__*/React.createElement(FeatureTag, {
    label: "\u6258\u4ED8\u8FC7",
    category: "relation"
  }), g.features && g.features.map(f => /*#__PURE__*/React.createElement(FeatureTag, {
    key: f,
    label: f,
    category: categorizeTag(f)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      borderTop: `1px solid ${LL.border}`,
      paddingTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: LL.text2
    }
  }, "\xA5"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.02em',
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 1
    }
  }, g.price), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: LL.text2,
      marginLeft: 2
    }
  }, "/ ", g.unit, "\u8D77")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text2,
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u5DF2\u670D\u52A1"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: LL.text,
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums'
    }
  }, g.orders), /*#__PURE__*/React.createElement("span", null, "\u5355"))));
}

// ─────────────────────────────────────────────────────────────
// Tag categorization — groups feature labels by semantic category
// so similar tags get the same color in the card row.
// ─────────────────────────────────────────────────────────────
function categorizeTag(label) {
  if (/认证|急救|兽医|训练师/.test(label)) return 'credential'; // green
  if (/监控|消毒|清洁|无其他|香波|围栏|院子/.test(label)) return 'facility'; // blue
  if (/户外|拍照|视频|报告|遛狗|打卡/.test(label)) return 'service'; // butter
  return 'neutral';
}
function FeatureTag({
  label,
  category
}) {
  const palette = {
    relation: {
      bg: '#EDE5F7',
      fg: '#5E4A87'
    },
    // 托付过 — lavender
    credential: {
      bg: '#E6F1EC',
      fg: '#2C7A4B'
    },
    // 认证 / 急救 / 兽医 — green
    facility: {
      bg: '#E3EEF7',
      fg: '#2F5F87'
    },
    // 监控 / 消毒 — blue
    service: {
      bg: '#FBEFD2',
      fg: '#7A5A1A'
    },
    // 户外 / 拍照 — butter
    neutral: {
      bg: 'rgba(34,40,44,0.05)',
      fg: LL.text2
    }
  };
  const c = palette[category] || palette.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 500,
      color: c.fg,
      background: c.bg,
      borderRadius: 4,
      padding: '3px 8px',
      whiteSpace: 'nowrap',
      flex: '0 0 auto'
    }
  }, label);
}

// ─────────────────────────────────────────────────────────────
// Mini badge (used for availability / favorite / reused markers)
// ─────────────────────────────────────────────────────────────
function Badge({
  tone = 'muted',
  icon,
  children
}) {
  const tones = {
    success: {
      bg: '#E6F1EC',
      fg: '#2C7A4B'
    },
    muted: {
      bg: '#F0F0F5',
      fg: LL.text2
    },
    heart: {
      bg: '#FCE6E8',
      fg: '#C2384A'
    },
    lavender: {
      bg: '#EDE5F7',
      fg: '#5E4A87'
    }
  };
  const t = tones[tone] || tones.muted;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: t.bg,
      color: t.fg,
      borderRadius: 999,
      padding: '3px 9px',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.01em',
      fontFamily: LL.font
    }
  }, icon && /*#__PURE__*/React.createElement("i", {
    className: `ph-fill ph-${icon}`,
    style: {
      fontSize: 11
    }
  }), /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(window, {
  SearchResultsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/SearchResultsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/SearchResultsScreen.standalone.jsx
try { (() => {
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

function SearchResultsScreen({
  onBack,
  query,
  onPickField
}) {
  // ── pulled in from the marketplace search card ───────────────
  const q = query || {
    petType: '狗',
    svcType: '寄养',
    address: '朝阳·三里屯',
    startDate: '5月22日 周三',
    endDate: '5月24日 周五',
    nights: 2
  };

  // ── filter state ────────────────────────────────────────────
  const [distance, setDistance] = React.useState('全部');
  const [rating, setRating] = React.useState('全部');
  const [price, setPrice] = React.useState('全部');
  const [sort, setSort] = React.useState('智能排序');
  const [open, setOpen] = React.useState(null); // 'distance' | 'rating' | 'price' | 'sort' | null

  const DISTANCE_OPTS = ['全部', '< 1 km', '< 3 km', '< 5 km', '< 10 km'];
  const RATING_OPTS = ['全部', '≥ 4.5', '≥ 4.8', '5.0'];
  const PRICE_OPTS = ['全部', '≤ ¥100', '¥100 – 200', '¥200 – 300', '> ¥300'];
  const SORT_OPTS = ['智能排序', '距离由近到远', '评分由高到低', '价格由低到高', '价格由高到低'];

  // ── mock data: 8 guardians ───────────────────────────────
  // Real Asian portraits sourced from Unsplash (verified). The system also
  // uses on-brand pastel initial circles (matching the existing GuardianRow
  // pattern) for the remaining slots — a realistic mix for a Chinese
  // mini-program listing. Replace `initial:{...}` with `photo:photo(...)` once
  // brand photography is supplied.
  const photo = id => window.__resources && window.__resources[`photo_${id}`] || `https://images.unsplash.com/photo-${id}?w=240&h=240&fit=crop&crop=faces&auto=format&q=70`;
  const guardians = [{
    id: 'g1',
    name: '林若 Lily',
    photo: photo('1568822617270-2c1579f8dfe2'),
    bio: '养狗6年，专业寄养经验3年，自家带院子',
    rating: 4.97,
    reviews: 128,
    dist: 0.8,
    city: '三里屯',
    features: ['认证5年', '户外活动', '清洁消毒'],
    price: 168,
    unit: '晚',
    orders: 412,
    cert: true,
    reused: true,
    badge: '金牌'
  }, {
    id: 'g2',
    name: '阿浩 Hao',
    initial: {
      char: '浩',
      bg: LL.peach
    },
    bio: '宠物医院实习两年，懂日常喂养与急救',
    rating: 4.92,
    reviews: 96,
    dist: 1.2,
    city: '工体北',
    features: ['认证2年', '24h智能监控', '急救认证'],
    price: 148,
    unit: '晚',
    orders: 286,
    cert: true,
    reused: true,
    badge: null
  }, {
    id: 'g3',
    name: '桃子 Joy',
    initial: {
      char: '桃',
      bg: LL.butter
    },
    bio: '家有两只布偶，擅长猫咪日托与上门喂养',
    rating: 4.89,
    reviews: 74,
    dist: 1.6,
    city: '东直门',
    features: ['认证3年', '清洁消毒', '无其他宠物'],
    price: 88,
    unit: '天',
    orders: 151,
    cert: true,
    reused: false,
    badge: null
  }, {
    id: 'g4',
    name: '陈逸 Yi',
    photo: photo('1542909192-2f2241a99c9d'),
    bio: '住家守护8年，接待中大型犬，提供日常视频',
    rating: 4.86,
    reviews: 212,
    dist: 2.3,
    city: '国贸',
    features: ['认证8年', '24h智能监控', '户外活动', '清洁消毒'],
    price: 228,
    unit: '晚',
    orders: 534,
    cert: true,
    reused: false,
    badge: '金牌'
  }, {
    id: 'g5',
    name: '小米 Mia',
    initial: {
      char: '米',
      bg: LL.lavender
    },
    bio: '养小型犬5年，每日两次遛狗+拍照打卡',
    rating: 4.81,
    reviews: 58,
    dist: 2.7,
    city: '朝阳门',
    features: ['认证1年', '户外活动'],
    price: 128,
    unit: '晚',
    orders: 103,
    cert: false,
    reused: false,
    badge: null
  }, {
    id: 'g6',
    name: '阿哲 Zhe',
    initial: {
      char: '哲',
      bg: LL.mint
    },
    bio: '宠物训练师，擅长拆家狗与社交训练',
    rating: 4.78,
    reviews: 189,
    dist: 3.4,
    city: '望京',
    features: ['认证4年', '训练师', '户外活动', '清洁消毒'],
    price: 138,
    unit: '晚',
    orders: 367,
    cert: true,
    reused: true,
    badge: null
  }, {
    id: 'g7',
    name: '王野 Yann',
    initial: {
      char: '野',
      bg: '#E8E3F2'
    },
    bio: '上门喂养专家，按时投喂铲屎换水换粮',
    rating: 4.74,
    reviews: 42,
    dist: 4.1,
    city: '酒仙桥',
    features: ['认证1年', '拍照报告'],
    price: 78,
    unit: '次',
    orders: 64,
    cert: false,
    reused: false,
    badge: null
  }, {
    id: 'g8',
    name: '若曦 Ruxi',
    initial: {
      char: '若',
      bg: LL.butter
    },
    bio: '兽医专业毕业，自家无其他宠物零干扰',
    rating: 4.71,
    reviews: 117,
    dist: 5.6,
    city: '亚运村',
    features: ['认证6年', '兽医背景', '清洁消毒'],
    price: 118,
    unit: '晚',
    orders: 248,
    cert: true,
    reused: false,
    badge: null
  }];

  // close any popover on outside click
  React.useEffect(() => {
    if (!open) return;
    const close = () => setOpen(null);
    const t = setTimeout(() => document.addEventListener('click', close, {
      once: true
    }), 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener('click', close);
    };
  }, [open]);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      background: LL.bg,
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 30,
      background: '#fff',
      paddingTop: 47,
      marginTop: -47,
      boxShadow: '0 1px 0 rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '0 14px 4px',
      gap: 8,
      marginTop: -8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    "aria-label": "\u8FD4\u56DE",
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: 0,
      background: 'rgba(34,40,44,0.06)',
      color: LL.text,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-left",
    style: {
      fontSize: 16
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 28,
      height: 28,
      borderRadius: 8,
      background: LL.ink,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: 15
    }
  }, "\uD83D\uDC3E"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 17,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.01em'
    }
  }, "Lou Lou")), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      flex: '0 0 auto'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      padding: '2px 14px 8px',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(CompactSearchSummary, {
    q: q,
    onPickField: onPickField
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 12px 10px',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement(FilterChip, {
    label: "\u8DDD\u79BB",
    value: distance,
    isOpen: open === 'distance',
    onClick: () => setOpen(open === 'distance' ? null : 'distance')
  }), /*#__PURE__*/React.createElement(FilterChip, {
    label: "\u8BC4\u5206",
    value: rating,
    isOpen: open === 'rating',
    onClick: () => setOpen(open === 'rating' ? null : 'rating')
  }), /*#__PURE__*/React.createElement(FilterChip, {
    label: "\u4EF7\u683C",
    value: price,
    isOpen: open === 'price',
    onClick: () => setOpen(open === 'price' ? null : 'price')
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement(SortChip, {
    value: sort,
    isOpen: open === 'sort',
    onClick: () => setOpen(open === 'sort' ? null : 'sort')
  }), open === 'distance' && /*#__PURE__*/React.createElement(Popover, {
    anchor: "left",
    onPick: v => {
      setDistance(v);
      setOpen(null);
    },
    value: distance,
    options: DISTANCE_OPTS,
    offsetLeft: 12
  }), open === 'rating' && /*#__PURE__*/React.createElement(Popover, {
    anchor: "left",
    onPick: v => {
      setRating(v);
      setOpen(null);
    },
    value: rating,
    options: RATING_OPTS,
    offsetLeft: 76
  }), open === 'price' && /*#__PURE__*/React.createElement(Popover, {
    anchor: "left",
    onPick: v => {
      setPrice(v);
      setOpen(null);
    },
    value: price,
    options: PRICE_OPTS,
    offsetLeft: 140
  }), open === 'sort' && /*#__PURE__*/React.createElement(Popover, {
    anchor: "right",
    onPick: v => {
      setSort(v);
      setOpen(null);
    },
    value: sort,
    options: SORT_OPTS,
    offsetRight: 12
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      padding: '14px 16px 8px',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: LL.text2
    }
  }, "\u5171 ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text,
      fontWeight: 700,
      fontSize: 15,
      fontVariantNumeric: 'tabular-nums'
    }
  }, guardians.length), " \u4F4D\u5B88\u62A4\u8005"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11.5,
      color: LL.text3,
      marginLeft: 'auto',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-map-pin",
    style: {
      fontSize: 12
    }
  }), q.address)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 12px 28px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, guardians.map(g => /*#__PURE__*/React.createElement(GuardianCard, {
    key: g.id,
    g: g
  }))));
}

// ─────────────────────────────────────────────────────────────
// Compact 2-row search summary
// ─────────────────────────────────────────────────────────────
function CompactSearchSummary({
  q,
  onPickField
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      padding: '8px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(SummaryChip, {
    icon: "paw-print",
    value: q.petType,
    onClick: () => onPickField?.('petType')
  }), /*#__PURE__*/React.createElement(SummaryDot, null), /*#__PURE__*/React.createElement(SummaryChip, {
    icon: "hand-heart",
    value: q.svcType,
    onClick: () => onPickField?.('svcType')
  }), /*#__PURE__*/React.createElement(SummaryDot, null), /*#__PURE__*/React.createElement(SummaryChip, {
    icon: "map-pin",
    value: q.address,
    onClick: () => onPickField?.('address'),
    flex: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      borderTop: `1px dashed ${LL.border}`,
      paddingTop: 4
    }
  }, /*#__PURE__*/React.createElement(SummaryChip, {
    icon: "calendar-blank",
    value: q.startDate,
    onClick: () => onPickField?.('startDate')
  }), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-arrow-right",
    style: {
      fontSize: 12,
      color: LL.text3,
      padding: '0 2px'
    }
  }), /*#__PURE__*/React.createElement(SummaryChip, {
    value: q.endDate,
    onClick: () => onPickField?.('endDate')
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      fontSize: 11,
      color: LL.text2,
      background: 'rgba(34,40,44,0.04)',
      borderRadius: 999,
      padding: '2px 8px',
      fontVariantNumeric: 'tabular-nums'
    }
  }, q.nights, " \u665A")));
}
function SummaryChip({
  icon,
  value,
  onClick,
  flex = false
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      background: 'transparent',
      border: 0,
      padding: '4px 4px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer',
      fontFamily: LL.font,
      flex: flex ? 1 : '0 0 auto',
      minWidth: 0
    }
  }, icon && /*#__PURE__*/React.createElement("i", {
    className: `ph ph-${icon}`,
    style: {
      fontSize: 13,
      color: LL.text2,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      color: LL.text,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, value), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-down",
    style: {
      fontSize: 10,
      color: LL.text3,
      flex: '0 0 auto'
    }
  }));
}
function SummaryDot() {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: 3,
      height: 3,
      borderRadius: '50%',
      background: LL.text3,
      flex: '0 0 auto'
    }
  });
}

// ─────────────────────────────────────────────────────────────
// Filter & sort chips
// ─────────────────────────────────────────────────────────────
function FilterChip({
  label,
  value,
  isOpen,
  onClick
}) {
  const active = value && value !== '全部';
  return /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      height: 30,
      padding: '0 10px',
      borderRadius: 999,
      border: 0,
      background: active ? LL.ink : 'rgba(34,40,44,0.05)',
      color: active ? '#fff' : LL.text,
      fontSize: 12.5,
      fontWeight: active ? 600 : 500,
      fontFamily: LL.font,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("span", null, active ? value : label), /*#__PURE__*/React.createElement("i", {
    className: `ph ph-caret-${isOpen ? 'up' : 'down'}`,
    style: {
      fontSize: 10
    }
  }));
}
function SortChip({
  value,
  isOpen,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      onClick();
    },
    style: {
      height: 30,
      padding: '0 10px',
      borderRadius: 999,
      border: 0,
      background: 'transparent',
      boxShadow: `inset 0 0 0 1px ${LL.border}`,
      color: LL.text,
      fontSize: 12.5,
      fontWeight: 500,
      fontFamily: LL.font,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-arrows-down-up",
    style: {
      fontSize: 12
    }
  }), /*#__PURE__*/React.createElement("span", null, value), /*#__PURE__*/React.createElement("i", {
    className: `ph ph-caret-${isOpen ? 'up' : 'down'}`,
    style: {
      fontSize: 10,
      color: LL.text3
    }
  }));
}

// ─────────────────────────────────────────────────────────────
// Popover (drops down from filter / sort chip)
// ─────────────────────────────────────────────────────────────
function Popover({
  anchor,
  offsetLeft,
  offsetRight,
  options,
  value,
  onPick
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => e.stopPropagation(),
    style: {
      position: 'absolute',
      top: '100%',
      ...(anchor === 'left' ? {
        left: offsetLeft ?? 12
      } : {
        right: offsetRight ?? 12
      }),
      marginTop: 4,
      background: '#fff',
      borderRadius: 14,
      boxShadow: '0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
      padding: 6,
      minWidth: 168,
      zIndex: 80,
      fontFamily: LL.font
    }
  }, options.map(o => {
    const on = o === value;
    return /*#__PURE__*/React.createElement("button", {
      key: o,
      onClick: () => onPick(o),
      style: {
        width: '100%',
        padding: '10px 12px',
        borderRadius: 10,
        border: 0,
        background: on ? 'rgba(34,40,44,0.06)' : 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: LL.font,
        fontSize: 13.5,
        fontWeight: on ? 700 : 500,
        color: on ? LL.text : LL.text2,
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("span", null, o), on && /*#__PURE__*/React.createElement("i", {
      className: "ph-fill ph-check-circle",
      style: {
        fontSize: 14,
        color: LL.ink
      }
    }));
  }));
}

// ─────────────────────────────────────────────────────────────
// Guardian Card
// ─────────────────────────────────────────────────────────────
function GuardianCard({
  g
}) {
  const [favorited, setFavorited] = React.useState(g.favorited);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: '#fff',
      borderRadius: 16,
      padding: 14,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      fontFamily: LL.font,
      position: 'relative',
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: e => {
      e.stopPropagation();
      setFavorited(!favorited);
    },
    "aria-label": "\u6536\u85CF",
    style: {
      position: 'absolute',
      top: 12,
      right: 12,
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: 'transparent',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: favorited ? LL.heart || '#E63946' : LL.text3
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: `${favorited ? 'ph-fill' : 'ph'} ph-heart`,
    style: {
      fontSize: 20
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: '0 0 auto'
    }
  }, g.photo ? /*#__PURE__*/React.createElement("img", {
    src: g.photo,
    alt: g.name,
    style: {
      width: 64,
      height: 72,
      borderRadius: 14,
      objectFit: 'cover',
      background: LL.butter,
      display: 'block'
    },
    onError: e => {
      // graceful fallback to colored initial if photo fails
      const fallback = document.createElement('div');
      fallback.innerText = g.name[0];
      fallback.style.cssText = 'width:64px;height:72px;border-radius:14px;background:#FEE7A6;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:26px;color:#1E1E24;';
      e.target.replaceWith(fallback);
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 72,
      borderRadius: 14,
      background: g.initial.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 26,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.02em'
    }
  }, g.initial.char), g.cert && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: -4,
      bottom: -4,
      width: 22,
      height: 22,
      borderRadius: '50%',
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "8",
    cy: "8",
    r: "7.5",
    fill: "#2C7A4B"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4.6 8.2 L7 10.5 L11.6 5.8",
    stroke: "#fff",
    strokeWidth: "2.4",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    fill: "none"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      paddingRight: 32,
      display: 'flex',
      flexDirection: 'column',
      alignSelf: 'stretch',
      minHeight: 72
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.01em'
    }
  }, g.name), g.badge && /*#__PURE__*/React.createElement("span", {
    style: {
      background: 'linear-gradient(135deg, #FEE7A6, #FBD3C4)',
      color: '#7A4F1A',
      fontSize: 10,
      fontWeight: 700,
      padding: '2px 7px',
      borderRadius: 4,
      letterSpacing: '0.04em'
    }
  }, g.badge, "\u5B88\u62A4\u8005")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 12,
      color: LL.text2,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      fontVariantNumeric: 'tabular-nums'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph-fill ph-star",
    style: {
      fontSize: 12,
      color: '#F0B100'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 700,
      color: LL.text
    }
  }, g.rating.toFixed(1)), /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text3
    }
  }, "(", g.reviews, ")")), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 2,
      height: 2,
      borderRadius: '50%',
      background: LL.text3
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontVariantNumeric: 'tabular-nums'
    }
  }, g.dist, " km"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: LL.text3
    }
  }, "\xB7"), /*#__PURE__*/React.createElement("span", null, g.city)), g.bio && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      fontSize: 12,
      color: LL.text2,
      lineHeight: 1.4,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    }
  }, g.bio, g.bio.endsWith('…') || g.bio.endsWith('...') ? '' : '…'))), (g.reused || g.features && g.features.length > 0) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'nowrap',
      overflow: 'hidden',
      marginTop: -4
    }
  }, g.reused && /*#__PURE__*/React.createElement(FeatureTag, {
    label: "\u6258\u4ED8\u8FC7",
    category: "relation"
  }), g.features && g.features.map(f => /*#__PURE__*/React.createElement(FeatureTag, {
    key: f,
    label: f,
    category: categorizeTag(f)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      borderTop: `1px solid ${LL.border}`,
      paddingTop: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: LL.text2
    }
  }, "\xA5"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 22,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.02em',
      fontVariantNumeric: 'tabular-nums',
      lineHeight: 1
    }
  }, g.price), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11.5,
      color: LL.text2,
      marginLeft: 2
    }
  }, "/ ", g.unit, "\u8D77")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: LL.text2,
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u5DF2\u670D\u52A1"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      color: LL.text,
      fontWeight: 700,
      fontVariantNumeric: 'tabular-nums'
    }
  }, g.orders), /*#__PURE__*/React.createElement("span", null, "\u5355"))));
}

// ─────────────────────────────────────────────────────────────
// Tag categorization — groups feature labels by semantic category
// so similar tags get the same color in the card row.
// ─────────────────────────────────────────────────────────────
function categorizeTag(label) {
  if (/认证|急救|兽医|训练师/.test(label)) return 'credential'; // green
  if (/监控|消毒|清洁|无其他|香波|围栏|院子/.test(label)) return 'facility'; // blue
  if (/户外|拍照|视频|报告|遛狗|打卡/.test(label)) return 'service'; // butter
  return 'neutral';
}
function FeatureTag({
  label,
  category
}) {
  const palette = {
    relation: {
      bg: '#EDE5F7',
      fg: '#5E4A87'
    },
    // 托付过 — lavender
    credential: {
      bg: '#E6F1EC',
      fg: '#2C7A4B'
    },
    // 认证 / 急救 / 兽医 — green
    facility: {
      bg: '#E3EEF7',
      fg: '#2F5F87'
    },
    // 监控 / 消毒 — blue
    service: {
      bg: '#FBEFD2',
      fg: '#7A5A1A'
    },
    // 户外 / 拍照 — butter
    neutral: {
      bg: 'rgba(34,40,44,0.05)',
      fg: LL.text2
    }
  };
  const c = palette[category] || palette.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 500,
      color: c.fg,
      background: c.bg,
      borderRadius: 4,
      padding: '3px 8px',
      whiteSpace: 'nowrap',
      flex: '0 0 auto'
    }
  }, label);
}

// ─────────────────────────────────────────────────────────────
// Mini badge (used for availability / favorite / reused markers)
// ─────────────────────────────────────────────────────────────
function Badge({
  tone = 'muted',
  icon,
  children
}) {
  const tones = {
    success: {
      bg: '#E6F1EC',
      fg: '#2C7A4B'
    },
    muted: {
      bg: '#F0F0F5',
      fg: LL.text2
    },
    heart: {
      bg: '#FCE6E8',
      fg: '#C2384A'
    },
    lavender: {
      bg: '#EDE5F7',
      fg: '#5E4A87'
    }
  };
  const t = tones[tone] || tones.muted;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      background: t.bg,
      color: t.fg,
      borderRadius: 999,
      padding: '3px 9px',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.01em',
      fontFamily: LL.font
    }
  }, icon && /*#__PURE__*/React.createElement("i", {
    className: `ph-fill ph-${icon}`,
    style: {
      fontSize: 11
    }
  }), /*#__PURE__*/React.createElement("span", null, children));
}
Object.assign(window, {
  SearchResultsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/SearchResultsScreen.standalone.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/app.jsx
try { (() => {
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
function App({
  setTopBarLeading
}) {
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
  // Order modify screen (修改订单)
  const [modifyApp, setModifyApp] = React.useState(null);
  // Review screen (评价守护者) — opened from a completed order card's 写评论
  const [reviewApp, setReviewApp] = React.useState(null);
  // Process guide overlay (流程指引)
  const [showGuide, setShowGuide] = React.useState(false);

  // ── Pet reminder + pets overlay ───────────────────────────
  const [showPetReminder, setShowPetReminder] = React.useState(false);
  const [pendingBooking, setPendingBooking] = React.useState(null);
  const [showPetsOverlay, setShowPetsOverlay] = React.useState(false);
  const [petsForBooking, setPetsForBooking] = React.useState(false);
  // New user — no pet profile filled in yet
  const [userPets, setUserPets] = React.useState([]);

  // ── Scroll container ref (passed to GuardianProfileScreen for tab scroll memory)
  const scrollRef = React.useRef(null);

  // ── Application state ─────────────────────────────────────
  const [draftGuardians, setDraftGuardians] = React.useState([]);
  const [draftConfig, setDraftConfig] = React.useState({
    service: '寄养',
    pet: '狗·豆豆',
    dateStart: '5月28日',
    dateEnd: '5月30日',
    area: '朝阳区·望京'
  });
  const [sentApps, setSentApps] = React.useState([{
    id: 'app-done-demo',
    guardian: {
      id: 'r2',
      name: '陈逸',
      photo: './assets/guardian2.png',
      bg: '#EDE5F7',
      services: []
    },
    service: '寄养',
    pet: '狗·豆豆',
    dateStart: '4月10日',
    dateEnd: '4月12日',
    area: '朝阳区·望京',
    status: 'completed',
    messages: [{
      id: 1,
      from: 'system',
      text: '服务已完成，感谢您的信任',
      time: '4月12日'
    }, {
      id: 2,
      from: 'guardian',
      text: '豆豆很乖，期待下次再见～',
      time: '4月12日'
    }]
  }]);
  const [ordersBadge, setOrdersBadge] = React.useState(false);
  const [chatBadge, setChatBadge] = React.useState(false);

  // Prevent double-simulating guardian responses
  const simulatedRef = React.useRef(new Set());

  // ── Toast ─────────────────────────────────────────────────
  const [toast, setToast] = React.useState(null);
  const showToast = msg => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  // ── Simulate guardian responses ───────────────────────────
  React.useEffect(() => {
    sentApps.forEach(app => {
      if (app.status !== 'pending') return;
      if (simulatedRef.current.has(app.id)) return;
      simulatedRef.current.add(app.id);

      // Primary guardian (the one you booked) accepts after 3 s; extra
      // recommended guardians reject after 5 s. 陈逸 (r2) also auto-accepts.
      const accepted = app.isPrimary === true || app.guardian.id === 'r2';
      const delay = accepted ? 3000 : 5000;
      setTimeout(() => {
        setSentApps(prev => prev.map(a => {
          if (a.id !== app.id) return a;
          return {
            ...a,
            status: accepted ? 'accepted' : 'rejected',
            messages: accepted ? [...a.messages, {
              id: Date.now(),
              from: 'guardian',
              text: '您好！很开心认识您和豆豆。五月底我正好有空，很愿意照顾它。请问豆豆有什么特别需要注意的地方吗？',
              time: fmtNow()
            }] : a.messages
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
  const addToDraft = guardian => {
    setDraftGuardians(prev => prev.find(g => g.id === guardian.id) ? prev : [...prev, guardian]);
    // Pre-fill config from search query
    if (searchQuery) {
      setDraftConfig(c => ({
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
  const removeFromDraft = id => setDraftGuardians(prev => prev.filter(g => g.id !== id));
  const updateDraftConfig = (field, value) => setDraftConfig(c => ({
    ...c,
    [field]: value
  }));
  const sendApplications = guardianIds => {
    const toSend = draftGuardians.filter(g => guardianIds.includes(g.id));
    const newApps = toSend.map(g => ({
      id: `app-${Date.now()}-${g.id}`,
      guardian: g,
      service: draftConfig.service,
      pet: draftConfig.pet,
      dateStart: draftConfig.dateStart,
      dateEnd: draftConfig.dateEnd,
      area: draftConfig.area,
      status: 'pending',
      messages: [{
        id: 1,
        from: 'system',
        text: `申请单已发送给 ${g.name}，等待守护者回复`,
        time: fmtNow()
      }]
    }));
    setSentApps(prev => [...prev, ...newApps]);
    setDraftGuardians([]);
    showToast(`申请单已发送给 ${toSend.length} 位守护者`);
  };
  const sendChatMessage = (appId, text) => {
    setSentApps(prev => prev.map(a => a.id !== appId ? a : {
      ...a,
      messages: [...a.messages, {
        id: Date.now(),
        from: 'user',
        text,
        time: fmtNow()
      }]
    }));
  };
  const openChat = appId => {
    setActiveChatId(appId);
    setChatBadge(false);
    // Adopt a display-only mock order into live state so its chat is interactive
    setSentApps(prev => {
      if (prev.find(a => a.id === appId)) return prev;
      const mock = (window.BRS_MOCK_APPS || []).find(a => a.id === appId);
      return mock ? [...prev, mock] : prev;
    });
  };

  // ── Record an order modification → auto chat message (either party) ──
  const recordModify = (appId, who = 'user') => {
    const shortId = String(appId).replace(/^app-/, '').slice(0, 8) || '000000';
    setSentApps(prev => prev.map(a => {
      if (a.id !== appId) return a;
      const label = who === 'user' ? '您' : a.guardian?.name || '守护者';
      return {
        ...a,
        messages: [...a.messages, {
          id: Date.now() + Math.random(),
          from: 'system',
          action: 'summary',
          text: `${label}已修改订单（编号 ${shortId}）`,
          time: fmtNow()
        }]
      };
    }));
    setChatBadge(true);
    setOrdersBadge(true);
  };
  const handleTabChange = t => {
    setTab(t);
    setSelectedGuardian(null);
    if (t === 'orders') setOrdersBadge(false);
    if (t === 'message') setChatBadge(false);
    if (t !== 'home') setHomeView('marketplace');
  };

  // ── Resolve a search-result guardian into a full profile record ──
  const resolveGuardian = g => {
    if (!g) return null;
    if (g.id === 'g6' || g.name && g.name.indexOf('阿哲') === 0) return window.ZHE_DATA;
    if (g.id === 'g4' || g.name && g.name.indexOf('陈逸') === 0) return window.CHEN_YI_DATA;
    // Generic fallback: borrow 陈逸's profile shell, override identity
    const base = window.CHEN_YI_DATA || {};
    return {
      ...base,
      id: g.id,
      name: (g.name || '').split(' ')[0] || base.name,
      initial: g.initial || {
        char: (g.name || '守')[0],
        bg: '#E8E3F2'
      },
      photo: null,
      photoKey: null,
      photos: []
    };
  };
  const handleSelectGuardian = g => setSelectedGuardian(resolveGuardian(g));

  // ── Confirm an order modification → update order + notify guardian ──
  const handleModifyConfirm = (app, changes) => {
    const shortId = String(app.id).replace(/^app-/, '').slice(0, 8) || '000000';
    const dl = changes.dateEnd && changes.dateEnd !== changes.dateStart ? `${changes.dateStart} → ${changes.dateEnd}` : changes.dateStart;
    setSentApps(prev => prev.map(a => {
      if (a.id !== app.id) return a;
      const msgs = [...(a.messages || []), {
        id: Date.now() + Math.random(),
        from: 'system',
        action: 'summary',
        text: `您修改了订单（编号 ${shortId}）：${changes.service} · ${dl}，等待守护者重新确认`,
        time: fmtNow()
      }, ...(changes.note ? [{
        id: Date.now() + Math.random() + 1,
        from: 'user',
        text: changes.note,
        time: fmtNow()
      }] : [])];
      return {
        ...a,
        service: changes.service,
        dateStart: changes.dateStart,
        dateEnd: changes.dateEnd,
        messages: msgs
      };
    }));
    setSummaryApp(s => s && s.id === app.id ? {
      ...s,
      service: changes.service,
      dateStart: changes.dateStart,
      dateEnd: changes.dateEnd
    } : s);
    setChatBadge(true);
    setOrdersBadge(true);
    setModifyApp(null);
    showToast('修改已提交，已发送提醒给守护者');
  };

  // ── Re-book a completed order → open booking flow with that guardian ──
  const handleRebook = app => {
    const g = resolveGuardian(app.guardian) || app.guardian;
    setSummaryApp(null);
    setReviewApp(null);
    setActiveChatId(null);
    setBookingGuardian(g);
    setBookingParams({
      service: app.service
    });
  };

  // ── Submit a guardian review (from 评价守护者 page) ──
  const handleSubmitReview = (app, data) => {
    setSentApps(prev => prev.map(a => a.id !== app.id ? a : {
      ...a,
      reviewed: true,
      messages: [...(a.messages || []), {
        id: Date.now() + Math.random(),
        from: 'system',
        text: `您给本次服务打了 ${data.stars} 星好评，感谢您的反馈`,
        time: fmtNow()
      }]
    }));
    setReviewApp(null);
    showToast('评价已提交，感谢您的反馈 🌟');
  };

  // ── Tab definitions ───────────────────────────────────────
  const Tab = {
    home: {
      label: '首页',
      icon: 'house',
      iconFill: 'house'
    },
    orders: {
      label: '订单',
      icon: 'receipt',
      iconFill: 'receipt',
      badge: ordersBadge
    },
    message: {
      label: '消息',
      icon: 'chat-circle-dots',
      iconFill: 'chat-circle-dots',
      badge: chatBadge
    },
    guard: {
      label: '守护时刻',
      icon: 'paw-print',
      iconFill: 'paw-print'
    },
    me: {
      label: '我的',
      icon: 'user',
      iconFill: 'user'
    }
  };

  // ── Screen routing ────────────────────────────────────────
  let screen;
  if (tab === 'home') {
    if (selectedGuardian) {
      screen = /*#__PURE__*/React.createElement(GuardianProfileScreen, {
        guardian: selectedGuardian,
        initialService: searchQuery?.svcType,
        onBack: () => setSelectedGuardian(null),
        scrollContainerRef: scrollRef
      });
    } else if (homeView === 'results') {
      screen = /*#__PURE__*/React.createElement(SearchResultsScreen, {
        query: searchQuery,
        setTopBarLeading: setTopBarLeading,
        onBack: () => setHomeView('marketplace'),
        onSelectGuardian: handleSelectGuardian,
        onPickField: f => showToast(`修改 ${f}`)
      });
    } else {
      screen = /*#__PURE__*/React.createElement(HomeMarketplaceScreen, {
        onSearch: q => {
          setSearchQuery(q);
          setHomeView('results');
        },
        onPickService: () => setSelectedGuardian(window.CHEN_YI_DATA || null),
        onPickField: f => showToast(`选择 ${f}`),
        onOpenGuide: () => setShowGuide(true)
      });
    }
  } else if (tab === 'orders') {
    screen = /*#__PURE__*/React.createElement(BookingRequestScreen, {
      draftGuardians: draftGuardians,
      draftConfig: draftConfig,
      onUpdateConfig: updateDraftConfig,
      onRemoveGuardian: removeFromDraft,
      sentApps: sentApps,
      onSend: sendApplications,
      onOpenChat: openChat,
      onOpenSummary: app => setSummaryApp(app),
      onRebook: handleRebook,
      onWriteReview: app => setReviewApp(app),
      onBrowseMore: () => {
        setTab('home');
        setHomeView('marketplace');
      }
    });
  } else if (tab === 'message') {
    screen = /*#__PURE__*/React.createElement(MessagesScreen, {
      sentApps: sentApps,
      onOpenChat: openChat
    });
  } else if (tab === 'guard') {
    screen = /*#__PURE__*/React.createElement(ActivityScreen, {
      onLog: () => showToast('已添加守护时刻 · +1'),
      onHistory: () => showToast('回顾历史 · 即将上线')
    });
  } else if (tab === 'me') {
    screen = /*#__PURE__*/React.createElement(ProfileScreen, null);
  }

  // Bottom padding: extra 64 when guardian profile (for booking bar)
  const scrollPB = 78;

  // ── Active chat (full screen, hides tab bar) ──────────────
  const activeApp = sentApps.find(a => a.id === activeChatId) || (window.BRS_MOCK_APPS || []).find(a => a.id === activeChatId);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '100%',
      overflow: 'hidden',
      background: LL.bg,
      fontFamily: LL.font,
      color: LL.text
    }
  }, modifyApp ? /*#__PURE__*/React.createElement(OrderModifyScreen, {
    app: modifyApp,
    pets: userPets,
    onClose: () => setModifyApp(null),
    onConfirm: handleModifyConfirm
  }) : reviewApp ? /*#__PURE__*/React.createElement(ReviewGuardianScreen, {
    app: reviewApp,
    onClose: () => setReviewApp(null),
    onSubmit: handleSubmitReview
  }) : showGuide ? /*#__PURE__*/React.createElement(ProcessGuideScreen, {
    onClose: () => setShowGuide(false),
    onStart: () => setShowGuide(false)
  }) : profileGuardian ?
  /*#__PURE__*/
  /* ── Guardian profile (opened from summary / orders, any tab) ── */
  React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      zIndex: 70,
      display: 'flex',
      flexDirection: 'column',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement(GuardianProfileScreen, {
    guardian: profileGuardian,
    onBack: () => setProfileGuardian(null)
  })) : summaryApp ?
  /*#__PURE__*/
  /* ── Booking Summary (top priority — can open from chat or orders) ── */
  React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      display: 'flex',
      flexDirection: 'column',
      background: LL.bg
    }
  }, /*#__PURE__*/React.createElement(BookingSummaryScreen, {
    app: summaryApp,
    onBack: () => setSummaryApp(null),
    onViewGuardian: g => {
      const gg = g || summaryApp.guardian;
      // Order-attached guardians are thin (name/photo only) — back them
      // with the full profile record so GuardianProfileScreen renders safely.
      const full = gg && gg.bio && gg.home ? gg : {
        ...CHEN_YI_DATA,
        name: gg?.name || CHEN_YI_DATA.name,
        photo: gg?.photo || CHEN_YI_DATA.photo,
        id: gg?.id || CHEN_YI_DATA.id
      };
      setProfileGuardian(full);
    },
    onModify: a => setModifyApp(a),
    onRebook: handleRebook
  })) : activeChatId && activeApp ?
  /*#__PURE__*/
  /* ── Chat view (full-screen, no tab bar) ── */
  React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      display: 'flex',
      flexDirection: 'column',
      background: LL.bg
    }
  }, /*#__PURE__*/React.createElement(ChatView, {
    app: activeApp,
    onBack: () => setActiveChatId(null),
    onSendMessage: txt => sendChatMessage(activeChatId, txt),
    onOpenSummary: app => setSummaryApp(app),
    onModify: a => setModifyApp(a),
    onReview: () => showToast('感谢您的评价 🌟')
  })) : bookingGuardian ?
  /*#__PURE__*/
  /* ── Booking flow (full-screen, no tab bar) ── */
  React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      display: 'flex',
      flexDirection: 'column',
      background: LL.bg
    }
  }, /*#__PURE__*/React.createElement(BookingFlowScreen, {
    guardian: bookingGuardian,
    initialService: bookingParams?.service,
    initialDateRange: bookingParams?.dateRange,
    initialSchedule: bookingParams?.schedule,
    myPets: userPets,
    onBack: () => setBookingGuardian(null),
    onGoToOrders: () => {
      setBookingGuardian(null);
      setBookingParams(null);
      setSelectedGuardian(null);
      setTab('orders');
      setOrdersBadge(false);
    },
    onSubmit: data => {
      const g = bookingGuardian;
      const dr = data.dateRange;
      const batchId = `batch-${Date.now()}`;
      const batchTime = new Date();
      const makeApp = (gd, isPrimary) => ({
        id: `app-${Date.now()}-${gd.id}-${Math.random().toString(36).slice(2, 6)}`,
        orderNo: 'LL' + String(Date.now()).slice(-10) + String(Math.floor(Math.random() * 90) + 10),
        guardian: gd,
        isPrimary,
        service: data.service,
        pet: data.pet || '我的宠物',
        phone: data.phone || '',
        address: data.address || null,
        dateStart: dr?.start ? fmtDate(dr.start) : '待定',
        dateEnd: dr?.end ? fmtDate(dr.end) : null,
        area: data.address ? `${data.address.area || data.address.poi || ''}${data.address.detail ? ' ' + data.address.detail : ''}` : '朝阳区·望京',
        status: 'pending',
        batchId,
        batchTime,
        nights: data.nights || 0,
        price: data.unitPrice || 0,
        dropoff: data.dropoff || null,
        pickup: data.pickup || null,
        petBreakdown: data.petBreakdown || null,
        extrasList: data.extrasList || [],
        overtimeFee: data.overtimeFee || 0,
        overtimeRate: data.overtimeRate || 0,
        coupon: data.coupon || null,
        messages: [{
          id: 1,
          from: 'system',
          text: `预约请求已发送给 ${gd.name}，等待守护者回复`,
          time: appFmtNow()
        }, ...(data.message ? [{
          id: 2,
          from: 'user',
          text: data.message,
          time: appFmtNow()
        }] : [])]
      });
      const mainApp = makeApp(g, true);

      // Build apps for additionally recommended guardians
      const extraApps = (data.additionalGuardians || []).map(rec => {
        const recGuardian = {
          id: rec.id,
          name: rec.name,
          photo: rec.photo || null,
          rating: rec.rating,
          services: [{
            id: data.service,
            price: rec.price,
            unit: rec.unit
          }]
        };
        return makeApp(recGuardian, false);
      });
      setSentApps(prev => [...prev, mainApp, ...extraApps]);
      setChatBadge(true);
      setOrdersBadge(true);
    },
    onGoHome: () => {
      setBookingGuardian(null);
      setBookingParams(null);
      setSelectedGuardian(null);
      setTab('home');
      setHomeView('marketplace');
    }
  })) : showPetsOverlay ?
  /*#__PURE__*/
  /* ── Pets Screen overlay (opened from pet reminder) ── */
  React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      overflowY: 'auto',
      overflowX: 'hidden',
      background: LL.bg,
      zIndex: 40
    }
  }, /*#__PURE__*/React.createElement(PetsScreen, {
    pets: userPets,
    onPetsChange: setUserPets,
    initialView: petsForBooking ? 'add' : 'list',
    completeLabel: "\u4FDD\u5B58\u5E76\u7EE7\u7EED\u9884\u7EA6",
    onComplete: petsForBooking ? () => {
      setShowPetsOverlay(false);
      setPetsForBooking(false);
      if (pendingBooking) {
        setBookingGuardian(pendingBooking.guardian);
        setBookingParams(pendingBooking.params);
      }
    } : undefined,
    onBack: () => {
      setShowPetsOverlay(false);
      setPetsForBooking(false);
    }
  })) : tab === 'home' && homeView === 'results' && !selectedGuardian ?
  /*#__PURE__*/
  /* ── Search Results (own overlay, no tab bar) ── */
  React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      overflowY: 'auto',
      overflowX: 'hidden',
      background: LL.bg
    }
  }, /*#__PURE__*/React.createElement(SearchResultsScreen, {
    query: searchQuery,
    setTopBarLeading: setTopBarLeading,
    onBack: () => setHomeView('marketplace'),
    onSelectGuardian: handleSelectGuardian,
    onPickField: f => showToast(`修改 ${f}`)
  })) : tab === 'home' && selectedGuardian ?
  /*#__PURE__*/
  /* ── Guardian Profile (own overlay, no tab bar) ── */
  React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      display: 'flex',
      flexDirection: 'column',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement(GuardianProfileScreen, {
    guardian: selectedGuardian,
    initialService: searchQuery?.svcType,
    onBack: () => setSelectedGuardian(null)
  }), /*#__PURE__*/React.createElement(GuardianBookingBar, {
    guardian: selectedGuardian,
    initialService: searchQuery?.svcType,
    onBook: svcId => {
      const params = {
        service: svcId || searchQuery?.svcType,
        dateRange: searchQuery?.dateRange,
        schedule: searchQuery?.schedule
      };
      setPendingBooking({
        guardian: selectedGuardian,
        params
      });
      if (selectedGuardian.isNewUserFlow && userPets.length === 0) {
        // New user — prompt to fill in a pet profile first
        setShowPetReminder(true);
      } else {
        setBookingGuardian(selectedGuardian);
        setBookingParams(params);
      }
    }
  }), showPetReminder && /*#__PURE__*/React.createElement(PetReminderSheet, {
    onViewPets: () => {
      setShowPetReminder(false);
      setPetsForBooking(true);
      setShowPetsOverlay(true);
    },
    onContinue: () => {
      setShowPetReminder(false);
      setBookingGuardian(pendingBooking.guardian);
      setBookingParams(pendingBooking.params);
    },
    onDismiss: () => setShowPetReminder(false)
  })) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    ref: scrollRef,
    style: {
      position: 'absolute',
      inset: 0,
      paddingTop: 47,
      paddingBottom: scrollPB,
      overflowY: 'auto',
      overflowX: 'hidden'
    }
  }, screen), /*#__PURE__*/React.createElement(PhTabBar, {
    tabs: Tab,
    active: tab,
    onChange: handleTabChange
  })), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      bottom: 110,
      transform: 'translateX(-50%)',
      background: LL.ink,
      color: '#fff',
      padding: '10px 16px',
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 500,
      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      zIndex: 90,
      whiteSpace: 'nowrap'
    }
  }, toast));
}

// ─── Guardian booking bar (service + price, 修改 → service switch drawer) ──
function GuardianBookingBar({
  guardian,
  onBook,
  initialService
}) {
  const services = guardian.services || [];
  const init = initialService && services.some(s => s.id === initialService) ? initialService : services[0]?.id;
  const [svcId, setSvcId] = React.useState(init);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const svc = services.find(s => s.id === svcId) || services[0];
  if (!svc) return null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      background: '#fff',
      boxShadow: '0 -1px 0 #EEEEF2, 0 -4px 16px rgba(0,0,0,0.07)',
      display: 'flex',
      alignItems: 'flex-end',
      padding: '14px 16px 22px',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      marginBottom: 13
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 15,
      fontWeight: 800,
      color: LL.text
    }
  }, svc.id), /*#__PURE__*/React.createElement("button", {
    onClick: () => setDrawerOpen(true),
    style: {
      background: 'transparent',
      border: 0,
      padding: 0,
      cursor: 'pointer',
      fontFamily: LL.font,
      fontSize: 12.5,
      fontWeight: 600,
      color: LL.text2,
      textDecoration: 'underline',
      textUnderlineOffset: '2px'
    }
  }, "\u4FEE\u6539")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: LL.text2
    }
  }, "\u4ECE "), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20,
      fontWeight: 800,
      color: LL.text
    }
  }, "\xA5", svc.price), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }, "/", svc.unit, "\u8D77"))), /*#__PURE__*/React.createElement("button", {
    onClick: () => onBook(svcId),
    style: {
      height: 46,
      padding: '0 24px',
      borderRadius: 999,
      border: 0,
      background: LL.ink,
      color: '#fff',
      fontSize: 15,
      fontWeight: 700,
      fontFamily: LL.font,
      cursor: 'pointer',
      flex: '0 0 auto'
    }
  }, "\u7ACB\u5373\u9884\u7EA6")), drawerOpen && /*#__PURE__*/React.createElement(ServiceSwitchDrawer, {
    services: services,
    value: svcId,
    onPick: id => {
      setSvcId(id);
      setDrawerOpen(false);
    },
    onClose: () => setDrawerOpen(false)
  }));
}

// ─── Service switch drawer (grouped services + collapsed cancel policy) ──
function ServiceSwitchDrawer({
  services,
  value,
  onPick,
  onClose
}) {
  const [policyOpen, setPolicyOpen] = React.useState(false);
  const GROUPS = [{
    title: '在守护者家',
    ids: ['寄养', '日托'],
    theme: {
      solid: '#5B3A8F',
      bg: '#EDE5F7',
      fg: '#5B3A8F'
    }
  }, {
    title: '在宠物主家',
    ids: ['遛狗', '上门喂养', '伴宠留宿'],
    theme: {
      solid: '#2C7A4B',
      bg: '#E6F1EC',
      fg: '#236B40'
    }
  }];
  const byId = id => services.find(s => s.id === id);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: onClose,
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.4)',
      zIndex: 88
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 89,
      background: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '86%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 -8px 24px rgba(0,0,0,0.12)',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 16px 8px',
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 38,
      height: 4,
      borderRadius: 2,
      background: LL.border,
      margin: '0 auto 10px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      fontWeight: 700,
      color: LL.text
    }
  }, "\u9009\u62E9\u670D\u52A1"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      marginLeft: 'auto',
      width: 30,
      height: 30,
      borderRadius: '50%',
      border: 0,
      background: '#F0F0F5',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-x",
    style: {
      fontSize: 13,
      color: LL.text
    }
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto',
      paddingBottom: 22
    }
  }, GROUPS.map(g => /*#__PURE__*/React.createElement("div", {
    key: g.title,
    style: {
      padding: '16px 16px 6px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12.5,
      fontWeight: 700,
      color: g.theme.solid,
      marginBottom: 11,
      letterSpacing: '0.02em'
    }
  }, g.title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 10
    }
  }, g.ids.map(id => {
    const svc = byId(id);
    if (!svc) return null;
    const on = svc.id === value;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => onPick(id),
      style: {
        height: 40,
        padding: '0 18px',
        borderRadius: 999,
        border: 0,
        cursor: 'pointer',
        fontFamily: LL.font,
        background: on ? g.theme.solid : g.theme.bg,
        color: on ? '#fff' : g.theme.fg,
        fontSize: 14,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, on && /*#__PURE__*/React.createElement("i", {
      className: "ph-fill ph-check",
      style: {
        fontSize: 13
      }
    }), svc.id);
  })))), /*#__PURE__*/React.createElement("button", {
    onClick: () => setPolicyOpen(true),
    style: {
      width: '100%',
      marginTop: 8,
      padding: '15px 16px',
      background: 'transparent',
      border: 0,
      borderTop: `8px solid ${LL.bg}`,
      cursor: 'pointer',
      fontFamily: LL.font,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      textAlign: 'left'
    }
  }, /*#__PURE__*/React.createElement("i", {
    className: "ph ph-shield-check",
    style: {
      fontSize: 17,
      color: LL.text2,
      flex: '0 0 auto'
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      fontSize: 14,
      fontWeight: 600,
      color: LL.text
    }
  }, "\u53D6\u6D88\u653F\u7B56"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: LL.text3
    }
  }, "\u67E5\u770B\u8BE6\u60C5"), /*#__PURE__*/React.createElement("i", {
    className: "ph ph-caret-right",
    style: {
      fontSize: 13,
      color: LL.text3
    }
  })))), policyOpen && typeof CancelPolicyModal === 'function' && /*#__PURE__*/React.createElement(CancelPolicyModal, {
    onClose: () => setPolicyOpen(false)
  }));
}

// ─── Tab bar with badge dots ──────────────────────────────────
function PhTabBar({
  tabs,
  active,
  onChange
}) {
  const ids = Object.keys(tabs);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 78,
      paddingBottom: 18,
      background: '#fff',
      borderTop: `1px solid ${LL.border}`,
      display: 'grid',
      gridTemplateColumns: `repeat(${ids.length}, 1fr)`,
      fontFamily: LL.font,
      zIndex: 20
    }
  }, ids.map(id => {
    const t = tabs[id];
    const on = id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: () => onChange(id),
      style: {
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        color: on ? LL.text : LL.text3,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        display: 'inline-flex'
      }
    }, /*#__PURE__*/React.createElement("i", {
      className: `${on ? 'ph-fill' : 'ph'} ph-${on ? t.iconFill : t.icon}`,
      style: {
        fontSize: 22,
        lineHeight: 1
      }
    }), t.badge && /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: -2,
        right: -3,
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: '#E63946',
        border: '1.5px solid #fff'
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        fontWeight: on ? 600 : 500
      }
    }, t.label));
  }));
}

// ─── Mount ────────────────────────────────────────────────────
function Root() {
  const [topBarLeading, setTopBarLeading] = React.useState(null);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#EEEEF2',
      padding: 24,
      boxSizing: 'border-box',
      fontFamily: LL.font
    }
  }, /*#__PURE__*/React.createElement(IOSDevice, {
    width: 390,
    height: 844,
    leading: topBarLeading
  }, /*#__PURE__*/React.createElement(App, {
    setTopBarLeading: setTopBarLeading
  })));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(Root, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/components.jsx
try { (() => {
// Lou Lou — Reusable components
// Loads after icons.jsx (uses Iback, Isearch, etc. from window).

const LL = {
  ink: '#22282C',
  inkPress: '#1A1F23',
  inkDisabled: 'rgba(34,40,44,0.5)',
  text: '#1E1E24',
  text2: '#6B6B7A',
  text3: '#A0A0B0',
  bg: '#F8F8FC',
  surface: '#FFFFFF',
  border: '#EEEEF2',
  butter: '#FEE7A6',
  lavender: '#D8CAE8',
  mint: '#C7E8D8',
  peach: '#FBD3C4',
  font: '-apple-system, "SF Pro Text", "PingFang SC", "Helvetica Neue", "Microsoft YaHei", Roboto, sans-serif'
};
window.LL = LL;

// ───────────────────────── CTA ─────────────────────────
function CTAButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  full = true,
  secondary = false
}) {
  const [pressed, setPressed] = React.useState(false);
  const bg = disabled ? LL.inkDisabled : pressed ? LL.inkPress : secondary ? '#FFFFFF' : LL.ink;
  const color = secondary ? LL.text : '#fff';
  const border = secondary ? `1px solid ${LL.border}` : '0';
  return /*#__PURE__*/React.createElement("button", {
    onClick: disabled || loading ? undefined : onClick,
    onPointerDown: () => setPressed(true),
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    style: {
      width: full ? '100%' : 'auto',
      height: 52,
      padding: full ? 0 : '0 24px',
      borderRadius: 999,
      background: bg,
      color,
      border,
      fontSize: 15,
      fontWeight: 600,
      fontFamily: LL.font,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background 120ms ease, transform 120ms ease',
      transform: pressed && !disabled ? 'scale(0.985)' : 'scale(1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8
    }
  }, loading && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: '#fff',
      animation: 'll-spin 0.8s linear infinite'
    }
  }), children);
}

// ───────────────────────── Top Nav ─────────────────────────
function TopNav({
  title,
  onBack,
  trailing = null,
  transparent = false
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      background: transparent ? 'transparent' : LL.bg,
      gap: 12,
      position: 'sticky',
      top: 0,
      zIndex: 30
    }
  }, onBack ? /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    style: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      border: 0,
      background: LL.ink,
      color: '#fff',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Iback, {
    size: 18,
    sw: 2.4
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontWeight: 600,
      fontSize: 16,
      color: LL.text
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      display: 'flex',
      justifyContent: 'flex-end'
    }
  }, trailing));
}

// ───────────────────────── Hero Header (Home) ─────────────────────────
// The dark pill with avatar + paw badge + bell, like in moodboard
function HeroPill({
  onBell
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      margin: '0 auto',
      background: LL.ink,
      borderRadius: 999,
      padding: 4,
      width: 'fit-content'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      overflow: 'hidden',
      background: LL.butter,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 22
    }
  }, "\uD83D\uDC36"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: LL.butter
    }
  }, /*#__PURE__*/React.createElement(IpawFill, {
    size: 20
  })), /*#__PURE__*/React.createElement("button", {
    onClick: onBell,
    style: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      border: 0,
      background: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: LL.text
    }
  }, /*#__PURE__*/React.createElement(Ibell, {
    size: 18
  })));
}

// ───────────────────────── Category Chips ─────────────────────────
function CategoryChips({
  items,
  active,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      overflowX: 'auto',
      padding: '0 16px',
      scrollbarWidth: 'none'
    }
  }, items.map(it => {
    const on = it === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it,
      onClick: () => onChange(it),
      style: {
        height: 34,
        padding: '0 18px',
        borderRadius: 999,
        border: 0,
        background: on ? LL.ink : '#fff',
        color: on ? '#fff' : LL.text,
        fontWeight: on ? 600 : 500,
        fontSize: 13,
        fontFamily: LL.font,
        boxShadow: on ? 'none' : `inset 0 0 0 1px ${LL.border}`,
        cursor: 'pointer',
        flex: '0 0 auto',
        whiteSpace: 'nowrap'
      }
    }, it);
  }));
}

// ───────────────────────── Pet Stage Card ─────────────────────────
function PetStageCard({
  title,
  sub,
  bg,
  emoji,
  onClick,
  offset = 0
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      position: 'relative',
      background: bg,
      borderRadius: 16,
      padding: '14px 16px 16px',
      height: 184,
      overflow: 'hidden',
      marginTop: offset,
      cursor: 'pointer'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'rgba(0,0,0,0.55)'
    }
  }, /*#__PURE__*/React.createElement(Ichart, {
    size: 16
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: -10,
      top: -4,
      fontSize: 180,
      lineHeight: 1,
      filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.12))'
    }
  }, emoji), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      bottom: 44,
      fontWeight: 700,
      fontSize: 16,
      color: LL.text
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 16,
      bottom: 18,
      fontSize: 12,
      color: 'rgba(30,30,36,0.62)'
    }
  }, sub), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 14,
      bottom: 14,
      width: 32,
      height: 32,
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.55)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Iarrow, {
    size: 14,
    sw: 2.2
  })));
}

// ───────────────────────── Attribute Tag (pastel block) ─────────────────────────
function AttrTag({
  label,
  value,
  bg
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: bg,
      borderRadius: 14,
      padding: '10px 12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      fontWeight: 700,
      color: LL.text
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'rgba(30,30,36,0.62)'
    }
  }, value));
}

// ───────────────────────── Stat Tile ─────────────────────────
function StatTile({
  label,
  value,
  unit,
  bg
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: bg,
      borderRadius: 16,
      padding: '14px 16px',
      minHeight: 92,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'rgba(30,30,36,0.6)',
      fontWeight: 500
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 24,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.01em',
      fontVariantNumeric: 'tabular-nums'
    }
  }, value, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      color: 'rgba(30,30,36,0.55)',
      marginLeft: 2
    }
  }, unit)));
}

// ───────────────────────── Progress Ring ─────────────────────────
function ProgressRing({
  percent = 75,
  target = '60 min'
}) {
  const size = 200,
    sw = 14,
    r = (size - sw) / 2,
    C = 2 * Math.PI * r;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: size,
      height: size,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: size,
    height: size,
    style: {
      transform: 'rotate(-90deg)'
    }
  }, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "ll-ring",
    x1: "0",
    y1: "0",
    x2: "1",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: "#FEE7A6"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "35%",
    stopColor: "#D8CAE8"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "70%",
    stopColor: "#C7E8D8"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: "#FBD3C4"
  }))), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    stroke: "#EEEEF2",
    strokeWidth: sw,
    fill: "none"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: size / 2,
    cy: size / 2,
    r: r,
    stroke: "url(#ll-ring)",
    strokeWidth: sw,
    fill: "none",
    strokeDasharray: C,
    strokeDashoffset: C * (1 - percent / 100),
    strokeLinecap: "round"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 30,
      fontWeight: 700,
      color: LL.text,
      letterSpacing: '-0.02em'
    }
  }, percent, "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: LL.text2,
      marginTop: 2
    }
  }, "\u76EE\u6807 ", target)));
}

// ───────────────────────── Bottom Tab Bar ─────────────────────────
function TabBar({
  tabs,
  active,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 78,
      paddingBottom: 18,
      background: '#fff',
      borderTop: `1px solid ${LL.border}`,
      display: 'grid',
      gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
      fontFamily: LL.font,
      zIndex: 20
    }
  }, tabs.map(t => {
    const on = t.id === active;
    const Cmp = on ? t.iconOn : t.icon;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => onChange(t.id),
      style: {
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        color: on ? LL.text : LL.text3
      }
    }, /*#__PURE__*/React.createElement(Cmp, {
      size: 24
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10.5,
        fontWeight: on ? 600 : 500
      }
    }, t.label));
  }));
}

// ───────────────────────── Rating pill ─────────────────────────
function RatingPill({
  value = 4.7
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 12px',
      background: LL.ink,
      color: '#fff',
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 600
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 1
    }
  }, [0, 1, 2, 3, 4].map(i => /*#__PURE__*/React.createElement(Istar, {
    key: i,
    size: 11,
    color: "#F0B100"
  }))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontVariantNumeric: 'tabular-nums'
    }
  }, value));
}
Object.assign(window, {
  CTAButton,
  TopNav,
  HeroPill,
  CategoryChips,
  PetStageCard,
  AttrTag,
  StatTile,
  ProgressRing,
  TabBar,
  RatingPill
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/components.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/icons.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Lou Lou — Iconography (Phosphor)
// Thin React wrappers around the Phosphor web font.
// Requires the Phosphor CSS to be loaded in the page:
//   https://unpkg.com/@phosphor-icons/web@2.1.1/src/regular/style.css
//   https://unpkg.com/@phosphor-icons/web@2.1.1/src/fill/style.css

const PhIcon = ({
  name,
  size = 24,
  weight = 'regular',
  color
}) => /*#__PURE__*/React.createElement("i", {
  className: `${weight === 'fill' ? 'ph-fill' : 'ph'} ph-${name}`,
  style: {
    fontSize: size,
    lineHeight: 1,
    color,
    display: 'inline-flex'
  },
  "aria-hidden": true
});

// Regular (stroke) — chrome / inactive tabs
const Iback = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "caret-left"
}, p));
const Ichevron = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "caret-right"
}, p));
const Isearch = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "magnifying-glass"
}, p));
const Ibell = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "bell"
}, p));
const Ihome = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "house"
}, p));
const Ipaw = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "paw-print"
}, p));
const Icalendar = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "calendar-blank"
}, p));
const Iuser = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "user"
}, p));
const Iarrow = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "arrow-up-right"
}, p));
const Ichart = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "chart-bar"
}, p));
const Iplus = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "plus"
}, p));
const Iclose = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "x"
}, p));
const Imap = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "map-pin"
}, p));
const Iclock = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "clock"
}, p));
const Iheart = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "heart"
}, p));

// Filled — active tab states
const IhomeFill = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "house",
  weight: "fill"
}, p));
const IpawFill = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "paw-print",
  weight: "fill"
}, p));
const IcalendarFill = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "calendar-blank",
  weight: "fill"
}, p));
const IuserFill = p => /*#__PURE__*/React.createElement(PhIcon, _extends({
  name: "user",
  weight: "fill"
}, p));

// Star — kept as small inline SVG so we can tint it (Phosphor color = currentColor)
const Istar = ({
  size = 12,
  color = '#F0B100'
}) => /*#__PURE__*/React.createElement("i", {
  className: "ph-fill ph-star",
  style: {
    fontSize: size,
    lineHeight: 1,
    color,
    display: 'inline-flex'
  },
  "aria-hidden": true
});
Object.assign(window, {
  PhIcon,
  Iback,
  Ichevron,
  Isearch,
  Ibell,
  Ihome,
  IhomeFill,
  Ipaw,
  IpawFill,
  Icalendar,
  IcalendarFill,
  Iuser,
  IuserFill,
  Iarrow,
  Ichart,
  Iplus,
  Iclose,
  Imap,
  Iclock,
  Iheart,
  Istar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/icons.jsx", error: String((e && e.message) || e) }); }

// ui_kits/wechat-mini-program/ios-frame.jsx
try { (() => {
// iOS.jsx — Simplified iOS 26 (Liquid Glass) device frame
// Based on the iOS 26 UI Kit + Figma status bar spec. No assets, no deps.
// Exports: IOSDevice, IOSStatusBar, IOSNavBar, IOSGlassPill, IOSList, IOSListRow, IOSKeyboard

// ─────────────────────────────────────────────────────────────
// Status bar
// ─────────────────────────────────────────────────────────────
function IOSStatusBar({
  dark = false,
  time = '9:41',
  leading
}) {
  const c = dark ? '#fff' : '#000';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 154,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '14px 24px 5px',
      boxSizing: 'border-box',
      background: '#fff',
      position: 'relative',
      zIndex: 20,
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: leading ? 'flex-start' : 'center',
      paddingTop: 1.5
    }
  }, leading || /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: '-apple-system, "SF Pro", system-ui',
      fontWeight: 590,
      fontSize: 17,
      lineHeight: '22px',
      color: c
    }
  }, time)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 22,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 1,
      paddingRight: 1
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "19",
    height: "12",
    viewBox: "0 0 19 12"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "7.5",
    width: "3.2",
    height: "4.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "4.8",
    y: "5",
    width: "3.2",
    height: "7",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9.6",
    y: "2.5",
    width: "3.2",
    height: "9.5",
    rx: "0.7",
    fill: c
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14.4",
    y: "0",
    width: "3.2",
    height: "12",
    rx: "0.7",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "12",
    viewBox: "0 0 17 12"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M8.5 3.2C10.8 3.2 12.9 4.1 14.4 5.6L15.5 4.5C13.7 2.7 11.2 1.5 8.5 1.5C5.8 1.5 3.3 2.7 1.5 4.5L2.6 5.6C4.1 4.1 6.2 3.2 8.5 3.2Z",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M8.5 6.8C9.9 6.8 11.1 7.3 12 8.2L13.1 7.1C11.8 5.9 10.2 5.1 8.5 5.1C6.8 5.1 5.2 5.9 3.9 7.1L5 8.2C5.9 7.3 7.1 6.8 8.5 6.8Z",
    fill: c
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "8.5",
    cy: "10.5",
    r: "1.5",
    fill: c
  })), /*#__PURE__*/React.createElement("svg", {
    width: "27",
    height: "13",
    viewBox: "0 0 27 13"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0.5",
    y: "0.5",
    width: "23",
    height: "12",
    rx: "3.5",
    stroke: c,
    strokeOpacity: "0.35",
    fill: "none"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "2",
    y: "2",
    width: "20",
    height: "9",
    rx: "2",
    fill: c
  }), /*#__PURE__*/React.createElement("path", {
    d: "M25 4.5V8.5C25.8 8.2 26.5 7.2 26.5 6.5C26.5 5.8 25.8 4.8 25 4.5Z",
    fill: c,
    fillOpacity: "0.4"
  }))));
}

// ─────────────────────────────────────────────────────────────
// Liquid glass pill — blur + tint + shine
// ─────────────────────────────────────────────────────────────
function IOSGlassPill({
  children,
  dark = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      minWidth: 44,
      borderRadius: 9999,
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: dark ? '0 2px 6px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.2)' : '0 1px 3px rgba(0,0,0,0.07), 0 3px 10px rgba(0,0,0,0.06)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.28)' : 'rgba(255,255,255,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 9999,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15), inset -1px -1px 1px rgba(255,255,255,0.08)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      display: 'flex',
      alignItems: 'center',
      padding: '0 4px'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Navigation bar — glass pills + large title
// ─────────────────────────────────────────────────────────────
function IOSNavBar({
  title = 'Title',
  dark = false,
  trailingIcon = true
}) {
  const muted = dark ? 'rgba(255,255,255,0.6)' : '#404040';
  const text = dark ? '#fff' : '#000';
  const pillIcon = content => /*#__PURE__*/React.createElement(IOSGlassPill, {
    dark: dark
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 36,
      height: 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, content));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      paddingTop: 62,
      paddingBottom: 10,
      position: 'relative',
      zIndex: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px'
    }
  }, pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "12",
    height: "20",
    viewBox: "0 0 12 20",
    fill: "none",
    style: {
      marginLeft: -1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M10 2L2 10l8 8",
    stroke: muted,
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), trailingIcon && pillIcon(/*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "6",
    viewBox: "0 0 22 6"
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "3",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "3",
    r: "2.5",
    fill: muted
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "19",
    cy: "3",
    r: "2.5",
    fill: muted
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px',
      fontFamily: '-apple-system, system-ui',
      fontSize: 34,
      fontWeight: 700,
      lineHeight: '41px',
      color: text,
      letterSpacing: 0.4
    }
  }, title));
}

// ─────────────────────────────────────────────────────────────
// Grouped list (inset card, r:26) + row (52px)
// ─────────────────────────────────────────────────────────────
function IOSListRow({
  title,
  detail,
  icon,
  chevron = true,
  isLast = false,
  dark = false
}) {
  const text = dark ? '#fff' : '#000';
  const sec = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const ter = dark ? 'rgba(235,235,245,0.3)' : 'rgba(60,60,67,0.3)';
  const sep = dark ? 'rgba(84,84,88,0.65)' : 'rgba(60,60,67,0.12)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 52,
      padding: '0 16px',
      position: 'relative',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      letterSpacing: -0.43
    }
  }, icon && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 30,
      height: 30,
      borderRadius: 7,
      background: icon,
      marginRight: 12,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      color: text
    }
  }, title), detail && /*#__PURE__*/React.createElement("span", {
    style: {
      color: sec,
      marginRight: 6
    }
  }, detail), chevron && /*#__PURE__*/React.createElement("svg", {
    width: "8",
    height: "14",
    viewBox: "0 0 8 14",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 1l6 6-6 6",
    stroke: ter,
    strokeWidth: "2",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), !isLast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      left: icon ? 58 : 16,
      height: 0.5,
      background: sep
    }
  }));
}
function IOSList({
  header,
  children,
  dark = false
}) {
  const hc = dark ? 'rgba(235,235,245,0.6)' : 'rgba(60,60,67,0.6)';
  const bg = dark ? '#1C1C1E' : '#fff';
  return /*#__PURE__*/React.createElement("div", null, header && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: '-apple-system, system-ui',
      fontSize: 13,
      color: hc,
      textTransform: 'uppercase',
      padding: '8px 36px 6px',
      letterSpacing: -0.08
    }
  }, header), /*#__PURE__*/React.createElement("div", {
    style: {
      background: bg,
      borderRadius: 26,
      margin: '0 16px',
      overflow: 'hidden'
    }
  }, children));
}

// ─────────────────────────────────────────────────────────────
// Device frame
// ─────────────────────────────────────────────────────────────
function IOSDevice({
  children,
  width = 402,
  height = 874,
  dark = false,
  title,
  keyboard = false,
  leading
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      height,
      borderRadius: 48,
      overflow: 'hidden',
      position: 'relative',
      background: dark ? '#000' : '#F2F2F7',
      boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      WebkitFontSmoothing: 'antialiased'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 11,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 126,
      height: 37,
      borderRadius: 24,
      background: '#000',
      zIndex: 50
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10
    }
  }, /*#__PURE__*/React.createElement(IOSStatusBar, {
    dark: dark,
    leading: leading
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, title !== undefined && /*#__PURE__*/React.createElement(IOSNavBar, {
    title: title,
    dark: dark
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, children), keyboard && /*#__PURE__*/React.createElement(IOSKeyboard, {
    dark: dark
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      height: 34,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      paddingBottom: 8,
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 139,
      height: 5,
      borderRadius: 100,
      background: dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.25)'
    }
  })));
}

// ─────────────────────────────────────────────────────────────
// Keyboard — iOS 26 liquid glass
// ─────────────────────────────────────────────────────────────
function IOSKeyboard({
  dark = false
}) {
  const glyph = dark ? 'rgba(255,255,255,0.7)' : '#595959';
  const sugg = dark ? 'rgba(255,255,255,0.6)' : '#333';
  const keyBg = dark ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.85)';

  // special-key icons
  const icons = {
    shift: /*#__PURE__*/React.createElement("svg", {
      width: "19",
      height: "17",
      viewBox: "0 0 19 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M9.5 1L1 9.5h4.5V16h8V9.5H18L9.5 1z",
      fill: glyph
    })),
    del: /*#__PURE__*/React.createElement("svg", {
      width: "23",
      height: "17",
      viewBox: "0 0 23 17"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M7 1h13a2 2 0 012 2v11a2 2 0 01-2 2H7l-6-7.5L7 1z",
      fill: "none",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinejoin: "round"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M10 5l7 7M17 5l-7 7",
      stroke: glyph,
      strokeWidth: "1.6",
      strokeLinecap: "round"
    })),
    ret: /*#__PURE__*/React.createElement("svg", {
      width: "20",
      height: "14",
      viewBox: "0 0 20 14"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M18 1v6H4m0 0l4-4M4 7l4 4",
      fill: "none",
      stroke: "#fff",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }))
  };
  const key = (content, {
    w,
    flex,
    ret,
    fs = 25,
    k
  } = {}) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      height: 42,
      borderRadius: 8.5,
      flex: flex ? 1 : undefined,
      width: w,
      minWidth: 0,
      background: ret ? '#08f' : keyBg,
      boxShadow: '0 1px 0 rgba(0,0,0,0.075)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, "SF Compact", system-ui',
      fontSize: fs,
      fontWeight: 458,
      color: ret ? '#fff' : glyph
    }
  }, content);
  const row = (keys, pad = 0) => /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      justifyContent: 'center',
      padding: `0 ${pad}px`
    }
  }, keys.map(l => key(l, {
    flex: true,
    k: l
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 15,
      borderRadius: 27,
      overflow: 'hidden',
      padding: '11px 0 2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxShadow: dark ? '0 -2px 20px rgba(0,0,0,0.09)' : '0 -1px 6px rgba(0,0,0,0.018), 0 -3px 20px rgba(0,0,0,0.012)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      backdropFilter: 'blur(12px) saturate(180%)',
      WebkitBackdropFilter: 'blur(12px) saturate(180%)',
      background: dark ? 'rgba(120,120,128,0.14)' : 'rgba(255,255,255,0.25)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      borderRadius: 27,
      boxShadow: dark ? 'inset 1.5px 1.5px 1px rgba(255,255,255,0.15)' : 'inset 1.5px 1.5px 1px rgba(255,255,255,0.7), inset -1px -1px 1px rgba(255,255,255,0.4)',
      border: dark ? '0.5px solid rgba(255,255,255,0.15)' : '0.5px solid rgba(0,0,0,0.06)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 20,
      alignItems: 'center',
      padding: '8px 22px 13px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, ['"The"', 'the', 'to'].map((w, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 25,
      background: '#ccc',
      opacity: 0.3
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      textAlign: 'center',
      fontFamily: '-apple-system, system-ui',
      fontSize: 17,
      color: sugg,
      letterSpacing: -0.43,
      lineHeight: '22px'
    }
  }, w)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 13,
      padding: '0 6.5px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    }
  }, row(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']), row(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'], 20), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14.25,
      alignItems: 'center'
    }
  }, key(icons.shift, {
    w: 45,
    k: 'shift'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6.5,
      flex: 1
    }
  }, ['z', 'x', 'c', 'v', 'b', 'n', 'm'].map(l => key(l, {
    flex: true,
    k: l
  }))), key(icons.del, {
    w: 45,
    k: 'del'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, key('ABC', {
    w: 92.25,
    fs: 18,
    k: 'abc'
  }), key('', {
    flex: true,
    k: 'space'
  }), key(icons.ret, {
    w: 92.25,
    ret: true,
    k: 'ret'
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 56,
      width: '100%',
      position: 'relative'
    }
  }));
}
Object.assign(window, {
  IOSDevice,
  IOSStatusBar,
  IOSNavBar,
  IOSGlassPill,
  IOSList,
  IOSListRow,
  IOSKeyboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/wechat-mini-program/ios-frame.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.StatusPill = __ds_scope.StatusPill;

__ds_ns.Tag = __ds_scope.Tag;

})();
