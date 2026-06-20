import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTimes } from '@fortawesome/free-solid-svg-icons'
import PaiementsSection from './PaiementsSection'
import RecapPaiement from './RecapPaiement'

function EditAnalyseButton({ analyseId, onAnalyseUpdated }) {
  const [showModal, setShowModal] = useState(false)
  const [selectedTests, setSelectedTests] = useState([])
  const [availableTests, setAvailableTests] = useState([])
  const [ordonnancePdf, setOrdonnancePdf] = useState(null)
  const [statusPayement, setStatusPayement] = useState('')
  const [typeAnalyse, setTypeAnalyse] = useState('')
  // const [pc1, setPc1] = useState(false)
  // const [pc2, setPc2] = useState(false)

  const [pc1Quantity, setPc1Quantity] = useState(0)
const [pc2Quantity, setPc2Quantity] = useState(0)
  const [deplacement, setDeplacement] = useState(0)
  const [dateDeRecuperation, setDateDeRecuperation] = useState('')
  const [avance, setAvance] = useState(0) // Nouvel état pour l'avance
  const [paiements, setPaiements] = useState([])
  const [prixPatient, setPrixPatient] = useState(0)
  const [prixTotal, setPrixTotal] = useState(0)
  const [prixPartenaireDisplay, setPrixPartenaireDisplay] = useState(0)
  const [reliquat, setReliquat] = useState(0) // Nouvel état pour le reliquat

  const [avancePatient, setAvancePatient] = useState(0) // Nouvel état pour l'avance

  const [hasInsurance, setHasInsurance] = useState('')
  const [selectedPartenaireId, setSelectedPartenaireId] = useState('')
  const [pourcentageCouverture, setPourcentageCouverture] = useState(0)

  // Clinique partenaire (separe d'assurance/IPM, juste informationnel).
  const [hasCliniquePartenaire, setHasCliniquePartenaire] = useState('')
  const [selectedCliniqueId, setSelectedCliniqueId] = useState('')
  const [searchTermClinique, setSearchTermClinique] = useState('')

  const [hasReduction, setHasReduction] = useState('')
  const [reductionType, setReductionType] = useState('pourcentage')
  const [reductionValue, setReductionValue] = useState(0)

  const [partenaires, setPartenaires] = useState([])

  // Ajout d'un état pour la recherche
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTermPartenaire, setSearchTermPartenaire] = useState('')
  const [isLoading, setIsLoading] = useState(false) // État pour le chargement

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

  useEffect(() => {
    setHasInsurance(selectedPartenaireId ? 'oui' : 'non')
  }, [selectedPartenaireId])

  useEffect(() => {
    setHasReduction(reductionValue > 0 ? 'oui' : 'non')
  }, [reductionValue])

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
        setSelectedTests(Array.isArray(data.data.tests) ? data.data.tests : [])
        setOrdonnancePdf(data.data.ordonnancePdf || null)
        const partenaireId =
          data.data.partenaireId && data.data.partenaireId._id
            ? data.data.partenaireId._id
            : ''
        setHasInsurance(!!partenaireId ? 'oui' : 'non')
        setSelectedPartenaireId(partenaireId)
        setPourcentageCouverture(data.data.pourcentageCouverture || 0)

        // Pre-remplit la clinique partenaire si l'analyse en a une.
        const cliniqueId =
          data.data.cliniquePartenaireId && data.data.cliniquePartenaireId._id
            ? data.data.cliniquePartenaireId._id
            : ''
        setHasCliniquePartenaire(cliniqueId ? 'oui' : 'non')
        setSelectedCliniqueId(cliniqueId)
        setHasReduction(data.data.reduction > 0 ? 'oui' : 'non')
        setReductionType(data.data.typeReduction || 'pourcentage')
        setReductionValue(data.data.reduction || 0)
        // setPc1(data.data.pc1 === 2000) // true si pc1 est 2000, sinon false
        // setPc2(data.data.pc2 === 4000)

        setPc1Quantity(data.data.pc1 > 0 ? Math.round(data.data.pc1 / 2000) : 0)
setPc2Quantity(data.data.pc2 > 0 ? Math.round(data.data.pc2 / 4000) : 0)
        setStatusPayement(data.data.statusPayement || 'Impayée') // Utilisez la valeur par défaut si aucune donnée n'est disponible
        setTypeAnalyse(data.data.typeAnalyse)
        setAvance(data.data.avance || 0) // Récupération de l'avance
        setAvancePatient(data.data.avance || 0) // Récupération de l'avance
        setPaiements(Array.isArray(data.data.paiements) ? data.data.paiements : [])
        setPrixPatient(Number(data.data.prixPatient) || 0)
        setPrixTotal(Number(data.data.prixTotal) || 0)
        setPrixPartenaireDisplay(Number(data.data.prixPartenaire) || 0)
        setReliquat(data.data.reliquat || 0) // Récupération du reliquat
        setDeplacement(data.data.deplacement || 0)

        // Date de recuperation en UTC (fuseau +00) : on lit les
        // composantes UTC et on les passe au champ datetime-local
        // pour que l'utilisateur voie la meme heure quel que soit
        // son fuseau navigateur.
        const raw = data.data.dateDeRecuperation
        if (raw) {
          const d = new Date(raw)
          if (!isNaN(d)) {
            const pad = (n) => String(n).padStart(2, '0')
            const formatted = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
            setDateDeRecuperation(formatted)
          } else {
            setDateDeRecuperation('')
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

  const searchInputRef = useRef(null)
  const dateRecupRef = useRef(null)

  const handleTestSelection = (testId) => {
    if (!selectedTests.find((test) => test._id === testId)) {
      const selectedTest = availableTests.find((test) => test._id === testId)
      if (selectedTest) {
        setSelectedTests([...selectedTests, selectedTest])
        setSearchTerm('')
        setTimeout(() => {
          if (searchInputRef.current) searchInputRef.current.focus()
        }, 0)
      }
    }
  }

  const handleTestRemoval = (testId) => {
    setSelectedTests(selectedTests.filter((test) => test._id !== testId))
  }

  const handleOrdonnanceChange = (event) => {
    setOrdonnancePdf(event.target.files[0])
  }

  const handleAvanceChange = (e) => {
    const value = parseFloat(e.target.value) || 0 // Utiliser parseFloat
    setAvance(value)
  }

  // Fonction pour filtrer les tests basée sur la recherche
  const filteredTests =
    searchTerm.length > 0
      ? availableTests
          .filter((test) =>
            test.nom.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .sort((a, b) => a.nom.localeCompare(b.nom)) // Ajout du tri alphabétique
      : availableTests.sort((a, b) => a.nom.localeCompare(b.nom))

  // Le bloc Assurance/IPM ne liste QUE assurance/ipm/sococim.
  const partenairesAssurance = partenaires.filter((p) =>
    ['assurance', 'ipm', 'sococim'].includes(p.typePartenaire)
  )
  const filteredPartenaires =
    searchTermPartenaire.length > 0
      ? partenairesAssurance
          .filter((partenaire) =>
            partenaire.nom
              .toLowerCase()
              .includes(searchTermPartenaire.toLowerCase())
          )
          .sort((a, b) => a.nom.localeCompare(b.nom))
      : partenairesAssurance.sort((a, b) => a.nom.localeCompare(b.nom))

  const cliniquesPartenaires = partenaires.filter(
    (p) => p.typePartenaire === 'clinique'
  )
  const filteredCliniques =
    searchTermClinique.length > 0
      ? cliniquesPartenaires
          .filter((c) =>
            c.nom.toLowerCase().includes(searchTermClinique.toLowerCase())
          )
          .sort((a, b) => a.nom.localeCompare(b.nom))
      : cliniquesPartenaires.sort((a, b) => a.nom.localeCompare(b.nom))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true) // Début du chargement
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const token = userInfo?.token

    const userconnect = userInfo?._id

    const formData = new FormData()
    selectedTests.forEach((test) => {
      formData.append('tests', test._id) // Ajouter chaque ID de test individuellement
    })
    if (ordonnancePdf) {
      formData.append('ordonnancePdf', ordonnancePdf)
    }
    formData.append('userOwn', userconnect)
    // formData.append('pc1', pc1 ? 2000 : 0) // Envoyer 2000 si coché, sinon 0
    // formData.append('pc2', pc2 ? 4000 : 0) // Envoyer 4000 si coché, sinon 0
    formData.append('pc1', pc1Quantity * 2000) // Calculer le montant total PC1
formData.append('pc2', pc2Quantity * 4000) // Calculer le montant total PC2
    formData.append('deplacement', deplacement) // Envoyer la valeur de déplacemen
    // Force interpretation UTC cote backend
    formData.append(
      'dateDeRecuperation',
      dateDeRecuperation ? `${dateDeRecuperation}:00Z` : ''
    )

    // Vérifie que selectedPartenaireId n'est pas une chaîne vide avant de l'ajouter
    if (hasInsurance === 'oui') {
      formData.append('partenaireId', selectedPartenaireId)
      // Assumer que pourcentageCouverture a une valeur valide si selectedPartenaireId est présent
      formData.append('pourcentageCouverture', pourcentageCouverture.toString())
    }

    // Clinique partenaire (informationnel). On envoie toujours la cle
    // pour permettre au backend de la vider si "non" est selectionne.
    if (hasCliniquePartenaire === 'oui' && selectedCliniqueId) {
      formData.append('cliniquePartenaireId', selectedCliniqueId)
    } else if (hasCliniquePartenaire === 'non') {
      formData.append('cliniquePartenaireId', '')
    }
    // De même, pour la réduction, vérifie que reductionType n'est pas vide
    if (reductionType && reductionValue > 0) {
      formData.append('reduction', reductionValue.toString()) // Convertir en chaîne si nécessaire
      formData.append('typeReduction', reductionType)
    }
    formData.append('statusPayement', statusPayement)
    formData.append('typeAnalyse', typeAnalyse)
    if (statusPayement === 'Reliquat') {
      formData.append('avance', avance) // Ajouter l'avance au formData
      console.log('Avance ajoutée au formData:', avance) // Vérification
    }

    // Detail des paiements (multi-modes). Toujours envoye (meme vide)
    // pour permettre la mise a jour. Le backend recalcule l'avance.
    formData.append('paiements', JSON.stringify(paiements))

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
    } finally {
      setIsLoading(false) // Fin du chargement
    }
  }

  return (
    <>
      <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(true)}>
        <FontAwesomeIcon icon={faEdit} />
      </button>
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Modifier l'analyse</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Filtre Paramettre</span>
                </label>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Rechercher des tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                  className="input input-bordered w-full mb-2"
                />
                <label className="label">
                  <span className="label-text">Paramettre</span>
                </label>
                <select
                  className="select select-bordered"
                  defaultValue=""
                  onChange={(e) => handleTestSelection(e.target.value)}
                  multiple
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

              {/* // Type d analyse */}
              <div className="form-control">
                <label className="label">
                  Type d'analyse(fait au labo ou pas)
                </label>
                <select
                  className="select select-bordered"
                  value={typeAnalyse}
                  onChange={(e) => setTypeAnalyse(e.target.value)}
                >
                  <option value="" disabled>
                    Choisissez
                  </option>
                  {/* option */}
                  <option value="Interne">Interne</option>
                  <option value="Externe">Externe</option>
                </select>
              </div>

              {/* Bloc Clinique partenaire (separe, informationnel). */}
              <div className="form-control">
                <label className="cursor-pointer label">
                  <span className="label-text">
                    Le patient vient-il d&apos;une clinique partenaire ?
                  </span>
                  <div className="flex mt-2">
                    <input
                      type="radio"
                      name="hasCliniquePartenaire"
                      className="radio radio-primary"
                      value="oui"
                      checked={hasCliniquePartenaire === 'oui'}
                      onChange={() => setHasCliniquePartenaire('oui')}
                    />{' '}
                    <span className="ml-2">Oui</span>
                    <input
                      type="radio"
                      name="hasCliniquePartenaire"
                      className="radio radio-primary ml-4"
                      value="non"
                      checked={hasCliniquePartenaire === 'non'}
                      onChange={() => {
                        setHasCliniquePartenaire('non')
                        setSelectedCliniqueId('')
                      }}
                    />{' '}
                    <span className="ml-2">Non</span>
                  </div>
                </label>
                {hasCliniquePartenaire === 'oui' && (
                  <>
                    <div>
                      <label className="label">
                        <span className="label-text">Filtre Clinique</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Rechercher une clinique..."
                        value={searchTermClinique}
                        onChange={(e) => setSearchTermClinique(e.target.value)}
                        className="input input-bordered w-full max-w-xs"
                      />
                    </div>
                    <select
                      className="select select-primary w-full max-w-xs mt-2"
                      value={selectedCliniqueId}
                      onChange={(e) => setSelectedCliniqueId(e.target.value)}
                      required
                    >
                      <option value="">Sélectionner une clinique</option>
                      {filteredCliniques.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.nom}
                        </option>
                      ))}
                    </select>
                  </>
                )}
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
                      value="oui"
                      checked={hasInsurance === 'oui'}
                      onChange={() => setHasInsurance('oui')}
                    />{' '}
                    <span className="ml-2">Oui</span>
                    <input
                      type="radio"
                      name="hasInsurance"
                      className="radio radio-primary ml-4"
                      value="non"
                      checked={hasInsurance === 'non'}
                      onChange={() => setHasInsurance('non')}
                    />{' '}
                    <span className="ml-2">Non</span>
                  </div>
                </label>
                {hasInsurance === 'oui' && (
                  <>
                    {/* <select
                      className="select select-primary w-full max-w-xs mt-2"
                      value={selectedPartenaireId}
                      onChange={(e) => {
                        setSelectedPartenaireId(e.target.value)
                        // Si aucun partenaire n'est sélectionné (valeur vide), réinitialiser pourcentageCouverture à 0
                        if (e.target.value === '') {
                          setPourcentageCouverture(0)
                        }
                      }}
                    >
                      <option value="">Sélectionner un partenaire</option>
                      {partenaires.map((partenaire) => (
                        <option key={partenaire._id} value={partenaire._id}>
                          {partenaire.nom}
                        </option>
                      ))}
                    </select> */}

                    <div>
                      <label className="label">
                        <span className="label-text">Filtre Partenaire</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Rechercher un partenaire..."
                        value={searchTermPartenaire}
                        onChange={(e) =>
                          setSearchTermPartenaire(e.target.value)
                        }
                        className="input input-bordered w-full max-w-xs"
                      />
                    </div>

                    <select
                      className="select select-primary w-full max-w-xs mt-2"
                      value={selectedPartenaireId}
                      onChange={(e) => {
                        setSelectedPartenaireId(e.target.value)
                        if (e.target.value === '') {
                          setPourcentageCouverture(0) // Réinitialise le pourcentage de couverture si aucun partenaire n'est sélectionné
                        }
                      }}
                    >
                      <option value="">Sélectionner un partenaire</option>
                      {filteredPartenaires.map((partenaire) => (
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
              {/* <div>
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
              </div> */}

              <div>
  <label className="label">
    <span className="label-text">Nombre de PC1 (2000 CFA chacun)</span>
  </label>
  <input
    type="number"
    min="0"
    value={pc1Quantity}
    onChange={(e) => setPc1Quantity(parseInt(e.target.value) || 0)}
    className="input input-bordered input-primary w-full max-w-xs"
    placeholder="Ex: 2 pour sang + urine"
  />
  <span className="text-sm text-gray-600 mt-1">
    Total PC1: {pc1Quantity * 2000} CFA
  </span>
</div>

<div>
  <label className="label">
    <span className="label-text">Nombre de PC2 (4000 CFA chacun)</span>
  </label>
  <input
    type="number"
    min="0"
    value={pc2Quantity}
    onChange={(e) => setPc2Quantity(parseInt(e.target.value) || 0)}
    className="input input-bordered input-primary w-full max-w-xs"
    placeholder="Nombre de prélèvements PC2"
  />
  <span className="text-sm text-gray-600 mt-1">
    Total PC2: {pc2Quantity * 4000} CFA
  </span>
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
                      value="oui"
                      checked={hasReduction === 'oui'}
                      onChange={() => setHasReduction('oui')}
                    />{' '}
                    <span className="ml-2">Oui</span>
                    <input
                      type="radio"
                      name="hasReduction"
                      className="radio radio-primary ml-4"
                      value="non"
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
              {/* Recap automatique : part patient / part partenaire +
                  statut paiement calcule cote backend. L'utilisateur
                  saisit juste les paiements ; le statut suit. */}
              <RecapPaiement
                prixTotal={Number(prixTotal) || 0}
                prixPartenaire={Number(prixPartenaireDisplay) || 0}
                prixPatient={prixPatient}
                paiements={paiements}
                reductionAppliquee={(() => {
                  // prixPatient stocke = deja apres reduction. On
                  // reconstruit le montant deduit pour l'affichage.
                  const r = Number(reductionValue) || 0
                  if (hasReduction !== 'oui' || r <= 0) return 0
                  if (reductionType === 'montant') return r
                  if (reductionType === 'pourcentage' && r < 100) {
                    return (prixPatient * r) / (100 - r)
                  }
                  return 0
                })()}
              />

              <PaiementsSection
                value={paiements}
                onChange={setPaiements}
                prixPatient={prixPatient}
              />

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Date de récupération</span>
                </label>
                <input
                  ref={dateRecupRef}
                  type="datetime-local"
                  className="input input-bordered cursor-pointer"
                  value={dateDeRecuperation}
                  onChange={(e) => setDateDeRecuperation(e.target.value)}
                  onClick={() => {
                    try { dateRecupRef.current?.showPicker?.() } catch (_) {}
                  }}
                />
              </div>
              <div className="modal-action">
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    <span className="loading loading-spinner text-primary"></span>
                  </div>
                ) : (
                  <button type="submit" className="btn btn-primary">
                    Enregistrer
                  </button>
                )}
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
