import { useState } from 'react'
import PropTypes from 'prop-types'

function AddTestForm({ onTestChange }) {
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [prixAssurance, setPrixAssurance] = useState('')
  const [prixIpm, setPrixIpm] = useState('')
  const [prixPaf, setPrixPaf] = useState('')
  const [coeficiantB, setCoeficiantB] = useState('')
  const [categories, setCategories] = useState('')
  const [valeur, setValeur] = useState('')
  const [prixSococim, setPrixSococim] = useState('')
  const [interpretationA, setInterpretationA] = useState('')
  const [interpretationB, setInterpretationB] = useState('')

  // Ajout : gestion des nouveaux champs
  const [valeurMachineA, setValeurMachineA] = useState('')
  const [valeurMachineB, setValeurMachineB] = useState('')
  const [machineA, setMachineA] = useState('')
  const [machineB, setMachineB] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(true)

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
    const token = userInfo?.token

    try {
      const response = await fetch(`${apiUrl}/api/test/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom,
          description,
          prixAssurance,
          prixIpm,
          prixPaf,
          coeficiantB,
          categories,
          valeur,
          prixSococim, // Nouveau champ pour le prix Sococim
          interpretationA, // Nouveau champ pour l'interprétation de la machine A
          interpretationB, // Nouveau champ pour l'interprétation de la machine B
          // Ajout : envoi des nouvelles valeurs
          valeurMachineA,
          valeurMachineB,
          machineA,
          machineB,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setToastMessage(data.message || 'Test ajouté avec succès')
        setIsSuccess(true)
        onTestChange()
        resetForm()
      } else {
        const errorData = await response.json()
        setToastMessage(errorData.message || "Échec de l'ajout du test")
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

  const resetForm = () => {
    setNom('')
    setDescription('')
    setPrixAssurance('')
    setPrixIpm('')
    setPrixPaf('')
    setCoeficiantB('')
    setCategories('')
    setValeur('')
    setPrixSococim('')
    setInterpretationA('')
    setInterpretationB('')

    // Réinitialisation des nouveaux champs
    setValeurMachineA('')
    setValeurMachineB('')
    setMachineA('')
    setMachineB('')
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
          <label className="text-sm font-medium base-content">Nom</label>
          <br></br>
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">
            Description
          </label>
          <br></br>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">
            Coeficiant B
          </label>
          <br></br>
          <input
            type="number"
            value={coeficiantB}
            onChange={(e) => setCoeficiantB(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">
            Prix Assurance
          </label>
          <br></br>
          <input
            type="number"
            value={prixAssurance}
            onChange={(e) => setPrixAssurance(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">Prix IPM</label>
          <br></br>
          <input
            type="number"
            value={prixIpm}
            onChange={(e) => setPrixIpm(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">
            Prix Sococim
          </label>
          <br></br>
          <input
            type="number"
            value={prixSococim}
            onChange={(e) => setPrixSococim(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">Prix PAF</label>
          <br></br>
          <input
            type="number"
            value={prixPaf}
            onChange={(e) => setPrixPaf(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">Catégories</label>
          <br></br>
          <input
            type="text"
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">
            Interprétation A
          </label>
          <br></br>
          <textarea
            value={interpretationA}
            onChange={(e) => setInterpretationA(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">
            Interprétation B
          </label>
          <br></br>
          <textarea
            value={interpretationB}
            onChange={(e) => setInterpretationB(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        {/* Ajout de champs pour les machines */}
        <div>
          <label className="text-sm font-medium base-content">
            Valeur d'interpretation Machine A
          </label>
          <br></br>
          <textarea
            type="text"
            value={valeurMachineA}
            onChange={(e) => setValeurMachineA(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">
            Valeur d'interpretation Machine B
          </label>
          <br></br>
          <textarea
            type="text"
            value={valeurMachineB}
            onChange={(e) => setValeurMachineB(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">Machine A</label>
          <br></br>
          <input
            type="text"
            value={machineA}
            onChange={(e) => setMachineA(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">Machine B</label>
          <br></br>
          <input
            type="text"
            value={machineB}
            onChange={(e) => setMachineB(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        {isLoading && (
          <div className="flex justify-center items-center">
            <div className="loading"></div>
          </div>
        )}
        <button type="submit" className="btn btn-primary mt-4">
          Ajouter un test
        </button>
      </form>
    </>
  )
}

AddTestForm.propTypes = {
  onTestChange: PropTypes.func.isRequired,
}

export default AddTestForm
