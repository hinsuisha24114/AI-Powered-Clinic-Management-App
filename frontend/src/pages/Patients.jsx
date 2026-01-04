import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getPatients, createPatient } from "../services/api"
import "./Patients.css"

function Patients() {
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "",
    phone: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    // try to load from backend, fallback to localStorage
    loadPatients()
  }, [])

  const savePatientsToLocal = (list) => {
    try {
      window.localStorage.setItem("patients", JSON.stringify(list))
    } catch (e) {
      // ignore
    }
  }

  const loadPatients = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await getPatients()
      const data = Array.isArray(res.data) ? res.data : []
      // sort alphabetically
      const sorted = data.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      setPatients(sorted)
      savePatientsToLocal(sorted)
    } catch (err) {
      // fallback: try load from localStorage
      try {
        const raw = window.localStorage.getItem("patients")
        if (raw) setPatients(JSON.parse(raw))
        else setPatients([])
      } catch (e) {
        setPatients([])
      }
      setError("Failed to load patients from server; using cached list.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return

    setLoading(true)
    setError("")
    try {
      const res = await createPatient({
        name: form.name,
        age: form.age ? parseInt(form.age) : undefined,
        gender: form.gender,
        phone: form.phone,
      })
      // API should return created patient
      const created = res.data
      // merge into patients state and keep sorted
      setPatients((prev) => {
        const exists = prev.some((p) => p.id === created.id)
        const next = exists ? prev : [...prev, created]
        const sorted = next.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        savePatientsToLocal(sorted)
        return sorted
      })
      setForm({ name: "", age: "", gender: "", phone: "" })
      setSuccess("Patient saved")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      setError("Failed to save patient")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="patients-page">
      <div className="patients-header">
        <h1>Patients</h1>
        <p>Manage patient records</p>
      </div>

      <div className="patients-grid">
        {/* LEFT: PATIENT LIST */}
        <div className="patients-card">
          <h2>Patient List</h2>

          {loading && <div className="muted">Loading...</div>}
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

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
              </div>
            ))}
            {patients.length === 0 && !loading && (
              <div className="muted">No patients yet</div>
            )}
          </div>
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

            <button className="primary-btn" disabled={loading}>{loading ? 'Saving...' : 'Save Patient'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Patients
