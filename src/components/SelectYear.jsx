// SelectYear.jsx
import PropTypes from 'prop-types'
function SelectYear({ onYearChange, selectedYear }) {
  const years = [2022, 2023, 2024] // Exemple de gamme d'années, ajustez selon vos besoins

  return (
    <select
      value={selectedYear}
      onChange={(e) => onYearChange(e.target.value)}
      className="className='select select-primary  w-full max-w-xs h-10"
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
  onYearChange: PropTypes.object.isRequired,
  selectedYear: PropTypes.string.isRequired,
}

export default SelectYear
