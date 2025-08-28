(function(){
  const { CASES, S, isSynonym } = window.EEG_DATA;
  const BOOKS = window.EEG_BOOKS || [];

  // ==== Simple XP (no profiles) ====
  let XP = parseInt(getLS('eeg_xp','0')||'0',10);
  let BEST = parseInt(getLS('eeg_best','0')||'0',10);
  let STREAK = parseInt(getLS('eeg_streak','0')||'0',10);
  let ADVANCED = (getLS('eeg_adv','0')||'0')==='1';

  function levelFromXP(x){ return Math.floor(x/100)+1; }
  function saveProgress(){ setLS('eeg_xp', String(XP)); setLS('eeg_best', String(BEST)); setLS('eeg_streak', String(STREAK)); if(window.onProfileUpdate){ try{ window.onProfileUpdate({XP,BEST,STREAK,ADVANCED}); }catch(e){} } }
  function awardXP(n){ XP+=n; saveProgress(); refreshMeta(); }
  function medalsList(){ const m=[]; if(STREAK>=5)m.push('Kombájn – 5 helyes egymás után'); if(BEST>=90)m.push('Sasszem – 90%+'); if(XP>=300)m.push('Maraton – 300 XP'); return m; }
  function refreshMeta(){
    byId('xp').textContent=String(XP);
    byId('lvl').textContent=String(levelFromXP(XP));
    byId('lvlLbl').textContent=tK('levelLbl');
    byId('xpLbl').textContent=tK('xpLbl');
    const medals=byId('medals'); medals.innerHTML='';
    const m=medalsList();
    if(!m.length){ medals.innerHTML = '<li>'+(getLang()==='HU'?'Még nincs – gyűjts kihívásokat!':'No medals yet — keep going!')+'</li>'; }
    else m.forEach(x=>{ const li=document.createElement('li'); li.textContent=x; medals.appendChild(li); });
    byId('best').textContent=String(BEST);
    byId('advState').textContent = ADVANCED ? tK('advanced_on') : tK('advanced_off');
  }

  // ==== State & helpers ====
  let mode='explore', showAns=true, playing=true, speed=1.0; let tExplore=0; let diffFilter='beginner';
  let current=CASES[0], idCurrent=CASES[0], idFreeze=false, idOff=0;
  let qCurrent=CASES.find(c=>c.includeInQuiz)||CASES[0], qFreeze=false, qShowAnswer=false, qOff=0, marks=[];
  let bookCurrent = BOOKS[0] || null, bookPage = 0;

// ==== Cloud profile bridge (Firebase optional) ====
window.getProfile = ()=>({ XP, BEST, STREAK, ADVANCED });
window.applyProfile = (p)=>{
  if(!p) return;
  XP = p.XP|0; BEST = p.BEST|0; STREAK = p.STREAK|0; ADVANCED = !!p.ADVANCED;
  setLS('eeg_xp', String(XP));
  setLS('eeg_best', String(BEST));
  setLS('eeg_streak', String(STREAK));
  setLS('eeg_adv', ADVANCED?'1':'0');
  refreshMeta(); syncMeta(); syncTexts();
};


  function rotatedIndex(i, off, N){ return ((i-off)%N + N) % N; }
  function byId(x){ return document.getElementById(x); }
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  // ==== UI text sync ====
  window.syncTexts = function(){
    byId('tabExplore').textContent = tK('explore');
    byId('tabIdentify').textContent = tK('identify');
    byId('tabQuiz').textContent = tK('quiz');
    byId('tabLessons').textContent = tK('lessons');
    if(byId('tabBook')) byId('tabBook').textContent = tK('book');
    byId('solutionLbl').textContent = tK('solution');
    byId('ansLbl').textContent = showAns ? tK('on') : tK('off');
    byId('speedLbl').textContent = tK('speed');
    byId('spdLbl').textContent = speed.toFixed(1)+'×';
    byId('explainHdr').textContent = tK('details');
    byId('tipsHdr').textContent = tK('tips');
    byId('newIdentify').textContent = tK('newTask');
    byId('freezeIdentify').textContent = tK('freeze');
    byId('hintBtn').textContent = tK('hint');
    if (byId('guess')) { byId('guess').placeholder = tK('guessPH'); }
    byId('check').textContent = tK('check');
    byId('resetQuiz').textContent = tK('reset');
    byId('freezeQuiz').textContent = tK('freeze');
    byId('snapshotQuiz').textContent = tK('nextSnap');
    byId('showSolution').textContent = tK('solution')+' + XP';
    byId('scoreHdr').textContent = tK('score');
    byId('hitsLblTxt').textContent = tK('hits');
    byId('totalLbl').textContent = tK('total');
    byId('bestLbl').textContent = tK('best');
    byId('medalHdr').textContent = tK('medals');
    byId('footerTxt').textContent = tK('footer');
    byId('langBtn').textContent = getLang() + ' ▾';
    byId('miniQuizHdr').textContent = tK('miniQuiz');
    byId('lqInstr').textContent = tK('selectAll');
    byId('lqSubmit').textContent = tK('submit');
    byId('quizInstr').textContent = tK('task_explain');
    byId('advBtn').title = tK('advanced');
    byId('advState').textContent = ADVANCED ? tK('advanced_on') : tK('advanced_off');
    refreshAllSelectors();
    syncMeta();
    syncTask();
    refreshMeta();
  };

  function mapDiff(d){
    const m = { beginner: tK('beginner'), intermediate: tK('intermediate'), hard:tK('hard'), expert:tK('expert') };
    return m[d] || d;
  }

  function syncMeta(){
    const LANG = getLang();
    const dict = window.I18N[LANG];
    byId('meta').textContent = dict.caseMeta(current.montage, mapDiff(current.diff), (LANG==='HU'?current.titleHU:current.titleEN));
    byId('desc').textContent = (LANG==='HU'?current.descHU:current.descEN);
    const tagDiv=byId('tags'); tagDiv.innerHTML = (current.tags||[]).map(x=>`<span class="chip">${x}</span>`).join(' ');

    // Explanations
    const expl = (LANG==='HU'?current.explainHU:current.explainEN);
    const explAdv = (LANG==='HU'?(current.explainAdvHU||''): (current.explainAdvEN||''));
    byId('explain').textContent = expl;
    byId('explainAdv').textContent = explAdv || (LANG==='HU'?'(Nincs további haladó magyarázat.)':'(No additional advanced notes.)');
    byId('explainAdv').classList.toggle('hidden', !ADVANCED);

    // Tips
    const tips = (LANG==='HU'?current.tipsHU:current.tipsEN) || [];
    const tipsAdv = (LANG==='HU'?current.tipsAdvHU:current.tipsAdvEN) || [];
    const ul = byId('tips'); ul.innerHTML=''; tips.forEach(t=>{ const li=document.createElement('li'); li.textContent=t; ul.appendChild(li); });
    const ulA = byId('tipsAdv'); ulA.innerHTML=''; tipsAdv.forEach(t=>{ const li=document.createElement('li'); li.textContent=t; ulA.appendChild(li); });
    byId('tipsAdv').classList.toggle('hidden', !ADVANCED);
  }

  function syncTask(){ const LANG=getLang(); const txt = LANG==='HU' ? (qCurrent.quizTargetHU||'események') : (qCurrent.quizTargetEN||'events'); byId('task').textContent = window.I18N[LANG].task(txt); const has = quizTotal()>0; byId('noEvents').style.display = has?'none':'block'; byId('noEvents').textContent = tK('noEvents'); }

  // ==== Tabs ====
  function setTab(tab){
    mode=tab;
    byId('tabExplore').className = tab==='explore'?'primary':'ghost';
    byId('tabIdentify').className = tab==='identify'?'primary':'ghost';
    byId('tabQuiz').className = tab==='quiz'?'primary':'ghost';
    byId('tabLessons').className = tab==='lessons'?'primary':'ghost';
    if(byId('tabBook')) byId('tabBook').className = tab==='book'?'primary':'ghost';
    byId('explore').classList.toggle('hidden', tab!=='explore');
    byId('identify').classList.toggle('hidden', tab!=='identify');
    byId('quiz').classList.toggle('hidden', tab!=='quiz');
    byId('lessons').classList.toggle('hidden', tab!=='lessons');
    if(byId('book')) byId('book').classList.toggle('hidden', tab!=='book');
  }
  byId('tabExplore').onclick=()=>setTab('explore');
  byId('tabIdentify').onclick=()=>setTab('identify');
  byId('tabQuiz').onclick=()=>setTab('quiz');
  byId('tabLessons').onclick=()=>setTab('lessons');
  if(byId('tabBook')) byId('tabBook').onclick=()=>setTab('book');

  // ==== Explore ====
  const caseSel = byId('caseSel');
  function refreshCaseOptions(){ caseSel.innerHTML=''; CASES.forEach(c=>{ const o=document.createElement('option'); o.value=c.id; o.textContent=(getLang()==='HU'?c.titleHU:c.titleEN); caseSel.appendChild(o); }); caseSel.value=current.id; }
  caseSel.onchange=()=>{ current = CASES.find(c=>c.id===caseSel.value); syncMeta(); };
  byId('toggleAns').onclick=()=>{ showAns=!showAns; byId('ansLbl').textContent=showAns?tK('on'):tK('off'); };
  byId('playBtn').onclick=()=>{ playing=!playing; byId('playBtn').textContent= playing?'⏯️ '+tK('pause'):'▶️ '+tK('play'); };
  byId('speed').oninput=(e)=>{ speed=parseFloat(e.target.value); byId('spdLbl').textContent=speed.toFixed(1)+'×'; };
  byId('langBtn').onclick=()=>{ setLang(getLang()==='HU'?'US':'HU'); };
  byId('advBtn').onclick=()=>{ ADVANCED=!ADVANCED; setLS('eeg_adv', ADVANCED?'1':'0'); refreshMeta(); syncMeta(); syncTexts(); if(window.onProfileUpdate){ try{ window.onProfileUpdate({XP,BEST,STREAK,ADVANCED}); }catch(e){} } };

  // ==== Identify ====
  const difficulty = byId('difficulty');
  function buildDifficulty(){
    const prev = difficulty.value;
    const opts=[
      ["beginner",tK('beginner')],
      ["intermediate",tK('intermediate')],
      ["hard",tK('hard')],
      ["expert",tK('expert')],
      ["all",tK('all')]
    ];
    difficulty.innerHTML='';
    opts.forEach(([v,txt])=>{
      const o=document.createElement('option');
      o.value=v;
      o.textContent=txt;
      difficulty.appendChild(o);
    });
    if(prev) difficulty.value = prev;
  }
  const idfMeta = byId('idfMeta'); const mcqDiv = byId('mcq'); const fb = byId('fb');
  // when difficulty changes, immediately load a new case from that level
  difficulty.onchange=()=>{ idRandomCase(); };
  byId('newIdentify').onclick=()=>idRandomCase(); byId('freezeIdentify').onclick=()=>{ idFreeze=!idFreeze; if(!idFreeze) idOff=0; };
  byId('hintBtn').onclick=()=>{ const title = (getLang()==='HU'?idCurrent.titleHU:idCurrent.titleEN); const initials = title.split(' ').map(w=>w[0].toUpperCase()).join(''); fb.classList.remove('hidden','no'); fb.classList.add('ok'); fb.textContent = tK('hintText') + initials; };
  byId('check').onclick=handleIdentify;
  function filteredCases(){
    const val=difficulty.value||'beginner';
    if(val==='all') return CASES;
    if(val==='expert') return CASES.filter(c=>c.diff==='expert'||c.diff==='hard');
    return CASES.filter(c=>c.diff===val);
  }
  function idRandomCase(){ const arr=filteredCases(); idCurrent = arr[Math.floor(Math.random()*arr.length)]; const LANG=getLang(); idfMeta.textContent = window.I18N[LANG].idfMeta(mapDiff(idCurrent.diff), idCurrent.montage); fb.className='kudos hidden'; fb.textContent=''; buildIdentifyChoices(); }
  function buildIdentifyChoices(){
    // Build 4 options: correct + 3 foils (prefer same difficulty if possible)
    const langHU = getLang()==='HU';
    const correct = idCurrent;
    // Candidate pool for foils
    let pool = CASES.filter(c=>c.id!==correct.id && (c.diff===correct.diff));
    if(pool.length<3){ pool = CASES.filter(c=>c.id!==correct.id); }
    const foils = [];
    const used = new Set([correct.id]);
    while(foils.length<3 && pool.length){
      const idx = Math.floor(Math.random()*pool.length);
      const cand = pool.splice(idx,1)[0];
      if(!used.has(cand.id)){
        foils.push(cand);
        used.add(cand.id);
      }
    }
    const options = shuffle([correct, ...foils]);
    // Render as radio buttons
    mcqDiv.innerHTML = '';
    options.forEach((c, i)=>{
      const label = langHU ? c.titleHU : c.titleEN;
      const wrap = document.createElement('label');
      wrap.style.display='flex'; wrap.style.alignItems='center'; wrap.style.gap='8px';
      const rb = document.createElement('input');
      rb.type='radio'; rb.name='mcq'; rb.value=c.id;
      if(i===0) rb.checked=false;
      const txt = document.createElement('span'); txt.textContent = label;
      wrap.appendChild(rb); wrap.appendChild(txt);
      mcqDiv.appendChild(wrap);
    });
  }

  idRandomCase();
  function handleIdentify(){ const sel = (mcqDiv.querySelector('input[name="mcq"]:checked')||{}).value; if(!sel) return; const ok = (sel===idCurrent.id); fb.classList.remove('hidden'); fb.classList.add(ok?'ok':'no'); const sol = (getLang()==='HU'?idCurrent.titleHU:idCurrent.titleEN); fb.textContent = ok ? tK('correct') : (tK('wrong') + sol); awardXP(ok?20:2); if(ok){ STREAK++; setTimeout(()=>{ idRandomCase(); refreshMeta(); }, 900); } else { STREAK=0; refreshMeta(); } saveProgress(); }

  // ==== Quiz + snapshot ====
  const caseSelQ = byId('caseSelQ');
  function refreshCaseOptionsQ(){ caseSelQ.innerHTML=''; CASES.filter(c=>c.includeInQuiz).forEach(c=>{ const o=document.createElement('option'); o.value=c.id; o.textContent=(getLang()==='HU'?c.titleHU:c.titleEN); caseSelQ.appendChild(o); }); caseSelQ.value=qCurrent.id; }
  caseSelQ.onchange=()=>{ qCurrent = CASES.find(c=>c.id===caseSelQ.value); marks=[]; qShowAnswer=false; qOff=0; syncQuizMeta(); syncTask(); };
  byId('resetQuiz').onclick=()=>{ marks=[]; qShowAnswer=false; qOff=0; qFreeze=false; const b=byId('freezeQuiz'); if(b) b.removeAttribute('disabled'); syncQuizMeta(); };
  byId('freezeQuiz').onclick=()=>{ if(qFreeze) return; qFreeze=true; byId('freezeQuiz').setAttribute('disabled','true'); };
  byId('snapshotQuiz').onclick=()=>{ marks=[]; qShowAnswer=false; qFreeze=false; const b=byId('freezeQuiz'); if(b) b.removeAttribute('disabled'); qOff = Math.floor(Math.random()* (qCurrent.sampleRate-1) ); syncQuizMeta(); };
  byId('showSolution').onclick=()=>{ qShowAnswer=true; const pct=quizPct(); awardXP( pct>=80 ? 40 : 15 ); BEST = Math.max(BEST, pct); saveProgress(); refreshMeta(); if(pct>=100){ setTimeout(()=>{ const b=byId('snapshotQuiz'); if(b) b.click(); }, 800); } };

  // Block marking while running
  byId('eeg3').addEventListener('click',(e)=>{
    if(mode!=='quiz') return;
    if(!qFreeze){
      // show banner
      const b=byId('errorBanner');
      b.style.display='block';
      b.textContent=tK('freeze_first');
      setTimeout(()=>{ b.style.display='none'; }, 1800);
      return;
    }
    const r=e.target.getBoundingClientRect();
    const x=(e.clientX-r.left)*devicePixelRatio;
    const y=(e.clientY-r.top)*devicePixelRatio;
    marks.push({x,y});
    syncQuizMeta();
  });

  function quizTotal(){ return qCurrent.channels.reduce((a,ch)=>a+(ch.spikes?.length||0),0); }
  function quizHits(off=0){
    const dx=80*devicePixelRatio; // tágabb találati ablak
    const xScale=(byId('eeg3').width / qCurrent.sampleRate);
    let correct=0;
    qCurrent.channels.forEach(ch=> ch.spikes.forEach(sx=>{
      const pos = rotatedIndex(sx, off, qCurrent.sampleRate);
      const sxpx = pos*xScale;
      if(marks.some(m=>Math.abs(m.x-sxpx)<dx)) correct++;
    }));
    return correct;
  }
  function quizPct(){ const t=quizTotal(); const h=quizHits(qOff); return t?Math.round(h/t*100):0; }
  function syncQuizMeta(){ byId('total').textContent=String(quizTotal()); byId('hits').textContent=String(quizHits(qOff)); const p=quizPct(); byId('pct').textContent=p+'%'; byId('bar').style.width=p+'%'; }

  // ==== Lessons ====
  const LESSONS = window.LESSONS || [];
  const lessonLevelSel = byId('lessonLevel'); const lessonSel = byId('lessonSel');
  function buildLessonLevels(){
    const levels = [["beginner",tK('lessonsBeginner')],["intermediate",tK('lessonsIntermediate')],["expert",tK('lessonsExpert')],["all",tK('all')]];
    const prev = lessonLevelSel.value || 'beginner';
    lessonLevelSel.innerHTML=''; levels.forEach(([v,txt])=>{ const o=document.createElement('option'); o.value=v; o.textContent=txt; lessonLevelSel.appendChild(o); });
    lessonLevelSel.value = prev;
  }
  function refreshLessons(){
    const lvl = lessonLevelSel.value || 'beginner';
    const list = LESSONS.filter(L=> lvl==='all' || L.level===lvl);
    lessonSel.innerHTML=''; list.forEach(L=>{ const o=document.createElement('option'); o.value=L.id; o.textContent=(getLang()==='HU'?L.titleHU:L.titleEN); lessonSel.appendChild(o); });
    if(lessonSel.options.length>0) lessonSel.value = lessonSel.options[0].value;
  }
  lessonLevelSel.onchange=()=>{ refreshLessons(); };
  function renderLesson(id){
    const L = LESSONS.find(x=>x.id===id); const body=byId('lessonBody'); body.innerHTML='';
    if(!L) return;
    L.steps.forEach(step=>{ const card=document.createElement('div'); card.className='card'; card.innerHTML = (getLang()==='HU'?step.htmlHU:step.htmlEN); body.appendChild(card); });
    const q=byId('lessonQuiz'); q.classList.remove('hidden');
    byId('lqQ').textContent = (getLang()==='HU'?L.quiz.qHU:L.quiz.qEN);
    const choices=byId('lqChoices'); choices.innerHTML='';
    L.quiz.choices.forEach((c,i)=>{
      const wrap=document.createElement('label'); wrap.style.display='flex'; wrap.style.alignItems='center'; wrap.style.gap='8px';
      const cb=document.createElement('input'); cb.type='checkbox'; cb.dataset.index=i;
      const txt=document.createElement('span'); txt.textContent=(getLang()==='HU'?c.hu:c.en);
      wrap.appendChild(cb); wrap.appendChild(txt); choices.appendChild(wrap);
    });
    byId('lqSubmit').onclick=()=>{
      let gained=0, best=0;
      const cbs=choices.querySelectorAll('input');
      L.quiz.choices.forEach((c,i)=>{ best+= (c.ok?c.xp:0); if(cbs[i].checked && c.ok) gained+=c.xp; });
      const fb=byId('lqFb'); fb.classList.remove('hidden'); fb.classList.add('ok');
      fb.textContent = tK('gained') + gained + ' • ' + tK('bestPossible') + best;
      if(gained>0) awardXP(gained);
    };
  }
  byId('startLesson').onclick=()=> renderLesson(lessonSel.value);

  // ==== Book ====
  const bookSel = byId('bookSel');
  function buildBookSelect(){
    if(!bookSel) return;
    const prev = bookSel.value;
    bookSel.innerHTML='';
    BOOKS.forEach(b=>{ const o=document.createElement('option'); o.value=b.id; o.textContent=(getLang()==='HU'?b.titleHU:b.titleEN); bookSel.appendChild(o); });
    if(prev) bookSel.value = prev;
    else if(bookCurrent) bookSel.value = bookCurrent.id;
  }
  function syncBook(){
    if(!bookCurrent || !byId('bookBody')) return;
    const p = bookCurrent.pages[bookPage];
    const lang = getLang();
    const txt = lang==='HU' ? (ADVANCED ? p.advHU : p.hu) : (ADVANCED ? p.advEN : p.en);
    byId('bookBody').textContent = txt;
    byId('bookPageLbl').textContent = (bookPage+1)+'/'+bookCurrent.pages.length;
  }
  if(bookSel){
    bookSel.onchange=()=>{ bookCurrent = BOOKS.find(b=>b.id===bookSel.value) || bookCurrent; bookPage=0; syncBook(); };
    if(byId('bookPrev')) byId('bookPrev').onclick=()=>{ if(bookCurrent && bookPage>0){ bookPage--; syncBook(); } };
    if(byId('bookNext')) byId('bookNext').onclick=()=>{ if(bookCurrent && bookPage<bookCurrent.pages.length-1){ bookPage++; syncBook(); } };
  }

  // ==== Drawing (safe RAF) ====
  function fitCanvas(c){ const w=c.clientWidth*devicePixelRatio, h=c.clientHeight*devicePixelRatio; if(c.width!==w||c.height!==h){ c.width=w; c.height=h; } }
  function toXY(c, i, yVal, idx, chCount, sampleRate){ const xScale = c.width / sampleRate; const chGap=(c.height-40)/chCount; const yBase=20+idx*chGap+chGap/2; const yScale=12*devicePixelRatio; return {x:i*xScale, y:yBase - yVal*yScale, yBase, chGap}; }
// === Microvolt + time scales ===
const UV_PER_UNIT = 20; // 1 unit amplitude ≈ 20 µV
function drawScales(ctx, canvas, sampleRate, chCount){
  try{
    const uV = 50; // 50 µV bar
    const units = uV / UV_PER_UNIT;
    // vertical bar using channel 0 geometry
    const p0 = toXY(canvas, 0, 0, 0, Math.max(1,chCount), sampleRate);
    const pU = toXY(canvas, 0, units, 0, Math.max(1,chCount), sampleRate);
    const h = Math.abs(p0.y - pU.y);
    const x = canvas.width - 80*devicePixelRatio, y = 40*devicePixelRatio;
    ctx.strokeStyle='#93a3c8'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - h); ctx.stroke();
    ctx.font=(12*devicePixelRatio)+'px system-ui'; ctx.fillStyle='#93a3c8';
    ctx.fillText(uV+' µV', x-6*devicePixelRatio, y - h - 6*devicePixelRatio);

    // 1 s time marker
    const secPx = canvas.width / Math.max(1,(sampleRate));
    const yb = canvas.height - 16*devicePixelRatio;
    ctx.beginPath(); ctx.moveTo(20*devicePixelRatio, yb);
    ctx.lineTo(20*devicePixelRatio + secPx, yb); ctx.stroke();
    ctx.fillText('1 s', 22*devicePixelRatio, yb - 6*devicePixelRatio);
  }catch(_){}
}


  function drawExplore(){
    const canvas=byId('eeg'); fitCanvas(canvas);
    if(playing){ tExplore = (tExplore + 0.06*speed) % current.sampleRate; }
    const off=Math.floor(tExplore); const ctx=canvas.getContext('2d');
    ctx.fillStyle='#0b0f1a'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='#142038'; ctx.lineWidth=1;
    for(let x=0;x<canvas.width;x+=50*devicePixelRatio){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
    for(let y=0;y<canvas.height;y+=50*devicePixelRatio){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
    ctx.lineWidth=2;
    current.channels.forEach((ch,idx)=>{
      const rotated = ch.data.slice(off).concat(ch.data.slice(0,off));
      ctx.strokeStyle='#dbe5ff'; ctx.beginPath();
      rotated.forEach((v,i)=>{ const p=toXY(canvas,i,v,idx,current.channels.length,current.sampleRate); if(i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y); });
      ctx.stroke();
      const p0=toXY(canvas,0,0,idx,current.channels.length,current.sampleRate);
      ctx.fillStyle='#93a3c8'; ctx.font=(12*devicePixelRatio)+'px system-ui'; ctx.fillText(ch.name, 10*devicePixelRatio, p0.yBase - p0.chGap/2 + 14*devicePixelRatio);
      if(showAns){ ctx.strokeStyle='#ff4d4d'; ctx.lineWidth=3; ch.spikes.forEach(sx=>{ const pos=rotatedIndex(sx,off,current.sampleRate); const x=pos*(canvas.width/current.sampleRate); const y=p0.yBase - rotated[pos]*(12*devicePixelRatio); ctx.beginPath(); ctx.arc(x,y,14*devicePixelRatio,0,Math.PI*2); ctx.stroke(); }); }
    });
  
    // scales
    drawScales(ctx, canvas, current.sampleRate, current.channels.length);
}

  function drawIdentify(){
    const canvas=byId('eeg2'); fitCanvas(canvas); const ctx=canvas.getContext('2d');
    if(!idFreeze){ idOff=Math.floor((performance.now()*0.06*speed)%idCurrent.sampleRate); }
    const off=idOff;
    ctx.fillStyle='#0b0f1a'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='#142038'; ctx.lineWidth=1;
    for(let x=0;x<canvas.width;x+=50*devicePixelRatio){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
    for(let y=0;y<canvas.height;y+=50*devicePixelRatio){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
    ctx.lineWidth=2;
    idCurrent.channels.forEach((ch,idx)=>{
      const rotated = ch.data.slice(off).concat(ch.data.slice(0,off));
      ctx.strokeStyle='#dbe5ff'; ctx.beginPath();
      rotated.forEach((v,i)=>{ const p=toXY(canvas,i,v,idx,idCurrent.channels.length,idCurrent.sampleRate); if(i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y); });
      ctx.stroke();
      const p0=toXY(canvas,0,0,idx,idCurrent.channels.length,idCurrent.sampleRate);
      ctx.fillStyle='#93a3c8'; ctx.font=(12*devicePixelRatio)+'px system-ui'; ctx.fillText(ch.name, 10*devicePixelRatio, p0.yBase - p0.chGap/2 + 14*devicePixelRatio);
    });
  
    // scales
    drawScales(ctx, canvas, idCurrent.sampleRate, idCurrent.channels.length);
}

  function drawQuiz(){
    const canvas=byId('eeg3'); fitCanvas(canvas); const ctx=canvas.getContext('2d');
    if(!qFreeze){ qOff=Math.floor((performance.now()*0.06*speed)%qCurrent.sampleRate); }
    const off=qOff;
    ctx.fillStyle='#0b0f1a'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle='#142038'; ctx.lineWidth=1;
    for(let x=0;x<canvas.width;x+=50*devicePixelRatio){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); ctx.stroke(); }
    for(let y=0;y<canvas.height;y+=50*devicePixelRatio){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); ctx.stroke(); }
    ctx.lineWidth=2;
    qCurrent.channels.forEach((ch,idx)=>{
      const rotated = ch.data.slice(off).concat(ch.data.slice(0,off));
      ctx.strokeStyle='#dbe5ff'; ctx.beginPath();
      rotated.forEach((v,i)=>{ const p=toXY(canvas,i,v,idx,qCurrent.channels.length,qCurrent.sampleRate); if(i===0) ctx.moveTo(p.x,p.y); else ctx.lineTo(p.x,p.y); });
      ctx.stroke();
      const p0=toXY(canvas,0,0,idx,qCurrent.channels.length,qCurrent.sampleRate);
      ctx.fillStyle='#93a3c8'; ctx.font=(12*devicePixelRatio)+'px system-ui'; ctx.fillText(ch.name, 10*devicePixelRatio, p0.yBase - p0.chGap/2 + 14*devicePixelRatio);
      if(qShowAnswer){ ctx.strokeStyle='#ff4d4d'; ctx.lineWidth=3; ch.spikes.forEach(sx=>{ const pos=rotatedIndex(sx,off,qCurrent.sampleRate); const x=pos*(canvas.width/qCurrent.sampleRate); const y=p0.yBase - rotated[pos]*(12*devicePixelRatio); ctx.beginPath(); ctx.arc(x,y,14*devicePixelRatio,0,Math.PI*2); ctx.stroke(); }); }
    });
    // Jelölések – csak a kvíz canvason, explore/identify-ben soha
    ctx.strokeStyle='#60a5fa'; ctx.lineWidth=3; marks.forEach(m=>{ ctx.beginPath(); ctx.arc(m.x,m.y,18*devicePixelRatio,0,Math.PI*2); ctx.stroke(); });
    const pct=quizPct(); const hits=quizHits(off); byId('hits').textContent=String(hits); byId('pct').textContent=pct+'%'; byId('bar').style.width=pct+'%';
  
    // scales
    drawScales(ctx, canvas, qCurrent.sampleRate, qCurrent.channels.length);
}

  // ==== Safe animation loop ====
  function loop(){
    try{ drawExplore(); drawIdentify(); drawQuiz(); }
    catch(e){ const b=byId('errorBanner'); b.style.display='block'; b.textContent='Draw error: '+(e?.message||e); }
    requestAnimationFrame(loop);
  }

  // ==== Init ====
  function refreshAllSelectors(){
    refreshCaseOptions(); refreshCaseOptionsQ(); buildDifficulty(); buildLessonLevels(); refreshLessons(); buildBookSelect();
  }
  function init(){
    refreshAllSelectors();
    syncTexts(); setTab('explore');
    try {
      console.assert(typeof quizTotal()==='number', 'quizTotal should return number');
      console.assert(document.getElementById('lessonSel'), 'lessonSel missing');
    } catch(e){ console.error('Self-test', e); }
    requestAnimationFrame(loop);
  }
  init();
})();