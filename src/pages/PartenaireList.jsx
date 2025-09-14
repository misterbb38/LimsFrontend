import { useEffect, useState } from 'react'
import EditpartenaireButton from '../components/EditPartenaireButton' // Ajustez le chemin d'importation selon votre structure de fichiers
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import AddpartenairetForm from '../components/AddPartenaireForm'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import FiltrePartenaire from '../components/FiltrePartenaire'

function PartenaireList() {
  const [partenaires, setpartenaires] = useState([])
  const [displayedPartenaires, setDisplayedPartenaires] = useState([])
  const [loading, setLoading] = useState(false) // Ajout d'un état pour le chargement
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  // Fonction pour charger les partenaires
  const fetchpartenaires = async () => {
    setLoading(true) // Commencer le chargement
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/partenaire`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        setpartenaires(data.data)
        setDisplayedPartenaires(data.data)
      } else {
        console.error('Failed to fetch partenaires')
      }
    } catch (error) {
      console.error('Error fetching partenaires:', error)
    } finally {
      setLoading(false) // Arrêter le chargement une fois que les données sont récupérées ou en cas d'erreur
    }
  }
  // Utilisez useEffect pour charger les partenaires au montage du composant
  useEffect(() => {
    fetchpartenaires()
  }, [])

  // Définir refreshpartenaires comme un appel à fetchpartenaires pour recharger les données
  const refreshpartenaires = () => {
    fetchpartenaires()
  }

  // Fonction pour supprimer un partenaire
  const deletepartenaire = async (partenaireId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/partenaire/${partenaireId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        // Rafraîchir la liste des partenaires après la suppression
        fetchpartenaires()
      } else {
        console.error('Failed to delete partenaire')
      }
    } catch (error) {
      console.error('Error deleting partenaire:', error)
    }
  }

  // Fonction de filtrage
  const handleFilter = (filters) => {
    setLoading(true)
    const filteredPartenaires = partenaires.filter((partenaire) => {
      let match = true

      // Filtrage par type de partenaire
      if (
        filters.typePartenaire &&
        partenaire.typePartenaire !== filters.typePartenaire
      ) {
        match = false
      }

      return match
    })
    setDisplayedPartenaires(filteredPartenaires)
    setLoading(false)
  }

  return (
    <div className="base-content bg-base-100 mx-auto p-4 min-h-[800px]">
      <NavigationBreadcrumb pageName="Partenaire" />
      <button
        className="btn"
        onClick={() => document.getElementById('my_modal_3').showModal()}
      >
        Ajouter un nouveau partenaire
      </button>
      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <AddpartenairetForm onPartenaireChange={refreshpartenaires} />
        </div>
      </dialog>

      <div className="divider"></div>

      <FiltrePartenaire onFilter={handleFilter} />

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
                <th className="font-bold text-lg text-base-content">Type</th>
                <th className="font-bold text-lg text-base-content">
                  Telephone
                </th>

                <th className="font-bold text-lg text-base-content">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedPartenaires.map((partenaire) => (
                <tr key={partenaire._id}>
                  <td>{partenaire.nom}</td>
                  <td>{partenaire.typePartenaire}</td>
                  <td>{partenaire.telephone}</td>

                  <td>
                    <div className="flex space-x-1">
                      <EditpartenaireButton
                        partenaireId={partenaire._id}
                        onpartenaireUpdated={refreshpartenaires}
                      />
                      <button
                        className="btn btn-error"
                        onClick={() => deletepartenaire(partenaire._id)}
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

export default PartenaireList
