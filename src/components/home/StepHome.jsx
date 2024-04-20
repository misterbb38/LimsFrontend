import { motion } from 'framer-motion'
import LogoImage from '../../images/image1.png'
const steps = [
  {
    id: 1,
    title: 'ÉTAPE 1',
    description:
      "Découvrez l'essence de la modernité avec une touche rétro. Nos solutions s'appuient sur l'esthétique vintage du VHS et la simplicité élégante de l'Helvetica pour vous offrir une expérience unique et inoubliable.",
    svgPath: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  },
  {
    id: 2,
    title: 'ÉTAPE 2',
    description:
      "Élevez votre projet avec un style qui transcende les époques. Nous fusionnons l'audace du street art avec la finesse de la typographie pour créer des designs qui captent l'attention et racontent votre histoire.",
    svgPath: 'M22 12h-4l-3 9L9 3l-3 9H2',
  },
  {
    id: 3,
    title: 'ÉTAPE 3',
    description:
      "Plongez dans un univers où l'art rencontre le fonctionnel. Notre approche, inspirée par le minimalisme et l'umami visuel, ajoute une dimension de profondeur et d'engagement à votre présence en ligne.",
    svgPath: 'M12 22V8M5 12H2a10 10 0 0020 0h-3',
  },
  {
    id: 4,
    title: 'ÉTAPE 4',
    description:
      "Réinventez le classique avec une touche de modernité. Nous mélangeons habilement la nostalgie du VHS et l'innovation numérique pour offrir des solutions créatives qui se démarquent dans le paysage numérique actuel.",
    svgPath:
      'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 7a4 4 0 100-8 4 4 0 000 8z',
  },
  {
    id: 5,
    title: 'FINALISATION',
    description:
      "Atteignez l'apogée de votre projet avec des designs qui fusionnent l'esthétique underground et le chic urbain. Nos créations sont conçues pour marquer les esprits et établir une présence mémorable.",
    svgPath: 'M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3',
  },
  // Autres étapes...
]

const StepHome = () => {
  // Animation pour les éléments de liste
  const listItemVariants = {
    offscreen: { x: -100, opacity: 0 },
    onscreen: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        bounce: 0.4,
        duration: 0.8,
      },
    },
  }

  // Animation pour l'image
  const imageVariants = {
    offscreen: { x: 100, opacity: 0 },
    onscreen: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        bounce: 0.4,
        duration: 0.8,
      },
    },
  }

  return (
    <section className="text-base-content body-font">
      <div className="container px-5 py-24 mx-auto flex flex-wrap">
        <div className="flex flex-wrap w-full">
          <motion.div
            className="lg:w-2/5 md:w-1/2 md:pr-10 md:py-6"
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                variants={listItemVariants}
                className={`flex relative ${index !== steps.length - 1 ? 'pb-12' : ''}`}
              >
                <div className="h-full w-10 absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-1 bg-base-content pointer-events-none"></div>
                </div>
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-base-300 inline-flex items-center justify-center text-white relative z-10">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <path d={step.svgPath}></path>
                  </svg>
                </div>
                <div className="flex-grow pl-4">
                  <h2 className="font-medium title-font text-sm text-gray-900 mb-1 tracking-wider">
                    {step.title}
                  </h2>
                  <p className="leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <motion.img
            className="lg:w-3/5 md:w-1/2  object-cover object-center rounded-lg md:mt-0 mt-12"
            src={LogoImage}
            alt="step"
            variants={imageVariants}
            initial="offscreen"
            whileInView="onscreen"
            viewport={{ once: true, amount: 0.5 }}
          />
        </div>
      </div>
    </section>
  )
}

export default StepHome
