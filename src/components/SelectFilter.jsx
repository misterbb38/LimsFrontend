import PropTypes from 'prop-types'

function SelectFilter({ onChange, selectedValue, options, label }) {
  return (
    <div>
      <label>{label}</label>
      <select
        value={selectedValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className="select select-primary w-full max-w-xs h-10"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

SelectFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  selectedValue: PropTypes.number.isRequired,
  options: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
}

export default SelectFilter
