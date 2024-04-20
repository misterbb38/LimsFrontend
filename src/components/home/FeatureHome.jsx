import { motion } from 'framer-motion'

const FeatureHome = () => {
  // Variants pour l'animation de chaque feature item
  const itemVariants = {
    offscreen: { y: 20, opacity: 0 },
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

  // Caractéristiques personnalisées pour FactuFlex
  const features = [
    'Génération Instantanée de Factures PDF',
    "Gestion d'Inventaire Intuitive par Date et Client",
    'Rapports Financiers Détaillés et Personnalisables',
    'Interface Utilisateur Élégante et Facile à Utiliser',
    'Sécurité des Données de Premier Niveau',
    'Support Client Réactif et Aide Personnalisée',
  ]

  return (
    <section className="text-base-content body-font">
      <div className="container px-5 py-24 mx-auto">
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-20"
        >
          <h1 className="sm:text-3xl text-2xl font-medium title-font text-base-content mb-4">
            FactuFlexe : L'Art de la Gestion Financière
          </h1>
          <p className="text-base leading-relaxed xl:w-2/4 lg:w-3/4 mx-auto">
            Rejoignez l'avant-garde de la gestion financière avec FactuFlex, où
            innovation et tradition se rencontrent pour simplifier vos processus
            comptables. Notre plateforme, conçue pour les entrepreneurs
            visionnaires, intègre des outils intuitifs pour la gestion de vos
            factures et devis, alliant esthétique moderne et fonctionnalité sans
            précédent. Découvrez une solution qui évolue avec vos besoins,
            permettant une gestion financière à la fois élégante et performante.
          </p>
        </motion.div>
        <motion.div
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-wrap lg:w-4/5 sm:mx-auto sm:mb-2 -mx-2"
          transition={{ staggerChildren: 0.1 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-2 sm:w-1/2 w-full"
            >
              <div className="bg-base-300 rounded flex p-4 h-full items-center">
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  className="text-indigo-500 w-6 h-6 flex-shrink-0 mr-4"
                  viewBox="0 0 24 24"
                >
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                  <path d="M22 4L12 14.01l-3-3"></path>
                </svg>
                <span className="title-font font-medium">{feature}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default FeatureHome
