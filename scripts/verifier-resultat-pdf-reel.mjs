// ============================================================================
// Controle de la mise en page du PDF de resultats sur des dossiers REELS.
//
//   node scripts/verifier-resultat-pdf-reel.mjs [nombre=300] [dossier-de-sortie]
//
// LECTURE SEULE : le script ne fait que des find() sur la base (MONGO_URI de
// LimsServer/.env), avec le meme populate que GET /api/analyse, puis rend
// chaque dossier et applique le controle geometrique (chevauchements, marges,
// pied de page, grands blancs). Aucune ecriture en base, aucun SMS/mail.
// Les PDF ecrits contiennent des donnees de patients : ils restent en local,
// hors des depots git.
// ============================================================================
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { rendre, controler } from './controle-geometrique.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const serverDir = path.join(__dirname, '..', '..', 'LimsServer')
const requireServer = createRequire(path.join(serverDir, 'server.js'))

const N = Number(process.argv[2]) || 300
const outDir =
  process.argv[3] || path.join(__dirname, '..', '..', 'apercu-resultats-reels')
fs.mkdirSync(outDir, { recursive: true })

requireServer('dotenv').config({ path: path.join(serverDir, '.env') })
const mongoose = requireServer('mongoose')
const Analyse = requireServer('./models/analyseModel')
requireServer('./models/resultatModel')
requireServer('./models/testModel')
requireServer('./models/userModel')
requireServer('./models/historiqueModel')
requireServer('./models/PartenaireModel')

await mongoose.connect(process.env.MONGO_URI.trim(), { dbName: 'lims' })

const analyses = await Analyse.find({ 'resultat.0': { $exists: true } })
  .sort({ createdAt: -1 })
  .limit(N)
  .populate(
    'userId',
    'nom prenom adresse telephone dateNaissance age nip sexe createdAt'
  )
  .populate('partenaireId', 'nom typePartenaire')
  .populate({
    path: 'historiques',
    select: 'status description date createdAt updatedAt',
    populate: { path: 'updatedBy', select: 'nom prenom logo profil' },
  })
  .populate({
    path: 'resultat',
    select:
      'valeur exceptions remarque qualitatif interpretationA interpretationB methode dernierResultatAnterieur testId statutInterpretation typePrelevement lieuPrelevement statutMachine datePrelevement updatedBy createdAt updatedAt observations culture gram conclusion remarque',
    populate: [
      {
        path: 'testId',
        select:
          'nom categories machineA machineB valeurMachineA valeurMachineB valeur interpretationA interpretationB',
      },
      { path: 'updatedBy', select: 'nom prenom' },
    ],
  })
  .lean()

// Resultats reels dont le dossier d'origine n'existe plus : on les regroupe
// par dossier d'origine dans un dossier minimal, pour tester aussi leur rendu.
const Resultat = mongoose.model('Resultat')
const lies = new Set(
  analyses.flatMap((a) => (a.resultat || []).map((r) => String(r._id)))
)
const orphelins = await Resultat.find({ _id: { $nin: [...lies] } })
  .populate(
    'testId',
    'nom categories machineA machineB valeurMachineA valeurMachineB valeur interpretationA interpretationB'
  )
  .populate('updatedBy', 'nom prenom')
  .populate(
    'patientId',
    'nom prenom adresse telephone dateNaissance age nip sexe createdAt'
  )
  .lean()
await mongoose.disconnect()

const groupes = new Map()
for (const r of orphelins) {
  const k = String(r.analyseId || r._id)
  if (!groupes.has(k)) groupes.set(k, [])
  groupes.get(k).push(r)
}
const reconstitues = [...groupes.entries()].map(([k, rs]) => ({
  _id: k,
  identifiant: 'R' + k.slice(-6),
  createdAt: rs[0].createdAt,
  userId: rs[0].patientId || {
    nom: 'Patient',
    prenom: 'Inconnu',
    nip: '00000',
  },
  resultat: rs,
  historiques: [],
}))

// Meme forme que la reponse JSON de l'API (dates et identifiants en chaines).
const dossiers = JSON.parse(JSON.stringify([...analyses, ...reconstitues]))

let echecs = 0
let plantages = 0
const pagesParDossier = {}
const types = {}
const exemples = {}
// Vrai si l'objet contient au moins une valeur saisie (les sous-documents
// Mongoose vides existent toujours, ils ne comptent pas).
const renseigne = (v) => {
  if (v === null || v === undefined) return false
  if (Array.isArray(v)) return v.some(renseigne)
  if (typeof v === 'object')
    return Object.entries(v).some(
      ([k, x]) =>
        k !== '_id' && k !== 'unite' && k !== 'reference' && renseigne(x)
    )
  return String(v).trim() !== '' && v !== false
}
const compter = (k) => (types[k] = (types[k] || 0) + 1)

for (const invoice of dossiers) {
  const id = invoice.identifiant || invoice._id
  const rs = invoice.resultat || []
  const aSpermo = rs.some((r) => renseigne(r?.exceptions?.spermogramme))
  const cles = new Set()
  for (const r of rs) {
    for (const [k, v] of Object.entries(r?.observations || {}))
      if (renseigne(v)) cles.add('obs:' + k)
    if (renseigne(r?.valeur)) cles.add('valeur simple')
    if (renseigne(r?.qualitatif)) cles.add('qualitatif')
    if (renseigne(r?.remarque)) cles.add('remarque')
    for (const [k, v] of Object.entries(r?.exceptions || {})) {
      if (renseigne(v)) cles.add('exc:' + k)
    }
    if (r?.statutInterpretation) cles.add('interpretation')
    if (r?.dernierResultatAnterieur?.valeur) cles.add('anteriorite')
  }
  cles.forEach(compter)

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
  pagesParDossier[r.pages] = (pagesParDossier[r.pages] || 0) + 1
  const errs = [...new Set(controler(r, { sautVoulu: aSpermo }))]
  const ecrire = (nom) =>
    fs.writeFileSync(
      path.join(outDir, `${nom}.pdf`),
      Buffer.from(r.doc.output('arraybuffer'))
    )
  if (errs.length) {
    echecs++
    console.log(`ECHEC ${id} : ${r.pages} page(s), ${rs.length} resultat(s)`)
    errs.slice(0, 6).forEach((e) => console.log('   - ' + e))
    ecrire(`ECHEC-${id}`)
  }
  // Un exemple par type de contenu, pour la relecture visuelle.
  for (const k of cles) {
    if (!exemples[k]) {
      exemples[k] = id
      ecrire(`${k.replace(/[^a-zA-Z0-9]+/g, '-')}-${id}`)
    }
  }
  if (r.pages >= 3 && !exemples.long) {
    exemples.long = id
    ecrire(`long-${id}`)
  }
}

console.log(`\nDossiers reels rendus : ${dossiers.length}`)
console.log(
  `Conformes : ${dossiers.length - echecs - plantages} | echecs : ${echecs} | plantages : ${plantages}`
)
console.log('Pages par dossier :', JSON.stringify(pagesParDossier))
console.log('Types de contenu rencontres (nb de dossiers) :')
Object.entries(types)
  .sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`   ${String(v).padStart(4)}  ${k}`))
console.log(`PDF de relecture : ${outDir}`)
process.exit(echecs || plantages ? 1 : 0)
