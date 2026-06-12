import { useState, useEffect } from 'react'
import EditAnalyseButton from '../components/EditAnalyseButton'
import GeneratePDFButton from '../components/GeneratePDFButton'
import GenerateResultatButton from '../components/GenerateResultatButton'
import GenerateTicketButton from '../components/GenerateTicketButton'
import CreateAnalyseForm from '../components/CreateAnalyseForm'
import ViewAnalyseButton from '../components/ViewAnalyseButton'
import FiltreAnalyse from '../components/AnalyseFilter'
import DeleteAnalyseButton from '../components/DeleteAnalyseButton'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import Chatbot from '../components/Chatbot'
import { Card, SectionHeader, StatusBadge } from '../components/ui'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function Facture() {
  const [allFactures, setAllFactures] = useState([])
  const [displayedFactures, setDisplayedFactures] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const facturesPerPage = 8

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  // Fonction pour rafraîchir les factures
  const refreshFactures = async () => {
    setLoading(true)
    await fetchFactures()
  }

  useEffect(() => {
    fetchFactures()
  }, [])

  const fetchFactures = async () => {
    try {
      // Récupérer le token de l'utilisateur stocké localement
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token

      const response = await fetch(`${apiUrl}/api/analyse`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, // Ajouter l'en-tête d'autorisation avec le token
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      if (data.success) {
        // Assurez-vous d'utiliser le bon champ de date ici
        const facturesFiltrees = data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt) // Utilisation de createdAt pour le tri
        )
        console.log(data)
        setAllFactures(facturesFiltrees)
        setDisplayedFactures(facturesFiltrees)
      }
      setLoading(false)
    } catch (error) {
      console.error('Erreur:', error)
      setLoading(false)
    }
  }

  const handleFilter = (filters) => {
    setLoading(true)

    const filteredFactures = allFactures.filter((facture) => {
      let match = true // Initialise comme true; la facture correspond aux filtres jusqu'à preuve du contraire.

      // Filtrage par nom (si spécifié)
      if (
        filters.name &&
        !facture.userId.prenom
          .toLowerCase()
          .includes(filters.name.toLowerCase())
      ) {
        match = false
      }

      // NIP filter
      if (
        filters.nip &&
        (!facture.userId?.nip ||
          !facture.userId?.nip.toString().includes(filters.nip))
      ) {
        match = false
      }

      // identifiant filter
      if (
        filters.identifiant &&
        (!facture.identifiant ||
          !facture.identifiant.toString().includes(filters.identifiant))
      ) {
        match = false
      }

      if (
        filters.telephone &&
        !facture.userId.telephone
          .toLowerCase()
          .includes(filters.telephone.toLowerCase())
      ) {
        match = false
      }

      // Filtrage par date (si spécifiée)
      if (
        filters.date &&
        new Date(facture.createdAt).toLocaleDateString() !==
          new Date(filters.date).toLocaleDateString()
      ) {
        match = false
      }

      // Filtrage par statut (si spécifié)
      const lastStatus =
        facture.historiques.length > 0
          ? facture.historiques[facture.historiques.length - 1].status
          : ''
      if (filters.status && lastStatus !== filters.status) {
        match = false
      }

      return match // Retourne true si la facture passe tous les filtres applicables.
    })

    setDisplayedFactures(filteredFactures)
    setCurrentPage(1)
    setLoading(false)
  }

  function formatDate(date) {
    const d = new Date(date)
    const pad = (num) => (num < 10 ? '0' + num : num)

    const day = pad(d.getDate())
    const month = pad(d.getMonth() + 1) // Les mois sont basés sur 0
    const year = d.getFullYear()
    const hours = pad(d.getHours())
    const minutes = pad(d.getMinutes())
    const seconds = pad(d.getSeconds())

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  const indexOfLastFacture = currentPage * facturesPerPage
  const indexOfFirstFacture = indexOfLastFacture - facturesPerPage
  const currentFactures = displayedFactures.slice(
    indexOfFirstFacture,
    indexOfLastFacture
  )
  const totalPageCount = Math.ceil(displayedFactures.length / facturesPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  // Récupérer les informations de l'utilisateur stockées localement
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))

  // Vérifier si le type d'utilisateur est autorisé
  if (
    ![
      'superadmin',
      'medecin',
      'technicien',
      'preleveur',
      'docteur',
      'accueil',
    ].includes(userInfo?.userType)
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
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Chatbot />
      <NavigationBreadcrumb pageName="Analyse" />

      <SectionHeader
        title="Analyses"
        subtitle="Suivi des analyses, factures et résultats"
        action={
          <button
            className="btn btn-primary"
            onClick={() => document.getElementById('my_modal_3').showModal()}
          >
            + Ajouter une analyse
          </button>
        }
      />

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box modal-lg max-h-[90vh] overflow-y-auto">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>

          <CreateAnalyseForm
            onAnalyseChange={() => {
              refreshFactures()
              document.getElementById('my_modal_3').close()
            }}
          />
        </div>
      </dialog>

      <Card className="mb-4">
        <FiltreAnalyse onFilter={handleFilter} />
      </Card>

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
                  <th className="text-xs uppercase tracking-wide text-base-content/60">Date</th>
                  <th className="text-xs uppercase tracking-wide text-base-content/60">
                    Dossier
                  </th>
                  <th className="text-xs uppercase tracking-wide text-base-content/60">
                    Patient
                  </th>
                  <th className="text-xs uppercase tracking-wide text-base-content/60">NIP</th>
                  <th className="text-xs uppercase tracking-wide text-base-content/60">
                    Paramettre
                  </th>
                  <th className="text-xs uppercase tracking-wide text-base-content/60">
                    Facture
                  </th>
                  <th className="text-xs uppercase tracking-wide text-base-content/60">
                    {' '}
                    Status
                  </th>

                  <th className="text-xs uppercase tracking-wide text-base-content/60">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentFactures.map((facture) => (
                  <tr key={facture._id}>
                    <td>{formatDate(facture.createdAt)}</td>
                    <td>
                      {facture.identifiant}
                      <GenerateTicketButton invoice={facture} />
                    </td>

                    <td>
                      {facture.userId
                        ? `${facture.userId.prenom} ${facture.userId.nom}`
                        : 'Non attribué'}
                    </td>
                    <td>
                      {facture.userId ? facture.userId.nip : 'Non disponible'}
                    </td>
                    <td>{facture.tests.map((test) => test.nom).join(', ')}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <GeneratePDFButton invoice={facture} />
                        <StatusBadge
                          value={facture.statusPayement}
                          type="payment"
                        />
                      </div>
                    </td>

                    <td>
                      <StatusBadge
                        value={
                          facture.historiques.length > 0
                            ? facture.historiques[
                                facture.historiques.length - 1
                              ].status
                            : 'Non défini'
                        }
                        compact
                      />
                    </td>

                    <td>
                      <div className="flex flex-row flex-wrap items-center gap-1">
                        {facture.resultat.length > 0 && (
                          <GenerateResultatButton invoice={facture} />
                        )}

                        {facture.fileResultat &&
                          facture.fileResultat.length > 0 && (
                            <a
                              href={facture.fileResultat[0].path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary btn-sm"
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </a>
                          )}

                        <ViewAnalyseButton
                          analyseId={facture._id}
                          onAnalyseRefresh={refreshFactures}
                          sourceFacture={facture}
                        />
                        <EditAnalyseButton
                          analyseId={facture._id}
                          onAnalyseUpdated={refreshFactures}
                        />
                        <DeleteAnalyseButton
                          analyseId={facture._id}
                          onAnalyseDeleted={refreshFactures}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPageCount > 1 && (
            <nav className="flex justify-center mt-4">
              <div className="join">
                {Array.from({ length: totalPageCount }).map((_, i) => (
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

export default Facture
