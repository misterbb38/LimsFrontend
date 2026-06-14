import { useEffect, useMemo, useState, Fragment } from 'react'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import Chatbot from '../components/Chatbot'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

// Palettes graphiques (compatibles dark/light DaisyUI)
const COLORS_TYPE = {
  assurance: '#0ea5e9', // bleu
  ipm: '#10b981', // vert
  sococim: '#f59e0b', // orange
  clinique: '#a855f7', // violet
  'sans partenaire': '#6b7280', // gris
}
const COLOR_PAIE = {
  Payée: '#10b981',
  Impayée: '#ef4444',
  Reliquat: '#f59e0b',
}

const MODE_COLOR = {
  'Espèces': 'border-emerald-500',
  'Wave': 'border-sky-500',
  'Orange money': 'border-orange-500',
  'Carte bancaire': 'border-violet-500',
  'Non spécifié': 'border-gray-400',
}

const MOIS = [
  '',
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

// Format FR : "1 234 567 CFA"
const fmt = (n) => {
  const v = Math.round(Number(n) || 0)
  return v.toLocaleString('fr-FR') + ' CFA'
}
const num = (n) => Number(n) || 0

// Cle de regroupement par premier mot du nom (ex: tous les AXA ensemble)
const getGroupKey = (name = '') => {
  const first = String(name).trim().split(/\s+/)[0] || ''
  return first.toUpperCase()
}

// Etat de pliage de chaque section principale. Defaut : tout ouvert
// sauf le detail par groupe (gros tableau) qui est replie par defaut.
const DEFAULT_OPEN = {
  kpis: true,
  charts: true,
  suivi: true,
  reliquats: true,
  reductions: true,
  detail: false,
}

function Compta() {
  const [analyses, setAnalyses] = useState([])
  const [etiquettes, setEtiquettes] = useState([])
  const [demandes, setDemandes] = useState([])
  const [openSections, setOpenSections] = useState({
    ...DEFAULT_OPEN,
    demandes: true,
  })
  // Filtres locaux pour la section Demandes de paiement
  const [demDateDebut, setDemDateDebut] = useState('')
  const [demDateFin, setDemDateFin] = useState('')
  const [demPartenaire, setDemPartenaire] = useState('')
  const [demStatut, setDemStatut] = useState('')
  const toggleSection = (k) =>
    setOpenSections((p) => ({ ...p, [k]: !p[k] }))
  // Filtres LOCAUX a la section Detail par groupe (en plus des
  // filtres globaux en haut de page).
  const [detailDateDebut, setDetailDateDebut] = useState('')
  const [detailDateFin, setDetailDateFin] = useState('')
  const [detailPartenaire, setDetailPartenaire] = useState('')
  const [loading, setLoading] = useState(true)
  const [erreur, setErreur] = useState('')

  // Filtres
  const [annee, setAnnee] = useState('')
  const [mois, setMois] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [partenaireFilter, setPartenaireFilter] = useState('')
  const [statutFilter, setStatutFilter] = useState('')

  // Chargement initial : on recupere TOUTES les analyses (calculs front)
  useEffect(() => {
    const ctrl = new AbortController()
    const fetchAll = async () => {
      setLoading(true)
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const token = userInfo?.token
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
        // Fetch parallele : analyses + etiquettes + demandes paiement
        const [aRes, eRes, dRes] = await Promise.all([
          fetch(`${apiUrl}/api/analyse`, { headers, signal: ctrl.signal }),
          fetch(`${apiUrl}/api/eti`, { headers, signal: ctrl.signal }),
          fetch(`${apiUrl}/api/demande-payement`, { headers, signal: ctrl.signal }),
        ])
        const aData = await aRes.json()
        const eData = await eRes.json()
        const dData = await dRes.json()
        if (aData.success) setAnalyses(aData.data || [])
        else setErreur('Erreur lors du chargement des analyses')
        if (eData.success) setEtiquettes(eData.data || [])
        if (dData.success) setDemandes(dData.data || [])
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error(e)
          setErreur(e.message)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
    return () => ctrl.abort()
  }, [])

  // Options dependantes des donnees chargees
  const anneeOptions = useMemo(() => {
    const set = new Set()
    analyses.forEach((a) => {
      if (a.createdAt) set.add(new Date(a.createdAt).getFullYear())
    })
    return Array.from(set).sort((a, b) => b - a)
  }, [analyses])

  const partenaireOptions = useMemo(() => {
    const set = new Set()
    analyses.forEach((a) => {
      if (a.partenaireId?.nom) set.add(a.partenaireId.nom)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'))
  }, [analyses])

  // Map analyseId -> etiquette partenaire (statut + somme + date paie).
  // Utilisee pour separer ce qui est encaisse cote patient vs cote
  // partenaire.
  const etiquetteByAnalyseId = useMemo(() => {
    const m = new Map()
    etiquettes.forEach((e) => {
      const aid = e.analyseId?._id || e.analyseId
      if (aid) m.set(String(aid), e)
    })
    return m
  }, [etiquettes])

  // Helper : retourne {partenairePaye, partenaireAttendu} pour une analyse
  const partenaireDetail = (a) => {
    const eti = etiquetteByAnalyseId.get(String(a._id))
    if (!eti) {
      // Pas d'etiquette : si l'analyse a une part partenaire on la
      // considere comme "attendu" (impayee).
      const att = num(a.prixPartenaire)
      return { partenairePaye: 0, partenaireAttendu: att }
    }
    const somme = num(eti.sommeAPayer)
    if (eti.statusPayement === 'Payée') {
      return { partenairePaye: somme, partenaireAttendu: 0 }
    }
    return { partenairePaye: 0, partenaireAttendu: somme }
  }

  // Application des filtres
  const filtered = useMemo(() => {
    return analyses.filter((a) => {
      const d = a.createdAt ? new Date(a.createdAt) : null
      if (annee && (!d || d.getFullYear() !== Number(annee))) return false
      if (mois && (!d || d.getMonth() + 1 !== Number(mois))) return false
      const t = a.partenaireId?.typePartenaire || 'sans partenaire'
      if (typeFilter && t !== typeFilter) return false
      if (
        partenaireFilter &&
        (a.partenaireId?.nom || '') !== partenaireFilter
      )
        return false
      if (statutFilter && a.statusPayement !== statutFilter) return false
      return true
    })
  }, [analyses, annee, mois, typeFilter, partenaireFilter, statutFilter])

  // === Agregations ===
  // Encaisse total = avance patient (paiements) + montant partenaire
  // de l'etiquette payee. Permet de differencier les deux sources de
  // revenu et de ne plus compter la part partenaire comme recue
  // automatiquement quand le patient paie sa part.
  const stats = useMemo(() => {
    let totalFacture = 0
    let totalPayePatient = 0
    let totalPayePartenaire = 0
    let totalImpayePatient = 0
    let totalImpayePartenaire = 0
    let totalReliquat = 0
    let totalPartenaire = 0
    let totalPatient = 0
    const patientsUniques = new Set()

    filtered.forEach((a) => {
      const prixTotal = num(a.prixTotal)
      const prixPart = num(a.prixPartenaire)
      const prixPat = num(a.prixPatient)
      const avance = num(a.avance)
      const reliquat = num(a.reliquat)
      totalFacture += prixTotal
      totalPartenaire += prixPart
      totalPatient += prixPat
      // Cote patient : encaisse = avance, impaye = reliquat ou prixPat
      totalPayePatient += avance
      if (a.statusPayement === 'Reliquat') totalReliquat += reliquat
      totalImpayePatient += Math.max(0, prixPat - avance)
      // Cote partenaire : on s'appuie sur l'etiquette
      const { partenairePaye, partenaireAttendu } = partenaireDetail(a)
      totalPayePartenaire += partenairePaye
      totalImpayePartenaire += partenaireAttendu
      if (a.userId?._id) patientsUniques.add(String(a.userId._id))
    })

    const totalPaye = totalPayePatient + totalPayePartenaire
    const totalImpaye = totalImpayePatient + totalImpayePartenaire

    return {
      totalFacture,
      totalPaye,
      totalImpaye,
      totalReliquat,
      totalAvance: totalPayePatient,
      totalPartenaire,
      totalPatient,
      totalPayePatient,
      totalPayePartenaire,
      totalImpayePatient,
      totalImpayePartenaire,
      nbAnalyses: filtered.length,
      nbPatients: patientsUniques.size,
    }
  }, [filtered, etiquetteByAnalyseId])

  // Repartition par type de partenaire (montant)
  const parType = useMemo(() => {
    const map = new Map()
    filtered.forEach((a) => {
      const t = a.partenaireId?.typePartenaire || 'sans partenaire'
      map.set(t, (map.get(t) || 0) + num(a.prixTotal))
    })
    return Array.from(map.entries())
      .map(([type, montant]) => ({ type, montant }))
      .sort((a, b) => b.montant - a.montant)
  }, [filtered])

  // Repartition par statut paiement (count)
  const parStatut = useMemo(() => {
    const map = new Map()
    filtered.forEach((a) => {
      const s = a.statusPayement || 'Inconnu'
      map.set(s, (map.get(s) || 0) + 1)
    })
    return Array.from(map.entries()).map(([statut, count]) => ({ statut, count }))
  }, [filtered])

  // Top 10 partenaires (montant CA)
  const topPartenaires = useMemo(() => {
    const map = new Map()
    filtered.forEach((a) => {
      const nom = a.partenaireId?.nom
      if (!nom) return
      map.set(nom, (map.get(nom) || 0) + num(a.prixTotal))
    })
    return Array.from(map.entries())
      .map(([nom, montant]) => ({ nom, montant }))
      .sort((a, b) => b.montant - a.montant)
      .slice(0, 10)
  }, [filtered])

  // Evolution mensuelle (12 mois de l'annee filtree, ou 12 derniers mois sinon)
  const evolutionMensuelle = useMemo(() => {
    const referenceAnnee = annee
      ? Number(annee)
      : new Date().getFullYear()
    const buckets = Array.from({ length: 12 }, (_, i) => ({
      mois: MOIS[i + 1].slice(0, 3),
      facture: 0,
      paye: 0,
    }))
    filtered.forEach((a) => {
      if (!a.createdAt) return
      const d = new Date(a.createdAt)
      if (d.getFullYear() !== referenceAnnee) return
      const idx = d.getMonth()
      const prixTotal = num(a.prixTotal)
      buckets[idx].facture += prixTotal
      if (a.statusPayement === 'Payée') buckets[idx].paye += prixTotal
      else if (a.statusPayement === 'Reliquat')
        buckets[idx].paye += prixTotal - num(a.reliquat)
    })
    return buckets
  }, [filtered, annee])

  // Detail par groupe (premier mot du nom partenaire) AVEC sous-liste
  // des filiales (chaque partenaire individuel du groupe). Permet
  // d'afficher en expand : AXA -> AXA BOYA / AXA EDUCO / AXA ADM ...
  const detailParGroupe = useMemo(() => {
    const emptyStats = () => ({
      nbFactures: 0,
      nbPayees: 0,
      nbImpayees: 0,
      nbReliquat: 0,
      totalFacture: 0,
      totalPaye: 0,
      totalImpaye: 0,
    })

    const apply = (target, a, partenaireMode = false) => {
      const prixTotal = num(a.prixTotal)
      const avance = num(a.avance)
      const prixPat = num(a.prixPatient)
      const prixPart = num(a.prixPartenaire)
      const { partenairePaye, partenaireAttendu } = partenaireDetail(a)

      if (partenaireMode) {
        // Vue partenaire pure : on ne compte que ce qui concerne le
        // partenaire (factures avec part partenaire > 0).
        if (prixPart <= 0) return
        target.nbFactures++
        target.totalFacture += prixPart
        target.totalPaye += partenairePaye
        target.totalImpaye += partenaireAttendu
        if (partenaireAttendu === 0) target.nbPayees++
        else target.nbImpayees++
      } else {
        // Vue globale (groupe) : combine patient + partenaire
        target.nbFactures++
        target.totalFacture += prixTotal
        const patientPaye = avance >= prixPat
        const partenaireOk = partenaireAttendu === 0
        if (patientPaye && partenaireOk) target.nbPayees++
        else if (avance > 0 || partenairePaye > 0) target.nbReliquat++
        else target.nbImpayees++
        target.totalPaye += avance + partenairePaye
        target.totalImpaye += Math.max(0, prixPat - avance) + partenaireAttendu
      }
    }

    // Sous-filtre LOCAL : detailDateDebut / detailDateFin / detailPartenaire
    const dDeb = detailDateDebut ? new Date(detailDateDebut) : null
    const dFin = detailDateFin
      ? (() => { const d = new Date(detailDateFin); d.setHours(23, 59, 59, 999); return d })()
      : null
    const sousFiltre = filtered.filter((a) => {
      if (dDeb && (!a.createdAt || new Date(a.createdAt) < dDeb)) return false
      if (dFin && (!a.createdAt || new Date(a.createdAt) > dFin)) return false
      if (detailPartenaire && (a.partenaireId?.nom || '') !== detailPartenaire)
        return false
      return true
    })

    const map = new Map()
    sousFiltre.forEach((a) => {
      const nomP = a.partenaireId?.nom || '(Sans partenaire)'
      const key = a.partenaireId ? getGroupKey(nomP) : '(Sans partenaire)'
      if (!map.has(key)) {
        map.set(key, {
          key,
          ...emptyStats(),
          typeMajoritaire: a.partenaireId?.typePartenaire || 'sans partenaire',
          filialesMap: new Map(), // nom -> stats
        })
      }
      const g = map.get(key)
      apply(g, a) // groupe : stats combinees (patient + partenaire)
      // Stats par filiale = stats PARTENAIRE PUR (sommes a percevoir
      // du partenaire, pas du patient). Plus de colonne reliquat
      // (le reliquat est un concept patient seulement).
      if (!g.filialesMap.has(nomP)) {
        g.filialesMap.set(nomP, {
          nom: nomP,
          type: a.partenaireId?.typePartenaire || 'sans partenaire',
          ...emptyStats(),
        })
      }
      apply(g.filialesMap.get(nomP), a, true)
    })

    return Array.from(map.values())
      .map((g) => ({
        ...g,
        filiales: Array.from(g.filialesMap.values()).sort(
          (a, b) => b.totalFacture - a.totalFacture
        ),
        nbFiliales: g.filialesMap.size,
      }))
      .sort((a, b) => b.totalFacture - a.totalFacture)
  }, [filtered, etiquetteByAnalyseId, detailDateDebut, detailDateFin, detailPartenaire])

  const [expandedGroups, setExpandedGroups] = useState({})
  const toggleGroup = (key) =>
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }))

  // === Suivi paiements : section autonome (independante des filtres
  //     globaux) avec ses propres boutons periode + vue ===
  const [suiviPeriode, setSuiviPeriode] = useState('jour') // jour | semaine | mois
  const [suiviVue, setSuiviVue] = useState('total') // recu | arecevoir | total

  const suiviStats = useMemo(() => {
    const now = new Date()
    const startToday = new Date(now)
    startToday.setHours(0, 0, 0, 0)
    const startWeek = (() => {
      const d = new Date(startToday)
      const day = d.getDay() // 0 = dim
      const diff = (day + 6) % 7 // lundi = 0
      d.setDate(d.getDate() - diff)
      return d
    })()
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startPeriod =
      suiviPeriode === 'jour'
        ? startToday
        : suiviPeriode === 'semaine'
          ? startWeek
          : startMonth

    const inPeriod = analyses.filter((a) => {
      if (!a.createdAt) return false
      return new Date(a.createdAt) >= startPeriod
    })

    let nb = inPeriod.length
    let caTotal = 0
    let payePatient = 0
    let payePartenaire = 0
    let aRecevoirPatient = 0
    let aRecevoirPartenaire = 0
    const modes = {} // detail par mode de paiement

    inPeriod.forEach((a) => {
      const prixTotal = num(a.prixTotal)
      const prixPatient = num(a.prixPatient)
      const avance = num(a.avance)

      caTotal += prixTotal
      // Patient : reellement encaisse vs reste a percevoir
      payePatient += avance
      aRecevoirPatient += Math.max(0, prixPatient - avance)
      // Partenaire : depend du statut de l'etiquette (Payee / Impayee)
      const { partenairePaye, partenaireAttendu } = partenaireDetail(a)
      payePartenaire += partenairePaye
      aRecevoirPartenaire += partenaireAttendu

      // Detail par mode (a partir du tableau paiements multi-modes).
      // Si l'analyse a une avance mais aucun paiement detaille, on
      // bascule le montant dans 'Non specifie' pour ne pas perdre
      // l'information.
      const detailMontant = Array.isArray(a.paiements)
        ? a.paiements.reduce((s, p) => s + (Number(p?.montant) || 0), 0)
        : 0
      if (Array.isArray(a.paiements) && a.paiements.length > 0) {
        a.paiements.forEach((p) => {
          const m = p?.mode || 'Non spécifié'
          modes[m] = (modes[m] || 0) + (Number(p?.montant) || 0)
        })
      }
      // Difference entre avance reelle et detail = portion non
      // categorisee (anciennes analyses sans paiements[]).
      const restant = avance - detailMontant
      if (restant > 0) {
        modes['Non spécifié'] = (modes['Non spécifié'] || 0) + restant
      }
    })

    // Toujours afficher les 4 modes officiels meme a zero pour
    // visibilite, plus 'Non specifie' s'il y a du montant non
    // categorise.
    const MODES_FIXES = ['Espèces', 'Wave', 'Orange money', 'Carte bancaire']
    const allModes = new Set([...MODES_FIXES, ...Object.keys(modes)])
    const modesArr = Array.from(allModes).map((m) => ({
      mode: m,
      montant: modes[m] || 0,
    }))

    return {
      nb,
      caTotal,
      recu: payePatient + payePartenaire,
      aRecevoir: aRecevoirPatient + aRecevoirPartenaire,
      payePatient,
      payePartenaire,
      aRecevoirPatient,
      aRecevoirPartenaire,
      modes: modesArr.sort((a, b) => b.montant - a.montant),
    }
  }, [analyses, etiquetteByAnalyseId, suiviPeriode])

  const suiviMontantPrincipal =
    suiviVue === 'recu'
      ? suiviStats.recu
      : suiviVue === 'arecevoir'
        ? suiviStats.aRecevoir
        : suiviStats.caTotal
  const suiviLabelPrincipal =
    suiviVue === 'recu'
      ? 'Argent reçu'
      : suiviVue === 'arecevoir'
        ? "Argent à recevoir"
        : 'Total facturé'
  const suiviColorPrincipal =
    suiviVue === 'recu'
      ? 'success'
      : suiviVue === 'arecevoir'
        ? 'error'
        : 'primary'
  const suiviPeriodeLabel =
    suiviPeriode === 'jour'
      ? "Aujourd'hui"
      : suiviPeriode === 'semaine'
        ? 'Cette semaine'
        : 'Ce mois-ci'

  // Onglet (Toutes / Payées / Impayées / Reliquat) propre a chaque
  // tiroir de groupe ouvert.
  const [groupTab, setGroupTab] = useState({})
  const getGroupTab = (key) => groupTab[key] || 'all'
  const setGroupTabFor = (key, val) =>
    setGroupTab((prev) => ({ ...prev, [key]: val }))

  // Pour le tiroir : recupere les analyses du groupe (eventuellement
  // filtrees par statut). On reutilise la liste deja filtree par
  // les filtres globaux.
  const getAnalysesOfGroup = (key, tab) => {
    const dDeb = detailDateDebut ? new Date(detailDateDebut) : null
    const dFin = detailDateFin
      ? (() => { const d = new Date(detailDateFin); d.setHours(23, 59, 59, 999); return d })()
      : null
    return filtered.filter((a) => {
      const nomP = a.partenaireId?.nom || '(Sans partenaire)'
      const k = a.partenaireId ? getGroupKey(nomP) : '(Sans partenaire)'
      if (k !== key) return false
      // Sous-filtre local Detail (date + partenaire) coherent avec
      // detailParGroupe
      if (dDeb && (!a.createdAt || new Date(a.createdAt) < dDeb)) return false
      if (dFin && (!a.createdAt || new Date(a.createdAt) > dFin)) return false
      if (detailPartenaire && nomP !== detailPartenaire) return false
      if (tab === 'paye') return a.statusPayement === 'Payée'
      if (tab === 'impaye') return a.statusPayement === 'Impayée'
      if (tab === 'reliquat') return a.statusPayement === 'Reliquat'
      return true
    })
  }

  // === Reliquats patient (analyses avec part patient non entierement payee) ===
  const reliquatsStats = useMemo(() => {
    const items = filtered
      .map((a) => {
        const prixPatient = num(a.prixPatient)
        const avance = num(a.avance)
        const reliquat = Math.max(0, prixPatient - avance)
        if (reliquat <= 0) return null
        return {
          analyse: a,
          prixPatient,
          avance,
          reliquat,
          paiements: Array.isArray(a.paiements) ? a.paiements : [],
        }
      })
      .filter(Boolean)
      .sort((a, b) => b.reliquat - a.reliquat)
    const totalReliquat = items.reduce((s, x) => s + x.reliquat, 0)
    const totalPayeDeja = items.reduce((s, x) => s + x.avance, 0)
    const totalDu = items.reduce((s, x) => s + x.prixPatient, 0)
    return {
      items,
      nb: items.length,
      totalReliquat,
      totalPayeDeja,
      totalDu,
    }
  }, [filtered])

  const [reliquatExpand, setReliquatExpand] = useState({})
  const toggleReliquat = (id) =>
    setReliquatExpand((prev) => ({ ...prev, [id]: !prev[id] }))

  // === Demandes de paiement filtrees pour la section Compta ===
  const demandesFiltrees = useMemo(() => {
    const dDeb = demDateDebut ? new Date(demDateDebut) : null
    const dFin = demDateFin
      ? (() => { const d = new Date(demDateFin); d.setHours(23,59,59,999); return d })()
      : null
    return demandes.filter((d) => {
      if (dDeb && new Date(d.createdAt) < dDeb) return false
      if (dFin && new Date(d.createdAt) > dFin) return false
      if (demPartenaire && (d.partenaireId?.nom || '') !== demPartenaire) return false
      if (demStatut && d.statusPayement !== demStatut) return false
      return true
    })
  }, [demandes, demDateDebut, demDateFin, demPartenaire, demStatut])

  const demandesStats = useMemo(() => {
    let total = 0, paye = 0, impaye = 0, nbPaye = 0, nbImpaye = 0
    demandesFiltrees.forEach((d) => {
      const s = num(d.sommeTotale)
      total += s
      if (d.statusPayement === 'Payée') { paye += s; nbPaye++ }
      else { impaye += s; nbImpaye++ }
    })
    return { total, paye, impaye, nbPaye, nbImpaye, nb: demandesFiltrees.length }
  }, [demandesFiltrees])

  const partenairesDemandes = useMemo(() =>
    Array.from(new Set(demandes.map(d => d.partenaireId?.nom).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, 'fr'))
  , [demandes])

  // === Reductions ===
  const reductionsStats = useMemo(() => {
    const avec = filtered.filter((a) => num(a.reduction) > 0)
    let totalReductionMontant = 0
    let totalReductionPourcentage = 0
    let totalMontantReduit = 0 // somme reelle deduite du CA
    const parPartenaire = new Map()
    const parPatient = new Map()
    avec.forEach((a) => {
      const r = num(a.reduction)
      let montantDeduit = 0
      // La reduction s'applique sur la PART PATIENT, pas sur le CA
      // total. En base, prixPatient est deja apres reduction. Pour
      // retrouver le montant deduit en pourcentage on inverse :
      //   prixPatient = prixPatientAvant * (1 - r/100)
      //   montantDeduit = prixPatientAvant - prixPatient
      //                 = prixPatient * r / (100 - r)
      if (a.typeReduction === 'pourcentage') {
        totalReductionPourcentage++
        if (r > 0 && r < 100) {
          montantDeduit = (num(a.prixPatient) * r) / (100 - r)
        }
      } else {
        totalReductionMontant++
        montantDeduit = r
      }
      totalMontantReduit += montantDeduit
      const np = a.partenaireId?.nom || '(Sans partenaire)'
      parPartenaire.set(np, (parPartenaire.get(np) || 0) + montantDeduit)
      const pu =
        (a.userId?.nom || '') +
        ' ' +
        (a.userId?.prenom || '')
      parPatient.set(pu.trim() || '(?)', (parPatient.get(pu.trim() || '(?)') || 0) + montantDeduit)
    })
    return {
      nbAvec: avec.length,
      totalReductionMontant,
      totalReductionPourcentage,
      totalMontantReduit,
      analyses: avec,
      topPartenaires: Array.from(parPartenaire.entries())
        .map(([nom, m]) => ({ nom, montant: m }))
        .sort((a, b) => b.montant - a.montant)
        .slice(0, 10),
      topPatients: Array.from(parPatient.entries())
        .map(([nom, m]) => ({ nom, montant: m }))
        .sort((a, b) => b.montant - a.montant)
        .slice(0, 10),
    }
  }, [filtered])

  const resetFilters = () => {
    setAnnee('')
    setMois('')
    setTypeFilter('')
    setPartenaireFilter('')
    setStatutFilter('')
  }
  const aucunFiltre =
    !annee && !mois && !typeFilter && !partenaireFilter && !statutFilter

  return (
    <div className="base-content bg-base-100 mx-auto p-4 min-h-[800px]">
      <Chatbot />
      <NavigationBreadcrumb pageName="Comptabilité" />
      <div className="divider"></div>

      {/* === FILTRES === */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="label py-1">
                <span className="label-text text-xs">Année</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={annee}
                onChange={(e) => setAnnee(e.target.value)}
              >
                <option value="">Toutes</option>
                {anneeOptions.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label py-1">
                <span className="label-text text-xs">Mois</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={mois}
                onChange={(e) => setMois(e.target.value)}
              >
                <option value="">Tous</option>
                {MOIS.slice(1).map((m, i) => (
                  <option key={m} value={i + 1}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label py-1">
                <span className="label-text text-xs">Type partenaire</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">Tous</option>
                <option value="assurance">Assurance</option>
                <option value="ipm">IPM</option>
                <option value="sococim">Sococim</option>
                <option value="clinique">Clinique</option>
                <option value="sans partenaire">Sans partenaire</option>
              </select>
            </div>

            <div>
              <label className="label py-1">
                <span className="label-text text-xs">Partenaire</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={partenaireFilter}
                onChange={(e) => setPartenaireFilter(e.target.value)}
              >
                <option value="">Tous</option>
                {partenaireOptions.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label py-1">
                <span className="label-text text-xs">Statut paiement</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={statutFilter}
                onChange={(e) => setStatutFilter(e.target.value)}
              >
                <option value="">Tous</option>
                <option value="Payée">Payée</option>
                <option value="Impayée">Impayée</option>
                <option value="Reliquat">Reliquat</option>
              </select>
            </div>

            {!aucunFiltre && (
              <button className="btn btn-sm btn-ghost" onClick={resetFilters}>
                Réinitialiser
              </button>
            )}

            <div className="ml-auto text-sm opacity-70">
              {filtered.length} / {analyses.length} analyses
            </div>
          </div>
        </div>
      </div>

      {erreur && (
        <div className="alert alert-error mt-4">
          <span>{erreur}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : (
        <>
          {/* === KPIs === */}
          <Section
            title="Indicateurs clés"
            isOpen={openSections.kpis}
            onToggle={() => toggleSection('kpis')}
          >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard
              label="Chiffre d'affaires"
              value={fmt(stats.totalFacture)}
              hint={`${stats.nbAnalyses} analyses`}
              color="primary"
            />
            <KpiCard
              label="Encaissé"
              value={fmt(stats.totalPaye)}
              hint={`${pct(stats.totalPaye, stats.totalFacture)}% du CA`}
              color="success"
            />
            <KpiCard
              label="Impayé"
              value={fmt(stats.totalImpaye + stats.totalReliquat)}
              hint={`Reliquat : ${fmt(stats.totalReliquat)}`}
              color="error"
            />
            <KpiCard
              label="Patients uniques"
              value={String(stats.nbPatients)}
              hint={`Avance totale : ${fmt(stats.totalAvance)}`}
              color="info"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            <KpiCard
              label="Part Patient"
              value={fmt(stats.totalPatient)}
              hint={`${pct(stats.totalPatient, stats.totalFacture)}% du CA`}
              color="neutral"
            />
            <KpiCard
              label="Part Partenaire"
              value={fmt(stats.totalPartenaire)}
              hint={`${pct(stats.totalPartenaire, stats.totalFacture)}% du CA`}
              color="neutral"
            />
            <KpiCard
              label="Ticket moyen"
              value={fmt(
                stats.nbAnalyses ? stats.totalFacture / stats.nbAnalyses : 0
              )}
              hint="Par analyse"
              color="neutral"
            />
          </div>
          </Section>

          {/* === GRAPHIQUES === */}
          <Section
            title="Graphiques"
            isOpen={openSections.charts}
            onToggle={() => toggleSection('charts')}
          >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Répartition par type de partenaire (CA)">
              {parType.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={parType}
                      dataKey="montant"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={(e) =>
                        `${e.type} ${pct(e.montant, stats.totalFacture)}%`
                      }
                    >
                      {parType.map((entry) => (
                        <Cell
                          key={entry.type}
                          fill={COLORS_TYPE[entry.type] || '#999'}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Répartition par statut de paiement (nb)">
              {parStatut.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={parStatut}
                      dataKey="count"
                      nameKey="statut"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={(e) =>
                        `${e.statut} (${e.count})`
                      }
                    >
                      {parStatut.map((entry) => (
                        <Cell
                          key={entry.statut}
                          fill={COLOR_PAIE[entry.statut] || '#999'}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard title="Top 10 partenaires par CA">
              {topPartenaires.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topPartenaires}
                    layout="vertical"
                    margin={{ left: 20, right: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => v / 1000 + 'k'} />
                    <YAxis
                      type="category"
                      dataKey="nom"
                      width={150}
                      style={{ fontSize: 11 }}
                    />
                    <Tooltip formatter={(v) => fmt(v)} />
                    <Bar dataKey="montant" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard
              title={`Évolution mensuelle ${annee || new Date().getFullYear()}`}
            >
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolutionMensuelle}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis tickFormatter={(v) => v / 1000 + 'k'} />
                  <Tooltip formatter={(v) => fmt(v)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="facture"
                    name="Facturé"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="paye"
                    name="Encaissé"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          </Section>

          {/* === SUIVI PAIEMENTS (independant des filtres globaux) === */}
          <Section
            title={`Suivi des paiements — ${suiviPeriodeLabel}`}
            isOpen={openSections.suivi}
            onToggle={() => toggleSection('suivi')}
          >
            <div>
              <div className="flex flex-wrap items-center justify-end gap-3 mb-3">
                <div className="flex flex-wrap gap-2">
                  <div role="tablist" className="tabs tabs-boxed tabs-sm">
                    <a
                      role="tab"
                      className={`tab ${suiviPeriode === 'jour' ? 'tab-active' : ''}`}
                      onClick={() => setSuiviPeriode('jour')}
                    >
                      Aujourd&apos;hui
                    </a>
                    <a
                      role="tab"
                      className={`tab ${suiviPeriode === 'semaine' ? 'tab-active' : ''}`}
                      onClick={() => setSuiviPeriode('semaine')}
                    >
                      Semaine
                    </a>
                    <a
                      role="tab"
                      className={`tab ${suiviPeriode === 'mois' ? 'tab-active' : ''}`}
                      onClick={() => setSuiviPeriode('mois')}
                    >
                      Mois
                    </a>
                  </div>
                  <div role="tablist" className="tabs tabs-boxed tabs-sm">
                    <a
                      role="tab"
                      className={`tab ${suiviVue === 'recu' ? 'tab-active' : ''}`}
                      onClick={() => setSuiviVue('recu')}
                    >
                      Reçu
                    </a>
                    <a
                      role="tab"
                      className={`tab ${suiviVue === 'arecevoir' ? 'tab-active' : ''}`}
                      onClick={() => setSuiviVue('arecevoir')}
                    >
                      À recevoir
                    </a>
                    <a
                      role="tab"
                      className={`tab ${suiviVue === 'total' ? 'tab-active' : ''}`}
                      onClick={() => setSuiviVue('total')}
                    >
                      Total
                    </a>
                  </div>
                </div>
              </div>

              {/* Mise en avant du montant principal selon la vue choisie */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="md:col-span-1">
                  <KpiCard
                    label={suiviLabelPrincipal}
                    value={fmt(suiviMontantPrincipal)}
                    hint={`${pct(suiviMontantPrincipal, suiviStats.caTotal)}% du CA`}
                    color={suiviColorPrincipal}
                  />
                </div>
                <KpiCard
                  label="Nombre d'analyses"
                  value={String(suiviStats.nb)}
                  hint={
                    suiviStats.nb
                      ? `Ticket moyen : ${fmt(suiviStats.caTotal / suiviStats.nb)}`
                      : '-'
                  }
                  color="neutral"
                />
                <KpiCard
                  label="Total facturé"
                  value={fmt(suiviStats.caTotal)}
                  hint="Hors statut paiement"
                  color="primary"
                />
              </div>

              {/* Detail receveur / a recevoir */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <KpiCard
                  label="Reçu (total)"
                  value={fmt(suiviStats.recu)}
                  hint={`${pct(suiviStats.recu, suiviStats.caTotal)}%`}
                  color="success"
                />
                <KpiCard
                  label="Non reçu"
                  value={fmt(suiviStats.aRecevoir)}
                  hint={`${pct(suiviStats.aRecevoir, suiviStats.caTotal)}%`}
                  color="error"
                />
                <KpiCard
                  label="Payé par patient"
                  value={fmt(suiviStats.payePatient)}
                  hint={`${pct(suiviStats.payePatient, suiviStats.caTotal)}% du CA`}
                  color="info"
                />
                <KpiCard
                  label="Payé par partenaire"
                  value={fmt(suiviStats.payePartenaire)}
                  hint={`${pct(suiviStats.payePartenaire, suiviStats.caTotal)}% du CA`}
                  color="warning"
                />
              </div>

              {/* Detail par mode de paiement (multi-modes + non specifie) */}
              <div>
                <h4 className="font-semibold text-sm mb-2">
                  Détail par mode de paiement reçu
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {suiviStats.modes.map((m) => {
                    const color = MODE_COLOR[m.mode] || 'border-base-300'
                    return (
                      <div
                        key={m.mode}
                        className={`bg-base-100 rounded-lg p-3 border-l-4 ${color}`}
                      >
                        <div className="text-xs opacity-70">{m.mode}</div>
                        <div className="font-bold text-lg">
                          {fmt(m.montant)}
                        </div>
                        <div className="text-xs opacity-50">
                          {pct(m.montant, suiviStats.recu)}% du reçu
                        </div>
                      </div>
                    )
                  })}
                </div>
                {suiviStats.recu === 0 && (
                  <div className="text-xs opacity-50 italic mt-2">
                    Aucun paiement reçu sur la période.
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* === RELIQUATS PATIENT === */}
          <Section
            title="Reliquats patient — historique et détail"
            isOpen={openSections.reliquats}
            onToggle={() => toggleSection('reliquats')}
          >
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard
                  label="Analyses avec reliquat"
                  value={String(reliquatsStats.nb)}
                  hint={`${pct(reliquatsStats.nb, stats.nbAnalyses)}% du total`}
                  color="warning"
                />
                <KpiCard
                  label="Total reliquat patient"
                  value={fmt(reliquatsStats.totalReliquat)}
                  hint="Reste à percevoir des patients"
                  color="error"
                />
                <KpiCard
                  label="Déjà payé sur ces analyses"
                  value={fmt(reliquatsStats.totalPayeDeja)}
                  hint={`${pct(reliquatsStats.totalPayeDeja, reliquatsStats.totalDu)}% de la dette`}
                  color="success"
                />
                <KpiCard
                  label="Part patient totale"
                  value={fmt(reliquatsStats.totalDu)}
                  hint="Sur les analyses concernées"
                  color="neutral"
                />
              </div>

              {reliquatsStats.items.length === 0 ? (
                <div className="text-sm opacity-50 italic mt-3">
                  Aucun reliquat patient en attente.
                </div>
              ) : (
                <div className="overflow-x-auto mt-3">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th className="w-8"></th>
                        <th>Date</th>
                        <th>Identifiant</th>
                        <th>Patient</th>
                        <th>Partenaire</th>
                        <th className="text-right">Part patient</th>
                        <th className="text-right">Déjà payé</th>
                        <th className="text-right">Reliquat</th>
                        <th className="text-right">% payé</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reliquatsStats.items.map((r) => {
                        const a = r.analyse
                        const isOpen = !!reliquatExpand[a._id]
                        return (
                          <Fragment key={a._id}>
                            <tr>
                              <td>
                                <button
                                  className="btn btn-ghost btn-xs"
                                  onClick={() => toggleReliquat(a._id)}
                                  aria-label={isOpen ? 'Replier' : 'Déplier'}
                                >
                                  {isOpen ? '▼' : '▶'}
                                </button>
                              </td>
                              <td className="text-sm">
                                {new Date(a.createdAt).toLocaleDateString('fr-FR')}
                              </td>
                              <td className="font-mono text-xs">
                                {a.identifiant}
                              </td>
                              <td>
                                {a.userId?.nom} {a.userId?.prenom}
                              </td>
                              <td className="text-sm">
                                {a.partenaireId?.nom || '-'}
                              </td>
                              <td className="text-right">{fmt(r.prixPatient)}</td>
                              <td className="text-right text-success">
                                {fmt(r.avance)}
                              </td>
                              <td className="text-right text-error font-semibold">
                                {fmt(r.reliquat)}
                              </td>
                              <td className="text-right">
                                {pct(r.avance, r.prixPatient)}%
                              </td>
                            </tr>
                            {isOpen && (
                              <tr className="bg-base-100">
                                <td></td>
                                <td colSpan={8} className="p-3">
                                  <div className="text-xs font-semibold mb-2 opacity-70">
                                    Historique des paiements
                                  </div>
                                  {r.paiements.length === 0 ? (
                                    <div className="text-xs opacity-50 italic">
                                      Aucun paiement détaillé enregistré
                                      pour cette analyse. Le montant
                                      «&nbsp;déjà payé&nbsp;» ({fmt(r.avance)})
                                      provient de l&apos;avance globale.
                                    </div>
                                  ) : (
                                    <table className="table table-xs">
                                      <thead>
                                        <tr>
                                          <th>Date</th>
                                          <th>Mode</th>
                                          <th className="text-right">Montant</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {r.paiements.map((p, i) => (
                                          <tr key={i}>
                                            <td>
                                              {p.date
                                                ? new Date(p.date).toLocaleString(
                                                    'fr-FR',
                                                    {
                                                      day: '2-digit',
                                                      month: 'short',
                                                      year: 'numeric',
                                                    }
                                                  )
                                                : '-'}
                                            </td>
                                            <td>
                                              <span className="badge badge-xs badge-outline">
                                                {p.mode}
                                              </span>
                                            </td>
                                            <td className="text-right">
                                              {fmt(p.montant)}
                                            </td>
                                          </tr>
                                        ))}
                                        <tr className="font-semibold">
                                          <td colSpan={2} className="text-right">
                                            Total reçu
                                          </td>
                                          <td className="text-right text-success">
                                            {fmt(r.avance)}
                                          </td>
                                        </tr>
                                        <tr className="font-semibold">
                                          <td colSpan={2} className="text-right">
                                            Reste à percevoir
                                          </td>
                                          <td className="text-right text-error">
                                            {fmt(r.reliquat)}
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  )}
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Section>

          {/* === DEMANDES DE PAIEMENT === */}
          <Section
            title="Demandes de paiement"
            isOpen={openSections.demandes}
            onToggle={() => toggleSection('demandes')}
            headerExtra={
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="date"
                  className="input input-bordered input-xs"
                  value={demDateDebut}
                  onChange={(e) => setDemDateDebut(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  title="Date début"
                />
                <input
                  type="date"
                  className="input input-bordered input-xs"
                  value={demDateFin}
                  onChange={(e) => setDemDateFin(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  title="Date fin"
                />
                <select
                  className="select select-bordered select-xs"
                  value={demPartenaire}
                  onChange={(e) => setDemPartenaire(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Tous partenaires</option>
                  {partenairesDemandes.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select
                  className="select select-bordered select-xs"
                  value={demStatut}
                  onChange={(e) => setDemStatut(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Tous statuts</option>
                  <option value="Payée">Payée</option>
                  <option value="Impayée">Impayée</option>
                </select>
              </div>
            }
          >
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <KpiCard
                  label="Nb demandes"
                  value={String(demandesStats.nb)}
                  hint={`${demandesStats.nbPaye} payées / ${demandesStats.nbImpaye} impayées`}
                  color="primary"
                />
                <KpiCard
                  label="Montant total"
                  value={fmt(demandesStats.total)}
                  color="neutral"
                />
                <KpiCard
                  label="Payé"
                  value={fmt(demandesStats.paye)}
                  hint={`${pct(demandesStats.paye, demandesStats.total)}%`}
                  color="success"
                />
                <KpiCard
                  label="Impayé"
                  value={fmt(demandesStats.impaye)}
                  hint={`${pct(demandesStats.impaye, demandesStats.total)}%`}
                  color="error"
                />
              </div>

              {demandesFiltrees.length === 0 ? (
                <div className="text-sm opacity-50 italic">
                  Aucune demande de paiement pour ces filtres.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table table-zebra table-sm">
                    <thead>
                      <tr>
                        <th>Référence</th>
                        <th>Partenaire</th>
                        <th>Période</th>
                        <th className="text-right">Nb factures</th>
                        <th className="text-right">Montant</th>
                        <th>Statut</th>
                        <th>Créée le</th>
                      </tr>
                    </thead>
                    <tbody>
                      {demandesFiltrees.map((d) => (
                        <tr key={d._id}>
                          <td className="font-mono text-xs">{d.reference || '-'}</td>
                          <td>{d.partenaireId?.nom || '-'}</td>
                          <td className="text-sm">
                            {new Date(d.dateDebut).toLocaleDateString('fr-FR')} →{' '}
                            {new Date(d.dateFin).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="text-right">{d.nombreFactures}</td>
                          <td className="text-right font-semibold">{fmt(d.sommeTotale)}</td>
                          <td>
                            <span
                              className={`badge badge-sm ${d.statusPayement === 'Payée' ? 'badge-success' : 'badge-error'}`}
                            >
                              {d.statusPayement}
                            </span>
                          </td>
                          <td className="text-sm">
                            {new Date(d.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Section>

          {/* === REDUCTIONS === */}
          <Section
            title="Réductions accordées"
            isOpen={openSections.reductions}
            onToggle={() => toggleSection('reductions')}
          >
            <div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard
                  label="Total réduit"
                  value={fmt(reductionsStats.totalMontantReduit)}
                  hint={`${pct(reductionsStats.totalMontantReduit, stats.totalFacture)}% du CA`}
                  color="warning"
                />
                <KpiCard
                  label="Nb analyses"
                  value={String(reductionsStats.nbAvec)}
                  hint={`${pct(reductionsStats.nbAvec, stats.nbAnalyses)}% des analyses`}
                  color="neutral"
                />
                <KpiCard
                  label="Type %"
                  value={String(reductionsStats.totalReductionPourcentage)}
                  hint="Réductions en pourcentage"
                  color="neutral"
                />
                <KpiCard
                  label="Type montant"
                  value={String(reductionsStats.totalReductionMontant)}
                  hint="Réductions en montant fixe"
                  color="neutral"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">
                    Top 10 partenaires bénéficiaires
                  </h4>
                  {reductionsStats.topPartenaires.length === 0 ? (
                    <div className="opacity-50 text-sm">Aucune réduction</div>
                  ) : (
                    <table className="table table-zebra table-xs">
                      <thead>
                        <tr>
                          <th>Partenaire</th>
                          <th className="text-right">Total réduit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reductionsStats.topPartenaires.map((p) => (
                          <tr key={p.nom}>
                            <td>{p.nom}</td>
                            <td className="text-right">{fmt(p.montant)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm">
                    Top 10 patients bénéficiaires
                  </h4>
                  {reductionsStats.topPatients.length === 0 ? (
                    <div className="opacity-50 text-sm">Aucune réduction</div>
                  ) : (
                    <table className="table table-zebra table-xs">
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th className="text-right">Total réduit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reductionsStats.topPatients.map((p) => (
                          <tr key={p.nom}>
                            <td>{p.nom}</td>
                            <td className="text-right">{fmt(p.montant)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {reductionsStats.analyses.length > 0 && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-semibold">
                    Voir le détail des {reductionsStats.analyses.length} analyses avec réduction
                  </summary>
                  <div className="overflow-x-auto mt-2">
                    <table className="table table-zebra table-xs">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Identifiant</th>
                          <th>Patient</th>
                          <th>Partenaire</th>
                          <th>Type réduc.</th>
                          <th className="text-right">Valeur</th>
                          <th className="text-right">Part patient avant</th>
                          <th className="text-right">Montant déduit</th>
                          <th className="text-right">Restant patient</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reductionsStats.analyses.map((a) => {
                          const r = num(a.reduction)
                          let montantDeduit = 0
                          let prixPatientAvant = num(a.prixPatient)
                          if (a.typeReduction === 'pourcentage' && r > 0 && r < 100) {
                            montantDeduit = (num(a.prixPatient) * r) / (100 - r)
                            prixPatientAvant = num(a.prixPatient) + montantDeduit
                          } else if (a.typeReduction === 'montant') {
                            montantDeduit = r
                            prixPatientAvant = num(a.prixPatient) + r
                          }
                          return (
                            <tr key={a._id}>
                              <td>
                                {a.createdAt
                                  ? new Date(a.createdAt).toLocaleDateString('fr-FR')
                                  : '-'}
                              </td>
                              <td className="font-mono">{a.identifiant}</td>
                              <td>
                                {a.userId?.nom} {a.userId?.prenom}
                              </td>
                              <td>{a.partenaireId?.nom || '-'}</td>
                              <td>
                                <span className="badge badge-xs badge-outline">
                                  {a.typeReduction === 'pourcentage' ? '%' : 'CFA'}
                                </span>
                              </td>
                              <td className="text-right">
                                {a.typeReduction === 'pourcentage'
                                  ? a.reduction + '%'
                                  : fmt(a.reduction)}
                              </td>
                              <td className="text-right">
                                {fmt(prixPatientAvant)}
                              </td>
                              <td className="text-right text-warning">
                                -{fmt(montantDeduit)}
                              </td>
                              <td className="text-right">{fmt(a.prixPatient)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </details>
              )}
            </div>
          </Section>

          {/* === DETAIL PAR GROUPE === */}
          <Section
            title="Détail par groupe de partenaires"
            isOpen={openSections.detail}
            onToggle={() => toggleSection('detail')}
            headerExtra={
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  type="date"
                  className="input input-bordered input-xs"
                  value={detailDateDebut}
                  onChange={(e) => setDetailDateDebut(e.target.value)}
                  title="Date début"
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  type="date"
                  className="input input-bordered input-xs"
                  value={detailDateFin}
                  onChange={(e) => setDetailDateFin(e.target.value)}
                  title="Date fin"
                  onClick={(e) => e.stopPropagation()}
                />
                <select
                  className="select select-bordered select-xs"
                  value={detailPartenaire}
                  onChange={(e) => setDetailPartenaire(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Tous partenaires</option>
                  {partenaireOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {(detailDateDebut || detailDateFin || detailPartenaire) && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDetailDateDebut('')
                      setDetailDateFin('')
                      setDetailPartenaire('')
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            }
          >
            <div>
              <div className="overflow-x-auto">
                <table className="table table-zebra table-sm">
                  <thead>
                    <tr>
                      <th className="w-8"></th>
                      <th>Groupe / Partenaire</th>
                      <th>Type</th>
                      <th className="text-right">Filiales</th>
                      <th className="text-right">Factures</th>
                      <th className="text-right">Payées</th>
                      <th className="text-right">Impayées</th>
                      <th className="text-right">Reliquat</th>
                      <th className="text-right">CA</th>
                      <th className="text-right">Encaissé</th>
                      <th className="text-right">Restant dû</th>
                      <th className="text-right">% encaissé</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailParGroupe.length === 0 && (
                      <tr>
                        <td colSpan={12} className="text-center opacity-50">
                          Aucune donnée
                        </td>
                      </tr>
                    )}
                    {detailParGroupe.map((g) => {
                      const isOpen = !!expandedGroups[g.key]
                      const hasFiliales = g.nbFiliales > 1
                      return (
                        <Fragment key={g.key}>
                          <tr className="font-semibold">
                            <td>
                              {hasFiliales ? (
                                <button
                                  className="btn btn-ghost btn-xs"
                                  onClick={() => toggleGroup(g.key)}
                                  aria-label={isOpen ? 'Replier' : 'Déplier'}
                                >
                                  {isOpen ? '▼' : '▶'}
                                </button>
                              ) : null}
                            </td>
                            <td>{g.key}</td>
                            <td>
                              <span className="badge badge-sm badge-outline">
                                {g.typeMajoritaire}
                              </span>
                            </td>
                            <td className="text-right">{g.nbFiliales}</td>
                            <td className="text-right">{g.nbFactures}</td>
                            <td className="text-right text-success">
                              {g.nbPayees}
                            </td>
                            <td className="text-right text-error">
                              {g.nbImpayees}
                            </td>
                            <td className="text-right text-warning">
                              {g.nbReliquat}
                            </td>
                            <td className="text-right">{fmt(g.totalFacture)}</td>
                            <td className="text-right text-success">
                              {fmt(g.totalPaye)}
                            </td>
                            <td className="text-right text-error">
                              {fmt(g.totalImpaye)}
                            </td>
                            <td className="text-right">
                              {pct(g.totalPaye, g.totalFacture)}%
                            </td>
                          </tr>
                          {isOpen ? (
                            <tr className="bg-base-100">
                              <td></td>
                              <td colSpan={11} className="p-0">
                                <GroupDrawer
                                  groupe={g}
                                  hasFiliales={hasFiliales}
                                  tab={getGroupTab(g.key)}
                                  setTab={(v) => setGroupTabFor(g.key, v)}
                                  analyses={getAnalysesOfGroup(
                                    g.key,
                                    getGroupTab(g.key)
                                  )}
                                  etiquetteByAnalyseId={etiquetteByAnalyseId}
                                />
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </Section>
        </>
      )}
    </div>
  )
}

// ============== Petits composants utilitaires ==============

function KpiCard({ label, value, hint, color = 'primary' }) {
  const colorMap = {
    primary: 'border-primary text-primary',
    success: 'border-success text-success',
    error: 'border-error text-error',
    info: 'border-info text-info',
    warning: 'border-warning text-warning',
    neutral: 'border-base-300',
  }
  return (
    <div
      className={`card bg-base-200 border-l-4 ${colorMap[color] || ''} shadow-sm`}
    >
      <div className="card-body p-3">
        <div className="text-xs opacity-70 uppercase">{label}</div>
        <div className="text-lg font-bold mt-1">{value}</div>
        {hint && <div className="text-xs opacity-60 mt-1">{hint}</div>}
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="card bg-base-200 shadow-sm">
      <div className="card-body p-3">
        <h3 className="card-title text-sm">{title}</h3>
        {children}
      </div>
    </div>
  )
}

function GroupDrawer({ groupe, hasFiliales, tab, setTab, analyses, etiquetteByAnalyseId }) {
  return (
    <div className="p-3 border-l-4 border-primary bg-base-200">
      {hasFiliales && (
        <div className="mb-3">
          <h4 className="font-semibold text-sm mb-2">
            Filiales du groupe {groupe.key} ({groupe.nbFiliales}) — vue
            partenaire uniquement
          </h4>
          <div className="overflow-x-auto">
            <table className="table table-xs">
              <thead>
                <tr>
                  <th>Filiale</th>
                  <th className="text-right">Factures partenaire</th>
                  <th className="text-right">Payées</th>
                  <th className="text-right">Impayées</th>
                  <th className="text-right">Somme due au partenaire</th>
                  <th className="text-right">Encaissé</th>
                  <th className="text-right">Restant dû</th>
                  <th className="text-right">% encaissé</th>
                </tr>
              </thead>
              <tbody>
                {groupe.filiales.map((f) => (
                  <tr key={f.nom}>
                    <td>{f.nom}</td>
                    <td className="text-right">{f.nbFactures}</td>
                    <td className="text-right text-success">{f.nbPayees}</td>
                    <td className="text-right text-error">{f.nbImpayees}</td>
                    <td className="text-right">{fmt(f.totalFacture)}</td>
                    <td className="text-right text-success">
                      {fmt(f.totalPaye)}
                    </td>
                    <td className="text-right text-error">
                      {fmt(f.totalImpaye)}
                    </td>
                    <td className="text-right">
                      {pct(f.totalPaye, f.totalFacture)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-sm">
            Factures détaillées du groupe {groupe.key}
          </h4>
          <div role="tablist" className="tabs tabs-boxed tabs-xs">
            <a
              role="tab"
              className={`tab ${tab === 'all' ? 'tab-active' : ''}`}
              onClick={() => setTab('all')}
            >
              Toutes ({groupe.nbFactures})
            </a>
            <a
              role="tab"
              className={`tab ${tab === 'paye' ? 'tab-active' : ''}`}
              onClick={() => setTab('paye')}
            >
              Payées ({groupe.nbPayees})
            </a>
            <a
              role="tab"
              className={`tab ${tab === 'impaye' ? 'tab-active' : ''}`}
              onClick={() => setTab('impaye')}
            >
              Impayées ({groupe.nbImpayees})
            </a>
            <a
              role="tab"
              className={`tab ${tab === 'reliquat' ? 'tab-active' : ''}`}
              onClick={() => setTab('reliquat')}
            >
              Reliquat ({groupe.nbReliquat})
            </a>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="table table-xs table-pin-rows">
            <thead>
              <tr>
                <th>Date</th>
                <th>Identifiant</th>
                <th>Patient</th>
                <th>Partenaire</th>
                <th>Statut patient</th>
                <th>Statut partenaire</th>
                <th className="text-right">CA</th>
                <th className="text-right">Part part.</th>
                <th className="text-right">Part patient</th>
                <th className="text-right">Avance</th>
                <th className="text-right">Reliquat</th>
              </tr>
            </thead>
            <tbody>
              {analyses.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center opacity-50">
                    Aucune facture dans cette catégorie
                  </td>
                </tr>
              )}
              {analyses.map((a) => {
                const eti = etiquetteByAnalyseId?.get(String(a._id))
                const partenaireStatus = eti
                  ? eti.statusPayement
                  : num(a.prixPartenaire) > 0
                    ? 'Impayée'
                    : '-'
                return (
                  <tr key={a._id}>
                    <td>
                      {a.createdAt
                        ? new Date(a.createdAt).toLocaleDateString('fr-FR')
                        : '-'}
                    </td>
                    <td className="font-mono">{a.identifiant}</td>
                    <td>
                      {a.userId?.nom} {a.userId?.prenom}
                    </td>
                    <td>{a.partenaireId?.nom || '-'}</td>
                    <td>
                      <span
                        className={`badge badge-xs ${
                          a.statusPayement === 'Payée'
                            ? 'badge-success'
                            : a.statusPayement === 'Reliquat'
                              ? 'badge-warning'
                              : 'badge-error'
                        }`}
                      >
                        {a.statusPayement}
                      </span>
                    </td>
                    <td>
                      {partenaireStatus === '-' ? (
                        <span className="opacity-50">-</span>
                      ) : (
                        <span
                          className={`badge badge-xs ${
                            partenaireStatus === 'Payée'
                              ? 'badge-success'
                              : 'badge-error'
                          }`}
                        >
                          {partenaireStatus}
                        </span>
                      )}
                    </td>
                    <td className="text-right">{fmt(a.prixTotal)}</td>
                    <td className="text-right">{fmt(a.prixPartenaire)}</td>
                    <td className="text-right">{fmt(a.prixPatient)}</td>
                    <td className="text-right">{fmt(a.avance)}</td>
                    <td className="text-right">{fmt(a.reliquat)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// Section pliable reutilisable : titre + chevron + contenu masquable.
function Section({ title, isOpen, onToggle, children, headerExtra }) {
  return (
    <div className="card bg-base-200 mt-4 shadow-sm">
      <div className="card-body p-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center gap-2 text-left flex-1"
          >
            <span className="text-lg">{isOpen ? '▼' : '▶'}</span>
            <h3 className="card-title text-base m-0">{title}</h3>
          </button>
          {headerExtra}
        </div>
        {isOpen && <div className="mt-3">{children}</div>}
      </div>
    </div>
  )
}

function Empty() {
  return (
    <div className="h-64 flex items-center justify-center opacity-50 text-sm">
      Aucune donnée pour les filtres sélectionnés.
    </div>
  )
}

const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0)

export default Compta
