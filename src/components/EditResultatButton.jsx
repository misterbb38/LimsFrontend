import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

function EditResultatButton({ resultatId, analyseId, onResultatUpdated }) {
  const [showModal, setShowModal] = useState(false)
  const [currentView, setCurrentView] = useState('simple')
  const [tests, setTests] = useState([])
  const [machineA, setMachineA] = useState('')
  const [machineB, setMachineB] = useState('')
  const [conclusion, setConclusion] = useState('')
  const [selectedConclusion, setSelectedConclusion] = useState('')
  const [antibiogrammes, setAntibiogrammes] = useState({})

  const [formData, setFormData] = useState({
    analyseId: '',
    testId: '',
    patientId: '',
    valeur: '',
    methode: '',
    dernierResultatAnterieur: {
      valeur: '',
      date: null,
    },
    interpretation: '',
    valeurInterpretation: '',
    statutInterpretation: false,
    statutMachine: false,
    typePrelevement: '',
    qualitatif: '',
    lieuPrelevement: '',
    datePrelevement: null,
    remarque: '',
    updatedBy: '',
    observations: {
      macroscopique: [],
      microscopique: {
        leucocytes: '',
        hematies: '',
        unite: '',
        cellulesEpitheliales: '',
        elementsLevuriforme: '',
        filamentsMyceliens: '',
        trichomonasVaginalis: '',
        cristaux: '',
        parasites: '',
        cylindres: '',
        trichomonasIntestinales: '',
        oeufsDeBilharzies: '',
        clueCells: '',
        gardnerellaVaginalis: '',
        bacillesDeDoderlein: '',
        typeDeFlore: '',
        ph: '',
        rechercheDeStreptocoqueB: '',
        monocytes: '',
        polynucleairesNeutrophilesAlterees: '',
        polynucleairesNeutrophilesNonAlterees: '',
        eosinophiles: '',
        basophiles: '',
        parasitesDetails: [],
        cristauxDetails: [],
      },
      chimie: {
        proteinesTotales: '',
        proteinesArochies: '',
        glycorachie: '',
        acideUrique: '',
        LDH: '',
      },
      rechercheChlamydia: {
        naturePrelevement: '',
        rechercheAntigeneChlamydiaTrochomatis: '',
      },
      rechercheMycoplasmes: {
        naturePrelevement: '',
        rechercheUreaplasmaUrealyticum: '',
        rechercheMycoplasmaHominis: '',
      },
    },
    culture: {
      description: '',
      germeIdentifie: [],
    },

    gram: '',
    conclusion: '',

    // === AJOUTEZ ICI ===
    // exceptions: {
    //   groupeSanguin: {
    //     abo: '', // A, B, AB, O
    //     rhesus: '', // Positif ou Négatif
    //   },
    //   qbc: {
    //     positivite: '', // "Positif"/"Négatif"
    //     nombreCroix: 0, // 0 à 4
    //     densiteParasitaire: '',
    //     especes: [], // tableau pouvant contenir jusqu’à 4 espèces
    //   },
    //   hgpo: {
    //     t0: '',
    //     t60: '',
    //     t120: '',
    //   },
    //   ionogramme: {
    //     na: '',
    //     k: '',
    //     cl: '',
    //     ca: '',
    //     mg: '',
    //   },
    //   // AJOUT: structure NFS
    //   nfs: {
    //     hematiesEtConstantes: {
    //       gr: { valeur: '', unite: '10^6/uL', reference: '3.80-5.90' },
    //       hgb: { valeur: '', unite: 'g/dL', reference: '11.5-16.0' },
    //       hct: { valeur: '', unite: '%', reference: '34.0-48.0' },
    //       vgm: { valeur: '', unite: 'fL', reference: '80.0-97.0' },
    //       tcmh: { valeur: '', unite: 'pg', reference: '26.0-32.0' },
    //       ccmh: { valeur: '', unite: 'g/dL', reference: '30.0-36.0' },
    //       idr_cv: {
    //         valeur: '',
    //         unite: '%',
    //         reference: '11.0-16.0',
    //         // vous pouvez ajouter un champ 'ecartType' si besoin
    //       },
    //     },
    //     leucocytesEtFormules: {
    //       gb: {
    //         valeur: '',
    //         unite: '10^3/uL',
    //         reference: '4.00-10.00',
    //         flag: '',
    //       },
    //       neut: {
    //         valeur: '',
    //         unite: '10^3/uL',
    //         pourcentage: '',
    //         referenceValeur: '1.50-7.50',
    //         referencePourcentage: '37.0-72.0',
    //         flag: '',
    //       },
    //       lymph: {
    //         valeur: '',
    //         unite: '10^3/uL',
    //         pourcentage: '',
    //         referenceValeur: '1.50-4.00',
    //         referencePourcentage: '20.0-50.0',
    //         flag: '',
    //       },
    //       mono: {
    //         valeur: '',
    //         unite: '10^3/uL',
    //         pourcentage: '',
    //         referenceValeur: '0.10-1.00',
    //         referencePourcentage: '0.0-14.0',
    //         flag: '',
    //       },
    //       eo: {
    //         valeur: '',
    //         unite: '10^3/uL',
    //         pourcentage: '',
    //         referenceValeur: '0.01-0.50',
    //         referencePourcentage: '0.0-6.0',
    //         flag: '',
    //       },
    //       baso: {
    //         valeur: '',
    //         unite: '10^3/uL',
    //         pourcentage: '',
    //         referenceValeur: '0.00-0.10',
    //         referencePourcentage: '0.0-1.0',
    //         flag: '',
    //       },
    //       plt: { valeur: '', unite: '10^3/uL', reference: '150-450', flag: '' },

    //       // Blastes / cellules immatures
    //       proerythroblastes: {
    //         valeur: '',
    //         unite: '10^3/uL',
    //         pourcentage: '',
    //         referenceValeur: '0.00-0.01',
    //         referencePourcentage: '0-0.2',
    //         flag: '',
    //       },
    //       erythroblastes: {
    //         valeur: '',
    //         unite: '10^3/uL',
    //         pourcentage: '',
    //         referenceValeur: '0.00-0.01',
    //         referencePourcentage: '0-0.2',
    //         flag: '',
    //       },
    //       myeloblastes: {
    //         valeur: '',
    //         unite: '10^3/uL',
    //         pourcentage: '',
    //         referenceValeur: '0.00-0.01',
    //         referencePourcentage: '0-0.2',
    //         flag: '',
    //       },
    //       promyelocytes: {
    //         valeur: '',
    //         unite: '10^3/uL',
    //         pourcentage: '',
    //         referenceValeur: '0.00-0.01',
    //         referencePourcentage: '0-0.2',
    //         flag: '',
    //       },
    //       myelocytes: {
    //         valeur: '',
    //         unite: '10^3/uL',
    //         pourcentage: '',
    //         referenceValeur: '0.00-0.02',
    //         referencePourcentage: '0-0.5',
    //         flag: '',
    //       },
    //       metamyelocytes: {
    //         valeur: '',
    //         unite: '10^3/uL',
    //         pourcentage: '',
    //         referenceValeur: '0.00-0.02',
    //         referencePourcentage: '0-0.5',
    //         flag: '',
    //       },
    //       monoblastes: {
    //         valeur: '',
    //         unite: '10^3/uL',
    //         pourcentage: '',
    //         referenceValeur: '0.00-0.01',
    //         referencePourcentage: '0-0.2',
    //         flag: '',
    //       },
    //       lymphoblastes: {
    //         valeur: '',
    //         unite: '10^3/uL',
    //         pourcentage: '',
    //         referenceValeur: '0.00-0.01',
    //         referencePourcentage: '0-0.2',
    //         flag: '',
    //       },
    //     },
    //   },
    // },


    exceptions: {
  groupeSanguin: {
    abo: '',
    rhesus: '',
  },
  qbc: {
    positivite: '',
    nombreCroix: 0,
    densiteParasitaire: '',
    especes: [],
  },
  hgpo: {
    t0: '',
    t60: '',
    t120: '',
  },
  ionogramme: {
    na: '',
    k: '',
    cl: '',
    ca: '',
    mg: '',
  },
  nfs: {
    hematiesEtConstantes: {
      gr: { valeur: '', unite: '10^6/uL', reference: '3.80-5.90' },
      hgb: { valeur: '', unite: 'g/dL', reference: '11.5-16.0' },
      hct: { valeur: '', unite: '%', reference: '34.0-48.0' },
      vgm: { valeur: '', unite: 'fL', reference: '80.0-97.0' },
      tcmh: { valeur: '', unite: 'pg', reference: '26.0-32.0' },
      ccmh: { valeur: '', unite: 'g/dL', reference: '30.0-36.0' },
      idr_cv: { valeur: '', unite: '%', reference: '11.0-16.0' },
    },
    leucocytesEtFormules: {
      gb: { valeur: '', unite: '10^3/uL', reference: '4.00-10.00', flag: '' },
      neut: {
        valeur: '',
        unite: '10^3/uL',
        pourcentage: '',
        referenceValeur: '1.50-7.50',
        referencePourcentage: '37.0-72.0',
        flag: '',
      },
      lymph: {
        valeur: '',
        unite: '10^3/uL',
        pourcentage: '',
        referenceValeur: '1.50-4.00',
        referencePourcentage: '20.0-50.0',
        flag: '',
      },
      mono: {
        valeur: '',
        unite: '10^3/uL',
        pourcentage: '',
        referenceValeur: '0.10-1.00',
        referencePourcentage: '0.0-14.0',
        flag: '',
      },
      eo: {
        valeur: '',
        unite: '10^3/uL',
        pourcentage: '',
        referenceValeur: '0.01-0.50',
        referencePourcentage: '0.0-6.0',
        flag: '',
      },
      baso: {
        valeur: '',
        unite: '10^3/uL',
        pourcentage: '',
        referenceValeur: '0.00-0.10',
        referencePourcentage: '0.0-1.0',
        flag: '',
      },
      plt: { valeur: '', unite: '10^3/uL', reference: '150-450', flag: '' },
      proerythroblastes: {
        valeur: '',
        unite: '10^3/uL',
        pourcentage: '',
        referenceValeur: '0.00-0.01',
        referencePourcentage: '0-0.2',
        flag: '',
      },
      erythroblastes: {
        valeur: '',
        unite: '10^3/uL',
        pourcentage: '',
        referenceValeur: '0.00-0.01',
        referencePourcentage: '0-0.2',
        flag: '',
      },
      myeloblastes: {
        valeur: '',
        unite: '10^3/uL',
        pourcentage: '',
        referenceValeur: '0.00-0.01',
        referencePourcentage: '0-0.2',
        flag: '',
      },
      promyelocytes: {
        valeur: '',
        unite: '10^3/uL',
        pourcentage: '',
        referenceValeur: '0.00-0.01',
        referencePourcentage: '0-0.2',
        flag: '',
      },
      myelocytes: {
        valeur: '',
        unite: '10^3/uL',
        pourcentage: '',
        referenceValeur: '0.00-0.02',
        referencePourcentage: '0-0.5',
        flag: '',
      },
      metamyelocytes: {
        valeur: '',
        unite: '10^3/uL',
        pourcentage: '',
        referenceValeur: '0.00-0.02',
        referencePourcentage: '0-0.5',
        flag: '',
      },
      monoblastes: {
        valeur: '',
        unite: '10^3/uL',
        pourcentage: '',
        referenceValeur: '0.00-0.01',
        referencePourcentage: '0-0.2',
        flag: '',
      },
      lymphoblastes: {
        valeur: '',
        unite: '10^3/uL',
        pourcentage: '',
        referenceValeur: '0.00-0.01',
        referencePourcentage: '0-0.2',
        flag: '',
      },
    },
  },
  
  // === NOUVEAUX PARAMÈTRES CALCULÉS ===
  psaRapport: {
    psaLibre: { valeur: '', unite: 'ng/mL' },
    psaTotal: { valeur: '', unite: 'ng/mL' },
    rapport: { valeur: '', unite: '%' },
  },
  reticulocytes: {
    pourcentage: { valeur: '', unite: '%' },
    gbRouges: { valeur: '', unite: '/µL' },
    valeurAbsolue: { valeur: '', unite: '/µL' },
    pourcentageCalcule: { valeur: '', unite: '%' },
  },
  clairanceCreatinine: {
    age: { valeur: '', unite: 'années' },
    poids: { valeur: '', unite: 'kg' },
    sexe: '',
    creatinineMgL: { valeur: '', unite: 'mg/L' },
    clairance: { valeur: '', unite: 'mL/min' },
  },
  dfg: {
    creatinineMgL: { valeur: '', unite: 'mg/L' },
    age: { valeur: '', unite: 'années' },
    sexe: '',
    dfgValue: { valeur: '', unite: 'mL/min/1.73m²' },
  },
  saturationTransferrine: {
    ferSerique: { valeur: '', unite: 'µg/dL' },
    transferrine: { valeur: '', unite: 'g/L' },
    ctff: { valeur: '', unite: 'µmol/L' },
    coefficient: { valeur: '', unite: '%' },
  },
  compteAddis: {
    leucocytesParMinute: { valeur: '', unite: 'éléments/minute' },
    leucocytesTotaux: { valeur: '', unite: 'éléments' },
    hematiesParMinute: { valeur: '', unite: 'éléments/minute' },
    hematiesTotales: { valeur: '', unite: 'éléments' },
    dureeRecueil: { valeur: '', unite: 'minutes' },
  },
  calciumCorrige: {
    calciumMesure: { valeur: '', unite: 'mg/L' },
    albumine: { valeur: '', unite: 'g/L' },
    calciumCorrige: { valeur: '', unite: 'mmol/L' },
  },
  rapportAlbuminurie: {
    albumineUrinaire: { valeur: '', unite: 'mg/L' },
    creatinineUrinaire: { valeur: '', unite: 'g/L' },
    rapport: { valeur: '', unite: 'mg/g' },
  },
  rapportProteines: {
    proteinesUrinaires: { valeur: '', unite: 'mg/dL' },
    creatinineUrinaire: { valeur: '', unite: 'mg/dL' },
    rapport: { valeur: '', unite: 'mg/mg' },
  },
  cholesterolLdl: {
    cholesterolTotal: { valeur: '', unite: 'g/L' },
    hdl: { valeur: '', unite: 'g/L' },
    triglycerides: { valeur: '', unite: 'g/L' },
    ldl: { valeur: '', unite: 'g/L' },
  },
  lipidesTotaux: {
    cholesterolTotal: { valeur: '', unite: 'g/L' },
    triglycerides: { valeur: '', unite: 'g/L' },
    phospholipides: { valeur: '', unite: 'g/L' },
    lipidesTotaux: { valeur: '', unite: 'g/L' },
  },
  microalbuminurie24h: {
    albumineUrinaire: { valeur: '', unite: 'mg/L' },
    volumeUrinaire24h: { valeur: '', unite: 'L' },
    microalbuminurie: { valeur: '', unite: 'mg/24h' },
  },
  proteinurie24h: {
    proteinesUrinaires: { valeur: '', unite: 'mg/L' },
    volumeUrinaire24h: { valeur: '', unite: 'L' },
    proteinurie: { valeur: '', unite: 'mg/24h' },
  },
  bilirubineIndirecte: {
    bilirubineTotale: { valeur: '', unite: 'mg/L' },
    bilirubineDirecte: { valeur: '', unite: 'mg/L' },
    bilirubineIndirecte: { valeur: '', unite: 'mg/L' },
  },
},
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTestCategory, setSelectedTestCategory] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  // function getTestCategory(testName = '') {
  //   const nameLower = testName.toLowerCase()

  //   if (nameLower.includes('groupe') && nameLower.includes('sanguin')) {
  //     return 'groupeSanguin'
  //   } else if (nameLower.includes('qbc')) {
  //     return 'qbc'
  //   } else if (nameLower.includes('hgpo')) {
  //     return 'hgpo'
  //   } else if (nameLower.includes('ionogram')) {
  //     return 'ionogramme'
  //   } else if (nameLower.includes('nfs') || nameLower.includes('numeration')) {
  //     // <-- Ajout du test "NFS" (ou "Numération formule sanguine")
  //     return 'nfs'
  //   }

  //   return 'normal'
  // }

  function getTestCategory(testName = '') {
  const nameLower = testName.toLowerCase()

  if (nameLower.includes('groupe') && nameLower.includes('sanguin')) {
    return 'groupeSanguin'
  } else if (nameLower.includes('qbc')) {
    return 'qbc'
  } else if (nameLower.includes('hgpo')) {
    return 'hgpo'
  } else if (nameLower.includes('ionogram')) {
    return 'ionogramme'
  } else if (nameLower.includes('nfs') || nameLower.includes('numération')) {
    return 'nfs'
  }
  // PSA Rapport
  else if (
    (nameLower.includes('psa') &&
      (nameLower.includes('rapport') || nameLower.includes('libre'))) ||
    (nameLower.includes('rapport') &&
      nameLower.includes('psa') &&
      (nameLower.includes('total') || nameLower.includes('libre')))
  ) {
    return 'psaRapport'
  }
  // Réticulocytes
  else if (
    nameLower.includes('réticulocyte') ||
    nameLower.includes('reticulocyte') ||
    nameLower.includes('reticulocytes')
  ) {
    return 'reticulocytes'
  }
  // Clairance créatinine
  else if (
    (nameLower.includes('clairance') && nameLower.includes('créatinine')) ||
    (nameLower.includes('clairance') && nameLower.includes('creatinine')) ||
    nameLower.includes('cockcroft')
  ) {
    return 'clairanceCreatinine'
  }
  // DFG
  else if (
    nameLower.includes('dfg') ||
    nameLower.includes('filtration') ||
    nameLower.includes('ckd-epi') ||
    nameLower.includes('débit de filtration')
  ) {
    return 'dfg'
  }
  // Saturation transferrine
  else if (
    (nameLower.includes('transferrine') && nameLower.includes('saturation')) ||
    (nameLower.includes('coefficient') && nameLower.includes('transferrine')) ||
    nameLower.includes('ctff')
  ) {
    return 'saturationTransferrine'
  }
  // Compte d'Addis
  else if (
    nameLower.includes('addis') ||
    (nameLower.includes('compte') && nameLower.includes('addis')) ||
    nameLower.includes('hlm')
  ) {
    return 'compteAddis'
  }
  // Calcium corrigé
  else if (
    (nameLower.includes('calcium') && nameLower.includes('corrigé')) ||
    (nameLower.includes('calcium') && nameLower.includes('corrige'))
  ) {
    return 'calciumCorrige'
  }
  // Rapport albuminurie/créatininurie
  else if (
    (nameLower.includes('albuminurie') && nameLower.includes('créatinine')) ||
    (nameLower.includes('albuminurie') && nameLower.includes('creatinine')) ||
    (nameLower.includes('rapport') && nameLower.includes('albuminurie')) ||
    nameLower.includes('rac')
  ) {
    return 'rapportAlbuminurie'
  }
  // Rapport protéinurie/créatininurie
  else if (
    (nameLower.includes('protéinurie') && nameLower.includes('créatinine')) ||
    (nameLower.includes('proteinurie') && nameLower.includes('creatinine')) ||
    (nameLower.includes('rapport') && nameLower.includes('protéinurie')) ||
    (nameLower.includes('rapport') && nameLower.includes('proteinurie')) ||
    nameLower.includes('rpc')
  ) {
    return 'rapportProteines'
  }
  // Cholestérol LDL
  else if (
    nameLower.includes('ldl') ||
    (nameLower.includes('cholestérol') && nameLower.includes('ldl')) ||
    (nameLower.includes('cholesterol') && nameLower.includes('ldl')) ||
    nameLower.includes('friedewald')
  ) {
    return 'cholesterolLdl'
  }
  // Lipides totaux
  else if (
    nameLower.includes('lipides totaux') ||
    nameLower.includes('lipides total') ||
    (nameLower.includes('lipides') && nameLower.includes('total'))
  ) {
    return 'lipidesTotaux'
  }
  // Microalbuminurie 24h
  else if (
    (nameLower.includes('microalbuminurie') && nameLower.includes('24')) ||
    (nameLower.includes('micro') &&
      nameLower.includes('albumine') &&
      nameLower.includes('24'))
  ) {
    return 'microalbuminurie24h'
  }
  // Protéinurie 24h
  else if (
    (nameLower.includes('protéinurie') && nameLower.includes('24')) ||
    (nameLower.includes('proteinurie') && nameLower.includes('24')) ||
    (nameLower.includes('protéines') && nameLower.includes('24h')) ||
    (nameLower.includes('proteins') && nameLower.includes('24'))
  ) {
    return 'proteinurie24h'
  }
  // Bilirubine indirecte
  else if (
    (nameLower.includes('bilirubine') && nameLower.includes('indirecte')) ||
    (nameLower.includes('bilirubine') && nameLower.includes('indirect'))
  ) {
    return 'bilirubineIndirecte'
  }

  return 'normal'
}

  useEffect(() => {
    if (showModal && resultatId) {
      fetchResultatData(resultatId)
    }
  }, [showModal, resultatId])

  const fetchResultatData = async (resultatId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/resultats/${resultatId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        console.log('donnee API', data)
        console.log('Data fetched:', data.data.conclusion) // Logging

        const antibiogrammesInitial = {}
        if (data.data.culture && data.data.culture.germeIdentifie) {
          data.data.culture.germeIdentifie.forEach((germe) => {
            if (germe.antibiogramme) {
              // Check if antibiogramme is defined
              antibiogrammesInitial[germe.nom] = Object.entries(
                germe.antibiogramme
              ).map(([antibiotique, sensibilite]) => ({
                antibiotique,
                sensibilite,
              }))
            } else {
              antibiogrammesInitial[germe.nom] = []
            }
          })
        }

        // 1) Récupérer l'objet exceptions s’il existe, sinon votre structure de base
        const fetchedExceptions = data.data.exceptions || {
          groupeSanguin: { abo: '', rhesus: '' },
          qbc: {
            positivite: '',
            nombreCroix: 0,
            densiteParasitaire: '',
            especes: [],
          },
          hgpo: { t0: '', t60: '', t120: '' },
          ionogramme: { na: '', k: '', cl: '', ca: '', mg: '' },
          // AJOUT: structure NFS
          nfs: {
            hematiesEtConstantes: {
              gr: { valeur: '', unite: '10^6/uL', reference: '3.80-5.90' },
              hgb: { valeur: '', unite: 'g/dL', reference: '11.5-16.0' },
              hct: { valeur: '', unite: '%', reference: '34.0-48.0' },
              vgm: { valeur: '', unite: 'fL', reference: '80.0-97.0' },
              tcmh: { valeur: '', unite: 'pg', reference: '26.0-32.0' },
              ccmh: { valeur: '', unite: 'g/dL', reference: '30.0-36.0' },
              idr_cv: {
                valeur: '',
                unite: '%',
                reference: '11.0-16.0',
                // vous pouvez ajouter un champ 'ecartType' si besoin
              },
            },
            leucocytesEtFormules: {
              gb: {
                valeur: '',
                unite: '10^3/uL',
                reference: '4.00-10.00',
                flag: '',
              },
              neut: {
                valeur: '',
                unite: '10^3/uL',
                pourcentage: '',
                referenceValeur: '1.50-7.50',
                referencePourcentage: '37.0-72.0',
                flag: '',
              },
              lymph: {
                valeur: '',
                unite: '10^3/uL',
                pourcentage: '',
                referenceValeur: '1.50-4.00',
                referencePourcentage: '20.0-50.0',
                flag: '',
              },
              mono: {
                valeur: '',
                unite: '10^3/uL',
                pourcentage: '',
                referenceValeur: '0.10-1.00',
                referencePourcentage: '0.0-14.0',
                flag: '',
              },
              eo: {
                valeur: '',
                unite: '10^3/uL',
                pourcentage: '',
                referenceValeur: '0.01-0.50',
                referencePourcentage: '0.0-6.0',
                flag: '',
              },
              baso: {
                valeur: '',
                unite: '10^3/uL',
                pourcentage: '',
                referenceValeur: '0.00-0.10',
                referencePourcentage: '0.0-1.0',
                flag: '',
              },
              plt: {
                valeur: '',
                unite: '10^3/uL',
                reference: '150-450',
                flag: '',
              },

              // Blastes / cellules immatures
              proerythroblastes: {
                valeur: '',
                unite: '10^3/uL',
                pourcentage: '',
                referenceValeur: '0.00-0.01',
                referencePourcentage: '0-0.2',
                flag: '',
              },
              erythroblastes: {
                valeur: '',
                unite: '10^3/uL',
                pourcentage: '',
                referenceValeur: '0.00-0.01',
                referencePourcentage: '0-0.2',
                flag: '',
              },
              myeloblastes: {
                valeur: '',
                unite: '10^3/uL',
                pourcentage: '',
                referenceValeur: '0.00-0.01',
                referencePourcentage: '0-0.2',
                flag: '',
              },
              promyelocytes: {
                valeur: '',
                unite: '10^3/uL',
                pourcentage: '',
                referenceValeur: '0.00-0.01',
                referencePourcentage: '0-0.2',
                flag: '',
              },
              myelocytes: {
                valeur: '',
                unite: '10^3/uL',
                pourcentage: '',
                referenceValeur: '0.00-0.02',
                referencePourcentage: '0-0.5',
                flag: '',
              },
              metamyelocytes: {
                valeur: '',
                unite: '10^3/uL',
                pourcentage: '',
                referenceValeur: '0.00-0.02',
                referencePourcentage: '0-0.5',
                flag: '',
              },
              monoblastes: {
                valeur: '',
                unite: '10^3/uL',
                pourcentage: '',
                referenceValeur: '0.00-0.01',
                referencePourcentage: '0-0.2',
                flag: '',
              },
              lymphoblastes: {
                valeur: '',
                unite: '10^3/uL',
                pourcentage: '',
                referenceValeur: '0.00-0.01',
                referencePourcentage: '0-0.2',
                flag: '',
              },
            },
          },

        }
        // AJOUT: Récupération des nouveaux paramètres calculés
if (data.data.exceptions) {
  if (data.data.exceptions.psaRapport) {
    fetchedExceptions.psaRapport = data.data.exceptions.psaRapport
  }
  if (data.data.exceptions.reticulocytes) {
    fetchedExceptions.reticulocytes = data.data.exceptions.reticulocytes
  }
  if (data.data.exceptions.clairanceCreatinine) {
    fetchedExceptions.clairanceCreatinine = data.data.exceptions.clairanceCreatinine
  }
  if (data.data.exceptions.dfg) {
    fetchedExceptions.dfg = data.data.exceptions.dfg
  }
  if (data.data.exceptions.saturationTransferrine) {
    fetchedExceptions.saturationTransferrine = data.data.exceptions.saturationTransferrine
  }
  if (data.data.exceptions.compteAddis) {
    fetchedExceptions.compteAddis = data.data.exceptions.compteAddis
  }
  if (data.data.exceptions.calciumCorrige) {
    fetchedExceptions.calciumCorrige = data.data.exceptions.calciumCorrige
  }
  if (data.data.exceptions.rapportAlbuminurie) {
    fetchedExceptions.rapportAlbuminurie = data.data.exceptions.rapportAlbuminurie
  }
  if (data.data.exceptions.rapportProteines) {
    fetchedExceptions.rapportProteines = data.data.exceptions.rapportProteines
  }
  if (data.data.exceptions.cholesterolLdl) {
    fetchedExceptions.cholesterolLdl = data.data.exceptions.cholesterolLdl
  }
  if (data.data.exceptions.lipidesTotaux) {
    fetchedExceptions.lipidesTotaux = data.data.exceptions.lipidesTotaux
  }
  if (data.data.exceptions.microalbuminurie24h) {
    fetchedExceptions.microalbuminurie24h = data.data.exceptions.microalbuminurie24h
  }
  if (data.data.exceptions.proteinurie24h) {
    fetchedExceptions.proteinurie24h = data.data.exceptions.proteinurie24h
  }
  if (data.data.exceptions.bilirubineIndirecte) {
    fetchedExceptions.bilirubineIndirecte = data.data.exceptions.bilirubineIndirecte
  }
}
        // Ensuite, si le back renvoie nfs :
        if (data.data.exceptions && data.data.exceptions.nfs) {
          fetchedExceptions.nfs = data.data.exceptions.nfs
        }

        const datePrelevementFormatted = data.data.datePrelevement
          ? new Date(data.data.datePrelevement).toISOString().slice(0, 16) // Format the date to YYYY-MM-DDThh:mm
          : ''
        setFormData({
          testId: data.data.testId._id || '',
          valeur: data.data.valeur || '',
          statutInterpretation: data.data.statutInterpretation,
          typePrelevement: data.data.typePrelevement,
          qualitatif: data.data.qualitatif,
          lieuPrelevement: data.data.lieuPrelevement,
          datePrelevement: datePrelevementFormatted,
          remarque: data.data.remarque,
          methode: data.data.methode,
          statutMachine: data.data.statutMachine,
          observations: {
            macroscopique: data.data.observations?.macroscopique || [],
            chimie: {
              proteinesTotales:
                data.data.observations?.chimie?.proteinesTotales || '',
              proteinesArochies:
                data.data.observations?.chimie?.proteinesArochies || '',
              glycorachie: data.data.observations?.chimie?.glycorachie || '',
              acideUrique: data.data.observations?.chimie?.acideUrique || '',
              LDH: data.data.observations?.chimie?.LDH || '',
            },
            microscopique: {
              leucocytes:
                data.data.observations?.microscopique?.leucocytes || '',
              hematies: data.data.observations?.microscopique?.hematies || '',
              cellulesEpitheliales:
                data.data.observations?.microscopique?.cellulesEpitheliales ||
                '',
              elementsLevuriforme:
                data.data.observations?.microscopique?.elementsLevuriforme ||
                '',
              filamentsMyceliens:
                data.data.observations?.microscopique?.filamentsMyceliens || '',
              trichomonasVaginalis:
                data.data.observations?.microscopique?.trichomonasVaginalis ||
                '',
              cristaux: data.data.observations?.microscopique?.cristaux || '',
              cylindres: data.data.observations?.microscopique?.cylindres || '',
              parasitesDetails:
                data.data.observations?.microscopique?.parasitesDetails || [],
              cristauxDetails:
                data.data.observations?.microscopique?.cristauxDetails || [],
              trichomonasIntestinales:
                data.data.observations?.microscopique
                  ?.trichomonasIntestinales || '',
              oeufsDeBilharzies:
                data.data.observations?.microscopique?.oeufsDeBilharzies || '',
              clueCells: data.data.observations?.microscopique?.clueCells || '',
              gardnerellaVaginalis:
                data.data.observations?.microscopique?.gardnerellaVaginalis ||
                '',
              bacillesDeDoderlein:
                data.data.observations?.microscopique?.bacillesDeDoderlein ||
                '',
              typeDeFlore:
                data.data.observations?.microscopique?.typeDeFlore || '',
              ph: data.data.observations?.microscopique?.ph || '',
              rechercheDeStreptocoqueB:
                data.data.observations?.microscopique
                  ?.rechercheDeStreptocoqueB || '',
              monocytes: data.data.observations?.microscopique?.monocytes || '',
              polynucleairesNeutrophilesAlterees:
                data.data.observations?.microscopique
                  ?.polynucleairesNeutrophilesAlterees || '',
              polynucleairesNeutrophilesNonAlterees:
                data.data.observations?.microscopique
                  ?.polynucleairesNeutrophilesNonAlterees || '',
              eosinophiles:
                data.data.observations?.microscopique?.eosinophiles || '',
              basophiles:
                data.data.observations?.microscopique?.basophiles || '',
            },
            rechercheChlamydia: {
              naturePrelevement:
                data.data.observations?.rechercheChlamydia?.naturePrelevement ||
                '',
              rechercheAntigeneChlamydiaTrochomatis:
                data.data.observations?.rechercheChlamydia
                  ?.rechercheAntigeneChlamydiaTrochomatis || '',
            },
            rechercheMycoplasmes: {
              naturePrelevement:
                data.data.observations?.rechercheMycoplasmes
                  ?.naturePrelevement || '',
              rechercheUreaplasmaUrealyticum:
                data.data.observations?.rechercheMycoplasmes
                  ?.rechercheUreaplasmaUrealyticum || '',
              rechercheMycoplasmaHominis:
                data.data.observations?.rechercheMycoplasmes
                  ?.rechercheMycoplasmaHominis || '',
            },
          },
          culture: {
            description: data.data.culture.description || '',
            culture: data.data.culture.culture || '',
            germeIdentifie: data.data.culture.germeIdentifie
              ? data.data.culture.germeIdentifie.map((germe) => ({
                  nom: germe.nom,
                  antibiogramme: germe.antibiogramme
                    ? Object.entries(germe.antibiogramme).map(
                        ([antibiotique, sensibilite]) => ({
                          antibiotique,
                          sensibilite,
                        })
                      )
                    : [],
                }))
              : [],
          },

          gram: data.data?.gram || '',
          conclusion: data.data?.conclusion || '',
          // === AJOUTEZ ICI ===
          exceptions: fetchedExceptions,
        })
        setAntibiogrammes(antibiogrammesInitial)
        setSelectedConclusion(data.data.conclusion)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du résultat:', error)
    }
  }

  const handleChangeComplex = (field, subfield, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: subfield ? { ...prev[field], [subfield]: value } : value,
    }))
  }

  useEffect(() => {
    if (analyseId) {
      fetchTests(analyseId)
    }
  }, [analyseId])
  useEffect(() => {
    setFormData((prev) => ({ ...prev, conclusion: selectedConclusion }))
  }, [selectedConclusion])

  useEffect(() => {
    const selectedTest = tests.find((test) => test._id === formData.testId)
    if (selectedTest) {
      setMachineA(selectedTest.machineA || 'pas de machine A')
      setMachineB(selectedTest.machineB || 'Pas de machine B')
      setConclusion(selectedTest.conclusions)
      // setSelectedConclusion('')
    }
  }, [formData.testId, tests])

  const fetchTests = async (analyseId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/analyse/${analyseId}/tests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setTests(data.data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des tests:', error)
    }
  }

  const antibioticsList = [
    'Ampicilline',
    'Amoxicilline + Acide Clavulanique',
    'Ticarcilline',
    'Pipéracilline',
    'Pipéracilline + Tazobactam',
    'Céfalotine',
    'Céfixime',
    'Céfoxitine',
    'Ceftazidime',
    'Céfotaxime',
    'Céfuroxime axetyl',
    'Céfépime',
    'Imipénème',
    'Gentamicine',
    'Tobramycine',
    'Amikacine',
    'Acide Nalidixique',
    'Norfloxacine',
    'Ofloxacine',
    'Ciprofloxacine',
    'Lévofloxacine',
    'Fosfomycine',
    'Cotrimoxazole',
    'Nitrofurantoine',
    'Pénicilline',
    'Oxacilline',
    'Kanamycine',
    'Erythromycine',
    'Lincomycine',
    'Clindamycine',
    'Pristinamycine',
    'Quinupristine-Dalfopristine',
    'Tétracycline',
    'Minocycline',
    'Linézolide',
    'Acide Fusidique',
    'Rifampicine',
    'Vancomycine',
    'Teicoplanine',
    'Azithromycine',
    'Doxycycline',
    'Moxifloxacine',
    'Clarithromycine',
    'Metronidazole',
    'Meropenem',
    'Ertapenem',
    'Colistine',
    'Chloramphénicol',
    'Daptomycine',
    'Tigécycline',
  ]

  // Détecter si la valeur actuelle de germeIdentifie est parmi les options prédéfinies
  const predefinedGerms = [
    'Escherichia coli',
    'Klebsiella pneumoniae ssp pneumoniae I',
    'Klebsiella pneumoniae ssp pneumoniae II',
    'Streptococcus agalactiae',
    'Candida albicans',
    'Gardnerella vaginalis',
    'Candida spp',
    'Candida kefyr',
    'Mobiluncus spp',
    'Ureaplasma urealyticum',
    'Mycoplasma hominis',
    'Chlamydiae trachomatis',
    'Staphylococcus aureus',
    'Klebsiella oxytoca',
    'Citrobacter freundii',
    'Citrobacter koseri',
    'Enterobacter cloacae',
    'Proteus mirabilis',
    'Proteus vulgaris',
    'Pseudomonas aeruginosa',
    'Enterococcus faecalis',
    'Enterococcus faecium',
    'Neisseria gonorrhoeae',
    'Neisseria meningitidis',
    'Haemophilus influenzae',
    'Morganella morganii',
    'Salmonella spp',
    'Serratia marcescens',
    'Shigella spp',
    'Staphylococcus xylosus',
    'Acinetobacter baumannii',
    'Vibrio cholerae',
    'Listeria monocytogenes',
    'Bacteroides fragilis',
    'Campylobacter jejuni',
    'Clostridium difficile',
    'Helicobacter pylori',
    'Legionella pneumophila',
    'Mycobacterium tuberculosis',
    'Pseudomonas putida',
    'Streptococcus pneumoniae',
    'Streptococcus pyogenes',
    'Bordetella pertussis',
    'Brucella spp',
    'Yersinia enterocolitica',
    'Yersinia pestis',
    'Corynebacterium diphtheriae',
    'Francisella tularensis',
    'Haemophilus ducreyi',
    'Treponema pallidum',
    'Borrelia burgdorferi',
    'Leptospira interrogans',
  ]

  const handleGermeAddition = (germeName) => {
    if (
      formData.culture &&
      !formData.culture.germeIdentifie.some((g) => g.nom === germeName)
    ) {
      const newGerme = {
        nom: germeName,
        antibiogramme: {},
      }
      setFormData((prevFormData) => ({
        ...prevFormData,
        culture: {
          ...prevFormData.culture,
          germeIdentifie: [...prevFormData.culture.germeIdentifie, newGerme],
        },
      }))
    }
  }

  const handleGermeRemoval = (germe) => {
    const updatedGermeIdentifie = formData.culture.germeIdentifie.filter(
      (g) => g.nom !== germe
    )
    setFormData((prevFormData) => ({
      ...prevFormData,
      culture: {
        ...prevFormData.culture,
        germeIdentifie: updatedGermeIdentifie,
      },
    }))
  }

  const handleAddAntibiogramme = (event, germeNom) => {
    event.preventDefault()
    setAntibiogrammes((prevAntibiogrammes) => {
      const newAntibiogramme = { antibiotique: '', sensibilite: '' }
      const germes = prevAntibiogrammes[germeNom] || []
      return {
        ...prevAntibiogrammes,
        [germeNom]: [...germes, newAntibiogramme],
      }
    })
  }

  const handleUpdateAntibiogramme = (germeNom, index, field, value) => {
    setAntibiogrammes((prevAntibiogrammes) => {
      const updatedAntibiogrammes = { ...prevAntibiogrammes }
      updatedAntibiogrammes[germeNom][index][field] = value
      return updatedAntibiogrammes
    })
  }

  const handleRemoveAntibiogramme = (germeNom, index) => {
    const updatedAntibiogrammes = {
      ...antibiogrammes,
      [germeNom]: antibiogrammes[germeNom].filter((_, idx) => idx !== index),
    }
    setAntibiogrammes(updatedAntibiogrammes)
  }

  //les options des cristeaux et parasites

  const handleDetailAddition = (field, value) => {
    setFormData((prevFormData) => {
      const currentDetails =
        prevFormData.observations.microscopique[field] || []
      const updatedDetails = [...currentDetails, value] // Ajoute la nouvelle valeur

      return {
        ...prevFormData,
        observations: {
          ...prevFormData.observations,
          microscopique: {
            ...prevFormData.observations.microscopique,
            [field]: updatedDetails,
          },
        },
      }
    })
  }

  function handleNfsChange(section, cellType, subField, newValue) {
    setFormData((prev) => ({
      ...prev,
      exceptions: {
        ...prev.exceptions,
        nfs: {
          ...prev.exceptions.nfs,
          [section]: {
            ...prev.exceptions.nfs[section],
            [cellType]: {
              ...prev.exceptions.nfs[section][cellType],
              [subField]: newValue,
            },
          },
        },
      },
    }))
  }

  const handleDetailRemoval = (field, index) => {
    setFormData((prevFormData) => {
      const currentDetails =
        prevFormData.observations.microscopique[field] || []
      const updatedDetails = currentDetails.filter((_, idx) => idx !== index) // Retire l'élément à l'index spécifié

      return {
        ...prevFormData,
        observations: {
          ...prevFormData.observations,
          microscopique: {
            ...prevFormData.observations.microscopique,
            [field]: updatedDetails,
          },
        },
      }
    })
  }

  const parasitesOptions = [
    'Aucun parasite détecté',
    "Rare présence d'œufs d'Ascaris lumbricoïdes",
    "Nombreux œufs d'Ascaris lumbricoïdes observés",
    "Peu d'œufs d'Ascaris lumbricoïdes détectés",
    "Rare présence de larves d'Ankylostoma duodenale",
    "Nombreuses larves d'Ankylostoma duodenale observées",
    "Peu de larves d'Ankylostoma duodenale détectées",
    "Rare présence d'œufs d'Ankylostoma duodenale",
    "Nombreux œufs d'Ankylostoma duodenale observés",
    "Peu d'œufs d'Ankylostoma duodenale détectés",
    "Rare présence d'œufs d'Entamoeba hystolytica",
    "Nombreux œufs d'Entamoeba hystolytica observés",
    "Peu d'œufs d'Entamoeba hystolytica détectés",
    "Rare présence d'œufs d'Entamoeba coli",
    "Nombreux œufs d'Entamoeba coli observés",
    "Peu d'œufs d'Entamoeba coli détectés",
    "Rare présence de formes végétatives d'Entamoeba hystolytica",
    "Nombreuses formes végétatives d'Entamoeba hystolytica observées",
    "Peu de formes végétatives d'Entamoeba hystolytica détectées",
    'Rare présence de Trichomonas intestinalis',
    'Nombreux Trichomonas intestinalis observés',
    'Peu de Trichomonas intestinalis détectés',
    'Œufs de Strongyloides stercoralis détectés',
    'Œufs de Schistosoma mansoni observés',
    'Cystes de Giardia lamblia identifiés',
    'Œufs de Taenia spp. observés',
    'Larves de Strongyloides stercoralis présentes',
    'Œufs de Hymenolepis nana détectés',
    'Œufs de Enterobius vermicularis observés',
    "Kystes d'Acanthamoeba détectés",
  ]
  const cristauxOptions = [
    'Aucun cristal détecté',
    'Absence de cristaux',
    'Aucun signe de cristaux',
    "Rare présence d'urates",
    'Nombreux urates observés',
    "Peu d'urates détectés",
    "Rare présence de cristaux d'acide urique",
    "Nombreux cristaux d'acide urique observés",
    "Peu de cristaux d'acide urique détectés",
    "Rare présence d'oxalate de calcium",
    'Nombreux oxalates de calcium observés',
    "Peu d'oxalates de calcium détectés",
    'Rare présence de bilirubine',
    'Nombreux cristaux de bilirubine observés',
    'Peu de cristaux de bilirubine détectés',
    'Rare présence de cristaux de Charcot',
    'Nombreux cristaux de Charcot observés',
    'Peu de cristaux de Charcot détectés',
    'Cristaux de cystine détectés',
    'Rare présence de cristaux de phosphate de calcium',
    'Nombreux cristaux de phosphate de calcium observés',
    'Peu de cristaux de phosphate de calcium détectés',
    'Cristaux de cholestérol détectés',
    "Rare présence de cristaux d'ammonium biurate",
    'Cristaux de xanthine observés',
    'Cristaux de tyrosine détectés',
  ]

  const handleMacroscopiqueAddition = (value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      observations: {
        ...prevFormData.observations,
        macroscopique: [...prevFormData.observations.macroscopique, value],
      },
    }))
  }

  const handleMacroscopiqueRemoval = (index) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      observations: {
        ...prevFormData.observations,
        macroscopique: prevFormData.observations.macroscopique.filter(
          (_, idx) => idx !== index
        ),
      },
    }))
  }

  const handleMicroscopiqueChange = (field, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      observations: {
        ...prevFormData.observations,
        microscopique: {
          ...prevFormData.observations.microscopique,
          [field]: value,
        },
      },
    }))
  }

  // Pour modifier une valeur dans chimie
  const handleChimieChange = (field, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      observations: {
        ...prevFormData.observations,
        chimie: {
          ...prevFormData.observations.chimie,
          [field]: value,
        },
      },
    }))
  }

  const handleRechercheChlamydiaChange = (field, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      observations: {
        ...prevFormData.observations,
        rechercheChlamydia: {
          ...prevFormData.observations.rechercheChlamydia,
          [field]: value,
        },
      },
    }))
  }

  const handleRechercheMycoplasmesChange = (field, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      observations: {
        ...prevFormData.observations,
        rechercheMycoplasmes: {
          ...prevFormData.observations.rechercheMycoplasmes,
          [field]: value,
        },
      },
    }))
  }

  const handleCultureChange = (field, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      culture: {
        ...prevFormData.culture,
        [field]: value,
      },
    }))
  }

  useEffect(() => {
    setFormData((prev) => ({ ...prev, conclusion: selectedConclusion }))
  }, [selectedConclusion])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'statutInterpretation') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value === 'true',
      }))
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }))
    }
  }

  const transformAntibiogrammesToMap = (antibiogrammes) => {
    return Object.keys(antibiogrammes).reduce((acc, germeNom) => {
      acc[germeNom] = antibiogrammes[germeNom].reduce(
        (map, { antibiotique, sensibilite }) => {
          map[antibiotique] = sensibilite
          return map
        },
        {}
      )
      return acc
    }, {})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Transform antibiogrammes to the expected format
    const transformedAntibiogrammes = formData.culture.germeIdentifie.map(
      (germe) => ({
        ...germe,
        antibiogramme: transformAntibiogrammesToMap(antibiogrammes)[germe.nom],
      })
    )

    const dataToSend = {
      ...formData,
      culture: {
        ...formData.culture,
        germeIdentifie: transformedAntibiogrammes,
      },
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/resultats/${resultatId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })
      const data = await response.json()
      if (data.success) {
        console.log('donner envoyer', data)
        setShowModal(false)
        onResultatUpdated() // Callback to refresh result data
      } else {
        console.error('La mise à jour a échoué.')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du résultat:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Puis, dans un useEffect :
  useEffect(() => {
    const selectedTest = tests.find((test) => test._id === formData.testId)
    if (selectedTest) {
      const cat = getTestCategory(selectedTest.nom)
      setSelectedTestCategory(cat)
    } else {
      setSelectedTestCategory('')
    }
  }, [formData.testId, tests])

  return (
    <>
      <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
        <FontAwesomeIcon icon={faEdit} />
      </button>
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl">
            <h3 className="font-bold text-lg">Modifier le Résultat</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <div>
                  <label className="label">Paramettre</label>
                  <select
                    className="select select-bordered w-full max-w-xs"
                    value={formData.testId}
                    onChange={(e) =>
                      setFormData({ ...formData, testId: e.target.value })
                    }
                    required
                    disabled
                  >
                    <option value="">Sélectionner un paramettre</option>
                    {tests.map((test) => (
                      <option key={test._id} value={test._id}>
                        {test.nom}
                      </option>
                    ))}
                  </select>
                  <p>La machine A est : {machineA}</p>
                  <p>La machine B est : {machineB}</p>
                </div>

                {/* general */}
                <div className="flex flex-nowrap gap-4 items-center w-full">
                  <div>
                    <label className="label">Type de Prélèvement</label>
                    <select
                      className="select select-bordered"
                      value={formData.typePrelevement}
                      onChange={handleChange}
                      name="typePrelevement" // Ajoutez l'attribut name
                    >
                      <option value="">Sélectionner une option</option>
                      <option value="Urines">Urines</option>
                      <option value="Secretions vaginales">
                        Sécrétions vaginales
                      </option>
                      <option value="Selles">Selles</option>
                      <option value="Uretral">Urétral</option>
                      <option value="Urines">Urines</option>
                      <option value="Secretions vaginales">
                        Sécrétions vaginales
                      </option>
                      <option value="Selles">Selles</option>
                      <option value="Uretral">Urétral</option>
                      <option value="Sérum">Sérum</option>
                      <option value="Plasma">Plasma</option>
                      <option value="Sperme">Sperme</option>
                      <option value="Vulve">Vulve</option>
                      <option value="Pus">Pus</option>
                      <option value="Culot urinaire">Culot urinaire</option>
                      <option value="Soude urinaire">Sonde urinaire</option>
                      <option value="Amygdales">Amygdales</option>
                      <option value="LCR">LCR</option>
                      <option value="Ascite">Ascite</option>
                      <option value="Pleural">Pleural</option>
                      <option value="Articulaire">Articulaire</option>
                      <option value="Sang">Sang</option>
                      <option value="Seringue">Seringue</option>
                      <option value="Ballon">Ballon</option>
                      <option value="Expectorations">Expectorations</option>
                      <option value="Biopsie">Biopsie</option>
                      <option value="Lavage broncho-alvéolaire">
                        Lavage broncho-alvéolaire
                      </option>
                      <option value="Ecouvillon nasal">Écouvillon nasal</option>
                      <option value="Écouvillon pharyngé">
                        Écouvillon pharyngé
                      </option>
                      <option value="Lait maternel">Lait maternel</option>
                      <option value="Peau">Peau</option>
                      <option value="Tissu">Tissu</option>
                      <option value="Cavité buccale">Cavité buccale</option>
                      <option value="Cordon ombilical">Cordon ombilical</option>
                      <option value="Épanchement pleural">
                        Épanchement pleural
                      </option>
                      <option value="Liquide synovial">Liquide synovial</option>
                      <option value="Expectorations induites">
                        Expectorations induites
                      </option>
                      <option value="Liquide péritonéal">
                        Liquide péritonéal
                      </option>
                      <option value="Cathéter">Cathéter</option>
                      <option value="LCR">Liquide cérébrospinal (LCR)</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Lieu de Prélèvement</label>
                    <select
                      className="select select-bordered"
                      value={formData.lieuPrelevement}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionner une option</option>
                      <option value="Prélevé au laboratoire">
                        Prélevé au laboratoire
                      </option>
                      <option value="Apporté au laboratoire">
                        Apporté au laboratoire
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Date de Prélèvement</label>
                    <input
                      type="datetime-local"
                      name="datePrelevement"
                      value={formData.datePrelevement}
                      onChange={handleChange}
                      className="input input-bordered"
                    />
                  </div>
                  <div>
                    <label className="label">Résultat qualitatif</label>
                    <select
                      className="select select-bordered"
                      value={formData.qualitatif}
                      onChange={handleChange}
                      name="qualitatif" // Ajoutez l'attribut name
                    >
                      <option value="">Sélectionner une option</option>
                      <option value="Positif">Positif</option>
                      <option value="Négatif">Négatif</option>
                      <option value="Douteux">Douteux</option>
                      <option value="Positive">Positive</option>
                      <option value="Négative">Négative</option>
                      <option value="Douteuse">Douteuse</option>
                    </select>
                  </div>
                </div>

                <label className="label">Choisissez le genre de resultat</label>
                <label className="cursor-pointer label">
                  <span className="label-text mr-2">Valeur simple</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={currentView === 'complexe'}
                    onChange={() =>
                      setCurrentView(
                        currentView === 'simple' ? 'complexe' : 'simple'
                      )
                    }
                  />
                  <span className="label-text ml-2">Valeur complexe</span>
                </label>
              </div>

              {currentView === 'simple' ? (
                <>
                  {/* Ligne principale : Valeur, Interprétation, Machine, Méthode */}
                  <div className="flex flex-wrap gap-4 items-center w-full">
                    {/* Valeur simple */}
                    <div className="form-control">
                      <label className="label">Valeur</label>
                      <input
                        className="input input-bordered"
                        type="text"
                        name="valeur"
                        value={formData.valeur}
                        onChange={handleChange}
                      />
                    </div>

                    {/* Statut interprétation */}
                    <div className="form-control">
                      <label className="label">
                        Statut de l'Interprétation
                      </label>
                      <select
                        className="select select-bordered"
                        name="statutInterpretation"
                        value={formData.statutInterpretation}
                        onChange={handleChange}
                      >
                        <option value="false">Non</option>
                        <option value="true">Oui</option>
                      </select>
                    </div>

                    {/* Machine A / B */}
                    <div className="form-control">
                      <label className="label">Machine utiliser</label>
                      <select
                        className="select select-bordered"
                        name="statutMachine"
                        value={formData.statutMachine}
                        onChange={handleChange}
                      >
                        <option value="true">A</option>
                        <option value="false">B</option>
                      </select>
                    </div>

                    {/* Méthode */}
                    <div className="form-control">
                      <label className="label">Méthode</label>
                      <select
                        className="select select-bordered"
                        name="methode"
                        value={formData.methode}
                        onChange={handleChange}
                      >
                        <option value="">Sélectionner une méthode</option>
                        <option value="PCR">PCR</option>
                        <option value="Turbidimétrie">Turbidimétrie</option>
                        <option value="Colorimétrie">Colorimétrie</option>
                        <option value="Enzymatique">Enzymatique</option>
                        <option value="Turbidimétrie/colorimétrie">
                          Turbidimétrie/colorimétrie
                        </option>
                        <option value="Gazométrie">Gazométrie</option>
                        <option value="ELFA">ELFA</option>
                        <option value="CLIA">CLIA</option>
                      </select>
                    </div>
                  </div>

                  {/* BLOC QBC (si c'est QBC) */}
                  {selectedTestCategory === 'qbc' && (
                    <div className="my-2 p-2 border w-full">
                      <h4 className="font-bold mb-2">Paramètre QBC</h4>

                      <div className="flex flex-wrap gap-4 w-full">
                        {/* Positivité */}
                        <div className="flex flex-col">
                          <label className="label">Positivité</label>
                          <select
                            className="select select-bordered"
                            value={formData.exceptions.qbc.positivite}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                exceptions: {
                                  ...prev.exceptions,
                                  qbc: {
                                    ...prev.exceptions.qbc,
                                    positivite: e.target.value,
                                  },
                                },
                              }))
                            }
                          >
                            <option value="">- Choisir -</option>
                            <option value="Négatif">Négatif</option>
                            <option value="Positif">Positif</option>
                          </select>
                        </div>

                        {/* Nombre de croix */}
                        <div className="flex flex-col">
                          <label className="label">
                            Nombre de croix (0 à 4)
                          </label>
                          <input
                            type="number"
                            min={0}
                            max={4}
                            className="input input-bordered"
                            value={formData.exceptions.qbc.nombreCroix}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10)
                              setFormData((prev) => ({
                                ...prev,
                                exceptions: {
                                  ...prev.exceptions,
                                  qbc: {
                                    ...prev.exceptions.qbc,
                                    nombreCroix: val,
                                  },
                                },
                              }))
                            }}
                          />
                        </div>

                        {/* Densité parasitaire */}
                        <div className="flex flex-col">
                          <label className="label">Densité parasitaire</label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={formData.exceptions.qbc.densiteParasitaire}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                exceptions: {
                                  ...prev.exceptions,
                                  qbc: {
                                    ...prev.exceptions.qbc,
                                    densiteParasitaire: e.target.value,
                                  },
                                },
                              }))
                            }
                          />
                        </div>
                      </div>

                      {/* Espèces (checkbox) en bas */}
                      <div className="mt-4">
                        <label className="label">Espèces (max 4)</label>
                        {[
                          'Plasmodium falciparum',
                          'Plasmodium ovale',
                          'Plasmodium vivax',
                          'Plasmodium malariae',
                        ].map((sp) => (
                          <label key={sp} className="mr-4 cursor-pointer">
                            <input
                              type="checkbox"
                              className="checkbox checkbox-primary mr-1"
                              checked={formData.exceptions.qbc.especes.includes(
                                sp
                              )}
                              onChange={(e) => {
                                const isChecked = e.target.checked
                                setFormData((prev) => {
                                  let newEspeces = [
                                    ...prev.exceptions.qbc.especes,
                                  ]
                                  if (isChecked && !newEspeces.includes(sp)) {
                                    // on ajoute
                                    newEspeces.push(sp)
                                  } else if (!isChecked) {
                                    // on retire
                                    newEspeces = newEspeces.filter(
                                      (item) => item !== sp
                                    )
                                  }
                                  // limiter à 4
                                  if (newEspeces.length > 4) {
                                    newEspeces = newEspeces.slice(0, 4)
                                  }
                                  return {
                                    ...prev,
                                    exceptions: {
                                      ...prev.exceptions,
                                      qbc: {
                                        ...prev.exceptions.qbc,
                                        especes: newEspeces,
                                      },
                                    },
                                  }
                                })
                              }}
                            />
                            {sp}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BLOC GROUPE SANGUIN */}
                  {selectedTestCategory === 'groupeSanguin' && (
                    <div className="my-2 p-2 border w-full">
                      <h4 className="font-bold mb-2">Groupe Sanguin</h4>
                      {/* ABO */}
                      <div className="flex flex-wrap gap-4">
                        <div className="flex flex-col">
                          <label className="label">Groupe ABO</label>
                          <select
                            className="select select-bordered"
                            value={formData.exceptions.groupeSanguin.abo}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                exceptions: {
                                  ...prev.exceptions,
                                  groupeSanguin: {
                                    ...prev.exceptions.groupeSanguin,
                                    abo: e.target.value,
                                  },
                                },
                              }))
                            }
                          >
                            <option value="">--Choisir--</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="AB">AB</option>
                            <option value="O">O</option>
                          </select>
                        </div>

                        {/* Rhésus */}
                        <div className="flex flex-col">
                          <label className="label">Rhésus</label>
                          <select
                            className="select select-bordered"
                            value={formData.exceptions.groupeSanguin.rhesus}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                exceptions: {
                                  ...prev.exceptions,
                                  groupeSanguin: {
                                    ...prev.exceptions.groupeSanguin,
                                    rhesus: e.target.value,
                                  },
                                },
                              }))
                            }
                          >
                            <option value="">--Choisir--</option>
                            <option value="Positif">Positif (Rh+)</option>
                            <option value="Négatif">Négatif (Rh-)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BLOC HGPO */}
                  {selectedTestCategory === 'hgpo' && (
                    <div className="my-2 p-2 border w-full">
                      <h4 className="font-bold mb-2">HGPO</h4>
                      <div className="flex flex-wrap gap-4">
                        {/* T0 */}
                        <div className="flex flex-col">
                          <label className="label">Glycémie T0</label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={formData.exceptions.hgpo.t0}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                exceptions: {
                                  ...prev.exceptions,
                                  hgpo: {
                                    ...prev.exceptions.hgpo,
                                    t0: e.target.value,
                                  },
                                },
                              }))
                            }
                          />
                        </div>

                        {/* T60 */}
                        <div className="flex flex-col">
                          <label className="label">Glycémie T60</label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={formData.exceptions.hgpo.t60}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                exceptions: {
                                  ...prev.exceptions,
                                  hgpo: {
                                    ...prev.exceptions.hgpo,
                                    t60: e.target.value,
                                  },
                                },
                              }))
                            }
                          />
                        </div>

                        {/* T120 */}
                        <div className="flex flex-col">
                          <label className="label">Glycémie T120</label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={formData.exceptions.hgpo.t120}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                exceptions: {
                                  ...prev.exceptions,
                                  hgpo: {
                                    ...prev.exceptions.hgpo,
                                    t120: e.target.value,
                                  },
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BLOC IONOGRAMME */}
                  {selectedTestCategory === 'ionogramme' && (
                    <div className="my-2 p-2 border w-full">
                      <h4 className="font-bold mb-2">Ionogramme</h4>
                      <div className="flex flex-wrap gap-4">
                        {/* Na */}
                        <div className="flex flex-col">
                          <label className="label">Na+</label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={formData.exceptions.ionogramme.na}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                exceptions: {
                                  ...prev.exceptions,
                                  ionogramme: {
                                    ...prev.exceptions.ionogramme,
                                    na: e.target.value,
                                  },
                                },
                              }))
                            }
                          />
                        </div>
                        {/* K */}
                        <div className="flex flex-col">
                          <label className="label">K+</label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={formData.exceptions.ionogramme.k}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                exceptions: {
                                  ...prev.exceptions,
                                  ionogramme: {
                                    ...prev.exceptions.ionogramme,
                                    k: e.target.value,
                                  },
                                },
                              }))
                            }
                          />
                        </div>

                        {/* Cl */}
                        <div className="flex flex-col">
                          <label className="label">Cl-</label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={formData.exceptions.ionogramme.cl}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                exceptions: {
                                  ...prev.exceptions,
                                  ionogramme: {
                                    ...prev.exceptions.ionogramme,
                                    cl: e.target.value,
                                  },
                                },
                              }))
                            }
                          />
                        </div>

                        {/* Ca */}
                        <div className="flex flex-col">
                          <label className="label">Ca2+</label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={formData.exceptions.ionogramme.ca}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                exceptions: {
                                  ...prev.exceptions,
                                  ionogramme: {
                                    ...prev.exceptions.ionogramme,
                                    ca: e.target.value,
                                  },
                                },
                              }))
                            }
                          />
                        </div>

                        {/* Mg */}
                        <div className="flex flex-col">
                          <label className="label">Mg2+</label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={formData.exceptions.ionogramme.mg}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                exceptions: {
                                  ...prev.exceptions,
                                  ionogramme: {
                                    ...prev.exceptions.ionogramme,
                                    mg: e.target.value,
                                  },
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTestCategory === 'nfs' && (
                    <div className="border p-4 mt-4">
                      <h3 className="font-bold mb-2">
                        NFS – Hématies et Constantes
                      </h3>

                      {/* ------------------- Ligne 1 : GR / HGB / HCT ------------------- */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        {/* GR */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            GR (Glob. rouges)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.hematiesEtConstantes.gr
                                .valeur
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'hematiesEtConstantes',
                                'gr',
                                'valeur',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Unité :{' '}
                            {
                              formData.exceptions.nfs.hematiesEtConstantes.gr
                                .unite
                            }{' '}
                            | Réf :{' '}
                            {
                              formData.exceptions.nfs.hematiesEtConstantes.gr
                                .reference
                            }
                          </small>
                        </div>

                        {/* HGB */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            HGB (Hémoglobine)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.hematiesEtConstantes.hgb
                                .valeur
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'hematiesEtConstantes',
                                'hgb',
                                'valeur',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Unité :{' '}
                            {
                              formData.exceptions.nfs.hematiesEtConstantes.hgb
                                .unite
                            }{' '}
                            | Réf :{' '}
                            {
                              formData.exceptions.nfs.hematiesEtConstantes.hgb
                                .reference
                            }
                          </small>
                        </div>

                        {/* HCT */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            HCT (Hématocrite)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.hematiesEtConstantes.hct
                                .valeur
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'hematiesEtConstantes',
                                'hct',
                                'valeur',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Unité :{' '}
                            {
                              formData.exceptions.nfs.hematiesEtConstantes.hct
                                .unite
                            }{' '}
                            | Réf :{' '}
                            {
                              formData.exceptions.nfs.hematiesEtConstantes.hct
                                .reference
                            }
                          </small>
                        </div>
                      </div>

                      {/* ------------------- Ligne 2 : VGM / TCMH / CCMH ------------------- */}

                      {/* ------------------- Ligne 3 : IDR-CV / EcartType ------------------- */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        {/* IDR-CV (valeur) */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">IDR-CV</label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.hematiesEtConstantes
                                .idr_cv.valeur
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'hematiesEtConstantes',
                                'idr_cv',
                                'valeur',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Unité :{' '}
                            {
                              formData.exceptions.nfs.hematiesEtConstantes
                                .idr_cv.unite
                            }{' '}
                            | Réf :{' '}
                            {
                              formData.exceptions.nfs.hematiesEtConstantes
                                .idr_cv.reference
                            }
                          </small>
                        </div>

                        {/* Écart Type pour IDR-CV */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            Écart Type
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.hematiesEtConstantes
                                .idr_cv.ecartType || ''
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'hematiesEtConstantes',
                                'idr_cv',
                                'ecartType',
                                e.target.value
                              )
                            }
                          />
                          <small>Pour calculer automatiquement l'IDR-CV</small>
                        </div>
                        {/* Laisser la 3e case libre, ou ajouter un champ si besoin */}
                      </div>

                      {/* ---------------------------------------------------------------- */}
                      <h3 className="font-bold mb-2 mt-4">
                        NFS – Leucocytes et Formule
                      </h3>

                      {/* ------------------- Ligne 4 : GB / NEUT% / LYMPH% ------------------- */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        {/* GB */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            GB (Leucocytes Totaux)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.leucocytesEtFormules.gb
                                .valeur
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'leucocytesEtFormules',
                                'gb',
                                'valeur',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Unité :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules.gb
                                .unite
                            }{' '}
                            | Réf :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules.gb
                                .reference
                            }
                          </small>
                        </div>

                        {/* NEUT */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            Neutrophiles (%)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.leucocytesEtFormules.neut
                                .pourcentage
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'leucocytesEtFormules',
                                'neut',
                                'pourcentage',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Réf. % :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules.neut
                                .referencePourcentage
                            }
                          </small>
                        </div>

                        {/* LYMPH */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            Lymphocytes (%)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.leucocytesEtFormules.lymph
                                .pourcentage
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'leucocytesEtFormules',
                                'lymph',
                                'pourcentage',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Réf. % :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules.lymph
                                .referencePourcentage
                            }
                          </small>
                        </div>
                      </div>

                      {/* ------------------- Ligne 5 : MONO / EO / BASO ------------------- */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        {/* MONO */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            Monocytes (%)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.leucocytesEtFormules.mono
                                .pourcentage
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'leucocytesEtFormules',
                                'mono',
                                'pourcentage',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Réf. % :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules.mono
                                .referencePourcentage
                            }
                          </small>
                        </div>

                        {/* EO */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            Éosinophiles (%)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.leucocytesEtFormules.eo
                                .pourcentage
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'leucocytesEtFormules',
                                'eo',
                                'pourcentage',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Réf. % :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules.eo
                                .referencePourcentage
                            }
                          </small>
                        </div>

                        {/* BASO */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            Basophiles (%)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.leucocytesEtFormules.baso
                                .pourcentage
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'leucocytesEtFormules',
                                'baso',
                                'pourcentage',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Réf. % :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules.baso
                                .referencePourcentage
                            }
                          </small>
                        </div>
                      </div>

                      {/* ------------------- Ligne 6 : PLT + quelques blastes ------------------- */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        {/* PLT */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            PLT (Plaquettes)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.leucocytesEtFormules.plt
                                .valeur
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'leucocytesEtFormules',
                                'plt',
                                'valeur',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Unité :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules.plt
                                .unite
                            }{' '}
                            | Réf :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules.plt
                                .reference
                            }
                          </small>
                        </div>

                        {/* proerythroblastes */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            Proérythroblastes (%)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.leucocytesEtFormules
                                .proerythroblastes.pourcentage
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'leucocytesEtFormules',
                                'proerythroblastes',
                                'pourcentage',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Réf. % :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules
                                .proerythroblastes.referencePourcentage
                            }
                          </small>
                        </div>

                        {/* erythroblastes */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            Érythroblastes (%)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.leucocytesEtFormules
                                .erythroblastes.pourcentage
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'leucocytesEtFormules',
                                'erythroblastes',
                                'pourcentage',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Réf. % :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules
                                .erythroblastes.referencePourcentage
                            }
                          </small>
                        </div>
                      </div>

                      {/* ------------------- Ligne 7 : myeloblastes / promyelocytes / myelocytes ------------------- */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        {/* myeloblastes */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            Myéloblastes (%)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.leucocytesEtFormules
                                .myeloblastes.pourcentage
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'leucocytesEtFormules',
                                'myeloblastes',
                                'pourcentage',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Réf. % :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules
                                .myeloblastes.referencePourcentage
                            }
                          </small>
                        </div>

                        {/* promyelocytes */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            Promyélocytes (%)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.leucocytesEtFormules
                                .promyelocytes.pourcentage
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'leucocytesEtFormules',
                                'promyelocytes',
                                'pourcentage',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Réf. % :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules
                                .promyelocytes.referencePourcentage
                            }
                          </small>
                        </div>

                        {/* myelocytes */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            Myélocytes (%)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.leucocytesEtFormules
                                .myelocytes.pourcentage
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'leucocytesEtFormules',
                                'myelocytes',
                                'pourcentage',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Réf. % :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules
                                .myelocytes.referencePourcentage
                            }
                          </small>
                        </div>
                      </div>

                      {/* ------------------- Ligne 8 : metamyelocytes / monoblastes / lymphoblastes ------------------- */}
                      <div className="flex flex-wrap gap-4 mb-4">
                        {/* metamyelocytes */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            Métamyélocytes (%)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.leucocytesEtFormules
                                .metamyelocytes.pourcentage
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'leucocytesEtFormules',
                                'metamyelocytes',
                                'pourcentage',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Réf. % :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules
                                .metamyelocytes.referencePourcentage
                            }
                          </small>
                        </div>

                        {/* monoblastes */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            Monoblastes (%)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.leucocytesEtFormules
                                .monoblastes.pourcentage
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'leucocytesEtFormules',
                                'monoblastes',
                                'pourcentage',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Réf. % :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules
                                .monoblastes.referencePourcentage
                            }
                          </small>
                        </div>

                        {/* lymphoblastes */}
                        <div className="w-[30%] flex flex-col">
                          <label className="label font-semibold">
                            Lymphoblastes (%)
                          </label>
                          <input
                            type="number"
                            className="input input-bordered"
                            value={
                              formData.exceptions.nfs.leucocytesEtFormules
                                .lymphoblastes.pourcentage
                            }
                            onChange={(e) =>
                              handleNfsChange(
                                'leucocytesEtFormules',
                                'lymphoblastes',
                                'pourcentage',
                                e.target.value
                              )
                            }
                          />
                          <small>
                            Réf. % :{' '}
                            {
                              formData.exceptions.nfs.leucocytesEtFormules
                                .lymphoblastes.referencePourcentage
                            }
                          </small>
                        </div>
                      </div>

                      {/* Fin de la section NFS */}
                    </div>
                  )}

                  {/* ==================== NOUVEAUX PARAMÈTRES CALCULÉS ==================== */}

{/* 1. PSA Rapport */}
{selectedTestCategory === 'psaRapport' && (
  <div className="border p-4 mt-4">
    <h3 className="font-bold mb-2">Rapport PSA libre/PSA total</h3>
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="label">PSA libre (ng/mL)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 2.5"
          value={formData.exceptions.psaRapport?.psaLibre?.valeur || ''}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                psaRapport: {
                  ...prev.exceptions.psaRapport,
                  psaLibre: {
                    ...prev.exceptions.psaRapport.psaLibre,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : ng/mL</small>
      </div>
      <div>
        <label className="label">PSA total (ng/mL)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 10.0"
          value={formData.exceptions.psaRapport?.psaTotal?.valeur || ''}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                psaRapport: {
                  ...prev.exceptions.psaRapport,
                  psaTotal: {
                    ...prev.exceptions.psaRapport.psaTotal,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : ng/mL</small>
      </div>
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <label className="label font-semibold text-blue-700">
          Rapport calculé
        </label>
        <div className="text-lg font-bold text-blue-800">
          {formData.exceptions.psaRapport?.rapport?.valeur ||
            'Auto-calculé'}{' '}
          %
        </div>
        <small className="text-blue-600">
          Formule: (PSA libre / PSA total) × 100
        </small>
      </div>
    </div>
  </div>
)}

{/* 2. Réticulocytes */}
{selectedTestCategory === 'reticulocytes' && (
  <div className="border p-4 mt-4">
    <h3 className="font-bold mb-2">Taux de réticulocytes</h3>
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="label">Pourcentage (%)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 1.5"
          value={
            formData.exceptions.reticulocytes?.pourcentage?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                reticulocytes: {
                  ...prev.exceptions.reticulocytes,
                  pourcentage: {
                    ...prev.exceptions.reticulocytes.pourcentage,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : %</small>
      </div>
      <div>
        <label className="label">Globules rouges (/µL)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 4500000"
          value={formData.exceptions.reticulocytes?.gbRouges?.valeur || ''}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                reticulocytes: {
                  ...prev.exceptions.reticulocytes,
                  gbRouges: {
                    ...prev.exceptions.reticulocytes.gbRouges,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : /µL</small>
      </div>
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <div className="mb-2">
          <label className="label font-semibold text-blue-700">
            Valeur absolue
          </label>
          <div className="text-lg font-bold text-blue-800">
            {formData.exceptions.reticulocytes?.valeurAbsolue?.valeur ||
              'Auto-calculé'}{' '}
            /µL
          </div>
        </div>
        <div>
          <label className="label font-semibold text-blue-700">
            Pourcentage calculé
          </label>
          <div className="text-lg font-bold text-blue-800">
            {formData.exceptions.reticulocytes?.pourcentageCalcule
              ?.valeur || 'Auto-calculé'}{' '}
            %
          </div>
        </div>
        <small className="text-blue-600">
          Formule: (% × GR) / 100
        </small>
      </div>
    </div>
  </div>
)}

{/* 3. Clairance créatinine */}
{selectedTestCategory === 'clairanceCreatinine' && (
  <div className="border p-4 mt-4">
    <h3 className="font-bold mb-2">
      Clairance créatinine (Cockcroft-Gault)
    </h3>
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="label">Âge (années)</label>
        <input
          type="number"
          className="input input-bordered w-[120px]"
          placeholder="ex: 65"
          value={formData.exceptions.clairanceCreatinine?.age?.valeur || ''}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                clairanceCreatinine: {
                  ...prev.exceptions.clairanceCreatinine,
                  age: {
                    ...prev.exceptions.clairanceCreatinine.age,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : années</small>
      </div>
      <div>
        <label className="label">Poids (kg)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[120px]"
          placeholder="ex: 70"
          value={
            formData.exceptions.clairanceCreatinine?.poids?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                clairanceCreatinine: {
                  ...prev.exceptions.clairanceCreatinine,
                  poids: {
                    ...prev.exceptions.clairanceCreatinine.poids,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : kg</small>
      </div>
      <div>
        <label className="label">Sexe</label>
        <select
          className="select select-bordered w-[120px]"
          value={formData.exceptions.clairanceCreatinine?.sexe || ''}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                clairanceCreatinine: {
                  ...prev.exceptions.clairanceCreatinine,
                  sexe: e.target.value,
                },
              },
            }))
          }
        >
          <option value="">Choisir</option>
          <option value="M">Masculin</option>
          <option value="F">Féminin</option>
        </select>
        <small>K = 1.23 (M), 1.04 (F)</small>
      </div>
      <div>
        <label className="label">Créatinine (mg/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 10"
          value={
            formData.exceptions.clairanceCreatinine?.creatinineMgL
              ?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                clairanceCreatinine: {
                  ...prev.exceptions.clairanceCreatinine,
                  creatinineMgL: {
                    ...prev.exceptions.clairanceCreatinine.creatinineMgL,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : mg/L</small>
      </div>
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <label className="label font-semibold text-blue-700">
          Clairance calculée
        </label>
        <div className="text-lg font-bold text-blue-800">
          {formData.exceptions.clairanceCreatinine?.clairance?.valeur ||
            'Auto-calculé'}{' '}
          mL/min
        </div>
        <small className="text-blue-600">
          Formule: ((140-âge) × poids × K) / (créat × 8.84)
        </small>
      </div>
    </div>
  </div>
)}

{/* 4. DFG */}
{selectedTestCategory === 'dfg' && (
  <div className="border p-4 mt-4">
    <h3 className="font-bold mb-2">DFG (CKD-EPI)</h3>
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="label">Créatinine sérique (mg/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 10"
          value={formData.exceptions.dfg?.creatinineMgL?.valeur || ''}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                dfg: {
                  ...prev.exceptions.dfg,
                  creatinineMgL: {
                    ...prev.exceptions.dfg.creatinineMgL,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : mg/L</small>
      </div>
      <div>
        <label className="label">Âge (années)</label>
        <input
          type="number"
          className="input input-bordered w-[120px]"
          placeholder="ex: 65"
          value={formData.exceptions.dfg?.age?.valeur || ''}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                dfg: {
                  ...prev.exceptions.dfg,
                  age: { ...prev.exceptions.dfg.age, valeur: e.target.value },
                },
              },
            }))
          }
        />
        <small>Unité : années</small>
      </div>
      <div>
        <label className="label">Sexe</label>
        <select
          className="select select-bordered w-[120px]"
          value={formData.exceptions.dfg?.sexe || ''}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                dfg: {
                  ...prev.exceptions.dfg,
                  sexe: e.target.value,
                },
              },
            }))
          }
        >
          <option value="">Choisir</option>
          <option value="M">Masculin</option>
          <option value="F">Féminin</option>
        </select>
        <small>κ = 1.159 (M), 1.018 (F)</small>
      </div>
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <label className="label font-semibold text-blue-700">
          DFG calculé
        </label>
        <div className="text-lg font-bold text-blue-800">
          {formData.exceptions.dfg?.dfgValue?.valeur || 'Auto-calculé'}{' '}
          mL/min/1.73m²
        </div>
        <small className="text-blue-600">
          Formule CKD-EPI avec constantes corrigées
        </small>
      </div>
    </div>
  </div>
)}

{/* 5. Saturation transferrine */}
{selectedTestCategory === 'saturationTransferrine' && (
  <div className="border p-4 mt-4">
    <h3 className="font-bold mb-2">
      Coefficient de saturation de la transferrine
    </h3>
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="label">Fer sérique (µg/dL)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 100"
          value={
            formData.exceptions.saturationTransferrine?.ferSerique
              ?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                saturationTransferrine: {
                  ...prev.exceptions.saturationTransferrine,
                  ferSerique: {
                    ...prev.exceptions.saturationTransferrine.ferSerique,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : µg/dL</small>
      </div>
      <div>
        <label className="label">Transferrine (g/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 2.5"
          value={
            formData.exceptions.saturationTransferrine?.transferrine
              ?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                saturationTransferrine: {
                  ...prev.exceptions.saturationTransferrine,
                  transferrine: {
                    ...prev.exceptions.saturationTransferrine.transferrine,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : g/L</small>
      </div>
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <div className="mb-2">
          <label className="label font-semibold text-blue-700">
            CTFF calculé
          </label>
          <div className="text-lg font-bold text-blue-800">
            {formData.exceptions.saturationTransferrine?.ctff?.valeur ||
              'Auto-calculé'}{' '}
            µmol/L
          </div>
          <small className="text-blue-600">
            Transferrine × 1.395
          </small>
        </div>
        <div>
          <label className="label font-semibold text-blue-700">
            Coefficient calculé
          </label>
          <div className="text-lg font-bold text-blue-800">
            {formData.exceptions.saturationTransferrine?.coefficient
              ?.valeur || 'Auto-calculé'}{' '}
            %
          </div>
          <small className="text-blue-600">
            Formule: (Fer / CTFF) × 100
          </small>
        </div>
      </div>
    </div>
  </div>
)}

{/* 6. Compte d'Addis */}
{selectedTestCategory === 'compteAddis' && (
  <div className="border p-4 mt-4">
    <h3 className="font-bold mb-2">Compte d'Addis</h3>
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="label">Leucocytes totaux</label>
        <input
          type="number"
          className="input input-bordered w-[150px]"
          placeholder="ex: 120000"
          value={
            formData.exceptions.compteAddis?.leucocytesTotaux?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                compteAddis: {
                  ...prev.exceptions.compteAddis,
                  leucocytesTotaux: {
                    ...prev.exceptions.compteAddis.leucocytesTotaux,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Nombre total d'éléments</small>
      </div>
      <div>
        <label className="label">Hématies totales</label>
        <input
          type="number"
          className="input input-bordered w-[150px]"
          placeholder="ex: 80000"
          value={
            formData.exceptions.compteAddis?.hematiesTotales?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                compteAddis: {
                  ...prev.exceptions.compteAddis,
                  hematiesTotales: {
                    ...prev.exceptions.compteAddis.hematiesTotales,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Nombre total d'éléments</small>
      </div>
      <div>
        <label className="label">Durée recueil (minutes)</label>
        <input
          type="number"
          className="input input-bordered w-[150px]"
          placeholder="ex: 1440"
          value={
            formData.exceptions.compteAddis?.dureeRecueil?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                compteAddis: {
                  ...prev.exceptions.compteAddis,
                  dureeRecueil: {
                    ...prev.exceptions.compteAddis.dureeRecueil,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Ex: 1440 min = 24h</small>
      </div>
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <div className="mb-2">
          <label className="label font-semibold text-blue-700">
            Leucocytes/minute
          </label>
          <div className="text-lg font-bold text-blue-800">
            {formData.exceptions.compteAddis?.leucocytesParMinute?.valeur ||
              'Auto-calculé'}{' '}
            éléments/min
          </div>
        </div>
        <div>
          <label className="label font-semibold text-blue-700">
            Hématies/minute
          </label>
          <div className="text-lg font-bold text-blue-800">
            {formData.exceptions.compteAddis?.hematiesParMinute?.valeur ||
              'Auto-calculé'}{' '}
            éléments/min
          </div>
        </div>
        <small className="text-blue-600">
          Formule: Total / Durée (min)
        </small>
      </div>
    </div>
  </div>
)}

{/* 7. Calcium corrigé */}
{selectedTestCategory === 'calciumCorrige' && (
  <div className="border p-4 mt-4">
    <h3 className="font-bold mb-2">Calcium corrigé</h3>
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="label">Calcium mesuré (mg/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 95"
          value={
            formData.exceptions.calciumCorrige?.calciumMesure?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                calciumCorrige: {
                  ...prev.exceptions.calciumCorrige,
                  calciumMesure: {
                    ...prev.exceptions.calciumCorrige.calciumMesure,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : mg/L</small>
      </div>
      <div>
        <label className="label">Albumine (g/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 35"
          value={formData.exceptions.calciumCorrige?.albumine?.valeur || ''}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                calciumCorrige: {
                  ...prev.exceptions.calciumCorrige,
                  albumine: {
                    ...prev.exceptions.calciumCorrige.albumine,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : g/L</small>
      </div>
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <label className="label font-semibold text-blue-700">
          Calcium corrigé
        </label>
        <div className="text-lg font-bold text-blue-800">
          {formData.exceptions.calciumCorrige?.calciumCorrige?.valeur ||
            'Auto-calculé'}{' '}
          mmol/L
        </div>
        <small className="text-blue-600">
          Formule: (Ca × 0.025) - 0.025 × (40 - Albumine)
        </small>
      </div>
    </div>
  </div>
)}

{/* 8. Rapport albuminurie/créatininurie */}
{selectedTestCategory === 'rapportAlbuminurie' && (
  <div className="border p-4 mt-4">
    <h3 className="font-bold mb-2">
      Rapport albuminurie/créatininurie
    </h3>
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="label">Albumine urinaire (mg/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 30"
          value={
            formData.exceptions.rapportAlbuminurie?.albumineUrinaire
              ?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                rapportAlbuminurie: {
                  ...prev.exceptions.rapportAlbuminurie,
                  albumineUrinaire: {
                    ...prev.exceptions.rapportAlbuminurie.albumineUrinaire,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : mg/L</small>
      </div>
      <div>
        <label className="label">Créatinine urinaire (g/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 1.0"
          value={
            formData.exceptions.rapportAlbuminurie?.creatinineUrinaire
              ?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                rapportAlbuminurie: {
                  ...prev.exceptions.rapportAlbuminurie,
                  creatinineUrinaire: {
                    ...prev.exceptions.rapportAlbuminurie.creatinineUrinaire,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : g/L</small>
      </div>
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <label className="label font-semibold text-blue-700">
          Rapport calculé
        </label>
        <div className="text-lg font-bold text-blue-800">
          {formData.exceptions.rapportAlbuminurie?.rapport?.valeur ||
            'Auto-calculé'}{' '}
          mg/g
        </div>
        <small className="text-blue-600">
          Formule: Albumine (mg/L) / Créatinine (g/L)
        </small>
      </div>
    </div>
  </div>
)}

{/* 9. Rapport protéinurie/créatininurie */}
{selectedTestCategory === 'rapportProteines' && (
  <div className="border p-4 mt-4">
    <h3 className="font-bold mb-2">
      Rapport protéinurie/créatininurie
    </h3>
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="label">Protéines urinaires (mg/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 15"
          value={
            formData.exceptions.rapportProteines?.proteinesUrinaires
              ?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                rapportProteines: {
                  ...prev.exceptions.rapportProteines,
                  proteinesUrinaires: {
                    ...prev.exceptions.rapportProteines.proteinesUrinaires,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : mg/L</small>
      </div>
      <div>
        <label className="label">Créatinine urinaire (g/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 100"
          value={
            formData.exceptions.rapportProteines?.creatinineUrinaire
              ?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                rapportProteines: {
                  ...prev.exceptions.rapportProteines,
                  creatinineUrinaire: {
                    ...prev.exceptions.rapportProteines.creatinineUrinaire,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : g/L</small>
      </div>
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <label className="label font-semibold text-blue-700">
          Rapport calculé
        </label>
        <div className="text-lg font-bold text-blue-800">
          {formData.exceptions.rapportProteines?.rapport?.valeur ||
            'Auto-calculé'}{' '}
          mg/mg
        </div>
        <small className="text-blue-600">
          Formule: Protéines / Créatinine
        </small>
      </div>
    </div>
  </div>
)}

{/* 10. Cholestérol LDL */}
{selectedTestCategory === 'cholesterolLdl' && (
  <div className="border p-4 mt-4">
    <h3 className="font-bold mb-2">Cholestérol LDL (Friedewald)</h3>
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="label">Cholestérol total (g/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 2.0"
          value={
            formData.exceptions.cholesterolLdl?.cholesterolTotal?.valeur ||
            ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                cholesterolLdl: {
                  ...prev.exceptions.cholesterolLdl,
                  cholesterolTotal: {
                    ...prev.exceptions.cholesterolLdl.cholesterolTotal,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : g/L</small>
      </div>
      <div>
        <label className="label">HDL (g/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 0.6"
          value={formData.exceptions.cholesterolLdl?.hdl?.valeur || ''}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                cholesterolLdl: {
                  ...prev.exceptions.cholesterolLdl,
                  hdl: {
                    ...prev.exceptions.cholesterolLdl.hdl,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : g/L</small>
      </div>
      <div>
        <label className="label">Triglycérides (g/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 1.5"
          value={
            formData.exceptions.cholesterolLdl?.triglycerides?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                cholesterolLdl: {
                  ...prev.exceptions.cholesterolLdl,
                  triglycerides: {
                    ...prev.exceptions.cholesterolLdl.triglycerides,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : g/L</small>
      </div>
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <label className="label font-semibold text-blue-700">
          LDL calculé
        </label>
        <div className="text-lg font-bold text-blue-800">
          {formData.exceptions.cholesterolLdl?.ldl?.valeur ||
            'Auto-calculé'}{' '}
          g/L
        </div>
        <small className="text-blue-600">
          Formule: CT - HDL - (TG/5)
        </small>
        <div className="text-xs text-red-600 mt-1">
          ⚠️ Valable si TG &lt; 3.5 g/L
        </div>
      </div>
    </div>
  </div>
)}

{/* 11. Lipides totaux */}
{selectedTestCategory === 'lipidesTotaux' && (
  <div className="border p-4 mt-4">
    <h3 className="font-bold mb-2">Lipides totaux</h3>
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="label">Cholestérol total (g/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 2.0"
          value={
            formData.exceptions.lipidesTotaux?.cholesterolTotal?.valeur ||
            ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                lipidesTotaux: {
                  ...prev.exceptions.lipidesTotaux,
                  cholesterolTotal: {
                    ...prev.exceptions.lipidesTotaux.cholesterolTotal,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : g/L</small>
      </div>
      <div>
        <label className="label">Triglycérides (g/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 1.5"
          value={
            formData.exceptions.lipidesTotaux?.triglycerides?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                lipidesTotaux: {
                  ...prev.exceptions.lipidesTotaux,
                  triglycerides: {
                    ...prev.exceptions.lipidesTotaux.triglycerides,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : g/L</small>
      </div>
      <div>
        <label className="label">
          Phospholipides (g/L) - Optionnel
        </label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 1.8"
          value={
            formData.exceptions.lipidesTotaux?.phospholipides?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                lipidesTotaux: {
                  ...prev.exceptions.lipidesTotaux,
                  phospholipides: {
                    ...prev.exceptions.lipidesTotaux.phospholipides,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : g/L</small>
      </div>
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <label className="label font-semibold text-blue-700">
          Lipides totaux calculés
        </label>
        <div className="text-lg font-bold text-blue-800">
          {formData.exceptions.lipidesTotaux?.lipidesTotaux?.valeur ||
            'Auto-calculé'}{' '}
          g/L
        </div>
        <small className="text-blue-600">
          Formule: (Cholestérol × 2.5) + Triglycérides [+
          Phospholipides]
        </small>
      </div>
    </div>
  </div>
)}

{/* 12. Microalbuminurie 24h */}
{selectedTestCategory === 'microalbuminurie24h' && (
  <div className="border p-4 mt-4">
    <h3 className="font-bold mb-2">Microalbuminurie 24h</h3>
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="label">Albumine urinaire (mg/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 30"
          value={
            formData.exceptions.microalbuminurie24h?.albumineUrinaire
              ?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                microalbuminurie24h: {
                  ...prev.exceptions.microalbuminurie24h,
                  albumineUrinaire: {
                    ...prev.exceptions.microalbuminurie24h.albumineUrinaire,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : mg/L</small>
      </div>
      <div>
        <label className="label">Volume urinaire 24h (L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 1.5"
          min="0"
          max="10"
          value={
            formData.exceptions.microalbuminurie24h?.volumeUrinaire24h
              ?.valeur || ''
          }
          onChange={(e) => {
            const value = parseFloat(e.target.value)
            if (value >= 0 && value <= 10) {
              setFormData((prev) => ({
                ...prev,
                exceptions: {
                  ...prev.exceptions,
                  microalbuminurie24h: {
                    ...prev.exceptions.microalbuminurie24h,
                    volumeUrinaire24h: {
                      ...prev.exceptions.microalbuminurie24h.volumeUrinaire24h,
                      valeur: e.target.value,
                    },
                  },
                },
              }))
            }
          }}
        />
        <small>Unité : L</small>
      </div>
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <label className="label font-semibold text-blue-700">
          Microalbuminurie calculée
        </label>
        <div className="text-lg font-bold text-blue-800">
          {formData.exceptions.microalbuminurie24h?.microalbuminurie
            ?.valeur || 'Auto-calculé'}{' '}
          mg/24h
        </div>
        <small className="text-blue-600">
          Formule: Albumine × Volume urinaire
        </small>
      </div>
    </div>
  </div>
)}

{/* 13. Protéinurie 24h */}
{selectedTestCategory === 'proteinurie24h' && (
  <div className="border p-4 mt-4">
    <h3 className="font-bold mb-2">Protéinurie 24h</h3>
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="label">Protéines urinaires (mg/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 150"
          value={
            formData.exceptions.proteinurie24h?.proteinesUrinaires
              ?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                proteinurie24h: {
                  ...prev.exceptions.proteinurie24h,
                  proteinesUrinaires: {
                    ...prev.exceptions.proteinurie24h.proteinesUrinaires,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : mg/L</small>
      </div>
      <div>
        <label className="label">Volume urinaire 24h (L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 1.5"
          min="0"
          max="10"
          value={
            formData.exceptions.proteinurie24h?.volumeUrinaire24h?.valeur ||
            ''
          }
          onChange={(e) => {
            const value = parseFloat(e.target.value)
            if (value >= 0 && value <= 10) {
              setFormData((prev) => ({
                ...prev,
                exceptions: {
                  ...prev.exceptions,
                  proteinurie24h: {
                    ...prev.exceptions.proteinurie24h,
                    volumeUrinaire24h: {
                      ...prev.exceptions.proteinurie24h.volumeUrinaire24h,
                      valeur: e.target.value,
                    },
                  },
                },
              }))
            }
          }}
        />
        <small>Unité : L</small>
      </div>
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <label className="label font-semibold text-blue-700">
          Protéinurie calculée
        </label>
        <div className="text-lg font-bold text-blue-800">
          {formData.exceptions.proteinurie24h?.proteinurie?.valeur ||
            'Auto-calculé'}{' '}
          mg/24h
        </div>
        <small className="text-blue-600">
          Formule: Protéines × Volume urinaire
        </small>
      </div>
    </div>
  </div>
)}

{/* 14. Bilirubine indirecte */}
{selectedTestCategory === 'bilirubineIndirecte' && (
  <div className="border p-4 mt-4">
    <h3 className="font-bold mb-2">Bilirubine indirecte</h3>
    <div className="flex flex-wrap gap-4 items-center">
      <div>
        <label className="label">Bilirubine totale (mg/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 15"
          value={
            formData.exceptions.bilirubineIndirecte?.bilirubineTotale
              ?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                bilirubineIndirecte: {
                  ...prev.exceptions.bilirubineIndirecte,
                  bilirubineTotale: {
                    ...prev.exceptions.bilirubineIndirecte.bilirubineTotale,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : mg/L</small>
      </div>
      <div>
        <label className="label">Bilirubine directe (mg/L)</label>
        <input
          type="number"
          step="any"
          className="input input-bordered w-[150px]"
          placeholder="ex: 5"
          value={
            formData.exceptions.bilirubineIndirecte?.bilirubineDirecte
              ?.valeur || ''
          }
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              exceptions: {
                ...prev.exceptions,
                bilirubineIndirecte: {
                  ...prev.exceptions.bilirubineIndirecte,
                  bilirubineDirecte: {
                    ...prev.exceptions.bilirubineIndirecte.bilirubineDirecte,
                    valeur: e.target.value,
                  },
                },
              },
            }))
          }
        />
        <small>Unité : mg/L</small>
      </div>
      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
        <label className="label font-semibold text-blue-700">
          Bilirubine indirecte calculée
        </label>
        <div className="text-lg font-bold text-blue-800">
          {formData.exceptions.bilirubineIndirecte?.bilirubineIndirecte
            ?.valeur || 'Auto-calculé'}{' '}
          mg/L
        </div>
        <small className="text-blue-600">
          Formule: Totale - Directe
        </small>
      </div>
    </div>
  </div>
)}
                </>
              ) : (
                <>
                  {/* Ajouter ici les champs de formulaire pour la vue complexe */}
                  <div id="complexe">
                    {/* macroscopie */}
                    <div>
                      <label className="label">
                        Observations Macroscopiques:
                      </label>
                      <select
                        className="select select-bordered w-full max-w-xs"
                        onChange={(e) =>
                          handleMacroscopiqueAddition(e.target.value)
                        }
                      >
                        <option disabled value="">
                          Sélectionner une observation
                        </option>
                        <option value="Claires">Claires</option>
                        <option value="Légèrement troubles">
                          Légèrement troubles
                        </option>
                        <option value="Troubles">Troubles</option>
                        <option value="Abondantes">Abondantes</option>
                        <option value="Peu abondantes">Peu abondantes</option>
                        <option value="Fétides">Fétides</option>
                        <option value="Laiteuses">Laiteuses</option>
                        <option value="Épaisses">Épaisses</option>
                        <option value="Odorantes">Odorantes</option>
                        <option value="Verdâtres">Verdâtres</option>
                        <option value="Brunâtres">Brunâtres</option>
                        <option value="Molles">Molles</option>
                        {/* // Ajoutez d'autres options selon besoin */}
                      </select>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Array.isArray(formData.observations.macroscopique) &&
                          formData.observations.macroscopique.map(
                            (item, index) => (
                              <div
                                key={index}
                                className="badge badge-primary badge-outline"
                              >
                                {item}
                                <FontAwesomeIcon
                                  icon={faTimes}
                                  className="ml-2 cursor-pointer"
                                  onClick={() =>
                                    handleMacroscopiqueRemoval(index)
                                  }
                                />
                              </div>
                            )
                          )}
                      </div>
                    </div>

                    <div className="divider"></div>
                    <h2 className="bold">Microscopie</h2>
                    {/* microscopie */}
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex flex-nowrap gap-4 items-center w-full">
                        <div>
                          <label className="label">Leucocytes</label>
                          <input
                            type="text"
                            value={
                              formData.observations.microscopique.leucocytes
                            }
                            onChange={(e) =>
                              handleMicroscopiqueChange(
                                'leucocytes',
                                e.target.value
                              )
                            }
                            className="input input-bordered"
                          />
                        </div>

                        <div>
                          <label className="label">Hématies</label>
                          <input
                            type="text"
                            value={formData.observations.microscopique.hematies}
                            onChange={(e) =>
                              handleMicroscopiqueChange(
                                'hematies',
                                e.target.value
                              )
                            }
                            className="input input-bordered"
                          />
                        </div>
                        <div>
                          <label className="label">Unité de mesure</label>
                          <select
                            className="select select-bordered"
                            value={formData.observations.microscopique.unite}
                            onChange={(e) =>
                              handleMicroscopiqueChange('unite', e.target.value)
                            }
                          >
                            <option value="">Sélectionnez une unité</option>
                            <option value="champ">champ</option>
                            <option value="mm3">mm3</option>
                          </select>
                        </div>

                        <div>
                          {/* Autres champs déjà définis dans votre formulaire */}

                          <label className="label">pH</label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={formData.observations.microscopique.ph}
                            onChange={(e) =>
                              handleMicroscopiqueChange('ph', e.target.value)
                            }
                            placeholder=""
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 items-center">
                        <div>
                          <label className="label">Cristaux</label>
                          <select
                            className="select select-bordered"
                            value={formData.observations.microscopique.cristaux}
                            onChange={(e) => {
                              handleMicroscopiqueChange(
                                'cristaux',
                                e.target.value
                              )
                              if (e.target.value === 'Non concerner') {
                                // Assurez-vous de nettoyer les détails des cristaux si 'Non concerner' est sélectionné
                                handleDetailRemovalAll('cristauxDetails')
                              }
                            }}
                          >
                            <option value="">Non concerner</option>
                            <option value="Absence">Absence</option>
                            <option value="Présence">Présence</option>
                          </select>
                        </div>

                        <div>
                          <label className="label">Liste des cristaux:</label>
                          <select
                            className="select select-bordered w-[150px]"
                            onChange={(e) =>
                              handleDetailAddition(
                                'cristauxDetails',
                                e.target.value
                              )
                            }
                            defaultValue=""
                            disabled={
                              formData.observations.microscopique.cristaux ===
                                '' ||
                              formData.observations.microscopique.cristaux ===
                                'Non concerner'
                            }
                          >
                            <option disabled value="">
                              Choisir des cristaux
                            </option>
                            {cristauxOptions.map((option, index) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.observations.microscopique
                              .cristauxDetails &&
                              formData.observations.microscopique.cristauxDetails.map(
                                (detail, index) => (
                                  <div
                                    key={index}
                                    className="badge badge-primary badge-outline w-full"
                                  >
                                    {detail}
                                    <FontAwesomeIcon
                                      icon={faTimes}
                                      className="ml-2 cursor-pointer"
                                      onClick={() =>
                                        handleDetailRemoval(
                                          'cristauxDetails',
                                          index
                                        )
                                      }
                                    />
                                  </div>
                                )
                              )}
                          </div>
                        </div>

                        <div>
                          <label className="label">Parasites</label>
                          <select
                            className="select select-bordered"
                            value={
                              formData.observations.microscopique.parasites
                            }
                            onChange={(e) => {
                              handleMicroscopiqueChange(
                                'parasites',
                                e.target.value
                              )
                              if (e.target.value === 'Non concerner') {
                                // Nettoyer les détails des parasites si 'Non concerner' est sélectionné
                                handleDetailRemovalAll('parasitesDetails')
                              }
                            }}
                          >
                            <option value="">Non concerner</option>
                            <option value="Absence">Absence</option>
                            <option value="Présence">Présence</option>
                          </select>
                        </div>

                        <div>
                          <label className="label">Liste des parasites:</label>
                          <select
                            className="select select-bordered w-[150px]"
                            onChange={(e) =>
                              handleDetailAddition(
                                'parasitesDetails',
                                e.target.value
                              )
                            }
                            defaultValue=""
                            disabled={
                              formData.observations.microscopique.parasites ===
                                '' ||
                              formData.observations.microscopique.parasites ===
                                'Non concerner'
                            }
                          >
                            <option disabled value="">
                              Choisir des parasites
                            </option>
                            {parasitesOptions.map((option, index) => (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {formData.observations.microscopique
                              .parasitesDetails &&
                              formData.observations.microscopique.parasitesDetails.map(
                                (detail, index) => (
                                  <div
                                    key={index}
                                    className="badge badge-primary badge-outline w-full"
                                  >
                                    {detail}
                                    <FontAwesomeIcon
                                      icon={faTimes}
                                      className="ml-2 cursor-pointer"
                                      onClick={() =>
                                        handleDetailRemoval(
                                          'parasitesDetails',
                                          index
                                        )
                                      }
                                    />
                                  </div>
                                )
                              )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="label">Cellules épithéliales</label>
                        <select
                          className="select select-bordered"
                          value={
                            formData.observations.microscopique
                              .cellulesEpitheliales
                          }
                          onChange={(e) =>
                            handleMicroscopiqueChange(
                              'cellulesEpitheliales',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Non concerner</option>
                          <option value="Absence">Absence</option>
                          <option value="Présence">Présence</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Eléments levuriformes</label>
                        <select
                          className="select select-bordered"
                          value={
                            formData.observations.microscopique
                              .elementsLevuriforme
                          }
                          onChange={(e) =>
                            handleMicroscopiqueChange(
                              'elementsLevuriforme',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Non concerner</option>
                          <option value="Absence">Absence</option>
                          <option value="Présence">Présence</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">filaments mycéliens</label>
                        <select
                          className="select select-bordered"
                          value={
                            formData.observations.microscopique
                              .filamentsMyceliens
                          }
                          onChange={(e) =>
                            handleMicroscopiqueChange(
                              'filamentsMyceliens',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Non concerner</option>
                          <option value="Absence">Absence</option>
                          <option value="Présence">Présence</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Trichomonas vaginalis</label>
                        <select
                          className="select select-bordered"
                          value={
                            formData.observations.microscopique
                              .trichomonasVaginalis
                          }
                          onChange={(e) =>
                            handleMicroscopiqueChange(
                              'trichomonasVaginalis',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Non concerner</option>
                          <option value="Absence">Absence</option>
                          <option value="Présence">Présence</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">cylindres</label>
                        <select
                          className="select select-bordered"
                          value={formData.observations.microscopique.cylindres}
                          onChange={(e) =>
                            handleMicroscopiqueChange(
                              'cylindres',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Non concerner</option>
                          <option value="Absence">Absence</option>
                          <option value="Présence">Présence</option>
                        </select>
                      </div>

                      <div>
                        <label className="label">Oeufs de Bilharzies</label>
                        <select
                          className="select select-bordered"
                          value={
                            formData.observations.microscopique
                              .oeufsDeBilharzies
                          }
                          onChange={(e) =>
                            handleMicroscopiqueChange(
                              'oeufsDeBilharzies',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Non concerner</option>
                          <option value="Absence">Absence</option>
                          <option value="Présence">Présence</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Clue Cells</label>
                        <select
                          className="select select-bordered"
                          value={formData.observations.microscopique.clueCells}
                          onChange={(e) =>
                            handleMicroscopiqueChange(
                              'clueCells',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Non concerner</option>
                          <option value="Absence">Absence</option>
                          <option value="Présence">Présence</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Gardnerella Vaginalis</label>
                        <select
                          className="select select-bordered"
                          value={
                            formData.observations.microscopique
                              .gardnerellaVaginalis
                          }
                          onChange={(e) =>
                            handleMicroscopiqueChange(
                              'gardnerellaVaginalis',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Non concerner</option>
                          <option value="Absence">Absence</option>
                          <option value="Présence">Présence</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Bacilles de Doderlein</label>
                        <select
                          className="select select-bordered"
                          value={
                            formData.observations.microscopique
                              .bacillesDeDoderlein
                          }
                          onChange={(e) =>
                            handleMicroscopiqueChange(
                              'bacillesDeDoderlein',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Non concerner</option>
                          <option value="Absence">Absence</option>
                          <option value="Présence">Présence</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">Type de Flore</label>
                        <select
                          className="select select-bordered"
                          value={
                            formData.observations.microscopique.typeDeFlore
                          }
                          onChange={(e) =>
                            handleMicroscopiqueChange(
                              'typeDeFlore',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Non concerner</option>
                          <option value="I">I</option>
                          <option value="II">II</option>
                          <option value="III">III</option>
                          <option value="IV">IV</option>
                          <option value="équilibrée">équilibrée</option>
                          <option value="déséquilibrée">déséquilibrée</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">
                          Recherche de Streptocoque B
                        </label>
                        <select
                          className="select select-bordered"
                          value={
                            formData.observations.microscopique
                              .rechercheDeStreptocoqueB
                          }
                          onChange={(e) =>
                            handleMicroscopiqueChange(
                              'rechercheDeStreptocoqueB',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Non concerner</option>
                          <option value="Négatif">Négatif</option>
                          <option value="Positif">Positif</option>
                        </select>
                      </div>

                      <div>
                        <label className="label">Monocytes</label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={formData.observations.microscopique.monocytes}
                          onChange={(e) =>
                            handleMicroscopiqueChange(
                              'monocytes',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="label">
                          Polynucléaires neutrophiles altérées
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={
                            formData.observations.microscopique
                              .polynucleairesNeutrophilesAlterees
                          }
                          onChange={(e) =>
                            handleMicroscopiqueChange(
                              'polynucleairesNeutrophilesAlterees',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="label">
                          Polynucléaires neutrophiles non altérées
                        </label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={
                            formData.observations.microscopique
                              .polynucleairesNeutrophilesNonAlterees
                          }
                          onChange={(e) =>
                            handleMicroscopiqueChange(
                              'polynucleairesNeutrophilesNonAlterees',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="label">Éosinophiles</label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={
                            formData.observations.microscopique.eosinophiles
                          }
                          onChange={(e) =>
                            handleMicroscopiqueChange(
                              'eosinophiles',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      <div>
                        <label className="label">Basophiles</label>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={formData.observations.microscopique.basophiles}
                          onChange={(e) =>
                            handleMicroscopiqueChange(
                              'basophiles',
                              e.target.value
                            )
                          }
                        />
                      </div>

                      {/* Continuez pour les autres champs microscopiques */}
                    </div>
                    <div className="divider"></div>
                    <h2 className="bold">Chimie</h2>
                    {/* Chimie */}
                    <div className="">
                      <div className="flex flex-wrap gap-2 items-center">
                        <div>
                          <label className="label">proteinesTotales</label>
                          <input
                            type="text"
                            value={
                              formData.observations.chimie.proteinesTotales
                            }
                            onChange={(e) =>
                              handleChimieChange(
                                'proteinesTotales',
                                e.target.value
                              )
                            }
                            className="input input-bordered"
                          />
                        </div>

                        <div>
                          <label className="label">Protéinorachie</label>
                          <input
                            type="text"
                            value={
                              formData.observations.chimie.proteinesArochies
                            }
                            onChange={(e) =>
                              handleChimieChange(
                                'proteinesArochies',
                                e.target.value
                              )
                            }
                            className="input input-bordered"
                          />
                        </div>

                        <div>
                          <label className="label">glycorachie</label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={formData.observations.chimie.glycorachie}
                            onChange={(e) =>
                              handleChimieChange('glycorachie', e.target.value)
                            }
                            placeholder=""
                          />
                        </div>

                        <div>
                          <label className="label">acideUrique</label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={formData.observations.chimie.acideUrique}
                            onChange={(e) =>
                              handleChimieChange('acideUrique', e.target.value)
                            }
                            placeholder=""
                          />
                        </div>

                        <div>
                          <label className="label">LDH</label>
                          <input
                            type="text"
                            className="input input-bordered"
                            value={formData.observations.chimie.LDH}
                            onChange={(e) =>
                              handleChimieChange('LDH', e.target.value)
                            }
                            placeholder=""
                          />
                        </div>
                      </div>
                    </div>
                    <div className="divider"></div>
                    <h2 className="bold">culture</h2>
                    {/* culture */}
                    <div className="mt-2 mb-2">
                      <div>
                        <label className="label">Culture: concentration</label>
                        <select
                          value={formData.culture.description}
                          onChange={(e) =>
                            handleCultureChange('description', e.target.value)
                          }
                          className="select select-bordered"
                        >
                          <option value="">
                            Sélectionner une concentration
                          </option>
                          <option value="DGU < 1000/ml">
                            DGU &lt; 1000/ml
                          </option>
                          <option value="DGU > 1000/ml">
                            DGU &gt; 1000/ml
                          </option>
                          <option value="DGU > 10.000/ml">
                            DGU &gt; 10.000/ml
                          </option>
                          <option value="DGU > 100.000/ml">
                            DGU &gt; 100.000/ml
                          </option>
                          <option value="DGU > 1.000.000/ml">
                            DGU &gt; 1.000.000/ml
                          </option>
                          <option value="DGU > 100.000.000/ml">
                            DGU &gt; 100.000.000/ml
                          </option>
                          <option value="DGU > 1000.000.000/ml">
                            DGU &gt; 1000.000.000/ml
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="label">Culture</label>
                        <select
                          value={formData.culture.culture} // Assurez-vous que l'état culture contient un champ culture initialisé correctement
                          onChange={(e) =>
                            handleCultureChange('culture', e.target.value)
                          }
                          className="select select-bordered"
                        >
                          <option value="">Sélectionner un état</option>
                          <option value="Negatives">Négatives</option>
                          <option value="Positives">Positives</option>
                          <option value="Non contributives">
                            Non contributives
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="label">
                          Culture: Germe Identifié - Sélection
                        </label>
                        <select
                          className="select select-bordered"
                          onChange={(e) => handleGermeAddition(e.target.value)}
                          defaultValue=""
                        >
                          <option value="">Sélectionner un germe</option>
                          {predefinedGerms.map((germe) => (
                            <option key={germe} value={germe}>
                              {germe}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {Array.isArray(formData.culture.germeIdentifie) &&
                          formData.culture.germeIdentifie.map((germe) => (
                            <div
                              key={germe.nom}
                              className="badge badge-primary badge-outline"
                            >
                              {germe.nom} {/* Affiche le nom du germe */}
                              <FontAwesomeIcon
                                icon={faTimes}
                                className="ml-2 cursor-pointer"
                                onClick={() => handleGermeRemoval(germe.nom)}
                              />
                              <button
                                type="button"
                                className="ml-2 btn btn-xs btn-success"
                                onClick={(e) =>
                                  handleAddAntibiogramme(e, germe.nom)
                                }
                              >
                                Ajouter Antibio
                              </button>
                            </div>
                          ))}
                      </div>

                      {Array.isArray(formData.culture.germeIdentifie) &&
                        formData.culture.germeIdentifie.map((germe) => (
                          <div key={germe.nom}>
                            <h4>{germe.nom} - Antibio</h4>
                            {antibiogrammes[germe.nom] && // Assurez-vous que antibiogrammes utilise la clé `nom` du germe
                              antibiogrammes[germe.nom].map(
                                (antibio, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-2 mb-2"
                                  >
                                    <select
                                      className="select select-bordered"
                                      value={antibio.antibiotique}
                                      onChange={(e) =>
                                        handleUpdateAntibiogramme(
                                          germe.nom,
                                          index,
                                          'antibiotique',
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="">
                                        Sélectionner un antibiotique
                                      </option>
                                      {antibioticsList.map((antibiotic) => (
                                        <option
                                          key={antibiotic}
                                          value={antibiotic}
                                        >
                                          {antibiotic}
                                        </option>
                                      ))}
                                    </select>
                                    <select
                                      className="select select-bordered"
                                      value={antibio.sensibilite}
                                      onChange={(e) =>
                                        handleUpdateAntibiogramme(
                                          germe.nom,
                                          index,
                                          'sensibilite',
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="">
                                        Sélectionner la sensibilité
                                      </option>
                                      <option value="S">Sensible</option>
                                      <option value="I">Intermédiaire</option>
                                      <option value="R">Résistant</option>
                                    </select>
                                    <button
                                      type="button"
                                      className="btn btn-error btn-xs"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        handleRemoveAntibiogramme(
                                          germe.nom,
                                          index
                                        )
                                      }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                )
                              )}
                          </div>
                        ))}
                    </div>
                    <div className="divider"></div>

                    {/* Gram */}
                    <div>
                      <label className="label">Gram</label>
                      <select
                        className="select select-bordered"
                        value={formData.gram}
                        onChange={(e) =>
                          setFormData({ ...formData, gram: e.target.value })
                        }
                      >
                        <option value="">Sélectionner un type de Gram</option>
                        <option value="Bacilles Gram négatif">
                          Bacilles Gram négatif
                        </option>
                        <option value="Bacilles Gram positif">
                          Bacilles Gram positif
                        </option>
                        <option value="Cocci Gram négatif">
                          Cocci Gram négatif
                        </option>
                        <option value="Cocci Gram positif">
                          Cocci Gram positif
                        </option>
                        <option value="Levures">Levures</option>
                      </select>
                    </div>
                    <div className="divider"></div>
                    {/* Chlamydiae */}
                    <div>
                      <div>
                        <label className="label">
                          Nature du prélèvement pour Chlamydia
                        </label>
                        <select
                          className="select select-bordered"
                          value={
                            formData.observations.rechercheChlamydia
                              .naturePrelevement
                          }
                          onChange={(e) =>
                            handleRechercheChlamydiaChange(
                              'naturePrelevement',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Sélectionnez</option>
                          <option value="cervical">Cervical</option>
                          <option value="urine">Urine</option>
                          <option value="sperme">Sperme</option>
                          <option value="uretral">Urétral</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">
                          Recherche d'antigène de Chlamydia trachomatis
                        </label>
                        <select
                          className="select select-bordered"
                          value={
                            formData.observations.rechercheChlamydia
                              .rechercheAntigeneChlamydiaTrochomatis
                          }
                          onChange={(e) =>
                            handleRechercheChlamydiaChange(
                              'rechercheAntigeneChlamydiaTrochomatis',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Sélectionnez</option>
                          <option value="négative">Négative</option>
                          <option value="positive">Positive</option>
                        </select>
                      </div>

                      {/* Champs pour la Recherche de Mycoplasmes */}
                      <div>
                        <label className="label">
                          Nature du prélèvement pour Mycoplasmes
                        </label>
                        <select
                          className="select select-bordered"
                          value={
                            formData.observations.rechercheMycoplasmes
                              .naturePrelevement
                          }
                          onChange={(e) =>
                            handleRechercheMycoplasmesChange(
                              'naturePrelevement',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Sélectionnez</option>
                          <option value="cervical">Cervical</option>
                          <option value="urine">Urine</option>
                          <option value="sperme">Sperme</option>
                          <option value="uretral">Urétral</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">
                          Recherche d'Ureaplasma urealyticum
                        </label>
                        <select
                          className="select select-bordered"
                          value={
                            formData.observations.rechercheMycoplasmes
                              .rechercheUreaplasmaUrealyticum
                          }
                          onChange={(e) =>
                            handleRechercheMycoplasmesChange(
                              'rechercheUreaplasmaUrealyticum',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Sélectionnez</option>
                          <option value="négative">Négative</option>
                          <option value="positive">Positive</option>
                        </select>
                      </div>
                      <div>
                        <label className="label">
                          Recherche de Mycoplasma hominis
                        </label>
                        <select
                          className="select select-bordered"
                          value={
                            formData.observations.rechercheMycoplasmes
                              .rechercheMycoplasmaHominis
                          }
                          onChange={(e) =>
                            handleRechercheMycoplasmesChange(
                              'rechercheMycoplasmaHominis',
                              e.target.value
                            )
                          }
                        >
                          <option value="">Sélectionnez</option>
                          <option value="négative">Négative</option>
                          <option value="positive">Positive</option>
                        </select>
                      </div>
                    </div>

                    {/* Champs pour la Recherche de Mycoplasmes */}

                    <div className="divider"></div>
                    {/* conclusion */}
                    <div>
                      <label>Conclusion</label>
                      <select
                        className="select select-bordered w-[250px] "
                        value={selectedConclusion}
                        onChange={(e) => setSelectedConclusion(e.target.value)}
                        disabled={!formData.testId} // Désactivez le select si aucun test n'est sélectionné
                      >
                        <option value="">Sélectionner une conclusion</option>
                        {Array.isArray(conclusion) &&
                          conclusion.map((conclusion, index) => (
                            <option key={index} value={conclusion}>
                              {conclusion}
                            </option>
                          ))}
                      </select>
                    </div>
                    {/* antibiogramme */}

                    {/* Répétez pour chaque champ microscopique */}
                  </div>
                </>
              )}

              <div className="form-control">
                <label className="label">Remarque</label>
                <textarea
                  className="textarea textarea-bordered"
                  name="remarque"
                  value={formData.remarque}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-action">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading loading-spinner text-primary"></span>
                  ) : (
                    'Enregistrer'
                  )}
                </button>
                <button className="btn" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

EditResultatButton.propTypes = {
  resultatId: PropTypes.string.isRequired,
  analyseId: PropTypes.string.isRequired,
  onResultatUpdated: PropTypes.func.isRequired,
}

export default EditResultatButton
