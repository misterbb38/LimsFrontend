import { useEffect, useState } from 'react'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import FiltreEtiquette from '../components/FiltreEtiquette'

function EtiquetteList() {
  const [etiquettes, setEtiquettes] = useState([])
  const [filteredEtiquettes, setFilteredEtiquettes] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [etiquettesPerPage] = useState(10)
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    fetchEtiquettes()
  }, [])

  const fetchEtiquettes = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/eti`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      if (data.success) {
        const sortedEtiquettes = data.data.sort((a, b) => {
          return new Date(b.createdAt) - new Date(a.createdAt) // Tri décroissant par date
        })
        setEtiquettes(sortedEtiquettes)
        setFilteredEtiquettes(sortedEtiquettes)
      } else {
        console.error('Failed to fetch etiquettes')
      }
    } catch (error) {
      console.error('Error fetching etiquettes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = (filters) => {
    const isFiltersEmpty = Object.values(filters).every((value) => value === '')
    if (isFiltersEmpty) {
      setFilteredEtiquettes(etiquettes)
      setCurrentPage(1)
      return
    }

    const filtered = etiquettes.filter((etiquette) => {
      const matchIdentifiantAnalyse = filters.identifiantAnalyse
        ? etiquette.analyseId?.identifiant.includes(filters.identifiantAnalyse)
        : true
      const matchNomPartenaire = filters.nomPartenaire
        ? etiquette.partenaireId?.nom
            .toLowerCase()
            .includes(filters.nomPartenaire.toLowerCase())
        : true
      const matchTypePartenaire = filters.typePartenaire
        ? etiquette.partenaireId?.typePartenaire
            .toLowerCase()
            .includes(filters.typePartenaire.toLowerCase())
        : true
      const matchSommeAPayer = filters.sommeAPayer
        ? `${etiquette.sommeAPayer}`.includes(filters.sommeAPayer)
        : true

      let matchDate = true
      if (filters.date) {
        const filterDate = new Date(filters.date).setHours(0, 0, 0, 0)
        const etiquetteDate = new Date(etiquette.createdAt).setHours(0, 0, 0, 0)
        matchDate = filterDate === etiquetteDate
      }

      let matchMois = true
      if (filters.mois) {
        const filterMois = parseInt(filters.mois, 10)
        const etiquetteMois = new Date(etiquette.createdAt).getMonth() + 1
        matchMois = filterMois === etiquetteMois
      }

      return (
        matchIdentifiantAnalyse &&
        matchNomPartenaire &&
        matchTypePartenaire &&
        matchSommeAPayer &&
        matchDate &&
        matchMois
      )
    })

    setFilteredEtiquettes(filtered)
    setCurrentPage(1)
  }
  // Calcul de la somme totale des sommes payées pour les étiquettes filtrées
  const totalSommePayee = filteredEtiquettes.reduce(
    (acc, etiquette) => acc + Number(etiquette.sommeAPayer),
    0
  )

  const indexOfLastEtiquette = currentPage * etiquettesPerPage
  const indexOfFirstEtiquette = indexOfLastEtiquette - etiquettesPerPage
  const currentEtiquettes = filteredEtiquettes.slice(
    indexOfFirstEtiquette,
    indexOfLastEtiquette
  )

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  const totalPageCount = Math.ceil(
    filteredEtiquettes.length / etiquettesPerPage
  )

  function formatDate(date) {
    const d = new Date(date)
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`
  }

  // Récupérer les informations de l'utilisateur stockées localement
  const userInfo = JSON.parse(localStorage.getItem('userInfo'))

  // Vérifier si le type d'utilisateur est autorisé
  if (
    !['superadmin', 'medecin', 'technicien', 'preleveur', 'docteur'].includes(
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
      <NavigationBreadcrumb pageName="Étiquettes" />
      <div className="divider"></div>
      <FiltreEtiquette onFilter={handleFilter} />
      <div className="divider"></div>
      {loading ? (
        <div className="loading loading-spinner text-primary">
          Chargement...
        </div>
      ) : (
        <>
          <div className="total-somme-payee">
            <h3>Total des sommes payées: {totalSommePayee.toFixed(2)} CFA</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="font-bold text-lg text-base-content">Date</th>
                  <th className="font-bold text-lg text-base-content">
                    Identifiant Analyse
                  </th>
                  <th className="font-bold text-lg text-base-content">
                    Nom Partenaire
                  </th>
                  <th className="font-bold text-lg text-base-content">
                    Type Partenaire
                  </th>
                  <th className="font-bold text-lg text-base-content">
                    Somme Payée
                  </th>
                  <th className="font-bold text-lg text-base-content">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentEtiquettes.map((etiquette) => (
                  <tr key={etiquette._id}>
                    <td>{formatDate(etiquette.createdAt)}</td>
                    <td>{etiquette.analyseId?.identifiant}</td>
                    <td>
                      {etiquette.partenaireId
                        ? etiquette.partenaireId.nom
                        : 'Non disponible'}
                    </td>
                    <td>
                      {etiquette.partenaireId
                        ? etiquette.partenaireId.typePartenaire
                        : 'Non disponible'}
                    </td>
                    <td>{`${etiquette.sommeAPayer} Cfa`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPageCount > 1 && (
            <nav className="flex justify-center mt-4 pagination">
              {Array.from({ length: totalPageCount }, (_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={` page-link btn btn-secondary hover:bg-primary text-base-content rounde mr-2 page-item ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
            </nav>
          )}
        </>
      )}
    </div>
  )
}

export default EtiquetteList
