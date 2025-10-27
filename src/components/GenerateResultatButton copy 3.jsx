import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'
import jsPDF from 'jspdf'
import PropTypes from 'prop-types'
import logoLeft from '../images/bioramlogo.png'
import logoRight from '../images/logo2.png'

/**
 * Composant pour générer un PDF de résultat d'analyse médicale
 * VERSION CORRIGÉE - Pagination simple et efficace
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
  const MARGIN_BEFORE_FOOTER = 30
  const MAX_CONTENT_Y = FOOTER_Y - MARGIN_BEFORE_FOOTER // 247mm
  const MIN_SPACE = 15 // Espace minimum pour continuer sur la même page

  /**
   * Ajoute un header discret sur les nouvelles pages
   */
  const addPageHeader = (doc, invoice, startY = 25) => {
    doc.setFontSize(8)
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

  const printHematiesLine = (doc, posY, label, value, unit, ref) => {
    doc.text(label, 25, posY)
    doc.text(value, 85, posY)
    if (unit) doc.text(unit, 100, posY)
    if (ref) doc.text(ref, 120, posY)
    return posY + 5
  }

  const printLeucocytesLine = (doc, posY, label, pctValue, mainValue, unit, reference) => {
    doc.text(label, 25, posY)
    if (pctValue) doc.text(`${pctValue}%`, 70, posY)
    doc.text(mainValue, 85, posY)
    if (unit) doc.text(unit, 100, posY)
    if (reference) doc.text(reference, 120, posY)
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
    return leuco.gb?.valeur || leuco.neut?.valeur || leuco.neut?.pourcentage ||
           leuco.lymph?.valeur || leuco.lymph?.pourcentage || leuco.mono?.valeur ||
           leuco.mono?.pourcentage || leuco.eo?.valeur || leuco.eo?.pourcentage ||
           leuco.baso?.valeur || leuco.baso?.pourcentage || leuco.plt?.valeur
  }

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

  const addPageNumbers = (doc) => {
    const pageCount = doc.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)
      doc.text(` ${i}/${pageCount}`, 185, 275, { align: 'center' })
    }
  }

  const setupDocumentHeader = async (doc, imgLeft, userColor) => {
    const maxWidth = 30
    const leftHeight = maxWidth * (imgLeft.height / imgLeft.width)
    doc.addImage(imgLeft, 'PNG', 20, 5, maxWidth, leftHeight)

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

    addFooter(doc, userColor)
  }

  const addPatientInformation = (doc, invoice) => {
    const currentY = 40
    doc.setFontSize(10)
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
    doc.setFontSize(10)
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
    doc.setFontSize(8)
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
   * Fonction principale de rendu d'un test - VERSION SIMPLIFIÉE
   */
  const renderTest = async (doc, test, currentY, invoice) => {
    // Vérifier qu'on a de l'espace pour au moins le titre
    currentY = checkNewPage(doc, currentY, invoice)

    // Rendu du titre
    const maxLineWidth = 100
    let nomTestLines = doc.splitTextToSize(`${test.testId.nom.toUpperCase()}`, maxLineWidth)

    doc.setFontSize(9)
    doc.setFont('Courier', 'normal')
    doc.setFontSize(8)
    doc.setFont('Times', 'bold')

    doc.setFillColor(0, 0, 0)
    doc.circle(18, currentY - 1, 1, 'F')

    if (test?.observations && test?.observations?.macroscopique?.length > 0) {
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
    const formattedDateAnterieur = formatDateAndTime(test?.dernierResultatAnterieur?.date)

    doc.setFont('Times', 'bold')
    doc.setFontSize(8)

    let anterioriteHeight = 0

    // Antériorités (colonne droite) - seulement si pas d'observations macroscopiques
    if (test?.observations?.macroscopique?.length === 0 && test?.dernierResultatAnterieur) {
      const valeurAnterieure = test.dernierResultatAnterieur.valeur ?? ''
      const dateAnterieure = formattedDateAnterieur ?? ''
      
      doc.text('Antériorités', 160, currentY)
      doc.text(valeurAnterieure, 160, currentY + 5)
      doc.text(dateAnterieure, 160, currentY + 10)
      
      anterioriteHeight = 15
    }

    // Contenu principal du test (si pas d'observations macroscopiques)
    if (test?.observations?.macroscopique?.length === 0) {
      if (test?.typePrelevement) {
        doc.setFontSize(8)
        doc.setFont('Times', 'normal')
        doc.text(
          `Prélèvement : ${formattedDate}, ${test?.typePrelevement}`,
          20,
          currentY
        )
        currentY += 5
      }

      renderMachineInfo(doc, test, currentY)
      currentY += 5

      doc.setFont('Times', 'bold')
      doc.setFontSize(10)
      doc.text(`${test?.valeur}`, 90, currentY)

      if (test?.qualitatif) {
        currentY += 5
        doc.text(`(${test?.qualitatif})`, 86, currentY)
      }

      currentY = Math.max(currentY + 5, anterioriteHeight > 0 ? currentY + anterioriteHeight - 10 : currentY)

      // Exceptions
      if (test?.exceptions) {
        currentY = renderExceptions(doc, test, currentY, invoice)
      }

      // Remarque
      if (test?.remarque) {
        currentY = checkNewPage(doc, currentY, invoice)
        doc.setFontSize(8)
        doc.setFont('Times', 'italic')
        const remarqueLines = doc.splitTextToSize(`Remarque: ${test.remarque}`, 170)
        doc.text(remarqueLines, 20, currentY)
        currentY += remarqueLines.length * 5
      }

      // Interprétation
      if (test.statutInterpretation) {
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

      doc.setFontSize(12)
      doc.setFont('Times', 'bold')
      doc.text(group.category.toUpperCase(), 90, currentY)

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
   * FONCTIONS D'EXCEPTIONS
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
    
    if (test.exceptions.compteAddis && 
        (test.exceptions.compteAddis.leucocytesParMinute?.valeur || 
         test.exceptions.compteAddis.hematiesParMinute?.valeur)) {
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
      excepY += 5
    }

    if (test.exceptions.qbc.densiteParasitaire) {
      doc.text(`Densité parasitaire : ${test.exceptions.qbc.densiteParasitaire} p/µL`, 25, excepY)
      excepY += 5
    }

    if (Array.isArray(test.exceptions.qbc.especes) && test.exceptions.qbc.especes.length > 0) {
      doc.text(`Espèces : ${test.exceptions.qbc.especes.join(', ')}`, 25, excepY)
      excepY += 7
    }

    return excepY
  }

  const renderBloodGroupException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')

    if (test.exceptions.groupeSanguin.abo) {
      doc.text(`Groupe ABO : ${test.exceptions.groupeSanguin.abo}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.groupeSanguin.rhesus) {
      doc.text(`Rhésus (Antigène D) : ${test.exceptions.groupeSanguin.rhesus}`, 25, excepY)
      excepY += 7
    }

    return excepY
  }

  const renderHgpoException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')

    if (test.exceptions.hgpo.t0) {
      doc.text(`Glycémie T0 : ${test.exceptions.hgpo.t0} g/L`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.hgpo.t60) {
      doc.text(`Glycémie T60 : ${test.exceptions.hgpo.t60} g/L`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.hgpo.t120) {
      doc.text(`Glycémie T120 : ${test.exceptions.hgpo.t120} g/L`, 25, excepY)
      excepY += 7
    }

    return excepY
  }

  const renderIonogrammeException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')

    if (test.exceptions.ionogramme.na) {
      doc.text(`Na+ : ${test.exceptions.ionogramme.na}`, 25, excepY)
      doc.text(`Valeur de référence`, 110, excepY - 8)
      doc.text(`137-145 mEq/L`, 110, excepY)
      excepY += 5
    }

    if (test.exceptions.ionogramme.k) {
      doc.text(`K+ : ${test.exceptions.ionogramme.k}`, 25, excepY)
      doc.text(`3.5-5.0 mEq/L`, 110, excepY)
      excepY += 5
    }

    if (test.exceptions.ionogramme.cl) {
      doc.text(`Cl- : ${test.exceptions.ionogramme.cl}`, 25, excepY)
      doc.text(`98.0-107.0 mEq/L`, 110, excepY)
      excepY += 5
    }

    if (test.exceptions.ionogramme.ca) {
      doc.text(`Ca2+ : ${test.exceptions.ionogramme.ca}`, 25, excepY)
      doc.text(`137-145 mEq/L`, 110, excepY)
      excepY += 5
    }

    if (test.exceptions.ionogramme.mg) {
      doc.text(`Mg2+ : ${test.exceptions.ionogramme.mg}`, 25, excepY)
      doc.text(`137-145 mEq/L`, 110, excepY)
      excepY += 7
    }

    return excepY
  }

  const renderNfsException = (doc, test, excepY, invoice) => {
    const { hematiesEtConstantes, leucocytesEtFormules } = test.exceptions.nfs
    const showHematies = hasHematiesValues(hematiesEtConstantes)
    const showLeucocytes = hasLeucocytesValues(leucocytesEtFormules)

    if (!showHematies && !showLeucocytes) return excepY

    // Vérifier qu'on a assez d'espace pour le début de la NFS
    excepY = checkSpace(doc, excepY, 25, invoice)
    
    doc.setFont('Times', 'bold')
    doc.setFontSize(10)
    doc.text('NFS (Numération Formule Sanguine)', 25, excepY)
    excepY += 7
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)
    doc.text('Valeurs de références', 120, excepY)
    excepY += 3

    if (showHematies) {
      doc.setFont('Times', 'bold')
      doc.text('HEMATIES ET CONSTANTES', 25, excepY)
      excepY += 7
      doc.setFont('Times', 'normal')

      if (hematiesEtConstantes.gr?.valeur) {
        excepY = checkNewPage(doc, excepY, invoice)
        excepY = printHematiesLine(doc, excepY, 'Hématies', String(hematiesEtConstantes.gr.valeur), hematiesEtConstantes.gr.unite || '', hematiesEtConstantes.gr.reference || '')
      }
      if (hematiesEtConstantes.hgb?.valeur) {
        excepY = checkNewPage(doc, excepY, invoice)
        excepY = printHematiesLine(doc, excepY, 'Hémoglobine', String(hematiesEtConstantes.hgb.valeur), hematiesEtConstantes.hgb.unite || '', hematiesEtConstantes.hgb.reference || '')
      }
      if (hematiesEtConstantes.hct?.valeur) {
        excepY = checkNewPage(doc, excepY, invoice)
        excepY = printHematiesLine(doc, excepY, 'Hématocrite', String(hematiesEtConstantes.hct.valeur), hematiesEtConstantes.hct.unite || '', hematiesEtConstantes.hct.reference || '')
      }
      if (hematiesEtConstantes.vgm?.valeur) {
        excepY = checkNewPage(doc, excepY, invoice)
        excepY = printHematiesLine(doc, excepY, 'VGM', String(hematiesEtConstantes.vgm.valeur), hematiesEtConstantes.vgm.unite || '', hematiesEtConstantes.vgm.reference || '')
      }
      if (hematiesEtConstantes.tcmh?.valeur) {
        excepY = checkNewPage(doc, excepY, invoice)
        excepY = printHematiesLine(doc, excepY, 'TCMH', String(hematiesEtConstantes.tcmh.valeur), hematiesEtConstantes.tcmh.unite || '', hematiesEtConstantes.tcmh.reference || '')
      }
      if (hematiesEtConstantes.ccmh?.valeur) {
        excepY = checkNewPage(doc, excepY, invoice)
        excepY = printHematiesLine(doc, excepY, 'CCMH', String(hematiesEtConstantes.ccmh.valeur), hematiesEtConstantes.ccmh.unite || '', hematiesEtConstantes.ccmh.reference || '')
      }
      if (hematiesEtConstantes.idr_cv?.valeur) {
        excepY = checkNewPage(doc, excepY, invoice)
        excepY = printHematiesLine(doc, excepY, 'IDR-CV', String(hematiesEtConstantes.idr_cv.valeur), hematiesEtConstantes.idr_cv.unite || '', hematiesEtConstantes.idr_cv.reference || '')
      }

      excepY += 5
    }

    if (showLeucocytes) {
      excepY = checkNewPage(doc, excepY, invoice)
      doc.setFont('Times', 'bold')
      doc.text('LEUCOCYTES ET FORMULE', 25, excepY)
      excepY += 7
      doc.setFont('Times', 'normal')

      const { gb, neut, lymph, mono, eo, baso, plt, proerythroblastes, erythroblastes, myeloblastes, promyelocytes, myelocytes, metamyelocytes, monoblastes, lymphoblastes } = leucocytesEtFormules

      if (gb?.valeur) {
        excepY = checkNewPage(doc, excepY, invoice)
        excepY = printLeucocytesLine(doc, excepY, 'Leucocytes', null, String(gb.valeur), gb.unite || '', gb.reference || '')
      }
      if (neut?.valeur || neut?.pourcentage) {
        excepY = checkNewPage(doc, excepY, invoice)
        let p = neut?.pourcentage ? String(neut.pourcentage) : null
        let v = neut?.valeur ? String(neut.valeur) : ''
        excepY = printLeucocytesLine(doc, excepY, 'Neutrophiles', p, v, neut.unite || '', neut.referencePourcentage || '')
      }
      if (lymph?.valeur || lymph?.pourcentage) {
        excepY = checkNewPage(doc, excepY, invoice)
        let p = lymph?.pourcentage ? String(lymph.pourcentage) : null
        let v = lymph?.valeur ? String(lymph.valeur) : ''
        excepY = printLeucocytesLine(doc, excepY, 'Lymphocytes', p, v, lymph.unite || '', lymph.referencePourcentage || '')
      }
      if (mono?.valeur || mono?.pourcentage) {
        excepY = checkNewPage(doc, excepY, invoice)
        let p = mono?.pourcentage ? String(mono.pourcentage) : null
        let v = mono?.valeur ? String(mono.valeur) : ''
        excepY = printLeucocytesLine(doc, excepY, 'Monocytes', p, v, mono.unite || '', mono.referencePourcentage || '')
      }
      if (eo?.valeur || eo?.pourcentage) {
        excepY = checkNewPage(doc, excepY, invoice)
        let p = eo?.pourcentage ? String(eo.pourcentage) : null
        let v = eo?.valeur ? String(eo.valeur) : ''
        excepY = printLeucocytesLine(doc, excepY, 'Eosinophiles', p, v, eo.unite || '', eo.referencePourcentage || '')
      }
      if (baso?.valeur || baso?.pourcentage) {
        excepY = checkNewPage(doc, excepY, invoice)
        let p = baso?.pourcentage ? String(baso.pourcentage) : null
        let v = baso?.valeur ? String(baso.valeur) : ''
        excepY = printLeucocytesLine(doc, excepY, 'Basophiles', p, v, baso.unite || '', baso.referencePourcentage || '')
      }

      excepY += 8
      excepY = checkNewPage(doc, excepY, invoice)
      doc.setFont('Times', 'bold')
      doc.text('PLAQUETTES', 25, excepY)
      excepY += 5

      if (plt?.valeur) {
        doc.setFont('Times', 'normal')
        excepY = printLeucocytesLine(doc, excepY, 'Plaquettes', null, String(plt.valeur), plt.unite || '', plt.reference || '')
      }

      excepY += 7
      excepY = checkNewPage(doc, excepY, invoice)
      doc.setFont('Times', 'bold')
      doc.text('AUTRES', 25, excepY)
      excepY += 7
      doc.setFont('Times', 'normal')

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

      for (const item of immatures) {
        const obj = leucocytesEtFormules[item.key]
        if (obj?.valeur || obj?.pourcentage) {
          excepY = checkNewPage(doc, excepY, invoice)
          let p = obj?.pourcentage ? String(obj.pourcentage) : null
          let v = obj?.valeur ? String(obj.valeur) : ''
          excepY = printLeucocytesLine(doc, excepY, item.label, p, v, obj.unite || '', obj.referencePourcentage || '')
        }
      }

      excepY += 5
    }

    return excepY
  }

  const renderPsaRapportException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)

    if (test.exceptions.psaRapport.psaLibre?.valeur) {
      doc.text(`PSA libre : ${test.exceptions.psaRapport.psaLibre.valeur} ${test.exceptions.psaRapport.psaLibre.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.psaRapport.psaTotal?.valeur) {
      doc.text(`PSA total : ${test.exceptions.psaRapport.psaTotal.valeur} ${test.exceptions.psaRapport.psaTotal.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.psaRapport.rapport?.valeur) {
      doc.setFont('Times', 'bold')
      doc.text(`Rapport calculé : ${test.exceptions.psaRapport.rapport.valeur} ${test.exceptions.psaRapport.rapport.unite}`, 25, excepY)
      doc.setFont('Times', 'normal')
      excepY += 10
    }

    return excepY
  }

  const renderReticulocytesException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)

    if (test.exceptions.reticulocytes.reticulocytes?.valeur) {
      doc.text(`Réticulocytes (%) : ${test.exceptions.reticulocytes.reticulocytes.valeur} ${test.exceptions.reticulocytes.reticulocytes.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.reticulocytes.hematiesParMicrolitre?.valeur) {
      doc.text(`GR : ${test.exceptions.reticulocytes.hematiesParMicrolitre.valeur} ${test.exceptions.reticulocytes.hematiesParMicrolitre.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.reticulocytes.valeurAbsolue?.valeur) {
      doc.setFont('Times', 'bold')
      doc.text(`Valeur absolue : ${test.exceptions.reticulocytes.valeurAbsolue.valeur} ${test.exceptions.reticulocytes.valeurAbsolue.unite}`, 25, excepY)
      doc.setFont('Times', 'normal')
      excepY += 10
    }

    return excepY
  }

  const renderClairanceCreatinineException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)

    if (test.exceptions.clairanceCreatinine.creatininemie?.valeur) {
      doc.text(`Créatininémie : ${test.exceptions.clairanceCreatinine.creatininemie.valeur} ${test.exceptions.clairanceCreatinine.creatininemie.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.clairanceCreatinine.creatininurie?.valeur) {
      doc.text(`Créatininurie : ${test.exceptions.clairanceCreatinine.creatininurie.valeur} ${test.exceptions.clairanceCreatinine.creatininurie.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.clairanceCreatinine.volume?.valeur) {
      doc.text(`Volume : ${test.exceptions.clairanceCreatinine.volume.valeur} ${test.exceptions.clairanceCreatinine.volume.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.clairanceCreatinine.clairance?.valeur) {
      doc.setFont('Times', 'bold')
      doc.text(`Clairance calculée : ${test.exceptions.clairanceCreatinine.clairance.valeur} ${test.exceptions.clairanceCreatinine.clairance.unite}`, 25, excepY)
      doc.setFont('Times', 'normal')
      excepY += 10
    }

    return excepY
  }

  const renderDfgException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)

    if (test.exceptions.dfg.creatininemie?.valeur) {
      doc.text(`Créatininémie : ${test.exceptions.dfg.creatininemie.valeur} ${test.exceptions.dfg.creatininemie.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.dfg.dfgValue?.valeur) {
      doc.setFont('Times', 'bold')
      doc.text(`DFG (CKD-EPI) : ${test.exceptions.dfg.dfgValue.valeur} ${test.exceptions.dfg.dfgValue.unite}`, 25, excepY)
      doc.setFont('Times', 'normal')
      excepY += 7

      // Interprétation sous forme de tableau si elle existe
      if (test.testId?.interpretationA || test.testId?.interpretationB) {
        const interpretation = test.statutMachine ? test.testId.interpretationA : test.testId.interpretationB
        
        if (interpretation && interpretation.type === 'table') {
          excepY = checkSpace(doc, excepY, 40, invoice)
          doc.setFont('Times', 'bold')
          doc.text('Interprétation:', 25, excepY)
          excepY += 5
          
          doc.setFontSize(8)
          interpretation.content.columns.forEach((col, colIndex) => {
            doc.text(col, 25 + colIndex * 60, excepY)
          })
          excepY += 5

          doc.setFont('Times', 'normal')
          interpretation.content.rows.forEach((row) => {
            excepY = checkNewPage(doc, excepY, invoice)
            row.forEach((cell, cellIndex) => {
              doc.text(cell, 25 + cellIndex * 60, excepY)
            })
            excepY += 5
          })
          doc.setFontSize(9)
          excepY += 5
        }
      }
    }

    return excepY
  }

  const renderSaturationTransferrineException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)

    if (test.exceptions.saturationTransferrine.fer?.valeur) {
      doc.text(`Fer sérique : ${test.exceptions.saturationTransferrine.fer.valeur} ${test.exceptions.saturationTransferrine.fer.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.saturationTransferrine.ctf?.valeur) {
      doc.text(`Capacité totale de fixation : ${test.exceptions.saturationTransferrine.ctf.valeur} ${test.exceptions.saturationTransferrine.ctf.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.saturationTransferrine.coefficient?.valeur) {
      doc.setFont('Times', 'bold')
      doc.text(`Coefficient de saturation : ${test.exceptions.saturationTransferrine.coefficient.valeur} ${test.exceptions.saturationTransferrine.coefficient.unite}`, 25, excepY)
      doc.setFont('Times', 'normal')
      excepY += 10
    }

    return excepY
  }

  const renderCompteAddisException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)

    if (test.exceptions.compteAddis.volume?.valeur) {
      doc.text(`Volume : ${test.exceptions.compteAddis.volume.valeur} ${test.exceptions.compteAddis.volume.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.compteAddis.leucocytesParMinute?.valeur) {
      doc.setFont('Times', 'bold')
      doc.text(`Leucocytes/min : ${test.exceptions.compteAddis.leucocytesParMinute.valeur} ${test.exceptions.compteAddis.leucocytesParMinute.unite}`, 25, excepY)
      doc.setFont('Times', 'normal')
      excepY += 5
    }

    if (test.exceptions.compteAddis.hematiesParMinute?.valeur) {
      doc.setFont('Times', 'bold')
      doc.text(`Hématies/min : ${test.exceptions.compteAddis.hematiesParMinute.valeur} ${test.exceptions.compteAddis.hematiesParMinute.unite}`, 25, excepY)
      doc.setFont('Times', 'normal')
      excepY += 10
    }

    return excepY
  }

  const renderCalciumCorrigeException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)

    if (test.exceptions.calciumCorrige.calciumCorrige?.valeur) {
      doc.setFont('Times', 'bold')
      doc.text(`Calcium corrigé : ${test.exceptions.calciumCorrige.calciumCorrige.valeur} ${test.exceptions.calciumCorrige.calciumCorrige.unite}`, 25, excepY)
      doc.setFont('Times', 'normal')
      excepY += 10
    }

    return excepY
  }

  const renderRapportAlbuminurieException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)

    if (test.exceptions.rapportAlbuminurie.albumineUrinaire?.valeur) {
      doc.text(`Albumine urinaire : ${test.exceptions.rapportAlbuminurie.albumineUrinaire.valeur} ${test.exceptions.rapportAlbuminurie.albumineUrinaire.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.rapportAlbuminurie.creatinineUrinaire?.valeur) {
      doc.text(`Créatinine urinaire : ${test.exceptions.rapportAlbuminurie.creatinineUrinaire.valeur} ${test.exceptions.rapportAlbuminurie.creatinineUrinaire.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.rapportAlbuminurie.rapport?.valeur) {
      doc.setFont('Times', 'bold')
      doc.text(`Rapport calculé : ${test.exceptions.rapportAlbuminurie.rapport.valeur} ${test.exceptions.rapportAlbuminurie.rapport.unite}`, 25, excepY)
      doc.setFont('Times', 'normal')
      excepY += 7
      
      if (test.testId?.interpretationA || test.testId?.interpretationB) {
        const interpretation = test.statutMachine ? test.testId.interpretationA : test.testId.interpretationB
        
        if (interpretation && interpretation.type === 'text') {
          excepY = checkNewPage(doc, excepY, invoice)
          doc.setFont('Times', 'bold')
          doc.text('Interprétation:', 25, excepY)
          excepY += 5
          
          doc.setFont('Times', 'normal')
          doc.setFontSize(8)
          const interpLines = doc.splitTextToSize(interpretation.content, 160)
          doc.text(interpLines, 25, excepY)
          excepY += interpLines.length * 4 + 5
          doc.setFontSize(9)
        }
      }
    }

    return excepY
  }

  const renderRapportProteinesException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)

    if (test.exceptions.rapportProteines.proteinesUrinaires?.valeur) {
      doc.text(`Protéines urinaires : ${test.exceptions.rapportProteines.proteinesUrinaires.valeur} ${test.exceptions.rapportProteines.proteinesUrinaires.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.rapportProteines.creatinineUrinaire?.valeur) {
      doc.text(`Créatinine urinaire : ${test.exceptions.rapportProteines.creatinineUrinaire.valeur} ${test.exceptions.rapportProteines.creatinineUrinaire.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.rapportProteines.rapport?.valeur) {
      doc.setFont('Times', 'bold')
      doc.text(`Rapport calculé : ${test.exceptions.rapportProteines.rapport.valeur} ${test.exceptions.rapportProteines.rapport.unite}`, 25, excepY)
      doc.setFont('Times', 'normal')
      excepY += 10
    }

    return excepY
  }

  const renderCholesterolLdlException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)

    if (test.exceptions.cholesterolLdl.ldl?.valeur) {
      doc.setFont('Times', 'bold')
      doc.text(`LDL Dosé: ${test.exceptions.cholesterolLdl.ldl.valeur} ${test.exceptions.cholesterolLdl.ldl.unite}`, 25, excepY)
      doc.setFont('Times', 'normal')
      excepY += 5
      
      doc.setFontSize(7)
      doc.text('* Valable si triglycérides < 3.5 g/L', 25, excepY)
      doc.setFontSize(9)
      excepY += 7
    }

    return excepY
  }

  const renderLipidesTotauxException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)

    if (test.exceptions.lipidesTotaux.cholesterolTotal?.valeur) {
      doc.text(`Cholestérol total : ${test.exceptions.lipidesTotaux.cholesterolTotal.valeur} ${test.exceptions.lipidesTotaux.cholesterolTotal.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.lipidesTotaux.triglycerides?.valeur) {
      doc.text(`Triglycérides : ${test.exceptions.lipidesTotaux.triglycerides.valeur} ${test.exceptions.lipidesTotaux.triglycerides.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.lipidesTotaux.phospholipides?.valeur) {
      doc.text(`Phospholipides : ${test.exceptions.lipidesTotaux.phospholipides.valeur} ${test.exceptions.lipidesTotaux.phospholipides.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.lipidesTotaux.lipidesTotaux?.valeur) {
      doc.setFont('Times', 'bold')
      doc.text(`Lipides totaux calculés : ${test.exceptions.lipidesTotaux.lipidesTotaux.valeur} ${test.exceptions.lipidesTotaux.lipidesTotaux.unite}`, 25, excepY)
      doc.setFont('Times', 'normal')
      excepY += 10
    }

    return excepY
  }

  const renderMicroalbuminurie24hException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)

    if (test.exceptions.microalbuminurie24h.albumineUrinaire?.valeur) {
      doc.text(`Albumine urinaire : ${test.exceptions.microalbuminurie24h.albumineUrinaire.valeur} ${test.exceptions.microalbuminurie24h.albumineUrinaire.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.microalbuminurie24h.volumeUrinaire24h?.valeur) {
      doc.text(`Volume urinaire 24h : ${test.exceptions.microalbuminurie24h.volumeUrinaire24h.valeur} ${test.exceptions.microalbuminurie24h.volumeUrinaire24h.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.microalbuminurie24h.microalbuminurie?.valeur) {
      doc.setFont('Times', 'bold')
      doc.text(`Microalbuminurie calculée : ${test.exceptions.microalbuminurie24h.microalbuminurie.valeur} ${test.exceptions.microalbuminurie24h.microalbuminurie.unite}`, 25, excepY)
      doc.setFont('Times', 'normal')
      excepY += 10
    }

    return excepY
  }

  const renderProteinurie24hException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)

    if (test.exceptions.proteinurie24h.proteinesUrinaires?.valeur) {
      doc.text(`Protéines urinaires : ${test.exceptions.proteinurie24h.proteinesUrinaires.valeur} ${test.exceptions.proteinurie24h.proteinesUrinaires.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.proteinurie24h.volumeUrinaire24h?.valeur) {
      doc.text(`Volume urinaire 24h : ${test.exceptions.proteinurie24h.volumeUrinaire24h.valeur} ${test.exceptions.proteinurie24h.volumeUrinaire24h.unite}`, 25, excepY)
      excepY += 5
    }

    if (test.exceptions.proteinurie24h.proteinurie?.valeur) {
      doc.setFont('Times', 'bold')
      doc.text(`Protéinurie calculée : ${test.exceptions.proteinurie24h.proteinurie.valeur} ${test.exceptions.proteinurie24h.proteinurie.unite}`, 25, excepY)
      doc.setFont('Times', 'normal')
      excepY += 10
    }

    return excepY
  }

  const renderBilirubineIndirecteException = (doc, test, excepY, invoice) => {
    excepY = checkNewPage(doc, excepY, invoice)
    doc.setFont('Times', 'normal')
    doc.setFontSize(9)

    if (test.exceptions.bilirubineIndirecte.bilirubineIndirecte?.valeur) {
      doc.setFont('Times', 'bold')
      doc.text(`Bilirubine indirecte: ${test.exceptions.bilirubineIndirecte.bilirubineIndirecte.valeur} ${test.exceptions.bilirubineIndirecte.bilirubineIndirecte.unite}`, 25, excepY)
      doc.setFont('Times', 'normal')
      excepY += 10
    }

    return excepY
  }

  const renderInterpretation = (doc, test, currentY, invoice) => {
    const interpretation = test.statutMachine ? test.testId.interpretationA : test.testId.interpretationB

    if (!interpretation) return currentY

    let interpretationHeight = 0
    let interpretationLines = []

    if (interpretation.type === 'text') {
      interpretationLines = doc.splitTextToSize(interpretation.content, 100)
      interpretationHeight = 5 * interpretationLines.length + 10
    } else if (interpretation.type === 'table') {
      const { rows } = interpretation.content
      interpretationHeight = 5 + rows.length * 5 + 10
    }

    // Vérifier qu'on a assez d'espace
    currentY = checkSpace(doc, currentY, interpretationHeight, invoice)

    doc.setFontSize(10)
    doc.setFont('Times', 'bold')
    doc.text('Interprétation:', 20, currentY)
    currentY += 5

    if (interpretation.type === 'text') {
      doc.setFontSize(9)
      doc.setFont('Courier', 'normal')
      doc.text(interpretationLines, 20, currentY)
      currentY += interpretationHeight
    } else if (interpretation.type === 'table') {
      doc.setFontSize(9)
      doc.setFont('Times', 'bold')
      interpretation.content.columns.forEach((col, colIndex) => {
        doc.text(col, 20 + colIndex * 40, currentY)
      })
      currentY += 5

      doc.setFont('Times', 'normal')
      interpretation.content.rows.forEach((row) => {
        currentY = checkNewPage(doc, currentY, invoice)
        row.forEach((cell, cellIndex) => {
          doc.text(cell, 20 + cellIndex * 40, currentY)
        })
        currentY += 5
      })
    }

    return currentY
  }

  const renderObservations = (doc, test, currentY, invoice) => {
    const positionX = 100
    const formattedDate = formatDateAndTime(test?.datePrelevement)

    if (test?.observations?.macroscopique?.length > 0) {
      currentY = checkNewPage(doc, currentY, invoice)
      doc.setFontSize(9)
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
      doc.setFontSize(8)
      doc.setFont('Times', 'italic')
      doc.text(`Remarque: ${test.remarque}`, 20, currentY)
      currentY += 5
    }

    currentY += 5

    if (test.culture && Array.isArray(test.culture.germeIdentifie)) {
      currentY = renderAntibiograms(doc, test, currentY, invoice)
    }

    return currentY
  }

  const renderMacroscopicExam = (doc, test, currentY, positionX, invoice) => {
    currentY = checkNewPage(doc, currentY, invoice)
    
    doc.setFontSize(10)
    doc.setFont('Times', 'bold')
    doc.text(`EXAMEN MACROSCOPIQUE`, 20, currentY)
    currentY += 6
    
    doc.setFontSize(9)
    doc.setFont('Times', 'normal')

    if (Array.isArray(test?.observations?.macroscopique) && test.observations.macroscopique.length > 0) {
      const macroscopiqueText = test.observations.macroscopique.join(', ')
      const lines = doc.splitTextToSize(`${test?.typePrelevement} : ${macroscopiqueText}`, 170)
      doc.text(lines, 20, currentY)
      currentY += lines.length * 5 + 3
    }

    return currentY
  }

  const renderMicroscopicExam = (doc, test, currentY, positionX, invoice) => {
    currentY = checkNewPage(doc, currentY, invoice)
    
    doc.setFontSize(10)
    doc.setFont('Times', 'bold')
    doc.text(`EXAMEN CYTOLOGIQUE`, 20, currentY)
    currentY += 6
    
    doc.setFontSize(9)
    doc.setFont('Times', 'normal')

    const microscopicParams = [
      { label: 'Leucocytes', key: 'leucocytes', units: true },
      { label: 'Hématies', key: 'hematies', units: true },
      { label: 'pH', key: 'ph', units: false },
      { label: 'Cellules épithéliales', key: 'cellulesEpitheliales', units: false },
      { label: 'Éléments levuriformes', key: 'elementsLevuriforme', units: false },
      { label: 'Filaments mycéliens', key: 'filamentsMyceliens', units: false },
      { label: 'Trichomonas vaginalis', key: 'trichomonasVaginalis', units: false },
      { label: 'Cristaux', key: 'cristaux', units: false, details: 'cristauxDetails' },
      { label: 'Cylindres', key: 'cylindres', units: false },
      { label: 'Parasites', key: 'parasites', units: false, details: 'parasitesDetails' },
      { label: 'Trichomonas intestinales', key: 'trichomonasIntestinales', units: false },
      { label: 'Œufs de Bilharzies', key: 'oeufsDeBilharzies', units: false },
      { label: 'Clue Cells', key: 'clueCells', units: false },
      { label: 'Gardnerella vaginalis', key: 'gardnerellaVaginalis', units: false },
      { label: 'Bacilles de Doderlein', key: 'bacillesDeDoderlein', units: false },
      { label: 'Type de Flore', key: 'typeDeFlore', units: false },
      { label: 'Recherche de Streptocoque B', key: 'rechercheDeStreptocoqueB', units: false },
      { label: 'Monocytes', key: 'monocytes', units: false, percentage: true },
      { label: 'Polynucléaires neutrophiles altérées', key: 'polynucleairesNeutrophilesAlterees', units: false, percentage: true },
      { label: 'Polynucléaires neutrophiles non altérées', key: 'polynucleairesNeutrophilesNonAlterees', units: false, percentage: true },
      { label: 'Éosinophiles', key: 'eosinophiles', units: false, percentage: true },
      { label: 'Basophiles', key: 'basophiles', units: false, percentage: true },
    ]

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

        if (param.details && test.observations.microscopique[param.details] && test.observations.microscopique[param.details].length > 0) {
          const detailsText = test.observations.microscopique[param.details].join(', ')
          doc.setFontSize(7)

          const maxWidth = 85
          const splitText = doc.splitTextToSize(`(${detailsText})`, maxWidth)

          splitText.forEach((line, index) => {
            currentY = checkNewPage(doc, currentY, invoice)
            doc.text(line, positionX + 5, currentY + (index === 0 ? 0 : index * 4))
          })

          currentY += (splitText.length - 1) * 4
          doc.setFontSize(9)
        }

        currentY += 5
      }
    }

    currentY += 3
    return currentY
  }

  const renderChemistryExam = (doc, test, currentY, positionX, invoice) => {
    const { proteinesTotales, proteinesArochies, glycorachie, acideUrique, LDH } = test.observations.chimie

    if (!proteinesTotales && !proteinesArochies && !glycorachie && !acideUrique && !LDH) {
      return currentY
    }

    currentY = checkNewPage(doc, currentY, invoice)
    doc.setFontSize(10)
    doc.setFont('Times', 'bold')
    doc.text(`CHIMIE`, 20, currentY)
    currentY += 5
    doc.setFontSize(10)
    doc.setFont('Times', 'normal')

    const chemistryParams = [
      { label: 'Proteines Totales', key: 'proteinesTotales', unit: 'g/L', reference: '' },
      { label: 'Proteines Arochies', key: 'proteinesArochies', unit: 'g/L', reference: '(0,2-0,4)' },
      { label: 'Glycorachie', key: 'glycorachie', unit: 'g/L', reference: '(0,2-0,4)' },
      { label: 'Acide Urique', key: 'acideUrique', unit: 'mg/L', reference: '' },
      { label: 'LDH', key: 'LDH', unit: 'U/I', reference: '' },
    ]

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

    currentY += 2
    return currentY
  }

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

  const renderCultureExam = (doc, test, currentY, positionX, invoice) => {
    const { culture, germeIdentifie, description } = test.culture

    if (!culture && (!Array.isArray(germeIdentifie) || germeIdentifie.length === 0) && !description) {
      return currentY
    }

    currentY = checkNewPage(doc, currentY, invoice)
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
    doc.setFontSize(10)
    doc.setFont('Times', 'bold')
    doc.text('RECHERCHE DE CHLAMYDIA', 20, currentY)
    currentY += 5
    doc.setFontSize(10)
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
    doc.setFontSize(10)
    doc.setFont('Times', 'bold')
    doc.text('RECHERCHE DE MYCOPLASMES', 20, currentY)
    currentY += 5
    doc.setFontSize(10)
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

  const renderAntibiograms = (doc, test, currentY, invoice) => {
    for (const germe of test.culture.germeIdentifie) {
      if (Object.keys(germe.antibiogramme).length === 0) {
        continue
      }

      doc.addPage()
      addFooter(doc, getColorValue('gris'))
      currentY = addPageHeader(doc, invoice)

      doc.setFontSize(10)
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
    let currentY = 250

    const validatedHistory = invoice.historiques.find((h) => h.status === 'Validé')

    if (validatedHistory && validatedHistory.updatedBy) {
      const validatedBy = `${validatedHistory.updatedBy.prenom} ${validatedHistory.updatedBy.nom}`

      doc.setFontSize(10)
      doc.setFont('Times', 'bold')
      doc.text(`Validé par: ${validatedBy}`, 110, currentY)

      doc.setFont('Times', 'normal')
      doc.setFontSize(8)

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
          console.error('Erreur lors du chargement du logo du validateur:', error)
        }
      }
    }
  }

  const generatePDF = async () => {
    try {
      const doc = new jsPDF()
      const userColor = getColorValue('gris')

      const [imgLeft] = await Promise.all([
        loadImage(logoLeft),
        loadImage(logoRight),
      ])

      await setupDocumentHeader(doc, imgLeft, userColor)
      await addPatientInformation(doc, invoice)
      await addTestResults(doc, invoice)
      await addValidationInfo(doc, invoice)

      addPageNumbers(doc)

      const blob = doc.output('blob')
      const url = URL.createObjectURL(blob)
      window.open(`/pdf-viewer?pdfBlobUrl=${encodeURIComponent(url)}`, '_blank')
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