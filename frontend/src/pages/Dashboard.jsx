import { useEffect, useState } from 'react'
import { getDoctorOnLeave, setDoctorOnLeave } from '../utils/doctorStatus'
import './Dashboard.css'

function Dashboard() {
  // Track if doctor is on leave today
  const [isOnLeave, setIsOnLeave] = useState(false)

  // When page loads, read saved value from localStorage
  useEffect(() => {
    setIsOnLeave(getDoctorOnLeave())
  }, [])

  // Handle toggle / checkbox click
  const handleLeaveChange = (event) => {
    const value = event.target.checked
    setIsOnLeave(value)
    setDoctorOnLeave(value) // save to localStorage so other pages (Appointments) see it
  }
  // Sample data for appointments - in real app, this would come from API
  const appointments = [
    { id: 1, time: '9:00 AM', name: 'Ramesh', reason: 'Hypoglycemia', status: 'in-queue' },
    { id: 2, time: '9:30 AM', name: 'Anjali', reason: 'Rash', status: 'scheduled' },
    { id: 3, time: '10:15 AM', name: 'Vinod', reason: 'Knee pain', status: 'scheduled' },
    { id: 4, time: '10:45 AM', name: 'Kavita', reason: 'Follow-up', status: 'scheduled' }
  ]

  // Sample data for queue - in real app, this would come from API
  const queue = [
    { id: 1, name: 'Ramesh', waitTime: 5, avatar: '👨' },
    { id: 2, name: 'Anjali', waitTime: 8, avatar: '👩' },
    { id: 3, name: 'Vinod', waitTime: 15, avatar: '👨' },
    { id: 4, name: 'Kavita', waitTime: 23, avatar: '👩' },
    { id: 5, name: 'Kunal', waitTime: 30, avatar: '👨' }
  ]

  // Sample notifications - in real app, this would come from API
  const notifications = [
    { id: 1, message: 'Prescriptions shared', date: 'Dec 10', icon: '📄' },
    { id: 2, message: 'Lab results uploaded', date: 'Dec 9', icon: '⚠️' },
    { id: 3, message: 'Payment pending', date: 'Dec 8', icon: '💳' }
  ]

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
          
          {/* List of appointments */}
          <div className="appointments-list">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-item">
                {/* Left side - Queue number and patient info */}
                <div className="appointment-left">
                  {appointment.status === 'in-queue' && (
                    <span className="queue-badge">Queue 1</span>
                  )}
                  <div className="patient-info">
                    <span className="patient-name">{appointment.name}</span>
                    <span className="appointment-reason">{appointment.reason}</span>
                  </div>
                </div>
                
                {/* Right side - Time and action buttons */}
                <div className="appointment-right">
                  <span className="appointment-time">{appointment.time}</span>
                  {appointment.status === 'in-queue' ? (
                    /* Video call controls for current patient */
                    <div className="call-controls">
                      <button className="control-btn">▶️</button>
                      <button className="control-btn">🎤</button>
                      <button className="control-btn">📞</button>
                    </div>
                  ) : (
                    /* Consultation button for scheduled appointments */
                    <button className="consult-btn">Consultation</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Queue Management Card - Right Top */}
        <div className="dashboard-card">
          <h3 className="card-title">Smart Queue Management</h3>
          
          {/* List of patients in queue */}
          <div className="queue-list">
            {queue.map((patient) => (
              <div key={patient.id} className="queue-item">
                {/* Queue number */}
                <span className="queue-number">Q{patient.id}</span>
                
                {/* Patient avatar */}
                <div className="queue-avatar">{patient.avatar}</div>
                
                {/* Patient name */}
                <span className="queue-name">{patient.name}</span>
                
                {/* Estimated wait time */}
                <span className="wait-time">{patient.waitTime} min</span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications Card - Left Bottom */}
        <div className="dashboard-card">
          <h3 className="card-title">Notifications</h3>
          
          {/* List of notifications */}
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div key={notification.id} className="notification-item">
                {/* Notification icon */}
                <span className="notification-icon">{notification.icon}</span>
                
                {/* Notification content */}
                <div className="notification-content">
                  <span className="notification-message">{notification.message}</span>
                  <span className="notification-date">{notification.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Card - Right Bottom */}
        <div className="dashboard-card">
          <h3 className="card-title">Quick Actions</h3>
          
          {/* Action buttons */}
          <div className="quick-actions">
            <button className="action-btn">
              <span className="action-icon">➕</span>
              <span>Add Patient</span>
            </button>
            
            <button className="action-btn">
              <span className="action-icon">📅</span>
              <span>Create Appointment</span>
            </button>
            
            <button className="action-btn">
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
