import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilePdf } from '@fortawesome/free-solid-svg-icons'
import jsPDF from 'jspdf'
import PropTypes from 'prop-types'
import logoLeft from '../images/bioramlogo.png'

const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

const numberToWords = (num) => {
  // Conversion simple chiffre -> lettres (FR). Code identique a
  // celui de GenerateFacturePartenaire.
  const belowTwenty = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
    'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
  const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix']
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

const getMonthName = (n) => {
  const m = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
  return m[n - 1] || ''
}

// Formatteur ASCII des nombres (jsPDF ne rend pas correctement les
// espaces insecables fins produits par toLocaleString('fr-FR')).
const fmtNumber = (n) => {
  const v = Math.round(Number(n) || 0)
  return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
const fmtCFA = (n) => fmtNumber(n) + ' CFA'

/**
 * Facture GLOBALE d'un groupe de partenaires (ex: tous les AXA).
 * Template synthetique : liste des FILIALES (pas des patients) avec
 * leur nombre de factures et leur somme cumulee. Total general en
 * bas. En-tete et pied de page identiques a la facture standard.
 */
function GenerateFactureGroupePartenaire({ group, mois, annee }) {
  // user (devise / etc.) - pas critique ici, on peut laisser des defaults
  const [, setUser] = useState({})

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const token = userInfo?.token
        const response = await fetch(`${apiUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (data.success) setUser(data.data)
      } catch (_) {}
    }
    fetchUser()
  }, [])

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })

  const generatePDF = async () => {
    const doc = new jsPDF()
    const userColor = '#808080'

    function addPageNumbers(doc) {
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(9)
        doc.setTextColor(0, 0, 0)
        doc.text(`${i}/${pageCount}`, 185, 275, { align: 'center' })
      }
    }

    try {
      const imgLeft = await loadImage(logoLeft)
      const maxWidth = 30
      const leftHeight = maxWidth * (imgLeft.height / imgLeft.width)
      doc.addImage(imgLeft, 'PNG', 20, 5, maxWidth, leftHeight)

      // ====== EN-TETE (identique GenerateFacturePartenaire) ======
      const addFooter = () => {
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
          `Site web : www.bioram.org Tel. 78 601 09 09 email : contact@bioram.org`,
          60,
          footerY + 10
        )
        doc.text(`RC/SN-DKR-2019 B 13431 -NINEA 0073347059 2E2`, 80, footerY + 14)
      }
      addFooter()

      doc.setFontSize(12)
      doc.setFont('helvetica')
      doc.text("LABORATOIRE D'ANALYSES MEDICALES", 65, 10)
      doc.setFontSize(7)
      doc.text(
        'Hématologie – Immuno-Hématologie – Biochimie – Immunologie – Bactériologie – Virologie – Parasitologie',
        52,
        15
      )
      doc.text('24H/24 7J/7', 98, 18)
      doc.text('Prélèvement à domicile sur rendez-vous', 85, 21)
      doc.text('Tel. 78 601 09 09 / 33 836 99 98 email : contact@bioram.org', 75, 24)

      doc.setFont('helvetica')
      doc.setTextColor(userColor)
      doc.setFontSize(14)
      doc.text('', 105, 30, null, null, 'center')
      doc.setFillColor(userColor)
      doc.setLineWidth(0.5)
      doc.rect(20, 40, 170, 0.5, 'F')
      doc.setTextColor(0, 0, 0)

      // ====== CORPS : titre + meta ======
      let currentY = 50
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('FACTURE GLOBALE', 85, currentY - 3)

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`GROUPE : ${group.name || ''}`, 20, currentY + 2)

      const reference = `GROUPE-${group.key || group.name}-${mois || ''}${annee || ''}`
      if (mois && annee) {
        doc.setFontSize(8)
        doc.text(`Période : ${getMonthName(parseInt(mois, 10))} ${annee}`, 20, currentY + 7)
        doc.text(`Référence : ${reference}`, 20, currentY + 12)
      }
      doc.setFontSize(8)
      doc.text(
        `Nombre total de factures : ${group.totalCount || 0}`,
        20,
        currentY + 17
      )
      doc.text(
        `Nombre de filiales : ${(group.filiales || []).length}`,
        20,
        currentY + 22
      )
      const today = new Date()
      doc.text(`Date : ${today.toLocaleDateString('fr-FR')}`, 170, currentY + 7)

      currentY += 35

      // ====== TABLEAU : entete colore ======
      doc.setFillColor(userColor)
      doc.rect(20, currentY, 170, 7, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('Filiale', 25, currentY + 5)
      doc.text('Type', 110, currentY + 5)
      doc.text('Nb factures', 140, currentY + 5, { align: 'right' })
      doc.text('Somme totale', 185, currentY + 5, { align: 'right' })
      currentY += 12

      // ====== Lignes filiales ======
      doc.setTextColor(0, 0, 0)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)

      const filiales = group.filiales || []
      filiales.forEach((f) => {
        if (currentY > 250) {
          doc.addPage()
          addFooter()
          currentY = 30
        }
        doc.text(String(f.partenaire || f.nom || '-'), 25, currentY, {
          maxWidth: 80,
        })
        doc.text(String(f.typePartenaire || group.dominantType || '-'), 110, currentY)
        doc.text(String(f.count || 0), 140, currentY, { align: 'right' })
        doc.text(fmtCFA(f.totalSomme), 185, currentY, { align: 'right' })
        currentY += 7
      })

      // Ligne separation totale
      currentY += 3
      doc.setLineWidth(0.5)
      doc.line(20, currentY, 190, currentY)
      currentY += 8

      // ====== Total general ======
      const totalSomme = Number(group.totalSomme) || 0
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text('TOTAL GENERAL', 25, currentY)
      doc.text(fmtCFA(totalSomme), 185, currentY, { align: 'right' })

      currentY += 12
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(10)
      doc.text(
        `Arrêtée à la somme de : ${numberToWords(totalSomme)} francs CFA`,
        20,
        currentY
      )

      addPageNumbers(doc)
      const blob = doc.output('blob')
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors de la génération du PDF groupe:', error)
      alert('Une erreur est survenue lors de la génération du PDF.')
    }
  }

  return (
    <FontAwesomeIcon
      icon={faFilePdf}
      onClick={generatePDF}
      title="Facture globale du groupe"
      style={{ cursor: 'pointer' }}
    />
  )
}

GenerateFactureGroupePartenaire.propTypes = {
  group: PropTypes.shape({
    key: PropTypes.string,
    name: PropTypes.string.isRequired,
    dominantType: PropTypes.string,
    totalSomme: PropTypes.number,
    totalCount: PropTypes.number,
    filiales: PropTypes.array.isRequired,
  }).isRequired,
  mois: PropTypes.string,
  annee: PropTypes.string,
}

export default GenerateFactureGroupePartenaire
