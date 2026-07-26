// Utilitaires d'authentification / session cote client.
//
// Le token est un JWT stocke dans localStorage.userInfo.token (expire a
// 7 jours cote backend). On decode le champ `exp` pour deconnecter
// automatiquement l'utilisateur des que sa session est terminee.

export function getUserInfo() {
  try {
    return JSON.parse(localStorage.getItem('userInfo') || 'null')
  } catch {
    return null
  }
}

// Decode la charge utile (payload) d'un JWT sans verification de
// signature (cote client, uniquement pour lire `exp`).
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(json)
  } catch {
    return null
  }
}

// true si le token est absent, illisible ou expire.
export function isTokenExpired(token) {
  if (!token) return true
  const payload = decodeJwtPayload(token)
  if (!payload) return true
  if (!payload.exp) return false // pas d'expiration => considere valide
  return payload.exp * 1000 <= Date.now()
}

// true si la session courante (userInfo dans localStorage) est expiree.
export function isSessionExpired() {
  const info = getUserInfo()
  return isTokenExpired(info?.token)
}

// Supprime la session locale.
export function clearSession() {
  localStorage.removeItem('userInfo')
}
