import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

function EditTestButton({ testId, ontestUpdated }) {
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    prixAssurance: '',
    prixIpm: '',
    prixPaf: '',
    prixClinique: '',
    coeficiantB: '',
    nom: '',
    description: '',
    categories: '', // Nouveau champ
    valeurMachineA: '',
    valeurMachineB: '',
    machineA: '',
    machineB: '',
    interpretationA: '',
    interpretationB: '',
    prixSococim: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    if (showModal && testId) {
      fetchtestData(testId)
    }
  }, [showModal, testId])

  const fetchtestData = async (testId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/test/${testId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        setFormData(data.data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du test:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }

  const validateForm = () => {
    let errors = {}

    if (!formData.prixAssurance.toString().trim())
      errors.prix = 'Le prix  est obligatoire.'
    if (!formData.prixIpm.toString().trim())
      errors.prix = 'Le prix  est obligatoire.'
    if (!formData.prixPaf.toString().trim())
      errors.prix = 'Le prix  est obligatoire.'
    if (!formData.prixSococim.toString().trim())
      errors.prix = 'Le prix  est obligatoire.'
    if (!formData.prixClinique.toString().trim())
      errors.prix = 'Le prix  est obligatoire.'
    if (!formData.coeficiantB.toString().trim())
      errors.prix = 'Le coeficiant B  est obligatoire.'
    if (!formData.nom.trim()) errors.nom = 'La nom est obligatoire.'
    if (!formData.description.trim())
      errors.description = 'La description est obligatoire.'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validateForm()
    setFormErrors(errors)

    if (Object.keys(errors).length === 0) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const token = userInfo?.token
        const response = await fetch(`${apiUrl}/api/test/${testId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        const data = await response.json()
        if (data.success) {
          setShowToast(true)
          setTimeout(() => setShowToast(false), 3000)
          setShowModal(false)
          ontestUpdated() // Rappel pour actualiser la liste des tests
        } else {
          console.error('La mise à jour a échoué.')
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du test:', error)
      }
    }
  }

  const renderError = (fieldref) => {
    if (formErrors[fieldref]) {
      return (
        <span className="text-red-500 text-xs">{formErrors[fieldref]}</span>
      )
    }
    return null
  }

  return (
    <>
      <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
        <FontAwesomeIcon icon={faEdit} />
      </button>
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <form onSubmit={handleSubmit}>
              {/* Champs du formulaire pour éditer un test */}
              <div className="form-control">
                <label className="label">Nom</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                />
                {renderError('status')}
              </div>
              <div className="form-control">
                <label className="label">Prix assurance</label>
                <input
                  className="input input-bordered"
                  type="number"
                  name="prixAssurance"
                  value={formData.prixAssurance}
                  onChange={handleChange}
                />
                {renderError('prixAssurance')}
              </div>
              <div className="form-control">
                <label className="label">Prix IPM</label>
                <input
                  className="input input-bordered"
                  type="number"
                  name="prixIpm"
                  value={formData.prixIpm}
                  onChange={handleChange}
                />
                {renderError('prixIpm')}
              </div>
              <div className="form-control">
                <label className="label">Prix Sococim</label>
                <input
                  className="input input-bordered"
                  type="number"
                  name="prixSococim"
                  value={formData.prixSococim}
                  onChange={handleChange}
                />
                {renderError('prixSococim')}
              </div>
              <div className="form-control">
                <label className="label">Prix Clinique</label>
                <input
                  className="input input-bordered"
                  type="number"
                  name="prixClinique"
                  value={formData.prixClinique}
                  onChange={handleChange}
                />
                {renderError('prixClinique')}
              </div>
              <div className="form-control">
                <label className="label">Prix Paf</label>
                <input
                  className="input input-bordered"
                  type="number"
                  name="prixPaf"
                  value={formData.prixPaf}
                  onChange={handleChange}
                />
                {renderError('prixPaf')}
              </div>
              <div className="form-control">
                <label className="label">Coeficiant B</label>
                <input
                  className="input input-bordered"
                  type="number"
                  name="coeficiantB"
                  value={formData.coeficiantB}
                  onChange={handleChange}
                />
                {renderError('coeficiantB')}
              </div>
              <div className="form-control">
                <label className="label">Description</label>
                <textarea
                  className="input input-bordered"
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
                {renderError('description')}
              </div>
              {/* Elements de formulaire pour saisir et modifier ces nouvelles valeurs */}
              <div className="form-control">
                <label className="label">Machine A</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="machineA"
                  value={formData.machineA}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control">
                <label className="label">Machine B</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="machineB"
                  value={formData.machineB}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  Valeur d'interpretation Machine A
                </label>
                <textarea
                  className="input input-bordered"
                  type="text"
                  name="valeurMachineA"
                  value={formData.valeurMachineA}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  Valeur d'interpretation Machine B
                </label>
                <textarea
                  className="input input-bordered"
                  type="text"
                  name="valeurMachineB"
                  value={formData.valeurMachineB}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control">
                <label className="label">Interprétation A</label>
                <textarea
                  className="textarea textarea-bordered"
                  name="interpretationA"
                  value={formData.interpretationA}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control">
                <label className="label">Interprétation B</label>
                <textarea
                  className="textarea textarea-bordered"
                  name="interpretationB"
                  value={formData.interpretationB}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control">
                <label className="label">Methode</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="categories"
                  value={formData.categories}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control">
                <label className="label">Statut</label>
                <select
                  className="select select-bordered"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </select>
              </div>
              {/* Autres champs existants */}

              <div className="modal-action">
                <button className="btn btn-primary" type="submit">
                  Enregistrer
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showToast && (
        <div className="toast toast-center toast-end">
          <div className="alert alert-success">
            Test mis à jour avec succès.
          </div>
        </div>
      )}
    </>
  )
}

EditTestButton.propTypes = {
  testId: PropTypes.string.isRequired,
  ontestUpdated: PropTypes.func.isRequired,
}

export default EditTestButton
