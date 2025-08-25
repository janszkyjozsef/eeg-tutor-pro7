(function(){
  function mk(level,arr){ return arr.map(([id,hu,en,steps,q])=>({id, level, titleHU:hu, titleEN:en, steps:steps.map(([huS,enS])=>({htmlHU:huS, htmlEN:enS})), quiz:{ qHU:q.qHU, qEN:q.qEN, choices:q.choices.map(([huC,enC,ok,xp])=>({hu:huC,en:enC,ok,xp})) } })); }
  const B = [
    ['sleep_basics','Alvás alapok','Sleep basics', [
      ['N1: vertex élesek megjelenhetnek.','N1: vertex sharps may appear.'],
      ['N2: orsók + K-komplex.','N2: spindles + K-complex.'],
      ['N3: nagy amplitúdójú delta dominál.','N3: high-amplitude delta dominates.']
    ], {qHU:'Melyik jellemző N2-re?', qEN:'Which is typical of N2?', choices:[['Orsók','Spindles',true,5],['Generalizált 3 Hz SW','Generalized 3 Hz SW',false,0],['K-komplex','K-complex',true,5]]}],

    ['normal_variants','Normál variánsok','Normal variants', [
      ['Mu-ritmus: motoros gátlásra blokkolódik.','Mu rhythm: blocks with motor activity.'],
      ['Lambda: vizuális scan alatt occipitalisan.','Lambda: occipital during visual scanning.']
    ], {qHU:'Mi nem epileptiform?', qEN:'What is non-epileptiform?', choices:[['Lambda','Lambda',true,5],['LPDs','LPDs',false,0]]}],

    ['alpha_fundamentals','Alfa alapok','Alpha fundamentals', [
      ['PDR 8–10 Hz felnőttben.','PDR 8–10 Hz in adults.'],
      ['Szemnyitás blokkolja.','Eye opening blocks.']
    ], {qHU:'Mi utal kórfolyamatra?', qEN:'What suggests pathology?', choices:[['Tartós <8 Hz PDR','Sustained <8 Hz PDR',true,5],['Szimmetria ±20%','Symmetry ±20%',false,0]]}],

    ['artifact_101','Artefaktum 101','Artifact 101', [
      ['Pislogás: frontális, sima.','Blink: frontal, smooth.'],
      ['EMG: szélessávú, magas frekvencia.','EMG: broadband, high frequency.']
    ], {qHU:'Melyik EKG?', qEN:'Which is ECG artifact?', choices:[['Ritmikus, RR-hez kötött','Rhythmic, RR-locked',true,6],['Generalizált SW','Generalized SW',false,0]]}],

    ['gsw_intro','3 Hz SW bevezető','Intro to 3 Hz SW', [
      ['Spike + lassú hullám, 2.5–3.5 Hz.','Spike + slow wave, 2.5–3.5 Hz.'],
      ['Szinkron generalizáció.','Synchronous generalization.']
    ], {qHU:'Mi NEM jellemző?', qEN:'NOT typical?', choices:[['Fokális frontális maximum','Focal frontal maximum',true,5],['Lassú hullám a spike után','Slow wave after spike',false,0]]}],

    ['spindle_details','Orsók részletesen','Spindles in detail', [
      ['Centrális maximum, 12–14 Hz.','Central max, 12–14 Hz.'],
      ['K-komplex társulhat.','Often with K-complex.']
    ], {qHU:'Orsók frekvenciája?', qEN:'Spindle frequency?', choices:[['12–14 Hz','12–14 Hz',true,5],['3 Hz','3 Hz',false,0]]}],

    ['lambda_vs_eyemove','Lambda vs szemmozgás','Lambda vs eye movement', [
      ['Lambda vizuális ingerhez kötött.','Lambda tied to visual stimulus.'],
      ['EOG-artefaktum polaritásváltásos lehet.','EOG artifact may show polarity flips.']
    ], {qHU:'Melyik lambda?', qEN:'Which is lambda?', choices:[['Occipitalis pozitív tranziens','Occipital positive transient',true,5],['Frontális lassú deflexió','Frontal slow deflection',false,0]]}],

    ['mu_vs_alpha','Mu vs PDR','Mu vs PDR', [
      ['Mu: C3/C4, szemnyitásra nem szűnik.','Mu: C3/C4, not blocked by eye opening.'],
      ['PDR: occipitalis és reaktív.','PDR: occipital & reactive.']
    ], {qHU:'Mi PDR?', qEN:'Which is PDR?', choices:[['Occipitalis 8–10 Hz, gátlódik','Occipital 8–10 Hz, blocks',true,5],['Centrális 10 Hz, nem reagál','Central 10 Hz, no reactivity',false,0]]}],

    ['artifact_pop','Elektróda-pop','Electrode pop', [
      ['Egycsatornás nagy elmozdulás.','Single-channel large shift.']
    ], {qHU:'Mi kulcstünet?', qEN:'Key feature?', choices:[['Lassú visszatérés','Slow return',true,5],['Generalizált terjedés','Generalized spread',false,0]]}],

    ['quiz_howto','Kvíz használat','Quiz usage', [
      ['A kvízhez előbb Freeze!','Freeze before marking.'],
      ['Futás közben a jelölés tiltott.','Marking disabled while running.']
    ], {qHU:'Mi az első lépés?', qEN:'What is step one?', choices:[['Freeze','Freeze',true,5],['Snapshot nélkül jelölni','Mark without snapshot',false,0]]}],
  
    ['wickets_benign','Wicketek vs temporális tüskék','Wickets vs temporal spikes', [
      ['Parietotemporális, ívelt "wicket" morfológia.','Parietotemporal arch-shaped "wicket" morphology.'],
      ['Szemnyitásra/éberségre erősödhet.','May increase with alertness.']
    ], {qHU:'Mi NEM epileptiform?', qEN:'Which is non-epileptiform?', choices:[['Wicket','Wicket',true,6],['Tüske + lassú hullám','Spike + slow wave',false,0]]}],
    ['breach_intro','Breach-ritmus bevezető','Breach rhythm intro', [
      ['Koponyahiány felett élesebb, nagyobb amplitúdó.','Sharper, higher amplitude over skull defect.'],
      ['Nem jár konzisztens lassú hullámmal.','No consistent slow wave pairing.']
    ], {qHU:'Mi utal breach-re?', qEN:'What suggests breach?', choices:[['Lokális amplitúdófokozódás centrálisan','Local amplitude increase central',true,6],['Generalizált 3 Hz SW','Generalized 3 Hz SW',false,0]]}],
    ['sss_intro','Kis hegyes hullámok (SSS/BETS)','Small sharp spikes (SSS/BETS)', [
      ['Álomban, rövid, kis amplitúdójú.','Sleep, brief, low amplitude.'],
      ['Nem követi lassú hullám.','No obligatory slow wave.']
    ], {qHU:'SSS-ben mi igaz?', qEN:'What is true for SSS?', choices:[['Benign variáns','Benign variant',true,5],['Ictalitas jele','Sign of ictus',false,0]]}],
    ['146_intro','14&6 pozitív tüskék','14&6 positive spikes', [
      ['Serdülőkben, posterior temporálisan.','Adolescents, posterior temporal.'],
      ['Pozitív élesség, sorozatok.','Positive sharp trains.']
    ], {qHU:'Hol gyakori?', qEN:'Where common?', choices:[['Posterior temporális','Posterior temporal',true,5],['Occipitalis alfa','Occipital alpha',false,0]]}],
    ['hyp_hyper','Hipnagog hiperszinkronia','Hypnagogic hypersynchrony', [
      ['Gyermekeknél 3–5 Hz magas amplitúdó.','Children 3–5 Hz high amplitude.'],
      ['Ártalmatlan alvásjelenség.','Benign sleep phenomenon.']
    ], {qHU:'Mi a frekvencia?', qEN:'Frequency?', choices:[['3–5 Hz','3–5 Hz',true,5],['12–14 Hz','12–14 Hz',false,0]]}],
    ['spindle_k','K-komplex és orsó','K-complex and spindle', [
      ['K-komplex után orsó jelenhet meg.','Spindle may follow a K-complex.'],
      ['N2-ben jellemző.','Typical of N2.']
    ], {qHU:'Mi jellemző N2-re?', qEN:'Typical of N2?', choices:[['K-komplex + orsó','K-complex + spindle',true,5],['BIRDs','BIRDs',false,0]]}],];

  const I = [
    ['temporal_spikes','Temporális tüskék','Temporal spikes', [
      ['T3/T5 max bal fókuszban.','T3/T5 max in left focus.'],
      ['Lassú hullám kísérheti.','Often followed by slow wave.']
    ], {qHU:'Mi epileptiform?', qEN:'Which is epileptiform?', choices:[['Meredek csúcs','Steep peak',true,6],['Sima domborulat','Smooth hump',false,0]]}],

    ['firda_oirda','FIRDA vs OIRDA','FIRDA vs OIRDA', [
      ['FIRDA: frontális; OIRDA: occipitalis.','FIRDA: frontal; OIRDA: occipital.']
    ], {qHU:'Párosítsd!', qEN:'Match!', choices:[['FIRDA→frontális','FIRDA→frontal',true,6],['OIRDA→occipitalis','OIRDA→occipital',true,6],['OIRDA→frontalis','OIRDA→frontal',false,0]]}],

    ['triphasic_deep','Triphasicus komplexek','Triphasic complexes', [
      ['A–P késés jellemző.','Anterior–posterior lag.'],
      ['Metabolikus háttér gyakori.','Often metabolic.']
    ], {qHU:'Mi NEM igaz?', qEN:'Which is FALSE?', choices:[['Epileptiform spike–slow','Epileptiform spike–slow',true,6],['Frontális túlsúly','Frontal predominance',false,0]]}],

    ['lpds_primer','LPDs primer','LPDs primer', [
      ['~1–2 s periódus.','~1–2 s periodicity.'],
      ['Laterális dominancia.','Lateralized dominance.']
    ], {qHU:'Mi tol ictus felé?', qEN:'What favors ictus?', choices:[['Frekvencia gyorsul','Frequency accelerates',true,6],['Reaktivitás nő','Reactivity increases',false,0]]}],

    ['gpds_primer','GPDs primer','GPDs primer', [
      ['Széles eloszlás.','Diffuse distribution.'],
      ['Nem mindig ictális.','Not always ictal.']
    ], {qHU:'Mi kedvezőtlen?', qEN:'Unfavorable?', choices:[['GPD+F','GPD+F',true,6],['Stimulus reaktivitás jelen','Stimulus reactivity present',false,0]]}],

    ['photoparoxysmal','Photoparoxysmal','Photoparoxysmal', [
      ['Photic stimuláció provokálja.','Provoked by photic stimulation.']
    ], {qHU:'Mi lehet a forma?', qEN:'Possible form?', choices:[['Polytüske-hullám','Polyspike–wave',true,6],['Triphasicus hullám','Triphasic wave',false,0]]}],

    ['artifact_suite','Artefaktum csomag','Artifact suite', [
      ['EMG: szélessávú zaj.','EMG: broadband noise.'],
      ['EKG: ritmikus éles deflexiók.','ECG: rhythmic sharp deflections.']
    ], {qHU:'Mi EMG?', qEN:'Which is EMG?', choices:[['Szélessávú „zizgés”','Broadband buzz',true,6],['3 Hz SW','3 Hz SW',false,0]]}],

    ['rhythmic_delta','Ritmikus delta','Rhythmic delta', [
      ['FIRDA vs GRDA: topográfia különbözik.','FIRDA vs GRDA: different topography.']
    ], {qHU:'Mi FIRDA?', qEN:'Which is FIRDA?', choices:[['Frontális 1–3 Hz','Frontal 1–3 Hz',true,6],['Occipitalis 1–3 Hz','Occipital 1–3 Hz',false,0]]}],

    ['pediatric_intro','Pediátria bevezető','Pediatric intro', [
      ['Hypsarrhythmia kaotikus.','Hypsarrhythmia is chaotic.']
    ], {qHU:'Mi társulhat?', qEN:'What associates?', choices:[['Infantilis spazmus','Infantile spasms',true,6],['Mu-ritmus erősödése','Mu rhythm increase',false,0]]}],

    ['quiz_scoring','Kvíz pontozás','Quiz scoring', [
      ['Freeze → jelölés → Megoldás + XP.','Freeze → mark → Solution + XP.']
    ], {qHU:'Hogyan nő a Best?', qEN:'How does Best increase?', choices:[['Új %-os rekordnál','When new % record',true,6],['Csak XP-től','XP alone',false,0]]}],
  
    ['sirpids','SIRPIDs','SIRPIDs', [
      ['Stimulusra kiváltható periodikus vagy ritmikus kisülések.','Stimulus-induced rhythmic or periodic discharges.'],
      ['IIC része.','Part of the IIC.']
    ], {qHU:'Mi jellemző?', qEN:'Characteristic?', choices:[['Stimulusfüggő','Stimulus-dependent',true,8],['Mindig ictális','Always ictal',false,0]]}],
    ['sreda','SREDA','SREDA', [
      ['Éber felnőttben parietotemporális 5–6 Hz.','5–6 Hz parietotemporal in awake adults.'],
      ['Klinikai korrelátum nélkül.','No clinical correlate.']
    ], {qHU:'Mi veszély?', qEN:'Pitfall?', choices:[['Rohamnak nézhető','Can mimic seizure',true,8],['Mindig gyermek','Always pediatric',false,0]]}],
    ['firda_triphasic','FIRDA vs triphasicus','FIRDA vs triphasic', [
      ['FIRDA: 1–3 Hz frontális lassú ritmus.','FIRDA: 1–3 Hz frontal rhythmic delta.'],
      ['Triphasicus: háromfázisú, A–P késéssel.','Triphasic: three phases with A–P lag.']
    ], {qHU:'Melyik triphasicus?', qEN:'Which is triphasic?', choices:[['Három fázis + A–P késés','Three-phase + A–P lag',true,8],['Frontális ritmus 2 Hz','Frontal 2 Hz rhythm',false,0]]}],
    ['oirdapeds','OIRDA pediátria','OIRDA in pediatrics', [
      ['Gyermekeknél occipitalis 3 Hz.','Occipital 3 Hz in children.'],
      ['Gy often benign.','Often benign.']
    ], {qHU:'Hol a maximum?', qEN:'Max where?', choices:[['Occipitalis','Occipital',true,6],['Frontális','Frontal',false,0]]}],
    ['lpds_plus','LPDs + F','LPDs + F', [
      ['LPDs gyors komponenssel rosszabb.','LPDs with fast component worse.'],
      ['Ictalitas felé tolhatja.','Pushes toward ictality.']
    ], {qHU:'Mi kedvezőtlen?', qEN:'Unfavorable?', choices:[['+F jelenléte','+F present',true,8],['Stimulus reaktivitás','Stimulus reactivity',false,0]]}],];

  const E = [
    ['iic_spectrum','IIC spektrum','Ictal–interictal continuum', [
      ['LPDs, GPDs, LRDA, BIRDs elemek.','LPDs, GPDs, LRDA, BIRDs elements.'],
      ['Evolúció és klinikum dönt.','Evolution & clinical context decide.']
    ], {qHU:'Mi billenti ictus felé?', qEN:'What favors ictus?', choices:[['Frekvencia gyorsul','Frequency acceleration',true,8],['Reaktivitás nő','Increased reactivity',false,0]]}],

    ['tirda_focus','TIRDA fókusz','TIRDA focus', [
      ['Temporális max, 1–4 Hz.','Temporal max, 1–4 Hz.']
    ], {qHU:'Miért fontos?', qEN:'Why important?', choices:[['Fókusz biomarkere','Focus biomarker',true,8],['Generalizált jelenség','Generalized feature',false,0]]}],

    ['burst_supp_details','Burst-supp részletek','Burst-supp details', [
      ['Suppressio arány prognosztikus.','Suppression ratio prognostic.']
    ], {qHU:'Mi kedvezőtlen?', qEN:'Unfavorable?', choices:[['Reaktivitás hiánya','Absent reactivity',true,8],['Rövid suppressio','Short suppression',false,0]]}],

    ['seizure_evolution','Roham evolúció','Seizure evolution', [
      ['Gyorsulás → lassulás, amplitúdó növekedés.','Speed-up → slow-down with amplitude build-up.']
    ], {qHU:'Mi jelzi a kezdetet?', qEN:'What marks onset?', choices:[['Ritmikus gyors komponens','Rhythmic fast component',true,8],['Lambda megjelenése','Lambda appearance',false,0]]}],

    ['front_vs_artifact','Frontális vs EOG','Frontal vs EOG', [
      ['EOG sima, EEG spike meredek.','EOG smooth, EEG spike steep.']
    ], {qHU:'Mi EOG?', qEN:'Which is EOG?', choices:[['Sima nagy frontális lassú','Smooth large frontal slow',true,8],['Meredek tüske lassúval','Steep spike w/ slow',false,0]]}],

    ['ppr_deep','PPR mélyebben','PPR deeper', [
      ['Flash-ráta függés.','Depends on flash rate.']
    ], {qHU:'Mi jellemző?', qEN:'Characteristic?', choices:[['Time-lock a stimulussal','Time-locked to stimulus',true,8],['Triphasicus késés','Triphasic A–P lag',false,0]]}],

    ['lrda_vs_lpds','LRDA vs LPDs','LRDA vs LPDs', [
      ['LRDA: ritmikus; LPDs: periodikus komplex.','LRDA: rhythmic; LPDs: periodic complexes.']
    ], {qHU:'Mi LRDA?', qEN:'Which is LRDA?', choices:[['Folyamatos delta ritmus','Continuous delta rhythm',true,8],['Izolált periodikus kisülések','Isolated periodic discharges',false,0]]}],

    ['birds_advanced','BIRDs haladó','BIRDs advanced', [
      ['<10 s, potenciálisan ictális.','<10 s, potentially ictal.']
    ], {qHU:'Mi növeli gyanút?', qEN:'Raises suspicion?', choices:[['Amplitúdó-növekedés','Amplitude build-up',true,8],['Szemnyitásra blokkolás','Blocked by eye opening',false,0]]}],

    ['occipital_spikes','Occipitalis tüskék','Occipital spikes', [
      ['Lambda-tól morfológia különíti el.','Morphology separates from lambda.']
    ], {qHU:'Mi utal epileptiformitásra?', qEN:'What suggests epileptiform?', choices:[['Meredek tüske + lassú','Steep spike + slow',true,8],['Reaktív PDR','Reactive PDR',false,0]]}],

    ['complex_case','Komplex esettan','Complex case study', [
      ['Több mintázat keveréke.','Combination of multiple patterns.'],
      ['Klinikum és evolúció dönt.','Clinical context & evolution decide.']
    ], {qHU:'Mi a legfontosabb?', qEN:'Most important?', choices:[['Klinikai korreláció','Clinical correlation',true,8],['Csak frekvencia','Frequency alone',false,0]]}],
  
    ['sreda_pit','SREDA buktatók','SREDA pitfalls', [
      ['Ál-ictus, klinikum nélkül.','Pseudo-ictal without clinical.'],
      ['Topográfia parietotemporális.','Parietotemporal topography.']
    ], {qHU:'Mi NEM szükséges?', qEN:'NOT required?', choices:[['Klinikai korrelátum','Clinical correlate',true,10],['Ritmikus 5–6 Hz','Rhythmic 5–6 Hz',false,0]]}],
    ['breach_vs_spike','Breach vs tüske','Breach vs spike', [
      ['Breach élesebb de nem tüske-lassú.','Breach sharper but no spike–slow pair.']
    ], {qHU:'Melyik breach?', qEN:'Which is breach?', choices:[['Lokális amplitúdófokozódás','Local amplitude increase',true,8],['Tüske + lassú hullám','Spike + slow wave',false,0]]}],
    ['wicket_vs_tspike','Wicket vs T-tüske','Wicket vs temporal spike', [
      ['Wicket nem jár utólassúval.','Wicket lacks after-slow.']
    ], {qHU:'Mi wicket?', qEN:'Which is wicket?', choices:[['Ívelt, sorozatos középtemporális','Arch series mid-temporal',true,8],['Meredek tüske utólassúval','Steep spike with slow',false,0]]}],];

  window.LESSONS = [...mk('beginner',B), ...mk('intermediate',I), ...mk('expert',E)];
})();