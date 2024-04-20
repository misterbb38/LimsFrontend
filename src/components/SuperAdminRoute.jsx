import PropTypes from 'prop-types'
import { Navigate } from 'react-router-dom'

const SuperAdminRoute = ({ children }) => {
  const userInfoString = localStorage.getItem('userInfo')
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null

  if (!userInfo || userInfo.userType !== 'superadmin') {
    // Redirection vers une page d'erreur spécifique pour les utilisateurs non autorisés
    // ou vers la page de connexion
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

// Utilisation de propTypes pour valider le prop `children`
SuperAdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
}

export default SuperAdminRoute
