import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const PriceHome = () => {
  const [isAnnual, setIsAnnual] = useState(false)
  const navigate = useNavigate()

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

  // Variants pour l'animation des éléments de tarification
  const pricingVariant = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        bounce: 0.4,
        duration: 0.8,
      },
    },
  }
  const handleClick = () => {
    navigate('/signup') // Redirige vers /signup
  }

  return (
    <section className="text-base-content body-font overflow-hidden">
      <div className="container px-5 py-24 mx-auto">
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col text-center w-full mb-20"
          transition={{ staggerChildren: 0.1 }}
        >
          <h1 className="sm:text-4xl text-3xl font-medium title-font mb-2 text-base-content">
            Tarification
          </h1>
          <p className="lg:w-2/3 mx-auto leading-relaxed text-base text-base-content">
            Choisissez le plan parfait pour répondre à vos besoins avec
            flexibilité et sans souci. Tous les plans viennent avec{' '}
            <strong>7 jours d'essai gratuit</strong>, sans engagement.
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
        </motion.div>
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-wrap -m-4 justify-center" // Modifier pour centrer les boîtes sur grand écran
          transition={{ staggerChildren: 0.1 }}
        >
          {selectedPlans.map((plan, index) => (
            <motion.div
              key={index}
              className="p-4 xl:w-1/4 md:w-1/2 w-full"
              variants={pricingVariant}
            >
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
                  onClick={handleClick}
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default PriceHome
