import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye } from '@fortawesome/free-solid-svg-icons'

function ViewTestButton({ testId }) {
  const [formData, setFormData] = useState({
    status: '',
    prixAssurance: '',
    prixIpm: '',
    prixSococim: '',
    prixPaf: '',
    nom: '',
  })

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
  useEffect(() => {
    if (testId) {
      fetchtestData(testId)
    }
  }, [testId])

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
        setFormData(data.data)
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du test:', error)
    }
  }

  return (
    <>
      <font></font>
      <button
        className="btn btn-primary"
        onClick={() => document.getElementById('my_modal_5').showModal()}
      >
        <FontAwesomeIcon icon={faEye} />
      </button>
      <font></font>
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <font></font>
        <div className="modal-box">
          <h3 className="font-bold text-lg text-center mb-4">
            Détails du Test
          </h3>
          <div className="divider"></div>{' '}
          {/* Laissez cette div pour un visuel de séparation */}
          <div className="space-y-3 py-4">
            <div>
              <label className="font-semibold">Nom:</label>
              <p>{formData.nom}</p>
            </div>

            <div>
              <label className="font-semibold">Prix Assurance:</label>
              <p>{formData.prixAssurance}</p>
            </div>
            <div>
              <label className="font-semibold">Prix Ipm:</label>
              <p>{formData.prixIpm}</p>
            </div>
            <div>
              <label className="font-semibold">Prix Sococim:</label>
              <p>{formData.prixSococim}</p>
            </div>
            <div>
              <label className="font-semibold">Prix Paf:</label>
              <p>{formData.prixPaf}</p>
            </div>

            <div>
              <label className="font-semibold">Description:</label>
              <p>{formData.description}</p>
            </div>
          </div>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Fermer</button>
            </form>
          </div>
        </div>
        <font></font>
      </dialog>
    </>
  )
}

ViewTestButton.propTypes = {
  testId: PropTypes.string.isRequired,
  ontestUpdated: PropTypes.func.isRequired,
}

export default ViewTestButton
