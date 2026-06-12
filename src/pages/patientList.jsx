// (Code mort retire — voir historique git pour l ancienne version.)
import { useEffect, useState } from 'react'
import EditPatientButton from '../components/EditPatientButton'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import Chatbot from '../components/Chatbot'
import SignUp from '../components/Auth/SignUp'
import CreateAnalyseForm from '../components/CreateAnalyseForm'
import { Card, SectionHeader } from '../components/ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

function PatientList() {
  const [patients, setPatients] = useState([])
  const [filteredPatients, setFilteredPatients] = useState([])
  const [loading, setLoading] = useState(false)
  const [phoneSearchTerm, setPhoneSearchTerm] = useState('')
  const [nipSearchTerm, setNipSearchTerm] = useState('')
  const [newPatientId, setNewPatientId] = useState('')
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

  // Appelé par SignUp après création réussie d'un patient :
  // ferme le modal d'inscription puis ouvre directement le modal d'ajout d'analyse
  // avec le patient fraîchement créé déjà sélectionné.
  const handlePatientCreated = (createdUser) => {
    fetchPatients()
    if (createdUser?._id) {
      setNewPatientId(createdUser._id)
      document.getElementById('my_modal_4')?.close()
      document.getElementById('analyse_after_patient_modal')?.showModal()
    }
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
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Chatbot />
      <NavigationBreadcrumb pageName="Patient" />

      <SectionHeader
        title="Patients"
        subtitle="Liste des patients enregistrés"
        action={
          <button
            className="btn btn-primary"
            onClick={() => document.getElementById('my_modal_4').showModal()}
          >
            + Nouveau patient
          </button>
        }
      />

      <Card className="mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="filter-tel">
              Recherche par téléphone
            </label>
            <input
              id="filter-tel"
              type="text"
              placeholder="Ex : 77 123 45 67"
              value={phoneSearchTerm}
              onChange={handlePhoneSearchTermChange}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="field-label" htmlFor="filter-nip">
              Recherche par NIP
            </label>
            <input
              id="filter-nip"
              type="text"
              placeholder="Ex : 0008026"
              value={nipSearchTerm}
              onChange={handleNipSearchTermChange}
              className="input input-bordered w-full"
            />
          </div>
        </div>
      </Card>

      <dialog id="my_modal_4" className="modal">
        <div className="modal-box modal-xl max-h-[90vh] overflow-y-auto">
          <SignUp onUser={handlePatientCreated} />
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Fermer</button>
            </form>
          </div>
        </div>
      </dialog>

      <dialog id="analyse_after_patient_modal" className="modal">
        <div className="modal-box modal-lg max-h-[90vh] overflow-y-auto">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <CreateAnalyseForm
            preselectedUserId={newPatientId}
            onAnalyseChange={() => {
              document.getElementById('analyse_after_patient_modal')?.close()
              setNewPatientId('')
            }}
          />
        </div>
      </dialog>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner text-primary"></span>
          <span className="ml-3 text-sm text-base-content/60">Chargement…</span>
        </div>
      ) : (
        <Card padding="sm">
          <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="text-xs uppercase tracking-wide text-base-content/60">NIP</th>
                <th className="text-xs uppercase tracking-wide text-base-content/60">Nom</th>
                <th className="text-xs uppercase tracking-wide text-base-content/60">Prénom</th>
                <th className="text-xs uppercase tracking-wide text-base-content/60">Email</th>
                <th className="text-xs uppercase tracking-wide text-base-content/60">Adresse</th>
                <th className="text-xs uppercase tracking-wide text-base-content/60">Téléphone</th>
                <th className="text-xs uppercase tracking-wide text-base-content/60">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient._id}>
                  <td className="font-mono text-sm">{patient.nip}</td>
                  <td>{patient.nom}</td>
                  <td>{patient.prenom || ''}</td>
                  <td>{patient.email}</td>
                  <td>{patient.adresse}</td>
                  <td>{patient.telephone}</td>
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
        </Card>
      )}
    </div>
  )
}

export default PatientList
