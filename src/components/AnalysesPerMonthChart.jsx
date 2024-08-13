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

const apiUrl = import.meta.env.VITE_APP_API_BASE_URL // Assurez-vous que cette URL correspond à l'URL de base de votre API

const AnalysesPerMonthChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Nombre d'analyses",
        data: [],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  })

  useEffect(() => {
    const fetchAnalysesPerMonth = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      try {
        const response = await fetch(`${apiUrl}/api/analyse/analyseparmois`)
        const data = await response.json()
        if (data.success) {
          const monthNames = [
            'Janvier',
            'Février',
            'Mars',
            'Avril',
            'Mai',
            'Juin',
            'Juillet',
            'Août',
            'Septembre',
            'Octobre',
            'Novembre',
            'Décembre',
          ]
          const labels = data.data.map((item) => monthNames[item._id - 1])
          const counts = data.data.map((item) => item.count)

          setChartData({
            labels: labels,
            datasets: [
              {
                label: "Nombre d'analyses",
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

    fetchAnalysesPerMonth()
  }, [])

  return (
    <div>
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
              text: "Nombre d'analyses par mois",
            },
          },
        }}
      />
    </div>
  )
}

export default AnalysesPerMonthChart
