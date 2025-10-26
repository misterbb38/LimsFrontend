import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

function AddResultatForm({ analyseId, patientId, onResultatChange }) {
  const [testId, setTestId] = useState('')
  const [valeur, setValeur] = useState('')
  const [excepValues, setExcepValues] = useState({
    groupeSanguin: {
      abo: '', // A, B, AB, O
      rhesus: '', // Positif ou Négatif
    },
    qbc: {
      positivite: '', // "Positif"/"Négatif"
      nombreCroix: 0, // 0,1,2,3,4
      densiteParasitaire: '',
      especes: [], // tableau pouvant contenir jusqu’à 4 espèces
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
      // ajoutez les paramètres de votre choix
    },

    // === REMPLACEMENT DE LA SECTION DES NOUVEAUX PARAMÈTRES ===
    // Remplacer les lignes ~140-280 de excepValues par ceci :

    // PSA Rapport
    psaRapport: {
      psaLibre: { valeur: '', unite: 'ng/mL' },
      psaTotal: { valeur: '', unite: 'ng/mL' },
      rapport: { valeur: '', unite: '%' },
    },

    // Réticulocytes (AVEC 2 RÉSULTATS)
    reticulocytes: {
      pourcentage: { valeur: '', unite: '%' },
      gbRouges: { valeur: '', unite: '/µL' },
      valeurAbsolue: { valeur: '', unite: '/µL' },
      pourcentageCalcule: { valeur: '', unite: '%' }, // NOUVEAU CHAMP
    },

    // Clairance créatinine (UNITÉ CORRIGÉE)
    clairanceCreatinine: {
      age: { valeur: '', unite: 'années' },
      poids: { valeur: '', unite: 'kg' },
      sexe: '',
      creatinineMgL: { valeur: '', unite: 'mg/L' }, // CORRIGÉ : creatinineUmol → creatinineMgL
      clairance: { valeur: '', unite: 'mL/min' },
    },

    // DFG (UNITÉ CORRIGÉE)
    dfg: {
      creatinineMgL: { valeur: '', unite: 'mg/L' }, // CORRIGÉ : creatinineMgDl → creatinineMgL
      age: { valeur: '', unite: 'années' },
      sexe: '',
      dfgValue: { valeur: '', unite: 'mL/min/1.73m²' },
    },

    // Saturation transferrine (UNITÉ CORRIGÉE)
    saturationTransferrine: {
      ferSerique: { valeur: '', unite: 'µg/dL' }, // CORRIGÉ : µmol/L → µg/dL
      transferrine: { valeur: '', unite: 'g/L' },
      ctff: { valeur: '', unite: 'µmol/L' },
      coefficient: { valeur: '', unite: '%' },
    },

    // Compte d'Addis
    compteAddis: {
      leucocytesParMinute: { valeur: '', unite: 'éléments/minute' },
      leucocytesTotaux: { valeur: '', unite: 'éléments' },
      hematiesParMinute: { valeur: '', unite: 'éléments/minute' },
      hematiesTotales: { valeur: '', unite: 'éléments' },
      dureeRecueil: { valeur: '', unite: 'minutes' },
    },

    // Calcium corrigé (CHAMP RENOMMÉ + UNITÉS CORRIGÉES)
    calciumCorrige: {
      calciumMesure: { valeur: '', unite: 'mg/L' }, // CORRIGÉ : calciumTotal → calciumMesure + mmol/L → mg/L
      albumine: { valeur: '', unite: 'g/L' },
      calciumCorrige: { valeur: '', unite: 'mmol/L' }, // Résultat en mmol/L
    },

    // Rapport albuminurie (UNITÉS CORRIGÉES)
    rapportAlbuminurie: {
      albumineUrinaire: { valeur: '', unite: 'mg/L' },
      creatinineUrinaire: { valeur: '', unite: 'g/L' }, // CORRIGÉ : mmol/L → g/L
      rapport: { valeur: '', unite: 'mg/g' }, // CORRIGÉ : mg/mmol → mg/g
    },

    // Rapport protéines (UNITÉS CORRIGÉES)
    rapportProteines: {
      proteinesUrinaires: { valeur: '', unite: 'mg/dL' },
      creatinineUrinaire: { valeur: '', unite: 'mg/dL' },
      rapport: { valeur: '', unite: 'mg/mg' },
    },

    // Cholestérol LDL (CONDITION CORRIGÉE)
    cholesterolLdl: {
      cholesterolTotal: { valeur: '', unite: 'g/L' },
      hdl: { valeur: '', unite: 'g/L' },
      triglycerides: { valeur: '', unite: 'g/L' },
      ldl: { valeur: '', unite: 'g/L' },
    },

    // Lipides totaux (AVEC PHOSPHOLIPIDES OPTIONNEL)
    lipidesTotaux: {
      cholesterolTotal: { valeur: '', unite: 'g/L' },
      triglycerides: { valeur: '', unite: 'g/L' },
      phospholipides: { valeur: '', unite: 'g/L' }, // NOUVEAU CHAMP OPTIONNEL
      lipidesTotaux: { valeur: '', unite: 'g/L' },
    },

    // Microalbuminurie 24h (CHAMP RENOMMÉ)
    microalbuminurie24h: {
      albumineUrinaire: { valeur: '', unite: 'mg/L' },
      volumeUrinaire24h: { valeur: '', unite: 'L' }, // CORRIGÉ : diurese24h → volumeUrinaire24h
      microalbuminurie: { valeur: '', unite: 'mg/24h' },
    },

    // Protéinurie 24h (CHAMP RENOMMÉ + UNITÉ CORRIGÉE)
    proteinurie24h: {
      proteinesUrinaires: { valeur: '', unite: 'mg/L' }, // CORRIGÉ : g/L → mg/L
      volumeUrinaire24h: { valeur: '', unite: 'L' }, // CORRIGÉ : diurese24h → volumeUrinaire24h
      proteinurie: { valeur: '', unite: 'mg/24h' }, // CORRIGÉ : g/24h → mg/24h
    },

    // Bilirubine indirecte (UNITÉS CORRIGÉES)
    bilirubineIndirecte: {
      bilirubineTotale: { valeur: '', unite: 'mg/L' }, // CORRIGÉ : µmol/L → mg/L
      bilirubineDirecte: { valeur: '', unite: 'mg/L' }, // CORRIGÉ : µmol/L → mg/L
      bilirubineIndirecte: { valeur: '', unite: 'mg/L' }, // CORRIGÉ : µmol/L → mg/L
    },

    // 👇 Nouvel ajout : NFS
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

        // === Ajout des blastes et cellules immatures :
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
  })
  const [selectedTestCategory, setSelectedTestCategory] = useState('')
  const [methode, setMethode] = useState('')
  const [machineA, setMachineA] = useState('')
  const [machineB, setMachineB] = useState('')

  const [statutInterpretation, setStatutInterpretation] = useState(false)
  const [statutMachine, setStatutMachine] = useState(true)
  const [typePrelevement, setTypePrelevement] = useState('')
  const [qualitatif, setQualitatif] = useState('')
  const [lieuPrelevement, setLieuPrelevement] = useState('')
  const [datePrelevement, setDatePrelevement] = useState('')
  const [tests, setTests] = useState([])
  const [remarque, setRemarque] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(true)

  const [antibiogrammes, setAntibiogrammes] = useState([])
  const [antibiotiques, setAntibiotiques] = useState([
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
  ])

  const [macroscopique, setMacroscopique] = useState([])
  const [microscopique, setMicroscopique] = useState({
    leucocytes: '',
    hematies: '',
    cellulesEpitheliales: '',
    elementsLevuriforme: '',
    filamentsMyceliens: '',
    trichomonasVaginalis: '',
    cristaux: '',
    cylindres: '',
    parasites: '',
    parasitesDetails: [],
    cristauxDetails: [],
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
  })

  const [chimie, setChimie] = useState({
    proteinesTotales: '',
    proteinesArochies: '',
    glycorachie: '',
    acideUrique: '',
    LDH: '',
  })

  // Déclaration de l'état pour la recherche de chlamydia
  const [rechercheChlamydia, setRechercheChlamydia] = useState({
    naturePrelevement: '',
    rechercheAntigeneChlamydiaTrochomatis: '',
  })

  // Déclaration de l'état pour la recherche de mycoplasmes
  const [rechercheMycoplasmes, setRechercheMycoplasmes] = useState({
    naturePrelevement: '',
    rechercheUreaplasmaUrealyticum: '',
    rechercheMycoplasmaHominis: '',
  })

  const [culture, setCulture] = useState({
    description: '',
    germeIdentifie: [],
    culture: '',
  })
  const [gram, setGram] = useState('')
  const [conclusion, setConclusion] = useState([])
  const [selectedConclusion, setSelectedConclusion] = useState('')

  const [currentView, setCurrentView] = useState('simple') // État pour contrôler la vue active

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
  const token = userInfo?.token
  const updatedBy = userInfo?._id

  useEffect(() => {
    if (analyseId) {
      fetchTests(analyseId)
    }
  }, [analyseId])

  useEffect(() => {
    const selectedTest = tests.find((test) => test._id === testId)
    if (selectedTest) {
      console.log('Selected test:', selectedTest)
      setMachineA(selectedTest.machineA || 'pas de machine A')
      setMachineB(selectedTest.machineB || 'Pas de machine B')
      setConclusion(selectedTest.conclusions)
      setSelectedConclusion('')
    }
  }, [testId, tests])

  const fetchTests = async (analyseId) => {
    try {
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

  const handleMicroscopiqueChange = (field, value) => {
    setMicroscopique((prev) => ({ ...prev, [field]: value }))
  }

  const handleChimieChange = (field, value) => {
    setChimie((prev) => ({ ...prev, [field]: value }))
  }

  const handleRechercheChlamydiaChange = (field, value) => {
    setRechercheChlamydia((prev) => ({ ...prev, [field]: value }))
  }

  const handleRechercheMycoplasmesChange = (field, value) => {
    setRechercheMycoplasmes((prev) => ({ ...prev, [field]: value }))
  }

  const handleCultureChange = (field, value) => {
    setCulture((prev) => ({ ...prev, [field]: value }))
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
    'Klebsiella pneumoniae ssp pneumoniae',
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
    if (!culture.germeIdentifie.some((g) => g.nom === germeName)) {
      const newGerme = {
        nom: germeName,
        antibiogramme: {},
      }
      setCulture((prev) => ({
        ...prev,
        germeIdentifie: [...prev.germeIdentifie, newGerme],
      }))
    }
  }

  const handleGermeRemoval = (germeNom) => {
    setCulture((prev) => ({
      ...prev,
      germeIdentifie: prev.germeIdentifie.filter((g) => g.nom !== germeNom),
    }))
    setAntibiogrammes((prev) => {
      const updated = { ...prev }
      delete updated[germeNom]
      return updated
    })
  }

  const handleAddAntibiogramme = (event, germeNom) => {
    event.preventDefault() // Prevent form submission
    const updatedAntibiogrammes = { ...antibiogrammes }
    if (!updatedAntibiogrammes[germeNom]) {
      updatedAntibiogrammes[germeNom] = []
    }
    updatedAntibiogrammes[germeNom].push({ antibiotique: '', sensibilite: '' })
    setAntibiogrammes(updatedAntibiogrammes)
  }

  const handleUpdateAntibiogramme = (germeNom, index, field, value) => {
    setAntibiogrammes((prev) => ({
      ...prev,
      [germeNom]: prev[germeNom].map((item, idx) => {
        if (idx === index) {
          return { ...item, [field]: value }
        } else {
          return item
        }
      }),
    }))
  }

  const handleRemoveAntibiogramme = (germe, index) => {
    const updatedAntibiogrammes = {
      ...antibiogrammes,
      [germe]: antibiogrammes[germe].filter((_, idx) => idx !== index),
    }
    setAntibiogrammes(updatedAntibiogrammes)
  }

  //les options des cristeaux et parasites

  const handleDetailAddition = (field, value) => {
    setMicroscopique((prev) => ({
      ...prev,
      [field]: [...prev[field], value],
    }))
  }

  const handleDetailRemoval = (field, index) => {
    setMicroscopique((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, idx) => idx !== index),
    }))
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
    setMacroscopique([...macroscopique, value])
  }

  const handleMacroscopiqueRemoval = (index) => {
    setMacroscopique(macroscopique.filter((_, idx) => idx !== index))
  }

  const isPredefined = predefinedGerms.includes(culture.germeIdentifie)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Assurez-vous que les antibiogrammes sont correctement formattés
    //

    let observations = {
      macroscopique: currentView === 'complexe' ? macroscopique : undefined,
      microscopique: currentView === 'complexe' ? microscopique : undefined,
      chimie: currentView === 'complexe' ? chimie : undefined,
      rechercheChlamydia:
        currentView === 'complexe' ? rechercheChlamydia : undefined,
      rechercheMycoplasmes:
        currentView === 'complexe' ? rechercheMycoplasmes : undefined,
      // antibiogramme:
      //   currentView === 'complexe'
      //     ? antibiogrammes.reduce((acc, curr) => {
      //         if (curr.antibiotique && curr.sensibilite) {
      //           acc[curr.antibiotique] = curr.sensibilite
      //         }
      //         return acc
      //       }, {})
      //     : undefined,
    }
    // const cultureFormatted = culture.germeIdentifie.map((germe) => ({
    //   nom: germe.nom,
    //   antibiogramme: antibiogrammes[germe.nom].reduce((acc, curr) => {
    //     if (curr.antibiotique && curr.sensibilite) {
    //       acc[curr.antibiotique] = curr.sensibilite // Create a map of antibiotic to sensitivity
    //     }
    //     return acc
    //   }, {}),
    // }))

    const cultureFormatted = culture.germeIdentifie.map((germe) => {
      const antibioList = antibiogrammes[germe.nom] || [] // S'assurer que c'est un tableau
      return {
        nom: germe.nom,
        antibiogramme: antibioList.reduce((acc, curr) => {
          if (curr.antibiotique && curr.sensibilite) {
            acc[curr.antibiotique] = curr.sensibilite // Create a map of antibiotic to sensitivity
          }
          return acc
        }, {}),
      }
    })

    try {
      const body = {
        analyseId,
        testId,
        patientId,
        valeur: currentView === 'simple' ? valeur : undefined,
        methode: currentView === 'simple' ? methode : undefined,
        machineA: currentView === 'simple' ? machineA : undefined,
        machineB: currentView === 'simple' ? machineB : undefined,
        statutMachine,
        statutInterpretation,
        typePrelevement,
        qualitatif,
        lieuPrelevement,
        datePrelevement: datePrelevement || null,
        remarque,
        updatedBy,
        observations,
        culture:
          currentView === 'complexe'
            ? {
                ...culture,
                germeIdentifie: cultureFormatted,
              }
            : undefined,
        gram: currentView === 'complexe' ? gram : undefined,
        conclusion: currentView === 'complexe' ? selectedConclusion : undefined,
        // ** Ajout important : exceptions (champs QBC, etc.) **
        exceptions: excepValues, // On envoie l'objet complet
      }
      const response = await fetch(`${apiUrl}/api/resultats/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (response.ok) {
        const data = await response.json()
        setToastMessage('Résultat ajouté avec succès')
        setIsSuccess(true)
        onResultatChange()
        resetForm()
      } else {
        const errorData = await response.json()
        setToastMessage(errorData.message || "Échec de l'ajout du résultat")
        setIsSuccess(false)
      }
    } catch (error) {
      setToastMessage("Erreur lors de l'envoi du formulaire : " + error.message)
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const resetForm = () => {
    setTestId('')
    setValeur('')
    setMethode('')
    setMachineA('')
    setMachineB('')
    setStatutMachine(false)
    setStatutInterpretation(false)
    setTypePrelevement('')
    setQualitatif('')
    setLieuPrelevement('')
    setDatePrelevement('')
    setRemarque('')
    // Remettre excepValues à zéro
    setExcepValues({
      groupeSanguin: { abo: '', rhesus: '' },
      qbc: {
        positivite: '',
        nombreCroix: 0,
        densiteParasitaire: '',
        especes: [],
      },
      hgpo: { t0: '', t60: '', t120: '' },
      ionogramme: { na: '', k: '', cl: '', ca: '', mg: '' },
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
          gb: {
            valeur: '',
            unite: '10^3/uL',
            reference: '4.00-10.00',
            flag: '',
          },
          neut: {
            valeur: '',
            unite: '10^3/uL',
            referenceValeur: '1.50-7.50',
            referencePourcentage: '37.0-72.0',
            pourcentage: '',
            flag: '',
          },
          lymph: {
            valeur: '',
            unite: '10^3/uL',
            referenceValeur: '1.50-4.00',
            referencePourcentage: '20.0-50.0',
            pourcentage: '',
            flag: '',
          },
          mono: {
            valeur: '',
            unite: '10^3/uL',
            referenceValeur: '0.10-1.00',
            referencePourcentage: '0.0-14.0',
            pourcentage: '',
            flag: '',
          },
          eo: {
            valeur: '',
            unite: '10^3/uL',
            referenceValeur: '0.01-0.50',
            referencePourcentage: '0.0-6.0',
            pourcentage: '',
            flag: '',
          },
          baso: {
            valeur: '',
            unite: '10^3/uL',
            referenceValeur: '0.00-0.10',
            referencePourcentage: '0.0-1.0',
            pourcentage: '',
            flag: '',
          },
          plt: { valeur: '', unite: '10^3/uL', reference: '150-450', flag: '' },
        },
      },
      // === RESET DES NOUVEAUX PARAMÈTRES CORRIGÉS ===
      psaRapport: {
        psaLibre: { valeur: '', unite: 'ng/mL' },
        psaTotal: { valeur: '', unite: 'ng/mL' },
        rapport: { valeur: '', unite: '%' },
      },
      reticulocytes: {
        pourcentage: { valeur: '', unite: '%' },
        gbRouges: { valeur: '', unite: '/µL' },
        valeurAbsolue: { valeur: '', unite: '/µL' },
        pourcentageCalcule: { valeur: '', unite: '%' }, // NOUVEAU CHAMP
      },
      clairanceCreatinine: {
        age: { valeur: '', unite: 'années' },
        poids: { valeur: '', unite: 'kg' },
        sexe: '',
        creatinineMgL: { valeur: '', unite: 'mg/L' }, // CORRIGÉ : creatinineUmol → creatinineMgL
        clairance: { valeur: '', unite: 'mL/min' },
      },
      dfg: {
        creatinineMgL: { valeur: '', unite: 'mg/L' }, // CORRIGÉ : creatinineMgDl → creatinineMgL
        age: { valeur: '', unite: 'années' },
        sexe: '',
        dfgValue: { valeur: '', unite: 'mL/min/1.73m²' },
      },
      saturationTransferrine: {
        ferSerique: { valeur: '', unite: 'µg/dL' }, // CORRIGÉ : µmol/L → µg/dL
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
        calciumMesure: { valeur: '', unite: 'mg/L' }, // CORRIGÉ : calciumTotal → calciumMesure + mmol/L → mg/L
        albumine: { valeur: '', unite: 'g/L' },
        calciumCorrige: { valeur: '', unite: 'mmol/L' },
      },
      rapportAlbuminurie: {
        albumineUrinaire: { valeur: '', unite: 'mg/L' },
        creatinineUrinaire: { valeur: '', unite: 'g/L' }, // CORRIGÉ : mmol/L → g/L
        rapport: { valeur: '', unite: 'mg/g' }, // CORRIGÉ : mg/mmol → mg/g
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
        phospholipides: { valeur: '', unite: 'g/L' }, // NOUVEAU CHAMP
        lipidesTotaux: { valeur: '', unite: 'g/L' },
      },
      microalbuminurie24h: {
        albumineUrinaire: { valeur: '', unite: 'mg/L' },
        volumeUrinaire24h: { valeur: '', unite: 'L' }, // CORRIGÉ : diurese24h → volumeUrinaire24h
        microalbuminurie: { valeur: '', unite: 'mg/24h' },
      },
      proteinurie24h: {
        proteinesUrinaires: { valeur: '', unite: 'mg/L' }, // CORRIGÉ : g/L → mg/L
        volumeUrinaire24h: { valeur: '', unite: 'L' }, // CORRIGÉ : diurese24h → volumeUrinaire24h
        proteinurie: { valeur: '', unite: 'mg/24h' }, // CORRIGÉ : g/24h → mg/24h
      },
      bilirubineIndirecte: {
        bilirubineTotale: { valeur: '', unite: 'mg/L' }, // CORRIGÉ : µmol/L → mg/L
        bilirubineDirecte: { valeur: '', unite: 'mg/L' }, // CORRIGÉ : µmol/L → mg/L
        bilirubineIndirecte: { valeur: '', unite: 'mg/L' }, // CORRIGÉ : µmol/L → mg/L
      },
    })
    setAntibiogrammes([])
    setMacroscopique('')
    setMicroscopique({
      leucocytes: '',
      hematies: '',
      cellulesEpitheliales: '',
      elementsLevuriforme: '',
      filamentsMyceliens: '',
      trichomonasVaginalis: '',
      cristaux: '',
      cylindres: '',
      parasites: '',
      trichomonasIntestinales: '',
      oeufsDeBilharzies: '',
      clueCells: '',
      gardnerellaVaginalis: '',
      bacillesDeDoderlein: '',
      typeDeFlore: '',
      ph: '',
      rechercheDeStreptocoqueB: '',
      monocytes: '',
    })
    setChimie({
      proteinesTotales: '',
      proteinesArochies: '',
      glycorachie: '',
      acideUrique: '',
      LDH: '',
    })
    // Pour réinitialiser l'état de recherche de chlamydia
    setRechercheChlamydia({
      naturePrelevement: '',
      rechercheAntigeneChlamydiaTrochomatis: '',
    })

    // Pour réinitialiser l'état de recherche de mycoplasmes
    setRechercheMycoplasmes({
      naturePrelevement: '',
      rechercheUreaplasmaUrealyticum: '',
      rechercheMycoplasmaHominis: '',
    })

    setCulture({
      description: '',
      germeIdentifie: [],
      culture: '',
    })
    setGram('Non effectué')
    setConclusion('')
  }

  function getTestCategory(testName) {
    if (!testName) return ''

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
    // 1. PSA Rapport - Patterns possibles
    else if (
      (nameLower.includes('psa') &&
        (nameLower.includes('rapport') || nameLower.includes('libre'))) ||
      (nameLower.includes('rapport') &&
        nameLower.includes('psa') &&
        (nameLower.includes('total') || nameLower.includes('libre')))
    ) {
      return 'psaRapport'
    }

    // 2. Réticulocytes
    else if (
      nameLower.includes('réticulocyte') ||
      nameLower.includes('reticulocyte') ||
      nameLower.includes('reticulocytes')
    ) {
      return 'reticulocytes'
    }

    // 3. Clairance créatinine
    else if (
      (nameLower.includes('clairance') && nameLower.includes('créatinine')) ||
      (nameLower.includes('clairance') && nameLower.includes('creatinine')) ||
      nameLower.includes('cockcroft')
    ) {
      return 'clairanceCreatinine'
    }

    // 4. DFG
    else if (
      nameLower.includes('dfg') ||
      nameLower.includes('filtration') ||
      nameLower.includes('ckd-epi') ||
      nameLower.includes('débit de filtration')
    ) {
      return 'dfg'
    }

    // 5. Saturation transferrine
    else if (
      (nameLower.includes('transferrine') &&
        nameLower.includes('saturation')) ||
      (nameLower.includes('coefficient') &&
        nameLower.includes('transferrine')) ||
      nameLower.includes('ctff')
    ) {
      return 'saturationTransferrine'
    }

    // 6. Compte d'Addis - Patterns possibles
    else if (
      nameLower.includes('addis') ||
      (nameLower.includes('compte') && nameLower.includes('addis')) ||
      nameLower.includes('hlm') // Hématies Leucocytes par Minute
    ) {
      return 'compteAddis'
    }

    // 7. Calcium corrigé
    else if (
      (nameLower.includes('calcium') && nameLower.includes('corrigé')) ||
      (nameLower.includes('calcium') && nameLower.includes('corrige'))
    ) {
      return 'calciumCorrige'
    }

    // 8. Rapport albuminurie/créatininurie
    else if (
      (nameLower.includes('albuminurie') && nameLower.includes('créatinine')) ||
      (nameLower.includes('albuminurie') && nameLower.includes('creatinine')) ||
      (nameLower.includes('rapport') && nameLower.includes('albuminurie')) ||
      nameLower.includes('rac') // Rapport Albuminurie/Créatininurie
    ) {
      return 'rapportAlbuminurie'
    }

    // 9. Rapport protéinurie/créatininurie - Patterns possibles
    else if (
      (nameLower.includes('protéinurie') && nameLower.includes('créatinine')) ||
      (nameLower.includes('proteinurie') && nameLower.includes('creatinine')) ||
      (nameLower.includes('rapport') && nameLower.includes('protéinurie')) ||
      (nameLower.includes('rapport') && nameLower.includes('proteinurie')) ||
      nameLower.includes('rpc') // Rapport Protéinurie/Créatininurie
    ) {
      return 'rapportProteines'
    }

    // 10. Cholestérol LDL - Patterns possibles
    else if (
      nameLower.includes('ldl') ||
      (nameLower.includes('cholestérol') && nameLower.includes('ldl')) ||
      (nameLower.includes('cholesterol') && nameLower.includes('ldl')) ||
      nameLower.includes('friedewald')
    ) {
      return 'cholesterolLdl'
    }

    // 11. Lipides totaux
    else if (
      nameLower.includes('lipides totaux') ||
      nameLower.includes('lipides total') ||
      (nameLower.includes('lipides') && nameLower.includes('total'))
    ) {
      return 'lipidesTotaux'
    }

    // 12. Microalbuminurie 24h - Patterns possibles
    else if (
      (nameLower.includes('microalbuminurie') && nameLower.includes('24')) ||
      (nameLower.includes('micro') &&
        nameLower.includes('albumine') &&
        nameLower.includes('24'))
    ) {
      return 'microalbuminurie24h'
    }

    // 13. Protéinurie 24h - Patterns possibles
    else if (
      (nameLower.includes('protéinurie') && nameLower.includes('24')) ||
      (nameLower.includes('proteinurie') && nameLower.includes('24')) ||
      (nameLower.includes('protéines') && nameLower.includes('24h')) ||
      (nameLower.includes('proteins') && nameLower.includes('24'))
    ) {
      return 'proteinurie24h'
    }

    // 14. Bilirubine indirecte
    else if (
      (nameLower.includes('bilirubine') && nameLower.includes('indirecte')) ||
      (nameLower.includes('bilirubine') && nameLower.includes('indirect'))
    ) {
      return 'bilirubineIndirecte'
    }

    return 'normal'
  }

  useEffect(() => {
    const selectedTest = tests.find((test) => test._id === testId)
    if (selectedTest) {
      // ...
      const cat = getTestCategory(selectedTest.nom)
      setSelectedTestCategory(cat)
    } else {
      setSelectedTestCategory('')
    }
  }, [testId, tests])

  const handleEspecesCheckboxChange = (isChecked, especeName) => {
    setExcepValues((prev) => {
      const oldEspeces = prev.qbc.especes || []
      let newEspeces = [...oldEspeces]

      if (isChecked) {
        // Si on coche → on ajoute
        if (!newEspeces.includes(especeName)) {
          newEspeces.push(especeName)
        }
      } else {
        // Si on décoche → on retire
        newEspeces = newEspeces.filter((item) => item !== especeName)
      }

      // on limite tout de même à 4
      if (newEspeces.length > 4) {
        newEspeces = newEspeces.slice(0, 4)
      }

      return {
        ...prev,
        qbc: {
          ...prev.qbc,
          especes: newEspeces,
        },
      }
    })
  }

  return (
    <>
      {showToast && (
        <div className="toast toast-center toast-middle">
          <div
            className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}
          >
            <span className="text-white">{toastMessage}</span>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label className="label">Paramettre</label>
          <select
            className="select select-bordered w-full max-w-xs"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            required
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
              value={typePrelevement}
              onChange={(e) => setTypePrelevement(e.target.value)}
            >
              <option value="">Sélectionner une option</option>
              <option value="Urines">Urines</option>
              <option value="Secretions vaginales">Sécrétions vaginales</option>
              <option value="Selles">Selles</option>
              <option value="Uretral">Urétral</option>
              <option value="Sperme">Sperme</option>
              <option value="Vulve">Vulve</option>
              <option value="Urines">Urines</option>
              <option value="Secretions vaginales">Sécrétions vaginales</option>
              <option value="Selles">Selles</option>
              <option value="Uretral">Urétral</option>
              <option value="Sérum">Sérum</option>
              <option value="Plasma">Plasma</option>
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
              <option value="Écouvillon pharyngé">Écouvillon pharyngé</option>
              <option value="Lait maternel">Lait maternel</option>
              <option value="Peau">Peau</option>
              <option value="Tissu">Tissu</option>
              <option value="Cavité buccale">Cavité buccale</option>
              <option value="Cordon ombilical">Cordon ombilical</option>
              <option value="Épanchement pleural">Épanchement pleural</option>
              <option value="Liquide synovial">Liquide synovial</option>
              <option value="Expectorations induites">
                Expectorations induites
              </option>
              <option value="Liquide péritonéal">Liquide péritonéal</option>
              <option value="Cathéter">Cathéter</option>
              <option value="LCR">Liquide cérébrospinal (LCR)</option>
            </select>
          </div>

          <div>
            <label className="label">Lieu de Prélèvement</label>
            <select
              className="select select-bordered"
              value={lieuPrelevement}
              onChange={(e) => setLieuPrelevement(e.target.value)}
            >
              <option value="">Sélectionner une option</option>
              <option value="Prélevé(es) au laboratoire">
                Prélevé au laboratoire
              </option>
              <option value="Apporté(es) au laboratoire">
                Apporté au laboratoire
              </option>
            </select>
          </div>

          <div>
            <label className="label">Date de Prélèvement</label>
            <input
              type="datetime-local"
              value={datePrelevement}
              onChange={(e) => setDatePrelevement(e.target.value)}
              className="input input-bordered"
            />
          </div>

          <div>
            <label className="label">Résultat qualitatif</label>
            <select
              className="select select-bordered"
              value={qualitatif}
              onChange={(e) => setQualitatif(e.target.value)}
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

        <div className="flex flex-col items-center mb-4">
          <div className="form-control">
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
        </div>

        {/* {currentView === 'simple' && (
          <div
            id="simple"
            className="flex flex-nowrap gap-4 items-center w-full"
          >
            <div>
              <label className="label">Valeur</label>
              <input
                type="text"
                value={valeur}
                onChange={(e) => setValeur(e.target.value)}
                required
                className="input input-bordered"
              />
            </div>

            <div>
              <label className="label">Statut de l'Interprétation</label>
              <select
                className="select select-bordered"
                value={statutInterpretation}
                onChange={(e) =>
                  setStatutInterpretation(e.target.value === 'true')
                }
              >
                <option value="false">Non</option>
                <option value="true">Oui</option>
              </select>
            </div>

            <div>
              <label className="label">Machine utiliser</label>
              <select
                className="select select-bordered"
                value={statutMachine}
                onChange={(e) => setStatutMachine(e.target.value === 'true')}
              >
                <option selected value="true">
                  A
                </option>
                <option value="false">B</option>
              </select>
            </div>

            <div>
              <label className="label">Methode</label>
              <select
                value={methode}
                onChange={(e) => setMethode(e.target.value)}
                className="select select-bordered"
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
        )} */}

        {currentView === 'simple' && (
          <div id="simple" className="flex flex-col w-full gap-4">
            {/* --------------------------------
        1ère rangée : Valeur, Interprétation, Machine, Méthode
        -------------------------------- */}
            <div className="flex flex-wrap gap-4 items-center w-full">
              {/* Valeur */}
              <div>
                <label className="label">Valeur</label>
                <input
                  type="text"
                  value={valeur}
                  onChange={(e) => setValeur(e.target.value)}
                  className="input input-bordered"
                />
              </div>

              {/* Statut Interprétation */}
              <div>
                <label className="label">Statut de l'Interprétation</label>
                <select
                  className="select select-bordered"
                  value={statutInterpretation}
                  onChange={(e) =>
                    setStatutInterpretation(e.target.value === 'true')
                  }
                >
                  <option value="false">Non</option>
                  <option value="true">Oui</option>
                </select>
              </div>

              {/* Machine (A / B) */}
              <div>
                <label className="label">Machine utilisée</label>
                <select
                  className="select select-bordered"
                  value={statutMachine}
                  onChange={(e) => setStatutMachine(e.target.value === 'true')}
                >
                  <option value="true">A</option>
                  <option value="false">B</option>
                </select>
              </div>

              {/* Méthode */}
              <div>
                <label className="label">Méthode</label>
                <select
                  value={methode}
                  onChange={(e) => setMethode(e.target.value)}
                  className="select select-bordered"
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
            {/* --------------------------------
        2ème partie : SI le test est QBC
        -------------------------------- */}
            {selectedTestCategory === 'qbc' && (
              <div className="flex flex-col w-full gap-4">
                {/* Ligne 1: Positivité / Nombre de croix / Densité parasitaire */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex flex-col">
                    <label className="label">Positivité</label>
                    <select
                      className="select select-bordered w-[120px]"
                      value={excepValues.qbc.positivite}
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          qbc: {
                            ...prev.qbc,
                            positivite: e.target.value,
                          },
                        }))
                      }
                    >
                      <option value="">-- Choisir --</option>
                      <option value="Négatif">Négatif</option>
                      <option value="Positif">Positif</option>
                    </select>
                  </div>

                  <div className="flex flex-col">
                    <label className="label">Nombre de croix (0 à 4)</label>
                    <input
                      type="number"
                      className="input input-bordered w-[90px]"
                      min={0}
                      max={4}
                      value={excepValues.qbc.nombreCroix}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10)
                        setExcepValues((prev) => ({
                          ...prev,
                          qbc: {
                            ...prev.qbc,
                            nombreCroix: val >= 0 && val <= 4 ? val : 0,
                          },
                        }))
                      }}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="label">Densité parasitaire</label>
                    <input
                      type="text"
                      className="input input-bordered w-[100px]"
                      value={excepValues.qbc.densiteParasitaire}
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          qbc: {
                            ...prev.qbc,
                            densiteParasitaire: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Ligne 2: Cases à cocher (4 espèces) */}
                <div className="flex flex-col">
                  <label className="label">Espèces</label>
                  <div className="flex gap-4">
                    {[
                      'Plasmodium falciparum',
                      'Plasmodium ovale',
                      'Plasmodium vivax',
                      'Plasmodium malariae',
                    ].map((sp) => (
                      <label
                        key={sp}
                        className="cursor-pointer flex items-center gap-1"
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={excepValues.qbc.especes.includes(sp)}
                          onChange={(e) =>
                            handleEspecesCheckboxChange(e.target.checked, sp)
                          }
                        />
                        <span className="label-text">{sp}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {/* 3ème partie : SI le test est groupe sanguin */}
            {selectedTestCategory === 'groupeSanguin' && (
              <div className="flex flex-nowrap gap-4 items-center w-full mt-2">
                <div>
                  <label className="label">Groupe ABO</label>
                  <select
                    className="select select-bordered"
                    value={excepValues.groupeSanguin.abo}
                    onChange={(e) =>
                      setExcepValues((prev) => ({
                        ...prev,
                        groupeSanguin: {
                          ...prev.groupeSanguin,
                          abo: e.target.value,
                        },
                      }))
                    }
                  >
                    <option value="">-- Choisir --</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>

                <div>
                  <label className="label">Rhésus</label>
                  <select
                    className="select select-bordered"
                    value={excepValues.groupeSanguin.rhesus}
                    onChange={(e) =>
                      setExcepValues((prev) => ({
                        ...prev,
                        groupeSanguin: {
                          ...prev.groupeSanguin,
                          rhesus: e.target.value,
                        },
                      }))
                    }
                  >
                    <option value="">-- Choisir --</option>
                    <option value="Positif">Positif (Rh+)</option>
                    <option value="Négatif">Négatif (Rh-)</option>
                  </select>
                </div>
              </div>
            )}
            {/* // 4 eme partie pour hgpo */}
            {selectedTestCategory === 'hgpo' && (
              <div className="flex flex-nowrap gap-4 items-center w-full mt-2">
                <div>
                  <label className="label">Glycémie T0</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={excepValues.hgpo.t0}
                    onChange={(e) =>
                      setExcepValues((prev) => ({
                        ...prev,
                        hgpo: { ...prev.hgpo, t0: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="label">Glycémie T60</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={excepValues.hgpo.t60}
                    onChange={(e) =>
                      setExcepValues((prev) => ({
                        ...prev,
                        hgpo: { ...prev.hgpo, t60: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="label">Glycémie T120</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={excepValues.hgpo.t120}
                    onChange={(e) =>
                      setExcepValues((prev) => ({
                        ...prev,
                        hgpo: { ...prev.hgpo, t120: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            )}
            {/* //5 eme ionigramme */}
            {selectedTestCategory === 'ionogramme' && (
              <div className="flex flex-wrap gap-4 items-center w-full mt-2">
                <div>
                  <label className="label">Na+</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={excepValues.ionogramme.na}
                    onChange={(e) =>
                      setExcepValues((prev) => ({
                        ...prev,
                        ionogramme: { ...prev.ionogramme, na: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="label">K+</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={excepValues.ionogramme.k}
                    onChange={(e) =>
                      setExcepValues((prev) => ({
                        ...prev,
                        ionogramme: { ...prev.ionogramme, k: e.target.value },
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="label">Cl-</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={excepValues.ionogramme.cl}
                    onChange={(e) =>
                      setExcepValues((prev) => ({
                        ...prev,
                        ionogramme: { ...prev.ionogramme, cl: e.target.value },
                      }))
                    }
                  />
                </div>
                {/* <div>
                  <label className="label">Ca2+</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={excepValues.ionogramme.ca}
                    onChange={(e) =>
                      setExcepValues((prev) => ({
                        ...prev,
                        ionogramme: { ...prev.ionogramme, ca: e.target.value },
                      }))
                    }
                  />
                </div> */}
                {/* <div>
                  <label className="label">Mg2+</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={excepValues.ionogramme.mg}
                    onChange={(e) =>
                      setExcepValues((prev) => ({
                        ...prev,
                        ionogramme: { ...prev.ionogramme, mg: e.target.value },
                      }))
                    }
                  />
                </div> */}
                {/* Ajoutez d’autres ions si besoin */}
              </div>
            )}
            {/* fns */}
            {selectedTestCategory === 'nfs' && excepValues.nfs && (
              <>
                {/* ---------------------------------------------------------------------- */}
                {/* Bloc HÉMATIES et Constantes                                            */}
                {/* ---------------------------------------------------------------------- */}
                <div className="border p-4 mt-4">
                  <h3 className="font-bold mb-2">Hématies (GR, HGB, HCT)</h3>

                  <div className="flex flex-wrap gap-4">
                    {/* GR */}
                    <div className="flex flex-col mb-2">
                      <label className="label font-semibold">
                        GR (Globules Rouges)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered w-[150px]"
                        placeholder="ex: 4.5"
                        value={
                          excepValues.nfs?.hematiesEtConstantes?.gr?.valeur ||
                          ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              hematiesEtConstantes: {
                                ...prev.nfs.hematiesEtConstantes,
                                gr: {
                                  ...prev.nfs.hematiesEtConstantes.gr,
                                  valeur: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Unité :{' '}
                        {excepValues.nfs?.hematiesEtConstantes?.gr?.unite ||
                          'N/A'}
                        {' | '}Référence :{' '}
                        {excepValues.nfs?.hematiesEtConstantes?.gr?.reference ||
                          'N/A'}
                      </small>
                    </div>

                    {/* HGB */}
                    <div className="flex flex-col mb-2">
                      <label className="label font-semibold">
                        HGB (Hémoglobine)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered w-[150px]"
                        placeholder="ex: 13.2"
                        value={
                          excepValues.nfs?.hematiesEtConstantes?.hgb?.valeur ||
                          ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              hematiesEtConstantes: {
                                ...prev.nfs.hematiesEtConstantes,
                                hgb: {
                                  ...prev.nfs.hematiesEtConstantes.hgb,
                                  valeur: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Unité :{' '}
                        {excepValues.nfs?.hematiesEtConstantes?.hgb?.unite ||
                          'N/A'}
                        {' | '}Référence :{' '}
                        {excepValues.nfs?.hematiesEtConstantes?.hgb
                          ?.reference || 'N/A'}
                      </small>
                    </div>

                    {/* HCT */}
                    <div className="flex flex-col mb-2">
                      <label className="label font-semibold">
                        HCT (Hématocrite)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered w-[150px]"
                        placeholder="ex: 40"
                        value={
                          excepValues.nfs?.hematiesEtConstantes?.hct?.valeur ||
                          ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              hematiesEtConstantes: {
                                ...prev.nfs.hematiesEtConstantes,
                                hct: {
                                  ...prev.nfs.hematiesEtConstantes.hct,
                                  valeur: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Unité :{' '}
                        {excepValues.nfs?.hematiesEtConstantes?.hct?.unite ||
                          'N/A'}
                        {' | '}Référence :{' '}
                        {excepValues.nfs?.hematiesEtConstantes?.hct
                          ?.reference || 'N/A'}
                      </small>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4">
                    {/* ecartType (pour IDR-CV) */}
                    <div className="flex flex-col mb-2">
                      <label className="label font-semibold">
                        Écart Type (RDW)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered w-[150px]"
                        placeholder="ex: 12"
                        value={
                          excepValues.nfs?.hematiesEtConstantes?.idr_cv
                            ?.ecartType || ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              hematiesEtConstantes: {
                                ...prev.nfs.hematiesEtConstantes,
                                idr_cv: {
                                  ...prev.nfs.hematiesEtConstantes.idr_cv,
                                  ecartType: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>(Utilisé pour calculer IDR-CV)</small>
                    </div>

                    {/* IDR-CV */}
                    <div className="flex flex-col mb-2">
                      <label className="label font-semibold">IDR-CV (%)</label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered w-[150px]"
                        placeholder="ex: 13.0"
                        value={
                          excepValues.nfs?.hematiesEtConstantes?.idr_cv
                            ?.valeur || ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              hematiesEtConstantes: {
                                ...prev.nfs.hematiesEtConstantes,
                                idr_cv: {
                                  ...prev.nfs.hematiesEtConstantes.idr_cv,
                                  valeur: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Référence :{' '}
                        {excepValues.nfs?.hematiesEtConstantes?.idr_cv
                          ?.reference || 'N/A'}
                      </small>
                    </div>
                  </div>
                </div>

                {/* ---------------------------------------------------------------------- */}
                {/* Bloc LEUCOCYTES et Formule (affichage 3 colonnes par ligne)            */}
                {/* ---------------------------------------------------------------------- */}
                <div className="border p-4 mt-4">
                  <h3 className="font-bold mb-2">Leucocytes (GB) et Formule</h3>

                  <div className="flex flex-wrap gap-4">
                    {/* GB : Valeur totale leucocytes */}
                    <div className="flex flex-col mb-2 w-[200px]">
                      <label className="label font-semibold">
                        GB (Leucocytes Totaux)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered"
                        placeholder="ex: 7.2"
                        value={
                          excepValues.nfs?.leucocytesEtFormules?.gb?.valeur ||
                          ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              leucocytesEtFormules: {
                                ...prev.nfs.leucocytesEtFormules,
                                gb: {
                                  ...prev.nfs.leucocytesEtFormules.gb,
                                  valeur: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Unité :{' '}
                        {excepValues.nfs?.leucocytesEtFormules?.gb?.unite ||
                          'N/A'}
                        {' | '}Réf :{' '}
                        {excepValues.nfs?.leucocytesEtFormules?.gb?.reference ||
                          'N/A'}
                      </small>
                    </div>

                    {/* Neut (%) */}
                    <div className="flex flex-col mb-2 w-[200px]">
                      <label className="label font-semibold">
                        Neutrophiles (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered"
                        placeholder="ex: 55"
                        value={
                          excepValues.nfs?.leucocytesEtFormules?.neut
                            ?.pourcentage || ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              leucocytesEtFormules: {
                                ...prev.nfs.leucocytesEtFormules,
                                neut: {
                                  ...prev.nfs.leucocytesEtFormules.neut,
                                  pourcentage: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Réf. % :{' '}
                        {excepValues.nfs?.leucocytesEtFormules?.neut
                          ?.referencePourcentage || 'N/A'}
                      </small>
                    </div>

                    {/* Lymph (%) */}
                    <div className="flex flex-col mb-2 w-[200px]">
                      <label className="label font-semibold">
                        Lymphocytes (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered"
                        placeholder="ex: 35"
                        value={
                          excepValues.nfs?.leucocytesEtFormules?.lymph
                            ?.pourcentage || ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              leucocytesEtFormules: {
                                ...prev.nfs.leucocytesEtFormules,
                                lymph: {
                                  ...prev.nfs.leucocytesEtFormules.lymph,
                                  pourcentage: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Réf. % :{' '}
                        {excepValues.nfs?.leucocytesEtFormules?.lymph
                          ?.referencePourcentage || 'N/A'}
                      </small>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-2">
                    {/* Mono (%) */}
                    <div className="flex flex-col mb-2 w-[200px]">
                      <label className="label font-semibold">
                        Monocytes (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered"
                        placeholder="ex: 6"
                        value={
                          excepValues.nfs?.leucocytesEtFormules?.mono
                            ?.pourcentage || ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              leucocytesEtFormules: {
                                ...prev.nfs.leucocytesEtFormules,
                                mono: {
                                  ...prev.nfs.leucocytesEtFormules.mono,
                                  pourcentage: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Réf. % :{' '}
                        {excepValues.nfs?.leucocytesEtFormules?.mono
                          ?.referencePourcentage || 'N/A'}
                      </small>
                    </div>

                    {/* Eo (%) */}
                    <div className="flex flex-col mb-2 w-[200px]">
                      <label className="label font-semibold">
                        Éosinophiles (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered"
                        placeholder="ex: 2"
                        value={
                          excepValues.nfs?.leucocytesEtFormules?.eo
                            ?.pourcentage || ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              leucocytesEtFormules: {
                                ...prev.nfs.leucocytesEtFormules,
                                eo: {
                                  ...prev.nfs.leucocytesEtFormules.eo,
                                  pourcentage: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Réf. % :{' '}
                        {excepValues.nfs?.leucocytesEtFormules?.eo
                          ?.referencePourcentage || 'N/A'}
                      </small>
                    </div>

                    {/* Baso (%) */}
                    <div className="flex flex-col mb-2 w-[200px]">
                      <label className="label font-semibold">
                        Basophiles (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered"
                        placeholder="ex: 1"
                        value={
                          excepValues.nfs?.leucocytesEtFormules?.baso
                            ?.pourcentage || ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              leucocytesEtFormules: {
                                ...prev.nfs.leucocytesEtFormules,
                                baso: {
                                  ...prev.nfs.leucocytesEtFormules.baso,
                                  pourcentage: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Réf. % :{' '}
                        {excepValues.nfs?.leucocytesEtFormules?.baso
                          ?.referencePourcentage || 'N/A'}
                      </small>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-2">
                    {/* PLT */}
                    <div className="flex flex-col mb-2 w-[200px]">
                      <label className="label font-semibold">
                        Plaquettes (PLT)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered"
                        placeholder="ex: 250"
                        value={
                          excepValues.nfs?.leucocytesEtFormules?.plt?.valeur ||
                          ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              leucocytesEtFormules: {
                                ...prev.nfs.leucocytesEtFormules,
                                plt: {
                                  ...prev.nfs.leucocytesEtFormules.plt,
                                  valeur: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Unité :{' '}
                        {excepValues.nfs?.leucocytesEtFormules?.plt?.unite ||
                          'N/A'}
                        {' | '}Réf :{' '}
                        {excepValues.nfs?.leucocytesEtFormules?.plt
                          ?.reference || 'N/A'}
                      </small>
                    </div>
                  </div>

                  {/* ---------------------------------------------------------------------- */}
                  {/* BLOC DES BLASTES / CELLULES IMMATURES                                  */}
                  {/* ---------------------------------------------------------------------- */}
                  <h4 className="mt-4 font-semibold">
                    Cellules immatures / Blastes
                  </h4>

                  <div className="flex flex-wrap gap-4 mt-2">
                    {/* Proérythroblastes (%) */}
                    <div className="flex flex-col mb-2 w-[200px]">
                      <label className="label font-semibold">
                        Proérythroblastes (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered"
                        placeholder="ex: 0.1"
                        value={
                          excepValues.nfs?.leucocytesEtFormules
                            ?.proerythroblastes?.pourcentage || ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              leucocytesEtFormules: {
                                ...prev.nfs.leucocytesEtFormules,
                                proerythroblastes: {
                                  ...prev.nfs.leucocytesEtFormules
                                    .proerythroblastes,
                                  pourcentage: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Réf. % :{' '}
                        {excepValues.nfs?.leucocytesEtFormules
                          ?.proerythroblastes?.referencePourcentage || 'N/A'}
                      </small>
                    </div>

                    {/* Erythroblastes (%) */}
                    <div className="flex flex-col mb-2 w-[200px]">
                      <label className="label font-semibold">
                        Erythroblastes (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered"
                        placeholder="ex: 0.05"
                        value={
                          excepValues.nfs?.leucocytesEtFormules?.erythroblastes
                            ?.pourcentage || ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              leucocytesEtFormules: {
                                ...prev.nfs.leucocytesEtFormules,
                                erythroblastes: {
                                  ...prev.nfs.leucocytesEtFormules
                                    .erythroblastes,
                                  pourcentage: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Réf. % :{' '}
                        {excepValues.nfs?.leucocytesEtFormules?.erythroblastes
                          ?.referencePourcentage || 'N/A'}
                      </small>
                    </div>

                    {/* Myéloblastes (%) */}
                    <div className="flex flex-col mb-2 w-[200px]">
                      <label className="label font-semibold">
                        Myéloblastes (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered"
                        placeholder="ex: 0.2"
                        value={
                          excepValues.nfs?.leucocytesEtFormules?.myeloblastes
                            ?.pourcentage || ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              leucocytesEtFormules: {
                                ...prev.nfs.leucocytesEtFormules,
                                myeloblastes: {
                                  ...prev.nfs.leucocytesEtFormules.myeloblastes,
                                  pourcentage: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Réf. % :{' '}
                        {excepValues.nfs?.leucocytesEtFormules?.myeloblastes
                          ?.referencePourcentage || 'N/A'}
                      </small>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-2">
                    {/* Promyélocytes (%) */}
                    <div className="flex flex-col mb-2 w-[200px]">
                      <label className="label font-semibold">
                        Promyélocytes (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered"
                        placeholder="ex: 0.2"
                        value={
                          excepValues.nfs?.leucocytesEtFormules?.promyelocytes
                            ?.pourcentage || ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              leucocytesEtFormules: {
                                ...prev.nfs.leucocytesEtFormules,
                                promyelocytes: {
                                  ...prev.nfs.leucocytesEtFormules
                                    .promyelocytes,
                                  pourcentage: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Réf. % :{' '}
                        {excepValues.nfs?.leucocytesEtFormules?.promyelocytes
                          ?.referencePourcentage || 'N/A'}
                      </small>
                    </div>

                    {/* Myélocytes (%) */}
                    <div className="flex flex-col mb-2 w-[200px]">
                      <label className="label font-semibold">
                        Myélocytes (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered"
                        placeholder="ex: 0.5"
                        value={
                          excepValues.nfs?.leucocytesEtFormules?.myelocytes
                            ?.pourcentage || ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              leucocytesEtFormules: {
                                ...prev.nfs.leucocytesEtFormules,
                                myelocytes: {
                                  ...prev.nfs.leucocytesEtFormules.myelocytes,
                                  pourcentage: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Réf. % :{' '}
                        {excepValues.nfs?.leucocytesEtFormules?.myelocytes
                          ?.referencePourcentage || 'N/A'}
                      </small>
                    </div>

                    {/* Métamyélocytes (%) */}
                    <div className="flex flex-col mb-2 w-[200px]">
                      <label className="label font-semibold">
                        Métamyélocytes (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered"
                        placeholder="ex: 0.2"
                        value={
                          excepValues.nfs?.leucocytesEtFormules?.metamyelocytes
                            ?.pourcentage || ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              leucocytesEtFormules: {
                                ...prev.nfs.leucocytesEtFormules,
                                metamyelocytes: {
                                  ...prev.nfs.leucocytesEtFormules
                                    .metamyelocytes,
                                  pourcentage: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Réf. % :{' '}
                        {excepValues.nfs?.leucocytesEtFormules?.metamyelocytes
                          ?.referencePourcentage || 'N/A'}
                      </small>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-2">
                    {/* Monoblastes (%) */}
                    <div className="flex flex-col mb-2 w-[200px]">
                      <label className="label font-semibold">
                        Monoblastes (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered"
                        placeholder="ex: 0.1"
                        value={
                          excepValues.nfs?.leucocytesEtFormules?.monoblastes
                            ?.pourcentage || ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              leucocytesEtFormules: {
                                ...prev.nfs.leucocytesEtFormules,
                                monoblastes: {
                                  ...prev.nfs.leucocytesEtFormules.monoblastes,
                                  pourcentage: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Réf. % :{' '}
                        {excepValues.nfs?.leucocytesEtFormules?.monoblastes
                          ?.referencePourcentage || 'N/A'}
                      </small>
                    </div>

                    {/* Lymphoblastes (%) */}
                    <div className="flex flex-col mb-2 w-[200px]">
                      <label className="label font-semibold">
                        Lymphoblastes (%)
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="input input-bordered"
                        placeholder="ex: 0.1"
                        value={
                          excepValues.nfs?.leucocytesEtFormules?.lymphoblastes
                            ?.pourcentage || ''
                        }
                        onChange={(e) =>
                          setExcepValues((prev) => ({
                            ...prev,
                            nfs: {
                              ...prev.nfs,
                              leucocytesEtFormules: {
                                ...prev.nfs.leucocytesEtFormules,
                                lymphoblastes: {
                                  ...prev.nfs.leucocytesEtFormules
                                    .lymphoblastes,
                                  pourcentage: e.target.value,
                                },
                              },
                            },
                          }))
                        }
                      />
                      <small>
                        Réf. % :{' '}
                        {excepValues.nfs?.leucocytesEtFormules?.lymphoblastes
                          ?.referencePourcentage || 'N/A'}
                      </small>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ==================== NOUVEAUX PARAMÈTRES CALCULÉS ==================== */}

            {/* ==================== REMPLACEMENTS D'INTERFACE ==================== */}

            {/* ==================== VÉRIFIEZ QUE TOUTES CES CONDITIONS SONT PRÉSENTES ==================== */}

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
                      value={excepValues.psaRapport?.psaLibre?.valeur || ''}
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          psaRapport: {
                            ...prev.psaRapport,
                            psaLibre: {
                              ...prev.psaRapport.psaLibre,
                              valeur: e.target.value,
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
                      value={excepValues.psaRapport?.psaTotal?.valeur || ''}
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          psaRapport: {
                            ...prev.psaRapport,
                            psaTotal: {
                              ...prev.psaRapport.psaTotal,
                              valeur: e.target.value,
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
                      {excepValues.psaRapport?.rapport?.valeur ||
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
                        excepValues.reticulocytes?.pourcentage?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          reticulocytes: {
                            ...prev.reticulocytes,
                            pourcentage: {
                              ...prev.reticulocytes.pourcentage,
                              valeur: e.target.value,
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
                      value={excepValues.reticulocytes?.gbRouges?.valeur || ''}
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          reticulocytes: {
                            ...prev.reticulocytes,
                            gbRouges: {
                              ...prev.reticulocytes.gbRouges,
                              valeur: e.target.value,
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
                        {excepValues.reticulocytes?.valeurAbsolue?.valeur ||
                          'Auto-calculé'}{' '}
                        /µL
                      </div>
                    </div>
                    <div>
                      <label className="label font-semibold text-blue-700">
                        Pourcentage calculé
                      </label>
                      <div className="text-lg font-bold text-blue-800">
                        {excepValues.reticulocytes?.pourcentageCalcule
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
                      value={excepValues.clairanceCreatinine?.age?.valeur || ''}
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          clairanceCreatinine: {
                            ...prev.clairanceCreatinine,
                            age: {
                              ...prev.clairanceCreatinine.age,
                              valeur: e.target.value,
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
                        excepValues.clairanceCreatinine?.poids?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          clairanceCreatinine: {
                            ...prev.clairanceCreatinine,
                            poids: {
                              ...prev.clairanceCreatinine.poids,
                              valeur: e.target.value,
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
                      value={excepValues.clairanceCreatinine?.sexe || ''}
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          clairanceCreatinine: {
                            ...prev.clairanceCreatinine,
                            sexe: e.target.value,
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
                        excepValues.clairanceCreatinine?.creatinineMgL
                          ?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          clairanceCreatinine: {
                            ...prev.clairanceCreatinine,
                            creatinineMgL: {
                              ...prev.clairanceCreatinine.creatinineMgL,
                              valeur: e.target.value,
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
                      {excepValues.clairanceCreatinine?.clairance?.valeur ||
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
                      value={excepValues.dfg?.creatinineMgL?.valeur || ''}
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          dfg: {
                            ...prev.dfg,
                            creatinineMgL: {
                              ...prev.dfg.creatinineMgL,
                              valeur: e.target.value,
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
                      value={excepValues.dfg?.age?.valeur || ''}
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          dfg: {
                            ...prev.dfg,
                            age: { ...prev.dfg.age, valeur: e.target.value },
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
                      value={excepValues.dfg?.sexe || ''}
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          dfg: {
                            ...prev.dfg,
                            sexe: e.target.value,
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
                      {excepValues.dfg?.dfgValue?.valeur || 'Auto-calculé'}{' '}
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
                        excepValues.saturationTransferrine?.ferSerique
                          ?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          saturationTransferrine: {
                            ...prev.saturationTransferrine,
                            ferSerique: {
                              ...prev.saturationTransferrine.ferSerique,
                              valeur: e.target.value,
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
                        excepValues.saturationTransferrine?.transferrine
                          ?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          saturationTransferrine: {
                            ...prev.saturationTransferrine,
                            transferrine: {
                              ...prev.saturationTransferrine.transferrine,
                              valeur: e.target.value,
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
                        {excepValues.saturationTransferrine?.ctff?.valeur ||
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
                        {excepValues.saturationTransferrine?.coefficient
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
                        excepValues.compteAddis?.leucocytesTotaux?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          compteAddis: {
                            ...prev.compteAddis,
                            leucocytesTotaux: {
                              ...prev.compteAddis.leucocytesTotaux,
                              valeur: e.target.value,
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
                        excepValues.compteAddis?.hematiesTotales?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          compteAddis: {
                            ...prev.compteAddis,
                            hematiesTotales: {
                              ...prev.compteAddis.hematiesTotales,
                              valeur: e.target.value,
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
                        excepValues.compteAddis?.dureeRecueil?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          compteAddis: {
                            ...prev.compteAddis,
                            dureeRecueil: {
                              ...prev.compteAddis.dureeRecueil,
                              valeur: e.target.value,
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
                        {excepValues.compteAddis?.leucocytesParMinute?.valeur ||
                          'Auto-calculé'}{' '}
                        éléments/min
                      </div>
                    </div>
                    <div>
                      <label className="label font-semibold text-blue-700">
                        Hématies/minute
                      </label>
                      <div className="text-lg font-bold text-blue-800">
                        {excepValues.compteAddis?.hematiesParMinute?.valeur ||
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
                        excepValues.calciumCorrige?.calciumMesure?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          calciumCorrige: {
                            ...prev.calciumCorrige,
                            calciumMesure: {
                              ...prev.calciumCorrige.calciumMesure,
                              valeur: e.target.value,
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
                      value={excepValues.calciumCorrige?.albumine?.valeur || ''}
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          calciumCorrige: {
                            ...prev.calciumCorrige,
                            albumine: {
                              ...prev.calciumCorrige.albumine,
                              valeur: e.target.value,
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
                      {excepValues.calciumCorrige?.calciumCorrige?.valeur ||
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
                        excepValues.rapportAlbuminurie?.albumineUrinaire
                          ?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          rapportAlbuminurie: {
                            ...prev.rapportAlbuminurie,
                            albumineUrinaire: {
                              ...prev.rapportAlbuminurie.albumineUrinaire,
                              valeur: e.target.value,
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
                        excepValues.rapportAlbuminurie?.creatinineUrinaire
                          ?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          rapportAlbuminurie: {
                            ...prev.rapportAlbuminurie,
                            creatinineUrinaire: {
                              ...prev.rapportAlbuminurie.creatinineUrinaire,
                              valeur: e.target.value,
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
                      {excepValues.rapportAlbuminurie?.rapport?.valeur ||
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
                        excepValues.rapportProteines?.proteinesUrinaires
                          ?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          rapportProteines: {
                            ...prev.rapportProteines,
                            proteinesUrinaires: {
                              ...prev.rapportProteines.proteinesUrinaires,
                              valeur: e.target.value,
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
                        excepValues.rapportProteines?.creatinineUrinaire
                          ?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          rapportProteines: {
                            ...prev.rapportProteines,
                            creatinineUrinaire: {
                              ...prev.rapportProteines.creatinineUrinaire,
                              valeur: e.target.value,
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
                      {excepValues.rapportProteines?.rapport?.valeur ||
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
                        excepValues.cholesterolLdl?.cholesterolTotal?.valeur ||
                        ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          cholesterolLdl: {
                            ...prev.cholesterolLdl,
                            cholesterolTotal: {
                              ...prev.cholesterolLdl.cholesterolTotal,
                              valeur: e.target.value,
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
                      value={excepValues.cholesterolLdl?.hdl?.valeur || ''}
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          cholesterolLdl: {
                            ...prev.cholesterolLdl,
                            hdl: {
                              ...prev.cholesterolLdl.hdl,
                              valeur: e.target.value,
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
                        excepValues.cholesterolLdl?.triglycerides?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          cholesterolLdl: {
                            ...prev.cholesterolLdl,
                            triglycerides: {
                              ...prev.cholesterolLdl.triglycerides,
                              valeur: e.target.value,
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
                      {excepValues.cholesterolLdl?.ldl?.valeur ||
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
                        excepValues.lipidesTotaux?.cholesterolTotal?.valeur ||
                        ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          lipidesTotaux: {
                            ...prev.lipidesTotaux,
                            cholesterolTotal: {
                              ...prev.lipidesTotaux.cholesterolTotal,
                              valeur: e.target.value,
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
                        excepValues.lipidesTotaux?.triglycerides?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          lipidesTotaux: {
                            ...prev.lipidesTotaux,
                            triglycerides: {
                              ...prev.lipidesTotaux.triglycerides,
                              valeur: e.target.value,
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
                        excepValues.lipidesTotaux?.phospholipides?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          lipidesTotaux: {
                            ...prev.lipidesTotaux,
                            phospholipides: {
                              ...prev.lipidesTotaux.phospholipides,
                              valeur: e.target.value,
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
                      {excepValues.lipidesTotaux?.lipidesTotaux?.valeur ||
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
                        excepValues.microalbuminurie24h?.albumineUrinaire
                          ?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          microalbuminurie24h: {
                            ...prev.microalbuminurie24h,
                            albumineUrinaire: {
                              ...prev.microalbuminurie24h.albumineUrinaire,
                              valeur: e.target.value,
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
                        excepValues.microalbuminurie24h?.volumeUrinaire24h
                          ?.valeur || ''
                      }
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        if (value >= 0 && value <= 10) {
                          setExcepValues((prev) => ({
                            ...prev,
                            microalbuminurie24h: {
                              ...prev.microalbuminurie24h,
                              volumeUrinaire24h: {
                                ...prev.microalbuminurie24h.volumeUrinaire24h,
                                valeur: e.target.value,
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
                      {excepValues.microalbuminurie24h?.microalbuminurie
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
                        excepValues.proteinurie24h?.proteinesUrinaires
                          ?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          proteinurie24h: {
                            ...prev.proteinurie24h,
                            proteinesUrinaires: {
                              ...prev.proteinurie24h.proteinesUrinaires,
                              valeur: e.target.value,
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
                        excepValues.proteinurie24h?.volumeUrinaire24h?.valeur ||
                        ''
                      }
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        if (value >= 0 && value <= 10) {
                          setExcepValues((prev) => ({
                            ...prev,
                            proteinurie24h: {
                              ...prev.proteinurie24h,
                              volumeUrinaire24h: {
                                ...prev.proteinurie24h.volumeUrinaire24h,
                                valeur: e.target.value,
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
                      {excepValues.proteinurie24h?.proteinurie?.valeur ||
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
                        excepValues.bilirubineIndirecte?.bilirubineTotale
                          ?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          bilirubineIndirecte: {
                            ...prev.bilirubineIndirecte,
                            bilirubineTotale: {
                              ...prev.bilirubineIndirecte.bilirubineTotale,
                              valeur: e.target.value,
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
                        excepValues.bilirubineIndirecte?.bilirubineDirecte
                          ?.valeur || ''
                      }
                      onChange={(e) =>
                        setExcepValues((prev) => ({
                          ...prev,
                          bilirubineIndirecte: {
                            ...prev.bilirubineIndirecte,
                            bilirubineDirecte: {
                              ...prev.bilirubineIndirecte.bilirubineDirecte,
                              valeur: e.target.value,
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
                      {excepValues.bilirubineIndirecte?.bilirubineIndirecte
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

            {/* ==================== FIN DES NOUVEAUX PARAMÈTRES ==================== */}

            
          </div>
        )}

        {currentView === 'complexe' && (
          <div id="complexe">
            {/* macroscopie */}
            <div>
              <label className="label">Observations Macroscopiques:</label>
              <select
                className="select select-bordered w-full max-w-xs"
                onChange={(e) => handleMacroscopiqueAddition(e.target.value)}
                defaultValue=""
              >
                <option disabled value="">
                  Sélectionner une observation
                </option>
                <option value="Claires">Claires</option>
                <option value="Légèrement troubles">Légèrement troubles</option>
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
              </select>
              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(macroscopique) &&
                  macroscopique.map((item, index) => (
                    <div
                      key={index}
                      className="badge badge-primary badge-outline"
                    >
                      {item}
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="ml-2 cursor-pointer"
                        onClick={() => handleMacroscopiqueRemoval(index)}
                      />
                    </div>
                  ))}
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
                    value={microscopique.leucocytes}
                    onChange={(e) =>
                      handleMicroscopiqueChange('leucocytes', e.target.value)
                    }
                    className="input input-bordered"
                  />
                </div>

                <div>
                  <label className="label">Hématies</label>
                  <input
                    type="text"
                    value={microscopique.hematies}
                    onChange={(e) =>
                      handleMicroscopiqueChange('hematies', e.target.value)
                    }
                    className="input input-bordered"
                  />
                </div>
                <div>
                  <label className="label">Unité de mesure</label>
                  <select
                    className="select select-bordered"
                    value={microscopique.unite}
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
                    value={microscopique.ph}
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
                    value={microscopique.cristaux}
                    onChange={(e) => {
                      handleMicroscopiqueChange('cristaux', e.target.value)
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
                      handleDetailAddition('cristauxDetails', e.target.value)
                    }
                    defaultValue=""
                    disabled={
                      microscopique.cristaux === '' ||
                      microscopique.cristaux === 'Non concerner'
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
                    {microscopique.cristauxDetails &&
                      microscopique.cristauxDetails.map((detail, index) => (
                        <div
                          key={index}
                          className="badge badge-primary badge-outline w-full"
                        >
                          {detail}
                          <FontAwesomeIcon
                            icon={faTimes}
                            className="ml-2 cursor-pointer"
                            onClick={() =>
                              handleDetailRemoval('cristauxDetails', index)
                            }
                          />
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <label className="label">Parasites</label>
                  <select
                    className="select select-bordered"
                    value={microscopique.parasites}
                    onChange={(e) => {
                      handleMicroscopiqueChange('parasites', e.target.value)
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
                      handleDetailAddition('parasitesDetails', e.target.value)
                    }
                    defaultValue=""
                    disabled={
                      microscopique.parasites === '' ||
                      microscopique.parasites === 'Non concerner'
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
                    {microscopique.parasitesDetails &&
                      microscopique.parasitesDetails.map((detail, index) => (
                        <div
                          key={index}
                          className="badge badge-primary badge-outline w-full"
                        >
                          {detail}
                          <FontAwesomeIcon
                            icon={faTimes}
                            className="ml-2 cursor-pointer"
                            onClick={() =>
                              handleDetailRemoval('parasitesDetails', index)
                            }
                          />
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Cellules épithéliales</label>
                <select
                  className="select select-bordered"
                  value={microscopique.cellulesEpitheliales}
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
                  value={microscopique.elementsLevuriforme}
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
                  value={microscopique.filamentsMyceliens}
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
                  value={microscopique.trichomonasVaginalis}
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
                  value={microscopique.cylindres}
                  onChange={(e) =>
                    handleMicroscopiqueChange('cylindres', e.target.value)
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
                  value={microscopique.oeufsDeBilharzies}
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
                  value={microscopique.clueCells}
                  onChange={(e) =>
                    handleMicroscopiqueChange('clueCells', e.target.value)
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
                  value={microscopique.gardnerellaVaginalis}
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
                  value={microscopique.bacillesDeDoderlein}
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
                  value={microscopique.typeDeFlore}
                  onChange={(e) =>
                    handleMicroscopiqueChange('typeDeFlore', e.target.value)
                  }
                >
                  <option value="">Non concerner</option>
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                  <option value="équilibrée">équilibrée</option>
                  <option value="deséquilibrée">deséquilibrée</option>
                </select>
              </div>
              <div>
                <label className="label">Recherche de Streptocoque B</label>
                <select
                  className="select select-bordered"
                  value={microscopique.rechercheDeStreptocoqueB}
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
                  value={microscopique.monocytes}
                  onChange={(e) =>
                    handleMicroscopiqueChange('monocytes', e.target.value)
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
                  value={microscopique.polynucleairesNeutrophilesAlterees}
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
                  value={microscopique.polynucleairesNeutrophilesNonAlterees}
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
                  value={microscopique.eosinophiles}
                  onChange={(e) =>
                    handleMicroscopiqueChange('eosinophiles', e.target.value)
                  }
                />
              </div>

              <div>
                <label className="label">Basophiles</label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={microscopique.basophiles}
                  onChange={(e) =>
                    handleMicroscopiqueChange('basophiles', e.target.value)
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
                    value={chimie.proteinesTotales}
                    onChange={(e) =>
                      handleChimieChange('proteinesTotales', e.target.value)
                    }
                    className="input input-bordered"
                  />
                </div>

                <div>
                  <label className="label">Protéinorachie</label>
                  <input
                    type="text"
                    value={chimie.proteinesArochies}
                    onChange={(e) =>
                      handleChimieChange('proteinesArochies', e.target.value)
                    }
                    className="input input-bordered"
                  />
                </div>

                <div>
                  <label className="label">glycorachie</label>
                  <input
                    type="text"
                    className="input input-bordered"
                    value={chimie.glycorachie}
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
                    value={chimie.acideUrique}
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
                    value={chimie.LDH}
                    onChange={(e) => handleChimieChange('LDH', e.target.value)}
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
                  value={culture.description}
                  onChange={(e) =>
                    handleCultureChange('description', e.target.value)
                  }
                  className="select select-bordered"
                >
                  <option value="">Sélectionner une concentration</option>
                  <option value="DGU < 1000/ml">DGU &lt; 1000/ml</option>
                  <option value="DGU > 1000/ml">DGU &gt; 1000/ml</option>
                  <option value="DGU > 10.000/ml">DGU &gt; 10.000/ml</option>
                  <option value="DGU > 100.000/ml">DGU &gt; 100.000/ml</option>
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
                  value={culture.culture} // Assurez-vous que l'état culture contient un champ culture initialisé correctement
                  onChange={(e) =>
                    handleCultureChange('culture', e.target.value)
                  }
                  className="select select-bordered"
                >
                  <option value="">Sélectionner un état</option>
                  <option value="Negatives">Négatives</option>
                  <option value="Positives">Positives</option>
                  <option value="Non contributives">Non contributives</option>
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
                {Array.isArray(culture.germeIdentifie) &&
                  culture.germeIdentifie.map((germe) => (
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
                        onClick={(e) => handleAddAntibiogramme(e, germe.nom)}
                      >
                        Ajouter Antibio
                      </button>
                    </div>
                  ))}
              </div>

              {Array.isArray(culture.germeIdentifie) &&
                culture.germeIdentifie.map((germe) => (
                  <div key={germe.nom}>
                    <h4>{germe.nom} - Antibio</h4>
                    {antibiogrammes[germe.nom] && // Assurez-vous que antibiogrammes utilise la clé `nom` du germe
                      antibiogrammes[germe.nom].map((antibio, index) => (
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
                              <option key={antibiotic} value={antibiotic}>
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
                              handleRemoveAntibiogramme(germe.nom, index)
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                  </div>
                ))}
            </div>
            <div className="divider"></div>

            {/* Gram */}
            <div>
              <label className="label">Gram</label>
              <select
                className="select select-bordered"
                value={gram}
                onChange={(e) => setGram(e.target.value)}
              >
                <option value="">Sélectionner un type de Gram</option>
                <option value="Bacilles Gram négatif">
                  Bacilles Gram négatif
                </option>
                <option value="Bacilles Gram positif">
                  Bacilles Gram positif
                </option>
                <option value="Cocci Gram négatif">Cocci Gram négatif</option>
                <option value="Cocci Gram positif">Cocci Gram positif</option>
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
                  value={rechercheChlamydia.naturePrelevement}
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
                    rechercheChlamydia.rechercheAntigeneChlamydiaTrochomatis
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
                  value={rechercheMycoplasmes.naturePrelevement}
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
                  value={rechercheMycoplasmes.rechercheUreaplasmaUrealyticum}
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
                <label className="label">Recherche de Mycoplasma hominis</label>
                <select
                  className="select select-bordered"
                  value={rechercheMycoplasmes.rechercheMycoplasmaHominis}
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
                disabled={!testId} // Désactivez le select si aucun test n'est sélectionné
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
        )}

        <div className="mt-4">
          <label>Conclusion</label>
          <select
            className="select select-bordered w-[250px] "
            value={selectedConclusion}
            onChange={(e) => setSelectedConclusion(e.target.value)}
            disabled={!testId} // Désactivez le select si aucun test n'est sélectionné
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

        <div>
          <label className="label">Remarque</label>
          <textarea
            value={remarque}
            onChange={(e) => setRemarque(e.target.value)}
            className="textarea textarea-bordered"
          ></textarea>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        ) : (
          <button type="submit" className="btn btn-primary mt-4">
            Ajouter le résultat
          </button>
        )}
      </form>
    </>
  )
}

AddResultatForm.propTypes = {
  analyseId: PropTypes.string.isRequired,
  patientId: PropTypes.string.isRequired,
  onResultatChange: PropTypes.func.isRequired,
}

export default AddResultatForm
