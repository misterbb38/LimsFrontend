import { motion } from 'framer-motion'
import { Link } from 'react-router-dom' // Importez le composant Link
import LogoText from '../../images/logo-et-slogan.jpg'

const HeroHome = () => {
  // Variants pour l'animation de l'image
  const imageVariants = {
    offscreen: { x: 100, opacity: 0 },
    onscreen: {
      x: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  }
  const buttonVariants = {
    hidden: { scale: 0 },
    visible: { scale: 1, transition: { delay: 0.4, duration: 0.5 } },
  }

  // Variants pour l'animation du texte
  const textVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, delay: 0.2 },
    },
  }

  return (
    <section className="text-base-content body-font">
      <div className="container mx-auto flex px-5 py-24 md:flex-row flex-col items-center">
        <motion.div
          className="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-16 md:mb-0 items-center text-center"
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.5 }}
        >
          <motion.h1
            variants={textVariants}
            className="title-font sm:text-4xl text-3xl mb-4 font-medium text-base-content  "
          >
            FactuFlexe : Simplifiez votre Gestion Financière
            <br className="hidden lg:inline-block" />
            Efficacité et Flexibilité
          </motion.h1>
          <motion.p variants={textVariants} className="mb-8 leading-relaxed">
            Découvrez FactuFlexe, la solution ultime pour transformer votre
            gestion de factures et devis en une expérience fluide et sans
            effort. Grâce à notre inventaire filtrable par mois, année, et
            client, vous avez le contrôle total sur votre suivi financier.
            Générez des factures en PDF d'un simple clic et propulsez votre
            entreprise vers de nouveaux sommets d'efficacité. Rejoignez
            FactuFlex dès aujourd'hui et voyez comment nous redéfinissons la
            gestion financière pour les entrepreneurs modernes.
          </motion.p>
          <div className="flex justify-center">
            <Link to="/signup" style={{ textDecoration: 'none' }}>
              <motion.button
                className="inline-flex items-center btn btn-primary  px-3 rounded text-base mt-4 md:mt-0"
                variants={buttonVariants}
              >
                Inscription
                <svg
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="w-4 h-4 ml-1"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7"></path>
                </svg>
              </motion.button>
            </Link>
          </div>
        </motion.div>
        <motion.div
          className="lg:max-w-lg lg:w-full md:w-1/2 w-5/6"
          variants={imageVariants}
          initial="offscreen"
          whileInView="onscreen"
          viewport={{ once: true, amount: 0.5 }}
        >
          <img
            className="object-cover object-center rounded"
            alt="hero"
            src={LogoText}
          />
        </motion.div>
      </div>
    </section>
  )
}

export default HeroHome
