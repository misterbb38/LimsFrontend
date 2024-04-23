import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  FiMenu,
  FiChevronLeft,
  FiSearch,
  FiBell,
  FiSettings,
} from 'react-icons/fi'
import UserPhoto from '../assets/icone/react.svg'
import { useNavigate } from 'react-router-dom' // Importer useNavigate

const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

function TopBar({ toggleSidebar, isSidebarOpen }) {
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false)

  const [unreadCount, setUnreadCount] = useState(0)
  // const [error, setError] = useState('');
  // const [loading, setLoading] = useState(true);

  const navigate = useNavigate() // Hook pour naviguer

  const [user, setUser] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    devise: '',
    logo: '',
    token: '',
  })

  useEffect(() => {
    // Charger les données utilisateur depuis localStorage au chargement du composant
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
    setUser({
      nom: userInfo.nom || '',
      prenom: userInfo.prenom || '',
      email: userInfo.email || '',
      telephone: userInfo.telephone || '',
      devise: userInfo.devise || '',
      logo: userInfo.logo || '', // Initialiser avec le chemin de l'image stockée
      nomEntreprise: userInfo.nomEntreprise || '',
      token: userInfo?.token,
      userId: userInfo?._id,
    })
  }, [])

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const token = userInfo?.token

    const fetchUnreadNotificationsCount = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/notification/countUnread`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch unread notifications count')
        }

        const data = await response.json()
        setUnreadCount(data.unreadCount)
      } catch (error) {
        console.error(
          'Erreur lors de la récupération du nombre de notifications non lues: ',
          error.message
        )
      }
    }

    const handleUpdateUnreadCount = () => {
      fetchUnreadNotificationsCount()
    }

    // Ajouter l'écouteur d'événements
    document.addEventListener(
      'updateUnreadNotificationsCount',
      handleUpdateUnreadCount
    )

    // Initial fetch
    fetchUnreadNotificationsCount()

    // Nettoyage de l'écouteur d'événements
    return () => {
      document.removeEventListener(
        'updateUnreadNotificationsCount',
        handleUpdateUnreadCount
      )
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear() // Vide localStorage
    navigate('/') // Redirige vers la page de connexion
  }

  return (
    <div className="flex items-center justify-between bg-base-300 p-4 shadow">
      {/* Bouton de menu pour mobile */}
      <button onClick={toggleSidebar} className="p-2 text-base-content ">
        {isSidebarOpen ? <FiChevronLeft size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Champ de recherche uniquement visible sur les écrans plus grands */}
      <div className="hidden md:flex flex-grow mx-4">
        <FiSearch className="text-base-content mr-2" size={20} />
        <input
          className="flex-grow border-2 border-base-300 bg-base-200 h-10 px-5 rounded-lg text-sm focus:outline-none"
          type="search"
          placeholder="Type to search..."
        />
      </div>

      <div className="flex items-center">
        <div className="relative mx-4 indicator">
          <FiBell
            className="cursor-pointer text-base-content"
            size={24}
            onClick={() => navigate('/dash/notification')} // Naviguez vers la page de notifications au clic
          />
          {/* {unreadCount > 0 && (
    <span className="indicator-item badge badge-secondary">{unreadCount}</span>
  )} */}
          <span className="indicator-item badge badge-primary">
            {unreadCount}
          </span>
        </div>

        <div className="relative mx-4">
          <FiSettings
            className="cursor-pointer text-base-content"
            size={24}
            onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
          />
          {isSettingsMenuOpen && (
            <div className="absolute right-0 mt-2 py-2 w-48 bg-base-100 rounded-md shadow-xl z-50">
              <a
                href="/dash/Parametre"
                className="block px-4 py-2 text-sm text-base-content hover:bg-base-200"
              >
                Réglages
              </a>
              <a
                onClick={handleLogout}
                className="block px-4 py-2 text-sm text-base-content hover:bg-base-200"
              >
                Déconnexion
              </a>
            </div>
          )}
        </div>

        <label className="  lg:hidden cursor-pointer grid place-items-center">
          <input
            type="checkbox"
            value="synthwave"
            className="toggle theme-controller bg-base-content row-start-1 col-start-1 col-span-2"
          />
          <svg
            className="col-start-1 row-start-1 stroke-base-100 fill-base-100"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
          </svg>
          <svg
            className="col-start-2 row-start-1 stroke-base-100 fill-base-100"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </label>

        {/* Informations de l'utilisateur uniquement pour les écrans plus grands */}

        <div className="hidden md:flex items-center ml-4">
          <div className="dropdown z-50">
            <div tabIndex={0} role="button" className="btn m-1">
              Theme
              <svg
                width="12px"
                height="12px"
                className="h-2 w-2 fill-current opacity-60 inline-block"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 2048 2048"
              >
                <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
              </svg>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] p-2 shadow-2xl bg-base-300 rounded-box w-52"
            >
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="Default"
                  value="default"
                />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="Retro"
                  value="retro"
                />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="Cyberpunk"
                  value="cyberpunk"
                />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="Valentine"
                  value="valentine"
                />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="Aqua"
                  value="aqua"
                />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="synthwave"
                  value="synthwave"
                />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="dark"
                  value="dark"
                />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="Aqua"
                  value="aqua"
                />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="coffee"
                  value="coffee"
                />
              </li>
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                  aria-label="luxury"
                  value="luxury"
                />
              </li>
            </ul>
          </div>
          <img
            src={`${apiUrl}/${user.logo.replace(/\\/g, '/')}` || UserPhoto}
            alt="User"
            className="h-8 w-8 rounded-full"
          />
          <div className="ml-2">
            <div className="text-base-content">{user.nom}</div>
            <div className="text-xs text-base-content">
              {user.nomEntreprise}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

TopBar.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired,
}

export default TopBar
