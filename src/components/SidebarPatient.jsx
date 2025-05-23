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
} from '@fortawesome/free-solid-svg-icons'
import logo from '../images/bioramlogo.png'

function SidebarPatient() {
  const [selectedMenuItem, setSelectedMenuItem] = useState(1)

  const menuItems = [
    { id: 1, label: 'Accueil', route: '/patient-dash', icon: faHome },
    // {
    //   id: 2,
    //   label: 'Analyse',
    //   route: '/dash/Analyse',
    //   icon: faFileInvoiceDollar,
    // },
    // { id: 3, label: 'Devis', route: '/dash/Devis', icon: faFileAlt },
    // { id: 4, label: 'Patient', route: '/dash/patient', icon: faUsers },
    // { id: 5, label: 'Personnel', route: '/dash/personnel', icon: faUsers },
    // { id: 6, label: 'Test', route: '/dash/test', icon: faTag },
    // { id: 7, label: 'Partenaire', route: '/dash/partenaire', icon: faTag },
    // {
    //   id: 8,
    //   label: 'Ettiquette',
    //   route: '/dash/ettiquette',
    //   icon: faClipboardList,
    // },
    // // { id: 8, label: 'Instructions', route: '/dash/instruction', icon: faBook },
    // { id: 9, label: 'Message', route: '/dash/notification', icon: faEnvelope },
    {
      id: 10,
      label: 'Paramètres',
      route: '/patient-dash/parametre',
      icon: faCog,
    },
  ]

  const handleMenuItemClick = (id) => {
    setSelectedMenuItem(id)
  }

  return (
    <>
      {/* SidebarPatient pour les écrans larges et moyens */}
      <div className="hidden md:flex w-64 bg-base-300 base-content flex-col">
        {/* Contenu de votre SidebarPatient existant */}
        <div className="w-64 bg-base-300 base-content flex flex-col">
          <div className="flex items-center justify-center p-4">
            <img src={logo} alt="Logo" className="h-20 w-20" />
          </div>
          <h3 className="text-center text-lg font-bold mt-4">MENU</h3>
          <ul className="mt-4 w-full">
            {menuItems.map((menuItem) => (
              <li
                key={menuItem.id}
                className={`p-2 mt-4 cursor-pointer flex justify-center items-center text-center font-bold text-lg ${selectedMenuItem === menuItem.id ? 'bg-primary text-white' : ''}`}
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
        {menuItems.map((menuItem) => (
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

export default SidebarPatient
