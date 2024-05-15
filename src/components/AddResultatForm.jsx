// import { useState, useEffect } from 'react'
// import PropTypes from 'prop-types'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faTimes } from '@fortawesome/free-solid-svg-icons'

// function AddResultatForm({ analyseId, patientId, onResultatChange }) {
//   const [testId, setTestId] = useState('')
//   const [valeur, setValeur] = useState('')
//   const [methode, setMethode] = useState('')
//   const [machineA, setMachineA] = useState('')
//   const [machineB, setMachineB] = useState('')

//   const [statutInterpretation, setStatutInterpretation] = useState(false)
//   const [statutMachine, setStatutMachine] = useState(false)
//   const [typePrelevement, setTypePrelevement] = useState('')
//   const [lieuPrelevement, setLieuPrelevement] = useState('')
//   const [datePrelevement, setDatePrelevement] = useState('')
//   const [tests, setTests] = useState([])
//   const [remarque, setRemarque] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const [showToast, setShowToast] = useState(false)
//   const [toastMessage, setToastMessage] = useState('')
//   const [isSuccess, setIsSuccess] = useState(true)

//   const [antibiogrammes, setAntibiogrammes] = useState([])
//   const [antibiotiques, setAntibiotiques] = useState([
//     'Ampicilline',
//     'Amoxicilline + Acide Clavulanique',
//     'Ticarcilline',
//     'Pipéracilline',
//     'Pipéracilline + Tazobactam',
//     'Céfalotine',
//     'Céfixime',
//     'Céfoxitine',
//     'Ceftazidime',
//     'Céfotaxime',
//     'Céfuroxime axetyl',
//     'Céfépime',
//     'Imipénème',
//     'Gentamicine',
//     'Tobramycine',
//     'Amikacine',
//     'Acide Nalidixique',
//     'Norfloxacine',
//     'Ofloxacine',
//     'Ciprofloxacine',
//     'Lévofloxacine',
//     'Fosfomycine',
//     'Cotrimoxazole',
//     'Nitrofurantoine',
//     'Pénicilline',
//     'Oxacilline',
//     'Kanamycine',
//     'Erythromycine',
//     'Lincomycine',
//     'Clindamycine',
//     'Pristinamycine',
//     'Quinupristine-Dalfopristine',
//     'Tétracycline',
//     'Minocycline',
//     'Linézolide',
//     'Acide Fusidique',
//     'Rifampicine',
//     'Vancomycine',
//     'Teicoplanine',
//   ])

//   const [macroscopique, setMacroscopique] = useState([])
//   const [microscopique, setMicroscopique] = useState({
//     leucocytes: '',
//     hematies: '',
//     cellulesEpitheliales: '',
//     elementsLevuriforme: '',
//     filamentsMyceliens: '',
//     trichomonasVaginalis: '',
//     cristaux: '',
//     cylindres: '',
//     parasites: '',
//     parasitesDetails: [],
//     cristauxDetails: [],
//     trichomonasIntestinales: '',
//     oeufsDeBilharzies: '',
//     clueCells: '',
//     gardnerellaVaginalis: '',
//     bacillesDeDoderlein: '',
//     typeDeFlore: '',
//     ph: '',
//     rechercheDeStreptocoqueB: '',
//     monocytes: '',
//     polynucleairesNeutrophilesAlterees: '',
//     polynucleairesNeutrophilesNonAlterees: '',
//     eosinophiles: '',
//     basophiles: '',
//   })

//   const [chimie, setChimie] = useState({
//     proteinesTotales: '',
//     proteinesArochies: '',
//     glycorachie: '',
//     acideUrique: '',
//     LDH: '',
//   })

//   // Déclaration de l'état pour la recherche de chlamydia
//   const [rechercheChlamydia, setRechercheChlamydia] = useState({
//     naturePrelevement: '',
//     rechercheAntigeneChlamydiaTrochomatis: '',
//   })

//   // Déclaration de l'état pour la recherche de mycoplasmes
//   const [rechercheMycoplasmes, setRechercheMycoplasmes] = useState({
//     naturePrelevement: '',
//     rechercheUreaplasmaUrealyticum: '',
//     rechercheMycoplasmaHominis: '',
//   })

//   const [culture, setCulture] = useState({
//     description: '',
//     germeIdentifie: [],
//     culture: '',
//   })
//   const [gram, setGram] = useState('')
//   const [conclusion, setConclusion] = useState('')

//   const [currentView, setCurrentView] = useState('simple') // État pour contrôler la vue active

//   const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
//   const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
//   const token = userInfo?.token
//   const updatedBy = userInfo?._id

//   useEffect(() => {
//     if (analyseId) {
//       fetchTests(analyseId)
//     }
//   }, [analyseId])

//   useEffect(() => {
//     const selectedTest = tests.find((test) => test._id === testId)
//     if (selectedTest) {
//       console.log('Selected test:', selectedTest)
//       setMachineA(selectedTest.machineA || 'pas de machine A')
//       setMachineB(selectedTest.machineB || 'Pas de machine B')
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
//       if (data.success) {
//         setTests(data.data)
//       }
//     } catch (error) {
//       console.error('Erreur lors de la récupération des tests:', error)
//     }
//   }

//   // const handleAddAntibiogramme = (e) => {
//   //   e.preventDefault() // Prevent form submission when adding antibiogram
//   //   if (antibiogrammes.length < antibiotiques.length) {
//   //     setAntibiogrammes([
//   //       ...antibiogrammes,
//   //       { antibiotique: '', sensibilite: '' },
//   //     ])
//   //   }
//   // }

//   // const handleUpdateAntibiogramme = (index, field, value) => {
//   //   const updated = antibiogrammes.map((item, idx) =>
//   //     idx === index ? { ...item, [field]: value } : item
//   //   )
//   //   setAntibiogrammes(updated)
//   // }

//   // const handleRemoveAntibiogramme = (index) => {
//   //   setAntibiogrammes(antibiogrammes.filter((_, idx) => idx !== index))
//   // }

//   const handleMicroscopiqueChange = (field, value) => {
//     setMicroscopique((prev) => ({ ...prev, [field]: value }))
//   }

//   const handleChimieChange = (field, value) => {
//     setChimie((prev) => ({ ...prev, [field]: value }))
//   }

//   const handleRechercheChlamydiaChange = (field, value) => {
//     setRechercheChlamydia((prev) => ({ ...prev, [field]: value }))
//   }

//   const handleRechercheMycoplasmesChange = (field, value) => {
//     setRechercheMycoplasmes((prev) => ({ ...prev, [field]: value }))
//   }

//   const handleCultureChange = (field, value) => {
//     setCulture((prev) => ({ ...prev, [field]: value }))
//   }

//   const antibioticsList = [
//     'Ampicilline',
//     'Amoxicilline + Acide Clavulanique',
//     'Ticarcilline',
//     'Pipéracilline',
//     'Pipéracilline + Tazobactam',
//     'Céfalotine',
//     'Céfixime',
//     'Céfoxitine',
//     'Ceftazidime',
//     'Céfotaxime',
//     'Céfuroxime axetyl',
//     'Céfépime',
//     'Imipénème',
//     'Gentamicine',
//     'Tobramycine',
//     'Amikacine',
//     'Acide Nalidixique',
//     'Norfloxacine',
//     'Ofloxacine',
//     'Ciprofloxacine',
//     'Lévofloxacine',
//     'Fosfomycine',
//     'Cotrimoxazole',
//     'Nitrofurantoine',
//     'Pénicilline',
//     'Oxacilline',
//     'Kanamycine',
//     'Erythromycine',
//     'Lincomycine',
//     'Clindamycine',
//     'Pristinamycine',
//     'Quinupristine-Dalfopristine',
//     'Tétracycline',
//     'Minocycline',
//     'Linézolide',
//     'Acide Fusidique',
//     'Rifampicine',
//     'Vancomycine',
//     'Teicoplanine',
//   ]

//   // Détecter si la valeur actuelle de germeIdentifie est parmi les options prédéfinies
//   const predefinedGerms = [
//     'Escherichia coli',
//     'Klebsiella pneumoniae ssp pneumoniae',
//     'Streptococcus agalactiae',
//     'Candida albicans',
//     'Gardnerella vaginalis',
//     'Candida spp',
//     'Candida kefyr',
//     'Mobiluncus spp',
//     'Ureaplasma urealyticum',
//     'Mycoplasma hominis',
//     'Chlamydiae trachomatis',
//     'Staphylococcus aureus',
//     'Klebsiella oxytoca',
//     'Citrobacter freundii',
//     'Citrobacter koseri',
//     'Enterobacter cloacae',
//     'Proteus mirabilis',
//     'Proteus vulgaris',
//     'Pseudomonas aeruginosa',
//     'Enterococcus faecalis',
//     'Enterococcus faecium',
//     'Neisseria gonorrhoeae',
//     'Neisseria meningitidis',
//     'Haemophilus influenzae',
//     'Morganella morganii',
//     'Salmonella spp',
//     'Serratia marcescens',
//     'Shigella spp',
//     'Staphylococcus xylosus',
//     'Acinetobacter baumannii',
//     'Vibrio cholerae',
//   ]

//   const handleGermeAddition = (germeName) => {
//     if (!culture.germeIdentifie.some((g) => g.nom === germeName)) {
//       const newGerme = {
//         nom: germeName,
//         antibiogramme: {},
//       }
//       setCulture((prev) => ({
//         ...prev,
//         germeIdentifie: [...prev.germeIdentifie, newGerme],
//       }))
//     }
//   }

//   const handleGermeRemoval = (germe) => {
//     const updatedGermeIdentifie = culture.germeIdentifie.filter(
//       (g) => g !== germe
//     )
//     const updatedAntibiogrammes = { ...antibiogrammes }
//     delete updatedAntibiogrammes[germe]
//     setCulture({ ...culture, germeIdentifie: updatedGermeIdentifie })
//     setAntibiogrammes(updatedAntibiogrammes)
//   }

//   const handleAddAntibiogramme = (event, germeNom) => {
//     event.preventDefault() // Empêche la soumission du formulaire
//     // Assurez-vous que le tableau pour ce germe est initialisé
//     const updatedAntibiogrammes = { ...antibiogrammes }
//     if (!updatedAntibiogrammes[germeNom]) {
//       updatedAntibiogrammes[germeNom] = []
//     }
//     updatedAntibiogrammes[germeNom].push({ antibiotique: '', sensibilite: '' })
//     setAntibiogrammes(updatedAntibiogrammes)
//   }

//   const handleUpdateAntibiogramme = (germeNom, index, field, value) => {
//     console.log('Updating:', germeNom, index, field, value)
//     console.log('Current state before update:', antibiogrammes)

//     setAntibiogrammes((prev) => ({
//       ...prev,
//       [germeNom]: prev[germeNom].map((item, idx) => {
//         if (idx === index) {
//           return { ...item, [field]: value }
//         } else {
//           return item
//         }
//       }),
//     }))
//   }

//   const handleRemoveAntibiogramme = (germe, index) => {
//     const updatedAntibiogrammes = {
//       ...antibiogrammes,
//       [germe]: antibiogrammes[germe].filter((_, idx) => idx !== index),
//     }
//     setAntibiogrammes(updatedAntibiogrammes)
//   }

//   //les options des cristeaux et parasites

//   const handleDetailAddition = (field, value) => {
//     setMicroscopique((prev) => ({
//       ...prev,
//       [field]: [...prev[field], value],
//     }))
//   }

//   const handleDetailRemoval = (field, index) => {
//     setMicroscopique((prev) => ({
//       ...prev,
//       [field]: prev[field].filter((_, idx) => idx !== index),
//     }))
//   }
//   const parasitesOptions = [
//     'Aucun parasite détecté',
//     "Rare présence d'œufs d'Ascaris lumbricoïdes",
//     "Nombreux œufs d'Ascaris lumbricoïdes observés",
//     "Peu d'œufs d'Ascaris lumbricoïdes détectés",
//     "Rare présence de larves d'Ankylostoma duodenale",
//     "Nombreuses larves d'Ankylostoma duodenale observées",
//     "Peu de larves d'Ankylostoma duodenale détectées",
//     "Rare présence d'œufs d'Ankylostoma duodenale",
//     "Nombreux œufs d'Ankylostoma duodenale observés",
//     "Peu d'œufs d'Ankylostoma duodenale détectés",
//     "Rare présence d'œufs d'Entamoeba hystolytica",
//     "Nombreux œufs d'Entamoeba hystolytica observés",
//     "Peu d'œufs d'Entamoeba hystolytica détectés",
//     "Rare présence d'œufs d'Entamoeba coli",
//     "Nombreux œufs d'Entamoeba coli observés",
//     "Peu d'œufs d'Entamoeba coli détectés",
//     "Rare présence de formes végétatives d'Entamoeba hystolytica",
//     "Nombreuses formes végétatives d'Entamoeba hystolytica observées",
//     "Peu de formes végétatives d'Entamoeba hystolytica détectées",
//     'Rare présence de Trichomonas intestinalis',
//     'Nombreux Trichomonas intestinalis observés',
//     'Peu de Trichomonas intestinalis détectés',
//     'Œufs de Strongyloides stercoralis détectés',
//     'Œufs de Schistosoma mansoni observés',
//     'Cystes de Giardia lamblia identifiés',
//     'Œufs de Taenia spp. observés',
//     'Larves de Strongyloides stercoralis présentes',
//     'Œufs de Hymenolepis nana détectés',
//     'Œufs de Enterobius vermicularis observés',
//     "Kystes d'Acanthamoeba détectés",
//   ]
//   const cristauxOptions = [
//     'Aucun cristal détecté',
//     'Absence de cristaux',
//     'Aucun signe de cristaux',
//     "Rare présence d'urates",
//     'Nombreux urates observés',
//     "Peu d'urates détectés",
//     "Rare présence de cristaux d'acide urique",
//     "Nombreux cristaux d'acide urique observés",
//     "Peu de cristaux d'acide urique détectés",
//     "Rare présence d'oxalate de calcium",
//     'Nombreux oxalates de calcium observés',
//     "Peu d'oxalates de calcium détectés",
//     'Rare présence de bilirubine',
//     'Nombreux cristaux de bilirubine observés',
//     'Peu de cristaux de bilirubine détectés',
//     'Rare présence de cristaux de Charcot',
//     'Nombreux cristaux de Charcot observés',
//     'Peu de cristaux de Charcot détectés',
//     'Cristaux de cystine détectés',
//     'Rare présence de cristaux de phosphate de calcium',
//     'Nombreux cristaux de phosphate de calcium observés',
//     'Peu de cristaux de phosphate de calcium détectés',
//     'Cristaux de cholestérol détectés',
//     "Rare présence de cristaux d'ammonium biurate",
//     'Cristaux de xanthine observés',
//     'Cristaux de tyrosine détectés',
//   ]

//   const handleMacroscopiqueAddition = (value) => {
//     setMacroscopique([...macroscopique, value])
//   }

//   const handleMacroscopiqueRemoval = (index) => {
//     setMacroscopique(macroscopique.filter((_, idx) => idx !== index))
//   }

//   const isPredefined = predefinedGerms.includes(culture.germeIdentifie)

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setIsLoading(true)

//     // Assurez-vous que les antibiogrammes sont correctement formattés
//     //

//     let observations = {
//       macroscopique: currentView === 'complexe' ? macroscopique : undefined,
//       microscopique: currentView === 'complexe' ? microscopique : undefined,
//       chimie: currentView === 'complexe' ? chimie : undefined,
//       rechercheChlamydia:
//         currentView === 'complexe' ? rechercheChlamydia : undefined,
//       rechercheMycoplasmes:
//         currentView === 'complexe' ? rechercheMycoplasmes : undefined,
//       // antibiogramme:
//       //   currentView === 'complexe'
//       //     ? antibiogrammes.reduce((acc, curr) => {
//       //         if (curr.antibiotique && curr.sensibilite) {
//       //           acc[curr.antibiotique] = curr.sensibilite
//       //         }
//       //         return acc
//       //       }, {})
//       //     : undefined,
//     }

//     try {
//       const body = {
//         analyseId,
//         testId,
//         patientId,
//         valeur: currentView === 'simple' ? valeur : undefined,
//         methode: currentView === 'simple' ? methode : undefined,
//         machineA: currentView === 'simple' ? machineA : undefined,
//         machineB: currentView === 'simple' ? machineB : undefined,
//         statutMachine,
//         statutInterpretation,
//         typePrelevement,
//         lieuPrelevement,
//         datePrelevement: datePrelevement || null,
//         remarque,
//         updatedBy,
//         observations,
//         culture:
//           currentView === 'complexe'
//             ? {
//                 ...culture,
//                 germeIdentifie: Array.isArray(culture.germeIdentifie)
//                   ? culture.germeIdentifie.map((germe) => ({
//                       nom: germe.nom,
//                       antibiogramme: { ...germe.antibiogramme },
//                     }))
//                   : [],
//               }
//             : undefined,
//         gram: currentView === 'complexe' ? gram : undefined,
//         conclusion: currentView === 'complexe' ? conclusion : undefined,
//       }
//       const response = await fetch(`${apiUrl}/api/resultats/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(body),
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
//     setLieuPrelevement('')
//     setDatePrelevement('')
//     setRemarque('')
//     setAntibiogrammes([])
//     setMacroscopique('')
//     setMicroscopique({
//       leucocytes: '',
//       hematies: '',
//       cellulesEpitheliales: '',
//       elementsLevuriforme: '',
//       filamentsMyceliens: '',
//       trichomonasVaginalis: '',
//       cristaux: '',
//       cylindres: '',
//       parasites: '',
//       trichomonasIntestinales: '',
//       oeufsDeBilharzies: '',
//       clueCells: '',
//       gardnerellaVaginalis: '',
//       bacillesDeDoderlein: '',
//       typeDeFlore: '',
//       ph: '',
//       rechercheDeStreptocoqueB: '',
//       monocytes: '',
//     })
//     setChimie({
//       proteinesTotales: '',
//       proteinesArochies: '',
//       glycorachie: '',
//       acideUrique: '',
//       LDH: '',
//     })
//     // Pour réinitialiser l'état de recherche de chlamydia
//     setRechercheChlamydia({
//       naturePrelevement: '',
//       rechercheAntigeneChlamydiaTrochomatis: '',
//     })

//     // Pour réinitialiser l'état de recherche de mycoplasmes
//     setRechercheMycoplasmes({
//       naturePrelevement: '',
//       rechercheUreaplasmaUrealyticum: '',
//       rechercheMycoplasmaHominis: '',
//     })

//     setCulture({
//       description: '',
//       germeIdentifie: '',
//     })
//     setGram('Non effectué')
//     setConclusion('')
//   }

//   return (
//     <>
//       {showToast && (
//         <div className="toast toast-center toast-middle">
//           <div
//             className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}
//           >
//             <span className="text-white">{toastMessage}</span>
//           </div>
//         </div>
//       )}
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label className="label">TestId</label>
//           <select
//             className="select select-bordered w-full max-w-xs"
//             value={testId}
//             onChange={(e) => setTestId(e.target.value)}
//             required
//           >
//             <option value="">Sélectionner un test</option>
//             {tests.map((test) => (
//               <option key={test._id} value={test._id}>
//                 {test.nom}
//               </option>
//             ))}
//           </select>
//           <p>La machine A est : {machineA}</p>
//           <p>La machine B est : {machineB}</p>
//         </div>
//         {/* general */}
//         <div className="flex flex-nowrap gap-4 items-center w-full">
//           <div>
//             <label className="label">Type de Prélèvement</label>
//             <select
//               className="select select-bordered"
//               value={typePrelevement}
//               onChange={(e) => setTypePrelevement(e.target.value)}
//             >
//               <option value="">Sélectionner une option</option>
//               <option value="Urines">Urines</option>
//               <option value="Secretions vaginales">Sécrétions vaginales</option>
//               <option value="Selles">Selles</option>
//               <option value="Uretral">Urétal</option>
//               <option value="Sperme">Sperme</option>
//               <option value="Vulve">Vulve</option>
//               <option value="Pus">Pus</option>
//               <option value="Culot urinaire">Culot urinaire</option>
//               <option value="Soude urinaire">Sonde urinaire</option>
//               <option value="Amydales">Amygdales</option>
//               <option value="LCR">LCR</option>
//               <option value="Ascite">Ascite</option>
//               <option value="Pleural">Pleural</option>
//               <option value="Articulaire">Articulaire</option>
//               <option value="Sang">Sang</option>
//               <option value="Seringue">Seringue</option>
//               <option value="Ballon">Ballon</option>
//             </select>
//           </div>

//           <div>
//             <label className="label">Lieu de Prélèvement</label>
//             <select
//               className="select select-bordered"
//               value={lieuPrelevement}
//               onChange={(e) => setLieuPrelevement(e.target.value)}
//             >
//               <option value="">Sélectionner une option</option>
//               <option value="Prélevé au laboratoire">
//                 Prélevé au laboratoire
//               </option>
//               <option value="Apporté au laboratoire">
//                 Apporté au laboratoire
//               </option>
//             </select>
//           </div>

//           <div>
//             <label className="label">Date de Prélèvement</label>
//             <input
//               type="datetime-local"
//               value={datePrelevement}
//               onChange={(e) => setDatePrelevement(e.target.value)}
//               className="input input-bordered"
//             />
//           </div>
//         </div>

//         <div className="flex flex-col items-center mb-4">
//           <div className="form-control">
//             <label className="label">Choisissez le genre de resultat</label>
//             <label className="cursor-pointer label">
//               <span className="label-text mr-2">Valeur simple</span>
//               <input
//                 type="checkbox"
//                 className="toggle toggle-primary"
//                 checked={currentView === 'complexe'}
//                 onChange={() =>
//                   setCurrentView(
//                     currentView === 'simple' ? 'complexe' : 'simple'
//                   )
//                 }
//               />
//               <span className="label-text ml-2">Valeur complexe</span>
//             </label>
//           </div>
//         </div>

//         {currentView === 'simple' && (
//           <div
//             id="simple"
//             className="flex flex-nowrap gap-4 items-center w-full"
//           >
//             <div>
//               <label className="label">Valeur</label>
//               <input
//                 type="text"
//                 value={valeur}
//                 onChange={(e) => setValeur(e.target.value)}
//                 required
//                 className="input input-bordered"
//               />
//             </div>

//             <div>
//               <label className="label">Statut de l'Interprétation</label>
//               <select
//                 className="select select-bordered"
//                 value={statutInterpretation}
//                 onChange={(e) =>
//                   setStatutInterpretation(e.target.value === 'true')
//                 }
//               >
//                 <option value="false">Non</option>
//                 <option value="true">Oui</option>
//               </select>
//             </div>

//             <div>
//               <label className="label">Machine utiliser</label>
//               <select
//                 className="select select-bordered"
//                 value={statutMachine}
//                 onChange={(e) => setStatutMachine(e.target.value === 'true')}
//               >
//                 <option value="true">A</option>
//                 <option value="false">B</option>
//               </select>
//             </div>

//             {/* <div>
//               <label className="label">Methode</label>
//               <input
//                 type="text"
//                 value={methode}
//                 onChange={(e) => setMethode(e.target.value)}
//                 className="input input-bordered"
//               />
//             </div> */}
//           </div>
//         )}

//         {currentView === 'complexe' && (
//           <div id="complexe">
//             {/* macroscopie */}
//             <div>
//               <label className="label">Observations Macroscopiques:</label>
//               <select
//                 className="select select-bordered w-full max-w-xs"
//                 onChange={(e) => handleMacroscopiqueAddition(e.target.value)}
//                 defaultValue=""
//               >
//                 <option disabled value="">
//                   Sélectionner une observation
//                 </option>
//                 <option value="Claires">Claires</option>
//                 <option value="Légèrement troubles">Légèrement troubles</option>
//                 <option value="Troubles">Troubles</option>
//                 <option value="Abondantes">Abondantes</option>
//                 <option value="Peu abondantes">Peu abondantes</option>
//                 <option value="Fétides">Fétides</option>
//                 <option value="Laiteuses">Laiteuses</option>
//                 <option value="Épaisses">Épaisses</option>
//                 <option value="Odorantes">Odorantes</option>
//                 <option value="Verdâtres">Verdâtres</option>
//                 <option value="Brunâtres">Brunâtres</option>
//                 <option value="Molles">Molles</option>
//                 // Ajoutez d'autres options selon besoin
//               </select>
//               <div className="flex flex-wrap gap-2 mt-2">
//                 {Array.isArray(macroscopique) &&
//                   macroscopique.map((item, index) => (
//                     <div
//                       key={index}
//                       className="badge badge-primary badge-outline"
//                     >
//                       {item}
//                       <FontAwesomeIcon
//                         icon={faTimes}
//                         className="ml-2 cursor-pointer"
//                         onClick={() => handleMacroscopiqueRemoval(index)}
//                       />
//                     </div>
//                   ))}
//               </div>
//             </div>

//             <div className="divider"></div>
//             <h2 className="bold">Microscopie</h2>
//             {/* microscopie */}
//             <div className="flex flex-wrap gap-4 items-center">
//               <div className="flex flex-nowrap gap-4 items-center w-full">
//                 <div>
//                   <label className="label">Leucocytes</label>
//                   <input
//                     type="text"
//                     value={microscopique.leucocytes}
//                     onChange={(e) =>
//                       handleMicroscopiqueChange('leucocytes', e.target.value)
//                     }
//                     className="input input-bordered"
//                   />
//                 </div>

//                 <div>
//                   <label className="label">Hématies</label>
//                   <input
//                     type="text"
//                     value={microscopique.hematies}
//                     onChange={(e) =>
//                       handleMicroscopiqueChange('hematies', e.target.value)
//                     }
//                     className="input input-bordered"
//                   />
//                 </div>
//                 <div>
//                   <label className="label">Unité de mesure</label>
//                   <select
//                     className="select select-bordered"
//                     value={microscopique.unite}
//                     onChange={(e) =>
//                       handleMicroscopiqueChange('unite', e.target.value)
//                     }
//                   >
//                     <option value="">Sélectionnez une unité</option>
//                     <option value="champ">champ</option>
//                     <option value="mm3">mm3</option>
//                   </select>
//                 </div>

//                 <div>
//                   {/* Autres champs déjà définis dans votre formulaire */}

//                   <label className="label">pH</label>
//                   <input
//                     type="text"
//                     className="input input-bordered"
//                     value={microscopique.ph}
//                     onChange={(e) =>
//                       handleMicroscopiqueChange('ph', e.target.value)
//                     }
//                     placeholder=""
//                   />
//                 </div>
//               </div>
//               <div className="flex flex-wrap gap-4 items-center">
//                 <div>
//                   <label className="label">Cristaux</label>
//                   <select
//                     className="select select-bordered"
//                     value={microscopique.cristaux}
//                     onChange={(e) => {
//                       handleMicroscopiqueChange('cristaux', e.target.value)
//                       if (e.target.value === 'Non concerner') {
//                         // Assurez-vous de nettoyer les détails des cristaux si 'Non concerner' est sélectionné
//                         handleDetailRemovalAll('cristauxDetails')
//                       }
//                     }}
//                   >
//                     <option value="">Non concerner</option>
//                     <option value="Absence">Absence</option>
//                     <option value="Présence">Présence</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="label">Liste des cristaux:</label>
//                   <select
//                     className="select select-bordered w-[150px]"
//                     onChange={(e) =>
//                       handleDetailAddition('cristauxDetails', e.target.value)
//                     }
//                     defaultValue=""
//                     disabled={
//                       microscopique.cristaux === '' ||
//                       microscopique.cristaux === 'Non concerner'
//                     }
//                   >
//                     <option disabled value="">
//                       Choisir des cristaux
//                     </option>
//                     {cristauxOptions.map((option, index) => (
//                       <option key={index} value={option}>
//                         {option}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="flex flex-wrap gap-2 mt-2">
//                     {microscopique.cristauxDetails &&
//                       microscopique.cristauxDetails.map((detail, index) => (
//                         <div
//                           key={index}
//                           className="badge badge-primary badge-outline w-full"
//                         >
//                           {detail}
//                           <FontAwesomeIcon
//                             icon={faTimes}
//                             className="ml-2 cursor-pointer"
//                             onClick={() =>
//                               handleDetailRemoval('cristauxDetails', index)
//                             }
//                           />
//                         </div>
//                       ))}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="label">Parasites</label>
//                   <select
//                     className="select select-bordered"
//                     value={microscopique.parasites}
//                     onChange={(e) => {
//                       handleMicroscopiqueChange('parasites', e.target.value)
//                       if (e.target.value === 'Non concerner') {
//                         // Nettoyer les détails des parasites si 'Non concerner' est sélectionné
//                         handleDetailRemovalAll('parasitesDetails')
//                       }
//                     }}
//                   >
//                     <option value="">Non concerner</option>
//                     <option value="Absence">Absence</option>
//                     <option value="Présence">Présence</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="label">Liste des parasites:</label>
//                   <select
//                     className="select select-bordered w-[150px]"
//                     onChange={(e) =>
//                       handleDetailAddition('parasitesDetails', e.target.value)
//                     }
//                     defaultValue=""
//                     disabled={
//                       microscopique.parasites === '' ||
//                       microscopique.parasites === 'Non concerner'
//                     }
//                   >
//                     <option disabled value="">
//                       Choisir des parasites
//                     </option>
//                     {parasitesOptions.map((option, index) => (
//                       <option key={index} value={option}>
//                         {option}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="flex flex-wrap gap-2 mt-2">
//                     {microscopique.parasitesDetails &&
//                       microscopique.parasitesDetails.map((detail, index) => (
//                         <div
//                           key={index}
//                           className="badge badge-primary badge-outline w-full"
//                         >
//                           {detail}
//                           <FontAwesomeIcon
//                             icon={faTimes}
//                             className="ml-2 cursor-pointer"
//                             onClick={() =>
//                               handleDetailRemoval('parasitesDetails', index)
//                             }
//                           />
//                         </div>
//                       ))}
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label className="label">Cellules épithéliales</label>
//                 <select
//                   className="select select-bordered"
//                   value={microscopique.cellulesEpitheliales}
//                   onChange={(e) =>
//                     handleMicroscopiqueChange(
//                       'cellulesEpitheliales',
//                       e.target.value
//                     )
//                   }
//                 >
//                   <option value="">Non concerner</option>
//                   <option value="Absence">Absence</option>
//                   <option value="Présence">Présence</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="label">Eléments levuriformes</label>
//                 <select
//                   className="select select-bordered"
//                   value={microscopique.elementsLevuriforme}
//                   onChange={(e) =>
//                     handleMicroscopiqueChange(
//                       'elementsLevuriforme',
//                       e.target.value
//                     )
//                   }
//                 >
//                   <option value="">Non concerner</option>
//                   <option value="Absence">Absence</option>
//                   <option value="Présence">Présence</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="label">filaments mycéliens</label>
//                 <select
//                   className="select select-bordered"
//                   value={microscopique.filamentsMyceliens}
//                   onChange={(e) =>
//                     handleMicroscopiqueChange(
//                       'filamentsMyceliens',
//                       e.target.value
//                     )
//                   }
//                 >
//                   <option value="">Non concerner</option>
//                   <option value="Absence">Absence</option>
//                   <option value="Présence">Présence</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="label">Trichomonas vaginalis</label>
//                 <select
//                   className="select select-bordered"
//                   value={microscopique.trichomonasVaginalis}
//                   onChange={(e) =>
//                     handleMicroscopiqueChange(
//                       'trichomonasVaginalis',
//                       e.target.value
//                     )
//                   }
//                 >
//                   <option value="">Non concerner</option>
//                   <option value="Absence">Absence</option>
//                   <option value="Présence">Présence</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="label">cylindres</label>
//                 <select
//                   className="select select-bordered"
//                   value={microscopique.cylindres}
//                   onChange={(e) =>
//                     handleMicroscopiqueChange('cylindres', e.target.value)
//                   }
//                 >
//                   <option value="">Non concerner</option>
//                   <option value="Absence">Absence</option>
//                   <option value="Présence">Présence</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="label">Oeufs de Bilharzies</label>
//                 <select
//                   className="select select-bordered"
//                   value={microscopique.oeufsDeBilharzies}
//                   onChange={(e) =>
//                     handleMicroscopiqueChange(
//                       'oeufsDeBilharzies',
//                       e.target.value
//                     )
//                   }
//                 >
//                   <option value="">Non concerner</option>
//                   <option value="Absence">Absence</option>
//                   <option value="Présence">Présence</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="label">Clue Cells</label>
//                 <select
//                   className="select select-bordered"
//                   value={microscopique.clueCells}
//                   onChange={(e) =>
//                     handleMicroscopiqueChange('clueCells', e.target.value)
//                   }
//                 >
//                   <option value="">Non concerner</option>
//                   <option value="Absence">Absence</option>
//                   <option value="Présence">Présence</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="label">Gardnerella Vaginalis</label>
//                 <select
//                   className="select select-bordered"
//                   value={microscopique.gardnerellaVaginalis}
//                   onChange={(e) =>
//                     handleMicroscopiqueChange(
//                       'gardnerellaVaginalis',
//                       e.target.value
//                     )
//                   }
//                 >
//                   <option value="">Non concerner</option>
//                   <option value="Absence">Absence</option>
//                   <option value="Présence">Présence</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="label">Bacilles de Doderlein</label>
//                 <select
//                   className="select select-bordered"
//                   value={microscopique.bacillesDeDoderlein}
//                   onChange={(e) =>
//                     handleMicroscopiqueChange(
//                       'bacillesDeDoderlein',
//                       e.target.value
//                     )
//                   }
//                 >
//                   <option value="">Non concerner</option>
//                   <option value="Absence">Absence</option>
//                   <option value="Présence">Présence</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="label">Type de Flore</label>
//                 <select
//                   className="select select-bordered"
//                   value={microscopique.typeDeFlore}
//                   onChange={(e) =>
//                     handleMicroscopiqueChange('typeDeFlore', e.target.value)
//                   }
//                 >
//                   <option value="">Non concerner</option>
//                   <option value="I">I</option>
//                   <option value="II">II</option>
//                   <option value="III">III</option>
//                   <option value="III">IV</option>
//                   <option value="équilibrée">équilibrée</option>
//                   <option value="deséquilibrée">deséquilibrée</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="label">Recherche de Streptocoque B</label>
//                 <select
//                   className="select select-bordered"
//                   value={microscopique.rechercheDeStreptocoqueB}
//                   onChange={(e) =>
//                     handleMicroscopiqueChange(
//                       'rechercheDeStreptocoqueB',
//                       e.target.value
//                     )
//                   }
//                 >
//                   <option value="">Non concerner</option>
//                   <option value="Négatif">Négatif</option>
//                   <option value="Positif">Positif</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="label">Monocytes</label>
//                 <input
//                   type="text"
//                   className="input input-bordered"
//                   value={microscopique.monocytes}
//                   onChange={(e) =>
//                     handleMicroscopiqueChange('monocytes', e.target.value)
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="label">
//                   Polynucléaires neutrophiles altérées
//                 </label>
//                 <input
//                   type="text"
//                   className="input input-bordered"
//                   value={microscopique.polynucleairesNeutrophilesAlterees}
//                   onChange={(e) =>
//                     handleMicroscopiqueChange(
//                       'polynucleairesNeutrophilesAlterees',
//                       e.target.value
//                     )
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="label">
//                   Polynucléaires neutrophiles non altérées
//                 </label>
//                 <input
//                   type="text"
//                   className="input input-bordered"
//                   value={microscopique.polynucleairesNeutrophilesNonAlterees}
//                   onChange={(e) =>
//                     handleMicroscopiqueChange(
//                       'polynucleairesNeutrophilesNonAlterees',
//                       e.target.value
//                     )
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="label">Éosinophiles</label>
//                 <input
//                   type="text"
//                   className="input input-bordered"
//                   value={microscopique.eosinophiles}
//                   onChange={(e) =>
//                     handleMicroscopiqueChange('eosinophiles', e.target.value)
//                   }
//                 />
//               </div>

//               <div>
//                 <label className="label">Basophiles</label>
//                 <input
//                   type="text"
//                   className="input input-bordered"
//                   value={microscopique.basophiles}
//                   onChange={(e) =>
//                     handleMicroscopiqueChange('basophiles', e.target.value)
//                   }
//                 />
//               </div>

//               {/* Continuez pour les autres champs microscopiques */}
//             </div>
//             <div className="divider"></div>
//             <h2 className="bold">Chimie</h2>
//             {/* Chimie */}
//             <div className="">
//               <div className="flex flex-wrap gap-2 items-center">
//                 <div>
//                   <label className="label">proteinesTotales</label>
//                   <input
//                     type="text"
//                     value={chimie.proteinesTotales}
//                     onChange={(e) =>
//                       handleChimieChange('proteinesTotales', e.target.value)
//                     }
//                     className="input input-bordered"
//                   />
//                 </div>

//                 <div>
//                   <label className="label">proteinesArochies</label>
//                   <input
//                     type="text"
//                     value={chimie.proteinesArochies}
//                     onChange={(e) =>
//                       handleChimieChange('proteinesArochies', e.target.value)
//                     }
//                     className="input input-bordered"
//                   />
//                 </div>

//                 <div>
//                   <label className="label">glycorachie</label>
//                   <input
//                     type="text"
//                     className="input input-bordered"
//                     value={chimie.glycorachie}
//                     onChange={(e) =>
//                       handleChimieChange('glycorachie', e.target.value)
//                     }
//                     placeholder=""
//                   />
//                 </div>

//                 <div>
//                   <label className="label">acideUrique</label>
//                   <input
//                     type="text"
//                     className="input input-bordered"
//                     value={chimie.acideUrique}
//                     onChange={(e) =>
//                       handleChimieChange('acideUrique', e.target.value)
//                     }
//                     placeholder=""
//                   />
//                 </div>

//                 <div>
//                   <label className="label">LDH</label>
//                   <input
//                     type="text"
//                     className="input input-bordered"
//                     value={chimie.LDH}
//                     onChange={(e) => handleChimieChange('LDH', e.target.value)}
//                     placeholder=""
//                   />
//                 </div>
//               </div>
//             </div>
//             <div className="divider"></div>
//             <h2 className="bold">culture</h2>
//             {/* culture */}
//             <div className="mt-2 mb-2">
//               <div>
//                 <label className="label">Culture: concentration</label>
//                 <select
//                   value={culture.description}
//                   onChange={(e) =>
//                     handleCultureChange('description', e.target.value)
//                   }
//                   className="select select-bordered"
//                 >
//                   <option value="">Sélectionner une concentration</option>
//                   <option value="DGU < 1000/ml">DGU &lt; 1000/ml</option>
//                   <option value="DGU > 1000/ml">DGU &gt; 1000/ml</option>
//                   <option value="DGU > 10.000/ml">DGU &gt; 10.000/ml</option>
//                   <option value="DGU > 100.000/ml">DGU &gt; 100.000/ml</option>
//                   <option value="DGU > 1.000.000/ml">
//                     DGU &gt; 1.000.000/ml
//                   </option>
//                   <option value="DGU > 100.000.000/ml">
//                     DGU &gt; 100.000.000/ml
//                   </option>
//                   <option value="DGU > 1000.000.000/ml">
//                     DGU &gt; 1000.000.000/ml
//                   </option>
//                 </select>
//               </div>

//               <div>
//                 <label className="label">Culture</label>
//                 <select
//                   value={culture.culture} // Assurez-vous que l'état culture contient un champ culture initialisé correctement
//                   onChange={(e) =>
//                     handleCultureChange('culture', e.target.value)
//                   }
//                   className="select select-bordered"
//                 >
//                   <option value="">Sélectionner un état</option>
//                   <option value="Negatives">Négatives</option>
//                   <option value="Positives">Positives</option>
//                   <option value="Non contributives">Non contributives</option>
//                 </select>
//               </div>

//               {/* <div>
//                 <label className="label">
//                   Culture: Germe Identifié - Sélection
//                 </label>
//                 <select
//                   className="select select-bordered w-full"
//                   defaultValue=""
//                   onChange={(e) => handleGermeAddition(e.target.value)}
//                 >
//                   <option disabled value="">
//                     Sélectionner un germe
//                   </option>
//                   {predefinedGerms.map((germe, index) => (
//                     <option key={index} value={germe}>
//                       {germe}
//                     </option>
//                   ))}
//                 </select>
//                 <input
//                   type="text"
//                   placeholder="Ajouter manuellement"
//                   onKeyPress={(e) => {
//                     if (e.key === 'Enter' && e.target.value) {
//                       handleGermeAddition(e.target.value)
//                       e.target.value = '' // clear the input after adding
//                     }
//                   }}
//                   className="input input-bordered mt-2"
//                 />
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   {Array.isArray(culture.germeIdentifie) &&
//                     culture.germeIdentifie.map((germe, index) => (
//                       <div
//                         key={index}
//                         className="badge badge-primary badge-outline"
//                       >
//                         {germe}
//                         <FontAwesomeIcon
//                           icon={faTimes}
//                           className="ml-2 cursor-pointer"
//                           onClick={() => handleGermeRemoval(index)}
//                         />
//                       </div>
//                     ))}
//                 </div>
//               </div> */}

//               {/* <div>
//                 <label className="label">
//                   Culture: Germe Identifié - Sélection
//                 </label>
//                 <select
//                   className="select select-bordered"
//                   onChange={(e) => handleGermeAddition(e.target.value)}
//                   defaultValue=""
//                 >
//                   <option value="">Sélectionner un germe</option>
//                   {predefinedGerms.map((germe) => (
//                     <option key={germe} value={germe}>
//                       {germe}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="flex flex-wrap gap-2 mt-2">
//                 {Array.isArray(culture.germeIdentifie) &&
//                   culture.germeIdentifie.map((germe) => (
//                     <div
//                       key={germe.nom}
//                       className="badge badge-primary badge-outline"
//                     >
//                       {germe}
//                       <FontAwesomeIcon
//                         icon={faTimes}
//                         className="ml-2 cursor-pointer"
//                         onClick={() => handleGermeRemoval(germe)}
//                       />
//                       <button
//                         type="button"
//                         className="ml-2 btn btn-xs btn-success"
//                         onClick={(e) => handleAddAntibiogramme(e, germe)} // Passez `e` et `germe` à la fonction
//                       >
//                         Add Antibio
//                       </button>
//                     </div>
//                   ))}
//               </div>

//               {Array.isArray(culture.germeIdentifie) &&
//                 culture.germeIdentifie.map((germe) => (
//                   <div key={germe.nom}>
//                     <h4>{germe} - Antibio</h4>
//                     {antibiogrammes[germe] &&
//                       antibiogrammes[germe].map((antibio, index) => (
//                         <div
//                           key={index}
//                           className="flex items-center gap-2 mb-2"
//                         >
//                           <select
//                             className="select select-bordered"
//                             value={antibio.antibiotique}
//                             onChange={(e) =>
//                               handleUpdateAntibiogramme(
//                                 germe,
//                                 index,
//                                 'antibiotique',
//                                 e.target.value
//                               )
//                             }
//                           >
//                             <option value="">
//                               Sélectionner un antibiotique
//                             </option>
//                             {antibiogrammes[germe] &&
//                               antibioticsList.map((antibiotic) => (
//                                 <option key={antibiotic} value={antibiotic}>
//                                   {antibiotic}
//                                 </option>
//                               ))}
//                           </select>
//                           <select
//                             className="select select-bordered"
//                             value={antibio.sensibilite}
//                             onChange={(e) =>
//                               handleUpdateAntibiogramme(
//                                 germe,
//                                 index,
//                                 'sensibilite',
//                                 e.target.value
//                               )
//                             }
//                           >
//                             <option value="">
//                               Sélectionner la sensibilité
//                             </option>
//                             <option value="Sensible">Sensible</option>
//                             <option value="Intermédiaire">Intermédiaire</option>
//                             <option value="Résistant">Résistant</option>
//                           </select>
//                           <button
//                             type="button"
//                             className="btn btn-error btn-xs"
//                             onClick={(e) => {
//                               e.preventDefault()
//                               handleRemoveAntibiogramme(germe, index)
//                             }}
//                           >
//                             Remove
//                           </button>
//                         </div>
//                       ))}
//                   </div>
//                 ))} */}

//               <div>
//                 <label className="label">
//                   Culture: Germe Identifié - Sélection
//                 </label>
//                 <select
//                   className="select select-bordered"
//                   onChange={(e) => handleGermeAddition(e.target.value)}
//                   defaultValue=""
//                 >
//                   <option value="">Sélectionner un germe</option>
//                   {predefinedGerms.map((germe) => (
//                     <option key={germe} value={germe}>
//                       {germe}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div className="flex flex-wrap gap-2 mt-2">
//                 {Array.isArray(culture.germeIdentifie) &&
//                   culture.germeIdentifie.map((germe) => (
//                     <div
//                       key={germe.nom}
//                       className="badge badge-primary badge-outline"
//                     >
//                       {germe.nom} {/* Affiche le nom du germe */}
//                       <FontAwesomeIcon
//                         icon={faTimes}
//                         className="ml-2 cursor-pointer"
//                         onClick={() => handleGermeRemoval(germe.nom)}
//                       />
//                       <button
//                         type="button"
//                         className="ml-2 btn btn-xs btn-success"
//                         onClick={(e) => handleAddAntibiogramme(e, germe.nom)}
//                       >
//                         Ajouter Antibio
//                       </button>
//                     </div>
//                   ))}
//               </div>

//               {Array.isArray(culture.germeIdentifie) &&
//                 culture.germeIdentifie.map((germe) => (
//                   <div key={germe.nom}>
//                     <h4>{germe.nom} - Antibio</h4>
//                     {antibiogrammes[germe.nom] && // Assurez-vous que antibiogrammes utilise la clé `nom` du germe
//                       antibiogrammes[germe.nom].map((antibio, index) => (
//                         <div
//                           key={index}
//                           className="flex items-center gap-2 mb-2"
//                         >
//                           <select
//                             className="select select-bordered"
//                             value={antibio.antibiotique}
//                             onChange={(e) =>
//                               handleUpdateAntibiogramme(
//                                 germe.nom,
//                                 index,
//                                 'antibiotique',
//                                 e.target.value
//                               )
//                             }
//                           >
//                             <option value="">
//                               Sélectionner un antibiotique
//                             </option>
//                             {antibioticsList.map((antibiotic) => (
//                               <option key={antibiotic} value={antibiotic}>
//                                 {antibiotic}
//                               </option>
//                             ))}
//                           </select>
//                           <select
//                             className="select select-bordered"
//                             value={antibio.sensibilite}
//                             onChange={(e) =>
//                               handleUpdateAntibiogramme(
//                                 germe.nom,
//                                 index,
//                                 'sensibilite',
//                                 e.target.value
//                               )
//                             }
//                           >
//                             <option value="">
//                               Sélectionner la sensibilité
//                             </option>
//                             <option value="S">Sensible</option>
//                             <option value="I">Intermédiaire</option>
//                             <option value="R">Résistant</option>
//                           </select>
//                           <button
//                             type="button"
//                             className="btn btn-error btn-xs"
//                             onClick={(e) => {
//                               e.preventDefault()
//                               handleRemoveAntibiogramme(germe.nom, index)
//                             }}
//                           >
//                             Remove
//                           </button>
//                         </div>
//                       ))}
//                   </div>
//                 ))}
//             </div>
//             <div className="divider"></div>

//             {/* Gram */}
//             <div>
//               <label className="label">Gram</label>
//               <select
//                 className="select select-bordered"
//                 value={gram}
//                 onChange={(e) => setGram(e.target.value)}
//               >
//                 <option value="">Sélectionner un type de Gram</option>
//                 <option value="Bacilles Gram négatif">
//                   Bacilles Gram négatif
//                 </option>
//                 <option value="Bacilles Gram positif">
//                   Bacilles Gram positif
//                 </option>
//                 <option value="Cocci Gram négatif">Cocci Gram négatif</option>
//                 <option value="Cocci Gram positif">Cocci Gram positif</option>
//                 <option value="Levures">Levures</option>
//               </select>
//             </div>
//             <div className="divider"></div>
//             {/* Chlamydiae */}
//             <div>
//               <div>
//                 <label className="label">
//                   Nature du prélèvement pour Chlamydia
//                 </label>
//                 <select
//                   className="select select-bordered"
//                   value={rechercheChlamydia.naturePrelevement}
//                   onChange={(e) =>
//                     handleRechercheChlamydiaChange(
//                       'naturePrelevement',
//                       e.target.value
//                     )
//                   }
//                 >
//                   <option value="">Sélectionnez</option>
//                   <option value="cervical">Cervical</option>
//                   <option value="urine">Urine</option>
//                   <option value="sperme">Sperme</option>
//                   <option value="uretral">Urétal</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="label">
//                   Recherche d'antigène de Chlamydia trachomatis
//                 </label>
//                 <select
//                   className="select select-bordered"
//                   value={
//                     rechercheChlamydia.rechercheAntigeneChlamydiaTrochomatis
//                   }
//                   onChange={(e) =>
//                     handleRechercheChlamydiaChange(
//                       'rechercheAntigeneChlamydiaTrochomatis',
//                       e.target.value
//                     )
//                   }
//                 >
//                   <option value="">Sélectionnez</option>
//                   <option value="négative">Négative</option>
//                   <option value="positive">Positive</option>
//                 </select>
//               </div>

//               {/* Champs pour la Recherche de Mycoplasmes */}
//               <div>
//                 <label className="label">
//                   Nature du prélèvement pour Mycoplasmes
//                 </label>
//                 <select
//                   className="select select-bordered"
//                   value={rechercheMycoplasmes.naturePrelevement}
//                   onChange={(e) =>
//                     handleRechercheMycoplasmesChange(
//                       'naturePrelevement',
//                       e.target.value
//                     )
//                   }
//                 >
//                   <option value="">Sélectionnez</option>
//                   <option value="cervical">Cervical</option>
//                   <option value="urine">Urine</option>
//                   <option value="sperme">Sperme</option>
//                   <option value="uretral">Urétal</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="label">
//                   Recherche d'Ureaplasma urealyticum
//                 </label>
//                 <select
//                   className="select select-bordered"
//                   value={rechercheMycoplasmes.rechercheUreaplasmaUrealyticum}
//                   onChange={(e) =>
//                     handleRechercheMycoplasmesChange(
//                       'rechercheUreaplasmaUrealyticum',
//                       e.target.value
//                     )
//                   }
//                 >
//                   <option value="">Sélectionnez</option>
//                   <option value="négative">Négative</option>
//                   <option value="positive">Positive</option>
//                 </select>
//               </div>
//               <div>
//                 <label className="label">Recherche de Mycoplasma hominis</label>
//                 <select
//                   className="select select-bordered"
//                   value={rechercheMycoplasmes.rechercheMycoplasmaHominis}
//                   onChange={(e) =>
//                     handleRechercheMycoplasmesChange(
//                       'rechercheMycoplasmaHominis',
//                       e.target.value
//                     )
//                   }
//                 >
//                   <option value="">Sélectionnez</option>
//                   <option value="négative">Négative</option>
//                   <option value="positive">Positive</option>
//                 </select>
//               </div>
//             </div>

//             {/* Champs pour la Recherche de Mycoplasmes */}

//             <div className="divider"></div>
//             {/* conclusion */}
//             <div>
//               <label className="label">Conclusion</label>
//               <select
//                 value={conclusion}
//                 onChange={(e) => setConclusion(e.target.value)}
//                 className="select select-bordered"
//               >
//                 <option value="">Sélectionner une conclusion</option>
//                 <option value="Conclusion 1">Conclusion 1</option>
//                 <option value="Conclusion 2">Conclusion 2</option>
//                 <option value="Conclusion 3">Conclusion 3</option>
//                 <option value="Conclusion 4">Conclusion 4</option>
//               </select>
//             </div>
//             {/* antibiogramme */}

//             {/* Répétez pour chaque champ microscopique */}
//           </div>
//         )}

//         <div>
//           <label className="label">Remarque</label>
//           <textarea
//             value={remarque}
//             onChange={(e) => setRemarque(e.target.value)}
//             className="textarea textarea-bordered"
//           ></textarea>
//         </div>
//         {isLoading ? (
//           <div className="flex justify-center items-center">
//             <span className="loading loading-spinner text-primary"></span>
//           </div>
//         ) : (
//           <button type="submit" className="btn btn-primary mt-4">
//             Ajouter le résultat
//           </button>
//         )}
//       </form>
//     </>
//   )
// }

// AddResultatForm.propTypes = {
//   analyseId: PropTypes.string.isRequired,
//   patientId: PropTypes.string.isRequired,
//   onResultatChange: PropTypes.func.isRequired,
// }

// export default AddResultatForm

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

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

  // const handleAddAntibiogramme = (e) => {
  //   e.preventDefault() // Prevent form submission when adding antibiogram
  //   if (antibiogrammes.length < antibiotiques.length) {
  //     setAntibiogrammes([
  //       ...antibiogrammes,
  //       { antibiotique: '', sensibilite: '' },
  //     ])
  //   }
  // }

  // const handleUpdateAntibiogramme = (index, field, value) => {
  //   const updated = antibiogrammes.map((item, idx) =>
  //     idx === index ? { ...item, [field]: value } : item
  //   )
  //   setAntibiogrammes(updated)
  // }

  // const handleRemoveAntibiogramme = (index) => {
  //   setAntibiogrammes(antibiogrammes.filter((_, idx) => idx !== index))
  // }

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

  const handleGermeRemoval = (germe) => {
    const updatedGermeIdentifie = culture.germeIdentifie.filter(
      (g) => g !== germe
    )
    const updatedAntibiogrammes = { ...antibiogrammes }
    delete updatedAntibiogrammes[germe]
    setCulture({ ...culture, germeIdentifie: updatedGermeIdentifie })
    setAntibiogrammes(updatedAntibiogrammes)
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
      germeIdentifie: [],
      culture: '',
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
                // Ajoutez d'autres options selon besoin
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

              {/* <div>
                <label className="label">
                  Culture: Germe Identifié - Sélection
                </label>
                <select
                  className="select select-bordered w-full"
                  defaultValue=""
                  onChange={(e) => handleGermeAddition(e.target.value)}
                >
                  <option disabled value="">
                    Sélectionner un germe
                  </option>
                  {predefinedGerms.map((germe, index) => (
                    <option key={index} value={germe}>
                      {germe}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Ajouter manuellement"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      handleGermeAddition(e.target.value)
                      e.target.value = '' // clear the input after adding
                    }
                  }}
                  className="input input-bordered mt-2"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.isArray(culture.germeIdentifie) &&
                    culture.germeIdentifie.map((germe, index) => (
                      <div
                        key={index}
                        className="badge badge-primary badge-outline"
                      >
                        {germe}
                        <FontAwesomeIcon
                          icon={faTimes}
                          className="ml-2 cursor-pointer"
                          onClick={() => handleGermeRemoval(index)}
                        />
                      </div>
                    ))}
                </div>
              </div> */}

              {/* <div>
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
                      {germe}
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="ml-2 cursor-pointer"
                        onClick={() => handleGermeRemoval(germe)}
                      />
                      <button
                        type="button"
                        className="ml-2 btn btn-xs btn-success"
                        onClick={(e) => handleAddAntibiogramme(e, germe)} // Passez `e` et `germe` à la fonction
                      >
                        Add Antibio
                      </button>
                    </div>
                  ))}
              </div>

              {Array.isArray(culture.germeIdentifie) &&
                culture.germeIdentifie.map((germe) => (
                  <div key={germe.nom}>
                    <h4>{germe} - Antibio</h4>
                    {antibiogrammes[germe] &&
                      antibiogrammes[germe].map((antibio, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 mb-2"
                        >
                          <select
                            className="select select-bordered"
                            value={antibio.antibiotique}
                            onChange={(e) =>
                              handleUpdateAntibiogramme(
                                germe,
                                index,
                                'antibiotique',
                                e.target.value
                              )
                            }
                          >
                            <option value="">
                              Sélectionner un antibiotique
                            </option>
                            {antibiogrammes[germe] &&
                              antibioticsList.map((antibiotic) => (
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
                                germe,
                                index,
                                'sensibilite',
                                e.target.value
                              )
                            }
                          >
                            <option value="">
                              Sélectionner la sensibilité
                            </option>
                            <option value="Sensible">Sensible</option>
                            <option value="Intermédiaire">Intermédiaire</option>
                            <option value="Résistant">Résistant</option>
                          </select>
                          <button
                            type="button"
                            className="btn btn-error btn-xs"
                            onClick={(e) => {
                              e.preventDefault()
                              handleRemoveAntibiogramme(germe, index)
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                  </div>
                ))} */}

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
