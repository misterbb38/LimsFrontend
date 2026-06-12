import { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faShareNodes,
  faMessage,
  faEnvelope,
  faUserMd,
  faBuilding,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'
import GenerateResultatButton from './GenerateResultatButton'

/**
 * ShareResultatButton — menu de partage du PDF de resultat.
 *
 * Flow :
 *   1. L'utilisateur clique sur une option (WhatsApp / Email / Email docteur /
 *      Email partenaire).
 *   2. Le PDF est genere via une ref vers GenerateResultatButton.
 *   3. Le blob est uploade sur Cloudinary via POST /api/share-resultat/upload.
 *   4. On ouvre le lien WhatsApp ou un mailto: avec le lien Cloudinary pre-rempli.
 *
 * Affichage : un bouton "Partager" + un menu deroulant (DaisyUI dropdown).
 * Pour le mail docteur, on ouvre un mini-popup pour saisir l'adresse.
 */
function ShareResultatButton({ invoice, className = '' }) {
  const pdfRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [busyKey, setBusyKey] = useState('')
  const [showDoctorModal, setShowDoctorModal] = useState(false)
  const [doctorEmail, setDoctorEmail] = useState('')
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

  // Recupere les coordonnees depuis l'invoice
  const patient = invoice?.userId || {}
  const partenaire = invoice?.partenaireId || {}
  const patientPhone = String(patient.telephone || '').replace(/\D/g, '')
  const patientEmail = patient.email || ''
  const partenaireEmail = partenaire.email || ''
  const patientName = `${patient.prenom || ''} ${patient.nom || ''}`.trim()
  const dossier = invoice?.identifiant || ''

  // Genere le PDF + l'upload sur Cloudinary (pour WhatsApp uniquement)
  // et renvoie l'URL publique.
  const uploadPdfToCloudinary = async () => {
    const blob = await pdfRef.current.generatePdfBlob()
    const formData = new FormData()
    formData.append('pdf', blob, `resultat-${dossier || 'analyse'}.pdf`)
    formData.append('analyseId', invoice._id || '')
    formData.append('identifiant', dossier)

    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    const token = userInfo?.token
    const resp = await fetch(`${apiUrl}/api/share-resultat/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    if (!resp.ok) throw new Error('Upload Cloudinary a echoue')
    const data = await resp.json()
    if (!data.success || !data.url) throw new Error('Reponse upload invalide')
    return data.url
  }

  // Toast de succes / erreur (temporaire, auto-disparait apres 4s).
  const [toast, setToast] = useState(null)
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const wrap = async (key, fn) => {
    try {
      setBusyKey(key)
      setBusy(true)
      await fn()
    } catch (e) {
      console.error('[Share]', e)
      showToast(`Échec : ${e.message}`, 'error')
    } finally {
      setBusy(false)
      setBusyKey('')
    }
  }

  // --- WHATSAPP ---
  // Upload sur Cloudinary puis ouvre wa.me avec message pre-rempli contenant
  // le lien. WhatsApp ne supporte pas l'attachement direct via URL, donc on
  // partage un lien public a la place.
  const shareWhatsApp = () =>
    wrap('wa', async () => {
      if (!patientPhone) throw new Error('Numéro de téléphone du patient manquant')
      const url = await uploadPdfToCloudinary()
      const msg =
        `Bonjour ${patientName},\n\n` +
        `Vos résultats d'analyses (dossier ${dossier}) sont disponibles :\n` +
        `${url}\n\n` +
        `Laboratoire Bioram`
      window.open(
        `https://wa.me/${patientPhone}?text=${encodeURIComponent(msg)}`,
        '_blank'
      )
    })

  // Helper : ouvre le client mail par defaut avec un brouillon pre-rempli.
  // Le lien Cloudinary est inclus dans le corps : le destinataire clique
  // pour telecharger le PDF (pas d'attachement direct possible via mailto).
  const openMailDraft = ({ to, subject, body }) => {
    window.location.href =
      `mailto:${to}?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`
  }

  // --- EMAIL PATIENT (mailto + lien Cloudinary) ---
  const shareEmailPatient = () =>
    wrap('mail', async () => {
      if (!patientEmail) throw new Error('Email du patient manquant')
      const url = await uploadPdfToCloudinary()
      openMailDraft({
        to: patientEmail,
        subject: `Résultats d'analyses - Dossier ${dossier}`,
        body:
          `Bonjour ${patientName},\n\n` +
          `Vos résultats d'analyses sont disponibles via ce lien :\n${url}\n\n` +
          `Cordialement,\nLaboratoire Bioram`,
      })
    })

  // --- EMAIL DOCTEUR (popup pour adresse + mailto) ---
  const submitDoctorEmail = async () => {
    const trimmed = doctorEmail.trim()
    if (!trimmed || !trimmed.includes('@')) {
      showToast("Saisissez une adresse email valide", 'error')
      return
    }
    setShowDoctorModal(false)
    await wrap('doctor', async () => {
      const url = await uploadPdfToCloudinary()
      openMailDraft({
        to: trimmed,
        subject: `Résultats d'analyses - Patient ${patientName} (dossier ${dossier})`,
        body:
          `Bonjour Docteur,\n\n` +
          `Veuillez trouver le lien vers les résultats d'analyses ` +
          `de votre patient ${patientName} :\n${url}\n\n` +
          `Cordialement,\nLaboratoire Bioram`,
      })
      setDoctorEmail('')
    })
  }

  // --- EMAIL PARTENAIRE (mailto + lien Cloudinary) ---
  const shareEmailPartenaire = () =>
    wrap('partner', async () => {
      if (!partenaireEmail)
        throw new Error("Email du partenaire manquant (clinique/assurance non renseignée)")
      const url = await uploadPdfToCloudinary()
      openMailDraft({
        to: partenaireEmail,
        subject: `Résultats - Patient ${patientName} (dossier ${dossier})`,
        body:
          `Bonjour,\n\n` +
          `Veuillez trouver le lien vers les résultats d'analyses ` +
          `de ${patientName} :\n${url}\n\n` +
          `Cordialement,\nLaboratoire Bioram`,
      })
    })

  const isBusy = (k) => busy && busyKey === k

  return (
    <>
      {/* Bouton invisible mais necessaire pour exposer le ref de generation PDF */}
      <span className="hidden">
        <GenerateResultatButton ref={pdfRef} invoice={invoice} />
      </span>

      {/* Toast de retour utilisateur (envoi reussi / erreur) */}
      {toast && (
        <div className="toast toast-top toast-end z-[10001]">
          <div
            className={`alert ${toast.type === 'error' ? 'alert-error' : 'alert-success'}`}
          >
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      <div className={`dropdown dropdown-end ${className}`}>
        <button tabIndex={0} className="btn btn-primary btn-sm gap-2" disabled={busy}>
          {busy ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            <FontAwesomeIcon icon={faShareNodes} />
          )}
          Partager
        </button>
        <ul
          tabIndex={0}
          className="dropdown-content menu bg-base-100 rounded-box shadow-lg w-64 p-2 border border-base-300 z-50"
        >
          <li>
            <button onClick={shareWhatsApp} disabled={busy}>
              <FontAwesomeIcon
                icon={faMessage}
                className="text-success"
              />
              WhatsApp patient
              {isBusy('wa') && (
                <span className="loading loading-spinner loading-xs ml-auto"></span>
              )}
            </button>
          </li>
          <li>
            <button onClick={shareEmailPatient} disabled={busy}>
              <FontAwesomeIcon icon={faEnvelope} className="text-info" />
              Email patient
              {isBusy('mail') && (
                <span className="loading loading-spinner loading-xs ml-auto"></span>
              )}
            </button>
          </li>
          <li>
            <button
              onClick={() => setShowDoctorModal(true)}
              disabled={busy}
            >
              <FontAwesomeIcon icon={faUserMd} className="text-primary" />
              Email docteur
              {isBusy('doctor') && (
                <span className="loading loading-spinner loading-xs ml-auto"></span>
              )}
            </button>
          </li>
          <li>
            <button onClick={shareEmailPartenaire} disabled={busy}>
              <FontAwesomeIcon icon={faBuilding} className="text-accent" />
              Email partenaire
              {isBusy('partner') && (
                <span className="loading loading-spinner loading-xs ml-auto"></span>
              )}
            </button>
          </li>
        </ul>
      </div>

      {/* Modal saisie email docteur */}
      {showDoctorModal && (
        <div
          className="modal modal-open"
          style={{ zIndex: 10000 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowDoctorModal(false)
          }}
        >
          <div className="modal-box modal-md">
            <header className="flex justify-between items-center pb-3 mb-3 border-b border-base-300">
              <h3 className="text-h2">Email du docteur</h3>
              <button
                type="button"
                aria-label="Fermer"
                className="btn btn-sm btn-circle btn-ghost"
                onClick={() => setShowDoctorModal(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </header>
            <div className="form-control">
              <label className="field-label" htmlFor="doctor-email">
                Adresse email du docteur
              </label>
              <input
                id="doctor-email"
                type="email"
                placeholder="docteur@example.com"
                className="input input-bordered w-full"
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    submitDoctorEmail()
                  }
                }}
                autoFocus
              />
              <span className="field-hint">
                Une nouvelle fenêtre s&apos;ouvrira avec un brouillon de mail
                pré-rempli (sujet + lien vers le PDF).
              </span>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn"
                onClick={() => setShowDoctorModal(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={submitDoctorEmail}
                disabled={busy}
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

ShareResultatButton.propTypes = {
  invoice: PropTypes.object.isRequired,
  className: PropTypes.string,
}

export default ShareResultatButton
