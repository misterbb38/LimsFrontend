import { useEffect, useMemo, useState } from 'react'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import Chatbot from '../components/Chatbot'

const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

// Page Logs : affiche le journal d'audit des actions effectuees par
// les utilisateurs (POST/PUT/DELETE). Filtres sur date, utilisateur,
// methode, ressource + recherche libre. Pagination serveur (100/page).
function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  // Filtres
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [method, setMethod] = useState('')
  const [resource, setResource] = useState('')
  const [userQuery, setUserQuery] = useState('')

  useEffect(() => {
    const ctrl = new AbortController()
    const fetchLogs = async () => {
      setLoading(true)
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        const token = userInfo?.token
        const params = new URLSearchParams()
        params.append('page', page)
        params.append('limit', 100)
        if (startDate) params.append('startDate', startDate)
        if (endDate) params.append('endDate', endDate)
        if (method) params.append('method', method)
        if (resource) params.append('resource', resource)
        if (userQuery) params.append('q', userQuery)

        const res = await fetch(
          `${apiUrl}/api/log?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: ctrl.signal,
          }
        )
        const data = await res.json()
        if (data.success) {
          setLogs(data.data)
          setTotalPages(data.totalPages)
          setTotal(data.total)
        }
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
    return () => ctrl.abort()
  }, [page, startDate, endDate, method, resource, userQuery])

  // Libelles lisibles : ressource technique -> label francais. Sert
  // a la fois pour le select et pour la phrase d'action.
  const RESOURCE_LABEL = {
    analyse: 'Analyse',
    user: 'Utilisateur',
    partenaire: 'Assurance/IPM',
    eti: 'Facture partenaire',
    test: 'Test',
    resultats: 'Résultat',
    fileresultats: 'Fichier de résultat',
    notification: 'Notification',
    sms: 'SMS',
    hist: 'Historique',
    'report-templates': 'Modèle de rapport',
    'share-resultat': 'Partage de résultat',
    pdf: 'PDF',
    'calculer-nfs': 'Calcul NFS',
    log: 'Journal',
  }
  const resourceLabel = (r) => RESOURCE_LABEL[r] || r || 'Ressource'

  // Devine la ressource depuis le payload quand le champ resource du
  // log est vide (cas des anciens logs ecrits avant les correctifs).
  const inferResource = (l) => {
    if (l.resource) return l.resource
    const p = l.payload || {}
    if (
      p.tests !== undefined ||
      p.prixTotal !== undefined ||
      p.statusPayement !== undefined ||
      p.paiements !== undefined ||
      p.typeAnalyse !== undefined ||
      p.pourcentageCouverture !== undefined
    )
      return 'analyse'
    if (p.typePartenaire !== undefined) return 'partenaire'
    if (p.userType !== undefined || p.nip !== undefined) return 'user'
    if (p.sommeAPayer !== undefined) return 'eti'
    if (p.prixPaf !== undefined || p.coeficiantB !== undefined) return 'test'
    if (p.valeur !== undefined || p.exceptions !== undefined)
      return 'resultats'
    return null
  }

  const ACTION_LABEL = {
    POST: 'Création',
    PUT: 'Modification',
    PATCH: 'Modification',
    DELETE: 'Suppression',
  }
  const actionLabel = (m) => ACTION_LABEL[m] || m

  // Construit une phrase humaine pour la ligne principale.
  const buildSentence = (l) => {
    const action = actionLabel(l.method)
    const res = resourceLabel(l.resource)
    return `${action} — ${res}`
  }
  const buildSubtitle = (l) => {
    const who =
      l.userNom || l.userPrenom
        ? `${l.userPrenom || ''} ${l.userNom || ''}`.trim()
        : 'utilisateur inconnu'
    const issue = l.statusCode >= 400 ? ' • échec' : ''
    return `Par ${who}${issue}`
  }

  // Humanisation du payload : transforme le JSON envoye en liste de
  // modifications lisibles ("Réduction : 1000 CFA", "Statut : Payée",
  // "Paiement : 30 000 CFA en Espèces"). Par ressource.
  const fmtCFA = (n) => (Number(n) || 0).toLocaleString('fr-FR') + ' CFA'
  const humanize = (l) => {
    const p = l.payload || {}
    const res = l.resource
    const changes = []

    if (res === 'analyse') {
      if (p.tests && Array.isArray(p.tests))
        changes.push(`${p.tests.length} test(s) sélectionné(s)`)
      if (p.typeAnalyse) changes.push(`Type d'analyse : ${p.typeAnalyse}`)
      if (p.partenaireId) changes.push('Assurance/IPM associée')
      if (p.cliniquePartenaireId)
        changes.push('Clinique partenaire associée')
      if (p.pourcentageCouverture !== undefined && p.pourcentageCouverture !== '')
        changes.push(
          `Couverture partenaire : ${p.pourcentageCouverture}%`
        )
      if (p.reduction && Number(p.reduction) > 0) {
        const type =
          p.typeReduction === 'pourcentage' ? `${p.reduction}%` : fmtCFA(p.reduction)
        changes.push(`Réduction appliquée : ${type} (sur la part patient)`)
      }
      if (p.pc1 && Number(p.pc1) > 0) changes.push(`PC1 : ${fmtCFA(p.pc1)}`)
      if (p.pc2 && Number(p.pc2) > 0) changes.push(`PC2 : ${fmtCFA(p.pc2)}`)
      if (p.deplacement && Number(p.deplacement) > 0)
        changes.push(`Frais de déplacement : ${fmtCFA(p.deplacement)}`)
      if (p.avance && Number(p.avance) > 0)
        changes.push(`Avance enregistrée : ${fmtCFA(p.avance)}`)
      if (p.statusPayement)
        changes.push(`Statut paiement : ${p.statusPayement}`)
      if (p.dateDeRecuperation)
        changes.push(
          `Date de récupération : ${new Date(p.dateDeRecuperation).toLocaleDateString('fr-FR')}`
        )
      // Paiements multi-modes
      let arr = p.paiements
      if (typeof arr === 'string') {
        try { arr = JSON.parse(arr) } catch (_) { arr = null }
      }
      if (Array.isArray(arr) && arr.length > 0) {
        arr.forEach((pay) => {
          if (pay?.mode && Number(pay?.montant) > 0)
            changes.push(`Paiement : ${fmtCFA(pay.montant)} en ${pay.mode}`)
        })
      }
    } else if (res === 'partenaire') {
      if (p.nom) changes.push(`Nom : ${p.nom}`)
      if (p.typePartenaire)
        changes.push(`Type : ${p.typePartenaire}`)
      if (p.telephone) changes.push(`Téléphone : ${p.telephone}`)
      if (p.nip) changes.push(`NIP : ${p.nip}`)
    } else if (res === 'user') {
      if (p.nom || p.prenom)
        changes.push(`Nom : ${[p.prenom, p.nom].filter(Boolean).join(' ')}`)
      if (p.userType) changes.push(`Rôle : ${p.userType}`)
      if (p.email) changes.push(`Email : ${p.email}`)
      if (p.telephone) changes.push(`Téléphone : ${p.telephone}`)
      if (p.profil) changes.push(`Profil : ${p.profil}`)
    } else if (res === 'eti') {
      if (p.statusPayement)
        changes.push(`Statut facture partenaire : ${p.statusPayement}`)
      if (p.sommeAPayer)
        changes.push(`Somme à payer : ${fmtCFA(p.sommeAPayer)}`)
    } else if (res === 'test') {
      if (p.nom) changes.push(`Nom du test : ${p.nom}`)
      if (p.categories) changes.push(`Catégorie : ${p.categories}`)
      if (p.prixPaf) changes.push(`Prix PAF : ${fmtCFA(p.prixPaf)}`)
      if (p.prixAssurance)
        changes.push(`Prix Assurance : ${fmtCFA(p.prixAssurance)}`)
    } else if (res === 'resultats') {
      if (p.statutInterpretation)
        changes.push(`Statut interprétation : ${p.statutInterpretation}`)
      if (p.valeur) changes.push(`Valeur saisie : ${p.valeur}`)
      if (p.observations) changes.push('Observations ajoutées')
    } else if (res === 'sms') {
      if (p.message) changes.push(`Message SMS envoyé`)
      if (p.telephone) changes.push(`Destinataire : ${p.telephone}`)
    }

    return changes
  }

  const resourceOptions = useMemo(() => Object.keys(RESOURCE_LABEL), [])

  const reset = () => {
    setStartDate('')
    setEndDate('')
    setMethod('')
    setResource('')
    setUserQuery('')
    setPage(1)
  }
  const aucunFiltre =
    !startDate && !endDate && !method && !resource && !userQuery

  const methodBadge = (m) => {
    if (m === 'POST') return 'badge-success'
    if (m === 'PUT' || m === 'PATCH') return 'badge-warning'
    if (m === 'DELETE') return 'badge-error'
    return 'badge-ghost'
  }
  const statusBadge = (s) => {
    if (!s) return 'badge-ghost'
    if (s >= 200 && s < 300) return 'badge-success'
    if (s >= 300 && s < 400) return 'badge-info'
    if (s >= 400 && s < 500) return 'badge-warning'
    return 'badge-error'
  }

  return (
    <div className="base-content bg-base-100 mx-auto p-4 min-h-[800px]">
      <Chatbot />
      <NavigationBreadcrumb pageName="Historique des actions" />
      <div className="divider"></div>

      {/* Filtres */}
      <div className="card bg-base-200 shadow-sm mb-3">
        <div className="card-body p-3">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="label py-1">
                <span className="label-text text-xs">Date début</span>
              </label>
              <input
                type="date"
                className="input input-bordered input-sm"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div>
              <label className="label py-1">
                <span className="label-text text-xs">Date fin</span>
              </label>
              <input
                type="date"
                className="input input-bordered input-sm"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div>
              <label className="label py-1">
                <span className="label-text text-xs">Action</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={method}
                onChange={(e) => {
                  setMethod(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">Toutes</option>
                <option value="POST">Création</option>
                <option value="PUT">Modification</option>
                <option value="DELETE">Suppression</option>
              </select>
            </div>
            <div>
              <label className="label py-1">
                <span className="label-text text-xs">Ressource</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={resource}
                onChange={(e) => {
                  setResource(e.target.value)
                  setPage(1)
                }}
              >
                <option value="">Toutes</option>
                {resourceOptions.map((r) => (
                  <option key={r} value={r}>
                    {resourceLabel(r)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="label py-1">
                <span className="label-text text-xs">Rechercher par nom</span>
              </label>
              <input
                type="text"
                className="input input-bordered input-sm w-full"
                placeholder="Ex: Diabong, Aicha..."
                value={userQuery}
                onChange={(e) => {
                  setUserQuery(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            {!aucunFiltre && (
              <button className="btn btn-sm btn-ghost" onClick={reset}>
                Réinitialiser
              </button>
            )}
            <div className="text-sm opacity-70 ml-auto">
              {total} entrée{total > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center opacity-50 py-12">
          Aucune entrée pour ces filtres.
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((l) => {
            const success = l.statusCode >= 200 && l.statusCode < 300
            // Utilise resource du log OU le devine depuis le payload
            // pour les anciens logs ecrits avant les correctifs.
            const detectedRes = inferResource(l)
            const ch = humanize({ ...l, resource: detectedRes })
            const who =
              l.userNom || l.userPrenom
                ? `${l.userPrenom || ''} ${l.userNom || ''}`.trim()
                : 'Un utilisateur'
            const actionVerbe =
              l.method === 'POST'
                ? 'a créé'
                : l.method === 'DELETE'
                  ? 'a supprimé'
                  : 'a modifié'
            const resLabelTxt = resourceLabel(detectedRes).toLowerCase()
            const refLabel = l.resourceLabel
              ? l.resourceLabel.includes(' ')
                ? ` "${l.resourceLabel}"`
                : ` N° ${l.resourceLabel}`
              : ''
            const phrase = success
              ? `${who} ${actionVerbe} ${
                  l.method === 'POST' ? 'un' : "l'"
                }${resLabelTxt}${refLabel}`
              : `${who} a tenté de ${
                  l.method === 'POST'
                    ? 'créer'
                    : l.method === 'DELETE'
                      ? 'supprimer'
                      : 'modifier'
                } ${resLabelTxt}${refLabel} mais l'action a échoué`
            // Format affichage d'une valeur (date, longue chaine...)
            const fmtVal = (v) => {
              if (v == null || v === '') return '(vide)'
              if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v))
                return new Date(v).toLocaleDateString('fr-FR')
              if (typeof v === 'number')
                return v.toLocaleString('fr-FR')
              return String(v)
            }
            return (
              <div
                key={l._id}
                className={`card bg-base-200 shadow-sm border-l-4 ${
                  success ? 'border-success' : 'border-error'
                }`}
              >
                <div className="card-body p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-semibold">{who}</span>
                        <span
                          className={`badge badge-xs ml-2 ${methodBadge(l.method)}`}
                        >
                          {actionLabel(l.method)}
                        </span>
                        {l.userType && (
                          <span className="badge badge-xs badge-outline ml-1">
                            {l.userType}
                          </span>
                        )}
                      </div>
                      <div className="text-base mt-1">{phrase}</div>
                      {/* Diff explicite avant -> apres (priorite) */}
                      {Array.isArray(l.changes) && l.changes.length > 0 && (
                        <ul className="text-sm mt-2 ml-2 space-y-1">
                          {l.changes.map((c, i) => (
                            <li key={i}>
                              <span className="opacity-80">
                                • {c.label || c.field} :
                              </span>{' '}
                              <span className="line-through opacity-60">
                                {fmtVal(c.before)}
                              </span>
                              <span className="mx-2 opacity-50">→</span>
                              <span className="font-semibold">
                                {fmtVal(c.after)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {/* Fallback : humanize payload si pas de diff */}
                      {(!l.changes || l.changes.length === 0) &&
                        ch.length > 0 && (
                          <ul className="text-sm mt-2 ml-2 space-y-0.5">
                            {ch.map((line, i) => (
                              <li key={i} className="opacity-80">
                                • {line}
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                    <div className="text-right text-xs opacity-60 shrink-0">
                      <div>
                        {new Date(l.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      <div>
                        {new Date(l.createdAt).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                className="btn btn-sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ‹ Précédent
              </button>
              <span className="btn btn-sm btn-ghost no-animation">
                Page {page} / {totalPages}
              </span>
              <button
                className="btn btn-sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant ›
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Logs
