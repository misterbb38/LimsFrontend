import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

function EditPartenaireButton({ partenaireId, onpartenaireUpdated }) {
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [formData, setFormData] = useState({
    typePartenaire: '',
    telephone: '',
    nom: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    if (showModal && partenaireId) {
      fetchpartenaireData(partenaireId)
    }
  }, [showModal, partenaireId])

  const fetchpartenaireData = async (partenaireId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/partenaire/${partenaireId}`, {
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
      console.error('Erreur lors de la récupération du partenaire:', error)
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

    if (!formData.nom.trim()) errors.nom = 'La nom est obligatoire.'
    if (!formData.typePartenaire.trim())
      errors.telephone = 'La type est obligatoire.'
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
        const response = await fetch(
          `${apiUrl}/api/partenaire/${partenaireId}`,
          {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          }
        )
        const data = await response.json()
        if (data.success) {
          setShowToast(true)
          setTimeout(() => setShowToast(false), 3000)
          setShowModal(false)
          onpartenaireUpdated() // Rappel pour actualiser la liste des partenaires
        } else {
          console.error('La mise à jour a échoué.')
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du partenaire:', error)
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
              {/* Champs du formulaire pour éditer un partenaire */}
              <div className="form-control">
                <label className="label">Nom</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                />
                {renderError('nom')}
              </div>

              <div className="form-control">
                <label className="label">telephone</label>
                <textarea
                  className="input input-bordered"
                  type="text"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control">
                <label className="label">Type de partenaire</label>
                <select
                  className="select select-bordered"
                  name="typePartenaire"
                  value={formData.typePartenaire}
                  onChange={handleChange}
                >
                  <option disabled value="" selected>
                    Choisissez un type
                  </option>
                  <option value="assurance">assurance</option>

                  <option value="ipm">ipm</option>
                </select>
              </div>
              {renderError('typePartenaire')}
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
            Partenaire mis à jour avec succès.
          </div>
        </div>
      )}
    </>
  )
}

EditPartenaireButton.propTypes = {
  partenaireId: PropTypes.string.isRequired,
  onpartenaireUpdated: PropTypes.func.isRequired,
}

export default EditPartenaireButton
