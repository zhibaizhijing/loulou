// Lou Lou — GuardianProfileScreen.jsx
// 守护者主页 — 陈逸 (三标签页: 信息 / 评价 / 服务)

// ─── Colors ──────────────────────────────────────────────────
const GGREEN         = '#2C7A4B';
const GGREEN_BG      = '#E6F1EC';
const PROFILE_PURPLE    = '#5B3A8F';
const PROFILE_PURPLE_BG = '#D8CAE8';

// ─── Per-species "what's included" copy (shown via base-fee ⓘ) ──
const CARE_INFO = {
  dog:     '包括每日至少 2 次户外遛狗、定时喂食饮水、食具清洁、更换尿垫、室内互动陪玩及每日健康状态监测。',
  cat:     '包括铲屎添砂、陪玩、梳毛、饮水饮食管理、食具清洁及每日健康状态监测。',
  hamster: '包括喂食饮水、局部清理尿沙/坏粮、食具清洁、检查跑轮和垫料环境及每日健康状态监测。',
  rabbit:  '包括补草、定时喂粮/擦干蔬菜、食具清洁、清理兔厕所、室内放风陪伴及每日健康状态监测。',
  bird:    '包括清壳补粮、换水、食具清洁、更换底盘垫纸、室内环境监控及每日健康状态监测。',
};

// 30-min single-visit "what's included" copy (上门喂养)
const VISIT_INFO = {
  dog:     '包括食具清洁、添粮换水、更换尿垫、互动陪玩、环境检查及健康监测。',
  cat:     '包括食具清洁、添粮换水、铲屎添砂、互动陪玩、环境检查及健康监测。',
  hamster: '包括食具清洁、添粮换水、局部清理尿沙/坏粮、环境检查及健康监测。',
  rabbit:  '包括补草、定时喂粮/擦干蔬菜、食具清洁、清理兔厕所、环境检查及健康监测。',
  bird:    '包括清壳补粮、换水、食具清洁、更换底盘垫纸、环境检查及健康监测。',
};

// ─── Shared extra-fee row builders (keep wording consistent across tabs) ──
// pickup + medication + (optionally) delay-fee blocks shared by 寄养/日托
const ROW_PICKUP    = { label: '守护者接送（1 来回）', price: '¥30', sub: '10 公里以内，超出部分每公里 +¥3' };
const ROW_VISIT     = { label: '守护者上门', price: '¥20', sub: '10 公里以内，超出部分每公里 +¥3' };
const ROW_MEDICATE  = { label: '喂药 / 擦药 / 喂营养品', price: '+¥10/次' };
const ROW_EMERGENCY = (p) => ({ label: '紧急预约附加费', price: p, info: '预约当天和次日服务为紧急预约。' });
const ROW_LONGTERM  = { label: '长期订单优惠（超过 7 天）', price: '-10%' };
const ROW_DELAY     = { label: '延时费', price: '当日价×50%', info: '若离园接宠时间晚于入园送宠时间：延时 2–8 小时内加收 50% 的当日服务费；延时 8 小时以上加收 100% 的当日服务费。' };
const ROW_DELAY_VISIT = { label: '延时费', price: '当日价×50%', info: '若订单结束日结束时间晚于订单开始日上门时间：延时 2–8 小时内加收 50% 的当日服务费；延时 8 小时以上加收 100% 的当日服务费。' };

// 上门喂养 extra fees — identical across all pet types
const VISIT_EXTRA_ROWS = [
  { label: '60 分钟加价', price: '+¥15' },
  { label: '每加 1 只', price: '+¥15' },
  { label: '节假日加价', price: '+¥10' },
  ROW_EMERGENCY('+¥8'),
  ROW_VISIT,
  ROW_MEDICATE,
  ROW_DELAY_VISIT,
];

// 伴宠留宿 extra fees — dog gets 幼犬, the other four are identical minus that row
const LODGE_DOG_ROWS = [
  { label: '幼犬', price: '+¥11' },
  { label: '每加 1 只', price: '+¥48' },
  { label: '节假日加价', price: '+¥20' },
  ROW_EMERGENCY('+¥15'),
  ROW_VISIT,
  ROW_MEDICATE,
  ROW_DELAY_VISIT,
];
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
  ownPets: [
    { id: 'op1', name: '豆豆', breed: '金毛', age: '3岁', bg: '#FEE7A6',
      photo: (window.__resources && window.__resources.galleryPuppy) || '../../uploads/Sleeping Golden Retriever Puppy.png' },
    { id: 'op2', name: '可乐', breed: '柯基', age: '2岁', bg: '#C7E8D8' },
    { id: 'op3', name: '糯米', breed: '布偶猫', age: '1岁', bg: '#D8CAE8' },
    { id: 'op4', name: '团子', breed: '英短', age: '4岁', bg: '#C7D8EE' },
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
            { range: '0–10 公斤', price: 88,  size: '小型', tier: '小型犬', info: '包括每日至少 2 次户外遛狗、定时喂食饮水、食具清洁、更换尿垫、室内互动陪玩及每日健康状态监测。' },
            { range: '10–20 公斤', price: 98, size: '中型', tier: '中型犬', info: '包括每日至少 2 次户外遛狗、定时喂食饮水、食具清洁、更换尿垫、室内互动陪玩及每日健康状态监测。' },
            { range: '20 公斤+', price: 108,  size: '大型', tier: '大型犬', info: '包括每日至少 2 次户外遛狗、定时喂食饮水、食具清洁、更换尿垫、室内互动陪玩及每日健康状态监测。' },
          ],
          rows: [
            { label: '幼犬', price: '+¥11' },
            { label: '每加 1 只', price: '+¥48' },
            { label: '节假日加价', price: '+¥17' },
            { label: '长期订单优惠（超过 7 天）', price: '-10%' },
            { label: '紧急预约附加费', price: '+¥15', info: '预约当天和次日服务为紧急预约。' },
            { label: '守护者接送（1 来回）', price: '¥30', sub: '10 公里以内，超出部分每公里 +¥3' },
            { label: '喂药 / 擦药 / 喂营养品', price: '+¥10/次' },
            { label: '延时费', price: '当日价×50%', info: '若离园接宠时间晚于入园送宠时间：延时 2–8 小时内加收 50% 的当日服务费；延时 8 小时以上加收 100% 的当日服务费。' },
          ],
        },
        {
          type: 'cat', label: '猫',
          baseInfo: CARE_INFO.cat,
          weights: [
            { range: '全体型', price: 78, size: '全部' },
          ],
          rows: [
            { label: '每加 1 只', price: '+¥40' },
            { label: '节假日加价', price: '+¥15' },
            ROW_LONGTERM,
            ROW_EMERGENCY('+¥15'),
            ROW_PICKUP,
            ROW_MEDICATE,
            ROW_DELAY,
          ],
        },
        {
          type: 'rabbit', label: '兔',
          baseInfo: CARE_INFO.rabbit,
          weights: [
            { range: '全体型', price: 65, size: '全部' },
          ],
          rows: [
            { label: '每加 1 只', price: '+¥28' },
            { label: '节假日加价', price: '+¥12' },
            ROW_LONGTERM,
            ROW_EMERGENCY('+¥12'),
            ROW_PICKUP,
            ROW_MEDICATE,
            ROW_DELAY,
          ],
        },
        {
          type: 'hamster', label: '鼠',
          baseInfo: CARE_INFO.hamster,
          weights: [
            { range: '全体型', price: 45, size: '全部' },
          ],
          rows: [
            { label: '每加 1 只', price: '+¥20' },
            { label: '节假日加价', price: '+¥8' },
            ROW_LONGTERM,
            ROW_EMERGENCY('+¥8'),
            ROW_PICKUP,
            ROW_MEDICATE,
            ROW_DELAY,
          ],
        },
        {
          type: 'bird', label: '鸟',
          baseInfo: CARE_INFO.bird,
          weights: [
            { range: '全体型', price: 48, size: '全部' },
          ],
          rows: [
            { label: '每加 1 只', price: '+¥22' },
            { label: '节假日加价', price: '+¥10' },
            ROW_LONGTERM,
            ROW_EMERGENCY('+¥8'),
            ROW_PICKUP,
            ROW_MEDICATE,
            ROW_DELAY,
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
            { range: '0–10 公斤', price: 58, size: '小型', tier: '小型犬', info: CARE_INFO.dog },
            { range: '10–20 公斤', price: 68, size: '中型', tier: '中型犬', info: CARE_INFO.dog },
            { range: '20 公斤+', price: 78, size: '大型', tier: '大型犬', info: CARE_INFO.dog },
          ],
          rows: [
            { label: '幼犬', price: '+¥10' },
            { label: '每加 1 只', price: '+¥35' },
            { label: '节假日加价', price: '+¥15' },
            ROW_EMERGENCY('+¥10'),
            ROW_PICKUP,
            ROW_MEDICATE,
          ],
        },
        {
          type: 'cat', label: '猫',
          baseInfo: CARE_INFO.cat,
          weights: [
            { range: '全体型', price: 50, size: '全部' },
          ],
          rows: [
            { label: '每加 1 只', price: '+¥30' },
            { label: '节假日加价', price: '+¥12' },
            ROW_EMERGENCY('+¥10'),
            ROW_PICKUP,
            ROW_MEDICATE,
          ],
        },
        {
          type: 'rabbit', label: '兔',
          baseInfo: CARE_INFO.rabbit,
          weights: [
            { range: '全体型', price: 55, size: '全部' },
          ],
          rows: [
            { label: '每加 1 只', price: '+¥25' },
            { label: '节假日加价', price: '+¥10' },
            ROW_EMERGENCY('+¥8'),
            ROW_PICKUP,
            ROW_MEDICATE,
          ],
        },
        {
          type: 'hamster', label: '鼠',
          baseInfo: CARE_INFO.hamster,
          weights: [
            { range: '全体型', price: 38, size: '全部' },
          ],
          rows: [
            { label: '每加 1 只', price: '+¥15' },
            { label: '节假日加价', price: '+¥6' },
            ROW_EMERGENCY('+¥6'),
            ROW_PICKUP,
            ROW_MEDICATE,
          ],
        },
        {
          type: 'bird', label: '鸟',
          baseInfo: CARE_INFO.bird,
          weights: [
            { range: '全体型', price: 40, size: '全部' },
          ],
          rows: [
            { label: '每加 1 只', price: '+¥18' },
            { label: '节假日加价', price: '+¥8' },
            ROW_EMERGENCY('+¥6'),
            ROW_PICKUP,
            ROW_MEDICATE,
          ],
        },
      ],
    },
    {
      id: '遛狗', sub: '在你的小区周边', price: 38, unit: '次',
      petTypes: [
        { type: 'dog', weights: ['0–7', '7–18', '18–45', '45+'] },
      ],
      extras: [],
      petPricingTabs: [
        {
          type: 'dog', label: '狗',
          weights: [
            { range: '0–10 公斤', price: 38, size: '小型', tier: '小型犬', info: '单次遛狗时长 30 分钟。' },
            { range: '10–20 公斤', price: 45, size: '中型', tier: '中型犬', info: '单次遛狗时长 30 分钟。' },
            { range: '20 公斤+', price: 52, size: '大型', tier: '大型犬', info: '单次遛狗时长 30 分钟。' },
          ],
          rows: [
            { label: '幼犬', price: '+¥8' },
            { label: '60 分钟加价', price: '+¥18' },
            { label: '每加 1 只', price: '+¥20' },
            { label: '节假日加价', price: '+¥10' },
            ROW_EMERGENCY('+¥8'),
            ROW_VISIT,
          ],
        },
      ],
    },
    {
      id: '上门喂养', sub: '在宠物主家', price: 30, unit: '次',
      petTypes: [
        { type: 'cat', weights: ['0–7', '7–18', '18–45'] },
        { type: 'dog', weights: ['0–7', '7–18', '18–45', '45+'] },
      ],
      extras: [],
      petPricingTabs: [
        {
          type: 'dog', label: '狗',
          baseUnitNote: '单次 30 分钟',
          weights: [
            { range: '全体型适用', price: 38, size: '全部', tier: '30 分钟', info: VISIT_INFO.dog },
          ],
          rows: VISIT_EXTRA_ROWS,
        },
        {
          type: 'cat', label: '猫',
          baseUnitNote: '单次 30 分钟',
          weights: [
            { range: '全体型适用', price: 32, size: '全部', tier: '30 分钟', info: VISIT_INFO.cat },
          ],
          rows: VISIT_EXTRA_ROWS,
        },
        {
          type: 'rabbit', label: '兔',
          baseUnitNote: '单次 30 分钟',
          weights: [
            { range: '全体型适用', price: 30, size: '全部', tier: '30 分钟', info: VISIT_INFO.rabbit },
          ],
          rows: VISIT_EXTRA_ROWS,
        },
        {
          type: 'hamster', label: '鼠',
          baseUnitNote: '单次 30 分钟',
          weights: [
            { range: '全体型适用', price: 26, size: '全部', tier: '30 分钟', info: VISIT_INFO.hamster },
          ],
          rows: VISIT_EXTRA_ROWS,
        },
        {
          type: 'bird', label: '鸟',
          baseUnitNote: '单次 30 分钟',
          weights: [
            { range: '全体型适用', price: 28, size: '全部', tier: '30 分钟', info: VISIT_INFO.bird },
          ],
          rows: VISIT_EXTRA_ROWS,
        },
      ],
    },
    {
      id: '伴宠留宿', sub: '在宠物主家', price: 108, unit: '晚',
      petTypes: [
        { type: 'cat', weights: ['0–7', '7–18', '18–45'] },
        { type: 'dog', weights: ['0–7', '7–18', '18–45', '45+'] },
      ],
      extras: [],
      petPricingTabs: [
        {
          type: 'dog', label: '狗',
          baseInfo: CARE_INFO.dog,
          weights: [
            { range: '全体型', price: 108, size: '全部' },
          ],
          rows: LODGE_DOG_ROWS,
        },
        {
          type: 'cat', label: '猫',
          baseInfo: CARE_INFO.cat,
          weights: [
            { range: '全体型', price: 98, size: '全部' },
          ],
          rows: LODGE_PET_ROWS,
        },
        {
          type: 'rabbit', label: '兔',
          baseInfo: CARE_INFO.rabbit,
          weights: [
            { range: '全体型', price: 88, size: '全部' },
          ],
          rows: LODGE_PET_ROWS,
        },
        {
          type: 'hamster', label: '鼠',
          baseInfo: CARE_INFO.hamster,
          weights: [
            { range: '全体型', price: 78, size: '全部' },
          ],
          rows: LODGE_PET_ROWS,
        },
        {
          type: 'bird', label: '鸟',
          baseInfo: CARE_INFO.bird,
          weights: [
            { range: '全体型', price: 80, size: '全部' },
          ],
          rows: LODGE_PET_ROWS,
        },
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

// ─── Data: 阿哲 (训练师，遛狗为主) ───────────────────────────
const ZHE_DATA = {
  id: 'g6',
  name: '阿哲',
  isNewUserFlow: true,
  initial: { char: '哲', bg: LL.mint },
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
  ownPets: [
    { id: 'op1', name: '可乐', breed: '边境牧羊犬', age: '2岁', bg: '#C7E8D8',
      photo: (window.__resources && window.__resources.galleryPuppy) || '../../uploads/Sleeping Golden Retriever Puppy.png' },
  ],
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
    toiletInterval: '每2–3小时',
  },
  services: [
    {
      id: '遛狗', sub: '在你的小区周边', price: 45, unit: '次',
      petTypes: [
        { type: 'dog', weights: ['0–7', '7–18', '18–45', '45+'] },
      ],
      extras: [],
      petPricingTabs: [
        {
          type: 'dog', label: '狗',
          weights: [
            { range: '0–10 公斤', price: 45, size: '小型', tier: '小型犬', info: '单次遛狗 30 分钟，含基础牵引与社交引导。' },
            { range: '10–20 公斤', price: 52, size: '中型', tier: '中型犬', info: '单次遛狗 30 分钟，含基础牵引与社交引导。' },
            { range: '20 公斤+', price: 60, size: '大型', tier: '大型犬', info: '单次遛狗 30 分钟，含基础牵引与社交引导。' },
          ],
          rows: [
            { label: '幼犬', price: '+¥8' },
            { label: '60 分钟加价', price: '+¥20' },
            { label: '行为训练加练（每次）', price: '+¥30', info: '结合遛狗进行基础服从 / 社交训练，由训练师一对一指导。' },
            { label: '每加 1 只', price: '+¥22' },
            { label: '节假日加价', price: '+¥12' },
            ROW_EMERGENCY('+¥8'),
            ROW_VISIT,
          ],
        },
      ],
    },
    {
      id: '寄养', sub: '在守护者家', price: 138, unit: '晚',
      petTypes: [
        { type: 'dog', weights: ['0–7', '7–18', '18–45'] },
      ],
      extras: [],
      petPricingTabs: [
        {
          type: 'dog', label: '狗',
          weights: [
            { range: '0–10 公斤', price: 138, size: '小型', tier: '小型犬', info: CARE_INFO.dog },
            { range: '10–20 公斤', price: 158, size: '中型', tier: '中型犬', info: CARE_INFO.dog },
            { range: '20 公斤+', price: 178, size: '大型', tier: '大型犬', info: CARE_INFO.dog },
          ],
          rows: [
            { label: '幼犬', price: '+¥15' },
            { label: '每加 1 只', price: '+¥55' },
            { label: '节假日加价', price: '+¥20' },
            { label: '行为训练加练（每天）', price: '+¥40', info: '寄养期间每日加入基础服从训练，帮助纠正拆家、扑人等行为。' },
            ROW_LONGTERM,
            ROW_EMERGENCY('+¥18'),
            ROW_PICKUP,
            ROW_MEDICATE,
            ROW_DELAY,
          ],
        },
      ],
    },
    {
      id: '日托', sub: '在守护者家', price: 78, unit: '天',
      petTypes: [
        { type: 'dog', weights: ['0–7', '7–18', '18–45'] },
      ],
      extras: [],
      petPricingTabs: [
        {
          type: 'dog', label: '狗',
          weights: [
            { range: '0–10 公斤', price: 78, size: '小型', tier: '小型犬', info: CARE_INFO.dog },
            { range: '10–20 公斤', price: 88, size: '中型', tier: '中型犬', info: CARE_INFO.dog },
            { range: '20 公斤+', price: 98, size: '大型', tier: '大型犬', info: CARE_INFO.dog },
          ],
          rows: [
            { label: '幼犬', price: '+¥12' },
            { label: '每加 1 只', price: '+¥40' },
            { label: '节假日加价', price: '+¥16' },
            { label: '行为训练加练（每天）', price: '+¥40' },
            ROW_EMERGENCY('+¥12'),
            ROW_PICKUP,
            ROW_MEDICATE,
          ],
        },
      ],
    },
    {
      id: '上门喂养', sub: '在宠物主家', price: 38, unit: '次',
      petTypes: [
        { type: 'dog', weights: ['0–7', '7–18', '18–45', '45+'] },
      ],
      extras: [],
      petPricingTabs: [
        {
          type: 'dog', label: '狗',
          baseUnitNote: '单次 30 分钟',
          weights: [
            { range: '全体型适用', price: 38, size: '全部', tier: '30 分钟', info: VISIT_INFO.dog },
          ],
          rows: VISIT_EXTRA_ROWS,
        },
      ],
    },
  ],
  reviews: [
    { id: 1, phone: '137****6611', pet: '拉布拉多·2岁', rating: 5, service: '遛狗', date: '2026-05-12',
      text: '阿哲是训练师，遛狗时顺便纠正了乱扑人的毛病，回来明显乖了，还发了训练小结。' },
    { id: 2, phone: '159****2048', pet: '边牧·1岁',     rating: 5, service: '遛狗', date: '2026-05-03',
      text: '边牧精力太旺，阿哲每次遛足30分钟还做服从练习，狗子终于不拆家了！' },
    { id: 3, phone: '138****7720', pet: '金毛·3岁',     rating: 5, service: '寄养', date: '2026-04-20',
      text: '寄养期间每天有训练和照片，环境干净，狗狗很喜欢他，强烈推荐。' },
    { id: 4, phone: '186****3355', pet: '柯基·2岁',     rating: 4, service: '遛狗', date: '2026-04-06',
      text: '很专业，路线和时间都很准时。偶尔回复稍慢，整体满意。' },
    { id: 5, phone: '135****9182', pet: '泰迪·4岁',     rating: 5, service: '日托', date: '2026-03-19',
      text: '日托加了训练，泰迪学会了定点，太省心了。' },
    { id: 6, phone: '151****4407', pet: '萨摩耶·2岁',   rating: 5, service: '遛狗', date: '2026-03-02',
      text: '大狗也能稳稳牵住，社交训练很有一套，已经是回头客了。' },
    { id: 7, phone: '139****8830', pet: '比熊·1岁',     rating: 5, service: '上门喂养', date: '2026-02-15',
      text: '上门准时，喂食遛弯都到位，还拍了视频，很安心。' },
    { id: 8, phone: '177****2261', pet: '阿拉斯加·3岁', rating: 5, service: '寄养', date: '2026-01-28',
      text: '大型犬也接得住，训练师就是不一样，狗子状态特别好。' },
  ],
  starDist: { 5: 84, 4: 12, 3: 4 },
  bookedDates: [
    '2026-05-25','2026-05-28','2026-05-29','2026-06-01','2026-06-02',
    '2026-06-08','2026-06-09','2026-06-15','2026-06-16','2026-06-22',
  ],
  photos: [
    (window.__resources && window.__resources.zheHero) || 'assets/zhe-hero.png',
    (window.__resources && window.__resources.galleryRoom) || '../../uploads/Bright Sunlit Room.png',
    (window.__resources && window.__resources.galleryLiving) || '../../uploads/Cozy Living Room Decor.png',
  ],
  petTypeSections: [
    {
      title: '阿哲可以遛狗',
      pets: [
        { type: 'dog', weights: ['0–7', '7–18', '18–45', '45+'] },
      ],
    },
    {
      title: '阿哲可以寄养',
      pets: [
        { type: 'dog', weights: ['0–7', '7–18', '18–45'] },
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
  const resPhoto = (g.photoKey && window.__resources) ? window.__resources[g.photoKey] : null;
  const photoSrc = resPhoto || g.photo || null;
  const photos   = (g.photos && g.photos.length) ? g.photos : (photoSrc ? [photoSrc] : []);
  const initial  = g.initial || null;

  return (
    <div style={{ background: LL.surface }}>
      {/* Photo carousel + overlaid action buttons */}
      <div style={{ position: 'relative' }}>
        {photos.length > 0 ? (
          <PhotoCarousel photos={photos} />
        ) : (
          <div style={{
            height: 240, background: initial?.bg || LL.lavender,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 96, fontWeight: 800, color: 'rgba(34,40,44,0.20)', letterSpacing: '-0.02em' }}>
              {initial?.char || (g.name && g.name[0]) || ''}
            </span>
          </div>
        )}
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
          background: initial?.bg || LL.lavender,
          boxShadow: '0 2px 8px rgba(0,0,0,0.13)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {photoSrc ? (
            <img src={photoSrc} alt={g.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
            />
          ) : (
            <span style={{ fontSize: 28, fontWeight: 800, color: LL.text }}>
              {initial?.char || (g.name && g.name[0]) || ''}
            </span>
          )}
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
function CalendarBlock({ bookedDates, guardianServices, onViewServices, defaultService }) {
  const initSvc = (defaultService && guardianServices?.some(s => s.id === defaultService))
    ? defaultService
    : (guardianServices?.[0]?.id || '寄养');
  const [selectedSvc, setSelectedSvc] = React.useState(initSvc);
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

      {/* Shared calendar — view-only, no per-day price */}
      <GuardianCalendar
        bookedDates={bookedDates}
        svcPrice={null}
        svcUnit={svcData?.unit ?? '晚'}
        viewOnly={true}
      />
    </div>
  );
}

// ─── 信息 Tab ─────────────────────────────────────────────────
function InfoTab({ g, onViewServices, onViewAllReviews, defaultService }) {
  const [bioExp,        setBioExp]        = React.useState(false);
  const [homeExp,       setHomeExp]       = React.useState(false);
  const [expandedPetId, setExpandedPetId] = React.useState(null);
  const AVAS = [LL.butter, LL.lavender, LL.mint, LL.peach];
  const BIO_LIMIT = 75;
  const bioText    = g.bio || '';
  const bioShort   = bioText.replace(/\n/g, ' ').slice(0, BIO_LIMIT);
  const bioTooLong = bioText.replace(/\n/g, '').length > BIO_LIMIT;

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
        {!bioExp && bioTooLong ? bioShort + '…' : bioText}
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
          <SecHead title="Ta的宠物" />
          <div style={{ display: 'flex', gap: 18, overflowX: 'auto', overflowY: 'hidden',
            padding: '2px 0 6px', marginBottom: 20, scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {g.ownPets.map(pet => (
              <button key={pet.id} onClick={() => {}}
                style={{ flex:'0 0 auto', background:'transparent', border:0, padding:0, cursor:'pointer',
                  fontFamily:LL.font, display:'flex', flexDirection:'column', alignItems:'center', gap:7, width:60 }}>
                <div style={{ width:60, height:60, borderRadius:'50%', overflow:'hidden',
                  background:pet.bg || LL.butter, flex:'0 0 auto',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  border:`1.5px solid ${LL.border}` }}>
                  {pet.photo
                    ? <img src={pet.photo} alt={pet.name}
                        style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center' }}
                        onError={e => { e.target.style.display = 'none'; }} />
                    : <span style={{ fontSize:22, fontWeight:700, color:'rgba(34,40,44,0.45)' }}>{pet.name[0]}</span>}
                </div>
                <div style={{ fontSize:12.5, fontWeight:600, color:LL.text, lineHeight:1.2,
                  maxWidth:60, textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{pet.name}</div>
              </button>
            ))}
          </div>
        </>
      )}

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
        defaultService={defaultService}
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
const PRICING_SVC_TYPES = ['寄养', '日托', '遛狗', '上门喂养', '伴宠留宿'];
const PET_BG_MAP    = { dog:'#EDF6EE', cat:'#F0EEF8', rabbit:'#FEF6E4', hamster:'#FFF0EA', bird:'#E8F0FE' };
const PET_COLOR_MAP = { dog:'#2C7A4B', cat:PROFILE_PURPLE, rabbit:'#B45309', hamster:'#9C4221', bird:'#2F5F87' };
const PET_ICON_MAP2 = { dog:'dog', cat:'cat', rabbit:'rabbit', bird:'bird', hamster:'mouse-simple' };
const SIZE_SCALE    = { '小型':14, '普通':16, '中型':20, '大型':24, '全部':16 };

// ─── Pricing card with pet-type tabs (寄养 / 日托) ────────────
function PricingServiceCard({ svc }) {
  const tabs = svc.petPricingTabs || [];
  const [activeType,    setActiveType]    = React.useState(tabs[0]?.type || '');
  const [openTooltip,   setOpenTooltip]   = React.useState(null);

  React.useEffect(() => { setOpenTooltip(null); }, [activeType]);

  const tab = tabs.find(t => t.type === activeType) || tabs[0];
  if (!tab) return null;
  const toggleTip = (key) => setOpenTooltip(k => k === key ? null : key);
  const rows = tab.rows || [];

  const bg    = PET_BG_MAP[tab.type]    || LL.bg;
  const color = PET_COLOR_MAP[tab.type] || LL.text;
  const icon  = PET_ICON_MAP2[tab.type] || 'paw-print';

  const renderRow = (row, rowKey, borderTop) => {
    const label   = row.label || row.section;
    const isNA    = row.price === '–' || row.price === '-';
    const tipOpen = openTooltip === rowKey;
    const pColor  = isNA ? LL.text3 : (row.price.startsWith('-') && !row.price.startsWith('-¥') ? GGREEN : LL.text);
    return (
      <React.Fragment key={rowKey}>
        <div style={{ padding:'9px 16px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:10,
          borderTop: borderTop ? `1px solid ${LL.border}` : 'none' }}>
          <div style={{ minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ fontSize:13.5, color: isNA ? LL.text3 : LL.text2 }}>{label}</span>
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
            {row.sub && (
              <div style={{ fontSize:11.5, color:LL.text3, marginTop:2, lineHeight:1.4, textWrap:'pretty' }}>{row.sub}</div>
            )}
          </div>
          <span style={{ fontSize:13.5, fontWeight: isNA ? 400 : 600, color:pColor, fontVariantNumeric:'tabular-nums', flex:'0 0 auto', whiteSpace:'nowrap' }}>
            {row.price}
          </span>
        </div>
        {tipOpen && row.info && (
          <div style={{ margin:'0 16px 8px', padding:'8px 12px', background:'#F0F0F8', borderRadius:8,
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

      {/* Base fee — full card is tappable to reveal service detail */}
      <div style={{ padding:'10px 16px 12px', borderTop:`1px solid ${LL.border}` }}>
        <div style={{ fontSize:11.5, fontWeight:600, color:LL.text3, letterSpacing:'0.03em', marginBottom:10 }}>基础费用</div>
        {tab.baseInfo && openTooltip === 'baseinfo' && (
          <div style={{ marginBottom:10, padding:'9px 12px', background:'#F0F0F8', borderRadius:8,
            fontSize:12, color:LL.text2, lineHeight:1.6, textWrap:'pretty' }}>
            <strong style={{ color:LL.text }}>{tab.label}服务内容　</strong>{tab.baseInfo}
          </div>
        )}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {tab.weights.map((w, i) => {
            const DOG_IMGS = {
              '小型': (window.__resources && window.__resources.dogSmall)  || './assets/dog-small.png',
              '中型': (window.__resources && window.__resources.dogMedium) || './assets/dog-medium.png',
              '大型': (window.__resources && window.__resources.dogLarge)  || './assets/dog-large.png',
            };
            const dogImg  = tab.type === 'dog' ? DOG_IMGS[w.size] : null;
            const cardKey = w.info ? `base-${i}` : (tab.baseInfo ? 'baseinfo' : null);
            const clickable = !!cardKey;
            const tipOpen = clickable && openTooltip === cardKey;
            const hasDigit = /\d/.test(w.range);
            const InfoDot = clickable ? (
              <span style={{ width:14, height:14, borderRadius:'50%',
                border:`1px solid ${tipOpen ? LL.ink : LL.text3}`,
                background: tipOpen ? LL.ink : 'transparent',
                display:'inline-flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' }}>
                <span style={{ fontSize:8, fontWeight:700, color: tipOpen ? '#fff' : LL.text3, lineHeight:1 }}>i</span>
              </span>
            ) : null;
            return (
              <div key={i}
                onClick={clickable ? () => toggleTip(cardKey) : undefined}
                role={clickable ? 'button' : undefined}
                style={{ background:bg, borderRadius:10, padding:'10px 12px',
                  display:'flex', alignItems:'center', justifyContent:'space-between', gap:6,
                  cursor: clickable ? 'pointer' : 'default',
                  outline: tipOpen ? `1.5px solid ${LL.ink}` : '1.5px solid transparent',
                  outlineOffset:'-1px', transition:'outline-color 120ms ease' }}>
                {/* Left: text */}
                <div style={{ minWidth:0 }}>
                  {w.tier ? (
                    <>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:LL.text }}>{w.tier}</span>
                        {InfoDot}
                      </div>
                      <div style={{ fontSize:11, color:LL.text3, marginTop:1, fontVariantNumeric:'tabular-nums' }}>{w.range}</div>
                    </>
                  ) : (
                    <>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <span style={{ fontSize:13.5, fontWeight:700, color:LL.text, fontVariantNumeric:'tabular-nums' }}>
                          {w.range.replace(' 公斤','').replace('公斤','')}
                        </span>
                        {InfoDot}
                      </div>
                      {hasDigit && <div style={{ fontSize:10.5, color:LL.text3 }}>公斤</div>}
                    </>
                  )}
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
        {/* Per-tier care-detail tooltip (full width below the grid) */}
        {tab.weights.map((w, i) => {
          const baseKey = `base-${i}`;
          if (openTooltip !== baseKey || !w.info) return null;
          return (
            <div key={`btip-${i}`} style={{ marginTop:8, padding:'9px 12px', background:'#F0F0F8', borderRadius:8,
              fontSize:12, color:LL.text2, lineHeight:1.6, textWrap:'pretty' }}>
              <strong style={{ color:LL.text }}>{w.tier}服务内容　</strong>{w.info}
            </div>
          );
        })}
      </div>

      {/* Extra fees — all items shown directly (no accordion) */}
      {rows.length > 0 && (
        <div style={{ borderTop:`1px solid ${LL.border}` }}>
          <div style={{ padding:'12px 16px 2px' }}>
            <span style={{ fontSize:13.5, fontWeight:600, color:LL.text }}>额外费用</span>
          </div>
          {rows.map((row, i) => renderRow(row, `r-${i}`, true))}
        </div>
      )}
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
          以下价格适用于 <strong style={{ color: LL.text }}>1 只宠物</strong>，为守护者实际收费，无额外平台服务费。
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
function GuardianProfileScreen({ guardian = CHEN_YI_DATA, onBack, initialService }) {
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
            {tab === 'info'     && <InfoTab g={guardian} onViewServices={() => handleTabChange('services')} onViewAllReviews={() => setAllReviews(true)} defaultService={initialService} />}
            {tab === 'services' && <ServicesTab g={guardian} />}
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { GuardianProfileScreen, CHEN_YI_DATA, ZHE_DATA, GuardianCalendar });
