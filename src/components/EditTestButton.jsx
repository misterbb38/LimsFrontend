import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit } from '@fortawesome/free-solid-svg-icons'

function EditTestButton({ testId, ontestUpdated }) {
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    prixAssurance: '',
    prixIpm: '',
    prixPaf: '',
    prixClinique: '',
    coeficiantB: '',
    nom: '',
    description: '',
    categories: '',
    valeurMachineA: '',
    valeurMachineB: '',
    machineA: '',
    machineB: '',
    interpretationA: { type: 'text', content: { columns: [], rows: [] } },
    interpretationB: { type: 'text', content: { columns: [], rows: [] } },
    prixSococim: '',
    conclusions: [],
  })

  const categories = [
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

  const [newConclusion, setNewConclusion] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    if (showModal && testId) {
      fetchtestData(testId)
    }
  }, [showModal, testId])

  const fetchtestData = async (testId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/test/${testId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (data.success) {
        setFormData({
          ...data.data,
          conclusions: data.data.conclusions || [],
          interpretationA: data.data.interpretationA || {
            type: 'text',
            content: { columns: [], rows: [] },
          },
          interpretationB: data.data.interpretationB || {
            type: 'text',
            content: { columns: [], rows: [] },
          },
        })
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du test:', error)
    }
  }

  const handleAddConclusion = () => {
    if (newConclusion.trim() !== '') {
      setFormData({
        ...formData,
        conclusions: [...formData.conclusions, newConclusion],
      })
      setNewConclusion('')
    }
  }

  const handleRemoveConclusion = (index) => {
    const updatedConclusions = formData.conclusions.filter(
      (_, idx) => idx !== index
    )
    setFormData({ ...formData, conclusions: updatedConclusions })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }

  const handleInterpretationChange = (name, type, content) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: { type, content },
    }))
  }

  const handleAddColumn = (interpretationName) => {
    setFormData((prevFormData) => {
      const updatedColumns = [
        ...prevFormData[interpretationName].content.columns,
        '',
      ]
      const updatedRows = prevFormData[interpretationName].content.rows.map(
        (row) => [...row, '']
      )
      return {
        ...prevFormData,
        [interpretationName]: {
          ...prevFormData[interpretationName],
          content: {
            ...prevFormData[interpretationName].content,
            columns: updatedColumns,
            rows: updatedRows,
          },
        },
      }
    })
  }

  const handleAddRow = (interpretationName) => {
    setFormData((prevFormData) => {
      const newRow = Array(
        prevFormData[interpretationName].content.columns.length
      ).fill('')
      const updatedRows = [
        ...prevFormData[interpretationName].content.rows,
        newRow,
      ]
      return {
        ...prevFormData,
        [interpretationName]: {
          ...prevFormData[interpretationName],
          content: {
            ...prevFormData[interpretationName].content,
            rows: updatedRows,
          },
        },
      }
    })
  }

  const handleRemoveColumn = (interpretationName, colIndex) => {
    setFormData((prevFormData) => {
      const updatedColumns = prevFormData[
        interpretationName
      ].content.columns.filter((_, index) => index !== colIndex)

      const updatedRows = prevFormData[interpretationName].content.rows.map(
        (row) => row.filter((_, index) => index !== colIndex)
      )

      return {
        ...prevFormData,
        [interpretationName]: {
          ...prevFormData[interpretationName],
          content: {
            columns: updatedColumns,
            rows: updatedRows,
          },
        },
      }
    })
  }

  const handleRemoveRow = (interpretationName, rowIndex) => {
    setFormData((prevFormData) => {
      const updatedRows = prevFormData[interpretationName].content.rows.filter(
        (_, index) => index !== rowIndex
      )

      return {
        ...prevFormData,
        [interpretationName]: {
          ...prevFormData[interpretationName],
          content: {
            ...prevFormData[interpretationName].content,
            rows: updatedRows,
          },
        },
      }
    })
  }

  const handleColumnTitleChange = (interpretationName, colIndex, value) => {
    setFormData((prevFormData) => {
      const updatedColumns = prevFormData[
        interpretationName
      ].content.columns.map((col, index) => (index === colIndex ? value : col))
      return {
        ...prevFormData,
        [interpretationName]: {
          ...prevFormData[interpretationName],
          content: {
            ...prevFormData[interpretationName].content,
            columns: updatedColumns,
          },
        },
      }
    })
  }

  const handleCellChange = (interpretationName, rowIndex, colIndex, value) => {
    setFormData((prevFormData) => {
      const updatedRows = prevFormData[interpretationName].content.rows.map(
        (row, i) =>
          i === rowIndex
            ? row.map((cell, j) => (j === colIndex ? value : cell))
            : row
      )
      return {
        ...prevFormData,
        [interpretationName]: {
          ...prevFormData[interpretationName],
          content: {
            ...prevFormData[interpretationName].content,
            rows: updatedRows,
          },
        },
      }
    })
  }

  const validateForm = () => {
    let errors = {}
    // Ajoute ici des validations supplémentaires si nécessaire
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
        const response = await fetch(`${apiUrl}/api/test/${testId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })
        const data = await response.json()
        if (data.success) {
          setShowToast(true)
          setTimeout(() => setShowToast(false), 3000)
          setShowModal(false)
          ontestUpdated()
        } else {
          console.error('La mise à jour a échoué.')
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du test:', error)
      }
    }
  }

  return (
    <>
      <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
        <FontAwesomeIcon icon={faEdit} />
      </button>
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl">
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">Nom</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">Prix Assurance</label>
                <input
                  className="input input-bordered"
                  type="number"
                  name="prixAssurance"
                  value={formData.prixAssurance}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control">
                <label className="label">Prix IPM</label>
                <input
                  className="input input-bordered"
                  type="number"
                  name="prixIpm"
                  value={formData.prixIpm}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control">
                <label className="label">Prix PAF</label>
                <input
                  className="input input-bordered"
                  type="number"
                  name="prixPaf"
                  value={formData.prixPaf}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control">
                <label className="label">Prix Clinique</label>
                <input
                  className="input input-bordered"
                  type="number"
                  name="prixClinique"
                  value={formData.prixClinique}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control">
                <label className="label">Prix Sococim</label>
                <input
                  className="input input-bordered"
                  type="number"
                  name="prixSococim"
                  value={formData.prixSococim}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control">
                <label className="label">Coeficiant B</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="coeficiantB"
                  value={formData.coeficiantB}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control">
                <label className="label">Machine A</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="machineA"
                  value={formData.machineA}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control">
                <label className="label">Machine B</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="machineB"
                  value={formData.machineB}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control">
                <label className="label">Valeur Machine A</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="valeurMachineA"
                  value={formData.valeurMachineA}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control">
                <label className="label">Valeur Machine B</label>
                <input
                  className="input input-bordered"
                  type="text"
                  name="valeurMachineB"
                  value={formData.valeurMachineB}
                  onChange={handleChange}
                />
              </div>

              <div className="form-control">
                <label className="label">Catégorie</label>
                <select
                  className="input input-bordered"
                  name="categories"
                  value={formData.categories}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Sélectionner une catégorie
                  </option>
                  {categories.map((category, index) => (
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
                  value={formData.interpretationA?.type || 'text'}
                  onChange={(e) =>
                    handleInterpretationChange(
                      'interpretationA',
                      e.target.value,
                      formData.interpretationA?.content || {
                        columns: [],
                        rows: [],
                      }
                    )
                  }
                >
                  <option value="text">Texte</option>
                  <option value="table">Tableau</option>
                </select>
              </div>
              {formData.interpretationA?.type === 'table' && (
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
                        {formData.interpretationA?.content.columns.map(
                          (col, colIndex) => (
                            <th key={colIndex}>
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
                              <button
                                type="button"
                                className="btn btn-error btn-sm mt-1"
                                onClick={() =>
                                  handleRemoveColumn(
                                    'interpretationA',
                                    colIndex
                                  )
                                }
                              >
                                Supprimer la colonne
                              </button>
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.interpretationA?.content.rows.map(
                        (row, rowIndex) => (
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
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {formData.interpretationA?.type === 'text' && (
                <div className="form-control">
                  <label className="label">Contenu de l'Interprétation A</label>
                  <textarea
                    className="textarea textarea-bordered"
                    name="interpretationAContent"
                    value={formData.interpretationA?.content}
                    onChange={(e) =>
                      handleInterpretationChange(
                        'interpretationA',
                        formData.interpretationA?.type,
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
                  value={formData.interpretationB?.type || 'text'}
                  onChange={(e) =>
                    handleInterpretationChange(
                      'interpretationB',
                      e.target.value,
                      formData.interpretationB?.content || {
                        columns: [],
                        rows: [],
                      }
                    )
                  }
                >
                  <option value="text">Texte</option>
                  <option value="table">Tableau</option>
                </select>
              </div>
              {formData.interpretationB?.type === 'table' && (
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
                        {formData.interpretationB?.content.columns.map(
                          (col, colIndex) => (
                            <th key={colIndex}>
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
                              <button
                                type="button"
                                className="btn btn-error btn-sm mt-1"
                                onClick={() =>
                                  handleRemoveColumn(
                                    'interpretationB',
                                    colIndex
                                  )
                                }
                              >
                                Supprimer la colonne
                              </button>
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.interpretationB?.content.rows.map(
                        (row, rowIndex) => (
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
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {formData.interpretationB?.type === 'text' && (
                <div className="form-control">
                  <label className="label">Contenu de l'Interprétation B</label>
                  <textarea
                    className="textarea textarea-bordered"
                    name="interpretationBContent"
                    value={formData.interpretationB?.content}
                    onChange={(e) =>
                      handleInterpretationChange(
                        'interpretationB',
                        formData.interpretationB?.type,
                        e.target.value
                      )
                    }
                  />
                </div>
              )}

              {/* Gestion des conclusions */}
              <div className="form-control">
                <label className="label">Conclusions</label>
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
                    className="btn btn-primary ml-2"
                  >
                    Ajouter Conclusion
                  </button>
                </div>
                {formData.conclusions.map((conclusion, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center mt-2"
                  >
                    <span>{conclusion}</span>
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

              {/* Autres champs et actions du formulaire */}
              <div className="modal-action">
                <button className="btn btn-primary" type="submit">
                  Enregistrer
                </button>
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showToast && (
        <div className="toast toast-center toast-end">
          <div className="alert alert-success">
            Test mis à jour avec succès.
          </div>
        </div>
      )}
    </>
  )
}

EditTestButton.propTypes = {
  testId: PropTypes.string.isRequired,
  ontestUpdated: PropTypes.func.isRequired,
}

export default EditTestButton
