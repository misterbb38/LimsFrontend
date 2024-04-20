import { motion } from 'framer-motion'
import Logo from '../../images/logo/logo.png'
import { Link } from 'react-router-dom' // Importez le composant Link

const headerVariants = {
  hidden: { y: -100, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } },
}

const linkVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { delay: 0.2, duration: 0.5 } },
}

const buttonVariants = {
  hidden: { scale: 0 },
  visible: { scale: 1, transition: { delay: 0.4, duration: 0.5 } },
}

const HeaderHome = () => {
  return (
    <motion.header
      className="text-gray-600 body-font"
      initial="hidden"
      animate="visible"
      variants={headerVariants}
    >
      <div className="container bg-contain-base mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <motion.a
          href="/"
          className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0"
          variants={linkVariants}
        >
          <img className="hidden dark:block" src={Logo} alt="Logo" />

          {/* <span className="text-blue-700 text-xl font-bold">Factu</span><span className="text-orange-500 text-xl font-bold">Flex</span> */}
        </motion.a>
        <motion.nav
          className="md:mr-auto md:ml-4 md:py-1 md:pl-4 md:border-l md:border-gray-400 flex flex-wrap items-center text-base justify-center"
          variants={linkVariants}
        >
          <a
            href="#hero-home"
            className="mr-5 text-base-content hover:text-gray-900"
          >
            Acceuil
          </a>
          <a
            href="#feature-home"
            className="mr-5 text-base-content hover:text-gray-900"
          >
            Aventages
          </a>
          <a
            href="#step-home"
            className="mr-5 text-base-content hover:text-gray-900"
          >
            a propos
          </a>
          <a
            href="#price-home"
            className="mr-5 text-base-content hover:text-gray-900"
          >
            Prix
          </a>
          <a
            href="#contact-form"
            className="mr-5 text-base-content hover:text-gray-900"
          >
            Contact
          </a>
        </motion.nav>
        <label className="cursor-pointer grid place-items-center">
          <input
            type="checkbox"
            value="synthwave"
            className="toggle mx-2 theme-controller bg-base-content row-start-1 col-start-1 col-span-2"
          />
          <svg
            className="col-start-1 row-start-1 stroke-base-100 fill-base-100"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
          </svg>
          <svg
            className="col-start-2 row-start-1 stroke-base-100 fill-base-100"
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        </label>
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

        <Link to="/signin" style={{ textDecoration: 'none' }}>
          <motion.button
            className="inline-flex items-center btn btn-primary mx-2 px-3 rounded text-base mt-4 md:mt-0"
            variants={buttonVariants}
          >
            Connexion
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
    </motion.header>
  )
}

export default HeaderHome
