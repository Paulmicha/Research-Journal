
/**
 * Provides generic metrics when we can't find our own in Boavizta source.
 *
 * This is an adapted copy/paste from the "Ecodiag" tool :
 * See https://gitlab.inria.fr/guenneba/ecodiag
 */

const hypot = vals => {
  return Math.sqrt(vals.reduce((r,v) => r + v * v, 0));
};

// see Referenciel_Ecodiag.ods
const ecodiagDeviceList = {

  desktop:{
    label_fr:           "PC fixe",
    label_en:           "desktop",
    grey_CO2:           {mean:350,std:hypot([0.3,0.72])},
    power_consumption:  0.2,  // kW     (seems to be reasonable regarding DELL's CO2 sheets)
    duration:           4,    // years,
    usage:              365,
    yearly_consumption: 300, /* au pif entre ecodiag PC et ecodiag WS */

    models: {
      // basic:                {grey_CO2: {mean:250,std:hypot([0.3,0.12 /*semble faible*/])}, yearly_consumption: 189 /* ecodiag*/},
      // basic_with_screen:    350,
      ecodiag_avg_PC:       {
        label_fr: 'PC fixe (moy.)',
        label_en: 'tower (average)',
        grey_CO2: {mean:300,std:hypot([0.3,0.2])}, yearly_consumption: 189 /* ecodiag */, duration: 4},
      avg_WS:               {
        label_fr: 'station de travail (moy.)',
        label_en: 'workstation (average)',
        grey_CO2: {mean:600,std:hypot([0.3,0.27])} /* avg MacPro & Dell Precision */, yearly_consumption: 770 /* ecodiag */, duration: 5},
      // powerful:             {grey_CO2: 500, yearly_consumption: 770},

      optiplex_micro:       {grey_CO2: {mean:174,std:hypot([0.3,0.07])}, yearly_consumption:  45 /* DELL */ },
      optiplex_small:       {grey_CO2: {mean:240,std:hypot([0.3,0.07])}, yearly_consumption:  90 /* DELL */ },
      optiplex_tower:       {grey_CO2: {mean:260,std:hypot([0.3,0.12])}, yearly_consumption: 110 /* DELL */ },

      precision_tower_3xxx: {grey_CO2: {mean:322,std:hypot([0.3,0.15])}, yearly_consumption: 150 /* DELL */ },
      precision_tower_5xxx: {grey_CO2: {mean:475,std:hypot([0.3,0.03])}, yearly_consumption: 440 /* DELL */ },
      precision_tower_7xxx: {grey_CO2: {mean:646,std:hypot([0.3,0.06])}, yearly_consumption: 760 /* DELL */ },

      mac_mini:             270,
      imac_21:              290,
      imac_21_retina:       300,
      imac_27_retina:       450,
      imac_pro:             700,
      mac_pro:              900,
      // mac_pro_all_options: 2300,
    }
  },


  // ecodiag: 210

  laptop:{
    label_fr:           "laptop",
    label_en:           "laptop",
    power_consumption:  0.025,  // kW
    duration:           4,      // years
    usage:              9,
    grey_CO2:           260,
    yearly_consumption: 48,     // ecodiag, match 0.025 kW * 9h * 220j :)

    models: {
      //basic:              300,
      ecodiag_avg_laptop: {
        label_fr:           "moyenne",
        label_en:           "average",
      // powerful:           400,
        grey_CO2: {mean:260,std:hypot([0.2,0.56])}, yearly_consumption: 48, lifetime: 3},

      avg_laptop_13: {
        label_fr:           "moyenne 13\"",
        label_en:           "average 13\"",
        grey_CO2: {mean:250,std:hypot([0.2 /* arbitrary */, 0.44])}},

			// Ecometrics : need 1 screen size per average.
			avg_laptop_14: {
				label_fr:           "moyenne 14\"",
				label_en:           "average 14\"",
				grey_CO2: {mean:294,std:hypot([0.2 /* arbitrary */, 0.37])}},
      avg_laptop_15: {
        label_fr:           "moyenne 15\"",
        label_en:           "average 15\"",
        grey_CO2: {mean:294,std:hypot([0.2 /* arbitrary */, 0.37])}},

      avg_laptop_17: {
        label_fr:           "moyenne 17\"",
        label_en:           "average 17\"",
        grey_CO2: {mean:365,std:hypot([0.2 /* arbitrary */, 0.18 /* ! low number of samples (3) */])}},


      latitude_3xxx:     {
        label: "latitude 3xxx",
        grey_CO2: {mean:220,std:hypot([0.2 /* arbitrary */, 0.13])}},

      latitude_5xxx:     {
        label: "latitude 5xxx",
        grey_CO2: {mean:300,std:hypot([0.2 /* arbitrary */, 0.21])}},

      latitude_7xxx:     {
        label: "latitude 7xxx",
        grey_CO2: {mean:264,std:hypot([0.2 /* arbitrary */, 0.33])}},

      // latitude_72xx:      355,
      // latitude_73xx:      335,
      // latitude_74xx:      415,

      precision_3xxx:     {
        label: "precision 3xxx",
        grey_CO2: {mean:266,std:hypot([0.2 /* arbitrary */, 0.06])}},

      precision_5xxx:     {
        label: "precision 5xxx",
        grey_CO2: {mean:280,std:hypot([0.2 /* arbitrary */, 0.03])}},

      precision_7xxx:     {
        label: "precision 7xxx",
        grey_CO2: {mean:304,std:hypot([0.2 /* arbitrary */, 0.09])}},


      macbook_air:        {
        label: "MacBook air",
        grey_CO2: {mean:250,std:hypot([0.2 /* arbitrary */, 0.47])}},
      macbook_air_preretina:        {
        label: "MacBook air pre-retina",
        grey_CO2: {mean:310,std:hypot([0.2 /* arbitrary */, 0.08])}},
      macbook_air_retina:        {
        label: "MacBook air retina",
        grey_CO2: {mean:176,std:hypot([0.2 /* arbitrary */, 0.11])}},

      macbook_pro_13:     {
        label: "MacBook pro 13\"",
        grey_CO2: {mean:256,std:hypot([0.2 /* arbitrary */, 0.34])}},

      macbook_pro_15:   {
        label: "MacBook pro 15\"",
        grey_CO2: {mean:330,std:hypot([0.2 /* arbitrary */, 0.18])}},

      // macbook_pro_16:  {
      //   label: "MacBook pro 16\"",
      //   grey_CO2: {mean:330,std:hypot([0.2 /* arbitrary */, 0.18])}},
    }
  },

  // ecodiag: 350
  screen:{
    label_fr:           "écran (moyenne)",
    label_en:           "screen (average)",
    grey_CO2:           430,    // based on the average of 9 DELL's 24" monitors (24" monitors are likely the most common)
    power_consumption:  0.035,  // kW (measured on AOC Q3277PQU)
    duration:           5,      // years, ecodiag: 3
    usage:              365,
    yearly_consumption: 70,     // ecodiag, match 0.035 kW * 9h * 220j :)
    models: {
      screen_upto23 : {
        label_fr: 'jusqu\'à 23"',
        label_en: 'up to 23"',
        grey_CO2: 350}, // average on DELL's data
      screen_24to31 : {
        label:    '24"-31"',
        grey_CO2: 430}, // average on DELL's data
      screen_32toinf: {
        label_fr:'32" et plus',
        label_en:'32" and larger',
        grey_CO2: 590, yearly_consumption: 110}, // average on DELL's data
    }
  },

  videoprojector: {
    label_fr: 'vidéo projecteur',
    label_en: 'video projector',
    // https://www.bilans-ges.ademe.fr/fr/basecarbone/donnees-consulter/liste-element?recherche=vid%C3%A9o+projecteur
    grey_CO2:           94,   // TODO : 75% d'incertitude !!
    power_consumption:  0.3,  // source : recherche rapide de quelques modèles standards d'Epson
    duration:           7,    // pif
    yearly_consumption: 120   /* = 2h * 200j * 0.3kW */, // ecodiag 1752 pour 500h/an => ça ne colle pas ! y'a un bug !
    usage:              3,    // 3h par jour ouvré
    models: {
      //                                                                                                          kWh  =  kW  *h*days
      projector_portable: {
        label_fr: 'transportable',
        label_en: 'portable',
        grey_CO2:  94 /* ADEME */, duration:  7, power_consumption: 0.260, yearly_consumption: 104 /* 0.260*2*200 */},
      projector_room:     {
        label_fr: 'pour salle',
        label_en: 'for meeting/class room',
        grey_CO2: 150 /* pif */  , duration: 10, power_consumption: 0.310, yearly_consumption: 155 /* 0.310*2*250 */},
      projector_large:    {
        label_fr: 'pour amphi',
        label_en: 'for conference room',
        grey_CO2: 200 /* pif */  , duration: 10, power_consumption: 0.700, yearly_consumption: 280 /* 0.700*2*200 */},
    }
  },

  // TV: {
  //   grey_CO2:             400,  // [340:500], http://bilans-ges.ademe.fr/fr/basecarbone/donnees-consulter/liste-element?recherche=t%C3%A9l%C3%A9vision
  //   yearly_consumption:   110,  // 100W * 3h * 365days
  //   power_consumption:    0.1,  // TODO
  //   duration:             7,    // TODO
  //   usage:                3,
  // },

  // ecodiag: 80
  // Ecometrics : use 'average' in title for our values fallback process.
  pad: {
    label_fr:           'tablette (moyenne)',
    label_en:           'pad (average)',
    grey_CO2:           150,
    power_consumption:  0, // TODO
    duration:           2,  // ecodiag
    yearly_consumption: 5,  // ecodiag
  },

  // ecodiag: 63
  // http://bilans-ges.ademe.fr/fr/basecarbone/donnees-consulter/liste-element?recherche=t%C3%A9l%C3%A9phone
  // - [16:40] +/- 50%
  smartphone: {
    label:              'smartphone',
    grey_CO2:           63,
    power_consumption:  0,    // TODO
    duration:           1.5,  // TODO
    yearly_consumption: 5,    // ecodiag
  },

  // console: {
  //   power_consumption: 0, // TODO
  //   duration:          5, // TODO
  // },



  printer: {
    label_fr: 'imprimante',
    label_en: 'printer',
    grey_CO2: 100,        // TODO  [90:200] http://bilans-ges.ademe.fr/fr/basecarbone/donnees-consulter/liste-element?recherche=imprimante
    power_consumption: 0, // TODO
    duration:          3, // TODO
    yearly_consumption: 71, /* ecodiag, match avg lexmark */
    models: {
      laser_lt_40kg:    {
        label_fr: 'laser à poser (<40kg)',
        label_en: 'laser (<40kg)',
        grey_CO2:  130 /* avg lexmark */ + 300 /* toners CHECK */, yearly_consumption: 71 /* ecodiag, match avg lexmark */, duration: 5},
      office_40_99kg:   {
        label: 'laser A3 (40-99kg)',
        grey_CO2:  660 /* fabric+transport */ + 300 /* toners CHECK */, yearly_consumption: 150 /* lexmark */, duration: 5},
      office_ge_100kg:  {
        label: 'laser A3 (>100kg)',
        grey_CO2: 1500 /* fabric+transport */ + 300 /* toners CHECK */, yearly_consumption: 200 /* TODO */, duration: 5},
    }
  },

  ipphone: {
    label_fr:           'téléphone IP',
    label_en:           'IP phone',
    grey_CO2:           17, // ecodiag
    power_consumption:  40/(24*365), // to match yearly_consumption
    duration:           10, // pif
    yearly_consumption: 40, // ecodiag
    usage:             365,
  },

  keyboard: {
    label_fr:           'clavier',
    label_en:           'keyboard',
    grey_CO2:           24, // ecodiag => this seems way too high
    power_consumption:   0,
    duration:            4, // ecodiag 3
    yearly_consumption:  0,
  },

  mouse: {
    label_fr:           'souris',
    label_en:           'mouse',
    grey_CO2:            5, // ecodiag
    power_consumption:   0,
    duration:            4, // ecodiag 3
    yearly_consumption:  0,
  },

  wifihub: {
    label_fr:           'borne wifi',
    label_en:           'wifi hub',
    grey_CO2:           10, // ecodiag, https://www.ece.nus.edu.sg/stfpage/bsikdar/papers/tce_bs_12.pdf
    power_consumption:   70/(24*365), // to match yearly_consumption
    duration:            6,
    yearly_consumption: 70, // ecodiag
    usage:             365
  },

  server: {
    label_fr:           'serveur (moyenne)',
    label_en:           'server (average)',
    grey_CO2:           1300,   // ecodiag
    power_consumption:  0,      // TODO
    duration:           5,      // ecodiag
    yearly_consumption: 850,    // ecodiag

    models: {
      computingserver: {
        label_fr: 'noeud de calcul',
        label_en: 'computing node',
        grey_CO2: 1300 /* ecodiag */, yearly_consumption: 1600 /* ecodiag */, duration: 5 /* ecodiag */}
    }
  },

};

module.exports = { ecodiagDeviceList };
