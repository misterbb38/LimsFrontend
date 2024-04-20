// components/CurrencySelector.js
import PropTypes from 'prop-types'

const CurrencySelector = ({ currency, setCurrency }) => {
  return (
    <div className="select-currency mt-1">
      <label htmlFor="currencySelect">Choisir la devise: </label>
      <select
        id="currencySelect"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="currency-selector select select-primary"
      >
        <option value="EUR">Euro (€)</option>
        <option value="USD">Dollar américain ($)</option>
        <option value="GBP">Livre sterling (£)</option>
        <option value="FCFA">Franc CFA (FCFA)</option>
        {/* Ajoutez d'autres options de devise selon le besoin */}
      </select>
    </div>
  )
}

CurrencySelector.propTypes = {
  currency: PropTypes.string.isRequired,
  setCurrency: PropTypes.func.isRequired,
}

export default CurrencySelector
