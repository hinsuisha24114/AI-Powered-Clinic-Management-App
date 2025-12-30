import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getDoctorOnLeave, setDoctorOnLeave } from "../utils/doctorStatus"
import { removeToken, getUserRole } from "../utils/auth"
import "./Patients.css"

function Settings() {
  const navigate = useNavigate()
  const [isOnLeave, setIsOnLeave] = useState(false)
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light")
  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") === "on"
  )
  const [role] = useState(getUserRole())

  useEffect(() => {
    setIsOnLeave(getDoctorOnLeave())
  }, [])

  const handleAvailability = (checked) => {
    setIsOnLeave(checked)
    setDoctorOnLeave(checked)
  }

  const handleTheme = (value) => {
    setTheme(value)
    localStorage.setItem("theme", value)
  }

  const handleNotifications = (checked) => {
    setNotifications(checked)
    localStorage.setItem("notifications", checked ? "on" : "off")
  }

  const handleLogout = () => {
    removeToken()
    navigate("/login")
  }

  const handleClearLocal = () => {
    localStorage.clear()
    setTheme("light")
    setNotifications(false)
    setIsOnLeave(false)
    setDoctorOnLeave(false)
  }

  return (
    <div className="patients-page" style={{ padding: 20 }}>
      <div className="patients-header">
        <h1>Settings</h1>
        <p>Configure availability, preferences, and session.</p>
        <p style={{ color: "#6b7280", fontSize: 12 }}>Logged in as: {role}</p>
      </div>

      <div className="patients-grid">
        <div className="patients-card">
          <h2>Availability</h2>
          <div className="patient-form">
            <label className="form-label" style={{ alignItems: "center" }}>
              <span>Mark doctor on leave</span>
              <input
                type="checkbox"
                checked={isOnLeave}
                onChange={(e) => handleAvailability(e.target.checked)}
                style={{ width: "auto" }}
              />
            </label>
            <p>Status: {isOnLeave ? "On Leave" : "Available"}</p>
          </div>
        </div>

        <div className="patients-card">
          <h2>Appearance & Notifications</h2>
          <div className="patient-form">
            <label className="form-label">
              Theme
              <select value={theme} onChange={(e) => handleTheme(e.target.value)}>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>

            <label className="form-label" style={{ alignItems: "center" }}>
              <span>Enable notifications</span>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => handleNotifications(e.target.checked)}
                style={{ width: "auto" }}
              />
            </label>
          </div>
        </div>

        <div className="patients-card">
          <h2>Session</h2>
          <div className="patient-form" style={{ gap: 12 }}>
            <button className="primary-btn" onClick={handleLogout}>
              Logout
            </button>
            <button className="secondary-btn" type="button" onClick={handleClearLocal}>
              Clear local data
            </button>
            <p style={{ color: "#6b7280", fontSize: 12 }}>
              Clears localStorage (tokens, preferences, leave status). You will need to log in again.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings

