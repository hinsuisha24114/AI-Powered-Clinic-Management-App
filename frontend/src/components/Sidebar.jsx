import { Link, useLocation } from 'react-router-dom'
import './Sidebar.css'

function Sidebar() {
  // Get current page URL to highlight active menu item
  const location = useLocation()
  const currentPath = location.pathname

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
        {/* Dashboard link - highlighted if currently on dashboard page */}
        <Link 
          to="/" 
          className={currentPath === '/' ? 'nav-item active' : 'nav-item'}
        >
          <span className="nav-icon">📊</span> {/* Dashboard icon */}
          <span>Dashboard</span>
        </Link>

        {/* Appointments link */}
        <Link 
          to="/appointments" 
          className={currentPath === '/appointments' ? 'nav-item active' : 'nav-item'}
        >
          <span className="nav-icon">👤</span> {/* Person icon */}
          <span>Appointments</span>
        </Link>

        {/* Patients link */}
        <Link 
          to="/patients" 
          className={currentPath === '/patients' ? 'nav-item active' : 'nav-item'}
        >
          <span className="nav-icon">📁</span> {/* Folder icon */}
          <span>Patients</span>
        </Link>

        {/* E-Prescriptions link */}
        <Link 
          to="/prescriptions" 
          className={currentPath === '/prescriptions' ? 'nav-item active' : 'nav-item'}
        >
          <span className="nav-icon">💊</span> {/* Prescription icon */}
          <span>Prescription</span>
        </Link>

        {/* Billing link */}
        <Link 
          to="/billing" 
          className={currentPath === '/billing' ? 'nav-item active' : 'nav-item'}
        >
          <span className="nav-icon">💰</span> {/* Money icon */}
          <span>Billing</span>
        </Link>

        {/* Settings link */}
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
