import { useState, useEffect } from 'react';
import NavigationBreadcrumb from '../components/NavigationBreadcrumb';
import Chatbot from '../components/Chatbot';
import GenerateFacturePartenaire from '../components/GenerateFacturePartenaire';

const apiUrl = import.meta.env.VITE_APP_API_BASE_URL;

function PartenaireFacture() {
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mois, setMois] = useState('');
  const [annee, setAnnee] = useState('');

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const token = userInfo?.token;

      const response = await fetch(`${apiUrl}/api/eti/etiquettes`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setPartners(data.data);
        setFilteredPartners(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
      setLoading(false);
    }
  };

  const handleFilter = () => {
    const query = new URLSearchParams();
    if (mois) query.append('mois', mois);
    if (annee) query.append('annee', annee);
    const fetchFilteredPartners = async () => {
      setLoading(true);
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const token = userInfo?.token;

        const response = await fetch(`${apiUrl}/api/eti/etiquettes?${query.toString()}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.success) {
          setFilteredPartners(data.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Erreur:', error);
        setLoading(false);
      }
    };

    fetchFilteredPartners();
  };

  return (
    <div className="base-content bg-base-100 mx-auto p-4 min-h-[800px]">
      <Chatbot />
      <NavigationBreadcrumb pageName="Partenaires" />
      <div className="divider"></div>

      <div className="flex space-x-4">
        <input
          type="number"
          className="input input-bordered"
          placeholder="Mois"
          value={mois}
          onChange={(e) => setMois(e.target.value)}
        />
        <input
          type="number"
          className="input input-bordered"
          placeholder="Année"
          value={annee}
          onChange={(e) => setAnnee(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleFilter}>
          Filtrer
        </button>
      </div>

      <div className="divider"></div>

      {loading ? (
        <div className="loading loading-spinner text-primary">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="font-bold text-lg text-base-content">Nom</th>
                <th className="font-bold text-lg text-base-content">Type Partenaire</th>
                <th className="font-bold text-lg text-base-content">Somme</th>
                <th className="font-bold text-lg text-base-content">Facture</th>
                <th className="font-bold text-lg text-base-content">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map((partner) => (
                <tr key={partner.partenaireId}>
                  <td>{partner.partenaire}</td>
                  <td>{partner.typePartenaire}</td>
                  <td>{partner.totalSomme}</td>
                  <td>{partner.count}</td>
                  <td>
                    <GenerateFacturePartenaire partner={partner} mois={mois} annee={annee}  />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PartenaireFacture;
