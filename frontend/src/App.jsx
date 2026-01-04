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
import PatientDetail from './pages/PatientDetail'
import Prescription from './pages/Prescription'
import Billing from './pages/Billing'
import Settings from './pages/Settings'
import Login from './pages/Login'

function App() {
  return (
    <Routes>
      {/* Public route: login */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes: wrapped in main Layout with sidebar + header */}
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/patients/:patientId" element={<PatientDetail />} />
        <Route path="/prescriptions" element={<Prescription />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
