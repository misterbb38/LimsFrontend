import { useState } from 'react'
import Book1 from '../assets/Book1.xlsx'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [questions] = useState([
    {
      id: 1,
      question: "Comment afficher les graphiques KPI sur la page d'accueil?",
      answer:
        "Les graphiques KPI sont affichés automatiquement sur la page d'accueil une fois que vous vous êtes connecté. Ils fournissent une vue d'ensemble des performances clés du laboratoire.",
    },
    {
      id: 2,
      question: 'Comment créer une nouvelle analyse ?',
      answer:
        "Pour créer une nouvelle analyse, cliquez sur le bouton 'Créer une nouvelle analyse' en haut à gauche de la page des analyses. Remplissez les informations requises et cliquez sur 'Enregistrer'.",
    },
    {
      id: 3,
      question: 'Comment filtrer les analyses ?',
      answer:
        "Utilisez les filtres situés en haut de la page des analyses pour trier les analyses par date, statut, numéro de dossier, etc. Les résultats s'afficheront automatiquement dans le tableau en dessous des filtres.",
    },
    {
      id: 4,
      question:
        'Quels sont les boutons disponibles dans la colonne action du tableau des analyses ?',
      answer:
        "Dans la colonne action du tableau des analyses, vous trouverez des boutons pour générer une facture, générer un résultat, voir les détails de l'analyse, modifier l'analyse et supprimer l'analyse.",
    },
    {
      id: 5,
      question: 'Comment ajouter un nouveau patient ?',
      answer:
        "Cliquez sur le bouton 'Ajouter un nouveau client' en haut à gauche de la page des patients. Remplissez les informations du patient et cliquez sur 'Enregistrer'.",
    },
    {
      id: 6,
      question: 'Comment éditer ou supprimer un patient ?',
      answer:
        "Dans le tableau des patients, utilisez les boutons 'Éditer' et 'Supprimer' situés dans la colonne action pour modifier ou supprimer les informations d'un patient.",
    },
    {
      id: 7,
      question: 'Comment ajouter un nouveau personnel ?',
      answer:
        "La procédure est identique à celle pour ajouter un nouveau patient. Cliquez sur 'Ajouter un nouveau personnel' en haut à gauche de la page du personnel, remplissez les informations et cliquez sur 'Enregistrer'.",
    },
    {
      id: 8,
      question: 'Comment modifier ou supprimer un personnel ?',
      answer:
        "Dans le tableau du personnel, utilisez les boutons 'Éditer' et 'Supprimer' situés dans la colonne action pour modifier ou supprimer les informations d'un personnel.",
    },
    {
      id: 9,
      question: 'Comment ajouter un nouveau paramètre ?',
      answer:
        "Sur la page des paramètres, cliquez sur 'Ajouter un paramètre' en haut à gauche. Remplissez les informations requises et cliquez sur 'Enregistrer'.",
    },
    {
      id: 10,
      question: 'Comment modifier ou supprimer un paramètre ?',
      answer:
        "Dans le tableau des paramètres, utilisez les boutons 'Éditer' et 'Supprimer' situés dans la colonne action pour modifier ou supprimer un paramètre.",
    },
    {
      id: 11,
      question: 'Comment gérer les partenaires du laboratoire ?',
      answer:
        "La gestion des partenaires se fait de la même manière que pour les paramètres. Accédez à la page des partenaires, cliquez sur 'Ajouter un partenaire' pour en ajouter un nouveau, et utilisez les boutons 'Éditer' et 'Supprimer' pour gérer les partenaires existants.",
    },
    {
      id: 12,
      question:
        'Quelles informations sont affichées dans la page des étiquettes ?',
      answer:
        'La page des étiquettes contient un tableau avec les informations des analyses liées à un partenaire. Chaque étiquette représente la somme que le partenaire doit payer pour une analyse spécifique.',
    },
    {
      id: 13,
      question: "Comment accéder aux informations de l'utilisateur ?",
      answer:
        "Les informations de l'utilisateur sont accessibles sur la page 'Profil'. Vous pouvez y voir et modifier vos informations personnelles.",
    },
    {
      id: 14,
      question: "Comment voir les détails d'une analyse ?",
      answer:
        "Dans le tableau des analyses, cliquez sur le bouton 'Détails' dans la colonne action. Un popup s'ouvrira avec les informations de l'analyse, y compris les boutons pour ajouter une historique et un résultat.",
    },
    {
      id: 15,
      question: 'Comment ajouter une historique ou un résultat à une analyse ?',
      answer:
        "Dans le popup des détails de l'analyse, utilisez les boutons 'Ajouter une historique' et 'Ajouter un résultat' en haut du popup pour ajouter des informations supplémentaires à l'analyse.",
    },
    {
      id: 16,
      question:
        "Que contient le tableau des historiques dans les détails de l'analyse ?",
      answer:
        "Le tableau des historiques affiche les différentes étapes de l'analyse, effectuées par les intervenants. Vous pouvez éditer ou supprimer chaque historique à l'aide des boutons appropriés.",
    },
    {
      id: 17,
      question:
        "Que contient le tableau des résultats dans les détails de l'analyse ?",
      answer:
        "Le tableau des résultats contient les résultats des analyses effectuées. Vous pouvez éditer ou supprimer chaque résultat à l'aide des boutons appropriés.",
    },
    //
  ])
  const [selectedQuestion, setSelectedQuestion] = useState(null)

  const toggleChat = () => {
    setIsOpen(!isOpen)
    setSelectedQuestion(null) // Réinitialise la question sélectionnée lors de la fermeture du chat
  }

  const handleQuestionClick = (question) => {
    setSelectedQuestion(question)
  }

  const downloadFile = () => {
    const link = document.createElement('a')
    link.href = Book1
    link.download = 'Book1.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end z-[550]">
      {isOpen && (
        <div className="mb-2 p-4 max-w-sm text-base-content bg-base-300 rounded-lg shadow-lg">
          {selectedQuestion ? (
            <div>
              <div className="font-bold text-base-content">
                {selectedQuestion.question}
              </div>
              <div>{selectedQuestion.answer}</div>
              {selectedQuestion.download && (
                <button
                  className="btn btn-sm btn-primary mt-2"
                  onClick={() => downloadFile(selectedQuestion.download)}
                >
                  Télécharger le modèle Excel
                </button>
              )}
              <button
                onClick={() => setSelectedQuestion(null)}
                className="btn btn-sm btn-secondary mt-2"
              >
                Retour aux questions
              </button>
            </div>
          ) : (
            <div>
              <div className="text-sm mb-4 text-base-900 text-bold">
                Cliquez sur une question pour voir la réponse.
              </div>
              <ul className="space-y-2">
                {questions.map((question) => (
                  <li
                    key={question.id}
                    className="cursor-pointer text-base-content hover:text-blue-800"
                    onClick={() => handleQuestionClick(question)}
                  >
                    {question.question}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <button
        onClick={toggleChat}
        className={`btn ${isOpen ? 'btn-error' : 'btn-primary'}`}
      >
        {isOpen ? 'Fermer' : 'FAQ'}
      </button>
    </div>
  )
}

export default Chatbot
