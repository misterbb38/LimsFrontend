import { useEffect, useState } from 'react'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import Chatbot from '../components/Chatbot'
import { Card, SectionHeader, StatusBadge } from '../components/ui'

const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

const STATUTS = [
  'Dossier non prélevé',
  'Effectué',
  'Non effectué',
  'À reprélever',
  'À contrôler',
]

// Statuts qui exigent de cocher les paramètres concernés.
const STATUTS_AVEC_DETAIL = ['Non effectué', 'À reprélever', 'À contrôler']

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

  // Modal de changement de statut
  const [selected, setSelected] = useState(null) // analyse en cours d'edition
  const [formStatut, setFormStatut] = useState('')
  const [formTests, setFormTests] = useState(new Set())
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
    setFormStatut(analyse.prelevement?.statut || 'Dossier non prélevé')
    setFormTests(
      new Set(
        (analyse.prelevement?.testsConcernes || []).map((t) =>
          String(t?._id || t)
        )
      )
    )
    setFormCommentaire(analyse.prelevement?.commentaire || '')
    setSaveError('')
  }

  const closeModal = () => {
    setSelected(null)
    setSaveError('')
  }

  const handleStatutChange = (statut) => {
    setFormStatut(statut)
    // Les statuts sans detail n'ont pas de parametres coches.
    if (!STATUTS_AVEC_DETAIL.includes(statut)) setFormTests(new Set())
  }

  const toggleTest = (id) => {
    setFormTests((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const besoinDetail = STATUTS_AVEC_DETAIL.includes(formStatut)
  const formInvalide = !formStatut || (besoinDetail && formTests.size === 0)

  const handleSave = async () => {
    if (formInvalide || !selected) return
    setSaving(true)
    setSaveError('')
    try {
      const res = await fetch(`${apiUrl}/api/prelevement/${selected._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          statut: formStatut,
          testsConcernes: [...formTests],
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
        subtitle="Statut de prélèvement des dossiers (salle de prélèvement)"
      />

      {/* Filtres */}
      <Card className="mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label py-1">
              <span className="label-text text-xs">Statut</span>
            </label>
            <select
              className="select select-bordered select-sm"
              value={filterStatut}
              onChange={(e) => onFilterChange(setFilterStatut)(e.target.value)}
            >
              <option value="">Tous</option>
              {STATUTS.map((s) => (
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
                  <th>Statut prélèvement</th>
                  <th>Paramètres concernés</th>
                  <th>Préleveur</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((a) => {
                  const statut = a.prelevement?.statut || 'Dossier non prélevé'
                  const concernes = a.prelevement?.testsConcernes || []
                  return (
                    <tr key={a._id}>
                      <td className="text-sm">{fmtDate(a.createdAt)}</td>
                      <td className="font-mono text-sm">{a.identifiant}</td>
                      <td>
                        {a.userId?.prenom} {a.userId?.nom}
                      </td>
                      <td className="font-mono text-sm">{a.userId?.nip}</td>
                      <td
                        className="text-sm max-w-[16rem]"
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
                        {STATUTS_AVEC_DETAIL.includes(statut) &&
                        concernes.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[14rem]">
                            {concernes.map((t) => (
                              <span
                                key={t._id || t}
                                className="badge badge-outline badge-sm"
                              >
                                {t.nom || t}
                              </span>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="text-sm">
                        {a.prelevement?.preleveurId
                          ? `${a.prelevement.preleveurId.prenom || ''} ${a.prelevement.preleveurId.nom || ''}`.trim()
                          : '-'}
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

      {/* Modal de statut */}
      {selected && (
        <dialog open className="modal">
          <div className="modal-box max-w-xl">
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

            {/* Statuts */}
            <div className="mt-4 space-y-1">
              {STATUTS.map((s) => (
                <label
                  key={s}
                  className="label cursor-pointer justify-start gap-3 py-1"
                >
                  <input
                    type="radio"
                    name="statut-prelevement"
                    className="radio radio-sm radio-primary"
                    checked={formStatut === s}
                    onChange={() => handleStatutChange(s)}
                  />
                  <span className="label-text">{s}</span>
                </label>
              ))}
            </div>

            {/* Parametres concernes (statuts partiels) */}
            {besoinDetail && (
              <div className="mt-3 p-3 bg-base-200 rounded-lg">
                <div className="font-medium text-sm mb-2">
                  Paramètres concernés *
                </div>
                {(selected.tests || []).length === 0 ? (
                  <div className="text-sm opacity-60">
                    Aucun paramètre dans ce dossier.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 max-h-52 overflow-y-auto">
                    {(selected.tests || []).map((t) => (
                      <label
                        key={t._id}
                        className="label cursor-pointer justify-start gap-2 py-1"
                      >
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm checkbox-primary"
                          checked={formTests.has(String(t._id))}
                          onChange={() => toggleTest(String(t._id))}
                        />
                        <span className="label-text text-sm">{t.nom}</span>
                      </label>
                    ))}
                  </div>
                )}
                {formTests.size === 0 && (
                  <div className="text-xs text-warning mt-1">
                    Cochez au moins un paramètre pour ce statut.
                  </div>
                )}
              </div>
            )}

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
                disabled={saving || formInvalide}
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
