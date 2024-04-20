import { useEffect, useState } from 'react'
import EditPatientButton from '../components/EditPatientButton' // Ajustez le chemin d'importation selon votre structure de fichiers
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import Chatbot from '../components/Chatbot'
import SignUp from '../components/Auth/SignUp'

function Personnel() {
  const [personnel, setpersonnel] = useState([])

  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  // Fonction pour charger les personnel
  const fetchpersonnel = async () => {
    setLoading(true) // Commencer le chargement
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/user/personnel`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setpersonnel(data.data)
        setFilteredpersonnel(data.data)
      } else {
        console.error('Failed to fetch personnel')
      }
    } catch (error) {
      console.error('Error fetching personnel:', error)
    } finally {
      setLoading(false) // Arrêter le chargement une fois que les données sont récupérées ou en cas d'erreur
    }
  }
  const handleSearchTermChange = (event) => {
    const { value } = event.target
    setSearchTerm(value)
    filterpersonnel(value) // Applique le filtre dès que le terme de recherche change
  }

  const filterpersonnel = (searchTerm) => {
    if (!searchTerm) {
      fetchpersonnel() // Si le champ de recherche est vide, réaffiche tous les personnel
      return
    }
    const searchTermLower = searchTerm.toLowerCase()
    const filtered = personnel.filter((patient) =>
      patient.telephone.toLowerCase().includes(searchTermLower)
    )
    setpersonnel(filtered) // Met à jour l'état `personnel` avec les personnel filtrés
  }

  // Utilisez useEffect pour charger les personnel au montage du composant
  useEffect(() => {
    fetchpersonnel()
  }, [])

  // Définir refreshpersonnel comme un appel à fetchpersonnel pour recharger les données
  const refreshpersonnel = () => {
    fetchpersonnel()
  }

  // Fonction pour supprimer un patient
  const deletepatient = async (patientId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/patient/${patientId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        // Rafraîchir la liste des personnel après la suppression
        fetchpersonnel()
      } else {
        console.error('Failed to delete patient')
      }
    } catch (error) {
      console.error('Error deleting patient:', error)
    }
  }

  // Récupérer les informations de l'utilisateur stockées localement
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))

  // Vérifier si le type d'utilisateur est autorisé
  if (
    !['superadmin', 'medecin', 'technicien', 'preleveur'].includes(
      userInfo?.userType
    )
  ) {
    // Si l'utilisateur n'est pas autorisé, retourner un message d'erreur ou un composant spécifique
    return (
      <div role="alert" className="alert alert-warning">
        <font></font>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <font></font>
        <span>
          {' '}
          Informations non autorisées. Vous n'avez pas le droit d'accéder à
          cette page.
        </span>
        <font></font>
      </div>
    )
  }

  return (
    <div className="base-content bg-base-100 mx-auto p-4 min-h-[800px]">
      <Chatbot />
      <NavigationBreadcrumb pageName="Personnel" />
      {/* You can open the modal using document.getElementById('ID').showModal() method */}

      <button
        className="btn"
        onClick={() => document.getElementById('my_modal_4').showModal()}
      >
        Ajouter un nouveau personnel
      </button>
      <br></br>

      <input
        type="text"
        placeholder="Rechercher par téléphone..."
        value={searchTerm}
        onChange={handleSearchTermChange}
        className="input input-bordered input-primary w-full max-w-xs my-4"
      />

      <dialog id="my_modal_4" className="modal">
        <div className="modal-box w-11/12 max-w-5xl">
          <SignUp onUser={refreshpersonnel} />
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button, it will close the modal */}
              <button className="btn">Fermer</button>
            </form>
          </div>
        </div>
      </dialog>
      <div className="divider"></div>
      {loading ? (
        <div className="loading loading-spinner text-primary">
          <div className="loader">Chargement...</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="font-bold text-lg text-base-content">Nom</th>
                <th className="font-bold text-lg text-base-content">Email</th>
                <th className="font-bold text-lg text-base-content">Profile</th>
                <th className="font-bold text-lg text-base-content">
                  Téléphone
                </th>
                <th className="font-bold text-lg text-base-content">Actions</th>
              </tr>
            </thead>
            <tbody>
              {personnel.map((patient) => (
                <tr key={patient._id}>
                  <td>{patient.nom}</td>
                  <td>{patient.email}</td>
                  <td>{patient.userType}</td>
                  <td>{patient.telephone}</td>
                  <td>
                    <div className="flex justify-around space-x-1">
                      <EditPatientButton
                        userId={patient._id}
                        onuserUpdated={refreshpersonnel}
                      />
                      {/* <button
                        className="btn btn-error"
                        onClick={() => deletepatient(patient._id)}
                      >
                        Supprimer
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Personnel
