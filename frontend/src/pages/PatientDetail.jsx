import { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import { getPatientById, getPatientAppointments, getBillsByPatient } from "../services/api"
import "./PatientDetail.css"

function PatientDetail() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true)
        const [patientRes, appointmentsRes, billsRes] = await Promise.all([
          getPatientById(patientId),
          getPatientAppointments(patientId).catch(() => ({ data: [] })),
          getBillsByPatient(patientId).catch(() => ({ data: [] })),
        ])

        setPatient(patientRes.data)
        setAppointments(appointmentsRes.data || [])
        setBills(billsRes.data || [])
      } catch (err) {
        setError("Failed to load patient data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPatientData()
  }, [patientId])

  if (loading) {
    return (
      <div className="patient-detail-page">
        <div className="loading">Loading patient information...</div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="patient-detail-page">
        <div className="error-message">{error || "Patient not found"}</div>
        <button className="back-btn" onClick={() => navigate("/appointments")}>
          Back to Appointments
        </button>
      </div>
    )
  }

  // Calculate patient statistics
  const isFirstTimePatient = appointments.length === 0 && bills.length === 0
  const totalBilled = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0)
  const totalPaid = bills
    .filter((bill) => bill.status === "paid")
    .reduce((sum, bill) => sum + (bill.amount || 0), 0)
  const totalUnpaid = bills
    .filter((bill) => bill.status === "unpaid")
    .reduce((sum, bill) => sum + (bill.amount || 0), 0)

  // Sort appointments by date (most recent first)
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.appointment_time) - new Date(a.appointment_time)
  )

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="patient-detail-page">
      <div className="detail-header">
        <button className="back-btn" onClick={() => navigate("/appointments")}>
          ← Back to Appointments
        </button>
        <h1 className="detail-title">Patient Record</h1>
      </div>

      {/* Patient Status Alert */}
      {isFirstTimePatient && (
        <div className="first-visit-alert">
          <span className="alert-icon">ℹ️</span>
          <div className="alert-content">
            <strong>First Time Visit</strong>
            <p>This patient is visiting for the first time</p>
          </div>
        </div>
      )}

      {/* Patient Basic Info */}
      <div className="detail-grid">
        <div className="detail-card patient-info-card">
          <h2 className="card-title">Patient Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Full Name</label>
              <span className="info-value">{patient.name}</span>
            </div>
            <div className="info-item">
              <label>Age</label>
              <span className="info-value">{patient.age || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Gender</label>
              <span className="info-value">{patient.gender || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <span className="info-value">{patient.phone || "N/A"}</span>
            </div>
            <div className="info-item">
              <label>Member Since</label>
              <span className="info-value">{formatDate(patient.created_at)}</span>
            </div>
            <div className="info-item">
              <label>Patient Type</label>
              <span className={`badge ${isFirstTimePatient ? 'badge-new' : 'badge-existing'}`}>
                {isFirstTimePatient ? "New Patient" : "Returning Patient"}
              </span>
            </div>
          </div>
        </div>

        {/* Billing Summary */}
        <div className="detail-card billing-summary-card">
          <h2 className="card-title">Billing Summary</h2>
          <div className="billing-stats">
            <div className="stat">
              <label>Total Billed</label>
              <span className="amount total">₹{totalBilled.toFixed(2)}</span>
            </div>
            <div className="stat">
              <label>Total Paid</label>
              <span className="amount paid">₹{totalPaid.toFixed(2)}</span>
            </div>
            <div className="stat">
              <label>Outstanding</label>
              <span className="amount unpaid">₹{totalUnpaid.toFixed(2)}</span>
            </div>
            <div className="stat">
              <label>Number of Bills</label>
              <span className="amount">{bills.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment History */}
      <div className="detail-card">
        <div className="card-header">
          <h2 className="card-title">Appointment History</h2>
          <span className="badge">{appointments.length} visits</span>
        </div>
        {sortedAppointments.length > 0 ? (
          <div className="appointment-list">
            {sortedAppointments.map((apt, index) => (
              <div key={apt.id || index} className="appointment-item">
                <div className="apt-date">
                  <div className="apt-date-day">{new Date(apt.appointment_time).getDate()}</div>
                  <div className="apt-date-month">
                    {new Date(apt.appointment_time).toLocaleString("en-US", { month: "short" })}
                  </div>
                </div>
                <div className="apt-details">
                  <p className="apt-time">
                    {formatTime(apt.appointment_time)} •{" "}
                    <span className="apt-status">{apt.status}</span>
                  </p>
                  <p className="apt-date-full">{formatDate(apt.appointment_time)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">No appointment history</p>
        )}
      </div>

      {/* Billing History */}
      <div className="detail-card">
        <div className="card-header">
          <h2 className="card-title">Payment History</h2>
          <span className="badge">{bills.length} transactions</span>
        </div>
        {bills.length > 0 ? (
          <div className="billing-list">
            {bills.map((bill, index) => (
              <div key={bill.id || index} className="billing-item">
                <div className="billing-left">
                  <p className="billing-desc">{bill.description || "Medical Services"}</p>
                  <span className={`billing-status ${bill.status}`}>{bill.status.toUpperCase()}</span>
                </div>
                <div className="billing-right">
                  <span className="billing-amount">₹{bill.amount?.toFixed(2) || "0.00"}</span>
                  <p className="billing-date">{formatDate(bill.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message">No billing history</p>
        )}
      </div>

      {/* Patient History Summary */}
      <div className="detail-card history-summary">
        <h2 className="card-title">Patient Summary</h2>
        <div className="summary-content">
          <div className="summary-item">
            <span className="summary-label">Total Visits:</span>
            <span className="summary-value">{appointments.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">First Visit:</span>
            <span className="summary-value">
              {sortedAppointments.length > 0
                ? formatDate(sortedAppointments[sortedAppointments.length - 1].appointment_time)
                : "N/A"}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Last Visit:</span>
            <span className="summary-value">
              {sortedAppointments.length > 0 ? formatDate(sortedAppointments[0].appointment_time) : "N/A"}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Account Status:</span>
            <span className={`summary-value badge ${totalUnpaid > 0 ? 'badge-warning' : 'badge-success'}`}>
              {totalUnpaid > 0 ? "Payment Pending" : "Paid Up"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientDetail
