import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import LogoText from '../../images/bioramlogo.png'

const SignUp = ({ onUser }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    password: '',
    confirmPassword: '',
    sexe: '',
    dateNaissance: '',
    age: '',
    userType: '',
    adresse: '',
    partenaireId: '', // Ajouter partenaireId
  })
  const {
    nom,
    prenom,
    telephone,
    email,
    password,
    confirmPassword,
    dateNaissance,
    userType,
    adresse,
    age,
    sexe,
    partenaireId, // Ajouter partenaireId
  } = formData
  // const [passwordError, setPasswordError] = useState(false)
  // const [passwordLengthError, setPasswordLengthError] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('')
  const [partenaires, setPartenaires] = useState([]) // État pour les partenaires

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
  const usertype = userInfo?.userType

  // useEffect(() => {
  //   setPasswordError(password !== confirmPassword && confirmPassword.length > 0)
  // }, [password, confirmPassword])

  useEffect(() => {
    // Charger les partenaires
    const fetchPartenaires = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/partenaire`)
        const data = await response.json()
        if (response.ok) {
          setPartenaires(data.data)
        } else {
          console.error(data.message)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des partenaires:', error)
      }
    }
    fetchPartenaires()
  }, [apiUrl])

  const formatPhoneNumber = (phoneNumber) => {
    // Supprimer tous les caractères non numériques
    const digits = phoneNumber.replace(/\D/g, '');
  
    // Ajouter le préfixe international +221 s'il n'est pas déjà présent
    if (digits.startsWith('221')) {
      return `+${digits}`;
    } else if (digits.startsWith('77') || digits.startsWith('78') || digits.startsWith('78') ) {
      return `+221${digits}`;
    } else {
      return phoneNumber; // Retourner tel quel si le format est inattendu
    }
  };
  

  const handleChange = (e) => {
    const { name, value } = e.target
    // Format the phone number if the field is 'telephone'
  const formattedValue = name === 'telephone' ? formatPhoneNumber(value) : value;
    
    setFormData({ ...formData, [name]: value })
  }

  const displayToast = (message, type = 'info') => {
    setToastMessage(message)
    setToastType(type)
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000) // Dismiss toast after 3 seconds
  }

  const submitHandler = async (e) => {
    e.preventDefault()
    setLoading(true)
    setServerError('')
    // setPasswordError(false)
    // setPasswordLengthError(false)
    const generatedPassword = `${nom}${prenom}` // Concaténation du nom et du prénom
    // Format the phone number before sending
  const formattedPhoneNumber = formatPhoneNumber(telephone);

    // if (password.length < 8) {
    //   // setPasswordLengthError(true)
    //   setLoading(false)
    //   return
    // }

    // if (password !== confirmPassword) {
    //   setPasswordError(true)
    //   setLoading(false)
    //   return
    // }

    try {
      const response = await fetch(`${apiUrl}/api/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nom,
          prenom,
          telephone: formattedPhoneNumber, // Use the formatted phone number
          email,
          password: generatedPassword, // Utiliser le mot de passe généré
          dateNaissance,
          userType,
          adresse,
          sexe,
          partenaireId: userType === 'partenaire' ? partenaireId : undefined, // Inclure partenaireId si userType est partenaire
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || "Une erreur s'est produite lors de l'inscription"
        )
      } else {
        displayToast('Inscription réussie', 'success')
        // Réinitialiser formData ici après succès
        setFormData({
          nom: '',
          prenom: '',
          telephone: '',
          email: '',
          password: '',
          confirmPassword: '',
          dateNaissance: '',
          userType: '',
          adresse: '',
          age: '',
          sexe: '',
          partenaireId: '',
        })
        onUser()
      }
    } catch (error) {
      displayToast(
        error.message || 'Problème de connexion au serveur.',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {showToast && (
        <div className="toast toast-center ">
          <div
            className={`alert ${toastType === 'success' ? 'alert-success' : 'alert-error'}`}
          >
            <span className="text-white">{toastMessage}</span>
          </div>
        </div>
      )}
      <div className="rounded-sm border base-content shadow-default">
        {/* Content */}
        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="py-17.5 px-26 text-center">
              <p className="2xl:px-20">
                Optimisez la gestion de votre laboratoire d'analyses avec notre
                solution complète.
              </p>
              <img src={LogoText} alt="Logo Laboratoire" />
            </div>
          </div>
          <div className="w-full xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
              <form onSubmit={submitHandler}>
                {/* Champs du formulaire */}
                {/* Nom */}
                <div className="mb-4">
                  <div className="flex space-x-4">
                    <div>
                      <label
                        htmlFor="nom"
                        className="mb-2.5 block font-medium base-content"
                      >
                        Nom
                      </label>
                      <input
                        id="nom"
                        name="nom"
                        type="text"
                        value={nom}
                        onChange={handleChange}
                        placeholder="Entrez votre nom"
                        required
                        className="input input-bordered input-primary w-full max-w-xs"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="prenom"
                        className="mb-2.5 block font-medium base-content"
                      >
                        Prénom
                      </label>
                      <input
                        id="prenom"
                        name="prenom"
                        type="text"
                        value={prenom}
                        onChange={handleChange}
                        placeholder="Entrez votre prénom"
                        required
                        className="input input-bordered input-primary w-full max-w-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* telephone */}
                <div className="mb-4">
                  <label
                    htmlFor="prenom"
                    className="mb-2.5 block font-medium base-content"
                  >
                    Telephone
                  </label>
                  <input
                    id="telephone"
                    name="telephone"
                    type="text"
                    value={telephone}
                    onChange={handleChange}
                    placeholder="Entrez votre telephone"
                    required
                    className="input input-bordered input-primary w-full max-w-xs"
                  />
                </div>
                {/* Adresse */}
                <div className="mb-4">
                  <label
                    htmlFor="prenom"
                    className="mb-2.5 block font-medium base-content"
                  >
                    Adresse
                  </label>
                  <input
                    id="adresse"
                    name="adresse"
                    type="text"
                    value={adresse}
                    onChange={handleChange}
                    placeholder="Entrez votre adresse"
                    required
                    className="input input-bordered input-primary w-full max-w-xs"
                  />
                </div>

                {/* Date de Naissance */}
                <div className="mb-4">
                  <label
                    htmlFor="dateNaissance"
                    className="mb-2.5 block font-medium base-content"
                  >
                    Date de Naissance
                  </label>
                  <input
                    id="dateNaissance"
                    name="dateNaissance"
                    type="date"
                    value={dateNaissance}
                    onChange={handleChange}
                    className="input input-bordered input-primary w-full max-w-xs"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="dateNaissance"
                    className="mb-2.5 block font-medium base-content"
                  >
                    Age (si la date de la naissance est inconnue)
                  </label>
                  <input
                    id="dateNaissance"
                    name="age"
                    type="number"
                    value={age}
                    onChange={handleChange}
                    className="input input-bordered input-primary w-full max-w-xs"
                  />
                </div>

                {/* Email */}
                <div className="mb-4">
                  <label
                    htmlFor="email"
                    className="mb-2.5 block font-medium base-content"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Entrez votre email"
                    className="input input-bordered input-primary w-full max-w-xs"
                  />
                </div>

                {/* Sélection du Type d'Utilisateur */}
                {/* <div className="mb-4">
                  <label
                    htmlFor="userType"
                    className="mb-2.5 block font-medium base-content"
                  >
                    Type d'Utilisateur
                  </label>
                  <select
                    id="userType"
                    name="userType"
                    value={userType}
                    onChange={handleChange}
                    required
                    className="select select-primary w-full max-w-xs"
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="patient">Patient</option>
                    <option value="medecin">Medecin</option>
                    <option value="technicien">Technicien</option>
                    <option value="preleveur">Preleveur</option>
                    <option value="accueil">Accueil</option>
                    <option value="superadmin">Superadmin</option>
                    <option value="partenaire">Partenaire</option>
                  </select>
                </div> */}

                {usertype !== 'accueil' && usertype !== 'technicien' &&  usertype !== 'preleveur' && (
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
                      value={userType}
                      onChange={handleChange}
                      required
                      className="select select-primary w-full max-w-xs"
                    >
                      <option value="">Sélectionnez un type</option>
                      <option value="patient">Patient</option>
                      <option value="medecin">Medecin</option>
                      <option value="technicien">Technicien</option>
                      <option value="preleveur">Preleveur</option>
                      <option value="acceuil">Accueil</option>
                      <option value="superadmin">Superadmin</option>
                      <option value="partenaire">Partenaire</option>
                    </select>
                  </div>
                )}

                {/* Sélection du Partenaire si le type d'utilisateur est partenaire */}
                {userType === 'partenaire' && (
                  <div className="mb-4">
                    <label
                      htmlFor="partenaireId"
                      className="mb-2.5 block font-medium base-content"
                    >
                      Partenaire
                    </label>
                    <select
                      id="partenaireId"
                      name="partenaireId"
                      value={partenaireId}
                      onChange={handleChange}
                      required
                      className="select select-primary w-full max-w-xs"
                    >
                      <option value="">Sélectionnez un partenaire</option>
                      {partenaires.map((partenaire) => (
                        <option key={partenaire._id} value={partenaire._id}>
                          {partenaire.nom}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Sélection du Type de sexe */}
                {userType !== 'partenaire' && (
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
                      value={sexe}
                      onChange={handleChange}
                      required
                      className="select select-primary w-full max-w-xs"
                    >
                      <option value="">Sélectionnez</option>
                      <option value="homme">homme</option>
                      <option value="femme">femme</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || password !== confirmPassword}
                  className="btn btn-primary"
                >
                  {loading ? 'Chargement...' : "S'inscrire"}
                </button>
                {serverError && (
                  <div className="text-red-500">{serverError}</div>
                )}
                {/* Link to Sign In Page */}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

SignUp.propTypes = {
  onUser: PropTypes.func.isRequired,
}

export default SignUp
