
// import React, { useState, useRef } from 'react'
// import QRCode from 'qrcode.react'
// import PropTypes from 'prop-types'

// function GenerateBarcodeButton({ nip, nom, prenom, identifiant, test }) {
//   const [showBarcode, setShowBarcode] = useState(false)
//   const barcodeRef = useRef(null)

//   const handleToggleBarcode = () => {
//     setShowBarcode(!showBarcode)
//   }

//   const handleDownloadBarcode = () => {
//     const canvas = barcodeRef.current.querySelector('canvas')
//     const image = canvas.toDataURL('image/png') // Utilisation de PNG pour éviter toute compression
//     const link = document.createElement('a')
//     link.download = `QRCode_${identifiant}${test}.png`
//     link.href = image
//     link.click()
//   }

//   return (
//     <div>
//       <button className="btn btn-primary" onClick={handleToggleBarcode}>
//         {showBarcode ? 'Masquer le QR Code' : 'Afficher le QR Code'}
//       </button>
//       {showBarcode && (
//         <div ref={barcodeRef}>
//           <QRCode
//             value={`NIP:${nip}|Nom:${nom}|Prénom:${prenom}|ID:${identifiant}|Test:${test}`}
//             size={256}
//             level="H" // Niveau de correction d'erreur
//             renderAs="canvas" // Rendre comme canvas pour faciliter le téléchargement
//           />
//           <button className="btn btn-primary" onClick={handleDownloadBarcode}>
//             Télécharger le QR Code
//           </button>
//         </div>
//       )}
//     </div>
//   )
// }

// GenerateBarcodeButton.propTypes = {
//   nip: PropTypes.string.isRequired,
//   nom: PropTypes.string.isRequired,
//   prenom: PropTypes.string.isRequired,
//   identifiant: PropTypes.string.isRequired,
//   test: PropTypes.string.isRequired,
// }

// export default GenerateBarcodeButton
