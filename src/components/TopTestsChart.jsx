import React, { useEffect, useState } from 'react'
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

const apiUrl = import.meta.env.VITE_APP_API_BASE_URL // Remplacez par l'URL de base de votre API si différente

const TopTestsChart = () => {
  const [chartData, setChartData] = useState({
    datasets: [],
  })

  useEffect(() => {
    const fetchTopTests = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/analyse/toptests`)
        const data = await response.json()
        if (data.success) {
          const labels = data.data.map((test) => test.name)
          const counts = data.data.map((test) => test.count)

          setChartData({
            labels: labels,
            datasets: [
              {
                label: 'Nombre d’utilisations',
                data: counts,
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
              },
            ],
          })
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error)
      }
    }

    fetchTopTests()
  }, [])

  return (
    <div>
      {/* <h2>Tests les Plus Utilisés</h2> */}
      <Bar
        data={chartData}
        options={{
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: "Fréquence d'utilisation des parametres",
            },
          },
        }}
      />
    </div>
  )
}

export default TopTestsChart
