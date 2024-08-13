// import React, { useState, useEffect } from 'react'
// import { Line } from 'react-chartjs-2'
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Filler,
//   Title,
//   Tooltip,
// } from 'chart.js'

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
//   Filler,
//   Title,
//   Tooltip
// )

// const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

// const TestUsageByMonthChart = () => {
//   const [chartData, setChartData] = useState({
//     labels: [],
//     datasets: [],
//   })

//   useEffect(() => {
//     const fetchData = async () => {
//       const response = await fetch(`${apiUrl}/api/analyse/testusageparmois`)
//       const { data } = await response.json()
//       processChartData(data)
//     }
//     fetchData()
//   }, [])

//   const processChartData = (data) => {
//     const monthLabels = Array.from(
//       new Set(data.map((item) => item.month))
//     ).sort()
//     const testNames = Array.from(new Set(data.map((item) => item.testName)))
//     const datasets = testNames.map((testName) => ({
//       label: testName,
//       data: monthLabels.map((month) => {
//         const item = data.find(
//           (d) => d.month === month && d.testName === testName
//         )
//         return item ? item.testCount : 0
//       }),
//       backgroundColor: getRandomColor(0.5),
//       borderColor: getRandomColor(1),
//       fill: false,
//     }))

//     setChartData({
//       labels: monthLabels.map((month) => `mois ${month}`),
//       datasets,
//     })
//   }

//   const getRandomColor = (opacity) => {
//     const r = Math.floor(Math.random() * 255)
//     const g = Math.floor(Math.random() * 255)
//     const b = Math.floor(Math.random() * 255)
//     return `rgba(${r}, ${g}, ${b}, ${opacity})`
//   }

//   return (
//     <div>
//       {/* <h2>Utilisation des Tests par Mois</h2> */}
//       <Line
//         data={chartData}
//         options={{
//           responsive: true,
//           plugins: {
//             legend: {
//               display: false, // Désactiver la légende
//             },
//             title: {
//               display: true,
//               text: 'Utilisation des Tests par Mois',
//             },
//           },
//           scales: {
//             x: {
//               stacked: true,
//             },
//             y: {
//               stacked: true,
//             },
//           },
//         }}
//       />
//     </div>
//   )
// }

// export default TestUsageByMonthChart
import React, { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip
)

const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

const TestUsageByMonthChart = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(`${apiUrl}/api/analyse/testusageparmois`)
      const { data } = await response.json()
      processChartData(data)
    }
    fetchData()
  }, [])

  const processChartData = (data) => {
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

    const monthLabels = Array.from(
      new Set(data.map((item) => item.month))
    ).sort()

    const testNames = Array.from(new Set(data.map((item) => item.testName)))
    const datasets = testNames.map((testName) => ({
      label: testName,
      data: monthLabels.map((month) => {
        const item = data.find(
          (d) => d.month === month && d.testName === testName
        )
        return item ? item.testCount : 0
      }),
      backgroundColor: getRandomColor(0.5),
      borderColor: getRandomColor(1),
      fill: false,
    }))

    setChartData({
      labels: monthLabels.map((month) => monthNames[month - 1]),
      datasets,
    })
  }

  const getRandomColor = (opacity) => {
    const r = Math.floor(Math.random() * 255)
    const g = Math.floor(Math.random() * 255)
    const b = Math.floor(Math.random() * 255)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  return (
    <div>
      <Line
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: false, // Désactiver la légende
            },
            title: {
              display: true,
              text: 'Utilisation des Tests par Mois',
            },
          },
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
            },
          },
        }}
      />
    </div>
  )
}

export default TestUsageByMonthChart
