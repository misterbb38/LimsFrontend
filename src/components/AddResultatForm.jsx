// import { useState, useEffect } from 'react'
// import PropTypes from 'prop-types'

// function AddResultatForm({ analyseId, patientId, onResultatChange }) {
//   const [testId, setTestId] = useState('')
//   const [valeur, setValeur] = useState('')
//   const [methode, setMethode] = useState('')
//   const [machineA, setMachineA] = useState('')
//   const [machineB, setMachineB] = useState('')

//   const [statutInterpretation, setStatutInterpretation] = useState(false)
//   const [statutMachine, setStatutMachine] = useState(false)
//   const [typePrelevement, setTypePrelevement] = useState('')
//   const [datePrelevement, setDatePrelevement] = useState('')
//   const [tests, setTests] = useState([]) // Stocker les tests de l'ana
//   const [remarque, setRemarque] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const [showToast, setShowToast] = useState(false)
//   const [toastMessage, setToastMessage] = useState('')
//   const [isSuccess, setIsSuccess] = useState(true)

//   const [antibiogrammes, setAntibiogrammes] = useState([])
//   const [antibiotiques, setAntibiotiques] = useState([
//     'Amoxicilline',
//     'Ciprofloxacine',
//     'Doxycycline', // Exemple d'antibiotiques
//   ])

//   const [macroscopique, setMacroscopique] = useState('')
//   const [microscopique, setMicroscopique] = useState({
//     leucocytes: 'Absence',
//     hematies: 'Absence',
//     cellulesEpitheliales: 'Absence',
//     elementsLevuriforme: 'Absence',
//     filamentsMyceliens: 'Absence',
//     trichomonasVaginalis: 'Absence',
//     cristaux: 'Absence',
//     cylindres: 'Absence',
//   })

//   const [culture, setCulture] = useState({
//     description: '',
//     germeIdentifie: '',
//   })
//   const [gram, setGram] = useState('Non effectué')
//   const [conclusion, setConclusion] = useState('')

//   const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
//   const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
//   const token = userInfo?.token
//   const updatedBy = userInfo?._id // Assuming the user's ID is stored in the userInfo

//   useEffect(() => {
//     if (analyseId) {
//       fetchTests(analyseId)
//     }
//   }, [analyseId])

//   useEffect(() => {
//     const selectedTest = tests.find((test) => test._id === testId)
//     if (selectedTest) {
//       console.log('Selected test:', selectedTest)
//       setMachineA(selectedTest.machineA || 'pas de machine A ') // Utilisez une valeur par défaut pour voir si le problème vient des données
//       setMachineB(selectedTest.machineB || 'Pas de machine B ')
//     }
//   }, [testId, tests])

//   const fetchTests = async (analyseId) => {
//     try {
//       const response = await fetch(`${apiUrl}/api/analyse/${analyseId}/tests`, {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//       })
//       const data = await response.json()
//       console.log('Tests data:', data.data)
//       if (data.success) {
//         setTests(data.data)
//       }
//     } catch (error) {
//       console.error('Erreur lors de la récupération des tests:', error)
//     }
//   }

//   const handleAddAntibiogramme = () => {
//     setAntibiogrammes([
//       ...antibiogrammes,
//       { antibiotique: '', sensibilite: '' },
//     ])
//   }

//   const handleUpdateAntibiogramme = (index, field, value) => {
//     const updated = antibiogrammes.map((item, idx) => {
//       if (idx === index) {
//         return { ...item, [field]: value }
//       }
//       return item
//     })
//     setAntibiogrammes(updated)
//   }
//   const handleRemoveAntibiogramme = (index) => {
//     setAntibiogrammes(antibiogrammes.filter((_, idx) => idx !== index))
//   }

//   const handleMicroscopiqueChange = (field, value) => {
//     setMicroscopique((prev) => ({ ...prev, [field]: value }))
//   }

//   const handleCultureChange = (field, value) => {
//     setCulture((prev) => ({ ...prev, [field]: value }))
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setIsLoading(true)

//     const observations = {
//       macroscopique,
//       microscopique,
//       antibiogrammes: antibiogrammes.map((ab) => ({
//         antibiotique: ab.antibiotique,
//         sensibilite: ab.sensibilite,
//       })),
//     }

//     try {
//       const response = await fetch(`${apiUrl}/api/resultats/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           analyseId,
//           testId,
//           patientId,
//           valeur,
//           methode,
//           machineA,
//           machineB,
//           statutMachine,
//           statutInterpretation,
//           typePrelevement,
//           datePrelevement: datePrelevement || null,
//           remarque,
//           updatedBy,
//           observations,
//           culture,
//           gram,
//           conclusion,
//         }),
//       })

//       if (response.ok) {
//         const data = await response.json()
//         setToastMessage('Résultat ajouté avec succès')
//         setIsSuccess(true)
//         onResultatChange()
//         resetForm()
//       } else {
//         const errorData = await response.json()
//         setToastMessage(errorData.message || "Échec de l'ajout du résultat")
//         setIsSuccess(false)
//       }
//     } catch (error) {
//       setToastMessage("Erreur lors de l'envoi du formulaire : " + error.message)
//       setIsSuccess(false)
//     } finally {
//       setIsLoading(false)
//       setShowToast(true)
//       setTimeout(() => setShowToast(false), 3000)
//     }
//   }

//   const resetForm = () => {
//     setTestId('')
//     setValeur('')
//     setMethode('')
//     setMachineA('')
//     setMachineB('')
//     setStatutMachine(false)
//     setStatutInterpretation(false)
//     setTypePrelevement('')
//     setDatePrelevement('')
//     setRemarque('')
//     setAntibiogrammes([])
//     setMacroscopique('')
//     setMicroscopique({
//       leucocytes: 'Absence',
//       hematies: 'Absence',
//       cellulesEpitheliales: 'Absence',
//       elementsLevuriforme: 'Absence',
//       filamentsMyceliens: 'Absence',
//       trichomonasVaginalis: 'Absence',
//       cristaux: 'Absence',
//       cylindres: 'Absence',
//     })
//     setCulture({
//       description: '',
//       germeIdentifie: '',
//     })
//     setGram('Non effectué')
//     setConclusion('')
//   }

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

function AddResultatForm({ analyseId, patientId, onResultatChange }) {
  const [testId, setTestId] = useState('')
  const [valeur, setValeur] = useState('')
  const [methode, setMethode] = useState('')
  const [machineA, setMachineA] = useState('')
  const [machineB, setMachineB] = useState('')

  const [statutInterpretation, setStatutInterpretation] = useState(false)
  const [statutMachine, setStatutMachine] = useState(false)
  const [typePrelevement, setTypePrelevement] = useState('')
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

  const [macroscopique, setMacroscopique] = useState('')
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
    germeIdentifie: '',
    culture: '',
  })
  const [gram, setGram] = useState('')
  const [conclusion, setConclusion] = useState('')

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

  const handleAddAntibiogramme = (e) => {
    e.preventDefault() // Prevent form submission when adding antibiogram
    if (antibiogrammes.length < antibiotiques.length) {
      setAntibiogrammes([
        ...antibiogrammes,
        { antibiotique: '', sensibilite: '' },
      ])
    }
  }

  const handleUpdateAntibiogramme = (index, field, value) => {
    const updated = antibiogrammes.map((item, idx) =>
      idx === index ? { ...item, [field]: value } : item
    )
    setAntibiogrammes(updated)
  }

  const handleRemoveAntibiogramme = (index) => {
    setAntibiogrammes(antibiogrammes.filter((_, idx) => idx !== index))
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
  ]

  const isPredefined = predefinedGerms.includes(culture.germeIdentifie)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Assurez-vous que les antibiogrammes sont correctement formattés
    const formattedAntibiogrammes = antibiogrammes.reduce((acc, curr) => {
      if (curr.antibiotique && curr.sensibilite) {
        acc[curr.antibiotique] = curr.sensibilite
      }
      return acc
    }, {})

    let observations = {
      macroscopique: currentView === 'complexe' ? macroscopique : undefined,
      microscopique: currentView === 'complexe' ? microscopique : undefined,
      chimie: currentView === 'complexe' ? chimie : undefined,
      rechercheChlamydia:
        currentView === 'complexe' ? rechercheChlamydia : undefined,
      rechercheMycoplasmes:
        currentView === 'complexe' ? rechercheMycoplasmes : undefined,
      antibiogramme:
        currentView === 'complexe'
          ? antibiogrammes.reduce((acc, curr) => {
              if (curr.antibiotique && curr.sensibilite) {
                acc[curr.antibiotique] = curr.sensibilite
              }
              return acc
            }, {})
          : undefined,
    }

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
        lieuPrelevement,
        datePrelevement: datePrelevement || null,
        remarque,
        updatedBy,
        observations,
        culture: currentView === 'complexe' ? culture : undefined,
        gram: currentView === 'complexe' ? gram : undefined,
        conclusion: currentView === 'complexe' ? conclusion : undefined,
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
    setLieuPrelevement('')
    setDatePrelevement('')
    setRemarque('')
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
      germeIdentifie: '',
    })
    setGram('Non effectué')
    setConclusion('')
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
          <label className="label">TestId</label>
          <select
            className="select select-bordered w-full max-w-xs"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            required
          >
            <option value="">Sélectionner un test</option>
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
              <option value="Uretral">Urétal</option>
              <option value="Sperme">Sperme</option>
              <option value="Vulve">Vulve</option>
              <option value="Pus">Pus</option>
              <option value="Culot urinaire">Culot urinaire</option>
              <option value="Soude urinaire">Sonde urinaire</option>
              <option value="Amydales">Amygdales</option>
              <option value="LCR">LCR</option>
              <option value="Ascite">Ascite</option>
              <option value="Pleural">Pleural</option>
              <option value="Articulaire">Articulaire</option>
              <option value="Sang">Sang</option>
              <option value="Seringue">Seringue</option>
              <option value="Ballon">Ballon</option>
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
              value={datePrelevement}
              onChange={(e) => setDatePrelevement(e.target.value)}
              className="input input-bordered"
            />
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

        {currentView === 'simple' && (
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
                <option value="true">A</option>
                <option value="false">B</option>
              </select>
            </div>

            {/* <div>
              <label className="label">Methode</label>
              <input
                type="text"
                value={methode}
                onChange={(e) => setMethode(e.target.value)}
                className="input input-bordered"
              />
            </div> */}
          </div>
        )}

        {currentView === 'complexe' && (
          <div id="complexe">
            {/* macroscopie */}
            <div>
              <label className="label">Macroscopique</label>
              <select
                className="select select-bordered"
                value={macroscopique}
                onChange={(e) => setMacroscopique(e.target.value)}
              >
                <option value="">Sélectionner un état</option>
                <option value="Claires">Claires</option>
                <option value="Legerement troubles">Légèrement troubles</option>
                <option value="Troubles">Troubles</option>
                <option value="Abondantes">Abondantes</option>
                <option value="Peu abondantes">Peu abondantes</option>
                <option value="Fetides">Fétides</option>
                <option value="Peu fetides">Peu fétides</option>
                <option value="Tres fetides">Très fétides</option>
                <option value="Laiteuses">Laiteuses</option>
                <option value="Epaisses">Épaisses</option>
                <option value="Lies">Lies</option>
                <option value="Non lie">Non lié</option>
                <option value="Ospalescent">Opalescent</option>
                <option value="Irrite">Irrité</option>
                <option value="Verdates">Verdâtres</option>
                <option value="Dures">Dures</option>
                <option value="Brunatres">Brunâtres</option>
                <option value="Molles">Molles</option>
                <option value="Odorantes">Odorantes</option>
              </select>
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

              <div>
                <label className="label">Cristaux</label>
                <select
                  className="select select-bordered"
                  value={microscopique.cristaux}
                  onChange={(e) =>
                    handleMicroscopiqueChange('cristaux', e.target.value)
                  }
                >
                  <option value="">Non concerner</option>
                  <option value="Absence">Absence</option>
                  <option value="Présence">Présence</option>
                </select>
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
                <label className="label">Parasites</label>
                <select
                  className="select select-bordered"
                  value={microscopique.parasites}
                  onChange={(e) =>
                    handleMicroscopiqueChange('parasites', e.target.value)
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
                  <option value="III">IV</option>
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
                  <label className="label">proteinesArochies</label>
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
                <div>
                  <label className="label">
                    Culture: Germe Identifié - Sélection
                  </label>
                  <select
                    value={isPredefined ? culture.germeIdentifie : ''}
                    onChange={(e) =>
                      handleCultureChange('germeIdentifie', e.target.value)
                    }
                    className="select select-bordered"
                    disabled={!isPredefined && culture.germeIdentifie !== ''}
                  >
                    <option value="">Sélectionner un germe</option>
                    {predefinedGerms.map((germe) => (
                      <option key={germe} value={germe}>
                        {germe}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">
                    Culture: Germe Identifié - Saisie manuelle
                  </label>
                  <input
                    type="text"
                    value={!isPredefined ? culture.germeIdentifie : ''}
                    onChange={(e) =>
                      handleCultureChange('germeIdentifie', e.target.value)
                    }
                    className="input input-bordered"
                    disabled={isPredefined}
                  />
                </div>
              </div>
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
                  <option value="uretral">Urétal</option>
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
                  <option value="uretral">Urétal</option>
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
              <label className="label">Conclusion</label>
              <select
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                className="select select-bordered"
              >
                <option value="">Sélectionner une conclusion</option>
                <option value="Conclusion 1">Conclusion 1</option>
                <option value="Conclusion 2">Conclusion 2</option>
                <option value="Conclusion 3">Conclusion 3</option>
                <option value="Conclusion 4">Conclusion 4</option>
              </select>
            </div>
            {/* antibiogramme */}
            <div>
              {/* essai */}
              <label className="label">Antibiogrammes</label>
              {antibiogrammes.map((antibio, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <select
                    className="select select-bordered"
                    value={antibio.antibiotique}
                    onChange={(e) =>
                      handleUpdateAntibiogramme(
                        index,
                        'antibiotique',
                        e.target.value
                      )
                    }
                  >
                    <option value="">Sélectionner un antibiotique</option>
                    {antibiotiques.map((antibiotique) => (
                      <option key={antibiotique} value={antibiotique}>
                        {antibiotique}
                      </option>
                    ))}
                  </select>
                  <select
                    className="select select-bordered"
                    value={antibio.sensibilite}
                    onChange={(e) =>
                      handleUpdateAntibiogramme(
                        index,
                        'sensibilite',
                        e.target.value
                      )
                    }
                  >
                    <option value="">Aucun</option>
                    <option value="S">Sensible</option>
                    <option value="I">Intermédiaire</option>
                    <option value="R">Résistant</option>
                  </select>
                  <button
                    className="btn btn-error btn-xs"
                    onClick={() => handleRemoveAntibiogramme(index)}
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              <button
                className="btn btn-primary btn-sm"
                onClick={handleAddAntibiogramme}
              >
                Ajouter un antibiogramme
              </button>
            </div>

            {/* Répétez pour chaque champ microscopique */}
          </div>
        )}

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
