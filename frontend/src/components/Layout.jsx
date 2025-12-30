import { Outlet, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { getToken } from '../utils/auth'
import './Layout.css'

function Layout() {
  const navigate = useNavigate()

  // Simple auth check: if no token, go to login page
  useEffect(() => {
    const token = getToken()
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  return (
    <div className="layout">
      {/* Main layout container */}
      
      {/* Left sidebar for navigation */}
      <Sidebar />
      
      {/* Right side - header and main content */}
      <div className="layout-main">
        {/* Header bar at top */}
        <Header />
        
        {/* Main content area - where pages are displayed */}
        <main className="layout-content">
          <Outlet /> {/* This displays the current page (Dashboard, etc.) */}
        </main>
      </div>
    </div>
  )
}

export default Layout
