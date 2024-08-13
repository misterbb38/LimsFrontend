// // // import { useState } from 'react'
// // // import PropTypes from 'prop-types'

// // // function AddTestForm({ onTestChange }) {
// // //   const [nom, setNom] = useState('')
// // //   const [description, setDescription] = useState('')
// // //   const [prixAssurance, setPrixAssurance] = useState('260')
// // //   const [prixIpm, setPrixIpm] = useState('200')
// // //   const [prixPaf, setPrixPaf] = useState('220')
// // //   const [coeficiantB, setCoeficiantB] = useState('')
// // //   const [categories, setCategories] = useState('')
// // //   const [valeur, setValeur] = useState('')
// // //   const [prixSococim, setPrixSococim] = useState('180')
// // //   const [prixClinique, setPrixClinique] = useState('220')
// // //   const [interpretationA, setInterpretationA] = useState('')
// // //   const [interpretationB, setInterpretationB] = useState('')

// // //   // Ajout : gestion des nouveaux champs
// // //   const [valeurMachineA, setValeurMachineA] = useState('')
// // //   const [valeurMachineB, setValeurMachineB] = useState('')
// // //   const [machineA, setMachineA] = useState('')
// // //   const [machineB, setMachineB] = useState('')

// // //   // conclusion
// // //   const [conclusions, setConclusions] = useState([]) // Pour stocker les conclusions
// // //   const [newConclusion, setNewConclusion] = useState('') // Pour ajouter une nouvelle conclusion

// // //   const [isLoading, setIsLoading] = useState(false)
// // //   const [showToast, setShowToast] = useState(false)
// // //   const [toastMessage, setToastMessage] = useState('')
// // //   const [isSuccess, setIsSuccess] = useState(true)

// // //   const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

// // //   const handleAddConclusion = () => {
// // //     if (newConclusion.trim() !== '') {
// // //       setConclusions([...conclusions, newConclusion])
// // //       setNewConclusion('') // Réinitialiser après l'ajout
// // //     }
// // //   }

// // //   const handleRemoveConclusion = (index) => {
// // //     setConclusions(conclusions.filter((_, idx) => idx !== index))
// // //   }

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault()
// // //     setIsLoading(true)
// // //     const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
// // //     const token = userInfo?.token

// // //     try {
// // //       const response = await fetch(`${apiUrl}/api/test/`, {
// // //         method: 'POST',
// // //         headers: {
// // //           'Content-Type': 'application/json',
// // //           Authorization: `Bearer ${token}`,
// // //         },
// // //         body: JSON.stringify({
// // //           nom,
// // //           description,
// // //           prixAssurance,
// // //           prixIpm,
// // //           prixPaf,
// // //           prixClinique,
// // //           coeficiantB,
// // //           categories,
// // //           valeur,
// // //           prixSococim, // Nouveau champ pour le prix Sococim
// // //           interpretationA, // Nouveau champ pour l'interprétation de la machine A
// // //           interpretationB, // Nouveau champ pour l'interprétation de la machine B
// // //           // Ajout : envoi des nouvelles valeurs
// // //           valeurMachineA,
// // //           valeurMachineB,
// // //           machineA,
// // //           machineB,
// // //           conclusions,
// // //         }),
// // //       })

// // //       if (response.ok) {
// // //         const data = await response.json()
// // //         setToastMessage(data.message || 'Test ajouté avec succès')
// // //         setIsSuccess(true)
// // //         onTestChange()
// // //         resetForm()
// // //       } else {
// // //         const errorData = await response.json()
// // //         setToastMessage(errorData.message || "Échec de l'ajout du test")
// // //         setIsSuccess(false)
// // //       }
// // //     } catch (error) {
// // //       setToastMessage("Erreur lors de l'envoi du formulaire : " + error.message)
// // //       setIsSuccess(false)
// // //     } finally {
// // //       setIsLoading(false)
// // //       setShowToast(true)
// // //       setTimeout(() => setShowToast(false), 3000)
// // //     }
// // //   }

// // //   const resetForm = () => {
// // //     setNom('')
// // //     setDescription('')
// // //     setPrixAssurance('')
// // //     setPrixIpm('')
// // //     setPrixClinique('')
// // //     setPrixPaf('')
// // //     setCoeficiantB('')
// // //     setCategories('')
// // //     setValeur('')
// // //     setPrixSococim('')
// // //     setInterpretationA('')
// // //     setInterpretationB('')
// // //     setConclusions([])
// // //     // Réinitialisation des nouveaux champs
// // //     setValeurMachineA('')
// // //     setValeurMachineB('')
// // //     setMachineA('')
// // //     setMachineB('')
// // //   }

// // //   return (
// // //     <>
// // //       {showToast && (
// // //         <div className="toast toast-center toast-middle">
// // //           <div
// // //             className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}
// // //           >
// // //             <span className="text-white">{toastMessage}</span>
// // //           </div>
// // //         </div>
// // //       )}
// // //       <form onSubmit={handleSubmit}>
// // //         <div>
// // //           <label className="text-sm font-medium base-content">Nom</label>
// // //           <br></br>
// // //           <input
// // //             type="text"
// // //             value={nom}
// // //             onChange={(e) => setNom(e.target.value)}
// // //             required
// // //             className="input input-bordered input-primary w-full max-w-xs"
// // //           />
// // //         </div>
// // //         <div>
// // //           <label className="text-sm font-medium base-content">
// // //             Description
// // //           </label>
// // //           <br></br>
// // //           <textarea
// // //             value={description}
// // //             onChange={(e) => setDescription(e.target.value)}

// // //             className="input input-bordered input-primary w-full max-w-xs"
// // //           />
// // //         </div>
// // //         <div>
// // //           <label className="text-sm font-medium base-content">
// // //             Coeficiant B
// // //           </label>
// // //           <br></br>
// // //           <input
// // //             type="number"
// // //             value={coeficiantB}
// // //             onChange={(e) => setCoeficiantB(e.target.value)}
// // //             className="input input-bordered input-primary w-full max-w-xs"
// // //           />
// // //         </div>
// // //         <div>
// // //           <label className="text-sm font-medium base-content">
// // //             Prix Assurance
// // //           </label>
// // //           <br></br>
// // //           <input
// // //             type="number"
// // //             value={prixAssurance}
// // //             onChange={(e) => setPrixAssurance(e.target.value)}
// // //             className="input input-bordered input-primary w-full max-w-xs"
// // //           />
// // //         </div>
// // //         <div>
// // //           <label className="text-sm font-medium base-content">Prix IPM</label>
// // //           <br></br>
// // //           <input
// // //             type="number"
// // //             value={prixIpm}
// // //             onChange={(e) => setPrixIpm(e.target.value)}
// // //             className="input input-bordered input-primary w-full max-w-xs"
// // //           />
// // //         </div>
// // //         <div>
// // //           <label className="text-sm font-medium base-content">
// // //             Prix Sococim
// // //           </label>
// // //           <br></br>
// // //           <input
// // //             type="number"
// // //             value={prixSococim}
// // //             onChange={(e) => setPrixSococim(e.target.value)}
// // //             className="input input-bordered input-primary w-full max-w-xs"
// // //           />
// // //         </div>
// // //         <div>
// // //           <label className="text-sm font-medium base-content">
// // //             Prix Clinique
// // //           </label>
// // //           <br></br>
// // //           <input
// // //             type="number"
// // //             value={prixClinique}
// // //             onChange={(e) => setPrixClinique(e.target.value)}
// // //             className="input input-bordered input-primary w-full max-w-xs"
// // //           />
// // //         </div>
// // //         <div>
// // //           <label className="text-sm font-medium base-content">Prix PAF</label>
// // //           <br></br>
// // //           <input
// // //             type="number"
// // //             value={prixPaf}
// // //             onChange={(e) => setPrixPaf(e.target.value)}
// // //             className="input input-bordered input-primary w-full max-w-xs"
// // //           />
// // //         </div>
// // //         <div>
// // //           <label className="text-sm font-medium base-content"></label>
// // //           <br></br>
// // //           <input
// // //             type="text"
// // //             value={categories}
// // //             onChange={(e) => setCategories(e.target.value)}
// // //             className="input input-bordered input-primary w-full max-w-xs"
// // //           />
// // //         </div>
// // //         <div>
// // //           <label className="text-sm font-medium base-content">
// // //             Interprétation A
// // //           </label>
// // //           <br></br>
// // //           <textarea
// // //             value={interpretationA}
// // //             onChange={(e) => setInterpretationA(e.target.value)}
// // //             className="input input-bordered input-primary w-full max-w-xs"
// // //           />
// // //         </div>
// // //         <div>
// // //           <label className="text-sm font-medium base-content">
// // //             Interprétation B
// // //           </label>
// // //           <br></br>
// // //           <textarea
// // //             value={interpretationB}
// // //             onChange={(e) => setInterpretationB(e.target.value)}
// // //             className="input input-bordered input-primary w-full max-w-xs"
// // //           />
// // //         </div>
// // //         {/* Ajout de champs pour les machines */}
// // //         <div>
// // //           <label className="text-sm font-medium base-content">
// // //             Valeur d'interpretation Machine A
// // //           </label>
// // //           <br></br>
// // //           <textarea
// // //             type="text"
// // //             value={valeurMachineA}
// // //             onChange={(e) => setValeurMachineA(e.target.value)}
// // //             className="input input-bordered input-primary w-full max-w-xs"
// // //           />
// // //         </div>
// // //         <div>
// // //           <label className="text-sm font-medium base-content">
// // //             Valeur d'interpretation Machine B
// // //           </label>
// // //           <br></br>
// // //           <textarea
// // //             type="text"
// // //             value={valeurMachineB}
// // //             onChange={(e) => setValeurMachineB(e.target.value)}
// // //             className="input input-bordered input-primary w-full max-w-xs"
// // //           />
// // //         </div>
// // //         <div>
// // //           <label className="text-sm font-medium base-content">Machine A</label>
// // //           <br></br>
// // //           <input
// // //             type="text"
// // //             value={machineA}
// // //             onChange={(e) => setMachineA(e.target.value)}
// // //             className="input input-bordered input-primary w-full max-w-xs"
// // //           />
// // //         </div>
// // //         <div>
// // //           <label className="text-sm font-medium base-content">Machine B</label>
// // //           <br></br>
// // //           <input
// // //             type="text"
// // //             value={machineB}
// // //             onChange={(e) => setMachineB(e.target.value)}
// // //             className="input input-bordered input-primary w-full max-w-xs"
// // //           />
// // //         </div>
// // //         <div>
// // //           <label className="text-sm font-medium base-content">
// // //             Conclusions
// // //           </label>
// // //           <div>
// // //             <input
// // //               type="text"
// // //               value={newConclusion}
// // //               onChange={(e) => setNewConclusion(e.target.value)}
// // //               className="input input-bordered input-primary w-full max-w-xs"
// // //             />
// // //             <button
// // //               type="button"
// // //               onClick={handleAddConclusion}
// // //               className="btn btn-sm btn-primary ml-2"
// // //             >
// // //               Ajouter Conclusion
// // //             </button>
// // //           </div>
// // //           {conclusions.map((conclusion, index) => (
// // //             <div key={index} className="flex justify-between items-center mt-2">
// // //               <span className="text-base-content text-opacity-80">
// // //                 {conclusion}
// // //               </span>
// // //               <button
// // //                 type="button"
// // //                 onClick={() => handleRemoveConclusion(index)}
// // //                 className="btn btn-error btn-sm"
// // //               >
// // //                 Supprimer
// // //               </button>
// // //             </div>
// // //           ))}
// // //         </div>
// // //         {isLoading && (
// // //           <div className="flex justify-center items-center">
// // //             <div className="loading"></div>
// // //           </div>
// // //         )}
// // //         <button type="submit" className="btn btn-primary mt-4">
// // //           Ajouter un test
// // //         </button>
// // //       </form>
// // //     </>
// // //   )
// // // }

// // // AddTestForm.propTypes = {
// // //   onTestChange: PropTypes.func.isRequired,
// // // }

// // // export default AddTestForm

// // import { useState } from 'react'
// // import PropTypes from 'prop-types'

// // function AddTestForm({ onTestChange }) {
// //   const [formData, setFormData] = useState({
// //     nom: '',
// //     description: '',
// //     prixAssurance: '260',
// //     prixIpm: '200',
// //     prixPaf: '220',
// //     prixClinique: '220',
// //     coeficiantB: '',
// //     categories: '',
// //     valeurMachineA: '',
// //     valeurMachineB: '',
// //     machineA: '',
// //     machineB: '',
// //     interpretationA: { type: 'text', content: { columns: [], rows: [] } },
// //     interpretationB: { type: 'text', content: { columns: [], rows: [] } },
// //     prixSococim: '180',
// //     conclusions: [],
// //   })

// //   const [newConclusion, setNewConclusion] = useState('')
// //   const [isLoading, setIsLoading] = useState(false)
// //   const [showToast, setShowToast] = useState(false)
// //   const [toastMessage, setToastMessage] = useState('')
// //   const [isSuccess, setIsSuccess] = useState(true)

// //   const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

// //   const categoryOptions = [
// //     'BIOCHIMIE SANGUINE',
// //     'BIOCHIMIE URINAIRE',
// //     'IMMUNOLOGIE-SEROLOGIE VIRALE',
// //     'ENDOCRINOLOGIE',
// //     'IMMUNOLOGIE-AUTOIMMUNITE',
// //     'IMMUNOLOGIE',
// //     'INFECTIOLOGIE',
// //     'IMMUNOLOGIE-SEROLOGIE BACTERIENNE',
// //     'ALLERGIE',
// //     'HEMATOLOGIE',
// //     'HEMATOLOGIE - HEMOSTASE',
// //     'BIOCHIMIE',
// //     'ANATOMO-PATHOLOGIE',
// //     'BIOLOGIE DE LA REPRODUCTION',
// //     'MYCOLOGIE',
// //     'GENETIQUE',
// //     'IMMUNOCHIMIE SELLES',
// //     'MARQUEUR TUMORAL',
// //     'INFECTIOLOGIE - BACTERIOLOGIE',
// //     'CYTOLOGIE',
// //     'INFECTIOLOGIE - PARASITOLOGIE',
// //     'BIOCHIMIE - GAZ',
// //   ]

// //   const handleAddConclusion = () => {
// //     if (newConclusion.trim() !== '') {
// //       setFormData({
// //         ...formData,
// //         conclusions: [...formData.conclusions, newConclusion],
// //       })
// //       setNewConclusion('')
// //     }
// //   }

// //   const handleRemoveConclusion = (index) => {
// //     setFormData({
// //       ...formData,
// //       conclusions: formData.conclusions.filter((_, idx) => idx !== index),
// //     })
// //   }

// //   const handleChange = (e) => {
// //     const { name, value } = e.target
// //     setFormData({
// //       ...formData,
// //       [name]: value,
// //     })
// //   }

// //   const handleInterpretationChange = (name, type, content) => {
// //     setFormData({
// //       ...formData,
// //       [name]: { type, content },
// //     })
// //   }

// //   const handleAddColumn = (interpretationName) => {
// //     setFormData((prevFormData) => {
// //       const updatedColumns = [
// //         ...prevFormData[interpretationName].content.columns,
// //         '',
// //       ]
// //       const updatedRows = prevFormData[interpretationName].content.rows.map(
// //         (row) => [...row, '']
// //       )
// //       return {
// //         ...prevFormData,
// //         [interpretationName]: {
// //           ...prevFormData[interpretationName],
// //           content: {
// //             ...prevFormData[interpretationName].content,
// //             columns: updatedColumns,
// //             rows: updatedRows,
// //           },
// //         },
// //       }
// //     })
// //   }

// //   const handleAddRow = (interpretationName) => {
// //     setFormData((prevFormData) => {
// //       const newRow = Array(
// //         prevFormData[interpretationName].content.columns.length
// //       ).fill('')
// //       return {
// //         ...prevFormData,
// //         [interpretationName]: {
// //           ...prevFormData[interpretationName],
// //           content: {
// //             ...prevFormData[interpretationName].content,
// //             rows: [...prevFormData[interpretationName].content.rows, newRow],
// //           },
// //         },
// //       }
// //     })
// //   }

// //   const handleRemoveColumn = (interpretationName, colIndex) => {
// //     setFormData((prevFormData) => {
// //       const updatedColumns = prevFormData[
// //         interpretationName
// //       ].content.columns.filter((_, index) => index !== colIndex)
// //       const updatedRows = prevFormData[interpretationName].content.rows.map(
// //         (row) => row.filter((_, index) => index !== colIndex)
// //       )
// //       return {
// //         ...prevFormData,
// //         [interpretationName]: {
// //           ...prevFormData[interpretationName],
// //           content: {
// //             columns: updatedColumns,
// //             rows: updatedRows,
// //           },
// //         },
// //       }
// //     })
// //   }

// //   const handleRemoveRow = (interpretationName, rowIndex) => {
// //     setFormData((prevFormData) => {
// //       return {
// //         ...prevFormData,
// //         [interpretationName]: {
// //           ...prevFormData[interpretationName],
// //           content: {
// //             ...prevFormData[interpretationName].content,
// //             rows: prevFormData[interpretationName].content.rows.filter(
// //               (_, index) => index !== rowIndex
// //             ),
// //           },
// //         },
// //       }
// //     })
// //   }

// //   const handleColumnTitleChange = (interpretationName, colIndex, value) => {
// //     setFormData((prevFormData) => {
// //       const updatedColumns = prevFormData[
// //         interpretationName
// //       ].content.columns.map((col, index) => (index === colIndex ? value : col))
// //       return {
// //         ...prevFormData,
// //         [interpretationName]: {
// //           ...prevFormData[interpretationName],
// //           content: {
// //             ...prevFormData[interpretationName].content,
// //             columns: updatedColumns,
// //           },
// //         },
// //       }
// //     })
// //   }

// //   const handleCellChange = (interpretationName, rowIndex, colIndex, value) => {
// //     setFormData((prevFormData) => {
// //       const updatedRows = prevFormData[interpretationName].content.rows.map(
// //         (row, i) =>
// //           i === rowIndex
// //             ? row.map((cell, j) => (j === colIndex ? value : cell))
// //             : row
// //       )
// //       return {
// //         ...prevFormData,
// //         [interpretationName]: {
// //           ...prevFormData[interpretationName],
// //           content: {
// //             ...prevFormData[interpretationName].content,
// //             rows: updatedRows,
// //           },
// //         },
// //       }
// //     })
// //   }

// //   const handleSubmit = async (e) => {
// //     e.preventDefault()
// //     setIsLoading(true)
// //     const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
// //     const token = userInfo?.token

// //     try {
// //       const response = await fetch(`${apiUrl}/api/test/`, {
// //         method: 'POST',
// //         headers: {
// //           'Content-Type': 'application/json',
// //           Authorization: `Bearer ${token}`,
// //         },
// //         body: JSON.stringify(formData),
// //       })

// //       if (response.ok) {
// //         const data = await response.json()
// //         setToastMessage(data.message || 'Test ajouté avec succès')
// //         setIsSuccess(true)
// //         onTestChange()
// //         resetForm()
// //       } else {
// //         const errorData = await response.json()
// //         setToastMessage(errorData.message || "Échec de l'ajout du test")
// //         setIsSuccess(false)
// //       }
// //     } catch (error) {
// //       setToastMessage("Erreur lors de l'envoi du formulaire : " + error.message)
// //       setIsSuccess(false)
// //     } finally {
// //       setIsLoading(false)
// //       setShowToast(true)
// //       setTimeout(() => setShowToast(false), 3000)
// //     }
// //   }

// //   const resetForm = () => {
// //     setFormData({
// //       nom: '',
// //       description: '',
// //       prixAssurance: '260',
// //       prixIpm: '200',
// //       prixPaf: '220',
// //       prixClinique: '220',
// //       coeficiantB: '',
// //       categories: '',
// //       valeurMachineA: '',
// //       valeurMachineB: '',
// //       machineA: '',
// //       machineB: '',
// //       interpretationA: { type: 'text', content: { columns: [], rows: [] } },
// //       interpretationB: { type: 'text', content: { columns: [], rows: [] } },
// //       prixSococim: '180',
// //       conclusions: [],
// //     })
// //   }

// //   return (
// //     <>
// //       {showToast && (
// //         <div className="toast toast-center toast-middle">
// //           <div
// //             className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}
// //           >
// //             <span className="text-white">{toastMessage}</span>
// //           </div>
// //         </div>
// //       )}
// //       <form onSubmit={handleSubmit}>
// //         <div>
// //           <label className="text-sm font-medium base-content">Nom</label>
// //           <br></br>
// //           <input
// //             type="text"
// //             name="nom"
// //             value={formData.nom}
// //             onChange={handleChange}
// //             required
// //             className="input input-bordered input-primary w-full max-w-xs"
// //           />
// //         </div>
// //         <div>
// //           <label className="text-sm font-medium base-content">
// //             Description
// //           </label>
// //           <br></br>
// //           <textarea
// //             name="description"
// //             value={formData.description}
// //             onChange={handleChange}
// //             className="input input-bordered input-primary w-full max-w-xs"
// //           />
// //         </div>
// //         <div>
// //           <label className="text-sm font-medium base-content">
// //             Coeficiant B
// //           </label>
// //           <br></br>
// //           <input
// //             type="number"
// //             name="coeficiantB"
// //             value={formData.coeficiantB}
// //             onChange={handleChange}
// //             className="input input-bordered input-primary w-full max-w-xs"
// //           />
// //         </div>
// //         <div>
// //           <label className="text-sm font-medium base-content">
// //             Prix Assurance
// //           </label>
// //           <br></br>
// //           <input
// //             type="number"
// //             name="prixAssurance"
// //             value={formData.prixAssurance}
// //             onChange={handleChange}
// //             className="input input-bordered input-primary w-full max-w-xs"
// //           />
// //         </div>
// //         <div>
// //           <label className="text-sm font-medium base-content">Prix IPM</label>
// //           <br></br>
// //           <input
// //             type="number"
// //             name="prixIpm"
// //             value={formData.prixIpm}
// //             onChange={handleChange}
// //             className="input input-bordered input-primary w-full max-w-xs"
// //           />
// //         </div>
// //         <div>
// //           <label className="text-sm font-medium base-content">
// //             Prix Sococim
// //           </label>
// //           <br></br>
// //           <input
// //             type="number"
// //             name="prixSococim"
// //             value={formData.prixSococim}
// //             onChange={handleChange}
// //             className="input input-bordered input-primary w-full max-w-xs"
// //           />
// //         </div>
// //         <div>
// //           <label className="text-sm font-medium base-content">
// //             Prix Clinique
// //           </label>
// //           <br></br>
// //           <input
// //             type="number"
// //             name="prixClinique"
// //             value={formData.prixClinique}
// //             onChange={handleChange}
// //             className="input input-bordered input-primary w-full max-w-xs"
// //           />
// //         </div>
// //         <div>
// //           <label className="text-sm font-medium base-content">Prix PAF</label>
// //           <br></br>
// //           <input
// //             type="number"
// //             name="prixPaf"
// //             value={formData.prixPaf}
// //             onChange={handleChange}
// //             className="input input-bordered input-primary w-full max-w-xs"
// //           />
// //         </div>
// //         <div>
// //           <label className="text-sm font-medium base-content">Catégorie</label>
// //           <br></br>
// //           <select
// //             name="categories"
// //             value={formData.categories}
// //             onChange={handleChange}
// //             className="input input-bordered input-primary w-full max-w-xs"
// //             required
// //           >
// //             <option value="" disabled>
// //               Sélectionner une catégorie
// //             </option>
// //             {categoryOptions.map((category, index) => (
// //               <option key={index} value={category}>
// //                 {category}
// //               </option>
// //             ))}
// //           </select>
// //         </div>

// //         {/* Gestion de l'interprétation A */}
// //         <div className="form-control">
// //           <label className="label">Type d'Interprétation A</label>
// //           <select
// //             className="input input-bordered"
// //             value={formData.interpretationA?.type || 'text'}
// //             onChange={(e) =>
// //               handleInterpretationChange(
// //                 'interpretationA',
// //                 e.target.value,
// //                 formData.interpretationA?.content || {
// //                   columns: [],
// //                   rows: [],
// //                 }
// //               )
// //             }
// //           >
// //             <option value="text">Texte</option>
// //             <option value="table">Tableau</option>
// //           </select>
// //         </div>
// //         {formData.interpretationA?.type === 'table' && (
// //           <div className="form-control">
// //             <label className="label">Tableau de l'Interprétation A</label>
// //             <div>
// //               <button
// //                 type="button"
// //                 className="btn btn-primary"
// //                 onClick={() => handleAddColumn('interpretationA')}
// //               >
// //                 Ajouter une colonne
// //               </button>
// //               <button
// //                 type="button"
// //                 className="btn btn-primary ml-2"
// //                 onClick={() => handleAddRow('interpretationA')}
// //               >
// //                 Ajouter une ligne
// //               </button>
// //             </div>
// //             <table className="table table-bordered mt-2">
// //               <thead>
// //                 <tr>
// //                   {formData.interpretationA?.content.columns.map(
// //                     (col, colIndex) => (
// //                       <th key={colIndex}>
// //                         <input
// //                           type="text"
// //                           className="input input-bordered"
// //                           value={col}
// //                           onChange={(e) =>
// //                             handleColumnTitleChange(
// //                               'interpretationA',
// //                               colIndex,
// //                               e.target.value
// //                             )
// //                           }
// //                         />
// //                         <button
// //                           type="button"
// //                           className="btn btn-error btn-sm mt-1"
// //                           onClick={() =>
// //                             handleRemoveColumn('interpretationA', colIndex)
// //                           }
// //                         >
// //                           Supprimer la colonne
// //                         </button>
// //                       </th>
// //                     )
// //                   )}
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {formData.interpretationA?.content.rows.map((row, rowIndex) => (
// //                   <tr key={rowIndex}>
// //                     {row.map((cell, colIndex) => (
// //                       <td key={colIndex}>
// //                         <input
// //                           type="text"
// //                           className="input input-bordered w-full"
// //                           value={cell}
// //                           onChange={(e) =>
// //                             handleCellChange(
// //                               'interpretationA',
// //                               rowIndex,
// //                               colIndex,
// //                               e.target.value
// //                             )
// //                           }
// //                         />
// //                       </td>
// //                     ))}
// //                     <td>
// //                       <button
// //                         type="button"
// //                         className="btn btn-error btn-sm"
// //                         onClick={() =>
// //                           handleRemoveRow('interpretationA', rowIndex)
// //                         }
// //                       >
// //                         Supprimer la ligne
// //                       </button>
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         )}
// //         {formData.interpretationA?.type === 'text' && (
// //           <div className="form-control">
// //             <label className="label">Contenu de l'Interprétation A</label>
// //             <textarea
// //               className="textarea textarea-bordered"
// //               name="interpretationAContent"
// //               value={formData.interpretationA?.content}
// //               onChange={(e) =>
// //                 handleInterpretationChange(
// //                   'interpretationA',
// //                   formData.interpretationA?.type,
// //                   e.target.value
// //                 )
// //               }
// //             />
// //           </div>
// //         )}

// //         {/* Gestion de l'interprétation B */}
// //         <div className="form-control">
// //           <label className="label">Type d'Interprétation B</label>
// //           <select
// //             className="input input-bordered"
// //             value={formData.interpretationB?.type || 'text'}
// //             onChange={(e) =>
// //               handleInterpretationChange(
// //                 'interpretationB',
// //                 e.target.value,
// //                 formData.interpretationB?.content || {
// //                   columns: [],
// //                   rows: [],
// //                 }
// //               )
// //             }
// //           >
// //             <option value="text">Texte</option>
// //             <option value="table">Tableau</option>
// //           </select>
// //         </div>
// //         {formData.interpretationB?.type === 'table' && (
// //           <div className="form-control">
// //             <label className="label">Tableau de l'Interprétation B</label>
// //             <div>
// //               <button
// //                 type="button"
// //                 className="btn btn-primary"
// //                 onClick={() => handleAddColumn('interpretationB')}
// //               >
// //                 Ajouter une colonne
// //               </button>
// //               <button
// //                 type="button"
// //                 className="btn btn-primary ml-2"
// //                 onClick={() => handleAddRow('interpretationB')}
// //               >
// //                 Ajouter une ligne
// //               </button>
// //             </div>
// //             <table className="table table-bordered mt-2">
// //               <thead>
// //                 <tr>
// //                   {formData.interpretationB?.content.columns.map(
// //                     (col, colIndex) => (
// //                       <th key={colIndex}>
// //                         <input
// //                           type="text"
// //                           className="input input-bordered"
// //                           value={col}
// //                           onChange={(e) =>
// //                             handleColumnTitleChange(
// //                               'interpretationB',
// //                               colIndex,
// //                               e.target.value
// //                             )
// //                           }
// //                         />
// //                         <button
// //                           type="button"
// //                           className="btn btn-error btn-sm mt-1 mb-1"
// //                           onClick={() =>
// //                             handleRemoveColumn('interpretationB', colIndex)
// //                           }
// //                         >
// //                           Supprimer la colonne
// //                         </button>
// //                       </th>
// //                     )
// //                   )}
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {formData.interpretationB?.content.rows.map((row, rowIndex) => (
// //                   <tr key={rowIndex}>
// //                     {row.map((cell, colIndex) => (
// //                       <td key={colIndex}>
// //                         <input
// //                           type="text"
// //                           className="input input-bordered w-full"
// //                           value={cell}
// //                           onChange={(e) =>
// //                             handleCellChange(
// //                               'interpretationB',
// //                               rowIndex,
// //                               colIndex,
// //                               e.target.value
// //                             )
// //                           }
// //                         />
// //                       </td>
// //                     ))}
// //                     <td>
// //                       <button
// //                         type="button"
// //                         className="btn btn-error btn-sm"
// //                         onClick={() =>
// //                           handleRemoveRow('interpretationB', rowIndex)
// //                         }
// //                       >
// //                         Supprimer la ligne
// //                       </button>
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         )}
// //         {formData.interpretationB?.type === 'text' && (
// //           <div className="form-control">
// //             <label className="label">Contenu de l'Interprétation B</label>
// //             <textarea
// //               className="textarea textarea-bordered"
// //               name="interpretationBContent"
// //               value={formData.interpretationB?.content}
// //               onChange={(e) =>
// //                 handleInterpretationChange(
// //                   'interpretationB',
// //                   formData.interpretationB?.type,
// //                   e.target.value
// //                 )
// //               }
// //             />
// //           </div>
// //         )}

// //         <div>
// //           <label className="text-sm font-medium base-content">
// //             Conclusions
// //           </label>
// //           <div>
// //             <input
// //               type="text"
// //               value={newConclusion}
// //               onChange={(e) => setNewConclusion(e.target.value)}
// //               className="input input-bordered input-primary w-full max-w-xs"
// //             />
// //             <button
// //               type="button"
// //               onClick={handleAddConclusion}
// //               className="btn btn-sm btn-primary ml-2"
// //             >
// //               Ajouter Conclusion
// //             </button>
// //           </div>
// //           {formData.conclusions.map((conclusion, index) => (
// //             <div key={index} className="flex justify-between items-center mt-2">
// //               <span className="text-base-content text-opacity-80">
// //                 {conclusion}
// //               </span>
// //               <button
// //                 type="button"
// //                 onClick={() => handleRemoveConclusion(index)}
// //                 className="btn btn-error btn-sm"
// //               >
// //                 Supprimer
// //               </button>
// //             </div>
// //           ))}
// //         </div>
// //         {isLoading && (
// //           <div className="flex justify-center items-center">
// //             <div className="loading"></div>
// //           </div>
// //         )}
// //         <button type="submit" className="btn btn-primary mt-4">
// //           Ajouter un test
// //         </button>
// //       </form>
// //     </>
// //   )
// // }

// // AddTestForm.propTypes = {
// //   onTestChange: PropTypes.func.isRequired,
// // }

// // export default AddTestForm

// import { useState } from 'react'
// import PropTypes from 'prop-types'

// function AddTestForm({ onTestChange }) {
//   const [nom, setNom] = useState('')
//   const [description, setDescription] = useState('')
//   const [prixAssurance, setPrixAssurance] = useState('260')
//   const [prixIpm, setPrixIpm] = useState('200')
//   const [prixPaf, setPrixPaf] = useState('220')
//   const [coeficiantB, setCoeficiantB] = useState('')
//   const [categories, setCategories] = useState('')
//   const [valeur, setValeur] = useState('')
//   const [prixSococim, setPrixSococim] = useState('180')
//   const [prixClinique, setPrixClinique] = useState('220')
//   const [interpretationA, setInterpretationA] = useState({
//     type: 'text',
//     content: { columns: [], rows: [] },
//   })
//   const [interpretationB, setInterpretationB] = useState({
//     type: 'text',
//     content: { columns: [], rows: [] },
//   })

//   // Ajout : gestion des nouveaux champs
//   const [valeurMachineA, setValeurMachineA] = useState('')
//   const [valeurMachineB, setValeurMachineB] = useState('')
//   const [machineA, setMachineA] = useState('')
//   const [machineB, setMachineB] = useState('')

//   // conclusion
//   const [conclusions, setConclusions] = useState([]) // Pour stocker les conclusions
//   const [newConclusion, setNewConclusion] = useState('') // Pour ajouter une nouvelle conclusion

//   const [isLoading, setIsLoading] = useState(false)
//   const [showToast, setShowToast] = useState(false)
//   const [toastMessage, setToastMessage] = useState('')
//   const [isSuccess, setIsSuccess] = useState(true)

//   const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

//   const handleAddConclusion = () => {
//     if (newConclusion.trim() !== '') {
//       setConclusions([...conclusions, newConclusion])
//       setNewConclusion('') // Réinitialiser après l'ajout
//     }
//   }

//   const handleRemoveConclusion = (index) => {
//     setConclusions(conclusions.filter((_, idx) => idx !== index))
//   }

//   const handleInterpretationChange = (name, type, content) => {
//     if (name === 'interpretationA') {
//       setInterpretationA({ type, content })
//     } else if (name === 'interpretationB') {
//       setInterpretationB({ type, content })
//     }
//   }

//   const handleAddColumn = (interpretationName) => {
//     if (interpretationName === 'interpretationA') {
//       const updatedColumns = [...interpretationA.content.columns, '']
//       const updatedRows = interpretationA.content.rows.map((row) => [
//         ...row,
//         '',
//       ])
//       setInterpretationA({
//         ...interpretationA,
//         content: { columns: updatedColumns, rows: updatedRows },
//       })
//     } else if (interpretationName === 'interpretationB') {
//       const updatedColumns = [...interpretationB.content.columns, '']
//       const updatedRows = interpretationB.content.rows.map((row) => [
//         ...row,
//         '',
//       ])
//       setInterpretationB({
//         ...interpretationB,
//         content: { columns: updatedColumns, rows: updatedRows },
//       })
//     }
//   }

//   const handleAddRow = (interpretationName) => {
//     if (interpretationName === 'interpretationA') {
//       const newRow = Array(interpretationA.content.columns.length).fill('')
//       setInterpretationA({
//         ...interpretationA,
//         content: {
//           ...interpretationA.content,
//           rows: [...interpretationA.content.rows, newRow],
//         },
//       })
//     } else if (interpretationName === 'interpretationB') {
//       const newRow = Array(interpretationB.content.columns.length).fill('')
//       setInterpretationB({
//         ...interpretationB,
//         content: {
//           ...interpretationB.content,
//           rows: [...interpretationB.content.rows, newRow],
//         },
//       })
//     }
//   }

//   const handleRemoveColumn = (interpretationName, colIndex) => {
//     if (interpretationName === 'interpretationA') {
//       const updatedColumns = interpretationA.content.columns.filter(
//         (_, index) => index !== colIndex
//       )
//       const updatedRows = interpretationA.content.rows.map((row) =>
//         row.filter((_, index) => index !== colIndex)
//       )
//       setInterpretationA({
//         ...interpretationA,
//         content: { columns: updatedColumns, rows: updatedRows },
//       })
//     } else if (interpretationName === 'interpretationB') {
//       const updatedColumns = interpretationB.content.columns.filter(
//         (_, index) => index !== colIndex
//       )
//       const updatedRows = interpretationB.content.rows.map((row) =>
//         row.filter((_, index) => index !== colIndex)
//       )
//       setInterpretationB({
//         ...interpretationB,
//         content: { columns: updatedColumns, rows: updatedRows },
//       })
//     }
//   }

//   const handleRemoveRow = (interpretationName, rowIndex) => {
//     if (interpretationName === 'interpretationA') {
//       const updatedRows = interpretationA.content.rows.filter(
//         (_, index) => index !== rowIndex
//       )
//       setInterpretationA({
//         ...interpretationA,
//         content: { ...interpretationA.content, rows: updatedRows },
//       })
//     } else if (interpretationName === 'interpretationB') {
//       const updatedRows = interpretationB.content.rows.filter(
//         (_, index) => index !== rowIndex
//       )
//       setInterpretationB({
//         ...interpretationB,
//         content: { ...interpretationB.content, rows: updatedRows },
//       })
//     }
//   }

//   const handleColumnTitleChange = (interpretationName, colIndex, value) => {
//     if (interpretationName === 'interpretationA') {
//       const updatedColumns = interpretationA.content.columns.map(
//         (col, index) => (index === colIndex ? value : col)
//       )
//       setInterpretationA({
//         ...interpretationA,
//         content: { ...interpretationA.content, columns: updatedColumns },
//       })
//     } else if (interpretationName === 'interpretationB') {
//       const updatedColumns = interpretationB.content.columns.map(
//         (col, index) => (index === colIndex ? value : col)
//       )
//       setInterpretationB({
//         ...interpretationB,
//         content: { ...interpretationB.content, columns: updatedColumns },
//       })
//     }
//   }

//   const handleCellChange = (interpretationName, rowIndex, colIndex, value) => {
//     if (interpretationName === 'interpretationA') {
//       const updatedRows = interpretationA.content.rows.map((row, i) =>
//         i === rowIndex
//           ? row.map((cell, j) => (j === colIndex ? value : cell))
//           : row
//       )
//       setInterpretationA({
//         ...interpretationA,
//         content: { ...interpretationA.content, rows: updatedRows },
//       })
//     } else if (interpretationName === 'interpretationB') {
//       const updatedRows = interpretationB.content.rows.map((row, i) =>
//         i === rowIndex
//           ? row.map((cell, j) => (j === colIndex ? value : cell))
//           : row
//       )
//       setInterpretationB({
//         ...interpretationB,
//         content: { ...interpretationB.content, rows: updatedRows },
//       })
//     }
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setIsLoading(true)
//     const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
//     const token = userInfo?.token

//     try {
//       const response = await fetch(`${apiUrl}/api/test/`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           nom,
//           description,
//           prixAssurance,
//           prixIpm,
//           prixPaf,
//           prixClinique,
//           coeficiantB,
//           categories,
//           valeur,
//           prixSococim, // Nouveau champ pour le prix Sococim
//           interpretationA, // Nouveau champ pour l'interprétation de la machine A
//           interpretationB, // Nouveau champ pour l'interprétation de la machine B
//           // Ajout : envoi des nouvelles valeurs
//           valeurMachineA,
//           valeurMachineB,
//           machineA,
//           machineB,
//           conclusions,
//         }),
//       })

//       if (response.ok) {
//         const data = await response.json()
//         setToastMessage(data.message || 'Test ajouté avec succès')
//         setIsSuccess(true)
//         onTestChange()
//         resetForm()
//       } else {
//         const errorData = await response.json()
//         setToastMessage(errorData.message || "Échec de l'ajout du test")
//         setIsSuccess(false)
//       }
//     } catch (error) {
//       setToastMessage("Erreur lors de l'envoi du formulaire : " + error.message)
//       setIsSuccess(false)
//     } finally {
//       setIsLoading(false)
//       setShowToast(true)
//       setTimeout(() => setShowToast(false), 3000)
//     }
//   }

//   const resetForm = () => {
//     setNom('')
//     setDescription('')
//     setPrixAssurance('')
//     setPrixIpm('')
//     setPrixClinique('')
//     setPrixPaf('')
//     setCoeficiantB('')
//     setCategories('')
//     setValeur('')
//     setPrixSococim('')
//     setInterpretationA({ type: 'text', content: { columns: [], rows: [] } })
//     setInterpretationB({ type: 'text', content: { columns: [], rows: [] } })
//     setConclusions([])
//     setValeurMachineA('')
//     setValeurMachineB('')
//     setMachineA('')
//     setMachineB('')
//   }

//   const categoryOptions = [
//     'BIOCHIMIE SANGUINE',
//     'BIOCHIMIE URINAIRE',
//     'IMMUNOLOGIE-SEROLOGIE VIRALE',
//     'ENDOCRINOLOGIE',
//     'IMMUNOLOGIE-AUTOIMMUNITE',
//     'IMMUNOLOGIE',
//     'INFECTIOLOGIE',
//     'IMMUNOLOGIE-SEROLOGIE BACTERIENNE',
//     'ALLERGIE',
//     'HEMATOLOGIE',
//     'HEMATOLOGIE - HEMOSTASE',
//     'BIOCHIMIE',
//     'ANATOMO-PATHOLOGIE',
//     'BIOLOGIE DE LA REPRODUCTION',
//     'MYCOLOGIE',
//     'GENETIQUE',
//     'IMMUNOCHIMIE SELLES',
//     'MARQUEUR TUMORAL',
//     'INFECTIOLOGIE - BACTERIOLOGIE',
//     'CYTOLOGIE',
//     'INFECTIOLOGIE - PARASITOLOGIE',
//     'BIOCHIMIE - GAZ',
//   ]

//   // Suppression des doublons
//   const uniqueCategoryOptions = [...new Set(categoryOptions)]

//   return (
//     <>
//       {showToast && (
//         <div className="toast toast-center toast-middle">
//           <div
//             className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}
//           >
//             <span className="text-white">{toastMessage}</span>
//           </div>
//         </div>
//       )}
//       <form onSubmit={handleSubmit}>
//         <div>
//           <label className="text-sm font-medium base-content">Nom</label>
//           <br></br>
//           <input
//             type="text"
//             value={nom}
//             onChange={(e) => setNom(e.target.value)}
//             required
//             className="input input-bordered input-primary w-full max-w-xs"
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium base-content">
//             Description
//           </label>
//           <br></br>
//           <textarea
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             className="input input-bordered input-primary w-full max-w-xs"
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium base-content">
//             Coeficiant B
//           </label>
//           <br></br>
//           <input
//             type="number"
//             value={coeficiantB}
//             onChange={(e) => setCoeficiantB(e.target.value)}
//             className="input input-bordered input-primary w-full max-w-xs"
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium base-content">
//             Prix Assurance
//           </label>
//           <br></br>
//           <input
//             type="number"
//             value={prixAssurance}
//             onChange={(e) => setPrixAssurance(e.target.value)}
//             className="input input-bordered input-primary w-full max-w-xs"
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium base-content">Prix IPM</label>
//           <br></br>
//           <input
//             type="number"
//             value={prixIpm}
//             onChange={(e) => setPrixIpm(e.target.value)}
//             className="input input-bordered input-primary w-full max-w-xs"
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium base-content">
//             Prix Sococim
//           </label>
//           <br></br>
//           <input
//             type="number"
//             value={prixSococim}
//             onChange={(e) => setPrixSococim(e.target.value)}
//             className="input input-bordered input-primary w-full max-w-xs"
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium base-content">
//             Prix Clinique
//           </label>
//           <br></br>
//           <input
//             type="number"
//             value={prixClinique}
//             onChange={(e) => setPrixClinique(e.target.value)}
//             className="input input-bordered input-primary w-full max-w-xs"
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium base-content">Prix PAF</label>
//           <br></br>
//           <input
//             type="number"
//             value={prixPaf}
//             onChange={(e) => setPrixPaf(e.target.value)}
//             className="input input-bordered input-primary w-full max-w-xs"
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium base-content">Matiere</label>
//           <br></br>
//           <select
//             value={categories}
//             onChange={(e) => setCategories(e.target.value)}
//             className="input input-bordered input-primary w-full max-w-xs"
//           >
//             <option value="" disabled>
//               Select a category
//             </option>
//             {uniqueCategoryOptions.map((category, index) => (
//               <option key={index} value={category}>
//                 {category}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Gestion de l'interprétation A */}
//         <div className="form-control">
//           <label className="label">Type d'Interprétation A</label>
//           <select
//             className="input input-bordered"
//             value={interpretationA?.type || 'text'}
//             onChange={(e) =>
//               handleInterpretationChange(
//                 'interpretationA',
//                 e.target.value,
//                 interpretationA?.content || { columns: [], rows: [] }
//               )
//             }
//           >
//             <option value="text">Texte</option>
//             <option value="table">Tableau</option>
//           </select>
//         </div>
//         {interpretationA?.type === 'table' && (
//           <div className="form-control">
//             <label className="label">Tableau de l'Interprétation A</label>
//             <div>
//               <button
//                 type="button"
//                 className="btn btn-primary"
//                 onClick={() => handleAddColumn('interpretationA')}
//               >
//                 Ajouter une colonne
//               </button>
//               <button
//                 type="button"
//                 className="btn btn-primary ml-2"
//                 onClick={() => handleAddRow('interpretationA')}
//               >
//                 Ajouter une ligne
//               </button>
//             </div>
//             <table className="table table-bordered mt-2">
//               <thead>
//                 <tr>
//                   {interpretationA?.content.columns.map((col, colIndex) => (
//                     <th key={colIndex}>
//                       <input
//                         type="text"
//                         className="input input-bordered"
//                         value={col}
//                         onChange={(e) =>
//                           handleColumnTitleChange(
//                             'interpretationA',
//                             colIndex,
//                             e.target.value
//                           )
//                         }
//                       />
//                       <button
//                         type="button"
//                         className="btn btn-error btn-sm mt-1 mb-1"
//                         onClick={() =>
//                           handleRemoveColumn('interpretationA', colIndex)
//                         }
//                       >
//                         Supprimer la colonne
//                       </button>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {interpretationA?.content.rows.map((row, rowIndex) => (
//                   <tr key={rowIndex}>
//                     {row.map((cell, colIndex) => (
//                       <td key={colIndex}>
//                         <input
//                           type="text"
//                           className="input input-bordered w-full"
//                           value={cell}
//                           onChange={(e) =>
//                             handleCellChange(
//                               'interpretationA',
//                               rowIndex,
//                               colIndex,
//                               e.target.value
//                             )
//                           }
//                         />
//                       </td>
//                     ))}
//                     <td>
//                       <button
//                         type="button"
//                         className="btn btn-error btn-sm"
//                         onClick={() =>
//                           handleRemoveRow('interpretationA', rowIndex)
//                         }
//                       >
//                         Supprimer la ligne
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//         {interpretationA?.type === 'text' && (
//           <div className="form-control">
//             <label className="label">Contenu de l'Interprétation A</label>
//             <textarea
//               className="textarea textarea-bordered"
//               name="interpretationAContent"
//               value={interpretationA?.content}
//               onChange={(e) =>
//                 handleInterpretationChange(
//                   'interpretationA',
//                   interpretationA?.type,
//                   e.target.value
//                 )
//               }
//             />
//           </div>
//         )}

//         {/* Gestion de l'interprétation B */}
//         <div className="form-control">
//           <label className="label">Type d'Interprétation B</label>
//           <select
//             className="input input-bordered"
//             value={interpretationB?.type || 'text'}
//             onChange={(e) =>
//               handleInterpretationChange(
//                 'interpretationB',
//                 e.target.value,
//                 interpretationB?.content || { columns: [], rows: [] }
//               )
//             }
//           >
//             <option value="text">Texte</option>
//             <option value="table">Tableau</option>
//           </select>
//         </div>
//         {interpretationB?.type === 'table' && (
//           <div className="form-control">
//             <label className="label">Tableau de l'Interprétation B</label>
//             <div>
//               <button
//                 type="button"
//                 className="btn btn-primary"
//                 onClick={() => handleAddColumn('interpretationB')}
//               >
//                 Ajouter une colonne
//               </button>
//               <button
//                 type="button"
//                 className="btn btn-primary ml-2"
//                 onClick={() => handleAddRow('interpretationB')}
//               >
//                 Ajouter une ligne
//               </button>
//             </div>
//             <table className="table table-bordered mt-2">
//               <thead>
//                 <tr>
//                   {interpretationB?.content.columns.map((col, colIndex) => (
//                     <th key={colIndex}>
//                       <input
//                         type="text"
//                         className="input input-bordered"
//                         value={col}
//                         onChange={(e) =>
//                           handleColumnTitleChange(
//                             'interpretationB',
//                             colIndex,
//                             e.target.value
//                           )
//                         }
//                       />
//                       <button
//                         type="button"
//                         className="btn btn-error btn-sm mt-1 mb-1"
//                         onClick={() =>
//                           handleRemoveColumn('interpretationB', colIndex)
//                         }
//                       >
//                         Supprimer la colonne
//                       </button>
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {interpretationB?.content.rows.map((row, rowIndex) => (
//                   <tr key={rowIndex}>
//                     {row.map((cell, colIndex) => (
//                       <td key={colIndex}>
//                         <input
//                           type="text"
//                           className="input input-bordered w-full"
//                           value={cell}
//                           onChange={(e) =>
//                             handleCellChange(
//                               'interpretationB',
//                               rowIndex,
//                               colIndex,
//                               e.target.value
//                             )
//                           }
//                         />
//                       </td>
//                     ))}
//                     <td>
//                       <button
//                         type="button"
//                         className="btn btn-error btn-sm"
//                         onClick={() =>
//                           handleRemoveRow('interpretationB', rowIndex)
//                         }
//                       >
//                         Supprimer la ligne
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//         {interpretationB?.type === 'text' && (
//           <div className="form-control">
//             <label className="label">Contenu de l'Interprétation B</label>
//             <textarea
//               className="textarea textarea-bordered"
//               name="interpretationBContent"
//               value={interpretationB?.content}
//               onChange={(e) =>
//                 handleInterpretationChange(
//                   'interpretationB',
//                   interpretationB?.type,
//                   e.target.value
//                 )
//               }
//             />
//           </div>
//         )}

//         {/* Ajout de champs pour les machines */}
//         <div>
//           <label className="text-sm font-medium base-content">
//             Valeur d'interpretation Machine A
//           </label>
//           <br></br>
//           <textarea
//             type="text"
//             value={valeurMachineA}
//             onChange={(e) => setValeurMachineA(e.target.value)}
//             className="input input-bordered input-primary w-full max-w-xs"
//             maxLength="600"
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium base-content">
//             Valeur d'interpretation Machine B
//           </label>
//           <br></br>
//           <textarea
//             type="text"
//             value={valeurMachineB}
//             onChange={(e) => setValeurMachineB(e.target.value)}
//             className="input input-bordered input-primary w-full max-w-xs"
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium base-content">Machine A</label>
//           <br></br>
//           <input
//             type="text"
//             value={machineA}
//             onChange={(e) => setMachineA(e.target.value)}
//             className="input input-bordered input-primary w-full max-w-xs"
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium base-content">Machine B</label>
//           <br></br>
//           <input
//             type="text"
//             value={machineB}
//             onChange={(e) => setMachineB(e.target.value)}
//             className="input input-bordered input-primary w-full max-w-xs"
//           />
//         </div>
//         <div>
//           <label className="text-sm font-medium base-content">
//             Conclusions
//           </label>
//           <div>
//             <input
//               type="text"
//               value={newConclusion}
//               onChange={(e) => setNewConclusion(e.target.value)}
//               className="input input-bordered input-primary w-full max-w-xs"
//             />
//             <button
//               type="button"
//               onClick={handleAddConclusion}
//               className="btn btn-sm btn-primary ml-2"
//             >
//               Ajouter Conclusion
//             </button>
//           </div>
//           {conclusions.map((conclusion, index) => (
//             <div key={index} className="flex justify-between items-center mt-2">
//               <span className="text-base-content text-opacity-80">
//                 {conclusion}
//               </span>
//               <button
//                 type="button"
//                 onClick={() => handleRemoveConclusion(index)}
//                 className="btn btn-error btn-sm"
//               >
//                 Supprimer
//               </button>
//             </div>
//           ))}
//         </div>
//         {isLoading && (
//           <div className="flex justify-center items-center">
//             <div className="loading"></div>
//           </div>
//         )}
//         <button type="submit" className="btn btn-primary mt-4">
//           Ajouter un test
//         </button>
//       </form>
//     </>
//   )
// }

// AddTestForm.propTypes = {
//   onTestChange: PropTypes.func.isRequired,
// }

// export default AddTestForm
import { useState } from 'react'
import PropTypes from 'prop-types'

function AddTestForm({ onTestChange }) {
  const [nom, setNom] = useState('')
  const [description, setDescription] = useState('')
  const [prixAssurance, setPrixAssurance] = useState('260')
  const [prixIpm, setPrixIpm] = useState('200')
  const [prixPaf, setPrixPaf] = useState('220')
  const [coeficiantB, setCoeficiantB] = useState('')
  const [categories, setCategories] = useState('')
  const [valeur, setValeur] = useState('')
  const [prixSococim, setPrixSococim] = useState('180')
  const [prixClinique, setPrixClinique] = useState('220')
  const [interpretationA, setInterpretationA] = useState({
    type: 'text',
    content: { columns: [], rows: [] },
  })
  const [interpretationB, setInterpretationB] = useState({
    type: 'text',
    content: { columns: [], rows: [] },
  })

  // Ajout : gestion des nouveaux champs
  const [valeurMachineA, setValeurMachineA] = useState('')
  const [valeurMachineB, setValeurMachineB] = useState('')
  const [machineA, setMachineA] = useState('')
  const [machineB, setMachineB] = useState('')

  // conclusion
  const [conclusions, setConclusions] = useState([]) // Pour stocker les conclusions
  const [newConclusion, setNewConclusion] = useState('') // Pour ajouter une nouvelle conclusion

  const [isLoading, setIsLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(true)

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  const handleAddConclusion = () => {
    if (newConclusion.trim() !== '') {
      setConclusions([...conclusions, newConclusion])
      setNewConclusion('') // Réinitialiser après l'ajout
    }
  }

  const handleRemoveConclusion = (index) => {
    setConclusions(conclusions.filter((_, idx) => idx !== index))
  }

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
          prixClinique,
          coeficiantB,
          categories,
          valeur,
          prixSococim, // Nouveau champ pour le prix Sococim
          interpretationA,
          interpretationB,
          valeurMachineA,
          valeurMachineB,
          machineA,
          machineB,
          conclusions,
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
    setPrixClinique('')
    setPrixPaf('')
    setCoeficiantB('')
    setCategories('')
    setValeur('')
    setPrixSococim('')
    setInterpretationA({ type: 'text', content: { columns: [], rows: [] } })
    setInterpretationB({ type: 'text', content: { columns: [], rows: [] } })
    setConclusions([])
    setValeurMachineA('')
    setValeurMachineB('')
    setMachineA('')
    setMachineB('')
  }

  const categoryOptions = [
    'BIOCHIMIE SANGUINE',
    'BIOCHIMIE URINAIRE',
    'IMMUNOLOGIE-SEROLOGIE VIRALE',
    'ENDOCRINOLOGIE',
    'IMMUNOLOGIE-AUTOIMMUNITE',
    'IMMUNOLOGIE',
    'INFECTIOLOGIE',
    'IMMUNOLOGIE-SEROLOGIE BACTERIENNE',
    'ALLERGIE',
    'HEMATOLOGIE',
    'HEMATOLOGIE - HEMOSTASE',
    'BIOCHIMIE',
    'ANATOMO-PATHOLOGIE',
    'BIOLOGIE DE LA REPRODUCTION',
    'MYCOLOGIE',
    'GENETIQUE',
    'IMMUNOCHIMIE SELLES',
    'MARQUEUR TUMORAL',
    'INFECTIOLOGIE - BACTERIOLOGIE',
    'CYTOLOGIE',
    'INFECTIOLOGIE - PARASITOLOGIE',
    'BIOCHIMIE - GAZ',
  ]

  // Suppression des doublons
  const uniqueCategoryOptions = [...new Set(categoryOptions)]

  const handleInterpretationChange = (name, type, content) => {
    if (name === 'interpretationA') {
      setInterpretationA({ type, content })
    } else if (name === 'interpretationB') {
      setInterpretationB({ type, content })
    }
  }

  const handleAddColumn = (interpretationName) => {
    if (interpretationName === 'interpretationA') {
      const updatedColumns = [...interpretationA.content.columns, '']
      const updatedRows = interpretationA.content.rows.map((row) => [
        ...row,
        '',
      ])
      setInterpretationA({
        ...interpretationA,
        content: {
          ...interpretationA.content,
          columns: updatedColumns,
          rows: updatedRows,
        },
      })
    } else if (interpretationName === 'interpretationB') {
      const updatedColumns = [...interpretationB.content.columns, '']
      const updatedRows = interpretationB.content.rows.map((row) => [
        ...row,
        '',
      ])
      setInterpretationB({
        ...interpretationB,
        content: {
          ...interpretationB.content,
          columns: updatedColumns,
          rows: updatedRows,
        },
      })
    }
  }

  const handleAddRow = (interpretationName) => {
    if (interpretationName === 'interpretationA') {
      const newRow = Array(interpretationA.content.columns.length).fill('')
      setInterpretationA({
        ...interpretationA,
        content: {
          ...interpretationA.content,
          rows: [...interpretationA.content.rows, newRow],
        },
      })
    } else if (interpretationName === 'interpretationB') {
      const newRow = Array(interpretationB.content.columns.length).fill('')
      setInterpretationB({
        ...interpretationB,
        content: {
          ...interpretationB.content,
          rows: [...interpretationB.content.rows, newRow],
        },
      })
    }
  }

  const handleRemoveColumn = (interpretationName, colIndex) => {
    if (interpretationName === 'interpretationA') {
      const updatedColumns = interpretationA.content.columns.filter(
        (_, index) => index !== colIndex
      )
      const updatedRows = interpretationA.content.rows.map((row) =>
        row.filter((_, index) => index !== colIndex)
      )
      setInterpretationA({
        ...interpretationA,
        content: {
          columns: updatedColumns,
          rows: updatedRows,
        },
      })
    } else if (interpretationName === 'interpretationB') {
      const updatedColumns = interpretationB.content.columns.filter(
        (_, index) => index !== colIndex
      )
      const updatedRows = interpretationB.content.rows.map((row) =>
        row.filter((_, index) => index !== colIndex)
      )
      setInterpretationB({
        ...interpretationB,
        content: {
          columns: updatedColumns,
          rows: updatedRows,
        },
      })
    }
  }

  const handleRemoveRow = (interpretationName, rowIndex) => {
    if (interpretationName === 'interpretationA') {
      const updatedRows = interpretationA.content.rows.filter(
        (_, index) => index !== rowIndex
      )
      setInterpretationA({
        ...interpretationA,
        content: {
          ...interpretationA.content,
          rows: updatedRows,
        },
      })
    } else if (interpretationName === 'interpretationB') {
      const updatedRows = interpretationB.content.rows.filter(
        (_, index) => index !== rowIndex
      )
      setInterpretationB({
        ...interpretationB,
        content: {
          ...interpretationB.content,
          rows: updatedRows,
        },
      })
    }
  }

  const handleColumnTitleChange = (interpretationName, colIndex, value) => {
    if (interpretationName === 'interpretationA') {
      const updatedColumns = interpretationA.content.columns.map(
        (col, index) => (index === colIndex ? value : col)
      )
      setInterpretationA({
        ...interpretationA,
        content: {
          ...interpretationA.content,
          columns: updatedColumns,
        },
      })
    } else if (interpretationName === 'interpretationB') {
      const updatedColumns = interpretationB.content.columns.map(
        (col, index) => (index === colIndex ? value : col)
      )
      setInterpretationB({
        ...interpretationB,
        content: {
          ...interpretationB.content,
          columns: updatedColumns,
        },
      })
    }
  }

  const handleCellChange = (interpretationName, rowIndex, colIndex, value) => {
    if (interpretationName === 'interpretationA') {
      const updatedRows = interpretationA.content.rows.map((row, i) =>
        i === rowIndex
          ? row.map((cell, j) => (j === colIndex ? value : cell))
          : row
      )
      setInterpretationA({
        ...interpretationA,
        content: {
          ...interpretationA.content,
          rows: updatedRows,
        },
      })
    } else if (interpretationName === 'interpretationB') {
      const updatedRows = interpretationB.content.rows.map((row, i) =>
        i === rowIndex
          ? row.map((cell, j) => (j === colIndex ? value : cell))
          : row
      )
      setInterpretationB({
        ...interpretationB,
        content: {
          ...interpretationB.content,
          rows: updatedRows,
        },
      })
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
          <label className="text-sm font-medium base-content">Nom</label>
          <br />
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
          <br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">
            Coeficiant B
          </label>
          <br />
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
          <br />
          <input
            type="number"
            value={prixAssurance}
            onChange={(e) => setPrixAssurance(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">Prix IPM</label>
          <br />
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
          <br />
          <input
            type="number"
            value={prixSococim}
            onChange={(e) => setPrixSococim(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">
            Prix Clinique
          </label>
          <br />
          <input
            type="number"
            value={prixClinique}
            onChange={(e) => setPrixClinique(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">Prix PAF</label>
          <br />
          <input
            type="number"
            value={prixPaf}
            onChange={(e) => setPrixPaf(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">Matière</label>
          <br />
          <select
            value={categories}
            onChange={(e) => setCategories(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          >
            <option value="" disabled>
              Sélectionner une catégorie
            </option>
            {uniqueCategoryOptions.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Gestion de l'interprétation A */}
        <div className="form-control">
          <label className="label">Type d'Interprétation A</label>
          <select
            className="input input-bordered"
            value={interpretationA?.type || 'text'}
            onChange={(e) =>
              handleInterpretationChange(
                'interpretationA',
                e.target.value,
                interpretationA?.content || { columns: [], rows: [] }
              )
            }
          >
            <option value="text">Texte</option>
            <option value="table">Tableau</option>
          </select>
        </div>
        {interpretationA?.type === 'table' && (
          <div className="form-control">
            <label className="label">Tableau de l'Interprétation A</label>
            <div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleAddColumn('interpretationA')}
              >
                Ajouter une colonne
              </button>
              <button
                type="button"
                className="btn btn-primary ml-2"
                onClick={() => handleAddRow('interpretationA')}
              >
                Ajouter une ligne
              </button>
            </div>
            <table className="table table-bordered mt-2">
              <thead>
                <tr>
                  {interpretationA?.content.columns.map((col, colIndex) => (
                    <th key={colIndex}>
                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          className="btn btn-error btn-sm mb-1"
                          onClick={() =>
                            handleRemoveColumn('interpretationA', colIndex)
                          }
                        >
                          Supprimer la colonne
                        </button>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={col}
                          onChange={(e) =>
                            handleColumnTitleChange(
                              'interpretationA',
                              colIndex,
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {interpretationA?.content.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={cell}
                          onChange={(e) =>
                            handleCellChange(
                              'interpretationA',
                              rowIndex,
                              colIndex,
                              e.target.value
                            )
                          }
                        />
                      </td>
                    ))}
                    <td>
                      <button
                        type="button"
                        className="btn btn-error btn-sm"
                        onClick={() =>
                          handleRemoveRow('interpretationA', rowIndex)
                        }
                      >
                        Supprimer la ligne
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {interpretationA?.type === 'text' && (
          <div className="form-control">
            <label className="label">Contenu de l'Interprétation A</label>
            <textarea
              className="textarea textarea-bordered"
              name="interpretationAContent"
              value={interpretationA?.content}
              onChange={(e) =>
                handleInterpretationChange(
                  'interpretationA',
                  interpretationA?.type,
                  e.target.value
                )
              }
            />
          </div>
        )}

        {/* Gestion de l'interprétation B */}
        <div className="form-control">
          <label className="label">Type d'Interprétation B</label>
          <select
            className="input input-bordered"
            value={interpretationB?.type || 'text'}
            onChange={(e) =>
              handleInterpretationChange(
                'interpretationB',
                e.target.value,
                interpretationB?.content || { columns: [], rows: [] }
              )
            }
          >
            <option value="text">Texte</option>
            <option value="table">Tableau</option>
          </select>
        </div>
        {interpretationB?.type === 'table' && (
          <div className="form-control">
            <label className="label">Tableau de l'Interprétation B</label>
            <div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleAddColumn('interpretationB')}
              >
                Ajouter une colonne
              </button>
              <button
                type="button"
                className="btn btn-primary ml-2"
                onClick={() => handleAddRow('interpretationB')}
              >
                Ajouter une ligne
              </button>
            </div>
            <table className="table table-bordered mt-2">
              <thead>
                <tr>
                  {interpretationB?.content.columns.map((col, colIndex) => (
                    <th key={colIndex}>
                      <div className="flex flex-col items-center">
                        <button
                          type="button"
                          className="btn btn-error btn-sm mb-1"
                          onClick={() =>
                            handleRemoveColumn('interpretationB', colIndex)
                          }
                        >
                          Supprimer la colonne
                        </button>
                        <input
                          type="text"
                          className="input input-bordered"
                          value={col}
                          onChange={(e) =>
                            handleColumnTitleChange(
                              'interpretationB',
                              colIndex,
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {interpretationB?.content.rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex}>
                        <input
                          type="text"
                          className="input input-bordered w-full"
                          value={cell}
                          onChange={(e) =>
                            handleCellChange(
                              'interpretationB',
                              rowIndex,
                              colIndex,
                              e.target.value
                            )
                          }
                        />
                      </td>
                    ))}
                    <td>
                      <button
                        type="button"
                        className="btn btn-error btn-sm"
                        onClick={() =>
                          handleRemoveRow('interpretationB', rowIndex)
                        }
                      >
                        Supprimer la ligne
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {interpretationB?.type === 'text' && (
          <div className="form-control">
            <label className="label">Contenu de l'Interprétation B</label>
            <textarea
              className="textarea textarea-bordered"
              name="interpretationBContent"
              value={interpretationB?.content}
              onChange={(e) =>
                handleInterpretationChange(
                  'interpretationB',
                  interpretationB?.type,
                  e.target.value
                )
              }
            />
          </div>
        )}

        {/* Ajout de champs pour les machines */}
        <div>
          <label className="text-sm font-medium base-content">
            Valeur d'interprétation Machine A
          </label>
          <br />
          <textarea
            type="text"
            value={valeurMachineA}
            onChange={(e) => setValeurMachineA(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
            maxLength="600"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">
            Valeur d'interprétation Machine B
          </label>
          <br />
          <textarea
            type="text"
            value={valeurMachineB}
            onChange={(e) => setValeurMachineB(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">Machine A</label>
          <br />
          <input
            type="text"
            value={machineA}
            onChange={(e) => setMachineA(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">Machine B</label>
          <br />
          <input
            type="text"
            value={machineB}
            onChange={(e) => setMachineB(e.target.value)}
            className="input input-bordered input-primary w-full max-w-xs"
          />
        </div>
        <div>
          <label className="text-sm font-medium base-content">
            Conclusions
          </label>
          <div>
            <input
              type="text"
              value={newConclusion}
              onChange={(e) => setNewConclusion(e.target.value)}
              className="input input-bordered input-primary w-full max-w-xs"
            />
            <button
              type="button"
              onClick={handleAddConclusion}
              className="btn btn-sm btn-primary ml-2"
            >
              Ajouter Conclusion
            </button>
          </div>
          {conclusions.map((conclusion, index) => (
            <div key={index} className="flex justify-between items-center mt-2">
              <span className="text-base-content text-opacity-80">
                {conclusion}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveConclusion(index)}
                className="btn btn-error btn-sm"
              >
                Supprimer
              </button>
            </div>
          ))}
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
