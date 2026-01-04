// Simple React wrapper component for the existing Dashboard page.
// This fixes the previous error where this file contained JSON instead of JSX.

import Dashboard from './Dashboard'

function DoctorDashboard() {
  // Reuse the main Dashboard component so all functionality stays the same.
  return <Dashboard />
}

export default DoctorDashboard