import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setToken, setUserRole } from '../utils/auth'
import './Login.css'

function Login() {
  // Simple form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Doctor') // default selected role
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Handle submit: fake login, store token + role, navigate home
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Please enter email and password')
      return
    }

    // In real app, call API. For now, accept any input, set a dummy token and save role.
    setToken('demo-token')
    setUserRole(role)
    // Redirect based on role
    if (role === 'Doctor') navigate('/dashboard')
    else if (role === 'Receptionist') navigate('/appointments')
    else navigate('/patients')
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Clinic Management Login</h2>

        {/* Role selection buttons */}
        <div className="role-switch">
          <button
            type="button"
            className={role === 'Doctor' ? 'role-btn role-active' : 'role-btn'}
            onClick={() => setRole('Doctor')}
          >
            Doctor
          </button>
          <button
            type="button"
            className={role === 'Patient' ? 'role-btn role-active' : 'role-btn'}
            onClick={() => setRole('Patient')}
          >
            Patient
          </button>
          <button
            type="button"
            className={role === 'Receptionist' ? 'role-btn role-active' : 'role-btn'}
            onClick={() => setRole('Receptionist')}
          >
            Receptionist
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </label>

          <label className="login-label">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </label>

          <button type="submit" className="login-button">
            Login as {role}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

