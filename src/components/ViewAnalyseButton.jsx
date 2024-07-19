import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import EditHistoriqueButton from './EditHistoriqueButton'
import EditResultatButton from './EditResultatButton'
import EditFileResultatButton from './EditFileResultatButton'
import AddHistoriqueForm from './AddHistoriqueForm'
import AddResultatForm from './AddResultatForm'
import EditPatientButton from './EditPatientButton'
import AddExterneResultat from './AddExterneResultat'
// import GenerateBarcodeButton from './GenerateBarcodeButton'

function ViewAnalyseButton({ analyseId, onAnalyseRefresh }) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSMS, setIsLoadingSMS] = useState(false);

  const [analyseData, setAnalyseData] = useState(null)

  const [showToast, setShowToast] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

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

  const sendSMS = async () => {
    setIsLoadingSMS(true); // Commencer le chargement
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token

      const response = await fetch(`${apiUrl}/api/sms/send`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: analyseData.userId?.telephone,
          analyseId: analyseData._id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setToastMessage('SMS envoyé avec succès')
      } else {
        setIsSuccess(false)
        setToastMessage("Échec de l'envoi du SMS")
      }
    } catch (error) {
      setIsSuccess(false)
      setToastMessage("Erreur lors de l'envoi du SMS")
    } finally {
      setIsLoadingSMS(false); // Arrêter le chargement
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
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
    const userConfirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer cet historique ?'
    )

    if (!userConfirmed) {
      return
    }
    setIsLoading(true) // Commencer le chargement

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const apiUrl = import.meta.env.VITE_APP_API_BASE_URL // Ensure this is set in your environment variables

      const response = await fetch(`${apiUrl}/api/hist/${historiqueId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (data.success) {
        alert('Historique supprimé avec succès.')
        // Rafraîchir la liste des tests après la suppression
        fetchAnalyseData(analyseId)
      } else {
        console.error('Failed to delete historique')
      }
    } catch (error) {
      console.error('Error deleting historique:', error)
    } finally {
      setIsLoading(false) // Arrêter le chargement
    }
  }

  const deleteFileResultat = async (fileResultatId) => {
    const userConfirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer ce fichier résultat ?'
    )

    if (!userConfirmed) {
      return
    }
    setIsLoading(true) // Commencer le chargement

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const apiUrl = import.meta.env.VITE_APP_API_BASE_URL // Ensure this is set in your environment variables

      const response = await fetch(
        `${apiUrl}/api/fileresultats/${fileResultatId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()
      if (data.success) {
        alert('Fichier résultat supprimé avec succès.')
        // Rafraîchir la liste des fichiers résultats après la suppression
        fetchAnalyseData(analyseId)
      } else {
        console.error('Failed to delete file resultat')
      }
    } catch (error) {
      console.error('Error deleting file resultat:', error)
    } finally {
      setIsLoading(false) // Arrêter le chargement
    }
  }

  const deleteResultat = async (resultatId) => {
    const userConfirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer ce résultat ?'
    )

    if (!userConfirmed) {
      return
    }
    setIsLoading(true) // Commencer le chargement

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

        alert('Resultat supprimé avec succès.') // Afficher une alerte de succès
        fetchAnalyseData(analyseId)
        // You might want to trigger a refresh of the resultats displayed, e.g., by calling a fetch function or updating state
      } else {
        console.error('Failed to delete resultat:', data.message)
      }
    } catch (error) {
      console.error('Error deleting resultat:', error)
    } finally {
      setIsLoading(false) // Arrêter le chargement
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
          

        <div className="">
    <button className="btn btn-primary" onClick={sendSMS} disabled={isLoadingSMS}>
      {isLoadingSMS ? (
        <span className="loading loading-spinner"></span>
      ) : (
        'Envoyer SMS'
      )}
    </button>
    <span className="ml-1">
      {analyseData?.smsCount === 0
        ? 'Aucun SMS n\'a encore été envoyé'
        : `${analyseData?.smsCount} SMS ${analyseData?.smsCount === 1 ? 'a déjà été envoyé' : 'ont déjà été envoyés'}, renvoyez si nécessaire`}
    </span>
  </div>

  {showToast && (
    <div className="toast toast-center toast-middle">
      <div
        className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}
      >
        <span className="text-white">{toastMessage}</span>
      </div>
    </div>
  )}

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
                existingHistoriques={analyseData.historiques} // Passer les historiques existants
              />
              <div className="modal-action">
                <form method="dialog">
                  <button className="btn">Fermer</button>
                </form>
              </div>
            </div>
          </dialog>

          <dialog id={`my_modal_6_${analyseId}`} className="modal modal-middle">
            <div className="modal-box  w-11/12 max-w-5xl">
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

          <button
            className="btn ml-2"
            onClick={() =>
              document.getElementById(`my_modal_7_${analyseId}`).showModal()
            }
          >
            Ajouter un résultat externe
          </button>

          <dialog id={`my_modal_7_${analyseId}`} className="modal modal-middle">
            <div className="modal-box w-11/12 max-w-5xl">
              <AddExterneResultat
                analyseId={analyseId}
                patientId={analyseData.userId?._id}
                onResultatChange={() => fetchAnalyseData(analyseId)}
              />
              <div className="modal-action">
                <form method="dialog">
                  <button className="btn">Fermer</button>
                </form>
              </div>
            </div>
          </dialog>

          <div className="divider"></div>

          <h1 className="font-bold">Détails</h1>
          <EditPatientButton
            userId={analyseData.userId?._id}
            onuserUpdated={() => fetchAnalyseData(analyseId)}
          />
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
                          href={analyseData.ordonnancePdf}
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
              <h3 className="font-bold text-lg mb-2">Liste des paramettres</h3>
              <table className="table w-full">
                {/* Entête du tableau */}
                <thead className="bg-primary font-bold text-primary-content">
                  <tr>
                    <th className="font-bold">Nom</th>

                    <th className="font-bold">code barre</th>
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

                        <td>
                          {/* a refaire <GenerateBarcodeButton
                            nip={analyseData?.userId?.nip}
                            nom={analyseData?.userId?.nom}
                            prenom={analyseData?.userId?.prenom}
                            identifiant={analyseData?.identifiant}
                            test={test.nom}
                          /> */}
                        </td>
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
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <span className="loading loading-spinner text-error"></span>
                            ) : (
                              <FontAwesomeIcon icon={faTrash} />
                            )}
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
            {/* resultat interne */}

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
                            analyseId={analyseId}
                            onResultatUpdated={() =>
                              fetchAnalyseData(analyseId)
                            }
                          />
                          <button
                            className="btn btn-error"
                            onClick={() => deleteResultat(resul._id)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <span className="loading loading-spinner text-error"></span>
                            ) : (
                              <FontAwesomeIcon icon={faTrash} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {}
                </tbody>
              </table>
            </div>

            {/* Tableau pour fileResultat */}

            <div className="mb-4 overflow-x-auto">
              <h3 className="font-bold text-lg mb-2">Fichiers de Résultats</h3>
              <table className="table w-full">
                {/* Entête du tableau */}
                <thead className="bg-primary text-primary-content">
                  <tr>
                    <th>Date</th>
                    <th>Fichier</th>
                    <th>Auteur</th>
                    <th>Action</th>
                  </tr>
                </thead>
                {/* Corps du tableau */}
                <tbody>
                  {analyseData.fileResultat.map((file) => (
                    <tr key={file._id}>
                      <td>
                        {file.createdAt ? formatDate(file.createdAt) : 'N/A'}
                      </td>
                      <td>
                        <a
                          href={file.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary"
                        >
                          <button>Ouvrir</button>
                        </a>
                      </td>
                      <td>
                        {file?.updatedBy?.nom} {file?.updatedBy?.prenom}
                      </td>
                      <td>
                        <div className="flex justify-around space-x-1">
                          <EditFileResultatButton
                            fileResultatId={file._id}
                            analyseId={analyseId}
                            onFileResultatUpdated={() =>
                              fetchAnalyseData(analyseId)
                            }
                          />
                          <button
                            className="btn btn-error"
                            onClick={() => deleteFileResultat(file._id)}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <span className="loading loading-spinner text-error"></span>
                            ) : (
                              <FontAwesomeIcon icon={faTrash} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
