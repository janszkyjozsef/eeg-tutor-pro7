/* ==== Safe storage (GitHub Pages/iframes) ==== */
(function(){
  const SafeStore = (()=> {
    try { const t='__eeg_test__'; localStorage.setItem(t,'1'); localStorage.removeItem(t); return localStorage; }
    catch(e){ const mem={}; return {getItem:k=>mem[k]??null, setItem:(k,v)=>{mem[k]=String(v)}, removeItem:k=>{delete mem[k]}}; }
  })();
  window.SafeStore = SafeStore;
  window.getLS=(k,def=null)=>{ try{ const v=SafeStore.getItem(k); return v===null?def:v; }catch(e){ return def; } };
  window.setLS=(k,v)=>{ try{ SafeStore.setItem(k,v); }catch(e){} };

  /* ==== i18n (HU/US) ==== */
  const I18N = {
    HU: {
      explore:"Explore", identify:"Identify", quiz:"Quiz", lessons:"Lessons",
      solution:"Megoldás", on:"be", off:"ki", pause:"Pause", play:"Play",
      speed:"Sebesség", details:"Részletes magyarázat", tips:"Tippek",
      beginner:"Kezdő", intermediate:"Középhaladó", hard:"Nehéz", expert:"Expert", mixed:"Vegyes", all:"Mind",
      newTask:"Új feladat →", freeze:"🧊 Fagyasztás", hint:"💡 Tipp",
      guessPH:"Mi ez a minta? pl. LPDs, generalized spike-wave, triphasic, SIRPIDs…",
      check:"Ellenőrzés", score:"Pontszám", hits:"Találatok", total:"Összesen",
      best:"Legjobb", medals:"Medálok", level:"Szint", xp:"XP",
      nextSnap:"📸 Következő snapshot", reset:"🔄 Reset", start:"Start",
      footer:"Canvas Dev build. Köv.: EDF/CSV import, JSON export, több hard case, csatornaérzékeny pontozás.", 
      correct:"+20 XP – Helyes!", wrong:"+2 XP – Nem ez. Megoldás: ",
      hintText:"Első betűk: ", caseMeta:(m,d,l)=>`Montázs: ${m}  •  Nehézség: ${d}  •  Cím: ${l}`,
      idfMeta:(d,m)=>`Nehézség: ${d}  •  Montázs: ${m}`,
      task:(what)=>`Feladat: jelöld be a(z) ${what} előfordulásait!`,
      task_explain:"A feladathoz állítsd meg (Freeze) a futó EEG-t, majd a képen kattintással jelöld a cél-eseményeket. A jelölés élő futás közben nem engedélyezett.",
      noEvents:"Ehhez a kiválasztott esettípushoz nincs címkézett esemény a kvízben. Válassz másikat vagy készíts snapshotot.",
      levelLbl:"Szint", xpLbl:"XP",
      miniQuiz:"Mini-quiz", selectAll:"Jelöld meg az összes helyes állítást.", submit:"Beküldés",
      gained:"Szerzett XP: ", bestPossible:"Max: ",
      lessonsBeginner:"Kezdő", lessonsIntermediate:"Középhaladó", lessonsExpert:"Expert",
      advanced:"Haladó mód", advanced_on:"be", advanced_off:"ki",
      freeze_first:"Előbb állítsd meg (Freeze) a jelet a jelöléshez.",
      signIn:"Belépés", signOut:"Kijelentkezés", offline:"Offline mód",
      book:"Könyv", prev:"Előző", next:"Következő"
    },
    EN: {
      explore:"Explore", identify:"Identify", quiz:"Quiz", lessons:"Lessons",
      solution:"Solution", on:"on", off:"off", pause:"Pause", play:"Play",
      speed:"Speed", details:"Detailed explanation", tips:"Tips",
      beginner:"Beginner", intermediate:"Intermediate", hard:"Hard", expert:"Expert", mixed:"Mixed", all:"All",
      newTask:"New task →", freeze:"🧊 Freeze", hint:"💡 Hint",
      guessPH:"What is this pattern? e.g., LPDs, generalized spike-wave, triphasic, SIRPIDs…",
      check:"Check", score:"Score", hits:"Hits", total:"Total",
      best:"Best", medals:"Medals", level:"Level", xp:"XP",
      nextSnap:"📸 Next snapshot", reset:"🔄 Reset", start:"Start",
      footer:"Canvas Dev build. Next: EDF/CSV import, JSON export, more hard cases, channel-aware scoring.", 
      correct:"+20 XP – Correct!", wrong:"+2 XP – Not this. Solution: ",
      hintText:"Initials: ", caseMeta:(m,d,l)=>`Montage: ${m}  •  Difficulty: ${d}  •  Title: ${l}`,
      idfMeta:(d,m)=>`Difficulty: ${d}  •  Montage: ${m}`,
      task:(what)=>`Task: click all ${what} occurrences!`,
      task_explain:"To do the task, pause (Freeze) the running EEG, then click on the target events. Marking is disabled while the trace is running.",
      noEvents:"This case has no labeled events for the quiz. Pick another or take a snapshot.",
      levelLbl:"Level", xpLbl:"XP",
      miniQuiz:"Mini-quiz", selectAll:"Select all correct statements.", submit:"Submit",
      gained:"XP gained: ", bestPossible:"Max: ",
      lessonsBeginner:"Beginner", lessonsIntermediate:"Intermediate", lessonsExpert:"Expert",
      advanced:"Advanced mode", advanced_on:"on", advanced_off:"off",
      freeze_first:"Please Freeze before marking.",
      signIn:"Sign in", signOut:"Sign out", offline:"Offline mode",
      book:"Book", prev:"Previous", next:"Next"
    }
  };
  I18N.US = I18N.EN;
  window.I18N = I18N;
  let LANG = (getLS("eeg_lang","HU") || "HU");
  if(LANG === 'EN') LANG = 'US';
  window.getLang = ()=>LANG;
    window.setLang = function(L){
      LANG = L;
      document.documentElement.lang = (L === 'HU' ? 'hu' : 'en');
      setLS("eeg_lang", L);
      if(window.syncTexts) window.syncTexts();
    };
    window.tK = function(k){ return I18N[LANG][k] || k; };
    document.documentElement.lang = (LANG === 'HU' ? 'hu' : 'en');
})();