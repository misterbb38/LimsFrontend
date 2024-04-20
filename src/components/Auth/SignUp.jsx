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
    dateNaissance: '',
    age: '',
    userType: '',
    adresse: '',
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
  } = formData
  // const [passwordError, setPasswordError] = useState(false)
  // const [passwordLengthError, setPasswordLengthError] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastType, setToastType] = useState('')

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  // useEffect(() => {
  //   setPasswordError(password !== confirmPassword && confirmPassword.length > 0)
  // }, [password, confirmPassword])

  const handleChange = (e) => {
    const { name, value } = e.target
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
          telephone,
          email,
          password: generatedPassword, // Utiliser le mot de passe généré
          dateNaissance,
          userType,
          adresse,
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
                    className="input"
                  />
                </div>

                {/* Prénom */}
                <div className="mb-4">
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
                    className="input"
                  />
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
                    className="input"
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
                    className="input"
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
                    className="input"
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
                    className="input"
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
                    className="input"
                  />
                </div>

                {/* Sélection du Type d'Utilisateur */}
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
                    className="input"
                  >
                    <option value="">Sélectionnez un type</option>
                    <option value="patient">Patient</option>
                    <option value="medecin">Medecin</option>
                    <option value="technicien">Technicien</option>
                    <option value="preleveur">Preleveur</option>
                    <option value="accueil">Accueil</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </div>

                {/* Mot de passe
                <div className="mb-4">
                  <label
                    htmlFor="password"
                    className="mb-2.5 block font-medium base-content"
                  >
                    Mot de passe
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={handleChange}
                    placeholder="Entrez votre mot de passe"
                    required
                    className="input"
                  />
                  {passwordLengthError && (
                    <span className="text-red-500 text-xs">
                      Le mot de passe doit contenir au moins 8 caractères.
                    </span>
                  )}
                </div>

                Confirmation du mot de passe
                <div className="mb-6">
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2.5 block font-medium base-content"
                  >
                    Confirmez votre mot de passe
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmez votre mot de passe"
                    required
                    className="input"
                  />
                  {passwordError && (
                    <span className="text-red-500 text-xs">
                      Les mots de passe ne correspondent pas.
                    </span>
                  )}
                </div> */}

                <button
                  type="submit"
                  disabled={loading || password !== confirmPassword}
                  className="btn"
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
