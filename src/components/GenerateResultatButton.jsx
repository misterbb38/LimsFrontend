import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import jsPDF from 'jspdf'
import PropTypes from 'prop-types'
import logoLeft from '../images/bioramlogo.png'
import logoRight from '../images/logo2.png'

function GenerateResultatButton({ invoice }) {
  const [user, setUser] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    email: '',
    telephone: '',
    devise: '',
    logo: '',
  })

  // const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  useEffect(() => {
    const fetchUserProfile = async () => {
      const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token

      try {
        const response = await fetch(`${apiUrl}/api/user/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch user profile')
        }

        const data = await response.json()
        console.log(data)
        setUser({
          nom: data.nom || '',
          prenom: data.prenom || '',
          adresse: data.adresse || '',
          email: data.email || '',
          telephone: data.telephone || '',
          devise: data.devise || '',
          logo: data.logo || '', // Initialiser avec le chemin de l'image stockée
          site: data.site || '',
          Type: user.Type || '',
          nomEntreprise: data.nomEntreprise || '',
          couleur: data.couleur || '',
        })
      } catch (error) {
        console.error('Erreur lors de la récupération du profil:', error)
      }
    }

    fetchUserProfile()
  }, [])

  const getColorValue = (colorName) => {
    const colorMap = {
      rouge: '#FF0000', // Rouge
      vert: '#66CDAA', // Vert
      bleu: '#0000FF', // Bleu
      jaune: '#FFFF00', // Jaune
      orange: '#FFA500', // Orange
      violet: '#800080', // Violet
      rose: '#FFC0CB', // Rose
      marron: '#A52A2A', // Marron
      gris: '#808080', // Gris
      noir: '#000000', // Noir
    }

    return colorMap[colorName.toLowerCase()] || '#000000' // Retourne noir par défaut si la couleur n'est pas trouvée
  }

  //Définition des couleurs de fond basées sur le statut
  // const statusColors = {
  //   Attente: { textColor: '#FFFFFF', fillColor: '#FFA500' }, // Orange avec texte blanc
  //   Payée: { textColor: '#FFFFFF', fillColor: '#008000' }, // Vert avec texte blanc
  //   Annullée: { textColor: '#FFFFFF', fillColor: '#FF0000' }, // Rouge avec texte blanc
  // }

  // Récupération de la configuration de couleur basée sur le statut
  // const { textColor, fillColor } = statusColors[invoice.historiques[invoice.historiques.length - 1]
  //   .status]

  const generatePDF = async () => {
    const doc = new jsPDF()
    const userColor = getColorValue('gris') // Obtenez la couleur hexadécimale

    // Fonction pour charger une image
    const loadImage = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })

    try {
      // Charger les images
      const [imgLeft, imgRight] = await Promise.all([
        loadImage(logoLeft),
        loadImage(logoRight),
      ])

      // Ajout des images
      const maxWidth = 30 // Exemple: 30 unités de largeur dans le PDF
      const leftHeight = maxWidth * (imgLeft.height / imgLeft.width)
      const rightHeight = maxWidth * (imgRight.height / imgRight.width)

      doc.addImage(imgLeft, 'PNG', 20, 5, maxWidth, leftHeight)
      // doc.addImage(imgRight, 'PNG', 160, 5, maxWidth, rightHeight)

      const addFooter = () => {
        const footerY = 277 // Y position for footer adjust if needed
        doc.setFillColor(userColor)

        doc.rect(20, footerY, 170, 0.5, 'F')
        doc.setFontSize(6)
        doc.setTextColor(0, 0, 0)
        doc.text(
          `Rufisque Ouest, rond-point SOCABEG vers cité SIPRES - Sortie 9 autoroute à péage Dakar Sénégal Aut. minist. n° 013545-28/03/19`,
          40,
          footerY + 6
        )
        doc.text(
          `Site web : www.bioram.org Tel. +221 78 601 09 09 email : contact@bioram.org`,
          60,
          footerY + 10
        )
        doc.text(
          `RC/SN-DKR-2019 B 13431 -NINEA 0073347059 2E2 `,
          80,
          footerY + 14
        )
      }

      // Ajouter le pied de page à la première page
      addFooter()

      // // Ajout des logos et du texte central
      // const imgLeft = new Image()
      // imgLeft.src = logoLeft
      // const imgRight = new Image()
      // imgRight.src = logoRight
      // // Dimensions originales de l'image
      // const imgWidth = imgLeft.width
      // const imgHeight = imgLeft.height
      // // Largeur maximale pour l'image dans le PDF
      // const maxWidth = 30 // Exemple : 35 unités de largeur dans le PDF

      // // Calcul du rapport hauteur/largeur de l'image
      // const ratio = imgWidth / imgHeight

      // // Calcul de la nouvelle hauteur en conservant le rapport hauteur/largeur
      // const newHeight = maxWidth / ratio

      // Ajout de l'image au PDF avec les nouvelles dimensions
      // La largeur est définie sur maxWidth et la hauteur est ajustée pour conserver le rapport
      doc.setFontSize(12)
      doc.setFont('helvetica')
      doc.text("LABORATOIRE D'ANALYSES MEDICALES", 65, 10)

      doc.setFontSize(7)
      doc.setFont('helvetica')
      doc.text(
        'Hématologie – Immuno-Hématologie – Biochimie – Immunologie – Bactériologie – Virologie – Parasitologie',
        52,
        15
      )
      doc.text('24H/24 7J/7', 98, 18)
      doc.text('Prélèvement à domicile sur rendez-vous', 85, 21)
      doc.text(
        'Tel. +221 78 601 09 09 / 33 836 99 98 email : contact@bioram.org',
        75,
        24
      )
      // doc.addImage(imgLeft, 'PNG', 20, 5, maxWidth, newHeight)

      //doc.addImage(imgLeft, 'PNG', 20, 5, 35, 30)
      // doc.addImage(imgRight, 'PNG', 140, 5, 60, 30)

      doc.setFont('helvetica')
      doc.setTextColor(userColor)

      doc.setFontSize(14)
      doc.text('', 105, 30, null, null, 'center')

      doc.setFillColor(userColor) // Définit la couleur de remplissage
      doc.setLineWidth(0.5) // Définit l'épaisseur de la ligne à 1
      doc.rect(20, 40, 170, 0.5, 'F') // Position X, Position Y, Largeur, Hauteur, Type de remplissage
      doc.setTextColor(0, 0, 0) // Réinitialise la couleur du texte à noir

      // Informations du client
      let currentY = 40 // Mise à jour pour utiliser currentY pour la position initiale
      doc.setFontSize(8) // Changez la taille à la valeur souhaitée
      doc.setFont('helvetica', 'bold') // Définissez la police en Helvetica et le style en gras
      // doc.text(`Informations du patient`, 130, currentY)
      doc.text(`Nº Dossier: ${invoice?.identifiant}`, 135, currentY + 7)
      doc.text(
        `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
        135,
        currentY + 12
      )

      let ageDisplay

      if (invoice.userId.age) {
        // Si l'âge est directement disponible, utilisez-le
        ageDisplay = invoice.userId.age.toString()
      } else if (invoice.userId.dateNaissance) {
        // Sinon, calculez l'âge à partir de la date de naissance
        const birthDate = new Date(invoice.userId.dateNaissance)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()

        // Si l'anniversaire de cette année n'est pas encore passé, soustrayez 1
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--
        }

        ageDisplay = age.toString()
      } else {
        // Si ni l'âge ni la date de naissance ne sont disponibles, affichez un placeholder
        ageDisplay = 'Non disponible'
      }

      // Affiche l'âge ou la date de naissance calculée
      doc.text(`Âge: ${ageDisplay} ans`, 135, currentY + 17)

      doc.text(`Tel: ${invoice.userId.telephone}`, 135, currentY + 22)

      // En-tête de la facture
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold') // Définissez la police en Helvetica et le style en gras

      doc.text(`NIP: ${invoice?.userId.nip}`, 35, currentY + 7)
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(8)
      doc.setFont('helvetica')
      const date = new Date(invoice?.createdAt)
      const formattedDate =
        date.getDate().toString().padStart(2, '0') +
        '/' +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        '/' + // Les mois commencent à 0
        date.getFullYear()

      // Avant d'ajouter le texte, définissez la police sur 'bold' pour la partie "Date:"
      doc.setFont('helvetica')
      doc.text('Date: ', 35, currentY + 12)

      // Calculez la largeur du texte "Date:" pour positionner correctement la date elle-même
      const dateLabelWidth = doc.getTextWidth('Date: ')

      // Réinitialisez la police en style normal pour la date réelle
      doc.setFont('helvetica', 'bold')
      doc.text(formattedDate, 35 + dateLabelWidth, currentY + 12)
      doc.setFont('helvetica', 'normal')

      // doc.text(
      //   `Nature: ${invoice.partenaireId?.typePartenaire || 'paf'} `,
      //   35,
      //   currentY + 17
      // )

      currentY += 37 // Adjust for marginBottom and header height

      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)

      invoice?.resultat.forEach((test, index) => {
        if (!test || !test.testId) return // Ignorer si test ou testId n'est pas défini

        const maxLineWidth = 100
        const maxvaluWidth = 50 // Largeur maximale du texte dans le PDF
        let nomTestLines = doc.splitTextToSize(
          `${test.testId.nom}`,
          maxLineWidth
        )

        // Choisir entre interpretationA et interpretationB en fonction de statutMachine
        let interpretationText = test.statutMachine
          ? test.testId.interpretationA || "Pas d'interprétationA disponible"
          : test.testId.interpretationB || "Pas d'interprétationB disponible"

        let interpretationLines = doc.splitTextToSize(
          `Interprétation:\n ${interpretationText}`,
          maxLineWidth
        )

        // Calcul de l'espace nécessaire pour ce bloc de test
        const spaceNeeded =
          10 * (nomTestLines.length + interpretationLines.length + 3) // Plus les autres lignes

        // Gérer la pagination si nécessaire
        if (currentY + spaceNeeded > 280) {
          doc.addPage()
          currentY = 20 // Réinitialisation de la position Y pour la nouvelle page
        }

        // Ajout des informations du test
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold') // Utilisation de Helvetica en gras
        doc.text(nomTestLines, 20, currentY)
        currentY += 5 * nomTestLines.length // Mise à jour de Y basée sur le nombre de lignes de nom
        doc.setFont('helvetica', 'normal') // Réinitialisation à la police normale pour le reste du texte
        doc.setFontSize(6) // Réduire la taille de la police pour les détails
        let formattedDate = formatDateAndTime(test?.datePrelevement)
        let formattedDateAnterieur = formatDateAndTime(
          test?.dernierResultatAnterieur?.date
        )
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8)
        if (test?.dernierResultatAnterieur) {
          doc.text(
            `${test?.dernierResultatAnterieur?.valeur}`,
            90,
            currentY + 2
          )
          doc.text(`${formattedDateAnterieur}`, 150, currentY + 2)
        }
        doc.text(`${test.valeur}`, 90, currentY + 5)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        // Affichage de la valeur de la machine A ou B en fonction de statutMachine
        let machineValue = test.statutMachine
          ? test.testId.valeurMachineA
          : test.testId.valeurMachineB
        if (machineValue) {
          doc.text(`${machineValue}`, 150, currentY + 5)
        }

        doc.setFontSize(6)
        doc.setFont('helvetica', 'bold')
        // Déterminer quelle machine afficher en fonction de statutMachine
        let machineText = test?.statutMachine
          ? test?.testId?.machineA
          : test?.testId?.machineB

        // Afficher le nom de la machine
        doc.text(`${machineText}`, 20, currentY)

        // Calculer la largeur du texte de la machine pour positionner correctement la méthode
        // let machineTextWidth =
        //   (doc.getStringUnitWidth(machineText) * doc.internal.getFontSize()) /
        //   doc.internal.scaleFactor

        // // Position de début pour le texte de la méthode
        // let methodStartPos = 20 + machineTextWidth + 5 // 5 est un petit espace entre les deux textes

        // // Afficher la méthode si elle existe, juste après le nom de la machine
        // if (test?.methode) {
        //   doc.text(`(${test?.methode})`, methodStartPos, currentY)
        // }

        // Calculer la largeur du texte de la machine pour positionner correctement la méthode
        let machineTextWidth = 0
        if (test?.testId?.machineA || test?.testId?.machineB) {
          const machineText = test?.statutMachine
            ? test?.testId?.machineA
            : test?.testId?.machineB
          machineTextWidth =
            (doc.getStringUnitWidth(machineText || '') *
              doc.internal.getFontSize()) /
            doc.internal.scaleFactor
        }
        // Position de début pour le texte de la méthode
        let methodStartPos = 20 + machineTextWidth + 5 // 5 est un petit espace entre les deux textes

        // Afficher la méthode si elle existe, juste après le nom de la machine
        if (test?.methode) {
          doc.text(`(${test.methode})`, methodStartPos, currentY)
        }

        doc.text(
          `Prélèvement: ${formattedDate} ${test?.typePrelevement}`,
          20,
          currentY + 3
        )
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        currentY += 8 // Increment for one line
        if (test.statutInterpretation) {
          doc.text(interpretationLines, 20, currentY)
          currentY += 5 * interpretationLines.length // Mise à jour de Y basée sur le nombre de lignes d'interprétation
        }
        currentY += 1 // Ajout d'un espace avant le prochain test
      })
      function formatDateAndTime(dateString) {
        const date = new Date(dateString)
        return date.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      }

      // Vérification pour l'ajout d'une page avant le total et les informations bancaires
      if (currentY > 250) {
        doc.addPage()
        currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
        addFooter()
      }

      // Dernière ligne verte
      if (currentY > 250) {
        // Encore une vérification avant d'ajouter la ligne finale
        doc.addPage()
        currentY = 10
        addFooter()
      }

      // Continuer avec la logique de création du PDF comme avant

      // currentY += 20 // Espace avant les informations bancaires

      // doc.save(`facture-${invoice._id}.pdf`)
      const blob = doc.output('blob')
      // Créez une URL à partir du blob
      const url = URL.createObjectURL(blob)
      // Ouvrez le PDF dans un nouvel onglet
      window.open(url, '_blank')
      // Optionnel : libérez l'URL du blob après ouverture
      URL.revokeObjectURL(url)
      console.log(invoice)
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      alert('Une erreur est survenue lors de la génération du PDF.')
    }
  }

  return (
    <button className="btn btn-primary" onClick={generatePDF}>
      <FontAwesomeIcon icon={faDownload} />
    </button>
  )
}

GenerateResultatButton.propTypes = {
  invoice: PropTypes.object.isRequired,
}

export default GenerateResultatButton
