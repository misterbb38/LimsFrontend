// (Code mort retire — voir historique git pour l ancienne version.)
import { useEffect, useState } from 'react'
import EditTestButton from '../components/EditTestButton'
import ViewTestButton from '../components/ViewTestButton'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import AddTestForm from '../components/AddTestForm'
import { Card, SectionHeader } from '../components/ui'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

function TestList() {
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    fetchTests()
  }, [currentPage]) // Recharger à chaque changement de page

  const fetchTests = async () => {
    setLoading(true)
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(
        `${apiUrl}/api/test?page=${currentPage}&search=${searchTerm}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const data = await response.json()
      if (data.success) {
        setTests(data.data)
        setTotalPages(data.totalPages) // Assumant que l'API renvoie le nombre total de pages
      } else {
        console.error('Failed to fetch tests')
      }
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1) // Réinitialiser à la première page lors de la recherche
    fetchTests()
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Fonction pour supprimer un test
  const deleteTest = async (testId) => {
    const confirmDelete = window.confirm(
      'Êtes-vous sûr de vouloir supprimer ce test ?'
    )
    if (!confirmDelete) return

    try {
      setLoading(true)
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/test/${testId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        alert('Test supprimé avec succès.')
        fetchTests() // Rafraîchir la liste des tests après la suppression
      } else {
        throw new Error(data.message || 'Erreur lors de la suppression du test')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du test:', error)
      alert('Erreur lors de la suppression du test: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <NavigationBreadcrumb pageName="Paramettre" />

      <SectionHeader
        title="Paramètres d'analyse"
        subtitle="Catalogue des tests proposés et leurs tarifs"
        action={
          <button
            className="btn btn-primary"
            onClick={() => document.getElementById('my_modal_3').showModal()}
          >
            + Nouveau paramètre
          </button>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <div className="flex-1">
            <label className="field-label" htmlFor="search">
              Recherche
            </label>
            <input
              id="search"
              type="text"
              placeholder="Nom du paramètre…"
              className="input input-bordered w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(event) => event.key === 'Enter' && handleSearch()}
            />
          </div>
          <button className="btn btn-primary" onClick={handleSearch}>
            Rechercher
          </button>
        </div>
      </Card>

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box modal-lg max-h-[90vh] overflow-y-auto">
          <AddTestForm onTestChange={fetchTests} />
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Fermer</button>
            </form>
          </div>
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
                  <th className="text-xs uppercase tracking-wide text-base-content/60">Nom</th>
                  <th className="text-xs uppercase tracking-wide text-base-content/60">Coef. B</th>
                  <th className="text-xs uppercase tracking-wide text-base-content/60">Prix PAF</th>
                  <th className="text-xs uppercase tracking-wide text-base-content/60">Prix Assurance</th>
                  <th className="text-xs uppercase tracking-wide text-base-content/60">Prix IPM</th>
                  <th className="text-xs uppercase tracking-wide text-base-content/60">Prix Sococim</th>
                  <th className="text-xs uppercase tracking-wide text-base-content/60">Prix Clinique</th>
                  <th className="text-xs uppercase tracking-wide text-base-content/60">Status</th>
                  <th className="text-xs uppercase tracking-wide text-base-content/60">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test._id}>
                    <td>{test.nom}</td>
                    <td>{test.coeficiantB}</td>
                    <td>{test.prixPaf}</td>
                    <td>{test.prixAssurance}</td>
                    <td>{test.prixIpm}</td>
                    <td>{test.prixSococim}</td>
                    <td>{test.prixClinique}</td>
                    <td>
                      <span
                        className={`badge ${test.status ? 'badge-success' : 'badge-error'}`}
                      >
                        {test.status ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <div className="flex space-x-1">
                        <EditTestButton
                          testId={test._id}
                          onTestUpdated={fetchTests}
                        />
                        <ViewTestButton testId={test._id} />
                        <button
                          className="btn btn-error"
                          onClick={() => deleteTest(test._id)}
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
          {totalPages > 1 && (
            <nav className="flex justify-center mt-4">
              <div className="join">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`join-item btn btn-sm ${currentPage === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </nav>
          )}
        </Card>
      )}
    </div>
  )
}

export default TestList
