// import { useState, useEffect } from 'react'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faFilePdf } from '@fortawesome/free-solid-svg-icons'
// import jsPDF from 'jspdf'
// import PropTypes from 'prop-types'
// import logoLeft from '../images/bioramlogo.png'
// import logoRight from '../images/logo2.png'

// function GenerateTicketButton({ invoice }) {
//   const [user, setUser] = useState({
//     nom: '',
//     prenom: '',
//     adresse: '',
//     email: '',
//     telephone: '',
//     devise: '',
//     logo: '',
//   })

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
//           logo: data.logo || '',
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
//       rouge: '#FF0000',
//       vert: '#66CDAA',
//       bleu: '#0000FF',
//       jaune: '#FFFF00',
//       orange: '#FFA500',
//       violet: '#800080',
//       rose: '#FFC0CB',
//       marron: '#A52A2A',
//       gris: '#808080',
//       noir: '#000000',
//     }

//     return colorMap[colorName.toLowerCase()] || '#000000'
//   }

//   const generateTicketPDF = async () => {
//     // Taille personnalisée pour un ticket (largeur x hauteur en mm)
//     const doc = new jsPDF('portrait', 'mm', [148, 105]) // A5 size
//     const userColor = getColorValue(user.couleur)

//     const loadImage = src => new Promise((resolve, reject) => {
//       const img = new Image()
//       img.onload = () => resolve(img)
//       img.onerror = reject
//       img.src = src
//     })

//     try {
//       const [imgLeft] = await Promise.all([loadImage(logoLeft)])

//       const maxWidth = 10
//       const leftHeight = maxWidth * (imgLeft.height / imgLeft.width)

//       doc.addImage(imgLeft, 'PNG', 5, 5, maxWidth, leftHeight)

//       const addFooter = () => {
//         const footerY = 130
//         doc.setFillColor(userColor)
//         doc.rect(10, footerY, 88, 0.5, 'F')
//         doc.setFontSize(4)
//         doc.setTextColor(0, 0, 0)
//         doc.text(
//           `Rufisque Ouest, rond-point SOCABEG vers cité SIPRES - Sortie 9 autoroute à péage Dakar Sénégal Aut. minist. n° 013545-28/03/19`,
//           15,
//           footerY + 4
//         )
//         doc.text(
//           `Site web : www.bioram.org Tel. +221 78 601 09 09 email : contact@bioram.org`,
//           30,
//           footerY + 8
//         )
//         doc.text(
//           `RC/SN-DKR-2019 B 13431 -NINEA 0073347059 2E2 `,
//           36,
//           footerY + 12
//         )
//       }

//       addFooter()

//       doc.setFontSize(7)
//       doc.setFont('helvetica')
//       doc.text("LABORATOIRE D'ANALYSES MEDICALES", 30, 10)

//       doc.setFontSize(5)
//       doc.setFont('helvetica')
//       doc.text(
//         'Hématologie – Immuno-Hématologie – Biochimie – Immunologie – Bactériologie – Virologie – Parasitologie',
//         10,
//         15
//       )
//       doc.text('24H/24 7J/7', 45, 18)
//       doc.text('Prélèvement à domicile sur rendez-vous', 35, 21)
//       doc.text(
//         'Tel. +221 78 601 09 09 / 33 836 99 98 email : contact@bioram.org',
//         25,
//         24
//       )

//       doc.setFont('helvetica')
//       doc.setTextColor(userColor)

//       doc.setFontSize(12)
//       doc.text('', 52, 30, null, null, 'center')

//       doc.setFillColor(userColor)
//       doc.setLineWidth(0.5)
//       doc.rect(10, 30, 88, 0.5, 'F')
//       doc.setTextColor(0, 0, 0)

//       let currentY = 40
//       doc.setFontSize(7)
//       doc.setFont('helvetica', 'bold')
//       doc.text(`Nº Dossier: ${invoice?.identifiant}`, 25, currentY + 7)
//       doc.text(
//         `Nom: ${invoice.userId.prenom} ${invoice.userId.nom}`,
//         25,
//         currentY + 12
//       )

//       let ageDisplay

//       if (invoice.userId.age) {
//         ageDisplay = invoice.userId.age.toString()
//       } else if (invoice.userId.dateNaissance) {
//         const birthDate = new Date(invoice.userId.dateNaissance)
//         const today = new Date()
//         let age = today.getFullYear() - birthDate.getFullYear()
//         const m = today.getMonth() - birthDate.getMonth()

//         if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//           age--
//         }

//         ageDisplay = age.toString()
//       } else {
//         ageDisplay = 'Non disponible'
//       }

//       doc.text(`Âge: ${ageDisplay} ans`, 25, currentY + 17)
//       doc.text(`Tel: ${invoice.userId.telephone}`, 25, currentY + 22)

//       const blob = doc.output('blob')
//       const url = URL.createObjectURL(blob)
//       window.open(url, '_blank')
//       URL.revokeObjectURL(url)
//       console.log(invoice)
//     } catch (error) {
//       console.error('Erreur lors de la génération du PDF:', error)
//       alert('Une erreur est survenue lors de la génération du PDF A5.')
//     }
//   }

//   return (
//     <button className="btn btn-primary" onClick={generateTicketPDF}>
//       <FontAwesomeIcon icon={faFilePdf} /> Générer Ticket
//     </button>
//   )
// }

// GenerateTicketButton.propTypes = {
//   invoice: PropTypes.object.isRequired,
// }

// export default GenerateTicketButton

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowCircleUp } from '@fortawesome/free-solid-svg-icons' // Import de la nouvelle icône
import jsPDF from 'jspdf'
import PropTypes from 'prop-types'
import logoLeft from '../images/bioramlogo.png'
import logoRight from '../images/logo2.png'

function GenerateTicketButton({ invoice }) {
  const [user, setUser] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    email: '',
    telephone: '',
    devise: '',
    logo: '',
  })

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

  const generateTicketPDF = async () => {
    // Taille personnalisée pour un ticket (largeur x hauteur en mm)
    const doc = new jsPDF('portrait', 'mm', [125, 105]) // A5 size
    const userColor = getColorValue(user.couleur)

    const loadImage = src => new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })

    try {
      const [imgLeft] = await Promise.all([loadImage(logoLeft)])

      const maxWidth = 10
      const leftHeight = maxWidth * (imgLeft.height / imgLeft.width)

      doc.addImage(imgLeft, 'PNG', 5, 5, maxWidth, leftHeight)

      const addFooter = () => {
        const footerY = 100
        doc.setFillColor(userColor)
        doc.rect(10, footerY, 88, 0.5, 'F')
        doc.setFontSize(4)
        doc.setTextColor(0, 0, 0)
        doc.text(
          `Rufisque Ouest, rond-point SOCABEG vers cité SIPRES - Sortie 9 autoroute à péage Dakar Sénégal Aut. minist. n° 013545-28/03/19`,
          15,
          footerY + 4
        )
        doc.text(
          `Site web : www.bioram.org Tel. +221 78 601 09 09 email : contact@bioram.org`,
          30,
          footerY + 8
        )
        doc.text(
          `RC/SN-DKR-2019 B 13431 -NINEA 0073347059 2E2 `,
          36,
          footerY + 12
        )
      }

      addFooter()

      doc.setFontSize(7)
      doc.setFont('helvetica')
      doc.text("LABORATOIRE D'ANALYSES MEDICALES", 30, 10)

      doc.setFontSize(5)
      doc.setFont('helvetica')
      doc.text(
        'Hématologie – Immuno-Hématologie – Biochimie – Immunologie – Bactériologie – Virologie – Parasitologie',
        10,
        15
      )
      doc.text('24H/24 7J/7', 45, 18)
      doc.text('Prélèvement à domicile sur rendez-vous', 35, 21)
      doc.text(
        'Tel. +221 78 601 09 09 / 33 836 99 98 email : contact@bioram.org',
        25,
        24
      )

      doc.setFont('helvetica')
      doc.setTextColor(userColor)

      doc.setFontSize(12)
      doc.text('', 52, 30, null, null, 'center')

      doc.setFillColor(userColor)
      doc.setLineWidth(0.5)
      doc.rect(10, 30, 88, 0.5, 'F')
      doc.setTextColor(0, 0, 0)

      let currentY = 40
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(128, 128, 128) // Gris
      doc.text(`Nº Dossier: ${invoice?.identifiant}`, 49, currentY, null, null, 'center')
      doc.setTextColor(0, 0, 0) // Retour au noir pour le reste du texte
      
      doc.setFontSize(7)
      doc.setFont('helvetica', 'bold')
      doc.text(
        `Nom: ${invoice.userId.prenom.toUpperCase()} ${invoice.userId.nom.toUpperCase()}`,
        25,
        currentY + 5
      )
      
      let ageDisplay

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
      } else {
        ageDisplay = 'Non disponible'
      }

      doc.text(`Âge: ${ageDisplay} ans`, 25, currentY + 10)
      doc.text(`Tel: ${invoice.userId.telephone}`, 25, currentY + 15)

      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.text(`Paramètres:`, 25, currentY + 20)
      
      doc.setFont('helvetica', 'normal')
      currentY += 25

      invoice.tests.forEach(test => {
        const lines = doc.splitTextToSize(test.nom, 70) // Split the text to fit within 70mm
        lines.forEach(line => {
          doc.text(line, 25, currentY)
          currentY += 4
        })
      })

      const blob = doc.output('blob')
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      URL.revokeObjectURL(url)
      console.log(invoice)
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      alert('Une erreur est survenue lors de la génération du PDF A5.')
    }
  }

  return (
    
      <FontAwesomeIcon icon={faArrowCircleUp} onClick={generateTicketPDF}/> 
   
  )
}

GenerateTicketButton.propTypes = {
  invoice: PropTypes.object.isRequired,
}

export default GenerateTicketButton
