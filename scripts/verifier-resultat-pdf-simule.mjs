// ============================================================================
// Controle du PDF de resultats sur TOUS les dossiers existants, avec des
// resultats SIMULES pour chaque analyse prescrite.
//
//   node scripts/verifier-resultat-pdf-simule.mjs [nombre=tous] [dossier-de-sortie]
//
// LECTURE SEULE : les dossiers, les patients et le catalogue de tests (avec
// leurs vraies valeurs de reference et interpretations) sont lus dans la base ;
// les resultats simules n'existent qu'en memoire. Rien n'est ecrit en base.
//
// Chaque dossier est rendu deux fois :
//   - "complet" : interpretation affichee, anteriorite, commentaire ;
//   - "simple"  : le resultat seul.
// Un dossier supplementaire par categorie contient tous les tests du catalogue,
// pour que chaque test soit rendu au moins une fois.
// En plus du controle geometrique, on verifie que le nom de chaque analyse et
// sa valeur de reference figurent bien dans le PDF.
// ============================================================================
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { rendre, controler } from './controle-geometrique.mjs'
import { scenarios } from './donnees-fictives.mjs'
import { sanitize, upperNoAccent } from '../src/utils/resultatPdf.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverDir = path.join(__dirname, '..', '..', 'LimsServer')
const requireServer = createRequire(path.join(serverDir, 'server.js'))

const N = Number(process.argv[2]) || 0
const outDir =
  process.argv[3] ||
  path.join(__dirname, '..', '..', 'apercu-resultats-reels', 'simules')
fs.mkdirSync(outDir, { recursive: true })

requireServer('dotenv').config({ path: path.join(serverDir, '.env') })
const mongoose = requireServer('mongoose')
const Analyse = requireServer('./models/analyseModel')
const Test = requireServer('./models/testModel')
requireServer('./models/userModel')
requireServer('./models/historiqueModel')
requireServer('./models/PartenaireModel')

const CHAMPS_TEST =
  'nom categories machineA machineB valeurMachineA valeurMachineB valeur interpretationA interpretationB'

await mongoose.connect(process.env.MONGO_URI.trim(), { dbName: 'lims' })
let q = Analyse.find({ 'tests.0': { $exists: true } }).sort({ createdAt: -1 })
if (N) q = q.limit(N)
const analyses = await q
  .populate(
    'userId',
    'nom prenom adresse telephone dateNaissance age nip sexe createdAt'
  )
  .populate('tests', CHAMPS_TEST)
  .populate('partenaireId', 'nom typePartenaire')
  .populate({
    path: 'historiques',
    select: 'status description date createdAt updatedAt',
    populate: { path: 'updatedBy', select: 'nom prenom logo profil' },
  })
  .lean()
const catalogue = await Test.find({}, CHAMPS_TEST).lean()
await mongoose.disconnect()

// ----------------------------- Simulation ----------------------------------
// Generateur pseudo-aleatoire reproductible (memes PDF a chaque execution).
let graine = 20261119
const alea = () => {
  graine = (graine * 1664525 + 1013904223) % 4294967296
  return graine / 4294967296
}

// Modeles de resultats specialises (NFS, ionogramme, ECBU, ...) repris des
// dossiers fictifs et associes aux tests du catalogue par leur nom.
const fictifs = scenarios.complet()
const modele = (motif) =>
  fictifs.find((t) => motif.test(upperNoAccent(t.testId.nom)))
const bacterio = fictifs.filter((t) => /bact/i.test(t.testId.categories || ''))
const MODELES = [
  [/NFS|NUMERATION FORMULE|HEMOGRAMME/, modele(/NFS/)],
  [/GROUPE SANGUIN|GSRH/, modele(/GROUPE SANGUIN/)],
  [/GOUTTE EPAISSE|QBC/, modele(/QBC/)],
  [/TAUX DE PROTHROMBINE/, modele(/PROTHROMBINE/)],
  [/RETICULOCYTE/, modele(/RETICULOCYTE/)],
  [/GAZ DU SANG|GAZOMETRIE/, modele(/GAZ DU SANG/)],
  [/HGPO|HYPERGLYCEMIE PROVOQUEE/, modele(/HGPO/)],
  [/IONOGRAMME/, modele(/IONOGRAMME/)],
  [/WIDAL/, modele(/WIDAL/)],
  [/HPV|PAPILLOMAVIRUS/, modele(/HPV/)],
  [/PSA.*(LIBRE|RAPPORT)/, modele(/PSA/)],
  [/CLAIRANCE/, modele(/CLAIRANCE/)],
  [/DFG|DEBIT DE FILTRATION/, modele(/DFG/)],
  [/SATURATION/, modele(/SATURATION/)],
  [/ADDIS|HLM/, modele(/ADDIS/)],
  [/CALCIUM CORRIGE/, modele(/CALCIUM CORRIGE/)],
  [/\(RAC\)|ALBUMINURIE ?\/ ?CREAT/, modele(/RAPPORT ALBUMINURIE/)],
  [/\(RPC\)|PROTEINURIE ?\/ ?CREAT/, modele(/RAPPORT PROTEINURIE/)],
  [/CHOLESTEROL LDL/, modele(/CHOLESTEROL LDL/)],
  [/LIPIDES TOTAUX/, modele(/LIPIDES TOTAUX/)],
  [/MICROALBUMINURIE/, modele(/MICROALBUMINURIE/)],
  [/PROTEINURIE (DES )?24/, modele(/PROTEINURIE DES 24/)],
  [/BILIRUBINE/, modele(/BILIRUBINE/)],
  [/SPERMOGRAMME|SPERMOCYTOGRAMME/, modele(/SPERMOGRAMME/)],
]
const MOTIF_BACTERIO =
  /ECBU|CYTOBACTERIO|COPROCULTURE|UROCULTURE|HEMOCULTURE|PRELEVEMENT (VAGINAL|URETRAL)|\bPV\b|\bPU\b|\bPUS\b|LCR|SPERMOCULTURE|CULTURE/

const nombres = (s) =>
  (String(s).match(/\d+(?:[.,]\d+)?/g) || []).map((x) =>
    Number(x.replace(',', '.'))
  )
const fr = (x) => String(Math.round(x * 100) / 100)

/** Valeur plausible a partir de la reference saisie au catalogue. */
const valeurSimulee = (test) => {
  const ref = String(test.valeurMachineA || '').trim()
  if (
    /n[ée]gatif|positif|absence|pr[ée]sence/i.test(ref) &&
    !/\d\s*-\s*\d/.test(ref)
  ) {
    return { qualitatif: alea() < 0.7 ? 'Négatif' : 'Positif' }
  }
  const ns = nombres(ref)
  if (ns.length >= 2) {
    const [a, b] = ns
    // Une fois sur trois hors intervalle, pour tester les grandes valeurs.
    return {
      valeur: fr(alea() < 0.33 ? b * (1.1 + alea() * 3) : a + (b - a) * alea()),
    }
  }
  if (ns.length === 1) return { valeur: fr(ns[0] * (0.3 + alea() * 1.6)) }
  const r = alea()
  if (r < 0.45) return { valeur: fr(alea() * 250) }
  if (r < 0.75) return { qualitatif: alea() < 0.7 ? 'Négatif' : 'Positif' }
  return { valeur: 'Positif', qualitatif: 'Présence d’anticorps spécifiques' }
}

let seq = 0
const usage = new Map()
const resultatSimule = (test, complet) => {
  const nom = upperNoAccent(test.nom || '')
  usage.set(String(test._id), (usage.get(String(test._id)) || 0) + 1)
  const base = {
    _id: `sim${++seq}`,
    testId: test,
    statutMachine: true,
    statutInterpretation: complet,
    observations: { macroscopique: [] },
    updatedAt: '2026-11-19T10:00:00Z',
  }
  const specialise = MODELES.find(([motif, m]) => m && motif.test(nom))
  if (specialise) {
    const { _id, testId, ...champs } = specialise[1]
    return {
      ...base,
      ...champs,
      _id: base._id,
      testId: test,
      statutInterpretation: complet,
    }
  }
  if (MOTIF_BACTERIO.test(nom) && bacterio.length) {
    const { _id, testId, ...champs } = bacterio[seq % bacterio.length]
    return {
      ...base,
      ...champs,
      _id: base._id,
      testId: test,
      statutInterpretation: complet,
    }
  }
  const r = { ...base, ...valeurSimulee(test) }
  if (complet) {
    if (r.valeur && alea() < 0.5) {
      r.dernierResultatAnterieur = {
        valeur: r.valeur,
        date: '2026-08-14T00:00:00Z',
      }
    }
    if (alea() < 0.3) {
      r.remarque =
        'Résultat contrôlé sur un second prélèvement. À confronter au contexte clinique et à recontrôler dans 4 semaines si nécessaire.'
    }
    if (alea() < 0.3) r.methode = 'Chimiluminescence (CLIA)'
  }
  return r
}

// ------------------------------- Dossiers ----------------------------------
const dossiers = []
for (const a of JSON.parse(JSON.stringify(analyses))) {
  const tests = (a.tests || []).filter((t) => t && typeof t === 'object')
  if (!tests.length) continue
  for (const complet of [true, false]) {
    dossiers.push({
      ...a,
      variante: complet ? 'complet' : 'simple',
      resultat: tests.map((t) => resultatSimule(t, complet)),
    })
  }
}
// Un dossier par categorie avec tous les tests du catalogue.
const parCategorie = new Map()
for (const t of JSON.parse(JSON.stringify(catalogue))) {
  const c = t.categories || 'Autres'
  if (!parCategorie.has(c)) parCategorie.set(c, [])
  parCategorie.get(c).push(t)
}
for (const [cat, tests] of parCategorie) {
  for (const complet of [true, false]) {
    dossiers.push({
      identifiant:
        'CAT-' +
        upperNoAccent(cat)
          .replace(/[^A-Z0-9]+/g, '-')
          .slice(0, 24),
      variante: complet ? 'complet' : 'simple',
      createdAt: '2026-11-19T09:30:00Z',
      userId: {
        prenom: 'Catalogue',
        nom: 'Complet',
        nip: '00000',
        age: 40,
        sexe: 'F',
      },
      historiques: [],
      resultat: tests.map((t) => resultatSimule(t, complet)),
    })
  }
}

// ------------------------------- Controle ----------------------------------
const norm = (s) => sanitize(String(s)).replace(/\s+/g, ' ').trim()
let echecs = 0
let plantages = 0
let nbResultats = 0
const pages = {}
const defauts = {}
const exemplesEcrits = new Set()

for (const invoice of dossiers) {
  const id = `${invoice.identifiant || invoice._id}-${invoice.variante}`
  nbResultats += invoice.resultat.length
  let r
  try {
    r = rendre(invoice)
  } catch (e) {
    plantages++
    console.log(
      `PLANTAGE ${id} : ${e.stack.split('\n').slice(0, 3).join(' | ')}`
    )
    continue
  }
  pages[r.pages] = (pages[r.pages] || 0) + 1
  const aSpermo = invoice.resultat.some((x) => x.exceptions?.spermogramme)
  const errs = [...new Set(controler(r, { sautVoulu: aSpermo }))]

  // Aucune analyse ni valeur de reference ne doit manquer dans le PDF.
  const texte = norm(r.boxes.map((b) => b.s).join(' '))
  const compact = texte.replace(/\s/g, '')
  for (const x of invoice.resultat) {
    const nom = norm(upperNoAccent(x.testId.nom || ''))
    if (nom && !texte.includes(nom))
      errs.push(`analyse absente du PDF : "${nom}"`)
    const ref = norm(x.testId.valeurMachineA || '')
    const sansException =
      !x.exceptions && !(x.observations?.macroscopique?.length > 0)
    if (ref && sansException) {
      // L'unite peut etre deplacee a cote du resultat : on verifie les bornes.
      const bornes = (ref.match(/\d+(?:[.,]\d+)?/g) || [ref]).map((n) =>
        n.replace('.', ',')
      )
      const manque = bornes.find((n) => !compact.includes(n.replace(/\s/g, '')))
      if (manque) errs.push(`reference absente du PDF : "${ref}" (${nom})`)
    }
  }

  if (errs.length) {
    echecs++
    errs.forEach((e) => {
      const k = e.replace(/^p\d+ /, '').replace(/ ?[:(].*$/, '')
      defauts[k] = (defauts[k] || 0) + 1
    })
    if (echecs <= 25) {
      console.log(
        `ECHEC ${id} : ${r.pages} page(s), ${invoice.resultat.length} resultat(s)`
      )
      errs.slice(0, 5).forEach((e) => console.log('   - ' + e))
    }
    if (echecs <= 15) {
      fs.writeFileSync(
        path.join(outDir, `ECHEC-${id}.pdf`),
        Buffer.from(r.doc.output('arraybuffer'))
      )
    }
  }
  // Exemples de relecture : les dossiers "catalogue" et quelques dossiers reels.
  const estCatalogue = String(invoice.identifiant).startsWith('CAT-')
  if (
    invoice.variante === 'complet' &&
    (estCatalogue || exemplesEcrits.size < 12)
  ) {
    exemplesEcrits.add(id)
    fs.writeFileSync(
      path.join(outDir, `${id}.pdf`),
      Buffer.from(r.doc.output('arraybuffer'))
    )
  }
}

const couverts = catalogue.filter((t) => usage.has(String(t._id))).length
console.log(
  `\nDossiers existants lus : ${analyses.length} | rendus (2 variantes + catalogue) : ${dossiers.length}`
)
console.log(`Resultats simules rendus : ${nbResultats}`)
console.log(
  `Tests du catalogue rendus au moins une fois : ${couverts}/${catalogue.length}`
)
console.log(
  `Conformes : ${dossiers.length - echecs - plantages} | echecs : ${echecs} | plantages : ${plantages}`
)
console.log('Pages par rendu :', JSON.stringify(pages))
if (echecs) console.log('Defauts par type :', JSON.stringify(defauts, null, 1))
console.log(`PDF de relecture : ${outDir}`)
process.exit(echecs || plantages ? 1 : 0)
