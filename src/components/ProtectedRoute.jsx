// import PropTypes from 'prop-types' // Import pour les propTypes
// import { Navigate, Outlet } from 'react-router-dom'

// const ProtectedRoute = ({ children }) => {
//   const userInfoString = localStorage.getItem('userInfo')
//   const userInfo = userInfoString ? JSON.parse(userInfoString) : null

//   // Vérifiez si les informations de l'utilisateur existent
//   if (userInfo) {
//     const { userType, dateExpiration } = userInfo

//     // Accordez l'accès à toutes les pages si l'utilisateur est superadmin
//     if (userType === 'superadmin') {
//       return children || <Outlet />
//     }

//     // Pour les autres types d'utilisateurs, vérifiez la date d'expiration de l'abonnement
//     if (dateExpiration) {
//       const expirationDate = new Date(dateExpiration)
//       const currentDate = new Date()

//       // Redirigez vers /keyExpired si l'abonnement est expiré
//       if (currentDate > expirationDate) {
//         return <Navigate to="/keyExpired" replace />
//       }

//       // Permettez l'accès si l'abonnement est toujours valide
//       return children || <Outlet />
//     }
//   }

//   // Redirigez vers la page de connexion si les informations de l'utilisateur ne sont pas trouvées ou incomplètes
//   return <Navigate to="/signin" replace />
// }

// // Ajout de propTypes pour valider le prop `children`
// ProtectedRoute.propTypes = {
//   children: PropTypes.node,
// }

// export default ProtectedRoute
