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

      const anS = (n) => `${n} an${n > 1 ? 's' : ''}`
      const jourS = (n) => `${n} jour${n > 1 ? 's' : ''}`

      if (years >= 5) {
        // Adultes / grands enfants : annees uniquement.
        return anS(years)
      }
      if (years >= 1) {
        // Jeunes enfants : detail annees + mois (+ jours avant 2 ans) pour
        // garder l'information "1 an 3 mois 4 jours".
        const parts = [anS(years)]
        if (months > 0) parts.push(`${months} mois`)
        if (years < 2 && days > 0) parts.push(jourS(days))
        return parts.join(' ')
      }
      if (months >= 1) {
        // Nourrissons : mois + jours.
        return days > 0 ? `${months} mois ${jourS(days)}` : `${months} mois`
      }
      // Nouveau-nes : jours.
      return jourS(days)
    }
  }

  // 2) A defaut : age numerique (annees) saisi manuellement.
  if (age !== undefined && age !== null && age !== '') {
    const n = Number(age)
    if (!isNaN(n)) return `${n} an${n > 1 ? 's' : ''}`
  }

  return ''
}

// Age + sexe combines pour les en-tetes de facture/resultat, au format
// "27 ans / F" (F = femme, M = homme). Si le sexe est inconnu ou absent,
// seul l'age est affiche ; si l'age manque, seul le sexe. '' si rien.
export function formatAgeSexe(dateNaissance, age, sexe) {
  const agePart = formatAge(dateNaissance, age)
  let sexePart = ''
  if (sexe === 'femme') sexePart = 'F'
  else if (sexe === 'homme') sexePart = 'M'
  return [agePart, sexePart].filter(Boolean).join(' / ')
}

// Convertit un age saisi en annees/mois/jours en une DATE DE NAISSANCE
// approximative (chaine 'YYYY-MM-DD'), calculee a partir d'aujourd'hui.
// Utile quand l'utilisateur ne connait pas la date de naissance exacte
// mais sait que le patient a p.ex. "2 mois 5 jours" ou "1 an 3 mois".
// Stocker une date de naissance permet a l'age de rester correct dans le
// temps (il "grandit" automatiquement) et fonctionne partout via
// formatAge.
export function ageToDateNaissance(annees, mois, jours) {
  const a = Number(annees) || 0
  const m = Number(mois) || 0
  const j = Number(jours) || 0
  if (a === 0 && m === 0 && j === 0) return ''
  const d = new Date()
  d.setFullYear(d.getFullYear() - a)
  d.setMonth(d.getMonth() - m)
  d.setDate(d.getDate() - j)
  // Format YYYY-MM-DD (local) pour un <input type="date"> et le backend.
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
