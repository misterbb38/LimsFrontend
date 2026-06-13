import { useMemo } from 'react'
import PropTypes from 'prop-types'
import GenerateFacturePartenaire from './GenerateFacturePartenaire'

/**
 * Generation d'une facture combinee pour un GROUPE de partenaires
 * (ex: tous les "AXA *" cumules dans une seule facture). On agrege les
 * etiquettes de chaque filiale et on les passe au composant facture
 * standard, en remplacant l'etiquette "PARTENAIRE:" par "GROUPE:".
 */
function GenerateFactureGroupePartenaire({ group, mois, annee }) {
  const aggregatedPartner = useMemo(() => {
    const etiquettes = (group.filiales || []).flatMap(
      (f) => f.etiquettes || []
    )
    return {
      partenaireId: `group-${group.key}`,
      partenaire: group.name,
      typePartenaire: group.dominantType || '-',
      totalSomme: group.totalSomme || 0,
      count: group.totalCount || 0,
      etiquettes,
    }
  }, [group])

  return (
    <GenerateFacturePartenaire
      partner={aggregatedPartner}
      mois={mois}
      annee={annee}
      label="GROUPE"
    />
  )
}

GenerateFactureGroupePartenaire.propTypes = {
  group: PropTypes.shape({
    key: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    dominantType: PropTypes.string,
    totalSomme: PropTypes.number,
    totalCount: PropTypes.number,
    filiales: PropTypes.array.isRequired,
  }).isRequired,
  mois: PropTypes.string,
  annee: PropTypes.string,
}

export default GenerateFactureGroupePartenaire
