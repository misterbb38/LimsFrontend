import { useState } from 'react'
import PropTypes from 'prop-types'

function FiltrePartenaire({ onFilter }) {
  const [filters, setFilters] = useState({
    typePartenaire: '',
  })

  const handleInputChange = (e) => {
    setFilters({ ...filters, [ e.target.name ]: e.target.value })
  }

  const handleFilter = () => {
    onFilter(filters)
  }

  return (
    <div className="filter-partenaires base-content bg-base-100 ">
      <select
        className="base-content bg-base-100 select select-bordered select-primary w-auto max-w-xs mx-2"
        name="typePartenaire"
        value={filters.typePartenaire}
        onChange={handleInputChange}
      >
        <option value="">Choisir un type de partenaire</option>
        <option value="assurance">Assurance</option>
        <option value="ipm">IPM</option>
        <option value="clinique">Clinique</option>
        <option value="sococim">Sococim</option>
      </select>
      <button
        className="btn btn-outline btn-primary w-auto mx-2"
        onClick={handleFilter}
      >
        Filtrer
      </button>
    </div>
  )
}

FiltrePartenaire.propTypes = {
  onFilter: PropTypes.func.isRequired,
}

export default FiltrePartenaire
