import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const KeyExpired = () => {
  const [isAnnual, setIsAnnual] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [user, setUser] = useState({
    nom: '',
    prenom: '',
    dateExpiration: new Date().toISOString(), // Mettez une date pour tester
  })
  const navigate = useNavigate()
  const today = new Date()
  const expirationDate = new Date(user.dateExpiration)
  const differenceInTime = expirationDate.getTime() - today.getTime()
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24))

  useEffect(() => {
    const fetchUserProfile = async () => {
      const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token

      try {
        const response = await fetch(`${apiUrl}/api/user/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }

        const data = await response.json()
        console.log(data)
        setUser({
          nom: data.nom || '',
          prenom: data.prenom || '',
          dateExpiration: data.dateExpiration || '',
        })
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error)
      }
    }

    fetchUserProfile()
  }, [])

  const navigateToHome = () => {
    if (differenceInDays >= 0) {
      navigate('/dash')
    }
  }

  const plans = {
    monthly: [
      {
        name: 'DÉMARRAGE',
        price: '11 400 FCFA/mois',
        features: [
          '100 Factures',
          'Gestion de base des clients',
          'Support par email',
        ],
      },
      {
        name: 'PRO',
        price: '23 400 FCFA/mois',
        features: [
          '300 Factures',
          'Gestion avancée des clients',
          'Support prioritaire',
          'Rapports financiers',
        ],
      },
      {
        name: 'ENTREPRISE',
        price: '35 400 FCFA/mois',
        features: [
          'Toutes les fonctionnalités Pro',
          'Intégrations personnalisées',
          'Gestion multi-utilisateurs',
          'Formation dédiée',
        ],
      },
    ],
    annual: [
      {
        name: 'DÉMARRAGE',
        price: '136 800 FCFA/an',
        features: [
          '100 Factures',
          'Gestion de base des clients',
          'Support par email',
        ],
      },
      {
        name: 'PRO',
        price: '280 800 FCFA/an',
        features: [
          '300 Factures',
          'Gestion avancée des clients',
          'Support prioritaire',
          'Rapports financiers',
        ],
      },
      {
        name: 'ENTREPRISE',
        price: '424 800 FCFA/an',
        features: [
          'Toutes les fonctionnalités Pro',
          'Intégrations personnalisées',
          'Gestion multi-utilisateurs',
          'Formation dédiée',
        ],
      },
    ],
  }

  const selectedPlans = isAnnual ? plans.annual : plans.monthly

  const handleChoosePlan = () => {
    setShowModal(true)
  }

  const handleRedirect = (platform) => {
    let url = ''
    if (platform === 'whatsapp') {
      url = 'https://wa.me/+79169818826'
    } else if (platform === 'telegram') {
      url = 'https://t.me/amadybar'
    }
    window.open(url, '_blank')
    setShowModal(false)
  }

  return (
    <>
      <div className="flex flex-col items-center  ">
        {differenceInDays >= 0 ? (
          <div
            role="alert"
            className="alert alert-warning max-w-lg w-full text-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              Dans {differenceInDays} jours, votre abonnement va expirer. Merci
              de renouveler avant cette date.
            </div>
          </div>
        ) : (
          <div
            role="alert"
            className="alert alert-error max-w-lg w-full text-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>Votre abonnement est déjà expiré. Veuillez renouveler.</div>
          </div>
        )}
        <button
          onClick={navigateToHome}
          className={`btn btn-primary mt-4 ${differenceInDays < 0 ? 'btn-disabled ' : ''}`}
        >
          Accueil
        </button>
      </div>

      <section className="text-base-content body-font overflow-hidden">
        <div className="container px-5 py-24 mx-auto">
          <div className="flex flex-col text-center w-full mb-20">
            <h1 className="sm:text-4xl text-3xl font-medium title-font mb-2 text-base-content">
              Tarification
            </h1>
            <p className="lg:w-2/3 mx-auto leading-relaxed text-base text-base-content">
              Choisissez le plan parfait pour répondre à vos besoins avec
              flexibilité et sans souci.
            </p>
            <div className="flex mx-auto border-2 border-indigo-500 rounded overflow-hidden mt-6">
              <button
                onClick={() => setIsAnnual(false)}
                className={`py-1 px-4 focus:outline-none ${!isAnnual ? 'bg-indigo-500 text-white' : 'text-gray-700'}`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`py-1 px-4 focus:outline-none ${isAnnual ? 'bg-indigo-500 text-white' : 'text-gray-700'}`}
              >
                Annuel
              </button>
            </div>
          </div>
          <div className="flex flex-wrap -m-4 justify-center">
            {selectedPlans.map((plan, index) => (
              <div key={index} className="p-4 xl:w-1/4 md:w-1/2 w-full">
                <div
                  className={`h-full p-6 rounded-lg border-2 ${index === 1 ? 'border-indigo-500' : 'border-gray-300'} flex flex-col relative overflow-hidden`}
                >
                  {index === 1 && (
                    <span className="bg-indigo-500 text-white px-3 py-1 tracking-widest text-xs absolute right-0 top-0 rounded-bl">
                      POPULAIRE
                    </span>
                  )}
                  <h2 className="text-sm tracking-widest title-font mb-1 font-medium">
                    {plan.name}
                  </h2>
                  <h1 className="text-5xl text-base-content pb-4 mb-4 border-b border-gray-200 leading-none">
                    {plan.price}
                  </h1>
                  {plan.features.map((feature, featureIndex) => (
                    <p
                      key={featureIndex}
                      className="flex items-center text-base-content mb-2"
                    >
                      <span className="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400 text-white rounded-full flex-shrink-0">
                        <svg
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2.5"
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </span>
                      {feature}
                    </p>
                  ))}
                  <button
                    onClick={handleChoosePlan}
                    className="flex items-center mt-auto btn btn-primary border-0 py-2 px-4 w-full focus:outline-none hover:bg-indigo-600 rounded"
                  >
                    Choisir
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      className="w-4 h-4 ml-auto"
                      viewBox="0 0 24 24"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">
                Choisissez votre mode de paiement
              </h3>
              <p className="py-4">
                Vous pouvez effectuer votre paiement via WhatsApp ou Telegram.
              </p>
              <div className="modal-action">
                <button
                  onClick={() => handleRedirect('whatsapp')}
                  className="btn"
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => handleRedirect('telegram')}
                  className="btn"
                >
                  Telegram
                </button>
                <button onClick={() => setShowModal(false)} className="btn">
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  )
}

export default KeyExpired
