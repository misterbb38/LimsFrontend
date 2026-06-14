import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash, faWallet } from '@fortawesome/free-solid-svg-icons'

const MODES = ['Espèces', 'Wave', 'Orange money', 'Carte bancaire']

// Section de saisie des paiements d'une analyse. Un patient peut
// splitter son reglement entre plusieurs modes (ex: 30 000 en
// especes + 20 000 en wave). Le composant maintient sa propre liste
// et notifie le parent via onChange.
function PaiementsSection({ value, onChange, prixPatient }) {
  const [rows, setRows] = useState(
    Array.isArray(value) && value.length > 0 ? value : []
  )

  // Synchronise vers le parent
  useEffect(() => {
    onChange(rows)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows])

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { mode: 'Espèces', montant: 0 },
    ])
  const removeRow = (idx) =>
    setRows((prev) => prev.filter((_, i) => i !== idx))
  const updateRow = (idx, field, val) =>
    setRows((prev) =>
      prev.map((r, i) =>
        i === idx ? { ...r, [field]: field === 'montant' ? Number(val) || 0 : val } : r
      )
    )

  const totalPaye = rows.reduce((s, r) => s + (Number(r.montant) || 0), 0)
  const restant = Math.max(0, Number(prixPatient || 0) - totalPaye)
  const trop = totalPaye - Number(prixPatient || 0) > 0
    ? totalPaye - Number(prixPatient || 0)
    : 0

  return (
    <div className="form-control border border-base-300 rounded-lg p-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold flex items-center gap-2">
          <FontAwesomeIcon icon={faWallet} className="text-primary" />
          Mode de paiement
        </span>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={addRow}
        >
          <FontAwesomeIcon icon={faPlus} /> Ajouter
        </button>
      </div>

      {rows.length === 0 && (
        <div className="text-xs opacity-60 py-2">
          Aucun paiement enregistré. Cliquez sur Ajouter.
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r, idx) => (
          <div key={idx} className="flex flex-wrap gap-2 items-center">
            <select
              className="select select-bordered select-sm"
              value={r.mode}
              onChange={(e) => updateRow(idx, 'mode', e.target.value)}
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0"
              className="input input-bordered input-sm w-40"
              placeholder="Montant CFA"
              value={r.montant}
              onChange={(e) => updateRow(idx, 'montant', e.target.value)}
            />
            <button
              type="button"
              className="btn btn-sm btn-ghost text-error"
              onClick={() => removeRow(idx)}
              aria-label="Supprimer"
            >
              <FontAwesomeIcon icon={faTrash} />
            </button>
          </div>
        ))}
      </div>

      {rows.length > 0 && (
        <div className="mt-3 pt-3 border-t border-base-300 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="opacity-70">Total payé</span>
            <span className="font-semibold">
              {totalPaye.toLocaleString('fr-FR')} CFA
            </span>
          </div>
          {prixPatient > 0 && (
            <>
              <div className="flex justify-between">
                <span className="opacity-70">Part patient</span>
                <span>{Number(prixPatient).toLocaleString('fr-FR')} CFA</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Reliquat</span>
                <span
                  className={restant === 0 ? 'text-success' : 'text-warning'}
                >
                  {restant.toLocaleString('fr-FR')} CFA
                </span>
              </div>
              {trop > 0 && (
                <div className="text-error text-xs">
                  Trop perçu : {trop.toLocaleString('fr-FR')} CFA
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

PaiementsSection.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  prixPatient: PropTypes.number,
}

PaiementsSection.defaultProps = {
  value: [],
  prixPatient: 0,
}

export default PaiementsSection
