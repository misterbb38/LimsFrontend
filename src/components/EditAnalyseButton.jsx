import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTimes } from '@fortawesome/free-solid-svg-icons'

function EditAnalyseButton({ analyseId, onAnalyseUpdated }) {
  const [showModal, setShowModal] = useState(false)
  const [selectedTests, setSelectedTests] = useState([])
  const [availableTests, setAvailableTests] = useState([])
  const [ordonnancePdf, setOrdonnancePdf] = useState(null)
  const [statusPayement, setStatusPayement] = useState('')
  const [pc1, setPc1] = useState(false)
  const [pc2, setPc2] = useState(false)
  const [deplacement, setDeplacement] = useState(0)
  const [dateDeRecuperation, setDateDeRecuperation] = useState('')

  const [hasInsurance, setHasInsurance] = useState(false)
  const [selectedPartenaireId, setSelectedPartenaireId] = useState('')
  const [pourcentageCouverture, setPourcentageCouverture] = useState(0)

  const [hasReduction, setHasReduction] = useState(false)
  const [reductionType, setReductionType] = useState('pourcentage')
  const [reductionValue, setReductionValue] = useState(0)

  const [partenaires, setPartenaires] = useState([])

  // Ajout d'un état pour la recherche
  const [searchTerm, setSearchTerm] = useState('')

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    fetchPartenaires()
    if (analyseId) {
      fetchAnalyseData()
    }
    fetchAvailableTests()
  }, [analyseId])

  const fetchPartenaires = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const token = userInfo?.token
    try {
      const response = await fetch(`${apiUrl}/api/partenaire`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setPartenaires(data.data || [])
      console.log(data)
    } catch (error) {
      console.error('Erreur lors du chargement des partenaires:', error)
    }
  }

  const fetchAvailableTests = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const token = userInfo?.token
    try {
      const response = await fetch(`${apiUrl}/api/test`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setAvailableTests(data.data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des tests disponibles:', error)
    }
  }

  const fetchAnalyseData = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const token = userInfo?.token
    try {
      const response = await fetch(`${apiUrl}/api/analyse/${analyseId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success && data.data) {
        console.log(data)
        setSelectedTests(data.data.tests || [])
        setOrdonnancePdf(data.data.ordonnancePdf)
        setHasInsurance(data.data.partenaireId._id ? true : false)
        setSelectedPartenaireId(data.data.partenaireId._id || '')
        setPourcentageCouverture(data.data.pourcentageCouverture || 0)
        setHasReduction(data.data.reduction ? true : false)
        setReductionType(data.data.typeReduction || 'pourcentage')
        setReductionValue(data.data.reduction || 0)
        setPc1(data.data.pc1 === 2000) // true si pc1 est 2000, sinon false
        setPc2(data.data.pc2 === 4000)
        setStatusPayement(data.data.statusPayement || 'Impayée') // Utilisez la valeur par défaut si aucune donnée n'est disponible
        // Other state initializations
        setDeplacement(data.data.deplacement || 0)
        // Conversion de la date de récupération de format "jj/mm/année" à "YYYY-MM-DD"
        if (data.data.dateDeRecuperation) {
          const parts = data.data.dateDeRecuperation.split('/')
          // Assurez-vous que les parties de la date sont correctement extraites
          console.log('Parts of the date: ', parts)
          if (parts.length === 3) {
            const formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}` // Conversion en format YYYY-MM-DD
            console.log('Formatted Date: ', formattedDate)
            setDateDeRecuperation(formattedDate)
          }
        } else {
          setDateDeRecuperation('')
        }
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données de l'analyse:",
        error
      )
    }
  }

  const handleTestSelection = (testId) => {
    if (!selectedTests.find((test) => test._id === testId)) {
      const selectedTest = availableTests.find((test) => test._id === testId)
      if (selectedTest) {
        setSelectedTests([...selectedTests, selectedTest])
      }
    }
  }

  const handleTestRemoval = (testId) => {
    setSelectedTests(selectedTests.filter((test) => test._id !== testId))
  }

  const handleOrdonnanceChange = (event) => {
    setOrdonnancePdf(event.target.files[0])
  }

  // Fonction pour filtrer les tests basée sur la recherche
  const filteredTests =
    searchTerm.length > 0
      ? availableTests.filter((test) =>
          test.nom.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : availableTests

  // const handleSubmit = async (e) => {
  //   e.preventDefault()
  //   const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  //   const token = userInfo?.token

  //   const formData = new FormData()
  //   formData.append(
  //     'tests',
  //     JSON.stringify(selectedTests.map((test) => test._id))
  //   )
  //   if (ordonnancePdf) {
  //     formData.append('ordonnancePdf', ordonnancePdf)
  //   }
  //   if (hasInsurance) {
  //     formData.append('partenaireId', selectedPartenaireId)
  //     formData.append('pourcentageCouverture', pourcentageCouverture)
  //   }
  //   if (hasReduction) {
  //     formData.append('reduction', reductionValue)
  //     formData.append('typeReduction', reductionType)
  //   }

  //   try {
  //     const response = await fetch(`${apiUrl}/api/analyse/${analyseId}`, {
  //       method: 'PUT',
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: formData,
  //     })
  //     const data = await response.json()
  //     if (data.success) {
  //       setShowModal(false)
  //       onAnalyseUpdated()
  //     }
  //   } catch (error) {
  //     console.error("Erreur lors de la mise à jour de l'analyse:", error)
  //   }
  // }
  const handleSubmit = async (e) => {
    e.preventDefault()
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const token = userInfo?.token

    const formData = new FormData()
    selectedTests.forEach((test) => {
      formData.append('tests', test._id) // Ajouter chaque ID de test individuellement
    })
    if (ordonnancePdf) {
      formData.append('ordonnancePdf', ordonnancePdf)
    }
    formData.append('pc1', pc1 ? 2000 : 0) // Envoyer 2000 si coché, sinon 0
    formData.append('pc2', pc2 ? 4000 : 0) // Envoyer 4000 si coché, sinon 0
    formData.append('deplacement', deplacement) // Envoyer la valeur de déplacemen
    formData.append('dateDeRecuperation', dateDeRecuperation)

    // Vérifie que selectedPartenaireId n'est pas une chaîne vide avant de l'ajouter
    if (hasInsurance) {
      formData.append('partenaireId', selectedPartenaireId)
      // Assumer que pourcentageCouverture a une valeur valide si selectedPartenaireId est présent
      formData.append('pourcentageCouverture', pourcentageCouverture.toString())
    }
    // De même, pour la réduction, vérifie que reductionType n'est pas vide
    if (reductionType && reductionValue > 0) {
      formData.append('reduction', reductionValue.toString()) // Convertir en chaîne si nécessaire
      formData.append('typeReduction', reductionType)
    }
    formData.append('statusPayement', statusPayement)

    try {
      const response = await fetch(`${apiUrl}/api/analyse/${analyseId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          // Ne pas définir 'Content-Type' ici; FormData s'en charge
        },
        body: formData,
      })
      const data = await response.json()
      if (data.success) {
        console.log(formData)
        setShowModal(false)
        onAnalyseUpdated()
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'analyse:", error)
      console.log(formData)
    }
  }

  return (
    <>
      <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
        <FontAwesomeIcon icon={faEdit} />
      </button>
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Modifier l'analyse</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Filtre tests</span>
                </label>
                <input
                  type="text"
                  placeholder="Rechercher des tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered w-full mb-2"
                />
                <label className="label">
                  <span className="label-text">Tests</span>
                </label>
                <select
                  className="select select-bordered"
                  defaultValue=""
                  onChange={(e) => handleTestSelection(e.target.value)}
                >
                  <option disabled value="">
                    Choisir des tests
                  </option>
                  {filteredTests.map((test) => (
                    <option key={test._id} value={test._id}>
                      {test.nom}
                    </option>
                  ))}
                </select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTests.map((test) => (
                    <div
                      key={test._id}
                      className="badge badge-primary badge-outline"
                    >
                      {test.nom}
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="ml-2 cursor-pointer"
                        onClick={() => handleTestRemoval(test._id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-control">
                <label className="cursor-pointer label">
                  <span className="label-text">
                    Avez-vous une assurance ou êtes-vous sous IPM ?
                  </span>
                  <div className="flex mt-2">
                    <input
                      type="radio"
                      name="hasInsurance"
                      className="radio radio-primary"
                      checked={hasInsurance === 'oui'}
                      onChange={() => setHasInsurance('oui')}
                    />{' '}
                    <span className="ml-2">Oui</span>
                    <input
                      type="radio"
                      name="hasInsurance"
                      className="radio radio-primary ml-4"
                      checked={hasInsurance === 'non'}
                      onChange={() => setHasInsurance('non')}
                    />{' '}
                    <span className="ml-2">Non</span>
                  </div>
                </label>
                {hasInsurance === 'oui' && (
                  <>
                    <select
                      className="select select-primary w-full max-w-xs mt-2"
                      value={selectedPartenaireId}
                      onChange={(e) => {
                        setSelectedPartenaireId(e.target.value)
                        // Si aucun partenaire n'est sélectionné (valeur vide), réinitialiser pourcentageCouverture à 0
                        if (e.target.value === '') {
                          setPourcentageCouverture('0') // Assurez-vous que ceci est cohérent avec le type attendu (string ou number)
                        }
                      }}
                    >
                      <option value="">Sélectionner un partenaire</option>
                      {partenaires.map((partenaire) => (
                        <option key={partenaire._id} value={partenaire._id}>
                          {partenaire.nom}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Pourcentage de couverture"
                      className="input input-primary w-full max-w-xs mt-2"
                      value={pourcentageCouverture}
                      onChange={(e) => setPourcentageCouverture(e.target.value)}
                    />
                  </>
                )}
              </div>
              <div>
                <label className="cursor-pointer label">
                  <span className="label-text">PC1 (2000 Cfa)</span>
                  <input
                    type="checkbox"
                    checked={pc1}
                    onChange={(e) => setPc1(e.target.checked)}
                    className="checkbox checkbox-primary ml-4"
                  />
                </label>
              </div>
              <div>
                <label className="cursor-pointer label">
                  <span className="label-text">PC2 (4000 Cfa)</span>
                  <input
                    type="checkbox"
                    checked={pc2}
                    onChange={(e) => setPc2(e.target.checked)}
                    className="checkbox checkbox-primary ml-4"
                  />
                </label>
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Déplacement</span>
                </label>
                <input
                  type="number"
                  value={deplacement}
                  onChange={(e) => setDeplacement(e.target.value)}
                  className="input input-bordered input-primary w-full max-w-xs"
                />
              </div>
              <div className="form-control">
                <label className="cursor-pointer label">
                  <span className="label-text">Avez-vous une réduction ?</span>
                  <div className="flex mt-2">
                    <input
                      type="radio"
                      name="hasReduction"
                      className="radio radio-primary"
                      checked={hasReduction === 'oui'}
                      onChange={() => setHasReduction('oui')}
                    />{' '}
                    <span className="ml-2">Oui</span>
                    <input
                      type="radio"
                      name="hasReduction"
                      className="radio radio-primary ml-4"
                      checked={hasReduction === 'non'}
                      onChange={() => setHasReduction('non')}
                    />{' '}
                    <span className="ml-2">Non</span>
                  </div>
                </label>
                {hasReduction === 'oui' && (
                  <>
                    <select
                      className="select select-primary w-full max-w-xs mt-2"
                      value={reductionType}
                      onChange={(e) => {
                        setReductionType(e.target.value)
                        // Si "Sélectionner une type" est choisi (valeur vide), réinitialiser reductionValue à 0
                        if (e.target.value === '') {
                          setReductionValue(0) // Réinitialiser la valeur de réduction, assurez-vous que cela est cohérent avec vos attentes (ici mis comme une chaîne vide pour signifier "pas de réduction")
                        }
                      }}
                    >
                      <option value="">Sélectionner un type</option>
                      <option value="pourcentage">Pourcentage</option>
                      <option value="montant">Montant</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Valeur de la réduction"
                      className="input input-primary w-full max-w-xs mt-2"
                      value={reductionValue}
                      onChange={(e) => setReductionValue(e.target.value)}
                    />
                  </>
                )}
              </div>
              {/* Champ pour l'ordonnance PDF */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Ordonnance (PDF)</span>
                </label>
                <input
                  type="file"
                  className="file-input file-input-bordered file-input-primary w-full max-w-xs"
                  onChange={handleOrdonnanceChange}
                />
              </div>
              {/* // Dans le formulaire de soumission */}
              <div className="form-control">
                <label className="label">Status du paiement</label>
                <select
                  className="select select-bordered"
                  value={statusPayement}
                  onChange={(e) => setStatusPayement(e.target.value)}
                >
                  <option value="" disabled>
                    Choisissez
                  </option>
                  {/* option */}
                  <option value="Impayée">Impayée</option>
                  <option value="Payée">Payée</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Date de récupération</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={dateDeRecuperation}
                  onChange={(e) => setDateDeRecuperation(e.target.value)}
                />
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  Enregistrer
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                >
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

EditAnalyseButton.propTypes = {
  analyseId: PropTypes.string.isRequired,
  onAnalyseUpdated: PropTypes.func.isRequired,
}

export default EditAnalyseButton
