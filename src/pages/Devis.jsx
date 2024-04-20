import { useState, useEffect } from 'react'
import EditFactureButton from '../components/EditAnalyseButton'
import GeneratePDFButton from '../components/GeneratePDFButton'
import FilterFactures from '../components/AnalyseFilter'
import DeleteFactureButton from '../components/DeleteAnalyseButton'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import CurrencySelector from '../components/CurrencySelector' // Importez le nouveau composant
import Chatbot from '../components/Chatbot'

function Facture() {
  const [allFactures, setAllFactures] = useState([])
  const [displayedFactures, setDisplayedFactures] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [currency, setCurrency] = useState('FCFA') // EUR comme valeur par défaut

  // Mapping des statuts aux classes de couleur de DaisyUI
  const statusBadgeClasses = {
    Attente: 'badge badge-warning',
    Payée: 'badge badge-success',
    Annullée: 'badge badge-error',
  }

  const facturesPerPage = 10

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  // Fonction pour rafraîchir les factures
  const refreshFactures = async () => {
    setLoading(true)
    await fetchFactures()
  }

  useEffect(() => {
    fetchFactures()
  }, [])

  // const fetchFactures = async () => {
  //   try {
  //     const response = await fetch(`${apiUrl}/api/invoice`);
  //     const data = await response.json();
  //     if (data.success) {
  //       const facturesFiltrees = data.data
  //         .filter(facture => facture.type === "facture")
  //         .sort((a, b) => new Date(b.date) - new Date(a.date)); // Tri par date décroissante
  //         console.log(data.data)

  //       setAllFactures(facturesFiltrees);
  //       setDisplayedFactures(facturesFiltrees);
  //     }
  //     setLoading(false);
  //   } catch (error) {
  //     console.error("Erreur:", error);
  //     setLoading(false);
  //   }
  // };
  const fetchFactures = async () => {
    try {
      // Récupérer le token de l'utilisateur stocké localement
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token

      const response = await fetch(`${apiUrl}/api/invoice`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, // Ajouter l'en-tête d'autorisation avec le token
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      if (data.success) {
        const facturesFiltrees = data.data
          .filter((facture) => facture.type === 'devis')
          .sort((a, b) => new Date(b.date) - new Date(a.date)) // Tri par date décroissante

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
      // Filtrage par nom du client
      if (
        filters.name &&
        !facture.client.name.toLowerCase().includes(filters.name.toLowerCase())
      ) {
        return false
      }

      // Filtrage par date
      if (
        filters.date &&
        new Date(facture.date).toLocaleDateString() !==
          new Date(filters.date).toLocaleDateString()
      ) {
        return false
      }

      // Filtrage par année
      if (
        filters.year &&
        new Date(facture.date).getFullYear().toString() !== filters.year
      ) {
        return false
      }

      // Filtrage par mois
      if (
        filters.month &&
        (new Date(facture.date).getMonth() + 1).toString() !== filters.month
      ) {
        return false
      }

      // Filtrage par total
      if (filters.total && facture.total !== parseFloat(filters.total)) {
        return false
      }
      // Filtrage par statut
      if (
        filters.status &&
        facture.status.toLowerCase() !== filters.status.toLowerCase()
      ) {
        return false
      }

      return true
    })

    setDisplayedFactures(filteredFactures)
    setCurrentPage(1)
    setLoading(false)
  }

  const indexOfLastFacture = currentPage * facturesPerPage
  const indexOfFirstFacture = indexOfLastFacture - facturesPerPage
  const currentFactures = displayedFactures.slice(
    indexOfFirstFacture,
    indexOfLastFacture
  )
  const totalPageCount = Math.ceil(displayedFactures.length / facturesPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  return (
    <div className="base-content bg-base-100 mx-auto p-4 min-h-[800px]">
      <Chatbot />
      <NavigationBreadcrumb pageName="Facture" />
      <div className="divider"></div>
      {/* <h2 className="text-2xl font-bold mb-4">Factures</h2> */}
      <FilterFactures onFilter={handleFilter} />
      {/* // Ajout dans le rendu JSX de Facture, là où vous souhaitez que le sélecteur apparaisse */}
      <CurrencySelector currency={currency} setCurrency={setCurrency} />

      <div className="divider"></div>
      {loading ? (
        <div className="loading loading-spinner text-primary">
          Chargement...
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="font-bold text-lg text-base-content">
                    Nom du Client
                  </th>
                  <th className="font-bold text-lg text-base-content">Date</th>
                  <th className="font-bold text-lg text-base-content">
                    Nº facture
                  </th>
                  <th className="font-bold text-lg text-base-content">Total</th>
                  <th className="font-bold text-lg text-base-content">
                    Status
                  </th>
                  <th className="font-bold text-lg text-base-content">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentFactures.map((facture) => (
                  <tr key={facture._id}>
                    <td>{facture.client.name} </td>
                    <td>{new Date(facture.date).toLocaleDateString()}</td>
                    <td>{facture.invoiceNumber}</td>
                    <td>
                      {facture.total.toFixed(2)} {currency}
                    </td>
                    {/* <td>{facture.status}</td> */}

                    <td className="text-center ">
                      <span
                        className={`${statusBadgeClasses[facture.status]} text-white  `}
                      >
                        {facture.status.charAt(0).toUpperCase() +
                          facture.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-around space-x-1">
                        <GeneratePDFButton
                          invoice={facture}
                          currency={currency}
                        />
                        <EditFactureButton
                          factureId={facture._id}
                          onFactureUpdated={refreshFactures}
                        />
                        <DeleteFactureButton
                          factureId={facture._id}
                          onFactureDeleted={refreshFactures}
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
              <ul className="flex list-none">
                {Array.from({ length: totalPageCount }).map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${currentPage === i + 1 ? 'active' : ''} mr-2`}
                  >
                    <a
                      onClick={() => paginate(i + 1)}
                      className="page-link btn btn-secondary hover:bg-primary text-base-content rounded"
                    >
                      {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  )
}

export default Facture
