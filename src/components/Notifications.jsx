import { useEffect, useState } from 'react'

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0) // Ajouter cet état pour compter les notifications non lues
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  const token = userInfo?.token
  const userId = userInfo?._id

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/notification/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        const unread = data.filter((notification) => !notification.read).length
        setUnreadCount(unread)
      } else {
        throw new Error('Failed to fetch notifications')
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications: ', error)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [userId, apiUrl, token]) // Dépendances de l'effet

  const markNotification = async (notificationId, readStatus) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/notification/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ read: readStatus }),
        }
      )
      if (response.ok) {
        document.dispatchEvent(
          new CustomEvent('updateUnreadNotificationsCount')
        )
        // Rafraîchir les notifications après la mise à jour
        fetchNotifications()
      } else {
        throw new Error('Failed to update notification status')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification: ', error)
    }
  }

  return (
    <div className="bg-base-100 p-4 min-h-[800px]">
      <h3 className="text-lg font-semibold mb-4">Notifications</h3>
      <p>Vous avez {unreadCount} notification(s) non lue(s).</p>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Message</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notifications.map((notification) => (
              <tr key={notification._id}>
                <td>{notification.message}</td>
                <td>{new Date(notification.createdAt).toLocaleDateString()}</td>
                <td>{notification.read ? 'Lu' : 'Non lu'}</td>
                <td>
                  <button
                    className={`btn ${notification.read ? 'btn-error' : 'btn-primary'} btn-xs`}
                    onClick={() =>
                      markNotification(notification._id, !notification.read)
                    }
                  >
                    {notification.read
                      ? 'Marquer comme non lu'
                      : 'Marquer comme lu'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Notifications
