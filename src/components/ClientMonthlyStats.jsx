import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

const ClientMonthlyStats = ({ selectedYear }) => {
  const [data, setData] = useState({})
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(1)

  useEffect(() => {
    const fetchClientData = async () => {
      // Récupérer le token de l'utilisateur depuis localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token

      const response = await fetch(
        `${apiUrl}/api/invoice/clientMonthlyInvoiceStats?year=${selectedYear}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Inclure l'en-tête d'autorisation avec le token
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          `Erreur lors de la récupération des données: ${response.statusText}`
        )
      }

      const data = await response.json()
      return data.data
    }

    const fetchData = async () => {
      try {
        const fetchedData = await fetchClientData()
        setData(fetchedData)
        setSelectedClient(Object.keys(fetchedData)[0] || '')
      } catch (error) {
        console.error(error.message)
        // Gestion d'erreur, par exemple, en définissant un état d'erreur ou en affichant un message
      }
    }

    fetchData()
  }, [selectedYear])

  const handleClientChange = (e) => setSelectedClient(e.target.value)
  const handleMonthChange = (e) =>
    setSelectedMonth(parseInt(e.target.value, 10))

  const clientOptions = Object.keys(data).map((client) => (
    <option key={client} value={client}>
      {client}
    </option>
  ))

  const months = [
    'Jan',
    'Fev',
    'Mar',
    'Avr',
    'Mai',
    'Juin',
    'Juil',
    'Aout',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  const monthOptions = months.map((month, i) => (
    <option key={i + 1} value={i + 1}>
      {month}
    </option>
  ))

  const selectedData = data[selectedClient]
    ? data[selectedClient][selectedMonth - 1]
    : null

  return (
    <div>
      <div className="flex justify-between items-center ">
        <div>
          <label className="mr-1">Choisissez un client</label>
          <select
            className="block w-full p-2 border border-gray-200 rounded"
            value={selectedClient}
            onChange={handleClientChange}
          >
            {clientOptions}
          </select>
        </div>

        <div>
          <label className="mr-1">Choisissez un mois</label>
          <select
            className="block w-full p-2 border border-gray-200 rounded"
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            {monthOptions}
          </select>
        </div>
      </div>

      {selectedData && (
        <div className=" grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold">
              Statistiques pour {selectedClient} - {months[selectedMonth - 1]}
            </p>
            <p
              className={`text-xs font-bold ${selectedData.Payée.totalAmount > 0 ? 'text-green-500' : ''}`}
            >
              Payées: {selectedData.Payée.count}
            </p>
            <p
              className={`text-xs font-bold ${selectedData.Attente.totalAmount > 0 ? 'text-red-500' : ''}`}
            >
              En attente: {selectedData.Attente.count}
            </p>
            <p className="text-xs font-bold">
              Annulées: {selectedData.Annullée.count}
            </p>
          </div>
          <div>
            <h5 className="text-xs font-bold">Sommes</h5>
            <p
              className={`text-xs font-bold ${selectedData.Payée.totalAmount > 0 ? 'text-green-500' : ''}`}
            >
              Payées: {selectedData.Payée.totalAmount}
            </p>
            <p
              className={`text-xs font-bold ${selectedData.Attente.totalAmount > 0 ? 'text-red-500' : ''}`}
            >
              En attente: {selectedData.Attente.totalAmount}
            </p>
            <p className="text-xs font-bold">
              Total Annulé: {selectedData.Annullée.totalAmount}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

ClientMonthlyStats.propTypes = {
  selectedYear: PropTypes.string.isRequired,
}

export default ClientMonthlyStats
