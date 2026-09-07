import { useState } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDay } from '@fortawesome/free-solid-svg-icons'

const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

// Date -> 'aaaa-mm-jj' pour <input type="date"> (en heure locale, pas en
// UTC : toISOString() decalerait la veille selon le fuseau).
const versInputDate = (valeur) => {
  const d = valeur ? new Date(valeur) : new Date()
  if (isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

/**
 * Modifie la DATE DE FACTURATION d'une étiquette partenaire.
 *
 * C'est cette date qui décide dans quel mois le dossier apparaît dans
 * Facture(Partenaire). Elle est normalement reprise de la date de
 * création de l'analyse, mais l'accueil doit pouvoir la corriger à la
 * main : dossier saisi en retard, partenaire corrigé le mois suivant...
 */
function EditDateEtiquetteButton({ etiquette, onUpdated, size = 'xs' }) {
  const [showModal, setShowModal] = useState(false)
  const [date, setDate] = useState(versInputDate(etiquette?.createdAt))
  const [isLoading, setIsLoading] = useState(false)
  const [erreur, setErreur] = useState('')

  const ouvrir = () => {
    setDate(versInputDate(etiquette?.createdAt))
    setErreur('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!date) {
      setErreur('Choisissez une date.')
      return
    }
    setIsLoading(true)
    setErreur('')
    try {
      // On conserve l'heure d'origine : l'ordre des dossiers dans la
      // journée reste cohérent et la date affichée ne bascule pas la
      // veille selon le fuseau.
      const origine = new Date(etiquette.createdAt)
      const [annee, mois, jour] = date.split('-').map(Number)
      const nouvelleDate = new Date(
        annee,
        mois - 1,
        jour,
        isNaN(origine.getTime()) ? 0 : origine.getHours(),
        isNaN(origine.getTime()) ? 0 : origine.getMinutes(),
        isNaN(origine.getTime()) ? 0 : origine.getSeconds()
      )

      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const token = userInfo?.token
      const response = await fetch(`${apiUrl}/api/eti/${etiquette._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ createdAt: nouvelleDate.toISOString() }),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        setErreur(data?.message || 'La modification a échoué.')
        return
      }
      setShowModal(false)
      if (onUpdated) onUpdated()
    } catch (error) {
      console.error('Erreur lors du changement de date de facturation:', error)
      setErreur('Erreur réseau, réessayez.')
    } finally {
      setIsLoading(false)
    }
  }

  const identifiant =
    etiquette?.analyse?.identifiant || etiquette?.analyseId?.identifiant || ''

  return (
    <>
      <button
        type="button"
        className={`btn btn-ghost btn-${size}`}
        onClick={ouvrir}
        title="Modifier la date de facturation"
      >
        <FontAwesomeIcon icon={faCalendarDay} />
      </button>

      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="font-bold text-lg">Date de facturation</h3>
            <p className="py-2 text-sm opacity-70">
              {identifiant ? `Dossier ${identifiant}. ` : ''}
              Cette date détermine le mois dans lequel le dossier apparaît dans
              la facture du partenaire.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nouvelle date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              {erreur && (
                <div className="alert alert-error mt-3 py-2 text-sm">
                  {erreur}
                </div>
              )}
              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowModal(false)}
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

EditDateEtiquetteButton.propTypes = {
  etiquette: PropTypes.object.isRequired,
  onUpdated: PropTypes.func,
  size: PropTypes.string,
}

export default EditDateEtiquetteButton
