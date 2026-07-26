// Formatage de l'age d'un patient pour l'affichage (factures, resultats).
//
// Gere les nouveau-nes : quand le patient a moins d'un an, on affiche
// les mois et les jours (ex. "2 mois 3 jours", "5 jours") au lieu de
// "0 ans". Priorite a la date de naissance (precise) ; a defaut on
// utilise l'age numerique saisi manuellement.
//
// Retourne une chaine complete avec l'unite (ex. "37 ans", "2 mois",
// "3 mois 5 jours", "12 jours"), ou '' si aucune information.
export function formatAge(dateNaissance, age) {
  // 1) Date de naissance disponible => calcul detaille annees/mois/jours.
  if (dateNaissance) {
    const naiss = new Date(dateNaissance)
    const now = new Date()
    if (!isNaN(naiss.getTime()) && naiss <= now) {
      let years = now.getFullYear() - naiss.getFullYear()
      let months = now.getMonth() - naiss.getMonth()
      let days = now.getDate() - naiss.getDate()

      if (days < 0) {
        months -= 1
        // Nombre de jours du mois precedent pour reporter les jours.
        const joursMoisPrecedent = new Date(
          now.getFullYear(),
          now.getMonth(),
          0
        ).getDate()
        days += joursMoisPrecedent
      }
      if (months < 0) {
        years -= 1
        months += 12
      }

      if (years >= 1) {
        return `${years} an${years > 1 ? 's' : ''}`
      }
      if (months >= 1) {
        return days > 0
          ? `${months} mois ${days} jour${days > 1 ? 's' : ''}`
          : `${months} mois`
      }
      return `${days} jour${days > 1 ? 's' : ''}`
    }
  }

  // 2) A defaut : age numerique (annees) saisi manuellement.
  if (age !== undefined && age !== null && age !== '') {
    const n = Number(age)
    if (!isNaN(n)) return `${n} an${n > 1 ? 's' : ''}`
  }

  return ''
}
