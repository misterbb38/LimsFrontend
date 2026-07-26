import { useState, useEffect } from 'react'
import { themeChange } from 'theme-change'
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'

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
import Compta from './pages/Compta'
import Logs from './pages/Logs'
import DemandePayement from './pages/DemandePayement'

import KeyExpired from './components/KeyExpired'
import Notifications from './components/Notifications'
import { isSessionExpired, clearSession } from './utils/auth'

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  // Seuls les EMPLOYES accedent au tableau de bord /dash. Les clients
  // (patient) et les partenaires sont rediriges vers leur propre espace.
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
  // Session terminee (token expire) ou absente : on nettoie et on renvoie
  // vers la page de connexion.
  if (!userInfo || isSessionExpired()) {
    clearSession()
    return <Navigate to="/" replace />
  }
  if (userInfo.userType === 'patient')
    return <Navigate to="/patient-dash" replace />
  if (userInfo.userType === 'partenaire')
    return <Navigate to="/partenaire-dash" replace />

  return (
    <div className="flex h-screen bg-base-200">
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
  // Session terminee ou absente : retour a la connexion.
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
  if (!userInfo || isSessionExpired()) {
    clearSession()
    return <Navigate to="/" replace />
  }
  return (
    <div className="flex h-screen bg-base-200">
      <SidebarPatient toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function PartenaireDashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  // Session terminee ou absente : retour a la connexion.
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || 'null')
  if (!userInfo || isSessionExpired()) {
    clearSession()
    return <Navigate to="/" replace />
  }
  return (
    <div className="flex h-screen bg-base-200">
      <SidebarPartenaire toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

function App() {
  useEffect(() => themeChange(false), [])

  // Deconnexion automatique quand la session (token JWT) expire, meme si
  // l'utilisateur reste sur une page sans naviguer. Verifie au montage
  // puis toutes les 30 secondes.
  useEffect(() => {
    const verifierSession = () => {
      const info = JSON.parse(localStorage.getItem('userInfo') || 'null')
      if (info && isSessionExpired()) {
        clearSession()
        if (window.location.pathname !== '/') {
          window.location.href = '/'
        }
      }
    }
    verifierSession()
    const id = setInterval(verifierSession, 30000)
    return () => clearInterval(id)
  }, [])

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
          <Route
            path="partenaireclinique"
            element={<PartenaireCliniqueList />}
          />
          <Route path="test" element={<TestList />} />
          <Route path="partenaire" element={<PartenaireList />} />
          <Route path="ettiquette" element={<Ettiquette />} />
          <Route path="Formulaire" element={<Formulaire />} />
          <Route path="partenairefacture" element={<PartenaireFacture />} />
          <Route path="compta" element={<Compta />} />
          <Route path="logs" element={<Logs />} />
          <Route path="demande-payement" element={<DemandePayement />} />
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
