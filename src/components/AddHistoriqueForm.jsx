// import { useState } from 'react'
// import PropTypes from 'prop-types'

// function AddHistoriqueForm({ analyseId, onHistoriqueChange }) {
//   const [status, setStatus] = useState('')
//   const [description, setDescription] = useState('')
//   const [isLoading, setIsLoading] = useState(false)
//   const [showToast, setShowToast] = useState(false)
//   const [toastMessage, setToastMessage] = useState('')
//   const [isSuccess, setIsSuccess] = useState(true)

//   const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
//   const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
//   const userType = userInfo.userType // 'type' devrait être la clé où le type d'utilisateur est stocké

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setIsLoading(true)
//     const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
//     const token = userInfo?.token
//     const updatedUser = userInfo._id

//     try {
//       const response = await fetch(`${apiUrl}/api/hist/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           analyseId,
//           status,
//           description,
//           updatedBy: updatedUser,
//         }),
//       })

//       if (response.ok) {
//         const data = await response.json()
//         setToastMessage('Historique ajouté avec succès')
//         setIsSuccess(true)
//         onHistoriqueChange() // Callback pour signaler une modification
//         setStatus('')
//         setDescription('')
//       } else {
//         const errorData = await response.json()
//         setToastMessage(errorData.message || "Échec de l'ajout de l'historique")
//         setIsSuccess(false)
//       }
//     } catch (error) {
//       setToastMessage("Erreur lors de l'envoi du formulaire : " + error.message)
//       setIsSuccess(false)
//     } finally {
//       setIsLoading(false)
//       setShowToast(true)
//       setTimeout(() => setShowToast(false), 3000)
//     }
//   }

//   return (
//     <>
//       {showToast && (
//         <div className="toast toast-center toast-middle">
//           <div
//             className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}
//           >
//             <span className="text-white">{toastMessage}</span>
//           </div>
//         </div>
//       )}
//       <form onSubmit={handleSubmit}>
//         {/* Statut */}
//         <div>
//           <label className="label">Statut</label>
//           <select
//             className="select select-bordered w-full max-w-xs"
//             value={status}
//             onChange={(e) => setStatus(e.target.value)}
//             required
//           >
//             <option value="">Choisir un statut</option>
//             <option value="En attente">En attente</option>
//             <option value="Approuvé">Approuvé</option>
//             <option value="Échantillon collecté">Échantillon collecté</option>
//             <option value="Livré au laboratoire">Livré au laboratoire</option>

//             <option value="Annulé">Annulé</option>
//             {/* Conditionner l'affichage de l'option "Validé" */}
//             {userType === 'medecin' && <option value="Validé">Validé</option>}
//             {/* Ajoutez d'autres options de statut ici */}
//           </select>
//         </div>

//         {/* Description */}
//         <div>
//           <label className="label">Description</label>
//           <textarea
//             className="textarea textarea-bordered w-full"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             required
//           ></textarea>
//         </div>

//         {isLoading ? (
//           <div className="flex justify-center items-center">
//             <span className="loading loading-spinner text-primary"></span>
//           </div>
//         ) : (
//           <button type="submit" className="btn btn-primary mt-4">
//             Ajouter l'historique
//           </button>
//         )}
//       </form>
//     </>
//   )
// }

// AddHistoriqueForm.propTypes = {
//   analyseId: PropTypes.string.isRequired,
//   onHistoriqueChange: PropTypes.func.isRequired,
// }

// export default AddHistoriqueForm

import { useState } from 'react'
import PropTypes from 'prop-types'

function AddHistoriqueForm({
  analyseId,
  onHistoriqueChange,
  existingHistoriques,
}) {
  const [status, setStatus] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(true)

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
  const userType = userInfo.userType // 'type' devrait être la clé où le type d'utilisateur est stocké

  const isValidePresent = existingHistoriques.some((h) => h.status === 'Validé')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const token = userInfo?.token
    const updatedUser = userInfo._id

    try {
      const response = await fetch(`${apiUrl}/api/hist/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          analyseId,
          status,
          description,
          updatedBy: updatedUser,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setToastMessage('Historique ajouté avec succès')
        setIsSuccess(true)
        onHistoriqueChange() // Callback pour signaler une modification
        setStatus('')
        setDescription('')
      } else {
        const errorData = await response.json()
        setToastMessage(errorData.message || "Échec de l'ajout de l'historique")
        setIsSuccess(false)
      }
    } catch (error) {
      setToastMessage("Erreur lors de l'envoi du formulaire : " + error.message)
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
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
        {/* Statut */}
        <div>
          <label className="label">Statut</label>
          <select
            className="select select-bordered w-full max-w-xs"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
          >
            <option value="">Choisir un statut</option>
            <option value="En attente">En attente</option>
            <option value="Approuvé">Approuvé</option>
            <option value="Échantillon collecté">Échantillon collecté</option>
            <option value="Livré au laboratoire">Livré au laboratoire</option>
            <option value="Annulé">Annulé</option>
            {/* Conditionner l'affichage de l'option "Validé" */}
            {userType === 'medecin' && !isValidePresent && (
              <option value="Validé">Validé</option>
            )}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="label">Description</label>
          <textarea
            className="textarea textarea-bordered w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        ) : (
          <button type="submit" className="btn btn-primary mt-4">
            Ajouter l'historique
          </button>
        )}
      </form>
    </>
  )
}

AddHistoriqueForm.propTypes = {
  analyseId: PropTypes.string.isRequired,
  onHistoriqueChange: PropTypes.func.isRequired,
  existingHistoriques: PropTypes.array.isRequired, // Ajout du type pour les nouvelles props
}

export default AddHistoriqueForm
