import { useState, useRef } from 'react' // Ajouter useRef

function UploadExcelButton() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(true)
  const fileInputRef = useRef(null) // Ajouter une référence au champ input

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    const fileType = file.type
    // Vérifier si le fichier est un fichier Excel
    if (
      fileType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType === 'application/vnd.ms-excel'
    ) {
      setSelectedFile(file)
    } else {
      setToastMessage('Veuillez sélectionner un fichier Excel (.xlsx, .xls)')
      setIsSuccess(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      event.target.value = '' // Réinitialiser le champ si le fichier n'est pas Excel
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return // S'assurer qu'un fichier est sélectionné

    const formData = new FormData()
    formData.append('file', selectedFile)
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
    const token = userInfo?.token // Récupérer le token depuis le stockage local

    try {
      const response = await fetch(`${apiUrl}/api/invoice/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // Ajouter l'en-tête d'autorisation avec le token
        },
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        setToastMessage(
          `Échec de l'enregistrement de la facture : ${errorText}`
        )
        setIsSuccess(false)
      } else {
        const jsonResponse = await response.json()
        setToastMessage('Facture enregistrée avec succès')
        setIsSuccess(true)
        console.log('Success:', jsonResponse)
        fileInputRef.current.value = '' // Réinitialiser le champ de fichier en cas de succès
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error.message)
      setToastMessage("Erreur lors de l'envoi de la facture")
      setIsSuccess(false)
    }
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <div>
      {showToast && (
        <div className="toast toast-center toast-middle">
          <div
            className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}
          >
            <span className="text-white">{toastMessage}</span>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        className="file-input file-input-bordered file-input-primary"
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileChange}
      />
      <br></br>
      <button
        className="btn btn-primary mt-1"
        onClick={handleUpload}
        disabled={!selectedFile}
      >
        Upload Excel File
      </button>
    </div>
  )
}

export default UploadExcelButton
