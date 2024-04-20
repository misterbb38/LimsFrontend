import { useEffect, useState } from 'react'
import EditPatientButton from '../components/EditPatientButton' // Ajustez le chemin d'importation selon votre structure de fichiers
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import Chatbot from '../components/Chatbot'
import SignUp from '../components/Auth/SignUp'

function PatientList() {
  const [patients, setPatients] = useState([])

  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  // Fonction pour charger les patients
  const fetchpatients = async () => {
    setLoading(true) // Commencer le chargement
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/user/simpleusers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setPatients(data.data)
        setFilteredPatients(data.data)
      } else {
        console.error('Failed to fetch patients')
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
    } finally {
      setLoading(false) // Arrêter le chargement une fois que les données sont récupérées ou en cas d'erreur
    }
  }
  const handleSearchTermChange = (event) => {
    const { value } = event.target
    setSearchTerm(value)
    filterPatients(value) // Applique le filtre dès que le terme de recherche change
  }

  const filterPatients = (searchTerm) => {
    if (!searchTerm) {
      fetchpatients() // Si le champ de recherche est vide, réaffiche tous les patients
      return
    }
    const searchTermLower = searchTerm.toLowerCase()
    const filtered = patients.filter((patient) =>
      patient.telephone.toLowerCase().includes(searchTermLower)
    )
    setPatients(filtered) // Met à jour l'état `patients` avec les patients filtrés
  }

  // Utilisez useEffect pour charger les patients au montage du composant
  useEffect(() => {
    fetchpatients()
  }, [])

  // Définir refreshpatients comme un appel à fetchpatients pour recharger les données
  const refreshpatients = () => {
    fetchpatients()
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
        // Rafraîchir la liste des patients après la suppression
        fetchpatients()
      } else {
        console.error('Failed to delete patient')
      }
    } catch (error) {
      console.error('Error deleting patient:', error)
    }
  }

  return (
    <div className="base-content bg-base-100 mx-auto p-4 min-h-[800px]">
      <Chatbot />
      <NavigationBreadcrumb pageName="Patient" />
      {/* You can open the modal using document.getElementById('ID').showModal() method */}

      <button
        className="btn"
        onClick={() => document.getElementById('my_modal_4').showModal()}
      >
        Ajouter un nouveau patient
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
          <SignUp onUser={refreshpatients} />
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
                <th className="font-bold text-lg text-base-content">Adresse</th>
                <th className="font-bold text-lg text-base-content">
                  Téléphone
                </th>
                <th className="font-bold text-lg text-base-content">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient._id}>
                  <td>{patient.nom}</td>
                  <td>{patient.email}</td>
                  <td>{patient.adresse}</td>
                  <td>{patient.telephone}</td>
                  <td>
                    <div className="flex justify-around space-x-1">
                      <EditPatientButton
                        userId={patient._id}
                        onuserUpdated={refreshpatients}
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

export default PatientList
