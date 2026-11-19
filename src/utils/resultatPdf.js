// ============================================================================
// Rendu PDF du compte rendu de resultats d'analyses (jsPDF).
//
// Module PUR : aucune dependance a React, au DOM ou a import.meta. Il recoit
// un document jsPDF deja cree, le dossier (`invoice`) et les images deja
// chargees. Il peut donc etre execute tel quel sous Node pour les controles
// de mise en page (voir scripts/verifier-resultat-pdf.mjs).
//
// Principe de mise en page : MOTEUR A FLUX MESURE.
//  - Rien n'est dessine a une position Y codee en dur. Chaque element est une
//    "feuille" { h, draw(y) } dont la hauteur est MESUREE (retours a la ligne
//    compris) avant d'etre dessinee.
//  - Les feuilles sont regroupees ; un groupe qui tient dans la place restante
//    est dessine d'un bloc, un petit groupe qui ne tient pas passe entier a la
//    page suivante, un grand groupe est coupe ENTRE deux lignes en gardant le
//    titre avec ses premieres lignes et en repetant l'en-tete sur la suite.
//  - Une seule grille de colonnes pour tout le document (voir COL).
// ============================================================================
import { formatAgeSexe } from './age.js'

// ------------------------------- Geometrie ---------------------------------
const PAGE = {
  LEFT: 20,
  RIGHT: 190,
  FOOTER_Y: 277, // filet du pied de page
  BOTTOM: 272, // limite basse du contenu
  TOP_NEXT: 22, // debut du contenu sur les pages 2+
}

// Grille unique : Parametre | Resultat | Unite | Valeurs de reference | Anteriorite
const COL = {
  TITLE: 21, // titre du test et ligne "technique"
  LABEL: 25, // libelle d'un parametre
  LABEL_END: 86,
  VAL_L: 89, // resultat textuel : aligne a gauche ici
  VAL_R: 107.5, // resultat numerique : aligne a droite ici
  UNIT: 110,
  UNIT_END: 134,
  REF: 136,
  ANT: 173,
  END: 190,
}

// Un groupe plus petit que cette hauteur n'est jamais coupe entre deux pages.
const KEEP_MAX = 55
// Une fin de bloc plus courte que cette hauteur (mm) ne part jamais seule sur
// la page suivante (couvre aussi le bloc de validation avec signature).
const TAIL_MIN = 48
// Un sous-bloc insecable plus petit que cette hauteur reste entier avec le
// titre qui le precede ; plus grand, il est coupe apres ses premieres lignes.
const LEAD_BLOCK_MAX = 35
// Un petit bloc et la fin courte qui le suit passent ensemble a la page
// suivante tant que leur hauteur totale ne depasse pas cette valeur.
const KEEP_TAIL_MAX = 60

const PT = 0.3528 // 1 point en mm
const LH = (size) => size * PT * 1.3 // interligne
const ASC = (size) => size * PT * 0.8 // distance haut de ligne -> ligne de base

// ------------------------------ Texte / donnees ----------------------------
/** Valeur affichable : '' pour null / undefined / 'null' / 'undefined'. */
export const clean = (v) => {
  if (v === null || v === undefined) return ''
  const s = String(v).trim()
  return s === 'null' || s === 'undefined' ? '' : s
}

/**
 * Prepare un texte pour les polices standard du PDF (WinAnsi) :
 *  - decimales a la francaise ("2.4" -> "2,4") ;
 *  - symboles absents de ces polices remplaces par un equivalent lisible.
 * Applique AVANT la mesure pour que mesure et rendu portent sur le meme texte.
 */
export const sanitize = (v) =>
  String(v ?? '')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/≠/g, '<>')
    .replace(/[→➔]/g, '->')
    .replace(/μ/g, 'µ')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/•/g, '-')
    .replace(/œ/g, 'oe')
    .replace(/Œ/g, 'Oe')
    .replace(/α/g, 'alpha')
    .replace(/β/g, 'beta')
    .replace(/γ/g, 'gamma')
    .replace(/[\u00A0\u202F\u2009]/g, ' ')
    .replace(/(\d)\.(\d)/g, '$1,$2')

/** MAJUSCULES SANS ACCENT (convention du laboratoire pour les titres). */
export const upperNoAccent = (s) =>
  String(s || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

const formatDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  const p = (n) => String(n).padStart(2, '0')
  return `${p(date.getDate())}/${p(date.getMonth() + 1)}/${date.getFullYear()}`
}

const formatTel = (raw) => {
  if (!raw) return ''
  let digits = String(raw).replace(/\D/g, '')
  if (digits.startsWith('221')) digits = digits.slice(3)
  if (digits.length !== 9) return String(raw)
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`
}

const formatThousand = (raw) => {
  const n = parseFloat(
    String(raw ?? '')
      .replace(/\s/g, '')
      .replace(',', '.')
  )
  if (!Number.isFinite(n)) return String(raw)
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export const sortResultsByCategory = (results) => {
  const grouped = (results || []).reduce((acc, r) => {
    const category = r?.testId?.categories || 'Autres'
    if (!acc[category]) acc[category] = []
    acc[category].push(r)
    return acc
  }, {})
  return Object.keys(grouped)
    .sort()
    .map((key) => ({ category: key, results: grouped[key] }))
}

// Binomes latins rendus en italique (convention medicale internationale).
export const GERMES = [
  // Bacteries Gram negatif
  'Escherichia coli',
  'Klebsiella pneumoniae ssp pneumoniae I',
  'Klebsiella pneumoniae ssp pneumoniae II',
  'Klebsiella pneumoniae',
  'Klebsiella oxytoca',
  'Citrobacter freundii',
  'Citrobacter koseri',
  'Enterobacter cloacae',
  'Enterobacter aerogenes',
  'Proteus mirabilis',
  'Proteus vulgaris',
  'Pseudomonas aeruginosa',
  'Acinetobacter baumannii',
  'Salmonella typhi',
  'Salmonella enterica',
  'Salmonella paratyphi',
  'Shigella flexneri',
  'Shigella sonnei',
  'Shigella dysenteriae',
  'Haemophilus influenzae',
  'Neisseria gonorrhoeae',
  'Neisseria meningitidis',
  'Helicobacter pylori',
  'Moraxella catarrhalis',
  'Serratia marcescens',
  // Bacteries Gram positif
  'Staphylococcus aureus',
  'Staphylococcus epidermidis',
  'Staphylococcus saprophyticus',
  'Streptococcus pneumoniae',
  'Streptococcus agalactiae',
  'Streptococcus pyogenes',
  'Streptococcus viridans',
  'Enterococcus faecalis',
  'Enterococcus faecium',
  'Listeria monocytogenes',
  'Bacillus cereus',
  'Clostridium difficile',
  'Clostridium perfringens',
  // Mycobacteries / spirochetes
  'Mycobacterium tuberculosis',
  'Treponema pallidum',
  'Borrelia burgdorferi',
  'Leptospira interrogans',
  // Mycoplasmes / chlamydies
  'Mycoplasma hominis',
  'Mycoplasma pneumoniae',
  'Ureaplasma urealyticum',
  'Chlamydia trachomatis',
  'Chlamydiae trachomatis',
  'Chlamydia pneumoniae',
  'Gardnerella vaginalis',
  'Mobiluncus spp',
  'Mobiluncus',
  // Champignons / levures
  'Candida albicans',
  'Candida tropicalis',
  'Candida glabrata',
  'Candida kefyr',
  'Candida krusei',
  'Candida parapsilosis',
  'Candida spp',
  'Cryptococcus neoformans',
  'Aspergillus fumigatus',
  'Aspergillus niger',
  // Parasites
  'Trichomonas vaginalis',
  'Giardia lamblia',
  'Giardia intestinalis',
  'Entamoeba histolytica',
  'Entamoeba coli',
  'Plasmodium falciparum',
  'Plasmodium vivax',
  'Plasmodium ovale',
  'Plasmodium malariae',
  'Schistosoma mansoni',
  'Schistosoma haematobium',
  'Toxoplasma gondii',
  'Leishmania donovani',
]
// Tri par longueur decroissante : le nom le plus long doit matcher d'abord.
export const GERMES_REGEX = new RegExp(
  '(' +
    [...GERMES]
      .sort((a, b) => b.length - a.length)
      .map((g) => g.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|') +
    ')',
  'g'
)

/** Validation a afficher : finale (biologiste) sinon technique. */
export const getValidation = (invoice) => {
  const hist = Array.isArray(invoice?.historiques) ? invoice.historiques : []
  const finalV = hist.find((h) => h.status === 'Validé')
  const techV = hist.find((h) => h.status === 'Validation technique')
  const validation = finalV || techV
  if (!validation || !validation.updatedBy) return null
  return { isTechnical: !finalV, validator: validation.updatedBy }
}

/**
 * Separe unite et reference pour les colonnes Unite / Valeurs de reference.
 * L'unite n'est jamais affichee deux fois ni perdue :
 *  - la reference se termine par l'unite ("35 - 45 mmHg") -> on la retire ;
 *  - la reference contient l'unite ailleurs -> reference laissee telle quelle,
 *    colonne Unite vide ;
 *  - sinon les deux sont affichees.
 */
const splitRef = (reference, unite) => {
  const ref = clean(reference)
  const unit = clean(unite)
  if (!unit || !ref) return { ref, unit }
  const norm = (s) =>
    sanitize(s)
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/²/g, '2')
      .replace(/³/g, '3')
      .replace(/\s+/g, ' ')
      .toLowerCase()
      .trim()
  const r = norm(ref)
  const u = norm(unit)
  const idx = r.indexOf(u)
  if (idx === -1) return { ref, unit }
  const before = idx === 0 ? ' ' : r[idx - 1]
  const after = idx + u.length >= r.length ? ' ' : r[idx + u.length]
  const isToken = /[\s\d]/.test(before) && /[\s)]/.test(after)
  if (!isToken) return { ref, unit }
  if (ref.endsWith(unit)) {
    return { ref: ref.slice(0, ref.length - unit.length).trim(), unit }
  }
  // Unite au milieu de la reference ("> 30 % a 1h") : la reference reste
  // entiere et le resultat garde son unite.
  return { ref, unit }
}

/**
 * Unite portee par une valeur de reference simple ("< 2,00 g/L" -> "g/L",
 * "70 - 100 %" -> "%"). Renvoie '' des que le texte n'a pas exactement la forme
 * [operateur] nombre [- nombre] unite : on ne devine jamais.
 */
const unitFromRef = (reference) => {
  const r = sanitize(clean(reference)).trim()
  const num = '\\d[\\d.,]*'
  const m = r.match(
    new RegExp(
      '^(?:[<>]=?\\s*)?' +
        num +
        '(?:\\s*(?:-|à)\\s*' +
        num +
        ')?\\s+([A-Za-zµ%°][^\\s]*)$'
    )
  )
  return m ? m[1] : ''
}

const isNumericLike = (s, maxLen = 9) =>
  s.length <= maxLen && /^[<>=]{0,2}\s?[-+]?\d[\d\s.,]*\s?%?$/.test(s)

// ============================================================================
// Rendu principal
// ============================================================================
/**
 * @param {jsPDF} doc     document jsPDF A4 (unite mm) deja cree
 * @param {object} invoice dossier d'analyse peuple (GET /api/analyse)
 * @param {object} assets  { logo: {data,width,height}, signature: {data,width,height}|null }
 */
export function renderResultatPdf(doc, invoice, assets = {}) {
  const GRAY = '#808080'

  // ----------------------------- Primitives --------------------------------
  const setFont = (c) => {
    doc.setFont(c.font || 'Courier', c.style || 'normal')
    doc.setFontSize(c.size || 9)
  }

  /** Decoupe le texte d'une cellule a sa largeur, avec SA police. */
  const wrap = (c) => {
    setFont(c)
    const out = []
    sanitize(c.t)
      .split(/\r?\n/)
      .forEach((p) => {
        const ls = doc.splitTextToSize(p, c.w)
        out.push(...(Array.isArray(ls) ? ls : [ls]))
      })
    return out
  }

  /** Ecrit une ligne en mettant les noms de germes en italique. */
  const drawWithGermes = (line, x, y, c) => {
    const base = c.style || 'normal'
    const ital = base === 'bold' ? 'bolditalic' : 'italic'
    let cx = x
    String(line)
      .split(GERMES_REGEX)
      .forEach((part) => {
        if (!part) return
        doc.setFont(c.font || 'Courier', GERMES.includes(part) ? ital : base)
        doc.text(part, cx, y)
        cx += doc.getTextWidth(part)
      })
    doc.setFont(c.font || 'Courier', base)
  }

  /**
   * Feuille "ligne de cellules". Chaque cellule { t, x, w, align, font, style,
   * size, color, germes } est renvoyee a la ligne dans sa largeur ; la hauteur
   * de la ligne est celle de la cellule la plus haute.
   */
  const block = (cells, o = {}) => {
    const padT = o.padT ?? 0.5
    const padB = o.padB ?? 0.5
    const prepared = cells
      .filter((c) => c && clean(c.t) !== '')
      .map((c) => ({ ...c, size: c.size || 9, lines: wrap(c) }))
    const maxSize =
      prepared.reduce((m, c) => Math.max(m, c.size), o.minSize || 0) || 9
    const textH = prepared.reduce(
      (m, c) => Math.max(m, c.lines.length * LH(c.size)),
      0
    )
    const h = padT + Math.max(textH, o.minH || 0) + padB
    return {
      h,
      draw: (y) => {
        if (o.before) o.before(y, h)
        const base = y + padT + ASC(maxSize)
        prepared.forEach((c) => {
          setFont(c)
          doc.setTextColor(c.color || '#000000')
          c.lines.forEach((ln, i) => {
            const yy = base + i * LH(c.size)
            if (c.align === 'right')
              doc.text(ln, c.x + c.w, yy, { align: 'right' })
            else if (c.align === 'center')
              doc.text(ln, c.x + c.w / 2, yy, { align: 'center' })
            else if (c.germes) drawWithGermes(ln, c.x, yy, c)
            else doc.text(ln, c.x, yy)
          })
        })
        doc.setTextColor('#000000')
        if (o.after) o.after(y, h)
      },
    }
  }

  const gap = (mm) => ({ gap: mm })
  const pageBreak = () => ({ pageBreak: true })
  const group = (children, o = {}) => ({
    children: children.filter(Boolean),
    ...o,
  })

  /** Paragraphe coupable : une feuille par ligne (saut de page possible entre deux lignes). */
  const paragraph = (text, c) => {
    const lines = wrap({ ...c, t: text })
    return lines.map((ln) => block([{ ...c, t: ln }], { padT: 0, padB: 0 }))
  }

  // ------------------------- Lignes de la grille ---------------------------
  /**
   * Ligne standard de la grille :
   * Parametre | Resultat | Unite | Valeurs de reference | Anteriorite
   */
  const gridRow = (r) => {
    const size = r.size || 9
    const value = clean(r.value)
    let unit = clean(r.unit)
    const ref = clean(r.ref)
    const ant = clean(r.ant)
    const valueSize = r.valueSize || size
    const valueStyle = r.bold || r.valueBold ? 'bold' : 'normal'
    const labelX = r.labelX ?? COL.LABEL
    const labelEnd = r.labelEnd ?? COL.LABEL_END
    const refEnd = ant ? COL.ANT - 2 : COL.END

    const cells = [
      {
        t: r.label,
        x: labelX,
        w: labelEnd - labelX,
        size: r.labelSize || size,
        style: r.labelStyle || (r.bold ? 'bold' : 'normal'),
        germes: r.germes,
      },
    ]
    if (clean(r.pct)) {
      cells.push({
        t: r.pct,
        x: 68,
        w: COL.LABEL_END - 68,
        size,
        align: 'right',
      })
    }

    if (value) {
      setFont({ size: valueSize, style: valueStyle })
      const numeric =
        isNumericLike(sanitize(value)) &&
        doc.getTextWidth(sanitize(value)) <= COL.VAL_R - COL.VAL_L
      if (numeric) {
        cells.push({
          t: value,
          x: COL.VAL_L,
          w: COL.VAL_R - COL.VAL_L,
          size: valueSize,
          style: valueStyle,
          align: 'right',
        })
      } else {
        // Resultat textuel : aligne a gauche, il s'etend sur les colonnes
        // libres a sa droite ; l'unite eventuelle est accolee au texte.
        const text = unit ? `${value} ${unit}` : value
        unit = ''
        const end = ref ? COL.REF - 2 : refEnd
        cells.push({
          t: text,
          x: COL.VAL_L,
          w: end - COL.VAL_L,
          size: valueSize,
          style: valueStyle,
          germes: r.germes,
        })
      }
    }
    if (unit)
      cells.push({
        t: unit,
        x: COL.UNIT,
        w: COL.UNIT_END - COL.UNIT,
        size: Math.min(size, 8),
      })
    if (ref) cells.push({ t: ref, x: COL.REF, w: refEnd - COL.REF, size })
    if (ant) {
      const antText = clean(r.antDate) ? `${ant}\n${r.antDate}` : ant
      cells.push({ t: antText, x: COL.ANT, w: COL.END - COL.ANT, size: 8 })
    }
    return block(cells, { minSize: size })
  }

  /** Ligne construite depuis une cellule { valeur, unite, reference } du modele. */
  const cellRow = (label, cell, fb = {}, o = {}) => {
    const isObj = cell !== null && typeof cell === 'object'
    const raw = isObj ? cell.valeur : cell
    const value = o.value !== undefined ? o.value : raw
    const { ref, unit } = splitRef(
      (isObj && clean(cell.reference)) || fb.reference || '',
      o.noUnit ? '' : (isObj && clean(cell.unite)) || fb.unite || ''
    )
    return gridRow({ label, value, unit, ref, bold: o.bold })
  }

  /** Ligne "Libelle : valeur" des examens de bacteriologie. */
  const kvRow = (label, value, o = {}) =>
    block([
      { t: label, x: COL.TITLE, w: 78, germes: true },
      {
        t: value,
        x: 100,
        w: COL.END - 100,
        style: o.valueStyle || 'normal',
        germes: true,
      },
    ])

  const subTitle = (text, o = {}) =>
    block(
      [
        {
          t: text,
          x: o.x ?? COL.TITLE,
          w: COL.END - (o.x ?? COL.TITLE),
          size: o.size || 9,
          style: 'bold',
        },
      ],
      { padT: o.padT ?? 1.5, padB: 1 }
    )

  /** Bandeau gris de sous-section (spermogramme). */
  const banner = (title) =>
    block([{ t: title, x: PAGE.LEFT + 3, w: 160, size: 10, style: 'bold' }], {
      padT: 3,
      padB: 1.5,
      before: (y, h) => {
        doc.setFillColor(220, 220, 220)
        doc.rect(PAGE.LEFT, y + 2, PAGE.RIGHT - PAGE.LEFT, h - 2.5, 'F')
      },
    })

  const centeredTitle = (text) =>
    block(
      [
        {
          t: text,
          x: PAGE.LEFT,
          w: PAGE.RIGHT - PAGE.LEFT,
          size: 12,
          style: 'bold',
          align: 'center',
        },
      ],
      {
        padT: 2,
        padB: 3,
        after: (y, h) => {
          doc.setDrawColor(0)
          doc.setLineWidth(0.3)
          doc.line(PAGE.LEFT, y + h - 2, PAGE.RIGHT, y + h - 2)
        },
      }
    )

  const note = (text, o = {}) =>
    block([
      {
        t: text,
        x: o.x ?? COL.LABEL,
        w: COL.END - (o.x ?? COL.LABEL),
        size: 8,
        style: 'italic',
        font: o.font,
      },
    ])

  // ------------------------------ Exceptions -------------------------------
  const filled = (v) => v !== undefined && v !== null && String(v).trim() !== ''

  const exceptionNodes = (test) => {
    const ex = test.exceptions
    const out = []
    if (!ex) return out
    const push = (rows, o = {}) => {
      const list = rows.filter(Boolean)
      if (list.length) out.push(group(list, o), gap(o.gapAfter ?? 1.5))
    }

    // QBC
    if (ex.qbc && ex.qbc.positivite) {
      const q = ex.qbc
      push([
        gridRow({
          label: 'Statut parasitaire',
          value: q.positivite,
          bold: true,
        }),
        typeof q.nombreCroix === 'number' && q.nombreCroix > 0
          ? gridRow({
              label: "Niveau d'infestation",
              value: '+ '.repeat(q.nombreCroix).trim(),
            })
          : null,
        clean(q.densiteParasitaire)
          ? gridRow({
              label: 'Densité parasitaire',
              value: q.densiteParasitaire,
            })
          : null,
        Array.isArray(q.especes) && q.especes.filter(Boolean).length
          ? gridRow({
              label: 'Espèce(s)',
              value: q.especes.filter(Boolean).join(', '),
              germes: true,
            })
          : null,
      ])
    }

    // Groupe sanguin
    if (ex.groupeSanguin && (ex.groupeSanguin.abo || ex.groupeSanguin.rhesus)) {
      push([
        ex.groupeSanguin.abo
          ? gridRow({
              label: 'Groupe sanguin ABO',
              value: ex.groupeSanguin.abo,
              valueBold: true,
              valueSize: 11,
            })
          : null,
        ex.groupeSanguin.rhesus
          ? gridRow({
              label: 'Rhésus',
              value: ex.groupeSanguin.rhesus,
              valueBold: true,
              valueSize: 11,
            })
          : null,
      ])
    }

    // HGPO : unites et references OMS figees
    if (ex.hgpo && (ex.hgpo.t0 || ex.hgpo.t60 || ex.hgpo.t120)) {
      const rows = [
        ['Glycémie à jeun', ex.hgpo.t0, '< 0,92'],
        ['Glycémie après 1 heure', ex.hgpo.t60, '< 1,80'],
        ['Glycémie après 2 heures', ex.hgpo.t120, '< 1,53'],
      ]
      push(
        rows
          .filter((r) => clean(r[1]))
          .map((r) =>
            gridRow({ label: r[0], value: r[1], unit: 'g/L', ref: r[2] })
          )
      )
    }

    // Ionogramme : chaines plates (na: "135.6") ou objets { valeur, ... }
    if (ex.ionogramme) {
      const rows = [
        ['na', 'Sodium (Na+)', { reference: '135 - 145', unite: 'mmol/L' }],
        ['k', 'Potassium (K+)', { reference: '3,5 - 5,0', unite: 'mmol/L' }],
        ['cl', 'Chlore (Cl-)', { reference: '95 - 105', unite: 'mmol/L' }],
        ['ca', 'Calcium (Ca++)', { reference: '2,15 - 2,55', unite: 'mmol/L' }],
        ['mg', 'Magnésium (Mg++)', { reference: '0,7 - 1,1', unite: 'mmol/L' }],
      ]
      push(
        rows.map(([key, label, fb]) => {
          const cell = ex.ionogramme[key]
          const val =
            cell !== null && typeof cell === 'object' ? cell.valeur : cell
          return filled(val) ? cellRow(label, cell, fb) : null
        })
      )
    }

    // Widal et Felix : genre en italique, statut, titre si positif
    if (ex.widal) {
      const antigenes = [
        ['ao', 'Paratyphi', 'AO'],
        ['ah', 'Paratyphi', 'AH'],
        ['bo', 'Paratyphi', 'BO'],
        ['bh', 'Paratyphi', 'BH'],
        ['co', 'Paratyphi', 'CO'],
        ['ch', 'Paratyphi', 'CH'],
        ['to', 'Typhi', 'TO'],
        ['th', 'Typhi', 'TH'],
      ]
      push(
        antigenes.map(([key, genre, code]) => {
          const cell = ex.widal[key]
          if (!cell?.statut) return null
          const titre =
            cell.statut === 'Positive' && cell.titre ? cell.titre : ''
          return block([
            { t: genre, x: COL.LABEL, w: 22, style: 'italic' },
            { t: `(${code})`, x: COL.LABEL + 22, w: 20 },
            {
              t: cell.statut,
              x: COL.VAL_L,
              w: COL.REF - 2 - COL.VAL_L,
              style: 'bold',
            },
            { t: titre, x: COL.REF, w: COL.END - COL.REF },
          ])
        })
      )
    }

    // HPV
    if (ex.hpv && (ex.hpv.hpv16 || ex.hpv.hpv18et45 || ex.hpv.autresHpv)) {
      push(
        [
          ['hpv16', 'HPV 16'],
          ['hpv18et45', 'HPV 18 et 45'],
          ['autresHpv', 'Autres HPV'],
        ].map(([key, label]) =>
          ex.hpv[key]
            ? gridRow({ label, value: ex.hpv[key], valueBold: true })
            : null
        )
      )
    }

    // NFS
    if (ex.nfs) {
      const h = ex.nfs.hematiesEtConstantes
      const l = ex.nfs.leucocytesEtFormules
      if (h) {
        const rows = [
          ['gr', 'Hématies (GR)'],
          ['hgb', 'Hémoglobine (HGB)'],
          ['hct', 'Hématocrite (HCT)'],
          ['vgm', 'VGM'],
          ['tcmh', 'TCMH'],
          ['ccmh', 'CCMH'],
          ['idr_cv', 'IDR (CV)'],
        ]
          .filter(([key]) => h[key]?.valeur)
          .map(([key, label]) =>
            gridRow({
              label,
              value: h[key].valeur,
              unit: h[key].unite,
              ref: h[key].reference,
            })
          )
        if (rows.length)
          push(
            [
              subTitle('HÉMATIES ET CONSTANTES', { x: COL.LABEL, size: 10 }),
              ...rows,
            ],
            { head: 3 }
          )
      }
      if (l) {
        const simple = (key, label) =>
          l[key]?.valeur
            ? gridRow({
                label,
                value: l[key].valeur,
                unit: l[key].unite,
                ref: l[key].reference,
              })
            : null
        const formule = (key, label) => {
          const c = l[key]
          if (!c || !(c.valeur || c.pourcentage)) return null
          return gridRow({
            label,
            labelEnd: 67,
            pct: c.pourcentage ? `${c.pourcentage}%` : '',
            value: c.valeur,
            unit: c.unite,
            ref: c.referenceValeur,
          })
        }
        const rows = [
          simple('gb', 'Leucocytes (GB)'),
          formule('neut', 'Neutrophiles'),
          formule('lymph', 'Lymphocytes'),
          formule('mono', 'Monocytes'),
          formule('eo', 'Éosinophiles'),
          formule('baso', 'Basophiles'),
          simple('plt', 'Plaquettes (PLT)'),
          // Blastes / cellules immatures : seulement si saisis
          formule('proerythroblastes', 'Proérythroblastes'),
          formule('erythroblastes', 'Érythroblastes'),
          formule('myeloblastes', 'Myéloblastes'),
          formule('promyelocytes', 'Promyélocytes'),
          formule('myelocytes', 'Myélocytes'),
          formule('metamyelocytes', 'Métamyélocytes'),
          formule('monoblastes', 'Monoblastes'),
          formule('lymphoblastes', 'Lymphoblastes'),
        ].filter(Boolean)
        if (rows.length)
          push(
            [
              subTitle('LEUCOCYTES ET FORMULE', { x: COL.LABEL, size: 10 }),
              ...rows,
            ],
            { head: 3 }
          )
      }
    }

    // PSA libre / total
    if (ex.psaRapport?.rapport?.valeur) {
      const p = ex.psaRapport
      push([
        p.psaLibre?.valeur ? cellRow('PSA libre', p.psaLibre) : null,
        p.psaTotal?.valeur ? cellRow('PSA total', p.psaTotal) : null,
        cellRow(
          'Rapport',
          p.rapport,
          { reference: 'N : > 15 %' },
          { bold: true }
        ),
      ])
    }

    // Reticulocytes
    if (ex.reticulocytes?.valeurAbsolue?.valeur) {
      const r = ex.reticulocytes
      const pct = r.pourcentage?.valeur ? r.pourcentage : r.pourcentageCalcule
      const abs = String(r.valeurAbsolue.valeur).replace(
        /\B(?=(\d{3})+(?!\d))/g,
        ' '
      )
      const ref = '0,5 - 1,5 % (20 000 - 120 000 /mm³)'
      push([
        pct?.valeur
          ? gridRow({
              label: 'Taux',
              value: `${String(pct.valeur).replace('.', ',')}%, soit ${abs}`,
              ref,
              bold: true,
            })
          : gridRow({
              label: 'Valeur absolue',
              value: `${abs} ${clean(r.valeurAbsolue.unite)}`.trim(),
              ref,
              bold: true,
            }),
      ])
    }

    // Clairance de la creatinine
    if (ex.clairanceCreatinine?.clairance?.valeur) {
      const c = ex.clairanceCreatinine
      const creat = c.creatininemie?.valeur ? c.creatininemie : c.creatinineMgL
      push([
        creat?.valeur ? cellRow('Créatininémie', creat) : null,
        c.creatininurie?.valeur
          ? cellRow('Créatininurie', c.creatininurie)
          : null,
        c.volume?.valeur ? cellRow('Volume', c.volume) : null,
        cellRow(
          'Clairance',
          c.clairance,
          { reference: '> 90 mL/min' },
          { bold: true }
        ),
      ])
    }

    // DFG
    if (ex.dfg?.dfgValue?.valeur) {
      const d = ex.dfg
      const creat = d.creatininemie?.valeur ? d.creatininemie : d.creatinineMgL
      push([
        creat?.valeur ? cellRow('Créatininémie', creat) : null,
        cellRow(
          'DFG',
          d.dfgValue,
          { reference: '>= 90 mL/min/1,73m²' },
          { bold: true }
        ),
      ])
    }

    // Saturation de la transferrine
    if (ex.saturationTransferrine?.coefficient?.valeur) {
      const s = ex.saturationTransferrine
      const fer = s.fer?.valeur ? s.fer : s.ferSerique
      const ctf = s.ctf?.valeur ? s.ctf : s.ctff
      push([
        fer?.valeur ? cellRow('Fer sérique', fer) : null,
        ctf?.valeur ? cellRow('Capacité totale de fixation', ctf) : null,
        cellRow(
          'Coefficient de saturation',
          s.coefficient,
          { reference: '20 - 40 %' },
          { bold: true }
        ),
      ])
    }

    // Compte d'Addis
    if (ex.compteAddis) {
      const a = ex.compteAddis
      push([
        a.leucocytesTotaux?.valeur
          ? cellRow('Leucocytes', a.leucocytesTotaux, {
              reference: '< 1000/minute',
            })
          : null,
        a.hematiesTotales?.valeur
          ? cellRow('Hématies', a.hematiesTotales, {
              reference: '< 500/minute',
            })
          : null,
      ])
    }

    if (ex.calciumCorrige?.calciumCorrige?.valeur) {
      push([
        cellRow(
          'Calcium corrigé',
          ex.calciumCorrige.calciumCorrige,
          { reference: '2,20 - 2,60 mmol/L' },
          { bold: true }
        ),
      ])
    }

    if (ex.rapportAlbuminurie?.rapport?.valeur) {
      const r = ex.rapportAlbuminurie
      push([
        r.albumineUrinaire?.valeur
          ? cellRow('Albumine urinaire', r.albumineUrinaire)
          : null,
        r.creatinineUrinaire?.valeur
          ? cellRow('Créatinine urinaire', r.creatinineUrinaire)
          : null,
        cellRow(
          'Rapport',
          r.rapport,
          { reference: 'N : < 30 mg/g' },
          { bold: true }
        ),
      ])
    }

    if (ex.rapportProteines?.rapport?.valeur) {
      const r = ex.rapportProteines
      push([
        r.proteinesUrinaires?.valeur
          ? cellRow('Protéines urinaires', r.proteinesUrinaires)
          : null,
        r.creatinineUrinaire?.valeur
          ? cellRow('Créatinine urinaire', r.creatinineUrinaire)
          : null,
        cellRow(
          'Rapport',
          r.rapport,
          { reference: 'N : < 150 mg/g' },
          { bold: true }
        ),
      ])
    }

    // LDL dose : la valeur remplace la valeur principale (masquee plus haut)
    if (ex.cholesterolLdl?.ldl?.valeur) {
      const c = ex.cholesterolLdl.ldl
      const { ref, unit } = splitRef(c.reference, c.unite)
      push([
        gridRow({
          label: '',
          value: c.valeur,
          unit,
          ref,
          valueBold: true,
          valueSize: 11,
        }),
        note('* Méthode directe - valable si triglycérides < 3,5 g/L', {
          font: 'Times',
        }),
      ])
    }

    if (ex.lipidesTotaux?.lipidesTotaux?.valeur) {
      push([
        cellRow(
          'Lipides totaux',
          ex.lipidesTotaux.lipidesTotaux,
          { reference: '2 - 10 g/L' },
          { bold: true }
        ),
      ])
    }

    if (ex.microalbuminurie24h?.microalbuminurie?.valeur) {
      const m = ex.microalbuminurie24h
      push([
        m.volumeUrinaire24h?.valeur
          ? cellRow('Diurèse', m.volumeUrinaire24h)
          : null,
        cellRow(
          'Microalbuminurie',
          m.microalbuminurie,
          { reference: '< 30 mg/24h' },
          { bold: true }
        ),
      ])
    }

    if (ex.proteinurie24h?.proteinurie?.valeur) {
      const p = ex.proteinurie24h
      push([
        p.volumeUrinaire24h?.valeur
          ? cellRow('Diurèse', p.volumeUrinaire24h)
          : null,
        cellRow(
          'Protéinurie',
          p.proteinurie,
          { reference: '< 150 mg/24h' },
          { bold: true }
        ),
      ])
    }

    if (ex.bilirubineIndirecte?.bilirubineIndirecte?.valeur) {
      push([
        cellRow(
          'Bilirubine indirecte',
          ex.bilirubineIndirecte.bilirubineIndirecte,
          { reference: '< 10 mg/L' },
          { bold: true }
        ),
      ])
    }

    // Gaz du sang : seules les lignes renseignees
    if (ex.gazDuSang) {
      const rows = [
        ['ph', 'pH'],
        ['pco2', 'pCO2'],
        ['po2', 'pO2'],
        ['excesDeBase', 'Excès de base'],
        ['tco2', 'tCO2'],
        ['hco3', 'HCO3'],
        ['sao2', 'Saturation en O2 (SaO2)'],
      ]
        .filter(([key]) => filled(ex.gazDuSang[key]?.valeur))
        .map(([key, label]) => cellRow(label, ex.gazDuSang[key]))
      if (rows.length)
        push([subTitle('GAZ DU SANG', { x: COL.LABEL, size: 10 }), ...rows], {
          head: 3,
        })
    }

    // Taux de prothrombine + INR, avec seuils de detection de l'analyseur
    if (ex.tauxProthrombine) {
      push(
        [
          ['tp', 'Taux de Prothrombine'],
          ['inr', 'INR'],
        ].map(([key, label]) => {
          const cell = ex.tauxProthrombine[key]
          if (!filled(cell?.valeur)) return null
          let value = String(cell.valeur)
          const n = Number(value.replace(',', '.'))
          if (Number.isFinite(n)) {
            if (key === 'tp' && n < 5) value = '< 5'
            if (key === 'inr' && n > 10) value = '> 10'
          }
          return cellRow(label, cell, {}, { value, bold: true })
        })
      )
    }

    if (ex.spermogramme) out.push(...spermogrammeNodes(ex.spermogramme))

    return out
  }

  // Spermogramme + spermocytogramme (normes OMS)
  const spermogrammeNodes = (sp) => {
    const hasVal = (cell) => {
      if (!cell) return false
      const v = cell.valeur ?? cell.count ?? cell.pourcentage
      return filled(v)
    }
    const hasText = (s) => typeof s === 'string' && s.trim() !== ''
    const line = (label, cell, o = {}) =>
      hasVal(cell) ? cellRow(label, cell, {}, o) : null
    const textLine = (label, s) =>
      hasText(s) ? gridRow({ label, value: s }) : null
    const section = (title, rows) => {
      const list = rows.filter(Boolean)
      return list.length
        ? [group([banner(title), ...list], { head: 3 }), gap(1)]
        : []
    }

    const out = []

    const intro = [
      hasVal(sp.dureeAbstinence)
        ? gridRow({
            label: "Durée d'abstinence",
            value: sp.dureeAbstinence.valeur,
            unit: 'jours',
          })
        : null,
      textLine('Mode de prélèvement', sp.modePrelevement),
    ].filter(Boolean)

    const sections = [
      ...section('Caractères généraux', [
        line('Volume', sp.volume),
        line('pH', sp.ph),
        textLine('Viscosité', sp.viscosite),
        textLine('Aspect', sp.aspect),
      ]),
      ...section('Numération des spermatozoïdes', [
        line('Numération', sp.numeration, {
          value: hasVal(sp.numeration)
            ? formatThousand(sp.numeration.valeur)
            : '',
        }),
        line('Soit/éjaculat', sp.ejaculatTotal, {
          value: hasVal(sp.ejaculatTotal)
            ? formatThousand(sp.ejaculatTotal.valeur)
            : '',
        }),
        textLine('Agglutinats spontanés', sp.agglutinatsSpontanes),
        textLine('Leucocytes', sp.leucocytes),
        textLine('Hématies', sp.hematies),
        textLine('Cellules rondes', sp.cellulesRondes),
      ]),
      ...section(
        'Étude de la vitalité des spermatozoïdes',
        hasVal(sp.spermatozoidesVivants)
          ? [
              line('Spermatozoïdes vivants', sp.spermatozoidesVivants),
              note("(Test de Williams : effectué 1 heure après l'émission)"),
            ]
          : []
      ),
      ...section('Étude de la mobilité des spermatozoïdes', [
        line('Spermatozoïdes à mobilité progressive', sp.mobiliteProgressive),
        line(
          'Spermatozoïdes à mobilité non progressive',
          sp.mobiliteNonProgressive
        ),
        line('Spermatozoïdes immobiles', sp.immobiles),
      ]),
    ]

    if (intro.length || sections.length) {
      out.push(
        group([centeredTitle('SPERMOGRAMME'), ...intro], { head: 3 }),
        gap(1),
        ...sections
      )
    }

    // --- Spermocytogramme (morphologie) ---
    const morphoRows = [
      ['morphoNormal', 'Normal'],
      ['morphoAnormal', 'Anormal'],
    ]
    const classifRows = [
      ['morphoNormal', 'Normal'],
      ['defautsTete', 'Défauts de la tête'],
      ['defautsPieceInter', 'Défauts de la pièce intermédiaire'],
      ['defautsFlagelle', 'Défauts du flagelle'],
      ['resteCytoplasmique', 'Reste cytoplasmique'],
    ]
    const PCT_X = 112
    const PCT_W = 18
    const morphoHeader = (withNormes) =>
      block([
        {
          t: 'Total',
          x: COL.VAL_L,
          w: COL.VAL_R - COL.VAL_L,
          style: 'bold',
          align: 'right',
        },
        { t: '%', x: PCT_X, w: PCT_W, style: 'bold', align: 'right' },
        withNormes
          ? { t: 'Normes', x: COL.REF, w: COL.END - COL.REF, style: 'bold' }
          : null,
      ])
    const morphoRow = (label, cell, norme) =>
      block([
        { t: label, x: COL.LABEL, w: COL.LABEL_END - COL.LABEL },
        {
          t: clean(cell?.count),
          x: COL.VAL_L,
          w: COL.VAL_R - COL.VAL_L,
          align: 'right',
        },
        { t: clean(cell?.pourcentage), x: PCT_X, w: PCT_W, align: 'right' },
        { t: norme, x: COL.REF, w: COL.END - COL.REF },
      ])

    const anyMorpho =
      morphoRows.some(([k]) => hasVal(sp[k])) ||
      classifRows.some(([k]) => hasVal(sp[k])) ||
      hasVal(sp.indexAnomaliesMultiples)

    if (anyMorpho) {
      // Pratique du laboratoire : le spermocytogramme commence toujours en
      // haut d'une nouvelle page (isole visuellement du spermogramme).
      if (out.length) out.push(pageBreak())
      out.push(centeredTitle('SPERMOCYTOGRAMME'))
      if (morphoRows.some(([k]) => hasVal(sp[k]))) {
        out.push(
          group(
            [
              banner('Morphologie'),
              morphoHeader(true),
              ...morphoRows
                .filter(([k]) => hasVal(sp[k]))
                .map(([k, label]) =>
                  morphoRow(
                    label,
                    sp[k],
                    k === 'morphoNormal'
                      ? clean(sp.morphoNormal?.reference) || '>= 4'
                      : ''
                  )
                ),
            ],
            { head: 3 }
          ),
          gap(1)
        )
      }
      if (classifRows.some(([k]) => hasVal(sp[k]))) {
        out.push(
          group(
            [
              banner('Classification basique'),
              morphoHeader(false),
              ...classifRows
                .filter(([k]) => hasVal(sp[k]))
                .map(([k, label]) => morphoRow(label, sp[k], '')),
            ],
            { head: 3 }
          ),
          gap(1)
        )
      }
      if (hasVal(sp.indexAnomaliesMultiples)) {
        out.push(
          group([
            gridRow({
              label: 'Index anomalies multiples',
              labelStyle: 'bold',
              value: sp.indexAnomaliesMultiples.valeur,
              ref: clean(sp.indexAnomaliesMultiples.reference) || '< 1,6',
            }),
            note('(total anomalies relevées / spermatozoïdes anormaux)'),
          ]),
          gap(1)
        )
      }
    }

    const commentaires = Array.isArray(sp.commentaires)
      ? sp.commentaires.filter(Boolean)
      : []
    if (commentaires.length) {
      out.push(
        group(
          [
            banner('Commentaires'),
            ...commentaires.map((c) =>
              block([
                { t: '-', x: PAGE.LEFT + 4, w: 3 },
                { t: c, x: PAGE.LEFT + 8, w: PAGE.RIGHT - PAGE.LEFT - 8 },
              ])
            ),
          ],
          { head: 2 }
        ),
        gap(1)
      )
    }

    if (
      hasText(sp.conclusionSpermogramme) ||
      hasText(sp.conclusionSpermocytogramme)
    ) {
      const concl = (label, s) =>
        hasText(s)
          ? block([
              {
                t: `${label} : ${s}`,
                x: PAGE.LEFT + 4,
                w: PAGE.RIGHT - PAGE.LEFT - 4,
                size: 10,
                style: 'bold',
              },
            ])
          : null
      out.push(
        group(
          [
            banner('CONCLUSION'),
            concl('Spermogramme', sp.conclusionSpermogramme),
            concl('Spermocytogramme', sp.conclusionSpermocytogramme),
          ],
          { head: 3 }
        ),
        gap(1.5)
      )
    }

    return out
  }

  // ----------------------------- Interpretation ----------------------------
  const interpretationNodes = (test) => {
    if (!test.statutInterpretation) return []
    const it = test.statutMachine
      ? test.testId.interpretationA
      : test.testId.interpretationB
    if (!it) return []
    // Detection tolerante : on se fie a la structure reelle du contenu.
    const content = it.content || {}
    const textBody = typeof content === 'string' ? content : content.text || ''
    const hasText = typeof textBody === 'string' && textBody.trim() !== ''
    const cols = Array.isArray(content.columns) ? content.columns : []
    const rows = Array.isArray(content.rows) ? content.rows : []
    const hasTable =
      cols.length > 0 &&
      rows.length > 0 &&
      (cols.some((c) => clean(c)) ||
        rows.some((r) => Array.isArray(r) && r.some((c) => clean(c))))
    if (!hasText && !hasTable) return []

    const X = COL.LABEL
    const W = COL.END - X
    const children = [subTitle('Interprétation :', { x: X, size: 10, padT: 1 })]
    let repeat

    if (hasTable) {
      // Colonnes de largeur egale sur toute la largeur utile ; chaque cellule
      // est renvoyee a la ligne dans SA colonne (plus de debordement).
      const n = Math.max(
        cols.length,
        ...rows.map((r) => (Array.isArray(r) ? r.length : 0))
      )
      const cw = W / n
      // Tableau "critere | norme" (ex. Sexe | Norme) : la norme est posee dans
      // la colonne "Valeurs de reference" de la grille, alignee avec les
      // references des autres analyses.
      const estNorme = (c) =>
        /^[<>=\s]*\d[\d\s.,]*(?:(?:-|à)\s*\d[\d\s.,]*)?\S{0,12}$/.test(
          sanitize(clean(c)).trim()
        )
      const normes =
        n === 2 &&
        rows.every((r) => !Array.isArray(r) || !clean(r[1]) || estNorme(r[1]))
      const xs = normes
        ? [X, COL.REF]
        : Array.from({ length: n }, (_, i) => X + i * cw)
      const ws = normes
        ? [COL.REF - X - 4, COL.END - COL.REF]
        : xs.map(() => cw - 2)
      const tableRow = (cells, style) =>
        block(
          Array.from({ length: n }, (_, i) => ({
            t: clean(cells[i]),
            x: xs[i],
            w: ws[i],
            style,
          }))
        )
      const header = cols.some((c) => clean(c)) ? tableRow(cols, 'bold') : null
      if (header) {
        children.push(header)
        repeat = () => [header]
      }
      rows.forEach((r) => {
        if (Array.isArray(r) && r.some((c) => clean(c)))
          children.push(tableRow(r, 'normal'))
      })
      if (hasText) children.push(gap(1.5))
    }

    if (hasText) {
      children.push(
        ...paragraph(textBody, {
          x: X,
          w: W,
          font: 'Times',
          size: 10,
          germes: true,
        })
      )
    }

    return [gap(1), group(children, { head: 3, repeat }), gap(1)]
  }

  // ------------------------- Examens de bacteriologie ----------------------
  const observationNodes = (test, hasMacro) => {
    const out = []
    const obs = test.observations || {}
    const section = (title, rows, o = {}) => {
      const list = rows.filter(Boolean)
      if (list.length)
        out.push(group([subTitle(title, o), ...list], { head: 3 }), gap(1.5))
    }

    if (hasMacro) {
      const origine = [clean(test.typePrelevement), clean(test.lieuPrelevement)]
        .filter(Boolean)
        .join(' : ')
      const head = [origine, formatDate(test.datePrelevement)]
        .filter(Boolean)
        .join('   ')
      if (head)
        out.push(
          block([{ t: head, x: COL.TITLE, w: COL.END - COL.TITLE, size: 10 }]),
          gap(1)
        )

      // Ancien format : une simple chaine au lieu d'une liste.
      const valeurs = []
        .concat(obs.macroscopique || [])
        .map((o) => (typeof o === 'string' ? o : o?.valeur))
        .filter((v) => typeof v === 'string' && v.trim())
      let texte = ''
      if (valeurs.length === 1) texte = valeurs[0]
      else if (valeurs.length === 2) texte = valeurs.join(' et ')
      else if (valeurs.length > 2)
        texte = `${valeurs.slice(0, -1).join(', ')} et ${valeurs[valeurs.length - 1]}`
      section(
        'EXAMEN MACROSCOPIQUE',
        texte ? paragraph(texte, { x: COL.TITLE, w: COL.END - COL.TITLE }) : []
      )
    }

    const micro = obs.microscopique
    if (micro && hasMacro) {
      const txt = (v) => (typeof v === 'string' && v.trim() ? v : '')
      const present = (v) => (clean(v) && v !== 'Absence' ? v : '')
      const withDetails = (v, details) => {
        const base = present(v)
        const d = Array.isArray(details) ? details.filter(Boolean) : []
        if (!base) return ''
        return d.length ? `${base} (${d.join(', ')})` : base
      }
      const uniteMicro = micro.unite ? ` /${micro.unite}` : ''
      const kv = (label, v, o) => (v ? kvRow(label, v, o) : null)
      section('EXAMEN MICROSCOPIQUE', [
        kv(
          'Leucocytes:',
          txt(micro.leucocytes) && `${micro.leucocytes}${uniteMicro}`
        ),
        kv(
          'Hématies:',
          txt(micro.hematies) && `${micro.hematies}${uniteMicro}`
        ),
        kv('Monocytes:', txt(micro.monocytes)),
        kv(
          'Polynucléaires neutrophiles altérés:',
          txt(micro.polynucleairesNeutrophilesAlterees)
        ),
        kv(
          'Polynucléaires neutrophiles non altérés:',
          txt(micro.polynucleairesNeutrophilesNonAlterees)
        ),
        kv('Éosinophiles:', txt(micro.eosinophiles)),
        kv('Basophiles:', txt(micro.basophiles)),
        kv('Parasites:', withDetails(micro.parasites, micro.parasitesDetails)),
        kv('Filaments mucus:', txt(micro.filamentMucus)),
        kv('Cellules épithéliales:', txt(micro.cellulesEpitheliales)),
        kv('Cristaux:', withDetails(micro.cristaux, micro.cristauxDetails)),
        kv('Cylindres:', present(micro.cylindres)),
        kv('Levures:', txt(micro.levures)),
        kv('Spermatozoïdes:', txt(micro.spermatozoides)),
        kv('Bactéries:', txt(micro.bacterie)),
        kv('Germes:', txt(micro.germe), { valueStyle: 'italic' }),
        kv('Éléments levuriformes:', present(micro.elementsLevuriforme)),
        kv('Filaments mycéliens:', present(micro.filamentsMyceliens)),
        kv('Trichomonas vaginalis:', present(micro.trichomonasVaginalis)),
        kv('Trichomonas intestinalis:', present(micro.trichomonasIntestinales)),
        kv('Oeufs de bilharzies:', present(micro.oeufsDeBilharzies)),
        kv('Clue cells:', present(micro.clueCells)),
        kv('Gardnerella vaginalis:', present(micro.gardnerellaVaginalis)),
        kv('Bacilles de Döderlein:', present(micro.bacillesDeDoderlein)),
        kv('pH:', txt(micro.ph)),
        kv(
          'Type de flore:',
          txt(micro.typeDeFlore).replace(
            /des[ée]quilibr[ée]e?/i,
            'déséquilibrée'
          )
        ),
        kv('Recherche de Streptocoque B:', txt(micro.rechercheDeStreptocoqueB)),
      ])
    }

    const chimie = obs.chimie
    if (chimie) {
      const rows = [
        ['albumine', 'Albumine:'],
        ['sucre', 'Sucre:'],
        ['corpscetoniques', 'Corps cétoniques:'],
        ['pigmentsbiliaire', 'Pigments biliaires:'],
        ['urobilinogene', 'Urobilinogène:'],
        ['sang', 'Sang:'],
        ['leucocytes', 'Leucocytes:'],
        ['nitrites', 'Nitrites:'],
        ['ph', 'pH:'],
        ['proteinesTotales', 'Protéines totales:'],
        ['proteinesArochies', 'Protéinorachie:'],
        ['glycorachie', 'Glycorachie:'],
        ['acideUrique', 'Acide urique:'],
        ['LDH', 'LDH:'],
      ]
      section(
        'EXAMEN CHIMIQUE',
        rows.map(([key, label]) =>
          typeof chimie[key] === 'string' && chimie[key].trim()
            ? kvRow(label, chimie[key])
            : null
        )
      )
    }

    if (clean(test.gram)) {
      section('EXAMEN APRES COLORATION DE GRAM', [kvRow('Gram:', test.gram)])
    }

    if (test.culture) {
      const { culture, germeIdentifie, description } = test.culture
      const germes = Array.isArray(germeIdentifie)
        ? germeIdentifie.map((g) => g?.nom).filter(Boolean)
        : []
      section('CULTURES SUR MILIEUX SPECIFIQUES :', [
        clean(culture) ? kvRow('Cultures:', culture) : null,
        germes.length
          ? kvRow('Germe(s) identifié(s):', germes.join(', '), {
              valueStyle: 'italic',
            })
          : null,
        clean(description) ? kvRow('Numération:', description) : null,
      ])
    }

    const ch = obs.rechercheChlamydia
    if (ch) {
      section('RECHERCHE DE CHLAMYDIA', [
        clean(ch.naturePrelevement)
          ? kvRow('Nature du prélèvement:', ch.naturePrelevement)
          : null,
        clean(ch.rechercheAntigeneChlamydiaTrochomatis)
          ? kvRow(
              "Recherche d'antigène de Chlamydia trachomatis:",
              ch.rechercheAntigeneChlamydiaTrochomatis
            )
          : null,
      ])
    }

    const my = obs.rechercheMycoplasmes
    if (my) {
      section('RECHERCHE DE MYCOPLASMES', [
        clean(my.naturePrelevement)
          ? kvRow('Nature du prélèvement:', my.naturePrelevement)
          : null,
        clean(my.rechercheUreaplasmaUrealyticum)
          ? kvRow(
              "Recherche d'Ureaplasma urealyticum:",
              my.rechercheUreaplasmaUrealyticum
            )
          : null,
        clean(my.rechercheMycoplasmaHominis)
          ? kvRow(
              'Recherche de Mycoplasma hominis:',
              my.rechercheMycoplasmaHominis
            )
          : null,
      ])
    }

    if (clean(test.conclusion)) {
      out.push(
        group(
          [
            subTitle('CONCLUSION', { size: 11 }),
            ...paragraph(test.conclusion, {
              x: COL.TITLE,
              w: COL.END - COL.TITLE,
              font: 'Times',
              style: 'bold',
              size: 11,
              germes: true,
            }),
          ],
          { head: 3 }
        ),
        gap(2)
      )
    }

    if (hasMacro && clean(test.remarque)) {
      out.push(
        group(
          paragraph(`Commentaires: ${test.remarque}`, {
            x: COL.TITLE,
            w: COL.END - COL.TITLE,
            style: 'italic',
          })
        ),
        gap(1.5)
      )
    }

    // Antibiogrammes : un tableau par germe identifie
    const germes = Array.isArray(test.culture?.germeIdentifie)
      ? test.culture.germeIdentifie
      : []
    germes.forEach((germe) => {
      const entries = Object.entries(germe?.antibiogramme || {}).filter(([a]) =>
        clean(a)
      )
      if (!entries.length) return
      const X0 = 30
      const W_ATB = 95
      const W_SENS = 30
      const boxed = (cells) =>
        block(cells, {
          padT: 1,
          padB: 1,
          after: (y, h) => {
            doc.setDrawColor(0)
            doc.setLineWidth(0.2)
            doc.rect(X0, y, W_ATB, h)
            doc.rect(X0 + W_ATB, y, W_SENS, h)
          },
        })
      const titre = (suite) =>
        block(
          [
            {
              t: `ANTIBIOGRAMME : ${clean(germe.nom)}${suite ? ' (suite)' : ''}`,
              x: X0,
              w: W_ATB + W_SENS,
              size: 10,
              style: 'bold',
              germes: true,
            },
          ],
          { padT: 2, padB: 1.5 }
        )
      const header = boxed([
        { t: 'Antibiotique', x: X0 + 2, w: W_ATB - 4, style: 'bold' },
        { t: 'Sensibilité', x: X0 + W_ATB + 2, w: W_SENS - 4, style: 'bold' },
      ])
      out.push(
        group(
          [
            titre(false),
            header,
            ...entries.map(([antibiotique, sensibilite]) =>
              boxed([
                { t: antibiotique, x: X0 + 2, w: W_ATB - 4 },
                {
                  t: clean(sensibilite),
                  x: X0 + W_ATB + 2,
                  w: W_SENS - 4,
                  style: clean(sensibilite).toUpperCase().startsWith('R')
                    ? 'bold'
                    : 'normal',
                },
              ])
            ),
            block(
              [
                {
                  t: 'S : Sensible    I : Intermédiaire    R : Résistant',
                  x: X0,
                  w: W_ATB + W_SENS,
                  size: 8,
                },
              ],
              { padT: 1.5 }
            ),
          ],
          { head: 5, repeat: () => [titre(true), header] }
        ),
        gap(3)
      )
    })

    return out
  }

  // --------------------------------- Test ----------------------------------
  // Un test a-t-il une exception REELLEMENT remplie ? (Mongoose initialise
  // les sous-schemas vides : Object.keys().length > 0 serait trop permissif.)
  const hasMeaningfulException = (obj) => {
    if (!obj || typeof obj !== 'object') return false
    for (const k of Object.keys(obj)) {
      const v = obj[k]
      if (v == null) continue
      if (typeof v === 'object') {
        if (
          'valeur' in v &&
          v.valeur != null &&
          v.valeur !== '' &&
          v.valeur !== 0
        )
          return true
        if (hasMeaningfulException(v)) return true
      } else if (v !== '' && v !== 0 && k === 'valeur') {
        return true
      }
    }
    return false
  }

  const testTitle = (test, suite) => {
    const nom = upperNoAccent(test.testId.nom) + (suite ? ' (suite)' : '')
    return block(
      [
        {
          t: nom,
          x: COL.TITLE,
          w: COL.END - COL.TITLE,
          size: 10,
          style: 'bold',
        },
      ],
      {
        padT: 1,
        padB: 0.8,
        before: (y) => {
          doc.setFillColor(0, 0, 0)
          doc.circle(18.2, y + 1 + ASC(10) - 1.1, 0.9, 'F')
        },
      }
    )
  }

  const buildTest = (test) => {
    const children = [testTitle(test, false)]
    const hasMacro = (test.observations?.macroscopique?.length || 0) > 0
    let grid = false

    if (!hasMacro) {
      const ex = test.exceptions
      const iono = ex?.ionogramme
      const hasIonogramme =
        !!iono &&
        ['na', 'k', 'cl', 'ca', 'mg'].some((k) => {
          const c = iono[k]
          return c !== null && typeof c === 'object' ? !!c.valeur : !!c
        })
      const hasWidal =
        !!ex?.widal &&
        ['ao', 'ah', 'bo', 'bh', 'co', 'ch', 'to', 'th'].some(
          (k) => !!ex.widal[k]?.statut
        )
      const hasHpv =
        !!ex?.hpv &&
        (!!ex.hpv.hpv16 || !!ex.hpv.hpv18et45 || !!ex.hpv.autresHpv)
      const hasExceptions =
        hasIonogramme || hasWidal || hasHpv || hasMeaningfulException(ex)

      if (clean(test.typePrelevement)) {
        const detail = [
          formatDate(test.datePrelevement),
          clean(test.typePrelevement),
        ]
          .filter(Boolean)
          .join(', ')
        children.push(
          block([
            {
              t: `Prélèvement : ${detail}`,
              x: COL.TITLE,
              w: COL.END - COL.TITLE,
            },
          ])
        )
      }

      // Ligne principale : technique | resultat | reference | anteriorite
      const machine = clean(
        test.statutMachine ? test.testId.machineA : test.testId.machineB
      )
      const technique = [
        machine,
        clean(test.methode) ? `(${clean(test.methode)})` : '',
      ]
        .filter(Boolean)
        .join(' ')
      const refGlobale = clean(
        test.statutMachine
          ? test.testId.valeurMachineA
          : test.testId.valeurMachineB
      )

      // LDL dose saisi : il remplace le LDL calcule (un seul LDL affiche).
      const ldlDose = ex?.cholesterolLdl?.ldl?.valeur
      const hideMainValue =
        /cholest[eé]rol\s*ldl/i.test(test.testId.nom || '') &&
        ldlDose !== undefined &&
        ldlDose !== '' &&
        ldlDose !== null

      const value = hideMainValue ? '' : clean(test.valeur)
      const ant = clean(test.dernierResultatAnterieur?.valeur)
      // L'unite ecrite dans la valeur de reference ("< 2,00 g/L") est affichee
      // a cote du resultat ; la reference garde ses bornes dans sa colonne.
      const refBrute = hasExceptions ? '' : refGlobale
      const uniteRef =
        value && isNumericLike(sanitize(value)) ? unitFromRef(refBrute) : ''
      const { ref, unit: uniteValeur } = uniteRef
        ? splitRef(refBrute, uniteRef)
        : { ref: refBrute, unit: '' }
      if (technique || value || ref || ant) {
        children.push(
          gridRow({
            label: technique,
            labelX: COL.TITLE,
            labelStyle: 'italic',
            labelSize: 8.5,
            value,
            valueSize: 11,
            valueBold: true,
            unit: uniteValeur,
            ref,
            ant,
            antDate: formatDate(test.dernierResultatAnterieur?.date),
          })
        )
        grid = true
      }
      if (!hideMainValue && clean(test.qualitatif)) {
        children.push(
          gridRow({
            label: '',
            value: `(${clean(test.qualitatif)})`,
            valueBold: true,
            valueSize: 10,
          })
        )
      }
      if (clean(ex?.chargeVirale?.log)) {
        children.push(
          gridRow({
            label: '',
            value: `${clean(ex.chargeVirale.log)} log UI/mL`,
            valueBold: true,
            valueSize: 10,
          })
        )
      }

      const exNodes = exceptionNodes(test)
      if (exNodes.length) {
        children.push(gap(0.5), ...exNodes)
        grid = true
      }

      if (clean(test.remarque)) {
        children.push(
          gap(0.5),
          group(
            paragraph(`Commentaires: ${test.remarque}`, {
              x: COL.TITLE,
              w: COL.END - COL.TITLE,
              font: 'Times',
              style: 'italic',
              size: 9.5,
              germes: true,
            })
          )
        )
      }

      children.push(...interpretationNodes(test))
    }

    if (test.observations || test.culture || test.gram || test.conclusion) {
      children.push(...observationNodes(test, hasMacro))
    }

    // Les espaces en fin de test ne servent a rien (l'espace entre deux
    // tests est gere par l'appelant).
    while (children.length && children[children.length - 1].gap !== undefined)
      children.pop()

    return {
      node: group(children, { head: 3, repeat: () => [testTitle(test, true)] }),
      grid,
    }
  }

  // ----------------------------- Categories --------------------------------
  const categoryBanner = (name) =>
    block(
      [
        {
          t: upperNoAccent(name),
          x: PAGE.LEFT,
          w: PAGE.RIGHT - PAGE.LEFT,
          size: 13,
          style: 'bold',
          align: 'center',
        },
      ],
      {
        padT: 1,
        padB: 3.5,
        after: (y, h) => {
          doc.setDrawColor(0)
          doc.setLineWidth(0.3)
          doc.line(PAGE.LEFT, y + h - 2.5, PAGE.RIGHT, y + h - 2.5)
        },
      }
    )

  const columnHeader = () => {
    const c = (t, x, w, align) => ({
      t,
      x,
      w,
      size: 7,
      color: '#555555',
      align,
    })
    return block(
      [
        c('Paramètre / Technique', COL.TITLE, 60),
        c('Résultat', COL.VAL_L, COL.VAL_R - COL.VAL_L, 'right'),
        c('Unité', COL.UNIT, 20),
        c('Valeurs de référence', COL.REF, 35),
        c('Antériorité', COL.ANT, COL.END - COL.ANT),
      ],
      {
        padT: 0,
        padB: 1.8,
        after: (y, h) => {
          doc.setDrawColor(170)
          doc.setLineWidth(0.15)
          doc.line(PAGE.LEFT, y + h - 1.2, PAGE.RIGHT, y + h - 1.2)
          doc.setDrawColor(0)
        },
      }
    )
  }

  // --------------------------- Validation / signature ----------------------
  const validationNode = () => {
    const v = getValidation(invoice)
    if (!v) return null
    const X_CENTER = 145
    const W = 80
    const X = X_CENTER - W / 2

    if (v.isTechnical) {
      // Validation technique seule : mention soulignee, sans nom ni signature.
      return block(
        [
          {
            t: 'Validation technique',
            x: X,
            w: W,
            size: 12,
            style: 'bold',
            align: 'center',
          },
        ],
        {
          padT: 2,
          padB: 2,
          after: (y, h) => {
            doc.setFont('Courier', 'bold')
            doc.setFontSize(12)
            const w = doc.getTextWidth('Validation technique')
            doc.setLineWidth(0.3)
            doc.line(
              X_CENTER - w / 2,
              y + h - 1.5,
              X_CENTER + w / 2,
              y + h - 1.5
            )
          },
        }
      )
    }

    const validator = v.validator
    const fullName = `${validator.prenom || ''} ${validator.nom || ''}`.trim()
    const profil = String(validator.profil || '')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    // Nom en gras, titres en italique : deux cellules superposees mesurees.
    const nameBlock = block(
      [
        {
          t: fullName,
          x: X,
          w: W,
          font: 'Times',
          style: 'bold',
          size: 10,
          align: 'center',
        },
      ],
      { padT: 1, padB: 0 }
    )
    const profilBlock = profil.length
      ? block(
          [
            {
              t: profil.join('\n'),
              x: X,
              w: W,
              font: 'Times',
              style: 'italic',
              size: 10,
              align: 'center',
            },
          ],
          { padT: 0, padB: 0 }
        )
      : { h: 0, draw: () => {} }

    // Signature / cachet : largeur 40 mm, hauteur bornee, remontee de quelques
    // mm pour absorber le blanc en haut de l'image.
    const sig = assets.signature
    const SIG_W_MAX = 40
    const SIG_H_MAX = 28
    // (jamais plus haut que la ligne de titre : le nom reste degage)
    const SIG_OVERLAP = Math.min(6, profilBlock.h)
    let sigW = 0
    let sigH = 0
    if (sig && sig.width && sig.height) {
      const scale = Math.min(SIG_W_MAX / sig.width, SIG_H_MAX / sig.height)
      sigW = sig.width * scale
      sigH = sig.height * scale
    }
    const textH = nameBlock.h + profilBlock.h
    const h = textH + Math.max(0, sigH - SIG_OVERLAP) + 1
    return {
      h,
      draw: (y) => {
        // Image d'abord, texte ensuite : meme si le cachet a un fond opaque,
        // le nom et le titre du biologiste restent lisibles par-dessus.
        if (sigH) {
          try {
            doc.addImage(
              sig.data,
              sig.format || 'PNG',
              X_CENTER - sigW / 2,
              y + textH - SIG_OVERLAP,
              sigW,
              sigH
            )
          } catch (e) {
            // Image illisible : le compte rendu reste valide sans le cachet.
          }
        }
        nameBlock.draw(y)
        profilBlock.draw(y + nameBlock.h)
      },
    }
  }

  // ------------------------------ Page : decor -----------------------------
  const centered = (t, y, size, font = 'Times', style = 'normal') => {
    doc.setFont(font, style)
    doc.setFontSize(size)
    doc.text(sanitize(t), 105, y, { align: 'center' })
  }

  const drawFooter = () => {
    doc.setFillColor(GRAY)
    doc.rect(PAGE.LEFT, PAGE.FOOTER_Y, PAGE.RIGHT - PAGE.LEFT, 0.5, 'F')
    doc.setTextColor('#000000')
    centered(
      'Rufisque Ouest, rond-point SOCABEG vers cité SIPRES - Sortie 9 autoroute à péage Dakar Sénégal Aut. minist. n° 013545-28/03/19',
      PAGE.FOOTER_Y + 5,
      7
    )
    centered(
      'Site web : www.bioram.org   Tel. 78 601 09 09   email : contact@bioram.org',
      PAGE.FOOTER_Y + 9,
      7
    )
    centered(
      'RC/SN-DKR-2019 B 13431 - NINEA 0073347059 2E2',
      PAGE.FOOTER_Y + 13,
      7
    )
  }

  const patient = invoice?.userId || {}
  const nomComplet =
    `${clean(patient.prenom).toUpperCase()} ${clean(patient.nom).toUpperCase()}`.trim()
  const dateDossier = formatDate(invoice?.createdAt)

  /** Bandeau d'identite des pages 2+ (identite du patient sur chaque page). */
  const drawPageHeader = () => {
    const t = [
      `Nº Dossier: ${clean(invoice?.identifiant)}`,
      `Nom: ${nomComplet}`,
      clean(patient.nip) ? `NIP: ${clean(patient.nip)}` : '',
      dateDossier ? `Date: ${dateDossier}` : '',
    ]
      .filter(Boolean)
      .join('   ')
    const b = block(
      [
        {
          t,
          x: PAGE.LEFT,
          w: PAGE.RIGHT - PAGE.LEFT,
          size: 8,
          color: '#555555',
        },
      ],
      { padT: 0, padB: 0 }
    )
    b.draw(10)
    doc.setDrawColor(170)
    doc.setLineWidth(0.15)
    doc.line(PAGE.LEFT, 10 + b.h + 1.5, PAGE.RIGHT, 10 + b.h + 1.5)
    doc.setDrawColor(0)
    return 10 + b.h + 5
  }

  /** En-tete complet de la premiere page ; retourne le Y de debut du contenu. */
  const drawFirstPageHeader = () => {
    const logo = assets.logo
    if (logo && logo.width && logo.height) {
      const w = 30
      const h = Math.min(32, w * (logo.height / logo.width))
      try {
        doc.addImage(logo.data, logo.format || 'PNG', PAGE.LEFT, 5, w, h)
      } catch (e) {
        // Logo illisible : on continue sans.
      }
    }
    doc.setTextColor('#000000')
    const cx = (t, y, size) => {
      doc.setFont('Times', 'normal')
      doc.setFontSize(size)
      doc.text(sanitize(t), 120, y, { align: 'center' })
    }
    cx("LABORATOIRE D'ANALYSES MEDICALES", 10, 13)
    cx(
      'Hématologie - Immuno-Hématologie - Biochimie - Immunologie - Bactériologie - Virologie - Parasitologie',
      15,
      8
    )
    cx('24H/24 7J/7', 18.5, 8)
    cx('Prélèvement à domicile sur rendez-vous', 22, 8)
    cx('Tel. 78 601 09 09 / 33 836 99 98 email : contact@bioram.org', 25.5, 8)
    doc.setFillColor(GRAY)
    doc.rect(PAGE.LEFT, 40, PAGE.RIGHT - PAGE.LEFT, 0.5, 'F')

    // Bloc identite : deux colonnes mesurees (un nom long passe a la ligne).
    const b = (t) => ({ t, size: 11, style: 'bold' })
    const left = [
      `NIP: ${clean(patient.nip)}`,
      `Date: ${dateDossier}`,
      clean(invoice?.prescripteur)
        ? `Prescripteur: ${clean(invoice.prescripteur)}`
        : '',
    ].filter(Boolean)
    const right = [
      `Nº Dossier: ${clean(invoice?.identifiant)}`,
      `Nom: ${nomComplet}`,
      `Âge: ${formatAgeSexe(patient.dateNaissance, patient.age, patient.sexe)}`,
      `Tel: ${formatTel(patient.telephone)}`,
    ]
    let yl = 43
    left.forEach((t) => {
      const bl = block([{ ...b(t), x: 30, w: 88 }], { padT: 0.4, padB: 0.4 })
      bl.draw(yl)
      yl += bl.h
    })
    let yr = 43
    right.forEach((t) => {
      const bl = block([{ ...b(t), x: 122, w: PAGE.RIGHT - 122 }], {
        padT: 0.4,
        padB: 0.4,
      })
      bl.draw(yr)
      yr += bl.h
    })
    return Math.max(yl, yr) + 7
  }

  // ------------------------------ Moteur a flux ----------------------------
  const isGap = (n) => n.gap !== undefined
  const isBreak = (n) => n.pageBreak === true
  const isGroup = (n) => Array.isArray(n.children)
  const height = (n) => {
    if (isGap(n)) return n.gap
    if (isBreak(n)) return Infinity
    if (isGroup(n)) return n.children.reduce((s, c) => s + height(c), 0)
    return n.h
  }
  const leafCount = (n) =>
    isGap(n) || isBreak(n)
      ? 0
      : isGroup(n)
        ? n.children.reduce((s, c) => s + leafCount(c), 0)
        : 1
  /**
   * Sous-bloc qui reste entier avec le titre qui le precede : il est court,
   * ou il a trop peu de lignes pour etre coupe proprement.
   */
  const wholeWithTitle = (n) => {
    const H = height(n)
    const max = n.keepMax ?? KEEP_MAX
    return (
      H <= Math.min(max, LEAD_BLOCK_MAX) ||
      (H <= max && leafCount(n) <= (n.head ?? 3) + 1)
    )
  }
  /** Hauteur des k premieres feuilles d'un noeud (titre + premieres lignes). */
  const leadHeight = (n, k) => {
    let h = 0
    let count = 0
    const walk = (node) => {
      if (count >= k || isBreak(node)) return false
      if (isGap(node)) {
        h += node.gap
        return true
      }
      if (isGroup(node)) {
        // Un sous-bloc insecable compte en entier : sinon le titre resterait
        // seul en bas de page pendant que le sous-bloc passe a la suivante.
        // Au-dela de LEAD_BLOCK_MAX, le sous-bloc sera coupe apres ses
        // propres premieres lignes (voir place) : on ne reserve que celles-ci.
        if (node !== n) {
          h += wholeWithTitle(node)
            ? height(node)
            : leadHeight(node, node.head ?? 3)
          count = k
          return false
        }
        for (const c of node.children) if (!walk(c)) return false
        return true
      }
      h += node.h
      count += 1
      return count < k
    }
    walk(n)
    return h
  }

  const st = { y: 0, fresh: false, stack: [], pages: 0, leaves: 0 }
  const rem = () => PAGE.BOTTOM - st.y

  const breakPage = () => {
    doc.addPage()
    st.pages += 1
    drawFooter()
    st.y = drawPageHeader()
    st.fresh = true
    // En-tetes de continuation des groupes en cours (exterieur -> interieur).
    st.stack.forEach((fn) => {
      fn().forEach((leaf) => {
        leaf.draw(st.y)
        st.y += leaf.h
      })
    })
  }
  const drawLeaf = (n) => {
    n.draw(st.y)
    st.y += n.h
    st.fresh = false
    st.leaves += 1
  }
  const drawAll = (n) => {
    if (isGap(n)) {
      if (!st.fresh) st.y += n.gap
    } else if (isGroup(n)) n.children.forEach(drawAll)
    else drawLeaf(n)
  }
  /**
   * Place un noeud dans le flux. `after` = hauteur de ce qui suit le noeud
   * dans son parent et qui doit rester avec sa fin (fin de test, validation).
   */
  const place = (n, after = 0, force = false) => {
    if (!n) return
    if (isGap(n)) {
      if (!st.fresh) st.y = Math.min(st.y + n.gap, PAGE.BOTTOM)
      return
    }
    if (isBreak(n)) {
      if (!st.fresh) breakPage()
      return
    }
    if (!isGroup(n)) {
      if (n.h + after > rem() && !st.fresh) breakPage()
      drawLeaf(n)
      return
    }
    const H = height(n)
    if (H + after <= rem()) return drawAll(n)
    // Petit groupe : passe entier a la page suivante plutot que d'etre coupe.
    // (S'il tient ici mais pas avec la fin qu'il doit emmener, et que le tout
    // laisserait un trop grand blanc, il est coupe comme un grand groupe.)
    if (
      !force &&
      H <= (n.keepMax ?? KEEP_MAX) &&
      !st.fresh &&
      (H > rem() || H + after <= KEEP_TAIL_MAX)
    ) {
      breakPage()
      return drawAll(n)
    }
    // Grand groupe : coupe entre deux lignes. Le titre reste avec ses
    // premieres lignes ; une fin de bloc trop courte (moins de TAIL_MIN) ne
    // part jamais seule sur la page suivante : elle emmene ce qui la precede.
    // (un bloc tout entier contenu dans ses premieres lignes emmene aussi la
    // fin courte qui le suit)
    const lead = leadHeight(n, n.head ?? 3)
    const leadNeed =
      H - lead + after <= TAIL_MIN && H + after <= KEEP_TAIL_MAX
        ? H + after
        : lead
    if (leadNeed > rem() && !st.fresh) breakPage()
    if (n.repeat) st.stack.push(n.repeat)
    const ch = n.children
    // Lignes de ce groupe deja posees sur la page courante.
    let page = st.pages
    let drawn = 0
    for (let i = 0; i < ch.length; i++) {
      const c = ch[i]
      if (isGap(c) || isBreak(c)) {
        place(c)
        continue
      }
      if (st.pages !== page) {
        page = st.pages
        drawn = n.head ?? 3
      }
      const rest = ch.slice(i + 1)
      const hasBreak = rest.some(isBreak)
      const R = hasBreak
        ? Infinity
        : rest.reduce((s, x) => s + height(x), 0) + after
      // Tant que les premieres lignes du bloc ne sont pas posees, rien n'est
      // reporte a la page suivante : le titre ne doit pas rester seul.
      const started = drawn >= (n.head ?? 3) || st.fresh
      const carry = R <= TAIL_MIN && started ? R : 0
      if (isGroup(c)) {
        // Juste apres le titre, un sous-bloc qui ne tient pas est coupe apres
        // ses premieres lignes au lieu de laisser le titre seul en bas de page.
        const before = st.leaves
        place(
          c,
          carry,
          drawn < (n.head ?? 3) && !st.fresh && !wholeWithTitle(c)
        )
        drawn += st.leaves - before
        continue
      }
      // (la ligne n'emmene la fin que si le blanc laisse reste raisonnable)
      // ni si cela laissait le titre du bloc seul en bas de page.
      const need =
        c.h + carry <= KEEP_MAX && drawn >= (n.head ?? 3) ? c.h + carry : c.h
      if (need > rem() && !st.fresh) breakPage()
      drawLeaf(c)
      drawn += 1
    }
    if (n.repeat) st.stack.pop()
  }

  // ------------------------------- Assemblage ------------------------------
  doc.setTextColor('#000000')
  drawFooter()
  st.y = drawFirstPageHeader()
  st.fresh = true

  const categories = sortResultsByCategory(invoice?.resultat)
    .map((g) => ({
      name: g.category,
      // Un resultat dont le test n'existe plus au catalogue reste affiche
      // (un resultat saisi ne doit jamais disparaitre du compte rendu).
      tests: g.results
        .filter(Boolean)
        .map((t) =>
          t.testId && typeof t.testId === 'object'
            ? t
            : { ...t, testId: { nom: 'Analyse (libellé indisponible)' } }
        )
        .map(buildTest),
    }))
    .filter((c) => c.tests.length)

  const signature = validationNode()
  let signaturePlaced = false

  // Toutes les rubriques forment un seul flux : une derniere rubrique tres
  // courte emmene ainsi la fin de la precedente au lieu de partir seule.
  const flux = []
  categories.forEach((cat, ci) => {
    const hasGrid = cat.tests.some((t) => t.grid)
    const children = [categoryBanner(cat.name)]
    if (hasGrid) children.push(columnHeader())
    cat.tests.forEach((t, ti) => {
      if (ti > 0) children.push(gap(3))
      // La validation est attachee au dernier test : elle ne se retrouve
      // jamais seule en haut d'une page et suit immediatement le contenu.
      if (
        signature &&
        ci === categories.length - 1 &&
        ti === cat.tests.length - 1
      ) {
        t.node.children.push(gap(7), signature)
        signaturePlaced = true
      }
      children.push(t.node)
    })
    if (ci > 0) flux.push(gap(6))
    flux.push(
      group(children, {
        keepMax: 0,
        head: hasGrid ? 5 : 4,
        repeat: hasGrid ? () => [columnHeader()] : undefined,
      })
    )
  })
  if (flux.length) place(group(flux, { keepMax: 0 }))

  if (signature && !signaturePlaced) {
    place(gap(7))
    place(signature)
  }

  // Numerotation "Page x/y" dans le pied de page.
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont('Times', 'normal')
    doc.setFontSize(8)
    doc.setTextColor('#000000')
    doc.text(`Page ${i}/${pageCount}`, PAGE.RIGHT, PAGE.FOOTER_Y + 13, {
      align: 'right',
    })
  }

  return doc
}
