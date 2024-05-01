// import { useEffect, useState } from 'react'
// import EditPatientButton from '../components/EditPatientButton' // Ajustez le chemin d'importation selon votre structure de fichiers
// import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
// import Chatbot from '../components/Chatbot'
// import SignUp from '../components/Auth/SignUp'

// function PatientList() {
//   const [patients, setPatients] = useState([])

//   const [loading, setLoading] = useState(false)
//   const [searchTerm, setSearchTerm] = useState('')
//   const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

//   // Fonction pour charger les patients
//   const fetchpatients = async () => {
//     setLoading(true) // Commencer le chargement
//     try {
//       const userInfo = JSON.parse(localStorage.getItem('userInfo'))
//       const token = userInfo?.token
//       const response = await fetch(`${apiUrl}/api/user/simpleusers`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })
//       const data = await response.json()
//       if (data.success) {
//         setPatients(data.data)
//         setFilteredPatients(data.data)
//       } else {
//         console.error('Failed to fetch patients')
//       }
//     } catch (error) {
//       console.error('Error fetching patients:', error)
//     } finally {
//       setLoading(false) // Arrêter le chargement une fois que les données sont récupérées ou en cas d'erreur
//     }
//   }
//   const handleSearchTermChange = (event) => {
//     const { value } = event.target
//     setSearchTerm(value)
//     filterPatients(value) // Applique le filtre dès que le terme de recherche change
//   }

//   const filterPatients = (searchTerm) => {
//     if (!searchTerm) {
//       fetchpatients() // Si le champ de recherche est vide, réaffiche tous les patients
//       return
//     }
//     const searchTermLower = searchTerm.toLowerCase()
//     const filtered = patients.filter((patient) =>
//       patient.telephone.toLowerCase().includes(searchTermLower)
//     )
//     setPatients(filtered) // Met à jour l'état `patients` avec les patients filtrés
//   }

//   // Utilisez useEffect pour charger les patients au montage du composant
//   useEffect(() => {
//     fetchpatients()
//   }, [])

//   // Définir refreshpatients comme un appel à fetchpatients pour recharger les données
//   const refreshpatients = () => {
//     fetchpatients()
//   }

//   // Fonction pour supprimer un patient
//   const deletepatient = async (patientId) => {
//     try {
//       const userInfo = JSON.parse(localStorage.getItem('userInfo'))
//       const token = userInfo?.token
//       const response = await fetch(`${apiUrl}/api/patient/${patientId}`, {
//         method: 'DELETE',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })
//       const data = await response.json()
//       if (data.success) {
//         // Rafraîchir la liste des patients après la suppression
//         fetchpatients()
//       } else {
//         console.error('Failed to delete patient')
//       }
//     } catch (error) {
//       console.error('Error deleting patient:', error)
//     }
//   }

//   return (
//     <div className="base-content bg-base-100 mx-auto p-4 min-h-[800px]">
//       <Chatbot />
//       <NavigationBreadcrumb pageName="Patient" />
//       {/* You can open the modal using document.getElementById('ID').showModal() method */}

//       <button
//         className="btn"
//         onClick={() => document.getElementById('my_modal_4').showModal()}
//       >
//         Ajouter un nouveau patient
//       </button>
//       <br></br>

//       <input
//         type="text"
//         placeholder="Rechercher par téléphone..."
//         value={searchTerm}
//         onChange={handleSearchTermChange}
//         className="input input-bordered input-primary w-full max-w-xs my-4"
//       />

//       <dialog id="my_modal_4" className="modal">
//         <div className="modal-box w-11/12 max-w-5xl">
//           <SignUp onUser={refreshpatients} />
//           <div className="modal-action">
//             <form method="dialog">
//               {/* if there is a button, it will close the modal */}
//               <button className="btn">Fermer</button>
//             </form>
//           </div>
//         </div>
//       </dialog>
//       <div className="divider"></div>
//       {loading ? (
//         <div className="loading loading-spinner text-primary">
//           <div className="loader">Chargement...</div>
//         </div>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="table w-full">
//             <thead>
//               <tr>
//                 <th className="font-bold text-lg text-base-content">Nom</th>
//                 <th className="font-bold text-lg text-base-content">Email</th>
//                 <th className="font-bold text-lg text-base-content">Adresse</th>
//                 <th className="font-bold text-lg text-base-content">
//                   Téléphone
//                 </th>
//                 <th className="font-bold text-lg text-base-content">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {patients.map((patient) => (
//                 <tr key={patient._id}>
//                   <td>{patient.nom}</td>
//                   <td>{patient.email}</td>
//                   <td>{patient.adresse}</td>
//                   <td>{patient.telephone}</td>
//                   <td>
//                     <div className="flex justify-around space-x-1">
//                       <EditPatientButton
//                         userId={patient._id}
//                         onuserUpdated={refreshpatients}
//                       />
//                       {/* <button
//                         className="btn btn-error"
//                         onClick={() => deletepatient(patient._id)}
//                       >
//                         Supprimer
//                       </button> */}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   )
// }

// export default PatientList

import { useEffect, useState } from 'react'
import EditPatientButton from '../components/EditPatientButton' // Ajustez le chemin d'importation selon votre structure de fichiers
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import Chatbot from '../components/Chatbot'
import SignUp from '../components/Auth/SignUp'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

function PatientList() {
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [phoneSearchTerm, setPhoneSearchTerm] = useState('')
  const [nipSearchTerm, setNipSearchTerm] = useState('')
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    filterPatients(phoneSearchTerm, nipSearchTerm)
  }, [phoneSearchTerm, nipSearchTerm, patients])

  const fetchPatients = async () => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  const handlePhoneSearchTermChange = (event) => {
    setPhoneSearchTerm(event.target.value)
  }

  const handleNipSearchTermChange = (event) => {
    setNipSearchTerm(event.target.value)
  }

  const filterPatients = (phoneTerm, nipTerm) => {
    let filtered = patients
    if (phoneTerm) {
      const phoneTermLower = phoneTerm.toLowerCase()
      filtered = filtered.filter((patient) =>
        patient.telephone.toLowerCase().includes(phoneTermLower)
      )
    }
    if (nipTerm) {
      filtered = filtered.filter((patient) => patient.nip.includes(nipTerm))
    }
    setFilteredPatients(filtered)
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const refreshPatients = () => {
    fetchPatients()
  }

  const deletePatient = async (patientId) => {
    const confirmDelete = window.confirm(
      'Êtes-vous sûr de vouloir supprimer ce patient ?'
    )
    if (!confirmDelete) return

    try {
      setLoading(true) // Activer l'indicateur de chargement
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/user/${patientId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        alert('Patient supprimé avec succès.') // Afficher une alerte de succès
        fetchPatients() // Rafraîchir la liste des patients après la suppression
      } else {
        throw new Error(
          data.message || 'Erreur lors de la suppression du patient'
        )
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du patient:', error)
      alert('Erreur lors de la suppression du patient: ' + error.message) // Afficher l'erreur dans une alerte
    } finally {
      setLoading(false) // Désactiver l'indicateur de chargement
    }
  }

  return (
    <div className="base-content bg-base-100 mx-auto p-4 min-h-[800px]">
      <Chatbot />
      <NavigationBreadcrumb pageName="Patient" />

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
        value={phoneSearchTerm}
        onChange={handlePhoneSearchTermChange}
        className="input input-bordered input-primary w-full max-w-xs my-4"
      />
      <input
        type="text"
        placeholder="Rechercher par NIP..."
        value={nipSearchTerm}
        onChange={handleNipSearchTermChange}
        className="input input-bordered input-primary w-full max-w-xs my-4"
      />

      <dialog id="my_modal_4" className="modal">
        <div className="modal-box w-11/12 max-w-5xl">
          <SignUp onUser={refreshPatients} />
          <div className="modal-action">
            <form method="dialog">
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
                <th className="font-bold text-lg text-base-content">NIP</th>
                <th className="font-bold text-lg text-base-content">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient._id}>
                  <td>{patient.nom}</td>
                  <td>{patient.email}</td>
                  <td>{patient.adresse}</td>
                  <td>{patient.telephone}</td>
                  <td>{patient.nip}</td>
                  <td>
                    <div className="flex space-x-1">
                      <EditPatientButton
                        userId={patient._id}
                        onUserUpdated={refreshPatients}
                      />
                      <button
                        className="btn btn-error"
                        onClick={() => deletePatient(patient._id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
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
