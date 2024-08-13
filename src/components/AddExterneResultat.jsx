// import { useState } from 'react';
// import PropTypes from 'prop-types';

// function AddExterneResultat({ analyseId, patientId,  onResultatChange }) {
//   const [file, setFile] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [showToast, setShowToast] = useState(false);
//   const [toastMessage, setToastMessage] = useState('');
//   const [isSuccess, setIsSuccess] = useState(true);

//   const apiUrl = import.meta.env.VITE_APP_API_BASE_URL;
//   const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
//   const token = userInfo?.token
//   const updatedBy = userInfo?._id

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('analyseId', analyseId);
//     formData.append('patientId', patientId);
//     formData.append('updatedBy', updatedBy);

//     try {
//       const response = await fetch(`${apiUrl}/api/fileresultats`, {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       const data = await response.json();

//       if (response.ok) {
//         setToastMessage('File uploaded successfully');
//         setIsSuccess(true);
//         onResultatChange(data.data);
//         setFile(null); // Reset file input
//       } else {
//         setToastMessage(data.message || 'File upload failed');
//         setIsSuccess(false);
//       }
//     } catch (err) {
//       setToastMessage('An error occurred');
//       setIsSuccess(false);
//     } finally {
//       setIsLoading(false);
//       setShowToast(true);
//       setTimeout(() => setShowToast(false), 3000);
//     }
//   };

//   return (
//     <>
//       {showToast && (
//         <div className="toast toast-center toast-middle">
//           <div className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}>
//             <span className="text-white">{toastMessage}</span>
//           </div>
//         </div>
//       )}
//       <form onSubmit={handleSubmit}>
//         <div>
//           <h2 htmlFor="file">Ajouter le resultat</h2>
//           <input
//             type="file"
//             id="file"
//             name="file"
//             className="file-input file-input-bordered file-input-primary w-full max-w-xs mt-2 mb-2"
//             onChange={handleFileChange}
//             required
//           />
//         </div>
//         {error && <p style={{ color: 'red' }}>{error}</p>}
//         <button  className="btn btn-primary" type="submit" disabled={isLoading}>
//           {isLoading ? 'Uploading...' : 'Ajouter'}
//         </button>
//       </form>
//     </>
//   );
// }

// AddExterneResultat.propTypes = {
//   analyseId: PropTypes.string.isRequired,
//   patientId: PropTypes.string.isRequired,
//   onResultatChange: PropTypes.func.isRequired,
// };

// export default AddExterneResultat;

import { useState, useRef } from 'react'
import PropTypes from 'prop-types'

function AddExterneResultat({ analyseId, patientId, onResultatChange }) {
  const [file, setFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(true)

  const fileInputRef = useRef(null)

  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL
  const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {}
  const token = userInfo?.token
  const updatedBy = userInfo?._id

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('analyseId', analyseId)
    formData.append('patientId', patientId)
    formData.append('updatedBy', updatedBy)

    try {
      const response = await fetch(`${apiUrl}/api/fileresultats`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setToastMessage('File uploaded successfully')
        setIsSuccess(true)
        onResultatChange(data.data)
        setFile(null) // Reset file input state
        fileInputRef.current.value = '' // Reset file input field
      } else {
        setToastMessage(data.message || 'File upload failed')
        setIsSuccess(false)
      }
    } catch (err) {
      setToastMessage('An error occurred')
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    }
  }

  return (
    <>
      {showToast && (
        <div className="toast toast-center toast-middle">
          <div
            className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}
          >
            <span className="text-white">{toastMessage}</span>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <h2 htmlFor="file">Ajouter le resultat</h2>
          <input
            type="file"
            id="file"
            name="file"
            className="file-input file-input-bordered file-input-primary w-full max-w-xs mt-2 mb-2"
            onChange={handleFileChange}
            required
            ref={fileInputRef}
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Ajouter'}
        </button>
      </form>
    </>
  )
}

AddExterneResultat.propTypes = {
  analyseId: PropTypes.string.isRequired,
  patientId: PropTypes.string.isRequired,
  onResultatChange: PropTypes.func.isRequired,
}

export default AddExterneResultat
