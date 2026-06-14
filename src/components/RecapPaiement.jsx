import PropTypes from 'prop-types'

// Encart de recapitulatif des montants : decomposition entre la part
// partenaire et la part patient, total deja paye, reliquat patient,
// et badge de statut paiement calcule automatiquement (le user n'a
// plus de select de statut a saisir).
function RecapPaiement({ prixTotal, prixPartenaire, prixPatient, paiements }) {
  const totalPaye = (paiements || []).reduce(
    (s, p) => s + (Number(p?.montant) || 0),
    0
  )
  const reliquat = Math.max(0, Number(prixPatient || 0) - totalPaye)
  const trop = totalPaye > Number(prixPatient || 0)
    ? totalPaye - Number(prixPatient || 0)
    : 0
  const fmt = (n) =>
    (Math.round(Number(n) || 0)).toLocaleString('fr-FR') + ' CFA'

  let status, statusClass
  if (totalPaye <= 0) {
    status = 'Impayée'
    statusClass = 'badge-error'
  } else if (totalPaye >= Number(prixPatient || 0)) {
    status = 'Payée'
    statusClass = 'badge-success'
  } else {
    status = 'Reliquat'
    statusClass = 'badge-warning'
  }

  return (
    <div className="bg-base-200 rounded-lg p-3 mt-3 border-l-4 border-primary">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm">Récapitulatif financier</h4>
        <span className={`badge ${statusClass} badge-lg font-semibold`}>
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <div>
          <div className="text-xs opacity-70">Total facturé</div>
          <div className="font-bold">{fmt(prixTotal)}</div>
        </div>
        {prixPartenaire > 0 && (
          <div>
            <div className="text-xs opacity-70">À la charge du partenaire</div>
            <div className="font-bold text-info">{fmt(prixPartenaire)}</div>
          </div>
        )}
        <div>
          <div className="text-xs opacity-70">À la charge du patient</div>
          <div className="font-bold text-primary">{fmt(prixPatient)}</div>
        </div>
        <div>
          <div className="text-xs opacity-70">Déjà payé (patient)</div>
          <div className="font-bold text-success">{fmt(totalPaye)}</div>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-base-300 flex flex-wrap gap-4 text-sm">
        <div>
          <span className="opacity-70">Reliquat patient : </span>
          <span
            className={`font-bold ${reliquat === 0 ? 'text-success' : 'text-warning'}`}
          >
            {fmt(reliquat)}
          </span>
        </div>
        {trop > 0 && (
          <div className="text-error">Trop perçu : {fmt(trop)}</div>
        )}
        {prixPartenaire > 0 && (
          <div className="opacity-70 italic">
            La part partenaire est gérée via la facturation Assurance/IPM.
          </div>
        )}
      </div>
    </div>
  )
}

RecapPaiement.propTypes = {
  prixTotal: PropTypes.number,
  prixPartenaire: PropTypes.number,
  prixPatient: PropTypes.number,
  paiements: PropTypes.array,
}

RecapPaiement.defaultProps = {
  prixTotal: 0,
  prixPartenaire: 0,
  prixPatient: 0,
  paiements: [],
}

export default RecapPaiement
