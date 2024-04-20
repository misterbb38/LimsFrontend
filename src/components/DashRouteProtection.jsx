import PropTypes from 'prop-types' // Importez PropTypes
import { Navigate } from 'react-router-dom'

const DashRouteProtection = ({ children }) => {
  const userInfoString = localStorage.getItem('userInfo')
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null

  if (!userInfo) {
    // Redirection vers la page de connexion si l'utilisateur n'est pas connecté
    return <Navigate to="/signin" replace />
  }

  const { userType, dateExpiration } = userInfo

  // Laissez l'accès aux superadmins sans vérifier la date d'expiration
  if (userType === 'superadmin') {
    return children
  }

  // Vérifiez la date d'expiration pour les utilisateurs non superadmin
  const currentDate = new Date()
  if (dateExpiration) {
    const expirationDate = new Date(dateExpiration)
    if (currentDate > expirationDate) {
      // Redirection vers /keyExpired si l'abonnement est expiré
      return <Navigate to="/keyExpired" replace />
    }
  }

  // Permettez l'accès si l'utilisateur est connecté, n'est pas superadmin, mais a un abonnement valide
  return children
}

// Définition des propTypes pour DashRouteProtection
DashRouteProtection.propTypes = {
  children: PropTypes.node.isRequired, // Assurez-vous que children est requis et est un nœud React
}

export default DashRouteProtection
