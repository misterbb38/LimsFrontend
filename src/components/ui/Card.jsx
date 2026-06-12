import PropTypes from 'prop-types'

/**
 * Card — conteneur visuel standard du design system Bioram.
 * Remplace les `<div className="bg-white shadow rounded ...">` ad-hoc.
 *
 * Usage :
 *   <Card title="Patients" actions={<Button>+</Button>}>...</Card>
 *
 * Props :
 *  - title       : titre optionnel (rend un header avec border-bottom)
 *  - subtitle    : sous-titre optionnel sous le titre
 *  - actions     : noeud React aligne a droite du header (boutons, badges)
 *  - padding     : 'sm' | 'md' | 'lg' (defaut 'md' = p-5)
 *  - className   : classes additionnelles sur le wrapper
 */
function Card({
  title,
  subtitle,
  actions,
  padding = 'md',
  className = '',
  children,
}) {
  const padMap = { sm: 'p-3', md: 'p-5', lg: 'p-6' }
  const pad = padMap[padding] || padMap.md
  const hasHeader = Boolean(title || actions)

  return (
    <section
      className={`bg-base-100 border border-base-300 rounded-xl shadow-sm ${pad} ${className}`}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-base-300">
          <div>
            {title && <h2 className="text-h2">{title}</h2>}
            {subtitle && (
              <p className="text-sm text-base-content/60 mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  )
}

Card.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
  padding: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  children: PropTypes.node,
}

export default Card
