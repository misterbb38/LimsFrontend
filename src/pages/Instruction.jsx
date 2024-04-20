import Chatbot from '../components/Chatbot'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'

const Instruction = () => {
  return (
    <>
      <div className="bg-base-100">
        <Chatbot />
        <NavigationBreadcrumb pageName="Instructions" />
        <div className="p-5">
          <h2 className="text-lg font-bold mb-4">
            Guide d'utilisation détaillé de l'application
          </h2>
          <div className="space-y-4">
            <div className="border border-stroke p-4 rounded-lg shadow">
              <h3 className="font-medium">Connexion et accès</h3>
              <p>
                Après vous être connecté, accédez à la section Paramètres pour
                compléter ou mettre à jour vos informations telles que
                l'adresse, le numéro de téléphone, la devise et la couleur
                préférée.
              </p>
            </div>

            <div className="border border-stroke p-4 rounded-lg shadow">
              <h3 className="font-medium">Création de factures et devis</h3>
              <p>
                Dirigez-vous vers la section Formulaire pour créer des factures
                ou des devis. Vous pouvez choisir un client existant dans le
                menu déroulant ou saisir directement ses informations. Notez
                qu'une seule option est possible par document. Un formulaire sur
                le côté permet d'enregistrer de nouveaux clients, et une
                fonction en bas de page offre la possibilité d'importer des
                factures ou des devis via un fichier Excel.
              </p>
            </div>

            <div className="border border-stroke p-4 rounded-lg shadow">
              <h3 className="font-medium">Gestion et visualisation</h3>
              <p>
                Les sections Factures et Devis vous permettent de gérer,
                filtrer, visualiser, générer en PDF ou supprimer vos documents.
                Exploitez ces outils pour une gestion efficace de vos affaires.
              </p>
            </div>

            <div className="border border-stroke p-4 rounded-lg shadow">
              <h3 className="font-medium">Tableau de bord et analyse</h3>
              <p>
                Le tableau de bord centralise vos inventaires et offre des
                filtres pour analyser vos activités. Utilisez-le pour obtenir un
                aperçu global de vos opérations.
              </p>
            </div>

            <div className="border border-stroke p-4 rounded-lg shadow">
              <h3 className="font-medium">Assistance utilisateur</h3>
              <p>
                En cas de questions ou de problèmes, notre support est à votre
                disposition. Consultez également notre section FAQ pour des
                réponses aux questions fréquentes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Instruction
