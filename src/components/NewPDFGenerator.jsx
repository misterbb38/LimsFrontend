// =================================================================
// NOUVEAU COMPOSANT PDF - REMPLACE L'ANCIEN SYSTÈME
// Fichier : components/NewPDFGenerator.jsx
// =================================================================

import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faDownload,
  faSpinner,
  faEye,
  faCloudUploadAlt,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'

/**
 * Composant pour générer des PDF via le nouveau système backend
 * Remplace complètement l'ancien GenerateResultatButton
 */
const NewPDFGenerator = ({
  analyse,
  showPreview = true,
  showUpload = false,
  className = '',
  size = 'normal', // 'small', 'normal', 'large'
}) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Récupère le token d'authentification
   */
  const getAuthToken = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      return userInfo?.token
    } catch {
      return null
    }
  }

  /**
   * Configuration des headers pour les requêtes
   */
  const getHeaders = () => {
    const token = getAuthToken()
    const headers = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Gestion des erreurs API
   */
  const handleAPIError = async (response) => {
    try {
      const errorData = await response.json()
      throw new Error(errorData.message || `Erreur HTTP ${response.status}`)
    } catch {
      throw new Error(`Erreur HTTP ${response.status} - ${response.statusText}`)
    }
  }

  /**
   * Génère et affiche le PDF
   */
  const handleGeneratePDF = async () => {
    if (!analyse?._id) {
      setError("ID d'analyse manquant")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      console.log('🚀 Génération PDF pour analyse:', analyse._id)

      const response = await fetch(`/api/pdf/analyse/${analyse._id}`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (!response.ok) {
        await handleAPIError(response)
      }

      // Récupération du PDF en tant que blob
      const pdfBlob = await response.blob()

      // Vérification que c'est bien un PDF
      if (pdfBlob.type !== 'application/pdf') {
        throw new Error("Le fichier reçu n'est pas un PDF valide")
      }

      // Création de l'URL et ouverture
      const pdfUrl = URL.createObjectURL(pdfBlob)
      const newWindow = window.open(pdfUrl, '_blank')

      if (!newWindow) {
        // Si popup bloquée, proposer téléchargement
        const link = document.createElement('a')
        link.href = pdfUrl
        link.download = `analyse_${analyse.identifiant || analyse._id}_${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }

      // Nettoyage de l'URL après délai
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl)
      }, 5000)

      console.log('✅ PDF généré et ouvert avec succès')
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error)
      setError(error.message)
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * Prévisualise le HTML avant génération PDF
   */
  const handlePreview = async () => {
    if (!analyse?._id) {
      setError("ID d'analyse manquant")
      return
    }

    setIsPreviewing(true)
    setError(null)

    try {
      console.log('👁️ Prévisualisation HTML pour analyse:', analyse._id)

      const response = await fetch(`/api/pdf/analyse/${analyse._id}/preview`, {
        method: 'GET',
        headers: getHeaders(),
      })

      if (!response.ok) {
        await handleAPIError(response)
      }

      // Récupération du HTML
      const htmlContent = await response.text()

      // Ouverture dans nouvel onglet
      const newWindow = window.open('', '_blank')
      newWindow.document.write(htmlContent)
      newWindow.document.close()

      console.log('✅ Prévisualisation HTML ouverte')
    } catch (error) {
      console.error('❌ Erreur prévisualisation:', error)
      setError(error.message)
    } finally {
      setIsPreviewing(false)
    }
  }

  /**
   * Upload du PDF vers Cloudinary (si implémenté)
   */
  const handleUploadPDF = async () => {
    if (!analyse?._id) {
      setError("ID d'analyse manquant")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      console.log('☁️ Upload PDF vers Cloudinary pour analyse:', analyse._id)

      const response = await fetch(`/api/pdf/analyse/${analyse._id}/upload`, {
        method: 'POST',
        headers: getHeaders(),
      })

      if (!response.ok) {
        await handleAPIError(response)
      }

      const data = await response.json()

      if (data.success && data.pdfUrl) {
        // Ouvrir l'URL Cloudinary
        window.open(data.pdfUrl, '_blank')
        console.log('✅ PDF uploadé et ouvert:', data.pdfUrl)
      } else {
        throw new Error('URL du PDF non reçue du serveur')
      }
    } catch (error) {
      console.error('❌ Erreur upload PDF:', error)
      setError(error.message)
    } finally {
      setIsUploading(false)
    }
  }

  /**
   * Ferme le message d'erreur
   */
  const clearError = () => {
    setError(null)
  }

  // Configuration des tailles de boutons
  const buttonSizes = {
    small: 'btn-sm',
    normal: '',
    large: 'btn-lg',
  }

  const buttonClass = `btn ${buttonSizes[size]}`
  const isAnyLoading = isGenerating || isPreviewing || isUploading

  return (
    <div className={`pdf-generator ${className}`}>
      {/* Message d'erreur */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show mb-2"
          role="alert"
        >
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <strong>Erreur PDF :</strong> {error}
          <button
            type="button"
            className="btn-close"
            onClick={clearError}
            aria-label="Fermer"
          ></button>
        </div>
      )}

      {/* Boutons d'action */}
      <div className="btn-group" role="group" aria-label="Actions PDF">
        {/* Bouton principal : Générer PDF */}
        <button
          className={`${buttonClass} btn-primary`}
          onClick={handleGeneratePDF}
          disabled={isAnyLoading || !analyse?._id}
          title="Générer et afficher le PDF"
        >
          {isGenerating ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
              {size === 'small' ? '' : 'Génération...'}
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faDownload} className="me-1" />
              {size === 'small' ? 'PDF' : 'Générer PDF'}
            </>
          )}
        </button>

        {/* Bouton prévisualisation */}
        {showPreview && (
          <button
            className={`${buttonClass} btn-outline-secondary`}
            onClick={handlePreview}
            disabled={isAnyLoading || !analyse?._id}
            title="Prévisualiser le HTML avant génération PDF"
          >
            {isPreviewing ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
                {size === 'small' ? '' : 'Chargement...'}
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faEye} className="me-1" />
                {size === 'small' ? '' : 'Aperçu'}
              </>
            )}
          </button>
        )}

        {/* Bouton upload Cloudinary */}
        {showUpload && (
          <button
            className={`${buttonClass} btn-outline-success`}
            onClick={handleUploadPDF}
            disabled={isAnyLoading || !analyse?._id}
            title="Générer et sauvegarder sur Cloudinary"
          >
            {isUploading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin className="me-1" />
                {size === 'small' ? '' : 'Upload...'}
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCloudUploadAlt} className="me-1" />
                {size === 'small' ? '' : 'Sauvegarder'}
              </>
            )}
          </button>
        )}
      </div>

      {/* Informations de debug en mode développement */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2">
          <small className="text-muted">
            Debug: ID={analyse?._id?.substring(0, 8)}..., Token=
            {getAuthToken() ? '✓' : '✗'}
          </small>
        </div>
      )}
    </div>
  )
}

// Validation des props
NewPDFGenerator.propTypes = {
  analyse: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    identifiant: PropTypes.string,
    userId: PropTypes.object,
    resultat: PropTypes.array,
  }).isRequired,
  showPreview: PropTypes.bool,
  showUpload: PropTypes.bool,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'normal', 'large']),
}

export default NewPDFGenerator

// =================================================================
// GUIDE D'UTILISATION
// =================================================================

/*
🎯 COMMENT REMPLACER L'ANCIEN COMPOSANT :

1. IMPORT :
   // Ancien
   import GenerateResultatButton from './GenerateResultatButton';
   
   // Nouveau
   import NewPDFGenerator from './NewPDFGenerator';

2. UTILISATION SIMPLE :
   // Ancien
   <GenerateResultatButton invoice={invoice} />
   
   // Nouveau
   <NewPDFGenerator analyse={analyse} />

3. UTILISATION AVANCÉE :
   <NewPDFGenerator 
     analyse={analyse}
     showPreview={true}
     showUpload={false}
     size="normal"
     className="my-custom-class"
   />

4. VARIANTES DE TAILLE :
   <NewPDFGenerator analyse={analyse} size="small" />   // Boutons compacts
   <NewPDFGenerator analyse={analyse} size="normal" />  // Taille standard
   <NewPDFGenerator analyse={analyse} size="large" />   // Boutons larges

5. DANS UN TABLEAU :
   <NewPDFGenerator 
     analyse={analyse} 
     size="small" 
     showPreview={false}
     className="d-flex justify-content-center"
   />

✅ AVANTAGES DU NOUVEAU COMPOSANT :

• Code 10x plus simple (200 lignes vs 2000+)
• Gestion d'erreurs robuste avec affichage visuel
• Bouton de prévisualisation pour debugging
• Support upload Cloudinary
• Différentes tailles de boutons
• Compatible avec votre système d'auth existant
• Messages d'erreur clairs pour l'utilisateur
• Logs détaillés pour debugging développeur

🚀 MIGRATION PROGRESSIVE :

Vous pouvez garder les deux composants en parallèle :
- Utilisez NewPDFGenerator pour nouveaux développements
- Remplacez progressivement l'ancien dans vos pages existantes
- Testez sur quelques analyses avant migration complète
*/
