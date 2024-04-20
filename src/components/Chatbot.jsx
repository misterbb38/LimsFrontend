import { useState } from 'react'
import Book1 from '../assets/Book1.xlsx'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [questions] = useState([
    {
      id: 1,
      question: 'Comment créer une facture ?',
      answer:
        "Pour créer une facture, rendez-vous dans l'onglet 'Formulaire' du menu du tableau de bord et sur 'Nouvelle facture'. Remplissez les champs requis et cliquez sur 'Enregistrer' pour finaliser.",
    },
    {
      id: 2,
      question: 'Comment créer un client ?',
      answer:
        "Allez dans 'Formulaire' puis sur 'Nouveau client'. Remplissez le formulaire avec les informations du client et appuyez sur 'Entrer' pour sauvegarder.",
    },
    {
      id: 3,
      question: 'Comment créer un devis ?',
      answer:
        "La création d'un devis est similaire à celle d'une facture. La différence réside dans le choix du type : sélectionnez 'Devis' dans le champ type lors de la création.",
    },
    {
      id: 4,
      question: 'Comment ajouter des factures ou devis via Excel ?',
      answer:
        "Accédez à 'Formulaire' puis 'Nouveaux Factures par Excel'. Sélectionnez votre fichier Excel (en respectant le format défini) pour importer vos factures ou devis. Vous pouvez télécharger le modèle Excel ici :",
      download: '../assets/Book1.xlsx', // Assurez-vous que ce chemin est correct
    },
    // Ajoutez d'autres questions et réponses ici...
    {
      id: 5,
      question: 'Comment modifier une facture ?',
      answer:
        "Dans l'onglet 'Facture', vous trouverez une liste de vos factures. Cliquez sur le bouton 'Modifier' dans la colonne action pour éditer une facture. Après modification, cliquez sur 'Enregistrer' ou 'Annuler'.",
    },
    {
      id: 6,
      question: 'Comment modifier un devis ?',
      answer:
        "Suivez le même processus que pour modifier une facture, mais accédez à l'onglet 'Devis' pour trouver votre liste de devis.",
    },
    {
      id: 7,
      question: 'Comment télécharger une facture ou un devis ?',
      answer:
        "Dans les sections 'Facture' ou 'Devis', utilisez le bouton 'GenererPdf' dans le tableau des documents pour télécharger votre document en format PDF.",
    },
    {
      id: 8,
      question: 'Comment modifier les informations de mon entreprise ?',
      answer:
        "Allez dans 'Paramètres' pour éditer les informations de votre entreprise, y compris le logo et la couleur de vos documents. La couleur choisie sera appliquée à vos factures.",
    },
    {
      id: 9,
      question: "Que se passe-t-il à l'approche de la fin de mon abonnement ?",
      answer:
        "Un message d'avertissement vous sera envoyé 7 jours avant l'expiration de votre abonnement. Après la fin de votre abonnement, vous n'aurez plus accès au tableau de bord jusqu'au renouvellement.",
    },
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
