import { Link, useLocation } from 'react-router-dom'
import { getUserRole } from '../utils/auth'
import './Sidebar.css'

function Sidebar() {
  // Get current page URL to highlight active menu item
  const location = useLocation()
  const currentPath = location.pathname
  const role = getUserRole()

  const canSeeDashboard = role === 'Doctor'
  const canSeeAppointments = role === 'Doctor' || role === 'Receptionist'
  const canSeePatients = true // all roles
  const canSeePrescription = role === 'Doctor'
  const canSeeBilling = role === 'Doctor' || role === 'Receptionist'
  const canSeeSummary = role === 'Doctor' || role === 'Receptionist'

  return (
    <aside className="sidebar">
      {/* Sidebar container - fixed width on left side */}
      
      {/* Logo/Title section at top of sidebar */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">+</span> {/* Plus icon for medical/cross symbol */}
          <h1 className="sidebar-title">AI-Powered Clinic</h1>
        </div>
      </div>

      {/* Navigation menu items */}
      <nav className="sidebar-nav">
        {canSeeDashboard && (
          <Link 
            to="/dashboard" 
            className={currentPath === '/' || currentPath === '/dashboard' ? 'nav-item active' : 'nav-item'}
          >
            <span className="nav-icon">📊</span> {/* Dashboard icon */}
            <span>Dashboard</span>
          </Link>
        )}

        {canSeeAppointments && (
          <Link 
            to="/appointments" 
            className={currentPath === '/appointments' ? 'nav-item active' : 'nav-item'}
          >
            <span className="nav-icon">👤</span> {/* Person icon */}
            <span>Appointments</span>
          </Link>
        )}

        {canSeePatients && (
          <Link 
            to="/patients" 
            className={currentPath.startsWith('/patients') ? 'nav-item active' : 'nav-item'}
          >
            <span className="nav-icon">📁</span> {/* Folder icon */}
            <span>Patients</span>
          </Link>
        )}

        {canSeePrescription && (
          <Link 
            to="/prescriptions" 
            className={currentPath === '/prescriptions' ? 'nav-item active' : 'nav-item'}
          >
            <span className="nav-icon">💊</span> {/* Prescription icon */}
            <span>Prescription</span>
          </Link>
        )}

        {canSeeBilling && (
          <Link 
            to="/billing" 
            className={currentPath === '/billing' ? 'nav-item active' : 'nav-item'}
          >
            <span className="nav-icon">💰</span> {/* Money icon */}
            <span>Billing</span>
          </Link>
        )}

        {canSeeSummary && (
          <Link 
            to="/summary" 
            className={currentPath === '/summary' ? 'nav-item active' : 'nav-item'}
          >
            <span className="nav-icon">📜</span>
            <span>Summary</span>
          </Link>
        )}

        <Link 
          to="/settings" 
          className={currentPath === '/settings' ? 'nav-item active' : 'nav-item'}
        >
          <span className="nav-icon">⚙️</span> {/* Settings icon */}
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  )
}

export default Sidebar
