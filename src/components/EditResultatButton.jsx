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
    exceptions: {
      groupeSanguin: {
        abo: '', // A, B, AB, O
        rhesus: '', // Positif ou Négatif
      },
      qbc: {
        positivite: '', // "Positif"/"Négatif"
        nombreCroix: 0, // 0 à 4
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
      },
    },
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTestCategory, setSelectedTestCategory] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

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
