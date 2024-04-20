import { useState, useEffect } from 'react'
import TopBar from './TopBar'
//import PaymentButton from './ButtonPayement';

function GenerateAccessKey() {
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [duree, setDuree] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState({
    message: '',
    type: '',
    isVisible: false,
  })
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const token = userInfo?.token
        const response = await fetch(`${apiUrl}/api/user/simpleusers`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, // Ajouter l'en-tête d'autorisation avec le token
            'Content-Type': 'application/json',
          },
        })
        const data = await response.json()
        if (data.success) {
          setUsers(data.data)
        } else {
          throw new Error(
            data.message || 'Erreur lors de la récupération des utilisateurs.'
          )
        }
      } catch (error) {
        showToast(error.message, 'error')
      }
    }

    fetchUsers()
  }, [apiUrl])

  const showToast = (message, type) => {
    setToast({ message, type, isVisible: true })
    setTimeout(() => {
      setToast({ message: '', type: '', isVisible: false })
    }, 3000) // Masquer le toast après 3 secondes
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
      const token = userInfo?.token // Récupérer le token depuis le stockage local
      const response = await fetch(`${apiUrl}/api/user/assign-access-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: selectedUserId,
          duree: parseInt(duree),
        }),
      })

      const data = await response.json()
      if (response.ok) {
        showToast(
          `Clé d'accès générée avec succès pour l'utilisateur`,
          'success'
        )
      } else {
        throw new Error(
          data.message || "Erreur lors de la génération de la clé d'accès."
        )
      }
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div>
        <TopBar />
      </div>
      <div className="max-w-4xl mx-auto my-10 p-5 bg-white rounded-lg shadow">
        {/* <PaymentButton />  */}
        {toast.message && (
          <div
            className={`toast toast-top toast-center ${toast.type === 'success' ? 'bg-green-100' : 'bg-red-100'} p-4 rounded`}
          >
            <span>{toast.message}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label
              htmlFor="userEmail"
              className="form-label inline-block mb-2 text-gray-700"
            >
              Email des utilisateurs
            </label>
            <select
              id="userEmail"
              className="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
            >
              <option value="">Sélectionnez un utilisateur</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label
              htmlFor="duree"
              className="form-label inline-block mb-2 text-gray-700"
            >
              Durée
            </label>
            <select
              id="duree"
              className="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
              value={duree}
              onChange={(e) => setDuree(e.target.value)}
              required
            >
              <option value="">Sélectionnez la durée</option>
              <option value="7">7 jours</option>
              <option value="30">30 jours</option>
              <option value="365">365 jours</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Génération en cours...' : 'Générer Clé'}
          </button>
        </form>

        {/* Tableau des utilisateurs */}
        <div className="overflow-x-auto mt-6">
          <table className="table w-full">
            {/* Entêtes du tableau */}
            <thead>
              <tr>
                <th>Email</th>
                <th>Nom</th>
                <th>Clé d'accès</th>
                <th>Date d'expiration</th>
                <th>Statut d'abonnement</th>
              </tr>
            </thead>
            <tbody>
              {/* Données du tableau */}
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.email}</td>
                  <td>{user.nom}</td>
                  <td>{user.cleAcces || 'N/A'}</td>
                  <td>
                    {user.dateExpiration
                      ? new Date(user.dateExpiration).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>{user.abonnementStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default GenerateAccessKey
