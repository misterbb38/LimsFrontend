import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

// Edition du compte User type='partenaire' associe a une clinique.
// Si la clinique n'a pas de compte (userId vide), le bouton est
// desactive.
function EditCliniqueButton({ userId, onPartenaireUpdated }) {
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    email: '',
    nip: '',
    password: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    if (showModal && userId) fetchUser(userId)
  }, [showModal, userId])

  const fetchUser = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/user/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        setFormData({
          nom: data.data.nom || '',
          telephone: data.data.telephone || '',
          email: data.data.email || '',
          nip: data.data.nip || '',
          password: '', // Vide : ne sera envoye que si l'utilisateur le saisit
        })
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du compte:', error)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.nom.trim()) errors.nom = 'Le nom est obligatoire.'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validateForm()
    setFormErrors(errors)
    if (Object.keys(errors).length !== 0) return

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      // On ne transmet le password que s'il est fourni (sinon il
      // serait re-hashe vide et casserait la connexion).
      const payload = {
        nom: formData.nom,
        telephone: formData.telephone,
        email: formData.email,
      }
      if (formData.password && formData.password.trim()) {
        payload.password = formData.password.trim()
      }
      const response = await fetch(`${apiUrl}/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (data.success || response.ok) {
        onPartenaireUpdated()
        setShowModal(false)
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3000)
      }
    } catch (error) {
      console.error('Erreur lors de la modification du compte:', error)
    }
  }

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => setShowModal(true)}
        disabled={!userId}
        title={!userId ? 'Aucun compte utilisateur associé' : 'Modifier'}
      >
        <FontAwesomeIcon icon={faEdit} />
      </button>

      {showToast && (
        <div className="toast toast-center toast-middle">
          <div className="alert alert-success">
            <span className="text-white">Compte mis à jour</span>
          </div>
        </div>
      )}

      {showModal && (
        <dialog open className="modal">
          <div className="modal-box">
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h3 className="font-bold text-lg">Modifier le compte clinique</h3>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="label">Nom de la clinique</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  required
                />
                {formErrors.nom && (
                  <span className="text-red-500 text-sm">{formErrors.nom}</span>
                )}
              </div>
              <div>
                <label className="label">Téléphone</label>
                <input
                  type="text"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="label">NIP (lecture seule)</label>
                <input
                  type="text"
                  name="nip"
                  value={formData.nip}
                  readOnly
                  className="input input-bordered w-full font-mono bg-base-200"
                />
              </div>
              <div>
                <label className="label">
                  Nouveau mot de passe (vide = inchangé)
                </label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input input-bordered w-full"
                  placeholder="Laisser vide pour ne pas modifier"
                />
              </div>
              <div className="modal-action">
                <button type="submit" className="btn btn-primary">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </>
  )
}

EditCliniqueButton.propTypes = {
  userId: PropTypes.string,
  onPartenaireUpdated: PropTypes.func.isRequired,
}

export default EditCliniqueButton
