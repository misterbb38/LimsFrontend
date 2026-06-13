

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import jsPDF from 'jspdf'
import PropTypes from 'prop-types'
import logoLeft from '../images/bioramlogo.png'
import logoRight from '../images/logo2.png'

/**
 * Composant pour générer un PDF de résultat d'analyse médicale.
 *
 * Modes d'utilisation :
 *  1. Standard (par defaut) : affiche un bouton, clic = ouvre le PDF dans un onglet.
 *  2. Programmatique : passer une ref, appeler `ref.current.generatePdfBlob()`
 *     pour recuperer un Blob et le partager (WhatsApp, email...).
 *     Utilise par <ShareResultatButton/>. Le bouton reste visible quand meme.
 */
const GenerateResultatButton = forwardRef(function GenerateResultatButton(
  { invoice },
  ref
) {
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

  const formatDateAndTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })

  /**
   * CONSTANTES DE PAGINATION SIMPLES
   */
  const FOOTER_Y = 277
  const MARGIN_BEFORE_FOOTER = 15 // Reduit de 30 a 15 : la marge basse precedente
  // gaspillait ~30mm en bas de chaque page, poussant inutilement le contenu
  // sur des pages suivantes a moitie vides.
  const MAX_CONTENT_Y = FOOTER_Y - MARGIN_BEFORE_FOOTER // 262mm
  const MIN_SPACE = 15 // Espace minimum pour continuer sur la même page
  const MIN_SPACE_FOR_TITLE = 25 // Espace minimum pour un titre + début de contenu (évite les titres orphelins)

  /**
   * Ajoute un header discret sur les nouvelles pages
   */
  const addPageHeader = (doc, invoice, startY = 25) => {
    doc.setFontSize(9)
    doc.setFont('Times', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Nº Dossier: ${invoice?.identifiant}`, 25, startY)
    doc.text(
      `Nom: ${invoice.userId.prenom.toUpperCase()} ${invoice.userId.nom.toUpperCase()}`,
      25,
      startY + 4
    )
    doc.setTextColor(0, 0, 0)
    return startY + 12
  }

  /**
   * Vérifie si on doit créer une nouvelle page
   * Règle simple : si moins de MIN_SPACE, nouvelle page
   */
  const checkNewPage = (doc, currentY, invoice) => {
    if (currentY + MIN_SPACE > MAX_CONTENT_Y) {
      doc.addPage()
      addFooter(doc, getColorValue('gris'))
      currentY = addPageHeader(doc, invoice)
    }
    return currentY
  }

  /**
   * Vérifie avec un espace minimum spécifique
   */
  const checkSpace = (doc, currentY, minSpace, invoice) => {
    if (currentY + minSpace > MAX_CONTENT_Y) {
      doc.addPage()
      addFooter(doc, getColorValue('gris'))
      currentY = addPageHeader(doc, invoice)
    }
    return currentY
  }

  // ============================================================
  // PDF_LAYOUT : SYSTEME UNIFIE DE RENDU DES PARAMETRES
  // ============================================================
  // Toutes les positions X figees ici, partagees par tous les renderers
  // (HGPO, Ionogramme, Gaz du sang, TP/INR, Spermogramme, ...). Cela
  // garantit que la colonne Reference reste alignee verticalement du
  // debut a la fin du PDF, comme dans un vrai compte-rendu de labo.
  const PDF_LAYOUT = {
    LABEL_X: 25,      // Nom du parametre, aligne a gauche
    VALUE_X: 100,     // Valeur centree
    UNIT_X: 135,      // Unite (mg/L, mmol/L, ...) si separee
    REF_X: 155,       // Reference (intervalle ou seuil)
    ROW_H: 5,         // Hauteur d'une ligne standard
  }

  /**
   * Normalise une reference + unite pour l'affichage PDF.
   *
   * Source possibles :
   *  - cell : { reference, unite } (depuis la DB)
   *  - fallback : objet { reference, unite } hardcode (HGPO, etc.)
   *
   * Strategie :
   *  1. Prendre les valeurs DB en priorite
   *  2. Sinon fallback hardcode (refs OMS figees)
   *  3. Concatener "unite" dans la reference si elle n'y est pas
   *     (gere le format "70 mmHg" en une seule colonne Ref)
   *  4. Sanitize les symboles Unicode non supportes par WinAnsi
   *     (>= au lieu de ≥, <= au lieu de ≤)
   *
   * Retourne une string prete a etre affichee, ou '' si aucune ref.
   */
  const getReference = (cell, fallback = {}) => {
    let ref =
      (cell && cell.reference != null && cell.reference !== ''
        ? String(cell.reference)
        : '') || String(fallback.reference || '')
    let unite =
      (cell && cell.unite != null && cell.unite !== ''
        ? String(cell.unite)
        : '') || String(fallback.unite || '')

    // Concatenation unite + ref pour une seule colonne lisible
    let out
    if (unite && ref && !ref.includes(unite)) {
      out = `${ref} ${unite}`
    } else if (!ref && unite) {
      out = unite
    } else {
      out = ref
    }

    // Sanitization Unicode (la sanitization globale du doc.text le couvre
    // deja, mais on le fait ici aussi pour rester robuste si jamais le
    // wrapper est manquant ou si on inspecte la valeur).
    return out.replace(/≥/g, '>=').replace(/≤/g, '<=')
  }

  /**
   * Affiche une ligne de parametre standard : Label | Valeur | Reference.
   * Toutes les positions X sont prises de PDF_LAYOUT pour garantir
   * l'alignement vertical de la colonne Reference sur tout le PDF.
   *
   * - checkNewPage est appele systematiquement AVANT l'affichage,
   *   pour empecher les chevauchements (debordement en fin de page).
   * - La valeur est centree sur VALUE_X.
   * - La reference est alignee a gauche sur REF_X (col commune).
   * - Si valeur ou ref est vide/null/'null', rien n'est affiche pour
   *   cette cellule (mais l'espace vertical est conserve).
   *
   * Retourne la nouvelle position Y apres la ligne.
   */
  const drawParamRow = (doc, currentY, invoice, label, valeur, reference, opts = {}) => {
    const y = checkNewPage(doc, currentY, invoice)

    const safeStr = (v) => {
      if (v === null || v === undefined) return ''
      const s = String(v).trim()
      if (s === '' || s === 'null' || s === 'undefined') return ''
      return s
    }
    const lbl = safeStr(label)
    const val = safeStr(valeur)
    const ref = safeStr(reference)

    doc.setFont('Times', opts.labelBold ? 'bold' : 'normal')
    doc.setFontSize(opts.fontSize || 9)
    if (lbl) doc.text(lbl, PDF_LAYOUT.LABEL_X, y)

    doc.setFont('Times', opts.valueBold ? 'bold' : 'normal')
    if (val) doc.text(val, PDF_LAYOUT.VALUE_X, y, { align: 'center' })

    let nextY = y + PDF_LAYOUT.ROW_H

    if (ref) {
      doc.setFont('Times', 'normal')
      doc.setFontSize(opts.fontSize || 9)
      // Compromis : on tolere des refs jusqu'a ~30 caracteres / 35mm en
      // ligne (couvre la grande majorite des refs labo standards :
      // "N : < 30 mg/g", "0,5 - 1,5 % (...)", "≥ 16 000 000", etc.).
      // Seules les refs vraiment longues (Toxoplasmose qualitatif) sont
      // basculees sur la ligne suivante en italique pour ne pas masquer
      // la zone Antériorités quand elle est presente.
      const refWidth = doc.getTextWidth(ref)
      const tooWideByWidth = refWidth > 35
      const tooWideByChars = ref.length > 30
      const isLongRef = tooWideByWidth || tooWideByChars
      if (!isLongRef) {
        doc.text(ref, PDF_LAYOUT.REF_X, y)
      } else {
        // Reference trop longue : on la rejette sur la ligne suivante en
        // italique 8pt sur toute la largeur 170mm pour ne pas chevaucher
        // la zone Antériorités a droite. Le saut de ligne reste discret.
        doc.setFontSize(9)
        doc.setFont('Times', 'italic')
        const wrapped = doc.splitTextToSize(ref, 165)
        nextY = checkNewPage(doc, nextY, invoice)
        doc.text(wrapped, PDF_LAYOUT.LABEL_X + 5, nextY)
        nextY += wrapped.length * 4 + 1
        doc.setFontSize(opts.fontSize || 9)
        doc.setFont('Times', 'normal')
      }
    }

    return nextY
  }

  // const printHematiesLine = (doc, posY, label, value, unit, ref) => {
  //   doc.text(label, 25, posY)
  //   doc.text(value, 85, posY)
  //   if (unit) doc.text(unit, 100, posY)
  //   if (ref) doc.text(ref, 120, posY)
  //   return posY + 5
  // }

  // const printLeucocytesLine = (doc, posY, label, pctValue, mainValue, unit, reference) => {
  //   doc.text(label, 25, posY)
  //   if (pctValue) doc.text(`${pctValue}%`, 70, posY)
  //   doc.text(mainValue, 85, posY)
  //   if (unit) doc.text(unit, 100, posY)
  //   if (reference) doc.text(reference, 120, posY)
  //   return posY + 5
  // }

  const printHematiesLine = (doc, posY, label, value, unit, ref) => {
  doc.text(label, 25, posY)
  doc.text(String(value || ''), 85, posY) // ✅ Convertir en string
  if (unit) doc.text(String(unit), 100, posY) // ✅ Convertir en string
  if (ref) doc.text(String(ref), 120, posY) // ✅ Convertir en string
  return posY + 5
}

const printLeucocytesLine = (doc, posY, label, pctValue, mainValue, unit, reference) => {
  doc.text(label, 25, posY)
  if (pctValue) doc.text(`${pctValue}%`, 70, posY) // ✅ Déjà en string via template
  doc.text(String(mainValue || ''), 85, posY) // ✅ Convertir en string
  if (unit) doc.text(String(unit), 100, posY) // ✅ Convertir en string
  if (reference) doc.text(String(reference), 120, posY) // ✅ Convertir en string
  return posY + 5
}

  const hasHematiesValues = (hematies) => {
    if (!hematies) return false
    const { gr, hgb, hct, vgm, tcmh, ccmh, idr_cv } = hematies
    return gr?.valeur || hgb?.valeur || hct?.valeur || vgm?.valeur || 
           tcmh?.valeur || ccmh?.valeur || idr_cv?.valeur
  }

  const hasLeucocytesValues = (leuco) => {
    if (!leuco) return false
    // Types standards
    const hasStandard =
      leuco.gb?.valeur || leuco.neut?.valeur || leuco.neut?.pourcentage ||
      leuco.lymph?.valeur || leuco.lymph?.pourcentage || leuco.mono?.valeur ||
      leuco.mono?.pourcentage || leuco.eo?.valeur || leuco.eo?.pourcentage ||
      leuco.baso?.valeur || leuco.baso?.pourcentage || leuco.plt?.valeur
    // Blastes / cellules immatures
    const blastKeys = [
      'proerythroblastes', 'erythroblastes', 'myeloblastes', 'promyelocytes',
      'myelocytes', 'metamyelocytes', 'monoblastes', 'lymphoblastes',
    ]
    const hasBlasts = blastKeys.some(
      (k) => leuco[k]?.valeur || leuco[k]?.pourcentage
    )
    return hasStandard || hasBlasts
  }

  const addFooter = (doc, userColor) => {
    const footerY = 277
    doc.setFillColor(userColor)
    doc.rect(20, footerY, 170, 0.5, 'F')
    doc.setFontSize(7)
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
    doc.text(`RC/SN-DKR-2019 B 13431 -NINEA 0073347059 2E2 `, 80, footerY + 14)
  }

  const addPageNumbers = (doc) => {
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(10)
      doc.setTextColor(0, 0, 0)
      doc.text(` ${i}/${pageCount}`, 185, 275, { align: 'center' })
    }
  }

  const setupDocumentHeader = async (doc, imgLeft, userColor) => {
    const maxWidth = 30
    const leftHeight = maxWidth * (imgLeft.height / imgLeft.width)
    doc.addImage(imgLeft, 'PNG', 20, 5, maxWidth, leftHeight)

    doc.setFontSize(13)
    doc.setFont('Times')
    doc.text("LABORATOIRE D'ANALYSES MEDICALES", 65, 10)

    doc.setFontSize(8)
    doc.text(
      'Hématologie – Immuno-Hématologie – Biochimie – Immunologie – Bactériologie – Virologie – Parasitologie',
      52,
      15
    )
    doc.text('24H/24 7J/7', 98, 18)
    doc.text('Prélèvement à domicile sur rendez-vous', 85, 21)
    doc.text(
      'Tel. 78 601 09 09 / 33 836 99 98 email : contact@bioram.org',
      75,
      24
    )

    doc.setFont('Times')
    doc.setTextColor(userColor)
    doc.setFontSize(15)
    doc.text('', 105, 30, null, null, 'center')
    doc.setFillColor(userColor)
    doc.setLineWidth(0.5)
    doc.rect(20, 40, 170, 0.5, 'F')
    doc.setTextColor(0, 0, 0)

    addFooter(doc, userColor)
  }

  const addPatientInformation = (doc, invoice) => {
    const currentY = 40
    doc.setFontSize(11)
    doc.setFont('Times', 'bold')

    doc.text(`Nº Dossier: ${invoice?.identifiant}`, 135, currentY + 7)
    doc.text(
      `Nom: ${invoice.userId.prenom.toUpperCase()} ${invoice.userId.nom.toUpperCase()}`,
      135,
      currentY + 12
    )

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
    doc.text(`NIP: ${invoice?.userId.nip}`, 35, currentY + 7)
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(11)
    doc.setFont('Times')

    const formattedDate = formatDate(invoice?.createdAt)
    doc.setFont('Times')
    doc.text('Date: ', 35, currentY + 12)
    const dateLabelWidth = doc.getTextWidth('Date: ')
    doc.setFont('Times', 'bold')
    doc.text(formattedDate, 35 + dateLabelWidth, currentY + 12)
    doc.setFont('Times', 'normal')
  }

  const renderMachineInfo = (doc, test, currentY) => {
    doc.setFontSize(9)
    doc.setFont('Times', 'italic')

    let machineText = test?.statutMachine
      ? test?.testId?.machineA
      : test?.testId?.machineB

    if (machineText) {
      doc.text(`${machineText}`, 20, currentY)
    }

    if (test?.methode) {
      const machineTextWidth = machineText ? doc.getTextWidth(machineText) + 5 : 0
      doc.text(`(${test.methode})`, 20 + machineTextWidth, currentY)
    }

    let machineValue = test.statutMachine
      ? test.testId.valeurMachineA
      : test.testId.valeurMachineB
    
    if (machineValue) {
      doc.setFont('Times', 'normal')
      doc.text(`Réf: ${machineValue}`, 120, currentY)
    }
  }

  /**
   * Fonction principale de rendu d'un test - VERSION AMÉLIORÉE
   */
  const renderTest = async (doc, test, currentY, invoice) => {
    // Vérifier qu'on a assez d'espace pour le titre ET le début du contenu (évite les titres orphelins)
    currentY = checkSpace(doc, currentY, MIN_SPACE_FOR_TITLE, invoice)

    // Rendu du titre
    const maxLineWidth = 100
    let nomTestLines = doc.splitTextToSize(`${test.testId.nom.toUpperCase()}`, maxLineWidth)

    doc.setFontSize(10)
    doc.setFont('Courier', 'normal')
    doc.setFontSize(9)
    doc.setFont('Times', 'bold')

    doc.setFillColor(0, 0, 0)
    doc.circle(18, currentY - 1, 1, 'F')

    if (test?.observations && test?.observations?.macroscopique?.length > 0) {
      doc.setFontSize(10)
      doc.setFont('Times', 'bold')
      doc.text(nomTestLines, 60, currentY)
    } else {
      doc.setFontSize(10)
      doc.text(nomTestLines, 20, currentY)
    }

    currentY += 5 * nomTestLines.length
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)

    const formattedDate = formatDateAndTime(test?.datePrelevement)
    const formattedDateAnterieur = formatDateAndTime(test?.dernierResultatAnterieur?.date)

    doc.setFont('Times', 'bold')
    doc.setFontSize(9)

    let anterioriteHeight = 0

    // Antériorités (colonne droite, alignee au bord droit pour eviter
    // le chevauchement avec la colonne Reference (PDF_LAYOUT.REF_X = 155)
    // qui peut contenir des textes longs type "Réf: Négative : < 2
    // Douteuse : 2 - 2,6 Positive : >= 2,6 AU/mL"). On ancre le bloc
    // a x=190 (bord droit du contenu) avec align: 'right'.
    if (test?.observations?.macroscopique?.length === 0 && test?.dernierResultatAnterieur) {
      const valeurAnterieure = test.dernierResultatAnterieur.valeur ?? ''
      const dateAnterieure = formattedDateAnterieur ?? ''

      doc.text('Antériorités', 190, currentY, { align: 'right' })
      doc.text(String(valeurAnterieure), 190, currentY + 5, { align: 'right' })
      doc.text(String(dateAnterieure), 190, currentY + 10, { align: 'right' })

      anterioriteHeight = 15
    }

    // Contenu principal du test (si pas d'observations macroscopiques)
    if (test?.observations?.macroscopique?.length === 0) {
      if (test?.typePrelevement) {
        doc.setFontSize(9)
        doc.setFont('Times', 'normal')
        doc.text(
          `Prélèvement : ${formattedDate}, ${test?.typePrelevement}`,
          20,
          currentY
        )
        currentY += 5
      }

      renderMachineInfo(doc, test, currentY)
      currentY += 2

      doc.setFont('Times', 'bold')
      doc.setFontSize(11)
      doc.text(`${test?.valeur || ''}`, 90, currentY)

      if (test?.qualitatif) {
        currentY += 5
        doc.text(`(${test?.qualitatif})`, 86, currentY)
      }

      currentY = Math.max(currentY + 5, anterioriteHeight > 0 ? currentY + anterioriteHeight - 10 : currentY)

      // Exceptions
      if (test?.exceptions) {
        currentY = renderExceptions(doc, test, currentY, invoice)
      }

      // Commentaires
      if (test?.remarque) {
        currentY = checkNewPage(doc, currentY, invoice)
        doc.setFontSize(9)
        doc.setFont('Times', 'italic')
        const remarqueLines = doc.splitTextToSize(`Commentaires: ${test.remarque}`, 170)
        doc.text(remarqueLines, 20, currentY)
        currentY += remarqueLines.length * 5
      }

      // ✅ CORRECTION CRITIQUE : Interprétation UNIQUEMENT ici
      if (test.statutInterpretation) {
        console.log(`[INTERPRETATION] Affichage pour test: ${test.testId.nom}`)
        currentY = renderInterpretation(doc, test, currentY, invoice)
      }
    }

    // Observations (examens bactério, etc.)
    if (
      test?.observations ||
      test?.culture ||
      test?.gram ||
      test?.conclusion ||
      (test?.observations && test?.observations?.macroscopique?.length > 0)
    ) {
      currentY = renderObservations(doc, test, currentY, invoice)
    }

    currentY += 5
    
    return currentY
  }

  const addTestResults = async (doc, invoice) => {
    let currentY = 77
    const sortedResults = sortResultsByCategory(invoice?.resultat)

    for (const group of sortedResults) {
      // Pour chaque catégorie, vérifier qu'on a au moins 20mm d'espace
      currentY = checkSpace(doc, currentY, 20, invoice)

      doc.setFontSize(13)
      doc.setFont('Times', 'bold')
      // Centre du contenu = (20+190)/2 = 105 ; align center pour que le
      // texte soit visuellement centre entre les deux marges, peu importe
      // la longueur du libelle (BIOCHIMIE SANGUINE vs ENDOCRINOLOGIE).
      doc.text(group.category.toUpperCase(), 105, currentY, { align: 'center' })

      doc.line(20, currentY + 2, 190, currentY + 2)
      currentY += 10

      for (const test of group.results) {
        if (!test || !test.testId) continue
        currentY = await renderTest(doc, test, currentY, invoice)
      }
    }

    return currentY
  }

  /**
   * FONCTIONS D'EXCEPTIONS - AUCUNE NE DOIT AFFICHER D'INTERPRÉTATION
   */
  const renderExceptions = (doc, test, excepY, invoice) => {
    if (test.exceptions.qbc && test.exceptions.qbc.positivite) {
      excepY = renderQbcException(doc, test, excepY, invoice)
    }
    
    if (
      test.exceptions.groupeSanguin &&
      (test.exceptions.groupeSanguin.abo || test.exceptions.groupeSanguin.rhesus)
    ) {
      excepY = renderBloodGroupException(doc, test, excepY, invoice)
    }
    
    if (
      test.exceptions.hgpo &&
      (test.exceptions.hgpo.t0 || test.exceptions.hgpo.t60 || test.exceptions.hgpo.t120)
    ) {
      excepY = renderHgpoException(doc, test, excepY, invoice)
    }
    
    if (
      test.exceptions.ionogramme &&
      (test.exceptions.ionogramme.na || test.exceptions.ionogramme.k || 
       test.exceptions.ionogramme.cl || test.exceptions.ionogramme.ca || 
       test.exceptions.ionogramme.mg)
    ) {
      excepY = renderIonogrammeException(doc, test, excepY, invoice)
    }
    
    if (test.exceptions.nfs) {
      const { hematiesEtConstantes, leucocytesEtFormules } = test.exceptions.nfs
      const hasHematies = hasHematiesValues(hematiesEtConstantes)
      const hasLeuco = hasLeucocytesValues(leucocytesEtFormules)
      
      if (hasHematies || hasLeuco) {
        excepY = renderNfsException(doc, test, excepY, invoice)
      }
    }

    if (test.exceptions.psaRapport && test.exceptions.psaRapport.rapport?.valeur) {
      excepY = renderPsaRapportException(doc, test, excepY, invoice)
    }
    
    if (test.exceptions.reticulocytes && test.exceptions.reticulocytes.valeurAbsolue?.valeur) {
      excepY = renderReticulocytesException(doc, test, excepY, invoice)
    }
    
    if (test.exceptions.clairanceCreatinine && test.exceptions.clairanceCreatinine.clairance?.valeur) {
      excepY = renderClairanceCreatinineException(doc, test, excepY, invoice)
    }
    
    if (test.exceptions.dfg && test.exceptions.dfg.dfgValue?.valeur) {
      excepY = renderDfgException(doc, test, excepY, invoice)
    }
    
    if (test.exceptions.saturationTransferrine && test.exceptions.saturationTransferrine.coefficient?.valeur) {
      excepY = renderSaturationTransferrineException(doc, test, excepY, invoice)
    }
    
    // ✅ CORRECTION : Appel inconditionnel pour debug
    if (test.exceptions.compteAddis) {
      console.log('[COMPTE ADDIS] Données:', JSON.stringify(test.exceptions.compteAddis, null, 2))
      excepY = renderCompteAddisException(doc, test, excepY, invoice)
    }
    
    if (test.exceptions.calciumCorrige && test.exceptions.calciumCorrige.calciumCorrige?.valeur) {
      excepY = renderCalciumCorrigeException(doc, test, excepY, invoice)
    }
    
    if (test.exceptions.rapportAlbuminurie && test.exceptions.rapportAlbuminurie.rapport?.valeur) {
      excepY = renderRapportAlbuminurieException(doc, test, excepY, invoice)
    }
    
    if (test.exceptions.rapportProteines && test.exceptions.rapportProteines.rapport?.valeur) {
      excepY = renderRapportProteinesException(doc, test, excepY, invoice)
    }
    
    if (test.exceptions.cholesterolLdl && test.exceptions.cholesterolLdl.ldl?.valeur) {
      excepY = renderCholesterolLdlException(doc, test, excepY, invoice)
    }
    
    if (test.exceptions.lipidesTotaux && test.exceptions.lipidesTotaux.lipidesTotaux?.valeur) {
      excepY = renderLipidesTotauxException(doc, test, excepY, invoice)
    }
    
    if (test.exceptions.microalbuminurie24h && test.exceptions.microalbuminurie24h.microalbuminurie?.valeur) {
      excepY = renderMicroalbuminurie24hException(doc, test, excepY, invoice)
    }
    
    if (test.exceptions.proteinurie24h && test.exceptions.proteinurie24h.proteinurie?.valeur) {
      excepY = renderProteinurie24hException(doc, test, excepY, invoice)
    }
    
    if (test.exceptions.bilirubineIndirecte && test.exceptions.bilirubineIndirecte.bilirubineIndirecte?.valeur) {
      excepY = renderBilirubineIndirecteException(doc, test, excepY, invoice)
    }

    // Gaz du sang : on passe la main au renderer des que l'objet existe ;
    // le renderer filtre lui-meme les lignes non renseignees.
    if (test.exceptions.gazDuSang) {
      const g = test.exceptions.gazDuSang
      const hasAny = ['ph','pco2','po2','excesDeBase','tco2','hco3','sao2']
        .some((k) => g[k]?.valeur !== undefined && g[k]?.valeur !== null && String(g[k]?.valeur).trim() !== '')
      if (hasAny) {
        excepY = renderGazDuSangException(doc, test, excepY, invoice)
      }
    }

    // Taux de Prothrombine (TP + INR)
    if (test.exceptions.tauxProthrombine) {
      const t = test.exceptions.tauxProthrombine
      const hasAny = ['tp','inr']
        .some((k) => t[k]?.valeur !== undefined && t[k]?.valeur !== null && String(t[k]?.valeur).trim() !== '')
      if (hasAny) {
        excepY = renderTauxProthrombineException(doc, test, excepY, invoice)
      }
    }

    // Spermogramme + Spermocytogramme : le renderer decide lui-meme s'il y a
    // de quoi afficher (champs numeriques OU textuels OU conclusion).
    if (test.exceptions.spermogramme) {
      excepY = renderSpermogrammeException(doc, test, excepY, invoice)
    }

    return excepY
  }

  const renderQbcException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')

    if (test.exceptions.qbc.positivite) {
      doc.text(`Statut parasitaire : ${test.exceptions.qbc.positivite}`, 25, excepY)
      excepY += 5
    }

    if (typeof test.exceptions.qbc.nombreCroix === 'number') {
      const crosses = '+ '.repeat(test.exceptions.qbc.nombreCroix || 0)
      doc.text(`Niveau d'infestation : ${crosses}`, 25, excepY)
      excepY += 10
    }

    return excepY
  }

  const renderBloodGroupException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')
    doc.setFontSize(10)

    if (test.exceptions.groupeSanguin.abo) {
      doc.text(`Groupe sanguin ABO : ${test.exceptions.groupeSanguin.abo}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.groupeSanguin.rhesus) {
      doc.text(`Rhésus : ${test.exceptions.groupeSanguin.rhesus}`, 25, excepY)
      excepY += 10
    }

    return excepY
  }

  const renderHgpoException = (doc, test, excepY, invoice) => {
    const hgpo = test.exceptions.hgpo || {}

    // HGPO est stocke comme strings simples (t0, t60, t120). Les unites
    // et references sont des standards OMS figes : si jamais le labo
    // doit les ajuster, deplacer ce tableau cote DB (modele Test).
    const rows = [
      { label: 'Glycémie à jeun',         value: hgpo.t0,   unite: 'g/L', reference: '< 0,92' },
      { label: 'Glycémie après 1 heure',  value: hgpo.t60,  unite: 'g/L', reference: '< 1,80' },
      { label: 'Glycémie après 2 heures', value: hgpo.t120, unite: 'g/L', reference: '< 1,53' },
    ]

    const visibleRows = rows.filter(r => r.value && String(r.value).trim() !== '')
    if (visibleRows.length === 0) return excepY

    visibleRows.forEach((r) => {
      const ref = getReference(null, { reference: r.reference, unite: r.unite })
      excepY = drawParamRow(doc, excepY, invoice, r.label, r.value, ref)
    })

    return excepY + 5
  }

  const renderIonogrammeException = (doc, test, excepY, invoice) => {
    const iono = test.exceptions.ionogramme || {}

    // Fallbacks de reference standards (intervalles cliniques classiques).
    // Si la DB contient cell.reference, c'est elle qui prime via getReference().
    const rows = [
      { key: 'na', label: 'Sodium (Na+)',    fb: { reference: '135 - 145', unite: 'mmol/L' } },
      { key: 'k',  label: 'Potassium (K+)',  fb: { reference: '3,5 - 5,0', unite: 'mmol/L' } },
      { key: 'cl', label: 'Chlore (Cl-)',    fb: { reference: '95 - 105',  unite: 'mmol/L' } },
      { key: 'ca', label: 'Calcium (Ca++)',  fb: { reference: '2,15 - 2,55', unite: 'mmol/L' } },
      { key: 'mg', label: 'Magnésium (Mg++)',fb: { reference: '0,7 - 1,1', unite: 'mmol/L' } },
    ]

    rows.forEach((r) => {
      const cell = iono[r.key]
      if (!cell?.valeur) return
      const ref = getReference(cell, r.fb)
      excepY = drawParamRow(doc, excepY, invoice, r.label, cell.valeur, ref)
    })

    return excepY + 5
  }

  const renderNfsException = (doc, test, excepY, invoice) => {
    const { hematiesEtConstantes, leucocytesEtFormules } = test.exceptions.nfs
    const hasHematies = hasHematiesValues(hematiesEtConstantes)
    const hasLeuco = hasLeucocytesValues(leucocytesEtFormules)

    if (hasHematies) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.setFontSize(11)
      doc.setFont('Times', 'bold')
      doc.text('HÉMATIES ET CONSTANTES', 25, excepY)
      excepY += 5

      doc.setFontSize(10)
      doc.setFont('Times', 'normal')

      const { gr, hgb, hct, vgm, tcmh, ccmh, idr_cv } = hematiesEtConstantes

      if (gr?.valeur) {
        excepY = printHematiesLine(doc, excepY, 'Hématies (GR)', gr.valeur, gr.unite, gr.reference)
      }
      if (hgb?.valeur) {
        excepY = printHematiesLine(doc, excepY, 'Hémoglobine (HGB)', hgb.valeur, hgb.unite, hgb.reference)
      }
      if (hct?.valeur) {
        excepY = printHematiesLine(doc, excepY, 'Hématocrite (HCT)', hct.valeur, hct.unite, hct.reference)
      }
      if (vgm?.valeur) {
        excepY = printHematiesLine(doc, excepY, 'VGM', vgm.valeur, vgm.unite, vgm.reference)
      }
      if (tcmh?.valeur) {
        excepY = printHematiesLine(doc, excepY, 'TCMH', tcmh.valeur, tcmh.unite, tcmh.reference)
      }
      if (ccmh?.valeur) {
        excepY = printHematiesLine(doc, excepY, 'CCMH', ccmh.valeur, ccmh.unite, ccmh.reference)
      }
      if (idr_cv?.valeur) {
        excepY = printHematiesLine(doc, excepY, 'IDR (CV)', idr_cv.valeur, idr_cv.unite, idr_cv.reference)
      }

      excepY += 5
    }

    if (hasLeuco) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.setFontSize(11)
      doc.setFont('Times', 'bold')
      doc.text('LEUCOCYTES ET FORMULE', 25, excepY)
      excepY += 5

      doc.setFontSize(10)
      doc.setFont('Times', 'normal')

      const {
        gb, neut, lymph, mono, eo, baso, plt,
        proerythroblastes, erythroblastes, myeloblastes, promyelocytes,
        myelocytes, metamyelocytes, monoblastes, lymphoblastes,
      } = leucocytesEtFormules

      if (gb?.valeur) {
        excepY = printLeucocytesLine(
          doc, excepY, 'Leucocytes (GB)', null,
          gb.valeur, gb.unite, gb.reference
        )
      }
      if (neut?.valeur || neut?.pourcentage) {
        excepY = printLeucocytesLine(
          doc, excepY, 'Neutrophiles',
          neut.pourcentage, neut.valeur, neut.unite, neut.referenceValeur
        )
      }
      if (lymph?.valeur || lymph?.pourcentage) {
        excepY = printLeucocytesLine(
          doc, excepY, 'Lymphocytes',
          lymph.pourcentage, lymph.valeur, lymph.unite, lymph.referenceValeur
        )
      }
      if (mono?.valeur || mono?.pourcentage) {
        excepY = printLeucocytesLine(
          doc, excepY, 'Monocytes',
          mono.pourcentage, mono.valeur, mono.unite, mono.referenceValeur
        )
      }
      if (eo?.valeur || eo?.pourcentage) {
        excepY = printLeucocytesLine(
          doc, excepY, 'Éosinophiles',
          eo.pourcentage, eo.valeur, eo.unite, eo.referenceValeur
        )
      }
      if (baso?.valeur || baso?.pourcentage) {
        excepY = printLeucocytesLine(
          doc, excepY, 'Basophiles',
          baso.pourcentage, baso.valeur, baso.unite, baso.referenceValeur
        )
      }
      if (plt?.valeur) {
        excepY = printLeucocytesLine(
          doc, excepY, 'Plaquettes (PLT)', null,
          plt.valeur, plt.unite, plt.reference
        )
      }

      // ============= Blastes / cellules immatures =============
      // Rendus uniquement si au moins une valeur ou un pourcentage est saisi.
      if (proerythroblastes?.valeur || proerythroblastes?.pourcentage) {
        excepY = printLeucocytesLine(
          doc, excepY, 'Proérythroblastes',
          proerythroblastes.pourcentage, proerythroblastes.valeur,
          proerythroblastes.unite, proerythroblastes.referenceValeur
        )
      }
      if (erythroblastes?.valeur || erythroblastes?.pourcentage) {
        excepY = printLeucocytesLine(
          doc, excepY, 'Érythroblastes',
          erythroblastes.pourcentage, erythroblastes.valeur,
          erythroblastes.unite, erythroblastes.referenceValeur
        )
      }
      if (myeloblastes?.valeur || myeloblastes?.pourcentage) {
        excepY = printLeucocytesLine(
          doc, excepY, 'Myéloblastes',
          myeloblastes.pourcentage, myeloblastes.valeur,
          myeloblastes.unite, myeloblastes.referenceValeur
        )
      }
      if (promyelocytes?.valeur || promyelocytes?.pourcentage) {
        excepY = printLeucocytesLine(
          doc, excepY, 'Promyélocytes',
          promyelocytes.pourcentage, promyelocytes.valeur,
          promyelocytes.unite, promyelocytes.referenceValeur
        )
      }
      if (myelocytes?.valeur || myelocytes?.pourcentage) {
        excepY = printLeucocytesLine(
          doc, excepY, 'Myélocytes',
          myelocytes.pourcentage, myelocytes.valeur,
          myelocytes.unite, myelocytes.referenceValeur
        )
      }
      if (metamyelocytes?.valeur || metamyelocytes?.pourcentage) {
        excepY = printLeucocytesLine(
          doc, excepY, 'Métamyélocytes',
          metamyelocytes.pourcentage, metamyelocytes.valeur,
          metamyelocytes.unite, metamyelocytes.referenceValeur
        )
      }
      if (monoblastes?.valeur || monoblastes?.pourcentage) {
        excepY = printLeucocytesLine(
          doc, excepY, 'Monoblastes',
          monoblastes.pourcentage, monoblastes.valeur,
          monoblastes.unite, monoblastes.referenceValeur
        )
      }
      if (lymphoblastes?.valeur || lymphoblastes?.pourcentage) {
        excepY = printLeucocytesLine(
          doc, excepY, 'Lymphoblastes',
          lymphoblastes.pourcentage, lymphoblastes.valeur,
          lymphoblastes.unite, lymphoblastes.referenceValeur
        )
      }

      excepY += 5
    }

    return excepY
  }

  // const renderPsaRapportException = (doc, test, excepY, invoice) => {
  //   excepY = checkNewPage(doc, excepY, invoice)
  //   doc.setFont('Times', 'normal')
  //   doc.setFontSize(9)

  //   if (test.exceptions.psaRapport.psaLibre?.valeur) {
  //     doc.text(`PSA libre : ${test.exceptions.psaRapport.psaLibre.valeur} ${test.exceptions.psaRapport.psaLibre.unite}`, 25, excepY)
  //     excepY += 5
  //   }

  //   if (test.exceptions.psaRapport.psaTotal?.valeur) {
  //     doc.text(`PSA total : ${test.exceptions.psaRapport.psaTotal.valeur} ${test.exceptions.psaRapport.psaTotal.unite}`, 25, excepY)
  //     excepY += 5
  //   }

  //   if (test.exceptions.psaRapport.rapport?.valeur) {
  //     doc.setFont('Times', 'bold')
  //     doc.text(`Rapport : ${test.exceptions.psaRapport.rapport.valeur} ${test.exceptions.psaRapport.rapport.unite}`, 25, excepY)
  //     doc.setFont('Times', 'normal')
  //     excepY += 10
  //   }

  //   return excepY
  // }

  // const renderReticulocytesException = (doc, test, excepY, invoice) => {
  //   excepY = checkNewPage(doc, excepY, invoice)
  //   doc.setFont('Times', 'normal')
  //   doc.setFontSize(9)

  //   if (test.exceptions.reticulocytes.valeurAbsolue?.valeur) {
  //     doc.setFont('Times', 'bold')
  //     doc.text(`Taux : ${test.exceptions.reticulocytes.valeurAbsolue.valeur} ${test.exceptions.reticulocytes.valeurAbsolue.unite}`, 25, excepY)
  //     doc.setFont('Times', 'normal')
  //     excepY += 10
  //   }

  //   return excepY
  // }

//   const renderReticulocytesException = (doc, test, excepY, invoice) => {
//   excepY = checkNewPage(doc, excepY, invoice)
//   doc.setFont('Times', 'normal')
//   doc.setFontSize(9)

//   const pourcentage = test.exceptions.reticulocytes.pourcentage || test.exceptions.reticulocytes.pourcentageCalcule
//   const valeurAbsolue = test.exceptions.reticulocytes.valeurAbsolue

//   if (pourcentage?.valeur && valeurAbsolue?.valeur) {
//     // Formater le pourcentage avec virgule décimale française
//     const pourcentageFormate = pourcentage.valeur.toString().replace('.', ',')
    
//     // Formater la valeur absolue avec des espaces comme séparateurs de milliers
//     const valeurFormatee = valeurAbsolue.valeur.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    
//     doc.setFont('Times', 'bold')
//     doc.text(`Taux : ${pourcentageFormate}%, soit ${valeurFormatee} ${valeurAbsolue.unite}`, 25, excepY)
//     doc.setFont('Times', 'normal')
//     excepY += 10
//   } else if (valeurAbsolue?.valeur) {
//     // Si seulement la valeur absolue est disponible
//     const valeurFormatee = valeurAbsolue.valeur.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
//     doc.setFont('Times', 'bold')
//     doc.text(`Valeur absolue : ${valeurFormatee} ${valeurAbsolue.unite}`, 25, excepY)
//     doc.setFont('Times', 'normal')
//     excepY += 10
//   }

//   return excepY
// }

// const renderReticulocytesException = (doc, test, excepY, invoice) => {
//   excepY = checkNewPage(doc, excepY, invoice)
//   doc.setFont('Times', 'normal')
//   doc.setFontSize(9)

//   const pourcentage = test.exceptions.reticulocytes.pourcentage || test.exceptions.reticulocytes.pourcentageCalcule
//   const valeurAbsolue = test.exceptions.reticulocytes.valeurAbsolue

//   if (pourcentage?.valeur && valeurAbsolue?.valeur) {
//     // Formater le pourcentage avec virgule décimale française
//     const pourcentageFormate = pourcentage.valeur.toString().replace('.', ',')
    
//     // Formater la valeur absolue avec des espaces comme séparateurs de milliers
//     const valeurFormatee = valeurAbsolue.valeur.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    
//     doc.setFont('Times', 'bold')
//     doc.text(`Taux : ${pourcentageFormate}%, soit ${valeurFormatee} ${valeurAbsolue.unite}`, 25, excepY)
//     doc.setFont('Times', 'normal')
//     excepY += 10
//   } else if (valeurAbsolue?.valeur) {
//     // Si seulement la valeur absolue est disponible
//     const valeurFormatee = valeurAbsolue.valeur.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
//     doc.setFont('Times', 'bold')
//     doc.text(`Valeur absolue : ${valeurFormatee} ${valeurAbsolue.unite}`, 25, excepY)
//     doc.setFont('Times', 'normal')
//     excepY += 10
//   }

//   return excepY
// }

const renderPsaRapportException = (doc, test, excepY, invoice) => {
    const psa = test.exceptions.psaRapport || {}
    if (psa.psaLibre?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'PSA libre',
        psa.psaLibre.valeur, getReference(psa.psaLibre))
    }
    if (psa.psaTotal?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'PSA total',
        psa.psaTotal.valeur, getReference(psa.psaTotal))
    }
    if (psa.rapport?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'Rapport',
        psa.rapport.valeur,
        getReference(psa.rapport, { reference: 'N : > 15 %' }),
        { labelBold: true, valueBold: true })
    }
    return excepY + 2
  }

const renderReticulocytesException = (doc, test, excepY, invoice) => {
  const r = test.exceptions.reticulocytes || {}
  const pourcentage = r.pourcentage || r.pourcentageCalcule
  const valeurAbsolue = r.valeurAbsolue

  const refStr = '0,5 - 1,5 % (20 000 - 120 000 /mm³)'

  if (pourcentage?.valeur && valeurAbsolue?.valeur) {
    const pctFmt = pourcentage.valeur.toString().replace('.', ',')
    const absFmt = valeurAbsolue.valeur.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    excepY = drawParamRow(doc, excepY, invoice, 'Taux',
      `${pctFmt}%, soit ${absFmt}`, refStr,
      { labelBold: true, valueBold: true })
  } else if (valeurAbsolue?.valeur) {
    const absFmt = valeurAbsolue.valeur.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    excepY = drawParamRow(doc, excepY, invoice, 'Valeur absolue',
      `${absFmt} ${valeurAbsolue.unite || ''}`, refStr,
      { labelBold: true, valueBold: true })
  }
  return excepY + 2
}

  const renderClairanceCreatinineException = (doc, test, excepY, invoice) => {
    const c = test.exceptions.clairanceCreatinine || {}
    if (c.creatininemie?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'Créatininémie',
        c.creatininemie.valeur, getReference(c.creatininemie))
    }
    if (c.creatininurie?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'Créatininurie',
        c.creatininurie.valeur, getReference(c.creatininurie))
    }
    if (c.volume?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'Volume',
        c.volume.valeur, getReference(c.volume))
    }
    if (c.clairance?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'Clairance',
        c.clairance.valeur,
        getReference(c.clairance, { reference: '> 90 mL/min' }),
        { labelBold: true, valueBold: true })
    }
    return excepY + 2
  }

  const renderDfgException = (doc, test, excepY, invoice) => {
    const d = test.exceptions.dfg || {}
    if (d.creatininemie?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'Créatininémie',
        d.creatininemie.valeur, getReference(d.creatininemie))
    }
    if (d.dfgValue?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'DFG',
        d.dfgValue.valeur,
        getReference(d.dfgValue, { reference: '>= 90 mL/min/1,73m²' }),
        { labelBold: true, valueBold: true })
    }
    return excepY + 2
  }

  const renderSaturationTransferrineException = (doc, test, excepY, invoice) => {
    const s = test.exceptions.saturationTransferrine || {}
    if (s.fer?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'Fer sérique',
        s.fer.valeur, getReference(s.fer))
    }
    if (s.ctf?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'Capacité totale de fixation',
        s.ctf.valeur, getReference(s.ctf))
    }
    if (s.coefficient?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'Coefficient de saturation',
        s.coefficient.valeur,
        getReference(s.coefficient, { reference: '20 - 40 %' }),
        { labelBold: true, valueBold: true })
    }
    return excepY + 2
  }

  

//   const renderCompteAddisException = (doc, test, excepY, invoice) => {
//   excepY = checkNewPage(doc, excepY, invoice)
//   doc.setFont('Times', 'normal')
//   doc.setFontSize(9)

//   const addis = test.exceptions.compteAddis
  
//   if (!addis) {
//     console.log('[COMPTE ADDIS] Aucune donnée')
//     return excepY
//   }

//   console.log('[COMPTE ADDIS] Données complètes:', JSON.stringify(addis, null, 2))

//   // Affichage des leucocytes (totaux uniquement selon le PDF de référence)
//   if (addis.leucocytesTotaux?.valeur) {
//     doc.text(`Leucocytes : ${addis.leucocytesTotaux.valeur}`, 25, excepY)
//     excepY += 5
//   }

//   // Affichage des hématies (totaux uniquement selon le PDF de référence)
//   if (addis.hematiesTotales?.valeur) {
//     doc.text(`Hématies: ${addis.hematiesTotales.valeur}`, 25, excepY)
//     excepY += 10
//   }

//   return excepY
// }





//   const renderCompteAddisException = (doc, test, excepY, invoice) => {
//   excepY = checkNewPage(doc, excepY, invoice)
//   doc.setFont('Times', 'normal')
//   doc.setFontSize(9)

//   const addis = test.exceptions.compteAddis
  
//   if (!addis) return excepY

//   // Leucocytes - affichage du total OU de la valeur par minute
//   if (addis.leucocytesParMinute?.valeur) {
//     doc.text(`Leucocytes : ${addis.leucocytesParMinute.valeur} ${addis.leucocytesParMinute.unite}`, 25, excepY)
//     excepY += 5
//   } else if (addis.leucocytesTotaux?.valeur) {
//     doc.text(`Leucocytes : ${addis.leucocytesTotaux.valeur} éléments`, 25, excepY)
//     excepY += 5
//   }

//   // Hématies - affichage du total OU de la valeur par minute
//   if (addis.hematiesParMinute?.valeur) {
//     doc.text(`Hématies: ${addis.hematiesParMinute.valeur} ${addis.hematiesParMinute.unite}`, 25, excepY)
//     excepY += 10
//   } else if (addis.hematiesTotales?.valeur) {
//     doc.text(`Hématies: ${addis.hematiesTotales.valeur} éléments`, 25, excepY)
//     excepY += 10
//   }

//   return excepY
// }
 
const renderCompteAddisException = (doc, test, excepY, invoice) => {
  const addis = test.exceptions.compteAddis
  if (!addis) return excepY

  if (addis.leucocytesTotaux?.valeur) {
    excepY = drawParamRow(doc, excepY, invoice, 'Leucocytes',
      addis.leucocytesTotaux.valeur,
      getReference(addis.leucocytesTotaux, { reference: '< 1000/minute' }))
  }
  if (addis.hematiesTotales?.valeur) {
    excepY = drawParamRow(doc, excepY, invoice, 'Hématies',
      addis.hematiesTotales.valeur,
      getReference(addis.hematiesTotales, { reference: '< 500/minute' }))
  }
  return excepY + 2
}

const renderCalciumCorrigeException = (doc, test, excepY, invoice) => {
    const cell = test.exceptions.calciumCorrige?.calciumCorrige
    if (!cell?.valeur) return excepY
    excepY = drawParamRow(doc, excepY, invoice, 'Calcium corrigé',
      cell.valeur, getReference(cell, { reference: '2,20 - 2,60 mmol/L' }),
      { labelBold: true, valueBold: true })
    return excepY + 2
  }

  // ✅ PAS D'INTERPRÉTATION - Juste les valeurs
const renderRapportAlbuminurieException = (doc, test, excepY, invoice) => {
    const rac = test.exceptions.rapportAlbuminurie || {}
    if (rac.albumineUrinaire?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'Albumine urinaire',
        rac.albumineUrinaire.valeur, getReference(rac.albumineUrinaire))
    }
    if (rac.creatinineUrinaire?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'Créatinine urinaire',
        rac.creatinineUrinaire.valeur, getReference(rac.creatinineUrinaire))
    }
    if (rac.rapport?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'Rapport',
        rac.rapport.valeur,
        getReference(rac.rapport, { reference: 'N : < 30 mg/g' }),
        { labelBold: true, valueBold: true })
    }
    return excepY + 2
  }

  const renderRapportProteinesException = (doc, test, excepY, invoice) => {
    const rpc = test.exceptions.rapportProteines || {}
    if (rpc.proteinesUrinaires?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'Protéines urinaires',
        rpc.proteinesUrinaires.valeur, getReference(rpc.proteinesUrinaires))
    }
    if (rpc.creatinineUrinaire?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'Créatinine urinaire',
        rpc.creatinineUrinaire.valeur, getReference(rpc.creatinineUrinaire))
    }
    if (rpc.rapport?.valeur) {
      excepY = drawParamRow(doc, excepY, invoice, 'Rapport',
        rpc.rapport.valeur,
        getReference(rpc.rapport, { reference: 'N : < 150 mg/g' }),
        { labelBold: true, valueBold: true })
    }
    return excepY + 2
  }

  const renderCholesterolLdlException = (doc, test, excepY, invoice) => {
    const ldlCell = test.exceptions.cholesterolLdl?.ldl
    if (!ldlCell?.valeur) return excepY
    excepY = drawParamRow(doc, excepY, invoice, 'LDL Dosé',
      ldlCell.valeur, getReference(ldlCell),
      { labelBold: true, valueBold: true })
    // Note bas de page en italique petit
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFontSize(8)
    doc.setFont('Times', 'italic')
    doc.text('* Valable si triglycérides < 3,5 g/L', PDF_LAYOUT.LABEL_X, excepY)
    doc.setFont('Times', 'normal')
    doc.setFontSize(10)
    return excepY + 5
  }

  const renderLipidesTotauxException = (doc, test, excepY, invoice) => {
    const cell = test.exceptions.lipidesTotaux?.lipidesTotaux
    if (!cell?.valeur) return excepY
    excepY = drawParamRow(doc, excepY, invoice, 'Lipides totaux',
      cell.valeur, getReference(cell, { reference: '2 - 10 g/L' }),
      { labelBold: true, valueBold: true })
    return excepY + 2
  }

  // const renderMicroalbuminurie24hException = (doc, test, excepY, invoice) => {
  //   excepY = checkNewPage(doc, excepY, invoice)
  //   doc.setFont('Times', 'normal')
  //   doc.setFontSize(9)

  //   if (test.exceptions.microalbuminurie24h.albumineUrinaire?.valeur) {
  //     doc.text(`Albumine urinaire : ${test.exceptions.microalbuminurie24h.albumineUrinaire.valeur} ${test.exceptions.microalbuminurie24h.albumineUrinaire.unite}`, 25, excepY)
  //     excepY += 5
  //   }

  //   if (test.exceptions.microalbuminurie24h.volumeUrinaire?.valeur) {
  //     doc.text(`Volume urinaire 24h : ${test.exceptions.microalbuminurie24h.volumeUrinaire.valeur} ${test.exceptions.microalbuminurie24h.volumeUrinaire.unite}`, 25, excepY)
  //     excepY += 5
  //   }

  //   if (test.exceptions.microalbuminurie24h.microalbuminurie?.valeur) {
  //     doc.setFont('Times', 'bold')
  //     doc.text(`Microalbuminurie: ${test.exceptions.microalbuminurie24h.microalbuminurie.valeur} ${test.exceptions.microalbuminurie24h.microalbuminurie.unite}`, 25, excepY)
  //     doc.setFont('Times', 'normal')
  //     excepY += 10
  //   }

  //   return excepY
  // }

  // const renderProteinurie24hException = (doc, test, excepY, invoice) => {
  //   excepY = checkNewPage(doc, excepY, invoice)
  //   doc.setFont('Times', 'normal')
  //   doc.setFontSize(9)

  //   if (test.exceptions.proteinurie24h.proteinesUrinaires?.valeur) {
  //     doc.text(`Protéines urinaires : ${test.exceptions.proteinurie24h.proteinesUrinaires.valeur} ${test.exceptions.proteinurie24h.proteinesUrinaires.unite}`, 25, excepY)
  //     excepY += 5
  //   }

  //   if (test.exceptions.proteinurie24h.volumeUrinaire?.valeur) {
  //     doc.text(`Volume urinaire 24h : ${test.exceptions.proteinurie24h.volumeUrinaire.valeur} ${test.exceptions.proteinurie24h.volumeUrinaire.unite}`, 25, excepY)
  //     excepY += 5
  //   }

  //   if (test.exceptions.proteinurie24h.proteinurie?.valeur) {
  //     doc.setFont('Times', 'bold')
  //     doc.text(`Protéinurie  : ${test.exceptions.proteinurie24h.proteinurie.valeur} ${test.exceptions.proteinurie24h.proteinurie.unite}`, 25, excepY)
  //     doc.setFont('Times', 'normal')
  //     excepY += 10
  //   }

  //   return excepY
  // }

// const renderMicroalbuminurie24hException = (doc, test, excepY, invoice) => {
//   excepY = checkNewPage(doc, excepY, invoice)
//   doc.setFont('Times', 'normal')
//   doc.setFontSize(9)

//   if (test.exceptions.microalbuminurie24h.albumineUrinaire?.valeur) {
//     doc.text(`Albumine urinaire : ${test.exceptions.microalbuminurie24h.albumineUrinaire.valeur} ${test.exceptions.microalbuminurie24h.albumineUrinaire.unite}`, 25, excepY)
//     excepY += 5
//   }

//   if (test.exceptions.microalbuminurie24h.volumeUrinaire?.valeur) {
//     doc.text(`Volume urinaire 24h : ${test.exceptions.microalbuminurie24h.volumeUrinaire.valeur} ${test.exceptions.microalbuminurie24h.volumeUrinaire.unite}`, 25, excepY)
//     excepY += 5
//   }

//   if (test.exceptions.microalbuminurie24h.microalbuminurie?.valeur) {
//     const valeur = test.exceptions.microalbuminurie24h.microalbuminurie.valeur
    
//     doc.setFont('Times', 'bold')
//     doc.text(`Microalbuminurie: ${valeur}`, 25, excepY)
    
//     doc.setFont('Times', 'normal')
//     doc.text('< 30 mg/24h', 130, excepY)
    
//     excepY += 10
//   }

//   return excepY
// }

// const renderMicroalbuminurie24hException = (doc, test, excepY, invoice) => {
//   excepY = checkNewPage(doc, excepY, invoice)
//   doc.setFont('Times', 'normal')
//   doc.setFontSize(9)

//   if (test.exceptions.microalbuminurie24h.albumineUrinaire?.valeur) {
//     doc.text(`Albumine urinaire : ${test.exceptions.microalbuminurie24h.albumineUrinaire.valeur} ${test.exceptions.microalbuminurie24h.albumineUrinaire.unite}`, 25, excepY)
//     excepY += 5
//   }

//   if (test.exceptions.microalbuminurie24h.volumeUrinaire24h?.valeur) {
//     doc.text(`Volume urinaire 24h : ${test.exceptions.microalbuminurie24h.volumeUrinaire24h.valeur} ${test.exceptions.microalbuminurie24h.volumeUrinaire24h.unite}`, 25, excepY)
//     excepY += 5
//   }

//   if (test.exceptions.microalbuminurie24h.microalbuminurie?.valeur) {
//     doc.setFont('Times', 'bold')
//     doc.text(`Microalbuminurie : ${test.exceptions.microalbuminurie24h.microalbuminurie.valeur} ${test.exceptions.microalbuminurie24h.microalbuminurie.unite}`, 25, excepY)
//     doc.setFont('Times', 'normal')
//     excepY += 7
//   }

//   return excepY
// }
const renderMicroalbuminurie24hException = (doc, test, excepY, invoice) => {
  const m = test.exceptions.microalbuminurie24h || {}
  if (m.volumeUrinaire24h?.valeur) {
    excepY = drawParamRow(doc, excepY, invoice, 'Diurèse',
      m.volumeUrinaire24h.valeur, getReference(m.volumeUrinaire24h))
  }
  if (m.microalbuminurie?.valeur) {
    excepY = drawParamRow(doc, excepY, invoice, 'Microalbuminurie',
      m.microalbuminurie.valeur,
      getReference(m.microalbuminurie, { reference: '< 30 mg/24h' }),
      { labelBold: true, valueBold: true })
  }
  return excepY + 2
}

// const renderProteinurie24hException = (doc, test, excepY, invoice) => {
//   excepY = checkNewPage(doc, excepY, invoice)
//   doc.setFont('Times', 'normal')
//   doc.setFontSize(9)

//   if (test.exceptions.proteinurie24h.proteinesUrinaires?.valeur) {
//     doc.text(`Protéines urinaires : ${test.exceptions.proteinurie24h.proteinesUrinaires.valeur} ${test.exceptions.proteinurie24h.proteinesUrinaires.unite}`, 25, excepY)
//     excepY += 5
//   }

//   if (test.exceptions.proteinurie24h.volumeUrinaire?.valeur) {
//     doc.text(`Volume urinaire 24h : ${test.exceptions.proteinurie24h.volumeUrinaire.valeur} ${test.exceptions.proteinurie24h.volumeUrinaire.unite}`, 25, excepY)
//     excepY += 5
//   }

//   if (test.exceptions.proteinurie24h.proteinurie?.valeur) {
//     const valeur = test.exceptions.proteinurie24h.proteinurie.valeur
    
//     doc.setFont('Times', 'bold')
//     doc.text(`Protéinurie : ${valeur}`, 25, excepY)
    
//     doc.setFont('Times', 'normal')
//     doc.text('< 150 mg/24h', 130, excepY)
    
//     excepY += 10
//   }

//   return excepY
// }

const renderProteinurie24hException = (doc, test, excepY, invoice) => {
  const p = test.exceptions.proteinurie24h || {}
  if (p.volumeUrinaire24h?.valeur) {
    excepY = drawParamRow(doc, excepY, invoice, 'Diurèse',
      p.volumeUrinaire24h.valeur, getReference(p.volumeUrinaire24h))
  }
  if (p.proteinurie?.valeur) {
    excepY = drawParamRow(doc, excepY, invoice, 'Protéinurie',
      p.proteinurie.valeur,
      getReference(p.proteinurie, { reference: '< 150 mg/24h' }),
      { labelBold: true, valueBold: true })
  }
  excepY += 2

  return excepY
}


  const renderBilirubineIndirecteException = (doc, test, excepY, invoice) => {
    const cell = test.exceptions.bilirubineIndirecte?.bilirubineIndirecte
    if (!cell?.valeur) return excepY
    excepY = drawParamRow(doc, excepY, invoice, 'Bilirubine indirecte',
      cell.valeur, getReference(cell, { reference: '< 10 mg/L' }),
      { labelBold: true, valueBold: true })
    return excepY + 2
  }

  // 16. Taux de Prothrombine (TP + INR) — format parametre simple, une ligne par valeur
  const renderTauxProthrombineException = (doc, test, excepY, invoice) => {
    const tp = test.exceptions?.tauxProthrombine
    if (!tp) return excepY

    const rows = [
      { key: 'tp',  label: 'Taux de Prothrombine' },
      { key: 'inr', label: 'INR' },
    ]

    const visibleRows = rows.filter((r) => {
      const v = tp[r.key]?.valeur
      return v !== undefined && v !== null && String(v).trim() !== ''
    })
    if (visibleRows.length === 0) return excepY

    visibleRows.forEach((r) => {
      const cell = tp[r.key] || {}
      let valeur = String(cell.valeur ?? '')

      // Convention clinique : seuils de detection de l'analyseur.
      // TP < 5 % et INR > 10 sortent au-dela des bornes fiables : on
      // remplace la valeur brute par le seuil prefixe du signe approprie.
      const numericValeur = Number(String(cell.valeur ?? '').replace(',', '.'))
      if (Number.isFinite(numericValeur)) {
        if (r.key === 'tp' && numericValeur < 5) valeur = '< 5'
        if (r.key === 'inr' && numericValeur > 10) valeur = '> 10'
      }

      const ref = getReference(cell)
      excepY = drawParamRow(doc, excepY, invoice, r.label, valeur, ref, {
        labelBold: true,
        valueBold: true,
      })
    })

    return excepY + 5
  }

  // 17. Spermogramme + Spermocytogramme (normes OMS)
  // Rendu structure type bilan de fertilite : sections caracteres generaux,
  // numeration, vitalite, mobilite, morphologie (tableau), conclusion.
  const renderSpermogrammeException = (doc, test, excepY, invoice) => {
    const sp = test.exceptions?.spermogramme
    if (!sp) return excepY

    const hasVal = (cell) => {
      if (!cell) return false
      const v = cell.valeur ?? cell.count ?? cell.pourcentage
      return v !== undefined && v !== null && String(v).trim() !== ''
    }
    const hasText = (s) => typeof s === 'string' && s.trim() !== ''

    // Si rien n'est saisi, on ne rend rien.
    const anySaisi =
      hasVal(sp.dureeAbstinence) || hasText(sp.modePrelevement) ||
      hasVal(sp.volume) || hasVal(sp.ph) || hasText(sp.viscosite) || hasText(sp.aspect) ||
      hasVal(sp.numeration) || hasVal(sp.ejaculatTotal) ||
      hasText(sp.agglutinatsSpontanes) || hasText(sp.leucocytes) ||
      hasText(sp.hematies) || hasText(sp.cellulesRondes) ||
      hasVal(sp.spermatozoidesVivants) || hasVal(sp.mobiliteProgressive) ||
      hasVal(sp.mobiliteNonProgressive) || hasVal(sp.immobiles) ||
      hasVal(sp.morphoNormal) || hasVal(sp.morphoAnormal) ||
      hasVal(sp.defautsTete) || hasVal(sp.defautsPieceInter) ||
      hasVal(sp.defautsFlagelle) || hasVal(sp.resteCytoplasmique) ||
      hasVal(sp.indexAnomaliesMultiples) ||
      hasText(sp.conclusionSpermogramme) || hasText(sp.conclusionSpermocytogramme)
    if (!anySaisi) return excepY

    excepY = checkNewPage(doc, excepY, invoice)

    // --- Constantes de mise en page ---
    const LEFT_X       = 20     // bord gauche de la zone contenu
    const RIGHT_X      = 190    // bord droit
    const SECTION_W    = RIGHT_X - LEFT_X
    const BANNER_H     = 6      // hauteur du bandeau gris
    const ROW_H        = 5      // hauteur d'une ligne de donnees
    const SECTION_GAP  = 4      // espace blanc entre deux sections
    const VAL_X        = 110    // colonne valeur centree
    const REF_X        = 145    // colonne reference a droite
    const BODY_FONT    = 10      // taille corps de texte
    const TITLE_FONT   = 11     // taille des titres de section

    // Bandeau de section : rectangle gris clair + titre gras a l'interieur
    const drawBanner = (title) => {
      excepY = checkNewPage(doc, excepY, invoice)
      excepY += SECTION_GAP
      doc.setFillColor(220, 220, 220) // gris clair
      doc.rect(LEFT_X, excepY - 4, SECTION_W, BANNER_H, 'F')
      doc.setFont('Times', 'bold')
      doc.setFontSize(TITLE_FONT)
      doc.setTextColor(0, 0, 0)
      doc.text(String(title), LEFT_X + 3, excepY + 1)
      excepY += BANNER_H
      doc.setFont('Times', 'normal')
      doc.setFontSize(BODY_FONT)
    }

    // Ligne label / valeur / reference : delegue au systeme unifie
    // drawParamRow pour que la colonne Reference reste alignee avec
    // les autres sections du PDF (HGPO, Ionogramme, Gaz du sang, ...).
    // Les anciennes positions VAL_X=110 / REF_X=145 sont remplacees
    // par les colonnes PDF_LAYOUT (VALUE_X=100 / REF_X=155).
    const drawLine = (label, valeur, ref) => {
      excepY = drawParamRow(doc, excepY, invoice, label, valeur, ref)
    }

    // Formate la reference avec l'unite : delegue au helper unifie
    // getReference qui sanitize aussi les symboles >= et <=.
    const fmtRef = (cell) => getReference(cell)

    // --- TITRE PRINCIPAL SPERMOGRAMME ---
    excepY += 2
    doc.setFont('Times', 'bold')
    doc.setFontSize(13)
    doc.text('SPERMOGRAMME', 105, excepY, { align: 'center' })
    excepY += 2
    doc.setLineWidth(0.3)
    doc.line(LEFT_X, excepY, RIGHT_X, excepY)
    excepY += 5
    doc.setFontSize(BODY_FONT)
    doc.setFont('Times', 'normal')

    // Pre-analytique (sans bandeau, ligne libre).
    // Pour la duree d'abstinence on force "jours" peu importe ce qui est
    // stocke en base (anciens enregistrements peuvent contenir "2 - 7").
    if (hasVal(sp.dureeAbstinence)) {
      drawLine("Durée d'abstinence", sp.dureeAbstinence.valeur, 'jours')
    }
    if (hasText(sp.modePrelevement)) {
      drawLine('Mode de prélèvement', sp.modePrelevement, '')
    }

    // CARACTERES GENERAUX
    if (hasVal(sp.volume) || hasVal(sp.ph) || hasText(sp.viscosite) || hasText(sp.aspect)) {
      drawBanner('Caractères généraux')
      if (hasVal(sp.volume)) drawLine('Volume', sp.volume.valeur, fmtRef(sp.volume))
      if (hasVal(sp.ph))     drawLine('pH',     sp.ph.valeur,     fmtRef(sp.ph))
      if (hasText(sp.viscosite)) drawLine('Viscosité', sp.viscosite, '')
      if (hasText(sp.aspect))    drawLine('Aspect',    sp.aspect,    '')
    }

    // NUMERATION
    const hasAnyNum =
      hasVal(sp.numeration) || hasVal(sp.ejaculatTotal) ||
      hasText(sp.agglutinatsSpontanes) || hasText(sp.leucocytes) ||
      hasText(sp.hematies) || hasText(sp.cellulesRondes)
    if (hasAnyNum) {
      // Formate les grandes valeurs avec separateurs d'espace par millier
      // (ex: 1555555 -> "1 555 555") pour la lisibilite imprimee.
      const formatThousand = (raw) => {
        const n = parseFloat(String(raw ?? '').replace(/\s| /g, '').replace(',', '.'))
        if (!Number.isFinite(n)) return String(raw)
        return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
      }
      drawBanner('Numération des spermatozoïdes')
      if (hasVal(sp.numeration))    drawLine('Numération',    formatThousand(sp.numeration.valeur),    fmtRef(sp.numeration))
      if (hasVal(sp.ejaculatTotal)) drawLine('Soit/éjaculat', formatThousand(sp.ejaculatTotal.valeur), fmtRef(sp.ejaculatTotal))
      if (hasText(sp.agglutinatsSpontanes)) drawLine('Agglutinats spontanés', sp.agglutinatsSpontanes, '')
      if (hasText(sp.leucocytes))     drawLine('Leucocytes',      sp.leucocytes,     '')
      if (hasText(sp.hematies))       drawLine('Hématies',        sp.hematies,       '')
      if (hasText(sp.cellulesRondes)) drawLine('Cellules rondes', sp.cellulesRondes, '')
    }

    // VITALITE
    if (hasVal(sp.spermatozoidesVivants)) {
      drawBanner('Étude de la vitalité des spermatozoïdes')
      drawLine('Spermatozoïdes vivants', sp.spermatozoidesVivants.valeur, fmtRef(sp.spermatozoidesVivants))
      // Mention italique du test de reference, entre parentheses, taille reduite
      excepY = checkNewPage(doc, excepY, invoice)
      doc.setFont('Times', 'italic')
      doc.setFontSize(8)
      doc.text("(Test de Williams : effectué 1 heure après l'émission)", LEFT_X + 5, excepY)
      doc.setFontSize(BODY_FONT)
      doc.setFont('Times', 'normal')
      excepY += ROW_H - 1
    }

    // MOBILITE
    if (hasVal(sp.mobiliteProgressive) || hasVal(sp.mobiliteNonProgressive) || hasVal(sp.immobiles)) {
      drawBanner('Étude de la mobilité des spermatozoïdes')
      if (hasVal(sp.mobiliteProgressive))    drawLine('Spermatozoïdes à mobilité progressive',     sp.mobiliteProgressive.valeur,    fmtRef(sp.mobiliteProgressive))
      if (hasVal(sp.mobiliteNonProgressive)) drawLine('Spermatozoïdes à mobilité non progressive', sp.mobiliteNonProgressive.valeur, fmtRef(sp.mobiliteNonProgressive))
      if (hasVal(sp.immobiles))              drawLine('Spermatozoïdes immobiles',                  sp.immobiles.valeur,              fmtRef(sp.immobiles))
    }

    // --- SPERMOCYTOGRAMME (morphologie) ---
    const morphoRows = [
      { key: 'morphoNormal',       label: 'Normal' },
      { key: 'morphoAnormal',      label: 'Anormal' },
    ]
    const classifRows = [
      { key: 'morphoNormal',       label: 'Normal' },
      { key: 'defautsTete',        label: 'Défauts de la tête' },
      { key: 'defautsPieceInter',  label: 'Défauts de la pièce intermédiaire' },
      { key: 'defautsFlagelle',    label: 'Défauts du flagelle' },
      { key: 'resteCytoplasmique', label: 'Reste cytoplasmique' },
    ]
    const anyMorpho =
      morphoRows.some((r) => hasVal(sp[r.key])) ||
      classifRows.some((r) => hasVal(sp[r.key])) ||
      hasVal(sp.indexAnomaliesMultiples)

    if (anyMorpho) {
      // SPERMOCYTOGRAMME : toujours en haut d'une nouvelle page comme le
      // demande la pratique labo (les antibiogrammes et bilans morpho
      // doivent etre isoles visuellement du spermogramme).
      doc.addPage()
      addFooter(doc, getColorValue('gris'))
      excepY = addPageHeader(doc, invoice)

      doc.setFont('Times', 'bold')
      doc.setFontSize(13)
      doc.text('SPERMOCYTOGRAMME', 105, excepY, { align: 'center' })
      excepY += 2
      doc.setLineWidth(0.3)
      doc.line(LEFT_X, excepY, RIGHT_X, excepY)
      excepY += 5
      doc.setFontSize(BODY_FONT)
      doc.setFont('Times', 'normal')

      // Affiche une valeur sauf si elle est null/undefined/'' (evite "null" en PDF).
      const cellText = (v) => {
        if (v === null || v === undefined || String(v).trim() === '' || String(v) === 'null') {
          return ''
        }
        return String(v)
      }
      // Helper : ligne morpho (label / Total / % / Normes).
      // La colonne Normes est alignee sur PDF_LAYOUT.REF_X (155) pour
      // rester verticalement coherente avec les colonnes Reference
      // des autres sections (HGPO, Ionogramme, Gaz du sang, etc.).
      const drawMorphoRow = (label, cell, normRef) => {
        excepY = checkNewPage(doc, excepY, invoice)
        doc.setFont('Times', 'normal')
        doc.text(String(label), PDF_LAYOUT.LABEL_X, excepY)
        const c = cellText(cell?.count)
        const p = cellText(cell?.pourcentage)
        if (c) doc.text(c, 100, excepY, { align: 'center' })
        if (p) doc.text(p, 130, excepY, { align: 'center' })
        if (normRef) doc.text(getReference(null, { reference: normRef }), PDF_LAYOUT.REF_X, excepY)
        excepY += PDF_LAYOUT.ROW_H
      }
      const drawMorphoHeader = (withNormes) => {
        excepY = checkNewPage(doc, excepY, invoice)
        doc.setFont('Times', 'bold')
        doc.text('Total', 100, excepY, { align: 'center' })
        doc.text('%',     130, excepY, { align: 'center' })
        if (withNormes) doc.text('Normes', PDF_LAYOUT.REF_X, excepY)
        excepY += PDF_LAYOUT.ROW_H
        doc.setFont('Times', 'normal')
      }

      // Bandeau "Morphologie"
      if (morphoRows.some((r) => hasVal(sp[r.key]))) {
        drawBanner('Morphologie')
        drawMorphoHeader(true)
        morphoRows.forEach((r) => {
          if (!hasVal(sp[r.key])) return
          const ref = r.key === 'morphoNormal' ? (sp.morphoNormal?.reference || '>= 4') : ''
          drawMorphoRow(r.label, sp[r.key], ref)
        })
      }

      // Bandeau "Classification basique"
      if (classifRows.some((r) => hasVal(sp[r.key]))) {
        drawBanner('Classification basique')
        drawMorphoHeader(false)
        classifRows.forEach((r) => {
          if (!hasVal(sp[r.key])) return
          drawMorphoRow(r.label, sp[r.key], '')
        })
      }

      // Index anomalies multiples (ligne libre en bas)
      if (hasVal(sp.indexAnomaliesMultiples)) {
        excepY += 2
        excepY = checkNewPage(doc, excepY, invoice)
        doc.setFont('Times', 'bold')
        doc.text('Index anomalies multiples', PDF_LAYOUT.LABEL_X, excepY)
        doc.setFont('Times', 'normal')
        doc.text(String(sp.indexAnomaliesMultiples.valeur), 100, excepY, { align: 'center' })
        // Normes alignees sur PDF_LAYOUT.REF_X (col commune avec autres sections)
        const iamRef = getReference(sp.indexAnomaliesMultiples, { reference: '< 1,6' })
        doc.text(iamRef, PDF_LAYOUT.REF_X, excepY)
        excepY += ROW_H
        // Definition en italique sur la ligne du dessous, entre parentheses
        excepY = checkNewPage(doc, excepY, invoice)
        doc.setFont('Times', 'italic')
        doc.setFontSize(9)
        doc.text(
          '(total anomalies relevées / spermatozoïdes anormaux)',
          LEFT_X + 5,
          excepY
        )
        doc.setFontSize(10)
        doc.setFont('Times', 'normal')
        excepY += ROW_H
      }
    }

    // --- COMMENTAIRES (liste libre, chacun sur sa propre ligne) ---
    const commentaires = Array.isArray(sp.commentaires) ? sp.commentaires.filter(Boolean) : []
    if (commentaires.length > 0) {
      drawBanner('Commentaires')
      commentaires.forEach((c) => {
        excepY = checkNewPage(doc, excepY, invoice)
        // Ligne avec puce et retour automatique si trop long
        const wrapped = doc.splitTextToSize(`• ${c}`, SECTION_W - 10)
        doc.setFont('Times', 'normal')
        doc.text(wrapped, LEFT_X + 5, excepY)
        excepY += ROW_H * wrapped.length
      })
    }

    // --- CONCLUSION ---
    if (hasText(sp.conclusionSpermogramme) || hasText(sp.conclusionSpermocytogramme)) {
      drawBanner('CONCLUSION')
      doc.setFont('Times', 'bold')
      if (hasText(sp.conclusionSpermogramme)) {
        excepY = checkNewPage(doc, excepY, invoice)
        doc.text(`Spermogramme : ${sp.conclusionSpermogramme}`, LEFT_X + 5, excepY)
        excepY += ROW_H
      }
      if (hasText(sp.conclusionSpermocytogramme)) {
        excepY = checkNewPage(doc, excepY, invoice)
        doc.text(`Spermocytogramme : ${sp.conclusionSpermocytogramme}`, LEFT_X + 5, excepY)
        excepY += ROW_H
      }
      doc.setFont('Times', 'normal')
    }

    return excepY + 5
  }

  // 15. Gaz du sang — tableau structure, seules les lignes renseignees sont affichees
  const renderGazDuSangException = (doc, test, excepY, invoice) => {
    const gaz = test.exceptions?.gazDuSang
    if (!gaz) return excepY

    // Ordre d'affichage conforme au scan de reference du labo
    const rows = [
      { key: 'ph',          label: 'pH' },
      { key: 'pco2',        label: 'pCO2' },
      { key: 'po2',         label: 'pO2' },
      { key: 'excesDeBase', label: 'Excès de base' },
      { key: 'tco2',        label: 'tCO2' },
      { key: 'hco3',        label: 'HCO3' },
      { key: 'sao2',        label: 'Saturation en O2 (SaO2)' },
    ]

    const visibleRows = rows.filter((r) => {
      const v = gaz[r.key]?.valeur
      return v !== undefined && v !== null && String(v).trim() !== ''
    })
    if (visibleRows.length === 0) return excepY

    // Titre de section (la 1ere ligne se chargera du checkNewPage)
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'bold')
    doc.setFontSize(11)
    doc.text('GAZ DU SANG', PDF_LAYOUT.LABEL_X, excepY)
    excepY += PDF_LAYOUT.ROW_H

    // Lignes alignees sur la colonne Ref unifiee (PDF_LAYOUT.REF_X = 155)
    visibleRows.forEach((r) => {
      const cell = gaz[r.key] || {}
      const ref = getReference(cell)
      excepY = drawParamRow(doc, excepY, invoice, r.label, cell.valeur, ref)
    })

    return excepY + 5
  }

  // ✅ SEULE FONCTION AUTORISÉE À AFFICHER DES INTERPRÉTATIONS
  const renderInterpretation = (doc, test, currentY, invoice) => {
    const interpretation = test.statutMachine ? test.testId.interpretationA : test.testId.interpretationB
    if (!interpretation) return currentY

    // Debug : permet de tracer le contenu exact recu pour diagnostiquer
    // les cas ou texte ou tableau ne s'affiche pas (mauvais format,
    // donnees vides, type incorrect...).
    console.log('[INTERPRETATION DEBUG]', {
      type: interpretation.type,
      contentType: typeof interpretation.content,
      content: interpretation.content,
    })

    // Normalisation tolerante : detecte texte/tableau independamment du
    // champ "type", en se basant sur la structure reelle du content.
    // Ainsi un content {text, columns, rows} affiche les deux meme si
    // type='text' a ete sauve par erreur (donnees historiques).
    const content = interpretation.content || {}
    const isStringContent = typeof content === 'string'
    const textBody = isStringContent ? content : (content.text || '')
    const hasText = typeof textBody === 'string' && textBody.trim() !== ''
    // Table consideree presente si columns/rows existent ET au moins une
    // cellule non vide (evite les tableaux fantomes vides qui prennent
    // de la place sans rien afficher).
    const cols = Array.isArray(content.columns) ? content.columns : []
    const rows = Array.isArray(content.rows) ? content.rows : []
    const hasTable =
      cols.length > 0 && rows.length > 0 &&
      (cols.some((c) => c && String(c).trim() !== '') ||
       rows.some((r) => Array.isArray(r) && r.some((c) => c && String(c).trim() !== '')))

    // Largeur dispo pour le texte d'interpretation : entre PDF_LAYOUT.LABEL_X
    // (25) et la marge droite (190) = 165mm. Courier etant plus large que
    // Times, on doit IMPERATIVEMENT mesurer avec la police de rendu
    // (Courier 9pt) pour que splitTextToSize wrappe au bon endroit.
    const INTERPRETATION_WIDTH = 160

    // Calcul de la hauteur necessaire (texte + tableau eventuels)
    let neededHeight = 10 // titre "Interpretation:" + marge
    let textLines = []
    if (hasText) {
      // IMPORTANT : configurer la police de RENDU avant splitTextToSize
      // pour que le wrapping soit calcule au bon ratio.
      doc.setFont('Courier', 'normal')
      doc.setFontSize(10)
      textLines = doc.splitTextToSize(textBody, INTERPRETATION_WIDTH)
      neededHeight += textLines.length * 5 + 3
    }
    if (hasTable) {
      neededHeight += 5 + content.rows.length * 5 + 5
    }
    currentY = checkSpace(doc, currentY, neededHeight, invoice)

    // Titre de section
    doc.setFontSize(11)
    doc.setFont('Times', 'bold')
    doc.text('Interprétation:', PDF_LAYOUT.LABEL_X, currentY)
    currentY += 6

    // Rendu de la partie tableau D'ABORD (juste en dessous du titre
    // "Interpretation:"), car la grille de seuils sert de reference
    // visuelle rapide. Le texte explicatif suit en dessous.
    if (hasTable) {
      doc.setFontSize(10)
      doc.setFont('Times', 'bold')
      cols.forEach((col, colIndex) => {
        doc.text(String(col || ''), PDF_LAYOUT.LABEL_X + colIndex * 40, currentY)
      })
      currentY += 5

      doc.setFont('Times', 'normal')
      rows.forEach((row) => {
        currentY = checkNewPage(doc, currentY, invoice)
        const cells = Array.isArray(row) ? row : []
        cells.forEach((cell, cellIndex) => {
          doc.text(String(cell || ''), PDF_LAYOUT.LABEL_X + cellIndex * 40, currentY)
        })
        currentY += 5
      })
      currentY += 3
    }

    // Rendu de la partie texte ENSUITE (paragraphe d'interpretation
    // clinique, plus long et lu en complement du tableau au-dessus).
    if (hasText) {
      doc.setFontSize(10)
      doc.setFont('Courier', 'normal')
      doc.text(textLines, PDF_LAYOUT.LABEL_X, currentY)
      currentY += textLines.length * 5 + 3
    }

    return currentY
  }

  const renderObservations = (doc, test, currentY, invoice) => {
    const positionX = 100
    const formattedDate = formatDateAndTime(test?.datePrelevement)

    if (test?.observations?.macroscopique?.length > 0) {
      currentY = checkNewPage(doc, currentY, invoice)
      doc.setFontSize(10)
      doc.setFont('Times', 'bold')
      doc.text(` ${test?.typePrelevement} : ${test?.lieuPrelevement}  ${formattedDate}`, 20, currentY)
      currentY += 6
    }

    if (test?.observations?.macroscopique?.length > 0) {
      currentY = renderMacroscopicExam(doc, test, currentY, positionX, invoice)
    }

    if (test?.observations?.microscopique && test?.observations?.macroscopique?.length > 0) {
      currentY = renderMicroscopicExam(doc, test, currentY, positionX, invoice)
    }

    if (test?.observations?.chimie) {
      currentY = renderChemistryExam(doc, test, currentY, positionX, invoice)
    }

    if (test?.gram) {
      currentY = renderGramExam(doc, test, currentY, positionX, invoice)
    }

    if (test?.culture) {
      currentY = renderCultureExam(doc, test, currentY, positionX, invoice)
    }

    if (test?.observations?.rechercheChlamydia) {
      currentY = renderChlamydiaExam(doc, test, currentY, positionX, invoice)
    }

    if (test?.observations?.rechercheMycoplasmes) {
      currentY = renderMycoplasmesExam(doc, test, currentY, positionX, invoice)
    }

    if (test?.conclusion) {
      currentY = renderConclusion(doc, test, currentY, invoice)
    }

    if (test?.observations?.macroscopique?.length > 0 && test?.remarque) {
      currentY = checkNewPage(doc, currentY, invoice)
      doc.setFontSize(9)
      doc.setFont('Times', 'italic')
      doc.text(`Commentaires: ${test.remarque}`, 20, currentY)
      currentY += 5
    }

    if (test?.culture?.germeIdentifie && test.culture.germeIdentifie.length > 0) {
      currentY = renderAntibiograms(doc, test, currentY, invoice)
    }

    return currentY
  }

  // const renderMacroscopicExam = (doc, test, currentY, positionX, invoice) => {
  //   currentY = checkNewPage(doc, currentY, invoice)
  //   doc.setFontSize(10)
  //   doc.setFont('Times', 'bold')
  //   doc.text(`EXAMEN MACROSCOPIQUE`, 20, currentY)
  //   currentY += 8
  //   doc.setFontSize(10)
  //   doc.setFont('Times', 'normal')

  //   test?.observations?.macroscopique?.forEach((obs) => {
  //     currentY = checkNewPage(doc, currentY, invoice)
  //     doc.text(`${obs.label}:`, 20, currentY)
  //     doc.text(`${obs.valeur}`, positionX, currentY)
  //     currentY += 5
  //   })

  //   currentY += 3

  //   return currentY
  // }
  // ✅ NOUVEAU CODE CORRIGÉ:
// const renderMacroscopicExam = (doc, test, currentY, positionX, invoice) => {
//     currentY = checkNewPage(doc, currentY, invoice)
//     doc.setFontSize(10)
//     doc.setFont('Times', 'bold')
//     doc.text(`EXAMEN MACROSCOPIQUE`, 20, currentY)
//     currentY += 8
//     doc.setFontSize(10)
//     doc.setFont('Times', 'normal')

//     // ✅ CORRECTION: Gérer les deux formats (string ou objet)
//     test?.observations?.macroscopique?.forEach((obs) => {
//       currentY = checkNewPage(doc, currentY, invoice)
      
//       // Si obs est un string simple
//       if (typeof obs === 'string' && obs.trim()) {
//         doc.text(`Aspect:`, 20, currentY)
//         doc.text(obs, positionX, currentY)
//         currentY += 5
//       }
//       // Si obs est un objet avec label et valeur
//       else if (obs && typeof obs === 'object' && obs.label && obs.valeur) {
//         doc.text(`${obs.label}:`, 20, currentY)
//         doc.text(String(obs.valeur), positionX, currentY)
//         currentY += 5
//       }
//     })

//     currentY += 3
//     return currentY
//   }

  // const renderMicroscopicExam = (doc, test, currentY, positionX, invoice) => {
  //   currentY = checkNewPage(doc, currentY, invoice)
  //   doc.setFontSize(10)
  //   doc.setFont('Times', 'bold')
  //   doc.text(`EXAMEN MICROSCOPIQUE APRES COLORATION`, 20, currentY)
  //   currentY += 8
  //   doc.setFontSize(10)
  //   doc.setFont('Times', 'normal')

  //   if (test?.observations?.microscopique?.leucocyte) {
  //     doc.text(`Leucocytes:`, 20, currentY)
  //     doc.text(`${test.observations.microscopique.leucocyte}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.microscopique?.hematie) {
  //     doc.text(`Hématies:`, 20, currentY)
  //     doc.text(`${test.observations.microscopique.hematie}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.microscopique?.parasite) {
  //     doc.text(`Parasites:`, 20, currentY)
  //     doc.text(`${test.observations.microscopique.parasite}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.microscopique?.filamentMucus) {
  //     doc.text(`Filaments mucus:`, 20, currentY)
  //     doc.text(`${test.observations.microscopique.filamentMucus}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.microscopique?.celluleEpitheliales) {
  //     doc.text(`Cellules épithéliales:`, 20, currentY)
  //     doc.text(`${test.observations.microscopique.celluleEpitheliales}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.microscopique?.cristaux) {
  //     doc.text(`Cristaux:`, 20, currentY)
  //     doc.text(`${test.observations.microscopique.cristaux}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.microscopique?.cylindres) {
  //     doc.text(`Cylindres:`, 20, currentY)
  //     doc.text(`${test.observations.microscopique.cylindres}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.microscopique?.levures) {
  //     doc.text(`Levures:`, 20, currentY)
  //     doc.text(`${test.observations.microscopique.levures}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.microscopique?.spermatozoides) {
  //     doc.text(`Spermatozoïdes:`, 20, currentY)
  //     doc.text(`${test.observations.microscopique.spermatozoides}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.microscopique?.bacterie) {
  //     doc.text(`Bactéries:`, 20, currentY)
  //     doc.text(`${test.observations.microscopique.bacterie}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.microscopique?.germe) {
  //     doc.text(`Germes:`, 20, currentY)
  //     doc.text(`${test.observations.microscopique.germe}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   currentY += 3

  //   return currentY
  // }
  // ✅ NOUVEAU CODE CORRIGÉ:
// const renderMacroscopicExam = (doc, test, currentY, positionX, invoice) => {
//   currentY = checkNewPage(doc, currentY, invoice)
//   doc.setFontSize(10)
//   doc.setFont('Times', 'bold')
//   doc.text(`EXAMEN MACROSCOPIQUE`, 20, currentY)
//   currentY += 8
//   doc.setFontSize(10)
//   doc.setFont('Times', 'normal')

//   // ✅ Joindre les éléments du tableau avec des virgules
//   if (test?.observations?.macroscopique && Array.isArray(test.observations.macroscopique)) {
//     // Filtrer les valeurs vides et joindre avec des virgules
//     const macroscopiqueText = test.observations.macroscopique
//       .filter(obs => {
//         if (typeof obs === 'string') return obs.trim()
//         if (obs && typeof obs === 'object') return obs.valeur && obs.valeur.trim()
//         return false
//       })
//       .map(obs => {
//         if (typeof obs === 'string') return obs
//         return obs.valeur
//       })
//       .join(', ')

//     if (macroscopiqueText) {
//       // Découper le texte si trop long
//       const maxWidth = 170
//       const lines = doc.splitTextToSize(macroscopiqueText, maxWidth)
//       doc.text(lines, 20, currentY)
//       currentY += lines.length * 5
//     }
//   }

//   currentY += 3
//   return currentY
// }
const renderMacroscopicExam = (doc, test, currentY, positionX, invoice) => {
  currentY = checkNewPage(doc, currentY, invoice)
  doc.setFontSize(11)
  doc.setFont('Times', 'bold')
  doc.text(`EXAMEN MACROSCOPIQUE`, 20, currentY)
  currentY += 8
  doc.setFontSize(11)
  doc.setFont('Times', 'normal')

  // ✅ Joindre les éléments du tableau avec des virgules et "et" pour le dernier
  if (test?.observations?.macroscopique && Array.isArray(test.observations.macroscopique)) {
    // Filtrer les valeurs vides
    const valeurs = test.observations.macroscopique
      .filter(obs => {
        if (typeof obs === 'string') return obs.trim()
        if (obs && typeof obs === 'object') return obs.valeur && obs.valeur.trim()
        return false
      })
      .map(obs => {
        if (typeof obs === 'string') return obs
        return obs.valeur
      })

    let macroscopiqueText = ''
    
    if (valeurs.length === 1) {
      // Un seul élément
      macroscopiqueText = valeurs[0]
    } else if (valeurs.length === 2) {
      // Deux éléments: "X et Y"
      macroscopiqueText = valeurs.join(' et ')
    } else if (valeurs.length > 2) {
      // Plus de deux éléments: "X, Y et Z"
      const dernierElement = valeurs[valeurs.length - 1]
      const autresElements = valeurs.slice(0, -1)
      macroscopiqueText = autresElements.join(', ') + ' et ' + dernierElement
    }

    if (macroscopiqueText) {
      // Découper le texte si trop long
      const maxWidth = 170
      const lines = doc.splitTextToSize(macroscopiqueText, maxWidth)
      doc.text(lines, 20, currentY)
      currentY += lines.length * 5
    }
  }

  currentY += 3
  return currentY
}



  const renderMicroscopicExam = (doc, test, currentY, positionX, invoice) => {
    currentY = checkNewPage(doc, currentY, invoice)
    doc.setFontSize(11)
    doc.setFont('Times', 'bold')
    doc.text(`EXAMEN MICROSCOPIQUE APRES COLORATION`, 20, currentY)
    currentY += 8
    doc.setFontSize(11)
    doc.setFont('Times', 'normal')

    const micro = test?.observations?.microscopique

    // ✅ CORRECTION: Utiliser les bons noms de champs (avec 's')
    if (micro?.leucocytes && micro.leucocytes.trim()) {
      doc.text(`Leucocytes:`, 20, currentY)
      doc.text(String(micro.leucocytes), positionX, currentY)
      currentY += 5
    }

    if (micro?.hematies && micro.hematies.trim()) {
      doc.text(`Hématies:`, 20, currentY)
      doc.text(String(micro.hematies), positionX, currentY)
      currentY += 5
    }

    // ✅ Nouveaux champs présents dans votre BD
    if (micro?.monocytes && micro.monocytes.trim()) {
      doc.text(`Monocytes:`, 20, currentY)
      doc.text(String(micro.monocytes), positionX, currentY)
      currentY += 5
    }

    if (micro?.polynucleairesNeutrophilesAlterees && micro.polynucleairesNeutrophilesAlterees.trim()) {
      doc.text(`Polynucléaires neutrophiles altérés:`, 20, currentY)
      doc.text(String(micro.polynucleairesNeutrophilesAlterees), positionX, currentY)
      currentY += 5
    }

    if (micro?.polynucleairesNeutrophilesNonAlterees && micro.polynucleairesNeutrophilesNonAlterees.trim()) {
      doc.text(`Polynucléaires neutrophiles non altérés:`, 20, currentY)
      doc.text(String(micro.polynucleairesNeutrophilesNonAlterees), positionX, currentY)
      currentY += 5
    }

    if (micro?.eosinophiles && micro.eosinophiles.trim()) {
      doc.text(`Éosinophiles:`, 20, currentY)
      doc.text(String(micro.eosinophiles), positionX, currentY)
      currentY += 5
    }

    if (micro?.basophiles && micro.basophiles.trim()) {
      doc.text(`Basophiles:`, 20, currentY)
      doc.text(String(micro.basophiles), positionX, currentY)
      currentY += 5
    }

    if (micro?.parasites && micro.parasites !== 'Absence') {
      doc.text(`Parasites:`, 20, currentY)
      doc.text(String(micro.parasites), positionX, currentY)
      currentY += 5
    }

    if (micro?.filamentMucus && micro.filamentMucus.trim()) {
      doc.text(`Filaments mucus:`, 20, currentY)
      doc.text(String(micro.filamentMucus), positionX, currentY)
      currentY += 5
    }

    if (micro?.cellulesEpitheliales && micro.cellulesEpitheliales.trim()) {
      doc.text(`Cellules épithéliales:`, 20, currentY)
      doc.text(String(micro.cellulesEpitheliales), positionX, currentY)
      currentY += 5
    }

    if (micro?.cristaux && micro.cristaux !== 'Absence') {
      doc.text(`Cristaux:`, 20, currentY)
      doc.text(String(micro.cristaux), positionX, currentY)
      currentY += 5
    }

    if (micro?.cylindres && micro.cylindres !== 'Absence') {
      doc.text(`Cylindres:`, 20, currentY)
      doc.text(String(micro.cylindres), positionX, currentY)
      currentY += 5
    }

    if (micro?.levures && micro.levures.trim()) {
      doc.text(`Levures:`, 20, currentY)
      doc.text(String(micro.levures), positionX, currentY)
      currentY += 5
    }

    if (micro?.spermatozoides && micro.spermatozoides.trim()) {
      doc.text(`Spermatozoïdes:`, 20, currentY)
      doc.text(String(micro.spermatozoides), positionX, currentY)
      currentY += 5
    }

    if (micro?.bacterie && micro.bacterie.trim()) {
      doc.text(`Bactéries:`, 20, currentY)
      doc.text(String(micro.bacterie), positionX, currentY)
      currentY += 5
    }

    if (micro?.germe && micro.germe.trim()) {
      doc.text(`Germes:`, 20, currentY)
      doc.text(String(micro.germe), positionX, currentY)
      currentY += 5
    }

    // ✅ Champs spécifiques à votre structure
    if (micro?.elementsLevuriforme && micro.elementsLevuriforme !== 'Absence') {
      doc.text(`Éléments levuriformes:`, 20, currentY)
      doc.text(String(micro.elementsLevuriforme), positionX, currentY)
      currentY += 5
    }

    if (micro?.filamentsMyceliens && micro.filamentsMyceliens !== 'Absence') {
      doc.text(`Filaments mycéliens:`, 20, currentY)
      doc.text(String(micro.filamentsMyceliens), positionX, currentY)
      currentY += 5
    }

    if (micro?.trichomonasVaginalis && micro.trichomonasVaginalis !== 'Absence') {
      doc.text(`Trichomonas vaginalis:`, 20, currentY)
      doc.text(String(micro.trichomonasVaginalis), positionX, currentY)
      currentY += 5
    }

    if (micro?.oeufsDeBilharzies && micro.oeufsDeBilharzies !== 'Absence') {
      doc.text(`Œufs de bilharzies:`, 20, currentY)
      doc.text(String(micro.oeufsDeBilharzies), positionX, currentY)
      currentY += 5
    }

    if (micro?.clueCells && micro.clueCells !== 'Absence') {
      doc.text(`Clue cells:`, 20, currentY)
      doc.text(String(micro.clueCells), positionX, currentY)
      currentY += 5
    }

    if (micro?.gardnerellaVaginalis && micro.gardnerellaVaginalis !== 'Absence') {
      doc.text(`Gardnerella vaginalis:`, 20, currentY)
      doc.text(String(micro.gardnerellaVaginalis), positionX, currentY)
      currentY += 5
    }

    if (micro?.bacillesDeDoderlein && micro.bacillesDeDoderlein !== 'Absence') {
      doc.text(`Bacilles de Döderlein:`, 20, currentY)
      doc.text(String(micro.bacillesDeDoderlein), positionX, currentY)
      currentY += 5
    }

    if (micro?.typeDeFlore && micro.typeDeFlore.trim()) {
      doc.text(`Type de flore:`, 20, currentY)
      doc.text(String(micro.typeDeFlore), positionX, currentY)
      currentY += 5
    }

    if (micro?.rechercheDeStreptocoqueB && micro.rechercheDeStreptocoqueB.trim()) {
      doc.text(`Recherche de Streptocoque B:`, 20, currentY)
      doc.text(String(micro.rechercheDeStreptocoqueB), positionX, currentY)
      currentY += 5
    }

    currentY += 3
    return currentY
  }

  // const renderChemistryExam = (doc, test, currentY, positionX, invoice) => {
  //   currentY = checkNewPage(doc, currentY, invoice)
  //   doc.setFontSize(10)
  //   doc.setFont('Times', 'bold')
  //   // doc.text(`EXAMEN CHIMIQUE`, 20, currentY)
  //   currentY += 8
  //   doc.setFontSize(10)
  //   doc.setFont('Times', 'normal')

  //   if (test?.observations?.chimie?.albumine) {
  //     doc.text(`Albumine:`, 20, currentY)
  //     doc.text(`${test.observations.chimie.albumine}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.chimie?.sucre) {
  //     doc.text(`Sucre:`, 20, currentY)
  //     doc.text(`${test.observations.chimie.sucre}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.chimie?.corpscetoniques) {
  //     doc.text(`Corps cétoniques:`, 20, currentY)
  //     doc.text(`${test.observations.chimie.corpscetoniques}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.chimie?.pigmentsbiliaire) {
  //     doc.text(`Pigments biliaire:`, 20, currentY)
  //     doc.text(`${test.observations.chimie.pigmentsbiliaire}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.chimie?.urobilinogene) {
  //     doc.text(`Urobilinogène:`, 20, currentY)
  //     doc.text(`${test.observations.chimie.urobilinogene}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.chimie?.sang) {
  //     doc.text(`Sang:`, 20, currentY)
  //     doc.text(`${test.observations.chimie.sang}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.chimie?.leucocytes) {
  //     doc.text(`Leucocytes:`, 20, currentY)
  //     doc.text(`${test.observations.chimie.leucocytes}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.chimie?.nitrites) {
  //     doc.text(`Nitrites:`, 20, currentY)
  //     doc.text(`${test.observations.chimie.nitrites}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   if (test?.observations?.chimie?.ph) {
  //     doc.text(`pH:`, 20, currentY)
  //     doc.text(`${test.observations.chimie.ph}`, positionX, currentY)
  //     currentY += 5
  //   }

  //   currentY += 3

  //   return currentY
  // }
const renderChemistryExam = (doc, test, currentY, positionX, invoice) => {
  const chimie = test?.observations?.chimie

  // Court-circuit : si chimie est un objet vide (tous champs blancs),
  // on n'affiche meme pas l'en-tete "EXAMEN CHIMIQUE". Sinon il
  // apparaissait sous chaque test ayant une remarque ou interpretation,
  // sans contenu en dessous.
  const hasAny = chimie && Object.values(chimie).some(
    (v) => typeof v === 'string' && v.trim() !== ''
  )
  if (!hasAny) return currentY

  currentY = checkNewPage(doc, currentY, invoice)
  doc.setFontSize(11)
  doc.setFont('Times', 'bold')
  doc.text(`EXAMEN CHIMIQUE`, 20, currentY)
  currentY += 8
  doc.setFontSize(11)
  doc.setFont('Times', 'normal')

  // Champs standards
  if (chimie?.albumine && chimie.albumine.trim()) {
    doc.text(`Albumine:`, 20, currentY)
    doc.text(String(chimie.albumine), positionX, currentY)
    currentY += 5
  }

  if (chimie?.sucre && chimie.sucre.trim()) {
    doc.text(`Sucre:`, 20, currentY)
    doc.text(String(chimie.sucre), positionX, currentY)
    currentY += 5
  }

  if (chimie?.corpscetoniques && chimie.corpscetoniques.trim()) {
    doc.text(`Corps cétoniques:`, 20, currentY)
    doc.text(String(chimie.corpscetoniques), positionX, currentY)
    currentY += 5
  }

  if (chimie?.pigmentsbiliaire && chimie.pigmentsbiliaire.trim()) {
    doc.text(`Pigments biliaire:`, 20, currentY)
    doc.text(String(chimie.pigmentsbiliaire), positionX, currentY)
    currentY += 5
  }

  if (chimie?.urobilinogene && chimie.urobilinogene.trim()) {
    doc.text(`Urobilinogène:`, 20, currentY)
    doc.text(String(chimie.urobilinogene), positionX, currentY)
    currentY += 5
  }

  if (chimie?.sang && chimie.sang.trim()) {
    doc.text(`Sang:`, 20, currentY)
    doc.text(String(chimie.sang), positionX, currentY)
    currentY += 5
  }

  if (chimie?.leucocytes && chimie.leucocytes.trim()) {
    doc.text(`Leucocytes:`, 20, currentY)
    doc.text(String(chimie.leucocytes), positionX, currentY)
    currentY += 5
  }

  if (chimie?.nitrites && chimie.nitrites.trim()) {
    doc.text(`Nitrites:`, 20, currentY)
    doc.text(String(chimie.nitrites), positionX, currentY)
    currentY += 5
  }

  if (chimie?.ph && chimie.ph.trim()) {
    doc.text(`pH:`, 20, currentY)
    doc.text(String(chimie.ph), positionX, currentY)
    currentY += 5
  }

  // ✅ NOUVEAUX champs de votre base de données
  if (chimie?.proteinesTotales && chimie.proteinesTotales.trim()) {
    doc.text(`Protéines totales:`, 20, currentY)
    doc.text(String(chimie.proteinesTotales), positionX, currentY)
    currentY += 5
  }

  if (chimie?.proteinesArochies && chimie.proteinesArochies.trim()) {
    doc.text(`Protéines arochies:`, 20, currentY)
    doc.text(String(chimie.proteinesArochies), positionX, currentY)
    currentY += 5
  }

  if (chimie?.glycorachie && chimie.glycorachie.trim()) {
    doc.text(`Glycorachie:`, 20, currentY)
    doc.text(String(chimie.glycorachie), positionX, currentY)
    currentY += 5
  }

  if (chimie?.acideUrique && chimie.acideUrique.trim()) {
    doc.text(`Acide urique:`, 20, currentY)
    doc.text(String(chimie.acideUrique), positionX, currentY)
    currentY += 5
  }

  if (chimie?.LDH && chimie.LDH.trim()) {
    doc.text(`LDH:`, 20, currentY)
    doc.text(String(chimie.LDH), positionX, currentY)
    currentY += 5
  }

  currentY += 3
  return currentY
}

  const renderGramExam = (doc, test, currentY, positionX, invoice) => {
    currentY = checkNewPage(doc, currentY, invoice)
    doc.setFontSize(11)
    doc.setFont('Times', 'bold')
    doc.text(`EXAMEN BACTERIOLOGIE DIRECT (Coloration de gram)`, 20, currentY)
    currentY += 8
    doc.setFontSize(11)
    doc.setFont('Times', 'normal')
    doc.text(`Gram:`, 20, currentY)
    doc.text(`${test.gram}`, positionX, currentY)
    currentY += 8

    return currentY
  }

  const renderCultureExam = (doc, test, currentY, positionX, invoice) => {
    const { culture, germeIdentifie, description } = test.culture

    if (!culture && (!Array.isArray(germeIdentifie) || germeIdentifie.length === 0) && !description) {
      return currentY
    }

    currentY = checkNewPage(doc, currentY, invoice)
    doc.setFontSize(11)
    doc.setFont('Times', 'bold')
    doc.text(`CULTURES SUR MILIEUX SPECIFIQUES:`, 20, currentY)
    currentY += 5
    doc.setFontSize(11)
    doc.setFont('Times', 'normal')

    if (culture) {
      doc.text(`Culture:`, 20, currentY)
      doc.text(culture, positionX, currentY)
      currentY += 5
    }

    if (Array.isArray(germeIdentifie) && germeIdentifie.length > 0) {
      const germeIdentifieText = germeIdentifie.map((germe) => germe.nom).join(', ')
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

    if (description) {
      doc.text(`Numeration:`, 20, currentY)
      doc.text(description, positionX, currentY)
      currentY += 7
    }

    return currentY
  }

  const renderChlamydiaExam = (doc, test, currentY, positionX, invoice) => {
    const { naturePrelevement, rechercheAntigeneChlamydiaTrochomatis } = test.observations.rechercheChlamydia

    if (!naturePrelevement && !rechercheAntigeneChlamydiaTrochomatis) {
      return currentY
    }

    currentY = checkNewPage(doc, currentY, invoice)
    doc.setFontSize(11)
    doc.setFont('Times', 'bold')
    doc.text('RECHERCHE DE CHLAMYDIA', 20, currentY)
    currentY += 5
    doc.setFontSize(11)
    doc.setFont('Times', 'normal')

    if (naturePrelevement) {
      doc.text('Nature du prélèvement:', 20, currentY)
      doc.text(naturePrelevement, positionX, currentY)
      currentY += 5
    }

    if (rechercheAntigeneChlamydiaTrochomatis) {
      doc.text("Recherche d'antigène de Chlamydia trachomatis:", 20, currentY)
      doc.text(rechercheAntigeneChlamydiaTrochomatis, positionX, currentY)
      currentY += 7
    }

    return currentY
  }

  const renderMycoplasmesExam = (doc, test, currentY, positionX, invoice) => {
    const { naturePrelevement, rechercheUreaplasmaUrealyticum, rechercheMycoplasmaHominis } = test.observations.rechercheMycoplasmes

    if (!naturePrelevement && !rechercheUreaplasmaUrealyticum && !rechercheMycoplasmaHominis) {
      return currentY
    }

    currentY = checkNewPage(doc, currentY, invoice)
    doc.setFontSize(11)
    doc.setFont('Times', 'bold')
    doc.text('RECHERCHE DE MYCOPLASMES', 20, currentY)
    currentY += 5
    doc.setFontSize(11)
    doc.setFont('Times', 'normal')

    if (naturePrelevement) {
      doc.text('Nature du prélèvement:', 20, currentY)
      doc.text(naturePrelevement, positionX, currentY)
      currentY += 5
    }

    if (rechercheUreaplasmaUrealyticum) {
      doc.text("Recherche d'Ureaplasma urealyticum:", 20, currentY)
      doc.text(rechercheUreaplasmaUrealyticum, positionX, currentY)
      currentY += 5
    }

    if (rechercheMycoplasmaHominis) {
      doc.text('Recherche de Mycoplasma hominis:', 20, currentY)
      doc.text(rechercheMycoplasmaHominis, positionX, currentY)
      currentY += 7
    }

    return currentY
  }

  const renderConclusion = (doc, test, currentY, invoice) => {
    currentY = checkNewPage(doc, currentY, invoice)
    doc.setFontSize(11)
    doc.setFont('Times', 'bold')
    doc.text('CONCLUSION', 20, currentY)
    currentY += 5

    const maxLineWidth = 100
    const conclusionLines = doc.splitTextToSize(test.conclusion, maxLineWidth)
    doc.text(conclusionLines, 20, currentY)

    currentY += conclusionLines.length * 5
    doc.setFontSize(11)
    doc.setFont('Times', 'normal')
    currentY += 5

    return currentY
  }

  const renderAntibiograms = (doc, test, currentY, invoice) => {
    for (const germe of test.culture.germeIdentifie) {
      if (Object.keys(germe.antibiogramme).length === 0) {
        continue
      }

      // Hauteur estimee : titre (7) + entete tableau (7) + lignes (7 chacune)
      // + legende (10). On n'ajoute une nouvelle page QUE si l'antibiogramme
      // ne tient pas sur la page courante. L'ancien comportement forcait
      // une page par germe, generant des pages a moitie vides.
      const lineCount = Object.keys(germe.antibiogramme).length
      const neededHeight = 7 + 7 + lineCount * 7 + 10 + 5
      currentY = checkSpace(doc, currentY, neededHeight, invoice)
      currentY += 5 // petit espacement avant le bloc antibiogramme

      doc.setFontSize(11)
      doc.setFont('Times', 'bold')
      doc.text(`ANTIBIOGRAMME : ${germe.nom}`, 42, currentY)
      currentY += 7

      doc.setFont('Times', 'normal')

      const columnWidthAntibiotique = 70
      const columnWidthSensibilite = 30
      const lineHeight = 7

      doc.rect(40, currentY, columnWidthAntibiotique, lineHeight)
      doc.rect(110, currentY, columnWidthSensibilite, lineHeight)
      doc.text('Antibiotique', 42, currentY + 5)
      doc.text('Sensibilité', 112, currentY + 5)
      currentY += lineHeight

      Object.entries(germe.antibiogramme).forEach(([antibiotique, sensibilite]) => {
        currentY = checkNewPage(doc, currentY, invoice)
        doc.rect(40, currentY, columnWidthAntibiotique, lineHeight)
        doc.rect(110, currentY, columnWidthSensibilite, lineHeight)
        doc.text(antibiotique, 42, currentY + 5)
        doc.text(sensibilite, 112, currentY + 5)
        currentY += lineHeight
      })

      currentY += 5
      doc.text('S : Sensible    I : Intermédiaire     R : Résistant', 42, currentY)
    }

    return currentY
  }

  const addValidationInfo = async (doc, invoice) => {
    // Cherche d'abord la validation finale, puis la validation technique
    // en repli.
    const finalValidation = invoice.historiques.find((h) => h.status === 'Validé')
    const techValidation = invoice.historiques.find(
      (h) => h.status === 'Validation technique'
    )
    const validation = finalValidation || techValidation
    if (!validation || !validation.updatedBy) return

    const isTechnical = !finalValidation && techValidation
    const validator = validation.updatedBy

    const X_CENTER = 145

    // --- CAS VALIDATION TECHNIQUE SEULE ---
    // L'usage labo : pas de signature individuelle pour la validation
    // technique (c'est juste une etape de QC avant le biologiste). Seul
    // le texte "Validation technique" apparait, souligne. Pas de nom,
    // pas de titres, pas de signature.
    if (isTechnical) {
      const currentY = 240
      doc.setFontSize(12)
      doc.setFont('Times', 'bold')
      doc.text('Validation technique', X_CENTER, currentY, { align: 'center' })
      const w = doc.getTextWidth('Validation technique')
      doc.setLineWidth(0.3)
      doc.line(X_CENTER - w / 2, currentY + 1, X_CENTER + w / 2, currentY + 1)
      return
    }

    // --- CAS VALIDATION FINALE (BIOLOGISTE) ---
    // Le prenom en DB contient parfois deja le prefixe "Dr" : on ne le
    // ajoute donc PAS hardcode (sinon affichage "Dr Dr ..."). C'est au
    // profil de stocker le nom complet tel qu'il doit apparaitre.
    const fullName = `${validator.prenom || ''} ${validator.nom || ''}`.trim()
    const SIG_W = 40
    let currentY = 235

    // 1) Nom du docteur, gras, centre. Pas d'en-tete "Le Biologiste".
    doc.setFontSize(10)
    doc.setFont('Times', 'bold')
    doc.text(fullName, X_CENTER, currentY, { align: 'center' })
    currentY += 5

    // 3) Titres / qualifications (profil) : 1 ligne par entree, italique.
    const profil = String(validator.profil || '').trim()
    if (profil) {
      doc.setFontSize(10)
      doc.setFont('Times', 'italic')
      const lines = profil.split(/\r?\n/).filter((l) => l.trim() !== '')
      lines.forEach((line) => {
        doc.text(line.trim(), X_CENTER, currentY, { align: 'center' })
        currentY += 4
      })
      doc.setFont('Times', 'normal')
    }

    // 4) Signature / cachet remontee de SIG_OVERLAP mm pour absorber
    //    l'eventuel espace blanc en haut de l'image PNG. Si le rendu
    //    chevauche les titres, baisser SIG_OVERLAP.
    if (validator.logo) {
      try {
        const rawPath = String(validator.logo).replace(/\\/g, '/')
        const fullLogoPath = rawPath.startsWith('http')
          ? rawPath
          : `${import.meta.env.VITE_APP_API_BASE_URL}/${rawPath}`
        const doctorLogo = await loadImage(fullLogoPath)
        const sigH = SIG_W * (doctorLogo.height / doctorLogo.width)
        const SIG_OVERLAP = 8 // mm tires vers le haut pour cacher l'air blanc
        doc.addImage(
          doctorLogo,
          'PNG',
          X_CENTER - SIG_W / 2,
          currentY - SIG_OVERLAP,
          SIG_W,
          sigH
        )
      } catch (error) {
        console.error('Erreur lors du chargement de la signature :', error)
      }
    }
  }

  // Charge le profil labo (logo, couleur, nom, etc.) une fois.
  // Si l'utilisateur clique avant la fin du fetch, on relance la requete
  // pour eviter un PDF avec entete vide (le bug observe sur le partage
  // WhatsApp : le composant cache de ShareResultatButton n'avait pas
  // toujours fini de charger le profil au moment du clic).
  const ensureUserLoaded = async () => {
    if (user && (user.nomEntreprise || user.logo || user.nom)) return user
    try {
      const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) return user
      const data = await response.json()
      const fresh = {
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
      }
      setUser(fresh)
      return fresh
    } catch (err) {
      console.warn('[PDF] echec rechargement profil :', err)
      return user
    }
  }

  // Construit le PDF en memoire et retourne un Blob.
  // Cette logique etait inline dans generatePDF ; on l'extrait pour
  // pouvoir la reutiliser depuis <ShareResultatButton/> via une ref.
  const buildPdfBlob = async () => {
    // S'assure que le profil labo est charge AVANT de generer le PDF.
    // Sinon on aurait un entete vide quand l'utilisateur clique trop tot.
    await ensureUserLoaded()
    console.log('[PDF] Début de génération du PDF')
    const doc = new jsPDF()
    const userColor = getColorValue('gris')

    // Sanitization PDF :
    //  1. Decimaux a la francaise : "2.4" -> "2,4"
    //  2. Symboles Unicode non rendus par Times/Helvetica WinAnsi :
    //     ≥ (U+2265) -> ">=", ≤ (U+2264) -> "<=". Cela couvre les
    //     references stockees AVANT le passage en mode ">=" texte,
    //     pour qu'elles s'affichent correctement sans re-save.
    const sanitizeForPdf = (val) => {
      if (typeof val === 'string') {
        return val
          .replace(/≥/g, '>=')
          .replace(/≤/g, '<=')
          .replace(/(\d)\.(\d)/g, '$1,$2')
      }
      if (Array.isArray(val)) return val.map(sanitizeForPdf)
      return val
    }
    const originalDocText = doc.text.bind(doc)
    doc.text = (text, x, y, options) =>
      originalDocText(sanitizeForPdf(text), x, y, options)

    const [imgLeft] = await Promise.all([
      loadImage(logoLeft),
      loadImage(logoRight),
    ])

    await setupDocumentHeader(doc, imgLeft, userColor)
    await addPatientInformation(doc, invoice)
    await addTestResults(doc, invoice)
    await addValidationInfo(doc, invoice)

    addPageNumbers(doc)

    console.log('[PDF] Génération terminée')
    return doc.output('blob')
  }

  // Comportement standard du bouton : ouvrir le PDF dans un onglet.
  const generatePDF = async () => {
    try {
      const blob = await buildPdfBlob()
      const url = URL.createObjectURL(blob)
      window.open(`/pdf-viewer?pdfBlobUrl=${encodeURIComponent(url)}`, '_blank')
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error)
      alert('Une erreur est survenue lors de la génération du PDF.')
    }
  }

  // API imperative pour les composants externes (ShareResultatButton).
  useImperativeHandle(ref, () => ({ generatePdfBlob: buildPdfBlob }))

  return (
    <button className="btn btn-primary btn-sm" onClick={generatePDF}>
      <FontAwesomeIcon icon={faDownload} />
    </button>
  )
})

GenerateResultatButton.propTypes = {
  invoice: PropTypes.object.isRequired,
}

export default GenerateResultatButton