import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTimes } from '@fortawesome/free-solid-svg-icons';

function EditFileResultatButton({ fileResultatId, analyseId, onFileResultatUpdated }) {
  const [showModal, setShowModal] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [newFile, setNewFile] = useState(null);
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL;

  useEffect(() => {
    if (showModal && fileResultatId) {
      fetchFileResultatData(fileResultatId);
    }
  }, [showModal, fileResultatId]);

  const fetchFileResultatData = async (fileResultatId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;
      const response = await fetch(`${apiUrl}/api/fileresultats/${fileResultatId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text(); // Récupérer le texte de l'erreur pour plus de détails
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        setFileData(data.data);
      } else {
        console.error('Erreur lors de la récupération du fichier:', data.message);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du fichier:', error);
    }
  };

  const handleFileChange = (e) => {
    setNewFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const ownerUser = userInfo?._id;
    const formData = new FormData();
    formData.append('file', newFile);
    formData.append('analyseId', analyseId);
    formData.append('updatedBy', ownerUser);

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;
      const response = await fetch(`${apiUrl}/api/fileresultats/${fileResultatId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text(); // Récupérer le texte de l'erreur pour plus de détails
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        onFileResultatUpdated(); // Callback to refresh file result data
      } else {
        console.error('La mise à jour a échoué:', data.message);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fichier:', error);
    }
  };

  return (
    <>
      <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
        <FontAwesomeIcon icon={faEdit} />
      </button>
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-5xl">
            <div className="modal-header flex justify-between items-center">
              <h3 className="font-bold text-lg">Modifier le Fichier de Résultat</h3>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="modal-body">
              {fileData && (
                <form onSubmit={handleSubmit}>
                  <div className="form-control">
                    <label className="label">Fichier actuel</label>
                    <a
                      href={`${apiUrl}/resultatExterne/${fileData.path.split('\\').pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link link-primary"
                    >
                      Ouvrir le fichier
                    </a>
                  </div>

                  <div className="form-control">
                    <label className="label">Nouveau fichier</label>
                    <input
                      type="file"
                      name="file"
                      onChange={handleFileChange}
                      className="file-input file-input-bordered file-input-primary w-full max-w-xs"
                      required
                    />
                  </div>
                </form>
              )}
            </div>
            <div className="modal-footer flex justify-end">
              <button
                className="btn btn-primary mt-2 ml-2 mr-2"
                type="submit"
                onClick={handleSubmit}
              >
                Enregistrer
              </button>
              <button className="btn mt-2" onClick={() => setShowModal(false)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

EditFileResultatButton.propTypes = {
  fileResultatId: PropTypes.string.isRequired,
  analyseId: PropTypes.string.isRequired,
  onFileResultatUpdated: PropTypes.func.isRequired,
};

export default EditFileResultatButton;
