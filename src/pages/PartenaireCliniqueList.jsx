import { useEffect, useState } from 'react'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import Chatbot from '../components/Chatbot'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import AddCliniqueForm from '../components/AddCliniqueForm'
import EditCliniqueButton from '../components/EditCliniqueButton'

// Page "Partenaire" du sidebar : liste les cliniques partenaires
// (entrees de la collection Partenaire avec typePartenaire='clinique').
// Le contexte est purement cabinet medical / centre de soin partenaire
// du laboratoire ; aucune logique de facturation specifique ici (la
// facturation des assurances/IPM est dans la page Assurance/IPM).
function PartenaireCliniqueList() {
  const [cliniques, setCliniques] = useState([])
  const [displayed, setDisplayed] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  const fetchCliniques = async () => {
    setLoading(true)
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      // Fetch en parallele : la liste des partenaires (filtree sur
      // clinique) ET la liste des comptes utilisateurs type=partenaire
      // (qui detiennent le vrai NIP utilise pour l'authentification).
      const [partRes, userRes] = await Promise.all([
        fetch(`${apiUrl}/api/partenaire`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiUrl}/api/user/partenaireclinique`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      const partData = await partRes.json()
      const userData = await userRes.json()
      if (!partData.success) {
        console.error('Failed to fetch cliniques')
        return
      }
      // Mappe partenaireId -> { nip, userId } recupere depuis User
      const userByPartenaireId = new Map()
      if (userData.success && Array.isArray(userData.data)) {
        userData.data.forEach((u) => {
          const pid =
            u.partenaireId && (u.partenaireId._id || u.partenaireId)
          if (pid) {
            userByPartenaireId.set(String(pid), {
              userId: u._id,
              nip: u.nip,
            })
          }
        })
      }
      const cliniquesOnly = (partData.data || [])
        .filter((p) => p.typePartenaire === 'clinique')
        .map((c) => {
          const u = userByPartenaireId.get(String(c._id))
          return {
            ...c,
            nip: u?.nip || c.nip || '',
            userId: u?.userId || null,
          }
        })
      setCliniques(cliniquesOnly)
      setDisplayed(cliniquesOnly)
    } catch (error) {
      console.error('Error fetching cliniques:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCliniques()
  }, [])

  const refresh = () => fetchCliniques()

  const handleSearch = (value) => {
    setSearchTerm(value)
    const term = value.toLowerCase()
    if (!term) {
      setDisplayed(cliniques)
      return
    }
    setDisplayed(
      cliniques.filter(
        (c) =>
          (c.nom || '').toLowerCase().includes(term) ||
          (c.telephone || '').toLowerCase().includes(term) ||
          (c.nip || '').toLowerCase().includes(term)
      )
    )
  }

  const deleteClinique = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/partenaire/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) fetchCliniques()
      else console.error('Failed to delete clinique')
    } catch (error) {
      console.error('Error deleting clinique:', error)
    }
  }

  // Verification du role : seuls superadmin, medecin, technicien,
  // preleveur ont acces a la gestion des cliniques.
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  if (
    !['superadmin', 'medecin', 'technicien', 'preleveur', 'docteur'].includes(
      userInfo?.userType
    )
  ) {
    return (
      <div role="alert" className="alert alert-warning">
        <span>
          Informations non autorisées. Vous n&apos;avez pas le droit
          d&apos;accéder à cette page.
        </span>
      </div>
    )
  }

  return (
    <div className="base-content bg-base-100 mx-auto p-4 min-h-[800px]">
      <Chatbot />
      <NavigationBreadcrumb pageName="Clinique partenaire" />

      <button
        className="btn"
        onClick={() => document.getElementById('add_clinique_modal').showModal()}
      >
        Ajouter une clinique partenaire
      </button>

      <input
        type="text"
        placeholder="Rechercher par nom, téléphone ou NIP..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        className="input input-bordered input-primary w-full max-w-xs my-4 ml-4"
      />

      <dialog id="add_clinique_modal" className="modal">
        <div className="modal-box max-h-[90vh] overflow-y-auto">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <AddCliniqueForm onPartenaireChange={refresh} />
        </div>
      </dialog>

      <div className="divider"></div>

      {loading ? (
        <div className="loading loading-spinner text-primary">
          Chargement...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="font-bold text-lg text-base-content">Nom</th>
                <th className="font-bold text-lg text-base-content">
                  Téléphone
                </th>
                <th className="font-bold text-lg text-base-content">NIP</th>
                <th className="font-bold text-lg text-base-content">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((c) => (
                <tr key={c._id}>
                  <td>{c.nom}</td>
                  <td>{c.telephone}</td>
                  <td className="font-mono">{c.nip || '-'}</td>
                  <td>
                    <div className="flex space-x-1">
                      <EditCliniqueButton
                        userId={c.userId}
                        onPartenaireUpdated={refresh}
                      />
                      <button
                        className="btn btn-error"
                        onClick={() => deleteClinique(c._id)}
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

export default PartenaireCliniqueList
