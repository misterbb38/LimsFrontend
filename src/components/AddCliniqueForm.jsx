import { useState } from 'react'
import PropTypes from 'prop-types'

// Ajout d'une clinique partenaire : on cree d'abord l'entree
// Partenaire (typePartenaire='clinique') puis le compte utilisateur
// associe (User type='partenaire') en cascade. Le NIP est genere
// cote backend (route /api/user/signup -> getNextNip).
function AddCliniqueForm({ onPartenaireChange }) {
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(true)

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  const reset = () => {
    setNom('')
    setTelephone('')
    setEmail('')
    setPassword('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
    const token = userInfo?.token

    try {
      // 1) Creation du Partenaire (type=clinique)
      const partRes = await fetch(`${apiUrl}/api/partenaire/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom,
          telephone: telephone || undefined,
          typePartenaire: 'clinique',
        }),
      })
      if (!partRes.ok) {
        const err = await partRes.json().catch(() => ({}))
        throw new Error(
          err.message || `Echec creation Partenaire (${partRes.status})`
        )
      }
      const partJson = await partRes.json()
      const partenaireId =
        partJson?.data?._id || partJson?._id || partJson?.data?.id

      // 2) Creation du compte User type='partenaire' lie au Partenaire
      const userRes = await fetch(`${apiUrl}/api/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom,
          prenom: '-',
          email: email || `clinique-${Date.now()}@bioram.local`,
          password,
          telephone: telephone || `clinique-${Date.now()}`,
          sexe: 'homme',
          userType: 'partenaire',
          partenaireId,
        }),
      })
      if (!userRes.ok) {
        const err = await userRes.json().catch(() => ({}))
        throw new Error(
          err.message || `Echec creation compte (${userRes.status})`
        )
      }

      setToastMessage('Clinique + compte créés avec succès')
      setIsSuccess(true)
      onPartenaireChange()
      reset()
    } catch (error) {
      setToastMessage("Erreur : " + error.message)
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3500)
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
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm font-medium base-content">
            Nom de la clinique *
          </label>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="w-full mt-1 input input-bordered"
          />
        </div>

        <div>
          <label className="text-sm font-medium base-content">Téléphone</label>
          <input
            type="text"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="w-full mt-1 input input-bordered"
          />
        </div>

        <div>
          <label className="text-sm font-medium base-content">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 input input-bordered"
          />
        </div>

        <div>
          <label className="text-sm font-medium base-content">
            Mot de passe *
          </label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="A communiquer à la clinique"
            className="w-full mt-1 input input-bordered"
          />
          <small className="text-gray-500">
            Le NIP sera généré automatiquement.
          </small>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        )}

        <button type="submit" className="mt-2 btn btn-primary w-full">
          Ajouter la clinique
        </button>
      </form>
    </>
  )
}

AddCliniqueForm.propTypes = {
  onPartenaireChange: PropTypes.func.isRequired,
}

export default AddCliniqueForm
