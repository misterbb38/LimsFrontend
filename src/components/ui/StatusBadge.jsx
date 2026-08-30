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
  'prise en charge':       'info',
  // Prelevement (cles normalisees sans accents par norm()).
  // Statuts derives du dossier : Non prélevé / En attente ('en attente'
  // deja mappe plus haut) / Effectué / À reprélever / À contrôler.
  // Statuts par parametre : Prélevé / Non prélevé / À reprélever /
  // À contrôler.
  'non preleve':           'error',
  'preleve':               'success',
  'effectue':              'success',
  'non effectue':          'warning',
  'a reprelever':          'error',
  'a controler':           'warning',
  'dossier non preleve':   'error', // legacy
}

// Libelles courts pour les cellules de tableau
const COMPACT_LABEL = {
  'echantillon collecte':  'Collecte',
  'livre au laboratoire':  'Livre',
  'validation technique':  'Technique',
  'dossier non preleve':   'Non prélevé',
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
    // whitespace-nowrap + h-auto : les libelles longs ("Prise en charge",
    // "Dossier non prélevé") restent sur UNE ligne au lieu d'etre coupes
    // par la hauteur fixe du badge DaisyUI dans les cellules etroites.
    <span
      className={`badge badge-${color} text-white font-medium px-2.5 py-1 whitespace-nowrap h-auto ${className}`}
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
