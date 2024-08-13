// import { useState, useEffect } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faArrowCircleUp } from '@fortawesome/free-solid-svg-icons'; // Import de la nouvelle icône
// import jsPDF from 'jspdf';
// import PropTypes from 'prop-types';
// import logoLeft from '../images/bioramlogo.png';
// import logoRight from '../images/logo2.png';
// import JsBarcode from 'jsbarcode';

// function GenerateTicketButton({ invoice }) {
//   const [user, setUser] = useState({
//     nom: '',
//     prenom: '',
//     adresse: '',
//     email: '',
//     telephone: '',
//     devise: '',
//     logo: '',
//   });

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       const apiUrl = import.meta.env.VITE_APP_API_BASE_URL;
//       const userInfo = JSON.parse(localStorage.getItem('userInfo'));
//       const token = userInfo?.token;

//       try {
//         const response = await fetch(`${apiUrl}/api/user/profile`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error('Failed to fetch user profile');
//         }

//         const data = await response.json();
//         console.log(data);
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
//         });
//       } catch (error) {
//         console.error('Erreur lors de la récupération du profil:', error);
//       }
//     };

//     fetchUserProfile();
//   }, []);

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
//     };

//     return colorMap[colorName.toLowerCase()] || '#000000';
//   };

//   const generateBarcode = (text) => {
//     const canvas = document.createElement('canvas');
//     JsBarcode(canvas, text, { format: 'CODE128' });
//     return canvas.toDataURL('image/png');
//   };

//   const generateTicketPDF = async () => {
//     const doc = new jsPDF('portrait', 'mm', 'a4'); // A4 size
//     const userColor = getColorValue(user.couleur);

//     const loadImage = src => new Promise((resolve, reject) => {
//       const img = new Image();
//       img.onload = () => resolve(img);
//       img.onerror = reject;
//       img.src = src;
//     });

//     try {
//       const [imgLeft] = await Promise.all([loadImage(logoLeft)]);

//       const maxWidth = 10;
//       const leftHeight = maxWidth * (imgLeft.height / imgLeft.width);

//       // addFooter()
//       const stickerWidth = 38;
//       const stickerHeight = 21.1;
//       const stickersPerRow = 5;
//       const stickersPerColumn = 3; // Only the first 3 lines
//       const pageWidth = 210; // A4 width is 210mm
//       const pageHeight = 297; // A4 height is 297mm
//       const margin = 10; // 1 cm margin on each side
//       const horizontalMargin = (pageWidth - (2 * margin) - (stickersPerRow * stickerWidth)) / (stickersPerRow - 1);
//       const verticalMargin = (pageHeight - (2 * margin) - (12 * stickerHeight)) / (12 - 1);

//       for (let row = 0; row < stickersPerColumn; row++) {
//         let ageDisplay;
//         if (invoice.userId.age) {
//           ageDisplay = invoice.userId.age.toString();
//         } else if (invoice.userId.dateNaissance) {
//           const birthDate = new Date(invoice.userId.dateNaissance);
//           const today = new Date();
//           let age = today.getFullYear() - birthDate.getFullYear();
//           const m = today.getMonth() - birthDate.getMonth();

//           if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//             age--;
//           }

//           ageDisplay = age.toString();
//         } else {
//           ageDisplay = 'Non disponible';
//         }

//         for (let col = 0; col < stickersPerRow; col++) {
//           const x = margin + col * (stickerWidth + horizontalMargin);
//           const y = margin + row * (stickerHeight + verticalMargin);

//           doc.setDrawColor(0);
//           doc.rect(x, y, stickerWidth, stickerHeight);

//           const centerX = x + stickerWidth / 2;

//           doc.setFontSize(6);
//           doc.setTextColor(0, 0, 0);
//           doc.text(`LABM BIORAM`, centerX, y + 5, null, null, 'center');
//           doc.text(`Tél: +221 78 601 09 09 / 33 836 99 98`, centerX, y + 11, null, null, 'center');
//           doc.text(`Email:  contact@bioram.org`, centerX, y + 8, null, null, 'center');

//           doc.text(`N° Dossier: ${invoice.identifiant}`, centerX, y + 15, null, null, 'center');
//           doc.text(`Nom: ${invoice.userId.nom.toUpperCase()}`, centerX, y + 17, null, null, 'center');
//           doc.text(`Prenom: ${invoice.userId.prenom.toUpperCase()}`, centerX, y + 19, null, null, 'center');
//           // doc.text(`Sexe: ${invoice.userId.sexe}, Âge: ${ageDisplay} ans`, centerX, y + 21, null, null, 'center');

//           const barcodeData = generateBarcode(`${invoice.userId.nom} ${invoice.userId.prenom} ${invoice.identifiant} ${invoice.userId.age} ${invoice.userId.sexe}`);
//           // doc.addImage(barcodeData, 'PNG', x + 5, y + 16, 25, 5); // Position adjusted to fit barcode
//         }
//       }

//       const currentY = margin + 3 * (stickerHeight + verticalMargin) + 5; // Position juste après les autocollants

//       // Ticket Content (original code)
//       doc.setFont('helvetica');
//       doc.setTextColor(userColor);

//       doc.setFontSize(12);
//       doc.text('', 52, currentY + 20, null, null, 'center');

//       doc.setFillColor(userColor);

//       let newY = currentY + 2;
//       doc.setFontSize(12);
//       doc.setFont('helvetica', 'bold');
//       doc.setTextColor(128, 128, 128); // Gris
//       doc.text(`Nº Dossier: ${invoice?.identifiant}`, 18, newY, null, null, 'center');
//       doc.setTextColor(0, 0, 0); // Retour au noir pour le reste du texte

//       doc.setFontSize(9);
//       doc.setFont('helvetica', 'bold');
//       doc.text(
//         `Nom: ${invoice.userId.prenom.toUpperCase()} ${invoice.userId.nom.toUpperCase()}`,
//         5,
//         newY + 5
//       );

//       let ageDisplay;
//       if (invoice.userId.age) {
//         ageDisplay = invoice.userId.age.toString();
//       } else if (invoice.userId.dateNaissance) {
//         const birthDate = new Date(invoice.userId.dateNaissance);
//         const today = new Date();
//         let age = today.getFullYear() - birthDate.getFullYear();
//         const m = today.getMonth() - birthDate.getMonth();

//         if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//           age--;
//         }

//         ageDisplay = age.toString();
//       } else {
//         ageDisplay = 'Non disponible';
//       }

//       doc.text(`Âge: ${ageDisplay} ans`, 5, newY + 10);
//       doc.text(`sexe: ${invoice.userId.sexe}`, 5, newY + 15);
//       doc.text(`Tel: ${invoice.userId.telephone}`, 5, newY + 20);

//       doc.setFontSize(9);
//       doc.setFont('helvetica', 'bold');
//       doc.text(`Paramètres:`, 5, newY + 25);

//       doc.setFont('helvetica', 'normal');
//       newY += 30;

//       invoice.tests.forEach(test => {
//         const lines = doc.splitTextToSize(test.nom, 70); // Split the text to fit within 70mm
//         lines.forEach(line => {
//           doc.text(line, 5, newY);
//           newY += 4;
//         });
//       });

//       const blob = doc.output('blob');
//       const url = URL.createObjectURL(blob);
//       window.open(url, '_blank');
//       URL.revokeObjectURL(url);
//       console.log(invoice);
//     } catch (error) {
//       console.error('Erreur lors de la génération du PDF:', error);
//       alert('Une erreur est survenue lors de la génération du PDF A4.');
//     }
//   };

//   return (
//     <FontAwesomeIcon icon={faArrowCircleUp} onClick={generateTicketPDF} />
//   );
// }

// GenerateTicketButton.propTypes = {
//   invoice: PropTypes.object.isRequired,
// };

// export default GenerateTicketButton;

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowCircleUp } from '@fortawesome/free-solid-svg-icons' // Import de la nouvelle icône
import jsPDF from 'jspdf'
import PropTypes from 'prop-types'
import logoLeft from '../images/bioramlogo.png'
import logoRight from '../images/logo2.png'
import JsBarcode from 'jsbarcode'

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

  const generateBarcode = (text) => {
    const canvas = document.createElement('canvas')
    JsBarcode(canvas, text, { format: 'CODE128' })
    return canvas.toDataURL('image/png')
  }

  const generateTicketPDF = async () => {
    const doc = new jsPDF('portrait', 'mm', 'a4') // A4 size
    const userColor = getColorValue(user.couleur)

    const loadImage = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = reject
        img.src = src
      })

    try {
      const [imgLeft] = await Promise.all([loadImage(logoLeft)])

      const maxWidth = 10
      const leftHeight = maxWidth * (imgLeft.height / imgLeft.width)

      // Add stickers
      const stickerWidth = 38
      const stickerHeight = 21.1
      const stickersPerRow = 5
      const stickersPerColumn = 3 // Only the first 3 lines
      const pageWidth = 210 // A4 width is 210mm
      const pageHeight = 297 // A4 height is 297mm
      const margin = 10 // 1 cm margin on each side
      const horizontalMargin =
        (pageWidth - 2 * margin - stickersPerRow * stickerWidth) /
        (stickersPerRow - 1)
      const verticalMargin =
        (pageHeight - 2 * margin - 12 * stickerHeight) / (12 - 1)

      for (let row = 0; row < stickersPerColumn; row++) {
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

        for (let col = 0; col < stickersPerRow; col++) {
          const x = margin + col * (stickerWidth + horizontalMargin)
          const y = margin + row * (stickerHeight + verticalMargin)

          doc.setDrawColor(0)
          doc.rect(x, y, stickerWidth, stickerHeight)

          doc.setFontSize(6)
          doc.setTextColor(0, 0, 0)
          doc.text(`LABM BIORAM`, x + 2, y + 5) // Align text to the left
          doc.text(`Tél: +221 78 601 09 09 / 33 836 99 98`, x + 2, y + 11) // Align text to the left
          doc.text(`Email: contact@bioram.org`, x + 2, y + 8) // Align text to the left

          doc.setFont('helvetica', 'bold')
          doc.text(`N° Dossier: ${invoice.identifiant}`, x + 2, y + 16) // Align text to the left
          doc.text(`Nom: ${invoice.userId.nom.toUpperCase()}`, x + 2, y + 20) // Align text to the left
          doc.text(
            `Prenom: ${invoice.userId.prenom.toUpperCase()}`,
            x + 2,
            y + 18
          ) // Align text to the left
          doc.setFont('helvetica', 'normal')

          const barcodeData = generateBarcode(
            `${invoice.userId.nom} ${invoice.userId.prenom} ${invoice.identifiant} ${invoice.userId.age} ${invoice.userId.sexe}`
          )
          // doc.addImage(barcodeData, 'PNG', x + 5, y + 16, 25, 5); // Position adjusted to fit barcode
        }
      }

      const currentY = margin + 3 * (stickerHeight + verticalMargin) + 5 // Position juste après les autocollants

      // Ticket Content (original code)
      doc.setFont('helvetica')
      doc.setTextColor(userColor)

      doc.setFontSize(12)
      doc.text('', 52, currentY + 20)

      doc.setFillColor(userColor)

      let newY = currentY + 2
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(128, 128, 128) // Gris
      doc.text(`Nº Dossier: ${invoice?.identifiant}`, 5, newY)
      doc.setTextColor(0, 0, 0) // Retour au noir pour le reste du texte

      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(
        `Nom: ${invoice.userId.prenom.toUpperCase()} ${invoice.userId.nom.toUpperCase()}`,
        5,
        newY + 5
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

      doc.text(`Âge: ${ageDisplay} ans`, 5, newY + 10)
      doc.text(`sexe: ${invoice.userId.sexe}`, 5, newY + 15)
      doc.text(`Tel: ${invoice.userId.telephone}`, 5, newY + 20)

      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(`Paramètres:`, 5, newY + 25)

      doc.setFont('helvetica', 'normal')
      newY += 30

      invoice.tests.forEach((test) => {
        const lines = doc.splitTextToSize(test.nom, 70) // Split the text to fit within 70mm
        lines.forEach((line) => {
          doc.text(line, 5, newY)
          newY += 4
        })
      })

      const blob = doc.output('blob')
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      URL.revokeObjectURL(url)
      console.log(invoice)
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      alert('Une erreur est survenue lors de la génération du PDF A4.')
    }
  }

  return <FontAwesomeIcon icon={faArrowCircleUp} onClick={generateTicketPDF} />
}

GenerateTicketButton.propTypes = {
  invoice: PropTypes.object.isRequired,
}

export default GenerateTicketButton
