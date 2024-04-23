import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

function EditResultatButton({ resultatId, onResultatUpdated }) {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    valeur: '',
    statutMachine: false,
    metode: '',
    statutInterpretation: false,
    typePrelevement: '',
    datePrelevement: '',
    remarque: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

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
        const datePrelevementFormatted = data.data.datePrelevement
          ? new Date(data.data.datePrelevement).toISOString().slice(0, 16) // Format the date to YYYY-MM-DDThh:mm
          : ''
        setFormData({
          valeur: data.data.valeur,
          statutInterpretation: data.data.statutInterpretation,
          typePrelevement: data.data.typePrelevement,
          datePrelevement: datePrelevementFormatted,
          remarque: data.data.remarque,
          methode: data.data.methode,
          statutMachine: data.data.statutMachine,
        })
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du résultat:', error)
    }
  }

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

  const validateForm = () => {
    let errors = {}
    if (!formData.valeur.trim()) errors.valeur = 'La valeur est obligatoire.'
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
        const response = await fetch(`${apiUrl}/api/resultats/${resultatId}`, {
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
          onResultatUpdated() // Callback to refresh resultat data
        } else {
          console.error('La mise à jour a échoué.')
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du résultat:', error)
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
            <h3 className="font-bold text-lg">Modifier le Résultat</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">Valeur</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="valeur"
                  value={formData.valeur}
                  onChange={handleChange}
                />
                {renderError('valeur')}
              </div>

              <div className="form-control">
                <label className="label">Statut de l'Interprétation</label>
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

              <div>
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

              <div className="form-control">
                <label className="label">Methode</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="methode"
                  value={formData.methode}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control">
                <label className="label">Type de Prélèvement</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="typePrelevement"
                  value={formData.typePrelevement}
                  onChange={handleChange}
                />
              </div>
              <div className="form-control">
                <label className="label">Date de Prélèvement</label>
                <input
                  className="input input-bordered"
                  type="datetime-local"
                  name="datePrelevement"
                  value={formData.datePrelevement}
                  onChange={handleChange}
                />
              </div>
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

EditResultatButton.propTypes = {
  resultatId: PropTypes.string.isRequired,
  onResultatUpdated: PropTypes.func.isRequired,
}

export default EditResultatButton
