import { useEffect, useMemo, useState } from 'react'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import Chatbot from '../components/Chatbot'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPlus } from '@fortawesome/free-solid-svg-icons'
import GenerateDemandePayementPDF from '../components/GenerateDemandePayementPDF'

const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
const fmt = (n) =>
  (Math.round(Number(n) || 0)).toLocaleString('fr-FR') + ' CFA'
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-')

function DemandePayement() {
  const [demandes, setDemandes] = useState([])
  const [partenaires, setPartenaires] = useState([])
  const [loading, setLoading] = useState(true)
  // Filtres liste
  const [filterPartenaire, setFilterPartenaire] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterStart, setFilterStart] = useState('')
  const [filterEnd, setFilterEnd] = useState('')
  // Modal creation
  const [showModal, setShowModal] = useState(false)
  const [newPart, setNewPart] = useState('')
  const [newStart, setNewStart] = useState('')
  const [newEnd, setNewEnd] = useState('')
  const [newNote, setNewNote] = useState('')
  const [preview, setPreview] = useState(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const token = () => {
    const ui = JSON.parse(localStorage.getItem('userInfo'))
    return ui?.token
  }

  const fetchPartenaires = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/partenaire`, {
        headers: { Authorization: `Bearer ${token()}` },
      })
      const data = await res.json()
      if (data.success) {
        // Cliniques exclues (n'ont pas de facturation classique)
        setPartenaires(
          (data.data || []).filter((p) => p.typePartenaire !== 'clinique')
        )
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchDemandes = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterPartenaire) params.append('partenaireId', filterPartenaire)
      if (filterStatus) params.append('statusPayement', filterStatus)
      if (filterStart) params.append('dateDebut', filterStart)
      if (filterEnd) params.append('dateFin', filterEnd)
      const res = await fetch(
        `${apiUrl}/api/demande-payement?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token()}` } }
      )
      const data = await res.json()
      if (data.success) setDemandes(data.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPartenaires()
  }, [])
  useEffect(() => {
    fetchDemandes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterPartenaire, filterStatus, filterStart, filterEnd])

  // Preview live quand on change les champs du modal
  useEffect(() => {
    if (!showModal || !newPart || !newStart || !newEnd) {
      setPreview(null)
      return
    }
    const ctrl = new AbortController()
    const loadPreview = async () => {
      setPreviewLoading(true)
      try {
        const params = new URLSearchParams({
          partenaireId: newPart,
          dateDebut: newStart,
          dateFin: newEnd,
        })
        const res = await fetch(
          `${apiUrl}/api/demande-payement/preview?${params}`,
          {
            headers: { Authorization: `Bearer ${token()}` },
            signal: ctrl.signal,
          }
        )
        const data = await res.json()
        if (data.success) setPreview(data)
      } catch (e) {
        if (e.name !== 'AbortError') console.error(e)
      } finally {
        setPreviewLoading(false)
      }
    }
    loadPreview()
    return () => ctrl.abort()
  }, [showModal, newPart, newStart, newEnd])

  const resetModal = () => {
    setNewPart('')
    setNewStart('')
    setNewEnd('')
    setNewNote('')
    setPreview(null)
    setCreateError('')
  }

  const handleCreate = async () => {
    setCreating(true)
    setCreateError('')
    try {
      const res = await fetch(`${apiUrl}/api/demande-payement`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partenaireId: newPart,
          dateDebut: newStart,
          dateFin: newEnd,
          note: newNote || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setShowModal(false)
        resetModal()
        fetchDemandes()
      } else {
        setCreateError(data.message || 'Erreur lors de la création')
      }
    } catch (e) {
      setCreateError(e.message)
    } finally {
      setCreating(false)
    }
  }

  const toggleStatus = async (d) => {
    const next = d.statusPayement === 'Payée' ? 'Impayée' : 'Payée'
    try {
      const res = await fetch(
        `${apiUrl}/api/demande-payement/${d._id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ statusPayement: next }),
        }
      )
      const data = await res.json()
      if (data.success) fetchDemandes()
    } catch (e) {
      console.error(e)
    }
  }

  const deleteDemande = async (id) => {
    if (!window.confirm('Supprimer cette demande ?')) return
    try {
      const res = await fetch(`${apiUrl}/api/demande-payement/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      })
      const data = await res.json()
      if (data.success) fetchDemandes()
    } catch (e) {
      console.error(e)
    }
  }

  // Copie locale pour ne pas muter le state d'origine et garantir
  // que le tri alphabetique est bien applique a chaque render.
  const partenaireOptions = useMemo(
    () =>
      [...partenaires].sort((a, b) =>
        (a.nom || '').localeCompare(b.nom || '', 'fr', { sensitivity: 'base' })
      ),
    [partenaires]
  )

  return (
    <div className="base-content bg-base-100 mx-auto p-4 min-h-[800px]">
      <Chatbot />
      <NavigationBreadcrumb pageName="Demandes de paiement" />

      <div className="flex justify-between items-center mt-4 mb-4">
        <h2 className="text-xl font-bold">Demandes de paiement partenaires</h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            resetModal()
            setShowModal(true)
          }}
        >
          <FontAwesomeIcon icon={faPlus} /> Nouvelle demande
        </button>
      </div>

      {/* Filtres */}
      <div className="card bg-base-200 mb-3">
        <div className="card-body p-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="label py-1">
                <span className="label-text text-xs">Partenaire</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={filterPartenaire}
                onChange={(e) => setFilterPartenaire(e.target.value)}
              >
                <option value="">Tous</option>
                {partenaireOptions.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label py-1">
                <span className="label-text text-xs">Statut</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">Tous</option>
                <option value="Impayée">Impayée</option>
                <option value="Payée">Payée</option>
              </select>
            </div>
            <div>
              <label className="label py-1">
                <span className="label-text text-xs">Date début</span>
              </label>
              <input
                type="date"
                className="input input-bordered input-sm"
                value={filterStart}
                onChange={(e) => setFilterStart(e.target.value)}
              />
            </div>
            <div>
              <label className="label py-1">
                <span className="label-text text-xs">Date fin</span>
              </label>
              <input
                type="date"
                className="input input-bordered input-sm"
                value={filterEnd}
                onChange={(e) => setFilterEnd(e.target.value)}
              />
            </div>
            {(filterPartenaire || filterStatus || filterStart || filterEnd) && (
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setFilterPartenaire('')
                  setFilterStatus('')
                  setFilterStart('')
                  setFilterEnd('')
                }}
              >
                Réinitialiser
              </button>
            )}
            <div className="ml-auto text-sm opacity-70">
              {demandes.length} demande{demandes.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : demandes.length === 0 ? (
        <div className="text-center opacity-50 py-12">
          Aucune demande. Cliquez sur « Nouvelle demande » pour en créer une.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Partenaire</th>
                <th>Période</th>
                <th className="text-right">Nb factures</th>
                <th className="text-right">Montant</th>
                <th>Statut</th>
                <th>Créée le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {demandes.map((d) => (
                <tr key={d._id}>
                  <td className="font-mono text-xs">{d.reference || '-'}</td>
                  <td>{d.partenaireId?.nom || '-'}</td>
                  <td className="text-sm">
                    {fmtDate(d.dateDebut)} → {fmtDate(d.dateFin)}
                  </td>
                  <td className="text-right">{d.nombreFactures}</td>
                  <td className="text-right font-semibold">
                    {fmt(d.sommeTotale)}
                  </td>
                  <td>
                    <button
                      onClick={() => toggleStatus(d)}
                      className={`btn btn-xs ${d.statusPayement === 'Payée' ? 'btn-success' : 'btn-error'}`}
                      title="Cliquer pour basculer"
                    >
                      {d.statusPayement}
                    </button>
                    {d.datePayement && (
                      <div className="text-xs opacity-60 mt-1">
                        le {fmtDate(d.datePayement)}
                      </div>
                    )}
                  </td>
                  <td className="text-sm">
                    {fmtDate(d.createdAt)}
                    {d.createdBy && (
                      <div className="text-xs opacity-60">
                        par {d.createdBy.prenom} {d.createdBy.nom}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-1 items-center">
                      <GenerateDemandePayementPDF demandeId={d._id} />
                      <button
                        className="btn btn-error btn-xs ml-1"
                        onClick={() => deleteDemande(d._id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal creation */}
      {showModal && (
        <dialog open className="modal">
          <div className="modal-box max-w-2xl">
            <button
              type="button"
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <h3 className="font-bold text-lg">Nouvelle demande de paiement</h3>
            <p className="text-sm opacity-70 mt-1">
              Sélectionnez un partenaire et une période. Toutes les factures
              partenaires éligibles sur cette période seront incluses.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div>
                <label className="label">Partenaire</label>
                <select
                  className="select select-bordered w-full"
                  value={newPart}
                  onChange={(e) => setNewPart(e.target.value)}
                  required
                >
                  <option value="">Sélectionner...</option>
                  {partenaireOptions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.nom} ({p.typePartenaire})
                    </option>
                  ))}
                </select>
              </div>
              <div></div>
              <div>
                <label className="label">Date début</label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={newStart}
                  onChange={(e) => setNewStart(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">Date fin</label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={newEnd}
                  onChange={(e) => setNewEnd(e.target.value)}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Note (optionnel)</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Ex: Demande mensuelle, contact RH..."
                />
              </div>
            </div>

            {/* Preview */}
            {newPart && newStart && newEnd && (
              <div className="mt-4 p-3 bg-base-200 rounded-lg">
                {previewLoading ? (
                  <div className="text-sm opacity-70">Calcul en cours...</div>
                ) : preview ? (
                  <div>
                    <div className="text-sm">
                      <span className="font-semibold">
                        {preview.nombreFactures} facture
                        {preview.nombreFactures > 1 ? 's' : ''}
                      </span>{' '}
                      éligible{preview.nombreFactures > 1 ? 's' : ''} pour un
                      total de{' '}
                      <span className="font-semibold text-success">
                        {fmt(preview.sommeTotale)}
                      </span>
                    </div>
                    {/* Diagnostic detaille */}
                    {preview.nbTotalPeriode > 0 && (
                      <div className="text-xs mt-2 space-y-0.5 opacity-80">
                        <div>
                          Total de factures du partenaire sur la période :{' '}
                          {preview.nbTotalPeriode}
                        </div>
                        {preview.nbDejaIncluses > 0 && (
                          <div className="text-warning">
                            • {preview.nbDejaIncluses} déjà incluse(s) dans une
                            autre demande
                          </div>
                        )}
                        {preview.nbDejaPayees > 0 && (
                          <div className="text-success">
                            • {preview.nbDejaPayees} déjà marquée(s) payée(s)
                          </div>
                        )}
                      </div>
                    )}
                    {preview.nbTotalPeriode === 0 && (
                      <div className="text-xs text-warning mt-1">
                        Aucune facture partenaire trouvée pour ce partenaire
                        sur cette période.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            {createError && (
              <div className="alert alert-error mt-3 text-sm">
                {createError}
              </div>
            )}

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setShowModal(false)}
                disabled={creating}
              >
                Annuler
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreate}
                disabled={creating || !newPart || !newStart || !newEnd}
              >
                {creating ? 'Création...' : 'Créer la demande'}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
}

export default DemandePayement
