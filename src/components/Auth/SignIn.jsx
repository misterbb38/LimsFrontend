import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import LogoText from '../../images/bioramlogo.png'
// import Logo from '../../images/logo/logo.png';

const SignIn = () => {
  const [nip, setNip] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false) // Ajout d'un état pour le chargement
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true) // Début du chargement
    try {
      const response = await fetch(`${apiUrl}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nip, password }),
      })

      if (!response.ok) {
        throw new Error(
          'Échec de la connexion. Veuillez vérifier vos identifiants.'
        )
      }

      const data = await response.json()
      setLoading(false) // Arrêt du chargement

      // Stocker les infos de l'utilisateur et le token dans localStorage
      localStorage.setItem('userInfo', JSON.stringify(data))
      console.log(data)

      if (data.userType === 'patient') {
        // Si l'abonnement expire dans 7 jours ou moins, rediriger vers /key
        navigate('/patient-dash')
      } else if (data.userType === 'partenaire') {
        navigate('/partenaire-dash')
      } else {
        // Pour les autres types d'utilisateurs, rediriger vers /KeyGen
        navigate('/dash')
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false) // Fin du chargement
    }
  }

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex flex-wrap items-center">
          <div className="hidden w-full xl:block xl:w-1/2">
            <div className="py-17.5 px-26 text-center">
              <Link className="mb-5.5 inline-block" to="/">
                {/* <img className="hidden dark:block" src={Logo} alt="Logo" /> */}
              </Link>
              <p className="2xl:px-20"></p>
              <img className="hidden dark:block " src={LogoText} alt="Logo" />
            </div>
          </div>

          <div className="w-full border-stroke dark:border-strokedark xl:w-1/2 xl:border-l-2">
            <div className="w-full p-4 sm:p-12.5 xl:p-17.5">
              <span className="mb-1.5 block font-medium"></span>
              <h2 className="mb-9 text-2xl font-bold base-content">
                Connectez-vous à{' '}
                <span className="text-grenn-100 font-bold">Bioram</span>
                <span className="text-orange-500 font-bold"></span>
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="mb-2.5 block font-medium base-content">
                    Nip
                  </label>
                  <input
                    type="text"
                    placeholder="Entrez votre email"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    className="input input-bordered input-primary w-full max-w-xs"
                  />
                </div>

                <div className="mb-6 relative">
                  <label className="mb-2.5 block font-medium base-content">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Entrez votre mot de passe"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input input-bordered input-primary w-full max-w-xs pr-10 pl-4"
                    />
                    <span
                      onClick={toggleShowPassword}
                      className="absolute inset-y-0 left-0 pl-0 flex items-center cursor-pointer"
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                      />
                    </span>
                  </div>
                </div>

                {error && <div className="mb-4 text-red-500">{error}</div>}

                {loading ? (
                  <div className="flex justify-center items-center">
                    <span className="loading loading-spinner text-primary"></span>
                  </div>
                ) : (
                  <input
                    type="submit"
                    value="Se connecter"
                    className="btn btn-primary w-full"
                  />
                )}
                {/*  */}
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SignIn
