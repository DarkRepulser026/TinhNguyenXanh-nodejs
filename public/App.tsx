import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Events from './pages/Events'
import Organizations from './pages/Organizations'
import EventDetails from './pages/EventDetails'
import OrganizationDetails from './pages/OrganizationDetails'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard'
import OrganizerDashboard from './pages/organizer/OrganizerDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/organizations" element={<Organizations />} />
            <Route path="/organizations/:id" element={<OrganizationDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
            <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  )
}

export default App
