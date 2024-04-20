import { useState, useEffect } from 'react'

const UseInvoiceStats = (year) => {
  const [stats, setStats] = useState(null)
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Récupérer le token de l'utilisateur depuis localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const token = userInfo?.token

        // Construire l'URL avec le paramètre de l'année si spécifié
        const url = year
          ? `${apiUrl}/api/invoice/stats?year=${year}`
          : `${apiUrl}/api/invoice/stats`

        const response = await fetch(url, {
          method: 'GET', // Méthode HTTP
          headers: {
            Authorization: `Bearer ${token}`, // Inclure le token JWT dans l'en-tête d'autorisation
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          console.error(
            'Erreur lors de la récupération des statistiques:',
            response.statusText
          )
          return
        }
        const data = await response.json()
        if (data.success) {
          setStats(data.data)
        } else {
          console.error('Erreur dans les données reçues:', data.message)
        }
      } catch (error) {
        console.error('Erreur lors du fetch des statistiques:', error)
      }
    }

    fetchStats()
  }, [apiUrl, year]) // Ajouter 'year' aux dépendances pour re-fetch lorsque 'year' change

  return stats
}

export default UseInvoiceStats
