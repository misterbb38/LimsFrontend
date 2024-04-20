// import { useState, useEffect } from 'react';

// const UseSummaryClient = (year) => {
//   const [summaryClient, setSummaryClient] = useState(null);
//   const apiUrl = import.meta.env.VITE_APP_API_BASE_URL;

//   useEffect(() => {
//     const fetchSummaryClient = async () => {
//       const queryParams = year ? `?year=${year}` : '';
//       try {
//         const response = await fetch(`${apiUrl}/api/invoice/summaryclient${queryParams}`);
//         if (!response.ok) {
//           console.error('Erreur lors de la récupération des statistiques filtrées:', response.statusText);
//           return;
//         }
//         const data = await response.json();
//         if (data.success) {
//           setSummaryClient(data.data);
//         } else {
//           console.error('Erreur dans les données reçues:', data);
//         }
//       } catch (error) {
//         console.error('Erreur lors du fetch des statistiques filtrées:', error);
//       }
//     };

//     fetchSummaryClient();
//   }, [year, apiUrl]);

//   return summaryClient;
// };

// export default UseSummaryClient;

import { useState, useEffect } from 'react'

const UseSummaryClient = (year) => {
  const [summaryClient, setSummaryClient] = useState(null)
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    const fetchSummaryClient = async () => {
      const queryParams = year ? `?year=${year}` : ''

      // Récupérer le token de l'utilisateur depuis localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token

      try {
        const response = await fetch(
          `${apiUrl}/api/invoice/summaryclient${queryParams}`,
          {
            // Inclure l'en-tête d'autorisation avec le token
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
          setSummaryClient(data.data)
        } else {
          console.error('Erreur dans les données reçues:', data)
        }
      } catch (error) {
        console.error('Erreur lors du fetch des statistiques filtrées:', error)
      }
    }

    fetchSummaryClient()
  }, [year, apiUrl])

  return summaryClient
}

export default UseSummaryClient
