const BOOKS = [
  {
    id: 'basics',
    titleHU: 'EEG alapok',
    titleEN: 'EEG Basics',
    pages: [
      {
        hu: 'Az elektroencefalográfia (EEG) az agy elektromos tevékenységének fájdalommentes mérése. A fejbőrre helyezett elektródák a neuronok feszültségváltozásait érzékelik, így a vizsgálat megmutatja az agyi ritmusokat.',
        advHU: 'Az EEG a kortikális posztszinaptikus potenciálok summációját rögzíti, differenciális erősítőkkel, közös vagy bipoláris montázsban. A standard 10–20-as rendszer biztosítja a térbeli mintavételezés reprodukálhatóságát.',
        en: 'Electroencephalography (EEG) painlessly records the brain\'s electrical activity. Electrodes on the scalp detect tiny voltage changes from neurons, revealing the brain\'s rhythms.',
        advEN: 'Electroencephalography captures summed cortical postsynaptic potentials using differential amplifiers in referential or bipolar montages. Standard 10–20 system placement provides reproducible spatial sampling.'
      },
      {
        hu: 'A normál agyi ritmusokat frekvenciájuk szerint nevezzük el. Az alfa hullámok (8–13 Hz) a tarkótáj felett láthatók pihenéskor, csukott szemmel. A 13 Hz feletti béta aktivitás gyorsabb, éberség vagy gyógyszerszedés mellett jelentkezhet.',
        advHU: 'A hullámformákat frekvencia, amplitúdó és morfológia alapján értékeljük. A 8–13 Hz-es occipitalis dominanciájú alfa ritmus szemnyitásra blokkot mutat. A 13 Hz feletti béta aktivitás lehet generalizált vagy fokális; túlzott mértéke benzodiazepin hatást jelezhet.',
        en: 'Normal brain rhythms are named by frequency. Alpha waves (8–13 Hz) appear over the occipital region when relaxed with eyes closed. Beta activity above 13 Hz is faster and may appear with alertness or medication.',
        advEN: 'Waveforms are analyzed by frequency, amplitude and morphology. The posterior dominant alpha rhythm at 8–13 Hz attenuates with eye opening. Beta activity over 13 Hz may be generalized or focal; excessive beta often reflects benzodiazepine effect.'
      }
    ]
  }
];

window.EEG_BOOKS = BOOKS;
