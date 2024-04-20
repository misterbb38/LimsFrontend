import { useState } from 'react'

function FiltreEtiquette({ onFilter }) {
  const [filters, setFilters] = useState({
    identifiantAnalyse: '',
    nomPartenaire: '',
    typePartenaire: '',
    status: '',
    date: '', // Pour filtrer par une date spécifique
    mois: '', // Pour filtrer par un mois spécifique
  })

  const handleInputChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleFilter = () => {
    onFilter(filters)
  }

  return (
    <div>
      <input
        className=" base-content bg-base-100 input input-bordered input-primary w-auto max-w-xs mx-2"
        type="text"
        name="identifiantAnalyse"
        placeholder="Identifiant Analyse"
        value={filters.identifiantAnalyse}
        onChange={handleInputChange}
      />
      <input
        className=" base-content bg-base-100 input input-bordered input-primary w-auto max-w-xs mx-2"
        type="text"
        name="nomPartenaire"
        placeholder="Nom Partenaire"
        value={filters.nomPartenaire}
        onChange={handleInputChange}
      />
      <input
        className=" base-content bg-base-100 input input-bordered input-primary w-auto max-w-xs mx-2"
        type="text"
        name="typePartenaire"
        placeholder="Type Partenaire"
        value={filters.typePartenaire}
        onChange={handleInputChange}
      />
      <input
        className=" base-content bg-base-100 input input-bordered input-primary w-auto max-w-xs mx-2"
        type="date"
        name="date"
        placeholder="Date"
        value={filters.date}
        onChange={handleInputChange}
      />
      <input
        className=" base-content bg-base-100 input input-bordered input-primary w-auto max-w-xs mx-2"
        type="number"
        name="mois"
        placeholder="Mois (MM)"
        min="1"
        max="12"
        value={filters.mois}
        onChange={handleInputChange}
      />

      <button
        className="btn btn-outline btn-primary w-auto mx-2"
        onClick={handleFilter}
      >
        Filtrer
      </button>
    </div>
  )
}

export default FiltreEtiquette
