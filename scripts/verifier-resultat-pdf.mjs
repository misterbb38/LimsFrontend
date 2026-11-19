// ============================================================================
// Controle automatique de la mise en page du PDF de resultats.
//
//   node scripts/verifier-resultat-pdf.mjs [dossier-de-sortie]
//
// Genere des comptes rendus FICTIFS couvrant tous les types de resultat
// (valeur simple, qualitatif, NFS, ionogramme, bacteriologie, antibiogramme,
// spermogramme, interpretations, ...) puis verifie geometriquement chaque
// page : aucun texte ne chevauche un autre, rien ne sort des marges ni ne
// descend dans le pied de page, pas de grand blanc en bas de page.
// Chaque dossier est rendu avec un nombre variable de tests "de remplissage"
// en tete pour deplacer les sauts de page et tester toutes les positions.
// ============================================================================
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { rendre, controler } from './controle-geometrique.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir =
  process.argv[2] || path.join(__dirname, '..', '..', 'apercu-resultats-pdf')
fs.mkdirSync(outDir, { recursive: true })

// ------------------------------ Donnees fictives ---------------------------
const cell = (valeur, unite, reference) => ({ valeur, unite, reference })
let seq = 0
const test = (nom, categories, fields = {}, testFields = {}) => ({
  _id: `r${++seq}`,
  testId: {
    nom,
    categories,
    machineA: 'Cobas c311',
    machineB: 'Mindray BS-240',
    valeurMachineA: '',
    valeurMachineB: '',
    ...testFields,
  },
  statutMachine: true,
  observations: { macroscopique: [] },
  ...fields,
})

const simple = (nom, cat, valeur, ref, extra = {}, tf = {}) =>
  test(
    nom,
    cat,
    { valeur, methode: 'Spectrophotométrie', ...extra },
    { valeurMachineA: ref, ...tf }
  )

const INTERP_TABLE = {
  type: 'mixed',
  content: {
    columns: [
      'Catégorie',
      'Valeur (g/L)',
      'Valeur (mmol/L)',
      'Conduite à tenir',
    ],
    rows: [
      ['Normal', '< 1,10', '< 6,1', 'Aucune'],
      [
        'Hyperglycémie modérée à jeun',
        '1,10 - 1,25',
        '6,1 - 6,9',
        'Contrôle à distance et règles hygiéno-diététiques',
      ],
      ['Diabète', '>= 1,26', '>= 7,0', 'Confirmer par un second dosage'],
    ],
    text:
      'Le diagnostic de diabète repose sur deux glycémies à jeun supérieures ou égales à 1,26 g/L. ' +
      "Une glycémie comprise entre 1,10 et 1,25 g/L définit l'hyperglycémie modérée à jeun, qui justifie un contrôle annuel.",
  },
}
const INTERP_TEXT = {
  type: 'text',
  content:
    'Objectif HbA1c <= 7 % pour la plupart des patients diabétiques de type 2.\n' +
    'Objectif <= 6,5 % en cas de diabète nouvellement diagnostiqué sans antécédent cardio-vasculaire.\n' +
    'Objectif <= 8 % chez le sujet âgé fragile ou en cas de comorbidité grave.',
}
const INTERP_LONG = {
  type: 'mixed',
  content: {
    columns: [
      'Domaine de quantification',
      'Interprétation',
      'Seuil de détection',
      'Unité',
      'Remarque',
    ],
    rows: Array.from({ length: 14 }, (_, i) => [
      `Palier ${i + 1} de quantification`,
      'Charge virale détectable et quantifiable dans le domaine linéaire',
      `${(i + 1) * 20} UI/mL`,
      'UI/mL',
      i % 2 ? 'À contrôler' : '',
    ]),
    text: Array.from(
      { length: 9 },
      () =>
        "Une charge virale indétectable ne permet pas d'exclure une infection ; l'interprétation doit tenir compte du contexte clinique, du traitement en cours et des antériorités."
    ).join(' '),
  },
}

const biochimie = () => [
  simple(
    'Glycémie à jeun',
    'Biochimie sanguine',
    '0.95',
    '0,70 - 1,10 g/L',
    {
      dernierResultatAnterieur: { valeur: '1.02', date: '2026-03-12' },
      statutInterpretation: true,
    },
    { interpretationA: INTERP_TABLE }
  ),
  simple('Créatinine', 'Biochimie sanguine', '9.8', '6 - 13 mg/L', {
    typePrelevement: 'Sérum',
    datePrelevement: '2026-11-18',
  }),
  simple('Urée', 'Biochimie sanguine', '0.32', '0,15 - 0,45 g/L'),
  simple(
    'Hémoglobine glyquée (HbA1c)',
    'Biochimie sanguine',
    '7.4',
    '4,0 - 6,0 %',
    {
      statutInterpretation: true,
      remarque:
        'Résultat contrôlé sur un second prélèvement. À confronter au carnet de glycémies du patient.',
      dernierResultatAnterieur: { valeur: '8.1', date: '2026-05-02' },
    },
    { interpretationA: INTERP_TEXT }
  ),
  simple(
    'TSH ultra-sensible (thyréostimuline hypophysaire) - dosage de troisième génération par électrochimiluminescence',
    'Hormonologie',
    '2.31',
    '0,27 - 4,20 µUI/mL',
    {
      methode: 'Électrochimiluminescence (ECLIA) sur automate Cobas e411',
      dernierResultatAnterieur: { valeur: '3.05', date: '2025-12-01' },
    }
  ),
  simple(
    'Prolactine',
    'Hormonologie',
    '18.4',
    'Femme non enceinte : 4,8 - 23,3 ng/mL ; Homme : 4,0 - 15,2 ng/mL ; Grossesse : 34 - 386 ng/mL'
  ),
  simple('Sérologie Toxoplasmose IgG', 'Immunologie', 'Positif', '', {
    qualitatif: 'Immunité ancienne probable',
    remarque: 'Titre : 145 UI/mL.',
  }),
  simple(
    'Test de grossesse (Beta-HCG qualitatif)',
    'Immunologie',
    'Négatif',
    'Négatif'
  ),
  simple(
    'Recherche de sang occulte dans les selles',
    'Immunologie',
    'Présence de sang occulte dans les selles sur les trois prélèvements successifs',
    'Absence'
  ),
  simple(
    'Charge virale VHB',
    'Virologie',
    '10',
    '< 10 UI/mL',
    {
      exceptions: { chargeVirale: { log: '1.00' } },
      statutInterpretation: true,
    },
    { interpretationA: INTERP_LONG }
  ),
]

const hematologie = () => [
  test('Numération Formule Sanguine (NFS)', 'Hématologie', {
    methode: 'Impédance / cytométrie en flux',
    exceptions: {
      nfs: {
        hematiesEtConstantes: {
          gr: cell(4.52, '10^6/mm3', '4,00 - 5,50'),
          hgb: cell(11.2, 'g/dL', '12,0 - 16,0'),
          hct: cell(35.1, '%', '37 - 47'),
          vgm: cell(77.6, 'fL', '80 - 100'),
          tcmh: cell(24.8, 'pg', '27 - 32'),
          ccmh: cell(31.9, 'g/dL', '32 - 36'),
          idr_cv: cell(15.2, '%', '11,5 - 14,5'),
        },
        leucocytesEtFormules: {
          gb: cell(7.85, '10^3/mm3', '4,00 - 10,00'),
          neut: {
            valeur: 4.71,
            unite: '10^3/mm3',
            pourcentage: 60,
            referenceValeur: '1,80 - 7,50',
          },
          lymph: {
            valeur: 2.36,
            unite: '10^3/mm3',
            pourcentage: 30.1,
            referenceValeur: '1,00 - 4,00',
          },
          mono: {
            valeur: 0.47,
            unite: '10^3/mm3',
            pourcentage: 6,
            referenceValeur: '0,20 - 1,00',
          },
          eo: {
            valeur: 0.24,
            unite: '10^3/mm3',
            pourcentage: 3,
            referenceValeur: '0,04 - 0,50',
          },
          baso: {
            valeur: 0.07,
            unite: '10^3/mm3',
            pourcentage: 0.9,
            referenceValeur: '< 0,10',
          },
          plt: cell(245, '10^3/mm3', '150 - 400'),
          myelocytes: {
            valeur: 0.08,
            unite: '10^3/mm3',
            pourcentage: 1,
            referenceValeur: 'Absence',
          },
          metamyelocytes: {
            valeur: 0.16,
            unite: '10^3/mm3',
            pourcentage: 2,
            referenceValeur: 'Absence',
          },
        },
      },
    },
    remarque:
      'Anémie microcytaire hypochrome : un bilan martial est conseillé.',
  }),
  test('Groupe sanguin ABO - Rhésus', 'Hématologie', {
    methode: 'Hémagglutination',
    exceptions: { groupeSanguin: { abo: 'A', rhesus: 'Positif' } },
  }),
  test('Goutte épaisse / QBC', 'Hématologie', {
    exceptions: {
      qbc: {
        positivite: 'Positif',
        nombreCroix: 3,
        densiteParasitaire: '12 500 parasites/µL',
        especes: ['Plasmodium falciparum'],
      },
    },
  }),
  test('Taux de Prothrombine', 'Hémostase', {
    exceptions: {
      tauxProthrombine: {
        tp: cell(3, '%', '> 70'),
        inr: cell(12.4, '', '0,9 - 1,2'),
      },
    },
  }),
  test('Réticulocytes', 'Hématologie', {
    exceptions: {
      reticulocytes: {
        pourcentage: { valeur: 1.2, unite: '%' },
        valeurAbsolue: { valeur: 54240, unite: '/mm3' },
      },
    },
  }),
  test('Gaz du sang', 'Biochimie sanguine', {
    exceptions: {
      gazDuSang: {
        ph: cell(7.38, '', '7,35 - 7,45'),
        pco2: cell(41, 'mmHg', '35 - 45 mmHg'),
        po2: cell(88, 'mmHg', '70 - 115 mmHg'),
        excesDeBase: cell(0, 'mmol/L', '-2,0 - 2,0'),
        tco2: cell(25, 'mmol/L', '23 - 27'),
        hco3: cell(24, 'mmol/L', '22 - 26'),
        sao2: cell(97, '%', '95 - 99'),
      },
    },
  }),
]

const calculs = () => [
  test('HGPO (hyperglycémie provoquée par voie orale)', 'Biochimie sanguine', {
    exceptions: { hgpo: { t0: '0.89', t60: '1.75', t120: '1.60' } },
  }),
  test('Ionogramme sanguin', 'Biochimie sanguine', {
    exceptions: {
      ionogramme: { na: '138.2', k: '4.1', cl: '101', ca: '2.31', mg: '0.85' },
    },
    dernierResultatAnterieur: { valeur: '', date: null },
  }),
  test('Sérologie de Widal et Félix', 'Immunologie', {
    exceptions: {
      widal: {
        ao: { statut: 'Négative' },
        ah: { statut: 'Négative' },
        bo: { statut: 'Positive', titre: '1/160' },
        bh: { statut: 'Négative' },
        to: { statut: 'Positive', titre: '1/320' },
        th: { statut: 'Positive', titre: '1/80' },
      },
    },
  }),
  test('HPV (Papillomavirus) - génotypage', 'Virologie', {
    exceptions: {
      hpv: { hpv16: 'Négative', hpv18et45: 'Positive', autresHpv: 'Négative' },
    },
  }),
  test('PSA libre / PSA total', 'Marqueurs tumoraux', {
    exceptions: {
      psaRapport: {
        psaLibre: { valeur: 0.82, unite: 'ng/mL' },
        psaTotal: { valeur: 6.4, unite: 'ng/mL' },
        rapport: { valeur: 12.8, unite: '%' },
      },
    },
  }),
  test('Clairance de la créatinine (Cockcroft-Gault)', 'Biochimie sanguine', {
    exceptions: {
      clairanceCreatinine: {
        creatinineMgL: { valeur: 11.2, unite: 'mg/L' },
        clairance: { valeur: 78, unite: 'mL/min' },
      },
    },
  }),
  test('DFG (CKD-EPI)', 'Biochimie sanguine', {
    exceptions: {
      dfg: {
        creatinineMgL: { valeur: 11.2, unite: 'mg/L' },
        dfgValue: { valeur: 74, unite: 'mL/min/1.73m²' },
      },
    },
  }),
  test('Coefficient de saturation de la transferrine', 'Biochimie sanguine', {
    exceptions: {
      saturationTransferrine: {
        ferSerique: { valeur: 62, unite: 'µg/dL' },
        ctff: { valeur: 71, unite: 'µmol/L' },
        coefficient: { valeur: 15.6, unite: '%' },
      },
    },
  }),
  test("Compte d'Addis (HLM)", 'Biochimie urinaire', {
    exceptions: {
      compteAddis: {
        leucocytesTotaux: { valeur: 850, unite: '' },
        hematiesTotales: { valeur: 320, unite: '' },
      },
    },
  }),
  test('Calcium corrigé', 'Biochimie sanguine', {
    exceptions: {
      calciumCorrige: { calciumCorrige: { valeur: 2.41, unite: 'mmol/L' } },
    },
  }),
  test('Rapport albuminurie / créatininurie', 'Biochimie urinaire', {
    exceptions: {
      rapportAlbuminurie: {
        albumineUrinaire: { valeur: 42, unite: 'mg/L' },
        creatinineUrinaire: { valeur: 1.1, unite: 'g/L' },
        rapport: { valeur: 38.2, unite: 'mg/g' },
      },
    },
  }),
  test('Rapport protéinurie / créatininurie', 'Biochimie urinaire', {
    exceptions: {
      rapportProteines: {
        proteinesUrinaires: { valeur: 18, unite: 'mg/dL' },
        creatinineUrinaire: { valeur: 110, unite: 'mg/dL' },
        rapport: { valeur: 163, unite: 'mg/g' },
      },
    },
  }),
  test('Cholestérol LDL', 'Biochimie sanguine', {
    valeur: '1.42',
    exceptions: {
      cholesterolLdl: {
        ldl: { valeur: 1.38, unite: 'g/L', reference: '< 1,60 g/L' },
      },
    },
  }),
  test('Lipides totaux', 'Biochimie sanguine', {
    exceptions: {
      lipidesTotaux: { lipidesTotaux: { valeur: 6.2, unite: 'g/L' } },
    },
  }),
  test('Microalbuminurie des 24 heures', 'Biochimie urinaire', {
    exceptions: {
      microalbuminurie24h: {
        volumeUrinaire24h: { valeur: 1.6, unite: 'L' },
        microalbuminurie: { valeur: 48, unite: 'mg/24h' },
      },
    },
  }),
  test('Protéinurie des 24 heures', 'Biochimie urinaire', {
    exceptions: {
      proteinurie24h: {
        volumeUrinaire24h: { valeur: 1.6, unite: 'L' },
        proteinurie: { valeur: 210, unite: 'mg/24h' },
      },
    },
  }),
  test('Bilirubine indirecte', 'Biochimie sanguine', {
    exceptions: {
      bilirubineIndirecte: {
        bilirubineIndirecte: { valeur: 6.4, unite: 'mg/L' },
      },
    },
  }),
]

const ATB = [
  'Amoxicilline',
  'Amoxicilline + Acide Clavulanique',
  'Pipéracilline + Tazobactam',
  'Céfalotine',
  'Céfoxitine',
  'Céfotaxime',
  'Ceftazidime',
  'Céfépime',
  'Imipénème',
  'Ertapénème',
  'Gentamicine',
  'Amikacine',
  'Acide nalidixique',
  'Ciprofloxacine',
  'Lévofloxacine',
  'Fosfomycine',
  'Nitrofurantoïne',
  'Triméthoprime + Sulfaméthoxazole (Cotrimoxazole)',
  'Chloramphénicol',
  'Tétracycline',
  'Colistine',
  'Tigécycline',
]
const antibiogramme = (n) =>
  Object.fromEntries(
    ATB.slice(0, n).map((a, i) => [a, ['S', 'S', 'R', 'I'][i % 4]])
  )

const bacterio = () => [
  test('Examen cytobactériologique des urines (ECBU)', 'Bactériologie', {
    typePrelevement: 'Urines',
    lieuPrelevement: 'Milieu de jet, recueil au laboratoire',
    datePrelevement: '2026-11-17',
    observations: {
      macroscopique: ['Urines troubles', 'jaune foncé', 'avec dépôt'],
      microscopique: {
        leucocytes: '120 000',
        hematies: '8 000',
        unite: 'mL',
        cellulesEpitheliales: 'Rares',
        cristaux: 'Présence',
        cristauxDetails: ['Oxalate de calcium', 'Urate'],
        cylindres: 'Absence',
        parasites: 'Absence',
        elementsLevuriforme: 'Absence',
        polynucleairesNeutrophilesAlterees: 'Nombreux',
        polynucleairesNeutrophilesNonAlterees: 'Quelques-uns',
      },
      chimie: { proteinesTotales: '', glycorachie: '' },
    },
    gram: 'Bacilles à Gram négatif, nombreux',
    culture: {
      culture: 'Positive',
      description: '10^6 UFC/mL',
      germeIdentifie: [
        { nom: 'Escherichia coli', antibiogramme: antibiogramme(22) },
        {
          nom: 'Klebsiella pneumoniae ssp pneumoniae I',
          antibiogramme: antibiogramme(9),
        },
      ],
    },
    conclusion:
      'Infection urinaire à Escherichia coli et Klebsiella pneumoniae ssp pneumoniae I, souche productrice de bêta-lactamase à spectre étendu. ' +
      "Antibiothérapie à adapter à l'antibiogramme ci-dessous.",
    remarque:
      'Un ECBU de contrôle est recommandé 48 à 72 heures après la fin du traitement.',
  }),
  test(
    'Prélèvement vaginal (PV) + recherche de mycoplasmes et Chlamydia',
    'Bactériologie',
    {
      typePrelevement: 'Prélèvement vaginal',
      lieuPrelevement: 'Cul-de-sac postérieur',
      datePrelevement: '2026-11-17',
      observations: {
        macroscopique: ['Leucorrhées abondantes'],
        microscopique: {
          leucocytes: 'Nombreux',
          hematies: 'Rares',
          cellulesEpitheliales: 'Nombreuses',
          trichomonasVaginalis: 'Absence',
          clueCells: 'Présence',
          gardnerellaVaginalis: 'Présence',
          bacillesDeDoderlein: 'Rares',
          typeDeFlore: 'Flore deséquilibrée de type III',
          ph: '5,5',
          rechercheDeStreptocoqueB: 'Négative',
        },
        rechercheChlamydia: {
          naturePrelevement: 'Endocol',
          rechercheAntigeneChlamydiaTrochomatis: 'Négative',
        },
        rechercheMycoplasmes: {
          naturePrelevement: 'Endocol',
          rechercheUreaplasmaUrealyticum: 'Positive, titre >= 10^4 UCC/mL',
          rechercheMycoplasmaHominis: 'Négative',
        },
      },
      culture: {
        culture: 'Positive',
        germeIdentifie: [{ nom: 'Candida albicans', antibiogramme: {} }],
      },
      conclusion:
        'Vaginose bactérienne à Gardnerella vaginalis associée à une candidose à Candida albicans.',
    }
  ),
  test('Liquide céphalo-rachidien (LCR)', 'Bactériologie', {
    typePrelevement: 'LCR',
    lieuPrelevement: 'Ponction lombaire',
    datePrelevement: '2026-11-17',
    observations: {
      macroscopique: ['Liquide clair', 'eau de roche'],
      microscopique: { leucocytes: '2', hematies: '0', unite: 'mm3' },
      chimie: {
        proteinesArochies: '0,32 g/L',
        glycorachie: '0,61 g/L',
        LDH: '22 UI/L',
      },
    },
    gram: 'Absence de germe',
    culture: { culture: 'Stérile après 72 heures' },
    conclusion: 'LCR normal.',
  }),
]

const spermogramme = () => [
  test('Spermogramme - Spermocytogramme', 'Spermiologie', {
    exceptions: {
      spermogramme: {
        dureeAbstinence: cell(4, 'jours', '2 - 7'),
        modePrelevement: 'au laboratoire',
        volume: cell(2.8, 'mL', '> 1,5'),
        ph: cell(7.6, '', '> 7,2'),
        viscosite: 'normale',
        aspect: 'normal',
        numeration: cell(9800000, '/mL', '>= 16 000 000'),
        ejaculatTotal: cell(27440000, '', '>= 39 000 000'),
        agglutinatsSpontanes: 'absents',
        leucocytes: 'rares',
        hematies: 'absentes',
        cellulesRondes: 'présentes',
        spermatozoidesVivants: cell(48, '%', '>= 54'),
        mobiliteProgressive: cell(22, '%', '> 30 à 1 h'),
        mobiliteNonProgressive: cell(12, '%', ''),
        immobiles: cell(66, '%', ''),
        morphoNormal: { count: 6, pourcentage: 3, reference: '>= 4' },
        morphoAnormal: { count: 194, pourcentage: 97 },
        defautsTete: { count: 160, pourcentage: 80 },
        defautsPieceInter: { count: 44, pourcentage: 22 },
        defautsFlagelle: { count: 30, pourcentage: 15 },
        resteCytoplasmique: { count: 8, pourcentage: 4 },
        indexAnomaliesMultiples: { valeur: 1.82, reference: '< 1,6' },
        conclusionSpermogramme: 'Oligo-asthénozoospermie',
        conclusionSpermocytogramme: 'Tératozoospermie',
        commentaires: [
          'Un spermogramme de contrôle est recommandé dans un délai de trois mois, dans les mêmes conditions de recueil.',
          'Résultats à interpréter en fonction du contexte clinique.',
        ],
      },
    },
  }),
]

const remplissage = (n) =>
  Array.from({ length: n }, (_, i) =>
    simple(
      `Paramètre de remplissage ${i + 1}`,
      'A - Remplissage',
      `${(i + 1) * 1.5}`,
      '1,0 - 99,0 U/L'
    )
  )

const dossier = (resultat, o = {}) => ({
  identifiant: 'BA-261119-004',
  createdAt: '2026-11-19T09:30:00Z',
  prescripteur: o.prescripteur || 'Dr Aminata Ndiaye',
  userId: {
    prenom: o.prenom || 'Fatou',
    nom: o.nom || 'Diop',
    nip: '00002',
    age: 34,
    sexe: 'F',
    telephone: '+221789676767',
  },
  resultat,
  historiques: o.technique
    ? [
        {
          status: 'Validation technique',
          updatedBy: { nom: 'Fall', prenom: 'Moussa' },
        },
      ]
    : [
        {
          status: 'Validé',
          updatedBy: {
            prenom: 'Dr Ibrahima',
            nom: 'Sarr',
            profil: 'Pharmacien biologiste\nAncien interne des hôpitaux',
            logo: 'x',
          },
        },
      ],
})

const scenarios = {
  biochimie,
  hematologie,
  calculs,
  bacteriologie: bacterio,
  spermogramme,
  complet: () => [
    ...biochimie(),
    ...hematologie(),
    ...calculs(),
    ...bacterio(),
    ...spermogramme(),
  ],
}

// --------------------------------- Execution -------------------------------
let total = 0
let echecs = 0
for (const [nom, fabrique] of Object.entries(scenarios)) {
  for (let n = 0; n <= 40; n++) {
    seq = 0
    const options = {
      technique: n % 7 === 3,
      nom: n % 5 === 4 ? 'Ndiaye Diallo Ba Cissokho De La Fontaine' : undefined,
      prenom: n % 5 === 4 ? 'Marie-Antoinette Aïssatou' : undefined,
      prescripteur:
        n % 5 === 4
          ? 'Pr Abdoulaye Cheikh Tidiane Ndiaye, Hôpital Principal de Dakar'
          : undefined,
    }
    const invoice = dossier([...remplissage(n), ...fabrique()], options)
    const r = rendre(invoice)
    const errs = controler(r, {
      sautVoulu: nom === 'spermogramme' || nom === 'complet',
    })
    total++
    if (errs.length) {
      echecs++
      console.log(`ECHEC ${nom} (+${n}) : ${r.pages} page(s)`)
      ;[...new Set(errs)].slice(0, 8).forEach((e) => console.log('   - ' + e))
    }
    if (n === 0 || errs.length) {
      fs.writeFileSync(
        path.join(outDir, `${nom}${n ? `-plus${n}` : ''}.pdf`),
        Buffer.from(r.doc.output('arraybuffer'))
      )
    }
  }
}
console.log(
  `\n${total - echecs}/${total} rendus conformes. PDF d'exemple : ${outDir}`
)
process.exit(echecs ? 1 : 0)
