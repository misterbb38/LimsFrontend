import { useState } from 'react'
import PropTypes from 'prop-types'

function AddPartenaireForm({ onPartenaireChange }) {
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [typePartenaire, setTypePartenaire] = useState('')

  const [isLoading, setIsLoading] = useState(false) // État pour le chargement
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(true)

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
  // Convertir la valeur de status en booléen

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true) // Commencer le chargement
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
    const token = userInfo?.token

    try {
      const response = await fetch(`${apiUrl}/api/partenaire/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom,
          telephone,
          typePartenaire,
        }),
      })

      if (response.ok) {
        setToastMessage('patenaire ajouté avec succès')
        setIsSuccess(true)
        onPartenaireChange()
        setNom('')
        setTelephone('')
        setTypePartenaire('')
      } else {
        const errorData = await response.json()
        setToastMessage(errorData.message || "Échec de l'ajout du patenaire")
        setIsSuccess(false)
      }
    } catch (error) {
      setToastMessage("Erreur lors de l'envoi du formulaire : " + error.message)
      setIsSuccess(false)
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
      <form onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-medium base-content">Nom</label>
          <br />
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="w-80 mt-2 rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
          />
        </div>

        <div>
          <label className="text-sm font-medium base-content">Telephone</label>
          <br />
          <input
            type="txt"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            className="w-80 mt-2 rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
          />
        </div>
        <div className="form-control">
          <label className="label">Type de partenaire</label>
          <select
            className="select select-bordered"
            name="typePartenaire"
            value={typePartenaire}
            onChange={(e) => setTypePartenaire(e.target.value)}
          >
            <option disabled value="" selected>
              Choisissez une type
            </option>
            <option value="assurance">assurance</option>

            <option value="ipm">ipm</option>
          </select>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        )}

        <button type="submit" className="mt-2 mb-2 btn btn-primary">
          Ajouter un patenaire
        </button>
      </form>
    </>
  )
}
AddPartenaireForm.propTypes = {
  onPartenaireChange: PropTypes.func.isRequired,
}

export default AddPartenaireForm
