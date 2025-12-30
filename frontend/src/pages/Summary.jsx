import { useEffect, useState } from "react"
import { getPatients, getPatientSummary } from "../services/api"

function Summary() {
  const [patients, setPatients] = useState([])
  const [selected, setSelected] = useState("")
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const res = await getPatients()
        setPatients(res.data || [])
      } catch {
        setError("Could not load patients.")
      }
    })()
  }, [])

  const loadSummary = async (patientId) => {
    setError("")
    setLoading(true)
    try {
      const res = await getPatientSummary(patientId)
      setSummary(res.data)
    } catch {
      setError("Failed to load summary.")
      setSummary(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="patients-page">
      <div className="patients-header">
        <h1>Patient Summary</h1>
        <p>View prescriptions, bills, and appointments for a patient.</p>
      </div>
      {error && <div className="error-banner">{error}</div>}

      <div className="patients-card" style={{ marginBottom: 16 }}>
        <h2>Select Patient</h2>
        <div className="patient-form" style={{ gap: 12 }}>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">Choose patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (#{p.id})
              </option>
            ))}
          </select>
          <button
            className="primary-btn"
            onClick={() => selected && loadSummary(selected)}
            disabled={!selected || loading}
          >
            {loading ? "Loading..." : "Load Summary"}
          </button>
        </div>
      </div>

      {summary && (
        <div className="patients-grid">
          <div className="patients-card">
            <h2>Patient</h2>
            <p><strong>Name:</strong> {summary.patient?.name}</p>
            <p><strong>Phone:</strong> {summary.patient?.phone || "-"}</p>
            <p><strong>Age/Gender:</strong> {summary.patient?.age || "-"} / {summary.patient?.gender || "-"}</p>
          </div>

          <div className="patients-card">
            <h2>Appointments</h2>
            {(summary.appointments || []).map((a) => (
              <div key={a.id} className="patient-row">
                <div>
                  <strong>Appt #{a.id}</strong>
                  <div className="patient-meta">
                    {a.status} | {a.appointment_time ? new Date(a.appointment_time).toLocaleString() : "-"}
                  </div>
                </div>
              </div>
            ))}
            {(!summary.appointments || summary.appointments.length === 0) && <div className="empty">No appointments.</div>}
          </div>

          <div className="patients-card">
            <h2>Prescriptions</h2>
            {(summary.prescriptions || []).map((p) => (
              <div key={p.id} className="patient-row">
                <div>
                  <strong>{p.diagnosis}</strong>
                  <div className="patient-meta">
                    {(p.medicines || []).join(", ")}
                  </div>
                </div>
              </div>
            ))}
            {(!summary.prescriptions || summary.prescriptions.length === 0) && <div className="empty">No prescriptions.</div>}
          </div>

          <div className="patients-card">
            <h2>Bills</h2>
            {(summary.bills || []).map((b) => (
              <div key={b.id} className="patient-row">
                <div>
                  <strong>Bill #{b.id}</strong>
                  <div className="patient-meta">
                    ₹{b.amount} | {b.status}
                  </div>
                </div>
              </div>
            ))}
            {(!summary.bills || summary.bills.length === 0) && <div className="empty">No bills.</div>}
          </div>
        </div>
      )}
    </div>
  )
}

export default Summary

