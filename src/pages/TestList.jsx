// import { useEffect, useState } from 'react'
// import EditTestButton from '../components/EditTestButton'
// import ViewTestButton from '../components/ViewTestButton'
// import NavigationBreadcrumb from '../components/NavigationBreadcrumb'
// import AddTestForm from '../components/AddTestForm'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faTrash } from '@fortawesome/free-solid-svg-icons'

// function TestList() {
//   const [tests, setTests] = useState([])
//   const [loading, setLoading] = useState(false)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [currentPage, setCurrentPage] = useState(1)
//   const [totalPages, setTotalPages] = useState(0)
//   const apiUrl = import.meta.env.VITE_APP_API_BASE_URL

//   useEffect(() => {
//     fetchTests()
//   }, [currentPage]) // Dépendance ajoutée ici pour recharger à chaque changement de page

  

//   const fetchTests = async () => {
//     setLoading(true)
//     try {
//       const userInfo = JSON.parse(localStorage.getItem('userInfo'))
//       const token = userInfo?.token
//       const response = await fetch(
//         `${apiUrl}/api/test?page=${currentPage}&search=${searchTerm}`,
//         {
//           method: 'GET',
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       )
//       const data = await response.json()
//       if (data.success) {
//         setTests(data.data)
//         setTotalPages(data.totalPages) // Assumant que l'API renvoie le nombre total de pages
//       } else {
//         console.error('Failed to fetch tests')
//       }
//     } catch (error) {
//       console.error('Error fetching tests:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const nextPage = () => {
//     setCurrentPage((prev) => prev + 1)
//   }

//   const prevPage = () => {
//     setCurrentPage((prev) => prev - 1)
//   }

//   // Fonction pour supprimer un test
//   const deleteTest = async (testId) => {
//     const confirmDelete = window.confirm(
//       'Êtes-vous sûr de vouloir supprimer ce test ?'
//     )
//     if (!confirmDelete) return

//     try {
//       setLoading(true)
//       const userInfo = JSON.parse(localStorage.getItem('userInfo'))
//       const token = userInfo?.token
//       const response = await fetch(`${apiUrl}/api/test/${testId}`, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//       })
//       const data = await response.json()
//       if (data.success) {
//         alert('Test supprimé avec succès.')
//         fetchTests() // Rafraîchir la liste des tests après la suppression
//       } else {
//         throw new Error(data.message || 'Erreur lors de la suppression du test')
//       }
//     } catch (error) {
//       console.error('Erreur lors de la suppression du test:', error)
//       alert('Erreur lors de la suppression du test: ' + error.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="base-content bg-base-100 mx-auto p-4 min-h-[800px]">
//       <NavigationBreadcrumb pageName="Paramettre" />
//       <button
//         className="btn"
//         onClick={() => document.getElementById('my_modal_3').showModal()}
//       >
//         Ajouter un nouveau paramettre
//       </button>
//       <br></br>
//       <div className="">
//         <label className="label" htmlFor="search"></label>
//         <input
//           id="search"
//           type="text"
//           placeholder="Entrer le nom du paramettre"
//           className="input input-borderedinput input-bordered input-primary w-full max-w-xs"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           onKeyPress={(event) => event.key === 'Enter' && fetchTests()}
//         />
//         <button className="btn btn-primary ml-2" onClick={fetchTests}>
//           Rechercher
//         </button>
//       </div>

//       <dialog id="my_modal_3" className="modal">
//         <div className="modal-box">
//           <AddTestForm onTestChange={fetchTests} />
//           <div className="modal-action">
//             <form method="dialog">
//               <button className="btn">Fermer</button>
//             </form>
//           </div>
//         </div>
//       </dialog>
//       <div className="divider"></div>
//       {loading ? (
//         <div className="loading loading-spinner text-primary">
//           Chargement...
//         </div>
//       ) : (
//         <>
//           <div className="overflow-x-auto">
//             <table className="table w-full">
//               <thead>
//                 <tr>
//                   <th className="font-bold text-lg text-base-content">Nom</th>
//                   <th className="font-bold text-lg text-base-content">
//                     Coefficient B
//                   </th>
//                   <th className="font-bold text-lg text-base-content">
//                     Prix PAF
//                   </th>
//                   <th className="font-bold text-lg text-base-content">
//                     Prix Assurance
//                   </th>
//                   <th className="font-bold text-lg text-base-content">
//                     Prix IPM
//                   </th>
//                   <th className="font-bold text-lg text-base-content">
//                     Prix Sococim
//                   </th>
//                   <th className="font-bold text-lg text-base-content">
//                     Prix Clinique
//                   </th>
//                   <th className="font-bold text-lg text-base-content">
//                     Status
//                   </th>
//                   <th className="font-bold text-lg text-base-content">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {tests.map((test) => (
//                   <tr key={test._id}>
//                     <td>{test.nom}</td>
//                     <td>{test.coeficiantB}</td>
//                     <td>{test.prixPaf}</td>
//                     <td>{test.prixAssurance}</td>
//                     <td>{test.prixIpm}</td>
//                     <td>{test.prixSococim}</td>
//                     <td>{test.prixClinique}</td>
//                     <td>
//                       <span
//                         className={`badge ${test.status ? 'badge-success' : 'badge-error'}`}
//                       >
//                         {test.status ? 'Actif' : 'Inactif'}
//                       </span>
//                     </td>
//                     <td>
//                       <div className="flex space-x-1">
//                         <EditTestButton
//                           testId={test._id}
//                           onTestUpdated={fetchTests}
//                         />
//                         <ViewTestButton testId={test._id} />
//                         <button
//                           className="btn btn-error"
//                           onClick={() => deleteTest(test._id)}
//                         >
//                           <FontAwesomeIcon icon={faTrash} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <div className="flex justify-between mt-4">
//             <button
//               className="btn btn-primary"
//               onClick={prevPage}
//               disabled={currentPage <= 1}
//             >
//               Précédent
//             </button>
//             <button
//               className="btn btn-primary"
//               onClick={nextPage}
//               disabled={currentPage >= totalPages}
//             >
//               Suivant
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   )
// }

// export default TestList



import { useEffect, useState } from 'react';
import EditTestButton from '../components/EditTestButton';
import ViewTestButton from '../components/ViewTestButton';
import NavigationBreadcrumb from '../components/NavigationBreadcrumb';
import AddTestForm from '../components/AddTestForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function TestList() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const apiUrl = import.meta.env.VITE_APP_API_BASE_URL;

  useEffect(() => {
    fetchTests();
  }, [currentPage]); // Recharger à chaque changement de page

  const fetchTests = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;
      const response = await fetch(
        `${apiUrl}/api/test?page=${currentPage}&search=${searchTerm}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        setTests(data.data);
        setTotalPages(data.totalPages); // Assumant que l'API renvoie le nombre total de pages
      } else {
        console.error('Failed to fetch tests');
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Réinitialiser à la première page lors de la recherche
    fetchTests();
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Fonction pour supprimer un test
  const deleteTest = async (testId) => {
    const confirmDelete = window.confirm(
      'Êtes-vous sûr de vouloir supprimer ce test ?'
    );
    if (!confirmDelete) return;

    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;
      const response = await fetch(`${apiUrl}/api/test/${testId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        alert('Test supprimé avec succès.');
        fetchTests(); // Rafraîchir la liste des tests après la suppression
      } else {
        throw new Error(data.message || 'Erreur lors de la suppression du test');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du test:', error);
      alert('Erreur lors de la suppression du test: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="base-content bg-base-100 mx-auto p-4 min-h-[800px]">
      <NavigationBreadcrumb pageName="Paramettre" />
      <button
        className="btn"
        onClick={() => document.getElementById('my_modal_3').showModal()}
      >
        Ajouter un nouveau paramettre
      </button>
      <br></br>
      <div className="">
        <label className="label" htmlFor="search"></label>
        <input
          id="search"
          type="text"
          placeholder="Entrer le nom du paramettre"
          className="input input-bordered input-primary w-full max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(event) => event.key === 'Enter' && handleSearch()}
        />
        <button className="btn btn-primary ml-2" onClick={handleSearch}>
          Rechercher
        </button>
      </div>

      <dialog id="my_modal_3" className="modal">
        <div className="modal-box">
          <AddTestForm onTestChange={fetchTests} />
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Fermer</button>
            </form>
          </div>
        </div>
      </dialog>
      <div className="divider"></div>
      {loading ? (
        <div className="loading loading-spinner text-primary">
          Chargement...
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th className="font-bold text-lg text-base-content">Nom</th>
                  <th className="font-bold text-lg text-base-content">
                    Coefficient B
                  </th>
                  <th className="font-bold text-lg text-base-content">
                    Prix PAF
                  </th>
                  <th className="font-bold text-lg text-base-content">
                    Prix Assurance
                  </th>
                  <th className="font-bold text-lg text-base-content">
                    Prix IPM
                  </th>
                  <th className="font-bold text-lg text-base-content">
                    Prix Sococim
                  </th>
                  <th className="font-bold text-lg text-base-content">
                    Prix Clinique
                  </th>
                  <th className="font-bold text-lg text-base-content">
                    Status
                  </th>
                  <th className="font-bold text-lg text-base-content">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tests.map((test) => (
                  <tr key={test._id}>
                    <td>{test.nom}</td>
                    <td>{test.coeficiantB}</td>
                    <td>{test.prixPaf}</td>
                    <td>{test.prixAssurance}</td>
                    <td>{test.prixIpm}</td>
                    <td>{test.prixSococim}</td>
                    <td>{test.prixClinique}</td>
                    <td>
                      <span
                        className={`badge ${test.status ? 'badge-success' : 'badge-error'}`}
                      >
                        {test.status ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td>
                      <div className="flex space-x-1">
                        <EditTestButton
                          testId={test._id}
                          onTestUpdated={fetchTests}
                        />
                        <ViewTestButton testId={test._id} />
                        <button
                          className="btn btn-error"
                          onClick={() => deleteTest(test._id)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <nav className="flex justify-center mt-4">
              <ul className="flex list-none">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${currentPage === i + 1 ? 'active' : ''} mr-2`}
                  >
                    <a
                      onClick={() => paginate(i + 1)}
                      className="page-link btn btn-secondary hover:bg-primary text-base-content rounded"
                    >
                      {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export default TestList;
