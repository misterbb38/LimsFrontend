import { useState, useEffect } from 'react'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import SelectFilter from './SelectFilter' // Composant pour sélectionner l'année et le groupe d'âge
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import StatsPartenaire from './StatsPartenaire'
import TopTestsChart from './TopTestsChart'
import AnalysesPerMonthChart from './AnalysesPerMonthChart'
import TestUsageByMonthChart from './TestUsageByMonthChart'

const HomeContent = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [data, setData] = useState({
    totalPatients: 0,
    maleCount: 0,
    femaleCount: 0,
    minorsCount: 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      setError('')

      try {
        const apiUrl = import.meta.env.VITE_APP_API_BASE_URL // Vérifiez que cette variable d'environnement est bien définie
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const token = userInfo?.token

        const yearParam = selectedYear ? `/${selectedYear}` : ''
        const response = await fetch(
          `${apiUrl}/api/user/patient-stats${yearParam}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const result = await response.json()
        setData({
          totalPatients: result.totalPatients,
          maleCount: result.maleCount,
          femaleCount: result.femaleCount,
          minorsCount: result.minorsCount,
        })
      } catch (error) {
        setError(`Failed to fetch data: ${error.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [selectedYear])

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  const COLORS = ['#FF69B4', '#1E90FF', '#FFD700'] // Couleurs pour femmes, hommes, enfants

  const renderPieChart = (value, total, color, name) => (
    <ResponsiveContainer width="70%" height={100}>
      <PieChart>
        <Pie
          data={[
            { name: 'Valeur', value },
            { name: 'Total', value: total - value },
          ]}
          cx="50%"
          cy="50%"
          outerRadius={50}
          fill={color}
          dataKey="value"
          label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
        >
          <Cell key={`cell-${name}`} fill={color} />
          <Cell key={`cell-total`} fill="#FF0000" />
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )

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

      {/* Section supérieure avec quatre boîtes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-base-300 box rounded-lg shadow flex flex-col p-4">
          <SelectFilter
            label="Anneé"
            selectedValue={selectedYear}
            onChange={setSelectedYear}
            options={[2022, 2023, 2024, 2025]}
          />
        </div>

        <div className="bg-base-300 box rounded-lg shadow flex flex-col items-center p-1 space-y-2">
          {renderPieChart(
            data.femaleCount,
            data.totalPatients,
            COLORS[0],
            'Women'
          )}
          <span>Nombre de femmes: {data.femaleCount}</span>
        </div>

        <div className="bg-base-300 box rounded-lg shadow flex flex-col items-center p-1 space-y-2">
          {renderPieChart(data.maleCount, data.totalPatients, COLORS[1], 'Men')}
          <span>Nombre d'hommes: {data.maleCount}</span>
        </div>

        <div className="bg-base-300 box rounded-lg shadow flex flex-col items-center p-1 space-y-2">
          {renderPieChart(
            data.minorsCount,
            data.totalPatients,
            COLORS[2],
            'Children'
          )}
          <span>Nombre d'enfants: {data.minorsCount}</span>
        </div>
      </div>

      {/* Section divisée en deux parties */}
      <div className="flex flex-wrap -mx-4 mb-8">
        <div className="w-full md:w-1/2 px-4">
          {/* Contenu de la partie gauche */}
          <StatsPartenaire />
          <TestUsageByMonthChart />
        </div>
        <div className="w-full md:w-1/2 px-4">
          {/* Contenu de la partie droite, divisé verticalement */}
          <TopTestsChart />
          <div className="flex flex-col space-y-4">
            <AnalysesPerMonthChart />
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
