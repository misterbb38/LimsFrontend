import { useState, useEffect } from 'react'
import { themeChange } from 'theme-change'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'

import TopBar from './components/TopBar'
import Sidebar from './components/Sidebar'
import PDFViewer from './components/PDFViewer'
import SidebarPatient from './components/SidebarPatient'
import SidebarPartenaire from './components/SidebarPartenaire'
import PartenaireCliniqueList from './pages/PartenaireCliniqueList'
import SignIn from './components/Auth/SignIn'
import SignUp from './components/Auth/SignUp'
import HomeContent from './components/index'
import Analyse from './pages/Analyse'
import PatientHome from './pages/PatientHome'
import PartenaireClinique from './pages/partenaireCliniqueHome'
import Ettiquette from './pages/Ettiquette'
import Devis from './pages/Devis'
import Formulaire from './pages/Formulaire'
import Instruction from './pages/Instruction'
import Parametre from './pages/Parametre'
import PatientList from './pages/patientList'
import Personnel from './pages/Personnel'
import TestList from './pages/TestList'
import PartenaireList from './pages/PartenaireList'
import PartenaireFacture from './pages/PartenaireFacture'

import KeyExpired from './components/KeyExpired'
import Notifications from './components/Notifications'

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="flex h-screen bg-gray-100">
      {isSidebarOpen && <Sidebar />}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar toggleSidebar={toggleSidebar} />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function PatientDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  return (
    <div className="flex h-screen bg-blue-100">
      {' '}
      {/* Changez le style comme vous le souhaitez */}
      <SidebarPatient toggleSidebar={toggleSidebar} />{' '}
      {/* Supposons que vous voulez garder la sidebar, sinon créez une nouvelle */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />{' '}
        {/* Vous pourriez vouloir personnaliser cette barre pour les patients */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />{' '}
          {/* Ici, les composants enfants spécifiques aux patients seront rendus */}
        </div>
      </div>
    </div>
  )
}


function PartenaireDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  return (
    <div className="flex h-screen bg-blue-100">
      {' '}
      {/* Changez le style comme vous le souhaitez */}
      <SidebarPartenaire toggleSidebar={toggleSidebar} />{' '}
      {/* Supposons que vous voulez garder la sidebar, sinon créez une nouvelle */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />{' '}
        {/* Vous pourriez vouloir personnaliser cette barre pour les patients */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />{' '}
          {/* Ici, les composants enfants spécifiques aux patients seront rendus */}
        </div>
      </div>
    </div>
  )
}

function App() {
  useEffect(() => themeChange(false), [])

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/" element={<SignIn />} />

        <Route path="/signup" element={<SignUp />} />
        <Route path="/keyExpired" element={<KeyExpired />} />

        <Route path="/dash" element={<AppLayout />}>
          <Route index element={<HomeContent />} />
          <Route path="Analyse" element={<Analyse />} />
          <Route path="Devis" element={<Devis />} />
          <Route path="patient" element={<PatientList />} />
          <Route path="personnel" element={<Personnel />} />
          <Route path="partenaireclinique" element={<PartenaireCliniqueList />} />
          <Route path="test" element={<TestList />} />
          <Route path="partenaire" element={<PartenaireList />} />
          <Route path="ettiquette" element={<Ettiquette />} />
          <Route path="Formulaire" element={<Formulaire />} />
          <Route path="partenairefacture" element={<PartenaireFacture />} />
          <Route path="notification" element={<Notifications />} />
          
          <Route path="parametre" element={<Parametre />} />
        </Route>

        <Route path="/patient-dash" element={<PatientDashboardLayout />}>
          <Route index element={<PatientHome />} />{' '}
          {/* Page d'accueil des patients */}
          {/* <Route path="profile" element={<PatientProfile />} />{' '} */}
          {/* Profil du patient */}
          <Route path="parametre" element={<Parametre />} />{' '}
          {/* Rendez-vous du patient */}
          {/* Ajoutez d'autres sous-routes spécifiques aux patients ici */}
        </Route>

        <Route path="/partenaire-dash" element={<PartenaireDashboardLayout />}>
          <Route index element={<PartenaireClinique />} />{' '}
          {/* Page d'accueil des patients */}
          {/* <Route path="profile" element={<PatientProfile />} />{' '} */}
          {/* Profil du patient */}
          <Route path="parametre" element={<Parametre />} />{' '}
          {/* Rendez-vous du patient */}
          {/* Ajoutez d'autres sous-routes spécifiques aux patients ici */}
        </Route>
        <Route path="pdf-viewer" element={<PDFViewer />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
