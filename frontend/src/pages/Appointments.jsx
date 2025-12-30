import { useEffect, useMemo, useState } from 'react'
import { getDoctorOnLeave } from '../utils/doctorStatus'
import { getAppointments, createAppointment, getPatients, getQueueStatus, createQueueToken, updateQueueToken, deleteAppointment, deleteQueueToken } from '../services/api'
import './Appointments.css'

function Appointments() {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])
  const [queue, setQueue] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state for creating a new appointment
  const [form, setForm] = useState({
    patientId: '',
    reason: '',
    date: '',
    time: ''
  })

  // Track if doctor is on leave today
  const [isOnLeave, setIsOnLeave] = useState(false)

  useEffect(() => {
    setIsOnLeave(getDoctorOnLeave())
    loadData()
    const interval = setInterval(() => {
      refreshQueue()
    }, 10000)
    return () => clearInterval(interval)
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
      setAppointments(aptRes.data || [])
      setPatients(patientRes.data || [])
      setQueue(queueRes.data || [])
    } catch (err) {
      setError('Could not load appointments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (isOnLeave) {
      setError('Doctor is on leave today. Cannot book new appointments.')
      return
    }

    if (!form.patientId || !form.reason || !form.date || !form.time) {
      setError('Please fill all fields.')
      return
    }

    // Combine date and time into ISO string for backend
    const isoDate = new Date(`${form.date}T${form.time}`)

    try {
      await createAppointment({
        patient_id: Number(form.patientId),
        appointment_time: isoDate.toISOString()
      })
      setForm({ patientId: '', reason: '', date: '', time: '' })
      loadData()
    } catch (err) {
      setError('Failed to create appointment.')
    }
  }

  const handleAddToQueue = async (appointmentId) => {
    setError('')
    try {
      await createQueueToken({ appointment_id: appointmentId })
      await refreshQueue()
    } catch (err) {
      setError('Failed to add to queue.')
    }
  }

  const handleUpdateQueue = async (tokenId, status) => {
    setError('')
    try {
      await updateQueueToken(tokenId, status)
      await refreshQueue()
    } catch (err) {
      setError('Failed to update queue.')
    }
  }

  const refreshQueue = async () => {
    try {
      const queueRes = await getQueueStatus()
      setQueue(queueRes.data || [])
    } catch {
      /* silent poll */
    }
  }

  const inQueueCount = useMemo(
    () => appointments.filter((a) => a.status === 'in-queue' || a.status === 'In Queue').length,
    [appointments]
  )
  const scheduledCount = useMemo(
    () => appointments.filter((a) => a.status === 'scheduled' || a.status === 'Scheduled').length,
    [appointments]
  )

  const patientNameById = (id) => {
    const p = patients.find((x) => x.id === id)
    return p ? p.name : `Patient #${id}`
  }

  return (
    <div className="appointments-page">
      <div className="appointments-header">
        <div>
          <h1 className="appointments-title">Appointments</h1>
          <p className="appointments-subtitle">
            View, schedule, and manage appointments.
          </p>
        </div>
        <div className="header-actions">
          <span className="badge soft">Scheduled: {scheduledCount}</span>
          <span className="badge soft blue">In queue: {inQueueCount}</span>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="appointments-grid">
        <div className="appointments-card">
          <div className="card-top">
            <h2 className="card-title">Upcoming Appointments</h2>
            <span className="badge">{appointments.length} total</span>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="appointments-list">
              {appointments.map((apt) => {
                const date = apt.appointment_time
                  ? new Date(apt.appointment_time)
                  : null
                const timeText = date ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'
                const dateText = date ? date.toLocaleDateString() : '—'
                return (
                  <div key={apt.id} className="appointment-row">
                    <div className="row-left">
                      <div className="row-time">
                        <span className="time-text">{timeText}</span>
                        <span className="date-text">{dateText}</span>
                      </div>
                      <div className="row-info">
                        <span className="patient-name">{patientNameById(apt.patient_id)}</span>
                        <span className="reason-text">{apt.reason || 'Follow-up'}</span>
                      </div>
                    </div>
                    <div className="row-right">
                      <span
                        className={`status-chip ${
                          apt.status === 'in-queue' || apt.status === 'In Queue' ? 'chip-blue' : 'chip-gray'
                        }`}
                      >
                        {apt.status || 'Scheduled'}
                      </span>
                      <div className="row-actions">
                        <button className="small-btn" type="button">Open</button>
                        <button
                          className="small-btn danger"
                          type="button"
                          onClick={async () => {
                            try {
                              await deleteAppointment(apt.id)
                              loadData()
                            } catch {
                              setError('Failed to delete appointment.')
                            }
                          }}
                        >
                          Delete
                        </button>
                        <button
                          className="small-btn"
                          type="button"
                          onClick={() => handleAddToQueue(apt.id)}
                        >
                          Add to queue
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
              {appointments.length === 0 && <div className="empty">No appointments yet.</div>}
            </div>
          )}
        </div>

        <div className="right-column">
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-label">In Queue</span>
              <span className="stat-value">{inQueueCount}</span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Scheduled</span>
              <span className="stat-value">{scheduledCount}</span>
            </div>
          </div>

          <div className="appointments-card">
            <h2 className="card-title">Create Appointment</h2>

            {isOnLeave && (
              <div className="leave-message">
                Doctor is marked as <strong>on leave today</strong>. New appointments
                cannot be booked.
              </div>
            )}

            <form className="appointment-form" onSubmit={handleSubmit}>
              <label className="form-label">
                Patient
                <select
                  name="patientId"
                  value={form.patientId}
                  onChange={handleChange}
                >
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (#{p.id})
                    </option>
                  ))}
                </select>
              </label>

              <label className="form-label">
                Reason / Notes
                <input
                  type="text"
                  name="reason"
                  value={form.reason}
                  onChange={handleChange}
                  placeholder="E.g. Fever, follow-up"
                />
              </label>

              <div className="form-row">
                <label className="form-label half">
                  Date
                  <input
                    type="date"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                  />
                </label>

                <label className="form-label half">
                  Time
                  <input
                    type="time"
                    name="time"
                    value={form.time}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <button type="submit" className="primary-btn" disabled={isOnLeave}>
                Save Appointment
              </button>
            </form>
          </div>

          <div className="appointments-card">
            <h2 className="card-title">Live Queue</h2>
            <div className="queue-list">
              {queue.map((q) => (
                <div key={q.token_id} className="queue-item">
                  <span className="queue-number">Q{q.token_number}</span>
                  <span className="queue-name">Appt #{q.appointment_id}</span>
                  <span className="wait-time">{q.status}</span>
                  <div className="queue-actions">
                    <button
                      className="small-btn"
                      type="button"
                      onClick={() => handleUpdateQueue(q.token_id, 'serving')}
                    >
                      Serve
                    </button>
                    <button
                      className="small-btn"
                      type="button"
                      onClick={() => handleUpdateQueue(q.token_id, 'done')}
                    >
                      Complete
                    </button>
                    <button
                      className="small-btn"
                      type="button"
                      onClick={async () => {
                        try {
                          await deleteQueueToken(q.token_id)
                          await refreshQueue()
                        } catch {
                          setError('Failed to delete token.')
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {queue.length === 0 && <div className="empty">No queue tokens yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Appointments
