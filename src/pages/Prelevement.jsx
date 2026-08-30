import { useEffect, useState } from 'react'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import Chatbot from '../components/Chatbot'
import { Card, SectionHeader, StatusBadge } from '../components/ui'

const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

// Statuts DERIVES du dossier (filtre + badge). Calcules cote serveur a
// partir des statuts par parametre.
const STATUTS_DOSSIER = [
  'Non prélevé',
  'En attente',
  'Effectué',
  'À reprélever',
  'À contrôler',
]

// Statuts par PARAMETRE (choisis par le preleveur dans le modal).
const STATUTS_PARAM = ['Prélevé', 'Non prélevé', 'À reprélever', 'À contrôler']

// Meme derivation que le serveur, pour l'apercu live dans le modal.
const deriverStatutDossier = (statuts) => {
  if (statuts.includes('À reprélever')) return 'À reprélever'
  if (statuts.includes('À contrôler')) return 'À contrôler'
  const nbPreleves = statuts.filter((s) => s === 'Prélevé').length
  if (statuts.length > 0 && nbPreleves === statuts.length) return 'Effectué'
  if (nbPreleves > 0) return 'En attente'
  return 'Non prélevé'
}

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '-'

function Prelevement() {
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [page, setPage] = useState(1)
  const limit = 25

  // Filtres
  const [filterStatut, setFilterStatut] = useState('')
  const [search, setSearch] = useState('')
  const [dateDebut, setDateDebut] = useState('')
  const [dateFin, setDateFin] = useState('')

  // Modal : statut PAR PARAMETRE du dossier selectionne
  const [selected, setSelected] = useState(null)
  const [formStatuts, setFormStatuts] = useState({}) // { testId: statut }
  // Cases cochees pour les actions groupees (Set de testId)
  const [checkedParams, setCheckedParams] = useState(new Set())
  const [formOrigine, setFormOrigine] = useState('Prélevé au laboratoire')
  const [formCommentaire, setFormCommentaire] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const token = () => {
    const ui = JSON.parse(localStorage.getItem('userInfo'))
    return ui?.token
  }

  const fetchPrelevements = async (signal) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (filterStatut) params.append('statut', filterStatut)
      if (search) params.append('search', search)
      if (dateDebut) params.append('dateDebut', dateDebut)
      if (dateFin) params.append('dateFin', dateFin)
      const res = await fetch(`${apiUrl}/api/prelevement?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token()}` },
        signal,
      })
      const data = await res.json()
      if (data.success) {
        setAnalyses(data.data || [])
        setTotal(data.total || 0)
        setTotalPages(data.totalPages || 1)
      }
    } catch (e) {
      if (e.name !== 'AbortError') console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const ctrl = new AbortController()
    fetchPrelevements(ctrl.signal)
    return () => ctrl.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterStatut, search, dateDebut, dateFin])

  // Tout changement de filtre ramene a la page 1.
  const onFilterChange = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const openModal = (analyse) => {
    setSelected(analyse)
    // Statuts existants par parametre, sinon "Non prélevé" par defaut.
    const existants = new Map(
      (analyse.prelevement?.parametres || []).map((p) => [
        String(p.testId?._id || p.testId),
        p.statut,
      ])
    )
    const init = {}
    ;(analyse.tests || []).forEach((t) => {
      init[String(t._id)] = existants.get(String(t._id)) || 'Non prélevé'
    })
    setFormStatuts(init)
    setCheckedParams(new Set())
    setFormOrigine(analyse.prelevement?.origine || 'Prélevé au laboratoire')
    setFormCommentaire(analyse.prelevement?.commentaire || '')
    setSaveError('')
  }

  const closeModal = () => {
    setSelected(null)
    setSaveError('')
  }

  const setStatutParam = (testId, statut) =>
    setFormStatuts((prev) => ({ ...prev, [testId]: statut }))

  const setTous = (statut) => {
    setFormStatuts((prev) => {
      const next = {}
      Object.keys(prev).forEach((k) => {
        next[k] = statut
      })
      return next
    })
  }

  // --- Selection par cases a cocher (actions groupees) ---
  const toggleChecked = (id) =>
    setCheckedParams((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const allIds = (selected?.tests || []).map((t) => String(t._id))
  const allChecked =
    allIds.length > 0 && allIds.every((id) => checkedParams.has(id))

  const toggleCheckAll = () =>
    setCheckedParams(allChecked ? new Set() : new Set(allIds))

  // Inverser : les coches deviennent decoches et inversement. Utile pour
  // "tout sauf" : cocher les exceptions puis inverser.
  const inverserSelection = () =>
    setCheckedParams(
      (prev) => new Set(allIds.filter((id) => !prev.has(id)))
    )

  // Applique un statut UNIQUEMENT aux parametres coches.
  const setSelection = (statut) => {
    if (checkedParams.size === 0) return
    setFormStatuts((prev) => {
      const next = { ...prev }
      checkedParams.forEach((id) => {
        next[id] = statut
      })
      return next
    })
  }

  const statutDerive = deriverStatutDossier(Object.values(formStatuts))

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    setSaveError('')
    try {
      const parametres = Object.entries(formStatuts).map(([testId, statut]) => ({
        testId,
        statut,
      }))
      const res = await fetch(`${apiUrl}/api/prelevement/${selected._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          parametres,
          origine: formOrigine,
          commentaire: formCommentaire,
        }),
      })
      const data = await res.json()
      if (data.success) {
        closeModal()
        fetchPrelevements()
      } else {
        setSaveError(data.message || "L'enregistrement a échoué")
      }
    } catch (e) {
      setSaveError(e.message)
    } finally {
      setSaving(false)
    }
  }

  // Resume par dossier : "x/y prélevés" + parametres a probleme.
  const resumeParametres = (a) => {
    const params = a.prelevement?.parametres || []
    if (params.length === 0) return null
    const nbPreleves = params.filter((p) => p.statut === 'Prélevé').length
    const problemes = params.filter(
      (p) => p.statut === 'À reprélever' || p.statut === 'À contrôler'
    )
    return { nbPreleves, totalParams: params.length, problemes }
  }

  // Pagination fenetree : au plus 10 numeros affiches, centres sur la
  // page courante (meme pattern que la page Analyse).
  const PAGE_WINDOW = 10
  const windowStart = Math.max(
    1,
    Math.min(page - Math.floor(PAGE_WINDOW / 2), totalPages - PAGE_WINDOW + 1)
  )
  const windowEnd = Math.min(totalPages, windowStart + PAGE_WINDOW - 1)
  const pageNumbers = []
  for (let p = windowStart; p <= windowEnd; p++) pageNumbers.push(p)

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <Chatbot />
      <NavigationBreadcrumb pageName="Prélèvement" />

      <SectionHeader
        title="Prélèvement"
        subtitle="Statut de prélèvement de chaque paramètre (salle de prélèvement)"
      />

      {/* Filtres */}
      <Card className="mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label py-1">
              <span className="label-text text-xs">Statut du dossier</span>
            </label>
            <select
              className="select select-bordered select-sm"
              value={filterStatut}
              onChange={(e) => onFilterChange(setFilterStatut)(e.target.value)}
            >
              <option value="">Tous</option>
              {STATUTS_DOSSIER.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label py-1">
              <span className="label-text text-xs">
                Recherche (dossier / nom / NIP)
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered input-sm w-56"
              placeholder="Ex : 260829001 ou DIOP"
              value={search}
              onChange={(e) => onFilterChange(setSearch)(e.target.value)}
            />
          </div>
          <div>
            <label className="label py-1">
              <span className="label-text text-xs">Date début</span>
            </label>
            <input
              type="date"
              className="input input-bordered input-sm"
              value={dateDebut}
              onChange={(e) => onFilterChange(setDateDebut)(e.target.value)}
            />
          </div>
          <div>
            <label className="label py-1">
              <span className="label-text text-xs">Date fin</span>
            </label>
            <input
              type="date"
              className="input input-bordered input-sm"
              value={dateFin}
              onChange={(e) => onFilterChange(setDateFin)(e.target.value)}
            />
          </div>
          {(filterStatut || search || dateDebut || dateFin) && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setFilterStatut('')
                setSearch('')
                setDateDebut('')
                setDateFin('')
                setPage(1)
              }}
            >
              Réinitialiser
            </button>
          )}
          <div className="ml-auto text-sm opacity-70">
            {total} dossier{total > 1 ? 's' : ''}
          </div>
        </div>
      </Card>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : analyses.length === 0 ? (
        <div className="text-center opacity-50 py-12">
          Aucun dossier ne correspond aux filtres.
        </div>
      ) : (
        <Card padding="sm">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Nº Dossier</th>
                  <th>Patient</th>
                  <th>NIP</th>
                  <th>Paramètres</th>
                  <th>Statut dossier</th>
                  <th>Détail</th>
                  <th>Préleveur / Réception</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((a) => {
                  const statut = a.prelevement?.statut || 'Non prélevé'
                  const resume = resumeParametres(a)
                  return (
                    <tr key={a._id}>
                      <td className="text-sm">{fmtDate(a.createdAt)}</td>
                      <td className="font-mono text-sm">{a.identifiant}</td>
                      <td>
                        {a.userId?.prenom} {a.userId?.nom}
                      </td>
                      <td className="font-mono text-sm">{a.userId?.nip}</td>
                      <td
                        className="text-sm max-w-[14rem]"
                        title={(a.tests || []).map((t) => t.nom).join(', ')}
                      >
                        <span className="truncate block">
                          {(a.tests || []).map((t) => t.nom).join(', ')}
                        </span>
                      </td>
                      <td>
                        <StatusBadge value={statut} />
                      </td>
                      <td>
                        {resume ? (
                          <div className="flex flex-wrap items-center gap-1 max-w-[16rem]">
                            <span className="text-xs opacity-70 whitespace-nowrap">
                              {resume.nbPreleves}/{resume.totalParams} prélevé
                              {resume.nbPreleves > 1 ? 's' : ''}
                            </span>
                            {resume.problemes.map((p) => (
                              <span
                                key={p.testId?._id || p.testId}
                                className={`badge badge-outline badge-sm whitespace-nowrap ${
                                  p.statut === 'À reprélever'
                                    ? 'badge-error'
                                    : 'badge-warning'
                                }`}
                                title={p.statut}
                              >
                                {p.testId?.nom || '?'} — {p.statut}
                              </span>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="text-sm">
                        {a.prelevement?.preleveurId ? (
                          <div>
                            <div>
                              {`${a.prelevement.preleveurId.prenom || ''} ${a.prelevement.preleveurId.nom || ''}`.trim()}
                            </div>
                            <div className="text-xs opacity-60 whitespace-nowrap">
                              {a.prelevement?.origine === 'Apporté au laboratoire'
                                ? 'Apporté (réceptionné)'
                                : 'Prélevé au labo'}
                            </div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <button
                          className="btn btn-xs btn-primary"
                          onClick={() => openModal(a)}
                        >
                          Statut
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex flex-wrap justify-center items-center gap-2 mt-4">
              <div className="join">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="join-item btn btn-sm btn-ghost"
                  aria-label="Page précédente"
                >
                  «
                </button>
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`join-item btn btn-sm ${page === p ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="join-item btn btn-sm btn-ghost"
                  aria-label="Page suivante"
                >
                  »
                </button>
              </div>
              <span className="text-sm opacity-70">
                Page {page} / {totalPages}
              </span>
            </nav>
          )}
        </Card>
      )}

      {/* Modal : statut par parametre */}
      {selected && (
        <dialog open className="modal">
          <div className="modal-box max-w-2xl">
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={closeModal}
            >
              ✕
            </button>
            <h3 className="font-bold text-lg">
              Prélèvement — Dossier {selected.identifiant}
            </h3>
            <p className="text-sm opacity-70 mt-1">
              {selected.userId?.prenom} {selected.userId?.nom}
              {selected.userId?.nip ? ` — NIP ${selected.userId.nip}` : ''}
            </p>

            {/* Origine : preleve sur place ou echantillon apporte. La
                personne qui enregistre (connectee) est tracee comme
                preleveur ou receptionnaire selon ce choix. */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <span className="text-xs opacity-70">Origine :</span>
              {['Prélevé au laboratoire', 'Apporté au laboratoire'].map(
                (o) => (
                  <label
                    key={o}
                    className="label cursor-pointer justify-start gap-2 py-0"
                  >
                    <input
                      type="radio"
                      name="origine-prelevement"
                      className="radio radio-sm radio-primary"
                      checked={formOrigine === o}
                      onChange={() => setFormOrigine(o)}
                    />
                    <span className="label-text text-sm">{o}</span>
                  </label>
                )
              )}
            </div>

            {/* Actions rapides sur TOUS les parametres */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs opacity-70">Tout marquer :</span>
              <button
                className="btn btn-xs btn-success"
                onClick={() => setTous('Prélevé')}
              >
                Prélevé
              </button>
              <button
                className="btn btn-xs"
                onClick={() => setTous('Non prélevé')}
              >
                Non prélevé
              </button>
              <span className="ml-auto flex items-center gap-2 text-sm">
                Statut du dossier : <StatusBadge value={statutDerive} />
              </span>
            </div>

            {/* Actions groupees sur la SELECTION (cases cochees).
                Ex. "tout sauf 6" : Tout marquer Prélevé, cocher les 6
                exceptions, puis "Marquer la sélection : Non prélevé"
                (ou cocher les 6 puis Inverser, puis marquer Prélevé). */}
            <div className="flex flex-wrap items-center gap-2 mt-2 p-2 rounded-lg border border-base-300">
              <span className="text-xs opacity-70 whitespace-nowrap">
                Sélection ({checkedParams.size}) :
              </span>
              <button
                className="btn btn-xs btn-outline"
                onClick={toggleCheckAll}
              >
                {allChecked ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
              <button
                className="btn btn-xs btn-outline"
                onClick={inverserSelection}
              >
                Inverser
              </button>
              <span className="text-xs opacity-70 whitespace-nowrap ml-1">
                Marquer la sélection :
              </span>
              <button
                className="btn btn-xs btn-success"
                disabled={checkedParams.size === 0}
                onClick={() => setSelection('Prélevé')}
              >
                Prélevé
              </button>
              <button
                className="btn btn-xs"
                disabled={checkedParams.size === 0}
                onClick={() => setSelection('Non prélevé')}
              >
                Non prélevé
              </button>
              <button
                className="btn btn-xs btn-error"
                disabled={checkedParams.size === 0}
                onClick={() => setSelection('À reprélever')}
              >
                À reprélever
              </button>
              <button
                className="btn btn-xs btn-warning"
                disabled={checkedParams.size === 0}
                onClick={() => setSelection('À contrôler')}
              >
                À contrôler
              </button>
            </div>

            {/* Un statut PAR PARAMETRE */}
            <div className="mt-3 p-3 bg-base-200 rounded-lg max-h-72 overflow-y-auto">
              {(selected.tests || []).length === 0 ? (
                <div className="text-sm opacity-60">
                  Aucun paramètre dans ce dossier.
                </div>
              ) : (
                <table className="table table-xs">
                  <thead>
                    <tr>
                      <th className="w-8">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-xs"
                          checked={allChecked}
                          onChange={toggleCheckAll}
                          title="Tout sélectionner / désélectionner"
                        />
                      </th>
                      <th>Paramètre</th>
                      <th className="w-44">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.tests || []).map((t) => (
                      <tr key={t._id}>
                        <td>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-xs"
                            checked={checkedParams.has(String(t._id))}
                            onChange={() => toggleChecked(String(t._id))}
                          />
                        </td>
                        <td
                          className="text-sm cursor-pointer"
                          onClick={() => toggleChecked(String(t._id))}
                        >
                          {t.nom}
                        </td>
                        <td>
                          <select
                            className={`select select-bordered select-xs w-full ${
                              formStatuts[String(t._id)] === 'Prélevé'
                                ? 'select-success'
                                : formStatuts[String(t._id)] === 'À reprélever'
                                  ? 'select-error'
                                  : formStatuts[String(t._id)] === 'À contrôler'
                                    ? 'select-warning'
                                    : ''
                            }`}
                            value={formStatuts[String(t._id)] || 'Non prélevé'}
                            onChange={(e) =>
                              setStatutParam(String(t._id), e.target.value)
                            }
                          >
                            {STATUTS_PARAM.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Commentaire */}
            <div className="mt-3">
              <label className="label py-1">
                <span className="label-text text-xs">
                  Commentaire (optionnel)
                </span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                rows={2}
                value={formCommentaire}
                onChange={(e) => setFormCommentaire(e.target.value)}
                placeholder="Ex : patient absent, tube hémolysé..."
              />
            </div>

            {saveError && (
              <div className="alert alert-error mt-3 text-sm">{saveError}</div>
            )}

            <div className="modal-action">
              <button className="btn" onClick={closeModal} disabled={saving}>
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={saving || (selected.tests || []).length === 0}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}

export default Prelevement
