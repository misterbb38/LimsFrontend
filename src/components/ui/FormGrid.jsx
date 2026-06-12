import PropTypes from 'prop-types'

/**
 * FormGrid — grille responsive pour formulaires.
 * Remplace les `flex flex-nowrap gap-4` qui cassaient le layout en mobile
 * et ne distribuaient pas la largeur uniformement.
 *
 * Comportement : 1 colonne en mobile, N colonnes a partir de sm.
 *
 * Usage :
 *   <FormGrid cols={2}>
 *     <FormField label="Nom"><input className="input input-bordered w-full"/></FormField>
 *     <FormField label="Prenom"><input className="input input-bordered w-full"/></FormField>
 *   </FormGrid>
 *
 * Props :
 *  - cols : 1 | 2 | 3 | 4 (defaut 2)
 *  - gap  : 'sm' | 'md' | 'lg' (defaut 'md' = gap-4)
 */
const COLS_MAP = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}
const GAP_MAP = { sm: 'gap-3', md: 'gap-4', lg: 'gap-6' }

function FormGrid({ cols = 2, gap = 'md', className = '', children }) {
  const colsClass = COLS_MAP[cols] || COLS_MAP[2]
  const gapClass = GAP_MAP[gap] || GAP_MAP.md
  return (
    <div className={`grid ${colsClass} ${gapClass} ${className}`}>{children}</div>
  )
}

FormGrid.propTypes = {
  cols: PropTypes.oneOf([1, 2, 3, 4]),
  gap: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  children: PropTypes.node,
}

export default FormGrid
