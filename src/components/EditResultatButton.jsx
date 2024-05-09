// import { useState, useEffect } from 'react'
// import PropTypes from 'prop-types'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faEdit } from '@fortawesome/free-solid-svg-icons'

// function EditResultatButton({ resultatId, onResultatUpdated }) {
//   const [showModal, setShowModal] = useState(false)
//   const [formData, setFormData] = useState({
//     valeur: '',
//     statutMachine: false,
//     metode: '',
//     statutInterpretation: false,
//     typePrelevement: '',
//     datePrelevement: '',
//     remarque: '',
//   })
//   const [formErrors, setFormErrors] = useState({})
//   const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

//   useEffect(() => {
//     if (showModal && resultatId) {
//       fetchResultatData(resultatId)
//     }
//   }, [showModal, resultatId])

//   const fetchResultatData = async (resultatId) => {
//     try {
//       const userInfo = JSON.parse(localStorage.getItem('userInfo'))
//       const token = userInfo?.token
//       const response = await fetch(`${apiUrl}/api/resultats/${resultatId}`, {
//         method: 'GET',
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       })
//       const data = await response.json()
//       if (data.success) {
//         const datePrelevementFormatted = data.data.datePrelevement
//           ? new Date(data.data.datePrelevement).toISOString().slice(0, 16) // Format the date to YYYY-MM-DDThh:mm
//           : ''
//         setFormData({
//           valeur: data.data.valeur,
//           statutInterpretation: data.data.statutInterpretation,
//           typePrelevement: data.data.typePrelevement,
//           datePrelevement: datePrelevementFormatted,
//           remarque: data.data.remarque,
//           methode: data.data.methode,
//           statutMachine: data.data.statutMachine,
//         })
//       }
//     } catch (error) {
//       console.error('Erreur lors de la récupération du résultat:', error)
//     }
//   }

//   const handleChange = (e) => {
//     const { name, value } = e.target
//     if (name === 'statutInterpretation') {
//       setFormData((prevFormData) => ({
//         ...prevFormData,
//         [name]: value === 'true',
//       }))
//     } else {
//       setFormData((prevFormData) => ({
//         ...prevFormData,
//         [name]: value,
//       }))
//     }
//   }

//   const validateForm = () => {
//     let errors = {}
//     if (!formData.valeur.trim()) errors.valeur = 'La valeur est obligatoire.'
//     return errors
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     const errors = validateForm()
//     setFormErrors(errors)

//     if (Object.keys(errors).length === 0) {
//       try {
//         const userInfo = JSON.parse(localStorage.getItem('userInfo'))
//         const token = userInfo?.token
//         const response = await fetch(`${apiUrl}/api/resultats/${resultatId}`, {
//           method: 'PUT',
//           headers: {
//             Authorization: `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(formData),
//         })
//         const data = await response.json()
//         if (data.success) {
//           setShowModal(false)
//           onResultatUpdated() // Callback to refresh resultat data
//         } else {
//           console.error('La mise à jour a échoué.')
//         }
//       } catch (error) {
//         console.error('Erreur lors de la mise à jour du résultat:', error)
//       }
//     }
//   }

//   const renderError = (fieldref) => {
//     if (formErrors[fieldref]) {
//       return (
//         <span className="text-red-500 text-xs">{formErrors[fieldref]}</span>
//       )
//     }
//     return null
//   }

//   return (
//     <>
//       <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
//         <FontAwesomeIcon icon={faEdit} />
//       </button>
//       {showModal && (
//         <div className="modal modal-open">
//           <div className="modal-box ">
//             <h3 className="font-bold text-lg">Modifier le Résultat</h3>
//             <form onSubmit={handleSubmit}>
//               <div className="form-control">
//                 <label className="label">Valeur</label>
//                 <input
//                   className="input input-bordered"
//                   type="text"
//                   name="valeur"
//                   value={formData.valeur}
//                   onChange={handleChange}
//                 />
//                 {renderError('valeur')}
//               </div>

//               <div className="form-control">
//                 <label className="label">Statut de l'Interprétation</label>
//                 <select
//                   className="select select-bordered"
//                   name="statutInterpretation"
//                   value={formData.statutInterpretation}
//                   onChange={handleChange}
//                 >
//                   <option value="false">Non</option>
//                   <option value="true">Oui</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="label">Machine utiliser</label>
//                 <select
//                   className="select select-bordered"
//                   name="statutMachine"
//                   value={formData.statutMachine}
//                   onChange={handleChange}
//                 >
//                   <option value="true">A</option>
//                   <option value="false">B</option>
//                 </select>
//               </div>

//               <div className="form-control">
//                 <label className="label">Methode</label>
//                 <input
//                   className="input input-bordered"
//                   type="text"
//                   name="methode"
//                   value={formData.methode}
//                   onChange={handleChange}
//                 />
//               </div>
//               <div className="form-control">
//                 <label className="label">Type de Prélèvement</label>
//                 <input
//                   className="input input-bordered"
//                   type="text"
//                   name="typePrelevement"
//                   value={formData.typePrelevement}
//                   onChange={handleChange}
//                 />
//               </div>
//               <div className="form-control">
//                 <label className="label">Date de Prélèvement</label>
//                 <input
//                   className="input input-bordered"
//                   type="datetime-local"
//                   name="datePrelevement"
//                   value={formData.datePrelevement}
//                   onChange={handleChange}
//                 />
//               </div>
//               <div className="form-control">
//                 <label className="label">Remarque</label>
//                 <textarea
//                   className="textarea textarea-bordered"
//                   name="remarque"
//                   value={formData.remarque}
//                   onChange={handleChange}
//                 />
//               </div>
//               <div className="modal-action">
//                 <button className="btn btn-primary" type="submit">
//                   Enregistrer
//                 </button>
//                 <button className="btn" onClick={() => setShowModal(false)}>
//                   Annuler
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </>
//   )
// }

// EditResultatButton.propTypes = {
//   resultatId: PropTypes.string.isRequired,
//   onResultatUpdated: PropTypes.func.isRequired,
// }

// export default EditResultatButton

import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

function EditResultatButton({ resultatId, onResultatUpdated }) {
  const [showModal, setShowModal] = useState(false)
  const [currentView, setCurrentView] = useState('simple')
  const [formData, setFormData] = useState({
    valeur: '',
    statutMachine: false,
    metode: '',
    statutInterpretation: false,
    typePrelevement: '',
    datePrelevement: '',
    remarque: '',
    macroscopique: '',
    microscopique: {
      leucocytes: '',
      hematies: '',
      cristaux: '',
      cellulesEpitheliales: '',
      elementsLevuriforme: '',
      filamentsMyceliens: '',
      trichomonasVaginalis: '',
      cylindres: '',
    },
    culture: {
      description: '',
      germeIdentifie: '',
    },
    gram: '',
    conclusion: '',
    antibiogrammes: [],
  })
  const [formErrors, setFormErrors] = useState({})
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    if (showModal && resultatId) {
      fetchResultatData(resultatId)
    }
  }, [showModal, resultatId])

  const fetchResultatData = async (resultatId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/resultats/${resultatId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        const datePrelevementFormatted = data.data.datePrelevement
          ? new Date(data.data.datePrelevement).toISOString().slice(0, 16) // Format the date to YYYY-MM-DDThh:mm
          : ''
        setFormData({
          valeur: data.data.valeur,
          statutInterpretation: data.data.statutInterpretation,
          typePrelevement: data.data.typePrelevement,
          datePrelevement: datePrelevementFormatted,
          remarque: data.data.remarque,
          methode: data.data.methode,
          statutMachine: data.data.statutMachine,
          macroscopique: data.data.observations?.macroscopique || '',
          microscopique: {
            leucocytes: data.data.observations?.microscopique?.leucocytes || '',
            hematies: data.data.observations?.microscopique?.hematies || '',
            cellulesEpitheliales:
              data.data.observations?.microscopique?.cellulesEpitheliales || '',
            elementsLevuriforme:
              data.data.observations?.microscopique?.elementsLevuriforme || '',
            filamentsMyceliens:
              data.data.observations?.microscopique?.filamentsMyceliens || '',
            trichomonasVaginalis:
              data.data.observations?.microscopique?.trichomonasVaginalis || '',
            cristaux: data.data.observations?.microscopique?.cristaux || '',
            cylindres: data.data.observations?.microscopique?.cylindres || '',
          },
          culture: {
            description: data.data.observations?.culture?.description || '',
            germeIdentifie:
              data.data.observations?.culture?.germeIdentifie || '',
          },
          gram: data.data.observations?.gram || '',
          conclusion: data.data.observations?.conclusion || '',
          antibiogrammes: data.data.observations?.antibiogrammes || [],
        })
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du résultat:', error)
    }
  }

  const handleChangeComplex = (field, subfield, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: subfield ? { ...prev[field], [subfield]: value } : value,
    }))
  }

  const handleAddAntibiogramme = () => {
    setFormData((prev) => ({
      ...prev,
      antibiogrammes: [
        ...prev.antibiogrammes,
        { antibiotique: '', sensibilite: '' },
      ],
    }))
  }

  const handleUpdateAntibiogramme = (index, field, value) => {
    const updated = formData.antibiogrammes.map((item, idx) =>
      idx === index ? { ...item, [field]: value } : item
    )
    setFormData((prev) => ({
      ...prev,
      antibiogrammes: updated,
    }))
  }

  const handleRemoveAntibiogramme = (index) => {
    setFormData((prev) => ({
      ...prev,
      antibiogrammes: prev.antibiogrammes.filter((_, idx) => idx !== index),
    }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'statutInterpretation') {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value === 'true',
      }))
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }))
    }
  }

  const validateForm = () => {
    let errors = {}
    if (!formData.valeur.trim()) errors.valeur = 'La valeur est obligatoire.'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validateForm()
    setFormErrors(errors)

    if (Object.keys(errors).length === 0) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const token = userInfo?.token
        const response = await fetch(`${apiUrl}/api/resultats/${resultatId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        const data = await response.json()
        if (data.success) {
          console.log(data)
          setShowModal(false)
          onResultatUpdated() // Callback to refresh resultat data
        } else {
          console.error('La mise à jour a échoué.')
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du résultat:', error)
      }
    }
  }

  const renderError = (fieldref) => {
    if (formErrors[fieldref]) {
      return (
        <span className="text-red-500 text-xs">{formErrors[fieldref]}</span>
      )
    }
    return null
  }

  return (
    <>
      <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
        <FontAwesomeIcon icon={faEdit} />
      </button>
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box ">
            <h3 className="font-bold text-lg">Modifier le Résultat</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">Choisissez le genre de resultat</label>
                <label className="cursor-pointer label">
                  <span className="label-text mr-2">Valeur simple</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={currentView === 'complexe'}
                    onChange={() =>
                      setCurrentView(
                        currentView === 'simple' ? 'complexe' : 'simple'
                      )
                    }
                  />
                  <span className="label-text ml-2">Valeur complexe</span>
                </label>
              </div>

              {currentView === 'simple' ? (
                <>
                  {/* Ajouter ici les champs de formulaire pour la vue simple */}
                  <div className="form-control">
                    <label className="label">Valeur</label>
                    <input
                      className="input input-bordered"
                      type="text"
                      name="valeur"
                      value={formData.valeur}
                      onChange={handleChange}
                    />
                    {/* {renderError('valeur')} */}
                  </div>

                  <div className="form-control">
                    <label className="label">Statut de l'Interprétation</label>
                    <select
                      className="select select-bordered"
                      name="statutInterpretation"
                      value={formData.statutInterpretation}
                      onChange={handleChange}
                    >
                      <option value="false">Non</option>
                      <option value="true">Oui</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Machine utiliser</label>
                    <select
                      className="select select-bordered"
                      name="statutMachine"
                      value={formData.statutMachine}
                      onChange={handleChange}
                    >
                      <option value="true">A</option>
                      <option value="false">B</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">Methode</label>
                    <input
                      className="input input-bordered"
                      type="text"
                      name="methode"
                      value={formData.methode}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">Type de Prélèvement</label>
                    <input
                      className="input input-bordered"
                      type="text"
                      name="typePrelevement"
                      value={formData.typePrelevement}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">Date de Prélèvement</label>
                    <input
                      className="input input-bordered"
                      type="datetime-local"
                      name="datePrelevement"
                      value={formData.datePrelevement}
                      onChange={handleChange}
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Ajouter ici les champs de formulaire pour la vue complexe */}
                  <div id="complexe">
                    <div>
                      <label className="label">Macroscopique</label>
                      <input
                        type="text"
                        value={formData.macroscopique}
                        onChange={(e) =>
                          handleChangeComplex(
                            'macroscopique',
                            null,
                            e.target.value
                          )
                        }
                        className="input input-bordered"
                      />
                    </div>
                    <div>
                      <label className="label">Leucocytes</label>
                      <input
                        type="text"
                        value={formData.microscopique.leucocytes}
                        onChange={(e) =>
                          handleChangeComplex(
                            'microscopique',
                            'leucocytes',
                            e.target.value
                          )
                        }
                        className="input input-bordered"
                      />
                    </div>
                    <div>
                      <label className="label">Hématies</label>
                      <input
                        type="text"
                        value={formData.microscopique.hematies}
                        onChange={(e) =>
                          handleChangeComplex(
                            'microscopique',
                            'hematies',
                            e.target.value
                          )
                        }
                        className="input input-bordered"
                      />
                    </div>
                    <div>
                      <label className="label">Cristaux</label>
                      <select
                        className="select select-bordered"
                        value={formData.microscopique.cristaux}
                        onChange={(e) =>
                          handleChangeComplex(
                            'microscopique',
                            'cristaux',
                            e.target.value
                          )
                        }
                      >
                        <option value="">Non concerné</option>
                        <option value="Absence">Absence</option>
                        <option value="Présence">Présence</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Cellules épithéliales</label>
                      <select
                        className="select select-bordered"
                        value={formData.microscopique.cellulesEpitheliales}
                        onChange={(e) =>
                          handleChangeComplex(
                            'microscopique',
                            'cellulesEpitheliales',
                            e.target.value
                          )
                        }
                      >
                        <option value="">Non concerné</option>
                        <option value="Absence">Absence</option>
                        <option value="Présence">Présence</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Eléments levuriformes</label>
                      <select
                        className="select select-bordered"
                        value={formData.microscopique.elementsLevuriforme}
                        onChange={(e) =>
                          handleChangeComplex(
                            'microscopique',
                            'elementsLevuriforme',
                            e.target.value
                          )
                        }
                      >
                        <option value="">Non concerné</option>
                        <option value="Absence">Absence</option>
                        <option value="Présence">Présence</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Filaments mycéliens</label>
                      <select
                        className="select select-bordered"
                        value={formData.microscopique.filamentsMyceliens}
                        onChange={(e) =>
                          handleChangeComplex(
                            'microscopique',
                            'filamentsMyceliens',
                            e.target.value
                          )
                        }
                      >
                        <option value="">Non concerné</option>
                        <option value="Absence">Absence</option>
                        <option value="Présence">Présence</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">
                        Trichomonas vaginalis / Autres parasites
                      </label>
                      <select
                        className="select select-bordered"
                        value={formData.microscopique.trichomonasVaginalis}
                        onChange={(e) =>
                          handleChangeComplex(
                            'microscopique',
                            'trichomonasVaginalis',
                            e.target.value
                          )
                        }
                      >
                        <option value="">Non concerné</option>
                        <option value="Absence">Absence</option>
                        <option value="Présence">Présence</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Cylindres</label>
                      <select
                        className="select select-bordered"
                        value={formData.microscopique.cylindres}
                        onChange={(e) =>
                          handleChangeComplex(
                            'microscopique',
                            'cylindres',
                            e.target.value
                          )
                        }
                      >
                        <option value="">Non concerné</option>
                        <option value="Absence">Absence</option>
                        <option value="Présence">Présence</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Culture: Description</label>
                      <input
                        type="text"
                        value={formData.culture.description}
                        onChange={(e) =>
                          handleChangeComplex(
                            'culture',
                            'description',
                            e.target.value
                          )
                        }
                        className="input input-bordered"
                      />
                    </div>
                    <div>
                      <label className="label">Culture: Germe Identifié</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.culture.germeIdentifie.input}
                          onChange={(e) => {
                            // Mettre à jour l'input seulement si le select est vide
                            if (!formData.culture.germeIdentifie.select) {
                              handleChangeComplex('culture', 'germeIdentifie', {
                                ...formData.culture.germeIdentifie,
                                input: e.target.value,
                                select: '',
                              })
                            }
                          }}
                          placeholder="Autre germe"
                          className="input input-bordered flex-1"
                          disabled={!!formData.culture.germeIdentifie.select}
                        />
                        <select
                          className="select select-bordered flex-1"
                          value={formData.culture.germeIdentifie.select}
                          onChange={(e) => {
                            // Mettre à jour le select seulement si l'input est vide
                            if (!formData.culture.germeIdentifie.input) {
                              handleChangeComplex('culture', 'germeIdentifie', {
                                ...formData.culture.germeIdentifie,
                                select: e.target.value,
                                input: '',
                              })
                            }
                          }}
                          disabled={!!formData.culture.germeIdentifie.input}
                        >
                          <option value="">Sélectionner un germe</option>
                          <option value="Germe1">Germe1</option>
                          <option value="Germe2">Germe2</option>
                          <option value="Germe3">Germe3</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="label">Gram</label>
                      <select
                        className="select select-bordered"
                        value={formData.gram}
                        onChange={(e) =>
                          handleChangeComplex('gram', null, e.target.value)
                        }
                      >
                        <option value="">Sélectionner un type de Gram</option>
                        <option value="Bacilles Gram négatif">
                          Bacilles Gram négatif
                        </option>
                        <option value="Bacilles Gram positif">
                          Bacilles Gram positif
                        </option>
                        <option value="Cocci Gram négatif">
                          Cocci Gram négatif
                        </option>
                        <option value="Cocci Gram positif">
                          Cocci Gram positif
                        </option>
                        <option value="Levures">Levures</option>
                      </select>
                    </div>

                    <div>
                      <label className="label">Conclusion</label>
                      <textarea
                        value={formData.conclusion}
                        onChange={(e) =>
                          handleChangeComplex(
                            'conclusion',
                            null,
                            e.target.value
                          )
                        }
                        className="textarea textarea-bordered"
                      />
                    </div>
                    <div>
                      {/* Antibiogrammes et leur gestion */}
                      <label className="label">Antibiogrammes</label>
                      {formData.antibiogrammes.map((antibio, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 mb-2"
                        >
                          <select
                            className="select select-bordered"
                            value={antibio.antibiotique}
                            onChange={(e) =>
                              handleUpdateAntibiogramme(
                                index,
                                'antibiotique',
                                e.target.value
                              )
                            }
                          >
                            <option value="">
                              Sélectionner un antibiotique
                            </option>
                            {/* Supposons que vous avez une liste d'antibiotiques à inclure ici */}
                          </select>
                          <select
                            className="select select-bordered"
                            value={antibio.sensibilite}
                            onChange={(e) =>
                              handleUpdateAntibiogramme(
                                index,
                                'sensibilite',
                                e.target.value
                              )
                            }
                          >
                            <option value="">Aucun</option>
                            <option value="S">Sensible</option>
                            <option value="I">Intermédiaire</option>
                            <option value="R">Résistant</option>
                          </select>
                          <button
                            className="btn btn-error btn-xs"
                            onClick={() => handleRemoveAntibiogramme(index)}
                          >
                            Supprimer
                          </button>
                        </div>
                      ))}
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleAddAntibiogramme}
                      >
                        Ajouter un antibiogramme
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className="form-control">
                <label className="label">Remarque</label>
                <textarea
                  className="textarea textarea-bordered"
                  name="remarque"
                  value={formData.remarque}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-action">
                <button className="btn btn-primary" type="submit">
                  Enregistrer
                </button>
                <button className="btn" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

EditResultatButton.propTypes = {
  resultatId: PropTypes.string.isRequired,
  onResultatUpdated: PropTypes.func.isRequired,
}

export default EditResultatButton
