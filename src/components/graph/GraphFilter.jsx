import { useState, useEffect, useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import UseFilteredStats from '../dataInvoice/UseFilteredStats'

const GraphFilter = () => {
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  )
  const [isLoading, setIsLoading] = useState(true) // Assurez-vous que la valeur initiale correspond à l'état de chargement initial
  const filteredStats = UseFilteredStats({ year: selectedYear })

  // Calcul des séries pour le diagramme
  const chartSeries = useMemo(() => {
    return Object.keys(filteredStats || {}).map((status) => ({
      name: status,
      data: filteredStats[status]?.map((month) => month.totalAmount) || [],
    }))
  }, [filteredStats])

  useEffect(() => {
    // Détecte si filteredStats est en train d'être chargé
    setIsLoading(!filteredStats) // Simplement basculer l'état de chargement basé sur la présence de filteredStats
  }, [filteredStats])

  // Options pour ApexChart, avec activation de la fonctionnalité de téléchargement
  const chartOptions = {
    chart: {
      type: 'bar',
      height: 350,

      toolbar: {
        show: true,
        tools: {
          download: true, // Active le bouton de téléchargement
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: [
        'Jan',
        'Fev',
        'Mar',
        'Avr',
        'Mai',
        'Jui',
        'Jul',
        'Aut',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
    },
    yaxis: {
      title: {
        text: 'Montant Total',
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + ' Cfa'
        },
      },
      fixed: {
        enabled: false, // Si nécessaire, ajustez cette option pour contrôler le comportement du tooltip
      },
    },
    legend: {
      position: 'top',
    },
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 rounded-lg shadow h-full">
      <div className="mb-4">
        <label htmlFor="yearSelector">Sélectionner une année :</label>
        <select
          id="yearSelector"
          value={selectedYear}
          onChange={(e) => {
            setIsLoading(true)
            setSelectedYear(e.target.value)
          }}
          className="ml-2 border-2"
        >
          {Array.from(
            new Array(20),
            (_, index) => new Date().getFullYear() - index
          ).map((year) => (
            <option key={year} value={year.toString()}>
              {year}
            </option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <span className="loading loading-spinner text-primary"></span>
      ) : (
        <div className="w-full h-full">
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="bar"
            height="100%" // Hauteur fixe pour assurer une bonne visualisation
          />
        </div>
      )}
    </div>
  )
}

export default GraphFilter
