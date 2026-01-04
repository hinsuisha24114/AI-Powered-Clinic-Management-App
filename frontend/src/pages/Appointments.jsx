import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDoctorOnLeave } from '../utils/doctorStatus'
import { createAppointment, getAppointments, createPatient, getPatients } from '../services/api'
import './Appointments.css'

function Appointments() {
  const navigate = useNavigate()
  
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients] = useState([])

  // Simple form state for creating a new appointment
  const [form, setForm] = useState({
    patient: '',
    reason: '',
    date: '',
    time: '',
    status: 'Scheduled',
  })

  // Track if doctor is on leave today
  const [isOnLeave, setIsOnLeave] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch appointments and patients on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsOnLeave(getDoctorOnLeave())
        
        // Fetch patients from API
        const patientsRes = await getPatients()
        const patientsList = patientsRes.data || []
        setPatients(patientsList)
        
        // Fetch appointments from API
        const appointmentsRes = await getAppointments()
        const appointmentsList = appointmentsRes.data || []
        
        // Map appointments with patient info and formatted date/time
        const enrichedAppointments = appointmentsList.map((apt) => {
          const patient = patientsList.find((p) => p.id === apt.patient_id)
          const appointmentDate = new Date(apt.appointment_time)
          const date = appointmentDate.toISOString().split('T')[0] // YYYY-MM-DD
          const time = appointmentDate.toTimeString().slice(0, 5) // HH:MM
          
          return {
            ...apt,
            patient: patient?.name || 'Unknown Patient',
            reason: apt.notes || 'General Checkup',
            date: date,
            time: time,
            patientId: apt.patient_id,
          }
        })
        
        setAppointments(enrichedAppointments)
      } catch (err) {
        console.error('Error fetching data:', err)
      }
    }
    
    fetchData()
  }, [])

  // Handle typing in form inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handle form submission to add a new appointment
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isOnLeave) {
      alert('Doctor is on leave today. Cannot create appointment.')
      return
    }

    if (!form.patient || !form.reason || !form.date || !form.time) {
      setError('Please fill all fields')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Check if patient exists
      let patient = patients.find((p) => p.name.toLowerCase() === form.patient.toLowerCase())

      // If patient doesn't exist, create one
      if (!patient) {
        const patientRes = await createPatient({
          name: form.patient,
          age: null,
          gender: null,
          phone: null,
        })
        patient = patientRes.data
        setPatients((prev) => [...prev, patient])
      }

      // Create appointment with patient_id and combined appointment_time
      const appointmentDateTime = `${form.date}T${form.time}:00`
      
      const appointmentRes = await createAppointment({
        patient_id: patient.id,
        appointment_time: appointmentDateTime,
        status: form.status,
      })

      // Add to appointments list with display info
      const newAppointment = {
        ...appointmentRes.data,
        patient: form.patient,
        reason: form.reason,
        date: form.date,
        time: form.time,
        patientId: patient.id,
      }

      setAppointments((prev) => [...prev, newAppointment])
      setForm({ patient: '', reason: '', date: '', time: '', status: 'Scheduled' })
      
    } catch (err) {
      setError('Failed to save appointment: ' + (err.response?.data?.detail || err.message))
      console.error('Error creating appointment:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle opening patient record
  const handleOpenPatient = (patientId, patientName) => {
    navigate(`/patients/${patientId}`, { state: { patientName } })
  }

  return (
    <div className="appointments-page">
      <div className="appointments-header">
        <div>
          <h1 className="appointments-title">Appointments</h1>
          <p className="appointments-subtitle">
            View, schedule, and manage appointments easily.
          </p>
        </div>
      </div>

      <div className="appointments-grid">
        <div className="appointments-card">
          <div className="card-top">
            <h2 className="card-title">Today&apos;s Appointments</h2>
            <span className="badge">{appointments.length} total</span>
          </div>

          <div className="appointments-list">
            {appointments.map((apt) => (
              <div key={apt.id} className="appointment-row">
                <div className="row-left">
                  <div className="row-time">
                    <span className="time-text">{apt.time}</span>
                    <span className="date-text">{apt.date}</span>
                  </div>
                  <div className="row-info">
                    <span className="patient-name">{apt.patient}</span>
                    <span className="reason-text">{apt.reason}</span>
                  </div>
                </div>
                <div className="row-right">
                  <span
                    className={`status-chip ${
                      apt.status === 'In Queue' ? 'chip-blue' : 'chip-gray'
                    }`}
                  >
                    {apt.status}
                  </span>
                  <button className="small-btn" onClick={() => handleOpenPatient(apt.patientId, apt.patient)}>Open</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="right-column">
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-label">In Queue</span>
              <span className="stat-value">
                {appointments.filter((a) => a.status === 'In Queue').length}
              </span>
            </div>
            <div className="stat-box">
              <span className="stat-label">Scheduled</span>
              <span className="stat-value">
                {appointments.filter((a) => a.status === 'Scheduled').length}
              </span>
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

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <form className="appointment-form" onSubmit={handleSubmit}>
              <label className="form-label">
                Patient Name
                <input
                  type="text"
                  name="patient"
                  value={form.patient}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                />
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

              <label className="form-label">
                Status
                <select name="status" value={form.status} onChange={handleChange}>
                  <option>Scheduled</option>
                  <option>In Queue</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </label>

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Appointment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Appointments
