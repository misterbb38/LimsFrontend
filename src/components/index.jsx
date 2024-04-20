import { useState } from 'react'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import UseInvoiceStats from './dataInvoice/UseInvoiceStats'
import UseFilteredStats from './dataInvoice/UseFilteredStats'
import Graphpaid from './graph/GraphPaid'
import Graphpending from './graph/GraphPending'
import GraphCancelled from './graph/GraphCancelled'
import GraphFilter from './graph/GraphFilter'
import ClientInvoiceSummary from './SummaryClient'
import ClientMonthlyStats from './ClientMonthlyStats'
import SelectYear from './SelectYear' // Assurez-vous que ce composant existe pour sélectionner l'année
const HomeContent = () => {
  const [selectedYear, setSelectedYear] = useState('2024')
  const stats = UseInvoiceStats(selectedYear)

  const filteredStats = UseFilteredStats()
  console.log(stats)
  console.log(filteredStats)

  let countpaid = 0,
    totalAmountpaid = 0,
    countpending = 0,
    totalAmountpending = 0,
    countCancelled = 0,
    totalAmountCancelled = 0,
    totalCount = 0
  // Calcul des statistiques basé sur les données récupérées
  if (stats) {
    stats.forEach(({ _id, totalAmount, count }) => {
      switch (_id.status) {
        case 'Payée':
          countpaid += count
          totalAmountpaid += totalAmount
          break
        case 'Attente':
          countpending += count
          totalAmountpending += totalAmount
          break
        case 'Annullée':
          countCancelled += count
          totalAmountCancelled += totalAmount
          break
        default:
          break
      }
    })
    totalCount = stats.reduce((acc, curr) => acc + curr.count, 0)
  }

  const percentagepaid = ((countpaid / totalCount) * 100).toFixed(1) || 0
  const percentagepending = ((countpending / totalCount) * 100).toFixed(1) || 0
  const percentageCancelled =
    ((countCancelled / totalCount) * 100).toFixed(1) || 0

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
    <div className=" bg-base-100 p-4">
      <NavigationBreadcrumb pageName="Acceuil" />

      {/* Section supérieure avec quatre boîtes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="box bg-base-300 p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Choisir une année</h2>
          <SelectYear
            selectedYear={selectedYear}
            onYearChange={(year) => setSelectedYear(year)}
          />
        </div>
        <div className="bg-base-300 box p-4 rounded-lg shadow flex justify-between items-center">
          <div>
            <h2 className="text-lg base-content font-semibold">
              Factures payées
            </h2>
            <span className="text-xs font-bold">Nombre: {countpaid}</span>
            <p className="text-xs font-bold">somme:{totalAmountpaid} cfa</p>
            <p className="text-xs font-bold">poucentage:{percentagepaid}% </p>
          </div>
          <div>
            <Graphpaid selectedYear={selectedYear} />
            <p className="text-xl"></p>
          </div>
        </div>

        <div className="bg-base-300 box p-4 rounded-lg shadow flex justify-between items-center">
          <div>
            <h2 className="text-lg base-content font-semibold">
              Factures en attente
            </h2>
            <span className="text-xs font-bold">Nombre: {countpending}</span>
            <p className="text-xs font-bold">somme:{totalAmountpending} cfa</p>
            <p className="text-xs font-bold">
              poucentage:{percentagepending}%{' '}
            </p>
          </div>
          <div>
            <Graphpending selectedYear={selectedYear} />
            <p className="text-xl"></p>
          </div>
        </div>
        <div className="bg-base-300 box p-4 rounded-lg shadow flex justify-between items-center">
          <div>
            <h2 className="text-lg base-content font-semibold">
              Factures annullées
            </h2>
            <span className="text-xs font-bold">Nombre: {countCancelled}</span>
            <p className="text-xs font-bold">
              somme:{totalAmountCancelled} cfa
            </p>
            <p className="text-xs font-bold">
              poucentage:{percentageCancelled}%{' '}
            </p>
          </div>
          <div>
            <GraphCancelled selectedYear={selectedYear} />
            <p className="text-xl"></p>
          </div>
        </div>
      </div>
      {/* Section divisée en deux parties */}
      <div className="flex flex-wrap -mx-4 mb-8">
        <div className="w-full md:w-1/2 px-4">
          {/* Contenu de la partie gauche */}
          <div className="bg-base-300 p-4 rounded-lg shadow h-[50vh]">
            <GraphFilter />
          </div>
        </div>
        <div className="w-full md:w-1/2 px-4">
          {/* Contenu de la partie droite, divisé verticalement */}
          <div className="flex flex-col space-y-4">
            <div className="mt-2 bg-base-300 p-4 rounded-lg shadow h-[24vh]">
              <ClientInvoiceSummary selectedYear={selectedYear} />
            </div>
            <div className="bg-base-300 p-4 rounded-lg shadow h-[24vh]">
              <ClientMonthlyStats selectedYear={selectedYear} />
            </div>
          </div>
        </div>
      </div>

      {/* Div large de 300px en bas */}
      {/* <div className="w-full mb-8" >
        <div className="bg-base-300 p-4 rounded-lg shadow" style={{ minWidth: "300px", minHeight:"200px" }}>Contenu Large</div>
      </div> */}
    </div>
  )
}

export default HomeContent
