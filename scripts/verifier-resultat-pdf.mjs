// ============================================================================
// Controle automatique de la mise en page du PDF de resultats.
//
//   node scripts/verifier-resultat-pdf.mjs [dossier-de-sortie]
//
// Genere des comptes rendus FICTIFS couvrant tous les types de resultat
// (valeur simple, qualitatif, NFS, ionogramme, bacteriologie, antibiogramme,
// spermogramme, interpretations, ...) puis verifie geometriquement chaque
// page : aucun texte ne chevauche un autre, rien ne sort des marges ni ne
// descend dans le pied de page, pas de grand blanc en bas de page.
// Chaque dossier est rendu avec un nombre variable de tests "de remplissage"
// en tete pour deplacer les sauts de page et tester toutes les positions.
// ============================================================================
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { rendre, controler } from './controle-geometrique.mjs'
import {
  scenarios,
  dossier,
  remplissage,
  resetSeq,
} from './donnees-fictives.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir =
  process.argv[2] || path.join(__dirname, '..', '..', 'apercu-resultats-pdf')
fs.mkdirSync(outDir, { recursive: true })

// --------------------------------- Execution -------------------------------
let total = 0
let echecs = 0
for (const [nom, fabrique] of Object.entries(scenarios)) {
  for (let n = 0; n <= 40; n++) {
    resetSeq()
    const options = {
      technique: n % 7 === 3,
      nom: n % 5 === 4 ? 'Ndiaye Diallo Ba Cissokho De La Fontaine' : undefined,
      prenom: n % 5 === 4 ? 'Marie-Antoinette Aïssatou' : undefined,
      prescripteur:
        n % 5 === 4
          ? 'Pr Abdoulaye Cheikh Tidiane Ndiaye, Hôpital Principal de Dakar'
          : undefined,
    }
    const invoice = dossier([...remplissage(n), ...fabrique()], options)
    const r = rendre(invoice)
    const errs = controler(r, {
      sautVoulu: nom === 'spermogramme' || nom === 'complet',
    })
    total++
    if (errs.length) {
      echecs++
      console.log(`ECHEC ${nom} (+${n}) : ${r.pages} page(s)`)
      ;[...new Set(errs)].slice(0, 8).forEach((e) => console.log('   - ' + e))
    }
    if (n === 0 || errs.length) {
      fs.writeFileSync(
        path.join(outDir, `${nom}${n ? `-plus${n}` : ''}.pdf`),
        Buffer.from(r.doc.output('arraybuffer'))
      )
    }
  }
}
console.log(
  `\n${total - echecs}/${total} rendus conformes. PDF d'exemple : ${outDir}`
)
process.exit(echecs ? 1 : 0)
