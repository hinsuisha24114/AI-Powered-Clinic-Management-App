import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getPatients, createPatient, deletePatient } from "../services/api"
import "./Patients.css"

function Patients() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: ""
  })

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await getPatients()
      setPatients(res.data)
    } catch (err) {
      setError('Could not load patients.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) {
      setError('Name is required.')
      return
    }

    try {
      const payload = {
        name: form.name,
        phone: form.phone || undefined,
        gender: form.gender || undefined,
        age: form.age ? Number(form.age) : undefined
      }
      await createPatient(payload)
      setForm({ name: "", age: "", gender: "", phone: "" })
      loadPatients()
    } catch (err) {
      setError('Failed to save patient.')
    }
  }

  return (
    <div className="patients-page">
      <div className="patients-header">
        <h1>Patients</h1>
        <p>Manage patient records</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="patients-grid">
        {/* LEFT: PATIENT LIST */}
        <div className="patients-card">
          <h2>Patient List</h2>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : (
            <div className="patients-list">
              {patients.map((p) => (
                <div key={p.id} className="patient-row">
                  <div>
                    <strong>{p.name}</strong>
                    <div className="patient-meta">
                      Age: {p.age || "-"} | {p.gender || "-"}
                    </div>
                  </div>

                  <button
                    className="small-btn"
                    onClick={() => navigate(`/patients/${p.id}`)}
                  >
                    Open
                  </button>
                  <button
                    className="small-btn"
                    onClick={async () => {
                      try {
                        await deletePatient(p.id)
                        loadPatients()
                      } catch {
                        setError('Failed to delete patient.')
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
              {patients.length === 0 && <div className="empty">No patients yet.</div>}
            </div>
          )}
        </div>

        {/* RIGHT: CREATE PATIENT */}
        <div className="patients-card">
          <h2>Add Patient</h2>

          <form onSubmit={handleSubmit} className="patient-form">
            <input
              name="name"
              placeholder="Patient Name"
              value={form.name}
              onChange={handleChange}
            />
            <input
              name="age"
              type="number"
              placeholder="Age"
              value={form.age}
              onChange={handleChange}
            />
            <input
              name="gender"
              placeholder="Gender"
              value={form.gender}
              onChange={handleChange}
            />
            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
            />

            <button className="primary-btn">Save Patient</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Patients
