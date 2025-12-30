// import { Routes, Route } from "react-router-dom"
// import Patients from "./pages/Patients"
// import Appointments from "./pages/Appointments"
// import PatientDetail from "./pages/PatientDetail"

// function App() {
//   return (
//     <Routes>
//       <Route path="/" element={<Patients />} />
//       <Route path="/patients" element={<Patients />} />
//       <Route path="/patients/:id" element={<PatientDetail />} />
//       <Route path="/appointments" element={<Appointments />} />
//     </Routes>
//   )
// }

// export default App


import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Patients from './pages/Patients'
import Prescription from './pages/Prescription'
import Billing from './pages/Billing'
import Login from './pages/Login'
import Settings from './pages/Settings'
import PatientDetail from './pages/PatientDetail'
import Summary from './pages/Summary'
import { getToken, getUserRole } from './utils/auth'
import { Navigate } from 'react-router-dom'

// Simple role-based guard
function RequireAuth({ allowedRoles, children }) {
  const token = getToken()
  const role = getUserRole()
  const isAllowed = allowedRoles.includes(role)

  if (!token) return <Navigate to="/login" replace />
  if (!isAllowed) return <Navigate to="/unauthorized" replace />
  return children
}

// Landing route depending on role
function HomeRedirect() {
  const role = getUserRole()
  if (role === 'Doctor') return <Dashboard />
  if (role === 'Receptionist') return <Navigate to="/appointments" replace />
  return <Navigate to="/patients" replace />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<div style={{ padding: 20 }}>Unauthorized</div>} />

      <Route element={<Layout />}>
        <Route path="/" element={<HomeRedirect />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth allowedRoles={['Doctor']}>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/appointments"
          element={
            <RequireAuth allowedRoles={['Doctor', 'Receptionist']}>
              <Appointments />
            </RequireAuth>
          }
        />
        <Route
          path="/patients"
          element={
            <RequireAuth allowedRoles={['Doctor', 'Receptionist', 'Patient']}>
              <Patients />
            </RequireAuth>
          }
        />
        <Route
          path="/patients/:patientId"
          element={
            <RequireAuth allowedRoles={['Doctor', 'Receptionist', 'Patient']}>
              <PatientDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/prescriptions"
          element={
            <RequireAuth allowedRoles={['Doctor']}>
              <Prescription />
            </RequireAuth>
          }
        />
        <Route
          path="/billing"
          element={
            <RequireAuth allowedRoles={['Doctor', 'Receptionist']}>
              <Billing />
            </RequireAuth>
          }
        />
        <Route
          path="/settings"
          element={
            <RequireAuth allowedRoles={['Doctor', 'Receptionist', 'Patient']}>
              <Settings />
            </RequireAuth>
          }
        />
        <Route
          path="/summary"
          element={
            <RequireAuth allowedRoles={['Doctor', 'Receptionist']}>
              <Summary />
            </RequireAuth>
          }
        />
      </Route>
    </Routes>
  )
}

export default App
