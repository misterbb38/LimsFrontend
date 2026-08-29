// import { useState } from 'react'
// import { Link } from 'react-router-dom'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import {
//   faHome,
//   faFileInvoiceDollar, // Icone pour Facture
//   faFileAlt, // Icone pour Devis
//   faUsers, // Changé à faUsers pour Client
//   faClipboardList, // Icone pour Formulaire
//   faEnvelope, // Icone pour Message
//   faBook, // Icone pour Instruction
//   faCog,
//   faTag, // Icone pour Paramètre
//   faFileMedical, faBuilding
// } from '@fortawesome/free-solid-svg-icons'
// import logo from '../images/bioramlogo.png'

// function Sidebar() {
//   const [selectedMenuItem, setSelectedMenuItem] = useState(1)

//   const menuItems = [
//     { id: 1, label: 'Accueil', route: '/dash', icon: faHome },
//     {
//       id: 2,
//       label: 'Analyse',
//       route: '/dash/Analyse',
//       icon: faFileInvoiceDollar,
//     },
//     { id: 3, label: 'Parametre', route: '/dash/test', icon: faTag },
//     // { id: 3, label: 'Devis', route: '/dash/Devis', icon: faFileAlt },
//     { id: 4, label: 'Patient', route: '/dash/patient', icon: faUsers },
//     { id: 5, label: 'Personnel', route: '/dash/personnel', icon: faUsers },
//    { id: 6, label: 'Partenaire', route: '/dash/partenaireclinique', icon: faBuilding },
//     { id: 7, label: 'Assurance/IPM', route: '/dash/partenaire', icon: faFileMedical},

//     {
//       id: 8,
//       label: 'Ettiquette',
//       route: '/dash/ettiquette',
//       icon: faClipboardList,
//     },
//     // { id: 8, label: 'Instructions', route: '/dash/instruction', icon: faBook },
//     // { id: 9, label: 'Message', route: '/dash/notification', icon: faEnvelope },
//     { id: 9, label: 'Profile', route: '/dash/parametre', icon: faCog },
//   ]

//   const handleMenuItemClick = (id) => {
//     setSelectedMenuItem(id)
//   }

//   return (
//     <>
//       {/* Sidebar pour les écrans larges et moyens */}
//       <div className="hidden md:flex w-64 bg-base-300 base-content flex-col">
//         {/* Contenu de votre Sidebar existant */}
//         <div className="w-64 bg-base-300 base-content flex flex-col">
//           <div className="flex items-center justify-center p-4">
//             <img src={logo} alt="Logo" className="h-20 w-20" />
//           </div>
//           <h3 className="text-center text-lg font-bold mt-4">MENU</h3>
//           <ul className="mt-4 w-full">
//             {menuItems.map((menuItem) => (
//               <li
//                 key={menuItem.id}
//                 className={`p-1 mt-2 cursor-pointer flex justify-center items-center text-center font-bold text-lg ${selectedMenuItem === menuItem.id ? 'bg-primary text-white' : ''}`}
//                 onClick={() => handleMenuItemClick(menuItem.id)}
//               >
//                 <Link
//                   to={menuItem.route}
//                   className="focus:outline-none w-full flex items-left justify-left"
//                 >
//                   <FontAwesomeIcon icon={menuItem.icon} className="mr-2" />
//                   {menuItem.label}
//                 </Link>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>

//       {/* Barre de navigation inférieure pour les écrans mobiles */}
//       <div className="md:hidden z-50 fixed bottom-0 left-0 right-0 bg-base-300 py-2 flex justify-around items-center shadow-lg rounded-t-lg">
//         {menuItems.map((menuItem) => (
//           <Link
//             key={menuItem.id}
//             to={menuItem.route}
//             className={`flex flex-col items-center justify-center ${selectedMenuItem === menuItem.id ? 'text-primary' : 'text-base-content'}`}
//             onClick={() => handleMenuItemClick(menuItem.id)}
//           >
//             <FontAwesomeIcon icon={menuItem.icon} className="text-lg" />
//             <span className="text-xs"></span>
//           </Link>
//         ))}
//       </div>
//     </>
//   )
// }

// export default Sidebar

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHome,
  faFileInvoiceDollar, // Icone pour Facture
  faFileAlt, // Icone pour Devis
  faUsers, // Changé à faUsers pour Client
  faClipboardList, // Icone pour Formulaire
  faEnvelope, // Icone pour Message
  faBook, // Icone pour Instruction
  faCog,
  faTag, // Icone pour Paramètre
  faFileMedical,
  faBuilding,
  faFileInvoice,
  faFlask,
  faChartLine,
  faClipboardCheck,
  faHandHoldingDollar,
  faSyringe, // Icone pour Prelevement
} from '@fortawesome/free-solid-svg-icons'
import logo from '../images/bioramlogo.png'

function Sidebar() {
  const [selectedMenuItem, setSelectedMenuItem] = useState(1)

  const userInfo = JSON.parse(localStorage.getItem('userInfo'))
  const userType = userInfo?.userType

  // ============ ACCES PAR TYPE D'UTILISATEUR ============
  // - superadmin, medecin, docteur : TOUT (le superadmin peut en plus
  //   modifier les comptes des autres via Personnel/Patient).
  // - biologiste : tout SAUF les pages financieres (Compta,
  //   Facture(Partenaire), Demandes paiement).
  // - technicien : uniquement Analyse, Patient (contacts) et Profil.
  // - preleveur, accueil : acces complet (non restreints pour le moment).
  const FULL_ACCESS = [
    'superadmin',
    'medecin',
    'docteur',
    'preleveur',
    'accueil',
    'acceuil',
  ]
  // Pages generales (non financieres) : + biologiste
  const STANDARD = [...FULL_ACCESS, 'biologiste']
  // Pages financieres : PAS de biologiste ni technicien
  const FINANCE = FULL_ACCESS
  // Pages du technicien : Analyse, Patient, Profil
  const AVEC_TECHNICIEN = [...STANDARD, 'technicien']

  const menuItems = [
    {
      id: 1,
      label: 'Accueil',
      route: '/dash',
      icon: faHome,
      allowedUserTypes: STANDARD,
    },
    {
      id: 2,
      label: 'Analyse',
      route: '/dash/Analyse',
      icon: faFileMedical,
      allowedUserTypes: AVEC_TECHNICIEN,
    },
    {
      id: 14,
      label: 'Prélèvement',
      route: '/dash/prelevement',
      icon: faSyringe,
      allowedUserTypes: AVEC_TECHNICIEN,
    },
    {
      id: 3,
      label: 'Parametre',
      route: '/dash/test',
      icon: faFlask,
      allowedUserTypes: STANDARD,
    },
    {
      id: 4,
      label: 'Patient',
      route: '/dash/patient',
      icon: faUsers,
      allowedUserTypes: AVEC_TECHNICIEN,
    },
    {
      id: 5,
      label: 'Personnel',
      route: '/dash/personnel',
      icon: faUsers,
      allowedUserTypes: STANDARD,
    },
    {
      id: 6,
      label: 'Clinique',
      route: '/dash/partenaireclinique',
      icon: faBuilding,
      allowedUserTypes: STANDARD,
    },
    {
      id: 7,
      label: 'Assurance/IPM',
      route: '/dash/partenaire',
      icon: faFileMedical,
      allowedUserTypes: STANDARD,
    },
    {
      id: 8,
      label: 'Ettiquette',
      route: '/dash/ettiquette',
      icon: faClipboardList,
      allowedUserTypes: STANDARD,
    },
    {
      id: 9,
      label: 'Facture(Partenaire)',
      route: '/dash/partenairefacture',
      icon: faFileInvoice,
      allowedUserTypes: FINANCE,
    },
    {
      id: 11,
      label: 'Compta',
      route: '/dash/compta',
      icon: faChartLine,
      allowedUserTypes: FINANCE,
    },
    {
      id: 13,
      label: 'Demandes paiement',
      route: '/dash/demande-payement',
      icon: faHandHoldingDollar,
      allowedUserTypes: FINANCE,
    },
    {
      id: 12,
      label: 'Logs',
      route: '/dash/logs',
      icon: faClipboardCheck,
      allowedUserTypes: STANDARD,
    },
    {
      id: 10,
      label: 'Profil',
      route: '/dash/parametre',
      icon: faCog,
      allowedUserTypes: AVEC_TECHNICIEN,
    },
  ]

  // Filtrage par role : chaque item liste explicitement les types
  // autorises. Les clients (patient) et partenaires n'ont pas acces a ce
  // menu (ils ont leur propre tableau de bord).
  const filteredMenuItems = menuItems.filter((item) =>
    item.allowedUserTypes.includes(userType)
  )

  const handleMenuItemClick = (id) => {
    setSelectedMenuItem(id)
  }

  return (
    <>
      {/* Sidebar pour les écrans larges et moyens */}
      <div className="hidden md:flex w-64 bg-base-300 base-content flex-col">
        {/* Contenu de votre Sidebar existant */}
        <div className="w-64 bg-base-300 base-content flex flex-col">
          <div className="flex items-center justify-center p-4">
            <img src={logo} alt="Logo" className="h-20 w-20" />
          </div>
          <h3 className="text-center text-lg font-bold mt-4">MENU</h3>
          <ul className="mt-4 w-full">
            {filteredMenuItems.map((menuItem) => (
              <li
                key={menuItem.id}
                className={`p-1 mt-2 cursor-pointer flex justify-center items-center text-center font-bold text-lg ${selectedMenuItem === menuItem.id ? 'bg-primary text-white' : ''}`}
                onClick={() => handleMenuItemClick(menuItem.id)}
              >
                <Link
                  to={menuItem.route}
                  className="focus:outline-none w-full flex items-left justify-left"
                >
                  <FontAwesomeIcon icon={menuItem.icon} className="mr-2" />
                  {menuItem.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Barre de navigation inférieure pour les écrans mobiles */}
      <div className="md:hidden z-50 fixed bottom-0 left-0 right-0 bg-base-300 py-2 flex justify-around items-center shadow-lg rounded-t-lg">
        {filteredMenuItems.map((menuItem) => (
          <Link
            key={menuItem.id}
            to={menuItem.route}
            className={`flex flex-col items-center justify-center ${selectedMenuItem === menuItem.id ? 'text-primary' : 'text-base-content'}`}
            onClick={() => handleMenuItemClick(menuItem.id)}
          >
            <FontAwesomeIcon icon={menuItem.icon} className="text-lg" />
            <span className="text-xs"></span>
          </Link>
        ))}
      </div>
    </>
  )
}

export default Sidebar
