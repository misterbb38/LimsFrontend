import React, { useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope, faPrint, faDownload } from '@fortawesome/free-solid-svg-icons'
import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
import { useLocation } from 'react-router-dom'

const PDFViewer = () => {
  const location = useLocation()
  const { pdfBlobUrl } = location.state || {}

  const iframeRef = useRef(null)

  const handleEmailShare = () => {
    if (pdfBlobUrl) {
      const subject = encodeURIComponent("Here is the PDF document")
      const body = encodeURIComponent("Please find the attached PDF document.")
      const mailtoLink = `mailto:?subject=${subject}&body=${body}&attachment=${pdfBlobUrl}`
      window.location.href = mailtoLink
    } else {
      alert('Le PDF n\'est pas prêt à être partagé.')
    }
  }

  const handlePrint = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.print()
    } else {
      alert('Le PDF n\'est pas prêt à être imprimé.')
    }
  }

  useEffect(() => {
    if (!pdfBlobUrl) {
      alert('Le PDF n\'a pas été généré correctement.')
    }
  }, [pdfBlobUrl])

  return (
    <div className=" bg-base-100">
         {/* <NavigationBreadcrumb pageName="Resultats" /> */}
      <div className="pdf-toolbar">
        <button className="btn btn-primary ml-1 mb-1" onClick={handlePrint}>
          <FontAwesomeIcon icon={faPrint} /> 
        </button>
        {/* <button className="btn btn-secondary" onClick={handleEmailShare}>
          <FontAwesomeIcon icon={faEnvelope} /> Partager par Email
        </button> */}
        <a href={pdfBlobUrl} download="document.pdf" className="btn btn-success ml-1 mb-1">
          <FontAwesomeIcon icon={faDownload} />
        </a>
      </div>
      {pdfBlobUrl ? (
        <iframe
          ref={iframeRef}
          src={pdfBlobUrl}
          width="100%"
          height="800px"
          title="PDF Viewer"
        ></iframe>
      ) : (
        <p>Chargement du PDF...</p>
      )}
    </div>
  )
}

export default PDFViewer

