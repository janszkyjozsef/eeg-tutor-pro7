// Synthetic EEG data + cases
(function(){
  const S = 1000; // ~10 s window
  function makeCase(id,meta){ return Object.assign({id, sampleRate:S}, meta); }
  function genChannel(N, noise=0.6, spikes=[], mag=4, baseHz=0, shape='sine'){
    const arr=[];
    for(let i=0;i<N;i++){
      let carrier=0;
      if(baseHz){
        const per = (S/(baseHz*2*Math.PI));
        if(shape==='square'){ carrier = Math.sign(Math.sin(i/per))*0.7; }
        else if(shape==='triangle'){ carrier = (2/Math.PI)*Math.asin(Math.sin(i/per)); }
        else { carrier = Math.sin(i/per)*1.0; }
      } else {
        carrier = Math.sin(i/25)*0.6;
      }
      const drift=Math.sin(i/220)*0.35;
      let v = carrier + drift + (Math.random()-0.5)*noise;
      if(spikes.includes(i)) v+=mag;
      if(spikes.some(s=>Math.abs(i-s)<=2)){
        const near=spikes.find(s=>Math.abs(i-s)<=2);
        v += mag*(1-Math.abs(i-near)/2);
      }
      arr.push(v);
    }
    return arr;
  }
  function materialize(c){
    c.channels = c.channels.map((name,idx)=>{
      const spikes = (typeof c.spikesFn==="function")?c.spikesFn(idx):[];
      return {name, data:genChannel(S, c.noise||0.45, spikes, (c.magFn?c.magFn(idx):4), c.baseHz||0, c.shape||'sine'), spikes};
    });
    return c;
  }

  // Helper to map difficulty label
  function d(lbl){ return lbl; }

  // Build cases (expanded set)
  const CASES = [
    // Benign/normal patterns
    makeCase('normal_alpha',{ titleHU:'Normál éber – occipitalis alfa', titleEN:'Normal awake – occipital alpha', montage:'10–20',
      descHU:'8–10 Hz occipitalis alfa, reaktív.', descEN:'8–10 Hz occipital alpha, reactive.',
      explainHU:'8–10 Hz-es, occipitalis túlsúlyú ritmus éber, csukott szemű állapotban. Jellemző a szimmetria (±20%) és a szemnyitásra történő gátlás (blokkolódás). Amplitúdó többnyire 20–100 µV. Aszimmetria, tartós reaktivitáshiány vagy oldal-dominancia mögött szemészeti, occipitalis vagy diffúz kórfolyamat is állhat.\n\nHaladó: a posterior dominant rhythm (PDR) életkorral változik (gyermek: 6–8 Hz, felnőtt: 8–10 Hz). A PDR nem „alfa blokkolás” nélkül kóros, de a tartósan alacsony frekvencia (<8 Hz) encephalopathiára utalhat.',
      explainEN:'Occipital-predominant 8–10 Hz rhythm in awake, eyes-closed state. Key features: symmetry (±20%), blocking with eye opening, typical amplitude 20–100 µV. Persistent asymmetry or lack of reactivity may suggest occipital pathology or diffuse encephalopathy.\n\nAdvanced: Posterior dominant rhythm (PDR) is age-dependent (children: 6–8 Hz, adults: 8–10 Hz). Sustained low frequency (<8 Hz) can suggest encephalopathy rather than a normal variant.',
      tipsHU:['Szimmetria ellenőrzése','Szemnyitásra gátlódik','Nincs hegyes spike'],
      tipsEN:['Check symmetry','Blocked by eye opening','No sharp spikes'],
      tipsAdvHU:['PDR vs occipitalis epileptiform jelek: reaktivitás és morfológia','Amplitúdó-gradienst nézd O→P→C'],
      tipsAdvEN:['Differentiate PDR from occipital epileptiform: reactivity & morphology','Check amplitude gradient O→P→C'],
      diff:'beginner', label:'normal alpha', channels:['O1-O2','P3-O1','P4-O2','C3-P3','C4-P4'], spikesFn:()=>[], magFn:()=>0, baseHz:9, includeInQuiz:false, quizTargetHU:'alfa ritmus', quizTargetEN:'alpha rhythm', tags:['benign','awake'] }),

    makeCase('mu_rhythm',{ titleHU:'Mu-ritmus (C3/C4)', titleEN:'Mu rhythm (C3/C4)', montage:'Central',
      descHU:'8–13 Hz „mangalépcső” formájú, motoros gátlással blokkolódik.', descEN:'8–13 Hz arch-like rhythm over sensorimotor cortex, blocked by movement/imagery.',
      explainHU:'A mu-ritmus központi elhelyezkedésű, gyakran aszinkron és „ív-szerű” (arciform). Nem reaktív a szemnyitásra, viszont motoros aktivitásra vagy képzeletre gátlódik. Könnyen összetéveszthető occipitalis alfával; topográfia segít.',
      explainEN:'Mu rhythm is an arch-shaped 8–13 Hz activity over sensorimotor cortex (C3/C4). Not reactive to eye opening but blocks with motor activity or imagery. Topography helps differentiate it from occipital alpha.',
      tipsHU:['Nem gátlódik szemnyitásra','C3/C4 maximum','Ív-szerű morfológia'], tipsEN:['No eye-opening blocking','Max at C3/C4','Arch-like morphology'],
      tipsAdvHU:['Asszociáld EMG-vel – nem függ tőle','Aszimmetria nem feltétlen kóros'], tipsAdvEN:['Consider EMG independence','Asymmetry may be benign'],
      diff:'beginner', label:'mu rhythm', channels:['C3-Cz','Cz-C4','C3-P3','C4-P4'], baseHz:10, shape:'triangle', includeInQuiz:false, quizTargetHU:'mu-ritmus', quizTargetEN:'mu rhythm', tags:['benign','variant'] }),

    makeCase('lambda',{ titleHU:'Lambda hullámok', titleEN:'Lambda waves', montage:'Occipital',
      descHU:'Vizuális fixáció/scan közben occipitalisan.', descEN:'Occipital waveforms during visual scanning/fixation.',
      explainHU:'Ébrenléti occipitalis pozitív hullámok vizuális vizsgálódás vagy gyors szemmozgás során. Rövidek, nem epileptiformak, és vizuális inger megszűnésekor eltűnnek.',
      explainEN:'Occipital positive transients during visual scanning in wakefulness. Brief, non-epileptiform, disappear when the visual stimulus stops.',
      tipsHU:['Occipitalis elhelyezkedés','Vizualitás-függő','Rövid, nem spike'], tipsEN:['Occipital location','Visual stimulus dependent','Brief, non-spike'],
      tipsAdvHU:['Szemmozgás artefaktummal ne keverd','Reaktivitás a kulcs'], tipsAdvEN:['Don’t confuse with EOG','Reactivity is key'],
      diff:'beginner', label:'lambda waves', channels:['P3-O1','P4-O2','O1-O2'], baseHz:7, noise:0.3, includeInQuiz:false, tags:['benign','visual'] }),

    makeCase('photic_driving',{ titleHU:'Photic driving', titleEN:'Photic driving', montage:'Occipital',
      descHU:'Fényingerre occipitalis válasz.', descEN:'Occipital response to photic stimulation.',
      explainHU:'A stimuláció frekvenciáját követő occipitalis ritmus („driving”). Nem epileptiform, ritkán társul PPR-rel.',
      explainEN:'Occipital rhythmic response time-locked to photic stimulation. Non-epileptiform; occasionally accompanies photoparoxysmal response (PPR).',
      tipsHU:['Időzítés a stimulussal','Occipitalis maximum','Nem spike-hullám'], tipsEN:['Time-locked','Occipital maximum','Not spike–wave'],
      tipsAdvHU:['PPR külön entitás – generalizált spike-hullám','Aszimmetria → occipitalis kórkép?'], tipsAdvEN:['PPR is distinct – generalized spikes','Asymmetry may suggest occipital pathology'],
      diff:'beginner', label:'photic driving', channels:['P3-O1','P4-O2','O1-O2'], baseHz:12, includeInQuiz:false, tags:['benign','stimulation'] }),

    // Artifacts
    makeCase('eyeblink',{ titleHU:'Artefaktum – pislogás', titleEN:'Artifact – eye blink', montage:'Frontális',
      descHU:'Nagy frontális lassú hullám.', descEN:'Large frontal slow deflection.',
      explainHU:'Sima, széles bázisú frontális deflexió, gyakran kétoldali, polaritásváltással. Meredeksége kisebb, mint az epileptiform tüskéké, és nem követi konzisztens lassú hullám.',
      explainEN:'Smooth, broad-based frontal deflection, often bilateral with polarity change. Less steep than epileptiform spikes and not followed by a consistent slow wave.',
      tipsHU:['Frontális túlsúly','Sima lefutás','Nem követi lassú hullám'], tipsEN:['Frontal predominance','Smooth','No spike-slow pairing'],
      tipsAdvHU:['EOG csatorna segít','Blink gyakran sorozatban'], tipsAdvEN:['EOG channel helps','Often comes in trains'],
      diff:'beginner', label:'eye blink', channels:['Fp1-F3','Fp2-F4','Fz-Cz'], spikesFn:(i)=> (i===0?[150,520]:[]), magFn:(i)=> (i===0?6:2), noise:0.3, includeInQuiz:false, tags:['artifact'] }),

    makeCase('emg',{ titleHU:'Artefaktum – EMG', titleEN:'Artifact – EMG', montage:'Temporális',
      descHU:'Magas frekvenciájú „zizgés”.', descEN:'High-frequency muscle artifact.',
      explainHU:'Szélessávú, magas frekvenciájú zaj, különösen temporális régiókban (rágóizmok). Nem szinkron, nem időzített, gyakran mozgáshoz társul.',
      explainEN:'Broadband, high-frequency noise, often in temporal channels (jaw muscles). Not synchronous or time-locked; related to movement.',
      tipsHU:['Szélessávú','Mozgásfüggő','Nem periodikus'], tipsEN:['Broadband','Movement-related','Non-periodic'],
      tipsAdvHU:['Aluláteresztő szűrés segít','Vizsgálj EMG korrelációt'], tipsAdvEN:['Low-pass filtering helps','Check EMG correlation'],
      diff:'beginner', label:'emg artifact', channels:['T3-T5','T4-T6','F7-T3','F8-T4'], baseHz:0, noise:1.2, includeInQuiz:false, tags:['artifact'] }),

    makeCase('ekg',{ titleHU:'Artefaktum – EKG', titleEN:'Artifact – ECG', montage:'Vegyes',
      descHU:'Időzített éles komponens ritmikusan.', descEN:'Rhythmic sharp deflections time-locked to ECG.',
      explainHU:'Ritmusos, éles jellegű komponensek széles csatornakörben, EKG-hoz időzítve. Topográfia atipikus EEG-spike-hoz, morfológia ismétlődő.',
      explainEN:'Rhythmic sharp-like components broadly seen, time-locked to ECG. Topography atypical for EEG spikes; highly repetitive morphology.',
      tipsHU:['EKG-hoz kötött','Széles eloszlás','Ismétlődő morfológia'], tipsEN:['Time-locked to ECG','Widespread','Repetitive morphology'],
      tipsAdvHU:['EKG vezetés beépítése','Időzítés összevetése RR-távolsággal'], tipsAdvEN:['Add ECG lead','Compare timing to RR interval'],
      diff:'beginner', label:'ecg artifact', channels:['C3-P3','C4-P4','P3-O1','P4-O2'], baseHz:1.2, shape:'square', includeInQuiz:false, tags:['artifact'] }),

    // Epileptiform generalized
    makeCase('gsw3',{ titleHU:'Generalizált tüske–hullám (~3 Hz)', titleEN:'Generalized spike–wave (~3 Hz)', montage:'10–20 ref',
      descHU:'Szinkron 3 Hz SW.', descEN:'Synchronous 3 Hz spike–wave.',
      explainHU:'Klasszikus absence mintázat: hegyes tüske + utána lassú hullám, 2.5–3.5 Hz ütemben, több csatornán szinkron. A ciklusok időzítése konzisztens. Artefaktumtól a topográfiai/temporális következetesség különíti el.',
      explainEN:'Classic absence pattern: sharp spike followed by a slow wave at ~2.5–3.5 Hz, synchronous across channels. Temporal/topographic consistency separates it from artifacts.',
      tipsHU:['Szinkron több csatornán','Spike után lassú hullám','Artefaktumtól következetesség különíti el'], tipsEN:['Synchronous across channels','Slow wave follows spike','Consistency helps separate artifacts'],
      tipsAdvHU:['Fotostimuláció provokálhat PPR-t','Hosszú roham alatt evolúció figyelhető meg'], tipsAdvEN:['Photic stim may provoke PPR','Longer events may evolve'],
      diff:'beginner', label:'generalized spike-wave', channels:['Fp1-F3','F3-C3','C3-P3','P3-O1','Fp2-F4','F4-C4','C4-P4','P4-O2'], spikesFn:()=>[160,190,220,250,280,310,340], magFn:(i)=>5-(i%3), includeInQuiz:true, quizTargetHU:'tüske–hullám', quizTargetEN:'spike–wave', tags:['generalized','ictal/interictal'] }),

    makeCase('polyspike_wave',{ titleHU:'Generalizált polytüske–hullám', titleEN:'Generalized polyspike–wave', montage:'10–20 ref',
      descHU:'Több egymást követő tüskekomponens.', descEN:'Multiple rapid spikes followed by slow wave.',
      explainHU:'Juvenilis myoclonusban gyakori: gyors egymásutánban több tüske, amelyet lassú hullám követ. Generalizált, szinkron megjelenés.',
      explainEN:'Typical in juvenile myoclonic epilepsy: clusters of fast spikes followed by slow wave. Generalized and synchronous.',
      tipsHU:['Gyors tüske-sorozat','Generalizált','Lassú hullám zárja'], tipsEN:['Rapid spike cluster','Generalized','Slow wave closure'],
      tipsAdvHU:['Myoclonus időzítése EEG-vel','Ébredéskor gyakoribb'], tipsAdvEN:['Time-lock to myoclonus','More frequent on awakening'],
      diff:'intermediate', label:'generalized polyspike-wave', channels:['Fp1-F3','F3-C3','C3-P3','P3-O1','Fp2-F4','F4-C4','C4-P4','P4-O2'], spikesFn:()=>[200,204,208,260,264,268], magFn:(i)=>4, includeInQuiz:true, quizTargetHU:'polytüske-hullám', quizTargetEN:'polyspike–wave', tags:['generalized'] }),

    // Focal spikes variants
    makeCase('lt_spikes',{ titleHU:'Bal temporális tüskék', titleEN:'Left temporal spikes', montage:'Bitemporális',
      descHU:'Fokális T3/T5 max.', descEN:'Focal T3/T5 max.',
      explainHU:'Keskeny, meredek csúcsú tüskék bal temporálisan, aszinkron több csatornán, gyakran utólag lassú hullám kíséretében. Konzisztens morfológia és laterális maximum fókuszt jelez.',
      explainEN:'Narrow, steep spikes over the left temporal region, asynchronous across channels, often followed by a slow wave. Consistent morphology and lateralized maximum indicate a focus.',
      tipsHU:['Ipsilaterális maximum','Meredek fel/le','Gyakran kíséri lassú hullám'], tipsEN:['Ipsilateral max','Steep up/down','Often followed by slow'],
      tipsAdvHU:['Phase-reversal T3–T5 környezetben','Szinkróniát ne várj minden csatornán'], tipsAdvEN:['Look for phase reversal around T3–T5','Asynchrony across channels is typical'],
      diff:'intermediate', label:'left temporal spikes', channels:['F7-T3','T3-T5','T5-O1','F8-T4','T4-T6','T6-O2'], spikesFn:(i)=> (i<3?[200,410,640]:[205,415,645]), magFn:(i)=> (i<3?5:2), includeInQuiz:true, quizTargetHU:'fokális tüskék', quizTargetEN:'focal spikes', tags:['temporal','focal'] }),

    makeCase('rt_spikes',{ titleHU:'Jobb temporális tüskék', titleEN:'Right temporal spikes', montage:'Bitemporális',
      descHU:'Fokális T4/T6 max.', descEN:'Focal T4/T6 max.',
      explainHU:'Időben szórtan jelentkező tüskék jobb dominanciával. A meredek fel- és lefutás, valamint a visszatérő topográfia epileptiformitás mellett szól.',
      explainEN:'Temporally scattered spikes with right-sided predominance. Steep rise/fall and recurring topography support epileptiform nature.',
      tipsHU:['Ipsilaterális max','Keskeny csúcs','Topográfia segít'], tipsEN:['Ipsilateral max','Narrow peak','Use topography'],
      tipsAdvHU:['Fázisforduló T4–T6 környékén','Occipitális átterjedés téveszthet meg'], tipsAdvEN:['Phase reversal near T4–T6','Beware occipital spread'],
      diff:'intermediate', label:'right temporal spikes', channels:['F7-T3','T3-T5','T5-O1','F8-T4','T4-T6','T6-O2'], spikesFn:(i)=> (i>=3?[220,430,660]:[225,435,665]), magFn:(i)=> (i>=3?5:2), includeInQuiz:true, quizTargetHU:'fokális tüskék', quizTargetEN:'focal spikes', tags:['temporal','focal'] }),

    makeCase('tirda',{ titleHU:'TIRDA – temporális ritmikus delta', titleEN:'TIRDA – temporal intermittent rhythmic delta', montage:'Temporális',
      descHU:'Ritmikus 1–4 Hz delta temporálisan.', descEN:'Rhythmic 1–4 Hz delta in temporal region.',
      explainHU:'Időszakos, ritmikus delta aktivitás temporális régióban, gyakran temporális epilepszia biomarkere. Nem artefaktum, nem generalizált.',
      explainEN:'Intermittent rhythmic delta in temporal leads; a biomarker for temporal lobe epilepsy. Not artifact and not generalized.',
      tipsHU:['Temporális maximum','Ritmikus','Intermittens'], tipsEN:['Temporal max','Rhythmic','Intermittent'],
      tipsAdvHU:['LPD-ktől morfológia és szabályosság különíti el','Klinikai korreláció szükséges'], tipsAdvEN:['Differentiate from LPDs by morphology/regularity','Need clinical correlation'],
      diff:'intermediate', label:'tirda', channels:['F7-T3','T3-T5','T5-O1'], baseHz:2.5, noise:0.25, includeInQuiz:false, tags:['temporal','rhythmic'] }),

    makeCase('sirpids',{ titleHU:'SIRPIDs', titleEN:'SIRPIDs', montage:'Referenciális',
      descHU:'Stimulus-indukált ritmikus/időszakos kisülések.', descEN:'Stimulus-induced rhythmic/periodic discharges.',
      explainHU:'Érzékszervi stimulus váltja ki: ritmikus vagy periodikus komplexek, gyakran kritikus állapotban. Ictal–interictal kontinuum része.',
      explainEN:'Triggered by sensory stimuli; rhythmic or periodic complexes in critically ill patients. Part of the ictal–interictal continuum.',
      tipsHU:['Stimulusra jelennek meg','Ritmikus/periodikus','IIC része'], tipsEN:['Appear with stimulus','Rhythmic/periodic','On the IIC'],
      tipsAdvHU:['Reakció megszűnésével eltűnhet','Ictalitas felé tol, ha evolúció, plusz gyors komponens'], tipsAdvEN:['May vanish when stimulus ceases','Evolution/fast component favors ictality'],
      diff:'hard', label:'sirpids', channels:['Fz-Cz','C3-P3','C4-P4'], baseHz:1.8, shape:'square', includeInQuiz:false, tags:['IIC','critical care'] }),

    // Periodic and encephalopathy
    makeCase('lpds',{ titleHU:'LPDs – jobb', titleEN:'LPDs – right', montage:'Referenciális',
      descHU:'Periodikus jobb oldali kisülések.', descEN:'Periodic right-sided discharges.',
      explainHU:'Az „ictal–interictal continuum” része. Laterális, ~1–2 s periódusú kisülések, jellegzetes morfológiával. A klinikum és az evolúció (gyorsulás, szerkezetváltás) segít státusz döntésében.',
      explainEN:'Lateralized discharges with ~1–2 s periodicity and stereotyped morphology. Clinical correlation and temporal evolution (frequency/morphology) are key for nonconvulsive status decisions.',
      tipsHU:['1–2 s periódus','Laterális dominancia','Klinikai korrelátum fontos'], tipsEN:['1–2 s period','Lateralized','Clinical correlation'],
      tipsAdvHU:['LPDs+F/LPDs+R ictalitas felé tol','EEG reaktivitás hiánya súlyosabb'], tipsAdvEN:['LPDs+F/LPDs+R favor ictality','Absent reactivity is worse'],
      diff:'hard', label:'lpds', channels:['F8-T4','T4-T6','T6-O2','F7-T3','T3-T5'], spikesFn:(i)=> (i<3?[150,300,450,600,750]:[]), magFn:(i)=> (i<3?4:1), includeInQuiz:true, quizTargetHU:'periodikus kisülések', quizTargetEN:'periodic discharges', tags:['periodic','focal'] }),

    makeCase('gpeds',{ titleHU:'GPDs – generalizált periodikus', titleEN:'GPDs – generalized periodic', montage:'Referenciális',
      descHU:'Generalizált periodicitás.', descEN:'Generalized periodicity.',
      explainHU:'Szélesen eloszló, szabályos ritmusú komplexek, gyakran metabolikus/anoxiás háttérrel. Nem szükségképp ictális; a reaktivitás és klinikum dönt. Gyors komponens (GPD+F) ictalitás felé tolhat.',
      explainEN:'Diffuse, regular periodic complexes, often metabolic/post-anoxic. Not necessarily ictal; stimulus reactivity and clinical context matter. A fast component (GPD+F) pushes toward ictality.',
      tipsHU:['Széleskörű','Periodikus','Klinikum dönt'], tipsEN:['Diffuse','Periodic','Clinical context'],
      tipsAdvHU:['Stimulus-reaktivitás vizsgálata','GPD+F rosszabb prognózis'], tipsAdvEN:['Test for stimulus reactivity','GPD+F has worse prognosis'],
      diff:'hard', label:'gpds', channels:['F3-C3','C3-P3','F4-C4','C4-P4','P3-O1','P4-O2'], spikesFn:(i)=>[200,400,600,800], magFn:(i)=>3, includeInQuiz:true, quizTargetHU:'periodikus kisülések', quizTargetEN:'periodic discharges', tags:['periodic','generalized'] }),

    makeCase('triphasic',{ titleHU:'Triphasic hullámok', titleEN:'Triphasic waves', montage:'Referenciális',
      descHU:'Metabolikus encephalopathia mintázat.', descEN:'Metabolic encephalopathy pattern.',
      explainHU:'Háromfázisú (negatív–pozitív–negatív) komplexek frontális túlsúllyal és anterior–posterior időbeli késéssel. Nem spike–slow párok, inkább encephalopathiára utalnak (pl. hepaticus).',
      explainEN:'Three-phase (negative–positive–negative) complexes with frontal predominance and anterior–posterior lag. Non-epileptiform; typical for metabolic encephalopathy (e.g., hepatic).',
      tipsHU:['Frontális túlsúly','Három fázis','Nem spike–slow'], tipsEN:['Frontal pred.','Three phases','Not spike–slow'],
      tipsAdvHU:['Időkésés kvalitatív mérése','Diffúz delta háttérrel társulhat'], tipsAdvEN:['Qualify the A–P lag','Often with diffuse delta'],
      diff:'hard', label:'triphasic waves', channels:['Fp1-F3','F3-C3','Fz-Cz','Fp2-F4','F4-C4'], spikesFn:()=>[140,300,470,640], magFn:()=>2, includeInQuiz:true, quizTargetHU:'triphasicus komplexek', quizTargetEN:'triphasic complexes', tags:['encephalopathy'] }),

    makeCase('burst_supp',{ titleHU:'Burst-suppression', titleEN:'Burst-suppression', montage:'Referenciális',
      descHU:'Rövid burst + csend.', descEN:'Short bursts with suppression.',
      explainHU:'Rövid nagyamplitúdójú „burst”-ök hosszú, közel izoelektromos szakaszokkal. Anoxia/anesztézia esetén. A suppressio aránya és hossza prognosztikus; reaktivitás hiánya kedvezőtlen.',
      explainEN:'High-amplitude bursts alternating with long near-isoelectric periods. Seen post-anoxia or under anesthesia. Suppression ratio/length has prognostic value; absent reactivity is unfavorable.',
      tipsHU:['Nagyon alacsony alap','Burst szigetek','Hosszú suppressio súlyosabb'], tipsEN:['Very low baseline','Burst islands','Long suppression worse'],
      tipsAdvHU:['Burst aszimmetria prognosztikus lehet','Időbeni evolúciót figyeld'], tipsAdvEN:['Burst asymmetry may be prognostic','Track temporal evolution'],
      diff:'hard', label:'burst-suppression', channels:['C3-P3','C4-P4','P3-O1','P4-O2'], spikesFn:(i)=>[120,130,131,400,410,411,700,710,711], magFn:()=>5, noise:0.2, includeInQuiz:true, quizTargetHU:'bursts', quizTargetEN:'bursts', tags:['coma','anesthesia'] }),

    // Rhythmic delta variants
    makeCase('firda',{ titleHU:'FIRDA', titleEN:'FIRDA', montage:'Frontális',
      descHU:'Frontális intermittens ritmikus delta.', descEN:'Frontal intermittent rhythmic delta activity.',
      explainHU:'Encephalopathia jele lehet: 1–3 Hz ritmikus delta frontális túlsúllyal, intermittensen. Nem epileptiform, de fokális aszimmetria mögött strukturális eltérés állhat.',
      explainEN:'Indicator of encephalopathy: 1–3 Hz rhythmic delta, frontal predominant, intermittent. Non-epileptiform, but focal asymmetry may suggest structural lesion.',
      tipsHU:['Frontális max','1–3 Hz','Intermittens'], tipsEN:['Frontal max','1–3 Hz','Intermittent'],
      tipsAdvHU:['GRDA-tól topográfia különít el','AROUSAL-hoz kötődhet'], tipsAdvEN:['Topography separates from GRDA','May relate to arousal'],
      diff:'intermediate', label:'firda', channels:['Fp1-F3','F3-C3','Fp2-F4','F4-C4'], baseHz:2, noise:0.25, includeInQuiz:false, tags:['rhythmic','encephalopathy'] }),

    makeCase('oirda',{ titleHU:'OIRDA', titleEN:'OIRDA', montage:'Occipitalis',
      descHU:'Occipitalis intermittens ritmikus delta.', descEN:'Occipital intermittent rhythmic delta activity.',
      explainHU:'Gyermekekben gyakoribb; 1–3 Hz ritmikus delta occipitalisan. Asszociálható generalizált epilepsziával, de önmagában nem diagnosztikus.',
      explainEN:'More common in children; 1–3 Hz rhythmic delta over occipital regions. Can be associated with generalized epilepsy but is not diagnostic alone.',
      tipsHU:['Occipitalis max','Gyermekekben','1–3 Hz'], tipsEN:['Occipital max','Children','1–3 Hz'],
      tipsAdvHU:['PDR-rel interakció','Vizuális inger befolyásolhatja'], tipsAdvEN:['Interacts with PDR','May be affected by visual stimuli'],
      diff:'intermediate', label:'oirda', channels:['P3-O1','P4-O2','O1-O2'], baseHz:2.2, noise:0.25, includeInQuiz:false, tags:['rhythmic'] }),

    // Additional artifacts
    makeCase('electrode_pop',{ titleHU:'Artefaktum – elektróda-pop', titleEN:'Artifact – electrode pop', montage:'Lokális',
      descHU:'Hirtelen feszültségugrás, lassú visszatérés.', descEN:'Sudden voltage jump with slow return.',
      explainHU:'Kontaktushiba: hirtelen nagy amplitúdójú elmozdulás egy csatornában, lassú exponenciális visszatéréssel. Nem terjed topografikusan.',
      explainEN:'Contact issue: large sudden displacement in one channel with slow exponential return. No topographic spread.',
      tipsHU:['Egycsatornás','Lassú visszatérés','Nem időzített'], tipsEN:['Single-channel','Slow recovery','Not time-locked'],
      tipsAdvHU:['Impedancia-ellenőrzés','Gél csere'], tipsAdvEN:['Check impedance','Reapply gel'],
      diff:'beginner', label:'electrode pop', channels:['T5-O1'], spikesFn:(i)=>[220], magFn:()=>8, noise:0.1, includeInQuiz:false, tags:['artifact'] }),

    makeCase('sweat_artifact',{ titleHU:'Artefaktum – izzadás/skin', titleEN:'Artifact – sweat/skin', montage:'Diffúz',
      descHU:'Nagyon lassú, hullámzó baseline.', descEN:'Very slow drifting baseline.',
      explainHU:'Bőrpotenciál ingadozás: extrém lassú, hullámzó baseline, gyakran melegben/izzadásnál. Nem neurális eredet.',
      explainEN:'Skin potential shifts: extremely slow, undulating baseline, often with heat/sweating. Non-neuronal.',
      tipsHU:['Nagyon lassú','Diffúz','Mozgástól független'], tipsEN:['Ultra-slow','Diffuse','Movement independent'],
      tipsAdvHU:['DC-szűrés és hűtés segít','Impedanciát ellenőrizd'], tipsAdvEN:['DC filters & cooling help','Check impedances'],
      diff:'beginner', label:'sweat artifact', channels:['Fz-Cz','C3-P3','C4-P4','P3-O1','P4-O2'], baseHz:0.2, noise:0.2, includeInQuiz:false, tags:['artifact'] }),

    // More epileptiform/clinical
    makeCase('photoparoxysmal',{ titleHU:'Photoparoxysmal response (PPR)', titleEN:'Photoparoxysmal response (PPR)', montage:'Generalizált',
      descHU:'Fényingerre generalizált tüskék.', descEN:'Generalized spikes with photic stimulation.',
      explainHU:'Photic stimulációra kiváltódó generalizált tüske–hullám vagy polytüske–hullám. Ictalitas ritka, de provokálhat myoclonust.',
      explainEN:'Generalized spike–wave or polyspike–wave triggered by photic stimulation. Ictal events are rare but myoclonus can occur.',
      tipsHU:['Stimulussal időzített','Generalizált','Polytüske is lehet'], tipsEN:['Time-locked to stimulus','Generalized','Can be polyspike'],
      tipsAdvHU:['Frekvencia-söprésnél csúcs aktivitás','Szemcsukás artefaktust különítsd el'], tipsAdvEN:['Peak at certain flash rates','Separate eye closure artifact'],
      diff:'intermediate', label:'photoparoxysmal response', channels:['Fp1-F3','F3-C3','C3-P3','P3-O1','Fp2-F4','F4-C4','C4-P4','P4-O2'], spikesFn:()=>[300,330,360], magFn:()=>4.5, includeInQuiz:true, quizTargetHU:'PPR-komplexek', quizTargetEN:'PPR complexes', tags:['generalized','stimulation'] }),

    makeCase('lrda',{ titleHU:'LRDA – laterális ritmikus delta', titleEN:'LRDA – lateralized rhythmic delta activity', montage:'Laterális',
      descHU:'Egyoldali ritmikus delta.', descEN:'Unilateral rhythmic delta.',
      explainHU:'IIC része lehet: ritmikus delta aktivitás laterális eloszlással. Epileptiform evolúció felé hajlamos lehet.',
      explainEN:'On the IIC: rhythmic delta activity with lateralized distribution. May tend toward ictal evolution.',
      tipsHU:['Egyoldali','Ritmikus','IIC'], tipsEN:['Unilateral','Rhythmic','IIC'],
      tipsAdvHU:['+F komponens esetén nagyobb rizikó','Időbeli gyorsulás fontos jel'], tipsAdvEN:['+F component increases risk','Temporal acceleration matters'],
      diff:'hard', label:'lrda', channels:['F7-T3','T3-T5','T5-O1'], baseHz:2.3, noise:0.25, includeInQuiz:false, tags:['IIC','rhythmic'] }),

    makeCase('grda',{ titleHU:'GRDA – generalizált ritmikus delta', titleEN:'GRDA – generalized rhythmic delta activity', montage:'Generalizált',
      descHU:'Generalizált 1–4 Hz delta.', descEN:'Generalized 1–4 Hz rhythmic delta.',
      explainHU:'Encephalopathiákban gyakori, nem epileptiform. Reaktivitás fennmaradhat.',
      explainEN:'Common in encephalopathies; non-epileptiform rhythmic delta. Reactivity may be preserved.',
      tipsHU:['Generalizált','1–4 Hz','Nem epileptiform'], tipsEN:['Generalized','1–4 Hz','Non-epileptiform'],
      tipsAdvHU:['FIRDA-tól frontális túlsúly különít el','Delta frekvencia spektrum vizsgálható'], tipsAdvEN:['Separated from FIRDA by topography','Inspect delta spectrum'],
      diff:'intermediate', label:'grda', channels:['F3-C3','C3-P3','F4-C4','C4-P4'], baseHz:2, noise:0.25, includeInQuiz:false, tags:['rhythmic'] }),

    makeCase('hypsarrhythmia',{ titleHU:'Hypsarrhythmia (pediátria)', titleEN:'Hypsarrhythmia (pediatric)', montage:'Generalizált',
      descHU:'Magas amplitúdójú, kaotikus háttér.', descEN:'High-amplitude, chaotic background.',
      explainHU:'Infantilis spazmushoz társulhat: kaotikus, nagy amplitúdójú lassú aktivitás multifokális tüskékkel.',
      explainEN:'Associated with infantile spasms: chaotic, high-amplitude slow background with multifocal spikes.',
      tipsHU:['Kaotikus','Magas amplitúdó','Multifokális tüskék'], tipsEN:['Chaotic','High amplitude','Multifocal spikes'],
      tipsAdvHU:['Alvásban kifejezettebb','Video-EEG szükséges'], tipsAdvEN:['More prominent in sleep','Need video-EEG'],
      diff:'expert', label:'hypsarrhythmia', channels:['C3-P3','C4-P4','P3-O1','P4-O2','F3-C3','F4-C4'], baseHz:0.8, noise:1.4, includeInQuiz:false, tags:['pediatric'] }),

    makeCase('birads',{ titleHU:'BIRDs', titleEN:'BIRDs', montage:'Referenciális',
      descHU:'Brief potentially ictal rhythmic discharges.', descEN:'Brief potentially ictal rhythmic discharges.',
      explainHU:'Rövid (<10 s) ritmikus kisülések, gyakran kritikus állapotban. Ictalitas gyanúját kelti, különösen evolúcióval.',
      explainEN:'Short (<10 s) rhythmic discharges often in critical care; suspicious for ictality, especially with evolution.',
      tipsHU:['Rövid','Ritmikus','Evolúció fontos'], tipsEN:['Brief','Rhythmic','Evolution matters'],
      tipsAdvHU:['+F vagy amplitúdó növekedés','Klinikai korreláció'], tipsAdvEN:['+F or amplitude build-up','Clinical correlation'],
      diff:'expert', label:'birds', channels:['Fz-Cz','C3-P3','C4-P4'], baseHz:4, noise:0.3, includeInQuiz:false, tags:['IIC','critical care'] }),

    makeCase('focal_seizure_rhythm',{ titleHU:'Fokális rohamritmus (alfa→theta→delta)', titleEN:'Focal seizure evolution', montage:'Fokális',
      descHU:'Frekvencia-gyorsulás majd lassulás, amplitúdó nő.', descEN:'Frequency acceleration then slowing with amplitude build-up.',
      explainHU:'Fokális roham kezdetén gyakran gyorsuló ritmus, majd lassulás és amplitúdó-növekedés. Topográfia fókuszra utal.',
      explainEN:'Focal seizures often start with accelerating rhythmic activity, then slow with amplitude build-up. Topography suggests focus.',
      tipsHU:['Evolúció a kulcs','Fokális maximum','Klinikummal korrelál'], tipsEN:['Evolution is key','Focal maximum','Correlate clinically'],
      tipsAdvHU:['Phase-locked high-frequency komponensek','POS/negative onset vizsgálata'], tipsAdvEN:['Phase-locked high-frequency components','Examine positive/negative onset'],
      diff:'expert', label:'focal seizure rhythm', channels:['F7-T3','T3-T5','T5-O1'], baseHz:6, noise:0.25, includeInQuiz:false, tags:['ictal','focal'] }),

    // Add a few more to reach a rich set
    makeCase('frontal_spikes',{ titleHU:'Frontális tüskék', titleEN:'Frontal spikes', montage:'Frontális',
      descHU:'Fokális frontális tüskék.', descEN:'Focal frontal spikes.',
      explainHU:'Rövid, meredek tüskék frontális csatornákban, gyakran alvásban gyakoribbak.',
      explainEN:'Brief, steep spikes in frontal channels; often more frequent in sleep.',
      tipsHU:['Frontális max','Meredek','Alvásban több'], tipsEN:['Frontal max','Steep','Increased in sleep'],
      tipsAdvHU:['Generalizáció lehetősége','Artefaktumtól (EOG) különítsd el'], tipsAdvEN:['May secondarily generalize','Differentiate from EOG'],
      diff:'intermediate', label:'frontal spikes', channels:['Fp1-F3','F3-C3','Fp2-F4','F4-C4'], spikesFn:(i)=>[260,520,780], magFn:()=>4, includeInQuiz:true, quizTargetHU:'frontális tüskék', quizTargetEN:'frontal spikes', tags:['frontal','focal'] }),

    makeCase('occipital_spikes',{ titleHU:'Occipitalis tüskék', titleEN:'Occipital spikes', montage:'Occipital',
      descHU:'Fokális occipitalis tüskék.', descEN:'Focal occipital spikes.',
      explainHU:'Occipitalis maximummal jelentkező, meredek tüskék; vizuális tünetekhez társulhatnak.',
      explainEN:'Steep spikes with occipital maximum; may correlate with visual symptoms.',
      tipsHU:['Occipitalis max','Meredek tüskék','Vizuális korrelátum lehet'], tipsEN:['Occipital max','Steep spikes','Possible visual correlate'],
      tipsAdvHU:['Lambda és PDR elkülönítése','Reaktivitás elemzése'], tipsAdvEN:['Separate from lambda & PDR','Analyze reactivity'],
      diff:'intermediate', label:'occipital spikes', channels:['P3-O1','P4-O2','O1-O2'], spikesFn:(i)=>[310,620,930], magFn:()=>4, includeInQuiz:true, quizTargetHU:'occipitalis tüskék', quizTargetEN:'occipital spikes', tags:['occipital','focal'] }),

    makeCase('temporal_polyspikes',{ titleHU:'Temporális polytüskék', titleEN:'Temporal polyspikes', montage:'Temporális',
      descHU:'Gyors, többcsúcsú tüskesorozat.', descEN:'Rapid multi-peak spike trains.',
      explainHU:'Temporális fókuszban egymást követő hegyes komponensek, gyakran alvásban gyakoribbak.',
      explainEN:'Temporal focus with successive sharp components; often increased during sleep.',
      tipsHU:['Több csúcs','Temporális','Alvásban több'], tipsEN:['Multi-peak','Temporal','More in sleep'],
      tipsAdvHU:['Lassú hullám kísérheti','Morfológia konzisztencia fontos'], tipsAdvEN:['Often with slow wave','Consistency matters'],
      diff:'intermediate', label:'temporal polyspikes', channels:['F7-T3','T3-T5','T5-O1'], spikesFn:(i)=>[180,184,188,540,544,548], magFn:()=>4.5, includeInQuiz:true, quizTargetHU:'polytüskék', quizTargetEN:'polyspikes', tags:['temporal','focal'] })
  ].map(materialize);

  // Synonyms + normalizer (unicode-safe)
  const SYN = {
    "generalized spike-wave":["gsw","3hz","absence","generalizalt tuske hullam","generalized spike wave"],
    "generalized polyspike-wave":["polyspike","poly","jme","juvenile myoclonic"],
    "left temporal spikes":["lt","bal temporalis","bal temporalis tuske","t3","t5","temp spikes"],
    "right temporal spikes":["rt","jobb temporalis","jobb temporalis tuske","t4","t6","temp spikes"],
    "frontal spikes":["front spikes","frontal"],
    "occipital spikes":["occ spikes","occipital"],
    "temporal polyspikes":["polyspikes temporal","temp poly"],
    "triphasic waves":["triphasic","triphasicus","hepatic","metabolic encephalopathy"],
    "lpds":["lpd","lpds","pleds","pled","lateralized periodic discharges"],
    "gpds":["gpd","gpeds","generalized periodic discharges"],
    "burst-suppression":["burst","suppression","bs"],
    "normal alpha":["normal","alfa","alpha","normal alpha","normalis alfa","pdr"],
    "mu rhythm":["mu","mu rhythm","mu-ritmus"],
    "lambda waves":["lambda"],
    "photic driving":["driving","photic"],
    "photoparoxysmal response":["ppr","photoparoxysmal"],
    "firda":["firda"],
    "oirda":["oirda"],
    "lrda":["lrda"],
    "grda":["grda"],
    "hypsarrhythmia":["hyps","hypsarrhythmia"],
    "birds":["birds"],
    "focal seizure rhythm":["seizure rhythm","focal seizure"],
    "eye blink":["blink","eyeblink","pislogas","szemmozgas"],
    "emg artifact":["emg"],
    "ecg artifact":["ecg","ekg"],
    "electrode pop":["pop"],
    "sweat artifact":["sweat","skin"]
  };
  function normalize(s){
    return s.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .replace(/[^a-z0-9\s-]/g," ")
      .replace(/\s+/g," ")
      .trim();
  }
  function isSynonym(guess, canonical){
    const g=normalize(guess), c=normalize(canonical);
    if(g===c) return true;
    const list = SYN[canonical]||[];
    if(list.some(x=>normalize(x)===g)) return true;
    const toks = g.split(" "); if(toks.some(t=>c.includes(t)&&t.length>=4)) return true;
    return false;
  }

  // export
  window.EEG_DATA = { S, CASES, genChannel, makeCase, materialize, normalize, isSynonym };
})();