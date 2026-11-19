// Controle geometrique partage par verifier-resultat-pdf.mjs (donnees
// fictives) et verifier-resultat-pdf-reel.mjs (dossiers reels, lecture seule).
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { jsPDF } from 'jspdf'
import { renderResultatPdf } from '../src/utils/resultatPdf.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ------------------------------- Images ------------------------------------
const png = (file) => {
  const buf = fs.readFileSync(path.join(__dirname, '..', 'src', 'images', file))
  return {
    data: 'data:image/png;base64,' + buf.toString('base64'),
    width: buf.readUInt32BE(16),
    height: buf.readUInt32BE(20),
    format: 'PNG',
  }
}
export const assets = {
  logo: png('bioramlogo.png'),
  signature: png('logo2.png'),
}

// --------------------------- Controle geometrique --------------------------
const PT = 0.3528
const LIMITS = { left: 16.5, right: 190.6, bottom: 272.6, footer: 277 }
// Blanc maximal tolere en bas d'une page non finale (hors saut de page voulu).
const MAX_BLANC = 62

export function rendre(invoice) {
  const doc = new jsPDF()
  const boxes = []
  const images = []
  const page = () => doc.internal.getCurrentPageInfo().pageNumber
  const text0 = doc.text.bind(doc)
  doc.text = (text, x, y, options) => {
    const lines = Array.isArray(text) ? text : [text]
    const fs = doc.getFontSize()
    lines.forEach((ln, i) => {
      const s = String(ln)
      if (!s.trim()) return
      const w = doc.getTextWidth(s)
      const align = options?.align
      const x0 = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x
      const yy = y + i * fs * PT * 1.15
      boxes.push({
        page: page(),
        x0,
        x1: x0 + w,
        y0: yy - fs * PT * 0.7,
        y1: yy + fs * PT * 0.2,
        s,
      })
    })
    return text0(text, x, y, options)
  }
  const img0 = doc.addImage.bind(doc)
  doc.addImage = (data, fmt, x, y, w, h) => {
    images.push({ page: page(), x0: x, x1: x + w, y0: y, y1: y + h })
    return img0(data, fmt, x, y, w, h)
  }
  renderResultatPdf(doc, invoice, assets)
  return { doc, boxes, images, pages: doc.internal.getNumberOfPages() }
}

export function controler({ boxes, images, pages }, { sautVoulu }) {
  const errs = []
  const E = 0.25 // tolerance (mm)
  for (let p = 1; p <= pages; p++) {
    const bs = boxes.filter((b) => b.page === p)
    const contenu = bs.filter((b) => b.y0 < LIMITS.footer - 1)
    for (const b of contenu) {
      if (b.x0 < LIMITS.left || b.x1 > LIMITS.right)
        errs.push(
          `p${p} hors marges [${b.x0.toFixed(1)} ; ${b.x1.toFixed(1)}] : "${b.s}"`
        )
      if (b.y1 > LIMITS.bottom)
        errs.push(
          `p${p} dans le pied de page (y=${b.y1.toFixed(1)}) : "${b.s}"`
        )
    }
    for (let i = 0; i < bs.length; i++) {
      for (let j = i + 1; j < bs.length; j++) {
        const a = bs[i]
        const b = bs[j]
        if (
          a.x0 + E < b.x1 &&
          b.x0 + E < a.x1 &&
          a.y0 + E < b.y1 &&
          b.y0 + E < a.y1
        )
          errs.push(`p${p} chevauchement : "${a.s}" / "${b.s}"`)
      }
    }
    for (const im of images.filter((m) => m.page === p && m.y0 > 45)) {
      if (im.y1 > LIMITS.bottom)
        errs.push(
          `p${p} signature dans le pied de page (y=${im.y1.toFixed(1)})`
        )
    }
    if (p < pages) {
      const bas = Math.max(...contenu.map((b) => b.y1))
      const blanc = LIMITS.bottom - bas
      if (blanc > MAX_BLANC && !sautVoulu)
        errs.push(`p${p} grand blanc en bas de page : ${blanc.toFixed(0)} mm`)
    }
  }
  // La validation ne doit jamais etre seule sur la derniere page.
  const derniere = boxes.filter(
    (b) => b.page === pages && b.y0 < LIMITS.footer - 1 && b.y0 > 20
  )
  if (pages > 1 && derniere.length > 0 && derniere.length <= 3) {
    errs.push(
      `derniere page presque vide (${derniere.map((b) => b.s).join(' | ')})`
    )
  }
  return errs
}
