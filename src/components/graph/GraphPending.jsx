import { Doughnut } from 'react-chartjs-2'
import { Chart, ArcElement } from 'chart.js'
import UseInvoiceStats from '../dataInvoice/UseInvoiceStats'
import PropTypes from 'prop-types'

// Enregistrement de l'ArcElement nécessaire pour le Doughnut chart
Chart.register(ArcElement)

function Graphpending({ selectedYear }) {
  const stats = UseInvoiceStats(selectedYear)

  let countpending = 0
  let totalCount = 0

  if (stats && stats.length > 0) {
    // Filtrer les données pour l'année sélectionnée
    const filteredStatsForYear = stats.filter(
      (stat) => stat._id.year === parseInt(selectedYear, 10)
    )

    // Trouver les statistiques pour les factures paids
    const invoicepending = filteredStatsForYear.find(
      (stat) => stat._id.status === 'Attente'
    )
    if (invoicepending) {
      countpending = invoicepending.count
    }

    // Calculer le nombre total des factures pour l'année sélectionnée
    totalCount = filteredStatsForYear.reduce((acc, curr) => acc + curr.count, 0)
  }

  const data = {
    labels: ['Factures En attente', 'Autres Factures'],
    datasets: [
      {
        data: [countpending, totalCount - countpending],
        backgroundColor: ['#36A2EB', '#FF6384'],
      },
    ],
  }
  const options = {
    maintainAspectRatio: false,
  }

  return (
    <div className="h-20 w-20">
      {' '}
      {/* Ajustement pour un meilleur affichage */}
      <Doughnut data={data} options={options} />
    </div>
  )
}

Graphpending.propTypes = {
  selectedYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
}

export default Graphpending
