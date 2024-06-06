import { Link } from 'react-router-dom'
import PropTypes from 'prop-types' // Importez PropTypes
const NavigationBreadcrumb = ({ pageName }) => {
  return (
    <div className="mb-6 bg-base-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-title-md2 font-semibold base-content">{pageName}</h2>

      <nav>
        <ol className="flex items-center gap-2">
          <li>
            <Link to="/dash">Dashboard /</Link>
          </li>
          <li className="base-content">{pageName}</li>
        </ol>
      </nav>
    </div>
  )
}
// Ajoutez la validation des PropTypes
NavigationBreadcrumb.propTypes = {
  pageName: PropTypes.string.isRequired, // pageName doit être une chaîne de caractères et est obligatoire
}

export default NavigationBreadcrumb
