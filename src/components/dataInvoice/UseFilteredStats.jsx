import { useState, useEffect } from 'react'

const UseFilteredStats = (filters) => {
  const [filteredStats, setFilteredStats] = useState(null)
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    const fetchFilteredStats = async () => {
      try {
        // Récupérer le token de l'utilisateur depuis localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const token = userInfo?.token

        // Construire l'URL avec des paramètres de requête pour le filtrage
        const queryParams = new URLSearchParams(filters).toString()

        const response = await fetch(
          `${apiUrl}/api/invoice/FilteredStats?${queryParams}`,
          {
            // Ajouter le token JWT dans les en-têtes de la requête
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        )

        if (!response.ok) {
          console.error(
            'Erreur lors de la récupération des statistiques filtrées:',
            response.statusText
          )
          return
        }

        const data = await response.json()
        if (data.success) {
          setFilteredStats(data.data)
        } else {
          console.error('Erreur dans les données reçues:', data.message)
        }
      } catch (error) {
        console.error('Erreur lors du fetch des statistiques filtrées:', error)
      }
    }

    fetchFilteredStats()
  }, [filters, apiUrl]) // Réagir aux changements des filtres

  return filteredStats
}

export default UseFilteredStats
