import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

function DeleteAnalyseButton({ analyseId, onAnalyseDeleted }) {
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette Analyse ?')) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
      const token = userInfo?.token // S'assurer d'utiliser le token actuel
      try {
        const response = await fetch(`${apiUrl}/api/analyse/${analyseId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (data.success) {
          onAnalyseDeleted() // Rafraîchir la liste des Analyses
        } else {
          alert('Erreur lors de la suppression de la Analyse.')
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la Analyse:', error)
      }
    }
  }

  return (
    <button className="btn btn-error" onClick={handleDelete}>
      <FontAwesomeIcon icon={faTrash} />
    </button>
  )
}

DeleteAnalyseButton.propTypes = {
  analyseId: PropTypes.string.isRequired,
  onAnalyseDeleted: PropTypes.func.isRequired,
}

export default DeleteAnalyseButton
