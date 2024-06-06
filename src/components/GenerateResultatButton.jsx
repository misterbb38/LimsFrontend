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

    function addPageNumbers(doc) {
      const pageCount = doc.internal.getNumberOfPages() // Obtenir le nombre total de pages

      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i) // Définir la page courante sur laquelle le numéro de page sera ajouté
        doc.setFontSize(8) // Définir la taille de la police pour le numéro de page
        doc.setTextColor(150) // Définir la couleur du texte pour le numéro de page
        // Ajouter le numéro de page au centre du pied de page de chaque page
        doc.text(` ${i}/${pageCount}`, 185, 275, { align: 'center' })
      }
    }

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

      doc.setFontSize(12)
      doc.setFont('Times')
      doc.text("LABORATOIRE D'ANALYSES MEDICALES", 65, 10)

      doc.setFontSize(7)
      doc.setFont('Times')
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

      doc.setFont('Times')
      doc.setTextColor(userColor)

      doc.setFontSize(14)
      doc.text('', 105, 30, null, null, 'center')

      doc.setFillColor(userColor) // Définit la couleur de remplissage
      doc.setLineWidth(0.5) // Définit l'épaisseur de la ligne à 1
      doc.rect(20, 40, 170, 0.5, 'F') // Position X, Position Y, Largeur, Hauteur, Type de remplissage
      doc.setTextColor(0, 0, 0) // Réinitialise la couleur du texte à noir

      // Informations du client
      let currentY = 40 // Mise à jour pour utiliser currentY pour la position initiale
      doc.setFontSize(10) // Changez la taille à la valeur souhaitée
      doc.setFont('Times', 'bold') // Définissez la police en Times et le style en gras
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
      doc.setFontSize(10)
      doc.setFont('Times', 'bold') // Définissez la police en Times et le style en gras

      doc.text(`NIP: ${invoice?.userId.nip}`, 35, currentY + 7)
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(10)
      doc.setFont('Times')
      const date = new Date(invoice?.createdAt)
      const formattedDate =
        date.getDate().toString().padStart(2, '0') +
        '/' +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        '/' + // Les mois commencent à 0
        date.getFullYear()

      // Avant d'ajouter le texte, définissez la police sur 'bold' pour la partie "Date:"
      doc.setFont('Times')
      doc.text('Date: ', 35, currentY + 12)

      // Calculez la largeur du texte "Date:" pour positionner correctement la date elle-même
      const dateLabelWidth = doc.getTextWidth('Date: ')

      // Réinitialisez la police en style normal pour la date réelle
      doc.setFont('Times', 'bold')
      doc.text(formattedDate, 35 + dateLabelWidth, currentY + 12)
      doc.setFont('Times', 'normal')

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
          `${test.testId.nom.toUpperCase()}`,
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
        doc.setFont('Times', 'bold') // Utilisation de Times en gras
        // doc.text(nomTestLines, 20, currentY)
        if (
          test?.observations &&
          test?.observations?.macroscopique.length > 0
        ) {
          doc.setFontSize(13)
          doc.setFont('Times', 'bold')
          doc.text(nomTestLines, 60, currentY)
        }
        if (test?.observations?.macroscopique.length === 0) {
          doc.setFontSize(13)
          doc.text(nomTestLines, 20, currentY)
        }
        currentY += 5 * nomTestLines.length // Mise à jour de Y basée sur le nombre de lignes de nom
        doc.setFont('Times', 'normal') // Réinitialisation à la police normale pour le reste du texte
        doc.setFontSize(8) // Réduire la taille de la police pour les détails
        let formattedDate = formatDateAndTime(test?.datePrelevement)
        let formattedDateAnterieur = formatDateAndTime(
          test?.dernierResultatAnterieur?.date
        )
        doc.setFont('Times', 'bold')
        doc.setFontSize(8)

        // Ne pas afficher les informations si test?.observations existe
        if (!test?.observations && test?.dernierResultatAnterieur) {
          const valeurAnterieure = test.dernierResultatAnterieur.valeur ?? ''
          const dateAnterieure = formattedDateAnterieur ?? ''
          doc.text('Anterieure', 150, currentY)
          doc.text(valeurAnterieure, 160, currentY + 5)
          doc.text(dateAnterieure, 170, currentY)
        }
        if (test?.observations?.macroscopique.length === 0) {
          doc.text(`${test?.valeur}`, 90, currentY + 5)
        }

        doc.setFont('Times', 'normal')
        doc.setFontSize(8)
        if (test?.observations?.macroscopique.length === 0) {
          // Affichage de la valeur de la machine A ou B en fonction de statutMachine
          let machineValue = test.statutMachine
            ? test.testId.valeurMachineA
            : test.testId.valeurMachineB
          if (machineValue) {
            doc.text(`${machineValue}`, 120, currentY + 5)
          }

          doc.setFontSize(8)
          doc.setFont('Times', 'bold')
          // Déterminer quelle machine afficher en fonction de statutMachine
          let machineText = test?.statutMachine
            ? test?.testId?.machineA
            : test?.testId?.machineB

          // Vérifiez si machineText n'est ni undefined, ni une chaîne vide
          if (machineText) {
            doc.text(` ${machineText}`, 20, currentY)
          } else {
            // Optionnel: vous pouvez commenter ou décommenter la ligne suivante selon vos besoins
            // doc.text('Machine utilisée: Non spécifiée', 20, currentY);
          }
        }

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
        if (test?.observations?.macroscopique.length === 0) {
          doc.text(
            `Prélèvement: ${formattedDate} ${test?.typePrelevement}`,
            20,
            currentY + 3
          )
        }
        doc.setFontSize(8)
        doc.setFont('Times', 'normal')
        currentY += 12 // Increment for one line
        if (test?.observations?.macroscopique.length === 0) {
          if (test?.remarque) {
            doc.text(`${test.remarque}`, 20, currentY)
          }
        }
        currentY += 5 // Increment for one line
        if (test.statutInterpretation) {
          doc.text(interpretationLines, 20, currentY)
          currentY += 5 * interpretationLines.length // Mise à jour de Y basée sur le nombre de lignes d'interprétation
        }
        currentY += 5 // Ajout d'un espace avant le prochain test

        if (
          test?.observations ||
          test?.culture ||
          test?.gram ||
          test?.conclusion ||
          test?.observations?.macroscopique.length > 0
        ) {
          let positionX = 100
          if (
            test?.observations &&
            test?.observations?.macroscopique.length > 0
          ) {
            doc.text(
              ` ${test?.typePrelevement} ${test?.lieuPrelevement}  ${formattedDate}`,
              20,
              currentY - 10
            )
          }

          if (
            test?.observations &&
            test?.observations?.macroscopique.length > 0
          ) {
            doc.setFontSize(10)
            doc.setFont('Times', 'bold')
            doc.text(`EXAMEN MACROSCOPIQUE`, 20, currentY)
            doc.setFontSize(10)
            doc.setFont('Times', 'normal')
            currentY += 5 // Incrémentation de currentY après chaque élément

            if (
              Array.isArray(test?.observations?.macroscopique) &&
              test.observations.macroscopique.length > 0
            ) {
              // Convertir le tableau en une chaîne de caractères, séparée par des virgules et des espaces
              const macroscopiqueText =
                test.observations.macroscopique.join(', ')

              // Afficher le texte formaté dans le PDF
              doc.text(
                `${test?.typePrelevement} : ${macroscopiqueText}`,
                20,
                currentY
              )
              currentY += 7 // Incrémenter currentY pour la prochaine section ou le prochain élément
            }

            if (
              test?.observations?.microscopique &&
              test?.observations?.macroscopique.length > 0
            ) {
              doc.setFontSize(10)
              doc.setFont('Times', 'bold')
              doc.text(`EXAMEN CYTOLOGIQUE`, 20, currentY)
              // currentY += 5
              // doc.text(`Etat Frais`, 25, currentY)
              doc.setFontSize(10)
              doc.setFont('Times', 'normal')
              currentY += 5 // Incrémentation après chaque élément

              // Leucocytes
              if (test?.observations?.microscopique?.leucocytes) {
                let leucocytesText = `${test.observations.microscopique.leucocytes}`
                if (test.observations.microscopique.unite) {
                  leucocytesText += `/${test.observations.microscopique.unite}`
                }

                doc.text('Leucocytes:', 20, currentY)
                doc.text(leucocytesText, positionX, currentY)

                currentY += 5
              }

              // Hématies
              if (test?.observations?.microscopique?.hematies) {
                let hematiesText = `${test.observations.microscopique.hematies}`
                if (test.observations.microscopique.unite) {
                  hematiesText += `/${test.observations.microscopique.unite}`
                }

                doc.text('Hématies:', 20, currentY)
                doc.text(hematiesText, positionX, currentY)

                currentY += 5
              }

              // pH
              if (test?.observations?.microscopique?.ph) {
                doc.text('pH:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.ph}`,
                  positionX,
                  currentY
                )
                currentY += 5
              }

              // Cellules épithéliales
              if (test?.observations?.microscopique?.cellulesEpitheliales) {
                doc.text('Cellules épithéliales:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.cellulesEpitheliales}`,
                  positionX,
                  currentY
                )
                currentY += 5
              }

              // Éléments levuriformes
              if (test?.observations?.microscopique?.elementsLevuriforme) {
                doc.text('Éléments levuriformes:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.elementsLevuriforme}`,
                  positionX,
                  currentY
                )
                currentY += 5
              }

              // Filaments mycéliens
              if (test?.observations?.microscopique?.filamentsMyceliens) {
                doc.text('Filaments mycéliens:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.filamentsMyceliens}`,
                  positionX,
                  currentY
                )
                currentY += 5
              }

              // Trichomonas vaginalis
              if (test?.observations?.microscopique?.trichomonasVaginalis) {
                doc.text('Trichomonas vaginalis:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.trichomonasVaginalis}`,
                  positionX,
                  currentY
                )
                currentY += 5
              }

              // Cristaux
              if (test?.observations?.microscopique?.cristaux) {
                doc.text('Cristaux:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.cristaux}`,
                  positionX,
                  currentY
                )

                // Vérifiez si des détails sur les cristaux sont disponibles et non vides
                if (
                  test.observations.microscopique.cristauxDetails &&
                  test.observations.microscopique.cristauxDetails.length > 0
                ) {
                  // Concaténez tous les détails avec une virgule et un espace comme séparateur
                  let detailsText =
                    test.observations.microscopique.cristauxDetails.join(', ')

                  // Réduire la taille de la police pour les détails
                  doc.setFontSize(7)

                  // Déterminer la largeur maximale pour le texte, ajuster selon les besoins
                  let maxWidth = 85 // Ajustez cette valeur en fonction de la largeur disponible sur la page

                  // Utilisez splitTextToSize pour gérer le débordement du texte
                  let splitText = doc.splitTextToSize(
                    `(${detailsText})`,
                    maxWidth
                  )

                  // Imprime chaque ligne du texte divisé, ajustant la position Y pour chaque nouvelle ligne
                  splitText.forEach((line) => {
                    doc.text(line, positionX + 20, currentY) // Ajustez positionX + 20 si nécessaire
                    currentY += 5 // Ajustez l'espacement entre les lignes si nécessaire
                  })

                  // Restaurez la taille de la police pour d'autres textes
                  doc.setFontSize(10)
                } else {
                  // Augmenter currentY pour le prochain élément si aucun détail n'est ajouté
                  currentY += 5
                }
              }

              // Cylindres
              if (test?.observations?.microscopique?.cylindres) {
                doc.text('Cylindres:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.cylindres}`,
                  positionX,
                  currentY
                )
                currentY += 7
              }

              // Parasites
              if (test?.observations?.microscopique?.parasites) {
                doc.text('Parasites:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.parasites}`,
                  positionX,
                  currentY
                )

                // Vérifiez si des détails sur les parasites sont disponibles et non vides
                if (
                  test.observations.microscopique.parasitesDetails &&
                  test.observations.microscopique.parasitesDetails.length > 0
                ) {
                  // Concaténez tous les détails avec une virgule et un espace comme séparateur
                  let detailsText =
                    test.observations.microscopique.parasitesDetails.join(', ')

                  // Réduire la taille de la police pour les détails
                  doc.setFontSize(7)

                  // Déterminer la largeur maximale pour le texte, ajuster selon les besoins
                  let maxWidth = 85 // Ajustez cette valeur en fonction de la largeur disponible sur la page

                  // Utilisez splitTextToSize pour gérer le débordement du texte
                  let splitText = doc.splitTextToSize(
                    `(${detailsText})`,
                    maxWidth
                  )

                  // Imprime chaque ligne du texte divisé, ajustant la position Y pour chaque nouvelle ligne
                  splitText.forEach((line) => {
                    doc.text(line, positionX + 20, currentY) // Ajustez positionX + 20 si nécessaire
                    currentY += 5 // Ajustez l'espacement entre les lignes si nécessaire
                  })

                  // Restaurez la taille de la police pour d'autres textes
                  doc.setFontSize(10)
                } else {
                  // Augmenter currentY pour le prochain élément si aucun détail n'est ajouté
                  currentY += 5
                }
              }

              // Trichomonas intestinales
              if (test?.observations?.microscopique?.trichomonasIntestinales) {
                doc.text('Trichomonas intestinales:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.trichomonasIntestinales}`,
                  positionX,
                  currentY
                )
                currentY += 5
              }

              // Œufs de Bilharzies
              if (test?.observations?.microscopique?.oeufsDeBilharzies) {
                doc.text('Œufs de Bilharzies:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.oeufsDeBilharzies}`,
                  positionX,
                  currentY
                )
                currentY += 5
              }

              // Clue Cells
              if (test?.observations?.microscopique?.clueCells) {
                doc.text('Clue Cells:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.clueCells}`,
                  positionX,
                  currentY
                )
                currentY += 5
              }

              // Gardnerella vaginalis
              if (test?.observations?.microscopique?.gardnerellaVaginalis) {
                doc.text('Gardnerella vaginalis:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.gardnerellaVaginalis}`,
                  positionX,
                  currentY
                )
                currentY += 5
              }

              // Bacilles de Doderlein
              if (test?.observations?.microscopique?.bacillesDeDoderlein) {
                doc.text('Bacilles de Doderlein:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.bacillesDeDoderlein}`,
                  positionX,
                  currentY
                )
                currentY += 5
              }

              // Type de Flore
              if (test?.observations?.microscopique?.typeDeFlore) {
                doc.text('Type de Flore:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.typeDeFlore}`,
                  positionX,
                  currentY
                )
                currentY += 5
              }

              // Recherche de Streptocoque B
              if (test?.observations?.microscopique?.rechercheDeStreptocoqueB) {
                doc.text('Recherche de Streptocoque B:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.rechercheDeStreptocoqueB}`,
                  positionX,
                  currentY
                )
                currentY += 5
              }

              // Monocytes
              if (test?.observations?.microscopique?.monocytes) {
                doc.text('Monocytes:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.monocytes}%`,
                  positionX,
                  currentY
                )
                currentY += 5 // Peut-être un peu plus d'espace après le dernier élément
              }
              // Polynucléaires neutrophiles altérées
              if (
                test?.observations?.microscopique
                  ?.polynucleairesNeutrophilesAlterees
              ) {
                doc.text('Polynucléaires neutrophiles altérées:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.polynucleairesNeutrophilesAlterees}%`,
                  positionX, // Assurez-vous d'ajuster la position X selon la longueur du texte précédent
                  currentY
                )
                currentY += 5 // Ajoute un espace après l'élément
              }

              // Polynucléaires neutrophiles non altérées
              if (
                test?.observations?.microscopique
                  ?.polynucleairesNeutrophilesNonAlterees
              ) {
                doc.text(
                  'Polynucléaires neutrophiles non altérées:',
                  20,
                  currentY
                )
                doc.text(
                  `${test.observations.microscopique.polynucleairesNeutrophilesNonAlterees}%`,
                  positionX, // Ajustez cette valeur comme nécessaire
                  currentY
                )
                currentY += 5 // Ajoute un espace après l'élément
              }

              // Éosinophiles
              if (test?.observations?.microscopique?.eosinophiles) {
                doc.text('Éosinophiles:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.eosinophiles}%`,
                  positionX, // Ajustez cette valeur comme nécessaire
                  currentY
                )
                currentY += 5 // Ajoute un espace après l'élément
              }

              // Basophiles
              if (test?.observations?.microscopique?.basophiles) {
                doc.text('Basophiles:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.basophiles}%`,
                  positionX, // Ajustez cette valeur comme nécessaire
                  currentY
                )
                currentY += 7 // Ajoute un espace après l'élément
              }
            }

            // Vérification pour l'ajout d'une page avant le total et les informations bancaires
            if (currentY > 250) {
              doc.addPage()
              currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
              doc.text(`Nº Dossier: ${invoice?.identifiant}`, 75, currentY)
              currentY
              doc.text(
                `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
                42,
                currentY
              )
              currentY += 5
              addFooter()
            }
            if (test?.observations?.chimie) {
              const {
                proteinesTotales,
                proteinesArochies,
                glycorachie,
                acideUrique,
                LDH,
              } = test.observations.chimie

              // Vérifier si tous les champs sont vides
              if (
                proteinesTotales ||
                proteinesArochies ||
                glycorachie ||
                acideUrique ||
                LDH
              ) {
                doc.setFontSize(10)
                doc.setFont('Times', 'bold')
                doc.text(`CHIMIE`, 20, currentY)
                currentY += 5
                doc.setFontSize(10)
                doc.setFont('Times', 'normal')

                // Proteines Totales
                if (proteinesTotales) {
                  doc.text('Proteines Totales:', 20, currentY)
                  doc.text(proteinesTotales, positionX, currentY)
                  doc.text('g/L', positionX + 10, currentY)
                  currentY += 5
                }

                // Proteines Arochies
                if (proteinesArochies) {
                  doc.text('Proteines Arochies:', 20, currentY)
                  doc.text(proteinesArochies, positionX, currentY)
                  doc.text(`g/L `, positionX + 10, currentY)
                  doc.text(`(0,2-0,4)`, positionX + 17, currentY)
                  currentY += 5
                }

                // Glycorachie
                if (glycorachie) {
                  doc.text('Glycorachie:', 20, currentY)
                  doc.text(glycorachie, positionX, currentY)
                  doc.text(`g/L `, positionX + 10, currentY)
                  doc.text(`(0,2-0,4)`, positionX + 17, currentY)
                  currentY += 5
                }

                // Acide Urique
                if (acideUrique) {
                  doc.text('Acide Urique:', 20, currentY)
                  doc.text(acideUrique, positionX, currentY)
                  doc.text('mg/L', positionX + 10, currentY)
                  currentY += 5
                }

                // LDH
                if (LDH) {
                  doc.text('LDH:', 20, currentY)
                  doc.text(LDH, positionX, currentY)
                  doc.text('U/I', positionX + 10, currentY)
                  currentY += 7
                }
              }
            }

            if (currentY > 250) {
              doc.addPage()
              currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
              doc.text(`Nº Dossier: ${invoice?.identifiant}`, 75, currentY)
              currentY
              doc.text(
                `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
                42,
                currentY
              )
              currentY += 5
              addFooter()
            }
          }
          if (test?.gram) {
            doc.setFontSize(10)
            doc.setFont('Times', 'bold')
            doc.text(
              `EXAMEN BACTERIOLOGIE DIRECT  (Coloration de gram)`,
              20,
              currentY
            )
            currentY += 8
            doc.setFontSize(10)
            doc.setFont('Times', 'normal')
            doc.text(`Gram:`, 20, currentY)

            doc.text(`${test?.gram}`, positionX, currentY)
            currentY += 8
          }
          // Vérification pour l'ajout d'une page avant le total et les informations bancaires
          if (currentY > 250) {
            doc.addPage()
            currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
            doc.text(`Nº Dossier: ${invoice?.identifiant}`, 75, currentY)
            currentY
            doc.text(
              `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
              42,
              currentY
            )
            currentY += 5
            addFooter()
          }

          if (test?.culture) {
            const { culture, germeIdentifie, description } = test?.culture

            if (
              culture ||
              (Array.isArray(germeIdentifie) && germeIdentifie.length > 0) ||
              description
            ) {
              // Vérifier si au moins un des champs est présent
              doc.setFontSize(10)
              doc.setFont('Times', 'bold')
              doc.text(`CULTURES SUR MILIEUX SPECIFIQUES:`, 20, currentY)
              currentY += 5
              doc.setFontSize(10)
              doc.setFont('Times', 'normal')

              if (culture) {
                doc.text(`Culture:`, 20, currentY)
                doc.text(culture, positionX, currentY)
                currentY += 5
              }

              if (
                Array.isArray(test.culture.germeIdentifie) &&
                test.culture.germeIdentifie.length > 0
              ) {
                // Extraire uniquement les noms des germes
                const germeIdentifieText = test.culture.germeIdentifie
                  .map((germe) => germe.nom)
                  .join(', ')

                // Définir la largeur maximale pour le texte (85 caractères dans votre cas)
                const maxWidth = 95 // Ajuster cette valeur en fonction de la largeur disponible sur votre page PDF

                // Utiliser splitTextToSize pour gérer les retours à la ligne automatiquement
                let splitText = doc.splitTextToSize(
                  germeIdentifieText,
                  maxWidth
                )

                // Appliquer le texte avec des retours à la ligne
                doc.setFont('Times', 'italic') // Changer la police en italique
                doc.text(`Germe(s) Identifié(s):`, 20, currentY)
                splitText.forEach((line) => {
                  doc.text(line, positionX, currentY)
                  currentY += 5 // Incrémenter la position Y pour chaque nouvelle ligne
                })
                doc.setFont('Times', 'normal') // Revenir à la police normale
                currentY += 5 // Espace supplémentaire après la liste des germes
              }

              if (description) {
                doc.text(`Numeration:`, 20, currentY)
                doc.text(description, positionX, currentY)
                currentY += 7
              }
            }
          }

          // Vérification pour l'ajout d'une page avant le total et les informations bancaires
          if (currentY > 250) {
            doc.addPage()
            currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
            doc.text(`Nº Dossier: ${invoice?.identifiant}`, 75, currentY)
            currentY
            doc.text(
              `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
              42,
              currentY
            )
            currentY += 5
            addFooter()
          }

          // Recherche de Chlamydia
          if (test?.observations?.rechercheChlamydia) {
            const { naturePrelevement, rechercheAntigeneChlamydiaTrochomatis } =
              test.observations.rechercheChlamydia

            if (naturePrelevement || rechercheAntigeneChlamydiaTrochomatis) {
              doc.setFontSize(10)
              doc.setFont('Times', 'bold')
              doc.text('RECHERCHE DE CHLAMYDIA', 20, currentY)
              currentY += 5
              doc.setFontSize(10)
              doc.setFont('Times', 'normal')

              // Nature du prélèvement
              if (naturePrelevement) {
                doc.text('Nature du prélèvement:', 20, currentY)
                doc.text(naturePrelevement, positionX, currentY)
                currentY += 5
              }

              // Recherche d'antigène de Chlamydia trachomatis
              if (rechercheAntigeneChlamydiaTrochomatis) {
                doc.text(
                  "Recherche d'antigène de Chlamydia trachomatis:",
                  20,
                  currentY
                )
                doc.text(
                  rechercheAntigeneChlamydiaTrochomatis,
                  positionX,
                  currentY
                )
                currentY += 7
              }
            }
          }

          // Recherche de Mycoplasmes
          if (test?.observations?.rechercheMycoplasmes) {
            const {
              naturePrelevement,
              rechercheUreaplasmaUrealyticum,
              rechercheMycoplasmaHominis,
            } = test.observations.rechercheMycoplasmes

            if (
              naturePrelevement ||
              rechercheUreaplasmaUrealyticum ||
              rechercheMycoplasmaHominis
            ) {
              doc.setFontSize(10)
              doc.setFont('Times', 'bold')
              doc.text('RECHERCHE DE MYCOPLASMES', 20, currentY)
              currentY += 5
              doc.setFontSize(10)
              doc.setFont('Times', 'normal')

              // Nature du prélèvement
              if (naturePrelevement) {
                doc.text('Nature du prélèvement:', 20, currentY)
                doc.text(naturePrelevement, positionX, currentY)
                currentY += 5
              }

              // Recherche d'Ureaplasma urealyticum
              if (rechercheUreaplasmaUrealyticum) {
                doc.text("Recherche d'Ureaplasma urealyticum:", 20, currentY)
                doc.text(rechercheUreaplasmaUrealyticum, positionX, currentY)
                currentY += 5
              }

              // Recherche de Mycoplasma hominis
              if (rechercheMycoplasmaHominis) {
                doc.text('Recherche de Mycoplasma hominis:', 20, currentY)
                doc.text(rechercheMycoplasmaHominis, positionX, currentY)
                currentY += 7
              }
            }
          }

          if (test?.conclusion) {
            doc.setFontSize(10)
            doc.setFont('Times', 'bold')
            doc.text('CONCLUSION', 20, currentY)
            currentY += 5

            const maxLineWidth = 100
            const conclusionLines = doc.splitTextToSize(
              test?.conclusion,
              maxLineWidth
            )
            doc.text(conclusionLines, 20, currentY)

            currentY += conclusionLines.length * 5 // Mise à jour de currentY basée sur le nombre de lignes de la conclusion
            doc.setFontSize(10)
            doc.setFont('Times', 'normal')
            currentY += 5
          }

          if (test?.observations?.macroscopique.length > 0) {
            if (test?.remarque) {
              doc.text(`Remarque: ${test.remarque}`, 20, currentY)
            }
          }

          currentY += 5

          // Gérer les antibiogrammes
          if (test.culture && Array.isArray(test.culture.germeIdentifie)) {
            test.culture.germeIdentifie.forEach((germe) => {
              // Vérifier si l'antibiogramme n'est pas vide
              if (Object.keys(germe.antibiogramme).length > 0) {
                doc.addPage() // Démarre chaque antibiogramme sur une nouvelle page
                addFooter()
                currentY = 15 // Position Y initiale pour chaque nouvelle page
                doc.text(`Nº Dossier: ${invoice?.identifiant}`, 75, currentY)
                currentY
                doc.text(
                  `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
                  42,
                  currentY
                )
                currentY += 5

                doc.setFontSize(10)
                doc.setFont('Times', 'bold')
                doc.text(`ANTIBIOGRAMME : ${germe.nom}`, 42, currentY)
                currentY += 7

                doc.setFont('Times', 'normal')
                // En-têtes de colonne avec bordures
                const columnWidthAntibiotique = 70
                const columnWidthSensibilite = 30
                const lineHeight = 7

                // Dessiner les bordures pour les en-têtes
                doc.rect(40, currentY, columnWidthAntibiotique, lineHeight)
                doc.rect(110, currentY, columnWidthSensibilite, lineHeight)
                doc.text('Antibiotique', 42, currentY + 5)
                doc.text('Sensibilité', 112, currentY + 5)
                currentY += lineHeight

                // Données de l'antibiogramme
                Object.entries(germe.antibiogramme).forEach(
                  ([antibiotique, sensibilite]) => {
                    doc.rect(40, currentY, columnWidthAntibiotique, lineHeight)
                    doc.rect(110, currentY, columnWidthSensibilite, lineHeight)
                    doc.text(antibiotique, 42, currentY + 5)
                    doc.text(sensibilite, 112, currentY + 5)
                    currentY += lineHeight
                  }
                )

                currentY += 5
                doc.text(
                  'S : Sensible    I : Intermédiaire     R : Résistant',
                  42,
                  currentY
                )
              }
            })
          }
          currentY += 15
          
          
        }
      })
      function formatDateAndTime(dateString) {
        const date = new Date(dateString)
        return date.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      }

      const validatedHistory = invoice.historiques.find(
        (h) => h.status === 'Validé'
      )
      let validatedBy = 'Non spécifié'
      if (validatedHistory && validatedHistory.updatedBy) {
        validatedBy = `${validatedHistory.updatedBy.prenom} ${validatedHistory.updatedBy.nom}`
        doc.setFontSize(10)
        doc.setFont('Times', 'bold')
        doc.text(`Validé par: ${validatedBy}`, 110, currentY)
        
        doc.setFont('Times', 'normal')
        doc.setFontSize(8)
        // doc.text(
        //   `${formatDateAndTime(validatedHistory.updatedBy.createdAt)}`,
        //   150,
        //   currentY + 4
        // )
      }
      // Affichage du médecin qui a validé l'analyse

      currentY += 5 // Incrément pour passer à la section suivante
      // Positionnement initial pour les détails

      const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
      const validatedHistoryLogo = invoice.historiques.find(
        (h) => h.status === 'Validé'
      )
      if (
        validatedHistoryLogo &&
        validatedHistoryLogo.updatedBy &&
        validatedHistoryLogo.updatedBy.logo
      ) {
        const logoPath = validatedHistoryLogo.updatedBy.logo.replace(/\\/g, '/')
        const fullLogoPath = `${apiUrl}/${logoPath}`

        const doctorLogo = await loadImage(fullLogoPath)
        const doctorLogoHeight = 50 * (doctorLogo.height / doctorLogo.width)
        doc.addImage(doctorLogo, 'PNG', 110, currentY, 50, doctorLogoHeight)
      }

      // // Vérification pour l'ajout d'une page avant le total et les informations bancaires
      // if (currentY > 250) {
      //   doc.addPage()
      //   currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
      //   addFooter()
      // }
      // if (invoice?.observations?.antibiogramme) {
      //   doc.addPage()
      //   currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
      //   addFooter()
      // }

      // Dernière ligne verte
      // if (currentY > 250) {
      //   // Encore une vérification avant d'ajouter la ligne finale
      //   doc.addPage()
      //   currentY = 10
      //   addFooter()
      // }

      // Continuer avec la logique de création du PDF comme avant

      // currentY += 20 // Espace avant les informations bancaires
      // Ajouter des numéros de page juste avant de finaliser le document
      addPageNumbers(doc)
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




// import { useState, useEffect } from 'react'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faDownload } from '@fortawesome/free-solid-svg-icons'
// import jsPDF from 'jspdf'
// import PropTypes from 'prop-types'
// import logoLeft from '../images/bioramlogo.png'
// import logoRight from '../images/logo2.png'
// import { useNavigate } from 'react-router-dom' // Importez useNavigate



// function GenerateResultatButton({ invoice }) {
//   const [user, setUser] = useState({
//     nom: '',
//     prenom: '',
//     adresse: '',
//     email: '',
//     telephone: '',
//     devise: '',
//     logo: '',
//   })

//   const navigate = useNavigate() // Utilisez useNavigate pour la navigation
//   // const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
//       const userInfo = JSON.parse(localStorage.getItem('userInfo'))
//       const token = userInfo?.token

//       try {
//         const response = await fetch(`${apiUrl}/api/user/profile`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         })

//         if (!response.ok) {
//           throw new Error('Failed to fetch user profile')
//         }

//         const data = await response.json()
//         console.log(data)
//         setUser({
//           nom: data.nom || '',
//           prenom: data.prenom || '',
//           adresse: data.adresse || '',
//           email: data.email || '',
//           telephone: data.telephone || '',
//           devise: data.devise || '',
//           logo: data.logo || '', // Initialiser avec le chemin de l'image stockée
//           site: data.site || '',
//           Type: user.Type || '',
//           nomEntreprise: data.nomEntreprise || '',
//           couleur: data.couleur || '',
//         })
//       } catch (error) {
//         console.error('Erreur lors de la récupération du profil:', error)
//       }
//     }

//     fetchUserProfile()
//   }, [])

//   const getColorValue = (colorName) => {
//     const colorMap = {
//       rouge: '#FF0000', // Rouge
//       vert: '#66CDAA', // Vert
//       bleu: '#0000FF', // Bleu
//       jaune: '#FFFF00', // Jaune
//       orange: '#FFA500', // Orange
//       violet: '#800080', // Violet
//       rose: '#FFC0CB', // Rose
//       marron: '#A52A2A', // Marron
//       gris: '#808080', // Gris
//       noir: '#000000', // Noir
//     }

//     return colorMap[colorName.toLowerCase()] || '#000000' // Retourne noir par défaut si la couleur n'est pas trouvée
//   }

//   const generatePDF = async () => {
//     const doc = new jsPDF()
//     const userColor = getColorValue('gris') // Obtenez la couleur hexadécimale

//     // Fonction pour charger une image
//     const loadImage = (src) =>
//       new Promise((resolve, reject) => {
//         const img = new Image()
//         img.onload = () => resolve(img)
//         img.onerror = reject
//         img.src = src
//       })

//     function addPageNumbers(doc) {
//       const pageCount = doc.internal.getNumberOfPages() // Obtenir le nombre total de pages

//       for (let i = 1; i <= pageCount; i++) {
//         doc.setPage(i) // Définir la page courante sur laquelle le numéro de page sera ajouté
//         doc.setFontSize(8) // Définir la taille de la police pour le numéro de page
//         doc.setTextColor(150) // Définir la couleur du texte pour le numéro de page
//         // Ajouter le numéro de page au centre du pied de page de chaque page
//         doc.text(` ${i}/${pageCount}`, 185, 275, { align: 'center' })
//       }
//     }

//     try {
//       // Charger les images

//       const [imgLeft, imgRight] = await Promise.all([
//         loadImage(logoLeft),
//         loadImage(logoRight),
//       ])

//       // Ajout des images
//       const maxWidth = 30 // Exemple: 30 unités de largeur dans le PDF
//       const leftHeight = maxWidth * (imgLeft.height / imgLeft.width)
//       const rightHeight = maxWidth * (imgRight.height / imgRight.width)

//       doc.addImage(imgLeft, 'PNG', 20, 5, maxWidth, leftHeight)
//       // doc.addImage(imgRight, 'PNG', 160, 5, maxWidth, rightHeight)

//       const addFooter = () => {
//         const footerY = 277 // Y position for footer adjust if needed
//         doc.setFillColor(userColor)

//         doc.rect(20, footerY, 170, 0.5, 'F')
//         doc.setFontSize(6)
//         doc.setTextColor(0, 0, 0)
//         doc.text(
//           `Rufisque Ouest, rond-point SOCABEG vers cité SIPRES - Sortie 9 autoroute à péage Dakar Sénégal Aut. minist. n° 013545-28/03/19`,
//           40,
//           footerY + 6
//         )
//         doc.text(
//           `Site web : www.bioram.org Tel. +221 78 601 09 09 email : contact@bioram.org`,
//           60,
//           footerY + 10
//         )
//         doc.text(
//           `RC/SN-DKR-2019 B 13431 -NINEA 0073347059 2E2 `,
//           80,
//           footerY + 14
//         )
//       }

//       // Ajouter le pied de page à la première page
//       addFooter()

//       doc.setFontSize(12)
//       doc.setFont('Times')
//       doc.text("LABORATOIRE D'ANALYSES MEDICALES", 65, 10)

//       doc.setFontSize(7)
//       doc.setFont('Times')
//       doc.text(
//         'Hématologie – Immuno-Hématologie – Biochimie – Immunologie – Bactériologie – Virologie – Parasitologie',
//         52,
//         15
//       )
//       doc.text('24H/24 7J/7', 98, 18)
//       doc.text('Prélèvement à domicile sur rendez-vous', 85, 21)
//       doc.text(
//         'Tel. +221 78 601 09 09 / 33 836 99 98 email : contact@bioram.org',
//         75,
//         24
//       )
//       // doc.addImage(imgLeft, 'PNG', 20, 5, maxWidth, newHeight)

//       //doc.addImage(imgLeft, 'PNG', 20, 5, 35, 30)
//       // doc.addImage(imgRight, 'PNG', 140, 5, 60, 30)

//       doc.setFont('Times')
//       doc.setTextColor(userColor)

//       doc.setFontSize(14)
//       doc.text('', 105, 30, null, null, 'center')

//       doc.setFillColor(userColor) // Définit la couleur de remplissage
//       doc.setLineWidth(0.5) // Définit l'épaisseur de la ligne à 1
//       doc.rect(20, 40, 170, 0.5, 'F') // Position X, Position Y, Largeur, Hauteur, Type de remplissage
//       doc.setTextColor(0, 0, 0) // Réinitialise la couleur du texte à noir

//       // Informations du client
//       let currentY = 40 // Mise à jour pour utiliser currentY pour la position initiale
//       doc.setFontSize(10) // Changez la taille à la valeur souhaitée
//       doc.setFont('Times', 'bold') // Définissez la police en Times et le style en gras
//       // doc.text(`Informations du patient`, 130, currentY)
//       doc.text(`Nº Dossier: ${invoice?.identifiant}`, 135, currentY + 7)
//       doc.text(
//         `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
//         135,
//         currentY + 12
//       )

//       let ageDisplay

//       if (invoice.userId.age) {
//         // Si l'âge est directement disponible, utilisez-le
//         ageDisplay = invoice.userId.age.toString()
//       } else if (invoice.userId.dateNaissance) {
//         // Sinon, calculez l'âge à partir de la date de naissance
//         const birthDate = new Date(invoice.userId.dateNaissance)
//         const today = new Date()
//         let age = today.getFullYear() - birthDate.getFullYear()
//         const m = today.getMonth() - birthDate.getMonth()

//         // Si l'anniversaire de cette année n'est pas encore passé, soustrayez 1
//         if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//           age--
//         }

//         ageDisplay = age.toString()
//       } else {
//         // Si ni l'âge ni la date de naissance ne sont disponibles, affichez un placeholder
//         ageDisplay = 'Non disponible'
//       }

//       // Affiche l'âge ou la date de naissance calculée
//       doc.text(`Âge: ${ageDisplay} ans`, 135, currentY + 17)

//       doc.text(`Tel: ${invoice.userId.telephone}`, 135, currentY + 22)

//       // En-tête de la facture
//       doc.setFontSize(10)
//       doc.setFont('Times', 'bold') // Définissez la police en Times et le style en gras

//       doc.text(`NIP: ${invoice?.userId.nip}`, 35, currentY + 7)
//       doc.setTextColor(0, 0, 0)
//       doc.setFontSize(10)
//       doc.setFont('Times')
//       const date = new Date(invoice?.createdAt)
//       const formattedDate =
//         date.getDate().toString().padStart(2, '0') +
//         '/' +
//         (date.getMonth() + 1).toString().padStart(2, '0') +
//         '/' + // Les mois commencent à 0
//         date.getFullYear()

//       // Avant d'ajouter le texte, définissez la police sur 'bold' pour la partie "Date:"
//       doc.setFont('Times')
//       doc.text('Date: ', 35, currentY + 12)

//       // Calculez la largeur du texte "Date:" pour positionner correctement la date elle-même
//       const dateLabelWidth = doc.getTextWidth('Date: ')

//       // Réinitialisez la police en style normal pour la date réelle
//       doc.setFont('Times', 'bold')
//       doc.text(formattedDate, 35 + dateLabelWidth, currentY + 12)
//       doc.setFont('Times', 'normal')

//       // doc.text(
//       //   `Nature: ${invoice.partenaireId?.typePartenaire || 'paf'} `,
//       //   35,
//       //   currentY + 17
//       // )

//       currentY += 37 // Adjust for marginBottom and header height

//       doc.setFontSize(8)
//       doc.setTextColor(0, 0, 0)

//       invoice?.resultat.forEach((test, index) => {
//         if (!test || !test.testId) return // Ignorer si test ou testId n'est pas défini

//         const maxLineWidth = 100
//         const maxvaluWidth = 50 // Largeur maximale du texte dans le PDF
//         let nomTestLines = doc.splitTextToSize(
//           `${test.testId.nom.toUpperCase()}`,
//           maxLineWidth
//         )

//         // Choisir entre interpretationA et interpretationB en fonction de statutMachine
//         let interpretationText = test.statutMachine
//           ? test.testId.interpretationA || "Pas d'interprétationA disponible"
//           : test.testId.interpretationB || "Pas d'interprétationB disponible"

//         let interpretationLines = doc.splitTextToSize(
//           `Interprétation:\n ${interpretationText}`,
//           maxLineWidth
//         )

//         // Calcul de l'espace nécessaire pour ce bloc de test
//         const spaceNeeded =
//           10 * (nomTestLines.length + interpretationLines.length + 3) // Plus les autres lignes

//         // Gérer la pagination si nécessaire
//         if (currentY + spaceNeeded > 280) {
//           doc.addPage()
//           currentY = 20 // Réinitialisation de la position Y pour la nouvelle page
//         }

//         // Ajout des informations du test
//         doc.setFontSize(10)
//         doc.setFont('Times', 'bold') // Utilisation de Times en gras
//         // doc.text(nomTestLines, 20, currentY)
//         if (
//           test?.observations &&
//           test?.observations?.macroscopique.length > 0
//         ) {
//           doc.setFontSize(13)
//           doc.setFont('Times', 'bold')
//           doc.text(nomTestLines, 60, currentY)
//         }
//         if (test?.observations?.macroscopique.length === 0) {
//           doc.setFontSize(13)
//           doc.text(nomTestLines, 20, currentY)
//         }
//         currentY += 5 * nomTestLines.length // Mise à jour de Y basée sur le nombre de lignes de nom
//         doc.setFont('Times', 'normal') // Réinitialisation à la police normale pour le reste du texte
//         doc.setFontSize(8) // Réduire la taille de la police pour les détails
//         let formattedDate = formatDateAndTime(test?.datePrelevement)
//         let formattedDateAnterieur = formatDateAndTime(
//           test?.dernierResultatAnterieur?.date
//         )
//         doc.setFont('Times', 'bold')
//         doc.setFontSize(8)

//         // Ne pas afficher les informations si test?.observations existe
//         if (!test?.observations && test?.dernierResultatAnterieur) {
//           const valeurAnterieure = test.dernierResultatAnterieur.valeur ?? ''
//           const dateAnterieure = formattedDateAnterieur ?? ''
//           doc.text('Anterieure', 150, currentY)
//           doc.text(valeurAnterieure, 160, currentY + 5)
//           doc.text(dateAnterieure, 170, currentY)
//         }
//         if (test?.observations?.macroscopique.length === 0) {
//           doc.text(`${test?.valeur}`, 90, currentY + 5)
//         }

//         doc.setFont('Times', 'normal')
//         doc.setFontSize(8)
//         if (test?.observations?.macroscopique.length === 0) {
//           // Affichage de la valeur de la machine A ou B en fonction de statutMachine
//           let machineValue = test.statutMachine
//             ? test.testId.valeurMachineA
//             : test.testId.valeurMachineB
//           if (machineValue) {
//             doc.text(`${machineValue}`, 120, currentY + 5)
//           }

//           doc.setFontSize(8)
//           doc.setFont('Times', 'bold')
//           // Déterminer quelle machine afficher en fonction de statutMachine
//           let machineText = test?.statutMachine
//             ? test?.testId?.machineA
//             : test?.testId?.machineB

//           // Vérifiez si machineText n'est ni undefined, ni une chaîne vide
//           if (machineText) {
//             doc.text(` ${machineText}`, 20, currentY)
//           } else {
//             // Optionnel: vous pouvez commenter ou décommenter la ligne suivante selon vos besoins
//             // doc.text('Machine utilisée: Non spécifiée', 20, currentY);
//           }
//         }

//         // Calculer la largeur du texte de la machine pour positionner correctement la méthode
//         // let machineTextWidth =
//         //   (doc.getStringUnitWidth(machineText) * doc.internal.getFontSize()) /
//         //   doc.internal.scaleFactor

//         // // Position de début pour le texte de la méthode
//         // let methodStartPos = 20 + machineTextWidth + 5 // 5 est un petit espace entre les deux textes

//         // // Afficher la méthode si elle existe, juste après le nom de la machine
//         // if (test?.methode) {
//         //   doc.text(`(${test?.methode})`, methodStartPos, currentY)
//         // }

//         // Calculer la largeur du texte de la machine pour positionner correctement la méthode
//         let machineTextWidth = 0
//         if (test?.testId?.machineA || test?.testId?.machineB) {
//           const machineText = test?.statutMachine
//             ? test?.testId?.machineA
//             : test?.testId?.machineB
//           machineTextWidth =
//             (doc.getStringUnitWidth(machineText || '') *
//               doc.internal.getFontSize()) /
//             doc.internal.scaleFactor
//         }
//         // Position de début pour le texte de la méthode
//         let methodStartPos = 20 + machineTextWidth + 5 // 5 est un petit espace entre les deux textes

//         // Afficher la méthode si elle existe, juste après le nom de la machine
//         if (test?.methode) {
//           doc.text(`(${test.methode})`, methodStartPos, currentY)
//         }
//         if (test?.observations?.macroscopique.length === 0) {
//           doc.text(
//             `Prélèvement: ${formattedDate} ${test?.typePrelevement}`,
//             20,
//             currentY + 3
//           )
//         }
//         doc.setFontSize(8)
//         doc.setFont('Times', 'normal')
//         currentY += 12 // Increment for one line
//         if (test?.observations?.macroscopique.length === 0) {
//           if (test?.remarque) {
//             doc.text(`${test.remarque}`, 20, currentY)
//           }
//         }
//         currentY += 5 // Increment for one line
//         if (test.statutInterpretation) {
//           doc.text(interpretationLines, 20, currentY)
//           currentY += 5 * interpretationLines.length // Mise à jour de Y basée sur le nombre de lignes d'interprétation
//         }
//         currentY += 5 // Ajout d'un espace avant le prochain test

//         if (
//           test?.observations ||
//           test?.culture ||
//           test?.gram ||
//           test?.conclusion ||
//           test?.observations?.macroscopique.length > 0
//         ) {
//           let positionX = 100
//           if (
//             test?.observations &&
//             test?.observations?.macroscopique.length > 0
//           ) {
//             doc.text(
//               ` ${test?.typePrelevement} ${test?.lieuPrelevement}  ${formattedDate}`,
//               20,
//               currentY - 10
//             )
//           }

//           if (
//             test?.observations &&
//             test?.observations?.macroscopique.length > 0
//           ) {
//             doc.setFontSize(10)
//             doc.setFont('Times', 'bold')
//             doc.text(`EXAMEN MACROSCOPIQUE`, 20, currentY)
//             doc.setFontSize(10)
//             doc.setFont('Times', 'normal')
//             currentY += 5 // Incrémentation de currentY après chaque élément

//             if (
//               Array.isArray(test?.observations?.macroscopique) &&
//               test.observations.macroscopique.length > 0
//             ) {
//               // Convertir le tableau en une chaîne de caractères, séparée par des virgules et des espaces
//               const macroscopiqueText =
//                 test.observations.macroscopique.join(', ')

//               // Afficher le texte formaté dans le PDF
//               doc.text(
//                 `${test?.typePrelevement} : ${macroscopiqueText}`,
//                 20,
//                 currentY
//               )
//               currentY += 7 // Incrémenter currentY pour la prochaine section ou le prochain élément
//             }

//             if (
//               test?.observations?.microscopique &&
//               test?.observations?.macroscopique.length > 0
//             ) {
//               doc.setFontSize(10)
//               doc.setFont('Times', 'bold')
//               doc.text(`EXAMEN CYTOLOGIQUE`, 20, currentY)
//               // currentY += 5
//               // doc.text(`Etat Frais`, 25, currentY)
//               doc.setFontSize(10)
//               doc.setFont('Times', 'normal')
//               currentY += 5 // Incrémentation après chaque élément

//               // Leucocytes
//               if (test?.observations?.microscopique?.leucocytes) {
//                 let leucocytesText = `${test.observations.microscopique.leucocytes}`
//                 if (test.observations.microscopique.unite) {
//                   leucocytesText += `/${test.observations.microscopique.unite}`
//                 }

//                 doc.text('Leucocytes:', 20, currentY)
//                 doc.text(leucocytesText, positionX, currentY)

//                 currentY += 5
//               }

//               // Hématies
//               if (test?.observations?.microscopique?.hematies) {
//                 let hematiesText = `${test.observations.microscopique.hematies}`
//                 if (test.observations.microscopique.unite) {
//                   hematiesText += `/${test.observations.microscopique.unite}`
//                 }

//                 doc.text('Hématies:', 20, currentY)
//                 doc.text(hematiesText, positionX, currentY)

//                 currentY += 5
//               }

//               // pH
//               if (test?.observations?.microscopique?.ph) {
//                 doc.text('pH:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.ph}`,
//                   positionX,
//                   currentY
//                 )
//                 currentY += 5
//               }

//               // Cellules épithéliales
//               if (test?.observations?.microscopique?.cellulesEpitheliales) {
//                 doc.text('Cellules épithéliales:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.cellulesEpitheliales}`,
//                   positionX,
//                   currentY
//                 )
//                 currentY += 5
//               }

//               // Éléments levuriformes
//               if (test?.observations?.microscopique?.elementsLevuriforme) {
//                 doc.text('Éléments levuriformes:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.elementsLevuriforme}`,
//                   positionX,
//                   currentY
//                 )
//                 currentY += 5
//               }

//               // Filaments mycéliens
//               if (test?.observations?.microscopique?.filamentsMyceliens) {
//                 doc.text('Filaments mycéliens:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.filamentsMyceliens}`,
//                   positionX,
//                   currentY
//                 )
//                 currentY += 5
//               }

//               // Trichomonas vaginalis
//               if (test?.observations?.microscopique?.trichomonasVaginalis) {
//                 doc.text('Trichomonas vaginalis:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.trichomonasVaginalis}`,
//                   positionX,
//                   currentY
//                 )
//                 currentY += 5
//               }

//               // Cristaux
//               if (test?.observations?.microscopique?.cristaux) {
//                 doc.text('Cristaux:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.cristaux}`,
//                   positionX,
//                   currentY
//                 )

//                 // Vérifiez si des détails sur les cristaux sont disponibles et non vides
//                 if (
//                   test.observations.microscopique.cristauxDetails &&
//                   test.observations.microscopique.cristauxDetails.length > 0
//                 ) {
//                   // Concaténez tous les détails avec une virgule et un espace comme séparateur
//                   let detailsText =
//                     test.observations.microscopique.cristauxDetails.join(', ')

//                   // Réduire la taille de la police pour les détails
//                   doc.setFontSize(7)

//                   // Déterminer la largeur maximale pour le texte, ajuster selon les besoins
//                   let maxWidth = 85 // Ajustez cette valeur en fonction de la largeur disponible sur la page

//                   // Utilisez splitTextToSize pour gérer le débordement du texte
//                   let splitText = doc.splitTextToSize(
//                     `(${detailsText})`,
//                     maxWidth
//                   )

//                   // Imprime chaque ligne du texte divisé, ajustant la position Y pour chaque nouvelle ligne
//                   splitText.forEach((line) => {
//                     doc.text(line, positionX + 20, currentY) // Ajustez positionX + 20 si nécessaire
//                     currentY += 5 // Ajustez l'espacement entre les lignes si nécessaire
//                   })

//                   // Restaurez la taille de la police pour d'autres textes
//                   doc.setFontSize(10)
//                 } else {
//                   // Augmenter currentY pour le prochain élément si aucun détail n'est ajouté
//                   currentY += 5
//                 }
//               }

//               // Cylindres
//               if (test?.observations?.microscopique?.cylindres) {
//                 doc.text('Cylindres:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.cylindres}`,
//                   positionX,
//                   currentY
//                 )
//                 currentY += 7
//               }

//               // Parasites
//               if (test?.observations?.microscopique?.parasites) {
//                 doc.text('Parasites:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.parasites}`,
//                   positionX,
//                   currentY
//                 )

//                 // Vérifiez si des détails sur les parasites sont disponibles et non vides
//                 if (
//                   test.observations.microscopique.parasitesDetails &&
//                   test.observations.microscopique.parasitesDetails.length > 0
//                 ) {
//                   // Concaténez tous les détails avec une virgule et un espace comme séparateur
//                   let detailsText =
//                     test.observations.microscopique.parasitesDetails.join(', ')

//                   // Réduire la taille de la police pour les détails
//                   doc.setFontSize(7)

//                   // Déterminer la largeur maximale pour le texte, ajuster selon les besoins
//                   let maxWidth = 85 // Ajustez cette valeur en fonction de la largeur disponible sur la page

//                   // Utilisez splitTextToSize pour gérer le débordement du texte
//                   let splitText = doc.splitTextToSize(
//                     `(${detailsText})`,
//                     maxWidth
//                   )

//                   // Imprime chaque ligne du texte divisé, ajustant la position Y pour chaque nouvelle ligne
//                   splitText.forEach((line) => {
//                     doc.text(line, positionX + 20, currentY) // Ajustez positionX + 20 si nécessaire
//                     currentY += 5 // Ajustez l'espacement entre les lignes si nécessaire
//                   })

//                   // Restaurez la taille de la police pour d'autres textes
//                   doc.setFontSize(10)
//                 } else {
//                   // Augmenter currentY pour le prochain élément si aucun détail n'est ajouté
//                   currentY += 5
//                 }
//               }

//               // Trichomonas intestinales
//               if (test?.observations?.microscopique?.trichomonasIntestinales) {
//                 doc.text('Trichomonas intestinales:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.trichomonasIntestinales}`,
//                   positionX,
//                   currentY
//                 )
//                 currentY += 5
//               }

//               // Œufs de Bilharzies
//               if (test?.observations?.microscopique?.oeufsDeBilharzies) {
//                 doc.text('Œufs de Bilharzies:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.oeufsDeBilharzies}`,
//                   positionX,
//                   currentY
//                 )
//                 currentY += 5
//               }

//               // Clue Cells
//               if (test?.observations?.microscopique?.clueCells) {
//                 doc.text('Clue Cells:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.clueCells}`,
//                   positionX,
//                   currentY
//                 )
//                 currentY += 5
//               }

//               // Gardnerella vaginalis
//               if (test?.observations?.microscopique?.gardnerellaVaginalis) {
//                 doc.text('Gardnerella vaginalis:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.gardnerellaVaginalis}`,
//                   positionX,
//                   currentY
//                 )
//                 currentY += 5
//               }

//               // Bacilles de Doderlein
//               if (test?.observations?.microscopique?.bacillesDeDoderlein) {
//                 doc.text('Bacilles de Doderlein:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.bacillesDeDoderlein}`,
//                   positionX,
//                   currentY
//                 )
//                 currentY += 5
//               }

//               // Type de Flore
//               if (test?.observations?.microscopique?.typeDeFlore) {
//                 doc.text('Type de Flore:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.typeDeFlore}`,
//                   positionX,
//                   currentY
//                 )
//                 currentY += 5
//               }

//               // Recherche de Streptocoque B
//               if (test?.observations?.microscopique?.rechercheDeStreptocoqueB) {
//                 doc.text('Recherche de Streptocoque B:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.rechercheDeStreptocoqueB}`,
//                   positionX,
//                   currentY
//                 )
//                 currentY += 5
//               }

//               // Monocytes
//               if (test?.observations?.microscopique?.monocytes) {
//                 doc.text('Monocytes:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.monocytes}%`,
//                   positionX,
//                   currentY
//                 )
//                 currentY += 5 // Peut-être un peu plus d'espace après le dernier élément
//               }
//               // Polynucléaires neutrophiles altérées
//               if (
//                 test?.observations?.microscopique
//                   ?.polynucleairesNeutrophilesAlterees
//               ) {
//                 doc.text('Polynucléaires neutrophiles altérées:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.polynucleairesNeutrophilesAlterees}%`,
//                   positionX, // Assurez-vous d'ajuster la position X selon la longueur du texte précédent
//                   currentY
//                 )
//                 currentY += 5 // Ajoute un espace après l'élément
//               }

//               // Polynucléaires neutrophiles non altérées
//               if (
//                 test?.observations?.microscopique
//                   ?.polynucleairesNeutrophilesNonAlterees
//               ) {
//                 doc.text(
//                   'Polynucléaires neutrophiles non altérées:',
//                   20,
//                   currentY
//                 )
//                 doc.text(
//                   `${test.observations.microscopique.polynucleairesNeutrophilesNonAlterees}%`,
//                   positionX, // Ajustez cette valeur comme nécessaire
//                   currentY
//                 )
//                 currentY += 5 // Ajoute un espace après l'élément
//               }

//               // Éosinophiles
//               if (test?.observations?.microscopique?.eosinophiles) {
//                 doc.text('Éosinophiles:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.eosinophiles}%`,
//                   positionX, // Ajustez cette valeur comme nécessaire
//                   currentY
//                 )
//                 currentY += 5 // Ajoute un espace après l'élément
//               }

//               // Basophiles
//               if (test?.observations?.microscopique?.basophiles) {
//                 doc.text('Basophiles:', 20, currentY)
//                 doc.text(
//                   `${test.observations.microscopique.basophiles}%`,
//                   positionX, // Ajustez cette valeur comme nécessaire
//                   currentY
//                 )
//                 currentY += 7 // Ajoute un espace après l'élément
//               }
//             }

//             // Vérification pour l'ajout d'une page avant le total et les informations bancaires
//             if (currentY > 250) {
//               doc.addPage()
//               currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
//               doc.text(`Nº Dossier: ${invoice?.identifiant}`, 75, currentY)
//               currentY
//               doc.text(
//                 `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
//                 42,
//                 currentY
//               )
//               currentY += 5
//               addFooter()
//             }
//             if (test?.observations?.chimie) {
//               const {
//                 proteinesTotales,
//                 proteinesArochies,
//                 glycorachie,
//                 acideUrique,
//                 LDH,
//               } = test.observations.chimie

//               // Vérifier si tous les champs sont vides
//               if (
//                 proteinesTotales ||
//                 proteinesArochies ||
//                 glycorachie ||
//                 acideUrique ||
//                 LDH
//               ) {
//                 doc.setFontSize(10)
//                 doc.setFont('Times', 'bold')
//                 doc.text(`CHIMIE`, 20, currentY)
//                 currentY += 5
//                 doc.setFontSize(10)
//                 doc.setFont('Times', 'normal')

//                 // Proteines Totales
//                 if (proteinesTotales) {
//                   doc.text('Proteines Totales:', 20, currentY)
//                   doc.text(proteinesTotales, positionX, currentY)
//                   doc.text('g/L', positionX + 10, currentY)
//                   currentY += 5
//                 }

//                 // Proteines Arochies
//                 if (proteinesArochies) {
//                   doc.text('Proteines Arochies:', 20, currentY)
//                   doc.text(proteinesArochies, positionX, currentY)
//                   doc.text(`g/L `, positionX + 10, currentY)
//                   doc.text(`(0,2-0,4)`, positionX + 17, currentY)
//                   currentY += 5
//                 }

//                 // Glycorachie
//                 if (glycorachie) {
//                   doc.text('Glycorachie:', 20, currentY)
//                   doc.text(glycorachie, positionX, currentY)
//                   doc.text(`g/L `, positionX + 10, currentY)
//                   doc.text(`(0,2-0,4)`, positionX + 17, currentY)
//                   currentY += 5
//                 }

//                 // Acide Urique
//                 if (acideUrique) {
//                   doc.text('Acide Urique:', 20, currentY)
//                   doc.text(acideUrique, positionX, currentY)
//                   doc.text('mg/L', positionX + 10, currentY)
//                   currentY += 5
//                 }

//                 // LDH
//                 if (LDH) {
//                   doc.text('LDH:', 20, currentY)
//                   doc.text(LDH, positionX, currentY)
//                   doc.text('U/I', positionX + 10, currentY)
//                   currentY += 7
//                 }
//               }
//             }

//             if (currentY > 250) {
//               doc.addPage()
//               currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
//               doc.text(`Nº Dossier: ${invoice?.identifiant}`, 75, currentY)
//               currentY
//               doc.text(
//                 `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
//                 42,
//                 currentY
//               )
//               currentY += 5
//               addFooter()
//             }
//           }
//           if (test?.gram) {
//             doc.setFontSize(10)
//             doc.setFont('Times', 'bold')
//             doc.text(
//               `EXAMEN BACTERIOLOGIE DIRECT  (Coloration de gram)`,
//               20,
//               currentY
//             )
//             currentY += 8
//             doc.setFontSize(10)
//             doc.setFont('Times', 'normal')
//             doc.text(`Gram:`, 20, currentY)

//             doc.text(`${test?.gram}`, positionX, currentY)
//             currentY += 8
//           }
//           // Vérification pour l'ajout d'une page avant le total et les informations bancaires
//           if (currentY > 250) {
//             doc.addPage()
//             currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
//             doc.text(`Nº Dossier: ${invoice?.identifiant}`, 75, currentY)
//             currentY
//             doc.text(
//               `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
//               42,
//               currentY
//             )
//             currentY += 5
//             addFooter()
//           }

//           if (test?.culture) {
//             const { culture, germeIdentifie, description } = test?.culture

//             if (
//               culture ||
//               (Array.isArray(germeIdentifie) && germeIdentifie.length > 0) ||
//               description
//             ) {
//               // Vérifier si au moins un des champs est présent
//               doc.setFontSize(10)
//               doc.setFont('Times', 'bold')
//               doc.text(`CULTURES SUR MILIEUX SPECIFIQUES:`, 20, currentY)
//               currentY += 5
//               doc.setFontSize(10)
//               doc.setFont('Times', 'normal')

//               if (culture) {
//                 doc.text(`Culture:`, 20, currentY)
//                 doc.text(culture, positionX, currentY)
//                 currentY += 5
//               }

//               if (
//                 Array.isArray(test.culture.germeIdentifie) &&
//                 test.culture.germeIdentifie.length > 0
//               ) {
//                 // Extraire uniquement les noms des germes
//                 const germeIdentifieText = test.culture.germeIdentifie
//                   .map((germe) => germe.nom)
//                   .join(', ')

//                 // Définir la largeur maximale pour le texte (85 caractères dans votre cas)
//                 const maxWidth = 95 // Ajuster cette valeur en fonction de la largeur disponible sur votre page PDF

//                 // Utiliser splitTextToSize pour gérer les retours à la ligne automatiquement
//                 let splitText = doc.splitTextToSize(
//                   germeIdentifieText,
//                   maxWidth
//                 )

//                 // Appliquer le texte avec des retours à la ligne
//                 doc.setFont('Times', 'italic') // Changer la police en italique
//                 doc.text(`Germe(s) Identifié(s):`, 20, currentY)
//                 splitText.forEach((line) => {
//                   doc.text(line, positionX, currentY)
//                   currentY += 5 // Incrémenter la position Y pour chaque nouvelle ligne
//                 })
//                 doc.setFont('Times', 'normal') // Revenir à la police normale
//                 currentY += 5 // Espace supplémentaire après la liste des germes
//               }

//               if (description) {
//                 doc.text(`Numeration:`, 20, currentY)
//                 doc.text(description, positionX, currentY)
//                 currentY += 7
//               }
//             }
//           }

//           // Vérification pour l'ajout d'une page avant le total et les informations bancaires
//           if (currentY > 250) {
//             doc.addPage()
//             currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
//             doc.text(`Nº Dossier: ${invoice?.identifiant}`, 75, currentY)
//             currentY
//             doc.text(
//               `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
//               42,
//               currentY
//             )
//             currentY += 5
//             addFooter()
//           }

//           // Recherche de Chlamydia
//           if (test?.observations?.rechercheChlamydia) {
//             const { naturePrelevement, rechercheAntigeneChlamydiaTrochomatis } =
//               test.observations.rechercheChlamydia

//             if (naturePrelevement || rechercheAntigeneChlamydiaTrochomatis) {
//               doc.setFontSize(10)
//               doc.setFont('Times', 'bold')
//               doc.text('RECHERCHE DE CHLAMYDIA', 20, currentY)
//               currentY += 5
//               doc.setFontSize(10)
//               doc.setFont('Times', 'normal')

//               // Nature du prélèvement
//               if (naturePrelevement) {
//                 doc.text('Nature du prélèvement:', 20, currentY)
//                 doc.text(naturePrelevement, positionX, currentY)
//                 currentY += 5
//               }

//               // Recherche d'antigène de Chlamydia trachomatis
//               if (rechercheAntigeneChlamydiaTrochomatis) {
//                 doc.text(
//                   "Recherche d'antigène de Chlamydia trachomatis:",
//                   20,
//                   currentY
//                 )
//                 doc.text(
//                   rechercheAntigeneChlamydiaTrochomatis,
//                   positionX,
//                   currentY
//                 )
//                 currentY += 7
//               }
//             }
//           }

//           // Recherche de Mycoplasmes
//           if (test?.observations?.rechercheMycoplasmes) {
//             const {
//               naturePrelevement,
//               rechercheUreaplasmaUrealyticum,
//               rechercheMycoplasmaHominis,
//             } = test.observations.rechercheMycoplasmes

//             if (
//               naturePrelevement ||
//               rechercheUreaplasmaUrealyticum ||
//               rechercheMycoplasmaHominis
//             ) {
//               doc.setFontSize(10)
//               doc.setFont('Times', 'bold')
//               doc.text('RECHERCHE DE MYCOPLASMES', 20, currentY)
//               currentY += 5
//               doc.setFontSize(10)
//               doc.setFont('Times', 'normal')

//               // Nature du prélèvement
//               if (naturePrelevement) {
//                 doc.text('Nature du prélèvement:', 20, currentY)
//                 doc.text(naturePrelevement, positionX, currentY)
//                 currentY += 5
//               }

//               // Recherche d'Ureaplasma urealyticum
//               if (rechercheUreaplasmaUrealyticum) {
//                 doc.text("Recherche d'Ureaplasma urealyticum:", 20, currentY)
//                 doc.text(rechercheUreaplasmaUrealyticum, positionX, currentY)
//                 currentY += 5
//               }

//               // Recherche de Mycoplasma hominis
//               if (rechercheMycoplasmaHominis) {
//                 doc.text('Recherche de Mycoplasma hominis:', 20, currentY)
//                 doc.text(rechercheMycoplasmaHominis, positionX, currentY)
//                 currentY += 7
//               }
//             }
//           }

//           if (test?.conclusion) {
//             doc.setFontSize(10)
//             doc.setFont('Times', 'bold')
//             doc.text('CONCLUSION', 20, currentY)
//             currentY += 5

//             const maxLineWidth = 100
//             const conclusionLines = doc.splitTextToSize(
//               test?.conclusion,
//               maxLineWidth
//             )
//             doc.text(conclusionLines, 20, currentY)

//             currentY += conclusionLines.length * 5 // Mise à jour de currentY basée sur le nombre de lignes de la conclusion
//             doc.setFontSize(10)
//             doc.setFont('Times', 'normal')
//             currentY += 5
//           }

//           if (test?.observations?.macroscopique.length > 0) {
//             if (test?.remarque) {
//               doc.text(`Remarque: ${test.remarque}`, 20, currentY)
//             }
//           }

//           currentY += 5

//           // Gérer les antibiogrammes
//           if (test.culture && Array.isArray(test.culture.germeIdentifie)) {
//             test.culture.germeIdentifie.forEach((germe) => {
//               // Vérifier si l'antibiogramme n'est pas vide
//               if (Object.keys(germe.antibiogramme).length > 0) {
//                 doc.addPage() // Démarre chaque antibiogramme sur une nouvelle page
//                 addFooter()
//                 currentY = 15 // Position Y initiale pour chaque nouvelle page
//                 doc.text(`Nº Dossier: ${invoice?.identifiant}`, 75, currentY)
//                 currentY
//                 doc.text(
//                   `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
//                   42,
//                   currentY
//                 )
//                 currentY += 5

//                 doc.setFontSize(10)
//                 doc.setFont('Times', 'bold')
//                 doc.text(`ANTIBIOGRAMME : ${germe.nom}`, 42, currentY)
//                 currentY += 7

//                 doc.setFont('Times', 'normal')
//                 // En-têtes de colonne avec bordures
//                 const columnWidthAntibiotique = 70
//                 const columnWidthSensibilite = 30
//                 const lineHeight = 7

//                 // Dessiner les bordures pour les en-têtes
//                 doc.rect(40, currentY, columnWidthAntibiotique, lineHeight)
//                 doc.rect(110, currentY, columnWidthSensibilite, lineHeight)
//                 doc.text('Antibiotique', 42, currentY + 5)
//                 doc.text('Sensibilité', 112, currentY + 5)
//                 currentY += lineHeight

//                 // Données de l'antibiogramme
//                 Object.entries(germe.antibiogramme).forEach(
//                   ([antibiotique, sensibilite]) => {
//                     doc.rect(40, currentY, columnWidthAntibiotique, lineHeight)
//                     doc.rect(110, currentY, columnWidthSensibilite, lineHeight)
//                     doc.text(antibiotique, 42, currentY + 5)
//                     doc.text(sensibilite, 112, currentY + 5)
//                     currentY += lineHeight
//                   }
//                 )

//                 currentY += 5
//                 doc.text(
//                   'S : Sensible    I : Intermédiaire     R : Résistant',
//                   42,
//                   currentY
//                 )
//               }
//             })
//           }
//           currentY += 15
          
          
//         }
//       })
//       function formatDateAndTime(dateString) {
//         const date = new Date(dateString)
//         return date.toLocaleString('fr-FR', {
//           day: '2-digit',
//           month: '2-digit',
//           year: 'numeric',
//         })
//       }

//       const validatedHistory = invoice.historiques.find(
//         (h) => h.status === 'Validé'
//       )
//       let validatedBy = 'Non spécifié'
//       if (validatedHistory && validatedHistory.updatedBy) {
//         validatedBy = `${validatedHistory.updatedBy.prenom} ${validatedHistory.updatedBy.nom}`
//         doc.setFontSize(10)
//         doc.setFont('Times', 'bold')
//         doc.text(`Validé par: ${validatedBy}`, 110, currentY)
        
//         doc.setFont('Times', 'normal')
//         doc.setFontSize(8)
//         // doc.text(
//         //   `${formatDateAndTime(validatedHistory.updatedBy.createdAt)}`,
//         //   150,
//         //   currentY + 4
//         // )
//       }
//       // Affichage du médecin qui a validé l'analyse

//       currentY += 5 // Incrément pour passer à la section suivante
//       // Positionnement initial pour les détails

//       const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
//       const validatedHistoryLogo = invoice.historiques.find(
//         (h) => h.status === 'Validé'
//       )
//       if (
//         validatedHistoryLogo &&
//         validatedHistoryLogo.updatedBy &&
//         validatedHistoryLogo.updatedBy.logo
//       ) {
//         const logoPath = validatedHistoryLogo.updatedBy.logo.replace(/\\/g, '/')
//         const fullLogoPath = `${apiUrl}/${logoPath}`

//         const doctorLogo = await loadImage(fullLogoPath)
//         const doctorLogoHeight = 50 * (doctorLogo.height / doctorLogo.width)
//         doc.addImage(doctorLogo, 'PNG', 110, currentY, 50, doctorLogoHeight)
//       }

//       // // Vérification pour l'ajout d'une page avant le total et les informations bancaires
//       // if (currentY > 250) {
//       //   doc.addPage()
//       //   currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
//       //   addFooter()
//       // }
//       // if (invoice?.observations?.antibiogramme) {
//       //   doc.addPage()
//       //   currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
//       //   addFooter()
//       // }

//       // Dernière ligne verte
//       // if (currentY > 250) {
//       //   // Encore une vérification avant d'ajouter la ligne finale
//       //   doc.addPage()
//       //   currentY = 10
//       //   addFooter()
//       // }

//       // Continuer avec la logique de création du PDF comme avant

//       // currentY += 20 // Espace avant les informations bancaires
//       // Ajouter des numéros de page juste avant de finaliser le document
//       addPageNumbers(doc)
//       // doc.save(`facture-${invoice._id}.pdf`)
//       const blob = doc.output('blob')
//       // Créez une URL à partir du blob
//       const url = URL.createObjectURL(blob)
//       // Ouvrez le PDF dans un nouvel onglet

//           // Naviguez vers la nouvelle page avec l'URL du blob en tant qu'état
//           //corriger
//       // Ouvrez le PDF dans un nouvel onglet avec l'état
//     window.open(`/pdf-viewer?pdfBlobUrl=${encodeURIComponent(url)}`, '_blank')

//       // window.open(url, '_blank')
//       // Optionnel : libérez l'URL du blob après ouverture
//       // URL.revokeObjectURL(url)
//       console.log(invoice)
//     } catch (error) {
//       console.error('Erreur lors de la génération du PDF:', error)
//       alert('Une erreur est survenue lors de la génération du PDF.')
//     }
//   }

  

//   return (
//     <button className="btn btn-primary" onClick={generatePDF}>
//       <FontAwesomeIcon icon={faDownload} />
//     </button>
//   )
// }

// GenerateResultatButton.propTypes = {
//   invoice: PropTypes.object.isRequired,
// }

// export default GenerateResultatButton
