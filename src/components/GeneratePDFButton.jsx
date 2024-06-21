
import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilePdf } from '@fortawesome/free-solid-svg-icons'
import jsPDF from 'jspdf'
import PropTypes from 'prop-types'
import logoLeft from '../images/bioramlogo.png'
import logoRight from '../images/logo2.png'

function GeneratePDFButton({ invoice }) {
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

  

  const generatePDF =  async () => {
    const doc = new jsPDF()
    const userColor = getColorValue('gris') // Obtenez la couleur hexadécimale

    // Fonction pour charger une image
    const loadImage = src => new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })

    try {
      // Charger les images
      const [imgLeft, imgRight] = await Promise.all([
        loadImage(logoLeft),
        loadImage(logoRight)
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
      // doc.addImage(imgLeft, 'PNG', 20, 5, maxWidth, leftHeight)

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
        `Nom: ${invoice.userId.prenom.toUpperCase()} ${invoice.userId.nom.toUpperCase()}`,
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
      doc.setFontSize(9)
      doc.setFont('helvetica') // Définissez la police en Helvetica et le style en gras
      // doc.text(`${user.nomEntreprise}`, 30, currentY)
      // doc.text(`Informations generale`, 30, currentY)

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
   

      doc.text(
        `Nature: ${invoice.partenaireId?.typePartenaire || 'paf'} `,
        35,
        currentY + 17
      )
      doc.setFont('helvetica', 'normal')
   

      // En-tête des articles avec fond vert
      currentY += 37 // Adjust for marginBottom and header height
      doc.setFillColor(userColor)
      doc.rect(20, currentY, 170, 6, 'F')
      // Vérifie si 'typePartenaire' est 'ipm' ou 'assurance'
      if (
        invoice.partenaireId?.typePartenaire === 'ipm' ||
        invoice.partenaireId?.typePartenaire === 'assurance' || invoice.partenaireId?.typePartenaire === 'sococim'
      ) {
        doc.setTextColor(255, 255, 255)
        doc.text('Analyse', 42, currentY + 4)
        doc.text('B', 110, currentY + 4) // Afficher si 'ipm' ou 'assurance'
        doc.text('Total', 166, currentY + 4)
        currentY += 10
      } else {
      // Ajustez l'affichage si 'typePartenaire' est différent de 'ipm' et 'assurance'
        doc.setTextColor(255, 255, 255)
        doc.text('Analyse', 42, currentY + 4)
        // Notez que 'Coeficiant B' n'est pas affiché dans ce cas
        doc.text('Total', 166, currentY + 4) // Ajuster la position si nécessaire
        currentY += 10
      }

      doc.setFontSize(8)
      doc.setTextColor(0, 0, 0)


      let totalCoefB = 0 // Initialiser le total des coeficiantB

      invoice?.tests.forEach((test, index) => {
      // Assurez-vous que test n'est pas undefined
        if (!test) return
        // Votre logique existante ici pour afficher les détails de chaque test...

        // Additionner les coeficiantB si le type de partenaire est "ipm" ou "assurance"....
        if (['ipm', 'assurance', 'sococim'].includes(invoice.partenaireId?.typePartenaire)) {
          totalCoefB += test.coeficiantB || 0 // Ajouter le coeficiantB à totalCoefB, en assumant 0 si non spécifié
        }

        const testTextHeight = doc.splitTextToSize(test.nom, 50).length * 3
        const testHeight = testTextHeight + 3 // Ajouter une marge

        if (currentY + testHeight > 250) {
          doc.addPage()
          currentY = 20 // Réinitialiser la position Y après l'ajout d'une page
          addFooter() // Fonction à définir pour ajouter un pied de page
        }

        const textY = currentY

        // Choix du prix selon le type de partenaire
        let prixChoisi = test.prixPaf // Valeur par défaut si aucune correspondance n'est trouvée
        let afficherCoefB = false // Détermine si le coefficient B doit être affiché

        if (
          invoice.partenaireId?.typePartenaire === 'assurance' &&
        test.prixAssurance !== undefined
        ) {
          prixChoisi = test.prixAssurance
          afficherCoefB = true // Afficher CoefB pour 'assurance'
        } else if (
          invoice.partenaireId?.typePartenaire === 'ipm' &&
        test.prixIpm !== undefined
        ) {
          prixChoisi = test.prixIpm
          afficherCoefB = true // Afficher CoefB pour 'ipm'
        } else if (
          invoice.partenaireId?.typePartenaire === 'sococim' &&
        test.prixSococim !== undefined
        ) {
          prixChoisi = test.prixSococim
          afficherCoefB = true // Afficher CoefB pour 'ipm'
        } else if (
          invoice.partenaireId?.typePartenaire === 'clinique' &&
        test.prixClinique !== undefined
        ) {
          prixChoisi = test.prixClinique
          
        }
         else if (test.PrixPaf !== undefined) {
          prixChoisi = test.prixPaf
        // Ne pas afficher CoefB si 'paf', ajustez selon votre logique
        }

        prixChoisi = prixChoisi || 0 // S'assurer que prixChoisi a une valeur par défaut

        // Affichage des informations du test
        doc.setFontSize(8)
        doc.text(doc.splitTextToSize(test.nom, 50), 30, textY) // Nom du test

        if (afficherCoefB) {
          const coeficiantB = test.coeficiantB // Utiliser 1 comme valeur par défaut pour coeficiantB
          doc.text(`${coeficiantB}`, 110, textY) // Afficher Coefficient B si afficherCoefB est true
        }

        // Calculer et afficher total
        if (['ipm', 'assurance', 'sococim', 'paf'].includes(invoice.partenaireId?.typePartenaire)) {
          const total = prixChoisi * (test.coeficiantB || 1) // Assumer coeficiantB de 1 si non spécifié
        doc.text(`${total.toFixed(0)}`, 166, textY)
        }else {
          const total = prixChoisi
          doc.text(`${total.toFixed(0)}`, 166, textY)
        }
        

        currentY += testHeight // Mise à jour de Y pour le prochain test

        if (index < invoice.tests.length - 1) {
          doc.setDrawColor(0)
          // doc.line(20, currentY + 2, 190, currentY + 2) // Ligne de séparation
          currentY += 2 // Espacer pour le prochain test
        }
      })

      // Vérification pour l'ajout d'une page avant le total et les informations bancaires
      if (currentY > 250) {
        doc.addPage()
        currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
        addFooter()
      }

      // Total
      doc.setFontSize(8)
      // Ajuster `currentY` pour l'espace après la ligne
      currentY += 5
      // Tracer une ligne avant l'affichage du montant total HT ou de la réduction
      doc.setDrawColor(0) // Définir la couleur de la ligne, ici noire
      doc.setLineWidth(0.1) // Définir l'épaisseur de la ligne
      doc.line(20, currentY, 190, currentY) // Tracer la ligne

      currentY += 5 // Ajuster l'espacement après la ligne

      let currentYv = currentY

      if (invoice.pc1 > 0) {
        doc.text(`PC1: ${invoice.pc1} `, 35, currentYv)
      // Ajustez selon l'espacement désiré entre les lignes
      }

      if (invoice.pc2 > 0) {
        doc.text(`PC2: ${invoice.pc2}`, 50, currentYv)
      }
      // Ajouter un espace avant le Total B si nécessaire
      if (
        invoice.partenaireId?.typePartenaire === 'ipm' ||
        invoice.partenaireId?.typePartenaire === 'assurance' || invoice.partenaireId?.typePartenaire === 'sococim'
      ) {
        doc.text(`Total B: ${totalCoefB.toFixed(0)}`, 97, currentY) // Ajustez la position Y selon vos besoins
      }

      if (invoice.deplacement > 0) {
        doc.text(`Déplacement: ${invoice.deplacement} `, 140, currentYv)
        currentYv += 5 // Ajustez selon l'espacement désiré entre les lignes
      }

      currentY += 2 // Ajuster l'espacement avant de tracer la ligne de fin

      doc.line(20, currentY, 190, currentY) // Tracer la ligne

      // Déterminer l'espace avant la première ligne
      currentY += 2

      // Tracer une ligne avant l'affichage du montant total HT ou de la réduction
      doc.setDrawColor(0) // Définir la couleur de la ligne, ici noire
      doc.setLineWidth(0.1) // Définir l'épaisseur de la ligne
      doc.line(20, currentY, 190, currentY) // Tracer la ligne

      currentY += 5 // Ajuster l'espacement après la ligne

      // Vérifie si 'typePartenaire' n'est ni 'ipm' ni 'assurance'
      if (
        invoice.partenaireId?.typePartenaire !== 'ipm' &&
      invoice.partenaireId?.typePartenaire !== 'assurance' &&
      invoice.partenaireId?.typePartenaire !== 'sococim'
     
      ) {
      doc.setFont('helvetica', 'bold')
      // currentY += 2 // Ajuster selon vos besoins
        doc.text(
          `MONTANT TOTAL HT: ${invoice.prixPatient.toFixed(0)} `,
          122,
          currentY
        )
      }

      doc.setFont('helvetica', 'normal')

      // Ajouter un espace avant la réduction si nécessaire
      if (invoice.reduction > 0) {
      // Déterminez le suffixe à utiliser en fonction du type de réduction
        const reductionSuffix = invoice.typeReduction === 'montant' ? ' ' : '%'

        // Construisez la chaîne de texte pour la réduction en incluant le suffixe approprié
        const reductionText = `Remise: ${invoice.reduction.toFixed(0)} ${reductionSuffix}`

        // Affichez le texte de la réduction à la position Y actuelle
        doc.text(reductionText, 35, currentY) // Ajustez la position Y selon vos besoins

      // Assurez-vous d'ajuster `currentY` si vous avez besoin d'ajouter d'autres lignes après
      // currentY += 5 // Par exemple, ajoutez 5 pour l'espacement avant la prochaine ligne
      }

      currentY += 2 // Ajuster l'espacement avant de tracer la ligne de fin

      // Tracer une ligne après l'affichage du montant total HT, de la réduction et du Total B
      doc.line(20, currentY, 190, currentY) // Tracer la ligne

      currentY += 2
      // Dernière ligne verte
      if (currentY > 250) {
      // Encore une vérification avant d'ajouter la ligne finale
        doc.addPage()
        currentY = 10
        addFooter()
      }

      // Vérifie si 'typePartenaire' est 'ipm' ou 'assurance'
      if (
        invoice.partenaireId?.typePartenaire === 'ipm' ||
      invoice.partenaireId?.typePartenaire === 'assurance' || invoice.partenaireId?.typePartenaire === 'sococim'
      ) {
      // Coordonnées initiales
        let startX = 25 // Position de départ X
        let startY = currentY + 20 // Position de départ Y, ajusté selon votre description
        let tableWidth = 160 // Largeur totale du tableau
        let cellHeight = 6 // Hauteur de chaque ligne

        // Titres des colonnes pour la deuxième ligne
        let columnTitles = [
          'Total',
          'Prix total',
          'Part assureur',
          'Part patient',
        ]

        // Valeurs pour la troisième ligne
        let values = [
          'Total en Cfa (Xof)',
          `${invoice.prixTotal.toFixed(0)} `,
          `${invoice.prixPartenaire.toFixed(0)} `,
          `${invoice.prixPatient.toFixed(0)} `,
        ]

        // Largeur des colonnes (diviser la largeur totale par le nombre de colonnes)
        let columnWidth = tableWidth / columnTitles.length

        // Dessiner la première ligne du tableau avec "Total médical" centré
        doc.setFillColor(userColor) // Couleur de fond pour la première ligne
        doc.rect(startX, startY, tableWidth, cellHeight, 'F') // Rectangle de fond
        doc.setTextColor(255, 255, 255) // Texte en blanc
        doc.text(
          'Total actes médicaux',
          startX + tableWidth / 2,
          startY + cellHeight / 2,
          { align: 'center' }
        )
        doc.setTextColor(0, 0, 0) // Réinitialiser la couleur du texte pour le reste

        // Passer à la ligne suivante pour les titres
        startY += cellHeight

        // Dessiner les titres des colonnes
        columnTitles.forEach((title, index) => {
          doc.text(
            title,
            startX + columnWidth * index + columnWidth / 2,
            startY + cellHeight / 2,
            { align: 'center' }
          )
        })

        // Passer à la ligne suivante pour les valeurs
        startY += cellHeight

        // Dessiner les valeurs dans leurs colonnes respectives
        values.forEach((value, index) => {
          doc.text(
            value,
            startX + columnWidth * index + columnWidth / 2,
            startY + cellHeight / 2,
            { align: 'center' }
          )
        })

        // Mettre à jour currentY pour la position future dans le document
        currentY = startY + cellHeight

        // Mise à jour de startY pour la ligne de pourcentage pour éviter le chevauchement
        startY += cellHeight * 1.5 // Ajoutez un espace supplémentaire avant de dessiner les pourcentages

        // Dessiner la ligne des pourcentages sous les montants
        // La colonne pour 'Total' reste vide pour les pourcentages
        doc.text('', startX + columnWidth * 0.5, startY, { align: 'center' }) // Ajout de 'Pourcentage' sous 'Prix total'
        doc.text('100%', startX + columnWidth * 1.5, startY, { align: 'center' }) // Pourcentage du prix total
        doc.text(
          `${invoice.pourcentageCouverture}%`,
          startX + columnWidth * 2.5,
          startY,
          { align: 'center' }
        ) // Pourcentage de la part de l'assureur
        doc.text(
          `${100 - invoice.pourcentageCouverture}%`,
          startX + columnWidth * 3.5,
          startY,
          { align: 'center' }
        ) // Pourcentage de la part du patient

        // Ajustement de currentY pour continuer le document après cette ligne
        // Assurez-vous d'ajouter suffisamment d'espace après les pourcentages pour éviter tout chevauchement avec le contenu suivant
        currentY = startY + cellHeight / 2 + 10 // Ajoutez un espace supplémentaire après la ligne des pourcentages

        // Ajustement de currentY pour continuer le document après cette ligne
        currentY = startY + cellHeight
      }

  
      // Afficher le reliquat si l'état de la facture est "Reliquat"
if (invoice.statusPayement === 'Reliquat') {
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  currentY +=  5; // Ajuster la position Y pour le reliquat
  doc.text(
    `Reliquat: ${invoice?.reliquat.toFixed(0)} CFA`,
    138,
    currentY
  )

  currentY += 5

  doc.text(
    `Acompte: ${invoice?.avance.toFixed(0)} CFA`,
    138,
    currentY
  )
}
      currentY += 10
      

      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      const text = invoice.statusPayement === 'Reliquat' ? `Facture sous ${invoice.statusPayement}` : `Facture ${invoice.statusPayement}`



      // Dessiner le texte
      doc.text(text, 135, currentY)

      // Calculer la largeur et la hauteur du texte pour dessiner un rectangle autour
      const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor
      const textHeight = doc.getFontSize() / doc.internal.scaleFactor

      // Ajouter un rectangle autour du texte (avec une bordure plus épaisse)
      const padding = 2 // Ajouter un peu d'espace entre le texte et le rectangle
      doc.setLineWidth(0.5) // Épaisseur de la bordure
      doc.rect(135 - padding, currentY - textHeight - padding, textWidth + 2 * padding, textHeight + 2 * padding)

      

      // Dernière ligne verte
      if (currentY > 250) {
      // Encore une vérification avant d'ajouter la ligne finale
        doc.addPage()
        currentY = 20
        addFooter()
      }
      // Avant d'ajouter la mise en garde, assurez-vous qu'il y a assez d'espace pour elle et le pied de page
      // Calculez l'espace nécessaire pour la mise en garde
      // Conversion de la date de récupération au format souhaité
      

      let miseEnGarde = `Facture à ramener au retrait des résultats. `
      // Vérifier si le type de partenaire est différent de "clinique"
if (invoice.partenaireId?.typePartenaire !== 'clinique'){

      // Vérifier si la date de récupération est définie
      if (invoice.dateDeRecuperation) {
        const dateDeRecuperation = new Date(invoice.dateDeRecuperation)
        const options = { year: 'numeric', month: 'long', day: 'numeric' } // Format de date long et localisé
        const formattedDateDeRecuperation = dateDeRecuperation.toLocaleDateString(
          'fr-FR',
          options
        ) // Ajustez 'fr-FR' au besoin

        // Ajouter la date formatée à la mise en garde

        miseEnGarde += `\nRésultats à récupérer le ${formattedDateDeRecuperation}`
      }
    

      // Puis, utilisez `miseEnGarde` où vous avez besoin de l'afficher
      doc.setFont('helvetica', 'bold')
      const miseEnGardeWrapped = doc.splitTextToSize(miseEnGarde, 180) // Ajustez la largeur selon la mise en page de votre PDF
      const miseEnGardeHeight = miseEnGardeWrapped.length * 10 // Estimation de la hauteur nécessaire pour le texte
      doc.setFont('helvetica', 'normal')
      // Calculez la hauteur disponible sur la page
      const availableSpace = 297 - currentY // 297mm est la hauteur d'une page A4

      // Vérifiez si l'espace disponible est suffisant pour la mise en garde et le pied de page
      // Supposons que le pied de page nécessite environ 20mm d'espace
      if (availableSpace < miseEnGardeHeight + 20) {
      // Ajoutez une nouvelle page si l'espace n'est pas suffisant
        doc.addPage()
        currentY = 20 // Réinitialisez la position Y pour le contenu de la nouvelle page
        addFooter() // Appelez votre fonction pour ajouter un pied de page si nécessaire
      }

      // Positionnez `currentY` pour la mise en garde juste au-dessus du pied de page
      // Supposons que le pied de page commence à 277mm du haut, laissez un espace de 5mm au-dessus du pied de page pour la mise en garde
      currentY = 277 - miseEnGardeHeight - 5

      // Ajoutez la mise en garde à la position calculée
      doc.text(miseEnGardeWrapped, 20, currentY)
    }

      // Continuer avec la logique de création du PDF comme avant

      currentY += 20 // Espace avant les informations bancaires
   
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
   
      <FontAwesomeIcon icon={faFilePdf} onClick={generatePDF} />
    
  )
}

GeneratePDFButton.propTypes = {
  invoice: PropTypes.object.isRequired,
}

export default GeneratePDFButton
