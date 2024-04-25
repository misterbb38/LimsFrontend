import PropTypes from 'prop-types'

function SelectYear({ onYearChange, selectedYear }) {
  const years = [2022, 2023, 2024] // Exemple de gamme d'années, ajustez selon vos besoins

  return (
    <select
      value={selectedYear}
      onChange={(e) => onYearChange(Number(e.target.value))} // Convertir en Number si nécessaire
      className="select select-primary w-full max-w-xs h-10" // Corriger la syntaxe de className
    >
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  )
}

SelectYear.propTypes = {
  onYearChange: PropTypes.func.isRequired, // Modifier ici pour func
  selectedYear: PropTypes.number.isRequired, // Modifier ici pour number si les années sont passées comme nombres
}

export default SelectYear
