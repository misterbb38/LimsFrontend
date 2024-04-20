import { useState } from 'react'
import emailjs from 'emailjs-com'

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Remplacez 'YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', et 'YOUR_USER_ID' avec vos vrais identifiants EmailJS
    emailjs
      .send(
        'service_bztblnh',
        'template_ajipqaa',
        formData,
        'UfM2U-_C-xrcgLDCu'
      )
      .then(
        (result) => {
          console.log(result.text)
          // Afficher un message de succès ou réinitialiser le formulaire ici
        },
        (error) => {
          console.log(error.text)
          // Gérer l'erreur ici
        }
      )

    // Reset du formulaire (facultatif)
    setFormData({
      name: '',
      email: '',
      message: '',
    })
  }

  return (
    <section className="text-gray-600 body-font relative">
      <div className="container px-5 py-24 mx-auto">
        <div className="flex flex-wrap -mx-4 -mb-10 text-center">
          <div className="sm:w-1/2 mb-10 px-4">
            <div className="rounded-lg h-64 overflow-hidden">
              <iframe
                className="object-cover object-center h-full w-full"
                frameBorder="0"
                title="map"
                scrolling="no"
                src="https://maps.google.com/maps?q=Dakar,%20Senegal&t=&z=13&ie=UTF8&iwloc=&output=embed"
                style={{ filter: 'grayscale(1) contrast(1.2) opacity(0.4)' }}
              ></iframe>
            </div>
            <h2 className="title-font text-2xl font-medium  mt-6 mb-3 text-base-content">
              Dakar, Sénégal
            </h2>
            <p className="leading-relaxed text-base-content">+221 784759032</p>
            <a className="text-indigo-500 inline-flex items-center mt-3">
              amady305@gmail.com
            </a>
          </div>
          <div className="sm:w-1/2 mb-10 px-4">
            <div className="flex flex-col text-left w-full">
              <h2 className="text-xs text-indigo-500 tracking-widest font-medium title-font mb-1">
                CONTACTEZ-NOUS
              </h2>
              <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-base-content ">
                Nous sommes à votre écoute
              </h1>
              <p className="leading-relaxed text-base-content mb-5">
                N'hésitez pas à nous écrire, nous vous répondrons dans les plus
                brefs délais.
              </p>
              <form onSubmit={handleSubmit} className="w-full">
                <div className="relative mb-4">
                  <label
                    htmlFor="name"
                    className="leading-7 text-sm text-base-content"
                  >
                    Nom
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900 text-base-content outline-none  py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="relative mb-4">
                  <label
                    htmlFor="email"
                    className="leading-7 text-sm text-base-content"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900 text-base-content outline-none  py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="relative mb-4">
                  <label
                    htmlFor="message"
                    className="leading-7 text-sm text-base-content"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-900 h-32 text-base-content outline-none  py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
                    value={formData.message}
                    onChange={handleChange}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="text-white btn btn-primary border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
                >
                  Envoyer
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactForm
