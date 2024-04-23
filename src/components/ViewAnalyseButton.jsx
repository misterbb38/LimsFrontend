import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import EditHistoriqueButton from './EditHistoriqueButton'
import EditResultatButton from './EditResultatButton'
import AddHistoriqueForm from './AddHistoriqueForm'
import AddResultatForm from './AddResultatForm'

function ViewAnalyseButton({ analyseId, onAnalyseRefresh }) {
  const [analyseData, setAnalyseData] = useState(null)

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    fetchAnalyseData(analyseId)
  }, [analyseId, apiUrl])

  const fetchAnalyseData = async (id) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/analyse/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        setAnalyseData(data.data)
        console.log(analyseData)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'analyse:", error)
    }
  }

  function formatDate(date) {
    const d = new Date(date)
    const pad = (num) => (num < 10 ? '0' + num : num)

    const day = pad(d.getDate())
    const month = pad(d.getMonth() + 1) // Les mois sont basés sur 0
    const year = d.getFullYear()
    const hours = pad(d.getHours())
    const minutes = pad(d.getMinutes())
    const seconds = pad(d.getSeconds())

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
  }

  const deleteHistorique = async (historiqueId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/hist/${historiqueId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (data.success) {
        // Rafraîchir la liste des tests après la suppression
        fetchAnalyseData(analyseId)
      } else {
        console.error('Failed to delete historique')
      }
    } catch (error) {
      console.error('Error deleting historique:', error)
    }
  }

  const deleteResultat = async (resultatId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const apiUrl = import.meta.env.VITE_APP_API_BASE_URL // Ensure this is set in your environment variables

      // Call to delete resultat
      const response = await fetch(`${apiUrl}/api/resultats/${resultatId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success) {
        // Optionally refresh data if needed, adjust based on your application structure
        fetchAnalyseData(analyseId)
        // You might want to trigger a refresh of the resultats displayed, e.g., by calling a fetch function or updating state
      } else {
        console.error('Failed to delete resultat:', data.message)
      }
    } catch (error) {
      console.error('Error deleting resultat:', error)
    }
  }

  // Ajoutez une nouvelle fonction pour gérer la fermeture
  const handleClose = () => {
    document.getElementById(`my_modal_4_${analyseId}`).close()
    if (onAnalyseRefresh) {
      onAnalyseRefresh() // Appel la fonction de rappel passée en prop
    }
  }

  if (!analyseData) {
    return <div>Chargement...</div>
  }

  return (
    <>
      {/* You can open the modal using document.getElementById('ID').showModal() method */}
      <button
        className="btn"
        onClick={() =>
          document.getElementById(`my_modal_4_${analyseId}`).showModal()
        }
      >
        <FontAwesomeIcon icon={faEye} />
      </button>
      <dialog id={`my_modal_4_${analyseId}`} className="modal">
        <div className="modal-box w-11/12 max-w-7xl">
          <div className="divider"></div>
          {/* Open the modal using document.getElementById('ID').showModal() method */}
          <button
            className="btn mr-2"
            onClick={() =>
              document.getElementById(`my_modal_5_${analyseId}`).showModal()
            }
          >
            Ajouter une mise à jour
          </button>
          <button
            className="btn"
            onClick={() =>
              document.getElementById(`my_modal_6_${analyseId}`).showModal()
            }
          >
            Ajouter un résultat
          </button>
          <dialog
            id={`my_modal_5_${analyseId}`}
            className="modal modal-bottom sm:modal-middle"
          >
            <div className="modal-box">
              <AddHistoriqueForm
                analyseId={analyseId}
                onHistoriqueChange={() => fetchAnalyseData(analyseId)}
              />
              <div className="modal-action">
                <form method="dialog">
                  <button className="btn">Fermer</button>
                </form>
              </div>
            </div>
          </dialog>
          <dialog
            id={`my_modal_6_${analyseId}`}
            className="modal modal-bottom sm:modal-middle"
          >
            <div className="modal-box">
              <AddResultatForm
                analyseId={analyseId}
                patientId={analyseData.userId?._id}
                onResultatChange={() => fetchAnalyseData(analyseId)}
              />
              <div className="modal-action">
                <form method="dialog">
                  <button
                    className="btn"
                    // onClick={() => handleClose(`my_modal_6_${analyseId}`)}
                  >
                    Fermer
                  </button>
                </form>
              </div>
            </div>
          </dialog>
          <div className="divider"></div>

          <h1 className="font-bold">Détails</h1>
          <div className="divider"></div>
          <div>
            {/* Informations du analyse et patient */}
            <div className="overflow-x-auto">
              <table className="table w-full ">
                {/* En-tête du tableau */}

                <tbody>
                  {/* Première ligne */}
                  <tr>
                    <td className="font-bold bg-primary  text-white">
                      Code d'Analyse
                    </td>
                    <td>{analyseData.identifiant || 'N/A'}</td>
                    <td className="font-bold bg-primary  text-white">
                      Nom & Prénom
                    </td>
                    <td>{`${analyseData.userId?.prenom || 'N/A'} ${analyseData.userId?.nom || 'N/A'}`}</td>

                    <td className="font-bold bg-primary  text-white">Status</td>
                    <td>
                      {analyseData.historiques[
                        analyseData.historiques.length - 1
                      ]?.status || 'N/A'}
                    </td>
                  </tr>
                  {/* Deuxième ligne */}
                  <tr>
                    <td className="font-bold bg-primary  text-white">Date</td>
                    <td>{formatDate(analyseData.createdAt)}</td>

                    <td className="font-bold bg-primary  text-white">
                      Ordonnance
                    </td>
                    <td>
                      {analyseData.ordonnancePdf ? (
                        <a
                          href={`${apiUrl}/ordonnances/${analyseData.ordonnancePdf.split('\\').pop()}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary"
                        >
                          Ouvrir Ordonnance
                        </a>
                      ) : (
                        'Non disponible'
                      )}
                    </td>
                  </tr>
                  {/* Troisième ligne */}
                  <tr>
                    <td className="font-bold bg-primary  text-white">
                      Age/ Date de naissance
                    </td>
                    <td>
                      {analyseData.userId?.age ||
                        (analyseData.userId?.dateNaissance
                          ? new Date(
                              analyseData.userId.dateNaissance
                            ).toLocaleDateString()
                          : 'N/A')}
                    </td>

                    <td className="font-bold bg-primary  text-white">Email</td>
                    <td>{analyseData.userId?.email || 'N/A'}</td>
                    <td className="font-bold bg-primary  text-white">
                      Téléphone
                    </td>
                    <td>{analyseData.userId?.telephone || 'N/A'}</td>
                  </tr>
                  {/* Quatrième ligne */}
                  <tr>
                    <td className="font-bold bg-primary  text-white">Sexe</td>
                    <td>{analyseData.userId?.sexe || 'N/A'}</td>
                    <td className="font-bold bg-primary  text-white">
                      Adresse
                    </td>
                    <td>{analyseData.userId?.adresse || 'N/A'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="divider"></div>

            <div className="divider"></div>

            <div className="mb-4 overflow-x-auto">
              <h3 className="font-bold text-lg mb-2">Liste des Analyses</h3>
              <table className="table w-full">
                {/* Entête du tableau */}
                <thead className="bg-primary font-bold text-primary-content">
                  <tr>
                    <th className="font-bold">Nom</th>

                    <th className="font-bold">interpretation</th>
                  </tr>
                </thead>
                {/* Corps du tableau */}
                <tbody>
                  {analyseData.tests.map((test) => {
                    let prix
                    if (
                      analyseData.partenaireId &&
                      analyseData.partenaireId?.typePartenaire === 'assurance'
                    ) {
                      prix = test.prixAssurance
                        ? `${test.prixAssurance} FCFA`
                        : 'N/A'
                    } else if (
                      analyseData.partenaireId &&
                      analyseData.partenaireId?.typePartenaire === 'ipm'
                    ) {
                      prix = test.prixIpm ? `${test.prixIpm} FCFA` : 'N/A'
                    } else {
                      // Cela inclut le cas où typePartenaire est 'paf' ou tout autre cas
                      prix = test.prixPaf ? `${test.prixPaf} FCFA` : 'N/A'
                    }

                    return (
                      <tr key={test._id}>
                        <td>{test.nom}</td>

                        <td>{test.interpretation}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="divider"></div>

            <div className="divider"></div>

            <div className="mb-4 overflow-x-auto">
              <h3 className="font-bold text-lg mb-2">
                Historique des Événements
              </h3>
              <table className="table w-full">
                {/* Entête du tableau */}
                <thead className="bg-primary text-primary-content">
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Auteur</th>
                    <th className="font-bold">Actions</th>
                  </tr>
                </thead>
                {/* Corps du tableau */}
                <tbody>
                  {analyseData.historiques.map((historique) => (
                    <tr key={historique._id}>
                      <td>
                        {historique.createdAt
                          ? formatDate(historique.createdAt)
                          : 'N/A'}
                      </td>
                      <td>{historique?.description}</td>
                      <td>{historique?.status}</td>
                      <td>{historique?.updatedBy?.nom}</td>
                      <td>
                        <div className="flex justify-around space-x-1">
                          <EditHistoriqueButton
                            historiqueId={historique._id}
                            onHistoriqueUpdated={() =>
                              fetchAnalyseData(analyseId)
                            }
                          />
                          <button
                            className="btn btn-error"
                            onClick={() => deleteHistorique(historique._id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {}
                </tbody>
              </table>
            </div>

            <div className="divider"></div>

            <div className="mb-4 overflow-x-auto">
              <h3 className="font-bold text-lg mb-2">Resultats</h3>
              <table className="table w-full">
                {/* Entête du tableau */}
                <thead className="bg-primary text-primary-content">
                  <tr>
                    <th>Date</th>
                    <th>Paramettre</th>
                    <th>Valeur</th>
                    <th>Type de prelevement </th>
                    <th>Valeur d'interpreation </th>
                    <th>Commentaire</th>
                    <th>Auteur</th>
                    <th className="font-bold">Actions</th>
                  </tr>
                </thead>
                {/* Corps du tableau */}
                <tbody>
                  {analyseData.resultat.map((resul) => (
                    <tr key={resul._id}>
                      <td>
                        {resul.createdAt ? formatDate(resul.createdAt) : 'N/A'}
                      </td>
                      <td>{resul?.testId?.nom}</td>
                      <td>{resul?.valeur}</td>
                      <td>{resul?.typePrelevement}</td>
                      <td>
                        {resul?.statutMachine
                          ? resul?.testId?.valeurMachineA
                          : resul?.testId?.valeurMachineB}
                      </td>

                      <td>{resul.statutInterpretation ? 'Oui' : 'Non'}</td>

                      <td>{resul?.updatedBy?.nom}</td>
                      <td>
                        <div className="flex justify-around space-x-1">
                          <EditResultatButton
                            resultatId={resul._id}
                            onResultatUpdated={() =>
                              fetchAnalyseData(analyseId)
                            }
                          />
                          <button
                            className="btn btn-error"
                            onClick={() => deleteResultat(resul._id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {}
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button, it will close the modal */}
              <button onClick={handleClose} className="btn">
                Fermer
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  )
}

ViewAnalyseButton.propTypes = {
  analyseId: PropTypes.string.isRequired,
  onAnalyseRefresh: PropTypes.func.isRequired,
}

export default ViewAnalyseButton
