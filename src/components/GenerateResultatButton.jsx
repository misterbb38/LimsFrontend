

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload, faFileWord } from '@fortawesome/free-solid-svg-icons'
import jsPDF from 'jspdf'
import PropTypes from 'prop-types'
import logoLeft from '../images/bioramlogo.png'
import { formatAgeSexe } from '../utils/age'
import {
  renderResultatPdf,
  getValidation,
  sortResultsByCategory,
  upperNoAccent,
  GERMES,
  GERMES_REGEX,
} from '../utils/resultatPdf'

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
  // Toute la mise en page est dans utils/resultatPdf.js (moteur a flux
  // mesure, module pur). Ce composant ne fait que charger les images.
  const buildPdfBlob = async () => {
    // S'assure que le profil labo est charge AVANT de generer le PDF.
    await ensureUserLoaded()
    const doc = new jsPDF()

    const asAsset = (img) => ({ data: img, width: img.width, height: img.height })

    let logo = null
    try {
      logo = asAsset(await loadImage(logoLeft))
    } catch (error) {
      console.error('Erreur lors du chargement du logo :', error)
    }

    // Signature / cachet du biologiste validant (validation finale seule).
    let signature = null
    const validation = getValidation(invoice)
    if (validation && !validation.isTechnical && validation.validator.logo) {
      try {
        const rawPath = String(validation.validator.logo).replace(/\\/g, '/')
        const fullLogoPath = rawPath.startsWith('http')
          ? rawPath
          : `${import.meta.env.VITE_APP_API_BASE_URL}/${rawPath}`
        signature = asAsset(await loadImage(fullLogoPath))
      } catch (error) {
        console.error('Erreur lors du chargement de la signature :', error)
      }
    }

    renderResultatPdf(doc, invoice, { logo, signature })
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

  // ============================================================
  // EXPORT WORD (.docx) — voir generateWord plus bas (librairie docx).
  // L'ancienne approche HTML/MHTML a ete remplacee : elle dupliquait
  // l'en-tete/pied en bas de la derniere page dans Word.
  // ============================================================

  // Telecharge le resultat au format Word (.docx) genere avec la
  // librairie docx : VRAI document Word, avec en-tete et pied de page
  // repetes sur chaque page SANS duplication (contrairement au MHTML),
  // et images embarquees proprement.
  const generateWord = async () => {
    try {
      await ensureUserLoaded()
      const {
        Document, Packer, Paragraph, TextRun, ImageRun, Header, Footer,
        Table, TableRow, TableCell, AlignmentType, BorderStyle, WidthType,
        PageNumber, TabStopType, UnderlineType, convertMillimetersToTwip,
      } = await import('docx')

      const FONT = 'Courier New'
      const SERIF = 'Times New Roman'
      const CENTER = AlignmentType.CENTER
      const RIGHT_TAB = convertMillimetersToTwip(174) // largeur utile

      const sanitize = (v) =>
        v == null ? '' : String(v).replace(/≥/g, '>=').replace(/≤/g, '<=').replace(/(\d)\.(\d)/g, '$1,$2')
      const safe = (v) => {
        if (v == null) return ''
        const s = String(v).trim()
        return s === '' || s === 'null' || s === 'undefined' ? '' : s
      }

      // Decoupe un texte et met les germes latins en italique (comme le PDF).
      const runs = (text, opts = {}) =>
        String(sanitize(text))
          .split(GERMES_REGEX)
          .filter((p) => p !== '')
          .map(
            (p) =>
              new TextRun({
                text: p,
                italics: opts.italics || GERMES.includes(p),
                bold: opts.bold,
                font: opts.font || FONT,
                size: opts.size || 18,
              })
          )
      const tr = (text, opts = {}) =>
        new TextRun({
          text: String(text),
          bold: opts.bold,
          italics: opts.italics,
          font: opts.font || FONT,
          size: opts.size || 18,
          underline: opts.underline,
        })
      const par = (children, opts = {}) =>
        new Paragraph({
          children,
          alignment: opts.align,
          spacing: opts.spacing,
          border: opts.border,
          tabStops: opts.tabStops,
        })

      // Recupere une image -> { data, type, width, height } en gardant le ratio.
      const fetchImg = async (src, targetW) => {
        try {
          const res = await fetch(src)
          const blob = await res.blob()
          const data = new Uint8Array(await blob.arrayBuffer())
          const objUrl = URL.createObjectURL(blob)
          const im = await loadImage(objUrl)
          URL.revokeObjectURL(objUrl)
          const ratio = im.height && im.width ? im.height / im.width : 1
          const type = /png/i.test(blob.type) ? 'png' : /jpe?g/i.test(blob.type) ? 'jpg' : 'png'
          return { data, type, width: targetW, height: Math.max(1, Math.round(targetW * ratio)) }
        } catch {
          return null
        }
      }
      const imgPara = (img, align) =>
        new Paragraph({
          alignment: align,
          children: [
            new ImageRun({ data: img.data, type: img.type, transformation: { width: img.width, height: img.height } }),
          ],
        })

      // ---- EN-TETE (repete sur chaque page) ----
      // Espacement de paragraphe a 0 (HSP) pour compacter l'en-tete :
      // sinon les espacements par defaut le rendent haut et il remplit
      // toute la marge, ne laissant aucun espace avant le contenu.
      const HSP = { before: 0, after: 0 }
      const logoImg = await fetchImg(logoLeft, 62)
      const headLine = (text, opts) =>
        new Paragraph({ alignment: CENTER, spacing: HSP, children: [tr(text, opts)] })
      const headerChildren = []
      if (logoImg)
        headerChildren.push(
          new Paragraph({
            alignment: CENTER,
            spacing: HSP,
            children: [new ImageRun({ data: logoImg.data, type: logoImg.type, transformation: { width: logoImg.width, height: logoImg.height } })],
          })
        )
      headerChildren.push(headLine("LABORATOIRE D'ANALYSES MEDICALES", { bold: true, font: SERIF, size: 24 }))
      headerChildren.push(headLine('Hématologie – Immuno-Hématologie – Biochimie – Immunologie – Bactériologie – Virologie – Parasitologie', { font: SERIF, size: 14 }))
      headerChildren.push(headLine('24H/24 7J/7 — Prélèvement à domicile sur rendez-vous', { font: SERIF, size: 14 }))
      headerChildren.push(headLine('Tel. 78 601 09 09 / 33 836 99 98 — email : contact@bioram.org', { font: SERIF, size: 14 }))

      // ---- PIED (repete) avec numero de page ----
      const footerChildren = [
        par([tr('Rufisque Ouest, rond-point SOCABEG vers cité SIPRES - Sortie 9 autoroute à péage Dakar Sénégal Aut. minist. n° 013545-28/03/19', { font: SERIF, size: 14 })], { align: CENTER }),
        par([tr('Site web : www.bioram.org   Tel. 78 601 09 09   email : contact@bioram.org', { font: SERIF, size: 14 })], { align: CENTER }),
        new Paragraph({
          alignment: CENTER,
          children: [
            tr('RC/SN-DKR-2019 B 13431 - NINEA 0073347059 2E2   —   Page ', { font: SERIF, size: 14 }),
            new TextRun({ children: [PageNumber.CURRENT], font: SERIF, size: 14 }),
          ],
        }),
      ]

      // ---- DONNEES PATIENT ----
      const u = invoice.userId
      const nomComplet = `${(u.prenom || '').toUpperCase()} ${(u.nom || '').toUpperCase()}`.trim()
      // Age : gere les nouveau-nes (mois/jours) via la date de naissance.
      // Age + sexe combines : "27 ans / F".
      const ageSexeDisplay = formatAgeSexe(u.dateNaissance, u.age, u.sexe)
      const formatTel = (raw) => {
        if (!raw) return ''
        let d = String(raw).replace(/\D/g, '')
        if (d.startsWith('221')) d = d.slice(3)
        if (d.length !== 9) return raw
        return `${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`
      }
      const dateDossier = formatDate(invoice?.createdAt)

      const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
      const noBorders = { top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER }
      const infoCell = (lines, w) =>
        new TableCell({
          width: { size: w, type: WidthType.PERCENTAGE },
          borders: noBorders,
          children: lines.map((ln) => par([tr(ln, { bold: true, size: 20 })])),
        })

      const children = []
      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: noBorders,
          rows: [
            new TableRow({
              children: [
                infoCell(
                  [
                    `NIP: ${safe(u.nip)}`,
                    `Date: ${dateDossier}`,
                    ...(invoice?.prescripteur
                      ? [`Prescripteur: ${sanitize(invoice.prescripteur)}`]
                      : []),
                  ],
                  50
                ),
                infoCell([`Nº Dossier: ${safe(invoice?.identifiant)}`, `Nom: ${nomComplet}`, `Âge: ${ageSexeDisplay}`, `Tel: ${formatTel(u.telephone)}`], 50),
              ],
            }),
          ],
        })
      )

      // ---- helpers de rendu ----
      const sectionBanner = (txt) =>
        par([tr(upperNoAccent(txt), { bold: true, size: 24 })], {
          align: CENTER,
          spacing: { before: 200, after: 80 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' } },
        })
      const kv = (k, v) => par([tr(k + ' ', { size: 18 }), tr(sanitize(v), { size: 18 })])
      const kvGermes = (label, v) => par([...runs(label, { size: 18 }), tr(' ' + sanitize(v), { size: 18 })])
      const bactTitle = (txt) => par([tr(txt, { bold: true, size: 18 })], { spacing: { before: 100 } })
      const tCell = (txt, opts = {}) =>
        new TableCell({ children: [par([tr(txt, { bold: opts.bold, size: 18 })], { align: opts.align })] })

      const interpretationParas = (test) => {
        const out = []
        if (!test?.statutInterpretation) return out
        const it = test.statutMachine ? test.testId.interpretationA : test.testId.interpretationB
        if (!it) return out
        const content = it.content || {}
        const textBody = typeof content === 'string' ? content : content.text || ''
        const hasText = typeof textBody === 'string' && textBody.trim() !== ''
        const cols = Array.isArray(content.columns) ? content.columns : []
        const rows = Array.isArray(content.rows) ? content.rows : []
        const hasTable =
          cols.length > 0 && rows.length > 0 &&
          (cols.some((c) => c && String(c).trim() !== '') || rows.some((r) => Array.isArray(r) && r.some((c) => c && String(c).trim() !== '')))
        if (!hasText && !hasTable) return out
        out.push(par([tr('Interprétation:', { bold: true, size: 22 })], { spacing: { before: 60 } }))
        if (hasTable) {
          out.push(
            new Table({
              rows: [
                new TableRow({ children: cols.map((c) => tCell(sanitize(c), { bold: true })) }),
                ...rows.map((r) => new TableRow({ children: (Array.isArray(r) ? r : []).map((c) => tCell(sanitize(c))) })),
              ],
            })
          )
        }
        if (hasText) String(textBody).split(/\n/).forEach((line) => out.push(par(runs(line, { font: SERIF, size: 20 }))))
        return out
      }

      const observationParas = (test) => {
        const out = []
        if (test?.gram) {
          out.push(bactTitle('EXAMEN APRES COLORATION DE GRAM'))
          out.push(par([tr('Gram: ', { size: 18 }), tr(sanitize(test.gram), { size: 18 })]))
        }
        if (test?.culture) {
          const { culture, germeIdentifie, description } = test.culture
          const hasC = culture || (Array.isArray(germeIdentifie) && germeIdentifie.length > 0) || description
          if (hasC) {
            out.push(bactTitle('CULTURES SUR MILIEUX SPECIFIQUES:'))
            if (culture) out.push(kv('Cultures:', culture))
            if (Array.isArray(germeIdentifie) && germeIdentifie.length > 0)
              out.push(par([tr('Germe(s) Identifié(s): ', { size: 18 }), tr(germeIdentifie.map((g) => g.nom).join(', '), { italics: true, size: 18 })]))
            if (description) out.push(kv('Numeration:', description))
          }
        }
        const ch = test?.observations?.rechercheChlamydia
        if (ch && (ch.naturePrelevement || ch.rechercheAntigeneChlamydiaTrochomatis)) {
          out.push(bactTitle('RECHERCHE DE CHLAMYDIA'))
          if (ch.naturePrelevement) out.push(kv('Nature du prélèvement:', ch.naturePrelevement))
          if (ch.rechercheAntigeneChlamydiaTrochomatis) out.push(kvGermes("Recherche d'antigène de Chlamydia trachomatis:", ch.rechercheAntigeneChlamydiaTrochomatis))
        }
        const my = test?.observations?.rechercheMycoplasmes
        if (my && (my.naturePrelevement || my.rechercheUreaplasmaUrealyticum || my.rechercheMycoplasmaHominis)) {
          out.push(bactTitle('RECHERCHE DE MYCOPLASMES'))
          if (my.naturePrelevement) out.push(kv('Nature du prélèvement:', my.naturePrelevement))
          if (my.rechercheUreaplasmaUrealyticum) out.push(kvGermes("Recherche d'Ureaplasma urealyticum:", my.rechercheUreaplasmaUrealyticum))
          if (my.rechercheMycoplasmaHominis) out.push(kvGermes('Recherche de Mycoplasma hominis:', my.rechercheMycoplasmaHominis))
        }
        if (test?.conclusion) {
          out.push(par([tr('CONCLUSION', { bold: true, size: 22 })], { spacing: { before: 100 } }))
          out.push(par(runs(test.conclusion, { bold: true, font: SERIF, size: 22 })))
        }
        const germes = test?.culture?.germeIdentifie
        if (Array.isArray(germes)) {
          germes.forEach((g) => {
            const entries = Object.entries(g?.antibiogramme || {})
            if (!entries.length) return
            out.push(par([tr('ANTIBIOGRAMME : ', { bold: true, size: 22 }), tr(g.nom || '', { bold: true, italics: true, size: 22 })], { align: CENTER, spacing: { before: 120 } }))
            out.push(
              new Table({
                width: { size: 80, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({ children: [tCell('Antibiotique', { bold: true }), tCell('Sensibilité', { bold: true, align: CENTER })] }),
                  ...entries.map(([a, s]) => new TableRow({ children: [tCell(String(a)), tCell(String(s), { align: CENTER })] })),
                ],
              })
            )
            out.push(par([tr('S : Sensible    I : Intermédiaire     R : Résistant', { size: 18 })], { align: CENTER }))
          })
        }
        return out
      }

      // ---- CORPS : categories -> tests ----
      for (const group of sortResultsByCategory(invoice?.resultat || [])) {
        children.push(sectionBanner(group.category))
        for (const test of group.results) {
          if (!test || !test.testId) continue
          children.push(par([tr('● ' + upperNoAccent(test.testId.nom), { bold: true, size: 20 })], { spacing: { before: 80 } }))
          const hasMacro = test?.observations?.macroscopique?.length > 0
          if (!hasMacro) {
            const fd = formatDateAndTime(test?.datePrelevement)
            if (test?.typePrelevement) children.push(par([tr(`Prélèvement : ${fd}, ${sanitize(test.typePrelevement)}`, { size: 18 })]))
            const machineText = test?.statutMachine ? test?.testId?.machineA : test?.testId?.machineB
            const machineValue = test?.statutMachine ? test?.testId?.valeurMachineA : test?.testId?.valeurMachineB
            const mr = []
            if (machineText) mr.push(tr(sanitize(machineText), { italics: true, size: 18 }))
            if (test?.methode) mr.push(tr(` (${sanitize(test.methode)})`, { italics: true, size: 18 }))
            if (safe(machineValue)) {
              mr.push(tr('\t', { size: 18 }))
              mr.push(tr(`Réf: ${sanitize(machineValue)}`, { size: 18 }))
            }
            if (mr.length) children.push(new Paragraph({ children: mr, tabStops: [{ type: TabStopType.RIGHT, position: RIGHT_TAB }] }))
            if (safe(test?.valeur)) {
              let vt = sanitize(test.valeur)
              if (safe(test?.qualitatif)) vt += ` (${sanitize(test.qualitatif)})`
              children.push(par([tr(vt, { bold: true, size: 22 })], { align: CENTER, spacing: { before: 40, after: 40 } }))
            }
            if (safe(test?.remarque)) children.push(par([tr(`Commentaires: ${sanitize(test.remarque)}`, { italics: true, font: SERIF, size: 18 })]))
            interpretationParas(test).forEach((x) => children.push(x))
          }
          observationParas(test).forEach((x) => children.push(x))
        }
      }

      // ---- VALIDATION ----
      const finalV = invoice.historiques?.find((h) => h.status === 'Validé')
      const techV = invoice.historiques?.find((h) => h.status === 'Validation technique')
      const validation = finalV || techV
      if (validation && validation.updatedBy) {
        if (!finalV && techV) {
          children.push(par([tr('Validation technique', { bold: true, size: 24, underline: { type: UnderlineType.SINGLE } })], { align: CENTER, spacing: { before: 400 } }))
        } else {
          const val = validation.updatedBy
          children.push(par([tr(`${val.prenom || ''} ${val.nom || ''}`.trim(), { bold: true, font: SERIF, size: 20 })], { align: CENTER, spacing: { before: 500 } }))
          String(val.profil || '')
            .split(/\r?\n/)
            .filter((l) => l.trim() !== '')
            .forEach((l) => children.push(par([tr(l.trim(), { italics: true, font: SERIF, size: 20 })], { align: CENTER })))
          if (val.logo) {
            const raw = String(val.logo).replace(/\\/g, '/')
            const full = raw.startsWith('http') ? raw : `${import.meta.env.VITE_APP_API_BASE_URL}/${raw}`
            const sig = await fetchImg(full, 110)
            if (sig) children.push(imgPara(sig, CENTER))
          }
        }
      }

      // ---- DOCUMENT : en-tete/pied repetes via headers/footers ----
      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                size: { width: convertMillimetersToTwip(210), height: convertMillimetersToTwip(297) },
                margin: {
                  // Marge haute large : laisse un espace net entre l'en-tete
                  // (logo + labo) et le debut du contenu, sur chaque page.
                  top: convertMillimetersToTwip(46),
                  bottom: convertMillimetersToTwip(22),
                  left: convertMillimetersToTwip(18),
                  right: convertMillimetersToTwip(18),
                  header: convertMillimetersToTwip(8),
                  footer: convertMillimetersToTwip(8),
                },
              },
            },
            headers: { default: new Header({ children: headerChildren }) },
            footers: { default: new Footer({ children: footerChildren }) },
            children,
          },
        ],
      })

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const nom = `${invoice?.userId?.nom || 'patient'}`.replace(/\s+/g, '_')
      a.href = url
      a.download = `Resultat_${nom}_${invoice?.identifiant || ''}.docx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur lors de la génération du Word:', error)
      alert('Une erreur est survenue lors de la génération du Word.')
    }
  }

  // API imperative pour les composants externes (ShareResultatButton).
  useImperativeHandle(ref, () => ({ generatePdfBlob: buildPdfBlob }))

  return (
    <div className="flex gap-1">
      <button
        className="btn btn-primary btn-sm"
        onClick={generatePDF}
        title="Télécharger le PDF"
      >
        <FontAwesomeIcon icon={faDownload} />
      </button>
      <button
        className="btn btn-outline btn-sm"
        onClick={generateWord}
        title="Télécharger le Word éditable"
      >
        <FontAwesomeIcon icon={faFileWord} />
      </button>
    </div>
  )
})

GenerateResultatButton.propTypes = {
  invoice: PropTypes.object.isRequired,
}

export default GenerateResultatButton