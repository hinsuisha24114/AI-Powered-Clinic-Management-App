import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDoctorOnLeave, setDoctorOnLeave } from '../utils/doctorStatus'
import { getAppointments, getPatients, getQueueStatus } from '../services/api'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  // Track if doctor is on leave today
  const [isOnLeave, setIsOnLeave] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [queue, setQueue] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // When page loads, read saved value from localStorage
  useEffect(() => {
    setIsOnLeave(getDoctorOnLeave())
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')
      const [aptRes, patientRes, queueRes] = await Promise.all([
        getAppointments(),
        getPatients(),
        getQueueStatus()
      ])
      const appts = aptRes.data || []
      setAppointments(appts)
      setQueue(queueRes.data || [])
      // simple notifications based on latest activity
      const notes = []
      if (appts.length) {
        notes.push({
          id: 'apt',
          message: `You have ${appts.length} appointments scheduled`,
          date: 'Today',
          icon: '📅'
        })
      }
      if (queueRes.data && queueRes.data.length) {
        notes.push({
          id: 'queue',
          message: `Queue active: ${queueRes.data.length} patients waiting`,
          date: 'Live',
          icon: '⏱️'
        })
      }
      if (patientRes.data && patientRes.data.length) {
        notes.push({
          id: 'patients',
          message: `${patientRes.data.length} patients in records`,
          date: 'Today',
          icon: '🧑‍⚕️'
        })
      }
      setNotifications(notes)
    } catch (err) {
      setError('Could not load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  // Handle toggle / checkbox click
  const handleLeaveChange = (event) => {
    const value = event.target.checked
    setIsOnLeave(value)
    setDoctorOnLeave(value) // save to localStorage so other pages (Appointments) see it
  }

  const inQueueCount = useMemo(
    () => queue.filter((q) => q.status === 'waiting').length,
    [queue]
  )
  const scheduledCount = useMemo(
    () => appointments.filter((a) => a.status === 'scheduled').length,
    [appointments]
  )

  return (
    <div className="dashboard">
      {/* Hero section with doctor image and intro text */}
      <section className="hero">
        <div className="hero-left">
          <h1 className="hero-title">Renew Vitality Is Within Reach</h1>
          <p className="hero-text">
            Manage appointments, patients, prescriptions and billing in one simple doctor dashboard.
          </p>
          <button className="hero-button">Start Consultation</button>
        </div>
        <div className="hero-right">
          {/* Simple placeholder for doctor illustration */}
          <div className="hero-doctor-circle">👩‍⚕️</div>
        </div>
      </section>

      {/* Simple bar at top to show and change leave status */}
      <div className="leave-bar">
        <div>
          <span className="leave-label">Doctor availability for today:</span>
          <span className={isOnLeave ? 'leave-status leave-off' : 'leave-status leave-on'}>
            {isOnLeave ? 'On Leave' : 'Available'}
          </span>
        </div>
        <label className="leave-toggle">
          <input
            type="checkbox"
            checked={isOnLeave}
            onChange={handleLeaveChange}
          />
          <span>Mark as on leave</span>
        </label>
      </div>

      {/* Grid layout for cards - 2 columns on desktop */}
      <div className="dashboard-grid">
        
        {/* Today's Appointments Card - Left Top */}
        <div className="dashboard-card">
          <h3 className="card-title">Today's Appointments</h3>
          {error && <div className="error-banner">{error}</div>}
          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="appointments-list">
              {appointments.map((appointment) => {
                const date = appointment.appointment_time ? new Date(appointment.appointment_time) : null
                const timeText = date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
                return (
                  <div key={appointment.id} className="appointment-item">
                    <div className="appointment-left">
                      {appointment.status === 'in-queue' && (
                        <span className="queue-badge">Queue</span>
                      )}
                      <div className="patient-info">
                        <span className="patient-name">Appt #{appointment.id}</span>
                        <span className="appointment-reason">{appointment.reason || 'Follow-up'}</span>
                      </div>
                    </div>
                    <div className="appointment-right">
                      <span className="appointment-time">{timeText}</span>
                      {appointment.status === 'in-queue' ? (
                        <div className="call-controls">
                          <button className="control-btn">▶️</button>
                          <button className="control-btn">🎤</button>
                          <button className="control-btn">📞</button>
                        </div>
                      ) : (
                        <button className="consult-btn">Consultation</button>
                      )}
                    </div>
                  </div>
                )
              })}
              {appointments.length === 0 && <div className="empty">No appointments yet.</div>}
            </div>
          )}
        </div>

        {/* Smart Queue Management Card - Right Top */}
        <div className="dashboard-card">
          <h3 className="card-title">Smart Queue Management</h3>
          <div className="queue-list">
            {queue.map((item) => (
              <div key={item.token_id} className="queue-item">
                <span className="queue-number">Q{item.token_number}</span>
                <div className="queue-avatar">👤</div>
                <span className="queue-name">Appt #{item.appointment_id}</span>
                <span className="wait-time">{item.status}</span>
              </div>
            ))}
            {queue.length === 0 && <div className="empty">No queue tokens yet.</div>}
          </div>
        </div>

        {/* Notifications Card - Left Bottom */}
        <div className="dashboard-card">
          <h3 className="card-title">Notifications</h3>
          
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div key={notification.id} className="notification-item">
                <span className="notification-icon">{notification.icon}</span>
                <div className="notification-content">
                  <span className="notification-message">{notification.message}</span>
                  <span className="notification-date">{notification.date}</span>
                </div>
              </div>
            ))}
            {notifications.length === 0 && <div className="empty">No new notifications.</div>}
          </div>
        </div>

        {/* Quick Actions Card - Right Bottom */}
        <div className="dashboard-card">
          <h3 className="card-title">Quick Actions</h3>
          
          {/* Action buttons */}
          <div className="quick-actions">
            <button className="action-btn" onClick={() => navigate('/patients')}>
              <span className="action-icon">➕</span>
              <span>Add Patient</span>
            </button>
            
            <button className="action-btn" onClick={() => navigate('/appointments')}>
              <span className="action-icon">📅</span>
              <span>Create Appointment</span>
            </button>
            
            <button className="action-btn" onClick={() => navigate('/prescriptions')}>
              <span className="action-icon">✍️</span>
              <span>New Prescription</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard
