import { useState, useEffect } from 'react'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import AddClientForm from '../components/AddClientForm'
import AddProduitForm from '../components/AddTestForm'
import UploadExcelButton from '../components/UploadExcelButton'
import UploadExcelButtonProduit from '../components/UploadExcelButtonProduit'
import Chatbot from '../components/Chatbot'

const Formulaire = () => {
  const [selectedClientId, setSelectedClientId] = useState('')
  const [clients, setClients] = useState([])
  const [produits, setProduits] = useState([])
  const [articles, setArticles] = useState([])
  const [type, setType] = useState('facture') // 'facture' par défaut
  const [status, setStatus] = useState('Attente') // 'pending' par défaut
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(true)

  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [address, setAddress] = useState('')

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    const fetchClients = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
      const token = userInfo?.token // Récupérer le token depuis le stockage local
      try {
        const response = await fetch(`${apiUrl}/api/client`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`, // Ajouter l'en-tête d'autorisation avec le token
            'Content-Type': 'application/json',
          },
        })
        const data = await response.json()
        if (data && data.success && data.data) {
          setClients(data.data) // Accès aux clients via la propriété data
          console.log('Clients chargés:', data.data) // Ajoutez ceci pour le diagnostic
        } else {
          // Gérer le cas où data ou data.data n'existe pas
          console.error('Aucun client trouvé dans la réponse')
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error)
      }
    }

    fetchClients()
  }, [])

  useEffect(() => {
    const fetchProduits = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
      const token = userInfo?.token
      try {
        const response = await fetch(`${apiUrl}/api/produit`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()
        if (data.success) {
          setProduits(data.data)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des produits :', error)
      }
    }

    fetchProduits()
  }, [])

  const handleSelectProduit = (index, e) => {
    const newArticles = articles.map((article, i) => {
      if (i === index) {
        const selectedProduit = produits.find((p) => p._id === e.target.value)
        return {
          ...article,
          selectedProduitId: e.target.value,
          ref: selectedProduit ? selectedProduit.reference : '',
          description: selectedProduit ? selectedProduit.designation : '',
          prixUnitaire: selectedProduit ? selectedProduit.prixUnitaire : '',
        }
      }
      return article
    })
    setArticles(newArticles)
  }

  useEffect(() => {
    const selectedClient = clients.find(
      (client) => client._id === selectedClientId
    )
    if (selectedClient) {
      setFullName(selectedClient.name || '')
      setPhoneNumber(selectedClient.telephone || '')
      setEmailAddress(selectedClient.email || '')
      setAddress(selectedClient.address || '')
    } else {
      // Réinitialiser les états si aucun client n'est sélectionné
      setFullName('')
      setPhoneNumber('')
      setEmailAddress('')
      setAddress('')
    }
  }, [selectedClientId, clients])

  const handleClientChange = (e) => {
    setSelectedClientId(e.target.value)
    console.log('ID de client sélectionné:', e.target.value) // Pour diagnostic
  }

  const ajouterArticle = () => {
    setArticles([
      ...articles,
      {
        ref: '',
        description: '',
        quantite: '',
        prixUnitaire: '',
        total: '',
        selectedProduitId: '',
      },
    ])
  }

  // Fonction pour supprimer un article
  const supprimerArticle = (indexASupprimer) => {
    setArticles(articles.filter((_, index) => index !== indexASupprimer))
  }

  const handleChangeArticle = (index, e) => {
    const updatedArticles = articles.map((article, i) => {
      if (i === index) {
        const newArticle = { ...article, [e.target.name]: e.target.value }

        if (e.target.name === 'quantite' || e.target.name === 'prixUnitaire') {
          const quantite =
            e.target.name === 'quantite'
              ? Number(e.target.value)
              : Number(article.quantite)
          const prixUnitaire =
            e.target.name === 'prixUnitaire'
              ? Number(e.target.value)
              : Number(article.prixUnitaire)
          newArticle.total = quantite * prixUnitaire
        }

        return newArticle
      }
      return article
    })
    setArticles(updatedArticles)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
    const token = userInfo?.token // S'assurer d'utiliser le token actuel

    const clientSelectionne = clients.find(
      (client) => client._id === selectedClientId
    )
    console.log('Client sélectionné:', clientSelectionne) // Pour diagnostic

    const invoiceData = {
      Client: clientSelectionne ? clientSelectionne._id : null,
      client: {
        name: clientSelectionne
          ? clientSelectionne.name
          : e.target.fullName.value,
        address: clientSelectionne
          ? clientSelectionne.address
          : e.target.address.value,
        email: clientSelectionne
          ? clientSelectionne.email
          : e.target.emailAddress.value,
        telephone: clientSelectionne
          ? clientSelectionne.telephone
          : e.target.phoneNumber.value,
      },
      items: articles.map((article) => ({
        ref: article.ref,
        description: article.description,
        quantity: Number(article.quantite),
        price: Number(article.prixUnitaire),
        total: Number(article.quantite) * Number(article.prixUnitaire),
      })),
      total: articles.reduce(
        (acc, article) =>
          acc + Number(article.quantite) * Number(article.prixUnitaire),
        0
      ),
      type: type, // ou "devis" selon le contexte
      status: status, // ou autre selon la logique métier
    }
    console.log(invoiceData)

    try {
      const response = await fetch(`${apiUrl}/api/invoice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(invoiceData),
      })

      if (response.ok) {
        console.log('Facture enregistrée avec succès')
        // Autres traitements...
        setToastMessage('Facture enregistrée avec succès')
        setIsSuccess(true)
        resetForm()
      } else {
        console.error("Échec de l'enregistrement de la facture")
        setToastMessage("Échec de l'enregistrement de la facture")
        setIsSuccess(false)
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi de la facture:", error)
      setToastMessage("Erreur lors de l'envoi de la facture")
      setIsSuccess(false)
    }
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000) // Cache le toast après 3 secondes
  }
  const resetForm = () => {
    setSelectedClientId('')
    setArticles([])
    setType('facture')
    setStatus('Attente')
  }

  return (
    <>
      {showToast && (
        <div className="toast toast-center toast-middle">
          <div
            className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}
          >
            <span className="text-white">{toastMessage}</span>
          </div>
        </div>
      )}
      <div className="bg-base-100 ">
        <NavigationBreadcrumb pageName="Settings" />
        <Chatbot />
        {/* ... (Reste du code tel quel) ... */}
        <div className="bg-base-100 base-content grid grid-cols-5 gap-8">
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-base-100 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium base-content">Nouvelle facture</h3>
              </div>
              <div className="p-7">
                <form action="#" onSubmit={handleSubmit}>
                  <label className="mb-3 block text-sm font-medium base-content">
                    Sélectionner un client
                  </label>
                  <select
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
                    value={selectedClientId}
                    onChange={handleClientChange}
                  >
                    <option value="">-- Choisissez un client --</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </select>

                  <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium base-content"
                        htmlFor="fullName"
                      >
                        Nom du client
                      </label>
                      <div className="relative">
                        <span className="absolute left-4.5 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill=""
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill=""
                              />
                            </g>
                          </svg>
                        </span>
                        <input
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
                          type="text"
                          name="fullName"
                          id="fullName"
                          placeholder={fullName}
                          disabled={selectedClientId !== ''}
                        />
                      </div>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label
                        className="mb-3 block text-sm font-medium base-content"
                        htmlFor="phoneNumber"
                      >
                        Numero telephone
                      </label>
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 px-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
                        type="text"
                        name="phoneNumber"
                        id="phoneNumber"
                        placeholder={phoneNumber}
                        disabled={selectedClientId !== ''}
                      />
                    </div>
                  </div>

                  <div className="mb-5.5">
                    <label
                      className="mb-3 block text-sm font-medium base-content"
                      htmlFor="emailAddress"
                    >
                      Email
                    </label>
                    <div className="relative">
                      <span className="absolute left-4.5 top-4">
                        <svg
                          className="fill-current"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.8">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M3.33301 4.16667C2.87658 4.16667 2.49967 4.54357 2.49967 5V15C2.49967 15.4564 2.87658 15.8333 3.33301 15.8333H16.6663C17.1228 15.8333 17.4997 15.4564 17.4997 15V5C17.4997 4.54357 17.1228 4.16667 16.6663 4.16667H3.33301ZM0.833008 5C0.833008 3.6231 1.9561 2.5 3.33301 2.5H16.6663C18.0432 2.5 19.1663 3.6231 19.1663 5V15C19.1663 16.3769 18.0432 17.5 16.6663 17.5H3.33301C1.9561 17.5 0.833008 16.3769 0.833008 15V5Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M0.983719 4.52215C1.24765 4.1451 1.76726 4.05341 2.1443 4.31734L9.99975 9.81615L17.8552 4.31734C18.2322 4.05341 18.7518 4.1451 19.0158 4.52215C19.2797 4.89919 19.188 5.4188 18.811 5.68272L10.4776 11.5161C10.1907 11.7169 9.80879 11.7169 9.52186 11.5161L1.18853 5.68272C0.811486 5.4188 0.719791 4.89919 0.983719 4.52215Z"
                              fill=""
                            />
                          </g>
                        </svg>
                      </span>
                      <input
                        className="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
                        type="email"
                        name="emailAddress"
                        id="emailAddress"
                        placeholder={emailAddress}
                        disabled={selectedClientId !== ''}
                      />
                    </div>
                  </div>

                  {/* Champ pour l'Adresse */}
                  <div className="mb-5.5">
                    <label className="mb-3 block text-sm font-medium base-content">
                      Adresse
                    </label>
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
                      type="text"
                      name="address"
                      id="address"
                      placeholder={address}
                      disabled={selectedClientId !== ''}
                    />
                  </div>

                  {/* Sélecteur pour le Type (Facture ou Devis) */}
                  <div className="mb-5.5">
                    <label className="mb-3 block text-sm font-medium base-content">
                      Type
                    </label>
                    <select
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
                      name="type"
                      // onChange et value pour gérer et afficher la valeur sélectionnée
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="facture">Facture</option>
                      <option value="devis">Devis</option>
                    </select>
                  </div>

                  {/* Sélecteur pour le Statut (pending, paid, Cancelled) */}
                  <div className="mb-5.5">
                    <label className="mb-3 block text-sm font-medium base-content">
                      Statut
                    </label>
                    <select
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
                      name="status"
                      // onChange et value pour gérer et afficher la valeur
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="Attente">Attente</option>
                      <option value="Payée">Payée</option>
                      <option value="Annullée">Annulée</option>
                    </select>
                  </div>

                  <div className="p-7">
                    {/* ... (les autres champs du formulaire) ... */}

                    {articles.map((article, index) => (
                      <div key={index} className="mb-5.5">
                        <select
                          className="mb-3 w-full  rounded border border-stroke bg-gray py-3 px-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300 dark:focus:border-primary"
                          value={article.selectedProduitId}
                          onChange={(e) => handleSelectProduit(index, e)}
                        >
                          <option value="">-- Choisissez un article --</option>
                          {produits.map((produit) => (
                            <option key={produit._id} value={produit._id}>
                              {produit.designation}
                            </option>
                          ))}
                        </select>
                        {/* Ligne pour Référence et Description */}
                        <div className="flex flex-col gap-5.5 sm:flex-row">
                          <input
                            className="w-full my-1 sm:w-1/2 rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
                            type="text"
                            name="ref"
                            value={article.ref}
                            placeholder="Référence"
                            onChange={(e) => handleChangeArticle(index, e)}
                          />
                          <input
                            className="w-full my-1  sm:w-1/2 rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
                            type="text"
                            name="description"
                            value={article.description}
                            placeholder="Description"
                            onChange={(e) => handleChangeArticle(index, e)}
                          />
                        </div>

                        {/* Ligne pour Quantité et Prix Unitaire */}
                        <div className="flex flex-col gap-5.5 sm:flex-row">
                          <input
                            className="w-full my-1 sm:w-1/2 rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
                            type="number"
                            name="quantite"
                            value={article.quantite}
                            placeholder="Quantité"
                            onChange={(e) => handleChangeArticle(index, e)}
                          />
                          <input
                            className="w-full my-1 sm:w-1/2 rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
                            type="number"
                            name="prixUnitaire"
                            value={article.prixUnitaire}
                            placeholder="Prix Unitaire"
                            onChange={(e) => handleChangeArticle(index, e)}
                          />
                        </div>

                        {/* Champ pour Total */}
                        {/* <input
                            className="w- my-1 rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 base-content focus:border-primary focus-visible:outline-none dark:border-strokedark bg-base-300  dark:focus:border-primary"
                            type="number"
                            name="total"
                            placeholder="Total"
                           
                            onChange={(e) => handleChangeArticle(e, index)}
                          /> */}
                        <button
                          type="button"
                          className="btn btn-error btn-xs"
                          onClick={() => supprimerArticle(index)} // 'index' est bien défini ici
                        >
                          Supprimer cet article
                        </button>
                      </div>
                    ))}

                    <button
                      className="flex justify-center rounded  btn btn-primary py-2 px-6 font-medium  hover:bg-opacity-70"
                      type="button"
                      onClick={ajouterArticle}
                    >
                      Ajouter un article
                    </button>

                    {/* ... (les autres champs du formulaire et boutons d'action) ... */}
                  </div>

                  <div className="flex justify-end gap-4.5">
                    <button
                      className="flex justify-center btn btn-primary  rounded border border-stroke py-2 px-6 font-medium  hover:shadow-1 dark:border-strokedark "
                      type="submit"
                    >
                      Annuler
                    </button>
                    <button
                      className="flex justify-center rounded btn btn-primary  py-2 px-6 font-medium text-gray hover:shadow-1"
                      type="submit"
                    >
                      Enregistrer
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="rounded-sm mt-2 mb-2 border border-stroke bg-base-100 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium base-content">
                  Nouveaux articles par excel
                </h3>
              </div>
              <div className="mx-11 mt-6">
                <UploadExcelButtonProduit />
              </div>
            </div>
          </div>
          <div className="col-span-5 xl:col-span-2">
            <div className="rounded-sm border border-stroke bg-base-100 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium base-content">Nouveau client</h3>
              </div>
              <div className="mx-11 mt-6">
                <AddClientForm />
              </div>
            </div>

            <div className="rounded-sm border border-stroke bg-base-100 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium base-content">Nouveau article</h3>
              </div>
              <div className="mx-11 mt-6">
                <AddProduitForm />
              </div>
            </div>

            <div className="rounded-sm mt-2 mb-2 border border-stroke bg-base-100 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium base-content">
                  Nouveaux factures par excel
                </h3>
              </div>
              <div className="mx-11 mt-6">
                <UploadExcelButton />
              </div>
            </div>
          </div>
        </div>

        {/*  */}
      </div>
    </>
  )
}

export default Formulaire
