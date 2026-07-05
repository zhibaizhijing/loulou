// Lou Lou — PetsScreen.jsx
// 我的宠物：卡片展示 + 添加/编辑表单（6 个区块）

const PETS_GREEN    = '#2C7A4B';
const PETS_GREEN_BG = '#E6F1EC';

const VACCINES_OPTIONS = {
  dog: ['狂犬疫苗', '犬六联', '犬窝咳'],
  cat: ['猫三联', '狂犬疫苗'],
  other: ['狂犬疫苗'],
};

function calcPetAge(dob) {
  if (!dob) return null;
  const now = new Date(2026, 4, 28);
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 1) return '不足1个月';
  const y = Math.floor(months / 12), m = months % 12;
  if (y === 0) return `${m}个月`;
  if (m === 0) return `${y}岁`;
  return `${y}岁${m}个月`;
}

// ─── Mock data ────────────────────────────────────────────────
const PETS_INIT = [
  {
    id: 'p1', name: '黄豆', species: 'dog', breed: '混血', gender: 'female',
    dob: '2020-07-15', weight: '20', photo: null,
    spayed: true, microchipped: false, vaccines: ['狂犬疫苗', '犬六联'],
    hasMeds: false, meds: '', allergies: '',
    withStrangers: '友好', withDogs: '友好', withCats: '容易紧张', withKids: '友好',
    feedingFreq: '一天2次', feedingOther: '', walkFreq: '一天2次', walkOther: '',
    aloneTime: '1-4小时', aloneOther: '', energy: '高精力',
    notes: '', vetName: '', vetPhone: '', emergencyName: '', emergencyPhone: '',
  },
  {
    id: 'p2', name: 'Debbie', species: 'cat', breed: '波斯布偶猫', gender: 'female',
    dob: '2022-03-10', weight: '4', photo: null,
    spayed: true, microchipped: true, vaccines: ['猫三联', '狂犬疫苗'],
    hasMeds: false, meds: '', allergies: '',
    withStrangers: '容易紧张', withDogs: '不建议接触', withCats: '友好', withKids: '容易紧张',
    feedingFreq: '一天2次', feedingOther: '', walkFreq: null, walkOther: '',
    aloneTime: '1-4小时', aloneOther: '', energy: '低精力',
    notes: '需要安静的环境', vetName: '', vetPhone: '', emergencyName: '', emergencyPhone: '',
  },
];

const emptyPet = () => ({
  id: null, name: '', species: 'dog', breed: '', gender: null,
  dob: '', weight: '', photo: null, spayed: null, microchipped: null, vaccines: [],
  hasMeds: null, meds: '', allergies: '',
  withStrangers: null, withDogs: null, withCats: null, withKids: null,
  feedingFreq: null, feedingOther: '', walkFreq: null, walkOther: '',
  aloneTime: null, aloneOther: '', energy: null,
  notes: '', vetName: '', vetPhone: '', emergencyName: '', emergencyPhone: '',
});

// ─── Form sub-components ──────────────────────────────────────
function FSectionHead({ title, icon, iconBg = '#F5F5FA', emergency = false }) {
  return (
    <div style={{ padding:'12px 16px 10px', background: emergency ? '#FFF9E6' : '#F0F0F5',
      borderTop:`1px solid ${LL.border}`, display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:30, height:30, borderRadius:8,
        background: emergency ? '#FEF3C7' : iconBg,
        display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' }}>
        <i className={`ph ph-${icon}`} style={{ fontSize:16, color: emergency ? '#B45309' : LL.text2 }} />
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14.5, fontWeight:700, color: emergency ? '#92400E' : LL.text }}>{title}</div>
        {emergency && <div style={{ fontSize:11.5, color:'#B45309', marginTop:1 }}>紧急情况使用</div>}
      </div>
    </div>
  );
}

function FField({ label, required = false, hint, children }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ fontSize:13.5, fontWeight:600, color:LL.text, marginBottom: hint ? 4 : 10 }}>
        {label}{required && <span style={{ color:'#E63946', marginLeft:3 }}>*</span>}
      </div>
      {hint && <div style={{ fontSize:12, color:LL.text3, marginBottom:10, lineHeight:1.5 }}>{hint}</div>}
      {children}
    </div>
  );
}

function FInput({ value, onChange, placeholder, type = 'text' }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={{ width:'100%', height:46, padding:'0 14px', borderRadius:10,
        border:`1.5px solid ${LL.border}`, background:LL.bg, fontSize:15,
        fontFamily:LL.font, color:LL.text, outline:'none', boxSizing:'border-box' }} />
  );
}

function FTextarea({ value, onChange, placeholder, rows = 4 }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      style={{ width:'100%', padding:'12px 14px', borderRadius:10,
        border:`1.5px solid ${LL.border}`, background:LL.bg, fontSize:15,
        fontFamily:LL.font, color:LL.text, outline:'none', resize:'none',
        boxSizing:'border-box', lineHeight:1.6 }} />
  );
}

function RadioPills({ value, onChange, options }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {options.map(opt => {
        const on = value === opt;
        return (
          <button key={opt} onClick={() => onChange(on ? null : opt)} style={{
            width:'100%', padding:'13px 18px', borderRadius:999,
            border:`1.5px solid ${on ? LL.ink : LL.border}`,
            background: on ? LL.ink : '#fff',
            color: on ? '#fff' : LL.text,
            fontSize:15, fontWeight: on ? 600 : 500,
            cursor:'pointer', fontFamily:LL.font, textAlign:'left',
          }}>{opt}</button>
        );
      })}
    </div>
  );
}

function MultiPills({ value = [], onChange, options }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {options.map(opt => {
        const on = value.includes(opt);
        return (
          <button key={opt} onClick={() => onChange(on ? value.filter(v => v !== opt) : [...value, opt])}
            style={{ width:'100%', padding:'13px 18px', borderRadius:999,
              border:`1.5px solid ${on ? PETS_GREEN : LL.border}`,
              background: on ? PETS_GREEN_BG : '#fff',
              color: on ? PETS_GREEN : LL.text,
              fontSize:15, fontWeight: on ? 600 : 500,
              cursor:'pointer', fontFamily:LL.font, textAlign:'left',
              display:'flex', alignItems:'center', gap:10 }}>
            {on
              ? <i className="ph-fill ph-check-circle" style={{ fontSize:18, color:PETS_GREEN, flex:'0 0 auto' }} />
              : <div style={{ width:18, height:18, borderRadius:'50%', border:`1.5px solid ${LL.border}`, flex:'0 0 auto' }} />
            }
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Add / Edit Form ──────────────────────────────────────────
function AddEditPetForm({ initialPet, onSave, onBack }) {
  const [pet, setPet] = React.useState(() => initialPet ? { ...initialPet } : emptyPet());
  const set = (key, val) => setPet(p => ({ ...p, [key]: val }));
  const photoRef = React.useRef(null);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => set('photo', ev.target.result);
    r.readAsDataURL(file);
  };

  const vaccines = VACCINES_OPTIONS[pet.species] || VACCINES_OPTIONS.dog;
  const age = calcPetAge(pet.dob);

  return (
    <div style={{ background:LL.bg, minHeight:'100%', paddingBottom:32, overflowY:'auto' }}>
      {/* Nav */}
      <div style={{ position:'sticky', top:0, zIndex:20, height:52, background:'#fff',
        borderBottom:`1px solid ${LL.border}`, display:'flex', alignItems:'center', padding:'0 14px', gap:10 }}>
        <button onClick={onBack} style={{ width:34, height:34, borderRadius:'50%', border:0, background:LL.bg, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' }}>
          <i className="ph ph-caret-left" style={{ fontSize:17, color:LL.text }} />
        </button>
        <div style={{ flex:1, textAlign:'center', fontSize:15, fontWeight:700, color:LL.text }}>
          {initialPet?.id ? '编辑宠物' : '添加宠物'}
        </div>
        <button onClick={() => onSave(pet)} style={{ height:34, padding:'0 16px', borderRadius:999, border:0, background:LL.ink, color:'#fff', fontSize:13.5, fontWeight:600, fontFamily:LL.font, cursor:'pointer' }}>
          保存
        </button>
      </div>

      {/* ── 基础信息 ── */}
      <FSectionHead title="基础信息" icon="paw-print" iconBg={LL.lavender} />
      <div style={{ background:'#fff', padding:'16px 16px 4px' }}>
        <FField label="宠物照片">
          <input ref={photoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePhoto} />
          <button onClick={() => photoRef.current?.click()} style={{
            width:'100%', aspectRatio:'16/9', borderRadius:12, padding:0, overflow:'hidden',
            border:`2px dashed ${LL.border}`, background:LL.bg, cursor:'pointer',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10 }}>
            {pet.photo
              ? <img src={pet.photo} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
              : <>
                  <div style={{ width:52, height:52, borderRadius:'50%', background:'#E8E8F0', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <i className="ph ph-camera" style={{ fontSize:24, color:LL.text3 }} />
                  </div>
                  <div style={{ fontSize:13.5, color:LL.text3, fontFamily:LL.font }}>点击上传宠物照片</div>
                </>
            }
          </button>
        </FField>

        <FField label="宠物类型" required>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[['dog','🐕 狗'],['cat','🐈 猫']].map(([v,label]) => {
              const on = pet.species === v;
              return (
                <button key={v} onClick={() => { set('species', v); set('vaccines', []); }} style={{
                  padding:'13px 16px', borderRadius:12,
                  border:`1.5px solid ${on ? LL.ink : LL.border}`,
                  background: on ? LL.ink : '#fff', color: on ? '#fff' : LL.text,
                  fontSize:15, fontWeight: on ? 700 : 500,
                  cursor:'pointer', fontFamily:LL.font }}>{label}</button>
              );
            })}
          </div>
        </FField>

        <FField label="名字" required>
          <FInput value={pet.name} onChange={v => set('name', v)} placeholder="给宠物起个名字" />
        </FField>

        <FField label="性别" required>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[['male','男孩 ♂'],['female','女孩 ♀']].map(([v,label]) => {
              const on = pet.gender === v;
              return (
                <button key={v} onClick={() => set('gender', v)} style={{
                  padding:'13px 16px', borderRadius:12,
                  border:`1.5px solid ${on ? LL.ink : LL.border}`,
                  background: on ? LL.ink : '#fff', color: on ? '#fff' : LL.text,
                  fontSize:15, fontWeight: on ? 700 : 500,
                  cursor:'pointer', fontFamily:LL.font }}>{label}</button>
              );
            })}
          </div>
        </FField>

        <FField label="出生日期">
          <FInput type="date" value={pet.dob} onChange={v => set('dob', v)} placeholder="选择出生日期" />
          {age && <div style={{ fontSize:12.5, color:LL.text3, marginTop:7 }}>年龄：{age}</div>}
        </FField>

        <FField label="体重（公斤）">
          <FInput type="number" value={pet.weight} onChange={v => set('weight', v)} placeholder="例：5.5" />
        </FField>

        <FField label="品种">
          <FInput value={pet.breed} onChange={v => set('breed', v)} placeholder="例：金毛、混血" />
        </FField>
      </div>

      {/* ── 健康信息 ── */}
      <FSectionHead title="健康信息" icon="first-aid" iconBg={LL.mint} />
      <div style={{ background:'#fff', padding:'16px 16px 4px' }}>
        <FField label="是否已绝育/节育">
          <RadioPills
            value={pet.spayed === true ? '是' : pet.spayed === false ? '否' : null}
            onChange={v => set('spayed', v === '是' ? true : v === '否' ? false : null)}
            options={['是','否']} />
        </FField>

        <FField label="是否已植入芯片">
          <RadioPills
            value={pet.microchipped === true ? '是' : pet.microchipped === false ? '否' : null}
            onChange={v => set('microchipped', v === '是' ? true : v === '否' ? false : null)}
            options={['是','否']} />
        </FField>

        <FField label="疫苗接种" hint="选择已接种的疫苗">
          <MultiPills value={pet.vaccines} onChange={v => set('vaccines', v)} options={vaccines} />
        </FField>

        <FField label="是否有需要定期服用的药物">
          <RadioPills
            value={pet.hasMeds === true ? '有' : pet.hasMeds === false ? '无' : null}
            onChange={v => set('hasMeds', v === '有' ? true : v === '无' ? false : null)}
            options={['有','无']} />
          {pet.hasMeds === true && (
            <div style={{ marginTop:12 }}>
              <FTextarea value={pet.meds} onChange={v => set('meds', v)} placeholder="药物名称和服用方式" rows={3} />
            </div>
          )}
        </FField>

        <FField label="过敏或特殊饮食需求">
          <FTextarea value={pet.allergies} onChange={v => set('allergies', v)}
            placeholder="如「对鸡肉过敏，只吃x品牌狗粮」" rows={3} />
        </FField>
      </div>

      {/* ── 性格与相处 ── */}
      <FSectionHead title="性格与相处" icon="smiley" iconBg={LL.butter} />
      <div style={{ background:'#fff', padding:'16px 16px 4px' }}>
        {[['withStrangers','与陌生人相处'],['withDogs','与其他狗相处'],['withCats','与猫相处'],['withKids','与小孩相处']].map(([key, label]) => (
          <FField key={key} label={label}>
            <RadioPills value={pet[key]} onChange={v => set(key, v)} options={['友好','容易紧张','不建议接触']} />
          </FField>
        ))}
      </div>

      {/* ── 生活习惯 ── */}
      <FSectionHead title="生活习惯" icon="clock" iconBg={LL.peach} />
      <div style={{ background:'#fff', padding:'16px 16px 4px' }}>
        <FField label="喂食频率">
          <RadioPills value={pet.feedingFreq} onChange={v => set('feedingFreq', v)}
            options={['一天1次','一天2次','一天3次','自助餐','其他']} />
          {pet.feedingFreq === '其他' && (
            <div style={{ marginTop:12 }}>
              <FInput value={pet.feedingOther} onChange={v => set('feedingOther', v)} placeholder="请描述喂食频率" />
            </div>
          )}
        </FField>

        {pet.species === 'dog' && (
          <FField label="遛狗频率">
            <RadioPills value={pet.walkFreq} onChange={v => set('walkFreq', v)}
              options={['一天2次','一天3次','一天4次','其他']} />
            {pet.walkFreq === '其他' && (
              <div style={{ marginTop:12 }}>
                <FInput value={pet.walkOther} onChange={v => set('walkOther', v)} placeholder="请描述遛狗频率" />
              </div>
            )}
          </FField>
        )}

        <FField label="可独处时间">
          <RadioPills value={pet.aloneTime} onChange={v => set('aloneTime', v)}
            options={['1小时内','1-4小时','4-8小时','其他']} />
          {pet.aloneTime === '其他' && (
            <div style={{ marginTop:12 }}>
              <FInput value={pet.aloneOther} onChange={v => set('aloneOther', v)} placeholder="请描述可独处时间" />
            </div>
          )}
        </FField>

        <FField label="精力">
          <RadioPills value={pet.energy} onChange={v => set('energy', v)} options={['高精力','普通精力','低精力']} />
        </FField>
      </div>

      {/* ── 补充信息 ── */}
      <FSectionHead title="补充信息" icon="note-pencil" iconBg="#F5F5FA" />
      <div style={{ background:'#fff', padding:'16px 16px 4px' }}>
        <FField label="其他备注">
          <FTextarea value={pet.notes} onChange={v => set('notes', v)}
            placeholder="有什么其他想告诉寄养师的吗？" rows={4} />
        </FField>
      </div>

      {/* ── 紧急信息 ── */}
      <FSectionHead title="紧急信息" icon="warning" emergency />
      <div style={{ background:'#fff', padding:'16px 16px 4px' }}>
        <FField label="常用宠物医院名称">
          <FInput value={pet.vetName} onChange={v => set('vetName', v)} placeholder="医院名称" />
        </FField>
        <FField label="宠物医院电话">
          <FInput type="tel" value={pet.vetPhone} onChange={v => set('vetPhone', v)} placeholder="电话号码" />
        </FField>
        <FField label="紧急联系人姓名（非本人，如家人）">
          <FInput value={pet.emergencyName} onChange={v => set('emergencyName', v)} placeholder="姓名" />
        </FField>
        <FField label="紧急联系人电话">
          <FInput type="tel" value={pet.emergencyPhone} onChange={v => set('emergencyPhone', v)} placeholder="电话号码" />
        </FField>
      </div>
    </div>
  );
}

// ─── Pet Card ─────────────────────────────────────────────────
function PetCard({ pet, onEdit }) {
  const [expanded, setExpanded] = React.useState(false);
  const age = calcPetAge(pet.dob);

  const friendlyWith = [];
  if (pet.withDogs === '友好') friendlyWith.push({ emoji:'🐕', label:'狗狗' });
  if (pet.withCats === '友好') friendlyWith.push({ emoji:'🐈', label:'猫咪' });
  if (pet.withKids === '友好') friendlyWith.push({ emoji:'👶', label:'小孩' });

  return (
    <div style={{ background:'#fff', borderRadius:16, overflow:'hidden', marginBottom:16, boxShadow:'0 2px 10px rgba(0,0,0,0.06)' }}>
      {/* Photo 16:9 */}
      <div style={{ position:'relative' }}>
        {pet.photo
          ? <img src={pet.photo} style={{ width:'100%', aspectRatio:'16/9', objectFit:'cover', display:'block' }} />
          : <div style={{ width:'100%', aspectRatio:'16/9', background:'linear-gradient(135deg, #D8CAE8 0%, #C7E8D8 100%)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="ph ph-paw-print" style={{ fontSize:52, color:'rgba(30,30,36,0.16)' }} />
            </div>
        }
        <button onClick={onEdit} style={{ position:'absolute', top:10, right:10, width:34, height:34, borderRadius:'50%', border:0, background:'rgba(255,255,255,0.9)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 6px rgba(0,0,0,0.14)' }}>
          <i className="ph ph-pencil-simple" style={{ fontSize:15, color:LL.text2 }} />
        </button>
      </div>

      {/* Basic info */}
      <div style={{ padding:'14px 16px 10px' }}>
        <div style={{ fontSize:20, fontWeight:800, color:LL.text, marginBottom:8 }}>{pet.name}</div>

        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13.5, color:LL.text2, marginBottom:5 }}>
          <i className="ph-fill ph-paw-print" style={{ fontSize:12, color:LL.text3 }} />
          {pet.breed || '未填写品种'}
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13.5, color:LL.text2, marginBottom: pet.spayed ? 5 : 10 }}>
          <i className="ph-fill ph-paw-print" style={{ fontSize:12, color:LL.text3 }} />
          {pet.gender === 'female' ? '母' : pet.gender === 'male' ? '公' : '—'}
          {age && ` · ${age}`}
          {pet.weight && ` · ${pet.weight}kg`}
        </div>

        {pet.spayed && (
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13.5, color:LL.text2, marginBottom:10 }}>
            <span>♀</span> 已绝育/节育
          </div>
        )}

        {/* Health badges */}
        {(pet.spayed || pet.microchipped || (pet.vaccines && pet.vaccines.length > 0)) && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
            {pet.spayed && <span style={{ background:PETS_GREEN_BG, color:PETS_GREEN, borderRadius:5, padding:'2px 8px', fontSize:11.5, fontWeight:600 }}>已绝育</span>}
            {pet.microchipped && <span style={{ background:PETS_GREEN_BG, color:PETS_GREEN, borderRadius:5, padding:'2px 8px', fontSize:11.5, fontWeight:600 }}>已植芯片</span>}
            {(pet.vaccines || []).map(v => <span key={v} style={{ background:PETS_GREEN_BG, color:PETS_GREEN, borderRadius:5, padding:'2px 8px', fontSize:11.5, fontWeight:600 }}>✓ {v}</span>)}
          </div>
        )}

        {/* Friendliness tags */}
        {friendlyWith.length > 0 && (
          <div style={{ marginBottom:6 }}>
            <div style={{ fontSize:11.5, fontWeight:600, color:LL.text3, marginBottom:8 }}>相处友好</div>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
              {friendlyWith.map((f, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:5, background:LL.bg, borderRadius:999, padding:'5px 11px', fontSize:12.5, color:LL.text2, border:`1px solid ${LL.border}` }}>
                  <span style={{ fontSize:14 }}>{f.emoji}</span>{f.label}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Expandable full profile */}
      <button onClick={() => setExpanded(e => !e)} style={{
        width:'100%', padding:'13px 16px', background:'#F5F5F9', border:0, cursor:'pointer', fontFamily:LL.font,
        display:'flex', alignItems:'center', justifyContent:'center', gap:5, fontSize:13.5, fontWeight:600, color:LL.text2,
        borderTop:`1px solid ${LL.border}` }}>
        查看完整档案
        <i className={`ph ph-caret-${expanded ? 'up' : 'right'}`} style={{ fontSize:13 }} />
      </button>

      {expanded && (
        <div style={{ padding:'14px 16px', borderTop:`1px solid ${LL.border}` }}>
          {/* Personality */}
          {pet.withStrangers && <>
            <div style={{ fontSize:12.5, fontWeight:700, color:LL.text, marginBottom:8 }}>性格与相处</div>
            <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:14 }}>
              {[['与陌生人',pet.withStrangers],['与其他狗',pet.withDogs],['与猫咪',pet.withCats],['与小孩',pet.withKids]].filter(([,v])=>v).map(([label,val])=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:13.5, color:LL.text2 }}>
                  <span>{label}</span>
                  <span style={{ fontWeight:600, color: val==='友好' ? PETS_GREEN : val==='不建议接触' ? '#CC2200' : LL.text }}>{val}</span>
                </div>
              ))}
            </div>
          </>}

          {/* Habits */}
          {pet.feedingFreq && <>
            <div style={{ fontSize:12.5, fontWeight:700, color:LL.text, marginBottom:8 }}>生活习惯</div>
            <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:14 }}>
              {[[' 喂食频率',pet.feedingFreq],[' 可独处时间',pet.aloneTime],[' 精力',pet.energy]].filter(([,v])=>v).map(([label,val])=>(
                <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:13.5, color:LL.text2 }}>
                  <span>{label}</span><span style={{ fontWeight:600, color:LL.text }}>{val}</span>
                </div>
              ))}
            </div>
          </>}

          {/* Emergency */}
          {(pet.vetName || pet.emergencyName) && <>
            <div style={{ fontSize:12.5, fontWeight:700, color:'#B45309', marginBottom:8 }}>紧急联系</div>
            {pet.vetName && <div style={{ fontSize:13, color:LL.text2, marginBottom:5 }}>🏥 {pet.vetName}{pet.vetPhone && ` · ${pet.vetPhone}`}</div>}
            {pet.emergencyName && <div style={{ fontSize:13, color:LL.text2 }}>👤 {pet.emergencyName}{pet.emergencyPhone && ` · ${pet.emergencyPhone}`}</div>}
          </>}

          <button onClick={onEdit} style={{ marginTop:14, width:'100%', height:42, borderRadius:999, border:`1px solid ${LL.border}`, background:'transparent', fontSize:13.5, fontWeight:600, color:LL.text2, cursor:'pointer', fontFamily:LL.font }}>
            编辑完整资料
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Pets List Page ───────────────────────────────────────────
function PetsListPage({ pets, onAddPet, onEditPet }) {
  return (
    <div style={{ paddingBottom:32 }}>
      {/* Page title header */}
      <div style={{ padding:'20px 16px 14px', background:'#fff', borderBottom:`1px solid ${LL.border}` }}>
        <div style={{ fontSize:24, fontWeight:800, color:LL.text, marginBottom:6 }}>我的宠物</div>
        <div style={{ fontSize:13.5, color:LL.text2, lineHeight:1.65 }}>
          帮助守护者了解我的宠物，让他们更放心地接单并提供贴心照护。
        </div>
      </div>
      <div style={{ padding:'16px 16px 0' }}>
        {/* 添加宠物 button — above cards */}
        <button onClick={onAddPet} style={{
          width:'100%', height:52, borderRadius:999, marginBottom:16,
          border:`1.5px dashed ${LL.border}`, background:'transparent',
          fontSize:14, fontWeight:600, color:LL.text2, cursor:'pointer',
          fontFamily:LL.font, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <i className="ph ph-plus" style={{ fontSize:18 }} />
          添加宠物
        </button>
        {pets.map(pet => (
          <PetCard key={pet.id} pet={pet} onEdit={() => onEditPet(pet)} />
        ))}
      </div>
    </div>
  );
}

// ─── Pet Reminder Sheet ───────────────────────────────────────
function PetReminderSheet({ onViewPets, onContinue, onDismiss }) {
  return (
    <>
      <div onClick={onDismiss} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.42)', zIndex:50 }} />
      <div style={{ position:'absolute', left:0, right:0, bottom:0, zIndex:51, background:'#fff',
        borderTopLeftRadius:22, borderTopRightRadius:22, padding:'14px 20px 44px', fontFamily:LL.font }}>
        <div style={{ width:38, height:4, borderRadius:2, background:LL.border, margin:'0 auto 18px' }} />
        <div style={{ textAlign:'center', marginBottom:22 }}>
          <div style={{ fontSize:36, marginBottom:10 }}>🐾</div>
          <div style={{ fontSize:17, fontWeight:700, color:LL.text, marginBottom:8 }}>完善宠物资料</div>
          <div style={{ fontSize:13.5, color:LL.text2, lineHeight:1.65, padding:'0 8px' }}>
            帮助守护者了解您的宠物，提升申请通过率并获得更贴心的照护。
          </div>
        </div>
        <button onClick={onViewPets} style={{ width:'100%', height:52, borderRadius:999, border:0, background:LL.ink, color:'#fff', fontSize:15, fontWeight:700, fontFamily:LL.font, cursor:'pointer', marginBottom:12 }}>
          完善宠物资料
        </button>
        <button onClick={onContinue} style={{ width:'100%', height:44, borderRadius:999, border:`1.5px solid ${LL.border}`, background:'transparent', fontSize:14, fontWeight:500, color:LL.text2, fontFamily:LL.font, cursor:'pointer' }}>
          直接预约
        </button>
      </div>
    </>
  );
}

// ─── Main Screen ──────────────────────────────────────────────
function PetsScreen({ onBack }) {
  const [pets, setPets] = React.useState(PETS_INIT);
  const [view, setView] = React.useState('list'); // 'list' | 'add' | 'edit'
  const [editingPet, setEditingPet] = React.useState(null);

  const handleSave = (pet) => {
    if (pet.id) {
      setPets(ps => ps.map(p => p.id === pet.id ? pet : p));
    } else {
      setPets(ps => [...ps, { ...pet, id: `p${Date.now()}` }]);
    }
    setView('list');
    setEditingPet(null);
  };

  if (view === 'add' || view === 'edit') {
    return (
      <AddEditPetForm
        initialPet={view === 'edit' ? editingPet : null}
        onSave={handleSave}
        onBack={() => { setView('list'); setEditingPet(null); }}
      />
    );
  }

  return (
    <div style={{ background:LL.bg, minHeight:'100%', overflowY:'auto' }}>
      {/* Header */}
      <div style={{ position:'sticky', top:0, zIndex:20, height:52, background:'#fff',
        borderBottom:`1px solid ${LL.border}`, display:'flex', alignItems:'center', padding:'0 14px' }}>
        <button onClick={onBack} style={{ width:34, height:34, borderRadius:'50%', border:0, background:LL.bg, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' }}>
          <i className="ph ph-caret-left" style={{ fontSize:17, color:LL.text }} />
        </button>
        <div style={{ flex:1, textAlign:'center', fontSize:15, fontWeight:700, color:LL.text }}>我的宠物</div>
        <button onClick={() => setView('add')} style={{ width:34, height:34, borderRadius:'50%', border:0, background:LL.bg, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flex:'0 0 auto' }}>
          <i className="ph ph-plus" style={{ fontSize:18, color:LL.text }} />
        </button>
      </div>

      <PetsListPage
        pets={pets}
        onAddPet={() => setView('add')}
        onEditPet={(pet) => { setEditingPet(pet); setView('edit'); }}
      />
    </div>
  );
}

Object.assign(window, { PetsScreen, PetReminderSheet });
