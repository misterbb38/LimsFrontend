import PropTypes from 'prop-types'

/**
 * StatusBadge — badge de statut metier centralise.
 * Mappe les ~10 statuts qu'on trouve dans l'app (Creation, En attente,
 * Approuve, Echantillon collecte, Livre, Validation technique, Validee,
 * Fait, Annule, Modification, et paiement : Payee, Impayee, Reliquat)
 * vers les bonnes couleurs semantiques DaisyUI.
 *
 * Avantage : on retire les tableaux statusBadgeClasses dupliques dans
 * Analyse.jsx, Devis.jsx, etc. Un seul endroit a maintenir.
 *
 * Usage : <StatusBadge value="Validé" /> ou <StatusBadge value="Impayée" type="payment" />
 *
 * Props :
 *  - value : libelle du statut (case-insensitive matching)
 *  - type  : 'status' (defaut) | 'payment' — change les regles de mapping
 *  - compact : si true, affiche un libelle court (Echantillon collecte -> Collecte)
 */

// Mapping statut metier -> couleur semantique
const STATUS_COLOR = {
  // Workflow analyse
  'creation':              'info',
  'creation_alt':          'info',
  'en attente':            'warning',
  'approuve':              'success',
  'echantillon collecte':  'primary',
  'livre au laboratoire':  'accent',
  'validation technique':  'accent',
  'fait':                  'success',
  'valide':                'success',
  'annule':                'error',
  'modification':          'secondary',
  // Paiement
  'payee':                 'success',
  'impayee':               'error',
  'reliquat':              'warning',
}

// Libelles courts pour les cellules de tableau
const COMPACT_LABEL = {
  'echantillon collecte':  'Collecte',
  'livre au laboratoire':  'Livre',
  'validation technique':  'Technique',
}

// Normalise une valeur pour le mapping (sans accent, minuscule)
const norm = (v) =>
  String(v ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()

function StatusBadge({ value, type = 'status', compact = false, className = '' }) {
  if (!value) return null
  const key = norm(value)
  const color = STATUS_COLOR[key] || 'neutral'
  const label = compact && COMPACT_LABEL[key] ? COMPACT_LABEL[key] : value

  return (
    <span
      className={`badge badge-${color} text-white font-medium px-2.5 py-1 ${className}`}
    >
      {label}
    </span>
  )
}

StatusBadge.propTypes = {
  value: PropTypes.string,
  type: PropTypes.oneOf(['status', 'payment']),
  compact: PropTypes.bool,
  className: PropTypes.string,
}

export default StatusBadge
