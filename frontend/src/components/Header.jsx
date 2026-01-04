import { useNavigate } from 'react-router-dom'
import { removeToken } from '../utils/auth'
import './Header.css'

function Header() {
  const navigate = useNavigate()

  // Clear token and send user back to login page
  const handleLogout = () => {
    removeToken()
    navigate('/login')
  }

  return (
    <header className="header">
      {/* Header bar at top of page */}
      
      {/* Left side - Page title */}
      <h2 className="header-title">Doctor Dashboard</h2>

      {/* Right side - User info and logout button */}
      <div className="header-right">
        {/* Doctor's name */}
        <span className="doctor-name">Dr. Ashok Seth</span>
        
        {/* Profile picture circle */}
        <div className="profile-picture">
          <span>👨‍⚕️</span> {/* Doctor emoji as profile picture */}
        </div>
        
        {/* Logout button */}
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  )
}

export default Header
