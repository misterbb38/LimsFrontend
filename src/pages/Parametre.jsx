import { useState, useEffect } from 'react'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import userThree from '../images/user/user-03.png'
import Chatbot from '../components/Chatbot'

const Parametre = () => {
  const [user, setUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    devise: '',
    logo: '',
    site: '',
    couleur: '',
    nomEntreprise: '',
  })
  const [logo, setLogo] = useState(null) // Pour gérer le fichier image sélectionné
  const [isModified, setIsModified] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(true)

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    const fetchUserProfile = async () => {
      const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token

      try {
        const response = await fetch(`${apiUrl}/api/user/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }

        const data = await response.json()
        console.log(data)
        setUser({
          nom: data.nom || '',
          prenom: data.prenom || '',
          adresse: data.adresse || '',
          email: data.email || '',
          telephone: data.telephone || '',
          devise: data.devise || '',
          logo: data.logo || '', // Initialiser avec le chemin de l'image stockée
          site: data.site || '',
          nomEntreprise: data.nomEntreprise || '',
          couleur: data.couleur || '',
        })
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error)
      }
    }

    fetchUserProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setUser((prevUser) => ({ ...prevUser, [name]: value }))
    setIsModified(true)
  }

  const handleImageChange = (e) => {
    setLogo(e.target.files[0]) // Stocker le fichier sélectionné
    setIsModified(true)
  }

  const handleSubmitLogo = async (e) => {
    e.preventDefault()
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
    const token = userInfo?.token
    const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

    const formData = new FormData()
    formData.append('logo', logo)

    try {
      const response = await fetch(`${apiUrl}/api/user/profile/`, {
        // Assurez-vous que ce chemin est correct et configuré dans le backend pour gérer l'upload de l'image
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to update logo.')
      }

      const data = await response.json()
      setUser((prevUser) => ({ ...prevUser, logo: data.logo })) // Mettre à jour l'URL de l'image dans l'état local
      localStorage.setItem(
        'userInfo',
        JSON.stringify({ ...userInfo, logo: data.logo })
      ) // Mettre à jour le localStorage
      setIsSuccess(true)
      setToastMessage('Logo mis à jour avec succès !!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      console.log(data)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du logo :', error)
      setIsSuccess(false)
      setToastMessage('Erreur lors de la mise à jour du logo.')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
    const token = userInfo?.token
    const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

    try {
      const response = await fetch(`${apiUrl}/api/user/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile.')
      }

      const updatedUser = await response.json()
      localStorage.setItem('userInfo', JSON.stringify(updatedUser))
      setIsModified(false)
      setIsSuccess(true)
      setToastMessage('Profil mis à jour avec succès !!')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil :', error)
      setIsSuccess(false)
      setToastMessage('Erreur lors de la mise à jour du profil .')
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  return (
    <>
      <div className="bg-base-100 min-h-[800px]">
        <NavigationBreadcrumb pageName="Settings" />
        <Chatbot />
        <div className="bg-base-100 base-content grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-base-100 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium base-content">
                  Personal Information
                </h3>
              </div>

              <div className="p-7">
                <form onSubmit={handleSubmit}>
                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label className="input input-bordered flex items-center gap-2">
                        Nom
                        <input
                          type="text"
                          className="grow"
                          placeholder="Nom"
                          name="nom"
                          value={user.nom}
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                    <div className="w-full sm:w-1/2">
                      <label className="input input-bordered flex items-center gap-2">
                        Prénom
                        <input
                          type="text"
                          className="grow"
                          placeholder="Prénom"
                          name="prenom"
                          value={user.prenom}
                          onChange={handleChange}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <label className="input input-bordered flex items-center gap-2">
                      Nom d'entreprise
                      <input
                        type="text"
                        className="grow"
                        placeholder="Nom d'entreprise"
                        name="nomEntreprise"
                        value={user.nomEntreprise}
                        onChange={handleChange}
                      />
                    </label>
                  </div>
                  <div className="mb-5.5">
                    <label className="input input-bordered flex items-center gap-2">
                      Email
                      <input
                        type="email"
                        className="grow"
                        placeholder="Email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                      />
                    </label>
                  </div>
                  <div className="mb-5.5">
                    <label className="input input-bordered flex items-center gap-2">
                      Numéro de téléphone
                      <input
                        type="tel"
                        className="grow"
                        placeholder="Numéro de téléphone"
                        name="telephone"
                        value={user.telephone}
                        onChange={handleChange}
                      />
                    </label>
                  </div>
                  <div className="mb-5.5">
                    <label className="input input-bordered flex items-center gap-2">
                      Adresse
                      <input
                        type="text"
                        className="grow"
                        placeholder="Adresse"
                        name="adresse"
                        value={user.adresse}
                        onChange={handleChange}
                      />
                    </label>
                  </div>

                  {/* <div className="mb-5.5">
                    <label className="input input-bordered flex items-center gap-2">
                      Site web
                      <input
                        type="text"
                        className="grow"
                        placeholder="site"
                        name="site"
                        value={user.site}
                        onChange={handleChange}
                      />
                    </label>
                  </div> */}
                  {/* <div className="mb-5.5">
                    <select
                      className="select select-bordered w-full max-w-xs"
                      name="couleur"
                      value={user.couleur}
                      onChange={handleChange}
                    >
                      <option disabled>
                        Choisissez une couleur principale
                      </option>
                      <option value="rouge">Rouge</option>
                      <option value="vert">Vert</option>
                      <option value="bleu">Bleu</option>
                      <option value="jaune">Jaune</option>
                      <option value="orange">Orange</option>
                      <option value="violet">Violet</option>
                      <option value="rose">Rose</option>
                      <option value="marron">Marron</option>
                      <option value="gris">Gris</option>
                      <option value="noir">Noir</option>
                    </select>
                  </div> */}

                  <div className="flex justify-end gap-4.5">
                    <button
                      type="button" // Empêcher la soumission du formulaire
                      className="flex justify-center rounded border border-stroke py-2 px-6 font-medium base-content hover:shadow-1 dark:border-strokedark"
                    >
                      Annuller
                    </button>
                    <button
                      type="submit"
                      className={`flex justify-center rounded ${
                        isModified ? 'bg-primary' : 'bg-gray-500'
                      } py-2 px-6 font-medium text-gray hover:bg-opacity-70`}
                      disabled={!isModified}
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
                {showToast && (
                  <div className="toast toast-center toast-middle">
                    <div
                      className={`alert ${
                        isSuccess ? 'alert-success' : 'alert-error'
                      }`}
                    >
                      <span className="text-white">{toastMessage}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* <div className="col-span-5 xl:col-span-2">
            <div className="rounded-sm border border-stroke bg-base-100 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium base-content">Your Photo</h3>
              </div>
              <div className="p-7">
                <form onSubmit={handleSubmitLogo} action="#">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full">
                      <img
                        src={
                          `${apiUrl}/${user.logo.replace(/\\/g, '/')}` ||
                          userThree
                        }
                        alt="User"
                      />
                    </div>
                    <div>
                      <span className="mb-1.5 base-content">
                        Editer votre logo
                      </span>
                    </div>
                  </div>

                  <div
                    id="FileUpload"
                    className="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border-2 border-dashed border-primary bg-gray py-4 px-4 bg-base-300 sm:py-7.5"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                      onChange={handleImageChange}
                    />
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-base-100 dark:border-strokedark dark:bg-boxdark">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M1.99967 9.33337C2.36786 9.33337 2.66634 9.63185 2.66634 10V12.6667C2.66634 12.8435 2.73658 13.0131 2.8616 13.1381C2.98663 13.2631 3.1562 13.3334 3.33301 13.3334H12.6663C12.8431 13.3334 13.0127 13.2631 13.1377 13.1381C13.2628 13.0131 13.333 12.8435 13.333 12.6667V10C13.333 9.63185 13.6315 9.33337 13.9997 9.33337C14.3679 9.33337 14.6663 9.63185 14.6663 10V12.6667C14.6663 13.1971 14.4556 13.7058 14.0806 14.0809C13.7055 14.456 13.1968 14.6667 12.6663 14.6667H3.33301C2.80257 14.6667 2.29387 14.456 1.91879 14.0809C1.54372 13.7058 1.33301 13.1971 1.33301 12.6667V10C1.33301 9.63185 1.63148 9.33337 1.99967 9.33337Z"
                            fill="#3C50E0"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.5286 1.52864C7.78894 1.26829 8.21106 1.26829 8.4714 1.52864L11.8047 4.86197C12.0651 5.12232 12.0651 5.54443 11.8047 5.80478C11.5444 6.06513 11.1223 6.06513 10.8619 5.80478L8 2.94285L5.13807 5.80478C4.87772 6.06513 4.45561 6.06513 4.19526 5.80478C3.93491 5.54443 3.93491 5.12232 4.19526 4.86197L7.5286 1.52864Z"
                            fill="#3C50E0"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M7.99967 1.33337C8.36786 1.33337 8.66634 1.63185 8.66634 2.00004V10C8.66634 10.3682 8.36786 10.6667 7.99967 10.6667C7.63148 10.6667 7.33301 10.3682 7.33301 10V2.00004C7.33301 1.63185 7.63148 1.33337 7.99967 1.33337Z"
                            fill="#3C50E0"
                          />
                        </svg>
                      </span>
                      <p>
                        <span className="text-primary">Click to upload</span> or
                        drag and drop
                      </p>
                      <p className="mt-1.5">SVG, PNG, JPG or GIF</p>
                      <p>(max, 800 X 800px)</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center rounded border border-stroke py-2 px-6 font-medium base-content hover:shadow-1 dark:border-strokedark "
                      type="reset"
                    >
                      Annuller
                    </button>
                    <button
                      className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-70"
                      type="submit"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </>
  )
}

export default Parametre
