// import { useState, useEffect } from 'react'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faDownload } from '@fortawesome/free-solid-svg-icons'
// import jsPDF from 'jspdf'
// import PropTypes from 'prop-types'
// import logoLeft from '../images/bioramlogo.png'
// import logoRight from '../images/logo2.png'
// // import { useNavigate } from 'react-router-dom' // Importez useNavigate

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

//   // const navigate = useNavigate() // Utilisez useNavigate pour la navigation
//   // // const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

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
//   const sortResultsByCategory = (results) => {
//     const groupedResults = results.reduce((acc, result) => {
//       const category = result.testId?.categories || 'Autres'
//       if (!acc[category]) {
//         acc[category] = []
//       }
//       acc[category].push(result)
//       return acc
//     }, {})

//     return Object.keys(groupedResults)
//       .sort()
//       .reduce((acc, key) => {
//         acc.push({ category: key, results: groupedResults[key] })
//         return acc
//       }, [])
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
//         doc.setFontSize(9) // Définir la taille de la police pour le numéro de page
//         doc.setTextColor(0, 0, 0) // Définir la couleur du texte pour le numéro de page
//         // Ajouter le numéro de page au centre du pied de page de chaque page
//         doc.text(` ${i}/${pageCount}`, 185, 275, { align: 'center' })
//       }
//     }

//     try {
//       // Charger les images

//       const [imgLeft] = await Promise.all([
//         loadImage(logoLeft),
//         loadImage(logoRight),
//       ])

//       // Ajout des images
//       const maxWidth = 30 // Exemple: 30 unités de largeur dans le PDF
//       const leftHeight = maxWidth * (imgLeft.height / imgLeft.width)
//       // const rightHeight = maxWidth * (imgRight.height / imgRight.width)

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
//         `Nom: ${invoice.userId.prenom.toUpperCase()} ${invoice.userId.nom.toUpperCase()}`,
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

//       const sortedResults = sortResultsByCategory(invoice?.resultat)
//       sortedResults.forEach((group) => {
//         // Affichez le nom de la catégorie
//         console.log(`groupe ${currentY}`)
//         if (currentY > 240) {
//           doc.addPage()
//           doc.text(`Nº Dossier: ${invoice?.identifiant}`, 42, currentY)

//           doc.text(
//             `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
//             42,
//             currentY + 5
//           )
//           currentY += 15
//           addFooter()
//         }
//         doc.setFontSize(12)
//         doc.setFont('Times', 'bold')
//         doc.text(group.category.toUpperCase(), 90, currentY)

//         // Ajouter une ligne sous la catégorie
//         const lineStartX = 20 // Position de départ X de la ligne
//         const lineEndX = 190 // Position de fin X de la ligne
//         const lineY = currentY + 2 // Position Y de la ligne (juste en dessous du texte)
//         doc.line(lineStartX, lineY, lineEndX, lineY)

//         // Ajouter une ligne sous la catégorie

//         currentY += 10 // Espace après la catégorie

//         group.results.forEach((test) => {
//           if (!test || !test.testId) return // Ignorer si test ou testId n'est pas défini

//           const maxLineWidth = 100
//           const maxLineWidthInt = 160
//           // const maxvaluWidth = 50 // Largeur maximale du texte dans le PDF
//           let nomTestLines = doc.splitTextToSize(
//             `${test.testId.nom.toUpperCase()}`,
//             maxLineWidth
//           )

//           // Choisir entre interpretationA et interpretationB en fonction de statutMachine

//           doc.setFontSize(9) // Changer la taille de la police à 10
//           doc.setFont('Courier', 'normal')

//           // Ajout des informations du test
//           doc.setFontSize(8)
//           doc.setFont('Times', 'bold') // Utilisation de Times en gras
//           // doc.text(nomTestLines, 20, currentY)

//           // Dessiner un grand point (cercle) manuellement
//           doc.setFillColor(0, 0, 0) // Couleur noire
//           doc.circle(18, currentY - 1, 1, 'F') // Position (x, y), rayon, style de remplissage

//           if (
//             test?.observations &&
//             test?.observations?.macroscopique.length > 0
//           ) {
//             doc.setFontSize(9)
//             doc.setFont('Times', 'bold')
//             doc.text(nomTestLines, 60, currentY)
//           }
//           if (test?.observations?.macroscopique.length === 0) {
//             doc.setFontSize(9)
//             doc.text(nomTestLines, 20, currentY)
//           }
//           currentY += 5 * nomTestLines.length // Mise à jour de Y basée sur le nombre de lignes de nom
//           doc.setFont('Times', 'normal') // Réinitialisation à la police normale pour le reste du texte
//           doc.setFontSize(8) // Réduire la taille de la police pour les détails
//           let formattedDate = formatDateAndTime(test?.datePrelevement)
//           let formattedDateAnterieur = formatDateAndTime(
//             test?.dernierResultatAnterieur?.date
//           )
//           doc.setFont('Times', 'bold')
//           doc.setFontSize(8)

//           // Ne pas afficher les informations si test?.observations existe
//           if (
//             test?.observations?.macroscopique.length === 0 &&
//             test?.dernierResultatAnterieur
//           ) {
//             const valeurAnterieure = test.dernierResultatAnterieur.valeur ?? ''
//             const dateAnterieure = formattedDateAnterieur ?? ''
//             doc.text('Antériorités', 170, currentY)
//             doc.text(valeurAnterieure, 170, currentY + 5)
//             doc.text(dateAnterieure, 190, currentY)
//           }
//           if (test?.observations?.macroscopique.length === 0) {
//             doc.setFont('Times', 'bold')
//             doc.setFontSize(10)
//             doc.text(`${test?.valeur}`, 90, currentY + 5)
//             if (test?.qualitatif) {
//               doc.text(`(${test?.qualitatif})`, 86, currentY + 10)
//             }

//             // On prévoit un excepY pour positionner le bloc d’exception
//             console.log(currentY)
//             let excepY = currentY + 15 // Par exemple, 15 px sous la valeur/qualitatif
//             function hasHematiesValues(hematies) {
//               if (!hematies) return false
//               const { gr, hgb, hct, vgm, tcmh, ccmh, idr_cv } = hematies
//               return (
//                 gr?.valeur ||
//                 hgb?.valeur ||
//                 hct?.valeur ||
//                 vgm?.valeur ||
//                 tcmh?.valeur ||
//                 ccmh?.valeur ||
//                 idr_cv?.valeur
//               )
//             }

//             function hasLeucocytesValues(leuco) {
//               if (!leuco) return false
//               const {
//                 gb,
//                 neut,
//                 lymph,
//                 mono,
//                 eo,
//                 baso,
//                 plt,
//                 proerythroblastes,
//                 erythroblastes,
//                 myeloblastes,
//                 promyelocytes,
//                 myelocytes,
//                 metamyelocytes,
//                 monoblastes,
//                 lymphoblastes,
//               } = leuco

//               return (
//                 gb?.valeur ||
//                 neut?.valeur ||
//                 neut?.pourcentage ||
//                 lymph?.valeur ||
//                 lymph?.pourcentage ||
//                 mono?.valeur ||
//                 mono?.pourcentage ||
//                 eo?.valeur ||
//                 eo?.pourcentage ||
//                 baso?.valeur ||
//                 baso?.pourcentage ||
//                 plt?.valeur ||
//                 proerythroblastes?.valeur ||
//                 proerythroblastes?.pourcentage ||
//                 erythroblastes?.valeur ||
//                 erythroblastes?.pourcentage ||
//                 myeloblastes?.valeur ||
//                 myeloblastes?.pourcentage ||
//                 promyelocytes?.valeur ||
//                 promyelocytes?.pourcentage ||
//                 myelocytes?.valeur ||
//                 myelocytes?.pourcentage ||
//                 metamyelocytes?.valeur ||
//                 metamyelocytes?.pourcentage ||
//                 monoblastes?.valeur ||
//                 monoblastes?.pourcentage ||
//                 lymphoblastes?.valeur ||
//                 lymphoblastes?.pourcentage
//               )
//             }

//             /**
//              * Affiche une ligne “Hématies” :
//              *   Nom (X=25)
//              *   Valeur (X=70)
//              *   Unité   (X=90)
//              *   Référence (X=110)   (ex. "3.80-5.90")
//              */
//             function printHematiesLine(doc, posY, label, value, unit, ref) {
//               doc.text(label, 25, posY) // Nom
//               doc.text(value, 85, posY) // Valeur
//               if (unit) {
//                 doc.text(unit, 100, posY)
//               }
//               if (ref) {
//                 doc.text(ref, 120, posY) // Valeurs usuelles
//               }
//               return posY + 5
//             }

//             /**
//              * Affiche une ligne “Leucocytes” :
//              *   Nom (X=25)
//              *   Pourcentage (X=70)  => ex. "55" => doc.text("55%", 70, posY)
//              *   Valeur absolue (X=85)
//              *   Unité (X=100)
//              *   Référence (X=120)   (ex. "37.0-72.0")
//              */
//             function printLeucocytesLine(
//               doc,
//               posY,
//               label,
//               pctValue, // ex. "55" => on affichera "55%"
//               mainValue, // ex. "3.96"
//               unit,
//               reference
//             ) {
//               // Nom
//               doc.text(label, 25, posY)

//               // Pourcentage
//               if (pctValue) {
//                 doc.text(`${pctValue}%`, 70, posY)
//               }

//               // Valeur absolue
//               doc.text(mainValue, 85, posY)

//               // Unité
//               if (unit) {
//                 doc.text(unit, 100, posY)
//               }

//               // Référence
//               if (reference) {
//                 doc.text(reference, 120, posY)
//               }

//               return posY + 5
//             }

//             // Vérifions s'il existe un test.exceptions
//             if (test?.exceptions) {
//               // 1) QBC
//               if (test.exceptions.qbc && test.exceptions.qbc.positivite) {
//                 console.log(excepY)
//                 // Vérifier si on dépasse la page
//                 if (excepY > 250) {
//                   doc.addPage()
//                   addFooter()
//                   excepY = 25
//                 }

//                 // doc.setFont('Times', 'bold')
//                 // doc.setFontSize(9)
//                 // doc.text('QBC :', 20, excepY)
//                 // excepY += 5
//                 doc.setFont('Times', 'normal')

//                 // Positivité
//                 if (test.exceptions.qbc.positivite) {
//                   if (excepY > 250) {
//                     doc.addPage()
//                     addFooter()
//                     excepY = 25
//                   }
//                   doc.text(
//                     `Statut parasitaire : ${test.exceptions.qbc.positivite}`,
//                     25,
//                     excepY
//                   )

//                   excepY += 5
//                 }
//                 // Nombre de croix
//                 if (typeof test.exceptions.qbc.nombreCroix === 'number') {
//                   if (excepY > 250) {
//                     doc.addPage()
//                     addFooter()
//                     excepY = 25
//                   }
//                   // Supposons que test.exceptions.qbc.nombreCroix vaut un nombre entre 0 et 4
//                   const numberOfCross = test.exceptions.qbc.nombreCroix || 0

//                   // Répéter le signe “+” autant de fois
//                   const crosses = '+ '.repeat(numberOfCross)

//                   // Puis afficher
//                   doc.text(`Niveau d’infestation : ${crosses}`, 25, excepY)

//                   excepY += 5
//                 }
//                 // Densité parasitaire => p/µL
//                 if (test.exceptions.qbc.densiteParasitaire) {
//                   if (excepY > 250) {
//                     doc.addPage()
//                     addFooter()
//                     excepY = 25
//                   }
//                   doc.text(
//                     `Densité parasitaire : ${test.exceptions.qbc.densiteParasitaire} p/µL`,
//                     25,
//                     excepY
//                   )
//                   excepY += 5
//                 }
//                 // Espèces
//                 if (
//                   Array.isArray(test.exceptions.qbc.especes) &&
//                   test.exceptions.qbc.especes.length > 0
//                 ) {
//                   if (excepY > 250) {
//                     doc.addPage()
//                     addFooter()
//                     excepY = 25
//                   }
//                   doc.text(
//                     `Espèces : ${test.exceptions.qbc.especes.join(', ')}`,
//                     25,
//                     excepY
//                   )
//                   excepY += 7
//                 }
//               }

//               // 2) Groupe sanguin
//               else if (
//                 test.exceptions.groupeSanguin &&
//                 (test.exceptions.groupeSanguin.abo ||
//                   test.exceptions.groupeSanguin.rhesus)
//               ) {
//                 console.log(`page ${excepY}`)
//                 if (excepY > 250) {
//                   doc.addPage()

//                   addFooter()
//                   excepY = 25
//                   console.log(`page ${excepY}`)
//                 }

//                 // doc.setFont('Times', 'bold')
//                 // doc.setFontSize(9)
//                 // doc.text('GROUPE SANGUIN :', 20, excepY)
//                 // excepY += 5
//                 doc.setFont('Times', 'normal')

//                 if (test.exceptions.groupeSanguin.abo) {
//                   if (excepY > 250) {
//                     doc.addPage()

//                     addFooter()
//                     excepY = 25
//                   }
//                   doc.text(
//                     `Groupe ABO : ${test.exceptions.groupeSanguin.abo}`,
//                     25,
//                     excepY
//                   )
//                   excepY += 5
//                 }
//                 if (test.exceptions.groupeSanguin.rhesus) {
//                   if (excepY > 250) {
//                     doc.addPage()
//                     addFooter()
//                     excepY = 25
//                   }
//                   doc.text(
//                     `Rhésus (Antigène D) : ${test.exceptions.groupeSanguin.rhesus}`,
//                     25,
//                     excepY
//                   )
//                   excepY += 7
//                 }
//               }

//               // 3) HGPO
//               else if (
//                 test.exceptions.hgpo &&
//                 (test.exceptions.hgpo.t0 ||
//                   test.exceptions.hgpo.t60 ||
//                   test.exceptions.hgpo.t120)
//               ) {
//                 if (excepY > 250) {
//                   doc.addPage()
//                   addFooter()
//                   excepY = 25
//                 }

//                 // doc.setFont('Times', 'bold')
//                 // doc.setFontSize(9)
//                 // doc.text('HGPO :', 20, excepY)
//                 // excepY += 5
//                 doc.setFont('Times', 'normal')

//                 if (test.exceptions.hgpo.t0) {
//                   if (excepY > 250) {
//                     doc.addPage()
//                     addFooter()
//                     excepY = 25
//                   }
//                   doc.text(
//                     `Glycémie T0 : ${test.exceptions.hgpo.t0} g/L`,
//                     25,
//                     excepY
//                   )
//                   excepY += 5
//                 }
//                 if (test.exceptions.hgpo.t60) {
//                   if (excepY > 250) {
//                     doc.addPage()
//                     addFooter()
//                     excepY = 25
//                   }
//                   doc.text(
//                     `Glycémie T60 : ${test.exceptions.hgpo.t60} g/L`,
//                     25,
//                     excepY
//                   )
//                   excepY += 5
//                 }
//                 if (test.exceptions.hgpo.t120) {
//                   if (excepY > 250) {
//                     doc.addPage()
//                     addFooter()
//                     excepY = 25
//                   }
//                   doc.text(
//                     `Glycémie T120 : ${test.exceptions.hgpo.t120} g/L`,
//                     25,
//                     excepY
//                   )
//                   excepY += 7
//                 }
//               }

//               // 4) Ionogramme
//               else if (
//                 test.exceptions.ionogramme &&
//                 (test.exceptions.ionogramme.na ||
//                   test.exceptions.ionogramme.k ||
//                   test.exceptions.ionogramme.cl ||
//                   test.exceptions.ionogramme.ca ||
//                   test.exceptions.ionogramme.mg)
//               ) {
//                 if (excepY > 250) {
//                   doc.addPage()
//                   addFooter()
//                   excepY = 25
//                 }

//                 // doc.setFont('Times', 'bold')
//                 // doc.setFontSize(9)
//                 // doc.text('IONOGRAMME :', 20, excepY)
//                 // excepY += 5
//                 doc.setFont('Times', 'normal')

//                 if (test.exceptions.ionogramme.na) {
//                   if (excepY > 250) {
//                     doc.addPage()
//                     addFooter()
//                     excepY = 25
//                   }

//                   doc.text(
//                     `Na+ : ${test.exceptions.ionogramme.na} `,
//                     25,
//                     excepY
//                   )
//                   doc.text(`Valeur de référence`, 110, excepY - 8)

//                   doc.text(`137-145 mEq/L`, 110, excepY)
//                   excepY += 5
//                 }
//                 if (test.exceptions.ionogramme.k) {
//                   if (excepY > 250) {
//                     doc.addPage()
//                     addFooter()
//                     excepY = 25
//                   }
//                   doc.text(`K+ : ${test.exceptions.ionogramme.k} `, 25, excepY)
//                   doc.text(`3.5-5.0 mEq/L`, 110, excepY)

//                   excepY += 5
//                 }
//                 if (test.exceptions.ionogramme.cl) {
//                   if (excepY > 250) {
//                     doc.addPage()
//                     addFooter()
//                     excepY = 25
//                   }
//                   doc.text(
//                     `Cl- : ${test.exceptions.ionogramme.cl} `,
//                     25,

//                     excepY
//                   )
//                   doc.text(`98.0-107.0 mEq/L`, 110, excepY)
//                   excepY += 5
//                 }
//                 if (test.exceptions.ionogramme.ca) {
//                   if (excepY > 270) {
//                     doc.addPage()
//                     addFooter()
//                     excepY = 25
//                   }
//                   doc.text(
//                     `Ca2+ : ${test.exceptions.ionogramme.ca} `,
//                     25,
//                     excepY
//                   )
//                   doc.text(`137-145 mEq/L`, 110, excepY)
//                   excepY += 5
//                 }
//                 if (test.exceptions.ionogramme.mg) {
//                   if (excepY > 250) {
//                     doc.addPage()
//                     addFooter()
//                     excepY = 25
//                   }
//                   doc.text(
//                     `Mg2+ : ${test.exceptions.ionogramme.mg} `,
//                     25,
//                     excepY
//                   )
//                   doc.text(`137-145 mEq/L`, 110, excepY)
//                   excepY += 7
//                 }
//               } else if (test.exceptions.nfs) {
//                 const { hematiesEtConstantes, leucocytesEtFormules } =
//                   test.exceptions.nfs

//                 const showHematies = hasHematiesValues(hematiesEtConstantes)
//                 const showLeucocytes = hasLeucocytesValues(leucocytesEtFormules)

//                 if (!showHematies && !showLeucocytes) {
//                   // rien
//                 } else {
//                   // Titre principal NFS
//                   if (excepY > 250) {
//                     doc.addPage()
//                     addFooter()
//                     excepY = 25
//                   }
//                   doc.setFont('Times', 'bold')
//                   doc.setFontSize(10)
//                   doc.text('NFS (Numération Formule Sanguine)', 25, excepY)
//                   excepY += 7
//                   doc.setFont('Times', 'normal')
//                   doc.setFontSize(9)
//                   doc.text('Valeurs de références', 120, excepY)
//                   excepY += 3

//                   /*********************************
//                    * HÉMATIES ET CONSTANTES
//                    *********************************/
//                   if (showHematies) {
//                     doc.setFont('Times', 'bold')
//                     doc.text('HEMATIES ET CONSTANTES', 25, excepY)
//                     excepY += 7
//                     doc.setFont('Times', 'normal')

//                     // Hematies (au lieu de "GR")
//                     if (hematiesEtConstantes.gr?.valeur) {
//                       excepY = printHematiesLine(
//                         doc,
//                         excepY,
//                         'Hématies',
//                         String(hematiesEtConstantes.gr.valeur),
//                         hematiesEtConstantes.gr.unite || '',
//                         hematiesEtConstantes.gr.reference || ''
//                       )
//                     }
//                     // Hémoglobine
//                     if (hematiesEtConstantes.hgb?.valeur) {
//                       excepY = printHematiesLine(
//                         doc,
//                         excepY,
//                         'Hémoglobine',
//                         String(hematiesEtConstantes.hgb.valeur),
//                         hematiesEtConstantes.hgb.unite || '',
//                         hematiesEtConstantes.hgb.reference || ''
//                       )
//                     }
//                     // Hématocrite
//                     if (hematiesEtConstantes.hct?.valeur) {
//                       excepY = printHematiesLine(
//                         doc,
//                         excepY,
//                         'Hématocrite',
//                         String(hematiesEtConstantes.hct.valeur),
//                         hematiesEtConstantes.hct.unite || '',
//                         hematiesEtConstantes.hct.reference || ''
//                       )
//                     }
//                     // VGM
//                     if (hematiesEtConstantes.vgm?.valeur) {
//                       excepY = printHematiesLine(
//                         doc,
//                         excepY,
//                         'VGM',
//                         String(hematiesEtConstantes.vgm.valeur),
//                         hematiesEtConstantes.vgm.unite || '',
//                         hematiesEtConstantes.vgm.reference || ''
//                       )
//                     }
//                     // TCMH
//                     if (hematiesEtConstantes.tcmh?.valeur) {
//                       excepY = printHematiesLine(
//                         doc,
//                         excepY,
//                         'TCMH',
//                         String(hematiesEtConstantes.tcmh.valeur),
//                         hematiesEtConstantes.tcmh.unite || '',
//                         hematiesEtConstantes.tcmh.reference || ''
//                       )
//                     }
//                     // CCMH
//                     if (hematiesEtConstantes.ccmh?.valeur) {
//                       excepY = printHematiesLine(
//                         doc,
//                         excepY,
//                         'CCMH',
//                         String(hematiesEtConstantes.ccmh.valeur),
//                         hematiesEtConstantes.ccmh.unite || '',
//                         hematiesEtConstantes.ccmh.reference || ''
//                       )
//                     }
//                     // IDR-CV (pas d'écartType)
//                     if (hematiesEtConstantes.idr_cv?.valeur) {
//                       excepY = printHematiesLine(
//                         doc,
//                         excepY,
//                         'IDR-CV',
//                         String(hematiesEtConstantes.idr_cv.valeur),
//                         hematiesEtConstantes.idr_cv.unite || '',
//                         hematiesEtConstantes.idr_cv.reference || ''
//                       )
//                     }

//                     excepY += 5
//                   }

//                   /*********************************
//                    * LEUCOCYTES ET FORMULE
//                    *********************************/
//                   if (showLeucocytes) {
//                     if (excepY > 250) {
//                       doc.addPage()
//                       addFooter()
//                       excepY = 25
//                     }
//                     doc.setFont('Times', 'bold')
//                     doc.text('LEUCOCYTES ET FORMULE', 25, excepY)
//                     excepY += 7
//                     doc.setFont('Times', 'normal')

//                     const {
//                       gb,
//                       neut,
//                       lymph,
//                       mono,
//                       eo,
//                       baso,
//                       plt,
//                       proerythroblastes,
//                       erythroblastes,
//                       myeloblastes,
//                       promyelocytes,
//                       myelocytes,
//                       metamyelocytes,
//                       monoblastes,
//                       lymphoblastes,
//                     } = leucocytesEtFormules

//                     // => GB (pas de pourcentage)
//                     if (gb?.valeur) {
//                       excepY = printLeucocytesLine(
//                         doc,
//                         excepY,
//                         'Leucocytes',
//                         null, // pas de %
//                         String(gb.valeur),
//                         gb.unite || '',
//                         gb.reference || ''
//                       )
//                     }

//                     // => NEUT
//                     if (neut?.valeur || neut?.pourcentage) {
//                       let p = neut?.pourcentage
//                         ? String(neut.pourcentage)
//                         : null
//                       let v = neut?.valeur ? String(neut.valeur) : ''
//                       excepY = printLeucocytesLine(
//                         doc,
//                         excepY,
//                         'Neutrophiles',
//                         p,
//                         v,
//                         neut.unite || '',
//                         neut.referencePourcentage || ''
//                       )
//                     }

//                     // => LYMPH
//                     if (lymph?.valeur || lymph?.pourcentage) {
//                       let p = lymph?.pourcentage
//                         ? String(lymph.pourcentage)
//                         : null
//                       let v = lymph?.valeur ? String(lymph.valeur) : ''
//                       excepY = printLeucocytesLine(
//                         doc,
//                         excepY,
//                         'Lymphocytes',
//                         p,
//                         v,
//                         lymph.unite || '',
//                         lymph.referencePourcentage || ''
//                       )
//                     }

//                     // => MONO
//                     if (mono?.valeur || mono?.pourcentage) {
//                       let p = mono?.pourcentage
//                         ? String(mono.pourcentage)
//                         : null
//                       let v = mono?.valeur ? String(mono.valeur) : ''
//                       excepY = printLeucocytesLine(
//                         doc,
//                         excepY,
//                         'Monocytes',
//                         p,
//                         v,
//                         mono.unite || '',
//                         mono.referencePourcentage || ''
//                       )
//                     }

//                     // => EO
//                     if (eo?.valeur || eo?.pourcentage) {
//                       let p = eo?.pourcentage ? String(eo.pourcentage) : null
//                       let v = eo?.valeur ? String(eo.valeur) : ''
//                       excepY = printLeucocytesLine(
//                         doc,
//                         excepY,
//                         'Eosinophiles',
//                         p,
//                         v,
//                         eo.unite || '',
//                         eo.referencePourcentage || ''
//                       )
//                     }

//                     // => BASO
//                     if (baso?.valeur || baso?.pourcentage) {
//                       let p = baso?.pourcentage
//                         ? String(baso.pourcentage)
//                         : null
//                       let v = baso?.valeur ? String(baso.valeur) : ''
//                       excepY = printLeucocytesLine(
//                         doc,
//                         excepY,
//                         'Basophiles',
//                         p,
//                         v,
//                         baso.unite || '',
//                         baso.referencePourcentage || ''
//                       )
//                     }
//                     // Petit espace avant Plaquettes
//                     excepY += 8
//                     doc.setFont('Times', 'bold')
//                     doc.text('PLAQUETTES', 25, excepY)
//                     excepY += 5

//                     // => PLAQUETTES (en gras, dernier)
//                     if (plt?.valeur) {
//                       doc.setFont('Times', 'normal')
//                       excepY = printLeucocytesLine(
//                         doc,
//                         excepY,
//                         'Plaquettes',
//                         null, // pas de %

//                         String(plt.valeur),
//                         plt.unite || '',
//                         plt.reference || ''
//                       )
//                       doc.setFont('Times', 'normal')
//                     }

//                     excepY += 7
//                     // Titre "AUTRES" pour les blastes
//                     doc.setFont('Times', 'bold')
//                     doc.text('AUTRES', 25, excepY)
//                     excepY += 7
//                     doc.setFont('Times', 'normal')

//                     // => Blastes / immatures
//                     const immatures = [
//                       { label: 'Proérythroblastes', key: 'proerythroblastes' },
//                       { label: 'Erythroblastes', key: 'erythroblastes' },
//                       { label: 'Myéloblastes', key: 'myeloblastes' },
//                       { label: 'Promyélocytes', key: 'promyelocytes' },
//                       { label: 'Myélocytes', key: 'myelocytes' },
//                       { label: 'Métamyélocytes', key: 'metamyelocytes' },
//                       { label: 'Monoblastes', key: 'monoblastes' },
//                       { label: 'Lymphoblastes', key: 'lymphoblastes' },
//                     ]

//                     immatures.forEach((item) => {
//                       const obj = leucocytesEtFormules[item.key]
//                       if (obj?.valeur || obj?.pourcentage) {
//                         if (excepY > 250) {
//                           doc.addPage()
//                           addFooter()
//                           excepY = 25
//                         }
//                         let p = obj?.pourcentage
//                           ? String(obj.pourcentage)
//                           : null
//                         let v = obj?.valeur ? String(obj.valeur) : ''
//                         excepY = printLeucocytesLine(
//                           doc,
//                           excepY,
//                           item.label,
//                           p,
//                           v,
//                           obj.unite || '',
//                           obj.referencePourcentage || ''
//                         )
//                       }
//                     })

//                     excepY += 5
//                   }
//                 }
//               }
//             }

//             // Enfin, on recopie excepY dans currentY
//             currentY = excepY
//           }

//           if (test?.observations?.macroscopique.length === 0) {
//             // Affichage de la valeur de la machine A ou B en fonction de statutMachine
//             let machineValue = test.statutMachine
//               ? test.testId.valeurMachineA
//               : test.testId.valeurMachineB
//             if (machineValue) {
//               doc.text(`${machineValue}`, 110, currentY + 5)
//             }

//             doc.setFontSize(9)
//             doc.setFont('Times', 'bold')
//             // Déterminer quelle machine afficher en fonction de statutMachine
//             let machineText = test?.statutMachine
//               ? test?.testId?.machineA
//               : test?.testId?.machineB

//             // Vérifiez si machineText n'est ni undefined, ni une chaîne vide
//             if (machineText) {
//               doc.text(` ${machineText}`, 20, currentY - 1)
//             } else {
//               // Optionnel: vous pouvez commenter ou décommenter la ligne suivante selon vos besoins
//               // doc.text('Machine utilisée: Non spécifiée', 20, currentY);
//             }
//           }

//           // Calculer la largeur du texte de la machine pour positionner correctement la méthode
//           let machineTextWidth = 0
//           if (test?.testId?.machineA || test?.testId?.machineB) {
//             const machineText = test?.statutMachine
//               ? test?.testId?.machineA
//               : test?.testId?.machineB
//             machineTextWidth =
//               (doc.getStringUnitWidth(machineText || '') *
//                 doc.internal.getFontSize()) /
//               doc.internal.scaleFactor
//           }
//           // Position de début pour le texte de la méthode
//           let methodStartPos = 20 + machineTextWidth + 5 // 5 est un petit espace entre les deux textes

//           // Afficher la méthode si elle existe, juste après le nom de la machine
//           if (test?.methode) {
//             doc.text(`(${test.methode})`, methodStartPos, currentY - 1)
//           }
//           if (test?.observations?.macroscopique.length === 0) {
//             doc.text(
//               `Prélèvement : ${formattedDate}, ${test?.typePrelevement}`,
//               20,
//               currentY + 3
//             )
//           }
//           doc.setFontSize(8)
//           doc.setFont('Times', 'normal')
//           currentY += 12 // Increment for one line
//           if (test?.observations?.macroscopique.length === 0) {
//             if (test?.remarque) {
//               doc.text(`${test.remarque}`, 20, currentY)
//             }
//           }
//           currentY += 5 // Increment for one line

//           if (test.statutInterpretation) {
//             const interpretation = test.statutMachine
//               ? test.testId.interpretationA
//               : test.testId.interpretationB

//             // Affiche "Interprétation:"

//             let interpretationHeight = 0
//             let interpretationLines = []

//             if (interpretation.type === 'text') {
//               // Afficher le texte
//               interpretationLines = doc.splitTextToSize(
//                 interpretation.content,
//                 100
//               )
//               interpretationHeight = 5 * interpretationLines.length
//             } else if (interpretation.type === 'table') {
//               // Afficher le tableau
//               const { rows } = interpretation.content

//               // Calculer la hauteur nécessaire pour le tableau
//               interpretationHeight = 5 + rows.length * 5
//             }

//             const footerY = 265
//             const marginBottom = 5

//             // Vérifier si l'espace restant sur la page est suffisant
//             if (currentY + interpretationHeight + marginBottom > footerY) {
//               doc.addPage()
//               currentY = 20 // Réinitialisation de la position Y pour la nouvelle page
//               doc.text(`Nº Dossier: ${invoice?.identifiant}`, 42, currentY)

//               doc.text(
//                 `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
//                 42,
//                 currentY + 5
//               )
//               doc.setFontSize(10)
//               doc.setFont('Times', 'bold')
//               doc.text('Interprétation:', 20, currentY)
//               currentY += 5
//               currentY += 15

//               addFooter()
//             }

//             if (interpretation.type === 'text') {
//               doc.setFontSize(9) // Taille de police pour l'interprétation
//               doc.setFont('Courier', 'normal') // Police pour l'interprétation
//               doc.text(interpretationLines, 20, currentY)
//               currentY += interpretationHeight // Mise à jour de Y en fonction du nombre de lignes
//             } else if (interpretation.type === 'table') {
//               // Afficher les en-têtes de colonne
//               doc.setFontSize(9)
//               doc.setFont('Times', 'bold')
//               interpretation.content.columns.forEach((col, colIndex) => {
//                 doc.text(col, 20 + colIndex * 40, currentY)
//               })
//               currentY += 5

//               // Afficher les lignes de données
//               doc.setFont('Times', 'normal')
//               interpretation.content.rows.forEach((row) => {
//                 row.forEach((cell, cellIndex) => {
//                   doc.text(cell, 20 + cellIndex * 40, currentY)
//                 })
//                 currentY += 5
//               })
//             }
//           }

//           doc.setFont('Times', 'normal')

//           currentY += 5 // Ajout d'un espace avant le prochain test

//           if (
//             test?.observations ||
//             test?.culture ||
//             test?.gram ||
//             test?.conclusion ||
//             test?.observations?.macroscopique.length > 0
//           ) {
//             let positionX = 100
//             if (
//               test?.observations &&
//               test?.observations?.macroscopique.length > 0
//             ) {
//               doc.text(
//                 ` ${test?.typePrelevement} : ${test?.lieuPrelevement}  ${formattedDate}`,
//                 20,
//                 currentY - 10
//               )
//             }

//             if (
//               test?.observations &&
//               test?.observations?.macroscopique.length > 0
//             ) {
//               doc.setFontSize(10)
//               doc.setFont('Times', 'bold')
//               doc.text(`EXAMEN MACROSCOPIQUE`, 20, currentY)
//               doc.setFontSize(10)
//               doc.setFont('Times', 'normal')
//               currentY += 5 // Incrémentation de currentY après chaque élément

//               if (
//                 Array.isArray(test?.observations?.macroscopique) &&
//                 test.observations.macroscopique.length > 0
//               ) {
//                 // Convertir le tableau en une chaîne de caractères, séparée par des virgules et des espaces
//                 const macroscopiqueText =
//                   test.observations.macroscopique.join(', ')

//                 // Afficher le texte formaté dans le PDF
//                 doc.text(
//                   `${test?.typePrelevement} : ${macroscopiqueText}`,
//                   20,
//                   currentY
//                 )
//                 currentY += 7 // Incrémenter currentY pour la prochaine section ou le prochain élément
//               }

//               if (
//                 test?.observations?.microscopique &&
//                 test?.observations?.macroscopique.length > 0
//               ) {
//                 doc.setFontSize(10)
//                 doc.setFont('Times', 'bold')
//                 doc.text(`EXAMEN CYTOLOGIQUE`, 20, currentY)
//                 // currentY += 5
//                 // doc.text(`Etat Frais`, 25, currentY)
//                 doc.setFontSize(10)
//                 doc.setFont('Times', 'normal')
//                 currentY += 5 // Incrémentation après chaque élément

//                 // Leucocytes
//                 if (test?.observations?.microscopique?.leucocytes) {
//                   let leucocytesText = `${test.observations.microscopique.leucocytes}`
//                   if (test.observations.microscopique.unite) {
//                     leucocytesText += `/${test.observations.microscopique.unite}`
//                   }

//                   doc.text('Leucocytes:', 20, currentY)
//                   doc.text(leucocytesText, positionX, currentY)

//                   currentY += 5
//                 }

//                 // Hématies
//                 if (test?.observations?.microscopique?.hematies) {
//                   let hematiesText = `${test.observations.microscopique.hematies}`
//                   if (test.observations.microscopique.unite) {
//                     hematiesText += `/${test.observations.microscopique.unite}`
//                   }

//                   doc.text('Hématies:', 20, currentY)
//                   doc.text(hematiesText, positionX, currentY)

//                   currentY += 5
//                 }

//                 // pH
//                 if (test?.observations?.microscopique?.ph) {
//                   doc.text('pH:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.ph}`,
//                     positionX,
//                     currentY
//                   )
//                   currentY += 5
//                 }

//                 // Cellules épithéliales
//                 if (test?.observations?.microscopique?.cellulesEpitheliales) {
//                   doc.text('Cellules épithéliales:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.cellulesEpitheliales}`,
//                     positionX,
//                     currentY
//                   )
//                   currentY += 5
//                 }

//                 // Éléments levuriformes
//                 if (test?.observations?.microscopique?.elementsLevuriforme) {
//                   doc.text('Éléments levuriformes:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.elementsLevuriforme}`,
//                     positionX,
//                     currentY
//                   )
//                   currentY += 5
//                 }

//                 // Filaments mycéliens
//                 if (test?.observations?.microscopique?.filamentsMyceliens) {
//                   doc.text('Filaments mycéliens:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.filamentsMyceliens}`,
//                     positionX,
//                     currentY
//                   )
//                   currentY += 5
//                 }

//                 // Trichomonas vaginalis
//                 if (test?.observations?.microscopique?.trichomonasVaginalis) {
//                   doc.text('Trichomonas vaginalis:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.trichomonasVaginalis}`,
//                     positionX,
//                     currentY
//                   )
//                   currentY += 5
//                 }

//                 // Cristaux
//                 if (test?.observations?.microscopique?.cristaux) {
//                   doc.text('Cristaux:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.cristaux}`,
//                     positionX,
//                     currentY
//                   )

//                   // Vérifiez si des détails sur les cristaux sont disponibles et non vides
//                   if (
//                     test.observations.microscopique.cristauxDetails &&
//                     test.observations.microscopique.cristauxDetails.length > 0
//                   ) {
//                     // Concaténez tous les détails avec une virgule et un espace comme séparateur
//                     let detailsText =
//                       test.observations.microscopique.cristauxDetails.join(', ')

//                     // Réduire la taille de la police pour les détails
//                     doc.setFontSize(7)

//                     // Déterminer la largeur maximale pour le texte, ajuster selon les besoins
//                     let maxWidth = 85 // Ajustez cette valeur en fonction de la largeur disponible sur la page

//                     // Utilisez splitTextToSize pour gérer le débordement du texte
//                     let splitText = doc.splitTextToSize(
//                       `(${detailsText})`,
//                       maxWidth
//                     )

//                     // Imprime chaque ligne du texte divisé, ajustant la position Y pour chaque nouvelle ligne
//                     splitText.forEach((line) => {
//                       doc.text(line, positionX + 20, currentY) // Ajustez positionX + 20 si nécessaire
//                       currentY += 5 // Ajustez l'espacement entre les lignes si nécessaire
//                     })

//                     // Restaurez la taille de la police pour d'autres textes
//                     doc.setFontSize(10)
//                   } else {
//                     // Augmenter currentY pour le prochain élément si aucun détail n'est ajouté
//                     currentY += 5
//                   }
//                 }

//                 // Cylindres
//                 if (test?.observations?.microscopique?.cylindres) {
//                   doc.text('Cylindres:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.cylindres}`,
//                     positionX,
//                     currentY
//                   )
//                   currentY += 7
//                 }

//                 // Parasites
//                 if (test?.observations?.microscopique?.parasites) {
//                   doc.text('Parasites:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.parasites}`,
//                     positionX,
//                     currentY
//                   )

//                   // Vérifiez si des détails sur les parasites sont disponibles et non vides
//                   if (
//                     test.observations.microscopique.parasitesDetails &&
//                     test.observations.microscopique.parasitesDetails.length > 0
//                   ) {
//                     // Concaténez tous les détails avec une virgule et un espace comme séparateur
//                     let detailsText =
//                       test.observations.microscopique.parasitesDetails.join(
//                         ', '
//                       )

//                     // Réduire la taille de la police pour les détails
//                     doc.setFontSize(7)

//                     // Déterminer la largeur maximale pour le texte, ajuster selon les besoins
//                     let maxWidth = 85 // Ajustez cette valeur en fonction de la largeur disponible sur la page

//                     // Utilisez splitTextToSize pour gérer le débordement du texte
//                     let splitText = doc.splitTextToSize(
//                       `(${detailsText})`,
//                       maxWidth
//                     )

//                     // Imprime chaque ligne du texte divisé, ajustant la position Y pour chaque nouvelle ligne
//                     splitText.forEach((line) => {
//                       doc.text(line, positionX + 20, currentY) // Ajustez positionX + 20 si nécessaire
//                       currentY += 5 // Ajustez l'espacement entre les lignes si nécessaire
//                     })

//                     // Restaurez la taille de la police pour d'autres textes
//                     doc.setFontSize(10)
//                   } else {
//                     // Augmenter currentY pour le prochain élément si aucun détail n'est ajouté
//                     currentY += 5
//                   }
//                 }

//                 // Trichomonas intestinales
//                 if (
//                   test?.observations?.microscopique?.trichomonasIntestinales
//                 ) {
//                   doc.text('Trichomonas intestinales:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.trichomonasIntestinales}`,
//                     positionX,
//                     currentY
//                   )
//                   currentY += 5
//                 }

//                 // Œufs de Bilharzies
//                 if (test?.observations?.microscopique?.oeufsDeBilharzies) {
//                   doc.text('Œufs de Bilharzies:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.oeufsDeBilharzies}`,
//                     positionX,
//                     currentY
//                   )
//                   currentY += 5
//                 }

//                 // Clue Cells
//                 if (test?.observations?.microscopique?.clueCells) {
//                   doc.text('Clue Cells:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.clueCells}`,
//                     positionX,
//                     currentY
//                   )
//                   currentY += 5
//                 }

//                 // Gardnerella vaginalis
//                 if (test?.observations?.microscopique?.gardnerellaVaginalis) {
//                   doc.text('Gardnerella vaginalis:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.gardnerellaVaginalis}`,
//                     positionX,
//                     currentY
//                   )
//                   currentY += 5
//                 }

//                 // Bacilles de Doderlein
//                 if (test?.observations?.microscopique?.bacillesDeDoderlein) {
//                   doc.text('Bacilles de Doderlein:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.bacillesDeDoderlein}`,
//                     positionX,
//                     currentY
//                   )
//                   currentY += 5
//                 }

//                 // Type de Flore
//                 if (test?.observations?.microscopique?.typeDeFlore) {
//                   doc.text('Type de Flore:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.typeDeFlore}`,
//                     positionX,
//                     currentY
//                   )
//                   currentY += 5
//                 }

//                 // Recherche de Streptocoque B
//                 if (
//                   test?.observations?.microscopique?.rechercheDeStreptocoqueB
//                 ) {
//                   doc.text('Recherche de Streptocoque B:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.rechercheDeStreptocoqueB}`,
//                     positionX,
//                     currentY
//                   )
//                   currentY += 5
//                 }

//                 // Monocytes
//                 if (test?.observations?.microscopique?.monocytes) {
//                   doc.text('Monocytes:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.monocytes}%`,
//                     positionX,
//                     currentY
//                   )
//                   currentY += 5 // Peut-être un peu plus d'espace après le dernier élément
//                 }
//                 // Polynucléaires neutrophiles altérées
//                 if (
//                   test?.observations?.microscopique
//                     ?.polynucleairesNeutrophilesAlterees
//                 ) {
//                   doc.text(
//                     'Polynucléaires neutrophiles altérées:',
//                     20,
//                     currentY
//                   )
//                   doc.text(
//                     `${test.observations.microscopique.polynucleairesNeutrophilesAlterees}%`,
//                     positionX, // Assurez-vous d'ajuster la position X selon la longueur du texte précédent
//                     currentY
//                   )
//                   currentY += 5 // Ajoute un espace après l'élément
//                 }

//                 // Polynucléaires neutrophiles non altérées
//                 if (
//                   test?.observations?.microscopique
//                     ?.polynucleairesNeutrophilesNonAlterees
//                 ) {
//                   doc.text(
//                     'Polynucléaires neutrophiles non altérées:',
//                     20,
//                     currentY
//                   )
//                   doc.text(
//                     `${test.observations.microscopique.polynucleairesNeutrophilesNonAlterees}%`,
//                     positionX, // Ajustez cette valeur comme nécessaire
//                     currentY
//                   )
//                   currentY += 5 // Ajoute un espace après l'élément
//                 }

//                 // Éosinophiles
//                 if (test?.observations?.microscopique?.eosinophiles) {
//                   doc.text('Éosinophiles:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.eosinophiles}%`,
//                     positionX, // Ajustez cette valeur comme nécessaire
//                     currentY
//                   )
//                   currentY += 5 // Ajoute un espace après l'élément
//                 }

//                 // Basophiles
//                 if (test?.observations?.microscopique?.basophiles) {
//                   doc.text('Basophiles:', 20, currentY)
//                   doc.text(
//                     `${test.observations.microscopique.basophiles}%`,
//                     positionX, // Ajustez cette valeur comme nécessaire
//                     currentY
//                   )
//                   currentY += 7 // Ajoute un espace après l'élément
//                 }
//               }

//               // Vérification pour l'ajout d'une page avant le total et les informations bancaires
//               if (currentY > 250) {
//                 doc.addPage()
//                 currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
//                 doc.text(`Nº Dossier: ${invoice?.identifiant}`, 75, currentY)
//                 currentY
//                 doc.text(
//                   `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
//                   42,
//                   currentY
//                 )
//                 currentY += 5
//                 addFooter()
//               }
//               if (test?.observations?.chimie) {
//                 const {
//                   proteinesTotales,
//                   proteinesArochies,
//                   glycorachie,
//                   acideUrique,
//                   LDH,
//                 } = test.observations.chimie

//                 // Vérifier si tous les champs sont vides
//                 if (
//                   proteinesTotales ||
//                   proteinesArochies ||
//                   glycorachie ||
//                   acideUrique ||
//                   LDH
//                 ) {
//                   doc.setFontSize(10)
//                   doc.setFont('Times', 'bold')
//                   doc.text(`CHIMIE`, 20, currentY)
//                   currentY += 5
//                   doc.setFontSize(10)
//                   doc.setFont('Times', 'normal')

//                   // Proteines Totales
//                   if (proteinesTotales) {
//                     doc.text('Proteines Totales:', 20, currentY)
//                     doc.text(proteinesTotales, positionX, currentY)
//                     doc.text('g/L', positionX + 10, currentY)
//                     currentY += 5
//                   }

//                   // Proteines Arochies
//                   if (proteinesArochies) {
//                     doc.text('Proteines Arochies:', 20, currentY)
//                     doc.text(proteinesArochies, positionX, currentY)
//                     doc.text(`g/L `, positionX + 10, currentY)
//                     doc.text(`(0,2-0,4)`, positionX + 17, currentY)
//                     currentY += 5
//                   }

//                   // Glycorachie
//                   if (glycorachie) {
//                     doc.text('Glycorachie:', 20, currentY)
//                     doc.text(glycorachie, positionX, currentY)
//                     doc.text(`g/L `, positionX + 10, currentY)
//                     doc.text(`(0,2-0,4)`, positionX + 17, currentY)
//                     currentY += 5
//                   }

//                   // Acide Urique
//                   if (acideUrique) {
//                     doc.text('Acide Urique:', 20, currentY)
//                     doc.text(acideUrique, positionX, currentY)
//                     doc.text('mg/L', positionX + 10, currentY)
//                     currentY += 5
//                   }

//                   // LDH
//                   if (LDH) {
//                     doc.text('LDH:', 20, currentY)
//                     doc.text(LDH, positionX, currentY)
//                     doc.text('U/I', positionX + 10, currentY)
//                     currentY += 7
//                   }
//                 }
//               }

//               if (currentY > 250) {
//                 doc.addPage()
//                 currentY = 25 // Réinitialiser la position Y pour le contenu de la nouvelle page
//                 doc.text(`Nº Dossier: ${invoice?.identifiant}`, 75, currentY)
//                 currentY
//                 doc.text(
//                   `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
//                   42,
//                   currentY
//                 )
//                 currentY += 5
//                 addFooter()
//               }
//             }
//             if (test?.gram) {
//               doc.setFontSize(10)
//               doc.setFont('Times', 'bold')
//               doc.text(
//                 `EXAMEN BACTERIOLOGIE DIRECT  (Coloration de gram)`,
//                 20,
//                 currentY
//               )
//               currentY += 8
//               doc.setFontSize(10)
//               doc.setFont('Times', 'normal')
//               doc.text(`Gram:`, 20, currentY)

//               doc.text(`${test?.gram}`, positionX, currentY)
//               currentY += 8
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

//             if (test?.culture) {
//               const { culture, germeIdentifie, description } = test?.culture

//               if (
//                 culture ||
//                 (Array.isArray(germeIdentifie) && germeIdentifie.length > 0) ||
//                 description
//               ) {
//                 // Vérifier si au moins un des champs est présent
//                 doc.setFontSize(10)
//                 doc.setFont('Times', 'bold')
//                 doc.text(`CULTURES SUR MILIEUX SPECIFIQUES:`, 20, currentY)
//                 currentY += 5
//                 doc.setFontSize(10)
//                 doc.setFont('Times', 'normal')

//                 if (culture) {
//                   doc.text(`Culture:`, 20, currentY)
//                   doc.text(culture, positionX, currentY)
//                   currentY += 5
//                 }

//                 if (
//                   Array.isArray(test.culture.germeIdentifie) &&
//                   test.culture.germeIdentifie.length > 0
//                 ) {
//                   // Extraire uniquement les noms des germes
//                   const germeIdentifieText = test.culture.germeIdentifie
//                     .map((germe) => germe.nom)
//                     .join(', ')

//                   // Définir la largeur maximale pour le texte (85 caractères dans votre cas)
//                   const maxWidth = 95 // Ajuster cette valeur en fonction de la largeur disponible sur votre page PDF

//                   // Utiliser splitTextToSize pour gérer les retours à la ligne automatiquement
//                   let splitText = doc.splitTextToSize(
//                     germeIdentifieText,
//                     maxWidth
//                   )

//                   // Appliquer le texte avec des retours à la ligne
//                   doc.setFont('Times', 'italic') // Changer la police en italique
//                   doc.text(`Germe(s) Identifié(s):`, 20, currentY)
//                   splitText.forEach((line) => {
//                     doc.text(line, positionX, currentY)
//                     currentY += 5 // Incrémenter la position Y pour chaque nouvelle ligne
//                   })
//                   doc.setFont('Times', 'normal') // Revenir à la police normale
//                   currentY += 5 // Espace supplémentaire après la liste des germes
//                 }

//                 if (description) {
//                   doc.text(`Numeration:`, 20, currentY)
//                   doc.text(description, positionX, currentY)
//                   currentY += 7
//                 }
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

//             // Recherche de Chlamydia
//             if (test?.observations?.rechercheChlamydia) {
//               const {
//                 naturePrelevement,
//                 rechercheAntigeneChlamydiaTrochomatis,
//               } = test.observations.rechercheChlamydia

//               if (naturePrelevement || rechercheAntigeneChlamydiaTrochomatis) {
//                 doc.setFontSize(10)
//                 doc.setFont('Times', 'bold')
//                 doc.text('RECHERCHE DE CHLAMYDIA', 20, currentY)
//                 currentY += 5
//                 doc.setFontSize(10)
//                 doc.setFont('Times', 'normal')

//                 // Nature du prélèvement
//                 if (naturePrelevement) {
//                   doc.text('Nature du prélèvement:', 20, currentY)
//                   doc.text(naturePrelevement, positionX, currentY)
//                   currentY += 5
//                 }

//                 // Recherche d'antigène de Chlamydia trachomatis
//                 if (rechercheAntigeneChlamydiaTrochomatis) {
//                   doc.text(
//                     "Recherche d'antigène de Chlamydia trachomatis:",
//                     20,
//                     currentY
//                   )
//                   doc.text(
//                     rechercheAntigeneChlamydiaTrochomatis,
//                     positionX,
//                     currentY
//                   )
//                   currentY += 7
//                 }
//               }
//             }

//             // Recherche de Mycoplasmes
//             if (test?.observations?.rechercheMycoplasmes) {
//               const {
//                 naturePrelevement,
//                 rechercheUreaplasmaUrealyticum,
//                 rechercheMycoplasmaHominis,
//               } = test.observations.rechercheMycoplasmes

//               if (
//                 naturePrelevement ||
//                 rechercheUreaplasmaUrealyticum ||
//                 rechercheMycoplasmaHominis
//               ) {
//                 doc.setFontSize(10)
//                 doc.setFont('Times', 'bold')
//                 doc.text('RECHERCHE DE MYCOPLASMES', 20, currentY)
//                 currentY += 5
//                 doc.setFontSize(10)
//                 doc.setFont('Times', 'normal')

//                 // Nature du prélèvement
//                 if (naturePrelevement) {
//                   doc.text('Nature du prélèvement:', 20, currentY)
//                   doc.text(naturePrelevement, positionX, currentY)
//                   currentY += 5
//                 }

//                 // Recherche d'Ureaplasma urealyticum
//                 if (rechercheUreaplasmaUrealyticum) {
//                   doc.text("Recherche d'Ureaplasma urealyticum:", 20, currentY)
//                   doc.text(rechercheUreaplasmaUrealyticum, positionX, currentY)
//                   currentY += 5
//                 }

//                 // Recherche de Mycoplasma hominis
//                 if (rechercheMycoplasmaHominis) {
//                   doc.text('Recherche de Mycoplasma hominis:', 20, currentY)
//                   doc.text(rechercheMycoplasmaHominis, positionX, currentY)
//                   currentY += 7
//                 }
//               }
//             }

//             if (test?.conclusion) {
//               doc.setFontSize(10)
//               doc.setFont('Times', 'bold')
//               doc.text('CONCLUSION', 20, currentY)
//               currentY += 5

//               const maxLineWidth = 100
//               const conclusionLines = doc.splitTextToSize(
//                 test?.conclusion,
//                 maxLineWidth
//               )
//               doc.text(conclusionLines, 20, currentY)

//               currentY += conclusionLines.length * 5 // Mise à jour de currentY basée sur le nombre de lignes de la conclusion
//               doc.setFontSize(10)
//               doc.setFont('Times', 'normal')
//               currentY += 5
//             }

//             if (test?.observations?.macroscopique.length > 0) {
//               if (test?.remarque) {
//                 doc.text(`Remarque: ${test.remarque}`, 20, currentY)
//               }
//             }

//             currentY += 5

//             // Gérer les antibiogrammes
//             if (test.culture && Array.isArray(test.culture.germeIdentifie)) {
//               test.culture.germeIdentifie.forEach((germe) => {
//                 // Vérifier si l'antibiogramme n'est pas vide
//                 if (Object.keys(germe.antibiogramme).length > 0) {
//                   doc.addPage() // Démarre chaque antibiogramme sur une nouvelle page
//                   addFooter()
//                   currentY = 15 // Position Y initiale pour chaque nouvelle page
//                   doc.text(`Nº Dossier: ${invoice?.identifiant}`, 42, currentY)

//                   doc.text(
//                     `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
//                     42,
//                     currentY + 5
//                   )
//                   currentY += 10

//                   doc.setFontSize(10)
//                   doc.setFont('Times', 'bold')
//                   doc.text(`ANTIBIOGRAMME : ${germe.nom}`, 42, currentY)
//                   currentY += 7

//                   doc.setFont('Times', 'normal')
//                   // En-têtes de colonne avec bordures
//                   const columnWidthAntibiotique = 70
//                   const columnWidthSensibilite = 30
//                   const lineHeight = 7

//                   // Dessiner les bordures pour les en-têtes
//                   doc.rect(40, currentY, columnWidthAntibiotique, lineHeight)
//                   doc.rect(110, currentY, columnWidthSensibilite, lineHeight)
//                   doc.text('Antibiotique', 42, currentY + 5)
//                   doc.text('Sensibilité', 112, currentY + 5)
//                   currentY += lineHeight

//                   // Données de l'antibiogramme
//                   Object.entries(germe.antibiogramme).forEach(
//                     ([antibiotique, sensibilite]) => {
//                       doc.rect(
//                         40,
//                         currentY,
//                         columnWidthAntibiotique,
//                         lineHeight
//                       )
//                       doc.rect(
//                         110,
//                         currentY,
//                         columnWidthSensibilite,
//                         lineHeight
//                       )
//                       doc.text(antibiotique, 42, currentY + 5)
//                       doc.text(sensibilite, 112, currentY + 5)
//                       currentY += lineHeight
//                     }
//                   )

//                   currentY += 5
//                   doc.text(
//                     'S : Sensible    I : Intermédiaire     R : Résistant',
//                     42,
//                     currentY
//                   )
//                 }
//               })
//             }
//             currentY += 5
//           }
//         })
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

//       addPageNumbers(doc)
//       // doc.save(`facture-${invoice._id}.pdf`)
//       const blob = doc.output('blob')
//       // Créez une URL à partir du blob
//       const url = URL.createObjectURL(blob)
//       // Ouvrez le PDF dans un nouvel onglet

//       // Naviguez vers la nouvelle page avec l'URL du blob en tant qu'état
//       //corriger
//       // Ouvrez le PDF dans un nouvel onglet avec l'état
//       window.open(`/pdf-viewer?pdfBlobUrl=${encodeURIComponent(url)}`, '_blank')

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

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import jsPDF from 'jspdf'
import PropTypes from 'prop-types'
import logoLeft from '../images/bioramlogo.png'
import logoRight from '../images/logo2.png'

/**
 * Composant pour générer un PDF de résultat d'analyse médicale
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.invoice - Données de la facture/résultat
 */
function GenerateResultatButton({ invoice }) {
  const [user, setUser] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    email: '',
    telephone: '',
    devise: '',
    logo: '',
    site: '',
    Type: '',
    nomEntreprise: '',
    couleur: '',
  })

  // Récupération du profil utilisateur
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
        setUser({
          nom: data.nom || '',
          prenom: data.prenom || '',
          adresse: data.adresse || '',
          email: data.email || '',
          telephone: data.telephone || '',
          devise: data.devise || '',
          logo: data.logo || '',
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

  /**
   * Conversion d'un nom de couleur en valeur hexadécimale
   * @param {string} colorName - Nom de la couleur
   * @returns {string} - Code hexadécimal de la couleur
   */
  const getColorValue = (colorName) => {
    const colorMap = {
      rouge: '#FF0000',
      vert: '#66CDAA',
      bleu: '#0000FF',
      jaune: '#FFFF00',
      orange: '#FFA500',
      violet: '#800080',
      rose: '#FFC0CB',
      marron: '#A52A2A',
      gris: '#808080',
      noir: '#000000',
    }

    return colorMap[colorName.toLowerCase()] || '#000000'
  }

  /**
   * Groupe les résultats par catégorie
   * @param {Array} results - Tableau de résultats
   * @returns {Array} - Tableau de catégories avec leurs résultats
   */
  const sortResultsByCategory = (results) => {
    const groupedResults = results.reduce((acc, result) => {
      const category = result.testId?.categories || 'Autres'
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(result)
      return acc
    }, {})

    return Object.keys(groupedResults)
      .sort()
      .reduce((acc, key) => {
        acc.push({ category: key, results: groupedResults[key] })
        return acc
      }, [])
  }

  /**
   * Formatage de date au format JJ/MM/AAAA
   * @param {string} dateString - Date en format ISO
   * @returns {string} - Date formatée
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return (
      date.getDate().toString().padStart(2, '0') +
      '/' +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      '/' +
      date.getFullYear()
    )
  }

  /**
   * Formatage de date avec heure au format JJ/MM/AAAA
   * @param {string} dateString - Date en format ISO
   * @returns {string} - Date formatée
   */
  const formatDateAndTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  /**
   * Chargement d'une image
   * @param {string} src - URL de l'image
   * @returns {Promise<Image>} - Promesse contenant l'image chargée
   */
  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })

  /**
   * Génération principale du PDF
   */
  const generatePDF = async () => {
    try {
      // Initialisation du document
      const doc = new jsPDF()
      const userColor = getColorValue('gris')

      // Chargement des logos
      const [imgLeft] = await Promise.all([
        loadImage(logoLeft),
        loadImage(logoRight),
      ])

      // Configuration du document
      await setupDocumentHeader(doc, imgLeft, userColor)
      await addPatientInformation(doc, invoice)
      await addTestResults(doc, invoice)
      await addValidationInfo(doc, invoice)

      // Numérotation des pages
      addPageNumbers(doc)

      // Génération du PDF
      const blob = doc.output('blob')
      const url = URL.createObjectURL(blob)
      window.open(`/pdf-viewer?pdfBlobUrl=${encodeURIComponent(url)}`, '_blank')
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      alert('Une erreur est survenue lors de la génération du PDF.')
    }
  }

  /**
   * Configuration de l'en-tête du document
   * @param {Object} doc - Document jsPDF
   * @param {Image} imgLeft - Logo gauche
   * @param {string} userColor - Couleur de l'utilisateur
   */
  const setupDocumentHeader = async (doc, imgLeft, userColor) => {
    // Ajout du logo
    const maxWidth = 30
    const leftHeight = maxWidth * (imgLeft.height / imgLeft.width)
    doc.addImage(imgLeft, 'PNG', 20, 5, maxWidth, leftHeight)

    // En-tête du document
    doc.setFontSize(12)
    doc.setFont('Times')
    doc.text("LABORATOIRE D'ANALYSES MEDICALES", 65, 10)

    doc.setFontSize(7)
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

    doc.setFont('Times')
    doc.setTextColor(userColor)

    doc.setFontSize(14)
    doc.text('', 105, 30, null, null, 'center')

    doc.setFillColor(userColor)
    doc.setLineWidth(0.5)
    doc.rect(20, 40, 170, 0.5, 'F')
    doc.setTextColor(0, 0, 0)

    // Ajout du pied de page
    addFooter(doc, userColor)
  }

  /**
   * Ajout des informations du patient
   * @param {Object} doc - Document jsPDF
   * @param {Object} invoice - Données de la facture
   */
  const addPatientInformation = (doc, invoice) => {
    const currentY = 40

    doc.setFontSize(10)
    doc.setFont('Times', 'bold')

    // Information du dossier
    doc.text(`Nº Dossier: ${invoice?.identifiant}`, 135, currentY + 7)
    doc.text(
      `Nom: ${invoice.userId.prenom.toUpperCase()} ${invoice.userId.nom.toUpperCase()}`,
      135,
      currentY + 12
    )

    // Calcul et affichage de l'âge
    let ageDisplay = 'Non disponible'
    if (invoice.userId.age) {
      ageDisplay = invoice.userId.age.toString()
    } else if (invoice.userId.dateNaissance) {
      const birthDate = new Date(invoice.userId.dateNaissance)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      ageDisplay = age.toString()
    }

    doc.text(`Âge: ${ageDisplay} ans`, 135, currentY + 17)
    doc.text(`Tel: ${invoice.userId.telephone}`, 135, currentY + 22)

    // Informations complémentaires
    doc.text(`NIP: ${invoice?.userId.nip}`, 35, currentY + 7)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont('Times')

    // Date de création
    const formattedDate = formatDate(invoice?.createdAt)
    doc.setFont('Times')
    doc.text('Date: ', 35, currentY + 12)
    const dateLabelWidth = doc.getTextWidth('Date: ')
    doc.setFont('Times', 'bold')
    doc.text(formattedDate, 35 + dateLabelWidth, currentY + 12)
    doc.setFont('Times', 'normal')
  }

  /**
   * Ajout du pied de page
   * @param {Object} doc - Document jsPDF
   * @param {string} userColor - Couleur de l'utilisateur
   */
  const addFooter = (doc, userColor) => {
    const footerY = 277
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
    doc.text(`RC/SN-DKR-2019 B 13431 -NINEA 0073347059 2E2 `, 80, footerY + 14)
  }

  /**
   * Ajoute les numéros de page
   * @param {Object} doc - Document jsPDF
   */
  const addPageNumbers = (doc) => {
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      doc.text(` ${i}/${pageCount}`, 185, 275, { align: 'center' })
    }
  }

  /**
   * Vérification si on doit ajouter une nouvelle page
   * @param {Object} doc - Document jsPDF
   * @param {number} currentY - Position Y actuelle
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const checkNewPage = (doc, currentY, invoice) => {
    if (currentY > 250) {
      doc.addPage()
      addFooter(doc, getColorValue('gris'))
      currentY = 25

      // En-tête de la nouvelle page
      doc.text(`Nº Dossier: ${invoice?.identifiant}`, 42, currentY)
      doc.text(
        `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
        42,
        currentY + 5
      )
      currentY += 15
    }
    return currentY
  }

  /**
   * Affiche une ligne d'hématies
   * @param {Object} doc - Document jsPDF
   * @param {number} posY - Position Y
   * @param {string} label - Étiquette
   * @param {string} value - Valeur
   * @param {string} unit - Unité
   * @param {string} ref - Valeur de référence
   * @returns {number} - Nouvelle position Y
   */
  const printHematiesLine = (doc, posY, label, value, unit, ref) => {
    doc.text(label, 25, posY)
    doc.text(value, 85, posY)
    if (unit) {
      doc.text(unit, 100, posY)
    }
    if (ref) {
      doc.text(ref, 120, posY)
    }
    return posY + 5
  }

  /**
   * Affiche une ligne de leucocytes
   * @param {Object} doc - Document jsPDF
   * @param {number} posY - Position Y
   * @param {string} label - Étiquette
   * @param {string} pctValue - Valeur en pourcentage
   * @param {string} mainValue - Valeur principale
   * @param {string} unit - Unité
   * @param {string} reference - Valeur de référence
   * @returns {number} - Nouvelle position Y
   */
  const printLeucocytesLine = (
    doc,
    posY,
    label,
    pctValue,
    mainValue,
    unit,
    reference
  ) => {
    doc.text(label, 25, posY)
    if (pctValue) {
      doc.text(`${pctValue}%`, 70, posY)
    }
    doc.text(mainValue, 85, posY)
    if (unit) {
      doc.text(unit, 100, posY)
    }
    if (reference) {
      doc.text(reference, 120, posY)
    }
    return posY + 5
  }

  /**
   * Vérifie si les hématies ont des valeurs
   * @param {Object} hematies - Données des hématies
   * @returns {boolean} - Vrai si des valeurs existent
   */
  const hasHematiesValues = (hematies) => {
    if (!hematies) return false
    const { gr, hgb, hct, vgm, tcmh, ccmh, idr_cv } = hematies
    return (
      gr?.valeur ||
      hgb?.valeur ||
      hct?.valeur ||
      vgm?.valeur ||
      tcmh?.valeur ||
      ccmh?.valeur ||
      idr_cv?.valeur
    )
  }

  /**
   * Vérifie si les leucocytes ont des valeurs
   * @param {Object} leuco - Données des leucocytes
   * @returns {boolean} - Vrai si des valeurs existent
   */
  const hasLeucocytesValues = (leuco) => {
    if (!leuco) return false
    const {
      gb,
      neut,
      lymph,
      mono,
      eo,
      baso,
      plt,
      proerythroblastes,
      erythroblastes,
      myeloblastes,
      promyelocytes,
      myelocytes,
      metamyelocytes,
      monoblastes,
      lymphoblastes,
    } = leuco

    return (
      gb?.valeur ||
      neut?.valeur ||
      neut?.pourcentage ||
      lymph?.valeur ||
      lymph?.pourcentage ||
      mono?.valeur ||
      mono?.pourcentage ||
      eo?.valeur ||
      eo?.pourcentage ||
      baso?.valeur ||
      baso?.pourcentage ||
      plt?.valeur ||
      proerythroblastes?.valeur ||
      proerythroblastes?.pourcentage ||
      erythroblastes?.valeur ||
      erythroblastes?.pourcentage ||
      myeloblastes?.valeur ||
      myeloblastes?.pourcentage ||
      promyelocytes?.valeur ||
      promyelocytes?.pourcentage ||
      myelocytes?.valeur ||
      myelocytes?.pourcentage ||
      metamyelocytes?.valeur ||
      metamyelocytes?.pourcentage ||
      monoblastes?.valeur ||
      monoblastes?.pourcentage ||
      lymphoblastes?.valeur ||
      lymphoblastes?.pourcentage
    )
  }

  /**
   * Affiche les résultats des tests
   * @param {Object} doc - Document jsPDF
   * @param {Object} invoice - Données de la facture
   */
  const addTestResults = async (doc, invoice) => {
    let currentY = 77 // Position initiale après les en-têtes

    // Tri des résultats par catégorie
    const sortedResults = sortResultsByCategory(invoice?.resultat)

    // Pour chaque catégorie
    for (const group of sortedResults) {
      // Vérifier si on doit passer à une nouvelle page
      currentY = checkNewPage(doc, currentY, invoice)

      // Affichage de la catégorie
      doc.setFontSize(12)
      doc.setFont('Times', 'bold')
      doc.text(group.category.toUpperCase(), 90, currentY)

      // Ligne sous la catégorie
      doc.line(20, currentY + 2, 190, currentY + 2)
      currentY += 10

      // Pour chaque test dans la catégorie
      for (const test of group.results) {
        if (!test || !test.testId) continue

        // Préparation des données du test
        currentY = await renderTest(doc, test, currentY, invoice)
      }
    }

    return currentY
  }

  /**
   * Affiche un test spécifique
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} currentY - Position Y actuelle
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderTest = async (doc, test, currentY, invoice) => {
    // Vérifier si on doit passer à une nouvelle page
    currentY = checkNewPage(doc, currentY, invoice)

    const maxLineWidth = 100
    let nomTestLines = doc.splitTextToSize(
      `${test.testId.nom.toUpperCase()}`,
      maxLineWidth
    )

    // Affichage du nom du test
    doc.setFontSize(9)
    doc.setFont('Courier', 'normal')
    doc.setFontSize(8)
    doc.setFont('Times', 'bold')

    // Dessiner un point pour la puce
    doc.setFillColor(0, 0, 0)
    doc.circle(18, currentY - 1, 1, 'F')

    // Différence de rendu selon la présence d'observations
    if (test?.observations && test?.observations?.macroscopique.length > 0) {
      doc.setFontSize(9)
      doc.setFont('Times', 'bold')
      doc.text(nomTestLines, 60, currentY)
    } else {
      doc.setFontSize(9)
      doc.text(nomTestLines, 20, currentY)
    }

    currentY += 5 * nomTestLines.length
    doc.setFont('Times', 'normal')
    doc.setFontSize(8)

    const formattedDate = formatDateAndTime(test?.datePrelevement)
    const formattedDateAnterieur = formatDateAndTime(
      test?.dernierResultatAnterieur?.date
    )

    doc.setFont('Times', 'bold')
    doc.setFontSize(8)

    // Affichage des résultats antérieurs si présents
    if (
      test?.observations?.macroscopique.length === 0 &&
      test?.dernierResultatAnterieur
    ) {
      const valeurAnterieure = test.dernierResultatAnterieur.valeur ?? ''
      const dateAnterieure = formattedDateAnterieur ?? ''
      doc.text('Antériorités', 170, currentY)
      doc.text(valeurAnterieure, 170, currentY + 5)
      doc.text(dateAnterieure, 190, currentY)
    }

    // Affichage de la valeur du test
    if (test?.observations?.macroscopique.length === 0) {
      doc.setFont('Times', 'bold')
      doc.setFontSize(10)
      doc.text(`${test?.valeur}`, 90, currentY + 5)

      if (test?.qualitatif) {
        doc.text(`(${test?.qualitatif})`, 86, currentY + 10)
      }

      // Traitement des exceptions (NFS, QBC, groupe sanguin, etc.)
      let excepY = currentY + 15
      if (test?.exceptions) {
        excepY = renderExceptions(doc, test, excepY, invoice)
      }

      // Affichage des informations de la machine
      renderMachineInfo(doc, test, currentY)

      // Affichage du type de prélèvement
      if (test?.observations?.macroscopique.length === 0) {
        doc.text(
          `Prélèvement : ${formattedDate}, ${test?.typePrelevement}`,
          20,
          currentY + 3
        )
      }

      doc.setFontSize(8)
      doc.setFont('Times', 'normal')
      currentY += 12

      // Affichage des remarques
      if (test?.observations?.macroscopique.length === 0 && test?.remarque) {
        doc.text(`${test.remarque}`, 20, currentY)
      }
      currentY += 5

      // Affichage de l'interprétation si présente
      if (test.statutInterpretation) {
        currentY = renderInterpretation(doc, test, currentY, invoice)
      }

      // Mise à jour de la position Y
      currentY = Math.max(currentY, excepY)
    }

    // Traitement des observations, cultures, etc.
    if (
      test?.observations ||
      test?.culture ||
      test?.gram ||
      test?.conclusion ||
      (test?.observations && test?.observations?.macroscopique.length > 0)
    ) {
      currentY = renderObservations(doc, test, currentY, invoice)
    }

    // Ajout d'espace après le test
    currentY += 5

    return currentY
  }

  /**
   * Affiche les exceptions spécifiques (NFS, QBC, etc.)
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} excepY - Position Y de départ
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderExceptions = (doc, test, excepY, invoice) => {
    if (test.exceptions.qbc && test.exceptions.qbc.positivite) {
      // QBC
      excepY = renderQbcException(doc, test, excepY, invoice)
    } else if (
      test.exceptions.groupeSanguin &&
      (test.exceptions.groupeSanguin.abo ||
        test.exceptions.groupeSanguin.rhesus)
    ) {
      // Groupe sanguin
      excepY = renderBloodGroupException(doc, test, excepY, invoice)
    } else if (
      test.exceptions.hgpo &&
      (test.exceptions.hgpo.t0 ||
        test.exceptions.hgpo.t60 ||
        test.exceptions.hgpo.t120)
    ) {
      // HGPO
      excepY = renderHgpoException(doc, test, excepY, invoice)
    } else if (
      test.exceptions.ionogramme &&
      (test.exceptions.ionogramme.na ||
        test.exceptions.ionogramme.k ||
        test.exceptions.ionogramme.cl ||
        test.exceptions.ionogramme.ca ||
        test.exceptions.ionogramme.mg)
    ) {
      // Ionogramme
      excepY = renderIonogrammeException(doc, test, excepY, invoice)
    } else if (test.exceptions.nfs) {
      // NFS
      excepY = renderNfsException(doc, test, excepY, invoice)
    }

    return excepY
  }

  /**
   * Affiche l'exception QBC (Quantitative Buffy Coat)
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} excepY - Position Y de départ
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderQbcException = (doc, test, excepY, invoice) => {
    // Vérifier si on doit passer à une nouvelle page
    if (excepY > 250) {
      doc.addPage()
      addFooter(doc, getColorValue('gris'))
      excepY = 25
    }

    doc.setFont('Times', 'normal')

    // Positivité
    if (test.exceptions.qbc.positivite) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.text(
        `Statut parasitaire : ${test.exceptions.qbc.positivite}`,
        25,
        excepY
      )
      excepY += 5
    }

    // Nombre de croix
    if (typeof test.exceptions.qbc.nombreCroix === 'number') {
      excepY = checkNewPage(doc, excepY, invoice)
      const numberOfCross = test.exceptions.qbc.nombreCroix || 0
      const crosses = '+ '.repeat(numberOfCross)
      doc.text(`Niveau d'infestation : ${crosses}`, 25, excepY)
      excepY += 5
    }

    // Densité parasitaire
    if (test.exceptions.qbc.densiteParasitaire) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.text(
        `Densité parasitaire : ${test.exceptions.qbc.densiteParasitaire} p/µL`,
        25,
        excepY
      )
      excepY += 5
    }

    // Espèces
    if (
      Array.isArray(test.exceptions.qbc.especes) &&
      test.exceptions.qbc.especes.length > 0
    ) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.text(
        `Espèces : ${test.exceptions.qbc.especes.join(', ')}`,
        25,
        excepY
      )
      excepY += 7
    }

    return excepY
  }

  /**
   * Affiche l'exception de groupe sanguin
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} excepY - Position Y de départ
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderBloodGroupException = (doc, test, excepY, invoice) => {
    if (excepY > 250) {
      doc.addPage()
      addFooter(doc, getColorValue('gris'))
      excepY = 25
    }

    doc.setFont('Times', 'normal')

    if (test.exceptions.groupeSanguin.abo) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.text(`Groupe ABO : ${test.exceptions.groupeSanguin.abo}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.groupeSanguin.rhesus) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.text(
        `Rhésus (Antigène D) : ${test.exceptions.groupeSanguin.rhesus}`,
        25,
        excepY
      )
      excepY += 7
    }

    return excepY
  }

  /**
   * Affiche l'exception HGPO (Hyperglycémie Provoquée par voie Orale)
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} excepY - Position Y de départ
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderHgpoException = (doc, test, excepY, invoice) => {
    if (excepY > 250) {
      doc.addPage()
      addFooter(doc, getColorValue('gris'))
      excepY = 25
    }

    doc.setFont('Times', 'normal')

    if (test.exceptions.hgpo.t0) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.text(`Glycémie T0 : ${test.exceptions.hgpo.t0} g/L`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.hgpo.t60) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.text(`Glycémie T60 : ${test.exceptions.hgpo.t60} g/L`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.hgpo.t120) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.text(`Glycémie T120 : ${test.exceptions.hgpo.t120} g/L`, 25, excepY)
      excepY += 7
    }

    return excepY
  }

  /**
   * Affiche l'exception Ionogramme
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} excepY - Position Y de départ
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderIonogrammeException = (doc, test, excepY, invoice) => {
    if (excepY > 250) {
      doc.addPage()
      addFooter(doc, getColorValue('gris'))
      excepY = 25
    }

    doc.setFont('Times', 'normal')

    if (test.exceptions.ionogramme.na) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.text(`Na+ : ${test.exceptions.ionogramme.na} `, 25, excepY)
      doc.text(`Valeur de référence`, 110, excepY - 8)
      doc.text(`137-145 mEq/L`, 110, excepY)
      excepY += 5
    }

    if (test.exceptions.ionogramme.k) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.text(`K+ : ${test.exceptions.ionogramme.k} `, 25, excepY)
      doc.text(`3.5-5.0 mEq/L`, 110, excepY)
      excepY += 5
    }

    if (test.exceptions.ionogramme.cl) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.text(`Cl- : ${test.exceptions.ionogramme.cl} `, 25, excepY)
      doc.text(`98.0-107.0 mEq/L`, 110, excepY)
      excepY += 5
    }

    if (test.exceptions.ionogramme.ca) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.text(`Ca2+ : ${test.exceptions.ionogramme.ca} `, 25, excepY)
      doc.text(`137-145 mEq/L`, 110, excepY)
      excepY += 5
    }

    if (test.exceptions.ionogramme.mg) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.text(`Mg2+ : ${test.exceptions.ionogramme.mg} `, 25, excepY)
      doc.text(`137-145 mEq/L`, 110, excepY)
      excepY += 7
    }

    return excepY
  }

  /**
   * Affiche l'exception NFS (Numération Formule Sanguine)
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} excepY - Position Y de départ
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderNfsException = (doc, test, excepY, invoice) => {
    const { hematiesEtConstantes, leucocytesEtFormules } = test.exceptions.nfs

    const showHematies = hasHematiesValues(hematiesEtConstantes)
    const showLeucocytes = hasLeucocytesValues(leucocytesEtFormules)

    if (!showHematies && !showLeucocytes) {
      return excepY
    }

    // Titre principal NFS
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'bold')
    doc.setFontSize(10)
    doc.text('NFS (Numération Formule Sanguine)', 25, excepY)
    excepY += 7
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)
    doc.text('Valeurs de références', 120, excepY)
    excepY += 3

    // Hématies et constantes
    if (showHematies) {
      doc.setFont('Times', 'bold')
      doc.text('HEMATIES ET CONSTANTES', 25, excepY)
      excepY += 7
      doc.setFont('Times', 'normal')

      // Hématies
      if (hematiesEtConstantes.gr?.valeur) {
        excepY = printHematiesLine(
          doc,
          excepY,
          'Hématies',
          String(hematiesEtConstantes.gr.valeur),
          hematiesEtConstantes.gr.unite || '',
          hematiesEtConstantes.gr.reference || ''
        )
      }

      // Hémoglobine
      if (hematiesEtConstantes.hgb?.valeur) {
        excepY = printHematiesLine(
          doc,
          excepY,
          'Hémoglobine',
          String(hematiesEtConstantes.hgb.valeur),
          hematiesEtConstantes.hgb.unite || '',
          hematiesEtConstantes.hgb.reference || ''
        )
      }

      // Hématocrite
      if (hematiesEtConstantes.hct?.valeur) {
        excepY = printHematiesLine(
          doc,
          excepY,
          'Hématocrite',
          String(hematiesEtConstantes.hct.valeur),
          hematiesEtConstantes.hct.unite || '',
          hematiesEtConstantes.hct.reference || ''
        )
      }

      // VGM
      if (hematiesEtConstantes.vgm?.valeur) {
        excepY = printHematiesLine(
          doc,
          excepY,
          'VGM',
          String(hematiesEtConstantes.vgm.valeur),
          hematiesEtConstantes.vgm.unite || '',
          hematiesEtConstantes.vgm.reference || ''
        )
      }

      // TCMH
      if (hematiesEtConstantes.tcmh?.valeur) {
        excepY = printHematiesLine(
          doc,
          excepY,
          'TCMH',
          String(hematiesEtConstantes.tcmh.valeur),
          hematiesEtConstantes.tcmh.unite || '',
          hematiesEtConstantes.tcmh.reference || ''
        )
      }

      // CCMH
      if (hematiesEtConstantes.ccmh?.valeur) {
        excepY = printHematiesLine(
          doc,
          excepY,
          'CCMH',
          String(hematiesEtConstantes.ccmh.valeur),
          hematiesEtConstantes.ccmh.unite || '',
          hematiesEtConstantes.ccmh.reference || ''
        )
      }

      // IDR-CV
      if (hematiesEtConstantes.idr_cv?.valeur) {
        excepY = printHematiesLine(
          doc,
          excepY,
          'IDR-CV',
          String(hematiesEtConstantes.idr_cv.valeur),
          hematiesEtConstantes.idr_cv.unite || '',
          hematiesEtConstantes.idr_cv.reference || ''
        )
      }

      excepY += 5
    }

    // Leucocytes et formule
    if (showLeucocytes) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.setFont('Times', 'bold')
      doc.text('LEUCOCYTES ET FORMULE', 25, excepY)
      excepY += 7
      doc.setFont('Times', 'normal')

      const {
        gb,
        neut,
        lymph,
        mono,
        eo,
        baso,
        plt,
        proerythroblastes,
        erythroblastes,
        myeloblastes,
        promyelocytes,
        myelocytes,
        metamyelocytes,
        monoblastes,
        lymphoblastes,
      } = leucocytesEtFormules

      // Leucocytes (GB)
      if (gb?.valeur) {
        excepY = printLeucocytesLine(
          doc,
          excepY,
          'Leucocytes',
          null,
          String(gb.valeur),
          gb.unite || '',
          gb.reference || ''
        )
      }

      // Neutrophiles
      if (neut?.valeur || neut?.pourcentage) {
        let p = neut?.pourcentage ? String(neut.pourcentage) : null
        let v = neut?.valeur ? String(neut.valeur) : ''
        excepY = printLeucocytesLine(
          doc,
          excepY,
          'Neutrophiles',
          p,
          v,
          neut.unite || '',
          neut.referencePourcentage || ''
        )
      }

      // Lymphocytes
      if (lymph?.valeur || lymph?.pourcentage) {
        let p = lymph?.pourcentage ? String(lymph.pourcentage) : null
        let v = lymph?.valeur ? String(lymph.valeur) : ''
        excepY = printLeucocytesLine(
          doc,
          excepY,
          'Lymphocytes',
          p,
          v,
          lymph.unite || '',
          lymph.referencePourcentage || ''
        )
      }

      // Monocytes
      if (mono?.valeur || mono?.pourcentage) {
        let p = mono?.pourcentage ? String(mono.pourcentage) : null
        let v = mono?.valeur ? String(mono.valeur) : ''
        excepY = printLeucocytesLine(
          doc,
          excepY,
          'Monocytes',
          p,
          v,
          mono.unite || '',
          mono.referencePourcentage || ''
        )
      }

      // Eosinophiles
      if (eo?.valeur || eo?.pourcentage) {
        let p = eo?.pourcentage ? String(eo.pourcentage) : null
        let v = eo?.valeur ? String(eo.valeur) : ''
        excepY = printLeucocytesLine(
          doc,
          excepY,
          'Eosinophiles',
          p,
          v,
          eo.unite || '',
          eo.referencePourcentage || ''
        )
      }

      // Basophiles
      if (baso?.valeur || baso?.pourcentage) {
        let p = baso?.pourcentage ? String(baso.pourcentage) : null
        let v = baso?.valeur ? String(baso.valeur) : ''
        excepY = printLeucocytesLine(
          doc,
          excepY,
          'Basophiles',
          p,
          v,
          baso.unite || '',
          baso.referencePourcentage || ''
        )
      }

      // Plaquettes (section spéciale)
      excepY += 8
      doc.setFont('Times', 'bold')
      doc.text('PLAQUETTES', 25, excepY)
      excepY += 5

      if (plt?.valeur) {
        doc.setFont('Times', 'normal')
        excepY = printLeucocytesLine(
          doc,
          excepY,
          'Plaquettes',
          null,
          String(plt.valeur),
          plt.unite || '',
          plt.reference || ''
        )
        doc.setFont('Times', 'normal')
      }

      // Section "AUTRES" pour les cellules immatures/blastes
      excepY += 7
      doc.setFont('Times', 'bold')
      doc.text('AUTRES', 25, excepY)
      excepY += 7
      doc.setFont('Times', 'normal')

      // Tableau des cellules immatures
      const immatures = [
        { label: 'Proérythroblastes', key: 'proerythroblastes' },
        { label: 'Erythroblastes', key: 'erythroblastes' },
        { label: 'Myéloblastes', key: 'myeloblastes' },
        { label: 'Promyélocytes', key: 'promyelocytes' },
        { label: 'Myélocytes', key: 'myelocytes' },
        { label: 'Métamyélocytes', key: 'metamyelocytes' },
        { label: 'Monoblastes', key: 'monoblastes' },
        { label: 'Lymphoblastes', key: 'lymphoblastes' },
      ]

      // Affichage de chaque cellule immature si présente
      for (const item of immatures) {
        const obj = leucocytesEtFormules[item.key]
        if (obj?.valeur || obj?.pourcentage) {
          excepY = checkNewPage(doc, excepY, invoice)
          let p = obj?.pourcentage ? String(obj.pourcentage) : null
          let v = obj?.valeur ? String(obj.valeur) : ''
          excepY = printLeucocytesLine(
            doc,
            excepY,
            item.label,
            p,
            v,
            obj.unite || '',
            obj.referencePourcentage || ''
          )
        }
      }

      excepY += 5
    }

    return excepY
  }

  /**
   * Affiche les informations de la machine utilisée
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} currentY - Position Y actuelle
   */
  const renderMachineInfo = (doc, test, currentY) => {
    // Affichage du nom de la machine
    doc.setFontSize(9)
    doc.setFont('Times', 'bold')

    // Déterminer quelle machine afficher
    let machineText = test?.statutMachine
      ? test?.testId?.machineA
      : test?.testId?.machineB

    // Afficher le nom de la machine si disponible
    if (machineText) {
      doc.text(` ${machineText}`, 20, currentY - 1)
    }

    // Calculer la largeur du texte de la machine
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
    let methodStartPos = 20 + machineTextWidth + 5

    // Afficher la méthode si disponible
    if (test?.methode) {
      doc.text(`(${test.methode})`, methodStartPos, currentY - 1)
    }

    // Affichage de la valeur de référence de la machine
    let machineValue = test.statutMachine
      ? test.testId.valeurMachineA
      : test.testId.valeurMachineB
    if (machineValue) {
      doc.text(`${machineValue}`, 110, currentY + 5)
    }
  }

  /**
   * Affiche l'interprétation du test
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} currentY - Position Y actuelle
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderInterpretation = (doc, test, currentY, invoice) => {
    const interpretation = test.statutMachine
      ? test.testId.interpretationA
      : test.testId.interpretationB

    let interpretationHeight = 0
    let interpretationLines = []

    if (interpretation.type === 'text') {
      // Texte d'interprétation
      interpretationLines = doc.splitTextToSize(interpretation.content, 100)
      interpretationHeight = 5 * interpretationLines.length
    } else if (interpretation.type === 'table') {
      // Tableau d'interprétation
      const { rows } = interpretation.content
      interpretationHeight = 5 + rows.length * 5
    }

    // Vérifier si l'espace est suffisant
    const footerY = 265
    const marginBottom = 5

    if (currentY + interpretationHeight + marginBottom > footerY) {
      doc.addPage()
      currentY = 20
      doc.text(`Nº Dossier: ${invoice?.identifiant}`, 42, currentY)
      doc.text(
        `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
        42,
        currentY + 5
      )
      doc.setFontSize(10)
      doc.setFont('Times', 'bold')
      doc.text('Interprétation:', 20, currentY + 15)
      currentY += 20
      addFooter(doc, getColorValue('gris'))
    } else {
      doc.setFontSize(10)
      doc.setFont('Times', 'bold')
      doc.text('Interprétation:', 20, currentY)
      currentY += 5
    }

    // Afficher le contenu de l'interprétation
    if (interpretation.type === 'text') {
      doc.setFontSize(9)
      doc.setFont('Courier', 'normal')
      doc.text(interpretationLines, 20, currentY)
      currentY += interpretationHeight
    } else if (interpretation.type === 'table') {
      // Afficher les en-têtes
      doc.setFontSize(9)
      doc.setFont('Times', 'bold')
      interpretation.content.columns.forEach((col, colIndex) => {
        doc.text(col, 20 + colIndex * 40, currentY)
      })
      currentY += 5

      // Afficher les données
      doc.setFont('Times', 'normal')
      interpretation.content.rows.forEach((row) => {
        row.forEach((cell, cellIndex) => {
          doc.text(cell, 20 + cellIndex * 40, currentY)
        })
        currentY += 5
      })
    }

    return currentY
  }

  /**
   * Affiche les observations, culture, gram, etc.
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} currentY - Position Y actuelle
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderObservations = (doc, test, currentY, invoice) => {
    const positionX = 100
    const formattedDate = formatDateAndTime(test?.datePrelevement)

    // Afficher le type et lieu de prélèvement
    if (test?.observations?.macroscopique.length > 0) {
      doc.text(
        ` ${test?.typePrelevement} : ${test?.lieuPrelevement}  ${formattedDate}`,
        20,
        currentY - 10
      )
    }

    // Examen macroscopique
    if (test?.observations?.macroscopique.length > 0) {
      currentY = renderMacroscopicExam(doc, test, currentY, positionX)
    }

    // Examen cytologique
    if (
      test?.observations?.microscopique &&
      test?.observations?.macroscopique.length > 0
    ) {
      currentY = renderMicroscopicExam(doc, test, currentY, positionX, invoice)
    }

    // Examen chimie
    if (test?.observations?.chimie) {
      currentY = renderChemistryExam(doc, test, currentY, positionX, invoice)
    }

    // Examen bactériologique (Gram)
    if (test?.gram) {
      currentY = renderGramExam(doc, test, currentY, positionX, invoice)
    }

    // Culture
    if (test?.culture) {
      currentY = renderCultureExam(doc, test, currentY, positionX, invoice)
    }

    // Recherche de Chlamydia
    if (test?.observations?.rechercheChlamydia) {
      currentY = renderChlamydiaExam(doc, test, currentY, positionX, invoice)
    }

    // Recherche de Mycoplasmes
    if (test?.observations?.rechercheMycoplasmes) {
      currentY = renderMycoplasmesExam(doc, test, currentY, positionX, invoice)
    }

    // Conclusion
    if (test?.conclusion) {
      currentY = renderConclusion(doc, test, currentY, invoice)
    }

    // Remarques
    if (test?.observations?.macroscopique.length > 0 && test?.remarque) {
      doc.text(`Remarque: ${test.remarque}`, 20, currentY)
    }

    currentY += 5

    // Gestion des antibiogrammes
    if (test.culture && Array.isArray(test.culture.germeIdentifie)) {
      currentY = renderAntibiograms(doc, test, currentY, invoice)
    }

    return currentY
  }

  /**
   * Affiche l'examen macroscopique
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} currentY - Position Y actuelle
   * @param {number} positionX - Position X pour les valeurs
   * @returns {number} - Nouvelle position Y
   */
  const renderMacroscopicExam = (doc, test, currentY, positionX) => {
    doc.setFontSize(10)
    doc.setFont('Times', 'bold')
    doc.text(`EXAMEN MACROSCOPIQUE`, 20, currentY)
    doc.setFontSize(10)
    doc.setFont('Times', 'normal')
    currentY += 5

    if (
      Array.isArray(test?.observations?.macroscopique) &&
      test.observations.macroscopique.length > 0
    ) {
      const macroscopiqueText = test.observations.macroscopique.join(', ')
      doc.text(`${test?.typePrelevement} : ${macroscopiqueText}`, 20, currentY)
      currentY += 7
    }

    return currentY
  }

  /**
   * Affiche l'examen microscopique/cytologique
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} currentY - Position Y actuelle
   * @param {number} positionX - Position X pour les valeurs
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderMicroscopicExam = (doc, test, currentY, positionX, invoice) => {
    doc.setFontSize(10)
    doc.setFont('Times', 'bold')
    doc.text(`EXAMEN CYTOLOGIQUE`, 20, currentY)
    doc.setFontSize(10)
    doc.setFont('Times', 'normal')
    currentY += 5

    // Structure des paramètres microscopiques à afficher
    const microscopicParams = [
      { label: 'Leucocytes', key: 'leucocytes', units: true },
      { label: 'Hématies', key: 'hematies', units: true },
      { label: 'pH', key: 'ph', units: false },
      {
        label: 'Cellules épithéliales',
        key: 'cellulesEpitheliales',
        units: false,
      },
      {
        label: 'Éléments levuriformes',
        key: 'elementsLevuriforme',
        units: false,
      },
      { label: 'Filaments mycéliens', key: 'filamentsMyceliens', units: false },
      {
        label: 'Trichomonas vaginalis',
        key: 'trichomonasVaginalis',
        units: false,
      },
      {
        label: 'Cristaux',
        key: 'cristaux',
        units: false,
        details: 'cristauxDetails',
      },
      { label: 'Cylindres', key: 'cylindres', units: false },
      {
        label: 'Parasites',
        key: 'parasites',
        units: false,
        details: 'parasitesDetails',
      },
      {
        label: 'Trichomonas intestinales',
        key: 'trichomonasIntestinales',
        units: false,
      },
      { label: 'Œufs de Bilharzies', key: 'oeufsDeBilharzies', units: false },
      { label: 'Clue Cells', key: 'clueCells', units: false },
      {
        label: 'Gardnerella vaginalis',
        key: 'gardnerellaVaginalis',
        units: false,
      },
      {
        label: 'Bacilles de Doderlein',
        key: 'bacillesDeDoderlein',
        units: false,
      },
      { label: 'Type de Flore', key: 'typeDeFlore', units: false },
      {
        label: 'Recherche de Streptocoque B',
        key: 'rechercheDeStreptocoqueB',
        units: false,
      },
      { label: 'Monocytes', key: 'monocytes', units: false, percentage: true },
      {
        label: 'Polynucléaires neutrophiles altérées',
        key: 'polynucleairesNeutrophilesAlterees',
        units: false,
        percentage: true,
      },
      {
        label: 'Polynucléaires neutrophiles non altérées',
        key: 'polynucleairesNeutrophilesNonAlterees',
        units: false,
        percentage: true,
      },
      {
        label: 'Éosinophiles',
        key: 'eosinophiles',
        units: false,
        percentage: true,
      },
      {
        label: 'Basophiles',
        key: 'basophiles',
        units: false,
        percentage: true,
      },
    ]

    // Affichage de chaque paramètre microscopique s'il est présent
    for (const param of microscopicParams) {
      const value = test.observations.microscopique[param.key]
      if (value && value.trim() !== '') {
        currentY = checkNewPage(doc, currentY, invoice)
        doc.text(`${param.label}:`, 20, currentY)

        let displayValue = value
        if (param.percentage) {
          displayValue = `${value}%`
        } else if (param.units && test.observations.microscopique.unite) {
          displayValue = `${value}/${test.observations.microscopique.unite}`
        }

        doc.text(displayValue, positionX, currentY)

        // Afficher les détails si disponibles
        if (
          param.details &&
          test.observations.microscopique[param.details] &&
          test.observations.microscopique[param.details].length > 0
        ) {
          const detailsText =
            test.observations.microscopique[param.details].join(', ')
          doc.setFontSize(7)

          const maxWidth = 85
          const splitText = doc.splitTextToSize(`(${detailsText})`, maxWidth)

          splitText.forEach((line, index) => {
            doc.text(line, positionX + 20, currentY + index * 5)
          })

          currentY += (splitText.length - 1) * 5
          doc.setFontSize(10)
        }

        currentY += 5
      }
    }

    return currentY
  }

  /**
   * Affiche l'examen de chimie
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} currentY - Position Y actuelle
   * @param {number} positionX - Position X pour les valeurs
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderChemistryExam = (doc, test, currentY, positionX, invoice) => {
    const {
      proteinesTotales,
      proteinesArochies,
      glycorachie,
      acideUrique,
      LDH,
    } = test.observations.chimie

    // Vérifier si au moins un paramètre chimique est présent
    if (
      !proteinesTotales &&
      !proteinesArochies &&
      !glycorachie &&
      !acideUrique &&
      !LDH
    ) {
      return currentY
    }

    // Titre de la section chimie
    currentY = checkNewPage(doc, currentY, invoice)
    doc.setFontSize(10)
    doc.setFont('Times', 'bold')
    doc.text(`CHIMIE`, 20, currentY)
    currentY += 5
    doc.setFontSize(10)
    doc.setFont('Times', 'normal')

    // Paramètres chimiques et leurs unités
    const chemistryParams = [
      {
        label: 'Proteines Totales',
        key: 'proteinesTotales',
        unit: 'g/L',
        reference: '',
      },
      {
        label: 'Proteines Arochies',
        key: 'proteinesArochies',
        unit: 'g/L',
        reference: '(0,2-0,4)',
      },
      {
        label: 'Glycorachie',
        key: 'glycorachie',
        unit: 'g/L',
        reference: '(0,2-0,4)',
      },
      {
        label: 'Acide Urique',
        key: 'acideUrique',
        unit: 'mg/L',
        reference: '',
      },
      {
        label: 'LDH',
        key: 'LDH',
        unit: 'U/I',
        reference: '',
      },
    ]

    // Affichage de chaque paramètre chimique s'il est présent
    for (const param of chemistryParams) {
      const value = test.observations.chimie[param.key]
      if (value && value.trim() !== '') {
        currentY = checkNewPage(doc, currentY, invoice)
        doc.text(`${param.label}:`, 20, currentY)
        doc.text(value, positionX, currentY)
        doc.text(param.unit, positionX + 10, currentY)

        if (param.reference) {
          doc.text(param.reference, positionX + 17, currentY)
        }

        currentY += 5
      }
    }

    currentY += 2 // Espacement après la section chimie
    return currentY
  }

  /**
   * Affiche l'examen de Gram
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} currentY - Position Y actuelle
   * @param {number} positionX - Position X pour les valeurs
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderGramExam = (doc, test, currentY, positionX, invoice) => {
    currentY = checkNewPage(doc, currentY, invoice)
    doc.setFontSize(10)
    doc.setFont('Times', 'bold')
    doc.text(`EXAMEN BACTERIOLOGIE DIRECT (Coloration de gram)`, 20, currentY)
    currentY += 8
    doc.setFontSize(10)
    doc.setFont('Times', 'normal')
    doc.text(`Gram:`, 20, currentY)
    doc.text(`${test.gram}`, positionX, currentY)
    currentY += 8

    return currentY
  }

  /**
   * Affiche les résultats de culture
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} currentY - Position Y actuelle
   * @param {number} positionX - Position X pour les valeurs
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderCultureExam = (doc, test, currentY, positionX, invoice) => {
    const { culture, germeIdentifie, description } = test.culture

    // Vérifier si des informations de culture sont présentes
    if (
      !culture &&
      (!Array.isArray(germeIdentifie) || germeIdentifie.length === 0) &&
      !description
    ) {
      return currentY
    }

    currentY = checkNewPage(doc, currentY, invoice)
    doc.setFontSize(10)
    doc.setFont('Times', 'bold')
    doc.text(`CULTURES SUR MILIEUX SPECIFIQUES:`, 20, currentY)
    currentY += 5
    doc.setFontSize(10)
    doc.setFont('Times', 'normal')

    // Afficher la culture
    if (culture) {
      doc.text(`Culture:`, 20, currentY)
      doc.text(culture, positionX, currentY)
      currentY += 5
    }

    // Afficher les germes identifiés
    if (Array.isArray(germeIdentifie) && germeIdentifie.length > 0) {
      const germeIdentifieText = germeIdentifie
        .map((germe) => germe.nom)
        .join(', ')
      const maxWidth = 95
      const splitText = doc.splitTextToSize(germeIdentifieText, maxWidth)

      doc.setFont('Times', 'italic')
      doc.text(`Germe(s) Identifié(s):`, 20, currentY)

      splitText.forEach((line, index) => {
        doc.text(line, positionX, currentY + index * 5)
      })

      currentY += splitText.length * 5
      doc.setFont('Times', 'normal')
      currentY += 5
    }

    // Afficher la description/numération
    if (description) {
      doc.text(`Numeration:`, 20, currentY)
      doc.text(description, positionX, currentY)
      currentY += 7
    }

    return currentY
  }

  /**
   * Affiche les résultats de recherche de Chlamydia
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} currentY - Position Y actuelle
   * @param {number} positionX - Position X pour les valeurs
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderChlamydiaExam = (doc, test, currentY, positionX, invoice) => {
    const { naturePrelevement, rechercheAntigeneChlamydiaTrochomatis } =
      test.observations.rechercheChlamydia

    // Vérifier si des informations de Chlamydia sont présentes
    if (!naturePrelevement && !rechercheAntigeneChlamydiaTrochomatis) {
      return currentY
    }

    currentY = checkNewPage(doc, currentY, invoice)
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

    // Recherche d'antigène
    if (rechercheAntigeneChlamydiaTrochomatis) {
      doc.text("Recherche d'antigène de Chlamydia trachomatis:", 20, currentY)
      doc.text(rechercheAntigeneChlamydiaTrochomatis, positionX, currentY)
      currentY += 7
    }

    return currentY
  }

  /**
   * Affiche les résultats de recherche de Mycoplasmes
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} currentY - Position Y actuelle
   * @param {number} positionX - Position X pour les valeurs
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderMycoplasmesExam = (doc, test, currentY, positionX, invoice) => {
    const {
      naturePrelevement,
      rechercheUreaplasmaUrealyticum,
      rechercheMycoplasmaHominis,
    } = test.observations.rechercheMycoplasmes

    // Vérifier si des informations de Mycoplasmes sont présentes
    if (
      !naturePrelevement &&
      !rechercheUreaplasmaUrealyticum &&
      !rechercheMycoplasmaHominis
    ) {
      return currentY
    }

    currentY = checkNewPage(doc, currentY, invoice)
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

    return currentY
  }

  /**
   * Affiche la conclusion
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} currentY - Position Y actuelle
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderConclusion = (doc, test, currentY, invoice) => {
    currentY = checkNewPage(doc, currentY, invoice)
    doc.setFontSize(10)
    doc.setFont('Times', 'bold')
    doc.text('CONCLUSION', 20, currentY)
    currentY += 5

    const maxLineWidth = 100
    const conclusionLines = doc.splitTextToSize(test.conclusion, maxLineWidth)
    doc.text(conclusionLines, 20, currentY)

    currentY += conclusionLines.length * 5
    doc.setFontSize(10)
    doc.setFont('Times', 'normal')
    currentY += 5

    return currentY
  }

  /**
   * Affiche les antibiogrammes
   * @param {Object} doc - Document jsPDF
   * @param {Object} test - Données du test
   * @param {number} currentY - Position Y actuelle
   * @param {Object} invoice - Données de la facture
   * @returns {number} - Nouvelle position Y
   */
  const renderAntibiograms = (doc, test, currentY, invoice) => {
    // Pour chaque germe identifié avec un antibiogramme
    for (const germe of test.culture.germeIdentifie) {
      // Vérifier si l'antibiogramme n'est pas vide
      if (Object.keys(germe.antibiogramme).length === 0) {
        continue
      }

      // Créer une nouvelle page pour chaque antibiogramme
      doc.addPage()
      addFooter(doc, getColorValue('gris'))
      currentY = 15

      // En-tête de l'antibiogramme
      doc.text(`Nº Dossier: ${invoice?.identifiant}`, 42, currentY)
      doc.text(
        `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
        42,
        currentY + 5
      )
      currentY += 10

      doc.setFontSize(10)
      doc.setFont('Times', 'bold')
      doc.text(`ANTIBIOGRAMME : ${germe.nom}`, 42, currentY)
      currentY += 7

      doc.setFont('Times', 'normal')

      // Configuration du tableau
      const columnWidthAntibiotique = 70
      const columnWidthSensibilite = 30
      const lineHeight = 7

      // En-têtes de colonne avec bordures
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

      // Légende
      currentY += 5
      doc.text(
        'S : Sensible    I : Intermédiaire     R : Résistant',
        42,
        currentY
      )
    }

    return currentY
  }

  /**
   * Ajoute les informations de validation
   * @param {Object} doc - Document jsPDF
   * @param {Object} invoice - Données de la facture
   */
  const addValidationInfo = async (doc, invoice) => {
    let currentY = 250 // Position par défaut

    // Recherche de l'historique de validation
    const validatedHistory = invoice.historiques.find(
      (h) => h.status === 'Validé'
    )

    if (validatedHistory && validatedHistory.updatedBy) {
      const validatedBy = `${validatedHistory.updatedBy.prenom} ${validatedHistory.updatedBy.nom}`

      doc.setFontSize(10)
      doc.setFont('Times', 'bold')
      doc.text(`Validé par: ${validatedBy}`, 110, currentY)

      doc.setFont('Times', 'normal')
      doc.setFontSize(8)

      // Ajouter le logo du validateur si disponible
      currentY += 5

      const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
      if (validatedHistory.updatedBy && validatedHistory.updatedBy.logo) {
        try {
          const logoPath = validatedHistory.updatedBy.logo.replace(/\\/g, '/')
          const fullLogoPath = `${apiUrl}/${logoPath}`

          const doctorLogo = await loadImage(fullLogoPath)
          const doctorLogoHeight = 50 * (doctorLogo.height / doctorLogo.width)
          doc.addImage(doctorLogo, 'PNG', 110, currentY, 50, doctorLogoHeight)
        } catch (error) {
          console.error(
            'Erreur lors du chargement du logo du validateur:',
            error
          )
        }
      }
    }
  }

  // Rendu du bouton
  return (
    <button className="btn btn-primary" onClick={generatePDF}>
      <FontAwesomeIcon icon={faDownload} />
    </button>
  )
}

// PropTypes
GenerateResultatButton.propTypes = {
  invoice: PropTypes.object.isRequired,
}

export default GenerateResultatButton
