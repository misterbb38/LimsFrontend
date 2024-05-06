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
  })

  const [culture, setCulture] = useState({
    description: '',
    germeIdentifie: '',
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

  const handleCultureChange = (field, value) => {
    setCulture((prev) => ({ ...prev, [field]: value }))
  }

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
        typePrelevement: currentView === 'simple' ? typePrelevement : undefined,
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
          <div id="simple">
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

            <div>
              <label className="label">Methode</label>
              <input
                type="text"
                value={methode}
                onChange={(e) => setMethode(e.target.value)}
                className="input input-bordered"
              />
            </div>
            <div>
              <label className="label">Type de Prélèvement</label>
              <input
                type="text"
                value={typePrelevement}
                onChange={(e) => setTypePrelevement(e.target.value)}
                className="input input-bordered"
              />
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
        )}

        {currentView === 'complexe' && (
          <div id="complexe">
            <div>
              <label className="label">Macroscopique</label>
              <input
                type="text"
                value={macroscopique}
                onChange={(e) => setMacroscopique(e.target.value)}
                className="input input-bordered"
              />
            </div>
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
              {/* Autres champs déjà définis dans votre formulaire */}

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

              <label className="label">
                Trichomonas vaginalis /Autres parasites
              </label>
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
              {/* Continuez pour les autres champs microscopiques */}
            </div>

            <div>
              <label className="label">Culture: Description</label>
              <input
                type="text"
                value={culture.description}
                onChange={(e) =>
                  handleCultureChange('description', e.target.value)
                }
                className="input input-bordered"
              />
            </div>
            <div>
              <label className="label">Culture: Germe Identifié</label>
              <input
                type="text"
                value={culture.germeIdentifie}
                onChange={(e) =>
                  handleCultureChange('germeIdentifie', e.target.value)
                }
                className="input input-bordered"
              />
            </div>
            <div>
              <label className="label">Gram</label>
              <input
                type="text"
                value={gram}
                onChange={(e) => setGram(e.target.value)}
                className="input input-bordered"
              />
            </div>
            <div>
              <label className="label">Conclusion</label>
              <textarea
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                className="textarea textarea-bordered"
              />
            </div>

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
