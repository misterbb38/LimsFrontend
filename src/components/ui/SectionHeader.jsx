import PropTypes from 'prop-types'

/**
 * SectionHeader — en-tete de page ou de section.
 * Standardise le bloc "titre + sous-titre + bouton action a droite" qu'on
 * trouvait copie-colle partout (avec des styles legerement differents).
 *
 * Usage :
 *   <SectionHeader
 *     title="Patients"
 *     subtitle="Liste des patients enregistres"
 *     action={<button className="btn btn-primary">Nouveau patient</button>}
 *   />
 *
 * Props :
 *  - title    : obligatoire
 *  - subtitle : optionnel
 *  - action   : noeud React aligne a droite (boutons CTA)
 *  - level    : 'page' (text-h1) | 'section' (text-h2). Defaut 'page'.
 *  - className: classes additionnelles
 */
function SectionHeader({
  title,
  subtitle,
  action,
  level = 'page',
  className = '',
}) {
  const titleClass = level === 'page' ? 'text-h1' : 'text-h2'

  return (
    <div
      className={`flex items-start justify-between gap-4 mb-6 ${className}`}
    >
      <div>
        <h1 className={titleClass}>{title}</h1>
        {subtitle && (
          <p className="text-sm text-base-content/60 mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  )
}

SectionHeader.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  action: PropTypes.node,
  level: PropTypes.oneOf(['page', 'section']),
  className: PropTypes.string,
}

export default SectionHeader
