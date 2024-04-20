import { useState, useEffect } from 'react'
import UseSummaryClient from './dataInvoice/UseSummaryClient' // Assurez-vous que le chemin d'importation est correct
import PropTypes from 'prop-types'

const ClientInvoiceSummary = ({ selectedYear }) => {
  const summaryClient = UseSummaryClient(selectedYear)
  const [selectedClient, setSelectedClient] = useState('')

  useEffect(() => {
    if (summaryClient && summaryClient.length > 0) {
      // Utilisez une propriété unique du client pour la sélection, par ex. email
      setSelectedClient(summaryClient[0].client.email) // Pré-sélection du premier client
    }
  }, [summaryClient])

  const handleClientChange = (e) => {
    setSelectedClient(e.target.value)
  }

  const selectedClientData = summaryClient?.find(
    (client) => client.client.email === selectedClient
  )

  return (
    <div className="container mx-auto px-4">
      <select
        className="block w-full p-2 border border-gray-200 rounded"
        value={selectedClient}
        onChange={handleClientChange}
      >
        {summaryClient?.map((client, index) => (
          <option key={index} value={client.client.email}>
            {client.client.name}
          </option>
        ))}
      </select>

      {selectedClientData && (
        <div className="mt-4 flex-wrap grid grid-cols-2 gap-4">
          <div className="w-full">
            <h5 className="text-lg font-semibold">Statistiques</h5>
            <div className="mt-1">
              <p
                className={`text-xs font-bold ${selectedClientData.totalAmountPayée > 0 ? 'text-green-500' : ''}`}
              >
                Factures payées: {selectedClientData.countPayée}
              </p>
              <p
                className={`text-xs font-bold ${selectedClientData.totalAmountAttente > 0 ? 'text-yellow-500' : ''}`}
              >
                Factures en attente: {selectedClientData.countAttente}
              </p>
              <p className="text-xs font-bold">
                Factures Annulées: {selectedClientData.countAnnullée}
              </p>
            </div>
          </div>
          <div className="w-full">
            <p className="text-lg font-semibold">Sommes</p>
            <div className="mt-1">
              <p
                className={`text-xs font-bold ${selectedClientData.totalAmountPayée > 0 ? 'text-green-500' : ''}`}
              >
                Factures payées: {selectedClientData.totalAmountPayée} cfa
              </p>
              <p
                className={`text-xs font-bold ${selectedClientData.totalAmountAttente > 0 ? 'text-yellow-500' : ''}`}
              >
                Factures en attente: {selectedClientData.totalAmountAttente} cfa
              </p>
              <p className="text-xs font-bold">
                Factures Annulées: {selectedClientData.totalAmountAnnullée} cfa
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

ClientInvoiceSummary.propTypes = {
  selectedYear: PropTypes.string.isRequired,
}

export default ClientInvoiceSummary
