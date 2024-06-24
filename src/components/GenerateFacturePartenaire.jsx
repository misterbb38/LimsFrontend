
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
import jsPDF from 'jspdf';
import PropTypes from 'prop-types';
import logoLeft from '../images/bioramlogo.png';
import logoRight from '../images/logo2.png';

function GenerateFacturePartenaire({ partner, mois, annee }) {
  const [user, setUser] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    email: '',
    telephone: '',
    devise: '',
    logo: '',
  });

  const getColorValue = (colorName) => {
    const colorMap = {
      rouge: '#FF0000',
      vert: '#66CDAA',
      bleu: '#0000FF',
      jaune: '#FFFF00',
      orange: '#FFA500',
      violet: '#800080',
      rose: '#FFC0CB',
      marron: '#A52A2A',
      gris: '#808080',
      noir: '#000000',
    };

    return colorMap[colorName.toLowerCase()] || '#000000';
  };

  const getMonthName = (monthNumber) => {
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return monthNames[monthNumber - 1] || '';
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    const userColor = getColorValue('gris');

    const loadImage = (src) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });

    try {
      const [imgLeft, imgRight] = await Promise.all([
        loadImage(logoLeft),
        loadImage(logoRight),
      ]);

      const maxWidth = 30;
      const leftHeight = maxWidth * (imgLeft.height / imgLeft.width);
      const rightHeight = maxWidth * (imgRight.height / imgRight.width);

      doc.addImage(imgLeft, 'PNG', 20, 5, maxWidth, leftHeight);

      const addFooter = () => {
        const footerY = 277;
        doc.setFillColor(userColor);

        doc.rect(20, footerY, 170, 0.5, 'F');
        doc.setFontSize(6);
        doc.setTextColor(0, 0, 0);
        doc.text(
          `Rufisque Ouest, rond-point SOCABEG vers cité SIPRES - Sortie 9 autoroute à péage Dakar Sénégal Aut. minist. n° 013545-28/03/19`,
          40,
          footerY + 6
        );
        doc.text(
          `Site web : www.bioram.org Tel. +221 78 601 09 09 email : contact@bioram.org`,
          60,
          footerY + 10
        );
        doc.text(
          `RC/SN-DKR-2019 B 13431 -NINEA 0073347059 2E2 `,
          80,
          footerY + 14
        );
      };

      addFooter();

      doc.setFontSize(12);
      doc.setFont('helvetica');
      doc.text("LABORATOIRE D'ANALYSES MEDICALES", 65, 10);

      doc.setFontSize(7);
      doc.setFont('helvetica');
      doc.text(
        'Hématologie – Immuno-Hématologie – Biochimie – Immunologie – Bactériologie – Virologie – Parasitologie',
        52,
        15
      );
      doc.text('24H/24 7J/7', 98, 18);
      doc.text('Prélèvement à domicile sur rendez-vous', 85, 21);
      doc.text(
        'Tel. +221 78 601 09 09 / 33 836 99 98 email : contact@bioram.org',
        75,
        24
      );

      doc.setFont('helvetica');
      doc.setTextColor(userColor);

      doc.setFontSize(14);
      doc.text('', 105, 30, null, null, 'center');

      doc.setFillColor(userColor);
      doc.setLineWidth(0.5);
      doc.rect(20, 40, 170, 0.5, 'F');
      doc.setTextColor(0, 0, 0);

      let currentY = 50;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`PARTENAIRE: ${partner.partenaire || ''}`, 20, currentY);
      doc.setFontSize(8);
      doc.text(`TOTAL SOMME: ${partner.totalSomme || ''}CFA`, 20, currentY + 5);
      doc.text(`Nombre de factures: ${partner.count || ''}`, 20, currentY + 10);

      if (mois && annee) {
        const moisNom = getMonthName(parseInt(mois, 10));
        doc.text(`Période: ${moisNom} ${annee}`, 20, currentY + 15);
      }

      currentY += 25;

      doc.setFillColor(userColor);
      doc.rect(20, currentY, 170, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text('Date', 25, currentY + 4);
      doc.text('Numero Dossier', 50, currentY + 4);
      doc.text('Couverture', 140, currentY + 4);
      doc.text('Nom', 80, currentY + 4);
      doc.text('Prenom', 110, currentY + 4);
      doc.text('Somme', 175, currentY + 4, { align: 'right' });
      currentY += 10;

      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);

      partner.etiquettes.forEach((etiquette) => {
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
          addFooter();
        }
        const formattedDate = new Date(etiquette.createdAt).toLocaleDateString('fr-FR');
        doc.text(formattedDate || '', 25, currentY);
        doc.text(etiquette.analyse.identifiant || '', 50, currentY);
        doc.text(`${etiquette.pourcentageCouverture || ''}%`, 140, currentY); // Ajout du pourcentage de couverture
        doc.text(etiquette.analyse.user.nom || '', 80, currentY);
        doc.text(etiquette.analyse.user.prenom || '', 110, currentY);
        doc.text(`${etiquette.sommeAPayer || ''}CFA`, 175, currentY, { align: 'right' });
        currentY += 10;
      });

      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      URL.revokeObjectURL(url);
      console.log(partner);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert('Une erreur est survenue lors de la génération du PDF.');
    }
  };

  return <FontAwesomeIcon icon={faFilePdf} onClick={generatePDF} />;
}

GenerateFacturePartenaire.propTypes = {
  partner: PropTypes.object.isRequired,
  mois: PropTypes.string,
  annee: PropTypes.string,
};

export default GenerateFacturePartenaire;
