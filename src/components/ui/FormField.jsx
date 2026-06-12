import PropTypes from 'prop-types'

/**
 * FormField — wrapper de champ standardise.
 * - Label avec style coherent (text-sm font-medium)
 * - Marque l'asterisque si required
 * - Affiche hint (gris) OU error (rouge) sous le champ
 * - Lie aria-describedby automatiquement
 *
 * Usage :
 *   <FormField label="Nom" required hint="Tel qu'il apparait sur la CNI">
 *     <input className="input input-bordered w-full" />
 *   </FormField>
 *
 * Props :
 *  - label    : libelle au-dessus du champ
 *  - required : ajoute un asterisque rouge
 *  - hint     : texte d'aide gris en dessous
 *  - error    : message d'erreur rouge (prend le pas sur hint)
 *  - children : le champ lui-meme (input, select, textarea...)
 *  - htmlFor  : id du champ (a passer aussi sur le children)
 */
function FormField({
  label,
  required = false,
  hint,
  error,
  htmlFor,
  className = '',
  children,
}) {
  const descId = htmlFor ? `${htmlFor}-desc` : undefined

  return (
    <div className={`form-control ${className}`}>
      {label && (
        <label htmlFor={htmlFor} className="field-label">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <span id={descId} className="field-error">
          {error}
        </span>
      ) : hint ? (
        <span id={descId} className="field-hint">
          {hint}
        </span>
      ) : null}
    </div>
  )
}

FormField.propTypes = {
  label: PropTypes.node,
  required: PropTypes.bool,
  hint: PropTypes.node,
  error: PropTypes.node,
  htmlFor: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
}

export default FormField
