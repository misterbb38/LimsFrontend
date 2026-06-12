import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

/**
 * Modal — wrapper de modale DaisyUI standardise.
 * - 3 tailles fixes : 'md' (640px) / 'lg' (896px) / 'xl' (1152px, defaut pour
 *   les longs formulaires)
 * - Header sticky avec titre + bouton fermer
 * - Footer optionnel sticky (slot `actions`) pour les CTAs principaux
 * - Fermeture par touche Echap et clic overlay
 * - Reset du scroll interne a chaque ouverture (corrige le bug d'edition
 *   qui ouvrait le modal en plein milieu)
 *
 * Usage :
 *   <Modal open={open} onClose={...} title="Modifier" size="xl"
 *          actions={<><button onClick={save}>OK</button></>}>
 *     ...
 *   </Modal>
 *
 * Props :
 *  - open      : bool — controle l'affichage
 *  - onClose   : fn — appele sur clic overlay / touche Echap / bouton X
 *  - title     : titre dans le header
 *  - size      : 'md' | 'lg' | 'xl' (defaut 'lg')
 *  - actions   : noeud React pour le footer (rien rendu si absent)
 *  - children  : contenu de la modale
 */
const SIZE_CLASS = {
  md: 'modal-md',
  lg: 'modal-lg',
  xl: 'modal-xl',
}

function Modal({
  open,
  onClose,
  title,
  size = 'lg',
  actions,
  className = '',
  children,
}) {
  const boxRef = useRef(null)

  // Reset scroll interne + fermeture Echap a chaque ouverture
  useEffect(() => {
    if (!open) return
    if (boxRef.current) boxRef.current.scrollTop = 0
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.lg

  return (
    <div
      className="modal modal-open"
      style={{ zIndex: 9999 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div
        ref={boxRef}
        className={`modal-box ${sizeClass} max-h-[90vh] overflow-y-auto ${className}`}
      >
        <header className="modal-header">
          <h2 className="text-h2">{title}</h2>
          <button
            type="button"
            aria-label="Fermer"
            className="btn btn-sm btn-circle btn-ghost"
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </header>

        <div>{children}</div>

        {actions && <footer className="modal-footer">{actions}</footer>}
      </div>
    </div>
  )
}

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  size: PropTypes.oneOf(['md', 'lg', 'xl']),
  actions: PropTypes.node,
  className: PropTypes.string,
  children: PropTypes.node,
}

export default Modal
