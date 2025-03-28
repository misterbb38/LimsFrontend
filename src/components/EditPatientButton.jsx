// import { useState, useEffect } from 'react'
// import PropTypes from 'prop-types'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faEdit } from '@fortawesome/free-solid-svg-icons'

// function EditPatientButton({ userId, onuserUpdated }) {
//   const [showModal, setShowModal] = useState(false)
//   const [showToast, setShowToast] = useState(false)
//   const [formData, setFormData] = useState({
//     telephone: '',
//     prenom: '',
//     nom: '',
//     adresse: '',
//     password: '',
//     userType: '',
//     sexe: '',
//   })
//   const [formErrors, setFormErrors] = useState({})
//   const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

//   useEffect(() => {
//     if (showModal && userId) {
//       fetchuserData(userId)
//     }
//   }, [showModal, userId])

//   const fetchuserData = async (userId) => {
//     try {
//       const userInfo = JSON.parse(localStorage.getItem('userInfo'))
//       const token = userInfo?.token
//       const response = await fetch(`${apiUrl}/api/user/${userId}`, {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       })
//       const data = await response.json()
//       if (data.success) {
//         setFormData({
//           telephone: data.data.telephone,
//           prenom: data.data.prenom,
//           nom: data.data.nom,
//           adresse: data.data.adresse,
//           password: '', // Ne pas remplir pour des raisons de sécurité
//           userType: data.data.userType,
//           sexe: data.data.sexe, // Assurez-vous que cette ligne est présente
//         })
//       }
//     } catch (error) {
//       console.error('Erreur lors de la récupération du user:', error)
//     }
//   }

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     setFormData((prevFormData) => ({
//       ...prevFormData,
//       [name]: value,
//     }))
//   }

//   const validateForm = () => {
//     let errors = {}

//     if (!formData.prenom.toString().trim())
//       errors.prenom = 'Le prenom  est obligatoire.'
//     if (!formData.nom.trim()) errors.nom = 'La nom est obligatoire.'
//     if (!formData.adresse.trim()) errors.adresse = 'La adresse est obligatoire.'
//     if (!formData.adresse.trim())
//       errors.adresse = 'Numero de telephone est obligatoire.'
//     return errors
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     const errors = validateForm()
//     setFormErrors(errors)

//     if (Object.keys(errors).length === 0) {
//       try {
//         const userInfo = JSON.parse(localStorage.getItem('userInfo'))
//         const token = userInfo?.token
//         // Exemple correct pour le fetch d'update
//         const response = await fetch(`${apiUrl}/api/user/${userId}`, {
//           method: 'PUT',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(formData),
//         })

//         const data = await response.json()
//         if (data.success) {
//           setShowToast(true)
//           setTimeout(() => setShowToast(false), 3000)
//           setShowModal(false)
//           onuserUpdated() // Rappel pour actualiser la liste des users
//         } else {
//           console.error('La mise à jour a échoué.')
//         }
//       } catch (error) {
//         console.error('Erreur lors de la mise à jour du user:', error)
//       }
//     }
//   }

//   const renderError = (fieldref) => {
//     if (formErrors[fieldref]) {
//       return (
//         <span className="text-red-500 text-xs">{formErrors[fieldref]}</span>
//       )
//     }
//     return null
//   }

//   return (
//     <>
//       <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
//         <FontAwesomeIcon icon={faEdit} />
//       </button>
//       {showModal && (
//         <div className="modal modal-open">
//           <div className="modal-box">
//             <form onSubmit={handleSubmit}>
//               {/* Champs du formulaire pour éditer un user */}
//               <div className="form-control">
//                 <label className="label">Nom</label>
//                 <input
//                   className="input input-bordered"
//                   type="text"
//                   name="nom"
//                   value={formData.nom}
//                   onChange={handleChange}
//                 />
//                 {renderError('telepone')}
//               </div>
//               <div className="form-control">
//                 <label className="label">prenom</label>
//                 <input
//                   className="input input-bordered"
//                   type="text"
//                   name="prenom"
//                   value={formData.prenom}
//                   onChange={handleChange}
//                 />
//                 {renderError('prenom')}
//               </div>

//               <div className="form-control">
//                 <label className="label">Mot de passe</label>
//                 <input
//                   className="input input-bordered"
//                   type="text"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                 />
//                 <p>
//                   Si l' utilisateur a oublier son mot de pass il faut lui creer
//                   de nouveau
//                 </p>
//               </div>

//               <div className="form-control">
//                 <label className="label">Telephone</label>
//                 <input
//                   className="input input-bordered"
//                   type="text"
//                   name="telephone"
//                   value={formData.telephone}
//                   onChange={handleChange}
//                 />
//                 {renderError('telephone')}
//               </div>
//               <div className="form-control">
//                 <label className="label">adresse</label>
//                 <textarea
//                   className="input input-bordered"
//                   type="text"
//                   name="adresse"
//                   value={formData.adresse}
//                   onChange={handleChange}
//                 />
//                 {renderError('adresse')}
//               </div>

//               {/* Sélection du Type d'Utilisateur */}
//               <div className="mb-4">
//                 <label
//                   htmlFor="userType"
//                   className="mb-2.5 block font-medium base-content"
//                 >
//                   Sexe
//                 </label>
//                 <select
//                   id="sexe"
//                   name="sexe"
//                   value={formData.sexe}
//                   onChange={handleChange}

//                   className="input input-bordered"
//                 >
//                   <option value="">Sélectionnez le sexe</option>
//                   <option value="homme">homme</option>
//                   <option value="femme">femme</option>
//                 </select>
//               </div>

//               {/* Sélection du Type d'Utilisateur */}
//               <div className="mb-4">
//                 <label
//                   htmlFor="userType"
//                   className="mb-2.5 block font-medium base-content"
//                 >
//                   Type d'Utilisateur
//                 </label>
//                 <select
//                   id="userType"
//                   name="userType"
//                   value={formData.userType}
//                   onChange={handleChange}
//                   required
//                   className="input input-bordered"
//                 >
//                   <option value="">Sélectionnez un type</option>
//                   <option value="patient">Patient</option>
//                   <option value="medecin">Medecin</option>
//                   <option value="technicien">Technicien</option>
//                   <option value="preleveur">Preleveur</option>
//                   <option value="acceuil">Accueil</option>
//                   <option value="superadmin">Superadmin</option>
//                   <option value="partenaire">Partenaire</option>
//                 </select>
//               </div>

//               <div className="modal-action">
//                 <button className="btn btn-primary" type="submit">
//                   Enregistrer
//                 </button>
//                 <button
//                   className="btn btn-ghost"
//                   onClick={() => setShowModal(false)}
//                 >
//                   Annuler
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//       {showToast && (
//         <div className="toast toast-top toast-center">
//           <div className="alert alert-success">
//             Patient mis à jour avec succès.
//           </div>
//         </div>
//       )}
//     </>
//   )
// }

// EditPatientButton.propTypes = {
//   userId: PropTypes.string.isRequired,
//   onuserUpdated: PropTypes.func.isRequired,
// }

// export default EditPatientButton

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

function EditPatientButton({ userId, onuserUpdated }) {
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    telephone: '',
    prenom: '',
    nom: '',
    adresse: '',
    password: '',
    userType: '',
    sexe: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    if (showModal && userId) {
      fetchuserData(userId)
    }
  }, [showModal, userId])

  const fetchuserData = async (userId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/user/${userId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        setFormData({
          telephone: formatPhoneNumber(data.data.telephone),
          prenom: data.data.prenom,
          nom: data.data.nom,
          adresse: data.data.adresse,
          password: '', // Ne pas remplir pour des raisons de sécurité
          userType: data.data.userType,
          sexe: data.data.sexe, // Assurez-vous que cette ligne est présente
        })
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du user:', error)
    }
  }

  const formatPhoneNumber = (phoneNumber) => {
    const digits = phoneNumber.replace(/\D/g, '')
    if (digits.startsWith('221')) {
      return `+${digits}`
    } else if (digits.startsWith('77') || digits.startsWith('78')) {
      return `+221${digits}`
    } else {
      return `+221${digits}`
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    const formattedValue =
      name === 'telephone' ? formatPhoneNumber(value) : value
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: formattedValue,
    }))
  }

  const validateForm = () => {
    let errors = {}

    if (!formData.prenom.trim()) errors.prenom = 'Le prénom est obligatoire.'
    if (!formData.nom.trim()) errors.nom = 'Le nom est obligatoire.'
    if (!formData.adresse.trim()) errors.adresse = "L'adresse est obligatoire."
    if (!formData.telephone.trim())
      errors.telephone = 'Le numéro de téléphone est obligatoire.'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validateForm()
    setFormErrors(errors)

    if (Object.keys(errors).length === 0) {
      setLoading(true)
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const token = userInfo?.token

        const response = await fetch(`${apiUrl}/api/user/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        })

        const data = await response.json()
        if (data.success) {
          setShowToast(true)
          setTimeout(() => setShowToast(false), 3000)
          setShowModal(false)
          onuserUpdated() // Rappel pour actualiser la liste des users
        } else {
          console.error('La mise à jour a échoué.')
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du user:', error)
      } finally {
        setLoading(false)
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
                <label className="label">Prénom</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                />
                {renderError('prenom')}
              </div>
              <div className="form-control">
                <label className="label">Mot de passe</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <p>
                  Si l'utilisateur a oublié son mot de passe, il faut lui en
                  créer un nouveau
                </p>
              </div>
              <div className="form-control">
                <label className="label">Téléphone</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                />
                {renderError('telephone')}
              </div>
              <div className="form-control">
                <label className="label">Adresse</label>
                <textarea
                  className="input input-bordered"
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                />
                {renderError('adresse')}
              </div>
              <div className="mb-4">
                <label
                  htmlFor="sexe"
                  className="mb-2.5 block font-medium base-content"
                >
                  Sexe
                </label>
                <select
                  id="sexe"
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleChange}
                  className="input input-bordered"
                >
                  <option value="">Sélectionnez le sexe</option>
                  <option value="homme">Homme</option>
                  <option value="femme">Femme</option>
                </select>
              </div>
              <div className="mb-4">
                <label
                  htmlFor="userType"
                  className="mb-2.5 block font-medium base-content"
                >
                  Type d'Utilisateur
                </label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  required
                  className="input input-bordered"
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="patient">Patient</option>
                  <option value="medecin">Médecin</option>
                  <option value="technicien">Technicien</option>
                  <option value="preleveur">Préleveur</option>
                  <option value="acceuil">Accueil</option>
                  <option value="superadmin">Superadmin</option>
                  <option value="partenaire">Partenaire</option>
                </select>
              </div>
              <div className="modal-action">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Chargement...' : 'Enregistrer'}
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
        <div className="toast toast-top toast-center">
          <div className="alert alert-success">
            Patient mis à jour avec succès.
          </div>
        </div>
      )}
    </>
  )
}

EditPatientButton.propTypes = {
  userId: PropTypes.string.isRequired,
  onuserUpdated: PropTypes.func.isRequired,
}

export default EditPatientButton
