import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilePdf } from '@fortawesome/free-solid-svg-icons'
import jsPDF from 'jspdf'
import PropTypes from 'prop-types'
import logoLeft from '../images/bioramlogo.png'

const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

const getMonthName = (n) => {
  const m = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
  return m[n - 1] || ''
}
const fmtNumber = (n) => {
  const v = Math.round(Number(n) || 0)
  return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
const fmtCFA = (n) => fmtNumber(n) + ' CFA'
// Formatteur date ASCII pur (jsPDF ne rend pas correctement certains
// caracteres Unicode comme les espaces insecables fines).
const fmtDate = (d) => {
  if (!d) return '-'
  const dt = new Date(d)
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const yyyy = dt.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

const numberToWords = (num) => {
  const belowTwenty = ['zéro','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize','dix-sept','dix-huit','dix-neuf']
  const tens = ['','','vingt','trente','quarante','cinquante','soixante','soixante-dix','quatre-vingt','quatre-vingt-dix']
  if (num < 20) return belowTwenty[num]
  if (num < 100) {
    const unit = num % 10
    const ten = Math.floor(num / 10)
    if (unit === 1 && (ten === 7 || ten === 9)) return tens[ten] + '-et-' + belowTwenty[unit]
    return tens[ten] + (unit ? '-' + belowTwenty[unit] : '')
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100)
    const remainder = num % 100
    if (hundred === 1) return 'cent' + (remainder ? ' ' + numberToWords(remainder) : '')
    return belowTwenty[hundred] + ' cent' + (remainder ? ' ' + numberToWords(remainder) : '')
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000)
    const remainder = num % 1000
    if (thousand === 1) return 'mille' + (remainder ? ' ' + numberToWords(remainder) : '')
    return numberToWords(thousand) + ' mille' + (remainder ? ' ' + numberToWords(remainder) : '')
  }
  return num.toString()
}

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

/**
 * PDF d'une demande de paiement adressee a un partenaire.
 * Template proche de la facture standard avec en-tete et pied de page
 * identiques. Centre : tableau des analyses incluses dans la demande.
 */
function GenerateDemandePayementPDF({ demandeId }) {
  const generatePDF = async () => {
    try {
      // Fetch detail demande (avec etiquettes + analyses + users)
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(
        `${apiUrl}/api/demande-payement/${demandeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await response.json()
      if (!data.success) {
        alert('Impossible de récupérer les détails de la demande.')
        return
      }
      const demande = data.data

      const doc = new jsPDF()
      const userColor = '#808080'
      const imgLeft = await loadImage(logoLeft)
      const maxWidth = 30
      const leftHeight = maxWidth * (imgLeft.height / imgLeft.width)
      doc.addImage(imgLeft, 'PNG', 20, 5, maxWidth, leftHeight)

      const addFooter = () => {
        const footerY = 277
        doc.setFillColor(userColor)
        doc.rect(20, footerY, 170, 0.5, 'F')
        doc.setFontSize(6)
        doc.setTextColor(0, 0, 0)
        doc.text(
          `Rufisque Ouest, rond-point SOCABEG vers cité SIPRES - Sortie 9 autoroute à péage Dakar Sénégal Aut. minist. n° 013545-28/03/19`,
          40, footerY + 6
        )
        doc.text(
          `Site web : www.bioram.org Tel. 78 601 09 09 email : contact@bioram.org`,
          60, footerY + 10
        )
        doc.text(`RC/SN-DKR-2019 B 13431 -NINEA 0073347059 2E2`, 80, footerY + 14)
      }
      addFooter()

      doc.setFontSize(12).setFont('helvetica')
      doc.text("LABORATOIRE D'ANALYSES MEDICALES", 65, 10)
      doc.setFontSize(7)
      doc.text('Hématologie – Immuno-Hématologie – Biochimie – Immunologie – Bactériologie – Virologie – Parasitologie', 52, 15)
      doc.text('24H/24 7J/7', 98, 18)
      doc.text('Prélèvement à domicile sur rendez-vous', 85, 21)
      doc.text('Tel. 78 601 09 09 / 33 836 99 98 email : contact@bioram.org', 75, 24)

      doc.setFillColor(userColor).setLineWidth(0.5)
      doc.rect(20, 40, 170, 0.5, 'F')

      // Titre + meta
      let currentY = 50
      doc.setFontSize(12).setFont('helvetica', 'bold').setTextColor(0, 0, 0)
      doc.text('DEMANDE DE PAIEMENT', 80, currentY - 3)

      doc.setFontSize(10).setFont('helvetica', 'normal')
      doc.text(`PARTENAIRE : ${demande.partenaireId?.nom || ''}`, 20, currentY + 2)
      doc.setFontSize(8)
      doc.text(`Référence : ${demande.reference || '-'}`, 20, currentY + 7)
      doc.text(
        `Période : du ${fmtDate(demande.dateDebut)} au ${fmtDate(demande.dateFin)}`,
        20, currentY + 12
      )
      doc.text(`Nombre de factures : ${demande.nombreFactures}`, 20, currentY + 17)
      doc.text(
        `Statut : ${demande.statusPayement}${demande.datePayement ? ' le ' + fmtDate(demande.datePayement) : ''}`,
        20, currentY + 22
      )
      doc.text(`Date d'édition : ${fmtDate(new Date())}`, 170, currentY + 7)

      currentY += 32

      // Tableau entete
      doc.setFillColor(userColor).rect(20, currentY, 170, 7, 'F')
      doc.setTextColor(255, 255, 255).setFontSize(9).setFont('helvetica', 'bold')
      doc.text('Date', 25, currentY + 5)
      doc.text('N° Dossier', 55, currentY + 5)
      doc.text('Patient', 95, currentY + 5)
      doc.text('Couverture', 140, currentY + 5)
      doc.text('Somme', 185, currentY + 5, { align: 'right' })
      currentY += 11

      doc.setTextColor(0, 0, 0).setFont('helvetica', 'normal').setFontSize(8)
      ;(demande.etiquettes || []).forEach((e) => {
        if (currentY > 250) {
          doc.addPage()
          addFooter()
          currentY = 30
        }
        const a = e.analyseId
        const patient = a?.userId
          ? `${a.userId.nom || ''} ${a.userId.prenom || ''}`.trim()
          : '-'
        const couv = a?.pourcentageCouverture
        doc.text(fmtDate(e.createdAt), 25, currentY)
        doc.text(String(a?.identifiant || '-'), 55, currentY)
        doc.text(patient.substring(0, 30), 95, currentY)
        doc.text(couv !== undefined && couv !== null ? `${couv}%` : '-', 140, currentY)
        doc.text(fmtCFA(e.sommeAPayer), 185, currentY, { align: 'right' })
        currentY += 7
      })

      // Ligne separation totale
      currentY += 3
      doc.setLineWidth(0.5).line(20, currentY, 190, currentY)
      currentY += 8

      // Total
      const total = Number(demande.sommeTotale) || 0
      doc.setFont('helvetica', 'bold').setFontSize(12)
      doc.text('TOTAL A PAYER', 25, currentY)
      doc.text(fmtCFA(total), 185, currentY, { align: 'right' })

      currentY += 12
      doc.setFont('helvetica', 'normal').setFontSize(10)
      doc.text(
        `Arrêtée à la somme de : ${numberToWords(total)} francs CFA`,
        20, currentY
      )

      // Pagination
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(9).setTextColor(0, 0, 0)
        doc.text(`${i}/${pageCount}`, 185, 275, { align: 'center' })
      }

      const blob = doc.output('blob')
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Erreur génération PDF demande :', e)
      alert("Erreur lors de la génération du PDF.")
    }
  }

  return (
    <FontAwesomeIcon
      icon={faFilePdf}
      onClick={generatePDF}
      title="Imprimer la demande de paiement"
      style={{ cursor: 'pointer' }}
    />
  )
}

GenerateDemandePayementPDF.propTypes = {
  demandeId: PropTypes.string.isRequired,
}

export default GenerateDemandePayementPDF
