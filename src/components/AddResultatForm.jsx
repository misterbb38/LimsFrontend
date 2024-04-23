import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

function AddResultatForm({ analyseId, patientId, onResultatChange }) {
  const [testId, setTestId] = useState('')
  const [valeur, setValeur] = useState('')
  const [methode, setMethode] = useState('')
  const [machineA, setMachineA] = useState('')
  const [machineB, setMachineB] = useState('')

  const [statutInterpretation, setStatutInterpretation] = useState(false)
  const [statutMachine, setStatutMachine] = useState(false)
  const [typePrelevement, setTypePrelevement] = useState('')
  const [datePrelevement, setDatePrelevement] = useState('')
  const [tests, setTests] = useState([]) // Stocker les tests de l'ana
  const [remarque, setRemarque] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(true)

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
  const token = userInfo?.token
  const updatedBy = userInfo?._id // Assuming the user's ID is stored in the userInfo

  useEffect(() => {
    if (analyseId) {
      fetchTests(analyseId)
    }
  }, [analyseId])

  useEffect(() => {
    const selectedTest = tests.find((test) => test._id === testId)
    if (selectedTest) {
      console.log('Selected test:', selectedTest)
      setMachineA(selectedTest.machineA || 'pas de machine A ') // Utilisez une valeur par défaut pour voir si le problème vient des données
      setMachineB(selectedTest.machineB || 'Pas de machine B ')
    }
  }, [testId, tests])

  const fetchTests = async (analyseId) => {
    try {
      const response = await fetch(`${apiUrl}/api/analyse/${analyseId}/tests`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      console.log('Tests data:', data.data)
      if (data.success) {
        setTests(data.data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des tests:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${apiUrl}/api/resultats/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          analyseId,
          testId,
          patientId,
          valeur,
          methode,
          statutMachine,
          statutInterpretation,
          typePrelevement,
          datePrelevement: datePrelevement || null,
          remarque,
          updatedBy,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setToastMessage('Résultat ajouté avec succès')
        setIsSuccess(true)
        onResultatChange()
        setTestId('')
        setMachineA('')
        setMachineB('')
        setValeur('')
        setMethode('')
        setStatutMachine('')
        setStatutInterpretation(false)
        setTypePrelevement('')
        setDatePrelevement('')
        setRemarque('')
      } else {
        const errorData = await response.json()
        setToastMessage(errorData.message || "Échec de l'ajout du résultat")
        setIsSuccess(false)
      }
    } catch (error) {
      setToastMessage("Erreur lors de l'envoi du formulaire : " + error.message)
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  return (
    <>
      {showToast && (
        <div className="toast toast-center toast-middle">
          <div
            className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}
          >
            <span className="text-white">{toastMessage}</span>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label className="label">TestId</label>
          <select
            className="select select-bordered w-full max-w-xs"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            required
          >
            <option value="">Sélectionner un test</option>
            {tests.map((test) => (
              <option key={test._id} value={test._id}>
                {test.nom}
              </option>
            ))}
          </select>
          <p>La machine A est : {machineA}</p>
          <p>La machine B est : {machineB}</p>
        </div>
        <div>
          <label className="label">Valeur</label>
          <input
            type="text"
            value={valeur}
            onChange={(e) => setValeur(e.target.value)}
            required
            className="input input-bordered"
          />
        </div>

        <div>
          <label className="label">Statut de l'Interprétation</label>
          <select
            className="select select-bordered"
            value={statutInterpretation}
            onChange={(e) => setStatutInterpretation(e.target.value === 'true')}
          >
            <option value="false">Non</option>
            <option value="true">Oui</option>
          </select>
        </div>

        <div>
          <label className="label">Machine utiliser</label>
          <select
            className="select select-bordered"
            value={statutMachine}
            onChange={(e) => setStatutMachine(e.target.value === 'true')}
          >
            <option value="true">A</option>
            <option value="false">B</option>
          </select>
        </div>

        <div>
          <label className="label">Methode</label>
          <input
            type="text"
            value={methode}
            onChange={(e) => setMethode(e.target.value)}
            className="input input-bordered"
          />
        </div>
        <div>
          <label className="label">Type de Prélèvement</label>
          <input
            type="text"
            value={typePrelevement}
            onChange={(e) => setTypePrelevement(e.target.value)}
            className="input input-bordered"
          />
        </div>

        <div>
          <label className="label">Date de Prélèvement</label>
          <input
            type="datetime-local"
            value={datePrelevement}
            onChange={(e) => setDatePrelevement(e.target.value)}
            className="input input-bordered"
          />
        </div>
        <div>
          <label className="label">Remarque</label>
          <textarea
            value={remarque}
            onChange={(e) => setRemarque(e.target.value)}
            className="textarea textarea-bordered"
          ></textarea>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center">
            <span className="loading loading-spinner text-primary"></span>
          </div>
        ) : (
          <button type="submit" className="btn btn-primary mt-4">
            Ajouter le résultat
          </button>
        )}
      </form>
    </>
  )
}

AddResultatForm.propTypes = {
  analyseId: PropTypes.string.isRequired,
  patientId: PropTypes.string.isRequired,
  onResultatChange: PropTypes.func.isRequired,
}

export default AddResultatForm
