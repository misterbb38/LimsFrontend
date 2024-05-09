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
        doc.setFontSize(10) // Définir la taille de la police pour le numéro de page
        doc.setTextColor(150) // Définir la couleur du texte pour le numéro de page
        // Ajouter le numéro de page au centre du pied de page de chaque page
        doc.text(`Page ${i} sur ${pageCount}`, 105, 275, { align: 'center' })
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
        // if (test?.dernierResultatAnterieur) {
        //   doc.text(
        //     `${test?.dernierResultatAnterieur?.valeur}`,
        //     90,
        //     currentY + 2
        //   )
        //   doc.text(`${formattedDateAnterieur}`, 150, currentY + 2)
        // }
        // Ne pas afficher les informations si test?.observations existe
        if (!test?.observations && test?.dernierResultatAnterieur) {
          const valeurAnterieure = test.dernierResultatAnterieur.valeur ?? ''
          const dateAnterieure = formattedDateAnterieur ?? ''
          doc.text('Anterieure', 150, currentY)
          doc.text(valeurAnterieure, 160, currentY + 5)
          doc.text(dateAnterieure, 170, currentY)
        }
        if (!test?.observations) {
          doc.text(`${test?.valeur}`, 90, currentY + 5)
        }
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        // Affichage de la valeur de la machine A ou B en fonction de statutMachine
        let machineValue = test.statutMachine
          ? test.testId.valeurMachineA
          : test.testId.valeurMachineB
        if (machineValue) {
          doc.text(`${machineValue}`, 120, currentY + 5)
        }

        doc.setFontSize(6)
        doc.setFont('helvetica', 'bold')
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
        if (!test?.observations) {
          doc.text(
            `Prélèvement: ${formattedDate} ${test?.typePrelevement}`,
            20,
            currentY + 3
          )
        }
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        currentY += 8 // Increment for one line
        if (test.statutInterpretation) {
          doc.text(interpretationLines, 20, currentY)
          currentY += 5 * interpretationLines.length // Mise à jour de Y basée sur le nombre de lignes d'interprétation
        }
        currentY += 5 // Ajout d'un espace avant le prochain test

        if (
          test?.observations ||
          test?.culture ||
          test?.gram ||
          test?.conclusion
        ) {
          doc.text(
            ` ${test?.typePrelevement} ${test?.lieuPrelevement}  ${formattedDate}`,
            20,
            currentY - 10
          )

          if (test?.observations) {
            doc.setFontSize(13)
            doc.setFont('helvetica', 'bold')
            doc.text(`Examen macroscopique`, 20, currentY)
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            currentY += 5 // Incrémentation de currentY après chaque élément

            // Leucocytes
            doc.text(
              ` ${test?.typePrelevement} ${test?.observations?.macroscopique} `,
              20,
              currentY
            )
            currentY += 7
            // if (test?.observations?.microscopique) {
            //   doc.setFontSize(13)
            //   doc.setFont('helvetica', 'bold')
            //   doc.text(`Examen microscopique`, 20, currentY)
            //   currentY += 5
            //   doc.text(`Etat Frais`, 25, currentY)
            //   doc.setFontSize(10)
            //   doc.setFont('helvetica', 'normal')
            //   currentY += 5 // Incrémentation de currentY après chaque élément
            //   // Leucocytes
            //   if (test?.observations?.microscopique?.leucocytes) {
            //     // Position fixe pour le texte "Leucocytes:"
            //     doc.text('Leucocytes:', 20, currentY)

            //     // Position fixe pour la valeur variable à l'axe X de 45
            //     doc.text(
            //       `${test.observations.microscopique.leucocytes}`,
            //       45,
            //       currentY
            //     )

            //     // Incrémentation de currentY après chaque élément
            //     currentY += 5
            //   }

            //   // Hématies
            //   if (test?.observations?.microscopique?.hematies) {
            //     doc.text(
            //       `Hématies: ${test?.observations?.microscopique?.hematies}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // pH
            //   if (test?.observations?.microscopique?.ph) {
            //     doc.text(
            //       `pH: ${test?.observations?.microscopique?.ph}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // Cellules Epithéliales
            //   if (test?.observations?.microscopique?.cellulesEpitheliales) {
            //     doc.text(
            //       `Cellules épithéliales: ${test?.observations?.microscopique?.cellulesEpitheliales}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // Éléments Levuriformes
            //   if (test?.observations?.microscopique?.elementsLevuriforme) {
            //     doc.text(
            //       `Éléments levuriformes: ${test?.observations?.microscopique?.elementsLevuriforme}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // Filaments Mycéliens
            //   if (test?.observations?.microscopique?.filamentsMyceliens) {
            //     doc.text(
            //       `Filaments mycéliens: ${test?.observations?.microscopique?.filamentsMyceliens}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // Trichomonas Vaginalis
            //   if (test?.observations?.microscopique?.trichomonasVaginalis) {
            //     doc.text(
            //       `Trichomonas vaginalis: ${test?.observations?.microscopique?.trichomonasVaginalis}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // Cristaux
            //   if (test?.observations?.microscopique?.cristaux) {
            //     doc.text(
            //       `Cristaux: ${test?.observations?.microscopique?.cristaux}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // Cylindres
            //   if (test?.observations?.microscopique?.cylindres) {
            //     doc.text(
            //       `Cylindres: ${test?.observations?.microscopique?.cylindres}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 7
            //   }

            //   // Parasites
            //   if (test?.observations?.microscopique?.parasites) {
            //     doc.text(
            //       `Parasites: ${test?.observations?.microscopique?.parasites}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // Trichomonas intestinales
            //   if (test?.observations?.microscopique?.trichomonasIntestinales) {
            //     doc.text(
            //       `Trichomonas intestinales: ${test?.observations?.microscopique?.trichomonasIntestinales}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // Oeufs de Bilharzies
            //   if (test?.observations?.microscopique?.oeufsDeBilharzies) {
            //     doc.text(
            //       `Oeufs de Bilharzies: ${test?.observations?.microscopique?.oeufsDeBilharzies}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // Clue Cells
            //   if (test?.observations?.microscopique?.clueCells) {
            //     doc.text(
            //       `Clue Cells: ${test?.observations?.microscopique?.clueCells}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // Gardnerella Vaginalis
            //   if (test?.observations?.microscopique?.gardnerellaVaginalis) {
            //     doc.text(
            //       `Gardnerella Vaginalis: ${test?.observations?.microscopique?.gardnerellaVaginalis}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // Bacilles de Doderlein
            //   if (test?.observations?.microscopique?.bacillesDeDoderlein) {
            //     doc.text(
            //       `Bacilles de Doderlein: ${test?.observations?.microscopique?.bacillesDeDoderlein}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // Type de Flore
            //   if (test?.observations?.microscopique?.typeDeFlore) {
            //     doc.text(
            //       `Type de Flore: ${test?.observations?.microscopique?.typeDeFlore}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // Recherche de Streptocoque B
            //   if (test?.observations?.microscopique?.rechercheDeStreptocoqueB) {
            //     doc.text(
            //       `Recherche de Streptocoque B: ${test?.observations?.microscopique?.rechercheDeStreptocoqueB}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // Monocytes
            //   if (test?.observations?.microscopique?.monocytes) {
            //     doc.text(
            //       `Monocytes: ${test?.observations?.microscopique?.monocytes}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 7 // Peut-être un peu plus d'espace après le dernier élément
            //   }
            // }

            if (test?.observations?.microscopique) {
              doc.setFontSize(13)
              doc.setFont('helvetica', 'bold')
              doc.text(`Examen microscopique`, 20, currentY)
              currentY += 5
              doc.text(`Etat Frais`, 25, currentY)
              doc.setFontSize(10)
              doc.setFont('helvetica', 'normal')
              currentY += 5 // Incrémentation après chaque élément

              // Leucocytes
              if (test?.observations?.microscopique?.leucocytes) {
                doc.text('Leucocytes:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.leucocytes}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Hématies
              if (test?.observations?.microscopique?.hematies) {
                doc.text('Hématies:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.hematies}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // pH
              if (test?.observations?.microscopique?.ph) {
                doc.text('pH:', 20, currentY)
                doc.text(`${test.observations.microscopique.ph}`, 65, currentY)
                currentY += 5
              }

              // Cellules épithéliales
              if (test?.observations?.microscopique?.cellulesEpitheliales) {
                doc.text('Cellules épithéliales:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.cellulesEpitheliales}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Éléments levuriformes
              if (test?.observations?.microscopique?.elementsLevuriforme) {
                doc.text('Éléments levuriformes:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.elementsLevuriforme}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Filaments mycéliens
              if (test?.observations?.microscopique?.filamentsMyceliens) {
                doc.text('Filaments mycéliens:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.filamentsMyceliens}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Trichomonas vaginalis
              if (test?.observations?.microscopique?.trichomonasVaginalis) {
                doc.text('Trichomonas vaginalis:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.trichomonasVaginalis}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Cristaux
              if (test?.observations?.microscopique?.cristaux) {
                doc.text('Cristaux:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.cristaux}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Cylindres
              if (test?.observations?.microscopique?.cylindres) {
                doc.text('Cylindres:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.cylindres}`,
                  65,
                  currentY
                )
                currentY += 7
              }

              // Parasites
              if (test?.observations?.microscopique?.parasites) {
                doc.text('Parasites:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.parasites}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Trichomonas intestinales
              if (test?.observations?.microscopique?.trichomonasIntestinales) {
                doc.text('Trichomonas intestinales:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.trichomonasIntestinales}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Œufs de Bilharzies
              if (test?.observations?.microscopique?.oeufsDeBilharzies) {
                doc.text('Œufs de Bilharzies:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.oeufsDeBilharzies}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Clue Cells
              if (test?.observations?.microscopique?.clueCells) {
                doc.text('Clue Cells:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.clueCells}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Gardnerella vaginalis
              if (test?.observations?.microscopique?.gardnerellaVaginalis) {
                doc.text('Gardnerella vaginalis:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.gardnerellaVaginalis}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Bacilles de Doderlein
              if (test?.observations?.microscopique?.bacillesDeDoderlein) {
                doc.text('Bacilles de Doderlein:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.bacillesDeDoderlein}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Type de Flore
              if (test?.observations?.microscopique?.typeDeFlore) {
                doc.text('Type de Flore:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.typeDeFlore}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Recherche de Streptocoque B
              if (test?.observations?.microscopique?.rechercheDeStreptocoqueB) {
                doc.text('Recherche Streptocoque B:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.rechercheDeStreptocoqueB}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Monocytes
              if (test?.observations?.microscopique?.monocytes) {
                doc.text('Monocytes:', 20, currentY)
                doc.text(
                  `${test.observations.microscopique.monocytes}`,
                  65,
                  currentY
                )
                currentY += 7 // Peut-être un peu plus d'espace après le dernier élément
              }
            }

            // // chimie
            // if (test?.observations?.chimie) {
            //   doc.setFontSize(13)
            //   doc.setFont('helvetica', 'bold')
            //   doc.text(`Chimie`, 20, currentY)
            //   currentY += 5
            //   doc.setFontSize(10)
            //   doc.setFont('helvetica', 'normal')
            //   // proteinesTotales
            //   if (test?.observations?.chimie?.proteinesTotales) {
            //     doc.text(
            //       `proteinesTotales: ${test?.observations?.chimie?.proteinesTotales}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // proteinesArochies
            //   if (test?.observations?.chimie?.proteinesArochies) {
            //     doc.text(
            //       `proteinesArochies: ${test?.observations?.chimie?.proteinesArochies}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // glycorachie
            //   if (test?.observations?.chimie?.glycorachie) {
            //     doc.text(
            //       `glycorachie: ${test?.observations?.chimie?.glycorachie}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // acideUrique
            //   if (test?.observations?.chimie?.acideUrique) {
            //     doc.text(
            //       `acideUrique: ${test?.observations?.chimie?.acideUrique}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }

            //   // LDH
            //   if (test?.observations?.chimie?.LDH) {
            //     doc.text(
            //       `LDH: ${test?.observations?.chimie?.LDH}`,
            //       20,
            //       currentY
            //     )
            //     currentY += 5
            //   }
            // }
            // chimie
            if (test?.observations?.chimie) {
              doc.setFontSize(13)
              doc.setFont('helvetica', 'bold')
              doc.text(`Chimie`, 20, currentY)
              currentY += 5
              doc.setFontSize(10)
              doc.setFont('helvetica', 'normal')

              // Proteines Totales
              if (test?.observations?.chimie?.proteinesTotales) {
                doc.text('Proteines Totales:', 20, currentY)
                doc.text(
                  `${test.observations.chimie.proteinesTotales}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Proteines Arochies
              if (test?.observations?.chimie?.proteinesArochies) {
                doc.text('Proteines Arochies:', 20, currentY)
                doc.text(
                  `${test.observations.chimie.proteinesArochies}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Glycorachie
              if (test?.observations?.chimie?.glycorachie) {
                doc.text('Glycorachie:', 20, currentY)
                doc.text(
                  `${test.observations.chimie.glycorachie}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // Acide Urique
              if (test?.observations?.chimie?.acideUrique) {
                doc.text('Acide Urique:', 20, currentY)
                doc.text(
                  `${test.observations.chimie.acideUrique}`,
                  65,
                  currentY
                )
                currentY += 5
              }

              // LDH
              if (test?.observations?.chimie?.LDH) {
                doc.text('LDH:', 20, currentY)
                doc.text(`${test.observations.chimie.LDH}`, 65, currentY)
                currentY += 5
              }
            }

            // Vérifiez si vous avez besoin d'ajouter une nouvelle page si `currentY` est trop élevé
            if (currentY > 250) {
              doc.addPage()
              currentY = 20 // Réinitialiser `currentY` pour la nouvelle page
            }
          }
          if (test?.gram) {
            doc.setFontSize(13)
            doc.setFont('helvetica', 'bold')
            doc.text(`Gram`, 25, currentY)
            currentY += 5
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(`Gram:`, 20, currentY)

            doc.text(`${test?.gram}`, 65, currentY)
            currentY += 5
          }

          if (test?.culture) {
            doc.setFontSize(13)
            doc.setFont('helvetica', 'bold')
            doc.text(`Culture:`, 20, currentY)
            currentY += 5
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text(`Culture:`, 20, currentY)
            doc.text(`${test?.culture?.culture}`, 65, currentY)
            currentY += 5
            doc.text(` Germe Identifié: `, 20, currentY)
            doc.text(` ${test?.culture?.germeIdentifie}`, 65, currentY)
            currentY += 5
            doc.text(` Numeration:`, 20, currentY)
            doc.text(` ${test?.culture?.description}`, 65, currentY)

            currentY += 7
          }

          if (test?.conclusion) {
            doc.setFontSize(13)
            doc.setFont('helvetica', 'bold')
            doc.text(`Conclusion`, 20, currentY)
            currentY += 5

            doc.text(` ${test?.conclusion}`, 20, currentY)
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            currentY += 5
          }
          if (
            test?.observations?.antibiogramme &&
            Object.keys(test.observations.antibiogramme).length > 0
          ) {
            doc.addPage()
            currentY = 15 // Réinitialiser la position Y pour le contenu de la nouvelle page
            addFooter()
            // En-têtes de colonne

            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text(
              `ANTIBIOGRAMME : ${test?.culture?.germeIdentifie} `,
              42,
              currentY
            )
            currentY += 7
            doc.setFont('helvetica', 'normal')
            // En-têtes de colonne avec bordures
            const columnWidthAntibiotique = 70 // Largeur de la colonne Antibiotique
            const columnWidthSensibilite = 30 // Largeur de la colonne Sensibilité
            const lineHeight = 7 // Hauteur de ligne standard

            // Dessiner les bordures pour les en-têtes
            doc.rect(40, currentY, columnWidthAntibiotique, lineHeight) // Bordure pour "Antibiotique"
            doc.rect(110, currentY, columnWidthSensibilite, lineHeight) // Bordure pour "Sensibilité"

            doc.setFontSize(10)
            doc.setFont('helvetica', 'bold')
            doc.text('Antibiotique', 42, currentY + 5) // Position ajustée pour le texte dans la cellule
            doc.text('Sensibilité', 112, currentY + 5)

            currentY += lineHeight // Déplacer currentY pour les données

            // Données de l'antibiogramme
            const antibiogramme = test?.observations?.antibiogramme
            if (antibiogramme) {
              doc.setFontSize(8)
              doc.setFont('helvetica', 'normal')
              Object.entries(antibiogramme).forEach(
                ([antibiotique, sensibilite]) => {
                  // Dessiner des cellules avec bordures pour chaque donnée
                  doc.rect(40, currentY, columnWidthAntibiotique, lineHeight)
                  doc.rect(110, currentY, columnWidthSensibilite, lineHeight)

                  // Ajouter du texte avec un petit padding horizontal
                  doc.text(antibiotique, 42, currentY + 5)
                  doc.text(sensibilite, 112, currentY + 5)

                  currentY += lineHeight // Incrément pour la prochaine ligne
                }
              )
              currentY += 5
              doc.text(
                'S : sensible    I : intermédiaire     R : résistant ',
                42,
                currentY
              )
              doc.addPage()
              currentY = 15 // Réinitialiser la position Y pour le contenu de la nouvelle page
              addFooter()
            } else {
              doc.text(
                "Aucune donnée d'antibiogramme disponible.",
                42,
                currentY
              )
            }
          }
        }
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

      const validatedHistory = invoice.historiques.find(
        (h) => h.status === 'Validé'
      )
      let validatedBy = 'Non spécifié'
      if (validatedHistory && validatedHistory.updatedBy) {
        validatedBy = `${validatedHistory.updatedBy.prenom} ${validatedHistory.updatedBy.nom}`
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(`Validé par: ${validatedBy}`, 140, currentY)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.text(
          `${formatDateAndTime(validatedHistory.updatedBy.createdAt)}`,
          150,
          currentY + 4
        )
      }
      // Affichage du médecin qui a validé l'analyse

      currentY += 10 // Incrément pour passer à la section suivante
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
        doc.addImage(doctorLogo, 'PNG', 150, currentY, 50, doctorLogoHeight)
      }

      // Vérification pour l'ajout d'une page avant le total et les informations bancaires
      if (currentY > 250) {
        doc.addPage()
        currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
        addFooter()
      }
      if (invoice?.observations?.antibiogramme) {
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
