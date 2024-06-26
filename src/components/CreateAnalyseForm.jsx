import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

function CreateAnalyseForm({ onAnalyseChange }) {
  const [selectedPartenaireType, setSelectedPartenaireType] = useState('');

  const [selectedTests, setSelectedTests] = useState([])
  const [availableTests, setAvailableTests] = useState([])
  const [ordonnancePdf, setOrdonnancePdf] = useState(null)
  const [users, setUsers] = useState([])
  const [userOwn, setUserOwn] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [hasInsurance, setHasInsurance] = useState('')
  const [selectedPartenaireId, setSelectedPartenaireId] = useState('')
  const [statusPayement, setStatusPayement] = useState('')
  const [pourcentageCouverture, setPourcentageCouverture] = useState('')
  const [pc1, setPc1] = useState(false)
  const [pc2, setPc2] = useState(false)
  const [deplacement, setDeplacement] = useState(0)
  const [dateDeRecuperation, setDateDeRecuperation] = useState('')
  const [avance, setAvance] = useState() // Nouvel état pour l'avance
  const [partenaires, setPartenaires] = useState([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(true)
  const [isLoading, setIsLoading] = useState(false) // État pour le chargement

  const [hasReduction, setHasReduction] = useState(false) // Pour savoir si l'utilisateur a une réduction
  const [reductionType, setReductionType] = useState('pourcentage') // Pour le type de réduction
  const [reductionValue, setReductionValue] = useState('') // Pour la valeur de la réduction
  // Ajout d'un état pour la recherche
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTermPatient, setSearchTermPatient] = useState('')
  const [searchTermPartenaire, setSearchTermPartenaire] = useState('')
  

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    fetchUsers()
    fetchAvailableTests()
  }, [])

  async function fetchUsers() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const token = userInfo?.token
    const response = await fetch(`${apiUrl}/api/user/simpleusers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await response.json()
    if (data && data.data) {
      const sortedUsers = data.data.sort((a, b) => {
        // Convertit les dates en timestamps pour la comparaison
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
      setUsers(sortedUsers)
    }
  }

  const fetchAvailableTests = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const token = userInfo?.token
    try {
      const response = await fetch(`${apiUrl}/api/test/analyse`, {
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

  // Fonction pour charger les partenaires
  const fetchPartenaires = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const token = userInfo?.token
    // Remplacez par votre endpoint approprié
    const response = await fetch(`${apiUrl}/api/partenaire`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    const data = await response.json()
    setPartenaires(data.data || [])
  }

  useEffect(() => {
    fetchUsers()
    fetchAvailableTests()
    fetchPartenaires() // Chargez les partenaires au montage du composant
  }, [])

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

  // Assurez-vous que handleStatusPayementChange et handleSubmit sont corrects
  const handleStatusPayementChange = (e) => {
    setStatusPayement(e.target.value)
  }

  const handleAvanceChange = (e) => {
    const value = parseFloat(e.target.value) || 0 // Utilisez parseFloat
    setAvance(value)
    console.log('Avance mise à jour:', value) // Ajoutez un log pour vérifier
  }

  const handleUserChange = (e) => {
    setSelectedUserId(e.target.value)
  }

  const handlePartenaireChange = (e) => {
    const selectedId = e.target.value;
    setSelectedPartenaireId(selectedId);
    
    // Trouver le type de partenaire sélectionné
    const selectedPartenaire = partenaires.find(partenaire => partenaire._id === selectedId);
    if (selectedPartenaire) {
      setSelectedPartenaireType(selectedPartenaire.typePartenaire);
    } else {
      setSelectedPartenaireType('');
    }
  };
  

  // Fonction pour filtrer les tests basée sur la recherche
  const filteredTests =
  searchTerm.length > 0
    ? availableTests
        .filter((test) =>
          test.nom.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.nom.localeCompare(b.nom)) // Ajout du tri alphabétique
    : availableTests.sort((a, b) => a.nom.localeCompare(b.nom));


  // Fonction pour filtrer les patients basée sur la recherche
  const filteredPatients =
    searchTermPatient.length > 0
      ? users.filter((user) =>
          `${user.nom.toLowerCase()} ${user.prenom.toLowerCase()}`.includes(
            searchTermPatient.toLowerCase()
          )
        )
      : users

  const filteredPartenaires =
    searchTermPartenaire.length > 0
      ? partenaires.filter((partenaire) =>
          partenaire.nom
            .toLowerCase()
            .includes(searchTermPartenaire.toLowerCase())
        )
      : partenaires

  // Ajout d'une fonction pour réinitialiser le formulaire
  const resetForm = () => {
    setSelectedTests([])
    setOrdonnancePdf(null)
    setSelectedUserId('')
    setHasInsurance('')
    setSelectedPartenaireId('')
    setPourcentageCouverture('')
    setHasReduction(false)
    setReductionType('pourcentage')
    setReductionValue('')
    setSearchTerm('') // Si vous utilisez le filtrage des tests
    setSearchTermPatient('') // Si vous utilisez le filtrage des patients
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const token = userInfo?.token
    const userconnect = userInfo?._id

    // Utiliser FormData pour envoyer le fichier et les autres données
    const formData = new FormData()
    formData.append('userId', selectedUserId)
    selectedTests.forEach((test) => {
      formData.append('tests', test._id)
    })
    if (ordonnancePdf) {
      formData.append('ordonnancePdf', ordonnancePdf)
    }
    formData.append('userOwn', userconnect)
    if (pc1) formData.append('pc1', 2000)
    if (pc2) formData.append('pc2', 4000)
    formData.append('statusPayement', statusPayement || 'Impayée')

    if (statusPayement === 'Reliquat') {
      formData.append('avance', avance) // Ajouter l'avance au formData
      console.log('Avance ajoutée au formData:', avance) // Vérification
    }
    formData.append('deplacement', deplacement)
    formData.append('dateDeRecuperation', dateDeRecuperation)

    // Ajouter les données concernant l'assurance/IPM si l'utilisateur a répondu "oui"
    if (hasInsurance === 'oui') {
      formData.append('partenaireId', selectedPartenaireId)
      formData.append('pourcentageCouverture', pourcentageCouverture)
    }

    if (hasReduction) {
      formData.append('reduction', reductionValue)
      formData.append('typeReduction', reductionType)
    }

    try {
      const response = await fetch(`${apiUrl}/api/analyse/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Ne pas définir 'Content-Type' ici; il sera automatiquement défini par le navigateur
          // lorsque vous utilisez FormData, incluant le 'boundary' nécessaire pour les multipart/form-data
        },
        body: formData, // Passer FormData comme corps de la requête
      })
      const data = await response.json()
      console.log(data)
      if (data.success) {
        setToastMessage('Analyse ajoutée avec succès')
        setIsSuccess(true)
        onAnalyseChange()

        fetchAvailableTests()

        resetForm() // Réinitialiser le formulaire
      } else {
        setToastMessage(data.message || "Échec de l'ajout de l'analyse")
        setIsSuccess(false)
      }
    } catch (error) {
      setToastMessage("Erreur lors de l'envoi du formulaire : " + error.message)
      setIsSuccess(false)
      console.error("Erreur lors de la mise à jour de l'analyse:", error)
    } finally {
      setIsLoading(false) // Arrêter le chargement une fois la requête terminée
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
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
      <div className="create-analyse-form">
        <h3 className="font-bold text-lg">Ajouter l'analyse</h3>

        <form onSubmit={handleSubmit}>
          <div>
            <label className="label">
              <span className="label-text">Filtre Patient</span>
            </label>
            <input
              type="text"
              placeholder="Rechercher un patient..."
              value={searchTermPatient}
              onChange={(e) => setSearchTermPatient(e.target.value)}
              className="input input-bordered input-primary w-full max-w-xs"
            />
            <label className="label">
              <span className="label-text">Patient</span>
            </label>
            <select
              className="select select-primary w-full max-w-xs"
              id="userSelect"
              onChange={handleUserChange}
              value={selectedUserId}
              required
              
            >
              <option value="">Sélectionner un patient</option>
              {filteredPatients.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.nom} {user.prenom} {user.telephone}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Filtre Parametre</span>
            </label>
            <input
              type="text"
              placeholder="Rechercher des tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input input-bordered input-primary w-full max-w-xs"
            />
            <label className="label">
              <span className="label-text">Paramettre</span>
            </label>
            <select
              className="select select-primary w-full max-w-xs"
              onChange={(e) => handleTestSelection(e.target.value)}
              defaultValue=""
              required
              multiple
            >
              <option disabled value="">
                Choisir des paramettres
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

            {/* Ajout des boutons radio pour l'assurance */}
            <div className="form-control">
              <label className="cursor-pointer label">
                <span className="label-text">
                  Le patient a t-il une partenaire ?
                </span>
                <div className="flex mt-2">
                  <input
                    className="radio radio-primary"
                    type="radio"
                    value="oui"
                    checked={hasInsurance === 'oui'}
                    onChange={() => setHasInsurance('oui')}
                  />{' '}
                  <span className="ml-2">Oui</span>
                  <input
                    className="radio radio-primary"
                    type="radio"
                    value="non"
                    checked={hasInsurance === 'non'}
                    onChange={() => setHasInsurance('non')}
                  />{' '}
                  <span className="ml-2">Non</span>
                </div>
              </label>
            </div>

            {/* Afficher les champs conditionnels */}
            {hasInsurance === 'oui' && (
              <>
                {/* <div>
                  <select
                    id="partenaireSelect"
                    className="select select-primary w-full max-w-xs mt-2"
                    value={selectedPartenaireId}
                    onChange={(e) => setSelectedPartenaireId(e.target.value)}
                  >
                    <option value="">Sélectionner un partenaire</option>
                    {partenaires.map((partenaire) => (
                      <option key={partenaire._id} value={partenaire._id}>
                        {partenaire.nom}
                      </option>
                    ))}
                  </select>
                </div> */}

                <div>
                  <label className="label">
                    <span className="label-text">Filtre Partenaire</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Rechercher un partenaire..."
                    value={searchTermPartenaire}
                    onChange={(e) => setSearchTermPartenaire(e.target.value)}
                    className="input input-bordered input-primary w-full max-w-xs"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Partenaire</span>
                  </label>
                  <select
                    className="select select-primary w-full max-w-xs"
                    value={selectedPartenaireId}
                    onChange={handlePartenaireChange}
                    required
                  >
                    <option value="">Sélectionner un partenaire</option>
                    {filteredPartenaires.map((partenaire) => (
                      <option key={partenaire._id} value={partenaire._id}>
                        {partenaire.nom}
                      </option>
                    ))}
                  </select>
                </div>

                {['ipm', 'assurance', 'sococim'].includes(selectedPartenaireType) && (
      <div>
        <label>Pourcentage de couverture</label>
        <input
          type="number"
          className="input input-primary w-full max-w-xs"
          value={pourcentageCouverture}
          onChange={(e) => setPourcentageCouverture(e.target.value)}
        />
      </div>
    )}
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

          {/* Ajouter dans le formulaire, au-dessus du bouton de soumission */}
          <div>
            <label className="cursor-pointer label">
              <span className="label-text">Avez-vous une réduction ?</span>
              <div>
                <input
                  type="radio"
                  className="radio radio-primary ml-4"
                  name="hasReduction"
                  checked={hasReduction}
                  onChange={() => setHasReduction(true)}
                />{' '}
                <span className="ml-2">Oui</span>
                <input
                  className="radio radio-primary ml-4"
                  type="radio"
                  name="hasReduction"
                  checked={!hasReduction}
                  onChange={() => setHasReduction(false)}
                />{' '}
                <span className="ml-2">Non</span>
              </div>
            </label>
          </div>
          {hasReduction && (
            <>
              <div>
                <label>Type de réduction</label>
                <select
                  value={reductionType}
                  onChange={(e) => setReductionType(e.target.value)}
                  className="select select-primary w-full max-w-xs"
                >
                  <option value="pourcentage">Pourcentage</option>
                  <option value="montant">Montant</option>
                </select>
              </div>
              <div>
                <label>Valeur de la réduction</label>
                <input
                  type="number"
                  value={reductionValue}
                  onChange={(e) => setReductionValue(e.target.value)}
                  className="input input-primary w-full max-w-xs"
                />
              </div>
            </>
          )}
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
              onChange={handleStatusPayementChange}
            >
              <option value="" disabled>
                Choisissez
              </option>
              {/* option */}
              <option value="Impayée">Impayée</option>
              <option value="Payée">Payée</option>
              <option value="Reliquat">Sous reliquat</option>
            </select>
          </div>

          {statusPayement === 'Reliquat' && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Avance</span>
              </label>
              <input
                type="number"
                value={avance}
                onChange={handleAvanceChange}
                className="input input-bordered input-primary w-full max-w-xs"
              />
            </div>
          )}

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

          {isLoading ? (
            <div className="flex justify-center items-center">
              <span className="loading loading-spinner text-primary"></span>
            </div>
          ) : (
            <div className="actions">
              <button
                type="submit"
                className="btn btn-primary mt-1"
                disabled={isLoading}
              >
                Enregistrer
              </button>
            </div>
          )}
        </form>
      </div>
    </>
  )
}

CreateAnalyseForm.propTypes = {
  onAnalyseChange: PropTypes.func.isRequired,
}

export default CreateAnalyseForm
