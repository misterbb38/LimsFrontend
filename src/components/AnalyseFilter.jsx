import { useState } from 'react'
import PropTypes from 'prop-types'

function FiltreAnalyse({ onFilter }) {
  const [filters, setFilters] = useState({
    name: '',
    date: '',
    nip: '',
    identifiant: '',
    year: '',
    month: '',
    total: '',
    status: '',
    telephone: '',
  })

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleFilter = () => {
    onFilter(filters)
  }

  return (
    <div className="filter-factures  base-content bg-base-100 ">
      <input
        className=" base-content bg-base-100 input input-bordered input-primary w-auto max-w-xs mx-2"
        type="text"
        name="name"
        placeholder="Prenom du patient"
        value={filters.name}
        onChange={handleInputChange}
      />
      <input
        className=" base-content bg-base-100 input input-bordered input-primary w-auto max-w-xs mx-2"
        type="text"
        name="identifiant"
        placeholder="Num dossier"
        value={filters.identifiant}
        onChange={handleInputChange}
      />
      <input
        className=" base-content bg-base-100 input input-bordered input-primary w-auto max-w-xs mx-2"
        type="text"
        name="nip"
        placeholder="nip du patient"
        value={filters.nip}
        onChange={handleInputChange}
      />
      <input
        className=" base-content bg-base-100 input input-bordered input-primary w-auto max-w-xs mx-2"
        type="date"
        name="date"
        placeholder="Choisis une date"
        value={filters.date}
        onChange={handleInputChange}
      />

      <select
        className=" base-content bg-base-100 select select-bordered select-primary w-auto max-w-xs mx-2"
        name="status"
        value={filters.status}
        onChange={handleInputChange}
      >
        <option value="">Choisir un statut</option>
        <option value="Création">Création</option>
        <option value="En attente">En attente</option>
        <option value="Approuvé">Approuvé</option>
        <option value="Échantillon collecté">Échantillon collecté</option>
        <option value="Livré au laboratoire">Livré au laboratoire</option>

        <option value="Modification">Modification</option>

        <option value="Validé">Validé</option>
        <option value="Validation technique">Validation technique</option>
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
FiltreAnalyse.propTypes = {
  onFilter: PropTypes.func.isRequired,
}

export default FiltreAnalyse
