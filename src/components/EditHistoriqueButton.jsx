import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

function EditHistoriqueButton({ historiqueId, onHistoriqueUpdated }) {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    if (showModal && historiqueId) {
      fetchHistoriqueData(historiqueId)
    }
  }, [showModal, historiqueId])

  const fetchHistoriqueData = async (historiqueId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/hist/${historiqueId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        setFormData({
          status: data.data.status,
          description: data.data.description,
        })
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error)
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

    if (!formData.status.trim()) errors.status = 'Le statut est obligatoire.'
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
        const response = await fetch(`${apiUrl}/api/hist/${historiqueId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        const data = await response.json()
        if (data.success) {
          setShowModal(false)
          onHistoriqueUpdated() // Callback pour rafraîchir les données d'historique
        } else {
          console.error('La mise à jour a échoué.')
        }
      } catch (error) {
        console.error("Erreur lors de la mise à jour de l'historique:", error)
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
            <h3 className="font-bold text-lg">Modifier l'Historique</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">Statut</label>
                <select
                  className="select select-bordered"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  {[
                    'Création',
                    'En attente',
                    'Approuvé',
                    'Échantillon collecté',
                    'Livré au laboratoire',
                    'Validé',
                    'Annulé',
                  ].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {renderError('status')}
              </div>
              <div className="form-control">
                <label className="label">Description</label>
                <textarea
                  className="textarea textarea-bordered"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
                {renderError('description')}
              </div>
              <div className="modal-action">
                <button className="btn btn-primary" type="submit">
                  Enregistrer
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

EditHistoriqueButton.propTypes = {
  historiqueId: PropTypes.string.isRequired,
  onHistoriqueUpdated: PropTypes.func.isRequired,
}

export default EditHistoriqueButton
