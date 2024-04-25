import { useEffect, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const StatsPartenaire = () => {
  const [partners, setPartners] = useState([])
  const [selectedPartner, setSelectedPartner] = useState('')
  const [chartData, setChartData] = useState({
    labels: Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`),
    datasets: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    fetchPartners()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchStats(selectedPartner)
  }, [selectedPartner])

  const fetchPartners = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const token = userInfo?.token

    try {
      const response = await fetch(`${apiUrl}/api/partenaire`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setPartners(data.data)
    } catch (error) {
      console.error('Error fetching partners:', error)
      setError('Failed to load partners')
    }
  }

  const fetchStats = async (partnerId = '') => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const token = userInfo?.token

    try {
      const response = await fetch(
        `${apiUrl}/api/eti/stats?year=2024&partenaireId=${partnerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const data = await response.json()
      const monthsData = new Array(12).fill(0) // Crée un tableau de 12 éléments initialisés à 0
      data.data.forEach((stat) => {
        if (stat.month && stat.totalSomme !== undefined) {
          monthsData[stat.month - 1] = stat.totalSomme // Affecte la somme au mois correct (mois - 1 pour l'index du tableau)
        }
      })
      const formattedData = {
        labels: Array.from({ length: 12 }, (_, i) => `Mois ${i + 1}`),
        datasets: [
          {
            label: 'Total',
            data: monthsData, // Utilise le tableau de données par mois
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
          },
        ],
      }
      setChartData(formattedData)
    } catch (error) {
      console.error('Error fetching statistics:', error)
      setError('Failed to load statistics')
    }
  }

  return (
    <div>
      {error && <p>{error}</p>}
      {!error && (
        <>
          <select
            value={selectedPartner}
            onChange={(e) => setSelectedPartner(e.target.value)}
            className="select select-primary w-full max-w-xs"
          >
            <option value="">Partenaire</option>
            {partners.map((partner) => (
              <option key={partner._id} value={partner._id}>
                {partner.nom}
              </option>
            ))}
          </select>
          <Bar
            data={chartData}
            options={{
              scales: {
                y: { beginAtZero: true },
              },
              plugins: {
                legend: { position: 'top' },
                title: {
                  display: true,
                  text: 'Montant par mois',
                },
              },
            }}
          />
        </>
      )}
    </div>
  )
}

export default StatsPartenaire
