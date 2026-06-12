import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTimes } from '@fortawesome/free-solid-svg-icons'

function EditHistoriqueButton({ historiqueId, onHistoriqueUpdated }) {
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const modalBoxRef = useRef(null)
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  // Reset scroll a l'ouverture : interne au modal d'edition ET sur tous
  // les modal-box ancetres (ce modal est imbrique dans ViewAnalyseButton).
  // Plusieurs tentatives differees contrent les re-renders provoques par
  // le fetch des donnees historiques.
  useLayoutEffect(() => {
    if (!showModal) return
    const reset = () => {
      if (modalBoxRef.current) {
        modalBoxRef.current.scrollTop = 0
        let parent = modalBoxRef.current.parentElement
        while (parent) {
          if (parent.classList && parent.classList.contains('modal-box')) {
            parent.scrollTop = 0
          }
          parent = parent.parentElement
        }
      }
      window.scrollTo(0, 0)
    }
    reset()
    const t1 = setTimeout(reset, 0)
    const t2 = setTimeout(reset, 100)
    const t3 = setTimeout(reset, 300)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [showModal])

  // Fermeture par touche Echap
  useEffect(() => {
    if (!showModal) return
    const onKey = (e) => {
      if (e.key === 'Escape') setShowModal(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showModal])

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
      <button
        className="btn btn-secondary btn-sm"
        onClick={(e) => {
          // Remonte le scroll du modal parent (ViewAnalyseButton) avant
          // d'ouvrir l'edition pour que le formulaire soit immediatement
          // visible sans avoir a scroller manuellement.
          const parentModalBox = e.currentTarget.closest('.modal-box')
          if (parentModalBox) parentModalBox.scrollTop = 0
          window.scrollTo(0, 0)
          setShowModal(true)
        }}
      >
        <FontAwesomeIcon icon={faEdit} />
      </button>
      {showModal && (
        <div
          className="modal modal-open"
          style={{ zIndex: 9999 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <div
            ref={modalBoxRef}
            className="modal-box modal-md max-h-[90vh] overflow-y-auto"
          >
            <header className="modal-header">
              <h3 className="text-h2">Modifier l&apos;Historique</h3>
              <button
                type="button"
                aria-label="Fermer"
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="field-label" htmlFor="hist-status">
                  Statut
                </label>
                <select
                  id="hist-status"
                  className="select select-bordered w-full"
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
                    'Information',
                    'Validation technique',
                  ].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                {renderError('status')}
              </div>
              <div className="form-control">
                <label className="field-label" htmlFor="hist-desc">
                  Description
                </label>
                <textarea
                  id="hist-desc"
                  className="textarea textarea-bordered w-full min-h-[100px]"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
                {renderError('description')}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
                <button className="btn btn-primary" type="submit">
                  Enregistrer
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
